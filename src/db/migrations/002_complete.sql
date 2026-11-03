-- ============================================
-- Migration 002 - run AFTER src/db/schema.sql (safe to re-run)
-- All data access goes through the Next.js API (service role + app-level
-- permissions), so the anon/authenticated roles get no direct table access.
-- ============================================

-- 1. Remove policies from schema.sql: "Admins can view all users" queries
--    public.users from a policy on public.users (infinite recursion), and the
--    "authenticated can view" policies would expose data straight through the anon key.
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view buildings" ON public.buildings;
DROP POLICY IF EXISTS "Users can view their contracts" ON public.contracts;

-- 2. RLS on every table (no policy = no direct access; service role bypasses RLS)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['roles','users','permissions','buildings','floors','rooms','tenants','contracts',
    'maintenance_jobs','maintenance_logs','equipment','equipment_assignments','contractors','suppliers','audit_logs']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- 3. Data integrity
CREATE UNIQUE INDEX IF NOT EXISTS uq_floors_building_floor ON public.floors(building_id, floor_no);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rooms_floor_room ON public.rooms(floor_id, room_no);
-- at most one active contract per room (the API checks too; this is the race-proof guard)
CREATE UNIQUE INDEX IF NOT EXISTS uq_contracts_one_active_per_room ON public.contracts(room_id) WHERE status = 'active';
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS chk_contract_dates;
ALTER TABLE public.contracts ADD CONSTRAINT chk_contract_dates CHECK (end_date > start_date);
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS chk_contract_money;
ALTER TABLE public.contracts ADD CONSTRAINT chk_contract_money CHECK (monthly_fee >= 0 AND (deposit IS NULL OR deposit >= 0));
CREATE INDEX IF NOT EXISTS idx_contracts_status_end ON public.contracts(status, end_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_jobs_room ON public.maintenance_jobs(room_id);

-- 4. updated_at maintained by the database
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','buildings','tenants','contracts','maintenance_jobs','equipment']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

-- 5. Permission matrix (modules: buildings, tenants, contracts, maintenance, equipment, personnel, system)
--                         view create edit delete
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.module, m.v, m.c, m.e, m.d
FROM public.roles r
JOIN (VALUES
  ('admin','buildings',true,true,true,true),   ('admin','tenants',true,true,true,true),
  ('admin','contracts',true,true,true,true),   ('admin','maintenance',true,true,true,true),
  ('admin','equipment',true,true,true,true),   ('admin','personnel',true,true,true,true),
  ('admin','system',true,true,true,true),

  ('manager','buildings',true,true,true,false), ('manager','tenants',true,true,true,false),
  ('manager','contracts',true,true,true,false), ('manager','maintenance',true,true,true,true),
  ('manager','equipment',true,true,true,false), ('manager','personnel',true,true,true,false),
  ('manager','system',true,false,false,false),

  ('technician','buildings',true,false,false,false), ('technician','maintenance',true,false,true,false),
  ('technician','equipment',true,false,true,false),

  ('staff','buildings',true,false,false,false), ('staff','tenants',true,true,true,false),
  ('staff','contracts',true,false,false,false), ('staff','maintenance',true,true,false,false),
  ('staff','equipment',true,false,false,false)
) AS m(role, module, v, c, e, d) ON m.role = r.name
ON CONFLICT (role_id, module) DO NOTHING;

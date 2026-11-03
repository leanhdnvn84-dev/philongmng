-- ============================================
-- PHI LONG BUILDING - database schema (one file, safe to re-run)
-- Supabase SQL Editor -> paste -> Run
-- All data goes through the Next.js API (service role + app-level permissions),
-- so RLS is enabled with no policies: anon/authenticated keys cannot read tables directly.
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, description TEXT, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE, full_name TEXT, phone TEXT,
  role_id UUID REFERENCES public.roles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false, can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false, can_delete BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (role_id, module));

CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, address TEXT NOT NULL, city TEXT, phone TEXT, total_floors INTEGER,
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_no INTEGER NOT NULL, total_rooms INTEGER, created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (building_id, floor_no));

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  room_no TEXT NOT NULL, size NUMERIC CHECK (size IS NULL OR size >= 0), type TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (floor_id, room_no));

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, phone TEXT, email TEXT, id_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  start_date DATE NOT NULL, end_date DATE NOT NULL,
  monthly_fee NUMERIC NOT NULL CHECK (monthly_fee >= 0),
  deposit NUMERIC CHECK (deposit IS NULL OR deposit >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','terminated')),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date > start_date));
-- at most one active contract per room (race-proof; the API checks too)
CREATE UNIQUE INDEX IF NOT EXISTS uq_contracts_one_active_per_room ON public.contracts(room_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id),
  period TEXT NOT NULL CHECK (period ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  paid_amount NUMERIC NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid')),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (contract_id, period),
  CHECK (paid_amount <= amount));

CREATE TABLE IF NOT EXISTS public.maintenance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  created_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ, updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT, quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0), unit TEXT, location TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','in_use','damaged')),
  serial_number TEXT, purchase_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, phone TEXT, email TEXT, specialty TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')), created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')), created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  table_name TEXT, record_id UUID, action TEXT, changes JSONB, created_at TIMESTAMPTZ DEFAULT now());

-- indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON public.rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status_end ON public.contracts(status, end_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due ON public.invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_jobs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_room ON public.maintenance_jobs(room_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);

-- RLS on, no policies
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['roles','users','permissions','buildings','floors','rooms','tenants','contracts','invoices',
    'maintenance_jobs','equipment','contractors','suppliers','audit_logs'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP; END $$;

-- updated_at maintained by the database
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['users','buildings','tenants','contracts','invoices','maintenance_jobs','equipment'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP; END $$;

-- roles + permission matrix
-- modules: buildings, tenants, contracts, billing, maintenance, equipment, personnel, system
INSERT INTO public.roles (name, description) VALUES
  ('admin','Quản trị viên hệ thống'), ('manager','Quản lý tòa nhà'),
  ('technician','Kỹ thuật viên bảo trì'), ('staff','Nhân viên')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.module, m.v, m.c, m.e, m.d FROM public.roles r
JOIN (VALUES
  ('admin','buildings',true,true,true,true), ('admin','tenants',true,true,true,true), ('admin','contracts',true,true,true,true),
  ('admin','billing',true,true,true,true), ('admin','maintenance',true,true,true,true), ('admin','equipment',true,true,true,true),
  ('admin','personnel',true,true,true,true), ('admin','system',true,true,true,true),

  ('manager','buildings',true,true,true,false), ('manager','tenants',true,true,true,false), ('manager','contracts',true,true,true,false),
  ('manager','billing',true,true,true,false), ('manager','maintenance',true,true,true,true), ('manager','equipment',true,true,true,false),
  ('manager','personnel',true,true,true,false), ('manager','system',true,false,false,false),

  ('technician','buildings',true,false,false,false), ('technician','maintenance',true,false,true,false), ('technician','equipment',true,false,true,false),

  ('staff','buildings',true,false,false,false), ('staff','tenants',true,true,true,false), ('staff','contracts',true,false,false,false),
  ('staff','billing',true,true,true,false), ('staff','maintenance',true,true,false,false), ('staff','equipment',true,false,false,false)
) AS m(role, module, v, c, e, d) ON m.role = r.name
ON CONFLICT (role_id, module) DO NOTHING;

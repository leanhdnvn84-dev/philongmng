-- ============================================
-- PHI LONG BUILDING MANAGEMENT SYSTEM
-- Database Schema v1.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- NHÓM SYSTEM: Users & Roles
-- ============================================

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role_id UUID REFERENCES public.roles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(role_id, module)
);

-- ============================================
-- NHÓM CONTRACTS/TENANTS: Buildings & Structure
-- ============================================

CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  total_floors INTEGER,
  manager_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_no INTEGER NOT NULL,
  total_rooms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  room_no TEXT NOT NULL,
  size NUMERIC,
  type TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NHÓM CONTRACTS/TENANTS: Tenants & Contracts
-- ============================================

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  id_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_fee NUMERIC NOT NULL,
  deposit NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NHÓM MAINTENANCE
-- ============================================

CREATE TABLE public.maintenance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id),
  assigned_to UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NHÓM WAREHOUSE: Equipment & Inventory
-- ============================================

CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT,
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'damaged')),
  serial_number TEXT,
  purchase_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  returned_at TIMESTAMPTZ,
  notes TEXT
);

-- ============================================
-- NHÓM PERSONNEL: Additional info
-- ============================================

CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialty TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  table_name TEXT,
  record_id UUID,
  action TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role_id ON public.users(role_id);
CREATE INDEX idx_tenants_email ON public.tenants(email);
CREATE INDEX idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX idx_contracts_room_id ON public.contracts(room_id);
CREATE INDEX idx_rooms_floor_id ON public.rooms(floor_id);
CREATE INDEX idx_floors_building_id ON public.floors(building_id);
CREATE INDEX idx_maintenance_jobs_status ON public.maintenance_jobs(status);
CREATE INDEX idx_equipment_category ON public.equipment(category);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Admins can view all
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policy: Buildings - readable by all authenticated users
CREATE POLICY "Authenticated users can view buildings"
  ON public.buildings FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policy: Contracts - based on role
CREATE POLICY "Users can view their contracts"
  ON public.contracts FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Quản trị viên hệ thống'),
  ('manager', 'Quản lý tòa nhà'),
  ('technician', 'Kỹ thuật viên bảo trì'),
  ('staff', 'Nhân viên');

-- Insert default permissions
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'buildings', true, true, true, true FROM public.roles r WHERE r.name = 'admin'
UNION ALL
SELECT r.id, 'tenants', true, true, true, true FROM public.roles r WHERE r.name = 'admin'
UNION ALL
SELECT r.id, 'contracts', true, true, true, true FROM public.roles r WHERE r.name = 'admin'
UNION ALL
SELECT r.id, 'maintenance', true, true, true, true FROM public.roles r WHERE r.name = 'admin'
UNION ALL
SELECT r.id, 'equipment', true, true, true, true FROM public.roles r WHERE r.name = 'admin';

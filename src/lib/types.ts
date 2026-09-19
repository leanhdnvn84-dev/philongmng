// Buildings & Structure
export interface Building {
  id: string
  name: string
  address: string
  city: string
  phone: string
  total_floors: number
  created_at: string
}

export interface Floor {
  id: string
  building_id: string
  floor_no: number
  total_rooms: number
  created_at: string
}

export interface Room {
  id: string
  floor_id: string
  room_no: string
  size: number
  type: string
  status: 'available' | 'occupied' | 'maintenance'
  created_at: string
}

// Tenants & Contracts
export interface Tenant {
  id: string
  name: string
  phone: string
  email: string
  id_number: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Contract {
  id: string
  tenant_id: string
  room_id: string
  start_date: string
  end_date: string
  monthly_fee: number
  deposit: number
  status: 'active' | 'expired' | 'terminated'
  created_at: string
}

// Maintenance
export interface MaintenanceJob {
  id: string
  room_id: string
  assigned_to: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  completed_at?: string
}

// Equipment & Warehouse
export interface Equipment {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  location: string
  status: 'available' | 'in_use' | 'damaged'
  created_at: string
}

export interface EquipmentAssignment {
  id: string
  equipment_id: string
  assigned_to: string
  assigned_at: string
  returned_at?: string
}

// Users & Roles
export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'admin' | 'manager' | 'technician' | 'staff'
  status: 'active' | 'inactive'
  created_at: string
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  role_id: string
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

# Phi Long Building Management System

Modern Building Management System built with **Next.js + Supabase + TypeScript**

## Features

✅ **6 Main Modules:**
- 🏢 Buildings & Structure (Tòa nhà, Tầng, Phòng)
- 👥 Tenants & Contracts (Khách thuê, Hợp đồng)
- 🔧 Maintenance (Quản lý bảo trì)
- ⚙️ Equipment & Warehouse (Kho thiết bị)
- 👤 Personnel & Users (Nhân viên, Người dùng)
- 📊 System & Permissions (Hệ thống, Phân quyền)

✅ **Technology Stack:**
- Frontend: React 18 + Next.js 14
- Backend: Next.js API Routes
- Database: PostgreSQL (Supabase)
- Authentication: Supabase Auth
- Security: Row Level Security (RLS)
- Styling: Tailwind CSS

✅ **Key Features:**
- Role-based Access Control (RBAC)
- Row Level Security (RLS) policies
- CRUD APIs for all entities
- Responsive UI (mobile + desktop)
- Audit logging
- Search & filtering
- Data export

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### 2. Installation

```bash
# Clone repository
git clone https://github.com/leanhdnvn84-dev/phi-long-building.git
cd phi-long-building

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy content from `src/db/schema.sql`
5. Run the SQL query to create all tables

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. API Testing

```bash
# Get all buildings
curl http://localhost:3000/api/buildings

# Create new building
curl -X POST http://localhost:3000/api/buildings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phi Long Tower",
    "address": "123 Main St",
    "city": "Ho Chi Minh",
    "total_floors": 10
  }'
```

## Project Structure

```
phi-long-building/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (CRUD endpoints)
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── types.ts          # TypeScript types
│   └── db/
│       └── schema.sql        # Database schema
├── public/                   # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## API Endpoints

### Buildings
- `GET /api/buildings` - List all buildings
- `GET /api/buildings?limit=10&offset=0` - Paginated list
- `GET /api/buildings/[id]` - Get single building
- `POST /api/buildings` - Create building
- `PUT /api/buildings/[id]` - Update building
- `DELETE /api/buildings/[id]` - Delete building

### Similar endpoints for:
- `/api/tenants`
- `/api/contracts`
- `/api/maintenance`
- `/api/equipment`
- `/api/users`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Database Schema

### Main Tables:
- `buildings` - Buildings info
- `floors` - Floors in building
- `rooms` - Individual rooms/units
- `tenants` - Tenant info
- `contracts` - Rental contracts
- `maintenance_jobs` - Maintenance tasks
- `equipment` - Equipment inventory
- `users` - System users
- `roles` - User roles
- `permissions` - Role permissions
- `audit_logs` - Change tracking

## Authentication & Security

- Uses Supabase Auth for user authentication
- Row Level Security (RLS) for data access control
- Role-based permissions system
- Audit logging for all changes

## Deployment

### Deploy to Vercel (Recommended for development)
```bash
# Push to GitHub
git push origin main

# Connect to Vercel
vercel
```

### Deploy to ZoneCloud VPS
```bash
# Build
npm run build

# Create Docker image
docker build -t phi-long-building .

# Push to VPS and run
docker compose up -d
```

## Development Roadmap

**Phase 1 (Weeks 1-2):** 
- ✅ Setup Next.js + Supabase
- ✅ Database schema
- ✅ API templates

**Phase 2 (Weeks 3-4):**
- [ ] Complete API endpoints for all modules
- [ ] React components for each module
- [ ] Authentication flow
- [ ] RLS policies

**Phase 3 (Weeks 5-6):**
- [ ] Data migration from Google Sheets
- [ ] Testing
- [ ] Deployment setup
- [ ] User training materials

## Support

For issues or questions, contact: anh@leanhdnvn.com

## License

© 2025 Phi Long Building Management System

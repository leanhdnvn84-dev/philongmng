# Setup Instructions - Phi Long Building Management

Vì cloud environment không thể push trực tiếp lên GitHub, vui lòng làm theo các bước sau trên máy tính của bạn:

## Step 1: Download Project

Bạn có thể:
- A) Download file này từ ChatGPT (tôi sẽ gửi)
- B) Clone template và copy files manually

## Step 2: Setup Local Environment

```bash
# 1. Create directory
mkdir phi-long-building
cd phi-long-building

# 2. Copy all files vào folder này
# (Tôi sẽ gửi zip file)

# 3. Initialize git
git init
git config user.name "Your Name"
git config user.email "your-email@gmail.com"

# 4. Add all files
git add .

# 5. Create first commit
git commit -m "Initial commit: Phi Long Building Management System setup"

# 6. Add GitHub remote
git remote add origin https://github.com/leanhdnvn84-dev/phi-long-building.git

# 7. Rename branch to main
git branch -M main

# 8. Push to GitHub
git push -u origin main
```

## Step 3: Create GitHub Repository

Trước khi push, bạn cần:
1. Đăng nhập GitHub: https://github.com
2. Click "New" để tạo repository mới
3. Repository name: `phi-long-building`
4. Description: "Phi Long Building Management System - Next.js + Supabase"
5. Choose: **Public** (hoặc Private nếu muốn)
6. **Do NOT** initialize with README (vì đã có file)
7. Click "Create repository"

GitHub sẽ cho bạn lệnh push, hoặc copy lệnh ở Step 2 ở trên.

## Step 4: Verify Push

```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/leanhdnvn84-dev/phi-long-building.git (fetch)
# origin  https://github.com/leanhdnvn84-dev/phi-long-building.git (push)

# Check log
git log
```

## Step 5: Setup Database Schema

1. Go to Supabase Dashboard: https://app.supabase.com
2. Click your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy content từ `src/db/schema.sql`
6. Paste vào SQL Editor
7. Click **Run** (▶️)

Database sẽ tạo tất cả tables, indexes, RLS policies tự động.

## Step 6: Setup .env.local

File `.env.local` đã có credentials, nhưng:
- **NEVER commit .env.local lên GitHub** (đã có trong .gitignore)
- Nếu tại sao đó file này bị push, thay đổi Supabase keys ngay!

## Step 7: Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

Nếu thấy "✅ Connected to Supabase" → Success! 🎉

## Step 8: Ready for Deployment

Khi sẵn sàng deploy:
- Push code lên GitHub (branch `main`)
- Tôi sẽ setup CI/CD hoặc deploy lên ZoneCloud

## Troubleshooting

### Cannot push to GitHub
```bash
# Check if token is valid
git remote -v

# Try with token (if needed)
git push -u origin main
# It should ask for username/password
# Username: github_username
# Password: github_token
```

### Database setup failed
- Check Supabase project status
- Verify credentials in `.env.local`
- Check SQL error in Supabase SQL Editor

### App won't start
```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Next Steps

Sau khi push lên GitHub:
1. ✅ Code là ready
2. ⏳ Chờ tôi setup full modules + components
3. ⏳ Data migration từ Google Sheets
4. ⏳ Testing + deployment

## Questions?

Liên hệ: anh@leanhdnvn.com

---

**Status:** ✅ Initial template ready  
**Next:** Await server setup  
**Timeline:** 4 weeks from today

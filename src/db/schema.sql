-- =====================================================================
-- PHI LONG BUILDING - PostgreSQL schema (Supabase). Safe to re-run.
-- Mirrors the Google Sheets workbook of V191: same IDs (CV0001, TB0012…),
-- column names = sheet headers in lower case, so data imports 1:1.
-- All access goes through the Next.js API with the service role; RLS is on
-- with no policies and anon/authenticated have no grants.
-- =====================================================================

-- ---------- ID sequences (replaces SYS_ID_SEQUENCE + LockService) ----------
CREATE TABLE IF NOT EXISTS public.sys_id_sequence (prefix TEXT PRIMARY KEY, last_value BIGINT NOT NULL DEFAULT 0);

CREATE OR REPLACE FUNCTION public.next_id(p_prefix TEXT, p_width INT) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE n BIGINT;
BEGIN
  INSERT INTO public.sys_id_sequence(prefix, last_value) VALUES (p_prefix, 1)
  ON CONFLICT (prefix) DO UPDATE SET last_value = public.sys_id_sequence.last_value + 1
  RETURNING last_value INTO n;
  RETURN p_prefix || lpad(n::TEXT, p_width, '0');
END $$;

-- most codes are prefix + 4 digits (CV0001); visitors keep V191's K000097 (6 digits)
CREATE OR REPLACE FUNCTION public.next_id(p_prefix TEXT) RETURNS TEXT LANGUAGE sql AS
$$ SELECT public.next_id(p_prefix, 4) $$;

CREATE OR REPLACE FUNCTION public.today_vn() RETURNS DATE LANGUAGE sql STABLE AS
$$ SELECT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date $$;

-- ---------- HỆ THỐNG ----------
CREATE TABLE IF NOT EXISTS public.vai_tro (
  id TEXT PRIMARY KEY DEFAULT public.next_id('VR'),
  ten_vai_tro TEXT NOT NULL, mo_ta TEXT,
  sieu_quan_tri BOOLEAN NOT NULL DEFAULT false,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.phan_quyen (
  id TEXT PRIMARY KEY DEFAULT public.next_id('PQ'),
  id_vai_tro TEXT NOT NULL REFERENCES public.vai_tro(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  xem BOOLEAN NOT NULL DEFAULT false, them BOOLEAN NOT NULL DEFAULT false, sua BOOLEAN NOT NULL DEFAULT false,
  xoa BOOLEAN NOT NULL DEFAULT false, duyet BOOLEAN NOT NULL DEFAULT false,
  extra JSONB NOT NULL DEFAULT '{}', UNIQUE (id_vai_tro, module));

-- ---------- DANH MỤC ----------
CREATE TABLE IF NOT EXISTS public.nhan_vien (
  id TEXT PRIMARY KEY DEFAULT public.next_id('NV'),
  ho_ten TEXT NOT NULL, ten_goi_khac TEXT, phong_ban TEXT, chuc_vu TEXT, dien_thoai TEXT, email TEXT,
  doi_pccc BOOLEAN NOT NULL DEFAULT false, nhiem_vu_pccc TEXT,
  trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

-- app accounts (Supabase Auth); NGUOI_SU_DUNG
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE, ho_ten TEXT,
  id_nhan_vien TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  id_vai_tro TEXT REFERENCES public.vai_tro(id),
  trang_thai TEXT NOT NULL DEFAULT 'Hoạt động',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.nha_thau (
  id TEXT PRIMARY KEY DEFAULT public.next_id('NT'),
  ten_cong_ty TEXT NOT NULL, nguoi_lien_he TEXT, dien_thoai TEXT, email TEXT, linh_vuc TEXT,
  ma_so_thue TEXT, dia_chi TEXT, trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.nha_cung_cap (
  id TEXT PRIMARY KEY DEFAULT public.next_id('NCC'),
  ten_nha_cung_cap TEXT NOT NULL, nguoi_lien_he TEXT, dien_thoai TEXT, email TEXT,
  ma_so_thue TEXT, dia_chi TEXT, trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.khu_vuc (            -- DM_KHU_VUC_TOA_NHA
  id TEXT PRIMARY KEY DEFAULT public.next_id('KV'),
  ma_khu_vuc TEXT, tang TEXT, ten_khu_vuc TEXT NOT NULL, loai_khu_vuc TEXT,
  trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.hang_muc_bao_tri (   -- DM_HANG_MUC_BAO_TRI (ID_HANG_MUC)
  id TEXT PRIMARY KEY DEFAULT public.next_id('HM'),
  ten_hang_muc TEXT NOT NULL, nhom TEXT,
  chu_ky_mac_dinh INTEGER CHECK (chu_ky_mac_dinh IS NULL OR chu_ky_mac_dinh > 0),
  canh_bao_truoc_ngay INTEGER DEFAULT 7 CHECK (canh_bao_truoc_ngay IS NULL OR canh_bao_truoc_ngay >= 0),
  ap_dung_loai_khu_vuc TEXT, trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.chi_tiet_van_hanh (
  id TEXT PRIMARY KEY DEFAULT public.next_id('VH'),
  id_nhom TEXT, stt_nhom INTEGER, nhom_he_thong TEXT NOT NULL, hang_muc_thiet_bi TEXT NOT NULL,
  noi_dung_kiem_tra TEXT, tan_suat TEXT, chu_ky_ngay INTEGER, van_ban_theo_doi TEXT,
  trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- ---------- BẢO TRÌ ----------
CREATE TABLE IF NOT EXISTS public.lich_bao_tri (       -- DM_LICH_BAO_TRI (ID_LICH)
  id TEXT PRIMARY KEY DEFAULT public.next_id('LB'),
  id_khu_vuc TEXT NOT NULL REFERENCES public.khu_vuc(id),
  id_hang_muc TEXT NOT NULL REFERENCES public.hang_muc_bao_tri(id),
  chu_ky_ngay INTEGER CHECK (chu_ky_ngay IS NULL OR chu_ky_ngay > 0),
  canh_bao_truoc_ngay INTEGER CHECK (canh_bao_truoc_ngay IS NULL OR canh_bao_truoc_ngay >= 0),
  id_nguoi_phu_trach TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (id_khu_vuc, id_hang_muc));                   -- one schedule per area + item

CREATE TABLE IF NOT EXISTS public.nhat_ky_bao_tri (
  id TEXT PRIMARY KEY DEFAULT public.next_id('NB'),
  id_lich TEXT REFERENCES public.lich_bao_tri(id) ON DELETE SET NULL,
  id_khu_vuc TEXT NOT NULL REFERENCES public.khu_vuc(id),
  id_hang_muc TEXT NOT NULL REFERENCES public.hang_muc_bao_tri(id),
  id_thiet_bi TEXT,
  ngay_thuc_hien DATE NOT NULL,
  id_nguoi_thuc_hien TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  id_nha_thau TEXT REFERENCES public.nha_thau(id) ON DELETE SET NULL,
  noi_dung_thuc_hien TEXT, ket_qua TEXT, trang_thai TEXT DEFAULT 'Hoàn thành', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

-- ---------- CÔNG VIỆC ----------
CREATE TABLE IF NOT EXISTS public.cong_viec (
  id TEXT PRIMARY KEY DEFAULT public.next_id('CV'),
  ngay_giao DATE, noi_dung TEXT NOT NULL, khu_vuc TEXT,
  id_nguoi_giao TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  id_nguoi_thuc_hien TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  nguoi_lam_cung TEXT,
  id_nha_thau TEXT REFERENCES public.nha_thau(id) ON DELETE SET NULL,
  deadline DATE, muc_do TEXT, trang_thai TEXT DEFAULT 'Chưa thực hiện',
  tien_do TEXT, giai_doan TEXT, giai_doan_hien_tai TEXT,
  ngay_hoan_thanh DATE, ket_qua TEXT, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.cong_viec_hang_ngay ( -- CVHN_2026
  id TEXT PRIMARY KEY DEFAULT public.next_id('HN'),
  ngay DATE, noi_dung TEXT NOT NULL, cach_thuc_hien TEXT,
  id_nguoi_giao TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  id_nguoi_thuc_hien TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  nguoi_lam_cung TEXT,
  id_nha_thau TEXT REFERENCES public.nha_thau(id) ON DELETE SET NULL,
  trang_thai TEXT DEFAULT 'Chưa thực hiện', tien_do TEXT, giai_doan TEXT, giai_doan_hien_tai TEXT,
  ngay_hoan_thanh DATE, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.khach_ra_vao (
  id TEXT PRIMARY KEY DEFAULT public.next_id('K', 6),
  ngay DATE, gio_vao TEXT, ngay_hen DATE, gio_hen TEXT,
  ho_ten TEXT NOT NULL, sdt TEXT, giay_to TEXT, nguoi_di_cung TEXT, dia_chi TEXT, cong_ty TEXT,
  nguoi_can_gap TEXT, phong_ban TEXT, tang TEXT, cong_ty_lien_he TEXT, noi_dung TEXT, muc_dich TEXT,
  bien_so_xe TEXT, nguoi_dang_ky TEXT, gio_ra TEXT, nguoi_checkout TEXT,
  trang_thai TEXT DEFAULT 'Đang trong tòa nhà', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

-- ---------- KHO & THIẾT BỊ ----------
CREATE TABLE IF NOT EXISTS public.vat_tu (
  id TEXT PRIMARY KEY DEFAULT public.next_id('VT'),
  ten_vat_tu TEXT NOT NULL, nhom TEXT, dvt TEXT, thong_so TEXT,
  ton_dau NUMERIC NOT NULL DEFAULT 0, ton_toi_thieu NUMERIC DEFAULT 0, vi_tri TEXT,
  trang_thai TEXT DEFAULT 'Hoạt động', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- append-only stock ledger; corrections are new rows
CREATE TABLE IF NOT EXISTS public.nhap_xuat_kho (
  id TEXT PRIMARY KEY DEFAULT public.next_id('NX'),
  ngay DATE NOT NULL DEFAULT public.today_vn(),
  id_vat_tu TEXT NOT NULL REFERENCES public.vat_tu(id),
  loai_giao_dich TEXT NOT NULL CHECK (loai_giao_dich IN ('NHAP','XUAT')),
  so_luong NUMERIC NOT NULL CHECK (so_luong > 0),
  nguon_giao_dich TEXT, id_chung_tu TEXT,
  id_nguoi_thuc_hien TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  noi_dung TEXT, ghi_chu TEXT, nguoi_tao TEXT,
  don_gia NUMERIC NOT NULL DEFAULT 0,
  thanh_tien NUMERIC GENERATED ALWAYS AS (so_luong * don_gia) STORED,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE public.nhap_xuat_kho ADD COLUMN IF NOT EXISTS don_gia NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.nhap_xuat_kho ADD COLUMN IF NOT EXISTS thanh_tien NUMERIC GENERATED ALWAYS AS (so_luong * don_gia) STORED;

CREATE TABLE IF NOT EXISTS public.thiet_bi (
  id TEXT PRIMARY KEY DEFAULT public.next_id('TB'),
  ten_thiet_bi TEXT NOT NULL, loai_thiet_bi TEXT, nhom TEXT, hang TEXT, model TEXT, serial TEXT, thong_so TEXT,
  ngay_mua DATE, han_bao_hanh DATE, ngay_nhap_kho DATE,
  id_khu_vuc TEXT REFERENCES public.khu_vuc(id) ON DELETE SET NULL,
  id_nguoi_su_dung TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  id_nguoi_quan_ly TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  phong_ban TEXT, muc_dich_su_dung TEXT, tinh_trang TEXT,
  trang_thai TEXT DEFAULT 'Trong kho', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.thu_hoi (
  id TEXT PRIMARY KEY DEFAULT public.next_id('TH'),
  id_thiet_bi TEXT NOT NULL REFERENCES public.thiet_bi(id),
  ngay_thu_hoi DATE NOT NULL DEFAULT public.today_vn(),
  id_nguoi_tra TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  id_nguoi_nhan_thu_hoi TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  tinh_trang_khi_tra TEXT, trang_thai_sau_thu_hoi TEXT,
  id_khu_vuc_sau_thu_hoi TEXT REFERENCES public.khu_vuc(id) ON DELETE SET NULL,
  huong_xu_ly TEXT, so_bien_ban TEXT, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.lich_su_chuyen_thiet_bi (
  id TEXT PRIMARY KEY DEFAULT public.next_id('CTB'),
  ngay_chuyen DATE NOT NULL DEFAULT public.today_vn(),
  id_thiet_bi TEXT NOT NULL REFERENCES public.thiet_bi(id) ON DELETE CASCADE,
  ten_thiet_bi TEXT, tu_khu_vuc TEXT, den_khu_vuc TEXT, tu_nguoi_dung TEXT, den_nguoi_dung TEXT,
  id_nguoi_thuc_hien TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  ly_do TEXT, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- ---------- ĐỀ XUẤT ----------
CREATE TABLE IF NOT EXISTS public.de_xuat (
  id TEXT PRIMARY KEY DEFAULT public.next_id('DX'),
  loai_de_xuat TEXT NOT NULL,          -- MUA_VAT_TU | MUA_THIET_BI | BAO_TRI | THANH_LY
  ngay_de_xuat DATE DEFAULT public.today_vn(),
  id_nguoi_de_xuat TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL,
  noi_dung TEXT, muc_dich_ly_do TEXT, trang_thai TEXT DEFAULT 'Chờ duyệt',
  nguoi_duyet TEXT, ngay_duyet DATE, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

-- lines of all 4 proposal kinds (DE_XUAT_MUA_VAT_TU, DE_XUAT_MUA, DE_XUAT_BAO_TRI, DE_XUAT_THANH_LY)
CREATE TABLE IF NOT EXISTS public.de_xuat_chi_tiet (
  id TEXT PRIMARY KEY DEFAULT public.next_id('DXCT'),
  id_de_xuat TEXT NOT NULL REFERENCES public.de_xuat(id) ON DELETE CASCADE,
  id_vat_tu TEXT REFERENCES public.vat_tu(id),
  id_thiet_bi TEXT REFERENCES public.thiet_bi(id),
  ten TEXT, dvt TEXT,
  so_luong NUMERIC NOT NULL DEFAULT 1 CHECK (so_luong > 0),
  don_gia NUMERIC NOT NULL DEFAULT 0 CHECK (don_gia >= 0),
  thanh_tien NUMERIC GENERATED ALWAYS AS (so_luong * don_gia) STORED,
  nha_cung_cap TEXT, muc_dich_ly_do TEXT, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

-- ---------- CHO THUÊ ----------
CREATE TABLE IF NOT EXISTS public.toa_nha (            -- QUAN_LY_TOA_NHA
  id TEXT PRIMARY KEY DEFAULT public.next_id('TN'),
  ten_toa_nha TEXT NOT NULL, dia_chi_toa_nha TEXT, hinh_anh_toa_nha TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.tang (               -- QUAN_LY_TANG
  id TEXT PRIMARY KEY DEFAULT public.next_id('TANG'),
  id_toa_nha TEXT REFERENCES public.toa_nha(id) ON DELETE SET NULL,
  ten_tang TEXT NOT NULL, ma_tang_khu_vuc TEXT, dien_tich NUMERIC CHECK (dien_tich IS NULL OR dien_tich >= 0),
  trang_thai_su_dung TEXT DEFAULT 'Trống', bao_gia TEXT, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.khach_thue (
  id TEXT PRIMARY KEY DEFAULT public.next_id('KT'),
  ten_khach_thue TEXT NOT NULL, nguoi_lien_he TEXT, dien_thoai TEXT, email TEXT, dia_chi TEXT, ma_so_thue TEXT,
  id_tang TEXT REFERENCES public.tang(id) ON DELETE SET NULL,
  dien_tich NUMERIC, ngay_bat_dau DATE, ngay_ket_thuc DATE,
  trang_thai TEXT DEFAULT 'Đang thuê', ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.khach_hang_tiem_nang (
  id TEXT PRIMARY KEY DEFAULT public.next_id('KHTN'),
  ten_khach_hang TEXT NOT NULL, nguoi_lien_he TEXT, dien_thoai TEXT, email TEXT,
  id_khu_vuc_quan_tam TEXT REFERENCES public.tang(id) ON DELETE SET NULL,
  dien_tich_quan_tam NUMERIC, ngay_tiep_nhan DATE DEFAULT public.today_vn(), ngay_hen_lien_he DATE,
  nguon_khach_hang TEXT, trang_thai TEXT DEFAULT 'Mới', muc_do_tiem_nang TEXT,
  id_nguoi_phu_trach TEXT REFERENCES public.nhan_vien(id) ON DELETE SET NULL, ghi_chu TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS public.tien_dien (
  id TEXT PRIMARY KEY DEFAULT public.next_id('TD'),
  ky TEXT NOT NULL CHECK (ky ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  ngay_chot DATE,
  id_khach_thue TEXT REFERENCES public.khach_thue(id) ON DELETE SET NULL,
  ten_khach_thue TEXT, id_tang TEXT REFERENCES public.tang(id) ON DELETE SET NULL, tang TEXT,
  ma_cong_to TEXT NOT NULL, ten_cong_to TEXT, nhom_hoa_don TEXT,
  chi_so_cu NUMERIC, chi_so_moi NUMERIC,
  so_kwh NUMERIC GENERATED ALWAYS AS (round(chi_so_moi - chi_so_cu, 3)) STORED,
  don_gia NUMERIC,
  thanh_tien NUMERIC GENERATED ALWAYS AS (round((chi_so_moi - chi_so_cu) * don_gia)) STORED,
  vat NUMERIC, chu_ky_thang INTEGER DEFAULT 1,
  trang_thai TEXT DEFAULT 'Nháp', ghi_chu TEXT, nguon TEXT, nguoi_cap_nhat TEXT,
  extra JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (chi_so_moi IS NULL OR chi_so_cu IS NULL OR chi_so_moi >= chi_so_cu));
-- a meter can be read more than once in a period (V191 data: May 2025 read on 12/5 and 23/5)
ALTER TABLE public.tien_dien DROP CONSTRAINT IF EXISTS tien_dien_ky_ma_cong_to_key;
CREATE INDEX IF NOT EXISTS ix_td_ky_cong_to ON public.tien_dien(ky, ma_cong_to);

-- columns added after the first release (CREATE TABLE IF NOT EXISTS does not add them to existing DBs)
ALTER TABLE public.cong_viec ADD COLUMN IF NOT EXISTS cach_thuc_hien TEXT;
ALTER TABLE public.cong_viec ADD COLUMN IF NOT EXISTS don_vi_thuc_hien TEXT;
ALTER TABLE public.cong_viec_hang_ngay ADD COLUMN IF NOT EXISTS don_vi_thuc_hien TEXT;
ALTER TABLE public.nhat_ky_bao_tri ADD COLUMN IF NOT EXISTS don_vi_thuc_hien TEXT;

-- ---------- AUDIT ----------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, user_email TEXT, table_name TEXT, record_id TEXT, action TEXT, changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now());

-- ---------- indexes ----------
CREATE INDEX IF NOT EXISTS ix_nkbt_pair ON public.nhat_ky_bao_tri(id_khu_vuc, id_hang_muc, ngay_thuc_hien DESC);
CREATE INDEX IF NOT EXISTS ix_nkbt_ngay ON public.nhat_ky_bao_tri(ngay_thuc_hien DESC);
CREATE INDEX IF NOT EXISTS ix_cv_trang_thai ON public.cong_viec(trang_thai, deadline);
CREATE INDEX IF NOT EXISTS ix_hn_ngay ON public.cong_viec_hang_ngay(ngay DESC);
CREATE INDEX IF NOT EXISTS ix_krv_ngay ON public.khach_ra_vao(ngay DESC);
CREATE INDEX IF NOT EXISTS ix_nxk_vat_tu ON public.nhap_xuat_kho(id_vat_tu);
CREATE INDEX IF NOT EXISTS ix_tb_trang_thai ON public.thiet_bi(trang_thai);
CREATE INDEX IF NOT EXISTS ix_th_thiet_bi ON public.thu_hoi(id_thiet_bi);
CREATE INDEX IF NOT EXISTS ix_ctb_thiet_bi ON public.lich_su_chuyen_thiet_bi(id_thiet_bi);
CREATE INDEX IF NOT EXISTS ix_dxct_de_xuat ON public.de_xuat_chi_tiet(id_de_xuat);
CREATE INDEX IF NOT EXISTS ix_dx_loai ON public.de_xuat(loai_de_xuat, trang_thai);
CREATE INDEX IF NOT EXISTS ix_td_ky ON public.tien_dien(ky);
CREATE INDEX IF NOT EXISTS ix_audit_created ON public.audit_logs(created_at DESC);

-- ---------- computed views (alerts are computed live, never stored) ----------
-- security_invoker: views obey the caller's RLS, so anon/authenticated still see nothing.
-- views use t.* so they are dropped and recreated when tables gain columns
DROP VIEW IF EXISTS public.v_lich_bao_tri, public.v_cong_viec, public.v_vat_tu, public.v_khach_thue, public.v_de_xuat;
CREATE OR REPLACE VIEW public.v_lich_bao_tri WITH (security_invoker = true) AS
WITH base AS (
  SELECT l.*, kv.tang, kv.ten_khu_vuc, hm.ten_hang_muc, hm.nhom,
    COALESCE(l.chu_ky_ngay, hm.chu_ky_mac_dinh) AS chu_ky,
    COALESCE(l.canh_bao_truoc_ngay, hm.canh_bao_truoc_ngay, 7) AS canh_bao_truoc,
    (SELECT max(n.ngay_thuc_hien) FROM public.nhat_ky_bao_tri n
      WHERE n.id_khu_vuc = l.id_khu_vuc AND n.id_hang_muc = l.id_hang_muc) AS ngay_goc_gan_nhat
  FROM public.lich_bao_tri l
  LEFT JOIN public.khu_vuc kv ON kv.id = l.id_khu_vuc
  LEFT JOIN public.hang_muc_bao_tri hm ON hm.id = l.id_hang_muc
), calc AS (
  SELECT b.*, (b.ngay_goc_gan_nhat + b.chu_ky) AS ngay_ke_tiep,
    (b.ngay_goc_gan_nhat + b.chu_ky) - public.today_vn() AS so_ngay_con_lai
  FROM base b
)
SELECT c.*, CASE
  WHEN lower(coalesce(c.trang_thai,'')) LIKE '%ngưng%' THEN 'TẠM NGƯNG'
  WHEN c.ngay_goc_gan_nhat IS NULL THEN 'CHỜ NGÀY GỐC'
  WHEN c.chu_ky IS NULL THEN 'THIẾU CHU KỲ'
  WHEN c.so_ngay_con_lai < 0 THEN 'TRỄ LỊCH'
  WHEN c.so_ngay_con_lai = 0 THEN 'ĐẾN HẠN HÔM NAY'
  WHEN c.so_ngay_con_lai <= c.canh_bao_truoc THEN 'SẮP ĐẾN HẠN'
  ELSE 'CÒN LỊCH' END AS canh_bao
FROM calc c;

CREATE OR REPLACE FUNCTION public.cv_is_done(st TEXT, kq TEXT) RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
  SELECT (lower(coalesce(st,'')) LIKE '%hoàn thành%' AND lower(coalesce(st,'')) NOT LIKE '%chưa%')
      OR lower(coalesce(st,'')) IN ('xong','đã xong','da xong','hoan thanh')
      OR lower(coalesce(kq,'')) IN ('đã xong','da xong','hoàn thành') $$;

CREATE OR REPLACE VIEW public.v_cong_viec WITH (security_invoker = true) AS
SELECT w.*, (w.deadline - public.today_vn()) AS so_ngay_con_lai, CASE
  WHEN public.cv_is_done(w.trang_thai, w.ket_qua) THEN 'HOÀN THÀNH'
  WHEN w.deadline IS NOT NULL AND w.deadline < public.today_vn() THEN 'QUÁ HẠN'
  WHEN w.deadline = public.today_vn() THEN 'ĐẾN HẠN HÔM NAY'
  WHEN coalesce(trim(w.trang_thai),'') = '' OR lower(w.trang_thai) IN ('chưa thực hiện','tạm hoãn')
    THEN CASE WHEN w.deadline - public.today_vn() <= 7 THEN 'CẦN LÀM NGAY' ELSE 'CHƯA BẮT ĐẦU' END
  WHEN w.deadline - public.today_vn() <= 3 THEN 'SẮP ĐẾN HẠN'
  ELSE 'ĐANG LÀM' END AS canh_bao
FROM public.cong_viec w;

-- sort key so the list opens with what needs attention (overdue → due today → soon → … → done)
CREATE OR REPLACE VIEW public.v_cong_viec WITH (security_invoker = true) AS
SELECT x.*, CASE x.canh_bao WHEN 'QUÁ HẠN' THEN 0 WHEN 'ĐẾN HẠN HÔM NAY' THEN 1 WHEN 'SẮP ĐẾN HẠN' THEN 2
  WHEN 'CẦN LÀM NGAY' THEN 3 WHEN 'ĐANG LÀM' THEN 4 WHEN 'CHƯA BẮT ĐẦU' THEN 5 ELSE 6 END AS thu_tu_canh_bao
FROM (SELECT w.*, (w.deadline - public.today_vn()) AS so_ngay_con_lai, CASE
  WHEN public.cv_is_done(w.trang_thai, w.ket_qua) THEN 'HOÀN THÀNH'
  WHEN w.deadline IS NOT NULL AND w.deadline < public.today_vn() THEN 'QUÁ HẠN'
  WHEN w.deadline = public.today_vn() THEN 'ĐẾN HẠN HÔM NAY'
  WHEN coalesce(trim(w.trang_thai),'') = '' OR lower(w.trang_thai) IN ('chưa thực hiện','tạm hoãn')
    THEN CASE WHEN w.deadline - public.today_vn() <= 7 THEN 'CẦN LÀM NGAY' ELSE 'CHƯA BẮT ĐẦU' END
  WHEN w.deadline - public.today_vn() <= 3 THEN 'SẮP ĐẾN HẠN'
  ELSE 'ĐANG LÀM' END AS canh_bao
FROM public.cong_viec w) x;

CREATE OR REPLACE VIEW public.v_vat_tu WITH (security_invoker = true) AS
SELECT v.*, coalesce(s.tong_nhap,0) AS tong_nhap, coalesce(s.tong_xuat,0) AS tong_xuat,
  v.ton_dau + coalesce(s.tong_nhap,0) - coalesce(s.tong_xuat,0) AS ton_hien_tai,
  CASE WHEN v.ton_toi_thieu > 0 AND v.ton_dau + coalesce(s.tong_nhap,0) - coalesce(s.tong_xuat,0) < v.ton_toi_thieu
    THEN 'DƯỚI TỒN TỐI THIỂU' ELSE '' END AS canh_bao
FROM public.vat_tu v
LEFT JOIN (SELECT id_vat_tu,
    sum(so_luong) FILTER (WHERE loai_giao_dich = 'NHAP') AS tong_nhap,
    sum(so_luong) FILTER (WHERE loai_giao_dich = 'XUAT') AS tong_xuat
  FROM public.nhap_xuat_kho GROUP BY id_vat_tu) s ON s.id_vat_tu = v.id;

CREATE OR REPLACE VIEW public.v_khach_thue WITH (security_invoker = true) AS
SELECT k.*, (k.ngay_ket_thuc - public.today_vn()) AS so_ngay_con_lai, CASE
  WHEN k.ngay_ket_thuc IS NULL THEN ''
  WHEN k.ngay_ket_thuc < public.today_vn() THEN 'ĐÃ HẾT HẠN'
  WHEN k.ngay_ket_thuc - public.today_vn() <= 60 THEN 'SẮP HẾT HẠN'
  ELSE '' END AS canh_bao
FROM public.khach_thue k;

-- 1,234,567 / 2.5 — number format used by V191 tables
CREATE OR REPLACE FUNCTION public.fmt_num(n NUMERIC) RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN n IS NULL THEN '—' WHEN n = trunc(n) THEN to_char(n, 'FM999,999,999,990')
              ELSE rtrim(to_char(n, 'FM999,999,999,990.999'), '0') END $$;

-- proposal + its lines flattened (one text line per item), as the V191 list shows them
CREATE OR REPLACE VIEW public.v_de_xuat WITH (security_invoker = true) AS
SELECT d.*, coalesce(t.so_dong,0) AS so_dong, coalesce(t.tong_tien,0) AS tong_tien,
  t.ds_ten, t.ds_nha_cung_cap, t.ds_don_gia, t.ds_so_luong, t.ds_dvt, t.ds_thanh_tien
FROM public.de_xuat d
LEFT JOIN (
  SELECT c.id_de_xuat, count(*) AS so_dong, sum(c.thanh_tien) AS tong_tien,
    string_agg(coalesce(v.ten_vat_tu, tb.ten_thiet_bi, nullif(c.ten, ''), '—'), E'\n' ORDER BY c.created_at, c.id) AS ds_ten,
    string_agg(coalesce(nullif(c.nha_cung_cap, ''), '—'), E'\n' ORDER BY c.created_at, c.id) AS ds_nha_cung_cap,
    string_agg(public.fmt_num(c.don_gia), E'\n' ORDER BY c.created_at, c.id) AS ds_don_gia,
    string_agg(public.fmt_num(c.so_luong), E'\n' ORDER BY c.created_at, c.id) AS ds_so_luong,
    string_agg(coalesce(nullif(c.dvt, ''), v.dvt, '—'), E'\n' ORDER BY c.created_at, c.id) AS ds_dvt,
    string_agg(public.fmt_num(c.thanh_tien), E'\n' ORDER BY c.created_at, c.id) AS ds_thanh_tien
  FROM public.de_xuat_chi_tiet c
  LEFT JOIN public.vat_tu v ON v.id = c.id_vat_tu
  LEFT JOIN public.thiet_bi tb ON tb.id = c.id_thiet_bi
  GROUP BY c.id_de_xuat) t ON t.id_de_xuat = d.id;

-- ---------- atomic business operations ----------
-- stock movement with a per-item lock: XUAT never drives stock below zero, even under concurrency
DROP FUNCTION IF EXISTS public.kho_giao_dich(TEXT, TEXT, NUMERIC, DATE, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.kho_giao_dich(p_vat_tu TEXT, p_loai TEXT, p_so_luong NUMERIC, p_ngay DATE,
  p_noi_dung TEXT, p_nguon TEXT, p_chung_tu TEXT, p_nguoi_tao TEXT, p_don_gia NUMERIC DEFAULT 0, p_ghi_chu TEXT DEFAULT NULL) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE ton NUMERIC; new_id TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('kho:' || p_vat_tu));
  IF p_loai NOT IN ('NHAP','XUAT') THEN RAISE EXCEPTION 'LOAI_GIAO_DICH_KHONG_HOP_LE'; END IF;
  IF p_so_luong IS NULL OR p_so_luong <= 0 THEN RAISE EXCEPTION 'SO_LUONG_KHONG_HOP_LE'; END IF;
  SELECT ton_hien_tai INTO ton FROM public.v_vat_tu WHERE id = p_vat_tu;
  IF NOT FOUND THEN RAISE EXCEPTION 'VAT_TU_KHONG_TON_TAI'; END IF;
  IF p_loai = 'XUAT' AND ton < p_so_luong THEN RAISE EXCEPTION 'TON_KHO_KHONG_DU:%', ton; END IF;
  INSERT INTO public.nhap_xuat_kho (ngay, id_vat_tu, loai_giao_dich, so_luong, noi_dung, nguon_giao_dich, id_chung_tu, nguoi_tao, don_gia, ghi_chu)
  VALUES (coalesce(p_ngay, public.today_vn()), p_vat_tu, p_loai, p_so_luong, p_noi_dung, p_nguon, p_chung_tu, p_nguoi_tao, greatest(coalesce(p_don_gia, 0), 0), p_ghi_chu)
  RETURNING id INTO new_id;
  RETURN new_id;
END $$;

-- append one progress line without losing concurrent appends (Ghi nhận tiến độ)
CREATE OR REPLACE FUNCTION public.ghi_tien_do(p_bang TEXT, p_id TEXT, p_dong TEXT, p_giai_doan TEXT, p_dong_giai_doan TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_bang NOT IN ('cong_viec','cong_viec_hang_ngay') THEN RAISE EXCEPTION 'BANG_KHONG_HOP_LE'; END IF;
  EXECUTE format($q$UPDATE public.%I SET
      tien_do = CASE WHEN coalesce(tien_do,'') = '' THEN $1 ELSE rtrim(tien_do) || E'\n' || $1 END,
      giai_doan = CASE WHEN $3 IS NULL THEN giai_doan WHEN coalesce(giai_doan,'') = '' THEN $3 ELSE rtrim(giai_doan) || E'\n' || $3 END,
      giai_doan_hien_tai = coalesce($2, giai_doan_hien_tai)
    WHERE id = $4$q$, p_bang) USING p_dong, p_giai_doan, p_dong_giai_doan, p_id;
END $$;

-- used by scripts/import-sheets.mjs
CREATE OR REPLACE FUNCTION public.import_table_columns(p_table TEXT)
RETURNS TABLE (column_name TEXT, data_type TEXT, is_generated BOOLEAN, fk_table TEXT) LANGUAGE sql STABLE AS $$
  -- FK targets come from pg_catalog: information_schema hides constraints from non-owner roles (service_role)
  SELECT c.column_name::TEXT, c.data_type::TEXT, (c.is_generated = 'ALWAYS'),
    (SELECT cf.relname::TEXT FROM pg_catalog.pg_constraint k
       JOIN pg_catalog.pg_class cf ON cf.oid = k.confrelid
       JOIN pg_catalog.pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = k.conkey[1]
      WHERE k.contype = 'f' AND k.conrelid = to_regclass('public.' || p_table)
        AND array_length(k.conkey, 1) = 1 AND a.attname = c.column_name LIMIT 1)
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = p_table $$;

-- after importing old IDs, move each sequence past the highest existing number
CREATE OR REPLACE FUNCTION public.sync_id_sequences() RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r RECORD; mx BIGINT;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('vai_tro','VR'),('phan_quyen','PQ'),('nhan_vien','NV'),('nha_thau','NT'),('nha_cung_cap','NCC'),('khu_vuc','KV'),
    ('hang_muc_bao_tri','HM'),('chi_tiet_van_hanh','VH'),('lich_bao_tri','LB'),('nhat_ky_bao_tri','NB'),('cong_viec','CV'),
    ('cong_viec_hang_ngay','HN'),('khach_ra_vao','K'),('vat_tu','VT'),('nhap_xuat_kho','NX'),('thiet_bi','TB'),
    ('thu_hoi','TH'),('lich_su_chuyen_thiet_bi','CTB'),('de_xuat','DX'),('de_xuat_chi_tiet','DXCT'),('toa_nha','TN'),
    ('tang','TANG'),('khach_thue','KT'),('khach_hang_tiem_nang','KHTN'),('tien_dien','TD')) AS t(tbl, prefix)
  LOOP
    EXECUTE format('SELECT max((substring(id FROM %L))::BIGINT) FROM public.%I WHERE id ~ %L',
      '^' || r.prefix || '(\d+)$', r.tbl, '^' || r.prefix || '\d+$') INTO mx;
    INSERT INTO public.sys_id_sequence(prefix, last_value) VALUES (r.prefix, coalesce(mx,0))
    ON CONFLICT (prefix) DO UPDATE SET last_value = GREATEST(public.sys_id_sequence.last_value, EXCLUDED.last_value);
  END LOOP;
END $$;

-- ---------- updated_at ----------
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS
$$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['nhan_vien','users','nhat_ky_bao_tri','cong_viec','cong_viec_hang_ngay','khach_ra_vao',
    'thiet_bi','de_xuat','khach_thue','tien_dien'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP; END $$;

-- ---------- lock down: only the service role (server) touches data ----------
DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
  END LOOP;
  FOR t IN SELECT viewname FROM pg_views WHERE schemaname = 'public' LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ---------- seed: roles + permissions (same module codes as V191) ----------
INSERT INTO public.vai_tro (id, ten_vai_tro, mo_ta, sieu_quan_tri) VALUES
  ('VR0001','Quản lý','Quản lý tòa nhà', false),
  ('VR0002','Kỹ thuật','Kỹ thuật viên', false),
  ('VR0003','Nhân viên','Nhân viên văn phòng / lễ tân', false),
  ('VR0004','Super Admin','Toàn quyền hệ thống', true)
ON CONFLICT (id) DO NOTHING;

-- default matrix only for a brand-new database (never mixes into imported/edited permissions)
INSERT INTO public.phan_quyen (id_vai_tro, module, xem, them, sua, xoa, duyet)
SELECT * FROM (
SELECT r, m, true, true, true, r = 'VR0001', r = 'VR0001'
FROM unnest(ARRAY['VR0001']) r, unnest(ARRAY['CONG_VIEC','CVHN','KHACH_RA_VAO','BAO_TRI','DE_XUAT','THIET_BI','KHO','THU_HOI',
  'KHACH_THUE','QUAN_LY_TANG','KHACH_HANG_TIEM_NANG','TIEN_DIEN','DANH_MUC','BAO_CAO']) m
UNION ALL
SELECT 'VR0002', m, true, m <> 'BAO_CAO', m <> 'BAO_CAO', false, false
FROM unnest(ARRAY['CONG_VIEC','CVHN','BAO_TRI','THIET_BI','KHO','BAO_CAO']) m
UNION ALL
SELECT 'VR0003', m, true, m IN ('KHACH_RA_VAO','CVHN','DE_XUAT'), m IN ('KHACH_RA_VAO','CVHN'), false, false
FROM unnest(ARRAY['CONG_VIEC','CVHN','KHACH_RA_VAO','DE_XUAT','KHACH_THUE']) m
) AS seed(r, m, xem, them, sua, xoa, duyet)
WHERE NOT EXISTS (SELECT 1 FROM public.phan_quyen)
ON CONFLICT (id_vai_tro, module) DO NOTHING;

SELECT public.sync_id_sequences();

-- login by username OR email; V191 password hashes carried over (verified once, then moved to Supabase Auth)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ten_dang_nhap TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_ten_dang_nhap_uq ON public.users (lower(ten_dang_nhap)) WHERE ten_dang_nhap IS NOT NULL;
CREATE TABLE IF NOT EXISTS public.legacy_auth (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salt TEXT NOT NULL, iter INT NOT NULL DEFAULT 100000, hash TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE public.legacy_auth ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.legacy_auth FROM anon, authenticated;

-- internal chat (V191 CHATNOIBO): direct + whole-team messages, per-user read cursors
CREATE TABLE IF NOT EXISTS public.tin_nhan (
  id TEXT PRIMARY KEY DEFAULT public.next_id('MSG', 6),
  thoi_gian TIMESTAMPTZ NOT NULL DEFAULT now(),
  id_nguoi_gui TEXT NOT NULL,
  id_nguoi_nhan TEXT NOT NULL,
  noi_dung TEXT NOT NULL CHECK (length(noi_dung) BETWEEN 1 AND 2000),
  extra JSONB NOT NULL DEFAULT '{}');
CREATE INDEX IF NOT EXISTS tin_nhan_nhan_tg ON public.tin_nhan (id_nguoi_nhan, thoi_gian DESC);
CREATE INDEX IF NOT EXISTS tin_nhan_gui_tg ON public.tin_nhan (id_nguoi_gui, thoi_gian DESC);
CREATE TABLE IF NOT EXISTS public.chat_doc (
  user_key TEXT NOT NULL, conv TEXT NOT NULL, doc_den TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_key, conv));
ALTER TABLE public.tin_nhan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_doc ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tin_nhan, public.chat_doc FROM anon, authenticated;

-- devices: quantity + handover info (V191 THIET_BI)
ALTER TABLE public.thiet_bi ADD COLUMN IF NOT EXISTS so_luong INT NOT NULL DEFAULT 1;
ALTER TABLE public.thiet_bi ADD COLUMN IF NOT EXISTS ngay_ban_giao DATE;
ALTER TABLE public.thiet_bi ADD COLUMN IF NOT EXISTS ngay_du_kien_thu_hoi DATE;
ALTER TABLE public.thiet_bi ADD COLUMN IF NOT EXISTS so_bien_ban TEXT;
ALTER TABLE public.thiet_bi ADD COLUMN IF NOT EXISTS link_bien_ban TEXT;

-- ───────── system tables re-added from V191 (logs, alert e-mail, categories, progress photos) ─────────
CREATE TABLE IF NOT EXISTS public.lich_su_in (
  id TEXT PRIMARY KEY DEFAULT public.next_id('IN', 5),
  thoi_gian TIMESTAMPTZ NOT NULL DEFAULT now(),
  id_de_xuat TEXT, loai_de_xuat TEXT, nguoi_in TEXT, lan_in INT NOT NULL DEFAULT 1,
  extra JSONB NOT NULL DEFAULT '{}');
CREATE INDEX IF NOT EXISTS lich_su_in_dx ON public.lich_su_in (id_de_xuat, thoi_gian DESC);

CREATE TABLE IF NOT EXISTS public.lich_su_dang_nhap (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  id_nguoi_dung TEXT, email TEXT, thoi_gian TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_cong_cong TEXT, vi_tri_gan_dung TEXT, ten_thiet_bi TEXT, ma_thiet_bi TEXT,
  trinh_duyet TEXT, he_dieu_hanh TEXT, nguon_thong_tin TEXT, extra JSONB NOT NULL DEFAULT '{}');
CREATE INDEX IF NOT EXISTS lich_su_dang_nhap_tg ON public.lich_su_dang_nhap (thoi_gian DESC);

CREATE TABLE IF NOT EXISTS public.danh_muc (
  id TEXT PRIMARY KEY DEFAULT public.next_id('DM', 4),
  loai TEXT NOT NULL, gia_tri TEXT NOT NULL, thu_tu INT NOT NULL DEFAULT 0,
  extra JSONB NOT NULL DEFAULT '{}', UNIQUE (loai, gia_tri));

CREATE TABLE IF NOT EXISTS public.cau_hinh_email_canh_bao (
  id TEXT PRIMARY KEY DEFAULT public.next_id('CB', 3),
  ma_canh_bao TEXT, ten_canh_bao TEXT, bat BOOLEAN NOT NULL DEFAULT true, so_ngay_bao_truoc INT,
  gio_gui TEXT, email_quan_tri TEXT, ghi_chu TEXT, email_gui TEXT, email_nhan TEXT,
  gui_nguoi_thuc_hien TEXT, gui_nguoi_lam_cung TEXT, gui_nguoi_giao TEXT, extra JSONB NOT NULL DEFAULT '{}');

CREATE TABLE IF NOT EXISTS public.nhat_ky_email_canh_bao (
  id TEXT PRIMARY KEY DEFAULT public.next_id('EM', 6),
  ngay_gui TIMESTAMPTZ, ma_canh_bao TEXT, module TEXT, id_ban_ghi TEXT, nguoi_nhan TEXT,
  tieu_de TEXT, trang_thai TEXT, so_ngay_con_lai INT, noi_dung TEXT, extra JSONB NOT NULL DEFAULT '{}');
CREATE INDEX IF NOT EXISTS nhat_ky_email_tg ON public.nhat_ky_email_canh_bao (ngay_gui DESC);

CREATE TABLE IF NOT EXISTS public.data_audit_archive (
  id TEXT PRIMARY KEY DEFAULT public.next_id('AUD', 4),
  ngay_xu_ly TIMESTAMPTZ, sheet_nguon TEXT, id_goc TEXT, loai_loi TEXT, ly_do TEXT, data_goc TEXT,
  trang_thai TEXT, extra JSONB NOT NULL DEFAULT '{}');

CREATE TABLE IF NOT EXISTS public.hinh_anh_tien_do (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nguon TEXT, id_cong_viec TEXT, ngay DATE, gio TEXT, giai_doan TEXT, dong_tien_do TEXT,
  file_id TEXT, thumb_id TEXT, nguoi_tai TEXT, an BOOLEAN NOT NULL DEFAULT false, extra JSONB NOT NULL DEFAULT '{}');
CREATE INDEX IF NOT EXISTS hinh_anh_tien_do_cv ON public.hinh_anh_tien_do (id_cong_viec, ngay);

ALTER TABLE public.lich_su_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lich_su_dang_nhap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danh_muc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cau_hinh_email_canh_bao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhat_ky_email_canh_bao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_audit_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hinh_anh_tien_do ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lich_su_in, public.lich_su_dang_nhap, public.danh_muc, public.cau_hinh_email_canh_bao,
  public.nhat_ky_email_canh_bao, public.data_audit_archive, public.hinh_anh_tien_do FROM anon, authenticated;

-- data backups (snapshot of every table as gzip+base64 JSON; created/restored from "Kiểm tra & sao lưu dữ liệu")
CREATE TABLE IF NOT EXISTS public.sao_luu (
  id TEXT PRIMARY KEY DEFAULT public.next_id('SL', 4),
  thoi_gian TIMESTAMPTZ NOT NULL DEFAULT now(),
  nguoi_tao TEXT, loai TEXT NOT NULL DEFAULT 'Thủ công', ghi_chu TEXT,
  so_bang INT NOT NULL DEFAULT 0, so_dong INT NOT NULL DEFAULT 0, kich_thuoc INT NOT NULL DEFAULT 0,
  chi_tiet JSONB NOT NULL DEFAULT '{}', du_lieu TEXT NOT NULL);
ALTER TABLE public.sao_luu ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sao_luu FROM anon, authenticated;

-- ---------- electricity payments (one row per payment received for an invoice of a period) ----------
CREATE TABLE IF NOT EXISTS public.thanh_toan_dien (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ky TEXT NOT NULL CHECK (ky ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  nhom_hoa_don TEXT NOT NULL,
  id_khach_thue TEXT REFERENCES public.khach_thue(id) ON DELETE SET NULL,
  ten_khach_thue TEXT,
  ngay_thanh_toan DATE NOT NULL DEFAULT public.today_vn(),
  so_tien NUMERIC NOT NULL CHECK (so_tien > 0),
  hinh_thuc TEXT, ghi_chu TEXT, nguoi_ghi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS thanh_toan_dien_kh ON public.thanh_toan_dien (id_khach_thue, ky);
ALTER TABLE public.thanh_toan_dien ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.thanh_toan_dien FROM anon, authenticated;

-- ---------- maintenance log with the next due date and its alert (V191 "Ngày kế tiếp" / "Cảnh báo") ----------
CREATE OR REPLACE VIEW public.v_nhat_ky_bao_tri WITH (security_invoker = true) AS
WITH base AS (
  SELECT n.*,
    COALESCE(CASE WHEN n.extra->>'NGAY_KE_TIEP' ~ '^\d{4}-\d{2}-\d{2}' THEN left(n.extra->>'NGAY_KE_TIEP', 10)::date END,
      n.ngay_thuc_hien + (SELECT COALESCE(l.chu_ky_ngay, hm.chu_ky_mac_dinh) FROM public.hang_muc_bao_tri hm
        LEFT JOIN public.lich_bao_tri l ON l.id_khu_vuc = n.id_khu_vuc AND l.id_hang_muc = n.id_hang_muc WHERE hm.id = n.id_hang_muc LIMIT 1)) AS ngay_ke_tiep,
    EXISTS (SELECT 1 FROM public.nhat_ky_bao_tri m WHERE m.id_khu_vuc = n.id_khu_vuc AND m.id_hang_muc = n.id_hang_muc AND m.ngay_thuc_hien > n.ngay_thuc_hien) AS da_co_lan_sau
  FROM public.nhat_ky_bao_tri n)
SELECT b.*, CASE
  WHEN b.da_co_lan_sau THEN 'ĐÃ BẢO TRÌ'
  WHEN b.ngay_ke_tiep IS NULL THEN NULL
  WHEN b.ngay_ke_tiep < public.today_vn() THEN 'TRỄ HẠN'
  WHEN b.ngay_ke_tiep = public.today_vn() THEN 'ĐẾN HẠN'
  WHEN b.ngay_ke_tiep - public.today_vn() <= 7 THEN 'SẮP ĐẾN HẠN'
  ELSE 'MỚI BẢO TRÌ' END AS canh_bao
FROM base b;
REVOKE ALL ON public.v_nhat_ky_bao_tri FROM anon, authenticated;

-- ---------- Nhóm 3: chi phí bảo trì, tệp đính kèm ----------
ALTER TABLE public.nhat_ky_bao_tri ADD COLUMN IF NOT EXISTS chi_phi NUMERIC;
CREATE INDEX IF NOT EXISTS ix_nkbt_thiet_bi ON public.nhat_ky_bao_tri(id_thiet_bi);
DROP VIEW IF EXISTS public.v_nhat_ky_bao_tri;
CREATE OR REPLACE VIEW public.v_nhat_ky_bao_tri WITH (security_invoker = true) AS
WITH base AS (
  SELECT n.*,
    COALESCE(CASE WHEN n.extra->>'NGAY_KE_TIEP' ~ '^\d{4}-\d{2}-\d{2}' THEN left(n.extra->>'NGAY_KE_TIEP', 10)::date END,
      n.ngay_thuc_hien + (SELECT COALESCE(l.chu_ky_ngay, hm.chu_ky_mac_dinh) FROM public.hang_muc_bao_tri hm
        LEFT JOIN public.lich_bao_tri l ON l.id_khu_vuc = n.id_khu_vuc AND l.id_hang_muc = n.id_hang_muc WHERE hm.id = n.id_hang_muc LIMIT 1)) AS ngay_ke_tiep,
    EXISTS (SELECT 1 FROM public.nhat_ky_bao_tri m WHERE m.id_khu_vuc = n.id_khu_vuc AND m.id_hang_muc = n.id_hang_muc AND m.ngay_thuc_hien > n.ngay_thuc_hien) AS da_co_lan_sau
  FROM public.nhat_ky_bao_tri n)
SELECT b.*, CASE
  WHEN b.da_co_lan_sau THEN 'ĐÃ BẢO TRÌ'
  WHEN b.ngay_ke_tiep IS NULL THEN NULL
  WHEN b.ngay_ke_tiep < public.today_vn() THEN 'TRỄ HẠN'
  WHEN b.ngay_ke_tiep = public.today_vn() THEN 'ĐẾN HẠN'
  WHEN b.ngay_ke_tiep - public.today_vn() <= 7 THEN 'SẮP ĐẾN HẠN'
  ELSE 'MỚI BẢO TRÌ' END AS canh_bao
FROM base b;
REVOKE ALL ON public.v_nhat_ky_bao_tri FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS public.tep_dinh_kem (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bang TEXT NOT NULL, id_ban_ghi TEXT NOT NULL,
  ten TEXT NOT NULL, mime TEXT, kich_thuoc INTEGER, file_id TEXT NOT NULL,
  nguoi_tai TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE INDEX IF NOT EXISTS ix_tep_ban_ghi ON public.tep_dinh_kem(bang, id_ban_ghi);
ALTER TABLE public.tep_dinh_kem ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tep_dinh_kem FROM anon, authenticated;

-- ---------- Nhóm 2: quên mật khẩu, khóa tạm khi đăng nhập sai ----------
CREATE TABLE IF NOT EXISTS public.dat_lai_mat_khau (
  token_hash TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE INDEX IF NOT EXISTS ix_dlmk_user ON public.dat_lai_mat_khau(user_id, created_at DESC);
ALTER TABLE public.dat_lai_mat_khau ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dat_lai_mat_khau FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS public.dang_nhap_sai (
  id BIGSERIAL PRIMARY KEY, ident TEXT NOT NULL, ip TEXT, at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS ix_dns_ident ON public.dang_nhap_sai(ident, at DESC);
ALTER TABLE public.dang_nhap_sai ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dang_nhap_sai FROM anon, authenticated;

-- ---------- Nhóm 4: cài đặt hệ thống (ngưỡng duyệt đề xuất 2 cấp, 0 = tắt) ----------
CREATE TABLE IF NOT EXISTS public.cau_hinh_he_thong (khoa TEXT PRIMARY KEY, gia_tri TEXT, nguoi_sua TEXT, updated_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE public.cau_hinh_he_thong ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cau_hinh_he_thong FROM anon, authenticated;
INSERT INTO public.cau_hinh_he_thong (khoa, gia_tri, nguoi_sua) VALUES ('nguong_duyet_2_cap', '0', 'Hệ thống') ON CONFLICT (khoa) DO NOTHING;

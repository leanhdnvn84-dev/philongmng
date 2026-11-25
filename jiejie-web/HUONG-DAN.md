# JieJie's Kitchen: website trên Cloudflare Pages

Website là một trang cuộn kể chuyện, có 2 ngôn ngữ Khmer và English. Khách đặt hàng ngay trên trang. Đơn được báo về nhóm Telegram của shop, và có thể ghi thêm vào Google Sheet nếu muốn.

## Cấu trúc

```
jiejie-web/
├── public/                 ← phần khách nhìn thấy
│   ├── index.html          ← trang web
│   ├── catalog.js          ← SẢN PHẨM, GIÁ, thành phần, công thức, số điện thoại
│   ├── img/                ← ảnh sản phẩm
│   └── _headers            ← cài đặt bảo mật và cache
├── functions/api/
│   ├── order.js            ← nhận đơn hàng   (POST /api/order)
│   └── wholesale.js        ← nhận yêu cầu sỉ (POST /api/wholesale)
├── lib/notify.js           ← gửi Telegram và Google Sheet
├── gas/Code.gs             ← (không bắt buộc) ghi đơn vào Google Sheet
├── wrangler.toml
└── HUONG-DAN.md
```

**Sửa giá và sản phẩm:** chỉ cần sửa `public/catalog.js`. Trang web và máy chủ cùng đọc file này. Máy chủ luôn tự tính lại tiền, không dùng giá do trình duyệt gửi lên.

## Bước 1. Tạo bot Telegram nhận đơn

1. Trong Telegram, nhắn cho **@BotFather** lệnh `/newbot` và đặt tên cho bot. BotFather sẽ gửi lại một **token**, có dạng `123456:ABC...`.
2. Tạo một nhóm Telegram cho shop, thêm bot vào nhóm, rồi nhắn thử một câu bất kỳ trong nhóm.
3. Mở trình duyệt, vào `https://api.telegram.org/bot<TOKEN>/getUpdates` (thay `<TOKEN>` bằng token của bạn). Tìm dòng `"chat":{"id":-100...`. Con số đó là **CHAT_ID**.

## Bước 2. Đưa web lên Cloudflare

Bạn chọn **một trong hai** cách dưới đây.

> ⚠️ Đừng dùng cách kéo thả thư mục trong trang quản trị Cloudflare. Cách đó không chạy phần nhận đơn (`functions/`), nên khách sẽ không gửi được đơn.

### Cách A: Nối với GitHub (khuyên dùng, sau này sửa code là web tự cập nhật)

1. Đăng nhập Cloudflare, vào **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Chọn repository chứa thư mục `jiejie-web`.
3. Điền phần cài đặt build như sau:
   - Framework preset: **None**
   - Build command: *(để trống)*
   - Build output directory: `public`
   - Root directory: `jiejie-web`
4. Bấm **Save and Deploy**.

### Cách B: Dùng dòng lệnh

```bash
cd jiejie-web
npm install
npx wrangler login      # mở trình duyệt để đăng nhập Cloudflare
npm run deploy          # lần đầu sẽ hỏi tạo project "jiejie-kitchen"
```

## Bước 3. Cài biến môi trường (bắt buộc để nhận đơn)

Vào project → **Settings** → **Variables and Secrets**, thêm các biến cho môi trường **Production**:

| Tên | Giá trị | Loại |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | token lấy ở Bước 1 | **Secret** |
| `TELEGRAM_CHAT_ID` | CHAT_ID lấy ở Bước 1 | Text |
| `SHEET_WEBHOOK_URL` | *(không bắt buộc)* link Web app Apps Script | Text |
| `SHEET_SECRET` | *(không bắt buộc)* chuỗi bí mật, đặt giống trong Apps Script | **Secret** |

Nếu dùng Cách B, bạn có thể đặt secret bằng lệnh: `npx wrangler pages secret put TELEGRAM_BOT_TOKEN`.

Thêm biến xong, bạn cần **deploy lại** (vào Deployments → Retry deployment, hoặc chạy `npm run deploy`) thì biến mới có hiệu lực.

Nếu chưa đặt biến nào, khách bấm gửi đơn sẽ thấy thông báo lỗi kèm số hotline, nên đơn không bị mất mà không ai biết.

## Bước 4 (không bắt buộc). Lưu đơn vào Google Sheet

1. Tạo một Google Sheet, vào **Extensions → Apps Script**, dán nội dung file `gas/Code.gs`.
2. Vào **Project Settings → Script Properties**, thêm `SHEET_SECRET` với một chuỗi ngẫu nhiên dài.
3. Bấm **Deploy → New deployment → Web app**, chọn Execute as: **Me**, Who has access: **Anyone**.
4. Trên Cloudflare, dán link Web app vào `SHEET_WEBHOOK_URL`, và đặt `SHEET_SECRET` giống hệt chuỗi ở bước 2.

Đơn hàng sẽ được ghi vào sheet **Orders**, yêu cầu báo giá sỉ ghi vào sheet **Wholesale**.

## Bước 5. Gắn tên miền

Vào project → **Custom domains** → **Set up a custom domain**, nhập `jiejieskitchen.com`.
- Nếu mua tên miền ngay tại Cloudflare (Domain Registration), Cloudflare tự cài DNS cho bạn.
- Nếu mua ở nơi khác, làm theo hướng dẫn Cloudflare hiện ra, thường là trỏ nameserver về Cloudflare.

## Chạy thử trên máy

```bash
cd jiejie-web
npm install
cp .dev.vars.example .dev.vars   # điền token thật nếu muốn thử gửi Telegram
npm run dev                      # mở http://localhost:8788
```

## Kiểm tra sau khi đưa web lên

- [ ] Đặt thử 1 đơn: nhóm Telegram nhận được tin nhắn và tổng tiền đúng.
- [ ] Gửi thử 1 yêu cầu báo giá sỉ.
- [ ] Bấm chuyển ខ្មែរ / EN.
- [ ] Mở web trên điện thoại.

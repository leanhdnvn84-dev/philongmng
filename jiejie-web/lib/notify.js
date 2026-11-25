// Dùng chung cho functions/api/*: kiểm tra dữ liệu, tạo mã đơn, gửi Telegram và Google Sheet.

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// Cắt ngắn, bỏ ký tự điều khiển.
export function clean(v, max) {
  return String(v ?? "").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function digits(v) {
  return String(v ?? "").replace(/\D/g, "");
}

// Đọc JSON, từ chối body quá lớn.
export async function readJson(request, maxBytes = 8000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("too_large");
  return JSON.parse(text);
}

// Mã dạng JJ261125-AB12, theo giờ Phnom Penh (UTC+7).
export function makeCode(prefix = "JJ") {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, "0");
  const rnd = crypto.getRandomValues(new Uint8Array(4));
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const tail = Array.from(rnd, (b) => abc[b % abc.length]).join("");
  return `${prefix}${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${tail}`;
}

export function phnomPenhTime() {
  return new Date().toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh" });
}

// Gửi tin nhắn Telegram và (nếu có) ghi một dòng vào Google Sheet.
// Thành công nếu ít nhất một kênh nhận được.
export async function deliver(env, { text, sheet }) {
  const jobs = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      }).then((r) => (r.ok ? "telegram" : Promise.reject(new Error("telegram " + r.status))))
    );
  }
  if (env.SHEET_WEBHOOK_URL) {
    jobs.push(
      fetch(env.SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sheet, secret: env.SHEET_SECRET || "" }),
        redirect: "follow",
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("sheet " + r.status))))
        .then((j) => (j && j.ok ? "sheet" : Promise.reject(new Error("sheet rejected"))))
    );
  }
  if (!jobs.length) return { ok: false, configured: false, sent: [] };
  const res = await Promise.allSettled(jobs);
  const sent = res.filter((r) => r.status === "fulfilled").map((r) => r.value);
  res.filter((r) => r.status === "rejected").forEach((r) => console.error("deliver:", r.reason?.message));
  return { ok: sent.length > 0, configured: true, sent };
}

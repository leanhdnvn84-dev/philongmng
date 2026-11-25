// POST /api/order : nhận đơn hàng từ trang web.
// Giá luôn tính lại ở máy chủ từ public/catalog.js, không tin giá gửi lên từ trình duyệt.
import { C } from "../../public/catalog.js";
import { json, clean, digits, readJson, makeCode, phnomPenhTime, deliver } from "../../lib/notify.js";

export async function onRequestPost({ request, env }) {
  let b;
  try {
    b = await readJson(request);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // Ô ẩn chống spam: bot điền vào thì giả vờ thành công, không gửi gì.
  if (clean(b.website, 200)) return json({ ok: true, code: makeCode() });

  const name = clean(b.name, 80);
  const phone = clean(b.phone, 30);
  const mode = b.mode === "pickup" ? "pickup" : "deliv";
  const addr = mode === "deliv" ? clean(b.addr, 300) : "";
  const note = clean(b.note, 300);
  const lang = b.lang === "en" ? "en" : "kh";

  const items = [];
  for (const it of Array.isArray(b.items) ? b.items.slice(0, 30) : []) {
    const p = C.products.find((x) => x.id === it?.id);
    const q = Math.floor(Number(it?.qty));
    if (p && q >= 1 && q <= 99 && !items.some((x) => x.p.id === p.id)) items.push({ p, q });
  }

  const errors = [];
  if (!name) errors.push("name");
  if (digits(phone).length < 8) errors.push("phone");
  if (mode === "deliv" && !addr) errors.push("addr");
  if (!items.length) errors.push("items");
  if (errors.length) return json({ ok: false, error: "invalid", fields: errors }, 400);

  const subtotal = items.reduce((s, { p, q }) => s + p.price * q, 0);
  const fee = mode === "deliv" ? C.deliveryFee : 0;
  const total = Math.round((subtotal + fee) * 100) / 100;
  const code = makeCode("JJ");
  const money = (n) => "$" + n.toFixed(2);

  const text = [
    `🛒 ĐƠN MỚI ${code}`,
    `${name} · ${phone}`,
    mode === "deliv" ? `Giao tới: ${addr}` : "Khách tự lấy tại shop",
    "",
    ...items.map(({ p, q }) => `• ${q} × ${p.name.en} (${p.size}) = ${money(p.price * q)}`),
    "",
    `Tiền hàng: ${money(subtotal)}`,
    `Phí giao: ${fee ? money(fee) : "0"}`,
    `TỔNG: ${money(total)} (trả khi nhận)`,
    note ? `Ghi chú: ${note}` : "",
    `Ngôn ngữ khách: ${lang === "kh" ? "Khmer" : "English"} · ${phnomPenhTime()}`,
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");

  const sheet = {
    type: "order", code, time: phnomPenhTime(), name, phone, mode, addr, note, lang,
    items: items.map(({ p, q }) => `${q} x ${p.id}`).join(", "),
    subtotal, fee, total,
  };

  const r = await deliver(env, { text, sheet });
  if (!r.configured) return json({ ok: false, error: "not_configured" }, 503);
  if (!r.ok) return json({ ok: false, error: "send_failed" }, 502);
  return json({ ok: true, code, total });
}

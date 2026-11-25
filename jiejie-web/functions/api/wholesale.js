// POST /api/wholesale : nhận yêu cầu báo giá sỉ.
import { json, clean, digits, readJson, makeCode, phnomPenhTime, deliver } from "../../lib/notify.js";

export async function onRequestPost({ request, env }) {
  let b;
  try {
    b = await readJson(request, 4000);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (clean(b.website, 200)) return json({ ok: true });

  const biz = clean(b.biz, 120);
  const type = clean(b.type, 60);
  const phone = clean(b.phone, 30);
  if (!biz || digits(phone).length < 8) return json({ ok: false, error: "invalid" }, 400);

  const code = makeCode("WS");
  const text = [`🏪 YÊU CẦU BÁO GIÁ SỈ ${code}`, `${biz} (${type})`, `ĐT: ${phone}`, phnomPenhTime()].join("\n");
  const r = await deliver(env, { text, sheet: { type: "wholesale", code, time: phnomPenhTime(), biz, bizType: type, phone } });
  if (!r.configured) return json({ ok: false, error: "not_configured" }, 503);
  if (!r.ok) return json({ ok: false, error: "send_failed" }, 502);
  return json({ ok: true, code });
}

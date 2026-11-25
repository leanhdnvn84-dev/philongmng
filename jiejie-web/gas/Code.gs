/**
 * Không bắt buộc: ghi đơn hàng và yêu cầu báo giá sỉ vào Google Sheet.
 * Cloudflare (functions/api/*) gửi JSON tới đây khi biến SHEET_WEBHOOK_URL được đặt.
 *
 * Cài đặt:
 * 1. Tạo Google Sheet, vào Extensions → Apps Script, dán file này.
 * 2. Project Settings → Script Properties: thêm SHEET_SECRET (một chuỗi ngẫu nhiên dài),
 *    đặt cùng giá trị cho biến SHEET_SECRET trên Cloudflare.
 * 3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 * 4. Dán link Web app vào biến SHEET_WEBHOOK_URL trên Cloudflare.
 */

var HEADERS = {
  Orders: ['Mã đơn', 'Thời gian', 'Tên', 'Điện thoại', 'Hình thức', 'Địa chỉ', 'Sản phẩm', 'Tiền hàng', 'Phí giao', 'Tổng', 'Ghi chú', 'Ngôn ngữ', 'Trạng thái'],
  Wholesale: ['Mã', 'Thời gian', 'Doanh nghiệp', 'Loại', 'Điện thoại', 'Trạng thái']
};

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('SHEET_SECRET') || '';
    if (!secret || d.secret !== secret) return out_({ ok: false, error: 'forbidden' });

    if (d.type === 'order') {
      append_('Orders', [d.code, d.time, d.name, d.phone, d.mode === 'pickup' ? 'Tự lấy' : 'Giao hàng', d.addr,
        d.items, d.subtotal, d.fee, d.total, d.note, d.lang, 'Mới']);
    } else if (d.type === 'wholesale') {
      append_('Wholesale', [d.code, d.time, d.biz, d.bizType, d.phone, 'Mới']);
    } else {
      return out_({ ok: false, error: 'unknown_type' });
    }
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function append_(name, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS[name]);
  // Chặn công thức độc hại: ô bắt đầu bằng = + - @ được thêm dấu ' phía trước.
  sh.appendRow(row.map(function (v) {
    return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v;
  }));
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

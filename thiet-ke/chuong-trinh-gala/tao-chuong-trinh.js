/* Chương trình Gala 14/11/2026 để mời khách – Word A4 1 trang.
   node chup-dau-trang.js (đầu trang ảnh) → node tao-chuong-trinh.js → chuong-trinh-gala.docx
   Giờ lấy theo kịch bản MC (thiet-ke/kich-ban-gala), làm tròn 5 phút cho khách. */
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle, ShadingType, VerticalAlign } = require('docx');

const F = 'Times New Roman', DO = '9E1B22', NAU = '5B2A12', VANG = 'C9A24A', XAM = '6A5A50';
const LE = 900, W = 11906 - 2 * LE; /* A4, lề ~1,6 cm */
const anh = f => fs.readFileSync(path.join(__dirname, f));
const px = W / 1440 * 96; /* bề rộng vùng chữ theo px */

const CT = [
  ['16:00', 'Đón khách · Điểm danh · Chụp ảnh lưu niệm theo lớp', ''],
  ['17:00', 'Khai mạc – Clip “Ngày trở về”', 'Giới thiệu đại biểu · Phát biểu của Ban liên lạc hội khoá'],
  ['17:30', 'Nghi thức tri ân Thầy Cô', 'Thầy Cô chia sẻ cùng học trò'],
  ['17:55', 'Trao tặng Quỹ khuyến học Trường THPT Nguyễn Hiền', ''],
  ['18:05', 'Nâng ly khai tiệc', ''],
  ['18:10', 'Dùng tiệc · Giao lưu văn nghệ 12 lớp', ''],
  ['18:45', 'Game show “Ai thông minh hơn học sinh Nguyễn Hiền”', ''],
  ['19:25', 'Game show “Bong bóng khổng lồ”', ''],
  ['19:50', 'Khoảnh khắc lắng đọng – Nhớ về mái trường xưa', ''],
  ['20:00', 'Vinh danh tình bạn – Chụp ảnh tập thể', ''],
  ['20:15', 'Bế mạc – Hẹn ngày gặp lại', ''],
];

const khong = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const cham = { style: BorderStyle.DOTTED, size: 4, color: 'D9C3A0' };
const c1 = 1450, c2 = W - c1;
const bang = new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [c1, c2],
  borders: { top: khong, bottom: khong, left: khong, right: khong, insideHorizontal: khong, insideVertical: khong },
  rows: CT.map(([g, t, p], i) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({ width: { size: c1, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
        borders: { top: khong, left: khong, right: { style: BorderStyle.SINGLE, size: 8, color: VANG }, bottom: i < CT.length - 1 ? cham : khong },
        margins: { top: 80, bottom: 80, left: 0, right: 160 },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: g, font: F, size: 29, bold: true, color: DO })] })] }),
      new TableCell({ width: { size: c2, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
        borders: { top: khong, left: khong, right: khong, bottom: i < CT.length - 1 ? cham : khong },
        margins: { top: 80, bottom: 80, left: 220, right: 0 },
        children: [new Paragraph({ children: [new TextRun({ text: t, font: F, size: 28, bold: true, color: NAU })] })]
          .concat(p ? [new Paragraph({ children: [new TextRun({ text: p, font: F, size: 24, italics: true, color: XAM })] })] : []) }),
    ]
  }))
});

const giua = (t, o) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: o.tr || 0, after: o.sau || 0 },
  children: [new TextRun({ text: t, font: F, size: o.c, bold: o.b, italics: o.i, color: o.m, characterSpacing: o.gian })] });

/* Chân trang: thời gian địa điểm + QR */
const q1 = W - 2200, q2 = 2200;
const chan = new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [q1, q2],
  borders: { top: khong, bottom: khong, left: khong, right: khong, insideHorizontal: khong, insideVertical: khong },
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: q1, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: khong, bottom: khong, left: khong, right: khong },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FBF3E4' }, margins: { top: 90, bottom: 90, left: 160, right: 120 },
      children: [
        new Paragraph({ children: [new TextRun({ text: 'THỨ BẢY · 14 . 11 . 2026', font: F, size: 29, bold: true, color: DO })] }),
        new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: 'Nhà hàng Quảng Đại 2', font: F, size: 26, bold: true, color: NAU })] }),
        new Paragraph({ children: [new TextRun({ text: '190 Đường 30-4, Phường Hòa Cường, TP. Đà Nẵng', font: F, size: 24, color: XAM })] }),
        new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: 'Website: nguyenhien.philong.cloud', font: F, size: 24, italics: true, color: XAM })] }),
      ] }),
    new TableCell({ width: { size: q2, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: khong, bottom: khong, left: khong, right: khong },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FBF3E4' }, margins: { top: 60, bottom: 60, left: 60, right: 60 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: anh('qr-luu-but.png'), transformation: { width: 104, height: 104 } })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Quét mã viết lưu bút', font: F, size: 20, italics: true, color: DO })] }),
      ] }),
  ] })]
});

const doc = new Document({
  creator: 'Ban liên lạc khoá 2000 – 2003', title: 'Chương trình Gala Ngày trở về',
  styles: { default: { document: { run: { font: F, size: 28 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 700, bottom: 700, left: LE, right: LE },
      borders: { pageBorderTop: { style: BorderStyle.DOUBLE, size: 6, color: VANG, space: 14 }, pageBorderBottom: { style: BorderStyle.DOUBLE, size: 6, color: VANG, space: 14 },
        pageBorderLeft: { style: BorderStyle.DOUBLE, size: 6, color: VANG, space: 14 }, pageBorderRight: { style: BorderStyle.DOUBLE, size: 6, color: VANG, space: 14 } } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'jpg', data: anh('dau-trang.jpg'), transformation: { width: Math.round(px), height: Math.round(px * 226 / 560) } })] }),
      giua('GALA GẶP MẶT CỰU HỌC SINH', { c: 34, b: true, m: NAU, gian: 30, tr: 40 }),
      giua('NIÊN KHOÁ 2000 – 2003', { c: 28, b: true, m: DO, gian: 40, tr: 30 }),
      giua('“Tôn sư trọng đạo – Gắn kết bạn bè – Hướng về mái trường xưa”', { c: 25, i: true, m: XAM, tr: 70, sau: 200 }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
        children: [new TextRun({ text: '✦  ', color: VANG, size: 26 }), new TextRun({ text: 'CHƯƠNG TRÌNH', font: F, size: 33, bold: true, color: DO, characterSpacing: 60 }), new TextRun({ text: '  ✦', color: VANG, size: 26 })] }),
      bang,
      new Paragraph({ spacing: { after: 240 }, children: [] }),
      chan,
      giua('Sự có mặt của Quý Thầy Cô và các bạn sẽ làm Ngày trở về thêm trọn vẹn!', { c: 24, i: true, m: DO, tr: 100 }),
    ],
  }],
});
Packer.toBuffer(doc).then(b => { const f = path.join(__dirname, 'chuong-trinh-gala.docx'); fs.writeFileSync(f, b); console.log(f, b.length); });

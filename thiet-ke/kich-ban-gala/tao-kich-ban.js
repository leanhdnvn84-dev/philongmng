/* Kịch bản MC Gala 14/11/2026 – bản rà soát + hoàn thiện từ kich-ban-goc.docx.
   node tao-kich-ban.js → kich-ban-gala-hoan-thien.docx */
const fs = require('fs');
const path = require('path');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, BorderStyle, LevelFormat, PageNumber, Footer, Header } = D;

const FONT = 'Times New Roman';
const DO = '9E1B22', VANG = 'C9A24A', XAM = '5A4A40';
const W = 9638; /* A4, lề 2 cm */

/* [[!…!]] = chỗ cần BTC xác nhận (tô vàng) */
function runs(t, o) {
  o = o || {};
  const out = [];
  t.split(/(\[\[!.*?!\]\])/).forEach(p => {
    if (!p) return;
    const m = p.match(/^\[\[!(.*)!\]\]$/);
    if (m) out.push(new TextRun({ text: m[1], font: FONT, size: o.size || 26, bold: true, highlight: 'yellow', italics: o.it }));
    else out.push(new TextRun({ text: p, font: FONT, size: o.size || 26, bold: o.b, italics: o.it, color: o.color }));
  });
  return out;
}
const P = (t, o) => new Paragraph({ children: runs(t, o), alignment: (o && o.al) || AlignmentType.JUSTIFIED, spacing: { after: 100, line: 300 }, indent: o && o.ind ? { left: o.ind } : undefined });
const Sub = t => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, italics: true, color: DO })], spacing: { before: 140, after: 80 } });
const Tho = lines => lines.map((l, i) => new Paragraph({ children: runs(l, { it: true }), alignment: AlignmentType.CENTER, spacing: { after: i === lines.length - 1 ? 140 : 20, line: 288 } }));
const Ds = items => items.map(t => new Paragraph({ children: runs(t), numbering: { reference: 'cham', level: 0 }, spacing: { after: 50, line: 288 } }));
const Moi = t => new Paragraph({ children: [new TextRun({ text: '▸ ' + t, font: FONT, size: 22, italics: true, color: XAM })], spacing: { after: 80 } });

const vien = { style: BorderStyle.SINGLE, size: 4, color: 'D9C9A8' };
const bien = { top: vien, bottom: vien, left: vien, right: vien };
function cueBox(rows) {
  const c1 = 2000, c2 = W - c1;
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [c1, c2],
    rows: rows.map(([k, v]) => new TableRow({
      children: [
        new TableCell({ width: { size: c1, type: WidthType.DXA }, borders: bien, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F6EBD6' }, margins: { top: 50, bottom: 50, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: k, font: FONT, size: 21, bold: true, color: DO })] })] }),
        new TableCell({ width: { size: c2, type: WidthType.DXA }, borders: bien, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FFFCF6' }, margins: { top: 50, bottom: 50, left: 100, right: 100 }, children: [new Paragraph({ children: runs(v, { size: 21 }) })] })
      ]
    }))
  });
}
function tieuDe(so, ten, gio, moi) {
  return [
    new Paragraph({ spacing: { before: 280, after: 60 }, keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: VANG, space: 4 } },
      children: [
        new TextRun({ text: so + '  ', font: FONT, size: 34, bold: true, color: VANG }),
        new TextRun({ text: ten, font: FONT, size: 27, bold: true, color: DO }),
        new TextRun({ text: '   ' + gio, font: FONT, size: 22, bold: true, color: XAM }),
        moi ? new TextRun({ text: '   ✦ MỚI BỔ SUNG', font: FONT, size: 18, bold: true, color: '2F8F5B' }) : new TextRun('')
      ] }),
  ];
}
const trong = () => new Paragraph({ spacing: { after: 60 }, children: [] });

/* ---------------- Nội dung ---------------- */
const MUC = [];
function muc(so, ten, gio, cue, body, moi) { MUC.push({ so, ten, gio, cue, body, moi }); }

muc('00', 'ĐÓN KHÁCH – CHECK-IN – CHỤP ẢNH TỪNG LỚP', '16:00 – 17:00', [
  ['Màn LED', 'Clip backdrop "Ngày trở về" (bản 5 phút, chạy lặp) – xen trình chiếu ảnh cả khoá kèm mã QR viết lưu bút ở 2 bên màn.'],
  ['Âm thanh', 'Nhạc nền nhẹ: Mong ước kỷ niệm xưa, Phượng hồng, Ngày ấy bạn và tôi, Tình thơ.'],
  ['Hậu cần', 'Bàn đón khách theo 12 lớp: điểm danh sĩ số, phát thẻ tên; mỗi lớp chụp 1 ảnh tập thể trước backdrop + 2 câu đối. Xếp chỗ thầy cô ở bàn đầu.'],
  ['Gợi ý', '16:00 – 16:35 các lớp check-in, chụp ảnh lớp theo lượt (mỗi lớp ≈ 3 phút, gọi theo thứ tự 12/1 → 12/12); 16:35 – 17:00 đón thầy cô, giao lưu tự do, viết lưu bút.'],
], [
  Moi('Không có lời MC – đội đón khách hướng dẫn. Nhắc mọi người quét mã QR trên màn hình để viết lưu bút (bài viết sẽ hiện lên màn hình trong đêm Gala).'),
]);

muc('01', 'VOICE OFF – MỜI ỔN ĐỊNH VỊ TRÍ', '17:00 – 17:05', [
  ['Âm thanh', 'Micro hậu trường (voice off), nhạc nền nhỏ dần.'],
  ['Hậu cần', 'Các lớp hoàn tất điểm danh, báo sĩ số cho Ban tổ chức.'],
], [
  P('Kính thưa Quý vị!'),
  P('Chương trình Gala Dinner đặc biệt “Tôn sư trọng đạo – Gắn kết bạn bè – Hướng về mái trường xưa”, kỷ niệm 23 năm ngày ra trường của cựu học sinh Trường THPT Nguyễn Hiền niên khoá 2000 – 2003, sẽ bắt đầu trong ít phút nữa.'),
  P('Ban Tổ chức trân trọng kính mời Quý thầy cô cùng toàn thể anh chị cựu học sinh 12 lớp niên khoá 2000 – 2003 vui lòng ổn định vị trí để chương trình được bắt đầu.'),
  P('Trong lúc chờ đợi, xin mời các bạn quét mã QR trên màn hình để viết đôi dòng lưu bút gửi thầy cô và bạn bè – những dòng lưu bút ấy sẽ được hiện lên màn hình ngay trong đêm nay.'),
  P('Kính chúc Quý vị một buổi tối thật nhiều niềm vui, nhiều tiếng cười và những khoảnh khắc đáng nhớ của tình bạn, tình thầy trò và thật nhiều yêu thương.'),
  P('Xin trân trọng cảm ơn!'),
]);

muc('02', 'CLIP MỞ ĐẦU & MC KHAI MẠC', '17:05 – 17:15', [
  ['Màn LED', 'Tắt đèn khán phòng → chiếu clip mở đầu 15 giây "Ngày trở về" → dừng ở khung hình backdrop. Bật đèn sân khấu, MC bước ra.'],
  ['Âm thanh', 'Âm thanh của clip; sau đó nhạc nền piano nhẹ khi MC đọc thơ.'],
], [
  Sub('MC đọc thơ mở đầu:'),
  ...Tho(['Thời gian qua cuốn trôi bao kỷ niệm,', 'Mái trường nào giờ đã mãi chia xa.', 'Bạn và tôi nay mỗi người một ngả,', 'Bao nỗi buồn dâng kín cả con tim.', 'Ngày xa nhau ta chỉ biết lặng im,', 'Giọt nước mắt khóc thầm ngày ly biệt.', 'Xa nhau rồi ai mà không nuối tiếc', 'Tháng với ngày hạnh phúc ở bên nhau!']),
  P('Kính thưa quý thầy cô giáo kính mến! Thưa toàn thể các anh chị em cựu học sinh niên khoá 2000 – 2003, Trường THPT Nguyễn Hiền, Đà Nẵng thân thương!'),
  P('Có những hành trình dù thời gian có trôi qua bao lâu, vẫn luôn in đậm trong trái tim mỗi người. Có những mái trường dù ta đã rời xa từ rất lâu, nhưng mỗi khi nhắc đến, trong lòng lại dâng lên biết bao cảm xúc bồi hồi, thương nhớ.'),
  P('23 năm kể từ ngày rời mái trường THPT Nguyễn Hiền thân yêu, mỗi chúng ta giờ đây đã có những hành trình riêng, những công việc riêng, những thành công và cả những bộn bề của cuộc sống. Thế nhưng hôm nay, khi cùng trở về đây, chúng ta lại được gặp nhau trong vòng tay bè bạn, được gọi nhau bằng những cái tên thân quen của một thời áo trắng và được sống lại những tháng ngày thanh xuân tươi đẹp dưới mái trường xưa.'),
  P('Và đặc biệt hơn cả, trong hành trình trở về ấy, chúng ta không quên những người đã tận tâm dìu dắt, truyền đạt tri thức, chắp cánh ước mơ cho bao thế hệ học trò. Đó chính là quý thầy cô kính yêu – những người đã để lại trong lòng chúng ta không chỉ kiến thức, mà còn cả những bài học làm người quý giá theo suốt cuộc đời.'),
  P('Chính vì vậy, buổi Gala Dinner hôm nay được tổ chức với chủ đề “TÔN SƯ TRỌNG ĐẠO – GẮN KẾT BẠN BÈ – HƯỚNG VỀ MÁI TRƯỜNG XƯA”, là dịp để chúng ta cùng nhau tri ân thầy cô, thắt chặt tình bạn sau 23 năm xa cách và cùng hướng trái tim mình về mái trường THPT Nguyễn Hiền thân yêu – nơi đã lưu giữ một phần thanh xuân không thể nào quên của mỗi chúng ta. Năm nay cũng là năm nhà trường kỷ niệm 30 năm thành lập (1996 – 2026), nên cuộc trở về của chúng ta càng thêm ý nghĩa.'),
  P('Đây không chỉ là một buổi tiệc hội ngộ, mà còn là cuộc gặp gỡ của những ký ức, của tình thầy trò, nghĩa bạn bè và của những trái tim luôn hướng về cội nguồn.'),
  P('Đó cũng chính là lý do của chương trình ngày hôm nay.'),
]);

muc('03', 'GIỚI THIỆU ĐẠI BIỂU', '17:15 – 17:25', [
  ['Màn LED', 'Slide "Kính chào Quý thầy cô"; nếu có ảnh, hiện ảnh từng thầy cô khi MC đọc tên.'],
  ['Hậu cần', 'Mời từng thầy cô đứng dậy chào khi được giới thiệu; vỗ tay theo nhóm, không vỗ từng tên cho đỡ ngắt quãng.'],
], [
  P('Kính thưa quý vị!'),
  P('Trong mỗi cuộc hội ngộ, điều khiến chúng ta xúc động nhất không chỉ là được gặp lại những người bạn cũ, mà còn là được nhìn thấy những người thầy, người cô đã dành cả tâm huyết để dạy dỗ chúng ta nên người.'),
  P('Hai mươi ba năm trước, thầy cô đứng trên bục giảng, còn chúng ta ngồi dưới mái lớp thân quen. Thầy cô trao cho chúng ta kiến thức, dạy chúng ta cách sống, cách làm người và cách vững vàng trước những thử thách của cuộc đời.'),
  P('Hôm nay, dù chúng ta đã trưởng thành, đã có những mái ấm, những công việc và những trách nhiệm riêng, nhưng khi đứng trước thầy cô, có lẽ trong trái tim mỗi người vẫn còn nguyên vẹn tình cảm của một cô cậu học trò năm nào.'),
  P('Và ngay sau đây, xin trân trọng giới thiệu sự hiện diện của quý thầy cô giáo cùng các vị đại biểu, khách quý tham dự chương trình hôm nay:'),
  Sub('1. Quý thầy cô nguyên Ban Giám hiệu:'),
  ...Ds(['Thầy Phạm Úc – nguyên Hiệu trưởng nhà trường;', 'Thầy Trần Huy Viêm – nguyên Phó Hiệu trưởng nhà trường;', 'Cô Trần Thị Hường – nguyên Phó Hiệu trưởng nhà trường.']),
  Sub('2. Quý thầy cô Ban Giám hiệu nhà trường:'),
  ...Ds(['Cô Nguyễn Thị Minh Huệ – Hiệu trưởng nhà trường;', 'Thầy Nguyễn Văn Nghệ – Phó Hiệu trưởng nhà trường;', 'Cô Lê Thị Thảo – Phó Hiệu trưởng nhà trường.']),
  Sub('3. Thầy Trần Quốc Phong – nguyên Bí thư Đoàn trường.'),
  Sub('4. Quý thầy cô giáo viên chủ nhiệm các lớp qua các năm học:'),
  ...Ds([
    'Lớp 12/1: Cô Đặng Thị Xuân Tùng;',
    'Lớp 12/2: Cô Lê Thị Vân, Cô Lê Thị Thu Sương;',
    'Lớp 12/3: Cô Nguyễn Thị Lộc, Cô Nguyễn Thị Phương, Cô Nguyễn Thị Lý;',
    'Lớp 12/4: Cô Lê Thị Phương Hiền, Cô Nguyễn Thị Thu Thuỷ;',
    'Lớp 12/5: Cô Nguyễn Thị Luyến;',
    'Lớp 12/6: Thầy Lương Thanh Sơn, Cô Nguyễn Thị Xuân Thu;',
    'Lớp 12/7: Cô Lê Thị Tuyết Hồng;',
    'Lớp 12/8: Cô Nguyễn Thị Hồng Hạnh, Cô Hoàng Thị Lệ Hằng, Cô Huỳnh Thị Thuỳ Anh;',
    'Lớp 12/9: Thầy Ngô Tùng Sơn;',
    'Lớp 12/10: Cô [[!… Ái Trang (bổ sung họ)!]], Cô Nguyễn Thị Lan;',
    'Lớp 12/11: Thầy Lê Văn Long, Cô Tạ Thị Kim Trân;',
    'Lớp 12/12: Thầy Mai Ca, Thầy Trần Quang Vũ.',
  ]),
  Sub('5. Đại diện Ban liên lạc hội khoá:'),
  P('Anh Lê Trung Hiếu, chị Hoàng Diệu Thúy, chị Nguyễn Thị Tuyết Mai.'),
  P('Cùng sự hiện diện của toàn thể anh chị em cựu học sinh 12 lớp, Trường THPT Nguyễn Hiền, Đà Nẵng, niên khoá 2000 – 2003.'),
  P('Xin quý vị dành một tràng pháo tay thật nồng nhiệt để chào đón và bày tỏ lòng biết ơn đến quý thầy cô!'),
]);

muc('04', 'ĐẠI DIỆN HỘI KHOÁ PHÁT BIỂU', '17:25 – 17:32', [
  ['Màn LED', 'Backdrop tĩnh "Ngày trở về".'],
  ['Hậu cần', 'Micro có dây/bục phát biểu; bài phát biểu khoảng 5 phút.'],
], [
  P('Kính thưa quý thầy cô và toàn thể các anh chị em!'),
  P('Để có được cuộc hội ngộ ngày hôm nay, chắc chắn không thể thiếu sự kết nối, chung tay và tâm huyết của Ban liên lạc cùng các thành viên trong hội khoá.'),
  P('Từ những cuộc điện thoại hỏi thăm, những tin nhắn tìm lại bạn cũ, đến những lần cùng nhau lên ý tưởng và chuẩn bị cho ngày gặp mặt, tất cả đều xuất phát từ một mong muốn giản dị: làm sao để mọi người có thể trở về, được gặp lại nhau và cùng hướng về mái trường xưa.'),
  P('Và ngay sau đây, xin trân trọng kính mời anh Lê Trung Hiếu, đại diện Ban Tổ chức hội khoá, lên sân khấu phát biểu khai mạc và chia sẻ đôi lời tâm huyết trong dịp hội ngộ đặc biệt này.'),
  P('Xin trân trọng kính mời!'),
  Sub('Sau phát biểu:'),
  P('Xin trân trọng cảm ơn những chia sẻ chân thành và đầy tình cảm của anh Lê Trung Hiếu.'),
  P('Hy vọng rằng, sau cuộc gặp gỡ hôm nay, sợi dây gắn kết của tập thể niên khoá 2000 – 2003 sẽ ngày càng bền chặt; để dù cuộc sống có bận rộn đến đâu, chúng ta vẫn luôn dành cho nhau một chỗ trong trái tim và luôn nhớ rằng mình đã từng có chung một mái trường.'),
]);

muc('05', 'NGHI THỨC TRI ÂN THẦY CÔ', '17:32 – 17:47', [
  ['Màn LED', 'Trình chiếu "Chiếu hình thầy cô" (thiệp thầy cô + câu tri ân) suốt lúc tặng hoa.'],
  ['Âm thanh', 'Nhạc không lời: Người thầy, Bụi phấn.'],
  ['Hậu cần', '12 bó hoa + quà theo lớp xếp sẵn sau cánh gà; mỗi lớp cử 1–2 bạn đón thầy cô lớp mình lên sân khấu. Thợ ảnh chờ sẵn.'],
], [
  P('Kính thưa quý vị!'),
  ...Tho(['Có một nghề bụi phấn bám đầy tay,', 'Người ta gọi đó là nghề cao quý.', 'Nghề gieo chữ giữa cuộc đời bình dị,', 'Chắp cánh ước mơ, vun đắp tháng ngày.']),
  P('Có những lời cảm ơn chúng ta đã muốn nói từ rất lâu, nhưng vì cuộc sống bận rộn, vì những ngại ngùng của người trưởng thành, chúng ta vẫn chưa có dịp nói thành lời.'),
  P('Hôm nay là một ngày đặc biệt. Chúng ta không trở về với thầy cô bằng những bài kiểm tra hay những trang lưu bút, mà trở về bằng sự trưởng thành, bằng lòng biết ơn và bằng tất cả những tình cảm chân thành nhất.'),
  P('Kính thưa quý thầy cô!'),
  P('Có thể ngày ấy, chúng em chưa đủ trưởng thành để hiểu hết những lo lắng, những lời nhắc nhở nghiêm khắc và sự tận tuỵ của thầy cô. Nhưng sau 23 năm, khi đã trải qua những thăng trầm của cuộc sống, chúng em càng hiểu rằng những bài học năm xưa chính là hành trang quý giá giúp chúng em vững bước đến ngày hôm nay.'),
  P('Thầy cô có thể không nhớ hết từng bài giảng, từng buổi học, nhưng đối với chúng em, hình ảnh thầy cô trên bục giảng, những lời động viên và cả những lần nhắc nhở vẫn luôn là ký ức không thể phai mờ.'),
  P('Và hôm nay, thay mặt tập thể cựu học sinh niên khoá 2000 – 2003, xin được gửi đến quý thầy cô lời tri ân sâu sắc nhất.'),
  P('Xin kính mời đại diện Ban liên lạc hội khoá cùng đại diện 12 lớp lên sân khấu, đón các thầy cô của lớp mình để gửi tặng những bó hoa tươi thắm và những món quà tri ân đầy ý nghĩa.'),
  P('Xin trân trọng kính mời quý thầy cô tiến lên sân khấu!'),
  Sub('Trong lúc tặng hoa:'),
  P('Những bó hoa hôm nay có thể không nói hết được công ơn dạy dỗ, nhưng xin được thay lời cảm ơn chân thành của biết bao thế hệ học trò.'),
  P('Kính chúc quý thầy cô luôn mạnh khoẻ, bình an, hạnh phúc và mãi là những người lái đò đáng kính trong trái tim các thế hệ học sinh.'),
  P('Xin kính mời quý thầy cô và đại diện hội khoá cùng lưu lại khoảnh khắc thật đẹp này!'),
  Sub('Sau nghi thức:'),
  P('Xin cả khán phòng dành một tràng pháo tay thật dài, thật nồng nhiệt gửi đến quý thầy cô kính yêu!'),
]);

muc('06', 'ĐẠI DIỆN THẦY CÔ PHÁT BIỂU', '17:47 – 17:55', [
  ['Màn LED', 'Backdrop tĩnh.'],
  ['Hậu cần', 'Báo trước cho thầy/cô phát biểu; mời ngồi hàng đầu để lên nhanh.'],
], [
  P('Kính thưa quý vị!'),
  P('Được gặp lại những người học trò sau 23 năm chắc hẳn cũng mang đến cho thầy cô thật nhiều cảm xúc. Những gương mặt ngày nào nay đã trưởng thành, những cô cậu học trò năm xưa giờ đây đã trở thành những người cha, người mẹ, những người đang tiếp tục viết nên câu chuyện cuộc đời mình.'),
  P('Và có lẽ, niềm vui lớn nhất của người thầy chính là nhìn thấy học trò trưởng thành, sống tử tế và luôn nhớ về cội nguồn.'),
  P('Ngay sau đây, xin trân trọng kính mời [[!Thầy/Cô ……………… (BTC chọn người phát biểu)!]], đại diện quý thầy cô, có đôi lời chia sẻ với tập thể cựu học sinh trong buổi hội ngộ đầy ý nghĩa hôm nay.'),
  P('Xin trân trọng kính mời!'),
  Sub('Sau phát biểu:'),
  ...Tho(['Trăm năm Kiều vẫn là Kiều,', 'Giọng thầy ấm áp là điều tất nhiên.']),
  Moi('Nếu người phát biểu là cô, MC đổi câu thứ hai thành: “Lời cô ấm áp là điều tất nhiên.”'),
  P('Chúng em xin trân trọng cảm ơn những lời chia sẻ đầy yêu thương của [[!thầy/cô!]].'),
  P('Có những bài học đã theo chúng em suốt 23 năm, có những lời dặn dò đến tận hôm nay vẫn còn nguyên giá trị. Và chắc chắn rằng, dù thời gian tiếp tục trôi đi, tình thầy trò của niên khoá 2000 – 2003 với mái trường Nguyễn Hiền sẽ vẫn luôn được gìn giữ và trân trọng.'),
  ...Tho(['Bụi phấn xưa có thể nhoà theo gió,', 'Nhưng nghĩa thầy trò còn mãi với thời gian.', 'Hai mươi ba năm – xin gửi một lời tri ân,', 'Về mái trường xưa, về thầy cô yêu dấu!']),
]);

muc('07', 'TRAO TẶNG QUỸ KHUYẾN HỌC NHÀ TRƯỜNG', '17:55 – 18:03', [
  ['Màn LED', 'Slide "Hướng về mái trường xưa – Quỹ khuyến học Trường THPT Nguyễn Hiền".'],
  ['Âm thanh', 'Nhạc nền hùng tráng nhẹ khi trao bảng.'],
  ['Hậu cần', '2 bảng trao tặng (in sẵn): Khoá 2000 – 2003 [[!10.000.000 VNĐ – xác nhận số tiền!]]; anh Trần Quốc Thuyên – lớp 12/4: 3.000.000 VNĐ. Phong bì kèm theo, 2 bó hoa tặng lại người trao.'],
], [
  P('Kính thưa quý thầy cô và các anh chị em!'),
  P('Hướng về mái trường xưa không chỉ là nhớ về những tháng ngày đã qua, mà còn là mong muốn được góp một phần nhỏ bé cho những thế hệ học trò đang tiếp bước chúng ta dưới mái trường Nguyễn Hiền hôm nay – đặc biệt trong năm nhà trường kỷ niệm 30 năm thành lập.'),
  P('Với tấm lòng ấy, tập thể cựu học sinh niên khoá 2000 – 2003 xin được trao tặng Quỹ khuyến học Trường THPT Nguyễn Hiền, như một lời cảm ơn gửi về mái trường đã chắp cánh cho chúng ta.'),
  P('Xin trân trọng kính mời Cô Nguyễn Thị Minh Huệ – Hiệu trưởng nhà trường – lên sân khấu nhận bảng trao tặng.'),
  P('Xin kính mời anh Lê Trung Hiếu, đại diện Ban liên lạc hội khoá, lên trao tặng Quỹ khuyến học số tiền [[!10.000.000 đồng (mười triệu đồng)!]].'),
  P('Và xin trân trọng kính mời anh Trần Quốc Thuyên – cựu học sinh lớp 12/4 – lên trao tặng Quỹ khuyến học số tiền 3.000.000 đồng (ba triệu đồng).'),
  Sub('Sau khi trao:'),
  P('Thay mặt nhà trường, xin kính mời Cô Hiệu trưởng có đôi lời đáp từ. [[!(Tuỳ cô – nếu cô không phát biểu, MC chuyển thẳng câu dưới.)!]]'),
  P('Những tấm lòng nhỏ hôm nay mong sẽ trở thành những học bổng, những phần thưởng tiếp thêm động lực cho các em học sinh Nguyễn Hiền. Xin một tràng pháo tay thật lớn cảm ơn những tấm lòng hướng về mái trường!'),
], true);

muc('08', 'NÂNG LY KHAI TIỆC', '18:03 – 18:10', [
  ['Màn LED', 'Backdrop "Ngày trở về".'],
  ['Âm thanh', 'Nhạc sôi động khi hô "Một, hai, ba"; sau đó nhạc nền nhẹ.'],
  ['Hậu cần', 'Nhà hàng rót sẵn đồ uống trước khi MC mời; đại diện 12 lớp lên sân khấu.'],
], [
  P('Sau những giây phút trang trọng và xúc động, đã đến lúc chúng ta cùng nâng ly để chúc mừng cho cuộc hội ngộ đặc biệt này!'),
  P('Xin mời quý thầy cô, đại diện Ban liên lạc và toàn thể các anh chị em cùng đứng lên, trên tay là những ly rượu, ly bia hoặc nước uống, để chúng ta cùng gửi đến nhau những lời chúc tốt đẹp nhất. Xin mời đại diện 12 lớp lên sân khấu!'),
  P('Chúng ta nâng ly vì điều gì?'),
  ...Ds([
    'Vì công ơn của những người thầy, người cô đã dìu dắt chúng ta!',
    'Vì tình bạn đã đi qua 23 năm tháng mà vẫn còn nguyên vẹn những yêu thương!',
    'Vì những người bạn hôm nay đã có mặt, và cả những người bạn chưa thể trở về nhưng vẫn luôn hướng lòng mình về tập thể!',
    'Và vì Trường THPT Nguyễn Hiền thân yêu – nơi đã cho chúng ta gặp nhau, cùng lớn lên và cùng có một thời thanh xuân thật đẹp!',
  ]),
  P('Xin kính chúc quý thầy cô sức khoẻ, an vui và hạnh phúc!'),
  P('Chúc toàn thể anh chị em gia đình hạnh phúc, công việc thuận lợi, luôn mạnh khoẻ và thành công!'),
  P('Và chúc cho tình bạn của niên khoá 2000 – 2003 mãi bền lâu, để hôm nay gặp lại là niềm vui, ngày mai gặp lại vẫn là những người bạn thân thương như thuở nào!'),
  P('Xin kính mời tất cả chúng ta cùng nâng ly!'),
  P('Một, hai, ba – chúc mừng hội khoá 2000 – 2003!', { b: true, al: AlignmentType.CENTER }),
  P('Một, hai, ba – chúc mừng tình thầy trò!', { b: true, al: AlignmentType.CENTER }),
  P('Một, hai, ba – tình bạn mãi bền lâu!', { b: true, al: AlignmentType.CENTER }),
  P('Xin trân trọng cảm ơn và kính mời quý vị cùng nhập tiệc!'),
]);

muc('09', 'DÙNG TIỆC', '18:10 – 18:20', [
  ['Màn LED', 'Trình chiếu "Tất cả" (ảnh cả khoá xen lưu bút, thầy cô) – mã QR viết lưu bút luôn ở 2 bên màn.'],
  ['Âm thanh', 'Nhạc nền nhẹ; phục vụ món.'],
], [
  Sub('MC nhắc ngắn (khoảng 18:15):'),
  P('Trong lúc thưởng thức bữa tiệc, xin mời các bạn nhìn lên màn hình: những tấm ảnh của 12 lớp đang lần lượt hiện lên. Bạn nào chưa viết lưu bút, hãy quét mã QR hai bên màn hình – lời nhắn của bạn sẽ được chiếu ngay trong đêm nay.'),
]);

muc('10', 'GIAO LƯU VĂN NGHỆ – LỚP 12/1 ĐẾN 12/6', '18:20 – 18:45', [
  ['Hậu cần', 'Thứ tự tiết mục sắp xếp linh hoạt; mỗi lớp 1 tiết mục ≈ 4 phút. Các lớp nộp tên bài + nhạc nền (USB) cho kỹ thuật trước 16:30.'],
], [
  Moi('MC giới thiệu từng tiết mục: tên lớp – tên bài – người trình bày; sau mỗi tiết mục mời một tràng pháo tay.'),
]);

muc('11', 'GAME SHOW 1 – “AI THÔNG MINH HƠN HỌC SINH NGUYỄN HIỀN”', '18:45 – 19:00', [
  ['Màn LED', 'Slide câu hỏi (nếu có).'],
  ['Hậu cần', 'Những câu hỏi “hại não” hài hước, vui nhộn; 05 phần quà.'],
], []);

muc('12', 'GIAO LƯU VĂN NGHỆ – LỚP 12/7 ĐẾN 12/12', '19:00 – 19:25', [
  ['Hậu cần', 'Sắp xếp linh hoạt, mỗi lớp 1 tiết mục ≈ 4 phút.'],
], []);

muc('13', 'GAME SHOW 2 – BONG BÓNG KHỔNG LỒ', '19:25 – 19:40', [
  ['Hậu cần', '6 bộ bong bóng khổng lồ (2 lớp ghép 1 đội); 06 phần quà; chuẩn bị khu vực chơi an toàn, dọn bàn ghế gần sân khấu.'],
], []);

muc('14', 'CHÚC MỪNG SINH NHẬT CÁC BẠN SINH THÁNG 11', '19:40 – 19:50', [
  ['Âm thanh', 'Nhạc “Happy Birthday” / Khúc hát mừng sinh nhật.'],
  ['Hậu cần', 'Bánh kem, nến; tắt đèn khán phòng, mời mọi người bật đèn flash điện thoại.'],
], [
  P('Xin mời các anh chị có sinh nhật trong tháng 11 lên sân khấu!'),
  P('Và đặc biệt, có những người bạn sinh nhật đúng vào ngày hôm nay – 14/11 – trùng ngày “trở về” của cả khoá: Lê Huy Bình, Huỳnh Thị Tâm Thảo, Lê Thị Thanh Thảo, Trần Thị Thuỳ Dương. Xin một tràng pháo tay thật lớn!'),
  Moi('Tắt đèn – bật flash – cả khán phòng cùng hát mừng sinh nhật – thổi nến – chụp ảnh.'),
]);

muc('15', 'KHOẢNH KHẮC LẮNG ĐỌNG – NHỚ VỀ MÁI TRƯỜNG XƯA', '19:50 – 20:00', [
  ['Màn LED', 'Trình chiếu ảnh cũ của lớp, thầy cô, mái trường. Phần “Một phút hoài niệm”: slide nền tối, ngọn nến.'],
  ['Âm thanh', 'Mong ước kỷ niệm xưa hoặc piano nhẹ; tắt hẳn nhạc trong một phút hoài niệm.'],
  ['Hậu cần', 'Giảm đèn khán phòng.'],
], [
  P('Kính thưa quý thầy cô và toàn thể các anh chị em!'),
  P('Giữa những tiếng cười rộn ràng của đêm hội ngộ, xin mời tất cả chúng ta dành ít phút để cùng lắng lại.'),
  P('Hai mươi ba năm – một quãng thời gian không ngắn trong cuộc đời mỗi người.'),
  P('Có những người bạn ngày xưa từng ngồi cạnh nhau mỗi ngày, hôm nay phải nhờ những cuộc gọi, những dòng tin nhắn mới có thể hỏi thăm nhau. Có những người bạn đã lâu chưa gặp, nhưng chỉ cần một cái bắt tay, một nụ cười là bao nhiêu ký ức lại ùa về.'),
  P('Có những thầy cô vẫn đang tiếp tục hành trình gieo chữ, cũng có những thầy cô đã nghỉ hưu, nhưng tình yêu thương dành cho học trò vẫn còn nguyên vẹn.'),
  P('Và trong hành trình 23 năm ấy, có lẽ ai trong chúng ta cũng đã trải qua những niềm vui, những thành công, những mất mát và những thử thách của riêng mình.'),
  Sub('Một phút hoài niệm (mới bổ sung):'),
  P('Trong niềm vui hội ngộ hôm nay, chúng ta cũng không quên những thầy cô, những người bạn đã không còn có thể trở về cùng chúng ta. [[!(Nếu có danh sách, MC đọc tên tại đây.)!]]'),
  P('Xin kính mời quý thầy cô và toàn thể các anh chị em cùng đứng lên, dành một phút tưởng nhớ – để những người đã đi xa biết rằng, trong ngày trở về này, mái trường và bạn bè vẫn luôn nhớ đến họ.'),
  Moi('Một phút im lặng – không nhạc. Hết một phút: “Xin cảm ơn, kính mời quý vị an toạ.”'),
  Sub('MC tiếp:'),
  P('Hôm nay, khi trở về bên nhau, chúng ta có thể tự hào rằng mình đã từng có một thời thanh xuân đẹp đẽ dưới mái trường Nguyễn Hiền.'),
  P('Nếu có một điều muốn nhắn gửi đến bạn bè sau 23 năm, có lẽ đó là: hãy luôn trân trọng những lần được gặp nhau, bởi thời gian không chờ đợi bất kỳ ai. Hãy giữ liên lạc, hãy quan tâm nhau nhiều hơn và đừng để những cuộc hội ngộ chỉ còn là lời hẹn trong tương lai.'),
  P('Và nếu có một lời muốn gửi đến thầy cô, đó chính là lời cảm ơn từ tận đáy lòng vì đã cho chúng em những năm tháng học trò không thể nào quên.'),
  P('Xin kính chúc quý thầy cô luôn mạnh khoẻ. Xin chúc tất cả những người bạn của niên khoá 2000 – 2003 luôn bình an, hạnh phúc và dù ở bất cứ nơi đâu, vẫn luôn nhớ về nhau bằng những tình cảm đẹp nhất.'),
]);

muc('16', 'VINH DANH TÌNH BẠN – CHỤP ẢNH LƯU NIỆM', '20:00 – 20:15', [
  ['Âm thanh', 'Nối vòng tay lớn (cả khán phòng nắm tay) → mời lên hết sân khấu hát “Nụ cười 18 – 20”.'],
  ['Hậu cần', 'Thợ ảnh + flycam/máy quay đứng sẵn; xếp thầy cô hàng ghế đầu.'],
], [
  P('Kính thưa quý vị!'),
  P('Một đêm hội ngộ sẽ càng trọn vẹn hơn khi chúng ta lưu giữ được những khoảnh khắc đẹp nhất bên thầy cô và bạn bè.'),
  P('Xin kính mời quý thầy cô, Ban liên lạc hội khoá và toàn thể các anh chị em cựu học sinh cùng tiến lên sân khấu để chụp ảnh lưu niệm.'),
  P('Xin mọi người hãy nở những nụ cười thật tươi, bởi đây không chỉ là một bức ảnh tập thể, mà còn là dấu mốc của tình thầy trò, tình bạn sau 23 năm.'),
  P('Và xin đừng quên, sau bức ảnh này, chúng ta vẫn còn rất nhiều dịp để gặp nhau. Hãy cùng giữ cho tình cảm của niên khoá 2000 – 2003 luôn bền chặt!'),
]);

muc('17', 'BẾ MẠC – LỜI CHIA TAY', '20:15 – 20:20', [
  ['Màn LED', 'Slide “Hẹn gặp lại” → sau đó trình chiếu ảnh cả khoá tới khi khách về.'],
  ['Âm thanh', 'Nhạc nền chia tay: Mong ước kỷ niệm xưa.'],
], [
  P('Kính thưa quý thầy cô giáo kính mến!'),
  P('Thưa toàn thể các anh chị em cựu học sinh niên khoá 2000 – 2003, Trường THPT Nguyễn Hiền, Đà Nẵng thân thương!'),
  P('Vậy là hành trình hội ngộ trong đêm Gala Dinner với chủ đề “TÔN SƯ TRỌNG ĐẠO – GẮN KẾT BẠN BÈ – HƯỚNG VỀ MÁI TRƯỜNG XƯA” đang dần khép lại.'),
  P('Một đêm hội ngộ có thể chỉ kéo dài vài giờ, nhưng những cảm xúc mà chúng ta có được hôm nay sẽ còn ở lại thật lâu trong trái tim mỗi người.'),
  P('Chúng ta đã cùng nhau ôn lại những kỷ niệm, cùng cười với những câu chuyện tuổi học trò, cùng tri ân thầy cô và cùng cảm nhận rằng tình bạn chân thành luôn có sức mạnh vượt qua khoảng cách của thời gian.'),
  P('Hai mươi ba năm trước, chúng ta chia tay mái trường để bước vào cuộc đời. Hôm nay, chúng ta trở về không còn là những cô cậu học trò ngây ngô ngày ấy, mà là những người trưởng thành với bao trải nghiệm, bao trách nhiệm và những hành trình riêng.'),
  P('Nhưng xin hãy luôn nhớ rằng, trong mỗi chúng ta vẫn có một phần tuổi trẻ mang tên Nguyễn Hiền.'),
  P('Xin cảm ơn quý thầy cô đã dành thời gian quý báu để trở về với học trò. Xin cảm ơn Ban liên lạc, Ban tổ chức và tất cả các anh chị em đã cùng chung tay để tạo nên một cuộc hội ngộ đầy ý nghĩa.'),
  P('Và xin gửi đến những người bạn chưa thể có mặt hôm nay một lời nhắn: dù chúng ta đang ở đâu, làm gì, hãy luôn nhớ rằng mình đã từng cùng nhau đi qua một quãng đời thật đẹp.'),
  P('Kính chúc quý thầy cô luôn mạnh khoẻ, an vui và hạnh phúc. Chúc tất cả các anh chị em cùng gia đình luôn bình an, thành công và tràn đầy niềm vui.'),
  P('Hy vọng rằng sau hôm nay, chúng ta sẽ không phải đợi thêm quá lâu mới có dịp gặp lại. Hãy giữ liên lạc, giữ tình bạn và tiếp tục viết nên những trang kỷ niệm mới của niên khoá 2000 – 2003.'),
  P('Và trước khi chia tay, xin mời tất cả chúng ta cùng dành một tràng pháo tay thật lớn cho quý thầy cô, cho những người bạn thân thương và cho mái trường Nguyễn Hiền – nơi đã cho chúng ta một thời thanh xuân không thể nào quên!'),
  P('Đêm Gala Dinner kỷ niệm 23 năm ngày ra trường của cựu học sinh niên khoá 2000 – 2003, Trường THPT Nguyễn Hiền, Đà Nẵng xin được khép lại tại đây.'),
  P('Hẹn gặp lại trong những lần hội ngộ tiếp theo – để tình thầy trò luôn sâu nặng, tình bạn mãi bền lâu và mái trường xưa luôn là nơi chúng ta muốn trở về!'),
  P('Xin trân trọng cảm ơn!'),
]);

/* ---------------- Trang đầu ---------------- */
const dau = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: 'KỊCH BẢN MC – GALA DINNER', font: FONT, size: 36, bold: true, color: DO })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: '“TÔN SƯ TRỌNG ĐẠO – GẮN KẾT BẠN BÈ – HƯỚNG VỀ MÁI TRƯỜNG XƯA”', font: FONT, size: 26, bold: true, color: '5B2A12' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: 'NGÀY TRỞ VỀ · Trường THPT Nguyễn Hiền – Niên khoá 2000 – 2003', font: FONT, size: 24, italics: true, color: XAM })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: VANG, space: 6 } }, children: runs('Thứ Bảy, 14/11/2026 · Đón khách 16:00 – 17:00 · Khai mạc 17:05 · Nhà hàng Quảng Đại 2, 190 Đường 30-4, Phường Hòa Cường, TP. Đà Nẵng', { size: 22 }) }),
];

/* Bảng tổng quan */
function bangTongQuan() {
  const cw = [800, 1800, W - 2600];
  const o = (t, w, b, fill, color) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: bien, shading: { type: ShadingType.CLEAR, color: 'auto', fill }, margins: { top: 40, bottom: 40, left: 90, right: 90 }, children: [new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 21, bold: b, color })] })] });
  const rows = [new TableRow({ tableHeader: true, children: [o('Mục', cw[0], true, '9E1B22', 'FFFFFF'), o('Thời gian', cw[1], true, '9E1B22', 'FFFFFF'), o('Nội dung', cw[2], true, '9E1B22', 'FFFFFF')] })];
  MUC.forEach((m, i) => rows.push(new TableRow({ children: [o(m.so, cw[0], true, i % 2 ? 'FFFCF6' : 'F6EBD6', DO), o(m.gio, cw[1], false, i % 2 ? 'FFFCF6' : 'F6EBD6'), o(m.ten + (m.moi ? '  (mới)' : ''), cw[2], false, i % 2 ? 'FFFCF6' : 'F6EBD6')] })));
  rows.push(new TableRow({ children: [o('', cw[0], false, 'FFFCF6'), o('20:20 – 21:00', cw[1], false, 'FFFCF6'), o('Giao lưu tự do, chụp ảnh theo lớp, tiễn thầy cô ra về', cw[2], false, 'FFFCF6')] }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows });
}

const body = [...dau,
  new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: 'TỔNG QUAN CHƯƠNG TRÌNH', font: FONT, size: 26, bold: true, color: DO })] }),
  bangTongQuan(),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: runs('Chữ tô vàng = chỗ Ban Tổ chức cần xác nhận trước ngày Gala. Dòng in nghiêng màu xám (▸) là ghi chú cho MC/kỹ thuật, không đọc thành lời.', { size: 21, it: true }) }),
];
MUC.forEach(m => {
  body.push(...tieuDe(m.so, m.ten, m.gio, m.moi));
  if (m.cue.length) { body.push(cueBox(m.cue)); body.push(trong()); }
  body.push(...m.body);
});

/* Phụ lục */
body.push(...tieuDe('✦', 'GHI CHÚ RÀ SOÁT', ''));
body.push(Sub('Các mục cần Ban Tổ chức xác nhận:'));
body.push(...Ds([
  'Mục 06: thầy/cô đại diện phát biểu (đề xuất: Thầy Phạm Úc – nguyên Hiệu trưởng, hoặc 1 GVCN).',
  'Mục 07: số tiền khoá trao Quỹ khuyến học (đang ghi 10.000.000 đ); Cô Hiệu trưởng có đáp từ hay không.',
  'Mục 03: họ đầy đủ của “Cô Ái Trang” (GVCN 12/10).',
  'Mục 15: danh sách thầy cô, bạn bè đã mất (nếu muốn đọc tên).',
  'Giờ: đón khách 16:00 – 17:00, khai mạc 17:05 (khớp giấy mời 17:00). Thư ngỏ đang ghi 17h30 – nên sửa lại cho thống nhất.',
]));
body.push(Sub('Những chỗ đã sửa so với bản gốc:'));
body.push(...Ds([
  'Chính tả: “kĩ niềm/kĩ niệm” → “kỷ niệm”; “1 ngã” → “một ngả”; “lí do” → “lý do”; “kiều” → “Kiều”; “12c1…” → “12/1…”; bỏ ngoặc thừa “((”; “Thầy cô Nguyên BGH” → “nguyên Ban Giám hiệu”; thống nhất “niên khoá 2000 – 2003”.',
  'Mục 01: “kỷ niệm 23 năm ngày trở về” → “kỷ niệm 23 năm ngày ra trường”; thêm lời mời quét QR viết lưu bút.',
  'Các bài thơ tách đúng từng dòng (bản gốc dính liền một đoạn).',
  'Bổ sung: mục 00 đón khách – check-in; clip mở đầu 15 giây (mục 02); mục 07 trao Quỹ khuyến học; nhắc lưu bút QR lúc dùng tiệc (mục 09); “Một phút hoài niệm” (mục 15); nhắc 30 năm thành lập trường (mục 02, 07).',
  'Thêm giờ cho từng mục và khung chỉ dẫn Màn LED / Âm thanh / Hậu cần.',
  'Đánh lại số mục 00 – 17 (thêm mục 00 và 07).',
]));

const doc = new Document({
  creator: 'Ban liên lạc khoá 2000 – 2003',
  title: 'Kịch bản MC Gala 14/11/2026',
  styles: { default: { document: { run: { font: FONT, size: 26 } } } },
  numbering: { config: [{ reference: 'cham', levels: [{ level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Kịch bản MC · Gala Ngày trở về · 14/11/2026', font: FONT, size: 18, italics: true, color: '9A8A7A' })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Trang ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: '9A8A7A' })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then(b => { const f = path.join(__dirname, 'kich-ban-gala-hoan-thien.docx'); fs.writeFileSync(f, b); console.log(f, b.length); });

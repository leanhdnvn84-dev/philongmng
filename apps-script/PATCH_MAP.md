# Bản đồ hàm của index.html

Sinh tự động bởi `tools/patch-map.js`. Chạy lại sau mỗi lần sửa (trong thư mục `apps-script`): `npm --prefix tools install` (lần đầu) rồi `node tools/patch-map.js index.html > PATCH_MAP.md`. Kiểm tra nhanh: `node tools/patch-map.js index.html --check`.

- Số khối `<script>` nội tuyến: **80**
- Hàm toàn cục còn bị định nghĩa lại / bọc chồng: **0**
- Hàm lõi dùng bước mở rộng `PL_STEPS`: **27**

## Quy ước

- Mỗi hàm toàn cục có **một định nghĩa duy nhất**. Không gán lại `window.X=` và không bọc `const old=window.X; window.X=function(){old()…}`.
- Khối giao diện nào cần chen vào hàm lõi thì khai báo bước: `plDefineSteps_('tenKhoi',{tenBuoc:function(){…}})`.
- Hàm lõi gọi bước bằng `plStep_('tenKhoi','tenBuoc',…)` theo thứ tự ghi trong thân hàm; khối chưa nạp thì bước bị bỏ qua.
- Bước tên `before…`/`after…` chạy trước/sau; bước trả `true` (vd. `renderGeneric`, `openForm`, `blockSave`) nghĩa là đã tự xử lý hoặc chặn — hàm lõi bỏ qua phần mặc định.

## Hàm lõi và các bước (theo thứ tự chạy)

### `setStatus` — định nghĩa ở dòng 4604

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `subbarV42.afterStatus` | 6521 |

### `renderCellValue` — định nghĩa ở dòng 4802

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `equipmentForm.renderCell` | 8122 |

### `v16SortRows_` — định nghĩa ở dòng 4924

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `maintenanceV22.sortRows` | 5842 |

### `v17OpenForm` — định nghĩa ở dòng 5349

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.openForm` | 7963 |
| 2 | `formStateV26.beforeOpenForm` | 6220 |
| 3 | `formStateV25.beforeOpenForm` | 6066 |
| 4 | `formSessionV21.openForm` | 5563 |
| 5 | `maintenanceV22.afterOpenForm` | 5766 |
| 6 | `formStateV25.afterOpenForm` | 6067 |
| 7 | `equipmentForm.afterOpenForm` | 8105 |
| 8 | `twoPaneV841612.afterOpenForm` | 9566 |

### `v17CloseForm` — định nghĩa ở dòng 5375

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.beforeCloseForm` | 7967 |
| 2 | `formSessionV21.beforeCloseForm` | 5566 |
| 3 | `formSessionV21.afterCloseForm` | 5567 |
| 4 | `formStateV25.afterCloseForm` | 6068 |
| 5 | `formStateV26.afterCloseForm` | 6221 |

### `v17EditTableRecord` — định nghĩa ở dòng 5394

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.editTableRecord` | 7965 |

### `v17OpenCustomExisting_` — định nghĩa ở dòng 5396

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `formStateV26.beforeOpenForm` | 6220 |
| 2 | `formStateV25.beforeOpenForm` | 6066 |
| 3 | `formSessionV21.beforeOpenCustom` | 5564 |
| 4 | `formSessionV21.afterOpenCustom` | 5565 |
| 5 | `formStateV25.afterOpenForm` | 6067 |
| 6 | `equipmentForm.afterOpenCustom` | 8106 |
| 7 | `twoPaneV841612.afterOpenCustom` | 9566 |

### `v17SyncAddButton` — định nghĩa ở dòng 5408

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `subbarV42.afterSyncAddButton` | 6520 |

### `v16RenderGenericTable_` — định nghĩa ở dòng 5423

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `recoveryUi.renderGeneric` | 9804 |
| 2 | `proposalMaintenanceUi.renderGeneric` | 9736 |
| 3 | `proposalDisposeUi.renderGeneric` | 9677 |
| 4 | `proposalEquipmentUi.renderGeneric` | 9616 |
| 5 | `proposalActionsV83.renderGeneric` | 7630 |
| 6 | `maintenanceV22.renderGeneric` | 5869 |
| 7 | `actionsV25.afterRenderGeneric` | 6053 |
| 8 | `actionsV26.afterRenderGeneric` | 6326 |
| 9 | `materialCatalogLock.afterRenderGeneric` | 8493 |
| 10 | `materialWarehouseV111.afterRenderGeneric` | 10566 |
| 11 | `genericFooterV107.afterRenderGeneric` | 10652 |
| 12 | `catalogNoActionV210.afterRenderGeneric` | 11030 |

### `v17SaveForm` — định nghĩa ở dòng 5594

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `equipmentForm.blockSave` | 8120 |
| 2 | `proposalMaterialForm.saveBundle` | 7964 |
| 3 | `maintenanceV22.blockSave` | 5766 |

### `v25OpenView` — định nghĩa ở dòng 6028

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenView25` | 9566 |

### `v26OpenView` — định nghĩa ở dòng 6201

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `dailyViewV841550.openView` | 8722 |
| 2 | `twoPaneV841612.afterOpenView26` | 9566 |

### `v841430AdjustStock` — định nghĩa ở dòng 6261

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterAdjustStock` | 9566 |

### `v26EditRecord` — định nghĩa ở dòng 6286

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `materialCatalogLock.editRecord` | 8488 |
| 2 | `twoPaneV841612.afterEditRecord` | 9566 |

### `next` — định nghĩa ở dòng 6287

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.editRecord` | 7966 |

### `PL_APPLY_WRAP_V41` — định nghĩa ở dòng 6431

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `tableLayoutV206.afterWrap` | 6802 |

### `v16PageSlice_` — định nghĩa ở dòng 6974

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalActionsV83.pageSlice` | 7628 |

### `v56SetQuery` — định nghĩa ở dòng 6982

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `loaderV64.deferQuery` | 7213 |

### `v82RenderLoadedPage` — định nghĩa ở dòng 7373

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.beforeRender` | 11002 |
| 2 | `catalogSidebarV135.beforeRender` | 10867 |
| 3 | `proposalActionsV83.afterRender` | 7629 |
| 4 | `materialWarehouseV841410.afterRender` | 7818 |
| 5 | `permissionMatrix.afterRender` | 7866 |
| 6 | `rentalLayout.afterRender` | 8398 |
| 7 | `materialCatalogLock.afterRender` | 8494 |
| 8 | `proposalMaterialUi.afterRender` | 9301 |
| 9 | `proposalFinance.afterRender` | 9488 |
| 10 | `proposalEquipmentUi.afterRender` | 9615 |
| 11 | `proposalDisposeUi.afterRender` | 9676 |
| 12 | `proposalMaintenanceUi.afterRender` | 9735 |
| 13 | `equipmentUi.afterRender` | 9770 |
| 14 | `recoveryUi.afterRender` | 9803 |
| 15 | `maintenanceLogUi.afterRender` | 9957 |
| 16 | `maintenancePlanUi.afterRender` | 10051 |
| 17 | `catalogSidebarV135.afterRender` | 10867 |
| 18 | `operationSidebarV136.afterRender` | 11002 |

### `showPage` — định nghĩa ở dòng 7434

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `systemLockV137.blockShow` | 11087 |
| 2 | `operationSidebarV136.beforeShow` | 11002 |
| 3 | `catalogSidebarV135.beforeShow` | 10867 |
| 4 | `proposalMaterialUi.afterShow` | 9300 |
| 5 | `taskSubbarV841608.afterShow` | 9414 |
| 6 | `proposalFinance.afterShow` | 9488 |
| 7 | `proposalEquipmentUi.afterShow` | 9614 |
| 8 | `proposalDisposeUi.afterShow` | 9675 |
| 9 | `proposalMaintenanceUi.afterShow` | 9734 |
| 10 | `equipmentUi.afterShow` | 9769 |
| 11 | `recoveryUi.afterShow` | 9802 |
| 12 | `maintenanceLogUi.afterShow` | 9956 |
| 13 | `maintenancePlanUi.afterShow` | 10050 |
| 14 | `catalogSidebarV135.afterShow` | 10867 |
| 15 | `operationSidebarV136.afterShow` | 11002 |

### `openProposalMaterialView_` — định nghĩa ở dòng 7607

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenMaterialView` | 9566 |

### `renderExtra` — định nghĩa ở dòng 7691

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `materialWarehouseV841410.afterRenderExtra` | 7817 |

### `renderOperationDetailV841420` — định nghĩa ở dòng 8007

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.afterRenderOperation` | 10997 |

### `operationFilterV841420` — định nghĩa ở dòng 8008

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.afterFilterOperation` | 10996 |

### `operationResetV841420` — định nghĩa ở dòng 8011

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.afterFilterOperation` | 10996 |

### `openOperationDetailV841420` — định nghĩa ở dòng 8021

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenOperationDetail` | 9566 |

### `openOperationEditV841531` — định nghĩa ở dòng 8554

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenOperationEdit` | 9566 |

## Hàm toàn cục còn bị ghi đè

Không còn. ✅

## Biến trạng thái gán ở nhiều nơi

Không phải ghi đè hàm — chỉ là trạng thái được cập nhật từ nhiều chỗ.

| Tên | Các dòng |
|---|---|
| `PHILONG_MATERIAL_SYSTEM_PASSWORD` | 8439 (hoãn), 8449 (hoãn) |
| `PHILONG_SYSTEM_TOKEN` | 4641 (hoãn), 4670 (hoãn) |
| `PHILONG_SYSTEM_TOKEN_UNTIL` | 4641 (hoãn), 4670 (hoãn) |
| `PHILONG_SYSTEM_UNLOCKED` | 4632, 4641 (hoãn), 4670 (hoãn) |
| `PINNED_MENU` | 4625 (hoãn), 4664 (hoãn), 4670 (hoãn), 4713 (hoãn), 4715 (hoãn), 11063 (hoãn) |
| `PL_ACTION_DIALOG_STATE` | 4648 (hoãn), 4654 (hoãn) |
| `PROPOSAL_VIEW_ROWS` | 7620 (hoãn), 9607 (hoãn), 9668 (hoãn), 9727 (hoãn) |

## Danh sách khối script

| # | Dòng | id | Mô tả (chú thích đầu khối) | Bước khai báo |
|---|---|---|---|---|
| 1 | 6–25 |  | V150 — NGUỒN DUY NHẤT để biết đang ở giao diện điện thoại: thuộc tính id "plMobileViewport" của <html>. Chỉ… |  |
| 2 | 4230–4250 | `pl-v841596-startup-instant-paint` | V84.15.97 - Vẽ lời chào/ngày ngay sau gate, không đoán buổi khi thiếu giờ. |  |
| 3 | 4267–4274 |  |  |  |
| 4 | 4524–5127 |  | Bước mở rộng do từng khối giao diện khai báo: PL_STEPS.<khối>.<bước>. Các hàm lõi (showPage, v82RenderLoade… |  |
| 5 | 5132–5446 |  | V17 - KPI + FORM NHẬP LIỆU / CRUD THẬT |  |
| 6 | 5448–5466 |  | V11 - đồng bộ chiều cao hai thanh cố định để mọi màn hình dùng cùng một khung |  |
| 7 | 5470–5628 |  | V21 - FORM REOPEN / SAVE STATE / KPI CONSISTENCY FIX 1) Mỗi lần mở/đóng form luôn reset nút Lưu & đóng. 2) … | `formSessionV21` |
| 8 | 5631–5896 |  | V22 - MAINTENANCE MODEL SYNC - Nhật ký chỉ hiển thị lịch sử thực tế, không dùng NGAY_KE_TIEP làm KPI. - Tổn… | `maintenanceV22` |
| 9 | 5919–6079 |  | V25 - ACTIONS / DETAIL KPI / GLOBAL SAVE&CLOSE RULE Nguyên tắc đã chốt: - Các form ghi dữ liệu chỉ dùng nút… | `actionsV25`, `formStateV25` |
| 10 | 6086–6332 |  | V26 - XEM + SỬA TOÀN HỆ THỐNG NGHIỆP VỤ - Chuẩn hóa thứ tự: 👁 Xem \| ✎ Sửa \| tác vụ nghiệp vụ khác. - Bổ su… | `formStateV26`, `actionsV26` |
| 11 | 6364–6447 |  | V41 - TỰ NHẬN DIỆN CỘT NỘI DUNG ĐỂ XUỐNG DÒNG Áp dụng sau mỗi lần bảng được render/re-render. |  |
| 12 | 6452–6529 |  | V42 - TÊN NÚT THÊM NGẮN CHO SUBBAR Giữ chức năng cũ; chỉ đổi nhãn hiển thị để mọi màn hình 1 dòng. | `subbarV42` |
| 13 | 6545–6824 | `pl-unified-table-layout-v206` | V206 — Một controller duy nhất cho layout các bảng Thiết bị và Kho còn lại. - Tỷ lệ/căn lề lấy từ bảng cấu … | `tableLayoutV206` |
| 14 | 6826–6876 |  | V48 - RENDER CUỐI CHO CÔNG VIỆC HẰNG NGÀY |  |
| 15 | 6886–7014 |  | V57 RELEASE - GLOBAL FILTER & SORT ENGINE raw -> search -> filters -> due -> sort -> pagination -> render |  |
| 16 | 7016–7215 |  | V64 - PAGE-LEVEL LOADER - Mỗi trang chỉ gọi đúng bundle dữ liệu của trang đó. - Cache kết quả trên trình du… | `loaderV64` |
| 17 | 7217–7285 |  | V67 - KPI THỐNG NHẤT + CHỐNG LỖI SCHEMA CŨ/MỚI Một nguồn tính cuối cùng cho mọi dải KPI động. |  |
| 18 | 7291–7360 |  | V78 - báo cáo kiểm tra chỉ đọc, không có lệnh sửa dữ liệu. |  |
| 19 | 7362–7476 |  | V82 - một loader, một renderer cho đúng trang đang mở. |  |
| 20 | 7478–7634 |  | V83 - tác vụ cuối cho Kế hoạch bảo trì và toàn bộ bảng Đề xuất. Renderer này chạy sau mọi decorator cũ nên … | `proposalActionsV83` |
| 21 | 7641–7683 |  | V84.14.4 - PDF và Word đều là tệp thật do máy chủ tạo; không in HTML, không đổi đuôi giả. |  |
| 22 | 7685–7700 |  | V84 - điểm điều phối cuối: gom mọi yêu cầu render cũ vào một lần/frame. |  |
| 23 | 7711–7823 |  | V84.14.10 - tồn kho là trang chính 30 dòng; lịch sử mở bằng nút trong modal riêng. | `materialWarehouseV841410` |
| 24 | 7831–7869 |  | V84.14 - render và lưu phân quyền dạng ma trận; dữ liệu vẫn lưu theo ID_VAI_TRO + MODULE. | `permissionMatrix` |
| 25 | 7873–7970 |  | V84.14.9 - nhập một đề xuất mua vật tư với nhiều dòng chi tiết. | `proposalMaterialForm` |
| 26 | 7974–8026 |  | V84.14.20 - Render danh sách vận hành dùng chung dữ liệu cho mọi kích thước màn hình. |  |
| 27 | 8034–8128 |  | V84.14.35 - Form thiết bị; bảng được render duy nhất tại V82. | `equipmentForm` |
| 28 | 8132–8149 |  | V84.14.36 - Lịch hôm nay động theo múi giờ Việt Nam. |  |
| 29 | 8155–8171 |  | V84.14.38 - Bắt cả KPI được render sau RPC hoặc khi đổi trang. |  |
| 30 | 8179–8202 | `pl-v8453-table-vertical-middle-runtime` | V84.14.53 - Re-apply canh dọc sau mọi lần render/lọc/phân trang. |  |
| 31 | 8204–8292 | `pl-v8454-number-thousands-format` | V84.14.54 - Hiển thị dấu chấm hàng nghìn cho mọi input số. |  |
| 32 | 8315–8413 | `pl-v841489-rental-table-layout-runtime` | V84.14.89 - Gắn nhãn và lưới ổn định cho đúng ba bảng CHO THUÊ. | `rentalLayout` |
| 33 | 8431–8499 |  | V84.15.28 - khóa Sửa/Xóa danh mục VAT_TU bằng mật khẩu riêng của Hệ thống. Mật khẩu chỉ giữ trong bộ nhớ tạ… | `materialCatalogLock` |
| 34 | 8503–8511 |  | V84.15.29 - nút thêm đề xuất mới và thêm vật tư chưa có. |  |
| 35 | 8515–8557 |  | V84.15.31 - Sửa toàn bộ trường CHI_TIET_VAN_HANH; mỗi ảnh giữ một cột HINH_ANH_1...5. |  |
| 36 | 8561–8575 | `pl-v841535-theme-controller` | V84.15.35 - Bộ điều khiển theme, mặc định sáng và lưu lựa chọn trên trình duyệt. |  |
| 37 | 8578–8607 | `pl-v841536-daily-operational-controller` | V84.15.36 - dùng APP.core.daily (getCorePageBundleV82) và saveDailyWork thật. |  |
| 38 | 8610–8636 | `pl-v841540-daily-month-controller` | V84.15.40 - dữ liệu thật: CVHN_2026 + nhân viên hoạt động. |  |
| 39 | 8642–8681 | `pl-v841544-daily-method-column` | V84.15.44: hiển thị CACH_THUC_HIEN từ CVHN_2026 ngay sau Nội dung thực hiện. |  |
| 40 | 8685–8709 | `pl-v841549-daily-toolbar-view` | V84.15.49 - thanh công cụ: Tìm, Thêm CV, Xem, Sửa, Làm mới, Chưa xong. |  |
| 41 | 8713–8724 | `pl-v841550-daily-view-popup` | V84.15.50 - popup xem riêng cho APP.core.daily, không phụ thuộc V16_DATA. | `dailyViewV841550` |
| 42 | 8730–8755 | `pl-v841552-daily-summary-controller` | V84.15.52 - thống kê hoàn thành hôm nay / tháng / năm theo người thực hiện. |  |
| 43 | 8759–8778 | `pl-v841553-daily-global-search-controller` | V84.15.53 - Tìm và Chưa xong đọc toàn bộ CVHN_2026, không theo ngày lịch. |  |
| 44 | 8785–8787 | `pl-v841567-daily-toolbar-controller` |  |  |
| 45 | 8790–8794 | `pl-v841565-daily-summary-selected-date` | V150 — đã gộp vào pl-v841552-daily-summary-controller (một bộ duy nhất). Chỉ giữ việc vẽ lại khi bấm ngày/n… |  |
| 46 | 8799–8807 | `pl-v841564-today-controller` |  |  |
| 47 | 8817–8978 | `pl-v841585-work-single-controller` | V224 — Bảng Công Việc (desktop) không còn cột "Thao tác" (Xem/Sửa) vì đã có 2 nút Xem/Sửa ở thanh công cụ p… |  |
| 48 | 8979–8986 | `pl-v841585-table-context-title` |  |  |
| 49 | 8987–9174 | `pl-v841592-startup-two-layer-controller` | V84.15.97 - Lời chào/ngày hiển thị ngay; không đoán buổi khi thiếu giờ. |  |
| 50 | 9177–9223 | `pl-v8415101-task-subbar-export` | V107 — dọn trùng lặp: việc bật/tắt .pl-task-context và exportDataBtn nay do DUY NHẤT script #pl-v841608-tas… |  |
| 51 | 9225–9255 | `pl-v8415102-unified-footer-runtime` | V150: dùng nguồn chung |  |
| 52 | 9257–9306 | `pl-v841591-proposal-material-work-ui` | V84.15.103 — controller riêng cho Đề xuất mua vật tư, dữ liệu và hành động giữ nguyên. | `proposalMaterialUi` |
| 53 | 9308–9334 | `pl-v841594-single-footer-cleanup-runtime` | V84.15.104 — luôn đưa đúng một footer ra ngoài main, tránh hai lớp chân trang. |  |
| 54 | 9336–9357 | `pl-v841595-proposal-toolbar-actions` | V84.15.105 — bổ sung thao tác theo phiếu đang chọn, không thay đổi renderer dữ liệu. |  |
| 55 | 9359–9385 | `pl-v841606-proposal-view-check` | V84.15.106 — toolbar Xem luôn lấy đúng dòng đang chọn. |  |
| 56 | 9387–9396 | `pl-v841607-unified-view-order` | V84.15.107 — đánh dấu các trường dài để thẻ Xem có đúng nhịp với form nhập. |  |
| 57 | 9398–9419 | `pl-v841608-task-subbar-export-clean-runtime` | V107 — refreshBtn/addBtn/liveStatus/addMissingMaterialBtn giờ ẩn vĩnh viễn bằng CSS (mọi trang đã có toolba… | `taskSubbarV841608` |
| 58 | 9421–9493 | `pl-v841609-proposal-finance-stats-runtime` | V84.15.109 — tính riêng theo từng bảng, không cộng lẫn các loại đề xuất. | `proposalFinance` |
| 59 | 9496–9569 | `pl-v841612-two-pane-runtime` | V84.15.116 — dùng một bố cục trường cho Thêm/Sửa/Xem trên toàn hệ thống. | `twoPaneV841612` |
| 60 | 9570–9621 | `pl-v841592-proposal-equipment-work-ui` | V84.15.122 — Đề xuất mua thiết bị dùng cùng renderer/giao diện với bảng vật tư. | `proposalEquipmentUi` |
| 61 | 9622–9682 | `pl-v107-proposal-dispose-work-ui` | V107 — Đề xuất thanh lý dùng chung khung giao diện (pbm-shell/pbm-tools/ pbm-grid/pbm-footer) với Đề xuất m… | `proposalDisposeUi` |
| 62 | 9683–9741 | `pl-v107-proposal-maintenance-work-ui` | V107 — Đề xuất bảo trì dùng chung khung giao diện với Đề xuất mua vật tư. Cột dữ liệu đổi theo cấu trúc DE_… | `proposalMaintenanceUi` |
| 63 | 9742–9775 | `pl-v841592-equipment-work-ui` | V84.15.127 — Copy khung Công việc cho Kho thiết bị đang dùng; dữ liệu và CRUD dùng lại API hiện hữu. | `equipmentUi` |
| 64 | 9777–9809 | `pl-v107-recovery-work-ui` | V107 — Copy khung giao diện Thiết bị đang dùng (ple-shell) cho Thu hồi thiết bị, đổi cột theo đúng cấu trúc… | `recoveryUi` |
| 65 | 9810–9876 | `pl-v96-device-transfer-history` | V96 — Danh sách Lịch sử chuyển thiết bị (LICH_SU_CHUYEN_THIET_BI). Đăng ký dữ liệu vào V16_DATA.views để nú… |  |
| 66 | 9878–9966 | `pl-v86-maintenance-log-work-ui` | V86 — Nhật ký bảo trì: dựng lại theo đúng khung "Thiết bị đang dùng" (cùng CSS ple-*) để đồng bộ giao diện … | `maintenanceLogUi` |
| 67 | 9968–10058 | `pl-v86-maintenance-plan-work-ui` | V86 — Kế hoạch bảo trì: dựng lại theo đúng khung "Thiết bị đang dùng". Dữ liệu tự tính từ nhật ký + chu kỳ … | `maintenancePlanUi` |
| 68 | 10060–10093 | `pl-v225-material-warehouse-desktop-trim` | V225 — KHO VAT TU: an/xoa vat ly cot "Canh bao" khoi bang ton kho CHI tren Desktop. Bang nay dung renderDat… |  |
| 69 | 10095–10113 | `pl-v98-shared-page-watch` | V98 — Gộp 3 MutationObserver riêng lẻ (equipment/maintenanceLog/maintenancePlan) thành 1 observer dùng chun… |  |
| 70 | 10114–10464 | `pl-mobile-single-controller` | V155 — BỘ ĐIỀU KHIỂN MOBILE DUY NHẤT (viết gọn lại từ V216…V154) Nhiệm vụ, theo đúng thứ tự trong file: 1. … |  |
| 71 | 10466–10623 | `pl-v111-material-history-selected-no-action` | V111 — Một toolbar, một khung bảng và một khối CSS duy nhất cho Kho vật tư: Tìm / Xem / Sửa / Nhập-Xuất / L… | `materialWarehouseV111` |
| 72 | 10625–10666 | `pl-v107-generic-footer-runtime` | V107 — chân bảng thống nhất (pl-data-footer) cho các trang còn lại dùng chung v16RenderGenericTable_. Đơn v… | `genericFooterV107` |
| 73 | 10676–10869 | `pl-v135-catalog-sidebar` | V135 — Sidebar bộ lọc + thống kê (bên trái, 240px) cho 7 trang Danh Mục, dựng khung .plc-shell riêng thay h… | `catalogSidebarV135` |
| 74 | 10871–11004 | `pl-v136-operation-sidebar` | V136 — Sidebar bộ lọc + thống kê giống hệt .plc-shell ở trên, riêng cho "Chi tiết vận hành, kiểm tra thiết … | `operationSidebarV136` |
| 75 | 11005–11034 | `pl-v210-catalog-no-action-columns` | V210 — Danh mục: bỏ cột Thao tác khỏi DOM thật. Các renderer cũ vẫn được giữ nguyên để không thay đổi dữ li… | `catalogNoActionV210` |
| 76 | 11040–11100 | `pl-v137-system-lock-guard` | V137 — KHÓA MENU & TRANG HỆ THỐNG - Lớp bọc showPage ngoài cùng: mọi đường mở trang (menu desktop, menu mob… | `systemLockV137` |
| 77 | 11113–11123 | `pl-v145-daily-pager` | V145 — nút trang cho CV hằng ngày: gửi số trang về đúng bộ hiển thị đang vẽ bảng (lịch tháng hoặc tìm kiếm/… |  |
| 78 | 11124–11270 | `pl-v142-toolbar-delete-all` | V142 — Bổ sung nút "Xóa" và "Tất cả" ngay bên phải nút "Sửa" trên MỌI thanh công cụ có nút Sửa: Công việc, … |  |
| 79 | 11387–11448 | `pl-v151-toolbar-roles` | V151 — gắn vai trò (data-tool-role) cho từng nút thanh công cụ theo id/nhãn, để CSS phía trên tô CÙNG MỘT M… |  |
| 80 | 11485–11562 | `pl-v153-font-boost` | V153 — TĂNG CỠ CHỮ TOÀN HỆ THỐNG: mọi cỡ chữ đang khai báo bằng px được CỘNG THÊM một lượng cố định (mặc đị… |  |

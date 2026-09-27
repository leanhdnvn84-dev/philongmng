# Bản đồ hàm của index.html

Sinh tự động bởi `tools/patch-map.js`. Chạy lại sau mỗi lần sửa (trong thư mục `apps-script`): `npm --prefix tools install` (lần đầu) rồi `node tools/patch-map.js index.html > PATCH_MAP.md`. Kiểm tra nhanh: `node tools/patch-map.js index.html --check`.

- Số khối `<script>` nội tuyến: **83**
- Hàm toàn cục còn bị định nghĩa lại / bọc chồng: **0**
- Hàm lõi dùng bước mở rộng `PL_STEPS`: **28**

## Quy ước

- Mỗi hàm toàn cục có **một định nghĩa duy nhất**. Không gán lại `window.X=` và không bọc `const old=window.X; window.X=function(){old()…}`.
- Khối giao diện nào cần chen vào hàm lõi thì khai báo bước: `plDefineSteps_('tenKhoi',{tenBuoc:function(){…}})`.
- Hàm lõi gọi bước bằng `plStep_('tenKhoi','tenBuoc',…)` theo thứ tự ghi trong thân hàm; khối chưa nạp thì bước bị bỏ qua.
- Bước tên `before…`/`after…` chạy trước/sau; bước trả `true` (vd. `renderGeneric`, `openForm`, `blockSave`) nghĩa là đã tự xử lý hoặc chặn — hàm lõi bỏ qua phần mặc định.

## Hàm lõi và các bước (theo thứ tự chạy)

### `setStatus` — định nghĩa ở dòng 4363

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `subbarV42.afterStatus` | 6306 |

### `renderCellValue` — định nghĩa ở dòng 4562

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `equipmentForm.renderCell` | 8045 |

### `v16SortRows_` — định nghĩa ở dòng 4690

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `maintenanceV22.sortRows` | 5611 |

### `v17OpenForm` — định nghĩa ở dòng 5126

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.openForm` | 7886 |
| 2 | `formStateV26.beforeOpenForm` | 6005 |
| 3 | `formStateV25.beforeOpenForm` | 5850 |
| 4 | `formSessionV21.openForm` | 5340 |
| 5 | `maintenanceV22.afterOpenForm` | 5559 |
| 6 | `formStateV25.afterOpenForm` | 5851 |
| 7 | `equipmentForm.afterOpenForm` | 8028 |
| 8 | `twoPaneV841612.afterOpenForm` | 9491 |

### `v17CloseForm` — định nghĩa ở dòng 5152

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.beforeCloseForm` | 7890 |
| 2 | `formSessionV21.beforeCloseForm` | 5343 |
| 3 | `formSessionV21.afterCloseForm` | 5344 |
| 4 | `formStateV25.afterCloseForm` | 5852 |
| 5 | `formStateV26.afterCloseForm` | 6006 |

### `v17EditTableRecord` — định nghĩa ở dòng 5171

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.editTableRecord` | 7888 |

### `v17OpenCustomExisting_` — định nghĩa ở dòng 5173

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `formStateV26.beforeOpenForm` | 6005 |
| 2 | `formStateV25.beforeOpenForm` | 5850 |
| 3 | `formSessionV21.beforeOpenCustom` | 5341 |
| 4 | `formSessionV21.afterOpenCustom` | 5342 |
| 5 | `formStateV25.afterOpenForm` | 5851 |
| 6 | `equipmentForm.afterOpenCustom` | 8029 |
| 7 | `twoPaneV841612.afterOpenCustom` | 9491 |

### `v17SyncAddButton` — định nghĩa ở dòng 5185

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `subbarV42.afterSyncAddButton` | 6305 |

### `v16RenderGenericTable_` — định nghĩa ở dòng 5200

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `recoveryUi.renderGeneric` | 9729 |
| 2 | `proposalMaintenanceUi.renderGeneric` | 9661 |
| 3 | `proposalDisposeUi.renderGeneric` | 9602 |
| 4 | `proposalEquipmentUi.renderGeneric` | 9541 |
| 5 | `proposalActionsV83.renderGeneric` | 7551 |
| 6 | `maintenanceV22.renderGeneric` | 5634 |
| 7 | `actionsV25.afterRenderGeneric` | 5837 |
| 8 | `actionsV26.afterRenderGeneric` | 6111 |
| 9 | `materialCatalogLock.afterRenderGeneric` | 8416 |
| 10 | `materialWarehouseV111.afterRenderGeneric` | 10628 |
| 11 | `genericFooterV107.afterRenderGeneric` | 10714 |
| 12 | `catalogNoActionV210.afterRenderGeneric` | 11106 |

### `v17SaveForm` — định nghĩa ở dòng 5371

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `equipmentForm.blockSave` | 8043 |
| 2 | `proposalMaterialForm.saveBundle` | 7887 |
| 3 | `maintenanceV22.blockSave` | 5559 |

### `v25OpenView` — định nghĩa ở dòng 5812

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenView25` | 9491 |

### `v26OpenView` — định nghĩa ở dòng 5986

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `dailyViewV841550.openView` | 8645 |
| 2 | `twoPaneV841612.afterOpenView26` | 9491 |

### `v841430AdjustStock` — định nghĩa ở dòng 6046

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterAdjustStock` | 9491 |

### `v26EditRecord` — định nghĩa ở dòng 6071

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `materialCatalogLock.editRecord` | 8411 |
| 2 | `twoPaneV841612.afterEditRecord` | 9491 |

### `next` — định nghĩa ở dòng 6072

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalMaterialForm.editRecord` | 7889 |

### `PL_APPLY_WRAP_V41` — định nghĩa ở dòng 6216

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `tableLayoutV206.afterWrap` | 6587 |

### `v16PageSlice_` — định nghĩa ở dòng 6731

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `proposalActionsV83.pageSlice` | 7549 |

### `v56SetQuery` — định nghĩa ở dòng 6739

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `loaderV64.deferQuery` | 6974 |

### `v82RenderLoadedPage` — định nghĩa ở dòng 7291

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.beforeRender` | 11064 |
| 2 | `catalogSidebarV135.beforeRender` | 10929 |
| 3 | `proposalActionsV83.afterRender` | 7550 |
| 4 | `materialWarehouseV841410.afterRender` | 7741 |
| 5 | `permissionMatrix.afterRender` | 7789 |
| 6 | `rentalLayout.afterRender` | 8321 |
| 7 | `materialCatalogLock.afterRender` | 8417 |
| 8 | `proposalMaterialUi.afterRender` | 9226 |
| 9 | `proposalFinance.afterRender` | 9413 |
| 10 | `proposalEquipmentUi.afterRender` | 9540 |
| 11 | `proposalDisposeUi.afterRender` | 9601 |
| 12 | `proposalMaintenanceUi.afterRender` | 9660 |
| 13 | `equipmentUi.afterRender` | 9695 |
| 14 | `recoveryUi.afterRender` | 9728 |
| 15 | `maintenanceLogUi.afterRender` | 9882 |
| 16 | `maintenancePlanUi.afterRender` | 9976 |
| 17 | `catalogSidebarV135.afterRender` | 10929 |
| 18 | `operationSidebarV136.afterRender` | 11064 |

### `showPage` — định nghĩa ở dòng 7355

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `systemLockV137.blockShow` | 11163 |
| 2 | `operationSidebarV136.beforeShow` | 11064 |
| 3 | `catalogSidebarV135.beforeShow` | 10929 |
| 4 | `proposalMaterialUi.afterShow` | 9225 |
| 5 | `taskSubbarV841608.afterShow` | 9339 |
| 6 | `proposalFinance.afterShow` | 9413 |
| 7 | `proposalEquipmentUi.afterShow` | 9539 |
| 8 | `proposalDisposeUi.afterShow` | 9600 |
| 9 | `proposalMaintenanceUi.afterShow` | 9659 |
| 10 | `equipmentUi.afterShow` | 9694 |
| 11 | `recoveryUi.afterShow` | 9727 |
| 12 | `maintenanceLogUi.afterShow` | 9881 |
| 13 | `maintenancePlanUi.afterShow` | 9975 |
| 14 | `catalogSidebarV135.afterShow` | 10929 |
| 15 | `operationSidebarV136.afterShow` | 11064 |

### `openProposalMaterialView_` — định nghĩa ở dòng 7528

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenMaterialView` | 9491 |

### `renderExtra` — định nghĩa ở dòng 7612

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `materialWarehouseV841410.afterRenderExtra` | 7740 |

### `renderOperationDetailV841420` — định nghĩa ở dòng 7930

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.afterRenderOperation` | 11059 |

### `operationFilterV841420` — định nghĩa ở dòng 7931

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.afterFilterOperation` | 11058 |

### `operationResetV841420` — định nghĩa ở dòng 7934

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `operationSidebarV136.afterFilterOperation` | 11058 |

### `openOperationDetailV841420` — định nghĩa ở dòng 7944

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenOperationDetail` | 9491 |

### `openOperationEditV841531` — định nghĩa ở dòng 8477

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `twoPaneV841612.afterOpenOperationEdit` | 9491 |

### `onClick` — định nghĩa ở dòng 12073

| # | Bước | Khai báo ở dòng |
|---|---|---|
| 1 | `dailyViewV841550.openView` | 8645 |

## Hàm toàn cục còn bị ghi đè

Không còn. ✅

## Biến trạng thái gán ở nhiều nơi

Không phải ghi đè hàm — chỉ là trạng thái được cập nhật từ nhiều chỗ.

| Tên | Các dòng |
|---|---|
| `PHILONG_MATERIAL_SYSTEM_PASSWORD` | 8362 (hoãn), 8372 (hoãn) |
| `PHILONG_SYSTEM_TOKEN` | 4400 (hoãn), 4429 (hoãn) |
| `PHILONG_SYSTEM_TOKEN_UNTIL` | 4400 (hoãn), 4429 (hoãn) |
| `PHILONG_SYSTEM_UNLOCKED` | 4391, 4400 (hoãn), 4429 (hoãn) |
| `PINNED_MENU` | 4384 (hoãn), 4423 (hoãn), 4429 (hoãn), 4472 (hoãn), 4474 (hoãn), 11139 (hoãn) |
| `PL_ACTION_DIALOG_STATE` | 4407 (hoãn), 4413 (hoãn) |
| `PROPOSAL_VIEW_ROWS` | 7541 (hoãn), 9532 (hoãn), 9593 (hoãn), 9652 (hoãn) |

## Danh sách khối script

| # | Dòng | id | Mô tả (chú thích đầu khối) | Bước khai báo |
|---|---|---|---|---|
| 1 | 6–25 |  | V150 — NGUỒN DUY NHẤT để biết đang ở giao diện điện thoại: thuộc tính id "plMobileViewport" của <html>. Chỉ… |  |
| 2 | 3960–3980 | `pl-v841596-startup-instant-paint` | V84.15.97 - Vẽ lời chào/ngày ngay sau gate, không đoán buổi khi thiếu giờ. |  |
| 3 | 3997–4004 |  |  |  |
| 4 | 4283–4893 |  | Bước mở rộng do từng khối giao diện khai báo: PL_STEPS.<khối>.<bước>. Các hàm lõi (showPage, v82RenderLoade… |  |
| 5 | 4898–5223 |  | V17 - KPI + FORM NHẬP LIỆU / CRUD THẬT |  |
| 6 | 5225–5243 |  | V11 - đồng bộ chiều cao hai thanh cố định để mọi màn hình dùng cùng một khung |  |
| 7 | 5247–5405 |  | V21 - FORM REOPEN / SAVE STATE / KPI CONSISTENCY FIX 1) Mỗi lần mở/đóng form luôn reset nút Lưu & đóng. 2) … | `formSessionV21` |
| 8 | 5408–5661 |  | V22 - MAINTENANCE MODEL SYNC - Nhật ký chỉ hiển thị lịch sử thực tế, không dùng NGAY_KE_TIEP làm KPI. - Tổn… | `maintenanceV22` |
| 9 | 5684–5863 |  | V25 - ACTIONS / DETAIL KPI / GLOBAL SAVE&CLOSE RULE Nguyên tắc đã chốt: - Các form ghi dữ liệu chỉ dùng nút… | `actionsV25`, `formStateV25` |
| 10 | 5870–6117 |  | V26 - XEM + SỬA TOÀN HỆ THỐNG NGHIỆP VỤ - Chuẩn hóa thứ tự: 👁 Xem \| ✎ Sửa \| tác vụ nghiệp vụ khác. - Bổ su… | `formStateV26`, `actionsV26` |
| 11 | 6149–6232 |  | V41 - TỰ NHẬN DIỆN CỘT NỘI DUNG ĐỂ XUỐNG DÒNG Áp dụng sau mỗi lần bảng được render/re-render. |  |
| 12 | 6237–6314 |  | V42 - TÊN NÚT THÊM NGẮN CHO SUBBAR Giữ chức năng cũ; chỉ đổi nhãn hiển thị để mọi màn hình 1 dòng. | `subbarV42` |
| 13 | 6330–6609 | `pl-unified-table-layout-v206` | V206 — Một controller duy nhất cho layout các bảng Thiết bị và Kho còn lại. - Tỷ lệ/căn lề lấy từ bảng cấu … | `tableLayoutV206` |
| 14 | 6611–6633 |  | V48 - RENDER CUỐI CHO CÔNG VIỆC HẰNG NGÀY |  |
| 15 | 6643–6771 |  | V57 RELEASE - GLOBAL FILTER & SORT ENGINE raw -> search -> filters -> due -> sort -> pagination -> render |  |
| 16 | 6773–6976 |  | V64 - PAGE-LEVEL LOADER - Mỗi trang chỉ gọi đúng bundle dữ liệu của trang đó. - Cache kết quả trên trình du… | `loaderV64` |
| 17 | 6978–7046 |  | V67 - KPI THỐNG NHẤT + CHỐNG LỖI SCHEMA CŨ/MỚI Một nguồn tính cuối cùng cho mọi dải KPI động. |  |
| 18 | 7052–7121 |  | V78 - báo cáo kiểm tra chỉ đọc, không có lệnh sửa dữ liệu. |  |
| 19 | 7123–7278 |  | V90 - Công cụ bảo trì dữ liệu: sửa mọi bảng theo khu vực menu, đồng nhất, dữ liệu lỗi, sao lưu. |  |
| 20 | 7280–7397 |  | V82 - một loader, một renderer cho đúng trang đang mở. |  |
| 21 | 7399–7555 |  | V83 - tác vụ cuối cho Kế hoạch bảo trì và toàn bộ bảng Đề xuất. Renderer này chạy sau mọi decorator cũ nên … | `proposalActionsV83` |
| 22 | 7562–7604 |  | V84.14.4 - PDF và Word đều là tệp thật do máy chủ tạo; không in HTML, không đổi đuôi giả. |  |
| 23 | 7606–7621 |  | V84 - điểm điều phối cuối: gom mọi yêu cầu render cũ vào một lần/frame. |  |
| 24 | 7632–7746 |  | V84.14.10 - tồn kho là trang chính 30 dòng; lịch sử mở bằng nút trong modal riêng. | `materialWarehouseV841410` |
| 25 | 7754–7792 |  | V84.14 - render và lưu phân quyền dạng ma trận; dữ liệu vẫn lưu theo ID_VAI_TRO + MODULE. | `permissionMatrix` |
| 26 | 7796–7893 |  | V84.14.9 - nhập một đề xuất mua vật tư với nhiều dòng chi tiết. | `proposalMaterialForm` |
| 27 | 7897–7949 |  | V84.14.20 - Render danh sách vận hành dùng chung dữ liệu cho mọi kích thước màn hình. |  |
| 28 | 7957–8051 |  | V84.14.35 - Form thiết bị; bảng được render duy nhất tại V82. | `equipmentForm` |
| 29 | 8055–8072 |  | V84.14.36 - Lịch hôm nay động theo múi giờ Việt Nam. |  |
| 30 | 8078–8094 |  | V84.14.38 - Bắt cả KPI được render sau RPC hoặc khi đổi trang. |  |
| 31 | 8102–8125 | `pl-v8453-table-vertical-middle-runtime` | V84.14.53 - Re-apply canh dọc sau mọi lần render/lọc/phân trang. |  |
| 32 | 8127–8215 | `pl-v8454-number-thousands-format` | V84.14.54 - Hiển thị dấu chấm hàng nghìn cho mọi input số. |  |
| 33 | 8238–8336 | `pl-v841489-rental-table-layout-runtime` | V84.14.89 - Gắn nhãn và lưới ổn định cho đúng ba bảng CHO THUÊ. | `rentalLayout` |
| 34 | 8354–8422 |  | V84.15.28 - khóa Sửa/Xóa danh mục VAT_TU bằng mật khẩu riêng của Hệ thống. Mật khẩu chỉ giữ trong bộ nhớ tạ… | `materialCatalogLock` |
| 35 | 8426–8434 |  | V84.15.29 - nút thêm đề xuất mới và thêm vật tư chưa có. |  |
| 36 | 8438–8480 |  | V84.15.31 - Sửa toàn bộ trường CHI_TIET_VAN_HANH; mỗi ảnh giữ một cột HINH_ANH_1...5. |  |
| 37 | 8484–8498 | `pl-v841535-theme-controller` | V84.15.35 - Bộ điều khiển theme, mặc định sáng và lưu lựa chọn trên trình duyệt. |  |
| 38 | 8501–8530 | `pl-v841536-daily-operational-controller` | V84.15.36 - dùng APP.core.daily (getCorePageBundleV82) và saveDailyWork thật. |  |
| 39 | 8533–8559 | `pl-v841540-daily-month-controller` | V84.15.40 - dữ liệu thật: CVHN_2026 + nhân viên hoạt động. |  |
| 40 | 8565–8604 | `pl-v841544-daily-method-column` | V84.15.44: hiển thị CACH_THUC_HIEN từ CVHN_2026 ngay sau Nội dung thực hiện. |  |
| 41 | 8608–8632 | `pl-v841549-daily-toolbar-view` | V84.15.49 - thanh công cụ: Tìm, Thêm CV, Xem, Sửa, Làm mới, Chưa xong. |  |
| 42 | 8636–8647 | `pl-v841550-daily-view-popup` | V84.15.50 - popup xem riêng cho APP.core.daily, không phụ thuộc V16_DATA. | `dailyViewV841550` |
| 43 | 8653–8678 | `pl-v841552-daily-summary-controller` | V84.15.52 - thống kê hoàn thành hôm nay / tháng / năm theo người thực hiện. |  |
| 44 | 8682–8701 | `pl-v841553-daily-global-search-controller` | V84.15.53 - Tìm và Chưa xong đọc toàn bộ CVHN_2026, không theo ngày lịch. |  |
| 45 | 8708–8710 | `pl-v841567-daily-toolbar-controller` |  |  |
| 46 | 8713–8717 | `pl-v841565-daily-summary-selected-date` | V150 — đã gộp vào pl-v841552-daily-summary-controller (một bộ duy nhất). Chỉ giữ việc vẽ lại khi bấm ngày/n… |  |
| 47 | 8722–8730 | `pl-v841564-today-controller` |  |  |
| 48 | 8740–8901 | `pl-v841585-work-single-controller` | V224 — Bảng Công Việc (desktop) không còn cột "Thao tác" (Xem/Sửa) vì đã có 2 nút Xem/Sửa ở thanh công cụ p… |  |
| 49 | 8902–8911 | `pl-v841585-table-context-title` | Tiêu đề trang: tiếng Việt, chỉ viết hoa chữ cái đầu (giữ nguyên từ viết tắt như PCCC). |  |
| 50 | 8912–9099 | `pl-v841592-startup-two-layer-controller` | V84.15.97 - Lời chào/ngày hiển thị ngay; không đoán buổi khi thiếu giờ. |  |
| 51 | 9102–9148 | `pl-v8415101-task-subbar-export` | V107 — dọn trùng lặp: việc bật/tắt .pl-task-context và exportDataBtn nay do DUY NHẤT script #pl-v841608-tas… |  |
| 52 | 9150–9180 | `pl-v8415102-unified-footer-runtime` | V150: dùng nguồn chung |  |
| 53 | 9182–9231 | `pl-v841591-proposal-material-work-ui` | V84.15.103 — controller riêng cho Đề xuất mua vật tư, dữ liệu và hành động giữ nguyên. | `proposalMaterialUi` |
| 54 | 9233–9259 | `pl-v841594-single-footer-cleanup-runtime` | V84.15.104 — luôn đưa đúng một footer ra ngoài main, tránh hai lớp chân trang. |  |
| 55 | 9261–9282 | `pl-v841595-proposal-toolbar-actions` | V84.15.105 — bổ sung thao tác theo phiếu đang chọn, không thay đổi renderer dữ liệu. |  |
| 56 | 9284–9310 | `pl-v841606-proposal-view-check` | V84.15.106 — toolbar Xem luôn lấy đúng dòng đang chọn. |  |
| 57 | 9312–9321 | `pl-v841607-unified-view-order` | V84.15.107 — đánh dấu các trường dài để thẻ Xem có đúng nhịp với form nhập. |  |
| 58 | 9323–9344 | `pl-v841608-task-subbar-export-clean-runtime` | V107 — refreshBtn/addBtn/liveStatus/addMissingMaterialBtn giờ ẩn vĩnh viễn bằng CSS (mọi trang đã có toolba… | `taskSubbarV841608` |
| 59 | 9346–9418 | `pl-v841609-proposal-finance-stats-runtime` | V84.15.109 — tính riêng theo từng bảng, không cộng lẫn các loại đề xuất. | `proposalFinance` |
| 60 | 9421–9494 | `pl-v841612-two-pane-runtime` | V84.15.116 — dùng một bố cục trường cho Thêm/Sửa/Xem trên toàn hệ thống. | `twoPaneV841612` |
| 61 | 9495–9546 | `pl-v841592-proposal-equipment-work-ui` | V84.15.122 — Đề xuất mua thiết bị dùng cùng renderer/giao diện với bảng vật tư. | `proposalEquipmentUi` |
| 62 | 9547–9607 | `pl-v107-proposal-dispose-work-ui` | V107 — Đề xuất thanh lý dùng chung khung giao diện (pbm-shell/pbm-tools/ pbm-grid/pbm-footer) với Đề xuất m… | `proposalDisposeUi` |
| 63 | 9608–9666 | `pl-v107-proposal-maintenance-work-ui` | V107 — Đề xuất bảo trì dùng chung khung giao diện với Đề xuất mua vật tư. Cột dữ liệu đổi theo cấu trúc DE_… | `proposalMaintenanceUi` |
| 64 | 9667–9700 | `pl-v841592-equipment-work-ui` | V84.15.127 — Copy khung Công việc cho Kho thiết bị đang dùng; dữ liệu và CRUD dùng lại API hiện hữu. | `equipmentUi` |
| 65 | 9702–9734 | `pl-v107-recovery-work-ui` | V107 — Copy khung giao diện Thiết bị đang dùng (ple-shell) cho Thu hồi thiết bị, đổi cột theo đúng cấu trúc… | `recoveryUi` |
| 66 | 9735–9801 | `pl-v96-device-transfer-history` | V96 — Danh sách Lịch sử chuyển thiết bị (LICH_SU_CHUYEN_THIET_BI). Đăng ký dữ liệu vào V16_DATA.views để nú… |  |
| 67 | 9803–9891 | `pl-v86-maintenance-log-work-ui` | V86 — Nhật ký bảo trì: dựng lại theo đúng khung "Thiết bị đang dùng" (cùng CSS ple-*) để đồng bộ giao diện … | `maintenanceLogUi` |
| 68 | 9893–9983 | `pl-v86-maintenance-plan-work-ui` | V86 — Kế hoạch bảo trì: dựng lại theo đúng khung "Thiết bị đang dùng". Dữ liệu tự tính từ nhật ký + chu kỳ … | `maintenancePlanUi` |
| 69 | 9985–10018 | `pl-v225-material-warehouse-desktop-trim` | V225 — KHO VAT TU: an/xoa vat ly cot "Canh bao" khoi bang ton kho CHI tren Desktop. Bang nay dung renderDat… |  |
| 70 | 10020–10038 | `pl-v98-shared-page-watch` | V98 — Gộp 3 MutationObserver riêng lẻ (equipment/maintenanceLog/maintenancePlan) thành 1 observer dùng chun… |  |
| 71 | 10039–10526 | `pl-mobile-single-controller` | V155 — BỘ ĐIỀU KHIỂN MOBILE DUY NHẤT (viết gọn lại từ V216…V154) Nhiệm vụ, theo đúng thứ tự trong file: 1. … |  |
| 72 | 10528–10685 | `pl-v111-material-history-selected-no-action` | V111 — Một toolbar, một khung bảng và một khối CSS duy nhất cho Kho vật tư: Tìm / Xem / Sửa / Nhập-Xuất / L… | `materialWarehouseV111` |
| 73 | 10687–10728 | `pl-v107-generic-footer-runtime` | V107 — chân bảng thống nhất (pl-data-footer) cho các trang còn lại dùng chung v16RenderGenericTable_. Đơn v… | `genericFooterV107` |
| 74 | 10738–10931 | `pl-v135-catalog-sidebar` | V135 — Sidebar bộ lọc + thống kê (bên trái, 240px) cho 7 trang Danh Mục, dựng khung .plc-shell riêng thay h… | `catalogSidebarV135` |
| 75 | 10933–11066 | `pl-v136-operation-sidebar` | V136 — Sidebar bộ lọc + thống kê giống hệt .plc-shell ở trên, riêng cho "Chi tiết vận hành, kiểm tra thiết … | `operationSidebarV136` |
| 76 | 11067–11110 | `pl-v210-catalog-no-action-columns` | V210 — TOÀN HỆ THỐNG: bỏ cột Thao tác khỏi DOM thật ở mọi bảng dữ liệu (Xem/Sửa/Xóa dùng thanh công cụ). Cá… | `catalogNoActionV210` |
| 77 | 11116–11176 | `pl-v137-system-lock-guard` | V137 — KHÓA MENU & TRANG HỆ THỐNG - Lớp bọc showPage ngoài cùng: mọi đường mở trang (menu desktop, menu mob… | `systemLockV137` |
| 78 | 11189–11199 | `pl-v145-daily-pager` | V145 — nút trang cho CV hằng ngày: gửi số trang về đúng bộ hiển thị đang vẽ bảng (lịch tháng hoặc tìm kiếm/… |  |
| 79 | 11200–11346 | `pl-v142-toolbar-delete-all` | V142 — Bổ sung nút "Xóa" và "Tất cả" ngay bên phải nút "Sửa" trên MỌI thanh công cụ có nút Sửa: Công việc, … |  |
| 80 | 11463–11524 | `pl-v151-toolbar-roles` | V151 — gắn vai trò (data-tool-role) cho từng nút thanh công cụ theo id/nhãn, để CSS phía trên tô CÙNG MỘT M… |  |
| 81 | 11539–11616 | `pl-v153-font-boost` | V153 — TĂNG CỠ CHỮ TOÀN HỆ THỐNG: mọi cỡ chữ đang khai báo bằng px được CỘNG THÊM một lượng cố định (mặc đị… |  |
| 82 | 11977–12080 |  | Báo cáo tiến độ (workProgress) + Báo cáo công việc (workReport): dữ liệu APP.core.work / APP.core.daily do … |  |
| 83 | 12081–12124 |  | Ẩn thanh địa chỉ trên điện thoại. Ứng dụng Apps Script chạy trong 2 lớp iframe của Google nên khi cuộn trìn… |  |

# Bản đồ lớp vá của index.html

Sinh tự động bởi `tools/patch-map.js` (phân tích cú pháp bằng acorn). Chạy lại sau mỗi lần sửa (trong thư mục `apps-script`): `npm --prefix tools install` (lần đầu) rồi `node tools/patch-map.js index.html > PATCH_MAP.md`.

- Số khối `<script>` nội tuyến: **80**
- Số hàm toàn cục bị định nghĩa/ghi đè từ 2 lần trở lên: **40** (+ 1 cờ/biến trạng thái được gán ở nhiều nơi)

### Top hàm bị ghi đè nhiều nhất

| Hàm | Số lần | Bản có hiệu lực ★ |
|---|---|---|
| `showPage` | 19 | dòng 11329, khối #76 `pl-v137-system-lock-guard` |
| `v82RenderLoadedPage` | 17 | dòng 11226, khối #74 `pl-v136-operation-sidebar` |
| `v16RenderGenericTable_` | 13 | dòng 11260, khối #75 `pl-v210-catalog-no-action-columns` |
| `v17OpenForm` | 7 | dòng 8311, khối #27 |
| `PINNED_MENU` | 6 | dòng 11293, khối #76 `pl-v137-system-lock-guard` |
| `renderDaily` | 6 | dòng 8841, khối #38 `pl-v841540-daily-month-controller` |
| `renderExtra` | 6 | dòng 8026, khối #23 |
| `PL142_SHOW_ALL` | 5 | dòng 9895, khối #62 `pl-v107-proposal-maintenance-work-ui` |
| `v17CloseForm` | 5 | dòng 8176, khối #25 |
| `v17OpenCustomExisting_` | 5 | dòng 8313, khối #27 |
| `v17SaveForm` | 5 | dòng 8327, khối #27 |
| `PROPOSAL_VIEW_ROWS` | 4 | dòng 9932, khối #62 `pl-v107-proposal-maintenance-work-ui` |
| `v16PageSlice_` | 4 | dòng 7845, khối #20 |
| `v17Kpis` | 4 | dòng 7495, khối #17 |
| `openAddForCurrentPage` | 3 | dòng 5667, khối #7 |

## Cách đọc

- **Thứ tự**: theo vị trí trong file = thứ tự trình duyệt chạy. Bản *đồng bộ* (không hoãn) xuất hiện **sau cùng** là bản đang có hiệu lực khi trang tải xong.
- **Bọc**: khối này lưu bản trước (`const old=window.X`) rồi gọi lại nó ⇒ bản mới *chồng lên* chứ không thay thế; sửa ở bản cũ vẫn có tác dụng.
- **Hoãn**: phép gán nằm trong callback (DOMContentLoaded, setTimeout, MutationObserver, hàm được gọi sau…) ⇒ có thể chạy muộn hơn và thắng cả bản đứng sau trong file. Cần kiểm tra thủ công.
- **Khi sửa một hàm**: sửa ở bản ★ (có hiệu lực). Nếu bản ★ là "Bọc", lần ngược lên các bản trước để biết logic gốc nằm ở đâu.

## Hàm/biến toàn cục bị ghi đè

### `showPage` — 19 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4738 | #4 | `function` |  |  |
| 2 | 6522 | #10 | `window.showPage=` | ✔ |  |
| 3 | 6720 | #12 | `window.showPage=` | ✔ |  |
| 4 | 7247 | #15 | `window.showPage=` | ✔ |  |
| 5 | 7443 | #16 | `window.showPage=` | ✔ |  |
| 6 | 7660 | #19 | `window.showPage=` |  |  |
| 7 | 9506 | #52 `pl-v841591-proposal-material-work-ui` | `window.showPage=` | ✔ |  |
| 8 | 9622 | #57 `pl-v841608-task-subbar-export-clean-runtime` | `window.showPage=` | ✔ |  |
| 9 | 9697 | #58 `pl-v841609-proposal-finance-stats-runtime` | `window.showPage=` | ✔ |  |
| 10 | 9822 | #60 `pl-v841592-proposal-equipment-work-ui` | `window.showPage=` | ✔ |  |
| 11 | 9881 | #61 `pl-v107-proposal-dispose-work-ui` | `window.showPage=` | ✔ |  |
| 12 | 9938 | #62 `pl-v107-proposal-maintenance-work-ui` | `window.showPage=` | ✔ |  |
| 13 | 9971 | #63 `pl-v841592-equipment-work-ui` | `window.showPage=` | ✔ |  |
| 14 | 10002 | #64 `pl-v107-recovery-work-ui` | `window.showPage=` | ✔ |  |
| 15 | 10154 | #66 `pl-v86-maintenance-log-work-ui` | `window.showPage=` | ✔ |  |
| 16 | 10246 | #67 `pl-v86-maintenance-plan-work-ui` | `window.showPage=` | ✔ |  |
| 17 | 11069 | #73 `pl-v135-catalog-sidebar` | `window.showPage=` | ✔ |  |
| 18 | 11219 | #74 `pl-v136-operation-sidebar` | `window.showPage=` | ✔ |  |
| 19 ★ | 11329 | #76 `pl-v137-system-lock-guard` | `window.showPage=` | ✔ |  |

### `v82RenderLoadedPage` — 17 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 7620 | #19 | `window.v82RenderLoadedPage=` |  |  |
| 2 | 7838 | #20 | `window.v82RenderLoadedPage=` | ✔ |  |
| 3 | 8028 | #23 | `window.v82RenderLoadedPage=` | ✔ |  |
| 4 | 8076 | #24 | `window.v82RenderLoadedPage=` | ✔ |  |
| 5 | 8607 | #32 `pl-v841489-rental-table-layout-runtime` | `window.v82RenderLoadedPage=` | ✔ |  |
| 6 | 8704 | #33 | `window.v82RenderLoadedPage=` | ✔ |  |
| 7 | 9507 | #52 `pl-v841591-proposal-material-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 8 | 9698 | #58 `pl-v841609-proposal-finance-stats-runtime` | `window.v82RenderLoadedPage=` | ✔ |  |
| 9 | 9823 | #60 `pl-v841592-proposal-equipment-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 10 | 9882 | #61 `pl-v107-proposal-dispose-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 11 | 9939 | #62 `pl-v107-proposal-maintenance-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 12 | 9972 | #63 `pl-v841592-equipment-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 13 | 10003 | #64 `pl-v107-recovery-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 14 | 10155 | #66 `pl-v86-maintenance-log-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 15 | 10247 | #67 `pl-v86-maintenance-plan-work-ui` | `window.v82RenderLoadedPage=` | ✔ |  |
| 16 | 11077 | #73 `pl-v135-catalog-sidebar` | `window.v82RenderLoadedPage=` | ✔ |  |
| 17 ★ | 11226 | #74 `pl-v136-operation-sidebar` | `window.v82RenderLoadedPage=` | ✔ |  |

### `v16RenderGenericTable_` — 13 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5074 | #4 | `function` |  |  |
| 2 | 6065 | #8 | `window.v16RenderGenericTable_=` | ✔ |  |
| 3 | 6241 | #9 | `window.v16RenderGenericTable_=` | ✔ |  |
| 4 | 6512 | #10 | `window.v16RenderGenericTable_=` | ✔ |  |
| 5 | 7840 | #20 | `window.v16RenderGenericTable_=` | ✔ |  |
| 6 | 8702 | #33 | `window.v16RenderGenericTable_=` | ✔ |  |
| 7 | 9824 | #60 `pl-v841592-proposal-equipment-work-ui` | `window.v16RenderGenericTable_=` | ✔ |  |
| 8 | 9883 | #61 `pl-v107-proposal-dispose-work-ui` | `window.v16RenderGenericTable_=` | ✔ |  |
| 9 | 9940 | #62 `pl-v107-proposal-maintenance-work-ui` | `window.v16RenderGenericTable_=` | ✔ |  |
| 10 | 10004 | #64 `pl-v107-recovery-work-ui` | `window.v16RenderGenericTable_=` | ✔ |  |
| 11 | 10762 | #71 `pl-v111-material-history-selected-no-action` | `window.v16RenderGenericTable_=` | ✔ |  |
| 12 | 10851 | #72 `pl-v107-generic-footer-runtime` | `window.v16RenderGenericTable_=` | ✔ |  |
| 13 ★ | 11260 | #75 `pl-v210-catalog-no-action-columns` | `window.v16RenderGenericTable_=` | ✔ |  |

### `v17OpenForm` — 7 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5458 | #5 | `function` |  |  |
| 2 | 5636 | #7 | `window.v17OpenForm=` | ✔ |  |
| 3 | 5878 | #8 | `window.v17OpenForm=` | ✔ |  |
| 4 | 6262 | #9 | `window.v17OpenForm=` | ✔ |  |
| 5 | 6411 | #10 | `window.v17OpenForm=` | ✔ |  |
| 6 | 8172 | #25 | `window.v17OpenForm=` | ✔ |  |
| 7 ★ | 8311 | #27 | `window.v17OpenForm=` | ✔ |  |

### `PINNED_MENU` — 6 lần ⚠ có bản hoãn

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4593 | #4 | `PINNED_MENU= (giá trị)` | ✔ | ✔ |
| 2 | 4632 | #4 | `PINNED_MENU=` | ✔ | ✔ |
| 3 | 4638 | #4 | `PINNED_MENU=` | ✔ | ✔ |
| 4 | 4681 | #4 | `PINNED_MENU= (giá trị)` | ✔ | ✔ |
| 5 | 4683 | #4 | `PINNED_MENU=` | ✔ | ✔ |
| 6 | 11293 | #76 `pl-v137-system-lock-guard` | `PINNED_MENU= (giá trị)` |  | ✔ |

### `renderDaily` — 6 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4890 | #4 | `function` |  |  |
| 2 | 6245 | #9 | `window.renderDaily=` | ✔ |  |
| 3 | 6515 | #10 | `window.renderDaily=` | ✔ |  |
| 4 | 7079 | #14 | `window.renderDaily=` |  |  |
| 5 | 8813 | #37 `pl-v841536-daily-operational-controller` | `window.renderDaily=` | ✔ |  |
| 6 ★ | 8841 | #38 `pl-v841540-daily-month-controller` | `window.renderDaily=` |  |  |

### `renderExtra` — 6 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4780 | #4 | `function` |  |  |
| 2 | 5779 | #8 | `window.renderExtra=` | ✔ |  |
| 3 | 6092 | #8 | `window.renderExtra=` | ✔ |  |
| 4 | 6520 | #10 | `window.renderExtra=` | ✔ |  |
| 5 | 7903 | #22 | `window.renderExtra=` |  |  |
| 6 ★ | 8026 | #23 | `window.renderExtra=` | ✔ |  |

### `PL142_SHOW_ALL` — 5 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 8824 | #38 `pl-v841540-daily-month-controller` | `window.PL142_SHOW_ALL=` |  |  |
| 2 | 9469 | #52 `pl-v841591-proposal-material-work-ui` | `window.PL142_SHOW_ALL=` |  |  |
| 3 | 9784 | #60 `pl-v841592-proposal-equipment-work-ui` | `window.PL142_SHOW_ALL=` |  |  |
| 4 | 9838 | #61 `pl-v107-proposal-dispose-work-ui` | `window.PL142_SHOW_ALL=` |  |  |
| 5 ★ | 9895 | #62 `pl-v107-proposal-maintenance-work-ui` | `window.PL142_SHOW_ALL=` |  |  |

### `v17CloseForm` — 5 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5472 | #5 | `function` |  |  |
| 2 | 5660 | #7 | `window.v17CloseForm=` | ✔ |  |
| 3 | 6266 | #9 | `window.v17CloseForm=` | ✔ |  |
| 4 | 6415 | #10 | `window.v17CloseForm=` | ✔ |  |
| 5 ★ | 8176 | #25 | `window.v17CloseForm=` |  |  |

### `v17OpenCustomExisting_` — 5 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5489 | #5 | `function` |  |  |
| 2 | 5657 | #7 | `window.v17OpenCustomExisting_=` | ✔ |  |
| 3 | 6264 | #9 | `window.v17OpenCustomExisting_=` | ✔ |  |
| 4 | 6413 | #10 | `window.v17OpenCustomExisting_=` | ✔ |  |
| 5 ★ | 8313 | #27 | `window.v17OpenCustomExisting_=` | ✔ |  |

### `v17SaveForm` — 5 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5480 | #5 | `function` |  |  |
| 2 | 5689 | #7 | `window.v17SaveForm=` |  |  |
| 3 | 5905 | #8 | `window.v17SaveForm=` | ✔ |  |
| 4 | 8173 | #25 | `window.v17SaveForm=` |  |  |
| 5 ★ | 8327 | #27 | `window.v17SaveForm=` | ✔ |  |

### `PROPOSAL_VIEW_ROWS` — 4 lần ⚠ có bản hoãn

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 7830 | #20 | `window.PROPOSAL_VIEW_ROWS=` |  | ✔ |
| 2 | 9816 | #60 `pl-v841592-proposal-equipment-work-ui` | `window.PROPOSAL_VIEW_ROWS=` |  | ✔ |
| 3 | 9875 | #61 `pl-v107-proposal-dispose-work-ui` | `window.PROPOSAL_VIEW_ROWS=` |  | ✔ |
| 4 | 9932 | #62 `pl-v107-proposal-maintenance-work-ui` | `window.PROPOSAL_VIEW_ROWS=` |  | ✔ |

### `v16PageSlice_` — 4 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5011 | #4 | `function` |  |  |
| 2 | 6002 | #8 | `window.v16PageSlice_=` | ✔ |  |
| 3 | 7213 | #15 | `window.v16PageSlice_=` |  |  |
| 4 ★ | 7845 | #20 | `window.v16PageSlice_=` | ✔ |  |

### `v17Kpis` — 4 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5495 | #5 | `function` |  |  |
| 2 | 5718 | #7 | `window.v17Kpis=` | ✔ |  |
| 3 | 5788 | #8 | `window.v17Kpis=` | ✔ |  |
| 4 ★ | 7495 | #17 | `window.v17Kpis=` |  |  |

### `openAddForCurrentPage` — 3 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4909 | #4 | `function` |  |  |
| 2 | 5485 | #5 | `function` |  |  |
| 3 ★ | 5667 | #7 | `window.openAddForCurrentPage=` |  |  |

### `v16SyncPageToolbar_` — 3 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5034 | #4 | `function` |  |  |
| 2 | 6027 | #8 | `window.v16SyncPageToolbar_=` | ✔ |  |
| 3 ★ | 7233 | #15 | `window.v16SyncPageToolbar_=` |  |  |

### `v26EditRecord` — 3 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 6471 | #10 | `window.v26EditRecord=` |  |  |
| 2 | 8175 | #25 | `window.v26EditRecord=` |  |  |
| 3 ★ | 8697 | #33 | `window.v26EditRecord=` | ✔ |  |

### `loadLiveData` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4758 | #4 | `function` |  |  |
| 2 ★ | 7449 | #16 | `window.loadLiveData=` |  |  |

### `operationFilterV841420` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 8215 | #26 | `window.operationFilterV841420=` |  |  |
| 2 ★ | 11212 | #74 `pl-v136-operation-sidebar` | `window.operationFilterV841420=` | ✔ |  |

### `operationResetV841420` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 8218 | #26 | `window.operationResetV841420=` |  |  |
| 2 ★ | 11214 | #74 `pl-v136-operation-sidebar` | `window.operationResetV841420=` | ✔ |  |

### `PHILONG_MATERIAL_SYSTEM_PASSWORD` — 2 lần ⚠ có bản hoãn

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 8648 | #33 | `window.PHILONG_MATERIAL_SYSTEM_PASSWORD= (giá trị)` |  | ✔ |
| 2 | 8658 | #33 | `window.PHILONG_MATERIAL_SYSTEM_PASSWORD=` |  | ✔ |

### `PHILONG_SYSTEM_TOKEN` — 2 lần ⚠ có bản hoãn

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4609 | #4 | `window.PHILONG_SYSTEM_TOKEN= (giá trị)` |  | ✔ |
| 2 | 4638 | #4 | `window.PHILONG_SYSTEM_TOKEN=` |  | ✔ |

### `PHILONG_SYSTEM_TOKEN_UNTIL` — 2 lần ⚠ có bản hoãn

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4609 | #4 | `window.PHILONG_SYSTEM_TOKEN_UNTIL= (giá trị)` |  | ✔ |
| 2 | 4638 | #4 | `window.PHILONG_SYSTEM_TOKEN_UNTIL=` |  | ✔ |

### `PL_ACTION_DIALOG_STATE` — 2 lần ⚠ có bản hoãn

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4616 | #4 | `PL_ACTION_DIALOG_STATE= (giá trị)` | ✔ | ✔ |
| 2 | 4622 | #4 | `PL_ACTION_DIALOG_STATE=` | ✔ | ✔ |

### `PL_APPLY_WRAP_V41` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 6623 | #11 | `window.PL_APPLY_WRAP_V41=` |  |  |
| 2 ★ | 7012 | #13 `pl-unified-table-layout-v206` | `window.PL_APPLY_WRAP_V41=` | ✔ |  |

### `plCompactPagerHtml_` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4557 | #4 | `function` |  |  |
| 2 ★ | 4566 | #4 | `window.plCompactPagerHtml_=` |  |  |

### `PLD_GO_PAGE_V145` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 8822 | #38 `pl-v841540-daily-month-controller` | `window.PLD_GO_PAGE_V145=` |  |  |
| 2 ★ | 8976 | #43 `pl-v841553-daily-global-search-controller` | `window.PLD_GO_PAGE_V145=` |  |  |

### `plRefreshFooterStatus_` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4531 | #4 | `function` |  |  |
| 2 ★ | 4565 | #4 | `window.plRefreshFooterStatus_=` |  |  |

### `plSystemTokenV137_` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4603 | #4 | `function` |  |  |
| 2 ★ | 4607 | #4 | `window.plSystemTokenV137_=` |  |  |

### `proposalPrint_` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4811 | #4 | `function` |  |  |
| 2 ★ | 7884 | #21 | `window.proposalPrint_=` |  |  |

### `renderCellValue` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4841 | #4 | `function` |  |  |
| 2 ★ | 8330 | #27 | `window.renderCellValue=` | ✔ |  |

### `renderOperationDetailV841420` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 8214 | #26 | `window.renderOperationDetailV841420=` |  |  |
| 2 ★ | 11216 | #74 `pl-v136-operation-sidebar` | `window.renderOperationDetailV841420=` | ✔ |  |

### `setStatus` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4574 | #4 | `function` |  |  |
| 2 ★ | 6727 | #12 | `window.setStatus=` | ✔ |  |

### `v16SortRows_` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 4971 | #4 | `function` |  |  |
| 2 ★ | 5991 | #8 | `window.v16SortRows_=` | ✔ |  |

### `v17EditTableRecord` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5488 | #5 | `function` |  |  |
| 2 ★ | 8174 | #25 | `window.v17EditTableRecord=` |  |  |

### `v17RefreshAllKpis` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5520 | #5 | `function` |  |  |
| 2 ★ | 7532 | #17 | `window.v17RefreshAllKpis=` |  |  |

### `v17SyncAddButton` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 5490 | #5 | `function` |  |  |
| 2 ★ | 6713 | #12 | `window.v17SyncAddButton=` | ✔ |  |

### `v26OpenView` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 6388 | #10 | `window.v26OpenView=` |  |  |
| 2 ★ | 8929 | #41 `pl-v841550-daily-view-popup` | `window.v26OpenView=` | ✔ |  |

### `v56SetQuery` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 7219 | #15 | `window.v56SetQuery=` |  |  |
| 2 ★ | 7459 | #16 | `window.v56SetQuery=` | ✔ |  |

### `viewRecord` — 2 lần

| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |
|---|---|---|---|---|---|
| 1 | 6217 | #9 | `window.viewRecord=` |  |  |
| 2 ★ | 6396 | #10 | `window.viewRecord=` |  |  |

## Cờ / biến trạng thái gán ở nhiều nơi

Không phải ghi đè hàm — chỉ là trạng thái được cập nhật từ nhiều chỗ.

| Tên | Các dòng |
|---|---|
| `PHILONG_SYSTEM_UNLOCKED` | 4600, 4609 (hoãn), 4638 (hoãn) |

## Danh sách khối script

| # | Dòng | id | Mô tả (chú thích đầu khối) | Định nghĩa/ghi đè tên dùng chung |
|---|---|---|---|---|
| 1 | 6–25 |  | V150 — NGUỒN DUY NHẤT để biết đang ở giao diện điện thoại: thuộc tính id "plMobileViewport" của <html>. Chỉ… |  |
| 2 | 4210–4230 | `pl-v841596-startup-instant-paint` | V84.15.97 - Vẽ lời chào/ngày ngay sau gate, không đoán buổi khi thiếu giờ. |  |
| 3 | 4247–4254 |  |  |  |
| 4 | 4504–5239 |  | V105 — Một nguồn duy nhất cho trạng thái và phân trang chân bảng. | `plRefreshFooterStatus_`, `plCompactPagerHtml_`, `setStatus`, `plSystemTokenV137_`, `showPage`, `loadLiveData`, `renderExtra`, `proposalPrint_`, `renderCellValue`, `renderDaily`, `openAddForCurrentPage`, `v16SortRows_`, `v16PageSlice_`, `v16SyncPageToolbar_`, `v16RenderGenericTable_`, `PINNED_MENU`, `PHILONG_SYSTEM_TOKEN`, `PHILONG_SYSTEM_TOKEN_UNTIL`, `PL_ACTION_DIALOG_STATE` |
| 5 | 5244–5540 |  | V17 - KPI + FORM NHẬP LIỆU / CRUD THẬT | `v17OpenForm`, `v17CloseForm`, `v17SaveForm`, `openAddForCurrentPage`, `v17EditTableRecord`, `v17OpenCustomExisting_`, `v17SyncAddButton`, `v17Kpis`, `v17RefreshAllKpis` |
| 6 | 5542–5560 |  | V11 - đồng bộ chiều cao hai thanh cố định để mọi màn hình dùng cùng một khung |  |
| 7 | 5564–5746 |  | V21 - FORM REOPEN / SAVE STATE / KPI CONSISTENCY FIX 1) Mỗi lần mở/đóng form luôn reset nút Lưu & đóng. 2) … | `v17OpenForm`, `v17OpenCustomExisting_`, `v17CloseForm`, `openAddForCurrentPage`, `v17SaveForm`, `v17Kpis` |
| 8 | 5749–6104 |  | V22 - MAINTENANCE MODEL SYNC - Nhật ký chỉ hiển thị lịch sử thực tế, không dùng NGAY_KE_TIEP làm KPI. - Tổn… | `renderExtra`, `v17Kpis`, `v17OpenForm`, `v17SaveForm`, `v16SortRows_`, `v16PageSlice_`, `v16SyncPageToolbar_`, `v16RenderGenericTable_` |
| 9 | 6127–6276 |  | V25 - ACTIONS / DETAIL KPI / GLOBAL SAVE&CLOSE RULE Nguyên tắc đã chốt: - Các form ghi dữ liệu chỉ dùng nút… | `viewRecord`, `v16RenderGenericTable_`, `renderDaily`, `v17OpenForm`, `v17OpenCustomExisting_`, `v17CloseForm` |
| 10 | 6283–6525 |  | V26 - XEM + SỬA TOÀN HỆ THỐNG NGHIỆP VỤ - Chuẩn hóa thứ tự: 👁 Xem \| ✎ Sửa \| tác vụ nghiệp vụ khác. - Bổ su… | `v26OpenView`, `viewRecord`, `v17OpenForm`, `v17OpenCustomExisting_`, `v17CloseForm`, `v26EditRecord`, `v16RenderGenericTable_`, `renderDaily`, `renderExtra`, `showPage` |
| 11 | 6557–6639 |  | V41 - TỰ NHẬN DIỆN CỘT NỘI DUNG ĐỂ XUỐNG DÒNG Áp dụng sau mỗi lần bảng được render/re-render. | `PL_APPLY_WRAP_V41` |
| 12 | 6644–6738 |  | V42 - TÊN NÚT THÊM NGẮN CHO SUBBAR Giữ chức năng cũ; chỉ đổi nhãn hiển thị để mọi màn hình 1 dòng. | `v17SyncAddButton`, `showPage`, `setStatus` |
| 13 | 6754–7034 | `pl-unified-table-layout-v206` | V206 — Một controller duy nhất cho layout các bảng Thiết bị và Kho còn lại. - Tỷ lệ/căn lề lấy từ bảng cấu … | `PL_APPLY_WRAP_V41` |
| 14 | 7036–7116 |  | V48 - RENDER CUỐI CHO CÔNG VIỆC HẰNG NGÀY | `renderDaily` |
| 15 | 7126–7251 |  | V57 RELEASE - GLOBAL FILTER & SORT ENGINE raw -> search -> filters -> due -> sort -> pagination -> render | `v16PageSlice_`, `v56SetQuery`, `v16SyncPageToolbar_`, `showPage` |
| 16 | 7253–7465 |  | V64 - PAGE-LEVEL LOADER - Mỗi trang chỉ gọi đúng bundle dữ liệu của trang đó. - Cache kết quả trên trình du… | `showPage`, `loadLiveData`, `v56SetQuery` |
| 17 | 7467–7534 |  | V67 - KPI THỐNG NHẤT + CHỐNG LỖI SCHEMA CŨ/MỚI Một nguồn tính cuối cùng cho mọi dải KPI động. | `v17Kpis`, `v17RefreshAllKpis` |
| 18 | 7540–7609 |  | V78 - báo cáo kiểm tra chỉ đọc, không có lệnh sửa dữ liệu. |  |
| 19 | 7611–7687 |  | V82 - một loader, một renderer cho đúng trang đang mở. | `v82RenderLoadedPage`, `showPage` |
| 20 | 7689–7848 |  | V83 - tác vụ cuối cho Kế hoạch bảo trì và toàn bộ bảng Đề xuất. Renderer này chạy sau mọi decorator cũ nên … | `PROPOSAL_VIEW_ROWS`, `v82RenderLoadedPage`, `v16RenderGenericTable_`, `v16PageSlice_` |
| 21 | 7855–7897 |  | V84.14.4 - PDF và Word đều là tệp thật do máy chủ tạo; không in HTML, không đổi đuôi giả. | `proposalPrint_` |
| 22 | 7899–7909 |  | V84 - điểm điều phối cuối: gom mọi yêu cầu render cũ vào một lần/frame. | `renderExtra` |
| 23 | 7920–8032 |  | V84.14.10 - tồn kho là trang chính 30 dòng; lịch sử mở bằng nút trong modal riêng. | `renderExtra`, `v82RenderLoadedPage` |
| 24 | 8040–8079 |  | V84.14 - render và lưu phân quyền dạng ma trận; dữ liệu vẫn lưu theo ID_VAI_TRO + MODULE. | `v82RenderLoadedPage` |
| 25 | 8083–8178 |  | V84.14.9 - nhập một đề xuất mua vật tư với nhiều dòng chi tiết. | `v17OpenForm`, `v17SaveForm`, `v17EditTableRecord`, `v26EditRecord`, `v17CloseForm` |
| 26 | 8182–8232 |  | V84.14.20 - Render danh sách vận hành dùng chung dữ liệu cho mọi kích thước màn hình. | `renderOperationDetailV841420`, `operationFilterV841420`, `operationResetV841420` |
| 27 | 8240–8336 |  | V84.14.35 - Form thiết bị; bảng được render duy nhất tại V82. | `v17OpenForm`, `v17OpenCustomExisting_`, `v17SaveForm`, `renderCellValue` |
| 28 | 8340–8357 |  | V84.14.36 - Lịch hôm nay động theo múi giờ Việt Nam. |  |
| 29 | 8363–8379 |  | V84.14.38 - Bắt cả KPI được render sau RPC hoặc khi đổi trang. |  |
| 30 | 8387–8410 | `pl-v8453-table-vertical-middle-runtime` | V84.14.53 - Re-apply canh dọc sau mọi lần render/lọc/phân trang. |  |
| 31 | 8412–8500 | `pl-v8454-number-thousands-format` | V84.14.54 - Hiển thị dấu chấm hàng nghìn cho mọi input số. |  |
| 32 | 8523–8622 | `pl-v841489-rental-table-layout-runtime` | V84.14.89 - Gắn nhãn và lưới ổn định cho đúng ba bảng CHO THUÊ. | `v82RenderLoadedPage` |
| 33 | 8640–8708 |  | V84.15.28 - khóa Sửa/Xóa danh mục VAT_TU bằng mật khẩu riêng của Hệ thống. Mật khẩu chỉ giữ trong bộ nhớ tạ… | `PHILONG_MATERIAL_SYSTEM_PASSWORD`, `v26EditRecord`, `v16RenderGenericTable_`, `v82RenderLoadedPage` |
| 34 | 8712–8720 |  | V84.15.29 - nút thêm đề xuất mới và thêm vật tư chưa có. |  |
| 35 | 8724–8765 |  | V84.15.31 - Sửa toàn bộ trường CHI_TIET_VAN_HANH; mỗi ảnh giữ một cột HINH_ANH_1...5. |  |
| 36 | 8769–8783 | `pl-v841535-theme-controller` | V84.15.35 - Bộ điều khiển theme, mặc định sáng và lưu lựa chọn trên trình duyệt. |  |
| 37 | 8786–8815 | `pl-v841536-daily-operational-controller` | V84.15.36 - dùng APP.core.daily (getCorePageBundleV82) và saveDailyWork thật. | `renderDaily` |
| 38 | 8818–8843 | `pl-v841540-daily-month-controller` | V84.15.40 - dữ liệu thật: CVHN_2026 + nhân viên hoạt động. | `PLD_GO_PAGE_V145`, `PL142_SHOW_ALL`, `renderDaily` |
| 39 | 8849–8888 | `pl-v841544-daily-method-column` | V84.15.44: hiển thị CACH_THUC_HIEN từ CVHN_2026 ngay sau Nội dung thực hiện. |  |
| 40 | 8892–8916 | `pl-v841549-daily-toolbar-view` | V84.15.49 - thanh công cụ: Tìm, Thêm CV, Xem, Sửa, Làm mới, Chưa xong. |  |
| 41 | 8920–8931 | `pl-v841550-daily-view-popup` | V84.15.50 - popup xem riêng cho APP.core.daily, không phụ thuộc V16_DATA. | `v26OpenView` |
| 42 | 8937–8962 | `pl-v841552-daily-summary-controller` | V84.15.52 - thống kê hoàn thành hôm nay / tháng / năm theo người thực hiện. |  |
| 43 | 8966–8985 | `pl-v841553-daily-global-search-controller` | V84.15.53 - Tìm và Chưa xong đọc toàn bộ CVHN_2026, không theo ngày lịch. | `PLD_GO_PAGE_V145` |
| 44 | 8992–8994 | `pl-v841567-daily-toolbar-controller` |  |  |
| 45 | 8997–9001 | `pl-v841565-daily-summary-selected-date` | V150 — đã gộp vào pl-v841552-daily-summary-controller (một bộ duy nhất). Chỉ giữ việc vẽ lại khi bấm ngày/n… |  |
| 46 | 9006–9014 | `pl-v841564-today-controller` |  |  |
| 47 | 9024–9185 | `pl-v841585-work-single-controller` | V224 — Bảng Công Việc (desktop) không còn cột "Thao tác" (Xem/Sửa) vì đã có 2 nút Xem/Sửa ở thanh công cụ p… |  |
| 48 | 9186–9193 | `pl-v841585-table-context-title` |  |  |
| 49 | 9194–9381 | `pl-v841592-startup-two-layer-controller` | V84.15.97 - Lời chào/ngày hiển thị ngay; không đoán buổi khi thiếu giờ. |  |
| 50 | 9384–9430 | `pl-v8415101-task-subbar-export` | V107 — dọn trùng lặp: việc bật/tắt .pl-task-context và exportDataBtn nay do DUY NHẤT script #pl-v841608-tas… |  |
| 51 | 9432–9462 | `pl-v8415102-unified-footer-runtime` | V150: dùng nguồn chung |  |
| 52 | 9464–9511 | `pl-v841591-proposal-material-work-ui` | V84.15.103 — controller riêng cho Đề xuất mua vật tư, dữ liệu và hành động giữ nguyên. | `PL142_SHOW_ALL`, `showPage`, `v82RenderLoadedPage` |
| 53 | 9513–9539 | `pl-v841594-single-footer-cleanup-runtime` | V84.15.104 — luôn đưa đúng một footer ra ngoài main, tránh hai lớp chân trang. |  |
| 54 | 9541–9562 | `pl-v841595-proposal-toolbar-actions` | V84.15.105 — bổ sung thao tác theo phiếu đang chọn, không thay đổi renderer dữ liệu. |  |
| 55 | 9564–9590 | `pl-v841606-proposal-view-check` | V84.15.106 — toolbar Xem luôn lấy đúng dòng đang chọn. |  |
| 56 | 9592–9601 | `pl-v841607-unified-view-order` | V84.15.107 — đánh dấu các trường dài để thẻ Xem có đúng nhịp với form nhập. |  |
| 57 | 9603–9628 | `pl-v841608-task-subbar-export-clean-runtime` | V107 — refreshBtn/addBtn/liveStatus/addMissingMaterialBtn giờ ẩn vĩnh viễn bằng CSS (mọi trang đã có toolba… | `showPage` |
| 58 | 9630–9703 | `pl-v841609-proposal-finance-stats-runtime` | V84.15.109 — tính riêng theo từng bảng, không cộng lẫn các loại đề xuất. | `showPage`, `v82RenderLoadedPage` |
| 59 | 9706–9778 | `pl-v841612-two-pane-runtime` | V84.15.116 — dùng một bố cục trường cho Thêm/Sửa/Xem trên toàn hệ thống. |  |
| 60 | 9779–9828 | `pl-v841592-proposal-equipment-work-ui` | V84.15.122 — Đề xuất mua thiết bị dùng cùng renderer/giao diện với bảng vật tư. | `PL142_SHOW_ALL`, `PROPOSAL_VIEW_ROWS`, `showPage`, `v82RenderLoadedPage`, `v16RenderGenericTable_` |
| 61 | 9829–9887 | `pl-v107-proposal-dispose-work-ui` | V107 — Đề xuất thanh lý dùng chung khung giao diện (pbm-shell/pbm-tools/ pbm-grid/pbm-footer) với Đề xuất m… | `PL142_SHOW_ALL`, `PROPOSAL_VIEW_ROWS`, `showPage`, `v82RenderLoadedPage`, `v16RenderGenericTable_` |
| 62 | 9888–9944 | `pl-v107-proposal-maintenance-work-ui` | V107 — Đề xuất bảo trì dùng chung khung giao diện với Đề xuất mua vật tư. Cột dữ liệu đổi theo cấu trúc DE_… | `PL142_SHOW_ALL`, `PROPOSAL_VIEW_ROWS`, `showPage`, `v82RenderLoadedPage`, `v16RenderGenericTable_` |
| 63 | 9945–9976 | `pl-v841592-equipment-work-ui` | V84.15.127 — Copy khung Công việc cho Kho thiết bị đang dùng; dữ liệu và CRUD dùng lại API hiện hữu. | `showPage`, `v82RenderLoadedPage` |
| 64 | 9978–10008 | `pl-v107-recovery-work-ui` | V107 — Copy khung giao diện Thiết bị đang dùng (ple-shell) cho Thu hồi thiết bị, đổi cột theo đúng cấu trúc… | `showPage`, `v82RenderLoadedPage`, `v16RenderGenericTable_` |
| 65 | 10009–10075 | `pl-v96-device-transfer-history` | V96 — Danh sách Lịch sử chuyển thiết bị (LICH_SU_CHUYEN_THIET_BI). Đăng ký dữ liệu vào V16_DATA.views để nú… |  |
| 66 | 10077–10163 | `pl-v86-maintenance-log-work-ui` | V86 — Nhật ký bảo trì: dựng lại theo đúng khung "Thiết bị đang dùng" (cùng CSS ple-*) để đồng bộ giao diện … | `showPage`, `v82RenderLoadedPage` |
| 67 | 10165–10253 | `pl-v86-maintenance-plan-work-ui` | V86 — Kế hoạch bảo trì: dựng lại theo đúng khung "Thiết bị đang dùng". Dữ liệu tự tính từ nhật ký + chu kỳ … | `showPage`, `v82RenderLoadedPage` |
| 68 | 10255–10288 | `pl-v225-material-warehouse-desktop-trim` | V225 — KHO VAT TU: an/xoa vat ly cot "Canh bao" khoi bang ton kho CHI tren Desktop. Bang nay dung renderDat… |  |
| 69 | 10290–10308 | `pl-v98-shared-page-watch` | V98 — Gộp 3 MutationObserver riêng lẻ (equipment/maintenanceLog/maintenancePlan) thành 1 observer dùng chun… |  |
| 70 | 10309–10659 | `pl-mobile-single-controller` | V155 — BỘ ĐIỀU KHIỂN MOBILE DUY NHẤT (viết gọn lại từ V216…V154) Nhiệm vụ, theo đúng thứ tự trong file: 1. … |  |
| 71 | 10661–10821 | `pl-v111-material-history-selected-no-action` | V111 — Một toolbar, một khung bảng và một khối CSS duy nhất cho Kho vật tư: Tìm / Xem / Sửa / Nhập-Xuất / L… | `v16RenderGenericTable_` |
| 72 | 10823–10869 | `pl-v107-generic-footer-runtime` | V107 — chân bảng thống nhất (pl-data-footer) cho các trang còn lại dùng chung v16RenderGenericTable_. Đơn v… | `v16RenderGenericTable_` |
| 73 | 10879–11085 | `pl-v135-catalog-sidebar` | V135 — Sidebar bộ lọc + thống kê (bên trái, 240px) cho 7 trang Danh Mục, dựng khung .plc-shell riêng thay h… | `showPage`, `v82RenderLoadedPage` |
| 74 | 11087–11233 | `pl-v136-operation-sidebar` | V136 — Sidebar bộ lọc + thống kê giống hệt .plc-shell ở trên, riêng cho "Chi tiết vận hành, kiểm tra thiết … | `operationFilterV841420`, `operationResetV841420`, `renderOperationDetailV841420`, `showPage`, `v82RenderLoadedPage` |
| 75 | 11234–11264 | `pl-v210-catalog-no-action-columns` | V210 — Danh mục: bỏ cột Thao tác khỏi DOM thật. Các renderer cũ vẫn được giữ nguyên để không thay đổi dữ li… | `v16RenderGenericTable_` |
| 76 | 11270–11338 | `pl-v137-system-lock-guard` | V137 — KHÓA MENU & TRANG HỆ THỐNG - Lớp bọc showPage ngoài cùng: mọi đường mở trang (menu desktop, menu mob… | `PINNED_MENU`, `showPage` |
| 77 | 11351–11361 | `pl-v145-daily-pager` | V145 — nút trang cho CV hằng ngày: gửi số trang về đúng bộ hiển thị đang vẽ bảng (lịch tháng hoặc tìm kiếm/… |  |
| 78 | 11362–11508 | `pl-v142-toolbar-delete-all` | V142 — Bổ sung nút "Xóa" và "Tất cả" ngay bên phải nút "Sửa" trên MỌI thanh công cụ có nút Sửa: Công việc, … |  |
| 79 | 11625–11686 | `pl-v151-toolbar-roles` | V151 — gắn vai trò (data-tool-role) cho từng nút thanh công cụ theo id/nhãn, để CSS phía trên tô CÙNG MỘT M… |  |
| 80 | 11723–11800 | `pl-v153-font-boost` | V153 — TĂNG CỠ CHỮ TOÀN HỆ THỐNG: mọi cỡ chữ đang khai báo bằng px được CỘNG THÊM một lượng cố định (mặc đị… |  |

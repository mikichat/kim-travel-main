import AbstractView from '../core/AbstractView.js';
import * as handlers from '../modules/eventHandlers.js';
import * as modals from '../modules/modals.js';
import * as api from '../modules/api.js';
import * as ui from '../modules/ui.js';

export default class Products extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Products");
    }

    async getHtml() {
        return `
            <section id="page-products" class="page-content active">
                <div class="page-header">
                    <h3>상품 관리</h3>
                    <div class="header-actions">
                        <button class="btn btn-info" id="btnDownloadProductTemplate">
                            <i class="fas fa-download"></i> 샘플 다운로드
                        </button>
                        <button class="btn btn-warning" id="btnImportProducts">
                            <i class="fas fa-file-upload"></i> 엑셀 업로드
                        </button>
                        <button class="btn btn-primary" id="btnAddProduct">
                            <i class="fas fa-plus"></i> 새 상품 추가
                        </button>
                    </div>
                </div>

                <div class="filters">
                    <input type="text" id="searchProducts" placeholder="검색 (상품명, 목적지)..." class="search-input">
                    <select id="filterProductStatus" class="filter-select">
                        <option value="">전체 상태</option>
                        <option value="활성">활성</option>
                        <option value="비활성">비활성</option>
                    </select>
                </div>

                <div class="products-grid" id="productsGrid">
                    <div class="empty-message">상품 데이터가 없습니다.</div>
                </div>
            </section>

             <!-- 모달: 상품 추가/편집 -->
            <div id="modalProduct" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalProductTitle">상품 추가</h3>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="formProduct" class="form">
                        <input type="hidden" id="productId">
                        <div class="form-group">
                            <label>상품명 *</label>
                            <input type="text" id="productName" required>
                        </div>
                        <div class="form-group">
                            <label>목적지 *</label>
                            <input type="text" id="productDestination" required>
                        </div>
                        <div class="form-group">
                            <label>여행 기간 (일) *</label>
                            <input type="number" id="productDuration" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>가격 *</label>
                            <input type="number" id="productPrice" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>상태 *</label>
                            <select id="productStatus" required>
                                <option value="활성">활성</option>
                                <option value="비활성">비활성</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label>상품 설명</label>
                            <textarea id="productDescription" rows="4"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary modal-close-btn">취소</button>
                            <button type="submit" class="btn btn-primary">저장</button>
                        </div>
                    </form>
                </div>
            </div>

            <input type="file" id="productFileInput" accept=".xlsx,.xls" style="display: none;">
        `;
    }

    async executeScript() {
        await handlers.loadAllData();
        ui.renderProductsGrid();

        const btnAdd = document.getElementById('btnAddProduct');
        if (btnAdd) btnAdd.addEventListener('click', () => modals.openProductModal());

        const form = document.getElementById('formProduct');
        if (form) form.addEventListener('submit', handlers.handleProductSubmit);

        // Modal Close
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => ui.closeModal('modalProduct'));
        });

        // Search & Filter
        document.getElementById('searchProducts').addEventListener('input', handlers.filterProducts);
        document.getElementById('filterProductStatus').addEventListener('change', handlers.filterProducts);

        // Grid Actions
        document.getElementById('productsGrid').addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const action = target.dataset.action;
            const id = target.dataset.id;

            if (action === 'edit-product') {
                modals.openProductModal(id);
            } else if (action === 'delete-product') {
                if (confirm('정말 이 상품을 삭제하시겠습니까?')) {
                    await api.deleteTableData('products', id);
                    await handlers.loadAllData();
                    ui.renderProductsGrid();
                    ui.showNotification('상품이 삭제되었습니다.', 'success');
                }
            }
        });
    }
}

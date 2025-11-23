import AbstractView from '../core/AbstractView.js';
import * as handlers from '../modules/eventHandlers.js';
import * as modals from '../modules/modals.js';
import * as api from '../modules/api.js';
import * as ui from '../modules/ui.js';

export default class Customers extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Customers");
    }

    async getHtml() {
        return `
            <section id="page-customers" class="page-content active">
                <div class="page-header">
                    <h3>고객 관리</h3>
                    <div class="header-actions">
                        <button class="btn btn-info" id="btnDownloadCustomerTemplate">
                            <i class="fas fa-download"></i> 샘플 다운로드
                        </button>
                        <button class="btn btn-warning" id="btnImportCustomers">
                            <i class="fas fa-file-upload"></i> 엑셀 업로드
                        </button>
                        <button class="btn btn-success" id="btnExportCustomers">
                            <i class="fas fa-file-excel"></i> 엑셀 내보내기
                        </button>
                        <button class="btn btn-primary" id="btnAddCustomer">
                            <i class="fas fa-plus"></i> 새 고객 추가
                        </button>
                    </div>
                </div>

                <div class="filters">
                    <input type="text" id="searchCustomers" placeholder="검색 (이름, 여권번호, 연락처)..." class="search-input">
                    <label class="security-toggle">
                        <input type="checkbox" id="toggleSecurity" checked>
                        <i class="fas fa-shield-alt"></i> 보안 모드
                    </label>
                </div>

                <div class="table-wrapper">
                    <table id="customersTable">
                        <thead>
                            <tr>
                                <th>한글명</th>
                                <th>영문명</th>
                                <th>여권번호</th>
                                <th>생년월일</th>
                                <th>여권만료일</th>
                                <th>연락처</th>
                                <th>이메일</th>
                                <th>여행이력</th>
                                <th>여권사본</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="10" class="empty-message">고객 데이터가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- 모달: 고객 추가/편집 -->
            <div id="modalCustomer" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3 id="modalCustomerTitle">고객 추가</h3>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="formCustomer" class="form">
                        <input type="hidden" id="customerId">

                        <h4 class="form-section-title"><i class="fas fa-user"></i> 기본 정보</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>한글명 *</label>
                                <input type="text" id="customerNameKor" required placeholder="홍길동">
                            </div>
                            <div class="form-group">
                                <label>영문명 (여권상) *</label>
                                <input type="text" id="customerNameEng" required placeholder="HONG GILDONG">
                            </div>
                            <div class="form-group">
                                <label>생년월일 *</label>
                                <input type="date" id="customerBirthDate" required>
                            </div>
                            <div class="form-group">
                                <label>연락처 *</label>
                                <input type="tel" id="customerPhone" required placeholder="010-1234-5678">
                            </div>
                            <div class="form-group">
                                <label>이메일</label>
                                <input type="email" id="customerEmail" placeholder="example@email.com">
                            </div>
                            <div class="form-group">
                                <label>주소</label>
                                <input type="text" id="customerAddress" placeholder="서울시 강남구">
                            </div>
                        </div>

                        <h4 class="form-section-title"><i class="fas fa-passport"></i> 여권 정보</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>여권번호 *</label>
                                <input type="text" id="customerPassportNumber" required placeholder="M12345678" pattern="[A-Z0-9]+" style="text-transform: uppercase;">
                            </div>
                            <div class="form-group">
                                <label>여권 만료일 *</label>
                                <input type="date" id="customerPassportExpiry" required>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label><i class="fas fa-file-image"></i> 여권 사본</label>
                            <div class="file-upload-area">
                                <input type="file" id="customerPassportFile" accept="image/*,.pdf" style="display: none;">
                                <button type="button" class="btn btn-secondary" id="btnSelectPassportFile">
                                    <i class="fas fa-upload"></i> 파일 선택
                                </button>
                                <span id="passportFileName" class="file-name">선택된 파일 없음</span>
                                <button type="button" class="btn btn-sm btn-danger" id="btnRemovePassport" style="display: none;">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <small class="form-help">이미지 또는 PDF 파일 (최대 2MB)</small>
                            <div id="passportPreview" class="passport-preview"></div>
                        </div>

                        <h4 class="form-section-title"><i class="fas fa-globe"></i> 여행 정보</h4>
                        <div class="form-group full-width">
                            <label>여행 이력 (기존 여행지)</label>
                            <textarea id="customerTravelHistory" rows="3" placeholder="예: 일본(2022), 태국(2023), 베트남(2024)"></textarea>
                        </div>

                        <div class="form-group full-width">
                            <label>비고</label>
                            <textarea id="customerNotes" rows="3" placeholder="기타 특이사항이나 메모"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary modal-close-btn">취소</button>
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> 저장</button>
                        </div>
                    </form>
                </div>
            </div>

            <input type="file" id="customerFileInput" accept=".xlsx,.xls" style="display: none;">
        `;
    }

    async executeScript() {
        // Load data if not loaded
        await handlers.loadAllData();

        // Render Initial Table
        ui.renderCustomersTable();

        // Attach Event Listeners
        const btnAdd = document.getElementById('btnAddCustomer');
        if (btnAdd) btnAdd.addEventListener('click', () => modals.openCustomerModal());

        const form = document.getElementById('formCustomer');
        if (form) form.addEventListener('submit', handlers.handleCustomerSubmit);

        const searchInput = document.getElementById('searchCustomers');
        if (searchInput) searchInput.addEventListener('input', handlers.filterCustomers);

        // Modal Close Buttons
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => ui.closeModal('modalCustomer'));
        });

        // Passport File
        document.getElementById('btnSelectPassportFile').addEventListener('click', () => {
             document.getElementById('customerPassportFile').click();
        });

        // Event Delegation for Table Actions
        document.getElementById('customersTable').addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const action = target.dataset.action;
            const id = target.dataset.id;

            if (action === 'edit-customer') {
                modals.openCustomerModal(id);
            } else if (action === 'delete-customer') {
                if (confirm('정말 이 고객을 삭제하시겠습니까?')) {
                    await api.deleteTableData('customers', id);
                    await handlers.loadAllData();
                    ui.renderCustomersTable(); // Need to call render directly as updateDashboard might not target this view specifically or be too broad
                    ui.showNotification('고객이 삭제되었습니다.', 'success');
                }
            }
        });
    }
}

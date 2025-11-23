import AbstractView from '../core/AbstractView.js';
import * as handlers from '../modules/eventHandlers.js';
import * as modals from '../modules/modals.js';
import * as api from '../modules/api.js';
import * as ui from '../modules/ui.js';

export default class Bookings extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Bookings");
    }

    async getHtml() {
        return `
            <section id="page-bookings" class="page-content active">
                <div class="page-header">
                    <h3>예약 관리</h3>
                    <div class="header-actions">
                        <button class="btn btn-info" id="btnDownloadBookingTemplate">
                            <i class="fas fa-download"></i> 샘플 다운로드
                        </button>
                        <button class="btn btn-warning" id="btnImportBookings">
                            <i class="fas fa-file-upload"></i> 엑셀 업로드
                        </button>
                        <button class="btn btn-primary" id="btnAddBooking">
                            <i class="fas fa-plus"></i> 새 예약 추가
                        </button>
                    </div>
                </div>

                <div class="filters">
                    <input type="text" id="searchBookings" placeholder="검색 (고객명, 상품명, 예약번호)..." class="search-input">
                    <select id="filterBookingStatus" class="filter-select">
                        <option value="">전체 상태</option>
                        <option value="문의">문의</option>
                        <option value="견적발송">견적발송</option>
                        <option value="예약확정">예약확정</option>
                        <option value="출발완료">출발완료</option>
                        <option value="여행완료">여행완료</option>
                        <option value="취소">취소</option>
                    </select>
                </div>

                <div class="table-wrapper">
                    <table id="bookingsTable">
                        <thead>
                            <tr>
                                <th>예약번호</th>
                                <th>고객명</th>
                                <th>상품명</th>
                                <th>출발일</th>
                                <th>귀국일</th>
                                <th>인원</th>
                                <th>금액</th>
                                <th>상태</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="9" class="empty-message">예약 데이터가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

             <!-- 모달: 예약 추가/편집 -->
            <div id="modalBooking" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalBookingTitle">예약 추가</h3>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="formBooking" class="form">
                        <input type="hidden" id="bookingId">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>고객 선택 *</label>
                                <select id="bookingCustomer" required>
                                    <option value="">고객을 선택하세요</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>상품 선택 *</label>
                                <select id="bookingProduct" required>
                                    <option value="">상품을 선택하세요</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>출발일 *</label>
                                <input type="date" id="bookingDepartureDate" required>
                            </div>
                            <div class="form-group">
                                <label>귀국일 *</label>
                                <input type="date" id="bookingReturnDate" required>
                            </div>
                            <div class="form-group">
                                <label>인원 *</label>
                                <input type="number" id="bookingParticipants" min="1" value="1" required>
                            </div>
                            <div class="form-group">
                                <label>총 금액 *</label>
                                <input type="number" id="bookingTotalPrice" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>호텔명</label>
                                <input type="text" id="bookingHotel">
                            </div>
                            <div class="form-group">
                                <label>항공편명</label>
                                <input type="text" id="bookingFlight">
                            </div>
                            <div class="form-group">
                                <label>상태 *</label>
                                <select id="bookingStatus" required>
                                    <option value="문의">문의</option>
                                    <option value="견적발송">견적발송</option>
                                    <option value="예약확정">예약확정</option>
                                    <option value="출발완료">출발완료</option>
                                    <option value="여행완료">여행완료</option>
                                    <option value="취소">취소</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group full-width">
                            <label>메모</label>
                            <textarea id="bookingNotes" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary modal-close-btn">취소</button>
                            <button type="submit" class="btn btn-primary">저장</button>
                        </div>
                    </form>
                </div>
            </div>

            <input type="file" id="bookingFileInput" accept=".xlsx,.xls" style="display: none;">
        `;
    }

    async executeScript() {
        await handlers.loadAllData();
        ui.renderBookingsTable();

        const btnAdd = document.getElementById('btnAddBooking');
        if (btnAdd) btnAdd.addEventListener('click', () => modals.openBookingModal());

        const form = document.getElementById('formBooking');
        if (form) form.addEventListener('submit', handlers.handleBookingSubmit);

        // Modal Close
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => ui.closeModal('modalBooking'));
        });

        // Search & Filter
        document.getElementById('searchBookings').addEventListener('input', handlers.filterBookings);
        document.getElementById('filterBookingStatus').addEventListener('change', handlers.filterBookings);

        // Table Actions
        document.getElementById('bookingsTable').addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const action = target.dataset.action;
            const id = target.dataset.id;

            if (action === 'edit-booking') {
                modals.openBookingModal(id);
            } else if (action === 'delete-booking') {
                if (confirm('정말 이 예약을 삭제하시겠습니까?')) {
                    await api.deleteTableData('bookings', id);
                    await handlers.loadAllData();
                    ui.renderBookingsTable();
                    ui.showNotification('예약이 삭제되었습니다.', 'success');
                }
            }
        });
    }
}

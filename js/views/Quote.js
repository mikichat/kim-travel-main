import AbstractView from '../core/AbstractView.js';

export default class Quote extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Quote");
    }

    async getHtml() {
        return `
            <section id="page-quote" class="page-content active">
                <div class="page-header">
                    <h3>견적서 생성</h3>
                </div>

                <div class="quote-form-container">
                    <form id="quoteForm" class="form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>고객 선택</label>
                                <select id="quoteCustomer" required>
                                    <option value="">고객을 선택하세요</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>상품 선택</label>
                                <select id="quoteProduct" required>
                                    <option value="">상품을 선택하세요</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>출발일</label>
                                <input type="date" id="quoteDepartureDate" required>
                            </div>
                            <div class="form-group">
                                <label>귀국일</label>
                                <input type="date" id="quoteReturnDate" required>
                            </div>
                            <div class="form-group">
                                <label>인원</label>
                                <input type="number" id="quoteParticipants" min="1" value="1" required>
                            </div>
                            <div class="form-group">
                                <label>호텔명 (선택)</label>
                                <input type="text" id="quoteHotel">
                            </div>
                            <div class="form-group">
                                <label>항공편 (선택)</label>
                                <input type="text" id="quoteFlight">
                            </div>
                            <div class="form-group">
                                <label>추가 금액</label>
                                <input type="number" id="quoteAdditionalPrice" value="0">
                            </div>
                        </div>
                        <div class="form-group full-width">
                            <label>메모</label>
                            <textarea id="quoteNotes" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="btnPreviewQuote">
                                <i class="fas fa-eye"></i> 미리보기
                            </button>
                            <button type="button" class="btn btn-primary" id="btnGenerateQuote">
                                <i class="fas fa-file-pdf"></i> 견적서 생성 (인쇄)
                            </button>
                        </div>
                    </form>
                </div>

                <div id="quotePreview" class="quote-preview" style="display: none;">
                    <!-- 견적서 미리보기가 여기에 표시됩니다 -->
                </div>
            </section>
        `;
    }
}

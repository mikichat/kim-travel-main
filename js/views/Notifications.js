import AbstractView from '../core/AbstractView.js';

export default class Notifications extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Notifications");
    }

    async getHtml() {
        return `
            <section id="page-notifications" class="page-content active">
                <div class="page-header">
                    <h3>알림 관리</h3>
                    <div class="header-actions">
                        <button class="btn btn-secondary" id="btnRefreshNotifications">
                            <i class="fas fa-sync-alt"></i> 새로고침
                        </button>
                        <button class="btn btn-danger" id="btnClearAllNotifications">
                            <i class="fas fa-trash"></i> 모두 삭제
                        </button>
                    </div>
                </div>

                <!-- 알림 설정 카드 -->
                <div class="alert-settings-card">
                    <h4><i class="fas fa-cog"></i> 알림 설정</h4>
                    <p>출발일 기준으로 자동 알림이 생성됩니다.</p>
                    <div class="alert-rules">
                        <div class="alert-rule">
                            <div class="alert-rule-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                                <i class="fas fa-passport"></i>
                            </div>
                            <div class="alert-rule-info">
                                <h5>여권 확인</h5>
                                <p>출발 <strong>30일 전</strong> - 여권 유효기간 확인 필요</p>
                            </div>
                        </div>
                        <div class="alert-rule">
                            <div class="alert-rule-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                                <i class="fas fa-suitcase"></i>
                            </div>
                            <div class="alert-rule-info">
                                <h5>출발 준비</h5>
                                <p>출발 <strong>7일 전</strong> - 여행 준비 안내</p>
                            </div>
                        </div>
                        <div class="alert-rule">
                            <div class="alert-rule-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-rule-info">
                                <h5>출발 임박</h5>
                                <p>출발 <strong>3일 전</strong> - 최종 확인 알림</p>
                            </div>
                        </div>
                        <div class="alert-rule">
                            <div class="alert-rule-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                                <i class="fas fa-plane-departure"></i>
                            </div>
                            <div class="alert-rule-info">
                                <h5>출발 당일</h5>
                                <p>출발 <strong>당일</strong> - 출발 안내</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 필터 -->
                <div class="filters">
                    <select id="filterNotificationType" class="filter-select">
                        <option value="">전체 알림</option>
                        <option value="여권확인">여권 확인</option>
                        <option value="출발준비">출발 준비</option>
                        <option value="출발임박">출발 임박</option>
                        <option value="당일">출발 당일</option>
                    </select>
                    <select id="filterNotificationStatus" class="filter-select">
                        <option value="">전체 상태</option>
                        <option value="unread">읽지 않음</option>
                        <option value="read">읽음</option>
                    </select>
                </div>

                <!-- 알림 목록 -->
                <div class="notifications-container" id="notificationsContainer">
                    <div class="empty-message">알림이 없습니다.</div>
                </div>
            </section>
        `;
    }
}

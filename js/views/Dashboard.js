import AbstractView from '../core/AbstractView.js';

export default class Dashboard extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Dashboard");
    }

    async getHtml() {
        return `
            <section id="page-dashboard" class="page-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="statTotalBookings">0</h3>
                            <p>총 예약</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="statTotalCustomers">0</h3>
                            <p>총 고객</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="statPendingBookings">0</h3>
                            <p>대기 중 예약</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <i class="fas fa-won-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="statTotalRevenue">0원</h3>
                            <p>총 매출</p>
                        </div>
                    </div>
                </div>

                <div class="calendar-todo-grid">
                    <!-- 달력 -->
                    <div class="calendar-card">
                        <div class="calendar-header">
                            <button class="btn-icon" id="btnPrevMonth">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <h3 id="calendarTitle">2024년 11월</h3>
                            <button class="btn-icon" id="btnNextMonth">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="calendar-weekdays">
                            <div class="weekday">일</div>
                            <div class="weekday">월</div>
                            <div class="weekday">화</div>
                            <div class="weekday">수</div>
                            <div class="weekday">목</div>
                            <div class="weekday">금</div>
                            <div class="weekday">토</div>
                        </div>
                        <div class="calendar-days" id="calendarDays">
                            <!-- 달력 날짜가 여기에 표시됩니다 -->
                        </div>
                        <div class="calendar-legend">
                            <div class="legend-item">
                                <span class="legend-dot departure"></span> 출발일
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot arrival"></span> 도착일
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot todo"></span> 할 일
                            </div>
                        </div>
                    </div>

                    <!-- 할 일 관리 -->
                    <div class="todo-card">
                        <div class="todo-header">
                            <h3><i class="fas fa-tasks"></i> 할 일 관리</h3>
                            <button class="btn btn-sm btn-primary" id="btnAddTodo">
                                <i class="fas fa-plus"></i> 추가
                            </button>
                        </div>
                        <div class="todo-list" id="todoList">
                            <div class="empty-message">할 일이 없습니다.</div>
                        </div>
                    </div>
                </div>

                <div class="recent-bookings">
                    <h3>최근 예약</h3>
                    <div class="table-wrapper">
                        <table id="recentBookingsTable">
                            <thead>
                                <tr>
                                    <th>예약번호</th>
                                    <th>고객명</th>
                                    <th>상품명</th>
                                    <th>출발일</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="5" class="empty-message">예약 데이터가 없습니다.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    }

    async executeScript() {
        // Trigger dashboard updates from existing modules
        // In a real refactor, we would move the logic here or call a specific init function
        if (window.app && window.app.updateDashboard) {
             window.app.updateDashboard();
        }
    }
}

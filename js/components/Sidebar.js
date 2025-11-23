export default function Sidebar() {
    return `
    <aside class="sidebar">
        <div class="sidebar-header">
            <i class="fas fa-plane-departure"></i>
            <h1>여행사 관리</h1>
        </div>
        <nav class="sidebar-nav">
            <a href="#/dashboard" class="nav-item" data-page="dashboard">
                <i class="fas fa-chart-line"></i>
                <span>대시보드</span>
            </a>
            <a href="#/bookings" class="nav-item" data-page="bookings">
                <i class="fas fa-calendar-check"></i>
                <span>예약 관리</span>
            </a>
            <a href="#/customers" class="nav-item" data-page="customers">
                <i class="fas fa-users"></i>
                <span>고객 관리</span>
            </a>
            <a href="#/products" class="nav-item" data-page="products">
                <i class="fas fa-map-marked-alt"></i>
                <span>상품 관리</span>
            </a>
            <a href="#/quote" class="nav-item" data-page="quote">
                <i class="fas fa-file-invoice-dollar"></i>
                <span>견적서 생성</span>
            </a>
            <a href="#/notifications" class="nav-item" data-page="notifications">
                <i class="fas fa-bell"></i>
                <span>알림 관리</span>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </a>
            <a href="#/schedules" class="nav-item" data-page="schedules">
                <i class="fas fa-calendar-alt"></i>
                <span>일정 관리</span>
            </a>
        </nav>
    </aside>
    `;
}

export default function Header() {
    return `
    <header class="header">
        <div class="header-left">
            <button class="btn-menu" id="btnToggleSidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h2 id="pageTitle">대시보드</h2>
        </div>
        <div class="header-right">
            <button class="btn-notification" id="btnNotificationCenter" title="알림">
                <i class="fas fa-bell"></i>
                <span class="notification-count" id="notificationCount" style="display: none;">0</span>
            </button>
            <span class="date-display" id="currentDate"></span>
        </div>
    </header>

    <!-- 알림 센터 드롭다운 -->
    <div class="notification-dropdown" id="notificationDropdown" style="display: none;">
        <div class="notification-header">
            <h3><i class="fas fa-bell"></i> 알림</h3>
            <button class="btn-text" id="btnMarkAllRead">모두 읽음</button>
        </div>
        <div class="notification-list" id="notificationList">
            <div class="empty-notification">알림이 없습니다.</div>
        </div>
    </div>
    `;
}

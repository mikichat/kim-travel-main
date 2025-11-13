// js/modules/ui.js
import { state } from './state.js';

// ==================== UI Rendering ====================

export function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

export function navigateToPage(page) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    const titles = {
        dashboard: '대시보드',
        bookings: '예약 관리',
        customers: '고객 관리',
        products: '상품 관리',
        quote: '견적서 생성',
        notifications: '알림 관리'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    state.currentPage = page;

    if (page === 'dashboard') {
        updateDashboard();
    }
    if (page === 'notifications') {
        renderNotifications();
    }
}

export function updateDashboard() {
    document.getElementById('statTotalBookings').textContent = state.bookings.length;
    document.getElementById('statTotalCustomers').textContent = state.customers.length;
    
    const pendingBookings = state.bookings.filter(b => 
        ['문의', '견적발송', '예약확정'].includes(b.status)
    ).length;
    document.getElementById('statPendingBookings').textContent = pendingBookings;

    const totalRevenue = state.bookings
        .filter(b => b.status === '여행완료')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);
    document.getElementById('statTotalRevenue').textContent = 
        totalRevenue.toLocaleString() + '원';

    renderRecentBookings();
    renderCalendar();
}

export function renderRecentBookings() {
    const tbody = document.querySelector('#recentBookingsTable tbody');
    const recentBookings = [...state.bookings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    if (recentBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">예약 데이터가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = recentBookings.map(booking => `
        <tr>
            <td>${booking.id.substring(0, 8)}</td>
            <td>${booking.customer_name}</td>
            <td>${booking.product_name}</td>
            <td>${booking.departure_date || '-'}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
        </tr>
    `).join('');
}

export function renderCustomersTable(customers = state.customers) {
    const tbody = document.querySelector('#customersTable tbody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-message">고객 데이터가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name_kor || '-'}</td>
            <td>${customer.name_eng || '-'}</td>
            <td class="sensitive-data">${customer.passport_number ? maskSensitiveData(customer.passport_number, 'passport') : '-'}</td>
            <td class="sensitive-data">${customer.birth_date ? maskSensitiveData(customer.birth_date, 'birth') : '-'}</td>
            <td>${customer.passport_expiry ? formatDate(customer.passport_expiry) : '-'}</td>
            <td class="sensitive-data">${customer.phone ? maskSensitiveData(customer.phone, 'phone') : '-'}</td>
            <td class="sensitive-data">${customer.email ? maskSensitiveData(customer.email, 'email') : '-'}</td>
            <td>${customer.travel_history ? (customer.travel_history.substring(0, 20) + (customer.travel_history.length > 20 ? '...' : '')) : '-'}</td>
            <td>${customer.passport_file_name ? `<i class="fas fa-file-image text-success"></i> ${customer.passport_file_name}` : '-'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" data-action="edit-customer" data-id="${customer.id}" title="수정">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete-customer" data-id="${customer.id}" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

export function renderProductsGrid(products = state.products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-message">상품 데이터가 없습니다.</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-header">
                <div>
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-destination">
                        <i class="fas fa-map-marker-alt"></i> ${product.destination}
                    </p>
                </div>
                <span class="status-badge status-${product.status}">${product.status}</span>
            </div>
            <div class="product-info">
                <div class="product-info-item">
                    <span class="product-info-label">기간</span>
                    <span class="product-info-value">${product.duration}일</span>
                </div>
                <div class="product-info-item">
                    <span class="product-info-label">가격</span>
                    <span class="product-info-value">${product.price.toLocaleString()}원</span>
                </div>
            </div>
            ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
            <div class="product-actions">
                <button class="btn btn-sm btn-secondary" data-action="edit-product" data-id="${product.id}">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

export function renderBookingsTable(bookings = state.bookings) {
    const tbody = document.querySelector('#bookingsTable tbody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-message">예약 데이터가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id.substring(0, 8)}</td>
            <td>${booking.customer_name}</td>
            <td>${booking.product_name}</td>
            <td>${booking.departure_date || '-'}</td>
            <td>${booking.return_date || '-'}</td>
            <td>${booking.participants}</td>
            <td>${(booking.total_price || 0).toLocaleString()}원</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" data-action="edit-booking" data-id="${booking.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete-booking" data-id="${booking.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

export function renderNotifications(notifications = state.notifications) {
    const container = document.getElementById('notificationsContainer');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-message">알림이 없습니다.</div>';
        return;
    }

    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );

    container.innerHTML = sortedNotifications.map(notification => {
        const iconClass = getNotificationIcon(notification.notification_type);
        const iconColor = getNotificationColor(notification.notification_type);
        const readClass = notification.is_read ? 'read' : '';
        const priorityBadge = notification.priority === '높음' ? '<span class="priority-badge">긴급</span>' : '';
        
        return `
            <div class="notification-card ${readClass}">
                <div class="notification-card-icon" style="background: ${iconColor};">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-card-content">
                    <div class="notification-card-header">
                        <h4>${notification.notification_type} ${priorityBadge}</h4>
                        <span class="notification-card-time">${formatDateTime(notification.created_at)}</span>
                    </div>
                    <p class="notification-card-message">${notification.message}</p>
                    <div class="notification-card-meta">
                        <span><i class="fas fa-user"></i> ${notification.customer_name}</span>
                        <span><i class="fas fa-map-marked-alt"></i> ${notification.product_name}</span>
                        <span><i class="fas fa-calendar"></i> 출발: ${notification.departure_date}</span>
                        <span><i class="fas fa-clock"></i> D-${notification.days_before}</span>
                    </div>
                </div>
                <div class="notification-card-actions">
                    ${!notification.is_read ? 
                        `<button class="btn btn-sm btn-secondary" data-action="mark-notification-read" data-id="${notification.id}">
                            <i class="fas fa-check"></i> 읽음
                        </button>` : 
                        '<span class="text-muted"><i class="fas fa-check-double"></i> 읽음</span>'
                    }
                    <button class="btn btn-sm btn-danger" data-action="delete-notification" data-id="${notification.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

export function renderCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarTitle = document.getElementById('calendarTitle');
    
    calendarDays.innerHTML = '';
    const today = new Date();
    const firstDay = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1);
    const lastDay = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 0);

    calendarTitle.textContent = `${state.currentMonth.getFullYear()}년 ${state.currentMonth.getMonth() + 1}월`;

    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarDays.innerHTML += `<div class="calendar-day other-month"></div>`;
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), i);
        const dateString = date.toISOString().split('T')[0];
        
        let dayClass = 'calendar-day';
        if (date.toDateString() === today.toDateString()) {
            dayClass += ' today';
        }

        const departures = state.bookings.filter(b => b.departure_date === dateString);
        const arrivals = state.bookings.filter(b => b.return_date === dateString);
        const todos = state.todos.filter(t => t.due_date === dateString && !t.is_completed);

        let eventsHTML = '<div class="day-events">';
        if (departures.length > 0) {
            eventsHTML += `<div class="event departure" title="${departures.map(b => b.customer_name).join(', ')} 출발">${departures.length} 출발</div>`;
        }
        if (arrivals.length > 0) {
            eventsHTML += `<div class="event arrival" title="${arrivals.map(b => b.customer_name).join(', ')} 도착">${arrivals.length} 도착</div>`;
        }
        if (todos.length > 0) {
            eventsHTML += `<div class="day-todos" title="${todos.map(t => t.title).join(', ')}"><i class="fas fa-tasks"></i> ${todos.length}개</div>`;
        }
        eventsHTML += '</div>';

        calendarDays.innerHTML += `
            <div class="${dayClass}" data-date="${dateString}">
                <div class="day-number">${i}</div>
                ${eventsHTML}
            </div>
        `;
    }
}

export function renderTodos() {
    const todoList = document.getElementById('todoList');
    const sortedTodos = [...state.todos].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    if (sortedTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-message">할 일이 없습니다.</div>';
        return;
    }

    todoList.innerHTML = sortedTodos.map(todo => {
        const isOverdue = new Date(todo.due_date) < new Date() && !todo.is_completed;
        let itemClass = 'todo-item';
        if (todo.is_completed) itemClass += ' completed';
        if (isOverdue) itemClass += ' overdue';
        if (todo.priority === '높음') itemClass += ' high';

        return `
            <div class="${itemClass}" data-id="${todo.id}">
                <div class="todo-checkbox">
                    <input type="checkbox" data-action="toggle-todo" ${todo.is_completed ? 'checked' : ''}>
                </div>
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-meta">
                        <span class="todo-date"><i class="fas fa-calendar-alt"></i> ${todo.due_date}</span>
                        <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                    </div>
                    ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                </div>
                <button class="btn-icon-sm" data-action="delete-todo" title="삭제"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');
}


// ==================== Modals and Selects ====================

export function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

export function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

export function updateCustomerSelects() {
    const selects = [
        document.getElementById('bookingCustomer'),
        document.getElementById('quoteCustomer')
    ];

    selects.forEach(select => {
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">고객을 선택하세요</option>' +
                state.customers.map(c => 
                    `<option value="${c.id}" data-name="${c.name_kor || c.name_eng}">${c.name_kor || c.name_eng} (${c.phone})</option>`
                ).join('');
            select.value = currentValue;
        }
    });
}

export function updateProductSelects() {
    const selects = [
        document.getElementById('bookingProduct'),
        document.getElementById('quoteProduct')
    ];

    selects.forEach(select => {
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">상품을 선택하세요</option>' +
                state.products
                    .filter(p => p.status === '활성')
                    .map(p => 
                        `<option value="${p.id}" data-name="${p.name}" data-price="${p.price}">${p.name} - ${p.destination} (${p.price.toLocaleString()}원)</option>`
                    ).join('');
            select.value = currentValue;
        }
    });
}


// ==================== Helpers ====================

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

export function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function maskSensitiveData(text, type = 'default') {
    if (!text || !state.securityMode) return text;
    
    switch(type) {
        case 'passport':
            return text.substring(0, 1) + '****' + text.substring(text.length - 4);
        case 'birth':
            return text.substring(0, 5) + '**-**';
        case 'phone':
            const parts = text.split('-');
            if (parts.length === 3) {
                return parts[0] + '-****-' + parts[2];
            }
            return text;
        case 'email':
            const [username, domain] = text.split('@');
            if (username && domain) {
                return username.substring(0, 2) + '***@' + domain;
            }
            return text;
        default:
            return text;
    }
}

function getNotificationIcon(type) {
    const icons = {
        '여권확인': 'fas fa-passport',
        '출발준비': 'fas fa-suitcase',
        '출발임박': 'fas fa-exclamation-triangle',
        '당일': 'fas fa-plane-departure'
    };
    return icons[type] || 'fas fa-bell';
}

function getNotificationColor(type) {
    const colors = {
        '여권확인': 'linear-gradient(135deg, #f59e0b, #d97706)',
        '출발준비': 'linear-gradient(135deg, #3b82f6, #2563eb)',
        '출발임박': 'linear-gradient(135deg, #ef4444, #dc2626)',
        '당일': 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    };
    return colors[type] || 'linear-gradient(135deg, #64748b, #475569)';
}

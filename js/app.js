// js/app.js (Main Orchestrator)
import { state } from './modules/state.js';
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import * as handlers from './modules/eventHandlers.js';
import * as modals from './modules/modals.js';
import { checkAndAddSampleData } from './modules/sampleData.js';

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', async () => {
    await checkAndAddSampleData();
    initializeEventListeners();
    await handlers.loadAllData();
    ui.updateDashboard();
    updateCurrentDate();
});

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateElement.textContent = now.toLocaleDateString('ko-KR', options);
}

// ==================== Event Listeners Setup ====================

function initializeEventListeners() {
    // Navigation
    document.querySelector('.sidebar-nav').addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault();
            ui.navigateToPage(navItem.dataset.page);
        }
    });

    // Sidebar Toggle
    document.getElementById('btnToggleSidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Modals Close
    document.addEventListener('click', (e) => {
        if (e.target.matches('.modal-close') || e.target.closest('.modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) ui.closeModal(modal.id);
        }
    });

    // Form Submissions
    document.getElementById('formCustomer').addEventListener('submit', handlers.handleCustomerSubmit);
    document.getElementById('formProduct').addEventListener('submit', handlers.handleProductSubmit);
    document.getElementById('formBooking').addEventListener('submit', handlers.handleBookingSubmit);
    document.getElementById('formTodo').addEventListener('submit', handlers.handleTodoSubmit);

    // Filters and Search
    document.getElementById('searchCustomers').addEventListener('input', handlers.filterCustomers);
    document.getElementById('searchProducts').addEventListener('input', handlers.filterProducts);
    document.getElementById('filterProductStatus').addEventListener('change', handlers.filterProducts);
    document.getElementById('searchBookings').addEventListener('input', handlers.filterBookings);
    document.getElementById('filterBookingStatus').addEventListener('change', handlers.filterBookings);

    // Add/Open Modal Buttons
    document.getElementById('btnAddCustomer').addEventListener('click', () => modals.openCustomerModal());
    document.getElementById('btnAddProduct').addEventListener('click', () => modals.openProductModal());
    document.getElementById('btnAddBooking').addEventListener('click', () => modals.openBookingModal());
    document.getElementById('btnAddTodo').addEventListener('click', () => modals.openTodoModal());

    // Event delegation for dynamic elements (edit/delete buttons)
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
                ui.updateDashboard();
                ui.showNotification('고객이 삭제되었습니다.', 'success');
            }
        }
    });

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
                ui.updateDashboard();
                ui.showNotification('상품이 삭제되었습니다.', 'success');
            }
        }
    });

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
                ui.updateDashboard();
                ui.showNotification('예약이 삭제되었습니다.', 'success');
            }
        }
    });
}

// 예약 엑셀 파일 업로드
async function handleBookingFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        showNotification('파일을 읽는 중...', 'info');
        
        const data = await readExcelFile(file);
        
        if (!data || data.length === 0) {
            showNotification('파일에 데이터가 없습니다.', 'error');
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            if (!row['고객ID'] || !row['상품ID'] || !row['출발일'] || 
                !row['귀국일'] || !row['인원'] || !row['총금액'] || !row['상태']) {
                errors.push(`${i + 2}행: 필수 필드가 누락되었습니다.`);
                errorCount++;
                continue;
            }

            try {
                // 고객과 상품 정보 찾기
                const customer = state.customers.find(c => c.id === row['고객ID']);
                const product = state.products.find(p => p.id === row['상품ID']);

                if (!customer) {
                    errors.push(`${i + 2}행: 고객ID를 찾을 수 없습니다.`);
                    errorCount++;
                    continue;
                }

                if (!product) {
                    errors.push(`${i + 2}행: 상품ID를 찾을 수 없습니다.`);
                    errorCount++;
                    continue;
                }

                const bookingData = {
                    customer_id: row['고객ID'],
                    customer_name: customer.name_kor || customer.name_eng,
                    product_id: row['상품ID'],
                    product_name: product.name,
                    departure_date: formatDateFromExcel(row['출발일']),
                    return_date: formatDateFromExcel(row['귀국일']),
                    participants: parseInt(row['인원']),
                    total_price: parseInt(row['총금액']),
                    hotel_name: row['호텔명'] || '',
                    flight_number: row['항공편'] || '',
                    status: row['상태'],
                    notes: row['메모'] || ''
                };

                await fetch('tables/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                successCount++;
            } catch (error) {
                errors.push(`${i + 2}행: ${error.message}`);
                errorCount++;
            }
        }

        await loadBookings();
        await checkAndGenerateNotifications();
        updateDashboard();
        
        let message = `업로드 완료!\n성공: ${successCount}건`;
        if (errorCount > 0) {
            message += `\n실패: ${errorCount}건`;
            if (errors.length > 0) {
                console.error('업로드 오류:', errors);
                message += '\n(자세한 내용은 콘솔을 확인하세요)';
            }
        }
        
        showNotification(message, errorCount > 0 ? 'warning' : 'success');
        
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        showNotification('파일 업로드 중 오류가 발생했습니다.', 'error');
    }
    
    e.target.value = '';
}

// 엑셀 파일 읽기
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// 엑셀 날짜 형식 변환
function formatDateFromExcel(dateValue) {
    if (!dateValue) return '';
    
    // 이미 문자열 형식인 경우
    if (typeof dateValue === 'string') {
        // YYYY-MM-DD 형식인지 확인
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        // 다른 형식이면 파싱 시도
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }
    
    // 엑셀 숫자 날짜 형식인 경우
    if (typeof dateValue === 'number') {
        const date = XLSX.SSF.parse_date_code(dateValue);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    
    // Date 객체인 경우
    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
    }
    
    return String(dateValue);
}

// ==================== 달력 및 할 일 관리 ====================

// 할 일 데이터 로드
async function loadTodos() {
    try {
        const response = await fetch('tables/todos?limit=1000');
        const data = await response.json();
        state.todos = data.data || [];
        renderTodoList();
        renderCalendar();
    } catch (error) {
        console.error('할 일 데이터 로드 오류:', error);
    }
}

// 달력 렌더링
function renderCalendar() {
    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();
    
    // 타이틀 업데이트
    document.getElementById('calendarTitle').textContent = `${year}년 ${month + 1}월`;
    
    // 이번 달의 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // 이전 달 날짜
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDate - i;
        const dayElement = createDayElement(year, month - 1, day, 'other-month');
        calendarDays.appendChild(dayElement);
    }
    
    // 이번 달 날짜
    for (let day = 1; day <= lastDate; day++) {
        const dayElement = createDayElement(year, month, day, 'current-month');
        calendarDays.appendChild(dayElement);
    }
    
    // 다음 달 날짜 (6주 채우기)
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6주 * 7일
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(year, month + 1, day, 'other-month');
        calendarDays.appendChild(dayElement);
    }
}

// 날짜 요소 생성
function createDayElement(year, month, day, className) {
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${className}`;
    
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘 표시
    if (date.getTime() === today.getTime()) {
        dayElement.classList.add('today');
    }
    
    dayElement.innerHTML = `<div class="day-number">${day}</div>`;
    
    // 출발/도착 표시
    const bookingsOnDate = state.bookings.filter(b => {
        const departure = b.departure_date === dateString;
        const arrival = b.return_date === dateString;
        return departure || arrival;
    });
    
    if (bookingsOnDate.length > 0) {
        const eventsDiv = document.createElement('div');
        eventsDiv.className = 'day-events';
        
        bookingsOnDate.forEach(booking => {
            if (booking.departure_date === dateString) {
                const event = document.createElement('div');
                event.className = 'event departure';
                event.innerHTML = `<i class="fas fa-plane-departure"></i> ${booking.customer_name}`;
                event.title = `출발: ${booking.product_name}`;
                eventsDiv.appendChild(event);
            }
            if (booking.return_date === dateString) {
                const event = document.createElement('div');
                event.className = 'event arrival';
                event.innerHTML = `<i class="fas fa-plane-arrival"></i> ${booking.customer_name}`;
                event.title = `도착: ${booking.product_name}`;
                eventsDiv.appendChild(event);
            }
        });
        
        dayElement.appendChild(eventsDiv);
    }
    
    // 할 일 표시
    const todosOnDate = state.todos.filter(t => t.date === dateString && !t.completed);
    if (todosOnDate.length > 0) {
        const todoDiv = document.createElement('div');
        todoDiv.className = 'day-todos';
        todoDiv.innerHTML = `<i class="fas fa-tasks"></i> ${todosOnDate.length}`;
        todoDiv.title = `할 일 ${todosOnDate.length}개`;
        dayElement.appendChild(todoDiv);
    }
    
    // 클릭 이벤트
    dayElement.addEventListener('click', () => showDayDetails(dateString));
    
    return dayElement;
}

// 날짜 상세 보기
function showDayDetails(dateString) {
    const date = new Date(dateString);
    const dateText = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    
    // 해당 날짜의 예약
    const bookings = state.bookings.filter(b => 
        b.departure_date === dateString || b.return_date === dateString
    );
    
    // 해당 날짜의 할 일
    const todos = state.todos.filter(t => t.date === dateString);
    
    let message = `📅 ${dateText}\n\n`;
    
    if (bookings.length > 0) {
        message += '✈️ 예약 정보:\n';
        bookings.forEach(b => {
            if (b.departure_date === dateString) {
                message += `  • 출발: ${b.customer_name} - ${b.product_name}\n`;
            }
            if (b.return_date === dateString) {
                message += `  • 도착: ${b.customer_name} - ${b.product_name}\n`;
            }
        });
        message += '\n';
    }
    
    if (todos.length > 0) {
        message += '📝 할 일:\n';
        todos.forEach(t => {
            const status = t.completed ? '✅' : '⏳';
            message += `  ${status} ${t.title}\n`;
        });
    }
    
    if (bookings.length === 0 && todos.length === 0) {
        message += '이 날짜에 예약이나 할 일이 없습니다.';
    }
    
    alert(message);
}

// 이전 달
function prevMonth() {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1);
    renderCalendar();
}

// 다음 달
function nextMonth() {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1);
    renderCalendar();
}

// 할 일 목록 렌더링
function renderTodoList() {
    const todoList = document.getElementById('todoList');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘과 미래의 할 일만 표시 (완료되지 않은 것)
    const activeTodos = state.todos
        .filter(t => !t.completed || new Date(t.date) >= today)
        .sort((a, b) => {
            // 날짜순 정렬
            if (a.date !== b.date) {
                return new Date(a.date) - new Date(b.date);
            }
            // 같은 날이면 우선순위 순
            const priorityOrder = { '높음': 0, '보통': 1, '낮음': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    
    if (activeTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-message">할 일이 없습니다.</div>';
        return;
    }
    
    todoList.innerHTML = activeTodos.map(todo => {
        const date = new Date(todo.date);
        const dateText = `${date.getMonth() + 1}/${date.getDate()}`;
        const isOverdue = date < today && !todo.completed;
        const priorityClass = todo.priority === '높음' ? 'high' : todo.priority === '낮음' ? 'low' : '';
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${priorityClass}">
                <div class="todo-checkbox">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="toggleTodo('${todo.id}')" 
                           id="todo-${todo.id}">
                    <label for="todo-${todo.id}"></label>
                </div>
                <div class="todo-content" onclick="editTodo('${todo.id}')">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-meta">
                        <span class="todo-date"><i class="fas fa-calendar"></i> ${dateText}</span>
                        <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                    </div>
                    ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                </div>
                <button class="btn-icon-sm" onclick="deleteTodo('${todo.id}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 할 일 모달 열기
function openTodoModal(todoId = null) {
    const modal = document.getElementById('modalTodo');
    const title = document.getElementById('modalTodoTitle');
    const form = document.getElementById('formTodo');
    
    form.reset();
    document.getElementById('todoId').value = '';
    document.getElementById('todoDate').value = new Date().toISOString().split('T')[0];

    if (todoId) {
        const todo = state.todos.find(t => t.id === todoId);
        if (todo) {
            title.textContent = '할 일 수정';
            document.getElementById('todoId').value = todo.id;
            document.getElementById('todoTitle').value = todo.title;
            document.getElementById('todoDate').value = todo.date;
            document.getElementById('todoPriority').value = todo.priority;
            document.getElementById('todoDescription').value = todo.description || '';
        }
    } else {
        title.textContent = '할 일 추가';
    }

    openModal('modalTodo');
}

function editTodo(id) {
    openTodoModal(id);
}

// 할 일 토글
async function toggleTodo(id) {
    try {
        const todo = state.todos.find(t => t.id === id);
        if (todo) {
            await fetch(`tables/todos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed })
            });
            await loadTodos();
        }
    } catch (error) {
        console.error('할 일 토글 오류:', error);
        showNotification('처리 중 오류가 발생했습니다.', 'error');
    }
}

// 할 일 삭제
async function deleteTodo(id) {
    if (!confirm('이 할 일을 삭제하시겠습니까?')) return;

    try {
        await fetch(`tables/todos/${id}`, { method: 'DELETE' });
        await loadTodos();
        showNotification('할 일이 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 할 일 저장
async function handleTodoSubmit(e) {
    e.preventDefault();

    const todoId = document.getElementById('todoId').value;
    const todoData = {
        title: document.getElementById('todoTitle').value,
        date: document.getElementById('todoDate').value,
        priority: document.getElementById('todoPriority').value,
        description: document.getElementById('todoDescription').value,
        completed: false
    };

    try {
        if (todoId) {
            await fetch(`tables/todos/${todoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todoData)
            });
            showNotification('할 일이 수정되었습니다.', 'success');
        } else {
            await fetch('tables/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todoData)
            });
            showNotification('할 일이 추가되었습니다.', 'success');
        }

        closeModal('modalTodo');
        await loadTodos();
    } catch (error) {
        console.error('저장 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    }
}

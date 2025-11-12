// 전역 상태 관리
const state = {
    customers: [],
    products: [],
    bookings: [],
    notifications: [],
    todos: [],
    currentPage: 'dashboard',
    currentMonth: new Date(),
    charts: {},
    securityMode: true // 보안 모드 (기본값: 활성화)
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    initializeApp();
    await loadAllData();
    setupEventListeners();
    updateDashboard();
    updateCurrentDate();
    
    // 알림 체크 시작
    await checkAndGenerateNotifications();
    await loadNotifications();
    
    // 주기적 알림 체크 (5분마다)
    setInterval(async () => {
        await checkAndGenerateNotifications();
        await loadNotifications();
    }, 5 * 60 * 1000);
});

// 앱 초기화
function initializeApp() {
    // 차트 초기화
    initializeCharts();
    
    // 샘플 데이터 추가 (처음 실행 시)
    checkAndAddSampleData();
}

// 현재 날짜 표시
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateElement.textContent = now.toLocaleDateString('ko-KR', options);
}

// 모든 데이터 로드
async function loadAllData() {
    try {
        await Promise.all([
            loadCustomers(),
            loadProducts(),
            loadBookings(),
            loadTodos()
        ]);
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        showNotification('데이터 로드 중 오류가 발생했습니다.', 'error');
    }
}

// 고객 데이터 로드
async function loadCustomers() {
    try {
        const response = await fetch('tables/customers?limit=1000');
        const data = await response.json();
        state.customers = data.data || [];
        renderCustomersTable();
        updateCustomerSelects();
    } catch (error) {
        console.error('고객 데이터 로드 오류:', error);
    }
}

// 상품 데이터 로드
async function loadProducts() {
    try {
        const response = await fetch('tables/products?limit=1000');
        const data = await response.json();
        state.products = data.data || [];
        renderProductsGrid();
        updateProductSelects();
    } catch (error) {
        console.error('상품 데이터 로드 오류:', error);
    }
}

// 예약 데이터 로드
async function loadBookings() {
    try {
        const response = await fetch('tables/bookings?limit=1000');
        const data = await response.json();
        state.bookings = data.data || [];
        renderBookingsTable();
    } catch (error) {
        console.error('예약 데이터 로드 오류:', error);
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 네비게이션
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // 사이드바 토글
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // 고객 관리
    document.getElementById('btnAddCustomer').addEventListener('click', () => openCustomerModal());
    document.getElementById('formCustomer').addEventListener('submit', handleCustomerSubmit);
    document.getElementById('searchCustomers').addEventListener('input', filterCustomers);
    document.getElementById('btnExportCustomers').addEventListener('click', exportCustomersToExcel);
    document.getElementById('btnImportCustomers').addEventListener('click', () => document.getElementById('customerFileInput').click());
    document.getElementById('btnDownloadCustomerTemplate').addEventListener('click', downloadCustomerTemplate);
    document.getElementById('customerFileInput').addEventListener('change', handleCustomerFileUpload);
    document.getElementById('toggleSecurity').addEventListener('change', toggleSecurityMode);
    
    // 여권 파일 업로드
    document.getElementById('customerPassportFile').addEventListener('change', handlePassportFileUpload);
    document.getElementById('btnRemovePassport').addEventListener('click', removePassportFile);

    // 상품 관리
    document.getElementById('btnAddProduct').addEventListener('click', () => openProductModal());
    document.getElementById('formProduct').addEventListener('submit', handleProductSubmit);
    document.getElementById('searchProducts').addEventListener('input', filterProducts);
    document.getElementById('filterProductStatus').addEventListener('change', filterProducts);
    document.getElementById('btnImportProducts').addEventListener('click', () => document.getElementById('productFileInput').click());
    document.getElementById('btnDownloadProductTemplate').addEventListener('click', downloadProductTemplate);
    document.getElementById('productFileInput').addEventListener('change', handleProductFileUpload);

    // 예약 관리
    document.getElementById('btnAddBooking').addEventListener('click', () => openBookingModal());
    document.getElementById('formBooking').addEventListener('submit', handleBookingSubmit);
    document.getElementById('searchBookings').addEventListener('input', filterBookings);
    document.getElementById('filterBookingStatus').addEventListener('change', filterBookings);
    document.getElementById('btnImportBookings').addEventListener('click', () => document.getElementById('bookingFileInput').click());
    document.getElementById('btnDownloadBookingTemplate').addEventListener('click', downloadBookingTemplate);
    document.getElementById('bookingFileInput').addEventListener('change', handleBookingFileUpload);

    // 견적서 생성
    document.getElementById('btnPreviewQuote').addEventListener('click', previewQuote);
    document.getElementById('btnGenerateQuote').addEventListener('click', generateQuote);
    
    // 상품 선택 시 가격 자동 입력
    document.getElementById('bookingProduct').addEventListener('change', updateBookingPrice);
    document.getElementById('bookingParticipants').addEventListener('input', updateBookingPrice);

    // 알림 관리
    document.getElementById('btnNotificationCenter').addEventListener('click', toggleNotificationDropdown);
    document.getElementById('btnMarkAllRead').addEventListener('click', markAllNotificationsAsRead);
    document.getElementById('btnRefreshNotifications').addEventListener('click', async () => {
        await checkAndGenerateNotifications();
        await loadNotifications();
        showNotification('알림을 새로고침했습니다.', 'success');
    });
    document.getElementById('btnClearAllNotifications').addEventListener('click', clearAllNotifications);
    document.getElementById('filterNotificationType').addEventListener('change', filterNotifications);
    document.getElementById('filterNotificationStatus').addEventListener('change', filterNotifications);

    // 달력 및 할 일
    document.getElementById('btnPrevMonth').addEventListener('click', prevMonth);
    document.getElementById('btnNextMonth').addEventListener('click', nextMonth);
    document.getElementById('btnAddTodo').addEventListener('click', () => openTodoModal());
    document.getElementById('formTodo').addEventListener('submit', handleTodoSubmit);
}

// 보안 모드 토글
function toggleSecurityMode() {
    state.securityMode = document.getElementById('toggleSecurity').checked;
    renderCustomersTable();
}

// 민감정보 마스킹
function maskSensitiveData(text, type = 'default') {
    if (!text || !state.securityMode) return text;
    
    switch(type) {
        case 'passport':
            // 여권번호: M12345678 -> M****5678
            return text.substring(0, 1) + '****' + text.substring(text.length - 4);
        case 'birth':
            // 생년월일: 1990-01-01 -> 1990-**-**
            return text.substring(0, 5) + '**-**';
        case 'phone':
            // 전화번호: 010-1234-5678 -> 010-****-5678
            const parts = text.split('-');
            if (parts.length === 3) {
                return parts[0] + '-****-' + parts[2];
            }
            return text;
        case 'email':
            // 이메일: example@email.com -> ex***@email.com
            const [username, domain] = text.split('@');
            if (username && domain) {
                return username.substring(0, 2) + '***@' + domain;
            }
            return text;
        default:
            return text;
    }
}

// 여권 파일 업로드 처리
function handlePassportFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('파일 크기는 2MB를 초과할 수 없습니다.');
        e.target.value = '';
        return;
    }

    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, PDF 파일만 업로드 가능합니다.');
        e.target.value = '';
        return;
    }

    // 파일명 표시
    document.getElementById('passportFileName').textContent = file.name;
    document.getElementById('btnRemovePassport').style.display = 'inline-block';

    // 이미지 미리보기
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('passportPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="여권 미리보기">`;
        };
        reader.readAsDataURL(file);
    } else {
        const preview = document.getElementById('passportPreview');
        preview.innerHTML = '<p><i class="fas fa-file-pdf"></i> PDF 파일</p>';
    }
}

// 여권 파일 제거
function removePassportFile() {
    document.getElementById('customerPassportFile').value = '';
    document.getElementById('passportFileName').textContent = '선택된 파일 없음';
    document.getElementById('btnRemovePassport').style.display = 'none';
    document.getElementById('passportPreview').innerHTML = '';
}

// 파일을 Base64로 변환
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 엑셀로 내보내기
function exportCustomersToExcel() {
    if (state.customers.length === 0) {
        alert('내보낼 고객 데이터가 없습니다.');
        return;
    }

    // 보안 모드 일시 해제 확인
    let includeFullData = true;
    if (state.securityMode) {
        includeFullData = confirm('민감정보를 포함하여 내보내시겠습니까?\n\n취소를 누르면 마스킹된 데이터로 내보냅니다.');
    }

    // 엑셀 데이터 준비
    const excelData = state.customers.map(customer => ({
        '한글명': customer.name_kor || '',
        '영문명': customer.name_eng || '',
        '여권번호': includeFullData ? (customer.passport_number || '') : maskSensitiveData(customer.passport_number, 'passport'),
        '생년월일': includeFullData ? (customer.birth_date || '') : maskSensitiveData(customer.birth_date, 'birth'),
        '여권만료일': customer.passport_expiry || '',
        '연락처': includeFullData ? (customer.phone || '') : maskSensitiveData(customer.phone, 'phone'),
        '이메일': includeFullData ? (customer.email || '') : maskSensitiveData(customer.email, 'email'),
        '주소': customer.address || '',
        '여행이력': customer.travel_history || '',
        '비고': customer.notes || '',
        '등록일': customer.created_at ? new Date(customer.created_at).toLocaleDateString('ko-KR') : ''
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    ws['!cols'] = [
        { wch: 10 }, // 한글명
        { wch: 15 }, // 영문명
        { wch: 12 }, // 여권번호
        { wch: 12 }, // 생년월일
        { wch: 12 }, // 여권만료일
        { wch: 15 }, // 연락처
        { wch: 25 }, // 이메일
        { wch: 30 }, // 주소
        { wch: 30 }, // 여행이력
        { wch: 30 }, // 비고
        { wch: 12 }  // 등록일
    ];

    XLSX.utils.book_append_sheet(wb, ws, '고객목록');

    // 파일명 생성 (현재 날짜 포함)
    const today = new Date().toISOString().split('T')[0];
    const fileName = `고객목록_${today}.xlsx`;

    // 파일 다운로드
    XLSX.writeFile(wb, fileName);

    showNotification('엑셀 파일이 다운로드되었습니다.', 'success');
}

// 페이지 네비게이션
function navigateToPage(page) {
    // 모든 페이지 숨기기
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // 선택한 페이지 표시
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // 페이지 타이틀 업데이트
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

    // 대시보드로 이동 시 데이터 업데이트
    if (page === 'dashboard') {
        updateDashboard();
    }
    
    // 알림 페이지로 이동 시 데이터 업데이트
    if (page === 'notifications') {
        renderNotifications();
    }
}

// 대시보드 업데이트
function updateDashboard() {
    // 통계 업데이트
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

    // 최근 예약 테이블 업데이트
    renderRecentBookings();

    // 차트 업데이트
    updateCharts();
}

// 차트 초기화
function initializeCharts() {
    // 차트는 달력으로 대체됨
    // 달력 초기화
    renderCalendar();
}

// 차트 업데이트
function updateCharts() {
    // 달력 업데이트
    renderCalendar();
}



// 최근 예약 렌더링
function renderRecentBookings() {
    const tbody = document.querySelector('#recentBookingsTable tbody');
    const recentBookings = state.bookings
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

// 고객 테이블 렌더링
function renderCustomersTable(customers = state.customers) {
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
                <button class="btn btn-sm btn-secondary" onclick="editCustomer('${customer.id}')" title="수정">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

// 상품 그리드 렌더링
function renderProductsGrid(products = state.products) {
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
                <button class="btn btn-sm btn-secondary" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 예약 테이블 렌더링
function renderBookingsTable(bookings = state.bookings) {
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
                <button class="btn btn-sm btn-secondary" onclick="editBooking('${booking.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBooking('${booking.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 고객 필터링
function filterCustomers() {
    const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();
    const filtered = state.customers.filter(customer =>
        (customer.name_kor && customer.name_kor.toLowerCase().includes(searchTerm)) ||
        (customer.name_eng && customer.name_eng.toLowerCase().includes(searchTerm)) ||
        (customer.passport_number && customer.passport_number.toLowerCase().includes(searchTerm)) ||
        (customer.phone && customer.phone.includes(searchTerm))
    );
    renderCustomersTable(filtered);
}

// 상품 필터링
function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const statusFilter = document.getElementById('filterProductStatus').value;
    
    const filtered = state.products.filter(product => {
        const matchesSearch = 
            product.name.toLowerCase().includes(searchTerm) ||
            product.destination.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || product.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    renderProductsGrid(filtered);
}

// 예약 필터링
function filterBookings() {
    const searchTerm = document.getElementById('searchBookings').value.toLowerCase();
    const statusFilter = document.getElementById('filterBookingStatus').value;
    
    const filtered = state.bookings.filter(booking => {
        const matchesSearch = 
            booking.customer_name.toLowerCase().includes(searchTerm) ||
            booking.product_name.toLowerCase().includes(searchTerm) ||
            booking.id.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    renderBookingsTable(filtered);
}

// 고객 셀렉트 박스 업데이트
function updateCustomerSelects() {
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

// 상품 셀렉트 박스 업데이트
function updateProductSelects() {
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

// 예약 가격 자동 계산
function updateBookingPrice() {
    const productSelect = document.getElementById('bookingProduct');
    const participants = parseInt(document.getElementById('bookingParticipants').value) || 1;
    const priceInput = document.getElementById('bookingTotalPrice');

    if (productSelect.selectedIndex > 0) {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price) || 0;
        priceInput.value = price * participants;
    }
}

// 모달 열기/닫기
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 고객 모달
function openCustomerModal(customerId = null) {
    const modal = document.getElementById('modalCustomer');
    const title = document.getElementById('modalCustomerTitle');
    const form = document.getElementById('formCustomer');
    
    form.reset();
    document.getElementById('customerId').value = '';
    removePassportFile();

    if (customerId) {
        const customer = state.customers.find(c => c.id === customerId);
        if (customer) {
            title.textContent = '고객 수정';
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerNameKor').value = customer.name_kor || '';
            document.getElementById('customerNameEng').value = customer.name_eng || '';
            document.getElementById('customerPassportNumber').value = customer.passport_number || '';
            document.getElementById('customerBirthDate').value = customer.birth_date || '';
            document.getElementById('customerPassportExpiry').value = customer.passport_expiry || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerAddress').value = customer.address || '';
            document.getElementById('customerTravelHistory').value = customer.travel_history || '';
            document.getElementById('customerNotes').value = customer.notes || '';
            
            // 여권 파일 정보 표시
            if (customer.passport_file_name) {
                document.getElementById('passportFileName').textContent = customer.passport_file_name;
                document.getElementById('btnRemovePassport').style.display = 'inline-block';
                
                // 이미지 미리보기
                if (customer.passport_file_data) {
                    const preview = document.getElementById('passportPreview');
                    if (customer.passport_file_name.toLowerCase().endsWith('.pdf')) {
                        preview.innerHTML = '<p><i class="fas fa-file-pdf"></i> PDF 파일</p>';
                    } else {
                        preview.innerHTML = `<img src="${customer.passport_file_data}" alt="여권 미리보기">`;
                    }
                }
            }
        }
    } else {
        title.textContent = '고객 추가';
    }

    openModal('modalCustomer');
}

function editCustomer(id) {
    openCustomerModal(id);
}

async function deleteCustomer(id) {
    if (!confirm('정말 이 고객을 삭제하시겠습니까?\n\n관련된 예약 정보는 삭제되지 않습니다.')) return;

    try {
        await fetch(`tables/customers/${id}`, { method: 'DELETE' });
        await loadCustomers();
        showNotification('고객이 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

async function handleCustomerSubmit(e) {
    e.preventDefault();

    const customerId = document.getElementById('customerId').value;
    
    // 여권 파일 처리
    const fileInput = document.getElementById('customerPassportFile');
    let passportFileData = null;
    let passportFileName = null;
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        passportFileData = await fileToBase64(file);
        passportFileName = file.name;
    } else if (customerId) {
        // 수정 시 기존 파일 유지
        const customer = state.customers.find(c => c.id === customerId);
        if (customer) {
            passportFileData = customer.passport_file_data;
            passportFileName = customer.passport_file_name;
        }
    }

    const customerData = {
        name_kor: document.getElementById('customerNameKor').value,
        name_eng: document.getElementById('customerNameEng').value.toUpperCase(),
        passport_number: document.getElementById('customerPassportNumber').value.toUpperCase(),
        birth_date: document.getElementById('customerBirthDate').value,
        passport_expiry: document.getElementById('customerPassportExpiry').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        address: document.getElementById('customerAddress').value,
        travel_history: document.getElementById('customerTravelHistory').value,
        notes: document.getElementById('customerNotes').value,
        passport_file_name: passportFileName,
        passport_file_data: passportFileData
    };

    try {
        if (customerId) {
            // 수정
            await fetch(`tables/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
            showNotification('고객 정보가 수정되었습니다.', 'success');
        } else {
            // 추가
            await fetch('tables/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
            showNotification('고객이 추가되었습니다.', 'success');
        }

        closeModal('modalCustomer');
        await loadCustomers();
        updateDashboard();
    } catch (error) {
        console.error('저장 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    }
}

// 상품 모달
function openProductModal(productId = null) {
    const modal = document.getElementById('modalProduct');
    const title = document.getElementById('modalProductTitle');
    const form = document.getElementById('formProduct');
    
    form.reset();
    document.getElementById('productId').value = '';

    if (productId) {
        const product = state.products.find(p => p.id === productId);
        if (product) {
            title.textContent = '상품 수정';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDestination').value = product.destination;
            document.getElementById('productDuration').value = product.duration;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStatus').value = product.status;
            document.getElementById('productDescription').value = product.description || '';
        }
    } else {
        title.textContent = '상품 추가';
        document.getElementById('productStatus').value = '활성';
    }

    openModal('modalProduct');
}

function editProduct(id) {
    openProductModal(id);
}

async function deleteProduct(id) {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;

    try {
        await fetch(`tables/products/${id}`, { method: 'DELETE' });
        await loadProducts();
        showNotification('상품이 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        destination: document.getElementById('productDestination').value,
        duration: parseInt(document.getElementById('productDuration').value),
        price: parseInt(document.getElementById('productPrice').value),
        status: document.getElementById('productStatus').value,
        description: document.getElementById('productDescription').value
    };

    try {
        if (productId) {
            await fetch(`tables/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            showNotification('상품 정보가 수정되었습니다.', 'success');
        } else {
            await fetch('tables/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            showNotification('상품이 추가되었습니다.', 'success');
        }

        closeModal('modalProduct');
        await loadProducts();
        updateDashboard();
    } catch (error) {
        console.error('저장 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    }
}

// 예약 모달
function openBookingModal(bookingId = null) {
    const modal = document.getElementById('modalBooking');
    const title = document.getElementById('modalBookingTitle');
    const form = document.getElementById('formBooking');
    
    form.reset();
    document.getElementById('bookingId').value = '';

    if (bookingId) {
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
            title.textContent = '예약 수정';
            document.getElementById('bookingId').value = booking.id;
            document.getElementById('bookingCustomer').value = booking.customer_id;
            document.getElementById('bookingProduct').value = booking.product_id;
            document.getElementById('bookingDepartureDate').value = booking.departure_date;
            document.getElementById('bookingReturnDate').value = booking.return_date;
            document.getElementById('bookingParticipants').value = booking.participants;
            document.getElementById('bookingTotalPrice').value = booking.total_price;
            document.getElementById('bookingHotel').value = booking.hotel_name || '';
            document.getElementById('bookingFlight').value = booking.flight_number || '';
            document.getElementById('bookingStatus').value = booking.status;
            document.getElementById('bookingNotes').value = booking.notes || '';
        }
    } else {
        title.textContent = '예약 추가';
        document.getElementById('bookingStatus').value = '문의';
        document.getElementById('bookingParticipants').value = '1';
    }

    openModal('modalBooking');
}

function editBooking(id) {
    openBookingModal(id);
}

async function deleteBooking(id) {
    if (!confirm('정말 이 예약을 삭제하시겠습니까?')) return;

    try {
        await fetch(`tables/bookings/${id}`, { method: 'DELETE' });
        await loadBookings();
        updateDashboard();
        showNotification('예약이 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    const bookingId = document.getElementById('bookingId').value;
    const customerSelect = document.getElementById('bookingCustomer');
    const productSelect = document.getElementById('bookingProduct');

    const customerName = customerSelect.options[customerSelect.selectedIndex].dataset.name;
    const productName = productSelect.options[productSelect.selectedIndex].dataset.name;

    const bookingData = {
        customer_id: customerSelect.value,
        customer_name: customerName,
        product_id: productSelect.value,
        product_name: productName,
        departure_date: document.getElementById('bookingDepartureDate').value,
        return_date: document.getElementById('bookingReturnDate').value,
        participants: parseInt(document.getElementById('bookingParticipants').value),
        total_price: parseInt(document.getElementById('bookingTotalPrice').value),
        hotel_name: document.getElementById('bookingHotel').value,
        flight_number: document.getElementById('bookingFlight').value,
        status: document.getElementById('bookingStatus').value,
        notes: document.getElementById('bookingNotes').value
    };

    try {
        if (bookingId) {
            await fetch(`tables/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            showNotification('예약 정보가 수정되었습니다.', 'success');
        } else {
            await fetch('tables/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            showNotification('예약이 추가되었습니다.', 'success');
        }

        closeModal('modalBooking');
        await loadBookings();
        updateDashboard();
    } catch (error) {
        console.error('저장 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    }
}

// 견적서 미리보기
function previewQuote() {
    const quoteData = getQuoteData();
    if (!quoteData) return;

    const preview = document.getElementById('quotePreview');
    preview.style.display = 'block';
    preview.innerHTML = generateQuoteHTML(quoteData);
    preview.scrollIntoView({ behavior: 'smooth' });
}

// 견적서 생성 (인쇄)
function generateQuote() {
    const quoteData = getQuoteData();
    if (!quoteData) return;

    const preview = document.getElementById('quotePreview');
    preview.style.display = 'block';
    preview.innerHTML = generateQuoteHTML(quoteData);

    // 인쇄
    setTimeout(() => {
        window.print();
    }, 500);
}

// 견적서 데이터 가져오기
function getQuoteData() {
    const customerSelect = document.getElementById('quoteCustomer');
    const productSelect = document.getElementById('quoteProduct');

    if (!customerSelect.value || !productSelect.value) {
        alert('고객과 상품을 선택해주세요.');
        return null;
    }

    const customer = state.customers.find(c => c.id === customerSelect.value);
    const product = state.products.find(p => p.id === productSelect.value);
    
    const departureDate = document.getElementById('quoteDepartureDate').value;
    const returnDate = document.getElementById('quoteReturnDate').value;
    const participants = parseInt(document.getElementById('quoteParticipants').value);
    const hotel = document.getElementById('quoteHotel').value;
    const flight = document.getElementById('quoteFlight').value;
    const additionalPrice = parseInt(document.getElementById('quoteAdditionalPrice').value) || 0;
    const notes = document.getElementById('quoteNotes').value;

    const basePrice = product.price * participants;
    const totalPrice = basePrice + additionalPrice;

    return {
        customer,
        product,
        departureDate,
        returnDate,
        participants,
        hotel,
        flight,
        basePrice,
        additionalPrice,
        totalPrice,
        notes,
        date: new Date().toLocaleDateString('ko-KR')
    };
}

// 견적서 HTML 생성
function generateQuoteHTML(data) {
    const customerName = data.customer.name_kor || data.customer.name_eng;
    return `
        <div class="quote-header">
            <h2>여행 견적서</h2>
            <p>발행일: ${data.date}</p>
        </div>

        <div class="quote-section">
            <h3>고객 정보</h3>
            <div class="quote-info">
                <div class="quote-info-item">
                    <span class="quote-info-label">고객명</span>
                    <span class="quote-info-value">${customerName}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">연락처</span>
                    <span class="quote-info-value">${data.customer.phone}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">이메일</span>
                    <span class="quote-info-value">${data.customer.email || '-'}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">주소</span>
                    <span class="quote-info-value">${data.customer.address || '-'}</span>
                </div>
            </div>
        </div>

        <div class="quote-section">
            <h3>여행 정보</h3>
            <div class="quote-info">
                <div class="quote-info-item">
                    <span class="quote-info-label">상품명</span>
                    <span class="quote-info-value">${data.product.name}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">목적지</span>
                    <span class="quote-info-value">${data.product.destination}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">출발일</span>
                    <span class="quote-info-value">${data.departureDate}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">귀국일</span>
                    <span class="quote-info-value">${data.returnDate}</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">여행 기간</span>
                    <span class="quote-info-value">${data.product.duration}일</span>
                </div>
                <div class="quote-info-item">
                    <span class="quote-info-label">인원</span>
                    <span class="quote-info-value">${data.participants}명</span>
                </div>
                ${data.hotel ? `
                <div class="quote-info-item">
                    <span class="quote-info-label">호텔</span>
                    <span class="quote-info-value">${data.hotel}</span>
                </div>
                ` : ''}
                ${data.flight ? `
                <div class="quote-info-item">
                    <span class="quote-info-label">항공편</span>
                    <span class="quote-info-value">${data.flight}</span>
                </div>
                ` : ''}
            </div>
        </div>

        ${data.product.description ? `
        <div class="quote-section">
            <h3>상품 설명</h3>
            <p>${data.product.description}</p>
        </div>
        ` : ''}

        <div class="quote-section">
            <h3>견적 내역</h3>
            <div class="quote-info">
                <div class="quote-info-item">
                    <span class="quote-info-label">기본 요금 (${data.participants}명)</span>
                    <span class="quote-info-value">${data.basePrice.toLocaleString()}원</span>
                </div>
                ${data.additionalPrice > 0 ? `
                <div class="quote-info-item">
                    <span class="quote-info-label">추가 요금</span>
                    <span class="quote-info-value">${data.additionalPrice.toLocaleString()}원</span>
                </div>
                ` : ''}
            </div>
            <div class="quote-total">
                <div class="quote-total-amount">
                    <span>총 금액</span>
                    <span>${data.totalPrice.toLocaleString()}원</span>
                </div>
            </div>
        </div>

        ${data.notes ? `
        <div class="quote-section">
            <h3>메모</h3>
            <p>${data.notes}</p>
        </div>
        ` : ''}
    `;
}

// 알림 표시
function showNotification(message, type = 'info') {
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

// 샘플 데이터 확인 및 추가
async function checkAndAddSampleData() {
    try {
        // 데이터가 이미 있는지 확인
        const customersResponse = await fetch('tables/customers?limit=1');
        const customersData = await customersResponse.json();
        
        if (customersData.data && customersData.data.length > 0) {
            return; // 이미 데이터가 있음
        }

        // 샘플 데이터 추가
        await addSampleData();
    } catch (error) {
        console.log('샘플 데이터 확인 중 오류:', error);
    }
}

// 샘플 데이터 추가
async function addSampleData() {
    try {
        // 샘플 고객 추가
        const sampleCustomers = [
            { 
                name_kor: '김철수',
                name_eng: 'KIM CHULSOO',
                passport_number: 'M12345678',
                birth_date: '1985-03-15',
                passport_expiry: '2028-03-14',
                phone: '010-1234-5678',
                email: 'kim@example.com',
                address: '서울시 강남구',
                travel_history: '일본(2022), 태국(2023)',
                notes: ''
            },
            { 
                name_kor: '이영희',
                name_eng: 'LEE YOUNGHEE',
                passport_number: 'M87654321',
                birth_date: '1990-07-22',
                passport_expiry: '2027-07-21',
                phone: '010-2345-6789',
                email: 'lee@example.com',
                address: '서울시 서초구',
                travel_history: '베트남(2021), 싱가포르(2023)',
                notes: ''
            },
            { 
                name_kor: '박민수',
                name_eng: 'PARK MINSU',
                passport_number: 'M11223344',
                birth_date: '1988-11-30',
                passport_expiry: '2029-11-29',
                phone: '010-3456-7890',
                email: 'park@example.com',
                address: '경기도 성남시',
                travel_history: '프랑스(2019), 스페인(2022)',
                notes: '단체 여행 선호'
            }
        ];

        for (const customer of sampleCustomers) {
            await fetch('tables/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer)
            });
        }

        // 샘플 상품 추가
        const sampleProducts = [
            {
                name: '도쿄 자유여행 4일',
                destination: '일본 도쿄',
                duration: 4,
                price: 850000,
                status: '활성',
                description: '도쿄의 주요 명소를 자유롭게 여행하는 패키지입니다.'
            },
            {
                name: '방콕 휴양 5일',
                destination: '태국 방콕',
                duration: 5,
                price: 650000,
                status: '활성',
                description: '방콕과 파타야의 아름다운 해변을 즐기는 여행입니다.'
            },
            {
                name: '파리 문화탐방 7일',
                destination: '프랑스 파리',
                duration: 7,
                price: 2500000,
                status: '활성',
                description: '파리의 예술과 문화를 체험하는 프리미엄 여행입니다.'
            }
        ];

        for (const product of sampleProducts) {
            await fetch('tables/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        }

        console.log('샘플 데이터가 추가되었습니다.');
    } catch (error) {
        console.error('샘플 데이터 추가 오류:', error);
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== 알림 시스템 ====================

// 알림 데이터 로드
async function loadNotifications() {
    try {
        const response = await fetch('tables/notifications?limit=1000&sort=-created_at');
        const data = await response.json();
        state.notifications = data.data || [];
        updateNotificationUI();
        renderNotifications();
    } catch (error) {
        console.error('알림 데이터 로드 오류:', error);
    }
}

// 알림 체크 및 생성
async function checkAndGenerateNotifications() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 예약확정 상태의 예약만 체크
        const confirmedBookings = state.bookings.filter(b => 
            ['예약확정', '출발완료'].includes(b.status) && b.departure_date
        );

        for (const booking of confirmedBookings) {
            const departureDate = new Date(booking.departure_date);
            departureDate.setHours(0, 0, 0, 0);
            
            const daysUntilDeparture = Math.ceil((departureDate - today) / (1000 * 60 * 60 * 24));

            // 알림 규칙 정의
            const notificationRules = [
                { days: 30, type: '여권확인', priority: '보통', message: `${booking.customer_name}님의 ${booking.product_name} 출발 30일 전입니다. 여권 유효기간을 확인해주세요.` },
                { days: 7, type: '출발준비', priority: '보통', message: `${booking.customer_name}님의 ${booking.product_name} 출발 7일 전입니다. 여행 준비를 시작하세요.` },
                { days: 3, type: '출발임박', priority: '높음', message: `${booking.customer_name}님의 ${booking.product_name} 출발이 3일 남았습니다. 최종 확인이 필요합니다.` },
                { days: 0, type: '당일', priority: '높음', message: `오늘은 ${booking.customer_name}님의 ${booking.product_name} 출발일입니다!` }
            ];

            for (const rule of notificationRules) {
                if (daysUntilDeparture === rule.days) {
                    // 이미 생성된 알림인지 체크
                    const existingNotification = state.notifications.find(n =>
                        n.booking_id === booking.id &&
                        n.notification_type === rule.type &&
                        n.days_before === rule.days
                    );

                    if (!existingNotification) {
                        // 새 알림 생성
                        await createNotification({
                            booking_id: booking.id,
                            customer_name: booking.customer_name,
                            product_name: booking.product_name,
                            departure_date: booking.departure_date,
                            days_before: rule.days,
                            notification_type: rule.type,
                            message: rule.message,
                            is_read: false,
                            priority: rule.priority
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('알림 체크 오류:', error);
    }
}

// 알림 생성
async function createNotification(notificationData) {
    try {
        await fetch('tables/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData)
        });
        console.log('알림 생성:', notificationData.message);
    } catch (error) {
        console.error('알림 생성 오류:', error);
    }
}

// 알림 UI 업데이트
function updateNotificationUI() {
    const unreadCount = state.notifications.filter(n => !n.is_read).length;
    
    // 헤더 알림 카운트
    const countElement = document.getElementById('notificationCount');
    if (unreadCount > 0) {
        countElement.textContent = unreadCount;
        countElement.style.display = 'flex';
    } else {
        countElement.style.display = 'none';
    }

    // 사이드바 배지
    const badgeElement = document.getElementById('notificationBadge');
    if (unreadCount > 0) {
        badgeElement.textContent = unreadCount;
        badgeElement.style.display = 'inline-block';
    } else {
        badgeElement.style.display = 'none';
    }

    // 알림 드롭다운 업데이트
    updateNotificationDropdown();
}

// 알림 드롭다운 업데이트
function updateNotificationDropdown() {
    const listElement = document.getElementById('notificationList');
    const recentNotifications = state.notifications
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    if (recentNotifications.length === 0) {
        listElement.innerHTML = '<div class="empty-notification">알림이 없습니다.</div>';
        return;
    }

    listElement.innerHTML = recentNotifications.map(notification => {
        const iconClass = getNotificationIcon(notification.notification_type);
        const priorityClass = notification.priority === '높음' ? 'high-priority' : '';
        const readClass = notification.is_read ? 'read' : 'unread';
        
        return `
            <div class="notification-item ${readClass} ${priorityClass}" onclick="markNotificationAsRead('${notification.id}')">
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <span class="notification-type">${notification.notification_type}</span>
                        <span class="notification-time">${getTimeAgo(notification.created_at)}</span>
                    </div>
                </div>
                ${!notification.is_read ? '<div class="notification-unread-dot"></div>' : ''}
            </div>
        `;
    }).join('');
}

// 알림 렌더링 (알림 관리 페이지)
function renderNotifications(notifications = state.notifications) {
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
                        `<button class="btn btn-sm btn-secondary" onclick="markNotificationAsRead('${notification.id}')">
                            <i class="fas fa-check"></i> 읽음
                        </button>` : 
                        '<span class="text-muted"><i class="fas fa-check-double"></i> 읽음</span>'
                    }
                    <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 알림 아이콘 가져오기
function getNotificationIcon(type) {
    const icons = {
        '여권확인': 'fas fa-passport',
        '출발준비': 'fas fa-suitcase',
        '출발임박': 'fas fa-exclamation-triangle',
        '당일': 'fas fa-plane-departure'
    };
    return icons[type] || 'fas fa-bell';
}

// 알림 색상 가져오기
function getNotificationColor(type) {
    const colors = {
        '여권확인': 'linear-gradient(135deg, #f59e0b, #d97706)',
        '출발준비': 'linear-gradient(135deg, #3b82f6, #2563eb)',
        '출발임박': 'linear-gradient(135deg, #ef4444, #dc2626)',
        '당일': 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    };
    return colors[type] || 'linear-gradient(135deg, #64748b, #475569)';
}

// 시간 경과 표시
function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return formatDate(timestamp);
}

// 날짜/시간 포맷팅
function formatDateTime(timestamp) {
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

// 알림 읽음 처리
async function markNotificationAsRead(id) {
    try {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.is_read) {
            await fetch(`tables/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: true })
            });
            await loadNotifications();
        }
    } catch (error) {
        console.error('알림 읽음 처리 오류:', error);
    }
}

// 모든 알림 읽음 처리
async function markAllNotificationsAsRead() {
    try {
        const unreadNotifications = state.notifications.filter(n => !n.is_read);
        for (const notification of unreadNotifications) {
            await fetch(`tables/notifications/${notification.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: true })
            });
        }
        await loadNotifications();
        showNotification('모든 알림을 읽음으로 표시했습니다.', 'success');
    } catch (error) {
        console.error('알림 읽음 처리 오류:', error);
        showNotification('알림 처리 중 오류가 발생했습니다.', 'error');
    }
}

// 알림 삭제
async function deleteNotification(id) {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
        await fetch(`tables/notifications/${id}`, { method: 'DELETE' });
        await loadNotifications();
        showNotification('알림이 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('알림 삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 모든 알림 삭제
async function clearAllNotifications() {
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return;

    try {
        for (const notification of state.notifications) {
            await fetch(`tables/notifications/${notification.id}`, { method: 'DELETE' });
        }
        await loadNotifications();
        showNotification('모든 알림이 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('알림 삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 알림 필터링
function filterNotifications() {
    const typeFilter = document.getElementById('filterNotificationType').value;
    const statusFilter = document.getElementById('filterNotificationStatus').value;
    
    const filtered = state.notifications.filter(notification => {
        const matchesType = !typeFilter || notification.notification_type === typeFilter;
        const matchesStatus = !statusFilter || 
            (statusFilter === 'unread' && !notification.is_read) ||
            (statusFilter === 'read' && notification.is_read);
        return matchesType && matchesStatus;
    });
    
    renderNotifications(filtered);
}

// 알림 드롭다운 토글
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const isVisible = dropdown.style.display !== 'none';
    dropdown.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        updateNotificationDropdown();
    }
}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notificationDropdown');
    const button = document.getElementById('btnNotificationCenter');
    
    if (dropdown && button && 
        !dropdown.contains(e.target) && 
        !button.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// ==================== 엑셀 업로드 시스템 ====================

// 고객 샘플 템플릿 다운로드
function downloadCustomerTemplate() {
    const sampleData = [
        {
            '한글명': '홍길동',
            '영문명': 'HONG GILDONG',
            '여권번호': 'M12345678',
            '생년월일': '1990-01-01',
            '여권만료일': '2030-01-01',
            '연락처': '010-1234-5678',
            '이메일': 'hong@example.com',
            '주소': '서울시 강남구',
            '여행이력': '일본(2022), 태국(2023)',
            '비고': '단체여행 선호'
        },
        {
            '한글명': '김영희',
            '영문명': 'KIM YOUNGHEE',
            '여권번호': 'M87654321',
            '생년월일': '1985-05-15',
            '여권만료일': '2029-05-15',
            '연락처': '010-2345-6789',
            '이메일': 'kim@example.com',
            '주소': '서울시 서초구',
            '여행이력': '프랑스(2021)',
            '비고': ''
        },
        {
            '한글명': '이철수',
            '영문명': 'LEE CHULSOO',
            '여권번호': 'M11223344',
            '생년월일': '1992-12-25',
            '여권만료일': '2031-12-25',
            '연락처': '010-3456-7890',
            '이메일': 'lee@example.com',
            '주소': '경기도 성남시',
            '여행이력': '베트남(2023), 싱가포르(2024)',
            '비고': '비즈니스 여행'
        }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // 컬럼 너비 설정
    ws['!cols'] = [
        { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
        { wch: 30 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, '고객정보');

    // 안내 시트 추가
    const instructions = [
        { '항목': '작성 안내', '내용': '아래 형식에 맞춰 작성해주세요' },
        { '항목': '한글명', '내용': '필수 - 고객의 한글 이름' },
        { '항목': '영문명', '내용': '필수 - 여권에 표기된 영문 이름 (대문자)' },
        { '항목': '여권번호', '내용': '필수 - 알파벳+숫자 조합 (예: M12345678)' },
        { '항목': '생년월일', '내용': '필수 - YYYY-MM-DD 형식 (예: 1990-01-01)' },
        { '항목': '여권만료일', '내용': '필수 - YYYY-MM-DD 형식' },
        { '항목': '연락처', '내용': '필수 - 010-1234-5678 형식' },
        { '항목': '이메일', '내용': '선택 - 이메일 주소' },
        { '항목': '주소', '내용': '선택 - 주소' },
        { '항목': '여행이력', '내용': '선택 - 기존 여행지 (예: 일본(2022), 태국(2023))' },
        { '항목': '비고', '내용': '선택 - 기타 메모' }
    ];
    const wsInst = XLSX.utils.json_to_sheet(instructions);
    wsInst['!cols'] = [{ wch: 15 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsInst, '작성안내');

    XLSX.writeFile(wb, '고객정보_업로드_샘플.xlsx');
    showNotification('고객 정보 샘플 파일이 다운로드되었습니다.', 'success');
}

// 상품 샘플 템플릿 다운로드
function downloadProductTemplate() {
    const sampleData = [
        {
            '상품명': '도쿄 자유여행 4일',
            '목적지': '일본 도쿄',
            '기간(일)': 4,
            '가격': 850000,
            '상태': '활성',
            '상품설명': '도쿄의 주요 명소를 자유롭게 여행하는 패키지입니다.'
        },
        {
            '상품명': '방콕 휴양 5일',
            '목적지': '태국 방콕',
            '기간(일)': 5,
            '가격': 650000,
            '상태': '활성',
            '상품설명': '방콕과 파타야의 아름다운 해변을 즐기는 여행입니다.'
        },
        {
            '상품명': '파리 문화탐방 7일',
            '목적지': '프랑스 파리',
            '기간(일)': 7,
            '가격': 2500000,
            '상태': '활성',
            '상품설명': '파리의 예술과 문화를 체험하는 프리미엄 여행입니다.'
        }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, '상품정보');

    // 안내 시트
    const instructions = [
        { '항목': '작성 안내', '내용': '아래 형식에 맞춰 작성해주세요' },
        { '항목': '상품명', '내용': '필수 - 여행 상품명' },
        { '항목': '목적지', '내용': '필수 - 여행 목적지' },
        { '항목': '기간(일)', '내용': '필수 - 숫자만 입력 (예: 4)' },
        { '항목': '가격', '내용': '필수 - 숫자만 입력 (예: 850000)' },
        { '항목': '상태', '내용': '필수 - "활성" 또는 "비활성"' },
        { '항목': '상품설명', '내용': '선택 - 상품 설명' }
    ];
    const wsInst = XLSX.utils.json_to_sheet(instructions);
    wsInst['!cols'] = [{ wch: 15 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsInst, '작성안내');

    XLSX.writeFile(wb, '상품정보_업로드_샘플.xlsx');
    showNotification('상품 정보 샘플 파일이 다운로드되었습니다.', 'success');
}

// 예약 샘플 템플릿 다운로드
function downloadBookingTemplate() {
    // 고객과 상품 목록 가져오기
    const customerList = state.customers.map(c => `${c.name_kor}(${c.id.substring(0, 8)})`).join(', ');
    const productList = state.products.map(p => `${p.name}(${p.id.substring(0, 8)})`).join(', ');

    const sampleData = [
        {
            '고객ID': state.customers[0]?.id || 'customer-id',
            '상품ID': state.products[0]?.id || 'product-id',
            '출발일': '2024-12-01',
            '귀국일': '2024-12-05',
            '인원': 2,
            '총금액': 1700000,
            '호텔명': '힐튼 호텔',
            '항공편': 'KE123',
            '상태': '예약확정',
            '메모': '신혼여행'
        }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
        { wch: 36 }, { wch: 36 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 12 },
        { wch: 12 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, '예약정보');

    // 안내 시트
    const instructions = [
        { '항목': '작성 안내', '내용': '아래 형식에 맞춰 작성해주세요' },
        { '항목': '고객ID', '내용': `필수 - 등록된 고객의 ID (고객 관리에서 확인)` },
        { '항목': '상품ID', '내용': `필수 - 등록된 상품의 ID (상품 관리에서 확인)` },
        { '항목': '출발일', '내용': '필수 - YYYY-MM-DD 형식 (예: 2024-12-01)' },
        { '항목': '귀국일', '내용': '필수 - YYYY-MM-DD 형식' },
        { '항목': '인원', '내용': '필수 - 숫자만 입력 (예: 2)' },
        { '항목': '총금액', '내용': '필수 - 숫자만 입력 (예: 1700000)' },
        { '항목': '호텔명', '내용': '선택 - 호텔명' },
        { '항목': '항공편', '내용': '선택 - 항공편명 (예: KE123)' },
        { '항목': '상태', '내용': '필수 - 문의/견적발송/예약확정/출발완료/여행완료/취소' },
        { '항목': '메모', '내용': '선택 - 메모' },
        { '항목': '', '내용': '' },
        { '항목': '등록된 고객 목록', '내용': customerList || '고객을 먼저 등록해주세요' },
        { '항목': '등록된 상품 목록', '내용': productList || '상품을 먼저 등록해주세요' }
    ];
    const wsInst = XLSX.utils.json_to_sheet(instructions);
    wsInst['!cols'] = [{ wch: 20 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInst, '작성안내');

    XLSX.writeFile(wb, '예약정보_업로드_샘플.xlsx');
    showNotification('예약 정보 샘플 파일이 다운로드되었습니다.', 'success');
}

// 고객 엑셀 파일 업로드
async function handleCustomerFileUpload(e) {
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
            
            // 필수 필드 검증
            if (!row['한글명'] || !row['영문명'] || !row['여권번호'] || 
                !row['생년월일'] || !row['여권만료일'] || !row['연락처']) {
                errors.push(`${i + 2}행: 필수 필드가 누락되었습니다.`);
                errorCount++;
                continue;
            }

            try {
                const customerData = {
                    name_kor: row['한글명'],
                    name_eng: String(row['영문명']).toUpperCase(),
                    passport_number: String(row['여권번호']).toUpperCase(),
                    birth_date: formatDateFromExcel(row['생년월일']),
                    passport_expiry: formatDateFromExcel(row['여권만료일']),
                    phone: String(row['연락처']),
                    email: row['이메일'] || '',
                    address: row['주소'] || '',
                    travel_history: row['여행이력'] || '',
                    notes: row['비고'] || '',
                    passport_file_name: null,
                    passport_file_data: null
                };

                await fetch('tables/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customerData)
                });

                successCount++;
            } catch (error) {
                errors.push(`${i + 2}행: ${error.message}`);
                errorCount++;
            }
        }

        await loadCustomers();
        
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

// 상품 엑셀 파일 업로드
async function handleProductFileUpload(e) {
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
            
            if (!row['상품명'] || !row['목적지'] || !row['기간(일)'] || 
                !row['가격'] || !row['상태']) {
                errors.push(`${i + 2}행: 필수 필드가 누락되었습니다.`);
                errorCount++;
                continue;
            }

            try {
                const productData = {
                    name: row['상품명'],
                    destination: row['목적지'],
                    duration: parseInt(row['기간(일)']),
                    price: parseInt(row['가격']),
                    status: row['상태'],
                    description: row['상품설명'] || ''
                };

                await fetch('tables/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                successCount++;
            } catch (error) {
                errors.push(`${i + 2}행: ${error.message}`);
                errorCount++;
            }
        }

        await loadProducts();
        
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

// js/modules/eventHandlers.js
import { state } from './state.js';
import * as api from './api.js';
import * as ui from './ui.js';

// ==================== Data Loading ====================

export async function loadAllData() {
    try {
        const [customers, products, bookings, todos, notifications] = await Promise.all([
            api.getTableData('customers', 'limit=1000'),
            api.getTableData('products', 'limit=1000'),
            api.getTableData('bookings', 'limit=1000'),
            api.getTableData('todos', 'limit=1000'),
            api.getTableData('notifications', 'limit=1000&sort=created_at&order=desc')
        ]);

        state.customers = customers.data || [];
        state.products = products.data || [];
        state.bookings = bookings.data || [];
        state.todos = todos.data || [];
        state.notifications = notifications.data || [];

        ui.renderCustomersTable();
        ui.updateCustomerSelects();
        ui.renderProductsGrid();
        ui.updateProductSelects();
        ui.renderBookingsTable();
        ui.renderTodos();
        // Notifications are rendered when the panel is opened or on page load
        
    } catch (error) {
        ui.showNotification('데이터 로드 중 오류가 발생했습니다.', 'error');
    }
}


// ==================== Event Handlers ====================

export async function handleCustomerSubmit(e) {
    e.preventDefault();
    const customerId = document.getElementById('customerId').value;
    const fileInput = document.getElementById('customerPassportFile');
    let passportFileData = null;
    let passportFileName = null;

    try {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            passportFileData = await api.fileToBase64(file);
            passportFileName = file.name;
        } else if (customerId) {
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

        if (customerId) {
            await api.updateTableData('customers', customerId, customerData);
            ui.showNotification('고객 정보가 수정되었습니다.', 'success');
        } else {
            await api.createTableData('customers', customerData);
            ui.showNotification('고객이 추가되었습니다.', 'success');
        }

        ui.closeModal('modalCustomer');
        await loadAllData();
        ui.updateDashboard();
    } catch (error) {
        ui.showNotification(`저장 중 오류: ${error.message}`, 'error');
    }
}

export async function handleProductSubmit(e) {
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
            await api.updateTableData('products', productId, productData);
            ui.showNotification('상품 정보가 수정되었습니다.', 'success');
        } else {
            await api.createTableData('products', productData);
            ui.showNotification('상품이 추가되었습니다.', 'success');
        }
        ui.closeModal('modalProduct');
        await loadAllData();
        ui.updateDashboard();
    } catch (error) {
        ui.showNotification(`저장 중 오류: ${error.message}`, 'error');
    }
}

export async function handleBookingSubmit(e) {
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
            await api.updateTableData('bookings', bookingId, bookingData);
            ui.showNotification('예약 정보가 수정되었습니다.', 'success');
        } else {
            await api.createTableData('bookings', bookingData);
            ui.showNotification('예약이 추가되었습니다.', 'success');
        }
        ui.closeModal('modalBooking');
        await loadAllData();
        ui.updateDashboard();
    } catch (error) {
        ui.showNotification(`저장 중 오류: ${error.message}`, 'error');
    }
}

export async function handleTodoSubmit(e) {
    e.preventDefault();
    const todoId = document.getElementById('todoId').value;
    const todoData = {
        title: document.getElementById('todoTitle').value,
        due_date: document.getElementById('todoDate').value,
        priority: document.getElementById('todoPriority').value,
        description: document.getElementById('todoDescription').value,
    };

    try {
        if (todoId) {
            await api.updateTableData('todos', todoId, todoData);
            ui.showNotification('할 일이 수정되었습니다.', 'success');
        } else {
            await api.createTableData('todos', todoData);
            ui.showNotification('할 일이 추가되었습니다.', 'success');
        }
        ui.closeModal('modalTodo');
        await loadAllData();
        ui.updateDashboard();
    } catch (error) {
        ui.showNotification(`저장 중 오류: ${error.message}`, 'error');
    }
}

export function filterCustomers() {
    const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();
    const filtered = state.customers.filter(customer =>
        (customer.name_kor && customer.name_kor.toLowerCase().includes(searchTerm)) ||
        (customer.name_eng && customer.name_eng.toLowerCase().includes(searchTerm)) ||
        (customer.passport_number && customer.passport_number.toLowerCase().includes(searchTerm)) ||
        (customer.phone && customer.phone.includes(searchTerm))
    );
    ui.renderCustomersTable(filtered);
}

export function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const statusFilter = document.getElementById('filterProductStatus').value;
    
    const filtered = state.products.filter(product => {
        const matchesSearch = 
            product.name.toLowerCase().includes(searchTerm) ||
            product.destination.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || product.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    ui.renderProductsGrid(filtered);
}

export function filterBookings() {
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
    
    ui.renderBookingsTable(filtered);
}

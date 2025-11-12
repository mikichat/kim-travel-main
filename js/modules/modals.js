// js/modules/modals.js
import { state } from './state.js';
import { openModal, closeModal } from './ui.js';

// Helper function, should be in ui.js but placed here for simplicity for now
function removePassportFile() {
    document.getElementById('customerPassportFile').value = '';
    document.getElementById('passportFileName').textContent = '선택된 파일 없음';
    document.getElementById('btnRemovePassport').style.display = 'none';
    document.getElementById('passportPreview').innerHTML = '';
}

export function openCustomerModal(customerId = null) {
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
            
            if (customer.passport_file_name) {
                document.getElementById('passportFileName').textContent = customer.passport_file_name;
                document.getElementById('btnRemovePassport').style.display = 'inline-block';
                
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

export function openProductModal(productId = null) {
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

export function openBookingModal(bookingId = null) {
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

export function openTodoModal(todoId = null) {
    const form = document.getElementById('formTodo');
    form.reset();
    document.getElementById('todoId').value = '';

    if (todoId) {
        const todo = state.todos.find(t => t.id === todoId);
        if (todo) {
            document.getElementById('modalTodoTitle').textContent = '할 일 수정';
            document.getElementById('todoId').value = todo.id;
            document.getElementById('todoTitle').value = todo.title;
            document.getElementById('todoDate').value = todo.due_date;
            document.getElementById('todoPriority').value = todo.priority;
            document.getElementById('todoDescription').value = todo.description || '';
        }
    } else {
        document.getElementById('modalTodoTitle').textContent = '할 일 추가';
    }
    openModal('modalTodo');
}

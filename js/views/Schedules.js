import AbstractView from '../core/AbstractView.js';

export default class Schedules extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Schedules");
    }

    async getHtml() {
        return `
            <div class="container-fluid" style="padding: 20px;">
                <header class="schedule-header" style="background: white; padding: 20px 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h1 style="color: #667eea; font-size: 28px;"><i class="fas fa-calendar-alt"></i> 일정 관리</h1>
                    <div class="nav-buttons" style="display: flex; gap: 10px;">
                        <input type="text" id="headerGroupName" placeholder="그룹명 입력..." style="padding: 10px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; width: 200px;">
                        <button class="btn btn-warning" onclick="document.getElementById('excelUpload').click()">
                            <i class="fas fa-file-upload"></i> 엑셀 업로드
                        </button>
                        <input type="file" id="excelUpload" accept=".xlsx,.xls" style="display: none;">
                        <button class="btn btn-success" id="btnShowAddForm"><i class="fas fa-plus"></i> 새 일정</button>
                    </div>
                </header>

                <!-- 통계 카드 -->
                <div class="stats-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); text-align: center;">
                        <i class="fas fa-calendar-check" style="font-size: 32px; color: #667eea; margin-bottom: 10px;"></i>
                        <div class="stat-number" id="statTotal" style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 5px;">0</div>
                        <div class="stat-label" style="font-size: 14px; color: #666;">전체 일정</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); text-align: center;">
                        <i class="fas fa-calendar-day" style="font-size: 32px; color: #667eea; margin-bottom: 10px;"></i>
                        <div class="stat-number" id="statToday" style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 5px;">0</div>
                        <div class="stat-label" style="font-size: 14px; color: #666;">오늘 일정</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); text-align: center;">
                        <i class="fas fa-calendar-week" style="font-size: 32px; color: #667eea; margin-bottom: 10px;"></i>
                        <div class="stat-number" id="statWeek" style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 5px;">0</div>
                        <div class="stat-label" style="font-size: 14px; color: #666;">이번 주</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); text-align: center;">
                        <i class="fas fa-calendar-alt" style="font-size: 32px; color: #667eea; margin-bottom: 10px;"></i>
                        <div class="stat-number" id="statMonth" style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 5px;">0</div>
                        <div class="stat-label" style="font-size: 14px; color: #666;">이번 달</div>
                    </div>
                </div>

                <!-- 필터 바 -->
                <div class="filter-bar" style="background: white; padding: 15px 25px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
                    <i class="fas fa-search" style="color: #999;"></i>
                    <input type="text" id="searchInput" placeholder="일정 검색..." style="flex: 1; padding: 10px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                    <input type="date" id="filterDate" style="flex: 1; padding: 10px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                    <button class="btn btn-secondary btn-sm" id="btnResetFilters">
                        <i class="fas fa-redo"></i> 초기화
                    </button>
                </div>

                <!-- 캘린더 뷰 -->
                <div class="calendar-view" style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                    <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 id="currentMonthYear" style="color: #333; font-size: 24px;">2025년 11월</h2>
                        <div class="calendar-nav" style="display: flex; gap: 10px; align-items: center;">
                            <button class="btn btn-secondary btn-sm" id="btnPrevMonth">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="btn btn-info btn-sm" id="btnGoToToday">
                                오늘
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btnNextMonth">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="calendar-grid" id="calendarGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;"></div>
                </div>

                <!-- 메인 컨텐츠 -->
                <div class="main-content" style="display: grid; grid-template-columns: 400px 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- 일정 추가/수정 폼 -->
                    <div class="card" style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);">
                        <h2 id="formTitle" style="color: #333; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #667eea; font-size: 20px;">새 일정 추가</h2>
                        <form id="scheduleForm">
                            <input type="hidden" id="scheduleId">

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-users"></i> 그룹명</label>
                                <input type="text" id="groupName" placeholder="예: 하노이 골프단, 제주 워크샵" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-calendar"></i> 일자</label>
                                <input type="date" id="eventDate" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-map-marker-alt"></i> 지역</label>
                                <input type="text" id="location" placeholder="예: 인천, 하노이" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-bus"></i> 교통편</label>
                                <input type="text" id="transport" placeholder="예: OZ123편, 전용차량" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-clock"></i> 시간</label>
                                <input type="text" id="time" placeholder="예: 09:00, 09:00-18:00" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-list"></i> 일정 <span style="color: red;">*</span></label>
                                <textarea id="schedule" required placeholder="세부 일정을 입력하세요" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; min-height: 120px; resize: vertical;"></textarea>
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;"><i class="fas fa-utensils"></i> 식사</label>
                                <input type="text" id="meals" placeholder="예: 조:호텔식, 중:현지식, 석:한식" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
                            </div>

                            <div style="display: flex; gap: 10px;">
                                <button type="submit" class="btn btn-success" style="flex: 1;">
                                    <i class="fas fa-save"></i> 저장
                                </button>
                                <button type="button" class="btn btn-secondary" id="btnResetForm">
                                    <i class="fas fa-redo"></i> 초기화
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- 일정 목록 -->
                    <div class="card" style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #667eea; font-size: 20px;">일정 목록</h2>
                        <div class="schedule-list" id="scheduleList" style="max-height: 600px; overflow-y: auto;">
                            <div class="empty-message">등록된 일정이 없습니다.</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toast 알림 -->
            <div id="toast" class="toast" style="position: fixed; bottom: 30px; right: 30px; background: #333; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3); display: none; align-items: center; gap: 10px; z-index: 1000;">
                <i class="fas fa-check-circle"></i>
                <span id="toastMessage"></span>
            </div>
        `;
    }

    async executeScript() {
        const API_URL = 'http://localhost:5000/api';
        let schedules = [];
        let currentDate = new Date();

        // Attach event listeners manually since we are not using a framework
        document.getElementById('scheduleForm').addEventListener('submit', saveSchedule);
        document.getElementById('btnResetForm').addEventListener('click', resetForm);
        document.getElementById('btnShowAddForm').addEventListener('click', showAddForm);
        document.getElementById('excelUpload').addEventListener('change', handleExcelUpload);
        document.getElementById('searchInput').addEventListener('keyup', filterSchedules);
        document.getElementById('filterDate').addEventListener('change', filterSchedules);
        document.getElementById('btnResetFilters').addEventListener('click', resetFilters);
        document.getElementById('btnPrevMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        document.getElementById('btnNextMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        document.getElementById('btnGoToToday').addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

        // Load data
        await loadSchedules();
        renderCalendar();

        async function loadSchedules() {
            try {
                const response = await fetch(`${API_URL}/schedules`);
                if (!response.ok) throw new Error('일정을 불러오는데 실패했습니다.');
                schedules = await response.json();
                renderScheduleList();
                renderCalendar();
                updateStats();
            } catch (error) {
                console.error('Error:', error);
                showToast('일정을 불러오는데 실패했습니다.', 'error');
            }
        }

        function renderScheduleList(filteredSchedules = null) {
            const list = document.getElementById('scheduleList');
            const displaySchedules = filteredSchedules || schedules;

            if (displaySchedules.length === 0) {
                list.innerHTML = '<div class="empty-message" style="text-align: center; padding: 60px 40px; color: #999; font-size: 16px; background: #f8f9fa; border-radius: 10px; border: 2px dashed #ddd;"><i class="fas fa-calendar-times" style="font-size: 48px; display: block; margin-bottom: 15px; color: #ccc;"></i>등록된 일정이 없습니다.</div>';
                return;
            }

            const sortedSchedules = [...displaySchedules].sort((a, b) => {
                if (!a.event_date) return 1;
                if (!b.event_date) return -1;
                return new Date(b.event_date) - new Date(a.event_date);
            });

            const groupedByDate = {};
            sortedSchedules.forEach(schedule => {
                const date = schedule.event_date || 'no-date';
                if (!groupedByDate[date]) groupedByDate[date] = [];
                groupedByDate[date].push(schedule);
            });

            let tableHTML = `
                <table class="schedule-table" style="width: 100%; border-collapse: collapse; font-size: 13px; background: white;">
                    <thead>
                        <tr>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 8%;">일자</th>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 10%;">지역</th>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 12%;">교통편</th>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 8%;">시간</th>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 38%;">일정</th>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 10%;">식사</th>
                            <th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: center; font-weight: 600; border: 1px solid #5568d3; white-space: nowrap; width: 8%;">작업</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            Object.keys(groupedByDate).forEach(date => {
                const schedules = groupedByDate[date];
                const rowCount = schedules.length;

                schedules.forEach((schedule, index) => {
                    tableHTML += `<tr>`;
                    if (index === 0) {
                        tableHTML += `<td rowspan="${rowCount}" style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; text-align: center; font-weight: 600; color: #667eea; background: #f8f9ff; border-right: 2px solid #667eea !important;">${date !== 'no-date' ? formatDate(date) : '-'}</td>`;
                    }
                    tableHTML += `
                        <td style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; color: #333; font-weight: 500;">${escapeHtml(schedule.location || '-')}</td>
                        <td style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; color: #666; font-size: 12px;">${escapeHtml(schedule.transport || '-')}</td>
                        <td style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; text-align: center; color: #666;">${escapeHtml(schedule.time || '-')}</td>
                        <td style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; line-height: 1.6; color: #555;">
                            ${schedule.group_name ? `<div style="background: #667eea; color: white; padding: 3px 8px; border-radius: 5px; display: inline-block; margin-bottom: 5px; font-size: 11px;"><i class="fas fa-users"></i> ${escapeHtml(schedule.group_name)}</div><br>` : ''}
                            ${escapeHtml(schedule.schedule || '-').replace(/\n/g, '<br>')}
                        </td>
                        <td style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; text-align: center; color: #666; font-size: 12px;">${escapeHtml(schedule.meals || '-')}</td>
                        <td style="padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; text-align: center;">
                            <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                                <button class="btn btn-info btn-sm edit-btn" data-id="${schedule.id}" style="padding: 6px 12px; font-size: 12px;"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${schedule.id}" style="padding: 6px 12px; font-size: 12px;"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>`;
                });
            });

            tableHTML += `</tbody></table>`;
            list.innerHTML = tableHTML;

            // Add event listeners for dynamic buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => editSchedule(parseInt(e.currentTarget.dataset.id)));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteSchedule(parseInt(e.currentTarget.dataset.id)));
            });
        }

        function renderCalendar() {
             const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            document.getElementById('currentMonthYear').textContent =
                `${year}년 ${month + 1}월`;

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const prevLastDay = new Date(year, month, 0);

            const firstDayOfWeek = firstDay.getDay();
            const lastDate = lastDay.getDate();
            const prevLastDate = prevLastDay.getDate();

            const grid = document.getElementById('calendarGrid');
            let html = '';

            const days = ['일', '월', '화', '수', '목', '금', '토'];
            days.forEach(day => {
                html += `<div style="text-align: center; font-weight: bold; padding: 10px; background: #667eea; color: white; border-radius: 5px;">${day}</div>`;
            });

            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                html += `<div style="aspect-ratio: 1; background: #f8f9fa; border-radius: 8px; padding: 8px; opacity: 0.3;">
                    <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${prevLastDate - i}</div>
                </div>`;
            }

            const today = new Date();
            for (let date = 1; date <= lastDate; date++) {
                const currentDay = new Date(year, month, date);
                const dateStr = formatDateForDB(currentDay);

                const isToday = today.getFullYear() === year &&
                               today.getMonth() === month &&
                               today.getDate() === date;

                const daySchedules = schedules.filter(s => s.event_date === dateStr);
                const hasEvent = daySchedules.length > 0;

                let styles = "aspect-ratio: 1; background: #f8f9fa; border-radius: 8px; padding: 8px; cursor: pointer; transition: all 0.3s; position: relative; min-height: 80px;";
                if (isToday) styles += " background: #fff3cd; border: 2px solid #ffc107;";
                if (hasEvent) styles += " background: #e3f2fd; border: 2px solid #667eea;";

                html += `<div style="${styles}" class="calendar-day" data-date="${dateStr}">
                    <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${date}</div>
                    ${daySchedules.map(() => '<span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; display: inline-block; margin: 2px;"></span>').join('')}
                </div>`;
            }

            const remainingCells = 42 - (firstDayOfWeek + lastDate);
            for (let date = 1; date <= remainingCells; date++) {
                html += `<div style="aspect-ratio: 1; background: #f8f9fa; border-radius: 8px; padding: 8px; opacity: 0.3;">
                    <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${date}</div>
                </div>`;
            }

            grid.innerHTML = html;

            document.querySelectorAll('.calendar-day').forEach(el => {
                el.addEventListener('click', (e) => selectDate(e.currentTarget.dataset.date));
            });
        }

        async function saveSchedule(event) {
            event.preventDefault();

            const scheduleData = {
                group_name: document.getElementById('groupName').value || null,
                event_date: document.getElementById('eventDate').value || null,
                location: document.getElementById('location').value || null,
                transport: document.getElementById('transport').value || null,
                time: document.getElementById('time').value || null,
                schedule: document.getElementById('schedule').value,
                meals: document.getElementById('meals').value || null
            };

            const id = document.getElementById('scheduleId').value;

            try {
                const url = id ? `${API_URL}/schedules/${id}` : `${API_URL}/schedules`;
                const method = id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scheduleData)
                });

                if (!response.ok) throw new Error('저장에 실패했습니다.');

                showToast(id ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', 'success');
                resetForm();
                loadSchedules();
            } catch (error) {
                console.error('Error:', error);
                showToast('저장에 실패했습니다.', 'error');
            }
        }

        function editSchedule(id) {
            const schedule = schedules.find(s => s.id === id);
            if (!schedule) return;

            document.getElementById('formTitle').textContent = '일정 수정';
            document.getElementById('scheduleId').value = schedule.id;
            document.getElementById('groupName').value = schedule.group_name || '';
            document.getElementById('eventDate').value = schedule.event_date || '';
            document.getElementById('location').value = schedule.location || '';
            document.getElementById('transport').value = schedule.transport || '';
            document.getElementById('time').value = schedule.time || '';
            document.getElementById('schedule').value = schedule.schedule || '';
            document.getElementById('meals').value = schedule.meals || '';

            document.getElementById('scheduleForm').scrollIntoView({ behavior: 'smooth' });
        }

        async function deleteSchedule(id) {
            if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;

            try {
                const response = await fetch(`${API_URL}/schedules/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('삭제에 실패했습니다.');

                showToast('일정이 삭제되었습니다.', 'success');
                loadSchedules();
            } catch (error) {
                console.error('Error:', error);
                showToast('삭제에 실패했습니다.', 'error');
            }
        }

        function resetForm() {
            document.getElementById('formTitle').textContent = '새 일정 추가';
            document.getElementById('scheduleForm').reset();
            document.getElementById('scheduleId').value = '';
        }

        function showAddForm() {
            resetForm();
            document.getElementById('scheduleForm').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('schedule').focus();
        }

        async function handleExcelUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const groupName = document.getElementById('headerGroupName').value.trim();
            if (!groupName) {
                showToast('그룹명을 입력해주세요.', 'error');
                event.target.value = '';
                return;
            }

            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
                showToast('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.', 'error');
                event.target.value = '';
                return;
            }

            const formData = new FormData();
            formData.append('schedule_file', file);
            formData.append('group_name', groupName);

            showToast('파일을 업로드하고 있습니다...', 'info');

            try {
                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || '업로드에 실패했습니다.');
                }

                showToast(result.message || '업로드가 완료되었습니다.', 'success');
                document.getElementById('headerGroupName').value = '';
                await loadSchedules();

            } catch (error) {
                console.error('Upload error:', error);
                showToast(error.message || '업로드 중 오류가 발생했습니다.', 'error');
            } finally {
                event.target.value = '';
            }
        }

        function filterSchedules() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const filterDate = document.getElementById('filterDate').value;

            let filtered = schedules;

            if (searchTerm) {
                filtered = filtered.filter(s =>
                    (s.group_name && s.group_name.toLowerCase().includes(searchTerm)) ||
                    (s.schedule && s.schedule.toLowerCase().includes(searchTerm)) ||
                    (s.location && s.location.toLowerCase().includes(searchTerm)) ||
                    (s.transport && s.transport.toLowerCase().includes(searchTerm)) ||
                    (s.meals && s.meals.toLowerCase().includes(searchTerm))
                );
            }

            if (filterDate) {
                filtered = filtered.filter(s => s.event_date === filterDate);
            }

            renderScheduleList(filtered);
        }

        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('filterDate').value = '';
            renderScheduleList();
        }

        function selectDate(dateStr) {
            document.getElementById('filterDate').value = dateStr;
            filterSchedules();
        }

        function updateStats() {
            const today = new Date();
            const todayStr = formatDateForDB(today);
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            document.getElementById('statTotal').textContent = schedules.length;
            document.getElementById('statToday').textContent = schedules.filter(s => s.event_date === todayStr).length;
            document.getElementById('statWeek').textContent = schedules.filter(s => {
                if (!s.event_date) return false;
                const date = new Date(s.event_date);
                return date >= weekStart && date <= weekEnd;
            }).length;
            document.getElementById('statMonth').textContent = schedules.filter(s => {
                if (!s.event_date) return false;
                const date = new Date(s.event_date);
                return date >= monthStart && date <= monthEnd;
            }).length;
        }

        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');

            if (type === 'success') {
                toast.style.backgroundColor = '#28a745';
            } else if (type === 'error') {
                toast.style.backgroundColor = '#dc3545';
            } else {
                toast.style.backgroundColor = '#333';
            }

            toast.style.display = 'flex';
            toastMessage.textContent = message;

            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }

        function formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        function formatDateForDB(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
}

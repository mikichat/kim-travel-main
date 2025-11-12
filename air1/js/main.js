// 항공편 자동 변환기 JavaScript

// Kakao SDK 초기화 (JavaScript 키로 교체 필요)
// 사용자는 https://developers.kakao.com/ 에서 앱을 생성하고 JavaScript 키를 발급받아야 합니다.
const KAKAO_JS_KEY = 'YOUR_KAKAO_JAVASCRIPT_KEY'; // 여기에 카카오 JavaScript 키 입력

if (typeof Kakao !== 'undefined' && KAKAO_JS_KEY !== 'YOUR_KAKAO_JAVASCRIPT_KEY') {
    if (!Kakao.isInitialized()) {
        Kakao.init(KAKAO_JS_KEY);
    }
}

// 공항 데이터 저장 변수
let airportData = {};
let airportCodeMap = {};

// JSON 파일에서 공항 데이터 로드
async function loadAirportData() {
    try {
        const response = await fetch('../world_airports_by_region.json');
        airportData = await response.json();

        // 공항 코드를 키로 하는 맵 생성 (빠른 조회를 위해)
        airportCodeMap = {};
        for (const region in airportData) {
            airportData[region].forEach(airport => {
                // 도시명을 기본으로 사용 (더 간결함)
                airportCodeMap[airport['공항코드']] = airport['도시'];
            });
        }

        console.log('공항 데이터 로드 완료:', Object.keys(airportCodeMap).length, '개 공항');
    } catch (error) {
        console.error('공항 데이터 로드 실패:', error);
        // 로드 실패 시 기본 데이터 사용
    }
}

// 페이지 로드 시 공항 데이터 로드
loadAirportData();

// 날짜 변환 함수 (예: 14NOV -> 2026.11.14(금))
function convertDate(dateStr) {
    const monthMap = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    
    const dayOfWeekMap = ['일', '월', '화', '수', '목', '금', '토'];
    
    // dateStr 형식: 14NOV
    const day = dateStr.substring(0, 2);
    const monthStr = dateStr.substring(2, 5);
    const month = monthMap[monthStr];
    
    // 현재 날짜 정보
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 0-11 -> 1-12
    
    // 항공권은 보통 미래 날짜이므로, 입력된 월이 현재 월보다 이전이면 다음 연도로 처리
    // 예: 현재가 1월인데 11월 항공권이면 -> 올해 11월
    // 예: 현재가 12월인데 1월 항공권이면 -> 다음해 1월
    let year = currentYear;
    const inputMonth = parseInt(month, 10);
    
    // 입력된 월이 현재 월보다 작으면 다음 연도
    // 단, 11-12월에 1-2월 예약하는 경우를 고려
    if (inputMonth < currentMonth - 1) {
        // 현재 월보다 2개월 이상 이전이면 다음 연도
        year = currentYear + 1;
    }
    
    // 날짜 객체 생성
    const date = new Date(`${year}-${month}-${day}`);
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    
    return `${year}.${month}.${day}(${dayOfWeek})`;
}

// 시간 변환 함수 (예: 0820 -> 08:20)
function convertTime(timeStr) {
    if (!timeStr || timeStr.length !== 4) return timeStr;
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
}

// 공항 코드를 한글로 변환
function getAirportName(code) {
    // JSON 데이터가 로드되었으면 우선 사용
    if (airportCodeMap[code]) {
        return airportCodeMap[code];
    }

    // 백업용 기본 데이터
    const airportMap = {
        'ICN': '인천',
        'CAN': '광저우',
        'PVG': '상하이',
        'PEK': '베이징',
        'NRT': '나리타',
        'HND': '하네다',
        'KIX': '간사이',
        'BKK': '방콕',
        'SIN': '싱가포르',
        'HKG': '홍콩',
        'TPE': '타이페이',
        'SEL': '서울',
        'GMP': '김포'
    };
    return airportMap[code] || code;
}

// 터미널 정보 가져오기 (향후 확장용)
function getTerminalInfo(airportCode) {
    const terminalMap = {
        'ICN': '터미널 1',
        'CAN': '터미널 2',
        'PVG': '터미널 2',
        'PEK': '터미널 3',
        'NRT': '터미널 1',
        'KIX': '터미널 1',
        'BKK': '터미널 1',
    };
    return terminalMap[airportCode] || '';
}

// 항공편 정보 파싱 및 변환
function parseFlightInfo(line) {
    // 두 가지 형식 지원:
    // 형식1: "1 OZ 369T 14NOV 5 ICNCAN HK6 0820 1130 HRS"
    // 형식2: "1  KE 711 U 03FEB 2 ICNNRT DK9  1325 1555  03FEB  E  0 73J L"
    
    const parts = line.split(/\s+/).filter(Boolean);
    
    if (parts.length < 9) {
        return null;
    }
    
    // 항공편명 (항상 위치 1, 2)
    let flightNumber = parts[1] + ' ' + parts[2]; // OZ 369T 또는 KE 711

    // 항공편명에서 클래스 코드 제거 (예: OZ 112Q -> OZ 112)
    // 숫자 뒤에 알파벳이 하나만 있으면 제거
    flightNumber = flightNumber.replace(/(\d+)[A-Z]$/, '$1');
    
    // 날짜 위치 판단: 형식에 따라 다름
    let dateIndex, routeIndex, departureTimeIndex, arrivalTimeIndex;
    
    // 형식 판단: parts[3]이 날짜(14NOV) 또는 클래스 코드(U)인지 확인
    if (/^\d{2}[A-Z]{3}$/.test(parts[3])) {
        // 형식1: "1 OZ 369T 14NOV 5 ICNCAN HK6 0820 1130 HRS"
        dateIndex = 3;
        routeIndex = 5;
        departureTimeIndex = 7;
        arrivalTimeIndex = 8;
    } else {
        // 형식2: "1  KE 711 U 03FEB 2 ICNNRT DK9  1325 1555  03FEB  E  0 73J L"
        // parts[3]이 클래스 코드(U, L 등)
        dateIndex = 4;
        routeIndex = 6;
        departureTimeIndex = 8;
        arrivalTimeIndex = 9;
    }
    
    const date = parts[dateIndex]; // 14NOV 또는 03FEB
    const route = parts[routeIndex]; // ICNCAN 또는 ICNNRT
    const departure = route.substring(0, 3); // ICN
    const arrival = route.substring(3, 6); // CAN 또는 NRT
    const departureTime = parts[departureTimeIndex]; // 0820 또는 1325
    const arrivalTime = parts[arrivalTimeIndex]; // 1130 또는 1555
    
    return {
        flightNumber,
        date,
        departure,
        arrival,
        departureTime,
        arrivalTime
    };
}

// 변환 처리
function handleConvert() {
    const input = document.getElementById('inputText').value.trim();
    
    if (!input) {
        alert('항공편 정보를 입력해주세요.');
        return;
    }
    
    const lines = input.split(/\n/).filter(l => l.trim() !== '');
    
    if (lines.length < 1) {
        alert('항공편 정보를 입력해주세요.');
        return;
    }
    
    // 출발편 파싱 (필수)
    const departure = parseFlightInfo(lines[0]);
    
    if (!departure) {
        alert('항공편 정보 형식이 올바르지 않습니다.');
        return;
    }
    
    // 도착편 파싱 (선택사항)
    const arrival = lines.length >= 2 ? parseFlightInfo(lines[1]) : null;
    
    // 결과 생성
    const departureDate = convertDate(departure.date);
    const departureAirport = getAirportName(departure.departure);
    const departureDestination = getAirportName(departure.arrival);
    const departureTimeFormatted = convertTime(departure.departureTime);
    const departureArrivalTimeFormatted = convertTime(departure.arrivalTime);

    // 예약번호 가져오기 (체크박스가 선택된 경우에만)
    const showPnr = document.getElementById('showPnr').checked;
    const pnr = showPnr ? document.getElementById('pnrInput').value.trim() : '';

    // 새로운 간소화된 형식: 년월일 - 출발지: 시간 - 도착지: 도착시간 - 항공편명
    let output = '';

    // 예약번호가 있으면 상단에 강조 표시
    if (pnr) {
        output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        output += `📌 예약번호: ${pnr}\n`;
        output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    output += `출발 : ${departureDate} - ${departureAirport}: ${departureTimeFormatted} - ${departureDestination}: ${departureArrivalTimeFormatted} - ${departure.flightNumber}`;

    // 도착편이 있는 경우에만 추가
    if (arrival) {
        const arrivalDate = convertDate(arrival.date);
        const arrivalAirport = getAirportName(arrival.departure);
        const arrivalDestination = getAirportName(arrival.arrival);
        const arrivalTimeFormatted = convertTime(arrival.departureTime);
        const arrivalArrivalTimeFormatted = convertTime(arrival.arrivalTime);

        output += `\n\n도착 : ${arrivalDate} - ${arrivalAirport}: ${arrivalTimeFormatted} - ${arrivalDestination}: ${arrivalArrivalTimeFormatted} - ${arrival.flightNumber}`;
    }
    
    // 결과 표시
    document.getElementById('outputText').querySelector('pre').textContent = output;
    document.getElementById('outputSection').classList.remove('hidden');
    
    // 스크롤 이동
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 복사 기능
function handleCopy() {
    const output = document.getElementById('outputText').querySelector('pre').textContent;
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;
    const meetingPlace = document.getElementById('meetingPlaceInput').value;

    const showMealDeparture = document.getElementById('showMealDeparture').checked;
    const showMealArrival = document.getElementById('showMealArrival').checked;

    const mealDepartureRadio = document.querySelector('input[name="mealDeparture"]:checked');
    const mealArrivalRadio = document.querySelector('input[name="mealArrival"]:checked');
    const mealDeparture = showMealDeparture && mealDepartureRadio ? mealDepartureRadio.value : '';
    const mealArrival = showMealArrival && mealArrivalRadio ? mealArrivalRadio.value : '';

    let copyText = output;

    if (name || phone || meetingPlace || mealDeparture || mealArrival) {
        copyText += '\n\n--- 고객 정보 ---';
        if (name) copyText += `\n대표: ${name}`;
        if (phone) copyText += `\n전화번호: ${phone}`;
        if (meetingPlace) copyText += `\n미팅 장소: ${meetingPlace}`;
        if (mealDeparture) copyText += `\n출발편 식사: ${mealDeparture}`;
        if (mealArrival) copyText += `\n도착편 식사: ${mealArrival}`;
    }
    
    navigator.clipboard.writeText(copyText).then(() => {
        // 복사 성공 알림
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>복사됨!';
        btn.classList.add('bg-green-50', 'border-green-500', 'text-green-700');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-green-50', 'border-green-500', 'text-green-700');
        }, 2000);
    }).catch(err => {
        alert('복사에 실패했습니다.');
        console.error('복사 오류:', err);
    });
}

// 이미지 저장 기능
async function handleImage() {
    const captureArea = document.getElementById('captureArea');
    const imageBtn = document.getElementById('imageBtn');
    const originalText = imageBtn.innerHTML;
    
    try {
        // 버튼 비활성화
        imageBtn.disabled = true;
        imageBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="hidden sm:inline">생성중...</span>';
        
        // html2canvas로 캡처
        const canvas = await html2canvas(captureArea, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // 캔버스를 Blob으로 변환
        canvas.toBlob((blob) => {
            // 다운로드 링크 생성
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            link.download = `flight-schedule-${dateStr}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            // 성공 피드백
            imageBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="hidden sm:inline">저장됨!</span>';
            imageBtn.classList.remove('border-purple-300', 'bg-purple-50', 'hover:bg-purple-100', 'text-purple-700');
            imageBtn.classList.add('border-green-500', 'bg-green-50', 'text-green-700');
            
            setTimeout(() => {
                imageBtn.innerHTML = originalText;
                imageBtn.classList.remove('border-green-500', 'bg-green-50', 'text-green-700');
                imageBtn.classList.add('border-purple-300', 'bg-purple-50', 'hover:bg-purple-100', 'text-purple-700');
                imageBtn.disabled = false;
            }, 2000);
        });
    } catch (error) {
        console.error('이미지 생성 오류:', error);
        alert('이미지 생성에 실패했습니다.');
        imageBtn.innerHTML = originalText;
        imageBtn.disabled = false;
    }
}

// 카카오톡 공유 기능
async function handleKakao() {
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
        alert('카카오톡 공유 기능을 사용하려면 Kakao JavaScript 키를 설정해야 합니다.\n\n설정 방법:\n1. https://developers.kakao.com/ 접속\n2. 앱 생성 후 JavaScript 키 발급\n3. js/main.js 파일의 KAKAO_JS_KEY 변수에 키 입력');
        return;
    }
    
    const captureArea = document.getElementById('captureArea');
    const kakaoBtn = document.getElementById('kakaoBtn');
    const originalText = kakaoBtn.innerHTML;
    
    try {
        // 버튼 비활성화
        kakaoBtn.disabled = true;
        kakaoBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="hidden sm:inline">생성중...</span>';
        
        // html2canvas로 이미지 생성
        const canvas = await html2canvas(captureArea, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // 캔버스를 Blob으로 변환 후 Base64로
        canvas.toBlob(async (blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                
                // 텍스트 정보 가져오기
                const output = document.getElementById('outputText').querySelector('pre').textContent;
                const name = document.getElementById('nameInput').value;
                const phone = document.getElementById('phoneInput').value;
                const meetingPlace = document.getElementById('meetingPlaceInput').value;

                const showMealDeparture = document.getElementById('showMealDeparture').checked;
                const showMealArrival = document.getElementById('showMealArrival').checked;

                const mealDepartureRadio = document.querySelector('input[name="mealDeparture"]:checked');
                const mealArrivalRadio = document.querySelector('input[name="mealArrival"]:checked');
                const mealDeparture = showMealDeparture && mealDepartureRadio ? mealDepartureRadio.value : '';
                const mealArrival = showMealArrival && mealArrivalRadio ? mealArrivalRadio.value : '';

                let description = output.substring(0, 100) + '...';
                if (name) description = `대표: ${name}\n` + description;

                // 카카오톡 메시지 전송 (이미지는 업로드된 URL 필요, 여기서는 텍스트만 전송)
                // 실제 이미지 공유를 위해서는 서버에 이미지를 업로드하고 URL을 받아야 합니다.
                Kakao.Share.sendDefault({
                    objectType: 'text',
                    text: `✈️ 항공편 일정\n\n${output}${name || phone || meetingPlace || mealDeparture || mealArrival ? '\n\n--- 고객 정보 ---' : ''}${name ? '\n대표: ' + name : ''}${phone ? '\n전화번호: ' + phone : ''}${meetingPlace ? '\n미팅 장소: ' + meetingPlace : ''}${mealDeparture ? '\n출발편 식사: ' + mealDeparture : ''}${mealArrival ? '\n도착편 식사: ' + mealArrival : ''}`,
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                });
                
                // 성공 피드백
                kakaoBtn.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/></svg><span class="hidden sm:inline">전송됨!</span>';
                kakaoBtn.classList.remove('bg-yellow-400', 'hover:bg-yellow-500');
                kakaoBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'text-white');
                
                setTimeout(() => {
                    kakaoBtn.innerHTML = originalText;
                    kakaoBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'text-white');
                    kakaoBtn.classList.add('bg-yellow-400', 'hover:bg-yellow-500');
                    kakaoBtn.disabled = false;
                }, 2000);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('카카오톡 공유 오류:', error);
        alert('카카오톡 공유에 실패했습니다.');
        kakaoBtn.innerHTML = originalText;
        kakaoBtn.disabled = false;
    }
}

// PDF 저장 기능
function handlePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const output = document.getElementById('outputText').querySelector('pre').textContent;
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;
    const meetingPlace = document.getElementById('meetingPlaceInput').value;

    const showMealDeparture = document.getElementById('showMealDeparture').checked;
    const showMealArrival = document.getElementById('showMealArrival').checked;

    const mealDepartureRadio = document.querySelector('input[name="mealDeparture"]:checked');
    const mealArrivalRadio = document.querySelector('input[name="mealArrival"]:checked');
    const mealDeparture = showMealDeparture && mealDepartureRadio ? mealDepartureRadio.value : '';
    const mealArrival = showMealArrival && mealArrivalRadio ? mealArrivalRadio.value : '';

    // 제목
    doc.setFontSize(18);
    doc.text('Flight Schedule', 20, 20);

    doc.setFontSize(12);
    let yPos = 40;

    // 항공편 정보
    const lines = output.split('\n');
    lines.forEach(line => {
        // 한글 지원을 위한 처리 (jsPDF는 한글을 직접 지원하지 않음)
        // 영문으로 변환하거나 이미지로 저장하는 방법 필요
        doc.text(line, 20, yPos);
        yPos += 10;
    });

    // 고객 정보
    if (name || phone || meetingPlace || mealDeparture || mealArrival) {
        yPos += 10;
        doc.text('--- Customer Information ---', 20, yPos);
        yPos += 10;
        
        if (name) {
            doc.text(`Name: ${name}`, 20, yPos);
            yPos += 10;
        }
        if (phone) {
            doc.text(`Phone: ${phone}`, 20, yPos);
            yPos += 10;
        }
        if (meetingPlace) {
            doc.text(`Meeting Place: ${meetingPlace}`, 20, yPos);
            yPos += 10;
        }
        if (mealDeparture) {
            doc.text(`Departure Meal: ${mealDeparture}`, 20, yPos);
            yPos += 10;
        }
        if (mealArrival) {
            doc.text(`Arrival Meal: ${mealArrival}`, 20, yPos);
            yPos += 10;
        }
    }
    
    // 날짜 생성
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // PDF 저장
    doc.save(`flight-schedule-${dateStr}.pdf`);
    
    // PDF 저장 성공 알림
    const btn = document.getElementById('pdfBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>저장됨!';
    btn.classList.remove('bg-gray-700', 'hover:bg-gray-800');
    btn.classList.add('bg-green-600', 'hover:bg-green-700');
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
        btn.classList.add('bg-gray-700', 'hover:bg-gray-800');
    }, 2000);
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('convertBtn').addEventListener('click', handleConvert);
    document.getElementById('copyBtn').addEventListener('click', handleCopy);
    document.getElementById('imageBtn').addEventListener('click', handleImage);
    document.getElementById('kakaoBtn').addEventListener('click', handleKakao);
    document.getElementById('pdfBtn').addEventListener('click', handlePDF);

    // 예약번호 체크박스 토글 기능
    document.getElementById('showPnr').addEventListener('change', (e) => {
        const wrapper = document.getElementById('pnrInputWrapper');
        if (e.target.checked) {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
        }
    });

    // 식사 체크박스 토글 기능
    document.getElementById('showMealDeparture').addEventListener('change', (e) => {
        const options = document.getElementById('mealDepartureOptions');
        if (e.target.checked) {
            options.classList.remove('hidden');
        } else {
            options.classList.add('hidden');
        }
    });

    document.getElementById('showMealArrival').addEventListener('change', (e) => {
        const options = document.getElementById('mealArrivalOptions');
        if (e.target.checked) {
            options.classList.remove('hidden');
        } else {
            options.classList.add('hidden');
        }
    });

    // Enter 키로 변환 실행
    document.getElementById('inputText').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleConvert();
        }
    });
});

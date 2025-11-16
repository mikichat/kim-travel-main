# 🤖 Gemini AI 기반 Excel 일정표 분석 프로젝트

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/) 
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/) 
[![SQLite](https://img.shields.io/badge/SQLite-3-blue.svg)](https://www.sqlite.org/index.html)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.5-orange.svg)](https://ai.google.dev/)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [사용 방법](#-사용-방법)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [API 문서](#-api-문서)
- [기술 워크플로우](#-기술-워크플로우)
- [주요 기술 포인트](#-주요-기술-포인트)
- [트러블슈팅](#-트러블슈팅)
- [향후 개발 계획](#-향후-개발-계획)

---

## 🎯 프로젝트 개요

이 프로젝트는 **여행사 관리 시스템**의 일부로, 복잡한 Excel(.xlsx) 형식의 여행 일정표를 AI를 활용하여 자동으로 분석하고 구조화된 데이터로 변환하는 웹 애플리케이션입니다.

### 핵심 가치

- **자동화**: 수작업으로 처리하던 Excel 데이터 입력을 AI가 자동으로 처리
- **정확성**: Google Gemini 2.5 Flash/Pro 모델을 활용한 높은 분석 정확도
- **효율성**: 셀 병합, 복잡한 테이블 구조도 완벽하게 해석
- **확장성**: RESTful API 기반으로 다른 시스템과 쉽게 연동 가능

### 현재 상태

✅ **안정적 운영 중**
- Excel 업로드 및 AI 분석 기능 완료
- 일정 CRUD 작업 완료
- 그룹별 일정 관리 기능 추가
- 캘린더 뷰 및 통계 대시보드 구현
- 데이터베이스 마이그레이션 완료

---

## ✨ 주요 기능

### 1. 📄 Excel 구조 완벽 분석
- `SheetJS` 라이브러리를 사용해 Excel 파일을 **HTML 테이블로 변환**
- 셀 병합(`rowspan`, `colspan`) 정보를 완벽하게 보존
- Gemini API에 HTML 구조를 전달하여 분석 정확도 극대화

### 2. 🤖 동적 AI 모델 선택
- Google API를 직접 호출하여 사용 가능한 최신 **Gemini Flash 모델을 동적으로 조회**
- 모델 업데이트에 유연하게 대응
- Fallback 메커니즘으로 안정성 보장

### 3. ⚙️ 통합 웹 서버
- **Express.js** 백엔드 서버가 프론트엔드와 API를 모두 제공
- 별도의 프론트엔드 서버 없이 `node` 명령어 하나로 전체 실행
- CORS 설정으로 다양한 클라이언트 지원

### 4. 💾 데이터베이스 연동
- **SQLite** 데이터베이스를 사용한 영속적 데이터 관리
- `schedules` 테이블에 구조화된 일정 데이터 저장
- 고객, 상품, 예약, 할 일, 알림 등 통합 관리

### 5. 🎨 사용자 친화적 인터페이스
- 반응형 디자인으로 모바일/태블릿 지원
- 캘린더 뷰로 일정 시각화
- 실시간 통계 대시보드
- 그룹별 일정 필터링

---

## 🛠 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18.x | 서버 런타임 |
| Express.js | 4.19.2 | 웹 프레임워크 |
| SQLite3 | 5.1.7 | 데이터베이스 |
| Multer | 2.0.2 | 파일 업로드 처리 |
| XLSX | 0.18.5 | Excel 파일 파싱 |
| dotenv | 17.2.3 | 환경 변수 관리 |

### AI & ML
| 기술 | 버전 | 용도 |
|------|------|------|
| Google Generative AI | 0.24.1 | Gemini API 클라이언트 |
| Gemini 2.5 Flash/Pro | Latest | 일정 데이터 추출 및 분석 |

### Frontend
| 기술 | 용도 |
|------|------|
| HTML5 | 마크업 |
| CSS3 | 스타일링 |
| Vanilla JavaScript | 클라이언트 로직 |
| Font Awesome | 아이콘 |

### DevOps
| 도구 | 용도 |
|------|------|
| Nodemon | 개발 서버 자동 재시작 |
| Git | 버전 관리 |

---

## 📁 프로젝트 구조

```
project-root/
├── backend/                           # 백엔드 디렉토리
│   ├── server.js                     # Express 서버 메인 파일
│   ├── database.js                   # 데이터베이스 초기화 및 스키마
│   ├── package.json                  # 백엔드 의존성
│   ├── .env                         # 환경 변수 (API 키)
│   ├── travel_agency.db             # SQLite 데이터베이스 파일
│   ├── uploads/                     # 업로드된 파일 임시 저장소
│   ├── add_group_name.js            # group_name 컬럼 추가 스크립트
│   ├── reorder_group_name.js        # 컬럼 순서 재배치 스크립트
│   ├── migrate_schedules.js         # 스키마 마이그레이션 스크립트
│   └── MIGRATION_COMPLETE.md        # 마이그레이션 기록
│
├── css/                              # 스타일시트
│   └── style.css                    # 메인 스타일
│
├── js/                               # 프론트엔드 JavaScript
│   ├── app.js                       # 메인 애플리케이션 로직
│   └── modules/                     # 모듈화된 코드
│       ├── api.js                   # API 호출 함수
│       ├── state.js                 # 전역 상태 관리
│       ├── ui.js                    # UI 렌더링 함수
│       ├── eventHandlers.js         # 이벤트 핸들러
│       ├── modals.js                # 모달 관리
│       └── sampleData.js            # 샘플 데이터 생성
│
├── index.html                        # 메인 대시보드 페이지
├── schedules.html                    # 일정 관리 페이지
├── upload.html                       # Excel 업로드 페이지
├── start.bat                         # Windows 실행 스크립트
└── README.md                         # 프로젝트 문서 (현재 파일)
```

---

## 🚀 설치 및 실행

### 1. 필수 요구사항

- **Node.js** v18 이상 ([다운로드](https://nodejs.org/))
- **npm** (Node.js와 함께 설치됨)
- **Google Gemini API 키** ([발급 받기](https://ai.google.dev/))

### 2. 프로젝트 클론

```bash
git clone https://github.com/kimgukjin1-star/main.git
cd main
```

### 3. API 키 설정

프로젝트 루트의 `backend/` 디렉토리에 `.env` 파일을 생성하고 API 키를 입력합니다.

```env
# backend/.env
GEMINI_API_KEY=여기에_발급받은_API_키를_입력하세요
```

### 4. 의존성 설치

```bash
cd backend
npm install
cd ..
```

### 5. 애플리케이션 실행

#### Windows 사용자 (권장)
```bash
# 루트 디렉토리에서
start.bat
```

#### 수동 실행 (Mac, Linux 포함)
```bash
cd backend
npm start
```

또는 개발 모드로 실행:
```bash
npm run dev  # nodemon 사용 (파일 변경 시 자동 재시작)
```

### 6. 접속

브라우저를 열고 다음 주소로 접속:

- **메인 대시보드**: http://localhost:5000
- **일정 관리**: http://localhost:5000/schedules.html
- **Excel 업로드**: http://localhost:5000/schedule-upload

---

## 📖 사용 방법

### Excel 파일 업로드

1. **메인 대시보드** 또는 **일정 관리 페이지**로 이동
2. **"엑셀 업로드"** 버튼 클릭
3. **그룹명** 입력 (예: "하노이 골프단", "제주 워크샵")
4. Excel 파일(.xlsx) 선택
5. 업로드 완료 대기 (AI가 자동으로 분석)
6. 일정 목록에서 결과 확인

### Excel 파일 형식 요구사항

Gemini AI가 최적으로 분석할 수 있는 Excel 형식:

```
| 일자       | 지역   | 교통편  | 시간  | 일정              | 식사           |
|-----------|--------|---------|-------|-------------------|---------------|
| 2026-01-03| 인천   | OZ729   | 09:10 | 인천공항 출발      | 조:기내식      |
| 2026-01-03| 하노이 | -       | 12:30 | 하노이 도착, 호텔  | 중:현지식      |
```

**주의사항**:
- 날짜는 `YYYY-MM-DD` 형식 권장
- 셀 병합도 인식 가능 (AI가 자동 해석)
- 헤더가 없어도 AI가 컨텍스트로 이해

### 일정 수동 추가

1. **일정 관리 페이지**로 이동
2. 좌측 폼에서 정보 입력:
   - 그룹명 (선택)
   - 일자 (선택)
   - 지역 (선택)
   - 교통편 (선택)
   - 시간 (선택)
   - **일정 (필수)**
   - 식사 (선택)
3. **"저장"** 버튼 클릭

### 일정 수정 및 삭제

- **수정**: 테이블에서 <i class="fas fa-edit"></i> 버튼 클릭 → 폼에서 수정 → 저장
- **삭제**: 테이블에서 <i class="fas fa-trash"></i> 버튼 클릭 → 확인

### 일정 필터링

- **검색창**: 일정, 지역, 교통편, 식사 등으로 검색
- **날짜 필터**: 특정 날짜의 일정만 표시
- **캘린더 클릭**: 날짜를 클릭하여 해당 일정 필터링

---

## 🗄 데이터베이스 스키마

### `schedules` 테이블

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 일정 고유 ID |
| `group_name` | TEXT | NULL 허용 | 그룹명 (예: 하노이 골프단) |
| `event_date` | TEXT | NULL 허용 | 일자 (YYYY-MM-DD) |
| `location` | TEXT | NULL 허용 | 지역/장소 |
| `transport` | TEXT | NULL 허용 | 교통편 정보 |
| `time` | TEXT | NULL 허용 | 시간 정보 |
| `schedule` | TEXT | NULL 허용 | 일정 내용 (필수 권장) |
| `meals` | TEXT | NULL 허용 | 식사 정보 |
| `created_at` | TEXT | DEFAULT (datetime('now','localtime')) | 생성 시각 |

### 기타 테이블

- **`customers`**: 고객 정보 (이름, 여권, 연락처 등)
- **`products`**: 여행 상품 정보
- **`bookings`**: 예약 정보
- **`todos`**: 할 일 관리
- **`notifications`**: 알림 시스템

자세한 스키마는 `backend/database.js` 파일을 참조하세요.

---

## 📡 API 문서

### Schedules API

#### 모든 일정 조회
```http
GET /api/schedules
```

**응답 예시**:
```json
[
  {
    "id": 1,
    "group_name": "하노이 골프단",
    "event_date": "2026-01-03",
    "location": "인천",
    "transport": "OZ729",
    "time": "09:10",
    "schedule": "인천 국제공항 출발",
    "meals": "조:기내식",
    "created_at": "2025-11-16 10:30:00"
  }
]
```

#### 일정 추가
```http
POST /api/schedules
Content-Type: application/json

{
  "group_name": "제주 워크샵",
  "event_date": "2026-02-01",
  "location": "제주",
  "transport": "KE1234",
  "time": "08:00",
  "schedule": "제주 공항 도착",
  "meals": "조:기내식"
}
```

#### 일정 수정
```http
PUT /api/schedules/:id
Content-Type: application/json

{
  "schedule": "제주 공항 도착 후 렌트카 픽업"
}
```

#### 일정 삭제
```http
DELETE /api/schedules/:id
```

#### Excel 업로드 (AI 분석)
```http
POST /api/upload
Content-Type: multipart/form-data

schedule_file: [Excel 파일]
group_name: "하노이 골프단"
```

**응답 예시**:
```json
{
  "success": true,
  "message": "총 10개의 일정 중 10개가 저장되었습니다.",
  "saved": 10,
  "total": 10,
  "group_name": "하노이 골프단"
}
```

---

## 🔄 기술 워크플로우

```
1. 사용자 (schedules.html)
     |
     | 📤 .xlsx 파일 + 그룹명 업로드
     v
2. Express 서버 (backend/server.js)
     |
     | 🔄 [xlsx.utils.sheet_to_html]
     |    Excel → HTML 테이블로 변환
     |    (rowspan, colspan 정보 보존)
     v
3. 동적 모델 선택 (getLatestFlashModel)
     |
     | 📡 Google API 호출하여 최신 Gemini Flash 모델 조회
     |    Fallback: gemini-2.5-flash
     v
4. Gemini API (gemini-2.5-flash)
     |
     | 💬 HTML 테이블 + 프롬프트 전송
     |    "이 HTML 구조를 분석해서 JSON으로 변환해줘"
     v
5. Gemini API 응답
     |
     | 📄 구조화된 JSON 데이터 반환
     |    [
     |      {
     |        "event_date": "2026-01-03",
     |        "location": "인천",
     |        "transport": "OZ729",
     |        "time": "09:10",
     |        "schedule": "인천 국제공항 출발",
     |        "meals": "조:기내식"
     |      },
     |      ...
     |    ]
     v
6. Express 서버
     |
     | 💾 [SQLite]
     |    JSON → DB 'schedules' 테이블에 저장
     |    group_name 포함
     v
7. 사용자
     |
     | ✅ 처리 완료 메시지 표시
     | 📊 일정 목록 및 캘린더 뷰 업데이트
```

---

## 🔑 주요 기술 포인트

### 1. Excel to HTML 변환의 장점

**CSV 방식의 한계**:
```csv
일자,지역,교통편,시간,일정,식사
2026-01-03,인천,OZ729,09:10,출발,조:기내식
```
- 셀 병합 정보 손실
- 구조적 문맥 없음
- 여러 행에 걸친 일정 표현 불가

**HTML 방식의 우수성**:
```html
<table>
  <tr>
    <td rowspan="2">2026-01-03</td>
    <td>인천</td>
    <td>OZ729</td>
    <td>09:10</td>
    <td>인천공항 출발</td>
    <td>조:기내식</td>
  </tr>
  <tr>
    <td>하노이</td>
    <td>-</td>
    <td>12:30</td>
    <td>하노이 도착, 호텔 체크인</td>
    <td>중:현지식</td>
  </tr>
</table>
```
- `rowspan`, `colspan` 정보 보존
- 구조적 문맥 유지
- Gemini가 HTML 태그 완벽 이해

### 2. 동적 모델 선택의 안정성

```javascript
async function getLatestFlashModel(apiKey) {
    try {
        // Google API에서 사용 가능한 모델 목록 조회
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        const data = await response.json();
        
        // Flash 모델만 필터링하고 최신 버전 선택
        const flashModels = data.models
            .map(m => m.name.replace('models/', ''))
            .filter(name => /gemini-\d+(\.\d+)?-flash/.test(name))
            .sort()
            .reverse();
        
        return flashModels[0] || 'gemini-2.5-flash'; // Fallback
    } catch (error) {
        return 'gemini-2.5-flash'; // 안전한 기본값
    }
}
```

**장점**:
- 모델 이름 하드코딩 불필요
- 새 모델 출시 시 자동 업데이트
- API 호출 실패 시에도 안정적 동작

### 3. 프롬프트 엔지니어링

```javascript
const prompt = `
다음은 HTML <table> 형식의 여행 일정표 데이터입니다.
이 HTML 구조(특히 colspan과 rowspan으로 병합된 셀)를 주의 깊게 분석해서,
각 일정 항목을 다음 키를 가진 JSON 배열로 만들어주세요:

{
    "event_date": "YYYY-MM-DD 형식의 날짜",
    "location": "지역/장소",
    "transport": "교통편 (예: OZ123편, 전용차량 등)",
    "time": "시간 (예: 09:00, 09:00-18:00 등)",
    "schedule": "세부 일정 내용",
    "meals": "식사 정보 (예: 조:호텔식, 중:현지식, 석:한식)"
}

중요한 규칙:
- 날짜는 반드시 'YYYY-MM-DD' 형식으로 통일해 주세요.
- 병합된 셀은 각 행마다 개별 항목으로 나누어 주세요.
- 일정 내용에서 시간, 교통편, 식사 정보를 추출해서 해당 필드에 넣어주세요.
- JSON 배열만 반환하고, \`\`\`json 같은 마크다운은 절대 추가하지 마세요.
- 모든 필드는 문자열(string) 타입이어야 합니다.

[HTML 데이터]
${htmlData}
`;
```

**핵심 요소**:
- 명확한 출력 형식 지정
- 구조적 규칙 명시
- 예시 제공
- Markdown 방지 지시

---

## 🔧 트러블슈팅

### 1. "데이터베이스가 초기화되지 않았습니다" 오류

**원인**: SQLite 데이터베이스 파일이 손상되었거나 접근 권한 문제

**해결**:
```bash
cd backend
rm travel_agency.db  # 기존 DB 삭제
npm start           # 서버 재시작 (자동으로 DB 재생성)
```

### 2. "Gemini API 응답이 없습니다" 오류

**원인**: API 키가 올바르지 않거나 요청이 차단됨

**해결**:
1. `.env` 파일의 API 키 확인
2. [Google AI Studio](https://ai.google.dev/)에서 API 키 재발급
3. 요청 횟수 제한 확인 (무료 플랜: 60 RPM)

### 3. Excel 업로드 시 "파일 형식 오류"

**원인**: `.xls` (구버전) 파일 사용 또는 파일 손상

**해결**:
- Excel에서 파일을 `.xlsx` 형식으로 다시 저장
- Google Sheets에서 `.xlsx`로 다운로드

### 4. "Cannot find module 'xlsx'" 오류

**원인**: 의존성 패키지가 설치되지 않음

**해결**:
```bash
cd backend
npm install
```

### 5. 포트 5000이 이미 사용 중

**원인**: 다른 프로세스가 5000 포트를 사용 중

**해결**:
```javascript
// backend/server.js 수정
const port = 5001; // 또는 다른 포트 번호
```

---

## 🚧 향후 개발 계획

### v1.1 (진행 중)
- [x] 그룹별 일정 필터링
- [x] 캘린더 뷰 개선
- [ ] Excel 내보내기 기능
- [ ] 일정 템플릿 저장

### v1.2 (계획)
- [ ] 다중 파일 동시 업로드
- [ ] PDF 형식 지원
- [ ] 일정 공유 기능 (링크 생성)
- [ ] 모바일 앱 개발 (React Native)

### v2.0 (장기)
- [ ] 사용자 인증 시스템
- [ ] 실시간 협업 기능
- [ ] 다국어 지원 (영어, 중국어, 일본어)
- [ ] 클라우드 배포 (AWS/Azure)

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 👥 기여자

- **kimgukjin1-star** - 초기 개발 및 유지보수

---

## 📞 문의 및 지원

- **Issues**: [GitHub Issues](https://github.com/kimgukjin1-star/main/issues)
- **Pull Requests**: 환영합니다!
- **Email**: (이메일 주소를 입력하세요)

---

## 🙏 감사의 말

- **Google Gemini Team** - 강력한 AI 모델 제공
- **SheetJS** - 뛰어난 Excel 파싱 라이브러리
- **Express.js Community** - 안정적인 웹 프레임워크

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 스타를 눌러주세요! ⭐**

Made with ❤️ by kimgukjin1-star

</div>
# 🤖 Gemini AI 기반 Excel 일정표 분석 프로젝트

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/) [![SQLite](https://img.shields.io/badge/SQLite-3-blue.svg)](https://www.sqlite.org/index.html)

이 프로젝트는 복잡한 Excel(.xlsx) 여행 일정표를 AI를 통해 자동으로 분석하고, 구조화된 데이터로 변환하여 데이터베이스에 저장하는 웹 애플리케이션입니다. Google의 최신 언어 모델인 **Gemini 2.5 Flash/Pro**를 활용하여, 셀 병합과 같은 복잡한 구조를 가진 표도 정확하게 해석합니다.

<br>

## ✨ 주요 기능

*   **📄 Excel 구조 완벽 분석**: `SheetJS` 라이브러리를 사용해 Excel 파일을 **HTML 테이블로 변환**합니다. 이를 통해 셀 병합(`rowspan`, `colspan`) 정보를 완벽하게 보존하여 Gemini API에 전달, 분석 정확도를 극대화합니다.
*   **🤖 동적 AI 모델 선택**: Google API를 직접 호출하여 사용 가능한 최신 **Gemini Flash 모델을 동적으로 조회**하고 적용합니다. 이를 통해 모델 업데이트에 유연하게 대응하고 항상 최상의 성능을 유지합니다.
*   **⚙️ 통합 웹 서버**: **Express.js** 백엔드 서버가 프론트엔드(HTML, CSS, JS) 정적 파일과 API를 모두 제공합니다. 별도의 프론트엔드 서버 없이 `node` 명령어 하나로 전체 애플리케이션을 실행할 수 있습니다.
*   **💾 데이터베이스 연동**: 분석된 일정 데이터는 **SQLite** 데이터베이스의 `schedules` 테이블에 저장되어 영속적으로 관리됩니다.
*   **🚀 간편한 실행**: Windows 사용자는 `start.bat` 스크립트를 실행하는 것만으로 의존성 설치부터 서버 실행까지 한 번에 처리할 수 있습니다.

<br>

## 🚀 시작하기

### 1. 필수 요구사항
*   **Node.js** (v18 이상 권장) 및 **npm**

### 2. 설치 및 설정

1.  **프로젝트 클론**
    ```bash
    git clone https://github.com/kimgukjin1-star/main.git
    cd main
    ```

2.  **API 키 설정**
    프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, 발급받은 Google Gemini API 키를 입력합니다.
    ```env
    # .env
    GEMINI_API_KEY=여기에_발급받은_API_키를_입력하세요
    ```

### 3. 애플리케이션 실행

#### 윈도우 사용자 (권장)
프로젝트 루트 디렉토리에서 `start.bat` 파일을 더블클릭하여 실행하세요. 모든 과정이 자동으로 처리됩니다.

#### 수동 실행 (Mac, Linux 포함)
1.  **백엔드 의존성 설치**
    ```bash
    cd backend
    npm install
    cd ..
    ```
2.  **서버 시작**
    ```bash
    node backend/server.js
    ```

### 4. 접속
서버가 시작되면 웹 브라우저를 열고 다음 주소로 접속하세요.
*   **🔗 http://localhost:5000**

<br>

## 🛠️ 기술 워크플로우

```
1. 사용자
 (upload.html)
     |
     | 📤 .xlsx 파일 업로드
     v
2. Express 서버
 (backend/server.js)
     |
     | 🔄 [xlsx.utils.sheet_to_html]
     |    Excel -> HTML 테이블로 변환
     v
3. Gemini API
 (gemini-2.5-flash)
     |
     | 💬 "이 HTML 테이블 분석해줘"
     |    (텍스트 프롬프트 전송)
     v
4. Gemini API 응답
     |
     | 📄 구조화된 JSON 데이터 반환
     |    (e.g., [{event_name: '...'}, ...])
     v
5. Express 서버
     |
     | 💾 [SQLite]
     |    JSON -> DB 'schedules' 테이블에 저장
     v
6. 사용자
     |
     | ✅ 처리 완료 메시지 표시
     +--------------------------------+
```

<br>

## 🤖 주요 기술 포인트

### Excel to HTML 변환의 장점
단순히 텍스트만 추출하는 CSV 변환 방식과 달리, HTML 변환은 **셀의 구조적 문맥**을 보존합니다. Gemini는 `<table>`, `<tr>`, `<td>`, `colspan`, `rowspan` 등의 태그를 완벽하게 이해하므로, 여러 날에 걸친 일정이나 복잡하게 병합된 셀도 정확하게 해석할 수 있습니다.

### 동적 모델 선택의 안정성
`getLatestFlashModel` 함수는 하드코딩된 모델 이름 대신, Google의 `models` API를 직접 조회하여 **가장 최신 버전의 Flash 모델**을 찾아냅니다. 만약 API 호출에 실패하더라도, 안정적인 기본 모델(Fallback)을 사용하도록 설계되어 장애 발생 가능성을 최소화합니다.

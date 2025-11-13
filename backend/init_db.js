// Gemini가 생성한 주석: 이 스크립트는 'schedule.db' SQLite 데이터베이스 파일과 'schedules' 테이블을 초기화합니다.
const sqlite3 = require('sqlite3').verbose();

// 'schedule.db' 데이터베이스에 연결합니다. 파일이 없으면 새로 생성됩니다.
const db = new sqlite3.Database('./schedule.db', (err) => {
    if (err) {
        console.error('데이터베이스 연결 오류:', err.message);
    } else {
        console.log('schedule.db 데이터베이스에 연결되었습니다.');
    }
});

// 데이터베이스 직렬 처리를 통해 순차적 실행을 보장합니다.
db.serialize(() => {
    // 'schedules' 테이블이 존재하지 않으면 새로 생성합니다.
    // id: 기본 키, 자동 증가
    // event_name: 일정명 (NULL 불가)
    // event_date: 날짜 (텍스트)
    // location: 장소 (텍스트)
    // description: 설명 (텍스트)
    db.run(`CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_date TEXT,
        location TEXT,
        description TEXT
    )`, (err) => {
        if (err) {
            console.error('테이블 생성 오류:', err.message);
        } else {
            console.log("'schedules' 테이블이 성공적으로 생성되었거나 이미 존재합니다.");
        }
    });
});

// 데이터베이스 연결을 닫습니다.
db.close((err) => {
    if (err) {
        console.error('데이터베이스 연결 종료 오류:', err.message);
    } else {
        console.log('데이터베이스 연결이 닫혔습니다.');
    }
});

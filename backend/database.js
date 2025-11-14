// backend/database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// 데이터베이스 파일 경로
const DB_FILE = __dirname + '/travel_agency.db';

async function initializeDatabase() {
    try {
        const db = await open({
            filename: DB_FILE,
            driver: sqlite3.Database
        });

        console.log('데이터베이스에 성공적으로 연결되었습니다.');

        // 테이블 생성 (IF NOT EXISTS 사용으로 중복 생성 방지)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name_kor TEXT NOT NULL,
                name_eng TEXT NOT NULL,
                passport_number TEXT NOT NULL UNIQUE,
                birth_date TEXT NOT NULL,
                passport_expiry TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                address TEXT,
                travel_history TEXT,
                notes TEXT,
                passport_file_name TEXT,
                passport_file_data TEXT, -- Base64 인코딩된 데이터 저장
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                destination TEXT NOT NULL,
                duration INTEGER NOT NULL,
                price INTEGER NOT NULL,
                status TEXT NOT NULL,
                description TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );

            CREATE TABLE IF NOT EXISTS bookings (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                product_id TEXT NOT NULL,
                product_name TEXT NOT NULL,
                departure_date TEXT,
                return_date TEXT,
                participants INTEGER,
                total_price INTEGER,
                hotel_name TEXT,
                flight_number TEXT,
                status TEXT,
                notes TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                booking_id TEXT,
                customer_name TEXT,
                product_name TEXT,
                departure_date TEXT,
                days_before INTEGER,
                notification_type TEXT,
                message TEXT,
                is_read INTEGER DEFAULT 0,
                priority TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                due_date TEXT,
                priority TEXT,
                description TEXT,
                is_completed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );

            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_name TEXT,
                event_date TEXT,
                location TEXT,
                transport TEXT,
                time TEXT,
                schedule TEXT,
                meals TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
        `);

        console.log('모든 테이블이 성공적으로 준비되었습니다.');

        return db;
    } catch (error) {
        console.error('데이터베이스 초기화 중 오류 발생:', error);
        process.exit(1); // 오류 발생 시 프로세스 종료
    }
}

module.exports = { initializeDatabase };

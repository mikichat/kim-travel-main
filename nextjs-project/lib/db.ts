// nextjs-project/lib/db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// 데이터베이스 연결을 저장할 변수 (싱글톤)
let db: Database | null = null;

export async function getDb() {
  if (db) {
    return db;
  }

  // 데이터베이스 파일 경로 설정 (프로젝트 루트 기준)
  const DB_FILE = path.join(process.cwd(), 'travel_agency.db');

  try {
    const newDb = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    console.log('데이터베이스에 성공적으로 연결되었습니다.');

    // 테이블 생성 (최초 연결 시 한 번만 실행)
    await newDb.exec(`
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
            passport_file_data TEXT,
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
    `);

    console.log('모든 테이블이 성공적으로 준비되었습니다.');

    db = newDb;
    return db;
  } catch (error) {
    console.error('데이터베이스 연결 중 오류 발생:', error);
    throw new Error('데이터베이스에 연결할 수 없습니다.');
  }
}

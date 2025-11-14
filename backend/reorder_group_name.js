// group_name 컬럼을 id와 event_date 사이로 이동
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./travel_agency.db');

console.log('=== group_name 컬럼 재배치 시작 ===\n');

db.serialize(() => {
    // 1. 기존 데이터 조회
    console.log('1. 기존 데이터 백업 중...');
    db.all('SELECT * FROM schedules', [], (err, rows) => {
        if (err) {
            console.error('데이터 조회 실패:', err);
            db.close();
            return;
        }

        console.log(`   총 ${rows.length}개의 데이터를 백업했습니다.\n`);

        // 2. 임시 테이블로 이동
        console.log('2. 기존 테이블을 임시 테이블로 이동 중...');
        db.run('ALTER TABLE schedules RENAME TO schedules_temp', (err) => {
            if (err) {
                console.error('테이블 이름 변경 실패:', err);
                db.close();
                return;
            }

            console.log('   ✅ 임시 테이블 생성 완료\n');

            // 3. 새 테이블 생성 (올바른 컬럼 순서)
            console.log('3. 새로운 스키마로 테이블 재생성 중...');
            db.run(`
                CREATE TABLE schedules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    group_name TEXT,
                    event_date TEXT,
                    location TEXT,
                    transport TEXT,
                    time TEXT,
                    schedule TEXT,
                    meals TEXT,
                    created_at TEXT DEFAULT (datetime('now','localtime'))
                )
            `, (err) => {
                if (err) {
                    console.error('테이블 생성 실패:', err);
                    db.close();
                    return;
                }

                console.log('   ✅ 새 테이블 생성 완료\n');

                // 4. 데이터 복사
                console.log('4. 데이터 복사 중...');
                db.run(`
                    INSERT INTO schedules (id, group_name, event_date, location, transport, time, schedule, meals, created_at)
                    SELECT id, group_name, event_date, location, transport, time, schedule, meals, created_at
                    FROM schedules_temp
                `, (err) => {
                    if (err) {
                        console.error('데이터 복사 실패:', err);
                        db.close();
                        return;
                    }

                    console.log('   ✅ 데이터 복사 완료\n');

                    // 5. 임시 테이블 삭제
                    console.log('5. 임시 테이블 삭제 중...');
                    db.run('DROP TABLE schedules_temp', (err) => {
                        if (err) {
                            console.error('임시 테이블 삭제 실패:', err);
                            db.close();
                            return;
                        }

                        console.log('   ✅ 임시 테이블 삭제 완료\n');

                        // 6. 검증
                        console.log('6. 최종 검증 중...');
                        db.get('SELECT COUNT(*) as count FROM schedules', (err, result) => {
                            if (err) {
                                console.error('검증 실패:', err);
                                db.close();
                                return;
                            }

                            console.log(`   새 테이블: ${result.count}개`);
                            console.log(`   원본 데이터: ${rows.length}개`);

                            if (result.count === rows.length) {
                                console.log('   ✅ 검증 성공!\n');

                                // 스키마 확인
                                db.all("PRAGMA table_info(schedules)", [], (err, schema) => {
                                    if (err) {
                                        console.error('스키마 조회 실패:', err);
                                        db.close();
                                        return;
                                    }

                                    console.log('7. 최종 테이블 스키마:');
                                    schema.forEach(col => {
                                        console.log(`   ${col.cid}. ${col.name} (${col.type})`);
                                    });

                                    console.log('\n=== group_name 컬럼 재배치 완료 ===');
                                    db.close();
                                });
                            } else {
                                console.log('   ⚠️ 데이터 개수 불일치!');
                                db.close();
                            }
                        });
                    });
                });
            });
        });
    });
});

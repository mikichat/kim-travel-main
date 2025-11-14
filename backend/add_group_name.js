// 데이터베이스에 group_name 컬럼 추가
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./travel_agency.db');

console.log('=== group_name 컬럼 추가 시작 ===\n');

db.serialize(() => {
    // 1. 컬럼 존재 여부 확인
    db.all("PRAGMA table_info(schedules)", [], (err, rows) => {
        if (err) {
            console.error('테이블 정보 조회 실패:', err);
            db.close();
            return;
        }

        const hasGroupName = rows.some(row => row.name === 'group_name');

        if (hasGroupName) {
            console.log('✅ group_name 컬럼이 이미 존재합니다.');
            db.close();
            return;
        }

        // 2. group_name 컬럼 추가
        console.log('1. group_name 컬럼 추가 중...');
        db.run(`ALTER TABLE schedules ADD COLUMN group_name TEXT`, (err) => {
            if (err) {
                console.error('컬럼 추가 실패:', err);
                db.close();
                return;
            }

            console.log('   ✅ group_name 컬럼 추가 완료\n');

            // 3. 검증
            db.all("PRAGMA table_info(schedules)", [], (err, rows) => {
                if (err) {
                    console.error('검증 실패:', err);
                    db.close();
                    return;
                }

                console.log('2. 현재 schedules 테이블 스키마:');
                rows.forEach(row => {
                    console.log(`   ${row.cid}. ${row.name} (${row.type})`);
                });

                console.log('\n=== group_name 컬럼 추가 완료 ===');
                db.close();
            });
        });
    });
});

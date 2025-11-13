const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { initializeDatabase } = require('./database');

const app = express();
const port = 5000;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json({ limit: '10mb' })); // JSON 요청 본문 파싱 (용량 제한 10MB)

// 데이터베이스 초기화 및 서버 시작
initializeDatabase().then(db => {
    console.log('API 서버가 데이터베이스와 연결되었습니다.');

    // 모든 테이블에 대한 RESTful API 엔드포인트

    // 1. 전체 데이터 조회 (GET /tables/:tableName)
    app.get('/tables/:tableName', async (req, res) => {
        const { tableName } = req.params;
        const { limit = 100, sort = 'created_at', order = 'desc' } = req.query;
        try {
            const items = await db.all(`SELECT * FROM ${tableName} ORDER BY ${sort} ${order} LIMIT ?`, [limit]);
            res.json({ data: items });
        } catch (error) {
            res.status(500).json({ error: `[${tableName}] 데이터 조회 실패: ${error.message}` });
        }
    });

    // 2. 단일 데이터 조회 (GET /tables/:tableName/:id)
    app.get('/tables/:tableName/:id', async (req, res) => {
        const { tableName, id } = req.params;
        try {
            const item = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
            if (item) {
                res.json(item);
            } else {
                res.status(404).json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` });
            }
        } catch (error) {
            res.status(500).json({ error: `[${tableName}] 데이터 조회 실패: ${error.message}` });
        }
    });

    // 3. 데이터 생성 (POST /tables/:tableName)
    app.post('/tables/:tableName', async (req, res) => {
        const { tableName } = req.params;
        const data = req.body;
        data.id = crypto.randomUUID(); // 고유 ID 생성
        data.created_at = new Date().toISOString();

        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);

        try {
            await db.run(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`, values);
            res.status(201).json(data);
        } catch (error) {
            res.status(500).json({ error: `[${tableName}] 데이터 생성 실패: ${error.message}` });
        }
    });

    // 4. 데이터 전체 수정 (PUT /tables/:tableName/:id)
    app.put('/tables/:tableName/:id', async (req, res) => {
        const { tableName, id } = req.params;
        const data = req.body;
        
        // id, created_at 필드는 업데이트에서 제외
        delete data.id;
        delete data.created_at;

        const columns = Object.keys(data).map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(data), id];

        try {
            const result = await db.run(`UPDATE ${tableName} SET ${columns} WHERE id = ?`, values);
            if (result.changes === 0) {
                return res.status(404).json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` });
            }
            res.json({ message: `[${tableName}] ID ${id}가 성공적으로 업데이트되었습니다.` });
        } catch (error) {
            res.status(500).json({ error: `[${tableName}] 데이터 업데이트 실패: ${error.message}` });
        }
    });
    
    // 5. 데이터 부분 수정 (PATCH /tables/:tableName/:id)
    app.patch('/tables/:tableName/:id', async (req, res) => {
        const { tableName, id } = req.params;
        const data = req.body;

        const columns = Object.keys(data).map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(data), id];

        try {
            const result = await db.run(`UPDATE ${tableName} SET ${columns} WHERE id = ?`, values);
            if (result.changes === 0) {
                return res.status(404).json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` });
            }
            res.json({ message: `[${tableName}] ID ${id}가 성공적으로 패치되었습니다.` });
        } catch (error) {
            res.status(500).json({ error: `[${tableName}] 데이터 패치 실패: ${error.message}` });
        }
    });

    // 6. 데이터 삭제 (DELETE /tables/:tableName/:id)
    app.delete('/tables/:tableName/:id', async (req, res) => {
        const { tableName, id } = req.params;
        try {
            const result = await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
            if (result.changes === 0) {
                return res.status(404).json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` });
            }
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: `[${tableName}] 데이터 삭제 실패: ${error.message}` });
        }
    });

    // 서버 시작
    app.listen(port, () => {
        console.log(`백엔드 서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });

}).catch(error => {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1);
});
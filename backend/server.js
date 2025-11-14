const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { initializeDatabase } = require('./database');

// Gemini가 추가한 모듈
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const xlsx = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = 5000;

// --- Gemini가 추가한 설정 시작 ---

// .env 파일에서 API 키 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 파일 업로드를 위한 uploads 폴더 생성
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer 설정: 업로드된 파일을 'uploads/' 디렉토리에 저장
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Gemini가 추가한 설정 종료 ---

// --- Gemini가 추가한 동적 모델 선택 기능 ---

/**
 * 사용 가능한 최신 Gemini Flash 모델 이름을 가져옵니다.
 * @param {string} apiKey - Google AI API 키
 * @returns {Promise<string>} 최신 모델 이름 (예: "gemini-1.5-flash")
 * @throws {Error} 모델 목록을 가져오거나 적합한 모델을 찾지 못한 경우
 */
async function getLatestFlashModel(apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google AI 모델 목록 API 호출 실패: ${response.statusText}`);
        }
        const data = await response.json();

        const flashModels = data.models
            .map(m => m.name.replace('models/', ''))
            .filter(name => /gemini-\d+(\.\d+)?-flash/.test(name))
            .sort()
            .reverse();

        if (flashModels.length > 0) {
            console.log(`최신 Flash 모델 선택: ${flashModels[0]}`);
            return flashModels[0];
        } else {
            throw new Error("사용 가능한 Gemini Flash 모델을 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("최신 모델을 가져오는 중 오류 발생:", error);
        // 안정적인 기본 모델로 대체
        const fallbackModel = "gemini-2.5-flash";
        console.warn(`기본 모델(${fallbackModel})을 사용합니다.`);
        return fallbackModel;
    }
}

// --- 동적 모델 선택 기능 종료 ---


// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json({ limit: '10mb' })); // JSON 요청 본문 파싱 (용량 제한 10MB)

// --- 프론트엔드 통합: 정적 파일 제공 ---
// 프로젝트 루트 디렉토리를 정적 파일 경로로 설정
const publicPath = path.join(__dirname, '..');
app.use(express.static(publicPath));

// 기본 경로 접속 시 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});
// --- 프론트엔드 통합 종료 ---


// --- Gemini가 추가한 API 엔드포인트 시작 ---

// POST /api/upload: Excel 파일을 받아 처리하는 메인 로직
app.post('/api/upload', upload.single('schedule_file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('파일이 업로드되지 않았습니다.');
    }

    const filePath = req.file.path;

    try {
        // 1. XLSX 파일을 읽어 'HTML' 텍스트로 변환 (info.txt 방식 적용)
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // 첫 번째 시트
        const worksheet = workbook.Sheets[sheetName];
        const htmlData = xlsx.utils.sheet_to_html(worksheet, { header: '' });

        // 2. Gemini 모델 및 프롬프트 설정 (동적으로 최신 모델 선택)
        const modelName = await getLatestFlashModel(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `
            다음은 HTML <table> 형식의 일정표 데이터입니다.
            이 HTML 구조(특히 colspan과 rowspan으로 병합된 셀)를 주의 깊게 분석해서,
            각 일정 항목을 'event_name', 'event_date', 'location', 'description' 키를 가진 JSON 배열로 만들어주세요.

            - 날짜는 'YYYY-MM-DD' 형식으로 통일해 주세요.
            - 병합된 셀에 걸쳐 있는 일정은 날짜별로 개별 항목으로 나누거나, 시작일과 종료일을 명시해 주세요.
            - JSON 데이터 외에 다른 설명(예: \`\`\`json)은 절대 추가하지 마세요.

            [HTML 데이터]
            ${htmlData}
        `;

        // 3. Gemini API 호출 (텍스트 프롬프트 전송)
        const result = await model.generateContent(prompt);
        const response = result.response;

        if (!response) {
            console.error("Gemini API 응답이 없습니다. 전체 결과:", result);
            if (result.promptFeedback) {
                console.error("프롬프트 피드백:", result.promptFeedback);
                return res.status(400).send(`데이터 생성에 실패했습니다. API 차단 사유: ${result.promptFeedback.blockReason}`);
            }
            return res.status(500).send('Gemini API에서 유효한 응답을 받지 못했습니다.');
        }
        
        // 4. Gemini 응답(JSON) 파싱
        const responseText = response.text();
        const jsonString = responseText.replace(/```json|```/g, '').trim();
        
        let scheduleData;
        try {
            scheduleData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Gemini가 반환한 텍스트가 유효한 JSON이 아닙니다:", jsonString);
            return res.status(500).send('데이터 형식 변환에 실패했습니다. Gemini가 반환한 내용을 확인하세요.');
        }

        // 5. SQLite3에 데이터 저장
        const db = new sqlite3.Database('./travel_agency.db');
        let saved_count = 0;
        
        const stmt = db.prepare("INSERT INTO schedules (event_name, event_date, location, description) VALUES (?, ?, ?, ?)");

        for (const item of scheduleData) {
            stmt.run(
                item.event_name,
                item.event_date,
                item.location,
                item.description,
                (err) => {
                    if (!err) saved_count++;
                }
            );
        }

        stmt.finalize((err) => {
            db.close();
            if (err) {
                return res.status(500).send('데이터베이스 저장 중 오류가 발생했습니다.');
            }
            res.send(`성공: 총 ${scheduleData.length}개의 일정 중 ${saved_count}개가 DB에 저장되었습니다.`);
        });

    } catch (error) {
        console.error("업로드 처리 중 오류 발생:", error);
        if (error instanceof SyntaxError) {
            console.error("Gemini가 유효한 JSON을 반환하지 않았습니다. 응답 텍스트:", error.message);
        }
        res.status(500).send('서버 내부 오류가 발생했습니다.');
    } finally {
        // 업로드된 파일 삭제
        fs.unlinkSync(filePath);
    }
});

// --- Gemini가 추가한 API 엔드포인트 종료 ---


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

    // === 일정 관리 전용 API 엔드포인트 ===

    // 모든 일정 조회
    app.get('/api/schedules', async (req, res) => {
        try {
            const schedules = await db.all('SELECT * FROM schedules ORDER BY event_date DESC, id DESC');
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ error: `일정 조회 실패: ${error.message}` });
        }
    });

    // 특정 일정 조회
    app.get('/api/schedules/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const schedule = await db.get('SELECT * FROM schedules WHERE id = ?', [id]);
            if (schedule) {
                res.json(schedule);
            } else {
                res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
            }
        } catch (error) {
            res.status(500).json({ error: `일정 조회 실패: ${error.message}` });
        }
    });

    // 새 일정 추가
    app.post('/api/schedules', async (req, res) => {
        const { group_name, event_date, location, transport, time, schedule, meals } = req.body;

        if (!schedule) {
            return res.status(400).json({ error: '일정은 필수입니다.' });
        }

        try {
            const result = await db.run(
                'INSERT INTO schedules (group_name, event_date, location, transport, time, schedule, meals) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    group_name || null,
                    event_date || null,
                    location || null,
                    transport || null,
                    time || null,
                    schedule,
                    meals || null
                ]
            );

            const newSchedule = await db.get('SELECT * FROM schedules WHERE id = ?', [result.lastID]);
            res.status(201).json(newSchedule);
        } catch (error) {
            res.status(500).json({ error: `일정 추가 실패: ${error.message}` });
        }
    });

    // 일정 수정
    app.put('/api/schedules/:id', async (req, res) => {
        const { id } = req.params;
        const { group_name, event_date, location, transport, time, schedule, meals } = req.body;

        if (!schedule) {
            return res.status(400).json({ error: '일정은 필수입니다.' });
        }

        try {
            const result = await db.run(
                'UPDATE schedules SET group_name = ?, event_date = ?, location = ?, transport = ?, time = ?, schedule = ?, meals = ? WHERE id = ?',
                [
                    group_name || null,
                    event_date || null,
                    location || null,
                    transport || null,
                    time || null,
                    schedule,
                    meals || null,
                    id
                ]
            );

            if (result.changes === 0) {
                return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
            }

            const updatedSchedule = await db.get('SELECT * FROM schedules WHERE id = ?', [id]);
            res.json(updatedSchedule);
        } catch (error) {
            res.status(500).json({ error: `일정 수정 실패: ${error.message}` });
        }
    });

    // 일정 삭제
    app.delete('/api/schedules/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.run('DELETE FROM schedules WHERE id = ?', [id]);
            if (result.changes === 0) {
                return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: `일정 삭제 실패: ${error.message}` });
        }
    });

    // 날짜별 일정 조회
    app.get('/api/schedules/date/:date', async (req, res) => {
        const { date } = req.params;
        try {
            const schedules = await db.all('SELECT * FROM schedules WHERE event_date = ? ORDER BY id DESC', [date]);
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ error: `일정 조회 실패: ${error.message}` });
        }
    });

    // 서버 시작
    app.listen(port, () => {
        console.log(`백엔드 서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });

    // Gemini가 추가한 라우트: /schedule-upload 접속 시 upload.html 제공
    app.get('/schedule-upload', (req, res) => {
        res.sendFile(path.join(__dirname, '../upload.html'));
    });

}).catch(error => {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1);
});
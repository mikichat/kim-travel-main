@echo off
chcp 65001
title 여행사 관리 시스템 시작

echo =================================================
echo  여행사 관리 시스템 시작 스크립트
echo =================================================
echo.
echo  이 스크립트를 실행하려면 Node.js와 npm이 설치되어 있어야 합니다.
echo.

REM --- 백엔드 설정 ---
echo [1/3] 백엔드 종속성을 설치합니다...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [오류] 백엔드 패키지 설치에 실패했습니다. npm이 올바르게 설치되었는지 확인하세요.
    pause
    exit /b
)
echo 백엔드 종속성 설치 완료.
echo.

echo [2/3] 백엔드 서버를 시작합니다...
start "Backend Server" npm start
echo 백엔드 서버가 새 창에서 시작됩니다 (http://localhost:5000).
echo.

REM --- 프론트엔드 설정 ---
cd ..
echo [3/3] 프론트엔드 서버를 시작합니다...
echo 'serve' 패키지가 없는 경우 npx가 자동으로 설치 여부를 물어봅니다. 'y'를 입력해주세요.
start "Frontend Server" npx serve .
echo 프론트엔드 서버가 새 창에서 시작됩니다.
echo 주소는 새로 열린 창에 표시됩니다 (보통 http://localhost:3000).
echo.

echo =================================================
echo  모든 프로세스가 시작되었습니다.
echo =================================================
echo.
echo - 백엔드 서버 주소: http://localhost:5000
echo - 프론트엔드 서버 주소: http://localhost:3000 (또는 새로 열린 창에 표시된 주소)
echo.
echo   종료하려면 새로 열린 'Backend Server'와 'Frontend Server' 창을 닫으세요.
echo.

pause

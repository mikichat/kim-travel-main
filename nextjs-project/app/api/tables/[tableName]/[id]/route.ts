// app/api/tables/[tableName]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const allowedTables = ['customers', 'products', 'bookings', 'todos', 'notifications'];

// GET: 단일 데이터 조회
export async function GET(request: NextRequest, { params }: { params: { tableName: string, id: string } }) {
  const { tableName, id } = params;

  if (!allowedTables.includes(tableName)) {
    return NextResponse.json({ error: `Table '${tableName}' is not accessible.` }, { status: 400 });
  }

  try {
    const db = await getDb();
    const item = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    if (item) {
      return NextResponse.json(item);
    }
    return NextResponse.json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: `[${tableName}] 데이터 조회 실패: ${error.message}` }, { status: 500 });
  }
}

// PUT: 데이터 전체 수정
export async function PUT(request: NextRequest, { params }: { params: { tableName: string, id: string } }) {
  const { tableName, id } = params;

  if (!allowedTables.includes(tableName)) {
    return NextResponse.json({ error: `Table '${tableName}' is not accessible.` }, { status: 400 });
  }

  const data = await request.json();
  delete data.id;
  delete data.created_at;

  const columns = Object.keys(data).map(col => `${col} = ?`).join(', ');
  const values = [...Object.values(data), id];

  try {
    const db = await getDb();
    const result = await db.run(`UPDATE ${tableName} SET ${columns} WHERE id = ?`, values);
    if (result.changes === 0) {
      return NextResponse.json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` }, { status: 404 });
    }
    return NextResponse.json({ message: `[${tableName}] ID ${id}가 성공적으로 업데이트되었습니다.` });
  } catch (error: any) {
    return NextResponse.json({ error: `[${tableName}] 데이터 업데이트 실패: ${error.message}` }, { status: 500 });
  }
}

// PATCH: 데이터 부분 수정
export async function PATCH(request: NextRequest, { params }: { params: { tableName: string, id: string } }) {
    const { tableName, id } = params;

    if (!allowedTables.includes(tableName)) {
        return NextResponse.json({ error: `Table '${tableName}' is not accessible.` }, { status: 400 });
    }

    const data = await request.json();

    const columns = Object.keys(data).map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(data), id];

    try {
        const db = await getDb();
        const result = await db.run(`UPDATE ${tableName} SET ${columns} WHERE id = ?`, values);
        if (result.changes === 0) {
            return NextResponse.json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` }, { status: 404 });
        }
        return NextResponse.json({ message: `[${tableName}] ID ${id}가 성공적으로 패치되었습니다.` });
    } catch (error: any) {
        return NextResponse.json({ error: `[${tableName}] 데이터 패치 실패: ${error.message}` }, { status: 500 });
    }
}


// DELETE: 데이터 삭제
export async function DELETE(request: NextRequest, { params }: { params: { tableName: string, id: string } }) {
  const { tableName, id } = params;

  if (!allowedTables.includes(tableName)) {
    return NextResponse.json({ error: `Table '${tableName}' is not accessible.` }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return NextResponse.json({ error: `[${tableName}] ID ${id}를 찾을 수 없습니다.` }, { status: 404 });
    }
    return new Response(null, { status: 204 }); // No Content
  } catch (error: any) {
    return NextResponse.json({ error: `[${tableName}] 데이터 삭제 실패: ${error.message}` }, { status: 500 });
  }
}

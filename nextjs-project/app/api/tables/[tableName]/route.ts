// app/api/tables/[tableName]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

const allowedTables = ['customers', 'products', 'bookings', 'todos', 'notifications'];
// Allow sorting only on common and indexed columns for performance and security.
const allowedSortColumns = ['created_at', 'name', 'title', 'due_date', 'departure_date'];
const allowedOrderValues = ['asc', 'desc'];

// GET: 전체 데이터 조회
export async function GET(request: NextRequest, { params }: { params: { tableName: string } }) {
  const { tableName } = params;

  if (!allowedTables.includes(tableName)) {
    return NextResponse.json({ error: `Table '${tableName}' is not accessible.` }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || 100;
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  if (!allowedSortColumns.includes(sort)) {
    return NextResponse.json({ error: `Sorting by column '${sort}' is not allowed.` }, { status: 400 });
  }
  if (!allowedOrderValues.includes(order.toLowerCase())) {
    return NextResponse.json({ error: `Order value '${order}' is not allowed.` }, { status: 400 });
  }

  try {
    const db = await getDb();
    const items = await db.all(`SELECT * FROM ${tableName} ORDER BY ${sort} ${order} LIMIT ?`, [limit]);
    return NextResponse.json({ data: items });
  } catch (error: any) {
    return NextResponse.json({ error: `[${tableName}] 데이터 조회 실패: ${error.message}` }, { status: 500 });
  }
}

// POST: 데이터 생성 (POST logic remains the same)
export async function POST(request: NextRequest, { params }: { params: { tableName: string } }) {
  const { tableName } = params;

  if (!allowedTables.includes(tableName)) {
    return NextResponse.json({ error: `Table '${tableName}' is not accessible.` }, { status: 400 });
  }

  const data = await request.json();
  data.id = crypto.randomUUID();
  data.created_at = new Date().toISOString();

  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = Object.values(data);

  try {
    const db = await getDb();
    await db.run(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`, values);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `[${tableName}] 데이터 생성 실패: ${error.message}` }, { status: 500 });
  }
}

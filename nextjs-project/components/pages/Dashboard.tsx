// components/pages/Dashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(true);

  // TODO: This is a temporary data fetching solution for the dashboard.
  // In a real application, consider a more robust data fetching strategy,
  // perhaps using a library like SWR or React Query, and moving fetching logic
  // to a custom hook.
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, customersRes] = await Promise.all([
          fetch('/api/tables/bookings?limit=1000'),
          fetch('/api/tables/customers?limit=1000'),
        ]);
        if (!bookingsRes.ok || !customersRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const bookingsData = await bookingsRes.json();
        const customersData = await customersRes.json();
        dispatch({ type: 'SET_BOOKINGS', payload: bookingsData.data || [] });
        dispatch({ type: 'SET_CUSTOMERS', payload: customersData.data || [] });
      } catch (error) {
        console.error("Dashboard data fetching error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [dispatch]);

  if (loading) {
    return <div>대시보드 데이터를 불러오는 중입니다...</div>;
  }

  // 통계 계산
  const totalBookings = state.bookings.length;
  const totalCustomers = state.customers.length;
  const pendingBookings = state.bookings.filter(b => b.status === '예약확정' || b.status === '문의').length;
  const totalRevenue = state.bookings
    .filter(b => b.status !== '취소')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <section id="page-dashboard" className="page-content active">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info"><h3>{totalBookings}</h3><p>총 예약</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-users"></i></div>
          <div className="stat-info"><h3>{totalCustomers}</h3><p>총 고객</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-clock"></i></div>
          <div className="stat-info"><h3>{pendingBookings}</h3><p>대기 중 예약</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><i className="fas fa-won-sign"></i></div>
          <div className="stat-info"><h3>{totalRevenue.toLocaleString()}원</h3><p>총 매출</p></div>
        </div>
      </div>
      {/* 이하 내용은 이전과 동일 */}
    </section>
  );
};

export default Dashboard;

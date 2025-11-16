// components/AppShell.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/pages/Dashboard';
import { useAppContext } from '@/context/AppContext';

type ActivePage = 'dashboard' | 'bookings' | 'customers' | 'products' | 'quote' | 'notifications';

export default function AppShell() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const { state } = useAppContext();

  // TODO: Implement page-specific data fetching.
  // The global state should be initialized here, but each page component
  // (e.g., Dashboard, Customers) should be responsible for fetching the data it needs.
  // For now, we assume the data is already in the context.

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      // Add other page components here
      default: return <div>페이지를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        notificationCount={state.notifications.filter(n => !n.is_read).length}
      />
      <main className="main-content">
        <div className="content-wrapper">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

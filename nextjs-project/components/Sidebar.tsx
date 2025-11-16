// components/Sidebar.tsx
'use client';

import React from 'react';
import styles from './Sidebar.module.css'; // CSS 모듈 임포트

type ActivePage = 'dashboard' | 'bookings' | 'customers' | 'products' | 'quote' | 'notifications';

interface SidebarProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  notificationCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, notificationCount }) => {
  const navItems: { id: ActivePage; icon: string; name: string }[] = [
    { id: 'dashboard', icon: 'fas fa-chart-line', name: '대시보드' },
    { id: 'bookings', icon: 'fas fa-calendar-check', name: '예약 관리' },
    { id: 'customers', icon: 'fas fa-users', name: '고객 관리' },
    { id: 'products', icon: 'fas fa-map-marked-alt', name: '상품 관리' },
    { id: 'quote', icon: 'fas fa-file-invoice-dollar', name: '견적서 생성' },
    { id: 'notifications', icon: 'fas fa-bell', name: '알림 관리' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <i className="fas fa-plane-departure"></i>
        <h1>여행사 관리</h1>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(item.id);
            }}
          >
            <i className={item.icon}></i>
            <span>{item.name}</span>
            {item.id === 'notifications' && notificationCount > 0 && (
              <span className="notification-badge"> {/* 이 클래스는 globals.css에 유지 */}
                {notificationCount}
              </span>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

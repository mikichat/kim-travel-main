// context/AppContext.tsx
'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Customer, Product, Booking, Notification, Todo } from '@/types';

// 상태 타입 정의
interface State {
  customers: Customer[];
  products: Product[];
  bookings: Booking[];
  notifications: Notification[];
  todos: Todo[];
  securityMode: boolean;
}

// 액션 타입 정의
type Action =
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'TOGGLE_SECURITY_MODE' };

// 초기 상태
const initialState: State = {
  customers: [],
  products: [],
  bookings: [],
  notifications: [],
  todos: [],
  securityMode: true,
};

// 리듀서 함수
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'SET_NOTIFICATIONS':
        return { ...state, notifications: action.payload };
    case 'SET_TODOS':
        return { ...state, todos: action.payload };
    case 'TOGGLE_SECURITY_MODE':
      return { ...state, securityMode: !state.securityMode };
    default:
      return state;
  }
};

// 컨텍스트 생성
interface AppContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// 컨텍스트 프로바이더
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// 커스텀 훅
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

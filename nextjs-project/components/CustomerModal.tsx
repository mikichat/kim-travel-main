// components/CustomerModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Customer } from '@/types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customer }) => {
  const { dispatch } = useAppContext();
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name_kor: '', name_eng: '', passport_number: '', birth_date: '',
        passport_expiry: '', phone: '', email: '', address: '',
        travel_history: '', notes: '',
      });
    }
  }, [customer, isOpen]); // isOpen to reset form when modal is reopened

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = customer ? `/api/tables/customers/${customer.id}` : '/api/tables/customers';
      const method = customer ? 'PUT' : 'POST';
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('고객 정보 저장에 실패했습니다.');

      const newDataResponse = await fetch('/api/tables/customers?limit=1000');
      const newData = await newDataResponse.json();
      dispatch({ type: 'SET_CUSTOMERS', payload: newData.data || [] });

      onClose();
    } catch (error) {
      console.error('고객 정보 저장 오류:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>{customer ? '고객 편집' : '고객 추가'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <h4 className="form-section-title"><i className="fas fa-user"></i> 기본 정보</h4>
          <div className="form-grid">
            <div className="form-group"><label htmlFor="name_kor">한글명 *</label><input type="text" id="name_kor" value={formData.name_kor || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="name_eng">영문명 (여권상) *</label><input type="text" id="name_eng" value={formData.name_eng || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="birth_date">생년월일 *</label><input type="date" id="birth_date" value={formData.birth_date || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="phone">연락처 *</label><input type="tel" id="phone" value={formData.phone || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="email">이메일</label><input type="email" id="email" value={formData.email || ''} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="address">주소</label><input type="text" id="address" value={formData.address || ''} onChange={handleChange} /></div>
          </div>

          <h4 className="form-section-title"><i className="fas fa-passport"></i> 여권 정보</h4>
          <div className="form-grid">
            <div className="form-group"><label htmlFor="passport_number">여권번호 *</label><input type="text" id="passport_number" value={formData.passport_number || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="passport_expiry">여권 만료일 *</label><input type="date" id="passport_expiry" value={formData.passport_expiry || ''} onChange={handleChange} required /></div>
          </div>

          {/* File input is not implemented in this simplified version */}

          <h4 className="form-section-title"><i className="fas fa-globe"></i> 여행 정보</h4>
          <div className="form-group full-width"><label htmlFor="travel_history">여행 이력</label><textarea id="travel_history" value={formData.travel_history || ''} onChange={handleChange} rows={3}></textarea></div>
          <div className="form-group full-width"><label htmlFor="notes">비고</label><textarea id="notes" value={formData.notes || ''} onChange={handleChange} rows={3}></textarea></div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> 저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;

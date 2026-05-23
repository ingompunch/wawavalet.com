import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Car, Clock, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { useSiteData } from '../lib/siteService';
import { DatePicker } from '../components/DatePicker';
import { TimePicker } from '../components/TimePicker';

export const Reservation = () => {
  const navigate = useNavigate();
  const { data: siteData } = useSiteData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    carNumber: '',
    carModel: '',
    terminal: 'T1',
    entryDate: '',
    entryTime: '10:00',
    exitDate: '',
    exitTime: '10:00',
    parkingType: 'indoor',
  });
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (formData.entryDate && formData.exitDate) {
      calculatePrice();
    }
  }, [
    formData.entryDate,
    formData.entryTime,
    formData.exitDate,
    formData.exitTime,
    formData.parkingType,
    siteData
  ]);

  const calculatePrice = () => {
    const start = new Date(`${formData.entryDate}T${formData.entryTime}`);
    const end = new Date(`${formData.exitDate}T${formData.exitTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setTotalPrice(null);
      return;
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && siteData) {
      let days = diffDays;
      if (days < 1) days = 1;

      let basePrice = 40000;
      let extraDayPrice = 5000;

      if (formData.parkingType === 'outdoor') {
        basePrice = siteData.fees?.outdoorBasePrice ?? 40000;
        extraDayPrice = siteData.fees?.outdoorPlusDayPrice ?? 5000;
      } else {
        basePrice = siteData.fees?.indoorBasePrice ?? 40000;
        extraDayPrice = siteData.fees?.indoorPlusDayPrice ?? 10000;
      }

      let price = days <= 2 ? basePrice : basePrice + (days - 2) * extraDayPrice;

      setTotalPrice(price);
    } else {
      setTotalPrice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalPrice) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reservations'), {
        ...formData,
        totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('예약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="bg-green-100 p-6 rounded-full">
            <CheckCircle2 size={80} className="text-green-600" />
          </div>
        </motion.div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900">예약 신청 완료!</h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            고객님의 소중한 예약 정보가 정상적으로 접수되었습니다.<br />
            확인 후 즉시 안내 전화를 드리겠습니다.
          </p>
        </div>
        <div className="pt-10">
          <button 
            onClick={() => navigate('/')}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 shadow-inner">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 italic">
            ONLINE <span className="text-[#FFB800] not-italic">RESERVATION</span>
          </h2>
          <p className="text-slate-500 font-bold text-sm md:text-base">빠르고 간편한 와와 주차대행 온라인 예약 시스템입니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-[#FFB800]" /> 기본 정보 입력
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">예약자 성함</label>
                  <input 
                    type="text" 
                    required
                    placeholder="홍길동"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 placeholder:text-slate-300 focus:ring-2 focus:ring-[#FFD500] outline-none font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">연락처</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="010-0000-0000"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 placeholder:text-slate-300 focus:ring-2 focus:ring-[#FFD500] outline-none font-bold"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">차량 번호</label>
                  <input 
                    type="text" 
                    required
                    placeholder="12가 3456"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 placeholder:text-slate-300 focus:ring-2 focus:ring-[#FFD500] outline-none font-bold"
                    value={formData.carNumber}
                    onChange={(e) => setFormData({...formData, carNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">차종</label>
                  <input 
                    type="text" 
                    required
                    placeholder="그랜저, GV80 등"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 placeholder:text-slate-300 focus:ring-2 focus:ring-[#FFD500] outline-none font-bold"
                    value={formData.carModel}
                    onChange={(e) => setFormData({...formData, carModel: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 일정 정보 */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-[#FFB800]" /> 일정 및 장소 선택
              </h3>
              <div className="space-y-6">
                <div className="flex gap-2">
                  {['T1', 'T2'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, terminal: t})}
                      className={`flex-1 py-4 px-4 rounded-xl text-sm font-black transition-all border ${
                        formData.terminal === t 
                          ? 'bg-slate-900 text-[#FFD500] border-slate-900 shadow-xl' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}
                    >
                      인천공항 제{t === 'T1' ? '1' : '2'}여객터미널
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">주차 유형 선택</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'indoor', label: '실내 주차' },
                      { key: 'outdoor', label: '실외 주차' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setFormData({...formData, parkingType: type.key})}
                        className={`flex-1 py-4 px-4 rounded-xl text-sm font-black transition-all border ${
                          formData.parkingType === type.key 
                            ? 'bg-slate-900 text-[#FFD500] border-slate-900 shadow-xl' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={14} className="text-blue-500" /> 출발일 및 입차 시간
                    </label>
                    <div className="flex gap-3">
                      <DatePicker 
                        value={formData.entryDate}
                        onChange={(val) => setFormData({...formData, entryDate: val})}
                        placeholder="연도-월-일"
                        className="flex-[3]"
                      />
                      <TimePicker 
                        value={formData.entryTime}
                        onChange={(val) => setFormData({...formData, entryTime: val})}
                        placeholder="시간 선택"
                        className="flex-[2]"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={14} className="text-red-500" /> 도착일 및 출차 시간
                    </label>
                    <div className="flex gap-3">
                      <DatePicker 
                        value={formData.exitDate}
                        onChange={(val) => setFormData({...formData, exitDate: val})}
                        placeholder="연도-월-일"
                        className="flex-[3]"
                      />
                      <TimePicker 
                        value={formData.exitTime}
                        onChange={(val) => setFormData({...formData, exitTime: val})}
                        placeholder="시간 선택"
                        className="flex-[2]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 요금 고정 패널 */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl shadow-slate-300">
              <h4 className="text-[#FFD500] font-black text-lg mb-6 flex items-center gap-2">
                 PREVIEW <span className="text-white">FEE</span>
              </h4>
              
              <div className="space-y-6 border-b border-white/10 pb-6 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold">주차 터미널</span>
                  <span className="font-black">제{formData.terminal === 'T1' ? '1' : '2'}터미널</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold">주차 기간</span>
                  <span className="font-black text-blue-400">
                    {totalPrice ? `${Math.ceil((new Date(formData.exitDate).getTime() - new Date(formData.entryDate).getTime()) / 86400000)}일` : '-'}
                  </span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold">주차 타입</span>
                  <span className="font-black text-green-400">
                    {formData.parkingType === 'outdoor' ? '실외 주차' : '실내 주차'}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">최종 예상 요금</span>
                <div className="text-4xl font-black mt-2 text-[#FFD500]">
                  {totalPrice ? formatPrice(totalPrice) : '날짜 선택'}
                </div>
              </div>

              {/* Service & Terminal Info Notice */}
              <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-slate-300 space-y-2 leading-snug text-left">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#FFD500] mt-0.5">•</span>
                  <span>주차 후 차량사진, 계기판, 자동차키, 차량보관증을 고객님께 문자, 카톡으로 전송해드립니다.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#FFD500] mt-0.5">•</span>
                  <span>공항도착 30분전 전화주세요.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#FFD500] mt-0.5">•</span>
                  <span className="font-extrabold text-[#FFD500]">T1, T2 금액 동일</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !totalPrice}
                className="w-full bg-[#FFD500] text-slate-900 py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
              >
                {isSubmitting ? '신청 중...' : '예약 신청하기'}
              </button>

              <div className="mt-6 flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <p>예약 신청 후 담당자가 기재하신 번호로 전화를 드려 세부 일정을 확정합니다.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

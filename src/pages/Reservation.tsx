import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { 
  Car, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Plane
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatPrice, cn } from '../lib/utils';
import { useSiteData } from '../lib/siteService';
import { DatePicker } from '../components/DatePicker';

// Firestore Error Info structure specified in the Firebase integration skill guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

const AIRLINES = [
  "대한항공 (Korean Air)",
  "아시아나항공 (Asiana Airlines)",
  "제주항공 (Jeju Air)",
  "진에어 (Jin Air)",
  "티웨이항공 (T'way Air)",
  "에어부산 (Air Busan)",
  "에어서울 (Air Seoul)",
  "이스타항공 (Eastar Jet)",
  "에어프레미아 (Air Premia)",
  "베트남항공 (Vietnam Airlines)",
  "기타 항공사"
];

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const MINUTES = ["00", "10", "20", "30", "40", "50"];

export const Reservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: siteData } = useSiteData();

  // Primary states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    carNumber: '',
    carModel: '',
    parkingType: 'indoor' as 'indoor' | 'outdoor',
    
    // Departure (Departure timing & Details)
    entryDate: '',
    entryAmPm: '오전',
    entryHour: '10',
    entryMin: '00',
    entryTerminal: 'T1' as 'T1' | 'T2',
    entryAirline: '대한항공 (Korean Air)',
    entryFlight: '',

    // Arrival (Arrival timing & Details)
    exitDate: '',
    exitAmPm: '오후',
    exitHour: '04',
    exitMin: '00',
    exitTerminal: 'T1' as 'T1' | 'T2',
    exitAirline: '대한항공 (Korean Air)',
    exitFlight: '',

    destination: '',
    notes: '',
    password: '',
  });

  // Terms Agreement states
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // Price Calculation states
  const [daysCount, setDaysCount] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [entrySurchargeApplied, setEntrySurchargeApplied] = useState(false);
  const [exitSurchargeApplied, setExitSurchargeApplied] = useState(false);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper code to handle Firestore specific errors with JSON structured reports
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error Details:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // Convert 12-hour AM/PM format into 24-hour hour string
  const convertTo24Hour = (ampm: string, hourStr: string) => {
    let hour = parseInt(hourStr, 10);
    if (ampm === '오후' && hour < 12) {
      hour += 12;
    } else if (ampm === '오전' && hour === 12) {
      hour = 0;
    }
    return hour;
  };

  // Surcharge checking logic (Before 05:00 AM or after 19:00 PM)
  const checkSurcharge = (ampm: string, hourStr: string) => {
    const hour24 = convertTo24Hour(ampm, hourStr);
    return hour24 < 5 || hour24 >= 19; // 05:00 is excluded, so < 5 hits 00, 01, 02, 03, 04
  };

  // Load and prefill state from Home Page Quick Calculator if available
  useEffect(() => {
    if (location.state) {
      const state = location.state as {
        parkingType?: 'indoor' | 'outdoor';
        entryDate?: string;
        entryTime?: string;
        exitDate?: string;
        exitTime?: string;
      };
      
      setFormData(prev => {
        const entryParts = state.entryTime ? state.entryTime.split(':') : [];
        const exitParts = state.exitTime ? state.exitTime.split(':') : [];

        let entryAmPm = prev.entryAmPm;
        let entryHour = prev.entryHour;
        let entryMin = prev.entryMin;
        if (entryParts.length === 2) {
          const rawHour = parseInt(entryParts[0], 10);
          entryMin = entryParts[1];
          if (rawHour >= 12) {
            entryAmPm = '오후';
            entryHour = (rawHour === 12 ? 12 : rawHour - 12).toString();
          } else {
            entryAmPm = '오전';
            entryHour = (rawHour === 0 ? 12 : rawHour).toString();
          }
        }

        let exitAmPm = prev.exitAmPm;
        let exitHour = prev.exitHour;
        let exitMin = prev.exitMin;
        if (exitParts.length === 2) {
          const rawHour = parseInt(exitParts[0], 10);
          exitMin = exitParts[1];
          if (rawHour >= 12) {
            exitAmPm = '오후';
            exitHour = (rawHour === 12 ? 12 : rawHour - 12).toString();
          } else {
            exitAmPm = '오전';
            exitHour = (rawHour === 0 ? 12 : rawHour).toString();
          }
        }

        return {
          ...prev,
          parkingType: state.parkingType ?? prev.parkingType,
          entryDate: state.entryDate ?? prev.entryDate,
          entryAmPm,
          entryHour,
          entryMin,
          exitDate: state.exitDate ?? prev.exitDate,
          exitAmPm,
          exitHour,
          exitMin,
        };
      });
    }
  }, [location.state]);

  // Price update logic triggered when relevant values change
  useEffect(() => {
    if (formData.entryDate && formData.exitDate) {
      calculatePrice();
    } else {
      setTotalPrice(null);
      setDaysCount(null);
    }
  }, [
    formData.entryDate,
    formData.entryAmPm,
    formData.entryHour,
    formData.entryMin,
    formData.exitDate,
    formData.exitAmPm,
    formData.exitHour,
    formData.exitMin,
    formData.parkingType
  ]);

  const calculatePrice = () => {
    const startParts = formData.entryDate.split('-').map(Number);
    const endParts = formData.exitDate.split('-').map(Number);
    
    if (startParts.length !== 3 || endParts.length !== 3 || startParts.some(isNaN) || endParts.some(isNaN)) {
      setTotalPrice(null);
      setDaysCount(null);
      return;
    }

    const d1 = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const d2 = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    const diffTime = d2.getTime() - d1.getTime();
    let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays < 1) diffDays = 1; // Minimum is 1 day

    // Rates calculation as per spec:
    // [실외 주차 요금] 1~2일은 기본요금 40,000원 고정. 3일째부터 하루당 5,000원씩 누적 합산
    // [실내 주차 요금] 1~2일은 기본요금 40,000원 고정. 3일째부터 하루당 10,000원씩 누적 합산
    let calculatedBaseFee = 0;
    if (formData.parkingType === 'outdoor') {
      if (diffDays <= 2) {
        calculatedBaseFee = 40000;
      } else {
        calculatedBaseFee = 40000 + (diffDays - 2) * 5000;
      }
    } else {
      if (diffDays <= 2) {
        calculatedBaseFee = 40000;
      } else {
        calculatedBaseFee = 40000 + (diffDays - 2) * 10000;
      }
    }

    // Checking entry / exit surcharges
    const isEntrySurcharged = checkSurcharge(formData.entryAmPm, formData.entryHour);
    const isExitSurcharged = checkSurcharge(formData.exitAmPm, formData.exitHour);

    setEntrySurchargeApplied(isEntrySurcharged);
    setExitSurchargeApplied(isExitSurcharged);

    // Apply flat 20,000 won if either or both are in surcharged range
    if (isEntrySurcharged || isExitSurcharged) {
      calculatedBaseFee += 20000;
    }

    setDaysCount(diffDays);
    setTotalPrice(calculatedBaseFee);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pureNumbers = e.target.value.replace(/[^0-9]/g, '');
    let formatted = pureNumbers;
    if (pureNumbers.length > 3 && pureNumbers.length <= 7) {
      formatted = `${pureNumbers.slice(0, 3)}-${pureNumbers.slice(3)}`;
    } else if (pureNumbers.length > 7) {
      formatted = `${pureNumbers.slice(0, 3)}-${pureNumbers.slice(3, 7)}-${pureNumbers.slice(7, 11)}`;
    }
    setFormData({ ...formData, phone: formatted });
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData({ ...formData, password: numeric });
  };

  const isFormComplete = 
    formData.name.trim() !== '' &&
    formData.phone.trim().length >= 10 &&
    formData.carNumber.trim() !== '' &&
    formData.carModel.trim() !== '' &&
    formData.entryDate !== '' &&
    formData.exitDate !== '' &&
    formData.entryFlight.trim() !== '' &&
    formData.exitFlight.trim() !== '' &&
    formData.destination.trim() !== '' &&
    formData.password.length === 4 &&
    agreeTerms &&
    agreePrivacy &&
    totalPrice !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete || totalPrice === null) return;

    setIsSubmitting(true);
    const reservationsCol = 'reservations';

    const entryHour24 = convertTo24Hour(formData.entryAmPm, formData.entryHour);
    const finalEntryTimeStr = `${entryHour24.toString().padStart(2, '0')}:${formData.entryMin}`;

    const exitHour24 = convertTo24Hour(formData.exitAmPm, formData.exitHour);
    const finalExitTimeStr = `${exitHour24.toString().padStart(2, '0')}:${formData.exitMin}`;

    const entryDateStr = `${formData.entryDate}T${finalEntryTimeStr}:00`;
    let entryDateObj = new Date(entryDateStr);
    if (isNaN(entryDateObj.getTime())) {
      entryDateObj = new Date(formData.entryDate);
    }
    const entryTimestamp = Timestamp.fromDate(entryDateObj);

    const exitDateStr = `${formData.exitDate}T${finalExitTimeStr}:00`;
    let exitDateObj = new Date(exitDateStr);
    if (isNaN(exitDateObj.getTime())) {
      exitDateObj = new Date(formData.exitDate);
    }
    const exitTimestamp = Timestamp.fromDate(exitDateObj);

    const submissionPayload = {
      name: formData.name,
      phone: formData.phone,
      carNumber: formData.carNumber,
      carModel: formData.carModel,
      parkingType: formData.parkingType,
      entryDate: entryTimestamp,
      entryTime: finalEntryTimeStr,
      entryTerminal: formData.entryTerminal,
      entryAirline: formData.entryAirline,
      entryFlight: formData.entryFlight,
      exitDate: exitTimestamp,
      exitTime: finalExitTimeStr,
      exitTerminal: formData.exitTerminal,
      exitAirline: formData.exitAirline,
      exitFlight: formData.exitFlight,
      destination: formData.destination,
      notes: formData.notes,
      password: formData.password,
      totalPrice: totalPrice,
      status: '입고예정', // Status requirement set to B2B expected state
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, reservationsCol), submissionPayload);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, reservationsCol);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#121212] text-white min-h-screen py-16 flex flex-col justify-center items-center">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-8 flex flex-col justify-center items-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-[#FFD500]/10 p-6 rounded-full border border-[#FFD500]/30 shadow-xl shadow-yellow-500/10">
              <CheckCircle2 size={80} className="text-[#FFD500]" />
            </div>
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">온라인 예약 완료!</h2>
            <p className="text-sm sm:text-base text-slate-350 leading-relaxed font-semibold max-w-md mx-auto break-keep">
              와와 주차대행을 이용해 주셔서 감사드립니다.<br />
              입력된 예약 내역 확인 후 즉시 배정 담당자가 기재하신 번호로 안심 안내 전화를 드리겠습니다.
            </p>
          </div>
          
          {/* Simple details preview box */}
          <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-3xl w-full max-w-md text-left space-y-3 font-semibold text-xs sm:text-sm text-slate-350">
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-450">예약자명</span>
              <span className="text-white font-black">{formData.name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-450">연락처</span>
              <span className="text-white font-black">{formData.phone}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-450 font-bold">차량 정보</span>
              <span className="text-white font-black">{formData.carModel} ({formData.carNumber})</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-450">주차 유형</span>
              <span className="text-[#FFD500] font-black">{formData.parkingType === 'indoor' ? '실내 주차' : '야외 주차'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450">최종 예상 요금</span>
              <span className="text-[#FFD500] font-black text-lg">{formatPrice(totalPrice ?? 0)}</span>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={() => navigate('/')}
              className="bg-[#FFD500] text-slate-900 px-10 py-4 rounded-2xl font-black text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/10 cursor-pointer"
            >
              메인 홈페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white min-h-screen py-10 md:py-16 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        
        {/* Heading Section */}
        <div className="mb-8 md:mb-12 text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#FFD500]/10 border border-[#FFD500]/30 text-[#FFD500] px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Plane size={11} className="animate-pulse" /> WAWA INDOOR & OUTDOOR PARKING
          </div>
          <h2 className="text-2xl md:text-5xl font-black text-white tracking-tighter">
            와와 주차대행 <span className="text-[#FFD500]">온라인 예약</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold leading-normal">
            인천공항 1·2터미널 실내/야외 합리적인 정직한 맞춤 요금을 실시간으로 연동하여 제공합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Main detail capture form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Parking Type Choice - UX Improvement: Moved to the very top */}
            <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-4 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="bg-[#FFD500]/10 p-2 rounded-xl text-[#FFD500]">
                  <Car size={18} />
                </div>
                <h3 className="text-lg font-black text-white">주차 유형 선택 <span className="text-red-500">*</span></h3>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, parkingType: 'indoor'})}
                  className={`flex-1 py-4 px-4 rounded-xl text-sm font-black transition-all border ${
                    formData.parkingType === 'indoor'
                      ? 'bg-[#FFD500] text-slate-900 border-[#FFD500] shadow-xl shadow-yellow-500/10'
                      : 'bg-slate-950 text-slate-400 border-white/10 hover:bg-slate-900'
                  }`}
                >
                  실내 주차
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, parkingType: 'outdoor'})}
                  className={`flex-1 py-4 px-4 rounded-xl text-sm font-black transition-all border ${
                    formData.parkingType === 'outdoor'
                      ? 'bg-[#FFD500] text-slate-900 border-[#FFD500] shadow-xl shadow-yellow-500/10'
                      : 'bg-slate-950 text-slate-400 border-white/10 hover:bg-slate-900'
                  }`}
                >
                  야외 주차
                </button>
              </div>
            </div>
            
            {/* 1. Customer Personal & Vehicle Particulars */}
            <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="bg-[#FFD500]/10 p-2 rounded-xl text-[#FFD500]">
                  <User size={18} />
                </div>
                <h3 className="text-lg font-black text-white">예약자 정보 입력</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    예약자명 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="이름을 입력하세요"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    휴대폰 번호 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="숫자만 입력해 주세요"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                    value={formData.phone}
                    onChange={handlePhoneInput}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    차량 기종 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="차량 기종을 입력하세요"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                    value={formData.carModel}
                    onChange={(e) => setFormData({...formData, carModel: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    차량 번호 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="예) 05루 1234"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                    value={formData.carNumber}
                    onChange={(e) => setFormData({...formData, carNumber: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 2. Departure and Airline information */}
            <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
                  <Plane size={18} className="rotate-45" />
                </div>
                <h3 className="text-lg font-black text-white">출국 정보 (공항 도착 예정 시간)</h3>
              </div>

              <div className="space-y-6">
                
                {/* Outbound date and detailed dropdowns */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      출국 예정일 <span className="text-red-500">*</span>
                    </label>
                    <DatePicker 
                      value={formData.entryDate}
                      onChange={(date) => setFormData({...formData, entryDate: date})}
                      theme="dark"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      출국 픽업 예정 시간 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <select 
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                        value={formData.entryAmPm}
                        onChange={(e) => setFormData({...formData, entryAmPm: e.target.value})}
                      >
                        <option value="오전">오전</option>
                        <option value="오후">오후</option>
                      </select>
                      <select 
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                        value={formData.entryHour}
                        onChange={(e) => setFormData({...formData, entryHour: e.target.value})}
                      >
                        {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
                      </select>
                      <select 
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                        value={formData.entryMin}
                        onChange={(e) => setFormData({...formData, entryMin: e.target.value})}
                      >
                        {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terminal Radios / Airline dropdown / Outbound Flight */}
                <div className="grid sm:grid-cols-3 gap-4 border-t border-white/5 pt-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      출국 터미널 <span className="text-red-500">*</span>
                    </span>
                    <div className="flex gap-2">
                      {(['T1', 'T2'] as const).map(term => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setFormData({...formData, entryTerminal: term})}
                          className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all ${
                            formData.entryTerminal === term 
                              ? 'bg-[#FFD500] text-slate-900 border-[#FFD500] shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-white/10 hover:bg-slate-900'
                          }`}
                        >
                          제{term === 'T1' ? '1' : '2'}여객터미널
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      출국 항공사 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                      value={formData.entryAirline}
                      onChange={(e) => setFormData({...formData, entryAirline: e.target.value})}
                    >
                      {AIRLINES.map(airline => <option key={airline} value={airline}>{airline}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      출국 항공편명 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="예) KE101"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                      value={formData.entryFlight}
                      onChange={(e) => setFormData({...formData, entryFlight: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* 3. Arrival and Airline return information */}
            <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="bg-[#FFD500]/10 p-2 rounded-xl text-[#FFD500]">
                  <Plane size={18} className="translate-y-px" />
                </div>
                <h3 className="text-lg font-black text-white">입국 정보 (비행기 착륙 예정 시간)</h3>
              </div>

              <div className="space-y-6">
                
                {/* Arrival date and detailed dropdowns */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      입국 예정일 <span className="text-red-500">*</span>
                    </label>
                    <DatePicker 
                      value={formData.exitDate}
                      onChange={(date) => setFormData({...formData, exitDate: date})}
                      theme="dark"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      비행기 착륙 예정 시간 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <select 
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                        value={formData.exitAmPm}
                        onChange={(e) => setFormData({...formData, exitAmPm: e.target.value})}
                      >
                        <option value="오전">오전</option>
                        <option value="오후">오후</option>
                      </select>
                      <select 
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                        value={formData.exitHour}
                        onChange={(e) => setFormData({...formData, exitHour: e.target.value})}
                      >
                        {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
                      </select>
                      <select 
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-2 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                        value={formData.exitMin}
                        onChange={(e) => setFormData({...formData, exitMin: e.target.value})}
                      >
                        {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terminal Radios / Airline Return Dropdown / Return Flight */}
                <div className="grid sm:grid-cols-3 gap-4 border-t border-white/5 pt-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      입국 터미널 <span className="text-red-500">*</span>
                    </span>
                    <div className="flex gap-2">
                      {(['T1', 'T2'] as const).map(term => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setFormData({...formData, exitTerminal: term})}
                          className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all ${
                            formData.exitTerminal === term 
                              ? 'bg-[#FFD500] text-slate-900 border-[#FFD500] shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-white/10 hover:bg-slate-900'
                          }`}
                        >
                          제{term === 'T1' ? '1' : '2'}여객터미널
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      입국 항공사 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500]"
                      value={formData.exitAirline}
                      onChange={(e) => setFormData({...formData, exitAirline: e.target.value})}
                    >
                      {AIRLINES.map(airline => <option key={airline} value={airline}>{airline}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      입국 항공편명 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="예) KE102"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                      value={formData.exitFlight}
                      onChange={(e) => setFormData({...formData, exitFlight: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Travel destination, other comments, modification numeric password */}
            <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="bg-[#FFD500]/10 p-2 rounded-xl text-[#FFD500]">
                  <Lock size={18} />
                </div>
                <h3 className="text-lg font-black text-white">추가 상세 및 취소 비밀번호</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    여행지 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="예) 오사카, 싱가포르"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    예약 비밀번호 (숫자 4자리) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    required
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="예약 확인/취소용 비밀번호"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all"
                    value={formData.password}
                    onChange={handlePasswordInput}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 font-sans">
                    기타 요청사항 (선택)
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="기타 전달 사항이나 요청하실 내용이 있으면 입력해 주세요."
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFD500] focus:border-[#FFD500] outline-none font-bold text-white text-sm transition-all leading-relaxed"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 5. Formal terms of service and metadata check */}
            <div className="bg-[#1E1E1E] p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="bg-[#FFD500]/10 p-2 rounded-xl text-[#FFD500]">
                  <AlertCircle size={18} />
                </div>
                <h3 className="text-lg font-black text-white">약관 동의 및 확인</h3>
              </div>

              {/* Term 1 Box */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between pl-1">
                  <span className="text-xs font-black text-slate-300">■ 이용약관 (필수)</span>
                </div>
                <div className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-[11px] text-slate-400 font-semibold h-36 overflow-y-auto leading-relaxed select-text space-y-2">
                  <p className="font-extrabold text-white text-xs">제 1조 (서비스 제공과 시작과 종료)</p>
                  <p>① 고객이 주차서비스를 이용하는 시점부터 서비스 제공의 시작으로 한다</p>
                  <p>② 서비스의 종료는 고객이 차량을 인도 받은 시점으로 한다</p>
                  
                  <p className="font-extrabold text-white text-xs mt-2">제 2조 (서비스 요금)</p>
                  <p>달력 날짜 칸수 기준 요금 (입출차 시간 무관, '출차일 - 입차일 + 1'이 최종 일수)</p>
                  <p>1) 실외 주차 요금: 1~2일 기본요금 40,000원 고정, 3일째부터 하루당 5,000원씩 누적 합산</p>
                  <p>2) 실내 주차 요금: 1~2일 기본요금 40,000원 고정, 3일째부터 하루당 10,000원씩 누적 합산</p>
                  
                  <p className="font-extrabold text-[#FFD500] text-[11px] mt-1">• 새벽/야간 할증: 입차 또는 출차 시간 중 하나라도 오후 19시~새벽 04시 59분(05시 정각 제외) 사이에 해당 시 총액에 20,000원이 한 번만 할증 적용됩니다.</p>

                  <p className="font-extrabold text-white text-xs mt-2">제 3조 (귀책사유 및 보험 보상 범위)</p>
                  <p>① 당사의 서비스제공 기간 중 당사직원의 고의 또는 과실로 인하여 발생한 차량 손해에 대해 손해 전액을 배상하며 단 차량인도 인도 후에는 차량손해에 대해 책임지지 않는다.</p>
                  <p>② 주차대행으로 발생한 모든탁송 중에 발생하는 사고는 당사직원이 가입한 대리운전(탁송) 종합보험에 준하여 보상한다.</p>
                  <p>③ 고객이 전화를 받지 않거나 공항 정체 및 입출국 지연으로 인한 과태료는 당사는 일체 책임을 지지 않는다.</p>
                  <p>④ 차량 문콕 및 미세 기스 휠 흠집 유리기스 주행 중 돌빵 등에 대해서는 당사는 일체 책임을 지지 않는다.</p>
                  <p>⑤ 차량 내부 귀중품 및 물품 분실에 대해 당사는 일체 책임을 지지 않는다.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 border border-white/10 hover:border-[#FFD500]/30 transition-all py-3.5 px-4 rounded-xl">
                  <input 
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded text-[#FFD500] focus:ring-[#FFD500] focus:ring-offset-0 size-4 cursor-pointer accent-[#FFD500]"
                  />
                  <span className="text-xs font-black text-slate-300 tracking-tight select-none">
                    약관의 내용을 모두 확인하였으며, 이에 동의합니다. <span className="text-[#FFD500]">(필수)</span>
                  </span>
                </label>
              </div>

              {/* Term 2 Box */}
              <div className="space-y-3 text-left pt-2 border-t border-white/5">
                <div className="flex items-center justify-between pl-1">
                  <span className="text-xs font-black text-slate-300">■ 개인정보 수집 및 동의 (필수)</span>
                </div>
                <div className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-[11px] text-slate-400 font-semibold h-36 overflow-y-auto leading-relaxed select-text space-y-2">
                  <p>본인은 와와주차대행 주차 서비스를 이용하는 목적으로 다음과 같이 본인의 개인정보를 수집 및 이용하는데 동의합니다.</p>
                  <p className="font-extrabold text-slate-300 text-xs mt-1">- 개인정보의 수집 및 이용 목적: 주차관리대장 작성 및 고객과의 원활한 의사 소통, 예약확인, 상담, 요금결제 등</p>
                  <p className="font-extrabold text-slate-300 text-xs">- 수집하는 개인정보의 항목: 성함, 휴대폰번호, 차량기종, 차량번호</p>
                  <p className="font-extrabold text-slate-300 text-xs">- 개인정보 보유 및 이용기간: 개인정보 수집 및 수집 목적이 달성되면 지체없이 파기합니다.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 border border-white/10 hover:border-[#FFD500]/30 transition-all py-3.5 px-4 rounded-xl">
                  <input 
                    type="checkbox"
                    required
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="rounded text-[#FFD500] focus:ring-[#FFD500] focus:ring-offset-0 size-4 cursor-pointer accent-[#FFD500]"
                  />
                  <span className="text-xs font-black text-slate-300 tracking-tight select-none">
                    개인정보 수집 및 이용에 최종 동의합니다. <span className="text-[#FFD500]">(필수)</span>
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Section floating Price and Action confirmation panel */}
          <div className="space-y-6">
            
            <div className="bg-[#1E1E1E] rounded-[2.5rem] p-6 sm:p-8 text-white lg:sticky lg:top-24 shadow-2xl shadow-black/35 border border-white/10">
              <h4 className="text-[#FFD500] font-black text-sm tracking-widest uppercase mb-6 flex items-center gap-1.5 font-mono">
                <Car size={14} className="text-[#FFD500]" /> ESTIMATED BILLING
              </h4>
              
              <div className="space-y-4 border-b border-white/5 pb-6 mb-6 font-semibold text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">주차 유형</span>
                  <span className="font-extrabold text-[#FFD500]">
                    {formData.parkingType === 'indoor' ? '실내 주차 (1~2일 기본 4만원 / 3일~ +1만원)' : '야외 주차 (1~2일 기본 4만원 / 3일~ +5천원)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">주차 일수</span>
                  <span className="font-black text-blue-400">
                    {daysCount !== null ? `${daysCount}일` : '-'}
                  </span>
                </div>

                {/* Surcharges breakdown */}
                {daysCount !== null && (entrySurchargeApplied || exitSurchargeApplied) && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2 mt-2">
                    <span className="text-[10px] font-black tracking-widest text-[#FFD500] block">추가 할증 요금 내역</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">야간/새벽 할증 (19:00 ~ 04:59)</span>
                      <span className="font-bold text-[#FFD500]">+20,000원</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Final Real-Time Price output */}
              <div className="mb-8">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-0.5">실시간 합계 요금</span>
                <div className="text-3xl sm:text-4xl font-black mt-1.5 text-[#FFD500] tracking-tight">
                  {totalPrice !== null ? formatPrice(totalPrice) : '예정일 선택 대기'}
                </div>
                {daysCount !== null && (
                  <p className="text-[11px] text-slate-400 font-bold mt-1 pl-0.5">
                    ({formData.parkingType === 'indoor' ? '실내' : '실외'} {daysCount}일 기준 정산)
                  </p>
                )}
              </div>

              {/* Submit trigger button strictly validated & synchronized */}
              <button 
                type="submit"
                disabled={isSubmitting || !isFormComplete}
                className="w-full bg-[#FFD500] text-slate-900 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale disabled:hover:scale-100 cursor-pointer shadow-xl shadow-yellow-500/5 hover:bg-[#ffe043]"
              >
                {isSubmitting ? '예약 신청 전송 중...' : '예약 신청하기'}
              </button>

              <div className="mt-6 flex items-start gap-2 text-[10px] text-slate-400 leading-normal font-semibold">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-[#FFD500]" />
                <p>
                  * 필수 항목 기재 및 하단 두 가지 필수 동의 서명이 모두 완료되면 예약 신청 버튼이 활성화됩니다.
                </p>
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

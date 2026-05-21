import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  Cctv, 
  MapPin, 
  ChevronRight, 
  CheckCircle, 
  Star,
  Award,
  Video,
  Phone
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { useSiteData } from '../lib/siteService';
import { DatePicker } from '../components/DatePicker';
import { TimePicker } from '../components/TimePicker';

export const Home = () => {
    const { data: siteData, loading } = useSiteData();
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('10:00');
    const [exitDate, setExitDate] = useState('');
    const [exitTime, setExitTime] = useState('10:00');
    const [parkingType, setParkingType] = useState<'outdoor' | 'indoor'>('outdoor');
    const [totalPrice, setTotalPrice] = useState<number | null>(null);

    useEffect(() => {
        if (entryDate && exitDate && siteData) {
            calculate();
        }
    }, [entryDate, entryTime, exitDate, exitTime, parkingType, siteData]);

    const calculate = () => {
        const start = new Date(`${entryDate}T${entryTime}`);
        const end = new Date(`${exitDate}T${exitTime}`);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setTotalPrice(null);
            return;
        }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / 86400000);
        
        if (diffDays >= 0 && siteData) {
            let days = diffDays;
            if (days < 1) days = 1;

            let basePrice = 40000;
            let extraDayPrice = 5000;

            if (parkingType === 'outdoor') {
                basePrice = siteData.fees?.outdoorBasePrice ?? 40000;
                extraDayPrice = siteData.fees?.outdoorPlusDayPrice ?? 5000;
            } else {
                basePrice = siteData.fees?.indoorBasePrice ?? 40000;
                extraDayPrice = siteData.fees?.indoorPlusDayPrice ?? 10000;
            }

            const surchargeAmount = siteData.fees?.surcharge || 10000;
            const sStart = siteData.fees?.surchargeStart || '20:00';
            const sEnd = siteData.fees?.surchargeEnd || '04:00';

            // 1~2일 기본 요금 적용 (2일 이하인 경우 basePrice, 3일 이상부터는 basePrice + 초과일수*추가요금)
            let price = days <= 2 ? basePrice : basePrice + (days - 2) * extraDayPrice;

            // Helper to check if time is in surcharge range
            const isSurchargeTime = (timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number);
                const [sh, sm] = sStart.split(':').map(Number);
                const [eh, em] = sEnd.split(':').map(Number);

                const time = h * 60 + m;
                const start = sh * 60 + sm;
                const end = eh * 60 + em;

                if (start <= end) {
                    return time >= start && time <= end;
                } else {
                    // Over midnight
                    return time >= start || time <= end;
                }
            };

            if (isSurchargeTime(entryTime)) price += surchargeAmount;
            if (isSurchargeTime(exitTime)) price += surchargeAmount;

            setTotalPrice(price);
        } else {
            setTotalPrice(null);
        }
    };

    if (loading) return null;

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-slate-950 py-20 px-6 sm:px-8">
        {/* BG Decoration */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        
        <div className="container mx-auto max-w-7xl relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 bg-[#FFD500]/10 border border-[#FFD500]/30 text-[#FFD500] px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase"
            >
              <Award size={14} /> PREMIUM VALET SERVICE
            </motion.div>
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight sm:leading-[1.1] whitespace-pre-wrap"
            >
              {siteData.home.heroTitle}
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium whitespace-pre-wrap"
            >
              {siteData.home.heroSub}
            </motion.p>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 pt-4"
            >
                <div className="flex items-center gap-3 text-white/60 group">
                    <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 group-hover:bg-[#FFD500]/20 group-hover:border-[#FFD500]/40 transition-colors">
                        <Video size={20} className="text-[#FFD500]" />
                    </div>
                    <span className="text-sm font-bold">24H CCTV</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 group">
                    <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 group-hover:bg-[#FFD500]/20 group-hover:border-[#FFD500]/40 transition-colors">
                        <ShieldCheck size={20} className="text-[#FFD500]" />
                    </div>
                    <span className="text-sm font-bold">발렛보험</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 group">
                    <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 group-hover:bg-[#FFD500]/20 group-hover:border-[#FFD500]/40 transition-colors">
                        <MapPin size={20} className="text-[#FFD500]" />
                    </div>
                    <span className="text-sm font-bold">실내외 완비</span>
                </div>
            </motion.div>
          </div>

          {/* Calculator Overlay */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
                <div className="bg-[#FFD500] px-8 py-5 flex items-center justify-between">
                    <span className="font-black text-slate-900 tracking-tighter">QUICK PRICE CALCULATOR</span>
                    <Clock size={20} className="text-slate-900 opacity-50" />
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">입차 예정일</label>
                            <DatePicker 
                                value={entryDate}
                                onChange={setEntryDate}
                                placeholder="연도-월-일"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">입차 시간</label>
                            <TimePicker 
                                value={entryTime}
                                onChange={setEntryTime}
                                placeholder="시간 선택"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">출차 예정일</label>
                            <DatePicker 
                                value={exitDate}
                                onChange={setExitDate}
                                placeholder="연도-월-일"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">출차 시간</label>
                            <TimePicker 
                                value={exitTime}
                                onChange={setExitTime}
                                placeholder="시간 선택"
                            />
                        </div>
                    </div>

                    {/* 주차 타입 선택 */}
                    <div className="space-y-2 pt-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">주차 유형 선택</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setParkingType('outdoor')}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border",
                                    parkingType === 'outdoor'
                                        ? "bg-slate-900 text-[#FFD500] border-slate-900 shadow-md"
                                        : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                                )}
                            >
                                실외 주차
                            </button>
                            <button
                                type="button"
                                onClick={() => setParkingType('indoor')}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border",
                                    parkingType === 'indoor'
                                        ? "bg-slate-900 text-[#FFD500] border-slate-900 shadow-md"
                                        : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                                )}
                            >
                                실내 주차
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 min-h-[120px] flex flex-col justify-center">
                        {totalPrice ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p className="text-slate-400 text-[10px] font-black tracking-widest mb-1 uppercase">ESTIMATED TOTAL</p>
                                <div className="text-4xl font-black text-slate-900">{formatPrice(totalPrice)}</div>
                            </motion.div>
                        ) : (
                            <p className="text-slate-300 font-bold italic tracking-tight">날짜를 입력하시면 요금이 표시됩니다</p>
                        )}
                    </div>

                    <a 
                        href={siteData.reservationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-slate-900 text-[#FFD500] py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                        지금 바로 예약하기 <ChevronRight size={20} />
                    </a>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="py-24 bg-white px-6 sm:px-8">
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                    차원이 다른 <span className="text-[#FFB800]">3단계 안심 시스템</span>
                </h3>
                <p className="text-slate-500 font-medium">와와 주차대행은 고객님의 소중한 파트너입니다.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                <div className="space-y-6 group">
                    <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-[#FFD500] transition-colors duration-500 shadow-sm">
                        <CheckCircle size={32} className="text-slate-900" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black text-slate-900">맞춤식 안심 주차 구역</h4>
                        <p className="text-slate-500 leading-relaxed font-medium">안전하고 경제적인 실외 주차장부터 쾌적한 실내 타워 주차장까지 기호와 예산에 적합한 맞춤 주차 서비스를 합리적으로 제공합니다.</p>
                    </div>
                </div>
                <div className="space-y-6 group">
                    <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-[#FFD500] transition-colors duration-500 shadow-sm">
                        <Cctv size={32} className="text-slate-900" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black text-slate-900">빈틈 없는 보안</h4>
                        <p className="text-slate-500 leading-relaxed font-medium">ADT 캡스 정합 보안 시스템 가동. 24시간 실시간 CCTV 녹화로 불의의 사고를 완벽 예방합니다.</p>
                    </div>
                </div>
                <div className="space-y-6 group">
                    <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-[#FFD500] transition-colors duration-500 shadow-sm">
                        <ShieldCheck size={32} className="text-slate-900" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black text-slate-900">종합 보험 가입</h4>
                        <p className="text-slate-500 leading-relaxed font-medium">탁송 중 사고 발생 시에도 걱정 마세요. 전직원 현대해상/삼성화재 발렛 전용 보험 가입 완료.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Visual Banner */}
      <section className="px-6 sm:px-8 mb-24">
        <div className="container mx-auto max-w-6xl rounded-[3rem] bg-[#FFD500] overflow-hidden relative p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
            <div className="relative z-10 space-y-8">
                <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest">REAL PROMISE</div>
                <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none italic">{siteData.home.bannerText}</h3>
                <p className="text-slate-800 text-lg md:text-xl font-bold max-w-2xl mx-auto opacity-80 uppercase tracking-tight">
                    {siteData.home.bannerSub}
                </p>
                <div className="pt-4">
                    <a href={`tel:${siteData.phone || '010-9389-0966'}`} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-yellow-600/40 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3">
                        <Phone size={24} /> 24시간 즉시 상담 전화
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* Review Section (Mocked KakaoTalk Style) */}
      <section className="py-24 bg-slate-50 px-6 sm:px-8">
        <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                <div className="space-y-4">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">이용 고객 후기</h3>
                    <p className="text-slate-500 font-medium">카카오톡으로 고객님들이 보내주신 리얼 안심 주차 후기 대화입니다.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                    <div className="flex text-yellow-400">
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                    </div>
                    <span className="text-slate-900 font-black">4.9 / 5.0</span>
                </div>
            </div>

            {/* KakaoTalk Emulator Box */}
            <div className="bg-[#B2C7DA] rounded-[2.5rem] border-8 border-slate-900 overflow-hidden shadow-2xl max-w-xl mx-auto flex flex-col">
                {/* KakaoHeader */}
                <div className="bg-[#A0B1C4] px-6 py-4 flex items-center justify-between border-b border-[#92A3B3]/20">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <div className="size-2 rounded-full bg-slate-700/30" />
                            <div className="size-2 rounded-full bg-slate-700/30" />
                            <div className="size-2 rounded-full bg-slate-700/30" />
                        </div>
                        <span className="text-xs font-black text-slate-800 tracking-tight">와와 주차대행 고객 후기방</span>
                    </div>
                    <span className="text-[9px] font-black tracking-widest bg-slate-800/10 text-slate-800 px-2 py-0.5 rounded uppercase">KakaoTalk</span>
                </div>

                {/* Chat Message List */}
                <div className="p-6 md:p-8 space-y-6 max-h-[550px] overflow-y-auto">
                    {/* Review 1 */}
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="size-10 rounded-full bg-white border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-lg">
                            👤
                        </div>
                        <div className="space-y-1 max-w-[80%]">
                            <span className="block text-xs font-extrabold text-[#3a3a3a] pl-0.5">여행홀릭_김민정</span>
                            <div className="flex items-end gap-1.5">
                                <div className="bg-white text-slate-900 rounded-2xl rounded-tl-none px-4 py-3 text-[13px] leading-relaxed font-bold shadow-sm border border-white/50 text-left">
                                    이번에 처음 이용해봤는데, 기사님 너무 친절하시고 실내 주차장이라 확실히 차가 깨끗하네요! 사진까지 찍어 보내주셔서 안심했습니다. 👍
                                </div>
                                <span className="text-[9px] font-semibold text-slate-500 shrink-0 mb-1">오전 10:24</span>
                            </div>
                        </div>
                    </div>

                    {/* Review 2 */}
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="size-10 rounded-full bg-white border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-lg">
                            👤
                        </div>
                        <div className="space-y-1 max-w-[80%]">
                            <span className="block text-xs font-extrabold text-[#3a3a3a] pl-0.5">비즈니스맨_이준호</span>
                            <div className="flex items-end gap-1.5">
                                <div className="bg-white text-slate-900 rounded-2xl rounded-tl-none px-4 py-3 text-[13px] leading-relaxed font-bold shadow-sm border border-white/50 text-left">
                                    장기 출장이라 가격 고민했는데, 실외 주차 옵션 생겨서 너무 좋네요! 가성비 최고입니다. 다음에 또 이용할게요!
                                </div>
                                <span className="text-[9px] font-semibold text-slate-500 shrink-0 mb-1">오후 2:15</span>
                            </div>
                        </div>
                    </div>

                    {/* Review 3 */}
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="size-10 rounded-full bg-white border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-lg">
                            👤
                        </div>
                        <div className="space-y-1 max-w-[80%]">
                            <span className="block text-xs font-extrabold text-[#3a3a3a] pl-0.5">가족여행_박수진</span>
                            <div className="flex items-end gap-1.5">
                                <div className="bg-white text-slate-900 rounded-2xl rounded-tl-none px-4 py-3 text-[13px] leading-relaxed font-bold shadow-sm border border-white/50 text-left">
                                    아이들이 있어서 짐이 많았는데 제1터미널 바로 앞에서 픽업해주시니 정말 편했어요. 카톡 답변도 엄청 빠르시네요!
                                </div>
                                <span className="text-[9px] font-semibold text-slate-500 shrink-0 mb-1">오후 5:42</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mock Chat Footer */}
                <div className="bg-[#B2C7DA] border-t border-[#92A3B3]/25 px-5 py-3.5 flex gap-2 items-center">
                    <div className="flex-1 bg-white rounded-xl h-9 px-3 flex items-center justify-between text-slate-300 font-bold text-xs select-none shadow-inner border border-white/40">
                        <span>메시지를 입력하세요...</span>
                        <div className="size-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 text-[10px] font-black cursor-not-allowed">
                            ▲
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};


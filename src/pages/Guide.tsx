import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Phone, CheckCircle2, ChevronRight, Car, Key, MapPin } from 'lucide-react';
import { useSiteData } from '../lib/siteService';

export const Guide = () => {
    const { data: siteData, loading } = useSiteData();

    if (loading) return null;

    const guideData = siteData.guide || {
        outboundTitle: '출국 시 (인계 방법)',
        outboundSteps: [
            '인천공항 도착 15분 전 010-5353-4781로 전화를 주세요.',
            '각 터미널(T1, T2) 지정된 승하차 구역에서 기사님과 조인합니다.',
            '기사님과 차량 상태 확인 후 접수증을 수령하시고 즐겁게 출국하세요!'
        ],
        inboundTitle: '입국 시 (인도 방법)',
        inboundSteps: [
            '비행기 착륙 후 수하물을 찾으실 때 전화를 주세요.',
            '안내드리는 입국 층 게이트(지정구역)로 차량을 즉시 가져다 드립니다.',
            '차량 인도 받으시고 정해진 이용 요금을 결제하시면 완료!'
        ]
    };

    const phone = siteData.phone || '010-5353-4781';
    const reservationLink = siteData.reservationLink || '/reservation';

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen">
                {/* Header Banner */}
                <section className="bg-slate-900 py-20 px-4 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">
                        Service <span className="text-[#FFD500] not-italic">Guide</span>
                    </h2>
                    <p className="text-slate-400 font-bold">처음 이용하시는 분들을 위한 상세 이용 안내입니다.</p>
                </section>

                <div className="container mx-auto max-w-5xl py-24 px-4 space-y-24">
                    {/* Step 1: 출국시 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <span className="text-7xl font-black text-slate-100 absolute -translate-y-12 select-none">01</span>
                            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3 relative z-10">
                                <Car className="text-[#FFB800]" /> {guideData.outboundTitle || '출국 시 (인계 방법)'}
                            </h3>
                            <div className="space-y-8">
                                {(guideData.outboundSteps || []).map((step: string, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="bg-slate-900 text-white size-8 rounded-full flex items-center justify-center font-black shrink-0 text-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-slate-600 font-medium">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 md:order-2 bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100">
                             <img 
                                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?q=80&w=800&auto=format&fit=crop" 
                                alt="Departure" 
                                className="w-full h-64 object-cover rounded-[2rem]"
                            />
                        </div>
                    </div>

                    {/* Step 2: 입국시 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                         <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100">
                             <img 
                                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800&auto=format&fit=crop" 
                                alt="Arrival" 
                                className="w-full h-64 object-cover rounded-[2rem]"
                            />
                        </div>
                        <div className="space-y-6">
                            <span className="text-7xl font-black text-slate-100 absolute -translate-y-12 select-none">02</span>
                            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3 relative z-10">
                                <Key className="text-[#FFB800]" /> {guideData.inboundTitle || '입국 시 (인도 방법)'}
                            </h3>
                            <div className="space-y-8">
                                {(guideData.inboundSteps || []).map((step: string, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="bg-slate-900 text-white size-8 rounded-full flex items-center justify-center font-black shrink-0 text-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-slate-600 font-medium">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Banner */}
                    <div className="bg-[#FFD500] p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="space-y-2">
                            <h4 className="text-3xl font-black text-slate-900">도움이 필요하신가요?</h4>
                            <p className="text-slate-800 font-bold opacity-70">24시간 언제든 친절하게 상담해 드립니다.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                             <a href={`tel:${phone}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                                <Phone size={20} /> 실시간 전화 상담
                            </a>
                            <a href={reservationLink} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                                온라인 예약하기 <ChevronRight size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

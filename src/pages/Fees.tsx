import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Info, Calculator, CreditCard, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useSiteData } from '../lib/siteService';

export const Fees = () => {
    const { data: siteData, loading } = useSiteData();

    if (loading) return null;

    const getPriceForDays = (type: 'outdoor' | 'indoor', dayCount: number) => {
        let price = 40000;
        if (dayCount > 2) {
            const extraDays = dayCount - 2;
            if (type === 'outdoor') {
                price += extraDays * 5000;
            } else {
                price += extraDays * 10000;
            }
        }
        return price;
    };

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen">
                <section className="bg-slate-900 py-20 px-4 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">
                        Parking <span className="text-[#FFD500] not-italic">Fees</span>
                    </h2>
                    <p className="text-slate-400 font-bold">와와 주차대행의 합리적이고 투명한 요금 체계입니다.</p>
                </section>

                <div className="container mx-auto max-w-4xl py-24 px-4 space-y-16">
                    {/* Basic Fees Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-[#FFD500] p-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <Calculator size={24} /> 야외 / 실내 맞춤 주차 요금표
                            </h3>
                            <p className="text-slate-800 font-bold opacity-70 text-sm mt-1">인천공항 제1·2터미널 동일 요금 및 대리주차(발렛)비 무료 적용</p>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 w-1/3">주차 기간</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 w-1/3">야외 주차 요금</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-1/3">실내 주차 요금</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700 font-medium">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                                        <tr key={d} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 border-r border-slate-100 font-bold bg-slate-50/20">{d}일</td>
                                            <td className="p-4 border-r border-slate-100 font-black text-slate-950">{formatPrice(getPriceForDays('outdoor', d))}</td>
                                            <td className="p-4 font-black text-blue-600">{formatPrice(getPriceForDays('indoor', d))}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50/40">
                                        <td className="p-4 border-r border-slate-100 font-black text-slate-500 text-xs">11일 이후 (1일당)</td>
                                        <td className="p-4 border-r border-slate-100 font-black text-slate-400">+{formatPrice(5000)}</td>
                                        <td className="p-4 font-black text-blue-400">+{formatPrice(10000)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100 grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900">발렛 파킹 대행 무료 서비스!</p>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">입출차 시 기사님 대행료(발렛비)가 포함된 최종 요금입니다. 추가 대행료가 발생하지 않습니다.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                                <div className="bg-red-50 p-1.5 rounded-lg text-red-600 shrink-0 mt-0.5 animate-pulse">
                                    <Info size={16} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-red-600">새벽/야간 할증 안내</p>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                        <span className="font-bold text-slate-700">19:00 ~ 05:00</span> 사이 입고 또는 출고 시, <span className="font-bold text-red-600">각각 20,000원</span>의 야간 할증 요금이 적용됩니다. (입/출고 모두 야간 시간일 시 총 40,000원 적용)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                             <div className="bg-[#FFD500] size-12 rounded-2xl flex items-center justify-center">
                                <Sparkles size={24} className="text-slate-900" />
                             </div>
                             <h4 className="text-2xl font-black text-slate-900">프리미엄 세차 서비스</h4>
                             <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                여행 동안 더러워진 차를 깨끗하게! 프리미엄 손세차를 옵션으로 선택하실 수 있습니다. (예약 시 상담)
                             </p>
                             <div className="text-slate-900 font-black text-lg">별도 상담</div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                             <div className="bg-slate-900 size-12 rounded-2xl flex items-center justify-center">
                                <CreditCard size={24} className="text-[#FFD500]" />
                             </div>
                             <h4 className="text-2xl font-black text-slate-900">결제 안내</h4>
                             <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                현금 결제, 계좌 이체, 각종 신용카드 결제가 가능합니다. (카드 결제 시 부가세 별도)
                             </p>
                             <div className="text-slate-900 font-black text-lg">카드 가맹점</div>
                        </div>
                    </div>

                    <div className="text-center pt-8">
                         <a 
                            href={siteData.reservationLink} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#FFD500] text-slate-900 px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-yellow-100 hover:scale-105 transition-all"
                         >
                             지금 바로 예약하고 혜택 받기
                         </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
};


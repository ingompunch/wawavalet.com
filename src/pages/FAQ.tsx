import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChevronDown, HelpCircle, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSiteData } from '../lib/siteService';

export const FAQ = () => {
    const { data: siteData, loading } = useSiteData();
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    if (loading) return null;

    const faqsList = siteData.faqs || [];
    const phone = siteData.phone || '010-5353-4781';

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen">
                <section className="bg-slate-900 py-20 px-4 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">
                        Questions <span className="text-[#FFD500] not-italic">& Answers</span>
                    </h2>
                    <p className="text-slate-400 font-bold">궁금하신 점을 빠르게 해결해 드립니다.</p>
                </section>

                <div className="container mx-auto max-w-3xl py-24 px-4 space-y-4">
                    {faqsList.map((item: any, idx: number) => (
                        <div 
                            key={idx} 
                            className={cn(
                                "bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden",
                                openIdx === idx ? "border-[#FFD500] shadow-xl shadow-yellow-100/50" : "border-slate-100 shadow-sm"
                            )}
                        >
                            <button 
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full p-8 flex items-center justify-between text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "size-10 rounded-xl flex items-center justify-center transition-colors px-1",
                                        openIdx === idx ? "bg-[#FFD500] text-slate-900" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                    )}>
                                        <HelpCircle size={20} />
                                    </div>
                                    <span className="text-lg font-black text-slate-800">{item.q}</span>
                                </div>
                                <ChevronDown size={24} className={cn("text-slate-300 transition-transform duration-300", openIdx === idx && "rotate-180 text-slate-900")} />
                            </button>
                            <div className={cn(
                                "px-8 transition-all duration-300",
                                openIdx === idx ? "max-h-[300px] pb-8 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <div className="pl-14 text-slate-500 font-medium leading-relaxed">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-16 bg-slate-900 p-12 rounded-[3.5rem] text-center text-white space-y-6">
                        <h4 className="text-2xl font-black">찾으시는 답변이 없나요?</h4>
                        <p className="text-slate-400 font-medium">상담원이 24시간 실시간으로 답변해 드립니다.</p>
                        <a href={`tel:${phone}`} className="inline-flex items-center gap-3 bg-[#FFD500] text-slate-900 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-yellow-500/20">
                            <Phone size={24} /> {phone} 상담하기
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

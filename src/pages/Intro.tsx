import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Camera, MapPin, Shield, CheckCircle } from 'lucide-react';
import { useSiteData } from '../lib/siteService';

export const Intro = () => {
    const { data: siteData, loading } = useSiteData();

    if (loading) return null;

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen">
                {/* Header Banner */}
                <section className="bg-slate-900 py-20 px-4 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
                        PARKING <span className="text-[#FFD500] not-italic">SPACE</span>
                    </h2>
                    <p className="text-slate-400 font-bold">와와 주차대행의 쾌적한 실내 및 야외 주차 시설을 소개합니다.</p>
                </section>

                <div className="container mx-auto max-w-6xl py-20 px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                        <div className="space-y-6">
                            <div className="inline-block bg-[#FFD500] text-slate-900 px-4 py-1.5 rounded-full text-xs font-black tracking-widest">FACILITY</div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight whitespace-pre-wrap">
                                {siteData.intro.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">
                                {siteData.intro.content}
                            </p>
                             <ul className="space-y-3">
                                {(siteData.intro.bullets || [
                                    '100% 지능형 자가 주차 및 대리 주차 시스템',
                                    '사계절 적정 온도 및 습도 관리',
                                    '먼지 및 오염 방지를 위한 방진 바닥 설계',
                                    '전 구역 주차 라인 넉넉한 광폭 사이즈'
                                ]).map((item: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <CheckCircle size={14} className="text-green-500" /> {item}
                                    </li>
                                ))}
                             </ul>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-[#FFD500]/20 rounded-[3rem] blur-2xl group-hover:bg-[#FFD500]/40 transition-all" />
                            <img 
                                src="https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?q=80&w=1200&auto=format&fit=crop" 
                                alt="Parking Facility" 
                                className="relative z-10 w-full h-[400px] object-cover rounded-[2.5rem] shadow-2xl"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {(siteData.intro.features || [
                            { title: '화재 및 배상 책임', desc: '만일의 사고에 대비하여 삼성화재 대물/대인 배상 보험에 완벽 가입되어 있습니다.' },
                            { title: '24H CCTV 모니터링', desc: '사각지대 없는 CCTV 설치로 실시간 보안팀에서 24시간 철저하게 감시합니다.' },
                            { title: '최단거리 주차장', desc: '공항 터미널에서 5분 거리 내에 위치하여 빠르고 정확한 인계를 약속합니다.' }
                        ]).map((point: any, i: number) => {
                            const icons = [<Shield size={32} />, <Camera size={32} />, <MapPin size={32} />];
                            return (
                                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                                    <div className="text-[#FFD500]">{icons[i % 3]}</div>
                                    <h4 className="text-xl font-black text-slate-900">{point.title}</h4>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{point.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    );
};


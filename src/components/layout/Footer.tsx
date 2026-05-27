import React from 'react';
import { Car, MapPin, Phone, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFD500] p-1.5 rounded-lg">
                <Car size={20} className="text-slate-900" />
              </div>
              <span className="text-white font-black text-xl tracking-tighter">와와 주차대행</span>
            </div>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>상호: 와와 주차대행 | 대표: 김성근 | 사업자번호: 893-21-02268</p>
              <p>주소: 인천시 중구 운서동 3093-7</p>
              <p>고객센터: <span className="text-white font-bold text-lg">010-5353-4781</span> (365일 24시간 상담가능)</p>
              <p>탁송보험: 전직원 삼성화재/현대해상 보험 가입 완료</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest text-slate-500">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/intro" className="hover:text-[#FFD500] transition-colors">주차장소개</a></li>
              <li><a href="/guide" className="hover:text-[#FFD500] transition-colors">이용안내</a></li>
              <li><a href="/fees" className="hover:text-[#FFD500] transition-colors">주차요금</a></li>
              <li><a href="/reservation" className="hover:text-[#FFD500] transition-colors">온라인예약</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest text-slate-500">Safe Service</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <ShieldCheck size={16} className="text-[#FFD500] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-snug">현대해상/삼성화재 발렛보험 가입</p>
              </div>
              <div className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <MapPin size={16} className="text-[#FFD500] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-snug">실내·야외 전용 주차장 운영</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of use</a>
            <a href="#" className="hover:text-white">Insurance Policy</a>
          </div>
          <div className="text-center md:text-right">
            <p>© 2026 WAWA VALET. PREMIUM PARKING SERVICE.</p>
            <p className="normal-case mt-1 text-slate-600 font-medium text-[11px] tracking-normal">홈페이지 관리자 : Gom Ads</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

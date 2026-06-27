import React, { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, signOut } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getDoc,
  setDoc,
  doc, 
  onSnapshot
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  LogOut, 
  Save, 
  Home as HomeIcon,
  Info as InfoIcon,
  HelpCircle,
  CreditCard,
  Settings as SettingsIcon,
  Phone,
  Link as LinkIcon,
  Eye,
  CheckCircle2,
  List,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_SITE_DATA = {
  reservationLink: 'https://itcha.kr',
  phone: '010-5353-4781',
  home: {
    heroTitle: '와와 주차대행\n실내·야외 맞춤형 안심 주차',
    heroSub: '인천공항 안심 주차의 기준, 실내·야외 맞춤형 프리미엄 발렛.\nADT 캡스 철통 보안과 전직원 탁송 보험으로 가장 안전하게 모십니다.',
    bannerText: '"주차 후 차량사진, 계기판, 자동차키, 차량보관증을 문자, 카톡으로 전송해드립니다."',
    bannerSub: '공항 도착 30분전 전화주세요.'
  },
  intro: {
    title: '차를 아끼는 분들을 위한\n최상의 맞춤 주차 구역',
    content: '외부 오염물질, 기상 악화, 그리고 타인에 의한 문콕 사고로부터 고객님의 차량을 완벽하게 보호합니다. 와와 주차대행은 공항 인근 최신식 실내 주차 타워와 안전하게 확보된 야외 전용 주차장을 함께 제공합니다.',
    bullets: [
      '100% 지능형 자가 주차 및 대리 주차 시스템',
      '사계절 적정 온도 및 습도 관리',
      '먼지 및 오염 방지를 위한 방진 바닥 설계',
      '전 구역 주차 라인 넉넉한 광폭 사이즈'
    ],
    features: [
      { title: '화재 및 배상 책임', desc: '만일의 사고에 대비하여 삼성화재 대물/대인 배상 보험에 완벽 가입되어 있습니다.' },
      { title: '24H CCTV 모니터링', desc: '사각지대 없는 CCTV 설치로 실시간 보안팀에서 24시간 철저하게 감시합니다.' },
      { title: '최단거리 주차장', desc: '공항 터미널에서 5분 거리 내에 위치하여 빠르고 정확한 인계를 약속합니다.' }
    ]
  },
  guide: {
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
  },
  fees: {
    outdoorBasePrice: 40000,
    outdoorPlusDayPrice: 5000,
    indoorBasePrice: 40000,
    indoorPlusDayPrice: 10000,
    surcharge: 20000,
    surchargeStart: '19:00',
    surchargeEnd: '05:00',
  },
  faqs: [
    { 
      q: '예약은 언제까지 해야 하나요?', 
      a: '최소 하루 전까지는 예약을 권장드리며, 당일 예약도 가능하지만 성수기에는 주차장이 매진될 수 있으니 미리 예약하시는 것이 좋습니다.' 
    },
    { 
      q: '밤늦게 도착하거나 새벽에 출발해도 괜찮나요?', 
      a: '네, 저희는 365일 24시간 연중무휴로 운영됩니다. 비행기 연착으로 늦게 도착하셔도 직원이 상시 대기하고 있으니 걱정 마세요.' 
    },
    { 
      q: '보험 처리가 완벽히 되나요?', 
      a: '네, 전직원 삼성화재 및 현대해상 발렛 전용 보험에 가입되어 있습니다. 인계부터 인도까지 발생하는 모든 탁송 사고에 대해 완벽하게 보상해 드립니다.' 
    },
    { 
      q: '외부 차량 방치 걱정은 없나요?', 
      a: '와와 주차대행은 안전한 실내 주차타워와 전용 야외 차고지를 함께 운영하며, 고객님이 직접 선택하신 구역에 정직하게 주차됩니다. 또한 주차 완료 시점에 차량 계기판과 주차 구역 사진을 촬영하여 고객님 휴대폰 문자로 실시간 전송해 드리므로 타사의 야외 무단 주차 방치 등의 우려 없이 100% 안심하셔도 됩니다.' 
    },
    { 
      q: '결제는 언제 하는 건가요?', 
      a: '이용 요금은 여행 후 귀국하셔서 차량을 인도받으실 때 후불로 결제해 주시면 됩니다. 현금, 이체, 카드 모두 가능합니다.' 
    }
  ]
};

import { sanitizeSiteData } from '../lib/siteService';

export const Admin = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [siteData, setSiteData] = useState<any>(INITIAL_SITE_DATA);
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [reservations, setReservations] = useState<any[]>([]); // Keep keeping trace of reservations just in case

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && user.email === 'drive5746@gmail.com') {
            const fetchSiteData = async () => {
                try {
                    const docRef = doc(db, 'settings', 'site');
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setSiteData(sanitizeSiteData(docSnap.data()));
                    } else {
                        await setDoc(docRef, INITIAL_SITE_DATA);
                    }
                } catch (error) {
                    console.error("Admin fetch error:", error);
                }
            };
            fetchSiteData();
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'site'), siteData);
            alert('설정이 저장되었습니다!');
        } catch (error) {
            console.error(error);
            alert('저장 실패');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;

    if (!user || user.email !== 'drive5746@gmail.com') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 text-center space-y-8">
                    <div className="bg-[#FFD500] size-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/20">
                        <SettingsIcon size={40} className="text-slate-900" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white">와와 관리자 로그인</h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            홈페이지 콘텐츠 및 외부 노출 설정을 관리합니다.<br />
                            승인된 계정으로 로그인해 주세요.
                        </p>
                    </div>
                    <button 
                        onClick={signInWithGoogle}
                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95"
                    >
                         Google 로그인
                    </button>
                    <p className="text-xs text-slate-700 font-bold tracking-widest uppercase">WAWA CMS CONSOLE</p>
                </div>
            </div>
        )
    }

    const TABS = [
        { id: 'general', label: '기본 설정', icon: <SettingsIcon size={18} /> },
        { id: 'home', label: '메인 페이지', icon: <HomeIcon size={18} /> },
        { id: 'intro', label: '주차장 소개', icon: <InfoIcon size={18} /> },
        { id: 'guide', label: '이용 안내', icon: <List size={18} /> },
        { id: 'fees', label: '요금 안내', icon: <CreditCard size={18} /> },
        { id: 'faq', label: '자주하는 질문', icon: <HelpCircle size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-50 hidden lg:block font-sans">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="bg-[#FFD500] p-1 rounded-lg">
                            <SettingsIcon size={20} className="text-slate-900" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-white">WAWA CMS</span>
                    </div>
                    <nav className="space-y-2">
                        {TABS.map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left",
                                    activeTab === tab.id ? "bg-[#FFD500] text-slate-900 shadow-lg" : "text-slate-400 hover:text-white"
                                )}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="absolute bottom-0 w-full p-8 border-t border-slate-800">
                    <button 
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-xs"
                    >
                        <LogOut size={14} /> 로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-64 flex-1">
                <header className="bg-white h-20 flex items-center justify-between px-8 border-b border-slate-100 sticky top-0 z-40">
                    <h3 className="font-black text-xl text-slate-900">{TABS.find(t => t.id === activeTab)?.label} 수정</h3>
                    <div className="flex items-center gap-4">
                        <a href="/" target="_blank" className="text-slate-400 hover:text-slate-900 flex items-center gap-2 text-sm font-bold transition-colors">
                            <Eye size={16} /> 사이트 보기
                        </a>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-slate-900 text-[#FFD500] px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            <Save size={16} /> {isSaving ? '저장 중...' : '변경사항 저장'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-4xl">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {activeTab === 'general' && (
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                                    <h4 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-6 flex items-center gap-2 font-mono">
                                        <LinkIcon size={14} /> GLOBAL SETTINGS
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-900 pl-1">외부 예약 링크(예: 잇차 등)</label>
                                        <p className="text-xs text-slate-400 font-medium pl-1 mb-2">모든 온라인 예약 버튼이 이 링크로 리다이렉트됩니다.</p>
                                        <input 
                                            type="url" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                            value={siteData.reservationLink}
                                            onChange={(e) => setSiteData({...siteData, reservationLink: e.target.value})}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-900 pl-1">전화 상담 번호</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                            value={siteData.phone || '010-5353-4781'}
                                            onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'home' && (
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                                    <h4 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-6 flex items-center gap-2 font-mono">
                                        <HomeIcon size={14} /> MAIN HERO SECTION
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-900 pl-1">메인 타이틀 (\n으로 줄바꿈)</label>
                                        <textarea 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500] h-32"
                                            value={siteData.home.heroTitle}
                                            onChange={(e) => setSiteData({...siteData, home: {...siteData.home, heroTitle: e.target.value}})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-900 pl-1">메인 서브 문구</label>
                                        <textarea 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500] h-32"
                                            value={siteData.home.heroSub}
                                            onChange={(e) => setSiteData({...siteData, home: {...siteData.home, heroSub: e.target.value}})}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-900 pl-1">중간 배너 강조 문구</label>
                                            <input 
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                value={siteData.home.bannerText}
                                                onChange={(e) => setSiteData({...siteData, home: {...siteData.home, bannerText: e.target.value}})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-900 pl-1">중간 배너 서브 문구</label>
                                            <input 
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                value={siteData.home.bannerSub}
                                                onChange={(e) => setSiteData({...siteData, home: {...siteData.home, bannerSub: e.target.value}})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                             {activeTab === 'intro' && (
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                                    <h4 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-6 flex items-center gap-2 font-mono">
                                        <InfoIcon size={14} /> INTRO CONTENT
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-900 pl-1">소개 섹션 타이틀 (\n으로 줄바꿈 가능)</label>
                                        <textarea 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500] h-28"
                                            value={siteData.intro.title}
                                            onChange={(e) => setSiteData({...siteData, intro: {...siteData.intro, title: e.target.value}})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-900 pl-1">소개 섹션 본문</label>
                                        <textarea 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500] h-48"
                                            value={siteData.intro.content}
                                            onChange={(e) => setSiteData({...siteData, intro: {...siteData.intro, content: e.target.value}})}
                                        />
                                    </div>

                                    {/* Bullets Manager */}
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-black text-slate-800 pl-1">주요 포인트 체크리스트</label>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const bullets = [...(siteData.intro.bullets || [])];
                                                    bullets.push('새로운 포인트 내용을 입력해 주세요.');
                                                    setSiteData({...siteData, intro: {...siteData.intro, bullets}});
                                                }}
                                                className="bg-slate-900 text-[#FFD500] px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm"
                                            >
                                                <Plus size={12} /> 추가
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(siteData.intro.bullets || []).map((bullet: string, idx: number) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        type="text"
                                                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                        value={bullet || ''}
                                                        onChange={(e) => {
                                                            const bullets = [...siteData.intro.bullets];
                                                            bullets[idx] = e.target.value;
                                                            setSiteData({...siteData, intro: {...siteData.intro, bullets}});
                                                        }}
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const bullets = siteData.intro.bullets.filter((_: any, i: number) => i !== idx);
                                                            setSiteData({...siteData, intro: {...siteData.intro, bullets}});
                                                        }}
                                                        className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features Manager */}
                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                        <label className="text-sm font-black text-slate-800 pl-1 block">보안/관리 특장점 (3개 고정 카드)</label>
                                        <div className="space-y-6">
                                            {(siteData.intro.features || []).map((feat: any, idx: number) => (
                                                <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                                    <p className="text-xs font-bold text-slate-400">특징 카드 #{idx + 1}</p>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-600 pl-1">카드 제목</label>
                                                        <input 
                                                            type="text"
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                            value={feat.title || ''}
                                                            onChange={(e) => {
                                                                const features = [...siteData.intro.features];
                                                                features[idx] = { ...features[idx], title: e.target.value };
                                                                setSiteData({...siteData, intro: {...siteData.intro, features}});
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-600 pl-1">상세 설명</label>
                                                        <textarea 
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500] h-16"
                                                            value={feat.desc || ''}
                                                            onChange={(e) => {
                                                                const features = [...siteData.intro.features];
                                                                features[idx] = { ...features[idx], desc: e.target.value };
                                                                setSiteData({...siteData, intro: {...siteData.intro, features}});
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'guide' && (
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
                                    <h4 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-6 flex items-center gap-2 font-mono">
                                        <List size={14} /> SERVICE GUIDE SETTINGS
                                    </h4>

                                    {/* Outbound guide (출국) */}
                                    <div className="space-y-6">
                                        <p className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">1단계: 출국 시 (인계 방법)</p>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-600 pl-1">섹션 타이틀</label>
                                                <input 
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.guide?.outboundTitle || '출국 시 (인계 방법)'}
                                                    onChange={(e) => {
                                                        const guide = siteData.guide || { outboundTitle: '', outboundSteps: [], inboundTitle: '', inboundSteps: [] };
                                                        setSiteData({...siteData, guide: { ...guide, outboundTitle: e.target.value }});
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-black text-slate-600 pl-1">상세 절차 목록 (단계별 설명)</label>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const guide = siteData.guide || { outboundTitle: '', outboundSteps: [], inboundTitle: '', inboundSteps: [] };
                                                            const outboundSteps = [...(guide.outboundSteps || [])];
                                                            outboundSteps.push('출국 단계 내용을 입력해 주세요.');
                                                            setSiteData({...siteData, guide: { ...guide, outboundSteps }});
                                                        }}
                                                        className="bg-slate-900 text-[#FFD500] px-3 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-sm"
                                                    >
                                                        <Plus size={11} /> 1단계 추가
                                                    </button>
                                                </div>

                                                {((siteData.guide?.outboundSteps) || []).map((step: string, idx: number) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <span className="flex items-center justify-center bg-slate-900 text-white rounded-xl size-10 font-bold shrink-0 text-sm">
                                                            {idx + 1}
                                                        </span>
                                                        <input 
                                                            type="text"
                                                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                            value={step || ''}
                                                            onChange={(e) => {
                                                                const guide = siteData.guide;
                                                                const outboundSteps = [...guide.outboundSteps];
                                                                outboundSteps[idx] = e.target.value;
                                                                setSiteData({...siteData, guide: { ...guide, outboundSteps }});
                                                            }}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const guide = siteData.guide;
                                                                const outboundSteps = guide.outboundSteps.filter((_: any, i: number) => i !== idx);
                                                                setSiteData({...siteData, guide: { ...guide, outboundSteps }});
                                                            }}
                                                            className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors shrink-0"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inbound guide (입국) */}
                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                        <p className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">2단계: 입국 시 (인도 방법)</p>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-600 pl-1">섹션 타이틀</label>
                                                <input 
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.guide?.inboundTitle || '입국 시 (인도 방법)'}
                                                    onChange={(e) => {
                                                        const guide = siteData.guide || { outboundTitle: '', outboundSteps: [], inboundTitle: '', inboundSteps: [] };
                                                        setSiteData({...siteData, guide: { ...guide, inboundTitle: e.target.value }});
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-black text-slate-600 pl-1">상세 절차 목록 (단계별 설명)</label>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const guide = siteData.guide || { outboundTitle: '', outboundSteps: [], inboundTitle: '', inboundSteps: [] };
                                                            const inboundSteps = [...(guide.inboundSteps || [])];
                                                            inboundSteps.push('입국 단계 내용을 입력해 주세요.');
                                                            setSiteData({...siteData, guide: { ...guide, inboundSteps }});
                                                        }}
                                                        className="bg-slate-900 text-[#FFD500] px-3 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-sm"
                                                    >
                                                        <Plus size={11} /> 1단계 추가
                                                    </button>
                                                </div>

                                                {((siteData.guide?.inboundSteps) || []).map((step: string, idx: number) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <span className="flex items-center justify-center bg-slate-900 text-white rounded-xl size-10 font-bold shrink-0 text-sm">
                                                            {idx + 1}
                                                        </span>
                                                        <input 
                                                            type="text"
                                                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                            value={step || ''}
                                                            onChange={(e) => {
                                                                const guide = siteData.guide;
                                                                const inboundSteps = [...guide.inboundSteps];
                                                                inboundSteps[idx] = e.target.value;
                                                                setSiteData({...siteData, guide: { ...guide, inboundSteps }});
                                                            }}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const guide = siteData.guide;
                                                                const inboundSteps = guide.inboundSteps.filter((_: any, i: number) => i !== idx);
                                                                setSiteData({...siteData, guide: { ...guide, inboundSteps }});
                                                            }}
                                                            className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors shrink-0"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'fees' && (
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
                                    <h4 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-6 flex items-center gap-2 font-mono">
                                        <CreditCard size={14} /> PRICING LOGIC
                                    </h4>
                                    
                                    <div className="space-y-6">
                                        <p className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">야외 주차 요금 체계</p>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">야외 기본 요금 (1~2일 총액)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.outdoorBasePrice ?? 40000}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            outdoorBasePrice: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">야외 추가 요금 (3일째부터 1일당)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.outdoorPlusDayPrice ?? 5000}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            outdoorPlusDayPrice: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-2">
                                        <p className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">실내 주차 요금 체계</p>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">실내 기본 요금 (1~2일 총액)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.indoorBasePrice ?? 40000}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            indoorBasePrice: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">실내 추가 요금 (3일째부터 1일당)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.indoorPlusDayPrice ?? 10000}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            indoorPlusDayPrice: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6 ">
                                        <p className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">심야/새벽 할증 요금 (입출차 시간 기준)</p>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">할증 금액 (1회당)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.surcharge ?? 20000}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            surcharge: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">시작 시간</label>
                                                <input 
                                                    type="time"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.surchargeStart ?? '19:00'}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            surchargeStart: e.target.value
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pl-1">종료 시간</label>
                                                <input 
                                                    type="time"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                    value={siteData.fees.surchargeEnd ?? '05:00'}
                                                    onChange={(e) => setSiteData({
                                                        ...siteData, 
                                                        fees: {
                                                            ...(siteData.fees || {}), 
                                                            surchargeEnd: e.target.value
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium">* 입차 또는 출차 시간이 설정된 범위 내에 있을 경우 각각 할증이 적용됩니다.</p>
                                    </div>

                                    <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
                                        <CheckCircle2 size={24} className="text-yellow-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-black text-slate-900">요금 로직 자동 안내</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">입력된 값이 사이트 내의 "요금 계산기"와 "요금표"에 실시간으로 반영됩니다.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faq' && (
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <h4 className="text-slate-400 font-black text-xs tracking-widest uppercase flex items-center gap-2 font-mono">
                                            <HelpCircle size={14} /> FREQUENTLY ASKED QUESTIONS
                                        </h4>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const faqs = [...(siteData.faqs || [])];
                                                faqs.push({ q: '새 인터뷰 질문을 적어주세요.', a: '상세 답변 내용을 여기에 작성해 주세요.' });
                                                setSiteData({...siteData, faqs});
                                            }}
                                            className="bg-slate-900 text-[#FFD500] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                                        >
                                            <Plus size={14} /> 새 질문 추가
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {((siteData.faqs) || []).map((faq: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 relative group">
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-[#FFD500] text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                        Q&A #{idx + 1}
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const faqs = siteData.faqs.filter((_: any, i: number) => i !== idx);
                                                            setSiteData({...siteData, faqs});
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1"
                                                    >
                                                        <Trash2 size={13} /> 삭제
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-600 pl-1">질문 (Question)</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500]"
                                                        value={faq.q || ''}
                                                        onChange={(e) => {
                                                            const faqs = [...siteData.faqs];
                                                            faqs[idx] = { ...faqs[idx], q: e.target.value };
                                                            setSiteData({...siteData, faqs});
                                                        }}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-600 pl-1">답변 (Answer)</label>
                                                    <textarea 
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD500] h-28 leading-relaxed"
                                                        value={faq.a || ''}
                                                        onChange={(e) => {
                                                            const faqs = [...siteData.faqs];
                                                            faqs[idx] = { ...faqs[idx], a: e.target.value };
                                                            setSiteData({...siteData, faqs});
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {(!siteData.faqs || siteData.faqs.length === 0) && (
                                            <div className="text-center py-12 text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                등록된 자주하는 질문이 없습니다. 상단 우측 버튼을 눌러 질문을 추가해 주세요!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};


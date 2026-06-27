import { db } from './firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export const INITIAL_SITE_DATA = {
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

export function sanitizeSiteData(data: any): any {
  if (!data) return INITIAL_SITE_DATA;
  const cleaned = { ...data };
  
  if (!cleaned.home) cleaned.home = { ...INITIAL_SITE_DATA.home };
  if (!cleaned.intro) cleaned.intro = { ...INITIAL_SITE_DATA.intro };
  if (!cleaned.guide) cleaned.guide = { ...INITIAL_SITE_DATA.guide };
  if (!cleaned.fees) cleaned.fees = { ...INITIAL_SITE_DATA.fees };
  if (!cleaned.faqs) cleaned.faqs = [ ...INITIAL_SITE_DATA.faqs ];

  if (!cleaned.intro.bullets) cleaned.intro.bullets = [ ...INITIAL_SITE_DATA.intro.bullets ];
  if (!cleaned.intro.features) cleaned.intro.features = [ ...INITIAL_SITE_DATA.intro.features ];

  // Sanitize the heroTitle if it contains outdated claims
  if (!cleaned.home.heroTitle || cleaned.home.heroTitle.includes('100% 실내') || cleaned.home.heroTitle.includes('실내 명당')) {
    cleaned.home.heroTitle = INITIAL_SITE_DATA.home.heroTitle;
  }

  // Sanitize the heroSub if it contains outdated claims
  if (!cleaned.home.heroSub || cleaned.home.heroSub.includes('100% 실내') || cleaned.home.heroSub.includes('야외 방치 걱정 없는')) {
    cleaned.home.heroSub = INITIAL_SITE_DATA.home.heroSub;
  }

  // Sanitize banner text and subtiltes to avoid misleading slogans
  if (!cleaned.home.bannerText || 
      cleaned.home.bannerText.includes('야외 주차 시') || 
      cleaned.home.bannerText.includes('이용요금 100% 환불') || 
      cleaned.home.bannerText.includes('100% 환불') || 
      cleaned.home.bannerText.includes('약속된 주차 구역')) {
    cleaned.home.bannerText = INITIAL_SITE_DATA.home.bannerText;
  }

  if (!cleaned.home.bannerSub || 
      cleaned.home.bannerSub.includes('야외 주차') || 
      cleaned.home.bannerSub.includes('선택하고 예약하신') || 
      cleaned.home.bannerSub.includes('환불') || 
      cleaned.home.bannerSub.includes('유형대로 정확히')) {
    cleaned.home.bannerSub = INITIAL_SITE_DATA.home.bannerSub;
  }

  // Ensure phone number is fully corrected even if loaded from old DB records
  if (!cleaned.phone || cleaned.phone === '010-2556-5746' || cleaned.phone === '010-1234-5678' || cleaned.phone === '010-9389-0966') {
    cleaned.phone = '010-5353-4781';
  }

  return cleaned;
}

export function useSiteData() {
  const [data, setData] = useState<any>(INITIAL_SITE_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setData(sanitizeSiteData(doc.data()));
      } else {
        setData(INITIAL_SITE_DATA);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Site data fetch error (falling back to initial site data):", error.message || error);
      setData(INITIAL_SITE_DATA);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { data, loading };
}

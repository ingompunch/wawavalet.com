import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X, Car } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteData } from '../../lib/siteService';

const NAV_ITEMS = [
  { name: '주차장소개', path: '/intro' },
  { name: '이용안내', path: '/guide' },
  { name: '주차요금', path: '/fees' },
  { name: '온라인예약', path: '/reservation' },
  { name: '자주하는질문', path: '/faq' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { data: siteData } = useSiteData();

  const resLink = siteData.reservationLink || '/reservation';
  const phone = siteData.phone || '010-5353-4781';
  const isExternalRes = resLink.startsWith('http');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-16 md:h-20 flex items-center">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#FFD500] p-1 md:p-2 rounded-lg md:rounded-xl shadow-sm group-hover:rotate-6 transition-transform">
            <Car className="text-slate-900 size-[18px] md:size-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-black text-base md:text-2xl text-slate-900 tracking-tighter leading-none">
              와와 <span className="text-[#FFB800]">주차대행</span>
            </h1>
            <p className="text-[9px] md:text-[11px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">
              INCHEON AIRPORT VALET
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {NAV_ITEMS.map((item) => {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-[15px] font-bold transition-all hover:text-slate-900 relative py-1",
                    location.pathname === item.path ? "text-slate-900" : "text-slate-500"
                  )}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FFD500]" 
                    />
                  )}
                </Link>
              );
          })}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-black hover:bg-[#FFD500] hover:text-slate-900 transition-all shadow-lg shadow-slate-200"
          >
            <Phone size={16} /> {phone}
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-16 bg-white z-40 lg:hidden p-6 flex flex-col gap-6"
          >
            {NAV_ITEMS.map((item) => {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-black text-slate-800 border-b border-slate-50 pb-4 flex justify-between items-center"
                >
                  {item.name}
                  <div className="size-2 rounded-full bg-[#FFD500]" />
                </Link>
              );
            })}
            <div className="mt-auto space-y-4">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-3 bg-[#FFD500] text-slate-900 py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-100"
              >
                <Phone size={24} /> {phone}
              </a>
              <p className="text-center text-slate-400 text-xs font-bold">
                인천공항 1·2터미널 전직원 탁송보험 가입업체
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

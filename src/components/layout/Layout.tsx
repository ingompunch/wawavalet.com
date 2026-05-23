import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#FFD500] selection:text-slate-900">
      <Header />
      <main className="pt-16 md:pt-20 min-h-[calc(100vh-80px)]">
        {children}
      </main>
      <Footer />
      
      {/* Floating Quick Bar */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <motion.a 
          href="tel:010-5353-4781"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-slate-900 text-[#FFD500] p-4 rounded-full shadow-2xl shadow-slate-400 flex items-center justify-center group"
          title="상담전화"
        >
          <Phone size={28} className="group-hover:animate-shake" />
        </motion.a>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

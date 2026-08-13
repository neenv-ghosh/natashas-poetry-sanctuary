import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Feather, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onComplete();
      }, 700);
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1c1917] text-[#f5f2eb] px-6 select-none overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 45%, rgba(180, 83, 9, 0.15), rgba(28, 25, 23, 0.98))',
          }}
        >
          {/* Subtle paper grain texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d6c7b2_1px,transparent_1px)] [background-size:16px_16px]" />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center text-center max-w-xl"
          >
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-700/40 flex items-center justify-center text-amber-300 shadow-2xl backdrop-blur-sm"
              >
                <Feather className="w-8 h-8 stroke-[1.5]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-1 -right-1 text-amber-400"
              >
                <Sparkles className="w-5 h-5 fill-amber-400/20" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="font-serif text-5xl md:text-6xl tracking-[0.25em] text-[#f7e7ce] font-light mb-4 font-['Cinzel',serif]"
            >
              PALIMPSEST
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="h-[1px] bg-amber-600/50 mb-6"
            />

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.85 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="font-serif italic text-lg md:text-xl text-[#d6c7b2] tracking-wide max-w-md font-['Cormorant_Garamond',serif]"
            >
              "A manuscript that never stops being written."
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.6, duration: 1 }}
              className="mt-12 flex items-center gap-2 text-xs uppercase tracking-widest text-amber-200/60 font-sans"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Living Manuscript Studio</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

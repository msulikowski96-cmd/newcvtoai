import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, FileText, FileEdit, MessageSquare, ArrowRight, Play } from 'lucide-react';

interface PromoAnimationProps {
  onClose: () => void;
}

export const PromoAnimation: React.FC<PromoAnimationProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= 3) {
          clearInterval(timer);
          return 3;
        }
        return prev + 1;
      });
    }, 3500); // 3.5s per slide

    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
    center: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)', zIndex: 0 },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="scene1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/30"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold tracking-widest uppercase mb-6 border border-red-500/20"
              >
                Problem
              </motion.div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold text-white text-center leading-tight mb-4"
              >
                Wysyłasz <span className="text-red-500">setki</span> <br /> CV...
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl md:text-2xl text-zinc-400 font-medium"
              >
                i wciąż słyszysz ciszę?
              </motion.p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="scene2"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-blue-950/20 to-zinc-900"
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20"
              >
                <Sparkles size={48} className="text-white" />
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-blue-400 text-sm font-bold tracking-[0.2em] uppercase mb-4"
              >
                Poznaj
              </motion.div>
              
              <motion.h2 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white mb-6"
              >
                CvToAI
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg md:text-xl text-zinc-400 max-w-md text-center leading-relaxed"
              >
                Twój osobisty asystent kariery napędzany sztuczną inteligencją.
              </motion.p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="scene3"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-purple-950/20"></div>
              
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
              >
                Zdominuj <span className="text-indigo-400">rekrutację</span>
              </motion.h2>

              <div className="grid gap-4 w-full max-w-md px-6">
                {[
                  { icon: FileText, title: "Analiza CV", desc: "AI znajdzie luki i poprawi profil", color: "bg-blue-500" },
                  { icon: FileEdit, title: "Listy Motywacyjne", desc: "Generowane pod ogłoszenia", color: "bg-purple-500" },
                  { icon: MessageSquare, title: "Trening Rozmów", desc: "Symulacje i pytania rekrutacyjne", color: "bg-pink-500" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + (i * 0.15) }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-sm text-zinc-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="scene4"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600"
            >
              <motion.h2 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl md:text-7xl font-bold text-white text-center leading-tight mb-12"
              >
                Zdobądź <br />
                pracę <br />
                marzeń.
              </motion.h2>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="group px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-xl shadow-xl flex items-center gap-3 hover:bg-blue-50 transition-colors"
              >
                Sprawdź CvToAI
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-50">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, ArrowUpRight } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onComplete, reduceMotion ? 500 : 1800);
    return () => clearTimeout(timer);
  }, [onComplete, reduceMotion]);

  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
    >
      <motion.div
        className="splash-content"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <motion.div
          className="splash-logo"
          animate={reduceMotion ? {} : { rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <BrainCircuit size={38} strokeWidth={1.8} />
        </motion.div>

        <h1 className="splash-title">
          Career Navigator<span>.</span>
        </h1>

        <p className="splash-subtitle">
          Your career. Your intelligence. Your future.
        </p>

        <div className="splash-progress">
          <motion.div
            className="splash-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: reduceMotion ? 0.4 : 1.5, ease: 'easeInOut' }}
          />
        </div>

        <div className="splash-footer">
          <span>INITIALIZING YOUR FUTURE</span>
          <ArrowUpRight size={16} />
        </div>
      </motion.div>

      <motion.div
        className="splash-decoration splash-decoration-one"
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="splash-decoration splash-decoration-two"
        animate={reduceMotion ? {} : { y: [0, -14, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

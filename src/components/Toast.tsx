import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useFavorites();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-900/95 border border-emerald-500/30 text-white shadow-2xl backdrop-blur-md"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium text-zinc-100">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

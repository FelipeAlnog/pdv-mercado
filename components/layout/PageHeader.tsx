'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePageHeaderStore } from '@/store/usePageHeaderStore';
import { Header } from './Header';

export function PageHeader() {
  const { title, subtitle, actions } = usePageHeaderStore();

  return (
    <AnimatePresence mode="popLayout">
      {title && (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-8"
        >
          <Header title={title} subtitle={subtitle} actions={actions} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

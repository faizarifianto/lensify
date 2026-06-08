import { AnimatePresence, motion } from 'framer-motion'
import useLoadingStore from '../../store/loadingStore'
import Loader from './Loader'

const GlobalLoader = () => {
  const { isLoading, message } = useLoadingStore()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-all"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-surface/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-black/50 flex flex-col items-center gap-6 border border-white/10 min-w-[280px]"
          >
            <Loader />
            {message && (
              <p className="text-on-surface font-label-bold mt-2 animate-pulse tracking-widest uppercase text-xs">
                {message}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalLoader

import { AnimatePresence, motion } from "framer-motion";

function AlertsOverlay({ alerts }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            className={`pointer-events-auto rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur ${alert.tone}`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em]">{alert.label}</div>
            <div className="mt-2 text-sm text-white">{alert.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AlertsOverlay;

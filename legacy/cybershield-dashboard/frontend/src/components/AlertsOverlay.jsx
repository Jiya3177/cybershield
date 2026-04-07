import { AnimatePresence, motion } from "framer-motion";

function AlertsOverlay({ alerts, onDismiss }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className={`rounded-2xl border px-4 py-4 shadow-xl backdrop-blur ${alert.tone}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em]">{alert.label}</div>
                <div className="mt-2 text-sm text-white">{alert.message}</div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AlertsOverlay;

import { motion } from "framer-motion";

function LiveEventFeed({ events }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Live Event Feed</h2>
          <p className="text-sm text-cyber-muted">Real-time security telemetry and automated responses.</p>
        </div>
        <div className="rounded-full border border-cyber-primary/30 bg-cyber-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyber-primary">
          Streaming
        </div>
      </div>

      <div className="max-h-[22rem] space-y-3 overflow-auto pr-1">
        {events.length ? (
          events.map((event, index) => (
            <div
              key={`${event.timestamp}-${event.message}-${index}`}
              className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    [{event.timeLabel}]
                  </div>
                  <div className="mt-1 text-sm text-slate-100">{event.message}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${event.tone}`}>
                  {event.level}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 px-4 py-6 text-center text-sm text-cyber-muted">
            Awaiting event stream from CyberShield.
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default LiveEventFeed;

import { motion } from "framer-motion";

function ThreatIntelPanel({ topIps, topAttackTypes }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Threat Intelligence</h2>
        <p className="text-sm text-cyber-muted">Top attacking IPs, dominant attack types, and per-source risk.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyber-muted">Top Attacking IPs</div>
          <div className="space-y-3">
            {topIps.length ? (
              topIps.map((item) => (
                <div key={item.ip} className="flex items-center justify-between gap-3 rounded-2xl border border-cyber-border px-3 py-3">
                  <div>
                    <div className="font-mono text-sm text-cyan-300">{item.ip}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.events} events</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${item.tone}`}>
                    Risk {item.risk}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-cyber-muted">No hostile IPs identified yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyber-muted">Common Attack Types</div>
          <div className="space-y-3">
            {topAttackTypes.map((item) => (
              <div key={item.type} className="rounded-2xl border border-cyber-border px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold capitalize text-white">{item.label}</span>
                  <span className="text-sm text-cyan-300">{item.count}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyber-primary to-cyan-400" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default ThreatIntelPanel;

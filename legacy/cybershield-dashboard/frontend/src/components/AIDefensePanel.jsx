import { motion } from "framer-motion";

function AIDefensePanel({ state }) {
  const recentActions = state.recent_actions || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">AI Defense Panel</h2>
        <p className="text-sm text-cyber-muted">Autonomous response actions and decision reasoning.</p>
      </div>

      <div className="rounded-2xl border border-cyber-primary/20 bg-cyber-primary/10 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-cyber-muted">Latest AI Decision</div>
        <div className="mt-2 text-2xl font-bold text-white">{state.recommended_action || "monitor_traffic"}</div>
        <div className="mt-2 text-sm text-slate-300">{state.last_decision_reason || "Awaiting AI guidance."}</div>
        <div className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-300">
          Interval {state.ai_interval_seconds || 3}s
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {recentActions.length ? (
          [...recentActions].reverse().map((action, index) => (
            <div key={`${action.timestamp}-${action.action}-${index}`} className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{action.action}</span>
                <span className="text-xs text-cyber-muted">
                  {new Date(action.timestamp * 1000).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                {action.target ? `Target: ${action.target}` : "Autonomous defense action executed."}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 px-4 py-6 text-center text-sm text-cyber-muted">
            No AI action history yet.
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default AIDefensePanel;

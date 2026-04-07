import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function SettingsPanel({ profile, cumulativeScore, latestReward, onSave, isSaving }) {
  const [agentName, setAgentName] = useState(profile?.agent_name || "CyberShield Sentinel");
  const [chartContrast, setChartContrast] = useState(profile?.display_preferences?.high_contrast_charts ? "high" : "standard");
  const [compactMode, setCompactMode] = useState(Boolean(profile?.display_preferences?.compact_mode));

  useEffect(() => {
    setAgentName(profile?.agent_name || "CyberShield Sentinel");
    setChartContrast(profile?.display_preferences?.high_contrast_charts ? "high" : "standard");
    setCompactMode(Boolean(profile?.display_preferences?.compact_mode));
  }, [profile]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      agent_name: agentName,
      display_preferences: {
        high_contrast_charts: chartContrast === "high",
        compact_mode: compactMode,
        map_focus: "india"
      }
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Account & Settings</h2>
        <p className="text-sm text-cyber-muted">Adjust agent identity, display preferences, and review score.</p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-cyber-muted">Cumulative Score</div>
          <div className="mt-2 text-2xl font-bold text-white">{Number(cumulativeScore || 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-cyber-muted">Latest Reward</div>
          <div className="mt-2 text-2xl font-bold text-cyber-primary">{Number(latestReward || 0).toFixed(2)}</div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-cyber-muted">Agent Name</span>
          <input
            value={agentName}
            onChange={(event) => setAgentName(event.target.value)}
            className="w-full rounded-2xl border border-cyber-border bg-cyber-panelAlt/70 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyber-primary/60"
            placeholder="CyberShield Sentinel"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-cyber-muted">Chart Clarity</span>
          <select
            value={chartContrast}
            onChange={(event) => setChartContrast(event.target.value)}
            className="w-full rounded-2xl border border-cyber-border bg-cyber-panelAlt/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyber-primary/60"
          >
            <option value="high">High Contrast</option>
            <option value="standard">Standard</option>
          </select>
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-white">Compact Layout</span>
            <span className="mt-1 block text-xs text-cyber-muted">Tighten panel spacing for dense SOC views.</span>
          </span>
          <input type="checkbox" checked={compactMode} onChange={(event) => setCompactMode(event.target.checked)} className="h-5 w-5" />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl border border-cyber-primary/30 bg-cyber-primary/10 px-4 py-3 text-sm font-semibold text-cyber-primary transition hover:bg-cyber-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </motion.section>
  );
}

export default SettingsPanel;

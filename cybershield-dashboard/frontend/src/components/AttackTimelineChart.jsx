import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function AttackTimelineChart({ data }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Attack Timeline</h2>
        <p className="text-sm text-cyber-muted">Observed attacks per minute across the monitored environment.</p>
      </div>
      <div className="h-72 rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="minute" tick={{ fill: "#cbd5e1", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(56,189,248,0.18)",
                borderRadius: "16px",
                color: "#fff"
              }}
            />
            <Line
              type="monotone"
              dataKey="attacks"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 3, fill: "#22c55e" }}
              activeDot={{ r: 6, fill: "#38bdf8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

export default AttackTimelineChart;

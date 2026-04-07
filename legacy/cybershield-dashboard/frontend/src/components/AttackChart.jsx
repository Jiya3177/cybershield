import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const colors = {
  ddos: "#ef4444",
  malware: "#f59e0b",
  phishing: "#22c55e",
  data_exfiltration: "#38bdf8"
};

function AttackChart({ data, highContrast = true }) {
  const xTick = highContrast ? { fill: "#f8fafc", fontSize: 13, fontWeight: 700 } : { fill: "#cbd5e1", fontSize: 12, fontWeight: 600 };
  const yTick = highContrast ? { fill: "#f1f5f9", fontSize: 13, fontWeight: 700 } : { fill: "#cbd5e1", fontSize: 12, fontWeight: 600 };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-3xl border border-cyber-border bg-cyber-panel p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Attack Type Chart</h2>
        <p className="text-sm text-cyber-muted">Current distribution across major threat categories.</p>
      </div>

      <div className="h-72 rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={xTick}
              tickMargin={10}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={yTick}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(56, 189, 248, 0.18)",
                borderRadius: "16px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600
              }}
            />
            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={colors[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

export default AttackChart;

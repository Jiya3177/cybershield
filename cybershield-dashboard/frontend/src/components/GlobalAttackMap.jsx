import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function GlobalAttackMap({ markers }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Global Attack Map</h2>
        <p className="text-sm text-cyber-muted">Approximate geospatial view of hostile source activity.</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-[#0b1222] p-3">
        <ComposableMap projectionConfig={{ scale: 145 }} className="h-[280px] w-full">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#172033"
                  stroke="rgba(148,163,184,0.18)"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1f2d49", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map((marker) => (
            <Marker key={`${marker.ip}-${marker.coordinates.join("-")}`} coordinates={marker.coordinates}>
              <g>
                <circle r={5 + marker.weight} fill={marker.color} fillOpacity={0.3} />
                <circle r={2.8} fill={marker.color} />
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </motion.section>
  );
}

export default GlobalAttackMap;

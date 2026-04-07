import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function GlobalAttackMap({ markers }) {
  const [selectedRegion, setSelectedRegion] = useState("India Core Region");
  const [selectedIp, setSelectedIp] = useState(null);
  const markerCountByRegion = useMemo(() => {
    return markers.reduce((accumulator, marker) => {
      accumulator[marker.region] = (accumulator[marker.region] || 0) + 1;
      return accumulator;
    }, {});
  }, [markers]);

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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-2xl border border-cyber-border bg-[#0b1222] p-3">
          <ComposableMap projection="geoMercator" projectionConfig={{ center: [78, 22], scale: 380 }} className="h-[320px] w-full">
            <ZoomableGroup center={[78, 22]} zoom={2.25}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={selectedRegion === geo.properties.name ? "#20304f" : "#172033"}
                      stroke="rgba(148,163,184,0.18)"
                      onClick={() => setSelectedRegion(geo.properties.name)}
                      style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: { fill: "#1f2d49", outline: "none", cursor: "pointer" },
                        pressed: { outline: "none" }
                      }}
                    />
                  ))
                }
              </Geographies>

              {markers.map((marker) => (
                <Marker
                  key={`${marker.ip}-${marker.coordinates.join("-")}`}
                  coordinates={marker.coordinates}
                  onClick={() => {
                    setSelectedRegion(marker.region);
                    setSelectedIp(marker.ip);
                  }}
                >
                  <g className="cursor-pointer">
                    <circle r={5 + marker.weight} fill={marker.color} fillOpacity={0.28} />
                    <circle r={3} fill={marker.color} />
                  </g>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyber-muted">Region Focus</div>
          <div className="mt-2 text-lg font-bold text-white">{selectedRegion}</div>
          <div className="mt-1 text-sm text-slate-400">
            {selectedIp ? `Selected source ${selectedIp}` : "Click a marker or country to inspect activity."}
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(markerCountByRegion).map(([region, count]) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition ${
                  selectedRegion === region
                    ? "border-cyber-primary/40 bg-cyber-primary/10 text-white"
                    : "border-cyber-border bg-[#0d162a] text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>{region}</span>
                <span className="text-cyan-300">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default GlobalAttackMap;

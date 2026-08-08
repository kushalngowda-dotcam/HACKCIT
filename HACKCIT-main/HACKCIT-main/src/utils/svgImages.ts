// High-quality standalone SVG Data URIs for disaster evidence photos (100% offline & network reliable)

export const DISASTER_IMAGES = {
  buildingCollapse: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="smoke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#475569" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#94a3b8" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <!-- Background Sky -->
      <rect width="800" height="500" fill="url(#sky)"/>
      
      <!-- Distant City Silhouette -->
      <rect x="50" y="200" width="120" height="250" fill="#0f172a" opacity="0.6"/>
      <rect x="200" y="150" width="90" height="300" fill="#0f172a" opacity="0.6"/>
      <rect x="600" y="180" width="150" height="270" fill="#0f172a" opacity="0.6"/>
      
      <!-- Collapsed Building Structure -->
      <path d="M 300 450 L 320 220 L 460 250 L 520 450 Z" fill="#64748b"/>
      <!-- Structural Fractures & Cracks -->
      <path d="M 330 250 L 380 340 L 350 420" stroke="#0f172a" stroke-width="6" fill="none"/>
      <path d="M 420 270 L 450 360 L 490 440" stroke="#0f172a" stroke-width="6" fill="none"/>

      <!-- Fallen Debris Piles -->
      <polygon points="250,450 380,380 480,450" fill="#475569"/>
      <polygon points="420,450 550,390 650,450" fill="#334155"/>
      <polygon points="180,450 310,410 390,450" fill="#64748b"/>

      <!-- Dust & Smoke Clouds -->
      <circle cx="380" cy="320" r="90" fill="url(#smoke)"/>
      <circle cx="460" cy="300" r="110" fill="url(#smoke)"/>
      <circle cx="300" cy="360" r="70" fill="url(#smoke)"/>

      <!-- Caution Warning Overlay Banner -->
      <rect x="0" y="0" width="800" height="40" fill="#dc2626"/>
      <text x="400" y="26" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="2">
        ⚠️ CRITICAL STRUCTURAL BREACH EVACUATION ZONE
      </text>
    </svg>
  `)}`,

  urbanFlooding: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="floodWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
        <linearGradient id="stormSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#stormSky)"/>
      
      <!-- Submerged City Buildings -->
      <rect x="80" y="120" width="140" height="300" fill="#0f172a"/>
      <rect x="260" y="160" width="180" height="260" fill="#1e293b"/>
      <rect x="520" y="100" width="160" height="320" fill="#0f172a"/>
      
      <!-- Flood Surface Waves -->
      <path d="M 0 320 Q 200 300 400 320 T 800 320 L 800 500 L 0 500 Z" fill="url(#floodWater)" opacity="0.95"/>
      <path d="M 0 350 Q 200 370 400 350 T 800 350 L 800 500 L 0 500 Z" fill="#0284c7" opacity="0.6"/>

      <!-- Submerged Vehicle Roof -->
      <rect x="320" y="310" width="110" height="25" rx="8" fill="#ef4444"/>
      <circle cx="350" cy="335" r="12" fill="#0f172a"/>
      <circle cx="400" cy="335" r="12" fill="#0f172a"/>

      <!-- Flood Surge Waves Details -->
      <path d="M 50 360 C 150 340, 250 380, 350 360" stroke="#e0f2fe" stroke-width="4" fill="none" opacity="0.8"/>
      <path d="M 450 380 C 550 360, 650 400, 750 380" stroke="#e0f2fe" stroke-width="4" fill="none" opacity="0.8"/>

      <rect x="0" y="0" width="800" height="40" fill="#0284c7"/>
      <text x="400" y="26" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="2">
        🌊 FLASH FLOOD INUNDATION ALARM (WATER DEPTH > 4.5FT)
      </text>
    </svg>
  `)}`,

  chemicalLeak: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="toxicCloud" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#84cc16" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#15803d" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#0f172a"/>
      
      <!-- Factory Tanks -->
      <rect x="150" y="200" width="160" height="250" rx="20" fill="#334155"/>
      <rect x="350" y="180" width="140" height="270" rx="20" fill="#475569"/>
      
      <!-- Leak Pipe Breach -->
      <path d="M 310 280 L 360 280" stroke="#f59e0b" stroke-width="12"/>

      <!-- Plume Toxic Gas Clouds -->
      <circle cx="360" cy="240" r="80" fill="url(#toxicCloud)"/>
      <circle cx="440" cy="190" r="110" fill="url(#toxicCloud)"/>
      <circle cx="540" cy="140" r="140" fill="url(#toxicCloud)"/>
      <circle cx="660" cy="100" r="160" fill="url(#toxicCloud)"/>

      <!-- Biohazard Icon Overlay -->
      <g transform="translate(620, 360) scale(1.5)">
        <circle cx="0" cy="0" r="40" fill="#f59e0b"/>
        <text x="0" y="10" fill="#000000" font-family="sans-serif" font-size="32" font-weight="bold" text-anchor="middle">☣️</text>
      </g>

      <rect x="0" y="0" width="800" height="40" fill="#d97706"/>
      <text x="400" y="26" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="2">
        ☣️ HAZMAT TOXIC VAPOR PLUME CONTAINMENT ZONE
      </text>
    </svg>
  `)}`,

  landslide: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#1e293b"/>
      <!-- Mountain Slope -->
      <polygon points="0,50 500,500 0,500" fill="#78350f"/>
      <polygon points="0,150 400,500 0,500" fill="#92400e"/>
      
      <!-- Mud Slip Debris -->
      <path d="M 120 180 Q 300 350 480 480 L 600 500 L 0 500 Z" fill="#b45309" opacity="0.9"/>
      
      <!-- Boulders -->
      <circle cx="280" cy="340" r="30" fill="#451a03"/>
      <circle cx="340" cy="380" r="45" fill="#78350f"/>
      <circle cx="420" cy="420" r="25" fill="#451a03"/>

      <!-- Blocked Highway -->
      <rect x="350" y="440" width="450" height="40" fill="#334155"/>
      <line x1="350" y1="460" x2="800" y2="460" stroke="#f59e0b" stroke-width="4" stroke-dasharray="20,20"/>

      <rect x="0" y="0" width="800" height="40" fill="#b45309"/>
      <text x="400" y="26" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="2">
        ⛰️ LANDSLIDE MOUNTAIN ROAD BLOCKAGE ACTIVE
      </text>
    </svg>
  `)}`,

  powerGrid: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#0f172a"/>
      
      <!-- Electrical Substation Towers -->
      <path d="M 200 450 L 260 150 L 320 450 M 220 250 L 300 250 M 230 350 L 290 350" stroke="#94a3b8" stroke-width="6" fill="none"/>
      <path d="M 500 450 L 560 180 L 620 450 M 520 280 L 600 280" stroke="#94a3b8" stroke-width="6" fill="none"/>

      <!-- Transformer Fire & Electrical Arc Glow -->
      <circle cx="260" cy="220" r="90" fill="#ef4444" opacity="0.3"/>
      <circle cx="260" cy="220" r="50" fill="#f59e0b" opacity="0.6"/>
      <polygon points="260,120 240,220 270,220 250,300" fill="#38bdf8"/>

      <rect x="0" y="0" width="800" height="40" fill="#dc2626"/>
      <text x="400" y="26" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="2">
        ⚡ SUBSTATION TRANSFORMER FIRE & BLACKOUT WARNING
      </text>
    </svg>
  `)}`
};

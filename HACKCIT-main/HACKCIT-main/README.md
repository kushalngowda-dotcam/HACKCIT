# DisasterX AI — Production-Ready Real-Time Emergency Response Platform

DisasterX AI is a production-ready, real-time emergency operations platform built with React, Vite, TypeScript, Tailwind CSS, Supabase, and Gemini AI.

## Environment Variables Configuration

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Supabase Configuration (Realtime database persistence)
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Gemini AI Configuration (AI Vision, NLP report classification, & EOC Copilot)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Graceful Degradation
- **Without Supabase keys**: The app operates in a clean local-only mode with a clear `Local-only` indicator.
- **Without Gemini API key**: AI features surface clear "AI Unavailable" notifications guiding operators to add `VITE_GEMINI_API_KEY`, without application crashes or fabricated fallback data.

---

## Key Features

1. **Production Database & Real-Time Sync**: No hardcoded mock data initializers. All state comes from and syncs with Supabase (`app_state` table). Edits in one browser tab instantaneously reflect in other open browser tabs.
2. **Browser GPS & Nominatim Reverse Geocoding**: Incident reporting immediately requests browser Geolocation coordinates (`navigator.geolocation`) and queries Nominatim OpenStreetMap API to auto-fill human-readable addresses.
3. **Multi-Agency Command Center**: Interactive Leaflet emergency map, priority scoring engine, resource dispatch optimization, evacuation corridors, and responder telemetry portals.
4. **AI Emergency Classifier & Copilot**: Multi-modal report interpretation powered by Google Gemini API.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Production Build & Verification

```bash
# Type check and build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## Testing Real-Time & GPS Flows

### 1. Testing Real-Time Multi-Browser Sync
1. Open two separate browser tabs or windows side-by-side pointing to `http://localhost:5173`.
2. Click **Report Incident** in Tab 1 and submit a new emergency report.
3. Observe Tab 2 instantly update with the newly registered incident and broadcast alert in real-time via Supabase subscription.

### 2. Testing Live GPS Incident Reporting
1. Click **Report Incident** or **Citizen Portal -> Voice Report**.
2. Allow browser location access when prompted.
3. The modal auto-captures your exact latitude/longitude and populates street name via Nominatim.
4. Click **Recenter GPS** to refresh position or edit the address manually as an override.
5. Submit the report and view your exact GPS pin rendered on the **Command Map**.

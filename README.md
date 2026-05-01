# Technogym Dashboard

A personal fitness dashboard that parses your Technogym export ZIP and renders interactive charts. Runs as a web app and Android APK from a single React Native / Expo codebase. All data stays on your device — no account, no server.

## Features

### Overview Tab
- **Stat cards** — Gym Visits, Avg Visits/Week, Avg Cal/Visit, current Weight
- **Gym Visits chart** — distinct indoor training days per week/month
- **Activity Breakdown** — calories by type (Strength / Cardio / Rowing / Outdoor)
- **Training Load** — total active minutes per period
- **Intensity (MetsMin)** — metabolic load per period

### Biometrics Tab
- **Trend line** — any single body metric over time (Weight, BMI, Fat Mass, Muscle Mass, etc.)
- **Body Composition snapshot** — Fat / Muscle / Bone stacked bar

### Workouts Tab
- **Calories Burned** — indoor vs outdoor stacked bar
- **Weight Lifted** — total kg across strength sessions (Total / Avg per session toggle)
- **Cardio Distance** — km covered per period

### Cardio Tab
- **Distance** — km per period (Total / Avg per session toggle)
- **Calories Burned** — cardio-only kcal (Total / Avg per session toggle)
- **Avg Pace** — min:sec per km (green = fastest period)
- **Elevation Gain** — total meters climbed per period

### Strength Tab
- **Total Weight Lifted** — kg per period (Total / Avg per session toggle)
- **Rowing Performance** — distance and avg power per period (Avg per session / Total toggle)

### Filters (all tabs)
- Date range presets: 30d / 3m / 6m / 1y / All
- Activity type multi-select: Strength / Cardio / Rowing / Outdoor
- Granularity: Weekly / Monthly

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Install
```bash
cd technogym-dashboard
npm install
```

### Run (web)
```bash
npx expo start --web
# Opens at http://localhost:8081
```

Upload your Technogym export ZIP via the file picker. The app parses it client-side — nothing is uploaded anywhere.

---

## Getting Your Data

1. Open the Technogym app → Profile → Settings → Export Data
2. You'll receive a ZIP file by email
3. Open the web app or Android APK and select the ZIP

---

## Android APK

### EAS Cloud Build (recommended)
```bash
eas build --platform android --profile preview
# Produces a downloadable APK — install directly on your phone
# Free tier: 30 builds/month
```

### Local Build (Android Studio)
```bash
# Regenerate native folder after package or app.json changes
npx expo prebuild --platform android --clean
# Open ./android in Android Studio
# Build → Build Bundle(s) / APK(s) → Build APK(s)
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Tech Stack

| Package | Purpose |
|---|---|
| Expo + TypeScript | Cross-platform framework |
| Expo Router | File-based tab navigation |
| NativeWind v4 | Tailwind CSS in React Native |
| react-native-gifted-charts | Bar and line charts (pure RN) |
| JSZip | Client-side ZIP parsing |
| Zustand | Global state |
| AsyncStorage | Persists parsed data between sessions |

---

## Project Structure

```
app/(tabs)/         # Tab screens (index, biometrics, workouts, cardio, strength)
src/
  components/
    charts/         # One component per chart — receives plain data, no parsing
    filters/        # FilterBar
    ui/             # StatCard, SectionHeader, MetricSelector
  hooks/
    useFilteredData.ts   # All data hooks — filtering, grouping, aggregation
  lib/
    parsers/        # Raw JSON → domain types (masterdata, biometrics, indoor, outdoor)
    zip.ts          # Platform-aware ZIP extraction
    utils.ts        # Date helpers, groupBy, barDims
    normalize.ts    # Orchestrates all parsers into AppData
  store/
    appStore.ts     # Zustand store — data, filters, load status
  types/
    domain.ts       # Activity, BiometricEntry, FilterState, etc.
    raw.ts          # Raw JSON shapes from Technogym export
```

---

## Architecture Rules

1. No business logic in React components — keep it in `src/lib/` and `src/hooks/`
2. Chart components receive plain data arrays; no parsing inside charts
3. All data hooks live in `useFilteredData.ts`
4. Business logic layer is pure TypeScript (no RN imports)
5. File reading is platform-aware: web uses `fetch(uri)` → ArrayBuffer; native uses `expo-file-system/legacy` → base64

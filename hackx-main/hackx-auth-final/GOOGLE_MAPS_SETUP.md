# 🔍 Google Maps Integration - Setup Guide

## ✅ What's Been Added

I've integrated **real Google Maps** into your "Find Medicine Nearby" page with:
- ✅ Real-time user geolocation access
- ✅ Interactive Google Maps with pharmacy markers
- ✅ Distance calculation using Haversine formula
- ✅ Click on markers to see pharmacy details
- ✅ Auto-sort pharmacies by distance from user
- ✅ Color-coded markers (green = in stock, red = out of stock)

## 📋 Setup Steps

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geolocation API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key (starts with `AIzaSy...`)

### Step 2: Add API Key to `.env.local`

Open `.env.local` and replace the placeholder:

```env
# ─── Google Maps (Nearby Medical Stores) ────────────────────────────────────
GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

⚠️ **Important**: Both variables must be set!

### Step 3: Add GPS Coordinates to Your Pharmacies

Your existing pharmacies need latitude/longitude coordinates. You have two options:

#### Option A: Use the Script (Recommended)

1. Edit `scripts/add-pharmacy-coordinates.js`
2. Update the `pharmacyCoordinates` array with your actual pharmacy names and GPS coordinates
3. To get coordinates:
   - Go to [Google Maps](https://www.google.com/maps)
   - Right-click on a pharmacy location
   - Click the coordinates (e.g., `30.3782, 76.3641`) to copy them
4. Run the script:

```bash
node scripts/add-pharmacy-coordinates.js
```

#### Option B: Manual Update via Database

Use MongoDB Compass or mongo shell to add `lat` and `lng` fields:

```javascript
db.pharmacists.updateOne(
  { storeName: "Nabha Medical Store" },
  { $set: { lat: 30.3782, lng: 76.3641 } }
)
```

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

### Step 5: Test the Feature

1. Login as a patient
2. Go to **"Find Medicine Nearby"**
3. **Allow location access** when browser prompts
4. You should see:
   - Real Google Maps with your location (blue dot)
   - Pharmacy markers on the map
   - Click markers to see pharmacy info
   - Results sorted by distance

## 🗺️ How It Works

```
User Location (GPS) 
    ↓
Calculate Distance → Sort by Nearest
    ↓
Show on Google Maps with Markers
    ↓
Click Marker → See Details
```

## 🎯 Features Added

| Feature | Description |
|---------|-------------|
| **Real Geolocation** | Gets user's actual GPS coordinates |
| **Interactive Map** | Full Google Maps with zoom, pan |
| **Smart Markers** | Color-coded by stock availability |
| **Info Windows** | Click markers to see pharmacy details |
| **Auto Distance** | Calculates real distance using Haversine formula |
| **Nearest First** | Automatically sorts pharmacies by distance |

## 🔧 Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Make sure APIs are enabled in Google Cloud Console

### "Location access denied"?
- Browser will show a prompt - click **Allow**
- If denied, page still works but shows default location
- You can enable location in browser settings

### Pharmacies not showing on map?
- Check if pharmacies have `lat` and `lng` fields in database
- Run: `node scripts/add-pharmacy-coordinates.js`
- Verify coordinates are valid numbers

### Distance showing as 0?
- Make sure both user location AND pharmacy coordinates are set
- Check API endpoint returns `distanceKm` field

## 📂 Files Modified/Created

| File | Purpose |
|------|---------|
| `components/GoogleMapsLoader.tsx` | Loads Google Maps script |
| `components/GoogleMap.tsx` | Map component with markers |
| `app/medicine/page.tsx` | Updated medicine page with real map |
| `app/api/pharmacist/route.ts` | Added distance calculation |
| `models/index.ts` | Added lat/lng to Pharmacist model |
| `scripts/add-pharmacy-coordinates.js` | Script to add GPS coords |
| `.env.local` | Added Google Maps API keys |

## 🚀 Next Steps

To make this production-ready:
1. Add pharmacy coordinates via MongoDB admin panel
2. Let pharmacists update their location during registration
3. Add "Get Directions" button linking to Google Maps navigation
4. Enable Places API for autocomplete address search

---

**Need help?** Check the browser console for detailed error logs!

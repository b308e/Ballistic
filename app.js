(function(){
'use strict';

const i18n = {
  de: {
    app_sub: 'Der Sniper', nav_home: 'Start', nav_weapons: 'Waffen', nav_ball: 'Ballistik', nav_geo: 'Geo', nav_setup: 'Setup',
    title_home: 'Übersicht', title_weapons: 'Waffen', title_ball: 'Ballistik-Rechner', title_setup: 'Setup', title_geo: 'Standort-Liste',
    lbl_caliber: 'Kaliber', lbl_mv: 'Mündungsgeschwindigkeit', lbl_bc: 'Ballistischer Koeffizient (G1)',
    lbl_weight: 'Geschossgewicht (Grain)', lbl_lat: 'Breitengrad (°)', lbl_az: 'Schussrichtung (Azimut 0-360°)',
    lbl_slope: 'Höhenwinkel (°)', btn_save: 'Speichern', btn_calc: 'Berechnen',
    lbl_temp: 'Temperatur', lbl_press: 'Luftdruck', lbl_hum: 'Feuchtigkeit (%)', lbl_da: 'Dichtehöhe',
    lbl_barrel: 'Lauflänge', lbl_twist: 'Dralllänge (z.B. 11 für 1:11)',
    lbl_ammo_select: 'Munition wählen', lbl_ammo_custom: 'Eigene Laborierung',
    lbl_weapon_select: 'Waffe auswählen', lbl_weapon_manual: '— Manuelle Eingabe —',
    lbl_units: 'Einheiten', lbl_graph: 'Flugbahn-Vergleich (Relativ zur Visierlinie)',
    lbl_compare: 'Munition 2 (Vergleich)', lbl_choose_geo: 'Ort auswählen',
    lbl_zero_cond: 'Einschieß-Bedingungen (abweichend)', lbl_zero_temp: 'Zero Temp', lbl_zero_press: 'Zero Druck', lbl_zero_hum: 'Zero Feuchte'
  },
  en: {
    app_sub: 'The Sniper', nav_home: 'Home', nav_weapons: 'Weapons', nav_ball: 'Ballistics', nav_geo: 'Geo', nav_setup: 'Setup',
    title_home: 'Overview', title_weapons: 'Weapons', title_ball: 'Ballistics', title_setup: 'Settings', title_geo: 'Location List',
    lbl_caliber: 'Caliber', lbl_mv: 'Muzzle Velocity', lbl_bc: 'Ballistic Coefficient (G1)',
    lbl_weight: 'Bullet Weight (Grain)', lbl_lat: 'Latitude (°)', lbl_az: 'Heading (Azimuth 0-360°)',
    lbl_slope: 'Slope Angle (°)', btn_save: 'Save', btn_calc: 'Calculate',
    lbl_temp: 'Temperature', lbl_press: 'Pressure', lbl_hum: 'Humidity (%)', lbl_da: 'Density Altitude',
    lbl_barrel: 'Barrel Length', lbl_twist: 'Twist Rate (e.g. 11 for 1:11)',
    lbl_ammo_select: 'Select Ammo', lbl_ammo_custom: 'Custom Load',
    lbl_weapon_select: 'Select Weapon', lbl_weapon_manual: '— Manual Input —',
    lbl_units: 'Units', lbl_graph: 'Trajectory Comparison (Relative to LOS)',
    lbl_compare: 'Ammo 2 (Compare)', lbl_choose_geo: 'Select Location',
    lbl_zero_cond: 'Zero Conditions (Different)', lbl_zero_temp: 'Zero Temp', lbl_zero_press: 'Zero Press', lbl_zero_hum: 'Zero Hum'
  }
};

const AMMO_DB = {
  ".17 HMR": { calMm: 4.3, data: [{ brand: "Hornady", name: "V-Max 17gr", weight: 17, bc: 0.125, mv: 770 }] },
  ".22 LR": { calMm: 5.6, data: [
    { brand: "RWS", name: "Rifle Match", weight: 40, bc: 0.130, mv: 330 },
    { brand: "S&B", name: "Club", weight: 40, bc: 0.120, mv: 320 },
    { brand: "Lapua", name: "Center-X", weight: 40, bc: 0.131, mv: 328 }
  ]},
  ".22 WMR": { calMm: 5.6, data: [{ brand: "Hornady", name: "V-Max 30gr", weight: 30, bc: 0.110, mv: 670 }] },
  ".223 Rem": { calMm: 5.7, data: [
    { brand: "Hornady", name: "V-Max 55gr", weight: 55, bc: 0.255, mv: 990 },
    { brand: "Hornady", name: "BTHP 75gr", weight: 75, bc: 0.395, mv: 850 },
    { brand: "S&B", name: "FMJ 55gr", weight: 55, bc: 0.230, mv: 950 },
    { brand: "RWS", name: "Match 69gr", weight: 69, bc: 0.345, mv: 850 },
    { brand: "Federal", name: "Gold Medal 77gr", weight: 77, bc: 0.420, mv: 840 },
    { brand: "Lapua", name: "Scenar 69gr", weight: 69, bc: 0.340, mv: 860 }
  ]},
  ".22-250 Rem": { calMm: 5.7, data: [{ brand: "Hornady", name: "V-Max 55gr", weight: 55, bc: 0.255, mv: 1100 }] },
  ".243 Win": { calMm: 6.2, data: [
    { brand: "RWS", name: "Tig 74gr", weight: 74, bc: 0.280, mv: 960 },
    { brand: "Hornady", name: "SST 95gr", weight: 95, bc: 0.355, mv: 910 },
    { brand: "S&B", name: "SP 100gr", weight: 100, bc: 0.330, mv: 870 }
  ]},
  "6.5 Creedmoor": { calMm: 6.5, data: [
    { brand: "Hornady", name: "ELD-M 140gr", weight: 140, bc: 0.646, mv: 830 },
    { brand: "Hornady", name: "ELD-X 143gr", weight: 143, bc: 0.625, mv: 820 },
    { brand: "S&B", name: "Tactical 140gr", weight: 140, bc: 0.580, mv: 810 },
    { brand: "RWS", name: "Target 139gr", weight: 139, bc: 0.550, mv: 830 },
    { brand: "Lapua", name: "Scenar 136gr", weight: 136, bc: 0.545, mv: 840 },
    { brand: "Federal", name: "Gold Medal 140gr", weight: 140, bc: 0.610, mv: 825 }
  ]},
  "6.5 PRC": { calMm: 6.5, data: [{ brand: "Hornady", name: "ELD-M 147gr", weight: 147, bc: 0.697, mv: 890 }] },
  "6.5x55 SE": { calMm: 6.5, data: [
    { brand: "S&B", name: "SP 140gr", weight: 140, bc: 0.490, mv: 800 },
    { brand: "Norma", name: "Diamond 130gr", weight: 130, bc: 0.450, mv: 840 },
    { brand: "Lapua", name: "Scenar 139gr", weight: 139, bc: 0.520, mv: 810 }
  ]},
  ".270 Win": { calMm: 7.0, data: [
    { brand: "Remington", name: "Core-Lokt 130gr", weight: 130, bc: 0.336, mv: 930 },
    { brand: "RWS", name: "Cineshot 130gr", weight: 130, bc: 0.380, mv: 910 }
  ]},
  "7mm Rem Mag": { calMm: 7.2, data: [{ brand: "Hornady", name: "ELD-X 162gr", weight: 162, bc: 0.630, mv: 930 }] },
  "7x64": { calMm: 7.2, data: [
    { brand: "RWS", name: "KS 162gr", weight: 162, bc: 0.330, mv: 850 },
    { brand: "S&B", name: "SPCE 173gr", weight: 173, bc: 0.312, mv: 790 }
  ]},
  ".308 Win": { calMm: 7.82, data: [
    { brand: "Hornady", name: "ELD-M 168gr", weight: 168, bc: 0.523, mv: 820 },
    { brand: "Hornady", name: "BTHP 168gr", weight: 168, bc: 0.462, mv: 810 },
    { brand: "S&B", name: "Match 168gr", weight: 168, bc: 0.490, mv: 800 },
    { brand: "RWS", name: "Target Match 168gr", weight: 168, bc: 0.480, mv: 810 },
    { brand: "Topshot", name: "Target 168gr", weight: 168, bc: 0.450, mv: 800 },
    { brand: "Geco", name: "Target 168gr", weight: 168, bc: 0.470, mv: 805 },
    { brand: "Federal", name: "Gold Medal 175gr", weight: 175, bc: 0.505, mv: 790 },
    { brand: "Lapua", name: "Scenar 167gr", weight: 167, bc: 0.470, mv: 810 }
  ]},
  ".30-06 Sprg": { calMm: 7.82, data: [
    { brand: "RWS", name: "Evolution 184gr", weight: 184, bc: 0.380, mv: 840 },
    { brand: "S&B", name: "SP 180gr", weight: 180, bc: 0.350, mv: 810 },
    { brand: "Hornady", name: "SST 150gr", weight: 150, bc: 0.415, mv: 890 }
  ]},
  ".300 Win Mag": { calMm: 7.82, data: [
    { brand: "Hornady", name: "ELD-M 208gr", weight: 208, bc: 0.670, mv: 880 },
    { brand: "RWS", name: "Speed Tip 170gr", weight: 170, bc: 0.420, mv: 940 },
    { brand: "S&B", name: "Match 190gr", weight: 190, bc: 0.550, mv: 860 }
  ]},
  ".338 Lapua Mag": { calMm: 8.6, data: [
    { brand: "Hornady", name: "ELD-M 285gr", weight: 285, bc: 0.789, mv: 850 },
    { brand: "S&B", name: "FMJ 250gr", weight: 250, bc: 0.620, mv: 900 },
    { brand: "Lapua", name: "Scenar 250gr", weight: 250, bc: 0.675, mv: 900 }
  ]},
  "9mm Luger": { calMm: 9.0, data: [
    { brand: "S&B", name: "Schütte 115gr", weight: 115, bc: 0.150, mv: 340 },
    { brand: "Hornady", name: "XTP 124gr", weight: 124, bc: 0.165, mv: 320 },
    { brand: "Geco", name: "FMJ 124gr", weight: 124, bc: 0.155, mv: 335 }
  ]}
};

const GEO_LIST = [
  { country: "Deutschland", city: "Berlin", lat: 52.52 }, { country: "Deutschland", city: "Hamburg", lat: 53.55 },
  { country: "Deutschland", city: "München", lat: 48.14 }, { country: "Deutschland", city: "Köln", lat: 50.94 },
  { country: "Deutschland", city: "Frankfurt", lat: 50.11 }, { country: "Deutschland", city: "Stuttgart", lat: 48.78 },
  { country: "Deutschland", city: "Leipzig", lat: 51.34 }, { country: "Deutschland", city: "Dresden", lat: 51.05 },
  { country: "Deutschland", city: "Hannover", lat: 52.37 }, { country: "Deutschland", city: "Nürnberg", lat: 49.45 },
  { country: "Deutschland", city: "Bremen", lat: 53.08 }, { country: "Deutschland", city: "Rostock", lat: 54.09 },
  { country: "Österreich", city: "Wien", lat: 48.21 }, { country: "Österreich", city: "Graz", lat: 47.07 },
  { country: "Österreich", city: "Linz", lat: 48.30 }, { country: "Österreich", city: "Salzburg", lat: 47.81 },
  { country: "Schweiz", city: "Zürich", lat: 47.37 }, { country: "Schweiz", city: "Bern", lat: 46.95 },
  { country: "Schweiz", city: "Basel", lat: 47.56 }, { country: "Schweiz", city: "Genf", lat: 46.20 },
  { country: "USA", city: "New York", lat: 40.71 }, { country: "USA", city: "Los Angeles", lat: 34.05 },
  { country: "USA", city: "Chicago", lat: 41.88 }, { country: "USA", city: "Houston", lat: 29.76 }
];

const INFO_DB = {
  bc: { title: "Ballistischer Koeffizient (BC)", text: "Beschreibt, wie gut ein Geschoss die Luft durchschneidet. Ein höherer Wert bedeutet weniger Luftwiderstand, flachere Flugbahn und weniger Windanfälligkeit.", link: "https://de.wikipedia.org/wiki/Ballistischer_Koeffizient" },
  coriolis: { title: "Corioliskraft (Horizontal)", text: "Die Erdrotation lenkt das Geschoss ab. Auf der Nordhalbkugel driftet es leicht nach rechts, auf der Südhalbkugel nach links. Bei 1000m sind das oft nur wenige Zentimeter.", link: "https://de.wikipedia.org/wiki/Corioliskraft" },
  eotvos: { title: "Eötvös-Effekt (Vertikal)", text: "Durch die Erdrotation wirkt beim Schuss nach Osten eine etwas geringere Schwerkraft (Geschoss fällt weniger), beim Schuss nach Westen eine höhere (fällt mehr). Bei 1000m macht das ca. 5-10 cm aus.", link: "https://de.wikipedia.org/wiki/E%C3%B6tv%C3%B6s-Effekt" },
  spin: { title: "Spin Drift", text: "Durch die Rotation des Geschosses im Flug (Kreiselphysik) wandert es auf weite Distanzen leicht in Drallrichtung ab. Wird oft erst ab 600m relevant.", link: "https://de.wikipedia.org/wiki/Magnus-Effekt" },
  slope: { title: "Höhenwinkel (Rifleman's Rule)", text: "Beim Schießen bergauf oder bergab wirkt die Schwerkraft nur mit dem Kosinus des Winkels. Die effektive Distanz ist kürzer als die gemessene. Ein Schuss bergauf fällt weniger.", link: "https://de.wikipedia.org/wiki/Schuss_(Waffe)" },
  da: { title: "Dichtehöhe (Density Altitude)", text: "Fasst Temperatur, Luftdruck und Luftfeuchtigkeit zusammen. Eine hohe Dichtehöhe (z.B. Sommer) bedeutet dünnere Luft -> das Geschoss fliegt weiter. Im Winter ist die Dichtehöhe niedriger -> mehr Luftwiderstand.", link: "https://de.wikipedia.org/wiki/Dichteh%C3%B6he" },
  zero_cond: { title: "Einschieß-Bedingungen", text: "Wenn du deine Waffe bei 30°C auf 100m eingeschossen hast, ist der Abschusswinkel fix. Wenn du jetzt bei 0°C schießt, fliegt das Geschoss anders. Hier kannst du die Bedingungen beim Einschießen eintragen, damit der Rechner den korrekten Abschusswinkel verwendet.", link: "https://de.wikipedia.org/wiki/Innenballistik" }
};

const STORE_KEY = 'sniper.v13'; // NEUE VERSION

function loadState() {
  let saved = localStorage.getItem(STORE_KEY);
  if (!saved) {
    const oldKeys = ['sniper.v12', 'sniper.v11', 'sniper.v10', 'sniper.v9', 'sniper.v8', 'sniper.v7', 'sniper.v6', 'sniper.v5', 'sniper.v4', 'sniper.v3', 'sniper.v2', 'sniper.v1'];
    for (let key of oldKeys) {
      saved = localStorage.getItem(key);
      if (saved) { console.log("Alte Daten gefunden unter: " + key); break; }
    }
  }
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.settings) parsed.settings = { lang: 'de', units: 'metric' };
      if (!parsed.settings.units) parsed.settings.units = 'metric';
      if (!parsed.weapons) parsed.weapons = [];
      if (!parsed.logbook) parsed.logbook = [];
      return parsed;
    } catch(e) { console.error("Fehler beim Laden der Daten", e); }
  }
  return { weapons:[], logbook:[], settings:{ lang:'de', units:'metric' } };
}

let state = loadState();
localStorage.setItem(STORE_KEY, JSON.stringify(state));

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function t(key){ try { return i18n[state.settings.lang][key] || key; } catch(e) { return key; } }
function toast(msg, err){ const el=document.createElement('div'); el.className='toast'+(err?' error':''); el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2000); }
function esc(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

function formatDist(m) {
  if(state.settings.units === 'imperial') return (m * 1.09361).toFixed(1) + ' yd';
  return m.toFixed(1) + ' m';
}
function formatVel(mps) {
  if(state.settings.units === 'imperial') return (mps * 3.28084).toFixed(0) + ' fps';
  return mps.toFixed(0) + ' m/s';
}
function formatTemp(c) {
  if(state.settings.units === 'imperial') return (c * 1.8 + 32).toFixed(0) + ' °F';
  return c.toFixed(0) + ' °C';
}

window.showInfo = function(key) {
  const data = INFO_DB[key];
  if(!data) return;
  document.getElementById('infoTitle').innerText = data.title;
  document.getElementById('infoText').innerText = data.text;
  document.getElementById('infoLink').href = data.link;
  document.getElementById('infoModal').style.display = 'flex';
};
window.closeInfo = () => document.getElementById('infoModal').style.display = 'none';

// --- Sensors, Wetter, etc. (Unverändert) ---
let sensorData = { heading: 0, pitch: 0 };
let sensorSamples = [];
let sensorInterval = null;

window.openSensors = async function() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== 'granted') return toast('Sensoren verweigert', true);
    } catch(e) { return toast('Sensor-Fehler', true); }
  }
  document.getElementById('sensorModal').style.display = 'flex';
  document.getElementById('sensorStatus').innerText = 'Messe... (1/5)';
  document.getElementById('sensorAmpel').style.background = 'var(--surface-2)';
  document.getElementById('btnApplySensor').disabled = true;
  sensorSamples = [];
  window.addEventListener('deviceorientationabsolute', handleSensor, true);
  window.addEventListener('deviceorientation', handleSensor, true);
  let count = 0;
  sensorInterval = setInterval(() => {
    count++;
    document.getElementById('sensorStatus').innerText = `Messe... (${count}/5)`;
    if (count >= 5) {
      clearInterval(sensorInterval);
      window.removeEventListener('deviceorientationabsolute', handleSensor, true);
      window.removeEventListener('deviceorientation', handleSensor, true);
      finishSensors();
    }
  }, 400);
};
function handleSensor(e) {
  let heading = e.webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : null);
  let pitch = e.beta !== null ? e.beta : null;
  if (heading !== null && pitch !== null) {
    sensorSamples.push({ heading, pitch });
    document.getElementById('sensorHeading').innerText = heading.toFixed(0) + '°';
    document.getElementById('sensorPitch').innerText = pitch.toFixed(1) + '°';
  }
}
function finishSensors() {
  if (sensorSamples.length === 0) return toast('Keine Sensordaten', true);
  let sumSin = 0, sumCos = 0, sumPitch = 0;
  sensorSamples.forEach(s => {
    sumSin += Math.sin(s.heading * Math.PI / 180);
    sumCos += Math.cos(s.heading * Math.PI / 180);
    sumPitch += s.pitch;
  });
  const avgRad = Math.atan2(sumSin / sensorSamples.length, sumCos / sensorSamples.length);
  const avgHeading = (avgRad * (180 / Math.PI) + 360) % 360;
  const avgPitch = sumPitch / sensorSamples.length;
  let maxDiff = 0;
  sensorSamples.forEach(s => {
    let hDiff = Math.abs(s.heading - avgHeading);
    if (hDiff > 180) hDiff = 360 - hDiff;
    maxDiff = Math.max(maxDiff, hDiff, Math.abs(s.pitch - avgPitch));
  });
  sensorData = { heading: avgHeading, pitch: avgPitch };
  const ampel = document.getElementById('sensorAmpel');
  const status = document.getElementById('sensorStatus');
  if (maxDiff > 5.0) { ampel.style.background = 'var(--danger)'; status.innerText = 'Unplausibel'; }
  else if (maxDiff > 1.5) { ampel.style.background = 'var(--amber)'; status.innerText = 'Okay (Waffe in Hand)'; }
  else { ampel.style.background = 'var(--accent)'; status.innerText = 'Perfekt (Ruhig)'; if(navigator.vibrate) navigator.vibrate(200); }
  document.getElementById('btnApplySensor').disabled = false;
}
window.applySensorData = function() {
  const azEl = document.getElementById('b-az');
  const slopeEl = document.getElementById('b-slope');
  if(azEl) azEl.value = sensorData.heading.toFixed(1);
  if(slopeEl) slopeEl.value = sensorData.pitch.toFixed(1);
  closeSensors();
  toast('Sensorwerte übernommen');
};
window.closeSensors = function() {
  clearInterval(sensorInterval);
  document.getElementById('sensorModal').style.display = 'none';
};
window.updateDensityAltitudeDisplay = function(temp, press) {
  try {
    if(!window.Ballistics) return;
    const da = Ballistics.calcDensityAltitude(press, temp);
    const el = document.getElementById('da-display');
    if(el) {
      el.innerHTML = `<span>${t('lbl_da')}: <strong>${da.toFixed(0)} m</strong></span><span class="info-btn" onclick="showInfo('da')">i</span>`;
      el.style.color = da > 500 ? 'var(--amber)' : (da < -200 ? 'var(--accent)' : 'var(--text)');
    }
  } catch(e) { console.error("DA Fehler", e); }
};
window.fetchWeather = function() {
  if (!navigator.geolocation) return toast('GPS nicht unterstützt', true);
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    document.getElementById('b-lat').value = lat.toFixed(4);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,surface_pressure,relative_humidity_2m`);
      const data = await res.json();
      document.getElementById('b-temp').value = data.current.temperature_2m;
      document.getElementById('b-press').value = data.current.surface_pressure;
      document.getElementById('b-hum').value = data.current.relative_humidity_2m;
      updateDensityAltitudeDisplay(data.current.temperature_2m, data.current.surface_pressure);
      toast('Wetterdaten geladen');
    } catch(e) { toast('Wetter-API Fehler', true); }
  }, err => toast('GPS Fehler', true), { enableHighAccuracy: true });
};

// --- UI & Routing ---
const app = document.getElementById('app');
const pageTitle = document.getElementById('pageTitle');
window.go = (hash) => location.hash = hash;

function router(){
  const hash = location.hash.replace(/^#/, '') || '/home';
  const parts = hash.split('/').filter(Boolean);
  const section = parts[0] || 'home';
  document.querySelectorAll('.nav a').forEach(a=>a.classList.remove('active'));
  document.querySelector(`.nav a[data-route="${section}"]`)?.classList.add('active');
  document.getElementById('backBtn').style.display = (parts.length>1) ? 'flex' : 'none';
  document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = t(el.getAttribute('data-i18n')));
  switch(section){
    case 'home': renderHome(); break;
    case 'weapons': parts[1] ? renderWeaponForm(parts[1]) : renderWeapons(); break;
    case 'ballistics': renderBallistics(); break;
    case 'geo': renderGeo(); break;
    case 'settings': renderSettings(); break;
    default: renderHome();
  }
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

function renderHome() {
  pageTitle.innerText = t('title_home');
  app.innerHTML = `
    <div class="card tappable" onclick="go('#/ballistics')"><h2>${t('title_ball')}</h2><div class="dim">Flugbahn & Korrekturen</div></div>
    <div class="card tappable" onclick="go('#/weapons')"><h2>${t('title_weapons')}</h2><div class="dim">Waffen verwalten</div></div>
    <div class="card tappable" onclick="go('#/geo')"><h2>${t('title_geo')}</h2><div class="dim">Standort-Fallback</div></div>
  `;
}

function renderWeapons() {
  pageTitle.innerText = t('title_weapons');
  const btn = document.getElementById('actionBtn');
  btn.style.display = 'flex'; btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'; btn.onclick = () => go('#/weapons/new');
  app.innerHTML = state.weapons.length ? state.weapons.map(w => `
    <div class="card tappable" onclick="go('#/weapons/${w.id}')">
      <div class="weapon-row">
        <div><div class="weapon-name">${esc(w.name)}</div><div class="weapon-meta">${esc(w.caliber)} ${w.barrel ? '· '+w.barrel+' Zoll' : ''}</div></div>
        <span class="badge">${w.ammo?.name || 'Manuell'}</span>
      </div>
    </div>
  `).join('') : '<div class="empty">Keine Waffen</div>';
}

function renderWeaponForm(id) {
  const isEdit = id !== 'new';
  const w = isEdit ? state.weapons.find(x=>x.id===id) : { ammo:{}, scope:{} };
  if(isEdit && !w) return go('#/weapons');
  pageTitle.innerText = isEdit ? 'Waffe bearbeiten' : 'Neue Waffe';

  app.innerHTML = `
    <div class="card">
      <div class="field"><label>Name</label><input id="w-name" value="${esc(w.name||'')}"></div>
      <div class="field">
        <label>Kaliber (Auswahl für Munitionsdatenbank)</label>
        <select id="w-cal" onchange="updateAmmoDb(this.value)">
          <option value="">Manuell</option>
          ${Object.keys(AMMO_DB).map(c => `<option value="${c}" ${w.caliber===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="row">
        <div class="field"><label>${t('lbl_barrel')}</label><input id="w-barrel" type="number" step="0.1" value="${w.barrel||''}" placeholder="z.B. 24"></div>
        <div class="field"><label>${t('lbl_twist')}</label><input id="w-twist" type="number" step="0.1" value="${w.twist||''}" placeholder="z.B. 11"></div>
      </div>
      
      <div class="field" id="ammo-db-field" style="display:${w.caliber?'block':'none'}">
        <label>Munition (Auto-Fill)</label>
        <select id="w-ammo-select"></select>
      </div>
      
      <div class="da-badge" id="w-ammo-ref" style="margin-top:12px; display:none;"></div>
      <div class="da-badge" id="w-twist-check" style="margin-top:12px; display:none;"></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:14px;">Ballistische Daten</h3>
      <div class="row">
        <div class="field"><label>Gewicht (gr)</label><input id="w-weight" type="number" value="${w.ammo?.bulletWeight||''}"></div>
        <div class="field"><label>BC (G1) <span class="info-btn" onclick="showInfo('bc')">i</span></label><input id="w-bc" type="number" step="0.001" value="${w.ammo?.bc||''}"></div>
      </div>
      <div class="field"><label>V0 (m/s)</label><input id="w-mv" type="number" value="${w.ammo?.mv||''}"></div>
    </div>
    <button class="btn primary block" id="saveBtn">${t('btn_save')}</button>
  `;

  if(w.caliber) updateAmmoDb(w.caliber);
  
  window.updateAmmoDb = function(cal) {
    const f = document.getElementById('ammo-db-field');
    const sel = document.getElementById('w-ammo-select');
    if(!f || !sel) return;
    if(!cal || !AMMO_DB[cal]) { f.style.display = 'none'; document.getElementById('w-ammo-ref').style.display = 'none'; return; }
    f.style.display = 'block';
    sel.innerHTML = AMMO_DB[cal].data.map((a,i) => `<option value="${i}">${a.brand} ${a.name}</option>`).join('');
    sel.onchange = (e) => {
      const d = AMMO_DB[cal].data[e.target.value];
      document.getElementById('w-weight').value = d.weight;
      document.getElementById('w-bc').value = d.bc;
      document.getElementById('w-mv').value = d.mv;
      
      const refBox = document.getElementById('w-ammo-ref');
      refBox.style.display = 'flex';
      refBox.innerHTML = `<span><strong>${d.brand} ${d.name}</strong></span><span>${d.weight}gr | BC: ${d.bc} | V0: ${d.mv}m/s</span>`;
      checkTwist();
    };
    sel.dispatchEvent(new Event('change'));
  };

  window.checkTwist = function() {
    const twist = parseFloat(document.getElementById('w-twist').value);
    const weight = parseFloat(document.getElementById('w-weight').value);
    const cal = document.getElementById('w-cal').value;
    const box = document.getElementById('w-twist-check');
    
    if(!twist || !weight || !cal || !AMMO_DB[cal]) { box.style.display = 'none'; return; }
    
    let rec = "Optimal";
    let color = "var(--accent)";
    let warning = false;
    
    if (cal === ".308 Win" || cal === ".30-06 Sprg") {
      if (twist >= 12 && weight > 168) { warning = true; rec = "Zu langsam für schweres Geschoss (Instabil!)"; }
      else if (twist <= 10 && weight < 150) { rec = "Sehr schnell für leichtes Geschoss"; }
      else { rec = "Gut stabilisiert"; }
    } else if (cal === ".223 Rem") {
      if (twist >= 12 && weight > 55) { warning = true; rec = "Zu langsam (Instabil!)"; }
      else if (twist <= 8 && weight > 69) { rec = "Perfekt für schweres Geschoss"; }
      else { rec = "Gut stabilisiert"; }
    } else if (cal === "6.5 Creedmoor") {
      if (twist >= 9 && weight > 140) { warning = true; rec = "Grenzwertig (Langsamer Drall)"; }
      else { rec = "Perfekt stabilisiert"; }
    } else {
      rec = "Prüfung nicht verfügbar für dieses Kaliber (Richtwert ok)";
    }

    if (warning) color = "var(--danger)";
    
    box.style.display = 'flex';
    box.style.borderColor = color;
    box.innerHTML = `<span><strong>Lauf-Check:</strong> ${rec}</span><span class="info-btn" onclick="showInfo('spin')">i</span>`;
  };

  document.getElementById('w-twist').oninput = checkTwist;
  document.getElementById('w-weight').oninput = checkTwist;

  document.getElementById('saveBtn').onclick = () => {
    const newW = {
      id: isEdit ? w.id : uid(),
      name: document.getElementById('w-name').value,
      caliber: document.getElementById('w-cal').value,
      barrel: parseFloat(document.getElementById('w-barrel').value) || null,
      twist: parseFloat(document.getElementById('w-twist').value) || null,
      ammo: {
        name: document.getElementById('w-ammo-select')?.options[document.getElementById('w-ammo-select').selectedIndex]?.text || 'Manuell',
        bulletWeight: parseFloat(document.getElementById('w-weight').value) || 168,
        bc: parseFloat(document.getElementById('w-bc').value) || 0.462,
        mv: parseFloat(document.getElementById('w-mv').value) || 820,
        calMm: AMMO_DB[document.getElementById('w-cal').value]?.calMm || 7.82
      }
    };
    if(isEdit) state.weapons[state.weapons.findIndex(x=>x.id===id)] = newW;
    else state.weapons.push(newW);
    save(); go('#/weapons');
  };
}

function renderBallistics() {
  pageTitle.innerText = t('title_ball');
  let w = state.weapons[0] || {};
  if (!w.ammo) w.ammo = {};
  
  app.innerHTML = `
    <div class="card">
      <div class="field">
        <label>${t('lbl_weapon_select')}</label>
        <select id="b-weapon-select" onchange="updateCalcWeapon(this.value)">
          <option value="">${t('lbl_weapon_manual')}</option>
          ${state.weapons.map(wp => `<option value="${wp.id}">${esc(wp.name)} (${esc(wp.caliber)})</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Munition 1</label>
        <select id="b-cal-select" onchange="updateCalcAmmo(this.value, '1')">
          <option value="">${t('lbl_ammo_custom')}</option>
          ${Object.keys(AMMO_DB).map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="field" id="b-ammo-db-field" style="display:none">
        <select id="b-ammo-select"></select>
      </div>

      <div class="row">
        <div class="field"><label>${t('lbl_mv')}</label><input id="b-mv" type="number" value="${w.ammo.mv||820}"></div>
        <div class="field"><label>${t('lbl_bc')} <span class="info-btn" onclick="showInfo('bc')">i</span></label><input id="b-bc" type="number" step="0.001" value="${w.ammo.bc||0.462}"></div>
      </div>
      <div class="row">
        <div class="field"><label>${t('lbl_weight')}</label><input id="b-weight" type="number" value="${w.ammo.bulletWeight||168}"></div>
        <div class="field"><label>Zero (m)</label><input id="b-zero" type="number" value="100"></div>
      </div>
    </div>

    <div class="card" style="background:var(--surface-2); border-color:var(--surface-3);">
      <div class="flex" style="justify-content:space-between; margin-bottom:10px;">
        <label style="margin:0;">${t('lbl_compare')}</label>
        <button class="btn" onclick="toggleCompare()" id="btn-compare" style="padding:4px 8px; font-size:12px;">Aktivieren</button>
      </div>
      <div id="compare-fields" style="display:none;">
         <div class="field">
          <label>Munition 2</label>
          <select id="b-cal-select-2" onchange="updateCalcAmmo(this.value, '2')">
            <option value="">${t('lbl_ammo_custom')}</option>
            ${Object.keys(AMMO_DB).map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="field" id="b-ammo-db-field-2" style="display:none">
          <select id="b-ammo-select-2"></select>
        </div>
        <div class="row">
          <div class="field"><label>${t('lbl_mv')}</label><input id="b-mv-2" type="number" value="820"></div>
          <div class="field"><label>${t('lbl_bc')}</label><input id="b-bc-2" type="number" step="0.001" value="0.500"></div>
        </div>
        <div class="field"><label>${t('lbl_weight')}</label><input id="b-weight-2" type="number" value="168"></div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:14px;">Umgebung & Sensoren</h3>
      <div class="row">
        <div class="field">
          <label>${t('lbl_lat')} <span class="info-btn" onclick="showInfo('coriolis')">i</span></label>
          <input id="b-lat" type="number" step="0.1" value="50.0">
        </div>
        <div class="field">
          <label>${t('lbl_az')} <span class="info-btn" onclick="showInfo('eotvos')">i</span></label>
          <input id="b-az" type="number" step="1" value="90">
        </div>
      </div>
      <div class="field">
        <label>${t('lbl_slope')} <span class="info-btn" onclick="showInfo('slope')">i</span></label>
        <div class="flex"><input id="b-slope" type="number" step="1" value="0"><button class="btn" onclick="openSensors()">📱</button></div>
      </div>
      <div class="row-3">
        <div class="field"><label>${t('lbl_temp')}</label><input id="b-temp" type="number" value="15" oninput="updateDensityAltitudeDisplay(this.value, document.getElementById('b-press').value)"></div>
        <div class="field"><label>${t('lbl_press')}</label><input id="b-press" type="number" value="1013" oninput="updateDensityAltitudeDisplay(document.getElementById('b-temp').value, this.value)"></div>
        <div class="field"><label>${t('lbl_hum')}</label><input id="b-hum" type="number" value="50"></div>
      </div>
      
      <button class="btn block" onclick="fetchWeather()" style="background:var(--accent-dim);color:var(--text);">☁️ Wetter & GPS Automatisch laden</button>
      <div class="da-badge" id="da-display"></div>

      <div class="field mt">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="b-zero-cond-check" onchange="toggleZeroCond()" style="width:auto; accent-color:var(--accent);">
          ${t('lbl_zero_cond')} <span class="info-btn" onclick="event.preventDefault();showInfo('zero_cond')">i</span>
        </label>
      </div>
      <div id="b-zero-cond-fields" style="display:none; background:var(--surface-2); padding:10px; border-radius:8px; margin-bottom:12px; border:1px solid var(--border);">
        <div class="row-3">
          <div class="field"><label>${t('lbl_zero_temp')} (°C)</label><input id="b-zero-temp" type="number" value="30"></div>
          <div class="field"><label>${t('lbl_zero_press')} (hPa)</label><input id="b-zero-press" type="number" value="1013"></div>
          <div class="field"><label>${t('lbl_zero_hum')} (%)</label><input id="b-zero-hum" type="number" value="50"></div>
        </div>
      </div>

      <div class="field mt"><label>Zieldistanzen (m)</label><input id="b-dist" value="100,300,500,800,1000"></div>
    </div>
    
    <button class="btn primary block" id="calcBtn">${t('btn_calc')}</button>
    <div id="b-results"></div>
  `;

  updateDensityAltitudeDisplay(15, 1013);

  let isCompareActive = false;
  window.toggleCompare = function() {
    isCompareActive = !isCompareActive;
    document.getElementById('compare-fields').style.display = isCompareActive ? 'block' : 'none';
    document.getElementById('btn-compare').innerText = isCompareActive ? 'Deaktivieren' : 'Aktivieren';
  };

  window.toggleZeroCond = function() {
    const isChecked = document.getElementById('b-zero-cond-check').checked;
    document.getElementById('b-zero-cond-fields').style.display = isChecked ? 'block' : 'none';
  };

  window.updateCalcWeapon = function(wid) {
    if(!wid) {
      document.getElementById('b-cal-select').value = '';
      updateCalcAmmo('', '1');
      return;
    }
    const weapon = state.weapons.find(x=>x.id===wid);
    if(weapon) {
      document.getElementById('b-cal-select').value = weapon.caliber;
      updateCalcAmmo(weapon.caliber, '1');
      if(weapon.ammo) {
        document.getElementById('b-mv').value = weapon.ammo.mv;
        document.getElementById('b-bc').value = weapon.ammo.bc;
        document.getElementById('b-weight').value = weapon.ammo.bulletWeight;
      }
    }
  };

  window.updateCalcAmmo = function(cal, target) {
    const f = document.getElementById('b-ammo-db-field' + (target==='2'?'-2':''));
    const sel = document.getElementById('b-ammo-select' + (target==='2'?'-2':''));
    if(!cal || !AMMO_DB[cal]) { if(f) f.style.display = 'none'; return; }
    if(f) f.style.display = 'block';
    if(sel) {
      sel.innerHTML = AMMO_DB[cal].data.map((a,i) => `<option value="${i}">${a.brand} ${a.name}</option>`).join('');
      sel.onchange = (e) => {
        const d = AMMO_DB[cal].data[e.target.value];
        document.getElementById('b-mv'+(target==='2'?'-2':'')).value = d.mv;
        document.getElementById('b-bc'+(target==='2'?'-2':'')).value = d.bc;
        document.getElementById('b-weight'+(target==='2'?'-2':'')).value = d.weight;
      };
      sel.dispatchEvent(new Event('change'));
    }
  };

  if (state.weapons.length > 0) {
    document.getElementById('b-weapon-select').value = state.weapons[0].id;
    updateCalcWeapon(state.weapons[0].id);
  }

  document.getElementById('calcBtn').onclick = () => {
    try {
      const wData = state.weapons.find(x => x.id === document.getElementById('b-weapon-select').value) || { ammo: {} };
      
      const envParams = {
        zeroDistance: parseFloat(document.getElementById('b-zero').value) || 100,
        latitude: parseFloat(document.getElementById('b-lat').value) || 50.0,
        azimuth: parseFloat(document.getElementById('b-az').value) || 90,
        slope: parseFloat(document.getElementById('b-slope').value) || 0,
        temperatureC: parseFloat(document.getElementById('b-temp').value) || 15,
        pressureHpa: parseFloat(document.getElementById('b-press').value) || 1013,
        humidity: parseFloat(document.getElementById('b-hum').value) || 50,
        windSpeed: 0, windAngle: 90, sightHeightMm: 45,
        caliberMm: wData.ammo?.calMm || 7.82, clickUnit: 'MIL', clickValue: 0.1,
        distances: document.getElementById('b-dist').value.split(',').map(s => parseFloat(s)).filter(n => !isNaN(n) && n > 0)
      };

      if(document.getElementById('b-zero-cond-check').checked) {
        envParams.zeroTemperatureC = parseFloat(document.getElementById('b-zero-temp').value) || 30;
        envParams.zeroPressureHpa = parseFloat(document.getElementById('b-zero-press').value) || 1013;
        envParams.zeroHumidity = parseFloat(document.getElementById('b-zero-hum').value) || 50;
      }

      const p1 = { ...envParams,
        muzzleVelocity: parseFloat(document.getElementById('b-mv').value) || 820,
        bc: parseFloat(document.getElementById('b-bc').value) || 0.462,
        bulletWeight: parseFloat(document.getElementById('b-weight').value) || 168
      };

      if(!window.Ballistics) return toast('Ballistik-Modul nicht geladen!', true);
      const res1 = Ballistics.simulate(p1);
      
      let res2 = null;
      let p2 = null;
      if(isCompareActive) {
        p2 = { ...envParams,
          muzzleVelocity: parseFloat(document.getElementById('b-mv-2').value) || 820,
          bc: parseFloat(document.getElementById('b-bc-2').value) || 0.500,
          bulletWeight: parseFloat(document.getElementById('b-weight-2').value) || 168
        };
        res2 = Ballistics.simulate(p2);
      }

      renderResultsAndGraph(res1, p1, res2, p2);

    } catch(err) { console.error(err); toast('Fehler: ' + err.message, true); }
  };
}

function renderResultsAndGraph(res1, p1, res2, p2) {
  const maxDist = Math.max(...res1.densePath.map(d => d.d), res2 ? Math.max(...res2.densePath.map(d => d.d)) : 0);
  const minDrop = Math.min(...res1.densePath.map(d => d.drop), res2 ? Math.min(...res2.densePath.map(d => d.drop)) : 0, -10);
  const maxDrop = Math.max(...res1.densePath.map(d => d.drop), res2 ? Math.max(...res2.densePath.map(d => d.drop)) : 0, 10);
  
  const w = 340, h = 180, padX = 35, padY = 20;
  const scaleX = (d) => padX + (d / maxDist) * (w - padX*2);
  const scaleY = (drop) => padY + ((maxDrop - drop) / (maxDrop - minDrop)) * (h - padY*2);

  function makePath(res) {
    return res.densePath.map((r, i) => `${i===0?'M':'L'} ${scaleX(r.d)} ${scaleY(r.drop)}`).join(' ');
  }

  const zeroY = scaleY(0);

  // Transonic für Munition 1
  let transonicHtml = '';
  if (res1.transonicDist && res1.transonicDist < maxDist) {
    const tx = scaleX(res1.transonicDist);
    transonicHtml = `
      <line x1="${tx}" y1="${padY}" x2="${tx}" y2="${h-padY}" stroke="var(--danger)" stroke-width="1.5" stroke-dasharray="4"/>
      <text x="${tx}" y="${padY-5}" fill="var(--danger)" text-anchor="middle" font-size="9">M1 Unterschall (${formatDist(res1.transonicDist)})</text>
    `;
  }

  // Transonic für Munition 2
  let transonicHtml2 = '';
  if (res2 && res2.transonicDist && res2.transonicDist < maxDist) {
    const tx2 = scaleX(res2.transonicDist);
    transonicHtml2 = `
      <line x1="${tx2}" y1="${padY}" x2="${tx2}" y2="${h-padY}" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="2"/>
      <text x="${tx2}" y="${padY-15}" fill="var(--amber)" text-anchor="middle" font-size="9">M2 Unterschall (${formatDist(res2.transonicDist)})</text>
    `;
  }

  const chartHtml = `
    <div class="card" style="padding:12px; margin-bottom:16px;">
      <h3 style="margin-bottom:8px;font-size:12px;text-align:center;">${t('lbl_graph')}</h3>
      <div class="svg-container">
        <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;">
          <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${h-padY}" stroke="var(--border)" stroke-width="1"/>
          <line x1="${padX}" y1="${h-padY}" x2="${w-padX}" y2="${h-padY}" stroke="var(--border)" stroke-width="1"/>
          
          <line x1="${padX}" y1="${zeroY}" x2="${w-padX}" y2="${zeroY}" stroke="var(--text-dim)" stroke-width="1" stroke-dasharray="2"/>
          <text x="${padX-5}" y="${zeroY+4}" fill="var(--text-dim)" text-anchor="end" font-size="9">Visierlinie</text>
          
          <text x="${padX-5}" y="${scaleY(maxDrop)+4}" fill="var(--text-dim)" text-anchor="end">${maxDrop.toFixed(0)}cm</text>
          <text x="${padX-5}" y="${scaleY(minDrop)+4}" fill="var(--text-dim)" text-anchor="end">${minDrop.toFixed(0)}cm</text>
          
          <text x="${padX}" y="${h-padY+14}" fill="var(--text-dim)" text-anchor="middle">0</text>
          <text x="${w-padX}" y="${h-padY+14}" fill="var(--text-dim)" text-anchor="middle">${maxDist.toFixed(0)}m</text>
          
          <path d="${makePath(res1)}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
          ${res2 ? `<path d="${makePath(res2)}" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-linejoin="round"/>` : ''}
          
          ${transonicHtml}
          ${transonicHtml2}
        </svg>
      </div>
      <div class="flex" style="justify-content:center;gap:16px;font-size:11px; flex-wrap:wrap;">
        <div><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;margin-right:4px;"></span>Munition 1</div>
        ${res2 ? `<div><span style="display:inline-block;width:10px;height:10px;background:var(--amber);border-radius:2px;margin-right:4px;"></span>Munition 2</div>` : ''}
        ${res1.transonicDist ? `<div><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;margin-right:4px;"></span>M1 Unterschall</div>` : ''}
        ${res2 && res2.transonicDist ? `<div><span style="display:inline-block;width:10px;height:10px;background:var(--amber);border-radius:2px;margin-right:4px;"></span>M2 Unterschall</div>` : ''}
      </div>
    </div>
  `;

  const tableHtml = `
    <div class="card" style="padding:12px 8px">
      <div style="font-family:var(--mono); font-size:12px; margin-bottom:8px; padding:0 8px;">
        E0 (Munition 1): <strong>${res1.E0.toFixed(0)} J</strong>
        ${res2 ? `<br>E0 (Munition 2): <strong>${res2.E0.toFixed(0)} J</strong>` : ''}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>m</th><th>Drop cm</th><th>MIL</th><th>Klicks</th><th>v m/s</th><th>E J</th><th>Zeit s</th><th>Coriolis <span class="info-btn" onclick="showInfo('coriolis')">i</span></th><th>Spin <span class="info-btn" onclick="showInfo('spin')">i</span></th></tr></thead>
          <tbody>
            ${res1.results.map((r, i) => {
              let row = `<tr>
                <td>${r.distance}</td>
                <td class="${r.dropCm<0?'neg':'pos'}">${r.dropCm.toFixed(1)}</td>
                <td>${r.dropMIL.toFixed(2)}</td>
                <td style="color:var(--accent)">+${r.clicks}</td>
                <td class="dim">${r.velocity.toFixed(0)}</td>
                <td class="dim">${r.energy.toFixed(0)}</td>
                <td class="dim">${r.tof.toFixed(3)}</td>
                <td class="dim">${r.coriolis.toFixed(1)}</td>
                <td class="dim">${r.spin.toFixed(1)}</td>
              </tr>`;
              if(res2 && res2.results[i]) {
                const r2 = res2.results[i];
                const diff = r.dropCm - r2.dropCm;
                row += `<tr style="background:rgba(212,160,23,0.05);">
                  <td style="color:var(--amber)">${r2.distance}</td>
                  <td class="${diff<0?'neg':'pos'}">${r2.dropCm.toFixed(1)} <span class="small dim">(${diff>0?'+':''}${diff.toFixed(1)})</span></td>
                  <td>${r2.dropMIL.toFixed(2)}</td>
                  <td style="color:var(--amber)">+${r2.clicks}</td>
                  <td class="dim">${r2.velocity.toFixed(0)}</td>
                  <td class="dim">${r2.energy.toFixed(0)}</td>
                  <td class="dim">${r2.tof.toFixed(3)}</td>
                  <td class="dim">${r2.coriolis.toFixed(1)}</td>
                  <td class="dim">${r2.spin.toFixed(1)}</td>
                </tr>`;
              }
              return row;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('b-results').innerHTML = chartHtml + tableHtml;
}

function renderGeo() {
  pageTitle.innerText = t('title_geo');
  app.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom:14px;">${t('lbl_choose_geo')}</h3>
      <div class="hint mb">Falls GPS nicht verfügbar ist, wähle einen Ort in deiner Nähe, um den Breitengrad für die Coriolis-Berechnung zu schätzen.</div>
      <div class="field">
        <select id="geo-select" size="10" style="height:auto;">
          ${GEO_LIST.map(g => `<option value="${g.lat}">${g.country} - ${g.city} (${g.lat.toFixed(2)}°)</option>`).join('')}
        </select>
      </div>
      <button class="btn primary block" onclick="applyGeo()">Breitengrad übernehmen</button>
    </div>
  `;
  window.applyGeo = function() {
    const lat = document.getElementById('geo-select').value;
    if(lat) {
      const latEl = document.getElementById('b-lat');
      if(latEl) latEl.value = lat;
      toast('Breitengrad übernommen');
      go('#/ballistics');
    }
  };
}

function renderSettings() {
  pageTitle.innerText = t('title_setup');
  app.innerHTML = `
    <div class="card">
      <h3>Sprache / Language</h3>
      <select id="lang" onchange="state.settings.lang=this.value; save(); router();">
        <option value="de" ${state.settings.lang==='de'?'selected':''}>Deutsch</option>
        <option value="en" ${state.settings.lang==='en'?'selected':''}>English</option>
      </select>
    </div>
    <div class="card">
      <h3>Einheiten</h3>
      <select id="units" onchange="state.settings.units=this.value; save(); router();">
        <option value="metric" ${state.settings.units==='metric'?'selected':''}>Metrisch (Meter, °C, m/s)</option>
        <option value="imperial" ${state.settings.units==='imperial'?'selected':''}>Imperial (Yards, °F, fps)</option>
      </select>
    </div>
    <div class="card">
      <h3>Daten & Backup</h3>
      <button class="btn block" onclick="exportData()">Backup exportieren (.json)</button>
      <button class="btn block" onclick="document.getElementById('imp-file').click()">Backup importieren</button>
      <input type="file" id="imp-file" accept=".json" style="display:none" onchange="importData(event)">
    </div>
  `;
  window.exportData = function() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sniper-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup erstellt');
  };
  window.importData = function(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if(!data.weapons) throw new Error('Ungültiges Format');
        state = data;
        if(!state.settings.units) state.settings.units = 'metric';
        save();
        toast('Backup erfolgreich importiert');
        router();
      } catch(err) { toast('Import fehlgeschlagen', true); }
    };
    reader.readAsText(file);
  };
}

})();
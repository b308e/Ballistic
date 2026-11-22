(function(){
'use strict';

const i18n = {
  de: {
    app_sub: 'Der Sniper', nav_home: 'Start', nav_weapons: 'Waffen', nav_ball: 'Ballistik', nav_tools: 'Tools', nav_setup: 'Setup',
    title_home: 'Übersicht', title_weapons: 'Waffen', title_ball: 'Ballistik-Rechner', title_setup: 'Setup', title_tools: 'Werkzeuge',
    lbl_caliber: 'Kaliber', lbl_mv: 'Mündungsgeschwindigkeit (m/s)', lbl_bc: 'Ballistischer Koeffizient (G1)',
    lbl_weight: 'Geschossgewicht (Grain)', lbl_lat: 'Breitengrad (°)', lbl_az: 'Schussrichtung (Azimut 0-360°)',
    lbl_slope: 'Höhenwinkel (°)', lbl_sensor: 'Sensoren', btn_save: 'Speichern', btn_calc: 'Berechnen',
    lbl_temp: 'Temperatur (°C)', lbl_press: 'Luftdruck (hPa)', lbl_hum: 'Feuchtigkeit (%)', lbl_da: 'Dichtehöhe',
    lbl_barrel: 'Lauflänge (Zoll)', lbl_twist: 'Dralllänge (Zoll, z.B. 11 für 1:11)', lbl_grooves: 'Züge/Felder',
    lbl_ammo_select: 'Munition wählen', lbl_ammo_custom: 'Eigene Laborierung / Manuell'
  },
  en: {
    app_sub: 'The Sniper', nav_home: 'Home', nav_weapons: 'Weapons', nav_ball: 'Ballistics', nav_tools: 'Tools', nav_setup: 'Setup',
    title_home: 'Overview', title_weapons: 'Weapons', title_ball: 'Ballistics', title_setup: 'Settings', title_tools: 'Tools',
    lbl_caliber: 'Caliber', lbl_mv: 'Muzzle Velocity (m/s)', lbl_bc: 'Ballistic Coefficient (G1)',
    lbl_weight: 'Bullet Weight (Grain)', lbl_lat: 'Latitude (°)', lbl_az: 'Heading (Azimuth 0-360°)',
    lbl_slope: 'Slope Angle (°)', lbl_sensor: 'Sensors', btn_save: 'Save', btn_calc: 'Calculate',
    lbl_temp: 'Temperature (°C)', lbl_press: 'Pressure (hPa)', lbl_hum: 'Humidity (%)', lbl_da: 'Density Altitude',
    lbl_barrel: 'Barrel Length (Inch)', lbl_twist: 'Twist Rate (Inch, e.g. 11 for 1:11)', lbl_grooves: 'Grooves/Lands',
    lbl_ammo_select: 'Select Ammo', lbl_ammo_custom: 'Custom Load / Manual'
  }
};

// MASSIVE MUNITIONSDATENBANK
const AMMO_DB = {
  ".22 LR": { calMm: 5.6, data: [
    { brand: "RWS", name: "Rifle Match", weight: 40, bc: 0.130, mv: 330 },
    { brand: "RWS", name: "Club", weight: 40, bc: 0.125, mv: 320 },
    { brand: "S&B", name: "Club", weight: 40, bc: 0.120, mv: 320 },
    { brand: "Geco", name: "Rifle", weight: 40, bc: 0.128, mv: 325 },
    { brand: "Topshot", name: "Standard", weight: 40, bc: 0.110, mv: 315 }
  ]},
  ".223 Rem": { calMm: 5.7, data: [
    { brand: "Hornady", name: "V-Max 55gr", weight: 55, bc: 0.255, mv: 990 },
    { brand: "Hornady", name: "Match BTHP 75gr", weight: 75, bc: 0.395, mv: 850 },
    { brand: "S&B", name: "Schütte FMJ 55gr", weight: 55, bc: 0.230, mv: 950 },
    { brand: "RWS", name: "Match 69gr", weight: 69, bc: 0.345, mv: 850 },
    { brand: "Remington", name: "UMC 55gr", weight: 55, bc: 0.202, mv: 940 },
    { brand: "Geco", name: "Express 55gr", weight: 55, bc: 0.225, mv: 940 }
  ]},
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
    { brand: "Geco", name: "Target 140gr", weight: 140, bc: 0.560, mv: 820 }
  ]},
  "6.5x55 SE": { calMm: 6.5, data: [
    { brand: "S&B", name: "SP 140gr", weight: 140, bc: 0.490, mv: 800 },
    { brand: "RWS", name: "DK 127gr", weight: 127, bc: 0.410, mv: 850 },
    { brand: "Norma", name: "Diamond Line 130gr", weight: 130, bc: 0.450, mv: 840 }
  ]},
  ".270 Win": { calMm: 7.0, data: [
    { brand: "Remington", name: "Core-Lokt 130gr", weight: 130, bc: 0.336, mv: 930 },
    { brand: "RWS", name: "Cineshot 130gr", weight: 130, bc: 0.380, mv: 910 },
    { brand: "Hornady", name: "SST 140gr", weight: 140, bc: 0.485, mv: 880 }
  ]},
  "7x64": { calMm: 7.2, data: [
    { brand: "RWS", name: "KS 162gr", weight: 162, bc: 0.330, mv: 850 },
    { brand: "S&B", name: "SPCE 173gr", weight: 173, bc: 0.312, mv: 790 },
    { brand: "Geco", name: "TM 170gr", weight: 170, bc: 0.315, mv: 800 }
  ]},
  ".308 Win": { calMm: 7.82, data: [
    { brand: "Hornady", name: "ELD-M 168gr", weight: 168, bc: 0.523, mv: 820 },
    { brand: "Hornady", name: "BTHP 168gr", weight: 168, bc: 0.462, mv: 810 },
    { brand: "S&B", name: "Match 168gr", weight: 168, bc: 0.490, mv: 800 },
    { brand: "RWS", name: "Target Match 168gr", weight: 168, bc: 0.480, mv: 810 },
    { brand: "RWS", name: "Evolution 165gr", weight: 165, bc: 0.390, mv: 820 },
    { brand: "Topshot", name: "Target 168gr", weight: 168, bc: 0.450, mv: 800 },
    { brand: "Remington", name: "Core-Lokt 180gr", weight: 180, bc: 0.360, mv: 790 },
    { brand: "Geco", name: "Target 168gr", weight: 168, bc: 0.470, mv: 805 },
    { brand: "Norma", name: "Diamond Line 168gr", weight: 168, bc: 0.500, mv: 815 }
  ]},
  ".30-06 Sprg": { calMm: 7.82, data: [
    { brand: "RWS", name: "Evolution 184gr", weight: 184, bc: 0.380, mv: 840 },
    { brand: "Remington", name: "Core-Lokt 150gr", weight: 150, bc: 0.314, mv: 880 },
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
    { brand: "RWS", name: "Target 250gr", weight: 250, bc: 0.650, mv: 890 }
  ]},
  "9mm Luger": { calMm: 9.0, data: [
    { brand: "S&B", name: "Schütte 115gr", weight: 115, bc: 0.150, mv: 340 },
    { brand: "Topshot", name: "115gr", weight: 115, bc: 0.140, mv: 330 },
    { brand: "Hornady", name: "XTP 124gr", weight: 124, bc: 0.165, mv: 320 },
    { brand: "Geco", name: "FMJ 124gr", weight: 124, bc: 0.155, mv: 335 }
  ]}
};

const INFO_DB = {
  bc: { title: "Ballistischer Koeffizient (BC)", text: "Beschreibt, wie gut ein Geschoss die Luft durchschneidet. Ein höherer Wert bedeutet weniger Luftwiderstand, flachere Flugbahn und weniger Windanfälligkeit.", link: "https://de.wikipedia.org/wiki/Ballistischer_Koeffizient" },
  coriolis: { title: "Corioliskraft", text: "Die Erdrotation lenkt das Geschoss ab. Auf der Nordhalbkugel driftet es leicht nach rechts, auf der Südhalbkugel nach links. Bei 1000m sind das oft nur wenige Zentimeter.", link: "https://de.wikipedia.org/wiki/Corioliskraft" },
  spin: { title: "Spin Drift", text: "Durch die Rotation des Geschosses im Flug (Kreiselphysik) wandert es auf weite Distanzen leicht in Drallrichtung ab. Wird oft erst ab 600m relevant.", link: "https://de.wikipedia.org/wiki/Magnus-Effekt" },
  slope: { title: "Höhenwinkel (Rifleman's Rule)", text: "Beim Schießen bergauf oder bergab wirkt die Schwerkraft nur mit dem Kosinus des Winkels. Die effektive Distanz ist kürzer als die gemessene. Ein Schuss bergauf fällt weniger.", link: "https://de.wikipedia.org/wiki/Schuss_(Waffe)" },
  da: { title: "Dichtehöhe (Density Altitude)", text: "Fasst Temperatur, Luftdruck und Luftfeuchtigkeit zusammen. Eine hohe Dichtehöhe (z.B. Sommer) bedeutet dünnere Luft -> das Geschoss fliegt weiter. Im Winter ist die Dichtehöhe niedriger -> mehr Luftwiderstand.", link: "https://de.wikipedia.org/wiki/Dichteh%C3%B6he" }
};

const STORE_KEY = 'sniper.v8';
let state = JSON.parse(localStorage.getItem(STORE_KEY)) || { weapons:[], logbook:[], settings:{ lang:'de' } };
if(!state.settings) state.settings = { lang: 'de' };
if(!state.weapons) state.weapons = [];
if(!state.logbook) state.logbook = [];

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function t(key){ try { return i18n[state.settings.lang][key] || key; } catch(e) { return key; } }
function toast(msg, err){ const el=document.createElement('div'); el.className='toast'+(err?' error':''); el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2000); }
function esc(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

window.showInfo = function(key) {
  const data = INFO_DB[key];
  if(!data) return;
  document.getElementById('infoTitle').innerText = data.title;
  document.getElementById('infoText').innerText = data.text;
  document.getElementById('infoLink').href = data.link;
  document.getElementById('infoModal').style.display = 'flex';
};
window.closeInfo = () => document.getElementById('infoModal').style.display = 'none';

// --- Sensors (Snapshot & Ampel) ---
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

// --- Wetter API & GPS ---
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
    case 'tools': renderTools(); break;
    case 'settings': renderSettings(); break;
    default: renderHome();
  }
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// --- Render Functions ---
function renderHome() {
  pageTitle.innerText = t('title_home');
  app.innerHTML = `
    <div class="card tappable" onclick="go('#/ballistics')"><h2>${t('title_ball')}</h2><div class="dim">Flugbahn & Korrekturen</div></div>
    <div class="card tappable" onclick="go('#/weapons')"><h2>${t('title_weapons')}</h2><div class="dim">Waffen verwalten</div></div>
    <div class="card tappable" onclick="go('#/tools')"><h2>${t('title_tools')}</h2><div class="dim">Trefferbild & Ranging</div></div>
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
      <div class="field"><label>${t('lbl_grooves')}</label><input id="w-grooves" type="text" value="${w.grooves||''}" placeholder="z.B. 4"></div>
      
      <div class="field" id="ammo-db-field" style="display:${w.caliber?'block':'none'}">
        <label>Munition (Auto-Fill)</label>
        <select id="w-ammo-select"></select>
      </div>
    </div>
    <div class="card">
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
    if(!cal || !AMMO_DB[cal]) { f.style.display = 'none'; return; }
    f.style.display = 'block';
    sel.innerHTML = AMMO_DB[cal].data.map((a,i) => `<option value="${i}">${a.brand} ${a.name}</option>`).join('');
    sel.onchange = (e) => {
      const d = AMMO_DB[cal].data[e.target.value];
      document.getElementById('w-weight').value = d.weight;
      document.getElementById('w-bc').value = d.bc;
      document.getElementById('w-mv').value = d.mv;
    };
    sel.dispatchEvent(new Event('change'));
  };

  document.getElementById('saveBtn').onclick = () => {
    const newW = {
      id: isEdit ? w.id : uid(),
      name: document.getElementById('w-name').value,
      caliber: document.getElementById('w-cal').value,
      barrel: parseFloat(document.getElementById('w-barrel').value) || null,
      twist: parseFloat(document.getElementById('w-twist').value) || null,
      grooves: document.getElementById('w-grooves').value,
      ammo: {
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
        <label>${t('lbl_ammo_select')}</label>
        <select id="b-cal-select" onchange="updateCalcAmmo(this.value)">
          <option value="">${t('lbl_ammo_custom')}</option>
          ${Object.keys(AMMO_DB).map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="field" id="b-ammo-db-field" style="display:none">
        <label>Spezifische Munition</label>
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

    <div class="card">
      <h3 style="margin-bottom:14px;">Umgebung & Sensoren</h3>
      <div class="row">
        <div class="field">
          <label>${t('lbl_lat')} <span class="info-btn" onclick="showInfo('coriolis')">i</span></label>
          <input id="b-lat" type="number" step="0.1" value="50.0">
        </div>
        <div class="field">
          <label>${t('lbl_az')}</label>
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

      <div class="field mt"><label>Zieldistanzen (m)</label><input id="b-dist" value="100,300,500,800,1000"></div>
    </div>
    
    <button class="btn primary block" id="calcBtn">${t('btn_calc')}</button>
    <div id="b-results"></div>
  `;

  updateDensityAltitudeDisplay(15, 1013);

  window.updateCalcAmmo = function(cal) {
    const f = document.getElementById('b-ammo-db-field');
    const sel = document.getElementById('b-ammo-select');
    if(!cal || !AMMO_DB[cal]) { f.style.display = 'none'; return; }
    f.style.display = 'block';
    sel.innerHTML = AMMO_DB[cal].data.map((a,i) => `<option value="${i}">${a.brand} ${a.name}</option>`).join('');
    sel.onchange = (e) => {
      const d = AMMO_DB[cal].data[e.target.value];
      document.getElementById('b-mv').value = d.mv;
      document.getElementById('b-bc').value = d.bc;
      document.getElementById('b-weight').value = d.weight;
    };
    sel.dispatchEvent(new Event('change'));
  };

  document.getElementById('calcBtn').onclick = () => {
    try {
      const wData = state.weapons[0] || { ammo: {} };
      const p = {
        muzzleVelocity: parseFloat(document.getElementById('b-mv').value) || 820,
        bc: parseFloat(document.getElementById('b-bc').value) || 0.462,
        bulletWeight: parseFloat(document.getElementById('b-weight').value) || 168,
        zeroDistance: parseFloat(document.getElementById('b-zero').value) || 100,
        latitude: parseFloat(document.getElementById('b-lat').value) || 50.0,
        azimuth: parseFloat(document.getElementById('b-az').value) || 90,
        slope: parseFloat(document.getElementById('b-slope').value) || 0,
        temperatureC: parseFloat(document.getElementById('b-temp').value) || 15,
        pressureHpa: parseFloat(document.getElementById('b-press').value) || 1013,
        humidity: parseFloat(document.getElementById('b-hum').value) || 50,
        windSpeed: 0, windAngle: 90, sightHeightMm: 45,
        caliberMm: wData.ammo.calMm || 7.82, clickUnit: 'MIL', clickValue: 0.1,
        distances: document.getElementById('b-dist').value.split(',').map(s => parseFloat(s)).filter(n => !isNaN(n) && n > 0)
      };
      if(!window.Ballistics) return toast('Ballistik-Modul nicht geladen!', true);
      const res = Ballistics.simulate(p);
      
      document.getElementById('b-results').innerHTML = `
        <div class="card" style="padding:12px 8px">
          <div class="table-wrap">
            <table>
              <thead><tr><th>m</th><th>Drop cm</th><th>MIL</th><th>Klicks</th><th>Drift cm</th><th>Coriolis <span class="info-btn" onclick="showInfo('coriolis')">i</span></th><th>Spin <span class="info-btn" onclick="showInfo('spin')">i</span></th></tr></thead>
              <tbody>
                ${res.map(r => `
                  <tr>
                    <td>${r.distance}</td>
                    <td class="${r.dropCm<0?'neg':'pos'}">${r.dropCm.toFixed(1)}</td>
                    <td>${r.dropMIL.toFixed(2)}</td>
                    <td style="color:var(--amber)">+${r.clicks}</td>
                    <td>${r.driftCm.toFixed(1)}</td>
                    <td class="dim">${r.coriolis.toFixed(1)}</td>
                    <td class="dim">${r.spin.toFixed(1)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch(err) { console.error(err); toast('Fehler: ' + err.message, true); }
  };
}

function renderTools() {
  pageTitle.innerText = t('title_tools');
  app.innerHTML = `
    <div class="card">
      <h2>Trefferbild-Analyse</h2>
      <div class="hint mb">Berechnet Streukreis (ES) und Mittelpunkt (MR) basierend auf manuellen X/Y Koordinaten in mm.</div>
      <div class="field"><label>Einschläge (X,Y ; X,Y ; ...)</label><textarea id="group-input" rows="3" placeholder="0,0 ; 10,5 ; -5,12"></textarea></div>
      <button class="btn" onclick="calcGroup()">Auswerten</button>
      <div id="group-res" class="mt mono" style="color:var(--accent)"></div>
    </div>
    <div class="card">
      <h2>Mil-Dot Entfernungsrechner</h2>
      <div class="row">
        <div class="field"><label>Zielgröße (cm)</label><input id="rd-size" type="number" value="50"></div>
        <div class="field"><label>Abgelesene MIL</label><input id="rd-mil" type="number" step="0.1" value="2.0"></div>
      </div>
      <button class="btn" onclick="calcRanging()">Entfernung berechnen</button>
      <div id="range-res" class="mt mono" style="color:var(--accent)"></div>
    </div>
  `;
  window.calcGroup = function() {
    try {
      const pts = document.getElementById('group-input').value.split(';').map(p => p.split(',').map(Number));
      let sumX=0, sumY=0;
      pts.forEach(p => { sumX+=p[0]; sumY+=p[1]; });
      const mrX = sumX/pts.length, mrY = sumY/pts.length;
      let maxDist = 0;
      pts.forEach(p => {
        const d = Math.sqrt(Math.pow(p[0]-mrX, 2) + Math.pow(p[1]-mrY, 2));
        if(d > maxDist) maxDist = d;
      });
      let es = 0;
      for(let i=0; i<pts.length; i++) {
        for(let j=i+1; j<pts.length; j++) {
          const d = Math.sqrt(Math.pow(pts[i][0]-pts[j][0], 2) + Math.pow(pts[i][1]-pts[j][1], 2));
          if(d > es) es = d;
        }
      }
      document.getElementById('group-res').innerHTML = `Mittelpunkt: X=${mrX.toFixed(1)}mm, Y=${mrY.toFixed(1)}mm<br>Streukreis (ES): ${es.toFixed(1)}mm<br>Mean Radius (MR): ${maxDist.toFixed(1)}mm`;
    } catch(e) { toast('Format falsch', true); }
  };
  window.calcRanging = function() {
    const size = parseFloat(document.getElementById('rd-size').value) * 10; 
    const mil = parseFloat(document.getElementById('rd-mil').value);
    if(mil === 0) return;
    const dist = (size) / mil;
    document.getElementById('range-res').innerText = `${dist.toFixed(1)} Meter`;
  };
}

function renderSettings() {
  pageTitle.innerText = t('title_setup');
  app.innerHTML = `
    <div class="card">
      <h3>Sprache</h3>
      <select id="lang" onchange="state.settings.lang=this.value; save(); router();">
        <option value="de" ${state.settings.lang==='de'?'selected':''}>Deutsch</option>
        <option value="en" ${state.settings.lang==='en'?'selected':''}>English</option>
      </select>
    </div>
    <div class="card">
      <h3>Daten & Backup</h3>
      <div class="hint mb">Alle Daten liegen lokal. Erstelle regelmäßig ein Backup!</div>
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
        save();
        toast('Backup erfolgreich importiert');
        router();
      } catch(err) { toast('Import fehlgeschlagen', true); }
    };
    reader.readAsText(file);
  };
}

})();
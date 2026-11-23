/**
 * ballistics.js
 * Reine Physik- und Ballistik-Engine für Sportschützen.
 * Keine DOM-Manipulationen, kein LocalStorage, rein mathematische Funktionen.
 * Alle internen Berechnungen erfolgen im metrischen System (SI-Einheiten).
 *
 * Hinweis: Alle Berechnungen sind physikalische Näherungen und müssen
 * immer mit realen Schussdaten auf dem Schießstand verifiziert werden.
 */

const BallisticsEngine = (() => {
    'use strict';

    // Physikalische Konstanten
    const GRAVITY = 9.80665;              // Erdbeschleunigung in m/s²
    const EARTH_OMEGA = 7.2921159e-5;     // Winkelgeschwindigkeit der Erde in rad/s
    const R_DRY_AIR = 287.058;            // Spezifische Gaskonstante für trockene Luft in J/(kg·K)
    const R_WATER_VAPOR = 461.495;        // Spezifische Gaskonstante für Wasserdampf in J/(kg·K)
    const STD_DENSITY = 1.225;            // ICAO Standard-Luftdichte auf Meereshöhe in kg/m³ (15°C, 1013.25 hPa, 0% rF)
    const G1_CONSTANT = 0.0001053;        // Empirische Kalibrierungskonstante für das G1-Widerstandsmodell (SI-angepasst)
    const G7_CONSTANT = 0.0001053;        // Kalibrierungskonstante für das G7-Widerstandsmodell
    const DT = 0.0002;                    // Zeitschritt für Euler-Integration in Sekunden (0,2 ms)
    const MAX_SIM_TIME = 15.0;            // Sicherheitsabbruch nach 15 Sekunden Flugzeit

    // G1 Standard-Widerstandstabelle (Mach vs. Luftwiderstandsbeiwert Cd)
    const G1_TABLE = [
        { mach: 0.00, cd: 0.2629 },
        { mach: 0.20, cd: 0.2558 },
        { mach: 0.40, cd: 0.2487 },
        { mach: 0.50, cd: 0.2490 },
        { mach: 0.60, cd: 0.2525 },
        { mach: 0.70, cd: 0.2640 },
        { mach: 0.75, cd: 0.2755 },
        { mach: 0.80, cd: 0.2965 },
        { mach: 0.85, cd: 0.3350 },
        { mach: 0.90, cd: 0.4050 },
        { mach: 0.95, cd: 0.5080 },
        { mach: 1.00, cd: 0.6150 },
        { mach: 1.05, cd: 0.6920 },
        { mach: 1.10, cd: 0.7280 },
        { mach: 1.15, cd: 0.7420 },
        { mach: 1.20, cd: 0.7450 },
        { mach: 1.30, cd: 0.7330 },
        { mach: 1.40, cd: 0.7120 },
        { mach: 1.50, cd: 0.6880 },
        { mach: 1.60, cd: 0.6640 },
        { mach: 1.80, cd: 0.6180 },
        { mach: 2.00, cd: 0.5760 },
        { mach: 2.20, cd: 0.5380 },
        { mach: 2.50, cd: 0.4880 },
        { mach: 3.00, cd: 0.4220 },
        { mach: 3.50, cd: 0.3710 },
        { mach: 4.00, cd: 0.3300 },
        { mach: 5.00, cd: 0.2680 }
    ];

    // G7 Standard-Widerstandstabelle (Mach vs. Cd für moderne Boat-Tail VLD-Geschosse)
    const G7_TABLE = [
        { mach: 0.00, cd: 0.1198 },
        { mach: 0.20, cd: 0.1197 },
        { mach: 0.40, cd: 0.1196 },
        { mach: 0.60, cd: 0.1200 },
        { mach: 0.70, cd: 0.1215 },
        { mach: 0.80, cd: 0.1255 },
        { mach: 0.85, cd: 0.1320 },
        { mach: 0.90, cd: 0.1510 },
        { mach: 0.95, cd: 0.2180 },
        { mach: 1.00, cd: 0.3420 },
        { mach: 1.05, cd: 0.3860 },
        { mach: 1.10, cd: 0.3950 },
        { mach: 1.20, cd: 0.3910 },
        { mach: 1.30, cd: 0.3810 },
        { mach: 1.40, cd: 0.3690 },
        { mach: 1.50, cd: 0.3560 },
        { mach: 1.60, cd: 0.3430 },
        { mach: 1.80, cd: 0.3190 },
        { mach: 2.00, cd: 0.2980 },
        { mach: 2.20, cd: 0.2790 },
        { mach: 2.50, cd: 0.2540 },
        { mach: 3.00, cd: 0.2210 },
        { mach: 3.50, cd: 0.1950 },
        { mach: 4.00, cd: 0.1750 },
        { mach: 5.00, cd: 0.1450 }
    ];

    /**
     * Lineare Interpolation des Widerstandsbeiwerts Cd für eine gegebene Mach-Zahl.
     * @param {number} mach - Aktuelle Mach-Zahl
     * @param {string} dragModel - 'G1' oder 'G7'
     * @returns {number} Interpolierter Cd-Wert
     */
    function getDragCoefficient(mach, dragModel = 'G1') {
        const table = dragModel === 'G7' ? G7_TABLE : G1_TABLE;
        if (mach <= table[0].mach) return table[0].cd;
        if (mach >= table[table.length - 1].mach) return table[table.length - 1].cd;

        for (let i = 0; i < table.length - 1; i++) {
            const p1 = table[i];
            const p2 = table[i + 1];
            if (mach >= p1.mach && mach <= p2.mach) {
                const t = (mach - p1.mach) / (p2.mach - p1.mach);
                return p1.cd + t * (p2.cd - p1.cd);
            }
        }
        return table[0].cd;
    }

    /**
     * Berechnet atmosphärische Parameter: Luftdichte, Schallgeschwindigkeit und Dichtehöhe (Density Altitude).
     * @param {number} tempC - Temperatur in °C
     * @param {number} pressureHpa - Luftdruck in hPa (mbar)
     * @param {number} humidityPercent - Relative Luftfeuchtigkeit in % (0 bis 100)
     * @returns {object} { airDensity, speedOfSound, densityAltitudeMeters, densityRatio }
     */
    function calculateAtmosphere(tempC, pressureHpa, humidityPercent) {
        const tC = isFinite(tempC) ? tempC : 15.0;
        const pHpa = isFinite(pressureHpa) && pressureHpa > 0 ? pressureHpa : 1013.25;
        const rh = isFinite(humidityPercent) ? Math.max(0, Math.min(100, humidityPercent)) : 50.0;

        const tempKelvin = tC + 273.15;
        const pressurePa = pHpa * 100.0;

        // Sättigungsdampfdruck nach Magnus-Tetens-Formel (in Pa)
        const es = 610.78 * Math.exp((17.27 * tC) / (tC + 237.3));
        const pv = (rh / 100.0) * es; // Partialdruck Wasserdampf
        const pd = pressurePa - pv;    // Partialdruck trockene Luft

        // Luftdichte feuchter Luft in kg/m³
        const airDensity = (pd / (R_DRY_AIR * tempKelvin)) + (pv / (R_WATER_VAPOR * tempKelvin));
        const densityRatio = airDensity / STD_DENSITY;

        // Schallgeschwindigkeit in m/s (leichte Korrektur durch Luftfeuchte)
        const speedOfSound = 20.05 * Math.sqrt(tempKelvin) * (1 + 0.0016 * (pv / pressurePa));

        // Dichtehöhe (Density Altitude) nach ICAO-Standardatmosphäre in Metern
        // T0 = 288.15 K, L = 0.0065 K/m, g = 9.80665, R = 287.058
        const exponent = 0.234969; // (g / (R * L)) - 1 = 5.25588 - 1 = 4.25588 -> Kehrwert 1 / 4.25588 = 0.234969
        const daMeters = (288.15 / 0.0065) * (1.0 - Math.pow(airDensity / STD_DENSITY, exponent));

        return {
            airDensity,
            speedOfSound,
            densityAltitudeMeters: daMeters,
            densityRatio
        };
    }

    /**
     * Berechnet die kinetische Energie eines Geschosses in Joule.
     * @param {number} massGrains - Geschossgewicht in Grain
     * @param {number} velocityMs - Geschwindigkeit in m/s
     * @returns {number} Energie in Joule
     */
    function calculateEnergy(massGrains, velocityMs) {
        const massKg = (massGrains || 0) * 0.00006479891;
        return 0.5 * massKg * velocityMs * velocityMs;
    }

    /**
     * Miller-Stabilitäts-Check (Heuristik für Drallstabilität Sg).
     * Berechnet den Gyroskopischen Stabilitätsfaktor Sg und die geschätzte Geschosslänge in Kalibern.
     * @param {object} params - { caliberInches, bulletWeightGrains, twistRateInches, v0Ms, tempC, pressureHpa }
     * @returns {object} { sg, lengthCalibers, status }
     */
    function calculateMillerStability(params) {
        const d = parseFloat(params.caliberInches) || 0.308;
        const m = parseFloat(params.bulletWeightGrains) || 168;
        const twistInches = parseFloat(params.twistRateInches) || 10;
        const v0Ms = parseFloat(params.v0Ms) || 800;
        const tempC = isFinite(params.tempC) ? params.tempC : 15;
        const pressureHpa = isFinite(params.pressureHpa) ? params.pressureHpa : 1013.25;

        if (d <= 0 || m <= 0 || twistInches <= 0) {
            return { sg: 0, lengthCalibers: 0, status: 'invalid' };
        }

        // Schätzung der Geschosslänge in Zoll aus Masse und Durchmesser (Dichte Bleikern/Kupfermantel ca. 10.6 g/cm³ -> Faktor ~0.000284 lb/in³)
        // Empirische Näherung für gängige Mantelgeschosse: L_inch ≈ m / (2650 * d^2)
        const estLengthInches = m / (2650.0 * d * d);
        const lengthCalibers = estLengthInches / d;

        // Dralllänge in Kalibern (t)
        const t = twistInches / d;

        // Standard Miller-Formel bei 2800 fps (853.44 m/s)
        const numerator = 30.0 * m;
        const denominator = Math.pow(t, 2) * Math.pow(d, 3) * lengthCalibers * (1.0 + Math.pow(lengthCalibers, 2));
        let sgBase = numerator / denominator;

        // Geschwindigkeitskorrektur (v in fps)
        const vFps = v0Ms * 3.28084;
        const velocityCorrection = Math.pow(vFps / 2800.0, 1.0 / 3.0);

        // Atmosphärische Korrektur (Temperatur in Fahrenheit, Druck in inHg)
        const tempF = (tempC * 9.0 / 5.0) + 32.0;
        const pressureInHg = pressureHpa * 0.02953;
        const atmCorrection = ((tempF + 460.0) / 519.0) * (29.92 / pressureInHg);

        const sg = sgBase * velocityCorrection * atmCorrection;

        let status = 'optimal';
        if (sg < 1.0) {
            status = 'unstable';
        } else if (sg < 1.3) {
            status = 'marginal';
        } else if (sg <= 2.0) {
            status = 'optimal';
        } else {
            status = 'overstabilized';
        }

        return {
            sg: Math.max(0, sg),
            lengthCalibers: Math.max(0, lengthCalibers),
            status
        };
    }

    /**
     * Interne Hilfsfunktion zur Simulation einer einzelnen Flugbahn mit gegebenem Abgangswinkel (Alpha).
     * Verwendet numerische Integration nach dem Euler-Verfahren (dt = 0.0002s).
     */
    function traceTrajectory(alphaRad, config, atm, recordSteps, maxDist, stepDist) {
        const v0 = config.v0;
        const bc = Math.max(0.01, config.bc);
        const dragModel = config.dragModel || 'G1';
        const sightHeightM = (config.sightHeightCm || 5.0) / 100.0;
        const shotAngleRad = ((config.shotAngleDeg || 0) * Math.PI) / 180.0;

        // Windzerlegung (0° = Gegenwind von vorne, 90° = von rechts, 180° = Rückenwind, 270° = von links)
        const windSpeed = config.windSpeedMs || 0;
        const windDirRad = ((config.windDirectionDeg || 0) * Math.PI) / 180.0;
        // Gegenwind-Komponente (+ bremst das Geschoss, - schiebt es an)
        const headWind = windSpeed * Math.cos(windDirRad);
        // Querwind-Komponente (+ von rechts -> drückt Geschoss nach links / negativer X-Wert, Konvention: Drift in cm nach rechts positiv, nach links negativ)
        // Bei Wind von rechts (90°): sin(90°) = +1 -> Geschoss driftet nach links (-).
        // Bei Wind von links (270°): sin(270°) = -1 -> Geschoss driftet nach rechts (+).
        const crossWindFromRight = windSpeed * Math.sin(windDirRad);

        // Coriolis & Eötvös Vorfaktoren
        const latRad = ((config.latitudeDeg || 0) * Math.PI) / 180.0;
        const azRad = ((config.azimuthDeg || 0) * Math.PI) / 180.0;
        const sinLat = Math.sin(latRad);
        const cosLat = Math.cos(latRad);
        const sinAz = Math.sin(azRad);

        // Spin Drift Vorfaktor (Litz-Näherung abhängig vom Stabilitätsfaktor Sg)
        const sg = config.sg && config.sg > 0 ? config.sg : 1.5;
        const twistDirSign = config.twistDirection === 'left' ? -1.0 : 1.0;

        // Startzustand an der Mündung (x = Distanz entlang Visierlinie, y = Höhe relativ zur Visierlinie)
        let x = 0.0;
        let y = -sightHeightM;
        let vx = v0 * Math.cos(alphaRad);
        let vy = v0 * Math.sin(alphaRad);
        let t = 0.0;

        // Gravitationskomponenten im visierlinienbezogenen Koordinatensystem (Rifleman's Rule / Schusswinkel)
        const gx = -GRAVITY * Math.sin(shotAngleRad);
        const gy = -GRAVITY * Math.cos(shotAngleRad);

        const dragConstant = dragModel === 'G7' ? G7_CONSTANT : G1_CONSTANT;
        const densityFactor = atm.densityRatio;

        let transonicDistance = null;
        let wasSupersonic = v0 > atm.speedOfSound;

        const points = [];
        let nextRecordDist = stepDist;

        // Startpunkt (0m) aufzeichnen, falls gewünscht
        if (recordSteps) {
            points.push({
                distance: 0,
                dropCm: y * 100.0,
                mil: 0,
                moa: 0,
                clicks: 0,
                velocity: v0,
                energy: calculateEnergy(config.bulletWeightGrains, v0),
                tof: 0,
                coriolisCm: 0,
                spinDriftCm: 0,
                windDriftCm: 0,
                totalHorizontalCm: 0
            });
        }

        while (x <= maxDist && t < MAX_SIM_TIME) {
            // Relativgeschwindigkeit zur Luft (inkl. Gegen-/Rückenwind)
            const vAirX = vx + headWind;
            const vAirY = vy;
            const vAir = Math.sqrt(vAirX * vAirX + vAirY * vAirY);

            if (vAir <= 1.0) break;

            // Mach-Zahl und Widerstandsverzögerung
            const mach = vAir / atm.speedOfSound;

            // Transsonik-Übergang prüfen (Mach 1.0)
            if (wasSupersonic && mach <= 1.0 && transonicDistance === null) {
                transonicDistance = x;
            }

            const cd = getDragCoefficient(mach, dragModel);
            const dragAccel = (dragConstant * densityFactor * cd * vAir * vAir) / bc;

            // Verzögerungsvektor entgegen der Relativgeschwindigkeit zur Luft
            const axDrag = -dragAccel * (vAirX / vAir);
            const ayDrag = -dragAccel * (vAirY / vAir);

            // Eötvös-Effekt (vertikale Coriolis-Komponente bei Schüssen in Ost-West-Richtung)
            // Positiv bei Schuss nach Osten (Azimut 90°) -> Geschoss "wiegt" weniger -> trifft höher
            const aEotvos = 2.0 * EARTH_OMEGA * vx * cosLat * sinAz;

            // Gesamtbeschleunigung
            const ax = axDrag + gx;
            const ay = ayDrag + gy + aEotvos;

            // Euler-Integration
            const prevX = x;
            const prevY = y;
            const prevVx = vx;
            const prevVy = vy;
            const prevT = t;

            vx += ax * DT;
            vy += ay * DT;
            x += vx * DT;
            y += vy * DT;
            t += DT;

            // Wenn nur für Zero-Suche gerechnet wird und Zieldistanz erreicht wurde:
            if (!recordSteps && x >= maxDist) {
                const frac = (maxDist - prevX) / (x - prevX);
                const interpY = prevY + frac * (y - prevY);
                return { yAtTarget: interpY };
            }

            // Messpunkte für Tabelle und Graph aufzeichnen
            if (recordSteps && x >= nextRecordDist && nextRecordDist <= maxDist) {
                const frac = (nextRecordDist - prevX) / (x - prevX);
                const interpY = prevY + frac * (y - prevY);
                const interpVx = prevVx + frac * (vx - prevVx);
                const interpVy = prevVy + frac * (vy - prevVy);
                const interpT = prevT + frac * DT;
                const interpV = Math.sqrt(interpVx * interpVx + interpVy * interpVy);

                // Horizontale Abweichungen berechnen (in cm, positiv = rechts, negativ = links)

                // 1. Winddrift (Lag-Time-Methode: Abweichung = Querwind * (Flugzeit - Vakuumflugzeit))
                const vacuumTof = nextRecordDist / (v0 * Math.cos(alphaRad));
                const lagTime = Math.max(0, interpT - vacuumTof);
                // Wind von rechts (crossWindFromRight > 0) drückt nach links (-)
                const windDriftMeters = -crossWindFromRight * lagTime;

                // 2. Coriolis horizontal (auf der Nordhalbkugel zieht Coriolis immer nach rechts)
                // Formel: d_cor = Omega * sin(Lat) * x * t (für kleine Winkel)
                const coriolisMeters = EARTH_OMEGA * sinLat * nextRecordDist * interpT;

                // 3. Spin Drift (Kreiseldrift nach Bryan Litz: SD_inches = 1.25 * (Sg + 1.2) * TOF^1.83)
                const spinDriftInches = 1.25 * (sg + 1.2) * Math.pow(interpT, 1.83);
                const spinDriftMeters = twistDirSign * (spinDriftInches * 0.0254);

                const dropCm = interpY * 100.0;
                const coriolisCm = coriolisMeters * 100.0;
                const spinDriftCm = spinDriftMeters * 100.0;
                const windDriftCm = windDriftMeters * 100.0;
                const totalHorizontalCm = coriolisCm + spinDriftCm + windDriftCm;

                // Winkelkorrekturen (MIL und MOA)
                // 1 MIL = 10 cm auf 100 m -> dropCm / (dist / 10) = (dropCm * 10) / dist
                // Positiver Korrekturwert (Holdover) bei Tiefschuss (dropCm < 0)
                const mil = nextRecordDist > 0 ? (-dropCm / (nextRecordDist * 0.1)) : 0;
                // 1 MOA = 2.90888 cm auf 100 m
                const moa = nextRecordDist > 0 ? (-dropCm / (nextRecordDist * 0.0290888)) : 0;

                const clicks = config.clickUnit === 'MOA'
                    ? Math.round(moa * 4.0)   // 1/4 MOA Klicks
                    : Math.round(mil * 10.0); // 0.1 MIL Klicks

                points.push({
                    distance: nextRecordDist,
                    dropCm,
                    mil,
                    moa,
                    clicks,
                    velocity: interpV,
                    energy: calculateEnergy(config.bulletWeightGrains, interpV),
                    tof: interpT,
                    coriolisCm,
                    spinDriftCm,
                    windDriftCm,
                    totalHorizontalCm
                });

                nextRecordDist += stepDist;
            }
        }

        // Falls Transsonik innerhalb der Maximaldistanz nicht erreicht wurde, hochrechnen bis max. 2500m
        if (recordSteps && wasSupersonic && transonicDistance === null) {
            let extX = x;
            let extVx = vx;
            let extVy = vy;
            let extT = t;
            while (extX <= 2500 && extT < MAX_SIM_TIME) {
                const vAirX = extVx + headWind;
                const vAir = Math.sqrt(vAirX * vAirX + extVy * extVy);
                if (vAir <= 1.0) break;
                const mach = vAir / atm.speedOfSound;
                if (mach <= 1.0) {
                    transonicDistance = extX;
                    break;
                }
                const cd = getDragCoefficient(mach, dragModel);
                const dragAccel = (dragConstant * densityFactor * cd * vAir * vAir) / bc;
                extVx += (-dragAccel * (vAirX / vAir) + gx) * DT;
                extVy += (-dragAccel * (extVy / vAir) + gy) * DT;
                extX += extVx * DT;
                extT += DT;
            }
        }

        return {
            points,
            transonicDistance: transonicDistance ? Math.round(transonicDistance) : null
        };
    }

    /**
     * Findet den exakten Abgangswinkel (Alpha) für die gewünschte Einschiessdistanz (Zero)
     * mittels Sekantenverfahren / Bisektion unter den gegebenen Zero-Wetterbedingungen.
     */
    function solveZeroAngle(config, zeroAtm) {
        const zeroDist = Math.max(10, config.zeroDistanceM || 100);

        // Zero-Konfiguration (beim Einschießen auf horizontaler Bahn ohne Wind)
        const zeroConfig = {
            ...config,
            shotAngleDeg: 0,
            windSpeedMs: 0,
            windDirectionDeg: 0
        };

        let lowAlpha = -0.05;  // ca. -2.86 Grad
        let highAlpha = 0.15;  // ca. +8.59 Grad
        let bestAlpha = 0.0;

        // 28 Iterationen Bisektion liefern eine Genauigkeit unter 0.000001 rad (< 0.01 mm auf 100m)
        for (let i = 0; i < 28; i++) {
            const midAlpha = 0.5 * (lowAlpha + highAlpha);
            const res = traceTrajectory(midAlpha, zeroConfig, zeroAtm, false, zeroDist, zeroDist);

            if (res.yAtTarget === undefined) {
                // Geschoss fiel vorher zu Boden -> Winkel erhöhen
                lowAlpha = midAlpha;
                continue;
            }

            if (Math.abs(res.yAtTarget) < 0.00001) {
                bestAlpha = midAlpha;
                break;
            }

            if (res.yAtTarget < 0) {
                lowAlpha = midAlpha;
            } else {
                highAlpha = midAlpha;
            }
            bestAlpha = midAlpha;
        }

        return bestAlpha;
    }

    /**
     * Hauptfunktion zur Berechnung einer vollständigen Flugbahntabelle und aller Kennwerte.
     * @param {object} rawParams - Eingabeparameter (alle Werte metrisch)
     * @returns {object} Vollständiges Ergebnisobjekt für Tabelle, Graph und Kennzahlen
     */
    function calculateTrajectory(rawParams) {
        // Sichere Fallbacks gegen NaN
        const config = {
            bulletWeightGrains: parseFloat(rawParams.bulletWeightGrains) || 168,
            bc: parseFloat(rawParams.bc) || 0.50,
            dragModel: rawParams.dragModel === 'G7' ? 'G7' : 'G1',
            v0: parseFloat(rawParams.v0) || 800,
            sightHeightCm: isFinite(parseFloat(rawParams.sightHeightCm)) ? parseFloat(rawParams.sightHeightCm) : 5.0,
            zeroDistanceM: parseFloat(rawParams.zeroDistanceM) || 100,
            maxDistanceM: parseFloat(rawParams.maxDistanceM) || 1000,
            stepDistanceM: parseFloat(rawParams.stepDistanceM) || 50,
            shotAngleDeg: parseFloat(rawParams.shotAngleDeg) || 0,
            windSpeedMs: parseFloat(rawParams.windSpeedMs) || 0,
            windDirectionDeg: parseFloat(rawParams.windDirectionDeg) || 0,
            latitudeDeg: isFinite(parseFloat(rawParams.latitudeDeg)) ? parseFloat(rawParams.latitudeDeg) : 48.7,
            azimuthDeg: parseFloat(rawParams.azimuthDeg) || 0,
            clickUnit: rawParams.clickUnit === 'MOA' ? 'MOA' : 'MIL',
            twistDirection: rawParams.twistDirection === 'left' ? 'left' : 'right',
            twistRateInches: parseFloat(rawParams.twistRateInches) || 10,
            caliberInches: parseFloat(rawParams.caliberInches) || 0.308,
            // Aktuelles Wetter
            tempC: isFinite(parseFloat(rawParams.tempC)) ? parseFloat(rawParams.tempC) : 15.0,
            pressureHpa: parseFloat(rawParams.pressureHpa) || 1013.25,
            humidityPercent: isFinite(parseFloat(rawParams.humidityPercent)) ? parseFloat(rawParams.humidityPercent) : 50.0,
            // Zero-Wetter
            sameWeatherAsCurrent: rawParams.sameWeatherAsCurrent !== false,
            zeroTempC: isFinite(parseFloat(rawParams.zeroTempC)) ? parseFloat(rawParams.zeroTempC) : 15.0,
            zeroPressureHpa: parseFloat(rawParams.zeroPressureHpa) || 1013.25,
            zeroHumidityPercent: isFinite(parseFloat(rawParams.zeroHumidityPercent)) ? parseFloat(rawParams.zeroHumidityPercent) : 50.0
        };

        // 1. Atmosphäre für aktuelle Bedingungen berechnen
        const currentAtm = calculateAtmosphere(config.tempC, config.pressureHpa, config.humidityPercent);

        // 2. Atmosphäre für Zero-Bedingungen berechnen
        const zeroAtm = config.sameWeatherAsCurrent
            ? currentAtm
            : calculateAtmosphere(config.zeroTempC, config.zeroPressureHpa, config.zeroHumidityPercent);

        // 3. Miller-Stabilität für aktuellen Schuss berechnen (fließt in Spin Drift ein)
        const stability = calculateMillerStability({
            caliberInches: config.caliberInches,
            bulletWeightGrains: config.bulletWeightGrains,
            twistRateInches: config.twistRateInches,
            v0Ms: config.v0,
            tempC: config.tempC,
            pressureHpa: config.pressureHpa
        });
        config.sg = stability.sg;

        // 4. Abgangswinkel (Alpha) unter Zero-Bedingungen ermitteln
        const alphaRad = solveZeroAngle(config, zeroAtm);

        // 5. Eigentliche Flugbahn unter aktuellen Bedingungen simulieren
        // Schrittweite für den Graphen verfeinern, falls Tabellenschrittweite groß ist
        const graphStep = Math.min(25, config.stepDistanceM);
        const simResult = traceTrajectory(
            alphaRad,
            config,
            currentAtm,
            true,
            config.maxDistanceM,
            graphStep
        );

        // Tabellenpunkte nach gewünschter Schrittweite filtern
        const tablePoints = simResult.points.filter(
            p => p.distance > 0 && p.distance % config.stepDistanceM === 0
        );

        // Falls Einschiessdistanz kein Vielfaches der Schrittweite ist, trotzdem für Kontrolle einfügen/sortieren
        if (config.zeroDistanceM > 0 && config.zeroDistanceM <= config.maxDistanceM && config.zeroDistanceM % config.stepDistanceM !== 0) {
            const zeroPoint = simResult.points.find(p => p.distance === config.zeroDistanceM);
            if (zeroPoint) {
                tablePoints.push(zeroPoint);
                tablePoints.sort((a, b) => a.distance - b.distance);
            }
        }

        const e0Joules = calculateEnergy(config.bulletWeightGrains, config.v0);

        return {
            e0Joules,
            alphaDeg: (alphaRad * 180.0) / Math.PI,
            alphaMil: alphaRad * 1000.0,
            atmosphere: currentAtm,
            zeroAtmosphere: zeroAtm,
            stability,
            transonicDistance: simResult.transonicDistance,
            tablePoints,
            graphPoints: simResult.points
        };
    }

    /**
     * Berechnet den zirkulären Mittelwert und die Winkelstreuung für Kompass-/Azimut-Messungen
     * (verhindert Sprünge beim Übergang 359° -> 0°).
     * @param {number[]} anglesDeg - Array von Winkelwerten in Grad
     * @returns {object} { meanDeg, spreadDeg, status }
     */
    function calculateCircularStats(anglesDeg) {
        if (!Array.isArray(anglesDeg) || anglesDeg.length === 0) {
            return { meanDeg: 0, spreadDeg: 0, status: 'red' };
        }

        let sumSin = 0;
        let sumCos = 0;
        for (const deg of anglesDeg) {
            const rad = (deg * Math.PI) / 180.0;
            sumSin += Math.sin(rad);
            sumCos += Math.cos(rad);
        }

        const n = anglesDeg.length;
        const meanRad = Math.atan2(sumSin / n, sumCos / n);
        let meanDeg = (meanRad * 180.0) / Math.PI;
        if (meanDeg < 0) meanDeg += 360.0;

        // Maximale Winkelabweichung (Spannweite zum zirkulären Mittelwert)
        let maxDev = 0;
        for (const deg of anglesDeg) {
            let diff = Math.abs(deg - meanDeg) % 360.0;
            if (diff > 180.0) diff = 360.0 - diff;
            if (diff > maxDev) maxDev = diff;
        }
        const spreadDeg = maxDev * 2.0; // Gesamte Streubreite

        let status = 'green';
        if (spreadDeg >= 8.0) {
            status = 'red';
        } else if (spreadDeg >= 3.0) {
            status = 'yellow';
        }

        return {
            meanDeg,
            spreadDeg,
            status
        };
    }

    // Einheiten-Umrechnungshelfer (Metrisch <-> Imperial)
    const Units = {
        mToYd: m => m * 1.0936133,
        ydToM: yd => yd / 1.0936133,
        cmToIn: cm => cm / 2.54,
        inToCm: inch => inch * 2.54,
        msToFps: ms => ms * 3.2808399,
        fpsToMs: fps => fps / 3.2808399,
        jToFtlb: j => j * 0.7375621,
        ftlbToJ: ftlb => ftlb / 0.7375621,
        cToF: c => (c * 9.0 / 5.0) + 32.0,
        fToC: f => (f - 32.0) * 5.0 / 9.0,
        mToFt: m => m * 3.2808399,
        kmhToMs: kmh => kmh / 3.6,
        msToKmh: ms => ms * 3.6,
        mphToMs: mph => mph * 0.44704,
        msToMph: ms => ms / 0.44704
    };

    // Öffentliche API der Physik-Engine
    return {
        calculateTrajectory,
        calculateAtmosphere,
        calculateMillerStability,
        calculateEnergy,
        calculateCircularStats,
        getDragCoefficient,
        Units
    };
})();
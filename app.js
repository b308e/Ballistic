/**
 * app.js
 * Hauptanwendungslogik, State-Management, i18n (DE/EN), Munitions- & Städtedatenbank,
 * LocalStorage-Persistenz & Migration, JSON-Export/Import, Wetter-API (Open-Meteo),
 * Smartphone-Sensoren (DeviceOrientationEvent), SVG-Flugbahngraph, Logbuch & Lexikon.
 *
 * App-Version: 0.1
 * Hinweis: V0-Werte in der Munitionsdatenbank sind Herstellerangaben bei ca. 24 Zoll Lauflänge
 * und können je nach Waffe und Lauflänge abweichen. Alle Berechnungen sind Näherungen.
 */

(() => {
    'use strict';

    // Speicher- und Versions-Konstanten (App-Version 0.1)
    const APP_VERSION = '0.1';
    const STORAGE_KEY = 'sniper_v0_1';
    const LEGACY_KEYS = ['sniper_data', 'sniper-v12', 'sniper_v13', 'sniper_v14', 'ballistik', 'weapons'];

    // -------------------------------------------------------------------------
    // 1. MUNITIONSDATENBANK (Über 40 Kaliber, über 100 Laborierungen)
    // Hinweis: V0-Werte sind Herstellerangaben (ca. 24" Lauflänge, .22 LR ca. 18-24").
    // -------------------------------------------------------------------------
    const CALIBERS = [
        { id: '22lr', name: '.22 LR', diameterIn: 0.223, defaultTwistIn: 16 },
        { id: '17hmr', name: '.17 HMR', diameterIn: 0.172, defaultTwistIn: 9 },
        { id: '222rem', name: '.222 Rem', diameterIn: 0.224, defaultTwistIn: 14 },
        { id: '223rem', name: '.223 Rem / 5.56x45', diameterIn: 0.224, defaultTwistIn: 8 },
        { id: '243win', name: '.243 Win', diameterIn: 0.243, defaultTwistIn: 9.125 },
        { id: '6mmbr', name: '6mm BR Norma', diameterIn: 0.243, defaultTwistIn: 8 },
        { id: '6mmcreed', name: '6mm Creedmoor', diameterIn: 0.243, defaultTwistIn: 7.5 },
        { id: '65grendel', name: '6.5 Grendel', diameterIn: 0.264, defaultTwistIn: 8 },
        { id: '65creed', name: '6.5 Creedmoor', diameterIn: 0.264, defaultTwistIn: 8 },
        { id: '65prc', name: '6.5 PRC', diameterIn: 0.264, defaultTwistIn: 8 },
        { id: '65x55se', name: '6.5x55 SE', diameterIn: 0.264, defaultTwistIn: 8.66 },
        { id: '65x57', name: '6.5x57 / 6.5x57R', diameterIn: 0.264, defaultTwistIn: 8.66 },
        { id: '270win', name: '.270 Win', diameterIn: 0.277, defaultTwistIn: 10 },
        { id: '7mm08', name: '7mm-08 Rem', diameterIn: 0.284, defaultTwistIn: 9.5 },
        { id: '7x57', name: '7x57 / 7x57R', diameterIn: 0.284, defaultTwistIn: 8.66 },
        { id: '7x64', name: '7x64 / 7x65R', diameterIn: 0.284, defaultTwistIn: 8.66 },
        { id: '7mmremmag', name: '7mm Rem Mag', diameterIn: 0.284, defaultTwistIn: 9.5 },
        { id: '7prc', name: '7mm PRC', diameterIn: 0.284, defaultTwistIn: 8 },
        { id: '308win', name: '.308 Win / 7.62x51', diameterIn: 0.308, defaultTwistIn: 10 },
        { id: '3006', name: '.30-06 Springfield', diameterIn: 0.308, defaultTwistIn: 10 },
        { id: '300winmag', name: '.300 Win Mag', diameterIn: 0.308, defaultTwistIn: 10 },
        { id: '300prc', name: '.300 PRC', diameterIn: 0.308, defaultTwistIn: 8.5 },
        { id: '300blk', name: '.300 AAC Blackout', diameterIn: 0.308, defaultTwistIn: 7 },
        { id: '762x39', name: '7.62x39 mm', diameterIn: 0.311, defaultTwistIn: 9.5 },
        { id: '8x57is', name: '8x57 IS / 8x57 IRS', diameterIn: 0.323, defaultTwistIn: 9.45 },
        { id: '338lapua', name: '.338 Lapua Magnum', diameterIn: 0.338, defaultTwistIn: 9.35 },
        { id: '338wm', name: '.338 Win Mag', diameterIn: 0.338, defaultTwistIn: 10 },
        { id: '93x62', name: '9.3x62 / 9.3x74R', diameterIn: 0.366, defaultTwistIn: 14.17 },
        { id: '375hh', name: '.375 H&H Mag', diameterIn: 0.375, defaultTwistIn: 12 },
        { id: '4570', name: '.45-70 Gov\'t', diameterIn: 0.458, defaultTwistIn: 20 },
        { id: '50bmg', name: '.50 BMG', diameterIn: 0.510, defaultTwistIn: 15 },
        { id: '9mm', name: '9x19 mm Parabellum', diameterIn: 0.355, defaultTwistIn: 9.8 },
        { id: '45acp', name: '.45 ACP', diameterIn: 0.451, defaultTwistIn: 16 },
        { id: '357mag', name: '.357 Magnum', diameterIn: 0.357, defaultTwistIn: 18.75 },
        { id: '44mag', name: '.44 Remington Magnum', diameterIn: 0.429, defaultTwistIn: 20 },
        { id: '22wmr', name: '.22 WMR', diameterIn: 0.224, defaultTwistIn: 16 },
        { id: '204ruger', name: '.204 Ruger', diameterIn: 0.204, defaultTwistIn: 12 },
        { id: '2506', name: '.25-06 Rem', diameterIn: 0.257, defaultTwistIn: 10 },
        { id: '65x47lapua', name: '6.5x47 Lapua', diameterIn: 0.264, defaultTwistIn: 8 },
        { id: '308norma', name: '.308 Norma Magnum', diameterIn: 0.308, defaultTwistIn: 10 },
        { id: '85x63', name: '8.5x63 / 8.5x63R', diameterIn: 0.338, defaultTwistIn: 10 },
        { id: '416rigby', name: '.416 Rigby', diameterIn: 0.423, defaultTwistIn: 16.5 }
    ];

    const FACTORY_LOADS = [
        { id: 'l1', caliber: '22lr', maker: 'RWS', bullet: 'R50 Match', grains: 40, bc: 0.130, v0: 330 },
        { id: 'l2', caliber: '22lr', maker: 'Lapua', bullet: 'Center-X', grains: 40, bc: 0.132, v0: 327 },
        { id: 'l3', caliber: '22lr', maker: 'CCI', bullet: 'Standard Velocity LRN', grains: 40, bc: 0.125, v0: 326 },
        { id: 'l4', caliber: '22lr', maker: 'CCI', bullet: 'Mini-Mag CPRN', grains: 36, bc: 0.095, v0: 384 },
        { id: 'l5', caliber: '22lr', maker: 'SK', bullet: 'Long Range Match', grains: 40, bc: 0.135, v0: 329 },
        { id: 'l6', caliber: '17hmr', maker: 'Hornady', bullet: 'V-MAX', grains: 17, bc: 0.125, v0: 777 },
        { id: 'l7', caliber: '17hmr', maker: 'CCI', bullet: 'A17 Varmint Tip', grains: 17, bc: 0.125, v0: 808 },
        { id: 'l8', caliber: '17hmr', maker: 'Federal', bullet: 'Premium V-Shok', grains: 17, bc: 0.125, v0: 777 },
        { id: 'l9', caliber: '222rem', maker: 'RWS', bullet: 'SJ 3.24g (50gr)', grains: 50, bc: 0.215, v0: 970 },
        { id: 'l10', caliber: '222rem', maker: 'S&B', bullet: 'SP 3.24g (50gr)', grains: 50, bc: 0.205, v0: 960 },
        { id: 'l11', caliber: '222rem', maker: 'Norma', bullet: 'Oryx 3.6g (55gr)', grains: 55, bc: 0.245, v0: 920 },
        { id: 'l12', caliber: '223rem', maker: 'Hornady', bullet: 'ELD Match', grains: 75, bc: 0.435, v0: 850 },
        { id: 'l13', caliber: '223rem', maker: 'Federal', bullet: 'Gold Medal Sierra MatchKing', grains: 77, bc: 0.372, v0: 826 },
        { id: 'l14', caliber: '223rem', maker: 'S&B', bullet: 'FMJ 55gr', grains: 55, bc: 0.243, v0: 990 },
        { id: 'l15', caliber: '223rem', maker: 'RWS', bullet: 'Hit 55gr', grains: 55, bc: 0.235, v0: 975 },
        { id: 'l16', caliber: '223rem', maker: 'Geco', bullet: 'Express 55gr', grains: 55, bc: 0.240, v0: 995 },
        { id: 'l17', caliber: '243win', maker: 'Hornady', bullet: 'ELD-X', grains: 90, bc: 0.405, v0: 930 },
        { id: 'l18', caliber: '243win', maker: 'Federal', bullet: 'Power-Shok SP', grains: 100, bc: 0.340, v0: 902 },
        { id: 'l19', caliber: '243win', maker: 'RWS', bullet: 'KS 6.2g (95gr)', grains: 95, bc: 0.330, v0: 940 },
        { id: 'l20', caliber: '6mmbr', maker: 'Lapua', bullet: 'Scenar-L', grains: 105, bc: 0.530, v0: 865 },
        { id: 'l21', caliber: '6mmcreed', maker: 'Hornady', bullet: 'ELD Match', grains: 108, bc: 0.536, v0: 902 },
        { id: 'l22', caliber: '6mmcreed', maker: 'Federal', bullet: 'Berger Hybrid Target', grains: 105, bc: 0.534, v0: 900 },
        { id: 'l23', caliber: '65grendel', maker: 'Hornady', bullet: 'ELD Match', grains: 123, bc: 0.510, v0: 785 },
        { id: 'l24', caliber: '65grendel', maker: 'Lapua', bullet: 'Scenar', grains: 123, bc: 0.527, v0: 790 },
        { id: 'l25', caliber: '65creed', maker: 'Hornady', bullet: 'ELD-M', grains: 140, bc: 0.610, v0: 820 },
        { id: 'l26', caliber: '65creed', maker: 'Hornady', bullet: 'ELD-X', grains: 143, bc: 0.625, v0: 826 },
        { id: 'l27', caliber: '65creed', maker: 'Federal', bullet: 'Gold Medal Berger Hybrid', grains: 140, bc: 0.618, v0: 814 },
        { id: 'l28', caliber: '65creed', maker: 'S&B', bullet: 'Match HPBT', grains: 142, bc: 0.595, v0: 810 },
        { id: 'l29', caliber: '65creed', maker: 'Lapua', bullet: 'Scenar-L', grains: 136, bc: 0.568, v0: 830 },
        { id: 'l30', caliber: '65prc', maker: 'Hornady', bullet: 'ELD Match', grains: 147, bc: 0.697, v0: 887 },
        { id: 'l31', caliber: '65prc', maker: 'Hornady', bullet: 'Precision Hunter ELD-X', grains: 143, bc: 0.625, v0: 901 },
        { id: 'l32', caliber: '65x55se', maker: 'Norma', bullet: 'Golden Target', grains: 130, bc: 0.509, v0: 820 },
        { id: 'l33', caliber: '65x55se', maker: 'Lapua', bullet: 'Mega', grains: 156, bc: 0.365, v0: 760 },
        { id: 'l34', caliber: '65x57', maker: 'RWS', bullet: 'DK 9.1g (140gr)', grains: 140, bc: 0.440, v0: 850 },
        { id: 'l35', caliber: '270win', maker: 'Federal', bullet: 'Power-Shok', grains: 130, bc: 0.408, v0: 933 },
        { id: 'l36', caliber: '270win', maker: 'Hornady', bullet: 'ELD-X', grains: 145, bc: 0.536, v0: 895 },
        { id: 'l37', caliber: '270win', maker: 'RWS', bullet: 'ID Classic 8.4g (130gr)', grains: 130, bc: 0.340, v0: 930 },
        { id: 'l38', caliber: '7mm08', maker: 'Hornady', bullet: 'ELD-X', grains: 150, bc: 0.574, v0: 825 },
        { id: 'l39', caliber: '7mm08', maker: 'Federal', bullet: 'Fusion', grains: 140, bc: 0.420, v0: 869 },
        { id: 'l40', caliber: '7x57', maker: 'S&B', bullet: 'SPCE 11.2g (173gr)', grains: 173, bc: 0.385, v0: 755 },
        { id: 'l41', caliber: '7x64', maker: 'RWS', bullet: 'HIT 9.1g (140gr)', grains: 140, bc: 0.355, v0: 900 },
        { id: 'l42', caliber: '7x64', maker: 'Geco', bullet: 'Plus 11.0g (170gr)', grains: 170, bc: 0.390, v0: 820 },
        { id: 'l43', caliber: '7x64', maker: 'S&B', bullet: 'PTS 10.5g (162gr)', grains: 162, bc: 0.515, v0: 855 },
        { id: 'l44', caliber: '7mmremmag', maker: 'Federal', bullet: 'Terminal Ascent', grains: 155, bc: 0.531, v0: 945 },
        { id: 'l45', caliber: '7mmremmag', maker: 'Hornady', bullet: 'ELD-X', grains: 162, bc: 0.631, v0: 896 },
        { id: 'l46', caliber: '7prc', maker: 'Hornady', bullet: 'ELD Match', grains: 180, bc: 0.796, v0: 914 },
        { id: 'l47', caliber: '7prc', maker: 'Hornady', bullet: 'ELD-X', grains: 175, bc: 0.689, v0: 914 },
        { id: 'l48', caliber: '308win', maker: 'Hornady', bullet: '168gr ELD-M', grains: 168, bc: 0.520, v0: 810 },
        { id: 'l49', caliber: '308win', maker: 'Hornady', bullet: 'ELD Match', grains: 178, bc: 0.535, v0: 792 },
        { id: 'l50', caliber: '308win', maker: 'Federal', bullet: 'Gold Medal Sierra MatchKing', grains: 168, bc: 0.462, v0: 808 },
        { id: 'l51', caliber: '308win', maker: 'Federal', bullet: 'Gold Medal SMK', grains: 175, bc: 0.505, v0: 792 },
        { id: 'l52', caliber: '308win', maker: 'Lapua', bullet: 'Scenar-L', grains: 175, bc: 0.508, v0: 785 },
        { id: 'l53', caliber: '308win', maker: 'RWS', bullet: 'Target Elite Plus', grains: 168, bc: 0.470, v0: 800 },
        { id: 'l54', caliber: '308win', maker: 'S&B', bullet: 'Match HPBT', grains: 168, bc: 0.462, v0: 790 },
        { id: 'l55', caliber: '308win', maker: 'Geco', bullet: 'Target 170gr', grains: 170, bc: 0.410, v0: 785 },
        { id: 'l56', caliber: '3006', maker: 'Hornady', bullet: 'ELD-X', grains: 178, bc: 0.535, v0: 823 },
        { id: 'l57', caliber: '3006', maker: 'RWS', bullet: 'HIT 10.7g (165gr)', grains: 165, bc: 0.415, v0: 860 },
        { id: 'l58', caliber: '3006', maker: 'Federal', bullet: 'Power-Shok', grains: 180, bc: 0.474, v0: 823 },
        { id: 'l59', caliber: '3006', maker: 'S&B', bullet: 'SPCE 180gr', grains: 180, bc: 0.390, v0: 800 },
        { id: 'l60', caliber: '300winmag', maker: 'Hornady', bullet: 'ELD Match', grains: 195, bc: 0.587, v0: 880 },
        { id: 'l61', caliber: '300winmag', maker: 'Federal', bullet: 'Gold Medal Berger Hybrid', grains: 215, bc: 0.710, v0: 823 },
        { id: 'l62', caliber: '300winmag', maker: 'Lapua', bullet: 'Scenar-L', grains: 185, bc: 0.545, v0: 895 },
        { id: 'l63', caliber: '300winmag', maker: 'RWS', bullet: 'Speed Tip Pro', grains: 165, bc: 0.470, v0: 940 },
        { id: 'l64', caliber: '300prc', maker: 'Hornady', bullet: 'ELD Match', grains: 225, bc: 0.777, v0: 858 },
        { id: 'l65', caliber: '300prc', maker: 'Federal', bullet: 'Terminal Ascent', grains: 200, bc: 0.590, v0: 890 },
        { id: 'l66', caliber: '300blk', maker: 'Hornady', bullet: 'SUB-X Subsonic', grains: 190, bc: 0.365, v0: 320 },
        { id: 'l67', caliber: '300blk', maker: 'Barnes', bullet: 'VOR-TX TAC-TX', grains: 110, bc: 0.298, v0: 724 },
        { id: 'l68', caliber: '762x39', maker: 'S&B', bullet: 'FMJ 123gr', grains: 123, bc: 0.275, v0: 738 },
        { id: 'l69', caliber: '762x39', maker: 'Hornady', bullet: 'SST', grains: 123, bc: 0.295, v0: 716 },
        { id: 'l70', caliber: '8x57is', maker: 'RWS', bullet: 'HIT 10.4g (160gr)', grains: 160, bc: 0.360, v0: 850 },
        { id: 'l71', caliber: '8x57is', maker: 'Geco', bullet: 'Teilmantel 12.7g (196gr)', grains: 196, bc: 0.315, v0: 770 },
        { id: 'l72', caliber: '8x57is', maker: 'S&B', bullet: 'FMJ 196gr', grains: 196, bc: 0.335, v0: 765 },
        { id: 'l73', caliber: '338lapua', maker: 'Lapua', bullet: 'Scenar', grains: 250, bc: 0.615, v0: 900 },
        { id: 'l74', caliber: '338lapua', maker: 'Lapua', bullet: 'Scenar', grains: 300, bc: 0.736, v0: 825 },
        { id: 'l75', caliber: '338lapua', maker: 'Hornady', bullet: 'ELD Match', grains: 285, bc: 0.775, v0: 826 },
        { id: 'l76', caliber: '338wm', maker: 'Federal', bullet: 'Fusion', grains: 225, bc: 0.495, v0: 853 },
        { id: 'l77', caliber: '338wm', maker: 'Hornady', bullet: 'ELD-X', grains: 230, bc: 0.623, v0: 860 },
        { id: 'l78', caliber: '93x62', maker: 'RWS', bullet: 'UNI Classic 19.0g (293gr)', grains: 293, bc: 0.410, v0: 720 },
        { id: 'l79', caliber: '93x62', maker: 'Norma', bullet: 'Oryx 18.5g (285gr)', grains: 285, bc: 0.330, v0: 720 },
        { id: 'l80', caliber: '375hh', maker: 'Federal', bullet: 'Swift A-Frame', grains: 300, bc: 0.420, v0: 771 },
        { id: 'l81', caliber: '4570', maker: 'Hornady', bullet: 'LEVERevolution FTX', grains: 325, bc: 0.230, v0: 625 },
        { id: 'l82', caliber: '50bmg', maker: 'Hornady', bullet: 'A-MAX', grains: 750, bc: 1.050, v0: 859 },
        { id: 'l83', caliber: '9mm', maker: 'Geco', bullet: 'HEXAGON 124gr', grains: 124, bc: 0.165, v0: 360 },
        { id: 'l84', caliber: '9mm', maker: 'Magtech', bullet: 'FMJ 115gr', grains: 115, bc: 0.145, v0: 346 },
        { id: 'l85', caliber: '45acp', maker: 'Federal', bullet: 'American Eagle FMJ', grains: 230, bc: 0.195, v0: 271 },
        { id: 'l86', caliber: '357mag', maker: 'Magtech', bullet: 'SJHP 158gr', grains: 158, bc: 0.180, v0: 376 },
        { id: 'l87', caliber: '44mag', maker: 'Hornady', bullet: 'XTP 240gr', grains: 240, bc: 0.200, v0: 411 },
        { id: 'l88', caliber: '22wmr', maker: 'CCI', bullet: 'TNT Green', grains: 30, bc: 0.095, v0: 671 },
        { id: 'l89', caliber: '204ruger', maker: 'Hornady', bullet: 'V-MAX', grains: 32, bc: 0.210, v0: 1288 },
        { id: 'l90', caliber: '204ruger', maker: 'Hornady', bullet: 'V-MAX', grains: 40, bc: 0.275, v0: 1116 },
        { id: 'l91', caliber: '2506', maker: 'Hornady', bullet: 'ELD-X', grains: 110, bc: 0.458, v0: 960 },
        { id: 'l92', caliber: '2506', maker: 'Federal', bullet: 'Non-Typical', grains: 117, bc: 0.360, v0: 911 },
        { id: 'l93', caliber: '65x47lapua', maker: 'Lapua', bullet: 'Scenar-L', grains: 136, bc: 0.568, v0: 825 },
        { id: 'l94', caliber: '65x47lapua', maker: 'Hornady', bullet: 'ELD Match', grains: 140, bc: 0.610, v0: 815 },
        { id: 'l95', caliber: '308norma', maker: 'Norma', bullet: 'Oryx', grains: 180, bc: 0.388, v0: 890 },
        { id: 'l96', caliber: '85x63', maker: 'Skadi', bullet: 'Messing-Hohlspitz', grains: 168, bc: 0.380, v0: 885 },
        { id: 'l97', caliber: '85x63', maker: 'Hornady', bullet: 'ELD-X', grains: 200, bc: 0.597, v0: 810 },
        { id: 'l98', caliber: '416rigby', maker: 'Hornady', bullet: 'DGX Bonded', grains: 400, bc: 0.340, v0: 732 },
        { id: 'l99', caliber: '308win', maker: 'Hornady', bullet: 'A-MAX', grains: 155, bc: 0.435, v0: 853 },
        { id: 'l100', caliber: '65creed', maker: 'Norma', bullet: 'Golden Target', grains: 130, bc: 0.509, v0: 840 },
        { id: 'l101', caliber: '300winmag', maker: 'Hornady', bullet: 'ELD-X', grains: 200, bc: 0.597, v0: 865 },
        { id: 'l102', caliber: '223rem', maker: 'Lapua', bullet: 'Scenar', grains: 69, bc: 0.301, v0: 860 }
    ];

    // -------------------------------------------------------------------------
    // 2. GEO-FALLBACK STÄDTELISTE (25 Städte: DE, AT, CH, USA)
    // -------------------------------------------------------------------------
    const CITIES_FALLBACK = [
        { name: 'Berlin (DE)', lat: 52.5200 },
        { name: 'München (DE)', lat: 48.1351 },
        { name: 'Stuttgart / Filder (DE)', lat: 48.7000 },
        { name: 'Hamburg (DE)', lat: 53.5511 },
        { name: 'Köln (DE)', lat: 50.9375 },
        { name: 'Frankfurt am Main (DE)', lat: 50.1109 },
        { name: 'Leipzig (DE)', lat: 51.3397 },
        { name: 'Wien (AT)', lat: 48.2082 },
        { name: 'Graz (AT)', lat: 47.0707 },
        { name: 'Innsbruck (AT)', lat: 47.2692 },
        { name: 'Salzburg (AT)', lat: 47.8095 },
        { name: 'Zürich (CH)', lat: 47.3769 },
        { name: 'Bern (CH)', lat: 46.9480 },
        { name: 'Genf (CH)', lat: 46.2044 },
        { name: 'Basel (CH)', lat: 47.5596 },
        { name: 'Denver, CO (USA)', lat: 39.7392 },
        { name: 'Camp Perry, OH (USA)', lat: 41.5400 },
        { name: 'Raton, NM (USA)', lat: 36.8995 },
        { name: 'Phoenix, AZ (USA)', lat: 33.4484 },
        { name: 'Seattle, WA (USA)', lat: 47.6062 },
        { name: 'Anchorage, AK (USA)', lat: 61.2181 },
        { name: 'Austin, TX (USA)', lat: 30.2672 },
        { name: 'Salt Lake City, UT (USA)', lat: 40.7608 },
        { name: 'Minneapolis, MN (USA)', lat: 44.9778 },
        { name: 'Cheyenne, WY (USA)', lat: 41.1400 }
    ];

    // -------------------------------------------------------------------------
    // 3. LEXIKON / INFO-EINTRÄGE (DE & EN)
    // -------------------------------------------------------------------------
    const LEXICON_ITEMS = [
        {
            id: 'bc',
            title: { de: 'Ballistischer Koeffizient (BC)', en: 'Ballistic Coefficient (BC)' },
            desc: {
                de: 'Der ballistische Koeffizient beschreibt, wie gut ein Geschoss den Luftwiderstand im Vergleich zu einem Referenzgeschoss (G1 oder G7) überwindet. Ein höherer BC bedeutet geringeren Geschwindigkeitsverlust, flachere Flugbahn und weniger Winddrift. Er hängt von Geschossform, Masse und Querschnitt ab.',
                en: 'The ballistic coefficient measures how effectively a projectile overcomes air resistance compared to a standard reference projectile (G1 or G7). A higher BC means less velocity loss, flatter trajectory, and reduced wind drift. It depends on bullet shape, mass, and cross-sectional area.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Ballistischer_Koeffizient',
                en: 'https://en.wikipedia.org/wiki/Ballistic_coefficient'
            }
        },
        {
            id: 'coriolis',
            title: { de: 'Corioliskraft (horizontal)', en: 'Coriolis Effect (Horizontal)' },
            desc: {
                de: 'Durch die Erdrotation wird ein fliegendes Geschoss aus Sicht des Schützen horizontal abgelenkt. Auf der Nordhalbkugel weicht das Geschoss unabhängig von der Schussrichtung nach rechts ab. Der Effekt nimmt mit zunehmender Distanz, Flugzeit und Breitengrad zu.',
                en: 'Earth’s rotation deflects a projectile horizontally relative to the shooter’s frame of reference. In the Northern Hemisphere, the bullet deflects to the right regardless of firing direction. The effect grows with distance, time of flight, and latitude.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Corioliskraft',
                en: 'https://en.wikipedia.org/wiki/Coriolis_force'
            }
        },
        {
            id: 'eotvos',
            title: { de: 'Eötvös-Effekt', en: 'Eötvös Effect' },
            desc: {
                de: 'Der Eötvös-Effekt ist die vertikale Komponente der Corioliskraft bei Bewegungen in Ost- oder Westrichtung. Bei einem Schuss nach Osten addiert sich die Geschossgeschwindigkeit zur Erdrotation und verringert die scheinbare Schwerkraft leicht (Treffpunkt höher). Nach Westen wirkt er umgekehrt (Treffpunkt tiefer).',
                en: 'The Eötvös effect is the vertical component of the Coriolis force when firing east or west. Firing east adds to Earth’s rotational speed and slightly reduces apparent gravity (higher impact). Firing west has the opposite effect (lower impact).'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/E%C3%B6tv%C3%B6s-Effekt',
                en: 'https://en.wikipedia.org/wiki/E%C3%B6tv%C3%B6s_effect'
            }
        },
        {
            id: 'spindrift',
            title: { de: 'Spin Drift (Kreiseldrift)', en: 'Spin Drift' },
            desc: {
                de: 'Ein drallstabilisiertes Geschoss folgt seiner Flugbahn leicht nickend und wird durch die Kreiselpräzession seitlich abgelenkt. Bei Rechtsdrall driftet das Geschoss nach rechts, bei Linksdrall nach links. Besonders auf weite Distanzen mit langer Flugzeit wird Spin Drift relevant.',
                en: 'A spin-stabilized bullet experiences slight yaw precession during flight, resulting in a lateral drift. Right-hand twist drifts right; left-hand twist drifts left. Spin drift becomes especially noticeable at longer ranges with longer flight times.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Pr%C3%A4zession',
                en: 'https://en.wikipedia.org/wiki/External_ballistics'
            }
        },
        {
            id: 'density_altitude',
            title: { de: 'Dichtehöhe (Density Altitude)', en: 'Density Altitude' },
            desc: {
                de: 'Die Dichtehöhe gibt an, in welcher Höhe der ICAO-Standardatmosphäre die aktuell gemessene Luftdichte herrscht. Hohe Temperaturen, niedriger Luftdruck und hohe Luftfeuchtigkeit senken die Luftdichte und erhöhen die Dichtehöhe. Dünnere Luft verringert den Luftwiderstand und lässt das Geschoss flacher fliegen.',
                en: 'Density altitude is the altitude in the ISA standard atmosphere corresponding to the current air density. High temperature, low pressure, and high humidity decrease air density and increase density altitude. Less dense air reduces drag, flattening the trajectory.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Dichteh%C3%B6he',
                en: 'https://en.wikipedia.org/wiki/Density_altitude'
            }
        },
        {
            id: 'zero_conditions',
            title: { de: 'Zero-Bedingungen (Einschießbedingungen)', en: 'Zero Conditions' },
            desc: {
                de: 'Wird eine Waffe z. B. im Sommer bei 30 °C auf 100 m eingeschossen, gilt der ermittelte Abgangswinkel zunächst für diese Luftdichte. Ändert sich das Wetter später (z. B. Kälte im Winter), weicht der Treffpunkt auf Distanz ab. Die App berechnet den Abgangswinkel unter Zero-Wetter und simuliert den Flug mit aktuellem Wetter.',
                en: 'If a rifle is zeroed at 100 m in summer at 30 °C, the firing angle matches that air density. When weather changes later (e.g., cold winter air), impact shifts at distance. The app solves firing angle under zero weather and simulates flight under current weather.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Visierlinie',
                en: 'https://en.wikipedia.org/wiki/Sight_(firearm)'
            }
        },
        {
            id: 'wind',
            title: { de: 'Wind & Querwind-Drift', en: 'Wind & Crosswind Drift' },
            desc: {
                de: 'Querwind versetzt das Geschoss seitlich, weil die Luftmasse relativ zur Flugbahn bewegt wird und das Geschoss durch Verzögerung länger in der Luft bleibt als im Vakuum. 0° bedeutet Wind von vorne, 90° von rechts, 180° von hinten und 270° von links. Mit zunehmender Distanz steigt die Winddrift überproportional an.',
                en: 'Crosswind pushes the bullet laterally because the air mass moves relative to the flight path and aerodynamic drag increases time of flight over vacuum flight. 0° is headwind, 90° from right, 180° tailwind, and 270° from left. Wind drift grows nonlinearly with range.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Au%C3%9Fenballistik',
                en: 'https://en.wikipedia.org/wiki/External_ballistics'
            }
        },
        {
            id: 'miller',
            title: { de: 'Miller-Stabilitätsfaktor (Sg)', en: 'Miller Stability Factor (Sg)' },
            desc: {
                de: 'Der Miller-Faktor schätzt ab, ob die Drallrate des Laufs das Geschoss im Flug stabil hält. Werte unter 1,0 deuten auf Instabilität hin, 1,0–1,3 sind grenzwertig, 1,3–2,0 gelten als optimal und über 2,0 als überstabilisiert. Auch Luftdichte und Mündungsgeschwindigkeit beeinflussen den Wert.',
                en: 'The Miller stability factor estimates whether barrel twist rate keeps a projectile gyroscopically stable in flight. Values below 1.0 suggest instability, 1.0–1.3 are marginal, 1.3–2.0 are optimal, and above 2.0 over-stabilized. Air density and muzzle velocity also play a role.'
            },
            wiki: {
                de: 'https://de.wikipedia.org/wiki/Drall',
                en: 'https://en.wikipedia.org/wiki/Rifling'
            }
        }
    ];

    // -------------------------------------------------------------------------
    // 4. ÜBERSETZUNGEN (i18n DE / EN)
    // -------------------------------------------------------------------------
    const I18N = {
        de: {
            appTitle: 'Ballistik & Schießbuch PWA v0.1',
            disclaimerBanner: 'Nur für Sportschützen. Werte immer mit realen Schussdaten verifizieren.',
            privacyFooter: 'Datenschutz: Standort wird nur für den Wetter-Abruf verwendet und nicht gespeichert. Alle anderen Daten bleiben lokal im Browser.',
            tabCalc: 'Ballistik-Rechner',
            tabWeapons: 'Waffen & Munition',
            tabLog: 'Schießtagebuch',
            tabLexicon: 'Lexikon',
            caliber: 'Kaliber',
            loadSelect: 'Laborierung (Hersteller / Geschoss)',
            allCalibers: 'Alle Kaliber',
            searchLoad: 'Suche (Hersteller / Geschoss)...',
            bulletWeight: 'Geschossgewicht (gr)',
            dragModel: 'Widerstandsmodell',
            bcValue: 'Ballistischer Koeffizient (BC)',
            v0Label: 'Mündungsgeschwindigkeit V0',
            v0Note: 'Herstellerangaben ca. 24" Lauflänge – ggf. an eigene Waffe anpassen.',
            sightHeight: 'Visierhöhe (Pflicht)',
            zeroDist: 'Einschießdistanz (Zero)',
            maxDist: 'Maximaldistanz',
            stepDist: 'Schrittweite',
            shotAngle: 'Schusswinkel (°, + bergauf)',
            windSpeed: 'Windgeschwindigkeit',
            windDir: 'Windrichtung (°)',
            windDirHint: '0° vorne · 90° rechts · 180° hinten · 270° links',
            clickUnit: 'Klickwert',
            weatherSection: 'Wetter & Atmosphäre',
            tempLabel: 'Temperatur',
            pressureLabel: 'Luftdruck (hPa)',
            humidityLabel: 'Luftfeuchtigkeit (%)',
            fetchWeatherBtn: 'Wetter via GPS laden',
            geoFallbackLabel: 'Geo-Fallback (Breitengrad)',
            latitudeLabel: 'Breitengrad (°)',
            azimuthLabel: 'Azimut / Schussrichtung (°)',
            zeroWeatherSection: 'Zero-Bedingungen',
            sameWeatherAsCurrent: 'Gleiches Wetter wie aktuell',
            zeroTempLabel: 'Zero-Temperatur',
            zeroPressureLabel: 'Zero-Luftdruck (hPa)',
            zeroHumidityLabel: 'Zero-Feuchte (%)',
            sensorSection: 'Smartphone-Sensoren (Winkel & Azimut)',
            sensorBtn: 'Sensor-Snapshot (5 Messungen / 2s)',
            sensorIdle: 'Bereit für 5 Messungen in 2 Sekunden.',
            sensorMeasuring: 'Messe Lagesensoren (2s)...',
            sensorNoApi: 'Lagesensoren oder Kompass nicht verfügbar. Bitte Winkel und Azimut manuell eingeben.',
            sensorDenied: 'Sensor-Berechtigung verweigert. Bitte Werte manuell eingeben.',
            sensorSpread: 'Streuung',
            sensorGreen: 'Ruhig / Plausibel',
            sensorYellow: 'Leichtes Zittern',
            sensorRed: 'Ausreißer / Unplausibel',
            compareToggle: '2. Munition vergleichen',
            compareTitle: 'Vergleichs-Munition (Munition B)',
            e0Label: 'Mündungsenergie (E0)',
            densityAltLabel: 'Dichtehöhe (DA)',
            airDensityLabel: 'Luftdichte',
            transonicLabel: 'Transsonik (Mach 1)',
            transonicNone: 'Nicht erreicht',
            tableDist: 'Distanz',
            tableDrop: 'Drop',
            tableMil: 'MIL',
            tableClicks: 'Klicks',
            tableVel: 'Geschw. (v)',
            tableEnergy: 'Energie',
            tableTof: 'Flugzeit',
            tableCoriolis: 'Coriolis',
            tableSpin: 'Spin Drift',
            tableWind: 'Winddrift',
            tableDiff: 'Diff. Drop (A-B)',
            graphTitle: 'Flugbahn relativ zur Visierlinie (Nulllinie)',
            graphSightLine: 'Visierlinie (0)',
            graphTransonic: 'Transsonik',
            graphBulletA: 'Munition A',
            graphBulletB: 'Munition B',
            toLogBtn: 'Ins Logbuch',
            weaponFormTitle: 'Waffenprofil anlegen',
            weaponName: 'Waffenname',
            weaponCaliber: 'Kaliber',
            barrelLen: 'Lauflänge (Zoll, nur Doku)',
            twistRate: 'Dralllänge / Twist (Zoll)',
            twistDir: 'Drallrichtung',
            twistRight: 'Rechtsdrall',
            twistLeft: 'Linksdrall',
            saveWeaponBtn: 'Waffe speichern',
            savedWeaponsTitle: 'Gespeicherte Waffen',
            activeWeapon: 'Aktiv',
            useWeaponBtn: 'Auswählen',
            deleteBtn: 'Löschen',
            customLoadTitle: 'Eigene Laborierung anlegen',
            customLoadName: 'Bezeichnung (Hersteller + Geschoss)',
            saveCustomLoadBtn: 'Laborierung speichern',
            millerTitle: 'Miller-Stabilitäts-Check',
            millerSg: 'Stabilitätsfaktor Sg',
            millerLenCal: 'Geschosslänge (Kaliber)',
            millerUnstable: 'Instabil (< 1,0)',
            millerMarginal: 'Grenzwertig (1,0 – 1,3)',
            millerOptimal: 'Optimal (1,3 – 2,0)',
            millerOver: 'Überstabilisiert (> 2,0)',
            backupTitle: 'Datensicherung (JSON Export / Import)',
            exportJsonBtn: 'JSON Export',
            importJsonBtn: 'JSON Import',
            logTitle: 'Schießtagebuch',
            logDate: 'Datum',
            logWeapon: 'Waffe',
            logDistance: 'Distanz',
            logGroup: 'Streukreis (mm, optional)',
            logWeather: 'Wetter kurz (optional)',
            logNotes: 'Ergebnis / Notiz',
            saveLogBtn: 'Eintrag speichern',
            openWiki: 'Wikipedia öffnen',
            closeModal: 'Schließen',
            weatherError: 'Wetterabruf fehlgeschlagen (GPS abgelehnt oder kein Netz). Bitte manuell eingeben.',
            weatherSuccess: 'Aktuelle Wetterdaten von Open-Meteo übernommen.',
            savedMsg: 'Gespeichert.',
            importedMsg: 'Backup erfolgreich importiert.',
            importError: 'Ungültige JSON-Backup-Datei.',
            logAddedMsg: 'Eintrag ins Schießtagebuch übernommen.'
        },
        en: {
            appTitle: 'Ballistics & Range Logbook PWA v0.1',
            disclaimerBanner: 'For sport shooters only. Always verify values with real-world shot data.',
            privacyFooter: 'Privacy: Location is used solely for weather lookup and is never stored. All other data stays locally in your browser.',
            tabCalc: 'Ballistics Calculator',
            tabWeapons: 'Weapons & Ammo',
            tabLog: 'Range Logbook',
            tabLexicon: 'Lexicon',
            caliber: 'Caliber',
            loadSelect: 'Load (Maker / Bullet)',
            allCalibers: 'All Calibers',
            searchLoad: 'Search (maker / bullet)...',
            bulletWeight: 'Bullet Weight (gr)',
            dragModel: 'Drag Model',
            bcValue: 'Ballistic Coefficient (BC)',
            v0Label: 'Muzzle Velocity V0',
            v0Note: 'Factory data ~24" barrel – adjust manually for your rifle.',
            sightHeight: 'Sight Height (Required)',
            zeroDist: 'Zero Distance',
            maxDist: 'Max Distance',
            stepDist: 'Step Interval',
            shotAngle: 'Shot Angle (°, + uphill)',
            windSpeed: 'Wind Speed',
            windDir: 'Wind Direction (°)',
            windDirHint: '0° headwind · 90° from right · 180° tailwind · 270° from left',
            clickUnit: 'Click Value',
            weatherSection: 'Weather & Atmosphere',
            tempLabel: 'Temperature',
            pressureLabel: 'Pressure (hPa)',
            humidityLabel: 'Humidity (%)',
            fetchWeatherBtn: 'Fetch Weather via GPS',
            geoFallbackLabel: 'Geo Fallback (Latitude)',
            latitudeLabel: 'Latitude (°)',
            azimuthLabel: 'Azimuth / Firing Heading (°)',
            zeroWeatherSection: 'Zero Conditions',
            sameWeatherAsCurrent: 'Same weather as current',
            zeroTempLabel: 'Zero Temperature',
            zeroPressureLabel: 'Zero Pressure (hPa)',
            zeroHumidityLabel: 'Zero Humidity (%)',
            sensorSection: 'Smartphone Sensors (Angle & Azimuth)',
            sensorBtn: 'Sensor Snapshot (5 reads / 2s)',
            sensorIdle: 'Ready for 5 measurements in 2 seconds.',
            sensorMeasuring: 'Reading orientation sensors (2s)...',
            sensorNoApi: 'Orientation/compass sensors unavailable. Enter angle and azimuth manually.',
            sensorDenied: 'Sensor permission denied. Enter values manually.',
            sensorSpread: 'Spread',
            sensorGreen: 'Steady / Plausible',
            sensorYellow: 'Slight Tremor',
            sensorRed: 'Outlier / Unplausible',
            compareToggle: 'Compare 2nd Ammo',
            compareTitle: 'Comparison Load (Ammo B)',
            e0Label: 'Muzzle Energy (E0)',
            densityAltLabel: 'Density Altitude (DA)',
            airDensityLabel: 'Air Density',
            transonicLabel: 'Transonic (Mach 1)',
            transonicNone: 'Not reached',
            tableDist: 'Range',
            tableDrop: 'Drop',
            tableMil: 'MIL',
            tableClicks: 'Clicks',
            tableVel: 'Vel. (v)',
            tableEnergy: 'Energy',
            tableTof: 'TOF',
            tableCoriolis: 'Coriolis',
            tableSpin: 'Spin Drift',
            tableWind: 'Wind Drift',
            tableDiff: 'Diff. Drop (A-B)',
            graphTitle: 'Trajectory Relative to Sight Line (Zero Line)',
            graphSightLine: 'Sight Line (0)',
            graphTransonic: 'Transonic',
            graphBulletA: 'Ammo A',
            graphBulletB: 'Ammo B',
            toLogBtn: 'Send to Logbook',
            weaponFormTitle: 'Add Weapon Profile',
            weaponName: 'Weapon Name',
            weaponCaliber: 'Caliber',
            barrelLen: 'Barrel Length (in, doc only)',
            twistRate: 'Twist Rate (in)',
            twistDir: 'Twist Direction',
            twistRight: 'Right Twist',
            twistLeft: 'Left Twist',
            saveWeaponBtn: 'Save Weapon',
            savedWeaponsTitle: 'Saved Weapons',
            activeWeapon: 'Active',
            useWeaponBtn: 'Select',
            deleteBtn: 'Delete',
            customLoadTitle: 'Create Custom Load',
            customLoadName: 'Name (Maker + Bullet)',
            saveCustomLoadBtn: 'Save Load',
            millerTitle: 'Miller Stability Check',
            millerSg: 'Stability Factor Sg',
            millerLenCal: 'Bullet Length (Calibers)',
            millerUnstable: 'Unstable (< 1.0)',
            millerMarginal: 'Marginal (1.0 – 1.3)',
            millerOptimal: 'Optimal (1.3 – 2.0)',
            millerOver: 'Over-stabilized (> 2.0)',
            backupTitle: 'Backup (JSON Export / Import)',
            exportJsonBtn: 'JSON Export',
            importJsonBtn: 'JSON Import',
            logTitle: 'Range Logbook',
            logDate: 'Date',
            logWeapon: 'Weapon',
            logDistance: 'Range',
            logGroup: 'Group Size (mm, optional)',
            logWeather: 'Weather Notes (optional)',
            logNotes: 'Result / Notes',
            saveLogBtn: 'Save Entry',
            openWiki: 'Open Wikipedia',
            closeModal: 'Close',
            weatherError: 'Weather fetch failed (GPS denied or offline). Please enter manually.',
            weatherSuccess: 'Current weather loaded from Open-Meteo.',
            savedMsg: 'Saved.',
            importedMsg: 'Backup imported successfully.',
            importError: 'Invalid JSON backup file.',
            logAddedMsg: 'Added entry to range logbook.'
        }
    };

    // -------------------------------------------------------------------------
    // 5. STANDARD-STATE & DATEN-MIGRATION
    // -------------------------------------------------------------------------
    function getDefaultState() {
        return {
            version: APP_VERSION,
            lang: 'de',
            units: 'metric',
            activeTab: 'calc',
            activeWeaponId: 'w_default_308',
            weapons: [
                {
                    id: 'w_default_308',
                    name: 'Match-Repetierer .308 Win',
                    caliberId: '308win',
                    barrelLengthIn: 24,
                    twistRateIn: 10,
                    twistDirection: 'right',
                    sightHeightCm: 5.0
                }
            ],
            customLoads: [],
            logbook: [
                {
                    id: 'log_1',
                    date: new Date().toISOString().slice(0, 10),
                    weaponId: 'w_default_308',
                    weaponName: 'Match-Repetierer .308 Win',
                    caliberName: '.308 Win / 7.62x51',
                    loadName: 'Hornady 168gr ELD-M',
                    distanceM: 300,
                    groupSizeMm: 24,
                    weatherShort: '15°C, 1013 hPa, Wind 0',
                    notes: 'Erste Probeladung auf 300 m, ruhige Bedingungen.'
                }
            ],
            calc: {
                caliberFilter: '308win',
                loadId: 'l48',
                loadSearch: '',
                bulletWeightGrains: 168,
                bc: 0.520,
                dragModel: 'G1',
                v0Ms: 810,
                sightHeightCm: 5.0,
                zeroDistanceM: 100,
                maxDistanceM: 600,
                stepDistanceM: 50,
                shotAngleDeg: 0,
                windSpeedMs: 0,
                windDirectionDeg: 0,
                clickUnit: 'MIL',
                tempC: 15.0,
                pressureHpa: 1013.0,
                humidityPercent: 50.0,
                latitudeDeg: 48.7,
                azimuthDeg: 0,
                sameWeatherAsCurrent: true,
                zeroTempC: 15.0,
                zeroPressureHpa: 1013.0,
                zeroHumidityPercent: 50.0,
                compareEnabled: false,
                compareCaliberId: '65creed',
                compareLoadId: 'l25',
                compareV0Ms: 820,
                compareBc: 0.610,
                compareGrains: 140
            },
            logDraft: {
                date: new Date().toISOString().slice(0, 10),
                weaponId: 'w_default_308',
                caliberName: '.308 Win / 7.62x51',
                loadName: 'Hornady 168gr ELD-M',
                distanceM: 100,
                groupSizeMm: '',
                weatherShort: '',
                notes: ''
            }
        };
    }

    function migrateAndLoadState() {
        const defaults = getDefaultState();
        let raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            for (const oldKey of LEGACY_KEYS) {
                const oldVal = localStorage.getItem(oldKey);
                if (oldVal) {
                    raw = oldVal;
                    break;
                }
            }
        }

        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            return defaults;
        }

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return { ...defaults, weapons: parsed };
            }

            const merged = {
                ...defaults,
                ...parsed,
                version: APP_VERSION,
                lang: parsed.lang === 'en' ? 'en' : 'de',
                units: parsed.units === 'imperial' ? 'imperial' : 'metric',
                weapons: Array.isArray(parsed.weapons) && parsed.weapons.length > 0 ? parsed.weapons : defaults.weapons,
                customLoads: Array.isArray(parsed.customLoads) ? parsed.customLoads : [],
                logbook: Array.isArray(parsed.logbook) ? parsed.logbook : defaults.logbook,
                calc: { ...defaults.calc, ...(parsed.calc || {}) },
                logDraft: { ...defaults.logDraft, ...(parsed.logDraft || {}) }
            };

            if (!isFinite(parseFloat(merged.calc.sightHeightCm)) || parseFloat(merged.calc.sightHeightCm) <= 0) {
                merged.calc.sightHeightCm = 5.0;
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
        } catch (err) {
            console.warn('State-Migration Fehler, nutze Standardwerte:', err);
            return defaults;
        }
    }

    let state = migrateAndLoadState();
    let statusBannerMsg = '';
    let statusBannerType = 'info';
    let activeModalLexiconId = null;

    // Sensor-Snapshot Status
    let sensorState = {
        status: 'idle', // 'idle' | 'measuring' | 'done' | 'error'
        message: '',
        trafficLight: null, // 'green' | 'yellow' | 'red'
        spreadDeg: 0,
        meanAngleDeg: 0,
        meanAzimuthDeg: 0
    };

    function saveState() {
        try {
            state.version = APP_VERSION;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error('Fehler beim Speichern in LocalStorage:', err);
        }
    }

    function t(key) {
        const langDict = I18N[state.lang] || I18N.de;
        return langDict[key] || I18N.de[key] || key;
    }

    function setNotice(msg, type = 'info') {
        statusBannerMsg = msg;
        statusBannerType = type;
        render();
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // -------------------------------------------------------------------------
    // 6. EINHEITEN-FORMATIERUNG (Intern metrisch -> Anzeige Metrisch / Imperial)
    // -------------------------------------------------------------------------
    function isImp() {
        return state.units === 'imperial';
    }

    function fmtDistInput(meters) {
        const m = parseFloat(meters) || 0;
        return isImp() ? (m * 1.0936133).toFixed(0) : m.toFixed(0);
    }

    function parseDistInput(val) {
        const n = parseFloat(val);
        if (!isFinite(n)) return 0;
        return isImp() ? n / 1.0936133 : n;
    }

    function fmtSightInput(cm) {
        const c = isFinite(parseFloat(cm)) ? parseFloat(cm) : 5.0;
        return isImp() ? (c / 2.54).toFixed(2) : c.toFixed(1);
    }

    function parseSightInput(val) {
        const n = parseFloat(val);
        if (!isFinite(n) || n <= 0) return 5.0;
        return isImp() ? n * 2.54 : n;
    }

    function fmtVelInput(ms) {
        const v = parseFloat(ms) || 0;
        return isImp() ? (v * 3.2808399).toFixed(0) : v.toFixed(0);
    }

    function parseVelInput(val) {
        const n = parseFloat(val);
        if (!isFinite(n)) return 0;
        return isImp() ? n / 3.2808399 : n;
    }

    function fmtTempInput(c) {
        const temp = isFinite(parseFloat(c)) ? parseFloat(c) : 15;
        return isImp() ? ((temp * 9) / 5 + 32).toFixed(1) : temp.toFixed(1);
    }

    function parseTempInput(val) {
        const n = parseFloat(val);
        if (!isFinite(n)) return 15;
        return isImp() ? ((n - 32) * 5) / 9 : n;
    }

    function fmtWindInput(ms) {
        const w = parseFloat(ms) || 0;
        return isImp() ? (w / 0.44704).toFixed(1) : w.toFixed(1);
    }

    function parseWindInput(val) {
        const n = parseFloat(val);
        if (!isFinite(n)) return 0;
        return isImp() ? n * 0.44704 : n;
    }

    function fmtDropDisplay(cm) {
        const v = isFinite(cm) ? cm : 0;
        return isImp() ? `${(v / 2.54).toFixed(1)} in` : `${v.toFixed(1)} cm`;
    }

    function fmtEnergyDisplay(joules) {
        const j = isFinite(joules) ? joules : 0;
        return isImp() ? `${(j * 0.7375621).toFixed(0)} ft-lb` : `${j.toFixed(0)} J`;
    }

    function fmtAltitudeDisplay(meters) {
        const m = isFinite(meters) ? meters : 0;
        return isImp() ? `${(m * 3.2808399).toFixed(0)} ft` : `${m.toFixed(0)} m`;
    }

    function distUnitLabel() {
        return isImp() ? 'yd' : 'm';
    }

    // -------------------------------------------------------------------------
    // 7. WETTER-API (Open-Meteo, niemals gecacht, kein Speichern von GPS)
    // -------------------------------------------------------------------------
    async function fetchWeatherByGps() {
        if (!navigator.geolocation) {
            setNotice(t('weatherError'), 'error');
            return;
        }

        setNotice(state.lang === 'de' ? 'Ermittle GPS-Standort...' : 'Locating via GPS...', 'info');

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                // Breitengrad einmalig für Coriolis übernehmen, GPS-Koordinaten nicht dauerhaft speichern
                state.calc.latitudeDeg = Number(lat.toFixed(4));

                try {
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,surface_pressure`;
                    const resp = await fetch(url, { cache: 'no-store' });
                    if (!resp.ok) throw new Error('Weather HTTP error');
                    const data = await resp.json();
                    const curr = data.current || {};

                    if (isFinite(curr.temperature_2m)) state.calc.tempC = curr.temperature_2m;
                    if (isFinite(curr.surface_pressure)) state.calc.pressureHpa = curr.surface_pressure;
                    if (isFinite(curr.relative_humidity_2m)) state.calc.humidityPercent = curr.relative_humidity_2m;

                    saveState();
                    setNotice(t('weatherSuccess'), 'success');
                } catch (err) {
                    setNotice(t('weatherError'), 'error');
                }
            },
            () => {
                setNotice(t('weatherError'), 'error');
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
        );
    }

    // -------------------------------------------------------------------------
    // 8. SMARTPHONE-SENSOREN (DeviceOrientationEvent, 5 Messungen in 2s)
    // -------------------------------------------------------------------------
    async function startSensorSnapshot() {
        if (typeof window.DeviceOrientationEvent === 'undefined') {
            sensorState = { status: 'error', message: t('sensorNoApi'), trafficLight: null, spreadDeg: 0 };
            render();
            return;
        }

        // iOS 13+ Berechtigungsabfrage
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const perm = await DeviceOrientationEvent.requestPermission();
                if (perm !== 'granted') {
                    sensorState = { status: 'error', message: t('sensorDenied'), trafficLight: null, spreadDeg: 0 };
                    render();
                    return;
                }
            } catch (err) {
                sensorState = { status: 'error', message: t('sensorDenied'), trafficLight: null, spreadDeg: 0 };
                render();
                return;
            }
        }

        sensorState = { status: 'measuring', message: t('sensorMeasuring'), trafficLight: null, spreadDeg: 0 };
        render();

        let latestAlpha = null;
        let latestBeta = null;

        const handler = (ev) => {
            // iOS liefert webkitCompassHeading (0 = Nord, im Uhrzeigersinn)
            if (typeof ev.webkitCompassHeading === 'number' && isFinite(ev.webkitCompassHeading)) {
                latestAlpha = ev.webkitCompassHeading;
            } else if (typeof ev.alpha === 'number' && isFinite(ev.alpha)) {
                latestAlpha = (360 - ev.alpha) % 360;
            }
            if (typeof ev.beta === 'number' && isFinite(ev.beta)) {
                latestBeta = ev.beta;
            }
        };

        window.addEventListener('deviceorientation', handler, true);

        const azimuthSamples = [];
        const angleSamples = [];
        let count = 0;

        // 5 Messungen über 2 Sekunden (alle 400 ms)
        const timer = setInterval(() => {
            count++;
            if (latestAlpha !== null) azimuthSamples.push(latestAlpha);
            if (latestBeta !== null) {
                // Schusswinkel: 0° waagerecht (Handy hochkant/flach je nach Haltung begrenzt auf -60..+60°)
                const clampedPitch = Math.max(-60, Math.min(60, latestBeta - 90));
                angleSamples.push(clampedPitch);
            }

            if (count >= 5) {
                clearInterval(timer);
                window.removeEventListener('deviceorientation', handler, true);

                if (azimuthSamples.length === 0 && angleSamples.length === 0) {
                    sensorState = { status: 'error', message: t('sensorNoApi'), trafficLight: null, spreadDeg: 0 };
                    render();
                    return;
                }

                const azStats = BallisticsEngine.calculateCircularStats(
                    azimuthSamples.length > 0 ? azimuthSamples : [state.calc.azimuthDeg]
                );

                // Streuung des Neigungswinkels ebenfalls berücksichtigen
                let angleMean = state.calc.shotAngleDeg;
                let angleSpread = 0;
                if (angleSamples.length > 0) {
                    angleMean = angleSamples.reduce((a, b) => a + b, 0) / angleSamples.length;
                    angleSpread = Math.max(...angleSamples) - Math.min(...angleSamples);
                }

                const totalSpread = Math.max(azStats.spreadDeg, angleSpread);
                let light = 'green';
                if (totalSpread >= 8.0) light = 'red';
                else if (totalSpread >= 3.0) light = 'yellow';

                state.calc.azimuthDeg = Number(azStats.meanDeg.toFixed(1));
                state.calc.shotAngleDeg = Number(angleMean.toFixed(1));

                sensorState = {
                    status: 'done',
                    trafficLight: light,
                    spreadDeg: totalSpread,
                    meanAngleDeg: state.calc.shotAngleDeg,
                    meanAzimuthDeg: state.calc.azimuthDeg,
                    message: light === 'green' ? t('sensorGreen') : (light === 'yellow' ? t('sensorYellow') : t('sensorRed'))
                };

                saveState();
                render();
            }
        }, 400);
    }

    // -------------------------------------------------------------------------
    // 9. HILFSFUNKTIONEN FÜR MUNITION, WAFFEN, LOGBUCH & BACKUP
    // -------------------------------------------------------------------------
    function getAllLoads() {
        return [...state.customLoads, ...FACTORY_LOADS];
    }

    function getActiveWeapon() {
        return state.weapons.find(w => w.id === state.activeWeaponId) || state.weapons[0];
    }

    function getCaliberById(id) {
        return CALIBERS.find(c => c.id === id) || CALIBERS.find(c => c.id === '308win');
    }

    function applyLoadToCalc(loadId, isComparison = false) {
        const load = getAllLoads().find(l => l.id === loadId);
        if (!load) return;
        if (isComparison) {
            state.calc.compareLoadId = load.id;
            state.calc.compareCaliberId = load.caliber;
            state.calc.compareGrains = load.grains;
            state.calc.compareBc = load.bc;
            state.calc.compareV0Ms = load.v0;
        } else {
            state.calc.loadId = load.id;
            state.calc.caliberFilter = load.caliber;
            state.calc.bulletWeightGrains = load.grains;
            state.calc.bc = load.bc;
            state.calc.v0Ms = load.v0;
        }
        saveState();
        render();
    }

    function selectWeapon(weaponId) {
        const w = state.weapons.find(item => item.id === weaponId);
        if (!w) return;
        state.activeWeaponId = w.id;
        state.calc.caliberFilter = w.caliberId;
        state.calc.sightHeightCm = isFinite(parseFloat(w.sightHeightCm)) && w.sightHeightCm > 0 ? parseFloat(w.sightHeightCm) : 5.0;

        // Passende erste Laborierung des Kalibers wählen
        const firstLoad = getAllLoads().find(l => l.caliber === w.caliberId);
        if (firstLoad) {
            state.calc.loadId = firstLoad.id;
            state.calc.bulletWeightGrains = firstLoad.grains;
            state.calc.bc = firstLoad.bc;
            state.calc.v0Ms = firstLoad.v0;
        }
        saveState();
        setNotice(`${t('activeWeapon')}: ${w.name}`, 'success');
    }

    function sendCurrentCalcToLogbook() {
        const weapon = getActiveWeapon();
        const cal = getCaliberById(state.calc.caliberFilter);
        const load = getAllLoads().find(l => l.id === state.calc.loadId);
        const loadLabel = load ? `${load.maker} ${load.bullet}` : `${state.calc.bulletWeightGrains}gr (BC ${state.calc.bc})`;

        state.logDraft = {
            date: new Date().toISOString().slice(0, 10),
            weaponId: weapon ? weapon.id : '',
            caliberName: cal ? cal.name : state.calc.caliberFilter,
            loadName: loadLabel,
            distanceM: Math.round(state.calc.maxDistanceM),
            groupSizeMm: '',
            weatherShort: `${state.calc.tempC}°C, ${state.calc.pressureHpa} hPa, Wind ${state.calc.windSpeedMs} m/s (${state.calc.windDirectionDeg}°)`,
            notes: `Zero: ${state.calc.zeroDistanceM}m, V0: ${state.calc.v0Ms} m/s, BC: ${state.calc.bc} (${state.calc.dragModel})`
        };
        state.activeTab = 'log';
        saveState();
        setNotice(t('logAddedMsg'), 'info');
    }

    function exportBackupJson() {
        const payload = {
            version: APP_VERSION,
            exported: new Date().toISOString(),
            weapons: state.weapons,
            customLoads: state.customLoads,
            logbook: state.logbook,
            calc: state.calc
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ballistik-backup-v${APP_VERSION}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importBackupJson(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.weapons)) {
                    setNotice(t('importError'), 'error');
                    return;
                }
                state.weapons = parsed.weapons.length > 0 ? parsed.weapons : state.weapons;
                if (Array.isArray(parsed.customLoads)) state.customLoads = parsed.customLoads;
                if (Array.isArray(parsed.logbook)) state.logbook = parsed.logbook;
                if (parsed.calc && typeof parsed.calc === 'object') {
                    state.calc = { ...state.calc, ...parsed.calc };
                }
                saveState();
                setNotice(t('importedMsg'), 'success');
            } catch (err) {
                setNotice(t('importError'), 'error');
            }
        };
        reader.readAsText(file);
    }

    // -------------------------------------------------------------------------
    // 10. DYNAMISCHER SVG-FLUGBAHNGRAPH
    // -------------------------------------------------------------------------
    function renderTrajectorySvg(resultA, resultB) {
        const ptsA = resultA.graphPoints || [];
        if (ptsA.length < 2) return '';

        const ptsB = resultB ? (resultB.graphPoints || []) : [];
        const width = 760;
        const height = 310;
        const padLeft = 58;
        const padRight = 24;
        const padTop = 26;
        const padBottom = 42;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const maxDist = Math.max(50, state.calc.maxDistanceM);

        // Y-Werte (Drop in cm) sammeln, inkl. 0 (Visierlinie)
        const allDrops = [0, ...ptsA.map(p => p.dropCm), ...ptsB.map(p => p.dropCm)];
        let minY = Math.min(...allDrops);
        let maxY = Math.max(...allDrops);
        if (maxY - minY < 10) {
            maxY += 5;
            minY -= 5;
        }
        const yMargin = (maxY - minY) * 0.1;
        minY -= yMargin;
        maxY += yMargin;

        const xToSvg = (distM) => padLeft + (distM / maxDist) * plotW;
        const yToSvg = (dropCm) => padTop + ((maxY - dropCm) / (maxY - minY)) * plotH;

        // Gitterlinien X (5 Schritte)
        let gridHtml = '';
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const d = (maxDist / xSteps) * i;
            const x = xToSvg(d);
            const labelVal = isImp() ? Math.round(d * 1.0936133) : Math.round(d);
            gridHtml += `<line x1="${x.toFixed(1)}" y1="${padTop}" x2="${x.toFixed(1)}" y2="${height - padBottom}" class="svg-grid" />`;
            gridHtml += `<text x="${x.toFixed(1)}" y="${height - 14}" text-anchor="middle" class="svg-axis-label">${labelVal} ${distUnitLabel()}</text>`;
        }

        // Gitterlinien Y (5 Schritte)
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const valCm = minY + ((maxY - minY) / ySteps) * i;
            const y = yToSvg(valCm);
            const labelVal = isImp() ? (valCm / 2.54).toFixed(1) : valCm.toFixed(0);
            gridHtml += `<line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - padRight}" y2="${y.toFixed(1)}" class="svg-grid" />`;
            gridHtml += `<text x="${padLeft - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="svg-axis-label">${labelVal}</text>`;
        }

        // Visierlinie (y = 0)
        const zeroLineY = yToSvg(0);
        const sightLineHtml = `
            <line x1="${padLeft}" y1="${zeroLineY.toFixed(1)}" x2="${width - padRight}" y2="${zeroLineY.toFixed(1)}" class="svg-sight-line" />
            <text x="${padLeft + 6}" y="${(zeroLineY - 6).toFixed(1)}" class="svg-sight-label">${escapeHtml(t('graphSightLine'))}</text>
        `;

        // Transsonik-Markierung (falls innerhalb Maximaldistanz)
        let transonicHtml = '';
        if (resultA.transonicDistance && resultA.transonicDistance <= maxDist) {
            const tx = xToSvg(resultA.transonicDistance);
            const tDistDisp = isImp() ? `${Math.round(resultA.transonicDistance * 1.0936133)} yd` : `${resultA.transonicDistance} m`;
            transonicHtml = `
                <line x1="${tx.toFixed(1)}" y1="${padTop}" x2="${tx.toFixed(1)}" y2="${height - padBottom}" class="svg-transonic-line" />
                <text x="${(tx + 5).toFixed(1)}" y="${padTop + 14}" class="svg-transonic-label">${escapeHtml(t('graphTransonic'))} (${tDistDisp})</text>
            `;
        }

        // Kurve A
        const pathA = ptsA
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xToSvg(p.distance).toFixed(1)} ${yToSvg(p.dropCm).toFixed(1)}`)
            .join(' ');

        // Kurve B (falls Vergleichsmodus aktiv)
        let pathBHtml = '';
        if (ptsB.length > 1) {
            const pathB = ptsB
                .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xToSvg(p.distance).toFixed(1)} ${yToSvg(p.dropCm).toFixed(1)}`)
                .join(' ');
            pathBHtml = `<path d="${pathB}" fill="none" class="svg-traj-b" />`;
        }

        const yUnit = isImp() ? 'inch' : 'cm';

        return `
            <div class="svg-wrapper">
                <div class="svg-header">
                    <h3>${escapeHtml(t('graphTitle'))} (${yUnit})</h3>
                    <div class="svg-legend">
                        <span class="legend-item"><span class="legend-swatch swatch-a"></span> ${escapeHtml(t('graphBulletA'))}</span>
                        ${ptsB.length > 1 ? `<span class="legend-item"><span class="legend-swatch swatch-b"></span> ${escapeHtml(t('graphBulletB'))}</span>` : ''}
                        <span class="legend-item"><span class="legend-swatch swatch-sight"></span> ${escapeHtml(t('graphSightLine'))}</span>
                    </div>
                </div>
                <svg viewBox="0 0 ${width} ${height}" class="trajectory-svg" role="img" aria-label="${escapeHtml(t('graphTitle'))}">
                    ${gridHtml}
                    ${sightLineHtml}
                    ${transonicHtml}
                    ${pathBHtml}
                    <path d="${pathA}" fill="none" class="svg-traj-a" />
                </svg>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // 11. INFO-BUTTON & LEXIKON-MODAL HELFER
    // -------------------------------------------------------------------------
    function infoBtnHtml(lexiconId) {
        return `<button type="button" class="info-btn" data-lexicon="${lexiconId}" aria-label="Info ${lexiconId}" title="Info">i</button>`;
    }

    function renderLexiconModal() {
        if (!activeModalLexiconId) return '';
        const item = LEXICON_ITEMS.find(x => x.id === activeModalLexiconId);
        if (!item) return '';
        const lang = state.lang === 'en' ? 'en' : 'de';

        return `
            <div class="modal-backdrop" id="lexicon-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div class="modal-card">
                    <div class="modal-header">
                        <h3 id="modal-title">${escapeHtml(item.title[lang])}</h3>
                        <button type="button" class="btn btn-secondary btn-sm" id="close-lexicon-modal">${escapeHtml(t('closeModal'))}</button>
                    </div>
                    <p class="modal-body">${escapeHtml(item.desc[lang])}</p>
                    <div class="modal-footer">
                        <a href="${escapeHtml(item.wiki[lang])}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                            ${escapeHtml(t('openWiki'))} ↗
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // 12. ANSICHTEN RENDERN (Rechner, Waffen, Logbuch, Lexikon)
    // -------------------------------------------------------------------------
    function renderCalculatorTab() {
        const activeWeapon = getActiveWeapon();
        const cal = getCaliberById(activeWeapon ? activeWeapon.caliberId : state.calc.caliberFilter);
        const allLoads = getAllLoads();

        // Gefilterte Laborierungen für Dropdown
        const searchLower = (state.calc.loadSearch || '').trim().toLowerCase();
        const filteredLoads = allLoads.filter(l => {
            const matchesCal = !state.calc.caliberFilter || state.calc.caliberFilter === 'all' || l.caliber === state.calc.caliberFilter;
            const fullText = `${l.maker} ${l.bullet} ${l.grains}gr`.toLowerCase();
            const matchesSearch = !searchLower || fullText.includes(searchLower);
            return matchesCal && matchesSearch;
        });

        // Hauptberechnung ausführen
        const resA = BallisticsEngine.calculateTrajectory({
            bulletWeightGrains: state.calc.bulletWeightGrains,
            bc: state.calc.bc,
            dragModel: state.calc.dragModel,
            v0: state.calc.v0Ms,
            sightHeightCm: state.calc.sightHeightCm,
            zeroDistanceM: state.calc.zeroDistanceM,
            maxDistanceM: state.calc.maxDistanceM,
            stepDistanceM: state.calc.stepDistanceM,
            shotAngleDeg: state.calc.shotAngleDeg,
            windSpeedMs: state.calc.windSpeedMs,
            windDirectionDeg: state.calc.windDirectionDeg,
            latitudeDeg: state.calc.latitudeDeg,
            azimuthDeg: state.calc.azimuthDeg,
            clickUnit: state.calc.clickUnit,
            twistDirection: activeWeapon ? activeWeapon.twistDirection : 'right',
            twistRateInches: activeWeapon ? activeWeapon.twistRateIn : 10,
            caliberInches: cal ? cal.diameterIn : 0.308,
            tempC: state.calc.tempC,
            pressureHpa: state.calc.pressureHpa,
            humidityPercent: state.calc.humidityPercent,
            sameWeatherAsCurrent: state.calc.sameWeatherAsCurrent,
            zeroTempC: state.calc.zeroTempC,
            zeroPressureHpa: state.calc.zeroPressureHpa,
            zeroHumidityPercent: state.calc.zeroHumidityPercent
        });

        // Optionale Vergleichsberechnung (Munition B)
        let resB = null;
        if (state.calc.compareEnabled) {
            const calB = getCaliberById(state.calc.compareCaliberId);
            resB = BallisticsEngine.calculateTrajectory({
                bulletWeightGrains: state.calc.compareGrains,
                bc: state.calc.compareBc,
                dragModel: state.calc.dragModel,
                v0: state.calc.compareV0Ms,
                sightHeightCm: state.calc.sightHeightCm,
                zeroDistanceM: state.calc.zeroDistanceM,
                maxDistanceM: state.calc.maxDistanceM,
                stepDistanceM: state.calc.stepDistanceM,
                shotAngleDeg: state.calc.shotAngleDeg,
                windSpeedMs: state.calc.windSpeedMs,
                windDirectionDeg: state.calc.windDirectionDeg,
                latitudeDeg: state.calc.latitudeDeg,
                azimuthDeg: state.calc.azimuthDeg,
                clickUnit: state.calc.clickUnit,
                twistDirection: activeWeapon ? activeWeapon.twistDirection : 'right',
                twistRateInches: activeWeapon ? activeWeapon.twistRateIn : 10,
                caliberInches: calB ? calB.diameterIn : 0.264,
                tempC: state.calc.tempC,
                pressureHpa: state.calc.pressureHpa,
                humidityPercent: state.calc.humidityPercent,
                sameWeatherAsCurrent: state.calc.sameWeatherAsCurrent,
                zeroTempC: state.calc.zeroTempC,
                zeroPressureHpa: state.calc.zeroPressureHpa,
                zeroHumidityPercent: state.calc.zeroHumidityPercent
            });
        }

        const transonicDisp = resA.transonicDistance
            ? (isImp() ? `${Math.round(resA.transonicDistance * 1.0936133)} yd` : `${resA.transonicDistance} m`)
            : t('transonicNone');

        // Sensor-Ampel HTML (Barrierefrei: Farbe + Symbol + Text + Streuung)
        let sensorBadgeHtml = `<div class="sensor-status neutral">ℹ ${escapeHtml(t('sensorIdle'))}</div>`;
        if (sensorState.status === 'measuring') {
            sensorBadgeHtml = `<div class="sensor-status warning">⏳ ${escapeHtml(sensorState.message)}</div>`;
        } else if (sensorState.status === 'error') {
            sensorBadgeHtml = `<div class="sensor-status danger">✖ ${escapeHtml(sensorState.message)}</div>`;
        } else if (sensorState.status === 'done') {
            const icon = sensorState.trafficLight === 'green' ? '✔' : (sensorState.trafficLight === 'yellow' ? '⚠' : '✖');
            const cls = sensorState.trafficLight === 'green' ? 'success' : (sensorState.trafficLight === 'yellow' ? 'warning' : 'danger');
            sensorBadgeHtml = `
                <div class="sensor-status ${cls}">
                    <strong>${icon} ${escapeHtml(sensorState.message)}</strong> — ${escapeHtml(t('sensorSpread'))}: ${sensorState.spreadDeg.toFixed(1)}°
                </div>
            `;
        }

        // Vergleichs-Munition B Loads
        const loadsB = allLoads.filter(l => l.caliber === state.calc.compareCaliberId);

        // Tabellenzeilen aufbauen
        const rowsHtml = resA.tablePoints.map((ptA, idx) => {
            const distDisp = isImp() ? `${Math.round(ptA.distance * 1.0936133)} yd` : `${ptA.distance} m`;
            const velDisp = isImp() ? `${Math.round(ptA.velocity * 3.2808399)} fps` : `${Math.round(ptA.velocity)} m/s`;
            const ptB = resB && resB.tablePoints[idx] ? resB.tablePoints[idx] : null;
            const diffDropCm = ptB ? (ptA.dropCm - ptB.dropCm) : null;

            return `
                <tr>
                    <td><strong>${distDisp}</strong></td>
                    <td>${fmtDropDisplay(ptA.dropCm)}</td>
                    <td>${ptA.mil.toFixed(2)}</td>
                    <td><strong>${ptA.clicks}</strong></td>
                    <td>${velDisp}</td>
                    <td>${fmtEnergyDisplay(ptA.energy)}</td>
                    <td>${ptA.tof.toFixed(2)} s</td>
                    <td>${fmtDropDisplay(ptA.coriolisCm)}</td>
                    <td>${fmtDropDisplay(ptA.spinDriftCm)}</td>
                    <td>${fmtDropDisplay(ptA.windDriftCm)}</td>
                    ${resB ? `<td>${diffDropCm !== null ? fmtDropDisplay(diffDropCm) : '-'}</td>` : ''}
                </tr>
            `;
        }).join('');

        return `
            <div class="grid-layout">
                <!-- KARTE 1: MUNITION & WAFFEN-SETUP -->
                <section class="card">
                    <h2>${escapeHtml(t('loadSelect'))}</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="calc-caliber-filter">${escapeHtml(t('caliber'))}</label>
                            <select id="calc-caliber-filter">
                                <option value="all" ${state.calc.caliberFilter === 'all' ? 'selected' : ''}>${escapeHtml(t('allCalibers'))}</option>
                                ${CALIBERS.map(c => `<option value="${c.id}" ${state.calc.caliberFilter === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="calc-load-search">${escapeHtml(t('searchLoad'))}</label>
                            <input type="text" id="calc-load-search" value="${escapeHtml(state.calc.loadSearch)}" placeholder="${escapeHtml(t('searchLoad'))}" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="calc-load-select">${escapeHtml(t('loadSelect'))} (${filteredLoads.length})</label>
                        <select id="calc-load-select">
                            ${filteredLoads.map(l => `
                                <option value="${l.id}" ${state.calc.loadId === l.id ? 'selected' : ''}>
                                    ${escapeHtml(l.maker)} – ${escapeHtml(l.bullet)} (${l.grains}gr, BC ${l.bc}, ${fmtVelInput(l.v0)} ${isImp() ? 'fps' : 'm/s'})
                                </option>
                            `).join('')}
                        </select>
                        <small class="hint">${escapeHtml(t('v0Note'))}</small>
                    </div>

                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="calc-grains">${escapeHtml(t('bulletWeight'))}</label>
                            <input type="number" step="0.1" id="calc-grains" value="${state.calc.bulletWeightGrains}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-bc">${escapeHtml(t('bcValue'))} ${infoBtnHtml('bc')}</label>
                            <input type="number" step="0.001" id="calc-bc" value="${state.calc.bc}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-drag-model">${escapeHtml(t('dragModel'))}</label>
                            <select id="calc-drag-model">
                                <option value="G1" ${state.calc.dragModel === 'G1' ? 'selected' : ''}>G1</option>
                                <option value="G7" ${state.calc.dragModel === 'G7' ? 'selected' : ''}>G7</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="calc-v0">${escapeHtml(t('v0Label'))} (${isImp() ? 'fps' : 'm/s'})</label>
                            <input type="number" step="1" id="calc-v0" value="${fmtVelInput(state.calc.v0Ms)}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-sight-height">${escapeHtml(t('sightHeight'))} (${isImp() ? 'in' : 'cm'})</label>
                            <input type="number" step="0.1" required id="calc-sight-height" value="${fmtSightInput(state.calc.sightHeightCm)}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-click-unit">${escapeHtml(t('clickUnit'))}</label>
                            <select id="calc-click-unit">
                                <option value="MIL" ${state.calc.clickUnit === 'MIL' ? 'selected' : ''}>0.1 MIL</option>
                                <option value="MOA" ${state.calc.clickUnit === 'MOA' ? 'selected' : ''}>1/4 MOA</option>
                            </select>
                        </div>
                    </div>

                    <!-- Vergleichsmodus Toggle -->
                    <div class="toggle-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="calc-compare-toggle" ${state.calc.compareEnabled ? 'checked' : ''} />
                            <span>${escapeHtml(t('compareToggle'))}</span>
                        </label>
                    </div>

                    ${state.calc.compareEnabled ? `
                        <div class="sub-box">
                            <h3>${escapeHtml(t('compareTitle'))}</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="comp-caliber">${escapeHtml(t('caliber'))}</label>
                                    <select id="comp-caliber">
                                        ${CALIBERS.map(c => `<option value="${c.id}" ${state.calc.compareCaliberId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="comp-load">${escapeHtml(t('loadSelect'))}</label>
                                    <select id="comp-load">
                                        ${loadsB.map(l => `<option value="${l.id}" ${state.calc.compareLoadId === l.id ? 'selected' : ''}>${escapeHtml(l.maker)} ${escapeHtml(l.bullet)}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row three-cols">
                                <div class="form-group">
                                    <label for="comp-grains">${escapeHtml(t('bulletWeight'))}</label>
                                    <input type="number" step="0.1" id="comp-grains" value="${state.calc.compareGrains}" />
                                </div>
                                <div class="form-group">
                                    <label for="comp-bc">BC (${state.calc.dragModel})</label>
                                    <input type="number" step="0.001" id="comp-bc" value="${state.calc.compareBc}" />
                                </div>
                                <div class="form-group">
                                    <label for="comp-v0">V0 (${isImp() ? 'fps' : 'm/s'})</label>
                                    <input type="number" step="1" id="comp-v0" value="${fmtVelInput(state.calc.compareV0Ms)}" />
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </section>

                <!-- KARTE 2: DISTANZEN, WIND & SCHUSSWINKEL -->
                <section class="card">
                    <h2>${escapeHtml(t('zeroDist'))}, ${escapeHtml(t('windSpeed'))} & ${escapeHtml(t('shotAngle'))}</h2>
                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="calc-zero">${escapeHtml(t('zeroDist'))} (${distUnitLabel()})</label>
                            <input type="number" step="5" id="calc-zero" value="${fmtDistInput(state.calc.zeroDistanceM)}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-max">${escapeHtml(t('maxDist'))} (${distUnitLabel()})</label>
                            <input type="number" step="25" id="calc-max" value="${fmtDistInput(state.calc.maxDistanceM)}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-step">${escapeHtml(t('stepDist'))} (m)</label>
                            <select id="calc-step">
                                <option value="25" ${Number(state.calc.stepDistanceM) === 25 ? 'selected' : ''}>25 m</option>
                                <option value="50" ${Number(state.calc.stepDistanceM) === 50 ? 'selected' : ''}>50 m</option>
                                <option value="100" ${Number(state.calc.stepDistanceM) === 100 ? 'selected' : ''}>100 m</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="calc-wind-speed">${escapeHtml(t('windSpeed'))} (${isImp() ? 'mph' : 'm/s'}) ${infoBtnHtml('wind')}</label>
                            <input type="number" step="0.5" id="calc-wind-speed" value="${fmtWindInput(state.calc.windSpeedMs)}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-wind-dir">${escapeHtml(t('windDir'))}</label>
                            <input type="number" step="5" min="0" max="360" id="calc-wind-dir" value="${state.calc.windDirectionDeg}" />
                            <small class="hint">${escapeHtml(t('windDirHint'))}</small>
                        </div>
                        <div class="form-group">
                            <label for="calc-shot-angle">${escapeHtml(t('shotAngle'))}</label>
                            <input type="number" step="0.5" min="-85" max="85" id="calc-shot-angle" value="${state.calc.shotAngleDeg}" />
                        </div>
                    </div>

                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="calc-lat">${escapeHtml(t('latitudeLabel'))} ${infoBtnHtml('coriolis')}</label>
                            <input type="number" step="0.1" min="-90" max="90" id="calc-lat" value="${state.calc.latitudeDeg}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-azimuth">${escapeHtml(t('azimuthLabel'))} ${infoBtnHtml('eotvos')}</label>
                            <input type="number" step="1" min="0" max="360" id="calc-azimuth" value="${state.calc.azimuthDeg}" />
                        </div>
                        <div class="form-group">
                            <label for="geo-city-select">${escapeHtml(t('geoFallbackLabel'))}</label>
                            <select id="geo-city-select">
                                <option value="">-- Stadt / City --</option>
                                ${CITIES_FALLBACK.map(c => `<option value="${c.lat}">${escapeHtml(c.name)} (${c.lat}°)</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Smartphone Sensor Snapshot -->
                    <div class="sub-box">
                        <div class="flex-between">
                            <strong>${escapeHtml(t('sensorSection'))}</strong>
                            <button type="button" class="btn btn-secondary btn-sm" id="btn-sensor-snapshot">🧭 ${escapeHtml(t('sensorBtn'))}</button>
                        </div>
                        ${sensorBadgeHtml}
                    </div>
                </section>

                <!-- KARTE 3: WETTER & ZERO-BEDINGUNGEN -->
                <section class="card">
                    <div class="flex-between">
                        <h2>${escapeHtml(t('weatherSection'))} ${infoBtnHtml('density_altitude')}</h2>
                        <button type="button" class="btn btn-primary btn-sm" id="btn-fetch-weather">🌦 ${escapeHtml(t('fetchWeatherBtn'))}</button>
                    </div>

                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="calc-temp">${escapeHtml(t('tempLabel'))} (${isImp() ? '°F' : '°C'})</label>
                            <input type="number" step="0.5" id="calc-temp" value="${fmtTempInput(state.calc.tempC)}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-pressure">${escapeHtml(t('pressureLabel'))}</label>
                            <input type="number" step="1" id="calc-pressure" value="${state.calc.pressureHpa}" />
                        </div>
                        <div class="form-group">
                            <label for="calc-humidity">${escapeHtml(t('humidityLabel'))}</label>
                            <input type="number" step="1" min="0" max="100" id="calc-humidity" value="${state.calc.humidityPercent}" />
                        </div>
                    </div>

                    <div class="sub-box">
                        <div class="flex-between">
                            <strong>${escapeHtml(t('zeroWeatherSection'))} ${infoBtnHtml('zero_conditions')}</strong>
                            <label class="checkbox-label">
                                <input type="checkbox" id="calc-same-weather" ${state.calc.sameWeatherAsCurrent ? 'checked' : ''} />
                                <span>${escapeHtml(t('sameWeatherAsCurrent'))}</span>
                            </label>
                        </div>
                        ${!state.calc.sameWeatherAsCurrent ? `
                            <div class="form-row three-cols" style="margin-top:0.6rem;">
                                <div class="form-group">
                                    <label for="calc-zero-temp">${escapeHtml(t('zeroTempLabel'))} (${isImp() ? '°F' : '°C'})</label>
                                    <input type="number" step="0.5" id="calc-zero-temp" value="${fmtTempInput(state.calc.zeroTempC)}" />
                                </div>
                                <div class="form-group">
                                    <label for="calc-zero-pressure">${escapeHtml(t('zeroPressureLabel'))}</label>
                                    <input type="number" step="1" id="calc-zero-pressure" value="${state.calc.zeroPressureHpa}" />
                                </div>
                                <div class="form-group">
                                    <label for="calc-zero-humidity">${escapeHtml(t('zeroHumidityLabel'))}</label>
                                    <input type="number" step="1" min="0" max="100" id="calc-zero-humidity" value="${state.calc.zeroHumidityPercent}" />
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </section>
            </div>

            <!-- KENNZAHLEN-ÜBERSICHT (E0, Dichtehöhe, Transsonik, Spin Drift Info) -->
            <section class="kpi-strip">
                <div class="kpi-box">
                    <span class="kpi-label">${escapeHtml(t('e0Label'))}</span>
                    <strong class="kpi-value">${fmtEnergyDisplay(resA.e0Joules)}</strong>
                </div>
                <div class="kpi-box">
                    <span class="kpi-label">${escapeHtml(t('densityAltLabel'))}</span>
                    <strong class="kpi-value">${fmtAltitudeDisplay(resA.atmosphere.densityAltitudeMeters)}</strong>
                </div>
                <div class="kpi-box">
                    <span class="kpi-label">${escapeHtml(t('airDensityLabel'))}</span>
                    <strong class="kpi-value">${resA.atmosphere.airDensity.toFixed(3)} kg/m³</strong>
                </div>
                <div class="kpi-box">
                    <span class="kpi-label">${escapeHtml(t('transonicLabel'))}</span>
                    <strong class="kpi-value">${escapeHtml(transonicDisp)}</strong>
                </div>
            </section>

            <!-- DYNAMISCHER SVG-GRAPH -->
            <section class="card">
                ${renderTrajectorySvg(resA, resB)}
            </section>

            <!-- BALLISTIK-DATENTABELLE -->
            <section class="card">
                <div class="flex-between" style="margin-bottom:0.75rem;">
                    <h2>${escapeHtml(t('tabCalc'))} (${state.calc.clickUnit === 'MOA' ? '1/4 MOA' : '0.1 MIL'}) ${infoBtnHtml('spindrift')}</h2>
                    <button type="button" class="btn btn-primary" id="btn-send-to-log">📓 ${escapeHtml(t('toLogBtn'))}</button>
                </div>
                <div class="table-responsive">
                    <table class="ballistics-table">
                        <thead>
                            <tr>
                                <th>${escapeHtml(t('tableDist'))}</th>
                                <th>${escapeHtml(t('tableDrop'))}</th>
                                <th>${escapeHtml(t('tableMil'))}</th>
                                <th>${escapeHtml(t('tableClicks'))}</th>
                                <th>${escapeHtml(t('tableVel'))}</th>
                                <th>${escapeHtml(t('tableEnergy'))}</th>
                                <th>${escapeHtml(t('tableTof'))}</th>
                                <th>${escapeHtml(t('tableCoriolis'))}</th>
                                <th>${escapeHtml(t('tableSpin'))}</th>
                                <th>${escapeHtml(t('tableWind'))}</th>
                                ${resB ? `<th>${escapeHtml(t('tableDiff'))}</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }

    function renderWeaponsTab() {
        const activeWeapon = getActiveWeapon();
        const cal = getCaliberById(activeWeapon ? activeWeapon.caliberId : state.calc.caliberFilter);

        // Miller-Stabilitäts-Check für aktive Waffe + aktuelle Laborierung
        const miller = BallisticsEngine.calculateMillerStability({
            caliberInches: cal ? cal.diameterIn : 0.308,
            bulletWeightGrains: state.calc.bulletWeightGrains,
            twistRateInches: activeWeapon ? activeWeapon.twistRateIn : 10,
            v0Ms: state.calc.v0Ms,
            tempC: state.calc.tempC,
            pressureHpa: state.calc.pressureHpa
        });

        let millerBadge = '';
        if (miller.status === 'unstable') {
            millerBadge = `<span class="badge badge-danger">✖ ${escapeHtml(t('millerUnstable'))}</span>`;
        } else if (miller.status === 'marginal') {
            millerBadge = `<span class="badge badge-warning">⚠ ${escapeHtml(t('millerMarginal'))}</span>`;
        } else if (miller.status === 'optimal') {
            millerBadge = `<span class="badge badge-success">✔ ${escapeHtml(t('millerOptimal'))}</span>`;
        } else {
            millerBadge = `<span class="badge badge-warning">⚠ ${escapeHtml(t('millerOver'))}</span>`;
        }

        return `
            <div class="grid-layout">
                <!-- WAFFENPROFIL ANLEGEN -->
                <section class="card">
                    <h2>${escapeHtml(t('weaponFormTitle'))}</h2>
                    <form id="weapon-form">
                        <div class="form-group">
                            <label for="w-name">${escapeHtml(t('weaponName'))}</label>
                            <input type="text" id="w-name" required placeholder="z. B. Tikka T3x TAC A1" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="w-caliber">${escapeHtml(t('weaponCaliber'))}</label>
                                <select id="w-caliber">
                                    ${CALIBERS.map(c => `<option value="${c.id}" ${c.id === '308win' ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="w-barrel">${escapeHtml(t('barrelLen'))}</label>
                                <input type="number" step="0.5" id="w-barrel" value="24" />
                            </div>
                        </div>
                        <div class="form-row three-cols">
                            <div class="form-group">
                                <label for="w-twist">${escapeHtml(t('twistRate'))}</label>
                                <input type="number" step="0.25" id="w-twist" value="10" required />
                            </div>
                            <div class="form-group">
                                <label for="w-twist-dir">${escapeHtml(t('twistDir'))}</label>
                                <select id="w-twist-dir">
                                    <option value="right">${escapeHtml(t('twistRight'))}</option>
                                    <option value="left">${escapeHtml(t('twistLeft'))}</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="w-sight">${escapeHtml(t('sightHeight'))} (cm)</label>
                                <input type="number" step="0.1" id="w-sight" value="5.0" required />
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">${escapeHtml(t('saveWeaponBtn'))}</button>
                    </form>
                </section>

                <!-- MILLER-STABILITÄTS-CHECK -->
                <section class="card">
                    <h2>${escapeHtml(t('millerTitle'))} ${infoBtnHtml('miller')}</h2>
                    <p class="hint">
                        ${escapeHtml(activeWeapon ? activeWeapon.name : '')} (${escapeHtml(cal ? cal.name : '')}, Twist 1:${activeWeapon ? activeWeapon.twistRateIn : 10}")
                        · ${state.calc.bulletWeightGrains} gr @ ${state.calc.v0Ms} m/s
                    </p>
                    <div class="kpi-strip" style="margin-top:0.75rem;">
                        <div class="kpi-box">
                            <span class="kpi-label">${escapeHtml(t('millerSg'))}</span>
                            <strong class="kpi-value">${miller.sg.toFixed(2)}</strong>
                            <div>${millerBadge}</div>
                        </div>
                        <div class="kpi-box">
                            <span class="kpi-label">${escapeHtml(t('millerLenCal'))}</span>
                            <strong class="kpi-value">${miller.lengthCalibers.toFixed(2)} cal</strong>
                        </div>
                    </div>

                    <hr class="divider" />

                    <!-- EIGENE LABORIERUNG ANLEGEN -->
                    <h2>${escapeHtml(t('customLoadTitle'))}</h2>
                    <form id="custom-load-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cl-caliber">${escapeHtml(t('caliber'))}</label>
                                <select id="cl-caliber">
                                    ${CALIBERS.map(c => `<option value="${c.id}" ${c.id === state.calc.caliberFilter ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="cl-name">${escapeHtml(t('customLoadName'))}</label>
                                <input type="text" id="cl-name" required placeholder="z. B. Handladung Lapua Scenar 167gr" />
                            </div>
                        </div>
                        <div class="form-row three-cols">
                            <div class="form-group">
                                <label for="cl-grains">${escapeHtml(t('bulletWeight'))}</label>
                                <input type="number" step="0.1" id="cl-grains" required value="168" />
                            </div>
                            <div class="form-group">
                                <label for="cl-bc">BC (G1)</label>
                                <input type="number" step="0.001" id="cl-bc" required value="0.500" />
                            </div>
                            <div class="form-group">
                                <label for="cl-v0">V0 (m/s)</label>
                                <input type="number" step="1" id="cl-v0" required value="800" />
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">${escapeHtml(t('saveCustomLoadBtn'))}</button>
                    </form>
                </section>
            </div>

            <!-- GESPEICHERTE WAFFEN -->
            <section class="card">
                <h2>${escapeHtml(t('savedWeaponsTitle'))}</h2>
                <div class="weapon-list">
                    ${state.weapons.map(w => {
                        const wCal = getCaliberById(w.caliberId);
                        const isActive = w.id === state.activeWeaponId;
                        return `
                            <div class="weapon-item ${isActive ? 'active' : ''}">
                                <div>
                                    <strong>${escapeHtml(w.name)}</strong> ${isActive ? `<span class="badge badge-success">✔ ${escapeHtml(t('activeWeapon'))}</span>` : ''}
                                    <div class="hint">
                                        ${escapeHtml(wCal ? wCal.name : w.caliberId)} · Lauf: ${w.barrelLengthIn || 24}" · Twist: 1:${w.twistRateIn}" (${w.twistDirection === 'left' ? t('twistLeft') : t('twistRight')}) · Visierhöhe: ${w.sightHeightCm} cm
                                    </div>
                                </div>
                                <div class="btn-group">
                                    <button type="button" class="btn btn-secondary btn-sm btn-select-weapon" data-id="${w.id}">${escapeHtml(t('useWeaponBtn'))}</button>
                                    ${state.weapons.length > 1 ? `<button type="button" class="btn btn-danger btn-sm btn-delete-weapon" data-id="${w.id}">${escapeHtml(t('deleteBtn'))}</button>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>

            <!-- DATENSICHERUNG (JSON EXPORT / IMPORT) -->
            <section class="card">
                <h2>${escapeHtml(t('backupTitle'))} (v${APP_VERSION})</h2>
                <div class="btn-group">
                    <button type="button" class="btn btn-primary" id="btn-export-json">⬇ ${escapeHtml(t('exportJsonBtn'))}</button>
                    <label class="btn btn-secondary" for="input-import-json" style="cursor:pointer;">
                        ⬆ ${escapeHtml(t('importJsonBtn'))}
                    </label>
                    <input type="file" id="input-import-json" accept="application/json" style="display:none;" />
                </div>
            </section>
        `;
    }

    function renderLogbookTab() {
        const draft = state.logDraft || {};

        return `
            <section class="card">
                <h2>${escapeHtml(t('logTitle'))}</h2>
                <form id="logbook-form">
                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="log-date">${escapeHtml(t('logDate'))}</label>
                            <input type="date" id="log-date" required value="${escapeHtml(draft.date || new Date().toISOString().slice(0, 10))}" />
                        </div>
                        <div class="form-group">
                            <label for="log-weapon">${escapeHtml(t('logWeapon'))}</label>
                            <select id="log-weapon">
                                ${state.weapons.map(w => `<option value="${w.id}" ${w.id === draft.weaponId ? 'selected' : ''}>${escapeHtml(w.name)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="log-distance">${escapeHtml(t('logDistance'))} (m)</label>
                            <input type="number" step="1" id="log-distance" required value="${escapeHtml(draft.distanceM || 100)}" />
                        </div>
                    </div>

                    <div class="form-row three-cols">
                        <div class="form-group">
                            <label for="log-caliber">${escapeHtml(t('caliber'))}</label>
                            <input type="text" id="log-caliber" required value="${escapeHtml(draft.caliberName || '.308 Win')}" />
                        </div>
                        <div class="form-group">
                            <label for="log-load">${escapeHtml(t('loadSelect'))}</label>
                            <input type="text" id="log-load" required value="${escapeHtml(draft.loadName || '')}" />
                        </div>
                        <div class="form-group">
                            <label for="log-group">${escapeHtml(t('logGroup'))}</label>
                            <input type="number" step="0.1" id="log-group" value="${escapeHtml(draft.groupSizeMm || '')}" placeholder="z. B. 18.5" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="log-weather">${escapeHtml(t('logWeather'))}</label>
                            <input type="text" id="log-weather" value="${escapeHtml(draft.weatherShort || '')}" placeholder="z. B. 18°C, 1015 hPa, leichter Seitenwind" />
                        </div>
                        <div class="form-group">
                            <label for="log-notes">${escapeHtml(t('logNotes'))}</label>
                            <input type="text" id="log-notes" required value="${escapeHtml(draft.notes || '')}" placeholder="Trefferlage, Klick-Korrektur, Besonderheiten..." />
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">${escapeHtml(t('saveLogBtn'))}</button>
                </form>
            </section>

            <section class="card">
                <div class="log-list">
                    ${state.logbook.map(entry => `
                        <article class="log-entry">
                            <div class="flex-between">
                                <div>
                                    <strong>${escapeHtml(entry.date)}</strong> · <strong>${escapeHtml(entry.weaponName)}</strong> (${escapeHtml(entry.caliberName)})
                                </div>
                                <button type="button" class="btn btn-danger btn-sm btn-delete-log" data-id="${entry.id}">${escapeHtml(t('deleteBtn'))}</button>
                            </div>
                            <div class="hint" style="margin:0.3rem 0;">
                                ${escapeHtml(entry.loadName)} · <strong>${entry.distanceM} m</strong>
                                ${entry.groupSizeMm ? ` · Streukreis: <strong>${escapeHtml(entry.groupSizeMm)} mm</strong>` : ''}
                                ${entry.weatherShort ? ` · ${escapeHtml(entry.weatherShort)}` : ''}
                            </div>
                            <p>${escapeHtml(entry.notes)}</p>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderLexiconTab() {
        const lang = state.lang === 'en' ? 'en' : 'de';
        return `
            <section class="card">
                <h2>${escapeHtml(t('tabLexicon'))}</h2>
                <div class="lexicon-grid">
                    ${LEXICON_ITEMS.map(item => `
                        <article class="lexicon-card">
                            <h3>${escapeHtml(item.title[lang])}</h3>
                            <p>${escapeHtml(item.desc[lang])}</p>
                            <a href="${escapeHtml(item.wiki[lang])}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                                ${escapeHtml(t('openWiki'))} ↗
                            </a>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    }

    // -------------------------------------------------------------------------
    // 13. HAUPT-RENDER & EVENT-BINDING
    // -------------------------------------------------------------------------
    function render() {
        const app = document.getElementById('app');
        if (!app) return;

        let mainContent = '';
        if (state.activeTab === 'calc') mainContent = renderCalculatorTab();
        else if (state.activeTab === 'weapons') mainContent = renderWeaponsTab();
        else if (state.activeTab === 'log') mainContent = renderLogbookTab();
        else if (state.activeTab === 'lexicon') mainContent = renderLexiconTab();

        app.innerHTML = `
            <header class="app-header">
                <div class="header-top">
                    <div class="brand">
                        <h1>🎯 ${escapeHtml(t('appTitle'))}</h1>
                    </div>
                    <div class="header-controls">
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-units" aria-label="Toggle Units">
                            ${state.units === 'metric' ? 'Metrisch (m / °C / cm)' : 'Imperial (yd / °F / in)'}
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-lang" aria-label="Toggle Language">
                            ${state.lang === 'de' ? 'DE 🇩🇪' : 'EN 🇬🇧'}
                        </button>
                    </div>
                </div>

                <div class="disclaimer-bar" role="note">
                    ⚠️ ${escapeHtml(t('disclaimerBanner'))}
                </div>

                <nav class="tab-nav" aria-label="Hauptnavigation">
                    <button type="button" class="tab-btn ${state.activeTab === 'calc' ? 'active' : ''}" data-tab="calc">${escapeHtml(t('tabCalc'))}</button>
                    <button type="button" class="tab-btn ${state.activeTab === 'weapons' ? 'active' : ''}" data-tab="weapons">${escapeHtml(t('tabWeapons'))}</button>
                    <button type="button" class="tab-btn ${state.activeTab === 'log' ? 'active' : ''}" data-tab="log">${escapeHtml(t('tabLog'))}</button>
                    <button type="button" class="tab-btn ${state.activeTab === 'lexicon' ? 'active' : ''}" data-tab="lexicon">${escapeHtml(t('tabLexicon'))}</button>
                </nav>
            </header>

            ${statusBannerMsg ? `
                <div class="status-banner ${statusBannerType}" role="status">
                    <span>${escapeHtml(statusBannerMsg)}</span>
                    <button type="button" class="close-banner" id="btn-close-banner" aria-label="Schließen">×</button>
                </div>
            ` : ''}

            <main class="app-main">
                ${mainContent}
            </main>

            <footer class="app-footer">
                <p><strong>${escapeHtml(t('disclaimerBanner'))}</strong></p>
                <p>${escapeHtml(t('privacyFooter'))} (v${APP_VERSION})</p>
            </footer>

            ${renderLexiconModal()}
        `;

        bindEvents();
    }

    function bindEvents() {
        // Header Sprache & Einheiten
        document.getElementById('btn-toggle-lang')?.addEventListener('click', () => {
            state.lang = state.lang === 'de' ? 'en' : 'de';
            saveState();
            render();
        });

        document.getElementById('btn-toggle-units')?.addEventListener('click', () => {
            state.units = state.units === 'metric' ? 'imperial' : 'metric';
            saveState();
            render();
        });

        // Navigation Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeTab = btn.dataset.tab;
                statusBannerMsg = '';
                saveState();
                render();
            });
        });

        // Status-Banner schließen
        document.getElementById('btn-close-banner')?.addEventListener('click', () => {
            statusBannerMsg = '';
            render();
        });

        // Info-Buttons (Lexikon-Modal öffnen)
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeModalLexiconId = btn.dataset.lexicon;
                render();
            });
        });

        document.getElementById('close-lexicon-modal')?.addEventListener('click', () => {
            activeModalLexiconId = null;
            render();
        });

        document.getElementById('lexicon-modal-backdrop')?.addEventListener('click', (e) => {
            if (e.target.id === 'lexicon-modal-backdrop') {
                activeModalLexiconId = null;
                render();
            }
        });

        // Rechner-Eingaben binden
        if (state.activeTab === 'calc') {
            document.getElementById('calc-caliber-filter')?.addEventListener('change', (e) => {
                state.calc.caliberFilter = e.target.value;
                const match = getAllLoads().find(l => state.calc.caliberFilter === 'all' || l.caliber === state.calc.caliberFilter);
                if (match) {
                    state.calc.loadId = match.id;
                    state.calc.bulletWeightGrains = match.grains;
                    state.calc.bc = match.bc;
                    state.calc.v0Ms = match.v0;
                }
                saveState();
                render();
            });

            document.getElementById('calc-load-search')?.addEventListener('input', (e) => {
                state.calc.loadSearch = e.target.value;
                saveState();
                render();
                const el = document.getElementById('calc-load-search');
                if (el) {
                    el.focus();
                    el.setSelectionRange(el.value.length, el.value.length);
                }
            });

            document.getElementById('calc-load-select')?.addEventListener('change', (e) => {
                applyLoadToCalc(e.target.value, false);
            });

            const bindNum = (id, handler) => {
                document.getElementById(id)?.addEventListener('change', (e) => {
                    handler(e.target.value);
                    saveState();
                    render();
                });
            };

            bindNum('calc-grains', v => { state.calc.bulletWeightGrains = parseFloat(v) || 168; });
            bindNum('calc-bc', v => { state.calc.bc = Math.max(0.01, parseFloat(v) || 0.5); });
            bindNum('calc-v0', v => { state.calc.v0Ms = Math.max(50, parseVelInput(v) || 800); });
            bindNum('calc-sight-height', v => { state.calc.sightHeightCm = parseSightInput(v); });
            bindNum('calc-zero', v => { state.calc.zeroDistanceM = Math.max(10, parseDistInput(v) || 100); });
            bindNum('calc-max', v => { state.calc.maxDistanceM = Math.max(25, Math.min(3000, parseDistInput(v) || 600)); });
            bindNum('calc-step', v => { state.calc.stepDistanceM = parseInt(v, 10) || 50; });
            bindNum('calc-wind-speed', v => { state.calc.windSpeedMs = Math.max(0, parseWindInput(v) || 0); });
            bindNum('calc-wind-dir', v => { state.calc.windDirectionDeg = ((parseFloat(v) || 0) % 360 + 360) % 360; });
            bindNum('calc-shot-angle', v => { state.calc.shotAngleDeg = Math.max(-85, Math.min(85, parseFloat(v) || 0)); });
            bindNum('calc-lat', v => { state.calc.latitudeDeg = Math.max(-90, Math.min(90, isFinite(parseFloat(v)) ? parseFloat(v) : 48.7)); });
            bindNum('calc-azimuth', v => { state.calc.azimuthDeg = ((parseFloat(v) || 0) % 360 + 360) % 360; });
            bindNum('calc-temp', v => { state.calc.tempC = parseTempInput(v); });
            bindNum('calc-pressure', v => { state.calc.pressureHpa = Math.max(300, parseFloat(v) || 1013); });
            bindNum('calc-humidity', v => { state.calc.humidityPercent = Math.max(0, Math.min(100, isFinite(parseFloat(v)) ? parseFloat(v) : 50)); });
            bindNum('calc-zero-temp', v => { state.calc.zeroTempC = parseTempInput(v); });
            bindNum('calc-zero-pressure', v => { state.calc.zeroPressureHpa = Math.max(300, parseFloat(v) || 1013); });
            bindNum('calc-zero-humidity', v => { state.calc.zeroHumidityPercent = Math.max(0, Math.min(100, isFinite(parseFloat(v)) ? parseFloat(v) : 50)); });

            document.getElementById('calc-drag-model')?.addEventListener('change', (e) => {
                state.calc.dragModel = e.target.value === 'G7' ? 'G7' : 'G1';
                saveState();
                render();
            });

            document.getElementById('calc-click-unit')?.addEventListener('change', (e) => {
                state.calc.clickUnit = e.target.value === 'MOA' ? 'MOA' : 'MIL';
                saveState();
                render();
            });

            document.getElementById('calc-same-weather')?.addEventListener('change', (e) => {
                state.calc.sameWeatherAsCurrent = e.target.checked;
                saveState();
                render();
            });

            document.getElementById('calc-compare-toggle')?.addEventListener('change', (e) => {
                state.calc.compareEnabled = e.target.checked;
                saveState();
                render();
            });

            document.getElementById('comp-caliber')?.addEventListener('change', (e) => {
                state.calc.compareCaliberId = e.target.value;
                const first = getAllLoads().find(l => l.caliber === state.calc.compareCaliberId);
                if (first) applyLoadToCalc(first.id, true);
                else { saveState(); render(); }
            });

            document.getElementById('comp-load')?.addEventListener('change', (e) => {
                applyLoadToCalc(e.target.value, true);
            });

            bindNum('comp-grains', v => { state.calc.compareGrains = parseFloat(v) || 140; });
            bindNum('comp-bc', v => { state.calc.compareBc = Math.max(0.01, parseFloat(v) || 0.5); });
            bindNum('comp-v0', v => { state.calc.compareV0Ms = Math.max(50, parseVelInput(v) || 820); });

            document.getElementById('geo-city-select')?.addEventListener('change', (e) => {
                const lat = parseFloat(e.target.value);
                if (isFinite(lat)) {
                    state.calc.latitudeDeg = lat;
                    saveState();
                    render();
                }
            });

            document.getElementById('btn-fetch-weather')?.addEventListener('click', fetchWeatherByGps);
            document.getElementById('btn-sensor-snapshot')?.addEventListener('click', startSensorSnapshot);
            document.getElementById('btn-send-to-log')?.addEventListener('click', sendCurrentCalcToLogbook);
        }

        // Waffen & Laborierungen Tab
        if (state.activeTab === 'weapons') {
            document.getElementById('weapon-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('w-name').value.trim();
                const caliberId = document.getElementById('w-caliber').value;
                const barrelLengthIn = parseFloat(document.getElementById('w-barrel').value) || 24;
                const twistRateIn = parseFloat(document.getElementById('w-twist').value) || 10;
                const twistDirection = document.getElementById('w-twist-dir').value === 'left' ? 'left' : 'right';
                const sightHeightCm = parseFloat(document.getElementById('w-sight').value) || 5.0;

                const newWeapon = {
                    id: 'w_' + Date.now(),
                    name: name || 'Waffe',
                    caliberId,
                    barrelLengthIn,
                    twistRateIn,
                    twistDirection,
                    sightHeightCm
                };
                state.weapons.push(newWeapon);
                selectWeapon(newWeapon.id);
            });

            document.getElementById('custom-load-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const caliber = document.getElementById('cl-caliber').value;
                const fullName = document.getElementById('cl-name').value.trim();
                const grains = parseFloat(document.getElementById('cl-grains').value) || 168;
                const bc = parseFloat(document.getElementById('cl-bc').value) || 0.5;
                const v0 = parseFloat(document.getElementById('cl-v0').value) || 800;

                const newLoad = {
                    id: 'custom_' + Date.now(),
                    caliber,
                    maker: 'Custom',
                    bullet: fullName || 'Eigene Ladung',
                    grains,
                    bc,
                    v0
                };
                state.customLoads.unshift(newLoad);
                applyLoadToCalc(newLoad.id, false);
                setNotice(t('savedMsg'), 'success');
            });

            document.querySelectorAll('.btn-select-weapon').forEach(btn => {
                btn.addEventListener('click', () => selectWeapon(btn.dataset.id));
            });

            document.querySelectorAll('.btn-delete-weapon').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (state.weapons.length <= 1) return;
                    state.weapons = state.weapons.filter(w => w.id !== btn.dataset.id);
                    if (state.activeWeaponId === btn.dataset.id) {
                        state.activeWeaponId = state.weapons[0].id;
                    }
                    saveState();
                    render();
                });
            });

            document.getElementById('btn-export-json')?.addEventListener('click', exportBackupJson);
            document.getElementById('input-import-json')?.addEventListener('change', (e) => {
                importBackupJson(e.target.files[0]);
            });
        }

        // Schießtagebuch Tab
        if (state.activeTab === 'log') {
            document.getElementById('logbook-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const weaponId = document.getElementById('log-weapon').value;
                const w = state.weapons.find(item => item.id === weaponId);

                const entry = {
                    id: 'log_' + Date.now(),
                    date: document.getElementById('log-date').value,
                    weaponId,
                    weaponName: w ? w.name : 'Waffe',
                    caliberName: document.getElementById('log-caliber').value.trim(),
                    loadName: document.getElementById('log-load').value.trim(),
                    distanceM: parseFloat(document.getElementById('log-distance').value) || 100,
                    groupSizeMm: document.getElementById('log-group').value.trim(),
                    weatherShort: document.getElementById('log-weather').value.trim(),
                    notes: document.getElementById('log-notes').value.trim()
                };

                state.logbook.unshift(entry);
                state.logDraft = { ...state.logDraft, groupSizeMm: '', notes: '' };
                saveState();
                setNotice(t('savedMsg'), 'success');
            });

            document.querySelectorAll('.btn-delete-log').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.logbook = state.logbook.filter(item => item.id !== btn.dataset.id);
                    saveState();
                    render();
                });
            });
        }
    }

    // Service Worker Registrierung (für Offline-Fähigkeit)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => {
                console.warn('Service Worker Registrierung fehlgeschlagen:', err);
            });
        });
    }

    // Initiales Rendering beim Laden
    document.addEventListener('DOMContentLoaded', render);
})();
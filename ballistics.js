window.Ballistics = (function(){
  const G1 = [[0.00,0.2629],[0.05,0.2558],[0.10,0.2487],[0.15,0.2413],[0.20,0.2344],[0.25,0.2278],[0.30,0.2214],[0.35,0.2155],[0.40,0.2104],[0.45,0.2061],[0.50,0.2041],[0.55,0.2074],[0.60,0.2117],[0.65,0.2178],[0.70,0.2260],[0.75,0.2413],[0.80,0.2797],[0.85,0.3143],[0.90,0.3687],[0.95,0.4115],[1.00,0.4560],[1.05,0.4500],[1.10,0.4485],[1.15,0.4373],[1.20,0.4280],[1.25,0.4187],[1.30,0.4063],[1.35,0.3990],[1.40,0.3940],[1.45,0.3910],[1.50,0.3860],[1.55,0.3810],[1.60,0.3760],[1.65,0.3720],[1.70,0.3680],[1.75,0.3630],[1.80,0.3580],[1.85,0.3530],[1.90,0.3480],[1.95,0.3430],[2.00,0.3224],[2.05,0.3180],[2.10,0.3130],[2.15,0.3080],[2.20,0.3030],[2.25,0.2980],[2.30,0.2940],[2.35,0.2910],[2.40,0.2880],[2.50,0.2877],[2.60,0.2840],[2.70,0.2810],[2.80,0.2780],[2.90,0.2750],[3.00,0.2638],[3.20,0.2610],[3.40,0.2580],[3.60,0.2550],[3.80,0.2520],[4.00,0.2490],[4.50,0.2420],[5.00,0.2350]];
  const OMEGA = 7.2921159e-5;
  const G = 9.80665;

  function g1Drag(mach){
    if(mach<=0) return G1[0][1];
    if(mach>=5) return G1[G1.length-1][1];
    for(let i=1;i<G1.length;i++){
      if(G1[i][0] >= mach){
        const f = (mach-G1[i-1][0])/(G1[i][0]-G1[i-1][0]);
        return G1[i-1][1] + f*(G1[i][1]-G1[i-1][1]);
      }
    }
    return G1[G1.length-1][1];
  }

  function calcDensityAltitude(pressureHpa, tempC) {
    const P0 = 1013.25;
    const pressureAltFt = 145366.45 * (1 - Math.pow((pressureHpa / P0), 0.190284));
    const pressureAltM = pressureAltFt * 0.3048;
    const isaTemp = 15 - (1.98 * (pressureAltM / 1000)); 
    return pressureAltM + (36.576 * (tempC - isaTemp));
  }

  function simulate(p){
    const massKg = p.bulletWeight * 6.479891e-5;
    const caliberM = p.caliberMm / 1000;
    const areaM2 = Math.PI * caliberM * caliberM / 4;
    const bcSI = p.bc * 703.07;
    const formFactor = massKg / (bcSI * caliberM * caliberM);
    const sightH = p.sightHeightMm / 1000;
    const tempK = p.temperatureC + 273.15;
    const pressurePa = p.pressureHpa * 100;
    
    // Feuchte Luft Dichte (vereinfacht)
    const R = 287.05;
    const rho = pressurePa / (R * tempK) * (1 - (0.378 * (p.humidity || 0) * 6.112 * Math.exp((17.67 * p.temperatureC)/(p.temperatureC + 243.5)) / p.pressureHpa));
    const soundSpeed = Math.sqrt(1.4 * R * tempK);

    const latRad = p.latitude * (Math.PI / 180);
    const azRad = p.azimuth * (Math.PI / 180);
    const geffRatio = 1 - (2 * OMEGA * Math.cos(latRad) * Math.sin(azRad) * p.muzzleVelocity) / G;

    const slopeRad = p.slope * (Math.PI / 180);
    const wRad = p.windAngle * Math.PI / 180;
    const wx = p.windSpeed * Math.cos(wRad);
    const wz = p.windSpeed * Math.sin(wRad);

    function integrate(alpha, maxDist, samples){
      let x=0,y=0,z=0,t=0;
      let vx=p.muzzleVelocity*Math.cos(alpha);
      let vy=p.muzzleVelocity*Math.sin(alpha);
      let vz=0;
      const dt = 0.0002;
      const out=[];
      let si=0;
      const sortedSamples = samples.slice().sort((a,b)=>a-b);

      for(let i=0;i<400000 && x<maxDist;i++){
        const px=x, py=y, pz=z, pt=t;
        const rvx=vx-wx, rvy=vy, rvz=vz-wz;
        const rv=Math.sqrt(rvx*rvx+rvy*rvy+rvz*rvz);
        const cd=formFactor*g1Drag(rv/soundSpeed);
        const k=0.5*rho*cd*areaM2*rv/massKg;
        
        const ax=-k*rvx;
        const ay=(-k*rvy) - (G * geffRatio);
        const az=-k*rvz;

        x+=vx*dt; y+=vy*dt; z+=vz*dt;
        vx+=ax*dt; vy+=ay*dt; vz+=az*dt; t+=dt;

        while(si<sortedSamples.length && x>=sortedSamples[si]){
          const target=sortedSamples[si];
          const f=(target-px)/(x-px||1e-9);
          out.push({ distance: target, y: py + f*(y-py), z: pz + f*(z-pz), vx, vy, t: pt + f*(t-pt) });
          si++;
        }
      }
      return out;
    }

    let lo=0, hi=0.06;
    for(let i=0;i<28;i++){
      const mid=(lo+hi)/2;
      const r = integrate(mid, p.zeroDistance+5, [p.zeroDistance]);
      if((r.length ? r[0].y : sightH - 1) < sightH) lo=mid; else hi=mid;
    }
    const alpha = (lo+hi)/2 + (p.slope * Math.PI / 180);

    const samples = p.distances.filter(d=>d>0).sort((a,b)=>a-b);
    const maxDist = Math.max(...samples, p.zeroDistance) + 1;
    const raw = integrate(alpha, maxDist, samples);

    return raw.map(r=>{
      const trueDropCm = (r.y - sightH) * 100;
      const dropCm = trueDropCm * Math.cos(slopeRad); 
      const driftCm = r.z * 100;
      
      const coriolisM = -(OMEGA * Math.sin(latRad) * r.distance * r.t);
      const spinDriftCm = (1.25 * (1 + 1.2) * Math.pow(r.t, 1.83)) * 2.54; 
      
      const finalDriftCm = driftCm + (coriolisM * 100) + spinDriftCm;
      
      const dM = r.distance;
      const milUp = -dropCm * 10 / dM;
      const moaUp = -dropCm * 100 / (2.908 * dM);
      
      let clicks = null;
      if(p.clickUnit && p.clickValue>0) {
        clicks = Math.round((p.clickUnit==='MIL' ? milUp : moaUp) / p.clickValue);
      }

      return {
        distance: r.distance, tof: r.t, velocity: Math.sqrt(r.vx*r.vx+r.vy*r.vy),
        dropCm: dropCm, dropMIL: milUp, dropMOA: moaUp,
        driftCm: finalDriftCm, coriolis: coriolisM*100, spin: spinDriftCm, clicks
      };
    });
  }

  return { simulate, calcDensityAltitude };
})();
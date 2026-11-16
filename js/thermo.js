'use strict';
const GASES={mono:{name:'单原子 monoatomico',cv:1.5,g:5/3},bi:{name:'双原子 biatomico',cv:2.5,g:1.4}};
function fmtTime(s){ if(s<120) return fmt(s,3)+' s'; if(s<7200) return fmt(s/60,3)+' min'; if(s<172800) return fmt(s/3600,3)+' h'; return fmt(s/86400,3)+' 天 (giorni)'; }

/* ===== 14. Calorimetria ===== */
Lab.register({
  id:'calorimetria', group:'thermo', title:'温度、比热与相变', it:'Temperatura, calorimetria, calore specifico, cambiamenti di fase',
  intro:'用恒定功率加热冰块：冰升温 → 熔化 (fusione) → 水升温 → 沸腾 (ebollizione) → 水蒸气升温。相变时温度保持不变。',
  explain:`<p><b>热量 (calore)</b> 是因温差而传递的能量。升温所需热量 Q = mcΔT，c 是<b>比热容 (calore specifico)</b>：水 4186 J/(kg·K)，比冰 (2090) 和水蒸气 (2010) 大得多。</p>
  <p><b>相变 (cambiamento di fase)</b> 期间吸收的热用于破坏分子间结合，<em>温度不变</em>：Q = mL，L 为<b>潜热 (calore latente)</b>。水的熔化热 L<sub>f</sub> = 3.34×10⁵ J/kg，汽化热 L<sub>v</sub> = 2.256×10⁶ J/kg（约为熔化热的 7 倍——所以平台更长）。</p>
  <p>温标换算：T(K) = t(°C) + 273.15。下方的<b>量热器 (calorimetro)</b> 计算两物体混合的平衡温度（无相变、无热损失）。</p>`,
  formulas:[fm(`Q = mcΔT`,'显热 calore sensibile'),fm(`Q = mL`,'潜热 calore latente'),fm(`C = mc`,'热容 capacità termica'),fm(`T<sub>eq</sub> = ${fr('m<sub>1</sub>c<sub>1</sub>T<sub>1</sub> + m<sub>2</sub>c<sub>2</sub>T<sub>2</sub>','m<sub>1</sub>c<sub>1</sub> + m<sub>2</sub>c<sub>2</sub>')}`,'热平衡 equilibrio termico（ΣQ = 0）'),fm(`T(K) = t(°C) + 273.15`)],
  setup(api){
    const p=api.p, ci=2090, cw=4186, cs=2010, Lf=3.34e5, Lv=2.256e6, Tend=130;
    api.slider('m','质量 m <i>(massa)</i>',0.1,2,0.05,0.5,'kg'); api.slider('T0','冰的初温 <i>(temperatura iniziale)</i>',-40,-1,1,-20,'°C');
    api.slider('P','加热功率 P <i>(potenza)</i>',100,3000,50,1000,'W');
    ['ph','T','Q','tt','q1','q2','q3','q4','q5'].forEach((k,i)=>api.readout(k,['状态 fase','温度 T','已吸收热量 Q','加热时间','① 冰升温 mc_ghΔT','② 熔化 mL_f','③ 水升温 mc_aΔT','④ 汽化 mL_v','⑤ 蒸汽升温'][i]));
    const cv=api.canvas(0.45,340), g1=api.graph(0.5,280); let Q;
    const segs=()=>{const m=p.m;return [m*ci*(0-p.T0),m*Lf,m*cw*100,m*Lv,m*cs*(Tend-100)];};
    const stateOf=Q=>{ const s=segs(), m=p.m; let q=Q;
      if(q<s[0]) return {T:p.T0+q/(m*ci),ph:'冰 ghiaccio (solido)',ice:1,water:0,steam:0}; q-=s[0];
      if(q<s[1]) return {T:0,ph:'熔化中 fusione (0 °C)',ice:1-q/s[1],water:q/s[1],steam:0}; q-=s[1];
      if(q<s[2]) return {T:q/(m*cw),ph:'水 acqua (liquido)',ice:0,water:1,steam:0}; q-=s[2];
      if(q<s[3]) return {T:100,ph:'沸腾 ebollizione (100 °C)',ice:0,water:1-q/s[3],steam:q/s[3]}; q-=s[3];
      return {T:100+Math.min(q,s[4])/(m*cs),ph:'水蒸气 vapore',ice:0,water:0,steam:1}; };
    const Qtot=()=>segs().reduce((a,b)=>a+b,0);
    api.anim({reset(){Q=0;}, speeds:[0.5,1,2,4], step(dt){ Q+=Qtot()/30*dt; if(Q>=Qtot()){Q=Qtot();api.pause();} },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const st=stateOf(Q), bx=w*0.25, bw=Math.min(180,w*0.3), by=h-40, bh=h*0.65;
        ctx.fillStyle='#ff6b6b'; for(let i=0;i<5;i++){ ctx.globalAlpha=0.5+0.5*Math.sin(performance.now()/150+i); ctx.beginPath(); ctx.moveTo(bx-bw/2+bw*(i+0.5)/5-6,by+30); ctx.quadraticCurveTo(bx-bw/2+bw*(i+0.5)/5,by+5,bx-bw/2+bw*(i+0.5)/5+6,by+30); ctx.fill(); } ctx.globalAlpha=1;
        ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(bx-bw/2,by-bh); ctx.lineTo(bx-bw/2,by); ctx.lineTo(bx+bw/2,by); ctx.lineTo(bx+bw/2,by-bh); ctx.stroke();
        const wl=st.water*bh*0.45; ctx.fillStyle='#2f78c4cc'; ctx.fillRect(bx-bw/2+2,by-wl,bw-4,wl);
        const nIce=Math.round(st.ice*9); for(let i=0;i<nIce;i++){ const s=26*Math.sqrt(st.ice)+8; ctx.fillStyle='#d8f0ffdd'; ctx.fillRect(bx-bw/2+8+(i%3)*(bw-20)/3, by-s-4-Math.floor(i/3)*(s+3), s, s); }
        if(st.T>=100&&st.water>0) for(let i=0;i<14;i++){ const ph=(performance.now()/700+i*0.37)%1; circle(ctx,bx-bw/2+10+((i*41)%(bw-20)),by-ph*wl,2+ph*2,'#ffffff88'); }
        if(st.steam>0) for(let i=0;i<Math.round(st.steam*30);i++){ const ph=(performance.now()/2500+i*0.13)%1; circle(ctx,bx-bw/2+((i*53)%bw),by-bh*0.5-ph*bh*0.6,6+ph*8,'#ffffff18'); }
        // thermometer
        const tx=w*0.62, ty0=by, ty1=by-bh, TT=v=>ty0-(v+50)/(Tend+50)*(ty0-ty1);
        ctx.fillStyle='#26262b'; ctx.fillRect(tx-6,ty1,12,ty0-ty1); ctx.fillStyle='#ff6b6b'; ctx.fillRect(tx-4,TT(st.T),8,ty0-TT(st.T)); circle(ctx,tx,ty0+8,10,'#ff6b6b');
        for(const v of [-40,0,50,100]){ line(ctx,tx+8,TT(v),tx+16,TT(v),'#9b9ba4'); text(ctx,v+' °C',tx+20,TT(v)+4,'#9b9ba4',11); }
        text(ctx,fmt(st.T,4)+' °C',tx+70,TT(st.T)+5,'#fff',16); text(ctx,st.ph,12,22,'#ffb547',14);
        const curve=[],cur=[]; const QT=Qtot(); for(let i=0;i<=400;i++){const q=QT*i/400; curve.push([q/1e3,stateOf(q).T]); if(q<=Q) cur.push([q/1e3,stateOf(q).T]);} cur.push([Q/1e3,st.T]);
        g1.draw({xr:[0,QT/1e3],xlabel:'Q (kJ)   [时间 t = Q/P]',ylabel:'T (°C)',title:'加热曲线 curva di riscaldamento',series:[{pts:curve,color:'#ffffff33',dash:[4,4],width:1},{pts:cur,color:'#ff6b6b',width:2.5}],marks:[{x:Q/1e3,y:st.T,color:'#fff'}],yr:[Math.min(p.T0,-5)-5,Tend+5]});
        const s=segs(); api.set('ph',st.ph); api.set('T',fmtU(st.T,'°C',4)+' = '+fmt(st.T+273.15,5)+' K'); api.set('Q',fmtU(Q/1e3,'kJ',4)); api.set('tt',fmtTime(Q/p.P));
        ['q1','q2','q3','q4','q5'].forEach((k,i)=>api.set(k,fmtU(s[i]/1e3,'kJ',4)));
      }});
    api.onChange(()=>{api.A.reset();api.play();});
    // calorimeter
    const box=api.extra('量热器：混合平衡温度 · Calorimetro (temperatura di equilibrio)');
    const mats={acqua:4186,alluminio:897,rame:385,ferro:449,piombo:128,vetro:840};
    const opts=Object.entries(mats).map(([k,v])=>`<option value="${v}">${({acqua:'水',alluminio:'铝',rame:'铜',ferro:'铁',piombo:'铅',vetro:'玻璃'})[k]} ${k} (c=${v})</option>`).join('');
    box.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;font-size:13.5px">
      <div><b>物体 1</b><br><select class="b" id="cm1">${opts}</select><br>m₁ (kg) <input id="mm1" type="number" value="0.5" step="0.1" style="width:80px"> T₁ (°C) <input id="tt1" type="number" value="80" style="width:70px"></div>
      <div><b>物体 2</b><br><select class="b" id="cm2">${opts}</select><br>m₂ (kg) <input id="mm2" type="number" value="1" step="0.1" style="width:80px"> T₂ (°C) <input id="tt2" type="number" value="20" style="width:70px"></div>
      </div><div id="calres" style="margin-top:10px;font-size:14px"></div>`;
    box.querySelector('#cm2').value='4186'; box.querySelector('#cm1').value='385';
    const calc=()=>{ const g=id=>+box.querySelector(id).value; const c1=g('#cm1'),c2=g('#cm2'),m1=g('#mm1'),m2=g('#mm2'),T1=g('#tt1'),T2=g('#tt2');
      const Te=(m1*c1*T1+m2*c2*T2)/(m1*c1+m2*c2); const Q1=m1*c1*(Te-T1);
      box.querySelector('#calres').innerHTML=`平衡温度 T<sub>eq</sub> = <b style="color:#b45309">${fmt(Te,4)} °C</b> &nbsp;·&nbsp; 物体 1 吸热 Q₁ = ${fmt(Q1/1e3,4)} kJ，物体 2 吸热 Q₂ = ${fmt(-Q1/1e3,4)} kJ（Q₁ + Q₂ = 0）`; };
    box.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',calc)); calc();
    box.querySelectorAll('input').forEach(e=>{e.style.background='#1e2739';e.style.color='#ececef';e.style.border='1px solid #2e2e34';e.style.borderRadius='6px';e.style.padding='4px';e.style.margin='4px 0';});
  }
});

/* ===== 15. Teoria cinetica (3D) ===== */
Lab.register({
  id:'cinetica', group:'thermo', title:'气体分子动理论', it:'Teoria cinetica dei gas — distribuzione di Maxwell',
  intro:'三维硬球气体（画面为 x–y 投影，越远越暗）。所有分子初速率相同，碰撞后自发趋向三维麦克斯韦分布；分子撞壁产生压强。',
  explain:`<p><b>分子动理论 (teoria cinetica)</b> 把理想气体看作大量做无规运动的质点，彼此及与器壁做弹性碰撞。压强来自分子撞壁的动量变化：PV = ⅓Nm⟨v²⟩。</p>
  <p>与 PV = NkT 比较得 <b>温度的微观意义</b>：⟨½mv²⟩ = (3/2)kT。每个自由度平均 ½kT（<b>能量均分定理 equipartizione</b>）。</p>
  <p>本模拟是<em>三维</em>的：速度有 vₓ, v_y, v_z 三个分量，速率直方图对比三维<b>麦克斯韦–玻尔兹曼分布 (distribuzione di Maxwell-Boltzmann)</b> f(v) ∝ v²e<sup>−mv²/2kT</sup>，三个特征速率之比 v<sub>p</sub> : ⟨v⟩ : v<sub>rms</sub> = √2 : √(8/π) : √3 ≈ 1 : 1.128 : 1.225。勾选"2D 对比"可查看投影速度 √(vₓ²+v_y²) 与二维分布的对比。硬球本身有体积，测得压强会略高于理想值（范德瓦尔斯修正）。</p>`,
  formulas:[fm(`PV = ${fr(1,3)}Nm⟨v<sup>2</sup>⟩ = NkT = nRT`),fm(`⟨K⟩ = ${fr(3,2)}kT, &nbsp; v<sub>rms</sub> = ${sq('3kT/m')} = ${sq('3RT/M')}`),fm(`f(v) = 4π(${fr('m','2πkT')})<sup>3/2</sup> v<sup>2</sup> e<sup>−mv²/2kT</sup>`,'3D 麦克斯韦分布'),fm(`v<sub>p</sub> = ${sq('2RT/M')}, &nbsp; ⟨v⟩ = ${sq('8RT/πM')}`,'最概然速率 / 平均速率'),fm(`v<sub>p</sub> : ⟨v⟩ : v<sub>rms</sub> = √2 : ${sq('8/π')} : √3`),fm(`f<sub>2D</sub>(v) = ${fr('mv','kT')} e<sup>−mv²/2kT</sup>`,'2D 分布（对比用）')],
  setup(api){
    const p=api.p, MM={He:0.004,N2:0.028,O2:0.032,CO2:0.044,Ar:0.040};
    api.select('gas','气体 · gas',[['N2','氮气 N₂'],['He','氦 He'],['O2','氧气 O₂'],['Ar','氩 Ar'],['CO2','二氧化碳 CO₂']],'N2');
    api.slider('T','温度 T',50,1200,10,300,'K'); api.slider('N','分子数 N（模拟）',50,500,10,300);
    api.slider('Vb','容器宽度（体积）',0.5,1.5,0.05,1,'×');
    api.checkbox('c2d','显示 2D 对比（投影速度）',false);
    ['vrms','vp','vm','rat','K','Pm','Pt','ratio'].forEach((k,i)=>api.readout(k,['v_rms = √(3RT/M)','最概然速率 v_p','平均速率 ⟨v⟩','v_p : ⟨v⟩ : v_rms','平均动能 ⟨K⟩ = 3/2 kT','模拟压强 P（测量）','理论 NkT/V（3D）','测量 / 理论'][i]));
    const cv=api.canvas(0.55,420), g1=api.graph(0.6,260), g2=api.graph(0.6,260); let P=[], imp=[], t, curT, Wb;
    const r=0.012, D=0.4, scale=0.001; // box W×1×D (sim units), m/s -> box/s
    const sig=()=>Math.sqrt(R_GAS*curT/MM[p.gas])*scale; // per-component sigma
    api.anim({reset(){ curT=p.T; Wb=p.Vb; P=[]; const v0=Math.sqrt(3)*sig();
        for(let i=0;i<p.N;i++){ const cz=2*Math.random()-1, ph=Math.random()*TAU, s=Math.sqrt(1-cz*cz);
          P.push({x:r+Math.random()*(Wb-2*r),y:r+Math.random()*(1-2*r),z:r+Math.random()*(D-2*r),vx:v0*s*Math.cos(ph),vy:v0*s*Math.sin(ph),vz:v0*cz}); } imp=[]; t=0; },
      step(dt){ const n=4,h=dt/n; let J=0; const lim=[Wb,1,D], ax=['x','y','z'], vv=['vx','vy','vz'];
        for(let s=0;s<n;s++){ for(const q of P){ for(let k=0;k<3;k++){ const a=ax[k], va=vv[k]; q[a]+=q[va]*h; if(q[a]<r){q[a]=2*r-q[a];q[va]=-q[va];J+=2*Math.abs(q[va]);} else if(q[a]>lim[k]-r){q[a]=2*(lim[k]-r)-q[a];q[va]=-q[va];J+=2*Math.abs(q[va]);} } }
          P.sort((a,b)=>a.x-b.x);
          for(let i=0;i<P.length;i++){ const a=P[i]; for(let j=i+1;j<P.length;j++){ const b=P[j], dx=b.x-a.x; if(dx>2*r) break; const dy=b.y-a.y, dz=b.z-a.z, d2=dx*dx+dy*dy+dz*dz;
            if(d2<4*r*r&&d2>0){ const d=Math.sqrt(d2), nx=dx/d, ny=dy/d, nz=dz/d, vr=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny+(a.vz-b.vz)*nz; if(vr>0){ a.vx-=vr*nx; a.vy-=vr*ny; a.vz-=vr*nz; b.vx+=vr*nx; b.vy+=vr*ny; b.vz+=vr*nz; } } } } }
        t+=dt; imp.push([t,J,dt]); while(imp.length&&imp[0][0]<t-4) imp.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=Math.min((w-30)/1.5,h-34), ox=12, oy=24;
        ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=2; ctx.strokeRect(ox,oy,Wb*sc,sc); ctx.fillStyle='#4b4b53'; ctx.fillRect(ox+Wb*sc,oy,6,sc);
        const s=sig(), vs=Math.sqrt(3)*s; const sorted=P.slice().sort((a,b)=>b.z-a.z);
        for(const q of sorted){ const sp=Math.hypot(q.vx,q.vy,q.vz); ctx.globalAlpha=1-0.55*q.z/D; circle(ctx,ox+q.x*sc,oy+q.y*sc,Math.max(2,r*sc*(1.15-0.4*q.z/D)),heatColor(sp/(2*vs))); } ctx.globalAlpha=1;
        text(ctx,'x–y 投影 · 颜色 = 速率（蓝慢→红快）· 暗 = 远 (z 大)',ox,16,'#9b9ba4',11.5);
        const two=p.c2d, vmax=4.2*s, nb=22, bw=vmax/nb, hist=new Array(nb).fill(0);
        for(const q of P){ const v=two?Math.hypot(q.vx,q.vy):Math.hypot(q.vx,q.vy,q.vz); const b=Math.floor(v/bw); if(b<nb) hist[b]++; }
        const th=[]; for(let v=0;v<=vmax;v+=vmax/120){ const f=two?(v/(s*s))*Math.exp(-v*v/(2*s*s)):Math.sqrt(2/Math.PI)*v*v/(s*s*s)*Math.exp(-v*v/(2*s*s)); th.push([v/scale,P.length*bw*f]); }
        const vp=Math.SQRT2*s/scale, vm=Math.sqrt(8/Math.PI)*s/scale, vr=Math.sqrt(3)*s/scale;
        g1.draw({xr:[0,vmax/scale],xlabel:'v (m/s)',ylabel:'分子数',title:two?'投影速率 vs 2D 麦克斯韦分布':'模拟速率直方图 vs 3D 麦克斯韦分布',y0:true,series:[{pts:hist.map((c,i)=>[(i+0.5)*bw/scale,c]),bars:bw/scale,color:'#4f9dff99'},{pts:th,color:'#ffb547'}],
          vlines:two?[]:[{x:vp,label:'v_p',color:'#3ecf8e'},{x:vm,label:'⟨v⟩',color:'#4f9dff',dy:14},{x:vr,label:'v_rms',color:'#ff6b6b',dy:28}]});
        const M=MM[p.gas], f3=(v,T)=>{const a=M/(2*R_GAS*T);return 4*Math.PI*Math.pow(a/Math.PI,1.5)*v*v*Math.exp(-a*v*v);}, vmx=4*Math.sqrt(2*R_GAS*Math.max(curT,300)/M), c1=[],c2=[];
        for(let v=0;v<=vmx;v+=vmx/150){c1.push([v,f3(v,curT)*1e3]);c2.push([v,f3(v,300)*1e3]);}
        const Vp=Math.sqrt(2*R_GAS*curT/M), Vm=Math.sqrt(8*R_GAS*curT/(Math.PI*M)), Vr=Math.sqrt(3*R_GAS*curT/M);
        g2.draw({xr:[0,vmx],xlabel:'v (m/s)',ylabel:'f(v) ×10⁻³ (s/m)',title:p.gas+' 真实分布（虚线 = 300 K）',y0:true,series:[{pts:c2,color:'#ffffff55',dash:[4,4],width:1},{pts:c1,color:'#ff6b6b',fill:true}],vlines:[{x:Vp,label:'v_p',color:'#3ecf8e'},{x:Vm,label:'⟨v⟩',color:'#4f9dff',dy:14},{x:Vr,label:'v_rms',color:'#ffb547',dy:28}]});
        let J=0,T=0; for(const q of imp){J+=q[1];T+=q[2];} const Atot=2*(Wb*1+Wb*D+1*D); const Pm=T>0?J/(T*Atot):0;
        let k2=0; for(const q of P) k2+=q.vx*q.vx+q.vy*q.vy+q.vz*q.vz; const kT=k2/(3*P.length), Pt=P.length*kT/((Wb-2*r)*(1-2*r)*(D-2*r));
        api.set('vrms',fmtU(Vr,'m/s')); api.set('vp',fmtU(Vp,'m/s')); api.set('vm',fmtU(Vm,'m/s')); api.set('rat',`1 : ${fmt(Vm/Vp,4)} : ${fmt(Vr/Vp,4)}`); api.set('K',fmtU(1.5*K_B*curT,'J'));
        api.set('Pm',fmt(Pm,3)+' (模拟单位)'); api.set('Pt',fmt(Pt,3)+' (模拟单位)'); api.set('ratio',T>2?fmt(Pm/Pt,3):'测量中…');
      }});
    api.onChange(k=>{ if(k==='c2d') return; if(k==='T'){ const f=Math.sqrt(p.T/curT); for(const q of P){q.vx*=f;q.vy*=f;q.vz*=f;} curT=p.T; imp=[]; return; }
      if(k==='Vb'){ const f=(p.Vb-2*r)/(Wb-2*r); for(const q of P){ q.x=r+(q.x-r)*f; } Wb=p.Vb; imp=[]; return; } api.A.reset(); api.play(); });
  }
});

/* ---------- thermo process helpers (n mol, P in kPa, V in L -> PV in J) ---------- */
function procPoints(type,s1,s2,n,gas,N=80){ // s = {P,V}
  const pts=[]; const T1=s1.P*s1.V/(n*R_GAS);
  for(let i=0;i<=N;i++){ const u=i/N; let V,P;
    if(type==='isocora'){ V=s1.V; P=lerp(s1.P,s2.P,u); }
    else { V=lerp(s1.V,s2.V,u);
      if(type==='isoterma') P=n*R_GAS*T1/V; else if(type==='isobara') P=s1.P; else if(type==='adiabatica') P=s1.P*Math.pow(s1.V/V,gas.g); else P=lerp(s1.P,s2.P,u); }
    pts.push([V,P]); }
  return pts;
}
function procEnergy(type,s1,s2,n,gas){ const T1=s1.P*s1.V/(n*R_GAS), T2=s2.P*s2.V/(n*R_GAS), dU=n*gas.cv*R_GAS*(T2-T1);
  let L; if(type==='isoterma') L=n*R_GAS*T1*Math.log(s2.V/s1.V); else if(type==='isobara') L=s1.P*(s2.V-s1.V); else if(type==='isocora') L=0; else if(type==='adiabatica') L=-dU; else L=0.5*(s1.P+s2.P)*(s2.V-s1.V);
  const Q=type==='adiabatica'?0:dU+L; const dS=n*gas.cv*R_GAS*Math.log(T2/T1)+n*R_GAS*Math.log(s2.V/s1.V);
  return {T1,T2,dU,L,Q,dS:Math.abs(dS)<1e-9?0:dS}; }
const S_of=(P,V,n,gas)=>{const T=P*V/(n*R_GAS); return n*R_GAS*(gas.cv*Math.log(T)+Math.log(V));};
function cylinder(ctx,x,y,w,h,frac,T,Tmin,Tmax,Q,adiab){
  ctx.save(); const top=y+h*(1-frac);
  ctx.fillStyle=heatColor((T-Tmin)/Math.max(1,Tmax-Tmin)); ctx.globalAlpha=0.55; ctx.fillRect(x,top,w,y+h-top); ctx.globalAlpha=1;
  ctx.fillStyle='#9b9ba4'; ctx.fillRect(x-4,top-12,w+8,12); ctx.fillRect(x+w/2-4,top-60,8,48);
  ctx.strokeStyle=adiab?'#ffb547':'#d4d4d8'; ctx.lineWidth=adiab?6:3; ctx.setLineDash(adiab?[6,4]:[]); ctx.beginPath(); ctx.moveTo(x,y-10); ctx.lineTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w,y-10); ctx.stroke(); ctx.setLineDash([]);
  for(let i=0;i<18;i++){ const px=x+6+((i*37)%(w-12)), py=top+6+((i*53+performance.now()/8*(T/300))%(Math.max(8,y+h-top-12))); circle(ctx,px,py,2.5,'#fff9'); }
  if(Math.abs(Q)>1e-6&&!adiab){ for(let i=0;i<3;i++){ const yy=y+h+12+i*0; const xx=x+w*(i+1)/4; if(Q>0) arrow(ctx,xx,y+h+40,xx,y+h+8,'#ff6b6b'); else arrow(ctx,xx,y+h+8,xx,y+h+40,'#4f9dff'); } text(ctx,Q>0?'Q > 0 吸热':'Q < 0 放热',x+w+10,y+h+30,Q>0?'#ff6b6b':'#4f9dff',12); }
  if(adiab) text(ctx,'绝热 Q = 0',x+w+10,y+h+10,'#ffb547',12);
  ctx.restore();
}

/* ===== 16. Gas ideale e trasformazioni ===== */
Lab.register({
  id:'trasformazioni', group:'thermo', title:'理想气体与四种基本过程', it:'Gas ideale e trasformazioni: isoterma, isobara, isocora, adiabatica',
  intro:'在 P–V 图上进行准静态过程，自动计算 Q、L、ΔU 并验证热力学第一定律 ΔU = Q − L。',
  explain:`<p><b>理想气体状态方程 (equazione di stato)</b> PV = nRT。四种基本<b>准静态过程 (trasformazioni quasi-statiche)</b>：</p>
  <p>• <b>等温 (isoterma)</b> T 不变：ΔU = 0，Q = L = nRT ln(V₂/V₁)。<br>• <b>等压 (isobara)</b>：L = PΔV，Q = nc<sub>p</sub>ΔT。<br>• <b>等容 (isocora)</b>：L = 0，Q = ΔU = nc<sub>V</sub>ΔT。<br>• <b>绝热 (adiabatica)</b>：Q = 0，PV<sup>γ</sup> = 常数，L = −ΔU。绝热线比等温线更陡。</p>
  <p>本工具采用意大利教材惯例：<em>L = 气体对外做的功</em>（膨胀为正），P–V 曲线下面积 = L（绿色正，红色负）。单位：kPa·L = J。</p>`,
  formulas:[fm(`PV = nRT`),fm(`ΔU = Q − L, &nbsp; L = ∫P dV`,'第一定律'),fm(`ΔU = nc<sub>V</sub>ΔT, &nbsp; c<sub>p</sub> − c<sub>V</sub> = R`,'Mayer 关系'),fm(`c<sub>V</sub> = ${fr(3,2)}R (mono), ${fr(5,2)}R (bi); &nbsp; γ = ${fr('c<sub>p</sub>','c<sub>V</sub>')}`),fm(`PV<sup>γ</sup> = cost., &nbsp; TV<sup>γ−1</sup> = cost.`,'绝热过程'),fm(`L<sub>iso-T</sub> = nRT ln${fr('V<sub>2</sub>','V<sub>1</sub>')}, &nbsp; L<sub>adiab</sub> = ${fr('P<sub>1</sub>V<sub>1</sub> − P<sub>2</sub>V<sub>2</sub>','γ − 1')}`)],
  setup(api){
    const p=api.p;
    api.select('pr','过程 · trasformazione',[['isoterma','等温 isoterma'],['isobara','等压 isobara'],['isocora','等容 isocora'],['adiabatica','绝热 adiabatica']],'isoterma');
    api.select('gas','气体 · gas',[['mono','单原子 monoatomico (γ = 5/3)'],['bi','双原子 biatomico (γ = 7/5)']],'mono');
    api.slider('n','物质的量 n <i>(moli)</i>',0.1,3,0.1,1,'mol'); api.slider('P1','初压 P₁',50,500,5,200,'kPa'); api.slider('V1','初体积 V₁',2,40,0.5,12,'L');
    const v2S=api.slider('V2','终体积 V₂（等容时无效）',2,60,0.5,30,'L'); const t2S=api.slider('T2','终温 T₂（仅等容）',50,1500,10,600,'K');
    ['s1','s2','Q','L','dU','chk','dS','pvg'].forEach((k,i)=>api.readout(k,['状态 1 (P, V, T)','状态 2 (P, V, T)','热量 Q','功 L（气体对外）','内能变化 ΔU','Q − L = ΔU ?','熵变 ΔS','P·V<sup>γ</sup>（1 → 2）'][i]));
    const cv=api.canvas(0.5,360), gpv=api.graph(0.7,330), gb=api.graph(0.7,330); let u;
    const st=()=>{ const gas=GASES[p.gas], s1={P:p.P1,V:p.V1}; let s2;
      if(p.pr==='isocora') s2={V:p.V1,P:p.n*R_GAS*p.T2/p.V1}; else if(p.pr==='isoterma') s2={V:p.V2,P:p.P1*p.V1/p.V2}; else if(p.pr==='isobara') s2={V:p.V2,P:p.P1}; else s2={V:p.V2,P:p.P1*Math.pow(p.V1/p.V2,gas.g)};
      return {gas,s1,s2,E:procEnergy(p.pr,s1,s2,p.n,gas)}; };
    api.anim({reset(){u=0;}, step(dt){ u+=dt/3; if(u>1.4) u=0; },
      draw(){
        const {gas,s1,s2,E}=st(); v2S.el.style.opacity=p.pr==='isocora'?0.4:1; t2S.el.style.opacity=p.pr==='isocora'?1:0.4;
        const pts=procPoints(p.pr,s1,s2,p.n,gas,120), k=Math.min(1,u), idx=Math.round(k*120), cur=pts[idx], Tc=cur[0]*cur[1]/(p.n*R_GAS);
        const {ctx,w,h}=cv; clear(ctx,w,h); const Vmax=Math.max(s1.V,s2.V)*1.1, Tmin=Math.min(E.T1,E.T2), Tmax=Math.max(E.T1,E.T2);
        cylinder(ctx,w*0.15,30,w*0.25,h-110,cur[0]/Vmax,Tc,Tmin-1,Tmax+1,E.Q*(k<1?1:0),p.pr==='adiabatica');
        text(ctx,`V = ${fmt(cur[0],4)} L`,w*0.5,50,'#d4d4d8',14); text(ctx,`P = ${fmt(cur[1],4)} kPa`,w*0.5,74,'#d4d4d8',14); text(ctx,`T = ${fmt(Tc,4)} K`,w*0.5,98,'#ffb547',14);
        const Lp=procEnergy(p.pr,s1,{V:cur[0],P:cur[1]},p.n,gas); text(ctx,`至此: L = ${fmt(Lp.L,4)} J, Q = ${fmt(Lp.Q,4)} J, ΔU = ${fmt(Lp.dU,4)} J`,w*0.5,124,'#9b9ba4',12);
        // isotherms background
        const iso=T=>{const a=[];for(let V=1;V<=65;V+=0.5)a.push([V,p.n*R_GAS*T/V]);return a;};
        const Pmax=Math.max(s1.P,s2.P)*1.25, Vr=[0,Math.max(s1.V,s2.V)*1.2];
        gpv.draw({xr:Vr,yr:[0,Pmax],xlabel:'V (L)',ylabel:'P (kPa)',title:'P–V 图（面积 = L）',series:[{pts:iso(E.T1),color:'#ffffff30',dash:[3,4],width:1},{pts:iso(E.T2),color:'#ffffff30',dash:[3,4],width:1},{pts:pts.slice(0,idx+1),color:E.L>=0?'#3ecf8e':'#ff6b6b',fill:true,fillColor:E.L>=0?'#3ecf8e33':'#ff6b6b33',width:0.01},{pts,color:'#4f9dff',width:2.5}],marks:[{x:s1.V,y:s1.P,color:'#fff',label:'1'},{x:s2.V,y:s2.P,color:'#fff',label:'2'},{x:cur[0],y:cur[1],color:'#ffb547',r:6}]});
        gb.draw({xr:[0,4],xlabel:'',ylabel:'J',title:'能量账本：Q（蓝）、L（绿）、ΔU（橙）',y0:true,series:[{pts:[[0.7,E.Q]],bars:0.8,color:'#4f9dff'},{pts:[[2,E.L]],bars:0.8,color:'#3ecf8e'},{pts:[[3.3,E.dU]],bars:0.8,color:'#ffb547'}]});
        const sv=(s,T)=>`${fmt(s.P,4)} kPa, ${fmt(s.V,4)} L, ${fmt(T,4)} K`;
        api.set('s1',sv(s1,E.T1)); api.set('s2',sv(s2,E.T2)); api.set('Q',fmtU(E.Q,'J',4)); api.set('L',fmtU(E.L,'J',4)); api.set('dU',fmtU(E.dU,'J',4));
        api.set('chk',Math.abs(E.Q-E.L-E.dU)<1e-6*Math.max(1,Math.abs(E.Q))?'<span class="ok">✓ '+fmt(E.Q-E.L,4)+' J</span>':'<span class="bad">✗</span>');
        api.set('dS',fmtU(E.dS,'J/K',4)); api.set('pvg',`${fmt(s1.P*Math.pow(s1.V,gas.g),5)} → ${fmt(s2.P*Math.pow(s2.V,gas.g),5)}`);
      }});
    api.onChange(()=>{u=0;});
  }
});

/* ===== 17. Primo principio ===== */
Lab.register({
  id:'primo', group:'thermo', title:'热力学第一定律：路径与状态函数', it:'Primo principio della termodinamica — funzioni di stato',
  intro:'从同一状态 A 到同一状态 B，走三条不同路径：ΔU 完全相同（状态函数），但 Q 和 L 不同（与路径有关）。',
  explain:`<p><b>第一定律 (primo principio)</b>：ΔU = Q − L —— 能量守恒在热现象中的表述。</p>
  <p><b>内能 U (energia interna)</b> 是<b>状态函数 (funzione di stato)</b>：只取决于初末状态，理想气体中只取决于温度。而<b>热量 Q</b> 和<b>功 L</b> 不是状态函数，取决于具体路径——P–V 曲线下的面积不同。</p>
  <p>若沿路径 ① 从 A 到 B，再沿路径 ② 返回 A，就构成一个<b>循环 (ciclo)</b>：ΔU = 0，净功 = 两条路径之间围成的面积 = 净吸热。这正是热机的原理（见下一个模型）。</p>`,
  formulas:[fm(`ΔU = Q − L`),fm(`ΔU<sub>A→B</sub> = nc<sub>V</sub>(T<sub>B</sub> − T<sub>A</sub>)`,'与路径无关'),fm(`L = ∫<sub>A</sub><sup>B</sup> P dV`,'与路径有关'),fm(`∮dU = 0 &nbsp; ⇒ &nbsp; Q<sub>ciclo</sub> = L<sub>ciclo</sub>`,'循环')],
  setup(api){
    const p=api.p;
    api.select('path','高亮路径 · percorso',[['1','① 等压 → 等容 (A→C→B)'],['2','② 等容 → 等压 (A→D→B)'],['3','③ 直线 (A→B)']],'1');
    api.select('gas','气体',[['mono','单原子 mono'],['bi','双原子 bi']],'mono');
    api.slider('PA','P_A',50,400,5,300,'kPa'); api.slider('VA','V_A',2,40,0.5,8,'L'); api.slider('PB','P_B',50,400,5,100,'kPa'); api.slider('VB','V_B',2,40,0.5,30,'L');
    api.readout('dU','ΔU（三条路径相同）'); api.readout('TA','T_A → T_B（n = 1 mol）'); api.sep();
    ['1','2','3'].forEach(i=>{ api.readout('Q'+i,`路径 ${'①②③'[i-1]} Q`); api.readout('L'+i,`路径 ${'①②③'[i-1]} L`); });
    const gpv=api.graph(0.62,380); const tb=api.extra('三条路径对比 · Confronto dei percorsi'); let u;
    const paths=()=>{ const A={P:p.PA,V:p.VA}, B={P:p.PB,V:p.VB}, C={P:p.PA,V:p.VB}, D={P:p.PB,V:p.VA};
      return [[['isobara',A,C],['isocora',C,B]],[['isocora',A,D],['isobara',D,B]],[['line',A,B]]]; };
    api.anim({reset(){u=0;}, step(dt){u=(u+dt/4)%1.25;},
      draw(){
        const gas=GASES[p.gas], n=1, ps=paths(), cols=['#3ecf8e','#c792ea','#ffb547'], sel=+p.path-1; const series=[]; let rows='';
        const res=ps.map((segs,i)=>{ let Q=0,L=0,dU=0,pts=[]; for(const [t,a,b] of segs){ const e=procEnergy(t,a,b,n,gas); Q+=e.Q; L+=e.L; dU+=e.dU; pts=pts.concat(procPoints(t,a,b,n,gas,60)); } return {Q,L,dU,pts}; });
        res.forEach((r,i)=>{ if(i===sel) series.push({pts:r.pts.concat([[r.pts[r.pts.length-1][0],0],[r.pts[0][0],0]]),color:cols[i],fill:'closed',fillColor:cols[i]+'30',width:0.01}); });
        res.forEach((r,i)=>series.push({pts:r.pts,color:cols[i],width:i===sel?3:1.5,dash:i===sel?[]:[5,4],label:'①②③'[i]}));
        const r=res[sel], k=Math.min(1,u), cur=r.pts[Math.round(k*(r.pts.length-1))];
        const Pm=Math.max(p.PA,p.PB)*1.2, Vm=Math.max(p.VA,p.VB)*1.15;
        gpv.draw({xr:[0,Vm],yr:[0,Pm],xlabel:'V (L)',ylabel:'P (kPa)',title:'P–V 图：A → B 的三条路径（阴影 = 所选路径的 L）',legend:true,series,marks:[{x:p.VA,y:p.PA,color:'#fff',label:'A'},{x:p.VB,y:p.PB,color:'#fff',label:'B'},{x:cur[0],y:cur[1],color:cols[sel],r:6}]});
        const TA=p.PA*p.VA/R_GAS, TB=p.PB*p.VB/R_GAS;
        api.set('dU',fmtU(res[0].dU,'J',4)); api.set('TA',`${fmt(TA,4)} K → ${fmt(TB,4)} K`);
        res.forEach((q,i)=>{ api.set('Q'+(i+1),fmtU(q.Q,'J',4)); api.set('L'+(i+1),fmtU(q.L,'J',4)); rows+=`<tr><td style="color:${cols[i]}">${['① 等压→等容','② 等容→等压','③ 直线'][i]}</td><td>${fmt(q.Q,4)}</td><td>${fmt(q.L,4)}</td><td>${fmt(q.dU,4)}</td><td>${fmt(q.Q-q.L,4)}</td></tr>`; });
        const html=`<table class="tbl"><tr><th>路径 percorso</th><th>Q (J)</th><th>L (J)</th><th>ΔU (J)</th><th>Q − L (J)</th></tr>${rows}</table><p style="font-size:13px;color:#8b8b94">循环 A →① B →② A 的净功 = L₁ − L₂ = ${fmt(res[0].L-res[1].L,4)} J（= 两路径围成的矩形面积 (P_A − P_B)(V_B − V_A) = ${fmt((p.PA-p.PB)*(p.VB-p.VA),4)} J）</p>`;
        if(tb._h!==html){ tb.innerHTML=html; tb._h=html; }
      }});
    api.onChange(()=>{u=0;});
  }
});

/* ===== 18. Cicli termodinamici ===== */
Lab.register({
  id:'cicli', group:'thermo', title:'热机循环：卡诺、奥托、狄塞尔', it:'Cicli termodinamici — macchina termica e frigorifera, Carnot, Otto, Diesel',
  intro:'循环一周 ΔU = 0，P–V 图围成的面积 = 净功。比较不同循环的效率，或反向运行成为制冷机 (macchina frigorifera)。',
  explain:`<p><b>热机 (macchina termica)</b>：从高温热源吸热 Q<sub>ass</sub>，对外做功 L，向低温热源放热 Q<sub>ced</sub>。效率 η = L/Q<sub>ass</sub> = 1 − |Q<sub>ced</sub>|/Q<sub>ass</sub>。</p>
  <p><b>卡诺循环 (ciclo di Carnot)</b>：两条等温线 + 两条绝热线，是在两个温度之间工作的效率最高的可逆循环：η<sub>C</sub> = 1 − T<sub>c</sub>/T<sub>h</sub>（<b>卡诺定理</b>）。T–S 图上它是一个矩形。</p>
  <p><b>奥托循环 (Otto, 汽油机)</b>：两绝热 + 两等容，η = 1 − 1/r<sup>γ−1</sup>。<b>狄塞尔循环 (Diesel, 柴油机)</b>：等压吸热。勾选"反向"即为<b>制冷机 / 热泵</b>：外界做功，从冷源吸热，COP = Q<sub>c</sub>/|L|。</p>`,
  formulas:[fm(`η = ${fr('L','Q<sub>ass</sub>')} = 1 − ${fr('|Q<sub>ced</sub>|','Q<sub>ass</sub>')}`,'热机效率 rendimento'),fm(`η<sub>Carnot</sub> = 1 − ${fr('T<sub>c</sub>','T<sub>h</sub>')}`),fm(`η<sub>Otto</sub> = 1 − ${fr(1,'r<sup>γ−1</sup>')}`,'r = V_max/V_min 压缩比'),fm(`η<sub>Diesel</sub> = 1 − ${fr('r<sub>c</sub><sup>γ</sup> − 1','γ r<sup>γ−1</sup>(r<sub>c</sub> − 1)')}`,'r_c = 截止比 rapporto di combustione'),fm(`COP<sub>frigo</sub> = ${fr('Q<sub>c</sub>','|L|')}, &nbsp; COP<sub>Carnot</sub> = ${fr('T<sub>c</sub>','T<sub>h</sub> − T<sub>c</sub>')}`,'制冷系数')],
  setup(api){
    const p=api.p, n=1;
    api.select('cy','循环 · ciclo',[['carnot','卡诺 Carnot'],['otto','奥托 Otto'],['diesel','狄塞尔 Diesel']],'carnot');
    api.select('gas','气体',[['bi','双原子 biatomico (γ = 1.4)'],['mono','单原子 monoatomico (γ = 5/3)']],'bi');
    api.checkbox('rev','反向运行：制冷机 / 热泵 (frigorifero)',false);
    const thS=api.slider('Th','T_h 高温（卡诺）/ T_max（奥托）',400,2500,10,600,'K'); api.slider('Tc','T_c 低温 / 进气温度 T₁',200,600,5,300,'K');
    api.slider('ri','卡诺等温膨胀比 V₂/V₁',1.2,5,0.1,2.5); api.slider('r','压缩比 r（Otto / Diesel）',2,22,0.5,8); api.slider('rc','截止比 r_c（Diesel）',1.1,4,0.05,2);
    ['eta','th','Qin','Qout','L','cop','chk'].forEach((k,i)=>api.readout(k,['效率 η（计算）','理论公式','吸热 Q_ass（总）','放热 Q_ced（总）','净功 L = 面积','COP（反向时）','∮dU = 0 ?'][i]));
    const cv=api.canvas(0.36,260), gpv=api.graph(0.72,320), gts=api.graph(0.72,320); const tb=api.extra('各过程明细 · Dettaglio delle trasformazioni'); let u;
    function build(){ const gas=GASES[p.gas], g=gas.g, R=R_GAS; let segs=[], warn='';
      const S=(V,T)=>({V,P:n*R*T/V});
      if(p.cy==='carnot'){ const Th=p.Th, Tc=Math.min(p.Tc,p.Th-10), V1=10, V2=V1*p.ri, k=Math.pow(Th/Tc,1/(g-1)), V3=V2*k, V4=V1*k;
        const s1=S(V1,Th),s2=S(V2,Th),s3=S(V3,Tc),s4=S(V4,Tc); segs=[['isoterma',s1,s2,'1→2 等温膨胀'],['adiabatica',s2,s3,'2→3 绝热膨胀'],['isoterma',s3,s4,'3→4 等温压缩'],['adiabatica',s4,s1,'4→1 绝热压缩']];
        return {gas,segs,theory:1-Tc/Th,copT:Tc/(Th-Tc),tlabel:'1 − T_c/T_h',warn}; }
      const T1=p.Tc, V1=24, V2=V1/p.r, T2=T1*Math.pow(p.r,g-1), s1=S(V1,T1), s2=S(V2,T2);
      if(p.cy==='otto'){ let T3=p.Th; if(T3<=T2*1.02){T3=T2*1.2; warn='T_max 低于压缩终温，已自动调整';} const s3=S(V2,T3), T4=T3/Math.pow(p.r,g-1), s4=S(V1,T4);
        segs=[['adiabatica',s1,s2,'1→2 绝热压缩'],['isocora',s2,s3,'2→3 等容加热（燃烧）'],['adiabatica',s3,s4,'3→4 绝热膨胀'],['isocora',s4,s1,'4→1 等容放热']];
        return {gas,segs,theory:1-1/Math.pow(p.r,g-1),tlabel:'1 − 1/r^(γ−1)',warn}; }
      const V3=V2*p.rc, T3=T2*p.rc, s3=S(V3,T3), T4=T3*Math.pow(V3/V1,g-1), s4=S(V1,T4);
      segs=[['adiabatica',s1,s2,'1→2 绝热压缩'],['isobara',s2,s3,'2→3 等压加热（燃烧）'],['adiabatica',s3,s4,'3→4 绝热膨胀'],['isocora',s4,s1,'4→1 等容放热']];
      return {gas,segs,theory:1-(Math.pow(p.rc,g)-1)/(g*Math.pow(p.r,g-1)*(p.rc-1)),tlabel:'Diesel 公式',warn}; }
    api.anim({reset(){u=0;}, step(dt){u=(u+dt/6)%1;},
      draw(){
        let {gas,segs,theory,copT,tlabel,warn}=build();
        if(p.rev) segs=segs.slice().reverse().map(s=>[s[0],s[2],s[1],s[3].replace(/(\d)→(\d)/,'$2→$1')]);
        const data=segs.map(s=>({s,e:procEnergy(s[0],s[1],s[2],n,gas),pts:procPoints(s[0],s[1],s[2],n,gas,80)}));
        let Qin=0,Qout=0,L=0,dU=0; data.forEach(d=>{ if(d.e.Q>0) Qin+=d.e.Q; else Qout+=d.e.Q; L+=d.e.L; dU+=d.e.dU; });
        const all=[].concat(...data.map(d=>d.pts)); const k=Math.min(data.length-1e-9,u*data.length), si=Math.floor(k), cur=data[si].pts[Math.round((k-si)*80)];
        const cols=['#ff6b6b','#ffb547','#4f9dff','#c792ea'];
        gpv.draw({xlabel:'V (L)',ylabel:'P (kPa)',title:'P–V 图（围成面积 = 净功）',y0:true,series:[{pts:all,color:'#3ecf8e',fill:'closed',fillColor:'#3ecf8e22',width:0.01}].concat(data.map((d,i)=>({pts:d.pts,color:cols[i],width:2.5}))),marks:data.map(d=>({x:d.s[1].V,y:d.s[1].P,color:'#fff',r:3.5,label:d.s[3].split('→')[0]})).concat([{x:cur[0],y:cur[1],color:'#fff',r:6}])});
        const ts=d=>d.pts.map(q=>[S_of(q[1],q[0],n,gas),q[0]*q[1]/(n*R_GAS)]); const S0=Math.min(...all.map(q=>S_of(q[1],q[0],n,gas)));
        gts.draw({xlabel:'S − S₀ (J/K)',ylabel:'T (K)',title:'T–S 图（面积 = 热量）',y0:true,series:data.map((d,i)=>({pts:ts(d).map(q=>[q[0]-S0,q[1]]),color:cols[i],width:2.5})),marks:[{x:S_of(cur[1],cur[0],n,gas)-S0,y:cur[0]*cur[1]/(n*R_GAS),color:'#fff',r:6}]});
        // engine schematic
        const {ctx,w,h}=cv; clear(ctx,w,h); const cx=Math.max(w*0.3,150), Tmax=Math.max(...all.map(q=>q[0]*q[1]/(n*R_GAS))), Tmin=Math.min(...all.map(q=>q[0]*q[1]/(n*R_GAS)));
        ctx.fillStyle='#7a2a2a'; ctx.fillRect(cx-90,8,180,34); text(ctx,`热源 T_h ≈ ${fmt(Tmax,4)} K`,cx,30,'#fff',13,'center');
        ctx.fillStyle='#1f3f73'; ctx.fillRect(cx-90,h-42,180,34); text(ctx,`冷源 T_c ≈ ${fmt(Tmin,4)} K`,cx,h-20,'#fff',13,'center');
        circle(ctx,cx,h/2,28,'#2e2e34','#d4d4d8',2); text(ctx,p.rev?'COP':'η',cx,h/2+5,'#fff',p.rev?13:18,'center');
        const sw=v=>clamp(2+12*Math.abs(v)/Math.max(Qin,1),2,16);
        if(!p.rev){ arrow(ctx,cx,44,cx,h/2-30,'#ff6b6b','',sw(Qin)); arrow(ctx,cx,h/2+30,cx,h-44,'#4f9dff','',sw(Qout)); arrow(ctx,cx+30,h/2,cx+110,h/2,'#3ecf8e','',sw(L)); }
        else { arrow(ctx,cx,h/2-30,cx,44,'#ff6b6b','',sw(Qout)); arrow(ctx,cx,h-44,cx,h/2+30,'#4f9dff','',sw(Qin)); arrow(ctx,cx+110,h/2,cx+30,h/2,'#3ecf8e','',sw(L)); }
        text(ctx,`|Q_h| = ${fmt(p.rev?-Qout:Qin,4)} J`,cx-22,h/2-44,'#ff6b6b',12,'right'); text(ctx,`|Q_c| = ${fmt(p.rev?Qin:-Qout,4)} J`,cx-22,h/2+52,'#4f9dff',12,'right'); text(ctx,`|L| = ${fmt(Math.abs(L),4)} J`,cx+38,h/2-14,'#3ecf8e',12);
        text(ctx,data[si].s[3],Math.min(w-10,cx+130),h/2+5,'#ececef',14,w<560?'right':'left'); if(warn) text(ctx,'⚠ '+warn,w-10,h-52,'#ffb547',12,'right');
        const eta=L/Qin; api.set('eta',p.rev?'—':fmt(eta*100,4)+' %'); api.set('th',p.rev?'—':`${tlabel} = ${fmt(theory*100,4)} %`);
        api.set('Qin',fmtU(Qin,'J',4)); api.set('Qout',fmtU(Qout,'J',4)); api.set('L',fmtU(L,'J',4));
        api.set('cop',p.rev?`${fmt(Qin/Math.abs(L),4)}`+(copT?`（卡诺理论 ${fmt(copT,4)}）`:''):'—'); api.set('chk',Math.abs(dU)<1e-6*Qin?'<span class="ok">✓ ΔU = 0</span>':fmt(dU));
        let rows=data.map((d,i)=>`<tr><td style="color:${cols[i]}">${d.s[3]}</td><td>${fmt(d.e.Q,4)}</td><td>${fmt(d.e.L,4)}</td><td>${fmt(d.e.dU,4)}</td><td>${fmt(d.e.dS,4)}</td><td>${fmt(d.e.T1,4)} → ${fmt(d.e.T2,4)}</td></tr>`).join('');
        rows+=`<tr><td><b>合计 ∮</b></td><td>${fmt(Qin+Qout,4)}</td><td>${fmt(L,4)}</td><td>${fmt(Math.abs(dU)<1e-6?0:dU,4)}</td><td>${(()=>{const z=data.reduce((a,d)=>a+d.e.dS,0);return fmt(Math.abs(z)<1e-9?0:z,3);})()}</td><td></td></tr>`;
        const html=`<table class="tbl"><tr><th>过程</th><th>Q (J)</th><th>L (J)</th><th>ΔU (J)</th><th>ΔS (J/K)</th><th>T (K)</th></tr>${rows}</table><p style="font-size:12.5px;color:#8b8b94">n = 1 mol。工作物质的熵变 ∮dS = 0（S 是状态函数）。</p>`;
        if(tb._h!==html){tb.innerHTML=html;tb._h=html;}
      }});
    api.onChange(k=>{u=0; if(k==='cy') thS.set(p.cy==='carnot'?600:1800); });
  }
});

/* ===== 19. Secondo principio / entropia ===== */
function lnC(N,k){ let s=0; for(let i=1;i<=k;i++) s+=Math.log((N-k+i)/i); return s; }
Lab.register({
  id:'entropia', group:'thermo', title:'第二定律与熵', it:'Secondo principio, entropia, espansione libera',
  intro:'移除隔板后气体自由膨胀 (espansione libera)：这是不可逆过程，熵增加 ΔS = Nk ln2。下方：两物体热接触，总熵必然增加。',
  explain:`<p><b>第二定律 (secondo principio)</b>：<em>开尔文–普朗克</em>表述——不可能从单一热源吸热全部变成功；<em>克劳修斯</em>表述——热量不能自发地从低温物体流向高温物体。</p>
  <p><b>熵 (entropia)</b> dS = δQ<sub>rev</sub>/T，是状态函数。孤立系统中 ΔS ≥ 0，等号仅对可逆过程成立（<b>熵增原理</b>）。计算不可逆过程的 ΔS 时，要设想一条连接相同初末状态的可逆路径（如自由膨胀 → 等温可逆膨胀）。</p>
  <p><b>统计解释 (Boltzmann)</b>：S = k ln Ω。粒子"回到"同一半边的概率是 (1/2)<sup>N</sup>，对宏观 N 实际上为零——这就是不可逆性的来源。</p>`,
  formulas:[fm(`dS = ${fr('δQ<sub>rev</sub>','T')}, &nbsp; ΔS<sub>univ</sub> ≥ 0`),fm(`ΔS<sub>esp. libera</sub> = nR ln${fr('V<sub>f</sub>','V<sub>i</sub>')} = Nk ln2`,'自由膨胀（体积加倍）'),fm(`ΔS = mc ln${fr('T<sub>f</sub>','T<sub>i</sub>')}`,'加热固体/液体'),fm(`ΔS = nc<sub>V</sub> ln${fr('T<sub>2</sub>','T<sub>1</sub>')} + nR ln${fr('V<sub>2</sub>','V<sub>1</sub>')}`,'理想气体任意过程'),fm(`ΔS = ${fr('mL','T')}`,'相变'),fm(`S = k ln Ω, &nbsp; Ω = ${fr('N!','n<sub>L</sub>! (N − n<sub>L</sub>)!')}`,'玻尔兹曼熵')],
  setup(api){
    const p=api.p;
    api.slider('N','粒子数 N',4,400,2,100);
    api.slider('m1','物体 1 质量（水）',0.1,5,0.1,1,'kg'); api.slider('T1','物体 1 温度',273,373,1,353,'K');
    api.slider('m2','物体 2 质量（水）',0.1,5,0.1,1,'kg'); api.slider('T2','物体 2 温度',273,373,1,293,'K');
    let wall=true; const wb=api.button('移除隔板 rimuovi setto',()=>{ wall=!wall; wb.innerHTML=wall?'移除隔板 rimuovi setto':'插回隔板 reinserisci'; });
    ['nl','S','Smax','dS','pr'].forEach((k,i)=>api.readout(k,['左侧粒子数 n_L','统计熵 S/k = ln Ω','最大值 ln Ω_max','热力学 ΔS = Nk ln2','全部回到左侧的概率'][i]));
    api.sep(); ['Tf','d1','d2','dt'].forEach((k,i)=>api.readout(k,['热接触 T_f','ΔS₁（热物体）','ΔS₂（冷物体）','ΔS_tot'][i]));
    const cv=api.canvas(0.45,340), g1=api.graph(0.6,250), g2=api.graph(0.6,250); let P,t,hist;
    api.anim({reset(){ P=[]; for(let i=0;i<p.N;i++){ const a=Math.random()*TAU, v=0.25+0.15*Math.abs(Math.random()+Math.random()-1); P.push({x:0.02+Math.random()*0.46,y:0.02+Math.random()*0.96,vx:v*Math.cos(a),vy:v*Math.sin(a)}); } t=0; hist=[]; wall=true; wb.innerHTML='移除隔板 rimuovi setto'; },
      step(dt){ for(const q of P){ const ox=q.x; q.x+=q.vx*dt; q.y+=q.vy*dt; if(q.x<0.01){q.x=0.02-q.x;q.vx=-q.vx;} if(q.x>0.99){q.x=1.98-q.x;q.vx=-q.vx;} if(q.y<0.01){q.y=0.02-q.y;q.vy=-q.vy;} if(q.y>0.99){q.y=1.98-q.y;q.vy=-q.vy;}
          if(wall){ if(ox<0.5&&q.x>=0.5){q.x=1-q.x;q.vx=-q.vx;} else if(ox>0.5&&q.x<=0.5){q.x=1-q.x;q.vx=-q.vx;} } }
        t+=dt; const nl=P.filter(q=>q.x<0.5).length; hist.push([t,nl/P.length,lnC(P.length,nl)]); if(hist.length>1800) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const bw=Math.min(w-20,(h-20)*2), bh=bw/2, ox=(w-bw)/2, oy=(h-bh)/2;
        ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=2; ctx.strokeRect(ox,oy,bw,bh); if(wall){ ctx.fillStyle='#ffb547'; ctx.fillRect(ox+bw/2-3,oy,6,bh); } else line(ctx,ox+bw/2,oy,ox+bw/2,oy+bh,'#ffffff22',1,[4,4]);
        for(const q of P) circle(ctx,ox+q.x*bw,oy+q.y*bh,3,q.x<0.5?'#4f9dff':'#ff6b6b');
        const N=P.length, nl=P.filter(q=>q.x<0.5).length;
        text(ctx,`左 ${nl}`,ox+8,oy+18,'#4f9dff',13); text(ctx,`右 ${N-nl}`,ox+bw-8,oy+18,'#ff6b6b',13,'right');
        g1.draw({xlabel:'t (s)',ylabel:'n_L / N',title:'左侧粒子比例',yr:[0,1.05],series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff'},{pts:hist.length?[[hist[0][0],0.5],[hist[hist.length-1][0],0.5]]:[],color:'#ffffff40',dash:[4,4],width:1}]});
        const Smax=lnC(N,Math.floor(N/2));
        g2.draw({xlabel:'t (s)',ylabel:'S/k',title:'统计熵 S/k = ln Ω（虚线 = N ln2）',y0:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#3ecf8e'},{pts:hist.length?[[hist[0][0],N*Math.LN2],[hist[hist.length-1][0],N*Math.LN2]]:[],color:'#ffb54788',dash:[4,4],width:1}]});
        api.set('nl',`${nl} / ${N}`); api.set('S',fmt(lnC(N,nl),4)); api.set('Smax',fmt(Smax,4)+` (N ln2 = ${fmt(N*Math.LN2,4)})`); api.set('dS',fmtU(N*K_B*Math.LN2,'J/K')); api.set('pr','(1/2)<sup>N</sup> = '+fmt(Math.pow(0.5,N),3));
        const c=4186, Tf=(p.m1*p.T1+p.m2*p.T2)/(p.m1+p.m2), d1=p.m1*c*Math.log(Tf/p.T1), d2=p.m2*c*Math.log(Tf/p.T2);
        api.set('Tf',fmtU(Tf,'K',5)); api.set('d1',fmtU(d1,'J/K',4)); api.set('d2',fmtU(d2,'J/K',4)); api.set('dt','<span class="ok">'+fmtU(d1+d2,'J/K',4)+(d1+d2>1e-9?' > 0':' = 0')+'</span>');
      }});
    api.onChange(k=>{ if(k==='N'){ api.A.reset(); api.play(); } });
  }
});

/* ===== 20. Conduzione ===== */
Lab.register({
  id:'conduzione', group:'thermo', title:'热传导', it:'Trasmissione del calore — conduzione (legge di Fourier)',
  intro:'棒的一端突然接触高温热源：温度分布随时间演化，最终达到线性的稳态分布，热流 P = kAΔT/L。',
  explain:`<p>热传递的三种方式：<b>传导 (conduzione)</b>、<b>对流 (convezione)</b>、<b>辐射 (irraggiamento)</b>。</p>
  <p><b>傅里叶定律 (legge di Fourier)</b>：热流功率与温度梯度成正比，P = −kA dT/dx，k 是<b>热导率 (conducibilità termica)</b>。稳态时温度沿棒线性分布。热阻 R = L/(kA)，串联时相加（类似电阻）。</p>
  <p>暂态过程由热扩散方程描述，特征时间 τ ≈ L²/α，α = k/(ρc) 为<b>热扩散率 (diffusività termica)</b>：铜棒几分钟就达到稳态，木棒需要数天！模拟时间自动加速（以 τ 为尺度）。</p>`,
  formulas:[fm(`P = ${fr('Q','t')} = kA${fr('T<sub>h</sub> − T<sub>c</sub>','L')}`,'稳态 Fourier 定律'),fm(`R<sub>th</sub> = ${fr('L','kA')}, &nbsp; R<sub>serie</sub> = R<sub>1</sub> + R<sub>2</sub>`,'热阻'),fm(`${fr('∂T','∂t')} = α${fr('∂<sup>2</sup>T','∂x<sup>2</sup>')}, &nbsp; α = ${fr('k','ρc')}`,'热扩散方程'),fm(`P = hA(T − T<sub>amb</sub>)`,'对流（牛顿冷却定律）'),fm(`P = eσAT<sup>4</sup>`,'辐射（斯特藩–玻尔兹曼）σ = 5.67×10⁻⁸ W/(m²K⁴)')],
  setup(api){
    const p=api.p, M={rame:[401,8960,385,'铜 rame'],alluminio:[237,2700,897,'铝 alluminio'],acciaio:[50,7850,490,'钢 acciaio'],vetro:[0.8,2500,840,'玻璃 vetro'],mattone:[0.7,1800,840,'砖 mattone'],legno:[0.12,600,1700,'木 legno']};
    api.select('mat','材料 · materiale',Object.entries(M).map(([k,v])=>[k,`${v[3]} (k = ${v[0]})`]),'rame');
    api.slider('L','长度 L',0.05,2,0.05,0.5,'m'); api.slider('A','截面积 A',0.5,20,0.5,4,'cm²');
    api.slider('Th','高温端 T_h',0,500,5,100,'°C'); api.slider('Tc','低温端 T_c（及初温）',-50,100,5,20,'°C');
    ['P','R','alpha','tau','t','Pin','Pout'].forEach((k,i)=>api.readout(k,['稳态热流 P','热阻 R_th','热扩散率 α','特征时间 τ = L²/α','模拟时间 t','当前流入热流（热端）','当前流出热流（冷端）'][i]));
    const cv=api.canvas(0.32,220), g1=api.graph(0.45,280); const NX=60; let T,t;
    api.anim({reset(){ T=new Array(NX).fill(p.Tc); T[0]=p.Th; t=0; }, speeds:[0.25,0.5,1,2,4],
      step(dt){ const [k,rho,c]=M[p.mat], al=k/(rho*c), dx=p.L/(NX-1), tau=p.L*p.L/al, simDt=dt*tau/8, hmax=0.4*dx*dx/al, n=Math.ceil(simDt/hmax), h=simDt/n;
        for(let s=0;s<n;s++){ const Tn=T.slice(); for(let i=1;i<NX-1;i++) Tn[i]=T[i]+al*h/(dx*dx)*(T[i+1]-2*T[i]+T[i-1]); Tn[0]=p.Th; Tn[NX-1]=p.Tc; T=Tn; } t+=simDt; },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const [k,rho,c]=M[p.mat], al=k/(rho*c), A=p.A*1e-4, dx=p.L/(NX-1), lo=Math.min(p.Tc,p.Th), hi=Math.max(p.Tc,p.Th);
        const x0=70, x1=w-70, y=h/2, rh=Math.min(60,10+p.A*3);
        ctx.fillStyle='#7a2a2a'; ctx.fillRect(10,y-50,56,100); text(ctx,p.Th+' °C',38,y+4,'#fff',13,'center'); ctx.fillStyle='#1f3f73'; ctx.fillRect(w-66,y-50,56,100); text(ctx,p.Tc+' °C',w-38,y+4,'#fff',13,'center');
        const cw=(x1-x0)/NX; for(let i=0;i<NX;i++){ ctx.fillStyle=heatColor((T[i]-lo)/Math.max(1e-9,hi-lo)); ctx.fillRect(x0+i*cw,y-rh/2,cw+1,rh); }
        ctx.strokeStyle='#d4d4d8'; ctx.strokeRect(x0,y-rh/2,x1-x0,rh); text(ctx,M[p.mat][3],(x0+x1)/2,y-rh/2-8,'#d4d4d8',13,'center');
        const pts=T.map((v,i)=>[i*dx*100,v]);
        g1.draw({xr:[0,p.L*100],yr:[lo-5,hi+5],xlabel:'x (cm)',ylabel:'T (°C)',title:'温度分布 T(x)（虚线 = 稳态）',series:[{pts:[[0,p.Th],[p.L*100,p.Tc]],color:'#ffffff55',dash:[5,4],width:1},{pts,color:'#ff6b6b',width:2.5}]});
        const Pss=k*A*(p.Th-p.Tc)/p.L; api.set('P',fmtU(Pss,'W')); api.set('R',fmtU(p.L/(k*A),'K/W')); api.set('alpha',fmtU(al,'m²/s')); api.set('tau',fmtTime(p.L*p.L/al)); api.set('t',fmtTime(t));
        api.set('Pin',fmtU(-k*A*(T[1]-T[0])/dx,'W')); api.set('Pout',fmtU(-k*A*(T[NX-1]-T[NX-2])/dx,'W'));
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

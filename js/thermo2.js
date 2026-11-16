'use strict';
const SIGMA=5.670374e-8;
/* ===== Dilatazione termica ===== */
Lab.register({
  id:'dilatazione', group:'thermo', title:'热膨胀', it:'Dilatazione termica — lineare, superficiale, volumica',
  intro:'温度升高时固体伸长、液体体积增大。图中伸长量按放大倍数显示；夹紧的杆不能伸长，会产生很大的热应力。',
  explain:`<p><b>线膨胀 (dilatazione lineare)</b>：ΔL = αL₀ΔT，α 为线膨胀系数 (coefficiente di dilatazione lineare)，单位 K⁻¹。面膨胀系数 ≈ 2α，<b>体膨胀 (dilatazione volumica)</b> 系数 β ≈ 3α。</p>
  <p>若杆两端被固定，无法伸长，就会产生<b>热应力 (sforzo termico)</b> σ = EαΔT（E 为杨氏模量 modulo di Young）——铁轨、桥梁要留伸缩缝的原因。殷钢 (Invar) 的 α 极小，用于精密仪器。</p>
  <p><b>水的反常膨胀 (anomalia dell'acqua)</b>：0–4 °C 之间水受热反而收缩，4 °C 时密度最大，所以湖泊从表面开始结冰。</p>`,
  formulas:[fm(`ΔL = αL<sub>0</sub>ΔT`,'线膨胀'),fm(`ΔA ≈ 2αA<sub>0</sub>ΔT, &nbsp; ΔV = βV<sub>0</sub>ΔT, &nbsp; β ≈ 3α`),fm(`σ = E α ΔT`,'夹紧时的热应力')],
  setup(api){
    const p=api.p, M={acciaio:[12e-6,200e9,'钢 acciaio'],alluminio:[23e-6,70e9,'铝 alluminio'],rame:[17e-6,117e9,'铜 rame'],vetro:[9e-6,70e9,'普通玻璃 vetro'],pyrex:[3.3e-6,64e9,'耐热玻璃 Pyrex'],cemento:[12e-6,30e9,'混凝土 calcestruzzo'],invar:[1.2e-6,140e9,'殷钢 Invar']};
    api.select('mat','材料 · materiale',Object.entries(M).map(([k,v])=>[k,`${v[2]} (α = ${v[0]*1e6}×10⁻⁶ K⁻¹)`]),'acciaio');
    api.slider('L0','初始长度 L₀（20 °C）',0.1,100,0.1,10,'m'); api.slider('T','温度 T',-50,500,1,120,'°C');
    api.slider('V0','立方体初体积 V₀',0.001,1,0.001,0.001,'m³');
    ['dT','dL','L','dA','dV','sig','zoom'].forEach((k,i)=>api.readout(k,['ΔT = T − 20 °C','ΔL = αL₀ΔT','L = L₀ + ΔL','面积相对变化 2αΔT','体积变化 ΔV = 3αV₀ΔT','夹紧热应力 σ = EαΔT','图中放大倍数'][i]));
    const cv=api.canvas(0.36,240), g1=api.graph(0.5,260); let Tc;
    api.anim({reset(){Tc=20;}, step(dt){ Tc+= (p.T-Tc)*Math.min(1,dt*1.5); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const [a,E]=M[p.mat], dT=Tc-20, dL=a*p.L0*dT, x0=30, Lp=(w-90)*0.8, zoom=Math.min(2000, (w-90)*0.18/Math.max(1e-9,Math.abs(a*p.L0*530))*(p.L0)/p.L0);
        const z=Math.round((w-90)*0.15/(a*530)/ (1)/Lp*1)||1; const Z=Math.max(1,Math.round(0.15/(a*530)));
        const y=h*0.45, ext=Lp*a*dT*Z;
        ctx.strokeStyle='#ffffff55'; ctx.setLineDash([4,4]); ctx.strokeRect(x0,y-14,Lp,28); ctx.setLineDash([]);
        ctx.fillStyle=heatColor((Tc+50)/550); ctx.fillRect(x0,y-12,Lp+ext,24);
        line(ctx,x0+Lp,y-30,x0+Lp,y+30,'#ffffff80',1,[3,3]); text(ctx,'L₀',x0+Lp,y-34,'#9b9ba4',12,'center');
        if(Math.abs(ext)>2){ arrow(ctx,x0+Lp,y+38,x0+Lp+ext,y+38,'#ffb547','ΔL'); }
        text(ctx,`T = ${fmt(Tc,3)} °C`,x0,24,'#ececef',14); text(ctx,`伸长量放大 ×${Z}`,w-12,24,'#ffb547',12,'right');
        const pts=[], mats=Object.entries(M); const cols=['#4f9dff','#3ecf8e','#ffb547','#c792ea','#ff6b6b','#9b9ba4','#ffffff'];
        g1.draw({xr:[-50,500],xlabel:'T (°C)',ylabel:'ΔL (mm)',title:`ΔL(T)，L₀ = ${fmt(p.L0)} m`,legend:false,series:mats.map(([k,v],i)=>({pts:[[-50,v[0]*p.L0*(-70)*1000],[500,v[0]*p.L0*480*1000]],color:cols[i],width:k===p.mat?3:1,dash:k===p.mat?[]:[4,4]})),marks:[{x:Tc,y:a*p.L0*dT*1000,color:'#fff'}]});
        api.set('dT',fmtU(dT,'K',4)); api.set('dL',fmtU(dL*1000,'mm',4)); api.set('L',fmtU(p.L0+dL,'m',7)); api.set('dA',fmt(2*a*dT*100,4)+' %'); api.set('dV',fmtU(3*a*p.V0*dT*1e6,'cm³',4));
        api.set('sig',fmtU(E*a*dT/1e6,'MPa',4)); api.set('zoom','×'+Z);
      }});
    api.onChange(k=>{ if(k!=='T'){ api.A.reset(); } api.play(); });
  }
});

/* ===== Gas reale: van der Waals ===== */
Lab.register({
  id:'vanderwaals', group:'thermo', title:'实际气体：范德瓦尔斯方程', it:'Gas reali — equazione di van der Waals, punto critico',
  intro:'1 mol 实际气体的等温线。T < T_c 时出现"S 形"区域（虚线阴影 = 不稳定，dP/dV > 0），用麦克斯韦等面积作图得到液–气共存的水平线。',
  explain:`<p><b>范德瓦尔斯方程 (equazione di van der Waals)</b> 修正了理想气体的两个假设：分子本身有体积（b，"协体积 covolume"），分子间有吸引力（a，使压强降低）。</p>
  <p>高温时等温线接近理想气体双曲线。在<b>临界温度 (temperatura critica)</b> T<sub>c</sub> = 8a/(27Rb) 时等温线出现拐点——<b>临界点 (punto critico)</b>。T &lt; T<sub>c</sub> 时 dP/dV &gt; 0 的部分物理上不稳定，实际发生<b>液化 (liquefazione)</b>：沿水平线 P = P<sub>sat</sub> 液气共存，P<sub>sat</sub> 由等面积法则 (costruzione di Maxwell) 确定。</p>
  <p>T &gt; T<sub>c</sub> 时无论压强多大都不能把气体液化（"气体" vs "蒸气 vapore"）。</p>`,
  formulas:[fm(`(P + ${fr('a n<sup>2</sup>','V<sup>2</sup>')})(V − nb) = nRT`),fm(`T<sub>c</sub> = ${fr('8a','27Rb')}, &nbsp; P<sub>c</sub> = ${fr('a','27b<sup>2</sup>')}, &nbsp; V<sub>c</sub> = 3nb`,'临界点'),fm(`Z<sub>c</sub> = ${fr('P<sub>c</sub>V<sub>c</sub>','RT<sub>c</sub>')} = ${fr(3,8)}`),fm(`Z = ${fr('PV','nRT')}`,'压缩因子（理想气体 = 1）')],
  setup(api){
    const p=api.p, G={CO2:[0.3640,4.267e-5,'CO₂'],N2:[0.1370,3.87e-5,'N₂'],H2O:[0.5536,3.049e-5,'H₂O'],O2:[0.1382,3.186e-5,'O₂'],He:[0.00346,2.38e-5,'He']};
    api.select('gas','气体 · gas（a [Pa·m⁶/mol²], b [m³/mol]）',Object.entries(G).map(([k,v])=>[k,`${v[2]} (a = ${v[0]}, b = ${v[1].toExponential(3)})`]),'CO2');
    api.slider('tr','温度 T / T_c',0.8,1.6,0.01,0.9); api.slider('vr','标记体积 V / V_c',0.5,8,0.05,3);
    api.checkbox('max','麦克斯韦等面积线 (costruzione di Maxwell)',true);
    ['T','Tc','Pc','Vc','P','Pi','Z','Ps'].forEach((k,i)=>api.readout(k,['温度 T','临界温度 T_c','临界压强 P_c','临界摩尔体积 V_c','P_vdW（标记点）','P_ideale（标记点）','压缩因子 Z = PV/RT','饱和蒸气压 P_sat'][i]));
    const g1=api.graph(0.62,420);
    const P=(V,T,a,b)=>R_GAS*T/(V-b)-a/(V*V);
    function maxwell(T,a,b){ const Vc=3*b; let vs=[]; for(let V=1.05*b;V<40*Vc;V*=1.002) vs.push(V); let mins=[],maxs=[];
      for(let i=1;i<vs.length-1;i++){ const p0=P(vs[i-1],T,a,b),p1=P(vs[i],T,a,b),p2=P(vs[i+1],T,a,b); if(p1<p0&&p1<p2) mins.push(p1); if(p1>p0&&p1>p2) maxs.push(p1); }
      if(!mins.length||!maxs.length) return null; let lo=Math.max(mins[0],1), hi=maxs[0];
      const roots=Ps=>{ const r=[]; for(let i=1;i<vs.length;i++){ const f0=P(vs[i-1],T,a,b)-Ps,f1=P(vs[i],T,a,b)-Ps; if(f0===0||Math.sign(f0)!==Math.sign(f1)) r.push(vs[i-1]-f0*(vs[i]-vs[i-1])/(f1-f0)); } return r; };
      const intg=(V1,V3)=>R_GAS*T*Math.log((V3-b)/(V1-b))+a*(1/V3-1/V1);
      for(let it=0;it<60;it++){ const mid=(lo+hi)/2, r=roots(mid); if(r.length<3) { hi=mid; continue; } const g=intg(r[0],r[r.length-1])-mid*(r[r.length-1]-r[0]); if(g>0) lo=mid; else hi=mid; }
      const Ps=(lo+hi)/2, r=roots(Ps); return r.length>=3?{Ps,V1:r[0],V3:r[r.length-1]}:null; }
    api.anim({static:true, reset(){}, draw(){
      const [a,b,nm]=G[p.gas], Tc=8*a/(27*R_GAS*b), Pc=a/(27*b*b), Vc=3*b, T=p.tr*Tc, toL=1000, toBar=1e-5;
      const Vmin=1.25*b, Vmax=8.5*Vc, ser=[];
      for(const f of [0.85,0.95,1.0,1.1,1.25,1.5]){ const pts=[]; for(let V=Vmin;V<=Vmax;V*=1.01) pts.push([V*toL,P(V,f*Tc,a,b)*toBar]); ser.push({pts,color:f===1?'#ffffff99':'#ffffff22',width:f===1?1.5:1,dash:f===1?[6,4]:[]}); }
      const main=[], unst=[], ideal=[]; for(let V=Vmin;V<=Vmax;V*=1.005){ const pv=P(V,T,a,b); main.push([V*toL,pv*toBar]); ideal.push([V*toL,R_GAS*T/V*toBar]); const d=P(V*1.001,T,a,b)-pv; if(d>0) unst.push([V*toL,pv*toBar]); }
      ser.push({pts:ideal,color:'#3ecf8e',dash:[4,4],width:1.5,label:'理想气体'});
      if(unst.length>1) ser.push({pts:unst,color:'#ff6b6b',width:4,label:'不稳定'});
      ser.push({pts:main,color:'#4f9dff',width:2.5,label:`vdW, T = ${fmt(T,4)} K`});
      let mx=null; if(p.tr<1&&p.max){ mx=maxwell(T,a,b); if(mx) ser.push({pts:[[mx.V1*toL,mx.Ps*toBar],[mx.V3*toL,mx.Ps*toBar]],color:'#ffb547',width:2.5,label:'P_sat'}); }
      const Vm=p.vr*Vc, Pm=P(Vm,T,a,b);
      g1.draw({xr:[Vmin*toL,Vmax*toL],yr:[0,Pc*2.2*toBar],xlabel:'V (L/mol)',ylabel:'P (bar)',title:`${nm} 等温线（白虚线 = 临界等温线 T_c）`,legend:true,series:ser,marks:[{x:Vc*toL,y:Pc*toBar,color:'#fff',label:'C',r:5},{x:Vm*toL,y:clamp(Pm*toBar,0,Pc*2.2*toBar),color:'#ffb547',r:5}]});
      api.set('T',fmtU(T,'K',4)); api.set('Tc',fmtU(Tc,'K',4)); api.set('Pc',fmtU(Pc*toBar,'bar',4)); api.set('Vc',fmtU(Vc*toL,'L/mol',4));
      api.set('P',fmtU(Pm*toBar,'bar',4)); api.set('Pi',fmtU(R_GAS*T/Vm*toBar,'bar',4)); api.set('Z',fmt(Pm*Vm/(R_GAS*T),4)); api.set('Ps',p.tr>=1?'T ≥ T_c：无液化':(mx?fmtU(mx.Ps*toBar,'bar',4):'—'));
    }});
    api.onChange(()=>{});
  }
});

/* ===== Convezione e irraggiamento ===== */
Lab.register({
  id:'irraggiamento', group:'thermo', title:'对流与热辐射', it:'Convezione e irraggiamento — legge di Stefan-Boltzmann, legge di Wien',
  intro:'热金属球在空气中冷却：对流 P = hAΔT 与辐射 P = eσA(T⁴ − T_amb⁴) 同时作用。高温时辐射占主导。右图为黑体辐射谱（普朗克定律）。',
  explain:`<p><b>对流 (convezione)</b>：流体流动带走热量，牛顿冷却定律 P = hA(T − T<sub>amb</sub>)，h 为对流换热系数（静止空气约 5–25，强迫通风 25–250 W/(m²·K)）。只有对流时温差按指数衰减，τ = mc/(hA)。</p>
  <p><b>热辐射 (irraggiamento)</b>：任何物体都发射电磁波，<b>斯特藩–玻尔兹曼定律 (legge di Stefan-Boltzmann)</b> P = eσAT⁴（e 为发射率 emissività，黑体 e = 1）。净辐射功率 eσA(T⁴ − T<sub>amb</sub>⁴)。不需要介质，可在真空中传播（太阳）。</p>
  <p><b>维恩位移定律 (legge di Wien)</b>：λ<sub>max</sub>T = 2.898×10⁻³ m·K。约 800 K 以上物体开始发出可见的暗红光。</p>`,
  formulas:[fm(`P<sub>conv</sub> = hA(T − T<sub>amb</sub>)`,'牛顿冷却定律'),fm(`P<sub>irr</sub> = eσA(T<sup>4</sup> − T<sub>amb</sub><sup>4</sup>), &nbsp; σ = 5.67×10<sup>−8</sup> W/(m²K⁴)`,'Stefan-Boltzmann'),fm(`λ<sub>max</sub> = ${fr('2.898×10<sup>−3</sup> m·K','T')}`,'Wien'),fm(`mc${fr('dT','dt')} = −P<sub>conv</sub> − P<sub>irr</sub>`,'冷却方程'),fm(`T − T<sub>amb</sub> = ΔT<sub>0</sub> e<sup>−t/τ</sup>, &nbsp; τ = ${fr('mc','hA')}`,'仅对流时')],
  setup(api){
    const p=api.p, M={rame:[8960,385,'铜 rame'],alluminio:[2700,897,'铝 alluminio'],ferro:[7870,449,'铁 ferro'],acqua:[1000,4186,'水 acqua']};
    api.select('mat','材料 · materiale',Object.entries(M).map(([k,v])=>[k,v[2]]),'ferro');
    api.slider('r','球半径 r',1,20,0.5,5,'cm'); api.slider('T0','初温 T₀',50,1500,10,800,'°C'); api.slider('Ta','环境温度 T_amb',-20,50,1,20,'°C');
    api.slider('h','对流系数 h',0,100,1,15,'W/(m²·K)'); api.slider('e','发射率 e <i>(emissività)</i>',0,1,0.01,0.8);
    ['T','Pc','Pr','fr','lam','tau','t'].forEach((k,i)=>api.readout(k,['温度 T','对流功率 P_conv','辐射功率 P_irr（净）','辐射占比','维恩峰值 λ_max','对流时间常数 τ = mc/(hA)','模拟时间 t'][i]));
    const cv=api.canvas(0.3,200), g1=api.graph(0.6,260), g2=api.graph(0.6,260); let T,t,hist,spd;
    const geo=()=>{ const r=p.r/100, A=4*Math.PI*r*r, V=4/3*Math.PI*r**3, [rho,c]=M[p.mat]; return {A,m:rho*V,c}; };
    api.anim({reset(){ T=p.T0+273.15; t=0; hist=[]; const g=geo(), Ta=p.Ta+273.15; const G=g.A*(p.h+4*p.e*SIGMA*((T+Ta)/2)**3); spd=g.m*g.c/Math.max(G,1e-6)*4/20; }, speeds:[0.5,1,2,4],
      step(dt){ const g=geo(), Ta=p.Ta+273.15; let rem=dt*spd; const hmax=0.02*g.m*g.c/(g.A*(p.h+4*p.e*SIGMA*T**3)+1e-9); while(rem>0){ const hh=Math.min(rem,hmax); const P=p.h*g.A*(T-Ta)+p.e*SIGMA*g.A*(T**4-Ta**4); T-=P/(g.m*g.c)*hh; rem-=hh; t+=hh; }
        hist.push([t,T-273.15]); if(hist.length>2000) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const g=geo(), Ta=p.Ta+273.15, Pc=p.h*g.A*(T-Ta), Pr=p.e*SIGMA*g.A*(T**4-Ta**4);
        const glow=clamp((T-800)/1200,0,1); const R=Math.min(h*0.35,30+p.r*2), cx=w*0.22, cy=h/2;
        if(glow>0){ const gr=ctx.createRadialGradient(cx,cy,R,cx,cy,R*2.2); gr.addColorStop(0,`rgba(255,${120+80*glow},60,${0.5*glow})`); gr.addColorStop(1,'rgba(255,120,60,0)'); ctx.fillStyle=gr; ctx.fillRect(cx-R*2.3,cy-R*2.3,R*4.6,R*4.6); }
        circle(ctx,cx,cy,R,glow>0?`rgb(${150+105*glow},${60+120*glow*glow},${40+40*glow})`:'#7d8597','#fff',1);
        for(let i=0;i<5;i++){ const ph=(performance.now()/1500+i/5)%1; ctx.strokeStyle=`rgba(200,220,255,${0.4*(1-ph)*Math.min(1,p.h/20)})`; ctx.beginPath(); ctx.moveTo(cx-R*0.6+i*R*0.3,cy-R-ph*50); ctx.quadraticCurveTo(cx-R*0.6+i*R*0.3+8,cy-R-ph*50-10,cx-R*0.6+i*R*0.3,cy-R-ph*50-20); ctx.stroke(); }
        for(let i=0;i<8;i++){ const a=i*TAU/8, l=R*0.3+40*Math.min(1,Pr/(Pc+Pr+1e-9)); arrow(ctx,cx+Math.cos(a)*(R+6),cy+Math.sin(a)*(R+6),cx+Math.cos(a)*(R+6+l),cy+Math.sin(a)*(R+6+l),'#ff6b6b99','',1.5); }
        const bx=w*0.5, bw=w*0.45, tot=Pc+Pr||1; ctx.fillStyle='#4f9dff'; ctx.fillRect(bx,h*0.35,bw*Math.max(0,Pc)/Math.max(tot,1e-9),18); ctx.fillStyle='#ff6b6b'; ctx.fillRect(bx+bw*Math.max(0,Pc)/Math.max(tot,1e-9),h*0.35,bw*Math.max(0,Pr)/Math.max(tot,1e-9),18);
        text(ctx,'对流 convezione',bx,h*0.35-6,'#4f9dff',12); text(ctx,'辐射 irraggiamento',bx+bw,h*0.35-6,'#ff6b6b',12,'right');
        text(ctx,`T = ${fmt(T-273.15,4)} °C`,bx,h*0.75,'#fff',16);
        // Newton-only comparison
        const tau=g.m*g.c/(p.h*g.A||1e-9), nw=hist.map(q=>[q[0],p.Ta+(p.T0-p.Ta)*Math.exp(-q[0]/tau)]);
        g1.draw({xlabel:'t (s)',ylabel:'T (°C)',title:'冷却曲线（虚线 = 仅对流的指数衰减）',legend:true,series:[{pts:p.h>0?nw:[],color:'#4f9dff',dash:[5,4],width:1.5,label:'仅对流'},{pts:hist,color:'#ff6b6b',label:'对流+辐射'}]});
        const planck=(l,TT)=>{ const c1=3.7418e-16, c2=1.4388e-2; return c1/(l**5*(Math.exp(c2/(l*TT))-1)); };
        const lm=2.898e-3/T, sp=[], sp2=[]; const lmax=Math.max(4*lm,3e-6); for(let l=lmax/300;l<=lmax;l+=lmax/300){ sp.push([l*1e6,planck(l,T)*1e-6]); sp2.push([l*1e6,planck(l,Ta)*1e-6]); }
        g2.draw({xr:[0,lmax*1e6],xlabel:'λ (μm)',ylabel:'M_λ (W/m²·μm)',title:'黑体谱：当前 T（红）与环境（蓝），彩色带 = 可见光',y0:true,series:[{pts:sp,color:'#ff6b6b',fill:true},{pts:sp2,color:'#4f9dff'}],vlines:[{x:lm*1e6,label:'λ_max'},{x:0.38,color:'#c792ea'},{x:0.75,color:'#ff6b6b88'}]});
        api.set('T',fmtU(T-273.15,'°C',4)+` = ${fmt(T,4)} K`); api.set('Pc',fmtU(Pc,'W',4)); api.set('Pr',fmtU(Pr,'W',4)); api.set('fr',fmt(100*Pr/(Pc+Pr||1),3)+' %'); api.set('lam',fmtU(lm*1e6,'μm',4)); api.set('tau',p.h>0?fmtTime(tau):'∞'); api.set('t',fmtTime(t));
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Disuguaglianza di Clausius ===== */
Lab.register({
  id:'clausius', group:'thermo', title:'克劳修斯不等式', it:'Disuguaglianza di Clausius — reversibilità e impossibilità',
  intro:'工作于两个热源之间的循环机器：调节效率（或制冷系数），看 ΣQ/T 和宇宙熵变的符号——可逆、不可逆还是不可能。',
  explain:`<p><b>克劳修斯不等式 (disuguaglianza di Clausius)</b>：对任意循环 ∮δQ/T ≤ 0，等号仅对可逆循环成立。两热源时：Q<sub>h</sub>/T<sub>h</sub> + Q<sub>c</sub>/T<sub>c</sub> ≤ 0（Q 以工质吸热为正）。</p>
  <p>它等价于<b>宇宙熵增 (aumento dell'entropia dell'universo)</b>：工质循环一周 ΔS = 0，热源熵变 −Q<sub>h</sub>/T<sub>h</sub> − Q<sub>c</sub>/T<sub>c</sub> = −∮δQ/T ≥ 0。</p>
  <p>因此：η &lt; η<sub>Carnot</sub> 的热机可以存在（不可逆，真实机器）；η = η<sub>C</sub> 为理想可逆；η &gt; η<sub>C</sub> <em>违反第二定律</em>（η = 1 即违反开尔文表述）。制冷机同理：COP &gt; COP<sub>C</sub> 不可能，L = 0 的制冷机违反克劳修斯表述。</p>`,
  formulas:[fm(`∮${fr('δQ','T')} ≤ 0`,'Clausius'),fm(`${fr('Q<sub>h</sub>','T<sub>h</sub>')} + ${fr('Q<sub>c</sub>','T<sub>c</sub>')} ≤ 0`,'两热源（吸热为正）'),fm(`ΔS<sub>univ</sub> = −∮${fr('δQ','T')} ≥ 0`),fm(`η ≤ 1 − ${fr('T<sub>c</sub>','T<sub>h</sub>')}, &nbsp; COP ≤ ${fr('T<sub>c</sub>','T<sub>h</sub> − T<sub>c</sub>')}`)],
  setup(api){
    const p=api.p;
    api.select('mode','机器类型 · macchina',[['eng','热机 · motore termico'],['fri','制冷机 · frigorifero']],'eng');
    api.slider('Th','高温热源 T_h',300,1500,10,600,'K'); api.slider('Tc','低温热源 T_c',100,500,5,300,'K');
    api.slider('Q','每循环 |Q_h|（热机）或 |Q_c|（制冷机）',100,5000,50,1000,'J');
    api.slider('eta','效率 η（热机）',0,1,0.005,0.4); api.slider('cop','制冷系数 COP（制冷机）',0.1,10,0.05,0.8);
    ['C','L','Qh','Qc','sum','dS','ver'].forEach((k,i)=>api.readout(k,['卡诺极限','功 |L|','Q_h（工质吸热为正）','Q_c','∮δQ/T = Q_h/T_h + Q_c/T_c','ΔS_univ','结论 verdetto'][i]));
    const cv=api.canvas(0.36,240), g1=api.graph(0.6,260), g2=api.graph(0.6,260);
    const calc=()=>{ const Tc=Math.min(p.Tc,p.Th-10), Th=p.Th;
      if(p.mode==='eng'){ const Qh=p.Q, L=p.eta*Qh, Qc=-(Qh-L); return {Th,Tc,Qh,Qc,L,lim:1-Tc/Th,x:p.eta}; }
      const Qc=p.Q, L=Qc/p.cop, Qh=-(Qc+L); return {Th,Tc,Qh,Qc,L,lim:Tc/(Th-Tc),x:p.cop}; };
    api.anim({static:true, reset(){}, draw(){
      const c=calc(), sum=c.Qh/c.Th+c.Qc/c.Tc, eps=1e-9*p.Q; const ver=sum<-1e-6?'<span class="ok">不可逆，可以实现 (irreversibile)</span>':sum>1e-6?'<span class="bad">不可能！违反第二定律</span>':'<span class="ok">可逆（卡诺）reversibile</span>';
      const {ctx,w,h}=cv; clear(ctx,w,h); const cx=Math.max(w*0.3,140);
      ctx.fillStyle='#7a2a2a'; ctx.fillRect(cx-90,8,180,32); text(ctx,`T_h = ${c.Th} K`,cx,29,'#fff',13,'center'); ctx.fillStyle='#1f3f73'; ctx.fillRect(cx-90,h-40,180,32); text(ctx,`T_c = ${c.Tc} K`,cx,h-19,'#fff',13,'center');
      circle(ctx,cx,h/2,26,'#2e2e34','#d4d4d8',2); text(ctx,p.mode==='eng'?'η':'COP',cx,h/2+5,'#fff',p.mode==='eng'?18:13,'center');
      const sw=v=>clamp(2+12*Math.abs(v)/p.Q,2,16);
      if(p.mode==='eng'){ arrow(ctx,cx,42,cx,h/2-28,'#ff6b6b','',sw(c.Qh)); arrow(ctx,cx,h/2+28,cx,h-42,'#4f9dff','',sw(c.Qc)); if(c.L>0) arrow(ctx,cx+28,h/2,cx+100,h/2,'#3ecf8e','',sw(c.L)); }
      else { arrow(ctx,cx,h/2-28,cx,42,'#ff6b6b','',sw(c.Qh)); arrow(ctx,cx,h-42,cx,h/2+28,'#4f9dff','',sw(c.Qc)); arrow(ctx,cx+100,h/2,cx+28,h/2,'#3ecf8e','',sw(c.L)); }
      text(ctx,`|Q_h| = ${fmt(Math.abs(c.Qh),4)} J`,cx-20,h/2-40,'#ff6b6b',12,'right'); text(ctx,`|Q_c| = ${fmt(Math.abs(c.Qc),4)} J`,cx-20,h/2+48,'#4f9dff',12,'right'); text(ctx,`|L| = ${fmt(c.L,4)} J`,cx+34,h/2-12,'#3ecf8e',12);
      text(ctx,sum>1e-6?'✗ 不可能':sum<-1e-6?'✓ 不可逆':'✓ 可逆',Math.min(w-10,cx+200),h/2+6,sum>1e-6?'#ff6b6b':'#3ecf8e',18,w<520?'right':'left');
      const xs=[], ss=[]; if(p.mode==='eng'){ for(let e=0;e<=1;e+=0.005){ const L=e*p.Q; ss.push([e*100,p.Q/c.Th-(p.Q-L)/c.Tc]); } }
      else { for(let k=0.1;k<=10;k+=0.05){ const L=p.Q/k; ss.push([k,p.Q/c.Tc-(p.Q+L)/c.Th]); } }
      g1.draw({xlabel:p.mode==='eng'?'η (%)':'COP',ylabel:'∮δQ/T (J/K)',title:'∮δQ/T 随 η / COP 变化（> 0 区域不可能）',series:[{pts:ss,color:'#c792ea'}],vlines:[{x:p.mode==='eng'?c.lim*100:c.lim,label:'卡诺',color:'#ffb547'}],marks:[{x:p.mode==='eng'?c.x*100:c.x,y:sum,color:sum>1e-6?'#ff6b6b':'#3ecf8e'}]});
      g2.draw({xr:[0,4],xlabel:'',ylabel:'ΔS (J/K)',title:'熵变：热源 h（红）、热源 c（蓝）、宇宙（绿）',y0:true,series:[{pts:[[0.7,-c.Qh/c.Th]],bars:0.8,color:'#ff6b6b'},{pts:[[2,-c.Qc/c.Tc]],bars:0.8,color:'#4f9dff'},{pts:[[3.3,-sum]],bars:0.8,color:sum>1e-6?'#ff6b6b':'#3ecf8e'}]});
      api.set('C',p.mode==='eng'?'η_C = '+fmt(c.lim*100,4)+' %':'COP_C = '+fmt(c.lim,4)); api.set('L',fmtU(c.L,'J',4)); api.set('Qh',fmtU(c.Qh,'J',4)); api.set('Qc',fmtU(c.Qc,'J',4));
      api.set('sum',fmtU(sum,'J/K',4)); api.set('dS',fmtU(-sum,'J/K',4)); api.set('ver',ver);
    }});
    api.onChange(()=>{});
  }
});

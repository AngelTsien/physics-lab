'use strict';
function rk4(state,deriv,h){ const n=state.length, k1=deriv(state), s2=state.map((v,i)=>v+k1[i]*h/2), k2=deriv(s2), s3=state.map((v,i)=>v+k2[i]*h/2), k3=deriv(s3), s4=state.map((v,i)=>v+k3[i]*h), k4=deriv(s4); return state.map((v,i)=>v+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i])); }
function drawSpring(ctx,x1,y,x2,coils=12,amp=10,color='#d4d4d8'){ ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x1,y); const L=x2-x1, lead=Math.min(12,L*0.1); ctx.lineTo(x1+lead,y); for(let i=0;i<=coils*2;i++){ ctx.lineTo(x1+lead+(L-2*lead)*i/(coils*2), y+(i===0||i===coils*2?0:(i%2?-amp:amp))); } ctx.lineTo(x2,y); ctx.stroke(); ctx.restore(); }

/* ===== 11. Oscillatore armonico ===== */
Lab.register({
  id:'oscillatore', group:'mech', title:'简谐振动：阻尼与受迫振动', it:'Oscillatore armonico — smorzato e forzato, risonanza',
  intro:'弹簧振子 (massa-molla)：回复力 F = −kx。加入阻尼 (smorzamento) 和周期性驱动力 (forzante)，观察共振曲线 (curva di risonanza)。',
  explain:`<p><b>简谐运动 (moto armonico semplice)</b>：x(t) = A cos(ω₀t + φ)，ω₀ = √(k/m) 与振幅无关。能量在弹性势能与动能之间往复转化。</p>
  <p><b>阻尼 (smorzamento)</b>：力 −bv。γ = b/2m。γ &lt; ω₀ 欠阻尼 (sottosmorzato) 振荡衰减；γ = ω₀ 临界阻尼 (critico)；γ &gt; ω₀ 过阻尼 (sovrasmorzato)。</p>
  <p><b>受迫振动 (oscillazioni forzate)</b>：驱动 F₀cos(ωt)。暂态消失后以驱动频率 ω 振动，振幅 A(ω) 在 ω ≈ ω₀ 处出现<b>共振 (risonanza)</b>，阻尼越小峰越尖（品质因数 Q 越大）。</p>`,
  formulas:[fm(`m${fr('d<sup>2</sup>x','dt<sup>2</sup>')} = −kx − b${fr('dx','dt')} + F<sub>0</sub>cos(ωt)`),fm(`ω<sub>0</sub> = ${sq('k/m')}, &nbsp; T = 2π${sq('m/k')}`,'固有角频率 pulsazione propria'),fm(`x(t) = A e<sup>−γt</sup>cos(ω<sub>s</sub>t + φ), &nbsp; ω<sub>s</sub> = ${sq('ω<sub>0</sub><sup>2</sup> − γ<sup>2</sup>')}`,'欠阻尼解'),fm(`A(ω) = ${fr('F<sub>0</sub>/m',sq('(ω<sub>0</sub><sup>2</sup> − ω<sup>2</sup>)<sup>2</sup> + (2γω)<sup>2</sup>'))}`,'稳态振幅'),fm(`E = ${fr(1,2)}kx<sup>2</sup> + ${fr(1,2)}mv<sup>2</sup> = ${fr(1,2)}kA<sup>2</sup>`,'无阻尼时能量守恒'),fm(`Q = ${fr('ω<sub>0</sub>','2γ')}`,'品质因数 fattore di qualità')],
  setup(api){
    const p=api.p;
    api.slider('m','质量 m',0.1,5,0.1,1,'kg'); api.slider('k','劲度系数 k <i>(costante elastica)</i>',1,100,1,20,'N/m');
    api.slider('b','阻尼系数 b <i>(coeff. di smorzamento)</i>',0,10,0.05,0.4,'kg/s');
    api.slider('x0','初始位移 x₀',-0.5,0.5,0.01,0.3,'m');
    api.slider('F0','驱动力幅值 F₀ <i>(forzante)</i>',0,5,0.1,0,'N'); api.slider('wf','驱动角频率 ω',0.1,15,0.05,4.47,'rad/s');
    ['w0','T','reg','Q','A','x','E'].forEach((k,i)=>api.readout(k,['固有角频率 ω₀','周期 T₀','阻尼状态','品质因数 Q','稳态振幅 A(ω)','位移 x','机械能 E'][i]));
    const cv=api.canvas(0.3,200), g1=api.graph(0.55,240), g2=api.graph(0.55,240), g3=api.graph(0.55,240); let S,t,hist;
    api.anim({reset(){S=[p.x0,0];t=0;hist=[];}, speeds:[0.5,1,2,4],
      step(dt){ const n=Math.ceil(dt/0.002), h=dt/n; for(let i=0;i<n;i++){ const tt=t; S=rk4(S,s=>[s[1],(-p.k*s[0]-p.b*s[1]+p.F0*Math.cos(p.wf*(tt)))/p.m],h); t+=h; }
        hist.push([t,S[0],0.5*p.k*S[0]**2,0.5*p.m*S[1]**2]); while(hist.length&&hist[0][0]<t-15) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=(w*0.35)/0.6, cx=w*0.5, y=h*0.55;
        ctx.fillStyle='#4b4b53'; ctx.fillRect(10,y-40,10,70); line(ctx,10,y+30,w-10,y+30,'#4b4b53',2);
        const bx=cx+S[0]*sc; drawSpring(ctx,20,y,bx-25,14,10); ctx.fillStyle='#4f9dff'; ctx.fillRect(bx-25,y-25,50,50);
        line(ctx,cx,y+30,cx,y+40,'#ffb547',2); text(ctx,'x = 0',cx,y+54,'#ffb547',11,'center');
        if(p.F0>0) arrow(ctx,bx,y-35,bx+p.F0*Math.cos(p.wf*t)*14,y-35,'#c792ea','F(t)');
        const w0=Math.sqrt(p.k/p.m), ga=p.b/(2*p.m), Aw=om=>(p.F0/p.m)/Math.sqrt((w0*w0-om*om)**2+(2*ga*om)**2);
        g1.draw({xlabel:'t (s)',ylabel:'x (m)',title:'位移 x(t)',series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff'}]});
        g2.draw({xlabel:'t (s)',ylabel:'E (J)',title:'能量：弹性势能 U 与动能 K',legend:true,y0:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#4f9dff',label:'U'},{pts:hist.map(q=>[q[0],q[3]]),color:'#3ecf8e',label:'K'},{pts:hist.map(q=>[q[0],q[2]+q[3]]),color:'#ffb547',label:'E'}]});
        const F0=p.F0||1, Aw1=om=>(F0/p.m)/Math.sqrt((w0*w0-om*om)**2+(2*ga*om)**2), rc=[]; for(let om=0.05;om<=15;om+=0.03) rc.push([om,Math.min(Aw1(om),5)]);
        g3.draw({xr:[0,15],xlabel:'ω (rad/s)',ylabel:'A (m)',title:'共振曲线 A(ω)'+(p.F0?'':'（以 F₀ = 1 N 绘制）'),y0:true,series:[{pts:rc,color:'#c792ea'}],vlines:[{x:w0,label:'ω₀',color:'#ffb547'}],marks:[{x:p.wf,y:Math.min(Aw1(p.wf),5),color:'#fff'}]});
        api.set('w0',fmtU(w0,'rad/s')); api.set('T',fmtU(TAU/w0,'s')); api.set('reg',ga<w0-1e-9?'欠阻尼 sottosmorzato':(Math.abs(ga-w0)<1e-3?'临界 critico':'过阻尼 sovrasmorzato'));
        api.set('Q',p.b>0?fmt(w0/(2*ga)):'∞'); api.set('A',p.F0?fmtU(Aw(p.wf),'m'):'—（F₀ = 0）'); api.set('x',fmtU(S[0],'m')); api.set('E',fmtU(0.5*p.k*S[0]**2+0.5*p.m*S[1]**2,'J'));
      }});
    api.onChange(k=>{ if(k==='F0'||k==='wf'||k==='b') return; api.A.reset(); api.play(); });
  }
});

/* ===== 11b. Pendolo semplice ===== */
function ellipK(k){ let a=1,b=Math.sqrt(1-k*k); for(let i=0;i<20;i++){const an=(a+b)/2; b=Math.sqrt(a*b); a=an;} return Math.PI/(2*a); }
Lab.register({
  id:'pendolo', group:'mech', title:'单摆', it:'Pendolo semplice',
  intro:'小角度近似 sinθ ≈ θ 时单摆是简谐振动；大角度时周期变长。蓝色 = 精确（非线性）解，虚影 = 小角度近似。',
  explain:`<p>沿切向的回复力 −mg sinθ。<b>小角度近似 (piccole oscillazioni)</b> sinθ ≈ θ 时：θ(t) = θ₀cos(ω₀t)，ω₀ = √(g/L)，周期与振幅、质量无关（<b>等时性 isocronismo</b>）。</p>
  <p>有阻尼 (smorzamento) 时，小角度参考解为 θ₀e<sup>−bt/2</sup>cos(ω<sub>d</sub>t)，ω<sub>d</sub> = √(ω₀² − b²/4)。大摆角时精确周期由椭圆积分给出，比 2π√(L/g) 长：θ₀ = 90° 时约长 18%。把 θ₀ 调大，观察两个摆逐渐失去同步。右侧相图 (spazio delle fasi) 中，无阻尼时轨迹是闭合曲线，有阻尼时盘旋向原点。</p>`,
  formulas:[fm(`${fr('d<sup>2</sup>θ','dt<sup>2</sup>')} = −${fr('g','L')} sinθ`,'运动方程'),fm(`T<sub>0</sub> = 2π${sq('L/g')}`,'小角度周期'),fm(`T = 4${sq('L/g')} K(sin${fr('θ<sub>0</sub>',2)}) ≈ T<sub>0</sub>(1 + ${fr('θ<sub>0</sub><sup>2</sup>',16)} + …)`,'精确周期（K = 第一类完全椭圆积分）'),fm(`v<sub>max</sub> = ${sq('2gL(1 − cosθ<sub>0</sub>)')}`,'最低点速率（能量守恒）')],
  setup(api){
    const p=api.p;
    api.slider('L','摆长 L <i>(lunghezza)</i>',0.2,5,0.05,1.5,'m'); api.slider('th0','初始摆角 θ₀ <i>(ampiezza)</i>',1,170,1,60,'°');
    api.slider('b','阻尼 b <i>(smorzamento)</i>',0,1,0.01,0,'s⁻¹');
    api.select('g','g',[['9.81','地球 9.81'],['1.62','月球 1.62'],['3.71','火星 3.71']],'9.81');
    ['T0','Td','T','ratio','th','vc','vm','vmm'].forEach((k,i)=>api.readout(k,['小角度周期 T₀ = 2π√(L/g)','阻尼周期 T_d = 2π/ω_d','精确周期 T（无阻尼）','T/T₀','当前 θ','当前速率 v = L|ω|','理论 v_max = √(2gL(1−cosθ₀))','实测 v_max（模拟，第一次过最低点）'][i]));
    const cv=api.canvas(0.55,400), g1=api.graph(0.6,250), g2=api.graph(0.6,250); let S,t,hist,vmm;
    api.anim({reset(){S=[p.th0*DEG,0];t=0;hist=[];vmm=0;}, speeds:[0.5,1,2],
      step(dt){ const g=+p.g,n=Math.ceil(dt/0.002),h=dt/n; for(let i=0;i<n;i++){S=rk4(S,s=>[s[1],-g/p.L*Math.sin(s[0])-p.b*s[1]],h); vmm=Math.max(vmm,p.L*Math.abs(S[1]));} t+=dt; const w0=Math.sqrt(g/p.L), wd=Math.sqrt(Math.max(0,w0*w0-p.b*p.b/4)); hist.push([t,S[0]/DEG,p.th0*Math.exp(-p.b*t/2)*Math.cos(wd*t),S[1]]); while(hist[0][0]<t-12) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const g=+p.g, w0=Math.sqrt(g/p.L), sc=Math.min(h*0.42,w*0.4)/p.L, px=w/2, py=h*0.45;
        ctx.fillStyle='#4b4b53'; ctx.fillRect(px-50,py-6,100,6);
        const wd=Math.sqrt(Math.max(0,w0*w0-p.b*p.b/4)), ths=p.th0*DEG*Math.exp(-p.b*t/2)*Math.cos(wd*t);
        line(ctx,px,py,px+Math.sin(ths)*p.L*sc,py+Math.cos(ths)*p.L*sc,'#ffffff33',1.5); circle(ctx,px+Math.sin(ths)*p.L*sc,py+Math.cos(ths)*p.L*sc,12,'#ffffff22','#ffffff55');
        const x=px+Math.sin(S[0])*p.L*sc, y=py+Math.cos(S[0])*p.L*sc; line(ctx,px,py,x,y,'#d4d4d8',2); circle(ctx,x,y,13,'#4f9dff','#fff');
        ctx.strokeStyle='#ffb54766'; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.arc(px,py,p.L*sc,Math.PI/2-p.th0*DEG,Math.PI/2+p.th0*DEG); ctx.stroke(); ctx.setLineDash([]);
        const T0=TAU/w0, T=p.th0<180?4/w0*ellipK(Math.sin(p.th0*DEG/2)):Infinity;
        g1.draw({xlabel:'t (s)',ylabel:'θ (°)',title:'θ(t)：精确 vs 小角度近似（含 ω_d）',legend:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#ffffff66',dash:[5,4],label:'近似'},{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff',label:'精确'}]});
        g2.draw({xlabel:'θ (°)',ylabel:'ω (rad/s)',title:'相图 θ–ω',series:[{pts:hist.map(q=>[q[1],q[3]]),color:'#c792ea'}],marks:[{x:S[0]/DEG,y:S[1],color:'#fff'}]});
        api.set('T0',fmtU(T0,'s',4)); api.set('T',fmtU(T,'s',4)); api.set('ratio',fmt(T/T0,4)); api.set('th',fmtU(S[0]/DEG,'°')); api.set('vm',fmtU(Math.sqrt(2*g*p.L*(1-Math.cos(p.th0*DEG))),'m/s',4)+(p.b>0?'（b = 0 时）':'')); api.set('vmm',fmtU(vmm,'m/s',4)); api.set('vc',fmtU(p.L*Math.abs(S[1]),'m/s')); api.set('Td',p.b/2<w0?fmtU(TAU/wd,'s',4):'过阻尼'); 
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 12. Gravitazione ===== */
Lab.register({
  id:'gravitazione', group:'mech', title:'万有引力与开普勒定律', it:'Gravitazione — orbite, leggi di Keplero, velocità di fuga',
  intro:'绕地球发射卫星：改变初速度得到圆、椭圆、抛物线/双曲线轨道。彩色扇形 = 相等时间扫过的面积（开普勒第二定律）。',
  explain:`<p><b>万有引力定律 (legge di gravitazione universale)</b>：F = GMm/r²。轨道形状由比能量 ε = v²/2 − GM/r 决定：ε &lt; 0 椭圆（束缚 orbita chiusa），ε = 0 抛物线，ε &gt; 0 双曲线（逃逸）。</p>
  <p><b>开普勒定律 (leggi di Keplero)</b>：① 轨道是椭圆，中心天体在一个焦点上；② 矢径在相等时间内扫过相等面积（角动量守恒）；③ T² ∝ a³。</p>
  <p>v = v<sub>circ</sub> 时为圆轨道；v ≥ v<sub>fuga</sub> = √2·v<sub>circ</sub> 时逃逸。若轨道低于地表 (R<sub>T</sub> = 6371 km) 则坠毁。</p>`,
  formulas:[fm(`F = G${fr('Mm','r<sup>2</sup>')}, &nbsp; U = −G${fr('Mm','r')}`),fm(`v<sub>circ</sub> = ${sq('GM/r')}, &nbsp; v<sub>fuga</sub> = ${sq('2GM/r')}`,'环绕速度 / 逃逸速度'),fm(`T<sup>2</sup> = ${fr('4π<sup>2</sup>','GM')}a<sup>3</sup>`,'开普勒第三定律'),fm(`E = ${fr(1,2)}mv<sup>2</sup> − G${fr('Mm','r')} = −G${fr('Mm','2a')}`,'椭圆轨道总能量'),fm(`${fr('dA','dt')} = ${fr('L','2m')} = cost.`,'开普勒第二定律')],
  setup(api){
    const p=api.p, GM0=3.986004e14, RE=6.371e6;
    api.select('M','中心天体 · corpo centrale',[['1','地球 Terra'],['0.0123','月球 Luna'],['0.107','火星 Marte']],'1');
    api.slider('r0','初始距离 r₀（到中心）',7000,60000,100,10000,'km');
    api.slider('v0','初速度 v₀',0.5,15,0.05,7,'km/s');
    api.slider('al','发射方向（相对切向）',-60,60,1,0,'°');
    ['vc','ve','orb','e','a','T','r','v','E'].forEach((k,i)=>api.readout(k,['环绕速度 v_circ(r₀)','逃逸速度 v_fuga(r₀)','轨道类型','偏心率 e','半长轴 a','周期 T','当前距离 r','当前速率 v','比能量 ε（守恒）'][i]));
    const cv=api.canvas(0.68,520), g1=api.graph(0.55,240), g2=api.graph(0.55,240);
    let S,t,trail,hist,view,crashed,el,GM,Rb;
    const elems=()=>{const r0=p.r0*1e3,v0=p.v0*1e3,eps=v0*v0/2-GM/r0,hh=r0*v0*Math.cos(p.al*DEG),e=Math.sqrt(Math.max(0,1+2*eps*hh*hh/(GM*GM))),a=-GM/(2*eps);return{eps,hh,e,a,T:eps<0?TAU*Math.sqrt(a*a*a/GM):Infinity};};
    api.anim({reset(){ GM=GM0*(+p.M); Rb=RE*({'1':1,'0.0123':0.2727,'0.107':0.532}[p.M]); const r0=p.r0*1e3,v0=p.v0*1e3,al=p.al*DEG;
        S=[r0,0,v0*Math.sin(al),v0*Math.cos(al)]; t=0; trail=[[r0,0,0]]; hist=[]; crashed=r0<=Rb; el=elems();
        view=el.eps<0?Math.max(el.a*(1+el.e),r0)*1.12:r0*3.5; view=Math.max(view,Rb*1.3); },
      speeds:[0.25,0.5,1,2,4],
      step(dt){ if(crashed) return; const tPerSec=(el.T<Infinity? el.T/10 : 2*Math.PI*Math.sqrt(p.r0**3*1e9/GM)/10); let rem=dt*tPerSec;
        let guard=0; while(rem>0 && guard++<20000){ const r=Math.hypot(S[0],S[1]); const h=Math.min(rem,0.003*Math.sqrt(r*r*r/GM)); 
          const acc=s=>{const rr=Math.hypot(s[0],s[1]),k=-GM/(rr*rr*rr);return [k*s[0],k*s[1]];};
          let a=acc(S); S[2]+=a[0]*h/2; S[3]+=a[1]*h/2; S[0]+=S[2]*h; S[1]+=S[3]*h; a=acc(S); S[2]+=a[0]*h/2; S[3]+=a[1]*h/2; rem-=h; t+=h;
          if(Math.hypot(S[0],S[1])<=Rb){crashed=true;break;} }
        trail.push([S[0],S[1],t]); if(trail.length>4000) trail.shift();
        const r=Math.hypot(S[0],S[1]),v2=S[2]**2+S[3]**2; hist.push([t/3600,r/1e3,v2/2/1e6,-GM/r/1e6,(v2/2-GM/r)/1e6]); if(hist.length>3000) hist.shift();
        if(r>view*3) api.pause(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=Math.min(w,h)/2/view, cx=w/2, cy=h/2, X=x=>cx+x*sc, Y=y=>cy-y*sc;
        for(let i=0;i<60;i++){ const sx=(i*137.5)%w, sy=(i*89.3)%h; ctx.fillStyle='#ffffff30'; ctx.fillRect(sx,sy,1.5,1.5); }
        // Kepler II sectors
        if(el.T<Infinity){ const dT=el.T/12; let cur=-1, poly=[]; const flush=(idx)=>{ if(poly.length<2) return; ctx.beginPath(); ctx.moveTo(cx,cy); poly.forEach(q=>ctx.lineTo(X(q[0]),Y(q[1]))); ctx.closePath(); ctx.fillStyle=idx%2?'#4f9dff26':'#ffb54726'; ctx.fill(); };
          for(const q of trail){ if(q[2]<t-el.T*0.999) continue; const idx=Math.floor(q[2]/dT); if(idx!==cur){ if(poly.length) poly.push(q); flush(cur); poly=[q]; cur=idx; } else poly.push(q); } flush(cur); }
        circle(ctx,cx,cy,Math.max(4,Rb*sc),'#2a6bd1','#7fb3ff');
        ctx.strokeStyle='#4f9dff'; ctx.lineWidth=1.5; ctx.beginPath(); trail.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1]))); ctx.stroke();
        circle(ctx,X(S[0]),Y(S[1]),5,crashed?'#ff6b6b':'#fff');
        arrow(ctx,X(S[0]),Y(S[1]),X(S[0])+S[2]*0.008,Y(S[1])-S[3]*0.008,'#3ecf8e','v');
        const r=Math.hypot(S[0],S[1]), v=Math.hypot(S[2],S[3]);
        text(ctx,`t = ${(t/3600).toFixed(2)} h`,10,20,'#ececef',13); if(crashed) text(ctx,'坠毁 (impatto)',10,40,'#ff6b6b',14);
        const st=niceStep(view/1e3,3); text(ctx,`比例尺: ${tickLabel(st,st)} km`,w-10,h-10,'#9b9ba4',11,'right'); line(ctx,w-10-st*1e3*sc,h-24,w-10,h-24,'#9b9ba4',2);
        g1.draw({xlabel:'t (h)',ylabel:'r (km)',title:'距离 r(t)',series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff'}]});
        g2.draw({xlabel:'t (h)',ylabel:'MJ/kg',title:'比能量：K、U、ε = K+U',legend:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#3ecf8e',label:'K'},{pts:hist.map(q=>[q[0],q[3]]),color:'#4f9dff',label:'U'},{pts:hist.map(q=>[q[0],q[4]]),color:'#ffb547',label:'ε'}]});
        const r0=p.r0*1e3; api.set('vc',fmtU(Math.sqrt(GM/r0)/1e3,'km/s',4)); api.set('ve',fmtU(Math.sqrt(2*GM/r0)/1e3,'km/s',4));
        api.set('orb',el.e<0.005?'圆 circolare':el.eps<0?'椭圆 ellittica':Math.abs(el.eps)<1e3?'抛物线 parabolica':'双曲线 iperbolica (fuga)');
        api.set('e',fmt(el.e,3)); api.set('a',el.eps<0?fmtU(el.a/1e3,'km',5):'—'); api.set('T',el.T<Infinity?fmtU(el.T/3600,'h',4):'∞');
        api.set('r',fmtU(r/1e3,'km',5)); api.set('v',fmtU(v/1e3,'km/s',4)); api.set('E',fmtU((v*v/2-GM/r)/1e6,'MJ/kg',5));
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 13. Fluidi: Stevino e Archimede ===== */
Lab.register({
  id:'idrostatica', group:'mech', title:'流体静力学：压强与浮力', it:'Fluidi — pressione, legge di Stevino, principio di Archimede',
  intro:'液体内部压强随深度线性增加；浸在液体中的物体受到等于排开液体重量的浮力。',
  explain:`<p><b>压强 (pressione)</b> p = F/A，单位帕斯卡 Pa。<b>斯蒂文定律 (legge di Stevino)</b>：p = p₀ + ρgh，只与深度有关，与容器形状无关。<b>帕斯卡原理 (principio di Pascal)</b>：外加压强传递到液体各处。</p>
  <p><b>阿基米德原理 (principio di Archimede)</b>：浮力 F<sub>A</sub> = ρ<sub>liquido</sub> g V<sub>immerso</sub>。ρ<sub>corpo</sub> &lt; ρ<sub>liquido</sub> 时漂浮，浸入体积比例 = ρ<sub>corpo</sub>/ρ<sub>liquido</sub>（如冰山约 90%）；否则下沉，"视重 (peso apparente)" = 重力 − 浮力。</p>
  <p>拖动"探针深度"查看该深度的压强。物块为边长 20 cm 的立方体。</p>`,
  formulas:[fm(`p = p<sub>0</sub> + ρgh`,'Stevino'),fm(`F<sub>A</sub> = ρ<sub>l</sub> g V<sub>imm</sub>`,'Archimede'),fm(`${fr('V<sub>imm</sub>','V')} = ${fr('ρ<sub>c</sub>','ρ<sub>l</sub>')}`,'漂浮时浸入比例'),fm(`P<sub>app</sub> = (ρ<sub>c</sub> − ρ<sub>l</sub>) g V`,'下沉物体的视重'),fm(`p<sub>0</sub> = 101 325 Pa = 1 atm`)],
  setup(api){
    const p=api.p, side=0.2, depth=1.0, p0=101325;
    api.select('rl','液体 · liquido',[['1000','水 acqua (1000)'],['1025','海水 acqua di mare (1025)'],['920','油 olio (920)'],['789','酒精 alcol (789)'],['13600','水银 mercurio (13600)']],'1000');
    api.slider('rc','物体密度 ρ_c <i>(densità del corpo)</i>',100,12000,1,600,'kg/m³');
    api.note('参考：软木 240，木 600，冰 917，铝 2700，铁 7870，铅 11340 kg/m³');
    api.slider('hp','探针深度 h <i>(profondità sonda)</i>',0,1,0.01,0.6,'m');
    ['P','FA','Fn','frac','pp','pg'].forEach((k,i)=>api.readout(k,['重力 mg','浮力 F_A（当前）','合力','浸入比例（当前）','探针压强 p','表压 ρgh'][i]));
    const cv=api.canvas(0.62,460); let y,v;
    const V=side**3;
    const sub=yy=>clamp((side/2-yy)/side,0,1); // y = center height relative to surface (positive up)
    api.anim({reset(){y=0.25;v=0;}, step(dt){ const rl=+p.rl, m=p.rc*V, n=40, h=dt/n, c=0.6*Math.sqrt(rl*G_EARTH*side*side*m); for(let i=0;i<n;i++){ const f=sub(y), F=rl*G_EARTH*V*f-m*G_EARTH-(f>0?(0.5*rl*side*side*Math.abs(v)+c)*v:0.2*v); v+=F/m*h; y+=v*h; if(y<-depth+side/2){y=-depth+side/2; v=0;} } },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const rl=+p.rl, sc=(h-80)/(depth+0.35), top=40+0.3*sc, L=w*0.12, R=w*0.62, Y=yy=>top-yy*sc;
        const grd=ctx.createLinearGradient(0,Y(0),0,Y(-depth)); grd.addColorStop(0,'#1e5a9a'); grd.addColorStop(1,'#0c2a4f'); ctx.fillStyle=grd; ctx.fillRect(L,Y(0),R-L,depth*sc);
        ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(L,Y(0.3)); ctx.lineTo(L,Y(-depth)); ctx.lineTo(R,Y(-depth)); ctx.lineTo(R,Y(0.3)); ctx.stroke();
        for(let d=0;d<=depth+1e-9;d+=0.2){ line(ctx,R,Y(-d),R+8,Y(-d),'#9b9ba4'); text(ctx,d.toFixed(1)+' m',R+12,Y(-d)+4,'#9b9ba4',11); }
        const s=side*sc, bx=(L+R)/2; ctx.fillStyle=p.rc<rl?'#c9a46a':'#8d99ae'; ctx.fillRect(bx-s/2,Y(y)-s/2,s,s);
        const m=p.rc*V, f=sub(y), FA=rl*G_EARTH*V*f, k=Math.min(60/(m*G_EARTH),60/(rl*G_EARTH*V));
        arrow(ctx,bx-10,Y(y),bx-10,Y(y)+m*G_EARTH*k,'#ff6b6b','mg'); if(FA>0) arrow(ctx,bx+10,Y(y),bx+10,Y(y)-FA*k,'#3ecf8e','F_A');
        // probe
        const px=L+30, py=Y(-p.hp); line(ctx,px,Y(0.3),px,py,'#ffb547',1.5); circle(ctx,px,py,5,'#ffb547');
        const pp=p0+rl*G_EARTH*p.hp; text(ctx,`p = ${(pp/1000).toFixed(2)} kPa`,px+10,py-6,'#ffb547',12);
        // p vs depth mini graph
        const gx0=w*0.72, gx1=w-15, pm=p0+rl*G_EARTH*depth; text(ctx,'p(h)',gx0,Y(0.15),'#d4d4d8',12); line(ctx,gx0,Y(0),gx0,Y(-depth),'#4b4b53'); line(ctx,gx0,Y(0),gx1,Y(0),'#4b4b53');
        const PX=q=>gx0+(q-p0*0.98)/(pm-p0*0.98)*(gx1-gx0); line(ctx,PX(p0),Y(0),PX(pm),Y(-depth),'#4f9dff',2); circle(ctx,PX(pp),py,4,'#ffb547');
        text(ctx,(p0/1000).toFixed(1),PX(p0),Y(0)-4,'#9b9ba4',10,'center'); text(ctx,(pm/1000).toFixed(1)+' kPa',gx1,Y(-depth)+14,'#9b9ba4',10,'right');
        api.set('P',fmtU(m*G_EARTH,'N')); api.set('FA',fmtU(FA,'N')); api.set('Fn',fmtU(FA-m*G_EARTH,'N')); api.set('frac',fmt(f*100,3)+' %'+(p.rc<rl?` (理论 ${fmt(p.rc/rl*100,3)} %)`:''));
        api.set('pp',fmtU(pp,'Pa',6)); api.set('pg',fmtU(rl*G_EARTH*p.hp,'Pa'));
      }});
    api.onChange(k=>{ if(k==='hp') return; api.A.reset(); api.play(); });
  }
});

/* ===== 13b. Bernoulli ===== */
Lab.register({
  id:'bernoulli', group:'mech', title:'流体动力学：连续性与伯努利方程', it:'Fluidodinamica — equazione di continuità, Bernoulli',
  intro:'理想流体（不可压缩、无粘性、稳定流动）在变截面、变高度的管道中流动。竖直细管显示各处压强（文丘里管 tubo di Venturi）。',
  explain:`<p><b>连续性方程 (equazione di continuità)</b>：流量 (portata) Q = Av 处处相同，截面变窄处流速变快。</p>
  <p><b>伯努利方程 (equazione di Bernoulli)</b>：沿流线 p + ½ρv² + ρgh = 常数 —— 单位体积流体的能量守恒。<em>流速大的地方压强小</em>（文丘里效应），这解释了机翼升力、喷雾器等现象。</p>
  <p>竖直测压管中液柱高度 = 表压 / ρg。若 p₂ 低于大气压，读数会显示警告（实际中可能发生空化 cavitazione）。</p>`,
  formulas:[fm(`A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub> = Q`,'连续性方程'),fm(`p<sub>1</sub> + ${fr(1,2)}ρv<sub>1</sub><sup>2</sup> + ρgh<sub>1</sub> = p<sub>2</sub> + ${fr(1,2)}ρv<sub>2</sub><sup>2</sup> + ρgh<sub>2</sub>`,'伯努利方程'),fm(`v = ${sq('2gh')}`,'托里拆利定理 teorema di Torricelli（小孔流速）')],
  setup(api){
    const p=api.p;
    api.slider('d1','截面 1 直径 d₁',2,30,0.5,20,'cm'); api.slider('d2','截面 2 直径 d₂',2,30,0.5,10,'cm');
    api.slider('v1','流速 v₁',0.1,5,0.05,1,'m/s'); api.slider('h2','截面 2 高度 h₂',0,2,0.05,0,'m');
    api.slider('p1','截面 1 表压 p₁ (gauge)',0,60,0.5,25,'kPa');
    ['Q','v2','p2','pt','m'].forEach((k,i)=>api.readout(k,['体积流量 Q','流速 v₂','截面 2 表压 p₂','p + ½ρv² + ρgh（两处）','质量流量 ρQ'][i]));
    const cv=api.canvas(0.6,460); let parts=[];
    const rho=1000;
    const geo=x=>{ const s=x<0.35?0:x>0.6?1:(1-Math.cos(Math.PI*(x-0.35)/0.25))/2; return {r:lerp(p.d1,p.d2,s), y:lerp(0,p.h2,s)}; };
    api.anim({reset(){ parts=[]; for(let i=0;i<160;i++) parts.push([Math.random(),Math.random()*2-1]); },
      step(dt){ for(const q of parts){ const g=geo(q[0]); const v=p.v1*(p.d1/g.r)**2; q[0]+=v*dt/4; if(q[0]>1){q[0]-=1;q[1]=Math.random()*2-1;} } },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h);
        const v2=p.v1*(p.d1/p.d2)**2, P1=p.p1*1e3, P2=P1+0.5*rho*(p.v1**2-v2**2)-rho*G_EARTH*p.h2;
        const col1=P1/(rho*G_EARTH), col2=P2/(rho*G_EARTH);
        const ymaxw=Math.max(col1, p.h2+Math.max(col2,0), p.h2)+0.25, rs=Math.min(2.2,h/170), padB=Math.max(p.d1,p.d2)*rs/2+30, padT=22;
        const sy=(h-padB-padT)/ymaxw, Y=yy=>h-padB-yy*sy, X=x=>30+x*(w-60);
        // pipe
        ctx.fillStyle='#1e5a9a'; ctx.beginPath(); for(let x=0;x<=1.0001;x+=0.01){const g=geo(x); ctx.lineTo(X(x),Y(g.y)-g.r*rs/2);} for(let x=1;x>=-0.0001;x-=0.01){const g=geo(x); ctx.lineTo(X(x),Y(g.y)+g.r*rs/2);} ctx.closePath(); ctx.fill();
        ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=2; for(const sg of [-1,1]){ ctx.beginPath(); for(let x=0;x<=1.0001;x+=0.01){const g=geo(x); x?ctx.lineTo(X(x),Y(g.y)+sg*g.r*rs/2):ctx.moveTo(X(x),Y(g.y)+sg*g.r*rs/2);} ctx.stroke(); }
        for(const q of parts){ const g=geo(q[0]); circle(ctx,X(q[0]),Y(g.y)+q[1]*g.r*rs/2*0.85,1.8,'#cfe8ff'); }
        // manometer tubes
        const tube=(x,col,label,vv)=>{ const g=geo(x), top=Y(g.y)-g.r*rs/2; const xx=X(x); ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=1.5; ctx.strokeRect(xx-6,Y(ymaxw-0.02),12,top-Y(ymaxw-0.02));
          const ct=Y(g.y+Math.max(col,0)); ctx.fillStyle='#4f9dff'; ctx.fillRect(xx-5,Math.min(ct,top),10,Math.max(0,top-ct)); text(ctx,label,xx+10,Math.min(ct,top)-4,'#ffb547',12);
          if(col<0) text(ctx,'⚠ p < p_atm',xx-6,top-8,'#ff6b6b',12,'right'); line(ctx,X(0),Y(0),X(1),Y(0),'#ffffff10'); };
        tube(0.17,col1,`p₁: ${fmt(col1,3)} m`); tube(0.82,col2,`p₂: ${fmt(col2,3)} m`);
        text(ctx,`v₁ = ${fmt(p.v1)} m/s`,X(0.02),Math.min(h-6,Y(0)+p.d1*rs/2+18),'#d4d4d8',12); text(ctx,`v₂ = ${fmt(v2)} m/s`,X(0.98),Math.min(h-6,Y(p.h2)+p.d2*rs/2+18),'#d4d4d8',12,'right');
        const A1=Math.PI*(p.d1/200)**2; api.set('Q',fmtU(A1*p.v1*1000,'L/s')); api.set('v2',fmtU(v2,'m/s')); api.set('p2',(P2<0?'<span class="bad">':'')+fmtU(P2/1000,'kPa')+(P2<0?'</span>':''));
        api.set('pt',`${fmt((P1+0.5*rho*p.v1**2)/1000,5)} | ${fmt((P2+0.5*rho*v2**2+rho*G_EARTH*p.h2)/1000,5)} kPa`); api.set('m',fmtU(A1*p.v1*rho,'kg/s'));
      }});
    api.onChange(()=>{});
  }
});

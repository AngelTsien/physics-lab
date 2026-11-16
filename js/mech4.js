'use strict';
/* ===== Prerequisiti: vettori e calcolo ===== */
Lab.register({
  id:'vettori', group:'mech', title:'预备知识：矢量与微积分', it:'Prerequisiti — vettori, derivate e integrali',
  intro:'上：矢量的合成、分解、点积与叉积。下：导数 = 切线斜率，积分 = 曲线下面积（运动学的数学基础）。',
  explain:`<p><b>矢量 (vettore)</b> 有大小 (modulo) 和方向。<b>分解 (scomposizione)</b>：Aₓ = A cosθ, A_y = A sinθ。<b>合成 (somma)</b>用平行四边形法则，分量直接相加。</p>
  <p><b>点积 / 标量积 (prodotto scalare)</b> A·B = AB cosφ = AₓBₓ + A_yB_y，是一个数，衡量"同方向的程度"（功 L = F·s）。<b>叉积 / 矢量积 (prodotto vettoriale)</b> A×B 垂直于两者所在平面，大小 AB sinφ = 平行四边形面积（力矩 τ = r×F），方向由右手定则 (regola della mano destra) 确定。</p>
  <p><b>导数 (derivata)</b> f′(t₀) 是曲线在 t₀ 处切线的斜率；<b>定积分 (integrale definito)</b> ∫₀^t₀ f dt 是曲线与 t 轴之间的有向面积。若 f 是速度 v(t)，则导数是加速度、积分是位移。</p>`,
  formulas:[fm(`A<sub>x</sub> = A cosθ, &nbsp; A<sub>y</sub> = A sinθ, &nbsp; A = ${sq('A<sub>x</sub><sup>2</sup> + A<sub>y</sub><sup>2</sup>')}`,'分解与模'),fm(`<b>A</b>·<b>B</b> = AB cosφ = A<sub>x</sub>B<sub>x</sub> + A<sub>y</sub>B<sub>y</sub>`,'标量积'),fm(`|<b>A</b>×<b>B</b>| = AB sinφ, &nbsp; (<b>A</b>×<b>B</b>)<sub>z</sub> = A<sub>x</sub>B<sub>y</sub> − A<sub>y</sub>B<sub>x</sub>`,'矢量积'),fm(`f′(t) = ${fr('df','dt')} = lim<sub>Δt→0</sub> ${fr('f(t+Δt) − f(t)','Δt')}`,'导数'),fm(`∫<sub>a</sub><sup>b</sup> f(t) dt = F(b) − F(a)`,'微积分基本定理')],
  setup(api){
    const p=api.p;
    api.select('op','矢量运算 · operazione',[['sum','合成 A+B · somma'],['diff','相减 A−B · differenza'],['dot','点积 A·B · prodotto scalare'],['cross','叉积 A×B · prodotto vettoriale'],['comp','分解 · componenti']],'sum');
    api.slider('A','|A| <i>(modulo)</i>',0,10,0.1,6); api.slider('tA','A 的方向 θ_A',0,360,1,30,'°');
    api.slider('B','|B|',0,10,0.1,4); api.slider('tB','B 的方向 θ_B',0,360,1,110,'°');
    api.select('fn','函数 f(t) · funzione',[['parab','t² − 4t + 3'],['sin','2 sin t'],['exp','4 e^(−t/2)'],['cubic','0.2t³ − 1.5t² + 3t']],'parab');
    api.slider('t0','t₀（播放时自动扫描）',0,6,0.01,3);
    ['Ac','Bc','S','D','dot','cr','phi','sep','f','fp','I'].forEach((k,i)=>{ if(k==='sep'){api.sep();return;} api.readout(k,['A = (Aₓ, A_y)','B = (Bₓ, B_y)','A + B（模, 方向）','A − B（模, 方向）','A·B','(A×B)_z','夹角 φ','','f(t₀)','f′(t₀) = 切线斜率','∫₀^t₀ f dt = 面积'][i]); });
    const cv=api.canvas(0.55,380), g1=api.graph(0.6,280), g2=api.graph(0.6,280);
    const F={parab:{f:t=>t*t-4*t+3,d:t=>2*t-4,I:t=>t**3/3-2*t*t+3*t},sin:{f:t=>2*Math.sin(t),d:t=>2*Math.cos(t),I:t=>2*(1-Math.cos(t))},exp:{f:t=>4*Math.exp(-t/2),d:t=>-2*Math.exp(-t/2),I:t=>8*(1-Math.exp(-t/2))},cubic:{f:t=>0.2*t**3-1.5*t*t+3*t,d:t=>0.6*t*t-3*t+3,I:t=>0.05*t**4-0.5*t**3+1.5*t*t}};
    let tt;
    api.anim({autoplay:false, reset(){tt=p.t0;}, step(dt){ tt=(tt+dt*0.8)%6; api.ctrl.t0.set(+tt.toFixed(2)); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=Math.min(w,h)/26, cx=w/2, cy=h/2, X=x=>cx+x*sc, Y=y=>cy-y*sc;
        for(let i=-14;i<=14;i++){ line(ctx,X(i),0,X(i),h,'#1c1c20'); line(ctx,0,Y(i),w,Y(i),'#1c1c20'); } line(ctx,0,cy,w,cy,'#3a3a42'); line(ctx,cx,0,cx,h,'#3a3a42');
        const A=[p.A*Math.cos(p.tA*DEG),p.A*Math.sin(p.tA*DEG)], B=[p.B*Math.cos(p.tB*DEG),p.B*Math.sin(p.tB*DEG)];
        const op=p.op;
        if(op==='comp'){ line(ctx,X(A[0]),Y(0),X(A[0]),Y(A[1]),'#4f9dff88',1.5,[4,3]); line(ctx,X(0),Y(A[1]),X(A[0]),Y(A[1]),'#4f9dff88',1.5,[4,3]); arrow(ctx,X(0),Y(0),X(A[0]),Y(0),'#3ecf8e','Aₓ'); arrow(ctx,X(0),Y(0),X(0),Y(A[1]),'#ff6b6b','A_y'); }
        if(op==='cross'){ ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(A[0]),Y(A[1])); ctx.lineTo(X(A[0]+B[0]),Y(A[1]+B[1])); ctx.lineTo(X(B[0]),Y(B[1])); ctx.closePath(); ctx.fillStyle='#c792ea33'; ctx.fill();
          const cz=A[0]*B[1]-A[1]*B[0]; text(ctx,cz>=0?'⊙ A×B 指向屏幕外 (uscente)':'⊗ A×B 指向屏幕内 (entrante)',10,20,'#c792ea',13); text(ctx,'面积 = |A×B| = '+fmt(Math.abs(cz),4),10,40,'#c792ea',12); }
        if(op==='dot'){ const u=[B[0]/(p.B||1),B[1]/(p.B||1)], pr=A[0]*u[0]+A[1]*u[1]; line(ctx,X(A[0]),Y(A[1]),X(pr*u[0]),Y(pr*u[1]),'#ffffff55',1,[4,3]); arrow(ctx,X(0),Y(0),X(pr*u[0]),Y(pr*u[1]),'#ffb547','A cosφ',3); text(ctx,'A·B = |B| × (A 在 B 上的投影)',10,20,'#ffb547',13); }
        arrow(ctx,X(0),Y(0),X(A[0]),Y(A[1]),'#4f9dff','A',3); arrow(ctx,X(0),Y(0),X(B[0]),Y(B[1]),'#3ecf8e','B',3);
        if(op==='sum'){ line(ctx,X(A[0]),Y(A[1]),X(A[0]+B[0]),Y(A[1]+B[1]),'#3ecf8e66',1.5,[5,4]); line(ctx,X(B[0]),Y(B[1]),X(A[0]+B[0]),Y(A[1]+B[1]),'#4f9dff66',1.5,[5,4]); arrow(ctx,X(0),Y(0),X(A[0]+B[0]),Y(A[1]+B[1]),'#ffb547','A+B',3); }
        if(op==='diff'){ arrow(ctx,X(B[0]),Y(B[1]),X(A[0]),Y(A[1]),'#ff6b6b','A−B',3); line(ctx,X(0),Y(0),X(A[0]-B[0]),Y(A[1]-B[1]),'#ff6b6b55',1.5,[5,4]); }
        const S=[A[0]+B[0],A[1]+B[1]], Dd=[A[0]-B[0],A[1]-B[1]], ang=v=>((Math.atan2(v[1],v[0])/DEG)+360)%360;
        api.set('Ac',`(${fmt(A[0])}, ${fmt(A[1])})`); api.set('Bc',`(${fmt(B[0])}, ${fmt(B[1])})`); api.set('S',`${fmt(Math.hypot(...S))}, ${fmt(ang(S))}°`); api.set('D',`${fmt(Math.hypot(...Dd))}, ${fmt(ang(Dd))}°`);
        api.set('dot',fmt(A[0]*B[0]+A[1]*B[1],4)); api.set('cr',fmt(A[0]*B[1]-A[1]*B[0],4)); let ph=Math.abs(p.tA-p.tB)%360; if(ph>180) ph=360-ph; api.set('phi',fmt(ph)+'°');
        // calculus
        const f=F[p.fn], t0=p.t0, curve=[], area=[]; for(let t=0;t<=6.0001;t+=0.02){ curve.push([t,f.f(t)]); if(t<=t0) area.push([t,f.f(t)]); } area.push([t0,f.f(t0)]);
        const sl=f.d(t0), tan=[[t0-1.5,f.f(t0)-1.5*sl],[t0+1.5,f.f(t0)+1.5*sl]];
        g1.draw({xr:[0,6],xlabel:'t (s)',ylabel:'f(t)',title:'f(t)：切线斜率 = f′(t₀)，阴影 = ∫f dt',series:[{pts:area,color:'#3ecf8e',fill:true,fillColor:'#3ecf8e33',width:0.01},{pts:curve,color:'#4f9dff'},{pts:tan,color:'#ffb547',width:2}],marks:[{x:t0,y:f.f(t0),color:'#ffb547'}]});
        const dc=[],ic=[]; for(let t=0;t<=6.0001;t+=0.02){dc.push([t,f.d(t)]); ic.push([t,f.I(t)]);}
        g2.draw({xr:[0,6],xlabel:'t (s)',ylabel:'',title:'导函数 f′(t) 与 积分函数 F(t) = ∫₀ᵗ f',legend:true,series:[{pts:dc,color:'#ffb547',label:"f′(t)"},{pts:ic,color:'#3ecf8e',label:'F(t)'}],marks:[{x:t0,y:sl,color:'#ffb547'},{x:t0,y:f.I(t0),color:'#3ecf8e'}]});
        api.set('f',fmt(f.f(t0),4)); api.set('fp',fmt(sl,4)); api.set('I',fmt(f.I(t0),4));
      }});
    api.onChange(()=>{});
  }
});

/* ===== Coordinate polari / componenti intrinseche ===== */
Lab.register({
  id:'polari', group:'mech', title:'曲线运动：极坐标与自然坐标', it:'Moto curvilineo — coordinate polari, accelerazione tangenziale e normale',
  intro:'沿曲线运动的质点：在自然坐标中分解为切向 a_t（改变速率）与法向 a_n = v²/ρ（改变方向）；或在极坐标中分解为径向与横向分量。虚线圆 = 曲率圆 (cerchio osculatore)。',
  explain:`<p><b>自然坐标 (componenti intrinseche)</b>：速度总是沿切线 <b>v</b> = v<b>û</b><sub>t</sub>。加速度 <b>a</b> = (dv/dt)<b>û</b><sub>t</sub> + (v²/ρ)<b>û</b><sub>n</sub>，ρ 为<b>曲率半径 (raggio di curvatura)</b>，法向分量指向曲率中心。</p>
  <p><b>极坐标 (coordinate polari)</b> (r, θ)：<b>v</b> = ṙ<b>û</b><sub>r</sub> + rθ̇<b>û</b><sub>θ</sub>；加速度径向分量 r̈ − rθ̇²（含"向心项"），横向分量 rθ̈ + 2ṙθ̇（含"科里奥利项"）。</p>
  <p>椭圆轨道上 θ̇ 恒定但速率变化，所以有切向加速度；在匀速圆周运动中 a<sub>t</sub> = 0，a<sub>n</sub> = v²/R，两套分解重合。</p>`,
  formulas:[fm(`<b>a</b> = ${fr('dv','dt')}<b>û</b><sub>t</sub> + ${fr('v<sup>2</sup>','ρ')}<b>û</b><sub>n</sub>`,'切向 + 法向'),fm(`<b>v</b> = ṙ<b>û</b><sub>r</sub> + rθ̇<b>û</b><sub>θ</sub>`,'极坐标速度'),fm(`a<sub>r</sub> = r̈ − rθ̇<sup>2</sup>, &nbsp; a<sub>θ</sub> = rθ̈ + 2ṙθ̇`,'极坐标加速度'),fm(`ρ = ${fr('v<sup>3</sup>','|<b>v</b>×<b>a</b>|')}`,'曲率半径')],
  setup(api){
    const p=api.p;
    api.select('path','轨迹 · traiettoria',[['ell','椭圆 ellisse (a=3 m, b=2 m)'],['spir','阿基米德螺线 spirale (r = 0.5 + 0.25θ)'],['card','心形线 cardioide r = 1.5(1+cosθ)']],'ell');
    api.slider('w','角速度参数 ω <i>(θ̇ 或参数速率)</i>',0.2,2,0.05,0.8,'rad/s');
    api.select('dec','分解方式 · componenti',[['tn','自然坐标 (t, n) · intrinseche'],['rt','极坐标 (r, θ) · polari']],'tn');
    ['t','v','at','an','rho','vr','vt','ar','ath'].forEach((k,i)=>api.readout(k,['时间 t','速率 v','切向 a_t','法向 a_n','曲率半径 ρ','径向 v_r = ṙ','横向 v_θ = rθ̇','径向 a_r','横向 a_θ'][i]));
    const cv=api.canvas(0.62,440), g1=api.graph(0.6,250), g2=api.graph(0.6,250); let t,hist;
    const pos=s=>{ const w=p.w; if(p.path==='ell') return [3*Math.cos(w*s),2*Math.sin(w*s)]; if(p.path==='spir'){ const th=(w*s)%(6*Math.PI), r=0.5+0.25*th; return [r*Math.cos(th),r*Math.sin(th)]; } const th=w*s, r=1.5*(1+Math.cos(th)); return [r*Math.cos(th),r*Math.sin(th)]; };
    const kin=s=>{ const hh=1e-3, a=pos(s-hh), b=pos(s), c=pos(s+hh); const v=[(c[0]-a[0])/(2*hh),(c[1]-a[1])/(2*hh)], ac=[(c[0]-2*b[0]+a[0])/(hh*hh),(c[1]-2*b[1]+a[1])/(hh*hh)];
      const sp=Math.hypot(...v), ut=[v[0]/sp,v[1]/sp], at=ac[0]*ut[0]+ac[1]*ut[1], an_v=[ac[0]-at*ut[0],ac[1]-at*ut[1]], an=Math.hypot(...an_v);
      const r=Math.hypot(...b), ur=r>1e-9?[b[0]/r,b[1]/r]:[1,0], uth=[-ur[1],ur[0]];
      return {b,v,ac,sp,ut,at,an,un:an>1e-9?[an_v[0]/an,an_v[1]/an]:[0,0],rho:an>1e-9?sp*sp/an:Infinity,ur,uth,vr:v[0]*ur[0]+v[1]*ur[1],vth:v[0]*uth[0]+v[1]*uth[1],ar:ac[0]*ur[0]+ac[1]*ur[1],ath:ac[0]*uth[0]+ac[1]*uth[1]}; };
    api.anim({reset(){t=0;hist=[];}, speeds:[0.5,1,2], step(dt){ t+=dt; if(p.path==='spir'&&p.w*t>=6*Math.PI) {t=0;hist=[];} const k=kin(t); hist.push([t,k.sp,k.at,k.an]); if(hist.length>1500) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=Math.min(w,h)/2/(p.path==='spir'?5.4:p.path==='card'?3.4:3.6), cx=p.path==='card'?w/2-0.9*sc:w/2, cy=h/2, X=x=>cx+x*sc, Y=y=>cy-y*sc;
        line(ctx,0,cy,w,cy,'#26262b'); line(ctx,cx,0,cx,h,'#26262b');
        ctx.strokeStyle='#3a3a42'; ctx.lineWidth=2; ctx.beginPath(); const Tm=p.path==='spir'?6*Math.PI/p.w:TAU/p.w; for(let i=0;i<=400;i++){ const q=pos(Tm*i/400*0.9999); i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])); } ctx.stroke();
        const k=kin(t), P=[X(k.b[0]),Y(k.b[1])];
        if(isFinite(k.rho)&&k.rho<30){ const c=[k.b[0]+k.rho*k.un[0],k.b[1]+k.rho*k.un[1]]; ctx.save(); ctx.setLineDash([4,4]); circle(ctx,X(c[0]),Y(c[1]),k.rho*sc,null,'#ffffff40',1); ctx.restore(); circle(ctx,X(c[0]),Y(c[1]),2.5,'#ffffff80'); }
        line(ctx,cx,cy,P[0],P[1],'#4b4b5399',1,[3,3]);
        const kv=sc*0.35, ka=sc*0.18;
        arrow(ctx,P[0],P[1],P[0]+k.v[0]*kv,P[1]-k.v[1]*kv,'#3ecf8e','v');
        if(p.dec==='tn'){ arrow(ctx,P[0],P[1],P[0]+k.ut[0]*k.at*ka,P[1]-k.ut[1]*k.at*ka,'#ffb547','a_t'); arrow(ctx,P[0],P[1],P[0]+k.un[0]*k.an*ka,P[1]-k.un[1]*k.an*ka,'#ff6b6b','a_n'); }
        else { arrow(ctx,P[0],P[1],P[0]+k.ur[0]*k.ar*ka,P[1]-k.ur[1]*k.ar*ka,'#ffb547','a_r'); arrow(ctx,P[0],P[1],P[0]+k.uth[0]*k.ath*ka,P[1]-k.uth[1]*k.ath*ka,'#ff6b6b','a_θ'); }
        arrow(ctx,P[0],P[1],P[0]+k.ac[0]*ka,P[1]-k.ac[1]*ka,'#ffffff','a',1.5); circle(ctx,P[0],P[1],7,'#4f9dff','#fff');
        g1.draw({xlabel:'t (s)',ylabel:'v (m/s)',title:'速率 v(t)（斜率 = a_t）',series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#3ecf8e'}]});
        g2.draw({xlabel:'t (s)',ylabel:'a (m/s²)',title:'a_t(t) 与 a_n(t)',legend:true,y0:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#ffb547',label:'a_t'},{pts:hist.map(q=>[q[0],q[3]]),color:'#ff6b6b',label:'a_n'}]});
        api.set('t',fmtU(t,'s')); api.set('v',fmtU(k.sp,'m/s')); api.set('at',fmtU(k.at,'m/s²')); api.set('an',fmtU(k.an,'m/s²')); api.set('rho',isFinite(k.rho)?fmtU(k.rho,'m'):'∞');
        api.set('vr',fmtU(k.vr,'m/s')); api.set('vt',fmtU(k.vth,'m/s')); api.set('ar',fmtU(k.ar,'m/s²')); api.set('ath',fmtU(k.ath,'m/s²'));
      }});
    api.onChange(k=>{ if(k==='dec') return; api.A.reset(); api.play(); });
  }
});

/* ===== Sistemi non inerziali ===== */
Lab.register({
  id:'noninerziali', group:'mech', title:'非惯性系与惯性力', it:'Sistemi non inerziali e forze apparenti — ascensore, centrifuga, Coriolis',
  intro:'在加速或转动的参考系中，牛顿定律要加上"惯性力 / 视在力 (forze apparenti)"才能成立。三个场景：加速电梯、转台（离心力）、科里奥利力。',
  explain:`<p><b>非惯性系 (sistema non inerziale)</b>：相对惯性系加速的参考系。在其中写 m<b>a</b>′ = Σ<b>F</b> + <b>F</b><sub>app</sub>，其中视在力不来自任何物体的相互作用。</p>
  <p>• <b>平动加速 (ascensore)</b>：<b>F</b><sub>app</sub> = −m<b>a</b><sub>0</sub>，等效重力 g<sub>eff</sub> = g + a（向上加速为正）。体重秤读数 N = m(g + a)；a = −g 时<b>失重 (assenza di peso)</b>。<br>• <b>转动 (centrifuga)</b>：离心力 (forza centrifuga) mω²r 向外——在惯性系中并不存在，那里只有提供向心力的张力。<br>• <b>科里奥利力 (forza di Coriolis)</b> −2m<b>ω</b>×<b>v</b>′：在转盘上沿直线抛出的球，在转盘系中轨迹是弯曲的（地球上的气旋、傅科摆）。</p>`,
  formulas:[fm(`m<b>a</b>′ = Σ<b>F</b> − m<b>a</b><sub>0</sub> − m<b>ω</b>×(<b>ω</b>×<b>r</b>) − 2m<b>ω</b>×<b>v</b>′`,'非惯性系中的运动方程'),fm(`N = m(g + a), &nbsp; g<sub>eff</sub> = g + a`,'电梯'),fm(`F<sub>cf</sub> = mω<sup>2</sup>r`,'离心力'),fm(`F<sub>Cor</sub> = 2mωv′ (v′ ⊥ ω)`,'科里奥利力')],
  setup(api){
    const p=api.p;
    api.select('mode','场景 · scenario',[['asc','加速电梯 · ascensore'],['cen','转台 · piattaforma rotante (centrifuga)'],['cor','科里奥利 · Coriolis']],'asc');
    const sA=api.slider('a','电梯加速度 a（向上为正）',-9.81,10,0.01,3,'m/s²'); const sM=api.slider('m','质量 m',1,100,1,70,'kg');
    const sW=api.slider('w','转台角速度 ω',0.1,3,0.05,1.2,'rad/s'); const sR=api.slider('r','半径 r（转台）',0.5,4,0.1,2,'m'); const sV=api.slider('v','抛出速度 v′（科里奥利）',0.5,6,0.1,2,'m/s');
    const sF=api.select('frame','观察参考系（转台）',[['rot','转动系 · rotante'],['in','惯性系 · inerziale']],'rot');
    ['r1','r2','r3','r4'].forEach(k=>api.readout(k,'—'));
    const cv=api.canvas(0.55,420); let t;
    const lbl=(k,l)=>{ api.ro[k].previousSibling.innerHTML=l; };
    api.anim({reset(){t=0;}, speeds:[0.5,1,2], step(dt){ t+=dt; },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const m=p.mode;
        [[sA,'asc'],[sM,'asc cen'],[sW,'cen cor'],[sR,'cen'],[sV,'cor'],[sF,'cen']].forEach(([s,ms])=>s.el.style.opacity=ms.includes(m)?1:0.35);
        if(m==='asc'){ const g=G_EARTH, ge=g+p.a, N=p.m*Math.max(0,ge);
          const ew=Math.min(200,w*0.35), eh=h-60, ex=w*0.28-ew/2, ey=30;
          ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=3; ctx.strokeRect(ex,ey,ew,eh); line(ctx,ex+ew/2,0,ex+ew/2,ey,'#9b9ba4',2);
          arrow(ctx,ex+ew+20,ey+eh/2,ex+ew+20,ey+eh/2-p.a*6,'#c792ea','a₀');
          // person on scale
          const px=ex+ew*0.3, base=ey+eh-14; ctx.fillStyle='#4b4b53'; ctx.fillRect(px-22,base,44,10);
          ctx.strokeStyle='#ececef'; ctx.lineWidth=3; circle(ctx,px,base-78,10,null,'#ececef',3); line(ctx,px,base-68,px,base-35,'#ececef',3); line(ctx,px,base-35,px-10,base,'#ececef',3); line(ctx,px,base-35,px+10,base,'#ececef',3); line(ctx,px-14,base-58,px+14,base-58,'#ececef',3);
          arrow(ctx,px+32,base-40,px+32,base-40+p.m*g*0.08,'#ff6b6b','mg'); arrow(ctx,px+32,base-40,px+32,base-40-N*0.08,'#3ecf8e','N');
          if(Math.abs(p.a)>0.01) arrow(ctx,px+60,base-40,px+60,base-40+p.m*p.a*0.08,'#ffb547','−ma₀');
          // falling ball in cabin frame
          const H=eh-40, T=ge>0.05?Math.sqrt(2*(H/60)/ge):Infinity, tt=isFinite(T)?(t%(T+0.5)):t, y=isFinite(T)?Math.min(H,0.5*ge*tt*tt*60):0;
          circle(ctx,ex+ew*0.78,ey+20+y,7,'#4f9dff'); text(ctx,'释放的小球',ex+ew*0.78,ey+14,'#9b9ba4',11,'center');
          const tx=w*0.58; text(ctx,ge<=0.01?'失重 assenza di peso!':`体重秤读数 = ${fmt(N/g,4)} kg`,tx,50,ge<=0.01?'#ffb547':'#ececef',16);
          text(ctx,`g_eff = g + a = ${fmt(ge,4)} m/s²`,tx,80,'#d4d4d8',13); text(ctx,'（电梯系中小球以 g_eff 下落）',tx,102,'#9b9ba4',12);
          lbl('r1','支持力 N = m(g+a)'); lbl('r2','视重 / 真实重量'); lbl('r3','等效重力 g_eff'); lbl('r4','1 m 单摆周期 2π√(L/g_eff)');
          api.set('r1',fmtU(N,'N')); api.set('r2',fmt(ge/g,4)); api.set('r3',fmtU(ge,'m/s²')); api.set('r4',ge>0.01?fmtU(TAU*Math.sqrt(1/ge),'s'):'∞（不摆动）');
        } else if(m==='cen'){ const R=Math.min(w,h)/2-30, cx=w/2, cy=h/2, sc=R/4.2, rot=p.frame==='rot', ang=rot?0:p.w*t;
          circle(ctx,cx,cy,R,'#1c1c20','#4b4b53',2); for(let i=0;i<8;i++){ const a=(rot?0:p.w*t)+i*TAU/8; line(ctx,cx,cy,cx+R*Math.cos(a),cy-R*Math.sin(a),'#26262b'); }
          const mx=cx+p.r*sc*Math.cos(ang), my=cy-p.r*sc*Math.sin(ang); line(ctx,cx,cy,mx,my,'#ddd',2); circle(ctx,cx,cy,5,'#fff');
          const F=p.m*p.w*p.w*p.r, k=70/Math.max(F,1), ux=(mx-cx)/(p.r*sc), uy=(my-cy)/(p.r*sc);
          arrow(ctx,mx,my,mx-ux*F*k,my-uy*F*k,'#3ecf8e','T（张力）');
          if(rot) arrow(ctx,mx,my,mx+ux*F*k,my+uy*F*k,'#ffb547','F_cf（离心力，视在）');
          else arrow(ctx,mx,my,mx-uy*p.w*p.r*25,my+ux*p.w*p.r*25,'#4f9dff','v');
          circle(ctx,mx,my,10,'#c792ea','#fff');
          text(ctx,rot?'转动系：物体静止，T + F_cf = 0':'惯性系：物体做圆周运动，T 提供向心力',12,22,'#ececef',13);
          lbl('r1','张力 T = mω²r'); lbl('r2','离心力 F_cf（仅转动系）'); lbl('r3','线速度 v = ωr（惯性系）'); lbl('r4','向心加速度 ω²r');
          api.set('r1',fmtU(F,'N')); api.set('r2',rot?fmtU(F,'N'):'不存在'); api.set('r3',fmtU(p.w*p.r,'m/s')); api.set('r4',fmtU(p.w*p.w*p.r,'m/s²'));
        } else { const R=4, Tm=R/p.v, tt=t%(Tm+0.8), s=Math.min(tt,Tm), half=w/2, Rp=Math.min(half,h)/2-24, sc=Rp/R;
          for(const [ox,lab,rotF] of [[half/2,'惯性系 inerziale：直线',false],[half*1.5,'转盘系 rotante：弯曲',true]]){
            const cy=h/2+8, ang0=rotF?0:p.w*s; circle(ctx,ox,cy,Rp,'#1c1c20','#4b4b53',2); for(let i=0;i<6;i++){ const a=ang0+i*TAU/6; line(ctx,ox,cy,ox+Rp*Math.cos(a),cy-Rp*Math.sin(a),'#26262b'); }
            text(ctx,lab,ox,18,'#ececef',12.5,'center');
            ctx.strokeStyle='#ffb547'; ctx.lineWidth=2.5; ctx.beginPath();
            for(let i=0;i<=60;i++){ const q=s*i/60; let x=p.v*q, y=0; if(rotF){ const a=-p.w*q; [x,y]=[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]; } i?ctx.lineTo(ox+x*sc,cy-y*sc):ctx.moveTo(ox+x*sc,cy-y*sc); } ctx.stroke();
            let x=p.v*s, y=0; if(rotF){ const a=-p.w*s; [x,y]=[x*Math.cos(a),x*Math.sin(a)]; } circle(ctx,ox+x*sc,cy-y*sc,6,'#4f9dff','#fff'); }
          const dev=p.w*R/p.v;
          lbl('r1','科里奥利加速度 2ωv′'); lbl('r2','到达边缘时间 R/v′ (R = 4 m)'); lbl('r3','转盘转过角度 ωR/v′'); lbl('r4','质量 m 受科里奥利力');
          api.set('r1',fmtU(2*p.w*p.v,'m/s²')); api.set('r2',fmtU(Tm,'s')); api.set('r3',fmtU(dev/DEG,'°')); api.set('r4',fmtU(2*p.m*p.w*p.v,'N'));
        }
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Impulso e potenza ===== */
Lab.register({
  id:'impulso', group:'mech', title:'冲量与功率', it:'Impulso, teorema dell\'impulso e potenza',
  intro:'一个随时间变化的力 F(t) 作用于物体（慢动作）：F–t 图下面积 = 冲量 = 动量变化；功率 P = F·v，P–t 图下面积 = 功 = 动能变化。',
  explain:`<p><b>冲量 (impulso)</b> <b>J</b> = ∫<b>F</b>dt。<b>冲量定理 (teorema dell'impulso)</b>：<b>J</b> = Δ<b>p</b>。同样的冲量，作用时间越长，平均力越小——安全气囊、接球时手后撤都是这个原理。</p>
  <p><b>功率 (potenza)</b> P = dL/dt = <b>F</b>·<b>v</b>，单位瓦特 W = J/s。∫P dt = L = ΔK。注意：冲量相同（动量变化相同）时，初速度不同则做功不同——因为功率与速度有关。</p>
  <p>平均力 F<sub>m</sub> = J/Δt。三种力的形状：矩形 J = F<sub>max</sub>Δt，三角形 J = ½F<sub>max</sub>Δt，半正弦 J = (2/π)F<sub>max</sub>Δt。</p>`,
  formulas:[fm(`<b>J</b> = ∫<b>F</b> dt = Δ<b>p</b> = m<b>v</b><sub>f</sub> − m<b>v</b><sub>i</sub>`,'冲量定理'),fm(`F<sub>media</sub> = ${fr('Δp','Δt')}`,'平均力'),fm(`P = ${fr('dL','dt')} = <b>F</b>·<b>v</b>, &nbsp; L = ∫P dt = ΔK`,'功率'),fm(`1 CV = 735.5 W, &nbsp; 1 kWh = 3.6×10<sup>6</sup> J`)],
  setup(api){
    const p=api.p;
    api.slider('m','质量 m',0.1,5,0.1,0.5,'kg'); api.slider('F','峰值力 F_max',10,500,5,200,'N'); api.slider('dt','作用时间 Δt',0.01,0.5,0.01,0.1,'s');
    api.select('sh','力的形状 · forma',[['rect','矩形 rettangolare'],['tri','三角形 triangolare'],['sin','半正弦 semi-sinusoidale']],'tri');
    api.slider('v0','初速度 v₀',-20,20,0.5,0,'m/s');
    ['J','dp','vf','Fm','W','dK','Pm','Pa'].forEach((k,i)=>api.readout(k,['冲量 J = ∫F dt','动量变化 Δp','末速度 v_f','平均力 F_m = J/Δt','功 W = ∫P dt','动能变化 ΔK','最大功率 P_max','平均功率 W/Δt'][i]));
    const cv=api.canvas(0.3,200), g1=api.graph(0.6,250), g2=api.graph(0.6,250), g3=api.graph(0.6,250);
    let t,v,x,W,hist,Pm;
    const Ft=s=>{ if(s<0||s>p.dt) return 0; const u=s/p.dt; return p.sh==='rect'?p.F:p.sh==='tri'?p.F*(1-Math.abs(2*u-1)):p.F*Math.sin(Math.PI*u); };
    const Jth=()=>p.F*p.dt*(p.sh==='rect'?1:p.sh==='tri'?0.5:2/Math.PI);
    api.anim({reset(){t=-0.25*p.dt;v=p.v0;x=0;W=0;hist=[];Pm=0;}, step(dt){ const T=1.5*p.dt, n=50, h=dt*T/3/n; for(let i=0;i<n&&t<T;i++){ const F1=Ft(t), F2=Ft(t+h/2), F3=Ft(t+h); const dv=h/6*(F1+4*F2+F3)/p.m; const vm=v+dv/2; W+=F2*vm*h; Pm=Math.max(Pm,Math.abs(F2*vm)); v+=dv; x+=vm*h; t+=h; hist.push([t,Ft(t),v,Ft(t)*v]); } if(t>=T) api.pause(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const y=h*0.6, sc=(w-60)/4, X=xx=>30+((xx*20)%4+4)%4*sc;
        line(ctx,0,y+14,w,y+14,'#4b4b53',2); const bx=X(x); circle(ctx,bx,y,14,'#ffb547','#fff');
        const F=Ft(t); if(F>0) arrow(ctx,bx-14-F/p.F*60,y,bx-14,y,'#ff6b6b','F');
        arrow(ctx,bx,y-24,bx+v*4,y-24,'#3ecf8e','v'); text(ctx,`t = ${(t*1000).toFixed(1)} ms（慢动作）`,10,20,'#ececef',13);
        const T=1.5*p.dt, full=[]; for(let s=-0.25*p.dt;s<=T;s+=T/300) full.push([s*1000,Ft(s)]);
        g1.draw({xr:[-0.25*p.dt*1000,T*1000],xlabel:'t (ms)',ylabel:'F (N)',title:'F(t)：面积 = 冲量 J',y0:true,series:[{pts:hist.map(q=>[q[0]*1000,q[1]]),color:'#ff6b6b',fill:true},{pts:full,color:'#ff6b6b66',dash:[4,4],width:1}]});
        g2.draw({xr:[-0.25*p.dt*1000,T*1000],xlabel:'t (ms)',ylabel:'v (m/s)',title:'速度 v(t)',series:[{pts:hist.map(q=>[q[0]*1000,q[2]]),color:'#3ecf8e'}]});
        g3.draw({xr:[-0.25*p.dt*1000,T*1000],xlabel:'t (ms)',ylabel:'P (W)',title:'功率 P = Fv：面积 = 功',y0:true,series:[{pts:hist.map(q=>[q[0]*1000,q[3]]),color:'#c792ea',fill:true}]});
        const J=Jth(), vf=p.v0+J/p.m;
        api.set('J',fmtU(J,'N·s',4)); api.set('dp',fmtU(p.m*(v-p.v0),'kg·m/s',4)); api.set('vf',fmtU(vf,'m/s',4)); api.set('Fm',fmtU(J/p.dt,'N',4));
        api.set('W',fmtU(W,'J',4)); api.set('dK',fmtU(0.5*p.m*(v*v-p.v0*p.v0),'J',4)); api.set('Pm',fmtU(Pm,'W',4)); api.set('Pa',fmtU(W/p.dt,'W',4));
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Lavoro delle forze non conservative ===== */
Lab.register({
  id:'lavoro_nc', group:'mech', title:'非保守力的功：W_nc = ΔE', it:'Lavoro delle forze non conservative — W_nc = ΔE_mecc',
  intro:'物块以初速 v₀ 在粗糙地面上滑行，撞上弹簧再被弹回。摩擦力做负功，机械能减少量恰好等于摩擦力做的功。',
  explain:`<p>把力分成<b>保守力 (conservative)</b>（重力、弹力，可写成势能）与<b>非保守力 (non conservative)</b>（摩擦、空气阻力、人的推力）。由动能定理 L<sub>tot</sub> = ΔK 和 L<sub>cons</sub> = −ΔU 得：</p>
  <p style="text-align:center"><b>L<sub>nc</sub> = ΔK + ΔU = ΔE<sub>mecc</sub></b></p>
  <p>动摩擦力 f = μ<sub>d</sub>mg 方向始终与运动方向相反，所以 L<sub>attr</sub> = −μ<sub>d</sub>mg·s，s 是<em>路程</em>（不是位移！）——来回运动时路程不断累加。读数实时验证 L<sub>nc</sub> 与 ΔE 相等。物块停止后，若弹簧力 ≤ μmg 则保持静止（此处 μ<sub>s</sub> = μ<sub>d</sub>）。</p>`,
  formulas:[fm(`L<sub>nc</sub> = ΔE<sub>mecc</sub> = ΔK + ΔU`),fm(`L<sub>attr</sub> = −μ<sub>d</sub>mg · s`,'s = 路程 percorso'),fm(`U<sub>el</sub> = ${fr(1,2)}kx<sup>2</sup>`),fm(`${fr(1,2)}mv<sub>0</sub><sup>2</sup> = ${fr(1,2)}kx<sub>max</sub><sup>2</sup> + μmg(d + x<sub>max</sub>)`,'最大压缩量满足的方程')],
  setup(api){
    const p=api.p, d0=3;
    api.slider('m','质量 m',0.5,5,0.1,1,'kg'); api.slider('v0','初速度 v₀',1,12,0.1,6,'m/s'); api.slider('mu','动摩擦系数 μ_d',0,0.8,0.01,0.2); api.slider('k','弹簧劲度 k',10,500,5,100,'N/m');
    ['K','U','E','Wnc','dE','s','xm'].forEach((k,i)=>api.readout(k,['动能 K','弹性势能 U','机械能 E','摩擦力的功 L_nc','ΔE = E − E₀','累计路程 s','最大压缩 x_max'][i]));
    const cv=api.canvas(0.32,220), g1=api.graph(0.5,260); let x,v,t,Wnc,s,xm,hist,stopped;
    const comp=()=>Math.max(0,x-d0);
    api.anim({reset(){x=0;v=p.v0;t=0;Wnc=0;s=0;xm=0;hist=[];stopped=false;},
      step(dt){ if(stopped) return; const n=200,h=dt/n, g=G_EARTH; for(let i=0;i<n;i++){ const Fs=-p.k*comp(); let f;
          if(Math.abs(v)<1e-9){ if(Math.abs(Fs)<=p.mu*p.m*g){ v=0; stopped=true; break; } f=-Math.sign(Fs)*p.mu*p.m*g; } else f=-Math.sign(v)*p.mu*p.m*g;
          const a=(Fs+f)/p.m, vn=v+a*h; let dx; if(v!==0&&Math.sign(vn)!==Math.sign(v)){ dx=v*h/2; v=0; } else { dx=(v+vn)/2*h; v=vn; } Wnc+=f*dx; s+=Math.abs(dx); x+=dx; xm=Math.max(xm,comp()); if(x<-0.5){ x=-0.5; v=Math.abs(v)*0; } }
        t+=dt; const K=0.5*p.m*v*v, U=0.5*p.k*comp()**2; hist.push([t,K,U,K+U,Wnc]); if(stopped||t>30) api.pause(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=(w-60)/(d0+1.6), X=xx=>30+(xx+0.5)*sc, y=h*0.62, wallX=X(d0+1);
        ctx.fillStyle='#3a2f24'; ctx.fillRect(10,y,w-20,10); for(let xx=12;xx<w-12;xx+=8) line(ctx,xx,y+10,xx+5,y+16,'#6b5844');
        ctx.fillStyle='#4b4b53'; ctx.fillRect(wallX,y-60,12,60);
        const sl=X(d0)+Math.max(0,comp())*sc; drawSpring(ctx,sl,y-20,wallX,10,8);
        ctx.fillStyle='#4f9dff'; ctx.fillRect(X(x)-36,y-40,36,40);
        if(Math.abs(v)>1e-6) arrow(ctx,X(x)-18,y-50,X(x)-18+v*10,y-50,'#3ecf8e','v');
        if(Math.abs(v)>1e-6&&p.mu>0) arrow(ctx,X(x)-18,y-4,X(x)-18-Math.sign(v)*30,y-4,'#ffb547','f');
        text(ctx,stopped?'已静止':`t = ${t.toFixed(2)} s`,12,22,'#ececef',13);
        g1.draw({xlabel:'t (s)',ylabel:'J',title:'K、U、E 与 L_nc（E₀ + L_nc = E）',legend:true,series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#3ecf8e',label:'K'},{pts:hist.map(q=>[q[0],q[2]]),color:'#4f9dff',label:'U'},{pts:hist.map(q=>[q[0],q[3]]),color:'#ffb547',label:'E'},{pts:hist.map(q=>[q[0],q[4]]),color:'#ff6b6b',label:'L_nc'}]});
        const K=0.5*p.m*v*v, U=0.5*p.k*comp()**2, E0=0.5*p.m*p.v0**2;
        api.set('K',fmtU(K,'J',4)); api.set('U',fmtU(U,'J',4)); api.set('E',fmtU(K+U,'J',4)); api.set('Wnc',fmtU(Wnc,'J',4)); api.set('dE',fmtU(K+U-E0,'J',4)+(Math.abs(K+U-E0-Wnc)<1e-3*E0?' <span class="ok">= L_nc ✓</span>':'')); api.set('s',fmtU(s,'m',4)); api.set('xm',fmtU(xm,'m',4));
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Curva di energia potenziale ===== */
Lab.register({
  id:'potenziale', group:'mech', title:'势能曲线与平衡稳定性', it:'Curva dell\'energia potenziale U(x) — equilibrio e stabilità',
  intro:'一维保守系统：读图就能知道运动范围（E ≥ U 的区域）、转折点 (punti di inversione)、平衡点及其稳定性。',
  explain:`<p>保守力与势能的关系：<b>F(x) = −dU/dx</b>，力总是指向 U 减小的方向。</p>
  <p><b>平衡点 (punti di equilibrio)</b>：F = 0，即 U′ = 0。U″ &gt; 0（极小值）为<b>稳定平衡 (stabile)</b>（实心点），小偏离后来回振动，周期 T = 2π√(m/U″)；U″ &lt; 0（极大值）为<b>不稳定平衡 (instabile)</b>（空心点）。</p>
  <p>机械能 E = K + U，K = E − U ≥ 0，所以质点只能在 U(x) ≤ E 的区域运动（灰色为禁区 regione proibita）；E = U 处速度为零，是<b>转折点</b>。拖动 x₀ 和 v₀ 改变总能量。</p>`,
  formulas:[fm(`F(x) = −${fr('dU','dx')}`),fm(`K = E − U(x) ≥ 0`,'允许区域'),fm(`U′(x<sub>0</sub>) = 0: &nbsp; U″ > 0 稳定, U″ < 0 不稳定`),fm(`T = 2π${sq('m / U″(x<sub>0</sub>)')}`,'小振动周期'),fm(`U<sub>LJ</sub> = 4ε[(σ/x)<sup>12</sup> − (σ/x)<sup>6</sup>]`,'伦纳德-琼斯势（分子间）')],
  setup(api){
    const p=api.p, m=1;
    const U={dw:{f:x=>x**4-4*x*x,d:x=>4*x**3-8*x,dd:x=>12*x*x-8,xr:[-2.4,2.4],name:'双势阱 x⁴ − 4x²'},cub:{f:x=>x**3-3*x,d:x=>3*x*x-3,dd:x=>6*x,xr:[-2.3,2.6],name:'三次 x³ − 3x'},lj:{f:x=>8*((1/x)**12-(1/x)**6),d:x=>8*(-12*x**-13+6*x**-7),dd:x=>8*(156*x**-14-42*x**-8),xr:[0.95,3],name:'伦纳德-琼斯 ε=2 J, σ=1 m'},har:{f:x=>x*x,d:x=>2*x,dd:x=>2,xr:[-2.5,2.5],name:'谐振 x²'}};
    api.select('U','势能 U(x) [J, x in m] · potenziale',Object.entries(U).map(([k,v])=>[k,v.name]),'dw');
    api.slider('x0','初位置 x₀',-2.4,3,0.01,-0.6,'m'); api.slider('v0','初速度 v₀',-4,4,0.05,0,'m/s');
    ['E','x','K','F','eq','tp','T'].forEach((k,i)=>api.readout(k,['总能量 E','位置 x','动能 K','力 F = −U′','平衡点','转折点','小振动周期（最近的稳定点）'][i]));
    const cv=api.canvas(0.52,400), g1=api.graph(0.5,240); let S,t,esc;
    const cur=()=>U[p.U];
    api.anim({reset(){ const u=cur(); S=[clamp(p.x0,u.xr[0]+0.02,u.xr[1]-0.02),p.v0]; t=0; esc=false; },
      step(dt){ if(esc) return; const u=cur(); const n=Math.ceil(dt/0.0005), h=dt/n; for(let i=0;i<n;i++){ S=rk4(S,s=>[s[1],-u.d(s[0])/m],h); if(S[0]<u.xr[0]||S[0]>u.xr[1]){ esc=true; break; } } t+=dt; },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const u=cur(), [a,b]=u.xr, x0=clamp(p.x0,a+0.02,b-0.02), E=u.f(x0)+0.5*m*p.v0**2;
        let mn=Infinity,mx=-Infinity; for(let x=a;x<=b;x+=(b-a)/400){ const y=u.f(x); mn=Math.min(mn,y); mx=Math.max(mx,y); } mx=Math.min(Math.max(mx,E+1),Math.max(E+2,mn+12)); mn-=0.5; 
        const L=46,R=12,T=16,B=26, X=x=>L+(x-a)/(b-a)*(w-L-R), Y=y=>T+(mx-y)/(mx-mn)*(h-T-B);
        ctx.save(); ctx.beginPath(); ctx.rect(L,T,w-L-R,h-T-B); ctx.clip();
        for(let x=a;x<=b;x+=(b-a)/300){ if(u.f(x)>E){ ctx.fillStyle='#ffffff10'; ctx.fillRect(X(x),T,(w-L-R)/300+1,h-T-B); } }
        ctx.strokeStyle='#4f9dff'; ctx.lineWidth=2.5; ctx.beginPath(); for(let x=a,i=0;x<=b;x+=(b-a)/400,i++){ i?ctx.lineTo(X(x),Y(u.f(x))):ctx.moveTo(X(x),Y(u.f(x))); } ctx.stroke();
        line(ctx,L,Y(E),w-R,Y(E),'#ffb547',1.5,[6,4]); text(ctx,'E',w-R-12,Y(E)-5,'#ffb547',12);
        // equilibria & turning points
        const eqs=[], tps=[]; const N=2000; for(let i=0;i<N;i++){ const x1=a+(b-a)*i/N, x2=a+(b-a)*(i+1)/N; if(Math.sign(u.d(x1))!==Math.sign(u.d(x2))){ const xe=(x1+x2)/2; eqs.push([xe,u.dd(xe)>0]); } if(Math.sign(u.f(x1)-E)!==Math.sign(u.f(x2)-E)) tps.push((x1+x2)/2); }
        for(const [xe,st] of eqs) circle(ctx,X(xe),Y(u.f(xe)),6,st?'#3ecf8e':'#141417','#3ecf8e',2);
        for(const xt of tps) line(ctx,X(xt),Y(E)-8,X(xt),Y(E)+8,'#ff6b6b',2);
        const xb=S[0]; if(!esc){ circle(ctx,X(xb),Y(u.f(xb))-9,8,'#ffb547','#fff'); const F=-u.d(xb); if(Math.abs(F)>0.05) arrow(ctx,X(xb),Y(u.f(xb))-26,X(xb)+clamp(F,-12,12)*6,Y(u.f(xb))-26,'#ff6b6b','F'); }
        ctx.restore(); ctx.strokeStyle='#4b4b53'; ctx.strokeRect(L,T,w-L-R,h-T-B);
        const st=niceStep(b-a,6); for(let v=Math.ceil(a/st)*st; v<=b; v+=st) text(ctx,tickLabel(v,st),X(v),h-8,'#a1a1aa',11.5,'center');
        const sy=niceStep(mx-mn,5); for(let v=Math.ceil(mn/sy)*sy; v<=mx; v+=sy) text(ctx,tickLabel(v,sy),L-5,Y(v)+4,'#a1a1aa',11.5,'right');
        text(ctx,'U (J)',L+4,T+12,'#d4d4d8',12); if(esc) text(ctx,'质点已离开显示范围（未被束缚）',L+10,T+30,'#ffb547',13);
        const fc=[]; for(let x=a;x<=b;x+=(b-a)/300) fc.push([x,-u.d(x)]);
        const cl=v=>clamp(v,-30,30); g1.draw({xr:[a,b],yr:[-30,30],xlabel:'x (m)',ylabel:'F (N)',title:'F(x) = −dU/dx（F = 0 处为平衡点）',series:[{pts:fc.map(q=>[q[0],cl(q[1])]),color:'#ff6b6b'}],marks:esc?[]:[{x:xb,y:cl(-u.d(xb)),color:'#ffb547'}],vlines:eqs.map(e=>({x:e[0],color:e[1]?'#3ecf8e':'#9b9ba4'}))});
        let near=null; for(const [xe,s] of eqs) if(s&&(!near||Math.abs(xe-xb)<Math.abs(near-xb))) near=xe;
        api.set('E',fmtU(E,'J',4)); api.set('x',esc?'—':fmtU(xb,'m',4)); api.set('K',esc?'—':fmtU(0.5*m*S[1]**2,'J',4)); api.set('F',esc?'—':fmtU(-u.d(xb),'N',4));
        api.set('eq',eqs.map(e=>`${fmt(e[0],3)} m ${e[1]?'稳定':'不稳定'}`).join('；')||'无'); api.set('tp',tps.map(x=>fmt(x,3)+' m').join('，')||'无（不被束缚）');
        api.set('T',near!==null?fmtU(TAU*Math.sqrt(m/u.dd(near)),'s',4)+` (x = ${fmt(near,3)})`:'—');
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Moto dei razzi ===== */
Lab.register({
  id:'razzo', group:'mech', title:'变质量系统：火箭运动', it:'Moto dei razzi — sistemi a massa variabile, equazione di Tsiolkovsky',
  intro:'火箭以恒定质量流率喷出燃气（相对火箭速度 u）。质量不断减小，所以即使推力不变加速度也越来越大。',
  explain:`<p>火箭+燃气系统的总动量守恒（无外力时）。对火箭写出：m dv/dt = u|dm/dt| − mg，其中 <b>推力 (spinta)</b> T = u|dm/dt|。</p>
  <p>无重力时积分得<b>齐奥尔科夫斯基方程 (equazione del razzo di Tsiolkovsky)</b>：Δv = u ln(m₀/m<sub>f</sub>)。速度增量取决于喷气速度和<em>质量比</em>，与燃烧快慢无关。有重力且竖直发射时还要减去 g·t<sub>b</sub>（重力损失）——燃烧越慢损失越大。</p>
  <p>起飞条件：T &gt; m₀g，否则火箭停在发射台上。燃料耗尽后火箭做竖直上抛，直到最高点。</p>`,
  formulas:[fm(`m${fr('dv','dt')} = u${fr('|dm|','dt')} − mg`,'变质量运动方程'),fm(`T = u·|ṁ|`,'推力 spinta'),fm(`Δv = u ln${fr('m<sub>0</sub>','m<sub>f</sub>')} − g t<sub>b</sub>`,'Tsiolkovsky（含重力损失）'),fm(`h<sub>max</sub> = h<sub>b</sub> + ${fr('v<sub>b</sub><sup>2</sup>','2g')}`,'燃尽后上抛')],
  setup(api){
    const p=api.p;
    api.slider('m0','起飞总质量 m₀',100,5000,50,1000,'kg'); api.slider('ff','燃料比例 m_fuel/m₀',0.1,0.95,0.01,0.8);
    api.slider('u','喷气速度 u <i>(velocità di scarico)</i>',500,4500,50,2500,'m/s'); api.slider('tb','燃烧时间 t_b',5,200,1,60,'s');
    api.checkbox('grav','考虑重力（竖直发射）',true);
    ['T','a0','vth','v','h','hm','st'].forEach((k,i)=>api.readout(k,['推力 T = u|ṁ|','起飞加速度 a₀','理论 Δv（燃尽时）','当前速度 v','当前高度 h','理论最高点 h_max','状态'][i]));
    const cv=api.canvas(0.5,400), g1=api.graph(0.6,250), g2=api.graph(0.6,250); let t,v,h,hist,state;
    const P=()=>{ const mf=p.m0*(1-p.ff), mdot=p.m0*p.ff/p.tb, T=p.u*mdot, g=p.grav?G_EARTH:0; return {mf,mdot,T,g}; };
    const theory=()=>{ const q=P(); const vb=p.u*Math.log(p.m0/q.mf)-q.g*p.tb; // burnout altitude: integral
      const hb=p.u*p.tb-p.u*(q.mf*p.tb/(p.m0-q.mf))*Math.log(p.m0/q.mf)-0.5*q.g*p.tb*p.tb; return {vb,hb,hm:q.g>0?hb+vb*vb/(2*q.g):Infinity}; };
    api.anim({reset(){t=0;v=0;h=0;hist=[];state='点火 accensione';}, speeds:[1,2,5,10],
      step(dt){ const q=P(); const n=40, hh=dt/n; for(let i=0;i<n;i++){ const burning=t<p.tb, m=burning?p.m0-q.mdot*t:q.mf; let a=(burning?q.T/m:0)-q.g;
          if(h<=0&&v<=0&&a<0){ a=0; v=0; } v+=a*hh; h+=v*hh; if(h<0){h=0;} t+=hh; }
        const burning=t<p.tb; state=burning?(q.T<=p.m0*q.g&&h===0?'推力不足，无法起飞':'燃烧中 combustione'):(v>0?'惯性上升 volo balistico':'到达最高点 apogeo');
        hist.push([t,v,burning?p.m0-q.mdot*t:q.mf,h]); if((!burning&&v<=0&&q.g>0)||t>3*p.tb+600) api.pause(); },
      draw(){
        const {ctx,w,h:H}=cv; clear(ctx,w,H); const th=theory(), q=P(); const hmax=isFinite(th.hm)?Math.max(th.hm,1):Math.max(h,1)*1.3, sc=(H-60)/hmax, gy=H-20;
        line(ctx,0,gy,w,gy,'#4b4b53',2); const rx=w*0.3, ry=gy-h*sc;
        if(t<p.tb && !(q.T<=p.m0*q.g&&h===0)){ ctx.fillStyle='#ffb547'; ctx.beginPath(); ctx.moveTo(rx-7,ry); ctx.lineTo(rx+7,ry); ctx.lineTo(rx,ry+22+Math.random()*10); ctx.fill(); }
        ctx.fillStyle='#ececef'; ctx.fillRect(rx-7,ry-40,14,40); ctx.beginPath(); ctx.moveTo(rx-7,ry-40); ctx.lineTo(rx,ry-54); ctx.lineTo(rx+7,ry-40); ctx.fill();
        const fuel=t<p.tb?1-t/p.tb:0; ctx.fillStyle='#ff6b6b'; ctx.fillRect(rx-5,ry-38+(36*(1-fuel)),10,36*fuel);
        for(let k=0;k<=4;k++){ const y=gy-(H-60)*k/4; line(ctx,w*0.5,y,w*0.5+8,y,'#9b9ba4'); text(ctx,fmt(hmax*k/4/1000,3)+' km',w*0.5+12,y+4,'#9b9ba4',11.5); }
        text(ctx,state,12,22,'#ffb547',14); text(ctx,`t = ${fmt(t,4)} s`,12,42,'#ececef',13);
        g1.draw({xlabel:'t (s)',ylabel:'v (m/s)',title:'速度 v(t)（燃尽处斜率最大）',series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#3ecf8e'}],vlines:[{x:p.tb,label:'t_b'}]});
        g2.draw({xlabel:'t (s)',ylabel:'m (kg)',title:'质量 m(t)',y0:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#c792ea'}]});
        api.set('T',fmtU(q.T,'N',4)); api.set('a0',fmtU(q.T/p.m0-q.g,'m/s²',4)); api.set('vth',q.T<=p.m0*q.g?'—':fmtU(th.vb,'m/s',4)+(q.g?' (含 −g t_b)':''));
        api.set('v',fmtU(v,'m/s',4)); api.set('h',fmtU(h/1000,'km',4)); api.set('hm',q.T<=p.m0*q.g?'—':(isFinite(th.hm)?fmtU(th.hm/1000,'km',4):'∞（无重力）')); api.set('st',state);
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Urti con corpo rigido ===== */
Lab.register({
  id:'urto_rigido', group:'mech', title:'质点与刚体的碰撞', it:'Urti tra punto materiale e corpo rigido — conservazione del momento angolare',
  intro:'子弹水平射入悬挂在转轴上的均匀细杆。转轴对系统施加冲击力，所以线动量不守恒，但对转轴的角动量守恒。',
  explain:`<p>碰撞时间极短，重力的冲量可忽略；但<b>转轴 (perno)</b> 会提供很大的冲击力，所以系统<b>线动量 (quantità di moto)</b> 一般<em>不守恒</em>。转轴的力对转轴本身力矩为零，所以<b>对转轴的角动量 (momento angolare rispetto al perno)</b> 守恒：mvd = I<sub>tot</sub>ω。</p>
  <p>完全非弹性（子弹嵌入）：I<sub>tot</sub> = ML²/3 + md²，动能有损失。弹性碰撞时还满足动能守恒。碰撞后杆像<b>复摆 (pendolo fisico)</b> 一样摆起，最大角度由能量守恒求出。</p>
  <p><b>打击中心 (centro di percussione)</b>：d = 2L/3 时转轴冲量为零——此时线动量也守恒（棒球棍的"甜点"）。</p>`,
  formulas:[fm(`m v d = (I<sub>asta</sub> + m d<sup>2</sup>) ω`,'对转轴角动量守恒（嵌入）'),fm(`I<sub>asta</sub> = ${fr(1,3)}ML<sup>2</sup>`,'细杆绕端点'),fm(`${fr(1,2)}I<sub>tot</sub>ω<sup>2</sup> = (M${fr('L','2')} + md) g (1 − cosθ<sub>max</sub>)`,'摆起高度'),fm(`J<sub>perno</sub> = p<sub>dopo</sub> − p<sub>prima</sub>, &nbsp; = 0 ⇔ d = ${fr('2L',3)}`,'打击中心')],
  setup(api){
    const p=api.p, L=1;
    api.select('ty','碰撞类型 · tipo di urto',[['in','完全非弹性（嵌入）· anelastico'],['el','弹性 · elastico']],'in');
    api.slider('M','杆的质量 M（L = 1 m）',0.5,5,0.1,2,'kg'); api.slider('m','子弹质量 m',0.01,1,0.01,0.1,'kg'); api.slider('v','子弹速度 v',1,60,0.5,20,'m/s'); api.slider('d','撞击点到转轴距离 d',0.1,1,0.01,0.8,'m');
    ['w','L0','L1','p0','p1','J','K','th'].forEach((k,i)=>api.readout(k,['碰后角速度 ω','碰前角动量 mvd','碰后角动量 Iω (+ mv′d)','碰前线动量 mv','碰后线动量','转轴冲量 J_perno','动能 碰前 → 碰后','最大摆角 θ_max'][i]));
    const cv=api.canvas(0.6,440), g1=api.graph(0.5,240); let t,phase,th,om,xb,hist,res;
    const solve=()=>{ const I=p.M*L*L/3, g=G_EARTH;
      if(p.ty==='in'){ const It=I+p.m*p.d*p.d, w=p.m*p.v*p.d/It, pa=(p.M*L/2+p.m*p.d)*w, K1=0.5*It*w*w, MgH=(p.M*L/2+p.m*p.d)*g; const c=1-K1/MgH; return {I:It,w,vb:null,pa,K1,MgH,thm:c<-1?null:Math.acos(c)}; }
      const w=2*p.m*p.v*p.d/(I+p.m*p.d*p.d), vb=p.v*(p.m*p.d*p.d-I)/(I+p.m*p.d*p.d), pa=p.M*L/2*w+p.m*vb, K1=0.5*I*w*w+0.5*p.m*vb*vb, MgH=p.M*L/2*g, c=1-0.5*I*w*w/MgH; return {I,w,vb,pa,K1,MgH,thm:c<-1?null:Math.acos(c)}; };
    api.anim({reset(){t=0;phase=0;th=0;om=0;xb=-0.9;hist=[];res=solve();}, speeds:[0.25,0.5,1],
      step(dt){ t+=dt; if(phase===0){ xb+=Math.min(p.v,3)*dt; if(xb>=0){ phase=1; om=res.w; xb=0; } }
        else { const n=20,h=dt/n; for(let i=0;i<n;i++){ const al=-res.MgH*Math.sin(th)/res.I; om+=al*h; th+=om*h; } if(res.vb!==null) xb+=res.vb*dt*0.3; hist.push([t,th/DEG]); if(hist.length>1500) hist.shift(); } },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=Math.min(h-60,w*0.6)/1.25, px=w*0.55, py=34;
        ctx.fillStyle='#4b4b53'; ctx.fillRect(px-40,py-14,80,8); circle(ctx,px,py,6,'#fff');
        const ex=px+Math.sin(th)*L*sc, ey=py+Math.cos(th)*L*sc; ctx.strokeStyle='#c9a46a'; ctx.lineWidth=10; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(ex,ey); ctx.stroke(); ctx.lineCap='butt';
        const dx=px+Math.sin(th)*p.d*sc, dy=py+Math.cos(th)*p.d*sc;
        const cp=py+2/3*L*sc; line(ctx,px-20,cp,px+20,cp,'#3ecf8e88',1,[3,3]); text(ctx,'2L/3',px+24,cp+4,'#3ecf8e',11.5);
        if(phase===0||res.vb!==null){ const bx=phase===0?px+xb*sc:px+xb*sc, by=phase===0?py+p.d*sc:py+p.d*sc; circle(ctx,bx,by,5,'#ff6b6b'); if(phase===0) arrow(ctx,bx-40,by,bx-8,by,'#ff6b6b','v'); }
        if(phase===1&&res.vb===null) circle(ctx,dx,dy,5,'#ff6b6b');
        if(phase===0) line(ctx,0,py+p.d*sc,px,py+p.d*sc,'#ff6b6b33',1,[2,4]);
        if(res.thm===null) text(ctx,'杆会转过最高点做整圈转动 (giro completo)',12,h-12,'#ffb547',13);
        g1.draw({xlabel:'t (s)',ylabel:'θ (°)',title:'摆角 θ(t)',y0:true,series:[{pts:hist,color:'#c9a46a'}]});
        const r=res, Kb=0.5*p.m*p.v*p.v, Lb=p.m*p.v*p.d, La=r.vb===null?r.I*r.w:r.I*r.w+p.m*r.vb*p.d;
        api.set('w',fmtU(r.w,'rad/s',4)); api.set('L0',fmtU(Lb,'kg·m²/s',4)); api.set('L1',fmtU(La,'kg·m²/s',4)); api.set('p0',fmtU(p.m*p.v,'kg·m/s',4)); api.set('p1',fmtU(r.pa,'kg·m/s',4));
        api.set('J',fmtU(r.pa-p.m*p.v,'N·s',4)); api.set('K',`${fmt(Kb,4)} → ${fmt(r.K1,4)} J`); api.set('th',r.thm===null?'> 180°（整圈）':fmtU(r.thm/DEG,'°',4));
      }});
    api.onChange(()=>{ api.A.reset(); api.play(); });
  }
});

/* ===== Pattinatore ===== */
Lab.register({
  id:'pattinatore', group:'mech', title:'角动量守恒：花样滑冰', it:'Conservazione del momento angolare — la pattinatrice',
  intro:'滑冰者收拢手臂时转动惯量减小、转速增大；伸开时变慢。冰面摩擦忽略不计，对转轴外力矩为零。',
  explain:`<p>冰面几乎无摩擦，重力和支持力通过转轴、力矩为零，所以<b>角动量 (momento angolare)</b> L = Iω 守恒。</p>
  <p>模型：身体是 I<sub>corpo</sub> = 1.0 kg·m² 的圆柱，两臂各等效为 4 kg 的质点，距轴 r。收臂 r 变小 ⇒ I 变小 ⇒ ω 变大。</p>
  <p>转动动能 K = L²/(2I) 却<em>增大</em>了——多出来的能量来自滑冰者手臂肌肉做的功（向内拉手臂克服"离心"效应）。点击"自动收放"观察 ω 和 K 的变化。</p>`,
  formulas:[fm(`L = Iω = cost. &nbsp; ⇒ &nbsp; I<sub>1</sub>ω<sub>1</sub> = I<sub>2</sub>ω<sub>2</sub>`),fm(`I = I<sub>corpo</sub> + 2m<sub>b</sub>r<sup>2</sup>`),fm(`K = ${fr(1,2)}Iω<sup>2</sup> = ${fr('L<sup>2</sup>','2I')}`),fm(`L<sub>muscoli</sub> = ΔK = ${fr('L<sup>2</sup>',2)}(${fr(1,'I<sub>2</sub>')} − ${fr(1,'I<sub>1</sub>')})`,'手臂做的功')],
  setup(api){
    const p=api.p, Ib=1.0, mb=4;
    api.slider('r','手臂等效半径 r',0.15,0.9,0.01,0.8,'m'); api.slider('w0','初始角速度 ω₀（在 r = 0.8 m 时）',0.5,6,0.1,2,'rad/s');
    api.checkbox('auto','自动收放手臂 (automatico)',true);
    ['I','w','rpm','L','K','W'].forEach((k,i)=>api.readout(k,['转动惯量 I','角速度 ω','转速','角动量 L（守恒）','转动动能 K','手臂做功 ΔK（相对 r = 0.8 m）'][i]));
    const cv=api.canvas(0.55,400), g1=api.graph(0.6,250), g2=api.graph(0.6,250); let t,phi,L,r,hist;
    const I=rr=>Ib+2*mb*rr*rr;
    api.anim({reset(){t=0;phi=0;L=I(0.8)*p.w0;r=p.r;hist=[];}, step(dt){ t+=dt; if(p.auto){ r=0.525+0.375*Math.cos(t*0.8); api.ctrl.r.set(+r.toFixed(2)); } else r=p.r; const om=L/I(r); phi+=om*dt; hist.push([t,om,L*L/(2*I(r)),I(r)]); if(hist.length>1200) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const cx=w*0.3, gy=h-30, sc=(h-80)/2.0;
        ctx.fillStyle='#16324f'; ctx.beginPath(); ctx.ellipse(cx,gy,w*0.22,16,0,0,TAU); ctx.fill();
        const top=gy-1.75*sc, sh=gy-1.4*sc; circle(ctx,cx,top,0.11*sc,null,'#ececef',3); line(ctx,cx,top+0.11*sc,cx,gy-0.9*sc,'#ececef',4);
        line(ctx,cx,gy-0.9*sc,cx-0.12*sc,gy,'#ececef',4); line(ctx,cx,gy-0.9*sc,cx+0.1*sc,gy-0.45*sc,'#ececef',4);
        const ax=r*sc*Math.cos(phi); line(ctx,cx-ax,sh,cx+ax,sh,'#ffb547',4); circle(ctx,cx-ax,sh,7,'#ff6b6b'); circle(ctx,cx+ax,sh,7,'#ff6b6b');
        line(ctx,cx,top-30,cx,gy+10,'#ffffff30',1,[4,4]);
        // top view
        const tx=w*0.75, ty=h/2, R=Math.min(w*0.2,h*0.4), k=R/0.9; circle(ctx,tx,ty,R,null,'#26262b'); circle(ctx,tx,ty,0.17*k,'#4b4b53');
        const ex=Math.cos(phi), ey=Math.sin(phi); line(ctx,tx-ex*r*k,ty-ey*r*k,tx+ex*r*k,ty+ey*r*k,'#ffb547',4); circle(ctx,tx+ex*r*k,ty+ey*r*k,8,'#ff6b6b'); circle(ctx,tx-ex*r*k,ty-ey*r*k,8,'#ff6b6b');
        text(ctx,'俯视图 vista dall\'alto',tx,ty-R-8,'#9b9ba4',12,'center');
        g1.draw({xlabel:'t (s)',ylabel:'ω (rad/s)',title:'角速度 ω(t)',series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff'}]});
        g2.draw({xlabel:'t (s)',ylabel:'K (J)',title:'转动动能 K(t)（不守恒！）',series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#ffb547'}]});
        const om=L/I(r); api.set('I',fmtU(I(r),'kg·m²',4)); api.set('w',fmtU(om,'rad/s',4)); api.set('rpm',fmtU(om*60/TAU,'giri/min',4)); api.set('L',fmtU(L,'kg·m²/s',4)); api.set('K',fmtU(L*L/(2*I(r)),'J',4)); api.set('W',fmtU(L*L/2*(1/I(r)-1/I(0.8)),'J',4));
      }});
    api.onChange(k=>{ if(k==='r'&&!p.auto) return; if(k==='w0'){ L=I(0.8)*p.w0; } });
  }
});

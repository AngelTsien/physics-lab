'use strict';
/* ===== 6. Funi e carrucole (Atwood) ===== */
Lab.register({
  id:'atwood', group:'mech', title:'绳与滑轮：阿特伍德机', it:'Sistemi di corpi — funi, carrucole, macchina di Atwood',
  intro:'通过轻绳连接的物体有相同的加速度大小；滑轮有质量时还要考虑它的转动惯量。',
  explain:`<p>对每个物体分别写牛顿第二定律，再用"绳不可伸长 (fune inestensibile)"的约束把加速度联系起来。</p>
  <p><b>阿特伍德机 (macchina di Atwood)</b>：两物体挂在滑轮两侧。若滑轮无质量，两侧<b>张力 (tensione)</b> 相等；若滑轮是质量 M 的均匀圆盘 (I = ½MR²)，两侧张力不同，差值提供使滑轮转动的力矩。</p>
  <p><b>桌面模式</b>：m₁ 在水平桌面上（动摩擦 μ），m₂ 竖直悬挂。若 m₂g ≤ μm₁g 系统保持静止（此处简化为 μ<sub>s</sub> = μ<sub>d</sub>）。</p>`,
  formulas:[fm(`a = ${fr('(m<sub>2</sub> − m<sub>1</sub>) g','m<sub>1</sub> + m<sub>2</sub> + M/2')}`,'阿特伍德机（M = 滑轮质量，均匀圆盘）'),fm(`T<sub>1</sub> = m<sub>1</sub>(g + a), &nbsp; T<sub>2</sub> = m<sub>2</sub>(g − a)`),fm(`(T<sub>2</sub> − T<sub>1</sub>)R = Iα = ${fr(1,2)}MR<sup>2</sup>${fr('a','R')}`,'滑轮的转动方程'),fm(`a = ${fr('m<sub>2</sub>g − μm<sub>1</sub>g','m<sub>1</sub> + m<sub>2</sub> + M/2')}`,'桌面模式'),fm(`T = ${fr('2m<sub>1</sub>m<sub>2</sub>g','m<sub>1</sub> + m<sub>2</sub>')}`,'无质量滑轮时')],
  setup(api){
    const p=api.p;
    api.select('mode','装置 · configurazione',[['atw','阿特伍德机 · Atwood'],['tav','桌面 + 悬挂 · massa sul tavolo']],'atw');
    api.slider('m1','m₁ <i>(massa 1)</i>',0.1,10,0.1,2,'kg');
    api.slider('m2','m₂ <i>(massa 2)</i>',0.1,10,0.1,3,'kg');
    api.slider('M','滑轮质量 M <i>(massa carrucola)</i>',0,10,0.1,0,'kg');
    api.slider('mu','动摩擦系数 μ（桌面模式）',0,1,0.01,0.2);
    ['a','T1','T2','v','y','t'].forEach((k,i)=>api.readout(k,['加速度 a','张力 T₁','张力 T₂','速度 v','位移','时间 t'][i]));
    const cv=api.canvas(0.62,440), g1=api.graph(); let y,v,t,hist;
    const acc=()=>{const g=G_EARTH,den=p.m1+p.m2+p.M/2; if(p.mode==='atw') return (p.m2-p.m1)*g/den; const drive=p.m2*g, fr=p.mu*p.m1*g; return drive>fr?(drive-fr)/den:0;};
    api.anim({reset(){y=0;v=0;t=0;hist=[];}, step(dt){const a=acc(); v+=a*dt; y+=v*dt; t+=dt; const lim=p.mode==='atw'?1.5:1.6; if(Math.abs(y)>=lim){y=Math.sign(y)*lim; api.pause();} hist.push([t,v]);},
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const a=acc(), g=G_EARTH, sc=Math.min(h/4.6,90);
        let T1,T2; if(p.mode==='atw'){T1=p.m1*(g+a);T2=p.m2*(g-a);} else {T1=p.m1*a+p.mu*p.m1*g*(a>0?1:0); if(a===0) T1=p.m2*g; T2=p.m2*(g-a);}
        const R=34, ang=y/0.3;
        const box=(x,yy,m,c,l)=>{const s=22+Math.cbrt(m)*14; ctx.fillStyle=c; ctx.fillRect(x-s/2,yy,s,s); text(ctx,l,x,yy+s/2+5,'#fff',13,'center'); return s;};
        if(p.mode==='atw'){
          const px=w/2, py=50; ctx.fillStyle='#4b4b53'; ctx.fillRect(px-60,10,120,8); line(ctx,px,18,px,py,'#4b4b53',3);
          const y1=py+1.7*sc - y*sc, y2=py+1.7*sc + y*sc;
          line(ctx,px-R,py,px-R,y1,'#ddd',2); line(ctx,px+R,py,px+R,y2,'#ddd',2);
          circle(ctx,px,py,R,'#2e2e34','#9b9ba4',3); for(let i=0;i<3;i++){const q=ang+i*TAU/3; line(ctx,px,py,px+R*Math.cos(q),py+R*Math.sin(q),'#9b9ba4',2);}
          const s1=box(px-R,y1,p.m1,'#4f9dff','m₁'), s2=box(px+R,y2,p.m2,'#ffb547','m₂');
          const k=60/Math.max(p.m1,p.m2)/g;
          arrow(ctx,px-R-30,y1+s1/2,px-R-30,y1+s1/2-T1*k,'#3ecf8e','T₁'); arrow(ctx,px-R-30,y1+s1/2,px-R-30,y1+s1/2+p.m1*g*k,'#ff6b6b','m₁g');
          arrow(ctx,px+R+30,y2+s2/2,px+R+30,y2+s2/2-T2*k,'#3ecf8e','T₂'); arrow(ctx,px+R+30,y2+s2/2,px+R+30,y2+s2/2+p.m2*g*k,'#ff6b6b','m₂g');
          line(ctx,0,h-12,w,h-12,'#4b4b53',2);
        } else {
          const tx=w*0.62, ty=h*0.38; ctx.fillStyle='#2a2a30'; ctx.fillRect(20,ty,tx-20,h-ty); line(ctx,20,ty,tx,ty,'#9b9ba4',2);
          const px=tx+R*0.2, py=ty-R*0.9; circle(ctx,px,py,R,'#2e2e34','#9b9ba4',3); for(let i=0;i<3;i++){const q=ang+i*TAU/3; line(ctx,px,py,px+R*Math.cos(q),py+R*Math.sin(q),'#9b9ba4',2);}
          const x1=tx-2.6*sc + y*sc, s1=22+Math.cbrt(p.m1)*14; const y2=py+0.6*sc+y*sc;
          line(ctx,x1+s1/2,ty-s1/2,px,ty-s1/2,'#ddd',2); line(ctx,px+R,py,px+R,y2,'#ddd',2);
          box(x1,ty-s1,p.m1,'#4f9dff','m₁'); box(px+R,y2,p.m2,'#ffb547','m₂');
          const k=60/Math.max(p.m1,p.m2)/g;
          arrow(ctx,x1+s1/2,ty-s1/2,x1+s1/2+T1*k,ty-s1/2,'#3ecf8e','T₁'); if(p.mu>0) arrow(ctx,x1-s1/2,ty-4,x1-s1/2-(a>0?p.mu*p.m1*g:Math.min(p.m2*g,p.mu*p.m1*g))*k,ty-4,'#ffb547','f');
          if(a===0) text(ctx,'静止：m₂g ≤ μm₁g',30,30,'#3ecf8e',14);
        }
        g1.draw({xlabel:'t (s)',ylabel:'v (m/s)',title:'速度 v(t)（斜率 = a）',y0:true,series:[{pts:hist,color:'#4f9dff'}]});
        api.set('a',fmtU(a,'m/s²')); api.set('T1',fmtU(T1,'N')); api.set('T2',fmtU(T2,'N')); api.set('v',fmtU(v,'m/s')); api.set('y',fmtU(y,'m')); api.set('t',fmtU(t,'s'));
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 7. Lavoro ed energia ===== */
Lab.register({
  id:'energia', group:'mech', title:'功与能量守恒', it:'Lavoro, energia cinetica e potenziale, conservazione',
  intro:'小球沿轨道无滑动地滑行：动能与势能相互转化；有阻力时机械能转化为内能（热）。',
  explain:`<p><b>动能定理 (teorema dell'energia cinetica)</b>：合力做的功 = 动能变化 L = ΔK。</p>
  <p><b>保守力 (forza conservativa)</b>（如重力、弹力）做功与路径无关，可以定义<b>势能 (energia potenziale)</b> U，L<sub>cons</sub> = −ΔU。只有保守力做功时，<b>机械能 (energia meccanica)</b> E = K + U <em>守恒</em>。</p>
  <p>开启阻力（非保守力 forza non conservativa）后，E 逐渐减少，减少的部分变成热量。<b>功率 (potenza)</b> P = dL/dt = <b>F</b>·<b>v</b>；图中显示重力的瞬时功率。</p>`,
  formulas:[fm(`K = ${fr(1,2)}mv<sup>2</sup>, &nbsp; U<sub>g</sub> = mgh, &nbsp; U<sub>el</sub> = ${fr(1,2)}kx<sup>2</sup>`),fm(`L = ∫<b>F</b>·d<b>s</b> = ΔK`,'动能定理'),fm(`E = K + U = cost.`,'只有保守力时'),fm(`ΔE<sub>mecc</sub> = L<sub>non cons</sub>`,'非保守力做功'),fm(`P = ${fr('dL','dt')} = <b>F</b>·<b>v</b> &nbsp; [W]`,'功率 potenza'),fm(`v = ${sq('2g(h<sub>0</sub> − h)')}`,'无摩擦时任意高度的速率')],
  setup(api){
    const p=api.p;
    const tracks={valle:{f:x=>0.06*x*x,d:x=>0.12*x,dd:x=>0.12,xr:[-9,9]}, doppia:{f:x=>0.006*(x*x-25)**2,d:x=>0.024*x*(x*x-25),dd:x=>0.024*(3*x*x-25),xr:[-8,8]}, colle:{f:x=>4*Math.exp(-x*x/6)+0.05*x*x,d:x=>-4*x/3*Math.exp(-x*x/6)+0.1*x,dd:x=>4*Math.exp(-x*x/6)*(x*x/9-1/3)+0.1,xr:[-9,9]}};
    api.select('tr','轨道形状 · pista',[['valle','U 形 · valle'],['doppia','双势阱 · doppia buca'],['colle','山丘 · collina']],'doppia');
    api.slider('x0','释放位置 x₀ <i>(posizione di rilascio)</i>',-8,8,0.1,-7.5,'m');
    api.slider('m','质量 m <i>(massa)</i>',0.5,10,0.5,2,'kg');
    api.slider('b','阻力系数 b <i>(attrito viscoso)</i>',0,0.5,0.01,0,'s⁻¹');
    ['K','U','E','Q','v','P'].forEach((k,i)=>api.readout(k,['动能 K','势能 U = mgh','机械能 E','热 (dissipata)','速率 v','重力功率 P = mg·v'][i]));
    const cv=api.canvas(0.5,420), g1=api.graph(0.5,260); let x,xd,t,E0,hist;
    const T=()=>tracks[p.tr];
    const accel=(x,xd)=>{const {d,dd}=T(),fp=d(x),fpp=dd(x);return -(G_EARTH*fp+fp*fpp*xd*xd)/(1+fp*fp)-p.b*xd;};
    const energy=()=>{const {f,d}=T(),fp=d(x),v2=xd*xd*(1+fp*fp);return {K:0.5*p.m*v2,U:p.m*G_EARTH*f(x),v:Math.sqrt(v2),P:-p.m*G_EARTH*fp*xd};};
    api.anim({reset(){const xr=T().xr; x=clamp(p.x0,xr[0]+0.01,xr[1]-0.01); xd=0;t=0;hist=[];const e=energy();E0=e.K+e.U;},
      step(dt){const n=20,h=dt/n;for(let i=0;i<n;i++){const k1x=xd,k1v=accel(x,xd),k2x=xd+k1v*h/2,k2v=accel(x+k1x*h/2,k2x),k3x=xd+k2v*h/2,k3v=accel(x+k2x*h/2,k3x),k4x=xd+k3v*h,k4v=accel(x+k3x*h,k4x);x+=h/6*(k1x+2*k2x+2*k3x+k4x);xd+=h/6*(k1v+2*k2v+2*k3v+k4v);
        const xr=T().xr; if(x<xr[0]||x>xr[1]){x=clamp(x,xr[0],xr[1]);xd=-xd*0.0;}} t+=dt; const e=energy(); hist.push([t,e.K,e.U,e.K+e.U]); if(hist.length>1500) hist.shift();},
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const tr=T(), [a,b]=tr.xr; let ymax=0; for(let s=a;s<=b;s+=0.05) ymax=Math.max(ymax,tr.f(s));
        const bw=110, sc=Math.min((w-bw-40)/(b-a),(h-50)/ymax), ox=20, X=s=>ox+(s-a)*sc, Y=yy=>h-25-yy*sc;
        ctx.strokeStyle='#9b9ba4'; ctx.lineWidth=3; ctx.beginPath(); for(let s=a;s<=b;s+=0.05){s===a?ctx.moveTo(X(s),Y(tr.f(s))):ctx.lineTo(X(s),Y(tr.f(s)));} ctx.stroke();
        line(ctx,ox,Y(0),X(b),Y(0),'#4b4b53',1,[3,4]); text(ctx,'h = 0',ox+2,Y(0)+14,'#9b9ba4',11);
        const e=energy(), Etot=e.K+e.U, hE=Etot/(p.m*G_EARTH);
        line(ctx,ox,Y(hE),X(b),Y(hE),'#ffb54788',1,[6,4]); text(ctx,'E/mg',X(b)-36,Y(hE)-4,'#ffb547',11);
        const fp=tr.d(x), nx=-fp/Math.hypot(1,fp), ny=1/Math.hypot(1,fp); const bx=X(x)+nx*10, by=Y(tr.f(x))-ny*10;
        circle(ctx,bx,by,10,'#4f9dff','#fff');
        // energy bars
        const bx0=w-bw+5, top=20, bh=h-50, mx=E0||1, bars=[['K',e.K,'#3ecf8e'],['U',e.U,'#4f9dff'],['Q',Math.max(0,E0-Etot),'#ff6b6b'],['E₀',E0,'#ffb547']];
        bars.forEach((q,i)=>{const hh=bh*q[1]/mx, xx=bx0+i*26; ctx.fillStyle=q[2]; ctx.fillRect(xx,top+bh-hh,20,hh); text(ctx,q[0],xx+10,top+bh+15,'#d4d4d8',12,'center');});
        line(ctx,bx0-4,top+bh,w-4,top+bh,'#4b4b53');
        g1.draw({xlabel:'t (s)',ylabel:'E (J)',title:'能量随时间变化',legend:true,y0:true,series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#3ecf8e',label:'K'},{pts:hist.map(q=>[q[0],q[2]]),color:'#4f9dff',label:'U'},{pts:hist.map(q=>[q[0],q[3]]),color:'#ffb547',label:'E = K+U'}]});
        api.set('K',fmtU(e.K,'J')); api.set('U',fmtU(e.U,'J')); api.set('E',fmtU(Etot,'J',5)); api.set('Q',fmtU(Math.max(0,E0-Etot),'J')); api.set('v',fmtU(e.v,'m/s')); api.set('P',fmtU(e.P,'W'));
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 8. Urti ===== */
Lab.register({
  id:'urti', group:'mech', title:'动量与碰撞、质心', it:'Quantità di moto, urti elastici e anelastici, centro di massa',
  intro:'碰撞前后系统总动量守恒；只有弹性碰撞动能守恒。恢复系数 e：1 = 完全弹性，0 = 完全非弹性（粘在一起）。',
  explain:`<p><b>动量 (quantità di moto)</b> <b>p</b> = m<b>v</b>。孤立系统（无外力）总动量守恒——碰撞时相互作用力是内力。</p>
  <p><b>弹性碰撞 (urto elastico)</b>：动能也守恒。<b>完全非弹性碰撞 (urto completamente anelastico)</b>：碰后共同运动，动能损失最大。恢复系数 e = −(v′₁ₙ − v′₂ₙ)/(v₁ₙ − v₂ₙ)。</p>
  <p><b>质心 (centro di massa)</b>（白色十字）始终以恒定速度 v<sub>CM</sub> 匀速直线运动，不受碰撞影响。二维模式下调节<b>碰撞参数 b (parametro d'urto)</b> 观察斜碰。</p>`,
  formulas:[fm(`m<sub>1</sub><b>v</b><sub>1</sub> + m<sub>2</sub><b>v</b><sub>2</sub> = m<sub>1</sub><b>v</b>′<sub>1</sub> + m<sub>2</sub><b>v</b>′<sub>2</sub>`,'动量守恒'),fm(`v′<sub>1</sub> = ${fr('(m<sub>1</sub> − e m<sub>2</sub>)v<sub>1</sub> + (1+e)m<sub>2</sub>v<sub>2</sub>','m<sub>1</sub> + m<sub>2</sub>')}`,'一维碰撞（v′₂ 同理交换下标）'),fm(`<b>r</b><sub>CM</sub> = ${fr('Σ m<sub>i</sub><b>r</b><sub>i</sub>','Σ m<sub>i</sub>')}, &nbsp; <b>v</b><sub>CM</sub> = ${fr('<b>P</b><sub>tot</sub>','M')}`,'质心'),fm(`ΔK = −${fr(1,2)}${fr('m<sub>1</sub>m<sub>2</sub>','m<sub>1</sub>+m<sub>2</sub>')}(1 − e<sup>2</sup>)(v<sub>1</sub> − v<sub>2</sub>)<sup>2</sup>`,'一维碰撞的动能损失'),fm(`<b>J</b> = Δ<b>p</b> = ∫<b>F</b>dt`,'冲量 impulso')],
  setup(api){
    const p=api.p;
    api.select('mode','模式 · modalità',[['1d','一维 · 1D'],['2d','二维 · 2D (urto obliquo)']],'1d');
    api.slider('m1','m₁',0.5,10,0.5,2,'kg'); api.slider('m2','m₂',0.5,10,0.5,4,'kg');
    api.slider('v1','v₁（初速度）',-5,5,0.1,3,'m/s'); api.slider('v2','v₂（初速度）',-5,5,0.1,-1,'m/s');
    api.slider('e','恢复系数 e <i>(coeff. di restituzione)</i>',0,1,0.05,1);
    const bS=api.slider('b','碰撞参数 b（2D）',0,1.2,0.05,0.5,'m');
    ['p0','p1','K0','K1','dK','vcm','th','ang'].forEach((k,i)=>api.readout(k,['碰前总动量 p','当前总动量 p','碰前动能 K','当前动能 K','动能变化 ΔK','质心速度 v_CM','碰后速度方向 (θ₁, θ₂)','两球速度夹角'][i]));
    const cv=api.canvas(0.42,380), g1=api.graph(), g2=api.graph(); let B,t,hist,P0,K0,cmTrail,hit;
    const rad=m=>0.25+0.12*Math.cbrt(m);
    api.anim({reset(){ const twod=p.mode==='2d', bb=twod?p.b:0; bS.el.style.opacity=twod?1:0.4;
        B=[{m:p.m1,x:-4,y:bb,vx:p.v1,vy:0,r:rad(p.m1),c:'#4f9dff'},{m:p.m2,x:2,y:0,vx:p.v2,vy:0,r:rad(p.m2),c:'#ffb547'}];
        if (p.v1-p.v2<=0) { B[0].x=-2; B[1].x=2; }
        t=0;hist=[];cmTrail=[];hit=false; P0=[p.m1*p.v1+p.m2*p.v2,0]; K0=0.5*p.m1*p.v1**2+0.5*p.m2*p.v2**2; },
      step(dt){ const n=20,h=dt/n; for(let k=0;k<n;k++){ for(const b of B){b.x+=b.vx*h;b.y+=b.vy*h;}
          const [a,b]=B, dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy);
          if(d<a.r+b.r){ const nx=dx/d, ny=dy/d, vr=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
            if(vr>0){ const J=(1+p.e)*vr/(1/a.m+1/b.m); a.vx-=J/a.m*nx; a.vy-=J/a.m*ny; b.vx+=J/b.m*nx; b.vy+=J/b.m*ny; hit=true; }
            if(p.e===0 && p.mode==='1d'){ /* stick: already equal velocities */ } } }
        t+=dt; const M=B[0].m+B[1].m; cmTrail.push([(B[0].m*B[0].x+B[1].m*B[1].x)/M,(B[0].m*B[0].y+B[1].m*B[1].y)/M]);
        hist.push([t,B[0].vx,B[1].vx,B[0].m*B[0].vx+B[1].m*B[1].vx,0.5*B[0].m*(B[0].vx**2+B[0].vy**2)+0.5*B[1].m*(B[1].vx**2+B[1].vy**2)]);
        if(t>12||B.every(b=>Math.abs(b.x)>9||Math.abs(b.y)>5)) api.pause(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=w/16, X=x=>w/2+x*sc, Y=y=>h/2-y*sc;
        line(ctx,0,h/2,w,h/2,'#26262b',1);
        for(let x=-9;x<=9;x++) line(ctx,X(x),h/2-3,X(x),h/2+3,'#3a3a42');
        ctx.strokeStyle='#ffffff55'; ctx.setLineDash([2,4]); ctx.beginPath(); cmTrail.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1]))); ctx.stroke(); ctx.setLineDash([]);
        for(const b of B){ circle(ctx,X(b.x),Y(b.y),b.r*sc,b.c+'cc','#fff',1); arrow(ctx,X(b.x),Y(b.y),X(b.x+b.vx*0.5),Y(b.y+b.vy*0.5),'#fff','',2); text(ctx,b.m+' kg',X(b.x),Y(b.y)+4,'#141417',11,'center'); }
        const M=B[0].m+B[1].m, cx=(B[0].m*B[0].x+B[1].m*B[1].x)/M, cy=(B[0].m*B[0].y+B[1].m*B[1].y)/M;
        line(ctx,X(cx)-8,Y(cy),X(cx)+8,Y(cy),'#fff',2); line(ctx,X(cx),Y(cy)-8,X(cx),Y(cy)+8,'#fff',2); text(ctx,'CM',X(cx)+8,Y(cy)-8,'#fff',11);
        text(ctx,`t = ${t.toFixed(2)} s`+(hit?'  · 已碰撞':''),10,20,'#ececef',13);
        g1.draw({xlabel:'t (s)',ylabel:'vₓ (m/s)',title:'速度 vₓ(t)',legend:true,series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff',label:'v₁ₓ'},{pts:hist.map(q=>[q[0],q[2]]),color:'#ffb547',label:'v₂ₓ'}]});
        g2.draw({xlabel:'t (s)',ylabel:'',title:'总动量 pₓ (kg·m/s) 与总动能 K (J)',legend:true,y0:true,series:[{pts:hist.map(q=>[q[0],q[3]]),color:'#3ecf8e',label:'pₓ'},{pts:hist.map(q=>[q[0],q[4]]),color:'#ff6b6b',label:'K'}]});
        const px=B[0].m*B[0].vx+B[1].m*B[1].vx, py=B[0].m*B[0].vy+B[1].m*B[1].vy, K=0.5*B[0].m*(B[0].vx**2+B[0].vy**2)+0.5*B[1].m*(B[1].vx**2+B[1].vy**2);
        api.set('p0',`(${fmt(P0[0],4)}, 0) kg·m/s`); api.set('p1',`(${fmt(px,4)}, ${fmt(Math.abs(py)<1e-9?0:py,4)}) kg·m/s`); api.set('K0',fmtU(K0,'J',4)); api.set('K1',fmtU(K,'J',4)); api.set('dK',fmtU(K-K0,'J',3));
        api.set('vcm',`(${fmt(px/M)}, ${fmt(Math.abs(py/M)<1e-9?0:py/M)}) m/s`);
        api.set('th',hit?`${fmt(Math.atan2(B[0].vy,B[0].vx)/DEG)}°, ${fmt(Math.atan2(B[1].vy,B[1].vx)/DEG)}°`:'—');
        { const a1=Math.atan2(B[0].vy,B[0].vx), a2=Math.atan2(B[1].vy,B[1].vx); let d=Math.abs(a1-a2)/DEG; if(d>180) d=360-d; api.set('ang',hit&&Math.hypot(B[0].vx,B[0].vy)>1e-6&&Math.hypot(B[1].vx,B[1].vy)>1e-6?fmt(d,4)+'°'+(p.mode==='2d'&&p.e===1&&p.m1===p.m2&&p.v2===0?'（等质量弹性 → 90°）':''):'—'); }
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 9. Corpo rigido ===== */
Lab.register({
  id:'rigido', group:'mech', title:'刚体：转动惯量与角动量', it:'Corpo rigido — momento d\'inerzia, rotolamento, momento angolare',
  intro:'上：不同形状物体沿斜面纯滚动比赛；下：角动量守恒（收拢手臂转得更快）。',
  explain:`<p><b>转动惯量 (momento d'inerzia)</b> I = Σmr² 描述质量离轴的分布。<b>力矩 (momento torcente)</b> τ = r × F，转动定律 τ = Iα（类似 F = ma）。</p>
  <p><b>纯滚动 (rotolamento puro)</b>：v = ωR，静摩擦不做功，机械能守恒，动能 = 平动 + 转动。I/(mR²) 越小，加速越快：实心球 > 圆盘 > 空心球 > 圆环。<em>结果与质量和半径无关！</em>灰色方块为无摩擦滑动作为对比。</p>
  <p><b>角动量守恒 (conservazione del momento angolare)</b>：外力矩为零时 L = Iω 不变。拖动"质量块到轴的距离 r"：I 变小则 ω 变大，转动动能 K = L²/2I 增加（来自拉手臂所做的功）。</p>`,
  formulas:[fm(`τ = rF sinφ = Iα`,'转动第二定律'),fm(`I<sub>anello</sub> = mR², &nbsp; I<sub>disco</sub> = ${fr(1,2)}mR², &nbsp; I<sub>sfera</sub> = ${fr(2,5)}mR², &nbsp; I<sub>guscio</sub> = ${fr(2,3)}mR²`),fm(`a = ${fr('g sinθ','1 + I/(mR<sup>2</sup>)')}`,'纯滚动加速度'),fm(`K = ${fr(1,2)}mv<sup>2</sup> + ${fr(1,2)}Iω<sup>2</sup>`,'滚动动能'),fm(`L = Iω = cost. &nbsp; ⇒ &nbsp; I<sub>1</sub>ω<sub>1</sub> = I<sub>2</sub>ω<sub>2</sub>`,'角动量守恒'),fm(`I = I<sub>CM</sub> + Md<sup>2</sup>`,'平行轴定理 teorema di Huygens-Steiner')],
  setup(api){
    const p=api.p, Ltr=3;
    api.slider('th','斜面倾角 θ',2,45,1,15,'°');
    api.slider('r','质量块到轴的距离 r（下图）',0.1,1,0.01,0.9,'m');
    api.slider('w0','下图初始角速度 ω₀（重置 L）',0.2,3,0.1,1,'rad/s');
    const shapes=[['实心球 sfera',0.4,'#3ecf8e'],['圆盘 disco',0.5,'#4f9dff'],['空心球 guscio',2/3,'#c792ea'],['圆环 anello',1,'#ffb547'],['滑块(无摩擦) blocco',0,'#9b9ba4']];
    shapes.forEach((s,i)=>api.readout('s'+i,s[0]+' t_fondo'));
    api.sep(); ['I','w','L','K'].forEach((k,i)=>api.readout(k,['转动惯量 I','角速度 ω','角动量 L','转动动能 K'][i]));
    const cv=api.canvas(0.48,380), cv2=api.canvas(0.4,300);
    let t, phi, L, mR=2, Irod=1/12*1*2*2; // rod mass 1 kg, length 2 m; masses 2 kg each
    const I=()=>Irod+2*mR*p.r*p.r;
    api.anim({reset(){t=0;phi=0;L=I()*p.w0;}, step(dt){t+=dt;phi+=L/I()*dt;},
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const th=p.th*DEG, g=G_EARTH;
        const Lp=Math.min((w-80)/Math.cos(th),(h-60)/Math.sin(th)), Ax=40, Ay=h-30-Lp*Math.sin(th), Bx=Ax+Lp*Math.cos(th), By=h-30;
        ctx.fillStyle='#2a2a30'; ctx.beginPath(); ctx.moveTo(Ax,Ay); ctx.lineTo(Bx,By); ctx.lineTo(Ax,By); ctx.fill();
        const ux=Math.cos(th), uy=Math.sin(th), nx=Math.sin(th), ny=-Math.cos(th), k=Lp/Ltr, r=14;
        shapes.forEach((s,i)=>{ const a=g*Math.sin(th)/(1+s[1]), T=Math.sqrt(2*Ltr/a), tt=Math.min(t,T), d=0.5*a*tt*tt;
          const cx=Ax+ux*(d*k+r)+nx*r, cy=Ay+uy*(d*k+r)+ny*r;
          if(s[1]===0){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(th); ctx.fillStyle=s[2]+'aa'; ctx.fillRect(-r,-r,2*r,2*r); ctx.restore(); }
          else { const rot=d*k/r; circle(ctx,cx,cy,r,s[1]===1||s[1]>0.6?null:s[2]+'aa',s[2],s[1]>0.6?4:2); if(s[1]>0.6) circle(ctx,cx,cy,r-4,s[2]+'22'); line(ctx,cx,cy,cx+r*Math.cos(rot),cy+r*Math.sin(rot),'#fff',2); }
          text(ctx,s[0].split(' ')[0],w-10,22+i*18,s[2],12,'right');
          if(t>=T) text(ctx,'✓ '+T.toFixed(2)+' s',w-110,22+i*18,s[2],12,'right');
          api.set('s'+i,fmtU(T,'s',4)+` (a = ${fmt(a)})`); });
        if(t>Math.sqrt(2*Ltr/(g*Math.sin(th)/2))+1.5 && t<1e9) {/* race finished */}
        // angular momentum
        const c2=cv2, cx2=c2.w/2, cy2=c2.h/2, s2=(Math.min(c2.w,c2.h)/2-25); clear(c2.ctx,c2.w,c2.h);
        const q=c2.ctx; circle(q,cx2,cy2,s2,null,'#26262b',1);
        const ex=Math.cos(phi), ey=Math.sin(phi); line(q,cx2-ex*s2,cy2-ey*s2,cx2+ex*s2,cy2+ey*s2,'#9b9ba4',4);
        circle(q,cx2,cy2,6,'#fff');
        for(const sg of [1,-1]) circle(q,cx2+sg*ex*p.r*s2,cy2+sg*ey*p.r*s2,12,'#ff6b6b','#fff');
        text(q,'俯视图 vista dall\'alto：杆 (1 kg, 2 m) + 两个 2 kg 质量块',10,18,'#d4d4d8',12);
        const om=L/I(); api.set('I',fmtU(I(),'kg·m²')); api.set('w',fmtU(om,'rad/s')); api.set('L',fmtU(L,'kg·m²/s')); api.set('K',fmtU(L*L/(2*I()),'J'));
      }});
    api.onChange(k=>{ if(k==='r') return; if(k==='w0'){ L=I()*p.w0; return;} t=0; api.play(); });
  }
});

/* ===== 10. Statica ===== */
Lab.register({
  id:'statica', group:'mech', title:'静力学：杠杆平衡', it:'Statica ed equilibrio — la leva',
  intro:'刚体平衡的两个条件：合力为零、对任意点的合力矩为零。',
  explain:`<p><b>平衡条件 (condizioni di equilibrio)</b>：ΣF = 0（不平动）且 Στ = 0（不转动）。</p>
  <p><b>杠杆 (leva)</b>：支点 (fulcro) 两侧"力 × 力臂 (braccio)"相等时平衡。杆本身的重量作用在其中心（重心 baricentro）。</p>
  <p>移动支点或质量块，观察合力矩的正负：不平衡时杆会转向力矩较大的一侧。读数给出使系统平衡所需的 m₂ 位置，以及支点的支持力 R。</p>`,
  formulas:[fm(`Σ<b>F</b> = 0, &nbsp; Σ<b>τ</b> = 0`,'平衡条件'),fm(`m<sub>1</sub>g · b<sub>1</sub> = m<sub>2</sub>g · b<sub>2</sub>`,'杠杆原理（忽略杆重）'),fm(`τ = F · b`,'力矩 = 力 × 力臂'),fm(`R = (m<sub>1</sub> + m<sub>2</sub> + M)g`,'支点支持力（平衡时）')],
  setup(api){
    const p=api.p, Lb=4;
    api.slider('xf','支点位置 <i>(fulcro)</i>',-1.5,1.5,0.05,0,'m');
    api.slider('m1','m₁ <i>(massa 1)</i>',0,20,0.5,6,'kg'); api.slider('d1','m₁ 位置',-2,2,0.05,-1.5,'m');
    api.slider('m2','m₂ <i>(massa 2)</i>',0.5,20,0.5,4,'kg'); api.slider('d2','m₂ 位置',-2,2,0.05,1.5,'m');
    api.slider('M','杆的质量 M <i>(massa asta)</i>',0,20,0.5,2,'kg');
    ['t1','t2','tM','tn','eq','R','need'].forEach((k,i)=>api.readout(k,['m₁ 力矩 τ₁','m₂ 力矩 τ₂','杆重力矩 τ_M','合力矩 Στ','状态','支点支持力 R','平衡所需 m₂ 位置'][i]));
    const cv=api.canvas(0.48,380); let ang=0, om=0;
    const tq=()=>{const g=G_EARTH; return [-p.m1*g*(p.d1-p.xf), -p.m2*g*(p.d2-p.xf), -p.M*g*(0-p.xf)];};
    api.anim({reset(){ang=0;om=0;}, step(dt){ const [a,b,c]=tq(), tn=a+b+c; const Ib=p.m1*(p.d1-p.xf)**2+p.m2*(p.d2-p.xf)**2+p.M*(Lb*Lb/12+p.xf**2)+0.1;
        const lim=12*DEG; const al=(Math.abs(tn)<1e-9?0:tn*Math.cos(ang))/Ib-2*om; om+=al*dt; ang+=om*dt; if(ang>lim){ang=lim;om=0;} if(ang<-lim){ang=-lim;om=0;} if(Math.abs(tn)<1e-9){ ang*=0.95; } },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const sc=(w-60)/Lb, cx=w/2+p.xf*sc, cy=h*0.55;
        ctx.fillStyle='#4b4b53'; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx-22,cy+50); ctx.lineTo(cx+22,cy+50); ctx.fill(); line(ctx,0,cy+50,w,cy+50,'#4b4b53',2);
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-ang);
        ctx.fillStyle='#c9a46a'; ctx.fillRect((-Lb/2-p.xf)*sc,-6,Lb*sc,10);
        for(let x=-2;x<=2;x+=0.5){ ctx.fillStyle='#141417'; ctx.fillRect((x-p.xf)*sc-0.5,-6,1,5); }
        const mbox=(d,m,c,l)=>{ if(m<=0) return; const s=16+Math.cbrt(m)*12, x=(d-p.xf)*sc; ctx.fillStyle=c; ctx.fillRect(x-s/2,-6-s,s,s); ctx.fillStyle='#fff'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText(l,x,-6-s/2+4); arrow(ctx,x,4,x,4+m*3,'#ff6b6b'); };
        mbox(p.d1,p.m1,'#4f9dff','m₁'); mbox(p.d2,p.m2,'#ffb547','m₂');
        if(p.M>0) arrow(ctx,-p.xf*sc,4,-p.xf*sc,4+p.M*3,'#ff6b6b88','Mg');
        ctx.restore();
        const [a,b,c]=tq(), tn=a+b+c, eq=Math.abs(tn)<0.05;
        text(ctx,eq?'平衡 equilibrio':(tn>0?'↺ 逆时针转动':'↻ 顺时针转动'),12,24,eq?'#3ecf8e':'#ffb547',15);
        api.set('t1',fmtU(a,'N·m')); api.set('t2',fmtU(b,'N·m')); api.set('tM',fmtU(c,'N·m')); api.set('tn',fmtU(tn,'N·m'));
        api.set('eq',eq?'<span class="ok">平衡</span>':'<span class="bad">不平衡</span>'); api.set('R',fmtU((p.m1+p.m2+p.M)*G_EARTH,'N'));
        const need=p.xf-(p.m1*(p.d1-p.xf)+p.M*(0-p.xf))/p.m2; api.set('need',Math.abs(need)<=2?fmtU(need,'m'):'超出杆长');
      }});
    api.onChange(()=>{ api.play(); });
  }
});

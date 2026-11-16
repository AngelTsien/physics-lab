'use strict';
/* ===== 1. Cinematica 1D ===== */
Lab.register({
  id:'cinematica', group:'mech', title:'一维运动学', it:'Cinematica in una dimensione',
  intro:'匀速直线运动 (moto rettilineo uniforme) 与匀加速直线运动 (moto uniformemente accelerato)：观察 x–t、v–t、a–t 图像之间的关系。',
  explain:`<p><b>位置 (posizione)</b> x(t)、<b>速度 (velocità)</b> v = dx/dt、<b>加速度 (accelerazione)</b> a = dv/dt。</p>
  <p>匀速运动 (a = 0)：x–t 图是直线，斜率就是速度。匀加速运动：x–t 图是抛物线，v–t 图是直线，<em>v–t 图下的面积 = 位移 (spostamento)</em>，a–t 图下的面积 = 速度变化。</p>
  <p>小车上方的淡色"频闪"点每隔 1 s 记录一次位置：间距相等 ⇒ 匀速；间距均匀增大/减小 ⇒ 匀加速。</p>`,
  formulas:[fm(`x(t) = x<sub>0</sub> + v<sub>0</sub>t + ${fr(1,2)}at<sup>2</sup>`,'位置-时间关系 (legge oraria)'),fm(`v(t) = v<sub>0</sub> + at`,'速度-时间关系'),fm(`v<sup>2</sup> = v<sub>0</sub><sup>2</sup> + 2a(x − x<sub>0</sub>)`,'与时间无关的关系式'),fm(`x(t) = x<sub>0</sub> + vt`,'匀速直线运动 (a = 0)')],
  setup(api){
    const p=api.p, T=10;
    api.select('mode','运动类型 · tipo di moto',[['mrua','匀加速 · uniformemente accelerato'],['mru','匀速 · uniforme']],'mrua');
    api.slider('x0','初位置 x₀ <i>(posizione iniziale)</i>',-20,20,0.5,-10,'m');
    api.slider('v0','初速度 v₀ <i>(velocità iniziale)</i>',-10,10,0.1,6,'m/s');
    const aS=api.slider('a','加速度 a <i>(accelerazione)</i>',-5,5,0.1,-1.5,'m/s²');
    ['t','x','v','a','dx'].forEach((k,i)=>api.readout(k,['时间 t','位置 x','速度 v','加速度 a','位移 Δx (spostamento)'][i]));
    const cv=api.canvas(0.3,220), gx=api.graph(), gv=api.graph(), ga=api.graph();
    let t=0;
    const acc=()=>p.mode==='mru'?0:p.a;
    const X=t=>p.x0+p.v0*t+0.5*acc()*t*t, V=t=>p.v0+acc()*t;
    api.onChange(k=>{ aS.el.style.opacity=p.mode==='mru'?0.4:1; t=0; api.play(); });
    api.anim({reset(){t=0;}, step(dt){ t+=dt; if(t>=T){t=T; api.pause();} },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h);
        let mn=Infinity,mx=-Infinity; for(let s=0;s<=T;s+=0.1){const x=X(s); mn=Math.min(mn,x); mx=Math.max(mx,x);}
        mn=Math.min(mn,-5); mx=Math.max(mx,5); const pad=(mx-mn)*0.08; mn-=pad; mx+=pad;
        const sx=x=>30+(x-mn)/(mx-mn)*(w-60), ry=h*0.62;
        line(ctx,20,ry,w-20,ry,'#4b4b53',2);
        const st=niceStep(mx-mn,8); for(let v=Math.ceil(mn/st)*st; v<=mx; v+=st){ line(ctx,sx(v),ry,sx(v),ry+6,'#4b4b53'); text(ctx,tickLabel(v,st),sx(v),ry+20,'#9b9ba4',11,'center'); }
        text(ctx,'x (m)',w-24,ry+36,'#9b9ba4',11,'right');
        for(let s=0;s<=t+1e-9;s+=1) circle(ctx,sx(X(s)),ry-34,3,'#4f9dff88');
        const cx=sx(X(t)); ctx.fillStyle='#ffb547'; ctx.fillRect(cx-18,ry-26,36,18); circle(ctx,cx-10,ry-5,5,'#ddd'); circle(ctx,cx+10,ry-5,5,'#ddd');
        const vs=V(t), as=acc(); const k=(w-60)/(mx-mn);
        if(Math.abs(vs)>0.01) arrow(ctx,cx,ry-50,cx+vs*k*0.6,ry-50,'#3ecf8e','v');
        if(Math.abs(as)>0.01) arrow(ctx,cx,ry-66,cx+as*k*1.2,ry-66,'#ff6b6b','a');
        text(ctx,`t = ${t.toFixed(2)} s`,12,20,'#ececef',13);
        const full=f=>{const a=[];for(let s=0;s<=T+1e-9;s+=0.05)a.push([s,f(s)]);return a;}, part=f=>{const a=[];for(let s=0;s<=t+1e-9;s+=0.05)a.push([s,f(s)]);a.push([t,f(t)]);return a;};
        gx.draw({xr:[0,T],xlabel:'t (s)',ylabel:'x (m)',title:'x–t 位置',series:[{pts:full(X),color:'#4f9dff',dash:[4,4],width:1},{pts:part(X),color:'#4f9dff'}],marks:[{x:t,y:X(t),color:'#4f9dff'}]});
        gv.draw({xr:[0,T],xlabel:'t (s)',ylabel:'v (m/s)',title:'v–t 速度（面积 = 位移）',y0:true,series:[{pts:part(V),color:'#3ecf8e',fill:true},{pts:full(V),color:'#3ecf8e',dash:[4,4],width:1}],marks:[{x:t,y:V(t),color:'#3ecf8e'}]});
        ga.draw({xr:[0,T],xlabel:'t (s)',ylabel:'a (m/s²)',title:'a–t 加速度',yr:[-5.5,5.5],series:[{pts:part(()=>as),color:'#ff6b6b',fill:true}]});
        api.set('t',fmtU(t,'s')); api.set('x',fmtU(X(t),'m')); api.set('v',fmtU(vs,'m/s')); api.set('a',fmtU(as,'m/s²')); api.set('dx',fmtU(X(t)-p.x0,'m'));
      }});
  }
});

/* ===== 2. Moto del proiettile ===== */
Lab.register({
  id:'proiettile', group:'mech', title:'抛体运动', it:'Moto del proiettile',
  intro:'水平方向匀速、竖直方向匀加速 (−g) 的合成运动。忽略空气阻力。',
  explain:`<p>把运动分解为两个独立的一维运动：<b>水平 (orizzontale)</b> v<sub>x</sub> = v<sub>0</sub>cosθ 不变；<b>竖直 (verticale)</b> v<sub>y</sub> = v<sub>0</sub>sinθ − gt。</p>
  <p>轨迹 (traiettoria) 是抛物线 (parabola)。从地面发射 (h<sub>0</sub>=0) 时，射程 (gittata) 在 θ = 45° 最大，且互余角 (θ 与 90°−θ) 射程相同。灰色虚线为同速 45° 轨迹，便于比较。</p>`,
  formulas:[fm(`x = v<sub>0</sub>cosθ · t, &nbsp; y = h<sub>0</sub> + v<sub>0</sub>sinθ · t − ${fr(1,2)}gt<sup>2</sup>`),fm(`R = ${fr('v<sub>0</sub><sup>2</sup> sin2θ','g')}`,'射程 gittata（h₀ = 0）'),fm(`h<sub>max</sub> = h<sub>0</sub> + ${fr('v<sub>0</sub><sup>2</sup>sin<sup>2</sup>θ','2g')}`,'最大高度 altezza massima'),fm(`t<sub>volo</sub> = ${fr('v<sub>0</sub>sinθ + '+sq('v<sub>0</sub><sup>2</sup>sin<sup>2</sup>θ + 2gh<sub>0</sub>'),'g')}`,'飞行时间 tempo di volo')],
  setup(api){
    const p=api.p;
    api.slider('v0','初速度 v₀ <i>(velocità iniziale)</i>',1,40,0.5,20,'m/s');
    api.slider('th','发射角 θ <i>(angolo di lancio)</i>',0,90,1,50,'°');
    api.slider('h0','初始高度 h₀ <i>(altezza iniziale)</i>',0,30,0.5,0,'m');
    api.select('g','重力加速度 g',[['9.81','地球 Terra 9.81 m/s²'],['1.62','月球 Luna 1.62 m/s²'],['3.71','火星 Marte 3.71 m/s²'],['24.79','木星 Giove 24.79 m/s²']],'9.81');
    ['t','pos','vel','R','Rf','H','T'].forEach((k,i)=>api.readout(k,['时间 t','位置 (x, y)','速度 (vₓ, v_y)','射程 R（模拟）','v₀²sin2θ/g（公式）','最大高度 h_max','飞行时间 t_volo'][i]));
    const cv=api.canvas(0.52,440), gv=api.graph(), gy=api.graph();
    let t=0; const trail=[];
    const P=()=>{const g=+p.g,th=p.th*DEG,vx=p.v0*Math.cos(th),vy=p.v0*Math.sin(th);const T=(vy+Math.sqrt(vy*vy+2*g*p.h0))/g;return{g,vx,vy,T,R:vx*T,H:p.h0+vy*vy/(2*g)};};
    api.onChange(()=>{t=0;api.play();});
    api.anim({reset(){t=0;}, step(dt){const q=P(); t+=dt*Math.max(1,q.T/4); if(t>=q.T){t=q.T;api.pause();}},
      draw(){
        const q=P(), {ctx,w,h}=cv; clear(ctx,w,h);
        // scale: worst case over angles
        let Rm=0; for(let a=1;a<90;a+=1){const th=a*DEG,vy=p.v0*Math.sin(th);Rm=Math.max(Rm,p.v0*Math.cos(th)*(vy+Math.sqrt(vy*vy+2*q.g*p.h0))/q.g);}
        const Hm=p.h0+p.v0*p.v0/(2*q.g); const sc=Math.min((w-70)/Rm,(h-60)/Hm);
        const ox=40, oy=h-30, X=x=>ox+x*sc, Y=y=>oy-y*sc;
        line(ctx,0,oy,w,oy,'#4b4b53',2);
        const st=niceStep(Rm,8); for(let v=0;v<=Rm*1.05;v+=st){line(ctx,X(v),oy,X(v),oy+5,'#4b4b53');text(ctx,tickLabel(v,st),X(v),oy+18,'#9b9ba4',11,'center');}
        if(p.h0>0){ctx.fillStyle='#2e2e34';ctx.fillRect(ox-24,Y(p.h0),24,p.h0*sc);}
        // 45 deg reference
        ctx.save();ctx.strokeStyle='#ffffff30';ctx.setLineDash([3,5]);ctx.beginPath();{const vv=p.v0/Math.SQRT2,T2=(vv+Math.sqrt(vv*vv+2*q.g*p.h0))/q.g;for(let s=0;s<=T2;s+=T2/80){const x=vv*s,y=p.h0+vv*s-0.5*q.g*s*s;s?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}}ctx.stroke();ctx.restore();
        // predicted path
        ctx.save();ctx.strokeStyle='#4f9dff55';ctx.setLineDash([6,4]);ctx.beginPath();for(let i=0;i<=100;i++){const s=q.T*i/100,x=q.vx*s,y=p.h0+q.vy*s-0.5*q.g*s*s;i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();ctx.restore();
        ctx.strokeStyle='#4f9dff';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=100;i++){const s=t*i/100,x=q.vx*s,y=p.h0+q.vy*s-0.5*q.g*s*s;i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();
        const x=q.vx*t,y=p.h0+q.vy*t-0.5*q.g*t*t, vy=q.vy-q.g*t, ks=sc*0.35;
        // apex marker
        const ta=q.vy/q.g; if(ta>0) {circle(ctx,X(q.vx*ta),Y(q.H),3,'#ffb547'); text(ctx,'h_max',X(q.vx*ta)+6,Y(q.H)-4,'#ffb547',11);}
        arrow(ctx,X(x),Y(y),X(x)+q.vx*ks,Y(y),'#3ecf8e','vₓ'); arrow(ctx,X(x),Y(y),X(x),Y(y)-vy*ks,'#ff6b6b','v_y'); arrow(ctx,X(x),Y(y),X(x)+q.vx*ks,Y(y)-vy*ks,'#ffffff','v');
        circle(ctx,X(x),Y(y),7,'#ffb547');
        if(t>=q.T-1e-9){line(ctx,X(q.R),oy-8,X(q.R),oy+8,'#ffb547',2); text(ctx,'R = '+q.R.toFixed(2)+' m',X(q.R),oy-12,'#ffb547',12,'center');}
        const vt=[],vyt=[],yt=[];for(let i=0;i<=100;i++){const s=q.T*i/100;vt.push([s,q.vx]);vyt.push([s,q.vy-q.g*s]);yt.push([s,p.h0+q.vy*s-0.5*q.g*s*s]);}
        gv.draw({xr:[0,q.T],xlabel:'t (s)',ylabel:'v (m/s)',title:'速度分量 vₓ(t), v_y(t)',legend:true,series:[{pts:vt,color:'#3ecf8e',label:'vₓ'},{pts:vyt,color:'#ff6b6b',label:'v_y'}],marks:[{x:t,y:q.vx,color:'#3ecf8e'},{x:t,y:vy,color:'#ff6b6b'}]});
        gy.draw({xr:[0,q.T],xlabel:'t (s)',ylabel:'y (m)',title:'高度 y(t)',y0:true,series:[{pts:yt,color:'#4f9dff'}],marks:[{x:t,y:y,color:'#ffb547'}]});
        api.set('t',fmtU(t,'s'));api.set('pos',`(${fmt(x)}, ${fmt(y)}) m`);api.set('vel',`(${fmt(q.vx)}, ${fmt(vy)}) m/s`);
        api.set('R',fmtU(q.R,'m',4)); api.set('Rf',p.h0>0?'仅当 h₀=0 适用':fmtU(p.v0*p.v0*Math.sin(2*p.th*DEG)/q.g,'m',4)); api.set('H',fmtU(q.H,'m',4)); api.set('T',fmtU(q.T,'s',4));
      }});
  }
});

/* ===== 3. Moto circolare ===== */
Lab.register({
  id:'circolare', group:'mech', title:'圆周运动', it:'Moto circolare uniforme e non uniforme',
  intro:'向心加速度 (accelerazione centripeta) 改变速度方向，切向加速度 (accelerazione tangenziale) 改变速度大小。',
  explain:`<p><b>匀速圆周运动 (moto circolare uniforme)</b>：速率不变，但速度方向不断改变，所以仍有加速度 a<sub>c</sub> = v²/R，指向圆心。</p>
  <p><b>非匀速圆周运动</b>：角加速度 α ≠ 0 时出现切向加速度 a<sub>t</sub> = αR，总加速度 <b>a</b> = <b>a</b><sub>c</sub> + <b>a</b><sub>t</sub> 不再指向圆心。</p>
  <p>颜色：<span style="color:#16a34a">绿 = 速度 v</span>，<span style="color:#dc2626">红 = 向心 a<sub>c</sub></span>，<span style="color:#b45309">橙 = 切向 a<sub>t</sub></span>，白 = 总加速度。</p>`,
  formulas:[fm(`v = ωR, &nbsp; ω = ${fr('dθ','dt')}, &nbsp; α = ${fr('dω','dt')}`),fm(`a<sub>c</sub> = ${fr('v<sup>2</sup>','R')} = ω<sup>2</sup>R`,'向心加速度'),fm(`a<sub>t</sub> = αR, &nbsp; |a| = ${sq('a<sub>c</sub><sup>2</sup> + a<sub>t</sub><sup>2</sup>')}`),fm(`T = ${fr('2π','ω')}, &nbsp; f = ${fr(1,'T')}`,'周期 periodo，频率 frequenza'),fm(`θ(t) = θ<sub>0</sub> + ω<sub>0</sub>t + ${fr(1,2)}αt<sup>2</sup>`)],
  setup(api){
    const p=api.p;
    api.slider('R','半径 R <i>(raggio)</i>',0.5,5,0.1,2,'m');
    api.slider('w0','初角速度 ω₀ <i>(velocità angolare)</i>',-4,4,0.1,1.5,'rad/s');
    api.slider('al','角加速度 α <i>(accelerazione angolare)</i>',-1,1,0.05,0,'rad/s²');
    ['t','th','w','v','ac','at','a','T'].forEach((k,i)=>api.readout(k,['时间 t','角位置 θ','角速度 ω','速率 v','向心 a_c','切向 a_t','总加速度 |a|','周期 T'][i]));
    const cv=api.canvas(0.62,420), g1=api.graph(), g2=api.graph();
    let t,th,w,hist;
    api.anim({reset(){t=0;th=0;w=p.w0;hist=[];}, speeds:[0.25,0.5,1,2],
      step(dt){ t+=dt; th+=w*dt+0.5*p.al*dt*dt; w+=p.al*dt; if(Math.abs(w)>8) {w=Math.sign(w)*8;} hist.push([t,w,w*w*p.R,p.al*p.R]); if(hist.length>1200) hist.shift(); },
      draw(){
        const {ctx,w:W,h:H}=cv; clear(ctx,W,H); const cx=W/2, cy=H/2, sc=(Math.min(W,H)/2-40)/5, r=p.R*sc;
        circle(ctx,cx,cy,r,null,'#2e2e34',2); circle(ctx,cx,cy,3,'#9b9ba4');
        const x=cx+r*Math.cos(th), y=cy-r*Math.sin(th);
        line(ctx,cx,cy,x,y,'#4b4b53',1,[4,4]);
        const v=w*p.R, ac=w*w*p.R, at=p.al*p.R, ux=-Math.sin(th), uy=-Math.cos(th); // tangent (CCW) in screen
        const kv=18, ka=14;
        arrow(ctx,x,y,x+ux*v*kv,y+uy*v*kv,'#3ecf8e','v');
        const rx=(cx-x)/r, ry=(cy-y)/r;
        arrow(ctx,x,y,x+rx*ac*ka,y+ry*ac*ka,'#ff6b6b','a_c');
        if(Math.abs(at)>1e-3) arrow(ctx,x,y,x+ux*at*ka,y+uy*at*ka,'#ffb547','a_t');
        if(Math.abs(at)>1e-3) arrow(ctx,x,y,x+(rx*ac+ux*at)*ka,y+(ry*ac+uy*at)*ka,'#ffffff','a',1.5);
        circle(ctx,x,y,9,'#4f9dff','#fff');
        text(ctx,'R = '+p.R+' m',cx+6,cy-6,'#9b9ba4',12);
        g1.draw({xlabel:'t (s)',ylabel:'ω (rad/s)',title:'角速度 ω(t)',series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#4f9dff'}]});
        g2.draw({xlabel:'t (s)',ylabel:'a (m/s²)',title:'a_c(t) 与 a_t(t)',legend:true,y0:true,series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#ff6b6b',label:'a_c'},{pts:hist.map(q=>[q[0],q[3]]),color:'#ffb547',label:'a_t'}]});
        api.set('t',fmtU(t,'s'));api.set('th',fmtU(((th%TAU)+TAU)%TAU,'rad'));api.set('w',fmtU(w,'rad/s'));api.set('v',fmtU(Math.abs(v),'m/s'));api.set('ac',fmtU(ac,'m/s²'));api.set('at',fmtU(at,'m/s²'));api.set('a',fmtU(Math.hypot(ac,at),'m/s²'));api.set('T',Math.abs(w)>1e-6?fmtU(TAU/Math.abs(w),'s'):'∞');
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 4. Moti relativi ===== */
Lab.register({
  id:'relativi', group:'mech', title:'相对运动', it:'Moti relativi',
  intro:'渡河问题：船相对水的速度 + 水相对岸的速度 = 船相对岸的速度（伽利略速度变换 trasformazioni di Galileo）。',
  explain:`<p>在<b>岸参考系 (sistema fisso)</b> 里，船的速度是船相对于水 (<b>sistema mobile</b>) 的速度加上水流速度：<b>v</b><sub>ass</sub> = <b>v</b><sub>rel</sub> + <b>v</b><sub>trasc</sub>。</p>
  <p>过河时间只取决于垂直河岸的分量 v<sub>rel</sub>cosφ：船头垂直对岸 (φ = 0) 时用时最短。若想<em>正对岸到达</em>（不漂移），船头要偏向上游 sinφ = v<sub>fiume</sub>/v<sub>rel</sub>（需要 v<sub>rel</sub> > v<sub>fiume</sub>）。</p>`,
  formulas:[fm(`<b>v</b><sub>ass</sub> = <b>v</b><sub>rel</sub> + <b>v</b><sub>trasc</sub>`,'绝对速度 = 相对速度 + 牵连速度'),fm(`t<sub>attr</sub> = ${fr('L','v<sub>rel</sub> cosφ')}`,'过河时间'),fm(`d = (v<sub>fiume</sub> − v<sub>rel</sub> sinφ) · t<sub>attr</sub>`,'下游漂移距离'),fm(`sinφ<sub>0</sub> = ${fr('v<sub>fiume</sub>','v<sub>rel</sub>')}`,'正对岸到达所需船头角（偏上游）')],
  setup(api){
    const p=api.p;
    api.slider('L','河宽 L <i>(larghezza del fiume)</i>',20,200,5,100,'m');
    api.slider('vr','水流速度 v_fiume <i>(corrente)</i>',0,5,0.1,2,'m/s');
    api.slider('vb','船相对水速度 v_rel <i>(velocità relativa)</i>',0.5,8,0.1,4,'m/s');
    api.slider('phi','船头偏上游角 φ <i>(angolo)</i>',-80,80,1,0,'°');
    ['vabs','T','d','phi0'].forEach((k,i)=>api.readout(k,['对岸速度 |v_ass|','过河时间 t_attr','下游漂移 d','不漂移所需 φ₀'][i]));
    const cv=api.canvas(0.6,440); let t, path;
    api.anim({reset(){t=0;path=[];}, step(dt){const vy=p.vb*Math.cos(p.phi*DEG); const T=p.L/vy; t+=dt*Math.max(1,T/6); if(t>=T){t=T;api.pause();}},
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h);
        const ph=p.phi*DEG, vx=p.vr-p.vb*Math.sin(ph), vy=p.vb*Math.cos(ph), T=p.L/vy, d=vx*T;
        const top=40,bot=h-40, sc=(bot-top)/p.L; const x0=w*0.3 - Math.min(0,d)*sc*0; 
        let ox=w/2 - d*sc/2; ox=clamp(ox,30,w-30);
        ctx.fillStyle='#173a5e'; ctx.fillRect(0,top,w,bot-top); ctx.fillStyle='#2f4a2a'; ctx.fillRect(0,0,w,top); ctx.fillRect(0,bot,w,h-bot);
        // flow streaks
        ctx.strokeStyle='#ffffff22'; for(let i=0;i<14;i++){const yy=top+(i+0.5)*(bot-top)/14; const off=((t*p.vr*sc*0.999+i*53)%80); for(let xx=-80+off;xx<w;xx+=80){ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+25,yy);ctx.stroke();}}
        const sx=x=>ox+x*sc, sy=y=>bot-y*sc;
        line(ctx,sx(0),bot,sx(0),top,'#ffffff55',1,[4,4]); text(ctx,'正对岸',sx(0)+4,top-6,'#ccc',11);
        line(ctx,sx(0),bot,sx(d),top,'#ffb54788',1.5,[6,4]);
        const bx=vx*t, by=vy*t, X=sx(bx), Y=sy(by);
        ctx.save(); ctx.translate(X,Y); ctx.rotate(-ph); ctx.fillStyle='#e8d6b0'; ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(7,8); ctx.lineTo(-7,8); ctx.closePath(); ctx.fill(); ctx.restore();
        const k=12;
        arrow(ctx,X,Y,X-p.vb*Math.sin(ph)*k,Y-vy*k,'#3ecf8e','v_rel');
        arrow(ctx,X-p.vb*Math.sin(ph)*k,Y-vy*k,X-p.vb*Math.sin(ph)*k+p.vr*k,Y-vy*k,'#4f9dff','v_fiume');
        arrow(ctx,X,Y,X+vx*k,Y-vy*k,'#ffb547','v_ass');
        text(ctx,`t = ${t.toFixed(1)} s`,10,22,'#fff',13);
        api.set('vabs',fmtU(Math.hypot(vx,vy),'m/s')); api.set('T',fmtU(T,'s')); api.set('d',fmtU(d,'m'));
        api.set('phi0', p.vb>p.vr? fmtU(Math.asin(p.vr/p.vb)/DEG,'°'):'<span class="bad">不可能 (v_rel ≤ v_fiume)</span>');
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

/* ===== 5. Piano inclinato ===== */
Lab.register({
  id:'inclinato', group:'mech', title:'牛顿定律：斜面与摩擦', it:'Leggi di Newton — piano inclinato con attrito',
  intro:'受力分析图 (diagramma di corpo libero)：重力、支持力、静摩擦/动摩擦、外力。',
  explain:`<p><b>牛顿第二定律 (seconda legge di Newton)</b>：Σ<b>F</b> = m<b>a</b>。沿斜面和垂直斜面分解：N = mg cosθ（无垂直外力时）。</p>
  <p><b>静摩擦 (attrito statico)</b> 大小可变，最多到 μ<sub>s</sub>N，方向阻碍"相对滑动的趋势"。当下滑分力超过 μ<sub>s</sub>N 时物块开始滑动，此后受<b>动摩擦 (attrito dinamico)</b> f = μ<sub>d</sub>N。</p>
  <p>无外力时，物块开始下滑的临界角 θ<sub>c</sub> = arctan μ<sub>s</sub>。虚线箭头是重力的两个分量 mg sinθ、mg cosθ。</p>`,
  formulas:[fm(`Σ<b>F</b> = m<b>a</b>`,'牛顿第二定律'),fm(`N = mg cosθ`,'支持力 reazione normale'),fm(`f<sub>s</sub> ≤ μ<sub>s</sub>N, &nbsp; f<sub>d</sub> = μ<sub>d</sub>N`,'静摩擦 / 动摩擦'),fm(`a = g(sinθ − μ<sub>d</sub>cosθ) − ${fr('F','m')}`,'下滑时（F 沿斜面向上为正）'),fm(`tanθ<sub>c</sub> = μ<sub>s</sub>`,'临界角 angolo critico')],
  setup(api){
    const p=api.p, Ltr=5;
    api.slider('m','质量 m <i>(massa)</i>',0.5,20,0.5,5,'kg');
    api.slider('th','倾角 θ <i>(inclinazione)</i>',0,60,1,30,'°');
    api.slider('ms','静摩擦系数 μ_s <i>(coeff. statico)</i>',0,1,0.01,0.5);
    api.slider('mk','动摩擦系数 μ_d <i>(coeff. dinamico)</i>',0,1,0.01,0.3);
    api.slider('F','沿斜面向上的外力 F <i>(forza applicata)</i>',-100,100,1,0,'N');
    ['st','N','f','a','v','s','thc'].forEach((k,i)=>api.readout(k,['状态','支持力 N','摩擦力 f','加速度 a（沿斜面向下为正）','速度 v','位移 s','临界角 θ_c'][i]));
    const cv=api.canvas(0.58,440), g1=api.graph(), g2=api.graph();
    let s,v,t,hist,state,fNow,aNow;
    function forces(){ const g=G_EARTH,th=p.th*DEG,N=p.m*g*Math.cos(th),D=p.m*g*Math.sin(th)-p.F,mk=Math.min(p.mk,p.ms); return {N,D,mk}; }
    function solve(){
      const {N,D,mk}=forces();
      if (Math.abs(v)<1e-6){ if(Math.abs(D)<=p.ms*N){ state='静止 (statico)'; fNow=-D; aNow=0; return; } const dir=Math.sign(D); fNow=-dir*mk*N; aNow=(D+fNow)/p.m; state='开始滑动 (dinamico)'; return; }
      fNow=-Math.sign(v)*mk*N; aNow=(D+fNow)/p.m; state=v>0?'下滑 (dinamico)':'上滑 (dinamico)';
    }
    api.anim({reset(){s=Ltr*0.3;v=0;t=0;hist=[];solve();},
      step(dt){ const n=10,h=dt/n; for(let i=0;i<n;i++){ solve(); const vn=v+aNow*h; if(v!==0 && Math.sign(vn)!==Math.sign(v)){ v=0; } else v=vn; s+=v*h; }
        t+=dt; solve(); if(s>Ltr-0.25||s<0.25){ s=clamp(s,0.25,Ltr-0.25); v=0; api.pause(); } hist.push([t,v,s]); if(hist.length>900) hist.shift(); },
      draw(){
        const {ctx,w,h}=cv; clear(ctx,w,h); const th=p.th*DEG, {N,D}=forces();
        const Lp=Math.min((w-140)/Math.max(Math.cos(th),0.3),(h-90)/Math.max(Math.sin(th),0.01), (w-140)/Math.cos(th));
        const Ax=60, Ay=h-40-Lp*Math.sin(th), Bx=Ax+Lp*Math.cos(th), By=h-40;
        ctx.fillStyle='#2a2a30'; ctx.beginPath(); ctx.moveTo(Ax,Ay); ctx.lineTo(Bx,By); ctx.lineTo(Ax,By); ctx.closePath(); ctx.fill();
        line(ctx,0,By,w,By,'#4b4b53',2);
        if(p.th>0){ ctx.strokeStyle='#ffb547'; ctx.beginPath(); ctx.arc(Bx,By,40,Math.PI,Math.PI+th); ctx.stroke(); text(ctx,'θ',Bx-55,By-8,'#ffb547',13); }
        const ux=Math.cos(th), uy=Math.sin(th), nx=Math.sin(th), ny=-Math.cos(th), pxm=Lp/Ltr;
        const bs=36, px=Ax+ux*s*pxm, py=Ay+uy*s*pxm, cx=px+nx*bs/2, cy=py+ny*bs/2;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(th); ctx.fillStyle='#4f9dff'; ctx.fillRect(-bs/2,-bs/2,bs,bs); ctx.restore();
        const Fmax=Math.max(p.m*G_EARTH,Math.abs(p.F),1), k=90/Fmax;
        arrow(ctx,cx,cy,cx,cy+p.m*G_EARTH*k,'#ff6b6b','mg');
        line(ctx,cx,cy,cx+ux*p.m*G_EARTH*Math.sin(th)*k,cy+uy*p.m*G_EARTH*Math.sin(th)*k,'#ff6b6b99',1.5,[4,3]);
        line(ctx,cx,cy,cx-nx*N*k,cy-ny*N*k,'#ff6b6b99',1.5,[4,3]);
        arrow(ctx,cx,cy,cx+nx*N*k,cy+ny*N*k,'#3ecf8e','N');
        if(Math.abs(fNow)>1e-6) arrow(ctx,px+ux*0,py,px+ux*fNow*k,py+uy*fNow*k,'#ffb547','f');
        if(Math.abs(p.F)>0) arrow(ctx,cx,cy,cx-ux*p.F*k,cy-uy*p.F*k,'#c792ea','F');
        text(ctx,state,12,22,state.startsWith('静')?'#3ecf8e':'#ffb547',14);
        g1.draw({xlabel:'t (s)',ylabel:'v (m/s)',title:'速度 v(t)',y0:true,series:[{pts:hist.map(q=>[q[0],q[1]]),color:'#3ecf8e'}]});
        g2.draw({xlabel:'t (s)',ylabel:'s (m)',title:'沿斜面位移 s(t)',series:[{pts:hist.map(q=>[q[0],q[2]]),color:'#4f9dff'}]});
        api.set('st',state); api.set('N',fmtU(N,'N')); api.set('f',fmtU(Math.abs(fNow),'N')+(Math.abs(v)<1e-6&&aNow===0?` (≤ μ_sN = ${fmt(p.ms*N)})`:'')); api.set('a',fmtU(aNow,'m/s²')); api.set('v',fmtU(v,'m/s')); api.set('s',fmtU(s-Ltr*0.3,'m')); api.set('thc',fmtU(Math.atan(p.ms)/DEG,'°'));
      }});
    api.onChange(()=>{api.A.reset();api.play();});
  }
});

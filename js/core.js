/* 物理实验室 core: UI helpers, canvas, graphs, animation loop */
'use strict';
const Lab = {topics: [], exam:{}, register(t){ this.topics.push(t); }, itPrimary: (()=>{try{return localStorage.getItem('physlab.lang')==='it';}catch(e){return false;}})()}; window.Lab = Lab;
// bilingual helpers: "中文 · italiano" or "中文 <i>(italiano)</i>" -> swapped when Italian-primary
function bi(s){ if(!Lab.itPrimary||typeof s!=='string') return s;
  let m=s.match(/^(.*?)\s*<i>\((.*?)\)<\/i>(.*)$/); if(m) return `${m[2]}${m[3]} <i>(${m[1].trim()})</i>`;
  const k=s.indexOf(' · '); if(k>0) return s.slice(k+3)+' · '+s.slice(0,k); return s; }
const TAU = Math.PI*2, DEG = Math.PI/180;
const G_EARTH = 9.81, R_GAS = 8.314, K_B = 1.380649e-23, G_GRAV = 6.674e-11;

// ---------- formula helpers (hand-written HTML, fully offline) ----------
const fr = (a,b)=>`<span class="frac"><span>${a}</span><span>${b}</span></span>`;
const sq = a=>`√<span class="sqrt">${a}</span>`;
const fm = (html,cap)=>`<div class="fm">${html}${cap?`<span class="cap">${cap}</span>`:''}</div>`;

// ---------- number formatting ----------
function fmt(v, d=3){
  if (v===null || v===undefined || Number.isNaN(v)) return '—';
  if (!isFinite(v)) return v>0?'∞':'−∞';
  const a = Math.abs(v);
  if (a!==0 && (a>=1e5 || a<1e-3)){
    const e = Math.floor(Math.log10(a)); const m = v/Math.pow(10,e);
    return m.toFixed(Math.max(0,d-1)).replace(/\.?0+$/,'') + '×10<sup>'+e+'</sup>';
  }
  let s = Number(v.toPrecision(Math.max(d,1)));
  if (Math.abs(s)>=10**d) s=Math.round(s);
  return String(s).replace('-', '−');
}
const fmtU = (v,u,d)=> fmt(v,d) + (u?' '+u:'');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;

// ---------- drawing helpers ----------
function arrow(ctx,x1,y1,x2,y2,color,label,w=2.5){
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy); if (L<1) return;
  const ux=dx/L, uy=dy/L, h=Math.min(10,L*0.4);
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=w; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-ux*h*0.8,y2-uy*h*0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-ux*h-uy*h*0.5, y2-uy*h+ux*h*0.5); ctx.lineTo(x2-ux*h+uy*h*0.5, y2-uy*h-ux*h*0.5); ctx.closePath(); ctx.fill();
  if (label){ ctx.font='13px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(label, x2+ux*6+ (uy?4:0), y2+uy*8+(ux? -4:0)); }
  ctx.restore();
}
function text(ctx,s,x,y,color='#ececef',size=13,align='left',base='alphabetic'){
  ctx.save(); ctx.fillStyle=color; ctx.font=size+'px -apple-system,"PingFang SC","Noto Sans CJK SC",sans-serif'; ctx.textAlign=align; ctx.textBaseline=base; ctx.fillText(s,x,y); ctx.restore();
}
function clear(ctx,w,h,bg='#141417'){ ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=bg; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height); ctx.restore(); }
function line(ctx,x1,y1,x2,y2,color,w=1,dash){ ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=w; if(dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore(); }
function circle(ctx,x,y,r,fill,stroke,w=1.5){ ctx.beginPath(); ctx.arc(x,y,r,0,TAU); if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke();} }
function heatColor(t){ // t in [0,1] blue->red
  t=clamp(t,0,1); const r=Math.round(255*clamp(1.6*t-0.2,0,1)), g=Math.round(255*clamp(1-Math.abs(t-0.5)*2.2,0,1)*0.85), b=Math.round(255*clamp(1.2-1.8*t,0,1));
  return `rgb(${r},${g},${b})`;
}

// ---------- nice ticks ----------
function niceStep(range, n=5){ const raw=range/n; const p=Math.pow(10,Math.floor(Math.log10(raw))); const f=raw/p; return (f<1.5?1:f<3?2:f<7?5:10)*p; }
function tickLabel(v,step){ const d=Math.max(0,-Math.floor(Math.log10(step)+1e-9)); const a=Math.abs(v);
  if (a>=1e5 || (a<1e-3&&a>0)) return v.toExponential(1).replace('e+','e'); return v.toFixed(Math.min(d,6)).replace('-', '−'); }

// ---------- Graph (with hover / touch crosshair) ----------
class Graph{
  constructor(cvObj){ this.c=cvObj; this.hover=null; const cv=cvObj.cv;
    const mv=e=>{ const r=cv.getBoundingClientRect(); this.hover={x:e.clientX-r.left,y:e.clientY-r.top}; };
    cv.addEventListener('pointermove',mv); cv.addEventListener('pointerdown',mv);
    cv.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') this.hover=null; });
    cv.style.cursor='crosshair'; }
  draw(o){
    const {ctx,w,h}=this.c; clear(ctx,w,h);
    const series=o.series||[];
    let xs=[], ys=[];
    for (const s of series) for (const p of s.pts){ if(isFinite(p[0])&&isFinite(p[1])){xs.push(p[0]); ys.push(p[1]);} }
    for (const m of (o.marks||[])){ if(isFinite(m.x)&&isFinite(m.y)){ xs.push(m.x); ys.push(m.y);} }
    let [x0,x1]=o.xr||[Math.min(...xs,0),Math.max(...xs,1)];
    let [y0,y1]=o.yr||[Math.min(...ys), Math.max(...ys)];
    if (!o.yr){ if(!isFinite(y0)){y0=0;y1=1;} if(o.y0){ y0=Math.min(y0,0); y1=Math.max(y1,0); } if(y1-y0<1e-12){y0-=1;y1+=1;} const pd=(y1-y0)*0.08; y0-=(o.y0&&y0===0)?0:pd; y1+=pd; }
    if (!(x1>x0)){x1=x0+1;}
    const L=56,R=14,T=o.title?26:14,B=38, pw=w-L-R, ph=h-T-B;
    const X=x=>L+(x-x0)/(x1-x0)*pw, Y=y=>T+ph-(y-y0)/(y1-y0)*ph;
    this.X=X; this.Y=Y; this.box={L,R,T,B,pw,ph,x0,x1,y0,y1};
    ctx.save(); ctx.font='11.5px sans-serif'; ctx.fillStyle='#a1a1aa'; ctx.strokeStyle='#26262b'; ctx.lineWidth=1;
    const sx=niceStep(x1-x0,Math.max(2,Math.floor(pw/75))), sy=niceStep(y1-y0,Math.max(2,Math.floor(ph/38)));
    ctx.textAlign='center'; ctx.textBaseline='top';
    for (let v=Math.ceil(x0/sx)*sx; v<=x1+1e-9; v+=sx){ const px=X(v); ctx.beginPath(); ctx.moveTo(px,T); ctx.lineTo(px,T+ph); ctx.stroke(); ctx.fillText(tickLabel(v,sx),px,T+ph+4); }
    ctx.textAlign='right'; ctx.textBaseline='middle';
    for (let v=Math.ceil(y0/sy)*sy; v<=y1+1e-9; v+=sy){ const py=Y(v); ctx.beginPath(); ctx.moveTo(L,py); ctx.lineTo(L+pw,py); ctx.stroke(); ctx.fillText(tickLabel(v,sy),L-5,py); }
    ctx.strokeStyle='#4b4b53'; ctx.beginPath(); ctx.rect(L,T,pw,ph); ctx.stroke();
    if (y0<0&&y1>0){ ctx.beginPath(); ctx.moveTo(L,Y(0)); ctx.lineTo(L+pw,Y(0)); ctx.stroke(); }
    ctx.font='12px sans-serif'; ctx.fillStyle='#d4d4d8'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(o.xlabel||'',L+pw/2,h-3);
    ctx.save(); ctx.translate(13,T+ph/2); ctx.rotate(-Math.PI/2); ctx.textBaseline='middle'; ctx.fillText(o.ylabel||'',0,0); ctx.restore();
    if (o.title){ ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillStyle='#ececef'; ctx.font='12.5px sans-serif'; ctx.fillText(o.title,Math.max(6,L-40),6); }
    ctx.save(); ctx.beginPath(); ctx.rect(L,T,pw,ph); ctx.clip();
    for (const s of series){
      if (!s.pts.length) continue;
      if (s.fill){ ctx.beginPath(); s.pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));
        if (s.fill==='closed') ctx.closePath(); else { const b0=clamp(0,y0,y1); ctx.lineTo(X(s.pts[s.pts.length-1][0]),Y(b0)); ctx.lineTo(X(s.pts[0][0]),Y(b0)); ctx.closePath(); }
        ctx.fillStyle=s.fillColor||s.color+'33'; ctx.fill(); }
      if (s.bars){ ctx.fillStyle=s.color; for (const p of s.pts){ const bx=X(p[0]-s.bars/2), bw=X(p[0]+s.bars/2)-bx; const base=Y(clamp(0,y0,y1)); ctx.fillRect(bx+0.5,Math.min(Y(p[1]),base),bw-1,Math.abs(base-Y(p[1]))); } continue; }
      if (s.dots){ ctx.fillStyle=s.color; for (const p of s.pts){ ctx.beginPath(); ctx.arc(X(p[0]),Y(p[1]),s.dots,0,TAU); ctx.fill(); } continue; }
      ctx.strokeStyle=s.color; ctx.lineWidth=s.width||2; ctx.setLineDash(s.dash||[]); ctx.beginPath();
      let pen=false; for (const p of s.pts){ if(!isFinite(p[1])){pen=false;continue;} const px=X(p[0]),py=Y(p[1]); if(pen) ctx.lineTo(px,py); else {ctx.moveTo(px,py); pen=true;} }
      ctx.stroke(); ctx.setLineDash([]);
    }
    for (const v of (o.vlines||[])){ ctx.strokeStyle=v.color||'#ffb547'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(X(v.x),T); ctx.lineTo(X(v.x),T+ph); ctx.stroke(); ctx.setLineDash([]); if(v.label){ctx.fillStyle=v.color||'#ffb547'; ctx.font='11.5px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText(v.label,X(v.x)+3,T+3+(v.dy||0));} }
    for (const m of (o.marks||[])){ ctx.fillStyle=m.color||'#fff'; ctx.beginPath(); ctx.arc(X(m.x),Y(m.y),m.r||5,0,TAU); ctx.fill(); if(m.label){ ctx.textAlign='left'; ctx.textBaseline='bottom'; ctx.font='12px sans-serif'; ctx.fillText(m.label,X(m.x)+6,Y(m.y)-3);} }
    ctx.restore();
    if (o.legend){ let lx=L+8; ctx.save(); ctx.font='11.5px sans-serif'; ctx.textBaseline='middle';
      for (const s of series){ if(!s.label) continue; ctx.fillStyle=s.color; ctx.fillRect(lx,T+8,10,3); ctx.fillStyle='#d4d4d8'; ctx.textAlign='left'; ctx.fillText(s.label,lx+13,T+10); lx+=ctx.measureText(s.label).width+28; }
      ctx.restore(); }
    // crosshair
    const hv=this.hover;
    if (hv && hv.x>=L && hv.x<=L+pw && hv.y>=T && hv.y<=T+ph){
      let cx=hv.x, cy=hv.y, dx=x0+(hv.x-L)/pw*(x1-x0), dy=y0+(T+ph-hv.y)/ph*(y1-y0), snap=null, best=24*24;
      for (const s of series){ if(s.fill==='closed'||s.bars||!s.pts.length||(s.width&&s.width<0.5)) continue;
        const step=Math.max(1,Math.floor(s.pts.length/600));
        for (let i=0;i<s.pts.length;i+=step){ const p=s.pts[i]; if(!isFinite(p[1])) continue; const d=(X(p[0])-hv.x)**2+(Y(p[1])-hv.y)**2; if(d<best){best=d; snap={p,color:s.color};} } }
      if (snap){ cx=X(snap.p[0]); cy=Y(snap.p[1]); dx=snap.p[0]; dy=snap.p[1]; }
      ctx.save(); ctx.strokeStyle='#ffffff70'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx,T); ctx.lineTo(cx,T+ph); ctx.moveTo(L,cy); ctx.lineTo(L+pw,cy); ctx.stroke(); ctx.setLineDash([]);
      if (snap){ ctx.fillStyle=snap.color; ctx.beginPath(); ctx.arc(cx,cy,4.5,0,TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke(); }
      const nf=v=>{ const a=Math.abs(v); return (a!==0&&(a>=1e5||a<1e-3))?v.toExponential(3):(+v.toPrecision(4)).toString(); };
      const lab=`${(o.xlabel||'x').split(/[\s(]/)[0]} = ${nf(dx)}${unitOf(o.xlabel)},  ${(o.ylabel||'y').split(/[\s(]/)[0]} = ${nf(dy)}${unitOf(o.ylabel)}`;
      ctx.font='12px sans-serif'; const tw=ctx.measureText(lab).width+12; let bx=cx+10, by=cy-28; if(bx+tw>L+pw) bx=cx-10-tw; if(by<T) by=cy+10;
      ctx.fillStyle='#141417ee'; ctx.strokeStyle='#4f9dff'; ctx.beginPath(); ctx.rect(bx,by,tw,20); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(lab,bx+6,by+10); ctx.restore();
    }
  }
}
function unitOf(label){ const m=(label||'').match(/\(([^()]*)\)\s*$/); return m?' '+m[1]:''; }

// ---------- Topic API ----------
class TopicAPI{
  constructor(topic, root){
    this.topic=topic; this.p={}; this.canvases=[]; this.changeFns=[]; this.anims=[]; this.running=false; this.ctrl={};
    const it=Lab.itPrimary, h1=it?`${topic.it}<span class="it">${topic.title}</span>`:`${topic.title}<span class="it">${topic.it}</span>`;
    root.innerHTML=`
      <div class="t-head"><h1>${h1}</h1><p>${topic.intro||''}</p></div>
      <div class="grid">
        <div class="left"><div class="card stage"><div class="cvs"></div><div class="graphs"></div></div><div class="extras"></div></div>
        <div class="right"><div class="card"><h4>${bi('参数 · Parametri')}</h4><div class="btns"></div><div class="ctrls"></div></div>
          <div class="card" style="margin-top:16px"><h4>${bi('实时数据 · Valori')}</h4><div class="readouts"></div></div></div>
      </div>
      <div class="below"><div class="card explain"><h4>${bi('概念说明 · Spiegazione')}</h4>${topic.explain||''}</div>
        <div class="card"><h4>${bi('关键公式 · Formule')}</h4><div class="formulas">${(topic.formulas||[]).join('')}</div></div></div>
      <div class="below exam-area"></div>`;
    this.root=root; this.$cvs=root.querySelector('.cvs'); this.$graphs=root.querySelector('.graphs');
    this.$ctrls=root.querySelector('.ctrls'); this.$btns=root.querySelector('.btns'); this.$ro=root.querySelector('.readouts'); this.$extras=root.querySelector('.extras');
    this.$exam=root.querySelector('.exam-area');
    this.ro={};
  }
  _changed(key){ for (const f of this.changeFns) f(key); }
  onChange(fn){ this.changeFns.push(fn); }
  setParam(key,v){ const c=this.ctrl[key]; if(!c) return false; c.set(v); this._changed(key); return true; }
  slider(key,label,min,max,step,value,unit='',opts={}){
    const d=document.createElement('div'); d.className='ctrl';
    const show=v=> (opts.fmt?opts.fmt(v):fmt(v,4))+(unit?' '+unit:'');
    d.innerHTML=`<label><span>${bi(label)}</span><b></b></label><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label.replace(/<[^>]+>/g,'')}">`;
    const inp=d.querySelector('input'), b=d.querySelector('b');
    this.p[key]=+value; b.innerHTML=show(+value);
    inp.addEventListener('input',()=>{ this.p[key]=+inp.value; b.innerHTML=show(+inp.value); this._changed(key); });
    this.$ctrls.appendChild(d);
    const o={set:(v)=>{ inp.value=v; this.p[key]=+inp.value; b.innerHTML=show(+inp.value); }, el:d, input:inp};
    this.ctrl[key]=o; return o;
  }
  select(key,label,options,value){
    const d=document.createElement('div'); d.className='ctrl';
    d.innerHTML=`<label><span>${bi(label)}</span></label><select>${options.map(o=>`<option value="${o[0]}">${bi(o[1])}</option>`).join('')}</select>`;
    const s=d.querySelector('select'); s.value=value??options[0][0]; this.p[key]=s.value;
    s.addEventListener('change',()=>{ this.p[key]=s.value; this._changed(key); });
    this.$ctrls.appendChild(d); const o={el:d, set:v=>{s.value=v; this.p[key]=s.value;}}; this.ctrl[key]=o; return o;
  }
  checkbox(key,label,value=false){
    const d=document.createElement('div'); d.className='ctrl';
    d.innerHTML=`<label style="justify-content:flex-start;gap:8px;cursor:pointer"><input type="checkbox" ${value?'checked':''}><span>${bi(label)}</span></label>`;
    const c=d.querySelector('input'); this.p[key]=value; c.addEventListener('change',()=>{this.p[key]=c.checked; this._changed(key);});
    this.$ctrls.appendChild(d); this.ctrl[key]={el:d,set:v=>{c.checked=!!v; this.p[key]=!!v;}}; return d;
  }
  note(html){ const d=document.createElement('div'); d.className='ctrl'; d.style.fontSize='12.5px'; d.style.color='var(--mute)'; d.innerHTML=html; this.$ctrls.appendChild(d); return d; }
  button(label,fn,pri){ const b=document.createElement('button'); b.className='b'+(pri?' pri':''); b.innerHTML=label; b.onclick=fn; this.$btns.appendChild(b); return b; }
  _mkCanvas(parent,aspect,maxH,cls){
    const cv=document.createElement('canvas'); if(cls) cv.className=cls; parent.appendChild(cv);
    const o={cv,ctx:cv.getContext('2d'),w:300,h:200,aspect,maxH};
    this.canvases.push(o); this._size(o); return o;
  }
  _size(o){
    const W=o.cv.parentElement.clientWidth||600; const w=Math.max(200,W);
    const minH=o.minH||(o.isGraph?190:200);
    const h=Math.max(minH,Math.min(o.maxH||9999, Math.round(w*o.aspect)));
    const dpr=window.devicePixelRatio||1; o.cv.width=Math.round(w*dpr); o.cv.height=Math.round(h*dpr);
    o.cv.style.height=h+'px'; o.w=w; o.h=h; o.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  canvas(aspect=0.55,maxH=460,minH){ const wrap=document.createElement('div'); wrap.className='cv'; this.$cvs.appendChild(wrap); const o=this._mkCanvas(wrap,aspect,maxH); if(minH){o.minH=minH; this._size(o);} return o; }
  graph(aspect=0.62,maxH=260){ const wrap=document.createElement('div'); this.$graphs.appendChild(wrap); const cv=document.createElement('canvas'); wrap.appendChild(cv); const o={cv,ctx:cv.getContext('2d'),aspect,maxH,isGraph:true}; this.canvases.push(o); this._size(o); return new Graph(o); }
  extra(title){ const d=document.createElement('div'); d.className='card'; d.style.marginTop='16px'; d.innerHTML=(title?`<h4>${bi(title)}</h4>`:'')+'<div class="xbody"></div>'; this.$extras.appendChild(d); return d.querySelector('.xbody'); }
  readout(key,label){ const k=document.createElement('div'); k.className='k'; k.innerHTML=label; const v=document.createElement('div'); v.className='v'; v.innerHTML='—'; this.$ro.append(k,v); this.ro[key]=v; }
  sep(){ const s=document.createElement('div'); s.className='sep'; this.$ro.appendChild(s); }
  set(key,html){ const e=this.ro[key]; if(e && e._last!==html){ e.innerHTML=html; e._last=html; } }
  /* animation: {reset(), step(dt), draw(), speeds?, static?} */
  anim(a){
    this.A=a; const self=this;
    if (!a.static){
      this.playBtn=this.button('⏸ '+bi('暂停 · pausa').split(' · ')[0],()=>this.toggle(),true);
      this.button('↺ '+bi('重置 · reset').split(' · ')[0],()=>{ a.reset(); a.draw(); });
    }
    if (a.speeds){ const sel=document.createElement('select'); sel.className='b'; sel.style.padding='6px'; sel.setAttribute('aria-label','speed');
      sel.innerHTML=a.speeds.map(s=>`<option value="${s}">${s}×</option>`).join(''); sel.value=a.speed||1; this.speed=+sel.value;
      sel.onchange=()=>{ self.speed=+sel.value; }; this.$btns.appendChild(sel); }
    this.speed=this.speed||1;
    a.reset(); this.running = !a.static && a.autoplay!==false; this._updBtn();
  }
  toggle(){ this.running=!this.running; this._updBtn(); }
  play(){ if(this.A&&this.A.static) return; this.running=true; this._updBtn(); }
  pause(){ this.running=false; this._updBtn(); }
  _updBtn(){ if(this.playBtn) this.playBtn.innerHTML=this.running?'⏸ '+(Lab.itPrimary?'pausa':'暂停'):'▶ '+(Lab.itPrimary?'avvia':'播放'); }
  resize(){ for (const o of this.canvases) this._size(o); if (this.A) this.A.draw(); }
}

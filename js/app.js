'use strict';
/* Navigation, routing (#topic, #quiz/ch, #problemi, #formule, #glossario, #unita, #home), animation loop */
(function(){
  const nav=document.getElementById('sidebar'), main=document.getElementById('main'), it=Lab.itPrimary;
  const byId=id=>Lab.topics.find(t=>t.id===id);
  const num={}; let n=0; Lab.chapters.forEach(c=>c.topics.forEach(t=>{ num[t]=++n; }));
  function buildNav(){
    const d=Lab.progress.load(); let html='';
    for (const [g,zh,itn] of [['mech','力学','Meccanica'],['thermo','热力学','Termodinamica']]){
      html+=`<div class="grp">${it?itn:zh}<span>${it?zh:itn}</span></div>`;
      for (const c of Lab.chapters.filter(c=>c.group===g)){
        const pr=Lab.progress.chapter(c.id).total;
        html+=`<div class="chap" data-ch="${c.id}"><div class="chap-h"><span>${it?c.it:c.zh}</span><a class="chip" href="#quiz/${c.id}" title="${it?'Quiz':'本章测验'}">${pr?pr+'%':'Quiz'}</a></div>`;
        for (const id of c.topics){ const t=byId(id); if(!t) continue;
          const seen=d.v[id]?' seen':'';
          html+=`<a class="tl${seen}" href="#${id}" data-id="${id}" data-s="${(t.title+' '+t.it).toLowerCase()}"><em>${num[id]}</em><span>${it?t.it.split(/ — | – /)[0]:t.title}<small>${it?t.title:t.it.split(/ — | – /)[0]}</small></span></a>`; }
        html+='</div>';
      }
    }
    html+=`<div class="navfoot">SI · g = 9.81 m/s² · R = 8.314 J/(mol·K)</div>`;
    const st=nav.scrollTop; nav.innerHTML=html; nav.scrollTop=st; markActive();
  }
  function markActive(){ const h=location.hash.slice(1); nav.querySelectorAll('a.tl').forEach(a=>a.classList.toggle('active',a.dataset.id===h));
    document.querySelectorAll('.toolnav a').forEach(a=>a.classList.toggle('active',h===a.dataset.tool||(h===''&&a.dataset.tool==='home')||h.startsWith(a.dataset.tool+'/'))); }
  let api=null, last=performance.now(), skipRoute=false;
  function show(id,set){
    if (set && location.hash.slice(1)!==id){ skipRoute=true; location.hash=id; }
    const t=byId(id); api=null; main.innerHTML='';
    if (!t){ Pages.render(id||'home',main); afterShow(); document.title='物理实验室 · Laboratorio di Fisica I'; return; }
    main.className='main topic';
    const a=new TopicAPI(t,main);
    try{ t.setup(a); }catch(e){ console.error(e); main.insertAdjacentHTML('beforeend','<p class="bad">加载出错: '+e.message+'</p>'); }
    if (!a.changeFns.length && a.A) a.onChange(()=>{ a.A.reset(); });
    if (set){ for (const k in set) a.setParam(k,set[k]); if (a.A&&a.A.reset) a.A.reset(); a.play(); }
    api=a; a.resize(); requestAnimationFrame(()=>{ if(api===a) a.resize(); });
    try{ renderExam(a); }catch(e){ console.error(e); }
    Lab.progress.mark('v',t.id);
    document.title=(it?t.it.split(/ — /)[0]:t.title)+' — 物理实验室';
    afterShow();
  }
  function afterShow(){ markActive(); window.scrollTo(0,0); const a=nav.querySelector('a.tl.active'); if(a){ const r=a.getBoundingClientRect(), nr=nav.getBoundingClientRect(); if(r.top<nr.top||r.bottom>nr.bottom) nav.scrollTop+=r.top-nr.top-nr.height/2; } }
  function route(){ if(skipRoute){ skipRoute=false; markActive(); return; } main.className='main'; show(location.hash.slice(1)); }
  window.addEventListener('hashchange',route);
  let rt; window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>api&&api.resize(),120); });
  // language toggle
  const seg=document.getElementById('langSeg');
  seg.querySelectorAll('button').forEach(b=>{ b.classList.toggle('on',(b.dataset.l==='it')===it);
    b.onclick=()=>{ try{ localStorage.setItem('physlab.lang',b.dataset.l); }catch(e){} location.reload(); }; });
  if (it){ document.documentElement.lang='it'; const m={home:'Progressi',problemi:'Esercizi',formule:'Formulario',glossario:'Glossario',unita:'Unità'};
    document.querySelectorAll('.toolnav a').forEach(a=>a.textContent=m[a.dataset.tool]); document.getElementById('navSearch').placeholder='cerca argomento / 搜索主题'; }
  // search filter
  const sq=document.getElementById('navSearch');
  sq.addEventListener('input',()=>{ const q=sq.value.trim().toLowerCase();
    nav.querySelectorAll('.chap').forEach(c=>{ let any=false; c.querySelectorAll('a.tl').forEach(a=>{ const hit=!q||a.dataset.s.includes(q); a.style.display=hit?'':'none'; any=any||hit; }); c.style.display=any?'':'none'; }); });
  sq.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const a=[...nav.querySelectorAll('a.tl')].find(a=>a.style.display!=='none'); if(a){ location.hash=a.dataset.id; sq.blur(); } } if(e.key==='Escape'){ sq.value=''; sq.dispatchEvent(new Event('input')); sq.blur(); } });
  // keyboard: / search, space play/pause, R reset, [ ] previous/next topic
  const order=Lab.chapters.flatMap(c=>c.topics);
  document.addEventListener('keydown',e=>{
    const tag=(e.target.tagName||'').toLowerCase(); if(['input','textarea','select'].includes(tag)||e.metaKey||e.ctrlKey||e.altKey) return;
    if (e.key==='/'){ e.preventDefault(); sq.focus(); sq.select(); }
    else if (e.key===' ' && api && api.A && !api.A.static){ e.preventDefault(); api.toggle(); }
    else if ((e.key==='r'||e.key==='R') && api && api.A){ api.A.reset(); api.A.draw(); }
    else if (e.key===']'||e.key==='['){ const i=order.indexOf(location.hash.slice(1)); const j=i<0?0:(i+(e.key===']'?1:-1)+order.length)%order.length; location.hash=order[j]; }
  });
  function frame(now){
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    if (api && api.A){
      try{ if (api.running && api.A.step) api.A.step(dt*(api.speed||1)); api.A.draw(); }
      catch(e){ console.error(e); api.running=false; }
    }
    requestAnimationFrame(frame);
  }
  buildNav(); route(); requestAnimationFrame(frame);
  window.PhysicsLab={show, refreshNav:()=>{ clearTimeout(window._rn); window._rn=setTimeout(buildNav,50); }, get api(){return api;}};
})();

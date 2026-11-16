'use strict';
/* Study pages: dashboard, chapter quizzes, random problems, formula sheet, glossary, unit converter */
const Pages=(()=>{
const it=Lab.itPrimary;
const L=(zh,itx)=>it?itx:zh;           // primary label
const L2=(zh,itx)=>it?`${itx} <span class="alt">${zh}</span>`:`${zh} <span class="alt">${itx}</span>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const head=(zh,itx,sub)=>`<div class="t-head"><h1>${L(zh,itx)}<span class="it">${L(itx,zh)}</span></h1>${sub?`<p>${sub}</p>`:''}</div>`;

/* ---------------- Dashboard ---------------- */
function home(root){
  const d=Lab.progress.load(); const all=Lab.chapters.map(c=>({c,p:Lab.progress.chapter(c.id)}));
  const tot=Math.round(all.reduce((s,x)=>s+x.p.total,0)/all.length);
  const seen=Object.keys(d.v||{}).filter(k=>Lab.topics.some(t=>t.id===k)).length;
  const bar=(v,lab)=>`<div class="pbar"><span style="width:${Math.round(v*100)}%"></span></div><div class="plab">${lab}<b>${Math.round(v*100)}%</b></div>`;
  root.innerHTML=head('学习进度','Progressi',L(`Fisica I 力学与热力学，共 ${Lab.topics.length} 个互动模型。进度保存在本浏览器（localStorage）。`,`Fisica I — Meccanica e Termodinamica, ${Lab.topics.length} modelli interattivi. I progressi sono salvati in questo browser.`))+
  `<div class="stats">
     <div class="stat"><b>${tot}%</b><span>${L('总体完成度','Completamento')}</span></div>
     <div class="stat"><b>${seen}<small>/${Lab.topics.length}</small></b><span>${L('已打开模型','Modelli aperti')}</span></div>
     <div class="stat"><b>${Object.keys(d.q||{}).length}<small>/${Lab.chapters.length}</small></b><span>${L('已做章节测验','Quiz svolti')}</span></div>
     <div class="stat"><b>${Object.values(d.p||{}).reduce((a,b)=>a+b,0)}</b><span>${L('随机练习已做','Esercizi svolti')}</span></div>
   </div>
   <div class="chgrid">${all.map(({c,p})=>`<div class="card chcard">
      <div class="chtop"><div><div class="chname">${L(c.zh,c.it)}</div><div class="alt">${L(c.it,c.zh)}</div></div><div class="pct">${p.total}%</div></div>
      ${bar(p.v,L('模型','Modelli'))}${bar(p.e,L('例题','Esempi'))}${bar(p.q,L('测验最高分','Quiz (migliore)'))}${bar(p.pr,L('随机练习','Esercizi'))}
      <div class="chlinks">${c.topics.map(id=>{const t=Lab.topics.find(x=>x.id===id); return `<a href="#${id}" class="${d.v[id]?'done':''}">${L(t.title,t.it.split(/ — /)[0])}</a>`;}).join('')}</div>
      <div class="chbtn"><a class="b" href="#quiz/${c.id}">${L('章节测验','Quiz')}</a><a class="b" href="#problemi/${c.id}">${L('随机练习','Esercizi')}</a></div></div>`).join('')}</div>
   <div class="card keys"><h4>${L('键盘快捷键','Scorciatoie da tastiera')}</h4>
     <div class="kgrid"><span><kbd>/</kbd> ${L('搜索主题','cerca')}</span><span><kbd>Space</kbd> ${L('播放 / 暂停','avvia / pausa')}</span><span><kbd>R</kbd> ${L('重置模拟','reset')}</span><span><kbd>[</kbd> <kbd>]</kbd> ${L('上一个 / 下一个模型','modello prec. / succ.')}</span></div>
     <button class="b ghost" id="resetProg">${L('清除进度','Azzera progressi')}</button></div>`;
  root.querySelector('#resetProg').onclick=()=>{ if(confirm(L('确定清除所有进度？','Azzerare tutti i progressi?'))){ Lab.progress.reset(); window.PhysicsLab.refreshNav(); home(root); } };
}

/* ---------------- Quiz ---------------- */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function chapterTabs(cur,base){ return `<div class="tabs">${Lab.chapters.map(c=>`<a href="#${base}/${c.id}" class="${c.id===cur?'on':''}">${L(c.zh,c.it)}</a>`).join('')}</div>`; }
function quiz(root,ch){
  const c=Lab.chapters.find(x=>x.id===ch)||Lab.chapters[0]; const qs=Lab.quiz[c.id]||[];
  const best=Math.round(100*(Lab.progress.load().q[c.id]||0));
  root.innerHTML=head('章节测验：'+c.zh,'Quiz: '+c.it,L(`选择题，选完立刻显示对错和解释。考试为意大利语，题干以意大利语为主。历史最高分 ${best}%。`,`Domande a risposta multipla con correzione immediata. Miglior punteggio: ${best}%.`))+chapterTabs(c.id,'quiz')+
    `<div class="qlist"></div><div class="card qsum"><div class="score"></div><div class="btns"><button class="b pri" id="qagain">${L('重新打乱再做一次','Rifai (ordine casuale)')}</button>${c.topics.map(id=>{const t=Lab.topics.find(x=>x.id===id);return `<a class="b" href="#${id}">${L(t.title,t.it.split(/ — /)[0])}</a>`;}).join('')}</div></div>`;
  const list=root.querySelector('.qlist'), score=root.querySelector('.score'); let done=0, right=0;
  const upd=()=>{ score.innerHTML=`${L('得分','Punteggio')} <b>${right} / ${qs.length}</b> · ${L('已答','risposte')} ${done}/${qs.length}`; if(done===qs.length){ Lab.progress.mark('q',c.id,right/qs.length); score.innerHTML+=` · <span class="${right===qs.length?'ok':''}">${right===qs.length?L('全对！','Perfetto!'):L('看看解释，再做一次','Leggi le spiegazioni e riprova')}</span>`; } };
  shuffle(qs.map((q,i)=>i)).forEach((qi,k)=>{ const q=qs[qi];
    const opts=shuffle(q.o.map((o,i)=>({o,ok:i===q.a})));
    const d=document.createElement('div'); d.className='card qitem';
    d.innerHTML=`<div class="qn">${k+1}</div><div class="qb"><p class="qit">${it?q.it:q.it}</p><p class="qzh">${q.zh}</p>
      <div class="opts">${opts.map((o,i)=>`<button class="opt" data-i="${i}"><span>${'ABCD'[i]}</span>${o.o}</button>`).join('')}</div><div class="qx"></div></div>`;
    d.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ if(d.dataset.done) return; d.dataset.done=1; done++;
      const o=opts[+b.dataset.i]; if(o.ok) right++;
      d.querySelectorAll('.opt').forEach((x,i)=>{ x.disabled=true; if(opts[i].ok) x.classList.add('right'); });
      if(!o.ok) b.classList.add('wrong');
      d.querySelector('.qx').innerHTML=`<span class="${o.ok?'ok':'bad'}">${o.ok?'✓ '+L('正确','Corretto'):'✗ '+L('错误','Sbagliato')}</span> ${q.x}`; upd(); });
    list.appendChild(d); });
  upd(); root.querySelector('#qagain').onclick=()=>quiz(root,c.id);
}

/* ---------------- Random problems ---------------- */
function problems(root,ch){
  const c=Lab.chapters.find(x=>x.id===ch)||Lab.chapters[1];
  root.innerHTML=head('随机练习','Esercizi con numeri casuali',L('每次数字都随机生成，答案由同一套物理公式计算。容差 2%。可以在对应模型里用同样的参数验证。','Numeri generati a caso; la soluzione usa le stesse formule del modello. Tolleranza 2 %.'))+chapterTabs(c.id,'problemi')+`<div class="plist"></div>`;
  const list=root.querySelector('.plist'), gens=Lab.problems[c.id]||[];
  if(!gens.length){ list.innerHTML=`<div class="card">${L('本章暂无随机题。','Nessun esercizio per questo capitolo.')}</div>`; return; }
  const add=()=>{ const pr=gens[Math.floor(Math.random()*gens.length)](); const d=document.createElement('div'); d.className='card pitem';
    const t=Lab.topics.find(x=>x.id===pr.topic);
    d.innerHTML=`<p class="pq">${pr.q}</p><div class="exrow"><input type="number" step="any" placeholder="${L('你的答案','risposta')}"><span>${pr.unit}</span><button class="b pri chk">${L('核对','Verifica')}</button><button class="b sol">${L('解题步骤','Soluzione')}</button><button class="b run">${L('在模型中验证','Apri nel modello')} · ${t?L(t.title,t.it.split(/ — /)[0]):''}</button></div><div class="fb"></div><ol class="steps" hidden>${pr.steps.map(s=>`<li>${s}</li>`).join('')}<li><b>= ${fmt(pr.ans,4)} ${pr.unit}</b></li></ol>`;
    const inp=d.querySelector('input'), fb=d.querySelector('.fb');
    const chk=()=>{ const v=parseFloat(inp.value); if(isNaN(v)){ fb.innerHTML=`<span class="bad">${L('请输入数值','Inserisci un numero')}</span>`; return; }
      const ok=Math.abs(v-pr.ans)<=Math.max(0.02*Math.abs(pr.ans),0.005); fb.innerHTML=ok?`<span class="ok">✓ ${L('正确','Corretto')}：${fmt(pr.ans,4)} ${pr.unit}</span>`:`<span class="bad">✗ ${L('不对，再试试或看解题步骤','Non corretto: riprova o guarda la soluzione')}</span>`; if(ok&&!d.dataset.m){ d.dataset.m=1; Lab.progress.mark('p',c.id); } };
    d.querySelector('.chk').onclick=chk; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') chk(); });
    d.querySelector('.sol').onclick=()=>{ const s=d.querySelector('.steps'); s.hidden=!s.hidden; };
    d.querySelector('.run').onclick=()=>window.PhysicsLab.show(pr.topic,pr.set);
    list.prepend(d); };
  const bar=document.createElement('div'); bar.className='btns'; bar.innerHTML=`<button class="b pri">${L('再来一题','Nuovo esercizio')}</button>`; bar.firstChild.onclick=add; list.before(bar);
  add(); add();
}

/* ---------------- Formula sheet ---------------- */
// [formula, 中文, italiano, symbols & units]
const F={
pre:[['A·B = AB cosφ = AₓBₓ + A_yB_y + A_zB_z','标量积','prodotto scalare','标量'],['|A×B| = AB sinφ，方向右手定则','矢量积','prodotto vettoriale','矢量'],['v = dx/dt，a = dv/dt = d²x/dt²','导数','derivata','m/s, m/s²'],['x(t) = x₀ + ∫v dt','积分','integrale','m']],
cin:[['x = x₀ + v₀t + ½at²','匀加速运动','moto uniformemente accelerato','x [m], a [m/s²]'],['v² = v₀² + 2a(x − x₀)','速度–位移关系','relazione v–x','v [m/s]'],['R = v₀² sin2θ / g','抛体射程','gittata','R [m]'],['h_max = v₀² sin²θ / (2g)','最大高度','altezza massima','h [m]'],['a_c = v²/r = ω²r','向心加速度','accelerazione centripeta','m/s²'],['T = 2π/ω，v = ωr','周期与线速度','periodo, velocità tangenziale','T [s], ω [rad/s]'],['a = a_t û_t + (v²/ρ) û_n','切向与法向加速度','accelerazione tangenziale e normale','m/s²'],['v = ṙ û_r + r θ̇ û_θ','极坐标速度','velocità in coordinate polari','m/s'],['a_r = r̈ − rθ̇²，a_θ = rθ̈ + 2ṙθ̇','极坐标加速度','accelerazione in coordinate polari','m/s²'],['v_A = v_B + v_AB','伽利略速度合成','composizione delle velocità','m/s']],
din:[['ΣF = ma','牛顿第二定律','secondo principio','F [N] = kg·m/s²'],['f_s ≤ μ_s N，f_d = μ_d N','摩擦力','attrito statico / dinamico','μ 无量纲'],['a = g(sinθ − μ_d cosθ)','斜面下滑加速度','piano inclinato','m/s²'],['a = (m₂ − m₁)g/(m₁ + m₂)','阿特伍德机','macchina di Atwood','m/s²'],['F_app = −m a_O','平移惯性力','forza di trascinamento','N'],['F_cf = mω²r，F_Cor = −2m ω × v′','离心力与科里奥利力','forza centrifuga, di Coriolis','N']],
ene:[['W = ∫F·ds = F s cosθ','功','lavoro','J = N·m'],['K = ½mv²，W_tot = ΔK','动能定理','teorema dell’energia cinetica','J'],['U_g = mgh，U_el = ½kx²','势能','energia potenziale','J, k [N/m]'],['F = −dU/dx','保守力与势能','forza conservativa','N'],['W_nc = ΔE_mecc','非保守力做功','lavoro forze non conservative','J'],['d²U/dx² > 0 ⇒ 稳定','平衡稳定性','stabilità dell’equilibrio','J/m²'],['P = dW/dt = F·v','功率','potenza','W = J/s']],
qdm:[['p = mv，J = ∫F dt = Δp','动量与冲量','quantità di moto, impulso','kg·m/s = N·s'],['x_CM = Σmᵢxᵢ / Σmᵢ','质心','centro di massa','m'],['v₁′ = [(m₁ − e m₂)v₁ + (1 + e)m₂v₂]/(m₁ + m₂)','一维碰撞','urto in 1D','e 恢复系数'],['Δv = u ln(m₀/m_f)','齐奥尔科夫斯基方程','equazione di Tsiolkovsky','u [m/s]'],['F_spinta = u |dm/dt|','推力','spinta','N']],
rig:[['τ = r × F，Στ = Iα','转动第二定律','II eq. cardinale','τ [N·m], I [kg·m²]'],['I = Σmr²，I = I_CM + Md²','转动惯量与平行轴定理','momento d’inerzia, Huygens–Steiner','kg·m²'],['L = Iω，dL/dt = τ_ext','角动量','momento angolare','kg·m²/s'],['K = ½Mv²_CM + ½I_CM ω²','滚动动能','energia di rotolamento','J'],['a = g sinθ / (1 + I/MR²)','纯滚动加速度','rotolamento puro','m/s²'],['mvd = (I + md²)ω','质点–刚体完全非弹性碰撞','urto punto–corpo rigido','rad/s'],['ΣF = 0，Στ = 0','静力平衡','equilibrio statico','—']],
osc:[['ω₀ = √(k/m)，T = 2π√(m/k)','弹簧振子','oscillatore armonico','ω [rad/s]'],['x = A e^(−γt) cos(ω_d t + φ)，ω_d = √(ω₀² − γ²)','阻尼振动 (γ = b/2m)','oscillatore smorzato','γ [1/s]'],['A(ω) = (F₀/m)/√((ω₀² − ω²)² + 4γ²ω²)','受迫振动','oscillazioni forzate, risonanza','m'],['T = 2π√(L/g)','单摆（小角度）','pendolo semplice','s'],['E = ½kA²','振动能量','energia dell’oscillatore','J']],
grav:[['F = G m₁m₂ / r²','万有引力','legge di gravitazione universale','G = 6.674×10⁻¹¹ N·m²/kg²'],['U = −GMm / r','引力势能','energia potenziale gravitazionale','J'],['v_c = √(GM/r)，v_f = √(2GM/R)','环绕速度与逃逸速度','velocità orbitale, di fuga','m/s'],['T² = 4π²a³ / (GM)','开普勒第三定律','terza legge di Keplero','s, m']],
flu:[['p = p₀ + ρgh','斯蒂文定律','legge di Stevino','Pa'],['F_A = ρ_f g V_imm','阿基米德浮力','spinta di Archimede','N'],['A₁v₁ = A₂v₂','连续性方程','equazione di continuità','m³/s'],['p + ½ρv² + ρgh = cost.','伯努利方程','equazione di Bernoulli','Pa'],['v = √(2gh)','托里拆利定律','legge di Torricelli','m/s']],
cal:[['Q = mcΔT = nC ΔT','热量与比热','calore specifico','c [J/(kg·K)]'],['Q = mλ','相变潜热','calore latente','λ [J/kg]'],['ΔL = αL₀ΔT，ΔV = βV₀ΔT (β ≈ 3α)','热膨胀','dilatazione termica','α [K⁻¹]'],['P = kA ΔT / L','傅里叶导热定律','legge di Fourier','k [W/(m·K)]'],['P = hA ΔT','对流（牛顿冷却定律）','convezione','h [W/(m²·K)]'],['P = εσA T⁴，σ = 5.67×10⁻⁸','斯特藩–玻尔兹曼定律','legge di Stefan–Boltzmann','W/(m²·K⁴)'],['λ_max T = 2.898×10⁻³ m·K','维恩位移定律','legge di Wien','m·K']],
gas:[['PV = nRT = NkT','理想气体状态方程','equazione di stato dei gas perfetti','R = 8.314 J/(mol·K)'],['⟨K⟩ = (3/2)kT，v_rms = √(3RT/M)','分子动理论','teoria cinetica','M [kg/mol]'],['v_p = √(2RT/M)，⟨v⟩ = √(8RT/πM)','麦克斯韦特征速率','velocità caratteristiche','m/s'],['(P + an²/V²)(V − nb) = nRT','范德瓦尔斯方程','equazione di van der Waals','a [Pa·m⁶/mol²], b [m³/mol]'],['T_c = 8a/(27Rb)，P_c = a/(27b²)，V_c = 3nb','临界点','punto critico','K, Pa']],
p1:[['ΔU = Q − L','热力学第一定律','primo principio','J'],['ΔU = nC_V ΔT，C_P − C_V = R','内能与摩尔热容','energia interna, Mayer','J/(mol·K)'],['L_isoT = nRT ln(V₂/V₁)','等温功','lavoro isotermo','J'],['PV^γ = cost.，TV^(γ−1) = cost.','绝热可逆','adiabatica reversibile','γ = C_P/C_V'],['L_adiab = (P₁V₁ − P₂V₂)/(γ − 1)','绝热功','lavoro adiabatico','J'],['η = L/Q_ass = 1 − |Q_c|/Q_h','热机效率','rendimento','—'],['η_C = 1 − T_c/T_h','卡诺效率','rendimento di Carnot','T [K]'],['η_Otto = 1 − 1/r^(γ−1)','奥托循环','ciclo Otto','r 压缩比'],['COP_frigo = |Q_c|/L','制冷系数','coefficiente di prestazione','—']],
p2:[['dS = δQ_rev / T','熵的定义','entropia','J/K'],['ΔS = nC_V ln(T₂/T₁) + nR ln(V₂/V₁)','理想气体熵变','variazione di entropia del gas','J/K'],['ΔS = mc ln(T₂/T₁)','固液加热熵变','entropia di un corpo','J/K'],['∮δQ/T ≤ 0','克劳修斯不等式','disuguaglianza di Clausius','J/K'],['ΔS_univ ≥ 0','熵增原理','principio di aumento dell’entropia','J/K']]
};
function formule(root){
  root.innerHTML=head('公式速查','Formulario',L('按章节整理，右侧为符号单位（SI）。','Raccolta per capitolo con unità SI.'))+
    `<div class="fsearch"><input type="search" placeholder="${L('筛选公式…','filtra…')}" aria-label="filter"></div><div class="fsheet">${Lab.chapters.map(c=>`<section class="card fsec" data-ch="${c.id}"><h4>${L2(c.zh,c.it)}</h4><table class="ftbl">${(F[c.id]||[]).map(r=>`<tr data-s="${esc((r.join(' ')).toLowerCase())}"><td class="ff">${r[0]}</td><td class="fn">${L2(r[1],r[2])}</td><td class="fu">${r[3]}</td></tr>`).join('')}</table><div class="flinks">${c.topics.map(id=>{const t=Lab.topics.find(x=>x.id===id);return `<a href="#${id}">${L(t.title,t.it.split(/ — /)[0])}</a>`;}).join('')}</div></section>`).join('')}</div>`;
  const inp=root.querySelector('.fsearch input');
  inp.oninput=()=>{ const q=inp.value.trim().toLowerCase(); root.querySelectorAll('.fsec').forEach(s=>{ let any=false; s.querySelectorAll('tr').forEach(r=>{ const h=!q||r.dataset.s.includes(q); r.style.display=h?'':'none'; any=any||h; }); s.style.display=any?'':'none'; }); };
}

/* ---------------- Glossary ---------------- */
const GL=`矢量|vettore;标量|scalare;标量积（点积）|prodotto scalare;矢量积（叉积）|prodotto vettoriale;分量|componente;单位矢量|versore;导数|derivata;积分|integrale;位移|spostamento;路程|distanza percorsa;速度|velocità;速率|modulo della velocità;加速度|accelerazione;匀速直线运动|moto rettilineo uniforme;匀加速运动|moto uniformemente accelerato;自由落体|caduta libera;抛体运动|moto del proiettile;射程|gittata;轨迹|traiettoria;圆周运动|moto circolare;角速度|velocità angolare;角加速度|accelerazione angolare;向心加速度|accelerazione centripeta;切向加速度|accelerazione tangenziale;法向加速度|accelerazione normale;曲率半径|raggio di curvatura;极坐标|coordinate polari;参考系|sistema di riferimento;惯性系|sistema inerziale;非惯性系|sistema non inerziale;相对速度|velocità relativa;力|forza;质量|massa;重力|forza peso;法向力（支持力）|reazione normale;摩擦力|forza d'attrito;静摩擦系数|coefficiente di attrito statico;动摩擦系数|coefficiente di attrito dinamico;斜面|piano inclinato;绳的张力|tensione della fune;滑轮|carrucola;弹力|forza elastica;胡克定律|legge di Hooke;惯性力|forza apparente;离心力|forza centrifuga;科里奥利力|forza di Coriolis;受力分析图|diagramma di corpo libero;功|lavoro;功率|potenza;动能|energia cinetica;势能|energia potenziale;机械能|energia meccanica;保守力|forza conservativa;非保守力|forza non conservativa;能量守恒|conservazione dell'energia;平衡位置|posizione di equilibrio;稳定平衡|equilibrio stabile;不稳定平衡|equilibrio instabile;动量|quantità di moto;冲量|impulso;质心|centro di massa;碰撞|urto;弹性碰撞|urto elastico;完全非弹性碰撞|urto completamente anelastico;恢复系数|coefficiente di restituzione;火箭|razzo;推力|spinta;变质量系统|sistema a massa variabile;刚体|corpo rigido;转动惯量|momento d'inerzia;力矩|momento torcente / momento di una forza;角动量|momento angolare;平行轴定理|teorema di Huygens-Steiner;纯滚动|rotolamento puro;转轴|asse di rotazione / perno;杠杆|leva;静力平衡|equilibrio statico;简谐振动|moto armonico;振幅|ampiezza;周期|periodo;频率|frequenza;角频率|pulsazione;相位|fase;阻尼|smorzamento;受迫振动|oscillazioni forzate;共振|risonanza;单摆|pendolo semplice;万有引力|gravitazione universale;引力常量|costante di gravitazione universale;轨道|orbita;逃逸速度|velocità di fuga;开普勒定律|leggi di Keplero;压强|pressione;密度|densità;浮力|spinta di Archimede;流量|portata;连续性方程|equazione di continuità;伯努利方程|equazione di Bernoulli;粘滞性|viscosità;温度|temperatura;热量|calore;比热容|calore specifico;摩尔热容|calore molare;热容|capacità termica;潜热|calore latente;熔化|fusione;汽化|vaporizzazione;相变|cambiamento di fase;热平衡|equilibrio termico;量热器|calorimetro;线膨胀系数|coefficiente di dilatazione lineare;体膨胀系数|coefficiente di dilatazione volumica;热传导|conduzione;导热系数|conducibilità termica;对流|convezione;热辐射|irraggiamento;黑体|corpo nero;发射率|emissività;理想气体|gas perfetto / gas ideale;实际气体|gas reale;摩尔|mole;阿伏伽德罗常数|numero di Avogadro;玻尔兹曼常数|costante di Boltzmann;状态方程|equazione di stato;临界点|punto critico;分子动理论|teoria cinetica dei gas;方均根速率|velocità quadratica media;最概然速率|velocità più probabile;平均自由程|cammino libero medio;等温过程|trasformazione isoterma;等压过程|trasformazione isobara;等容过程|trasformazione isocora;绝热过程|trasformazione adiabatica;可逆过程|trasformazione reversibile;不可逆过程|trasformazione irreversibile;准静态过程|trasformazione quasi-statica;内能|energia interna;状态函数|funzione di stato;热力学第一定律|primo principio della termodinamica;热机|macchina termica;制冷机|macchina frigorifera;热泵|pompa di calore;效率|rendimento;制冷系数|coefficiente di prestazione (COP);热源|sorgente / serbatoio di calore;卡诺循环|ciclo di Carnot;奥托循环|ciclo Otto;狄塞尔循环|ciclo Diesel;压缩比|rapporto di compressione;热力学第二定律|secondo principio della termodinamica;开尔文表述|enunciato di Kelvin-Planck;克劳修斯表述|enunciato di Clausius;熵|entropia;克劳修斯不等式|disuguaglianza di Clausius;自由膨胀|espansione libera;宇宙熵变|variazione di entropia dell'universo`.split(';').map(s=>s.split('|'));
function glossario(root){
  root.innerHTML=head('中意术语表','Glossario cinese–italiano',L(`${GL.length} 个术语，可按中文、意大利语或拼写搜索。`,`${GL.length} termini, ricerca in entrambe le lingue.`))+
   `<div class="fsearch"><input type="search" placeholder="${L('搜索：如 熵 / entropia','cerca: es. entropia / 熵')}" aria-label="search"><span class="cnt"></span></div><div class="card"><table class="gtbl"><thead><tr><th>${L('中文','Cinese')}</th><th>${L('意大利语','Italiano')}</th></tr></thead><tbody>${GL.map(([z,i])=>`<tr data-s="${esc((z+' '+i).toLowerCase())}">${it?`<td class="gi">${esc(i)}</td><td>${z}</td>`:`<td>${z}</td><td class="gi">${esc(i)}</td>`}</tr>`).join('')}</tbody></table></div>`;
  if(it){ const th=root.querySelectorAll('th'); th[0].textContent='Italiano'; th[1].textContent='Cinese'; }
  const inp=root.querySelector('input'), cnt=root.querySelector('.cnt');
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const f=()=>{ const q=norm(inp.value.trim().toLowerCase()); let n=0; root.querySelectorAll('tbody tr').forEach(r=>{ const h=!q||norm(r.dataset.s).includes(q); r.style.display=h?'':'none'; if(h) n++; }); cnt.textContent=n+' / '+GL.length; };
  inp.oninput=f; f(); inp.focus();
}

/* ---------------- Unit converter ---------------- */
const U={
 '能量 · Energia':[['J',1],['kJ',1e3],['cal',4.186],['kcal',4186],['L·atm',101.325],['eV',1.602176634e-19],['kWh',3.6e6]],
 '压强 · Pressione':[['Pa',1],['kPa',1e3],['bar',1e5],['atm',101325],['mmHg (torr)',133.322],['psi',6894.76]],
 '体积 · Volume':[['m³',1],['L (dm³)',1e-3],['mL (cm³)',1e-6]],
 '速度 · Velocità':[['m/s',1],['km/h',1/3.6],['mph',0.44704],['knot',0.514444]],
 '长度 · Lunghezza':[['m',1],['cm',1e-2],['mm',1e-3],['km',1e3],['μm',1e-6],['nm',1e-9]],
 '质量 · Massa':[['kg',1],['g',1e-3],['t',1e3],['u (amu)',1.66053907e-27]],
 '角度 · Angolo':[['rad',1],['°',Math.PI/180],['giri (rev)',2*Math.PI]],
 '角速度 · Velocità angolare':[['rad/s',1],['rpm (giri/min)',2*Math.PI/60],['°/s',Math.PI/180]],
 '功率 · Potenza':[['W',1],['kW',1e3],['CV (cavallo vapore)',735.499],['hp',745.7]],
 '温度 · Temperatura':[['K',null],['°C',null],['°F',null]]
};
const toK={K:v=>v,'°C':v=>v+273.15,'°F':v=>(v-32)*5/9+273.15}, fromK={K:v=>v,'°C':v=>v-273.15,'°F':v=>(v-273.15)*9/5+32};
function unita(root){
  root.innerHTML=head('单位换算','Conversione di unità',L('热学题最常卡在单位：L·atm、cal、°C/K、kPa/bar/atm。输入任一格，其余自动换算。','Scrivi in un campo qualsiasi: gli altri si aggiornano.'))+
    `<div class="ugrid">${Object.keys(U).map((k,ci)=>{ const [zh,itn]=k.split(' · '); return `<div class="card ucard" data-c="${ci}"><h4>${L2(zh,itn)}</h4>${U[k].map((u,ui)=>`<label class="urow"><input type="text" inputmode="decimal" data-u="${ui}" aria-label="${u[0]}"><span>${u[0]}</span></label>`).join('')}</div>`; }).join('')}</div>
    <div class="card"><h4>${L2('常用换算','Equivalenze utili')}</h4><div class="kgrid"><span>1 L·atm = 101.325 J</span><span>1 cal = 4.186 J</span><span>T(K) = T(°C) + 273.15</span><span>1 atm = 1.01325 bar = 760 mmHg</span><span>1 m³ = 1000 L</span><span>36 km/h = 10 m/s</span><span>1 rpm = 2π/60 rad/s</span><span>ΔT(K) = ΔT(°C)</span></div></div>`;
  const nf=v=>{ if(!isFinite(v)) return ''; const a=Math.abs(v); return (a!==0&&(a>=1e7||a<1e-4))?v.toExponential(5):String(+v.toPrecision(7)); };
  root.querySelectorAll('.ucard').forEach(card=>{ const k=Object.keys(U)[+card.dataset.c], us=U[k], ins=[...card.querySelectorAll('input')];
    const fill=(src)=>{ const v=parseFloat(String(ins[src].value).replace(',','.')); if(isNaN(v)){ ins.forEach((x,i)=>{ if(i!==src) x.value=''; }); return; }
      if(us[0][1]===null){ const K=toK[us[src][0]](v); ins.forEach((x,i)=>{ if(i!==src) x.value=nf(fromK[us[i][0]](K)); }); }
      else { const si=v*us[src][1]; ins.forEach((x,i)=>{ if(i!==src) x.value=nf(si/us[i][1]); }); } };
    ins.forEach((x,i)=>x.addEventListener('input',()=>fill(i)));
    ins[0].value=us[0][1]===null?'300':'1'; fill(0); });
}

function render(route,root){
  root.className='main page'; const [p,arg]=route.split('/');
  ({home,quiz:r=>quiz(r,arg),problemi:r=>problems(r,arg),formule,glossario,unita}[p]||home)(root);
}
return {render, F, GL, U};
})();

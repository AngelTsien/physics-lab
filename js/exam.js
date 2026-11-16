'use strict';
/* ========== Chapters ========== */
Lab.chapters=[
 {id:'pre',group:'mech',zh:'预备知识',it:'Prerequisiti matematici',topics:['vettori']},
 {id:'cin',group:'mech',zh:'运动学',it:'Cinematica',topics:['cinematica','proiettile','circolare','polari','relativi']},
 {id:'din',group:'mech',zh:'动力学',it:'Dinamica del punto',topics:['inclinato','atwood','noninerziali']},
 {id:'ene',group:'mech',zh:'功与能',it:'Lavoro ed energia',topics:['energia','lavoro_nc','potenziale']},
 {id:'qdm',group:'mech',zh:'动量与碰撞',it:'Quantità di moto e urti',topics:['impulso','urti','razzo']},
 {id:'rig',group:'mech',zh:'刚体',it:'Corpo rigido',topics:['rigido','pattinatore','urto_rigido','statica']},
 {id:'osc',group:'mech',zh:'振动',it:'Oscillazioni',topics:['oscillatore','pendolo']},
 {id:'grav',group:'mech',zh:'万有引力',it:'Gravitazione',topics:['gravitazione']},
 {id:'flu',group:'mech',zh:'流体',it:'Fluidi',topics:['idrostatica','bernoulli']},
 {id:'cal',group:'thermo',zh:'温度与热',it:'Temperatura e calore',topics:['calorimetria','dilatazione','conduzione','irraggiamento']},
 {id:'gas',group:'thermo',zh:'气体',it:'Gas ideali e reali',topics:['cinetica','trasformazioni','vanderwaals']},
 {id:'p1',group:'thermo',zh:'第一定律与循环',it:'Primo principio e cicli',topics:['primo','cicli']},
 {id:'p2',group:'thermo',zh:'第二定律与熵',it:'Secondo principio ed entropia',topics:['entropia','clausius']}
];
Lab.chapterOf=id=>Lab.chapters.find(c=>c.topics.includes(id));

/* ========== Worked examples + common mistakes (parameters = slider defaults) ========== */
const g_=9.81;
Lab.exam={
 vettori:{ex:[{q:'A = 6（方向 30°），B = 4（方向 110°）。求标量积 A·B。',ask:'A·B',ans:24*Math.cos(80*DEG),unit:'',steps:['夹角 φ = 110° − 30° = 80°','A·B = AB cosφ = 6 × 4 × cos80°','= 24 × 0.1736 ≈ 4.17（用分量 AₓBₓ + A_yB_y 结果相同）']}],
   mis:['把角度当成弧度输入计算器（cos80 ≠ cos80°）','点积结果写成矢量；叉积结果写成标量','叉积方向忘记右手定则，A×B = −B×A']},
 cinematica:{ex:[{q:'x₀ = −10 m，v₀ = 6 m/s，a = −1.5 m/s²。小车何时速度为零？此时位置 x 是多少？',ask:'x（v = 0 时）',ans:2,unit:'m',steps:['v = v₀ + at = 0 ⇒ t = v₀/|a| = 6/1.5 = 4 s','x = x₀ + v₀t + ½at² = −10 + 24 − ½·1.5·16','x = −10 + 24 − 12 = 2 m（之后小车反向运动）']}],
   mis:['忘记 a 的符号（减速时 a 与 v 反号）','把"位移"和"路程"混为一谈——反向运动后路程继续增加','用 x = vt 处理有加速度的运动']},
 proiettile:{ex:[{q:'v₀ = 20 m/s，θ = 50°，从地面发射 (g = 9.81 m/s²)。求射程 R。',ask:'R',ans:400*Math.sin(100*DEG)/g_,unit:'m',steps:['R = v₀² sin2θ / g','sin(100°) = 0.9848','R = 400 × 0.9848 / 9.81 ≈ 40.2 m'] },{q:'同一次发射的最大高度 h_max？',ask:'h_max',ans:(20*Math.sin(50*DEG))**2/(2*g_),unit:'m',steps:['v_y0 = v₀ sin50° = 15.32 m/s','最高点 v_y = 0：h = v_y0²/(2g)','h = 234.7/19.62 ≈ 11.96 m']}],
   mis:['在最高点认为速度为零（其实 vₓ 不变，只有 v_y = 0）','h₀ ≠ 0 时仍套用 R = v₀²sin2θ/g','水平方向也加上了 g']},
 circolare:{ex:[{q:'R = 2 m，ω = 1.5 rad/s（α = 0）。求向心加速度和周期。',ask:'a_c',ans:4.5,unit:'m/s²',steps:['a_c = ω²R = 2.25 × 2 = 4.5 m/s²','v = ωR = 3 m/s，也可用 v²/R = 9/2','T = 2π/ω = 4.19 s']}],
   mis:['认为匀速圆周运动没有加速度','向心力当成一种额外的力画进受力图（它只是合力的名称）','ω 用 rpm 或 °/s 代入未换算成 rad/s']},
 polari:{ex:[{q:'椭圆 x = 3cos(ωt)，y = 2sin(ωt)，ω = 0.8 rad/s。求 t = 0（长轴端点）处的曲率半径 ρ。',ask:'ρ',ans:4/3,unit:'m',steps:['t = 0：v = (0, bω) = (0, 1.6) m/s','a = (−aω², 0) = (−1.92, 0) m/s²，与 v 垂直 ⇒ a_t = 0，a_n = 1.92','ρ = v²/a_n = 2.56/1.92 = 1.33 m（= b²/a）']}],
   mis:['把 a_n = v²/ρ 中的 ρ 当成到原点的距离 r','极坐标中忘记 −rθ̇² 和 2ṙθ̇ 两项','以为速率不变则加速度为零']},
 relativi:{ex:[{q:'河宽 100 m，水流 2 m/s，船速（相对水）4 m/s，船头垂直对岸。求过河时间和漂移距离。',ask:'漂移 d',ans:50,unit:'m',steps:['垂直分量 v_y = 4 m/s ⇒ t = 100/4 = 25 s','水流方向速度 = 2 m/s','d = 2 × 25 = 50 m']}],
   mis:['以为偏向上游能更快到达（时间只取决于垂直分量）','速度矢量直接相加模长（4 + 2 = 6）','混淆"相对速度"和"牵连速度"']},
 inclinato:{ex:[{q:'m = 5 kg，θ = 30°，μ_s = 0.5，μ_d = 0.3，无外力。物块会滑动吗？加速度多大？',ask:'a',ans:g_*(Math.sin(30*DEG)-0.3*Math.cos(30*DEG)),unit:'m/s²',steps:['滑动条件 tanθ > μ_s：tan30° = 0.577 > 0.5 ⇒ 会滑动','滑动后用动摩擦：a = g(sinθ − μ_d cosθ)','a = 9.81 × (0.5 − 0.3 × 0.866) ≈ 2.36 m/s²']}],
   mis:['静止时直接写 f = μ_sN（静摩擦是"最多"μ_sN）','N = mg（斜面上 N = mg cosθ）','判断是否滑动时用了 μ_d']},
 atwood:{ex:[{q:'m₁ = 2 kg，m₂ = 3 kg，滑轮无质量。求加速度和绳张力。',ask:'T',ans:2*2*3*g_/5,unit:'N',steps:['a = (m₂ − m₁)g/(m₁ + m₂) = 9.81/5 = 1.96 m/s²','对 m₁：T − m₁g = m₁a ⇒ T = m₁(g + a)','T = 2 × 11.77 ≈ 23.5 N（介于 m₁g 与 m₂g 之间）']}],
   mis:['认为张力 = m₂g（m₂ 加速下降，T < m₂g）','两物体加速度方向取同一坐标轴导致符号错误','滑轮有质量时仍认为两边张力相等']},
 noninerziali:{ex:[{q:'电梯以 a = 3 m/s² 向上加速，70 kg 的人站在体重秤上。秤的读数（以 kg 显示）？',ask:'读数',ans:70*(g_+3)/g_,unit:'kg',steps:['电梯系中加惯性力 −ma（向下）：N = m(g + a)','N = 70 × 12.81 = 896.7 N','秤显示 N/g = 91.4 kg']}],
   mis:['在惯性系分析时也加上惯性力（重复计算）','离心力和向心力同时画在惯性系受力图里','向下加速时读数应变小，符号用反']},
 energia:{ex:[{q:'双势阱轨道，m = 2 kg 从 x₀ = −7.5 m 静止释放（U(x₀) = 114.96 J，无摩擦）。到达最低点 (h = 0) 时速率？',ask:'v',ans:Math.sqrt(2*114.96/2),unit:'m/s',steps:['机械能守恒：mgh₀ = ½mv²','½ × 2 × v² = 114.96 J','v = √114.96 ≈ 10.7 m/s（与质量无关）']}],
   mis:['在曲面上用 v² = 2as 而不是能量守恒','有摩擦时仍认为机械能守恒','高度参考点前后不一致']},
 lavoro_nc:{ex:[{q:'m = 1 kg，v₀ = 6 m/s，μ_d = 0.2，滑行 3 m 后碰到弹簧。碰到弹簧时速率？',ask:'v',ans:Math.sqrt(36-2*0.2*g_*3),unit:'m/s',steps:['L_nc = −μmg·s = −0.2 × 9.81 × 3 = −5.886 J','ΔK = L_nc：½v² = 18 − 5.886 = 12.114 J/kg','v = √24.23 ≈ 4.92 m/s']}],
   mis:['摩擦功用位移而不是路程（来回运动时）','把 L_nc 当正值加到能量里','忘记弹簧压缩过程中摩擦仍在做功']},
 potenziale:{ex:[{q:'U(x) = x⁴ − 4x²（J，m = 1 kg）。求在稳定平衡点 x = √2 附近的小振动周期。',ask:'T',ans:Math.PI/2,unit:'s',steps:['U′ = 4x³ − 8x = 0 ⇒ x = 0（不稳定），x = ±√2（稳定）','U″ = 12x² − 8 = 24 − 8 = 16 N/m（等效劲度 k）','T = 2π√(m/k) = 2π/4 ≈ 1.571 s']}],
   mis:['把 U 的极大值当成稳定平衡','F = +dU/dx（应为负号）','认为 E < U 的区域质点也能到达']},
 impulso:{ex:[{q:'m = 0.5 kg 静止，受三角形力：F_max = 200 N，Δt = 0.1 s。求末速度和平均力。',ask:'v_f',ans:20,unit:'m/s',steps:['J = 三角形面积 = ½ × 200 × 0.1 = 10 N·s','Δv = J/m = 20 m/s','F_m = J/Δt = 100 N；ΔK = ½·0.5·400 = 100 J']}],
   mis:['用峰值力乘时间计算三角形力的冲量','冲量是矢量，反弹时 Δp = m(v_f − v_i) 要带符号','以为冲量相同做功也相同（功取决于速度）']},
 urti:{ex:[{q:'一维弹性碰撞：m₁ = 2 kg 以 3 m/s，m₂ = 4 kg 以 −1 m/s。求碰后 v₁′。',ask:"v₁′",ans:((2-4)*3+2*4*(-1))/6,unit:'m/s',steps:["v₁′ = [(m₁ − m₂)v₁ + 2m₂v₂]/(m₁ + m₂)","= [(−2)(3) + 8(−1)]/6 = −14/6","v₁′ ≈ −2.33 m/s（反弹）；v₂′ = +1.67 m/s"]}],
   mis:['非弹性碰撞也用动能守恒','速度忘记带方向符号','完全非弹性碰撞以为动能全部损失（只损失相对质心的部分）']},
 razzo:{ex:[{q:'m₀ = 1000 kg，燃料 80 %，u = 2500 m/s，t_b = 60 s，竖直发射。求燃尽时速度。',ask:'v_b',ans:2500*Math.log(5)-g_*60,unit:'m/s',steps:['m_f = 200 kg，m₀/m_f = 5','Δv = u ln5 − g t_b = 2500 × 1.609 − 588.6','v_b ≈ 3435 m/s']}],
   mis:['用 F = ma 且 m 不变','ln(m₀/m_f) 写成 ln(m_f/m₀)（符号错）','忘记竖直发射的重力损失 g t_b']},
 rigido:{ex:[{q:'θ = 15°，斜面长 3 m，均匀圆盘从静止纯滚动。求到达底端的时间。',ask:'t',ans:Math.sqrt(2*3/(g_*Math.sin(15*DEG)/1.5)),unit:'s',steps:['圆盘 I/(mR²) = 1/2 ⇒ a = g sinθ/1.5','a = 9.81 × 0.2588/1.5 = 1.693 m/s²','t = √(2L/a) = √(6/1.693) ≈ 1.88 s']}],
   mis:['滚动时也用 a = g sinθ','认为纯滚动的静摩擦力做功','I 用了错误的轴（应绕质心，或用平行轴定理）']},
 pattinatore:{ex:[{q:'I_corpo = 1.0 kg·m²，两臂各 4 kg。r 从 0.8 m 收到 0.15 m，ω₀ = 2 rad/s。求收臂后 ω。',ask:'ω',ans:2*(1+8*0.64)/(1+8*0.0225),unit:'rad/s',steps:['I₁ = 1 + 2·4·0.8² = 6.12 kg·m²','I₂ = 1 + 2·4·0.15² = 1.18 kg·m²','ω₂ = I₁ω₁/I₂ = 12.24/1.18 ≈ 10.4 rad/s']}],
   mis:['以为转动动能也守恒','转动惯量与距离成正比（应为 r²）','把角动量守恒用于有外力矩的情况']},
 urto_rigido:{ex:[{q:'细杆 M = 2 kg、L = 1 m 绕上端转动，子弹 m = 0.1 kg、v = 20 m/s 在 d = 0.8 m 处嵌入。求碰后 ω。',ask:'ω',ans:0.1*20*0.8/(2/3+0.1*0.64),unit:'rad/s',steps:['对转轴角动量守恒：mvd = (ML²/3 + md²)ω','I = 0.667 + 0.064 = 0.731 kg·m²','ω = 1.6/0.731 ≈ 2.19 rad/s']}],
   mis:['对有转轴的系统使用线动量守恒','I 用 ML²/12（那是绕中心）','忘记子弹嵌入后自身的转动惯量 md²']},
 statica:{ex:[{q:'支点在中心，m₁ = 6 kg 在 −1.5 m，杆质量 2 kg（重心在支点上）。m₂ 放在 +1.5 m，m₂ 应为多少才平衡？',ask:'m₂',ans:6,unit:'kg',steps:['对支点取矩：杆重力矩为 0（重心在支点）','m₁g·1.5 = m₂g·1.5','m₂ = 6 kg；支点支持力 R = (6 + 6 + 2)g = 137 N']}],
   mis:['力矩只算力不乘力臂','忘记杆本身的重力矩（支点不在中心时）','只写 Στ = 0 忘记 ΣF = 0 求支持力']},
 oscillatore:{ex:[{q:'m = 1 kg，k = 20 N/m，b = 0.4 kg/s，x₀ = 0.3 m。5 s 后振幅约为多少？',ask:'A(5 s)',ans:0.3*Math.exp(-0.2*5),unit:'m',steps:['γ = b/2m = 0.2 s⁻¹','A(t) = x₀e^{−γt}（欠阻尼包络）','A(5) = 0.3 × e^{−1} ≈ 0.110 m']}],
   mis:['周期用 2π√(k/m)（应为 √(m/k)）','把 ω（rad/s）和 f（Hz）混淆','共振频率在强阻尼时仍认为正好等于 ω₀']},
 pendolo:{ex:[{q:'L = 1.5 m，θ₀ = 60°，无阻尼。求小角度周期 T₀ 和最低点速率。',ask:'v_max',ans:Math.sqrt(2*g_*1.5*0.5),unit:'m/s',steps:['T₀ = 2π√(L/g) = 2.457 s（60° 实际周期约长 7 %）','能量守恒：v² = 2gL(1 − cosθ₀)','v = √(2 × 9.81 × 1.5 × 0.5) ≈ 3.84 m/s']}],
   mis:['大角度时仍用 T₀ = 2π√(L/g)','认为周期与质量或振幅有关（小角度时无关）','高度用 L sinθ 而不是 L(1 − cosθ)']},
 gravitazione:{ex:[{q:'绕地球：r₀ = 10000 km 处切向发射 v₀ = 7 km/s。求远地点距离。',ask:'r_apo',ans:(()=>{const GM=3.986004e14,r=1e7,v=7000,a=-GM/(2*(v*v/2-GM/r));return (2*a-r)/1e3;})(),unit:'km',steps:['ε = v²/2 − GM/r = 24.5 − 39.86 = −15.36 MJ/kg','a = −GM/(2ε) = 12975 km','r₀ 是近地点，r_apo = 2a − r₀ ≈ 15950 km']}],
   mis:['r 用离地高度而不是到地心距离','逃逸速度与发射方向有关（无关，只要不撞地）','开普勒第三定律中用 r 代替半长轴 a']},
 idrostatica:{ex:[{q:'木块 ρ = 600 kg/m³ 漂浮在水中。浸入体积比例？0.6 m 深处的绝对压强？',ask:'p(0.6 m)',ans:101325+1000*g_*0.6,unit:'Pa',steps:['漂浮：ρ_c V g = ρ_l V_imm g ⇒ V_imm/V = 0.6','p = p₀ + ρgh = 101325 + 1000 × 9.81 × 0.6','p ≈ 107211 Pa（表压 5886 Pa）']}],
   mis:['浮力用物体密度计算（应为液体密度）','混淆绝对压强与表压','认为压强与容器形状有关']},
 bernoulli:{ex:[{q:'d₁ = 20 cm，d₂ = 10 cm，v₁ = 1 m/s，水平管，p₁(表压) = 25 kPa。求 p₂。',ask:'p₂',ans:25-0.5*1000*(16-1)/1000,unit:'kPa',steps:['连续性：v₂ = v₁(d₁/d₂)² = 4 m/s','Bernoulli：p₂ = p₁ + ½ρ(v₁² − v₂²)','p₂ = 25 − 0.5 × 1000 × 15 /1000 = 17.5 kPa']}],
   mis:['面积比用直径比（应平方）','认为流速大处压强大','高度变化时忘记 ρgh 项']},
 calorimetria:{ex:[{q:'0.5 kg 冰从 −20 °C 加热，功率 1000 W。需要多少时间才能完全熔化？',ask:'t',ans:(0.5*2090*20+0.5*334000)/1000,unit:'s',steps:['冰升温：Q₁ = mc_gΔT = 0.5 × 2090 × 20 = 20.9 kJ','熔化：Q₂ = mL_f = 0.5 × 334000 = 167 kJ','t = (20.9 + 167) kJ / 1000 W ≈ 188 s']}],
   mis:['相变时仍用 Q = mcΔT（ΔT = 0）','冰、水、蒸汽用同一个比热','温度用 °C 计算熵（熵必须用 K）']},
 dilatazione:{ex:[{q:'钢杆 L₀ = 10 m（20 °C），加热到 120 °C。伸长多少？若两端夹紧，热应力多大？',ask:'ΔL',ans:12,unit:'mm',steps:['ΔL = αL₀ΔT = 12×10⁻⁶ × 10 × 100 = 0.012 m = 12 mm','夹紧：σ = EαΔT = 200 GPa × 12×10⁻⁶ × 100','σ = 240 MPa（接近钢的屈服强度！）']}],
   mis:['体膨胀系数用 α（应约为 3α）','ΔT 用 K 还是 °C？（差值相同，可互换）','以为孔洞受热会变小（其实同比例变大）']},
 conduzione:{ex:[{q:'铜棒 L = 0.5 m，A = 4 cm²，两端 100 °C 与 20 °C。稳态热流功率？',ask:'P',ans:401*4e-4*80/0.5,unit:'W',steps:['P = kAΔT/L','= 401 × 4×10⁻⁴ × 80 / 0.5','≈ 25.7 W']}],
   mis:['面积 cm² 未换算为 m²','热阻串联时把热导率相加','暂态过程也用稳态公式']},
 irraggiamento:{ex:[{q:'铁球 r = 5 cm，800 °C，环境 20 °C，e = 0.8。初始净辐射功率？',ask:'P_irr',ans:0.8*SIGMA*4*Math.PI*0.0025*(1073.15**4-293.15**4),unit:'W',steps:['A = 4πr² = 0.03142 m²','P = eσA(T⁴ − T_amb⁴)，T 必须用 K：1073.15 K, 293.15 K','P ≈ 0.8 × 5.67×10⁻⁸ × 0.03142 × 1.319×10¹² ≈ 1880 W']}],
   mis:['斯特藩定律中用摄氏温度','忘记减去环境吸收 T_amb⁴','以为辐射需要介质']},
 cinetica:{ex:[{q:'300 K 的氮气 N₂ (M = 0.028 kg/mol)。求方均根速率 v_rms。',ask:'v_rms',ans:Math.sqrt(3*R_GAS*300/0.028),unit:'m/s',steps:['v_rms = √(3RT/M)','= √(3 × 8.314 × 300 / 0.028)','≈ 517 m/s；v_p = 422 m/s，⟨v⟩ = 476 m/s']}],
   mis:['M 用 g/mol 未换算成 kg/mol','v_rms、⟨v⟩、v_p 混用','温度用 °C']},
 trasformazioni:{ex:[{q:'1 mol 理想气体从 200 kPa、12 L 等温膨胀到 30 L。求对外做功 L。',ask:'L',ans:2400*Math.log(2.5),unit:'J',steps:['等温：L = nRT ln(V₂/V₁)，nRT = P₁V₁ = 2400 J','L = 2400 × ln2.5','≈ 2199 J；ΔU = 0，Q = L']}],
   mis:['等温过程以为 Q = 0（是 ΔU = 0）','绝热过程用 PV = 常数','kPa·L 的乘积就是 J，不要再乘 1000']},
 vanderwaals:{ex:[{q:'CO₂：a = 0.364 Pa·m⁶/mol²，b = 4.267×10⁻⁵ m³/mol。求临界温度 T_c。',ask:'T_c',ans:8*0.364/(27*R_GAS*4.267e-5),unit:'K',steps:['T_c = 8a/(27Rb)','= 2.912 / (27 × 8.314 × 4.267×10⁻⁵)','≈ 304 K（31 °C）；P_c = a/(27b²) ≈ 74 bar']}],
   mis:['a、b 的单位混用 L/atm 与 SI','以为 T > T_c 加压也能液化','把不稳定区段当作真实状态']},
 primo:{ex:[{q:'1 mol 单原子气体从 A(300 kPa, 8 L) 到 B(100 kPa, 30 L)。求 ΔU，以及先等压后等容路径的 Q。',ask:'Q（路径 ①）',ans:900+6600,unit:'J',steps:['ΔU = (3/2)(P_BV_B − P_AV_A) = 1.5 × (3000 − 2400) = 900 J','路径①：L = P_A(V_B − V_A) = 300 × 22 = 6600 J（等容段 L = 0）','Q = ΔU + L = 7500 J']}],
   mis:['以为 Q 和 L 是状态函数','符号约定混乱：意大利教材 ΔU = Q − L（L 为气体对外做功）','忘记等容段 L = 0 但 Q ≠ 0']},
 cicli:{ex:[{q:'卡诺循环 T_h = 600 K，T_c = 300 K，1 mol 双原子气体，等温膨胀比 2.5。求 Q_ass 和净功。',ask:'L',ans:0.5*R_GAS*600*Math.log(2.5),unit:'J',steps:['Q_ass = nRT_h ln(V₂/V₁) = 8.314 × 600 × 0.916 = 4571 J','η = 1 − 300/600 = 50 %','L = ηQ_ass ≈ 2285 J']}],
   mis:['卡诺效率用 °C 计算','把放热 Q_ced 也算进 Q_ass','以为提高 T_c 能提高效率']},
 entropia:{ex:[{q:'1 kg 水 80 °C 与 1 kg 水 20 °C 混合（绝热）。求宇宙熵变。',ask:'ΔS',ans:4186*(Math.log(323.15/353.15)+Math.log(323.15/293.15)),unit:'J/K',steps:['T_f = 50 °C = 323.15 K','ΔS = mc ln(T_f/T₁) + mc ln(T_f/T₂)','= 4186 × (−0.0888 + 0.0975) ≈ +36 J/K > 0']}],
   mis:['ΔS = Q/T 用于温度变化的过程（应积分）','不可逆过程的 ΔS 直接用实际 Q/T','温度用 °C 计算对数']},
 clausius:{ex:[{q:'热机 T_h = 600 K，T_c = 300 K，每循环 |Q_h| = 1000 J，η = 40 %。求 ΔS_univ。',ask:'ΔS_univ',ans:-(1000/600-600/300),unit:'J/K',steps:['L = 400 J，|Q_c| = 600 J','∮δQ/T = 1000/600 − 600/300 = −0.333 J/K','ΔS_univ = +0.333 J/K > 0 ⇒ 不可逆，可实现（η < η_C = 50 %）']}],
   mis:['Q 的符号约定不一致','认为工质的熵变不为零（循环后 ΔS = 0）','以为 η = η_C 的机器就能实际造出来（需无限慢）']}
};

/* ========== Chapter quizzes (Italian exam style + Chinese) ========== */
Lab.quiz={
 pre:[{it:'Il prodotto scalare di due vettori perpendicolari è:',zh:'两个垂直矢量的标量积是：',o:['0','AB','−AB','un vettore perpendicolare 垂直矢量'],a:0,x:'A·B = AB cos90° = 0。'},
  {it:'|A × B| rappresenta:',zh:'|A × B| 表示：',o:['l\'area del parallelogramma 平行四边形面积','la proiezione di A su B','il coseno dell\'angolo','A + B'],a:0,x:'|A×B| = AB sinφ，就是以 A、B 为边的平行四边形面积。'},
  {it:'Se v(t) è la velocità, l\'area sotto il grafico v–t è:',zh:'若 v(t) 是速度，v–t 图下面积是：',o:['lo spostamento 位移','l\'accelerazione','la velocità media','il lavoro'],a:0,x:'∫v dt = Δx。'},
  {it:'La derivata di x(t) = 3t² è:',zh:'x(t) = 3t² 的导数是：',o:['6t','3t','t³','6'],a:0,x:'d(3t²)/dt = 6t。'}],
 cin:[{it:'Nel moto parabolico (senza attrito), nel punto più alto:',zh:'抛体运动最高点：',o:['v_y = 0 ma vₓ ≠ 0','v = 0','a = 0','vₓ = 0'],a:0,x:'水平速度不变，只有竖直分量为零；加速度始终为 g。'},
  {it:'Gittata massima (h₀ = 0) si ottiene per θ =',zh:'从地面发射时射程最大的角度：',o:['45°','30°','60°','90°'],a:0,x:'R = v₀²sin2θ/g，sin2θ = 1 ⇒ θ = 45°。'},
  {it:'Nel moto circolare uniforme l\'accelerazione è:',zh:'匀速圆周运动的加速度：',o:['diretta verso il centro 指向圆心','nulla','tangente','diretta verso l\'esterno'],a:0,x:'a_c = v²/R 指向圆心，只改变速度方向。'},
  {it:'Un corpo ha a_t ≠ 0 e a_n = 0. Il moto è:',zh:'a_t ≠ 0 且 a_n = 0，运动是：',o:['rettilineo vario 变速直线','circolare uniforme','parabolico','fermo'],a:0,x:'a_n = 0 ⇒ 曲率为零（直线），a_t ≠ 0 ⇒ 速率变化。'},
  {it:'Una barca attraversa un fiume. Il tempo minimo si ha quando la prua punta:',zh:'渡河时间最短时船头指向：',o:['perpendicolare alla riva 垂直河岸','controcorrente 45°','a favore di corrente','dipende dalla corrente'],a:0,x:'时间 = L/(v_rel cosφ)，φ = 0 时最小，与水流无关。'}],
 din:[{it:'Un blocco è fermo su un piano inclinato. La forza d\'attrito vale:',zh:'物块静止在斜面上，摩擦力：',o:['mg sinθ','μ_s mg cosθ','μ_d mg cosθ','0'],a:0,x:'静摩擦大小由平衡决定 f = mg sinθ ≤ μ_sN。'},
  {it:'Macchina di Atwood con m₂ > m₁ (carrucola ideale). La tensione T:',zh:'阿特伍德机 m₂ > m₁（理想滑轮），张力 T：',o:['m₁g < T < m₂g','T = m₂g','T = m₁g','T = (m₁+m₂)g'],a:0,x:'m₁ 加速上升 T > m₁g，m₂ 加速下降 T < m₂g。'},
  {it:'In un ascensore che scende accelerando con a = g, la bilancia segna:',zh:'电梯以 a = g 加速下降，体重秤读数：',o:['0','mg','2mg','mg/2'],a:0,x:'N = m(g − a) = 0，失重。'},
  {it:'La forza centrifuga:',zh:'离心力：',o:['esiste solo nel sistema rotante 只在转动系中','è la reazione della forza centripeta','agisce in ogni sistema','è sempre nulla'],a:0,x:'离心力是转动参考系中的视在力，不是向心力的反作用力。'}],
 ene:[{it:'Il lavoro della forza peso da A a B dipende:',zh:'重力从 A 到 B 做的功取决于：',o:['solo dalla differenza di quota 高度差','dal percorso','dalla velocità','dal tempo'],a:0,x:'重力是保守力，L = −ΔU = mg(h_A − h_B)。'},
  {it:'In presenza di attrito: L_nc =',zh:'有摩擦时：L_nc =',o:['ΔE_mecc','ΔK','−ΔU','0'],a:0,x:'L_tot = ΔK，L_cons = −ΔU ⇒ L_nc = ΔK + ΔU。'},
  {it:'Un punto di equilibrio stabile corrisponde a:',zh:'稳定平衡点对应：',o:['un minimo di U(x) U 的极小值','un massimo di U(x)','U = 0','F massima'],a:0,x:'U′ = 0 且 U″ > 0。'},
  {it:'Unità della potenza:',zh:'功率单位：',o:['W = J/s','J','N·s','kWh'],a:0,x:'kWh 是能量单位（3.6 MJ）。'}],
 qdm:[{it:'Il teorema dell\'impulso afferma:',zh:'冲量定理：',o:['J = Δp','J = ΔK','F = Δp','J = mΔv²'],a:0,x:'∫F dt = Δp。'},
  {it:'In un urto completamente anelastico si conserva:',zh:'完全非弹性碰撞中守恒的是：',o:['la quantità di moto 动量','l\'energia cinetica','entrambe','nessuna'],a:0,x:'外力冲量可忽略 ⇒ 动量守恒；动能有损失。'},
  {it:'Urto elastico obliquo tra masse uguali (una ferma): dopo l\'urto le velocità formano:',zh:'等质量弹性斜碰（一球静止），碰后两速度夹角：',o:['90°','45°','180°','0°'],a:0,x:'动量矢量三角形 + 动能守恒 ⇒ 勾股定理 ⇒ 90°。'},
  {it:'Per un razzo, Δv dipende da:',zh:'火箭的 Δv 取决于：',o:['u e m₀/m_f 喷速与质量比','solo dalla spinta','dal tempo di combustione (senza gravità)','dalla massa finale soltanto'],a:0,x:'Δv = u ln(m₀/m_f)。'}],
 rig:[{it:'Quale corpo arriva prima in fondo al piano (rotolamento puro)?',zh:'纯滚动比赛谁先到底？',o:['sfera piena 实心球','anello','disco','arrivano insieme'],a:0,x:'I/(mR²) 最小 (2/5) 的加速度最大。'},
  {it:'Una pattinatrice chiude le braccia: ω aumenta perché:',zh:'滑冰者收臂，ω 增大是因为：',o:['L = Iω si conserva e I diminuisce','l\'energia cinetica si conserva','aumenta il momento torcente','diminuisce l\'attrito'],a:0,x:'外力矩为零，L 守恒；K 反而增大（肌肉做功）。'},
  {it:'Urto proiettile–asta incernierata: si conserva sempre',zh:'子弹与带转轴的杆碰撞，一定守恒的是：',o:['il momento angolare rispetto al perno 对转轴角动量','la quantità di moto','l\'energia cinetica','niente'],a:0,x:'转轴力过转轴，力矩为零。'},
  {it:'Condizioni di equilibrio di un corpo rigido:',zh:'刚体平衡条件：',o:['ΣF = 0 e Στ = 0','solo ΣF = 0','solo Στ = 0','v = 0'],a:0,x:'两个条件都要满足。'}],
 osc:[{it:'Il periodo di una molla (massa m, costante k):',zh:'弹簧振子周期：',o:['2π√(m/k)','2π√(k/m)','√(k/m)','2πmk'],a:0,x:'ω₀ = √(k/m)，T = 2π/ω₀。'},
  {it:'Se raddoppia l\'ampiezza di un oscillatore armonico, il periodo:',zh:'简谐振子振幅加倍，周期：',o:['resta uguale 不变','raddoppia','dimezza','×√2'],a:0,x:'等时性：周期与振幅无关。'},
  {it:'Pendolo semplice: T dipende da',zh:'单摆周期取决于（小角度）：',o:['L e g','massa','ampiezza','L, g e massa'],a:0,x:'T = 2π√(L/g)。'},
  {it:'In risonanza (smorzamento piccolo), la frequenza della forzante è circa:',zh:'共振时（弱阻尼）驱动频率约等于：',o:['ω₀','2ω₀','0','ω₀/2'],a:0,x:'振幅在 ω ≈ ω₀ 处达到峰值。'}],
 grav:[{it:'La velocità di fuga dalla superficie di un pianeta è:',zh:'行星表面的逃逸速度：',o:['√(2GM/R)','√(GM/R)','2GM/R','GM/R²'],a:0,x:'½mv² − GMm/R = 0。'},
  {it:'Terza legge di Keplero:',zh:'开普勒第三定律：',o:['T² ∝ a³','T ∝ a','T² ∝ a²','T ∝ a³'],a:0,x:'T² = 4π²a³/GM。'},
  {it:'La seconda legge di Keplero è conseguenza della conservazione di:',zh:'开普勒第二定律源于什么守恒：',o:['momento angolare 角动量','energia','quantità di moto','massa'],a:0,x:'中心力力矩为零 ⇒ L 守恒 ⇒ 面积速度恒定。'},
  {it:'Un\'orbita con energia totale E < 0 è:',zh:'总能量 E < 0 的轨道是：',o:['ellittica (chiusa) 椭圆','iperbolica','parabolica','impossibile'],a:0,x:'束缚轨道。'}],
 flu:[{it:'La spinta di Archimede dipende da:',zh:'浮力取决于：',o:['densità del fluido e volume immerso','densità del corpo','profondità','forma del recipiente'],a:0,x:'F = ρ_l g V_imm。'},
  {it:'Legge di Stevino: la pressione a profondità h è:',zh:'斯蒂文定律：深度 h 处压强：',o:['p₀ + ρgh','ρgh/p₀','p₀ − ρgh','p₀'],a:0,x:'只与深度有关。'},
  {it:'In un tubo che si restringe (flusso ideale) la velocità:',zh:'理想流体在变窄的管中流速：',o:['aumenta e la pressione diminuisce 增大、压强减小','diminuisce','resta uguale','aumenta e la pressione aumenta'],a:0,x:'连续性 + 伯努利。'},
  {it:'Un ghiaccio (917 kg/m³) galleggia in acqua: frazione immersa ≈',zh:'冰在水中漂浮，浸入比例约：',o:['92 %','8 %','50 %','100 %'],a:0,x:'ρ_c/ρ_l = 0.917。'}],
 cal:[{it:'Durante la fusione a pressione costante, la temperatura:',zh:'熔化过程中温度：',o:['resta costante 不变','aumenta','diminuisce','oscilla'],a:0,x:'吸收的热量用作潜热。'},
  {it:'Il calore specifico dell\'acqua (≈ 4186 J/kg·K) è:',zh:'水的比热：',o:['più alto di quello del ghiaccio 比冰大','uguale al ghiaccio','più basso del rame','zero'],a:0,x:'c_acqua ≈ 2 × c_ghiaccio。'},
  {it:'Legge di Stefan–Boltzmann: se T (in K) raddoppia, la potenza emessa:',zh:'斯特藩定律：T 加倍，辐射功率：',o:['×16','×2','×4','×8'],a:0,x:'P ∝ T⁴。'},
  {it:'Coefficiente di dilatazione volumica di un solido isotropo:',zh:'各向同性固体的体膨胀系数：',o:['β ≈ 3α','β = α','β = α²','β = α/3'],a:0,x:'(1+αΔT)³ ≈ 1 + 3αΔT。'}],
 gas:[{it:'Secondo la teoria cinetica, la temperatura è proporzionale a:',zh:'分子动理论中温度正比于：',o:['energia cinetica media traslazionale 平均平动动能','velocità media','pressione','numero di moli'],a:0,x:'⟨K⟩ = (3/2)kT。'},
  {it:'Ordine delle velocità caratteristiche di Maxwell:',zh:'麦克斯韦特征速率大小：',o:['v_p < ⟨v⟩ < v_rms','v_rms < ⟨v⟩ < v_p','tutte uguali','⟨v⟩ < v_p < v_rms'],a:0,x:'√2 : √(8/π) : √3。'},
  {it:'In una trasformazione adiabatica reversibile di un gas ideale:',zh:'理想气体可逆绝热过程：',o:['PV^γ = cost.','PV = cost.','Q = L','ΔU = 0'],a:0,x:'Q = 0，ΔU = −L。'},
  {it:'Nell\'equazione di van der Waals, b tiene conto:',zh:'范德瓦尔斯方程中 b 考虑的是：',o:['del volume proprio delle molecole 分子体积','delle forze attrattive','della temperatura','della massa'],a:0,x:'a 对应吸引力，b 对应协体积。'}],
 p1:[{it:'Primo principio (convenzione L fatto dal gas):',zh:'第一定律（L 为气体对外做功）：',o:['ΔU = Q − L','ΔU = Q + L','Q = ΔU − L','ΔU = L − Q'],a:0,x:'意大利教材常用约定。'},
  {it:'Quale grandezza è una funzione di stato?',zh:'哪个是状态函数？',o:['U','Q','L','Q e L'],a:0,x:'Q、L 与路径有关。'},
  {it:'In un ciclo, il lavoro netto è uguale:',zh:'一个循环的净功等于：',o:['all\'area racchiusa nel piano PV PV 图面积','a zero','a ΔU','a Q_ass'],a:0,x:'ΔU = 0 ⇒ L = Q_netto = 面积。'},
  {it:'Rendimento di Carnot tra 600 K e 300 K:',zh:'600 K 与 300 K 之间卡诺效率：',o:['50 %','100 %','33 %','67 %'],a:0,x:'1 − 300/600。'}],
 p2:[{it:'In un sistema isolato, per un processo irreversibile:',zh:'孤立系统中的不可逆过程：',o:['ΔS > 0','ΔS = 0','ΔS < 0','ΔS qualunque'],a:0,x:'熵增原理。'},
  {it:'Espansione libera di n moli da V a 2V: ΔS =',zh:'n mol 气体自由膨胀 V → 2V，ΔS：',o:['nR ln2','0','−nR ln2','Q/T con Q = 0 ⇒ 0'],a:0,x:'S 是状态函数，用等温可逆路径计算。'},
  {it:'Disuguaglianza di Clausius per un ciclo:',zh:'循环的克劳修斯不等式：',o:['∮δQ/T ≤ 0','∮δQ/T ≥ 0','∮δQ = 0','∮dS > 0'],a:0,x:'等号仅对可逆循环。'},
  {it:'Un frigorifero che trasferisce calore dal freddo al caldo senza lavoro viola:',zh:'不耗功把热从冷处送到热处的制冷机违反：',o:['l\'enunciato di Clausius 克劳修斯表述','il primo principio','l\'enunciato di Kelvin','nessuna legge'],a:0,x:'热不能自发从低温流向高温。'}]
};

/* ========== Random exam problems: numbers random, answer computed by the same physics ========== */
const rnd=(a,b,st)=>{ const n=Math.round((b-a)/st); return +(a+st*Math.floor(Math.random()*(n+1))).toFixed(6); };
Lab.problems={
 pre:[()=>{ const A=rnd(2,9,1),B=rnd(2,9,1),tA=rnd(0,90,5),tB=rnd(100,180,5); const ph=(tB-tA)*DEG; return {topic:'vettori',set:{A,B,tA,tB,op:'cross'},q:`|A| = ${A}（θ = ${tA}°），|B| = ${B}（θ = ${tB}°）。求 (A×B)_z。`,unit:'',ans:A*B*Math.sin(ph),steps:[`φ = ${tB-tA}°`,`(A×B)_z = AB sinφ = ${A}·${B}·sin${tB-tA}°`]}; }],
 cin:[()=>{ const v0=rnd(10,35,0.5), th=rnd(15,75,1); return {topic:'proiettile',set:{v0,th,h0:0},q:`从地面以 v₀ = ${v0} m/s、θ = ${th}° 抛出（g = 9.81）。求射程 R。`,unit:'m',ans:v0*v0*Math.sin(2*th*DEG)/g_,steps:['R = v₀² sin2θ / g',`= ${v0}² × sin${2*th}° / 9.81`]}; },
  ()=>{ const R=rnd(0.5,5,0.1), w0=rnd(0.5,4,0.1); return {topic:'circolare',set:{R,w0,al:0},q:`半径 R = ${R} m，ω = ${w0} rad/s 匀速圆周运动。求向心加速度。`,unit:'m/s²',ans:w0*w0*R,steps:['a_c = ω²R']}; }],
 din:[()=>{ const m=rnd(1,10,0.5), th=rnd(25,55,1), mk=rnd(0.05,0.4,0.01); const ms=Math.min(1,+(mk+0.05).toFixed(2)); return {topic:'inclinato',set:{m,th,ms,mk,F:0},q:`m = ${m} kg 沿 θ = ${th}° 的斜面下滑，μ_d = ${mk}（已在滑动）。求加速度。`,unit:'m/s²',ans:g_*(Math.sin(th*DEG)-mk*Math.cos(th*DEG)),steps:['a = g(sinθ − μ_d cosθ)']}; },
  ()=>{ const m1=rnd(0.5,5,0.1), m2=rnd(5.5,10,0.1); return {topic:'atwood',set:{mode:'atw',m1,m2,M:0},q:`阿特伍德机 m₁ = ${m1} kg，m₂ = ${m2} kg（滑轮理想）。求绳张力 T。`,unit:'N',ans:2*m1*m2*g_/(m1+m2),steps:['a = (m₂−m₁)g/(m₁+m₂)','T = m₁(g + a) = 2m₁m₂g/(m₁+m₂)']}; }],
 ene:[()=>{ const m=rnd(0.5,5,0.1), v0=rnd(3,10,0.1), mu=rnd(0.05,0.4,0.01); return {topic:'lavoro_nc',set:{m,v0,mu,k:100},q:`m = ${m} kg 以 v₀ = ${v0} m/s 在 μ_d = ${mu} 的地面滑行 3 m 后的速率（若仍在运动）？`,unit:'m/s',ans:Math.sqrt(Math.max(0,v0*v0-2*mu*g_*3)),steps:['½mv² = ½mv₀² − μmg·s','v = √(v₀² − 2μgs)']}; }],
 qdm:[()=>{ const m1=rnd(0.5,5,0.5), m2=rnd(0.5,5,0.5), v1=rnd(1,5,0.1), v2=rnd(-5,-0.5,0.1), e=rnd(0,1,0.05); return {topic:'urti',set:{mode:'1d',m1,m2,v1,v2,e},q:`一维碰撞：m₁ = ${m1} kg（${v1} m/s），m₂ = ${m2} kg（${v2} m/s），恢复系数 e = ${e}。求 v₁′。`,unit:'m/s',ans:((m1-e*m2)*v1+(1+e)*m2*v2)/(m1+m2),steps:['v₁′ = [(m₁ − e m₂)v₁ + (1+e)m₂v₂]/(m₁+m₂)']}; },
  ()=>{ const m0=rnd(500,5000,50), ff=rnd(0.5,0.9,0.01), u=rnd(1500,4000,50); return {topic:'razzo',set:{m0,ff,u,tb:60,grav:false},q:`无重力：火箭 m₀ = ${m0} kg，燃料比 ${ff}，喷气速度 ${u} m/s。燃尽后 Δv？`,unit:'m/s',ans:u*Math.log(1/(1-ff)),steps:['Δv = u ln(m₀/m_f)','m₀/m_f = 1/(1 − 燃料比)']}; }],
 rig:[()=>{ const th=rnd(5,40,1); return {topic:'rigido',set:{th},q:`实心球从 θ = ${th}°、长 3 m 的斜面顶端静止纯滚动。求到达底端的时间。`,unit:'s',ans:Math.sqrt(6/(g_*Math.sin(th*DEG)/1.4)),steps:['a = g sinθ/(1 + 2/5)','t = √(2L/a)']}; },
  ()=>{ const M=rnd(0.5,5,0.1), m=rnd(0.01,0.5,0.01), v=rnd(5,40,0.5), d=rnd(0.3,1,0.01); return {topic:'urto_rigido',set:{ty:'in',M,m,v,d},q:`细杆 M = ${M} kg、L = 1 m 绕端点转动；子弹 m = ${m} kg、v = ${v} m/s 在 d = ${d} m 处嵌入。求 ω。`,unit:'rad/s',ans:m*v*d/(M/3+m*d*d),steps:['mvd = (ML²/3 + md²)ω']}; }],
 osc:[()=>{ const m=rnd(0.2,5,0.1), k=rnd(5,100,1); return {topic:'oscillatore',set:{m,k,b:0,F0:0},q:`弹簧振子 m = ${m} kg，k = ${k} N/m。求周期。`,unit:'s',ans:TAU*Math.sqrt(m/k),steps:['T = 2π√(m/k)']}; },
  ()=>{ const L=rnd(0.3,5,0.05); return {topic:'pendolo',set:{L,th0:5,b:0},q:`单摆 L = ${L} m（小角度，g = 9.81）。求周期。`,unit:'s',ans:TAU*Math.sqrt(L/g_),steps:['T = 2π√(L/g)']}; }],
 grav:[()=>{ const r0=rnd(7000,40000,100); return {topic:'gravitazione',set:{M:'1',r0,v0:+(Math.sqrt(3.986004e14/(r0*1e3))/1e3).toFixed(2),al:0},q:`地球卫星圆轨道半径 r = ${r0} km（GM = 3.986×10¹⁴ m³/s²）。求周期（小时）。`,unit:'h',ans:TAU*Math.sqrt((r0*1e3)**3/3.986004e14)/3600,steps:['T = 2π√(r³/GM)','换算成小时 ÷ 3600']}; }],
 flu:[()=>{ const d1=rnd(10,30,0.5), d2=rnd(3,9.5,0.5), v1=rnd(0.5,2,0.05), p1=rnd(20,60,0.5); return {topic:'bernoulli',set:{d1,d2,v1,h2:0,p1},q:`水平管 d₁ = ${d1} cm、d₂ = ${d2} cm，v₁ = ${v1} m/s，p₁(表压) = ${p1} kPa。求 p₂（kPa）。`,unit:'kPa',ans:p1+0.5*1000*(v1*v1-(v1*(d1/d2)**2)**2)/1000,steps:['v₂ = v₁(d₁/d₂)²','p₂ = p₁ + ½ρ(v₁² − v₂²)']}; }],
 cal:[()=>{ const m=rnd(0.1,2,0.05), T0=rnd(-40,-1,1); return {topic:'calorimetria',set:{m,T0,P:1000},q:`${m} kg 冰从 ${T0} °C 加热到恰好全部熔化（0 °C 的水）需要多少热量（kJ）？c_g = 2090 J/(kg·K)，L_f = 3.34×10⁵ J/kg。`,unit:'kJ',ans:(m*2090*(-T0)+m*334000)/1000,steps:['Q = mc_g(0 − T₀) + mL_f']}; },
  ()=>{ const L=rnd(0.1,2,0.05), A=rnd(1,20,0.5), Th=rnd(50,300,5); return {topic:'conduzione',set:{mat:'alluminio',L,A,Th,Tc:20},q:`铝棒 (k = 237) L = ${L} m，A = ${A} cm²，两端 ${Th} °C 与 20 °C。稳态热流？`,unit:'W',ans:237*A*1e-4*(Th-20)/L,steps:['P = kAΔT/L（A 换算为 m²）']}; }],
 gas:[()=>{ const n=rnd(0.2,3,0.1), P1=rnd(100,400,5), V1=rnd(4,20,0.5), V2=rnd(22,50,0.5); return {topic:'trasformazioni',set:{pr:'isoterma',n,P1,V1,V2},q:`${n} mol 理想气体从 ${P1} kPa、${V1} L 等温膨胀到 ${V2} L。求吸热 Q（J）。`,unit:'J',ans:P1*V1*Math.log(V2/V1),steps:['Q = L = nRT ln(V₂/V₁) = P₁V₁ ln(V₂/V₁)']}; },
  ()=>{ const P1=rnd(100,400,5), V1=rnd(4,15,0.5), V2=rnd(20,50,0.5); return {topic:'trasformazioni',set:{pr:'adiabatica',gas:'mono',n:1,P1,V1,V2},q:`1 mol 单原子气体从 ${P1} kPa、${V1} L 绝热可逆膨胀到 ${V2} L。求终压 P₂（kPa）。`,unit:'kPa',ans:P1*Math.pow(V1/V2,5/3),steps:['P₁V₁^γ = P₂V₂^γ，γ = 5/3']}; }],
 p1:[()=>{ const Th=rnd(400,1500,10), Tc=rnd(200,390,5); return {topic:'cicli',set:{cy:'carnot',Th,Tc},q:`卡诺热机 T_h = ${Th} K，T_c = ${Tc} K。效率（%）？`,unit:'%',ans:100*(1-Tc/Th),steps:['η = 1 − T_c/T_h']}; },
  ()=>{ const r=rnd(4,12,0.5); return {topic:'cicli',set:{cy:'otto',gas:'bi',r},q:`奥托循环压缩比 r = ${r}（空气 γ = 1.4）。理论效率（%）？`,unit:'%',ans:100*(1-Math.pow(r,-0.4)),steps:['η = 1 − 1/r^(γ−1)']}; }],
 p2:[()=>{ const m1=rnd(0.5,3,0.1), m2=rnd(0.5,3,0.1), T1=rnd(330,370,1), T2=rnd(275,310,1); const Tf=(m1*T1+m2*T2)/(m1+m2); return {topic:'entropia',set:{m1,T1,m2,T2},q:`${m1} kg 水 (${T1} K) 与 ${m2} kg 水 (${T2} K) 绝热混合。求总熵变（J/K）。`,unit:'J/K',ans:4186*(m1*Math.log(Tf/T1)+m2*Math.log(Tf/T2)),steps:['T_f = (m₁T₁ + m₂T₂)/(m₁ + m₂)','ΔS = Σ m c ln(T_f/T_i)']}; },
  ()=>{ const Th=rnd(400,1200,10), Tc=rnd(200,390,5), eta=rnd(0.05,0.6,0.005); return {topic:'clausius',set:{mode:'eng',Th,Tc,Q:1000,eta},q:`热机 T_h = ${Th} K，T_c = ${Tc} K，|Q_h| = 1000 J，η = ${(eta*100).toFixed(1)} %。求 ΔS_univ（J/K；若为负说明不可能）。`,unit:'J/K',ans:-(1000/Th-1000*(1-eta)/Tc),steps:['|Q_c| = (1 − η)|Q_h|','ΔS_univ = −Q_h/T_h + |Q_c|/T_c']}; }]
};

/* ========== Progress (localStorage) ========== */
Lab.progress={
  key:'physlab.progress.v1',
  load(){ try{ return JSON.parse(localStorage.getItem(this.key))||{v:{},e:{},q:{},p:{}}; }catch(e){ return {v:{},e:{},q:{},p:{}}; } },
  save(d){ try{ localStorage.setItem(this.key,JSON.stringify(d)); }catch(e){} },
  mark(kind,id,val=true){ const d=this.load(); d[kind]=d[kind]||{}; if(kind==='q'){ d.q[id]=Math.max(d.q[id]||0,val); } else if(kind==='p'){ d.p[id]=(d.p[id]||0)+1; } else d[kind][id]=val; this.save(d); if(window.PhysicsLab) window.PhysicsLab.refreshNav(); },
  chapter(ch){ const d=this.load(), c=Lab.chapters.find(x=>x.id===ch); const nt=c.topics.length;
    const v=c.topics.filter(t=>d.v[t]).length/nt, e=c.topics.filter(t=>d.e[t]).length/nt, q=(d.q[ch]||0); const pr=Math.min(1,(d.p[ch]||0)/3);
    return {v,e,q,pr,total:Math.round(100*(0.3*v+0.25*e+0.3*q+0.15*pr))}; },
  reset(){ try{ localStorage.removeItem(this.key); }catch(e){} }
};

/* ========== Render examples & mistakes on a topic page ========== */
function renderExam(api){
  const id=api.topic.id, ex=Lab.exam[id], ch=Lab.chapterOf(id); if(!ex) return;
  const box=api.$exam; const it=Lab.itPrimary;
  box.innerHTML=`<div class="card"><h4>${bi('例题：先预测再运行 · Esempi svolti (prevedi → verifica)')}</h4><div class="exlist"></div></div>
    <div class="card"><h4>${bi('常见错误 · Errori comuni')}</h4><ul class="mistakes">${ex.mis.map(m=>`<li>${m}</li>`).join('')}</ul>
    ${ch?`<a class="b pri" style="display:inline-block;margin-top:8px;text-decoration:none" href="#quiz/${ch.id}">${it?`Quiz: ${ch.it}`:`本章测验：${ch.zh}`} →</a>`:''}</div>`;
  const list=box.querySelector('.exlist');
  ex.ex.forEach((e,i)=>{
    const d=document.createElement('div'); d.className='exitem';
    d.innerHTML=`<p><b>${i+1}.</b> ${e.q}</p>
      <div class="exrow"><span>${e.ask} =</span><input type="number" step="any" placeholder="${it?'tua previsione':'你的预测'}" aria-label="prediction"><span>${e.unit}</span>
      <button class="b chk">${it?'Verifica':'核对'}</button><button class="b run">▶ ${it?'Esegui il modello':'用默认参数运行'}</button></div>
      <div class="fb"></div>
      <details><summary>${it?'Soluzione passo passo':'查看解题步骤 (soluzione)'}</summary><ol>${e.steps.map(s=>`<li>${s}</li>`).join('')}</ol><p>答案 risposta：<b>${fmt(e.ans,4)} ${e.unit}</b></p></details>`;
    d.querySelector('.chk').onclick=()=>{ const v=parseFloat(d.querySelector('input').value); const fb=d.querySelector('.fb');
      if(isNaN(v)){ fb.innerHTML=`<span class="bad">${it?'Inserisci un numero':'请输入数值'}</span>`; return; }
      const ok=Math.abs(v-e.ans)<=Math.max(0.03*Math.abs(e.ans),1e-9); fb.innerHTML=ok?`<span class="ok">✓ ${it?'Corretto':'正确'}：${fmt(e.ans,4)} ${e.unit}</span>`:`<span class="bad">✗ ${it?'Non ancora: riprova, esegui il modello o apri la soluzione':'还不对（容差 3 %）：再算一次，或运行模型、展开解题步骤'}</span>`; Lab.progress.mark('e',id); };
    d.querySelector('.run').onclick=()=>{ Lab.progress.mark('e',id); window.PhysicsLab.show(id,e.set||{}); };
    d.querySelector('details').addEventListener('toggle',()=>Lab.progress.mark('e',id));
    list.appendChild(d);
  });
}

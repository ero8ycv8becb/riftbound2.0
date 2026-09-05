/* RIFTBOUND 1.2.0 — COMPLETE ARCADE UPDATE */
const $=id=>document.getElementById(id);
const keys={};
let run=false,paused=false,last=0,time=99,combo=0,comboStep=0,comboT=0,attackCD=0,hitFreeze=0,difficulty='normal';
let round=1,pWins=0,eWins=0,roundTransition=0,roundEnding=false,matchOver=false;
let soundOn=true,shakeOn=true,stats={damage:0,taken:0,combos:0,perfectBlocks:0,specials:0,ults:0};
let audioCtx=null;
const DIFFICULTY={
 easy:{reaction:.48,think:.78,attack:.42,block:.10,special:.10,dash:.08,jump:.05,damage:.80,stamina:13,smart:.15},
 normal:{reaction:.30,think:.45,attack:.68,block:.25,special:.30,dash:.20,jump:.12,damage:1,stamina:20,smart:.35},
 hard:{reaction:.16,think:.28,attack:.84,block:.44,special:.52,dash:.34,jump:.20,damage:1.12,stamina:24,smart:.65},
 nightmare:{reaction:.08,think:.15,attack:.96,block:.62,special:.74,dash:.52,jump:.30,damage:1.28,stamina:29,smart:.9}
};
const P={x:27,y:0,hp:1000,st:100,rift:0,ult:0,block:false,crouch:false,awake:false,cd:{q:0,e:0,r:0,f:0},vy:0,onGround:true,stun:0,vel:0,attackingUntil:0,invuln:0,comboDamage:0};
const E={x:73,y:0,hp:1000,st:100,rift:0,ult:0,awake:false,block:false,crouch:false,cd:{q:0,e:0,r:0,f:0},vy:0,onGround:true,stun:0,vel:0,attackingUntil:0,aiThink:0,aiAction:0,aiBlock:0,invuln:0};
const CHARACTERS=[
{id:'kael',name:'KAEL',role:'THE RIFTBLADE',desc:'Balanced rushdown fighter built around relentless combos.',c1:'#14233b',c2:'#277bc2',moves:{q:['Q','Rift Punch',75],e:['E','Breaker Dash',95],r:['R','Rift Uppercut',125],f:['F','Limit Crash',155],ult:['X','Final Break',230]}},
{id:'vera',name:'VERA',role:'THE SHADOW DANCER',desc:'Explosive shadow assassin who controls space with speed.',c1:'#24102f',c2:'#b65cff',moves:{q:['Q','Shadow Bolt',70],e:['E','Phantom Rush',100],r:['R','Meteor Kick',135],f:['F','Shadow Spiral',165],ult:['X','Nightfall',240]}},
{id:'rynn',name:'RYNN',role:'THE STORMCALLER',desc:'Fast storm fighter who chains lightning into movement.',c1:'#09232b',c2:'#28e6ff',moves:{q:['Q','Storm Shot',72],e:['E','Thunder Step',110],r:['R','Sky Break',130],f:['F','Tempest',175],ult:['X','Stormfall',250]}},
{id:'orion',name:'ORION',role:'THE VOID SENTINEL',desc:'Heavy defender who bends gravity around every strike.',c1:'#1e1a0c',c2:'#ffd34e',moves:{q:['Q','Void Pulse',68],e:['E','Gravity Shift',100],r:['R','Singularity',125],f:['F','Event Guard',160],ult:['X','Black Star',245]}},
{id:'jax',name:'JAX',role:'THE CHAINGUN BRAWLER',desc:'Brutal close-range brawler powered by unstable force.',c1:'#2a160b',c2:'#ff8b32',moves:{q:['Q','Volt Jab',78],e:['E','Flash Rush',105],r:['R','Thunder Break',140],f:['F','Overload',180],ult:['X','Judgment Bolt',260]}},
{id:'null',name:'NULL',role:'THE RIFT INCARNATE',desc:'The living Rift. Slow, terrifying, and overwhelmingly powerful.',c1:'#180719',c2:'#ff3cae',boss:true,moves:{q:['Q','Null Pulse',95],e:['E','Rift Collapse',125],r:['R','Abyssal Grip',160],f:['F','World Tear',210],ult:['X','Absolute Null',300]}}
];
let selectedPlayer=null,selectedEnemy=null;
function getCharacter(id){return CHARACTERS.find(c=>c.id===id)} function cfg(){return DIFFICULTY[difficulty]||DIFFICULTY.normal}
function setupCharacterSelect(){
 document.querySelectorAll('#cards .charCard').forEach(el=>el.addEventListener('click',()=>selectPlayer(getCharacter(el.dataset.id),el)));
 document.querySelectorAll('#enemyCards .charCard').forEach(el=>el.addEventListener('click',()=>selectEnemy(getCharacter(el.dataset.id),el)));
 document.querySelectorAll('.charCard').forEach(el=>{const c=getCharacter(el.dataset.id);if(c?.boss)el.dataset.boss='true'});
}
function selectPlayer(ch,el){selectedPlayer=ch;document.querySelectorAll('#cards .charCard').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');$('previewName').textContent=ch.name+' — '+ch.role;$('previewDesc').textContent=ch.desc;$('confirmBtn').disabled=false;$('confirmBtn').textContent='CHOOSE '+ch.name}
function confirmCharacter(){if(!selectedPlayer)return;$('menu').classList.add('hidden');$('versusSelect').classList.remove('hidden');$('enemyHint').textContent='CHOOSE WHO '+selectedPlayer.name+' WILL FIGHT';$('fightBtn').disabled=true;$('fightBtn').textContent='SELECT OPPONENT';document.querySelectorAll('#enemyCards .charCard').forEach(x=>x.classList.remove('selected'));selectedEnemy=null}
function selectEnemy(ch,el){if(!selectedPlayer)return;if(ch.id===selectedPlayer.id){$('enemyHint').textContent='YOU CANNOT FIGHT YOURSELF';return}selectedEnemy=ch;document.querySelectorAll('#enemyCards .charCard').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');$('enemyHint').textContent=selectedPlayer.name+' VS '+ch.name;$('fightBtn').disabled=false;$('fightBtn').textContent='START FIGHT'}
function startFightFromSelect(){if(!selectedPlayer||!selectedEnemy)return;difficulty=$('difficultySelect')?.value||'normal';startMatch()}
setupCharacterSelect();

function injectHUD(){
 if($('extraHUD'))return;
 const x=document.createElement('div');x.id='extraHUD';x.innerHTML=`
 <div class="roundBadge">ROUND <b id="roundNo">1</b> <span id="scoreText">● ○</span></div>
 <div class="fightStats"><span>DMG <b id="dmgStat">0</b></span><span>MAX COMBO <b id="maxCombo">0</b></span></div>
 <div class="pauseHint">ESC • PAUSE</div>
 <div id="pauseOverlay" class="hidden"><div class="pauseCard"><div class="pauseLogo">RIFTBOUND</div><h2>PAUSED</h2><button id="resumeBtn">RESUME</button><button id="restartBtn">RESTART MATCH</button><button id="menuBtn" class="secondary">MAIN MENU</button><div class="toggleRow"><label>Sound <input id="soundToggle" type="checkbox" checked></label><label>Screen Shake <input id="shakeToggle" type="checkbox" checked></label></div></div></div>
 <div id="roundBanner" class="roundBanner"></div><div id="hitFeed"></div>`;
 document.body.appendChild(x);
 $('resumeBtn').onclick=()=>togglePause(false);$('restartBtn').onclick=()=>startMatch();$('menuBtn').onclick=()=>location.reload();
 $('soundToggle').onchange=e=>soundOn=e.target.checked;$('shakeToggle').onchange=e=>shakeOn=e.target.checked;
}
function injectAbilityUI(){
 const box=document.querySelector('.abilities'); if(!box)return;
 box.innerHTML='';[['j','LIGHT',''],['k','HEAVY',''],['l','BLOCK',''],['shift','DASH',''],['q','ABILITY 1',''],['e','ABILITY 2',''],['r','ABILITY 3',''],['f','ABILITY 4',''],['g','AWAKEN',''],['x','ULTIMATE','']].forEach(([k,n])=>{const s=document.createElement('span');s.dataset.key=k;s.innerHTML=`<b>${k.toUpperCase()}</b><small>${n}</small><i class="cooldown">READY</i>`;box.appendChild(s)})
}
function start(){startMatch()}
function startMatch(){
 injectHUD();injectAbilityUI();installModels();renderMoveset();$('menu').classList.add('hidden');$('versusSelect').classList.add('hidden');$('end').classList.add('hidden');$('game').classList.remove('hidden');
 pWins=0;eWins=0;round=1;matchOver=false;stats={damage:0,taken:0,combos:0,perfectBlocks:0,specials:0,ults:0};startRound();
}
function startRound(){
 Object.assign(P,{x:27,y:0,hp:1000,st:100,rift:0,ult:0,block:false,crouch:false,awake:false,cd:{q:0,e:0,r:0,f:0},vy:0,onGround:true,stun:0,vel:0,attackingUntil:0,invuln:0,comboDamage:0});
 Object.assign(E,{x:73,y:0,hp:1000,st:100,rift:0,ult:0,awake:false,block:false,crouch:false,cd:{q:0,e:0,r:0,f:0},vy:0,onGround:true,stun:0,vel:0,aiThink:.2,aiAction:0,aiBlock:0,invuln:0});
 time=99;combo=0;comboStep=0;comboT=0;attackCD=0;hitFreeze=0;paused=false;run=true;roundTransition=0;roundEnding=false;
 $('roundNo').textContent=round;$('scoreText').textContent='● '.repeat(pWins)+'○ '.repeat(2-pWins)+' | '+'● '.repeat(eWins)+'○ '.repeat(2-eWins);
 showRoundBanner('ROUND '+round);playTone(180,.08,'sine');setTimeout(()=>playTone(360,.12,'square'),100);last=performance.now();requestAnimationFrame(loop)
}
function showRoundBanner(t){const b=$('roundBanner');if(!b)return;b.textContent=t;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),1200)}
function togglePause(v){if(!run)return;paused=v;if($('pauseOverlay'))$('pauseOverlay').classList.toggle('hidden',!v);if(!v){last=performance.now();requestAnimationFrame(loop)}}
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();keys[k]=1;if(k==='escape'){togglePause(!paused);return} if(!run||paused)return;
 if(k==='l')P.block=true;
 if(k==='s')P.crouch=true;
 if(k==='w'&&P.onGround&&!P.stun){P.vy=9;P.onGround=false;anim('player','jump');playTone(520,.06,'sine')}
 if(k==='g'&&P.rift>=100&&!P.awake){P.rift=0;P.awake=true;anim('player','awakening');flash('RIFT AWAKENED');playTone(100,.25,'sawtooth');setTimeout(()=>P.awake=false,25000)}
 if(k==='x')attack('ultimate'); if(k==='j')attack('light'); if(k==='k')attack('heavy'); if('qerf'.includes(k))ability(k)
});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys[k]=0;if(k==='l')P.block=false;if(k==='s')P.crouch=false});
function ensureAudio(){if(!soundOn)return null;if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();return audioCtx}
function playTone(freq,dur,type='sine',vol=.025){const a=ensureAudio();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur)}
function renderMoveset(){const ch=selectedPlayer||CHARACTERS[0],el=$('moveCharacter'),list=$('moveList');if(!el||!list)return;el.textContent=ch.name+' / MOVES';list.innerHTML=Object.values(ch.moves).map(m=>'<div class="moveRow"><b>'+m[0]+'</b><span>'+m[1]+'</span></div>').join('')}
function inHitbox(target,range=145){const a=$(target===E?'enemy':'player').getBoundingClientRect(),b=$(target===E?'player':'enemy').getBoundingClientRect();return Math.abs((a.left+a.width/2)-(b.left+b.width/2))<=range&&Math.abs((a.top+a.height/2)-(b.top+b.height/2))<155}
function distance(){return Math.abs(P.x-E.x)} function playerIsAttacking(){return performance.now()<P.attackingUntil||['attacking','heavy','special-q','special-e','special-r','special-f','ultimate','awakening'].some(c=>$('player')?.classList.contains(c))}
function facePositions(){const pc=$('player'),ec=$('enemy');if(pc)pc.classList.toggle('facing-left',P.x>E.x);if(ec)ec.classList.toggle('facing-left',E.x>P.x)}
function attack(type){
 if(attackCD>0||P.stun>0||P.invuln>0)return;
 if(type==='ultimate'){if(P.ult<100)return;P.ult=0;attackCD=.9;P.attackingUntil=performance.now()+800;stats.ults++;anim('player','ultimate');bigFX(P.x,'#8de8ff');if(inHitbox(E,275)){hit(E,(selectedPlayer.moves.ult[2]||230)*(P.awake?1.25:1),14,true);combo++;showCombo();}else flash('ULTIMATE MISS');playTone(75,.35,'sawtooth',.05);return}
 if(type==='light'){
  comboStep=comboT>0?comboStep+1:1;if(comboStep>4)comboStep=1;comboT=1.05;attackCD=.18;P.attackingUntil=performance.now()+220;anim('player',comboStep===4?'heavy':'attacking');
  const dmg=[25,30,38,58][comboStep-1]*(P.awake?1.25:1)*(comboStep>1?Math.max(.75,1-combo*.015):1);if(inHitbox(E,150)){let kb=comboStep===4?7:1.8;if(comboStep===3){hit(E,dmg,kb,true);E.vy=8;E.y=1;E.onGround=false}else hit(E,dmg,kb,comboStep===4);combo++;stats.combos=Math.max(stats.combos,combo);showCombo();hitFreeze=.035;playTone(220+comboStep*60,.07,'square')}
 }else{if(P.st<8)return;P.st-=8;attackCD=.42;P.attackingUntil=performance.now()+340;anim('player','heavy');if(inHitbox(E,160)){hit(E,62*(P.awake?1.25:1),7,true);combo++;stats.combos=Math.max(stats.combos,combo);showCombo();hitFreeze=.045;playTone(120,.11,'sawtooth',.04)}else flash('MISS')}
}
function ability(k){
 if(P.cd[k]>0||P.stun>0)return;const ch=selectedPlayer||CHARACTERS[0],mv=ch.moves[k],cost={q:10,e:18,r:25,f:30}[k];if(P.st<cost)return;P.st-=cost;P.cd[k]={q:1,e:4,r:7,f:10}[k];P.attackingUntil=performance.now()+520;stats.specials++;anim('player',k==='e'?'special-e':'special-'+k);flash(mv[1].toUpperCase());bigFX(P.x,ch.c2);
 if(k==='e')P.x+=(P.x<E.x?10:-10);if(k==='r'){E.vy=ch.id==='rynn'?10:8;E.y=Math.max(E.y,1);E.onGround=false}
 const range={q:205,e:180,r:175,f:200}[k];if(inHitbox(E,range)){hit(E,mv[2]*(P.awake?1.25:1),{q:3,e:6,r:8,f:11}[k],k==='r'||k==='f');combo++;stats.combos=Math.max(stats.combos,combo);comboT=1;showCombo();hitFreeze=.05;playTone(300+['q','e','r','f'].indexOf(k)*80,.12,'triangle',.04)}
}
function enemyAttack(kind){
 if(E.stun>0||E.invuln>0)return;const ch=selectedEnemy||CHARACTERS[1];
 if(kind==='light'){if(E.aiAction>0||E.st<4)return;E.st-=4;E.aiAction=.22;E.attackingUntil=performance.now()+220;anim('enemy','attacking');if(inHitbox(P,150))hit(P,(24+Math.random()*18)*cfg().damage*(E.awake?1.2:1),2.2,false);return}
 if(E.cd[kind]>0)return;const mv=ch.moves[kind],cost={q:10,e:18,r:25,f:30}[kind];if(!mv||E.st<cost)return;E.st-=cost;E.cd[kind]={q:1,e:4,r:7,f:10}[kind];E.attackingUntil=performance.now()+520;anim('enemy',kind==='e'?'special-e':'special-'+kind);bigFX(E.x,ch.c2);
 if(kind==='e')E.x+=(E.x<P.x?8:-8);if(kind==='r'){P.vy=ch.id==='rynn'?9:7;P.y=Math.max(P.y,1);P.onGround=false}
 const range={q:205,e:190,r:185,f:215}[kind];if(inHitbox(P,range))hit(P,mv[2]*cfg().damage*(E.awake?1.25:1),{q:2,e:5,r:8,f:12}[kind],kind==='r'||kind==='f');playTone(130,.09,'sawtooth',.025)
}
function enemyUltimate(){if(E.ult<100||E.stun>0)return;E.ult=0;E.attackingUntil=performance.now()+900;anim('enemy','ultimate');bigFX(E.x,(selectedEnemy?.c2)||'#ff3cae');if(inHitbox(P,285))hit(P,(selectedEnemy?.moves.ult?.[2]||240)*cfg().damage*(E.awake?1.25:1),14,true);playTone(55,.4,'sawtooth',.05)}
function hit(t,d,kb,launcher=false){
 if(!t||typeof d!=='number'||d<=0||t.invuln>0)return;
 const blocked=t.block;let actual=blocked?d*.22:d;
 if(blocked){if(Math.random()<.15){actual=0;t.stun=.05;stats.perfectBlocks++;flash('PERFECT BLOCK');playTone(720,.08,'square',.035)}else{t.stun=.08;playTone(430,.04,'square',.02)}}
 t.hp=Math.max(0,t.hp-actual);t.stun=Math.min(.65,t.stun+(blocked?.08:.18));t.invuln=.05;t.vel=(t===E?Math.sign(E.x-P.x):Math.sign(P.x-E.x))*kb;
 if(launcher&&t===E){t.vy=8;t.onGround=false;t.y=Math.max(t.y,1)}
 anim(t===E?'enemy':'player',launcher?'launch':'hit');spawnDamage(actual,t===E);impactFX(t===E?E.x:P.x,t===E?selectedEnemy?.c2:selectedPlayer?.c2);
 if(t===E){stats.damage+=actual;P.rift=Math.min(100,P.rift+actual*.20);P.ult=Math.min(100,P.ult+actual*.13);E.rift=Math.min(100,E.rift+actual*.05)}else{stats.taken+=actual;E.rift=Math.min(100,E.rift+actual*.20);E.ult=Math.min(100,E.ult+actual*.13)}
 if(actual>0&&t===E&&combo>=2)showHitFeed(combo+' HIT • '+Math.round(actual)+' DMG');
 if(shakeOn)shake(actual>80?9:actual>40?5:3);playTone(actual>80?90:160,.06,'square',.035)
}
function enemyAI(dt){
 const c=cfg();E.aiThink-=dt;E.aiAction-=dt;E.aiBlock-=dt;if(E.aiBlock<=0)E.block=false;if(E.stun>0)return;const d=distance(),toward=P.x<E.x?-1:1;
 if(E.aiThink<=0){E.aiThink=c.think*(.72+Math.random()*.55);const attacking=playerIsAttacking();
  if(attacking&&d<20&&Math.random()<c.block){E.block=true;E.aiBlock=c.reaction+.25+Math.random()*.35;anim('enemy','block');return}
  if(E.ult>=100&&Math.random()<c.special*.5){enemyUltimate();return}
  if(d<18&&Math.random()<c.attack){const r=Math.random();if(r<c.special*.28)enemyAttack('f');else if(r<c.special*.55)enemyAttack('r');else if(r<c.special*.78)enemyAttack('q');else enemyAttack('light');return}
  if(d>=18&&d<34&&Math.random()<c.special){const r=Math.random();enemyAttack(r<.34?'e':r<.65?'q':r<.87?'r':'f');return}
  if(d>30&&Math.random()<c.dash&&E.st>12){E.x+=toward*8;E.st-=12;anim('enemy','dash');return}
  if(P.y>0&&E.onGround&&Math.random()<c.jump){E.vy=8.5;E.onGround=false;anim('enemy','jump');return}
 }
 if(!E.stun&&E.aiAction<=0){if(d>16)E.x+=toward*(difficulty==='easy'?5:8)*dt;else if(Math.random()<.035*c.attack)enemyAttack('light')}
 if(playerIsAttacking()&&d<21&&Math.random()<dt*c.block*2) {E.block=true;E.aiBlock=.18+Math.random()*.28;anim('enemy','block')}
}
function update(dt){
 if(hitFreeze>0){hitFreeze-=dt;return}const c=cfg();
 P.st=Math.min(100,P.st+(P.block?0:25)*dt);E.st=Math.min(100,E.st+c.stamina*dt);P.invuln=Math.max(0,P.invuln-dt);E.invuln=Math.max(0,E.invuln-dt);attackCD=Math.max(0,attackCD-dt);P.stun=Math.max(0,P.stun-dt);E.stun=Math.max(0,E.stun-dt);
 for(const k in P.cd)P.cd[k]=Math.max(0,P.cd[k]-dt);for(const k in E.cd)E.cd[k]=Math.max(0,E.cd[k]-dt);
 if(!P.stun&&!P.block){if(keys.a)P.x-=26*dt;if(keys.d)P.x+=26*dt;if(keys.shift&&P.st>10&&(keys.a||keys.d)){P.x+=keys.d?9*dt:-9*dt;P.st-=22*dt;anim('player','dash')}}
 P.vy-=24*dt;P.y+=P.vy*dt;if(P.y<=0){if(!P.onGround&&P.y<.2)anim('player','land');P.y=0;P.vy=0;P.onGround=true}else P.onGround=false;
 P.x+=P.vel*dt;P.vel*=Math.pow(.001,dt);P.x=Math.max(7,Math.min(93,P.x));
 E.vy-=24*dt;E.y+=E.vy*dt;if(E.y<=0){if(!E.onGround&&E.y<.2)anim('enemy','land');E.y=0;E.vy=0;E.onGround=true}else E.onGround=false;E.x+=E.vel*dt;E.vel*=Math.pow(.001,dt);E.x=Math.max(7,Math.min(93,E.x));
 enemyAI(dt);facePositions();
 if(comboT>0)comboT-=dt;else{combo=0;comboStep=0;$('comboName')?.classList.remove('on')}
 if(E.rift>=100&&!E.awake&&Math.random()<dt*(.08+c.special*.12)){E.rift=0;E.awake=true;anim('enemy','awakening');flash((selectedEnemy?.name||'ENEMY')+' AWAKENED');setTimeout(()=>E.awake=false,15000)}
 if(P.rift>=100&&difficulty==='nightmare'&&Math.random()<dt*.04)flash('NIGHTMARE PRESSURE');
 time-=dt;if(time<=0||P.hp<=0||E.hp<=0)finishRound(P.hp>E.hp);
 updateCooldownUI();
}
function finishRound(playerWon){if(roundEnding||matchOver)return;roundEnding=true;run=false;if(playerWon)pWins++;else eWins++;const winner=playerWon?selectedPlayer:selectedEnemy;anim(playerWon?'player':'enemy','victory');anim(playerWon?'enemy':'player','defeat');showRoundBanner(playerWon?'ROUND WON':'ROUND LOST');playTone(playerWon?520:110,.4,playerWon?'triangle':'sawtooth',.05);setTimeout(()=>{if(pWins>=2||eWins>=2){matchOver=true;endMatch(pWins>=2);return}round++;startRound()},1500)}
function endMatch(win){run=false;$('game').classList.add('hidden');$('end').classList.remove('hidden');const winner=win?selectedPlayer:selectedEnemy,loser=win?selectedEnemy:selectedPlayer;$('result').textContent=win?'VICTORY':'DEFEAT';$('resultText').textContent=`${winner.name} defeated ${loser.name}`;$('end').style.setProperty('--winner-color',winner.c2);$('end').style.setProperty('--loser-color',loser.c2);let extra=$('endStats');if(!extra){extra=document.createElement('div');extra.id='endStats';$('end').querySelector('div').appendChild(extra)}extra.innerHTML=`<div>ROUNDS <b>${pWins} — ${eWins}</b></div><div>DAMAGE <b>${Math.round(stats.damage)}</b></div><div>MAX COMBO <b>${stats.combos}</b></div><div>PERFECT BLOCKS <b>${stats.perfectBlocks}</b></div><div>SPECIALS <b>${stats.specials}</b> • ULTIMATES <b>${stats.ults}</b></div>`}
function loop(now){if(!run||paused)return;let dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();if(run)requestAnimationFrame(loop)}
function render(){
 if(selectedPlayer){document.querySelector('#game header .hudbox:first-child .label b').textContent=selectedPlayer.name;document.querySelector('#game header .hudbox:first-child .label span').textContent=selectedPlayer.role}
 if(selectedEnemy){document.querySelector('#game header .hudbox.right .label b').textContent=selectedEnemy.name;document.querySelector('#game header .hudbox.right .label span').textContent=selectedEnemy.role}
 $('php').style.width=P.hp/10+'%';$('pst').style.width=P.st+'%';$('prift').style.width=P.rift+'%';$('ehp').style.width=E.hp/10+'%';$('est').style.width=E.st+'%';$('erift').style.width=E.rift+'%';$('timer').textContent=Math.max(0,Math.ceil(time));
 $('player').style.left=P.x+'%';$('enemy').style.left=E.x+'%';$('player').style.bottom=(19+P.y)+'%';$('enemy').style.bottom=(19+E.y)+'%';$('player').classList.toggle('awake',P.awake);$('enemy').classList.toggle('awake',E.awake);$('player').classList.toggle('airborne',P.y>0);$('enemy').classList.toggle('airborne',E.y>0);$('player').classList.toggle('blocking',P.block);$('enemy').classList.toggle('blocking',E.block);$('player').classList.toggle('crouching',P.crouch);$('enemy').classList.toggle('crouching',E.crouch);
 $('dmgStat')?.replaceChildren(document.createTextNode(Math.round(stats.damage)));$('maxCombo')?.replaceChildren(document.createTextNode(stats.combos));
}
function updateCooldownUI(){document.querySelectorAll('.abilities span').forEach(s=>{const k=s.dataset.key;const el=s.querySelector('.cooldown');let v=k==='x'?100-P.ult:k==='g'?100-P.rift:k==='shift'?0:k==='j'||k==='k'||k==='l'?0:(P.cd[k]||0);if(k==='g')el.textContent=P.rift>=100?'READY':Math.round(P.rift)+'%';else if(k==='x')el.textContent=P.ult>=100?'READY':Math.round(P.ult)+'%';else el.textContent=v<=0?'READY':v.toFixed(1)+'s';s.classList.toggle('ready',v<=0)})}
function anim(id,c){const x=$(id);if(!x)return;const states=['attacking','heavy','hit','launch','dash','block','airborne','special-q','special-e','special-r','special-f','ultimate','awakening','victory','defeat','land','jump'];x.classList.remove(...states);x.dataset.anim=c||'idle';void x.offsetWidth;if(c&&c!=='idle')x.classList.add(c);if(c&&c.startsWith('special-'))spawnModelFX(x,c);else if(c==='ultimate'||c==='awakening'||c==='attacking'||c==='heavy')spawnModelFX(x,c==='awakening'?'awakening':c==='ultimate'?'ultimate':'attack');setTimeout(()=>{if(x.dataset.anim===c){x.classList.remove(c);x.dataset.anim='idle'}},c==='awakening'?900:c==='ultimate'?800:c==='heavy'?340:c==='attacking'?220:c==='block'?400:380)}
function spawnModelFX(el,type){const ring=el.querySelector('.fxRing'),slash=el.querySelector('.fxSlash'),slash2=el.querySelector('.fxSlash2'),burst=el.querySelector('.hitBurst');if(!ring||!slash||!slash2)return;[ring,slash,slash2].forEach(n=>{n.style.animation='none';n.style.opacity='0'});void ring.getBoundingClientRect();if(type==='awakening'){ring.style.animation='fxRing 700ms ease-out';ring.style.opacity='1';if(burst)burst.style.animation='burstFX 700ms ease-out'}else if(type==='ultimate'){slash.style.animation='fxSlash 500ms cubic-bezier(.2,.8,.2,1)';slash2.style.animation='fxSlash2 520ms ease-out';ring.style.animation='fxRing 520ms ease-out';ring.style.opacity='1'}else{slash.style.animation='fxSlash 300ms ease-out';slash2.style.animation='fxSlash2 340ms ease-out'}}
function spawnDamage(n,enemy){const d=$('damage');d.textContent=Math.round(n);d.style.left=(enemy?E.x:P.x)+'%';d.style.top='48%';clearTimeout(window.dt);window.dt=setTimeout(()=>d.textContent='',450)}
function impactFX(x,color){const f=document.createElement('div');f.className='impactParticle';f.style.left=x+'%';f.style.setProperty('--fx',color||'#fff');document.getElementById('game').appendChild(f);setTimeout(()=>f.remove(),450)}
function bigFX(x,color){const f=document.createElement('div');f.className='bigFX';f.style.left=x+'%';f.style.setProperty('--fx',color||'#fff');document.getElementById('game').appendChild(f);setTimeout(()=>f.remove(),700)}
function shake(n){if(!shakeOn)return;const g=$('game');g.classList.remove('cameraShake');g.style.setProperty('--shake',n+'px');void g.offsetWidth;g.classList.add('cameraShake');setTimeout(()=>g.classList.remove('cameraShake'),180)}
function flash(t){$('msg').textContent=t;clearTimeout(window.ft);window.ft=setTimeout(()=>$('msg').textContent='',650)}
function showCombo(){$('combo').textContent=combo+' HIT';$('combo').classList.add('on');clearTimeout(window.ct);window.ct=setTimeout(()=>$('combo').classList.remove('on'),900)}
function showHitFeed(t){const h=$('hitFeed');if(!h)return;h.textContent=t;h.classList.remove('show');void h.offsetWidth;h.classList.add('show')}

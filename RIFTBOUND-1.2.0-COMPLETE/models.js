const MODEL_DATA={
 kael:{accent:'#28a9ff',dark:'#0b172b',light:'#5fd0ff',weapon:'sword',hair:'#111827'},
 vera:{accent:'#b65cff',dark:'#24102f',light:'#ff70d7',weapon:'blades',hair:'#e9e7ff'},
 rynn:{accent:'#28e6ff',dark:'#09232b',light:'#a6fbff',weapon:'staff',hair:'#d9f8ff'},
 orion:{accent:'#ffd34e',dark:'#1e1a0c',light:'#fff0a0',weapon:'halberd',hair:'#141414'},
 jax:{accent:'#ff8b32',dark:'#2a160b',light:'#ffd06b',weapon:'gauntlets',hair:'#ff6b21'},
 null:{accent:'#ff3cae',dark:'#180719',light:'#ff86d0',weapon:'none',hair:'#07020a'}
};
function fighterSVG(id){
 const m=MODEL_DATA[id]||MODEL_DATA.kael;
 const weapon={
  sword:`<g class="weapon sword"><path d="M68 86 L145 48" stroke="${m.light}" stroke-width="7" stroke-linecap="round"/><path d="M69 86 L145 48" stroke="${m.accent}" stroke-width="15" opacity=".22"/><path d="M62 81 L76 94" stroke="${m.accent}" stroke-width="6" stroke-linecap="round"/></g>`,
  blades:`<g class="weapon blades"><path d="M54 88 L25 58" stroke="${m.light}" stroke-width="6"/><path d="M91 89 L124 55" stroke="${m.light}" stroke-width="6"/></g>`,
  staff:`<g class="weapon staff"><path d="M116 24 L98 158" stroke="${m.light}" stroke-width="6"/><circle cx="116" cy="22" r="10" fill="none" stroke="${m.accent}" stroke-width="4"/></g>`,
  halberd:`<g class="weapon halberd"><path d="M121 28 L105 160" stroke="${m.light}" stroke-width="6"/><path d="M111 39 Q141 42 128 65 Q115 57 104 52Z" fill="${m.accent}"/></g>`,
  gauntlets:`<g class="weapon gauntlets"><circle cx="38" cy="92" r="14" fill="${m.accent}"/><circle cx="103" cy="92" r="14" fill="${m.accent}"/></g>`,
  none:`<g class="weapon"><path d="M35 130 Q75 150 115 130" stroke="${m.accent}" stroke-width="3" fill="none" opacity=".7"/></g>`
 }[m.weapon];
 return `<svg class="fighterSVG" viewBox="0 0 150 190" aria-hidden="true">
 <defs><linearGradient id="body-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.dark}"/><stop offset="1" stop-color="${m.accent}"/></linearGradient></defs>
 <g class="modelCore">
  <ellipse cx="75" cy="176" rx="40" ry="7" fill="#000" opacity=".45"/>
  <g class="coat"><path d="M53 75 L40 132 L29 160 L61 143 L75 119 L89 143 L121 160 L110 132 L97 75Z" fill="url(#body-${id})" stroke="${m.accent}" stroke-width="2"/></g>
  <path class="leg legL" d="M61 124 L49 166 L65 172 L75 130" fill="${m.dark}" stroke="${m.accent}" stroke-width="2"/>
  <path class="leg legR" d="M89 124 L101 166 L85 172 L75 130" fill="${m.dark}" stroke="${m.accent}" stroke-width="2"/>
  <path class="boot" d="M47 166 L67 166 L71 175 L45 177Z M83 166 L103 166 L106 175 L80 177Z" fill="#080b12" stroke="${m.light}" stroke-width="2"/>
  <path class="arm armL" d="M54 78 L31 111 L40 117 L65 91" fill="${m.dark}" stroke="${m.accent}" stroke-width="3"/>
  <path class="arm armR" d="M96 78 L119 109 L110 117 L85 91" fill="${m.dark}" stroke="${m.accent}" stroke-width="3"/>
  <path d="M53 64 Q75 54 97 64 L94 112 Q75 124 56 112Z" fill="url(#body-${id})" stroke="${m.accent}" stroke-width="2"/>
  <path d="M60 40 Q75 28 90 40 L94 65 Q75 75 56 65Z" fill="#e0a77e" stroke="#fff2" stroke-width="2"/>
  <path d="M57 48 Q57 27 76 25 Q96 26 94 49 L87 40 L80 48 L73 37 L64 48Z" fill="${m.hair}"/>
  <path d="M63 52 L70 53 M80 53 L87 52" stroke="${m.light}" stroke-width="2" stroke-linecap="round"/>
  ${weapon}
  <circle class="coreGlow" cx="75" cy="83" r="8" fill="${m.accent}" opacity=".45"/>
  <g class="weaponTrail" stroke="${m.light}" fill="none" stroke-linecap="round" opacity="0">
    <path d="M25 112 Q75 52 135 102" stroke-width="8"/>
    <path d="M32 118 Q75 72 128 108" stroke-width="3"/>
  </g>
 </g>
 <g class="impactFX" aria-hidden="true">
   <circle class="fxRing" cx="75" cy="92" r="20" fill="none" stroke="${m.accent}" stroke-width="3" opacity="0"/>
   <path class="fxSlash" d="M25 110 Q75 45 140 95" fill="none" stroke="${m.light}" stroke-width="10" stroke-linecap="round" opacity="0"/>
   <path class="fxSlash2" d="M35 130 Q75 70 125 105" fill="none" stroke="${m.accent}" stroke-width="5" stroke-linecap="round" opacity="0"/>
 </g></svg>`;
}
function installModels(){
 ['player','enemy'].forEach(side=>{
  const el=document.getElementById(side); if(!el)return;
  const id=side==='player'?(selectedPlayer?.id||'kael'):(selectedEnemy?.id||'vera');
  const name=side==='player'?(selectedPlayer?.name||'KAEL'):(selectedEnemy?.name||'VERA');
  el.innerHTML=`<div class="aura"></div>${fighterSVG(id)}<div class="tag">${name}</div><div class="hitBurst"></div>`;
  el.dataset.model=id; el.dataset.anim='idle';
 });
}

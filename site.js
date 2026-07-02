/* MELRIC.AI marketing site storyboard (production v4).
   Pinned view, wheel/touch/keys drive it:
   orb + hero -> C-suite rings in (pulse-announced, staggered) -> zoom cards
   (CMO/CFO/COO, pulse ignites the node first) -> C-suite dissolves -> the
   business Melric: live widget nodes ring in staggered (Money made, To-do,
   Outreach, Social, Email, Morning brief) + the app's Work|Family toggle at
   the bottom -> the toggle FLIPS (light + animated knob + soft tick) and the
   ring morphs to family widgets under the app's family-blue tint -> the ask
   as a true Melric approval layer (orb rises, Melric captions on top) ->
   native Webflow email capture.
   All data capture is 100% native Webflow forms. site.js never submits. */
(function(){
'use strict';

var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (REDUCED) document.body.classList.add('reduced');

/* ---- monochrome line glyphs ---- */
var G={
  mega:'<path d="M4 10v4h3l7 4V6l-7 4H4z"/><path d="M17.5 9.5a4 4 0 0 1 0 5"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M14.4 9.4c-.6-1.2-4.8-1.1-4.8.7 0 2.2 4.8 1.4 4.8 3.6 0 1.8-4.2 1.9-4.8.7"/>',
  check:'<path d="M5.5 12.6l4 4 9-9.2"/>',
  send:'<path d="M3.5 11.5 20 4l-5.5 16-3.2-6.8L3.5 11.5z"/><path d="M11.3 13.2 20 4"/>',
  share:'<circle cx="6" cy="12" r="2.2"/><circle cx="17" cy="6" r="2.2"/><circle cx="17" cy="18" r="2.2"/><path d="M8 11l7-4M8 13l7 4"/>',
  mail:'<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
  cal:'<rect x="4" y="6" width="16" height="14" rx="1.5"/><path d="M4 10h16M8 4v4M16 4v4"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  sunrise:'<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 3v4M5.6 8.6 4.2 7.2M18.4 8.6l1.4-1.4"/>',
  heart:'<path d="M12 20s-7-4.6-9-9c-1.2-2.8.6-6 3.8-6 2 0 3.4 1.1 4.2 2.6.8-1.5 2.2-2.6 4.2-2.6 3.2 0 5 3.2 3.8 6-2 4.4-9 9-9 9z"/>',
  pulse:'<path d="M3 12h4l2.2-5 3.6 10 2.2-5H21"/>',
  plane:'<path d="M10.5 13.5 3 11l1.5-1.5L10 10l4.5-4.5c.6-.6 1.7-.6 2.1 0 .6.4.6 1.5 0 2.1L12 12l.5 5.5L11 19l-2.5-7.5z"/>',
  card:'<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M3.5 10h17M7 14.5h4"/>',
  star:'<path d="M12 4l2.3 4.9 5.2.6-3.9 3.6 1.1 5.2L12 15.6l-4.7 2.7 1.1-5.2L4.5 9.5l5.2-.6L12 4z"/>',
  music:'<path d="M9 18V6l10-2v12"/><circle cx="6.8" cy="18" r="2.2"/><circle cx="16.8" cy="16" r="2.2"/>'
};
function nodeSvg(n,w){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||1.3)+'" stroke-linecap="round" stroke-linejoin="round">'+(G[n]||'')+'</svg>'; }

/* 3 C-suite role nodes (zoom cards), then 6 live WIDGET nodes with a work
   face and a family face. Widget copy is illustrative, one to-do overdue. */
var NODES=[
  { id:'cmo', name:'CMO', svg:nodeSvg('mega'),
    kick:'Your CMO', title:'Runs all your content.',
    lines:['Turns one video into a week of content','Posts everywhere while you sleep','Reads the numbers, finds the winners','Doubles down on what goes viral'] },
  { id:'cfo', name:'CFO', svg:nodeSvg('coin'),
    kick:'Your CFO', title:'Watches the money.',
    lines:['Every dollar tracked, in and out','Catches leaks before they cost you','Shows your next best money move','Knows your runway cold'] },
  { id:'coo', name:'COO', svg:nodeSvg('check'),
    kick:'Your COO', title:'Nothing slips.',
    lines:['Every follow-up handled','Nothing falls through the cracks','Status computed, not claimed','One brain across every business'] },
  { id:'g1', ghost:true,
    work:{ icon:'coin', title:'Money made', rows:[['big','$18,420 this week'],['ok','+12% vs last week']] },
    home:{ icon:'pulse', title:'Fitness', rows:[['big','11 day streak'],['ok','3 of 4 workouts done']] } },
  { id:'g2', ghost:true,
    work:{ icon:'list', title:'To-do', rows:[['done','Send gallery follow-ups'],['n','Approve 3 clips'],['warn','Pay Q3 estimates','OVERDUE']] },
    home:{ icon:'music', title:'Reminder', rows:[['n','Kids dance recital'],['ok','Thursday 5:00pm, gift ready']] } },
  { id:'g3', ghost:true,
    work:{ icon:'send', title:'Outreach', rows:[['n','14 leads contacted'],['ok','3 replies waiting on you']] },
    home:{ icon:'cal', title:'Calendar', rows:[['n','Dinner with Melody, 7pm'],['ok','Weekend: lake trip planned']] } },
  { id:'g4', ghost:true,
    work:{ icon:'share', title:'Social', rows:[['n','6 posts scheduled'],['ok','1 going viral right now']] },
    home:{ icon:'heart', title:'Family', rows:[['n','Call Mom on Sunday'],['ok','Anniversary in 12 days']] } },
  { id:'g5', ghost:true,
    work:{ icon:'mail', title:'Email', rows:[['n','23 triaged this morning'],['ok','2 need your eyes']] },
    home:{ icon:'plane', title:'Travel', rows:[['n','Watching flights: Maui'],['ok','Price dropped $180']] } },
  { id:'g6', ghost:true,
    work:{ icon:'sunrise', title:'Morning brief', rows:[['n','Ready at 6:00am'],['ok','3 priorities picked']] },
    home:{ icon:'card', title:'Bills', rows:[['n','All paid, on time'],['ok','Saved $62 this month']] } }
];
var MAIN=3;

function $(id){ return document.getElementById(id); }
var stage=$('stage');

function widgetHtml(d){
  var h='<div class="wt">'+nodeSvg(d.icon,1.4)+'<span>'+d.title+'</span></div>';
  d.rows.forEach(function(r){
    var cls=r[0]==='n'?'':' '+r[0];
    h+='<div class="wl'+cls+'">'+r[1]+(r[2]?'<span class="tag">'+r[2]+'</span>':'')+'</div>';
  });
  return h;
}
function setNodeContent(a,mode){
  var el=$('node-'+a.id); if(!el) return;
  if(a.ghost){ el.innerHTML=widgetHtml(a[mode||'work']); }
  else { el.innerHTML='<div class="ico">'+a.svg+'</div><div class="nm">'+a.name+'</div>'; }
}
function buildRing(){
  NODES.forEach(function(a){
    var el=document.createElement('div');
    el.className='node is-live'+(a.ghost?' widget':'');
    el.id='node-'+a.id;
    stage.appendChild(el);
    setNodeContent(a,'work');
    el.onclick=function(){ openFlow(); };
  });
  var card=document.createElement('div');
  card.id='nodeCard';
  card.innerHTML='<div class="kick"></div><h3></h3><div class="nclines"></div>';
  document.body.appendChild(card);
  /* the app's Work|Family toggle, bottom center, with a sliding knob */
  var tog=document.createElement('div');
  tog.id='modeTog';
  tog.innerHTML='<span class="mt-knob"></span><button class="mt-opt on" id="mtWork">Work</button><button class="mt-opt" id="mtFamily">Family</button>';
  document.body.appendChild(tog);
  /* Melric's caption bar (top): what Melric says during the approval */
  var cap=document.createElement('div');
  cap.id='melCap';
  document.body.appendChild(cap);
  layoutHub(); placeKnob();
}
/* mains on the inner ring; widgets between them on a wider ring */
function layoutHub(){
  var W=stage.clientWidth,H=stage.clientHeight;
  var margin=(W<700||H<560)?120:185;
  var cx=W/2,cy=H/2,R=Math.max(margin,Math.min(W,H)/2-margin);
  var R2=Math.max(230,Math.min(W,H)/2-140);
  var svg=$('links'); if(svg) svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var ob=$('orb'); if(ob&&!flowOpen){ ob.style.left=cx+'px'; ob.style.top=cy+'px'; }
  var gi=0;
  NODES.forEach(function(a,i){
    var ang;
    if(i<MAIN){ ang=-Math.PI/2+i*(2*Math.PI/3); a._r=R; }
    else { ang=-Math.PI/2+(Math.PI/6)+gi*(2*Math.PI/6); a._r=R2; gi++; }
    a._x=cx+a._r*Math.cos(ang); a._y=cy+a._r*Math.sin(ang);
    var el=$('node-'+a.id); if(el){ el.style.left=a._x+'px'; el.style.top=a._y+'px'; }
  });
}
function placeKnob(){
  var tog=$('modeTog'); if(!tog) return;
  var on=tog.querySelector('.mt-opt.on'), knob=tog.querySelector('.mt-knob');
  if(on&&knob){ knob.style.left=on.offsetLeft+'px'; knob.style.width=on.offsetWidth+'px'; }
}

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function smooth(e0,e1,x){ var t=clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }

var P=0, PT=0, lineGrow=0, elecOn=0, flowOpen=false, contactOpen=false, familyOn=false;
var sendPulse=null, _cardEntered=-1;

/* storyboard bands */
var CARD_BANDS=[ [0.16,0.30], [0.30,0.44], [0.44,0.58] ];
var DISSOLVE=[0.58,0.63];   /* C-suite fades out */
var GHOST_START=0.62;       /* widgets ring in staggered */
var FLIP=0.815;             /* the toggle flips to Family */

var CAPS=[
  {at:0.095,until:0.16,txt:'You just hired your C-suite.'},
  {at:0.645,until:0.695,txt:'And Melric is not one product.'},
  {at:0.695,until:0.75,txt:'It is custom built for you and your business.'},
  {at:0.75,until:0.805,txt:'More money. More time. More leads.'},
  {at:0.845,until:0.90,txt:'Because Melric runs your home too.'},
  {at:0.90,until:0.945,txt:'More time for your family. That is the point.'},
  {at:0.945,until:2,txt:'See if Melric fits your life.'}
];

function cardState(){
  for(var i=0;i<CARD_BANDS.length;i++){
    var b=CARD_BANDS[i];
    if(P>=b[0]&&P<=b[1]){
      var t=(P-b[0])/(b[1]-b[0]);
      var zin=smooth(0,0.20,t), zout=smooth(0.80,1,t);
      return { i:i, t:t, vis:zin*(1-zout) };
    }
  }
  return null;
}

/* ---- the flip ceremony: light, animated knob, soft tick, staggered morph ---- */
function setFamily(on){
  if(familyOn===on) return;
  familyOn=on;
  document.body.classList.toggle('familyMode',on);
  var tog=$('modeTog');
  if(tog){
    tog.querySelector('#mtWork').classList.toggle('on',!on);
    tog.querySelector('#mtFamily').classList.toggle('on',on);
    placeKnob();
    tog.classList.remove('flipping'); void tog.offsetWidth; tog.classList.add('flipping');
    setTimeout(function(){ tog.classList.remove('flipping'); },900);
  }
  if(!REDUCED) tickSound();
  var gi=0;
  NODES.forEach(function(a){
    if(!a.ghost) return;
    var el=$('node-'+a.id), delay=REDUCED?0:gi*130; gi++;
    setTimeout(function(){
      if(el){ el.classList.add('morphing'); }
      setTimeout(function(){
        setNodeContent(a,on?'home':'work');
        if(el) el.classList.remove('morphing');
      },REDUCED?0:180);
    },delay);
  });
}
function tickSound(){
  try{
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    if(!window.__melAC) window.__melAC=new AC();
    var ac=window.__melAC;
    if(ac.state==='suspended') ac.resume();
    var o=ac.createOscillator(), g=ac.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(740,ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(430,ac.currentTime+0.11);
    g.gain.setValueAtTime(0.055,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.16);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime+0.17);
  }catch(e){}
}

function applyStoryboard(){
  var cs=cardState();
  var dis=smooth(DISSOLVE[0],DISSOLVE[1],P);      /* C-suite out */
  var flipT=smooth(FLIP,FLIP+0.02,P);
  setFamily(flipT>0.5);

  var tog=$('modeTog');
  if(tog) tog.style.opacity=((flowOpen||contactOpen)?0:smooth(GHOST_START+0.02,GHOST_START+0.06,P)).toFixed(3);

  var gi=0;
  NODES.forEach(function(a,i){
    var rv;
    if(i<MAIN){
      var s=0.045+i*0.03; rv=smooth(s,s+0.055,P)*(1-dis);
    } else {
      var gs=GHOST_START+gi*0.024; gi++;
      rv=smooth(gs,gs+0.05,P);
    }
    /* pulse announces each node the moment it starts appearing */
    if(rv>0.12&&!a._seen){ a._seen=true; if(sendPulse&&!REDUCED) sendPulse(a,0.016); }
    if(rv<0.04) a._seen=false;

    if(cs){ if(i===cs.i) rv=Math.max(rv,0.25); else rv*=(1-0.8*cs.vis); }
    a._rv=rv;
    var el=$('node-'+a.id); if(el){
      el.style.opacity=rv.toFixed(3);
      var sc=0.55+0.45*rv;
      if(cs&&i===cs.i) sc+=0.3*cs.vis;
      el.style.transform='translate(-50%,-50%) scale('+sc.toFixed(3)+')';
      el.style.pointerEvents=(rv>0.9&&!cs)?'auto':'none';
      el.classList.toggle('lit',!!(cs&&i===cs.i&&cs.vis>0.3));
    }
  });

  lineGrow=smooth(0.07,0.15,P);
  elecOn=REDUCED?0:smooth(0.12,0.20,P)*(cs?(1-0.55*cs.vis):1);

  var hero=$('hero'); if(hero) hero.style.opacity=(1-smooth(0.03,0.10,P)).toFixed(3);
  var hint=$('hint'); if(hint) hint.style.opacity=(1-smooth(0.02,0.08,P)).toFixed(3);

  var cap=''; CAPS.forEach(function(c){ if(P>=c.at&&P<c.until) cap=c.txt; });
  var pc=$('phaseCap'); if(pc){ pc.textContent=cap; pc.style.opacity=(cap&&!flowOpen&&!contactOpen&&(!cs||cs.vis<0.2))?1:0; }

  renderCard(cs);

  var z=cs?cs.vis:0, a2=cs?NODES[cs.i]:null;
  if(a2&&a2._x!=null){ stage.style.transformOrigin=a2._x+'px '+a2._y+'px'; }
  stage.style.transform=z>0?('scale('+(1+0.14*z).toFixed(4)+')'):'';

  var scrim=$('flowScrim');
  if(scrim){
    if(flowOpen||contactOpen){ scrim.style.opacity=''; }
    else { scrim.style.opacity=(0.85*z).toFixed(3); scrim.classList.remove('on'); }
  }

  if(P>0.968 && !flowOpen && !contactOpen) openFlow();
}

function renderCard(cs){
  var card=$('nodeCard'); if(!card) return;
  if(!cs||cs.vis<=0.02){ card.style.opacity=0; card.style.pointerEvents='none'; card._i=null; return; }
  var a=NODES[cs.i];
  if(card._i!==cs.i){
    card._i=cs.i;
    card.querySelector('.kick').textContent=a.kick;
    card.querySelector('h3').textContent=a.title;
    card.querySelector('.nclines').innerHTML=a.lines.map(function(l){ return '<div class="ncline">'+l+'</div>'; }).join('');
  }
  var W=stage.clientWidth,H=stage.clientHeight,cx=W/2,cy=H/2;
  var t=cs.vis, dx=(a._x-cx)*(1-t), dy=(a._y-cy)*(1-t), s=0.25+0.75*t;
  card.style.opacity=t.toFixed(3);
  card.style.transform='translate(-50%,-50%) translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px) scale('+s.toFixed(3)+')';
  var lines=card.querySelectorAll('.ncline');
  for(var k=0;k<lines.length;k++){
    var th=0.26+k*0.13;
    lines[k].style.opacity=smooth(th,th+0.08,cs.t).toFixed(3);
  }
}

/* ---- gesture driver. The page itself never scrolls. ---- */
window.addEventListener('wheel',function(e){ if(flowOpen||contactOpen) return; e.preventDefault(); PT=clamp(PT+e.deltaY*0.00050,0,1); },{passive:false});
var _ty=null;
window.addEventListener('touchstart',function(e){ _ty=e.touches[0].clientY; },{passive:true});
window.addEventListener('touchmove',function(e){ if(flowOpen||contactOpen||_ty==null) return; var y=e.touches[0].clientY; PT=clamp(PT+(_ty-y)*0.0010,0,1); _ty=y; e.preventDefault(); },{passive:false});
window.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ if(contactOpen) closeContact(); else if(flowOpen) closeFlow(); return; }
  if(flowOpen||contactOpen) return;
  if(e.key==='ArrowDown'||e.key===' ') PT=clamp(PT+0.032,0,1);
  if(e.key==='ArrowUp') PT=clamp(PT-0.032,0,1);
});
function tick(){
  if(REDUCED){ P=PT; } else { P+=(PT-P)*0.12; if(Math.abs(PT-P)<0.0002) P=PT; }
  applyStoryboard(); watchFps(); requestAnimationFrame(tick);
}

/* ---- fps watchdog with warmup grace ---- */
var _fpsN=0,_fpsT=performance.now(),_strikes=0,_fpsDone=REDUCED,_fpsStart=performance.now();
function watchFps(){
  if(_fpsDone) return;
  var now=performance.now();
  if(now-_fpsStart<8000){ _fpsN=0; _fpsT=now; return; }
  if(document.hidden){ _fpsN=0; _fpsT=now; return; }
  _fpsN++;
  if(now-_fpsT>=4000){
    var fps=_fpsN/((now-_fpsT)/1000);
    _fpsN=0; _fpsT=now;
    if(fps<22){ _strikes++; if(_strikes>=3){ document.body.classList.add('low-power'); _fpsDone=true; } }
    else _strikes=0;
  }
}

/* ---- neuro: lines + slow bright signals; nodes flare on hit ---- */
function pulseNode(a){
  var el=$('node-'+a.id); if(!el) return;
  el.classList.add('flare'); clearTimeout(el._ft); el._ft=setTimeout(function(){ el.classList.remove('flare'); },900);
  try{ if(window.corridorNodeFlash && a._x!=null) window.corridorNodeFlash(a._x/stage.clientWidth,a._y/stage.clientHeight,1); }catch(e){}
}
function startNeuro(){
  var cv=$('neuro'); var ctx=cv.getContext('2d'); var W=0,H=0;
  function resize(){ W=cv.width=stage.clientWidth||900; H=cv.height=stage.clientHeight||600; }
  resize(); window.addEventListener('resize',function(){ clearTimeout(cv._rt); cv._rt=setTimeout(function(){ resize(); layoutHub(); placeKnob(); },180); });
  var pulses=[];
  sendPulse=function(a,sp){ pulses.push({a:a,t:0,sp:sp||0.012}); };
  (function frame(now){
    now=now||performance.now(); ctx.clearRect(0,0,W,H);
    var cx=W/2,cy=H/2;
    var blue=document.body.classList.contains('familyMode');
    var lineCol=blue?'rgba(140,210,255,':'rgba(94,255,160,';
    NODES.forEach(function(a){ if(a._x==null||!a._rv) return;
      var gx=cx+(a._x-cx)*lineGrow, gy=cy+(a._y-cy)*lineGrow;
      ctx.strokeStyle=lineCol+(0.30*lineGrow*a._rv).toFixed(3)+')'; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(gx,gy); ctx.stroke();
    });
    if(elecOn>0.2){
      NODES.forEach(function(a){ if(a._x==null||a._rv<0.6) return;
        if(a._gap==null){ a._gap=1500+Math.random()*3200; a._last=now-Math.random()*2600; }
        if(now-a._last>a._gap){ a._last=now; a._gap=1500+Math.random()*3200; pulses.push({a:a,t:0,sp:0.0055+Math.random()*0.0030}); }
      });
    }
    ctx.lineCap='round';
    for(var k=pulses.length-1;k>=0;k--){ var pl=pulses[k]; pl.t+=pl.sp;
      if(!pl.fired && pl.t>=0.82){ pl.fired=true; pulseNode(pl.a); }
      if(pl.t>=1){ pulses.splice(k,1); continue; }
      var a=pl.a, seg=0.18, ht=pl.t, tt=Math.max(0,pl.t-seg);
      var hx=cx+(a._x-cx)*ht, hy=cy+(a._y-cy)*ht, tx=cx+(a._x-cx)*tt, ty=cy+(a._y-cy)*tt;
      var env=pl.t<0.15?(pl.t/0.15):(pl.t>0.7?Math.max(0,(1-pl.t)/0.3):1);
      var grad=ctx.createLinearGradient(tx,ty,hx,hy);
      grad.addColorStop(0,lineCol+'0)'); grad.addColorStop(1,blue?'rgba(215,240,255,.98)':'rgba(190,255,215,.98)');
      ctx.globalAlpha=env*Math.max(elecOn,0.6); ctx.strokeStyle=grad; ctx.lineWidth=2.4; ctx.shadowBlur=11; ctx.shadowColor=lineCol+'.9)';
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(hx,hy); ctx.stroke(); ctx.globalAlpha=1;
    }
    ctx.shadowBlur=0;
    requestAnimationFrame(frame);
  })();
}

/* ============================================================================
   THE ASK, as a true Melric approval layer: the orb rises and shrinks like
   the app's approval page, Melric's caption bar speaks on top, the question
   and glowing options sit beneath. Ends at the native Webflow form.
   ============================================================================ */
var STEPS={
  q1:{ kick:'A quick decision', say:'Quick one before I let you in.',
       q:'What is eating your time the most?',
       opts:[ {label:'The content',next:'q2'}, {label:'The money',next:'q2'}, {label:'The chaos',next:'q2'} ] },
  q2:{ kick:'Last one', say:'Last one, promise.',
       q:'If something handled the time-consuming work, could you enjoy life more and make more money?',
       opts:[ {label:'Yes',next:'endGood'}, {label:'Obviously',next:'endGood'} ] },
  endGood:{ kick:'Early access', say:'I will take it from here.',
            q:'Melric is built for exactly this.',
            body:'Custom built for you, onboarded by hand. Leave your email and we will reach out.', capture:true }
};

var answers=[];
function orbApproval(on){
  var orb=$('orb'); if(!orb) return;
  var H=stage.clientHeight;
  if(on){ orb.style.top=(H*0.17)+'px'; orb.style.transform='translate(-50%,-50%) scale(.62)'; }
  else { orb.style.transform='translate(-50%,-50%)'; layoutHub(); }
}
function melSay(txt){
  var c=$('melCap'); if(!c) return;
  if(!txt){ c.classList.remove('show'); return; }
  c.textContent=txt;
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
}
function openFlow(){
  flowOpen=true; answers=[];
  $('flowScrim').classList.add('on');
  var fl=$('flow'); fl.classList.add('on'); fl.classList.add('approval');
  orbApproval(true);
  applyStoryboard();
  renderStep('q1');
}
function closeFlow(){
  flowOpen=false; PT=0.94; P=0.94;
  parkForm(); melSay('');
  $('flowScrim').classList.remove('on');
  var fl=$('flow'); fl.classList.remove('on'); fl.classList.remove('approval');
  orbApproval(false);
  applyStoryboard();
}
function parkForm(){
  var home=$('formHome'), wrap=$('accessFormWrap');
  if(home&&wrap&&wrap.parentNode!==home) home.appendChild(wrap);
}
function placeForm(slot){
  var wrap=$('accessFormWrap'); if(!wrap||!slot) return;
  var field=document.getElementById('qualifier-path');
  if(field){ field.type='hidden'; field.value=answers.join(' | ')||'direct'; }
  slot.appendChild(wrap);
}
function renderStep(key){
  var s=STEPS[key]; if(!s) return;
  var step=$('flowStep'); step.classList.remove('in');
  parkForm();
  melSay(s.say||'');
  var html='<div class="kick">'+s.kick+'</div><h3>'+s.q+'</h3>';
  if(s.body) html+='<p>'+s.body+'</p>';
  if(s.opts){ html+='<div class="opts">'+s.opts.map(function(o,i){ return '<span class="opt" data-i="'+i+'">'+o.label+'</span>'; }).join('')+'</div>'; }
  if(s.capture){ html+='<div id="formSlot"></div>'; }
  html+='<div class="backline"><span class="glow" id="backOrb">Back to the orb <span class="arw">&rsaquo;</span></span></div>';
  step.innerHTML=html;
  if(s.capture) placeForm($('formSlot'));
  var bo=$('backOrb'); if(bo) bo.onclick=closeFlow;
  if(s.opts){
    Array.prototype.forEach.call(step.querySelectorAll('.opt'),function(el){
      el.onclick=function(){
        var o=s.opts[+el.dataset.i];
        answers.push(s.q+' -> '+o.label);
        el.style.textShadow='0 0 16px rgba(94,255,160,1),0 0 34px rgba(46,230,111,.9)';
        setTimeout(function(){ renderStep(o.next); },240);
      };
    });
  }
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ step.classList.add('in'); }); });
}

/* ---- contact overlay (native Webflow form, never generated by JS) ---- */
function openContact(){
  contactOpen=true;
  $('flowScrim').classList.add('on'); $('contactPanel').classList.add('on');
  applyStoryboard();
}
function closeContact(){
  contactOpen=false;
  if(!flowOpen) $('flowScrim').classList.remove('on');
  $('contactPanel').classList.remove('on');
  applyStoryboard();
}

/* ---- 3D boot (skipped under reduced motion; CSS glow stands in) ---- */
function boot3d(){
  if(REDUCED) return;
  if(window.THREE && window.startCorridor3D && window.startOrb3D){
    try{ window.startCorridor3D('corridor'); }catch(e){}
    try{ window.startOrb3D('orbCanvas'); }catch(e){}
  } else setTimeout(boot3d,90);
}

window.addEventListener('load',function(){
  buildRing();
  var cslot=$('contactFormSlot'), cwrap=$('contactFormWrap');
  if(cslot&&cwrap) cslot.appendChild(cwrap);
  var qf=document.getElementById('qualifier-path'); if(qf) qf.type='hidden';
  requestAnimationFrame(function(){ layoutHub(); placeKnob(); });
  setTimeout(function(){ layoutHub(); placeKnob(); },250); setTimeout(function(){ layoutHub(); placeKnob(); },700);
  startNeuro(); boot3d(); applyStoryboard(); tick();
  var hint=$('hint'); if(hint&&('ontouchstart' in window)) hint.textContent='Swipe';
  var ca=$('ctaAccess'); if(ca) ca.onclick=function(){ openFlow(); };
  var cc=$('ctaContact'); if(cc) cc.onclick=function(){ openContact(); };
  var cb=$('contactBack'); if(cb) cb.onclick=closeContact;
});
window.addEventListener('resize',function(){ layoutHub(); placeKnob(); applyStoryboard(); });

window.melricSite={ openFlow:openFlow, closeFlow:closeFlow, openContact:openContact, closeContact:closeContact, setFamily:setFamily };
})();

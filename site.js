/* MELRIC.AI marketing site storyboard (production v5).
   Pinned view, wheel/touch/keys drive it:
   orb + hero -> C-suite rings in (pulse-announced, staggered, app-true nodes:
   glyph + name + status + LIVE on a soft glow, no boxes) -> entering a node
   is an app-true PAGE (all nodes clear out, the orb JUMPS to the top with its
   letterspaced label, copy centered beneath, amber status, glowing text
   actions, data on the outer rails) -> C-suite dissolves -> the business
   cockpit: widget nodes ring in staggered + cockpit rails in the corners
   (urgent, agenda, money, needs-your-reply) + the app's Work|Family toggle ->
   the toggle FLIPS (light + knob + soft tick) and nodes, rails and light all
   go family-blue -> the ask as a true MELRIC approval layer (ring clears, orb
   jumps up, MELRIC captions speak) -> native Webflow email capture.
   Node breathing feeds the corridor wall on its own plane (charge accumulates,
   slowly decays, between pulses too) via corridorNodeFlash.
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

/* 3 C-suite nodes (each opens an app-true page), then 6 live widget nodes
   with a work face and a family face. App-true anatomy everywhere:
   glyph + bold name + status line (amber when waiting) + LIVE tag. */
var NODES=[
  { id:'cmo', name:'CMO', icon:'mega', st:'3 clips waiting on you', wait:true,
    page:{ kick:'Your CMO', title:'Runs all your content.',
      status:'waiting on you · 3 clips to approve', wait:true,
      quote:'Turned Monday’s shoot into a week of posts.',
      lines:['Turns one video into a week of content','Posts everywhere while you sleep','Reads the numbers, finds the winners','Doubles down on what goes viral'],
      acts:['Approve','See the plan','details'],
      railL:{ t:'Momentum', rows:[['12','posts this week'],['3','drafts ready'],['1','going viral']] },
      railR:{ t:'Queue · 6', rows:['Reel: studio tour','Clip: glass pour timelapse','Post: gallery night recap','Story: behind the scenes'] } } },
  { id:'cfo', name:'CFO', icon:'coin', st:'books current',
    page:{ kick:'Your CFO', title:'Watches the money.',
      status:'books current · nothing missed',
      quote:'Caught a double charge. Got it back.',
      lines:['Every dollar tracked, in and out','Catches leaks before they cost you','Shows your next best money move','Knows your runway cold'],
      acts:['Approve','See the numbers','details'],
      railL:{ t:'Money', rows:[['$4,210','this week'],['+12%','margin'],['9 mo','runway']] },
      railR:{ t:'Watching · 4', rows:['Q3 estimates due soon','Subscription creep found','Invoice 204 unpaid 12d','Ad spend near the cap'] } } },
  { id:'coo', name:'COO', icon:'check', st:'87 open · all projects',
    page:{ kick:'Your COO', title:'Nothing slips.',
      status:'waiting 2 days · 1 decision is yours', wait:true,
      quote:'Followed up so you did not have to.',
      lines:['Every follow-up handled','Nothing falls through the cracks','Status computed, not claimed','One brain across every business'],
      acts:['Approve','See open loops','details'],
      railL:{ t:'Loops', rows:[['14','open'],['22','closed this week'],['1','overdue']] },
      railR:{ t:'Follow-ups · 5', rows:['Gallery: interested, replied','Supplier quote chased','Contract out for signature','Shoot rescheduled clean'] } } },
  { id:'g1', ghost:true,
    work:{ icon:'coin', title:'Money', st:'$18,420 this week' },
    home:{ icon:'pulse', title:'Fitness', st:'11 day streak' } },
  { id:'g2', ghost:true,
    work:{ icon:'list', title:'To-do', st:'Pay Q3 estimates · overdue', wait:true },
    home:{ icon:'music', title:'Reminder', st:'Recital Thursday 5pm', wait:true } },
  { id:'g3', ghost:true,
    work:{ icon:'send', title:'Outreach', st:'3 replies waiting on you' },
    home:{ icon:'cal', title:'Calendar', st:'Dinner with Melody, 7pm' } },
  { id:'g4', ghost:true,
    work:{ icon:'share', title:'Social', st:'Photos to post' },
    home:{ icon:'heart', title:'Family', st:'Anniversary in 12 days' } },
  { id:'g5', ghost:true,
    work:{ icon:'mail', title:'Email', st:'23 triaged this morning' },
    home:{ icon:'plane', title:'Travel', st:'Maui fare dropped $180' } },
  { id:'g6', ghost:true,
    work:{ icon:'sunrise', title:'Morning brief', st:'Ready at 6:00am' },
    home:{ icon:'card', title:'Bills', st:'All paid, on time' } }
];
var MAIN=3;

/* cockpit rails: the corners of the business beat, straight from the app */
var RAILS={
  work:{
    tl:[{t:'Urgent / ASAP',meta:'25 pressing',rows:[
      ['','6 proposals from MELRIC'],
      ['warn','Content runway: 0 days left'],
      ['','Northside Gallery replied: interested'],
      ['warn','Inventory count · due Jun 25'],
      ['','Edit launch footage · Aug 7']]}],
    tr:[{t:'Today’s agenda',rows:[
      ['ok','Nothing on the calendar today.'],
      ['ok','A clean runway. Use it.']]},
      {t:'Companies & clients',rows:[
      ['','Storm Glassworks'],['','Wheelhouse Magazine'],['','Lab-Coat'],['','VOZ']]}],
    bl:[{t:'Money',rows:[
      ['big','$18,420'],
      ['ok','this week · +12%'],
      ['','Top client · $8,865 last 30 days']]}],
    br:[{t:'Needs your reply',rows:[
      ['warn','2 emails need you'],
      ['','5 DMs waiting'],
      ['','1 comment flagged']]}],
    cap:'YOUR COCKPIT'
  },
  home:{
    tl:[{t:'Today at home',rows:[
      ['warn','Recital Thursday 5:00pm'],
      ['','Gift wrapped and ready'],
      ['','Call Mom on Sunday']]}],
    tr:[{t:'This weekend',rows:[
      ['','Lake trip planned'],
      ['ok','Weather looks perfect']]},
      {t:'The people',rows:[['','Melody'],['','The kids'],['','Mom']]}],
    bl:[{t:'Saved',rows:[
      ['big','$62'],
      ['ok','this month, on autopilot'],
      ['','Bills: all paid, on time']]}],
    br:[{t:'Coming up',rows:[
      ['','Anniversary in 12 days'],
      ['','Maui fare dropped $180']]}],
    cap:'YOUR HOME'
  }
};

function $(id){ return document.getElementById(id); }
var stage=$('stage');

/* app-true node: glyph, bold name, status line (amber when waiting), LIVE */
function nodeHtml(d){
  return '<div class="ico">'+nodeSvg(d.icon,1.5)+'</div>'
    +'<div class="nm">'+d.title+'</div>'
    +'<div class="st'+(d.wait?' wait':'')+'">'+d.st+'</div>'
    +'<div class="live">LIVE</div>';
}
function setNodeContent(a,mode){
  var el=$('node-'+a.id); if(!el) return;
  if(a.ghost){ el.innerHTML=nodeHtml(a[mode||'work']); }
  else { el.innerHTML=nodeHtml({icon:a.icon,title:a.name,st:a.st,wait:a.wait}); }
}
function railHtml(secs){
  var h='';
  secs.forEach(function(sec){
    h+='<div class="rt">'+sec.t+(sec.meta?'<span class="rmeta">'+sec.meta+'</span>':'')+'</div>';
    sec.rows.forEach(function(r){ h+='<div class="rr'+(r[0]?' '+r[0]:'')+'">'+r[1]+'</div>'; });
  });
  return h;
}
function setRails(mode){
  var d=RAILS[mode];
  var map={railTL:d.tl,railTR:d.tr,railBL:d.bl,railBR:d.br};
  Object.keys(map).forEach(function(id){ var r=$(id); if(r) r.innerHTML=railHtml(map[id]); });
  var cc=$('cockCap'); if(cc) cc.textContent=d.cap;
}
function buildRing(){
  NODES.forEach(function(a,i){
    var el=document.createElement('div');
    el.className='node is-live'+(a.ghost?' widget':'');
    el.id='node-'+a.id;
    el.style.setProperty('--bd',(-(i*530))+'ms'); /* staggered breathing */
    stage.appendChild(el);
    setNodeContent(a,'work');
    el.onclick=function(){ openFlow(); };
  });
  /* the in-node page (app-true, no card box) */
  var pg=document.createElement('div');
  pg.id='nodePage';
  document.body.appendChild(pg);
  /* letterspaced label under the risen orb, like the app section pages */
  var tag=document.createElement('div');
  tag.id='orbTag';
  document.body.appendChild(tag);
  /* cockpit rails, four corners */
  ['railTL','railTR','railBL','railBR'].forEach(function(id){
    var r=document.createElement('div'); r.className='rail'; r.id=id;
    document.body.appendChild(r);
  });
  /* the app's Work|Family toggle, bottom center, with a sliding knob */
  var tog=document.createElement('div');
  tog.id='modeTog';
  tog.innerHTML='<span class="mt-knob"></span><button class="mt-opt on" id="mtWork">Work</button><button class="mt-opt" id="mtFamily">Family</button>';
  document.body.appendChild(tog);
  var cc=document.createElement('div');
  cc.id='cockCap';
  document.body.appendChild(cc);
  setRails('work');
  /* MELRIC's caption bar (top): what MELRIC says during the approval */
  var cap=document.createElement('div');
  cap.id='melCap';
  document.body.appendChild(cap);
  layoutHub(); placeKnob();
}
/* mains on the inner ring; widgets between them on a wider ring */
var orbIsUp=false;
function layoutHub(){
  var W=stage.clientWidth,H=stage.clientHeight;
  var margin=(W<700||H<560)?120:185;
  var cx=W/2,cy=H/2,R=Math.max(margin,Math.min(W,H)/2-margin);
  /* phones: pull the widget ring in so side nodes stay on screen */
  var R2=(W<700)?(Math.min(W,H)/2-72):Math.max(230,Math.min(W,H)/2-140);
  var svg=$('links'); if(svg) svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var ob=$('orb'); if(ob&&!flowOpen&&!orbIsUp){ ob.style.left=cx+'px'; ob.style.top=cy+'px'; }
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

/* ---- headline de-rez (v6): as the hero exits, letters blur / drift / push into
   the tunnel, staggered by index (P-driven, so dropped frames never desync it).
   The H1 lives in Webflow markup; we wrap it at runtime. Words become nowrap
   .hw units (so a line only ever breaks BETWEEN words, never mid-word) with
   per-letter .hc spans inside; the existing <br> and <span class="soft"> are
   preserved. Degrades gracefully if the H1 is absent; skipped in reduced-motion. ---- */
var headlineChars=[];
/* wrap ONE text node in place: insert nowrap word-units + per-letter spans just
   BEFORE it, then remove it (preserves sibling order: the <br>, the .soft span). */
function wrapTextNode(node){
  var txt=node.nodeValue, parent=node.parentNode, i=0;
  while(i<txt.length){
    if(txt[i]===' '){
      parent.insertBefore(document.createTextNode(' '),node);   /* a real break opportunity */
      while(i<txt.length&&txt[i]===' ') i++;
    } else {
      var word=document.createElement('span'); word.className='hw';   /* nowrap unit */
      while(i<txt.length&&txt[i]!==' '){
        var ch=document.createElement('span'); ch.className='hc'; ch.textContent=txt[i];
        word.appendChild(ch); headlineChars.push(ch); i++;
      }
      parent.insertBefore(word,node);
    }
  }
  parent.removeChild(node);
}
function buildHeadline(){
  if(REDUCED) return;
  var h1=document.querySelector('#hero h1'); if(!h1) return;   /* graceful if absent */
  headlineChars.length=0;
  /* wrap every text node (top-level + inside child spans like .soft); <br> untouched */
  var texts=[];
  (function collect(el){
    var kids=Array.prototype.slice.call(el.childNodes);
    kids.forEach(function(n){
      if(n.nodeType===3){ if(n.nodeValue.replace(/\s/g,'').length) texts.push(n); }
      else if(n.nodeName==='SPAN'){ collect(n); }
    });
  })(h1);
  texts.forEach(wrapTextNode);
}
function derezHeadline(){
  if(REDUCED||!headlineChars.length) return;
  var pHero=clamp(P/0.11,0,1);          /* hero exits by P~0.11 (matches hero opacity band) */
  var N=headlineChars.length;
  for(var i=0;i<N;i++){
    var frac=i/(N-1||1);
    var local=clamp((pHero-frac*0.28)/0.5,0,1);   /* sweep across the line, letter by letter */
    var op=1-local, blurPx=local*9, yT=-local*14, rot=(i%2?1:-1)*local*8, xT=(i%3-1)*local*10;
    var ch=headlineChars[i];
    ch.style.opacity=op.toFixed(3);
    ch.style.filter=blurPx>0.05?('blur('+blurPx.toFixed(2)+'px)'):'none';
    ch.style.transform='translateY('+yT.toFixed(1)+'px) translateX('+xT.toFixed(1)+'px) scale('+(1-local*0.12).toFixed(3)+') rotate('+rot.toFixed(2)+'deg)';
  }
}

var P=0, PT=0, lineGrow=0, elecOn=0, flowOpen=false, contactOpen=false, familyOn=false;
var sendPulse=null, _cardEntered=-1, _focusOn=false;

/* ---- gesture feel (v6): spring-chased P + rubber-band + beat magnetism.
   PT is the TARGET the gesture wants; P chases it with a critically-damped
   spring (k=150) so scrolling mid-beat moves the beat mid-flight and nothing
   waits for you. Pv is the spring velocity, also the "drive" that sprints the
   tunnel. Reduced-motion snaps P=PT (no spring) so nothing animates. ---- */
var Pv=0;                                   /* spring velocity */
var lastInteract=0;                         /* ms of the last gesture (for magnetism) */
var SPRING_K=150;                           /* stiffness (Eric-approved feel) */
var SPRING_D=2*Math.sqrt(SPRING_K);         /* critical damping (~24.5) */
function setTarget(v){ PT=clamp(v,-0.06,1.06); lastInteract=performance.now(); } /* allow rubber-band overshoot at the ends */

/* storyboard bands */
var CARD_BANDS=[ [0.16,0.30], [0.30,0.44], [0.44,0.58] ];
var DISSOLVE=[0.58,0.63];   /* C-suite fades out */
var GHOST_START=0.62;       /* widgets + rails ring in staggered */
var FLIP=0.815;             /* the toggle flips to Family */

/* beat resting points (v6 magnetism): the readable CENTER of each existing v5
   beat, derived from the bands above. When input goes quiet, PT eases onto the
   nearest of these so every beat is a calm stop on the journey. Order:
   hero, CMO page, CFO page, COO page, work cockpit, family cockpit, the ask.
   (CARD_BANDS centers: 0.23 / 0.37 / 0.51; cockpit settles after ghost ring-in
   ~0.62..0.79 -> 0.75; family after FLIP 0.815 before the ask captions -> 0.83;
   the ask before openFlow at 0.968 -> 0.955. Final rest 0.978 (board fix D5,
   CEO call): idling past the 0.9665 midpoint glides INTO the qualifier flow so
   the journey cannot dead-end one notch short of the form; closeFlow resets P
   to 0.94 whose nearest rest is 0.955, so closing never re-opens it.) */
var BEAT_RESTS=[0, 0.23, 0.37, 0.51, 0.75, 0.83, 0.955, 0.978];

var CAPS=[
  {at:0.095,until:0.16,txt:'You just hired your C-suite.'},
  {at:0.645,until:0.695,txt:'And MELRIC is not one product.'},
  {at:0.695,until:0.75,txt:'It is custom built for you and your business.'},
  {at:0.75,until:0.805,txt:'More money. More time. More leads.'},
  {at:0.845,until:0.90,txt:'Because MELRIC runs your home too.'},
  {at:0.90,until:0.945,txt:'More time for your family. That is the point.'},
  {at:0.945,until:2,txt:'See if MELRIC fits your life.'}
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

/* ---- the flip ceremony: light, animated knob, soft tick, staggered morph.
   Nodes, rails and the caption all cross to the family-blue world. ---- */
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
  /* rails morph right behind the nodes */
  var rs=['railTL','railTR','railBL','railBR'];
  rs.forEach(function(id,k){
    var r=$(id); if(!r) return;
    setTimeout(function(){
      r.classList.add('morphing');
      setTimeout(function(){ r.classList.remove('morphing'); },REDUCED?0:220);
    },REDUCED?0:120+k*90);
  });
  setTimeout(function(){ setRails(on?'home':'work'); },REDUCED?0:300);
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

/* the orb jumps to the top (springy overshoot lives in the CSS transition) */
function orbUp(){
  var orb=$('orb'); if(!orb) return;
  orbIsUp=true;
  orb.style.left=(stage.clientWidth/2)+'px';
  orb.style.top=(stage.clientHeight*0.17)+'px';
  orb.style.transform='translate(-50%,-50%) scale(.62)';
}
function orbDown(){
  var orb=$('orb'); if(!orb) return;
  orbIsUp=false;
  orb.style.transform='translate(-50%,-50%)';
  layoutHub();
}

function applyStoryboard(){
  var cs=cardState();
  var dis=smooth(DISSOLVE[0],DISSOLVE[1],P);      /* C-suite out */
  var flipT=smooth(FLIP,FLIP+0.02,P);
  setFamily(flipT>0.5);

  /* the moment a node page (or the ask) owns the screen, the ring clears out
     and the orb jumps up. Nothing else stays on stage with the orb. */
  var focus=!!(cs&&cs.vis>0.30)&&!flowOpen;
  if(focus){
    var tg=$('orbTag'); if(tg&&NODES[cs.i]) tg.textContent=NODES[cs.i].name;
  }
  if(focus!==_focusOn){
    _focusOn=focus;
    document.body.classList.toggle('nodeFocus',focus);
    if(!flowOpen){ if(focus) orbUp(); else orbDown(); }
  }
  var hideRing=flowOpen||focus;

  var tog=$('modeTog');
  var togOp=(flowOpen||contactOpen)?0:smooth(GHOST_START+0.02,GHOST_START+0.06,P);
  if(tog) tog.style.opacity=togOp.toFixed(3);
  var railOp=(flowOpen||contactOpen)?0:smooth(GHOST_START+0.02,GHOST_START+0.08,P);
  ['railTL','railTR','railBL','railBR'].forEach(function(id){ var r=$(id); if(r) r.style.opacity=railOp.toFixed(3); });
  var cc=$('cockCap'); if(cc) cc.style.opacity=togOp.toFixed(3);

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
    a._rv=hideRing?0:rv;
    var el=$('node-'+a.id); if(el){
      el.style.opacity=rv.toFixed(3);
      var sc=0.55+0.45*rv;
      if(cs&&i===cs.i) sc+=0.3*cs.vis;
      el.style.transform='translate(-50%,-50%) scale('+sc.toFixed(3)+')';
      el.style.pointerEvents=(rv>0.9&&!cs&&!hideRing)?'auto':'none';
      el.classList.toggle('lit',!!(cs&&i===cs.i&&cs.vis>0.15&&!focus));
    }
  });

  /* the pulse rides out and ignites the node as its band opens */
  if(cs&&cs.t<0.5){
    if(_cardEntered!==cs.i){ _cardEntered=cs.i; if(sendPulse&&!REDUCED) sendPulse(NODES[cs.i],0.02); }
  } else if(!cs){ _cardEntered=-1; }

  lineGrow=smooth(0.07,0.15,P);
  elecOn=(REDUCED||hideRing)?0:smooth(0.12,0.20,P)*(cs?(1-0.55*cs.vis):1);

  /* v6 tunnel dolly: sprint while scrolling (drive = spring velocity), settle to
     a barely-there drift when parked; dolly by scroll DEPTH (P). Reduced-motion
     never drives (constant idle corridor stays). */
  if(!REDUCED && window.corridorSetDrive){
    var drive=Math.min(1,Math.abs(Pv)*2.5);
    window.corridorSetDrive(drive, clamp(P,0,1));
  }

  var hero=$('hero'); if(hero) hero.style.opacity=(1-smooth(0.03,0.10,P)).toFixed(3);
  derezHeadline();   /* v6: per-letter de-rez of the H1 into the tunnel as the hero exits */
  var hint=$('hint'); if(hint) hint.style.opacity=(1-smooth(0.02,0.08,P)).toFixed(3);

  var cap=''; CAPS.forEach(function(c){ if(P>=c.at&&P<c.until) cap=c.txt; });
  var pc=$('phaseCap'); if(pc){ pc.textContent=cap; pc.style.opacity=(cap&&!flowOpen&&!contactOpen&&(!cs||cs.vis<0.2))?1:0; }

  renderPage(cs);

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

/* the in-node page: app-true, like the app's section pages. No card box.
   Center column under the risen orb, data on the outer rails. */
function renderPage(cs){
  var pg=$('nodePage'); if(!pg) return;
  if(!cs||cs.vis<=0.02){ pg.style.opacity=0; pg._i=null; return; }
  var a=NODES[cs.i], p=a.page; if(!p) return;
  if(pg._i!==cs.i){
    pg._i=cs.i;
    var h='<div class="npl"><div class="rt">'+p.railL.t+'</div>'
      +p.railL.rows.map(function(r){ return '<div class="nps"><b>'+r[0]+'</b>'+r[1]+'</div>'; }).join('')+'</div>';
    h+='<div class="npr"><div class="rt">'+p.railR.t+'</div>'
      +p.railR.rows.map(function(r){ return '<div class="rr">'+r+'</div>'; }).join('')+'</div>';
    h+='<div class="npc"><div class="kick">'+p.kick+'</div><h3>'+p.title+'</h3>'
      +'<div class="npst'+(p.wait?' wait':'')+'">'+p.status+'</div>'
      +'<div class="npq">“'+p.quote+'”</div>'
      +'<div class="nclines">'+p.lines.map(function(l){ return '<div class="ncline">'+l+'</div>'; }).join('')+'</div>'
      +'<div class="npacts">'+p.acts.map(function(t){ return '<span class="npact">'+t+'</span>'; }).join('')+'</div>'
      +'</div>';
    pg.innerHTML=h;
  }
  var pv=smooth(0.30,0.62,cs.vis);
  pg.style.opacity=pv.toFixed(3);
  var npc=pg.querySelector('.npc');
  if(npc) npc.style.transform='translateX(-50%) translateY('+((1-pv)*26).toFixed(1)+'px)';
  var lines=pg.querySelectorAll('.ncline');
  for(var k=0;k<lines.length;k++){
    var th=0.32+k*0.10;
    lines[k].style.opacity=smooth(th,th+0.08,cs.t).toFixed(3);
  }
}

/* ---- gesture driver (v6). The page itself never scrolls. Wheel deltas are
   normalized across deltaMode; touch is 1:1 scrub + momentum fling; keys step
   ~11 presses across the whole board (the old 0.032 step felt dead). All input
   sets the TARGET PT; the spring in tick() chases it, so input works mid-flight. ---- */
window.addEventListener('wheel',function(e){
  if(flowOpen||contactOpen) return; e.preventDefault();
  var d=e.deltaY;
  if(e.deltaMode===1) d*=16;         /* lines -> px */
  else if(e.deltaMode===2) d*=400;   /* pages -> px */
  d=clamp(d,-140,140);               /* tame one violent trackpad kick */
  setTarget(PT+d*0.00075);
},{passive:false});

/* keys: ~11 presses cover the board (was 0.032, far too small -> hero felt dead) */
var KEY_STEP=1/11;
window.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ if(contactOpen) closeContact(); else if(flowOpen) closeFlow(); return; }
  if(flowOpen||contactOpen) return;
  if(e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '||e.key==='Spacebar'){ e.preventDefault(); setTarget(PT+KEY_STEP); }
  else if(e.key==='ArrowUp'||e.key==='PageUp'){ e.preventDefault(); setTarget(PT-KEY_STEP); }
  else if(e.key==='Home'){ e.preventDefault(); setTarget(0); }
  else if(e.key==='End'){ e.preventDefault(); setTarget(1); }
});

/* touch: 1:1 scrub while dragging + momentum fling on release + rubber-band */
var _tActive=false,_tStartY=0,_tStartP=0,_tLastY=0,_tLastT=0,_tVel=0;
window.addEventListener('touchstart',function(e){
  if(flowOpen||contactOpen) return;
  _tActive=true; _tStartY=_tLastY=e.touches[0].clientY; _tStartP=PT; _tLastT=performance.now(); _tVel=0;
},{passive:true});
window.addEventListener('touchmove',function(e){
  if(flowOpen||contactOpen||!_tActive) return; e.preventDefault();
  var y=e.touches[0].clientY, now=performance.now();
  var dP=(_tStartY-y)/(window.innerHeight*1.15);   /* ~one screen height covers the board */
  setTarget(_tStartP+dP);
  var dt=Math.max(1,now-_tLastT); _tVel=(_tLastY-y)/dt; _tLastY=y; _tLastT=now;
},{passive:false});
window.addEventListener('touchend',function(){
  if(!_tActive) return; _tActive=false;
  var fling=clamp(_tVel,-3,3)*0.42;                /* carry velocity into the target */
  setTarget(PT+fling);
},{passive:true});

/* spring-chased P (critically damped) + rubber-band at the ends + beat magnetism.
   Reduced-motion snaps (no spring, no magnetism) so nothing moves on its own. */
function tick(){
  var now=performance.now();
  var dt=(tick._last==null)?0.016:Math.min(0.05,(now-tick._last)/1000); tick._last=now;
  if(REDUCED){ P=PT; Pv=0; }
  else {
    /* beat magnetism: once input is quiet, ease PT onto the nearest resting point */
    if((now-lastInteract)>250){
      var nearest=BEAT_RESTS[0], bestD=1e9;
      for(var ri=0;ri<BEAT_RESTS.length;ri++){ var dj=Math.abs(BEAT_RESTS[ri]-PT); if(dj<bestD){ bestD=dj; nearest=BEAT_RESTS[ri]; } }
      PT+=(nearest-PT)*Math.min(1,dt*2.2);
    }
    var tgt=clamp(PT,-0.06,1.06);
    var accel=SPRING_K*(tgt-P)-SPRING_D*Pv;
    Pv+=accel*dt; P+=Pv*dt;
    /* rubber-band: pull P (and an idle PT) back inside [0,1] */
    if(P<0){ P+=(-P)*Math.min(1,dt*8); if(PT<0&&(now-lastInteract)>90) PT+=(-PT)*Math.min(1,dt*6); }
    if(P>1){ P+=(1-P)*Math.min(1,dt*8); if(PT>1&&(now-lastInteract)>90) PT+=(1-PT)*Math.min(1,dt*6); }
  }
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

/* ---- neuro: lines + slow bright signals; nodes flare on hit.
   Node BREATHING feeds the corridor wall on the node's own plane: each breath
   peak adds charge (corridorNodeFlash accumulates, then slowly wears off), so
   the walls stay alive between pulses too. ---- */
var BREATH=3600; /* ms, matches the CSS nbreathe cycle */
function pulseNode(a){
  var el=$('node-'+a.id); if(!el) return;
  el.classList.add('flare'); clearTimeout(el._ft); el._ft=setTimeout(function(){ el.classList.remove('flare'); },900);
  a._bloom=1;   /* v6: arrival blooms the node's green wall pool, then decays back into the breath */
  try{ if(window.corridorNodeFlash && a._x!=null) window.corridorNodeFlash(a._x/stage.clientWidth,a._y/stage.clientHeight,1); }catch(e){}
}
function startNeuro(){
  var cv=$('neuro'); var ctx=cv.getContext('2d'); var W=0,H=0;
  function resize(){ W=cv.width=stage.clientWidth||900; H=cv.height=stage.clientHeight||600; }
  resize(); window.addEventListener('resize',function(){ clearTimeout(cv._rt); cv._rt=setTimeout(function(){ resize(); layoutHub(); placeKnob(); },180); });
  var pulses=[];
  var _nLast=performance.now();   /* hoisted: frame-delta for bloom decay (no per-frame alloc) */
  sendPulse=function(a,sp){ pulses.push({a:a,t:0,sp:sp||0.012}); };
  (function frame(now){
    now=now||performance.now(); ctx.clearRect(0,0,W,H);
    var dt=Math.min(0.05,(now-_nLast)/1000); _nLast=now;
    var cx=W/2,cy=H/2;
    var blue=document.body.classList.contains('familyMode');
    var lineCol=blue?'rgba(140,210,255,':'rgba(94,255,160,';
    NODES.forEach(function(a,i){
      if(a._lv==null) a._lv=0;
      a._lv+=((a._rv||0)-a._lv)*0.10;                 /* lines ease in and out */
      if(a._x==null||a._lv<0.01){
        if(a._bloom==null) a._bloom=0;
        /* board fix D2: zero this node's wall pool when it leaves the ring, or the
           light stays lit forever behind the node pages / the ask (calm beats). */
        if(!REDUCED&&window.corridorSetNodeLight&&a._x!=null) window.corridorSetNodeLight(i, a._x/W, a._y/H, 0);
        return;
      }
      var gx=cx+(a._x-cx)*lineGrow, gy=cy+(a._y-cy)*lineGrow;
      ctx.strokeStyle=lineCol+(0.30*lineGrow*a._lv).toFixed(3)+')'; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(gx,gy); ctx.stroke();

      /* v6 SINGLE-PULSE comet cadence (Eric law 8): one discrete comet per node
         per 3.6s breath cycle, staggered 1.2s apart, so no two ever depart
         together. This is the calm silk-thread pulse, not the random electricity.
         The comet render + arrival flare are the existing mechanics below. */
      if(!REDUCED&&a._rv>0.55){
        var pc=Math.floor((now - i*1200)/BREATH);       /* breath-cycle index for node i */
        if(a._pc==null) a._pc=pc;
        if(pc>a._pc){ a._pc=pc; pulses.push({a:a,t:0,sp:0.0132}); } /* one comet, ~1.5s travel */
      }

      /* per-node arrival bloom decays back into the breath (green, never white) */
      if(a._bloom==null) a._bloom=0;
      if(a._bloom>0.002) a._bloom*=Math.exp(-dt*3.2); else a._bloom=0;

      /* soft node breath (subtler than the orb, phase-offset by 1.2s) drives BOTH
         the wall pool and stays under the orb's amplitude (law 9). */
      var nph=(((now - i*1200)%BREATH)+BREATH)%BREATH/BREATH;
      var nb=Math.pow(0.5-0.5*Math.cos(nph*Math.PI*2),0.9);
      /* plane-local wall light at this node's anchor: soft breath + arrival bloom */
      if(!REDUCED&&window.corridorSetNodeLight){
        var lvl=a._rv*(0.35+0.40*nb+0.85*a._bloom);
        window.corridorSetNodeLight(i, a._x/W, a._y/H, lvl);
      }
      /* keep the existing wall-charge accumulation at the breath peak, too */
      if(!REDUCED&&window.corridorNodeFlash){
        if(nph>0.20&&nph<0.32){
          if(!a._bf){ a._bf=true; try{ window.corridorNodeFlash(a._x/W,a._y/H,0.32); }catch(e){} }
        } else if(nph>0.5) a._bf=false;
      }
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
   THE ASK, as a true MELRIC approval layer: every node and rail clears out,
   the orb JUMPS up and shrinks like the app's approval page, MELRIC's caption
   bar speaks on top, the question and glowing options sit beneath.
   Ends at the native Webflow form.
   ============================================================================ */
var STEPS={
  q1:{ kick:'A quick decision', say:'Quick one before I let you in.',
       q:'What is eating your time the most?',
       opts:[ {label:'The content',next:'q2'}, {label:'The money',next:'q2'}, {label:'The chaos',next:'q2'} ] },
  q2:{ kick:'Last one', say:'Last one, promise.',
       q:'If something handled the time-consuming work, could you enjoy life more and make more money?',
       opts:[ {label:'Yes',next:'endGood'}, {label:'Obviously',next:'endGood'} ] },
  endGood:{ kick:'Early access', say:'I will take it from here.',
            q:'MELRIC is built for exactly this.',
            body:'Custom built for you, onboarded by hand. Leave your email and we will reach out.', capture:true }
};

var answers=[];
function melSay(txt){
  var c=$('melCap'); if(!c) return;
  if(!txt){ c.classList.remove('show'); return; }
  c.textContent=txt;
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
}
function openFlow(){
  flowOpen=true; answers=[];
  document.body.classList.add('flowMode');   /* the ring + rails clear out */
  $('flowScrim').classList.add('on');
  var fl=$('flow'); fl.classList.add('on'); fl.classList.add('approval');
  orbUp();                                    /* and the orb jumps */
  applyStoryboard();
  renderStep('q1');
}
function closeFlow(){
  flowOpen=false; PT=0.94; P=0.94; Pv=0; lastInteract=performance.now();
  parkForm(); melSay('');
  document.body.classList.remove('flowMode');
  $('flowScrim').classList.remove('on');
  var fl=$('flow'); fl.classList.remove('on'); fl.classList.remove('approval');
  orbDown();
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
  buildHeadline();   /* v6: wrap the H1 into per-letter spans for the de-rez */
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

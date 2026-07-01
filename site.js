/* MELRIC.AI marketing site storyboard (production).
   Pinned view. Wheel, touch, and keys drive the storyboard.
   Depends on: Three.js r128, corridor3d.js, orb3d.js, app.css, marketing.css.
   Data capture is 100% native Webflow forms. site.js only reveals them and
   fills the hidden qualifier field. It never submits anything itself. */
(function(){
'use strict';

var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (REDUCED) document.body.classList.add('reduced');

/* ---- monochrome line glyphs ---- */
var G={
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  check:'<path d="M5.5 12.6l4 4 9-9.2"/>',
  bolt:'<path d="M13 3.5 6 13h5l-1 7.5L17 11h-5z"/>',
  chat:'<path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  sunrise:'<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 3v4M5.6 8.6 4.2 7.2M18.4 8.6l1.4-1.4"/>',
  eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.4"/>',
  loop:'<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M18 4v4h-4M6 20v-4h4"/>'
};
function nodeSvg(n){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">'+(G[n]||'')+'</svg>'; }

/* 8 nodes: 5 pillars (wave 1) + 3 "what it does" (wave 2) */
var NODES=[
  { id:'knows', name:'Knows you',      svg:nodeSvg('spark') },
  { id:'audit', name:'Reality Audit',  svg:nodeSvg('check') },
  { id:'acts',  name:'Acts for you',   svg:nodeSvg('bolt') },
  { id:'talks', name:'Talks with you', svg:nodeSvg('chat') },
  { id:'always',name:'Always on',      svg:nodeSvg('clock') },
  { id:'brief', name:'Morning brief',  svg:nodeSvg('sunrise') },
  { id:'slips', name:'Catches slips',  svg:nodeSvg('eye') },
  { id:'follow',name:'Follows up',     svg:nodeSvg('loop') }
];
var WAVE1=5;

function $(id){ return document.getElementById(id); }
var stage=$('stage');
var activeCount=WAVE1;

function buildRing(){
  NODES.forEach(function(a){
    var el=document.createElement('div');
    el.className='node is-live'; el.id='node-'+a.id;
    el.innerHTML='<div class="ico">'+a.svg+'</div><div class="nm">'+a.name+'</div>';
    el.onclick=function(){ openFlow(); };
    stage.appendChild(el);
  });
  layoutHub();
}
function layoutHub(){
  var W=stage.clientWidth,H=stage.clientHeight;
  var margin=(W<700||H<560)?112:165;
  var cx=W/2,cy=H/2,R=Math.max(margin,Math.min(W,H)/2-margin);
  var svg=$('links'); if(svg) svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var ob=$('orb'); if(ob){ ob.style.left=cx+'px'; ob.style.top=cy+'px'; }
  var active=NODES.slice(0,activeCount);
  active.forEach(function(a,i){
    var ang=-Math.PI/2+i*(2*Math.PI/active.length);
    a._x=cx+R*Math.cos(ang); a._y=cy+R*Math.sin(ang);
    var el=$('node-'+a.id); if(el){ el.style.left=a._x+'px'; el.style.top=a._y+'px'; }
  });
}

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function smooth(e0,e1,x){ var t=clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }

var P=0, PT=0, lineGrow=0, elecOn=0, flowOpen=false, contactOpen=false;
var CAPS=[
  {at:0.12,txt:'One brain that sees your entire operation.'},
  {at:0.34,txt:'It connects to everything you run.'},
  {at:0.50,txt:'And it goes to work, around the clock.'},
  {at:0.62,txt:'From the morning brief to every follow-up.'},
  {at:0.80,txt:'See if Melric fits your operation.'}
];

function applyStoryboard(){
  var want=P>0.55?NODES.length:WAVE1;
  if(want!==activeCount){ activeCount=want; layoutHub(); }

  NODES.forEach(function(a,i){
    var rv=0;
    if(i<WAVE1){ var s=0.10+i*(0.22/WAVE1); rv=smooth(s,s+0.09,P); }
    else if(i<activeCount){ var s2=0.57+(i-WAVE1)*(0.16/3); rv=smooth(s2,s2+0.08,P); }
    a._rv=rv;
    var el=$('node-'+a.id); if(el){
      el.style.opacity=rv.toFixed(3);
      el.style.transform='translate(-50%,-50%) scale('+(0.55+0.45*rv).toFixed(3)+')';
      el.style.pointerEvents=rv>0.9?'auto':'none';
    }
  });
  lineGrow=smooth(0.32,0.44,P);
  elecOn=REDUCED?0:smooth(0.44,0.54,P);

  var hero=$('hero'); if(hero) hero.style.opacity=(1-smooth(0.06,0.16,P)).toFixed(3);
  var hint=$('hint'); if(hint) hint.style.opacity=(1-smooth(0.02,0.08,P)).toFixed(3);
  var cap=''; CAPS.forEach(function(c){ if(P>=c.at) cap=c.txt; });
  var pc=$('phaseCap'); if(pc){ pc.textContent=cap; pc.style.opacity=(cap&&!flowOpen&&!contactOpen)?1:0; }

  if(P>0.92 && !flowOpen && !contactOpen) openFlow();
}

/* ---- gesture driver. The page itself never scrolls. ---- */
window.addEventListener('wheel',function(e){ if(flowOpen||contactOpen) return; e.preventDefault(); PT=clamp(PT+e.deltaY*0.00085,0,1); },{passive:false});
var _ty=null;
window.addEventListener('touchstart',function(e){ _ty=e.touches[0].clientY; },{passive:true});
window.addEventListener('touchmove',function(e){ if(flowOpen||contactOpen||_ty==null) return; var y=e.touches[0].clientY; PT=clamp(PT+(_ty-y)*0.0016,0,1); _ty=y; e.preventDefault(); },{passive:false});
window.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ if(contactOpen) closeContact(); else if(flowOpen) closeFlow(); return; }
  if(flowOpen||contactOpen) return;
  if(e.key==='ArrowDown'||e.key===' ') PT=clamp(PT+0.05,0,1);
  if(e.key==='ArrowUp') PT=clamp(PT-0.05,0,1);
});
function tick(){
  if(REDUCED){ P=PT; } else { P+=(PT-P)*0.12; if(Math.abs(PT-P)<0.0002) P=PT; }
  applyStoryboard(); watchFps(); requestAnimationFrame(tick);
}

/* ---- fps watchdog: two bad windows hide the corridor (low power) ---- */
var _fpsN=0,_fpsT=performance.now(),_strikes=0,_fpsDone=REDUCED;
function watchFps(){
  if(_fpsDone) return;
  _fpsN++;
  var now=performance.now();
  if(now-_fpsT>=4000){
    var fps=_fpsN/((now-_fpsT)/1000);
    _fpsN=0; _fpsT=now;
    if(fps<26){ _strikes++; if(_strikes>=2){ document.body.classList.add('low-power'); _fpsDone=true; } }
    else _strikes=0;
  }
}

/* ---- neuro: lines grow from the orb, then light glides to each node ---- */
function pulseNode(a){
  var el=$('node-'+a.id); if(!el) return;
  el.classList.add('flare'); clearTimeout(el._ft); el._ft=setTimeout(function(){ el.classList.remove('flare'); },600);
  try{ if(window.corridorNodeFlash && a._x!=null) window.corridorNodeFlash(a._x/stage.clientWidth,a._y/stage.clientHeight,1); }catch(e){}
}
function startNeuro(){
  var cv=$('neuro'); var ctx=cv.getContext('2d'); var W=0,H=0;
  function resize(){ W=cv.width=stage.clientWidth||900; H=cv.height=stage.clientHeight||600; }
  resize(); window.addEventListener('resize',function(){ clearTimeout(cv._rt); cv._rt=setTimeout(function(){ resize(); layoutHub(); },180); });
  var pulses=[];
  (function frame(now){
    now=now||performance.now(); ctx.clearRect(0,0,W,H);
    var cx=W/2,cy=H/2; var active=NODES.slice(0,activeCount);
    active.forEach(function(a){ if(a._x==null||!a._rv) return;
      var gx=cx+(a._x-cx)*lineGrow, gy=cy+(a._y-cy)*lineGrow;
      ctx.strokeStyle='rgba(94,255,160,'+(0.16*lineGrow*a._rv).toFixed(3)+')'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(gx,gy); ctx.stroke();
    });
    if(elecOn>0.2){
      active.forEach(function(a){ if(a._x==null||a._rv<0.9) return;
        if(a._gap==null){ a._gap=900+Math.random()*2600; a._last=now-Math.random()*2000; }
        if(now-a._last>a._gap){ a._last=now; a._gap=900+Math.random()*2600; pulses.push({a:a,t:0,sp:0.012+Math.random()*0.006}); }
      });
    }
    ctx.lineCap='round';
    for(var k=pulses.length-1;k>=0;k--){ var pl=pulses[k]; pl.t+=pl.sp;
      if(!pl.fired && pl.t>=0.82){ pl.fired=true; pulseNode(pl.a); }
      if(pl.t>=1){ pulses.splice(k,1); continue; }
      var a=pl.a, seg=0.16, ht=pl.t, tt=Math.max(0,pl.t-seg);
      var hx=cx+(a._x-cx)*ht, hy=cy+(a._y-cy)*ht, tx=cx+(a._x-cx)*tt, ty=cy+(a._y-cy)*tt;
      var env=pl.t<0.15?(pl.t/0.15):(pl.t>0.7?Math.max(0,(1-pl.t)/0.3):1);
      var grad=ctx.createLinearGradient(tx,ty,hx,hy);
      grad.addColorStop(0,'rgba(94,255,160,0)'); grad.addColorStop(1,'rgba(180,255,210,.95)');
      ctx.globalAlpha=env*elecOn; ctx.strokeStyle=grad; ctx.lineWidth=2; ctx.shadowBlur=8; ctx.shadowColor='rgba(94,255,160,.85)';
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(hx,hy); ctx.stroke(); ctx.globalAlpha=1;
    }
    ctx.shadowBlur=0;
    requestAnimationFrame(frame);
  })();
}

/* ============================================================================
   THE DECISION FLOW. Branching qualifier in the app's approval / one-move
   style. Every path ends at the native Webflow Request access form.
   The answers are written into the form's hidden qualifier field.
   ============================================================================ */
var STEPS={
  q1:{ kick:'A quick decision', q:'Could your operation benefit from automation?',
       opts:[ {label:'Yes',next:'q2'}, {label:'No',next:'endNo'} ] },
  q2:{ kick:'One more', q:'How many businesses or brands are you running?',
       opts:[ {label:'Just one',next:'q3'}, {label:'Two to four',next:'q3'}, {label:'Five or more',next:'q3',hot:true} ] },
  q3:{ kick:'Last one', q:'What slips the most right now?',
       opts:[ {label:'Follow-ups',next:'endGood'}, {label:'Knowing what is done',next:'endGood'}, {label:'Acting fast enough',next:'endGood'} ] },
  endGood:{ kick:'Early access', q:'Melric is built for exactly this.',
            body:'We are onboarding a small first group of operators by hand. Leave your email and we will reach out.', capture:true },
  endNo:{ kick:'Noted', q:'Then you are ahead of most.',
          body:'If keeping the whole operation honest ever starts to slip, Melric will be here.', requestSmall:true }
};

var answers=[];
function openFlow(){
  flowOpen=true; answers=[];
  $('flowScrim').classList.add('on'); $('flow').classList.add('on');
  var orb=$('orb'); if(orb){ orb.style.transform='translate(-50%,-50%) scale(.7)'; orb.style.filter='brightness(.8)'; }
  applyStoryboard();
  renderStep('q1');
}
function closeFlow(){
  flowOpen=false; PT=0.84; P=0.84;
  parkForm();
  $('flowScrim').classList.remove('on'); $('flow').classList.remove('on');
  var orb=$('orb'); if(orb){ orb.style.transform='translate(-50%,-50%)'; orb.style.filter=''; }
  applyStoryboard();
}
/* Move the native Webflow form back to its hidden home so it can be reused. */
function parkForm(){
  var home=$('formHome'), wrap=$('accessFormWrap');
  if(home&&wrap&&wrap.parentNode!==home) home.appendChild(wrap);
}
function placeForm(slot){
  var wrap=$('accessFormWrap'); if(!wrap||!slot) return;
  var field=document.getElementById('qualifier-path');
  if(field) field.value=answers.join(' | ')||'direct';
  slot.appendChild(wrap);
}
function renderStep(key){
  var s=STEPS[key]; if(!s) return;
  var step=$('flowStep'); step.classList.remove('in');
  parkForm();
  var html='<div class="kick">'+s.kick+'</div><h3>'+s.q+'</h3>';
  if(s.body) html+='<p>'+s.body+'</p>';
  if(s.opts){ html+='<div class="opts">'+s.opts.map(function(o,i){ return '<span class="opt" data-i="'+i+'">'+o.label+'</span>'; }).join('')+'</div>'; }
  if(s.capture){ html+='<div id="formSlot"></div>'; }
  if(s.requestSmall){ html+='<div class="field"><span class="glow" id="showMe">Actually, show me <span class="arw">&rsaquo;</span></span></div>'; }
  html+='<div class="backline"><span class="glow" id="backOrb">Back to the orb <span class="arw">&rsaquo;</span></span></div>';
  step.innerHTML=html;
  if(s.capture) placeForm($('formSlot'));
  var sm=$('showMe'); if(sm) sm.onclick=function(){ renderStep('endGood'); };
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
  requestAnimationFrame(layoutHub); setTimeout(layoutHub,200); setTimeout(layoutHub,600);
  startNeuro(); boot3d(); applyStoryboard(); tick();
  var hint=$('hint'); if(hint&&('ontouchstart' in window)) hint.textContent='Swipe';
  var ca=$('ctaAccess'); if(ca) ca.onclick=function(){ openFlow(); };
  var cc=$('ctaContact'); if(cc) cc.onclick=function(){ openContact(); };
  var cb=$('contactBack'); if(cb) cb.onclick=closeContact;
});
window.addEventListener('resize',function(){ layoutHub(); applyStoryboard(); });

window.melricSite={ openFlow:openFlow, closeFlow:closeFlow, openContact:openContact, closeContact:closeContact };
})();

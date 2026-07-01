/* orb3d.js — Melric's living 3D "atom" core.
 *
 * A genuinely dimensional atom: a churning plasma nucleus (custom GLSL fbm
 * noise + Fresnel rim) wrapped by three real 3D orbital rings, each carrying a
 * glowing electron that passes IN FRONT OF and BEHIND the nucleus with correct
 * depth occlusion. Additive halos/sprites fake an emissive bloom. The whole
 * atom breathes on a 3.6s sine cycle and slowly rotates so the orbits read 3D.
 *
 * Plain script — no imports/exports. Expects global THREE (r128) already loaded.
 * Exposes window.startOrb3D(canvasId). Composites over the dark hub (alpha:true).
 *
 * Palette: Matrix greens #2ee66f / #5effa0 / #9dffc4, hot white #ffffff core.
 */
(function () {
  'use strict';

  window.startOrb3D = function startOrb3D(canvasId) {
    if (typeof THREE === 'undefined') {
      console.warn('orb3d: THREE not found — 3D atom skipped');
      return;
    }
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn('orb3d: canvas #' + canvasId + ' not found');
      return;
    }

    // ---- renderer (transparent, composites over the hub) ----
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false
      });
    } catch (e) {
      console.error('orb3d: WebGL init failed', e);
      return;
    }
    renderer.setClearColor(0x000000, 0); // clear alpha 0 — fully transparent
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // cap at 2

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);
    camera.lookAt(0, 0, 0);

    var clock = new THREE.Clock();

    // ============================================================
    // 1) PLASMA NUCLEUS — custom ShaderMaterial, fbm noise + Fresnel rim
    // ============================================================
    var nucleusUniforms = {
      uTime: { value: 0 },
      uBright: { value: 1.0 },
      // Matrix green palette → hot white
      uColLo: { value: new THREE.Color(0x0a7a3c) }, // deep green base
      uColMid: { value: new THREE.Color(0x2ee66f) },
      uColHi: { value: new THREE.Color(0x9dffc4) },
      uColHot: { value: new THREE.Color(0xffffff) }
    };

    var nucleusVert = [
      'varying vec3 vNormal;',
      'varying vec3 vViewDir;',
      'varying vec3 vPos;',
      'void main() {',
      '  vPos = position;',
      '  vNormal = normalize(normalMatrix * normal);',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  vViewDir = normalize(-mv.xyz);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n');

    var nucleusFrag = [
      'precision highp float;',
      'uniform float uTime;',
      'uniform float uBright;',
      'uniform vec3 uColLo;',
      'uniform vec3 uColMid;',
      'uniform vec3 uColHi;',
      'uniform vec3 uColHot;',
      'varying vec3 vNormal;',
      'varying vec3 vViewDir;',
      'varying vec3 vPos;',

      // --- simplex-style 3D noise (Ashima/Nikita Miropolskiy compact variant) ---
      'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
      'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
      'float snoise(vec3 v){',
      '  const vec2 C = vec2(1.0/6.0, 1.0/3.0);',
      '  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',
      '  vec3 i  = floor(v + dot(v, C.yyy));',
      '  vec3 x0 = v - i + dot(i, C.xxx);',
      '  vec3 g = step(x0.yzx, x0.xyz);',
      '  vec3 l = 1.0 - g;',
      '  vec3 i1 = min(g.xyz, l.zxy);',
      '  vec3 i2 = max(g.xyz, l.zxy);',
      '  vec3 x1 = x0 - i1 + C.xxx;',
      '  vec3 x2 = x0 - i2 + C.yyy;',
      '  vec3 x3 = x0 - D.yyy;',
      '  i = mod289(i);',
      '  vec4 p = permute(permute(permute(',
      '             i.z + vec4(0.0, i1.z, i2.z, 1.0))',
      '           + i.y + vec4(0.0, i1.y, i2.y, 1.0))',
      '           + i.x + vec4(0.0, i1.x, i2.x, 1.0));',
      '  float n_ = 0.142857142857;',
      '  vec3 ns = n_ * D.wyz - D.xzx;',
      '  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);',
      '  vec4 x_ = floor(j * ns.z);',
      '  vec4 y_ = floor(j - 7.0 * x_);',
      '  vec4 x = x_ * ns.x + ns.yyyy;',
      '  vec4 y = y_ * ns.x + ns.yyyy;',
      '  vec4 h = 1.0 - abs(x) - abs(y);',
      '  vec4 b0 = vec4(x.xy, y.xy);',
      '  vec4 b1 = vec4(x.zw, y.zw);',
      '  vec4 s0 = floor(b0) * 2.0 + 1.0;',
      '  vec4 s1 = floor(b1) * 2.0 + 1.0;',
      '  vec4 sh = -step(h, vec4(0.0));',
      '  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;',
      '  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;',
      '  vec3 p0 = vec3(a0.xy, h.x);',
      '  vec3 p1 = vec3(a0.zw, h.y);',
      '  vec3 p2 = vec3(a1.xy, h.z);',
      '  vec3 p3 = vec3(a1.zw, h.w);',
      '  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));',
      '  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;',
      '  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
      '  m = m * m;',
      '  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));',
      '}',

      // --- fbm: stacked octaves of churning noise, advected through time ---
      'float fbm(vec3 p){',
      '  float v = 0.0;',
      '  float amp = 0.5;',
      '  float freq = 1.0;',
      '  for(int i = 0; i < 6; i++){',
      '    v += amp * snoise(p * freq);',
      '    freq *= 2.02;',
      '    amp *= 0.5;',
      '  }',
      '  return v;',
      '}',

      'void main() {',
      '  vec3 n = normalize(vNormal);',
      '  float t = uTime * 0.34;',
      // domain-warped fbm so the surface roils like a small star
      '  vec3 q = vPos * 2.5 + vec3(0.0, 0.0, t);',
      '  float warp = fbm(q + vec3(t * 0.6, -t * 0.4, t * 0.2));',
      '  float energy = fbm(q * 1.4 + warp * 1.25 + vec3(t * 0.5));',
      '  float detail = fbm(q * 4.2 + warp * 0.6 + vec3(-t * 0.7, t * 0.5, 0.0));',
      '  energy = clamp(energy * 0.5 + 0.5 + detail * 0.18, 0.0, 1.0);', // 0..1
      // sharpen hot cores
      '  float hot = smoothstep(0.66, 0.92, energy);',
      '  float mid = smoothstep(0.34, 0.8, energy);',
      // build the body color: deep green -> green -> mint -> white-hot
      '  vec3 col = mix(uColLo, uColMid, smoothstep(0.0, 0.55, energy));',
      '  col = mix(col, uColHi, mid);',
      '  col = mix(col, uColHot, hot * 0.9);',
      // Fresnel rim — edges glow brighter, sells the 3D sphere
      '  float fres = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 2.4);',
      '  vec3 rim = mix(uColMid, uColHi, 0.6) * fres * 1.7;',
      '  col += rim;',
      // a little extra core lift toward the viewer-facing center
      '  float facing = max(dot(n, normalize(vViewDir)), 0.0);',
      '  col += uColHi * pow(facing, 3.0) * 0.18;',
      '  col *= uBright;',
      '  vec3 lightDir = normalize(vec3(-0.35, 0.75, 0.55));',
      '  float diff = clamp(dot(n, lightDir) * 0.5 + 0.5, 0.0, 1.0);',
      '  float shade = 0.224 + 0.776 * diff;',
      '  col *= shade;',
      // alpha: solid body, with rim staying opaque so occlusion reads correctly
      '  float a = clamp(0.92 + fres * 0.08, 0.0, 1.0);',
      '  gl_FragColor = vec4(col, a);',
      '}'
    ].join('\n');

    var nucleusGeo = new THREE.SphereGeometry(1.0, 96, 96);
    var nucleusMat = new THREE.ShaderMaterial({
      uniforms: nucleusUniforms,
      vertexShader: nucleusVert,
      fragmentShader: nucleusFrag,
      transparent: true,
      depthWrite: true,
      depthTest: true
    });
    var nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);

    // group that breathes / scales (nucleus + its tight inner glow)
    var nucleusGroup = new THREE.Group();
    nucleusGroup.add(nucleus);

    // ---- additive radial sprite texture (reused for all glows) ----
    function makeGlowTexture() {
      var size = 128;
      var c = document.createElement('canvas');
      c.width = c.height = size;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grd.addColorStop(0.0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.18, 'rgba(200,255,225,0.9)');
      grd.addColorStop(0.45, 'rgba(94,255,160,0.45)');
      grd.addColorStop(0.75, 'rgba(46,230,111,0.12)');
      grd.addColorStop(1.0, 'rgba(46,230,111,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, size, size);
      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }
    var glowTex = makeGlowTexture();

    function makeSprite(scale, color, opacity) {
      var mat = new THREE.SpriteMaterial({
        map: glowTex,
        color: color,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false // halos always read as radiant energy on top
      });
      var s = new THREE.Sprite(mat);
      s.scale.set(scale, scale, 1);
      return s;
    }

    // layered additive halos around the nucleus → emissive / fake-bloom
    var coreHalo1 = makeSprite(2.3, 0x5effa0, 0.4);
    var coreHalo2 = makeSprite(3.3, 0x2ee66f, 0.18);
    var coreHalo3 = makeSprite(4.8, 0x2ee66f, 0.09);
    nucleusGroup.add(coreHalo3);
    nucleusGroup.add(coreHalo2);
    nucleusGroup.add(coreHalo1);

    scene.add(nucleusGroup);

    // ============================================================
    // 2) THREE ORBITAL RINGS in real 3D + glowing electrons
    // ============================================================
    var atom = new THREE.Group(); // whole atom slowly rotates
    scene.add(atom);
    atom.scale.setScalar(0.7); // 30% smaller — electrons + orbit radius shrink together

    // ============================================================
    // MELRIC label — rendered INSIDE the 3D scene, sitting just above the nucleus
    // front (z≈0.72, nucleus front pole is z≈0.7). It's a camera-facing Sprite with
    // depthTest ON, so near-side electrons (which sweep to z≈1.2) pass OVER and occlude
    // it, while it still floats above the nucleus surface. depthWrite OFF so its
    // transparent pixels never block the plasma/electrons behind it.
    // ============================================================
    (function addMelricLabel() {
      var lc = document.createElement('canvas');
      lc.width = 512; lc.height = 128;
      var lg = lc.getContext('2d');
      lg.clearRect(0, 0, 512, 128);
      lg.font = '800 80px system-ui, "Helvetica Neue", Arial, sans-serif';
      lg.textAlign = 'left';
      lg.textBaseline = 'middle';
      // Lay out each letter by its REAL width + an even gap, so narrow glyphs like "I"
      // don't leave oversized gaps (the monospace cell was doing that between I and C).
      var word = 'MELRIC', gap = 9, widths = [], total = 0, li, lx;
      for (li = 0; li < word.length; li++) { var lw = lg.measureText(word[li]).width; widths.push(lw); total += lw; }
      total += gap * (word.length - 1);
      var startX = 256 - total / 2;
      function drawMel(yy) { var x = startX; for (var k = 0; k < word.length; k++) { lg.fillText(word[k], x, yy); x += widths[k] + gap; } }
      // Pass 1 — BIG soft shadow ALL AROUND the letters (no offset, wide blur): an even halo
      // on every side so the word reads as hovering above the nucleus. Drawn twice to deepen.
      lg.shadowColor = 'rgba(0,0,0,1)'; lg.shadowOffsetX = 0; lg.shadowOffsetY = 0; lg.shadowBlur = 20;
      lg.fillStyle = 'rgba(0,0,0,1)';
      drawMel(68);
      drawMel(68);
      // Pass 2 — directional cast shadow, BIGGER + darker, heavier below (the angle you liked).
      lg.shadowColor = 'rgba(0,0,0,1)'; lg.shadowOffsetY = 8; lg.shadowBlur = 15;
      lg.fillStyle = 'rgba(0,0,0,1)';
      drawMel(67);
      // Pass 3 — white letters, slightly faded + softened so they read gently, not razor-crisp.
      lg.shadowColor = 'rgba(0,0,0,0)'; lg.shadowBlur = 0; lg.shadowOffsetX = 0; lg.shadowOffsetY = 0;
      lg.filter = 'blur(0.5px)';
      lg.fillStyle = 'rgba(255,255,255,0.9)';
      drawMel(66);
      lg.filter = 'none';
      var ltex = new THREE.CanvasTexture(lc);
      ltex.minFilter = THREE.LinearFilter;
      ltex.magFilter = THREE.LinearFilter;
      // Curve the label ONTO the nucleus: a subdivided plane whose vertices are pushed onto
      // a sphere of radius ~0.72 (just above the nucleus' 0.7 front surface) so the text
      // conforms to the 3D curvature and never punches through. depthTest lets near-side
      // electrons pass over it; depthWrite off so it doesn't block the plasma behind.
      var W = 1.12, H = 0.27, Rc = 0.72;
      var capGeo = new THREE.PlaneGeometry(W, H, 48, 12);
      var cpos = capGeo.attributes.position;
      for (var vi = 0; vi < cpos.count; vi++) {
        var vx = cpos.getX(vi), vy = cpos.getY(vi);
        cpos.setZ(vi, Math.sqrt(Math.max(0.0001, Rc * Rc - vx * vx - vy * vy)));
      }
      cpos.needsUpdate = true;
      capGeo.computeVertexNormals();
      var capMat = new THREE.MeshBasicMaterial({ map: ltex, transparent: true, depthTest: true, depthWrite: false, side: THREE.DoubleSide });
      var cap = new THREE.Mesh(capGeo, capMat);
      cap.renderOrder = 5;
      scene.add(cap);
    })();

    var ringColor = new THREE.Color(0x5effa0);

    // each orbit: radius, tilt (Euler), speed, phase
    var orbitConfigs = [
      { r: 1.46, rot: [Math.PI * 0.5, 0.0, 0.0], speed: 0.95, phase: 0.0, count: 5 },
      { r: 1.65, rot: [Math.PI * 0.28, Math.PI * 0.42, Math.PI * 0.1], speed: -0.72, phase: 2.1, count: 5 },
      { r: 1.85, rot: [-Math.PI * 0.18, Math.PI * 0.78, -Math.PI * 0.22], speed: 0.6, phase: 4.0, count: 6 },
      { r: 1.57, rot: [Math.PI * 0.62, -Math.PI * 0.3, Math.PI * 0.5], speed: -0.85, phase: 1.0, count: 5 },
      { r: 1.77, rot: [-Math.PI * 0.4, Math.PI * 0.15, -Math.PI * 0.6], speed: 0.78, phase: 3.0, count: 5 },
      { r: 1.96, rot: [Math.PI * 0.1, -Math.PI * 0.6, Math.PI * 0.32], speed: -0.55, phase: 5.0, count: 6 }
    ];

    var electrons = [];

    orbitConfigs.forEach(function (cfg) {
      var orbitGroup = new THREE.Group();
      orbitGroup.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
      atom.add(orbitGroup);

      // faint thin ring geometry (the orbit path)
      var ringGeo = new THREE.TorusGeometry(cfg.r, 0.012, 8, 160);
      var ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.275,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      orbitGroup.add(new THREE.Mesh(ringGeo, ringMat));

      // multiple electrons evenly spaced around each orbit (~10x density)
      var count = cfg.count || 1;
      for (var k = 0; k < count; k++) {
        var electron = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), new THREE.MeshBasicMaterial({ color: 0xeafff2 }));
        electron.add(makeSprite(0.5, 0x5effa0, 0.4));
        electron.add(makeSprite(0.3, 0x9dffc4, 0.85));
        orbitGroup.add(electron);
        electrons.push({ mesh: electron, r: cfg.r, speed: cfg.speed, phase: cfg.phase + k * (Math.PI * 2 / count) });
      }
    });

    // ============================================================
    // RESIZE
    // ============================================================
    function resize() {
      var w = canvas.clientWidth || canvas.parentElement && canvas.parentElement.clientWidth || 300;
      var h = canvas.clientHeight || canvas.parentElement && canvas.parentElement.clientHeight || 300;
      if (w === 0 || h === 0) { w = 300; h = 300; }
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', function () {
      clearTimeout(canvas._orbRT);
      canvas._orbRT = setTimeout(resize, 150);
    });

    // ============================================================
    // ANIMATE
    // ============================================================
    var TWO_PI = Math.PI * 2;

    function frame() {
      requestAnimationFrame(frame);
      var t = clock.getElapsedTime();

      // breathing on a 3.6s sine cycle: dim/small → bright/big → dim
      var breath = Math.sin((t / 3.6) * TWO_PI); // -1..1
      var scale = 1.0 + breath * 0.08;            // ±8%
      var bright = 0.60 + (breath * 0.5 + 0.5) * 0.31; // ~0.60 .. 0.91 — peak pulled down so the nucleus never blows out (more plasma detail); dark phase down another 10%

      nucleusGroup.scale.setScalar(0.7);
      nucleusUniforms.uTime.value = t;
      nucleusUniforms.uBright.value = bright;

      // pulse the core halos with the breath too
      var haloBoost = 0.5 + (breath * 0.5 + 0.5) * 0.6;
      coreHalo1.material.opacity = 0.3 * haloBoost + 0.12;
      coreHalo2.material.opacity = 0.16 * haloBoost + 0.05;
      coreHalo3.material.opacity = 0.08 * haloBoost + 0.03;
      var hs = 1.0 + (breath * 0.5 + 0.5) * 0.32;
      coreHalo1.scale.set(2.3 * hs, 2.3 * hs, 1);
      coreHalo2.scale.set(3.3 * hs, 3.3 * hs, 1);
      coreHalo3.scale.set(4.8 * hs, 4.8 * hs, 1);

      // slowly rotate the whole atom so the 3D orbits read dimensional
      atom.rotation.y = t * 0.16;
      atom.rotation.x = Math.sin(t * 0.11) * 0.18;

      // move electrons around their orbital planes (genuine front/back depth)
      for (var i = 0; i < electrons.length; i++) {
        var e = electrons[i];
        var a = e.phase + t * e.speed;
        e.mesh.position.set(Math.cos(a) * e.r, Math.sin(a) * e.r, 0);
        // gentle twinkle on the electrons
        var tw = 0.85 + Math.sin(t * 3.0 + e.phase * 2.0) * 0.15;
        e.mesh.children[0].material.opacity = 0.9 * tw;
        e.mesh.children[1].material.opacity = 0.5 * tw;
      }

      renderer.render(scene, camera);
    }
    frame();
  };
})();

/*
 * corridor3d.js — Matrix-style endless "inside of a computer" flythrough.
 *
 * Self-contained Three.js (r128 global THREE) background module.
 * Exposes window.startCorridor3D(canvasId).
 *
 * The camera flies forever along a procedurally extended CatmullRom spline.
 * Tunnel geometry is streamed segment-by-segment (created ahead, recycled
 * behind) so it never repeats and stays memory-stable. Each cross-section
 * morphs between a rectangular corridor and a circular tube over the path,
 * and the tunnel radius widens/narrows so you fly through openings and
 * larger chambers. Walls are textured with glowing green 1s and 0s via a
 * CanvasTexture atlas (cheap on the GPU). A few brighter "data pulse"
 * streaks crawl along the walls.
 *
 * No imports/exports — plain script loaded via <script> in the renderer.
 */
(function () {
  'use strict';

  // ===========================================================================
  // TUNING CONSTANTS — dial these to taste.
  // ===========================================================================
  var CONFIG = {
    // --- Motion ---
    SPEED: 3.5,            // forward camera speed (world units / second)
    TURN_FREQUENCY: 0.5,   // 0..1 likelihood of a notable bend per new node
    TURN_STRENGTH: 12.0,   // max horizontal swing (world units) per path node — smooth bends read from the curving near walls
    ELEVATION_STRENGTH: 7.0, // max vertical rise/fall per path node
    NODE_SPACING: 24.0,    // distance between control points along the path
    BANK_STRENGTH: 0.0,    // camera roll OFF — turning is read from the bending near digits, not a jerky barrel roll

    // --- Tunnel shape ---
    BASE_RADIUS: 12.0,     // moderate — near walls light on the viewer's plane; deeper rings fall to black
    RADIUS_VARIATION: 6.0, // varies the ring size so no fixed outline ever reads
    RING_SEGMENTS: 56,     // vertices around each cross-section (smoothness; 28→56 2026-06-10 so polygon corners sample finely — kills the corner crease line, negligible cost at ≤8 live segments)
    RINGS_PER_NODE: 6,     // tube rings generated between two path nodes
    SEGMENTS_AHEAD: 7,     // how many path nodes of geometry to keep ahead
    MORPH_FREQUENCY: 0.13, // spatial frequency of box<->circle morphing

    // --- Glyph texture (the 1s and 0s) ---
    GLYPH_DENSITY: 16,     // glyph grid cells per texture tile (NxN)
    GLYPH_TEXTURE_SIZE: 512, // atlas resolution (power of two)
    GLYPH_REPEAT_U: 6.0,   // texture tiling around the tube
    GLYPH_REPEAT_V: 2.2,   // texture tiling per node-length along the tube

    // --- Look / brightness (keep low — this is a BACKGROUND) ---
    GREEN: 0x2ee66f,       // primary Matrix green
    GREEN_BRIGHT: 0x9dffc4,// highlight green toward white
    WALL_OPACITY: 0.62,    // overall wall opacity
    EMISSIVE_INTENSITY: 0.62, // site v3: lifted from 0.5 (Eric: brighter overall) // LOW self-glow — uniform self-glow is what reveals deep tunnel structure (upcoming turns). Kept low so only camera/Melric-lit NEAR digits show; the deep tunnel stays dark. Nudged up slightly to lift an over-dark background.
    NEAR_BRIGHTNESS: 14.5, // site v3: lifted from 12.4 // gentle near-brightness; the light no longer defines the reach (fog does), so this just sets LIT digit brightness. +10% to brighten lit digits — fog still takes the deep ones to the same black, so the dark parts are unchanged.
    BREATH_PERIOD: 3.6,    // seconds — matches Melric's orb breathing so the digits pulse in sync
    EMISSIVE_BREATH: 0.11, // SMALL — a big emissive swing slides the fog/visibility threshold forward & back, and that moving threshold reads as a tube-shaped hard line sweeping in the tunnel. Tiny swing = gentle shimmer, not a moving boundary.
    FAR_DIM: 0.18,   // site v3: lifted from 0.12          // zero ambient — anything deeper than the viewer's plane (behind Melric) goes pure black
    FOG_NEAR: 9.0,         // lit only right at the foreground / viewer's plane
    FOG_FAR: 28.0,         // (unused with exponential fog below — kept for reference)
    FOG_DENSITY: 0.024,    // fog is now the SOLE depth fade — a smooth exponential to black by ~50 units (hides deep turns) with no cutoff distance, so there is no hard edge anywhere for the tube shape to ride on.
    BACKGROUND_ALPHA: 1.0, // opaque BLACK clear — digits read as a black void, no app-bg bleed, no visible tube end

    // --- Data pulses ---
    PULSE_COUNT: 0,        // bright streaks crawling along walls (removed — read as white rectangles)
    PULSE_SPEED: 18.0,     // pulse travel speed
    PULSE_OPACITY: 0.35,   // pulse brightness (kept subtle)

    PIXEL_RATIO_CAP: 2.0   // cap devicePixelRatio for performance
  };

  // ===========================================================================
  // Internal state
  // ===========================================================================
  var renderer, scene, camera, clock;
  var pathPoints = [];        // THREE.Vector3 control points
  var pathMeta = [];          // per-node { radius, morph } shape params
  var distanceTraveled = 0;   // arclength the camera has covered
  var nodeCursor = 0;         // index of the path node we're approaching
  var segmentGroup;           // holds streaming tube segments
  var segments = [];          // { mesh, startNode } pool
  var glyphTexture, glyphMaterial, camLight = null;
  var pulseMeshes = [];
  var animId = null;
  var canvasEl = null;
  var dir = new THREE.Vector3(0, 0, -1); // current path heading
  var _curRoll = 0; // smoothed camera bank/roll, eased toward the turn each frame
  var _meanderH = Math.random() * Math.PI * 2; // continuous horizontal curvature phase — keeps the path always bending
  var _meanderV = Math.random() * Math.PI * 2; // continuous vertical curvature phase

  // Reusable temporaries
  var _v0 = new THREE.Vector3();
  var _up = new THREE.Vector3(0, 1, 0);

  // ---- Scroll-coupled dolly (v6, additive; Eric law 5 + 8c) -------------------
  // The tunnel SPRINTS only while the user is scrolling, then settles to a
  // barely-there luxurious drift when parked. Two inputs, set from site.js via
  // window.corridorSetDrive(drive, pushIn):
  //   _drive  [0..1] = how hard the user is scrolling right now (spring velocity)
  //   _pushIn [0..1] = the storyboard scroll DEPTH; we dolly by its CHANGE only
  // The delta form is load-bearing: adding the full depth every frame (the naive
  // form) re-adds depth forever and the camera runs away. Distance-per-frame =
  // idle drift (tiny) + a drive-scaled sprint + the frame-over-frame push delta.
  var _drive = 0, _pushIn = 0, _lastPushIn = 0, _driveActive = false;

  // ===========================================================================
  // Glyph atlas — a canvas full of randomly placed 0s and 1s, green on black.
  // ===========================================================================
  function buildGlyphTexture() {
    var size = CONFIG.GLYPH_TEXTURE_SIZE;
    var cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    var ctx = cv.getContext('2d');

    // Near-black base so the texture reads as dark surface with glowing chars.
    ctx.fillStyle = '#020604';
    ctx.fillRect(0, 0, size, size);

    var n = CONFIG.GLYPH_DENSITY;
    var cell = size / n;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var fontPx = Math.floor(cell * 0.82);

    for (var gy = 0; gy < n; gy++) {
      for (var gx = 0; gx < n; gx++) {
        // Some cells are empty for a sparser, less busy look.
        if (Math.random() < 0.45) continue;
        var ch = Math.random() < 0.5 ? '0' : '1';
        // Brightness varies per glyph; a few are bright highlights.
        var r = Math.random();
        var alpha, color;
        if (r > 0.93) {
          alpha = 0.95; color = '#cfffe0';        // rare bright white-green
        } else if (r > 0.7) {
          alpha = 0.7; color = '#5effa0';
        } else {
          alpha = 0.32 + Math.random() * 0.22; color = '#2ee66f';
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.font = fontPx + 'px "Courier New", monospace';
        var cx = gx * cell + cell * 0.5 + (Math.random() - 0.5) * cell * 0.15;
        var cy = gy * cell + cell * 0.5 + (Math.random() - 0.5) * cell * 0.15;
        ctx.fillText(ch, cx, cy);
      }
    }
    ctx.globalAlpha = 1.0;

    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  // ===========================================================================
  // Path generation — keep appending nodes with gentle turns + elevation.
  // ===========================================================================
  function pushNode() {
    var prev = pathPoints.length ? pathPoints[pathPoints.length - 1]
                                 : new THREE.Vector3(0, 0, 0);

    // The path is ALWAYS gently curving (a continuous sine meander), never dead-straight.
    // A straight axial view lets perspective squash the far rings into a few screen pixels
    // at the center, and that compressed band reads as a HARD cross-section "shadow"
    // (square tube -> square hole, round tube -> round hole). Constant curvature keeps the
    // inside wall of the bend filling the center, so there's no clean cross-section hole to
    // silhouette — the deep tunnel is occluded by a curving wall, not outlined.
    _meanderH += 0.34;
    _meanderV += 0.27;
    var turn = Math.sin(_meanderH) * CONFIG.TURN_STRENGTH * 0.6
             + (Math.random() - 0.5) * CONFIG.TURN_STRENGTH * 0.4;
    var rise = Math.sin(_meanderV) * CONFIG.ELEVATION_STRENGTH * 0.55
             + (Math.random() - 0.5) * CONFIG.ELEVATION_STRENGTH * 0.5;

    // Rotate heading in the XZ plane by an angle proportional to the turn,
    // and nudge it vertically for elevation changes. Then advance.
    var angle = (turn / CONFIG.NODE_SPACING) * 0.9;
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    var nx = dir.x * cosA - dir.z * sinA;
    var nz = dir.x * sinA + dir.z * cosA;
    dir.set(nx, dir.y + (rise / CONFIG.NODE_SPACING) * 0.8, nz);
    dir.normalize();

    var next = prev.clone().addScaledVector(dir, CONFIG.NODE_SPACING);
    pathPoints.push(next);

    // Shape params: smoothly varying radius (chambers) + box/circle morph.
    var idx = pathPoints.length - 1;
    var radius = CONFIG.BASE_RADIUS +
      Math.sin(idx * 0.37) * CONFIG.RADIUS_VARIATION * 0.5 +
      (Math.random() - 0.5) * CONFIG.RADIUS_VARIATION * 0.4;
    radius = Math.max(CONFIG.BASE_RADIUS * 0.6, radius);
    // Cross-section cycles through SHAPES (square, triangle, circle, hexagon, pentagon...),
    // held ~2 nodes each, then morphing to the next.
    var sh = SHAPES[Math.floor(idx / 2) % SHAPES.length];
    pathMeta.push({ radius: radius, shape: sh });
  }

  function ensurePathLength(throughNode) {
    while (pathPoints.length <= throughNode + 3) {
      pushNode();
    }
  }

  // Build a CatmullRom curve spanning the needed window of nodes.
  function makeCurve() {
    // Use the whole live point list; it's bounded because we trim old nodes.
    return new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.5);
  }

  // ===========================================================================
  // Cross-section shapes: a regular N-gon, optionally rounded toward a circle.
  // The tunnel cycles through these and morphs smoothly between consecutive ones.
  // ===========================================================================
  // round 0.0 → 0.12 (Eric-approved fix 2026-06-10): perfectly sharp polygon corners create a
  // geometric crease that reads as a SOLID LINE down the tunnel. A 12% blend toward circle is
  // invisible as "rounding" at tunnel scale but melts the crease. Shapes still read as themselves.
  var SHAPES = [
    { sides: 4, round: 0.12 }, // square
    { sides: 3, round: 0.12 }, // triangle
    { sides: 9, round: 1.0 },  // circle
    { sides: 6, round: 0.12 }, // hexagon
    { sides: 4, round: 0.12 }, // square
    { sides: 5, round: 0.12 }, // pentagon
    { sides: 9, round: 1.0 },  // circle
    { sides: 3, round: 0.12 }  // triangle
  ];
  // Radius (0..1) of a regular polygon (vertices on the unit circle, an edge facing up) at angle theta,
  // blended toward a circle by `round` (0 = sharp polygon, 1 = circle).
  function shapeRadius(theta, sides, round) {
    if (round >= 0.999 || sides < 3) return 1.0;
    var seg = (2 * Math.PI) / sides;
    var a = (((theta + seg * 0.5) % seg) + seg) % seg - seg * 0.5;
    var rp = Math.cos(seg * 0.5) / Math.cos(a);
    return rp + (1.0 - rp) * round;
  }
  // Local-space ring point, blending cross-section shape A -> shape B by t.
  function csPoint(theta, radius, sa, sb, t) {
    var rA = shapeRadius(theta, sa.sides, sa.round);
    var rB = shapeRadius(theta, sb.sides, sb.round);
    var r = (rA + (rB - rA) * t) * radius;
    return [Math.cos(theta) * r, Math.sin(theta) * r];
  }

  // ---- Even-ARC-LENGTH theta samples around the blended cross-section (fix 2026-06-10). ----
  // Uniform-theta sampling bunches vertices (and therefore the glyph texture) where a polygon
  // wall dips toward the center — the compressed glyph columns smear into the SOLID BRIGHT LINE
  // Eric sees running down the tunnel on triangle/square sections. Distributing the vertices by
  // perimeter arc length keeps glyph density perfectly even around ANY shape. Same geometry,
  // same look — just no hot seams. Cheap: runs only when a segment is (re)built.
  function arcThetas(sa, sb, t, count) {
    var FINE = 192;
    var TWO_PI = Math.PI * 2;
    var prev = csPoint(0, 1, sa, sb, t);
    var lens = [0], total = 0, i;
    for (i = 1; i <= FINE; i++) {
      var p = csPoint((i / FINE) * TWO_PI, 1, sa, sb, t);
      var dx = p[0] - prev[0], dy = p[1] - prev[1];
      total += Math.sqrt(dx * dx + dy * dy);
      lens.push(total);
      prev = p;
    }
    var out = new Array(count + 1);
    out[0] = 0; out[count] = TWO_PI;
    var j = 0;
    for (i = 1; i < count; i++) {
      var target = (i / count) * total;
      while (j < FINE - 1 && lens[j + 1] < target) j++;
      var span = (lens[j + 1] - lens[j]) || 1;
      out[i] = ((j + (target - lens[j]) / span) / FINE) * TWO_PI;
    }
    return out;
  }

  // ===========================================================================
  // Build one tube segment covering [startNode, startNode+1] using the curve.
  // ===========================================================================
  function buildSegment(curve, totalNodes, startNode) {
    var ringSeg = CONFIG.RING_SEGMENTS;
    var rings = CONFIG.RINGS_PER_NODE;
    var positions = [];
    var normals = [];
    var uvs = [];
    var indices = [];

    // Map node indices to global curve parameter u in [0,1].
    var uA = startNode / (totalNodes - 1);
    var uB = (startNode + 1) / (totalNodes - 1);

    var frames = [];
    for (var r = 0; r <= rings; r++) {
      var tt = r / rings;
      var u = uA + (uB - uA) * tt;
      u = Math.min(0.99999, Math.max(0.00001, u));
      var pos = curve.getPointAt(u);
      var tan = curve.getTangentAt(u).normalize();

      // Build a stable orthonormal frame (Frenet-ish) from tangent.
      var normal = new THREE.Vector3();
      normal.crossVectors(_up, tan);
      if (normal.lengthSq() < 1e-5) normal.set(1, 0, 0);
      normal.normalize();
      var binormal = new THREE.Vector3().crossVectors(tan, normal).normalize();

      // Interpolate radius across the two nodes; blend their cross-section shapes by tt.
      var metaA = pathMeta[startNode] || pathMeta[pathMeta.length - 1];
      var metaB = pathMeta[startNode + 1] || metaA;
      var radius = metaA.radius + (metaB.radius - metaA.radius) * tt;

      frames.push({ pos: pos, normal: normal, binormal: binormal,
                    radius: radius, sa: metaA.shape, sb: metaB.shape, st: tt, v: (startNode + tt) });
    }

    for (var ri = 0; ri <= rings; ri++) {
      var f = frames[ri];
      var thetas = arcThetas(f.sa, f.sb, f.st, ringSeg); // even arc-length spacing (see above)
      for (var s = 0; s <= ringSeg; s++) {
        var theta = thetas[s];
        var cs = csPoint(theta, f.radius, f.sa, f.sb, f.st);
        // World position = center + local x*normal + local y*binormal.
        var px = f.pos.x + cs[0] * f.normal.x + cs[1] * f.binormal.x;
        var py = f.pos.y + cs[0] * f.normal.y + cs[1] * f.binormal.y;
        var pz = f.pos.z + cs[0] * f.normal.z + cs[1] * f.binormal.z;
        positions.push(px, py, pz);

        // Inward normal so the inside of the tube is lit.
        var nx = -(cs[0] * f.normal.x + cs[1] * f.binormal.x);
        var ny = -(cs[0] * f.normal.y + cs[1] * f.binormal.y);
        var nz = -(cs[0] * f.normal.z + cs[1] * f.binormal.z);
        var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        normals.push(nx / nl, ny / nl, nz / nl);

        uvs.push((s / ringSeg) * CONFIG.GLYPH_REPEAT_U,
                 f.v * CONFIG.GLYPH_REPEAT_V);
      }
    }

    var perRing = ringSeg + 1;
    for (var rr = 0; rr < rings; rr++) {
      for (var ss = 0; ss < ringSeg; ss++) {
        var a = rr * perRing + ss;
        var b = a + perRing;
        var c = a + 1;
        var d = b + 1;
        // Wind so the INSIDE faces the camera.
        indices.push(a, c, b);
        indices.push(c, d, b);
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    var mesh = new THREE.Mesh(geo, glyphMaterial);
    mesh.frustumCulled = false;
    mesh.userData.startNode = startNode;
    return mesh;
  }

  // ===========================================================================
  // Streaming: keep segments [nodeCursor .. nodeCursor+SEGMENTS_AHEAD] alive.
  // ===========================================================================
  function refreshSegments() {
    var first = Math.max(0, nodeCursor - 1);
    var last = nodeCursor + CONFIG.SEGMENTS_AHEAD;
    ensurePathLength(last + 1);

    var totalNodes = pathPoints.length;
    var curve = makeCurve();

    // Which start-nodes should currently have geometry?
    var wanted = {};
    for (var n = first; n <= last; n++) wanted[n] = true;

    // Remove segments that are now behind us.
    for (var i = segments.length - 1; i >= 0; i--) {
      var seg = segments[i];
      if (!wanted[seg.startNode]) {
        segmentGroup.remove(seg.mesh);
        seg.mesh.geometry.dispose();
        segments.splice(i, 1);
      }
    }

    // Map existing.
    var have = {};
    for (var j = 0; j < segments.length; j++) have[segments[j].startNode] = true;

    // Add missing.
    for (var k = first; k <= last; k++) {
      if (!have[k] && k < totalNodes - 1) {
        var mesh = buildSegment(curve, totalNodes, k);
        segmentGroup.add(mesh);
        segments.push({ mesh: mesh, startNode: k });
      }
    }
  }

  // ===========================================================================
  // Data pulses — small bright billboards that crawl forward along the wall.
  // ===========================================================================
  function buildPulses() {
    var geo = new THREE.PlaneGeometry(1.4, 3.2);
    var mat = new THREE.MeshBasicMaterial({
      color: CONFIG.GREEN_BRIGHT,
      transparent: true,
      opacity: CONFIG.PULSE_OPACITY,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    for (var i = 0; i < CONFIG.PULSE_COUNT; i++) {
      var m = new THREE.Mesh(geo, mat);
      m.userData.u = Math.random();         // 0..1 along its local window
      m.userData.angle = Math.random() * Math.PI * 2;
      m.userData.offset = Math.random() * 50; // distance offset ahead
      m.frustumCulled = false;
      scene.add(m);
      pulseMeshes.push(m);
    }
  }

  function updatePulses(curve, totalNodes, camU) {
    for (var i = 0; i < pulseMeshes.length; i++) {
      var p = pulseMeshes[i];
      // Advance along the path, wrapping within a window ahead of the camera.
      p.userData.offset -= CONFIG.PULSE_SPEED * (1 / 60);
      if (p.userData.offset < 0) {
        p.userData.offset = 40 + Math.random() * 40;
        p.userData.angle = Math.random() * Math.PI * 2;
      }
      var aheadDist = 6 + p.userData.offset;
      var du = aheadDist / (CONFIG.NODE_SPACING * (totalNodes - 1));
      var u = Math.min(0.999, camU + du);
      var pos = curve.getPointAt(u);
      var tan = curve.getTangentAt(u).normalize();
      var normal = new THREE.Vector3().crossVectors(_up, tan);
      if (normal.lengthSq() < 1e-5) normal.set(1, 0, 0);
      normal.normalize();
      var binormal = new THREE.Vector3().crossVectors(tan, normal).normalize();

      var meta = pathMeta[Math.min(pathMeta.length - 1,
        Math.floor(u * (totalNodes - 1)))] || { radius: CONFIG.BASE_RADIUS };
      var rad = meta.radius * 0.92;
      var th = p.userData.angle;
      var ox = Math.cos(th) * rad;
      var oy = Math.sin(th) * rad;
      p.position.set(
        pos.x + ox * normal.x + oy * binormal.x,
        pos.y + ox * normal.y + oy * binormal.y,
        pos.z + ox * normal.z + oy * binormal.z
      );
      p.lookAt(pos.x, pos.y, pos.z); // face the tube center
    }
  }

  // ===========================================================================
  // Animation loop.
  // ===========================================================================
  function animate() {
    animId = requestAnimationFrame(animate);
    var dt = Math.min(0.05, clock.getDelta());

    if (_driveActive) {
      // Scroll-coupled: sprint while scrolling, near-still drift when parked.
      // Idle floor 0.06 keeps the tunnel alive; drive*1.3 is the sprint.
      distanceTraveled += CONFIG.SPEED * dt * (0.06 + _drive * 1.3);
      // Dolly by the CHANGE in scroll depth (delta form; the naive form runs away).
      distanceTraveled += (_pushIn - _lastPushIn) * CONFIG.NODE_SPACING * 1.2;
      _lastPushIn = _pushIn;
    } else {
      // Default (API never called / reduced-motion never drives): original constant flythrough.
      distanceTraveled += CONFIG.SPEED * dt;
    }

    // Determine the node we're at based on arclength (NODE_SPACING per node).
    nodeCursor = Math.floor(distanceTraveled / CONFIG.NODE_SPACING);
    ensurePathLength(nodeCursor + CONFIG.SEGMENTS_AHEAD + 2);
    refreshSegments();

    var totalNodes = pathPoints.length;
    var curve = makeCurve();

    // Camera parameter along the curve.
    var camU = (distanceTraveled / CONFIG.NODE_SPACING) / (totalNodes - 1);
    camU = Math.min(0.999, Math.max(0.0001, camU));
    var camPos = curve.getPointAt(camU);
    var lookU = Math.min(0.9995, camU + 0.011);
    var lookPos = curve.getPointAt(lookU);

    camera.position.copy(camPos);
    // Bank/roll the camera into turns so the near walls (around + in front of Melric) visibly swing,
    // instead of the bend only appearing far down the tunnel behind the orb.
    var _tanNow = curve.getTangentAt(camU).normalize();
    var _tanB = curve.getTangentAt(Math.min(0.999, camU + 0.02)).normalize();
    var _turnSign = _tanNow.x * _tanB.z - _tanNow.z * _tanB.x;
    var _roll = Math.max(-0.5, Math.min(0.5, _turnSign * CONFIG.BANK_STRENGTH));
    _curRoll += (_roll - _curRoll) * 0.08;
    camera.up.copy(new THREE.Vector3(0, 1, 0).applyAxisAngle(_tanNow, _curRoll));
    camera.lookAt(lookPos);

    updatePulses(curve, totalNodes, camU);

    // Trim old path points occasionally to keep the curve bounded.
    if (nodeCursor > 60) {
      var trim = nodeCursor - 30;
      if (trim > 0) {
        pathPoints.splice(0, trim);
        pathMeta.splice(0, trim);
        // Reindex bookkeeping after trimming nodes off the front.
        distanceTraveled -= trim * CONFIG.NODE_SPACING;
        nodeCursor -= trim;
        for (var s = 0; s < segments.length; s++) {
          segments[s].startNode -= trim;
        }
      }
    }

    // Pulse the corridor light in sync with Melric's 3.6s breath — Melric is the main light;
    // swell to near-full at the breath peak, ease down a touch slower than the rise (pow<1).
    var _bt = (clock.elapsedTime % CONFIG.BREATH_PERIOD) / CONFIG.BREATH_PERIOD;
    var _breath = Math.pow(0.5 - 0.5 * Math.cos(_bt * Math.PI * 2), 0.8);
    // Breath light back to ORIGINAL values (Eric reverted the +30% global surge — it brightened
    // the whole scene; the wanted effect is ONLY the localized node-charge below). 0.8..1.0.
    // v6: when the scroll-coupled dolly is armed, calm the global base light to ~0.62x so the
    // plane-local pools (orb breath, node breaths/blooms) read as pools instead of washing out.
    // Reduced-motion never arms the drive, so its base brightness is unchanged.
    var _baseMul = _driveActive ? 0.62 : 1.0;
    if (camLight) camLight.intensity = CONFIG.NEAR_BRIGHTNESS * _baseMul * (0.8 + 0.6 * _breath);
    // MELRIC'S BREATH CHARGES THE GLYPHS ON ITS OWN PLANE (Eric: real physics — a light source
    // in a tunnel lights the wall RING around itself, never tunnel "in the future"). Range is
    // capped just past the wall ring (BASE_RADIUS 12 → range 17.5): geometry one node deeper
    // (~27 units away) is mathematically beyond reach. Inverse-square-ish decay 2, tangent-
    // smooth at zero — the deep dark atmosphere cannot change.
    if (!breathLight) {
      breathLight = new THREE.PointLight(CONFIG.GREEN, 0, 17.5, 2.0);
      breathLight.position.set(0, 0, -9); // sits at Melric's spot in the scene
      camera.add(breathLight);
    }
    breathLight.intensity = CONFIG.NEAR_BRIGHTNESS * 5.5 * _breath; // ≈ +30% on Melric's wall ring at peak (×3.1 compensates the tight-range falloff)
    if (glyphMaterial) glyphMaterial.emissiveIntensity = CONFIG.EMISSIVE_INTENSITY + CONFIG.EMISSIVE_BREATH * _breath;
    // Node-flash bounce light: the glyphs "gain power" from the node and it slowly WEARS OFF
    // (Eric) — gentle exponential drain, ~3s back to dark. The UI flare cools faster; the wall
    // charge lingers behind it like an afterglow.
    if (flashLight && flashLight.intensity > 0.02) flashLight.intensity *= Math.exp(-dt * 1.15);
    renderer.render(scene, camera);
  }

  // ===========================================================================
  // Resize handling.
  // ===========================================================================
  function onResize() {
    if (!canvasEl) return;
    var w = canvasEl.clientWidth || window.innerWidth;
    var h = canvasEl.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
                                    CONFIG.PIXEL_RATIO_CAP));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ===========================================================================
  // Node-flash bounce light (Eric 2026-06-10): when a UI node flares, bounce REAL light off the
  // nearby tunnel walls — the lit glyphs around that node lift ~30%, then cool with the flare.
  // One pooled PointLight parented to the camera, aimed toward the node's screen position a few
  // units into the scene. Darks stay dark (fog owns the deep falloff, same as the breath light).
  // ===========================================================================
  var flashLight = null;
  var breathLight = null; // short-range orb light — breath charges only the NEARBY glyph ring
  window.corridorNodeFlash = function (nx, ny, strength) {
    if (!camera) return;
    if (!flashLight) {
      // SAME PHYSICS as the breath light (Eric): tight range — a node's flash lights the wall
      // patch around the node's own plane, never the deeper tunnel. decay 2 = inverse-square feel.
      flashLight = new THREE.PointLight(CONFIG.GREEN, 0, 20, 2.0);
      camera.add(flashLight);
    }
    var cx = Math.min(1, Math.max(0, nx || 0.5)) * 2 - 1;   // -1..1 across the window
    var cy = Math.min(1, Math.max(0, ny || 0.5)) * 2 - 1;
    var spread = 4.2;                                        // lateral reach toward the walls
    flashLight.position.set(cx * spread * (camera.aspect || 1.6), -cy * spread, -9);
    // charge ACCUMULATES (never cuts a fading charge down) — repeated signals keep the walls fed
    flashLight.intensity = Math.max(flashLight.intensity || 0,
      CONFIG.NEAR_BRIGHTNESS * 3.0 * (strength || 1)); // ≈ +30% on the node's wall patch (×1.5 compensates the tight range)
  };

  // ===========================================================================
  // Scroll-coupled dolly setter (v6, additive). site.js calls this each frame
  // with drive = |spring velocity| (0..1) and pushIn = storyboard depth (0..1).
  // The first call arms _driveActive so the delta-dolly takes over from the
  // constant flythrough. Reduced-motion never calls it -> constant idle stays.
  // ===========================================================================
  window.corridorSetDrive = function (drive, pushIn) {
    // board fix D1: on arming, seed BOTH sides of the delta so the first armed
    // animate frame can never consume a 0 -> depth step (scroll-restore lurch).
    if (!_driveActive) { _driveActive = true; _lastPushIn = _pushIn = (pushIn || 0); }
    _drive = drive < 0 ? 0 : (drive > 1 ? 1 : drive);
    _pushIn = pushIn || 0;
  };

  // ===========================================================================
  // Plane-local node breath lights (v6, Eric law 10): a small pool of range-
  // limited PointLights parented to the camera, one per ring node, that light
  // ONLY the near tunnel wall on their own z-plane. Driven by each node's soft
  // breath + arrival bloom (site.js passes screen-space anchors + breath level).
  // Same physics as the orb breath + flash lights: tight range, decay 2, so the
  // deep tunnel behind them never lifts. Cheap: the pool is created once.
  // ===========================================================================
  var REDUCED_C = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var nodeBreathLights = [];
  window.corridorSetNodeLight = function (idx, nx, ny, level) {
    if (!camera || REDUCED_C) return;
    var pl = nodeBreathLights[idx];
    if (!pl) {
      // range 11 (per spec): reaches the near wall ring on this plane only.
      pl = new THREE.PointLight(CONFIG.GREEN, 0, 11.0, 2.0);
      camera.add(pl);
      nodeBreathLights[idx] = pl;
    }
    if (level <= 0.001) { pl.intensity = 0; return; }
    // map screen 0..1 -> camera-space lateral offset, same mapping as the flash light
    var cx = (nx < 0 ? 0 : (nx > 1 ? 1 : nx)) * 2 - 1;
    var cy = (ny < 0 ? 0 : (ny > 1 ? 1 : ny)) * 2 - 1;
    var spread = 4.2;
    pl.position.set(cx * spread * (camera.aspect || 1.6), -cy * spread, -9);
    pl.intensity = CONFIG.NEAR_BRIGHTNESS * 1.6 * level; // soft, below the orb pool
  };

  // ===========================================================================
  // Public entry point.
  // ===========================================================================
  window.startCorridor3D = function (canvasId) {
    canvasEl = document.getElementById(canvasId);
    if (!canvasEl) {
      console.error('startCorridor3D: canvas #' + canvasId + ' not found');
      return;
    }
    if (typeof THREE === 'undefined') {
      console.error('startCorridor3D: THREE (Three.js r128) is not loaded');
      return;
    }

    var w = canvasEl.clientWidth || window.innerWidth;
    var h = canvasEl.clientHeight || window.innerHeight;

    renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
                                    CONFIG.PIXEL_RATIO_CAP));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, CONFIG.BACKGROUND_ALPHA);

    scene = new THREE.Scene();
    // Fog fades far walls to near-black so distant geometry stays dim.
    scene.fog = new THREE.FogExp2(0x000000, CONFIG.FOG_DENSITY);

    camera = new THREE.PerspectiveCamera(72, w / h, 0.1, 600);

    clock = new THREE.Clock();

    // Glyph material — emissive green map, lit subtly by camera-following light.
    glyphTexture = buildGlyphTexture();
    glyphMaterial = new THREE.MeshStandardMaterial({
      map: glyphTexture,
      emissive: new THREE.Color(CONFIG.GREEN),
      emissiveMap: glyphTexture,
      emissiveIntensity: CONFIG.EMISSIVE_INTENSITY,
      color: new THREE.Color(0x0a140d),
      roughness: 0.85,
      metalness: 0.1,
      transparent: true,
      opacity: CONFIG.WALL_OPACITY,
      side: THREE.BackSide,    // we see the inside of the tube
      fog: true,
      // DITHERING (fix 2026-06-10): the smooth light/fog falloff crosses discrete 8-bit color
      // steps in the near-black range; the last step before black reads as a HARD cross-section-
      // shaped contour near the window edges ("light falloff that just stops" — Eric). Shader
      // dithering scatters those quantization boundaries into invisible noise. Zero look change.
      dithering: true
    });

    // A soft point light riding with the camera = nearer walls brighter.
    // The VISIBLE fade is done ENTIRELY by exponential fog (smooth, no cutoff). The light
    // uses a far cutoff (200) sitting deep in the already-black zone + a very gentle decay
    // (1.0), so it only adds a soft near-brightness gradient and NEVER produces a hard
    // distance-cutoff edge in the visible range. That cutoff edge — at a constant tube
    // depth — is exactly what read as a cross-section-shaped hard line sweeping the tunnel.
    camLight = new THREE.PointLight(CONFIG.GREEN, CONFIG.NEAR_BRIGHTNESS,
                                        200, 2.0);
    camera.add(camLight);
    var ambient = new THREE.AmbientLight(CONFIG.GREEN, CONFIG.FAR_DIM);
    scene.add(ambient);
    scene.add(camera);

    segmentGroup = new THREE.Group();
    scene.add(segmentGroup);

    // Seed the path so we always have geometry from the very first frame.
    dir.set(0, 0, -1);
    pathPoints.length = 0;
    pathMeta.length = 0;
    pathPoints.push(new THREE.Vector3(0, 0, 0));
    pathMeta.push({ radius: CONFIG.BASE_RADIUS, shape: { sides: 9, round: 1.0 } });
    ensurePathLength(CONFIG.SEGMENTS_AHEAD + 4);
    refreshSegments();

    buildPulses();

    window.addEventListener('resize', onResize);
    onResize();

    if (animId !== null) cancelAnimationFrame(animId);
    clock.start();
    animate();
  };
})();

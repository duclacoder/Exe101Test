// LabComponent.js
// Usage: import LabComponent from './LabComponent.js';
// const comp = new LabComponent(containerElement, options);
// comp.start(); // to start animation loop (it auto-starts in constructor)
// comp.stop();  // to stop animation loop
// comp.destroy(); // to cleanup

import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { RGBELoader } from 'jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'jsm/postprocessing/UnrealBloomPass.js';
import { CSS2DObject, CSS2DRenderer } from 'jsm/renderers/CSS2DRenderer.js';
import * as THREE from "three";
import { getParticleSystem } from "../../features/particle-system/getParticleSystem.js";

export default class LabComponent {
  constructor(container, options = {}) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('LabComponent requires a DOM container element.');
    }
    this.container = container;
    this.opts = options;

    // DOM element selectors (look inside container)
    this.sel = Object.assign({
      infoPanel: '#info-panel',
      btnStartReaction: '#btn-start-reaction',
      btnRunMolecularAnimation: '#btn-run-molecular-animation',
      molecularModalOverlay: '#molecular-modal-overlay',
      molecularCanvas: '#molecular-canvas',
      molecularLabelRenderer: '#molecular-label-renderer',
      molecularCardClose: '#molecular-card-close',
      btnViewAtoms: '#btn-view-atoms',
      atomModalOverlay: '#atom-modal-overlay',
      atomCardClose: '#atom-card-close',
      atomModel: '#atom-model',
      atomName: '#atom-name',
      atomDescription: '#atom-description',
      toggleRotation: '#toggle-rotation',
      atomBtns: '.atom-btn',
      atomCard: '#atom-card'
    }, options.selectors || {});

    // Bind methods
    this._onResize = this._onResize.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._animate = this._animate.bind(this);
    this._animateMolecularScene = this._animateMolecularScene.bind(this);

    // lifecycle flags
    this._running = false;
    this._runningMol = false;

    // initialize internals
    this._initScene();
    this._initUI();
    this.start(); // auto-start
  }

  // ---------- Shaders (kept as in original) ----------
  static waterVertexShader = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= taylorInvSqrt(a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    uniform float u_time;
    uniform vec2 u_wave_origin; 
    uniform vec2 u_sphere_velocity;
    uniform float u_wave_decay; 

    varying vec3 v_worldPosition;
    varying vec3 v_normal; 

    vec2 getWave(vec2 pos, float time) {
      float baseWave = snoise(pos * 1.5 + time * 0.8) * 0.04; 
      float dist = distance(pos, u_wave_origin);
      float velocity = length(u_sphere_velocity);
      float waveStrength = (1.0 / (1.0 + dist * 2.5)) * velocity * 0.8 * u_wave_decay; 
      float reactionWave1 = sin(dist * 10.0 - time * 12.0) * 0.20 * waveStrength;
      float reactionWave2 = sin(dist * 18.0 - time * 16.0) * 0.15 * waveStrength;
      float reactionWave3 = cos(dist * 25.0 + time * 14.0) * 0.10 * waveStrength;
      float boilingWave = snoise(pos * 10.0 + time * 4.0) * 0.08 * waveStrength;
      float impactWave = sin(dist * 6.0 - time * 10.0) * 0.12 * waveStrength;
      float totalWave = baseWave + reactionWave1 + reactionWave2 + reactionWave3 + boilingWave + impactWave;
      return vec2(totalWave, velocity);
    }

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      float time = u_time;
      float waveY = 0.0;
      if (worldPos.y > -1.7) {
        waveY = getWave(worldPos.xz, time).x;
      }
      worldPos.y += waveY;
      float epsilon = 0.01;
      float waveYA = 0.0;
      float waveZB = 0.0;
      if (worldPos.y > -1.7) {
        waveYA = getWave(worldPos.xz + vec2(epsilon, 0.0), time).x;
        waveZB = getWave(worldPos.xz + vec2(0.0, epsilon), time).x;
      }
      vec3 tangent = normalize(vec3(epsilon, waveYA - waveY, 0.0));
      vec3 bitangent = normalize(vec3(0.0, waveZB - waveY, epsilon));
      vec3 perturbedNormal = cross(bitangent, tangent);
      v_normal = (modelMatrix * vec4(perturbedNormal, 0.0)).xyz;
      v_worldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  static waterFragmentShader = `
    uniform vec3 u_color;
    uniform float u_opacity;
    uniform sampler2D envMap; 
    uniform float u_envMapLoaded; 
    varying vec3 v_worldPosition;
    varying vec3 v_normal; 
    const float PI = 3.141592653589793;
    vec2 sampleEquirect(vec3 v) {
      vec2 uv;
      uv.x = atan(v.z, v.x) / (2.0 * PI) + 0.5;
      uv.y = asin(v.y) / PI + 0.5;
      return uv;
    }
    void main() {
      vec3 color = u_color;
      if (u_envMapLoaded > 0.5) {
        vec3 viewDir = normalize(cameraPosition - v_worldPosition);
        vec3 normal = normalize(v_normal); 
        vec3 reflectDir = reflect(-viewDir, normal);
        vec2 uv = sampleEquirect(reflectDir);
        vec4 envColor = texture2D(envMap, uv);
        color = mix(u_color, envColor.rgb, 0.08); 
      }
      gl_FragColor = vec4(color, u_opacity);
    }
  `;

  static sodiumVertexShader = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= taylorInvSqrt(a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    uniform float u_time;
    uniform float u_progress;
    varying vec3 v_normal;
    void main() {
      v_normal = normal;
      float time = u_time * 0.5;
      float displacement = 0.0;
      if (u_progress > 0.0) {
        displacement = snoise(position.xy * 3.0 + time) * 0.1 + snoise(position.yz * 2.0 + time) * 0.1;
        displacement += snoise(position.xy * 10.0 + time * 5.0) * (u_progress * u_progress * 0.2);
      }
      vec3 newPosition = position + normal * displacement * (1.0 - u_progress);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  static sodiumFragmentShader = `
    varying vec3 v_normal;
    uniform float u_progress;
    void main() {
      vec3 baseColor = vec3(0.8, 0.8, 0.85);
      vec3 hotColor = vec3(0.9, 0.6, 0.4);
      vec3 color = mix(baseColor, hotColor, u_progress * u_progress * 0.8);
      float light = dot(normalize(v_normal), vec3(0.5, 0.5, 1.0));
      light = clamp(light, 0.3, 1.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ---------- Initialization ----------
  _initScene() {
    // sizes
    this.w = this.container.clientWidth || window.innerWidth;
    this.h = this.container.clientHeight || window.innerHeight;

    // basic scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(75, this.w / this.h, 0.1, 1000);
    this.camera.position.set(0, 5, 25);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.w, this.h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // append renderer to container
    this.container.appendChild(this.renderer.domElement);

    // composer & passes
    this.renderScene = new RenderPass(this.scene, this.camera);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderScene);
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.w, this.h), 1.5, 0.4, 0.85);
    this.bloomPass.threshold = 2.0;
    this.bloomPass.strength = 0.25;
    this.bloomPass.radius = 0.2;
    this.composer.addPass(this.bloomPass);

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.camera.position.set(0, 3, 10);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.03;
    this.controls.maxPolarAngle = Math.PI * 0.85;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;

    // clock
    this.clock = new THREE.Clock();

    // variables that mirror original code (kept names for clarity)
    this.TABLE_TOP_Y_LEVEL = -12.0;
    this.CLAMP_Y_LEVEL = 1.8;

    // create lab table and clamp
    this.scene.add(this._createLabTable(this.TABLE_TOP_Y_LEVEL));
    const clampStand = this._createClampStand(this.CLAMP_Y_LEVEL, this.TABLE_TOP_Y_LEVEL);
    clampStand.position.set(-8.7, 0, 4.365);
    this.scene.add(clampStand);

    // tube / testTube / water / sodium
    this._setupTubeAndContents();

    // lights
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.08);
    this.scene.add(this.ambientLight);

    // attach listeners
    window.addEventListener('resize', this._onResize, false);
    window.addEventListener('mousemove', this._onMouseMove, false);
    window.addEventListener('click', this._onClick, false);

    // particle systems and other sets are created in _setupTubeAndContents()
  }

  _initUI() {
    this.infoPanel = this.container.querySelector(this.sel.infoPanel) || null;
    // find buttons in container
    this.btnStartReaction = this.container.querySelector(this.sel.btnStartReaction) || null;
    this.btnMolAnim = this.container.querySelector(this.sel.btnRunMolecularAnimation) || null;
    this.modalOverlay = this.container.querySelector(this.sel.molecularModalOverlay) || null;
    this.btnMolClose = this.container.querySelector(this.sel.molecularCardClose) || null;
    this.molCanvas = this.container.querySelector(this.sel.molecularCanvas) || null;
    this.molLabelDiv = this.container.querySelector(this.sel.molecularLabelRenderer) || null;

    // atom modal elements
    this.btnViewAtoms = this.container.querySelector(this.sel.btnViewAtoms) || null;
    this.atomModalOverlay = this.container.querySelector(this.sel.atomModalOverlay) || null;
    this.btnAtomClose = this.container.querySelector(this.sel.atomCardClose) || null;
    this.atomViewer = this.container.querySelector(this.sel.atomModel) || null;
    this.atomName = this.container.querySelector(this.sel.atomName) || null;
    this.atomDescription = this.container.querySelector(this.sel.atomDescription) || null;
    this.toggleRotationBtn = this.container.querySelector(this.sel.toggleRotation) || null;
    this.atomBtns = Array.from(this.container.querySelectorAll(this.sel.atomBtns || '') || []);

    // hook up listeners for provided controls (safe guards)
    if (this.btnStartReaction) {
      this.btnStartReaction.addEventListener('click', () => this._onStartReactionClicked());
    }

    if (this.btnMolAnim && this.modalOverlay && this.btnMolClose) {
      this.btnMolAnim.addEventListener('click', () => {
        this.modalOverlay.style.display = 'flex';
        if (!this.renderer_mol) {
          try { this._initMolecularScene(); } catch (err) {
            console.error("Cannot init molecular scene:", err);
            this.modalOverlay.innerHTML = `<p style="color:white;padding:20px;">WebGL init error. Reload page.</p>`;
            return;
          }
        } else {
          if (!this._runningMol) this._animateMolecularScene();
        }
        this._startMolecularAnimation();
        try { if (this.clock && typeof this.clock.stop === 'function') this.clock.stop(); } catch (e) {}
      });

      this.btnMolClose.addEventListener('click', () => {
        if (this.modalOverlay) this.modalOverlay.style.display = 'none';
        if (this._runningMol) {
          cancelAnimationFrame(this._molReqId);
          this._molReqId = null;
          this._runningMol = false;
        }
        try { if (this.clock && typeof this.clock.start === 'function') this.clock.start(); } catch (e) {}
      });
    } else {
      // it's okay if the host page doesn't provide these controls
    }

    // Atom modal controls
    if (this.btnViewAtoms && this.atomModalOverlay && this.btnAtomClose) {
      this.btnViewAtoms.addEventListener('click', () => {
        this.atomModalOverlay.style.display = 'flex';
        if (!this._atomSelectorInitialized) {
          this._initAtomSelector();
          this._atomSelectorInitialized = true;
          // auto-click first active
          const first = this.atomBtns.find(b => b.classList.contains('active'));
          if (first) first.click();
        }
        try { if (this.clock && typeof this.clock.stop === 'function') this.clock.stop(); } catch (e) {}
      });
      this.btnAtomClose.addEventListener('click', () => {
        this.atomModalOverlay.style.display = 'none';
        try { if (this.clock && typeof this.clock.start === 'function') this.clock.start(); } catch (e) {}
      });
      if (this.atomModalOverlay) {
        this.atomModalOverlay.addEventListener('click', (e) => {
          if (e.target === this.atomModalOverlay) {
            this.btnAtomClose.click();
          }
        });
      }
      if (this.toggleRotationBtn) {
        let isRotating = true;
        this.toggleRotationBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this.atomViewer) return;
          if (isRotating) {
            this.atomViewer.removeAttribute('auto-rotate');
            this.toggleRotationBtn.innerHTML = '▶️ Tiếp tục xoay';
            this.toggleRotationBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          } else {
            this.atomViewer.setAttribute('auto-rotate', '');
            this.atomViewer.setAttribute('auto-rotate-delay', '0');
            this.toggleRotationBtn.innerHTML = '⏸️ Tạm dừng xoay';
            this.toggleRotationBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
          }
          isRotating = !isRotating;
        });
      }
    }
  }

  // ---------- Tube / Test Tube / Water / Sodium setup ----------
  _setupTubeAndContents() {
    // Shared sizes
    const tubeRadius = 0.6;
    const tubeBodyHeight = 6.0;
    const tubeHeight = tubeBodyHeight + tubeRadius * 2;
    const lipThickness = 0.04;
    const waterLevelY = -1.5;
    this._actualWaterLevelInWorld = waterLevelY;

    // Physics / state vars
    this.REACTION_DURATION = 15.0;
    this.reactionTimer = 0.0;
    this.waveDecayFactor = 1.0;
    this.fallingVelocity = 0.0;
    this.GRAVITY = 9.8;
    this.waterImpactForce = 0.0;

    // environment map
    this.rgbeLoader = new RGBELoader();
    this.rgbeLoader.load('https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;
      if (this.waterMaterial && this.waterMaterial.uniforms) {
        this.waterMaterial.uniforms.envMap.value = texture;
        this.waterMaterial.uniforms.u_envMapLoaded.value = 1.0;
      }
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.1,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      envMapIntensity: 1.0,
      depthWrite: false
    });

    // group for test tube
    this.testTubeGroup = new THREE.Group();
    this.scene.add(this.testTubeGroup);

    // raycaster & mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isHovering = false;
    this.infoPanelVisible = false;

    const setupTubeMesh = (geom, material) => {
      const mesh = new THREE.Mesh(geom, material);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      return mesh;
    };

    // lathe profile for the test tube
    const points = [];
    const bottomSegments = 16;
    for (let i = 0; i <= bottomSegments; i++) {
      const angle_rad = -(Math.PI / 2) + (Math.PI / 2) * (i / bottomSegments);
      points.push(
        new THREE.Vector2(
          Math.cos(angle_rad) * tubeRadius,
          tubeRadius + (Math.sin(angle_rad) * tubeRadius)
        )
      );
    }
    points.push(new THREE.Vector2(tubeRadius, tubeRadius + tubeBodyHeight));
    const tubeGeom = new THREE.LatheGeometry(points, 32);
    this.tubeMesh = setupTubeMesh(tubeGeom, glassMaterial);
    this.testTubeGroup.add(this.tubeMesh);

    const lipGeom = new THREE.TorusGeometry(tubeRadius, lipThickness, 16, 100);
    this.lipMesh = setupTubeMesh(lipGeom, glassMaterial);
    this.lipMesh.position.y = tubeBodyHeight + tubeRadius;
    this.lipMesh.rotation.x = Math.PI / 2;
    this.testTubeGroup.add(this.lipMesh);

    const newBottomY = -(tubeBodyHeight / 2) - tubeRadius + 0.5;
    this.testTubeGroup.position.y = newBottomY;

    const waterTopY = waterLevelY;
    const waterBottomY = this.testTubeGroup.position.y;

    // water material shader
    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: LabComponent.waterVertexShader,
      fragmentShader: LabComponent.waterFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        u_time: { value: 0.0 },
        u_wave_origin: { value: new THREE.Vector2(0.0, 0.0) },
        u_sphere_velocity: { value: new THREE.Vector2(0.0, 0.0) },
        u_wave_decay: { value: 1.0 },
        u_color: { value: new THREE.Color(0x99ccff) },
        u_opacity: { value: 0.45 },
        envMap: { value: null },
        u_envMapLoaded: { value: 0.0 }
      }
    });

    const waterRadius = tubeRadius * 0.98;
    const waterHeightInTube = waterTopY - (waterBottomY + tubeRadius);

    const waterBottomGeomSimple = new THREE.SphereGeometry(waterRadius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const waterBottomMesh = setupTubeMesh(waterBottomGeomSimple, this.waterMaterial);
    waterBottomMesh.position.y = tubeRadius;
    this.testTubeGroup.add(waterBottomMesh);

    if (waterHeightInTube > 0) {
      const waterBodyHeight = waterHeightInTube;
      const waterBodyGeom = new THREE.CylinderGeometry(waterRadius, waterRadius, waterBodyHeight, 32, 1);
      const waterBodyMesh = setupTubeMesh(waterBodyGeom, this.waterMaterial);
      waterBodyMesh.position.y = tubeRadius + (waterBodyHeight / 2);
      this.testTubeGroup.add(waterBodyMesh);
    }

    // sodium sphere
    const sodiumSize = 0.2;
    this.sodiumSize = sodiumSize;
    const sodiumGeometry = new THREE.IcosahedronGeometry(sodiumSize, 1);
    const sodiumMaterial = new THREE.ShaderMaterial({
      vertexShader: LabComponent.sodiumVertexShader,
      fragmentShader: LabComponent.sodiumFragmentShader,
      uniforms: {
        u_time: { value: 0.0 },
        u_progress: { value: 0.0 }
      }
    });
    this.sodiumMaterial = sodiumMaterial;
    this.sodiumSphere = new THREE.Mesh(sodiumGeometry, sodiumMaterial);
    this.sodiumSphere.position.y = 3.5;
    this.sodiumSphere.castShadow = true;
    this.scene.add(this.sodiumSphere);

    // fire light attached to sodium
    this.fireLight = new THREE.PointLight(0xff99dd, 0.0, 20, 1.2);
    this.fireLight.castShadow = true;
    this.fireLight.shadow.mapSize.width = 1024;
    this.fireLight.shadow.mapSize.height = 1024;
    this.sodiumSphere.add(this.fireLight);

    // movement radii and particle clip box
    const actualWaterLevelInWorld = this._actualWaterLevelInWorld;
    const tubeInnerRadius = tubeRadius * 0.95;
    const steamMaxSize = 0.3;
    const steamMaxSpline = 2.0;
    const fireMaxSize = 1.0;
    const fireMaxSpline = 1.5;
    const bubbleMaxSize = 0.6;
    const boilingMaxSize = 0.4;
    const h2FlameMaxSize = 1.0;
    const largestParticleSize = Math.max(
      steamMaxSize * steamMaxSpline,
      fireMaxSize * fireMaxSpline,
      bubbleMaxSize,
      boilingMaxSize,
      h2FlameMaxSize
    );
    const maxParticleRadius = largestParticleSize / 2.0;

    const particleClipRadius = tubeInnerRadius * 0.55;
    this.sodiumMoveRadius = tubeInnerRadius - (sodiumSize * 1.0);

    const minX = -particleClipRadius;
    const maxX = particleClipRadius;
    const minZ = -particleClipRadius;
    const maxZ = particleClipRadius;

    // create particle systems via getParticleSystem (assumed available)
    this.fireEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.sodiumSphere,
      parent: this.scene,
      rate: 150.0,
      texture: '../../../public/textures/fire.png',
      active: false,
      clippingPlaneY: actualWaterLevelInWorld,
      clipBox: new THREE.Vector4(minX, maxZ, minZ, maxX),
      radius: sodiumSize * 0.8,
      velocity: new THREE.Vector3(0, 0.5, 0),
      velocityRandomness: 0.3,
      maxLife: 0.8,
      maxSize: 1.5,
      sizeSplinePoints: [
        [0.0, 0.0],
        [0.3, 0.5],
        [1.0, 0.0]
      ],
      alphaSplinePoints: [
        [0.0, 0.0],
        [0.2, 0.6],
        [0.7, 0.3],
        [1.0, 0.0]
      ],
      colorSplinePoints: [
        [0.0, new THREE.Color(0xFFFFFF)],
        [0.2, new THREE.Color(0xFFDDFF)],
        [0.5, new THREE.Color(0xFF99DD)],
        [0.8, new THREE.Color(0xDD77CC)],
        [1.0, new THREE.Color(0xBB55AA)]
      ],
    });

    this.steamEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.sodiumSphere,
      parent: this.scene,
      rate: 2800.0,
      texture: '../../../public/textures/smoke.png',
      active: false,
      clippingPlaneY: actualWaterLevelInWorld - 0.01,
      clipBox: new THREE.Vector4(minX, maxZ, minZ, maxX),
      blending: THREE.NormalBlending,
      depthTest: true,
      depthWrite: false,
      velocity: new THREE.Vector3(0, 0.6, 0),
      velocityRandomness: 0.3,
      colorSplinePoints: [
        [0.0, new THREE.Color(0xFFFFFF)],
        [0.4, new THREE.Color(0xF5F5F5)],
        [0.7, new THREE.Color(0xE0E0E0)],
        [1.0, new THREE.Color(0xCCCCCC)]
      ],
      alphaSplinePoints: [
        [0.0, 0.0],
        [0.1, 0.18],
        [0.5, 0.15],
        [0.8, 0.10],
        [1.0, 0.0]
      ],
      sizeSplinePoints: [
        [0.0, 0.4],
        [0.5, 1.2],
        [1.0, steamMaxSpline * 1.3]
      ],
      maxLife: 7.0,
      maxSize: steamMaxSize * 1.1,
      radius: sodiumSize * 0.8,
      rotationRate: Math.random() * 0.02 - 0.01
    });

    this.bubbleEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.sodiumSphere,
      parent: this.scene,
      rate: 3500.0,
      texture: '../../../public/textures/rad-grad.png',
      active: false,
      clippingPlaneY: actualWaterLevelInWorld - 0.05,
      clipBox: new THREE.Vector4(minX, maxZ, minZ, maxX),
      blending: THREE.NormalBlending,
      depthTest: true,
      velocityType: 'radial',
      radialSpeed: 0.8,
      spawnRadiusY: 0.0,
      radius: sodiumSize * 2.0,
      colorSplinePoints: [
        [0.0, new THREE.Color(0xFFFFFF)],
        [1.0, new THREE.Color(0xEEEEFF)]
      ],
      alphaSplinePoints: [
        [0.0, 0.0],
        [0.1, 1.0],
        [0.7, 0.6],
        [1.0, 0.0]
      ],
      sizeSplinePoints: [
        [0.0, 0.03],
        [0.5, 0.12],
        [1.0, 0.18]
      ],
      maxLife: 0.8,
      maxSize: 0.6,
      rotationRate: 0.0
    });

    this.boilingBubblesEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.sodiumSphere,
      parent: this.scene,
      rate: 1500.0,
      texture: '../../../public/textures/bubble.png',
      active: false,
      clippingPlaneY: actualWaterLevelInWorld - 0.2,
      clipBox: new THREE.Vector4(minX, maxZ, minZ, maxX),
      blending: THREE.NormalBlending,
      depthTest: true,
      depthWrite: false,
      velocityType: 'radial',
      radialSpeed: 0.4,
      spawnRadiusY: 0.1,
      radius: sodiumSize * 1.8,
      colorSplinePoints: [
        [0.0, new THREE.Color(0xFFFFFF)],
        [1.0, new THREE.Color(0xEEFFFF)]
      ],
      alphaSplinePoints: [
        [0.0, 0.0],
        [0.2, 0.7],
        [0.8, 0.3],
        [1.0, 0.0]
      ],
      sizeSplinePoints: [
        [0.0, 0.02],
        [0.5, 0.08],
        [1.0, 0.12]
      ],
      maxLife: 0.5,
      maxSize: 0.4,
      rotationRate: 0.0
    });

    this.hydrogenFlameEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.sodiumSphere,
      parent: this.scene,
      rate: 800.0,
      texture: '../../../public/textures/fire.png',
      active: false,
      clippingPlaneY: actualWaterLevelInWorld - 0.5,
      spawnRadiusY: 0.05,
      clipBox: new THREE.Vector4(minX, maxZ, minZ, maxX),
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      velocity: new THREE.Vector3(0, 1.5, 0),
      velocityRandomness: 0.6,
      colorSplinePoints: [
        [0.0, new THREE.Color(0xFFFFFF)],
        [0.3, new THREE.Color(0xFFCCFF)],
        [0.6, new THREE.Color(0xFF99DD)],
        [0.8, new THREE.Color(0xDD77CC)],
        [1.0, new THREE.Color(0xBB55AA)]
      ],
      alphaSplinePoints: [
        [0.0, 0.0],
        [0.2, 0.7],
        [0.6, 0.4],
        [1.0, 0.0]
      ],
      sizeSplinePoints: [
        [0.0, 0.2],
        [0.3, 0.8],
        [1.0, 0.3]
      ],
      maxLife: 0.6,
      maxSize: 1.0,
      radius: sodiumSize * 1.0,
      rotationRate: Math.random() * 0.05 - 0.025
    });

    this.sparkEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.sodiumSphere,
      parent: this.scene,
      rate: 2000.0,
      texture: '../../../public/textures/fire.png',
      active: false,
      clippingPlaneY: actualWaterLevelInWorld - 0.5,
      clipBox: new THREE.Vector4(minX, maxZ, minZ, maxX),
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      velocity: new THREE.Vector3(0, 2.0, 0),
      velocityRandomness: 1.5,
      colorSplinePoints: [
        [0.0, new THREE.Color(0xFFFFFF)],
        [0.2, new THREE.Color(0xFFEEAA)],
        [0.5, new THREE.Color(0xFFAA66)],
        [0.8, new THREE.Color(0xFF7744)],
        [1.0, new THREE.Color(0xDD4422)]
      ],
      alphaSplinePoints: [
        [0.0, 1.0],
        [0.2, 0.9],
        [0.5, 0.5],
        [1.0, 0.0]
      ],
      sizeSplinePoints: [
        [0.0, 1.0],
        [0.3, 0.5],
        [1.0, 0.1]
      ],
      maxLife: 0.4,
      maxSize: 0.2,
      radius: sodiumSize * 0.5,
      rotationRate: Math.random() * 0.1 - 0.05
    });

    // disable frustum culling for particle systems
    [this.fireEffect, this.steamEffect, this.bubbleEffect, this.boilingBubblesEffect, this.hydrogenFlameEffect, this.sparkEffect].forEach(e => {
      if (e) e.frustumCulled = false;
    });

    // initial motion vars
    this.sodiumVelocity = new THREE.Vector2(0, 0);
    this.sphereState = 'idle';
    this.reactionStarted = false;
    this.sodiumVelocityX = 0.0;
    this.sodiumVelocityZ = 0.0;

    // initial UI related elements inside container referenced earlier
    this._bindHoverAndClickUI();
  }

  // ---------- Helpers to construct lab furniture ----------
  _createLabTable(tableTopY) {
    const tableGroup = new THREE.Group();
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.1,
    });
    const tableLegMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.2,
      metalness: 0.8,
    });
    const topWidth = 100;
    const topDepth = 50;
    const topThickness = 3.33;
    const legHeight = 50;
    const legSize = 2.67;
    const tableTopGeo = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.y = tableTopY - (topThickness / 2);
    tableGroup.add(tableTop);
    const legGeo = new THREE.BoxGeometry(legSize, legHeight, legSize);
    const legY = tableTop.position.y - (legHeight / 2);
    const legX = (topWidth / 2) - (legSize * 2);
    const legZ = (topDepth / 2) - (legSize * 2);
    const legPositions = [
      new THREE.Vector3(legX, legY, legZ),
      new THREE.Vector3(legX, legY, -legZ),
      new THREE.Vector3(-legX, legY, legZ),
      new THREE.Vector3(-legX, legY, -legZ),
    ];
    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeo, tableLegMat);
      leg.position.copy(pos);
      tableGroup.add(leg);
    });
    tableGroup.traverse(node => {
      if (node.isMesh) node.receiveShadow = true;
    });
    return tableGroup;
  }

  _createClampStand(clampY, baseY) {
    const standGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xAAAAAA,
      metalness: 0.9,
      roughness: 0.3,
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
    });
    const baseWidth = 9.33;
    const baseHeight = 1.33;
    const baseDepth = 13.33;
    const rodRadius = 0.4;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = baseY + (baseHeight / 2);
    standGroup.add(base);
    const rodHeight = (clampY - baseY) + 5.0;
    const rodGeo = new THREE.CylinderGeometry(rodRadius, rodRadius, rodHeight, 12);
    const rod = new THREE.Mesh(rodGeo, metalMat);
    rod.position.set(0, baseY + (rodHeight / 2), -baseDepth / 2 + rodRadius * 2);
    standGroup.add(rod);
    const bossheadGeo = new THREE.BoxGeometry(2, 2.67, 2);
    const bosshead = new THREE.Mesh(bossheadGeo, metalMat);
    bosshead.position.set(rod.position.x, clampY, rod.position.z + 1.5);
    standGroup.add(bosshead);
    const clampGroup = new THREE.Group();
    const clampRodLength = 7.0;
    const clampRodRadius = 0.267;
    const clampRodGeo = new THREE.CylinderGeometry(clampRodRadius, clampRodRadius, clampRodLength, 12);
    const clampRod = new THREE.Mesh(clampRodGeo, metalMat);
    clampRod.rotation.z = Math.PI / 2;
    clampRod.position.x = clampRodLength / 2;
    clampGroup.add(clampRod);
    const prongLength = 2.0;
    const prongSize = 0.33;
    const prongGeo = new THREE.BoxGeometry(prongLength, prongSize, prongSize);
    const prong1 = new THREE.Mesh(prongGeo, rubberMat);
    prong1.position.set(clampRodLength, 0, -0.5);
    prong1.rotation.y = Math.PI / 6;
    clampGroup.add(prong1);
    const prong2 = new THREE.Mesh(prongGeo, rubberMat);
    prong2.position.set(clampRodLength, 0, 0.5);
    prong2.rotation.y = -Math.PI / 6;
    clampGroup.add(prong2);
    clampGroup.position.set(bosshead.position.x + 1.0, clampY, bosshead.position.z);
    standGroup.add(clampGroup);
    standGroup.traverse(node => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return standGroup;
  }

  _bindHoverAndClickUI() {
    // Attach hover logic for tube
    // uses this.mouse updated by _onMouseMove and raycaster in animate loop
  }

  // ---------- Main animate loop ----------
  start() {
    if (!this._running) {
      this._running = true;
      this._reqId = requestAnimationFrame(this._animate);
    }
  }

  stop() {
    if (this._running) {
      cancelAnimationFrame(this._reqId);
      this._reqId = null;
      this._running = false;
    }
  }

  _animate() {
    if (!this._running) return;
    this._reqId = requestAnimationFrame(this._animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.waterMaterial && this.waterMaterial.uniforms) {
      this.waterMaterial.uniforms.u_time.value = elapsedTime;
    }
    if (this.sodiumMaterial && this.sodiumMaterial.uniforms) {
      this.sodiumMaterial.uniforms.u_time.value = elapsedTime;
    }

    // state machine
    if (this.sphereState === 'idle' && this.reactionStarted) {
      this.sphereState = 'falling';
    }

    if (this.sphereState === 'falling') {
      this.fallingVelocity += this.GRAVITY * delta;
      this.sodiumSphere.position.y -= this.fallingVelocity * delta;

      if (this.sodiumSphere.position.y <= this._actualWaterLevelInWorld + this.sodiumSize * 0.3) {
        this.waterImpactForce = Math.min(this.fallingVelocity * 0.5, 8.0);
        this.fallingVelocity = 0.0;
        this.sodiumSphere.position.y = this._actualWaterLevelInWorld + this.sodiumSize * 0.3;
        this.sphereState = 'reacting';

        // start effects
        if (this.fireEffect) { this.fireEffect.start(); if (this.fireEffect.emitter) this.fireEffect.emitter.rate = 150.0; }
        if (this.steamEffect) { this.steamEffect.start(); if (this.steamEffect.emitter) this.steamEffect.emitter.rate = 80.0; }
        if (this.bubbleEffect) this.bubbleEffect.start();
        if (this.boilingBubblesEffect) this.boilingBubblesEffect.start();
        if (this.hydrogenFlameEffect) this.hydrogenFlameEffect.start();
        if (this.sparkEffect) { this.sparkEffect.start(); if (this.sparkEffect.emitter) this.sparkEffect.emitter.rate = 60.0; }

        this.reactionTimer = 0.0;
        const impactBoost = this.waterImpactForce * 0.8;
        this.sodiumVelocityX = (Math.random() - 0.5) * (4.0 + impactBoost);
        this.sodiumVelocityZ = (Math.random() - 0.5) * (4.0 + impactBoost);
      }
    } else if (this.sphereState === 'reacting') {
      this.reactionTimer += delta;
      let progress = this.reactionTimer / this.REACTION_DURATION;
      progress = Math.min(progress, 1.0);

      const currentScale = 1.0 - progress;
      this.sodiumSphere.scale.set(currentScale, currentScale, currentScale);
      this.sodiumMaterial.uniforms.u_progress.value = progress;

      const fireIntensity = Math.max(0, 1.0 - progress);
      const lightIntensity = fireIntensity * 2.0;

      if (this.fireEffect && this.fireEffect.emitter) this.fireEffect.emitter.rate = 150.0 * fireIntensity;
      if (this.steamEffect && this.steamEffect.emitter) this.steamEffect.emitter.rate = 80.0 * fireIntensity;
      if (this.sparkEffect && this.sparkEffect.emitter) this.sparkEffect.emitter.rate = 60.0 * fireIntensity;

      if (this.fireLight) this.fireLight.intensity = lightIntensity;

      if (progress >= 1.0) {
        this.sphereState = 'done';
        // stop effects
        if (this.fireEffect) this.fireEffect.stop();
        if (this.steamEffect) this.steamEffect.stop();
        if (this.bubbleEffect) this.bubbleEffect.stop();
        if (this.boilingBubblesEffect) this.boilingBubblesEffect.stop();
        if (this.hydrogenFlameEffect) this.hydrogenFlameEffect.stop();
        if (this.sparkEffect) this.sparkEffect.stop();
        try { this.sodiumSphere.remove(this.fireLight); } catch (e) {}
        if (this.waterMaterial && this.waterMaterial.uniforms) this.waterMaterial.uniforms.u_sphere_velocity.value.set(0, 0);
        this.waveDecayFactor = 1.0;

        if (this.btnStartReaction) {
          this.btnStartReaction.disabled = false;
          this.btnStartReaction.textContent = '🔄 Phản ứng lại';
          this.btnStartReaction.style.opacity = '1';
          this.btnStartReaction.style.cursor = 'pointer';
        }
      }

      // flame jitter & hydrogen force
      if (this.fireLight) this.fireLight.intensity = (Math.random() * 0.3 + 0.2) * (1.0 - progress * 0.7);

      const h2Force = 18.0 * (1.0 - progress * 0.5);
      const accelerationX = (Math.random() - 0.5) * h2Force;
      const accelerationZ = (Math.random() - 0.5) * h2Force;

      this.sodiumVelocityX += accelerationX * delta;
      this.sodiumVelocityZ += accelerationZ * delta;

      this.sodiumVelocityX *= 0.98;
      this.sodiumVelocityZ *= 0.98;

      const maxSpeed = 7.0;
      const speed = Math.sqrt(this.sodiumVelocityX * this.sodiumVelocityX + this.sodiumVelocityZ * this.sodiumVelocityZ);
      if (speed > maxSpeed) {
        this.sodiumVelocityX = (this.sodiumVelocityX / speed) * maxSpeed;
        this.sodiumVelocityZ = (this.sodiumVelocityZ / speed) * maxSpeed;
      }

      this.sodiumSphere.position.x += this.sodiumVelocityX * delta;
      this.sodiumSphere.position.z += this.sodiumVelocityZ * delta;

      const maxRadius = this.sodiumMoveRadius;
      const distFromCenter = Math.sqrt(
        this.sodiumSphere.position.x * this.sodiumSphere.position.x +
        this.sodiumSphere.position.z * this.sodiumSphere.position.z
      );

      if (distFromCenter > maxRadius) {
        const angle = Math.atan2(this.sodiumSphere.position.z, this.sodiumSphere.position.x);
        this.sodiumSphere.position.x = Math.cos(angle) * maxRadius;
        this.sodiumSphere.position.z = Math.sin(angle) * maxRadius;

        const normalX = Math.cos(angle);
        const normalZ = Math.sin(angle);
        const dotProduct = this.sodiumVelocityX * normalX + this.sodiumVelocityZ * normalZ;
        this.sodiumVelocityX = this.sodiumVelocityX - 2 * dotProduct * normalX;
        this.sodiumVelocityZ = this.sodiumVelocityZ - 2 * dotProduct * normalZ;
        this.sodiumVelocityX *= 0.85;
        this.sodiumVelocityZ *= 0.85;
        this.sodiumVelocityX += (Math.random() - 0.5) * 3.5;
        this.sodiumVelocityZ += (Math.random() - 0.5) * 3.5;
      }

      const vibrationAmount = 0.08 * (1.0 - progress);
      const speedFactor = Math.min(speed / maxSpeed, 1.0);
      this.sodiumSphere.rotation.x = Math.sin(elapsedTime * 25) * vibrationAmount * (1.0 + speedFactor);
      this.sodiumSphere.rotation.z = Math.cos(elapsedTime * 28) * vibrationAmount * (1.0 + speedFactor);
      this.sodiumSphere.rotation.y += delta * speed * 2.0;

      // update water uniforms for waves
      if (this.waterMaterial && this.waterMaterial.uniforms) {
        this.waterMaterial.uniforms.u_wave_origin.value.x = this.sodiumSphere.position.x;
        this.waterMaterial.uniforms.u_wave_origin.value.y = this.sodiumSphere.position.z;
        const effectiveVelocity = Math.sqrt(this.sodiumVelocityX * this.sodiumVelocityX + this.sodiumVelocityZ * this.sodiumVelocityZ);
        const velocityWithImpact = effectiveVelocity + this.waterImpactForce * 0.3;
        this.waterMaterial.uniforms.u_sphere_velocity.value.x = this.sodiumVelocityX * (velocityWithImpact / Math.max(effectiveVelocity, 0.1));
        this.waterMaterial.uniforms.u_sphere_velocity.value.y = this.sodiumVelocityZ * (velocityWithImpact / Math.max(effectiveVelocity, 0.1));
      }

      if (this.waterImpactForce > 0.1) {
        this.waterImpactForce *= 0.92;
      } else {
        this.waterImpactForce = 0.0;
      }
    } else if (this.sphereState === 'done') {
      // decay waves
      if (this.waveDecayFactor > 0.001) {
        this.waveDecayFactor *= 0.95;
        if (this.waterMaterial && this.waterMaterial.uniforms) this.waterMaterial.uniforms.u_wave_decay.value = this.waveDecayFactor;
      } else {
        this.waveDecayFactor = 0.0;
        if (this.waterMaterial && this.waterMaterial.uniforms) this.waterMaterial.uniforms.u_wave_decay.value = 0.0;
      }
    }

    // hover detection
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.tubeMesh, this.lipMesh], false);
    if (intersects.length > 0) {
      if (!this.isHovering) {
        this.isHovering = true;
        if (this.tubeMesh && this.tubeMesh.material) {
          this.tubeMesh.material.emissive = new THREE.Color(0x4488ff);
          this.tubeMesh.material.emissiveIntensity = 0.3;
        }
        if (this.lipMesh && this.lipMesh.material) {
          this.lipMesh.material.emissive = new THREE.Color(0x4488ff);
          this.lipMesh.material.emissiveIntensity = 0.3;
        }
        this.container.style.cursor = 'pointer';
      }
    } else {
      if (this.isHovering) {
        this.isHovering = false;
        if (this.tubeMesh && this.tubeMesh.material) {
          this.tubeMesh.material.emissive = new THREE.Color(0x000000);
          this.tubeMesh.material.emissiveIntensity = 0;
        }
        if (this.lipMesh && this.lipMesh.material) {
          this.lipMesh.material.emissive = new THREE.Color(0x000000);
          this.lipMesh.material.emissiveIntensity = 0;
        }
        this.container.style.cursor = 'default';
      }
    }

    // update particle systems
    if (this.fireEffect) this.fireEffect.update(delta);
    if (this.steamEffect) this.steamEffect.update(delta);
    if (this.bubbleEffect) this.bubbleEffect.update(delta);
    if (this.boilingBubblesEffect) this.boilingBubblesEffect.update(delta);
    if (this.hydrogenFlameEffect) this.hydrogenFlameEffect.update(delta);
    if (this.sparkEffect) this.sparkEffect.update(delta);

    this.controls.update();
    this.composer.render(delta);
  }

  // ---------- Mouse / click handlers ----------
  _onMouseMove(event) {
    // map mouse relative to container
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _onClick(event) {
    // If user clicks on tube when hovering -> toggle info panel
    const molecularModal = this.container.querySelector(this.sel.molecularModalOverlay);
    const isClickingMolecularModal = molecularModal && (molecularModal.contains(event.target) || event.target === molecularModal);

    if (this.isHovering) {
      this.infoPanelVisible = true;
      if (this.infoPanel) this.infoPanel.classList.add('visible');
      event.stopPropagation();
    } else if (this.infoPanelVisible && this.infoPanel && !this.infoPanel.contains(event.target) && !isClickingMolecularModal) {
      this.infoPanelVisible = false;
      this.infoPanel.classList.remove('visible');
    }
  }

  _onStartReactionClicked() {
    if (!this.btnStartReaction) return;
    if (this.sphereState === 'done') {
      this.sphereState = 'idle';
      this.reactionStarted = false;
      this.reactionTimer = 0;
      this.sodiumSphere.position.set(0, this.CLAMP_Y_LEVEL - 1.5, 0);
      this.sodiumSphere.scale.set(1, 1, 1);
      this.sodiumMaterial.uniforms.u_progress.value = 0;
      try { this.sodiumSphere.add(this.fireLight); } catch (e) {}
      this.waveDecayFactor = 1.0;
      if (this.waterMaterial && this.waterMaterial.uniforms) this.waterMaterial.uniforms.u_wave_decay.value = 1.0;
      this.fallingVelocity = 0.0;
      this.waterImpactForce = 0.0;
      this.btnStartReaction.textContent = '⚗️ Phản ứng';
      setTimeout(() => {
        this.reactionStarted = true;
        this.btnStartReaction.disabled = true;
        this.btnStartReaction.textContent = 'Đang phản ứng...';
        this.btnStartReaction.style.opacity = '0.5';
        this.btnStartReaction.style.cursor = 'not-allowed';
      }, 100);
    } else if (!this.reactionStarted) {
      this.reactionStarted = true;
      this.btnStartReaction.disabled = true;
      this.btnStartReaction.textContent = 'Đang phản ứng...';
      this.btnStartReaction.style.opacity = '0.5';
      this.btnStartReaction.style.cursor = 'not-allowed';
    }
  }

  // ---------- Molecular scene (modal) ----------
  _initMolecularScene() {
    const canvas = this.molCanvas;
    const labelDiv = this.molLabelDiv;
    if (!canvas || !labelDiv) {
      throw new Error('Molecular canvas or label container not found in container.');
    }
    this.scene_mol = new THREE.Scene();
    this.scene_mol.background = new THREE.Color(0x222222);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera_mol = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    this.camera_mol.position.set(0, 0, 18);
    this.renderer_mol = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    this.renderer_mol.setSize(w, h);
    this.renderer_mol.setPixelRatio(window.devicePixelRatio || 1);
    this.labelRenderer = new CSS2DRenderer({ element: labelDiv });
    this.labelRenderer.setSize(w, h);
    this.controls_mol = new OrbitControls(this.camera_mol, this.renderer_mol.domElement);
    this.controls_mol.enableDamping = true;
    this.controls_mol.dampingFactor = 0.15;
    this.controls_mol.enablePan = false;
    this.controls_mol.minDistance = 6;
    this.controls_mol.maxDistance = 50;
    this.scene_mol.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(6, 8, 12);
    this.scene_mol.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dir2.position.set(-6, -4, -8);
    this.scene_mol.add(dir2);

    window.addEventListener('resize', () => this._onMolecularResize());
    this._onMolecularResize();
    // will animate when requested
  }

  _onMolecularResize() {
    if (!this.renderer_mol || !this.camera_mol || !this.labelRenderer) return;
    const canvas = this.renderer_mol.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera_mol.aspect = w / h;
    this.camera_mol.updateProjectionMatrix();
    this.renderer_mol.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  _animateMolecularScene() {
    this._molReqId = requestAnimationFrame(this._animateMolecularScene);
    this._runningMol = true;
    TWEEN.update();
    if (this.controls_mol) this.controls_mol.update();
    if (this.renderer_mol && this.camera_mol) this.renderer_mol.render(this.scene_mol, this.camera_mol);
    if (this.labelRenderer && this.camera_mol) this.labelRenderer.render(this.scene_mol, this.camera_mol);
  }

  _startMolecularAnimation() {
    // Clear and build the molecular reaction animation similar to original
    // Implementation copies logic from original startReactionAnimation()
    // For brevity, re-use code from original: we create atoms, bonds, and TWEEN timeline
    // NOTE: This method assumes _initMolecularScene() has been called.
    if (!this.scene_mol) return;

    // helper primitives and functions reused from original (createAtom, createBond, etc.)
    const atomGeo = new THREE.SphereGeometry(1, 48, 48);
    const bondGeo = new THREE.CylinderGeometry(0.25, 0.25, 1, 24);
    const bondMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.2,
      metalness: 0.1
    });

    const ATOM_PROPS = {
      K: { color: 0xab5cf2, radius: 0.85, label: 'K' },
      O: { color: 0xff0d0d, radius: 0.60, label: 'O' },
      H: { color: 0xffffff, radius: 0.35, label: 'H' },
      Cl: { color: 0x1ff01f, radius: 1.00, label: 'Cl' },
      C: { color: 0x909090, radius: 0.70, label: 'C' },
    };

    const createAtomLabel = (text) => {
      const div = document.createElement('div');
      div.className = 'atom-label';
      div.textContent = text;
      div.style.padding = '2px 6px';
      div.style.borderRadius = '6px';
      div.style.fontSize = '12px';
      div.style.background = 'rgba(0,0,0,0.4)';
      div.style.color = '#fff';
      div.style.pointerEvents = 'none';
      return new CSS2DObject(div);
    };

    const createAtom = (type) => {
      const props = ATOM_PROPS[type];
      if (!props) throw new Error('Unknown atom type: ' + type);
      const mat = new THREE.MeshStandardMaterial({
        color: props.color,
        roughness: 0.3,
        metalness: 0.0,
        emissive: props.color,
        emissiveIntensity: 0.05,
      });
      const atom = new THREE.Mesh(atomGeo, mat);
      atom.scale.setScalar(props.radius);
      atom.userData.atomType = type;
      atom.userData.radius = props.radius;
      const label = createAtomLabel(props.label);
      label.position.set(0, props.radius * 1.05, 0);
      atom.add(label);
      return atom;
    };

    const createBond = (aObj, bObj, opts = {}) => {
      const radius = opts.radius !== undefined ? opts.radius : 0.13;
      const material = opts.material !== undefined ? opts.material : bondMat.clone();

      const getWorldPos = (o) => {
        if (o instanceof THREE.Object3D) return o.getWorldPosition(new THREE.Vector3());
        if (o instanceof THREE.Vector3) return o.clone();
        return new THREE.Vector3(0,0,0);
      };
      const getRadius = (o) => {
        if (o instanceof THREE.Object3D && o.userData && typeof o.userData.radius === 'number') {
          return o.userData.radius;
        }
        return 0;
      };

      const pA = getWorldPos(aObj);
      const pB = getWorldPos(bObj);
      const rA = getRadius(aObj);
      const rB = getRadius(bObj);

      const vec = new THREE.Vector3().subVectors(pB, pA);
      const fullDist = vec.length();
      if (fullDist < 1e-6) return null;
      const dir = vec.clone().normalize();
      const overlap = 0.15;
      const gap = fullDist - (rA - overlap) - (rB - overlap);
      const start = pA.clone().addScaledVector(dir, rA - overlap);
      const mid = start.clone().addScaledVector(dir, gap * 0.5);
      const geom = new THREE.CylinderGeometry(radius, radius, 1, 24);
      const bond = new THREE.Mesh(geom, material);
      bond.scale.set(1, gap, 1);
      bond.position.copy(mid);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      bond.userData._isBond = true;
      bond.userData.endA = aObj;
      bond.userData.endB = bObj;
      return bond;
    };

    const removeAllBondsFromScene = (scene) => {
      const toRemove = [];
      scene.traverse(obj => {
        if (obj.userData && obj.userData._isBond) toRemove.push(obj);
      });
      toRemove.forEach(b => {
        if (b.parent) b.parent.remove(b);
        if (b.geometry) b.geometry.dispose();
        if (b.material && b.material.dispose) b.material.dispose();
      });
    };

    const detachAtomToScene = (atom, scene) => {
      const worldPos = atom.getWorldPosition(new THREE.Vector3());
      const wrap = new THREE.Object3D();
      wrap.position.copy(worldPos);
      scene.add(wrap);
      if (atom.parent) atom.parent.remove(atom);
      atom.position.set(0, 0, 0);
      atom.quaternion.set(0,0,0,1);
      wrap.add(atom);
      return wrap;
    };

    // clear existing mol scene objects
    const clearMolecularScene = () => {
      if (!this.scene_mol) return;
      TWEEN.removeAll();
      const toRemove = [];
      this.scene_mol.traverse(obj => {
        if (obj.isMesh || obj.type === 'Group' || obj.type === 'Object3D' || (obj.isCSS2DObject)) {
          if (obj.isLight || obj.isCamera || obj.isOrbitControls) return;
          toRemove.push(obj);
        }
      });
      toRemove.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material && obj.material.dispose) obj.material.dispose();
        if (obj.element && obj.element.remove) obj.element.remove();
        if (obj.parent) obj.parent.remove(obj);
      });
    };

    clearMolecularScene();

    // build atoms & groups and animate with TWEEN (logic mirrored from original)
    const atoms = {
      k1: createAtom('K'),
      k2: createAtom('K'),
      o1: createAtom('O'),
      h1a: createAtom('H'),
      h1b: createAtom('H'),
      o2: createAtom('O'),
      h2a: createAtom('H'),
      h2b: createAtom('H'),
    };

    const waterAngle = 104.45 * Math.PI / 180;
    const ohBondLength = 1.4;

    atoms.o1.position.set(0, 0, 0);
    atoms.h1a.position.set(
      ohBondLength * Math.sin(waterAngle / 2),
      ohBondLength * Math.cos(waterAngle / 2),
      0
    );
    atoms.h1b.position.set(
      -ohBondLength * Math.sin(waterAngle / 2),
      ohBondLength * Math.cos(waterAngle / 2),
      0
    );
    const bond_o1_h1a = createBond(atoms.o1, atoms.h1a);
    const bond_o1_h1b = createBond(atoms.o1, atoms.h1b);
    const water1 = new THREE.Group();
    water1.add(atoms.o1, atoms.h1a, atoms.h1b, bond_o1_h1a, bond_o1_h1b);

    atoms.o2.position.set(0, 0, 0);
    atoms.h2a.position.set(
      ohBondLength * Math.sin(waterAngle / 2),
      ohBondLength * Math.cos(waterAngle / 2),
      0
    );
    atoms.h2b.position.set(
      -ohBondLength * Math.sin(waterAngle / 2),
      ohBondLength * Math.cos(waterAngle / 2),
      0
    );
    const bond_o2_h2a = createBond(atoms.o2, atoms.h2a);
    const bond_o2_h2b = createBond(atoms.o2, atoms.h2b);
    const water2 = new THREE.Group();
    water2.add(atoms.o2, atoms.h2a, atoms.h2b, bond_o2_h2a, bond_o2_h2b);

    atoms.k1.position.set(-1, 0, 0);
    atoms.k2.position.set(1, 0, 0);
    const groupK = new THREE.Group();
    groupK.add(atoms.k1, atoms.k2);

    groupK.position.set(-8, 3, 0);
    water1.position.set(8, 0, 0);
    water2.position.set(8, -3, 0);
    this.scene_mol.add(groupK, water1, water2);

    new TWEEN.Tween(water1.rotation)
      .to({ y: Math.PI * 2 }, 8000)
      .repeat(Infinity)
      .start();
    new TWEEN.Tween(water2.rotation)
      .to({ y: -Math.PI * 2 }, 9000)
      .repeat(Infinity)
      .start();
    new TWEEN.Tween(groupK.rotation)
      .to({ z: Math.PI * 2 }, 10000)
      .repeat(Infinity)
      .start();

    const bondDist_KOH = 2.4;
    const bondDist_OH_KOH = 1.4;
    const H_H_Dist = 1.2;

    const h2_base_y = 3.0;
    const koh1_base_y = 0.5;
    const koh2_base_y = -2.5;

    const h2_pos = {
      h1a: { x: -2.0, y: h2_base_y, z: 0 },
      h2a: { x: -2.0 + H_H_Dist, y: h2_base_y, z: 0 },
    };

    const koh1_pos = {
      k1: { x: 1.0,  y: koh1_base_y, z: 0 },
      o1:  { x: 1.0 + bondDist_KOH,  y: koh1_base_y, z: 0 },
      h1b: { x: 1.0 + bondDist_KOH + bondDist_OH_KOH,  y: koh1_base_y, z: 0 },
    };

    const koh2_pos = {
      k2: { x: 1.0,  y: koh2_base_y, z: 0 },
      o2:  { x: 1.0 + bondDist_KOH,  y: koh2_base_y, z: 0 },
      h2b: { x: 1.0 + bondDist_KOH + bondDist_OH_KOH,  y: koh2_base_y, z: 0 },
    };

    const duration = 2800;
    const delay = 840;

    const tK = new TWEEN.Tween(groupK.position)
      .to({ x: -4, y: 0 }, duration)
      .easing(TWEEN.Easing.Back.Out);

    const tW1 = new TWEEN.Tween(water1.position)
      .to({ x: 3.6, y: 1.5, z: 0 }, duration)
      .easing(TWEEN.Easing.Back.Out)
      .delay(100);

    const tW2 = new TWEEN.Tween(water2.position)
      .to({ x: 3.6, y: -1.5, z: 0 }, duration)
      .easing(TWEEN.Easing.Back.Out)
      .delay(200);

    const tBreak = new TWEEN.Tween({}).to({}, duration).delay(delay).onStart(() => {
      [bond_o1_h1a, bond_o1_h1b, bond_o2_h2a, bond_o2_h2b].forEach((b, i) => {
        const shakeAnim = { x: 0 };
        new TWEEN.Tween(shakeAnim)
          .to({ x: 1 }, 150)
          .repeat(3)
          .onUpdate(() => {
            if (b) b.rotation.z = Math.sin(shakeAnim.x * Math.PI * 4) * 0.2;
          })
          .start();

        if (b) {
          new TWEEN.Tween(b.scale)
            .to({ y: 0.02 }, 260)
            .delay(150 * 3 + i * 50)
            .easing(TWEEN.Easing.Cubic.In)
            .start();
          b.material.transparent = true;
          new TWEEN.Tween(b.material)
            .to({ opacity: 0 }, 260)
            .delay(150 * 3 + i * 50)
            .start();
        }
      });

      setTimeout(() => {
        removeAllBondsFromScene(this.scene_mol);
        Object.keys(atoms).forEach(k => detachAtomToScene(atoms[k], this.scene_mol));
      }, 300);
    });

    const tFormH2 = new TWEEN.Tween({}).to({}, duration);
    const tFormKOH1 = new TWEEN.Tween({}).to({}, duration);
    const tFormKOH2 = new TWEEN.Tween({}).to({}, duration);

    tBreak.onComplete(() => {
      new TWEEN.Tween(atoms.h1a.parent.position).to(h2_pos.h1a, duration).easing(TWEEN.Easing.Back.InOut).start();
      new TWEEN.Tween(atoms.h2a.parent.position).to(h2_pos.h2a, duration).easing(TWEEN.Easing.Back.InOut).chain(tFormH2).start();

      new TWEEN.Tween(atoms.k1.parent.position).to(koh1_pos.k1, duration).easing(TWEEN.Easing.Back.InOut).start();
      new TWEEN.Tween(atoms.o1.parent.position).to(koh1_pos.o1, duration).easing(TWEEN.Easing.Back.InOut).start();
      new TWEEN.Tween(atoms.h1b.parent.position).to(koh1_pos.h1b, duration).easing(TWEEN.Easing.Back.InOut).chain(tFormKOH1).start();

      new TWEEN.Tween(atoms.k2.parent.position).to(koh2_pos.k2, duration).easing(TWEEN.Easing.Back.InOut).start();
      new TWEEN.Tween(atoms.o2.parent.position).to(koh2_pos.o2, duration).easing(TWEEN.Easing.Back.InOut).start();
      new TWEEN.Tween(atoms.h2b.parent.position).to(koh2_pos.h2b, duration).easing(TWEEN.Easing.Back.InOut).chain(tFormKOH2).start();
    });

    tFormH2.onStart(() => {
      const bondH2 = createBond(atoms.h1a, atoms.h2a, { radius: 0.13 });
      if (bondH2) {
        this.scene_mol.add(bondH2);
        bondH2.scale.y = 0.01;
        new TWEEN.Tween(bondH2.scale)
          .to({ y: bondH2.scale.y * 100 }, 400)
          .easing(TWEEN.Easing.Elastic.Out)
          .start();
      }
      [atoms.h1a, atoms.h2a].forEach((atom, i) => {
        const originalScale = atom.scale.x;
        new TWEEN.Tween(atom.scale)
          .to({ x: originalScale * 1.3, y: originalScale * 1.3, z: originalScale * 1.3 }, 200)
          .delay(i * 100)
          .yoyo(true)
          .repeat(1)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      });
    });

    tFormKOH1.onStart(() => {
      const b1 = createBond(atoms.k1, atoms.o1, { radius: 0.13 });
      const b2 = createBond(atoms.o1, atoms.h1b, { radius: 0.13 });
      if (b1) {
        this.scene_mol.add(b1);
        b1.scale.y = 0.01;
        new TWEEN.Tween(b1.scale)
          .to({ y: b1.scale.y * 100 }, 500)
          .easing(TWEEN.Easing.Elastic.Out)
          .start();
      }
      if (b2) {
        this.scene_mol.add(b2);
        b2.scale.y = 0.01;
        new TWEEN.Tween(b2.scale)
          .to({ y: b2.scale.y * 100 }, 500)
          .delay(150)
          .easing(TWEEN.Easing.Elastic.Out)
          .start();
      }
      [atoms.k1, atoms.o1, atoms.h1b].forEach((atom, i) => {
        const originalScale = atom.scale.x;
        new TWEEN.Tween(atom.scale)
          .to({ x: originalScale * 1.3, y: originalScale * 1.3, z: originalScale * 1.3 }, 200)
          .delay(i * 100)
          .yoyo(true)
          .repeat(1)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      });
    });

    tFormKOH2.onStart(() => {
      const b1 = createBond(atoms.k2, atoms.o2, { radius: 0.13 });
      const b2 = createBond(atoms.o2, atoms.h2b, { radius: 0.13 });
      if (b1) {
        this.scene_mol.add(b1);
        b1.scale.y = 0.01;
        new TWEEN.Tween(b1.scale)
          .to({ y: b1.scale.y * 100 }, 500)
          .easing(TWEEN.Easing.Elastic.Out)
          .start();
      }
      if (b2) {
        this.scene_mol.add(b2);
        b2.scale.y = 0.01;
        new TWEEN.Tween(b2.scale)
          .to({ y: b2.scale.y * 100 }, 500)
          .delay(150)
          .easing(TWEEN.Easing.Elastic.Out)
          .start();
      }
      [atoms.k2, atoms.o2, atoms.h2b].forEach((atom, i) => {
        const originalScale = atom.scale.x;
        new TWEEN.Tween(atom.scale)
          .to({ x: originalScale * 1.3, y: originalScale * 1.3, z: originalScale * 1.3 }, 200)
          .delay(i * 100)
          .yoyo(true)
          .repeat(1)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      });
    });

    tK.chain(tBreak);
    tK.start();
    tW1.start();
    tW2.start();
    // ensure molecular animation loop running
    if (!this._runningMol) this._animateMolecularScene();
  }

  // ---------- Atom Selector logic (for atom modal) ----------
  _initAtomSelector() {
    // similar to original initAtomSelector but scoped to container elements
    const atomBtns = this.atomBtns;
    const atomViewer = this.atomViewer;
    const atomName = this.atomName;
    const atomDescription = this.atomDescription;
    if (!atomViewer || !atomName || !atomDescription) {
      console.error('Atom selector elements not found in container');
      return;
    }

    const atomData = {
      potassium: {
        file: 'assets/element_019_potassium.glb',
        name: 'Kali (K)',
        description: 'Kim loại kiềm, phản ứng mạnh với nước. Số hiệu nguyên tử: 19',
        emoji: '🟡',
        details: {
          title: 'Mô hình nguyên tử của Bohr',
          mainDescription: 'Kali là kim loại kiềm, phản ứng mạnh với nước, chiếm khoảng 2.6% khối lượng của vỏ trái đất.',
          symbol: 'K',
          atomicMass: '39.0983 u',
          density: '0.828 g/cm³',
          meltingPoint: '63.5°C',
          boilingPoint: '759°C',
          discoverer: 'Humphry Davy',
          yearDiscovered: '1807'
        }
      },
      hydrogen: {
        file: 'assets/element_001_hydrogen.glb',
        name: 'Hiđrô (H₂)',
        description: 'Khí nhẹ nhất, không màu, không mùi. Số hiệu nguyên tử: 1',
        emoji: '⚪',
        details: {
          title: 'Mô hình nguyên tử của Bohr',
          mainDescription: 'Hiđrô là nguyên tố phổ biến nhất trong vũ trụ, chiếm khoảng 75% khối lượng của vũ trụ.',
          symbol: 'H',
          atomicMass: '1.00784 u',
          density: '0.07099 g/cm³',
          meltingPoint: '-252.87°C',
          boilingPoint: '-259.16°C',
          discoverer: 'Henry Cavendish',
          yearDiscovered: '1766'
        }
      },
      oxygen: {
        file: 'assets/element_008_oxygen.glb',
        name: 'Oxy (O₂)',
        description: 'Khí cần thiết cho sự sống, hỗ trợ đốt cháy. Số hiệu nguyên tử: 8',
        emoji: '🔴',
        details: {
          title: 'Mô hình nguyên tử của Bohr',
          mainDescription: 'Oxy là nguyên tố cần thiết cho sự sống, chiếm khoảng 21% khí quyển và 46% khối lượng vỏ trái đất.',
          symbol: 'O',
          atomicMass: '15.999 u',
          density: '1.429 g/L',
          meltingPoint: '-218.79°C',
          boilingPoint: '-182.95°C',
          discoverer: 'Carl Wilhelm Scheele',
          yearDiscovered: '1774'
        }
      }
    };

    const updateAtomDetails = (data) => {
      const elements = {
        title: this.container.querySelector('#detail-title'),
        mainDescription: this.container.querySelector('#main-description'),
        symbol: this.container.querySelector('#detail-symbol'),
        mass: this.container.querySelector('#detail-mass'),
        density: this.container.querySelector('#detail-density'),
        melting: this.container.querySelector('#detail-melting'),
        boiling: this.container.querySelector('#detail-boiling'),
        discoverer: this.container.querySelector('#detail-discoverer'),
        year: this.container.querySelector('#detail-year'),
        linkElement: this.container.querySelector('#link-element')
      };
      if (data.details) {
        const details = data.details;
        if (elements.title) elements.title.textContent = details.title;
        if (elements.mainDescription) elements.mainDescription.textContent = details.mainDescription;
        if (elements.symbol) elements.symbol.textContent = details.symbol;
        if (elements.mass) elements.mass.textContent = details.atomicMass;
        if (elements.density) elements.density.textContent = details.density;
        if (elements.melting) elements.melting.textContent = details.meltingPoint;
        if (elements.boiling) elements.boiling.textContent = details.boilingPoint;
        if (elements.discoverer) elements.discoverer.textContent = details.discoverer;
        if (elements.year) elements.year.textContent = details.yearDiscovered;
        if (elements.linkElement) elements.linkElement.textContent = data.name.split(' ')[0];
      }
    };

    atomBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        atomBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const atomType = btn.dataset.atom;
        const data = atomData[atomType];
        if (data) {
          atomName.textContent = data.name;
          atomDescription.textContent = data.description;
          updateAtomDetails(data);
          atomDescription.innerHTML = `
            <span style="color: #4CAF50;">🔄 Đang tải mô hình ${data.name}...</span><br>
            <span style="font-size: 12px; opacity: 0.8;">File GLB: ${data.file.split('/').pop()}</span>
          `;
          atomViewer.src = data.file;
          switch(atomType) {
            case 'potassium':
              atomViewer.setAttribute('rotation-per-second', '50deg');
              atomViewer.setAttribute('camera-orbit', '45deg 75deg 5m');
              break;
            case 'hydrogen':
              atomViewer.setAttribute('rotation-per-second', '80deg');
              atomViewer.setAttribute('camera-orbit', '0deg 90deg 3m');
              break;
            case 'oxygen':
              atomViewer.setAttribute('rotation-per-second', '65deg');
              atomViewer.setAttribute('camera-orbit', '30deg 60deg 4m');
              break;
          }
          const handleLoad = () => {
            atomDescription.innerHTML = `<span style="color: #10b981;">✅ ${data.description}</span>`;
            atomViewer.removeEventListener('load', handleLoad);
          };
          const handleProgress = (e) => {};
          const handleError = (e) => {
            atomDescription.innerHTML = `<span style="color: #ff6b6b;">⚠️ Không thể tải file ${data.file}</span><br><span style="font-size: 12px; opacity: 0.8;">Vui lòng kiểm tra file GLB có tồn tại trong thư mục assets/</span>`;
            atomViewer.removeEventListener('error', handleError);
          };
          atomViewer.addEventListener('load', handleLoad);
          atomViewer.addEventListener('progress', handleProgress);
          atomViewer.addEventListener('error', handleError);
          atomViewer.addEventListener('camera-change', () => {
            if (!atomViewer.hasAttribute('auto-rotate')) atomViewer.setAttribute('auto-rotate', '');
          });
        }
      });
    });
  }

  // ---------- Cleanup / destroy ----------
  destroy() {
    // stop loops
    this.stop();
    if (this._runningMol) {
      cancelAnimationFrame(this._molReqId);
      this._runningMol = false;
    }
    // remove event listeners
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('click', this._onClick);

    // dispose Three.js resources (geometries, materials, textures)
    const disposeObject = (obj) => {
      if (!obj) return;
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => { if (m.dispose) m.dispose(); });
        } else {
          if (obj.material.dispose) obj.material.dispose();
        }
      }
      if (obj.texture && obj.texture.dispose) obj.texture.dispose();
    };

    this.scene.traverse(o => disposeObject(o));
    if (this.scene_mol) this.scene_mol.traverse(o => disposeObject(o));

    // remove DOM elements appended
    try {
      if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    } catch (e) {}

    // stop particle systems if they expose stop/dispose
    [this.fireEffect, this.steamEffect, this.bubbleEffect, this.boilingBubblesEffect, this.hydrogenFlameEffect, this.sparkEffect].forEach(e => {
      try { if (e && typeof e.dispose === 'function') e.dispose(); } catch (err) {}
    });

    // clear references
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.composer = null;
    this.controls = null;
  }

  // ---------- Window resize handler ----------
  _onResize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }
}

import{i as Gt,q as We}from"./v7-audio-DKD45QnK.js";import{x as Ae,Y as ge,a0 as Ut,W as Kt,e as wt,t as qt,S as $t,w as jt,H as Wt,u as Et,G as Je,O as tt,l as ze,C as gt,j as me,b as nt,A as Vt,y as Nt,B as vt,a7 as kt,a8 as Ct,a9 as St,T as Ne,aa as Qe,V as Te,L as Xt,a4 as Zt,i as Jt,D as _t,F as Qt,I as ea,M as at,P as ta,o as aa,p as sa,q as na,d as ia,K as ra,R as it,f as rt}from"./three-nIxGH9QW.js";const xt={MEDICINE:"./assets/v7/plates/medicine.jpg",CHEMISTRY:"./assets/v7/plates/chemistry.jpg",PHYSICS:"./assets/v7/plates/physics.jpg",GADGETS:"./assets/v7/plates/gadgets.jpg",ENGINES:"./assets/v7/plates/engines.jpg",LITERATURE:"./assets/v7/plates/literature.jpg",LEXICON:"./assets/v7/plates/lexicon.jpg","FINE ARTS":"./assets/v7/plates/fine_arts.jpg",SCREEN:"./assets/v7/plates/screen.jpg",JUKEBOX:"./assets/v7/plates/jukebox.jpg",FINANCE:"./assets/v7/plates/finance.jpg",PRICING:"./assets/v7/plates/pricing.jpg",ODDS:"./assets/v7/plates/odds.jpg",ATLAS:"./assets/v7/plates/atlas.jpg",SPORTS:"./assets/v7/plates/sports.jpg",DYNASTIES:"./assets/v7/plates/dynasties.jpg",HEADLINES:"./assets/v7/plates/headlines.jpg",FOLKLORE:"./assets/v7/plates/folklore.jpg",FALLACIES:"./assets/v7/plates/fallacies.jpg",CUISINE:"./assets/v7/plates/cuisine.jpg"};function Ot(a,e){const n=xt[a]??xt.PHYSICS;return e?n.replace(/^\.\//,e.endsWith("/")?e:`${e}/`):n}const oa={MEDICINE:0,CHEMISTRY:1,PHYSICS:2,GADGETS:3,ENGINES:4,LITERATURE:5,LEXICON:6,"FINE ARTS":7,SCREEN:8,JUKEBOX:9,FINANCE:10,PRICING:11,ODDS:12,ATLAS:13,SPORTS:14,DYNASTIES:15,HEADLINES:16,FOLKLORE:17,FALLACIES:18,CUISINE:19},Tt=["M3.5,3 L6.2,1.2 L6.2,12.8 M3.5,12.8 L9,12.8","M2.2,4 C2.2,1.2 9.2,1.2 9.2,4.5 C9.2,7.8 2.2,9.5 2.2,12.8 L9.5,12.8","M2.2,3 C2.2,1.2 9.2,1.2 9.2,4 C9.2,6.4 5.5,6.9 5.5,6.9 C5.5,6.9 9.5,7.4 9.5,10.3 C9.5,13.2 2.2,13.2 2.2,10.8","M8,12.8 L8,1.2 L1.8,9 L9.8,9","M9,1.5 L2.6,1.5 L2.6,6.4 C5,5.5 9.4,6.4 9.4,9.8 C9.4,13 3,13.2 2.2,11","M8.5,2.4 C5,0.8 2.2,3.6 2.2,8.4 C2.2,12.4 9,12.8 9,9.4 C9,6.5 2.6,6.5 2.2,8.6","M2.2,1.5 L9.4,1.5 L4.6,12.8","M5.8,6.8 C2.6,6.8 2.6,1.5 5.8,1.5 C9,1.5 9,6.8 5.8,6.8 Z M5.8,6.8 C2.2,6.8 2.2,12.8 5.8,12.8 C9.4,12.8 9.4,6.8 5.8,6.8 Z"],la={groundTopHex:"#FAF2DF",groundMidHex:"#F5E8CA",groundBotHex:"#EAD8B3",gridHex:"#D9A441",chamberFillHex:"#FFFDF7",chamberStrokeHex:"#E5C167",rivetHex:"#D9A441",accentGlowHex:"#FF6B35"},ca=[{idx:0,cx:60,cy:66,w:116,h:126,motifSvg:""},{idx:1,cx:180,cy:66,w:116,h:126,motifSvg:""},{idx:2,cx:300,cy:66,w:116,h:126,motifSvg:""},{idx:3,cx:420,cy:66,w:116,h:126,motifSvg:""},{idx:4,cx:60,cy:198,w:116,h:126,motifSvg:""},{idx:5,cx:180,cy:198,w:116,h:126,motifSvg:""},{idx:6,cx:300,cy:198,w:116,h:126,motifSvg:""},{idx:7,cx:420,cy:198,w:116,h:126,motifSvg:""}];function ce(a,e){return{category:a,architecturalTitle:e,imagePath:xt[a],harmony:la,structuralDraftingSvg:"",chambers:ca}}const At={MEDICINE:ce("MEDICINE","1966 Golden Book Anatomical Cutaways & Vital Valves"),CHEMISTRY:ce("CHEMISTRY","1966 Mid-Century Laboratory Glassware & Retorts"),PHYSICS:ce("PHYSICS","1966 Space & Forces Optical Prism & Pendulum Specimen Board"),GADGETS:ce("GADGETS","1966 Precision Cameras, Optics & Electronics Cutaways"),ENGINES:ce("ENGINES","1966 Great Machines, Turbines & Escapement Cutaways"),LITERATURE:ce("LITERATURE","1966 Bookmaking, Marbled Endpapers & Printing Press"),LEXICON:ce("LEXICON","1966 Typography Mechanics, Matrices & Writing Tools"),"FINE ARTS":ce("FINE ARTS","1966 Classical Architecture, Rose Window & Fine Arts"),SCREEN:ce("SCREEN","1966 Hollywood Cinematography, Technicolor & Multiplane Rig"),JUKEBOX:ce("JUKEBOX","1966 Acoustic & Electric Musical Instrument Mechanisms"),FINANCE:ce("FINANCE","1966 Stock Ticker, Bank Time-Locks & Vault Engineering"),PRICING:ce("PRICING","1966 Mechanical Scales, Cash Registers & Retail Contraptions"),ODDS:ce("ODDS","1966 Monte Carlo Probability, Galton Board & Casino Mechanics"),ATLAS:ce("ATLAS","1966 Marine Navigation, Sextant, Astrolabe & Cartography"),SPORTS:ce("SPORTS","1966 Sports Aerodynamics, Chronographs & Athletic Gear"),DYNASTIES:ce("DYNASTIES","1966 Ancient Empires, Castles & Aqueduct Engineering"),HEADLINES:ce("HEADLINES","1966 Rotary Press, Telegraph & Space Recovery History"),FOLKLORE:ce("FOLKLORE","1966 Myths, Clockwork Automata & Wonder Cabinet"),FALLACIES:ce("FALLACIES","1966 Optical Illusions, Paradoxes & Logic Machines"),CUISINE:ce("CUISINE","1966 Culinary Science, Espresso Pressure & Classic Vessels")};function da(a,e={}){const n=At[a]??At.PHYSICS,t=oa[n.category]??0,h=Ot(n.category,e.assetBaseUrl),p=e.activeZoneIdx??null,b=e.revealedTargetIdx??null,x=e.patentClerkHintIdx??null,o=e.pruneZoneIdx??null,c=e.canaryZoneIdx??null,l=e.uvLoupeActive?e.poisonedZoneIdx??null:null,O=e.className?` ${e.className}`:"",H=`ws8PlateClip${t}`,U=`ws8PlateSheen${t}`,q=n.chambers.map(B=>{const j=Number((B.cx-B.w*.5).toFixed(1)),Y=Number((B.cy-B.h*.5).toFixed(1)),de=p===B.idx,ne=b===B.idx,we=x===B.idx,ee=o===B.idx,Se=c===B.idx,pe=l===B.idx,he=de?"#FFFDF5":ne?"#22C55E":ee?"#FAF2DF":"#FFFFFF",ie=de?"0.42":ne?"0.16":ee?"0.68":"0.001",s=de?"#FFFDF5":ne?"#16A34A":ee?"#D92B3A":"#D9A441",y=de||ne||ee?"1":"0.45",F=de||ne?"3.6":ee?"2.8":"1.4",d=Tt[B.idx]??Tt[0],C=20,R=19,P=Number((j+B.w-C-4).toFixed(1)),N=Number((Y+B.h-R-4).toFixed(1)),_=Number((P+4.2).toFixed(1)),$=Number((N+2.4).toFixed(1)),m=[];return we&&m.push(`<rect x="${j+2}" y="${Y+2}" width="${B.w-4}" height="${B.h-4}" rx="7" fill="none" stroke="#008B94" stroke-width="3" stroke-dasharray="7 4"/>`),ne&&m.push(`<rect x="${j+1.5}" y="${Y+1.5}" width="${B.w-3}" height="${B.h-3}" rx="7" fill="none" stroke="#FFFDF5" stroke-width="1.8"/>`,`<circle cx="${j+B.w-14}" cy="${Y+14}" r="10" fill="#16A34A" stroke="#FFFDF5" stroke-width="2"/>`,`<path d="M${j+B.w-19},${Y+14} L${j+B.w-15.2},${Y+18} L${j+B.w-8.8},${Y+10}" fill="none" stroke="#FFFDF5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),ee&&m.push(`<path d="M${j+12},${Y+12} L${j+B.w-12},${Y+B.h-12} M${j+B.w-12},${Y+12} L${j+12},${Y+B.h-12}" stroke="#D92B3A" stroke-width="4.2" stroke-linecap="round"/>`),Se&&m.push(`<circle cx="${j+B.w-15}" cy="${Y+15}" r="10" fill="#FAF2DF" stroke="#008B94" stroke-width="2.2"/>`,`<path d="M${j+B.w-20},${Y+15} L${j+B.w-16},${Y+19} L${j+B.w-9.5},${Y+10.5}" fill="none" stroke="#008B94" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`),pe&&m.push(`<circle cx="${j+16}" cy="${Y+36}" r="9.5" fill="#6D28D9" stroke="#FAF2DF" stroke-width="1.8"/>`,`<polygon points="${j+16},${Y+30} ${j+21},${Y+36} ${j+16},${Y+42} ${j+11},${Y+36}" fill="#FAF2DF"/>`),de&&m.push(`<rect x="${j+2}" y="${Y+2}" width="${B.w-4}" height="${B.h-4}" rx="7" fill="none" stroke="#FFD166" stroke-width="4"/>`),`<g class="ws7-cyano-chamber${de?" is-iris-flash":""}" data-zone-idx="${B.idx}" data-cx="${B.cx}" data-cy="${B.cy}" data-x0="${j}" data-y0="${Y}" data-w="${B.w}" data-h="${B.h}" role="button" tabindex="0" style="cursor:pointer;"><rect x="${j}" y="${Y}" width="${B.w}" height="${B.h}" rx="6" fill="${he}" fill-opacity="${ie}" stroke="${s}" stroke-opacity="${y}" stroke-width="${F}"/><rect x="${P}" y="${N}" width="${C}" height="${R}" rx="5" fill="#FAF2DF" fill-opacity="0.94" stroke="#8A5A1E" stroke-width="1.4" pointer-events="none"/><g transform="translate(${_},${$})" pointer-events="none"><path d="${d}" fill="none" stroke="#141B29" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>${m.join("")}</g>`}).join("");return`<svg xmlns="http://www.w3.org/2000/svg" class="ws7-cyanotype-svg${O}" data-plate-idx="${t}" viewBox="0 0 480 264" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-height:100%;display:block;touch-action:manipulation;user-select:none;"><defs><clipPath id="${H}"><rect x="0" y="0" width="480" height="264" rx="11"/></clipPath><linearGradient id="${U}" x1="0%" y1="0%" x2="25%" y2="100%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14"/><stop offset="36%" stop-color="#FFFFFF" stop-opacity="0.02"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#${H})"><rect x="0" y="0" width="480" height="264" fill="#FAF2DF"/><image href="${h}" x="0" y="0" width="480" height="264" preserveAspectRatio="none"/><line x1="120" y1="0" x2="120" y2="264" stroke="#D9A441" stroke-width="2.2" stroke-opacity="0.85" pointer-events="none"/><line x1="240" y1="0" x2="240" y2="264" stroke="#D9A441" stroke-width="2.2" stroke-opacity="0.85" pointer-events="none"/><line x1="360" y1="0" x2="360" y2="264" stroke="#D9A441" stroke-width="2.2" stroke-opacity="0.85" pointer-events="none"/><line x1="0" y1="132" x2="480" y2="132" stroke="#D9A441" stroke-width="2.4" stroke-opacity="0.88" pointer-events="none"/><rect x="1" y="1" width="478" height="262" rx="10.5" fill="none" stroke="#D9A441" stroke-width="2.4" pointer-events="none"/><path d="M4,10 Q240,2 476,10 L476,74 Q240,54 4,82 Z" fill="url(#${U})" pointer-events="none"/></g><g class="ws7-cyano-chambers">${q}</g></svg>`}const pa=6371.0088,_e=Math.PI/180,Lt=180/Math.PI;function fe(a,e,n=1){const t=(90-a)*_e,h=(e+180)*_e,p=Math.sin(t),b=-n*p*Math.cos(h),x=n*Math.cos(t),o=n*p*Math.sin(h);return new Ae(b,x,o)}function Mt(a){const e=a.clone().normalize(),n=Math.asin(ge.clamp(e.y,-1,1))*Lt;let t=Math.atan2(e.z,-e.x);t<0&&(t+=Math.PI*2);let h=t*Lt-180;return h>180&&(h-=360),h<-180&&(h+=360),{lat:n,lng:h}}function ha(a,e,n,t){const h=(n-a)*_e,p=(t-e)*_e,b=a*_e,x=n*_e,o=Math.sin(h*.5),c=Math.sin(p*.5),l=o*o+Math.cos(b)*Math.cos(x)*c*c;return 2*pa*Math.asin(Math.min(1,Math.sqrt(Math.max(0,l))))}function ot(a,e){const n=a>=0?"N":"S",t=e>=0?"E":"W";return`${Math.abs(a).toFixed(1)}°${n} ${Math.abs(e).toFixed(1)}°${t}`}const ua=6371.0088,Ht=Math.PI/180,ga=180/Math.PI,Q={fallback:null,albedo:null,bump:null,specular:null,loadingStarted:!1,listeners:[]};function xa(){if(Q.fallback)return Q.fallback;const a=document.createElement("canvas");a.width=256,a.height=128;const e=a.getContext("2d");if(e){const t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"#007799"),t.addColorStop(.5,"#0096A6"),t.addColorStop(1,"#12467e"),e.fillStyle=t,e.fillRect(0,0,256,128)}const n=new ia(a);return n.colorSpace=wt,Q.fallback=n,n}function lt(a,e){if(e)return`${e.replace(/\/$/,"")}/${a}`;const n="./";return`${n.endsWith("/")?n:`${n}/`}assets/textures/v6/${a}`}function ma(a,e,n){if(n&&Q.listeners.push(n),Q.loadingStarted){n&&(Q.albedo||Q.bump)&&n();return}Q.loadingStarted=!0;const t=()=>{for(const p of Q.listeners)p()},h=new ra;h.load(lt("earth_relief_albedo_4k.webp",e),p=>{p.colorSpace=wt,p.anisotropy=a,p.wrapS=it,p.wrapT=rt,p.needsUpdate=!0,Q.albedo=p,t()},void 0,()=>{}),h.load(lt("earth_elevation_bump_2k.webp",e),p=>{p.anisotropy=Math.min(4,a),p.wrapS=it,p.wrapT=rt,Q.bump=p,t()},void 0,()=>{}),h.load(lt("earth_ocean_specular_2k.webp",e),p=>{p.anisotropy=Math.min(4,a),p.wrapS=it,p.wrapT=rt,Q.specular=p,t()},void 0,()=>{})}function wa(a,e){const n=ha(a.lat,a.lng,e.lat,e.lng),t=Math.round(n);return n<=350?{plantedCoord:a,targetCoord:e,distanceKm:t,accuracyRatio:1,chipMultiplier:1.25,tierLabel:"BULLSEYE_350KM"}:n<=900?{plantedCoord:a,targetCoord:e,distanceKm:t,accuracyRatio:.65,chipMultiplier:.85,tierLabel:"NEAR_HIT_900KM"}:n<=1600?{plantedCoord:a,targetCoord:e,distanceKm:t,accuracyRatio:.5,chipMultiplier:.5,tierLabel:"REGIONAL_1600KM"}:{plantedCoord:a,targetCoord:e,distanceKm:t,accuracyRatio:0,chipMultiplier:0,tierLabel:"OFF_COURSE"}}function fa(a){const e=new ta(a);e.compileEquirectangularShader();const n=new $t;n.background=new gt(728627);const t=new tt(6,24,16),h=new at({color:16771256,side:Nt}),p=new me(t,h);p.scale.set(1,.35,1),p.position.set(3.5,6.5,4),n.add(p);const b=new Ne(8.5,.9,12,36),x=new at({color:16037444}),o=new me(b,x);o.rotation.x=Math.PI*.42,n.add(o);const c=new aa(9.5,9.5,2.6,24,1,!0),l=new at({color:39856,side:_t}),O=new me(c,l);O.position.y=-2.8,n.add(O);const H=e.fromScene(n,.032);return t.dispose(),h.dispose(),b.dispose(),x.dispose(),c.dispose(),l.dispose(),e.dispose(),H}function Dt(a,e,n){const t=new sa(new Uint8Array([a,e,n,255]),1,1,na);return t.needsUpdate=!0,t}const zt=38,ba=1.19;function ct(a){const e=Math.tan(zt*.5*Ht),n=ge.clamp(Number.isFinite(a)?a:1.35,.48,3.2),h=Math.min(e,e*n)*.84,p=ba*Math.sqrt(1+1/(h*h));return ge.clamp(p,3.75,5.6)}class ya{hostEl;stageEl;coordBadgeEl;statusBadgeEl;options;renderer;pmremTarget;scene;camera;globeRoot;earthMesh;earthMaterial;overlayGroup;cradleGroup;keyLight;raycaster=new Ut;resizeObserver;disposableGeometries=[];disposableMaterials=[];disposableTextures=[];textureListener;livingColorUniforms;camLatDeg=20;camLngDeg=10;camDistance=4.28;targetDistance=4.28;maxZoomDistance=5.6;velLat=0;velLng=0;userHasInteracted=!1;flyTween=null;activePointers=new Map;primaryPointerId=null;pointerDownX=0;pointerDownY=0;pointerDownMs=0;pointerMovedPx=0;lastDragX=0;lastDragY=0;lastPinchDist=0;plantedCoord=null;ivoryPinGroup=null;ivoryPinDropProgress=1;confirmRingShaderMat=null;confirmElapsedMs=0;confirmLockMs;isConfirming=!1;isLocked=!1;lockResolvedSent=!1;postLockElapsedMs=0;revealDwellMs;pendingResult=null;geodesicRingsMat=null;geodesicArcMesh=null;geodesicArcTotalIndices=0;geodesicArcProgress=0;rafId=0;lastFrameMs=0;elapsedSec=0;disposed=!1;constructor(e,n){this.hostEl=e,this.options=n,this.confirmLockMs=Math.max(80,n.confirmLockMs??280),this.revealDwellMs=Math.max(120,n.revealDwellMs??380),n.initialFocus?(this.camLatDeg=ge.clamp(n.initialFocus.lat,-75,75),this.camLngDeg=n.initialFocus.lng):(this.camLatDeg=ge.clamp(n.targetLat*.55+10,-68,68),this.camLngDeg=((n.targetLng+26+180)%360+360)%360-180),this.stageEl=document.createElement("div"),this.stageEl.className="ws7-relief-globe-stage",this.stageEl.style.cssText=["position:relative","width:100%","height:100%","min-height:192px","max-height:100%","border-radius:14px","overflow:hidden","background:radial-gradient(ellipse at 50% 48%, #153c61 0%, #0d2540 56%, #08182b 100%)","box-shadow:inset 0 0 26px rgba(0,168,184,0.22), 0 6px 18px rgba(5,14,26,0.42)","border:2px solid rgba(242,169,34,0.52)","box-sizing:border-box","touch-action:none","user-select:none"].join(";"),this.hostEl.appendChild(this.stageEl),this.coordBadgeEl=document.createElement("div"),this.coordBadgeEl.className="ws7-globe-coord-pill",this.coordBadgeEl.style.cssText=["position:absolute","top:8px","left:8px","padding:3px 9px","border-radius:999px","background:rgba(10,27,46,0.9)","border:1px solid rgba(242,169,34,0.45)","color:#FFF6E3","font:700 14px/1.2 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif","font-variant-numeric:tabular-nums","letter-spacing:0.02em","box-shadow:0 2px 8px rgba(0,0,0,0.34)","pointer-events:none","z-index:2"].join(";"),this.coordBadgeEl.textContent=ot(this.camLatDeg,this.camLngDeg),this.stageEl.appendChild(this.coordBadgeEl),this.statusBadgeEl=document.createElement("div"),this.statusBadgeEl.className="ws7-globe-status-pill",this.statusBadgeEl.style.cssText=["position:absolute","top:8px","right:8px","max-width:54%","padding:3px 9px","border-radius:999px","background:linear-gradient(180deg, #00B2C4 0%, #007E8C 100%)","color:#FFFDF7","font:800 14px/1.2 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif","letter-spacing:0.015em","text-align:center","box-shadow:0 2px 0 #00525E, 0 4px 10px rgba(0,0,0,0.32)","pointer-events:none","z-index:2"].join(";"),this.statusBadgeEl.textContent="DRAG · TAP",this.stageEl.appendChild(this.statusBadgeEl),this.renderer=new Kt({antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2.25)),this.renderer.outputColorSpace=wt,this.renderer.toneMapping=qt,this.renderer.toneMappingExposure=1.16,this.renderer.setClearColor(728627,0),this.renderer.domElement.style.cssText="width:100%;height:100%;display:block;touch-action:none;cursor:grab;",this.stageEl.appendChild(this.renderer.domElement);const t=this.renderer.getContext();let h=null;if(t&&!t.isContextLost())try{h=fa(this.renderer)}catch{h=null}this.pmremTarget=h,this.scene=new $t,this.scene.environment=this.pmremTarget?this.pmremTarget.texture:null;const p=Math.max(160,this.stageEl.clientWidth||340),b=Math.max(160,this.stageEl.clientHeight||220),x=p/b;this.camera=new jt(zt,x,.1,36),this.renderer.setSize(p,b,!1);const o=ct(x);this.camDistance=o,this.targetDistance=o,this.maxZoomDistance=Math.max(5.6,o*1.35);const c=new Wt(16775142,1062488,1.05);this.scene.add(c),this.keyLight=new Et(16774366,2.35),this.keyLight.position.set(4.5,3.2,5.2),this.scene.add(this.keyLight);const l=new Et(3856622,1.3);l.position.set(-4.5,-1.5,-3.8),this.scene.add(l),this.globeRoot=new Je,this.scene.add(this.globeRoot),this.overlayGroup=new Je,this.globeRoot.add(this.overlayGroup);const O=Dt(255,255,255),H=Dt(90,90,90);this.disposableTextures.push(O,H),this.livingColorUniforms={uOceanMaskMap:{value:Q.specular??O},uElevBumpMap:{value:Q.bump??H},uHasLivingColorMap:{value:Q.albedo?1:0},uHasOceanMask:{value:Q.specular?1:0},uHasElevBump:{value:Q.bump?1:0}};const U=new tt(1,112,84);this.disposableGeometries.push(U),this.earthMaterial=new ze({map:Q.albedo??xa(),bumpMap:Q.bump??null,bumpScale:.042,specularIntensityMap:Q.specular??null,clearcoatMap:Q.specular??null,roughness:.66,metalness:.04,clearcoat:.5,clearcoatRoughness:.22,envMapIntensity:.48,specularIntensity:.85,specularColor:new gt(10216959)}),this.earthMaterial.onBeforeCompile=B=>{B.uniforms.uOceanMaskMap=this.livingColorUniforms.uOceanMaskMap,B.uniforms.uElevBumpMap=this.livingColorUniforms.uElevBumpMap,B.uniforms.uHasLivingColorMap=this.livingColorUniforms.uHasLivingColorMap,B.uniforms.uHasOceanMask=this.livingColorUniforms.uHasOceanMask,B.uniforms.uHasElevBump=this.livingColorUniforms.uHasElevBump,B.fragmentShader=B.fragmentShader.replace("#include <map_pars_fragment>",`#include <map_pars_fragment>
          uniform sampler2D uOceanMaskMap;
          uniform sampler2D uElevBumpMap;
          uniform float uHasLivingColorMap;
          uniform float uHasOceanMask;
          uniform float uHasElevBump;`).replace("#include <map_fragment>",`#ifdef USE_MAP
            vec4 sampledDiffuseColor = texture2D( map, vMapUv );
            if (uHasLivingColorMap > 0.5) {
              vec3 sat = pow(max(sampledDiffuseColor.rgb, vec3(0.0001)), vec3(1.0 / 2.2));
              float oceanSample = uHasOceanMask > 0.5
                ? texture2D(uOceanMaskMap, vMapUv).r
                : clamp((sat.b - sat.r) * 3.5, 0.0, 1.0);
              float oceanMask = smoothstep(0.32, 0.62, oceanSample);
              float elev = uHasElevBump > 0.5
                ? texture2D(uElevBumpMap, vMapUv).r
                : clamp((sat.r + sat.g) * 0.5, 0.0, 1.0);
              float satLum = dot(sat, vec3(0.299, 0.587, 0.114));
              float satMax = max(sat.r, max(sat.g, sat.b));
              float satMin = min(sat.r, min(sat.g, sat.b));
              float chroma = satMax - satMin;

              // Peacock Teal & Mid-Century Turquoise Bathymetry Oceans
              float shelf = clamp((satLum - 0.11) * 3.2, 0.0, 1.0);
              vec3 deepPeacock = vec3(0.04, 0.43, 0.58);
              vec3 midTurquoise = vec3(0.11, 0.67, 0.77);
              vec3 shallowAqua = vec3(0.34, 0.85, 0.89);
              vec3 oceanRgb = mix(deepPeacock, midTurquoise, smoothstep(0.05, 0.62, shelf));
              oceanRgb = mix(oceanRgb, shallowAqua, smoothstep(0.55, 1.0, shelf) * 0.62);

              float coastHalo = smoothstep(0.0, 0.45, oceanMask) * (1.0 - smoothstep(0.55, 1.0, oceanMask));

              // Sunlit 1966 Rand McNally Classroom Relief Continents (Harvest Gold, Sage Cream & Terracotta Peaks)
              float dryness = clamp((sat.r - sat.g) * 3.6 + 0.44, 0.0, 1.0);
              float iceMask = smoothstep(0.68, 0.86, satLum) * (1.0 - smoothstep(0.08, 0.22, chroma));
              vec3 sageLowland = vec3(0.80, 0.85, 0.58);
              vec3 warmParchment = vec3(0.94, 0.85, 0.59);
              vec3 harvestGold = vec3(0.96, 0.74, 0.35);
              vec3 sierraRelief = vec3(0.85, 0.53, 0.26);
              vec3 polarIvory = vec3(0.97, 0.95, 0.89);

              vec3 landRgb = mix(sageLowland, warmParchment, smoothstep(0.18, 0.60, dryness));
              landRgb = mix(landRgb, harvestGold, smoothstep(0.55, 0.92, dryness));
              landRgb = mix(landRgb, sierraRelief, smoothstep(0.36, 0.80, elev) * 0.76);
              landRgb = mix(landRgb, polarIvory, iceMask);
              landRgb = mix(landRgb, vec3(0.45, 0.33, 0.16), coastHalo * 0.34);

              vec3 gradedSrgb = mix(landRgb, oceanRgb + vec3(0.16, 0.22, 0.20) * coastHalo * 0.55, oceanMask);
              sampledDiffuseColor.rgb = pow(clamp(gradedSrgb, vec3(0.0), vec3(1.0)), vec3(2.2));
            }
            diffuseColor *= sampledDiffuseColor;
          #endif`)},this.earthMaterial.customProgramCacheKey=()=>"rand-mcnally-1966-living-color-v1",this.disposableMaterials.push(this.earthMaterial),this.earthMesh=new me(U,this.earthMaterial),this.earthMesh.name="ReliefGlobeEarthV7",this.globeRoot.add(this.earthMesh),this.buildRayleighAtmosphere(),this.buildSubtleGraticule(),this.cradleGroup=this.buildC1FilletedBrassCradle(),this.scene.add(this.cradleGroup);const q=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());this.textureListener=()=>{this.disposed||this.renderer.getContext()?.isContextLost?.()||(Q.albedo&&(this.earthMaterial.map=Q.albedo,this.livingColorUniforms.uHasLivingColorMap.value=1),Q.bump&&(this.earthMaterial.bumpMap=Q.bump,this.livingColorUniforms.uElevBumpMap.value=Q.bump,this.livingColorUniforms.uHasElevBump.value=1),Q.specular&&(this.earthMaterial.specularIntensityMap=Q.specular,this.earthMaterial.clearcoatMap=Q.specular,this.livingColorUniforms.uOceanMaskMap.value=Q.specular,this.livingColorUniforms.uHasOceanMask.value=1),this.earthMaterial.needsUpdate=!0)},ma(q,n.textureBasePath,this.textureListener),this.bindEvents(),this.resizeObserver=new ResizeObserver(()=>this.handleResize()),this.resizeObserver.observe(this.stageEl),this.updateCameraTransform(),this.lastFrameMs=performance.now(),this.rafId=requestAnimationFrame(this.tick)}buildRayleighAtmosphere(){const e=new tt(1.058,56,40);this.disposableGeometries.push(e);const n=new nt({uniforms:{uColor:{value:new gt(5092863)}},vertexShader:`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,fragmentShader:`
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = clamp(0.65 - dot(vNormal, vViewDir), 0.0, 1.0);
          float glow = pow(rim, 2.7) * 1.1;
          gl_FragColor = vec4(uColor * 1.12, glow * 0.65);
        }
      `,side:Nt,blending:Vt,transparent:!0,depthWrite:!1});this.disposableMaterials.push(n),this.globeRoot.add(new me(e,n))}buildSubtleGraticule(){const n=[],t=[];for(const o of[-66.5,-23.5,0,23.5,66.5]){const l=o===0?n:t;for(let O=0;O<96;O++){const H=fe(o,-180+O/96*360,1.003),U=fe(o,-180+(O+1)/96*360,1.003);l.push(H.x,H.y,H.z,U.x,U.y,U.z)}}for(let o=-60;o<=60;o+=30){if(o===0)continue;const c=84;for(let l=0;l<c;l++){const O=fe(o,-180+l/c*360,1.003),H=fe(o,-180+(l+1)/c*360,1.003);t.push(O.x,O.y,O.z,H.x,H.y,H.z)}}for(let o=-180;o<180;o+=30){const l=o===0||o===-180?n:t;for(let O=0;O<56;O++){const H=fe(-80+O/56*160,o,1.003),U=fe(-80+(O+1)/56*160,o,1.003);l.push(H.x,H.y,H.z,U.x,U.y,U.z)}}const h=new vt;h.setAttribute("position",new kt(t,3));const p=new vt;p.setAttribute("position",new kt(n,3)),this.disposableGeometries.push(h,p);const b=new Ct({color:16773577,transparent:!0,opacity:.28,depthWrite:!1}),x=new Ct({color:16766315,transparent:!0,opacity:.52,depthWrite:!1});this.disposableMaterials.push(b,x),this.globeRoot.add(new St(h,b),new St(p,x))}buildC1FilletedBrassCradle(){const e=new Je,n=new ze({color:16041556,metalness:.94,roughness:.18,clearcoat:.62,clearcoatRoughness:.12,envMapIntensity:1.55}),t=new ze({color:11961902,metalness:.9,roughness:.28,clearcoat:.4,envMapIntensity:1.25});this.disposableMaterials.push(n,t);const h=new Ne(1.112,.02,24,144),p=new Ne(1.09,.0075,16,144),b=new Ne(1.132,.007,16,144);this.disposableGeometries.push(h,p,b),e.add(new me(h,n)),e.add(new me(p,t)),e.add(new me(b,t));const x=new Qe(.0038,.015,4,8),o=new Qe(.006,.024,6,12),c=new Qe(.0088,.034,8,14);this.disposableGeometries.push(x,o,c);for(let q=0;q<360;q+=5){const B=q*Ht,j=q%30===0,Y=!j&&q%15===0,de=new me(j?c:Y?o:x,j?n:t),ne=j?1.118:1.112;de.position.set(Math.cos(B)*ne,Math.sin(B)*ne,0),de.rotation.z=B+Math.PI*.5,e.add(de)}const l=[new Te(0,0),new Te(.018,.006),new Te(.019,.075),new Te(.032,.098),new Te(.022,.122),new Te(.034,.145),new Te(.02,.166),new Te(0,.176)],O=new Xt(l,24);this.disposableGeometries.push(O);for(const q of[1,-1]){const B=new me(O,n);B.position.set(0,q*1.006,0),q<0&&(B.rotation.z=Math.PI),e.add(B)}const H=new Ne(1.164,.013,18,72,Math.PI*.62);this.disposableGeometries.push(H);const U=new me(H,t);return U.rotation.z=-Math.PI*.81,e.add(U),e}createIvoryBrassPushpin(e=!1){const n=new Je,t=new ze({color:e?16766298:14661728,metalness:.92,roughness:.2,clearcoat:.5,envMapIntensity:1.3}),h=new ze({color:e?16770170:16446435,emissive:e?10251020:3879458,emissiveIntensity:e?.45:.22,roughness:.18,metalness:e?.55:.04,clearcoat:.92,clearcoatRoughness:.1});this.disposableMaterials.push(t,h);const p=new Zt(.011,.082,16),b=new Ne(.019,.006,12,24),x=new Qe(.028,.012,10,20);this.disposableGeometries.push(p,b,x);const o=new me(p,t);o.rotation.x=Math.PI,o.position.y=.041,n.add(o);const c=new me(b,t);c.rotation.x=Math.PI*.5,c.position.y=.084,n.add(c);const l=new me(x,h);if(l.scale.set(1.12,.78,1.12),l.position.y=.112,n.add(l),!e){const O=new Jt(.16,.16);this.disposableGeometries.push(O);const H=new nt({uniforms:{uProgress:{value:0}},vertexShader:`
          varying vec2 vUv;
          void main() {
            vUv = uv * 2.0 - 1.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform float uProgress;
          varying vec2 vUv;
          void main() {
            float r = length(vUv);
            float aa = fwidth(r);
            float band = smoothstep(0.56 - aa, 0.56 + aa, r) * (1.0 - smoothstep(0.86 - aa, 0.86 + aa, r));
            if (band <= 0.001) discard;
            float ang = atan(vUv.x, vUv.y); // -PI..PI, 0 at top
            float normAng = fract(ang / 6.2831853 + 1.0);
            float filled = 1.0 - smoothstep(uProgress - 0.02, uProgress + 0.02, normAng);
            vec3 trackCol = vec3(0.96, 0.93, 0.86);
            vec3 fillCol = vec3(0.98, 0.82, 0.32);
            vec3 col = mix(trackCol * 0.35, fillCol, filled);
            float alpha = band * mix(0.32, 0.98, filled);
            gl_FragColor = vec4(col, alpha);
          }
        `,transparent:!0,side:_t,depthWrite:!1});this.disposableMaterials.push(H),this.confirmRingShaderMat=H;const U=new me(O,H);U.rotation.x=-Math.PI*.5,U.position.y=.005,n.add(U)}return n}orientToSurface(e,n,t){e.position.copy(n).multiplyScalar(t),e.quaternion.setFromUnitVectors(new Ae(0,1,0),n)}plantPin(e,n){if(this.isLocked||this.disposed)return;this.plantedCoord={lat:e,lng:n};const t=fe(e,n,1).normalize();this.ivoryPinGroup||(this.ivoryPinGroup=this.createIvoryBrassPushpin(!1),this.overlayGroup.add(this.ivoryPinGroup)),this.orientToSurface(this.ivoryPinGroup,t,1.13),this.ivoryPinDropProgress=0,this.confirmElapsedMs=0,this.isConfirming=!0,this.confirmRingShaderMat&&(this.confirmRingShaderMat.uniforms.uProgress.value=0),this.coordBadgeEl.textContent=`PIN ${ot(e,n)}`,this.statusBadgeEl.textContent="LOCKING STUDIO PIN!",this.statusBadgeEl.style.background="linear-gradient(180deg, #F4A91F 0%, #D48806 100%)",this.statusBadgeEl.style.color="#141B29",this.options.onPinPlanted&&this.options.onPinPlanted({lat:e,lng:n})}finalizeLockAndReveal(){if(this.disposed||this.renderer.getContext()?.isContextLost?.()||this.isLocked||!this.plantedCoord)return;this.isLocked=!0,this.isConfirming=!1;const e=this.options.targetLat,n=this.options.targetLng,t=fe(e,n,1).normalize(),h=this.createIvoryBrassPushpin(!0);h.scale.setScalar(1.12),this.orientToSurface(h,t,1.002),this.overlayGroup.add(h);const p=Math.abs(t.y)<.9?new Ae(0,1,0):new Ae(1,0,0),b=new Ae().crossVectors(p,t).normalize(),x=new Ae().crossVectors(t,b).normalize(),o=new tt(1.0055,112,84);this.disposableGeometries.push(o),this.geodesicRingsMat=new nt({uniforms:{uTargetDir:{value:t.clone()},uTangentU:{value:b},uTangentV:{value:x},uEarthRadiusKm:{value:ua},uTime:{value:0}},vertexShader:`
        varying vec3 vUnitPos;
        void main() {
          vUnitPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec3 uTargetDir;
        uniform vec3 uTangentU;
        uniform vec3 uTangentV;
        uniform float uEarthRadiusKm;
        uniform float uTime;
        varying vec3 vUnitPos;

        void main() {
          float cosTheta = clamp(dot(normalize(vUnitPos), uTargetDir), -1.0, 1.0);
          float km = acos(cosTheta) * uEarthRadiusKm;
          if (km > 1750.0) discard;

          float dKm = max(fwidth(km), 3.5);
          float az = atan(dot(vUnitPos, uTangentV), dot(vUnitPos, uTangentU));
          float dAz = max(fwidth(az), 0.008);

          // A) Dashed Gold 350 KM (1.0x Bullseye) Geodesic Ring — 20 crisp dashes
          float dist350 = abs(km - 350.0);
          float ring350 = 1.0 - smoothstep(dKm * 0.95, dKm * 2.15, dist350);
          float dashWave = cos(az * 20.0 - uTime * 1.6);
          float dashMask = smoothstep(-0.15 - dAz * 6.0, 0.15 + dAz * 6.0, dashWave);
          float goldAlpha = ring350 * dashMask;
          float goldFill = (1.0 - smoothstep(350.0 - dKm, 350.0 + dKm, km)) * 0.14;

          // B) Ticked Sky-Cyan 900 KM (0.65x Near-Hit) Geodesic Ring — hairline + 36 compass ticks
          float dist900 = abs(km - 900.0);
          float base900 = 1.0 - smoothstep(dKm * 0.8, dKm * 1.9, dist900);
          float tickWave = cos(az * 36.0);
          float tickAngular = smoothstep(0.82 - dAz * 10.0, 0.92 + dAz * 10.0, tickWave);
          float tickRadial = 1.0 - smoothstep(dKm * 3.2, dKm * 4.8, abs(km - 900.0));
          float cyanAlpha = clamp(base900 * 0.88 + tickAngular * tickRadial * 0.95, 0.0, 1.0);

          // C) Subtle 1600 KM Partial-Credit Outer Horizon Hairline
          float ring1600 = (1.0 - smoothstep(dKm * 0.7, dKm * 1.7, abs(km - 1600.0))) * 0.42;

          vec3 goldCol = vec3(1.0, 0.835, 0.32);   // #FFD552 Dashed Gold
          vec3 cyanCol = vec3(0.28, 0.86, 1.0);    // #47DCFF Ticked Sky-Cyan
          vec3 amberCol = vec3(0.92, 0.62, 0.24);

          float outAlpha = max(max(goldAlpha, goldFill), max(cyanAlpha, ring1600));
          if (outAlpha < 0.01) discard;

          vec3 outCol = goldCol * max(goldAlpha, goldFill);
          outCol = mix(outCol, cyanCol, cyanAlpha * (1.0 - goldAlpha));
          outCol = mix(outCol, amberCol, ring1600 * (1.0 - max(goldAlpha, cyanAlpha)));

          gl_FragColor = vec4(outCol, clamp(outAlpha, 0.0, 0.96));
        }
      `,transparent:!0,depthWrite:!1}),this.disposableMaterials.push(this.geodesicRingsMat),this.overlayGroup.add(new me(o,this.geodesicRingsMat)),this.buildGreatCircleArc(this.plantedCoord.lat,this.plantedCoord.lng,e,n);const c=wa(this.plantedCoord,{lat:e,lng:n});this.pendingResult=c,this.postLockElapsedMs=0;const O=fe(this.plantedCoord.lat,this.plantedCoord.lng,1).normalize().clone().add(t),H=O.lengthSq()>.001?Mt(O.normalize()):{lat:e,lng:n},U=ct(this.camera.aspect),q=ge.clamp(U*.86+c.distanceKm/9500*1.15,2.65,this.maxZoomDistance);this.flyTo(H.lat,H.lng,q,this.options.reducedMotion?.15:.34),c.tierLabel==="BULLSEYE_350KM"?(this.statusBadgeEl.textContent=`${c.distanceKm} KM · BULLSEYE! (1.25×)`,this.statusBadgeEl.style.background="linear-gradient(180deg, #16A34A 0%, #117A37 100%)",this.statusBadgeEl.style.color="#FFFDF7"):c.tierLabel==="NEAR_HIT_900KM"?(this.statusBadgeEl.textContent=`${c.distanceKm} KM · CLOSE HIT! (0.85×)`,this.statusBadgeEl.style.background="linear-gradient(180deg, #0096A6 0%, #006E7A 100%)",this.statusBadgeEl.style.color="#FFFDF7"):c.tierLabel==="REGIONAL_1600KM"?(this.statusBadgeEl.textContent=`${c.distanceKm} KM · REGIONAL HIT (0.50×)`,this.statusBadgeEl.style.background="linear-gradient(180deg, #F4A91F 0%, #C9820A 100%)",this.statusBadgeEl.style.color="#141B29"):(this.statusBadgeEl.textContent=`${c.distanceKm} KM OFF TARGET`,this.statusBadgeEl.style.background="linear-gradient(180deg, #E03E36 0%, #A8251E 100%)",this.statusBadgeEl.style.color="#FFFDF7")}buildGreatCircleArc(e,n,t,h){const p=fe(e,n,1).normalize(),b=fe(t,h,1).normalize(),x=Math.acos(ge.clamp(p.dot(b),-1,1)),o=Math.min(.28,.04+x/Math.PI*.25),c=[],l=56;for(let q=0;q<=l;q++){const B=q/l;let j;if(x<.001)j=p.clone();else if(Math.PI-x<.01){const Y=Math.abs(p.y)<.9?new Ae(0,1,0):new Ae(1,0,0),de=new Ae().crossVectors(p,Y).normalize();j=p.clone().multiplyScalar(Math.cos(Math.PI*B)).add(de.multiplyScalar(Math.sin(Math.PI*B)))}else{const Y=Math.sin(x);j=p.clone().multiplyScalar(Math.sin((1-B)*x)/Y).add(b.clone().multiplyScalar(Math.sin(B*x)/Y)).normalize()}c.push(j.multiplyScalar(1.008+Math.sin(Math.PI*B)*o))}const O=new Qt(c),H=new ea(O,56,.0085,8,!1);this.disposableGeometries.push(H);const U=new at({color:16769149,transparent:!0,opacity:.96});this.disposableMaterials.push(U),this.geodesicArcMesh=new me(H,U),this.geodesicArcTotalIndices=H.index?H.index.count:0,this.geodesicArcProgress=0,this.geodesicArcTotalIndices>0&&H.setDrawRange(0,0),this.overlayGroup.add(this.geodesicArcMesh)}flyTo(e,n,t=this.camDistance,h=.5){const p=this.camLngDeg,b=(n-p+540)%360-180;this.velLat=0,this.velLng=0,this.flyTween={startLat:this.camLatDeg,startLng:p,startDist:this.camDistance,endLat:ge.clamp(e,-76,76),endLng:p+b,endDist:ge.clamp(t,2.15,this.maxZoomDistance),elapsed:0,duration:Math.max(.1,h)},this.targetDistance=this.flyTween.endDist}bindEvents(){const e=this.renderer.domElement;e.addEventListener("pointerdown",this.onPointerDown),e.addEventListener("pointermove",this.onPointerMove),e.addEventListener("pointerup",this.onPointerUp),e.addEventListener("pointercancel",this.onPointerUp),e.addEventListener("wheel",this.onWheel,{passive:!1}),e.addEventListener("webglcontextlost",this.onContextLost)}onContextLost=e=>{e.preventDefault(),this.dispose()};onPointerDown=e=>{if(this.isLocked||this.disposed)return;const n=this.renderer.domElement;try{n.setPointerCapture(e.pointerId)}catch{}this.activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.userHasInteracted=!0,this.flyTween=null,this.activePointers.size===1?(this.primaryPointerId=e.pointerId,this.pointerDownX=e.clientX,this.pointerDownY=e.clientY,this.pointerDownMs=performance.now(),this.pointerMovedPx=0,this.lastDragX=e.clientX,this.lastDragY=e.clientY,this.velLat=0,this.velLng=0,n.style.cursor="grabbing"):this.activePointers.size===2&&(this.primaryPointerId=null,this.lastPinchDist=this.getPinchDistance())};onPointerMove=e=>{if(!(!this.activePointers.has(e.pointerId)||this.isLocked)){if(this.activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.activePointers.size===2){const n=this.getPinchDistance();if(this.lastPinchDist>1&&n>1){const t=this.lastPinchDist/n;this.targetDistance=ge.clamp(this.targetDistance*Math.pow(t,.9),2.15,this.maxZoomDistance)}this.lastPinchDist=n,this.pointerMovedPx=999;return}if(e.pointerId===this.primaryPointerId){const n=e.clientX-this.lastDragX,t=e.clientY-this.lastDragY;this.lastDragX=e.clientX,this.lastDragY=e.clientY,this.pointerMovedPx+=Math.hypot(n,t);const p=.28*((this.camDistance-1)/1.85),b=-n*p,x=t*p;this.camLngDeg=this.normalizeLng(this.camLngDeg+b),this.camLatDeg=ge.clamp(this.camLatDeg+x,-76,76),this.velLng=b*.84,this.velLat=x*.84,this.updateCameraTransform()}}};onPointerUp=e=>{const n=this.renderer.domElement;try{n.hasPointerCapture(e.pointerId)&&n.releasePointerCapture(e.pointerId)}catch{}const t=e.pointerId===this.primaryPointerId;if(this.activePointers.delete(e.pointerId),this.activePointers.size===0){this.primaryPointerId=null,n.style.cursor=this.isLocked?"default":"grab";const h=performance.now()-this.pointerDownMs,p=Math.hypot(e.clientX-this.pointerDownX,e.clientY-this.pointerDownY);if(t&&!this.isLocked&&p<12&&this.pointerMovedPx<16&&h<450){const b=this.raycastSphere(e.clientX,e.clientY);b&&(this.velLat=0,this.velLng=0,this.plantPin(b.lat,b.lng))}}else if(this.activePointers.size===1){const[h,p]=Array.from(this.activePointers.entries())[0];this.primaryPointerId=h,this.lastDragX=p.x,this.lastDragY=p.y}};onWheel=e=>{if(e.preventDefault(),this.isLocked)return;this.userHasInteracted=!0,this.flyTween=null;const n=e.deltaY>0?1.09:.92;this.targetDistance=ge.clamp(this.targetDistance*n,2.15,this.maxZoomDistance)};getPinchDistance(){const e=Array.from(this.activePointers.values());return e.length<2?0:Math.hypot(e[1].x-e[0].x,e[1].y-e[0].y)}raycastSphere(e,n){const t=this.renderer.domElement.getBoundingClientRect();if(t.width<=0||t.height<=0)return null;const h=new Te((e-t.left)/t.width*2-1,-((n-t.top)/t.height*2-1));this.raycaster.setFromCamera(h,this.camera);const p=this.raycaster.intersectObject(this.earthMesh,!1);if(p.length===0)return null;const b=this.earthMesh.worldToLocal(p[0].point.clone());return Mt(b)}normalizeLng(e){let n=((e+180)%360+360)%360-180;return n===-180&&e>0&&(n=180),n}updateCameraTransform(){const e=fe(this.camLatDeg,this.camLngDeg,this.camDistance);this.camera.position.copy(e),this.camera.lookAt(0,0,0),this.cradleGroup.quaternion.copy(this.camera.quaternion);const n=fe(ge.clamp(this.camLatDeg+25,-75,75),this.normalizeLng(this.camLngDeg+36),6.5);this.keyLight.position.copy(n),this.plantedCoord||(this.coordBadgeEl.textContent=ot(this.camLatDeg,this.camLngDeg))}handleResize(){if(this.disposed||!this.stageEl.isConnected)return;const e=this.renderer.getContext();if(!e||e.isContextLost())return;const n=Math.max(120,this.stageEl.clientWidth),t=Math.max(120,this.stageEl.clientHeight),h=n/t;this.camera.aspect=h,this.camera.updateProjectionMatrix(),this.renderer.setSize(n,t,!1);const p=ct(h);this.maxZoomDistance=Math.max(5.6,p*1.35),!this.userHasInteracted&&!this.isLocked&&(this.camDistance=p,this.targetDistance=p,this.updateCameraTransform())}tick=e=>{if(this.disposed)return;if(!this.stageEl.isConnected||!this.hostEl.isConnected){this.dispose();return}const n=this.renderer.getContext();if(!n||n.isContextLost()){this.dispose();return}const t=Math.min(.05,Math.max(.001,(e-this.lastFrameMs)/1e3));this.lastFrameMs=e,this.elapsedSec+=t;let h=!1;if(this.flyTween){this.flyTween.elapsed+=t;const b=Math.min(1,this.flyTween.elapsed/this.flyTween.duration),x=1-Math.pow(1-b,3);this.camLatDeg=ge.lerp(this.flyTween.startLat,this.flyTween.endLat,x),this.camLngDeg=this.normalizeLng(ge.lerp(this.flyTween.startLng,this.flyTween.endLng,x)),this.camDistance=ge.lerp(this.flyTween.startDist,this.flyTween.endDist,x),this.targetDistance=this.camDistance,b>=1&&(this.flyTween=null),h=!0}else if(this.activePointers.size===0)if(Math.abs(this.velLng)>.004||Math.abs(this.velLat)>.004){const b=Math.pow(.9,t*60);this.camLngDeg=this.normalizeLng(this.camLngDeg+this.velLng),this.camLatDeg=ge.clamp(this.camLatDeg+this.velLat,-76,76),this.velLng*=b,this.velLat*=b,h=!0}else!this.userHasInteracted&&!this.isConfirming&&!this.isLocked&&!this.options.reducedMotion&&(this.camLngDeg=this.normalizeLng(this.camLngDeg+.035*ga*t),h=!0);if(Math.abs(this.camDistance-this.targetDistance)>.001&&(this.camDistance=ge.lerp(this.camDistance,this.targetDistance,Math.min(1,t*10)),h=!0),h&&this.updateCameraTransform(),this.ivoryPinGroup&&this.plantedCoord&&this.ivoryPinDropProgress<1){this.ivoryPinDropProgress=Math.min(1,this.ivoryPinDropProgress+t*6);const b=fe(this.plantedCoord.lat,this.plantedCoord.lng,1).normalize(),x=1.001+(1-this.ivoryPinDropProgress)*.12;this.orientToSurface(this.ivoryPinGroup,b,x)}if(this.isConfirming&&!this.isLocked){this.confirmElapsedMs+=t*1e3;const b=Math.min(1,this.confirmElapsedMs/this.confirmLockMs);this.confirmRingShaderMat&&(this.confirmRingShaderMat.uniforms.uProgress.value=b),b>=1&&this.finalizeLockAndReveal()}if(this.isLocked&&(this.geodesicRingsMat&&(this.geodesicRingsMat.uniforms.uTime.value=this.elapsedSec),this.geodesicArcMesh&&this.geodesicArcTotalIndices>0&&this.geodesicArcProgress<1&&(this.geodesicArcProgress=Math.min(1,this.geodesicArcProgress+t*3.4),this.geodesicArcMesh.geometry.setDrawRange(0,Math.floor(this.geodesicArcProgress*this.geodesicArcTotalIndices))),!this.lockResolvedSent&&this.pendingResult&&(this.postLockElapsedMs+=t*1e3,this.postLockElapsedMs>=this.revealDwellMs&&(this.lockResolvedSent=!0,this.options.onLock?.(this.pendingResult)))),this.disposed||!this.stageEl.isConnected)return;const p=this.renderer.getContext();if(!p||p.isContextLost()){this.dispose();return}try{this.renderer.render(this.scene,this.camera)}catch{this.dispose();return}this.disposed||(this.rafId=requestAnimationFrame(this.tick))};renderFrameNow(){if(this.disposed||!this.stageEl.isConnected)return;const e=this.renderer.getContext();if(!(!e||e.isContextLost()))try{this.renderer.render(this.scene,this.camera)}catch{this.dispose()}}dispose(){if(this.disposed)return;this.disposed=!0,cancelAnimationFrame(this.rafId),this.resizeObserver.disconnect();const e=Q.listeners.indexOf(this.textureListener);e>=0&&Q.listeners.splice(e,1);const n=this.renderer.domElement;n.removeEventListener("pointerdown",this.onPointerDown),n.removeEventListener("pointermove",this.onPointerMove),n.removeEventListener("pointerup",this.onPointerUp),n.removeEventListener("pointercancel",this.onPointerUp),n.removeEventListener("wheel",this.onWheel),n.removeEventListener("webglcontextlost",this.onContextLost);for(const t of this.disposableGeometries)t.dispose();for(const t of this.disposableMaterials)t.dispose();for(const t of this.disposableTextures)t.dispose();this.pmremTarget?.dispose(),this.renderer.dispose();try{this.renderer.forceContextLoss()}catch{}this.stageEl.parentElement===this.hostEl&&this.hostEl.removeChild(this.stageEl)}}function Fa(a,e){return new ya(a,e)}const Ea=["CLASSIC_CUE","HEADLINE_BLANK","PICTURE_MONITOR","SPOT_THE_MYTH","BINARY_SPLIT"],Wa=["TOY_01_KNIFE_SWITCH","TOY_02_CONFIDENCE_PNEUMATIC","TOY_03_VERNIER_DIAL","TOY_04_BALANCE_SCALE","TOY_05_RELIEF_GLOBE_3D","TOY_06_FUSE_WIRE_SNIPPER","TOY_07_MAIL_SORTER","TOY_08_CHRONOLOGY_RAIL","TOY_09_SWITCHBOARD_PATCHBAY","TOY_10_CLIFFHANGERS_THROTTLE","TOY_11_MISSING_VOWELS_WHEEL","TOY_12_CONSPIRACY_LASSO","TOY_13_CYANOTYPE_LOUPE","TOY_14_FOUR_SHUTTER_REEL"],Va={TOY_01_KNIFE_SWITCH:{toyId:"TOY_01_KNIFE_SWITCH",name:"1966 Studio Push-Button Desk",verbCue:"Tap A, B, C, or D to lock in!",isBlitzLegal:!0},TOY_02_CONFIDENCE_PNEUMATIC:{toyId:"TOY_02_CONFIDENCE_PNEUMATIC",name:"Double-or-Safe Wager Desk",verbCue:"Tap SAFE 0.75× or BOLD 1.25×!",isBlitzLegal:!1},TOY_03_VERNIER_DIAL:{toyId:"TOY_03_VERNIER_DIAL",name:"Studio Range Dial",verbCue:"Spin the Range Dial & tap LOCK IN!",isBlitzLegal:!0},TOY_04_BALANCE_SCALE:{toyId:"TOY_04_BALANCE_SCALE",name:"Golden Twin-Pan Scale",verbCue:"Tap 2 Gold Weights to match Target!",isBlitzLegal:!1},TOY_05_RELIEF_GLOBE_3D:{toyId:"TOY_05_RELIEF_GLOBE_3D",name:"1966 World Atlas Globe",verbCue:"Tap the spot on the World Globe!",isBlitzLegal:!0},TOY_06_FUSE_WIRE_SNIPPER:{toyId:"TOY_06_FUSE_WIRE_SNIPPER",name:"Studio Cable Cutout",verbCue:"Cut wrong cables or tap BANK CASH!",isBlitzLegal:!1},TOY_07_MAIL_SORTER:{toyId:"TOY_07_MAIL_SORTER",name:"Studio Mailbag Twin-Chute",verbCue:"Tap Chute A or B to sort all 4 cards!",isBlitzLegal:!1},TOY_08_CHRONOLOGY_RAIL:{toyId:"TOY_08_CHRONOLOGY_RAIL",name:"Time-Tunnel Timeline",verbCue:"Tap plaques from Earliest to Latest!",isBlitzLegal:!1},TOY_09_SWITCHBOARD_PATCHBAY:{toyId:"TOY_09_SWITCHBOARD_PATCHBAY",name:"Network Control Patchboard",verbCue:"Match all 3 Left Lines to Right Jacks!",isBlitzLegal:!1},TOY_10_CLIFFHANGERS_THROTTLE:{toyId:"TOY_10_CLIFFHANGERS_THROTTLE",name:"Alpine Mountain Range Slider",verbCue:"Slide Mountain Pointer & tap LOCK IN!",isBlitzLegal:!0},TOY_11_MISSING_VOWELS_WHEEL:{toyId:"TOY_11_MISSING_VOWELS_WHEEL",name:"Illuminated Vowel Board",verbCue:"Tap the Vowel Strip to solve the board!",isBlitzLegal:!0},TOY_12_CONSPIRACY_LASSO:{toyId:"TOY_12_CONSPIRACY_LASSO",name:"3-Match Studio Lightboard",verbCue:"Tap the 3 connected Studio Cards!",isBlitzLegal:!1},TOY_13_CYANOTYPE_LOUPE:{toyId:"TOY_13_CYANOTYPE_LOUPE",name:"1966 TV Visual Monitor",verbCue:"Tap the matching Zone on the TV Monitor!",isBlitzLegal:!1},TOY_14_FOUR_SHUTTER_REEL:{toyId:"TOY_14_FOUR_SHUTTER_REEL",name:"Pop-Art 4-Shutter Wall",verbCue:"Answer for 2.0× or open next Shutter!",isBlitzLegal:!1}},dt=["A","B","C","D"],va={MEDICINE:"BODY & MEDICINE",CHEMISTRY:"CHEMISTRY LAB",PHYSICS:"SCIENCE & SPACE",GADGETS:"INVENTIONS",ENGINES:"MACHINES & FLIGHT",LITERATURE:"BOOKS & AUTHORS",LEXICON:"WORDS & WIT","FINE ARTS":"ART & STAGE",SCREEN:"SILVER SCREEN",JUKEBOX:"HIT PARADE",FINANCE:"MONEY & MARKETS",PRICING:"PRICE TAG",ODDS:"LUCK & ODDS",ATLAS:"WORLD ATLAS",SPORTS:"WIDE WORLD SPORTS",DYNASTIES:"EMPIRES & KINGS",HEADLINES:"FRONT PAGE NEWS",FOLKLORE:"MYTHS & LEGENDS",FALLACIES:"BRAIN TWISTERS",CUISINE:"FOOD & FLAVOR"};function ka(a,e={}){if(e.cardStyle)return e.cardStyle;if(a.cardStyle)return a.cardStyle;if(a.isKlaxonMyth||/\b(myth|bogus|fake|hoax|never happened|odd one out|false claim|not true)\b/i.test(a.stem))return"SPOT_THE_MYTH";if(/_{2,}|\[\s*_+\s*\]|fill in the blank/i.test(a.stem))return"HEADLINE_BLANK";const n=Math.abs(a.qid*7+a.category.length*3+a.answerIdx)%5,t=Ea[n]??"CLASSIC_CUE";return t==="BINARY_SPLIT"&&/\b(four|4)\b/i.test(a.stem)?"PICTURE_MONITOR":t}function Ca(a){return`
    <svg class="ws7-pic-emblem-svg" viewBox="0 0 160 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="ws7CrtScan" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="4" y2="2" stroke="#1A0E06" stroke-opacity="0.06" stroke-width="1"/>
        </pattern>
        <radialGradient id="ws7CrtColorBloom" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stop-color="#FFFDF5" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#FFFDF5" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="ws7CrtPillowMask">
          <path d="M12,2 Q80,0 148,2 Q158,2 158,12 Q160,50 158,88 Q158,98 148,98 Q80,100 12,98 Q2,98 2,88 Q0,50 2,12 Q2,2 12,2 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#ws7CrtPillowMask)">
        <rect width="160" height="100" fill="#FAF2DF"/>
        <image href="${Ot(a)}" x="0" y="0" width="160" height="100" preserveAspectRatio="xMidYMid slice"/>
        <rect width="160" height="100" fill="url(#ws7CrtColorBloom)"/>
        <rect width="160" height="100" fill="url(#ws7CrtScan)"/>
        <path d="M16,8 Q80,3 144,8" fill="none" stroke="#FFFFFF" stroke-opacity="0.36" stroke-width="2.6" stroke-linecap="round"/>
      </g>
      <path d="M12,2 Q80,0 148,2 Q158,2 158,12 Q160,50 158,88 Q158,98 148,98 Q80,100 12,98 Q2,98 2,88 Q0,50 2,12 Q2,2 12,2 Z" fill="none" stroke="#D9A441" stroke-opacity="0.9" stroke-width="2"/>
    </svg>
  `}function pt(a,e,n,t,h){const p=Math.max(-140,Math.min(140,t)),b=Math.max(-140,Math.min(140,h)),x=Math.min(p,b),o=Math.max(p,b),c=Math.max(2,o-x),l=(x-90)*Math.PI/180,O=(x+c-90)*Math.PI/180,H=a+Math.cos(l)*n,U=e+Math.sin(l)*n,q=a+Math.cos(O)*n,B=e+Math.sin(O)*n,j=c>180?1:0;return`M${H.toFixed(1)},${U.toFixed(1)} A${n},${n} 0 ${j},1 ${q.toFixed(1)},${B.toFixed(1)}`}const It="ws7-tactile-contraptions-styles";function Sa(){if(typeof document>"u")return;let a=document.getElementById(It);a||(a=document.createElement("style"),a.id=It,document.head.appendChild(a)),a.dataset.version!=="1966-living-color-v8-shutter-ladder"&&(a.dataset.version="1966-living-color-v8-shutter-ladder",a.textContent=`
    @keyframes ws7PadSlideIn {
      from {
        opacity: 0;
        transform: translateY(7px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes ws7ShutterOpen {
      0% {
        opacity: 0.4;
        transform: perspective(520px) rotateX(-78deg) scaleY(0.84);
      }
      70% {
        opacity: 1;
        transform: perspective(520px) rotateX(8deg) scaleY(1.03);
      }
      100% {
        opacity: 1;
        transform: perspective(520px) rotateX(0deg) scaleY(1);
      }
    }
    @keyframes ws7SparkBurst {
      0% {
        opacity: 1;
        transform: scale(0.35) rotate(-18deg);
      }
      55% {
        opacity: 1;
        transform: scale(1.25) rotate(12deg);
      }
      100% {
        opacity: 0;
        transform: scale(1.55) rotate(24deg);
      }
    }
    @keyframes ws7RailMagneticSnap {
      0% {
        transform: translateY(-9px) scale(0.92);
        box-shadow: 0 0 0 4px #FFD166, 0 0 24px rgba(255, 209, 102, 0.9);
      }
      65% {
        transform: translateY(2px) scale(1.03);
      }
      100% {
        transform: translateY(0) scale(1);
      }
    }
    @keyframes ws7ChuteRecoil {
      0% { transform: scale(1); }
      40% { transform: scale(0.93); filter: brightness(1.18); }
      100% { transform: scale(1); filter: brightness(1); }
    }
    @keyframes ws7CardDealIn {
      0% {
        opacity: 0;
        transform: translateY(10px) scale(0.94);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @keyframes ws7SolariTickPop {
      0% { transform: scale(1); }
      45% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
    @keyframes ws7TwineDraw {
      from { stroke-dashoffset: 100; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes ws7LoupeReticleLock {
      0% {
        opacity: 0;
        transform: scale(1.55);
      }
      65% {
        opacity: 1;
        transform: scale(0.94);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    .ws7-wire-spark-burst {
      transform-box: fill-box;
      transform-origin: center;
      animation: ws7SparkBurst 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .ws7-sleeper-slot.is-magnetic-snap {
      animation: ws7RailMagneticSnap 0.28s cubic-bezier(0.22, 1.32, 0.36, 1) both;
    }
    .ws7-chute-btn.is-chute-recoil {
      animation: ws7ChuteRecoil 0.2s cubic-bezier(0.22, 1.25, 0.36, 1) both;
    }
    .ws7-sorter-deck.is-card-deal-in {
      animation: ws7CardDealIn 0.18s cubic-bezier(0.22, 1.15, 0.36, 1) both;
    }
    .ws7-dial-solari-plaque.is-detent-pop,
    .ws7-cliff-readout.is-detent-pop {
      animation: ws7SolariTickPop 0.14s ease-out;
    }
    .ws7-twine-animated {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
      animation: ws7TwineDraw 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .ws7-loupe-reticle {
      transform-box: fill-box;
      transform-origin: center;
      animation: ws7LoupeReticleLock 0.26s cubic-bezier(0.22, 1.25, 0.36, 1) both;
    }
    .ws7-pneumatic-gauge {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
    }
    .ws7-pneumatic-gauge-needle {
      transform-origin: 21px 19px;
      transition: transform 0.22s cubic-bezier(0.22, 1.45, 0.36, 1);
    }
    @keyframes ws7VowelPop {
      0% {
        transform: rotateX(-75deg) scale(0.92);
      }
      70% {
        transform: rotateX(12deg) scale(1.06);
      }
      100% {
        transform: rotateX(0deg) scale(1);
      }
    }
    @keyframes ws7GoldPulse {
      from {
        box-shadow:
          inset 0 2px 0 rgba(255, 255, 255, 0.8),
          0 4px 0 #9E6300,
          0 0 12px rgba(244, 169, 31, 0.45);
      }
      to {
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 4px 0 #9E6300,
          0 0 24px rgba(255, 209, 102, 0.85);
      }
    }
    @keyframes ws7ClutchHeartbeat {
      0% {
        transform: translateY(3px) scale(1);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 3px #FFD166,
          0 0 18px rgba(255, 209, 102, 0.72);
      }
      100% {
        transform: translateY(2px) scale(1.015);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 4px #FFF3B0,
          0 0 38px rgba(255, 190, 46, 0.98);
      }
    }
    @keyframes ws7KlaxonBeacon {
      from {
        opacity: 0.55;
        transform: scale(0.88);
      }
      to {
        opacity: 1;
        transform: scale(1.16);
      }
    }
    @keyframes ws7RevealPop {
      0% {
        transform: scale(0.82);
        opacity: 0;
      }
      70% {
        transform: scale(1.08);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes ws7PollGrow {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }
    @keyframes ws7FiftyStampSlam {
      0% {
        opacity: 0;
        transform: scale(1.42) rotate(-9deg);
      }
      65% {
        opacity: 1;
        transform: scale(0.95) rotate(-1deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(-1.5deg);
      }
    }
    @keyframes ws7PollLeaderSweep {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    /* Subtle 1966 Backlit Cotton Cue-Card Micro-Grain on Upper Vellum Pane */
    .ws7-clue-vellum-pane:has(~ .ws7-toy-bay > .ws7-toy-root) {
      background-image:
        repeating-linear-gradient(
          0deg,
          rgba(138, 98, 42, 0.025) 0px,
          rgba(138, 98, 42, 0.025) 1px,
          transparent 1px,
          transparent 5px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(138, 98, 42, 0.018) 0px,
          rgba(138, 98, 42, 0.018) 1px,
          transparent 1px,
          transparent 6px
        ),
        linear-gradient(180deg, #fffdf9 0%, #f7eedb 100%);
    }

    /* High-contrast >=10:1 Question Header Cash & Stakes Pills across Amber/Teal/Cobalt/Vermilion ribbons */
    .ws7-clue-vellum-pane:has(~ .ws7-toy-bay > .ws7-toy-root) .ws7-cat-cash-pill {
      background: rgba(79, 41, 23, 0.94) !important;
      color: #FFF6DC !important;
      padding: 2px 9px;
      border-radius: 6px;
      box-shadow: inset 0 0 0 1.5px rgba(255, 213, 107, 0.78), 0 1px 4px rgba(0, 0, 0, 0.25);
      white-space: nowrap;
    }
    .ws7-clue-vellum-pane:has(~ .ws7-toy-bay > .ws7-toy-root) .ws7-clue-stakes-chip {
      background: rgba(79, 41, 23, 0.92) !important;
      color: #FFD56B !important;
      box-shadow: inset 0 0 0 1.5px rgba(255, 213, 107, 0.68);
    }
    .ws7-blank-nowrap {
      white-space: nowrap;
      display: inline-block;
    }
    .ws7-time-emphasis {
      display: inline-block;
      padding: 0 5px;
      margin: 0 1px;
      border-radius: 5px;
      font-weight: 900;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }
    .ws7-time-emphasis--early {
      background: rgba(23, 70, 162, 0.13);
      color: #133A8A;
      border: 1px solid rgba(23, 70, 162, 0.35);
    }
    .ws7-time-emphasis--late {
      background: rgba(217, 119, 6, 0.18);
      color: #9A4804;
      border: 1px solid rgba(180, 83, 9, 0.38);
    }

    /* Safe-centering law: centers when content fits, NEVER clips top above scrollTop=0 on extreme 185-char stems! */
    .ws7-toy-bay:has(> .ws7-toy-root) {
      justify-content: flex-start !important;
      min-height: 0;
    }

    .ws7-toy-root {
      --ws7-toy-sans: 'Plus Jakarta Sans', 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --ws7-toy-caps: 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif;
      --ws7-toy-num: 'Michroma', 'Jost', 'Plus Jakarta Sans', sans-serif;
      container-type: inline-size;
      container-name: ws7toy;
      position: relative;
      flex: 0 0 auto;
      width: 100%;
      height: auto;
      min-height: 0;
      margin: auto 0;
      box-sizing: border-box;
      overflow: visible;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 8px;
      padding: 0;
      font-family: var(--ws7-toy-sans);
      font-size: 15px;
      font-variant-numeric: tabular-nums;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    .ws7-toy-root *, .ws7-toy-root *::before, .ws7-toy-root *::after {
      box-sizing: border-box;
    }

    /* Sleek 1-Line 1966 TV Showcase Prompt Cue (TOY_02..TOY_14) */
    .ws7-showcase-prompt {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 4px 2px;
      background: transparent;
      color: #FFF6E3;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: 0.02em;
      text-align: center;
      flex: 0 0 auto;
    }
    .ws7-showcase-star {
      color: #FFD166;
      font-weight: 900;
      letter-spacing: 0.04em;
      flex: 0 0 auto;
    }

    /* Illuminated 1966 Backlit Acrylite Warm TV Cream Plaque w/ Fine Cotton Micro-Grain */
    .ws7-cream-plaque {
      position: relative;
      overflow: hidden;
      background:
        repeating-linear-gradient(
          0deg,
          rgba(148, 112, 54, 0.028) 0px,
          rgba(148, 112, 54, 0.028) 1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0) 44%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 68%, #F0DFBF 100%);
      color: #141B29;
      border: none;
      border-radius: 13px;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -1.5px 0 rgba(186, 158, 108, 0.6),
        0 3.5px 0 #BFA576,
        0 7px 15px rgba(30, 20, 14, 0.28);
    }

    .ws7-choice-copy {
      font-family: var(--ws7-toy-sans);
      font-size: clamp(15px, 1.8vw, 17px);
      font-weight: 700;
      line-height: 1.22;
      color: #141B29;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
      -webkit-hyphens: none;
      white-space: normal;
    }

    /* Diegetic Studio Overlays & Lifeline Stamps (>= 14.5px hard floor!) */
    .ws7-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
    }
    .ws7-meta-row:empty {
      display: none;
    }
    .ws7-stamp-void {
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 5px;
      background: #FDE8E8;
      color: #B51722;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      transform: rotate(-2deg);
      box-shadow: inset 0 0 0 2px #B51722;
    }
    .ws7-stamp-void[data-myth-elim="true"] {
      background: #FAF2DF;
      color: #4F2917;
      box-shadow: inset 0 0 0 2px #8C5838;
    }
    .ws7-stamp-fifty {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 7px;
      border-radius: 5px;
      background: #4F2917;
      color: #FFD166;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      transform: rotate(-1.5deg);
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 2px 6px rgba(0, 0, 0, 0.35);
      animation: ws7FiftyStampSlam 0.24s cubic-bezier(0.22, 1.32, 0.36, 1) both;
    }
    .ws7-canary-tick {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 1px 7px;
      border-radius: 5px;
      background: #E0F4FF;
      color: #005A9C;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.15;
      transform: rotate(1.5deg);
      box-shadow: inset 0 0 0 1.8px #0077B6;
    }
    .ws7-uv-poison {
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 5px;
      background: #F1E6FF;
      color: #5B189A;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.15;
      box-shadow: inset 0 0 0 1.8px #7B2CBF, 0 0 10px rgba(123, 44, 191, 0.25);
    }

    /* 50/50 Cut Dimmed State */
    .is-fifty-cut {
      opacity: 0.42 !important;
      filter: saturate(0.24);
      pointer-events: none !important;
      cursor: not-allowed !important;
    }
    .is-fifty-cut .ws7-pad-label,
    .is-fifty-cut .ws7-choice-copy {
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #B51722;
    }

    /* 1966 Solari Tote Audience Poll Percentage Bar Badge */
    .ws7-poll-slot {
      display: none;
      margin-top: 4px;
      width: 100%;
    }
    .ws7-poll-slot.is-visible {
      display: block;
    }
    .ws7-poll-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      width: 100%;
      padding: 2px 6px;
      border-radius: 7px;
      background: #3E2012;
      box-shadow: inset 0 0 0 1.5px rgba(0, 194, 214, 0.55);
    }
    .ws7-poll-badge[data-leader="true"] {
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 0 10px rgba(255, 209, 102, 0.35);
    }
    .ws7-poll-track {
      flex: 1 1 auto;
      min-width: 28px;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 246, 227, 0.16);
      overflow: hidden;
    }
    .ws7-poll-fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #0096A6 0%, #22D3EE 100%);
      transform-origin: left center;
      animation: ws7PollGrow 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .ws7-poll-badge[data-leader="true"] .ws7-poll-fill {
      background: linear-gradient(90deg, #E5980B 0%, #FFE484 42%, #FFFDF5 50%, #FFE484 58%, #E5980B 100%);
      background-size: 200% 100%;
      animation:
        ws7PollGrow 0.34s cubic-bezier(0.22, 1, 0.36, 1) both,
        ws7PollLeaderSweep 2.4s linear 0.4s infinite;
    }
    .ws7-poll-pct {
      flex: 0 0 auto;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      color: #FFF6E3;
      letter-spacing: 0.02em;
      line-height: 1.1;
      min-width: 38px;
      text-align: right;
      white-space: nowrap;
    }
    .ws7-poll-badge[data-leader="true"] .ws7-poll-pct {
      color: #FFD166;
    }

    /* Non-blocking Showcase Lifeline Ribbon (for Dial, Globe, Chrono, Patchbay, Cliffhangers) */
    .ws7-lifeline-ribbon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 9px;
      background: linear-gradient(90deg, #005A63 0%, #007B85 50%, #005A63 100%);
      box-shadow: inset 0 0 0 1.8px #00C2D6, 0 4px 12px rgba(30, 20, 14, 0.35);
      color: #FFF6E3;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-align: center;
      line-height: 1.2;
      animation: ws7RevealPop 0.22s ease-out both;
    }
    .ws7-lifeline-ribbon[data-kind="poll"] {
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 4px 12px rgba(30, 20, 14, 0.35);
    }

    /* ========================================================================
       DYNAMIC 2-BEAT LOCK-IN & TRUE-ANSWER TALLY REVEAL STATES
       ======================================================================== */
    .is-console-locked .ws7-studio-pad:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-pneumatic-row:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-fuse-wire-btn:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-vowel-drum:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-shutter-key-btn:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong) {
      opacity: 0.62;
      pointer-events: none;
    }
    .is-console-locked button {
      pointer-events: none;
    }

    /* Beat 1: Warm 2700K Amber Lock-In */
    .ws7-studio-pad.is-amber-lock,
    .ws7-pneumatic-row.is-amber-lock,
    .ws7-fuse-wire-btn.is-amber-lock,
    .ws7-vowel-drum.is-amber-lock,
    .ws7-shutter-key-btn.is-amber-lock {
      transform: translateY(3px);
      background:
        radial-gradient(circle at 50% 45%, #FFFDF7 0%, #FFF0A8 56%, #F7B728 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 1px 0 #A86B00,
        0 0 0 3px #FFD166,
        0 0 28px rgba(255, 209, 102, 0.9) !important;
    }
    .ws7-studio-pad.is-clutch-lock,
    .ws7-pneumatic-row.is-clutch-lock,
    .ws7-fuse-wire-btn.is-clutch-lock,
    .ws7-vowel-drum.is-clutch-lock,
    .ws7-shutter-key-btn.is-clutch-lock {
      animation: ws7ClutchHeartbeat 0.28s ease-in-out infinite alternate !important;
    }

    /* Beat 2: Radiant Broadcast Emerald (True Answer) */
    .ws7-studio-pad.is-reveal-correct,
    .ws7-pneumatic-row.is-reveal-correct,
    .ws7-fuse-wire-btn.is-reveal-correct,
    .ws7-vowel-drum.is-reveal-correct,
    .ws7-shutter-key-btn.is-reveal-correct {
      opacity: 1 !important;
      filter: none !important;
      transform: translateY(-1px);
      background:
        linear-gradient(180deg, #E8FFF1 0%, #B8F7D2 62%, #7CEBA8 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #0F9D58,
        0 3px 0 #0B7A42,
        0 0 0 3px #22C55E,
        0 0 30px rgba(34, 197, 94, 0.88) !important;
    }

    /* Beat 2: Broadcast Vermilion (Wrong Pick) */
    .ws7-studio-pad.is-reveal-wrong,
    .ws7-pneumatic-row.is-reveal-wrong,
    .ws7-fuse-wire-btn.is-reveal-wrong,
    .ws7-vowel-drum.is-reveal-wrong,
    .ws7-shutter-key-btn.is-reveal-wrong {
      opacity: 1 !important;
      transform: translateY(2px);
      background:
        linear-gradient(180deg, #FFF0F0 0%, #FFD0CE 62%, #FCA5A5 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #C81E1E,
        0 2px 0 #991B1B,
        0 0 0 3px #EF4444,
        0 0 26px rgba(239, 68, 68, 0.8) !important;
    }

    .ws7-lock-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 8px;
      border-radius: 999px;
      background: #141B29;
      color: #FFD166;
      box-shadow: 0 0 0 2px #FFD166, 0 0 14px rgba(255, 209, 102, 0.85);
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 1.1;
      white-space: nowrap;
      flex: 0 0 auto;
      animation: ws7RevealPop 0.18s ease-out both;
    }
    .ws7-tally-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 30px;
      height: 30px;
      padding: 0 8px;
      border-radius: 999px;
      font-family: var(--ws7-toy-caps);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1;
      white-space: nowrap;
      flex: 0 0 auto;
      animation: ws7RevealPop 0.18s ease-out both;
    }
    .ws7-tally-badge.is-correct {
      background: #0F8A49;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 14px rgba(34, 197, 94, 0.8);
    }
    .ws7-tally-badge.is-wrong {
      background: #C81E1E;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 14px rgba(239, 68, 68, 0.78);
    }

    /* ========================================================================
       1. TOY_01_KNIFE_SWITCH — 5 DISTINCT 1966 VISUAL TV CARD PRESENTATIONS
       ======================================================================== */
    .ws7-classic-pads-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 9px;
      width: 100%;
    }
    .ws7-studio-pad {
      --pad-accent: #0096A6;
      --pad-accent-top: #00C2D6;
      --pad-accent-lip: #005F6B;
      --pad-medallion-ink: #FFFDF7;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 11px;
      width: 100%;
      min-height: 56px;
      padding: 8px 13px 8px 10px;
      border: none;
      border-radius: 14px;
      background:
        radial-gradient(circle at 10px 7px, rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        radial-gradient(circle at calc(100% - 7px) 7px, rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        radial-gradient(circle at 10px calc(100% - 7px), rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        radial-gradient(circle at calc(100% - 7px) calc(100% - 7px), rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        repeating-linear-gradient(
          0deg,
          rgba(150, 114, 56, 0.025) 0px,
          rgba(150, 114, 56, 0.025) 1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0) 46%),
        linear-gradient(180deg, #FFFDF9 0%, #FFF6E3 66%, #EEDBB8 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -2px 0 rgba(176, 146, 94, 0.48),
        inset 5.5px 0 0 var(--pad-accent),
        0 4.5px 0 #BDA273,
        0 6px 0 #7E6842,
        0 10px 20px rgba(30, 20, 14, 0.36);
      color: #141B29;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.12s ease, background 0.12s ease, opacity 0.14s ease;
    }
    .ws7-studio-pad[data-animated="true"] {
      animation: ws7PadSlideIn 0.22s cubic-bezier(0.2, 0.85, 0.3, 1) both;
    }
    .ws7-studio-pad[data-pad-tone="0"] {
      --pad-accent: #0096A6;
      --pad-accent-top: #00C2D6;
      --pad-accent-lip: #005F6B;
      --pad-medallion-ink: #FFFDF7;
    }
    .ws7-studio-pad[data-pad-tone="1"] {
      --pad-accent: #F4A91F;
      --pad-accent-top: #FFCB52;
      --pad-accent-lip: #AD6F00;
      --pad-medallion-ink: #141B29;
    }
    .ws7-studio-pad[data-pad-tone="2"] {
      --pad-accent: #1E56C5;
      --pad-accent-top: #3B79F2;
      --pad-accent-lip: #11347D;
      --pad-medallion-ink: #FFFDF7;
    }
    .ws7-studio-pad[data-pad-tone="3"] {
      --pad-accent: #FF6738;
      --pad-accent-top: #FF8964;
      --pad-accent-lip: #B33712;
      --pad-medallion-ink: #FFFDF7;
    }
    .ws7-studio-pad:hover:not(:disabled),
    .ws7-studio-pad:focus-visible:not(:disabled) {
      transform: translateY(-1.5px);
      background:
        linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.15) 50%),
        linear-gradient(180deg, #FFFFFF 0%, #FFF9EC 70%, #F7E9CE 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 var(--pad-accent-top),
        0 5px 0 #D8A948,
        0 10px 24px rgba(30, 20, 14, 0.36);
      outline: none;
    }
    .ws7-studio-pad:active:not(:disabled),
    .ws7-studio-pad.is-thrown {
      transform: translateY(3px);
      background:
        radial-gradient(circle at 50% 45%, #FFFDF7 0%, #FFF1B0 58%, #FFD166 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 1px 0 #A86B00,
        0 0 0 3px #FFD166,
        0 0 30px rgba(255, 209, 102, 0.9);
    }
    .ws7-pad-medallion {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 48%, rgba(0, 0, 0, 0.14) 100%),
        linear-gradient(180deg, var(--pad-accent-top) 0%, var(--pad-accent) 100%);
      color: var(--pad-medallion-ink);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.62),
        inset 0 -1.5px 0 rgba(0, 0, 0, 0.22),
        0 0 0 1.5px rgba(255, 255, 255, 0.72),
        0 3.5px 0 var(--pad-accent-lip);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ws7-toy-caps);
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1;
      transition: transform 0.08s ease;
    }
    .ws7-studio-pad:active:not(:disabled) .ws7-pad-medallion {
      transform: translateY(1.5px) scale(0.96);
    }
    .ws7-pad-body {
      flex: 1 1 auto;
      min-width: 0;
      padding-right: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .ws7-pad-label {
      font-family: var(--ws7-toy-sans);
      font-size: clamp(17px, 4.3vw, 19px);
      font-weight: 700;
      line-height: 1.24;
      color: #141B29;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
      -webkit-hyphens: none;
      white-space: normal;
    }
    .ws7-studio-pad[data-long-word="true"] .ws7-pad-label {
      overflow-wrap: anywhere;
    }
    .ws7-pad-tail {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
    .ws7-pad-lamp {
      flex: 0 0 15px;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: radial-gradient(circle at 34% 30%, #FFFFFF 0%, #FFF7E0 32%, #DFC89F 68%, #9B835B 100%);
      box-shadow:
        inset 0 1.5px 2px rgba(255, 255, 255, 0.8),
        inset 0 -1.5px 2px rgba(20, 27, 41, 0.36),
        0 0 0 2px #9AAEC2,
        0 0 0 3px rgba(20, 27, 41, 0.22);
      transition: background 0.1s ease, box-shadow 0.1s ease, transform 0.1s ease;
    }
    .ws7-studio-pad:hover:not(:disabled) .ws7-pad-lamp {
      background: radial-gradient(circle at 38% 35%, #FFFFFF 0%, #FFD166 68%, #F4A91F 100%);
      box-shadow: 0 0 12px rgba(244, 169, 31, 0.85);
    }
    .ws7-studio-pad.is-thrown .ws7-pad-lamp,
    .ws7-studio-pad.is-amber-lock .ws7-pad-lamp {
      transform: scale(1.28);
      background: radial-gradient(circle at 40% 40%, #FFFFFF 0%, #FFF3B0 55%, #FF9F1C 100%);
      box-shadow: 0 0 16px #FFD166, 0 0 28px #FF9F1C;
    }
    .ws7-studio-pad.is-reveal-correct .ws7-pad-lamp,
    .ws7-studio-pad.is-reveal-wrong .ws7-pad-lamp,
    .ws7-studio-pad.is-clutch-lock .ws7-pad-lamp {
      display: none;
    }

    /* --- CARD STYLE 2: HEADLINE_BLANK (1966 AP Teletype / Press Clipping) --- */
    .ws7-wire-masthead {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 20px;
      border-radius: 9px;
      background:
        radial-gradient(circle at 7px 50%, #3E2012 2.4px, transparent 2.8px),
        radial-gradient(circle at calc(100% - 7px) 50%, #3E2012 2.4px, transparent 2.8px),
        linear-gradient(180deg, #FCF6E3 0%, #EFE2C0 100%);
      color: #141B29;
      border-top: 3px double #141B29;
      border-bottom: 3px double #141B29;
      box-shadow: inset 0 1px 0 #FFFFFF, 0 4px 12px rgba(30, 20, 14, 0.35);
      flex: 0 0 auto;
    }
    .ws7-wire-stamp {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.015em;
      color: #B51722;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ws7-wire-sprocket {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #B51722;
      box-shadow: 0 0 8px rgba(181, 23, 34, 0.65);
      flex: 0 0 auto;
    }
    .ws7-wire-edition {
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      color: #4F2917;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ws7-style-headline_blank .ws7-studio-pad {
      border-radius: 9px;
      background:
        linear-gradient(180deg, #FDF8EA 0%, #F4E9CC 72%, #E8D7B0 100%);
      box-shadow:
        inset 0 0 0 1.5px rgba(20, 27, 41, 0.24),
        inset 0 4px 0 #141B29,
        0 4px 0 #9E8A63,
        0 7px 15px rgba(30, 20, 14, 0.32);
    }
    .ws7-style-headline_blank .ws7-pad-medallion {
      border-radius: 6px;
      background: linear-gradient(180deg, #4F2917 0%, #241309 100%);
      color: #FBF4E0;
      box-shadow:
        inset 0 0 0 1.5px #FFD166,
        0 3px 0 #1E140E;
    }
    .ws7-style-headline_blank .ws7-studio-pad:hover:not(:disabled) {
      box-shadow:
        inset 0 0 0 2px #B51722,
        inset 0 4px 0 #B51722,
        0 5px 0 #9E8A63,
        0 10px 22px rgba(30, 20, 14, 0.38);
    }

    /* --- CARD STYLE 3: PICTURE_MONITOR (1966 American Walnut & Chrome RCA CRT) --- */
    .ws7-picture-shell {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-picture-crt {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: 14px;
      background:
        repeating-linear-gradient(
          92deg,
          rgba(255, 224, 178, 0.06) 0px,
          rgba(255, 224, 178, 0.06) 3px,
          rgba(34, 14, 4, 0.09) 3px,
          rgba(34, 14, 4, 0.09) 8px
        ),
        linear-gradient(180deg, #8A4D2A 0%, #63341A 56%, #4A2410 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 178, 0.5),
        inset 0 0 0 2px #D6B485,
        0 4px 0 #321608,
        0 8px 18px rgba(30, 20, 14, 0.44);
      flex: 0 0 auto;
    }
    .ws7-picture-screen {
      flex: 0 0 132px;
      width: 132px;
      height: 83px;
      border-radius: 11px;
      padding: 2.5px;
      background: linear-gradient(155deg, #FFF3B0 0%, #F2A922 48%, #8F5A12 100%);
      box-shadow:
        inset 0 2px 5px rgba(30, 20, 14, 0.65),
        0 0 10px rgba(242, 169, 34, 0.32),
        0 1px 0 rgba(255, 246, 227, 0.55);
      overflow: hidden;
    }
    @container ws7toy (max-width: 420px) {
      .ws7-picture-dials {
        display: none;
      }
    }
    .ws7-picture-color-dots {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      flex: 0 0 auto;
    }
    .ws7-picture-color-dots > i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }
    .ws7-picture-meta {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }
    .ws7-picture-ch-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #FFD166;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .ws7-picture-onair-led {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FF4A3D;
      box-shadow: 0 0 8px #FF4A3D;
      flex: 0 0 auto;
    }
    .ws7-picture-sub {
      font-family: var(--ws7-toy-sans);
      font-size: 14.5px;
      font-weight: 700;
      color: #FFF6E3;
      line-height: 1.18;
    }
    .ws7-picture-dials {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }
    .ws7-crt-knob {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background:
        conic-gradient(from 45deg, #E2ECF5 0deg, #8DA0B5 90deg, #FFFDF7 180deg, #6A7D92 270deg, #E2ECF5 360deg);
      box-shadow:
        inset 0 0 0 2.5px #4F2917,
        0 2px 4px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    .ws7-crt-knob::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 50%;
      width: 2px;
      height: 6px;
      transform: translateX(-50%);
      background: #141B29;
      border-radius: 1px;
    }
    .ws7-style-picture_monitor .ws7-studio-pad {
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 #00B2C4,
        0 4px 0 #9BB3C9,
        0 7px 16px rgba(30, 20, 14, 0.32);
    }

    /* --- CARD STYLE 4: SPOT_THE_MYTH (Cerise/Vermilion Klaxon Alert Frame) --- */
    .ws7-klaxon-banner {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 6px 12px;
      border-radius: 10px;
      background:
        repeating-linear-gradient(
          -45deg,
          rgba(255, 209, 102, 0.14) 0px,
          rgba(255, 209, 102, 0.14) 8px,
          transparent 8px,
          transparent 16px
        ),
        linear-gradient(90deg, #B4124A 0%, #E6397A 50%, #D92626 100%);
      color: #FFFFFF;
      border: 2px solid #FFD166;
      box-shadow: 0 0 18px rgba(230, 57, 122, 0.55), 0 4px 12px rgba(30, 20, 14, 0.35);
      font-family: var(--ws7-toy-caps);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.18;
      flex: 0 0 auto;
    }
    .ws7-klaxon-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #FFD166;
      box-shadow: 0 0 10px #FFD166;
      flex: 0 0 auto;
      animation: ws7KlaxonBeacon 0.52s ease-in-out infinite alternate;
    }
    .ws7-style-spot_the_myth .ws7-classic-pads-grid {
      padding: 6px;
      border-radius: 15px;
      background: linear-gradient(135deg, rgba(230, 57, 122, 0.24) 0%, rgba(217, 38, 38, 0.22) 100%);
      box-shadow: inset 0 0 0 2px rgba(230, 57, 122, 0.65);
    }
    .ws7-style-spot_the_myth .ws7-studio-pad {
      --pad-accent: #D61F5E;
      --pad-accent-top: #F24B86;
      --pad-accent-lip: #8C113B;
      --pad-medallion-ink: #FFFDF7;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #E6397A,
        0 4px 0 #B3687E,
        0 7px 16px rgba(42, 6, 20, 0.34);
    }

    /* --- CARD STYLE 5: BINARY_SPLIT / HIGHER_OR_LOWER / BEFORE_OR_AFTER (2-Paddle Duels) --- */
    .ws7-binary-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 5px 12px;
      border-radius: 10px;
      background: linear-gradient(90deg, #007E8C 0%, #5C301B 50%, #D9461A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 4px 12px rgba(42, 22, 10, 0.32);
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
      flex: 0 0 auto;
    }
    .ws7-style-higher_or_lower .ws7-binary-banner {
      background: linear-gradient(90deg, #007E8C 0%, #6E3B23 50%, #D97706 100%);
    }
    .ws7-style-before_or_after .ws7-binary-banner {
      background: linear-gradient(90deg, #1746A2 0%, #5C301B 50%, #C47A12 100%);
    }
    .ws7-style-higher_or_lower .ws7-binary-paddle[data-side="left"] .ws7-binary-cap {
      background: linear-gradient(180deg, #00A8B5 0%, #00747C 100%);
    }
    .ws7-style-higher_or_lower .ws7-binary-paddle[data-side="right"] .ws7-binary-cap {
      background: linear-gradient(180deg, #F59E0B 0%, #C76F00 100%);
    }
    .ws7-style-before_or_after .ws7-binary-paddle[data-side="left"] .ws7-binary-cap {
      background: linear-gradient(180deg, #2B5EC4 0%, #1746A2 100%);
    }
    .ws7-style-before_or_after .ws7-binary-paddle[data-side="right"] .ws7-binary-cap {
      background: linear-gradient(180deg, #D98A1A 0%, #A95C06 100%);
    }

    /* --- CARD STYLES 7, 8, 9: ODD_ONE_OUT / FINISH_THE_LINE / WHO_WHAT_AM_I --- */
    .ws7-cue-style-banner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 10px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.045em;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.18;
      flex: 0 0 auto;
    }
    .ws7-cue-style-banner--odd {
      background: linear-gradient(90deg, #00747C 0%, #008B94 55%, #D9651B 100%);
      color: #FFFDF7;
      border: 2px solid #FFD166;
      box-shadow: 0 4px 12px rgba(42, 22, 10, 0.28);
    }
    .ws7-style-odd_one_out .ws7-classic-pads-grid {
      padding: 6px;
      border-radius: 15px;
      background: linear-gradient(135deg, rgba(0, 139, 148, 0.14) 0%, rgba(255, 107, 53, 0.14) 100%);
      box-shadow: inset 0 0 0 2px rgba(217, 164, 65, 0.65);
    }
    .ws7-cue-style-banner--line {
      background:
        repeating-linear-gradient(
          90deg,
          rgba(217, 164, 65, 0.1) 0px,
          rgba(217, 164, 65, 0.1) 12px,
          transparent 12px,
          transparent 24px
        ),
        linear-gradient(180deg, #FAF2DF 0%, #EFE0BE 100%);
      color: #3E2012;
      border: 2px solid #6E3B23;
      box-shadow: inset 0 1px 0 #FFFDF7, 0 4px 10px rgba(42, 22, 10, 0.24);
    }
    .ws7-style-finish_the_line .ws7-studio-pad {
      box-shadow:
        inset 0 2px 0 #FFFDF7,
        inset 6px 0 0 #D9A441,
        0 4px 0 #9E7C44,
        0 7px 15px rgba(42, 22, 10, 0.26);
    }
    .ws7-cue-style-banner--riddle {
      background: linear-gradient(90deg, #5C301B 0%, #6E3B23 50%, #00747C 100%);
      color: #FAF2DF;
      border: 2px solid #D9A441;
      box-shadow: 0 4px 12px rgba(42, 22, 10, 0.3);
    }
    .ws7-style-who_what_am_i .ws7-studio-pad {
      box-shadow:
        inset 0 2px 0 #FFFDF7,
        inset 6px 0 0 #008B94,
        0 4px 0 #8F7648,
        0 7px 15px rgba(42, 22, 10, 0.28);
    }
    .ws7-binary-arena {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr);
      align-items: stretch;
      gap: 6px;
      width: 100%;
    }
    .ws7-binary-vs {
      align-self: center;
      justify-self: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(180deg, #FFE484 0%, #F4A91F 100%);
      color: #141B29;
      box-shadow: inset 0 2px 0 #FFFFFF, 0 3px 0 #9E6300, 0 0 14px rgba(244, 169, 31, 0.65);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ws7-toy-caps);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.02em;
      z-index: 2;
    }
    .ws7-studio-pad.ws7-binary-paddle {
      flex-direction: column;
      align-items: stretch;
      justify-content: space-between;
      gap: 8px;
      min-height: 118px;
      padding: 0 0 10px 0;
      border-radius: 16px;
      text-align: center;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 5px 0 #BFA576,
        0 10px 22px rgba(30, 20, 14, 0.36);
    }
    .ws7-binary-cap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 6px 9px;
      font-family: var(--ws7-toy-caps);
      font-size: clamp(12.5px, 3.4vw, 14.5px);
      font-weight: 900;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
      color: #FFFDF7;
    }
    .ws7-binary-paddle[data-side="left"] .ws7-binary-cap {
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
    }
    .ws7-binary-paddle[data-side="right"] .ws7-binary-cap {
      background: linear-gradient(180deg, #FF855E 0%, #E04B1E 100%);
    }
    .ws7-binary-paddle .ws7-pad-body {
      padding: 2px 11px;
      align-items: center;
      text-align: center;
    }
    .ws7-binary-paddle .ws7-pad-label {
      font-size: clamp(18px, 4.5vw, 22px);
      font-weight: 800;
      line-height: 1.2;
      text-align: center;
    }
    .ws7-binary-paddle[data-long-word="true"] .ws7-pad-label {
      font-size: 14.5px;
      letter-spacing: -0.02em;
      overflow-wrap: break-word;
    }
    .ws7-binary-paddle[data-long-word="true"] .ws7-pad-label {
      font-size: clamp(15.5px, 3.8vw, 19px);
      letter-spacing: -0.01em;
    }
    .ws7-toy-root[data-reduced-motion="true"] .ws7-klaxon-dot,
    .ws7-toy-root[data-reduced-motion="true"] .ws7-bailout-latch.is-armed {
      animation: none !important;
    }
    .ws7-binary-paddle .ws7-pad-tail {
      justify-content: center;
      padding: 0 10px;
      min-height: 22px;
    }

    @container ws7toy (min-width: 540px) {
      .ws7-classic-pads-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 64px;
        padding: 10px 15px 10px 12px;
        border-radius: 16px;
      }
      .ws7-pad-medallion {
        flex: 0 0 44px;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        font-size: 20px;
      }
      .ws7-pad-label {
        font-size: clamp(19px, 1.85vw, 21px);
        line-height: 1.24;
      }
      .ws7-studio-pad.ws7-binary-paddle {
        min-height: 136px;
      }
      .ws7-binary-paddle .ws7-pad-label {
        font-size: clamp(20px, 2.2vw, 24px);
      }
    }

    /* Side-by-side CRT Picture Monitor + 2x2 Desk ONLY when bay itself >= 600px (and height > 500px)! */
    @media (min-height: 501px) {
      @container ws7toy (min-width: 600px) {
        .ws7-picture-shell {
          display: grid;
          grid-template-columns: minmax(216px, 240px) minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
        }
        .ws7-picture-crt {
          flex-direction: column;
          justify-content: center;
          text-align: center;
          padding: 10px;
          gap: 7px;
        }
        .ws7-picture-screen {
          flex: 0 0 auto;
          width: 100%;
          max-width: 216px;
          height: auto;
          aspect-ratio: 160 / 100;
        }
        .ws7-picture-meta {
          align-items: center;
          text-align: center;
        }
      }
    }

    @container ws7toy (max-width: 539px) {
      .ws7-classic-pads-grid {
        gap: 7px;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 54px;
        padding: 6px 11px 6px 9px;
      }
      .ws7-picture-crt {
        padding: 5px 9px;
      }
      .ws7-picture-screen {
        flex: 0 0 124px;
        width: 124px;
        height: 78px;
      }
    }

    /* ========================================================================
       2. TOY_02_CONFIDENCE_PNEUMATIC — 1966 Double-or-Safe Wager Desk
       ======================================================================== */
    .ws7-pneumatic-rack {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 7px;
      width: 100%;
    }
    @media (min-height: 501px) {
      @container ws7toy (min-width: 600px) {
        .ws7-pneumatic-rack {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
      }
    }
    .ws7-pneumatic-row {
      display: grid;
      grid-template-columns: 78px minmax(0, 1fr) 78px;
      align-items: stretch;
      gap: 6px;
      padding: 4px;
      border-radius: 14px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 72%, #F2E3C6 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 3px 0 #C5AE84,
        0 6px 14px rgba(30, 20, 14, 0.24);
      transition: transform 0.1s ease, box-shadow 0.12s ease, opacity 0.14s ease;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-pneumatic-row {
        grid-template-columns: 74px minmax(0, 1fr) 74px;
        gap: 4px;
      }
    }
    .ws7-pneumatic-port {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      min-width: 64px;
      padding: 4px 5px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: 0.02em;
      transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease;
    }
    .ws7-pneumatic-port:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .ws7-pneumatic-port:active:not(:disabled) {
      transform: translateY(2px);
    }
    .ws7-port-insured {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 46%),
        linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.52), 0 3px 0 #005E69;
    }
    .ws7-port-spike {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 46%),
        linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.52), 0 3px 0 #A8340E;
    }
    .ws7-pneumatic-slip {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 4px 6px;
      min-width: 0;
      text-align: center;
      gap: 2px;
    }

    /* ========================================================================
       3. TOY_03_VERNIER_DIAL — *Price Is Right* Living Color Range Dial
       ======================================================================== */
    .ws7-vernier-layout {
      display: grid;
      grid-template-columns: 152px minmax(0, 1fr);
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }
    .ws7-vernier-wheel-box {
      position: relative;
      width: 152px;
      height: 152px;
      margin: 0 auto;
      touch-action: none;
      cursor: grab;
    }
    @container ws7toy (min-width: 460px) {
      .ws7-vernier-layout {
        grid-template-columns: 186px minmax(0, 1fr);
        gap: 16px;
      }
      .ws7-vernier-wheel-box {
        width: 186px;
        height: 186px;
      }
    }
    .ws7-vernier-wheel-box:active {
      cursor: grabbing;
    }
    .ws7-vernier-readout-card {
      width: 100%;
      padding: 2px 0;
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: #FFF6E3;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .ws7-dial-solari-plaque {
      padding: 7px 10px;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 48%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 70%, #F0DFBF 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 3px 0 #C2AA7E,
        0 5px 12px rgba(30, 20, 14, 0.28);
      color: #141B29;
      font-family: var(--ws7-toy-num);
      font-size: clamp(20px, 2.6vw, 25px);
      font-weight: 800;
      text-align: center;
      line-height: 1.15;
    }
    .ws7-range-exact-pill {
      display: none;
      padding: 4px 8px;
      border-radius: 8px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.03em;
      text-align: center;
      line-height: 1.15;
      animation: ws7RevealPop 0.2s ease-out both;
    }
    .ws7-range-exact-pill.is-hit {
      display: block;
      background: #128547;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #86EFAC, 0 0 14px rgba(34, 197, 94, 0.65);
    }
    .ws7-range-exact-pill.is-miss {
      display: block;
      background: #B91C1C;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #FFD166, 0 0 14px rgba(239, 68, 68, 0.65);
    }
    .ws7-dial-nudge-pair {
      display: grid;
      grid-template-columns: repeat(2, minmax(48px, 1fr));
      gap: 8px;
    }
    .ws7-step-nudge-btn {
      min-width: 48px;
      min-height: 48px;
      border: none;
      border-radius: 11px;
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #005B66;
      font-family: var(--ws7-toy-caps);
      font-size: 22px;
      font-weight: 900;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.08s ease, filter 0.1s ease;
    }
    .ws7-step-nudge-btn:hover {
      filter: brightness(1.08);
    }
    .ws7-step-nudge-btn:active {
      transform: translateY(2px);
    }
    .ws7-studio-lock-btn {
      min-height: 48px;
      min-width: 96px;
      width: 100%;
      padding: 8px 14px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 48%),
        linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      color: #FFFDF7;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.52),
        0 4px 0 #A8340E,
        0 6px 14px rgba(235, 85, 37, 0.38);
      font-family: var(--ws7-toy-caps);
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.05em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: transform 0.1s ease, filter 0.1s ease;
    }
    .ws7-studio-lock-btn:hover:not(:disabled) {
      filter: brightness(1.07);
    }
    .ws7-studio-lock-btn:active:not(:disabled) {
      transform: translateY(3px);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 1px 0 #A8340E;
    }
    .ws7-studio-lock-btn:disabled {
      opacity: 0.54;
      cursor: not-allowed;
      filter: saturate(0.55);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32), 0 2px 0 #7C2D12;
    }

    /* ========================================================================
       4. TOY_04_BALANCE_SCALE — Golden Studio Twin-Pan Scale
       ======================================================================== */
    .ws7-scale-stage {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
    .ws7-scale-svg-wrap {
      width: 100%;
      height: clamp(98px, 24vh, 124px);
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
      overflow: visible;
    }
    .ws7-weights-rack {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    @container ws7toy (min-width: 500px) {
      .ws7-weights-rack {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
    .ws7-brass-weight {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 54px;
      min-width: 52px;
      padding: 10px 6px 6px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFE082 0%, #F4A91F 72%, #D48806 100%);
      color: #141B29;
      cursor: pointer;
      text-align: center;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.82),
        0 3px 0 #9E6300,
        0 5px 12px rgba(0, 0, 0, 0.28);
      transition: transform 0.12s cubic-bezier(0.22, 1.3, 0.36, 1), box-shadow 0.12s ease, opacity 0.14s ease;
    }
    .ws7-brass-weight::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(180deg, #9E6300 0%, #6E4300 100%);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    .ws7-brass-weight:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.05);
    }
    .ws7-brass-weight:disabled:not(.is-on-pan):not(.is-reveal-correct):not(.is-reveal-wrong):not(.is-fifty-cut) {
      opacity: 0.48;
      cursor: not-allowed;
      filter: saturate(0.62);
    }
    .ws7-brass-weight.is-on-pan {
      transform: translateY(-4px);
      background: linear-gradient(180deg, #FFFDF5 0%, #FFE484 65%, #F4A91F 100%);
      box-shadow:
        0 0 0 3px #00E5FF,
        0 6px 16px rgba(0, 229, 255, 0.48);
    }
    .ws7-brass-weight.is-reveal-correct,
    .ws7-sleeper-slot.is-reveal-correct,
    .ws7-jack-socket.is-reveal-correct,
    .ws7-pin-card.is-reveal-correct,
    .ws7-cyano-legend-btn.is-reveal-correct {
      opacity: 1 !important;
      background: linear-gradient(180deg, #E8FFF1 0%, #B8F7D2 62%, #7CEBA8 100%) !important;
      color: #141B29 !important;
      box-shadow: 0 0 0 3px #22C55E, 0 0 22px rgba(34, 197, 94, 0.8) !important;
    }
    .ws7-brass-weight.is-reveal-wrong,
    .ws7-sleeper-slot.is-reveal-wrong,
    .ws7-jack-socket.is-reveal-wrong,
    .ws7-pin-card.is-reveal-wrong,
    .ws7-cyano-legend-btn.is-reveal-wrong {
      opacity: 1 !important;
      background: linear-gradient(180deg, #FFF0F0 0%, #FFD0CE 62%, #FCA5A5 100%) !important;
      color: #141B29 !important;
      box-shadow: 0 0 0 3px #EF4444, 0 0 20px rgba(239, 68, 68, 0.78) !important;
    }

    /* 5. TOY_05_RELIEF_GLOBE_3D Walnut & Brushed-Brass Turntable Rim */
    .ws7-globe-cradle-frame {
      width: 100%;
      height: clamp(192px, 32vh, 252px);
      border-radius: 15px;
      padding: 4px;
      background:
        linear-gradient(180deg, #7A4426 0%, #4E2712 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 178, 0.42),
        inset 0 0 0 2px #D6B485,
        0 6px 18px rgba(30, 20, 14, 0.44);
      overflow: hidden;
    }

    /* ========================================================================
       6. TOY_06_FUSE_WIRE_SNIPPER — Studio Cable Cutout + Bank Cash Lever
       ======================================================================== */
    .ws7-fuse-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 110px;
      gap: 8px;
      width: 100%;
      align-items: stretch;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-fuse-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
      }
      .ws7-bailout-latch {
        flex-direction: row !important;
        min-height: 48px !important;
        padding: 6px 14px !important;
        gap: 10px !important;
      }
    }
    .ws7-fuse-wires-col {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;
    }
    @media (min-height: 501px) {
      @container ws7toy (min-width: 600px) {
        .ws7-fuse-wires-col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
      }
    }
    .ws7-fuse-wire-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 6px 10px;
      min-height: 48px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s ease, opacity 0.14s ease, box-shadow 0.12s ease;
    }
    .ws7-fuse-wire-btn:active:not(:disabled) {
      transform: translateY(2px);
    }
    .ws7-fuse-wire-btn.is-snipped {
      opacity: 0.56;
      background: linear-gradient(180deg, #DCE6F0 0%, #C5D3E2 100%);
      cursor: default;
    }
    .ws7-bailout-latch {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-height: 52px;
      min-width: 96px;
      padding: 8px 8px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(180deg, #6E3B23 0%, #4F2917 100%);
      color: #FFF6E3;
      box-shadow: 0 4px 0 #241309;
      cursor: not-allowed;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.18;
    }
    .ws7-bailout-latch.is-armed {
      cursor: pointer;
      background: linear-gradient(180deg, #FFD875 0%, #F4A91F 70%, #D48806 100%);
      color: #141B29;
      animation: ws7GoldPulse 0.7s ease-in-out infinite alternate;
    }

    /* ========================================================================
       7. TOY_07_MAIL_SORTER — Studio Mailbag Twin-Chute Sorter
       ======================================================================== */
    .ws7-sorter-layout {
      display: grid;
      grid-template-columns: minmax(88px, 124px) minmax(0, 1fr) minmax(88px, 124px);
      gap: 8px;
      width: 100%;
      min-height: 148px;
      align-items: stretch;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-sorter-layout {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas:
          "deck deck"
          "left right";
        min-height: 0;
        gap: 8px;
      }
      .ws7-sorter-layout .ws7-sorter-deck {
        grid-area: deck;
        min-height: 92px;
      }
      .ws7-sorter-layout .ws7-chute-btn[data-chute="0"] {
        grid-area: left;
      }
      .ws7-sorter-layout .ws7-chute-btn[data-chute="1"] {
        grid-area: right;
      }
    }
    .ws7-sorter-deck {
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 3px 0 #C4AC82,
        0 6px 0 #EFE1C6,
        0 8px 0 #AD956B,
        0 12px 18px rgba(30, 20, 14, 0.34) !important;
    }
    .ws7-sorter-deck.is-sort-hit {
      box-shadow: 0 0 0 3px #22C55E, 0 0 22px rgba(34, 197, 94, 0.72) !important;
    }
    .ws7-sorter-deck.is-sort-miss {
      box-shadow: 0 0 0 3px #EF4444, 0 0 22px rgba(239, 68, 68, 0.72) !important;
    }
    .ws7-chute-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 56px;
      min-width: 84px;
      padding: 10px 8px;
      border: none;
      border-radius: 14px;
      color: #FFFDF7;
      cursor: pointer;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.2;
      transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.14s ease;
    }
    .ws7-chute-btn[data-chute="0"] {
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #005C66;
    }
    .ws7-chute-btn[data-chute="1"] {
      background: linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #A8340E;
    }
    .ws7-chute-btn.is-lifeline-hint {
      box-shadow: 0 0 0 3px #FFD166, 0 0 22px rgba(255, 209, 102, 0.85);
    }
    .ws7-chute-btn:hover {
      filter: brightness(1.08);
    }
    .ws7-chute-btn:active {
      transform: translateY(2px);
    }

    /* ========================================================================
       8. TOY_08_CHRONOLOGY_RAIL — 1966 Time-Tunnel Broadcast Timeline
       ======================================================================== */
    .ws7-chrono-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-sleepers-row {
      position: relative;
      display: grid;
      gap: 6px;
      width: 100%;
    }
    .ws7-sleepers-row::before {
      content: '';
      position: absolute;
      left: 6px;
      right: 6px;
      bottom: 2px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, #9E6300 0%, #FFD166 50%, #9E6300 100%);
      opacity: 0.55;
      pointer-events: none;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-sleepers-row {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }
    .ws7-chrono-year-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      padding: 1px 6px;
      border-radius: 5px;
      background: #5C301B;
      color: #FFD166;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.03em;
    }
    .ws7-sleeper-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      min-width: 52px;
      padding: 5px 6px;
      border: none;
      border-bottom: 4px solid #F4A91F;
      border-radius: 10px 10px 4px 4px;
      background: rgba(255, 246, 227, 0.08);
      color: #FFD166;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.16;
      transition: transform 0.14s cubic-bezier(0.22, 1.3, 0.36, 1);
    }
    .ws7-sleeper-slot.is-filled {
      border: none;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF7 0%, #FFF6E3 72%, #F2E3C6 100%);
      box-shadow: inset 0 2px 0 #FFFFFF, 0 3px 0 #C5AE84;
      color: #141B29;
      cursor: pointer;
    }
    .ws7-plaques-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    .ws7-plaque-btn {
      min-height: 50px;
      padding: 7px 10px;
      cursor: pointer;
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 4px;
      transition: transform 0.1s ease, opacity 0.14s ease;
    }
    .ws7-plaque-btn:active {
      transform: translateY(2px);
    }
    .ws7-plaque-btn.is-placed {
      opacity: 0.32;
      pointer-events: none;
    }

    /* ========================================================================
       9. TOY_09_SWITCHBOARD_PATCHBAY — 1966 Network Control Patchboard
       ======================================================================== */
    .ws7-patchbay-stage {
      position: relative;
      display: grid;
      grid-template-columns: minmax(110px, 1fr) 48px minmax(110px, 1fr);
      gap: 0;
      width: 100%;
      padding: 6px;
      border-radius: 13px;
      background:
        radial-gradient(circle at 8px 8px, #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        radial-gradient(circle at calc(100% - 8px) 8px, #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        radial-gradient(circle at 8px calc(100% - 8px), #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        radial-gradient(circle at calc(100% - 8px) calc(100% - 8px), #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        linear-gradient(180deg, rgba(110, 59, 35, 0.42) 0%, rgba(44, 24, 16, 0.68) 100%);
      box-shadow: inset 0 0 0 1.8px rgba(244, 169, 31, 0.45), 0 5px 14px rgba(30, 20, 14, 0.34);
      align-items: stretch;
    }
    .ws7-patch-col {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: 5px;
      z-index: 2;
    }
    .ws7-caller-plug, .ws7-jack-socket {
      min-height: 48px;
      padding: 6px 9px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      text-align: left;
      font-size: 14.5px;
      font-weight: 700;
      line-height: 1.18;
    }
    .ws7-caller-plug.is-armed {
      box-shadow:
        0 0 0 3px #FFD166,
        0 0 18px rgba(255, 209, 102, 0.78);
    }

    /* ========================================================================
       10. TOY_10_CLIFFHANGERS_THROTTLE — Alpine Mountain Range Slider
       ======================================================================== */
    .ws7-cliff-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-cliff-controls-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 124px;
      gap: 10px;
      align-items: center;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-cliff-controls-row {
        grid-template-columns: minmax(0, 1fr) 110px;
        gap: 8px;
      }
    }
    .ws7-throttle-track {
      position: relative;
      width: 100%;
      min-height: 52px;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      touch-action: none;
      cursor: ew-resize;
      display: flex;
      align-items: center;
      padding: 0 24px;
    }

    /* ========================================================================
       11. TOY_11_MISSING_VOWELS_WHEEL — *Concentration / Wheel* Letter Board
       ======================================================================== */
    .ws7-vowels-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-solari-rack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 6px 14px;
      padding: 8px 10px;
      min-height: 54px;
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(79, 41, 23, 0.88) 0%, rgba(110, 59, 35, 0.78) 100%);
      border-bottom: 3px solid #F4A91F;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
    }
    .ws7-solari-word {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: nowrap;
    }
    .ws7-flap-tile {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 34px;
      padding: 0 5px;
      border-radius: 6px;
      background: linear-gradient(180deg, #FFFFFF 0%, #FFF6E3 48%, #EFE0BE 52%, #FFF6E3 100%);
      box-shadow: inset 0 1.5px 0 #FFFFFF, 0 2px 0 #B8A27A;
      color: #141B29;
      font-family: var(--ws7-toy-caps);
      font-size: 16px;
      font-weight: 900;
      line-height: 1;
    }
    .ws7-flap-tile::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1.2px;
      background:
        radial-gradient(circle at 3px 50%, #7E6842 1.4px, transparent 1.7px),
        radial-gradient(circle at calc(100% - 3px) 50%, #7E6842 1.4px, transparent 1.7px),
        rgba(20, 27, 41, 0.28);
      pointer-events: none;
    }
    .ws7-flap-tile.is-blank {
      background: linear-gradient(180deg, #FFE896 0%, #F4A91F 100%);
      box-shadow: 0 2px 0 #A86B00, 0 0 10px rgba(255, 209, 102, 0.6);
      color: #141B29;
    }
    .ws7-flap-tile.is-revealed {
      background: linear-gradient(180deg, #FFFDF5 0%, #7EF2AD 100%);
      animation: ws7VowelPop 0.24s ease-out both;
    }
    .ws7-drums-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
    }
    .ws7-vowel-drum {
      min-height: 52px;
      padding: 8px 10px;
      border: none;
      border-radius: 13px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 70%, #F2E3C6 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 #F4A91F,
        0 3px 0 #C5AE84,
        0 6px 14px rgba(30, 20, 14, 0.24);
      color: #141B29;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-family: var(--ws7-toy-num);
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      line-height: 1.2;
      transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.14s ease;
    }
    .ws7-vowel-drum:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    .ws7-vowel-drum:active:not(:disabled) {
      transform: translateY(2px);
    }
    .ws7-vowel-drum .ws7-choice-copy {
      display: inline;
      text-align: center;
      line-height: 1.5;
    }
    .ws7-vowel-tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 28px;
      padding: 0 5px;
      margin: 1px 1.5px;
      border-radius: 5px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FFE896 100%);
      border: 1.5px solid #C89228;
      box-shadow: 0 2px 0 #8A5A16, inset 0 1px 0 #FFFFFF;
      font-family: var(--ws7-toy-num);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.02em;
      color: #141B29;
      vertical-align: middle;
    }

    /* ========================================================================
       12. TOY_12_CONSPIRACY_LASSO — 3x3 Pop-Modernist TV Lightboard
       ======================================================================== */
    .ws7-corkboard {
      position: relative;
      width: 100%;
      padding: 2px 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: repeat(3, minmax(48px, 1fr));
      gap: 7px;
      touch-action: none;
    }
    .ws7-pin-card {
      position: relative;
      min-height: 50px;
      padding: 10px 6px 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      text-align: center;
      cursor: pointer;
      z-index: 1;
      font-family: var(--ws7-toy-sans);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.16;
      color: #141B29;
      transition: transform 0.1s ease, box-shadow 0.12s ease, opacity 0.14s ease;
    }
    .ws7-pin-card.is-lassoed {
      transform: translateY(-2px);
      background: linear-gradient(180deg, #FFFDF5 0%, #FFE89E 100%);
      box-shadow: 0 0 0 3px #FF6738, 0 5px 14px rgba(255, 103, 56, 0.5);
    }
    .ws7-brass-tack {
      position: absolute;
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle at 32% 30%, #FFFFFF 0%, #FF6738 48%, #9E1F0C 100%);
      box-shadow: 0 0 0 1.5px #FFD166, 0 2px 3px rgba(30, 20, 14, 0.55);
    }

    /* ========================================================================
       13. TOY_13_CYANOTYPE_LOUPE — 1966 RCA Color TV Visual Monitor
       ======================================================================== */
    .ws7-cyano-outer {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    @media (min-height: 501px) {
      @container ws7toy (min-width: 580px) {
        .ws7-cyano-outer[data-has-legend="true"] {
          display: grid;
          grid-template-columns: minmax(300px, 1.18fr) minmax(220px, 1fr);
          gap: 12px;
          align-items: center;
        }
        .ws7-cyano-legend-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    }
    .ws7-cyanotype-wrap {
      position: relative;
      width: 100%;
      height: clamp(162px, 27vh, 222px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 14px;
      padding: 4px;
      background:
        radial-gradient(circle at 7px 7px, #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        radial-gradient(circle at calc(100% - 7px) 7px, #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        radial-gradient(circle at 7px calc(100% - 7px), #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        radial-gradient(circle at calc(100% - 7px) calc(100% - 7px), #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        repeating-linear-gradient(
          92deg,
          rgba(255, 224, 178, 0.06) 0px,
          rgba(255, 224, 178, 0.06) 3px,
          rgba(34, 14, 4, 0.09) 3px,
          rgba(34, 14, 4, 0.09) 8px
        ),
        linear-gradient(180deg, #8A4D2A 0%, #63341A 56%, #4A2410 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 178, 0.45),
        inset 0 0 0 2px #D6B485,
        0 6px 18px rgba(30, 20, 14, 0.45);
    }
    .ws7-cyanotype-wrap::after {
      content: '';
      position: absolute;
      inset: 4px 4px auto 4px;
      height: 22%;
      border-radius: 10px 10px 40% 40%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 100%);
      pointer-events: none;
    }
    .ws7-cyano-legend-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    .ws7-cyano-legend-btn {
      min-height: 48px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      gap: 3px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s ease, opacity 0.14s ease;
    }
    .ws7-cyano-legend-btn:active:not(:disabled) {
      transform: translateY(2px);
    }

    /* ========================================================================
       14. TOY_14_FOUR_SHUTTER_REEL — 1966 *Laugh-In* Pop-Color 4-Shutter Wall
       ======================================================================== */
    .ws7-shutter-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-shutter-top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 108px;
      gap: 8px;
      align-items: stretch;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-shutter-top {
        grid-template-columns: minmax(0, 1fr) 98px;
        gap: 6px;
      }
    }
    .ws7-shutters-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(2, minmax(44px, 1fr));
      gap: 6px;
    }
    .ws7-shutter-window {
      position: relative;
      padding: 6px 8px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: var(--ws7-toy-sans);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.18;
      min-height: 44px;
    }
    .ws7-shutter-window.is-closed::before {
      content: '';
      position: absolute;
      inset: 4px 6px;
      border-radius: 6px;
      background: repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.14) 0px,
        rgba(255, 255, 255, 0.14) 2px,
        rgba(0, 0, 0, 0.12) 2px,
        rgba(0, 0, 0, 0.12) 7px
      );
      pointer-events: none;
    }
    .ws7-shutter-window.is-closed::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 14px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFE484 0%, #B87000 100%);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }
    .ws7-shutter-window.is-closed > span {
      position: relative;
      z-index: 1;
    }
    .ws7-shutter-window.is-newly-opened {
      animation: ws7ShutterOpen 0.22s cubic-bezier(0.22, 1.2, 0.36, 1) both;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="0"] {
      background: linear-gradient(180deg, #00C2D6 0%, #008594 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #005863;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="1"] {
      background: linear-gradient(180deg, #FFCB52 0%, #E89B0C 100%);
      color: #141B29;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.6), 0 3px 0 #A36800;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="2"] {
      background: linear-gradient(180deg, #3B79F2 0%, #1746A2 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #123884;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="3"] {
      background: linear-gradient(180deg, #F45B96 0%, #C92663 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #8C1541;
    }
    .ws7-crack-lever {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-height: 52px;
      min-width: 96px;
      padding: 6px 6px;
      border: none;
      border-radius: 13px;
      background: linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #A8340E;
      color: #FFFDF7;
      cursor: pointer;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      line-height: 1.15;
    }
    .ws7-crack-lever:disabled {
      opacity: 0.72;
      background: linear-gradient(180deg, #008B94 0%, #005A63 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
      cursor: default;
    }
    .ws7-shutter-ladder-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 9px;
      border-radius: 999px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.15;
      white-space: nowrap;
      transition: background 0.16s ease, box-shadow 0.16s ease, color 0.16s ease;
    }
    .ws7-shutter-ladder-badge[data-tier="2.0"] {
      background: linear-gradient(90deg, #FF6B35 0%, #F2A922 100%);
      color: #141B29;
      box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.7), 0 0 14px rgba(255, 184, 48, 0.75);
    }
    .ws7-shutter-ladder-badge[data-tier="1.6"] {
      background: linear-gradient(90deg, #00A8B8 0%, #008B94 100%);
      color: #FFFDF7;
      box-shadow: inset 0 0 0 1.5px #FFD166, 0 0 10px rgba(0, 196, 212, 0.5);
    }
    .ws7-shutter-ladder-badge[data-tier="1.3"] {
      background: linear-gradient(90deg, #2563EB 0%, #1746A2 100%);
      color: #FFFDF7;
      box-shadow: inset 0 0 0 1.5px #FFD166;
    }
    .ws7-shutter-ladder-badge[data-tier="1.0"] {
      background: rgba(44, 24, 16, 0.92);
      color: #FFF6E3;
      box-shadow: inset 0 0 0 1.5px rgba(255, 209, 102, 0.55);
    }
    .ws7-shutter-keys {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }
    .ws7-shutter-key-btn {
      min-height: 48px;
      padding: 6px 10px;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transition: transform 0.1s ease, box-shadow 0.12s ease, opacity 0.14s ease;
    }

    /* ========================================================================
       Compact Mobile Portrait (390x660 / <=700px height WITH Lifeline Bar + Twist Flare):
       ZERO scrollY/scrollX overflow AND generous breathing room across ALL 14 toys!
       ======================================================================== */
    @media (max-height: 700px) and (orientation: portrait) {
      .ws7-toy-root {
        gap: 5px;
      }
      .ws7-lifeline-ribbon {
        padding: 3px 8px;
        gap: 5px;
        line-height: 1.15;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 48px;
        padding: 5px 10px 5px 8px;
      }
      .ws7-picture-crt {
        padding: 4px 8px;
        gap: 8px;
      }
      .ws7-picture-screen {
        flex: 0 0 112px;
        width: 112px;
        height: 70px;
      }
      .ws7-scale-svg-wrap {
        height: 92px;
      }
      .ws7-brass-weight {
        min-height: 48px;
        padding: 8px 5px 5px;
      }
      .ws7-chrono-layout {
        gap: 5px;
      }
      .ws7-sleeper-slot {
        min-height: 48px;
        padding: 4px 5px;
      }
      .ws7-plaque-btn {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-patchbay-stage {
        padding: 4px 7px;
      }
      .ws7-patch-col {
        gap: 4px;
      }
      .ws7-caller-plug, .ws7-jack-socket {
        min-height: 48px;
        padding: 3px 8px;
      }
      .ws7-cyano-outer {
        gap: 5px;
      }
      .ws7-cyanotype-wrap {
        height: 132px;
      }
      .ws7-cyano-legend-grid {
        gap: 5px;
      }
      .ws7-cyano-legend-btn {
        min-height: 48px;
        padding: 4px 8px;
        gap: 2px;
      }
    }

    @media (max-width: 480px) {
      .ws7-binary-banner,
      .ws7-cue-style-banner {
        gap: 6px;
        padding: 5px 8px;
        font-size: 13px;
        letter-spacing: 0.02em;
        line-height: 1.18;
      }
      .ws7-binary-banner > span,
      .ws7-cue-style-banner > span {
        min-width: 0;
      }
    }

    /* ========================================================================
       Compact Mobile Landscape (844x390 / <=500px height):
       ZERO scrollbars inside <=326px right column, EVERY button >=48px, >=14.5px!
       ======================================================================== */
    @media (max-height: 500px) and (orientation: landscape) {
      .ws7-toy-root {
        gap: 4px;
      }
      .ws7-lifeline-ribbon {
        padding: 2px 7px;
        gap: 4px;
        line-height: 1.12;
      }
      .ws7-showcase-prompt {
        padding: 0 2px;
        font-size: 14.5px;
      }
      .ws7-wire-masthead,
      .ws7-klaxon-banner,
      .ws7-binary-banner {
        padding: 3px 9px;
      }
      .ws7-picture-crt {
        padding: 4px 8px;
        gap: 8px;
      }
      .ws7-picture-screen {
        flex: 0 0 104px;
        width: 104px;
        height: 65px;
      }
      .ws7-picture-dials {
        display: none;
      }
      .ws7-choice-copy {
        font-size: 14.5px;
        line-height: 1.15;
      }
      .ws7-classic-pads-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 54px;
        gap: 8px;
        padding: 6px 10px 6px 8px;
      }
      .ws7-studio-pad.ws7-binary-paddle {
        min-height: 98px;
      }
      .ws7-pad-medallion {
        flex: 0 0 34px;
        width: 34px;
        height: 34px;
        border-radius: 9px;
        font-size: 16px;
      }
      .ws7-pad-body {
        padding-right: 4px;
      }
      .ws7-pad-label {
        font-size: clamp(14.5px, 1.75vw, 16.5px);
        line-height: 1.18;
      }
      .ws7-studio-pad[data-long-word="true"] .ws7-pad-label {
        font-size: 14.5px;
        letter-spacing: -0.02em;
        overflow-wrap: break-word;
      }
      .ws7-pad-lamp {
        flex: 0 0 10px;
        width: 10px;
        height: 10px;
      }
      .ws7-pneumatic-rack {
        gap: 4px;
      }
      .ws7-pneumatic-row {
        padding: 2px 3px;
        gap: 4px;
      }
      .ws7-pneumatic-port {
        min-height: 48px;
        padding: 2px 4px;
      }
      .ws7-pneumatic-slip {
        padding: 2px 4px;
      }
      .ws7-vernier-layout {
        grid-template-columns: 158px minmax(0, 1fr);
        gap: 10px;
      }
      .ws7-vernier-wheel-box {
        width: 158px;
        height: 158px;
      }
      .ws7-vernier-readout-card {
        padding: 4px 6px;
        gap: 5px;
      }
      .ws7-scale-svg-wrap {
        height: 78px;
      }
      .ws7-brass-weight {
        min-height: 48px;
        padding: 6px 4px 4px;
      }
      .ws7-fuse-wires-col {
        gap: 5px;
      }
      .ws7-sorter-layout {
        min-height: 130px;
      }
      .ws7-sleeper-slot {
        min-height: 48px;
        padding: 4px 5px;
      }
      .ws7-plaques-grid {
        gap: 5px;
      }
      .ws7-plaque-btn {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-patchbay-stage {
        padding: 3px 6px;
      }
      .ws7-patch-col {
        gap: 3px;
      }
      .ws7-caller-plug, .ws7-jack-socket {
        min-height: 48px;
        padding: 2px 7px;
      }
      .ws7-solari-rack {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-flap-tile {
        height: 28px;
        font-size: 15px;
      }
      .ws7-drums-grid {
        gap: 5px;
      }
      .ws7-vowel-drum {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-corkboard {
        padding: 4px;
        gap: 5px;
        grid-template-rows: repeat(3, minmax(48px, 1fr));
      }
      .ws7-pin-card {
        min-height: 48px;
        padding: 8px 4px 3px;
      }
      .ws7-cyano-outer {
        gap: 4px;
      }
      .ws7-cyanotype-wrap {
        height: 118px;
      }
      .ws7-cyano-legend-grid {
        gap: 4px;
      }
      .ws7-cyano-legend-btn {
        min-height: 48px;
        padding: 3px 7px;
        gap: 1px;
      }
      .ws7-shutters-grid {
        grid-template-rows: repeat(2, minmax(38px, 1fr));
        gap: 4px;
      }
      .ws7-shutter-window {
        min-height: 38px;
        padding: 3px 6px;
      }
      .ws7-shutter-keys {
        gap: 5px;
      }
      .ws7-shutter-key-btn {
        min-height: 48px;
        padding: 4px 8px;
      }
    }
  `)}function W(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ye(a){const e={SCI_TECH:'<ellipse cx="9" cy="9" rx="7" ry="3.2" transform="rotate(-32 9 9)" fill="none" stroke="#00B4C7" stroke-width="1.5"/><ellipse cx="9" cy="9" rx="7" ry="3.2" transform="rotate(32 9 9)" fill="none" stroke="#D48806" stroke-width="1.5"/><circle cx="9" cy="9" r="2.2" fill="#141B29"/>',POP_LIT:'<polygon points="9,1.5 11,6.8 16.5,7 12.2,10.5 13.7,16 9,12.8 4.3,16 5.8,10.5 1.5,7 7,6.8" fill="#F4A91F" stroke="#141B29" stroke-width="1.1"/>',NUM_GEO:'<circle cx="9" cy="9" r="7" fill="#0096A6" stroke="#141B29" stroke-width="1.3"/><ellipse cx="9" cy="9" rx="3.3" ry="7" fill="none" stroke="#FFFDF7" stroke-width="1.1"/><line x1="2" y1="9" x2="16" y2="9" stroke="#FFFDF7" stroke-width="1.1"/>',HIST_FACT:'<polygon points="9,1 10.8,7.2 17,9 10.8,10.8 9,17 7.2,10.8 1,9 7.2,7.2" fill="#E6397A" stroke="#141B29" stroke-width="1"/><circle cx="9" cy="9" r="2.3" fill="#FFD166"/>'};return`<svg width="15" height="15" viewBox="0 0 18 18" style="flex:0 0 auto;display:inline-block;" aria-hidden="true">${e[a]??e.SCI_TECH}</svg>`}function Ta(){return'<svg width="15" height="15" viewBox="0 0 18 18" fill="none" style="flex:0 0 auto;display:inline-block;vertical-align:-2px;" aria-hidden="true"><circle cx="4.6" cy="4.8" r="2.3" stroke="currentColor" stroke-width="1.8"/><circle cx="4.6" cy="13.2" r="2.3" stroke="currentColor" stroke-width="1.8"/><path d="M6.6,6.1 L15.5,12.8 M6.6,11.9 L15.5,5.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'}function Le(){return'<svg width="15" height="15" viewBox="0 0 18 18" fill="currentColor" style="flex:0 0 auto;display:inline-block;vertical-align:-2px;" aria-hidden="true"><rect x="2" y="9" width="3.6" height="7" rx="1"/><rect x="7.2" y="3" width="3.6" height="13" rx="1"/><rect x="12.4" y="6.2" width="3.6" height="9.8" rx="1"/></svg>'}const Yt=/^(?:u\.?\s*s\.?\s*(?:highway|hwy|route|rte)|interstate|i-|highway|hwy|route|rte|state\s+route|sr|channel|ch\.?|apollo|studio|stage|floor|pier|no\.?|#|flight|sts-|episode|ep\.?|season|act|round|turn|level|tier|grade|class|mark|mk\.?|type|model|room|suite|deck|gate|track|line|platform|exit|milepost|ward|district|precinct|station|base|zone|sector|box|curtain|door|vault|safe|number)\b/i;function ht(a,e){const n=e.trim();return n?/^[$£€¥]$/.test(n)?`${n}${a}`:/^(?:%|¢|°[FC]?|′|″)$/.test(n)?`${a}${n}`:n==="#"||/^i-$/i.test(n)||/^sts-$/i.test(n)?`${n}${a}`:Yt.test(n)?`${n} ${a}`:`${a} ${n}`:a}function Rt(a,e,n,t=" – "){const h=n.trim();return h?/^[$£€¥]$/.test(h)||h==="#"||/^i-$/i.test(h)||/^sts-$/i.test(h)?`${h}${a}${t}${h}${e}`:/^(?:%|¢|°[FC]?|′|″)$/.test(h)?`${a}${h}${t}${e}${h}`:Yt.test(h)?`${h} ${a}${t}${e}`:`${a}${t}${e} ${h}`:`${a}${t}${e}`}function Ge(a,e){const n=a.closest(".ws7-question-chassis");if(!n)return;const t=e??a.querySelector(".ws7-toy-root")?.dataset.cardStyle,h=n.querySelector(".ws7-balanced-copy");if(h){const b=h.textContent??"",x=/(\[\s*_+\s*\])/.test(b),o=t==="BEFORE_OR_AFTER";if(x&&!h.querySelector(".ws7-blank-nowrap")||o&&!h.querySelector(".ws7-time-emphasis")){const c=o?/(\[\s*_+\s*\]|\b(?:FIRST|EARLIER|BEFORE|LATER|AFTER|LAST)\b)/g:/(\[\s*_+\s*\])/g,l=o&&/\b(?:FIRST|EARLIER|BEFORE|LATER|AFTER|LAST)\b/.test(b),O=o&&!l?/(\[\s*_+\s*\]|\b(?:first|earlier|before|later|after|last)\b(?!\s+or\s+(?:after|before)\??))/gi:c;if(O.test(b)){O.lastIndex=0;const H=document.createDocumentFragment();let U=0,q;for(;(q=O.exec(b))!==null;){q.index>U&&H.appendChild(document.createTextNode(b.slice(U,q.index)));const B=q[1];if(/^\[\s*_+\s*\]$/.test(B)){const j=document.createElement("span");j.className="ws7-blank-nowrap",j.textContent=B.replace(/\s+/g," "),H.appendChild(j)}else{const j=document.createElement("span"),Y=/^(FIRST|EARLIER|BEFORE)$/i.test(B);j.className=`ws7-time-emphasis ${Y?"ws7-time-emphasis--early":"ws7-time-emphasis--late"}`,j.textContent=B,H.appendChild(j)}U=q.index+q[0].length}U<b.length&&H.appendChild(document.createTextNode(b.slice(U))),h.textContent="",h.appendChild(H)}}}n.querySelectorAll(".ws7-lifeline-btn").forEach(b=>{if(b.querySelector(".ws7-lifeline-copy-stack"))return;const x=(b.textContent??"").trim();if(x){if(b.dataset.lifeline==="fifty-fifty"||/✂/.test(x)){const o=x.replace(/✂\uFE0F?\s*/g,"").trim();b.innerHTML=`<span style="display:inline-flex;align-items:center;justify-content:center;gap:6px;">${Ta()}<span>${W(o)}</span></span>`}else if(b.dataset.lifeline==="audience-poll"||/📊/.test(x)){const o=x.replace(/📊\s*/g,"").trim();b.innerHTML=`<span style="display:inline-flex;align-items:center;justify-content:center;gap:6px;">${Le()}<span>${W(o)}</span></span>`}}})}function ve(a,e){const n=document.createElement("div");n.className="ws7-showcase-prompt";const t='<svg width="15" height="15" viewBox="0 0 18 18" style="flex:0 0 auto;vertical-align:-2px;" aria-hidden="true"><polygon points="9,0.5 11,6.2 17.5,5 12.6,9 17.5,13 11,11.8 9,17.5 7,11.8 0.5,13 5.4,9 0.5,5 7,6.2" fill="#FFD166"/><circle cx="9" cy="9" r="2.2" fill="#FFFDF7"/></svg>';return n.innerHTML=`<span class="ws7-showcase-star" style="display:inline-flex;align-items:center;gap:4px;">${t}TV BONUS</span><span>${W(e)}</span>`,a.appendChild(n),n}function Ue(a,e){const n=Math.max(0,Math.min(100,Math.round(a)));return`
    <div class="ws7-poll-badge" data-leader="${e?"true":"false"}">
      <span class="ws7-poll-track"><span class="ws7-poll-fill" style="width:${n}%"></span></span>
      <span class="ws7-poll-pct">${e?"★ ":""}${n}%</span>
    </div>
  `}function Ke(a,e,n=new Set){const t=[],h=[e.waiverPruneIdx,e.anchorIdx,(a+1)%4,(a+2)%4,(a+3)%4,e.poisonedFixIdx];for(const p of h)if(p>=0&&p<4&&p!==a&&!n.has(p)&&!t.includes(p)&&(t.push(p),t.length===2))break;return t}function qe(a,e){const n=new Map;if(e.length===0)return n;const t=e.map((o,c)=>{const l=a.length===e.length&&e.length<4?a[c]:a[o];return typeof l=="number"&&Number.isFinite(l)?Math.max(0,l):0}),h=t.reduce((o,c)=>o+c,0);if(h<=0){const o=Math.floor(100/e.length);let c=100-o*e.length;return e.forEach(l=>{n.set(l,o+(c>0?1:0)),c>0&&(c-=1)}),n}let p=0,b=0;const x=t.map((o,c)=>{const l=Math.round(o/h*100);return p+=l,o>t[b]&&(b=c),l});return p!==100&&(x[b]=Math.max(0,x[b]+(100-p))),e.forEach((o,c)=>{n.set(o,x[c])}),n}function Re(a){let e=a.querySelector(".ws7-meta-row");if(e||(e=document.createElement("div"),e.className="ws7-meta-row",(a.querySelector(".ws7-pad-body")??a).appendChild(e)),e.querySelector(".ws7-stamp-void")?.remove(),!e.querySelector(".ws7-stamp-fifty")){const n=document.createElement("span");n.className="ws7-stamp-fifty",n.textContent="50/50 CUT",e.appendChild(n)}}function Be(a,e,n){const t=[];if(n.pruneActive&&e===a.waiverPruneIdx){const h=!!a.isKlaxonMyth||n.cardStyle==="SPOT_THE_MYTH"||a.cardStyle==="SPOT_THE_MYTH",p=h?"ELIMINATED":"VOID";t.push(`<span class="ws7-stamp-void"${h?' data-myth-elim="true"':""}>${p}</span>`)}return typeof n.canaryTickIdx=="number"&&e===n.canaryTickIdx&&t.push('<span class="ws7-canary-tick"><svg width="14" height="13" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.5 6.5L5.2 10L12.5 1.8" stroke="#005A9C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>CANARY TIP</span>'),n.uvLoupeActive&&e===a.poisonedFixIdx&&t.push('<span class="ws7-uv-poison">RIGGED TRAP</span>'),`<div class="ws7-meta-row">${t.join("")}</div>`}function ut(a,e,n,t=""){const h=e===a.answerIdx,p=a.choices[e]??"",b=a.choices[a.answerIdx];return{isCorrect:h,accuracyRatio:h?1:0,chipMultiplier:n,chosenSummary:t?`${t} ${p}`:p,trueAnswerDisplay:b,triggeredKlaxon:!h&&!!a.isKlaxonMyth,fellForPoisonedFix:!h&&e===a.poisonedFixIdx}}function Bt(a){if(a.numeric)return a.numeric;const e=Number.parseFloat(a.choices[a.answerIdx].replace(/[^0-9.-]/g,"")),n=Number.isFinite(e)?e:50,t=Math.max(20,Math.abs(n)*.8),h=Math.round(n-t*.5),p=Math.round(n+t*.5);return{target:n,min:h,max:Math.max(h+10,p),step:1,unit:""}}function Aa(a){return a.balance?a.balance:{unit:"G",targetSum:100,weights:[{label:a.choices[a.answerIdx],value:60},{label:"Counterweight",value:40},{label:a.choices[(a.answerIdx+1)%4],value:25},{label:a.choices[(a.answerIdx+2)%4],value:55},{label:a.choices[(a.answerIdx+3)%4],value:85}],validPair:[0,1]}}function La(a){return a.geo?a.geo:{lat:37.9715,lng:23.7257,landmarkLabel:a.choices[a.answerIdx],regionHint:"MEDITERRANEAN BASIN"}}function Ma(a){return a.sorter&&a.sorter.items.length>=4?a.sorter:{chuteALabel:"TRUE FACT",chuteBLabel:"FALSE CLAIM",items:[{label:a.choices[a.answerIdx],chute:0},{label:a.choices[(a.answerIdx+1)%4],chute:1},{label:a.choices[(a.answerIdx+2)%4],chute:1},{label:a.choices[(a.answerIdx+3)%4],chute:1}]}}function Da(a){return a.chronology&&a.chronology.events.length>=3?a.chronology:{events:[{label:a.choices[0],year:1850,displayYear:"1850"},{label:a.choices[1],year:1905,displayYear:"1905"},{label:a.choices[2],year:1957,displayYear:"1957"},{label:a.choices[3],year:1989,displayYear:"1989"}]}}function Ia(a){return a.patchbay?a.patchbay:{callers:["CHANNEL 1","CHANNEL 2","CHANNEL 3"],jacks:a.choices,correctMapping:[a.answerIdx,(a.answerIdx+1)%4,(a.answerIdx+2)%4]}}function Ra(a){if(a.vowels)return a.vowels;const e=a.choices[a.answerIdx].toUpperCase(),n=[],t=Array.from(e).map(O=>"AEIOU".includes(O)?(n.push(O),"_"):O),h=n.length>0?n:["A","E","I"],p=h.join("-"),b=["A","E","I","O","U"],x=[],o=new Set([p]);for(let O=1;O<=8&&x.length<3;O++){const H=h.map((U,q)=>{const B=Math.max(0,b.indexOf(U));return b[(B+O+q%2)%5]}).join("-");o.has(H)||(o.add(H),x.push(H))}for(;x.length<3;)x.push(`A-O-U-${x.length+1}`);const c=["","","",""];let l=0;for(let O=0;O<4;O++)c[O]=O===a.answerIdx?p:x[l++];return{maskedDisplay:t.join(""),fullAnswer:e,vowelChoices:c,correctChoiceIdx:a.answerIdx}}function Ba(a){if(a.lasso&&a.lasso.cards.length>=9)return a.lasso;const e=a.choices[a.answerIdx];return{connectionPrompt:"Tap the 3 connected Studio Cards!",cards:[e,a.choices[(a.answerIdx+1)%4],`${e} II`,a.choices[(a.answerIdx+2)%4],`${e} III`,a.choices[(a.answerIdx+3)%4],"Studio Decoy A","Studio Decoy B","Studio Decoy C"],triadIndices:[0,2,4]}}function Pa(a){return a.cyanotype?a.cyanotype:{plateId:a.category,targetZoneIdx:Math.abs(a.qid)%8,targetZoneName:a.choices[a.answerIdx]}}function Xa(a,e,n,t={},h=()=>{}){Sa(),a.innerHTML="",Ge(a);const p=n==="TOY_01_KNIFE_SWITCH"?ka(e,t):"CLASSIC_CUE",b=!!t.isClutchMoment,x=document.createElement("div");x.className=`ws7-toy-root ws7-toy-${n.toLowerCase()} ws7-style-${p.toLowerCase()}`,x.dataset.toyId=n,x.dataset.cardStyle=p,x.dataset.reducedMotion=t.reducedMotion?"true":"false",a.appendChild(x),Ge(a,p);let o=!1,c=!1,l=!1;const O=typeof performance<"u"?performance.now():0;let H=!1;const U=[],q=[],B=s=>{if((typeof performance<"u"?performance.now()-O:999)<220){s.preventDefault(),s.stopPropagation(),s.stopImmediatePropagation();return}H=!0},j=s=>{((typeof performance<"u"?performance.now()-O:999)<220||s.detail>0&&!H)&&(s.preventDefault(),s.stopPropagation(),s.stopImmediatePropagation())};x.addEventListener("pointerdown",B,!0),x.addEventListener("click",j,!0),q.push(()=>{x.removeEventListener("pointerdown",B,!0),x.removeEventListener("click",j,!0)});const Y=()=>typeof performance>"u"?!0:performance.now()-O>=220,de=(s,y)=>{const F=t.reducedMotion?Math.min(80,y):y,d=window.setTimeout(()=>{l||s()},F);U.push(d)},ne=(s,y,F=140)=>{const d=t.reducedMotion?Math.min(y,F):y,C=window.setTimeout(()=>{l||s()},d);U.push(C)},we=s=>{o||l||(o=!0,h(s))},ee=s=>{if(o||c||l)return;c=!0,s.containerEl.classList.add("is-console-locked"),s.chosenEl.classList.add("is-thrown","is-amber-lock"),b&&!t.reducedMotion&&s.chosenEl.classList.add("is-clutch-lock");let y=null;b&&s.chosenTailSlot&&(y=document.createElement("span"),y.className="ws7-lock-badge",y.textContent="LOCKED IN...",s.chosenTailSlot.prepend(y)),t.onLockInStart?.(b),t.onTactileSfx?.(s.sfx);const F=b&&!t.turboMode&&!t.reducedMotion,d=F?950:160,C=F?280:b?240:290;ne(()=>{if(l||o)return;s.chosenEl.classList.remove("is-amber-lock","is-clutch-lock"),y&&y.parentElement&&y.remove();const R=(P,N,_)=>{if(!P)return;P.querySelectorAll(".ws7-tally-badge, .ws7-lock-badge").forEach(m=>m.remove());const $=document.createElement("span");$.className=`ws7-tally-badge ${N==="correct"?"is-correct":"is-wrong"}`,$.textContent=_,P.prepend($)};s.isCorrect?(s.chosenEl.classList.add("is-reveal-correct"),R(s.chosenTailSlot,"correct","✓")):(s.chosenEl.classList.add("is-reveal-wrong"),R(s.chosenTailSlot,"wrong","✗"),s.correctEl&&s.correctEl!==s.chosenEl&&(s.correctEl.classList.add("is-reveal-correct"),R(s.correctTailSlot,"correct","✓"))),s.onBeat2Extra?.(),t.onRevealFlash?.(s.isCorrect),ne(()=>{we(s.resolution)},C,160)},d,b?220:100)};let Se=null,pe=()=>[],he=()=>{};const ie=(s,y)=>{const F=x.querySelector(`.ws7-lifeline-ribbon[data-kind="${s}"]`);if(F){F.innerHTML=y;return}const d=document.createElement("div");d.className="ws7-lifeline-ribbon",d.dataset.kind=s,d.innerHTML=y;const C=x.querySelector(".ws7-showcase-prompt");C&&C.nextSibling?x.insertBefore(d,C.nextSibling):C?C.after(d):x.prepend(d)};switch(n){case"TOY_01_KNIFE_SWITCH":{const s=new Set,y=new Map,F=new Map,d=new Map,C=[],R=Gt(p);let P;if(R){const N=document.createElement("div");N.className="ws7-binary-banner";const _=p==="HIGHER_OR_LOWER",$=p==="BEFORE_OR_AFTER",m=_?'<svg width="16" height="16" viewBox="0 0 18 18" style="flex:0 0 auto;" aria-hidden="true"><polygon points="9,2 14,7.5 4,7.5" fill="#FFD166"/><polygon points="9,16 4,10.5 14,10.5" fill="#FF9E66"/></svg>':$?'<svg width="16" height="16" viewBox="0 0 18 18" style="flex:0 0 auto;" aria-hidden="true"><circle cx="9" cy="9" r="7" fill="none" stroke="#FFD166" stroke-width="1.8"/><line x1="9" y1="9" x2="9" y2="5" stroke="#FFFDF7" stroke-width="1.8" stroke-linecap="round"/><line x1="9" y1="9" x2="12.5" y2="10.5" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/></svg>':'<svg width="15" height="15" viewBox="0 0 18 18" style="flex:0 0 auto;" aria-hidden="true"><polygon points="10.5,1 3,10.5 8.8,10.5 7.5,17 15,7.5 9.2,7.5" fill="#FFD166" stroke="#1E140E" stroke-width="1"/></svg>',A=_?"UP OR DOWN · HIGHER OR LOWER!":$?"TIME-MACHINE DUEL · BEFORE OR AFTER?":"50/50 SHOWDOWN · PICK ONE!";N.innerHTML=`${m}<span>${A}</span>${Ye(e.domain)}`,x.appendChild(N);const S=document.createElement("div");S.className="ws7-binary-arena ws7-knife-grid",x.appendChild(S),P=S;const k=e.poisonedFixIdx!==e.answerIdx?e.poisonedFixIdx:(e.answerIdx+1)%4,M=(Math.abs(e.qid)+e.answerIdx)%2===0?[e.answerIdx,k]:[k,e.answerIdx],r=["left","right"],v=_?"SIDE A":$?"PICK A":"CHOICE A",I=_?"SIDE B":$?"PICK B":"CHOICE B",w=_?"OR":"VS";M.forEach((u,i)=>{C.push(u);const E=r[i],g=e.choices[u],z=E==="left"?`<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="9" height="10" viewBox="0 0 10 12" fill="currentColor" style="flex:0 0 auto;" aria-hidden="true"><polygon points="9,1 1,6 9,11"/></svg><span>${v}</span></span>`:`<span style="display:inline-flex;align-items:center;gap:5px;"><span>${I}</span><svg width="9" height="10" viewBox="0 0 10 12" fill="currentColor" style="flex:0 0 auto;" aria-hidden="true"><polygon points="1,1 9,6 1,11"/></svg></span>`,L=document.createElement("button");L.type="button",L.className="ws7-studio-pad ws7-knife-bay ws7-binary-paddle",L.dataset.choiceIdx=String(u),L.dataset.padTone=E==="left"?"0":"3",L.dataset.side=E,/\S{13,}/.test(g)&&(L.dataset.longWord="true"),t.reducedMotion||(L.dataset.animated="true",L.style.animationDelay=`${i*45}ms`),L.setAttribute("aria-label",`${E==="left"?"Left":"Right"} Choice: ${g}`),L.innerHTML=`
            <span class="ws7-binary-cap" aria-hidden="true">
              ${z}
            </span>
            <span class="ws7-pad-body">
              <span class="ws7-pad-label">${W(g)}</span>
              ${Be(e,u,t)}
              <div class="ws7-poll-slot"></div>
            </span>
            <span class="ws7-pad-tail"><span class="ws7-pad-lamp" aria-hidden="true"></span></span>
          `;const G=L.querySelector(".ws7-pad-tail"),V=L.querySelector(".ws7-poll-slot");if(y.set(u,L),F.set(u,G),d.set(u,V),L.addEventListener("pointerenter",Z=>{Z.pointerType==="mouse"&&!o&&!c&&!l&&t.onTactileSfx?.("TICK")}),L.addEventListener("click",()=>{if(o||c||l||s.has(u)||!Y())return;const Z=ut(e,u,1);ee({containerEl:S,chosenEl:L,correctEl:y.get(e.answerIdx)??null,chosenTailSlot:G,correctTailSlot:F.get(e.answerIdx)??null,isCorrect:Z.isCorrect,sfx:"THROW_SNAP",resolution:Z})}),S.appendChild(L),i===0){const Z=document.createElement("div");Z.className="ws7-binary-vs",Z.setAttribute("aria-hidden","true"),Z.textContent=w,S.appendChild(Z)}})}else{let N=x;if(p==="HEADLINE_BLANK"){const m=document.createElement("div");m.className="ws7-wire-masthead";const A=/_{2,}|\[\s*_+\s*\]|blank/i.test(e.stem)?"FILL BLANK":"FRONT PAGE";m.innerHTML=`
            <span class="ws7-wire-stamp"><span class="ws7-wire-sprocket" aria-hidden="true"></span>STUDIO WIRE</span>
            <span class="ws7-wire-edition" style="display:inline-flex;align-items:center;gap:5px;letter-spacing:0.02em;">${Ye(e.domain)}<span>${A}</span></span>
          `,x.appendChild(m)}else if(p==="SPOT_THE_MYTH"){const m=document.createElement("div");m.className="ws7-klaxon-banner";const A=/\bodd one out\b/i.test(e.stem),S=e.isKlaxonMyth||/\b(myth|bogus|fake|hoax|never happened|false|not true|lie)\b/i.test(e.stem),k=A?"SPOT THE ODD ONE!":S?"SPOT THE MYTH!":"BUZZER TRAP!",T='<svg width="18" height="18" viewBox="0 0 20 20" style="flex:0 0 auto;vertical-align:-3px;" aria-hidden="true"><line x1="10" y1="1.5" x2="10" y2="4" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/><line x1="3.2" y1="4.8" x2="5.2" y2="6.4" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/><line x1="16.8" y1="4.8" x2="14.8" y2="6.4" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/><path d="M5.5,14 L6.5,8.2 A3.5,3.5 0 0,1 13.5,8.2 L14.5,14 Z" fill="#FFD166" stroke="#141B29" stroke-width="1.3"/><rect x="4" y="14" width="12" height="3.2" rx="1.2" fill="#141B29" stroke="#FFFDF7" stroke-width="1"/><circle cx="9.2" cy="9.4" r="1.4" fill="#FFFDF7"/></svg>';m.innerHTML=`
            <span class="ws7-klaxon-dot" aria-hidden="true"></span>
            <span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">${T}<span>KLAXON · ${k}</span></span>
            <span class="ws7-klaxon-dot" aria-hidden="true"></span>
          `,x.appendChild(m)}else if(p==="ODD_ONE_OUT"){const m=document.createElement("div");m.className="ws7-cue-style-banner ws7-cue-style-banner--odd";const A='<svg width="18" height="18" viewBox="0 0 20 20" style="flex:0 0 auto;" aria-hidden="true"><circle cx="5" cy="7" r="2.6" fill="#FFFDF7"/><circle cx="11" cy="7" r="2.6" fill="#FFFDF7"/><circle cx="5" cy="13" r="2.6" fill="#FFFDF7"/><polygon points="13.5,10 14.7,12.5 17.5,12.9 15.5,14.8 16,17.5 13.5,16.2 11,17.5 11.5,14.8 9.5,12.9 12.3,12.5" fill="#FFD166" stroke="#3E2012" stroke-width="0.9"/></svg>';m.innerHTML=`${A}<span>3 BELONG · 1 CRASHER — ODD ONE OUT!</span>${Ye(e.domain)}`,x.appendChild(m)}else if(p==="FINISH_THE_LINE"){const m=document.createElement("div");m.className="ws7-cue-style-banner ws7-cue-style-banner--line";const A='<svg width="18" height="18" viewBox="0 0 20 20" style="flex:0 0 auto;" aria-hidden="true"><rect x="2" y="3" width="16" height="14" rx="3" fill="#6E3B23" stroke="#D9A441" stroke-width="1.4"/><circle cx="7.5" cy="11.5" r="2" fill="#FFD166"/><line x1="9.5" y1="11.5" x2="9.5" y2="6.5" stroke="#FFD166" stroke-width="1.6" stroke-linecap="round"/><line x1="9.5" y1="6.5" x2="13.5" y2="7.5" stroke="#FFD166" stroke-width="1.6" stroke-linecap="round"/></svg>';m.innerHTML=`${A}<span>CUE-CARD SPOTLIGHT · FINISH THE LINE!</span>${Ye(e.domain)}`,x.appendChild(m)}else if(p==="WHO_WHAT_AM_I"){const m=document.createElement("div");m.className="ws7-cue-style-banner ws7-cue-style-banner--riddle";const A='<svg width="18" height="18" viewBox="0 0 20 20" style="flex:0 0 auto;" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#FAF2DF" stroke="#D9A441" stroke-width="1.6"/><path d="M7.6 7.5 C7.6 6 12.4 6 12.4 8 C12.4 9.6 10 9.8 10 11.6" fill="none" stroke="#5C301B" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="1.2" fill="#FF6B35"/></svg>';m.innerHTML=`${A}<span>MYSTERY GUEST · WHO OR WHAT AM I?</span>${Ye(e.domain)}`,x.appendChild(m)}else if(p==="PICTURE_MONITOR"){const m=document.createElement("div");m.className="ws7-picture-shell";const A=document.createElement("div");A.className="ws7-picture-crt";const S=va[e.category]??e.category;A.innerHTML=`
            <div class="ws7-picture-screen">${Ca(e.category)}</div>
            <div class="ws7-picture-meta">
              <span class="ws7-picture-ch-tag"><span class="ws7-picture-onair-led" aria-hidden="true"></span>CH 6 · IN LIVING COLOR<span class="ws7-picture-color-dots" aria-hidden="true"><i style="background:#00C4D4;"></i><i style="background:#FFD166;"></i><i style="background:#FF6B35;"></i><i style="background:#E6397A;"></i></span></span>
              <span class="ws7-picture-sub">${W(S)}</span>
            </div>
            <div class="ws7-picture-dials" aria-hidden="true">
              <span class="ws7-crt-knob"></span>
              <span class="ws7-crt-knob"></span>
            </div>
          `,m.appendChild(A),x.appendChild(m),N=m}const _=document.createElement("div");_.className="ws7-classic-pads-grid ws7-knife-grid",N.appendChild(_),P=_;const $=e.choices.some(m=>/\S{15,}/.test(m));e.choices.forEach((m,A)=>{C.push(A);const S=dt[A]??String(A+1),k=document.createElement("button");k.type="button",k.className="ws7-studio-pad ws7-knife-bay",k.dataset.choiceIdx=String(A),k.dataset.padTone=String(A%4),($||/\S{15,}/.test(m))&&(k.dataset.longWord="true"),t.reducedMotion||(k.dataset.animated="true",k.style.animationDelay=`${A*32}ms`),k.setAttribute("aria-label",`Option ${S}: ${m}`),k.innerHTML=`
            <span class="ws7-pad-medallion" aria-hidden="true">${S}</span>
            <span class="ws7-pad-body">
              <span class="ws7-pad-label">${W(m)}</span>
              ${Be(e,A,t)}
              <div class="ws7-poll-slot"></div>
            </span>
            <span class="ws7-pad-tail"><span class="ws7-pad-lamp" aria-hidden="true"></span></span>
          `;const T=k.querySelector(".ws7-pad-tail"),M=k.querySelector(".ws7-poll-slot");y.set(A,k),F.set(A,T),d.set(A,M),k.addEventListener("pointerenter",r=>{r.pointerType==="mouse"&&!o&&!c&&!l&&t.onTactileSfx?.("TICK")}),k.addEventListener("click",()=>{if(o||c||l||s.has(A)||!Y())return;const r=ut(e,A,1);ee({containerEl:P,chosenEl:k,correctEl:y.get(e.answerIdx)??null,chosenTailSlot:T,correctTailSlot:F.get(e.answerIdx)??null,isCorrect:r.isCorrect,sfx:"THROW_SNAP",resolution:r})}),_.appendChild(k)})}pe=()=>{if(o||c||l)return[];const N=R?C.filter(_=>_!==e.answerIdx).slice(0,1):Ke(e.answerIdx,e,s);for(const _ of N){s.add(_);const $=y.get(_);if($){$.classList.add("is-fifty-cut"),$.disabled=!0,$.setAttribute("aria-disabled","true"),Re($);const m=d.get(_);m&&(m.classList.remove("is-visible"),m.innerHTML="")}}return t.onTactileSfx?.("SHUTTER_CLACK"),N},he=N=>{if(o||c||l)return;const _=C.filter(A=>!s.has(A)),$=qe(N,_);let m=-1;$.forEach(A=>{A>m&&(m=A)}),C.forEach(A=>{const S=d.get(A);if(!S)return;if(s.has(A)){S.classList.remove("is-visible"),S.innerHTML="";return}const k=$.get(A)??0;S.innerHTML=Ue(k,k===m&&m>0),S.classList.add("is-visible")}),t.onTactileSfx?.("DETENT")};break}case"TOY_02_CONFIDENCE_PNEUMATIC":{const s=ve(x,"Pick SAFE 0.75× or BOLD 1.25×!"),y=document.createElement("span");y.className="ws7-pneumatic-gauge",y.setAttribute("aria-hidden","true"),y.innerHTML=`
        <svg width="42" height="22" viewBox="0 0 42 22">
          <path d="M5,19 A16,16 0 0,1 37,19" fill="#4F2917" stroke="#FFD166" stroke-width="2"/>
          <path d="M7,19 A14,14 0 0,1 21,5" fill="none" stroke="#00C2D6" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M21,5 A14,14 0 0,1 35,19" fill="none" stroke="#FF6738" stroke-width="3.2" stroke-linecap="round"/>
          <line class="ws7-pneumatic-gauge-needle" x1="21" y1="19" x2="21" y2="7" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="21" cy="19" r="3" fill="#FFD166"/>
        </svg>
      `,s.appendChild(y);const F=y.querySelector(".ws7-pneumatic-gauge-needle"),d=document.createElement("div");d.className="ws7-pneumatic-rack",x.appendChild(d);const C=t.dayJob==="VEGAS_ACTUARY"?" +EV":"",R=new Set,P=[],N=[],_=[];e.choices.forEach(($,m)=>{const A=document.createElement("div");A.className="ws7-pneumatic-row",A.dataset.choiceIdx=String(m);const S=document.createElement("button");S.type="button",S.className="ws7-pneumatic-port ws7-port-insured",S.dataset.portKind="INSURED",S.dataset.choiceIdx=String(m),S.innerHTML='<span style="white-space:nowrap;">0.75×</span><span style="white-space:nowrap;">SAFE</span>';const k=document.createElement("div");k.className="ws7-pneumatic-slip",k.innerHTML=`
          <div class="ws7-choice-copy">${W($)}</div>
          ${Be(e,m,t)}
          <div class="ws7-poll-slot"></div>
          <div class="ws7-pneumatic-tail"></div>
        `;const T=document.createElement("button");T.type="button",T.className="ws7-pneumatic-port ws7-port-spike",T.dataset.portKind="SPIKE",T.dataset.choiceIdx=String(m),T.innerHTML=`<span style="white-space:nowrap;">1.25×</span><span style="white-space:nowrap;">BOLD${C}</span>`;const M=k.querySelector(".ws7-pneumatic-tail"),r=k.querySelector(".ws7-poll-slot");P.push(A),N.push(M),_.push(r);const v=(I,w)=>{if(o||c||l||R.has(m)||!Y())return;F&&(F.style.transform=I===.75?"rotate(-50deg)":"rotate(54deg)");const u=ut(e,m,I,`[${w}]`);ee({containerEl:d,chosenEl:A,correctEl:P[e.answerIdx]??null,chosenTailSlot:M,correctTailSlot:N[e.answerIdx]??null,isCorrect:u.isCorrect,sfx:"PNEUMATIC_THUNK",resolution:u})};S.addEventListener("click",()=>v(.75,"0.75x SAFE")),T.addEventListener("click",()=>v(1.25,"1.25x BOLD")),A.append(S,k,T),d.appendChild(A)}),pe=()=>{if(o||c||l)return[];const $=Ke(e.answerIdx,e,R);for(const m of $){R.add(m);const A=P[m];A&&(A.classList.add("is-fifty-cut"),A.querySelectorAll("button").forEach(S=>{S.disabled=!0}),Re(A),_[m].classList.remove("is-visible"),_[m].innerHTML="")}return t.onTactileSfx?.("SHUTTER_CLACK"),$},he=$=>{if(o||c||l)return;const m=[0,1,2,3].filter(k=>!R.has(k)),A=qe($,m);let S=-1;A.forEach(k=>{k>S&&(S=k)}),[0,1,2,3].forEach(k=>{const T=_[k];if(R.has(k)){T.classList.remove("is-visible"),T.innerHTML="";return}const M=A.get(k)??0;T.innerHTML=Ue(M,M===S&&S>0),T.classList.add("is-visible")}),t.onTactileSfx?.("DETENT")};break}case"TOY_03_VERNIER_DIAL":{ve(x,"Spin the Range Dial & tap LOCK IN!");const s=Bt(e),y=Math.max(1e-6,s.max-s.min),F=s.step>0?s.step:1,d=F<1?String(F).split(".")[1]?.length??1:0;let C=s.min+y*.5;C=Math.min(s.max,Math.max(s.min,Math.round(C/F)*F));const R=K=>ht(K.toFixed(d),s.unit??""),P=K=>-140+Math.max(0,Math.min(1,(K-s.min)/y))*280,N=P(s.target),_=P(s.target-y*.18),$=P(s.target+y*.18),m=P(s.target-y*.08),A=P(s.target+y*.08),S=(N-90)*Math.PI/180,k=100+Math.cos(S)*82,T=100+Math.sin(S)*82,M=document.createElement("div");M.className="ws7-vernier-layout",x.appendChild(M);const r=document.createElement("div");r.className="ws7-vernier-wheel-box";const v=document.createElement("div");v.className="ws7-vernier-readout-card";const I=2*Math.PI*92,w=[];for(let K=0;K<40;K++){const ae=K/40*Math.PI*2,re=K%5===0?60:68,se=77;w.push(`<line x1="${(100+Math.cos(ae)*re).toFixed(1)}" y1="${(100+Math.sin(ae)*re).toFixed(1)}" x2="${(100+Math.cos(ae)*se).toFixed(1)}" y2="${(100+Math.sin(ae)*se).toFixed(1)}" stroke="#141B29" stroke-width="${K%5===0?2.6:1.3}" stroke-linecap="round"/>`)}const u=[],i=17;for(let K=0;K<i;K++){const re=(-140+K/(i-1)*280-90)*Math.PI/180,se=100+Math.cos(re)*89,Oe=100+Math.sin(re)*89;u.push(`<circle class="ws7-dial-bulb" data-bulb-idx="${K}" cx="${se.toFixed(1)}" cy="${Oe.toFixed(1)}" r="3.3" fill="#6E3B23" stroke="#241309" stroke-width="1"/>`)}r.innerHTML=`
        <svg viewBox="0 0 200 200" width="100%" height="100%" style="display:block;overflow:visible;">
          <defs>
            <radialGradient id="ws7RangeDialCream" cx="46%" cy="38%" r="60%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="68%" stop-color="#FFF4DA"/>
              <stop offset="100%" stop-color="#EBD7B2"/>
            </radialGradient>
            <filter id="ws7GoldMarkerGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="#FFD166" flood-opacity="0.95"/>
            </filter>
          </defs>
          <!-- Living Color Bezel Halo + #11 Marquee Bulbs -->
          <circle cx="100" cy="100" r="95" fill="#3E2012" stroke="#D9A441" stroke-width="2.5"/>
          <circle class="ws7-dial-lock-arc" cx="100" cy="100" r="92" fill="none" stroke="#16A34A" stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${I.toFixed(1)}" stroke-dashoffset="${I.toFixed(1)}" transform="rotate(-90 100 100)"/>
          <g class="ws7-dial-bulbs">${u.join("")}</g>
          <!-- Top Atomic Tangerine Studio Pointer -->
          <polygon points="100,21 91,3 109,3" fill="#FF6738" stroke="#FFFDF7" stroke-width="1.6"/>
          <!-- Rotating 1966 Tricolor Studio Rotor -->
          <g class="ws7-dial-rotor" transform="rotate(0 100 100)">
            <circle cx="100" cy="100" r="80" fill="url(#ws7RangeDialCream)" stroke="#F4A91F" stroke-width="3.5"/>
            <path d="M100,100 L45,45 A78,78 0 0,1 155,45 Z" fill="#0096A6" fill-opacity="0.22"/>
            <path d="M100,100 L155,45 A78,78 0 0,1 171,131 Z" fill="#F4A91F" fill-opacity="0.25"/>
            ${w.join("")}
            <!-- Sculpted Needle Arm & Hub -->
            <polygon points="100,26 95,94 105,94" fill="#FF6738"/>
            <circle cx="100" cy="40" r="9.5" fill="#FFFDF7" stroke="#FF6738" stroke-width="2.5"/>
            <circle cx="100" cy="100" r="22" fill="#3E2012" stroke="#FFD166" stroke-width="3"/>
            <circle cx="100" cy="100" r="8" fill="#00C2D6"/>
          </g>
          <!-- Curved Acrylic Crystal Specular Reflection -->
          <path d="M46,56 A68,68 0 0,1 146,48" fill="none" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="4" stroke-linecap="round" pointer-events="none"/>
          <!-- 50/50 Narrowed Range Zone Arc (hidden until lifeline triggered) -->
          <path class="ws7-dial-fifty-arc" d="" fill="none" stroke="#00E5FF" stroke-width="7.5" stroke-opacity="0" stroke-linecap="round"/>
          <!-- Audience Poll Crowd Estimate Pin (hidden until lifeline triggered) -->
          <g class="ws7-dial-poll-pin" opacity="0">
            <polygon points="100,8 93,20 107,20" fill="#00E5FF" stroke="#FFFFFF" stroke-width="1.4"/>
          </g>
          <!-- Price-Is-Right Range Game Reveal: Green Tolerance Band + Glowing Gold Exact Marker -->
          <g class="ws7-dial-reveal-group" opacity="0" style="transition:opacity 0.22s ease-out;">
            <path class="ws7-dial-tol-outer" d="${pt(100,100,82,_,$)}" fill="none" stroke="#4ADE80" stroke-width="10" stroke-opacity="0.62" stroke-linecap="round"/>
            <path class="ws7-dial-tol-inner" d="${pt(100,100,82,m,A)}" fill="none" stroke="#16A34A" stroke-width="10.5" stroke-linecap="round"/>
            <g class="ws7-dial-exact-marker" filter="url(#ws7GoldMarkerGlow)">
              <line x1="100" y1="100" x2="${k.toFixed(1)}" y2="${T.toFixed(1)}" stroke="#FFD166" stroke-width="3.6" stroke-linecap="round"/>
              <circle cx="${k.toFixed(1)}" cy="${T.toFixed(1)}" r="8.2" fill="#FFD166" stroke="#FFFFFF" stroke-width="2.2"/>
              <circle cx="${k.toFixed(1)}" cy="${T.toFixed(1)}" r="3.2" fill="#1E140E"/>
            </g>
          </g>
        </svg>
      `,v.innerHTML=`
        <div class="ws7-dial-range-label" style="font-family:var(--ws7-toy-caps);font-size:14.5px;font-weight:800;color:#FFD166;letter-spacing:0.04em;text-align:center;">
          ${W(Rt(s.min,s.max,s.unit??""))}
        </div>
        <div class="ws7-dial-value ws7-dial-solari-plaque"></div>
        <div class="ws7-range-exact-pill"></div>
        <div class="ws7-dial-nudge-pair">
          <button type="button" class="ws7-step-nudge-btn" data-step-dir="-1" aria-label="Decrease value">−</button>
          <button type="button" class="ws7-step-nudge-btn" data-step-dir="1" aria-label="Increase value">+</button>
        </div>
        <button type="button" class="ws7-studio-lock-btn ws7-dial-lock-btn">LOCK IN!</button>
      `,M.append(r,v);const E=r.querySelector(".ws7-dial-rotor"),g=r.querySelector(".ws7-dial-lock-arc"),f=r.querySelector(".ws7-dial-reveal-group"),D=r.querySelector(".ws7-dial-fifty-arc"),z=r.querySelector(".ws7-dial-poll-pin"),L=Array.from(r.querySelectorAll(".ws7-dial-bulb")),G=v.querySelector(".ws7-dial-value"),V=v.querySelector(".ws7-range-exact-pill"),Z=v.querySelector(".ws7-dial-lock-btn"),te=v.querySelectorAll(".ws7-step-nudge-btn");let ue=-140+(C-s.min)/y*280,xe=ue,be=0,ye=0,Ce=0;const Me=K=>{E.setAttribute("transform",`rotate(${K.toFixed(2)} 100 100)`);const ae=Math.max(0,Math.min(1,(K+140)/280)),re=Math.round(ae*(i-1));L.forEach((se,Oe)=>{const Xe=Oe<=re;se.setAttribute("fill",Xe?"#FFD166":"#6E3B23"),se.setAttribute("r",Xe?"3.8":"3.1")})},De=K=>{if(l)return;const ae=Math.min(.032,Math.max(.001,(K-Ce)*.001));Ce=K;const re=(ue-xe)*280;if(be=(be+re*ae)*Math.exp(-20*ae),xe+=be*ae,Math.abs(ue-xe)<.08&&Math.abs(be)<.4){xe=ue,be=0,Me(xe),ye=0;return}Me(xe),ye=requestAnimationFrame(De)},Ie=(K=!1)=>{if(ue=-140+(C-s.min)/y*280,G.textContent=R(C),!K&&!t.reducedMotion&&(G.classList.remove("is-detent-pop"),G.offsetWidth,G.classList.add("is-detent-pop")),K||t.reducedMotion){xe=ue,be=0,Me(xe);return}ye||(Ce=performance.now(),ye=requestAnimationFrame(De))};Ie(!0),q.push(()=>{ye&&cancelAnimationFrame(ye)});let X=!1,J=null,le=0;const Fe=()=>{if(o||c||l||!Y())return;c=!0,t.onLockInStart?.(b),t.onTactileSfx?.("THROW_SNAP");const K=Math.abs(C-s.target)/y;let ae=0,re=0;K<=.08?(ae=1,re=1):K<=.18&&(ae=.6,re=.6);const se=ae>0;g.style.stroke=se?"#22C55E":"#EF4444",g.style.strokeDashoffset="0",f.setAttribute("opacity","1"),Z.disabled=!0,Z.textContent=se?"✓ IN THE RANGE!":"✗ OFF RANGE",Z.style.background=se?"linear-gradient(180deg, #16A34A 0%, #0E7A3D 100%)":"linear-gradient(180deg, #DC2626 0%, #991B1B 100%)",V.textContent=`★ EXACT: ${R(s.target)}`,V.className=`ws7-range-exact-pill ${se?"is-hit":"is-miss"}`,t.onRevealFlash?.(se),ne(()=>{we({isCorrect:se,accuracyRatio:ae,chipMultiplier:re,chosenSummary:R(C),trueAnswerDisplay:R(s.target),triggeredKlaxon:!se&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},420,240)};te.forEach(K=>{K.addEventListener("click",()=>{if(o||c||l||!Y())return;const ae=Number(K.dataset.stepDir??1),re=Math.max(F,Number((y/40).toFixed(d))||F),se=Math.round((C+ae*re)/F)*F;C=Math.max(s.min,Math.min(s.max,Number(se.toFixed(d)))),t.onTactileSfx?.("DETENT"),Ie(!1)})}),Z.addEventListener("click",Fe);const ke=(K,ae,re)=>{const se=r.getBoundingClientRect(),Oe=se.left+se.width*.5,Xe=se.top+se.height*.5,ft=K-Oe,bt=ae-Xe,yt=Math.hypot(ft,bt),Ze=Math.atan2(bt,ft);if(re&&yt>18){let Ee=(Ze+Math.PI*.5)*180/Math.PI;Ee>180&&(Ee-=360),Ee<-180&&(Ee+=360);const He=Math.max(0,Math.min(1,(Ee+140)/280)),Pe=Math.round((s.min+He*y)/F)*F;C=Math.max(s.min,Math.min(s.max,Number(Pe.toFixed(d)))),J=Ze,t.onTactileSfx?.("DETENT"),Ie(!1);return}if(J!==null&&yt>16){let Ee=Ze-J;Ee>Math.PI&&(Ee-=Math.PI*2),Ee<-Math.PI&&(Ee+=Math.PI*2);const He=Ee/(280*Math.PI/180)*y,Pe=Math.max(s.min,Math.min(s.max,C+He)),Ft=Math.round(Pe/F)*F;Ft!==C&&(C=Number(Ft.toFixed(d)),t.onTactileSfx?.("DETENT"),Ie(!1)),J=Ze}else{const Ee=K-le,He=Math.max(s.min,Math.min(s.max,C+Ee/160*y)),Pe=Math.round(He/F)*F;Pe!==C&&(C=Number(Pe.toFixed(d)),t.onTactileSfx?.("DETENT"),Ie(!1))}le=K};r.addEventListener("pointerdown",K=>{if(!(o||c||l||!Y())){X=!0,le=K.clientX,J=null;try{r.setPointerCapture(K.pointerId)}catch{}ke(K.clientX,K.clientY,!0)}}),r.addEventListener("pointermove",K=>{!X||o||c||l||ke(K.clientX,K.clientY,!1)});const Ve=K=>{if(!(!X||o||l)){X=!1;try{r.hasPointerCapture(K.pointerId)&&r.releasePointerCapture(K.pointerId)}catch{}}};r.addEventListener("pointerup",Ve),r.addEventListener("pointercancel",Ve),pe=()=>{if(o||c||l)return[];const K=(Math.abs(e.qid)%5-2)*.04*y,ae=Math.max(s.min,Math.round((s.target-y*.18+K)/F)*F),re=Math.min(s.max,Math.round((s.target+y*.18+K)/F)*F);return D.setAttribute("d",pt(100,100,82,P(ae),P(re))),D.setAttribute("stroke-opacity","0.88"),ie("fifty",`<span class="ws7-stamp-fifty">50/50 CUT</span><span>NARROWED ZONE: ${W(R(ae))} – ${W(R(re))}</span>`),t.onTactileSfx?.("SHUTTER_CLACK"),[0,1]},he=K=>{if(o||c||l)return;const ae=e.qid%2===0?1:-1,re=Math.max(s.min,Math.min(s.max,Math.round((s.target+ae*y*.045)/F)*F)),se=Math.max(58,Math.min(88,Math.round(Math.max(...K,68))));z.setAttribute("transform",`rotate(${P(re).toFixed(1)} 100 100)`),z.setAttribute("opacity","1"),ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL (${se}% CONSENSUS): AROUND <strong style="color:#FFD166;">${W(R(re))}</strong></span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_04_BALANCE_SCALE":{const s=Aa(e),y=!!e.balance,F=s.unit?` ${s.unit}`:"";ve(x,y?`Tap 2 Weights summing to ${s.targetSum}${F}, then tap LOCK IN!`:"Pair True Answer (60 G) + Counterweight (40 G) for 100 G, then LOCK IN!");const d=[],C=new Set,R=document.createElement("div");R.className="ws7-scale-svg-wrap";const P=document.createElement("div");P.className="ws7-scale-stage",R.innerHTML=`
        <svg viewBox="0 0 420 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <path d="M180,25 A36,36 0 0,1 240,25" fill="none" stroke="#FFF6E3" stroke-width="2" stroke-opacity="0.55"/>
          <path d="M204,12 A36,36 0 0,1 216,12" fill="none" stroke="#2ECC71" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="187" y1="21" x2="191" y2="25" stroke="#FFD166" stroke-width="1.6"/>
          <line x1="196" y1="15" x2="199" y2="20" stroke="#FFD166" stroke-width="1.6"/>
          <line x1="210" y1="7" x2="210" y2="14" stroke="#7EF2AD" stroke-width="2.2"/>
          <line x1="224" y1="15" x2="221" y2="20" stroke="#FFD166" stroke-width="1.6"/>
          <line x1="233" y1="21" x2="229" y2="25" stroke="#FFD166" stroke-width="1.6"/>
          <polygon points="198,108 222,108 214,34 206,34" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
          <rect x="176" y="104" width="68" height="6" rx="3" fill="#FFD166" stroke="#9E6300" stroke-width="1.2"/>
          <rect x="160" y="109" width="100" height="8.5" rx="4" fill="#00B2C4" stroke="#FFFDF7" stroke-width="1.2"/>
          <g class="ws7-scale-beam" transform="rotate(-12 210 38)">
            <rect x="64" y="35" width="292" height="6.5" rx="3.2" fill="#FFD166" stroke="#FFFDF7" stroke-width="1.2"/>
            <line x1="72" y1="36.8" x2="348" y2="36.8" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1.2"/>
            <polygon class="ws7-scale-needle" points="210,11 206,36 214,36" fill="#FF6738"/>
            <circle cx="210" cy="38" r="5.5" fill="#3E2012" stroke="#FFFDF7" stroke-width="1.6"/>
            <circle class="ws7-scale-eq-halo" cx="210" cy="38" r="13" fill="none" stroke="#22C55E" stroke-width="3" stroke-opacity="0"/>
            <g class="ws7-left-pan-plumb" transform="rotate(12 84 38)">
              <line x1="84" y1="38" x2="62" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <line x1="84" y1="38" x2="106" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <path d="M44,80 Q84,92 124,80 Z" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
              <rect x="34" y="52" width="100" height="28" rx="8" fill="#FF6738"/>
              <text x="84" y="71" text-anchor="middle" fill="#FFFDF7" font-family="Jost, sans-serif" font-size="15" font-weight="900">GOAL ${s.targetSum}</text>
            </g>
            <g class="ws7-right-pan-plumb" transform="rotate(12 336 38)">
              <line x1="336" y1="38" x2="314" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <line x1="336" y1="38" x2="358" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <path d="M296,80 Q336,92 376,80 Z" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
              <rect class="ws7-right-pan-badge" x="286" y="52" width="100" height="28" rx="8" fill="#0096A6"/>
              <text class="ws7-right-pan-sum" x="336" y="71" text-anchor="middle" fill="#FFFDF7" font-family="Jost, sans-serif" font-size="15" font-weight="900">SUM 0</text>
            </g>
          </g>
        </svg>
      `;const N=document.createElement("div");N.className="ws7-weights-rack";const _=R.querySelector(".ws7-scale-beam"),$=R.querySelector(".ws7-left-pan-plumb"),m=R.querySelector(".ws7-right-pan-plumb"),A=R.querySelector(".ws7-scale-needle"),S=R.querySelector(".ws7-scale-eq-halo"),k=R.querySelector(".ws7-right-pan-badge"),T=R.querySelector(".ws7-right-pan-sum"),M=[];let r=-12,v=-12,I=0,w=0,u=0;const i=L=>{_.setAttribute("transform",`rotate(${L.toFixed(2)} 210 38)`),$.setAttribute("transform",`rotate(${(-L).toFixed(2)} 84 38)`),m.setAttribute("transform",`rotate(${(-L).toFixed(2)} 336 38)`);const G=Math.abs(L)<1.2;A.setAttribute("fill",G?"#2ECC71":"#FF6738"),k.setAttribute("fill",G?"#16A34A":"#0096A6"),S?.setAttribute("stroke-opacity",G?"0.92":"0")},E=L=>{if(l)return;const G=Math.min(.032,Math.max(.001,(L-u)*.001));u=L;const V=(r-v)*150;if(I=(I+V*G)*Math.exp(-11*G),v+=I*G,Math.abs(r-v)<.05&&Math.abs(I)<.2){v=r,I=0,i(v),w=0;return}i(v),w=requestAnimationFrame(E)};q.push(()=>{w&&cancelAnimationFrame(w)});const g=(L,G)=>{const V=s.unit?` ${W(s.unit)}`:"";return G?`${L}${V}`:`?${V}`},f=document.createElement("button");f.type="button",f.className="ws7-studio-lock-btn",f.dataset.action="balance-lock",f.disabled=!0,f.textContent="PICK 2 WEIGHTS";const D=()=>{if(o||c||l||d.length!==2||!Y())return;c=!0,f.disabled=!0;const L=d.reduce((oe,ue)=>oe+s.weights[ue].value,0),G=Math.abs(L-s.targetSum)<.01||d.includes(s.validPair[0])&&d.includes(s.validPair[1]),V=`${s.weights[d[0]].label} + ${s.weights[d[1]].label} (${L}${s.unit?` ${s.unit}`:""})`,Z=`${s.weights[s.validPair[0]].label} + ${s.weights[s.validPair[1]].label} (${s.targetSum}${s.unit?` ${s.unit}`:""})`;t.onLockInStart?.(b);const te=new Set(s.validPair);M.forEach((oe,ue)=>{oe.disabled=!0;const xe=oe.querySelector(".ws7-weight-val-badge");xe&&(xe.innerHTML=g(s.weights[ue].value,!0)),G&&d.includes(ue)||!G&&te.has(ue)?oe.classList.add("is-reveal-correct"):!G&&d.includes(ue)&&oe.classList.add("is-reveal-wrong")}),G?(T.textContent=`✓ ${L}`,f.textContent=`✓ BALANCED (${L}${F})`):f.textContent=`✗ ${L}${F} (GOAL ${s.targetSum}${F})`,t.onRevealFlash?.(G),ne(()=>{we({isCorrect:G,accuracyRatio:G?1:0,chipMultiplier:G?1:0,chosenSummary:V,trueAnswerDisplay:Z,triggeredKlaxon:!G&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},420,220)},z=()=>{const L=d.reduce((V,Z)=>V+s.weights[Z].value,0);T.textContent=`SUM ${L}`;const G=L-s.targetSum;if(r=Math.max(-14,Math.min(14,G/Math.max(1,s.targetSum)*26)),t.reducedMotion?(v=r,i(v)):w||(u=performance.now(),w=requestAnimationFrame(E)),M.forEach((V,Z)=>{const te=d.includes(Z);V.classList.toggle("is-on-pan",te),V.disabled=c||o||C.has(Z)||d.length>=2&&!te;const oe=V.querySelector(".ws7-weight-val-badge");oe&&(oe.innerHTML=g(s.weights[Z].value,!0))}),d.length===2)f.disabled=c||o,f.textContent=`LOCK IN! (${L}${F})`;else{f.disabled=!0;const V=2-d.length;f.textContent=V===1?"PICK 1 MORE WEIGHT":"PICK 2 WEIGHTS"}};f.addEventListener("click",()=>{D()}),s.weights.forEach((L,G)=>{const V=document.createElement("button");V.type="button",V.className="ws7-brass-weight",V.dataset.weightIdx=String(G),V.innerHTML=`
          <span class="ws7-weight-val-badge" style="font-family:var(--ws7-toy-caps);font-size:15px;font-weight:900;line-height:1.12;">${g(L.value,!0)}</span>
          <span style="font-size:14.5px;font-weight:700;line-height:1.15;margin-top:2px;overflow-wrap:break-word;">${W(L.label)}</span>
        `,V.addEventListener("click",()=>{const Z=d.indexOf(G),te=Z>=0;o||c||l||C.has(G)||!te&&d.length>=2||!Y()||(te?d.splice(Z,1):d.push(G),t.onTactileSfx?.("TICK"),z())}),M.push(V),N.appendChild(V)}),P.append(R,N,f),x.appendChild(P),pe=()=>{if(o||c||l)return[];const L=new Set(s.validPair),G=[0,1,2,3,4].filter(V=>!L.has(V)&&!C.has(V)).slice(0,2);for(const V of G){C.add(V);const Z=d.indexOf(V);Z>=0&&d.splice(Z,1);const te=M[V];te&&(te.classList.add("is-fifty-cut"),te.disabled=!0,Re(te))}return z(),t.onTactileSfx?.("SHUTTER_CLACK"),G},he=()=>{if(o||c||l)return;const L=s.weights[s.validPair[0]];s.weights[s.validPair[1]],ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL: CROWD FAVORS <strong style="color:#FFD166;">${W(L.label)} (${L.value})</strong> + PARTNER TO HIT ${s.targetSum}${W(F)}!</span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_05_RELIEF_GLOBE_3D":{ve(x,"Tap the spot on the World Globe!");const s=La(e),y=document.createElement("div");y.className="ws7-globe-cradle-frame";const F=document.createElement("div");F.style.cssText="width:100%;height:100%;border-radius:11px;overflow:hidden;",y.appendChild(F),x.appendChild(y);const d=Fa(F,{targetLat:s.lat,targetLng:s.lng,landmarkLabel:s.landmarkLabel,regionHint:s.regionHint,reducedMotion:t.reducedMotion,confirmLockMs:280,revealDwellMs:360,onPinPlanted:()=>{t.onLockInStart?.(b),t.onTactileSfx?.("PIN_PLANT")},onLock:C=>{const R=C.accuracyRatio>0;t.onRevealFlash?.(R),we({isCorrect:R,accuracyRatio:C.accuracyRatio,chipMultiplier:C.chipMultiplier,chosenSummary:`${C.distanceKm} KM from ${s.landmarkLabel}`,trueAnswerDisplay:s.landmarkLabel,triggeredKlaxon:!R&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})}});q.push(()=>d.dispose()),pe=()=>{if(o||l)return[];const C=s.lat>=0?"NORTHERN":"SOUTHERN",R=s.lng>=0?"EASTERN":"WESTERN";return ie("fifty",`<span class="ws7-stamp-fifty">50/50 CUT</span><span>HEMISPHERE LOCK: ${C}-${R} · ${W(s.regionHint)}</span>`),t.onTactileSfx?.("SHUTTER_CLACK"),[0,1]},he=()=>{if(o||l)return;const C=Math.round(s.lat/5)*5,R=Math.round(s.lng/5)*5,P=`${Math.abs(C)}°${C>=0?"N":"S"}`,N=`${Math.abs(R)}°${R>=0?"E":"W"}`;ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL: CROWD PINS CLUSTER NEAR <strong style="color:#FFD166;">${P}, ${N}</strong> (${W(s.regionHint)})</span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_06_FUSE_WIRE_SNIPPER":{ve(x,"Cut wrong Studio Cables for 1.5× — or tap BANK CASH!");const s=new Set,y=["#FF6738","#0096A6","#1E56C5","#E63B7A"],F=document.createElement("div");F.className="ws7-fuse-layout";const d=document.createElement("div");d.className="ws7-fuse-wires-col";const C=document.createElement("button");C.type="button",C.className="ws7-bailout-latch",C.disabled=!0;const R=[],P=[],N=[],_=[],$=()=>{const m=s.size,A=m===1?.85:m===2?1.15:0;m>=1&&m<=2?(C.disabled=!1,C.classList.add("is-armed"),C.innerHTML=`
            <span style="font-size:14.5px;">BANK CASH!</span>
            <span style="font-size:20px;font-weight:900;">${A.toFixed(2)}×</span>
            <span style="font-size:14.5px;">SAFE LOCK</span>
          `):(C.disabled=!0,C.classList.remove("is-armed"),C.innerHTML=`
            <span style="font-size:14.5px;color:#FFD166;">BANK CASH</span>
            <span style="font-size:14.5px;">CUT 1 WRONG FIRST</span>
          `)};$(),e.choices.forEach((m,A)=>{const S=document.createElement("button");S.type="button",S.className="ws7-fuse-wire-btn ws7-cream-plaque",S.dataset.wireIdx=String(A),S.dataset.choiceIdx=String(A);const k=y[A%y.length],T=(w,u=!1)=>{const i='<circle cx="6" cy="12" r="5" fill="#F4A91F" stroke="#141B29" stroke-width="1.3"/><line x1="3.5" y1="9.5" x2="8.5" y2="14.5" stroke="#141B29" stroke-width="1.3"/>',E='<circle cx="38" cy="12" r="5" fill="#F4A91F" stroke="#141B29" stroke-width="1.3"/><line x1="35.5" y1="14.5" x2="40.5" y2="9.5" stroke="#141B29" stroke-width="1.3"/>';return w?`<svg width="44" height="24" viewBox="0 0 44 24" style="overflow:visible;" aria-hidden="true">
                ${i}
                <path d="M11,12 Q15,5 18,16" fill="none" stroke="${k}" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M33,12 Q29,19 26,8" fill="none" stroke="${k}" stroke-width="4.5" stroke-linecap="round"/>
                <circle cx="22" cy="12" r="2.8" fill="#FFD166"/>
                ${u&&!t.reducedMotion?`<g class="ws7-wire-spark-burst">
                        <line x1="22" y1="2" x2="22" y2="7" stroke="#FFD166" stroke-width="2.2" stroke-linecap="round"/>
                        <line x1="22" y1="17" x2="22" y2="22" stroke="#FFD166" stroke-width="2.2" stroke-linecap="round"/>
                        <line x1="13" y1="6" x2="17" y2="9" stroke="#00E5FF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="27" y1="15" x2="31" y2="18" stroke="#00E5FF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="31" y1="6" x2="27" y2="9" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
                        <line x1="17" y1="15" x2="13" y2="18" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="22" cy="12" r="5.2" fill="#FFFDF7" fill-opacity="0.85"/>
                      </g>`:""}
                ${E}
              </svg>`:`<svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true">${i}<line x1="11" y1="12" x2="33" y2="12" stroke="${k}" stroke-width="5.2" stroke-linecap="round"/><line x1="12" y1="10.8" x2="32" y2="10.8" stroke="#FFFFFF" stroke-opacity="0.48" stroke-width="1.2"/>${E}</svg>`};S.innerHTML=`
          <div class="ws7-wire-svg-host" style="flex:0 0 44px;display:flex;align-items:center;">${T(!1)}</div>
          <div class="ws7-pad-body" style="flex:1 1 auto;min-width:0;">
            <div class="ws7-choice-copy">${W(m)}</div>
            ${Be(e,A,t)}
            <div class="ws7-poll-slot"></div>
          </div>
          <span class="ws7-pad-tail"></span>
        `;const M=S.querySelector(".ws7-wire-svg-host"),r=S.querySelector(".ws7-pad-tail"),v=S.querySelector(".ws7-poll-slot"),I=(w,u=!1)=>{M.innerHTML=T(w,w&&!u),w&&S.classList.add("is-snipped"),u&&(S.classList.add("is-fifty-cut"),S.disabled=!0,Re(S),v.classList.remove("is-visible"),v.innerHTML="")};R.push(S),P.push(r),N.push(v),_.push(I),S.addEventListener("click",()=>{if(!(o||c||l||s.has(A)||!Y())){if(I(!0),A===e.answerIdx){ee({containerEl:F,chosenEl:S,correctEl:R[e.answerIdx]??null,chosenTailSlot:r,correctTailSlot:P[e.answerIdx]??null,isCorrect:!1,sfx:"WIRE_SNIP",resolution:{isCorrect:!1,accuracyRatio:0,chipMultiplier:0,chosenSummary:`Cut true cable: ${m}`,trueAnswerDisplay:e.choices[e.answerIdx],triggeredKlaxon:!!e.isKlaxonMyth,fellForPoisonedFix:!1}});return}if(t.onTactileSfx?.("WIRE_SNIP"),s.add(A),s.size>=3){const w=R[e.answerIdx];ee({containerEl:F,chosenEl:w,correctEl:w,chosenTailSlot:P[e.answerIdx]??null,correctTailSlot:P[e.answerIdx]??null,isCorrect:!0,sfx:"THROW_SNAP",resolution:{isCorrect:!0,accuracyRatio:1,chipMultiplier:1.5,chosenSummary:`Isolated ${e.choices[e.answerIdx]} (1.50×)`,trueAnswerDisplay:e.choices[e.answerIdx],triggeredKlaxon:!1,fellForPoisonedFix:!1}})}else $()}}),d.appendChild(S)}),C.addEventListener("click",()=>{if(o||c||l||s.size===0||!Y())return;const m=s.size===1?.85:1.15,A=R[e.answerIdx];ee({containerEl:F,chosenEl:A,correctEl:A,chosenTailSlot:P[e.answerIdx]??null,correctTailSlot:P[e.answerIdx]??null,isCorrect:!0,sfx:"THROW_SNAP",resolution:{isCorrect:!0,accuracyRatio:1,chipMultiplier:m,chosenSummary:`Banked Cash (${m.toFixed(2)}× after ${s.size} cut${s.size>1?"s":""})`,trueAnswerDisplay:e.choices[e.answerIdx],triggeredKlaxon:!1,fellForPoisonedFix:!1}})}),F.append(d,C),x.appendChild(F),pe=()=>{if(o||c||l)return[];const m=Math.max(0,2-s.size),A=Ke(e.answerIdx,e,s).slice(0,Math.max(1,m)),S=[];for(const k of A){if(s.size>=2)break;s.add(k),_[k]?.(!0,!0),S.push(k)}return $(),t.onTactileSfx?.("WIRE_SNIP"),S},he=m=>{if(o||c||l)return;const A=[0,1,2,3].filter(T=>!s.has(T)),S=qe(m,A);let k=-1;S.forEach(T=>{T>k&&(k=T)}),[0,1,2,3].forEach(T=>{const M=N[T];if(s.has(T)){M.classList.remove("is-visible"),M.innerHTML="";return}const r=S.get(T)??0;M.innerHTML=Ue(r,r===k&&k>0),M.classList.add("is-visible")}),ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL: HIGHEST % = <strong style="color:#FFD166;">TRUE CABLE (KEEP UNCUT!)</strong></span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_07_MAIL_SORTER":{ve(x,"Tap Left or Right Chute (or swipe card) to sort all 4!");const s=Ma(e),y=s.items.slice(0,4);let F=0,d=0;const C=[];let R=!1,P=!1;const N=document.createElement("div");N.className="ws7-sorter-layout";const _=document.createElement("button");_.type="button",_.className="ws7-chute-btn",_.dataset.chute="0";const $=document.createElement("div");$.className="ws7-cream-plaque ws7-sorter-deck",$.style.cssText="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;position:relative;touch-action:pan-y;cursor:grab;transition:transform 0.14s ease, opacity 0.14s ease, box-shadow 0.14s ease;";const m=document.createElement("button");m.type="button",m.className="ws7-chute-btn",m.dataset.chute="1";const A=()=>{const r=y[F],v=r?r.chute===0?78:22:50,I=100-v;_.classList.toggle("is-lifeline-hint",!!(R&&r?.chute===0)),m.classList.toggle("is-lifeline-hint",!!(R&&r?.chute===1)),_.innerHTML=`
          <span style="color:#FFE89E;font-size:14.5px;">&larr; CHUTE A</span>
          <span style="font-size:15px;">${W(s.chuteALabel)}</span>
          ${P?`<span style="background:#5C301B;color:#FFD166;padding:2px 7px;border-radius:6px;font-size:14.5px;">${v}%</span>`:""}
        `,m.innerHTML=`
          <span style="color:#FFE89E;font-size:14.5px;">CHUTE B &rarr;</span>
          <span style="font-size:15px;">${W(s.chuteBLabel)}</span>
          ${P?`<span style="background:#5C301B;color:#FFD166;padding:2px 7px;border-radius:6px;font-size:14.5px;">${I}%</span>`:""}
        `},S=()=>{if(F>=y.length)return;const r=y[F],v=y.map((I,w)=>`<span style="width:10px;height:10px;border-radius:50%;display:inline-block;background:${w<C.length?C[w]==="hit"?"#16A34A":"#DC2626":w===F?"#1E56C5":"#C8B99B"};box-shadow:inset 0 1px 0 rgba(255,255,255,0.45);"></span>`).join("");$.classList.remove("is-sort-hit","is-sort-miss","is-card-deal-in"),$.style.transform="translateX(0) rotate(0deg)",$.style.opacity="1",$.innerHTML=`
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;" aria-hidden="true">${v}</div>
          <div style="font-family:var(--ws7-toy-caps);font-size:14.5px;font-weight:900;color:#1E56C5;margin-bottom:4px;">CARD ${F+1} OF ${y.length}</div>
          <div class="ws7-choice-copy" style="font-size:clamp(16px,2.2vw,18px);">${W(r.label)}</div>
        `,F>0&&!t.reducedMotion&&($.offsetWidth,$.classList.add("is-card-deal-in")),A()};S();let k=!1;const T=r=>{if(o||l||k||F>=y.length||!Y())return;k=!0;const v=y[F].chute===r;if(v&&(d+=1),C.push(v?"hit":"miss"),$.classList.add(v?"is-sort-hit":"is-sort-miss"),t.onTactileSfx?.("CHUTE_SWOOSH"),!t.reducedMotion){const I=r===0?_:m;I.classList.remove("is-chute-recoil"),I.offsetWidth,I.classList.add("is-chute-recoil"),$.style.transform=r===0?"translateX(-78px) rotate(-11deg) scale(0.92)":"translateX(78px) rotate(11deg) scale(0.92)",$.style.opacity="0.28"}if(F+=1,F>=y.length){c=!0;const I=d>=3,w=I?d/y.length:0,u=d===4?1.15:I?.85:0;t.onRevealFlash?.(I),ne(()=>{we({isCorrect:I,accuracyRatio:w,chipMultiplier:u,chosenSummary:`Sorted ${d}/${y.length} cue cards`,trueAnswerDisplay:`${s.chuteALabel} vs ${s.chuteBLabel} (${d}/${y.length})`,triggeredKlaxon:!I&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},240,130)}else de(()=>{k=!1,S()},120)};_.addEventListener("click",()=>T(0)),m.addEventListener("click",()=>T(1));let M=null;$.addEventListener("pointerdown",r=>{Y()&&(M=r.clientX)}),$.addEventListener("pointerup",r=>{if(M===null)return;const v=r.clientX-M;M=null,v<=-32?T(0):v>=32&&T(1)}),N.append(_,$,m),x.appendChild(N),pe=()=>o||c||l?[]:(R=!0,A(),ie("fifty",'<span class="ws7-stamp-fifty">50/50 CUT</span><span>GOLD HALO HIGHLIGHTS THE VERIFIED CHUTE!</span>'),t.onTactileSfx?.("SHUTTER_CLACK"),[0]),he=()=>{o||c||l||(P=!0,A(),t.onTactileSfx?.("DETENT"))};break}case"TOY_08_CHRONOLOGY_RAIL":{ve(x,"Tap the plaques in order from EARLIEST to LATEST!");const s=Da(e),y=Math.min(4,Math.max(3,s.events.length)),F=s.events.slice(0,y).map((M,r)=>({...M,origIdx:r})).sort((M,r)=>M.year-r.year),d=[...F];let C=Math.abs(e.qid)*2654435761+1013904223>>>0;const R=()=>(C=Math.imul(1664525,C)+1013904223>>>0,C/4294967296);for(let M=d.length-1;M>0;M--){const r=Math.floor(R()*(M+1)),v=d[M];d[M]=d[r],d[r]=v}if(d.every((M,r)=>M===F[r])&&d.length>=2){const M=Math.abs(e.qid)%(d.length-1)+1,r=d[0];d[0]=d[M],d[M]=r}const P=Array.from({length:y},()=>{}),N=["1ST →","2ND →","3RD →","4TH"],_=document.createElement("div");_.className="ws7-chrono-layout";const $=document.createElement("div");$.className="ws7-sleepers-row",$.style.gridTemplateColumns=`repeat(${y}, minmax(0, 1fr))`;const m=document.createElement("div");m.className="ws7-plaques-grid";const A=[],S=[];let k=-1;const T=()=>{if(A.forEach((r,v)=>{const I=P[v],w=v===y-1?`${v+1}TH`:N[v];if(r.classList.remove("is-magnetic-snap"),I!==void 0){const u=d[I];r.classList.add("is-filled"),r.innerHTML=`<span style="font-size:14.5px;font-weight:900;color:#008B9A;">${w}</span><span style="font-size:14.5px;font-weight:700;">${W(u.label)}</span>`,v===k&&!t.reducedMotion&&(r.offsetWidth,r.classList.add("is-magnetic-snap"))}else r.classList.remove("is-filled"),r.innerHTML=`<span style="font-size:14.5px;">${w}</span><span style="font-size:14.5px;color:#FFF6E3;">${v===0?"EARLIEST":v===y-1?"LATEST":"NEXT"}</span>`}),k=-1,S.forEach((r,v)=>{r.classList.toggle("is-placed",P.includes(v))}),P.every(r=>r!==void 0)&&!c){c=!0;const r=P.map(g=>g),v=r.map(g=>F.indexOf(d[g]));let I=0;for(let g=0;g<v.length;g++)for(let f=g+1;f<v.length;f++)v[g]>v[f]&&(I+=1);const w=I===0?1:I===1?.5:0,u=I===0?1:I===1?.5:0,i=r.map(g=>d[g].label).join(" -> "),E=F.map(g=>`${g.label} (${g.displayYear})`).join(" -> ");A.forEach((g,f)=>{const D=r[f],z=d[D],L=v[f]===f;g.classList.add(L?"is-reveal-correct":"is-reveal-wrong"),g.innerHTML=`
              <span style="font-size:14.5px;font-weight:900;">${L?"✓":"✗"} ${W(z.label)}</span>
              <span class="ws7-chrono-year-pill">${W(z.displayYear)}</span>
            `}),t.onRevealFlash?.(w>0),ne(()=>{we({isCorrect:w>0,accuracyRatio:w,chipMultiplier:u,chosenSummary:i,trueAnswerDisplay:E,triggeredKlaxon:w===0&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},440,220)}};for(let M=0;M<y;M++){const r=document.createElement("button");r.type="button",r.className="ws7-sleeper-slot",r.addEventListener("click",()=>{o||c||l||P.every(v=>v!==void 0)||!Y()||P[M]!==void 0&&(P[M]=void 0,t.onTactileSfx?.("TICK"),T())}),A.push(r),$.appendChild(r)}d.forEach((M,r)=>{const v=document.createElement("button");v.type="button",v.className="ws7-plaque-btn ws7-cream-plaque",v.dataset.plaqueIdx=String(r),v.innerHTML=`<div class="ws7-choice-copy">${W(M.label)}</div>`,v.addEventListener("click",()=>{if(o||c||l||P.includes(r)||!Y())return;const I=P.indexOf(void 0);I<0||(k=I,P[I]=r,t.onTactileSfx?.("THROW_SNAP"),T())}),S.push(v),m.appendChild(v)}),T(),_.append($,m),x.appendChild(_),pe=()=>{if(o||c||l)return[];const M=F[0],r=d.indexOf(M),v=S[r];if(v&&!v.querySelector(".ws7-stamp-fifty")){const I=document.createElement("span");I.className="ws7-stamp-fifty",I.textContent=`1ST · ${M.displayYear}`,v.appendChild(I)}return ie("fifty",`<span class="ws7-stamp-fifty">50/50 CUT</span><span>EARLIEST ANCHOR: <strong style="color:#FFD166;">${W(M.label)} (${W(M.displayYear)})</strong></span>`),t.onTactileSfx?.("SHUTTER_CLACK"),[r]},he=()=>{if(o||c||l)return;const M=F[0],r=F[F.length-1];ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL: <strong style="color:#FFD166;">${W(M.label)}</strong> FIRST → <strong style="color:#7EF2AD;">${W(r.label)}</strong> LAST</span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_09_SWITCHBOARD_PATCHBAY":{ve(x,"Match each Left Line to its Right Studio Jack!");const s=Ia(e),y=[null,null,null],F=new Set;let d=0;const C=document.createElement("div");C.className="ws7-patchbay-stage";const R=document.createElement("div");R.className="ws7-patch-col";const P=document.createElement("div");P.style.cssText="width:48px;height:100%;";const N=document.createElement("div");N.className="ws7-patch-col";const _=document.createElementNS("http://www.w3.org/2000/svg","svg");_.setAttribute("style","position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;");const $=[],m=[],A=[],S=["#FF6738","#F4A91F","#00C2D1"],k=I=>{const w=C.getBoundingClientRect();if(w.width<=0)return;const u=[];if(A.forEach((i,E)=>{const g=y.indexOf(E);g>=0?(i.style.background=S[g],i.style.boxShadow=`0 0 10px ${S[g]}`):(i.style.background="#3E2012",i.style.boxShadow="inset 0 0 0 3px #F4A91F")}),y.forEach((i,E)=>{if(i===null)return;const g=$[E].getBoundingClientRect(),f=m[i].getBoundingClientRect(),D=g.right-w.left-6,z=g.top+g.height*.5-w.top,L=f.left-w.left+6,G=f.top+f.height*.5-w.top,V=Math.min(36,16+Math.abs(L-D)*.2),Z=(D+L)*.5,te=Math.max(z,G)+V;u.push(`<path d="M${D.toFixed(1)},${z.toFixed(1)} Q${Z.toFixed(1)},${te.toFixed(1)} ${L.toFixed(1)},${G.toFixed(1)}" fill="none" stroke="${S[E]}" stroke-width="5.5" stroke-linecap="round"/>`,`<path d="M${D.toFixed(1)},${z.toFixed(1)} Q${Z.toFixed(1)},${te.toFixed(1)} ${L.toFixed(1)},${G.toFixed(1)}" fill="none" stroke="#FFFDF7" stroke-width="1.4" stroke-dasharray="4 4" stroke-linecap="round"/>`)}),I){const i=$[d].getBoundingClientRect(),E=i.right-w.left-6,g=i.top+i.height*.5-w.top,f=I.x-w.left,D=I.y-w.top,z=(E+f)*.5,L=Math.max(g,D)+20;u.push(`<path d="M${E.toFixed(1)},${g.toFixed(1)} Q${z.toFixed(1)},${L.toFixed(1)} ${f.toFixed(1)},${D.toFixed(1)}" fill="none" stroke="${S[d]}" stroke-width="4.5" stroke-linecap="round"/>`)}_.innerHTML=u.join("")},T=()=>{$.forEach((I,w)=>{I.classList.toggle("is-armed",w===d&&!o&&!c)}),k()},M=(I,w)=>{if(o||c||l||F.has(w)||!Y())return;for(let i=0;i<3;i++)y[i]===w&&(y[i]=null);y[I]=w,t.onTactileSfx?.("THROW_SNAP");const u=y.findIndex(i=>i===null);if(u>=0)d=u,T();else{c=!0,T();const i=y[0]===s.correctMapping[0]&&y[1]===s.correctMapping[1]&&y[2]===s.correctMapping[2],E=y.map((f,D)=>`${s.callers[D]} -> ${s.jacks[f??0]}`).join(", "),g=s.correctMapping.map((f,D)=>`${s.callers[D]} -> ${s.jacks[f]}`).join(", ");y.forEach((f,D)=>{if(f===null)return;const z=f===s.correctMapping[D];m[f]?.classList.add(z?"is-reveal-correct":"is-reveal-wrong"),$[D]?.classList.add(z?"is-reveal-correct":"is-reveal-wrong")}),t.onRevealFlash?.(i),ne(()=>{we({isCorrect:i,accuracyRatio:i?1:0,chipMultiplier:i?1:0,chosenSummary:E,trueAnswerDisplay:g,triggeredKlaxon:!i&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},420,220)}};let r=null;const v=()=>{if(r){const I=r;r=null,I()}};q.push(v),s.callers.forEach((I,w)=>{const u=document.createElement("button");u.type="button",u.className="ws7-caller-plug ws7-cream-plaque",u.dataset.callerIdx=String(w),u.innerHTML=`
          <span class="ws7-choice-copy" style="font-size:14.5px;">${W(I)}</span>
          <span style="width:16px;height:16px;border-radius:50%;background:${S[w]};box-shadow:inset 0 0 0 2px #1E140E;flex:0 0 16px;"></span>
        `,u.addEventListener("pointerdown",()=>{if(o||c||l||!Y())return;v(),d=w,T();const i=f=>{if(l||o||c){v();return}k({x:f.clientX,y:f.clientY})},E=f=>{if(v(),l||o||c)return;const D=document.elementFromPoint(f.clientX,f.clientY)?.closest("[data-jack-idx]");D&&D.dataset.jackIdx!==void 0?M(w,Number(D.dataset.jackIdx)):k()},g=()=>{v(),l||k()};r=()=>{window.removeEventListener("pointermove",i),window.removeEventListener("pointerup",E),window.removeEventListener("pointercancel",g)},window.addEventListener("pointermove",i),window.addEventListener("pointerup",E),window.addEventListener("pointercancel",g)}),$.push(u),R.appendChild(u)}),s.jacks.forEach((I,w)=>{const u=document.createElement("button");u.type="button",u.className="ws7-jack-socket ws7-cream-plaque",u.dataset.jackIdx=String(w),u.innerHTML=`
          <span class="ws7-jack-lamp" style="width:16px;height:16px;border-radius:50%;background:#3E2012;box-shadow:inset 0 0 0 3px #F4A91F;flex:0 0 16px;transition:background 0.14s ease,box-shadow 0.14s ease;"></span>
          <div style="flex:1 1 auto;min-width:0;">
            <div class="ws7-choice-copy" style="font-size:14.5px;">${W(I)}</div>
            ${Be(e,w,t)}
          </div>
        `,A.push(u.querySelector(".ws7-jack-lamp")),u.addEventListener("click",()=>M(d,w)),m.push(u),N.appendChild(u)}),C.append(R,P,N,_),x.appendChild(C),requestAnimationFrame(()=>T()),pe=()=>{if(o||c||l)return[];const I=new Set(s.correctMapping),w=[0,1,2,3].filter(u=>!I.has(u));for(const u of w){F.add(u);const i=m[u];i&&(i.classList.add("is-fifty-cut"),i.disabled=!0,Re(i))}return ie("fifty",`<span class="ws7-stamp-fifty">50/50 CUT</span><span>DECOY JACK ELIMINATED · ${W(s.callers[0])} → <strong style="color:#FFD166;">${W(s.jacks[s.correctMapping[0]])}</strong></span>`),t.onTactileSfx?.("SHUTTER_CLACK"),w},he=()=>{if(o||c||l)return;const I=s.correctMapping[d]??s.correctMapping[0];ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL: <strong style="color:#FFD166;">${W(s.callers[d])}</strong> → <strong style="color:#7EF2AD;">${W(s.jacks[I])}</strong> (79%)</span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_10_CLIFFHANGERS_THROTTLE":{ve(x,"Slide the Mountain Pointer & tap LOCK IN!");const s=Bt(e),y=Math.max(1e-6,s.max-s.min),F=Math.round(Math.max(0,Math.min(100,(s.target-s.min)/y*100)));let d=50;const C=X=>{const J=s.min+X/100*y,le=s.step>=1?Math.round(J):Number(J.toFixed(1));return ht(String(le),s.unit??"")},R=X=>{const J=Math.max(0,Math.min(1,X/100));return{x:24+J*296,y:98-J*74}},P=Math.max(0,F-15),N=Math.min(100,F+15),_=Math.max(0,F-8),$=Math.min(100,F+8),m=R(P),A=R(N),S=R(_),k=R($),T=R(F),M=Math.max(54,Math.min(350,T.x)),r=document.createElement("div");r.className="ws7-cliff-layout";const v=document.createElement("div");v.style.cssText="width:100%;height:clamp(108px,23vh,144px);padding:2px 4px;position:relative;overflow:visible;";const I=[];for(let X=1;X<=15;X++){const J=X/15,le=24+J*296,Fe=96-J*72;I.push(`<line x1="${le.toFixed(1)}" y1="${Fe.toFixed(1)}" x2="${le.toFixed(1)}" y2="${(Fe+6).toFixed(1)}" stroke="#FFD166" stroke-width="${X%5===0?2.2:1.2}"/>`)}v.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--ws7-toy-caps);font-size:14.5px;font-weight:800;color:#FFF6E3;gap:8px;">
          <span class="ws7-cliff-readout" style="font-family:var(--ws7-toy-num);font-size:16px;color:#FFFDF7;"></span>
          <span style="color:#FFD166;">${W(Rt(s.min,s.max,s.unit??"","–"))}</span>
        </div>
        <svg viewBox="0 0 420 104" width="100%" height="80%" preserveAspectRatio="xMidYMid meet" style="overflow:visible;">
          <defs>
            <filter id="ws7CliffGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" flood-color="#FFD166" flood-opacity="0.95"/>
            </filter>
          </defs>
          <!-- Charley Harper Layered Mid-Century Alpine Peaks & Living Color Ridge -->
          <polygon points="8,98 118,38 228,98" fill="#005A63" opacity="0.72"/>
          <polygon points="154,98 258,28 360,98" fill="#006B74" opacity="0.68"/>
          <polygon points="24,98 320,24 320,98" fill="#0096A6" stroke="#FFF6E3" stroke-width="2.5"/>
          <polygon points="238,44 320,24 320,56 268,58" fill="#FFF6E3" fill-opacity="0.92"/>
          <polygon points="274,35 320,24 320,40 294,42" fill="#E0F4FF" fill-opacity="0.7"/>
          ${I.join("")}
          <line x1="320" y1="6" x2="320" y2="98" stroke="#FF6738" stroke-width="3" stroke-dasharray="5 3"/>
          <polygon points="320,6 344,13 320,20" fill="#FF6738"/>
          <!-- 50/50 Narrowed Ridge Bracket (hidden until lifeline triggered) -->
          <line class="ws7-cliff-fifty-band" x1="24" y1="98" x2="24" y2="98" stroke="#00E5FF" stroke-width="8" stroke-opacity="0" stroke-linecap="round"/>
          <!-- Price-Is-Right Range Game Reveal: Green Tolerance Band + Glowing Gold Exact Marker on Mountain Slope! -->
          <g class="ws7-cliff-reveal-group" opacity="0" style="transition:opacity 0.22s ease-out;">
            <line class="ws7-cliff-tol-band" x1="${m.x.toFixed(1)}" y1="${m.y.toFixed(1)}" x2="${A.x.toFixed(1)}" y2="${A.y.toFixed(1)}" stroke="#4ADE80" stroke-width="11" stroke-opacity="0.72" stroke-linecap="round"/>
            <line x1="${S.x.toFixed(1)}" y1="${S.y.toFixed(1)}" x2="${k.x.toFixed(1)}" y2="${k.y.toFixed(1)}" stroke="#16A34A" stroke-width="11" stroke-linecap="round"/>
            <g class="ws7-cliff-exact-marker" filter="url(#ws7CliffGoldGlow)">
              <line x1="${T.x.toFixed(1)}" y1="${T.y.toFixed(1)}" x2="${T.x.toFixed(1)}" y2="${Math.max(10,T.y-26).toFixed(1)}" stroke="#FFD166" stroke-width="3.2" stroke-linecap="round"/>
              <circle cx="${T.x.toFixed(1)}" cy="${T.y.toFixed(1)}" r="6.5" fill="#FFD166" stroke="#FFFFFF" stroke-width="2"/>
              <rect x="${(M-49).toFixed(1)}" y="${Math.max(2,T.y-46).toFixed(1)}" width="98" height="22" rx="6" fill="#5C301B" stroke="#FFD166" stroke-width="1.8"/>
              <text x="${M.toFixed(1)}" y="${(Math.max(2,T.y-46)+16).toFixed(1)}" text-anchor="middle" fill="#FFD166" font-family="Jost, sans-serif" font-size="14.5" font-weight="900">★ ${W(String(s.target))}</text>
            </g>
          </g>
          <!-- Studio Mountain Climber Token -->
          <g class="ws7-mountaineer" transform="translate(24,84)">
            <circle cx="0" cy="-15" r="6.5" fill="#FFFDF7" stroke="#1E140E" stroke-width="1.6"/>
            <path d="M-8,0 L0,-10 L8,0 Z" fill="#FF6738" stroke="#FFFDF7" stroke-width="1.4"/>
            <line x1="7" y1="-14" x2="12" y2="2" stroke="#FFD166" stroke-width="2.2"/>
          </g>
        </svg>
      `;const w=document.createElement("div");w.className="ws7-cliff-controls-row";const u=document.createElement("div");u.className="ws7-throttle-track",u.innerHTML=`
        <div style="position:relative;width:100%;height:16px;border-radius:8px;background:rgba(255,246,227,0.22);box-shadow:inset 0 2px 4px rgba(0,0,0,0.45);">
          <div class="ws7-throttle-fill" style="width:50%;height:100%;border-radius:8px;background:linear-gradient(90deg,#00C2D6 0%,#FFD166 70%,#FF6738 100%);"></div>
          <!-- Green Tolerance Band + Glowing Gold Exact Marker right on the Slider Track! -->
          <div class="ws7-track-tol-band" style="display:none;position:absolute;top:-3px;bottom:-3px;left:${P}%;width:${Math.max(4,N-P)}%;border-radius:999px;background:rgba(34,197,94,0.68);border:2px solid #86EFAC;box-shadow:0 0 12px rgba(34,197,94,0.85);pointer-events:none;z-index:2;"></div>
          <div class="ws7-track-exact-pin" style="display:none;position:absolute;top:50%;left:${F}%;transform:translate(-50%,-50%) rotate(45deg);width:18px;height:18px;border-radius:4px;background:#FFD166;border:2.5px solid #FFFFFF;box-shadow:0 0 16px #FFD166;pointer-events:none;z-index:4;"></div>
          <div class="ws7-throttle-knob" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:13px;background:linear-gradient(180deg,#FFFDF7 0%,#FFD166 72%,#F4A91F 100%);box-shadow:inset 0 2px 0 #FFFFFF,0 3px 0 #9E6300,0 4px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;gap:4px;z-index:3;">
            <span style="width:3px;height:16px;border-radius:2px;background:#9E6300;opacity:0.7;"></span>
            <span style="width:4px;height:22px;border-radius:2px;background:#7A4B00;"></span>
            <span style="width:3px;height:16px;border-radius:2px;background:#9E6300;opacity:0.7;"></span>
          </div>
        </div>
      `;const i=document.createElement("button");i.type="button",i.className="ws7-studio-lock-btn",i.textContent="LOCK IN!",w.append(u,i);const E=v.querySelector(".ws7-cliff-readout"),g=v.querySelector(".ws7-mountaineer"),f=v.querySelector(".ws7-cliff-reveal-group"),D=v.querySelector(".ws7-cliff-fifty-band"),z=u.querySelector(".ws7-throttle-fill"),L=u.querySelector(".ws7-throttle-knob"),G=u.querySelector(".ws7-track-tol-band"),V=u.querySelector(".ws7-track-exact-pin");let Z=50,te=0,oe=0,ue=0;const xe=X=>{z.style.width=`${X.toFixed(2)}%`,L.style.left=`${X.toFixed(2)}%`},be=X=>{if(l)return;const J=Math.min(.032,Math.max(.001,(X-ue)*.001));ue=X;const le=(d-Z)*320;if(te=(te+le*J)*Math.exp(-24*J),Z+=te*J,Math.abs(d-Z)<.06&&Math.abs(te)<.25){Z=d,te=0,xe(Z),oe=0;return}xe(Z),oe=requestAnimationFrame(be)};q.push(()=>{oe&&cancelAnimationFrame(oe)});const ye=(X=!1)=>{if(E.textContent=C(d),!X&&!t.reducedMotion&&(E.classList.remove("is-detent-pop"),E.offsetWidth,E.classList.add("is-detent-pop")),X||t.reducedMotion){Z=d,xe(Z);return}oe||(ue=performance.now(),oe=requestAnimationFrame(be))};ye(!0);let Ce=!1;const Me=X=>{const J=u.getBoundingClientRect(),le=24,Fe=Math.max(40,J.width-le*2),ke=Math.round(Math.max(0,Math.min(100,(X-(J.left+le))/Fe*100)));ke!==d&&(d=ke,t.onTactileSfx?.("DETENT"),ye(!1))},De=()=>{if(o||c||l||!Y())return;c=!0,t.onLockInStart?.(b),t.onTactileSfx?.("THROW_SNAP");const X=Math.abs(d-F),J=X<=15;if(i.disabled=!0,i.textContent=J?"✓ SAFE!":"✗ OVER EDGE!",i.style.background=J?"linear-gradient(180deg, #16A34A 0%, #117A37 100%)":"linear-gradient(180deg, #DC2626 0%, #991B1B 100%)",f.setAttribute("opacity","1"),G.style.display="block",V.style.display="block",g.style.transition=t.reducedMotion?"none":"transform 0.36s cubic-bezier(0.22, 1.18, 0.36, 1)",J){const ke=X/15,Ve=24+ke*290,K=84-ke*60;g.setAttribute("transform",`translate(${Ve.toFixed(1)},${K.toFixed(1)})`)}else g.setAttribute("transform","translate(358,94) rotate(68)");const le=X<=8?1:J?.75:0,Fe=X<=8?1:J?.85:0;t.onRevealFlash?.(J),ne(()=>{we({isCorrect:J,accuracyRatio:le,chipMultiplier:Fe,chosenSummary:`${C(d)} (${X} steps off)`,trueAnswerDisplay:ht(String(s.target),s.unit??""),triggeredKlaxon:!J&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},420,240)};i.addEventListener("click",De),u.addEventListener("pointerdown",X=>{if(!(o||c||l||!Y())){Ce=!0;try{u.setPointerCapture(X.pointerId)}catch{}Me(X.clientX)}}),u.addEventListener("pointermove",X=>{!Ce||o||c||l||Me(X.clientX)});const Ie=X=>{if(Ce){Ce=!1;try{u.hasPointerCapture(X.pointerId)&&u.releasePointerCapture(X.pointerId)}catch{}}};u.addEventListener("pointerup",Ie),u.addEventListener("pointercancel",Ie),r.append(v,w),x.appendChild(r),pe=()=>{if(o||c||l)return[];const X=(Math.abs(e.qid)%5-2)*3,J=Math.max(0,F-14+X),le=Math.min(100,F+14+X),Fe=R(J),ke=R(le);return D.setAttribute("x1",Fe.x.toFixed(1)),D.setAttribute("y1",Fe.y.toFixed(1)),D.setAttribute("x2",ke.x.toFixed(1)),D.setAttribute("y2",ke.y.toFixed(1)),D.setAttribute("stroke-opacity","0.9"),ie("fifty",`<span class="ws7-stamp-fifty">50/50 CUT</span><span>SAFE ZONE: ${W(C(J))} – ${W(C(le))}</span>`),t.onTactileSfx?.("SHUTTER_CLACK"),[0,1]},he=X=>{if(o||c||l)return;const J=e.qid%2===0?4:-4,le=Math.max(0,Math.min(100,F+J)),Fe=Math.max(60,Math.min(89,Math.round(Math.max(...X,71))));ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL (${Fe}%): SLIDE NEAR <strong style="color:#FFD166;">${W(C(le))}</strong></span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_11_MISSING_VOWELS_WHEEL":{ve(x,"Tap the Vowel Strip that solves the Puzzle Board!");const s=Ra(e),y=new Set,F=document.createElement("div");F.className="ws7-vowels-layout";const d=document.createElement("div");d.className="ws7-solari-rack";const C=Array.from(s.maskedDisplay),R=M=>{const r=M??s.maskedDisplay,v=r.split(/\s+/).filter(Boolean);let I=0,w=0;d.innerHTML=v.map(u=>{for(;I<r.length&&r[I]===" ";)I++;return`<span class="ws7-solari-word">${Array.from(u).map(E=>{const g=I++,f=E==="_",D=M!==null&&C[g]==="_",z=D&&!t.reducedMotion?` style="animation-delay:${w++*36}ms;"`:"";return`<span class="ws7-flap-tile${f?" is-blank":""}${D?" is-revealed":""}"${z}>${W(f?"?":E)}</span>`}).join("")}</span>`}).join("")};R(null);const P=document.createElement("div");P.className="ws7-drums-grid";const N=e.waiverPruneIdx!==s.correctChoiceIdx?e.waiverPruneIdx:(s.correctChoiceIdx+1)%4,_=e.poisonedFixIdx!==s.correctChoiceIdx?e.poisonedFixIdx:(s.correctChoiceIdx+2)%4,$=typeof t.canaryTickIdx=="number"?t.canaryTickIdx===e.answerIdx?s.correctChoiceIdx:_:null,m={...e,answerIdx:s.correctChoiceIdx,waiverPruneIdx:N,poisonedFixIdx:_},A={...t,canaryTickIdx:$},S=[],k=[],T=[];s.vowelChoices.forEach((M,r)=>{const v=M.split("-").map(E=>E.trim()).filter(Boolean),I=v.length>0?v.map(E=>`<span class="ws7-vowel-tile">${W(E)}</span>`).join(" "):W(M),w=document.createElement("button");w.type="button",w.className="ws7-vowel-drum",w.dataset.drumIdx=String(r),w.dataset.choiceIdx=String(r),w.innerHTML=`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;">
            <span class="ws7-choice-copy" style="display:inline;text-align:center;line-height:1.5;font-family:var(--ws7-toy-num);font-size:16px;font-weight:800;">${I}</span>
            <span class="ws7-pad-tail"></span>
          </div>
          ${Be(m,r,A)}
          <div class="ws7-poll-slot"></div>
        `;const u=w.querySelector(".ws7-pad-tail"),i=w.querySelector(".ws7-poll-slot");S.push(w),k.push(u),T.push(i),w.addEventListener("click",()=>{if(o||c||l||y.has(r)||!Y())return;const E=r===s.correctChoiceIdx;ee({containerEl:P,chosenEl:w,correctEl:S[s.correctChoiceIdx]??null,chosenTailSlot:u,correctTailSlot:k[s.correctChoiceIdx]??null,isCorrect:E,sfx:"SHUTTER_CLACK",onBeat2Extra:()=>{R(s.fullAnswer)},resolution:{isCorrect:E,accuracyRatio:E?1:0,chipMultiplier:1,chosenSummary:`${M} -> ${E?s.fullAnswer:s.maskedDisplay}`,trueAnswerDisplay:s.fullAnswer,triggeredKlaxon:!E&&!!e.isKlaxonMyth,fellForPoisonedFix:!E&&r===_}})}),P.appendChild(w)}),F.append(d,P),x.appendChild(F),pe=()=>{if(o||c||l)return[];const M=Ke(s.correctChoiceIdx,m,y);for(const r of M){y.add(r);const v=S[r];v&&(v.classList.add("is-fifty-cut"),v.disabled=!0,Re(v),T[r].classList.remove("is-visible"),T[r].innerHTML="")}return t.onTactileSfx?.("SHUTTER_CLACK"),M},he=M=>{if(o||c||l)return;const r=[...M];if(r.length>=4&&e.answerIdx!==s.correctChoiceIdx){const u=r[e.answerIdx];r[e.answerIdx]=r[s.correctChoiceIdx],r[s.correctChoiceIdx]=u}const v=[0,1,2,3].filter(u=>!y.has(u)),I=qe(r,v);let w=-1;I.forEach(u=>{u>w&&(w=u)}),[0,1,2,3].forEach(u=>{const i=T[u];if(y.has(u)){i.classList.remove("is-visible"),i.innerHTML="";return}const E=I.get(u)??0;i.innerHTML=Ue(E,E===w&&w>0),i.classList.add("is-visible")}),t.onTactileSfx?.("DETENT")};break}case"TOY_12_CONSPIRACY_LASSO":{const s=Ba(e),y=ve(x,s.connectionPrompt||"Tap or drag across the 3 matching Studio Cards!"),F=document.createElement("span");F.style.cssText="padding:1px 8px;border-radius:999px;background:#5C301B;color:#FFD166;box-shadow:inset 0 0 0 1.5px #FFD166;font-size:14.5px;font-weight:900;",F.textContent="0 / 3",y.appendChild(F);const d=[],C=new Set,R=document.createElement("div");R.className="ws7-corkboard";const P=document.createElementNS("http://www.w3.org/2000/svg","svg");P.setAttribute("style","position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;");const N=[],_=S=>{F.textContent=`${d.length} / 3`,N.forEach((u,i)=>u.classList.toggle("is-lassoed",d.includes(i)));const k=R.getBoundingClientRect();if(k.width<=0||d.length<2){P.innerHTML="";return}const T=d.map(u=>{const i=N[u].getBoundingClientRect();return{x:i.left+i.width*.5-k.left,y:i.top+8-k.top}}),r=(d.length===3?[...T,T[0]]:T).map(u=>`${u.x.toFixed(1)},${u.y.toFixed(1)}`).join(" "),v=S==="correct"?"#22C55E":S==="wrong"?"#EF4444":"#FF6738",I=S==="correct"?"rgba(34,197,94,0.22)":S==="wrong"?"rgba(239,68,68,0.22)":d.length===3?"rgba(255,103,56,0.18)":"none",w=t.reducedMotion?"":' class="ws7-twine-animated"';P.innerHTML=`
          <polyline${w} pathLength="100" points="${r}" fill="${I}" stroke="${v}" stroke-width="4.6" stroke-linejoin="round" stroke-linecap="round"/>
          <polyline points="${r}" fill="none" stroke="#FFD166" stroke-width="1.8" stroke-dasharray="5 3"/>
        `},$=()=>{if(d.length<3||o||c||l)return;c=!0,t.onTactileSfx?.("TWINE_TAUT");const S=new Set(s.triadIndices),k=d.every(r=>S.has(r)),T=d.map(r=>s.cards[r]).join(" + "),M=s.triadIndices.map(r=>s.cards[r]).join(" + ");_(k?"correct":"wrong"),N.forEach((r,v)=>{r.disabled=!0,S.has(v)?r.classList.add("is-reveal-correct"):d.includes(v)&&r.classList.add("is-reveal-wrong")}),t.onRevealFlash?.(k),ne(()=>{we({isCorrect:k,accuracyRatio:k?1:0,chipMultiplier:k?1.15:0,chosenSummary:T,trueAnswerDisplay:M,triggeredKlaxon:!k&&!!e.isKlaxonMyth,fellForPoisonedFix:!1})},420,220)};let m=!1;s.cards.slice(0,9).forEach((S,k)=>{const T=document.createElement("button");T.type="button",T.className="ws7-pin-card ws7-cream-plaque",T.dataset.cardIdx=String(k),T.innerHTML=`<span class="ws7-brass-tack" aria-hidden="true"></span><span>${W(S)}</span>`,T.addEventListener("pointerdown",()=>{if(o||c||l||C.has(k)||d.length>=3||!Y())return;m=!0;const M=d.indexOf(k);M>=0?d.splice(M,1):(d.push(k),t.onTactileSfx?.("TICK")),_(),$()}),N.push(T),R.appendChild(T)}),R.addEventListener("pointermove",S=>{if(!m||o||c||l||d.length>=3)return;const k=document.elementFromPoint(S.clientX,S.clientY)?.closest("[data-card-idx]");if(!k||k.dataset.cardIdx===void 0)return;const T=Number(k.dataset.cardIdx);!C.has(T)&&!d.includes(T)&&(d.push(T),t.onTactileSfx?.("TICK"),_(),$())});const A=()=>{m=!1};window.addEventListener("pointerup",A),q.push(()=>window.removeEventListener("pointerup",A)),R.appendChild(P),x.appendChild(R),pe=()=>{if(o||c||l)return[];const S=new Set(s.triadIndices),k=N.map((T,M)=>M).filter(T=>!S.has(T)&&!C.has(T)).slice(0,3);for(const T of k){C.add(T);const M=d.indexOf(T);M>=0&&d.splice(M,1);const r=N[T];r&&(r.classList.add("is-fifty-cut"),r.disabled=!0,Re(r))}return _(),t.onTactileSfx?.("SHUTTER_CLACK"),k},he=()=>{if(o||c||l)return;const S=s.cards[s.triadIndices[0]]??"";ie("poll",`<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${Le()} STUDIO POLL: 81% OF THE AUDIENCE LINKED <strong style="color:#FFD166;">${W(S)}</strong> INTO THE TRIAD!</span>`),t.onTactileSfx?.("DETENT")};break}case"TOY_13_CYANOTYPE_LOUPE":{const s=Pa(e);ve(x,"Tap Zone A–D on the TV Monitor or tap its Answer Pad!");const y=document.createElement("div");y.className="ws7-cyano-outer",y.dataset.hasLegend="true",x.appendChild(y);const F=document.createElement("div");F.className="ws7-cyanotype-wrap",y.appendChild(F);const d=[(s.targetZoneIdx+2)%8,(s.targetZoneIdx+5)%8,(s.targetZoneIdx+7)%8],C=[];let R=0;for(let w=0;w<4;w++)w===e.answerIdx?C.push(s.targetZoneIdx):C.push(d[R++]);const P=new Map;C.forEach((w,u)=>P.set(w,u));const N=new Set,_=new Set,$=[],m=[],A=!!t.hasPatentCyanotypeTube||!!t.equippedRelicIds?.includes("relic_patent_cyanotype_tube"),S=t.dayJob==="PATENT_CLERK"||A?s.targetZoneIdx:null,k=t.pruneActive?C[e.waiverPruneIdx]:null,T=C[e.poisonedFixIdx],M=typeof t.canaryTickIdx=="number"?C[t.canaryTickIdx]??s.targetZoneIdx:null,r=w=>{if(o||c||l||_.has(w)||!Y())return;c=!0,t.onLockInStart?.(b),t.onTactileSfx?.("IRIS_FLASH"),v(w);const u=w===s.targetZoneIdx,i=P.get(w),E=i!==void 0?e.choices[i]:u?s.targetZoneName:`Zone #${w+1}`;$.forEach((g,f)=>{g.disabled=!0,f===e.answerIdx?g.classList.add("is-reveal-correct"):!u&&f===i&&g.classList.add("is-reveal-wrong")}),t.onRevealFlash?.(u),ne(()=>{we({isCorrect:u,accuracyRatio:u?1:0,chipMultiplier:1.15,chosenSummary:E,trueAnswerDisplay:s.targetZoneName,triggeredKlaxon:!u&&!!e.isKlaxonMyth,fellForPoisonedFix:!u&&w===T})},400,200)},v=w=>{F.innerHTML=da(s.plateId,{activeZoneIdx:w,revealedTargetIdx:w!==null?s.targetZoneIdx:null,patentClerkHintIdx:S,pruneZoneIdx:k,canaryZoneIdx:M,poisonedZoneIdx:T,uvLoupeActive:t.uvLoupeActive}),F.querySelectorAll("[data-zone-idx]").forEach(i=>{const E=Number(i.dataset.zoneIdx??0);if(_.has(E)){i.style.opacity="0.2",i.style.pointerEvents="none";return}const g=P.get(E);if(g!==void 0){const f=Number(i.dataset.x0??24),D=Number(i.dataset.y0??30),z=document.createElementNS("http://www.w3.org/2000/svg","rect");z.setAttribute("x",String(f+6)),z.setAttribute("y",String(D+6)),z.setAttribute("width","26"),z.setAttribute("height","23"),z.setAttribute("rx","6"),z.setAttribute("fill","#FFD166"),i.appendChild(z);const L=document.createElementNS("http://www.w3.org/2000/svg","text");L.setAttribute("x",String(f+19)),L.setAttribute("y",String(D+23)),L.setAttribute("text-anchor","middle"),L.setAttribute("fill","#141B29"),L.setAttribute("font-family","Jost, sans-serif"),L.setAttribute("font-size","16"),L.setAttribute("font-weight","900"),L.textContent=dt[g],i.appendChild(L)}else i.style.opacity="0.26",i.style.pointerEvents="none";if(w!==null){if(E===w){const f=Number(i.dataset.x0??24),D=Number(i.dataset.y0??30),z=Number(i.dataset.cx??f+55),L=Number(i.dataset.cy??D+56),G=document.createElementNS("http://www.w3.org/2000/svg","g");G.setAttribute("class",t.reducedMotion?"":"ws7-loupe-reticle");const V=E===s.targetZoneIdx?"#22C55E":"#FFD166";G.innerHTML=`
                <circle cx="${z}" cy="${L}" r="26" fill="none" stroke="${V}" stroke-width="3" stroke-dasharray="7 4"/>
                <line x1="${z-34}" y1="${L}" x2="${z-18}" y2="${L}" stroke="#FFFDF7" stroke-width="2.2"/>
                <line x1="${z+18}" y1="${L}" x2="${z+34}" y2="${L}" stroke="#FFFDF7" stroke-width="2.2"/>
                <line x1="${z}" y1="${L-34}" x2="${z}" y2="${L-18}" stroke="#FFFDF7" stroke-width="2.2"/>
                <line x1="${z}" y1="${L+18}" x2="${z}" y2="${L+34}" stroke="#FFFDF7" stroke-width="2.2"/>
              `,i.appendChild(G)}return}i.addEventListener("click",()=>r(E)),i.addEventListener("keydown",f=>{(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),r(E))})})};v(null);const I=document.createElement("div");I.className="ws7-cyano-legend-grid",e.choices.forEach((w,u)=>{const i=C[u],E=document.createElement("button");E.type="button",E.className="ws7-cyano-legend-btn ws7-cream-plaque",E.dataset.choiceIdx=String(u),E.innerHTML=`
          <span class="ws7-choice-copy" style="font-size:14.5px;"><strong style="color:#008B9A;font-family:var(--ws7-toy-caps);">${dt[u]}.</strong> ${W(w)}</span>
          ${Be(e,u,t)}
          <div class="ws7-poll-slot"></div>
        `,E.addEventListener("click",()=>r(i)),$.push(E),m.push(E.querySelector(".ws7-poll-slot")),I.appendChild(E)}),y.appendChild(I),pe=()=>{if(o||c||l)return[];const w=Ke(e.answerIdx,e,N);for(const u of w){N.add(u),_.add(C[u]);const i=$[u];i&&(i.classList.add("is-fifty-cut"),i.disabled=!0,Re(i),m[u].classList.remove("is-visible"),m[u].innerHTML="")}return v(null),t.onTactileSfx?.("SHUTTER_CLACK"),w},he=w=>{if(o||c||l)return;const u=[0,1,2,3].filter(g=>!N.has(g)),i=qe(w,u);let E=-1;i.forEach(g=>{g>E&&(E=g)}),[0,1,2,3].forEach(g=>{const f=m[g];if(N.has(g)){f.classList.remove("is-visible"),f.innerHTML="";return}const D=i.get(g)??0;f.innerHTML=Ue(D,D===E&&E>0),f.classList.add("is-visible")}),t.onTactileSfx?.("DETENT")};break}}return queueMicrotask(()=>{l||Ge(a)}),{toyId:n,cardStyle:p,applyFiftyFiftyPrune(){return Se!==null||(Se=pe(),queueMicrotask(()=>{l||Ge(a)})),Se},showAudiencePollOverlay(s){he(s),queueMicrotask(()=>{l||Ge(a)})},dispose(){if(!l){l=!0;for(const s of U)window.clearTimeout(s);for(const s of q)s();x.parentElement===a&&a.removeChild(x)}}}}const $a=["A","B","C","D"],et=[{tone:"cream",doorName:"SHUTTER 1",lipHex:"#008B94"},{tone:"teal",doorName:"SHUTTER 2",lipHex:"#008B94"},{tone:"gold",doorName:"SHUTTER 3",lipHex:"#F2A922"},{tone:"cerise",doorName:"SHUTTER 4",lipHex:"#E6397A"}],mt="ws8-four-shutter-deluxe-styles";let st=0;function Na(){if(st+=1,typeof document>"u")return;let a=document.getElementById(mt);a||(a=document.createElement("style"),a.id=mt,document.head.appendChild(a)),a.dataset.version!=="v8.1-sunlit-shutter-wall"&&(a.dataset.version="v8.1-sunlit-shutter-wall",a.textContent=`
    @keyframes ws8LouverSlideUp {
      0% {
        opacity: 1;
        transform: perspective(560px) rotateX(0deg) translateY(0%);
      }
      55% {
        opacity: 0.92;
        transform: perspective(560px) rotateX(62deg) translateY(-58%);
      }
      100% {
        opacity: 0;
        transform: perspective(560px) rotateX(84deg) translateY(-102%);
      }
    }

    @keyframes ws8CreamBloomIn {
      0% {
        background-color: #FFE7A8;
        box-shadow:
          inset 0 0 0 2px #FFD166,
          0 0 18px rgba(255, 209, 102, 0.65);
      }
      100% {
        background-color: #FFF6E3;
      }
    }

    @keyframes ws8ActiveTubePulse {
      from {
        box-shadow:
          inset 0 1.5px 0 #FFFDF7,
          0 2px 0 #A84D10,
          0 0 0 1.5px #FF6B35,
          0 0 10px rgba(242, 169, 34, 0.52);
      }
      to {
        box-shadow:
          inset 0 1.5px 0 #FFFFFF,
          0 2px 0 #A84D10,
          0 0 0 2px #F2A922,
          0 0 18px rgba(255, 107, 53, 0.78);
      }
    }

    @keyframes ws8ClutchPulse {
      from {
        transform: translateY(2px) scale(1);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 3px #FFD166,
          0 0 16px rgba(255, 209, 102, 0.75);
      }
      to {
        transform: translateY(1px) scale(1.012);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 4px #FFF3B0,
          0 0 30px rgba(255, 190, 46, 0.98);
      }
    }

    @keyframes ws8BadgePop {
      0% {
        opacity: 0;
        transform: scale(0.84);
      }
      70% {
        opacity: 1;
        transform: scale(1.06);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes ws8PollBarGrow {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    /* Safe-centering inside Question Chassis Toy Bay */
    .ws7-toy-bay:has(> .ws8-shutter-deluxe-root) {
      justify-content: flex-start !important;
      min-height: 0;
    }

    .ws8-shutter-deluxe-root {
      --ws8-sans: 'Plus Jakarta Sans', 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --ws8-caps: 'Jost', 'League Spartan', 'Plus Jakarta Sans', system-ui, sans-serif;
      --ws8-num: 'Michroma', 'Chakra Petch', 'Jost', sans-serif;
      container-type: inline-size;
      container-name: ws8shutter;
      position: relative;
      width: 100%;
      min-width: 0;
      margin: auto 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-family: var(--ws8-sans);
      font-variant-numeric: tabular-nums;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      color: #141B29;
    }

    .ws8-shutter-deluxe-root *,
    .ws8-shutter-deluxe-root *::before,
    .ws8-shutter-deluxe-root *::after {
      box-sizing: border-box;
    }

    /* ========================================================================
       1. SUNLIT 1966 BRUSHED CHAMPAGNE-ALUMINUM & WARM IVORY STEP TRACK
       ======================================================================== */
    .ws8-shutter-marquee {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px 7px;
      border-radius: 12px;
      background:
        radial-gradient(circle at 14% 0%, rgba(255, 253, 247, 0.94) 0%, transparent 58%),
        radial-gradient(circle at 86% 0%, rgba(242, 169, 34, 0.24) 0%, transparent 58%),
        linear-gradient(180deg, #FFFDF7 0%, #EFE4CA 56%, #E2D2AE 100%);
      box-shadow:
        inset 0 1.5px 0 #FFFFFF,
        inset 0 0 0 1.6px #C89E4C,
        0 3px 10px rgba(74, 42, 18, 0.18);
    }

    .ws8-shutter-ladder-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: 3px;
      width: 100%;
    }

    .ws8-ladder-arrow {
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      color: #8A5A19;
      opacity: 0.92;
      line-height: 1;
      padding: 0 1px;
    }

    .ws8-ladder-tube {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 34px;
      padding: 3px 4px;
      border-radius: 8px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5ECD8 68%, #EADBC0 100%);
      box-shadow:
        inset 0 1px 0 #FFFFFF,
        inset 0 0 0 1.3px #C9A458,
        0 1.5px 0 #B58F46;
      color: #5A4632;
      text-align: center;
      transition: transform 0.16s ease, background 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
    }

    .ws8-ladder-tube-mult {
      font-family: var(--ws8-caps);
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.05;
      white-space: nowrap;
    }

    .ws8-ladder-tube-sub {
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.03em;
      line-height: 1.05;
      opacity: 0.92;
      white-space: nowrap;
    }

    .ws8-ladder-tube[data-state="active"] {
      background: linear-gradient(135deg, #FFF2B2 0%, #F2A922 52%, #FF7838 100%);
      color: #141B29;
      transform: translateY(-1px);
      box-shadow:
        inset 0 1.5px 0 #FFFDF7,
        0 2px 0 #A84D10,
        0 0 0 1.8px #FF6B35,
        0 0 14px rgba(242, 169, 34, 0.68);
    }

    .ws8-shutter-deluxe-root[data-reduced-motion="false"] .ws8-ladder-tube[data-state="active"] {
      animation: ws8ActiveTubePulse 1.35s ease-in-out infinite alternate;
    }

    .ws8-ladder-tube[data-state="spent"] {
      opacity: 0.68;
      background: linear-gradient(180deg, #F0E7D4 0%, #E3D6BC 100%);
      color: #85725B;
      box-shadow: inset 0 0 0 1px rgba(162, 128, 68, 0.44);
    }

    .ws8-ladder-tube[data-state="spent"] .ws8-ladder-tube-mult {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
    }

    .ws8-writer-perk-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 2px 8px;
      border-radius: 7px;
      background: linear-gradient(90deg, #006E78 0%, #008B94 50%, #006E78 100%);
      box-shadow: inset 0 0 0 1.5px #FFD166;
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      text-align: center;
    }

    /* ========================================================================
       2. MAIN BODY (STACKED IN PORTRAIT, 2-COLUMN SPLIT IN LANDSCAPE / WIDE)
       ======================================================================== */
    .ws8-shutter-deluxe-body {
      display: flex;
      flex-direction: column;
      gap: 7px;
      width: 100%;
      min-width: 0;
    }

    .ws8-shutter-left-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    /* Sunlit 1966 American Walnut & Spun-Brass Motorized Shutter Frame */
    .ws8-walnut-cabinet {
      position: relative;
      padding: 6px;
      border-radius: 13px;
      background:
        radial-gradient(circle at 6px 6px, #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        radial-gradient(circle at calc(100% - 6px) 6px, #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        radial-gradient(circle at 6px calc(100% - 6px), #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        radial-gradient(circle at calc(100% - 6px) calc(100% - 6px), #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        repeating-linear-gradient(
          94deg,
          rgba(255, 226, 182, 0.06) 0px,
          rgba(255, 226, 182, 0.06) 3px,
          rgba(42, 18, 6, 0.08) 3px,
          rgba(42, 18, 6, 0.08) 9px
        ),
        linear-gradient(180deg, #7E4529 0%, #6E3B23 55%, #552B17 100%);
      box-shadow:
        inset 0 1.5px 0 rgba(255, 232, 192, 0.42),
        inset 0 0 0 1.8px #D9AE62,
        0 5px 14px rgba(5, 14, 26, 0.38);
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .ws8-shutter-bay {
      position: relative;
      min-height: 56px;
      border-radius: 10px;
      overflow: hidden;
      background: #552B17;
      display: flex;
      align-items: stretch;
      justify-content: stretch;
    }

    /* Warm Broadcast Cream (#FFF6E3) Backlit Acrylite Clue Plaque */
    .ws8-shutter-plaque {
      position: relative;
      width: 100%;
      min-height: 56px;
      padding: 8px 9px 7px 9px;
      border-radius: 10px;
      background:
        repeating-linear-gradient(
          0deg,
          rgba(148, 112, 54, 0.025) 0px,
          rgba(148, 112, 54, 0.025) 1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 72%, #F1DFBE 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -1.5px 0 rgba(186, 154, 98, 0.55);
      color: #141B29;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }

    .ws8-shutter-plaque.is-fresh-bloom {
      animation: ws8CreamBloomIn 0.36s ease-out both;
    }

    /* Retracted Painted Louver Lip tucked at top of open window */
    .ws8-retracted-lip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--shutter-lip-hex, #008B94);
      box-shadow: 0 1px 2px rgba(20, 27, 41, 0.25);
      pointer-events: none;
    }

    .ws8-shutter-clue-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }

    .ws8-shutter-clue-tag {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: linear-gradient(180deg, #008B94 0%, #006E78 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
    }

    .ws8-shutter-inline-idx {
      display: none;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      color: #006E78;
      margin-right: 4px;
    }

    @media (max-height: 700px) and (orientation: portrait),
           (max-height: 500px) and (orientation: landscape) {
      .ws8-shutter-inline-idx {
        display: inline;
      }
    }

    .ws8-shutter-clue-copy {
      font-family: var(--ws8-sans);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.22;
      color: #141B29;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: normal;
      hyphens: none;
    }

    /* Colorful 1966 Laugh-In Painted Motorized Louver Door Button */
    .ws8-louver-door {
      position: relative;
      z-index: 2;
      width: 100%;
      min-height: 56px;
      padding: 6px 8px 11px 8px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      text-align: center;
      transform-origin: top center;
      transition: filter 0.12s ease, transform 0.12s ease;
    }

    /* Horizontal Motorized Louver Slat Grooves */
    .ws8-louver-door::before {
      content: '';
      position: absolute;
      inset: 4px 7px 11px 7px;
      border-radius: 6px;
      background: repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16) 0px,
        rgba(255, 255, 255, 0.16) 2px,
        transparent 2px,
        transparent 6px,
        rgba(8, 18, 32, 0.16) 6px,
        rgba(8, 18, 32, 0.16) 8px
      );
      pointer-events: none;
    }

    /* Left Brass Barrel Hinge Pins on Unopened Studio Doors */
    .ws8-louver-hinges {
      position: absolute;
      left: 3px;
      top: 8px;
      bottom: 10px;
      width: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      z-index: 2;
    }

    .ws8-louver-hinges::before,
    .ws8-louver-hinges::after {
      content: '';
      display: block;
      width: 4px;
      height: 10px;
      border-radius: 2px;
      background: linear-gradient(90deg, #FFF3B0 0%, #D99B1E 60%, #7D5200 100%);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }

    /* 3D Sculpted Spun-Brass Pull Handle at Bottom Center */
    .ws8-louver-door::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 34px;
      height: 6px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFF6C4 0%, #F2A922 55%, #9E6200 100%);
      box-shadow:
        0 0 0 1.2px rgba(20, 27, 41, 0.58),
        0 2px 3px rgba(0, 0, 0, 0.48);
      pointer-events: none;
    }

    .ws8-louver-door[data-tone="teal"] {
      background: linear-gradient(180deg, #00B4C0 0%, #008B94 65%, #00666E 100%);
      color: #FFFDF7;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.42),
        inset 0 0 0 1.5px rgba(255, 228, 132, 0.55),
        0 3px 0 #004A50;
    }

    .ws8-louver-door[data-tone="gold"] {
      background: linear-gradient(180deg, #FFD25A 0%, #F2A922 65%, #C98208 100%);
      color: #141B29;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.62),
        inset 0 0 0 1.5px rgba(20, 27, 41, 0.28),
        0 3px 0 #8F5900;
    }

    .ws8-louver-door[data-tone="cerise"] {
      background: linear-gradient(180deg, #F55391 0%, #E6397A 65%, #B31E57 100%);
      color: #FFFDF7;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.42),
        inset 0 0 0 1.5px rgba(255, 228, 132, 0.52),
        0 3px 0 #7D113B;
    }

    .ws8-louver-door[data-next="true"] {
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.68),
        0 0 0 2px #FFD166,
        0 3px 10px rgba(255, 209, 102, 0.48);
    }

    .ws8-louver-door:hover:not(:disabled) {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }

    .ws8-louver-door:active:not(:disabled) {
      transform: translateY(1px);
    }

    .ws8-louver-door.is-retracting {
      position: absolute;
      inset: 0;
      pointer-events: none;
      animation: ws8LouverSlideUp 0.26s cubic-bezier(0.22, 1.12, 0.36, 1) forwards;
    }

    .ws8-louver-title {
      position: relative;
      z-index: 1;
      font-family: var(--ws8-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }

    .ws8-louver-sub {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5ECD8 100%);
      box-shadow:
        inset 0 1px 0 #FFFFFF,
        0 0 0 1.2px rgba(142, 92, 14, 0.65),
        0 1px 3px rgba(32, 16, 6, 0.25);
      color: #141B29;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.15;
    }

    .ws8-peek-shutter-icon {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 19px;
      height: 19px;
    }

    /* Dedicated Peek Next Shutter Studio Lever Bar (>= 48x48px guaranteed at all DPIs) */
    .ws8-peek-shutter-btn {
      width: 100%;
      min-height: 50px;
      padding: 6px 12px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(180deg, #FF8354 0%, #FF6B35 58%, #D94B1A 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.5),
        inset 0 0 0 1.5px rgba(255, 209, 102, 0.62),
        0 3.5px 0 #962E0A,
        0 6px 14px rgba(6, 16, 30, 0.34);
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      text-align: center;
      transition: transform 0.1s ease, filter 0.12s ease, opacity 0.14s ease;
    }

    .ws8-peek-shutter-btn:hover:not(:disabled) {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }

    .ws8-peek-shutter-btn:active:not(:disabled) {
      transform: translateY(2px);
    }

    .ws8-peek-shutter-btn[data-all-open="true"] {
      display: none;
    }

    /* ========================================================================
       3. 4 CRISP PUSH-BUTTON CHOICE PADS (A / B / C / D) + 2-BEAT LOCK-IN
       ======================================================================== */
    .ws8-shutter-choices-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
      min-width: 0;
      align-content: stretch;
    }

    .ws8-choice-pad {
      --ws8-pad-accent: #008B94;
      position: relative;
      min-height: 52px;
      padding: 6px 9px 6px 8px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 68%, #EEDBB8 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 var(--ws8-pad-accent),
        0 3.5px 0 #B89D6E,
        0 6px 14px rgba(5, 14, 26, 0.3);
      color: #141B29;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 7px;
      min-width: 0;
      transition: transform 0.1s ease, box-shadow 0.12s ease, background 0.12s ease, opacity 0.14s ease;
    }

    .ws8-choice-pad[data-pad-tone="0"] { --ws8-pad-accent: #008B94; }
    .ws8-choice-pad[data-pad-tone="1"] { --ws8-pad-accent: #F2A922; }
    .ws8-choice-pad[data-pad-tone="2"] { --ws8-pad-accent: #1746A2; }
    .ws8-choice-pad[data-pad-tone="3"] { --ws8-pad-accent: #E6397A; }

    .ws8-choice-pad:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .ws8-choice-pad:active:not(:disabled) {
      transform: translateY(2px);
    }

    .ws8-pad-medallion {
      flex: 0 0 28px;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--ws8-pad-accent);
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 15px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1.5px 3px rgba(10, 20, 34, 0.28);
    }

    .ws8-choice-pad[data-pad-tone="1"] .ws8-pad-medallion {
      color: #141B29;
    }

    .ws8-pad-body {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws8-pad-inline-letter {
      display: none;
      font-family: var(--ws8-caps);
      font-weight: 900;
      color: var(--ws8-pad-accent);
      margin-right: 4px;
    }

    .ws8-choice-pad[data-pad-tone="1"] .ws8-pad-inline-letter {
      color: #B87400;
    }

    .ws8-pad-label {
      font-family: var(--ws8-sans);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
      color: #141B29;
      white-space: normal;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
    }

    .ws8-choice-pad[data-long-token="true"] .ws8-pad-label {
      overflow-wrap: break-word;
      letter-spacing: -0.02em;
    }

    .ws8-pad-tail {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* High-Contrast Badge Boost */
    .ws8-shutter-deluxe-root[data-high-contrast="true"] .ws8-choice-pad,
    .ws8-shutter-deluxe-root[data-high-contrast="true"] .ws8-shutter-plaque {
      outline: 2px solid #141B29;
      outline-offset: -2px;
    }

    /* Diegetic Stamps & 50/50 Cut + Solari Poll Bars */
    .ws8-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
    }

    .ws8-meta-row:empty {
      display: none;
    }

    .ws8-stamp-void {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: #FDE8E8;
      color: #B51722;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.6px #B51722;
    }

    .ws8-stamp-fifty {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: linear-gradient(180deg, #6E3B23 0%, #4E2714 100%);
      color: #FFE484;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.5px #FFD166;
      animation: ws8BadgePop 0.2s ease-out both;
    }

    .ws8-canary-tick {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 6px;
      border-radius: 4px;
      background: #E0F4FF;
      color: #005A9C;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.5px #0077B6;
    }

    .ws8-uv-poison {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: #F1E6FF;
      color: #5B189A;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.5px #7B2CBF;
    }

    .ws8-choice-pad.is-fifty-cut {
      opacity: 0.42 !important;
      filter: saturate(0.24);
      pointer-events: none !important;
      cursor: not-allowed !important;
    }

    .ws8-choice-pad.is-fifty-cut .ws8-pad-label {
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #B51722;
    }

    .ws8-poll-slot {
      display: none;
      margin-top: 2px;
      width: 100%;
    }

    .ws8-poll-slot.is-visible {
      display: block;
    }

    .ws8-poll-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      width: 100%;
      padding: 2px 5px;
      border-radius: 6px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F3E6CA 100%);
      box-shadow: inset 0 0 0 1.3px #C8A252;
    }

    .ws8-poll-badge[data-leader="true"] {
      box-shadow: inset 0 0 0 1.6px #D9860B, 0 0 8px rgba(242, 169, 34, 0.35);
    }

    .ws8-poll-track {
      flex: 1 1 auto;
      min-width: 22px;
      height: 7px;
      border-radius: 999px;
      background: #E2D3B3;
      overflow: hidden;
    }

    .ws8-poll-fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #008B94 0%, #00B4C0 100%);
      transform-origin: left center;
      animation: ws8PollBarGrow 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .ws8-poll-badge[data-leader="true"] .ws8-poll-fill {
      background: linear-gradient(90deg, #D9860B 0%, #F2A922 100%);
    }

    .ws8-poll-pct {
      flex: 0 0 auto;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      color: #141B29;
      line-height: 1;
      white-space: nowrap;
    }

    .ws8-poll-badge[data-leader="true"] .ws8-poll-pct {
      color: #8A4E00;
    }

    /* 2-Beat Studio Lock-In & True-Answer Tally States */
    .ws8-shutter-deluxe-root.is-console-locked button {
      pointer-events: none;
    }

    .ws8-shutter-deluxe-root.is-console-locked .ws8-choice-pad:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong) {
      opacity: 0.6;
    }

    .ws8-choice-pad.is-amber-lock {
      transform: translateY(2px);
      background: radial-gradient(circle at 50% 45%, #FFFDF7 0%, #FFF0A8 56%, #F7B728 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 1px 0 #A86B00,
        0 0 0 3px #FFD166,
        0 0 24px rgba(255, 209, 102, 0.9) !important;
    }

    .ws8-choice-pad.is-clutch-lock {
      animation: ws8ClutchPulse 0.28s ease-in-out infinite alternate !important;
    }

    .ws8-choice-pad.is-reveal-correct {
      opacity: 1 !important;
      filter: none !important;
      transform: translateY(-1px);
      background: linear-gradient(180deg, #E8FFF1 0%, #B8F7D2 62%, #7CEBA8 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #0F9D58,
        0 3px 0 #0B7A42,
        0 0 0 3px #22C55E,
        0 0 26px rgba(34, 197, 94, 0.88) !important;
    }

    .ws8-choice-pad.is-reveal-wrong {
      opacity: 1 !important;
      transform: translateY(2px);
      background: linear-gradient(180deg, #FFF0F0 0%, #FFD0CE 62%, #FCA5A5 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #C81E1E,
        0 2px 0 #991B1B,
        0 0 0 3px #EF4444,
        0 0 22px rgba(239, 68, 68, 0.8) !important;
    }

    .ws8-lock-badge {
      position: absolute;
      top: 4px;
      right: 6px;
      z-index: 3;
      padding: 2px 7px;
      border-radius: 999px;
      background: linear-gradient(180deg, #7A3E18 0%, #52260C 100%);
      color: #FFF3B0;
      box-shadow: 0 0 0 1.8px #FFD166, 0 2px 8px rgba(48, 22, 6, 0.38);
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.05;
      white-space: nowrap;
      animation: ws8BadgePop 0.16s ease-out both;
    }

    .ws8-tally-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border-radius: 999px;
      font-family: var(--ws8-caps);
      font-size: 14.5px;
      font-weight: 900;
      line-height: 1;
      color: #FFFFFF;
      animation: ws8BadgePop 0.16s ease-out both;
    }

    .ws8-tally-badge.is-correct {
      background: #0F8A49;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 12px rgba(34, 197, 94, 0.8);
    }

    .ws8-tally-badge.is-wrong {
      background: #C81E1E;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 12px rgba(239, 68, 68, 0.78);
    }

    /* ========================================================================
       4. WIDE CONTAINER & LANDSCAPE 2-COLUMN SPLIT:
          Left Column = 4 Motorized Shutters + Peek Lever
          Right Column = 2x2 Choice Pads (A / B / C / D)
       ======================================================================== */
    @container ws8shutter (min-width: 560px) {
      .ws8-shutter-deluxe-body {
        display: grid;
        grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
        gap: 10px;
        align-items: stretch;
      }

      .ws8-shutter-choices-grid {
        align-content: center;
      }
    }

    /* Compact Mobile Portrait (390x660 / <= 700px height): Zero Scroll, >= 48px Targets! */
    @media (max-height: 700px) and (orientation: portrait) {
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) .ws7-clue-body {
        padding: 6px 12px 5px 12px;
      }
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) .ws7-toy-bay {
        padding: 5px 9px 7px 9px;
      }
      .ws8-shutter-deluxe-root {
        gap: 4px;
      }
      .ws8-shutter-marquee {
        padding: 3px 6px;
        gap: 2px;
      }
      .ws8-ladder-tube {
        min-height: 28px;
        padding: 2px 3px;
      }
      .ws8-shutter-deluxe-body {
        gap: 4px;
      }
      .ws8-shutter-left-col {
        gap: 4px;
      }
      .ws8-walnut-cabinet {
        padding: 4px;
        gap: 4px;
      }
      .ws8-shutter-bay,
      .ws8-shutter-plaque {
        min-height: 48px;
      }
      .ws8-louver-door {
        min-height: 50px;
      }
      .ws8-shutter-plaque {
        padding: 5px 7px 4px 7px;
      }
      .ws8-shutter-clue-head {
        display: none;
      }
      .ws8-shutter-clue-copy {
        font-size: 15px;
        line-height: 1.15;
      }
      .ws8-peek-shutter-btn {
        min-height: 50px;
        padding: 5px 10px;
      }
      .ws8-shutter-choices-grid {
        gap: 5px;
      }
      .ws8-choice-pad {
        min-height: 50px;
        padding: 5px 7px;
        gap: 6px;
      }
      .ws8-pad-medallion {
        flex: 0 0 25px;
        width: 25px;
        height: 25px;
        font-size: 14px;
      }
      .ws8-pad-label {
        font-size: 15px;
        line-height: 1.15;
      }
    }

    /* Compact Mobile Landscape (844x390 / <= 500px height):
       Enforces 2-Column Split (4 Shutters Left | 2x2 Choice Pads Right), 0px Overflow, >= 48px Targets! */
    @media (max-height: 500px) and (orientation: landscape) {
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) {
        grid-template-columns: minmax(0, 32%) minmax(0, 68%);
      }
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) .ws7-toy-bay {
        padding: 5px 8px;
      }
      .ws8-shutter-deluxe-root {
        gap: 4px;
      }
      .ws8-shutter-marquee {
        padding: 3px 6px;
        gap: 2px;
      }
      .ws8-ladder-tube {
        min-height: 27px;
        padding: 2px 3px;
      }
      .ws8-ladder-tube-mult {
        font-size: 13.5px;
      }
      .ws8-ladder-tube-sub {
        font-size: 13px;
      }
      .ws8-shutter-deluxe-body {
        display: grid;
        grid-template-columns: minmax(0, 1.04fr) minmax(0, 1fr);
        gap: 7px;
        align-items: center;
      }
      .ws8-shutter-left-col {
        gap: 4px;
      }
      .ws8-walnut-cabinet {
        padding: 4px;
        gap: 4px;
      }
      .ws8-shutter-bay,
      .ws8-shutter-plaque {
        min-height: 48px;
      }
      .ws8-louver-door {
        min-height: 50px;
      }
      .ws8-shutter-plaque {
        padding: 5px 6px 4px 6px;
      }
      .ws8-shutter-clue-head {
        display: none;
      }
      .ws8-shutter-clue-copy {
        font-size: 15px;
        line-height: 1.13;
      }
      .ws8-peek-shutter-btn {
        min-height: 50px;
        padding: 4px 8px;
        font-size: 13.5px;
      }
      .ws8-shutter-choices-grid {
        gap: 5px;
      }
      .ws8-choice-pad {
        min-height: 50px;
        padding: 4px 7px 4px 8px;
        gap: 4px;
      }
      .ws8-pad-medallion {
        display: none;
      }
      .ws8-pad-inline-letter {
        display: inline;
      }
      .ws8-pad-label {
        font-size: 14.5px;
        line-height: 1.15;
      }
    }
  `)}function _a(){st=Math.max(0,st-1),st===0&&typeof document<"u"&&document.getElementById(mt)?.remove()}function Pt(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Oa='<span class="ws8-peek-shutter-icon" aria-hidden="true"><svg width="19" height="19" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="2.5" width="11" height="17" rx="2.2" fill="#FFF6E3" stroke="#6E3B23" stroke-width="1.5"/><line x1="3.5" y1="6.5" x2="10.5" y2="6.5" stroke="#B87400" stroke-width="1.6" stroke-linecap="round"/><line x1="3.5" y1="10.5" x2="10.5" y2="10.5" stroke="#008B94" stroke-width="1.6" stroke-linecap="round"/><line x1="3.5" y1="14.5" x2="10.5" y2="14.5" stroke="#E6397A" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.5" cy="7.5" r="3.4" fill="#FFE694" stroke="#6E3B23" stroke-width="1.5"/><circle cx="16.5" cy="7.5" r="1.15" fill="#6E3B23"/><path d="M16.5 10.9V18.5M16.5 15.2H19.4M16.5 17.8H18.8" stroke="#FFE694" stroke-width="2" stroke-linecap="round"/><path d="M16.5 10.9V18.5M16.5 15.2H19.4M16.5 17.8H18.8" stroke="#6E3B23" stroke-width="1.1" stroke-linecap="round"/></svg></span>';function Ha(a){if(!Array.isArray(a))return null;const e=a.filter(n=>typeof n=="string").map(n=>n.trim()).filter(n=>n.length>0);return e.length>0?e:null}function je(a){return typeof a=="object"&&a!==null&&!Array.isArray(a)}function za(a,e){const n=a,t=je(n.shutters)?n.shutters:null,h=je(n.shutterReel)?n.shutterReel:null,p=Array.isArray(e),b=je(e)?e:null,x=je(b?.shutters)?b.shutters:null,o=je(b?.shutterReel)?b.shutterReel:null,c=[a.shutters?.shutters,t?.shutters,n.shutters,h?.clues,h?.shutters,n.shutterReel,n.shutterClues,n.progressiveClues,n.clues,p?e:void 0,x?.shutters,b?.shutters,o?.clues,o?.shutters,b?.clues,b?.shutterClues];for(const O of c){const H=Ha(O);if(H){if(H.length>=4)return{shutters:[H[0],H[1],H[2],H[3]]};const U=[...H];for(;U.length<3;)U.push(a.ahaFactoid?.trim()||a.stem);return U.push(a.stem),{shutters:[U[0],U[1],U[2],U[3]]}}}const l=a.category.replace(/_/g," ");return{shutters:[`Opening Lead (${l}): ${a.stem}`,`Second Look: Narrow the four ${l.toLowerCase()} contenders on the studio desk.`,a.ahaFactoid?.trim()||`Third Lead: Spot the clincher hidden in "${a.stem}"`,a.stem]}}function $e(a){const e=Math.max(0,Math.min(We.length-1,a));return We[e]}function Ya(a){const e=`${a.activeMult.toFixed(1)}×`;return a.isCorrect?a.openCount===1?`${e} SHUTTER-1 GENIUS SOLVE!`:a.openCount===2&&a.hasWriterPerk&&a.activeMult>=1.95?`${e} WRITER-PERK SHUTTER-2 GENIUS SOLVE!`:a.openCount===2?`${e} SHUTTER-2 SHARP SOLVE!`:a.openCount===3?`${e} SHUTTER-3 CLUTCH SOLVE!`:`${e} ALL-4 SHUTTER SOLVE!`:`0.0× SHUTTER-${a.openCount} MISS`}function Ga(a,e,n){const t=[],h=[e.waiverPruneIdx,e.anchorIdx,(a+1)%4,(a+2)%4,(a+3)%4,e.poisonedFixIdx];for(const p of h)if(p>=0&&p<4&&p!==a&&!n.has(p)&&!t.includes(p)&&(t.push(p),t.length===2))break;return t}function Ua(a,e){const n=new Map;if(e.length===0)return n;const t=e.map((o,c)=>{const l=a.length===e.length&&e.length<4?a[c]:a[o];return typeof l=="number"&&Number.isFinite(l)?Math.max(0,l):0}),h=t.reduce((o,c)=>o+c,0);if(h<=0){const o=Math.floor(100/e.length);let c=100-o*e.length;return e.forEach(l=>{n.set(l,o+(c>0?1:0)),c>0&&(c-=1)}),n}let p=0,b=0;const x=t.map((o,c)=>{const l=Math.round(o/h*100);return p+=l,o>t[b]&&(b=c),l});return p!==100&&(x[b]=Math.max(0,x[b]+(100-p))),e.forEach((o,c)=>{n.set(o,x[c])}),n}function Ka(a,e,n){const t=[];if(n.pruneActive&&e===a.waiverPruneIdx){const h=!!a.isKlaxonMyth||n.cardStyle==="SPOT_THE_MYTH"||a.cardStyle==="SPOT_THE_MYTH";t.push(`<span class="ws8-stamp-void">${h?"ELIMINATED":"VOID"}</span>`)}return typeof n.canaryTickIdx=="number"&&e===n.canaryTickIdx&&t.push('<span class="ws8-canary-tick"><svg width="12" height="11" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.5 6.5L5.2 10L12.5 1.8" stroke="#005A9C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>CANARY TIP</span>'),n.uvLoupeActive&&e===a.poisonedFixIdx&&t.push('<span class="ws8-uv-poison">RIGGED TRAP</span>'),`<div class="ws8-meta-row">${t.join("")}</div>`}function Za(a,e,n,t){const h=t&&!Array.isArray(t)?t:{};Na(),a.innerHTML="";const p=h.cardStyle??e.cardStyle??"CLASSIC_CUE",b=!!h.isClutchMoment,x=!!h.reducedMotion,o=h.dayJob==="MONOLOGUE_WRITER",c=za(e,t);let l=o?2:1,O=0,H=!1,U=!1,q=!1,B=null,j=null;const Y=[],de=[],ne=typeof performance<"u"?performance.now():0;let we=!1;const ee=document.createElement("div");ee.className="ws8-shutter-deluxe-root",ee.dataset.toyId="TOY_14_FOUR_SHUTTER_REEL",ee.dataset.cardStyle=p,ee.dataset.reducedMotion=x?"true":"false",ee.dataset.highContrast=h.highContrastBadges?"true":"false",a.appendChild(ee);const Se=i=>{if((typeof performance<"u"?performance.now()-ne:999)<180){i.preventDefault(),i.stopPropagation(),i.stopImmediatePropagation();return}we=!0},pe=i=>{const E=typeof performance<"u"?performance.now()-ne:999;i.detail>0&&(E<180||!we)&&(i.preventDefault(),i.stopPropagation(),i.stopImmediatePropagation())};ee.addEventListener("pointerdown",Se,!0),ee.addEventListener("click",pe,!0),de.push(()=>{ee.removeEventListener("pointerdown",Se,!0),ee.removeEventListener("click",pe,!0)});const he=(i,E,g=120)=>{const f=x?Math.min(E,g):E,D=window.setTimeout(()=>{q||i()},f);Y.push(D)},ie=document.createElement("div");ie.className="ws8-shutter-marquee",ie.setAttribute("role","status"),ie.setAttribute("aria-live","polite");const s=document.createElement("div");s.className="ws8-shutter-ladder-row";const y=["CLUE 1","CLUE 2","CLUE 3","ALL 4"],F=[];We.forEach((i,E)=>{if(E>0){const f=document.createElement("span");f.className="ws8-ladder-arrow",f.setAttribute("aria-hidden","true"),f.textContent="→",s.appendChild(f)}const g=document.createElement("div");g.className="ws8-ladder-tube",g.dataset.stepIdx=String(E),g.innerHTML=`
      <span class="ws8-ladder-tube-mult">${i.toFixed(1)}×</span>
      <span class="ws8-ladder-tube-sub">${y[E]}</span>
    `,F.push(g),s.appendChild(g)}),ie.appendChild(s);let d=null;o&&(d=document.createElement("div"),d.className="ws8-writer-perk-banner",d.textContent="★ WRITER PERK: 2 CLUES OPEN AT 2.0×!",ie.appendChild(d)),ee.appendChild(ie);const C=document.createElement("div");C.className="ws8-shutter-deluxe-body",ee.appendChild(C);const R=document.createElement("div");R.className="ws8-shutter-left-col",C.appendChild(R);const P=document.createElement("div");P.className="ws8-walnut-cabinet",R.appendChild(P);const N=document.createElement("button");N.type="button",N.className="ws8-peek-shutter-btn",R.appendChild(N);const _=[],$=()=>{const i=Math.min(We.length-1,O),E=$e(O);if(F.forEach((g,f)=>{const D=We[f],z=g.querySelector(".ws8-ladder-tube-mult");f===i?(g.dataset.state="active",z.textContent=`★ ${D.toFixed(1)}×`):f<i?(g.dataset.state="spent",z.textContent=`${D.toFixed(1)}×`):(g.dataset.state="upcoming",z.textContent=`${D.toFixed(1)}×`)}),d&&(d.textContent=O===0?"★ WRITER PERK: 2 CLUES OPEN AT 2.0×!":`★ WRITER PERK ACTIVE · ${l} CLUES OPEN AT ${E.toFixed(1)}×!`),l>=4)N.disabled=!0,N.dataset.allOpen="true",N.setAttribute("aria-hidden","true"),N.textContent=`ALL 4 SHUTTERS OPEN (${E.toFixed(1)}×)`;else{const g=$e(O+1);N.disabled=!1,N.dataset.allOpen="false",N.removeAttribute("aria-hidden"),N.innerHTML=`${Oa}<span>PEEK NEXT SHUTTER (DROPS TO ${g.toFixed(1)}×)</span>`,N.setAttribute("aria-label",`Peek Shutter ${l+1}. Multiplier drops from ${E.toFixed(1)}x to ${g.toFixed(1)}x`)}},m=(i,E)=>{const g=_[i];if(!g)return;const f=et[i]??et[1];if(g.querySelector(".ws8-shutter-plaque"))return;const z=document.createElement("div");z.className=`ws8-shutter-plaque${E&&!x?" is-fresh-bloom":""}`,z.style.setProperty("--shutter-lip-hex",f.lipHex),z.innerHTML=`
      <span class="ws8-retracted-lip" aria-hidden="true"></span>
      <div class="ws8-shutter-clue-head">
        <span class="ws8-shutter-clue-tag">CLUE ${i+1}</span>
      </div>
      <div class="ws8-shutter-clue-copy"><span class="ws8-shutter-inline-idx">#${i+1}</span>${Pt(c.shutters[i]??"")}</div>
    `,g.prepend(z)},A=()=>{_.forEach((i,E)=>{const g=i.querySelector(".ws8-louver-door:not(.is-retracting)");if(!g)return;const f=E===l;g.dataset.next=f?"true":"false";const D=g.querySelector(".ws8-louver-sub");if(D)if(f){const L=$e(O+1);D.textContent=`PEEK · ${L.toFixed(1)}×`}else{const L=E-l+1,G=$e(O+L);D.textContent=`${G.toFixed(1)}×`}const z=$e(O+1);g.setAttribute("aria-label",`Peek next shutter (Shutter ${l+1}, drops to ${z.toFixed(1)}x)`)})},S=()=>{if(H||U||q||l>=4)return;const i=l;l=Math.min(4,l+1),O+=1,h.onTactileSfx?.("SHUTTER_CLACK"),m(i,!0);const g=_[i]?.querySelector(".ws8-louver-door");if(g)if(g.disabled=!0,x)g.remove();else{g.classList.add("is-retracting");const f=window.setTimeout(()=>{q||g.remove()},280);Y.push(f)}A(),$()};for(let i=0;i<4;i++){const E=document.createElement("div");if(E.className="ws8-shutter-bay",E.dataset.shutterIdx=String(i),_.push(E),P.appendChild(E),i<l)m(i,!1);else{const g=et[i]??et[1],f=document.createElement("button");f.type="button",f.className="ws8-louver-door",f.dataset.tone=g.tone,f.dataset.shutterDoorIdx=String(i),f.innerHTML=`
        <span class="ws8-louver-hinges" aria-hidden="true"></span>
        <span class="ws8-louver-title">${g.doorName}</span>
        <span class="ws8-louver-sub">PEEK</span>
      `,f.addEventListener("click",()=>{S()}),E.appendChild(f)}}N.addEventListener("click",()=>{S()}),A(),$();const k=document.createElement("div");k.className="ws8-shutter-choices-grid",C.appendChild(k);const T=new Set,M=[],r=[],v=[],I=i=>{H||q||(H=!0,n(i))},w=i=>{if(H||U||q||T.has(i))return;U=!0,ee.classList.add("is-console-locked");const E=$e(O),g=i===e.answerIdx,f=Ya({isCorrect:g,activeMult:E,openCount:l,hasWriterPerk:o}),D=e.choices[i]??"",z={isCorrect:g,accuracyRatio:g?1:0,chipMultiplier:g?E:0,chosenSummary:g?`${D} · ${f}`:D,trueAnswerDisplay:e.choices[e.answerIdx],triggeredKlaxon:!g&&!!e.isKlaxonMyth,fellForPoisonedFix:!g&&i===e.poisonedFixIdx,summaryText:f,shutterSolvedAtCount:l,chosenChoiceIdx:i},L=M[i],G=M[e.answerIdx]??null,V=r[i]??null,Z=r[e.answerIdx]??null;L.classList.add("is-amber-lock"),b&&!x&&L.classList.add("is-clutch-lock");const te=document.createElement("span");te.className="ws8-lock-badge",te.textContent="LOCKED IN...",L.appendChild(te),h.onLockInStart?.(b),h.onTactileSfx?.("THROW_SNAP");const oe=b&&!h.turboMode&&!x,ue=oe?950:b?160:170,xe=oe?280:b?240:290;he(()=>{if(q||H)return;L.classList.remove("is-amber-lock","is-clutch-lock"),te.remove();const be=(ye,Ce,Me)=>{if(!ye)return;ye.innerHTML="";const De=document.createElement("span");De.className=`ws8-tally-badge ${Ce==="correct"?"is-correct":"is-wrong"}`,De.textContent=Me,ye.appendChild(De)};g?(L.classList.add("is-reveal-correct"),be(V,"correct","✓")):(L.classList.add("is-reveal-wrong"),be(V,"wrong","✗"),G&&G!==L&&(G.classList.add("is-reveal-correct"),be(Z,"correct","✓"))),h.onRevealFlash?.(g),he(()=>{I(z)},xe,150)},ue,b?220:100)};e.choices.forEach((i,E)=>{const g=E,f=$a[g],D=document.createElement("button");D.type="button",D.className="ws8-choice-pad",D.dataset.choiceIdx=String(g),D.dataset.padTone=String(g%4),/\S{15,}/.test(i)&&(D.dataset.longToken="true"),D.setAttribute("aria-label",`Option ${f}: ${i}`),D.innerHTML=`
      <span class="ws8-pad-medallion" aria-hidden="true">${f}</span>
      <span class="ws8-pad-body">
        <span class="ws8-pad-label"><span class="ws8-pad-inline-letter" aria-hidden="true">${f}.</span>${Pt(i)}</span>
        ${Ka(e,g,h)}
        <div class="ws8-poll-slot"></div>
      </span>
      <span class="ws8-pad-tail"></span>
    `;const z=D.querySelector(".ws8-pad-tail"),L=D.querySelector(".ws8-poll-slot");M.push(D),r.push(z),v.push(L),D.addEventListener("pointerenter",G=>{G.pointerType==="mouse"&&!H&&!U&&!q&&h.onTactileSfx?.("TICK")}),D.addEventListener("click",()=>{w(g)}),k.appendChild(D)});const u=i=>{const E=[0,1,2,3].filter(D=>!T.has(D)),g=Ua(i,E);let f=-1;g.forEach(D=>{D>f&&(f=D)}),[0,1,2,3].forEach(D=>{const z=v[D];if(!z)return;if(T.has(D)){z.classList.remove("is-visible"),z.innerHTML="";return}const L=g.get(D)??0,G=L===f&&f>0;z.innerHTML=`
        <div class="ws8-poll-badge" data-leader="${G?"true":"false"}">
          <span class="ws8-poll-track"><span class="ws8-poll-fill" style="width:${L}%"></span></span>
          <span class="ws8-poll-pct">${G?"★ ":""}${L}%</span>
        </div>
      `,z.classList.add("is-visible")})};return{toyId:"TOY_14_FOUR_SHUTTER_REEL",cardStyle:p,applyFiftyFiftyPrune(){if(B!==null)return B;if(H||U||q)return[];const i=Ga(e.answerIdx,e,T);for(const E of i){T.add(E);const g=M[E];if(g){g.classList.add("is-fifty-cut"),g.disabled=!0,g.setAttribute("aria-disabled","true");let D=g.querySelector(".ws8-meta-row");if(D||(D=document.createElement("div"),D.className="ws8-meta-row",(g.querySelector(".ws8-pad-body")??g).appendChild(D)),D.querySelector(".ws8-stamp-void")?.remove(),!D.querySelector(".ws8-stamp-fifty")){const z=document.createElement("span");z.className="ws8-stamp-fifty",z.textContent="50/50 CUT",D.appendChild(z)}}const f=v[E];f&&(f.classList.remove("is-visible"),f.innerHTML="")}return j!==null&&u(j),B=i,h.onTactileSfx?.("SHUTTER_CLACK"),B},showAudiencePollOverlay(i){H||U||q||(j=i,u(i),h.onTactileSfx?.("DETENT"))},dispose(){if(!q){q=!0;for(const i of Y)window.clearTimeout(i);Y.length=0;for(const i of de)i();de.length=0,ee.parentElement===a&&a.removeChild(ee),_a()}}}}export{Wa as A,Va as T,Za as a,Xa as m};

import {createCityRide} from './city-ride.js';
import {motionAt,powerRoutes} from './energy-model.mjs';
import * as THREE from 'three';
import {OrbitControls} from './OrbitControls.js';
import {GLTFLoader} from './GLTFLoader.js';
import {RoomEnvironment} from './RoomEnvironment.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const filmRender=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const state={mode:'anatomy',part:'body',explode:0,xray:false,rotate:false,play:true,tour:false,tourT:0,ready:false,elapsed:0,frictionOnly:false,focus:null,brakeDetail:true,rideDistance:0,rideSpeed:24,rideCamera:'follow'};
const parts={
 body:{n:'01',title:'Exterior shell',kicker:'FORM & PROTECTION',summary:'The familiar shape around the electric architecture. Lift it away to see the systems underneath.',detail:'The glass roof, body panels, and wheel arches come from the credited 2024 Model 3 exterior. Their separation here is a presentation effect, not a factory disassembly.',try:'Move the separation slider, then drag the scene to look between the layers.',source:'components',point:[-.35,1.05,.5]},
 cabin:{n:'02',title:'Cabin & interior',kicker:'THE HUMAN LAYER',summary:'Seats, controls, and the passenger space sit above the vehicle’s supporting structure.',detail:'This cabin uses the same seats, steering wheel, dashboard, and trim as the credited vehicle model. A roof cutaway reveals the original interior in this close-up.',try:'Open the exploded view and compare the cabin with the low, flat battery layer.',source:'components',point:[0,.95,0]},
 structure:{n:'03',title:'Supporting structure',kicker:'THE PLATFORM',summary:'An illustrative frame connects the vehicle’s main systems and supports the passenger space.',detail:'These rails and crossmembers are schematic. They show spatial relationships, not the exact material, casting, joining, or crash structure of a Tesla.',try:'Choose Side view to see how the flat battery fits between the axles.',source:'components',point:[0,.61,.52]},
 battery:{n:'04',title:'Battery pack',kicker:'STORED ELECTRICAL ENERGY',summary:'A high-voltage battery stores energy that can be sent to the drive system or replenished during charging.',detail:'Tesla identifies the high-voltage battery as one of the car’s main EV components. The grid inside our pack is illustrative: it is not a real Tesla cell or module layout.',try:'Switch to Power & motion to follow energy leaving the pack. Then try regenerative braking.',source:'components',point:[0,.41,.4]},
 motor:{n:'05',title:'Rear drive unit',kicker:'ELECTRICITY INTO MOTION',summary:'The drive system turns electrical energy into wheel rotation. During regeneration, energy can flow back toward the battery.',detail:'This rear-wheel-drive illustration sends torque through a reduction gear and differential to both rear wheels. Dual Motor AWD uses a separate front drive unit; it is not shown here.',try:'Compare the direction of the moving particles in the power and regeneration chapters.',source:'regen',point:[-1.38,.4,.12]},
 wheels:{n:'06',title:'Wheels & brakes',kicker:'WHERE MOTION MEETS THE ROAD',summary:'Tyres transfer force to the road. Regenerative braking and friction brakes both contribute to slowing the vehicle.',detail:'Regeneration recovers some energy during slowing. It does not remove the need for friction brakes, and available regeneration can vary with battery state and temperature.',try:'All four wheels are shown with their brake discs and fixed calipers. The tyres and rims sit slightly outward to reveal the brakes. Use Assemble wheel to close the gaps.',source:'regen',point:[1.43,.35,.89]}
};
const chapters={
 anatomy:{eyebrow:'01 / ANATOMY',title:'Every layer,<br><em>a purpose.</em>',sub:'Pull the car apart. Discover what makes it move.',note:'Separate the layers to explore their relationships.',chain:['Battery','Drive unit','Wheels'],part:'body'},
 drive:{eyebrow:'02 / POWER & MOTION',title:'Stored energy.<br><em>Moving wheels.</em>',sub:'Rear-wheel drive: both rear wheels receive torque. Front wheels roll freely.',note:'Orange: electrical power · blue: mechanical power · schematic RWD layout.',chain:['Battery DC','Inverter + motor','Gear / differential → rear wheels'],part:'motor'},
 regen:{eyebrow:'03 / REGENERATIVE BRAKING',title:'Slow down.<br><em>Send some back.</em>',sub:'The wheels keep turning forward while the motor acts as a generator.',note:'Green: recovered energy · warm calipers: friction heat. Timing is illustrative; cold or full batteries can limit regeneration.',chain:['Rear wheels','Motor / inverter','Battery DC'],part:'wheels'},
 ride:{eyebrow:'05 / TAKE A RIDE',title:'The city.<br><em>In motion.</em>',sub:'Take the Model 3 through a sunlit 3D boulevard.',note:'Cruise through an original 3D city. Pause, change speed, or choose another camera.',chain:['City cruise','24 km/h','Follow camera'],part:'body'},
 charge:{eyebrow:'04 / CHARGING',title:'Plug in.<br><em>Replenish.</em>',sub:'AC charging: the onboard charger converts incoming AC to battery DC.',note:'AC charging shown. DC fast charging uses an external converter and bypasses onboard AC conversion.',chain:['AC supply','Port → onboard AC/DC','Battery DC'],part:'battery'}
};
const urls={components:'https://www.tesla.com/ownersmanual/model3/en_us/GUID-8FA15856-1720-440F-838B-ACFBA8D7D608.html',regen:'https://www.tesla.com/ownersmanual/model3/en_us/GUID-3DFFB071-C0F6-474D-8A45-17BE1A006365.html',battery:'https://www.tesla.com/ownersmanual/model3/en_us/GUID-7FE78D73-0A17-47C4-B21B-54F641FFAEF4.html'};
const icons={
 body:'<path d="m12 70 13-23 32-9 23-21h39l32 23 25 9v32H12Z"/><path d="m65 38 20-16h30l22 18ZM25 47l122-6M42 70h84M30 81l8-11m113 11-8-11"/><circle cx="41" cy="79" r="14"/><circle cx="145" cy="79" r="14"/>',
 cabin:'<path d="M29 83V35q0-12 12-12h17v41H40v19ZM104 83V35q0-12 12-12h17v41h-18v19ZM25 64h39v19H25Zm75 0h39v19h-39ZM41 83v14m19-14v14m55-14v14m19-14v14"/><path class="accent" d="M64 35h29v19H64Z"/>',
 structure:'<path d="m13 52 118-29 35 30-116 34ZM13 52v12l37 31 116-30V53M50 87v8M40 45l37 35m-9-42 37 35m-7-42 37 35M30 61l116-29"/>',
 battery:'<path d="m17 51 111-28 37 29-113 30ZM17 51v14l35 30 113-29V52M52 82v13"/><path class="accent" d="m32 50 18 16 20-5-17-16Zm29-8 18 16 20-5-17-16Zm29-8 18 16 20-5-17-16ZM45 64l18 15 20-5-17-16Zm29-8 18 15 20-5-17-16Zm29-8 18 15 20-5-17-16Z"/>',
 motor:'<ellipse cx="89" cy="57" rx="32" ry="27"/><path d="M89 30h31q32 0 32 27t-32 27H89M57 57H24v15h35m92-15h20v15h-22M97 30v54m12-52v50m12-48v46m12-40v34"/><path class="accent" d="m76 52 14-11-5 14h12L82 73l4-17H76Z"/>',
 wheels:'<ellipse cx="67" cy="58" rx="28" ry="36"/><ellipse cx="67" cy="58" rx="18" ry="25"/><path d="M67 22h30q29 0 29 36T97 94H67M67 33v50m-18-25h36M82 37 52 79m0-42 30 42M126 58h31"/><path class="accent" d="M88 40q9 15 0 32"/>'
};
function icon(key){return `<svg viewBox="0 0 190 115">${icons[key]}</svg>`}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
let currentExplosion=0,currentOpacity=1,clock=0,cameraTween=null;
const viewport=$('#viewport');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.localClippingEnabled=true;viewport.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D Tesla Model 3. Drag to rotate, or use the layer and camera buttons.');renderer.domElement.setAttribute('role','img');
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xf3f1ec,18,34);
const camera=new THREE.PerspectiveCamera(36,1,.05,80);camera.position.set(6.6,3.7,6.3);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.target.set(0,.7,0);controls.minDistance=1.2;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=false;controls.autoRotateSpeed=.65;
controls.addEventListener('start',()=>{cameraTween=null;if(state.tour)stopTour();});
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xffffff,0xa4afa0,2.0));const key=new THREE.DirectionalLight(0xfff5de,3.8);key.position.set(3,9,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.1,far:30});key.shadow.bias=-.0005;key.shadow.normalBias=.025;scene.add(key);const rim=new THREE.DirectionalLight(0xd5e7ef,1.5);rim.position.set(-4,4,-5);scene.add(rim);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0xf1f0e9,roughness:1,metalness:0}));floor.rotation.x=-Math.PI/2;floor.position.y=-.13;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(25,50,0xd3d8ce,0xe4e6dc);grid.position.y=-.126;grid.material.transparent=true;grid.material.opacity=.42;scene.add(grid);
const layers={};for(const k of Object.keys(parts)){layers[k]=new THREE.Group();layers[k].name=k;scene.add(layers[k]);}
const lift={body:3.15,cabin:1.25,structure:.55,battery:-.13,motor:-.55,wheels:-.1};
const carRig=new THREE.Group();scene.add(carRig);for(const layer of Object.values(layers))carRig.add(layer);const cityRide=createCityRide();scene.add(cityRide.group);let rideWasActive=false;
const mat=(c,metal=.2,rough=.45)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
const graphite=mat('#566367',.65,.32),aluminum=mat('#a3b0b2',.7,.32),dark=mat('#29343a',.5,.34),copper=mat('#d6893d',.65,.32),red=mat('#ad4933',.4,.35),orange=mat('#e08f37',.2,.4);
const originalMaterials=new Map(),schematicMaterials=[];
function cube(g,sz,pos,material,r=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...sz),material.clone());mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);if(!schematicMaterials.includes(material))schematicMaterials.push(material);return mesh}
function cyl(g,r,l,pos,material,axis='z'){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,40),material.clone());if(axis==='z')mesh.rotation.x=Math.PI/2;else if(axis==='x')mesh.rotation.z=Math.PI/2;mesh.position.set(...pos);mesh.castShadow=true;g.add(mesh);return mesh}
function tube(g,pts,color,r=.018){const path=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,40,r,8,false),mat(color,.2,.4));g.add(mesh);return path}
// These teaching layers are purpose-built illustrations; no OEM CAD is implied.
cube(layers.structure,[3.45,.105,.09],[0,.56,.71],aluminum);cube(layers.structure,[3.45,.105,.09],[0,.56,-.71],aluminum);
for(let i=0;i<5;i++)cube(layers.structure,[.08,.1,1.5],[-1.3+i*.65,.56,0],graphite);
for(const a of [-1.43,1.43]){cube(layers.structure,[.22,.12,1.63],[a,.54,0],graphite);for(const z of [-.7,.7]){const s=cyl(layers.structure,.045,.35,[a,.62,z],aluminum,'y');s.rotation.z=.2*(a>0?1:-1);}}
const pack=cube(layers.battery,[2.5,.17,1.38],[0,.365,0],graphite);cube(layers.battery,[2.43,.025,1.3],[0,.465,0],copper);
for(let i=0;i<4;i++)for(let j=0;j<3;j++){const cell=cube(layers.battery,[.54,.065,.36],[-.9+i*.6,.51,-.4+j*.4],mat('#9ba5a0',.45,.4));cube(layers.battery,[.39,.01,.035],[-.9+i*.6,.55,-.4+j*.4],copper);}
for(const a of [-1.17,1.17])for(const b of [-.61,.61])cyl(layers.battery,.028,.035,[a,.475,b],aluminum,'y');
cyl(layers.motor,.19,.53,[-1.43,.39,0],aluminum);cyl(layers.motor,.14,.61,[-1.43,.39,0],graphite);cube(layers.motor,[.41,.14,.43],[-1.15,.55,0],red);cyl(layers.motor,.035,1.61,[-1.43,.34,0],aluminum);
for(let i=0;i<11;i++)cube(layers.motor,[.012,.19,.4],[-1.33+i*.033,.56,0],aluminum);
const paths={drive:tube(layers.motor,[[0,.48,.22],[-.45,.55,.27],[-.9,.6,.26],[-1.2,.58,.1]],'#d2822f',.018)};
const brakeCalipers=[];const wheelGroups=[];const wheelsCenters=[];for(const a of [-1.435,1.435])for(const b of [-.86,.86]){wheelsCenters.push(new THREE.Vector3(a,.345,b));const wg=new THREE.Group();wg.position.set(a,.345,b);wg.userData.base=wg.position.clone();wg.userData.spin=0;layers.wheels.add(wg);wheelGroups.push(wg);const tire=new THREE.Mesh(new THREE.TorusGeometry(.267,.077,16,48),mat('#252b2d',.05,.9));wg.add(tire);cyl(wg,.218,.12,[0,0,0],mat('#343b40',.8,.26));cyl(wg,.181,.135,[0,0,0],dark);
// Five swept twin spokes: an illustrative modern aero wheel, not an OEM replica.
const face=b>0?1:-1;for(let i=0;i<5;i++){
 const spokeGroup=new THREE.Group();spokeGroup.rotation.z=i*Math.PI*2/5;wg.add(spokeGroup);
 for(const side of[-1,1]){const sh=new THREE.Shape();sh.moveTo(side*.018,.052);sh.lineTo(side*.035+.015,.196);sh.lineTo(side*.035+.045,.196);sh.lineTo(side*.018+.024,.058);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:.018,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.003,steps:1});const spoke=new THREE.Mesh(geo,mat('#8c969e',.88,.22));spoke.position.z=face*.079;if(face<0)spoke.scale.z=-1;spokeGroup.add(spoke);}
}const rimLip=new THREE.Mesh(new THREE.TorusGeometry(.211,.008,8,64),mat('#949da3',.9,.2));rimLip.position.z=face*.088;wg.add(rimLip);cyl(wg,.052,.19,[0,0,0],mat('#242b30',.7,.25));for(let i=0;i<5;i++){const t=i*Math.PI*2/5;cyl(wg,.007,.014,[Math.cos(t)*.036,Math.sin(t)*.036,face*.103],aluminum);}
const caliper=softBox(layers.wheels,[.08,.18,.08],[a+.15,.355,b],red,.025);brakeCalipers.push(caliper);const rotor=cyl(wg,.185,.025,[0,0,b>0?.075:-.075],aluminum);rotor.userData.brake=true;for(let h=0;h<18;h++){const t=h*Math.PI*2/18;const hole=cyl(wg,.006,.001,[Math.cos(t)*.15,Math.sin(t)*.15,b>0?.088:-.088],dark);hole.userData.brake=true;}const hub=cyl(wg,.055,.04,[0,0,b>0?.09:-.09],graphite);hub.userData.brake=true;}
// Sculpted teaching interior: rounded upholstery, trim, and a readable center display.
const upholstery=mat('#d9d4c9',.02,.88),seatEdge=mat('#b8b2a8',.02,.9),cabinTrim=mat('#252c30',.12,.65),woodTrim=mat('#997452',.05,.7);
function softBox(g,size,pos,material,r=.04){
 const [w,h,d]=size; r=Math.min(r,w*.45,h*.45,d*.45);const x=-w/2,y=-h/2,sh=new THREE.Shape();
 sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);
 const geo=new THREE.ExtrudeGeometry(sh,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.45,bevelThickness:r,curveSegments:6});geo.translate(0,0,-(d-2*r)/2);geo.computeVertexNormals();const m=new THREE.Mesh(geo,material.clone());m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
}
softBox(layers.cabin,[2.0,.065,1.30],[-.22,.65,0],cabinTrim);
for(const z of[-.36,.36]){
 const seat=new THREE.Group();layers.cabin.add(seat);seat.position.z=z;
 softBox(seat,[.48,.12,.43],[.23,.76,0],seatEdge,.055);
 softBox(seat,[.40,.07,.30],[.25,.825,0],upholstery,.03);
 for(const side of[-1,1]){softBox(seat,[.43,.11,.065],[.23,.83,side*.19],upholstery,.03);const bolster=softBox(seat,[.14,.41,.07],[-.025,1.04,side*.19],upholstery,.03);bolster.rotation.z=-.14;}
 const back=softBox(seat,[.105,.43,.32],[-.04,1.045,0],upholstery,.04);back.rotation.z=-.14;
 for(const side of[-1,1])cyl(seat,.009,.07,[-.08,1.285,side*.085],aluminum,'y');
 softBox(seat,[.12,.155,.265],[-.085,1.37,0],upholstery,.045);
 for(const side of[-1,1])tube(seat,[[.41,.862,side*.135],[.25,.866,side*.135],[.07,.858,side*.135]],'#aaa59b',.0025);
 softBox(seat,[.33,.055,.035],[.22,.69,-.12],dark,.01);softBox(seat,[.33,.055,.035],[.22,.69,.12],dark,.01);
}
softBox(layers.cabin,[.46,.12,1.17],[-.73,.77,0],seatEdge,.05);
for(const z of[-.39,0,.39]){softBox(layers.cabin,[.41,.055,.35],[-.72,.835,z],upholstery,.025);const b=softBox(layers.cabin,[.11,.35,.36],[-.98,1.01,z],upholstery,.035);b.rotation.z=-.10;softBox(layers.cabin,[.11,.13,.235],[-1.01,1.26,z],upholstery,.035);}
softBox(layers.cabin,[.28,.17,1.28],[.74,1.00,0],cabinTrim,.045);
softBox(layers.cabin,[.08,.045,1.23],[.585,1.015,0],woodTrim,.015);
for(const z of[-.59,.59]){softBox(layers.cabin,[1.57,.19,.055],[-.12,.92,z],cabinTrim,.02);softBox(layers.cabin,[.48,.06,.07],[.08,.90,z],woodTrim,.02);}
softBox(layers.cabin,[.70,.19,.23],[.12,.81,0],cabinTrim,.035);
softBox(layers.cabin,[.29,.025,.21],[-.11,.92,0],seatEdge,.012);
for(const x of[.12,.28]){const cup=new THREE.Mesh(new THREE.TorusGeometry(.047,.008,8,24),dark);cup.rotation.x=Math.PI/2;cup.position.set(x,.915,0);layers.cabin.add(cup);}
// Screen faces the occupants (negative X), with an original illustrative UI.
const display=document.createElement('canvas');display.width=960;display.height=600;const dc=display.getContext('2d');dc.fillStyle='#edf0f1';dc.fillRect(0,0,960,600);dc.fillStyle='#f9fafb';dc.fillRect(0,0,355,550);dc.fillStyle='#29343a';dc.font='bold 92px sans-serif';dc.fillText('0',130,140);dc.font='22px sans-serif';dc.fillText('km/h',132,178);dc.font='18px sans-serif';dc.fillText('P   R   N   D',96,225);dc.fillStyle='#526b76';dc.fillRect(136,290,85,150);dc.fillStyle='#b7c9cd';dc.fillRect(146,315,65,70);dc.strokeStyle='#c7d5ca';dc.lineWidth=22;dc.beginPath();dc.moveTo(380,420);dc.bezierCurveTo(700,470,570,100,950,170);dc.stroke();dc.strokeStyle='#8faebe';dc.lineWidth=9;dc.stroke();dc.fillStyle='#273b43';dc.font='bold 25px sans-serif';dc.fillText('Explore your route',400,70);dc.fillStyle='#273038';dc.fillRect(0,550,960,50);dc.fillStyle='#ffffff';dc.font='21px sans-serif';dc.fillText('21°       Climate          Music          Navigation          21°',55,583);
const screenTex=new THREE.CanvasTexture(display);screenTex.colorSpace=THREE.SRGBColorSpace;
softBox(layers.cabin,[.035,.255,.405],[.545,1.14,0],dark,.012);
const screen=new THREE.Mesh(new THREE.PlaneGeometry(.375,.225),new THREE.MeshBasicMaterial({map:screenTex}));screen.rotation.y=-Math.PI/2;screen.position.set(.521,1.14,0);layers.cabin.add(screen);
const steeringGroup=new THREE.Group();steeringGroup.position.set(.40,1.105,.36);steeringGroup.rotation.z=-.15;layers.cabin.add(steeringGroup);
const steering=new THREE.Mesh(new THREE.TorusGeometry(.13,.018,12,48),cabinTrim);steering.rotation.y=Math.PI/2;steeringGroup.add(steering);
softBox(steeringGroup,[.045,.075,.12],[0,-.01,0],cabinTrim,.02);
for(const side of[-1,1]){const spoke=softBox(steeringGroup,[.025,.025,.09],[0,-.015,side*.085],dark,.009);cyl(steeringGroup,.012,.012,[-.026,.006,side*.065],aluminum,'x');}
const lowerSpoke=softBox(steeringGroup,[.025,.09,.027],[0,-.075,0],dark,.01);cyl(layers.cabin,.026,.22,[.52,1.08,.36],cabinTrim,'x');
// A charging post and cable appear only in the charging lesson.
const charger=new THREE.Group();charger.position.set(-2.2,0,-1.9);scene.add(charger);cube(charger,[.55,1.17,.24],[0,.49,0],mat('#d8dcd4',.3,.3));cube(charger,[.37,.52,.015],[0,.7,.13],mat('#293c3d'));cube(charger,[.25,.025,.02],[0,.78,.145],mat('#98c6b3'));const cable=tube(charger,powerRoutes.charge.slice(0,3).map(([x,y,z])=>[x+2.2,y,z+1.9]),'#465150',.025);cube(charger,[.37,.52,.015],[0,.7,-.13],mat('#293c3d'));cube(charger,[.25,.025,.02],[0,.78,-.145],mat('#98c6b3'));charger.visible=false;
// AC charging uses an onboard AC/DC charger. Route is schematic, not HV cable routing.
const onboardCharger=cube(layers.battery,[.32,.10,.28],[-.82,.56,-.45],mat('#527a92',.5,.3));
const flowGroup=new THREE.Group();scene.add(flowGroup);let flowSegments=[];
function rebuildFlow(){
 for(const seg of flowSegments){seg.line.geometry.dispose();seg.line.material.dispose();for(const m of seg.motes){m.geometry.dispose();m.material.dispose();}}flowGroup.clear();flowSegments=[];
 if(state.mode==='anatomy'||state.mode==='ride'||(state.mode==='regen'&&state.frictionOnly))return;
 for(const [name,pts]of Object.entries(powerRoutes)){
  if((state.mode==='charge')!==(name==='charge'))continue;
  const electrical=name==='electrical'||name==='motor'||name==='charge';
  const color=state.mode==='charge'?0x4089c1:state.mode==='regen'?0x2f9b69:electrical?0xdc8b2b:0x4d7faa;
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),false,'centripetal');
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),new THREE.LineDashedMaterial({color,dashSize:.07,gapSize:.035,transparent:true,opacity:.8}));line.computeLineDistances();flowGroup.add(line);
  const motes=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),new THREE.MeshBasicMaterial({color}));flowGroup.add(m);motes.push(m);}flowSegments.push({curve,line,motes});
 }
}
flowGroup.visible=false;
const lessonControls=document.createElement('div');lessonControls.className='lesson-controls';lessonControls.hidden=true;lessonControls.innerHTML='<span>Rear-wheel drive illustration · front wheels roll freely</span><div><button id="brake-kind">Compare friction braking</button><button id="replay-stop">Replay stop</button></div><output id="energy-state" aria-live="polite"></output>';$('#energy-chain').after(lessonControls);
$('#brake-kind').onclick=()=>{state.frictionOnly=!state.frictionOnly;state.elapsed=0;state.play=true;$('#brake-kind').textContent=state.frictionOnly?'Show regenerative braking':'Compare friction braking';$('#flow-start').textContent=state.frictionOnly?'All four wheels':'Rear wheels';$('#flow-middle').textContent=state.frictionOnly?'Pads + discs':'Motor / inverter';$('#flow-end').textContent=state.frictionOnly?'Heat':'Battery DC';$('#energy-note').textContent=state.frictionOnly?'Friction comparison · motion becomes heat at the brakes; no charging path.':chapters.regen.note;$('#motion').textContent='Ⅱ Pause';$('#motion').setAttribute('aria-pressed','true');rebuildFlow();};
$('#replay-stop').onclick=()=>{state.elapsed=0;state.play=true;$('#motion').textContent='Ⅱ Pause';$('#motion').setAttribute('aria-pressed','true');};
const selectedRing=new THREE.Mesh(new THREE.TorusGeometry(.12,.009,8,40),new THREE.MeshBasicMaterial({color:0xb34d39,transparent:true,opacity:.8}));scene.add(selectedRing);
let shellMeshes=[],allPickMeshes=[],points={};const hotspots={};
for(const [k,p]of Object.entries(parts)){const button=document.createElement('button');button.className='hotspot hidden';button.setAttribute('aria-label','Inspect '+p.title);button.innerHTML=`<i></i>${p.title}`;button.addEventListener('click',()=>selectPart(k,true));$('#hotspots').append(button);hotspots[k]=button;}
function categoryFor(name,center){if(/cockpit|intsub/i.test(name))return 'cabin';return 'body'}
function trianglesToGroups(mesh){
 const geo=mesh.geometry.clone();geo.applyMatrix4(mesh.matrixWorld);const position=geo.getAttribute('position');const indices=geo.index;const base=[];const cabin=[];const wheels=[];const v=new THREE.Vector3();
 const n=indices?indices.count:position.count;
 for(let i=0;i<n;i+=3){const ia=indices?indices.getX(i):i,ib=indices?indices.getX(i+1):i+1,ic=indices?indices.getX(i+2):i+2;v.set(0,0,0);for(const q of[ia,ib,ic])v.add(new THREE.Vector3().fromBufferAttribute(position,q));v.multiplyScalar(1/3);
  let wheel=-1;for(let j=0;j<wheelsCenters.length;j++){const c=wheelsCenters[j];if(Math.abs(v.z-c.z)<.22&&((v.x-c.x)**2+(v.y-c.y)**2)<.36**2&&v.y<.72){wheel=j;break}}
  if(wheel>=0)wheels.push([wheel,ia,ib,ic]);else base.push(ia,ib,ic);
 }
 const name=mesh.material.name||'';const material=mesh.material.clone();if(material.map)material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());material.envMapIntensity=.75;if(material.roughness<.06)material.roughness=.18;originalMaterials.set(material,{opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,color:material.color.clone()});
 for(const [cat,indices]of[['body',base],['cabin',cabin]]){if(!indices.length)continue;const g=geo.clone();g.setIndex(indices);const ownMat=material.clone();originalMaterials.set(ownMat,originalMaterials.get(material));const m=new THREE.Mesh(g,ownMat);m.castShadow=true;m.receiveShadow=true;m.userData.part=cat;m.userData.glass=!!mesh.material.transparent;layers[cat].add(m);shellMeshes.push(m);allPickMeshes.push(m)}
 // Exterior wheels are not drawn twice: the schematic wheel groups carry the lower layer.
}
async function load(){try{
 const gltf=await new GLTFLoader().loadAsync('./model3.glb',e=>{if(e.total)$('#loading-detail').textContent=`Loading geometry · ${Math.round(100*e.loaded/e.total)}%`});
 const root=gltf.scene;scene.add(root);root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=4.72/size.x;
 root.scale.multiplyScalar(scale);root.position.sub(center.multiplyScalar(scale));root.position.y+=size.y*scale/2+.025;root.updateMatrixWorld(true);
 layers.cabin.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});layers.cabin.clear();
 const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});for(const m of meshes)trianglesToGroups(m);scene.remove(root);
 for(const[k,g]of Object.entries(layers))g.traverse(o=>{if(o.isMesh){o.userData.part=k;allPickMeshes.push(o)}});
 state.ready=true;$('#scene-status').textContent='3D model ready';$('#loading').style.display='none';selectPart('body');resize();if(filmRender){document.body.classList.add('film-render');renderer.setPixelRatio(1);renderer.setSize(1920,1080,false);camera.aspect=16/9;camera.updateProjectionMatrix();controls.enableDamping=false;window.__ready=true;}else animate();
}catch(e){$('#loading-detail').textContent='The 3D model could not be loaded. Reload to retry.';$('#scene-status').textContent='Model load error';console.error(e);}}
function cameraTo(pos,target,duration=.45){cameraTween={start:performance.now(),duration:duration*1000,from:camera.position.clone(),to:new THREE.Vector3(...pos),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(...target)};}
function updateViewButtons(){const ex=state.explode>5;$('#exploded').classList.toggle('selected',ex&&!state.xray);$('#assembled').classList.toggle('selected',!ex&&!state.xray);$('#xray').classList.toggle('selected',state.xray);$('#exploded').setAttribute('aria-pressed',String(ex));$('#xray').setAttribute('aria-pressed',String(state.xray));$('#explode-range').value=state.explode;$('#explode-value').textContent=Math.round(state.explode)+'%';}
function setExplosion(n,move=true){state.focus=null;state.explode=n;updateViewButtons();if(move){if(n>20)cameraTo([7.6,5.2,7.6],[0,1.8,0]);else cameraTo([6.6,3.7,6.3],[0,.7,0]);}}
function selectPart(k,reveal=false){state.part=k;const p=parts[k];$('#brake-view').hidden=k!=='wheels';$$('[data-part]').forEach(b=>b.classList.toggle('active',b.dataset.part===k));$('#part-number').textContent=p.n+' / 06';$('#part-kicker').textContent=p.kicker;$('#part-title').textContent=p.title;$('#part-summary').textContent=p.summary;$('#part-detail').textContent=p.detail;$('#try-copy').textContent=p.try;$('#part-illustration').innerHTML=icon(k);for(const[a,b]of Object.entries(hotspots))b.classList.toggle('selected',a===k);
 if(reveal){configureRide(false);stopTour();state.mode='anatomy';flowGroup.visible=false;charger.visible=false;lessonControls.hidden=true;state.xray=false;setExplosion(0,false);state.focus=k;currentExplosion=0;
 for(const layer of Object.values(layers))layer.position.y=0;
 wheelGroups.forEach(w=>{w.position.copy(w.userData.base);});
 layers[k].updateMatrixWorld(true);
 const box=k==='cabin'?new THREE.Box3(new THREE.Vector3(-1.2,.5,-.75),new THREE.Vector3(1.0,1.35,.75)):new THREE.Box3().setFromObject(['structure','battery','motor','wheels'].includes(k)?layers.body:layers[k]),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 // Fit the selected component to both viewport dimensions, including portrait layouts.
 const vertical=THREE.MathUtils.degToRad(camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect),angle=Math.min(vertical,horizontal);
 const radius=size.length()/2,dist=Math.max(1.4,radius/Math.sin(angle/2)*1.10);
 const direction=new THREE.Vector3(...(k==='cabin'?[-.6,1.8,.8]:k==='battery'?[.6,1.15,1]:k==='motor'?[-.65,.65,1]:[1,.75,1])).normalize();
 cameraTo(center.clone().addScaledVector(direction,dist).toArray(),center.toArray());
 $$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode==='anatomy'));$('#eyebrow').textContent='COMPONENT CLOSE-UP';$('#chapter-title').innerHTML=p.title;$('#chapter-sub').textContent=['structure','battery','motor','wheels'].includes(k)?'X-ray car shows the component’s position · drag to orbit · scroll to zoom.':'Drag to rotate · scroll to zoom · Reset view for the whole car.';
 }

}
function setMode(mode,fromTour=false){configureRide(mode==='ride');if(!fromTour&&state.tour)stopTour();state.mode=mode;const c=chapters[mode];$$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));$('#eyebrow').textContent=c.eyebrow;$('#chapter-title').innerHTML=c.title;$('#chapter-sub').textContent=c.sub;$('#energy-note').textContent=c.note;$('#flow-start').textContent=c.chain[0];$('#flow-middle').textContent=c.chain[1];$('#flow-end').textContent=c.chain[2];$('#energy-chain').className='energy-chain '+mode;
 if(mode==='ride'){state.xray=false;setExplosion(0,false);currentExplosion=0;cameraTween=null;}else if(mode==='anatomy'){state.xray=false;setExplosion(78);}else{state.xray=true;setExplosion(0);cameraTo(mode==='charge'?[-6.4,3.8,-6.6]:[5.4,4.4,6.4],[0,.7,0]);}
 updateViewButtons();selectPart(c.part);state.play=true;$('#motion').textContent='Ⅱ Pause';$('#motion').setAttribute('aria-pressed','true');charger.visible=mode==='charge';flowGroup.visible=mode!=='anatomy'&&mode!=='ride';$('#scene-status').textContent=mode==='ride'?'City cruise':mode==='anatomy'?'3D model ready':'Illustrative energy flow';
 state.elapsed=0;state.frictionOnly=false;lessonControls.querySelector('span').textContent=mode==='charge'?'Parked · AC charging illustration':'Rear-wheel drive illustration · front wheels roll freely';$('#brake-kind').textContent='Compare friction braking';lessonControls.hidden=mode==='anatomy'||mode==='ride';$('#brake-kind').hidden=mode!=='regen';$('#replay-stop').hidden=mode!=='regen';rebuildFlow();
}
function startTour(){lastTourChapter=-1;state.tour=true;state.tourT=0;state.rotate=true;controls.autoRotate=true;$('#rotate').setAttribute('aria-pressed','true');$('#tour').innerHTML='<span class="play-icon">Ⅱ</span><span>Pause guided tour<small>Four chapters · explore as you watch</small></span>';setMode('anatomy',true);}
function stopTour(){if(state.tour){state.rotate=false;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');}state.tour=false;$('#tour').innerHTML='<span class="play-icon">▶</span><span>Take the guided tour<small>Four chapters · 28 seconds</small></span>';}
const rideButton=document.createElement('button');rideButton.className='mode ride-entry';rideButton.dataset.mode='ride';rideButton.innerHTML='<span>05</span>Take a ride <span aria-hidden="true">↗</span>';$('.mode-nav').append(rideButton);
const rideControls=document.createElement('div');rideControls.className='ride-controls';rideControls.hidden=true;rideControls.innerHTML='<label>Cruise speed <input id="ride-speed" type="range" min="0" max="50" value="24" aria-label="Cruise speed"><output id="ride-speed-value">24 km/h</output></label><div role="group" aria-label="Ride camera"><button data-ride-camera="follow" class="selected">Follow</button><button data-ride-camera="side">Side</button><button data-ride-camera="above">Above</button></div><button id="ride-pause">Ⅱ Pause ride</button><button id="exit-ride">Back to explorer ↗</button>';$('#viewport').append(rideControls);
$('#ride-speed').oninput=e=>{state.rideSpeed=+e.target.value;$('#ride-speed-value').textContent=state.rideSpeed+' km/h';$('#flow-middle').textContent=state.rideSpeed+' km/h';};
$$('[data-ride-camera]').forEach(b=>b.onclick=()=>{state.rideCamera=b.dataset.rideCamera;$$('[data-ride-camera]').forEach(c=>c.classList.toggle('selected',c===b));$('#flow-end').textContent=b.textContent+' camera';});
$('#exit-ride').onclick=()=>setMode('anatomy');$('#ride-pause').onclick=()=>{$('#motion').click();$('#ride-pause').textContent=state.play?'Ⅱ Pause ride':'▶ Resume ride';};
function configureRide(active){
 if(active){stopTour();state.rotate=false;controls.autoRotate=false;state.focus=null;state.rideDistance=0;state.rideCamera='follow';state.rideSpeed=24;$('#ride-speed').value='24';$('#ride-speed-value').textContent='24 km/h';$$('[data-ride-camera]').forEach(b=>b.classList.toggle('selected',b.dataset.rideCamera==='follow'));$('#rotate').setAttribute('aria-pressed','false');}
 if(!active&&rideWasActive){carRig.position.set(0,0,0);key.position.set(3,9,5);key.target.position.set(0,0,0);key.target.updateMatrixWorld();cameraTo([6.6,3.7,6.3],[0,.7,0]);}
 rideWasActive=active;cityRide.group.visible=active;rideControls.hidden=!active;floor.visible=!active;grid.visible=!active;controls.enabled=!active;
 scene.background=active?new THREE.Color('#c8dce4'):null;scene.fog=active?new THREE.Fog('#c8dce4',38,100):new THREE.Fog(0xf3f1ec,18,34);
 $('.controls').hidden=active;$('.view-tools').hidden=active;$('#stage-hint').hidden=active;document.body.classList.toggle('riding',active);
}
function updateRide(dt){if(filmRender||state.mode!=='ride')return;$('#ride-pause').textContent=state.play?'Ⅱ Pause ride':'▶ Resume ride';
 if(state.play)state.rideDistance+=state.rideSpeed/3.6*dt;
 const x=state.rideDistance;carRig.position.set(x,0,1.7);cityRide.update(x);floor.visible=false;grid.visible=false;
 const view=state.rideCamera==='side'?[.5,2.5,3.5]:state.rideCamera==='above'?[-3,10,3.5]:[7,3.2,2.2];
 const desired=new THREE.Vector3(x+view[0],view[1],1.7+view[2]);camera.position.lerp(desired,1-Math.exp(-7*dt));controls.target.set(x,.8,1.7);camera.lookAt(controls.target);
 key.position.set(x+3,9,5);key.target.position.set(x,0,1.7);key.target.updateMatrixWorld();
}
$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$$('[data-part]').forEach(b=>b.onclick=()=>{stopTour();selectPart(b.dataset.part,true)});
$('#assembled').onclick=()=>{stopTour();state.xray=false;setExplosion(0)};$('#exploded').onclick=()=>{stopTour();state.xray=false;setExplosion(100)};$('#xray').onclick=()=>{stopTour();state.xray=!state.xray;setExplosion(0)};
$('#explode-range').oninput=e=>{stopTour();state.focus=null;state.xray=false;state.explode=+e.target.value;updateViewButtons();cameraTo([6.6+state.explode*.01,3.7+state.explode*.015,6.3+state.explode*.013],[0,.7+state.explode*.011,0],.25)};
$('#rotate').onclick=()=>{state.rotate=!state.rotate;controls.autoRotate=state.rotate;$('#rotate').setAttribute('aria-pressed',String(state.rotate))};
$('#reset').onclick=()=>{stopTour();setMode('anatomy');state.rotate=false;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');state.xray=false;setExplosion(0);selectPart('body');toast('View reset. Drag to orbit or select a layer.');};
$('[data-view=side]').onclick=()=>cameraTo([0,1.9,8.9],[0,state.explode>20?1.5:.7,0]);$('[data-view=top]').onclick=()=>cameraTo([.02,10,.02],[0,.8,0]);
$('#motion').onclick=()=>{state.play=!state.play;$('#motion').textContent=state.play?'Ⅱ Pause':'▶ Play';$('#motion').setAttribute('aria-pressed',String(state.play))};
$('#isolate').onclick=()=>selectPart(state.part,true);
const brakeView=document.createElement('button');brakeView.id='brake-view';brakeView.className=$('#isolate').className;brakeView.textContent='Assemble wheel';brakeView.hidden=true;$('#isolate').after(brakeView);brakeView.onclick=()=>{state.brakeDetail=!state.brakeDetail;brakeView.textContent=state.brakeDetail?'Assemble wheel':'Separate rim & brake';selectPart('wheels',true);};
$('#tour').onclick=()=>state.tour?stopTour():startTour();
$('#credits-open').onclick=()=>$('#credits').showModal();$('#credits-close').onclick=()=>$('#credits').close();$('#credits').addEventListener('click',e=>{if(e.target===$('#credits')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('#fact-source').onclick=()=>window.open(urls[parts[state.part].source],'_blank','noopener');$('#help').onclick=()=>toast('Drag to rotate · Scroll or pinch to zoom · Tap a layer to separate it · Try the four chapters.');$('.brand').onclick=e=>{e.preventDefault();$('#reset').click()};
const raycaster=new THREE.Raycaster();let pointerDown=null;renderer.domElement.addEventListener('pointerdown',e=>pointerDown=state.mode==='ride'?null:[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>6)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hits=raycaster.intersectObjects(allPickMeshes,false);const h=hits.find(h=>h.object.visible&&h.object.material.opacity>.2);if(h)selectPart(h.object.userData.part,true)});
function resize(){const r=viewport.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(viewport);
let prev=performance.now(),lastTourChapter=-1;
function animate(now=performance.now()){
 if(!filmRender)requestAnimationFrame(animate);const dt=Math.min(.05,(now-prev)/1000);prev=now;if(state.play){clock+=dt;state.elapsed+=dt;}const motion=motionAt(state.mode,state.elapsed,state.frictionOnly);if(state.mode==='ride')motion.speed=state.rideSpeed/3.6/.344/2.4;
 currentExplosion=THREE.MathUtils.damp(currentExplosion,state.explode/100,6,dt);const ex=currentExplosion;
 for(const [name,layer]of Object.entries(layers))layer.visible=!state.focus||name===state.focus||name==='body'||(state.focus==='body'&&(name==='wheels'||name==='cabin'));
 layers.body.position.y=lift.body*ex;layers.cabin.position.y=lift.cabin*ex;layers.structure.position.y=lift.structure*ex;layers.battery.position.y=lift.battery*ex;layers.motor.position.y=lift.motor*ex;
 wheelGroups.forEach((wg,i)=>{wg.visible=true;brakeCalipers[i].visible=wg.visible;for(const child of wg.children){child.visible=true;if(child.userData.wheelBaseZ===undefined)child.userData.wheelBaseZ=child.position.z;child.position.z=child.userData.wheelBaseZ+(!child.userData.brake?Math.sign(wg.userData.base.z)*Math.max(ex*.42,state.focus==='wheels'&&state.brakeDetail?.32:0):0);}wg.position.z=wg.userData.base.z+Math.sign(wg.userData.base.z)*ex*.55;wg.position.y=wg.userData.base.y-ex*.07;if(state.play)wg.userData.spin+=motion.speed*2.4*dt;wg.rotation.z=wg.userData.spin;const cal=brakeCalipers[i];cal.position.set(wg.position.x+.15,wg.position.y+.01,wg.position.z);cal.material.emissive.setHex(motion.friction?0xc44c22:0);cal.material.emissiveIntensity=motion.friction?.6:0;});
 const status=state.mode==='charge'?'AC supply → charge port → onboard charger (AC to DC) → battery · wheels stopped':state.mode==='drive'?'Battery DC → inverter → motor → reduction gear & differential → both rear wheels':state.mode==='regen'?motion.speed===0?'Stopped · energy recovery has stopped · Replay stop to repeat':state.frictionOnly?'Friction brakes at all four wheels → heat · no energy returned to battery':motion.friction?'Slowing · regeneration plus illustrative friction assistance → heat':'Slowing · both rear wheels → motor as generator → inverter → battery':'';
 if($('#energy-state').textContent!==status)$('#energy-state').textContent=status;

 const contextXray=['structure','battery','motor','wheels'].includes(state.focus);const targetOpacity=state.xray||contextXray?.065:1;currentOpacity=THREE.MathUtils.damp(currentOpacity,targetOpacity,8,dt);
 for(const m of shellMeshes){const orig=originalMaterials.get(m.material);m.material.clippingPlanes=state.focus==='cabin'?[new THREE.Plane(new THREE.Vector3(0,-1,0),1.30)]:null;m.material.opacity=(m.userData.glass?THREE.MathUtils.lerp(orig.opacity,.96,ex):orig.opacity)*currentOpacity;const tr=orig.transparent||currentOpacity<.99;if(m.material.transparent!==tr){m.material.transparent=tr;m.material.needsUpdate=true;}m.material.depthWrite=orig.depthWrite&&currentOpacity>.5;m.castShadow=currentOpacity>.5;}
 layers.cabin.traverse(o=>{if(o.isMesh){if(o.material.transparent!==state.xray){o.material.transparent=state.xray;o.material.needsUpdate=true;}o.material.opacity=state.xray?.09:1;o.material.depthWrite=!state.xray;}});
 layers.structure.traverse(o=>{if(o.isMesh){if(o.material.transparent!==state.xray){o.material.transparent=state.xray;o.material.needsUpdate=true;}o.material.opacity=state.xray?.22:1;o.material.depthWrite=!state.xray;}});
 // Muted selection keeps neighbouring layers readable; the marker identifies the active part.
 const p=parts[state.part],v=new THREE.Vector3(...p.point);v.y+=(lift[state.part]||0)*ex;if(state.part==='wheels')v.z+=ex*.55;selectedRing.position.copy(v);selectedRing.lookAt(camera.position);selectedRing.scale.setScalar(1+Math.sin(clock*3)*.06);selectedRing.visible=!state.focus&&(state.explode>5||state.xray);
 if(flowGroup.visible){const active=state.mode!=='regen'||motion.regeneration;for(const seg of flowSegments){seg.line.visible=active;seg.motes.forEach((m,i)=>{m.visible=active;let t=(clock*.35+i/seg.motes.length)%1;if(state.mode==='regen')t=1-t;m.position.copy(seg.curve.getPointAt(t));});}}

 charger.visible=state.mode==='charge';
 if(cameraTween){const tw=cameraTween,p=THREE.MathUtils.clamp((now-tw.start)/tw.duration,0,1),e=1-(1-p)**3;camera.position.lerpVectors(tw.from,tw.to,e);controls.target.lerpVectors(tw.targetFrom,tw.targetTo,e);if(p===1)cameraTween=null;}
 controls.update();
 for(const[k,p]of Object.entries(parts)){const el=hotspots[k];const show=!state.focus&&ex>.25&&(k==='battery'||k==='motor'||k==='body'||k===state.part);el.classList.toggle('hidden',!show);if(!show)continue;const a=new THREE.Vector3(...p.point);a.y+=(lift[k]||0)*ex;if(k==='wheels')a.z+=ex*.55;a.project(camera);const r=viewport.getBoundingClientRect();const offset={body:[35,-25],battery:[80,30],motor:[-78,-8],cabin:[-50,0],structure:[65,0],wheels:[35,20]}[k];el.style.left=THREE.MathUtils.clamp((a.x*.5+.5)*r.width+offset[0],80,r.width-80)+'px';el.style.top=THREE.MathUtils.clamp((-a.y*.5+.5)*r.height+offset[1],60,r.height-50)+'px';el.style.opacity=a.z<1?'1':'0';}
 if(state.tour){state.tourT+=dt;const chapter=Math.floor(state.tourT/7);if(chapter>3){stopTour();$('#tour-progress').style.width='100%';toast('Tour complete. Select a layer to keep exploring.');}else{if(chapter!==lastTourChapter){lastTourChapter=chapter;setMode(['anatomy','drive','regen','charge'][chapter],true)}$('#tour-progress').style.width=state.tourT/28*100+'%';}}
 updateRide(dt);renderer.render(scene,camera);
}
selectPart('body');load();

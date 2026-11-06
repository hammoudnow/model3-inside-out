import * as THREE from 'three';
// Original lightweight city scenery. Modular blocks recycle beyond the camera's fog.
export function createCityRide(){
 const group=new THREE.Group();group.visible=false;
 const box=new THREE.BoxGeometry(1,1,1);
 const material=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const asphalt=material('#39454c'),paving=material('#c8c3b7'),curb=material('#e6e0d2'),white=material('#f3e7c8'),glass=material('#526f7a',.22),trim=material('#e8dfca'),trunk=material('#705540'),leaves=material('#68856a');
 const palettes=['#b3bcb8','#c3a78e','#e0d6c3','#8c9c9e','#b5aaa0'];
 const blocks=[];
 function cube(parent,size,pos,mat){const m=new THREE.Mesh(box,mat);m.scale.set(...size);m.position.set(...pos);m.castShadow=size[1]>1;m.receiveShadow=true;parent.add(m);return m;}
 for(let block=0;block<4;block++){
  const chunk=new THREE.Group();group.add(chunk);blocks.push(chunk);
  cube(chunk,[60,.14,8],[0,-.075,0],asphalt);
  for(const sign of[-1,1]){
   cube(chunk,[60,.2,3],[0,0,sign*5.5],paving);cube(chunk,[60,.22,.15],[0,.01,sign*4.05],curb);
   cube(chunk,[60,.012,.09],[0,.004,sign*3.65],white);
   for(let i=0;i<5;i++){
    const x=-24+i*12,h=5+((i*7+block*3+(sign>0?2:0))%6)*1.65,w=8.2+(i%2)*1.3,z=sign*(10.3+(i%2)*.5);
    const facade=material(palettes[(i+block+(sign>0?2:0))%palettes.length]);
    cube(chunk,[w,h,6],[x,h/2,z],facade);cube(chunk,[w+.25,.18,6.3],[x,h+.05,z],trim);
    cube(chunk,[w,.22,.18],[x,3,sign*(Math.abs(z)-3.06)],trim);
    // Shopfronts and upper floors face the boulevard.
    const windowPositions=[];const floors=Math.floor((h-1.5)/1.35);
    for(let f=0;f<floors;f++)for(let col=0;col<4;col++)windowPositions.push([x-w*.36+col*w*.24,1.15+f*1.35,sign*(Math.abs(z)-3.025)]);
    const windows=new THREE.InstancedMesh(box,glass,windowPositions.length);const matrix=new THREE.Matrix4();windowPositions.forEach((p,n)=>{matrix.compose(new THREE.Vector3(...p),new THREE.Quaternion(),new THREE.Vector3(1.25,.85,.035));windows.setMatrixAt(n,matrix);});chunk.add(windows);
    cube(chunk,[w*.7,.14,.8],[x,2.1,sign*(Math.abs(z)-3.35)],material(i%2?'#756f5d':'#a16f57'));
    const treeX=x+4.6;cube(chunk,[.18,2.0,.18],[treeX,1.05,sign*5.65],trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.95,1),leaves);crown.scale.set(1,1.5,1);crown.position.set(treeX,2.7,sign*5.65);crown.castShadow=true;chunk.add(crown);
    cube(chunk,[.06,4.5,.06],[x-4.6,2.3,sign*4.7],trim);cube(chunk,[.10,.08,.8],[x-4.6,4.55,sign*4.35],trim);
    cube(chunk,[1.4,.12,.48],[x+2.1,.6,sign*5.65],trunk);for(const dx of[-.5,.5])cube(chunk,[.07,.5,.3],[x+2.1+dx,.3,sign*5.65],glass);
   }
  }
  for(let x=-28;x<30;x+=6)cube(chunk,[2.8,.013,.10],[x,.005,0],white);
 }
 // Distant skyline adds depth without additional downloads.
 return {group,update(distance){const origin=Math.floor(distance/60)*60;blocks.forEach((b,i)=>b.position.x=origin+(i-1)*60);}};
}

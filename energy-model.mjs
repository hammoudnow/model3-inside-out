// Normalized teaching model, not measured Tesla control or efficiency data.
export function motionAt(mode,elapsed,frictionOnly=false){
 const speed=mode==='drive'?1:mode==='regen'?Math.max(0,1-elapsed/7):0;
 return {speed,regeneration:mode==='regen'&&!frictionOnly&&speed>0,friction:mode==='regen'&&speed>0&&(frictionOnly||speed<.2)};
}
export const powerRoutes={
 electrical:[[.1,.60,0],[-.65,.60,0],[-1.15,.60,0]],
 motor:[[-1.15,.60,0],[-1.43,.42,0]],
 left:[[-1.43,.42,0],[-1.435,.345,-.86]],
 right:[[-1.43,.42,0],[-1.435,.345,.86]],
 charge:[[-1.98,.8,-1.81],[-1.6,.3,-1.85],[-1.8,1,-.82],[-.82,.61,-.45],[.1,.60,0]]
};

import { execFileSync } from "node:child_process"; import { existsSync, unlinkSync } from "node:fs";
const NB="/home/user/garagedoors-shared/tools/nano-banana.mjs", OUT="assets/img";
const VAN="assets/brand/van-ref.png", TECH="assets/brand/tech-ref.png";
const STYLE="photorealistic documentary photography, shot on 35mm, natural Pacific-Northwest daylight, soft overcast, realistic skin texture and worn materials, candid true-to-life ordinary working people (not models), no studio lighting, no retouching, slightly muted natural colours, sharp focus, high detail";
const BRAND="charcoal near-black work jacket with a small hazard-yellow chest logo and hazard-yellow beanie/cap; if a van appears it is a Ford Transit wrapped matte near-black with a hazard-yellow diagonal stripe and 'SKETCHY GARAGE DOORS' + 'info@sketchygaragedoors.ca', BC plate, NO phone number; brand colours near-black + hazard yellow";
function gen(p,o,r){const a=[NB,p,o];if(r&&existsSync(r))a.push("--ref",r);execFileSync("node",a,{stdio:"inherit",timeout:120000});}
function webp(png,b){execFileSync("cwebp",["-q","80",png,"-o",`${b}.webp`],{stdio:"ignore"});execFileSync("cwebp",["-q","80","-resize","960","0",png,"-o",`${b}-960.webp`],{stdio:"ignore"});execFileSync("cwebp",["-q","80","-resize","480","0",png,"-o",`${b}-480.webp`],{stdio:"ignore"});}
function job(b,p,r){if(existsSync(`${b}.webp`)){console.log("skip",b);return;}const png=`${b}.png`;try{console.log("GEN",b);gen(`${p}; SAME uniform/colours as reference; ${STYLE}; ${BRAND}`,png,r);webp(png,b);unlinkSync(png);console.log("OK",b);}catch(e){console.error("FAIL",b,e.message);}}
const jobs=[
 [`${OUT}/trust-pricing`,"close shot of a garage-door technician's hands holding a clipboard with a clear printed written price quote, in front of a residential garage door, honest upfront pricing, no hidden fees",TECH],
 [`${OUT}/trust-licensed`,"a friendly average-looking garage-door technician in branded charcoal jacket and yellow beanie standing confidently beside the wrapped service van in a Metro Vancouver driveway, holding a clipboard, professional and trustworthy",VAN],
 [`${OUT}/trust-guarantee`,"a garage-door technician giving a reassuring thumbs up beside a freshly finished, perfectly working residential garage door in a clean garage, satisfied with the work",TECH],
];
for(const [b,p,r] of jobs) job(b,p,r);
console.log("DONE batch 3");

#!/usr/bin/env node
/* Batch 2 — remaining GVA city heroes + residential spring-type images.
   Idempotent: skips any job whose .webp already exists. */
import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
const NB = "/home/user/garagedoors-shared/tools/nano-banana.mjs";
const OUT = "assets/img";
const VAN = "assets/brand/van-ref.png";
const TECH = "assets/brand/tech-ref.png";
const STYLE = "photorealistic documentary photography, shot on 35mm, natural Pacific-Northwest daylight, soft overcast sky, realistic skin texture and worn materials, candid and true-to-life, ordinary average working people (not models), no studio lighting, no retouching, slightly muted natural colours, sharp focus, high detail";
const BRAND = "the crew wears charcoal near-black work jackets with a small hazard-yellow chest logo and hazard-yellow beanies/caps; the service van is a Ford Transit wrapped in matte near-black (#15171a) with a bold hazard-yellow (#ffd21e) diagonal stripe, the words 'SKETCHY GARAGE DOORS' on the side panel and 'info@sketchygaragedoors.ca' below it in small clean text, BC licence plate; brand colours are near-black and hazard yellow; NO phone number anywhere on the van or uniform; keep all text minimal and clean";

function gen(prompt, png, ref) { const a=[NB,prompt,png]; if(ref&&existsSync(ref))a.push("--ref",ref); execFileSync("node",a,{stdio:"inherit",timeout:120000}); }
function webp(png,base){ execFileSync("cwebp",["-q","80",png,"-o",`${base}.webp`],{stdio:"ignore"}); execFileSync("cwebp",["-q","80","-resize","960","0",png,"-o",`${base}-960.webp`],{stdio:"ignore"}); execFileSync("cwebp",["-q","80","-resize","480","0",png,"-o",`${base}-480.webp`],{stdio:"ignore"}); }
function job(base,prompt,ref){ if(existsSync(`${base}.webp`)){console.log("skip",base);return;} const png=`${base}.png`; try{console.log("GEN",base); gen(`${prompt}; SAME van wrap, SAME uniforms, SAME brand colours as the reference image; ${STYLE}; ${BRAND}`,png,ref); webp(png,base); unlinkSync(png); console.log("OK",base);}catch(e){console.error("FAIL",base,e.message);} }

const jobs = [
  [`${OUT}/city-port-coquitlam`, "a Port Coquitlam BC residential street near the Coquitlam River with newer two-storey family homes and attached double garages, evergreens behind, the wrapped van parked at the curb", VAN],
  [`${OUT}/city-port-moody`, "a Port Moody BC residential street near Rocky Point and the Burrard Inlet with forested hills behind newer townhomes and garages, the wrapped van parked in a driveway", VAN],
  [`${OUT}/city-new-westminster`, "a New Westminster BC steep residential street of heritage character homes above the Fraser River, the wrapped van parked on the hill, overcast", VAN],
  [`${OUT}/city-west-vancouver`, "a West Vancouver BC hillside modern home with an ocean view and mature cedars, a large double garage, the wrapped van parked in the driveway, soft coastal light", VAN],
  [`${OUT}/city-delta`, "a Ladner Delta BC flat residential street bordered by farmland with newer homes and double garages, wide sky, the wrapped van parked at the curb, overcast", VAN],
  [`${OUT}/city-langley`, "a Langley BC suburban acreage-edge street with large newer homes and triple garages and a hint of farmland, the wrapped van parked out front, overcast", VAN],
  [`${OUT}/city-maple-ridge`, "a Maple Ridge BC street with a forested mountain backdrop and rural-suburban homes with double garages, the wrapped van parked at the curb, overcast", VAN],
  [`${OUT}/city-pitt-meadows`, "a Pitt Meadows BC flat farm-town residential street with the Golden Ears mountains behind newer homes and garages, the wrapped van parked in a driveway, overcast", VAN],
  [`${OUT}/city-white-rock`, "a White Rock BC seaside residential street on a slope with glimpses of the ocean, a mix of older bungalows and newer homes with garages, the wrapped van parked, soft coastal overcast", VAN],
  // residential spring types (educational comparison, no van)
  [`${OUT}/spring-torsion`, "extreme close realistic photo of a black torsion spring mounted on the steel shaft above a residential garage door inside a home garage, winding cone visible, real lighting", TECH],
  [`${OUT}/spring-extension`, "close realistic photo of a stretched extension spring running along the horizontal track of a residential garage door with a safety cable threaded through it, real home garage", TECH],
];
for (const [b,p,r] of jobs) job(b,p,r);
console.log("DONE batch 2");

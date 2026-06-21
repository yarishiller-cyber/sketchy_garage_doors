#!/usr/bin/env node
/**
 * gen-images.mjs — idempotent batch image generator for Sketchy Garage Doors.
 * Generates fresh, locally-relevant Metro Vancouver imagery with Nano Banana
 * (Gemini 2.5 Flash Image), keeping ONE consistent van wrap + uniform + brand
 * colours across the whole site via reference images (--ref).
 *
 * Run:  GEMINI_API_KEY=... node _build/gen-images.mjs
 * Skips any job whose final .webp already exists, so reruns only fill gaps.
 */
import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";

const NB = "/home/user/garagedoors-shared/tools/nano-banana.mjs";
const OUT = "assets/img";
const BRANDDIR = "assets/brand";

// ---- The per-site "brand bible" — pasted into EVERY prompt verbatim --------------------
const STYLE =
  "photorealistic documentary photography, shot on 35mm, natural Pacific-Northwest daylight, " +
  "soft overcast sky, realistic skin texture and worn materials, candid and true-to-life, " +
  "ordinary average working people (not models), no studio lighting, no retouching, slightly " +
  "muted natural colours, sharp focus, high detail";
const BRAND =
  "the crew wears charcoal near-black work jackets with a small hazard-yellow chest logo and " +
  "hazard-yellow beanies/caps; the service van is a Ford Transit wrapped in matte near-black " +
  "(#15171a) with a bold hazard-yellow (#ffd21e) diagonal stripe, the words 'SKETCHY GARAGE " +
  "DOORS' on the side panel and 'info@sketchygaragedoors.ca' below it in small clean text, " +
  "BC licence plate; brand colours are near-black and hazard yellow; NO phone number anywhere " +
  "on the van or uniform; keep all text minimal and clean";

const VAN = `${BRANDDIR}/van-ref.png`;
const TECH = `${BRANDDIR}/tech-ref.png`;

function gen(prompt, outPng, ref) {
  const args = [NB, prompt, outPng];
  if (ref && existsSync(ref)) args.push("--ref", ref);
  execFileSync("node", args, { stdio: "inherit", timeout: 120000 });
}
function webp(png, base) {
  // full (~1024), 960, 480 variants at q80
  execFileSync("cwebp", ["-q", "80", png, "-o", `${base}.webp`], { stdio: "ignore" });
  execFileSync("cwebp", ["-q", "80", "-resize", "960", "0", png, "-o", `${base}-960.webp`], { stdio: "ignore" });
  execFileSync("cwebp", ["-q", "80", "-resize", "480", "0", png, "-o", `${base}-480.webp`], { stdio: "ignore" });
}
function job(base, prompt, ref) {
  if (existsSync(`${base}.webp`)) { console.log("skip", base); return; }
  const png = `${base}.png`;
  try {
    console.log("GEN", base);
    gen(`${prompt}; SAME van wrap, SAME uniforms, SAME brand colours as the reference image; ${STYLE}; ${BRAND}`, png, ref);
    webp(png, base);
    unlinkSync(png);
    console.log("OK  ", base);
  } catch (e) {
    console.error("FAIL", base, e.message);
  }
}

// ---- 1) Reference images first (no --ref), so later jobs can match them ----------------
if (!existsSync(VAN)) {
  console.log("GEN van-ref");
  try {
    gen(`A near-black matte Ford Transit service van wrapped with a bold hazard-yellow diagonal ` +
        `stripe, parked in a residential driveway in Metro Vancouver on an overcast day, side ` +
        `profile, the side panel reads 'SKETCHY GARAGE DOORS' with 'info@sketchygaragedoors.ca' ` +
        `below it, BC licence plate, no phone number; ${STYLE}; ${BRAND}`, VAN);
  } catch (e) { console.error("van-ref FAIL", e.message); }
}
if (!existsSync(TECH)) {
  console.log("GEN tech-ref");
  try {
    gen(`A friendly ordinary middle-aged garage-door technician, average build, slightly weathered ` +
        `face, stubble, work gloves, wearing a charcoal near-black jacket with a small hazard-yellow ` +
        `chest logo and a hazard-yellow beanie, standing in front of an open residential garage in ` +
        `Metro Vancouver, holding a torsion spring; ${STYLE}; ${BRAND}`, TECH);
  } catch (e) { console.error("tech-ref FAIL", e.message); }
}

// ---- 2) Heroes + section imagery ------------------------------------------------------
const jobs = [
  // Home — generate a wide (desktop) and a vertical-feeling (mobile) composition of same scene
  [`${OUT}/home-hero-desktop`, "Wide cinematic shot: a friendly average technician in branded uniform standing beside the wrapped van in front of a Vancouver craftsman home with an open double garage door, golden gap of light, overcast morning, lots of negative space on the left for text", VAN],
  [`${OUT}/home-hero-mobile`, "Vertical portrait composition: a friendly average technician in branded uniform beside the wrapped van in a Vancouver residential driveway with an open double garage door behind, overcast morning, room at the top for a headline", VAN],

  // Service heroes (decorative pageheads)
  [`${OUT}/svc-spring`, "Close realistic shot of worn-gloved hands replacing a broken torsion spring on the shaft above a residential garage door, real garage interior, tools visible", TECH],
  [`${OUT}/svc-opener`, "A technician on a small ladder fitting a ceiling-mounted garage door opener unit in a real Metro Vancouver garage, natural light from the open door", TECH],
  [`${OUT}/svc-cable`, "Close shot of hands re-spooling a frayed garage door lift cable onto the drum beside the torsion shaft, real garage, worn gloves", TECH],
  [`${OUT}/svc-offtrack`, "A technician realigning a garage door roller back onto a bent vertical track in a residential garage, focused, tools in hand", TECH],
  [`${OUT}/svc-newdoor`, "A freshly installed modern dark garage door on a Metro Vancouver home with the wrapped van in the driveway, overcast day", VAN],
  [`${OUT}/svc-maintenance`, "A technician lubricating the rollers and hinges of a residential garage door during a tune-up, spray and rag in hand, real garage", TECH],
  [`${OUT}/svc-emergency`, "A wrapped service van parked at dusk in front of a Metro Vancouver home with the garage light on and the door partly open, headlights on, sense of a fast call-out", VAN],

  // City heroes (unique per city — local SEO)
  [`${OUT}/city-vancouver`, "A leafy East Vancouver residential street of character craftsman houses with the wrapped van parked at the curb, overcast, mountains faint in the distance", VAN],
  [`${OUT}/city-burnaby`, "A Burnaby suburban street with newer two-storey homes and attached double garages, the wrapped van parked in a driveway, Metro Vancouver, overcast", VAN],
  [`${OUT}/city-surrey`, "A wide Surrey BC suburban residential cul-de-sac with large newer family homes and double garages, the wrapped van parked out front, overcast", VAN],
  [`${OUT}/city-richmond`, "A flat Richmond BC residential street with newer homes, wide sky, the wrapped van parked in a driveway with an open garage, overcast coastal light", VAN],
  [`${OUT}/city-coquitlam`, "A Coquitlam BC hillside residential street with tall evergreens behind newer homes and double garages, the wrapped van parked at the curb, overcast", VAN],
  [`${OUT}/city-north-vancouver`, "A North Vancouver residential street with the North Shore mountains and evergreens behind craftsman homes, the wrapped van in a driveway, soft overcast", VAN],

  // Other page heroes
  [`${OUT}/about`, "Two ordinary blue-collar garage-door technicians in branded charcoal jackets standing relaxed beside the wrapped van in a Metro Vancouver driveway, genuine candid", VAN],
  [`${OUT}/contact`, "The wrapped near-black service van parked in front of a Metro Vancouver home, ready to go, overcast morning, clean and approachable", VAN],
  [`${OUT}/faq`, "A technician kneeling to inspect the bottom bracket and cable of a residential garage door, explaining as if to a homeowner, real garage", TECH],
  [`${OUT}/partner`, "Two working tradespeople shaking hands beside the wrapped van in a Metro Vancouver driveway, genuine blue-collar, overcast", VAN],
];

for (const [base, prompt, ref] of jobs) job(base, prompt, ref);
console.log("DONE");

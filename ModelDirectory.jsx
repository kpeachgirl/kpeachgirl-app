import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   KPEACHGIRL — Editorial Model Directory
   Aesthetic: High-fashion editorial / luxury agency
   Typography: Cormorant Garamond + Manrope
   Palette: Warm cream, deep charcoal, muted rose
   ═══════════════════════════════════════════════════════ */

const DEFAULT_AREAS = ["LA", "West LA", "Mid-Wilshire", "OC"];

const DEFAULT_CARD_SETTINGS = {
  subtitleFields: ["region","types"],
  showVerifiedBadge: true,
  showAwayBadge: true,
  verifiedLabel: "Verified",
  awayLabel: "Away",
  overlayColor: "#1a1a1a",
  overlayOpacity: 70,
};

const DEFAULT_PILL_GROUPS = [
  { id:"types", title:"Shoot Types", color:"var(--charcoal)", dataKey:"types",
    options:["Portrait","Fashion","Commercial","Glamour","Fitness","Editorial","Artistic","Swimwear","Lingerie","Cosplay","Lifestyle","Event"] },
  { id:"compensation", title:"Compensation", color:"var(--sage)", dataKey:"compensation",
    options:["Paid Only","TFP","Negotiable"] },
];

const DEFAULT_HERO = {
  img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&h=800&fit=crop",
  imgCrop: null,
  subtitle: "Los Angeles · Orange County",
  titleLine1: "Find Your",
  titleLine2: "Perfect",
  titleAccent: "Model",
  searchPlaceholder: "Search by name or area...",
};

const DEFAULT_FORM_FIELDS = {
  title: "Model Membership Form",
  subtitle: "You've been invited to submit your information for consideration on our platform. Fill out the form below and our team will review within 48 hours.",
  successTitle: "Submission Received!",
  successMsg: "Thank you for your interest! Our team will review your information and reach out within 48 hours.",
  submitLabel: "Submit Membership Form",
  fields: [
    { id:"name", label:"Full Name", type:"text", required:true, width:"half", placeholder:"Jane Doe" },
    { id:"email", label:"Email", type:"email", required:true, width:"half", placeholder:"jane@email.com" },
    { id:"phone", label:"Phone", type:"text", required:false, width:"third", placeholder:"(555) 123-4567" },
    { id:"age", label:"Age", type:"text", required:false, width:"third", placeholder:"21" },
    { id:"height", label:"Height", type:"text", required:false, width:"third", placeholder:"5'7\"" },
    { id:"region", label:"Preferred Area", type:"area_select", required:false, width:"half", placeholder:"Select area..." },
    { id:"exp", label:"Experience Level", type:"exp_select", required:false, width:"half", placeholder:"Select..." },
    { id:"types", label:"Shoot Types (select all that apply)", type:"type_pills", required:false, width:"full", placeholder:"" },
    { id:"bio", label:"Tell us about yourself", type:"textarea", required:false, width:"full", placeholder:"Your experience, style, what you bring to a shoot..." },
    { id:"social", label:"Instagram / Social", type:"text", required:false, width:"full", placeholder:"@yourhandle" },
    { id:"id_photo", label:"ID Verification", type:"file_upload", required:true, width:"full", placeholder:"", helperText:"Upload a photo holding your ID next to your face. You may cover all other information — we only need to verify your name matches. No other personal details will be recorded." },
  ]
};

const DEFAULT_CATEGORIES = [
  { id: "stats", title: "Vitals", fields: [
    { key: "age", label: "Age" }, { key: "height", label: "Height" }, { key: "weight", label: "Weight" },
    { key: "bust", label: "Bust" }, { key: "waist", label: "Waist" }, { key: "hips", label: "Hips" },
  ]},
  { id: "appearance", title: "Look", fields: [
    { key: "hair", label: "Hair" }, { key: "eyes", label: "Eyes" },
    { key: "shoe", label: "Shoe" }, { key: "dress", label: "Dress" },
    { key: "tattoos", label: "Tattoos" }, { key: "piercings", label: "Piercings" },
  ]},
  { id: "professional", title: "Work", fields: [
    { key: "exp", label: "Experience" }, { key: "region", label: "Based In" },
  ]},
];

const MODELS = [
  { id:1, name:"Aria Novak", region:"LA", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=600&fit=crop",
    types:["Fashion","Editorial","Portrait"], verified:true, vacation:false, exp:"Professional", age:"24", height:"5'9\"", weight:"125", bust:"34\"", waist:"24\"", hips:"35\"", hair:"Brunette", eyes:"Green", shoe:"8", dress:"4", tattoos:"Floral, left wrist", piercings:"Ears",
    bio:"Six years in high fashion and editorial. Hollywood-based, available throughout LA. Vogue Italia, Harper's Bazaar, Elle. I believe in the power of a single frame to tell an entire story — that's what drives every shoot.",
    instagram:"@arianovak", compensation:["Paid Only"],
    gallery:[
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=650&fit=crop"
    ] },
  { id:2, name:"Jordan Reyes", region:"West LA", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1516641051054-9df6a1aad654?w=1400&h=600&fit=crop",
    types:["Fitness","Commercial","Lifestyle"], verified:true, vacation:false, exp:"Experienced", age:"28", height:"5'8\"", weight:"130", bust:"34\"", waist:"25\"", hips:"36\"", hair:"Auburn", eyes:"Hazel", shoe:"8", dress:"4", tattoos:"Delicate wrist", piercings:"None",
    bio:"Santa Monica based. Former collegiate dancer. Athletic wear, lifestyle, and commercial campaigns are my forte. I bring energy and grace that translates through the lens.",
    instagram:"@jordanmiles", compensation:["Paid Only","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=700&fit=crop"
    ] },
  { id:3, name:"Luna Chen", region:"OC", parentRegion:"OC",
    img:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=600&fit=crop",
    types:["Portrait","Artistic","Cosplay"], verified:true, vacation:false, exp:"Intermediate", age:"22", height:"5'5\"", weight:"115", bust:"32\"", waist:"25\"", hips:"34\"", hair:"Black", eyes:"Dark Brown", shoe:"7", dress:"2", tattoos:"None", piercings:"Ears, nose",
    bio:"Conceptual and artistic photography is my world. I bring characters to life — every shoot is a story waiting to unfold. Based in Orange County, always open to creative collaboration.",
    instagram:"@lunachen", compensation:["TFP","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=700&fit=crop"
    ] },
  { id:4, name:"Mia Rivera", region:"OC", parentRegion:"OC",
    img:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1400&h=600&fit=crop",
    types:["Swimwear","Fitness","Commercial"], verified:false, vacation:false, exp:"Beginner", age:"25", height:"5'7\"", weight:"125", bust:"33\"", waist:"25\"", hips:"35\"", hair:"Brown", eyes:"Hazel", shoe:"10.5", dress:"—", tattoos:"Chest piece", piercings:"None",
    bio:"New to modeling but not to hard work. Newport Beach energy, swimwear and beauty focus. Ready to build something real.",
    instagram:"@marcusrivera", compensation:["TFP","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=600&fit=crop"
    ] },
  { id:5, name:"Sasha Okonkwo", region:"LA", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1400&h=600&fit=crop",
    types:["Fashion","Glamour","Editorial"], verified:true, vacation:true, exp:"Professional", age:"26", height:"5'10\"", weight:"130", bust:"34\"", waist:"25\"", hips:"36\"", hair:"Black", eyes:"Dark Brown", shoe:"9", dress:"6", tattoos:"None", piercings:"Ears",
    bio:"Runways in Paris, Milan, New York. South Bay based. Fashion that tells a story is the only kind worth making.",
    instagram:"@sashao", compensation:["Paid Only"],
    gallery:[
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1484399172022-72a90b12e3c1?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?w=500&h=700&fit=crop"
    ] },
  { id:6, name:"Kaia Tanaka", region:"Mid-Wilshire", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&h=600&fit=crop",
    types:["Artistic","Editorial","Portrait"], verified:true, vacation:false, exp:"Experienced", age:"27", height:"5'7\"", weight:"125", bust:"33\"", waist:"24\"", hips:"35\"", hair:"Honey Blonde", eyes:"Brown", shoe:"7.5", dress:"4", tattoos:"Small rib piece", piercings:"Ears",
    bio:"DTLA Arts District. High-concept editorial and boundary-pushing art. Comfortable in any aesthetic. Let's make something that matters.",
    instagram:"@kaitanaka", compensation:["Paid Only","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=700&fit=crop"
    ] },
  { id:7, name:"Valentina Rossi", region:"OC", parentRegion:"OC",
    img:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1400&h=600&fit=crop",
    types:["Swimwear","Lifestyle","Fashion"], verified:true, vacation:false, exp:"Professional", age:"23", height:"5'7\"", weight:"120", bust:"33\"", waist:"24\"", hips:"35\"", hair:"Auburn", eyes:"Blue", shoe:"7.5", dress:"4", tattoos:"Small ankle", piercings:"Ears",
    bio:"Laguna Beach. Swimwear and lifestyle in golden hour. Studio or location — I'm at home in front of any lens.",
    instagram:"@valrossi", compensation:["Paid Only","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop"
    ] },
  { id:8, name:"Demi Moreno", region:"Mid-Wilshire", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1400&h=600&fit=crop",
    types:["Commercial","Lifestyle","Fitness"], verified:false, vacation:false, exp:"Intermediate", age:"30", height:"5'6\"", weight:"120", bust:"33\"", waist:"25\"", hips:"35\"", hair:"Dark Brown", eyes:"Brown", shoe:"7", dress:"2", tattoos:"Script behind ear", piercings:"None",
    bio:"Mid-Wilshire. Acting background with improv chops. I take direction well and bring energy that's hard to fake. Fashion-forward and fearless.",
    instagram:"@dexmoreno", compensation:["Negotiable","TFP"],
    gallery:[
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=600&fit=crop"
    ] },
  { id:9, name:"Priya Sharma", region:"West LA", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1400&h=600&fit=crop",
    types:["Fashion","Commercial","Editorial"], verified:true, vacation:false, exp:"Professional", age:"25", height:"5'8\"", weight:"122", bust:"33\"", waist:"24\"", hips:"34\"", hair:"Dark Brown", eyes:"Brown", shoe:"7.5", dress:"4", tattoos:"None", piercings:"Ears",
    bio:"West LA-based with roots in Mumbai. Bridging South Asian aesthetics with American commercial style. Campaign work for major beauty brands and fashion houses.",
    instagram:"@priyasharma", compensation:["Paid Only"],
    gallery:[
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=700&fit=crop"
    ] },
  { id:10, name:"Elena Brooks", region:"LA", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&h=600&fit=crop",
    types:["Portrait","Editorial","Commercial"], verified:true, vacation:false, exp:"Experienced", age:"29", height:"5'9\"", weight:"128", bust:"34\"", waist:"25\"", hips:"36\"", hair:"Black", eyes:"Brown", shoe:"8", dress:"4", tattoos:"Minimal geometric", piercings:"None",
    bio:"Hollywood Hills. Editorial and portrait work with a quiet intensity. I don't just pose — I inhabit a moment. Dance and theater background informs everything I do in front of the camera.",
    instagram:"@elijahbrooks", compensation:["Paid Only","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=700&fit=crop"
    ] },
  { id:11, name:"Camille Dubois", region:"Mid-Wilshire", parentRegion:"LA",
    img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1516641051054-9df6a1aad654?w=1400&h=600&fit=crop",
    types:["Glamour","Fashion","Artistic"], verified:true, vacation:false, exp:"Professional", age:"27", height:"5'10\"", weight:"128", bust:"34\"", waist:"25\"", hips:"36\"", hair:"Blonde", eyes:"Blue", shoe:"9", dress:"6", tattoos:"Behind ear", piercings:"Ears, helix",
    bio:"French-American. Mid-Wilshire studio regular. I bring European editorial sensibility to LA's commercial scene. Comfortable in haute couture and streetwear alike.",
    instagram:"@camilledubois", compensation:["Paid Only"],
    gallery:[
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&h=700&fit=crop"
    ] },
  { id:12, name:"Naomi Vasquez", region:"OC", parentRegion:"OC",
    img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop&crop=face",
    cover:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1400&h=600&fit=crop",
    types:["Lifestyle","Commercial","Fitness"], verified:false, vacation:false, exp:"Beginner", age:"23", height:"5'6\"", weight:"118", bust:"32\"", waist:"24\"", hips:"34\"", hair:"Curly Brown", eyes:"Green", shoe:"7", dress:"2", tattoos:"Shoulder florals", piercings:"Ear",
    bio:"Orange County native. Lifestyle and beauty content creator turned model. Natural light, candid moments, and authentic energy are my signature. Let's make content that feels real.",
    instagram:"@nicovasquez", compensation:["TFP","Negotiable"],
    gallery:[
      "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=750&fit=crop",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=650&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=600&fit=crop"
    ] },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');
:root { --cream:#0e0d0c; --warm:#161514; --sand:#2a2622; --charcoal:#f0ebe5; --ink:#e0d8ce; --muted:#8a8078; --rose:#d4758a; --rose-soft:rgba(212,117,138,0.12); --rose-mid:rgba(212,117,138,0.2); --peach:#e0a08c; --sage:#8fad8f; }
* { margin:0; padding:0; box-sizing:border-box; }
body { background:var(--cream); color:var(--charcoal); }
html { color-scheme:dark; }
.serif { font-family:'Cormorant Garamond','Georgia',serif; }
.sans { font-family:'Manrope',sans-serif; }
.grain::before { content:''; position:fixed; inset:0; z-index:9998; pointer-events:none; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.card-img { transition:transform 1.2s cubic-bezier(0.16,1,0.3,1),filter 0.6s ease; }
.model-card:hover .card-img { transform:scale(1.06); }
.model-card:hover .card-name { letter-spacing:0.04em; }
.slide-in { animation:slideIn 0.35s cubic-bezier(0.16,1,0.3,1); }
@keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
.fade-up { animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes fadeUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
.stagger-1{animation-delay:0.05s} .stagger-2{animation-delay:0.1s} .stagger-3{animation-delay:0.15s} .stagger-4{animation-delay:0.2s} .stagger-5{animation-delay:0.25s}
input:focus,textarea:focus,select:focus { outline:none; border-color:var(--rose) !important; }
::selection { background:var(--rose-mid); }
.gallery-item { break-inside:avoid; margin-bottom:10px; cursor:pointer; overflow:hidden; }
.gallery-item img { transition:transform 0.8s cubic-bezier(0.16,1,0.3,1); display:block; width:100%; }
.gallery-item:hover img { transform:scale(1.03); }

/* ─── RESPONSIVE GRID ─── */
.model-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
.profile-hero { display:grid; grid-template-columns:1fr 1fr; min-height:85vh; }
.profile-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:48px; }
.profile-gallery { columns:3; column-gap:10px; }
.admin-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; }
.admin-table-row { display:grid; grid-template-columns:44px 1.6fr 0.8fr 0.7fr 70px 70px 56px; }
.admin-slide { position:fixed; top:0; right:0; bottom:0; width:500px; }
.admin-save-bar { position:fixed; bottom:0; right:0; width:500px; }
.admin-fields-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 20px; }
.admin-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 14px; }
.hero-title { font-size:72px; }
.hero-search { width:360px; }
.hero-pad { padding:0 60px 64px; }
.nav-links { display:flex; }
.nav-pad { padding:14px 40px; }
.content-pad { padding:28px 40px 0; }
.grid-pad { padding:24px 40px 80px; }
.footer-pad { padding:32px 40px; }
.profile-name { font-size:64px; }
.profile-info-pad { padding:60px 56px; }
.filter-scroll { display:flex; gap:4px; align-items:center; flex-wrap:wrap; }
.admin-tabs { display:flex; gap:2px; }
.cat-heading { font-size:28px; }
.admin-nav-pad { padding:16px 32px; }

/* ─── TABLET (640-1024px) ─── */
@media (max-width:1024px) {
  .model-grid { grid-template-columns:repeat(2,1fr); }
  .profile-hero { grid-template-columns:1fr; min-height:auto; }
  .profile-stats { grid-template-columns:repeat(2,1fr); gap:32px; }
  .profile-gallery { columns:2; }
  .admin-stats { grid-template-columns:repeat(2,1fr); }
  .admin-slide { width:420px; }
  .admin-save-bar { width:420px; }
  .hero-title { font-size:56px; }
  .hero-search { width:100%; max-width:400px; }
  .hero-pad { padding:0 40px 48px; }
  .nav-pad { padding:12px 24px; }
  .content-pad { padding:20px 24px 0; }
  .grid-pad { padding:20px 24px 60px; }
  .footer-pad { padding:24px 24px; }
  .profile-name { font-size:48px; }
  .profile-info-pad { padding:40px 32px; }
}

/* ─── MOBILE (<640px) ─── */
@media (max-width:640px) {
  .model-grid { grid-template-columns:repeat(2,1fr); gap:1px; }
  .profile-hero { grid-template-columns:1fr; }
  .profile-stats { grid-template-columns:1fr; gap:24px; }
  .profile-gallery { columns:2; column-gap:6px; }
  .admin-stats { grid-template-columns:repeat(2,1fr); }
  .admin-table-row { grid-template-columns:36px 1fr 60px; }
  .admin-slide { width:100%; left:0; }
  .admin-save-bar { width:100%; left:0; }
  .admin-fields-grid { grid-template-columns:1fr; }
  .admin-edit-grid { grid-template-columns:1fr; }
  .hero-title { font-size:36px; }
  .hero-search { width:100%; }
  .hero-pad { padding:0 20px 36px; }
  .nav-links { display:none; }
  .mob-admin { display:block !important; }
  .nav-pad { padding:10px 16px; }
  .content-pad { padding:16px 16px 0; }
  .grid-pad { padding:16px 16px 48px; }
  .footer-pad { padding:20px 16px; }
  .profile-name { font-size:36px; }
  .profile-info-pad { padding:28px 20px; }
  .filter-scroll { flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:8px; }
  .filter-scroll::-webkit-scrollbar { display:none; }
  .admin-tabs { gap:0; }
  .admin-tabs button { padding:6px 10px !important; font-size:9px !important; }
  .cat-heading { font-size:22px; }
  .admin-nav-pad { padding:12px 16px; }
  .admin-table-row .mob-hide { display:none; }
}
`;

/* ─── AGE GATE ─── */
const AgeGate = ({ onVerified }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);
  return (
    <div className="sans" style={{ position:'fixed', inset:0, zIndex:9999, background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center' }}>

      <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:`repeating-linear-gradient(0deg, var(--charcoal) 0px, var(--charcoal) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, var(--charcoal) 0px, var(--charcoal) 1px, transparent 1px, transparent 80px)` }} />
      <div style={{ position:'relative', textAlign:'center', maxWidth:420, padding:'56px 44px', background:'#181716', border:'1px solid var(--sand)', transform:show?'translateY(0)':'translateY(20px)', opacity:show?1:0, transition:'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="serif" style={{ fontSize:42, fontWeight:300, letterSpacing:'-0.02em', color:'var(--charcoal)', lineHeight:1 }}>K<span style={{ color:'var(--rose)' }}>peach</span>girl</div>
        <div style={{ width:40, height:1, background:'var(--rose)', margin:'20px auto' }} />
        <div className="sans" style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', color:'var(--rose)', marginBottom:8, textTransform:'uppercase' }}>Age Verification Required</div>
        <p className="sans" style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7, marginBottom:32 }}>This website contains content intended for adults. By entering, you confirm you are at least <strong style={{ color:'var(--charcoal)' }}>18 years of age</strong> and agree to our Terms&nbsp;of&nbsp;Service.</p>
        <button onClick={onVerified} className="sans" style={{ width:'100%', padding:'14px 0', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s' }}
          onMouseEnter={e => e.target.style.background='var(--rose)'} onMouseLeave={e => e.target.style.background='var(--charcoal)'}>I am 18 or older — Enter</button>
        <button onClick={() => window.history.back()} className="sans" style={{ width:'100%', padding:'12px 0', marginTop:8, background:'transparent', color:'var(--sand)', border:'1px solid var(--sand)', fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>Leave Site</button>
        <p className="sans" style={{ fontSize:10, color:'var(--sand)', marginTop:24, lineHeight:1.5 }}>All models are 18+. Unauthorized use prohibited.</p>
      </div>
    </div>
  );
};

const Verified = ({ s=13 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ display:'inline', verticalAlign:'middle', marginLeft:4 }}><circle cx="12" cy="12" r="11" fill="var(--sage)"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);

/* ─── MODEL CARD ─── */
const ModelCard = ({ model, onClick, cs={} }) => {
  const sf = cs.subtitleFields || ["region","types"];
  const subtitle = sf.map(f => f==="region"?model.region:f==="types"?(model.types||[])[0]:f==="exp"?model.exp:f==="age"?model.age:"").filter(Boolean).join(" · ");
  const oc = cs.overlayColor || "#1a1a1a";
  const oo = (cs.overlayOpacity!=null?cs.overlayOpacity:70)/100;
  return (
  <div className="model-card" onClick={() => onClick(model)} style={{ cursor:'pointer', position:'relative', overflow:'hidden', background:'#181716' }}>
    <div style={{ position:'relative', paddingTop:'135%', overflow:'hidden' }}>
      <img className="card-img" src={model.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#d9cfc4"/><text x="200" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="64" font-weight="300" fill="rgba(138,127,118,0.4)">'+((model.name||'?')[0])+'</text></svg>')} alt={model.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:`${(model.imgCrop&&model.imgCrop.x)||50}% ${(model.imgCrop&&model.imgCrop.y)||50}%`, transform:`scale(${((model.imgCrop&&model.imgCrop.zoom)||100)/100})`, transformOrigin:`${(model.imgCrop&&model.imgCrop.x)||50}% ${(model.imgCrop&&model.imgCrop.y)||50}%`, filter:model.vacation?'grayscale(0.6) brightness(0.9)':'none' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:`linear-gradient(transparent, ${oc}${Math.round(oo*255).toString(16).padStart(2,'0')})` }} />
      <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6 }}>
        {cs.showVerifiedBadge!==false && model.verified && <span className="sans" style={{ background:'rgba(24,23,22,0.92)', backdropFilter:'blur(8px)', padding:'3px 10px', fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--sage)', textTransform:'uppercase' }}>{cs.verifiedLabel||"Verified"}</span>}
        {cs.showAwayBadge!==false && model.vacation && <span className="sans" style={{ background:'rgba(24,23,22,0.92)', padding:'3px 10px', fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--peach)', textTransform:'uppercase' }}>{cs.awayLabel||"Away"}</span>}
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 18px' }}>
        <div className="card-name serif" style={{ fontSize:24, fontWeight:500, color:'#fff', transition:'letter-spacing 0.6s ease', lineHeight:1.1 }}>{model.name}</div>
        {subtitle && <div className="sans" style={{ fontSize:10, fontWeight:600, letterSpacing:'0.14em', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', marginTop:4 }}>{subtitle}</div>}
      </div>
    </div>
  </div>
);};

/* ─── PROFILE PAGE ─── */
const ProfilePage = ({ model, categories, pillGroups, groups, onBack, onSelectGroup }) => {
  const [lb, setLb] = useState(null);
  return (
    <div className="grain" style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <div className="nav-pad" style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(14,13,12,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="sans" style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase' }}>← Back</button>
        <div className="serif" style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.01em' }}>K<span style={{ color:'var(--rose)' }}>peach</span>girl</div>
        <div style={{ width:60 }} />
      </div>

      <div className="fade-up profile-hero" style={{ paddingTop:72 }}>
        <div style={{ position:'relative', overflow:'hidden', minHeight:350 }}><img src={model.cover||model.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="700" height="400"><rect width="700" height="400" fill="#d9cfc4"/></svg>')} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', minHeight:350, objectPosition:`${(model.coverCrop&&model.coverCrop.x)||50}% ${(model.coverCrop&&model.coverCrop.y)||50}%`, transform:`scale(${((model.coverCrop&&model.coverCrop.zoom)||100)/100})`, transformOrigin:`${(model.coverCrop&&model.coverCrop.x)||50}% ${(model.coverCrop&&model.coverCrop.y)||50}%` }} /></div>
        <div className="profile-info-pad" style={{ display:'flex', flexDirection:'column', justifyContent:'center', position:'relative' }}>
          <div className="sans" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'var(--rose)', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>{model.region} {model.verified && <Verified />}</div>
          <h1 className="serif profile-name" style={{ fontWeight:300, lineHeight:1, letterSpacing:'-0.03em', color:'var(--charcoal)', marginBottom:20 }}>{model.name}</h1>
          {model.vacation && <div className="sans" style={{ background:'rgba(212,144,124,0.1)', border:'1px solid rgba(212,144,124,0.2)', padding:'12px 18px', marginBottom:24, fontSize:12, fontWeight:600, color:'var(--peach)', letterSpacing:'0.05em' }}>Currently unavailable — check back soon</div>}
          <p className="sans" style={{ fontSize:15, lineHeight:1.85, color:'var(--muted)', maxWidth:440, marginBottom:32 }}>{model.bio}</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:24 }}>
            {(pillGroups||[]).map(pg=>(model[pg.dataKey]||[]).map(v=>(
              <span key={pg.id+v} className="sans" style={{ padding:'5px 14px', border:`1px solid ${pg.color==='var(--charcoal)'?'var(--sand)':pg.color+'33'}`, fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:pg.color==='var(--charcoal)'?'var(--ink)':pg.color }}>{v}</span>
            )))}
          </div>
          {!model.vacation && <button className="sans" style={{ alignSelf:'flex-start', padding:'14px 36px', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', transition:'background 0.3s' }} onMouseEnter={e=>e.target.style.background='var(--rose)'} onMouseLeave={e=>e.target.style.background='var(--charcoal)'}>Contact {model.name.split(' ')[0]}</button>}
        </div>
      </div>

      <div className="grid-pad" style={{ maxWidth:1100, margin:'0 auto' }}>
        <div className="profile-stats">
          {categories.map((cat,ci) => (
            <div key={cat.id} className={`fade-up stagger-${ci+1}`}>
              <div className="serif" style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', color:'var(--rose)', textTransform:'uppercase', marginBottom:20, paddingBottom:10, borderBottom:'1px solid var(--sand)' }}>{cat.title}</div>
              {cat.fields.map(f => (
                <div key={f.key} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <span className="sans" style={{ fontSize:12, fontWeight:500, color:'var(--muted)', letterSpacing:'0.03em' }}>{f.label}</span>
                  <span className="sans" style={{ fontSize:13, fontWeight:700, color:'var(--charcoal)' }}>{model[f.key]||'—'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-pad" style={{ maxWidth:1200, margin:'0 auto', paddingTop:0 }}>
        <div className="serif" style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', color:'var(--rose)', textTransform:'uppercase', marginBottom:28 }}>Portfolio</div>
        <div className="profile-gallery">
          {model.gallery.map((img,i) => { const gc=(model.galleryCrops||[])[i]; return <div key={i} className="gallery-item" onClick={() => setLb(i)}><img src={img} alt="" style={gc?{objectFit:'cover',objectPosition:`${gc.x}% ${gc.y}%`,transform:`scale(${gc.zoom/100})`,transformOrigin:`${gc.x}% ${gc.y}%`}:{}} /></div>; })}
        </div>
      </div>

      {/* Groups this model belongs to */}
      {(()=>{const mg=(groups||[]).filter(g=>(g.memberIds||[]).includes(model.id)); return mg.length>0 ? (
        <div className="grid-pad" style={{ maxWidth:1200, margin:'0 auto', paddingTop:0 }}>
          <div className="serif" style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', color:'var(--rose)', textTransform:'uppercase', marginBottom:20 }}>Also available as</div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {mg.map(g=>{
              const badge=g.badgeLabel||((g.memberIds||[]).length===2?'DUO':(g.memberIds||[]).length===3?'TRIO':'GROUP');
              return <div key={g.id} onClick={()=>onSelectGroup&&onSelectGroup(g)} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 20px 12px 12px', border:'1px solid var(--sand)', cursor:'pointer', transition:'border-color 0.2s', background:'#181716' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--rose)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--sand)'}>
                <img src={g.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#2a2622"/></svg>')} alt="" style={{ width:56, height:56, objectFit:'cover' }} />
                <div>
                  <span className="sans" style={{ padding:'2px 8px', fontSize:8, fontWeight:800, letterSpacing:'0.1em', background:'var(--rose)', color:'#181716', textTransform:'uppercase', marginBottom:4, display:'inline-block' }}>{badge}</span>
                  <div className="sans" style={{ fontSize:14, fontWeight:700, color:'var(--charcoal)', marginTop:2 }}>{g.name}</div>
                </div>
              </div>;
            })}
          </div>
        </div>
      ) : null;})()}

      {lb!==null && (
        <div onClick={() => setLb(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.96)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out', backdropFilter:'blur(20px)' }}>
          <button onClick={e=>{e.stopPropagation();setLb(Math.max(0,lb-1));}} className="sans" style={{ position:'absolute', left:24, background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', width:44, height:44, cursor:'pointer', fontSize:18 }}>‹</button>
          <img src={model.gallery[lb]} alt="" style={{ maxHeight:'88vh', maxWidth:'88vw', objectFit:'contain' }} />
          <button onClick={e=>{e.stopPropagation();setLb(Math.min(model.gallery.length-1,lb+1));}} className="sans" style={{ position:'absolute', right:24, background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', width:44, height:44, cursor:'pointer', fontSize:18 }}>›</button>
          <span className="sans" style={{ position:'absolute', bottom:28, color:'rgba(255,255,255,0.3)', fontSize:11, letterSpacing:'0.15em' }}>{lb+1} / {model.gallery.length}</span>
        </div>
      )}
    </div>
  );
};

/* ─── GROUP PROFILE PAGE ─── */
const GroupProfilePage = ({ group, models, categories, pillGroups, onBack, onSelectModel }) => {
  const [lb, setLb] = useState(null);
  const members = (group.memberIds||[]).map(id=>models.find(m=>m.id===id)).filter(Boolean);
  const badgeLabel = group.badgeLabel || (members.length===2?'DUO':members.length===3?'TRIO':'GROUP');
  return (
    <div className="grain" style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <div className="nav-pad" style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(14,13,12,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="sans" style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase' }}>← Back</button>
        <div className="serif" style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.01em', color:'var(--charcoal)' }}>K<span style={{ color:'var(--rose)' }}>peach</span>girl</div>
        <div style={{ width:60 }} />
      </div>
      <div className="fade-up" style={{ paddingTop:72, display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'70vh' }}>
        <div style={{ position:'relative', overflow:'hidden', minHeight:350 }}>
          <img src={group.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="700" height="400"><rect width="700" height="400" fill="#2a2622"/></svg>')} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', minHeight:350 }} />
          <span className="sans" style={{ position:'absolute', top:16, left:16, background:'var(--rose)', padding:'4px 14px', fontSize:10, fontWeight:800, letterSpacing:'0.12em', color:'#181716', textTransform:'uppercase' }}>{badgeLabel}</span>
        </div>
        <div className="profile-info-pad" style={{ display:'flex', flexDirection:'column', justifyContent:'center', position:'relative' }}>
          <div className="sans" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'var(--rose)', textTransform:'uppercase', marginBottom:12 }}>{badgeLabel} Profile</div>
          <h1 className="serif profile-name" style={{ fontWeight:300, lineHeight:1, letterSpacing:'-0.03em', color:'var(--charcoal)', marginBottom:20 }}>{group.name}</h1>
          <p className="sans" style={{ fontSize:15, lineHeight:1.85, color:'var(--muted)', maxWidth:440, marginBottom:24 }}>{group.bio}</p>
          {/* Tag pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:24 }}>
            {(pillGroups||[]).map(pg=>(group[pg.dataKey]||[]).map(v=>(
              <span key={pg.id+v} className="sans" style={{ padding:'5px 14px', border:`1px solid ${pg.color==='var(--charcoal)'?'var(--sand)':pg.color+'33'}`, fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:pg.color==='var(--charcoal)'?'var(--ink)':pg.color }}>{v}</span>
            )))}
          </div>
          {/* Members */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {members.map(m=>(
              <div key={m.id} onClick={()=>onSelectModel(m)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px 8px 8px', border:'1px solid var(--sand)', cursor:'pointer', transition:'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--rose)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--sand)'}>
                <img src={m.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="#2a2622"/></svg>')} alt="" style={{ width:36, height:36, objectFit:'cover' }} />
                <div>
                  <div className="sans" style={{ fontSize:12, fontWeight:700, color:'var(--charcoal)' }}>{m.name}</div>
                  <div className="sans" style={{ fontSize:10, color:'var(--muted)' }}>{m.region}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category stats */}
      {categories.some(cat=>cat.fields.some(ff=>group[ff.key])) && (
        <div className="grid-pad" style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="profile-stats">
            {categories.map((cat,ci) => {
              const hasData = cat.fields.some(ff=>group[ff.key]);
              if(!hasData) return null;
              return (
              <div key={cat.id} className={`fade-up stagger-${ci+1}`}>
                <div className="serif" style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', color:'var(--rose)', textTransform:'uppercase', marginBottom:20, paddingBottom:10, borderBottom:'1px solid var(--sand)' }}>{cat.title}</div>
                {cat.fields.map(ff => (
                  <div key={ff.key} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span className="sans" style={{ fontSize:12, fontWeight:500, color:'var(--muted)', letterSpacing:'0.03em' }}>{ff.label}</span>
                    <span className="sans" style={{ fontSize:13, fontWeight:700, color:'var(--charcoal)' }}>{group[ff.key]||'—'}</span>
                  </div>
                ))}
              </div>
            );})}
          </div>
        </div>
      )}

      {(group.gallery||[]).length > 0 && <div className="grid-pad" style={{ maxWidth:1200, margin:'0 auto', paddingTop:0 }}>
        <div className="serif" style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', color:'var(--rose)', textTransform:'uppercase', marginBottom:28 }}>Gallery</div>
        <div className="profile-gallery">
          {group.gallery.map((img,i) => <div key={i} className="gallery-item" onClick={()=>setLb(i)}><img src={img} alt="" /></div>)}
        </div>
      </div>}
      {lb!==null && (
        <div onClick={()=>setLb(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.96)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out', backdropFilter:'blur(20px)' }}>
          <button onClick={e=>{e.stopPropagation();setLb(Math.max(0,lb-1));}} className="sans" style={{ position:'absolute', left:24, background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', width:44, height:44, cursor:'pointer', fontSize:18 }}>‹</button>
          <img src={group.gallery[lb]} alt="" style={{ maxHeight:'88vh', maxWidth:'88vw', objectFit:'contain' }} />
          <button onClick={e=>{e.stopPropagation();setLb(Math.min(group.gallery.length-1,lb+1));}} className="sans" style={{ position:'absolute', right:24, background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', width:44, height:44, cursor:'pointer', fontSize:18 }}>›</button>
          <span className="sans" style={{ position:'absolute', bottom:28, color:'rgba(255,255,255,0.3)', fontSize:11, letterSpacing:'0.15em' }}>{lb+1} / {group.gallery.length}</span>
        </div>
      )}
    </div>
  );
};

/* ─── ADMIN ─── */
const FI = ({ value, onChange, type='text', placeholder='', rows=3 }) => {
  const base = { width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif', fontWeight:500 };
  return type==='textarea' ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} style={{...base,resize:'vertical',minHeight:60}}/> : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>;
};

/* ─── PHOTO EDITOR (focal point + zoom) ─── */
const PhotoEditor = ({ src, crop, aspect, onSave, onCancel, t }) => {
  const [pos, setPos] = useState({ x: (crop&&crop.x) || 50, y: (crop&&crop.y) || 50 });
  const [zoom, setZoom] = useState((crop&&crop.zoom) || 100);
  const dragging = useRef(false);
  const frameRef = useRef(null);

  const handleMove = (clientX, clientY) => {
    if (!dragging.current || !frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    setPos({ x, y });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.88)', backdropFilter:'blur(12px)' }}>
      <div className="sans" style={{ background:'#181716', maxWidth:520, width:'90%', maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--sand)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:700, fontSize:13, color:'var(--charcoal)' }}>{t.editPhoto||"Edit Photo"}</div>
          <button onClick={onCancel} style={{ background:'none', border:'1px solid var(--sand)', width:28, height:28, cursor:'pointer', fontSize:14, color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif' }}>×</button>
        </div>

        {/* Preview frame */}
        <div style={{ padding:'20px 24px' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8 }}>{t.focalPoint||"Click to set focal point"}</p>
          <div ref={frameRef} style={{ position:'relative', width:'100%', aspectRatio:aspect||'2/3', overflow:'hidden', border:'1px solid var(--sand)', cursor:'crosshair', background:'#000' }}
            onMouseDown={()=>{dragging.current=true;}}
            onMouseUp={()=>{dragging.current=false;}}
            onMouseLeave={()=>{dragging.current=false;}}
            onMouseMove={e=>handleMove(e.clientX, e.clientY)}
            onClick={e=>{const r=frameRef.current.getBoundingClientRect();setPos({x:Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)),y:Math.max(0,Math.min(100,((e.clientY-r.top)/r.height)*100))});}}>
            <img src={src} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:`${pos.x}% ${pos.y}%`, transform:`scale(${zoom/100})`, transformOrigin:`${pos.x}% ${pos.y}%`, transition:'transform 0.15s ease' }} />
            {/* Crosshair indicator */}
            <div style={{ position:'absolute', left:`${pos.x}%`, top:`${pos.y}%`, transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:2 }}>
              <div style={{ width:24, height:24, border:'2px solid #fff', borderRadius:'50%', boxShadow:'0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
              <div style={{ position:'absolute', left:11, top:-8, width:2, height:8, background:'#181716', boxShadow:'0 0 2px rgba(0,0,0,0.5)' }} />
              <div style={{ position:'absolute', left:11, top:24, width:2, height:8, background:'#181716', boxShadow:'0 0 2px rgba(0,0,0,0.5)' }} />
              <div style={{ position:'absolute', top:11, left:-8, width:8, height:2, background:'#181716', boxShadow:'0 0 2px rgba(0,0,0,0.5)' }} />
              <div style={{ position:'absolute', top:11, left:24, width:8, height:2, background:'#181716', boxShadow:'0 0 2px rgba(0,0,0,0.5)' }} />
            </div>
          </div>

          {/* Zoom slider */}
          <div style={{ marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase' }}>{t.zoom||"Zoom"}</span>
              <span style={{ fontSize:12, color:'var(--charcoal)', fontWeight:600 }}>{zoom}%</span>
            </div>
            <input type="range" min="100" max="200" value={zoom} onChange={e=>setZoom(parseInt(e.target.value))} style={{ width:'100%', accentColor:'var(--rose)' }} />
          </div>

          {/* Position readout */}
          <div style={{ display:'flex', gap:16, marginTop:12 }}>
            <div style={{ fontSize:11, color:'var(--muted)' }}>X: <strong style={{ color:'var(--charcoal)' }}>{Math.round(pos.x)}%</strong></div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>Y: <strong style={{ color:'var(--charcoal)' }}>{Math.round(pos.y)}%</strong></div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:'12px 24px', borderTop:'1px solid var(--sand)', display:'flex', gap:10 }}>
          <button onClick={()=>onSave({x:Math.round(pos.x), y:Math.round(pos.y), zoom})} style={{ flex:1, padding:'10px 0', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.applyCrop||"Apply"}</button>
          <button onClick={()=>{setPos({x:50,y:50});setZoom(100);}} style={{ padding:'10px 16px', border:'1px solid var(--sand)', background:'transparent', color:'var(--muted)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.resetCrop||"Reset"}</button>
          <button onClick={onCancel} style={{ padding:'10px 16px', border:'1px solid var(--sand)', background:'transparent', color:'var(--muted)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── ADMIN LOGIN ─── */
const ADMIN_EMAIL = "admin@kpeachgirl.com"; // Production: replace with Supabase auth
const ADMIN_PASS = "kpeach2026"; // Production: replace with Supabase auth

const LoginPage = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);

  const handleLogin = () => {
    setError("");
    setLoading(true);
    // Production: replace with supabase.auth.signInWithPassword({ email, password: pass })
    setTimeout(() => {
      if (email.toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
        onLogin({ email, role: "admin" });
      } else {
        setError("Invalid credentials");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="sans grain" style={{ position:'fixed', inset:0, zIndex:9999, background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center' }}>

      <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:`repeating-linear-gradient(0deg, var(--charcoal) 0px, var(--charcoal) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, var(--charcoal) 0px, var(--charcoal) 1px, transparent 1px, transparent 80px)` }} />
      <div style={{ position:'relative', width:'100%', maxWidth:400, padding:'48px 40px', background:'#181716', border:'1px solid var(--sand)', transform:show?'translateY(0)':'translateY(20px)', opacity:show?1:0, transition:'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div className="serif" style={{ fontSize:36, fontWeight:300, letterSpacing:'-0.02em', color:'var(--charcoal)', lineHeight:1 }}>K<span style={{ color:'var(--rose)' }}>peach</span>girl</div>
          <div style={{ width:40, height:1, background:'var(--rose)', margin:'16px auto' }} />
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'var(--rose)', textTransform:'uppercase' }}>Admin Portal</div>
        </div>

        {/* Form */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6 }}>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            placeholder="admin@kpeachgirl.com"
            style={{ width:'100%', padding:'12px 16px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:14, fontFamily:'Manrope,sans-serif', fontWeight:500 }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6 }}>Password</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            placeholder="Enter password"
            style={{ width:'100%', padding:'12px 16px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:14, fontFamily:'Manrope,sans-serif', fontWeight:500 }} />
        </div>

        {error && <div style={{ padding:'10px 14px', background:'rgba(184,92,107,0.08)', border:'1px solid rgba(184,92,107,0.2)', color:'var(--rose)', fontSize:12, fontWeight:600, marginBottom:16, letterSpacing:'0.03em' }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading||!email||!pass}
          style={{ width:'100%', padding:'14px 0', background:loading?'var(--muted)':(!email||!pass)?'var(--sand)':'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:(!email||!pass)?'default':'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.3s' }}
          onMouseEnter={e=>{if(email&&pass&&!loading)e.target.style.background='var(--rose)';}} onMouseLeave={e=>{if(email&&pass&&!loading)e.target.style.background='var(--charcoal)';}}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <button onClick={onBack} style={{ width:'100%', padding:'12px 0', marginTop:8, background:'transparent', color:'var(--sand)', border:'1px solid var(--sand)', fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>← Back to Site</button>

        <p style={{ fontSize:10, color:'var(--sand)', marginTop:24, textAlign:'center', lineHeight:1.5 }}>Authorized personnel only. All sessions are logged.</p>
      </div>
    </div>
  );
};

/* ─── REGISTRATION FORM ─── */
const RegistrationForm = ({ formConfig, onSubmit, onBack, areas, pillGroups }) => {
  const fc = formConfig || DEFAULT_FORM_FIELDS;
  const [f, setF] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);
  const up = (k,v) => setF(p=>({...p,[k]:v}));
  const shootTypes = (pillGroups||[]).find(pg=>pg.dataKey==='types');
  const typeOptions = shootTypes ? shootTypes.options : [];
  const reqFields = fc.fields.filter(ff=>ff.required).map(ff=>ff.id);
  const canSubmit = reqFields.every(k=>f[k]&&f[k].length>0);

  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);

  const handleSubmit = () => {
    if(!canSubmit) return;
    setSubmitting(true);
    setTimeout(()=>{ onSubmit({...f, id:Date.now(), status:'new', submittedAt:new Date().toLocaleDateString()}); setDone(true); setSubmitting(false); }, 800);
  };

  const ls = { display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6, fontFamily:'Manrope,sans-serif' };
  const is = { width:'100%', padding:'12px 16px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:14, fontFamily:'Manrope,sans-serif', fontWeight:500 };

  const renderField = (ff) => {
    if(ff.type==='file_upload') {
      const fileData = f[ff.id];
      return <div>
        {ff.helperText && <p style={{ fontSize:11, color:'var(--muted)', lineHeight:1.6, marginBottom:12, padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>{ff.helperText}</p>}
        <div style={{ position:'relative', border:'1px dashed var(--sand)', background:'rgba(255,255,255,0.02)', padding:fileData?0:32, cursor:'pointer', overflow:'hidden' }} onClick={()=>(document.getElementById('ff-'+ff.id)&&document.getElementById('ff-'+ff.id).click())}>
          {fileData ? <>
            <img src={fileData} alt="" style={{ width:'100%', maxHeight:300, objectFit:'contain', display:'block' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:1 }}>
              <div style={{ flex:1, padding:'8px 0', background:'rgba(0,0,0,0.8)', color:'#fff', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', textAlign:'center', fontFamily:'Manrope,sans-serif' }}>Uploaded ✓</div>
              <button onClick={e=>{e.stopPropagation();up(ff.id,'');}} style={{ padding:'8px 16px', background:'rgba(0,0,0,0.8)', color:'var(--rose)', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>Remove</button>
            </div>
          </> : <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:32, color:'var(--sand)', marginBottom:8, lineHeight:1 }}>↑</div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--muted)', fontFamily:'Manrope,sans-serif' }}>Click to upload photo</div>
            <div style={{ fontSize:10, color:'var(--sand)', marginTop:4, fontFamily:'Manrope,sans-serif' }}>JPG, PNG up to 10MB</div>
          </div>}
        </div>
        <input id={'ff-'+ff.id} type="file" accept="image/*" onChange={e=>{const file=(e.target.files&&e.target.files[0]);if(!file)return;const r=new FileReader();r.onload=()=>up(ff.id,r.result);r.readAsDataURL(file);e.target.value='';}} style={{ display:'none' }} />
      </div>;
    }
    if(ff.type==='area_select') return <select value={f[ff.id]||''} onChange={e=>up(ff.id,e.target.value)} style={is}><option value="">{ff.placeholder||'Select...'}</option>{areas.map(a=><option key={a} value={a}>{a}</option>)}</select>;
    if(ff.type==='exp_select') return <select value={f[ff.id]||''} onChange={e=>up(ff.id,e.target.value)} style={is}><option value="">{ff.placeholder||'Select...'}</option>{["Beginner","Intermediate","Experienced","Professional"].map(o=><option key={o} value={o}>{o}</option>)}</select>;
    if(ff.type==='type_pills') return <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>{typeOptions.map(st=>{const on=(f[ff.id]||[]).includes(st);return <button key={st} type="button" onClick={()=>up(ff.id,on?(f[ff.id]||[]).filter(x=>x!==st):[...(f[ff.id]||[]),st])} style={{padding:'6px 16px',fontSize:11,fontWeight:on?700:500,cursor:'pointer',border:on?'1px solid var(--charcoal)':'1px solid var(--sand)',background:on?'var(--charcoal)':'transparent',color:on?'var(--cream)':'var(--muted)',letterSpacing:'0.04em',fontFamily:'Manrope,sans-serif',transition:'all 0.15s'}}>{st}</button>;})}</div>;
    if(ff.type==='textarea') return <textarea value={f[ff.id]||''} onChange={e=>up(ff.id,e.target.value)} rows={4} placeholder={ff.placeholder} style={{...is,resize:'vertical',minHeight:80}} />;
    return <input type={ff.type==='email'?'email':'text'} value={f[ff.id]||''} onChange={e=>up(ff.id,e.target.value)} placeholder={ff.placeholder} style={is} />;
  };

  // Group fields by rows based on width
  const rows = [];
  let currentRow = [];
  let currentWidth = 0;
  fc.fields.forEach(ff => {
    const w = ff.width==='third'?1:ff.width==='half'?1.5:3;
    if(currentWidth+w>3 && currentRow.length>0){ rows.push(currentRow); currentRow=[]; currentWidth=0; }
    currentRow.push(ff); currentWidth+=w;
  });
  if(currentRow.length) rows.push(currentRow);

  if(done) return (
    <div className="sans grain" style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:440, padding:'56px 40px', transform:show?'translateY(0)':'translateY(20px)', opacity:show?1:0, transition:'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:24, color:'#181716' }}>✓</div>
        <div className="serif" style={{ fontSize:32, fontWeight:300, color:'var(--charcoal)', marginBottom:8 }}>{fc.successTitle}</div>
        <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7, marginBottom:32 }}>{fc.successMsg}</p>
        <button onClick={onBack} style={{ padding:'12px 32px', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>Back to Site</button>
      </div>
    </div>
  );

  return (
    <div className="sans grain" style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <div style={{ padding:'16px 32px', borderBottom:'1px solid var(--sand)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#181716' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>← Back</button>
          <span className="serif" style={{ fontSize:22, fontWeight:400, color:'var(--charcoal)' }}>K<span style={{color:'var(--rose)'}}>peach</span>girl</span>
        </div>
      </div>
      <div style={{ maxWidth:600, margin:'0 auto', padding:'48px 24px 80px', transform:show?'translateY(0)':'translateY(20px)', opacity:show?1:0, transition:'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div className="serif" style={{ fontSize:36, fontWeight:300, color:'var(--charcoal)', marginBottom:4 }}>{fc.title}</div>
          <div style={{ width:40, height:1, background:'var(--rose)', margin:'16px auto' }} />
          <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7, maxWidth:440, margin:'0 auto' }}>{fc.subtitle}</p>
        </div>
        <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:32 }}>
          {rows.map((row,ri) => {
            const cols = row.map(ff=>ff.width==='third'?'1fr':ff.width==='half'?'1fr':'1fr').join(' ');
            return (
            <div key={ri} style={{ display:'grid', gridTemplateColumns:row.length>1?cols:'1fr', gap:'16px 20px', marginBottom:20 }}>
              {row.map(ff=>(
                <div key={ff.id} style={ff.width==='full'?{gridColumn:'1/-1'}:{}}>
                  <label style={ls}>{ff.label} {ff.required && <span style={{color:'var(--rose)'}}>*</span>}</label>
                  {renderField(ff)}
                </div>
              ))}
            </div>
          );})}
          <button onClick={handleSubmit} disabled={submitting||!canSubmit}
            style={{ width:'100%', padding:'14px 0', background:submitting?'var(--muted)':!canSubmit?'var(--sand)':'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:!canSubmit?'default':'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.3s' }}
            onMouseEnter={e=>{if(canSubmit&&!submitting)e.target.style.background='var(--rose)';}}
            onMouseLeave={e=>{if(canSubmit&&!submitting)e.target.style.background='var(--charcoal)';}}>
            {submitting ? 'Submitting...' : fc.submitLabel}
          </button>
        </div>
        <p style={{ fontSize:10, color:'var(--sand)', textAlign:'center', marginTop:20, lineHeight:1.5 }}>By submitting, you confirm you are 18+ and consent to your information being reviewed by the Kpeachgirl team. All information is kept confidential.</p>
      </div>
    </div>
  );
};

const T = {
  en: {
    back:"← Site", admin:"Admin", tabModels:"Models", tabCategories:"Profile Fields", tabAreas:"Areas",
    tabGroups:"Groups",
    grpTitle:"Group Profiles", grpDesc:"Create duo, trio, or group profiles for models who work together.",
    grpNew:"+ New Group", grpName:"Group Name", grpBio:"Group Description", grpMembers:"Members",
    grpAddMember:"+ Add Member", grpGallery:"Group Gallery", grpBadgeLabel:"Badge Label",
    grpBadgeAuto:"Auto (DUO/TRIO/GROUP)", grpDelete:"Delete Group", grpNone:"No groups yet",
    worksIn:"Also available as",
    total:"Total", verified:"Verified", onVacation:"On Vacation", pending:"Pending",
    filterAll:"All", filterVerified:"Verified", filterVacation:"Vacation",
    thName:"Name", thArea:"Area", thLevel:"Level", thVerified:"Verified", thVacation:"Vacation",
    edit:"Edit", editing:"Editing",
    catTitle:"Profile Categories & Fields",
    catDesc:"Edit section titles, rename field labels, add or remove fields. Changes update the live profile page instantly.",
    addSection:"+ Add Section", sectionTitle:"Section Title", remove:"Remove",
    fieldKey:"Key", addField:"+ Add Field",
    newFieldLabel:"New Field", newSectionTitle:"New Section",
    areasTitle:"Manage Areas",
    areasDesc:'These appear as filter pills on the public browse page. "All" is always included.',
    areasPlaceholder:"e.g., Silver Lake, Koreatown...", add:"Add",
    identity:"Identity", biography:"Biography",
    fullName:"Full Name", area:"Area", parentRegion:"Parent Region", experience:"Experience",
    expBeginner:"Beginner", expIntermediate:"Intermediate", expExperienced:"Experienced", expProfessional:"Professional",
    saved:"✓ Saved — Live", savePublish:"Save & Publish", cancel:"Cancel",
    tabSubmissions:"Submissions",
    subTitle:"Membership Form Submissions", subDesc:"Submissions from models who received your membership form link. Review, approve, or dismiss.",
    subNew:"New", subReviewed:"Reviewed", subApproved:"Approved", subDismissed:"Dismissed",
    subMarkReviewed:"Mark Reviewed", subApprove:"Approve", subDismiss:"Dismiss", subConvert:"Convert to Profile",
    subNone:"No submissions yet", subDate:"Submitted", subStatus:"Status",
    subShareTitle:"Share Membership Form", subShareDesc:"Send this link to models you want to onboard. The form is not visible on the public site.", subCopyLink:"Copy Link", subCopied:"Copied!",
    formEditor:"Membership Form", formEditorDesc:"Customize the fields, labels, and text on the membership form that gets sent to models.",
    formTitle:"Form Title", formSubtitle:"Form Description", formSuccessTitle:"Success Title", formSuccessMsg:"Success Message", formSubmitLabel:"Submit Button Text",
    formFields:"Form Fields", formFieldLabel:"Label", formFieldType:"Type", formFieldReq:"Required", formFieldWidth:"Width",
    formAddField:"+ Add Field", formFieldPh:"Placeholder",
    ftText:"Text", ftEmail:"Email", ftTextarea:"Long Text", ftAreaSelect:"Area Dropdown", ftExpSelect:"Experience Dropdown", ftTypePills:"Type Pills", ftFileUpload:"Photo Upload",
    fwFull:"Full", fwHalf:"Half", fwThird:"Third",
    regTitle:"Model Membership Form", regSubtitle:"Kpeachgirl Model Directory",
    regDesc:"You've been invited to submit your information for consideration on our platform. Fill out the form below and our team will review within 48 hours.",
    regName:"Full Name", regEmail:"Email", regPhone:"Phone", regAge:"Age", regHeight:"Height",
    regRegion:"Preferred Area", regExp:"Experience Level", regTypes:"Shoot Types (select all that apply)",
    regBio:"Tell us about yourself", regBioPlaceholder:"Your experience, style, what you bring to a shoot...",
    regSocial:"Instagram / Social", regSubmit:"Submit Application", regSubmitting:"Submitting...",
    regSuccess:"Application Submitted!", regSuccessMsg:"Thank you! Our team will review your application and contact you within 48 hours.",
    regBack:"← Back to Site", regRequired:"Required",
    cardDisplay:"Card Display", cardDisplayDesc:"Control what appears on model cards on the homepage.",
    subtitleFields:"Subtitle Fields", subtitleDesc:"Choose which info shows below the model's name.",
    sfRegion:"Region", sfType:"Primary Type", sfExp:"Experience", sfAge:"Age",
    badges:"Badges", showVerified:"Show Verified Badge", showAway:"Show Away Badge",
    verifiedLabelT:"Verified Label", awayLabelT:"Away Label",
    overlay:"Card Overlay", overlayColor:"Gradient Color", overlayOpacity:"Opacity",
    heroSettings:"Hero Banner", heroSettingsDesc:"Edit the main banner image and headline text on the homepage.",
    heroImage:"Banner Image", heroSubtitle:"Subtitle Text", heroLine1:"Title Line 1", heroLine2:"Title Line 2", heroAccent:"Accent Word (italic)", heroSearchPh:"Search Placeholder",
    newModel:"+ New Model", deleteModel:"Delete Model", deleteConfirm:"Are you sure? This cannot be undone.",
    pillGroups:"Tag Groups", pillGroupsDesc:"Customizable tag sections that appear on profiles. Rename titles, add/remove options, or create new groups.",
    groupTitle:"Group Title", groupColor:"Accent Color", addOption:"+ Add Option", addGroup:"+ Add Group", newGroupTitle:"New Group", newOption:"New Option", dataKey:"Data Key",
    photos:"Photos", profilePhoto:"Profile Photo", coverPhoto:"Cover Photo", galleryPhotos:"Gallery",
    uploadPhoto:"Upload", removePhoto:"Remove", dragOrClick:"Click to upload image", galleryAdd:"+ Add to Gallery",
    editPhoto:"Edit Photo", focalPoint:"Click or drag to set focal point", zoom:"Zoom", applyCrop:"Apply", resetCrop:"Reset", editBtn:"Edit",
  },
  ko: {
    back:"← 사이트", admin:"관리자", tabModels:"모델 관리", tabCategories:"프로필 항목", tabAreas:"지역 관리",
    tabGroups:"그룹",
    grpTitle:"그룹 프로필", grpDesc:"함께 활동하는 모델의 듀오, 트리오, 그룹 프로필을 만드세요.",
    grpNew:"+ 새 그룹", grpName:"그룹 이름", grpBio:"그룹 설명", grpMembers:"멤버",
    grpAddMember:"+ 멤버 추가", grpGallery:"그룹 갤러리", grpBadgeLabel:"배지 라벨",
    grpBadgeAuto:"자동 (DUO/TRIO/GROUP)", grpDelete:"그룹 삭제", grpNone:"아직 그룹이 없습니다",
    worksIn:"그룹 활동",
    total:"전체", verified:"인증됨", onVacation:"휴가중", pending:"대기중",
    filterAll:"전체", filterVerified:"인증", filterVacation:"휴가",
    thName:"이름", thArea:"지역", thLevel:"경력", thVerified:"인증", thVacation:"휴가",
    edit:"수정", editing:"수정 중",
    catTitle:"프로필 카테고리 및 항목",
    catDesc:"섹션 제목을 수정하고, 항목 이름을 변경하고, 항목을 추가하거나 삭제하세요. 변경 사항은 즉시 라이브 프로필에 반영됩니다.",
    addSection:"+ 섹션 추가", sectionTitle:"섹션 제목", remove:"삭제",
    fieldKey:"키", addField:"+ 항목 추가",
    newFieldLabel:"새 항목", newSectionTitle:"새 섹션",
    areasTitle:"지역 관리",
    areasDesc:'공개 페이지의 필터 버튼으로 표시됩니다. "전체"는 항상 포함됩니다.',
    areasPlaceholder:"예: 실버레이크, 코리아타운...", add:"추가",
    identity:"기본 정보", biography:"소개",
    fullName:"이름", area:"지역", parentRegion:"상위 지역", experience:"경력",
    expBeginner:"초급", expIntermediate:"중급", expExperienced:"경력", expProfessional:"전문가",
    saved:"✓ 저장 완료", savePublish:"저장 및 게시", cancel:"취소",
    tabSubmissions:"신청서",
    subTitle:"멤버십 신청서", subDesc:"멤버십 신청 링크를 받은 모델의 제출 내역입니다. 검토, 승인 또는 거절할 수 있습니다.",
    subNew:"신규", subReviewed:"검토됨", subApproved:"승인됨", subDismissed:"거절됨",
    subMarkReviewed:"검토 완료", subApprove:"승인", subDismiss:"거절", subConvert:"프로필로 전환",
    subNone:"아직 신청서가 없습니다", subDate:"제출일", subStatus:"상태",
    subShareTitle:"멤버십 신청서 공유", subShareDesc:"온보딩하려는 모델에게 이 링크를 보내세요. 이 양식은 공개 사이트에 표시되지 않습니다.", subCopyLink:"링크 복사", subCopied:"복사됨!",
    formEditor:"멤버십 양식", formEditorDesc:"모델에게 보내는 멤버십 양식의 항목, 라벨, 텍스트를 커스터마이즈합니다.",
    formTitle:"양식 제목", formSubtitle:"양식 설명", formSuccessTitle:"완료 제목", formSuccessMsg:"완료 메시지", formSubmitLabel:"제출 버튼 텍스트",
    formFields:"양식 항목", formFieldLabel:"라벨", formFieldType:"유형", formFieldReq:"필수", formFieldWidth:"너비",
    formAddField:"+ 항목 추가", formFieldPh:"플레이스홀더",
    ftText:"텍스트", ftEmail:"이메일", ftTextarea:"긴 텍스트", ftAreaSelect:"지역 드롭다운", ftExpSelect:"경력 드롭다운", ftTypePills:"유형 선택", ftFileUpload:"사진 업로드",
    fwFull:"전체", fwHalf:"절반", fwThird:"1/3",
    regTitle:"모델 멤버십 신청서", regSubtitle:"Kpeachgirl 모델 디렉토리",
    regDesc:"플랫폼 등록 검토를 위해 정보를 제출해 주세요. 48시간 이내에 검토 후 연락드리겠습니다.",
    regName:"이름", regEmail:"이메일", regPhone:"전화번호", regAge:"나이", regHeight:"키",
    regRegion:"선호 지역", regExp:"경력 수준", regTypes:"촬영 유형 (해당되는 것 모두 선택)",
    regBio:"자기소개", regBioPlaceholder:"경력, 스타일, 촬영에서의 강점...",
    regSocial:"인스타그램 / SNS", regSubmit:"신청서 제출", regSubmitting:"제출 중...",
    regSuccess:"신청이 완료되었습니다!", regSuccessMsg:"감사합니다! 48시간 이내에 신청서를 검토하고 연락드리겠습니다.",
    regBack:"← 사이트로 돌아가기", regRequired:"필수",
    cardDisplay:"카드 표시", cardDisplayDesc:"홈페이지 모델 카드에 표시되는 내용을 설정합니다.",
    subtitleFields:"부제목 항목", subtitleDesc:"모델 이름 아래에 표시할 정보를 선택하세요.",
    sfRegion:"지역", sfType:"주요 유형", sfExp:"경력", sfAge:"나이",
    badges:"배지", showVerified:"인증 배지 표시", showAway:"부재 배지 표시",
    verifiedLabelT:"인증 라벨", awayLabelT:"부재 라벨",
    overlay:"카드 오버레이", overlayColor:"그라데이션 색상", overlayOpacity:"투명도",
    heroSettings:"히어로 배너", heroSettingsDesc:"홈페이지 메인 배너 이미지와 헤드라인 텍스트를 편집합니다.",
    heroImage:"배너 이미지", heroSubtitle:"부제목 텍스트", heroLine1:"제목 1행", heroLine2:"제목 2행", heroAccent:"강조 단어 (이탤릭)", heroSearchPh:"검색 플레이스홀더",
    newModel:"+ 새 모델", deleteModel:"모델 삭제", deleteConfirm:"정말 삭제하시겠습니까? 되돌릴 수 없습니다.",
    pillGroups:"태그 그룹", pillGroupsDesc:"프로필에 표시되는 커스텀 태그 섹션입니다. 제목 변경, 옵션 추가/삭제, 새 그룹 생성이 가능합니다.",
    groupTitle:"그룹 제목", groupColor:"강조 색상", addOption:"+ 옵션 추가", addGroup:"+ 그룹 추가", newGroupTitle:"새 그룹", newOption:"새 옵션", dataKey:"데이터 키",
    photos:"사진", profilePhoto:"프로필 사진", coverPhoto:"커버 사진", galleryPhotos:"갤러리",
    uploadPhoto:"업로드", removePhoto:"삭제", dragOrClick:"클릭하여 이미지 업로드", galleryAdd:"+ 갤러리에 추가",
    editPhoto:"사진 편집", focalPoint:"클릭하거나 드래그하여 초점 설정", zoom:"확대", applyCrop:"적용", resetCrop:"초기화", editBtn:"편집",
  }
};

const AdminPanel = ({ onBack, onLogout, adminUser, areas, onUpdateAreas, categories, onUpdateCategories, cardSettings, onUpdateCardSettings, pillGroups, onUpdatePillGroups, heroSettings, onUpdateHero, submissions, onUpdateSubmissions, formConfig, onUpdateFormConfig, groups, onUpdateGroups }) => {
  const [models, setModels] = useState(MODELS.map(m=>({...m})));
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [newArea, setNewArea] = useState("");
  const [tab, setTab] = useState("models");
  const [lang, setLang] = useState("ko");
  const [editingPhoto, setEditingPhoto] = useState(null); // {key:'img'|'cover'|'gallery', idx?:number}
  const [linkCopied, setLinkCopied] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({});
  const t = T[lang];

  const toggle = (id,f) => setModels(p=>p.map(m=>m.id===id?{...m,[f]:!m[f]}:m));
  const open = m => { setEditing(m.id); setForm({...m}); setSaved(false); };
  const close = () => { setEditing(null); setForm({}); };
  const save = () => { setModels(p=>p.map(m=>m.id===form.id?{...form}:m)); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const addArea = () => { const v=newArea.trim(); if(v&&!areas.includes(v)){onUpdateAreas([...areas,v]);setNewArea("");} };

  const updateCatTitle = (cid,v) => onUpdateCategories(categories.map(c=>c.id===cid?{...c,title:v}:c));
  const updateFieldLabel = (cid,fk,v) => onUpdateCategories(categories.map(c=>c.id===cid?{...c,fields:c.fields.map(f=>f.key===fk?{...f,label:v}:f)}:c));
  const addField = cid => onUpdateCategories(categories.map(c=>c.id===cid?{...c,fields:[...c.fields,{key:`custom_${Date.now()}`,label:t.newFieldLabel}]}:c));
  const removeField = (cid,fk) => onUpdateCategories(categories.map(c=>c.id===cid?{...c,fields:c.fields.filter(f=>f.key!==fk)}:c));
  const addCategory = () => onUpdateCategories([...categories,{id:`cat_${Date.now()}`,title:t.newSectionTitle,fields:[{key:`field_${Date.now()}`,label:t.newFieldLabel}]}]);
  const removeCategory = cid => onUpdateCategories(categories.filter(c=>c.id!==cid));

  const filtered = models.filter(m => { if(filter==="verified")return m.verified; if(filter==="vacation")return m.vacation; if(filter==="la")return m.parentRegion==="LA"; if(filter==="oc")return m.parentRegion==="OC"; return true; });
  const ls = { fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', marginBottom:4, display:'block', fontFamily:'Manrope,sans-serif' };
  const expMap = { Beginner:t.expBeginner, Intermediate:t.expIntermediate, Experienced:t.expExperienced, Professional:t.expProfessional };

  const newModel = () => {
    const id = Date.now();
    const m = { id, name:"New Model", region:areas[0]||"LA", parentRegion:"LA", img:"", cover:"", types:[], compensation:[], verified:false, vacation:false, exp:"Beginner", age:"", height:"", weight:"", bust:"", waist:"", hips:"", hair:"", eyes:"", shoe:"", dress:"", tattoos:"None", piercings:"Ears", bio:"", gallery:[] };
    setModels(p=>[m,...p]);
    open(m);
  };
  const deleteModel = (id) => { if(window.window.confirm(t.deleteConfirm)){ setModels(p=>p.filter(m=>m.id!==id)); close(); } };
  const handlePhoto = (key, e) => {
    const file = (e.target.files&&e.target.files[0]); if(!file) return;
    const reader = new FileReader();
    reader.onload = () => upd(key, reader.result);
    reader.readAsDataURL(file);
  };
  const addGalleryPhoto = (e) => {
    const file = (e.target.files&&e.target.files[0]); if(!file) return;
    const reader = new FileReader();
    reader.onload = () => upd('gallery', [...(form.gallery||[]), reader.result]);
    reader.readAsDataURL(file);
  };
  const removeGalleryPhoto = (idx) => upd('gallery', (form.gallery||[]).filter((_,i)=>i!==idx));
  const handleHeroPhoto = (e) => {
    const file = (e.target.files&&e.target.files[0]); if(!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdateHero({...heroSettings, img: reader.result});
    reader.readAsDataURL(file);
  };
  const newGroup = () => { const g={id:Date.now(),name:"New Group",bio:"",img:"",memberIds:[],gallery:[],badgeLabel:""}; onUpdateGroups([...groups,g]); setEditingGroup(g.id); setGroupForm({...g}); };
  const saveGroup = () => { onUpdateGroups(groups.map(g=>g.id===groupForm.id?{...groupForm}:g)); setEditingGroup(null); };
  const deleteGroup = (id) => { onUpdateGroups(groups.filter(g=>g.id!==id)); setEditingGroup(null); };
  const handleGroupPhoto = (key, e) => { const file=(e.target.files&&e.target.files[0]); if(!file)return; const r=new FileReader(); r.onload=()=>setGroupForm(p=>({...p,[key]:r.result})); r.readAsDataURL(file); };
  const addGroupGallery = (e) => { const file=(e.target.files&&e.target.files[0]); if(!file)return; const r=new FileReader(); r.onload=()=>setGroupForm(p=>({...p,gallery:[...(p.gallery||[]),r.result]})); r.readAsDataURL(file); };

  return (
    <div className="sans grain" style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <div className="admin-nav-pad" style={{ borderBottom:'1px solid var(--sand)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#181716', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{t.back}</button>
          <span className="serif" style={{ fontSize:22, fontWeight:400 }}>K<span style={{color:'var(--rose)'}}>peach</span>girl</span>
          <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.18em', color:'var(--rose)', textTransform:'uppercase', background:'var(--rose-soft)', padding:'4px 12px' }}>{t.admin}</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div className="admin-tabs">
            {[["models",t.tabModels],["groups",t.tabGroups],["submissions",t.tabSubmissions],["categories",t.tabCategories],["areas",t.tabAreas]].map(([k,l]) => {
              const newCount = k==='submissions' ? submissions.filter(s=>s.status==='new').length : 0;
              return (
              <button key={k} onClick={()=>setTab(k)} style={{ padding:'8px 20px', background:tab===k?'var(--charcoal)':'transparent', color:tab===k?'var(--cream)':'var(--muted)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif', position:'relative' }}>
                {l}
                {newCount > 0 && <span style={{ position:'absolute', top:2, right:4, width:16, height:16, borderRadius:'50%', background:'var(--rose)', color:'#181716', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif' }}>{newCount}</span>}
              </button>
            );})}
          </div>
          {/* Language Toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:8, padding:'4px 4px', background:'rgba(255,255,255,0.05)', borderRadius:6 }}>
            <button onClick={()=>setLang('en')} style={{ padding:'5px 10px', borderRadius:4, border:'none', fontSize:10, fontWeight:800, letterSpacing:'0.06em', cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.2s', background:lang==='en'?'var(--charcoal)':'transparent', color:lang==='en'?'var(--cream)':'var(--muted)' }}>EN</button>
            <button onClick={()=>setLang('ko')} style={{ padding:'5px 10px', borderRadius:4, border:'none', fontSize:10, fontWeight:800, letterSpacing:'0.06em', cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.2s', background:lang==='ko'?'var(--charcoal)':'transparent', color:lang==='ko'?'var(--cream)':'var(--muted)' }}>한국어</button>
          </div>
          {/* User + Logout */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:8, paddingLeft:12, borderLeft:'1px solid var(--sand)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, background:'var(--rose-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'var(--rose)', fontFamily:'Manrope,sans-serif' }}>{((adminUser&&adminUser.email)||'A')[0].toUpperCase()}</div>
              <span className="mob-hide" style={{ fontSize:11, color:'var(--muted)', fontWeight:600, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(adminUser&&adminUser.email)||'Admin'}</span>
            </div>
            <button onClick={onLogout} style={{ padding:'5px 12px', background:'transparent', border:'1px solid var(--sand)', color:'var(--muted)', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.borderColor='var(--rose)';e.target.style.color='var(--rose)';}} onMouseLeave={e=>{e.target.style.borderColor='var(--sand)';e.target.style.color='var(--muted)';}}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
        {tab==="models" && <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div/>
            <button onClick={newModel} style={{ padding:'10px 24px', background:'var(--rose)', color:'#0e0d0c', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.newModel}</button>
          </div>
          <div className="admin-stats" style={{ marginBottom:32, background:'var(--sand)' }}>
            {[{l:t.total,v:models.length},{l:t.verified,v:models.filter(m=>m.verified).length},{l:t.tabGroups,v:groups.length},{l:t.onVacation,v:models.filter(m=>m.vacation).length}].map(s=>(
              <div key={s.l} style={{ background:'#181716', padding:'24px 20px' }}>
                <div className="serif" style={{ fontSize:36, fontWeight:300, color:'var(--charcoal)' }}>{s.v}</div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', color:'var(--muted)', textTransform:'uppercase', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div className="filter-scroll" style={{ marginBottom:20 }}>
            {[["all",t.filterAll],["la","LA"],["oc","OC"],["verified",t.filterVerified],["vacation",t.filterVacation]].map(([k,l])=>(
              <button key={k} onClick={()=>setFilter(k)} style={{ padding:'6px 16px', border:filter===k?'1px solid var(--charcoal)':'1px solid var(--sand)', background:filter===k?'var(--charcoal)':'#181716', color:filter===k?'var(--cream)':'var(--muted)', fontSize:11, fontWeight:700, letterSpacing:'0.06em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{l}</button>
            ))}
          </div>
          <div style={{ background:'#181716', border:'1px solid var(--sand)', overflow:'hidden' }}>
            <div className="admin-table-row" style={{ padding:'12px 16px', borderBottom:'2px solid var(--sand)', fontSize:10, fontWeight:800, letterSpacing:'0.14em', color:'var(--muted)', textTransform:'uppercase' }}>
              <span/><span>{t.thName}</span><span className="mob-hide">{t.thArea}</span><span className="mob-hide">{t.thLevel}</span><span className="mob-hide" style={{textAlign:'center'}}>{t.thVerified}</span><span className="mob-hide" style={{textAlign:'center'}}>{t.thVacation}</span><span/>
            </div>
            {filtered.map(m=>(
              <div key={m.id} className="admin-table-row" style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', alignItems:'center', background:editing===m.id?'var(--rose-soft)':'#181716', transition:'background 0.15s' }}
                onMouseEnter={e=>{if(editing!==m.id)e.currentTarget.style.background='rgba(255,255,255,0.04)';}} onMouseLeave={e=>{if(editing!==m.id)e.currentTarget.style.background=editing===m.id?'var(--rose-soft)':'#181716';}}>
                <img src={m.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#d9cfc4"/></svg>')} alt="" style={{ width:32, height:32, objectFit:'cover', borderRadius:2 }} />
                <span style={{ fontWeight:700, fontSize:13, color:'var(--charcoal)' }}>{m.name}</span>
                <span className="mob-hide" style={{ fontSize:12, color:'var(--muted)' }}>{m.region}</span>
                <span className="mob-hide" style={{ fontSize:11, color:'var(--muted)' }}>{m.exp}</span>
                {[["verified","var(--sage)"],["vacation","var(--peach)"]].map(([f,c])=>(
                  <div key={f} className="mob-hide" style={{textAlign:'center'}}><button onClick={e=>{e.stopPropagation();toggle(m.id,f);}} style={{ width:36, height:20, borderRadius:10, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', background:m[f]?c:'var(--sand)' }}><span style={{ position:'absolute', top:2, left:m[f]?18:2, width:16, height:16, borderRadius:8, background:'#181716', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }}/></button></div>
                ))}
                <div style={{textAlign:'center'}}><button onClick={()=>open(m)} style={{ background:editing===m.id?'var(--rose)':'var(--charcoal)', border:'none', color:'var(--cream)', padding:'4px 12px', fontSize:10, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{t.edit}</button></div>
              </div>
            ))}
          </div>
        </>}

        {tab==="groups" && <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <div>
              <h2 className="serif cat-heading" style={{ fontWeight:300, color:'var(--charcoal)' }}>{t.grpTitle}</h2>
              <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{t.grpDesc}</p>
            </div>
            <button onClick={newGroup} style={{ padding:'10px 24px', background:'var(--rose)', color:'#0e0d0c', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.grpNew}</button>
          </div>

          {groups.length===0 ? (
            <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:'60px 20px', textAlign:'center' }}>
              <div className="serif" style={{ fontSize:24, fontWeight:300, color:'var(--sand)', marginBottom:8 }}>{t.grpNone}</div>
            </div>
          ) : (
            <div style={{ display:'grid', gap:12 }}>
              {groups.map(g=>{
                const badge=g.badgeLabel||((g.memberIds||[]).length===2?'DUO':(g.memberIds||[]).length===3?'TRIO':'GROUP');
                const isEditing=editingGroup===g.id;
                return <div key={g.id} style={{ background:'#181716', border:isEditing?'1px solid var(--rose)':'1px solid var(--sand)', overflow:'hidden' }}>
                  {!isEditing ? (
                    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
                      <img src={g.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#2a2622"/></svg>')} alt="" style={{ width:48, height:48, objectFit:'cover' }} />
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                          <span style={{ fontWeight:700, fontSize:14, color:'var(--charcoal)' }}>{g.name}</span>
                          <span className="sans" style={{ padding:'2px 8px', fontSize:8, fontWeight:800, letterSpacing:'0.1em', background:'var(--rose)', color:'#181716', textTransform:'uppercase' }}>{badge}</span>
                        </div>
                        <div style={{ fontSize:11, color:'var(--muted)' }}>{(g.memberIds||[]).length} members · {(g.gallery||[]).length} gallery photos</div>
                      </div>
                      <button onClick={()=>{setEditingGroup(g.id);setGroupForm({...g});}} style={{ padding:'6px 16px', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.edit}</button>
                    </div>
                  ) : (
                    <div style={{ padding:24 }}>
                      {/* Group name + badge */}
                      <div className="admin-edit-grid" style={{ marginBottom:16 }}>
                        <div><label style={ls}>{t.grpName}</label><input value={groupForm.name||''} onChange={e=>setGroupForm(p=>({...p,name:e.target.value}))} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
                        <div><label style={ls}>{t.grpBadgeLabel} <span style={{fontWeight:400,textTransform:'none',fontSize:9,color:'var(--sand)'}}>({t.grpBadgeAuto})</span></label><input value={groupForm.badgeLabel||''} onChange={e=>setGroupForm(p=>({...p,badgeLabel:e.target.value}))} placeholder="DUO / TRIO / custom..." style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
                      </div>

                      {/* Group photo */}
                      <div style={{ marginBottom:16 }}>
                        <label style={ls}>Group Photo</label>
                        <div style={{ position:'relative', width:200, aspectRatio:'1/1', border:'1px dashed var(--sand)', background:'rgba(255,255,255,0.02)', overflow:'hidden', cursor:'pointer' }} onClick={()=>(document.getElementById('grp-img-'+g.id)&&document.getElementById('grp-img-'+g.id).click())}>
                          {groupForm.img ? <img src={groupForm.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:11, color:'var(--sand)', fontFamily:'Manrope,sans-serif' }}>Click to upload</div>}
                          {groupForm.img && <button onClick={e=>{e.stopPropagation();setGroupForm(p=>({...p,img:''}));}} style={{ position:'absolute', top:4, right:4, width:20, height:20, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>}
                        </div>
                        <input id={'grp-img-'+g.id} type="file" accept="image/*" onChange={e=>handleGroupPhoto('img',e)} style={{ display:'none' }} />
                      </div>

                      {/* Bio */}
                      <div style={{ marginBottom:16 }}><label style={ls}>{t.grpBio}</label><textarea value={groupForm.bio||''} onChange={e=>setGroupForm(p=>({...p,bio:e.target.value}))} rows={3} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif', resize:'vertical' }} /></div>

                      {/* Tag groups (shoot types, compensation, etc.) */}
                      {pillGroups.map(pg=>(
                        <div key={pg.id} style={{ marginBottom:16 }}>
                          <label style={ls}>{pg.title}</label>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
                            {pg.options.map(opt=>{
                              const vals=groupForm[pg.dataKey]||[];
                              const on=vals.includes(opt);
                              return <button key={opt} type="button" onClick={()=>setGroupForm(p=>({...p,[pg.dataKey]:on?vals.filter(x=>x!==opt):[...vals,opt]}))} style={{ padding:'5px 14px', fontSize:11, fontWeight:on?700:500, cursor:'pointer', border:on?`1px solid ${pg.color}`:'1px solid var(--sand)', background:on?pg.color:'#181716', color:on?'var(--cream)':'var(--muted)', letterSpacing:'0.04em', fontFamily:'Manrope,sans-serif', transition:'all 0.15s' }}>{opt}</button>;
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Category fields */}
                      {categories.map(cat=>(
                        <div key={cat.id} style={{ marginBottom:16 }}>
                          <label style={ls}>{cat.title}</label>
                          <div className="admin-edit-grid" style={{ marginTop:4 }}>
                            {cat.fields.map(ff=>(
                              <div key={ff.key}><label style={{...ls,fontSize:9}}>{ff.label}</label><input value={groupForm[ff.key]||''} onChange={e=>setGroupForm(p=>({...p,[ff.key]:e.target.value}))} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Members */}
                      <div style={{ marginBottom:16 }}>
                        <label style={ls}>{t.grpMembers}</label>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
                          {(groupForm.memberIds||[]).map(mid=>{
                            const m=models.find(x=>x.id===mid);
                            return m ? <div key={mid} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 6px 6px 12px', border:'1px solid var(--sand)', background:'rgba(255,255,255,0.03)' }}>
                              <span style={{ fontSize:12, fontWeight:600, color:'var(--charcoal)' }}>{m.name}</span>
                              <button onClick={()=>setGroupForm(p=>({...p,memberIds:(p.memberIds||[]).filter(x=>x!==mid)}))} style={{ width:20, height:20, border:'1px solid var(--sand)', background:'none', color:'var(--muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif' }}>×</button>
                            </div> : null;
                          })}
                        </div>
                        <div style={{ marginTop:8 }}>
                          <select onChange={e=>{const v=parseInt(e.target.value);if(v&&!(groupForm.memberIds||[]).includes(v))setGroupForm(p=>({...p,memberIds:[...(p.memberIds||[]),v]}));e.target.value='';}} style={{ padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:12, fontFamily:'Manrope,sans-serif' }}>
                            <option value="">{t.grpAddMember}...</option>
                            {models.filter(m=>!(groupForm.memberIds||[]).includes(m.id)).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Gallery */}
                      <div style={{ marginBottom:20 }}>
                        <label style={ls}>{t.grpGallery} ({(groupForm.gallery||[]).length})</label>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginTop:8 }}>
                          {(groupForm.gallery||[]).map((img,i)=>(
                            <div key={i} style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', border:'1px solid var(--sand)' }}>
                              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              <button onClick={()=>setGroupForm(p=>({...p,gallery:(p.gallery||[]).filter((_,j)=>j!==i)}))} style={{ position:'absolute', top:4, right:4, width:18, height:18, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                            </div>
                          ))}
                          <div style={{ aspectRatio:'3/4', border:'1px dashed var(--sand)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>(document.getElementById('grp-gal-'+g.id)&&document.getElementById('grp-gal-'+g.id).click())}>
                            <span style={{ fontSize:20, color:'var(--sand)' }}>+</span>
                          </div>
                        </div>
                        <input id={'grp-gal-'+g.id} type="file" accept="image/*" onChange={e=>{addGroupGallery(e);e.target.value='';}} style={{ display:'none' }} />
                      </div>

                      {/* Actions */}
                      <div style={{ display:'flex', gap:10 }}>
                        <button onClick={saveGroup} style={{ flex:1, padding:'10px 0', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.savePublish}</button>
                        <button onClick={()=>setEditingGroup(null)} style={{ padding:'10px 20px', border:'1px solid var(--sand)', background:'transparent', color:'var(--muted)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.cancel}</button>
                        <button onClick={()=>deleteGroup(g.id)} style={{ padding:'10px 16px', border:'1px solid rgba(212,117,138,0.3)', background:'transparent', color:'var(--rose)', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.grpDelete}</button>
                      </div>
                    </div>
                  )}
                </div>;
              })}
            </div>
          )}
        </div>}

        {tab==="submissions" && <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <div>
              <h2 className="serif cat-heading" style={{ fontWeight:300, color:'var(--charcoal)' }}>{t.subTitle}</h2>
              <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{t.subDesc}</p>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ padding:'6px 14px', background:'var(--rose-soft)', fontSize:11, fontWeight:700, color:'var(--rose)', fontFamily:'Manrope,sans-serif' }}>{submissions.filter(s=>s.status==='new').length} {t.subNew}</div>
            </div>
          </div>

          {/* Share Link Box */}
          <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:'20px 24px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:'var(--charcoal)', textTransform:'uppercase', marginBottom:4, fontFamily:'Manrope,sans-serif' }}>{t.subShareTitle}</div>
              <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{t.subShareDesc}</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--sand)', fontSize:12, color:'var(--muted)', fontFamily:'monospace', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:260 }}>{typeof window!=='undefined'?window.location.origin+window.location.pathname:'kpeachgirl.com'}#membership</div>
              <button onClick={()=>{const url=(typeof window!=='undefined'?window.location.origin+window.location.pathname:'kpeachgirl.com')+'#membership'; if(navigator.clipboard){navigator.clipboard.writeText(url).catch(function(){});} setLinkCopied(true); setTimeout(function(){setLinkCopied(false);},2000);}} style={{ padding:'10px 20px', background:linkCopied?'var(--sage)':'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'background 0.3s', whiteSpace:'nowrap' }}>{linkCopied?t.subCopied:t.subCopyLink}</button>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:'60px 20px', textAlign:'center' }}>
              <div className="serif" style={{ fontSize:24, fontWeight:300, color:'var(--sand)', marginBottom:8 }}>{t.subNone}</div>
              <p style={{ fontSize:12, color:'var(--sand)' }}>Send the membership form link above to start receiving submissions.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gap:12 }}>
              {submissions.map((s,si) => {
                const statusColors = { new:'var(--rose)', reviewed:'var(--peach)', approved:'var(--sage)', dismissed:'var(--sand)' };
                const statusLabels = { new:t.subNew, reviewed:t.subReviewed, approved:t.subApproved, dismissed:t.subDismissed };
                return (
                <div key={s.id} style={{ background:'#181716', border:'1px solid var(--sand)', overflow:'hidden' }}>
                  {/* Header row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:36, height:36, background:statusColors[s.status]+'1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:statusColors[s.status], fontFamily:'Manrope,sans-serif' }}>{s.name[0]}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:'var(--charcoal)' }}>{s.name}</div>
                        <div style={{ fontSize:11, color:'var(--muted)' }}>{s.email} {s.phone ? '· '+s.phone : ''}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:10, color:'var(--muted)' }}>{s.submittedAt}</span>
                      <span style={{ padding:'3px 10px', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:statusColors[s.status], background:statusColors[s.status]+'15', fontFamily:'Manrope,sans-serif' }}>{statusLabels[s.status]}</span>
                    </div>
                  </div>
                  {/* Details */}
                  <div style={{ padding:'16px 20px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:12 }}>
                      {[['Age',s.age],['Height',s.height],['Area',s.region],['Experience',s.exp]].map(([label,val])=>(
                        <div key={label}>
                          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'var(--sand)', textTransform:'uppercase', marginBottom:2 }}>{label}</div>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--charcoal)' }}>{val||'—'}</div>
                        </div>
                      ))}
                    </div>
                    {(s.types||[]).length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                      {s.types.map(st=><span key={st} style={{ padding:'3px 10px', fontSize:10, fontWeight:600, border:'1px solid var(--sand)', color:'var(--muted)', fontFamily:'Manrope,sans-serif' }}>{st}</span>)}
                    </div>}
                    {s.bio && <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:10 }}>{s.bio}</p>}
                    {s.social && <div style={{ fontSize:11, color:'var(--rose)', marginBottom:10 }}>{s.social}</div>}
                    {/* Uploaded files */}
                    {(formConfig.fields||[]).filter(ff=>ff.type==='file_upload'&&s[ff.id]).map(ff=>(
                      <div key={ff.id} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'var(--sand)', textTransform:'uppercase', marginBottom:6 }}>{ff.label}</div>
                        <div style={{ display:'inline-block', position:'relative', border:'1px solid var(--sand)', maxWidth:280 }}>
                          <img src={s[ff.id]} alt={ff.label} style={{ display:'block', width:'100%', maxHeight:240, objectFit:'contain' }} />
                          <div style={{ position:'absolute', top:6, right:6, padding:'3px 8px', background:'rgba(0,0,0,0.7)', fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'var(--sage)', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>Uploaded</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Actions */}
                  <div style={{ display:'flex', gap:1, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    {s.status==='new' && <button onClick={()=>onUpdateSubmissions(submissions.map(x=>x.id===s.id?{...x,status:'reviewed'}:x))} style={{ flex:1, padding:'10px 0', background:'transparent', border:'none', color:'var(--peach)', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.subMarkReviewed}</button>}
                    {(s.status==='new'||s.status==='reviewed') && <button onClick={()=>onUpdateSubmissions(submissions.map(x=>x.id===s.id?{...x,status:'approved'}:x))} style={{ flex:1, padding:'10px 0', background:'transparent', border:'none', color:'var(--sage)', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.subApprove}</button>}
                    {(s.status==='new'||s.status==='reviewed') && <button onClick={()=>onUpdateSubmissions(submissions.map(x=>x.id===s.id?{...x,status:'dismissed'}:x))} style={{ flex:1, padding:'10px 0', background:'transparent', border:'none', color:'var(--sand)', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.subDismiss}</button>}
                    {s.status==='approved' && <button onClick={()=>{
                      const id=Date.now();
                      const m={id,name:s.name,region:s.region||areas[0]||'LA',parentRegion:s.region==='OC'?'OC':'LA',img:'',cover:'',types:s.types||[],compensation:[],verified:false,vacation:false,exp:s.exp||'Beginner',age:s.age||'',height:s.height||'',weight:'',bust:'',waist:'',hips:'',hair:'',eyes:'',shoe:'',dress:'',tattoos:'None',piercings:'Ears',bio:s.bio||'',gallery:[]};
                      setModels(p=>[m,...p]);
                      onUpdateSubmissions(submissions.map(x=>x.id===s.id?{...x,status:'converted'}:x));
                    }} style={{ flex:1, padding:'10px 0', background:'var(--sage)', border:'none', color:'#181716', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.subConvert}</button>}
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>}

        {tab==="categories" && <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <div>
              <h2 className="serif cat-heading" style={{ fontWeight:300, color:'var(--charcoal)' }}>{t.catTitle}</h2>
              <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{t.catDesc}</p>
            </div>
            <button onClick={addCategory} style={{ padding:'10px 24px', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.addSection}</button>
          </div>
          <div style={{ display:'grid', gap:20 }}>
            {/* ─── HERO BANNER SETTINGS ─── */}
            <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:28 }}>
              <div className="serif" style={{ fontSize:20, fontWeight:400, color:'var(--charcoal)', marginBottom:4 }}>{t.heroSettings}</div>
              <p style={{ fontSize:12, color:'var(--muted)', marginBottom:24 }}>{t.heroSettingsDesc}</p>

              {/* Hero Image */}
              <div style={{ marginBottom:20 }}>
                <label style={ls}>{t.heroImage}</label>
                <div style={{ position:'relative', width:'100%', aspectRatio:'21/9', border:'1px dashed var(--sand)', background:'rgba(255,255,255,0.04)', overflow:'hidden' }}>
                  {heroSettings.img ? <>
                    <img src={heroSettings.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${(heroSettings.imgCrop&&heroSettings.imgCrop.x)||50}% ${(heroSettings.imgCrop&&heroSettings.imgCrop.y)||50}%`, transform:`scale(${((heroSettings.imgCrop&&heroSettings.imgCrop.zoom)||100)/100})`, transformOrigin:`${(heroSettings.imgCrop&&heroSettings.imgCrop.x)||50}% ${(heroSettings.imgCrop&&heroSettings.imgCrop.y)||50}%`, filter:'brightness(0.4) contrast(1.05)' }} />
                    {/* Preview text overlay */}
                    <div style={{ position:'absolute', bottom:16, left:20, zIndex:1 }}>
                      <div className="sans" style={{ fontSize:8, fontWeight:700, letterSpacing:'0.2em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:4 }}>{heroSettings.subtitle}</div>
                      <div className="serif" style={{ fontSize:20, fontWeight:300, color:'#fff', lineHeight:1 }}>{heroSettings.titleLine1}<br/>{heroSettings.titleLine2} <em style={{ fontStyle:'italic', color:'var(--peach)' }}>{heroSettings.titleAccent}</em></div>
                    </div>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:1 }}>
                      <button onClick={()=>setEditingPhoto({key:'heroImg'})} style={{ flex:1, padding:'6px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', backdropFilter:'blur(4px)' }}>{t.editBtn}</button>
                      <button onClick={()=>(document.getElementById('hero-img')&&document.getElementById('hero-img').click())} style={{ flex:1, padding:'6px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', backdropFilter:'blur(4px)' }}>{t.uploadPhoto}</button>
                    </div>
                    <button onClick={()=>onUpdateHero({...heroSettings, img:'', imgCrop:null})} style={{ position:'absolute', top:6, right:6, width:22, height:22, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2 }}>×</button>
                  </> : <div onClick={()=>(document.getElementById('hero-img')&&document.getElementById('hero-img').click())} style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:11, color:'var(--sand)', textAlign:'center', padding:12, fontFamily:'Manrope,sans-serif', cursor:'pointer' }}>{t.dragOrClick}</div>}
                </div>
                <input id="hero-img" type="file" accept="image/*" onChange={handleHeroPhoto} style={{ display:'none' }} />
              </div>

              {/* Hero Text Fields */}
              <div className="admin-edit-grid">
                <div>
                  <label style={ls}>{t.heroSubtitle}</label>
                  <input value={heroSettings.subtitle||''} onChange={e=>onUpdateHero({...heroSettings, subtitle:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                </div>
                <div>
                  <label style={ls}>{t.heroSearchPh}</label>
                  <input value={heroSettings.searchPlaceholder||''} onChange={e=>onUpdateHero({...heroSettings, searchPlaceholder:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px 14px', marginTop:12 }}>
                <div>
                  <label style={ls}>{t.heroLine1}</label>
                  <input value={heroSettings.titleLine1||''} onChange={e=>onUpdateHero({...heroSettings, titleLine1:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                </div>
                <div>
                  <label style={ls}>{t.heroLine2}</label>
                  <input value={heroSettings.titleLine2||''} onChange={e=>onUpdateHero({...heroSettings, titleLine2:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                </div>
                <div>
                  <label style={ls}>{t.heroAccent}</label>
                  <input value={heroSettings.titleAccent||''} onChange={e=>onUpdateHero({...heroSettings, titleAccent:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                </div>
              </div>
            </div>

            {/* ─── CARD DISPLAY SETTINGS ─── */}
            <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:28 }}>
              <div className="serif" style={{ fontSize:20, fontWeight:400, color:'var(--charcoal)', marginBottom:4 }}>{t.cardDisplay}</div>
              <p style={{ fontSize:12, color:'var(--muted)', marginBottom:24 }}>{t.cardDisplayDesc}</p>

              {/* Subtitle Fields */}
              <div style={{ marginBottom:24 }}>
                <label style={ls}>{t.subtitleFields}</label>
                <p style={{ fontSize:11, color:'var(--sand)', marginBottom:10 }}>{t.subtitleDesc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {[["region",t.sfRegion],["types",t.sfType],["exp",t.sfExp],["age",t.sfAge]].map(([k,l])=>{
                    const on=(cardSettings.subtitleFields||[]).includes(k);
                    return <button key={k} onClick={()=>{ const sf=cardSettings.subtitleFields||[]; onUpdateCardSettings({...cardSettings, subtitleFields:on?sf.filter(x=>x!==k):[...sf,k]}); }} style={{ padding:'6px 16px', fontSize:11, fontWeight:on?700:500, cursor:'pointer', border:on?'1px solid var(--charcoal)':'1px solid var(--sand)', background:on?'var(--charcoal)':'#181716', color:on?'var(--cream)':'var(--muted)', letterSpacing:'0.04em', fontFamily:'Manrope,sans-serif', transition:'all 0.15s' }}>{l}</button>;
                  })}
                </div>
              </div>

              {/* Badges */}
              <div style={{ marginBottom:24 }}>
                <label style={ls}>{t.badges}</label>
                <div className="admin-edit-grid" style={{ marginTop:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={()=>onUpdateCardSettings({...cardSettings, showVerifiedBadge:!cardSettings.showVerifiedBadge})} style={{ width:36, height:20, borderRadius:10, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', background:cardSettings.showVerifiedBadge?'var(--sage)':'var(--sand)' }}><span style={{ position:'absolute', top:2, left:cardSettings.showVerifiedBadge?18:2, width:16, height:16, borderRadius:8, background:'#181716', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }}/></button>
                    <span className="sans" style={{ fontSize:12, color:'var(--charcoal)' }}>{t.showVerified}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={()=>onUpdateCardSettings({...cardSettings, showAwayBadge:!cardSettings.showAwayBadge})} style={{ width:36, height:20, borderRadius:10, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', background:cardSettings.showAwayBadge?'var(--peach)':'var(--sand)' }}><span style={{ position:'absolute', top:2, left:cardSettings.showAwayBadge?18:2, width:16, height:16, borderRadius:8, background:'#181716', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }}/></button>
                    <span className="sans" style={{ fontSize:12, color:'var(--charcoal)' }}>{t.showAway}</span>
                  </div>
                </div>
                {/* Badge Labels */}
                <div className="admin-edit-grid" style={{ marginTop:12 }}>
                  <div>
                    <label style={ls}>{t.verifiedLabelT}</label>
                    <input value={cardSettings.verifiedLabel||''} onChange={e=>onUpdateCardSettings({...cardSettings, verifiedLabel:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                  </div>
                  <div>
                    <label style={ls}>{t.awayLabelT}</label>
                    <input value={cardSettings.awayLabel||''} onChange={e=>onUpdateCardSettings({...cardSettings, awayLabel:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div>
                <label style={ls}>{t.overlay}</label>
                <div className="admin-edit-grid" style={{ marginTop:8 }}>
                  <div>
                    <label style={{...ls, fontSize:9}}>{t.overlayColor}</label>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <input type="color" value={cardSettings.overlayColor||'#1a1a1a'} onChange={e=>onUpdateCardSettings({...cardSettings, overlayColor:e.target.value})} style={{ width:36, height:36, border:'1px solid var(--sand)', padding:2, cursor:'pointer', background:'#181716' }} />
                      <span className="sans" style={{ fontSize:12, color:'var(--muted)', fontFamily:'monospace' }}>{cardSettings.overlayColor||'#1a1a1a'}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{...ls, fontSize:9}}>{t.overlayOpacity} — {cardSettings.overlayOpacity||70}%</label>
                    <input type="range" min="0" max="100" value={cardSettings.overlayOpacity||70} onChange={e=>onUpdateCardSettings({...cardSettings, overlayOpacity:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'var(--rose)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── TAG GROUPS (Shoot Types, Compensation, etc.) ─── */}
            <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:28 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <div className="serif" style={{ fontSize:20, fontWeight:400, color:'var(--charcoal)', marginBottom:4 }}>{t.pillGroups}</div>
                  <p style={{ fontSize:12, color:'var(--muted)' }}>{t.pillGroupsDesc}</p>
                </div>
                <button onClick={()=>onUpdatePillGroups([...pillGroups,{id:`pg_${Date.now()}`,title:t.newGroupTitle,color:'var(--charcoal)',dataKey:`custom_tags_${Date.now()}`,options:[t.newOption]}])} style={{ padding:'8px 18px', background:'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', whiteSpace:'nowrap', marginLeft:16 }}>{t.addGroup}</button>
              </div>
              {pillGroups.map((pg,gi)=>(
                <div key={pg.id} style={{ border:'1px solid rgba(255,255,255,0.08)', padding:20, marginBottom:gi<pillGroups.length-1?16:0, background:'rgba(255,255,255,0.03)' }}>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-end', marginBottom:16 }}>
                    <div style={{ flex:1 }}>
                      <label style={ls}>{t.groupTitle}</label>
                      <input value={pg.title} onChange={e=>onUpdatePillGroups(pillGroups.map(p=>p.id===pg.id?{...p,title:e.target.value}:p))} className="serif" style={{ border:'none', borderBottom:'2px solid var(--sand)', background:'transparent', fontSize:20, fontWeight:400, color:'var(--charcoal)', width:'100%', padding:'4px 0', fontFamily:"'Cormorant Garamond',Georgia,serif", outline:'none' }} />
                    </div>
                    <div>
                      <label style={{...ls, fontSize:9}}>{t.groupColor}</label>
                      <input type="color" value={pg.color.startsWith('var')?pg.color==='var(--charcoal)'?'#1a1a1a':pg.color==='var(--sage)'?'#7a8f7a':pg.color==='var(--rose)'?'#b85c6b':pg.color==='var(--peach)'?'#d4907c':'#1a1a1a':pg.color} onChange={e=>onUpdatePillGroups(pillGroups.map(p=>p.id===pg.id?{...p,color:e.target.value}:p))} style={{ width:32, height:32, border:'1px solid var(--sand)', padding:2, cursor:'pointer', background:'#181716' }} />
                    </div>
                    <div>
                      <label style={{...ls, fontSize:9}}>{t.dataKey}</label>
                      <span style={{ fontSize:11, color:'var(--sand)', fontFamily:'monospace' }}>{pg.dataKey}</span>
                    </div>
                    <button onClick={()=>onUpdatePillGroups(pillGroups.filter(p=>p.id!==pg.id))} style={{ background:'none', border:'1px solid var(--sand)', color:'var(--muted)', padding:'4px 12px', fontSize:10, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{t.remove}</button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                    {pg.options.map((opt,oi)=>(
                      <div key={oi} style={{ display:'flex', alignItems:'center', gap:0, border:'1px solid var(--sand)', background:'#181716' }}>
                        <input value={opt} onChange={e=>{const newOpts=[...pg.options]; newOpts[oi]=e.target.value; onUpdatePillGroups(pillGroups.map(p=>p.id===pg.id?{...p,options:newOpts}:p));}} style={{ border:'none', padding:'6px 10px', fontSize:12, fontWeight:600, color:'var(--charcoal)', width:Math.max(60,opt.length*8+20), fontFamily:'Manrope,sans-serif', outline:'none', background:'transparent' }} />
                        <button onClick={()=>onUpdatePillGroups(pillGroups.map(p=>p.id===pg.id?{...p,options:p.options.filter((_,i)=>i!==oi)}:p))} style={{ background:'none', border:'none', borderLeft:'1px solid var(--sand)', color:'var(--sand)', cursor:'pointer', padding:'6px 8px', fontSize:13, fontWeight:300, fontFamily:'Manrope,sans-serif' }}>×</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>onUpdatePillGroups(pillGroups.map(p=>p.id===pg.id?{...p,options:[...p.options,t.newOption]}:p))} style={{ padding:'5px 14px', background:'transparent', border:'1px dashed var(--sand)', color:'var(--muted)', fontSize:10, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{t.addOption}</button>
                </div>
              ))}
            </div>

            {/* ─── MEMBERSHIP FORM EDITOR ─── */}
            <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:28 }}>
              <div className="serif" style={{ fontSize:20, fontWeight:400, color:'var(--charcoal)', marginBottom:4 }}>{t.formEditor}</div>
              <p style={{ fontSize:12, color:'var(--muted)', marginBottom:24 }}>{t.formEditorDesc}</p>

              {/* Form text settings */}
              <div className="admin-edit-grid" style={{ marginBottom:16 }}>
                <div><label style={ls}>{t.formTitle}</label><input value={formConfig.title||''} onChange={e=>onUpdateFormConfig({...formConfig,title:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
                <div><label style={ls}>{t.formSubmitLabel}</label><input value={formConfig.submitLabel||''} onChange={e=>onUpdateFormConfig({...formConfig,submitLabel:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
              </div>
              <div style={{ marginBottom:16 }}><label style={ls}>{t.formSubtitle}</label><textarea value={formConfig.subtitle||''} onChange={e=>onUpdateFormConfig({...formConfig,subtitle:e.target.value})} rows={2} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif', resize:'vertical' }} /></div>
              <div className="admin-edit-grid" style={{ marginBottom:24 }}>
                <div><label style={ls}>{t.formSuccessTitle}</label><input value={formConfig.successTitle||''} onChange={e=>onUpdateFormConfig({...formConfig,successTitle:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
                <div><label style={ls}>{t.formSuccessMsg}</label><input value={formConfig.successMsg||''} onChange={e=>onUpdateFormConfig({...formConfig,successMsg:e.target.value})} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} /></div>
              </div>

              {/* Fields */}
              <label style={{...ls, marginBottom:12}}>{t.formFields}</label>
              <div style={{ display:'grid', gap:8 }}>
                {(formConfig.fields||[]).map((ff,fi)=>(
                  <div key={ff.id+fi} style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
                    <div style={{ flex:2 }}>
                      <div style={{ fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'var(--sand)', textTransform:'uppercase', marginBottom:2 }}>ID: {ff.id}</div>
                      <input value={ff.label} onChange={e=>{const flds=[...formConfig.fields];flds[fi]={...flds[fi],label:e.target.value};onUpdateFormConfig({...formConfig,fields:flds});}} style={{ border:'none', background:'transparent', fontSize:13, fontWeight:600, color:'var(--charcoal)', width:'100%', padding:0, fontFamily:'Manrope,sans-serif', outline:'none' }} />
                    </div>
                    <select value={ff.type} onChange={e=>{const flds=[...formConfig.fields];flds[fi]={...flds[fi],type:e.target.value};onUpdateFormConfig({...formConfig,fields:flds});}} style={{ padding:'4px 8px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--muted)', fontSize:10, fontFamily:'Manrope,sans-serif' }}>
                      {[["text",t.ftText],["email",t.ftEmail],["textarea",t.ftTextarea],["file_upload",t.ftFileUpload],["area_select",t.ftAreaSelect],["exp_select",t.ftExpSelect],["type_pills",t.ftTypePills]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                    <select value={ff.width||'full'} onChange={e=>{const flds=[...formConfig.fields];flds[fi]={...flds[fi],width:e.target.value};onUpdateFormConfig({...formConfig,fields:flds});}} style={{ padding:'4px 8px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--muted)', fontSize:10, fontFamily:'Manrope,sans-serif', width:70 }}>
                      {[["full",t.fwFull],["half",t.fwHalf],["third",t.fwThird]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                    <button onClick={()=>{const flds=[...formConfig.fields];flds[fi]={...flds[fi],required:!flds[fi].required};onUpdateFormConfig({...formConfig,fields:flds});}} style={{ width:28, height:28, border:'1px solid var(--sand)', background:ff.required?'var(--rose)':'transparent', color:ff.required?'#181716':'var(--sand)', fontSize:10, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif' }}>*</button>
                    <input value={ff.placeholder||''} onChange={e=>{const flds=[...formConfig.fields];flds[fi]={...flds[fi],placeholder:e.target.value};onUpdateFormConfig({...formConfig,fields:flds});}} placeholder="Placeholder..." style={{ flex:1, padding:'4px 8px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--muted)', fontSize:10, fontFamily:'Manrope,sans-serif' }} />
                    <button onClick={()=>onUpdateFormConfig({...formConfig,fields:formConfig.fields.filter((_,i)=>i!==fi)})} style={{ background:'none', border:'none', color:'var(--sand)', cursor:'pointer', fontSize:16, fontWeight:300, padding:'0 4px', fontFamily:'Manrope,sans-serif' }}>×</button>
                  </div>
                  {ff.type==='file_upload' && <div style={{ padding:'0 12px 10px', marginTop:-4 }}>
                    <input value={ff.helperText||''} onChange={e=>{const flds=[...formConfig.fields];flds[fi]={...flds[fi],helperText:e.target.value};onUpdateFormConfig({...formConfig,fields:flds});}} placeholder="Helper note shown above upload area..." style={{ width:'100%', padding:'6px 10px', border:'1px solid var(--sand)', background:'#1e1d1b', color:'var(--muted)', fontSize:10, fontFamily:'Manrope,sans-serif', fontStyle:'italic' }} />
                  </div>}
                  </div>
                ))}
              </div>
              <button onClick={()=>onUpdateFormConfig({...formConfig,fields:[...formConfig.fields,{id:`field_${Date.now()}`,label:"New Field",type:"text",required:false,width:"full",placeholder:""}]})} style={{ marginTop:12, padding:'6px 18px', background:'transparent', border:'1px dashed var(--sand)', color:'var(--muted)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{t.formAddField}</button>
            </div>

            {/* ─── CATEGORY SECTIONS (existing) ─── */}
            {categories.map(cat=>(
              <div key={cat.id} style={{ background:'#181716', border:'1px solid var(--sand)', padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div style={{ flex:1 }}>
                    <label style={ls}>{t.sectionTitle}</label>
                    <input value={cat.title} onChange={e=>updateCatTitle(cat.id,e.target.value)} className="serif" style={{ border:'none', borderBottom:'2px solid var(--sand)', background:'transparent', fontSize:24, fontWeight:400, color:'var(--charcoal)', width:'100%', padding:'4px 0', fontFamily:"'Cormorant Garamond',Georgia,serif", outline:'none' }} />
                  </div>
                  <button onClick={()=>removeCategory(cat.id)} style={{ background:'none', border:'1px solid var(--sand)', color:'var(--muted)', padding:'6px 14px', fontSize:10, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', textTransform:'uppercase', marginLeft:16, fontFamily:'Manrope,sans-serif' }}>{t.remove}</button>
                </div>
                <div className="admin-fields-grid">
                  {cat.fields.map(f=>(
                    <div key={f.key} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.03)' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'var(--sand)', textTransform:'uppercase', marginBottom:2 }}>{t.fieldKey}: {f.key}</div>
                        <input value={f.label} onChange={e=>updateFieldLabel(cat.id,f.key,e.target.value)} style={{ border:'none', background:'transparent', fontSize:14, fontWeight:600, color:'var(--charcoal)', width:'100%', padding:0, fontFamily:'Manrope,sans-serif', outline:'none' }} />
                      </div>
                      <button onClick={()=>removeField(cat.id,f.key)} style={{ background:'none', border:'none', color:'var(--sand)', cursor:'pointer', fontSize:16, fontWeight:300, padding:'0 4px', fontFamily:'Manrope,sans-serif' }}>×</button>
                    </div>
                  ))}
                </div>
                <button onClick={()=>addField(cat.id)} style={{ marginTop:12, padding:'6px 18px', background:'transparent', border:'1px dashed var(--sand)', color:'var(--muted)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textTransform:'uppercase', fontFamily:'Manrope,sans-serif' }}>{t.addField}</button>
              </div>
            ))}
          </div>
        </div>}

        {tab==="areas" && <div>
          <h2 className="serif cat-heading" style={{ fontWeight:300, color:'var(--charcoal)', marginBottom:4 }}>{t.areasTitle}</h2>
          <p style={{ fontSize:13, color:'var(--muted)', marginBottom:28 }}>{t.areasDesc}</p>
          <div style={{ background:'#181716', border:'1px solid var(--sand)', padding:28 }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
              {areas.map(a=>(
                <div key={a} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 8px 8px 16px', border:'1px solid var(--sand)', background:'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--charcoal)' }}>{a}</span>
                  <button onClick={()=>onUpdateAreas(areas.filter(x=>x!==a))} style={{ width:22, height:22, border:'1px solid var(--sand)', background:'none', color:'var(--muted)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif' }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={newArea} onChange={e=>setNewArea(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addArea()} placeholder={t.areasPlaceholder} style={{ flex:1, padding:'10px 14px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }} />
              <button onClick={addArea} style={{ padding:'10px 24px', background:newArea.trim()?'var(--charcoal)':'var(--sand)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:newArea.trim()?'pointer':'default', fontFamily:'Manrope,sans-serif' }}>{t.add}</button>
            </div>
          </div>
        </div>}
      </div>

      {editing && <>
        <div onClick={close} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999 }} />
        <div className="slide-in admin-slide" style={{ background:'var(--cream)', borderLeft:'1px solid var(--sand)', zIndex:1000, overflowY:'auto', boxShadow:'-16px 0 48px rgba(0,0,0,0.08)' }}>
          <div style={{ position:'sticky', top:0, background:'#181716', borderBottom:'1px solid var(--sand)', padding:'14px 24px', zIndex:2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <img src={form.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="#d9cfc4"/></svg>')} alt="" style={{ width:36, height:36, objectFit:'cover', borderRadius:2 }} />
              <div><div style={{ fontWeight:700, fontSize:14, color:'var(--charcoal)' }}>{form.name}</div><div style={{ fontSize:10, color:'var(--muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{t.editing}</div></div>
            </div>
            <button onClick={close} style={{ background:'none', border:'1px solid var(--sand)', width:28, height:28, cursor:'pointer', fontSize:14, color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif' }}>×</button>
          </div>
          <div style={{ padding:'20px 24px 100px' }}>
            <div style={{ marginBottom:28 }}>
              <div className="serif" style={{ fontSize:12, fontWeight:600, letterSpacing:'0.16em', color:'var(--rose)', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--sand)' }}>{t.identity}</div>
              <div className="admin-edit-grid">
                {[["name",t.fullName],["region",t.area],["parentRegion",t.parentRegion],["exp",t.experience]].map(([k,l])=>(
                  <div key={k}><label style={ls}>{l}</label>
                    {k==='region'?<select value={form[k]||''} onChange={e=>upd(k,e.target.value)} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }}>{areas.map(a=><option key={a} value={a}>{a}</option>)}</select>
                    :k==='parentRegion'?<select value={form[k]||''} onChange={e=>upd(k,e.target.value)} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }}><option value="LA">LA</option><option value="OC">OC</option></select>
                    :k==='exp'?<select value={form[k]||''} onChange={e=>upd(k,e.target.value)} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--sand)', background:'#181716', color:'var(--charcoal)', fontSize:13, fontFamily:'Manrope,sans-serif' }}>{["Beginner","Intermediate","Experienced","Professional"].map(o=><option key={o} value={o}>{expMap[o]}</option>)}</select>
                    :<FI value={form[k]||''} onChange={v=>upd(k,v)} />}
                  </div>
                ))}
              </div>
            </div>

            {/* ─── PHOTOS ─── */}
            <div style={{ marginBottom:28 }}>
              <div className="serif" style={{ fontSize:12, fontWeight:600, letterSpacing:'0.16em', color:'var(--rose)', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--sand)' }}>{t.photos}</div>
              <div className="admin-edit-grid">
                {/* Profile Photo */}
                <div>
                  <label style={ls}>{t.profilePhoto}</label>
                  <div style={{ position:'relative', width:'100%', aspectRatio:'2/3', border:'1px dashed var(--sand)', background:'rgba(255,255,255,0.04)', overflow:'hidden' }}>
                    {form.img ? <>
                      <img src={form.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${(form.imgCrop&&form.imgCrop.x)||50}% ${(form.imgCrop&&form.imgCrop.y)||50}%`, transform:`scale(${((form.imgCrop&&form.imgCrop.zoom)||100)/100})`, transformOrigin:`${(form.imgCrop&&form.imgCrop.x)||50}% ${(form.imgCrop&&form.imgCrop.y)||50}%` }} />
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:1 }}>
                        <button onClick={()=>setEditingPhoto({key:'img'})} style={{ flex:1, padding:'6px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', backdropFilter:'blur(4px)' }}>{t.editBtn}</button>
                        <button onClick={()=>(document.getElementById('pf-img')&&document.getElementById('pf-img').click())} style={{ flex:1, padding:'6px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', backdropFilter:'blur(4px)' }}>{t.uploadPhoto}</button>
                      </div>
                      <button onClick={()=>{upd('img','');upd('imgCrop',null);}} style={{ position:'absolute', top:6, right:6, width:22, height:22, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2 }}>×</button>
                    </> : <div onClick={()=>(document.getElementById('pf-img')&&document.getElementById('pf-img').click())} style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:11, color:'var(--sand)', textAlign:'center', padding:12, fontFamily:'Manrope,sans-serif', cursor:'pointer' }}>{t.dragOrClick}</div>}
                  </div>
                  <input id="pf-img" type="file" accept="image/*" onChange={e=>handlePhoto('img',e)} style={{ display:'none' }} />
                </div>
                {/* Cover Photo */}
                <div>
                  <label style={ls}>{t.coverPhoto}</label>
                  <div style={{ position:'relative', width:'100%', aspectRatio:'7/3', border:'1px dashed var(--sand)', background:'rgba(255,255,255,0.04)', overflow:'hidden' }}>
                    {form.cover ? <>
                      <img src={form.cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${(form.coverCrop&&form.coverCrop.x)||50}% ${(form.coverCrop&&form.coverCrop.y)||50}%`, transform:`scale(${((form.coverCrop&&form.coverCrop.zoom)||100)/100})`, transformOrigin:`${(form.coverCrop&&form.coverCrop.x)||50}% ${(form.coverCrop&&form.coverCrop.y)||50}%` }} />
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:1 }}>
                        <button onClick={()=>setEditingPhoto({key:'cover'})} style={{ flex:1, padding:'6px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', backdropFilter:'blur(4px)' }}>{t.editBtn}</button>
                        <button onClick={()=>(document.getElementById('pf-cover')&&document.getElementById('pf-cover').click())} style={{ flex:1, padding:'6px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', backdropFilter:'blur(4px)' }}>{t.uploadPhoto}</button>
                      </div>
                      <button onClick={()=>{upd('cover','');upd('coverCrop',null);}} style={{ position:'absolute', top:6, right:6, width:22, height:22, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2 }}>×</button>
                    </> : <div onClick={()=>(document.getElementById('pf-cover')&&document.getElementById('pf-cover').click())} style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:11, color:'var(--sand)', textAlign:'center', padding:12, fontFamily:'Manrope,sans-serif', cursor:'pointer' }}>{t.dragOrClick}</div>}
                  </div>
                  <input id="pf-cover" type="file" accept="image/*" onChange={e=>handlePhoto('cover',e)} style={{ display:'none' }} />
                </div>
              </div>

              {/* Gallery */}
              <div style={{ marginTop:16 }}>
                <label style={ls}>{t.galleryPhotos} ({(form.gallery||[]).length})</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginTop:8 }}>
                  {(form.gallery||[]).map((img,i)=>{
                    const gc = (form.galleryCrops||[])[i];
                    return (
                    <div key={i} style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', border:'1px solid var(--sand)' }}>
                      <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${(gc&&gc.x)||50}% ${(gc&&gc.y)||50}%`, transform:`scale(${((gc&&gc.zoom)||100)/100})`, transformOrigin:`${(gc&&gc.x)||50}% ${(gc&&gc.y)||50}%` }} />
                      <button onClick={()=>removeGalleryPhoto(i)} style={{ position:'absolute', top:4, right:4, width:20, height:20, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2 }}>×</button>
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:1 }}>
                        <button onClick={()=>setEditingPhoto({key:'gallery',idx:i})} style={{ flex:1, padding:'3px 0', background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', fontSize:8, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.editBtn}</button>
                        <div style={{ padding:'3px 6px', background:'rgba(0,0,0,0.8)', color:'rgba(255,255,255,0.5)', fontSize:8, fontFamily:'Manrope,sans-serif' }}>{i+1}</div>
                      </div>
                    </div>
                  );})}
                  <div style={{ aspectRatio:'3/4', border:'1px dashed var(--sand)', background:'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }} onClick={()=>(document.getElementById('pf-gallery')&&document.getElementById('pf-gallery').click())}>
                    <div style={{ fontSize:24, color:'var(--sand)', fontWeight:300, lineHeight:1 }}>+</div>
                    <div style={{ fontSize:9, color:'var(--sand)', fontFamily:'Manrope,sans-serif', fontWeight:600, letterSpacing:'0.05em' }}>{t.galleryAdd}</div>
                  </div>
                </div>
                <input id="pf-gallery" type="file" accept="image/*" onChange={e=>{addGalleryPhoto(e);e.target.value='';}} style={{ display:'none' }} />
              </div>
            </div>

            {categories.map(cat=>(
              <div key={cat.id} style={{ marginBottom:28 }}>
                <div className="serif" style={{ fontSize:12, fontWeight:600, letterSpacing:'0.16em', color:'var(--rose)', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--sand)' }}>{cat.title}</div>
                <div className="admin-edit-grid">
                  {cat.fields.map(f=><div key={f.key}><label style={ls}>{f.label}</label><FI value={form[f.key]||''} onChange={v=>upd(f.key,v)} /></div>)}
                </div>
              </div>
            ))}
            <div style={{ marginBottom:28 }}>
              <div className="serif" style={{ fontSize:12, fontWeight:600, letterSpacing:'0.16em', color:'var(--rose)', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--sand)' }}>{t.biography}</div>
              <FI type="textarea" value={form.bio||''} onChange={v=>upd('bio',v)} rows={5} />
            </div>
            {pillGroups.map(pg=>(
              <div key={pg.id} style={{ marginBottom:28 }}>
                <div className="serif" style={{ fontSize:12, fontWeight:600, letterSpacing:'0.16em', color:'var(--rose)', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--sand)' }}>{pg.title}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {pg.options.map(opt=>{
                    const vals = form[pg.dataKey]||[];
                    const on = vals.includes(opt);
                    return <button key={opt} onClick={()=>upd(pg.dataKey, on?vals.filter(x=>x!==opt):[...vals,opt])} style={{ padding:'5px 14px', fontSize:11, fontWeight:on?700:500, cursor:'pointer', border:on?`1px solid ${pg.color}`:'1px solid var(--sand)', background:on?pg.color:'#181716', color:on?'var(--cream)':'var(--muted)', letterSpacing:'0.04em', fontFamily:'Manrope,sans-serif', transition:'all 0.15s' }}>{opt}</button>;
                  })}
                </div>
              </div>
            ))}
            {/* Delete */}
            <div style={{ paddingTop:20, borderTop:'1px solid var(--sand)' }}>
              <button onClick={()=>deleteModel(form.id)} style={{ width:'100%', padding:'10px 0', background:'transparent', border:'1px solid rgba(184,92,107,0.3)', color:'var(--rose)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.background='var(--rose)';e.target.style.color='#fff';}} onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color='var(--rose)';}}>{t.deleteModel}</button>
            </div>
          </div>
          <div className="admin-save-bar" style={{ background:'#181716', borderTop:'1px solid var(--sand)', padding:'12px 24px', display:'flex', gap:10, zIndex:3 }}>
            <button onClick={save} style={{ flex:1, padding:'12px 0', background:saved?'var(--sage)':'var(--charcoal)', color:'var(--cream)', border:'none', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'background 0.3s' }}>{saved?t.saved:t.savePublish}</button>
            <button onClick={close} style={{ padding:'12px 20px', border:'1px solid var(--sand)', background:'transparent', color:'var(--muted)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{t.cancel}</button>
          </div>
        </div>
      </>}

      {/* Photo Editor Modal */}
      {editingPhoto && (() => {
        const ep = editingPhoto;
        let src, crop, aspect;
        if (ep.key==='heroImg') {
          src = heroSettings.img;
          crop = heroSettings.imgCrop;
          aspect = '21/9';
        } else if (ep.key==='gallery') {
          src = (form.gallery||[])[ep.idx];
          crop = (form.galleryCrops||[])[ep.idx];
          aspect = '3/4';
        } else {
          src = form[ep.key];
          crop = form[ep.key+'Crop'];
          aspect = ep.key==='cover' ? '7/3' : '2/3';
        }
        if (!src) return null;
        return <PhotoEditor src={src} crop={crop} aspect={aspect} t={t}
          onCancel={()=>setEditingPhoto(null)}
          onSave={(c)=>{
            if (ep.key==='heroImg') {
              onUpdateHero({...heroSettings, imgCrop:c});
            } else if(ep.key==='gallery'){
              const crops = [...(form.galleryCrops||Array((form.gallery||[]).length).fill(null))];
              crops[ep.idx] = c;
              upd('galleryCrops', crops);
            } else {
              upd(ep.key+'Crop', c);
            }
            setEditingPhoto(null);
          }}
        />;
      })()}
    </div>
  );
};

/* ═══ MAIN APP ═══ */
export default function App() {
  const [age, setAge] = useState(false);
  const [page, setPage] = useState(() => {
    const h = typeof window!=='undefined' ? window.location.hash : '';
    return h==='#membership' ? 'register' : 'home';
  });
  const [selected, setSelected] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All");
  const [areas, setAreas] = useState(DEFAULT_AREAS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [cardSettings, setCardSettings] = useState(DEFAULT_CARD_SETTINGS);
  const [pillGroups, setPillGroups] = useState(DEFAULT_PILL_GROUPS);
  const [heroSettings, setHeroSettings] = useState(DEFAULT_HERO);
  const [formConfig, setFormConfig] = useState(DEFAULT_FORM_FIELDS);
  const [hideVacation, setHideVacation] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => { if(area!=="All"&&!areas.includes(area)) setArea("All"); }, [areas,area]);

  const filtered = MODELS.filter(m => {
    if(hideVacation&&m.vacation) return false;
    if(verifiedOnly&&!m.verified) return false;
    if(area!=="All") { if(area==="LA"||area==="OC"){if(m.parentRegion!==area)return false;} else{if(m.region!==area)return false;} }
    if(search&&!m.name.toLowerCase().includes(search.toLowerCase())&&!m.region.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleLogout = () => { setAdminUser(null); setPage("home"); };

  if(page==="register") return <><style>{CSS}</style><RegistrationForm formConfig={formConfig} areas={areas} pillGroups={pillGroups} onSubmit={s=>setSubmissions(p=>[s,...p])} onBack={()=>{setAge(true);setPage("home");}} /></>;
  if(!age) return <><style>{CSS}</style><AgeGate onVerified={()=>setAge(true)} /></>;
  if(selected) return <><style>{CSS}</style><ProfilePage model={selected} categories={categories} pillGroups={pillGroups} groups={groups} onBack={()=>setSelected(null)} onSelectGroup={g=>{setSelected(null);setSelectedGroup(g);}} /></>;
  if(selectedGroup) return <><style>{CSS}</style><GroupProfilePage group={selectedGroup} models={MODELS} categories={categories} pillGroups={pillGroups} onBack={()=>setSelectedGroup(null)} onSelectModel={m=>{setSelectedGroup(null);setSelected(m);}} /></>;
  if(page==="login") return <><style>{CSS}</style><LoginPage onLogin={(u)=>{setAdminUser(u);setPage("admin");}} onBack={()=>setPage("home")} /></>;
  if(page==="admin" && !adminUser) return <><style>{CSS}</style><LoginPage onLogin={(u)=>{setAdminUser(u);setPage("admin");}} onBack={()=>setPage("home")} /></>;
  if(page==="admin") return <><style>{CSS}</style><AdminPanel onBack={()=>setPage("home")} onLogout={handleLogout} adminUser={adminUser} areas={areas} onUpdateAreas={setAreas} categories={categories} onUpdateCategories={setCategories} cardSettings={cardSettings} onUpdateCardSettings={setCardSettings} pillGroups={pillGroups} onUpdatePillGroups={setPillGroups} heroSettings={heroSettings} onUpdateHero={setHeroSettings} submissions={submissions} onUpdateSubmissions={setSubmissions} formConfig={formConfig} onUpdateFormConfig={setFormConfig} groups={groups} onUpdateGroups={setGroups} /></>;

  return (
    <div className="grain" style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <style>{CSS}</style>
      <nav className="nav-pad" style={{ position:'sticky', top:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(14,13,12,0.92)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="serif" style={{ fontSize:24, fontWeight:400, letterSpacing:'-0.01em' }}>K<span style={{ color:'var(--rose)' }}>peach</span>girl</div>
        <div className="sans nav-links" style={{ gap:28, alignItems:'center' }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', cursor:'pointer' }}>Browse</span>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em', color:'var(--muted)', textTransform:'uppercase', cursor:'pointer' }}>How It Works</span>
          <button onClick={()=>setPage(adminUser?"admin":"login")} style={{ padding:'7px 20px', background:'#f0ebe5', color:'#0e0d0c', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>Admin</button>
        </div>
        {/* Mobile admin button */}
        <button onClick={()=>setPage(adminUser?"admin":"login")} className="sans mob-admin" style={{ display:'none', padding:'6px 14px', background:'#f0ebe5', color:'#0e0d0c', border:'none', fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>Admin</button>
      </nav>

      <div className="fade-up" style={{ position:'relative', height:'70vh', minHeight:380, overflow:'hidden', display:'flex', alignItems:'flex-end' }}>
        {(() => { const hi=heroSettings.img; const hc=heroSettings.imgCrop; const fallback="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&h=800&fit=crop"; return <img src={hi||fallback} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.4) contrast(1.05)', objectPosition:`${(hc&&hc.x)||50}% ${(hc&&hc.y)||50}%`, transform:`scale(${((hc&&hc.zoom)||100)/100})`, transformOrigin:`${(hc&&hc.x)||50}% ${(hc&&hc.y)||50}%` }} />; })()}
        <div className="hero-pad" style={{ position:'relative', zIndex:1, maxWidth:700 }}>
          <div className="sans" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:12 }}>{heroSettings.subtitle}</div>
          <h1 className="serif hero-title" style={{ fontWeight:300, color:'#fff', lineHeight:0.95, letterSpacing:'-0.03em' }}>{heroSettings.titleLine1}<br/>{heroSettings.titleLine2} <em style={{ fontStyle:'italic', color:'var(--peach)' }}>{heroSettings.titleAccent}</em></h1>
          <div style={{ width:48, height:2, background:'var(--rose)', margin:'28px 0' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={heroSettings.searchPlaceholder} className="sans hero-search" style={{ padding:'13px 20px', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', color:'#fff', fontSize:13, fontWeight:500 }} />
        </div>
      </div>

      <div className="content-pad" style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="sans" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div className="filter-scroll">
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', color:'var(--muted)', textTransform:'uppercase', marginRight:8, whiteSpace:'nowrap' }}>Area</span>
            {["All",...areas].map(a=>(
              <button key={a} onClick={()=>setArea(a)} className="sans" style={{ padding:'6px 16px', fontSize:11, fontWeight:700, letterSpacing:'0.04em', cursor:'pointer', border:area===a?'1px solid var(--charcoal)':'1px solid var(--sand)', background:area===a?'var(--charcoal)':'transparent', color:area===a?'var(--cream)':'var(--muted)', fontFamily:'Manrope,sans-serif', textTransform:'uppercase', transition:'all 0.2s', whiteSpace:'nowrap' }}>{a}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <label className="sans" style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:'var(--muted)', cursor:'pointer' }}><input type="checkbox" checked={verifiedOnly} onChange={e=>setVerifiedOnly(e.target.checked)} style={{ accentColor:'var(--sage)' }} /> Verified</label>
            <label className="sans" style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:'var(--muted)', cursor:'pointer' }}><input type="checkbox" checked={hideVacation} onChange={e=>setHideVacation(e.target.checked)} style={{ accentColor:'var(--peach)' }} /> Available</label>
          </div>
        </div>
        <div className="sans" style={{ fontSize:11, color:'var(--sand)', marginTop:12, fontWeight:600, letterSpacing:'0.06em' }}>{filtered.length} model{filtered.length!==1?'s':''}</div>
      </div>

      <div className="grid-pad" style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="model-grid">
          {filtered.map((m,i) => <div key={m.id} className={`fade-up stagger-${(i%5)+1}`}><ModelCard model={m} onClick={setSelected} cs={cardSettings} /></div>)}
          {groups.map((g,i) => {
            const badge = g.badgeLabel || ((g.memberIds||[]).length===2?'DUO':(g.memberIds||[]).length===3?'TRIO':'GROUP');
            return <div key={'g'+g.id} className={`fade-up stagger-${((filtered.length+i)%5)+1}`}>
              <div className="model-card" onClick={()=>setSelectedGroup(g)} style={{ cursor:'pointer', position:'relative', overflow:'hidden', background:'#181716' }}>
                <div style={{ position:'relative', paddingTop:'135%', overflow:'hidden' }}>
                  <img className="card-img" src={g.img||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#2a2622"/><text x="200" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="48" font-weight="300" fill="rgba(138,127,118,0.3)">'+badge+'</text></svg>')} alt={g.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:`linear-gradient(transparent, ${cardSettings.overlayColor||'#1a1a1a'}${Math.round(((cardSettings.overlayOpacity||70)/100)*255).toString(16).padStart(2,'0')})` }} />
                  <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6 }}>
                    <span className="sans" style={{ background:'var(--rose)', padding:'3px 12px', fontSize:10, fontWeight:800, letterSpacing:'0.1em', color:'#181716', textTransform:'uppercase' }}>{badge}</span>
                  </div>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 18px' }}>
                    <div className="card-name serif" style={{ fontSize:24, fontWeight:500, color:'#fff', transition:'letter-spacing 0.6s ease', lineHeight:1.1 }}>{g.name}</div>
                    <div className="sans" style={{ fontSize:10, fontWeight:600, letterSpacing:'0.14em', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', marginTop:4 }}>{(g.memberIds||[]).length} models</div>
                  </div>
                </div>
              </div>
            </div>;
          })}
        </div>
        {filtered.length===0 && <div style={{ textAlign:'center', padding:'80px 0' }}><div className="serif" style={{ fontSize:28, fontWeight:300, color:'var(--sand)' }}>No models match your filters</div><div className="sans" style={{ fontSize:12, color:'var(--sand)', marginTop:8 }}>Try adjusting your search</div></div>}
      </div>

      <div className="footer-pad" style={{ borderTop:'1px solid var(--sand)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <span className="serif" style={{ fontSize:18, fontWeight:400, color:'var(--muted)' }}>K<span style={{ color:'var(--rose)' }}>peach</span>girl</span>
        <span className="sans" style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', color:'var(--sand)', textTransform:'uppercase' }}>© 2026 · All models are 18+</span>
      </div>
    </div>
  );
}

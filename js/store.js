/* ========================================================
   RED'S ACADEMY — data store (Firebase Firestore backed)
   Everything the admin edits is read from / written to a
   shared Firestore database, so changes show up for every
   visitor on every device — not just the browser that made
   the edit.

   Firestore layout: collection "redsAcademy", one document
   per data set, each holding { value: <the actual data> }.
   ======================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAkCbW5qFkscMdQ4YB5vSrJr2dGfrfHzqw",
  authDomain: "redsacademy-6e735.firebaseapp.com",
  projectId: "redsacademy-6e735",
  storageBucket: "redsacademy-6e735.firebasestorage.app",
  messagingSenderId: "279543244847",
  appId: "1:279543244847:web:abc0c7fe3c86de9c89feda",
  measurementId: "G-995FYXR7DS"
};

firebase.initializeApp(firebaseConfig);
const raDb = firebase.firestore();
const RA_COLLECTION = "redsAcademy";

const RA_DEFAULTS = {
  settings: {
    telegramHeadshot: "https://t.me/redsacademy_headshot",
    telegramEsports: "https://t.me/redsacademy_esports",
    contactEmail: "hello@redsacademy.gg",
    contactLocation: "Lagos, Nigeria (remote coaching worldwide)",
    aboutIntro: "RED'S ACADEMY trains competitive gamers the way real academies train athletes: structured weeks, honest feedback, and a squad that pushes you past your ceiling.",
    aboutBody: "We started RED'S ACADEMY because too many talented players plateau alone — grinding ranked with no one to tell them what's actually wrong with their aim, positioning, or decision-making. Our coaches have competed at regional level in both tactical shooters and MOBA/battle-royale esports, and every course is built from what actually separates a good player from a paid one.",
    adminPassword: "RedsAcademy#2026",
  },
  leaderboard: [
    { id: 1, rank: 1, name: "Kaito \"Ghost\" A.", track: "Headshot", points: 2840, wins: 34 },
    { id: 2, rank: 2, name: "Team Valtrix", track: "Esports", points: 2695, wins: 29 },
    { id: 3, rank: 3, name: "Ada \"Vex\" O.", track: "Headshot", points: 2510, wins: 27 },
    { id: 4, rank: 4, name: "Team Nightfall", track: "Esports", points: 2320, wins: 22 },
    { id: 5, rank: 5, name: "Musa \"Cinder\" B.", track: "Headshot", points: 2180, wins: 20 },
  ],
  graduates: [
    { id: 1, name: "Ada Okafor", batch: "Batch 03 · Headshot", achievement: "Now coaching Batch 05" },
    { id: 2, name: "Femi Adaeze", batch: "Batch 03 · Esports", achievement: "Signed to Nightfall Esports" },
    { id: 3, name: "Chidi Umeh", batch: "Batch 02 · Headshot", achievement: "Top 1% ranked, region" },
    { id: 4, name: "Blessing Eze", batch: "Batch 02 · Esports", achievement: "Regional finals MVP" },
  ],
  announcements: [
    { id: 1, date: "2026-09-01", title: "Batch 06 registration is open", body: "Applications for the next one-month intake are open now. Spots are limited to keep coach attention high — register through the homepage." },
    { id: 2, date: "2026-08-18", title: "Batch 05 graduation results", body: "18 players completed the full four weeks. Full results and standout performers are on the Graduates page." },
  ],
  training: [
    { week: 1, title: "Fundamentals & Mechanics", desc: "Rebuilding the basics with intention: crosshair placement, sensitivity tuning, recoil control drills, and movement fundamentals specific to your track.", tags: ["Aim drills", "Settings audit", "Movement"] },
    { week: 2, title: "Precision & Reaction", desc: "Daily reps on flick accuracy and reaction time, plus film review of your own matches to catch mechanical habits holding you back.", tags: ["VOD review", "Reflex training", "1-on-1 coaching"] },
    { week: 3, title: "Game Sense & Strategy", desc: "Shift from mechanics to decisions — map control, timing, team calling (Esports track) or duel discipline and positioning (Headshot track).", tags: ["Strategy sessions", "Shot-calling", "Positioning"] },
    { week: 4, title: "Competitive Simulation", desc: "Scrims and simulated matches under tournament conditions, with a final assessment that determines your graduate placement.", tags: ["Live scrims", "Final assessment", "Graduation"] },
  ]
};

const RA_DOC_KEYS = Object.keys(RA_DEFAULTS);
let raCache = {};

async function raInit(){
  await Promise.all(RA_DOC_KEYS.map(async (name) => {
    try{
      const ref = raDb.collection(RA_COLLECTION).doc(name);
      const snap = await ref.get();
      if(snap.exists && snap.data() && snap.data().value !== undefined){
        raCache[name] = snap.data().value;
      }else{
        raCache[name] = RA_DEFAULTS[name];
        await ref.set({ value: RA_DEFAULTS[name] });
      }
    }catch(err){
      console.error("Firestore load failed for", name, err);
      raCache[name] = RA_DEFAULTS[name];
    }
  }));
}

const raReady = raInit();

function raGet(name){
  return raCache[name] ?? RA_DEFAULTS[name];
}

function raSet(name, value){
  raCache[name] = value;
  raDb.collection(RA_COLLECTION).doc(name).set({ value })
    .catch(err => console.error("Firestore save failed for", name, err));
}

function raNextId(list){
  return list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

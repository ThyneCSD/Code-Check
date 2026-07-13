/**
 * AI Meme Factory — data.js
 * All meme templates, caption banks, emoji/sticker banks
 */

/* ============================================================
   MEME TEMPLATES
   Each entry has:
   - id        : unique slug
   - name      : display name
   - url       : public image URL (reliable CDN)
   - panels    : array of { x, y, w, h, align } text boxes
   - layout    : 'top-bottom' | 'left-right' | 'overlay' | 'stacked'
   ============================================================ */
const MEME_TEMPLATES = [
  {
    id: 'drake',
    name: 'Drake Approves',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    panels: [
      { x: 0.5, y: 0.25, w: 0.46, align: 'center', position: 'middle' },
      { x: 0.5, y: 0.75, w: 0.46, align: 'center', position: 'middle' }
    ]
  },
  {
    id: 'distracted',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    panels: [
      { x: 0.5, y: 0.08, w: 0.9, align: 'center', position: 'top' },
      { x: 0.5, y: 0.92, w: 0.9, align: 'center', position: 'bottom' }
    ]
  },
  {
    id: 'twobuttons',
    name: 'Two Buttons',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    panels: [
      { x: 0.3,  y: 0.15, w: 0.35, align: 'center', position: 'top' },
      { x: 0.72, y: 0.15, w: 0.35, align: 'center', position: 'top' }
    ]
  },
  {
    id: 'womancat',
    name: 'Woman Yelling at Cat',
    url: 'https://i.imgflip.com/345v97.jpg',
    panels: [
      { x: 0.25, y: 0.88, w: 0.46, align: 'center', position: 'bottom' },
      { x: 0.75, y: 0.88, w: 0.46, align: 'center', position: 'bottom' }
    ]
  },
  {
    id: 'expandingbrain',
    name: 'Expanding Brain',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    panels: [
      { x: 0.27, y: 0.12, w: 0.5, align: 'center', position: 'middle' },
      { x: 0.27, y: 0.37, w: 0.5, align: 'center', position: 'middle' },
      { x: 0.27, y: 0.62, w: 0.5, align: 'center', position: 'middle' },
      { x: 0.27, y: 0.87, w: 0.5, align: 'center', position: 'middle' }
    ]
  },
  {
    id: 'changemymind',
    name: 'Change My Mind',
    url: 'https://i.imgflip.com/24y43o.jpg',
    panels: [
      { x: 0.5, y: 0.72, w: 0.5, align: 'center', position: 'middle' }
    ]
  },
  {
    id: 'thinkingwl',
    name: 'Thinking About',
    url: 'https://i.imgflip.com/2/3lmzyx.jpg',
    panels: [
      { x: 0.5, y: 0.92, w: 0.9, align: 'center', position: 'bottom' }
    ]
  },
  {
    id: 'uglydog',
    name: 'This Is Fine Dog',
    url: 'https://i.imgflip.com/wxica.jpg',
    panels: [
      { x: 0.5, y: 0.08, w: 0.9, align: 'center', position: 'top' }
    ]
  },
  {
    id: 'gru',
    name: "Gru's Plan",
    url: 'https://i.imgflip.com/26jxvz.jpg',
    panels: [
      { x: 0.5, y: 0.12, w: 0.85, align: 'center', position: 'middle' },
      { x: 0.5, y: 0.37, w: 0.85, align: 'center', position: 'middle' },
      { x: 0.5, y: 0.62, w: 0.85, align: 'center', position: 'middle' },
      { x: 0.5, y: 0.87, w: 0.85, align: 'center', position: 'middle' }
    ]
  },
  {
    id: 'panik',
    name: 'Panik Kalm Panik',
    url: 'https://i.imgflip.com/3qqmuh.jpg',
    panels: [
      { x: 0.5, y: 0.1,  w: 0.85, align: 'center', position: 'middle' },
      { x: 0.5, y: 0.5,  w: 0.85, align: 'center', position: 'middle' },
      { x: 0.5, y: 0.9,  w: 0.85, align: 'center', position: 'middle' }
    ]
  },
  {
    id: 'onedoesnot',
    name: 'One Does Not Simply',
    url: 'https://i.imgflip.com/1bij.jpg',
    panels: [
      { x: 0.5, y: 0.08, w: 0.9, align: 'center', position: 'top' },
      { x: 0.5, y: 0.92, w: 0.9, align: 'center', position: 'bottom' }
    ]
  },
  {
    id: 'ancient',
    name: 'Ancient Aliens',
    url: 'https://i.imgflip.com/26am.jpg',
    panels: [
      { x: 0.5, y: 0.08, w: 0.9, align: 'center', position: 'top' },
      { x: 0.5, y: 0.92, w: 0.9, align: 'center', position: 'bottom' }
    ]
  }
];

/* ============================================================
   CAPTION BANKS
   Normal mode — setup/punchline pairs & single-panel lines
   ============================================================ */

// Two-panel captions [top, bottom]
const CAPTIONS_TWOPANEL = [
  ["Me opening ONE tab for homework", "37 tabs about everything but homework"],
  ["Telling myself I'll sleep early", "Watching conspiracy videos at 3 AM"],
  ["Me: I'll just fix this one bug", "3 new bugs, existential crisis, production down"],
  ["The Wi-Fi: ___working fine___", "Me during a ranked match: disconnected"],
  ["When the teacher says 'this won't be on the test'", "Me instantly forgetting everything I just learned"],
  ["My brain at 2 AM:", "Random embarrassing memory from 8 years ago"],
  ["Me reading the error message", "Me Googling the exact error message anyway"],
  ["The plan: 10-page essay by 8 AM", "What I actually do: clean my room for 4 hours"],
  ["My to-do list on Monday", "My to-do list on Friday (still untouched)"],
  ["When Stack Overflow has the answer", "It's for a completely different version"],
  ["Saying 'I'll start the diet on Monday'", "Pizza for the 11th Monday straight"],
  ["YouTube: recommended video just for you", "Me at 4 AM learning how cheese is made"],
  ["My code in development:", "My code in production:"],
  ["Git commit message: 'fixed stuff'", "What I actually changed: everything"],
  ["The meeting that could've been an email", "The email that spawns 47 more meetings"],
  ["Me: I'm finally being productive", "Phone notification: pulls me back in"],
  ["My alarm: 6:00 AM", "'Just 5 more minutes' — me at 8:47 AM"],
  ["Telling myself I'll meal prep Sunday", "DoorDash opens on my phone"],
  ["'I know what I'm doing'", "Googling 'how to boil water for pasta' at 24"],
  ["Buying a new planner every January", "Using it for exactly 3 days"],
  ["Me going to the gym for one day", "Treating myself to fast food as a reward"],
  ["Copying code from Stack Overflow", "It works. I don't know why. I don't touch it."],
  ["Me naming my variables", "x, x2, x_final, x_FINAL_v2_ACTUALFINAL"],
  ["Starting a side project with full motivation", "Abandoning it the moment it gets slightly hard"],
  ["Reading 'just one chapter' before bed", "3 AM, finished the book, emotional wreck"],
];

// Single-panel captions (for 1-panel templates)
const CAPTIONS_SINGLE = [
  "Pineapple on pizza is a human right",
  "Dark mode is not a preference, it's a personality",
  "The 'S' in IoT stands for security",
  "Real programmers use Notepad",
  "Coffee is just bug juice in a mug",
  "If it's stupid but it works, it's still stupid",
  "I love deadlines — the whooshing sound they make as they fly by",
  "My sleep schedule is just a suggestion at this point",
  "Tabs over spaces or we can't be friends",
  "Hotdog is a sandwich. I will die on this hill.",
  "There is no cloud, it's just someone else's computer having an existential crisis",
  "I put the 'pro' in procrastination",
  "Social anxiety + Wi-Fi = my entire social life",
  "Technically, I'm always on time — just to the wrong meeting",
  "My code doesn't have bugs, it has undocumented features",
  "I'm not lazy, I'm in energy-saving mode",
  "The fastest way to find something is to stop looking for it",
  "404: motivation not found",
];

// Multi-panel (3–4 panel) captions
const CAPTIONS_MULTIPANEL = [
  // Panik/Kalm/Panik style [3 panels]
  ["PANIK: The assignment is due tomorrow", "KALM: It's not due until 11:59 PM", "PANIK: It's currently 11:47 PM"],
  ["PANIK: I forgot to push to main", "KALM: It auto-saved locally", "PANIK: My laptop just died"],
  ["PANIK: Skipped the gym again", "KALM: I'll go tomorrow for sure", "PANIK: Tomorrow is also a day I will not go"],
  // Expanding Brain / Gru style [4 panels]
  ["Using a calculator", "Mental math for simple stuff", "Long division by hand for fun", "Counting on my fingers like a legend"],
  ["Walking fast to avoid small talk", "Pretending to look at my phone", "Sudden coughing fit", "Disappearing into a different aisle entirely"],
  ["Setting 5 alarms", "Snoozin all 5", "Sleep through all of them", "\"I don't need alarms, my body knows\""],
  ["Googling the bug", "Stack Overflow has the answer... in 2009", "The solution is deprecated", "Write the solution yourself. It breaks everything."],
];

/* ============================================================
   CURSED CAPTION BANK
   Maximum chaos energy
   ============================================================ */
const CAPTIONS_CURSED = [
  ["Fr fr no cap bestie this bussin ngl", "SHEEEEEESH my brother in Christ what is you doing"],
  ["Lowkey slaps different fr", "Highkey it do be like that sometimes tho"],
  ["Ratio + L + didn't ask + fell off + stay mad + cope", "Also you smell like cheese"],
  ["When the vibes are immaculate", "But the rizz is on government shutdown"],
  ["NPC behavior detected", "Main character arc: loading... 0%"],
  ["Slay or be slayed bestie", "I choose chaos. Always chaos."],
  ["The council has convened", "Touch grass has been recommended"],
  ["Big yikes energy fr", "We do NOT have the sauce today"],
  ["Pov: you thought you had a plan", "The plan had you actually"],
  ["Insert 'doomscrolling' hours here", "It's giving absolutely nothing and I'm here for it"],
  ["He's so valid for this ngl", "No thoughts, just vibes and red flags"],
  ["Rent free in my head since 2019", "🚫🧠 full capacity, no vacancies"],
  ["Me: maintains eye contact the entire time", "Also me: internal meltdown.exe has stopped responding"],
  ["The delulu is the solulu bestie", "Manifestation loading... please be patient"],
  ["Main character behavior unlocked", "Side effect: becoming insufferable to everyone else"],
];

/* ============================================================
   CHAOS EMOJIS & STICKERS (text overlays)
   ============================================================ */
const CHAOS_EMOJIS = [
  '🔥','💀','😭','🤡','💅','👁️','🗿','⚡','🌀','💫','🎯','💯','🚀','👀',
  '🤌','🥴','🫠','🤣','😤','💢','✨','🌈','💥','🎪','🤖','👾','🕹️','🎮',
];

const CHAOS_STICKER_TEXTS = [
  'BASED', 'SHEESH', 'FR FR', 'NO CAP', 'RATIO', 'L + RATIO',
  'REAL', 'VIBE CHECK', 'BRO...', 'WAIT WHAT', 'OMG', 'HELP',
  'LITERALLY ME', 'YIKES', 'SLAY', 'EXPIRED', 'TOUCHING GRASS',
  'UNSUBSCRIBED', 'RIZZ: 0', 'BASED AND BASED', 'COOKED',
];

/* ============================================================
   WATERMARK / HASHTAG POOL
   ============================================================ */
const HASHTAGS = [
  '#MemeLord', '#AIGenerated', '#NoContext', '#InternetCulture',
  '#MemeFactory', '#Cursed', '#Vibe', '#TouchGrass',
];

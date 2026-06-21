// Full daily timeline, used by the Calendar/Daily page.
// times in 24h "HH:MM" for sorting; label is what's shown.
const DAILY_TIMELINE = [
  {start:"05:00", end:"05:15", label:"Wake up + morning routine", type:"routine"},
  {start:"05:15", end:"05:45", label:"Run / Walk", type:"routine"},
  {start:"05:45", end:"06:00", label:"Fresh up", type:"routine"},
  {start:"06:00", end:"08:00", label:"Block 1 — GATE EEE theory", type:"block1"},
  {start:"08:00", end:"08:15", label:"Breakfast", type:"routine"},
  {start:"08:15", end:"16:00", label:"College", type:"college"},
  {start:"16:00", end:"16:20", label:"Travel back", type:"routine"},
  {start:"16:20", end:"18:00", label:"Rest / buffer", type:"routine"},
  {start:"18:00", end:"20:30", label:"Block 2 — GATE EEE practice + Aptitude", type:"block2"},
  {start:"20:30", end:"20:40", label:"Dinner", type:"routine"},
  {start:"21:00", end:"22:00", label:"Block 3 — Python / Internships / Test", type:"block3"},
  {start:"22:00", end:"22:00", label:"Shutter close", type:"end"},
];

// Block 3 rotation by weekday (0=Sun ... 6=Sat)
const BLOCK3_PLAN = {
  0:"Full mock or rest",
  1:"Python practice",
  2:"Internship/job search + email",
  3:"Python practice",
  4:"Internship/job search + email",
  5:"Python practice",
  6:"Weekly topic test"
};

const WEEKDAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const WEEKDAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Modern study tools/features list — shown on the Quotes+Features area or a help section
const STUDY_FEATURES = [
  {title:"Active recall over re-reading", desc:"Close the notes and try to recall the concept from memory before checking. It builds retention far better than passive reading."},
  {title:"Spaced repetition", desc:"Revisit a topic a few days, then weeks, after first learning it — short refreshers beat one long re-read."},
  {title:"Pomodoro-style focus blocks", desc:"Work in 25–50 min focused sprints with short breaks during Block 1/2 — sustains concentration better than open-ended study."},
  {title:"Error logs", desc:"Keep a running list of every mistake from PYQs/mocks with the reason — most marks lost in GATE are repeat-mistake marks."},
  {title:"Formula sheets you build yourself", desc:"Self-written, one-page formula sheets per subject are far more useful at revision time than someone else's PDF."},
  {title:"Teach-it-back method", desc:"Explain a concept out loud as if teaching someone else — gaps in understanding surface immediately."},
  {title:"Interleaving topics", desc:"Mixing problems from 2-3 subjects in one practice session (especially in Phase 4) mirrors the actual exam better than single-subject blocks."},
  {title:"Mock test postmortems", desc:"The 30 minutes after a mock reviewing wrong answers matters more than the mock itself."},
  {title:"Distraction-free phone mode", desc:"Use a focus/DND mode during Block 1 and Block 2 — even silent notifications break recall chains."},
  {title:"Sleep consistency", desc:"A fixed wake time (like your 5 AM) does more for retention than extra late-night hours ever will."},
];

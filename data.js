const WEEKS = [
{p:1,w:1,topic:"Linear Algebra",b1:'YouTube: "Ravindrababu Ravula Linear Algebra"',b2:'GATE Overflow + IMS India topic test'},
{p:1,w:2,topic:"Calculus",b1:'YouTube: "Ravindrababu Ravula Calculus GATE"',b2:'GATE Overflow + IMS India topic test'},
{p:1,w:3,topic:"Differential Equations",b1:'YouTube: "Ravindrababu Ravula Differential Equations"',b2:'GATE Overflow + SelfStudys topic test'},
{p:1,w:4,topic:"Complex Analysis + Probability",b1:'YouTube: "RBR Complex Variables" + "Probability and Statistics GATE"',b2:'SelfStudys + GATE Overflow PYQs'},
{p:1,w:5,topic:"Network Theory I",b1:'YouTube: "Gate Smashers Network Theory"',b2:'GATE Overflow + IMS topic test'},
{p:1,w:6,topic:"Network Theory II",b1:'YouTube: "Gate Smashers Network Theorems"',b2:'IMS India + GATE Overflow PYQs'},
{p:1,w:7,topic:"Network Theory III",b1:'YouTube: "Gate Smashers Two Port Network"',b2:'GATE Overflow PYQs'},
{p:1,w:8,topic:"Electric Circuits (AC, 3-phase)",b1:'YouTube: "Gate Smashers AC Circuits"',b2:'SelfStudys topic test'},
{p:1,w:9,topic:"Signals & Systems I",b1:'YouTube: "Neso Academy Signals and Systems"',b2:'GATE Overflow PYQs'},
{p:1,w:10,topic:"Signals & Systems II",b1:'YouTube: "Neso Academy Fourier Transform / Z Transform"',b2:'IMS topic test + Sat full Phase 1 test'},
{p:2,w:11,topic:"Electrical Machines I (DC)",b1:'YouTube: "Gate Smashers DC Machines"',b2:'GATE Overflow PYQs'},
{p:2,w:12,topic:"Electrical Machines II (Transformers)",b1:'YouTube: "Gate Smashers Transformers GATE"',b2:'IMS topic test'},
{p:2,w:13,topic:"Electrical Machines III (Induction/Sync)",b1:'YouTube: "Gate Smashers Induction Motor / Synchronous Machine"',b2:'GATE Overflow PYQs + Sat full test'},
{p:2,w:14,topic:"Power Systems I (Transmission)",b1:'YouTube: "Gate Smashers Transmission Lines GATE"',b2:'SelfStudys topic test'},
{p:2,w:15,topic:"Power Systems II (Distribution, PU)",b1:'YouTube: "Gate Smashers Per Unit System"',b2:'IMS topic test'},
{p:2,w:16,topic:"Power Systems III (Faults, Stability)",b1:'YouTube: "Gate Smashers Fault Analysis Power System"',b2:'GATE Overflow + Sat full test'},
{p:2,w:17,topic:"Control Systems I",b1:'YouTube: "Gate Smashers Control Systems"',b2:'SelfStudys topic test'},
{p:2,w:18,topic:"Control Systems II (Routh, Bode)",b1:'YouTube: "Gate Smashers Root Locus / Bode Plot"',b2:'GATE Overflow PYQs'},
{p:2,w:19,topic:"Power Electronics I",b1:'YouTube: "Gate Smashers Power Electronics Rectifiers"',b2:'IMS topic test'},
{p:2,w:20,topic:"Power Electronics II",b1:'YouTube: "Gate Smashers Inverters GATE / Choppers"',b2:'GATE Overflow + Sat full Phase 2 test'},
{p:3,w:21,topic:"Measurements I",b1:'YouTube: "Gate Smashers Measurements GATE EE"',b2:'SelfStudys topic test'},
{p:3,w:22,topic:"Measurements II",b1:'YouTube: "Gate Smashers Instrument Transformers"',b2:'IMS topic test'},
{p:3,w:23,topic:"Analog Electronics",b1:'YouTube: "Neso Academy Analog Electronics"',b2:'GATE Overflow PYQs'},
{p:3,w:24,topic:"Digital Electronics",b1:'YouTube: "Neso Academy Digital Electronics"',b2:'IMS topic test'},
{p:3,w:25,topic:"General Aptitude (daily)",b1:'YouTube: "Ravindrababu Ravula GATE Aptitude"',b2:'SelfStudys Aptitude daily'},
{p:3,w:26,topic:"Weak Topic Buffer",b1:'Re-watch flagged weak sub-topics only',b2:'GATE Overflow targeted PYQs + Sat full Phase 3 test'},
{p:4,w:27,topic:"Revision: Maths+NT+Circuits",b1:'Own notes, fast pace',b2:'SelfStudys mixed test'},
{p:4,w:28,topic:"Revision: Machines+Power Sys",b1:'Own notes, fast pace',b2:'IMS mixed test'},
{p:4,w:29,topic:"Revision: CS+PE+Meas+Electronics",b1:'Own notes, fast pace',b2:'SelfStudys mixed test'},
{p:4,w:30,topic:"Mock Sprint Round 1",b1:'Full 3hr mock, Mon/Wed/Fri',b2:'Anubhav by Made Easy, review wrong answers'},
{p:4,w:31,topic:"Mock Sprint Round 2",b1:'Full mock, alternate days',b2:'Anubhav + Official IIT mock'},
{p:4,w:32,topic:"Mock Sprint Round 3",b1:'Full mock, alternate days',b2:'Official IIT GOAPS mock priority'},
{p:4,w:33,topic:"Final Week — Light Revision",b1:'Formula sheets only, no new content',b2:'15-20 recall Qs/day max, rest well'},
];

const PHASE_NAME = {1:"Foundations",2:"Core heavy",3:"Strengthening",4:"Revision + mocks"};
const PHASE_VAR = {1:"--phase1",2:"--phase2",3:"--phase3",4:"--phase4"};

const RANKS = [
  {min:0,    name:"Rookie",        sub:"Just getting started"},
  {min:150,  name:"Aspirant",      sub:"Building the habit"},
  {min:400,  name:"Grinder",       sub:"Momentum is real"},
  {min:800,  name:"Strategist",    sub:"Past the halfway mark"},
  {min:1400, name:"Topper",        sub:"Elite consistency"},
  {min:2200, name:"GATE Qualifier",sub:"Exam-ready discipline"},
];

const START_DATE = new Date(2026,5,20);
const EXAM_DATE = new Date(2027,1,7);

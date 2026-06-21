const STORAGE_KEY = 'gate-quest-state-v2';

let state = {
  currentWeek: 1,
  days: {},
  weakTopics: [],
  weekDone: {},
  page: 'today',
  lastQuoteDate: null,
  lastQuoteIdx: null,
  notifAsked: false
};

function todayKey(d){
  d = d || new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function daysBetween(a,b){ return Math.round((b-a)/86400000); }
function fmtDate(d){ return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }
function fmtTime12(hhmm){
  const [h,m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12; if(h12===0) h12=12;
  return h12 + (m ? ':'+String(m).padStart(2,'0') : '') + ' ' + ampm;
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ state = Object.assign(state, JSON.parse(raw)); }
  }catch(e){}
  if(!state.currentWeek || state.currentWeek < 1){
    const wk = Math.floor(daysBetween(START_DATE, new Date()) / 7) + 1;
    state.currentWeek = Math.max(1, Math.min(33, wk));
  }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.error('save failed', e); }
}

function getDay(key){
  if(!state.days[key]) state.days[key] = {b1:false,b2:false,b3:false};
  return state.days[key];
}

function calcStreak(){
  let streak = 0;
  let d = new Date();
  let first = true;
  while(true){
    const key = todayKey(d);
    const day = state.days[key];
    if(first && key === todayKey()){
      first = false;
      d.setDate(d.getDate()-1);
      continue;
    }
    if(day && day.b1 && day.b2){ streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function calcXP(){
  let xp = 0;
  Object.values(state.days).forEach(d=>{
    if(d.b1) xp += 20;
    if(d.b2) xp += 20;
    if(d.b3) xp += 10;
  });
  Object.values(state.weekDone).forEach(v=>{ if(v) xp += 60; });
  return xp;
}

function getRank(xp){
  let cur = RANKS[0];
  for(const r of RANKS){ if(xp >= r.min) cur = r; }
  const idx = RANKS.indexOf(cur);
  const next = RANKS[idx+1];
  return {cur, next};
}

function weekData(w){ return WEEKS.find(x=>x.w===w); }

function icon(name, size){
  size = size || 18;
  const paths = {
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
    flame: '<path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-2-1-3-1-3 2 1 3 4 3 6a8 8 0 1 1-16 0c0-4 3-6 4-7 1-1 2-2 2-3 1 1 1 0 2 0Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    pencil: '<path d="m18 2 4 4-13 13-5 1 1-5L18 2Z"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    x: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h.75c0 2.25.25 4-3.75 4v2Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
  };
  return '<svg class="icon" style="width:'+size+'px;height:'+size+'px" viewBox="0 0 24 24">'+paths[name]+'</svg>';
}

function dailyQuote(){
  const key = todayKey();
  if(state.lastQuoteDate === key && state.lastQuoteIdx !== null && state.lastQuoteIdx !== undefined){
    return QUOTES[state.lastQuoteIdx];
  }
  const idx = Math.floor(Math.random()*QUOTES.length);
  state.lastQuoteDate = key;
  state.lastQuoteIdx = idx;
  saveState();
  return QUOTES[idx];
}

// ---------- NAV ----------
const PAGES = [
  {id:'today', label:'Today', icon:'home'},
  {id:'calendar', label:'Calendar', icon:'calendar'},
  {id:'alerts', label:'Alerts', icon:'bell'},
  {id:'roadmap', label:'Roadmap', icon:'map'},
];

function renderNav(){
  const nav = document.getElementById('bottom-nav-inner');
  nav.innerHTML = PAGES.map(p=>`
    <button class="nav-btn ${state.page===p.id?'active':''}" data-page="${p.id}">
      ${icon(p.icon, 19)}
      <span>${p.label}</span>
    </button>
  `).join('');
  nav.querySelectorAll('[data-page]').forEach(el=>{
    el.onclick = ()=>{ state.page = el.dataset.page; saveState(); render(); };
  });
}

// ---------- MAIN RENDER ----------
function render(){
  renderNav();
  const app = document.getElementById('app');
  const todayDay = getDay(todayKey());
  const wd = weekData(state.currentWeek);

  let html = '';
  if(state.page === 'today') html = pageToday(todayDay, wd);
  if(state.page === 'calendar') html = pageCalendar();
  if(state.page === 'alerts') html = pageAlerts(todayDay, wd);
  if(state.page === 'roadmap') html = pageRoadmap();

  app.innerHTML = html;
  attachHandlers(todayDay, wd);
}

// ---------- TODAY PAGE ----------
function pageToday(todayDay, wd){
  const baseStreak = calcStreak();
  const todayBonus = (todayDay.b1 && todayDay.b2) ? 1 : 0;
  const displayStreak = baseStreak + todayBonus;
  const xp = calcXP();
  const {cur, next} = getRank(xp);
  const rankProgress = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
  const examDaysLeft = daysBetween(new Date(), EXAM_DATE);
  const weeksDoneCount = Object.values(state.weekDone).filter(Boolean).length;
  const progressPct = Math.round((weeksDoneCount / 33) * 100);
  const q = dailyQuote();
  const phaseColor = `var(${PHASE_VAR[wd.p]})`;

  let missingList = [];
  if(!todayDay.b1) missingList.push('Block 1');
  if(!todayDay.b2) missingList.push('Block 2');
  if(!todayDay.b3) missingList.push('Block 3');
  const allDone = missingList.length === 0;

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 16px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:var(--accent);">${icon('bolt',20)}</span>
        <span style="font-weight:600;font-size:17px;letter-spacing:-0.01em;">GATE Quest</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;background:var(--bg-card);border:1px solid var(--line-2);padding:6px 12px;border-radius:20px;">
        <span style="color:var(--warn);">${icon('flame',15)}</span>
        <span style="font-size:13px;font-weight:600;">${displayStreak}</span>
      </div>
    </div>

    <div style="display:flex;gap:10px;background:var(--bg-card);border:1px solid var(--line-2);border-radius:var(--radius-md);padding:13px 14px;margin-bottom:14px;">
      <span style="color:var(--accent);flex-shrink:0;margin-top:1px;">${icon('quote',16)}</span>
      <div>
        <div style="font-family:var(--serif);font-size:13.5px;line-height:1.5;font-style:italic;color:var(--text);">"${escapeHtml(q.t)}"</div>
        <div style="font-size:11.5px;color:var(--text-faint);margin-top:5px;">— ${escapeHtml(q.a)}</div>
      </div>
    </div>

    <div style="background:linear-gradient(180deg,var(--bg-card-2),var(--bg-card));border:1px solid var(--line-2);border-radius:var(--radius-lg);padding:16px 18px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div>
          <div style="font-family:var(--serif);font-size:20px;font-weight:600;">${cur.name}</div>
          <div style="font-size:12.5px;color:var(--text-dim);margin-top:2px;">${cur.sub}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:17px;font-weight:600;color:var(--accent);">${xp}</div>
          <div style="font-size:11px;color:var(--text-faint);">XP</div>
        </div>
      </div>
      <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${rankProgress}%;background:var(--accent);"></div>
      </div>
      ${next ? `<div style="font-size:11px;color:var(--text-faint);margin-top:6px;">${next.min - xp} XP to ${next.name}</div>` : `<div style="font-size:11px;color:var(--success);margin-top:6px;">Max rank reached</div>`}
    </div>

    <div style="display:flex;align-items:center;gap:10px;background:${allDone ? 'rgba(76,168,118,0.12)' : 'rgba(217,105,90,0.12)'};border:1px solid ${allDone ? 'rgba(76,168,118,0.3)' : 'rgba(217,105,90,0.3)'};border-radius:var(--radius-md);padding:11px 14px;margin-bottom:14px;">
      <span style="color:${allDone ? 'var(--success)' : 'var(--danger)'};flex-shrink:0;">${icon(allDone ? 'check' : 'alert', 16)}</span>
      <span style="font-size:12.5px;color:${allDone ? 'var(--success)' : 'var(--danger)'};">${allDone ? 'All blocks done today — streak is safe.' : 'Pending today: ' + missingList.join(', ')}</span>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px;">
      <div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:10px;">
        <div style="font-size:10.5px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;">Week</div>
        <div style="font-size:17px;font-weight:600;margin-top:2px;">${state.currentWeek}/33</div>
      </div>
      <div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:10px;">
        <div style="font-size:10.5px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;">Exam in</div>
        <div style="font-size:17px;font-weight:600;margin-top:2px;">${examDaysLeft}d</div>
      </div>
      <div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:10px;">
        <div style="font-size:10.5px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;">Plan</div>
        <div style="font-size:17px;font-weight:600;margin-top:2px;">${progressPct}%</div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <span style="font-size:12px;color:${phaseColor};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">${PHASE_NAME[wd.p]} &middot; Week ${wd.w}</span>
      <select id="week-select"></select>
    </div>
    <div style="font-family:var(--serif);font-size:18px;font-weight:600;margin-bottom:14px;">${wd.topic}</div>

    <div style="display:flex;flex-direction:column;gap:10px;">
      ${questCard('b1','book','Block 1 — theory','6:00–8:00 AM',wd.b1,todayDay.b1)}
      ${questCard('b2','pencil','Block 2 — practice','6:00–8:30 PM',wd.b2,todayDay.b2)}
      ${questCard('b3','code','Block 3 — '+BLOCK3_PLAN[new Date().getDay()],'9:00–10:00 PM','Today: '+BLOCK3_PLAN[new Date().getDay()],todayDay.b3)}
    </div>

    <div style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:12.5px;color:var(--text-dim);">Mark week ${wd.w} fully complete</span>
      <button id="complete-week" style="${state.weekDone[wd.w] ? 'background:rgba(76,168,118,0.15);border-color:var(--success);color:var(--success);' : ''}">
        ${state.weekDone[wd.w] ? icon('check',13)+' Completed' : 'Complete (+60 XP)'}
      </button>
    </div>

    <div style="margin-top:22px;">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Weak topics</div>
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <input id="weak-input" type="text" placeholder="e.g. h-parameters" style="flex:1;"/>
        <button id="weak-add" style="width:auto;padding:0 16px;">Add</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:7px;">
        ${state.weakTopics.length === 0 ? `<div style="font-size:12.5px;color:var(--text-faint);padding:10px 0;">No weak topics yet — add one whenever something doesn't click.</div>` :
        state.weakTopics.map((t,i)=>`
          <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);border-radius:var(--radius-sm);padding:9px 12px;">
            <span style="font-size:13px;">${escapeHtml(t)}</span>
            <button data-idx="${i}" class="weak-remove" aria-label="Remove" style="width:auto;padding:2px 6px;border:none;background:transparent;color:var(--text-faint);">${icon('x',13)}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function questCard(id, iconName, label, time, desc, done){
  return `
    <div style="display:flex;align-items:flex-start;gap:12px;background:${done ? 'rgba(76,168,118,0.1)' : 'var(--bg-card)'};border:1px solid ${done ? 'rgba(76,168,118,0.3)' : 'var(--line-2)'};border-radius:var(--radius-md);padding:13px 14px;">
      <span style="color:${done ? 'var(--success)' : 'var(--text-dim)'};margin-top:2px;flex-shrink:0;">${icon(iconName,17)}</span>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:3px;">
          <span style="font-size:13px;font-weight:600;color:${done ? 'var(--success)' : 'var(--text)'};">${label}</span>
          <span style="font-size:11px;color:var(--text-faint);flex-shrink:0;">${time}</span>
        </div>
        <div style="font-size:12.5px;color:var(--text-dim);line-height:1.5;">${desc}</div>
      </div>
      <button id="toggle-${id}" aria-label="Toggle done" style="width:26px;height:26px;flex-shrink:0;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;${done ? 'background:var(--success);border-color:var(--success);color:#06140d;' : ''}">
        ${done ? icon('check',13) : ''}
      </button>
    </div>
  `;
}

// ---------- CALENDAR PAGE ----------
function pageCalendar(){
  const now = new Date();
  const todayLabel = now.toLocaleDateString('en-IN',{weekday:'long', day:'numeric', month:'long'});
  const wd = weekData(state.currentWeek);
  const dow = now.getDay();

  const timelineRows = DAILY_TIMELINE.map(slot=>{
    const isBlock = slot.type.startsWith('block');
    let color = 'var(--text-dim)';
    let bg = 'transparent';
    if(slot.type==='block1'){ color='var(--phase1)'; bg='rgba(63,140,182,0.08)'; }
    if(slot.type==='block2'){ color='var(--phase2)'; bg='rgba(201,138,63,0.08)'; }
    if(slot.type==='block3'){ color='var(--phase3)'; bg='rgba(95,168,106,0.08)'; }
    if(slot.type==='college'){ color='var(--text-faint)'; }
    return `
      <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);">
        <div style="width:78px;flex-shrink:0;font-size:11.5px;color:var(--text-faint);padding-top:1px;">
          ${fmtTime12(slot.start)}${slot.end!==slot.start ? '–'+fmtTime12(slot.end) : ''}
        </div>
        <div style="flex:1;background:${bg};border-radius:6px;padding:${isBlock?'4px 8px':'0'};">
          <div style="font-size:13px;color:${color};font-weight:${isBlock?'600':'400'};">${slot.label}</div>
        </div>
      </div>
    `;
  }).join('');

  // simple week grid: current week's 7 days with state
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dow); // back to Sunday
  let weekCells = '';
  for(let i=0;i<7;i++){
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate()+i);
    const key = todayKey(d);
    const day = state.days[key] || {};
    const isToday = key === todayKey();
    const doneCount = (day.b1?1:0)+(day.b2?1:0)+(day.b3?1:0);
    let fill = 'var(--bg-card)';
    if(doneCount===3) fill = 'rgba(76,168,118,0.25)';
    else if(doneCount>0) fill = 'rgba(224,162,59,0.2)';
    weekCells += `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="font-size:10px;color:var(--text-faint);">${WEEKDAY_SHORT[i]}</div>
        <div style="width:34px;height:34px;border-radius:8px;background:${fill};border:${isToday?'2px solid var(--accent)':'1px solid var(--line-2)'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:${doneCount===3?'var(--success)':'var(--text-dim)'};">
          ${d.getDate()}
        </div>
      </div>
    `;
  }

  return `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0 16px;">
      <span style="color:var(--accent);">${icon('calendar',20)}</span>
      <span style="font-weight:600;font-size:17px;">Calendar</span>
    </div>

    <div style="font-size:13px;color:var(--text-dim);margin-bottom:10px;">${todayLabel}</div>

    <div style="display:flex;justify-content:space-between;background:var(--bg-card);border:1px solid var(--line-2);border-radius:var(--radius-md);padding:12px 10px;margin-bottom:18px;">
      ${weekCells}
    </div>

    <div style="font-size:13px;font-weight:600;margin-bottom:4px;">This week's topic</div>
    <div style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Week ${wd.w} &middot; ${escapeHtml(wd.topic)}</div>

    <div style="font-size:13px;font-weight:600;margin-bottom:6px;">Daily timeline</div>
    <div style="margin-bottom:8px;">
      ${timelineRows}
    </div>
    <div style="font-size:11px;color:var(--text-faint);margin-top:10px;line-height:1.5;">Block 1 = theory &middot; Block 2 = practice &middot; Block 3 = Python/internships/test (rotates by day)</div>
  `;
}

// ---------- ALERTS PAGE ----------
function pageAlerts(todayDay, wd){
  const alerts = buildAlerts(state, wd, todayDay);
  const permission = ('Notification' in window) ? Notification.permission : 'unsupported';

  const alertCards = alerts.map(a=>{
    const colorMap = {danger:'var(--danger)', warn:'var(--warn)', success:'var(--success)'};
    const bgMap = {danger:'rgba(217,105,90,0.1)', warn:'rgba(224,162,59,0.1)', success:'rgba(76,168,118,0.1)'};
    const borderMap = {danger:'rgba(217,105,90,0.3)', warn:'rgba(224,162,59,0.3)', success:'rgba(76,168,118,0.3)'};
    return `
      <div style="display:flex;gap:10px;background:${bgMap[a.level]};border:1px solid ${borderMap[a.level]};border-radius:var(--radius-md);padding:12px 14px;margin-bottom:10px;">
        <span style="color:${colorMap[a.level]};flex-shrink:0;margin-top:1px;">${icon(a.level==='success'?'check':'alert',16)}</span>
        <span style="font-size:13px;color:var(--text);line-height:1.5;">${escapeHtml(a.text)}</span>
      </div>
    `;
  }).join('');

  let notifSection = '';
  if(permission === 'unsupported'){
    notifSection = `<div style="font-size:12px;color:var(--text-faint);">Notifications aren't supported in this browser.</div>`;
  } else if(permission === 'granted'){
    notifSection = `<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--success);">${icon('check',14)} Notifications enabled — you'll get alerts when you open the app.</div>`;
  } else if(permission === 'denied'){
    notifSection = `<div style="font-size:12.5px;color:var(--text-faint);">Notifications blocked. Enable them in your browser/site settings if you want alerts on open.</div>`;
  } else {
    notifSection = `<button id="enable-notif" style="width:100%;background:var(--accent-dim);border-color:var(--accent);color:var(--text);padding:11px;font-weight:600;">${icon('bell',14)} Enable notifications</button>`;
  }

  return `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0 16px;">
      <span style="color:var(--accent);">${icon('bell',20)}</span>
      <span style="font-weight:600;font-size:17px;">Alerts</span>
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--line-2);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:16px;">
      ${notifSection}
    </div>

    <div style="font-size:11.5px;color:var(--text-faint);margin-bottom:14px;line-height:1.5;">
      This is a phone-installed app with no backend server, so it can't push alerts while fully closed — but every time you open it, it checks where you stand and can fire a notification immediately if enabled.
    </div>

    ${alertCards}
  `;
}

// ---------- ROADMAP PAGE ----------
function pageRoadmap(){
  const phases = [1,2,3,4];
  const body = phases.map(p=>{
    const wks = WEEKS.filter(w=>w.p===p);
    const color = `var(${PHASE_VAR[p]})`;
    return `
      <div style="margin-bottom:16px;">
        <div style="font-size:12px;font-weight:600;color:${color};text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">${PHASE_NAME[p]} &middot; W${wks[0].w}-${wks[wks.length-1].w}</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">
          ${wks.map(w=>{
            const done = state.weekDone[w.w];
            const isCurrent = w.w === state.currentWeek;
            return `<button data-week="${w.w}" style="aspect-ratio:1;padding:0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;
              border:${isCurrent ? '2px solid var(--accent)' : '1px solid var(--line-2)'};
              background:${done ? 'rgba(76,168,118,0.18)' : 'var(--bg-card)'};
              color:${done ? 'var(--success)' : 'var(--text-dim)'};">${w.w}</button>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  const features = STUDY_FEATURES.map(f=>`
    <div style="background:var(--bg-card);border:1px solid var(--line-2);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:8px;">
      <div style="font-size:13px;font-weight:600;margin-bottom:3px;">${escapeHtml(f.title)}</div>
      <div style="font-size:12px;color:var(--text-dim);line-height:1.5;">${escapeHtml(f.desc)}</div>
    </div>
  `).join('');

  return `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0 16px;">
      <span style="color:var(--accent);">${icon('map',20)}</span>
      <span style="font-weight:600;font-size:17px;">Roadmap</span>
    </div>

    ${body}

    <div style="margin-top:8px;font-size:13px;font-weight:600;margin-bottom:10px;">Study techniques worth using</div>
    ${features}
  `;
}

function attachHandlers(todayDay, wd){
  // week select (today page)
  const sel = document.getElementById('week-select');
  if(sel){
    WEEKS.forEach(w=>{
      const opt = document.createElement('option');
      opt.value = w.w; opt.textContent = 'Week ' + w.w;
      if(w.w === state.currentWeek) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = (e)=>{ state.currentWeek = parseInt(e.target.value); saveState(); render(); };
  }

  const completeBtn = document.getElementById('complete-week');
  if(completeBtn){
    completeBtn.onclick = ()=>{
      state.weekDone[wd.w] = !state.weekDone[wd.w];
      saveState(); render();
    };
  }

  ['b1','b2','b3'].forEach(b=>{
    const el = document.getElementById('toggle-'+b);
    if(el) el.onclick = ()=>{
      const day = getDay(todayKey());
      day[b] = !day[b];
      saveState(); render();
    };
  });

  const weakAdd = document.getElementById('weak-add');
  if(weakAdd){
    weakAdd.onclick = ()=>{
      const inp = document.getElementById('weak-input');
      if(inp.value.trim()){ state.weakTopics.push(inp.value.trim()); inp.value=''; saveState(); render(); }
    };
  }
  document.querySelectorAll('.weak-remove').forEach(el=>{
    el.onclick = ()=>{ state.weakTopics.splice(parseInt(el.dataset.idx),1); saveState(); render(); };
  });

  document.querySelectorAll('[data-week]').forEach(el=>{
    el.onclick = ()=>{ state.currentWeek = parseInt(el.dataset.week); state.page='today'; saveState(); render(); };
  });

  const enableNotif = document.getElementById('enable-notif');
  if(enableNotif){
    enableNotif.onclick = async ()=>{
      await requestNotificationPermission();
      render();
    };
  }
}

function escapeHtml(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ---------- INIT ----------
loadState();
render();

// best-effort open-time notification check
setTimeout(()=>{
  const wd = weekData(state.currentWeek);
  const todayDay = getDay(todayKey());
  runOpenTimeNotificationCheck(state, wd, todayDay);
}, 1200);

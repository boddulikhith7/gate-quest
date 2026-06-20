const STORAGE_KEY = 'gate-quest-state-v1';

let state = {
  currentWeek: 1,
  days: {},
  weakTopics: [],
  weekDone: {},
  view: 'today'
};

function todayKey(d){
  d = d || new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function daysBetween(a,b){ return Math.round((b-a)/86400000); }
function fmtDate(d){ return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }

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
  };
  return '<svg class="icon" style="width:'+size+'px;height:'+size+'px" viewBox="0 0 24 24">'+paths[name]+'</svg>';
}

function render(){
  const app = document.getElementById('app');
  const todayDay = getDay(todayKey());
  const baseStreak = calcStreak();
  const todayBonus = (todayDay.b1 && todayDay.b2) ? 1 : 0;
  const displayStreak = baseStreak + todayBonus;
  const xp = calcXP();
  const {cur, next} = getRank(xp);
  const wd = weekData(state.currentWeek);
  const examDaysLeft = daysBetween(new Date(), EXAM_DATE);
  const weeksDoneCount = Object.values(state.weekDone).filter(Boolean).length;
  const progressPct = Math.round((weeksDoneCount / 33) * 100);
  const rankProgress = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100;

  let missingList = [];
  if(!todayDay.b1) missingList.push('Block 1');
  if(!todayDay.b2) missingList.push('Block 2');
  if(!todayDay.b3) missingList.push('Block 3');
  const allDone = missingList.length === 0;

  app.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 18px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:var(--accent);">${icon('bolt',20)}</span>
        <span style="font-weight:600;font-size:17px;letter-spacing:-0.01em;">GATE Quest</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;background:var(--bg-card);border:1px solid var(--line-2);padding:6px 12px;border-radius:20px;">
        <span style="color:var(--warn);">${icon('flame',15)}</span>
        <span style="font-size:13px;font-weight:600;">${displayStreak}</span>
      </div>
    </div>

    <div style="background:linear-gradient(180deg,var(--bg-card-2),var(--bg-card));border:1px solid var(--line-2);border-radius:var(--radius-lg);padding:18px 20px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div>
          <div style="font-family:var(--serif);font-size:22px;font-weight:600;">${cur.name}</div>
          <div style="font-size:13px;color:var(--text-dim);margin-top:2px;">${cur.sub}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:18px;font-weight:600;color:var(--accent);">${xp}</div>
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

    <div style="display:flex;gap:6px;margin-bottom:16px;border-bottom:1px solid var(--line);padding-bottom:0;">
      ${tabBtn('today','Today')}
      ${tabBtn('roadmap','Roadmap')}
      ${tabBtn('weak','Weak spots')}
    </div>

    <div id="view-content" style="padding-bottom:32px;"></div>
  `;

  document.querySelectorAll('[data-tab]').forEach(el=>{
    el.onclick = ()=>{ state.view = el.dataset.tab; render(); };
  });

  const content = document.getElementById('view-content');

  if(state.view === 'today') renderToday(content, wd, todayDay);
  if(state.view === 'roadmap') renderRoadmap(content);
  if(state.view === 'weak') renderWeak(content);
}

function tabBtn(id, label){
  const active = state.view === id;
  return `<button data-tab="${id}" style="flex:1;border:none;border-bottom:2px solid ${active ? 'var(--accent)' : 'transparent'};background:transparent;border-radius:0;padding:8px 4px;color:${active ? 'var(--text)' : 'var(--text-dim)'};font-weight:${active ? '600' : '400'};">${label}</button>`;
}

function renderToday(content, wd, todayDay){
  const phaseColor = `var(${PHASE_VAR[wd.p]})`;
  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <span style="font-size:12px;color:${phaseColor};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">${PHASE_NAME[wd.p]} &middot; Week ${wd.w}</span>
      <select id="week-select"></select>
    </div>
    <div style="font-family:var(--serif);font-size:19px;font-weight:600;margin-bottom:14px;">${wd.topic}</div>

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
  `;

  const sel = document.getElementById('week-select');
  WEEKS.forEach(w=>{
    const opt = document.createElement('option');
    opt.value = w.w; opt.textContent = 'Week ' + w.w;
    if(w.w === state.currentWeek) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.onchange = (e)=>{ state.currentWeek = parseInt(e.target.value); saveState(); render(); };

  document.getElementById('complete-week').onclick = ()=>{
    state.weekDone[wd.w] = !state.weekDone[wd.w];
    saveState(); render();
  };
  ['b1','b2','b3'].forEach(b=>{
    const el = document.getElementById('toggle-'+b);
    if(el) el.onclick = ()=>{
      const day = getDay(todayKey());
      day[b] = !day[b];
      saveState(); render();
    };
  });
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

function renderRoadmap(content){
  const phases = [1,2,3,4];
  content.innerHTML = phases.map(p=>{
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
  content.querySelectorAll('[data-week]').forEach(el=>{
    el.onclick = ()=>{ state.currentWeek = parseInt(el.dataset.week); state.view='today'; saveState(); render(); };
  });
}

function renderWeak(content){
  content.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:14px;">
      <input id="weak-input" type="text" placeholder="e.g. h-parameters" style="flex:1;"/>
      <button id="weak-add" style="width:auto;padding:0 16px;">Add</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${state.weakTopics.length === 0 ? `<div style="font-size:13px;color:var(--text-faint);padding:24px 0;text-align:center;">No weak topics yet. Add one whenever something doesn't click.</div>` :
      state.weakTopics.map((t,i)=>`
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);border-radius:var(--radius-sm);padding:11px 13px;">
          <span style="font-size:13.5px;">${escapeHtml(t)}</span>
          <button data-idx="${i}" class="weak-remove" aria-label="Remove" style="width:auto;padding:2px 6px;border:none;background:transparent;color:var(--text-faint);">${icon('x',14)}</button>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:14px;font-size:11.5px;color:var(--text-faint);line-height:1.5;">This list is your Week 26 buffer agenda — revisit these instead of full playlists.</div>
  `;
  document.getElementById('weak-add').onclick = ()=>{
    const inp = document.getElementById('weak-input');
    if(inp.value.trim()){ state.weakTopics.push(inp.value.trim()); inp.value=''; saveState(); render(); }
  };
  content.querySelectorAll('.weak-remove').forEach(el=>{
    el.onclick = ()=>{ state.weakTopics.splice(parseInt(el.dataset.idx),1); saveState(); render(); };
  });
}

function escapeHtml(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

loadState();
render();

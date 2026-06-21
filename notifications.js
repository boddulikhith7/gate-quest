// Notifications module.
// HONEST LIMITATION: this is a static site with no backend, so it cannot push
// notifications while the app/browser is fully closed (that needs a server).
// What this DOES do:
//  1. Computes alerts every time the app is opened/foregrounded ("catch-up" alerts)
//  2. Fires a real OS-level Notification via the Notifications API if permission
//     is granted AND the app/tab is open or was just reopened (works great for
//     "opened it once this morning, get a notification immediately" use cases,
//     and on Android, installed PWAs can show these even briefly backgrounded).

const NOTIF_PERMISSION_KEY = 'gate-quest-notif-permission-asked';

function getDayOfWeekMon0(d){
  // returns 0=Mon ... 6=Sun, used for "days left until Sunday" math
  const jsDay = d.getDay(); // 0=Sun..6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;
}

function daysLeftInWeek(d){
  // days remaining until end of week (Sunday night), counting today as day 0 remaining if today is Sunday
  const mon0 = getDayOfWeekMon0(d || new Date());
  return 6 - mon0; // Mon->6, Sun->0
}

function buildAlerts(state, weekData, todayDay){
  const alerts = [];
  const left = daysLeftInWeek(new Date());

  // Lag alert: week not marked complete and time is running out
  if(!state.weekDone[weekData.w]){
    if(left <= 0){
      alerts.push({level:'danger', text:`Week ${weekData.w} ("${weekData.topic}") deadline is today. Finish Block 1 + 2 now to stay on pace.`});
    } else if(left <= 2){
      alerts.push({level:'danger', text:`${left} day${left===1?'':'s'} left to complete Week ${weekData.w} ("${weekData.topic}"). You're cutting it close.`});
    } else if(left <= 4){
      alerts.push({level:'warn', text:`${left} days left to finish Week ${weekData.w} ("${weekData.topic}"). Stay on track and you're free by Sunday.`});
    }
  } else {
    alerts.push({level:'success', text:`Week ${weekData.w} is already complete — you could ease off this week's load if you want to bank time.`});
  }

  // Today's pending blocks
  let missing = [];
  if(!todayDay.b1) missing.push('Block 1');
  if(!todayDay.b2) missing.push('Block 2');
  if(!todayDay.b3) missing.push('Block 3');
  if(missing.length){
    alerts.push({level: missing.length>=2 ? 'danger':'warn', text:`Today still pending: ${missing.join(', ')}. Complete this by 10 PM to keep your streak.`});
  } else {
    alerts.push({level:'success', text:`All of today's blocks are done. Nothing left until tomorrow 6 AM.`});
  }

  // Forward suggestion: if ahead of schedule
  const completedWeeks = Object.keys(state.weekDone).filter(k=>state.weekDone[k]).length;
  const expectedWeek = state.currentWeek;
  if(completedWeeks >= expectedWeek && expectedWeek > 1){
    alerts.push({level:'success', text:`You're at or ahead of pace (${completedWeeks} weeks completed). Finish this week's topic early and the rest of the week is yours.`});
  }

  return alerts;
}

async function requestNotificationPermission(){
  if(!('Notification' in window)) return 'unsupported';
  if(Notification.permission === 'granted') return 'granted';
  if(Notification.permission === 'denied') return 'denied';
  try{
    const res = await Notification.requestPermission();
    return res;
  }catch(e){ return 'denied'; }
}

function fireLocalNotification(title, body){
  if(!('Notification' in window)) return false;
  if(Notification.permission !== 'granted') return false;
  try{
    new Notification(title, {
      body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: 'gate-quest-alert'
    });
    return true;
  }catch(e){ return false; }
}

// Run once per app open: compute top alert and try to fire a notification (best-effort)
function runOpenTimeNotificationCheck(state, weekData, todayDay){
  const alerts = buildAlerts(state, weekData, todayDay);
  const worst = alerts.find(a=>a.level==='danger') || alerts.find(a=>a.level==='warn');
  if(worst && Notification && Notification.permission === 'granted'){
    fireLocalNotification('GATE Quest', worst.text);
  }
  return alerts;
}

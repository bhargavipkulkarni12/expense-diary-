let currentMonth = document.getElementById('monthSelect')?.value || 'October';
let deferredPrompt;
let allData = JSON.parse(localStorage.getItem('expenseData')) || {};
let limits = JSON.parse(localStorage.getItem('monthlyLimits')) || {};
let monthlyStats = JSON.parse(localStorage.getItem('monthlyStats')) || {}; // NEW: Stores extra details
let userName = localStorage.getItem('userName') || '';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  document.getElementById('installBox').style.display = 'block';
});
function installApp() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { deferredPrompt = null; document.getElementById('installBox').style.display='none'; }); }
}

function enterApp() {
  const nameInput = document.getElementById('userName').value.trim();
  if (!nameInput) { alert('Please enter your name di!'); return; }
  userName = nameInput; localStorage.setItem('userName', userName);
  document.getElementById('landing').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('welcome').textContent = `Hi ${userName}! 👋`;
  document.getElementById('tagline').textContent = 'Track smart, save better!';
  changeMonth();
}
function backToHome() { document.getElementById('app').style.display='none'; document.getElementById('landing').style.display='flex'; }
if (userName) { document.getElementById('landing').style.display='none'; document.getElementById('app').style.display='block'; document.getElementById('welcome').textContent = `Hi ${userName}! 👋`; }

function changeMonth() {
  currentMonth = document.getElementById('monthSelect').value;
  document.getElementById('monthLabel').textContent = `Total for ${currentMonth}`;
  ['food','auto','college','rent','shopping','fun'].forEach(id => document.getElementById(id).value = '');
  renderList(); updateLimitDisplay();
}

function setLimit() {
  const limitVal = parseFloat(document.getElementById('limitInput').value);
  if (!limitVal || limitVal <= 0) { alert('Enter valid limit di!'); return; }
  limits[currentMonth] = limitVal;
  localStorage.setItem('monthlyLimits', JSON.stringify(limits));
  saveMonthlyStats(); // Save stats
  document.getElementById('limitInput').value = '';
  updateLimitDisplay();
}

function getMonthTotal() {
  if (!allData[currentMonth]) return 0;
  return Object.values(allData[currentMonth]).flat().reduce((sum, item) => sum + item.amount, 0);
}

function saveMonthlyStats() {
  let total = getMonthTotal();
  let limit = limits[currentMonth] || 0;
  let extra = limit > 0? total - limit : 0;
  let saved = limit > 0? limit - total : 0;

  monthlyStats[currentMonth] = {
    total: total,
    limit: limit,
    extra: extra > 0? extra : 0,
    saved: saved > 0? saved : 0,
    status: extra > 0? 'OVER' : (limit>0? 'WITHIN' : 'NO LIMIT'),
    lastUpdated: new Date().toLocaleString(),
    categories: allData[currentMonth] || {}
  };
  localStorage.setItem('monthlyStats', JSON.stringify(monthlyStats));
}

function updateLimitDisplay() {
  const limit = limits[currentMonth] || 0;
  const total = getMonthTotal();
  const display = document.getElementById('limitDisplay');
  const progress = document.getElementById('progress');
  const status = document.getElementById('limitStatus');
  const alertBox = document.getElementById('limitAlert');
  if (limit === 0) {
    display.innerHTML = `<small style="color:#999;">No limit set for ${currentMonth}. Set one!</small>`;
    progress.style.width='0%'; progress.style.background='#ff5e62'; status.textContent=''; if(alertBox) alertBox.style.display='none'; return;
  }
  let percent = Math.min((total/limit)*100,100);
  let remaining = limit-total;
  display.innerHTML = `Limit: <b>Rs ${limit}</b> | Spent: <b>Rs ${total}</b> | ${remaining>=0?`Remaining: Rs ${remaining}`:`Over by Rs ${Math.abs(remaining)}`}`;
  progress.style.width=percent+'%';
  if(percent<70){progress.style.background='#56ab2f'; status.textContent='✅ Within budget!'; status.style.color='#56ab2f'; if(alertBox) alertBox.style.display='none';}
  else if(percent<90){progress.style.background='#ffcc00'; status.textContent='⚠️ 70% used'; status.style.color='#ff9900'; if(alertBox) alertBox.style.display='none';}
  else if(percent<100){progress.style.background='#ff6600'; status.textContent='🔥 90% used!'; status.style.color='#ff6600'; if(alertBox) alertBox.style.display='none';}
  else{progress.style.background='#ff0000'; status.textContent='❌ Limit crossed!'; status.style.color='red'; if(alertBox){alertBox.style.display='block'; alertBox.innerHTML=`❌ LIMIT CROSSED!<br>Limit: Rs ${limit} | Spent: Rs ${total}<br>Extra: Rs ${Math.abs(remaining)}`;}}
  saveMonthlyStats();
}

function addAll() {
  const categories = ['food','auto','college','rent','shopping','fun'];
  let hasValue=false;
  if(!allData[currentMonth]) allData[currentMonth]={};
  categories.forEach(cat=>{
    const val=parseFloat(document.getElementById(cat).value);
    if(val && val>0){hasValue=true; if(!allData[currentMonth][cat]) allData[currentMonth][cat]=[]; allData[currentMonth][cat].push({amount:val,date:new Date().toLocaleDateString(),time:new Date().toLocaleTimeString()});}
  });
  if(!hasValue){alert('Enter at least one amount di!'); return;}
  localStorage.setItem('expenseData', JSON.stringify(allData));
  categories.forEach(id=>document.getElementById(id).value='');
  saveMonthlyStats();
  renderList(); updateLimitDisplay();
  const limit=limits[currentMonth]||0; const total=getMonthTotal();
  if(limit>0 && total>limit){alert(`❌ CROSSED! Limit Rs ${limit}, Spent Rs ${total}, Extra Rs ${total-limit}`);}
}

function clearBoxes(){['food','auto','college','rent','shopping','fun'].forEach(id=>document.getElementById(id).value='');}
function renderList(){
  const listDiv=document.getElementById('list'); const totalEl=document.getElementById('total');
  if(!allData[currentMonth]||Object.keys(allData[currentMonth]).length===0){listDiv.innerHTML='<p style="text-align:center; opacity:0.6;">No expenses for this month yet!</p>'; totalEl.textContent='Rs 0'; return;}
  let total=0; let html='';
  for(let cat in allData[currentMonth]){allData[currentMonth][cat].forEach((item,idx)=>{total+=item.amount; html+=`<div class="list-item"><span>${cat} - Rs ${item.amount} <small>(${item.date})</small></span><button onclick="deleteItem('${cat}',${idx})" style="background:red; padding:5px 8px;">X</button></div>`;});}
  totalEl.textContent=`Rs ${total}`; listDiv.innerHTML=html;
}
function deleteItem(cat,idx){allData[currentMonth][cat].splice(idx,1); if(allData[currentMonth][cat].length===0) delete allData[currentMonth][cat]; localStorage.setItem('expenseData', JSON.stringify(allData)); saveMonthlyStats(); renderList(); updateLimitDisplay();}

function showYearly(){
  document.getElementById('app').style.display='none'; document.getElementById('yearly').style.display='block';
  let yearTotal=0; let totalLimit=0; let totalExtra=0; let totalSaved=0; let html='';
  const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
  months.forEach(m=>{
    let stats = monthlyStats[m] || {total:0,limit:0,extra:0,saved:0,status:'NO DATA'};
    if(allData[m]){let mt=0; for(let cat in allData[m]){allData[m][cat].forEach(item=>mt+=item.amount);} stats.total=mt;}
    yearTotal+=stats.total; totalLimit+=stats.limit; totalExtra+=stats.extra; totalSaved+=stats.saved;
    let color = stats.status==='OVER'?'#ff0000':(stats.status==='WITHIN'?'#56ab2f':'#999');
    html+=`<div class="list-item" style="flex-direction:column; align-items:flex-start; border-left:4px solid ${color}; padding:10px; margin:8px 0;">
      <b>${m}: Rs ${stats.total}</b>
      <small>Limit: Rs ${stats.limit||'Not set'} | Extra Spent: Rs ${stats.extra} | Saved: Rs ${stats.saved} | Status: <span style="color:${color}">${stats.status}</span></small>
      <small>Last: ${stats.lastUpdated||'Never'}</small>
    </div>`;
  });
  document.getElementById('yearTotal').textContent=`Rs ${yearTotal}`;
  document.getElementById('yearSummary').innerHTML=`
    <b>Year Summary:</b><br>
    Total Spent: Rs ${yearTotal}<br>
    Total Limits Set: Rs ${totalLimit}<br>
    <span style="color:red;">Total Extra Spent (Over Limit): Rs ${totalExtra}</span><br>
    <span style="color:green;">Total Saved (Under Limit): Rs ${totalSaved}</span><br>
    Net: ${totalSaved-totalExtra>=0?`Saved Rs ${totalSaved-totalExtra}`:`Over Rs ${Math.abs(totalSaved-totalExtra)}`}
  `;
  document.getElementById('yearList').innerHTML=html;
}
function backToApp(){document.getElementById('yearly').style.display='none'; document.getElementById('app').style.display='block';}
function clearAllData(){if(confirm('Delete ALL year data? This cannot be undone di!')){localStorage.removeItem('expenseData'); localStorage.removeItem('monthlyLimits'); localStorage.removeItem('monthlyStats'); allData={}; limits={}; monthlyStats={}; renderList(); updateLimitDisplay(); alert('All data cleared!'); backToApp();}}

changeMonth();

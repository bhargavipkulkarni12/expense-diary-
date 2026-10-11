let currentMonth = document.getElementById('monthSelect')?.value || 'October';
let deferredPrompt;
let allData = JSON.parse(localStorage.getItem('expenseData')) || {};
let limits = JSON.parse(localStorage.getItem('monthlyLimits')) || {};
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
  document.getElementById('limitInput').value = '';
  updateLimitDisplay();
  alert(`Limit set for ${currentMonth}: Rs ${limitVal}`);
}

function updateLimitDisplay() {
  const limit = limits[currentMonth] || 0;
  const total = getMonthTotal();
  const display = document.getElementById('limitDisplay');
  const progress = document.getElementById('progress');
  const status = document.getElementById('limitStatus');
  
  if (limit === 0) {
    display.innerHTML = `<small style="color:#999;">No limit set for ${currentMonth}. Set one to track!</small>`;
    progress.style.width = '0%'; progress.style.background = '#ff5e62';
    status.textContent = '';
    return;
  }
  
  let percent = Math.min((total / limit) * 100, 100);
  let remaining = limit - total;
  
  display.innerHTML = `Limit: <b>Rs ${limit}</b> | Spent: <b>Rs ${total}</b> | ${remaining >=0 ? `Remaining: Rs ${remaining}` : `Over by Rs ${Math.abs(remaining)}`}`;
  progress.style.width = percent + '%';
  
  if (percent < 70) { progress.style.background = '#56ab2f'; status.textContent = '✅ Within budget!'; status.style.color='#56ab2f'; }
  else if (percent < 90) { progress.style.background = '#ffcc00'; status.textContent = '⚠️ 70% used - Be careful!'; status.style.color='#ff9900'; }
  else if (percent < 100) { progress.style.background = '#ff6600'; status.textContent = '🔥 90% used - Stop spending!'; status.style.color='#ff6600'; }
  else { progress.style.background = '#ff0000'; status.textContent = '❌ Limit crossed! Over budget!'; status.style.color='red'; }
}

function getMonthTotal() {
  if (!allData[currentMonth]) return 0;
  return Object.values(allData[currentMonth]).flat().reduce((sum, item) => sum + item.amount, 0);
}

function addAll() {
  const categories = ['food','auto','college','rent','shopping','fun'];
  let hasValue = false;
  if (!allData[currentMonth]) allData[currentMonth] = {};
  categories.forEach(cat => {
    const val = parseFloat(document.getElementById(cat).value);
    if (val && val > 0) {
      hasValue = true;
      if (!allData[currentMonth][cat]) allData[currentMonth][cat] = [];
      allData[currentMonth][cat].push({ amount: val, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() });
    }
  });
  if (!hasValue) { alert('Enter at least one amount di!'); return; }
  localStorage.setItem('expenseData', JSON.stringify(allData));
  categories.forEach(id => document.getElementById(id).value = '');
  renderList(); updateLimitDisplay();
  
  const limit = limits[currentMonth] || 0;
  const total = getMonthTotal();
  if (limit > 0 && total > limit) { alert(`⚠️ Warning di! You crossed your limit of Rs ${limit}! Total is Rs ${total}`); }
  else if (limit > 0 && total > limit*0.9) { alert(`⚠️ Careful di! 90% of limit used!`); }
}

function clearBoxes() { ['food','auto','college','rent','shopping','fun'].forEach(id => document.getElementById(id).value = ''); }

function renderList() {
  const listDiv = document.getElementById('list');
  const totalEl = document.getElementById('total');
  if (!allData[currentMonth] || Object.keys(allData[currentMonth]).length === 0) {
    listDiv.innerHTML = '<p style="text-align:center; opacity:0.6;">No expenses for this month yet!</p>'; totalEl.textContent = 'Rs 0'; return;
  }
  let total = 0; let html = '';
  for (let cat in allData[currentMonth]) {
    allData[currentMonth][cat].forEach((item, idx) => {
      total += item.amount;
      html += `<div class="list-item"><span>${cat} - Rs ${item.amount} <small>(${item.date})</small></span><button onclick="deleteItem('${cat}',${idx})" style="background:red; padding:5px 8px;">X</button></div>`;
    });
  }
  totalEl.textContent = `Rs ${total}`; listDiv.innerHTML = html;
}

function deleteItem(cat, idx) { allData[currentMonth][cat].splice(idx,1); if (allData[currentMonth][cat].length===0) delete allData[currentMonth][cat]; localStorage.setItem('expenseData', JSON.stringify(allData)); renderList(); updateLimitDisplay(); }

function showYearly() {
  document.getElementById('app').style.display='none'; document.getElementById('yearly').style.display='block';
  let yearTotal = 0; let html = '';
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  months.forEach(m => {
    let monthTotal = 0;
    if (allData[m]) { for (let cat in allData[m]) { allData[m][cat].forEach(item => monthTotal += item.amount); } }
    yearTotal += monthTotal;
    let lim = limits[m] ? ` | Limit: Rs ${limits[m]}` : '';
    html += `<div class="list-item"><span><b>${m}</b>: Rs ${monthTotal}${lim}</span></div>`;
  });
  document.getElementById('yearTotal').textContent = `Rs ${yearTotal}`; document.getElementById('yearList').innerHTML = html;
}
function backToApp() { document.getElementById('yearly').style.display='none'; document.getElementById('app').style.display='block'; }

changeMonth();

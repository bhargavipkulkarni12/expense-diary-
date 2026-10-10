let data = JSON.parse(localStorage.getItem("myDiary")) || {
  January: [], February: [], March: [], April: [], May: [], June: [],
  July: [], August: [], September: [], October: [], November: [], December: []
};
let currentMonth = "October";
let userName = localStorage.getItem("diaryUser") || "";
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBox').style.display = "flex";
});

function installApp(){
  if(deferredPrompt){
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(()=>{
      document.getElementById('installBox').style.display="none";
      deferredPrompt = null;
    });
  }
}

function enterApp(){
  let nameInput = document.getElementById('userName').value.trim();
  if(nameInput) {
    userName = nameInput;
    localStorage.setItem("diaryUser", userName);
  }
  if(!userName){ alert("Please enter your name"); return; }
  document.getElementById('landing').style.display="none";
  document.getElementById('app').style.display="block";
  document.getElementById('yearly').style.display="none";
  document.getElementById('welcome').innerText = `Hi ${userName}! 👋`;
  document.getElementById('tagline').innerText = `${userName}, name your expense...`;
  changeMonth();
}
function backToHome(){
  document.getElementById('app').style.display="none";
  document.getElementById('yearly').style.display="none";
  document.getElementById('landing').style.display="block";
  document.getElementById('userName').value = userName;
}
function backToApp(){
  document.getElementById('yearly').style.display="none";
  document.getElementById('app').style.display="block";
}
function changeMonth(){
  currentMonth = document.getElementById('monthSelect').value;
  showList();
}
function clearBoxes(){
  ["food","auto","college","rent","shopping","fun"].forEach(id=>document.getElementById(id).value="");
}
function addAll(){
  let food = parseInt(document.getElementById('food').value) || 0;
  let auto = parseInt(document.getElementById('auto').value) || 0;
  let college = parseInt(document.getElementById('college').value) || 0;
  let rent = parseInt(document.getElementById('rent').value) || 0;
  let shopping = parseInt(document.getElementById('shopping').value) || 0;
  let fun = parseInt(document.getElementById('fun').value) || 0;
  if(food+auto+college+rent+shopping+fun === 0){ alert("Enter at least one amount"); return; }
  if(food) data[currentMonth].push({cat:"🍛 Food", amount:food});
  if(auto) data[currentMonth].push({cat:"🛺 Auto/Bus", amount:auto});
  if(college) data[currentMonth].push({cat:"📚 College", amount:college});
  if(rent) data[currentMonth].push({cat:"🏠 PG Rent", amount:rent});
  if(shopping) data[currentMonth].push({cat:"🛍️ Shopping", amount:shopping});
  if(fun) data[currentMonth].push({cat:"🎉 Fun", amount:fun});
  localStorage.setItem("myDiary", JSON.stringify(data));
  clearBoxes();
  showList();
}
function showList(){
  let list = data[currentMonth];
  let total = list.reduce((s,e)=>s+e.amount,0);
  document.getElementById('total').innerText = "Rs "+total;
  document.getElementById('monthLabel').innerText = "Total for "+currentMonth;
  let div = document.getElementById('list');
  if(list.length===0) div.innerHTML = `<p style="text-align:center; opacity:0.6;">No data for ${currentMonth}</p>`;
  else div.innerHTML = list.map((e,i)=>`
    <div class="item">
      <span>${e.cat}</span>
      <span><b>Rs ${e.amount}</b> <button class="delete-btn" onclick="deleteItem(${i})">✕</button></span>
    </div>`).join('');
}
function deleteItem(index){
  if(confirm("Delete this entry? Mistake clear?")){
    data[currentMonth].splice(index,1);
    localStorage.setItem("myDiary", JSON.stringify(data));
    showList();
  }
}
function showYearly(){
  document.getElementById('app').style.display="none";
  document.getElementById('yearly').style.display="block";
  let months = Object.keys(data);
  let yearTotal = 0;
  let html = "";
  months.forEach(m=>{
    let total = data[m].reduce((s,e)=>s+e.amount,0);
    yearTotal += total;
    let color = total>0? "#a8e063" : "#888";
    html += `<div class="item" style="border-left:4px solid ${color}"><span><b>${m}</b></span><b style="color:${color}">Rs ${total}</b></div>`;
  });
  document.getElementById('yearTotal').innerText = "Rs "+yearTotal;
  document.getElementById('yearList').innerHTML = html + `<p style="text-align:center; margin-top:10px;">Diary of ${userName} 📓</p>`;
}
document.getElementById('monthSelect').value = currentMonth;
if(userName) document.getElementById('userName').value = userName;
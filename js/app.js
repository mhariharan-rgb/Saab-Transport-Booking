// ── STATE ──
let currentUser = null; // {name, email}
let bookings = [
  {id:1,pickup:'Anna Nagar, Chennai',drop:'Chennai Central',vehicle:'Auto Rickshaw',icon:'🛺',date:'2024-11-20',time:'10:00',fare:142,status:'Confirmed'},
  {id:2,pickup:'T Nagar, Chennai',drop:'Airport',vehicle:'Car (Sedan)',icon:'🚗',date:'2024-11-22',time:'06:30',fare:356,status:'Pending'},
];
let driverApplications = [];
let contactMessages = [];
let nextBookingId = 3;

// ── NAVIGATION ──
function goto(page, tab) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  window.scrollTo(0,0);

  // Update nav links
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  const nl = document.getElementById('nl-'+page);
  if(nl) nl.classList.add('active');

  if(page==='login' && tab) switchTab(tab);
  if(page==='mybookings') renderBookings();
  if(page==='booking'){
    if(!currentUser){showAlert('booking-alert','err','Please login first to book a ride!');goto('login');return;}
    initBookingForm();
  }
  if(page==='mybookings' && !currentUser){goto('login');return;}
}

// ── AUTH ──
function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;
  if(!email||!pw){showAlert('auth-alert','err','Please fill in all fields.');return;}
  if(!isValidEmail(email)){showAlert('auth-alert','err','Please enter a valid email.');return;}
  // Demo: any email/pass works
  currentUser = {name: email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), email};
  updateNav();
  showAlert('auth-alert','ok','Login successful! Welcome back, '+currentUser.name+'!');
  setTimeout(()=>goto('home'),1200);
}

function doRegister(){
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pw    = document.getElementById('reg-pw').value;
  const cpw   = document.getElementById('reg-cpw').value;
  if(!name||!email||!phone||!pw||!cpw){showAlert('auth-alert','err','Please fill in all fields.');return;}
  if(!isValidEmail(email)){showAlert('auth-alert','err','Please enter a valid email.');return;}
  if(!isValidPhone(phone)){showAlert('auth-alert','err','Enter a 10-digit mobile number.');return;}
  if(pw.length<6){showAlert('auth-alert','err','Password must be at least 6 characters.');return;}
  if(pw!==cpw){showAlert('auth-alert','err','Passwords do not match.');return;}
  currentUser = {name, email};
  updateNav();
  showAlert('auth-alert','ok','Account created! Welcome to Saab, '+name+'! 🎉');
  setTimeout(()=>goto('home'),1400);
}

function logout(){
  currentUser = null;
  updateNav();
  goto('home');
}

function updateNav(){
  const nr = document.getElementById('nav-right');
  if(currentUser){
    nr.innerHTML = `<span class="nav-user-info"><span class="nav-user-dot"></span>Hi, ${escapeHtml(currentUser.name.split(' ')[0])}</span>
      <a onclick="goto('mybookings')" class="btn-nav-login" style="cursor:pointer">My Bookings</a>
      <button class="btn-nav-signup" onclick="logout()">Logout</button>`;
  } else {
    nr.innerHTML = `<button class="btn-nav-login" onclick="goto('login')">Login</button>
      <button class="btn-nav-signup" onclick="goto('login','register')">Sign Up</button>`;
  }
}

function switchTab(name){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+name+'-btn').classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
  document.getElementById('auth-alert').innerHTML='';
}

// ── HERO WIDGET ──
function heroSearch(){
  const pickup  = document.getElementById('hw-pickup').value.trim();
  const drop    = document.getElementById('hw-drop').value.trim();
  const vehicle = document.getElementById('hw-vehicle').value;
  if(!pickup||!drop){alert('Please enter both pickup and drop locations!');return;}
  if(!currentUser){goto('login');return;}
  goto('booking');
  setTimeout(()=>{
    if(pickup)  document.getElementById('b-pickup').value = pickup;
    if(drop)    document.getElementById('b-drop').value   = drop;
    if(vehicle){
      document.querySelectorAll('.vopt').forEach(o=>{
        if(o.getAttribute('data-type')===vehicle) selectVehicle(o);
      });
    }
  },100);
}

// ── BOOKING ──
let selectedVehicle = null;

function initBookingForm(){
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.getElementById('b-date').value = localDate;
  document.getElementById('b-date').min = localDate;
  document.getElementById('b-time').value = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  if(currentUser) document.getElementById('dash-greeting').textContent = 'Hello, '+currentUser.name+'! Here are all your ride bookings.';
}

function selectVehicle(el){
  document.querySelectorAll('.vopt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  selectedVehicle = {type:el.getAttribute('data-type'), price:parseFloat(el.getAttribute('data-price'))};
  calcFare();
}

function calcFare(){
  if(!selectedVehicle) return;
  const km   = Math.floor(Math.random()*17)+4;
  const dist = km * 8;
  const fare = selectedVehicle.price + dist;
  const gst  = Math.round(fare * 0.05);
  const tot  = fare + gst;

  document.getElementById('fare-hint').textContent = 'Estimated fare for your trip:';
  document.getElementById('f-base').textContent = '₹'+selectedVehicle.price;
  document.getElementById('f-km').textContent   = km+' km';
  document.getElementById('f-dist').textContent = '₹'+dist;
  document.getElementById('f-gst').textContent  = '₹'+gst;
  document.getElementById('f-total').textContent = '₹'+tot;
  document.getElementById('fare-display').style.display = 'block';
  selectedVehicle.totalFare = tot;
  selectedVehicle.km = km;
}

function confirmBooking(){
  const pickup = document.getElementById('b-pickup').value.trim();
  const drop   = document.getElementById('b-drop').value.trim();
  const date   = document.getElementById('b-date').value;
  const time   = document.getElementById('b-time').value;
  if(!pickup||!drop){showAlert('booking-alert','err','Please enter pickup and drop locations.');return;}
  if(pickup.toLowerCase() === drop.toLowerCase()){
    showAlert('booking-alert','err','Pickup and drop must be different.');return;
  }
  if(!date || !time){
    showAlert('booking-alert','err','Choose a trip date and time.');return;
  }
  const tripTime = new Date(date + 'T' + time);
  const currentMinute = new Date();
  currentMinute.setSeconds(0, 0);
  if(!Number.isFinite(tripTime.getTime()) || tripTime < currentMinute){
    showAlert('booking-alert','err','Choose a trip time that has not passed.');return;
  }
  if(!selectedVehicle){showAlert('booking-alert','err','Please select a vehicle type.');return;}
  const icons = {'Auto Rickshaw':'🛺','Bike':'🏍️','Car (Sedan)':'🚗'};
  bookings.unshift({
    id: nextBookingId++,
    pickup, drop,
    vehicle: selectedVehicle.type,
    icon: icons[selectedVehicle.type]||'🚗',
    date, time,
    fare: selectedVehicle.totalFare||0,
    status: 'Pending'
  });
  showAlert('booking-alert','ok','Demo booking recorded. Open My Bookings to see the status.');
  selectedVehicle = null;
  document.querySelectorAll('.vopt').forEach(o=>o.classList.remove('sel'));
  document.getElementById('fare-display').style.display='none';
  document.getElementById('fare-hint').textContent='Select a vehicle to see your fare breakdown.';
  document.getElementById('b-pickup').value='';
  document.getElementById('b-drop').value='';
}

// ── MY BOOKINGS ──
function renderBookings(){
  if(currentUser) document.getElementById('dash-greeting').textContent = 'Hello, '+currentUser.name+'! Here are all your ride bookings.';
  const c = document.getElementById('bookings-container');
  if(bookings.length===0){
    c.innerHTML = `<div class="empty-state"><div class="empty-icon">🚗</div><h3>No bookings yet!</h3><p>You haven't made any bookings. Book your first ride now.</p><button class="btn-book-now" onclick="goto('booking')">Book Now</button></div>`;
    return;
  }
  const rows = bookings.map(b=>`
    <tr>
      <td>${b.id}</td>
      <td>${b.icon} ${b.vehicle}</td>
      <td>${escapeHtml(b.pickup)}</td>
      <td>${escapeHtml(b.drop)}</td>
      <td>${formatDate(b.date)}</td>
      <td>${formatTime(b.time)}</td>
      <td><strong>₹${b.fare}</strong></td>
      <td><span class="badge ${b.status==='Confirmed'?'b-confirmed':b.status==='Cancelled'?'b-cancelled':'b-pending'}">${b.status}</span></td>
      <td>${b.status!=='Cancelled'?`<button class="btn-cancel" onclick="cancelBooking(${b.id})">Cancel</button>`:'—'}</td>
    </tr>`).join('');
  c.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>#</th><th>Vehicle</th><th>Pickup</th><th>Drop</th><th>Date</th><th>Time</th><th>Fare</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function cancelBooking(id){
  if(!confirm('Are you sure you want to cancel this booking?')) return;
  const b = bookings.find(x=>x.id===id);
  if(b) b.status='Cancelled';
  renderBookings();
}

function formatDate(d){
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const p=d.split('-');return p[2]+' '+months[parseInt(p[1])-1]+' '+p[0];
}
function formatTime(t){
  const p=t.split(':');let h=parseInt(p[0]),m=p[1],ampm='AM';
  if(h>=12){ampm='PM';if(h>12)h-=12;}if(h===0)h=12;
  return h+':'+m+' '+ampm;
}

// ── DRIVER FORM ──
function submitDriver(){
  const name  = document.getElementById('d-name').value.trim();
  const email = document.getElementById('d-email').value.trim();
  const phone = document.getElementById('d-phone').value.trim();
  const city  = document.getElementById('d-city').value.trim();
  const vtype = document.getElementById('d-vtype').value;
  const vnum  = document.getElementById('d-vnum').value.trim();
  const lic   = document.getElementById('d-lic').value.trim();
  if(!name||!email||!phone||!city||!vtype||!vnum||!lic){
    showAlert('driver-alert','err','Please fill in all required fields.');return;
  }
  if(!isValidEmail(email)){showAlert('driver-alert','err','Please enter a valid email.');return;}
  if(!isValidPhone(phone)){showAlert('driver-alert','err','Enter a 10-digit mobile number.');return;}
  const experience = document.getElementById('d-exp').value;
  driverApplications.push({name,email,phone,city,vtype,vnum,lic,experience});
  showAlert('driver-alert','ok','✅ Demo application recorded for this session.');
  ['d-name','d-email','d-phone','d-city','d-vnum','d-lic'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('d-vtype').value='';
}

// ── CONTACT FORM ──
function submitContact(){
  const name = document.getElementById('c-name').value.trim();
  const email= document.getElementById('c-email').value.trim();
  const subj = document.getElementById('c-subj').value;
  const msg  = document.getElementById('c-msg').value.trim();
  if(!name||!email||!subj||!msg){showAlert('contact-alert','err','Please fill in all fields.');return;}
  if(!isValidEmail(email)){showAlert('contact-alert','err','Please enter a valid email.');return;}
  contactMessages.push({name,email,subj,msg});
  showAlert('contact-alert','ok','✅ Demo message recorded for this session. Thank you, '+name+'!');
  document.getElementById('c-name').value='';
  document.getElementById('c-email').value='';
  document.getElementById('c-subj').value='';
  document.getElementById('c-msg').value='';
}

// ── FAQ ──
function toggleFaq(el){
  const ans = el.nextElementSibling;
  const span = el.querySelector('span');
  const isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a=>a.classList.remove('open'));
  document.querySelectorAll('.faq-q span').forEach(s=>s.textContent='+');
  if(!isOpen){ans.classList.add('open');span.textContent='−';}
}

// ── VALIDATION AND DISPLAY ──
function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone){
  return /^\d{10}$/.test(phone);
}

function escapeHtml(text){
  const node = document.createElement('span');
  node.textContent = text;
  return node.innerHTML;
}

const alertTimers = new Map();

function showAlert(id,type,msg){
  const el = document.getElementById(id);
  if(!el) return;
  const notice = document.createElement('div');
  notice.className = type === 'ok' ? 'alert alert-ok' : 'alert alert-err';
  notice.setAttribute('role', type === 'ok' ? 'status' : 'alert');
  notice.textContent = msg;
  el.replaceChildren(notice);
  clearTimeout(alertTimers.get(id));
  alertTimers.set(id, setTimeout(() => {
    notice.remove();
    alertTimers.delete(id);
  }, 5000));
}

// ── CITIES SCROLLER ──
const cities = ['Chennai','Mumbai','Delhi','Bangalore','Hyderabad','Pune','Kolkata','Jaipur','Ahmedabad','Coimbatore','Madurai','Surat'];
const scroll = document.getElementById('cityscroll');
[...cities,...cities].forEach(c=>{
  scroll.innerHTML += `<span class="city-item"><span class="city-dot"></span>${c}</span>`;
});

// ── INIT ──
initBookingForm();

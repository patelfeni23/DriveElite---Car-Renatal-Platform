/* ================================================
   DriveElite — Main JS (shared across all pages)
================================================ */

// ─── NAVBAR SCROLL ────────────────────────────
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (nb) nb.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── HAMBURGER MENU ───────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ─── TOAST ────────────────────────────────────
function showToast(title, msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent   = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 4000);
}

// ─── ALERT ────────────────────────────────────
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert ${type}`;
  el.textContent = msg;
  el.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'alert hidden';
}

// ─── BOOKING MODAL ────────────────────────────
let currentCar = null;

function openBookingModal(car) {
  currentCar = car;
  const overlay = document.getElementById('bookModal');
  if (!overlay) return;

  document.getElementById('bookCarId').value = car.id;

  // Pre-fill dates from search
  const pickup = document.getElementById('searchPickup')?.value;
  const ret    = document.getElementById('searchReturn')?.value;
  if (pickup) document.getElementById('bookPickup').value = pickup;
  if (ret)    document.getElementById('bookReturn').value  = ret;

  // Car info strip
  document.getElementById('modalCarInfo').innerHTML = `
    <img src="img/${car.image}" class="modal-car-img" onerror="this.src='img/home_SUV1.jpg'" alt="${car.name}">
    <div>
      <div class="modal-car-name">${car.name} <span style="font-size:0.8rem;color:var(--muted)">(${car.category})</span></div>
      <div class="modal-car-price">₹${parseFloat(car.price_per_day).toLocaleString('en-IN')} / day</div>
      <div style="font-size:0.77rem;color:var(--muted);margin-top:4px;">${car.seats} Seats · ${car.transmission} · ${car.fuel_type}</div>
    </div>
  `;

  hideAlert('bookAlert');
  calcPrice();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Auto-fill user data if logged in
  const user = JSON.parse(sessionStorage.getItem('driveUser') || 'null');
  if (user) {
    const nameField  = document.getElementById('bookName');
    const emailField = document.getElementById('bookEmail');
    if (nameField  && !nameField.value)  nameField.value  = user.full_name || '';
    if (emailField && !emailField.value) emailField.value = user.email || '';
  }
}

function closeModal() {
  document.getElementById('bookModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function calcPrice() {
  if (!currentCar) return;
  const p = document.getElementById('bookPickup')?.value;
  const r = document.getElementById('bookReturn')?.value;
  const summary = document.getElementById('priceSummary');
  if (!p || !r || !summary) return;

  const days = Math.ceil((new Date(r) - new Date(p)) / (1000 * 60 * 60 * 24));
  if (days > 0) {
    const total = days * parseFloat(currentCar.price_per_day);
    document.getElementById('pricePerDay').textContent = `₹${parseFloat(currentCar.price_per_day).toLocaleString('en-IN')}`;
    document.getElementById('numDays').textContent     = `${days} day${days>1?'s':''}`;
    document.getElementById('totalPrice').textContent  = `₹${total.toLocaleString('en-IN')}`;
    summary.style.display = 'block';
  } else {
    summary.style.display = 'none';
  }
}

// ─── BOOKING FORM SUBMIT ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert('bookAlert');
      const btn = document.getElementById('bookBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      const fd = new FormData(form);
      try {
        const res  = await fetch('api/book.php', { method:'POST', body:fd });
        const data = await res.json();
        if (data.success) {
          closeModal();
          showToast('🎉 Booking Confirmed!', `${data.car} booked for ${data.days} days — ₹${parseFloat(data.total_price).toLocaleString('en-IN')}`, 'success');
          form.reset();
          document.getElementById('priceSummary').style.display = 'none';
        } else {
          showAlert('bookAlert', data.error || 'Booking failed', 'error');
        }
      } catch(err) {
        showAlert('bookAlert', 'Network error. Please try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Confirm Booking';
      }
    });
  }

  // Close modal on overlay click
  document.getElementById('bookModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // Set min date for date pickers
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(i => i.min = today);
});

// ─── AUTH STATE ───────────────────────────────
async function checkAuth() {
  try {
    const res  = await fetch('api/profile.php');
    const data = await res.json();
    const actions = document.getElementById('navActions');
    const mobileMenu = document.getElementById('mobileMenu');

    if (data.logged_in) {
      sessionStorage.setItem('driveUser', JSON.stringify(data.user));
      if (actions) {
        const initials = data.user.full_name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
        actions.innerHTML = `
          <a href="profile.html" style="text-decoration:none;">
            <div class="nav-user">
              <div class="avatar">${initials}</div>
              <span>${data.user.full_name.split(' ')[0]}</span>
            </div>
          </a>
          <button class="btn-outline" onclick="logout()">Logout</button>
        `;
      }
      if (mobileMenu) {
        const lastItems = mobileMenu.querySelectorAll('.auth-mobile');
        lastItems.forEach(i => i.remove());
        mobileMenu.insertAdjacentHTML('beforeend', `
          <a href="profile.html" class="auth-mobile">My Profile</a>
          <a href="#" onclick="logout()" class="auth-mobile">Logout</a>
        `);
      }
    }
  } catch(e) {}
}

async function logout() {
  await fetch('api/logout.php');
  sessionStorage.removeItem('driveUser');
  window.location.href = 'index.html';
}

// ─── STAR RENDERER ────────────────────────────
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  let stars   = '★'.repeat(full);
  if (half) stars += '½';
  stars += '☆'.repeat(5 - full - (half ? 1 : 0));
  return stars;
}

// ─── SET ACTIVE NAV ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('#')[0];
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
});

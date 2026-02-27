/* ================================================
   DriveElite — Home Page JS
================================================ */

// ─── FETCH & RENDER CARS ──────────────────────
let allCars = [];

async function fetchCars(category = 'All') {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  // Show skeleton
  if (allCars.length === 0) {
    grid.innerHTML = [1,2,3].map(() => `
      <div class="car-card" style="pointer-events:none">
        <div class="car-img-wrap skeleton"></div>
        <div class="car-body">
          <div class="skeleton" style="height:24px;margin-bottom:10px;border-radius:6px"></div>
          <div class="skeleton" style="height:14px;margin-bottom:6px;border-radius:6px;width:80%"></div>
          <div class="skeleton" style="height:14px;margin-bottom:20px;border-radius:6px;width:60%"></div>
          <div class="skeleton" style="height:44px;border-radius:10px"></div>
        </div>
      </div>
    `).join('');
  }

  try {
    const url = category === 'All'
      ? 'api/get_cars.php'
      : `api/get_cars.php?category=${encodeURIComponent(category)}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.success) {
      allCars = data.cars;
      renderCars(data.cars);
    } else {
      renderNoResults();
    }
  } catch(err) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column:1/-1;">
        <div class="icon">⚠️</div>
        <h3>Unable to load cars</h3>
        <p>Please make sure the PHP server and MySQL are running.</p>
      </div>`;
  }
}

function renderCars(cars) {
  // Update result count
  const rc = document.getElementById('resultCount');
  if (rc && cars.length) rc.textContent = `Showing ${cars.length} car${cars.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  if (!cars.length) { renderNoResults(); return; }

  grid.innerHTML = cars.map((car, i) => `
    <div class="car-card" style="animation-delay:${i * 0.08}s">
      <div class="car-img-wrap">
        <img src="img/${car.image}" alt="${car.name}"
             onerror="this.src='img/home_SUV1.jpg'"
             loading="lazy">
        <div class="car-badge">${car.category}</div>
        ${car.available ? '<div class="car-available">✓ Available</div>' : ''}
      </div>
      <div class="car-body">
        <h3 class="car-name">${car.name}</h3>
        <p class="car-desc">${car.description ? car.description.slice(0,90)+'...' : ''}</p>
        <div class="car-specs">
          <div class="car-spec"><span class="car-spec-icon">👥</span>${car.seats} Seats</div>
          <div class="car-spec"><span class="car-spec-icon">⚙️</span>${car.transmission}</div>
          <div class="car-spec"><span class="car-spec-icon">⛽</span>${car.fuel_type}</div>
        </div>
        <div class="car-rating">
          <span class="stars">${renderStars(parseFloat(car.rating || 4.5))}</span>
          <span class="rating-val">${parseFloat(car.rating || 4.5).toFixed(1)}</span>
          <span class="rating-count">(${car.reviews_count || 0} reviews)</span>
        </div>
        <div class="car-footer">
          <div class="car-price">
            <div class="amount">₹<span>${parseInt(car.price_per_day).toLocaleString('en-IN')}</span></div>
            <div class="per">per day</div>
          </div>
          <button class="btn-rent" onclick='openBookingModal(${JSON.stringify(car)})'>
            Rent Now →
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderNoResults() {
  document.getElementById('carsGrid').innerHTML = `
    <div class="no-results" style="grid-column:1/-1;">
      <div class="icon">🚗</div>
      <h3>No Cars Found</h3>
      <p>Try selecting a different category or check back later.</p>
    </div>`;
}

// ─── FILTER TABS ──────────────────────────────
function filterCars(category, btn) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  fetchCars(category);
}

// ─── SCROLL TO FLEET ──────────────────────────
function scrollToFleet() {
  document.getElementById('fleet')?.scrollIntoView({ behavior:'smooth' });
}

// ─── TESTIMONIALS ─────────────────────────────
const testimonials = [
  { name:'Priya Sharma', role:'Frequent Traveller', text:'Absolutely loved the service! Booked a Honda City for a weekend trip to Surat — smooth process, amazing car, zero hassle.', stars:5 },
  { name:'Rahul Mehta', role:'Business Professional', text:'DriveElite is my go-to for corporate rentals. Reliable, professional, and the cars are always in pristine condition.', stars:5 },
  { name:'Anjali Patel', role:'Family Vacationer', text:'Rented the Hyundai Creta for a family road trip. Spacious, comfortable, and the price was very reasonable!', stars:4 },
  { name:'Kiran Joshi', role:'First-time Renter', text:'As a first-timer I was nervous, but the booking process was so simple and the staff were incredibly helpful.', stars:5 },
  { name:'Deepak Verma', role:'Photographer', text:'Needed a reliable car for a photography trip to Rann of Kutch. The SUV was perfect — handled everything beautifully.', stars:5 },
  { name:'Sneha Gupta', role:'Weekend Explorer', text:'Great experience overall. Car was clean, fuel was full, and pickup was on time. Will definitely book again!', stars:4 },
];

function renderTestimonials() {
  const track = document.getElementById('testiTrack');
  if (!track) return;

  const allTesti = [...testimonials, ...testimonials]; // duplicate for loop
  track.innerHTML = allTesti.map(t => `
    <div class="testimonial-card">
      <div class="testi-stars">${'★'.repeat(t.stars)}${'☆'.repeat(5-t.stars)}</div>
      <p class="testi-text">"${t.text}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${t.name.split(' ').map(n=>n[0]).join('')}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-role">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── HERO CAR ROTATION ────────────────────────
const heroImages = ['creta.jpg','honda_city.jpg','home_SUV1.jpg','baleno.jpg'];
let heroIdx = 0;
function rotateHeroCar() {
  heroIdx = (heroIdx + 1) % heroImages.length;
  const img = document.getElementById('heroCar');
  if (img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      img.src = `img/${heroImages[heroIdx]}`;
      img.style.opacity = '1';
    }, 500);
  }
}

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchCars();
  renderTestimonials();
  setInterval(rotateHeroCar, 4000);
});

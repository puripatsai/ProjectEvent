// =================================================================
//  index.js — หน้าหลัก
//  API  : GET /events
// =================================================================

const API = 'http://localhost:8000';
let allEvents    = [];
let activeFilter = 'all'; // 'all' | ชื่อกีฬา

/* ── Navbar ───────────────────────────────────────────────────── */
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
  const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
  document.getElementById('navUser').textContent = initial;
  document.getElementById('navUser').classList.remove('hidden');
  document.getElementById('btnLogout').classList.remove('hidden');
  document.getElementById('btnLogin').classList.add('hidden');
  if (user.role === 'admin') document.getElementById('btnCreate').classList.remove('hidden');
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

/* ── SVG Watermarks ───────────────────────────────────────────── */
const ICONS = {
  'ฟุตบอล'    : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><polygon points="12 5 8 9 9.5 14 14.5 14 16 9"/></svg>`,
  'บาสเกตบอล' : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg>`,
  'วอลเลย์บอล': `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 22c-3-4-3-16 0-20"/><path d="M2 12h20"/></svg>`,
  'แบดมินตัน' : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 22l6-6"/><path d="M22 2l-6 6"/><circle cx="12" cy="12" r="4"/></svg>`,
  'เทนนิส'    : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 22c-5.5 0-10-4.5-10-10"/></svg>`,
  'ว่ายน้ำ'   : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 6c.6.5 1.2 1 2.5 1S5.8 6.5 6.5 6C7 5.5 7.7 5 9 5s2 .5 2.5 1c.6.5 1.2 1 2.5 1s1.9-.5 2.5-1c.6-.5 1.2-1 2.5-1s1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1S5.8 12.5 6.5 12c.6-.5 1.2-1 2.5-1s1.9.5 2.5 1c.6.5 1.2 1 2.5 1s1.9-.5 2.5-1c.6-.5 1.2-1 2.5-1s1.9.5 2.5 1"/></svg>`,
  'วิ่ง'      : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  'อื่นๆ'     : `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
};

/* ── Skeleton ─────────────────────────────────────────────────── */
function showSkeletons() {
  document.getElementById('eventGrid').innerHTML = Array(6).fill(`
    <div class="skeleton-card">
      <div class="skel-box skel-tag"></div>
      <div class="skel-box skel-title"></div>
      <div class="skel-box skel-title2"></div>
      <div class="skel-box skel-line"></div>
    </div>`).join('');
  document.getElementById('resultCount').textContent = '';
}

/* ── Load events ──────────────────────────────────────────────── */
async function loadEvents() {
  showSkeletons();
  try {
    const res = await fetch(`${API}/events`);
    allEvents = await res.json();
    renderCards();
  } catch (err) {
    document.getElementById('eventGrid').innerHTML =
      `<div class="empty-state">ไม่สามารถโหลดข้อมูลได้</div>`;
  }
}

/* ── Filter: กรองแค่ประเภทกีฬา ──────────────────────────────── */
function setStatus(filter, btn) {
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = filter;
  renderCards();
}

/* ── Render cards ─────────────────────────────────────────────── */
function renderCards() {
  const grid       = document.getElementById('eventGrid');
  const searchText = document.getElementById('searchInput').value.toLowerCase();

  const filtered = allEvents.filter(e => {
    // กรองตามประเภทกีฬา
    const matchSport = activeFilter === 'all' || e.sport_type === activeFilter;
    // กรองตาม search
    const matchSearch =
      e.title.toLowerCase().includes(searchText) ||
      (e.location || '').toLowerCase().includes(searchText) ||
      e.sport_type.toLowerCase().includes(searchText);
    return matchSport && matchSearch;
  });

  document.getElementById('resultCount').textContent = `${filtered.length} รายการ`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</div>`;
    return;
  }

  grid.innerHTML = filtered.map((e, i) => {
    const pct        = e.current_participants / e.max_participants;
    const isFull     = pct >= 1;
    const isAlmost   = pct >= 0.8 && !isFull;
    const pctDisplay = Math.round(pct * 100);

    // สีและ label สถานะ (แสดงใต้ progress bar เท่านั้น)
    const statusColor = isFull ? 'var(--status-full)' : isAlmost ? 'var(--status-almost)' : 'var(--status-open)';
    const statusLabel = isFull ? 'เต็มแล้ว' : isAlmost ? 'ใกล้เต็ม' : 'เปิดรับสมัคร';

    const date = new Date(e.event_date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const icon = ICONS[e.sport_type] || ICONS['อื่นๆ'];
    const href = isFull ? '#' : `register.html?id=${e.id}`;

    return `
      <a href="${href}" class="bento-card"
         style="animation:cardEnter 0.5s var(--ease) ${i * 0.05}s both;"
         ${isFull ? 'onclick="return false;" style="cursor:default;"' : ''}>

        <div class="card-icon-bg">${icon}</div>

        <div class="bento-content">
          <div class="sport-tag">${e.sport_type}</div>
          <h3 class="card-title">${e.title}</h3>

          <div class="card-info">
            <div class="info-row">
              <svg class="info-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>${date}
            </div>
            <div class="info-row">
              <svg class="info-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>${e.location || '-'}
            </div>
          </div>

          <!-- progress bar + สถานะใต้หลอด -->
          <div class="card-bottom">
            <div class="progress-wrapper">
              <div class="progress-track">
                <div class="progress-fill"
                     style="background:${statusColor};"
                     data-target="${pctDisplay}%"></div>
              </div>
              <div class="progress-footer">
                <span style="color:${statusColor};">${statusLabel}</span>
                <span>${e.current_participants} / ${e.max_participants}</span>
              </div>
            </div>
            <div class="action-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </div>
      </a>`;
  }).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-fill').forEach(b => b.style.width = b.dataset.target);
  });

  init3DTilt();
}

/* ── 3D tilt ──────────────────────────────────────────────────── */
function init3DTilt() {
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -4;
      const ry = ((e.clientX - r.left - r.width/2)  / (r.width/2))  *  4;
      card.style.transform  = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.01,1.01,1.01)`;
      card.style.transition = 'transform 0.1s ease-out';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'none';
      card.style.transition = 'transform 0.5s var(--ease)';
    });
  });
}

loadEvents();

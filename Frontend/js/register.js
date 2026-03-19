// =================================================================
//  register.js — ลงทะเบียนเข้าร่วมกิจกรรม
//  API  : GET  /events/:id                 → event detail
//         GET  /events/:id/participants    → participant list
//         POST /events/:id/register       → { message }
//         DELETE /registrations/:id       → 204
// =================================================================

const API     = 'http://localhost:8000';
const params  = new URLSearchParams(window.location.search);
const eventId = params.get('id');

// ถ้าไม่มี id ให้กลับหน้าหลัก
if (!eventId) window.location.href = 'index.html';

/* ── Navbar ───────────────────────────────────────────────────── */
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
  const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
  document.getElementById('navUser').textContent = initial;
  document.getElementById('navUser').classList.remove('hidden');
  document.getElementById('btnLogout').classList.remove('hidden');
  document.getElementById('btnLogin').classList.add('hidden');
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

/* ── Alert helper ─────────────────────────────────────────────── */
function showAlert(msg, type) {
  const el = document.getElementById('formAlert');
  el.className = `form-alert ${type}`;
  el.innerHTML = `<span>${msg}</span>`;
}

/* ── Load event detail ────────────────────────────────────────── */
async function loadEvent() {
  try {
    const res = await fetch(`${API}/events/${eventId}`);
    const e   = await res.json();

    const pct    = Math.round((e.current_participants / e.max_participants) * 100);
    const isFull = e.current_participants >= e.max_participants;
    const date   = new Date(e.event_date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const fillColor = isFull ? 'var(--status-full)' : pct >= 80 ? 'var(--status-almost)' : 'var(--status-open)';

    document.getElementById('eventInfo').innerHTML = `
      <div class="ev-badge">${e.sport_type}</div>
      <h3>${e.title}</h3>
      <div class="ev-detail">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        ${date}
      </div>
      <div class="ev-detail">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        ${e.location || '-'}
      </div>
      ${e.description ? `<div class="ev-detail" style="opacity:.7;">${e.description}</div>` : ''}
      <div class="prog-wrap">
        <div class="prog-label"><span>ผู้เข้าร่วม</span><span>${e.current_participants}/${e.max_participants} คน</span></div>
        <div class="prog-track">
          <div class="prog-fill" style="width:${pct}%; background:${fillColor};"></div>
        </div>
      </div>
    `;
  } catch (err) { console.error('loadEvent error', err); }
}

/* ── Load participants list ───────────────────────────────────── */
async function loadParticipants() {
  try {
    const res  = await fetch(`${API}/events/${eventId}/participants`);
    const list = await res.json();
    const tbody = document.getElementById('participantList');

    document.getElementById('countBadge').textContent = `${list.length} คน`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-table">ยังไม่มีผู้ลงทะเบียน</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.first_name} ${p.last_name}</td>
        <td>${p.student_id}</td>
        <td>${p.faculty}</td>
        <!-- เบอร์โทร: admin เห็นจริง, user ธรรมดาเบลอ -->
        <td>${user && user.role === 'admin' ? (p.phone || '-') : '•••••••••••'}</td>
        <td><button class="btn-cancel" onclick="cancelReg(${p.id})">ยกเลิก</button></td>
      </tr>`).join('');
  } catch (err) { console.error('loadParticipants error', err); }
}

/* ── Submit registration ──────────────────────────────────────── */
async function submitRegister() {
  const data = {
    first_name : document.getElementById('first_name').value.trim(),
    last_name  : document.getElementById('last_name').value.trim(),
    student_id : document.getElementById('student_id').value.trim(),
    faculty    : document.getElementById('faculty').value,
    phone      : document.getElementById('phone').value.trim()
  };

  if (!data.first_name || !data.last_name || !data.student_id || !data.faculty) {
    showAlert('โปรดกรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
    return;
  }

  try {
    const res    = await fetch(`${API}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (!res.ok) {
      showAlert(result.errors ? result.errors.join(', ') : result.message, 'error');
      return;
    }

    showAlert('ลงทะเบียนสำเร็จ!', 'success');
    // เคลียร์ฟอร์ม
    ['first_name','last_name','student_id','phone'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('faculty').value = '';
    // รีโหลดข้อมูล
    loadEvent();
    loadParticipants();
  } catch (err) {
    showAlert('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้', 'error');
  }
}

/* ── Cancel registration ──────────────────────────────────────── */
async function cancelReg(id) {
  if (!confirm('ยืนยันการยกเลิกการลงทะเบียน?')) return;
  try {
    const res = await fetch(`${API}/registrations/${id}`, { method: 'DELETE' });
    if (res.ok) { loadEvent(); loadParticipants(); }
  } catch (err) { console.error('cancelReg error', err); }
}

/* ── Init ─────────────────────────────────────────────────────── */
loadEvent();
loadParticipants();

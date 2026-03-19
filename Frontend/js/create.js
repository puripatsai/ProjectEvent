// =================================================================
//  create.js — สร้างกิจกรรมใหม่ (Admin only)
//  API  : POST /events → { id, message }
// =================================================================

const API = 'http://localhost:8000';

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

/* ── Submit (ชื่อต่างจาก createEvent เพื่อไม่ชน browser built-in) */
async function submitCreateEvent() {
  const data = {
    title           : document.getElementById('title').value.trim(),
    sport_type      : document.getElementById('sport_type').value,
    event_date      : document.getElementById('event_date').value,
    location        : document.getElementById('location').value.trim(),
    max_participants: document.getElementById('max_participants').value,
    description     : document.getElementById('description').value.trim()
  };

  // validation เบื้องต้น
  if (!data.title || !data.sport_type || !data.event_date || !data.location || !data.max_participants) {
    showAlert('โปรดกรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
    return;
  }

  try {
    const res    = await fetch(`${API}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (!res.ok) {
      showAlert(result.errors ? result.errors.join(', ') : result.message, 'error');
      return;
    }

    showAlert('สร้างกิจกรรมสำเร็จ! กำลังกลับหน้าหลัก...', 'success');
    setTimeout(() => window.location.href = 'index.html', 1400);
  } catch (err) {
    showAlert('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้', 'error');
  }
}

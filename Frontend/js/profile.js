// =================================================================
//  profile.js — โปรไฟล์ผู้ใช้ + รายการกิจกรรมที่ลงทะเบียน
//  API  : GET /events              → all events
//         GET /events/:id/participants → participants list
//         DELETE /registrations/:id   → 204
// =================================================================

const API = 'http://localhost:8000';

/* ── เช็ค login ──────────────────────────────────────────────── */
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'login.html';

/* ── Navbar ───────────────────────────────────────────────────── */
const initial = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
document.getElementById('navUser').textContent = initial;

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

/* ── แสดงข้อมูลโปรไฟล์ ───────────────────────────────────────── */
document.getElementById('profileName').textContent  = `${user.first_name} ${user.last_name}`;
document.getElementById('profileId').textContent    = `รหัสนิสิต: ${user.student_id}`;
document.getElementById('infoFaculty').textContent  = user.faculty  || '-';
document.getElementById('infoMajor').textContent    = user.major    || 'ไม่ระบุ';
document.getElementById('infoYear').textContent     = user.year ? `ปี ${user.year}` : '-';
document.getElementById('infoStudentId').textContent= user.student_id;
document.getElementById('roleBadge').textContent    = user.role === 'admin' ? '👑 Administrator' : '🎓 นักศึกษา';

/* Avatar SVG */
document.getElementById('avatarEl').innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       width="36" height="36" fill="var(--text-tertiary)">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4
             7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6
             1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>`;

/* ── โหลดกิจกรรมที่ลงทะเบียน ─────────────────────────────────── */
async function loadMyEvents() {
  try {
    // ดึง events ทั้งหมด แล้วตรวจว่า student_id ของเราอยู่ใน participants ไหม
    const eventsRes = await fetch(`${API}/events`);
    const events    = await eventsRes.json();

    const myList = [];
    for (const event of events) {
      const pRes = await fetch(`${API}/events/${event.id}/participants`);
      const pArr = await pRes.json();
      const mine = pArr.find(p => p.student_id === user.student_id);
      if (mine) myList.push({ ...mine, event });
    }

    // คำนวณ stats
    const today    = new Date();
    const upcoming = myList.filter(r => new Date(r.event.event_date) >= today);
    const past     = myList.filter(r => new Date(r.event.event_date) < today);

    document.getElementById('statTotal').textContent    = myList.length;
    document.getElementById('statUpcoming').textContent = upcoming.length;
    document.getElementById('statPast').textContent     = past.length;

    // render
    const container = document.getElementById('myEvents');
    if (myList.length === 0) {
      container.innerHTML = `
        <div class="profile-empty">
          ยังไม่ได้ลงทะเบียนกิจกรรมใดเลย<br><br>
          <a href="index.html">ดูกิจกรรมทั้งหมด →</a>
        </div>`;
      return;
    }

    container.innerHTML = myList.map(r => {
      const date    = new Date(r.event.event_date).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      const regDate = new Date(r.registered_at || Date.now()).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      const isPast = new Date(r.event.event_date) < today;

      return `
        <div class="event-item">
          <div>
            <div class="ev-sport-tag">${r.event.sport_type}</div>
            <div class="ev-title">${r.event.title}</div>
            <div class="ev-meta">
              <span>📅 ${date}</span>
              <span>📍 ${r.event.location || '-'}</span>
            </div>
          </div>
          <div class="ev-right">
            ${!isPast
              ? `<button class="btn-ev-cancel" onclick="cancelReg(${r.id})">ยกเลิก</button>`
              : `<span style="font-size:12px;color:var(--text-tertiary);">ผ่านมาแล้ว</span>`}
            <div class="ev-reg-date">ลงทะเบียน ${regDate}</div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    document.getElementById('myEvents').innerHTML =
      `<div class="profile-empty">เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้</div>`;
  }
}

/* ── ยกเลิกการลงทะเบียน ──────────────────────────────────────── */
async function cancelReg(id) {
  if (!confirm('ยืนยันการยกเลิกการลงทะเบียน?')) return;
  try {
    const res = await fetch(`${API}/registrations/${id}`, { method: 'DELETE' });
    if (res.ok) loadMyEvents();
  } catch (err) { console.error('cancelReg error', err); }
}

/* ── Init ─────────────────────────────────────────────────────── */
loadMyEvents();

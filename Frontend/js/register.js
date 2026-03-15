const API = 'http://localhost:8000';
const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');

if (!eventId) window.location.href = 'index.html';

// NAVBAR
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    document.getElementById('navUser').textContent = `👤 ${user.first_name} ${user.last_name}`;
    document.getElementById('navLogin').style.display = 'none';
    document.getElementById('navLogout').style.display = 'inline';
}
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function loadEvent() {
    try {
        const res = await fetch(`${API}/events/${eventId}`);
        const e = await res.json();
        const isFull = e.current_participants >= e.max_participants;
        const percent = Math.round((e.current_participants / e.max_participants) * 100);
        const date = new Date(e.event_date).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('eventInfo').innerHTML = `
            <div class="badge">${e.sport_type}</div>
            <h3>${e.title}</h3>
            <div class="detail"><span>📅</span><span>${date}</span></div>
            <div class="detail"><span>📍</span><span>${e.location}</span></div>
            <div class="detail"><span>📝</span><span>${e.description || '-'}</span></div>
            <div class="progress-wrap">
                <div class="progress-label">
                    <span>ผู้เข้าร่วม</span>
                    <span>${e.current_participants}/${e.max_participants} คน</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${isFull ? 'full' : ''}" style="width:${percent}%"></div>
                </div>
            </div>
        `;
    } catch (err) { console.error(err); }
}

async function loadParticipants() {
    try {
        const res = await fetch(`${API}/events/${eventId}/participants`);
        const list = await res.json();
        const tbody = document.getElementById('participantList');
        document.getElementById('countBadge').textContent = `${list.length} คน`;
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-table">ยังไม่มีผู้ลงทะเบียน</td></tr>';
            return;
        }
        tbody.innerHTML = list.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${p.first_name} ${p.last_name}</td>
                <td>${p.student_id}</td>
                <td>${p.faculty}</td>
                <td>${p.phone || '-'}</td>
                <td><button class="btn-cancel" onclick="cancelReg(${p.id})">ยกเลิก</button></td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

async function register() {
    const alertBox = document.getElementById('alert');
    alertBox.className = 'alert';
    const data = {
        first_name: document.getElementById('first_name').value.trim(),
        last_name: document.getElementById('last_name').value.trim(),
        student_id: document.getElementById('student_id').value.trim(),
        faculty: document.getElementById('faculty').value,
        phone: document.getElementById('phone').value.trim()
    };
    try {
        const res = await fetch(`${API}/events/${eventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            alertBox.className = 'alert error';
            alertBox.textContent = result.errors ? result.errors.join(', ') : result.message;
            return;
        }
        alertBox.className = 'alert success';
        alertBox.textContent = '✅ ลงทะเบียนสำเร็จ!';
        ['first_name','last_name','student_id','phone'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('faculty').value = '';
        loadEvent();
        loadParticipants();
    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้';
    }
}

async function cancelReg(id) {
    if (!confirm('ยืนยันการยกเลิกการลงทะเบียน?')) return;
    try {
        const res = await fetch(`${API}/registrations/${id}`, { method: 'DELETE' });
        if (res.ok) { loadEvent(); loadParticipants(); }
    } catch (err) { console.error(err); }
}

loadEvent();
loadParticipants();
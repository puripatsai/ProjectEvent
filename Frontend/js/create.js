const API = 'http://localhost:8000';

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

async function createEvent() {
    const alertBox = document.getElementById('alert');
    alertBox.className = 'alert';

    const data = {
        title: document.getElementById('title').value.trim(),
        sport_type: document.getElementById('sport_type').value,
        event_date: document.getElementById('event_date').value,
        location: document.getElementById('location').value.trim(),
        max_participants: document.getElementById('max_participants').value,
        description: document.getElementById('description').value.trim()
    };

    try {
        const res = await fetch(`${API}/events`, {
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
        alertBox.textContent = '✅ สร้างกิจกรรมสำเร็จ! กำลังกลับหน้าหลัก...';
        setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้';
    }
}
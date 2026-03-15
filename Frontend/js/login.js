const API = 'http://localhost:8000';

if (localStorage.getItem('token')) window.location.href = 'index.html';

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
    });
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    document.getElementById('alert').className = 'alert';
}

async function login() {
    const alertBox = document.getElementById('alert');
    alertBox.className = 'alert';
    const data = {
        student_id: document.getElementById('login_student_id').value.trim(),
        password: document.getElementById('login_password').value
    };
    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            alertBox.className = 'alert error';
            alertBox.textContent = result.message;
            return;
        }
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        alertBox.className = 'alert success';
        alertBox.textContent = `✅ ยินดีต้อนรับ ${result.user.first_name}!`;
        setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้';
    }
}

async function registerUser() {
    const alertBox = document.getElementById('alert');
    alertBox.className = 'alert';
    const data = {
        student_id: document.getElementById('reg_student_id').value.trim(),
        first_name: document.getElementById('reg_first_name').value.trim(),
        last_name: document.getElementById('reg_last_name').value.trim(),
        year: document.getElementById('reg_year').value,
        faculty: document.getElementById('reg_faculty').value,
        major: document.getElementById('reg_major').value.trim(),
        password: document.getElementById('reg_password').value
    };
    try {
        const res = await fetch(`${API}/register`, {
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
        alertBox.textContent = '✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ';
        setTimeout(() => switchTab('login'), 1500);
    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้';
    }
}
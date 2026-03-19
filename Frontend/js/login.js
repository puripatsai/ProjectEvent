// =================================================================
//  login.js — Authentication: Login & Register
//  API  : POST /login    → { token, user }
//         POST /register → { message }
// =================================================================

const API = 'http://localhost:8000';

/* ── redirect ถ้า login แล้ว ─────────────────────────────────── */
if (localStorage.getItem('token')) window.location.href = 'index.html';

/* ── Tab switching (segmented control) ───────────────────────── */
function switchTab(tab) {
  const indicator  = document.getElementById('segmentIndicator');
  const btnLogin   = document.getElementById('tabLogin');
  const btnReg     = document.getElementById('tabRegister');
  const formLogin  = document.getElementById('formLogin');
  const formReg    = document.getElementById('formRegister');

  hideAlert();

  if (tab === 'login') {
    indicator.style.transform = 'translateX(0)';
    btnLogin.classList.add('active');   btnReg.classList.remove('active');
    formLogin.classList.add('active');  formReg.classList.remove('active');
  } else {
    indicator.style.transform = 'translateX(100%)';
    btnReg.classList.add('active');     btnLogin.classList.remove('active');
    formReg.classList.add('active');    formLogin.classList.remove('active');
  }
}

/* ── Alert helpers ────────────────────────────────────────────── */
function showAlert(msg, type) {
  const banner = document.getElementById('alertBanner');
  const icon = type === 'error'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  banner.className = `alert-banner ${type}`;
  banner.innerHTML = `${icon}<span>${msg}</span>`;
}
function hideAlert() {
  const banner = document.getElementById('alertBanner');
  banner.className = 'alert-banner';
  banner.innerHTML = '';
}

/* ── Set loading state on button ─────────────────────────────── */
function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           style="animation:spin 0.8s linear infinite;">
         <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
         <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
         <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
         <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
       </svg> กำลังดำเนินการ...`
    : defaultText;
}

/* ── Login ────────────────────────────────────────────────────── */
async function processLogin() {
  const student_id = document.getElementById('login_student_id').value.trim();
  const password   = document.getElementById('login_password').value;

  if (!student_id || !password) {
    showAlert('โปรดกรอกรหัสนิสิตและรหัสผ่านให้ครบถ้วน', 'error');
    return;
  }

  setLoading('btnLogin', true, 'เข้าสู่ระบบ');
  hideAlert();

  try {
    const res    = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, password })
    });
    const result = await res.json();

    if (!res.ok) {
      showAlert(result.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
      setLoading('btnLogin', false, 'เข้าสู่ระบบ');
      return;
    }

    // บันทึก token และข้อมูลผู้ใช้
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    showAlert(`ยินดีต้อนรับ ${result.user.first_name}! กำลังพาไปหน้าหลัก...`, 'success');
    setTimeout(() => window.location.href = 'index.html', 900);

  } catch (err) {
    showAlert('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    setLoading('btnLogin', false, 'เข้าสู่ระบบ');
  }
}

/* ── Register ─────────────────────────────────────────────────── */
async function processRegister() {
  const data = {
    student_id : document.getElementById('reg_student_id').value.trim(),
    first_name : document.getElementById('reg_first_name').value.trim(),
    last_name  : document.getElementById('reg_last_name').value.trim(),
    year       : document.getElementById('reg_year').value,
    faculty    : document.getElementById('reg_faculty').value,
    major      : document.getElementById('reg_major').value.trim(),
    password   : document.getElementById('reg_password').value
  };

  if (!data.student_id || !data.first_name || !data.last_name || !data.password) {
    showAlert('โปรดกรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
    return;
  }

  setLoading('btnRegister', true, 'สร้างบัญชี');
  hideAlert();

  try {
    const res    = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (!res.ok) {
      showAlert(result.errors ? result.errors.join(', ') : result.message, 'error');
      setLoading('btnRegister', false, 'สร้างบัญชี');
      return;
    }

    showAlert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ', 'success');
    setTimeout(() => switchTab('login'), 1400);
    setLoading('btnRegister', false, 'สร้างบัญชี');

  } catch (err) {
    showAlert('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    setLoading('btnRegister', false, 'สร้างบัญชี');
  }
}

/* inject keyframe สำหรับ spinner */
const s = document.createElement('style');
s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(s);

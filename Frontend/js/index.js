const API = 'http://localhost:8000';
let allEvents = [];
let currentSport = '';
let currentStatus = 'all';

// NAVBAR
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    document.getElementById('navUser').textContent = `👤 ${user.first_name} ${user.last_name}`;
    document.getElementById('navLogin').style.display = 'none';
    document.getElementById('navLogout').style.display = 'inline';
    if (user.role === 'admin') {
        document.getElementById('btnCreate').style.display = 'inline-block';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// DROPDOWN
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    const btn = document.getElementById('dropdownBtn');
    menu.classList.toggle('show');
    btn.classList.toggle('open');
}

function selectSport(sport, label, el) {
    currentSport = sport;
    document.getElementById('selectedSport').textContent = label;
    document.getElementById('dropdownMenu').classList.remove('show');
    document.getElementById('dropdownBtn').classList.remove('open');
    document.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    renderCards();
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('sportDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        document.getElementById('dropdownMenu').classList.remove('show');
        document.getElementById('dropdownBtn').classList.remove('open');
    }
});

// FILTER
function filterStatus(status, el) {
    currentStatus = status;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderCards();
}

// LOAD EVENTS
async function loadEvents() {
    try {
        const res = await fetch(`${API}/events`);
        allEvents = await res.json();
        renderCards();
    } catch (err) {
        document.getElementById('eventList').innerHTML = '<div class="empty">เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้</div>';
    }
}

// RENDER CARDS
function renderCards() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('eventList');

    let filtered = allEvents.filter(e => {
        const matchSport = currentSport === '' || e.sport_type === currentSport;
        const percent = e.current_participants / e.max_participants;
        const isFull = percent >= 1;
        const isAlmost = percent >= 0.8 && !isFull;
        const isOpen = percent < 0.8;
        const matchStatus =
            currentStatus === 'all' ||
            (currentStatus === 'open' && isOpen) ||
            (currentStatus === 'almost' && isAlmost) ||
            (currentStatus === 'full' && isFull);
        const matchSearch =
            e.title.toLowerCase().includes(searchText) ||
            e.location.toLowerCase().includes(searchText) ||
            e.sport_type.toLowerCase().includes(searchText);
        return matchSport && matchStatus && matchSearch;
    });

    document.getElementById('resultCount').textContent = `พบ ${filtered.length} กิจกรรม`;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</div>';
        return;
    }

    container.innerHTML = filtered.map(e => {
        const percent = e.current_participants / e.max_participants;
        const isFull = percent >= 1;
        const isAlmost = percent >= 0.8 && !isFull;
        const percentDisplay = Math.round(percent * 100);
        const statusLabel = isFull ? 'เต็มแล้ว' : isAlmost ? 'ใกล้เต็ม' : 'เปิดรับ';
        const statusClass = isFull ? 'status-full' : isAlmost ? 'status-almost' : 'status-open';
        const fillClass = isFull ? 'full' : isAlmost ? 'almost' : '';
        const date = new Date(e.event_date).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-header-top">
                        <span class="sport-badge">${e.sport_type}</span>
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                    <h3>${e.title}</h3>
                </div>
                <div class="card-body">
                    <div class="info"><span>📅</span><span>${date}</span></div>
                    <div class="info"><span>📍</span><span>${e.location}</span></div>
                    <div class="info"><span>📝</span><span>${e.description || '-'}</span></div>
                    <div class="progress-wrap">
                        <div class="progress-label">
                            <span>ผู้เข้าร่วม</span>
                            <span>${e.current_participants}/${e.max_participants} คน</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${fillClass}" style="width:${percentDisplay}%"></div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    ${isFull
                        ? `<span class="btn-register disabled">เต็มแล้ว</span>`
                        : `<a href="register.html?id=${e.id}" class="btn-register">ลงทะเบียน</a>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

loadEvents();
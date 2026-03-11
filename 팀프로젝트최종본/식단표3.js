/* --- [1] 기본 설정 및 데이터 (기존 유지) --- */
const daysLabel = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
let currentSelectedDate = new Date('2026-03-06');
let viewDate = new Date('2026-03-06');
let activeDayIndex = null;
let lastVeganState = false;
const riceTypes = ["흰밥", "잡곡밥", "쌀밥", "현미밥", "흑미밥"];

const allergySymptoms = {
    "땅콩": "호흡 곤란 및 얼굴 부종 주의", "갑각류": "가려움증 및 복통 주의", "우유": "소화 불량 및 발진 주의",
    "난류": "두드러기 및 아토피 주의", "메밀": "심한 알레르기 쇼크 주의", "대두": "피부 발진 주의",
    "복숭아": "입술 부종 및 가려움 주의", "토마토": "입 주변 두드러기 주의", "호두": "알레르기 쇼크 주의",
    "닭고기": "두드러기 주의", "쇠고기": "피부 발진 주의", "밀": "소화 장애 및 복통 주의",
    "고등어": "가려움 및 두드러기 주의", "게": "갑각류 알레르기 반응 주의", "새우": "갑각류 알레르기 반응 주의",
    "돼지고기": "피부 가려움 주의", "오징어": "피부 반응 주의", "조개류": "설사 및 복통 주의",
    "홍합": "어패류 알레르기 주의", "전복": "어패류 알레르기 주의", "굴": "어패류 알레르기 주의"
};

const menuDB = [
    { n: "땅콩조림", a: ["땅콩"], v: true }, { n: "해물칼국수", a: ["새우", "밀"], v: false },
    { n: "우유푸딩", a: ["우유"], v: false }, { n: "찜닭", a: ["닭고기"], v: false },
    { n: "불고기", a: ["쇠고기"], v: false }, { n: "제육볶음", a: ["돼지고기"], v: false },
    { n: "돈까스", a: ["돼지고기", "밀"], v: false }, { n: "새우볶음밥", a: ["새우", "난류"], v: false },
    { n: "마파두부", a: ["대두", "돼지고기"], v: true }, { n: "짜장면", a: ["밀", "돼지고기"], v: false },
    { n: "설렁탕", a: ["쇠고기"], v: false }, { n: "순두부찌개", a: ["조개류", "대두"], v: true },
    { n: "갈치조림", a: [], v: false }, { n: "소고기무국", a: ["쇠고기"], v: false },
    { n: "탕수육", a: ["돼지고기", "밀", "난류"], v: false }, { n: "오므라이스", a: ["난류"], v: false },
    { n: "고등어조림", a: ["고등어"], v: false }, { n: "부대찌개", a: ["돼지고기", "대두"], v: false },
    { n: "김치볶음밥", a: ["돼지고기"], v: false }, { n: "칼국수", a: ["밀"], v: true },
    { n: "비빔밥", a: ["대두", "난류"], v: true }, { n: "미역국", a: ["조개류"], v: true },
    { n: "닭갈비", a: ["닭고기"], v: false }, { n: "된장찌개", a: ["대두"], v: true }
];

/* --- [2] UI 제어 함수들 (기존 유지) --- */
function toggleMoreAllergy() {
    const content = document.getElementById('moreAllergyContent');
    const btn = document.querySelector('.more-btn');
    if (content.style.display === 'grid') { content.style.display = 'none'; btn.innerText = '▼ 더보기'; }
    else { content.style.display = 'grid'; btn.innerText = '▲ 접기'; }
}

function handleVeganClick() {
    lastVeganState = !lastVeganState;
    localStorage.setItem('veganMode', lastVeganState);
    updateUI();
}

function clearAllergies() {
    const noAllergyChecked = document.getElementById('noAllergy').checked;
    if (noAllergyChecked) {
        document.querySelectorAll('input[name="allergy"]').forEach(cb => { if (cb.id !== 'noAllergy') cb.checked = false; });
    }
    updateUI();
}

function resetFocus() { activeDayIndex = null; renderMeals(); }
function focusDay(index, event) { event.stopPropagation(); activeDayIndex = (activeDayIndex === index) ? null : index; renderMeals(); }
function changeDate(days) { currentSelectedDate.setDate(currentSelectedDate.getDate() + days); activeDayIndex = null; updateUI(); }

function updateUI() {
    const y = currentSelectedDate.getFullYear(); const m = currentSelectedDate.getMonth() + 1; const d = currentSelectedDate.getDate();
    const displayEl = document.getElementById('weekDisplay');
    if (displayEl) displayEl.innerText = `${y}년 ${m}월 ${d}일`;
    renderMeals();
}
/*추가한 코드입니다(상민)
/* --- [3] 렌더링 함수 (보내주신 중복 방지 로직 적용 버전) --- */
function renderMeals() {
    const grid = document.getElementById('mealGrid');
    if (!grid) return;

    const limitDate = new Date(2026, 3, 1);
    if (currentSelectedDate >= limitDate) {
        grid.innerHTML = `<div class="no-menu-container"><div class="no-menu-box"><h3>📅 아직 메뉴가 선정되지 않았습니다.</h3></div></div>`;
        return;
    }

    const userList = JSON.parse(localStorage.getItem('UserList')) || [];
    const loggedInEmail = localStorage.getItem('loggedInUserEmail');
    const userData = userList.find(user => user.email === loggedInEmail);

    const loginUser = loadJs('loginUser');
    const selectedAllergies = loginUser ? (loginUser.myAllergies || []) : [];
    const isVeganFilter = localStorage.getItem('veganMode') === 'true';

    let daySeed = currentSelectedDate.getDate();

    grid.innerHTML = daysLabel.map((day, index) => {
        let hasAllergyInDay = false;
        let hasVeganInDay = false;

        const mealContent = ['조식', '중식', '석식'].map((type, i) => {
            const items = [
                { n: riceTypes[(daySeed + index + i) % riceTypes.length], a: [], v: true },
                menuDB[(daySeed + (index * 7) + (i * 13)) % menuDB.length],
                menuDB[(daySeed + (index * 11) + (i * 17) + 5) % menuDB.length],
                menuDB[(daySeed + (index * 13) + (i * 19) + 10) % menuDB.length]
            ];

            const menuListHtml = items.map(m => {
                if (!m) return "";
                const foundAllergy = m.a.filter(ai => selectedAllergies.includes(ai));
                const isAllergyHit = foundAllergy.length > 0;
                const isVeganHit = isVeganFilter && m.v;

                if (isAllergyHit) hasAllergyInDay = true;
                else if (isVeganHit) hasVeganInDay = true;

                let itemClass = "";
                let itemStyle = "";

                if (isAllergyHit) {
                    itemClass = "menu-danger-light-red";
                    itemStyle = 'style="color: #FF8080 !important; font-weight: bold;"';
                } else if (isVeganHit) {
                    itemClass = "menu-vegan-highlight";
                    itemStyle = 'style="color: #90EE90 !important; font-weight: bold;"';
                }

                const clickType = isAllergyHit ? 'allergy' : (isVeganHit ? 'vegan' : '');
                const clickData = isAllergyHit ? foundAllergy.join(', ') : (isVeganHit ? '비건 식단' : '');
                return `<li class="${itemClass}" ${itemStyle} onclick="event.stopPropagation(); if('${clickType}') showAlert('${m.n}', '${clickData}', '${clickType}')">${m.n}</li>`;
            }).join('');

            return `<div class="meal-section"><span class="type-label">${type}</span><ul class="name-only">${menuListHtml}</ul></div>`;
        }).join('');

        let highlightClass = "";
        let headerStyle = "";

        if (hasAllergyInDay) {
            highlightClass = "highlight-red";
            headerStyle = 'style="background-color: #FFDADA !important; color: #FF4D4D !important;"';
        } else if (hasVeganInDay) {
            highlightClass = "highlight-vegan";
            headerStyle = 'style="background-color: #FFFACD !important; color: #856404 !important;"';
        }

        return `
            <div class="day-card ${highlightClass} ${activeDayIndex === index ? 'active-focus' : ''}" onclick="focusDay(${index}, event)">
                <div class="card-header" ${headerStyle}>${day}</div> 
                ${mealContent}
            </div>`;
    }).join('');
}

/* --- [4] 추가 필수 기능 (달력 및 알림창 제어) --- */
function toggleCalendar() {
    const modal = document.getElementById('calendarModal');
    if (modal) {
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) renderCalendar();
    }
}

function moveMonth(n) {
    viewDate.setMonth(viewDate.getMonth() + n);
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const year = viewDate.getFullYear(); const month = viewDate.getMonth();
    const displayEl = document.getElementById('calMonthDisplay');
    if (displayEl) displayEl.innerText = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;
    for (let d = 1; d <= lastDate; d++) {
        grid.innerHTML += `<div class="cal-item" onclick="selectDate(${year}, ${month}, ${d})">${d}</div>`;
    }
}

function selectDate(y, m, d) {
    currentSelectedDate = new Date(y, m, d);
    viewDate = new Date(y, m, d);
    activeDayIndex = null;
    updateUI();
    toggleCalendar();
}

function showAlert(name, info, type) {
    const nameEl = document.getElementById('alertMenuName');
    const titleEl = document.getElementById('alertTitle');
    const msgEl = document.getElementById('alertMessage');
    const symptomEl = document.getElementById('symptomText');
    const modal = document.getElementById('alertModal');

    if (nameEl) nameEl.innerText = `상세 정보: ${name}`;

    if (type === 'allergy') {
        if (titleEl) { titleEl.innerText = "⚠️ 알레르기 경고"; titleEl.style.color = "#d63031"; }
        if (msgEl) msgEl.innerHTML = `등록하신 [<strong>${info}</strong>] 성분이 포함되었습니다.`;
        if (symptomEl) symptomEl.innerText = allergySymptoms[info.split(', ')[0]] || "주의가 필요합니다.";
    } else {
        if (titleEl) { titleEl.innerText = "🌱 비건 메뉴 안내"; titleEl.style.color = "#27ae60"; }
        if (msgEl) msgEl.innerHTML = `이 메뉴는 [<strong>${info}</strong>] 입니다.`;
        if (symptomEl) symptomEl.innerText = "육류 성분이 포함되지 않은 식단입니다.";
    }
    if (modal) modal.classList.add('active');
}

function closeAlert() {
    const modal = document.getElementById('alertModal');
    if (modal) modal.classList.remove('active');
}

window.onload = function () { updateUI(); };
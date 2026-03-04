// loadHTML('header-include', './header.html');
// loadHTML('footer-include', './footer.html');
// console.log("파일 로딩 실패")

let startHour = null;
let endHour = null;
/*========================
    HTML 요소 가져오기
========================*/
const openDateBtn = document.getElementById('open-date');
const calendarBox = document.getElementById('calendar-box');
const closeBtn = document.getElementById('close-calendar');
const calendarEl = document.getElementById('calendar');
const currentMonthYear = document.getElementById('current-month-year');
const dateWarning = document.getElementById('date-warning');

// 인원 선택
const minusBtn = document.getElementById('minus-person');
const plusBtn = document.getElementById('plus-person');
const personCount = document.getElementById('person-count');

// 카테고리
const openFBtn = document.getElementById('open-f');
const categoryDropdown = document.getElementById('category-dropdown');
const categoryItems = document.querySelectorAll('.category-item');
const classItems = document.querySelectorAll('.class-item');

/*========================
        인원 선택
    ========================*/
minusBtn.addEventListener('click', () => {
    let count = parseInt(personCount.textContent);
    if (count > 1) count--;
    personCount.textContent = count;
});

plusBtn.addEventListener('click', () => {
    let count = parseInt(personCount.textContent);
    count++;
    personCount.textContent = count;
});

/*========================
    달력 열기/닫기
========================*/
openDateBtn.addEventListener('click', () => {
    calendarBox.style.display = 'block';
});
closeBtn.addEventListener('click', () => {
    calendarBox.style.display = 'none';
});

/*========================
    현재 날짜 기준
========================*/
const today = new Date();
today.setHours(0, 0, 0, 0);

let selectedDateEl = null;
let selectedYear = today.getFullYear();
let selectedMonth = today.getMonth();
let selectedDay = today.getDate();

/*========================
    달력 상단 연월 표시
========================*/
function updateHeader() {
    currentMonthYear.textContent = `${selectedYear}년 ${selectedMonth + 1}월`;
}
updateHeader();

/*========================
    달력 생성
========================*/
function createCalendar(y, m) {
    calendarEl.innerHTML = '';
    dateWarning.style.display = 'none';
    dateWarning.textContent = '';

    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        calendarEl.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
        const dayEl = document.createElement('div');
        dayEl.textContent = d;

        const thisDate = new Date(y, m, d);
        thisDate.setHours(0, 0, 0, 0);

        if (thisDate < today) {
            dayEl.style.color = 'gray';
            dayEl.style.cursor = 'not-allowed';
            dayEl.addEventListener('click', () => {
                dateWarning.style.display = 'block';
                dateWarning.textContent = '과거 날짜는 선택할 수 없습니다.';
            });
        } else {
            if (d === selectedDay && y === selectedYear && m === selectedMonth) {
                dayEl.classList.add('selected');
                selectedDateEl = dayEl;
            }

            dayEl.addEventListener('click', () => {
                if (selectedDateEl) selectedDateEl.classList.remove('selected');
                dayEl.classList.add('selected');
                selectedDateEl = dayEl;
                selectedDay = d;
                openDateBtn.textContent = `${selectedYear}년 ${selectedMonth + 1}월 ${selectedDay}일`;
                dateWarning.style.display = 'none';
                dateWarning.textContent = '';
            });
        }

        calendarEl.appendChild(dayEl);
    }
}

createCalendar(selectedYear, selectedMonth);

/*========================
    연도 클릭 시 선택 모드 + 좌우 화살표
========================*/
currentMonthYear.addEventListener('click', () => {
    calendarEl.innerHTML = '';
    dateWarning.style.display = 'none';
    dateWarning.textContent = '';

    let startYear = selectedYear - 5;

    const navContainer = document.createElement('div');
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'space-between';
    navContainer.style.marginBottom = '10px';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    prevBtn.style.cursor = 'pointer';
    prevBtn.style.border = '1px solid #ddd';
    prevBtn.style.borderRadius = '8px';
    prevBtn.style.padding = '5px 10px';
    prevBtn.style.background = 'white';
    prevBtn.style.fontWeight = 'bold';

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.border = '1px solid #ddd';
    nextBtn.style.borderRadius = '8px';
    nextBtn.style.padding = '5px 10px';
    nextBtn.style.background = 'white';
    nextBtn.style.fontWeight = 'bold';

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);
    calendarEl.appendChild(navContainer);

    const yearContainer = document.createElement('div');
    yearContainer.style.display = 'grid';
    yearContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    yearContainer.style.gap = '5px';
    yearContainer.style.marginBottom = '10px';
    calendarEl.appendChild(yearContainer);

    function renderYears() {
        yearContainer.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const year = startYear + i;
            const yearEl = document.createElement('div');
            yearEl.textContent = year;
            yearEl.style.cursor = 'pointer';
            yearEl.style.textAlign = 'center';
            yearEl.style.fontWeight = 'bold';
            yearEl.style.padding = '8px';
            yearEl.style.border = '1px solid #ddd';
            yearEl.style.borderRadius = '8px';
            yearEl.style.background = year === selectedYear ? '#FBCB4C' : 'white';
            yearEl.style.color = 'black';

            yearEl.addEventListener('click', () => {
                selectedYear = year;
                calendarEl.innerHTML = '';

                const monthContainer = document.createElement('div');
                monthContainer.style.display = 'grid';
                monthContainer.style.gridTemplateColumns = 'repeat(5, auto)';
                monthContainer.style.justifyContent = 'flex-end';
                monthContainer.style.gap = '10px';
                monthContainer.style.marginTop = '10px';

                for (let m = 0; m < 12; m++) {
                    const monthEl = document.createElement('div');
                    monthEl.textContent = (m + 1) + '월';
                    monthEl.style.cursor = 'pointer';
                    monthEl.style.textAlign = 'center';
                    monthEl.style.fontWeight = 'bold';
                    monthEl.style.padding = '8px';
                    monthEl.style.border = '1px solid #ddd';
                    monthEl.style.borderRadius = '8px';
                    monthEl.style.background = m === selectedMonth ? '#FBCB4C' : 'white';
                    monthEl.style.color = 'black';
                    monthEl.style.minWidth = '50px';

                    monthEl.addEventListener('click', () => {
                        selectedMonth = m;
                        updateHeader();
                        createCalendar(selectedYear, selectedMonth);
                    });

                    monthContainer.appendChild(monthEl);
                }

                calendarEl.appendChild(monthContainer);
            });

            yearContainer.appendChild(yearEl);
        }
    }

    prevBtn.addEventListener('click', () => {
        startYear -= 10;
        renderYears();
    });

    nextBtn.addEventListener('click', () => {
        startYear += 10;
        renderYears();
    });

    renderYears();
});

const timeButtons = document.querySelectorAll('.time-buttons button');

timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {

        const hour = parseInt(btn.textContent.split(':')[0]);

        if (startHour === null) {
            startHour = hour;
            btn.classList.add("selected-time");
        }
        else if (endHour === null) {
            endHour = hour;

            if (endHour <= startHour) {
                alert("종료 시간은 시작 시간보다 커야 합니다.");
                endHour = null;
                return;
            }

            btn.classList.add("selected-time");

            openDateBtn.textContent =
                `${selectedYear}년 ${selectedMonth + 1}월 ${selectedDay}일 ${startHour}:00 ~ ${endHour}:00`;
        }
        else {
            // 초기화
            startHour = hour;
            endHour = null;
            document.querySelectorAll(".selected-time")
                .forEach(b => b.classList.remove("selected-time"));
            btn.classList.add("selected-time");
        }
    });
});

/*========================
    카테고리 드롭다운 기능
========================*/
openFBtn.addEventListener('click', () => {
    categoryDropdown.style.display = categoryDropdown.style.display === 'block' ? 'none' : 'block';
});

// 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (!openFBtn.contains(e.target) && !categoryDropdown.contains(e.target)) {
        categoryDropdown.style.display = 'none';
    }
});

/*========================
    🔥 카테고리 선택 시 페이지 이동
========================*/
categoryItems.forEach(item => {
    item.addEventListener('click', () => {

        const type = item.dataset.type; // class 또는 lab
        categoryDropdown.style.display = 'none';

        if (type === 'class') {
            window.location.href =
                "http://127.0.0.1:5500/PROJECT1/HTML/reservation.html";
        }
        else if (type === 'lab') {
            window.location.href =
                "http://127.0.0.1:5500/PROJECT1/HTML/reservation_lab.html";
        }
    });
});
/*========================
    예약하기 → 결제 페이지 이동
========================*/
document.addEventListener('DOMContentLoaded', function () {

    const reserveBtns = document.querySelectorAll('.class-item .reserve-btn');

    reserveBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {

            // 🔥 날짜 선택 검사
            if (!selectedDay) {
                alert("날짜를 선택해주세요.");
                return;
            }

            // 🔥 시간 선택 검사
            if (startHour === null || endHour === null) {
                alert("시간을 선택해주세요.");
                return;
            }

            const classItem = btn.closest(".class-item");
            const center = "클로버 교육센터";
            const room = classItem.querySelector("h2").textContent.split(" ")[2];
            const date = `${selectedYear}년 ${selectedMonth + 1}월 ${selectedDay}일`;
            const person = personCount.textContent;
            const hour = endHour - startHour;

            window.location.href =
                `http://127.0.0.1:5500/PROJECT1/HTML/payment.html?center=${encodeURIComponent(center)}&room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}&person=${person}&hour=${hour}`;
        document.getElementById("payment-complete-btn").addEventListener("click", function () {

    window.location.href =
    `reservation_info.html?center=${encodeURIComponent(center)}&room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}&person=${person}&hour=${hour}&start=${start}&end=${end}`;

});
            });
    });

});
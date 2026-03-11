let startHour = null;
let endHour = null;

const loginUser = loadJs("loginUser");


//강의실 페이지 비 로그인시 숨길항목 숨기는 로직
const hr = document.querySelector(".hr1");
const div1 = document.querySelector("#div1");
const reserveBtn = document.querySelectorAll(".reserve-btn");
reserveBtn.forEach(el => {
    if (!loginUser) {
        el.style.display = "none";
    }
})
if (!loginUser) {
    div1.style.display = "none";
    hr.style.display = " none";
}


const openDateBtn = document.getElementById('open-date');//달력/시간 선택
const openPersonBtn = document.getElementById('open-person-btn');//인원 선택

const calendarBox = document.getElementById('calendar-box');//달력 전체 박스
const closeBtn = document.getElementById('close-calendar');//닫기
const resetBtn = document.getElementById('reset-calendar');// 초기화

const calendarEl = document.getElementById('calendar');//달력 날짜 그리는 곳
const currentMonthYear = document.getElementById('current-month-year');//년도, 월 표시
const dateWarning = document.getElementById('date-warning');// 날짜 경고 문구

const prevMonthBtn = document.getElementById("prev-month");//이전 달
const nextMonthBtn = document.getElementById("next-month");//다음 달
    console.log(prevMonthBtn);
const timeButtons = Array.from(document.querySelectorAll('.time-buttons button'));//시간 버튼들
const timeWarning = document.getElementById("time-warning");//시간 경고 문구

// 인원 선택
const minusBtn = document.getElementById('minus-person');//인원 - 
const plusBtn = document.getElementById('plus-person');//인원 +
const personCount = document.getElementById('person-count');//숫자 표시 span
const peopleWarningEl = document.getElementById("people-warning");//인원 초과 경고

// 카테고리
const openFBtn = document.getElementById('open-f');//카테고리 버튼
const categoryDropdown = document.getElementById('category-dropdown');//드롭다운 박스
const categoryItems = document.querySelectorAll('.category-item');//드롭다운 항목들

// 강의실 카드
const classItems = Array.from(document.querySelectorAll('.class-item'));

// 페이지네이션 영역
const paginationEl = document.getElementById("pagination");

//숫자 한 자리면 01처럼 앞에 0 붙임
function pad2(n) { return String(n).padStart(2, "0"); }
//날짜를 YYYY-MM-DD 형태로 만듬
function toDateKey(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }
function getRoomFromCard(card) {//카드(class-item) 하나를 받아서 몇 호인지 뽑아줌
    const h2 = card.querySelector("h2")?.textContent || "";//카드 안에서 강의실 이름을 찾고 그 안 글자 가져옴
    const match = h2.match(/(\d{3}호)/);//강의실 이름 글자 안에서 숫자3개+호 형태를 찾음
    return match ? match[1] : "";//찾은 경우 ex) match[1] -> 701호 반환, 못 찾은 경우 빈 문자열
}
function getCapacityFromCard(card) {//최대 수용 인원 10명
    const text = card.textContent || "";
    const match = text.match(/최대\s*수용\s*인원\s*:\s*(\d+)\s*명/);
    return match ? parseInt(match[1], 10) : 0;
}
function isOverlapping(aStart, aEnd, bStart, bEnd) {//(이미 예약된 시간과 현재 선택 시간)두 시간 범위가 겹치는지 확인
    return aStart < bEnd && bStart < aEnd;//겹치는 조건
}
let noRoomMsgEl = document.getElementById("no-room-msg");//화면에서 식별자가  요소 찾아서 noRoomMsgEl 변수에 저장해둠
if (!noRoomMsgEl) {//만약 noRoomMsgEl가 없다면 
    noRoomMsgEl = document.createElement("div");//div 태그 생성됨(안내 메세지 박스임)
    noRoomMsgEl.id = "no-room-msg";//div에 id 넣어주기
    noRoomMsgEl.style.width = "85%";//가로폭 지정
    noRoomMsgEl.style.maxWidth = "900px";//폭 제한
    noRoomMsgEl.style.margin = "10px auto 0 auto";
    noRoomMsgEl.style.padding = "12px 16px";
    noRoomMsgEl.style.border = "1px solid #ddd";
    noRoomMsgEl.style.borderRadius = "10px";
    noRoomMsgEl.style.display = "none";
    noRoomMsgEl.textContent = "선택한 조건에 예약 가능한 강의실이 없습니다.";//박스 안 문구
    document.querySelector(".class-list")?.before(noRoomMsgEl);
}
const roomRules = {
    "701호": { allowedDays: [1, 3, 5] },           // 월/수/금
    "702호": { allowedDays: [2, 4, 6] },           // 화/목/토
    "703호": { allowedDays: [1, 2, 3, 4, 5] },     // 평일
    "704호": { allowedDays: [0, 6] },              // 주말
    "705호": { allowedDays: [0, 1, 2, 3, 4, 5] },  // 일~금(토 제외)
    "706호": { allowedDays: [1, 2, 4] },
    "707호": { allowedDays: [1, 3, 5] },
    "708호": { allowedDays: [2, 4, 6] },
    "709호": { allowedDays: [1, 2, 3, 4, 5] },
    "710호": { allowedDays: [0, 6] },
    "711호": { allowedDays: [0, 1, 2, 3, 4, 5] },
    "712호": { allowedDays: [1, 2, 4] },
};

const globalBlackouts = []; // 공통 휴무일을 넣는 배열

function buildRoomAvailabilityForYear(year) {//해당 year 1년치 대해
    const availability = {};//빈 객체(결과 담음)
    //roomRules 배열에 있는 이름들 전부 꺼내서 availability 안에 방마다 빈 배열 만들어 둠
    //예) availability["701호"] = [] 
    Object.keys(roomRules).forEach(room => (availability[room] = []));

    for (let month = 0; month < 12; month++) {//1년은 12개월이니까 0~11까지 반복
        const lastDate = new Date(year, month + 1, 0).getDate();//해당 월의 마지막 날짜가 며칠인지
        for (let day = 1; day <= lastDate; day++) {//그 달의 1일부터 마지막 달까지 하루씩 반복
            const d = new Date(year, month, day);//현재 날짜 객체
            const dow = d.getDay();//요일 
            //YYYY-MM-DD 형태 문자열로 바꿔서 저장
            const dateKey = toDateKey(year, month, day);
            //globalBlackouts 여기 배열 안에 dateKey이게 들어 있으면 휴무일이니까 건너뜀(아래 코드 안 하고 다음 날짜)
            if (globalBlackouts.includes(dateKey)) continue;
            //roomRules 안에 있는 내용을 하나씩 꺼내서 반복
            //"701호", {allowedDays:[1,3,5]} 이런 형태 == 이 호실은 월, 수, 금 예약 가능
            Object.entries(roomRules).forEach(([room, rule]) => {
                if (rule.allowedDays.includes(dow)) {//현재 요일(dow)이 가능한 요일 목록에 들어 있으면 
                    availability[room].push(dateKey);//그 방의 가능한 날짜 리스트에 오늘 날짜(datekey) 넣기
                }
            });
        }
    }
    return availability;//방 별 예약 가능한 날짜 목록 보내줌
}
//2026년 1년치 기준으로
//각 방이 예약 가능한 날짜 목록 만들어서 roomAvailability에 저장함(메뉴판 생각하면 됨)
const roomAvailability = buildRoomAvailabilityForYear(2026);

const STORAGE_KEY = "reservations_v1";//reservations_v1이라는 이름으로 예약 목록을 꺼내고/저장함

function loadReservations() {//예약 목록 꺼내오는 함수
    try {//안전장치(에러나도 작동 하도록)
        const raw = localStorage.getItem(STORAGE_KEY);//STORAGE_KEY("reservations_v1") 이름으로 저장된 값을 가져옴
        return raw ? JSON.parse(raw) : [];//raw가 있으면 JSON 문자열을 실제 배열/객체로 변환해서 반환
    } catch {
        return [];//JSON이 깨져있거나 오류가 나면(파싱 실패 등) 그냥 빈 배열로 반환
    }
}

function hasAnyRoomOnDate(dateKey) {//입력한 날짜에 에약한 방이 하나라도 있는지 확인
    //roomAvailability 안에 있는 방 이름들만 뽑음(메뉴 고르기 생각)
    return Object.keys(roomAvailability).some(room => (roomAvailability[room] || []).includes(dateKey));
}
//특정 방(room)이 특정 날짜(dateKey) + 시간(start~end)에 예약 가능한지 확인하는 함수
function canReserveRoom(room, dateKey, start, end) {

    const availableDates = roomAvailability[room] || [];
    //roomAvailability에서 이 방(room)의 "예약 가능한 날짜 목록"을 가져옴
    //만약 roomAvailability[room]이 없으면 에러 안 나게 빈 배열[]로 처리

    if (!availableDates.includes(dateKey)) return false;
    //이 방이 dateKey 날짜에 운영 안 하면(가능 날짜 목록에 없으면) → 바로 예약 불가(false)

    if (start === null || end === null) return true;
    //시간을 아직 확정 안 했으면(날짜만 고른 상태) → 일단 날짜 기준으로는 가능(true)
    //(시간 겹침 체크는 못하니까 여기서는 통과)

    const reservations = loadReservations().filter(r => r.room === room && r.dateKey === dateKey);
    //저장된 예약 목록을 불러와서(loadReservations)
    //그 중에서 "같은 방 + 같은 날짜" 예약만 골라냄(filter)

    for (const r of reservations) {
        //같은 방/같은 날짜의 기존 예약들을 하나씩 확인하면서

        if (isOverlapping(start, end, r.start, r.end)) return false;
        //내가 선택한 시간(start~end)이 기존 예약 시간(r.start~r.end)과 겹치면
        //예약 불가(false)로 바로 끝냄
    }
    return true;
    // 날짜 규칙 통과
    // 기존 예약이랑 시간도 안 겹쳤다는 뜻
    //그래서 예약 가능(true)
}

const ITEMS_PER_PAGE = 5;//한 페이지에서 보여줄 강의실 개수
let currentPage = 1;//처음 1페이지

function getVisibleCards() {//조건 통과한 카드만 뽑기
    return classItems.filter(card => card.dataset.allowed === "1");//dataset.allowed가 "1"
}

function applyPagination() {
    const visible = getVisibleCards();//조건 통과한 카드 목록을 가져옴
    const total = visible.length;//통과 카드가 총 몇 개인지
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));//총 페이지 수 계산
    //현재 페이지가 총 페이지보다 크면(필터 바뀌어서 페이지 줄어든 경우)
    //현재 페이지를 마지막 페이지로 맞춤
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;//혹시 1보다 작아지면 1로 맞춤(안전장치)

    classItems.forEach(card => { card.style.display = "none"; });//일단 모든 카드 다 숨김(초기화) -> 다음 페이지때 다시 5개

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;//인덱스 0부터
    const endIdx = startIdx + ITEMS_PER_PAGE;//5개 보여줌
    visible.slice(startIdx, endIdx).forEach(card => {
        card.style.display = "flex";
        //조건 통과 카드(visible)에서
        //현재 페이지 범위(startIdx~endIdx)만 잘라서(slice)
        //그 카드들만 display="flex"로 보여줌
    });

    renderPagination(totalPages);//페이지 버튼 페이지 변할 때마다
}

function renderPagination(totalPages) {//페이지 버튼(이전/1,2,3.../다음)을 만들어서 화면에 붙이는 함수
    if (!paginationEl) return;//요소가 없으면 버튼을 만들 필요가 없으니 바로 종료

    const visible = getVisibleCards(0
        //현재 조건 통과한 카드들(dataset.allowed==="1")만 가져옴
        //(카드가 0개면 페이지 버튼도 숨기려고)
    );
    paginationEl.style.display = visible.length === 0 ? "none" : "flex";
    //조건 통과 카드가 0개면 페이지네이션 자체를 숨김
    //0개가 아니면 보이게(flex)
    paginationEl.innerHTML = "";//기존에 만들어져 있던 페이지 버튼을 싹 지움(새로 다시 그리려고)
    paginationEl.style.justifyContent = "center";
    paginationEl.style.gap = "8px";
    paginationEl.style.margin = "20px 0 40px 0";

    const prev = document.createElement("button");//"이전" 버튼 태그를 새로 만듦
    prev.textContent = "이전";//버튼 글자를 "이전"으로 설정
    prev.disabled = currentPage === 1;//현재가 1페이지면 이전으로 갈 수 없으니까 버튼 비활성화
    prev.className = "page-btn";
    prev.addEventListener("click", () => {//이전 버튼을 클릭했을 때 실행할 동작
        currentPage--;//현재 페이지를 1 감소(2->1, 3->2 이런 식)
        applyPagination();//페이지 바뀌었으니 해당 페이지에 맞게 카드 다시 보여줌
        window.scrollTo({ top: 0, behavior: "smooth" });//페이지 이동하면 화면 맨 위로 부드럽게 올라가게 함
    });
    paginationEl.appendChild(prev);//만든 이전 버튼을 #pagination 영역에 붙임(화면에 보이게)

    for (let p = 1; p <= totalPages; p++) {//1부터 총 페이지 수(totalPages)까지 반복하면서 버튼 만들기
        const btn = document.createElement("button");//페이지 번호 버튼 태그 새로 만듦
        btn.textContent = String(p);//버튼에 표시할 글자를 p로 넣음 ("1", "2", "3"...)
        btn.className = "page-btn";//버튼에 CSS 클래스(page-btn) 붙여서 디자인 적용
        if (p === currentPage) btn.classList.add("active");
        //만약 이 버튼 번호가 현재 페이지랑 같으면(active)
        //색 강조(현재 페이지 표시)하려고 active 클래스 추가
        btn.addEventListener("click", () => {//이 페이지 번호 버튼을 눌렀을 때 실행할 행동
            currentPage = p;//현재 페이지를 내가 누른 번호(p)로 바꿈
            applyPagination();//페이지가 바뀌었으니 해당 페이지 카드만 다시 보여주기
            window.scrollTo({ top: 0, behavior: "smooth" });//페이지 바뀌면 화면 맨 위로 부드럽게 이동
        });
        paginationEl.appendChild(btn);//만든 버튼을 pagination 영역(#pagination)에 붙여서 화면에 보이게 함
    }

    const next = document.createElement("button");//다음 버튼 태그 생성
    next.textContent = "다음";//버튼에 표시될 글자를 다음으로 설정
    next.disabled = currentPage === totalPages;//현재 페이지가 마지막 페이지면 다음 버튼 비활성화
    next.className = "page-btn";//css 적용을 위한 클래스 지정
    next.addEventListener("click", () => {//다음 버튼 클릭 시 실행될 코드
        currentPage++;//현재 페이지 1증가
        applyPagination();//페이지 바뀌었으니 해당 페이지 카드만 보여주도록 다시 적용
        window.scrollTo({ top: 0, behavior: "smooth" });//화면을 맨위로 부드럽게 이동
    });
    paginationEl.appendChild(next);//화면 표시
}

let selectedDateEl = null;//현재 선택 된 날짜 div
const today = new Date(); today.setHours(0, 0, 0, 0);//오늘 날짜, 시간은 00:00:00으로 맞추기

let selectedYear = today.getFullYear();//현재 선택된 연도(올해)
let selectedMonth = today.getMonth();//현재 선택 된 월
let selectedDay = null;//현재 선택된 일
let selectedDateKey = null;//선택된 날짜 문자열(저장 한 값)

function filterRooms(dateKey, start, end) {//카드 필터링
    const people = parseInt(personCount.textContent, 10);//인원 숫자를 숫자로 변환

    let allowedCount = 0;//조건 통과(예약 가능한 카드 몇 개인지)

    classItems.forEach(card => {//모든 강의실 하나씩 검사
        const room = getRoomFromCard(card);//카드에서 방 번호 가져오기
        const cap = getCapacityFromCard(card);//카드에서 최대 수용 인원 숫자 가져오기
        // dateKey가 있으면(=날짜 선택했으면) canReserveRoom로 날짜/시간 예약 가능 검사
        const okDateTime = dateKey ? canReserveRoom(room, dateKey, start, end) : true;
        const okPeople = (cap === 0) ? true : (people <= cap);// 수용인원(cap)이 0이면(파싱 실패 등) 그냥 true 처리

        const ok = okDateTime && okPeople;//날짜/시간도 OK이고 인원도 OK면 최종 OK

        card.dataset.allowed = ok ? "1" : "0";//카드에 값 저장,// "1"이면 조건 통과(예약 가능), "0"이면 조건 불통과(예약 불가)

        const statusEl = card.querySelector(".status");//카드 안 상태 표시 span 찾기
        if (statusEl) {//상태 표시 요소가 있으면 텍스트/색상을 바꿈
            if (!okDateTime) {//날짜/시간이 불가능하면
                statusEl.textContent = "예약 불가";
                statusEl.style.color = "gray";
            } else if (!okPeople) {
                statusEl.textContent = "인원 초과";
                statusEl.style.color = "gray";
            } else {//둘다 통과 시
                statusEl.textContent = "예약 가능";
                statusEl.style.color = "#1aa34a";
            }
        }

        if (ok) allowedCount++;//조건 통과면 카운트 +1
    });
    noRoomMsgEl.style.display = allowedCount === 0 ? "block" : "none";//조건 통과 방이 0개면 에약 가능한 강의실 없음 메세지 띄움/숨김

    currentPage = 1;//필터 조건 바뀌면 페이지 다시 1페이지로 돌림
    applyPagination();//카드 보여주기 갱신
}
//인원 숫자 읽어서 예약인원 버튼에 표시 해줌
function updatePersonUI() {//인원 숫자 업데이트(화면 표시)
    //personCount 안에 들어 있는 글자를 10진수로 바꿔줌(계산 가능 하도록)
    const count = parseInt(personCount.textContent, 10) || 1;
    openPersonBtn.textContent = `예약 인원 ${count}명`;
}
updatePersonUI();

function getMaxCapacityForCurrentFilter() { // 현재 선택된 날짜/시간 조건에서 예약 가능한 방들의 최대 수용 인원 계산
    let maxCap = 0;//최대 수용 인원 저장 변수
    const dateKey = selectedDateKey;//현재 선택 날짜
    const s = startHour;//현재 선택 시작 시간
    const e = endHour;//현재 선택 끝 시간

    classItems.forEach(card => {//모든 카드 검사
        const room = getRoomFromCard(card);//방번호
        const cap = getCapacityFromCard(card);//수용인원
        if (!cap) return;//cap이 0이면 계산 제외

        if (!dateKey) {//날짜 선택을 아직 안 했다면
            maxCap = Math.max(maxCap, cap);//전체 방들 중 최대 수용 인원으로 계산
            return;//다음 카드
        }

        const ok = canReserveRoom(room, dateKey, s, e);//해당 방이 현재 날짜/시간에 가능한지 검사
        if (ok) maxCap = Math.max(maxCap, cap);//그 방 수용 인원을 최대값 후보로 반영
    });
    return maxCap;//최대 수용 인원 반환
}

minusBtn.addEventListener('click', () => {//인원+버튼 누를 때 실행
    let count = parseInt(personCount.textContent, 10);//현재 인원
    if (count > 1) count--;//증가될 인원
    personCount.textContent = count;//현재 필터 조건에서 가능한
    updatePersonUI();//상단 버튼 텍스트도 갱신

    peopleWarningEl.style.display = "none";//인원 초과 경고 숨김
    peopleWarningEl.textContent = "";//경고 문구 초기화

    filterRooms(selectedDateKey, startHour, endHour);//인원 바뀌었으니 카드 필터링 다시 실행
});

plusBtn.addEventListener('click', () => {//인원+버튼 누를 때 실행
    const current = parseInt(personCount.textContent, 10);//현재 인원 숫자 읽기
    const next = current + 1;//1보다 클 때만 감소(최소 1명 유지)

    const maxCap = getMaxCapacityForCurrentFilter();//현재 필토 조건에서 가능한 최대 수용 인원 계산
    if (maxCap > 0 && next > maxCap) {//다음 인원이 최대 수용 인원보다 크면
        peopleWarningEl.style.display = "block";//경고 표시
        peopleWarningEl.textContent = `최대 수용 인원(${maxCap}명)을 넘을 수 없습니다.`;//경고문구
        return;//증가 처리 중단
    }

    personCount.textContent = next;//화면 숫자 갱신 +1
    updatePersonUI();//상단 버튼 텍스트 갱신

    peopleWarningEl.style.display = "none";//경고 숨김
    peopleWarningEl.textContent = "";//경고 문구 초기화

    filterRooms(selectedDateKey, startHour, endHour);
});
//달력 열기
function openCalendar() {
    calendarBox.style.display = 'block';//블럭으로 열기
}
openDateBtn.addEventListener('click', openCalendar);//달력/시간 클릭 선택 
openPersonBtn.addEventListener('click', openCalendar);//인원 선택 클릭 시

closeBtn.addEventListener('click', () => {//달력 닫기 버튼 클릭 시
    calendarBox.style.display = 'none';//달력 박스 숨김
});

function updateHeader() {//달력 상단에 YYYY-M월 표시 업데이트
    currentMonthYear.textContent = `${selectedYear}년 ${selectedMonth + 1}월`;//0~11이므로 +1해서 표시
}
updateHeader();//초기화면에서 헤더 1번 세팅

function createCalendar(y, m) {//연도, 월
    calendarEl.innerHTML = '';//달력 영역 비우기
    dateWarning.style.display = 'none';//날짜 경고 숨김
    dateWarning.textContent = '';//경고 문구 초기화

    const firstDay = new Date(y, m, 1).getDay();//그 달 1일이 무슨 요일인지
    const lastDate = new Date(y, m + 1, 0).getDate();//그 달 마지막 날짜

    for (let i = 0; i < firstDay; i++) {//1일 전까지 빈칸 채우기(요일 맞추기)
        calendarEl.appendChild(document.createElement('div'));//빈 div 추가
    }

    for (let d = 1; d <= lastDate; d++) {//1일부터 마지막 날짜까지 반복
        const dayEl = document.createElement('div');//날짜 칸 생성
        dayEl.textContent = d;//칸에 날짜 숫자 표시

        const thisDate = new Date(y, m, d);//현재 날짜 객체 만들기
        thisDate.setHours(0, 0, 0, 0);//비교를 위해 시간 00:00:00 고정
        const dateKey = toDateKey(y, m, d);//YYYY-MM-DD 문자열 키 생성

        const isPast = thisDate < today;//오늘보다 과거인지 확인
        const anyRoom = hasAnyRoomOnDate(dateKey);//이 날짜에 가능한 방이 하나라도 있는지 확인

        if (isPast) {//과거 날짜면
            dayEl.style.color = 'gray';//회색 처리
            dayEl.style.cursor = 'not-allowed';//마우스 커서 금지 표시
            dayEl.addEventListener('click', () => {//클릭해도 선택 안됨 경고만 띄움
                dateWarning.style.display = 'block';//경고 표시
                dateWarning.textContent = '과거 날짜는 선택할 수 없습니다.';
            });
        } else if (!anyRoom) {//과거는 아니지만 가능한 방이 없는 날짜면
            dayEl.style.color = "#bbb";
            dayEl.style.cursor = "not-allowed";//선택 불가 커서
            dayEl.addEventListener("click", () => {//클릭하면 경고 출력
                dateWarning.style.display = 'block';
                dateWarning.textContent = '해당 날짜는 예약 가능한 강의실이 없습니다.';
            });
        } else {//과거도 아니고 가능한 방도 있는 날짜
            if (selectedDay === d && y === selectedYear && m === selectedMonth) {//이미 선택된 날짜가 있고 그게 현재 달력의 날짜라면 표시 유지
                dayEl.classList.add('selected');//선택 표시 클래스 추가
                selectedDateEl = dayEl;//현재 선택된 요소 저장
            }

            dayEl.addEventListener('click', () => {//날짜 클릭 시
                if (selectedDateEl) selectedDateEl.classList.remove('selected');//이전 날짜가 있으면 선택 표시 제거
                dayEl.classList.add('selected');//새로 클릭한 날짜에 선택 표시 추가
                selectedDateEl = dayEl;//선택된 요소 개인

                selectedDay = d;//선택한 일 저장
                selectedDateKey = dateKey;//선택한 날짜 문자열 저장

                if (startHour !== null && endHour !== null) {//시간이 이미 선택되어 있으면
                    const s = Math.min(startHour, endHour);//시작/끝 순서 상관없이 작은 값 시작
                    const e = Math.max(startHour, endHour);//큰 값이 끝
                    openDateBtn.textContent = `${selectedYear}년 ${selectedMonth + 1}월 ${selectedDay}일 ${s}:00 ~ ${e}:00`;
                    //상단 버튼에 날짜+시간 범위까지 표시
                } else {//시간 선택이 아직이면 날짜만 표시
                    openDateBtn.textContent = `${selectedYear}년 ${selectedMonth + 1}월 ${selectedDay}일`;
                }

                dateWarning.style.display = 'none';//경고 숨김
                dateWarning.textContent = '';//경고 문구 초기화

                filterRooms(selectedDateKey, startHour, endHour);//날짜 바뀌었으니 카드 필터링 다시 적용
            });
        }

        calendarEl.appendChild(dayEl);//만든 날짜 칸을 달력에 붙임
    }
}
createCalendar(selectedYear, selectedMonth);//처음 화면 로드시 현재 연/월 달력 생성

function resetTimeUI() {//시간 버튼 선택 표시를 모두 지움
    timeButtons.forEach(b => {//모든 시간 버튼 돌면서
        b.classList.remove("range-time");//범위 표시 제거
        b.classList.remove("selected-time");//시작/끝 표시 제거
    });
}

function paintRange(start, end) {//start~end 범위를 버튼에 표시 해줌
    const s = Math.min(start, end);//작은 값이 시작
    const e = Math.max(start, end);//큰 값이 끝

    timeButtons.forEach(btn => {//모든 시간 버튼 검사
        const h = parseInt(btn.textContent.split(':')[0], 10);//ex. 09:00 -> 9 (시간 숫자)추출
        if (h >= s && h <= e) btn.classList.add("range-time");//범위 안이면 range-time 클래스 추가
        if (h === start || h === end) btn.classList.add("selected-time");//시작/끝 시간 버튼이면 selected-time 추가
    });
}

function moveMonth(delta) {//delta가 -1이면 이전 달, +1이면 다음 달
    selectedMonth += delta;//월 이동

    if (selectedMonth < 0) { selectedMonth = 11; selectedYear -= 1; }//1월에서 이전 누르면 12월로
    if (selectedMonth > 11) { selectedMonth = 0; selectedYear += 1; }//12월에서 다음 누르면 1월로

    selectedDay = null;//월 바뀌면 일 선택 초기화
    selectedDateKey = null;//선택 날짜 키 초기화
    if (selectedDateEl) selectedDateEl.classList.remove("selected");//선택 표시 제거
    selectedDateEl = null;//선택 요소 초기화

    updateHeader();//헤더 업데이트
    createCalendar(selectedYear, selectedMonth);//새 월 달력 다시 생성

    openDateBtn.textContent = "날짜/시간 선택";//상단 버튼 텍스트 초기화

    startHour = null;//새 시작 시간 설정
    endHour = null;//끝 시간 다시 선택하도록 null로 초기화
    resetTimeUI();//UI 초기화
    filterRooms(null, null, null);//시작만 선택 표시
}
if(prevMonthBtn){
prevMonthBtn.addEventListener("click", (e) => {//이전 달 버튼 클릭
    
    console.log("작동1");
    e.preventDefault();//기본 동작(폼 제출 등) 막기
    console.log("작동2");
    e.stopPropagation();//이벤트 전파 막기(다른 클릭 이벤트 영향 방지)
    console.log("작동");
    moveMonth(-1);//이전달로 이동
});
}
if(nextMonthBtn){
nextMonthBtn.addEventListener("click", (e) => {//다음 달 버튼 클릭
    e.preventDefault();//기본 동작 막기
    e.stopPropagation();//이벤트 전파 막기
    moveMonth(1);//이전달로 이동
});
}


const ymModal = document.getElementById("ymModal");//연/월 선택 모달 전체
const yearSelect = document.getElementById("yearSelect");//연도 선택 select
const monthSelect = document.getElementById("monthSelect");//월 선택 select
const ymApply = document.getElementById("ymApply");//작용 버튼
const ymClose = document.getElementById("ymClose");//닫기 버튼

function fillYearMonthOptions() {//모달 열 때 select 옵션 채우는 함수
    yearSelect.innerHTML = "";//기존 옵션 제거
    monthSelect.innerHTML = "";//기존 옵션 제거

    for (let y = 2026; y <= 2026; y++) {//연도 옵션 생성
        const opt = document.createElement("option");//option 생성
        opt.value = String(y);//값 설정
        opt.textContent = `${y}년`;//화면에 보이는 글자
        yearSelect.appendChild(opt);//select 붙이기
    }

    for (let m = 1; m <= 12; m++) {//월 옵션 1~12 생성
        const opt = document.createElement("option");//option 생성
        opt.value = String(m - 1);//month 0~11이므로 m-1 저장
        opt.textContent = `${m}월`;//화면 표시
        monthSelect.appendChild(opt);//select에 붙이기
    }

    yearSelect.value = String(selectedYear);//현재 선택된 연도로 기본 선택값 맞춤
    monthSelect.value = String(selectedMonth);//현재 선택된 월로 기본 선택값 맞춤
}

currentMonthYear.addEventListener("click", () => {//YYYY년 M월 텍스트 클릭하면
    fillYearMonthOptions();//모달 옵션 채우기
    ymModal.style.display = "flex";//모달 보이기
});

if(ymApply){
ymApply.addEventListener("click", () => {//모달에서 적용 버튼 클릭
    selectedYear = parseInt(yearSelect.value, 10);//선택된 연도 반영
    selectedMonth = parseInt(monthSelect.value, 10);//선택된 월 반영(0~11)

    selectedDay = null;//일 선택 초기화
    selectedDateKey = null;//날짜 키 초기화
    if (selectedDateEl) selectedDateEl.classList.remove("selected");//선택 표시 제거
    selectedDateEl = null;//선택 요소 초기화

    openDateBtn.textContent = "날짜/시간 선택";//상단 텍스트 초기화

    updateHeader();//헤더 갱신
    createCalendar(selectedYear, selectedMonth);//새 달력 생성

    ymModal.style.display = "none";//모달 닫기

    startHour = null;//시간 선택 초기화
    endHour = null;//시간 선택 초기화
    resetTimeUI();//시간 UI 초기화
    filterRooms(null, null, null);//필터 초기화 상태로 카드 갱신
});
}
if(ymClose){
ymClose.addEventListener("click", () => {//모달 닫기 버튼 클릭
    ymModal.style.display = "none";//모달 숨기기
});
}
if(ymModal){
ymModal.addEventListener("click", (e) => {//모달 바깥(배경) 클릭 감지
    if (e.target === ymModal) ymModal.style.display = "none";//배경을 눌렀을 때만 닫기
});
}
timeButtons.forEach(btn => {//모든 시간 버튼에 클릭 이벤트 붙이기
    btn.addEventListener('click', () => {//시간 버튼 클릭 시 실행
        const hour = parseInt(btn.textContent.split(':')[0], 10);//버튼의 시간 숫자만 뽑기

        if (startHour === null) {//시작 시간이 아직 없으면(첫 클릭)
            startHour = hour;//시작 시간 저장
            endHour = null;//끝 시간 초기화
            resetTimeUI();//표시 초기화
            paintRange(startHour, startHour);//시작만 선택된 상태로 표시

            if (selectedDateKey) filterRooms(selectedDateKey, startHour, null);//날짜가 선택돼 있으면 시간 조건 반영해서 필터링
            return;//여기서 종료
        }

        if (endHour === null) {//시작은 있는데 끝이 없으면
            endHour = hour;//끝 시간 저장
            resetTimeUI();//표시 초기화
            paintRange(startHour, endHour);//시작~끝 범위 표시

            if (selectedDay !== null) {//날짜가 선택된 상태면
                const s = Math.min(startHour, endHour);//시작/끝 정렬
                const e = Math.max(startHour, endHour);//시작/끝 정렬
                openDateBtn.textContent = `${selectedYear}년 ${selectedMonth + 1}월 ${selectedDay}일 ${s}:00 ~ ${e}:00`;//상단 버튼에 날짜+시간 범위 표시
            }

            if (selectedDateKey) filterRooms(selectedDateKey, Math.min(startHour, endHour), Math.max(startHour, endHour));//날짜 선택돼 있으면 필터링 실행
            return;//여기서 종료
        }

        startHour = hour;//새 시작 시간 설정
        endHour = null;//끝 시간 다시 선택하도록 null 초기화
        resetTimeUI();//ui 초기화
        paintRange(startHour, startHour);//시작만 선택 표시

        if (selectedDateKey) filterRooms(selectedDateKey, startHour, null);//날짜 선택돼 있으면 새 시작시간 반영해서 필터링
    });
});

function resetAll() {//날짜/시간/인원/경고/필터 모두 초기화
    startHour = null;//시작 시간 초기화
    endHour = null;//끝시간 초기화
    selectedDay = null;//선택한 일 초기화
    selectedDateKey = null;//선택한 날짜 키 초기화

    openDateBtn.textContent = "날짜/시간 선택";//상단 날짜/시간 버튼 텍스트 초기화

    if (selectedDateEl) selectedDateEl.classList.remove("selected");//선택 표시 제거
    selectedDateEl = null;//선택 요소 초기화

    resetTimeUI();//시간 버튼 표시 초기화

    personCount.textContent = "1";//인원 1로 초기화
    updatePersonUI();//상단 인원 버튼 텍스트 초기화

    dateWarning.style.display = "none"; dateWarning.textContent = "";//날짜 경고 숨기고 문구 지우기
    if (timeWarning) { timeWarning.style.display = "none"; timeWarning.textContent = ""; }//시간 경고도 있으면 숨기고 지우기
    peopleWarningEl.style.display = "none"; peopleWarningEl.textContent = "";//인원 경고 숨기고 지우기

    createCalendar(selectedYear, selectedMonth);//현재 연/월 달력 다시 그리기

    filterRooms(null, null, null);//필터 조건 초기화 상태로 카드 다시 표시
}

resetBtn?.addEventListener("click", resetAll);
// 초기화 버튼이 있으면(resetBtn가 null이 아니면) 클릭 시 resetAll 실행
// ?. 는 resetBtn이 없을 때 에러 안 나게 하는 안전장치

openFBtn.addEventListener('click', () => {//카테고리 버튼 클릭하면
    categoryDropdown.style.display =
        //클릭 시: block, 한 번더 클릭 시: none
        categoryDropdown.style.display === 'block' ? 'none' : 'block';//현재 상태에 따라 토글
});
categoryItems.forEach(item => {//드롭다운 항목들 하나씩 이벤트 부여
    item.addEventListener('click', () => {//항목 클릭 시
        const type = item.dataset.type;//date-type 값을 읽음
        categoryDropdown.style.display = 'none';//드롭다운 닫기
        if (type === 'class') window.location.href = "reservation.html";
        if (type === 'lab') window.location.href = "reservation_lab.html";
    });
});

document.addEventListener('DOMContentLoaded', function () {//html이 다 로드된 뒤 실행
    const reserveBtns = document.querySelectorAll('.class-item .reserve-btn');//각 카드 안의 예약하기 버튼들 전부 가져옴

    reserveBtns.forEach(function (btn) {//버튼마다 클릭 이벤트 등록
        
        btn.addEventListener('click', function () {//예약하기 버튼 클릭시

            // 조건 통과 카드인지(인원/날짜/시간 필터에서 막혔으면 못하게)
            const classItem = btn.closest(".class-item");
            if (classItem && classItem.dataset.allowed === "0") {
                alert("현재 선택한 조건으로는 이 강의실 예약이 불가능해.");//경고창
                return;
            }

            if (!selectedDateKey) {//날짜 선택 안 한경우
                alert("날짜를 선택해주세요.");//경고
                return;
            }
            if (startHour === null || endHour === null) {//시간 범위를 아직 다 선택 안 했으면
                alert("시간을 선택해주세요.");//경고
                return;
            }

            const room = getRoomFromCard(classItem);//카드에서 방 번호 뽑기

            const s = Math.min(startHour, endHour);//시작 시간 정렬
            const e = Math.max(startHour, endHour);//끝 시간 정렬

            if (!canReserveRoom(room, selectedDateKey, s, e)) {//날짜/시간 기준으로 실제 예약 가능한지 최종 확인
                alert("해당 날짜/시간에는 이 강의실 예약이 불가능해.");//경고
                return;
            }

            const cap = getCapacityFromCard(classItem);//카드에서 수용 인원 추출
            const people = parseInt(personCount.textContent, 10);//현재 선택 인원
            if (cap > 0 && people > cap) {//수용 인원이 있고 선택 인원이 초과하면
                alert(`이 강의실 최대 수용 인원은 ${cap}명이야.`);//경고
                return;
            }

            const center = "클로버 교육센터";//고정

            const qs = new URLSearchParams({// payment.html로 넘길 쿼리스트링 만들기
                center: center,
                room: room,
                date: selectedDateKey,   // "YYYY-MM-DD"
                start: String(s),        // 시작시간 숫자
                end: String(e),          // 끝시간 숫자
                person: String(people)   // 인원
            }).toString();

            window.location.href = `payment.html?${qs}`;
        });
    });
});
updateHeader(); 
createCalendar(selectedYear, selectedMonth);
filterRooms(null, null, null);
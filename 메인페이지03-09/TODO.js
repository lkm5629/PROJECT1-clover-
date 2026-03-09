window.onload = function () {
  /*
    TODO 화면 전체 동작 파일
    - 일정DB / 캘린더 / 위클리 화면을 한 파일에서 같이 관리한다.
    - 아래 주석은 1번, 1-1번 식으로 순서를 붙여서 읽기 쉽게 정리했다.
  */
  /* =====================================================
     1) HTML 요소 연결
     - 화면 버튼 / 표 / 캘린더 / 위클리 / 모달을 한 번에 잡아둔다.
     - 여기 변수명은 "버튼인지 / 페이지인지 / 입력창인지" 바로 보이게 정리했다.
     ===================================================== */

  // 모바일 상단 메뉴
  const mobileMenuToggleButton = document.getElementById("mobileMenuBtn");
  const mobileMenuPanel = document.getElementById("mobileMenuPanel");

  // 좌측 페이지 이동 버튼
  const navDatabaseButton = document.getElementById("menuDb");
  const navCalendarButton = document.getElementById("menuCalendar");
  const navWeeklyButton = document.getElementById("menuWeekly");

  // 실제 페이지 영역
  const databasePageSection = document.getElementById("pageDb");
  const calendarPageSection = document.getElementById("pageCalendar");
  const weeklyPageSection = document.getElementById("pageWeekly");

  // 각 화면의 상단 수정 버튼
  const databaseEditButton = document.getElementById("dbEditBtn");
  const calendarEditButton = document.getElementById("calendarEditBtn");
  const weeklyEditButton = document.getElementById("weeklyEditBtn");

  // 일정DB 일괄 처리 메뉴
  const batchMenuButton = document.getElementById("selectedMenuBtn");
  const batchMenuPanel = document.getElementById("selectedMenuList");
  const batchSelectAllButton = document.getElementById("selectAllBtn");
  const batchDeleteSelectedButton =
    document.getElementById("deleteSelectedBtn");
  const batchUncheckButton = document.getElementById("uncheckSelectedBtn");
  const batchDeleteAllButton = document.getElementById("deleteAllBtn");

  // 일정DB 필터
  const categoryFilter = document.getElementById("categoryFilter");
  const dateFilter = document.getElementById("dateFilter");
  // 1-3-3. 일정 상태(완료 / 미완료 / 진행중)를 조회할 때 사용하는 select 요소
  const statusFilter = document.getElementById("statusFilter");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const resetFilterBtn = document.getElementById("resetFilterBtn");
  const selectedCountText = document.getElementById("selectedCountInfo");

  // 일정DB 표 / 페이지네이션
  const checkAllCheckbox = document.getElementById("checkAll");
  const databaseTableBody = document.getElementById("todoTableBody");
  const paginationInfoText = document.getElementById("pageInfoText");
  const previousPageButton = document.getElementById("prevPageBtn");
  const nextPageButton = document.getElementById("nextPageBtn");

  // 1-4. 캘린더 화면에서 쓰는 버튼 / 월 선택 요소
  const calendarPreviousButton = document.getElementById("calendarPrevBtn");
  const calendarMonthButton = document.getElementById("calendarOpenBtn");
  const calendarNextButton = document.getElementById("calendarNextBtn");
  const calendarMonthPicker = document.getElementById("monthPicker");
  const calendarGrid = document.getElementById("calendarGrid");

  // 1-5. 위클리 화면에서 쓰는 버튼 / 표 요소
  const weeklyPreviousButton = document.getElementById("weeklyPrevBtn");
  const weeklyPickerButton = document.getElementById("weeklyOpenBtn");
  const weeklyNextButton = document.getElementById("weeklyNextBtn");
  const weeklyDatePicker = document.getElementById("weekDatePicker");
  const weeklyHeadRow = document.getElementById("weeklyHeadRow");
  const weeklyBody = document.getElementById("weeklyBody");
  const weeklyBox = document.getElementById("weeklyBox");

  // 1-6. 우측 하단 플로팅 추가 버튼 요소
  const floatingAddButton = document.getElementById("fabBtn");
  const floatingAddMenu = document.getElementById("fabMenu");
  const openTodoModalButton = document.getElementById("openTodoModalBtn");

  // 1-7. 일정 추가 / 보기 / 수정 모달 요소
  const modalBackdrop = document.getElementById("modalOverlay");
  const todoModalPanel = document.getElementById("todoModal");
  const modalModeLabel = document.getElementById("modalModeText");
  const closeModalButton = document.getElementById("closeModalBtn");
  const cancelModalButton = document.getElementById("cancelModalBtn");
  const editTodoButton = document.getElementById("editTodoBtn");
  const saveTodoButton = document.getElementById("saveTodoBtn");
  const deleteTodoButton = document.getElementById("deleteTodoBtn");
  const categoryInput = document.getElementById("todoCategoryInput");
  const titleInput = document.getElementById("todoTitleInput");
  const dateInput = document.getElementById("todoDateInput");
  const statusInput = document.getElementById("todoStatusInput");
  const startTimeInput = document.getElementById("todoStartTimeInput");
  const endTimeInput = document.getElementById("todoEndTimeInput");
  const detailInput = document.getElementById("todoDetailInput");

  /* =====================================================
     2. 공통 설정값 / 현재 상태값
     2-1. localStorage key / 페이지 크기 / 공휴일 데이터
     2-2. 현재 선택된 일정 / 필터 / 달력 기준 날짜
     2-3. 드래그 / 리사이즈 중인지 저장하는 상태 객체
     ===================================================== */
  const TODO_STORAGE_KEY = "todo_3_events_v8";
  const DATABASE_PAGE_SIZE = 6;
  const HOLIDAY_LABELS = { "2026-03-01": "삼일절" };

  // 2-2-1. 실제 일정 데이터가 들어가는 배열
  let scheduleItems = [];

  // 2-2-2. 일정DB 화면에서 현재 페이지 / 선택 일정 / 필터 상태
  let currentDatabasePage = 1;
  let selectedScheduleId = null;
  // 2-2-2. 일정DB 화면에서 현재 페이지 / 선택 일정 / 조회 상태
  let currentFilter = {
    category: "all",
    date: "",
    status: "all",
  };

  // 2-2-3. 캘린더와 위클리가 어떤 날짜를 기준으로 그려질지 저장
  let calendarYear = new Date().getFullYear();
  let calendarMonthIndex = new Date().getMonth();
  let weeklyReferenceDate = new Date();

  // 2-2-4. 모달이 지금 추가인지, 보기인지, 수정인지 저장
  let modalContext = { mode: "add", id: null };

  // 2-3-1. 드래그 생성 / 이동 / 리사이즈 중간 상태값
  let suppressEventClick = false;
  let calendarDraggedEventId = null;
  let weeklyDraggedEventId = null;
  const weeklyCreateDragState = {
    active: false,
    date: "",
    startHour: -1,
    endHour: -1,
  };
  const weeklyResizeState = {
    active: false,
    eventId: null,
    startY: 0,
    baseEndHour: 0,
    element: null,
  };

  // 현재 화면이 모바일 폭인지 확인
  // 3-1-1. 현재 화면이 모바일 폭인지 확인한다.
  function isMobile() {
    return window.innerWidth <= 768;
  }

  /* =====================================================
     3. 공통 헬퍼 함수
     3-1. 날짜 / 시간 / 문자열 변환
     3-2. localStorage 저장 / 불러오기
     3-3. 선택 개수 / 필터 / 충돌 검사
     ===================================================== */

  // 숫자를 두 자리 문자열로 맞춘다. 예: 3 -> 03
  // 3-1-2. 숫자를 두 자리 문자열로 만든다. 예: 3 -> 03
  function addZero(n) {
    return n < 10 ? "0" + n : String(n);
  }
  // 3-1-3. Date 객체를 YYYY-MM-DD 문자열로 바꾼다.
  function dateToString(d) {
    return (
      d.getFullYear() +
      "-" +
      addZero(d.getMonth() + 1) +
      "-" +
      addZero(d.getDate())
    );
  }
  // 3-1-4. YYYY-MM-DD 문자열을 Date 객체로 바꾼다.
  function stringToDate(s) {
    const a = s.split("-");
    return new Date(Number(a[0]), Number(a[1]) - 1, Number(a[2]));
  }
  // 3-1-5. HH:MM 문자열을 분(minute) 숫자로 바꾼다.
  function timeToMinutes(t) {
    const a = String(t).split(":");
    return Number(a[0]) * 60 + Number(a[1]);
  }
  // 3-1-6. 글자가 너무 길면 말줄임용으로 잘라 준다.
  function cutText(v, m) {
    const s = v || "";
    return s.length > m ? s.substring(0, m) + ".." : s;
  }
  // 3-1-7. 상태값(todo/progress/done)을 한글 이름으로 바꾼다.
  function getStatusLabel(s) {
    if (s === "progress") return "진행중";
    if (s === "done") return "완료";
    return "미완료";
  }
  // 3-1-8. 모바일처럼 좁은 화면에서 쓸 짧은 상태명으로 바꾼다.
  function getShortStatusLabel(s) {
    if (s === "progress") return "진";
    if (s === "done") return "완";
    return "미";
  }
  // 3-1-9. id로 일정 1개를 찾아서 돌려준다.
  function getEventById(id) {
    return scheduleItems.find((e) => String(e.id) === String(id)) || null;
  }

  // 날짜 + 시작시간 기준으로 일정 배열을 정렬한다.
  // 3-2-1. 날짜 + 시작 시간 기준으로 전체 일정 배열을 정렬한다.
  function sortEvents() {
    scheduleItems.sort((a, b) => {
      const ak = a.date + " " + a.startTime;
      const bk = b.date + " " + b.startTime;
      return ak < bk ? -1 : ak > bk ? 1 : 0;
    });
  }

  // 현재 일정 배열을 브라우저 localStorage에 저장한다.
  // 3-2-2. 현재 일정 배열을 localStorage에 저장한다.
  function saveStorage() {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(scheduleItems));
  }

  // 처음 실행할 때 보여줄 기본 샘플 일정 데이터
  // 3-2-3. 처음 실행할 때 사용할 샘플 일정을 만든다.
  function createSampleEvents() {
    return [
      {
        id: 1,
        category: "회의",
        title: "주간 회의",
        date: "2026-03-04",
        startTime: "09:00",
        endTime: "10:00",
        status: "todo",
        detail: "주간 일정 공유",
        checked: false,
      },
      {
        id: 2,
        category: "업무",
        title: "기획서 작성",
        date: "2026-03-04",
        startTime: "11:00",
        endTime: "12:00",
        status: "progress",
        detail: "초안 작성",
        checked: false,
      },
      {
        id: 3,
        category: "개인",
        title: "운동",
        date: "2026-03-05",
        startTime: "18:00",
        endTime: "19:00",
        status: "done",
        checked: false,
        detail: "헬스장",
      },
      {
        id: 4,
        category: "업무",
        title: "화면 점검",
        date: "2026-03-06",
        startTime: "14:00",
        endTime: "15:00",
        status: "todo",
        checked: false,
        detail: "UI 체크",
      },
      {
        id: 5,
        category: "회의",
        title: "팀 미팅",
        date: "2026-03-07",
        startTime: "13:00",
        endTime: "14:00",
        status: "progress",
        checked: false,
        detail: "이슈 정리",
      },
      {
        id: 6,
        category: "개인",
        title: "스터디",
        date: "2026-03-08",
        startTime: "10:00",
        endTime: "12:00",
        status: "todo",
        checked: false,
        detail: "JS 정리",
      },
      {
        id: 7,
        category: "업무",
        title: "회고 작성",
        date: "2026-03-09",
        startTime: "15:00",
        endTime: "16:00",
        status: "done",
        checked: false,
        detail: "문서화",
      },
      {
        id: 8,
        category: "회의",
        title: "외주 협의",
        date: "2026-03-10",
        startTime: "10:00",
        endTime: "11:00",
        status: "todo",
        checked: false,
        detail: "일정 확인",
      },
      {
        id: 9,
        category: "개인",
        title: "병원 예약",
        date: "2026-03-10",
        startTime: "17:00",
        endTime: "18:00",
        status: "todo",
        checked: false,
        detail: "검진",
      },
      {
        id: 10,
        category: "업무",
        title: "배포 확인",
        date: "2026-03-11",
        startTime: "09:00",
        endTime: "10:00",
        status: "progress",
        checked: false,
        detail: "오류 체크",
      },
      {
        id: 11,
        category: "회의",
        title: "주간 발표",
        date: "2026-03-12",
        startTime: "16:00",
        endTime: "17:00",
        status: "todo",
        checked: false,
        detail: "자료 공유",
      },
      {
        id: 12,
        category: "개인",
        title: "독서",
        date: "2026-03-13",
        startTime: "20:00",
        endTime: "21:00",
        status: "done",
        checked: false,
        detail: "1시간",
      },
    ];
  }

  // 저장된 일정이 있으면 불러오고, 없으면 샘플 데이터를 넣는다.
  // 3-2-4. 저장된 일정이 있으면 불러오고 없으면 샘플 데이터를 넣는다.
  function loadStorage() {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    if (!saved) {
      scheduleItems = createSampleEvents();
      saveStorage();
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      scheduleItems = Array.isArray(parsed) ? parsed : createSampleEvents();
    } catch {
      scheduleItems = createSampleEvents();
    }
  }

  // 시작 시간 / 종료 시간 select 박스에 00:00 ~ 23:00 옵션을 채운다.
  // 3-2-5. 시간 select 박스에 00:00 ~ 23:00 옵션을 채운다.
  function fillHourSelect(sel) {
    sel.innerHTML = "";
    for (let i = 0; i < 24; i++) {
      const opt = document.createElement("option");
      opt.value = addZero(i) + ":00";
      opt.innerText = addZero(i) + ":00";
      sel.appendChild(opt);
    }
  }

  // 3-2-6. 구분(회의/업무/개인)에 따라 점 색상 클래스를 돌려준다.
  function getDotClass(category) {
    if (category === "회의") return "meeting";
    if (category === "업무") return "work";
    return "personal";
  }

  // 3-3-1. 체크된 일정만 따로 모아서 돌려준다.
  function getCheckedEvents() {
    return scheduleItems.filter((e) => !!e.checked);
  }

  // 일정DB에서 체크된 개수 안내 문구를 갱신한다.
  // 3-3-2. 선택된 일정 개수를 화면에 다시 표시한다.
  function updateSelectedCountInfo() {
    const checkedCount = getCheckedEvents().length;

    if (checkedCount === 0) {
      selectedCountText.classList.add("hide");
      selectedCountText.innerText = "";
      return;
    }

    selectedCountText.classList.remove("hide");
    selectedCountText.innerText = checkedCount + "개 선택";
  }

  // 현재 선택된 필터 조건에 맞는 일정만 다시 뽑아낸다.
  // 3-3-3. 현재 필터 조건에 맞는 일정만 다시 뽑는다.
  function getFilteredEvents() {
    let list = scheduleItems.slice();
    if (currentFilter.category !== "all")
      list = list.filter((e) => e.category === currentFilter.category);
    if (currentFilter.date !== "")
      list = list.filter((e) => e.date === currentFilter.date);

    // 3-3-4. 상태 조회값이 전체가 아니면 해당 상태만 남긴다.
    if (currentFilter.status !== "all")
      list = list.filter((e) => e.status === currentFilter.status);

    return list;
  }

  // 3-3-4. 삭제 후 페이지가 비면 첫 페이지로 되돌린다.
  function ensureValidPage(list) {
    const total = Math.max(1, Math.ceil(list.length / DATABASE_PAGE_SIZE));
    if (currentDatabasePage > total) currentDatabasePage = 1;
  }

  // 3-3-5. 입력된 날짜가 실제로 존재하는 날짜인지 검사한다.
  function isValidDateInput(dateText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
    if (dateText < "2000-01-01" || dateText > "2099-12-31") return false;
    const dateObj = stringToDate(dateText);
    return dateToString(dateObj) === dateText;
  }

  // 같은 날짜에 시간대가 겹치는 일정이 있는지 검사한다.
  // 3-3-6. 같은 날짜와 시간대에 겹치는 일정이 있는지 검사한다.
  function hasConflict(dateValue, startValue, endValue, ignoreId) {
    const s = timeToMinutes(startValue);
    const e = timeToMinutes(endValue);

    for (const cur of scheduleItems) {
      if (cur.date !== dateValue) continue;
      if (String(cur.id) === String(ignoreId)) continue;

      const cs = timeToMinutes(cur.startTime);
      const ce = timeToMinutes(cur.endTime);

      if (s < ce && e > cs) return true;
    }
    return false;
  }

  // 3-3-7. 일정 1개만 선택 상태로 바꾼다.
  function selectSingle(eventId) {
    selectedScheduleId = eventId;
    for (const e of scheduleItems) e.checked = String(e.id) === String(eventId);
    saveStorage();
  }

  // 수정 버튼을 눌렀을 때 실제로 수정할 일정 1개를 찾아준다.
  // 3-3-8. 수정 버튼을 눌렀을 때 실제 수정할 일정 1개를 찾는다.
  function getEditTarget() {
    const checkedItems = getCheckedEvents();

    if (checkedItems.length > 1) {
      alert("수정할 일정 하나만 선택해주세요.");
      return null;
    }

    if (checkedItems.length === 1) {
      selectedScheduleId = checkedItems[0].id;
      return checkedItems[0];
    }

    if (selectedScheduleId != null) {
      const sel = getEventById(selectedScheduleId);
      if (sel) return sel;
    }

    alert("수정할 일정 하나만 선택해주세요.");
    return null;
  }

  /* =====================================================
     4. 화면 전환 / 모달 제어
     4-1. 좌측 메뉴를 눌렀을 때 화면 바꾸기
     4-2. 모달 보기 모드 / 수정 모드 제어
     ===================================================== */

  // 좌측 메뉴 클릭에 따라 일정DB / 캘린더 / 위클리 화면을 전환한다.
  // 4-1-1. 좌측 메뉴에서 선택한 화면만 active 처리한다.
  function showPage(name) {
    navDatabaseButton.classList.remove("active");
    navCalendarButton.classList.remove("active");
    navWeeklyButton.classList.remove("active");
    databasePageSection.classList.remove("active");
    calendarPageSection.classList.remove("active");
    weeklyPageSection.classList.remove("active");

    if (name === "db") {
      navDatabaseButton.classList.add("active");
      databasePageSection.classList.add("active");
    }
    if (name === "calendar") {
      navCalendarButton.classList.add("active");
      calendarPageSection.classList.add("active");
    }
    if (name === "weekly") {
      navWeeklyButton.classList.add("active");
      weeklyPageSection.classList.add("active");
    }
  }

  // 보기 모드일 때 입력창을 클릭하지 못하게 잠근다.
  // 4-2-1. 보기 모드에서는 입력창을 잠그고 수정 모드에서는 다시 푼다.
  function setModalPointerLocked(locked) {
    const controls = [
      categoryInput,
      titleInput,
      dateInput,
      statusInput,
      startTimeInput,
      endTimeInput,
      detailInput,
    ];

    controls.forEach((el) => {
      if (locked) {
        el.setAttribute("tabindex", "-1");
        el.style.pointerEvents = "none";
      } else {
        el.removeAttribute("tabindex");
        el.style.pointerEvents = "auto";
      }
    });
  }

  // 4-2-2. 모달을 상세 보기 스타일로 바꾼다.
  function setModalViewStyle() {
    todoModalPanel.classList.remove("modal-edit-mode");
    todoModalPanel.classList.add("modal-view-mode");
    setModalPointerLocked(true);
    saveTodoButton.classList.add("hide");
  }

  // 4-2-3. 모달을 수정 가능한 스타일로 바꾼다.
  function setModalEditStyle() {
    todoModalPanel.classList.remove("modal-view-mode");
    todoModalPanel.classList.add("modal-edit-mode");
    setModalPointerLocked(false);
    saveTodoButton.classList.remove("hide");
  }

  // 4-2-4. 모달과 배경을 화면에 보여준다.
  function openModal() {
    modalBackdrop.classList.remove("hide");
    todoModalPanel.classList.remove("hide");
    todoModalPanel.setAttribute("aria-hidden", "false");
  }

  // 4-2-5. 모달과 배경을 닫는다.
  function closeModal() {
    modalBackdrop.classList.add("hide");
    todoModalPanel.classList.add("hide");
    todoModalPanel.setAttribute("aria-hidden", "true");
  }

  // 4-2-6. 모달 입력칸을 기본값으로 초기화한다.
  function resetModalInputs() {
    categoryInput.value = "회의";
    titleInput.value = "";
    dateInput.value = dateToString(new Date());
    statusInput.value = "todo";
    startTimeInput.value = "09:00";
    endTimeInput.value = "10:00";
    detailInput.value = "";
  }

  // 일정 추가 모드로 모달을 연다.
  // 4-2-7. 일정 추가용 모달을 연다. 필요하면 기본 날짜와 시간을 넣는다.
  function openModalForAdd(defaults) {
    modalContext.mode = "add";
    modalContext.id = null;
    modalModeLabel.innerText = "할 일 추가";

    setModalEditStyle();
    editTodoButton.classList.add("hide");
    deleteTodoButton.classList.add("hide");

    resetModalInputs();

    if (defaults) {
      if (defaults.date) dateInput.value = defaults.date;
      if (defaults.startTime) startTimeInput.value = defaults.startTime;
      if (defaults.endTime) endTimeInput.value = defaults.endTime;
    }

    openModal();
  }

  // 일정 상세 보기 모드로 모달을 연다.
  // 4-2-8. 선택한 일정 내용을 읽어서 상세 보기 모달을 연다.
  function openModalForView(item) {
    modalContext.mode = "view";
    modalContext.id = item.id;
    modalModeLabel.innerText = "상세 보기";

    categoryInput.value = item.category;
    titleInput.value = item.title;
    dateInput.value = item.date;
    statusInput.value = item.status;
    startTimeInput.value = item.startTime;
    endTimeInput.value = item.endTime;
    detailInput.value = item.detail;

    setModalViewStyle();
    editTodoButton.classList.remove("hide");
    deleteTodoButton.classList.remove("hide");

    openModal();
  }

  // 4-2-9. 상세 보기 상태의 모달을 수정 상태로 바꾼다.
  function switchToEditMode() {
    if (modalContext.mode !== "view") return;
    modalContext.mode = "edit";
    modalModeLabel.innerText = "할 일 수정";
    setModalEditStyle();
    editTodoButton.classList.remove("hide");
    deleteTodoButton.classList.remove("hide");
  }

  /* =====================================================
     5. 일정DB 렌더링
     5-1. 표 데이터 다시 그리기
     5-2. 체크 / 삭제 / 페이지 이동 반영
     ===================================================== */

  // 표 형태의 일정DB를 다시 그린다.
  // 5-1-1. 일정DB 표를 처음부터 다시 그린다.
  function renderDb() {
    sortEvents();
    updateSelectedCountInfo();

    const filtered = getFilteredEvents();
    ensureValidPage(filtered);

    const totalPage = Math.max(
      1,
      Math.ceil(filtered.length / DATABASE_PAGE_SIZE),
    );
    const startIndex = (currentDatabasePage - 1) * DATABASE_PAGE_SIZE;
    const pageItems = filtered.slice(
      startIndex,
      startIndex + DATABASE_PAGE_SIZE,
    );

    paginationInfoText.innerText =
      currentDatabasePage + " / " + totalPage + " 페이지";
    databaseTableBody.innerHTML = "";

    if (pageItems.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 8;
      td.innerText = "표시할 일정이 없어.";
      tr.appendChild(td);
      databaseTableBody.appendChild(tr);
      checkAllCheckbox.checked = false;
      updateSelectedCountInfo();
      return;
    }

    for (const item of pageItems) {
      const tr = document.createElement("tr");
      if (item.checked) tr.classList.add("checked-row");

      tr.addEventListener("click", function (evt) {
        const tag = evt.target.tagName.toLowerCase();
        if (tag === "input" || tag === "button") return;

        selectSingle(item.id);
        openModalForView(item);
      });

      const tdCheck = document.createElement("td");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!item.checked;
      cb.addEventListener("change", function () {
        item.checked = cb.checked;
        if (item.checked) selectedScheduleId = item.id;
        else if (String(selectedScheduleId) === String(item.id))
          selectedScheduleId = null;
        saveStorage();
        renderAll();
      });
      tdCheck.appendChild(cb);

      const tdCategory = document.createElement("td");
      tdCategory.innerHTML = `<span class="category-badge"><span class="dot ${getDotClass(item.category)}">●</span>${item.category}</span>`;

      const tdTitle = document.createElement("td");
      tdTitle.className = "text-left";
      tdTitle.innerHTML = `<span class="cell-ellipsis" title="${item.title.replace(/"/g, "&quot;")}">${item.title}</span>`;

      const tdDate = document.createElement("td");
      tdDate.innerText = item.date;

      const tdTime = document.createElement("td");
      tdTime.innerText = item.startTime + " ~ " + item.endTime;

      const tdStatus = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "status-badge";
      if (item.status === "progress") badge.classList.add("progress");
      if (item.status === "done") badge.classList.add("done");
      badge.innerText = getStatusLabel(item.status);
      tdStatus.appendChild(badge);

      const tdDetail = document.createElement("td");
      tdDetail.className = "text-left";
      tdDetail.innerHTML = `<span class="cell-ellipsis" title="${(item.detail || "").replace(/"/g, "&quot;")}">${item.detail || ""}</span>`;

      const tdDelete = document.createElement("td");
      const del = document.createElement("button");
      del.type = "button";
      del.className = "delete-btn";
      del.innerText = "삭제";
      del.addEventListener("click", function () {
        scheduleItems = scheduleItems.filter(
          (e) => String(e.id) !== String(item.id),
        );
        if (String(selectedScheduleId) === String(item.id))
          selectedScheduleId = null;
        saveStorage();
        renderAll();
      });
      tdDelete.appendChild(del);

      tr.appendChild(tdCheck);
      tr.appendChild(tdCategory);
      tr.appendChild(tdTitle);
      tr.appendChild(tdDate);
      tr.appendChild(tdTime);
      tr.appendChild(tdStatus);
      tr.appendChild(tdDetail);
      tr.appendChild(tdDelete);

      databaseTableBody.appendChild(tr);
    }

    checkAllCheckbox.checked =
      pageItems.length > 0 && pageItems.every((x) => !!x.checked);
  }

  /* =====================================================
     6) 월간 캘린더 렌더링
     ===================================================== */

  // 현재 월 기준으로 캘린더 화면을 다시 그린다.
  // 6-1-1. 현재 연/월 기준으로 캘린더 칸과 일정 카드를 다시 그린다.
  function renderCalendar() {
    calendarMonthButton.innerText = calendarMonthIndex + 1 + "월";
    calendarGrid.innerHTML = "";

    const firstDay = new Date(calendarYear, calendarMonthIndex, 1);
    const lastDate = new Date(
      calendarYear,
      calendarMonthIndex + 1,
      0,
    ).getDate();
    const startDay = firstDay.getDay();

    let totalCell = startDay + lastDate;
    if (totalCell % 7 !== 0) totalCell += 7 - (totalCell % 7);

    let dayNumber = 1;

    // 달력 칸 수(5주 또는 6주)에 맞게 셀을 만든다.
    for (let i = 0; i < totalCell; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";

      if (i < startDay || dayNumber > lastDate) {
        cell.classList.add("empty");
        calendarGrid.appendChild(cell);
        continue;
      }

      const dateString =
        calendarYear +
        "-" +
        addZero(calendarMonthIndex + 1) +
        "-" +
        addZero(dayNumber);
      const dow = new Date(
        calendarYear,
        calendarMonthIndex,
        dayNumber,
      ).getDay();

      const top = document.createElement("div");
      top.className = "calendar-cell-top";

      const num = document.createElement("div");
      num.className = "calendar-day-number";
      num.innerText = dayNumber;
      if (dow === 0) num.classList.add("sun");
      if (dow === 6) num.classList.add("sat");
      if (HOLIDAY_LABELS[dateString]) num.classList.add("holiday");
      top.appendChild(num);

      if (HOLIDAY_LABELS[dateString]) {
        const holiday = document.createElement("div");
        holiday.className = "holiday-label";
        holiday.innerText = HOLIDAY_LABELS[dateString];
        top.appendChild(holiday);
      }

      cell.appendChild(top);

      const dayEvents = scheduleItems
        .filter((e) => e.date === dateString)
        .sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
        );

      if (dayEvents.some((e) => String(e.id) === String(selectedScheduleId))) {
        cell.classList.add("selected");
      }

      for (const e of dayEvents) {
        // 하루 안에 들어갈 일정 칩 하나를 만든다.
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "calendar-event-chip";
        chip.draggable = true;
        chip.title = `${e.title}\n${e.detail || ""}`;

        if (e.status === "progress") chip.classList.add("progress");
        if (e.status === "done") chip.classList.add("done");
        if (String(e.id) === String(selectedScheduleId))
          chip.classList.add("selected");

        const st = isMobile()
          ? getShortStatusLabel(e.status)
          : getStatusLabel(e.status);
        const title = cutText(e.title, isMobile() ? 8 : 12);

        chip.innerHTML =
          `<span class="calendar-status">[${st}]</span>` +
          `<span class="calendar-title">${title}</span>`;

        chip.addEventListener("click", function (evt) {
          evt.stopPropagation();
          selectSingle(e.id);
          openModalForView(e);
        });

        chip.addEventListener("dragstart", function () {
          calendarDraggedEventId = e.id;
        });
        chip.addEventListener("dragend", function () {
          calendarDraggedEventId = null;
        });

        cell.appendChild(chip);
      }

      cell.addEventListener("dragover", function (evt) {
        evt.preventDefault();
      });

      cell.addEventListener("drop", function (evt) {
        evt.preventDefault();
        if (!calendarDraggedEventId) return;

        const target = getEventById(calendarDraggedEventId);
        if (!target) return;

        if (
          hasConflict(dateString, target.startTime, target.endTime, target.id)
        )
          return;

        target.date = dateString;
        selectSingle(target.id);
        saveStorage();
        renderAll();
      });

      cell.addEventListener("click", function (evt) {
        if (
          evt.target !== cell &&
          !evt.target.classList.contains("calendar-day-number") &&
          !evt.target.classList.contains("holiday-label")
        )
          return;
        openModalForAdd({
          date: dateString,
          startTime: "09:00",
          endTime: "10:00",
        });
      });

      calendarGrid.appendChild(cell);
      dayNumber++;
    }
  }

  /* =====================================================
     7) 위클리 날짜 계산 / 드래그 생성
     ===================================================== */

  // 전달된 날짜가 속한 주의 일요일을 구한다.
  // 7-1-1. 전달받은 날짜가 포함된 주의 시작일(일요일)을 구한다.
  function getWeekStart(dateObj) {
    const copy = new Date(dateObj);
    const day = copy.getDay();
    copy.setDate(copy.getDate() - day);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  // 7-1-2. 주간 화면에 보여줄 7일 날짜 목록을 만든다.
  function getWeekDates(dateObj) {
    const start = getWeekStart(dateObj);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  // 7-1-3. 위클리 상단 요일 헤더를 다시 만든다.
  function renderWeeklyHead() {
    weeklyHeadRow.innerHTML = "";
    const headTime = document.createElement("th");
    headTime.className = "time-col";
    headTime.innerText = "시간";
    weeklyHeadRow.appendChild(headTime);

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDates = getWeekDates(weeklyReferenceDate);

    for (let i = 0; i < 7; i++) {
      const th = document.createElement("th");
      if (i === 0) th.classList.add("sun-text");
      if (i === 6) th.classList.add("sat-text");
      th.innerHTML =
        '<span class="weekly-head-main">' +
        dayNames[i] +
        "</span>" +
        '<span class="weekly-head-sub">' +
        (weekDates[i].getMonth() + 1) +
        "/" +
        weekDates[i].getDate() +
        "</span>";
      weeklyHeadRow.appendChild(th);
    }
  }

  // 7-2-1. 드래그 중 강조 표시된 칸 배경을 모두 지운다.
  function clearWeeklyHover() {
    weeklyBody
      .querySelectorAll(".weekly-slot")
      .forEach((s) => s.classList.remove("drag-hover"));
  }

  // 7-2-2. 드래그로 선택 중인 시간 범위를 노란색으로 칠한다.
  function paintWeeklyHover() {
    clearWeeklyHover();
    if (!weeklyCreateDragState.active) return;

    const minH = Math.min(
      weeklyCreateDragState.startHour,
      weeklyCreateDragState.endHour,
    );
    const maxH = Math.max(
      weeklyCreateDragState.startHour,
      weeklyCreateDragState.endHour,
    );

    weeklyBody
      .querySelectorAll(
        `.weekly-slot[data-date="${weeklyCreateDragState.date}"]`,
      )
      .forEach((slot) => {
        const h = Number(slot.dataset.hour);
        if (h >= minH && h <= maxH) slot.classList.add("drag-hover");
      });
  }

  // 7-2-3. 빈 칸 드래그를 시작할 때 시작 날짜와 시간을 저장한다.
  function startWeeklyDrag(dateValue, hourValue) {
    weeklyCreateDragState.active = true;
    weeklyCreateDragState.date = dateValue;
    weeklyCreateDragState.startHour = hourValue;
    weeklyCreateDragState.endHour = hourValue;
    paintWeeklyHover();
  }

  // 7-2-4. 드래그 중인 끝 시간을 계속 갱신한다.
  function updateWeeklyDrag(dateValue, hourValue) {
    if (!weeklyCreateDragState.active) return;
    if (weeklyCreateDragState.date !== dateValue) return;
    weeklyCreateDragState.endHour = hourValue;
    paintWeeklyHover();
  }

  // 7-2-5. 드래그가 끝나면 새 일정 추가 모달을 연다.
  function finishWeeklyDrag() {
    if (!weeklyCreateDragState.active) return;

    const minH = Math.min(
      weeklyCreateDragState.startHour,
      weeklyCreateDragState.endHour,
    );
    const maxH = Math.max(
      weeklyCreateDragState.startHour,
      weeklyCreateDragState.endHour,
    );

    const dateValue = weeklyCreateDragState.date;
    const startTime = addZero(minH) + ":00";
    const endTime = addZero(Math.min(23, maxH + 1)) + ":00";

    weeklyCreateDragState.active = false;
    weeklyCreateDragState.date = "";
    weeklyCreateDragState.startHour = -1;
    weeklyCreateDragState.endHour = -1;
    clearWeeklyHover();

    openModalForAdd({ date: dateValue, startTime, endTime });
  }

  /* =====================================================
     8) 위클리 일정 리사이즈
     ===================================================== */

  // 위클리 하단 핸들을 잡고 늘릴 때 시작 상태를 저장한다.
  // 7-3-1. 일정 블록 아래 손잡이로 높이 조절을 시작한다.
  function startResize(eventId, baseEndHour, startY, element) {
    weeklyResizeState.active = true;
    weeklyResizeState.eventId = eventId;
    weeklyResizeState.baseEndHour = baseEndHour;
    weeklyResizeState.startY = startY;
    weeklyResizeState.element = element;
    if (weeklyResizeState.element) weeklyResizeState.element.draggable = false;
    weeklyDraggedEventId = null;
  }

  // 7-3-2. 높이 조절이 끝났을 때 최종 시간을 저장한다.
  function finishResize() {
    if (!weeklyResizeState.active) return;
    weeklyResizeState.active = false;
    if (weeklyResizeState.element) weeklyResizeState.element.draggable = true;
    weeklyResizeState.element = null;
    weeklyResizeState.eventId = null;
    weeklyResizeState.baseEndHour = 0;
    weeklyResizeState.startY = 0;
    saveStorage();
    renderAll();
  }

  weeklyBox.addEventListener("mousemove", function (evt) {
    const rect = weeklyBox.getBoundingClientRect();
    const edge = 50;
    if (weeklyCreateDragState.active || weeklyResizeState.active) {
      if (evt.clientY > rect.bottom - edge) weeklyBox.scrollTop += 18;
      else if (evt.clientY < rect.top + edge) weeklyBox.scrollTop -= 18;
    }
  });

  document.addEventListener("mousemove", function (evt) {
    if (!weeklyResizeState.active) return;

    const ev = getEventById(weeklyResizeState.eventId);
    if (!ev) return;

    const delta = evt.clientY - weeklyResizeState.startY;
    const addHours = Math.round(delta / 66);

    const startHour = Number(ev.startTime.split(":")[0]);
    let newEndHour = weeklyResizeState.baseEndHour + addHours;

    newEndHour = Math.max(startHour + 1, newEndHour);
    newEndHour = Math.min(24, newEndHour);

    const newEndTime = addZero(newEndHour) + ":00";
    if (hasConflict(ev.date, ev.startTime, newEndTime, ev.id)) return;

    ev.endTime = newEndTime;
    renderWeekly();
  });

  document.addEventListener("mouseup", function () {
    if (weeklyCreateDragState.active) finishWeeklyDrag();
    if (weeklyResizeState.active) finishResize();
  });

  /* =====================================================
     9) 위클리 렌더링
     ===================================================== */

  // 현재 주차 기준으로 위클리 화면을 다시 그린다.
  // 7-3-3. 위클리 표와 일정 블록을 현재 주 기준으로 다시 그린다.
  function renderWeekly() {
    weeklyPickerButton.innerText = "주간";
    renderWeeklyHead();
    weeklyBody.innerHTML = "";

    const weekDates = getWeekDates(weeklyReferenceDate);

    for (let hour = 0; hour < 24; hour++) {
      const tr = document.createElement("tr");

      const timeTd = document.createElement("td");
      timeTd.className = "time-cell";
      timeTd.innerText = addZero(hour) + ":00";
      tr.appendChild(timeTd);

      // 일 ~ 토 각 칸을 만들고, 해당 시간대 일정 블록을 배치한다.
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const td = document.createElement("td");
        td.className = "weekly-slot";

        const dateString = dateToString(weekDates[dayIndex]);
        td.dataset.date = dateString;
        td.dataset.hour = String(hour);

        td.addEventListener("mousedown", function (evt) {
          if (evt.target !== td) return;
          if (weeklyResizeState.active) return;
          startWeeklyDrag(dateString, hour);
        });

        td.addEventListener("mouseenter", function () {
          updateWeeklyDrag(dateString, hour);
        });
        td.addEventListener("dragover", function (evt) {
          evt.preventDefault();
        });

        td.addEventListener("drop", function (evt) {
          evt.preventDefault();
          if (!weeklyDraggedEventId || weeklyResizeState.active) return;

          const ev = getEventById(weeklyDraggedEventId);
          if (!ev) return;

          const durationMin =
            timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime);
          const newStart = addZero(hour) + ":00";
          const newEndMin = timeToMinutes(newStart) + durationMin;

          if (newEndMin > 24 * 60) return;

          const newEnd = addZero(Math.floor(newEndMin / 60)) + ":00";
          if (hasConflict(dateString, newStart, newEnd, ev.id)) return;

          ev.date = dateString;
          ev.startTime = newStart;
          ev.endTime = newEnd;

          selectSingle(ev.id);
          saveStorage();
          suppressEventClick = true;
          setTimeout(() => {
            suppressEventClick = false;
          }, 50);
          renderAll();
        });

        const dayEvents = scheduleItems
          .filter((e) => e.date === dateString)
          .sort(
            (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
          );

        for (const item of dayEvents) {
          const startHour = Number(item.startTime.split(":")[0]);
          if (startHour !== hour) continue;

          const eventDiv = document.createElement("div");
          eventDiv.className = "weekly-event";
          eventDiv.draggable = true;
          eventDiv.title = `${item.title}\n${item.detail || ""}`;

          if (item.status === "progress") eventDiv.classList.add("progress");
          if (item.status === "done") eventDiv.classList.add("done");
          if (String(item.id) === String(selectedScheduleId))
            eventDiv.classList.add("selected");

          const duration = Math.max(
            1,
            Math.ceil(
              (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) /
              60,
            ),
          );
          eventDiv.style.height = duration * 66 - 8 + "px";

          const st = isMobile()
            ? getShortStatusLabel(item.status)
            : getStatusLabel(item.status);
          const title = cutText(item.title, isMobile() ? 8 : 18);

          eventDiv.innerHTML = `<div class="weekly-event-status">[${st}]</div>
             <div class="weekly-event-title">${title}</div>
             <div class="weekly-event-time">${item.startTime} ~ ${item.endTime}</div>`;

          eventDiv.addEventListener("click", function (evt) {
            evt.stopPropagation();
            if (suppressEventClick || weeklyResizeState.active) return;
            selectSingle(item.id);
            openModalForView(item);
          });

          eventDiv.addEventListener("dragstart", function (evt) {
            if (weeklyResizeState.active) {
              evt.preventDefault();
              return;
            }
            weeklyDraggedEventId = item.id;
          });

          eventDiv.addEventListener("dragend", function () {
            weeklyDraggedEventId = null;
          });

          const handle = document.createElement("div");
          handle.className = "resize-handle";

          handle.addEventListener("mousedown", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            selectSingle(item.id);
            const baseEndHour = Number(item.endTime.split(":")[0]);
            startResize(item.id, baseEndHour, evt.clientY, eventDiv);
          });

          handle.addEventListener("dragstart", function (evt) {
            evt.preventDefault();
          });

          eventDiv.appendChild(handle);
          td.appendChild(eventDiv);
        }

        tr.appendChild(td);
      }

      weeklyBody.appendChild(tr);
    }
  }

  /* =====================================================
     10) 이벤트 연결
     ===================================================== */

  // mobileMenuToggleButton.addEventListener("click", function () {
  //   mobileMenuPanel.classList.toggle("open");
  // });

  // 8-1-1. 좌측 메뉴 클릭 시 화면 전환
  navDatabaseButton.addEventListener("click", function () {
    showPage("db");
  });
  navCalendarButton.addEventListener("click", function () {
    showPage("calendar");
  });
  navWeeklyButton.addEventListener("click", function () {
    showPage("weekly");
  });

  // 8-1-2. 일정DB 선택메뉴 열기 / 닫기
  batchMenuButton.addEventListener("click", function (evt) {
    evt.stopPropagation();
    batchMenuPanel.classList.toggle("open");
  });

  batchSelectAllButton.addEventListener("click", function () {
    const filtered = getFilteredEvents();
    const startIndex = (currentDatabasePage - 1) * DATABASE_PAGE_SIZE;
    const pageItems = filtered.slice(
      startIndex,
      startIndex + DATABASE_PAGE_SIZE,
    );

    for (const item of pageItems) item.checked = true;
    if (pageItems.length > 0) selectedScheduleId = pageItems[0].id;

    saveStorage();
    batchMenuPanel.classList.remove("open");
    renderAll();
  });

  // 8-1-3. 조회 적용: 구분 / 날짜 / 상태 값을 currentFilter에 저장한다.
  applyFilterBtn.addEventListener("click", function () {
    currentFilter.category = categoryFilter.value;
    currentFilter.date = dateFilter.value;
    currentFilter.status = statusFilter.value;
    currentDatabasePage = 1;
    renderDb();
  });

  // 8-1-4. 조회 초기화: 구분 / 날짜 / 상태를 모두 전체값으로 되돌린다.
  resetFilterBtn.addEventListener("click", function () {
    currentFilter = {
      category: "all",
      date: "",
      status: "all",
    };
    categoryFilter.value = "all";
    dateFilter.value = "";
    statusFilter.value = "all";
    currentDatabasePage = 1;
    renderDb();
  });

  checkAllCheckbox.addEventListener("change", function () {
    const filtered = getFilteredEvents();
    const startIndex = (currentDatabasePage - 1) * DATABASE_PAGE_SIZE;
    const pageItems = filtered.slice(
      startIndex,
      startIndex + DATABASE_PAGE_SIZE,
    );

    for (const item of pageItems) {
      item.checked = checkAllCheckbox.checked;
      if (checkAllCheckbox.checked) selectedScheduleId = item.id;
    }

    saveStorage();
    renderAll();
  });

  previousPageButton.addEventListener("click", function () {
    const filtered = getFilteredEvents();
    const total = Math.max(1, Math.ceil(filtered.length / DATABASE_PAGE_SIZE));
    currentDatabasePage =
      currentDatabasePage > 1 ? currentDatabasePage - 1 : total;
    renderDb();
  });

  nextPageButton.addEventListener("click", function () {
    const filtered = getFilteredEvents();
    const total = Math.max(1, Math.ceil(filtered.length / DATABASE_PAGE_SIZE));
    currentDatabasePage =
      currentDatabasePage < total ? currentDatabasePage + 1 : 1;
    renderDb();
  });

  batchDeleteSelectedButton.addEventListener("click", function () {
    const checked = getCheckedEvents();
    if (checked.length === 0) {
      alert("선택된 일정이 없어.");
      return;
    }
    scheduleItems = scheduleItems.filter((e) => !e.checked);
    selectedScheduleId = null;
    saveStorage();
    batchMenuPanel.classList.remove("open");
    renderAll();
  });

  batchUncheckButton.addEventListener("click", function () {
    for (const e of scheduleItems) e.checked = false;
    selectedScheduleId = null;
    saveStorage();
    batchMenuPanel.classList.remove("open");
    renderAll();
  });

  batchDeleteAllButton.addEventListener("click", function () {
    const ok = confirm("전체 일정을 삭제할까?");
    if (!ok) return;
    scheduleItems = [];
    selectedScheduleId = null;
    saveStorage();
    batchMenuPanel.classList.remove("open");
    renderAll();
  });

  // 8-1-4. 각 화면의 수정 버튼은 현재 선택된 일정 1개를 연다.
  databaseEditButton.addEventListener("click", function () {
    const t = getEditTarget();
    if (!t) return;
    openModalForView(t);
  });

  calendarEditButton.addEventListener("click", function () {
    const t = getEditTarget();
    if (!t) return;
    openModalForView(t);
  });

  weeklyEditButton.addEventListener("click", function () {
    const t = getEditTarget();
    if (!t) return;
    openModalForView(t);
  });

  // 8-1-5. 우측 하단 + 버튼과 모달 열기
  floatingAddButton.addEventListener("click", function (evt) {
    evt.stopPropagation();
    floatingAddMenu.classList.toggle("open");
  });

  openTodoModalButton.addEventListener("click", function () {
    floatingAddMenu.classList.remove("open");
    openModalForAdd();
  });

  // 8-3-1. 모달 닫기 / 수정모드 전환 / 저장 / 삭제
  closeModalButton.addEventListener("click", closeModal);
  cancelModalButton.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  editTodoButton.addEventListener("click", function () {
    switchToEditMode();
  });

  saveTodoButton.addEventListener("click", function () {
    const categoryValue = categoryInput.value;
    const titleValue = titleInput.value.trim();
    const dateValue = dateInput.value;
    const statusValue = statusInput.value;
    const startValue = startTimeInput.value;
    const endValue = endTimeInput.value;
    const detailValue = detailInput.value.trim();

    if (titleValue === "") {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!isValidDateInput(dateValue)) {
      alert("실제 존재하는 날짜만 선택해줘.");
      return;
    }

    if (timeToMinutes(endValue) <= timeToMinutes(startValue)) {
      alert("종료 시간은 시작 시간보다 뒤여야 해.");
      return;
    }

    const ignoreId = modalContext.mode === "edit" ? modalContext.id : null;
    if (hasConflict(dateValue, startValue, endValue, ignoreId)) {
      alert("같은 날짜/시간에 이미 다른 일정이 있어.");
      return;
    }

    if (modalContext.mode === "add") {
      const newEvent = {
        id: Date.now(),
        category: categoryValue,
        title: titleValue,
        date: dateValue,
        startTime: startValue,
        endTime: endValue,
        status: statusValue,
        detail: detailValue,
        checked: false,
      };
      scheduleItems.push(newEvent);
      selectSingle(newEvent.id);
    } else if (modalContext.mode === "edit") {
      const target = getEventById(modalContext.id);
      if (target) {
        target.category = categoryValue;
        target.title = titleValue;
        target.date = dateValue;
        target.startTime = startValue;
        target.endTime = endValue;
        target.status = statusValue;
        target.detail = detailValue;
        selectSingle(target.id);
      }
    } else {
      return;
    }

    const selDate = stringToDate(dateValue);
    calendarYear = selDate.getFullYear();
    calendarMonthIndex = selDate.getMonth();
    weeklyReferenceDate = new Date(selDate);

    saveStorage();
    closeModal();
    renderAll();
  });

  deleteTodoButton.addEventListener("click", function () {
    if (!modalContext.id) return;
    scheduleItems = scheduleItems.filter(
      (e) => String(e.id) !== String(modalContext.id),
    );
    selectedScheduleId = null;
    saveStorage();
    closeModal();
    renderAll();
  });

  // 8-2-1. 캘린더 월 이동 / 월 직접 선택
  calendarPreviousButton.addEventListener("click", function () {
    calendarMonthIndex--;
    if (calendarMonthIndex < 0) {
      calendarMonthIndex = 11;
      calendarYear--;
    }
    renderCalendar();
  });

  calendarNextButton.addEventListener("click", function () {
    calendarMonthIndex++;
    if (calendarMonthIndex > 11) {
      calendarMonthIndex = 0;
      calendarYear++;
    }
    renderCalendar();
  });

  calendarMonthButton.addEventListener("click", function () {
    calendarMonthPicker.value =
      calendarYear + "-" + addZero(calendarMonthIndex + 1);
    if (calendarMonthPicker.showPicker) calendarMonthPicker.showPicker();
    else calendarMonthPicker.click();
  });

  calendarMonthPicker.addEventListener("change", function () {
    if (!calendarMonthPicker.value) return;
    const arr = calendarMonthPicker.value.split("-");
    calendarYear = Number(arr[0]);
    calendarMonthIndex = Number(arr[1]) - 1;
    renderCalendar();
  });

  // 8-2-2. 위클리 주 이동 / 날짜 직접 선택
  weeklyPreviousButton.addEventListener("click", function () {
    weeklyReferenceDate.setDate(weeklyReferenceDate.getDate() - 7);
    renderWeekly();
  });

  weeklyNextButton.addEventListener("click", function () {
    weeklyReferenceDate.setDate(weeklyReferenceDate.getDate() + 7);
    renderWeekly();
  });

  weeklyPickerButton.addEventListener("click", function () {
    weeklyDatePicker.value = dateToString(weeklyReferenceDate);
    if (weeklyDatePicker.showPicker) weeklyDatePicker.showPicker();
    else weeklyDatePicker.click();
  });

  weeklyDatePicker.addEventListener("change", function () {
    if (!weeklyDatePicker.value) return;
    weeklyReferenceDate = stringToDate(weeklyDatePicker.value);
    renderWeekly();
  });

  // 8-3-2. 바깥 영역 클릭 시 열린 메뉴 닫기
  document.addEventListener("click", function (evt) {
    if (
      !floatingAddMenu.contains(evt.target) &&
      evt.target !== floatingAddButton
    )
      floatingAddMenu.classList.remove("open");
    if (!batchMenuPanel.contains(evt.target) && evt.target !== batchMenuButton)
      batchMenuPanel.classList.remove("open");
  });

  // 8-3-3. 창 크기가 바뀌면 화면을 다시 그린다.
  window.addEventListener("resize", function () {
    renderAll();
  });

  // 일정DB / 캘린더 / 위클리를 한 번에 다시 렌더링한다.
  // 9-1. 일정DB / 캘린더 / 위클리를 한 번에 다시 그린다.
  function renderAll() {
    renderDb();
    renderCalendar();
    renderWeekly();
  }

  /* =====================================================
     9. 최초 실행
     9-1. 시간 옵션 채우기
     9-2. 저장 데이터 불러오기
     9-3. 기본 화면(일정DB) 표시
     ===================================================== */

  fillHourSelect(startTimeInput);
  fillHourSelect(endTimeInput);

  loadStorage();
  sortEvents();
  showPage("db");
  renderAll();



  //////////////////////////////////////////////////////////////
  //일정 수정 로직 버튼 수정
  let loginUser = loadJs("loginUser");
  let mainBtn = document.querySelectorAll(".main-btn");

  let selectedMenuBtn = document.querySelector("#selectedMenuBtn");
  let deleteBtn = document.querySelectorAll(".delete-btn");
  let colDel = document.querySelector(".col-del");
  let fabBtn = document.querySelectorAll(".fab-btn");


  if (!loginUser) {
    // edit.style.display= "none";
    selectedMenuBtn.style.display = "none";
    colDel.style.display = "none";
  }

  fabBtn.forEach(el => {
    if (!loginUser) {
      el.style.display = "none";
    }
  })

  mainBtn.forEach(el => {
    if (!loginUser) {
      el.style.display = "none";
    }
  })
  deleteBtn.forEach(el => {
    if (!loginUser) {
      el.style.display = "none";
    }
  })
};

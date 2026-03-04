window.onload = function () {

  // =========================
  // 1) 자주 쓰는 DOM 꺼내기 함수
  // =========================
  function getDom(id) {
    return document.getElementById(id);
  }

  // =========================
  // 2) 메뉴 / 페이지 DOM
  // =========================
  const menuDb = getDom("menuDb");
  const menuCalendar = getDom("menuCalendar");
  const menuWeekly = getDom("menuWeekly");

  const pageDb = getDom("pageDb");
  const pageCalendar = getDom("pageCalendar");
  const pageWeekly = getDom("pageWeekly");

  // =========================
  // 3) 일정 입력 DOM
  // =========================
  const openAddBoxBtn = getDom("openAddBoxBtn");
  const addFormBox = getDom("addFormBox");

  const dbYear = getDom("dbYear");
  const dbMonth = getDom("dbMonth");
  const dbDay = getDom("dbDay");

  const dbTimeText = getDom("dbTimeText");
  const timePreview = getDom("timePreview");

  const dbTitle = getDom("dbTitle");
  const dbCategory = getDom("dbCategory");
  const dbDetail = getDom("dbDetail");

  const dbFileInput = getDom("dbFileInput");
  const fileDropBox = getDom("fileDropBox");
  const selectedFileName = getDom("selectedFileName");

  const saveTodoBtn = getDom("saveTodoBtn");
  const cancelTodoBtn = getDom("cancelTodoBtn");

  // =========================
  // 4) 일정DB 표 / 선택 메뉴 DOM
  // =========================
  const checkAll = getDom("checkAll");
  const todoTableBody = getDom("todoTableBody");

  const selectedMenuBtn = getDom("selectedMenuBtn");
  const selectedMenuList = getDom("selectedMenuList");
  const selectAllBtn = getDom("selectAllBtn");
  const unselectAllBtn = getDom("unselectAllBtn");
  const deleteSelectedBtn = getDom("deleteSelectedBtn");

  // =========================
  // 5) 캘린더 DOM
  // =========================
  const calendarTitle = getDom("calendarTitle");
  const prevMonthBtn = getDom("prevMonthBtn");
  const nextMonthBtn = getDom("nextMonthBtn");
  const calendarBody = getDom("calendarBody");

  // =========================
  // 6) 위클리 DOM
  // =========================
  const weeklyTitle = getDom("weeklyTitle");
  const prevWeekBtn = getDom("prevWeekBtn");
  const nextWeekBtn = getDom("nextWeekBtn");
  const weeklyBody = getDom("weeklyBody");

  const weeklyAddBtn = getDom("weeklyAddBtn");
  const weeklyAddPanel = getDom("weeklyAddPanel");
  const weeklySelectList = getDom("weeklySelectList");
  const weeklyCloseBtn = getDom("weeklyCloseBtn");
  const weeklyDuration = getDom("weeklyDuration");

  const weeklyEditBtn = getDom("weeklyEditBtn");
  const weeklyDeleteBtn = getDom("weeklyDeleteBtn");

  // =========================
  // 7) 실제 데이터
  // =========================
  // status 값
  // todo     : 미완료
  // progress : 진행중
  // done     : 완료
  let todoArr = [];

  // 위클리 블록 데이터
  let weeklyArr = [];

  // 첨부 파일 정보
  let selectedFileData = null;

  // 캘린더 기준 날짜
  const now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();

  // 위클리 기준 날짜
  let currentWeekDate = new Date();

  // 위클리에서 현재 선택한 칸
  let selectedWeeklyDay = -1;
  let selectedWeeklyHour = -1;
  let selectedWeeklyEventId = null;

  // 상태 선택창용 현재 대상 일정 id
  let currentStatusTodoId = null;

  // 공휴일 예시
  const holidayObj = {
    "2026-03-01": "삼일절"
  };

  // =========================
  // 8) 공통 유틸 함수
  // =========================

  // 숫자 앞에 0 붙이기
  function addZero(num) {
    if (num < 10) {
      return "0" + num;
    }
    return String(num);
  }

  // 숫자만 남기기
  function onlyNumber(valueText) {
    let result = "";

    for (let i = 0; i < valueText.length; i++) {
      const ch = valueText[i];
      if (ch >= "0" && ch <= "9") {
        result += ch;
      }
    }

    return result;
  }

  // 시간 정리
  // 1300 -> 13:00
  // 900  -> 09:00
  function normalizeTime(timeText) {
    let only = onlyNumber(timeText);

    if (only.length == 3) {
      only = "0" + only;
    }

    if (only.length != 4) {
      return "";
    }

    const h = Number(only.substring(0, 2));
    const m = Number(only.substring(2, 4));

    if (isNaN(h) || isNaN(m)) return "";
    if (h < 0 || h > 23) return "";
    if (m < 0 || m > 59) return "";

    return addZero(h) + ":" + addZero(m);
  }

  // 오전/오후 미리보기
  function toAmPmText(timeText) {
    const normal = normalizeTime(timeText);

    if (normal == "") {
      return "예: 1300 입력 → 자동으로 13:00 / 오후 1:00";
    }

    const arr = normal.split(":");
    const h = Number(arr[0]);
    const m = Number(arr[1]);

    let ampm = "오전";
    let hour12 = h;

    if (h >= 12) {
      ampm = "오후";
    }

    if (h == 0) {
      hour12 = 12;
    } else if (h > 12) {
      hour12 = h - 12;
    }

    return normal + " / " + ampm + " " + hour12 + ":" + addZero(m);
  }

  // 날짜 문자열 만들기
  function makeDateString(yearText, monthText, dayText) {
    if (yearText.length != 4) return "";
    if (monthText.length == 0 || dayText.length == 0) return "";

    const monthNum = Number(monthText);
    const dayNum = Number(dayText);

    if (isNaN(monthNum) || isNaN(dayNum)) return "";
    if (monthNum < 1 || monthNum > 12) return "";
    if (dayNum < 1 || dayNum > 31) return "";

    return yearText + "-" + addZero(monthNum) + "-" + addZero(dayNum);
  }

  // 상태 라벨
  function getStatusLabel(status) {
    if (status == "todo") return "미완료";
    if (status == "progress") return "진행중";
    return "완료";
  }

  // 상태 접두어
  function getStatusPrefix(status) {
    if (status == "todo") return "[미완료] ";
    if (status == "progress") return "[진행중] ";
    return "[완료] ";
  }

  // 파일 아이콘
  function getFileIcon(fileName) {
    if (fileName == "첨부없음") return "";

    const lower = fileName.toLowerCase();

    if (lower.indexOf(".xls") > -1 || lower.indexOf(".xlsx") > -1) return "📗";
    if (lower.indexOf(".png") > -1 || lower.indexOf(".jpg") > -1 || lower.indexOf(".jpeg") > -1) return "🖼️";
    if (lower.indexOf(".pdf") > -1) return "📕";
    if (lower.indexOf(".doc") > -1 || lower.indexOf(".docx") > -1) return "📘";
    if (lower.indexOf(".ppt") > -1 || lower.indexOf(".pptx") > -1) return "📙";

    return "📄";
  }

  // 반응형 말줄임 길이
  function getCutLen(type) {
    const w = window.innerWidth;

    if (type == "calendar") {
      if (w <= 768) return 8;
      if (w <= 1100) return 12;
      return 18;
    }

    if (type == "weekly") {
      if (w <= 768) return 10;
      if (w <= 1100) return 14;
      return 20;
    }

    if (w <= 768) return 10;
    if (w <= 1100) return 18;
    return 100;
  }

  // 글자 자르기
  function cutText(textValue, maxLength) {
    if (maxLength >= 100) return textValue;
    if (textValue.length > maxLength) {
      return textValue.substring(0, maxLength) + "..";
    }
    return textValue;
  }

  // 일정 id로 찾기
  function findTodoById(todoId) {
    for (let i = 0; i < todoArr.length; i++) {
      if (todoArr[i].id == todoId) {
        return todoArr[i];
      }
    }
    return null;
  }

  function findWeeklyById(eventId) {
  for (let i = 0; i < weeklyArr.length; i++) {
    if (weeklyArr[i].id == eventId) {
      return weeklyArr[i];
    }
  }
  return null;
}

function getSelectedWeeklyEvent() {
  if (selectedWeeklyEventId == null) {
    alert("먼저 위클리 블록을 선택해줘.");
    return null;
  }

  const weeklyItem = findWeeklyById(selectedWeeklyEventId);

  if (weeklyItem == null) {
    alert("선택한 일정이 없거나 이미 삭제되었어.");
    selectedWeeklyEventId = null;
    return null;
  }

  return weeklyItem;
}

function editWeeklyTimeOnly(eventObj) {
  const newHourText = prompt("시작 시간을 입력해줘. (1~24 숫자만)", String(eventObj.hour));
  if (newHourText == null) return;

  const newDurationText = prompt("진행 시간을 입력해줘. (1~12 숫자만)", String(eventObj.duration));
  if (newDurationText == null) return;

  const newHour = Number(newHourText);
  const newDuration = Number(newDurationText);

  if (isNaN(newHour) || isNaN(newDuration)) {
    alert("숫자로 입력해줘.");
    return;
  }

  if (newHour < 1 || newHour > 24) {
    alert("시작 시간은 1~24 사이여야 해.");
    return;
  }

  if (newDuration < 1 || newDuration > 12) {
    alert("진행 시간은 1~12 사이여야 해.");
    return;
  }

  if (newHour + newDuration - 1 > 24) {
    alert("24시를 넘길 수 없어.");
    return;
  }

  if (hasWeeklyConflict(eventObj.dayIndex, newHour, newDuration, eventObj.id)) {
    alert("수정하려는 시간에 다른 일정이 있어.");
    return;
  }

  eventObj.hour = newHour;
  eventObj.duration = newDuration;

  renderWeekly();
}

function editWeeklyWhole(eventObj) {
  if (todoArr.length == 0) {
    alert("일정DB에 일정이 없어.");
    return;
  }

  let message = "바꿀 일정 번호를 입력해줘.\n";
  for (let i = 0; i < todoArr.length; i++) {
    message += (i + 1) + ". " + getStatusPrefix(todoArr[i].status) + todoArr[i].title + "\n";
  }

  const selectedIndexText = prompt(message, "1");
  if (selectedIndexText == null) return;

  const selectedIndex = Number(selectedIndexText) - 1;

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= todoArr.length) {
    alert("번호를 다시 확인해줘.");
    return;
  }

  const newHourText = prompt("시작 시간을 입력해줘. (1~24 숫자만)", String(eventObj.hour));
  if (newHourText == null) return;

  const newDurationText = prompt("진행 시간을 입력해줘. (1~12 숫자만)", String(eventObj.duration));
  if (newDurationText == null) return;

  const newHour = Number(newHourText);
  const newDuration = Number(newDurationText);

  if (isNaN(newHour) || isNaN(newDuration)) {
    alert("숫자로 입력해줘.");
    return;
  }

  if (newHour < 1 || newHour > 24) {
    alert("시작 시간은 1~24 사이여야 해.");
    return;
  }

  if (newDuration < 1 || newDuration > 12) {
    alert("진행 시간은 1~12 사이여야 해.");
    return;
  }

  if (newHour + newDuration - 1 > 24) {
    alert("24시를 넘길 수 없어.");
    return;
  }

  if (hasWeeklyConflict(eventObj.dayIndex, newHour, newDuration, eventObj.id)) {
    alert("수정하려는 시간에 다른 일정이 있어.");
    return;
  }

  eventObj.todoId = todoArr[selectedIndex].id;
  eventObj.hour = newHour;
  eventObj.duration = newDuration;

  renderWeekly();
}

function deleteWeeklyTimeOnly(eventObj) {
  if (eventObj.duration <= 1) {
    alert("1시간 일정은 시간만 삭제할 수 없어. 전체 삭제를 사용해줘.");
    return;
  }

  const sideText = prompt("앞 시간을 지우려면 1, 뒤 시간을 지우려면 2를 입력해줘.", "1");
  if (sideText == null) return;

  const cutHourText = prompt("몇 시간을 지울지 입력해줘. (1 ~ " + (eventObj.duration - 1) + ")", "1");
  if (cutHourText == null) return;

  const cutHour = Number(cutHourText);

  if (isNaN(cutHour) || cutHour < 1 || cutHour >= eventObj.duration) {
    alert("삭제 시간은 현재 길이보다 작아야 해.");
    return;
  }

  // A안: 앞부분 또는 뒷부분만 삭제
  if (sideText == "1") {
    eventObj.hour = eventObj.hour + cutHour;
    eventObj.duration = eventObj.duration - cutHour;
  } else if (sideText == "2") {
    eventObj.duration = eventObj.duration - cutHour;
  } else {
    alert("1 또는 2만 입력해줘.");
    return;
  }

  renderWeekly();
}

function deleteWeeklyWhole(eventObj) {
  let newArr = [];

  for (let i = 0; i < weeklyArr.length; i++) {
    if (weeklyArr[i].id != eventObj.id) {
      newArr.push(weeklyArr[i]);
    }
  }

  weeklyArr = newArr;
  selectedWeeklyEventId = null;
  renderWeekly();
}

  // =========================
  // 9) 페이지 전환
  // =========================
  function showPage(pageName) {
    menuDb.classList.remove("active");
    menuCalendar.classList.remove("active");
    menuWeekly.classList.remove("active");

    pageDb.classList.remove("active");
    pageCalendar.classList.remove("active");
    pageWeekly.classList.remove("active");

    if (pageName == "db") {
      menuDb.classList.add("active");
      pageDb.classList.add("active");
    } else if (pageName == "calendar") {
      menuCalendar.classList.add("active");
      pageCalendar.classList.add("active");
    } else {
      menuWeekly.classList.add("active");
      pageWeekly.classList.add("active");
    }
  }

  menuDb.addEventListener("click", function () {
    showPage("db");
  });

  menuCalendar.addEventListener("click", function () {
    showPage("calendar");
  });

  menuWeekly.addEventListener("click", function () {
    showPage("weekly");
  });

  // =========================
  // 10) 상태 선택창 만들기
  // =========================
  const floatingStatusPanel = createFloatingStatusPanel();

  function createFloatingStatusPanel() {
    const panel = document.createElement("div");
    panel.classList.add("status-panel");

    const btnTodo = document.createElement("button");
    btnTodo.type = "button";
    btnTodo.innerText = "미완료";
    btnTodo.addEventListener("click", function (evt) {
      evt.stopPropagation();
      if (currentStatusTodoId != null) {
        setTodoStatusById(currentStatusTodoId, "todo");
      }
    });

    const btnProgress = document.createElement("button");
    btnProgress.type = "button";
    btnProgress.innerText = "진행중";
    btnProgress.addEventListener("click", function (evt) {
      evt.stopPropagation();
      if (currentStatusTodoId != null) {
        setTodoStatusById(currentStatusTodoId, "progress");
      }
    });

    const btnDone = document.createElement("button");
    btnDone.type = "button";
    btnDone.innerText = "완료";
    btnDone.addEventListener("click", function (evt) {
      evt.stopPropagation();
      if (currentStatusTodoId != null) {
        setTodoStatusById(currentStatusTodoId, "done");
      }
    });

    panel.append(btnTodo);
    panel.append(btnProgress);
    panel.append(btnDone);

    panel.addEventListener("click", function (evt) {
      evt.stopPropagation();
    });

    document.body.appendChild(panel);
    return panel;
  }

  function closeStatusPanel() {
    floatingStatusPanel.classList.remove("open");
    currentStatusTodoId = null;
  }

  function openStatusPanel(btnDom, todoId) {
    currentStatusTodoId = todoId;

    const rect = btnDom.getBoundingClientRect();
    const panelWidth = 120;

    let left = rect.left + (rect.width / 2) - (panelWidth / 2);
    let top = rect.bottom + 8;

    // 왼쪽 밖으로 안 나가게
    if (left < 8) {
      left = 8;
    }

    // 오른쪽 밖으로 안 나가게
    if (left + panelWidth > window.innerWidth - 8) {
      left = window.innerWidth - panelWidth - 8;
    }

    floatingStatusPanel.style.left = left + "px";
    floatingStatusPanel.style.top = top + "px";
    floatingStatusPanel.classList.add("open");
  }

  // =========================
  // 11) 선택 메뉴
  // =========================
  selectedMenuBtn.addEventListener("click", function (evt) {
    evt.stopPropagation();
    selectedMenuList.classList.toggle("open");
  });

  selectAllBtn.addEventListener("click", function () {
    for (let i = 0; i < todoArr.length; i++) {
      todoArr[i].checked = true;
    }
    selectedMenuList.classList.remove("open");
    renderTodoTable();
  });

  unselectAllBtn.addEventListener("click", function () {
    for (let i = 0; i < todoArr.length; i++) {
      todoArr[i].checked = false;
    }
    selectedMenuList.classList.remove("open");
    renderTodoTable();
  });

  deleteSelectedBtn.addEventListener("click", function () {
    let newTodoArr = [];

    for (let i = 0; i < todoArr.length; i++) {
      if (!todoArr[i].checked) {
        newTodoArr.push(todoArr[i]);
      }
    }

    todoArr = newTodoArr;

    // 연결된 위클리도 같이 정리
    let newWeeklyArr = [];
    for (let i = 0; i < weeklyArr.length; i++) {
      const linkedTodo = findTodoById(weeklyArr[i].todoId);
      if (linkedTodo != null) {
        newWeeklyArr.push(weeklyArr[i]);
      }
    }
    weeklyArr = newWeeklyArr;

    selectedMenuList.classList.remove("open");

    renderTodoTable();
    renderCalendar();
    renderWeeklySelectList();
    renderWeekly();
  });

  // =========================
  // 12) 입력창 열기 / 닫기
  // =========================
  openAddBoxBtn.addEventListener("click", function () {
    addFormBox.classList.toggle("hide");
  });

  cancelTodoBtn.addEventListener("click", function () {
    addFormBox.classList.add("hide");
    resetInputArea();
  });

  function resetInputArea() {
    dbYear.value = "";
    dbMonth.value = "";
    dbDay.value = "";
    dbTimeText.value = "";
    dbTitle.value = "";
    dbCategory.value = "";
    dbDetail.value = "";
    timePreview.innerText = "예: 1300 입력 → 자동으로 13:00 / 오후 1:00";
    resetFileArea();
  }

  // =========================
  // 13) 날짜 / 시간 입력 처리
  // =========================
  dbYear.addEventListener("input", function () {
    dbYear.value = onlyNumber(dbYear.value).substring(0, 4);

    if (dbYear.value.length == 4) {
      dbMonth.focus();
    }
  });

  dbMonth.addEventListener("input", function () {
    dbMonth.value = onlyNumber(dbMonth.value).substring(0, 2);

    if (dbMonth.value.length == 2) {
      dbDay.focus();
    }
  });

  dbDay.addEventListener("input", function () {
    dbDay.value = onlyNumber(dbDay.value).substring(0, 2);
  });

  dbTimeText.addEventListener("input", function () {
    let only = onlyNumber(dbTimeText.value).substring(0, 4);

    if (only.length >= 3) {
      dbTimeText.value = only.substring(0, 2) + ":" + only.substring(2);
    } else {
      dbTimeText.value = only;
    }

    timePreview.innerText = toAmPmText(dbTimeText.value);
  });

  // =========================
  // 14) 파일 첨부
  // =========================
  fileDropBox.addEventListener("click", function () {
    dbFileInput.click();
  });

  dbFileInput.addEventListener("change", function () {
    if (dbFileInput.files.length > 0) {
      setSelectedFile(dbFileInput.files[0]);
    }
  });

  fileDropBox.addEventListener("dragover", function (evt) {
    evt.preventDefault();
    fileDropBox.classList.add("drag-over");
  });

  fileDropBox.addEventListener("dragleave", function () {
    fileDropBox.classList.remove("drag-over");
  });

  fileDropBox.addEventListener("drop", function (evt) {
    evt.preventDefault();
    fileDropBox.classList.remove("drag-over");

    if (evt.dataTransfer.files.length > 0) {
      setSelectedFile(evt.dataTransfer.files[0]);
    }
  });

  function setSelectedFile(fileObj) {
    selectedFileData = {
      name: fileObj.name,
      type: fileObj.type
    };

    selectedFileName.innerText = fileObj.name;
  }

  function resetFileArea() {
    selectedFileData = null;
    dbFileInput.value = "";
    selectedFileName.innerText = "첨부없음";
  }

  // =========================
  // 15) 저장
  // =========================
  saveTodoBtn.addEventListener("click", function () {
    const dateValue = makeDateString(dbYear.value, dbMonth.value, dbDay.value);
    const timeValue = normalizeTime(dbTimeText.value);
    const titleValue = dbTitle.value.trim();
    const categoryValue = dbCategory.value.trim();
    const detailValue = dbDetail.value.trim();

    if (dateValue == "") {
      alert("날짜를 제대로 입력해줘. 예: 2026 / 03 / 04");
      dbYear.focus();
      return;
    }

    if (timeValue == "") {
      alert("시간을 제대로 입력해줘. 예: 1300 또는 13:00");
      dbTimeText.focus();
      return;
    }

    if (titleValue == "") {
      alert("제목을 입력해줘.");
      dbTitle.focus();
      return;
    }

    let fileNameValue = "첨부없음";

    if (selectedFileData != null) {
      fileNameValue = selectedFileData.name;
    }

    const newTodo = {
      id: new Date().getTime(),
      date: dateValue,
      time: timeValue,
      title: titleValue,
      status: "todo",
      category: categoryValue == "" ? "개인" : categoryValue,
      detail: detailValue,
      fileName: fileNameValue,
      checked: false
    };

    todoArr.unshift(newTodo);

    const dArr = dateValue.split("-");
    currentYear = Number(dArr[0]);
    currentMonth = Number(dArr[1]) - 1;

    addFormBox.classList.add("hide");
    resetInputArea();

    renderTodoTable();
    renderCalendar();
    renderWeeklySelectList();
    renderWeekly();
  });

  // =========================
  // 16) 전체 체크 동기화
  // =========================
  function syncCheckAll() {
    let checkedCount = 0;

    for (let i = 0; i < todoArr.length; i++) {
      if (todoArr[i].checked) {
        checkedCount++;
      }
    }

    checkAll.checked = (todoArr.length > 0 && checkedCount == todoArr.length);
  }

  checkAll.addEventListener("change", function () {
    for (let i = 0; i < todoArr.length; i++) {
      todoArr[i].checked = checkAll.checked;
    }

    renderTodoTable();
  });

  // =========================
  // 17) 상태 변경
  // =========================
  function setTodoStatusById(todoId, statusValue) {
    for (let i = 0; i < todoArr.length; i++) {
      if (todoArr[i].id == todoId) {
        todoArr[i].status = statusValue;
      }
    }

    closeStatusPanel();
    renderTodoTable();
    renderCalendar();
    renderWeeklySelectList();
    renderWeekly();
  }

  // =========================
  // 18) 일정DB 표 렌더링
  // =========================
  function renderTodoTable() {
    closeStatusPanel();
    todoTableBody.innerHTML = "";

    for (let i = 0; i < todoArr.length; i++) {
      const todo = todoArr[i];
      const tr = document.createElement("tr");

      // 체크
      const tdCheck = document.createElement("td");
      const rowCheck = document.createElement("input");
      rowCheck.type = "checkbox";
      rowCheck.checked = todo.checked;
      rowCheck.addEventListener("change", function () {
        todo.checked = rowCheck.checked;
        syncCheckAll();
      });
      tdCheck.append(rowCheck);

      // 날짜
      const tdDate = document.createElement("td");
      tdDate.innerText = todo.date;

      // 시간
      const tdTime = document.createElement("td");
      tdTime.innerText = todo.time;

      // 제목
      const tdTitle = document.createElement("td");
      tdTitle.classList.add("text-left", "ellipsis");
      tdTitle.innerText = cutText(todo.title, getCutLen("table"));

      // 상태
      const tdStatus = document.createElement("td");
      const statusWrap = document.createElement("div");
      statusWrap.classList.add("status-wrap");

      const currentBtn = document.createElement("button");
      currentBtn.type = "button";
      currentBtn.classList.add("status-current");
      currentBtn.classList.add(todo.status);
      currentBtn.innerText = getStatusLabel(todo.status);

      currentBtn.addEventListener("click", function (evt) {
        evt.stopPropagation();

        const isOpen = floatingStatusPanel.classList.contains("open") && currentStatusTodoId == todo.id;

        closeStatusPanel();

        if (!isOpen) {
          openStatusPanel(currentBtn, todo.id);
        }
      });

      statusWrap.append(currentBtn);
      tdStatus.append(statusWrap);

      // 구분
      const tdCategory = document.createElement("td");
      tdCategory.innerText = todo.category;

      // 상세내용
      const tdDetail = document.createElement("td");
      tdDetail.classList.add("text-left", "ellipsis");
      tdDetail.innerText = cutText(todo.detail, getCutLen("table"));

      // 파일
      const tdFile = document.createElement("td");
      if (todo.fileName == "첨부없음") {
        tdFile.innerText = "첨부없음";
      } else {
        const fileBox = document.createElement("div");
        fileBox.classList.add("file-box");

        const icon = document.createElement("span");
        icon.classList.add("file-icon");
        icon.innerText = getFileIcon(todo.fileName);

        const name = document.createElement("span");
        name.classList.add("ellipsis");
        name.innerText = cutText(todo.fileName, getCutLen("table"));

        fileBox.append(icon);
        fileBox.append(name);
        tdFile.append(fileBox);
      }

      // 삭제
      const tdDelete = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.classList.add("delete-btn");
      delBtn.innerText = "삭제";
      delBtn.addEventListener("click", function () {
        let newTodoArr = [];

        for (let j = 0; j < todoArr.length; j++) {
          if (todoArr[j].id != todo.id) {
            newTodoArr.push(todoArr[j]);
          }
        }

        todoArr = newTodoArr;

        // 연결된 위클리 같이 삭제
        let newWeeklyArr = [];
        for (let j = 0; j < weeklyArr.length; j++) {
          if (weeklyArr[j].todoId != todo.id) {
            newWeeklyArr.push(weeklyArr[j]);
          }
        }
        weeklyArr = newWeeklyArr;

        renderTodoTable();
        renderCalendar();
        renderWeeklySelectList();
        renderWeekly();
      });
      tdDelete.append(delBtn);

      tr.append(tdCheck);
      tr.append(tdDate);
      tr.append(tdTime);
      tr.append(tdTitle);
      tr.append(tdStatus);
      tr.append(tdCategory);
      tr.append(tdDetail);
      tr.append(tdFile);
      tr.append(tdDelete);

      todoTableBody.append(tr);
    }

    syncCheckAll();
  }

  // =========================
  // 19) 캘린더 렌더링
  // =========================
  function renderCalendar() {
    calendarBody.innerHTML = "";
    calendarTitle.innerText = currentYear + "년 " + (currentMonth + 1) + "월";

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = firstDay.getDay();

    let totalCell = startDay + lastDate;
    if (totalCell % 7 != 0) {
      totalCell = totalCell + (7 - (totalCell % 7));
    }

    let dayNumber = 1;

    for (let i = 0; i < totalCell / 7; i++) {
      const tr = document.createElement("tr");

      for (let j = 0; j < 7; j++) {
        const td = document.createElement("td");

        if ((i == 0 && j < startDay) || dayNumber > lastDate) {
          td.innerHTML = "";
        } else {
          const dateString = currentYear + "-" + addZero(currentMonth + 1) + "-" + addZero(dayNumber);

          const topDiv = document.createElement("div");
          topDiv.classList.add("calendar-day-top");

          const numDiv = document.createElement("div");
          numDiv.classList.add("calendar-day-number");
          numDiv.innerText = dayNumber;

          if (j == 0) numDiv.classList.add("sun");
          if (j == 6) numDiv.classList.add("sat");
          if (holidayObj[dateString]) numDiv.classList.add("holiday");

          topDiv.append(numDiv);
          td.append(topDiv);

          let dayEventArr = [];
          for (let k = 0; k < todoArr.length; k++) {
            if (todoArr[k].date == dateString) {
              dayEventArr.push(todoArr[k]);
            }
          }

          for (let k = 0; k < dayEventArr.length; k++) {
            if (k < 2) {
              const eventDiv = document.createElement("div");
              eventDiv.classList.add("calendar-event");

              if (dayEventArr[k].status == "progress") {
                eventDiv.classList.add("progress");
              }
              if (dayEventArr[k].status == "done") {
                eventDiv.classList.add("done");
              }

              eventDiv.innerText = getStatusPrefix(dayEventArr[k].status) + cutText(dayEventArr[k].title, getCutLen("calendar"));
              td.append(eventDiv);
            }
          }

          dayNumber++;
        }

        tr.append(td);
      }

      calendarBody.append(tr);
    }
  }

  prevMonthBtn.addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  // =========================
  // 20) 위클리 날짜 계산
  // =========================
  function getWeekStart(dateObj) {
    const copy = new Date(dateObj);
    const day = copy.getDay();

    copy.setDate(copy.getDate() - day);
    copy.setHours(0);
    copy.setMinutes(0);
    copy.setSeconds(0);
    copy.setMilliseconds(0);

    return copy;
  }

  function getWeekText(dateObj) {
    const month = dateObj.getMonth() + 1;
    const firstDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);

    const weekStart = getWeekStart(dateObj);
    const firstWeekStart = getWeekStart(firstDate);

    const diffTime = weekStart.getTime() - firstWeekStart.getTime();
    const diffWeek = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;

    if (diffWeek == 1) return month + "월 첫째주";
    if (diffWeek == 2) return month + "월 둘째주";
    if (diffWeek == 3) return month + "월 셋째주";
    if (diffWeek == 4) return month + "월 넷째주";
    return month + "월 " + diffWeek + "째주";
  }

  // =========================
  // 21) 위클리 겹침 검사
  // =========================
  function isHourCoveredByEvent(dayIndex, hour, eventObj) {
    if (eventObj.dayIndex != dayIndex) return false;
    if (hour >= eventObj.hour && hour < eventObj.hour + eventObj.duration) {
      return true;
    }
    return false;
  }

  function hasWeeklyConflict(dayIndex, startHour, duration, ignoreId) {
    for (let h = startHour; h < startHour + duration; h++) {
      if (h < 1 || h > 24) {
        return true;
      }

      for (let i = 0; i < weeklyArr.length; i++) {
        if (weeklyArr[i].id != ignoreId) {
          if (isHourCoveredByEvent(dayIndex, h, weeklyArr[i])) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // =========================
  // 22) 위클리 수정 / 삭제 / 늘리기
  // =========================
  function editWeeklyEvent(eventObj) {
    const newHourText = prompt("시작 시간을 입력해줘. (1~24 숫자만)", String(eventObj.hour));
    if (newHourText == null) return;

    const newDurationText = prompt("진행 시간을 입력해줘. (1~12 숫자만)", String(eventObj.duration));
    if (newDurationText == null) return;

    const newHour = Number(newHourText);
    const newDuration = Number(newDurationText);

    if (isNaN(newHour) || isNaN(newDuration)) {
      alert("숫자로 입력해줘.");
      return;
    }

    if (newHour < 1 || newHour > 24) {
      alert("시작 시간은 1~24 사이여야 해.");
      return;
    }

    if (newDuration < 1 || newDuration > 12) {
      alert("진행 시간은 1~12 사이여야 해.");
      return;
    }

    if (newHour + newDuration - 1 > 24) {
      alert("24시를 넘길 수 없어.");
      return;
    }

    if (hasWeeklyConflict(eventObj.dayIndex, newHour, newDuration, eventObj.id)) {
      alert("수정하려는 시간에 다른 일정이 있어.");
      return;
    }

    eventObj.hour = newHour;
    eventObj.duration = newDuration;
    renderWeekly();
  }

  function deleteWeeklyEvent(eventId) {
    let newArr = [];

    for (let i = 0; i < weeklyArr.length; i++) {
      if (weeklyArr[i].id != eventId) {
        newArr.push(weeklyArr[i]);
      }
    }

    weeklyArr = newArr;
    renderWeekly();
  }

  function expandUp(eventObj) {
    if (eventObj.hour <= 1) {
      alert("더 위로는 늘릴 수 없어.");
      return;
    }

    const nextHour = eventObj.hour - 1;

    if (hasWeeklyConflict(eventObj.dayIndex, nextHour, eventObj.duration + 1, eventObj.id)) {
      alert("위쪽 시간에 다른 일정이 있어서 늘릴 수 없어.");
      return;
    }

    eventObj.hour = eventObj.hour - 1;
    eventObj.duration = eventObj.duration + 1;
    renderWeekly();
  }

  function expandDown(eventObj) {
    const nextDuration = eventObj.duration + 1;

    if (eventObj.hour + nextDuration - 1 > 24) {
      alert("더 아래로는 늘릴 수 없어.");
      return;
    }

    if (hasWeeklyConflict(eventObj.dayIndex, eventObj.hour, nextDuration, eventObj.id)) {
      alert("아래쪽 시간에 다른 일정이 있어서 늘릴 수 없어.");
      return;
    }

    eventObj.duration = nextDuration;
    renderWeekly();
  }

  // =========================
  // 23) 위클리 선택 카드 렌더링
  // =========================
  function renderWeeklySelectList() {
    weeklySelectList.innerHTML = "";

    for (let i = 0; i < todoArr.length; i++) {
      const todo = todoArr[i];

      const itemDiv = document.createElement("div");
      itemDiv.classList.add("weekly-select-item");

      const titleDiv = document.createElement("div");
      titleDiv.classList.add("weekly-item-title");
      titleDiv.innerText = getStatusPrefix(todo.status) + todo.title;

      const subDiv = document.createElement("div");
      subDiv.classList.add("weekly-item-sub");
      subDiv.innerText = todo.date + " / " + todo.time + " / " + todo.category;

      itemDiv.append(titleDiv);
      itemDiv.append(subDiv);

      itemDiv.addEventListener("click", function () {
        if (selectedWeeklyDay == -1 || selectedWeeklyHour == -1) {
          alert("먼저 시간표 칸을 클릭해줘.");
          return;
        }

        const durationValue = Number(weeklyDuration.value);

        if (selectedWeeklyHour + durationValue - 1 > 24) {
          alert("24시를 넘어서 배치할 수 없어.");
          return;
        }

        if (hasWeeklyConflict(selectedWeeklyDay, selectedWeeklyHour, durationValue, -1)) {
          alert("이미 다른 일정이 들어간 시간이야.");
          return;
        }

        const newWeekly = {
          id: new Date().getTime(),
          dayIndex: selectedWeeklyDay,
          hour: selectedWeeklyHour,
          duration: durationValue,
          todoId: todo.id
        };

        weeklyArr.push(newWeekly);
        weeklyAddPanel.classList.add("hide");
        renderWeekly();
      });

      weeklySelectList.append(itemDiv);
    }
  }

  // =========================
  // 24) 위클리 렌더링
  // =========================
  function renderWeekly() {
    weeklyBody.innerHTML = "";
    weeklyTitle.innerText = getWeekText(currentWeekDate);

    for (let hour = 1; hour <= 24; hour++) {
      const tr = document.createElement("tr");

      const timeTd = document.createElement("td");
      timeTd.classList.add("time-cell");
      timeTd.innerText = addZero(hour) + ":00";
      tr.append(timeTd);

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const td = document.createElement("td");
        td.classList.add("weekly-slot");

        if (selectedWeeklyDay == dayIndex && selectedWeeklyHour == hour) {
          td.classList.add("selected");
        }

        for (let i = 0; i < weeklyArr.length; i++) {
          if (isHourCoveredByEvent(dayIndex, hour, weeklyArr[i])) {
            td.classList.add("covered");
          }
        }

        td.addEventListener("click", function () {
  selectedWeeklyDay = dayIndex;
  selectedWeeklyHour = hour;
  selectedWeeklyEventId = null;
  renderWeekly();
});
        

        for (let i = 0; i < weeklyArr.length; i++) {
          if (weeklyArr[i].dayIndex == dayIndex && weeklyArr[i].hour == hour) {
            const weeklyItem = weeklyArr[i];
            const todo = findTodoById(weeklyItem.todoId);

            const eventDiv = document.createElement("div");
            eventDiv.classList.add("weekly-event");

            if (selectedWeeklyEventId == weeklyItem.id) {
  eventDiv.classList.add("selected-event");
}

            if (todo && todo.status == "progress") {
              eventDiv.classList.add("progress");
            }
            if (todo && todo.status == "done") {
              eventDiv.classList.add("done");
            }

            const blockHeight = (weeklyItem.duration * 62) - 8;
            eventDiv.style.height = blockHeight + "px";

            const statusDiv = document.createElement("div");
statusDiv.classList.add("weekly-event-status");

const titleDiv = document.createElement("div");
titleDiv.classList.add("weekly-event-title");

if (todo) {
  statusDiv.innerText = "[" + getStatusLabel(todo.status) + "]";
  titleDiv.innerText = cutText(todo.title, getCutLen("weekly"));
} else {
  statusDiv.innerText = "[삭제됨]";
  titleDiv.innerText = "삭제된 일정";
}

const timeDiv = document.createElement("div");
timeDiv.classList.add("weekly-event-time");
timeDiv.innerText = weeklyItem.hour + ":00 ~ " + (weeklyItem.hour + weeklyItem.duration) + ":00";

            const controlBox = document.createElement("div");
            controlBox.classList.add("weekly-control-box");

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.classList.add("weekly-mini-btn");
            editBtn.innerText = "수정";
            editBtn.addEventListener("click", function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              editWeeklyEvent(weeklyItem);
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.classList.add("weekly-mini-btn");
            deleteBtn.innerText = "삭제";
            deleteBtn.addEventListener("click", function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              deleteWeeklyEvent(weeklyItem.id);
            });

            const upBtn = document.createElement("button");
            upBtn.type = "button";
            upBtn.classList.add("weekly-mini-btn");
            upBtn.innerText = "▲";
            upBtn.addEventListener("click", function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              expandUp(weeklyItem);
            });

            const downBtn = document.createElement("button");
            downBtn.type = "button";
            downBtn.classList.add("weekly-mini-btn");
            downBtn.innerText = "▼";
            downBtn.addEventListener("click", function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              expandDown(weeklyItem);
            });

            controlBox.append(editBtn);
            controlBox.append(deleteBtn);
            controlBox.append(upBtn);
            controlBox.append(downBtn);

            eventDiv.addEventListener("click", function (evt) {
  evt.stopPropagation();
  selectedWeeklyEventId = weeklyItem.id;
  renderWeekly();
});

            eventDiv.append(statusDiv);
eventDiv.append(titleDiv);
eventDiv.append(timeDiv);
eventDiv.append(controlBox);

            td.append(eventDiv);
          }
        }

        tr.append(td);
      }

      weeklyBody.append(tr);
    }
  }

  // =========================
  // 25) 위클리 상단 버튼
  // =========================
  weeklyAddBtn.addEventListener("click", function () {
    weeklyAddPanel.classList.toggle("hide");
  });
  weeklyEditBtn.addEventListener("click", function () {
  const eventObj = getSelectedWeeklyEvent();
  if (eventObj == null) return;

  const mode = prompt("1을 입력하면 시간 수정, 2를 입력하면 전체 수정이야.", "1");
  if (mode == null) return;

  if (mode == "1") {
    editWeeklyTimeOnly(eventObj);
  } else if (mode == "2") {
    editWeeklyWhole(eventObj);
  } else {
    alert("1 또는 2만 입력해줘.");
  }
});

weeklyDeleteBtn.addEventListener("click", function () {
  const eventObj = getSelectedWeeklyEvent();
  if (eventObj == null) return;

  const mode = prompt("1을 입력하면 시간만 삭제, 2를 입력하면 일정 전체 삭제야.", "1");
  if (mode == null) return;

  if (mode == "1") {
    deleteWeeklyTimeOnly(eventObj);
  } else if (mode == "2") {
    deleteWeeklyWhole(eventObj);
  } else {
    alert("1 또는 2만 입력해줘.");
  }
});


  weeklyCloseBtn.addEventListener("click", function () {
    weeklyAddPanel.classList.add("hide");
  });

  prevWeekBtn.addEventListener("click", function () {
    currentWeekDate.setDate(currentWeekDate.getDate() - 7);
    renderWeekly();
  });

  nextWeekBtn.addEventListener("click", function () {
    currentWeekDate.setDate(currentWeekDate.getDate() + 7);
    renderWeekly();
  });

  // =========================
  // 26) 문서 클릭 시 닫기
  // =========================
  document.addEventListener("click", function () {
    selectedMenuList.classList.remove("open");
    closeStatusPanel();
  });

  // 선택 메뉴 안 클릭하면 닫히지 않게
  selectedMenuList.addEventListener("click", function (evt) {
    evt.stopPropagation();
  });

  // 창 크기 바뀌면 상태창 닫기
  window.addEventListener("resize", function () {
    closeStatusPanel();
    renderTodoTable();
    renderCalendar();
    renderWeeklySelectList();
    renderWeekly();
  });

  // =========================
  // 27) 첫 렌더링
  // =========================
  renderTodoTable();
  renderCalendar();
  renderWeeklySelectList();
  renderWeekly();
};
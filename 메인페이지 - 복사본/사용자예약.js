        (function () {
            try {

                function normalizeToDash(dateKey) {
                    if (!dateKey) return "";
                    return String(dateKey).trim().replaceAll("/", "-").replaceAll(".", "-");
                }
                function normalizeToSlash(dateKey) {
                    if (!dateKey) return "";
                    return normalizeToDash(dateKey).replaceAll("-", "/");
                }
                function parseYMFromDateKey(dateKey) {
                    if (!dateKey) return null;
                    var key = normalizeToDash(dateKey); // YYYY-MM-DD
                    var parts = key.split("-");
                    if (parts.length < 2) return null;
                    var y = parseInt(parts[0], 10);
                    var m = parseInt(parts[1], 10);
                    if (isNaN(y) || isNaN(m)) return null;
                    return { year: y, month: m };
                }
                function dateSlashToNumber(dateSlash) {

                    if (!dateSlash) return 0;
                    var p = String(dateSlash).split("/");
                    if (p.length < 3) return 0;
                    var y = p[0], m = p[1], d = p[2];
                    return parseInt(String(y) + String(m).padStart(2, "0") + String(d).padStart(2, "0"), 10) || 0;
                }
                function pad2(n) { return String(n).padStart(2, "0"); }

                var roomImages = {
                    "701호": "./Img/강의실내부1.png",
                    "702호": "./Img/강의실내부5.png",
                    "703호": "./Img/강의실내부4.png",
                    "704호": "./Img/강의실내부3.png",
                    "705호": "./Img/강의실내부2.png"
                };

                // 과거 예약 5개
                var reservations = [
                    { year: 2025, month: 11, center: "|클로버 교육센터|", reserver: "김OO", room: "701호", date: "2025/11/03", time: "14:00 ~ 17:00(3시간)", img: roomImages["701호"] },
                    { year: 2025, month: 9, center: "|클로버 교육센터|", reserver: "김OO", room: "704호", date: "2025/09/21", time: "09:00 ~ 12:00(3시간)", img: roomImages["704호"] },
                    { year: 2025, month: 7, center: "|클로버 교육센터|", reserver: "김OO", room: "703호", date: "2025/07/09", time: "14:00 ~ 17:00(3시간)", img: roomImages["703호"] },
                    { year: 2025, month: 4, center: "|클로버 교육센터|", reserver: "김OO", room: "702호", date: "2025/04/18", time: "03:00 ~ 06:00(3시간)", img: roomImages["702호"] },
                    { year: 2025, month: 1, center: "|클로버 교육센터|", reserver: "김OO", room: "705호", date: "2025/01/12", time: "18:00 ~ 21:00(3시간)", img: roomImages["705호"] },
                ];

                var params = new URLSearchParams(window.location.search);
                var qCenter = params.get("center");
                var qRoom = params.get("room");
                var qDateKey = params.get("date");
                var qStart = params.get("start");
                var qEnd = params.get("end");
                var qPerson = params.get("person");

                var urlYM = null;

                if (qCenter && qRoom && qDateKey && qStart != null && qEnd != null && qStart !== "" && qEnd !== "") {
                    urlYM = parseYMFromDateKey(qDateKey);

                    var s = parseInt(qStart, 10);
                    var e = parseInt(qEnd, 10);
                    var hour = (!isNaN(s) && !isNaN(e)) ? Math.max(0, e - s) : 0;

                    var timeText = (!isNaN(s) && !isNaN(e))
                        ? `${pad2(s)}:00 ~ ${pad2(e)}:00(${hour}시간)`
                        : "시간 정보 없음";

                    if (qPerson) timeText += ` / 인원 ${qPerson}명`;

                    if (urlYM) {
                        reservations.push({
                            year: urlYM.year,
                            month: urlYM.month,
                            center: `|${qCenter}|`,
                            reserver: "김OO",
                            room: qRoom,
                            date: normalizeToSlash(qDateKey),
                            time: timeText,
                            img: roomImages[qRoom] || "./Img/강의실내부4.png",
                            _fromUrl: true
                        });
                    }
                }
                // 기간 드롭다운
                var openBtn = document.getElementById("open-f");
                var dropdown = document.getElementById("category-dropdown");
                var periodText = document.getElementById("period-text");
                var listEl = document.getElementById("reservation_list");
                var tpl = document.getElementById("reservation_template");

                var selectedYear = null;
                var selectedMonth = null;

                function getAvailablePeriods() {
                    // YYYY-MM
                    var map = {};
                    reservations.forEach(function (r) {
                        var key = String(r.year) + "-" + pad2(r.month);
                        map[key] = { year: r.year, month: r.month };
                    });

                    var arr = Object.keys(map).map(function (k) { return map[k]; });

                    // 최신순 정렬
                    arr.sort(function (a, b) {
                        if (a.year !== b.year) return b.year - a.year;
                        return b.month - a.month;
                    });

                    return arr;
                }

                function setPeriodText(y, m) {
                    periodText.textContent = `${y}년 ${m}월`;
                }

                function renderPeriodDropdown() {
                    dropdown.innerHTML = "";

                    var periods = getAvailablePeriods();

                    if (periods.length === 0) {
                        var div = document.createElement("div");
                        div.className = "period-item";
                        div.textContent = "예약 내역 없음";
                        div.style.cursor = "default";
                        dropdown.appendChild(div);
                        return;
                    }

                    periods.forEach(function (p) {
                        var div = document.createElement("div");
                        div.className = "period-item";
                        div.textContent = `${p.year}년 ${p.month}월`;
                        div.addEventListener("click", function () {
                            selectedYear = p.year;
                            selectedMonth = p.month;
                            setPeriodText(p.year, p.month);
                            dropdown.style.display = "none";
                            renderReservationCards(p.year, p.month);
                        });
                        dropdown.appendChild(div);
                    });
                }

                openBtn.addEventListener("click", function () {
                    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
                    if (dropdown.style.display === "block") renderPeriodDropdown();
                });

                document.addEventListener("click", function (e) {
                    if (!e.target.closest(".dropdown")) dropdown.style.display = "none";
                });

                // 예약 카드 
                function renderReservationCards(year, month) {
                    listEl.innerHTML = "";

                    var items = reservations.filter(function (r) {
                        return r.year === year && r.month === month;
                    });

                    if (items.length === 0) {
                        var empty = document.createElement("div");
                        empty.style.padding = "18px";
                        empty.style.border = "1px solid #e6e6e6";
                        empty.style.borderRadius = "14px";
                        empty.style.background = "#fff";
                        empty.textContent = "해당 월 예약 내역이 없습니다.";
                        listEl.appendChild(empty);
                        return;
                    }

                    // 날짜 최신순
                    items.sort(function (a, b) {
                        return dateSlashToNumber(b.date) - dateSlashToNumber(a.date);
                    });

                    items.forEach(function (r) {
                        var node = tpl.content.cloneNode(true);

                        node.querySelector(".reservation_info_img").src = r.img;
                        node.querySelector(".center-name").textContent = r.center;
                        node.querySelector(".reserver-name").textContent = r.reserver;
                        node.querySelector(".room-name").textContent = r.room;
                        node.querySelector(".use-date").textContent = r.date;
                        node.querySelector(".use-time").textContent = r.time;

                        listEl.appendChild(node);
                    });
                }

                var editModal = document.getElementById("edit_modal");
                var roomSelectBox = document.getElementById("room_select");
                var timeSelectBox = document.getElementById("time_select");
                var roomOption = document.getElementById("room_option");
                var timeOption = document.getElementById("time_option");
                var saveBtn = document.getElementById("save_btn");
                var closeBtn = document.getElementById("close_btn");

                var editType = "";
                var currentCard = null;

                listEl.addEventListener("click", function (e) {
                    var card = e.target.closest(".reservation-card");
                    if (!card) return;

                    if (e.target.closest(".change_room")) {
                        editType = "room";
                        currentCard = card;
                        roomSelectBox.style.display = "block";
                        timeSelectBox.style.display = "none";
                        roomOption.value = card.querySelector(".room-name").textContent.trim();
                        editModal.style.display = "flex";
                        return;
                    }

                    if (e.target.closest(".change_time")) {
                        editType = "time";
                        currentCard = card;
                        roomSelectBox.style.display = "none";
                        timeSelectBox.style.display = "block";
                        timeOption.value = card.querySelector(".use-time").textContent.trim();
                        editModal.style.display = "flex";
                        return;
                    }

                    if (e.target.closest(".cancel_btn")) {
                        if (confirm("예약을 취소하시겠습니까?")) {
                            var h = card.offsetHeight;
                            card.style.height = h + "px";
                            card.innerHTML = "";
                            card.style.visibility = "hidden";
                            card.style.pointerEvents = "none";
                            alert("예약이 취소되었습니다.");
                        }
                    }
                });

                saveBtn.addEventListener("click", function () {
                    if (!currentCard) return;

                    if (editType === "room") {
                        currentCard.querySelector(".room-name").textContent = roomOption.value;
                        var imgEl = currentCard.querySelector(".reservation_info_img");
                        if (roomImages[roomOption.value]) imgEl.src = roomImages[roomOption.value];
                    }

                    if (editType === "time") {
                        currentCard.querySelector(".use-time").textContent = timeOption.value;
                    }

                    editModal.style.display = "none";
                });

                closeBtn.addEventListener("click", function () {
                    editModal.style.display = "none";
                });

                editModal.addEventListener("click", function (e) {
                    if (e.target === editModal) editModal.style.display = "none";
                });

                (function init() {
                    var initYear, initMonth;

                    if (urlYM) {
                        initYear = urlYM.year;
                        initMonth = urlYM.month;
                    } else {
                        var periods = getAvailablePeriods();
                        initYear = periods[0].year;
                        initMonth = periods[0].month;
                    }

                    selectedYear = initYear;
                    selectedMonth = initMonth;

                    setPeriodText(initYear, initMonth);
                    renderReservationCards(initYear, initMonth);
                })();

            } catch (err) {
                var listEl = document.getElementById("reservation_list");
                if (listEl) {
                    listEl.innerHTML =
                        "<div style='margin-left:10vw; margin-top:18px; padding:16px; border:1px solid #e6e6e6; border-radius:14px;'>"
                        + "스크립트 오류가 발생했어. 콘솔(F12)에 에러가 뜰 거야.<br/>"
                        + "에러: " + String(err) +
                        "</div>";
                }
            }
        })();
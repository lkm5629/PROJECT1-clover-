window.addEventListener('load', () => {

    const STORAGE_KEY = "clover_notices_v1";
    const SEED_VERSION_KEY = "clover_notices_seed_version";
    const SEED_VERSION = "2026-03-05-v4";

    function pad2(n) { return String(n).padStart(2, "0"); }
    function todayISO() {
        const d = new Date();
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    }

    function escapeHTML(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function seedNoticesByVersion() {
        const savedVersion = localStorage.getItem(SEED_VERSION_KEY);
        if (savedVersion === SEED_VERSION) return;

        const seed = [
            {
                id: 5,
                title: "[공지] 사무실 출입 및 보안수칙 안내",
                author: "관리자",
                date: "2026-03-05",
                content: `---

**[공지] 사무실 출입 및 보안수칙 안내**

안녕하세요. CLOVER 운영팀입니다.  
최근 출입통제 및 보안 점검이 강화되어 아래 수칙을 반드시 준수해 주세요.

1. **출입카드 미지참 시** 1층 안내데스크에서 방문증 발급 후 출입해 주세요.  
   - 방문증은 당일 반납이 원칙이며, 미반납 시 재발급이 제한될 수 있습니다.
2. **외부인 동반 출입 금지**  
   - 협력업체/방문객은 담당자 사전 등록 필수이며, 등록되지 않은 외부인은 출입이 불가합니다.
3. 퇴근 시 **PC 잠금(Windows+L)** 및 **서랍/캐비닛 잠금**을 확인해 주세요.  
   - 문서/USB 등 중요자료는 반드시 잠금 보관 바랍니다.
4. 분실/도난 발생 시 즉시 운영팀(내선 3030)으로 연락 바랍니다.  
   - 분실 신고 지연으로 발생한 피해는 이용자 책임이 될 수 있습니다.
5. 야간 출입(22:00~06:00)은 예약자 본인만 가능하며, 출입 기록이 자동 저장됩니다.  
   - 이상 출입 감지 시 보안팀이 확인 연락을 드릴 수 있습니다.

* 적용일: 2026년 3월 5일(목)부터  
* 문의: 운영팀 / 내선 3030 (평일 09:00~18:00)

감사합니다.`
            },
            {
                id: 4,
                title: "[공지] 강의실 예약 변경/취소 기준 안내",
                author: "관리자",
                date: "2026-03-04",
                content: `---

**[공지] 강의실 예약 변경/취소 기준 안내**

안녕하세요. CLOVER 교육센터입니다.  
예약 변경 및 취소 관련 문의가 많아 아래 기준을 통일하여 안내드립니다.

1. **예약 변경 가능 시간**  
   - 이용 시작 **24시간 전까지** 변경 가능(시간/호실/인원 포함)  
   - 24시간 이내 변경은 시스템 제한 또는 운영팀 승인 필요
2. **예약 취소 및 환불 기준**  
   - 이용 시작 **48시간 전 취소: 100% 환불**  
   - 이용 시작 **24~48시간 전 취소: 70% 환불**  
   - 이용 시작 **24시간 이내 취소: 환불 불가**
3. **무단 미사용(No-show) 처리**  
   - 예약 후 미입실 시 No-show로 기록되며, 누적 시 예약 제한될 수 있습니다.
4. **입실/퇴실 시간 준수**  
   - 예약 시간 외 무단 사용(연장 포함) 적발 시 추가 요금 부과 또는 이용 제한
5. **예외 처리(증빙 필요)**  
   - 천재지변/교통사고/응급상황 등은 증빙자료 제출 시 일부 예외 적용 가능

* 적용일: 2026년 3월 4일(수)부터  
* 문의: 고객센터 / 내선 1111

감사합니다.`
            },
            {
                id: 3,
                title: "[공지] 시설 점검 일정 안내(전기/소방)",
                author: "관리자",
                date: "2026-03-03",
                content: `---

**[공지] 시설 점검 일정 안내(전기/소방)**

안녕하세요. CLOVER 시설관리팀입니다.  
센터 안전 강화를 위해 정기 시설 점검을 아래 일정으로 진행합니다.

1. **점검 일시**: 2026년 3월 10일(화) 02:00 ~ 05:00  
2. **점검 항목**  
   - 전기 분전반 점검, 비상조명 테스트, 소방감지기/스프링클러 점검
3. **이용 제한 안내**  
   - 점검 시간 동안 일부 구역 조명/콘센트 사용이 제한될 수 있습니다.  
   - 소방 점검 시 경보음 테스트가 진행될 수 있어 양해 부탁드립니다.
4. **안전 협조**  
   - 점검 구역 출입 제한 시 안내에 따라 이동해 주세요.  
   - 이상 징후 발견 시 즉시 안내데스크로 신고 바랍니다.
5. **예약 이용자 안내**  
   - 야간 이용 예약자는 점검 공지 확인 후 예약을 진행해 주세요.

* 적용일: 2026년 3월 10일(화) 해당  
* 문의: 시설관리팀 / 내선 2020

감사합니다.`
            },
            {
                id: 2,
                title: "[공지] 분실물 보관 및 수령 절차 안내",
                author: "관리자",
                date: "2026-03-02",
                content: `---

**[공지] 분실물 보관 및 수령 절차 안내**

안녕하세요. CLOVER 안내데스크입니다.  
센터 내 분실물 처리 절차를 아래와 같이 안내드립니다.

1. **분실물 접수 장소**  
   - 1층 안내데스크에서 분실물 접수/보관을 진행합니다.
2. **보관 기간**  
   - 일반 물품: 보관일로부터 **14일**  
   - 귀중품(지갑/전자기기): 보관일로부터 **7일**
3. **수령 방법**  
   - 본인 확인 후 수령 가능(신분증 또는 본인 확인 가능한 자료 지참)  
   - 대리 수령 시 위임장 및 대리인 신분증 필요
4. **미수령 물품 처리**  
   - 보관기간 경과 시 내부 규정에 따라 폐기 또는 관할 기관 인계될 수 있습니다.
5. **예방 안내**  
   - 퇴실 전 책상/콘센트 주변/의자 아래를 반드시 확인해 주세요.

* 적용일: 2026년 3월 2일(월)부터  
* 문의: 안내데스크 / 내선 1111

감사합니다.`
            },
            {
                id: 1,
                title: "강의실 이용 수칙 안내",
                author: "관리자",
                date: "2026-03-05",
                content: `---

**[공지] 강의실 이용 수칙 안내**

안녕하세요. CLOVER 교육센터입니다.  
쾌적한 학습 환경 유지를 위해 강의실 이용 수칙을 안내드립니다.

1. **출입 및 이용 권한**  
   - 예약자 및 등록된 이용자만 출입 가능하며 출입 정보 공유는 금지입니다.
2. **정리정돈**  
   - 사용 후 책상/의자 원위치, 쓰레기 분리배출 필수  
   - 퇴실 5분 전 정리정돈을 권장합니다.
3. **시설물/장비 사용**  
   - 빔프로젝터/스크린/화이트보드 사용 후 전원 OFF  
   - 케이블/리모컨 분실 시 비용이 청구될 수 있습니다.
4. **소음 및 매너**  
   - 통화는 복도/라운지 이용(강의실 내 통화 자제)  
   - 민원 발생 시 이용 제한될 수 있습니다.
5. **음식물 반입**  
   - 뚜껑 있는 음료는 가능하나 냄새 강한 음식/배달음식은 제한됩니다.  
   - 오염 발생 시 즉시 정리 바랍니다.

* 적용일: 2026년 3월 5일(목)부터  
* 문의: 운영팀 / 내선 3030

감사합니다.`
            },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    }

    function loadNotices() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function renderList() {
        const tbody = document.getElementById("noticeTbody");
        const emptyBox = document.getElementById("emptyBox");
        const list = loadNotices();

        // 강의실 이용 수칙 안내"는 항상 맨 아래로
        list.sort((a, b) => {
            const isRuleA = (a.title || "").includes("강의실 이용 수칙 안내");
            const isRuleB = (b.title || "").includes("강의실 이용 수칙 안내");
            if (isRuleA && !isRuleB) return 1;
            if (!isRuleA && isRuleB) return -1;

            if (a.date !== b.date) return (a.date < b.date) ? 1 : -1;
            return (b.id || 0) - (a.id || 0);
        });

        tbody.innerHTML = "";

        if (list.length === 0) {
            emptyBox.style.display = "block";
            return;
        }
        emptyBox.style.display = "none";

        list.forEach((n, idx) => {
            const no = String(list.length - idx).padStart(2, "0");

            const tr = document.createElement("tr");
            tr.className = "notice-row";
            tr.dataset.id = String(n.id);

            tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" class="notice-check" data-id="${escapeHTML(n.id)}" />
          </td>
          <td>${no}</td>
          <td>${escapeHTML(n.title)}</td>
          <td>${escapeHTML(n.author || "관리자")}</td>
          <td>${escapeHTML(n.date || todayISO())}</td>
        `;

            // 체크박스 클릭하면 상세로 이동 안 함
            tr.addEventListener("click", (e) => {
                if (e.target && e.target.classList.contains("notice-check")) return;
                window.location.href = `notice_detail.html?id=${encodeURIComponent(n.id)}`;
            });

            tbody.appendChild(tr);
        });
    }

    // init
    seedNoticesByVersion();
    renderList();

    // 추가 페이지 이동
    document.getElementById("addBtn").addEventListener("click", () => {
        window.location.href = "notice_write.html";
    });

    // 선택 삭제
    document.getElementById("deleteSelectedBtn").addEventListener("click", () => {
        const checks = Array.from(document.querySelectorAll(".notice-check:checked"));
        if (checks.length === 0) {
            alert("삭제할 공지사항을 선택해 주세요.");
            return;
        }

        if (!confirm(`선택한 ${checks.length}개의 공지사항을 삭제하시겠습니까?`)) return;

        const idsToDelete = new Set(checks.map(ch => String(ch.dataset.id)));
        const list = loadNotices().filter(n => !idsToDelete.has(String(n.id)));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        alert("선택한 공지사항을 삭제했습니다.");
        renderList();
    });

    // document.addEventListener('click', (e) => {
    //     if (e.target.classList.contains('logoutBtn')) {
    //         console.log("로그아웃 버튼 클릭 감지 됨");
    //         localStorage.removeItem('loginUser');
    //         location.href = "메인페이지.html";
    //     }

    // })

        const loginUser = loadJs("loginUser");
    const delBtn = document.querySelectorAll(".notice-btn");
    console.log(delBtn);
    console.log(loginUser);
    delBtn.forEach(el => {
        if (!loginUser || loginUser.role !== "admin") {
            el.style.display = "none";
        }else if(loginUser && loginUser.role === "admin"){
            el.style.display = "block";
        }
    })

    


})
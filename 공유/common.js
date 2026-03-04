// 1. 외부 HTML(헤더, 푸터)을 불러오는 함수
async function loadHTML(id, path) {
    try {        const response = await fetch(path);

        if (response.ok) {
            const text = await response.text();
            document.getElementById(id).innerHTML = text;

            // 헤더를 불러왔다면 로그인 상태에 따라 상단바 UI 업데이트
            if (id === 'header-include') {
                updateHeaderUI();
            }
        }
    } catch (error) {
        console.error(`${path} 로드 실패:`, error);
    }
}



// 2. 로그인 여부에 따라 헤더의 버튼(로그인/로그아웃 등)을 제어
function updateHeaderUI() {
    const user = JSON.parse(localStorage.getItem("loginUser"));
    const guestMenu = document.getElementById("auth-guest"); // 게스트용 div
    const userMenu = document.getElementById("auth-user");   // 회원용 div

    if (user) {
        if (guestMenu) guestMenu.style.display = "none";
        if (userMenu) userMenu.style.display = "block";
    } else {
        if (guestMenu) guestMenu.style.display = "block";
        if (userMenu) userMenu.style.display = "none";
    }
}

// 3. 로그아웃 기능
function logout() {
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.href = "메인페이지.html"; // 메인 파일명에 맞게 수정
}
window.addEventListener('DOMContentLoaded', () => {
    loadHTML('header-include', './header.html'); // 헤더 파일명 확인 필요
    loadHTML('footer-include', './footer.html'); // 푸터 파일명 확인 필요
});
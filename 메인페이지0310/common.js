//Js 객체화
const loadJs = function (e) {

    const pack = localStorage.getItem(e);

    if (!pack) return null;

    return JSON.parse(pack);
}

//헤더와 푸터 불러오는 함수
const commonLayout = function () {
    Promise.all([
        //text(): 텍스트만 불러옴
        fetch('header.html').then(re => re.text()),
        fetch('footer.html').then(re => re.text())
    ]).then(([head, foot]) => {
        document.querySelector("#header-include").innerHTML = head;
        document.querySelector("#footer-include").innerHTML = foot;
        updateHead();
    }).catch(err => {
        console.log("헤더 푸터 불러오다가 오류남: ", err);
    })
    
};

commonLayout();
const setting = loadJs('User');
const fun = function () {
    if (!setting) {
        fetch('유저.json')
            .then(re => {
                return re.json();
                // localStorage.setItem("User", re);
            })
            .then(data => {
                const pack = JSON.stringify(data);

                localStorage.setItem("User", pack);
            });
    }
}


const resetJs = function () {
    // 모든 로컬스토리 데이터 삭제
    localStorage.clear();
    console.log("로컬스토리지가 완전히 비워졌습니다.");
}


//User라는 키 값에에 저장
const saveJs = function (key, e) {
    const pack = JSON.stringify(e);

    localStorage.setItem(key, pack);
}

//로그인 여부에 따라서 헤더에 마이페이지 , 로그인여부 버튼 나오게

const updateHead = function () {

    const user = loadJs('loginUser');
    const guestMenu = document.getElementById("auth-guest"); // 게스트용 div
    const userMenu = document.getElementById("auth-user");   // 회원용 div
    if (user) {
        if (guestMenu) guestMenu.style.display = "none";
        if (userMenu) userMenu.style.display = "block";
    } else {
        guestMenu.style.display = "block";
        userMenu.style.display = "none";
    }
 initLogo()
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('logoutBtn')) {
        console.log("로그아웃 버튼 클릭 감지 됨");
        localStorage.removeItem('loginUser');
        location.reload();
    }
})
fun();

function initLogo() {
    //로고이미지, 텍스트 클릭시 메인페이지 이동 로직
    const logo = document.querySelector(".logo");
    logo.addEventListener('click', () => {
        console.log("로고 클릭 감지 됨");
        location.href = "./메인페이지.html"

    })

}

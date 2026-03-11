// 페이지가 완전히 뜨면 실행
window.addEventListener('load', async () => {

    // console.log(loadJs('User')[0].name);
    // let testName = loadJs('User');
    // testName[0].name = "김도윤";
    // saveJs('User', testName);
    const loginUser = loadJs('loginUser');
    await loadHTML();
    await loadHTML2();
    console.log("HTML로드 됨");
    if (typeof initAll === 'function') {
        console.log("알레르기 그림");
        initAll();
    }

    //비로그인시 메인 페이지로 돌려 보내는 로직
    if (window.location.pathname.includes('마이페이지.html') && !loginUser) {
        alert("마이페이지는 로그인 이후 이용 가능합니다.")
        location.href = "login.html";
        return;
    }


    async function loadHTML() {
        const response = await fetch('allergy_list.html');
        const text = await response.text();

        // 1. 내용을 div에 삽입
        document.getElementById('al').innerHTML = text;

        // 2. 중요! 불러온 HTML 안에 정의된 함수가 있다면 여기서 호출
        // 하지만 HTML만 불러오면 함수 정의가 안 되어 있을 수 있으므로
        // 식단표 로직(JS)은 메인 페이지에 있거나 별도 파일로 로드되어 있어야 합니다.
        if (typeof updateUI === 'function') {
            updateUI();
        }
    }
    //예약정보 띄우기 위한 경로 및 기타 수정완료
    async function loadHTML2() {
        try {
            const response = await fetch('reservation_information.html');
            const text = await response.text();

            // 1. HTML 삽입
            const container = document.getElementById('사용자예약');
            container.innerHTML = text;

            // 2. 삽입된 HTML 내부의 script 전부 찾아서 실행
            // 기존 코드는 script가 1개일 때만 처리했고,
            // inline script(<script> ... </script>)는 src가 없어서 실행되지 않았음
            const scripts = container.querySelectorAll('script');

            scripts.forEach((oldScript) => {
                const newScript = document.createElement('script');

                // 외부 script인 경우
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    // inline script인 경우
                    newScript.textContent = oldScript.textContent;
                }

                // body에 추가해서 실행
                document.body.appendChild(newScript);

                // 기존 container 안 script 태그는 제거
                oldScript.remove();
            });

            // 3. 만약 초기화 함수가 있다면 실행
            // reservation_information.html 안에서 별도 함수가 있을 경우를 대비
            if (typeof initReservation === 'function') {
                initReservation();
            }

        } catch (error) {
            console.error("HTML 로드 중 오류 발생:", error);
        }
    }
    ////////////////////////////////////////////////////////////////
    //로그인한 유저의 role에 따라서 왼쪽 카테고리 보여주는 동작변경 로직
    const userMenu = document.querySelectorAll(".role-user");
    const adminMenu = document.querySelectorAll(".role-admin");
    if (loginUser.role === "admin") {
        userMenu.forEach(el => {
            el.style.display = "none";
        });
        adminMenu.forEach(el => {
            el.style.display = "block";
        })
    } else {
        userMenu.forEach(el => {
            el.style.display = "block";
        });
        adminMenu.forEach(el => {
            el.style.display = "none";
        })
    }
    //로그아웃 누르면 동작하는 로딩.
    //처음에 버튼 자체에 이벤트 걸었다가, 이벤트가 제대로 걸리지 않아서
    //document에 클릭 이벤트를 걸고, if(classList.contain)로 찾아내서 지정함
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('logoutBtn')) {
            console.log("로그아웃 버튼 클릭 감지 됨");
            localStorage.removeItem('loginUser');
            location.href = "메인페이지.html";
        }
    })


    console.log(loginUser.name);
    console.log(loginUser.id);


    //마이페이지 아이디, 이름 계정 주인에 맞게 보여주는 로직
    const myname = document.querySelector(".mypage-name");
    const myid = document.querySelector(".mypage-id");
    // loginUser = loadJs('loginUser');
    myname.innerText = loginUser.name;
    myid.innerText = loginUser.id;
    //이건 닉네임 input 창에 placeholder 표시
    const myNick = document.querySelector(".mypage-content1-inputT.a-1");
    myNick.setAttribute("placeholder", loginUser.nick);
    //이건 연락처 input 창에 placeholder 표시
    const myPhone = document.querySelector(".mypage-content1-inputT.a-2");
    myPhone.setAttribute("placeholder", loginUser.phone);





    /////////////////////////////////////////////////////////




    // [필수] 헤더와 푸터 연결 (await로 순서 보장)
    // await loadHTML('header-include', './header.html');
    // await loadHTML('footer-include', './footer.html');

    fetch("유저.json").then(res => console.log((res)));
    // localStorage.setItem("유저정보", JSON.stringify(user))
    // 3. 사이드바 메뉴 클릭 이벤트 (탭 전환)
    const menuBtns = document.querySelectorAll(".menu-btn");
    const contents = document.querySelectorAll(".mypage-content");

    menuBtns.forEach((btn, index) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            // 모든 버튼/컨텐츠 초기화 (클래스 제거)
            menuBtns.forEach(b => b.classList.remove("active"));
            contents.forEach(c => c.classList.remove("activeM"));

            // 클릭한 것만 활성화
            btn.classList.add("active");
            if (contents[index]) contents[index].classList.add("activeM");
        });
    });
    //결제 페이지에서 사용자 예약정보 페이지로 가기 위한 코드
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");

    if (tab === "reservation") {
        menuBtns.forEach(b => b.classList.remove("active"));
        contents.forEach(c => c.classList.remove("activeM"));

        const reservationMenu = Array.from(menuBtns).find(
            btn => btn.textContent.trim() === "사용자 예약정보"
        );

        const reservationContent = document.getElementById("mypage-content4");

        if (reservationMenu) reservationMenu.classList.add("active");
        if (reservationContent) reservationContent.classList.add("activeM");
    }

    ////////////////////////////////////////////////////////////////////

    /////////닉네임 중복확인 버튼 클릭시 닉네임이 정규표현식에 맞는지 검토.
    const statusNickChk = document.querySelector(".nickChk");
    let saveNick = loginUser.nick;

    // console.log(statusNick);
    statusNickChk.addEventListener('click', () => {
        const statusNick = document.querySelector(".mypage-content1-inputT.a-1");
        const stn = statusNick.value.trim();
        if (stn.length < 2) {
            alert("닉네임은 최소 2글자 부터 사용 가능합니다.");
            return;
        } else if (stn.length > 8) {
            alert("닉네임은 최대 8글자까지 사용 가능합니다.");
            return;
        }
        //정규 표현식 사용! 한글, 영문, 숫자가 아닌 것 변수에 저장.
        const regex = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/;  //^랑$ 는 test()쓸 때 사용 함
        if (!regex.test(stn)) {
            alert("닉네임은 한글, 영문, 숫자만 사용하실 수 있습니다.");
        } else {
            saveNick = stn;
            alert("사용 가능하신 닉네임입니다.");
        }



    })//핸드폰 번호 숫자만 들어가는 이벤트

    const phoneNumber = document.querySelector(".mypage-content1-inputT.a-2");
    phoneNumber.addEventListener('input', (e) => {

        const regex = /[^0-9]/g;  //g는 전체를 둘러보는거임 그러지 않으면
        //첫 번째 글자만 검열하고 끝내버림.
        //만약 g를 붙이지 않으면 사용자가 복붙 했을 때 그대로 적용됨
        //g를 붙여 사용 함으로써 replace가 실행될 때 입력된 문자열 전체를 훑어봄

        // e.target: e는 발생한 이벤트의 정보를 담고 있을뿐이고 이벤트가 실제로
        //발생하는 대상은 e.target이 된다.
        phoneNumber.value = e.target.value.replace(regex, "");
    })//핸드폰 번호 숫자만 들어가는 이벤트 종료

    //핸드폰 인증번호 발송 버튼 이벤트
    let c;
    const phoneChk = document.querySelector(".phoneChk");
    let flag = false;
    phoneChk.addEventListener('click', () => {

        if (flag) {
            alert("이미 인증이 진행중입니다.");
            return;
        } else {
            flag = true;
        }
        if (phoneNumber.value.trim().length !== 13) {
            alert("핸드폰 번호 13자리를 제대로 입력해주세요.");
        } else {
            alert("인증번호를 전송 하였습니다.");
            let a = document.createElement("span");
            // let b = document.createElement("input");
            // let bb = document.createElement("button");
            // bb.type = "button";
            // bb.style.width = "100px";
            // bb.innerText = "인증번호 확인";
            // bb.style.height = "25px";
            // bb.style.border = "2px solid black";
            // bb.style.fontWeight = "700";
            // bb.style.borderRadius = "5px";
            // b.style.width = "150px";
            // b.style.height= "25px";
            // b.style.border = "2px solid black";
            // b.style.borderRadius = "5px";
            // b.style.marginLeft = "5px";
            a.innerText = "";
            a.style.color = "red";
            a.style.fontSize = "12px";
            a.style.fontWeight = "700";
            a.style.marginLeft = "5px";
            phoneChk.after(a);
            // a.after(b);
            // b.after(bb);

            //버튼 클릭시 나오는 3:00에 셋인터벌로 1초씩 차감 시키기
            // let b = a.innerText;
            let e = 180;

            c = setInterval(() => {
                // let d = b.split(":");
                let m = 0;
                let s = 0;
                m = Math.floor(e / 60);
                s = (e % 60);
                // console.log(m);
                // console.log(s);
                // console.log(e);
                if (m <= 10 && s <= 9) {
                    a.innerText = "0" + m + ":" + "0" + s;
                } else if (m <= 10 && s > 0) {
                    a.innerText = "0" + m + ":" + s;
                }

                // if (s <= 0) {
                //     a.innerText = m + ":" + s + "0";
                // } else {
                //     a.innerText = m + ":" + s;
                // }
                e--;
                if (e < 0) {
                    e = 180;
                    flag = false;
                    a.innerText = "";
                    clearInterval(c);
                }
            }, 1000)

        }
    }) //핸드폰 인증번호 발송 버튼 이벤트 종료

    //email 아이디 부분 이벤트
    const emailId = document.querySelector(".a-3");
    emailId.addEventListener('input', (e) => {
        const regex = /[^ㄱ-ㅎ가-힣a-zA-Z0-9]/g;

        e.target.value = e.target.value.replace(regex, "");
    })//email 아이디 부분 이벤트 종료

    //email 도메인 부분 이벤트
    const emailDomain = document.querySelector(".a-4");
    emailDomain.addEventListener('input', (e) => {
        const regex = /[^ㄱ-ㅎ가-힣a-zA-Z0-9.]/g;

        e.target.value = e.target.value.replace(regex, "");
    })  //email 도메인 부분 이벤트 종료

    //email select박스 체인지 함수
    const email_select = document.querySelector("#email-select");
    email_select.addEventListener('change', (e) => {
        if (e.target.value === "직접입력") {
            emailDomain.value = "";
        } else {
            emailDomain.value = e.target.value;
        }
    })   //email select박스 체인지 함수 종료

    //생년월일  년도 셀렉트 박스에 값 채우기

    //년도 50개 추가
    const birthY = document.querySelector("#birth-y");
    for (i = 0; i < 50; i++) {
        let year = 1963 + i;
        let a = document.createElement("option");
        a.setAttribute("value", year);
        a.innerText = year;
        birthY.append(a);
    }

    //1월~12월 추가
    const birthM = document.querySelector("#birth-m");
    for (i = 1; i <= 12; i++) {
        let a = document.createElement("option");

        const sliceM = ("0" + i).slice(-2);
        a.setAttribute("value", sliceM);
        a.innerText = sliceM;
        birthM.append(a);
    }

    //1일~31일 추가
    const birthD = document.querySelector("#birth-d");
    for (i = 1; i <= 31; i++) {
        let a = document.createElement("option");
        let sliceD = ("0" + i).slice(-2);
        a.setAttribute("value", sliceD);
        a.innerText = sliceD;
        birthD.append(a);
    }

    //생년월일 정보 연동하는 로직
    let birthCut = loginUser.birth.split("-");
    console.log(birthCut);
    birthY.value = birthCut[0];
    birthM.value = birthCut[1];
    birthD.value = birthCut[2];

    //양력 음력 checked 로직
    let diddma = document.querySelectorAll('[name = "diddma"]');
    diddma.forEach(el => {
        if (loginUser.diddma === "양력") {
            diddma[0].checked = true;
        } else {
            diddma[1].checked = true;
        }
    })

    //이메일 plcaeholder 로직
    // let emailId = document.querySelector(".mypage-content1-inputT.a-3");
    let emailDo = document.querySelector(".mypage-content1-inputT.a-4");
    const emailU = loginUser.email.split("@");
    emailId.setAttribute("placeholder", emailU[0]);
    emailDo.setAttribute("placeholder", emailU[1]);


    //성별 checked 로직
    const gender = document.querySelectorAll('[name = "gender"]');
    gender.forEach(el => {
        if (loginUser.gender === "남성") {
            gender[0].checked = true;
        } else if (loginUser.gender === "여성") {
            gender[1].checked = true;
        } else {
            gender[2].checked = true;
        }
    })

    // 회원정보 변경 확인 버튼 클릭
    const statusNick = document.querySelector(".mypage-content1-inputT.a-1");
    const mpgBtn1 = document.querySelector(".mypage-content1-btn.b1");
    mpgBtn1.addEventListener('click', () => {
        const allUser = loadJs("User");
        console.log("버튼1 클릭");
        // if (phoneNumber.value.length === phoneNumber.maxlength) {
        //     alert("저장 되었");
        // }
        //닉네임 변경 후 로컬스토리지까지 바꾸는 로직
        loginUser.nick = saveNick;
        // saveJs("loginUser", loginUser);
        // saveJs("User", loginUser)
        statusNick.value = "";
        statusNick.setAttribute("placeholder", loginUser.nick);


        //생년월일 변경 로직(로컬스토리지), 화면 동작
        birthCut[0] = birthY.value;
        birthCut[1] = birthM.value;
        birthCut[2] = birthD.value;
        loginUser.birth = birthCut[0] + "-" + birthCut[1] + "-" + birthCut[2];
        // saveJs("loginUser", loginUser);
        // saveJs("User", loginUser);


        //양력, 음력 변경 로직(로컬스토리지), 화면 동작
        if (diddma[0].checked) {
            loginUser.diddma = "양력";
        } else if (diddma[1].checked) {
            loginUser.diddma = "음력";
        }

        //이메일 변경 로직(로컬스토리지), 화면 동작

        // console.log("emailU[0]: ",emailU[0]);
        if (emailId.value !== "" && emailDo.value !== "") {
            const saveEmail = emailId.value + "@" + emailDo.value;
            loginUser.email = saveEmail;
        }

        //성별 변경 로직(로컬스토리지), 화면 동작
        if (gender[0].checked) {
            loginUser.gender = "남성";
        } else if (gender[1].checked) {
            loginUser.gender = "여성";
        } else {
            loginUser.gender = "비공개";
        }


        if (allUser && Array.isArray(allUser)) {

            const uIndex = allUser.findIndex(u => u.id === loginUser.id);
            if (uIndex !== -1) {
                allUser[uIndex] = loginUser;
                saveJs("User", allUser);
            }
        }
        saveJs("loginUser", loginUser);
        alert("변경되었습니다.");
        location.reload();
    })


    //현재 비밀번호 문자 입력 로직
    const pw0 = document.querySelector(".pw0");
    pw0.addEventListener('input', (e) => {
        const regex = /[^a-zA-Z0-9!@#$%^&*()_+|[\]{}'";:/?.>,<]/g;
        //정규표현식 검열 로직
        e.target.value = e.target.value.replace(regex, "");
    })
    //새 비밀번호 일치 체크 로직
    const newPw1 = document.querySelector(".new-pw1");
    const newPw2 = document.querySelector(".new-pw2");
    const newpw_text1 = document.querySelector(".newpw-text1");
    const newpw_text2 = document.querySelector(".newpw-text2");

    //새 비밀번호 체크 로직
    newpw_text1.style.display = "none";
    newpw_text2.style.display = "none";

    //span //비밀번호는 8자 이상부터 사용 가능합니다.
    const pw1_span = document.querySelector(".new-pw1-span");
    pw1_span.style.display = "none";

    //비밀번호 보안 강도 : 상중하 DOM
    const lockTier = document.querySelector(".lock-tier");
    const tier = document.querySelectorAll(".tier");
    console.log(tier[0]);
    lockTier.style.display = "none";
    // for (i = 0; i < tier.length; i++) { //힐링용 포문...
    //     tier[i].style.display = "none";
    // }

    newPw1.addEventListener("input", (e) => {
        // console.log("input", newpw_text1.innerText.length, newpw_text2.innerText.length);
        const regex = /[^a-zA-Z0-9!@#$%^&*()_+|[\]{}'";:/?.>,<]/g;
        const regex2 = /\s/g;

        //정규표현식 검열 로직
        e.target.value = e.target.value.replace(regex2, "");//스페이스바 거부
        e.target.value = e.target.value.replace(regex, "");

        const val = e.target.value;

        const number = /[0-9]/.test(val);
        const notNT = /[!@#$%^&*()_+|[\]{}'";:/?.>,<]/.test(val);

        if (val.length > 0 && val.length < 8) {
            pw1_span.style.display = "block";
            lockTier.style.display = "none";
        } else {
            lockTier.style.display = "block";
            pw1_span.style.display = "none";
        }
        if (!val.length) { //글자 수:0일 때 보안강도 상중하 숨김
            lockTier.style.display = "none";
        }

        tier.forEach(e => e.style.display = "none");

        //보안강도: 상중하 로직

        if (val.length >= 11 && number && notNT) {
            //상
            tier[0].style.display = "inline-block";
        } else if (val.length >= 9 && (number || notNT)) {
            //중
            tier[1].style.display = "inline-block";
        } else if (val.length >= 8) {
            //하
            tier[2].style.display = "inline-block";
        }
        //일치, 불일치 디스플레이 논 블럭 로직
        if (!val.length && !newPw2.value.length) {
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
        } else {
            if (newPw1.value !== newPw2.value) {
                newpw_text2.style.display = "none";
                newpw_text1.style.display = "block";
            } else if (newPw1.value === newPw2.value) {
                newpw_text2.style.display = "block";
                newpw_text1.style.display = "none";
            }
        }
    })

    //새 비밀번호 확인 체크 로직
    newPw2.addEventListener("input", (e) => {

        const regex = /[^a-zA-Z0-9!@#$%^&*()_+|[\]{}'";:/?.>,<]/g;
        const regex2 = /\s/g;
        //정규표현식 검열 로직
        e.target.value = e.target.value.replace(regex2, ""); // 스페이스바 거부
        e.target.value = e.target.value.replace(regex, "");

        if (!e.target.value.length && !newPw1.value.length) {
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
        } else {
            if (newPw1.value !== newPw2.value) {
                newpw_text1.style.display = "block";
                newpw_text2.style.display = "none";
            } else if (newPw1.value === newPw2.value) {
                newpw_text1.style.display = "none";
                newpw_text2.style.display = "block";
            }
        }
    })

    //마이페이지 2번째 확인버튼 로직
    const okBtn = document.querySelector(".mypage-content1-btn.b2");
    okBtn.addEventListener('click', () => {
        const qwe = "qwertyuiopasdfghjklzxcvbnm";
        const a123 = "01234567890";
        let a = newPw1.value;
        let b = newPw2.value;
        let c = pw0.value;
        const regex = /(\w)\1\1/;


        // if (pw0.value.length < 8) {
        //     alert("현재 비밀번호를 제대로입력하세요");
        //     pw0.value = "";
        //     newPw1.value = "";
        //     newPw2.value = "";
        //     newpw_text1.style.display = "none";
        //     newpw_text2.style.display = "none";
        //     lockTier.style.display = "none";
        //     return;
        // }
        // if (regex.test(pw0.value)) {
        //     alert("현재 비밀번호가 잘못되었습니다.")
        //     return;
        // }

        if (a < 8 || b < 8) {
            alert("비밀번호는 최소 8자 이상부터 사용 가능합니다.");
            newPw1.value = "";
            newPw2.value = "";
            pw0.value = "";
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
            lockTier.style.display = "none";
            return;
        }
        if (regex.test(a) || regex.test(b)) {
            alert("연속된 문자를 3회이상 사용하실 수 없습니다.");
            newPw1.value = "";
            newPw2.value = "";
            pw0.value = "";
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
            lockTier.style.display = "none";
            return;
        }
        if (a !== b) {
            alert("새로 설정하실 비밀번호 두 개가 서로 일치하지 않습니다.");
            newPw1.value = "";
            newPw2.value = "";
            pw0.value = "";
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
            lockTier.style.display = "none";
            return;
        }

        for (let i = 0; i < a.length - 2; i++) {
            let z = a.charCodeAt(i);
            let x = a.charCodeAt(i + 1);
            let c = a.charCodeAt(i + 2);
            let triple = a.substring(i, i + 3).toLowerCase();
            const isChk = ((x - z === 1 && c - x === 1) || (x - z === -1 && c - x === -1));
            const isKey = qwe.includes(triple) || a123.includes(triple);
            if (isChk || isKey) {
                alert("연속 된 문자/숫자, 연결되는 키보드 배열은 3개이상 사용하실 수 없습니다.");
                newPw1.value = "";
                newPw2.value = "";
                pw0.value = "";
                newpw_text1.style.display = "none";
                newpw_text2.style.display = "none";
                lockTier.style.display = "none";
                return;
            }



        }
        // for (let i = 0; i < c.length - 2; i++) {
        //     let z = c.charCodeAt(i);
        //     let x = c.charCodeAt(i + 1);
        //     let v = c.charCodeAt(i + 2);
        //     if ((x - z === 1 && v - x === 1) || (x - z === -1 && v - x === -1)) {
        //         alert("현재 비밀번호가 잘못되었습니다. 다시 확인해주세요");
        //         newPw1.value = "";
        //         newPw2.value = "";
        //         pw0.value = "";
        //         newpw_text1.style.display = "none";
        //         newpw_text2.style.display = "none";
        //         lockTier.style.display = "none";
        //         return;
        //     }
        // }
        if (c !== loginUser.pw) {
            alert("현재 사용중인 비밀번호가 일치하지 않습니다.");
            newPw1.value = "";
            newPw2.value = "";
            pw0.value = "";
            lockTier.style.display = "none";
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
            return;
        } else if (c === loginUser.pw) {
            loginUser.pw = newPw1.value;
            saveJs("loginUser", loginUser);
            const allUser = loadJs("User");

            //직역: allUser가 true이면서 allUser가 배열의 형태이면
            if (allUser && Array.isArray(allUser)) {
                const uIndex = allUser.findIndex(u => u.id === loginUser.id);

                //index는 음수가 될 수 없음으로 !== -1은 있다면 이 된다
                if (uIndex !== -1) {
                    allUser[uIndex].pw = loginUser.pw;
                    saveJs("User", allUser);
                }
            }
            newPw1.value = "";
            newPw2.value = "";
            pw0.value = "";
            // saveJs("User", loginUser);
            lockTier.style.display = "none";
            newpw_text1.style.display = "none";
            newpw_text2.style.display = "none";
            alert("비밀번호가 정삭적으로 변경되었습니다.");
            location.reload();
        }
    })
    ////////////////////////////////////////////////////////////
    //회원 탈퇴  페이지
    ////////////////////////////////////////////////////////////


    //비밀번호 확인 로직
    const delete_pw_input = document.querySelector(".delete-pw-input");
    delete_pw_input.addEventListener('input', (e) => {
        const regex = /[^a-zA-Z0-9!@#$%^&*()_+|[\]{}'";:/?.>,<]/g;
        const regex2 = /\s/g;
        e.target.value = e.target.value.replace(regex, "");
        e.target.value = e.target.value.replace(regex2, "");
    })
    //탈퇴 버튼 클릭시
    const deleteBtn = document.querySelector(".delete-btn");
    deleteBtn.addEventListener('click', () => {

        //이용약관 체크 안 돼있을 경우
        const deleteChk = document.querySelector(".deleteChk");
        if (!deleteChk.checked) {
            alert("탈퇴를 원하실 경우 위 약관에 동의하여야합니다")
        }
        const qwe123 = "qwertyuiopasdfghjklzxcvbnm01234567890";
        let a = delete_pw_input.value;
        // for (let i = 0; i < a.length - 2; i++) {
        //     let z = a.charCodeAt(i);
        //     let x = a.charCodeAt(i + 1);
        //     let c = a.charCodeAt(i + 2);
        //     let triple = a.substring(i, i + 3).toLowerCase();
        //     const isKey = qwe123.includes(triple);
        // if (a.length < 8) {
        //     alert("비밀번호가 올바르지 않습니다. 다시 확인해주세요");
        //     delete_pw_input.value = "";
        //     deleteChk.checked = false;
        //     return;
        // }
        // if ((x - z === 1 && c - x === 1) || (x - z === -1 && c - x === -1)) {
        //     alert("비밀번호가 올바르지 않습니다. 다시 확인해주세요");
        //     delete_pw_input.value = "";
        //     deleteChk.checked = false;
        //     return;
        // }
        // if (isKey) {
        //     alert("비밀번호가 올바르지 않습니다. 다시 확인해주세요.");
        //     delete_pw_input.value = "";
        //     deleteChk.checked = false;
        //     return;
        // }
        // }
        const loadUs = loadJs("loginUser");
        if (loadUs.pw !== delete_pw_input.value) {
            alert("현재 비밀번호가 일치하지 않습니다.");
            delete_pw_input.value = "";
            return;
        }
        const result = confirm("정말로 회원 탈퇴를 진행하시겠습니까?");
        if (!result) {
            ////////
            alert("탈퇴가 취소되었습니다.");
            delete_pw_input.value = "";
            deleteChk.checked = false;
            return;
        } else {
            const loginUser = loadJs('loginUser');
            const allUsers = loadJs('User');
            console.log(loadJs('loginUser'));
            const upadataUsers = allUsers.filter(e => e.id !== loginUser.id);
            saveJs('User', upadataUsers);
            localStorage.removeItem('loginUser');
            alert("탈퇴가 정상적으로 처리되었습니다.");

            deleteChk.checked = false;

            location.href = "메인페이지.html";

            return;
        }
    })

    //////////////////////////////////////////////////////////////////////////////
    //어드민 계정 페이지 관리

    //////////////////////////////////////////////////
    //Dashboard///////////////////////////////////////
    //////////////////////////////////////////////////

    //Total Users 인원수 증가 로직




    // console.log("totalNum: ", totalNum);
    const totalUplus = setInterval(() => {
        //전체 방문자수 추가하는 로직
        let totalUser = document.querySelector(".widget-value.text-primary");
        let totalNum = Number(totalUser.innerText.replace(/[^0-9]/g, ""));
        let ran = (Math.floor(Math.random() * 10));
        ran -= 5;
        if (ran < 0) {
            ran = 0;
        }

        totalNum += ran;
        //toLocaleString: 1000숫자 > 1,000으로 됨
        totalUser.innerHTML = `${totalNum.toLocaleString()}<span class="text-sm text-gray"> 명</span>`;
        // let aud = document.createElement("span");
        // aud.innerText = "명";
        // aud.classList.add("text-sm text-gray");
        // totalUser.append(aud);

        //어제 대비 +x명 추가되는 로직
        let djwp = document.querySelector(".widget-desc.p-1");
        let djwpNumber = Number(djwp.innerText.replace(/[^0-9]/g, ""));
        djwpNumber += ran;
        // console.log(djwpNumber);
        djwp.innerHTML = ` 어제 대비 +${djwpNumber} 명;`

        //Active Sessions 변경 로직
        let AcSessions = document.querySelector(".widget-value.text-success");
        let ran2 = Math.floor(Math.random() * 10) - 5;
        AcSessions.innerText = Number(AcSessions.innerText) + ran2;
        if (Number(AcSessions.innerText) < 0) {
            AcSessions.innerText = 0;
        }

    }, 1000 * 2)


    /////////////////////////////////////
    //////////Users 카테고리 로직/////////
    /////////////////////////////////////


    ///유저가 많아서 30명씩 끊어서 보여주는 로직
    let startpage = 1;
    const maxUserpage = 30;

    const loadUserList = function () {
        let allUser = loadJs("User");
        const usersTable = document.querySelector("#users-table-body");
        usersTable.innerHTML = "";

        const startIndex = (startpage - 1) * maxUserpage;
        const endIndex = startIndex + maxUserpage;
        const pageUser = allUser.slice(startIndex, endIndex);

        pageUser.forEach((e, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${e.id}</td>
        <td>${e.name}</td>
        <td>${e.email}</td>
        <td>${e.role}</td>
        <td><button type="button" class = "btn-del" style = "width: 70px; border: 2px solid block; border-radius: 5px;">삭제</button></td>
        `;
            usersTable.append(tr);
        })

        //30명씩 나눠서 인원에 맞게 페이지 버튼 추가

        const totalPage = Math.ceil(allUser.length / maxUserpage);
        const usersBody = document.querySelector("#pagination-container");
        usersBody.innerHTML = "";
        for (let i = 1; i <= totalPage; i++) {
            const pageBtn = document.createElement("button");
            pageBtn.type = "button";
            pageBtn.innerText = i;
            pageBtn.style.display = "inline-block";
            pageBtn.style.width = "40px";
            pageBtn.style.borderRadius = "5px";
            pageBtn.style.border = "2px solid block"
            pageBtn.style.cursor = "pointer";
            pageBtn.classList.add("page-num-btn");

            if (i === startpage) {
                // pageBtn.classList.add("active");
                pageBtn.style.backgroundColor = "gray";
            }


            pageBtn.addEventListener('click', () => {
                startpage = i;
                loadUserList();
            })
            usersBody.append(pageBtn);

        }

    }
    // function nextPage(){
    //     const allUser = loadJs("User");
    //     if(startpage * maxUserpage < allUser.length){
    //         startpage++;
    //         loadUserList();
    //     }
    // }

    //     function prevPage(){
    //         const allUser = loadJs("User");
    //         if(startpage > 1){
    //             startpage--;
    //             loadUserList();
    //         }
    // }
    loadUserList();

    //어드민이 Users에서 삭제버튼 클릭시 그 유저 탈퇴시키는 로직
    document.addEventListener('click', (el) => {
        if (el.target.classList.contains("btn-del")) {
            const result = confirm("정말로 해당 유저를 탈퇴시키겠습니까?");
            if (!result) return;

            //closest: 본인 포함해서 ()안에 있는 요소를 제일 먼저 갖는 조상을 찾음
            const tr = el.target.closest("tr");
            //children: 본인의 자식요소들을 배열의 형태로 가져옴
            const userId = tr.children[1].innerText;

            let allUser = loadJs("User");
            const updateUser = allUser.filter(e => e.id !== userId);
            saveJs("User", updateUser);

            alert("해당 유저를 탈퇴 처리하였습니다.");
            loadUserList();
        }


    })
});////////window.addEventListner('load')
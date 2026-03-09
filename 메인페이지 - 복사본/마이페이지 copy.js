// 페이지가 완전히 뜨면 실행
window.addEventListener('load', async () => {


    /////////1.회원정보 변경 로직
    ////////////////////////////////////////////////
    // [필수] 헤더와 푸터 연결 (await로 순서 보장)
    await loadHTML('header-include', './header.html');
    await loadHTML('footer-include', './footer.html');
    const savedUser = JSON.parse(localStorage.getItem("loginUser"));
     
    if (!localStorage.getItem("users")) {
        try {
            console.log("users있음");
            const response = await fetch('./유저.json');
            const data = await response.json();
            localStorage.setItem("users", JSON.stringify(data));
            console.log("유저 정보 업데이트 완료");
        } catch (err) {
            console.log("유저 정보 로드 실패", err);
        }//캐치
    } else {
        console.log("이미 users 데이터 존재함");
    }


    if (!savedUser) {
        alert("로그인 세션이 만료되었습니다.");
        location.href = "login.html";
        return;
    }




    //어드민, 유저에 따라 왼쪽 사이드메뉴 보이는 항목 다르게 설정
    const updateSidebar = () => {
        if (!savedUser) {
            alert("로그인이 필요합니다.");
            location.href = "login.html";
            return;
        }

        const role = savedUser.role;

        const userM = document.querySelectorAll(".role-user");
        const userA = document.querySelectorAll(".role-admin");

        if (role === "admin") {
            userM.forEach(el => el.style.display = "none");
            userA.forEach(el => el.style.display = "block");
        } else if (role === "user") {
            userM.forEach(el => el.style.display = "block");
            userA.forEach(el => el.style.display = "none");
        }

    }
    updateSidebar();
    if (savedUser && savedUser.profileImg) {
        const mainImg = document.getElementById("main-img");
        if (mainImg) {
            mainImg.src = savedUser.profileImg;
        }

        const uploadImg = document.querySelector(".change-img");
        if (uploadImg) {
            uploadImg.src = savedUser.profileImg;
        }
    }

    //회원정보 수정 - 이미지 변경 로직
    const fileInput = document.getElementById('profile-upload');
    const profileImg = document.querySelector('.change-img');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const imgSrc = ev.target.result;
                profileImg.src = imgSrc;

                localStorage.setItem("tempProfileImg", imgSrc);
            };
            reader.readAsDataURL(file);
        }
    });
    //회원정보 수정 - 이미지 삭제 로직
    const imgD = document.querySelector(".btn.btn-text.text-danger");
    const defualtImg = "https://i.postimg.cc/5yFbtGCB/binpeulopil-imiji1.png";
    imgD.addEventListener("click", () => {
        profileImg.src = defualtImg;

        fileInput.value = "";

        localStorage.removeItem("tempProfileImg");

    })


    // 1. 유저 정보 가져오기

    if (!savedUser) {
        alert("로그인이 필요합니다.");
        location.href = "login.html"; // 로그인 안 했으면 쫓아내기
        return;
    }

    // 2. 화면에 유저 데이터 뿌리기 (예시: 아이디 하나만 테스트)
    const idInput = document.getElementById("display-id");
    const nameInput = document.getElementById("display-name");
    const nickInput = document.getElementById("display-nickname");
    const birthInput = document.getElementById("display-birth");
    const genderInput = document.getElementById("display-gender");
    const phone1Input = document.getElementById("display-phone1");
    const phone2Input = document.getElementById("display-phone2");
    const phone3Input = document.getElementById("display-phone3");
    const phoneInput = document.getElementById("display-phone");
    const emailInput = document.getElementById("display-email");
    const gtx = document.querySelector(".gtx");
    if (idInput) idInput.value = savedUser.id;
    if (nameInput) nameInput.value = savedUser.name;
    if (nickInput) nickInput.value = savedUser.nick;
    if (birthInput) birthInput.value = savedUser.birth;
    if (genderInput) genderInput.value = savedUser.gender;
    const fullPhone = savedUser.phone;
    if (phoneInput) phoneInput.value = savedUser.phone;
    if (emailInput) emailInput.value = savedUser.email;

    // 3. 사이드바 메뉴 클릭 이벤트 (탭 전환)
    const menuBtns = document.querySelectorAll(".menu-btn");
    const contents = document.querySelectorAll(".mypage-content");


   let currentPage = 1;
    const itemsPerPage = 50; // 변수명 통일

    const displayUsers = () => {
        const userList = JSON.parse(localStorage.getItem("users")) || [];
        const tableB = document.querySelector("#users-table-body");

        if (!tableB) return;
        tableB.innerHTML = "";

        // 1. 현재 페이지 데이터만 자르기
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageUsers = userList.slice(startIndex, endIndex);

        // 2. 전체 리스트가 아니라 '자른 리스트'를 돌려야 함
        currentPageUsers.forEach((u, i) => {
            const tr = document.createElement("tr");

            // 3. No. 계산 로직 적용 (2페이지는 51번부터)
            const userNo = startIndex + i + 1;
            
            tr.innerHTML = `
            <td>${userNo}</td> 
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role === 'admin' ? '관리자' : '일반유저'}</td>
            <td>
                <button class="delete-btn" data-id="${u.id}" style="color: red; cursor: pointer;">삭제</button>
            </td>
            `;
            tableB.appendChild(tr);
        });

        renderPagination(userList.length);
    };

    const renderPagination = (totalItems) => {
        const paginationContainer = document.querySelector("#pagination-container");
        if (!paginationContainer) return;

        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalItems / itemsPerPage); // 오타 수정 완료

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.className = (i === currentPage) ? "page-btn active" : "page-btn";
            btn.style.margin = "0 5px";
            btn.style.cursor = "pointer";

            btn.addEventListener("click", () => {
                currentPage = i; 
                displayUsers(); 
            });
            paginationContainer.appendChild(btn);
        }
    };
    menuBtns.forEach((btn, index) => {
        btn.addEventListener("click", (e) => {
            if (btn.parentElement.classList.contains("role-admin") && savedUser.role !== "admin") {
                alert("관리자만 접근이 가능합니다.");
                return;
            }
            e.preventDefault();
            clearInterval(timeInterval);
            gtx.classList.remove("disb");
            gtx.classList.add("disn");
            // 모든 버튼/컨텐츠 초기화 (클래스 제거)
            menuBtns.forEach(b => b.classList.remove("active"));
            contents.forEach(c => c.classList.remove("activeM"));
            restoreOriginalData();
            // 클릭한 것만 활성화
            btn.classList.add("active");
            if (contents[index]) contents[index].classList.add("activeM");
            // location.reload();

            if (btn.textContent.includes("Users")) {
                console.log("🎯 회원 관리 버튼 인식 성공! 표 그린다!");
                displayUsers();
            }
        });

    });//menuBtn.forEach

    //회원페이지 항목 클릭 시 작성하던거 제거
    function restoreOriginalData() {
        const user = JSON.parse(localStorage.getItem("loginUser"));

        if (!user) return;
        const allInput = document.querySelectorAll("input");
        const allSelects = document.querySelectorAll("select");
        allInput.forEach(el => {
            if (el.type === "text" || el.type === "password") {
                el.value = "";
            }
            if (el.type === "checkbox") {
                el.checked = false;
            }
        })
        allSelects.forEach(el => {
            el.selectedIndex = 0;
        })
        // const nickInput = document.querySelector(".inputnick");
        // if(nickInput){
        //     nickInput.value = "";
        // }
        // const pwInput = document.querySelectorAll(".pwbox");
        // pwInput.forEach(el =>{
        //     el.value = "";
        // })
        // const phoneInput = document.querySelectorAll(".disp");
        // phoneInput.forEach(el=>{
        //     el.value = "";
        // })
    }
    //닉네임 중복확인 로직
    const inputNick = document.querySelector(".input-box.inputnick");
    const doubleChk = document.querySelector(".btn.btn-outline.double-chk");
    doubleChk.addEventListener('click', () => {
        const regex = /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g;
        if (inputNick.value.length < 2 || inputNick.value.length > 8) {
            alert("닉네임은 2~8 글자를 사용 하셔야합니다.");
            return;
        } else if (regex.test(inputNick.value)) {
            alert("닉네임은 한글, 영문, 숫자만 가능합니다.");
        } else {
            alert("사용 가능한 닉네임입니다.")
        }
    })
    //비밀번호 변경 입력한 비밀번호 동일한지 체크하는 로직
    const pwInput = document.querySelectorAll(".input-box.pwbox");
    pwInput[1].addEventListener('input', () => {
        if (pwInput[1].value.length === 0) {
            let red = document.querySelector(".guide-text.red");
            red.innerText = "";
        }
        if (pwInput[1].value !== pwInput[2].value) {
            let red = document.querySelector(".guide-text.red");
            red.style.color = "red";
            red.innerText = "*새로운 비밀번호가 일치하지 않습니다.";
            console.log("같지않음");
        } else if (pwInput[1].value === pwInput[2].value) {
            let red = document.querySelector(".guide-text.red");
            red.style.color = "gray";
            red.innerText = "*새로운 비밀번호가 일치합니다.";
            console.log("같음");
        }
    })
    pwInput[2].addEventListener('input', () => {
        if (pwInput[1].value !== pwInput[2].value) {
            let red = document.querySelector(".guide-text.red");
            red.style.color = "red";
            red.innerText = "*새로운 비밀번호가 일치하지 않습니다.";
            console.log("같지않음");
        } else if (pwInput[1].value === pwInput[2].value) {
            let red = document.querySelector(".guide-text.red");
            red.style.color = "gray";
            red.innerText = "*새로운 비밀번호가 일치합니다.";
            console.log("같음");
        }
    })






    //숫자 외 차단 로직
    const phone1 = document.querySelector("#display-phone1");
    const phone2 = document.querySelector("#display-phone2");
    function removeChars(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
    phone1.addEventListener('input', (e) => {
        removeChars(e);
        if (phone1.value.length === 4) {
            phone2.focus();
        }
    })

    phone2.addEventListener('input', (e) => {
        removeChars(e);
        if (phone2.value.length === 4) {
            checkBtn.focus();
        }
    })
    console.log("테스트");
    const checkBtn = document.querySelector(".check-btn");

    console.log("찾은 버튼:", checkBtn);
    console.log("찾은 가이드텍스트:", gtx);

    let timeInterval;
    checkBtn.addEventListener('click', () => {
        const phone1 = document.querySelector("#display-phone1");
        const phone2 = document.querySelector("#display-phone2");
        const isPhone1Valid = phone1.value.length === 4 && !isNaN(phone1.value);
        const isPhone2Valid = phone2.value.length === 4 && !isNaN(phone2.value);
        // gtx.style.display = "block";

        console.log("클릭성공");



        if (isPhone1Valid && isPhone2Valid) {
            alert("인증번호를 발송하였습니다.");
            const check6number = document.querySelector(".input-box.short.disp");
            check6number.focus();
            gtx.classList.remove("disn");
            gtx.classList.add("disb");
            const timeDisplay = document.querySelector(".gtx");
            let totalSeconds = 180;

            if (timeInterval) clearInterval(timeInterval);

            timeInterval = setInterval(() => {
                if (totalSeconds >= 0) {
                    let minutes = Math.floor(totalSeconds / 60);
                    let seconds = totalSeconds % 60;

                    minutes = String(minutes).padStart(2, '0');
                    seconds = String(seconds).padStart(2, '0');

                    timeDisplay.textContent = `${minutes}:${seconds}`;
                    totalSeconds--;
                } else {
                    clearInterval(timeInterval);
                }
            }, 1000)
        }

    });


    const inputBox2 = document.querySelector(".input-box2");
    const inputBox = document.querySelector(".input-box.select-box");
    inputBox.addEventListener('change', () => {
        inputBox2.value = inputBox.value;
    })

    //수정하기 버튼 누르면~
    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener('click', () => {
        console.log("버튼누름!");
        //창고에서 꺼냄
        const user = JSON.parse(localStorage.getItem("loginUser"));

        const uploadImg = document.querySelector(".change-img");
        const mainImg = document.getElementById("main-img");
        if (uploadImg && user) {
            if (mainImg) {
                mainImg.src = uploadImg.src;
            }

            user.profileImg = uploadImg.src;

            localStorage.setItem("loginUser", JSON.stringify(user));
        }

        alert("회원정보를 변경하였습니다.");
        location.reload();
    })


    //////////회원 탈퇴
    ///////////////////////////////////////////////////////
    const withdraw = document.querySelector(".withdraw-input");
    const customChk = document.querySelector("#withdraw-agree");
    const btnWithdraw = document.querySelector(".btn-withdraw");

    btnWithdraw.addEventListener("click", () => {
        const loginUser = JSON.parse(localStorage.getItem("loginUser"));




        console.log("내 실제 비번:", loginUser.pw); // 이게 제대로 나오는지 확인
        console.log("내가 입력한 비번:", withdraw.value);
        const myPw = loginUser.pw;
        if (!customChk.checked) {
            alert("위 약관에 동의하셔야 탈퇴가 가능합니다.");
            return;
        }
        if (myPw !== withdraw.value) {
            alert("비밀번호를 확인하세요.");
            withdraw.value = "";
            withdraw.focus();
            return;
        }

        if (confirm("정말로 탈퇴하시겠습니까?")) {
            //로그인한 아이디 정보
            const loginUser = JSON.parse(localStorage.getItem("loginUser"));
            //전체 회원 명단
            let userList = JSON.parse(localStorage.getItem("users")) || [];
            //로그인한 아이디랑 유저 아이디가 일치하지 않는 아이디(계정만 남김);
            userList = userList.filter(user => user.id !== loginUser.id);
            //삭제된 버전 회원 명단 다시 저장
            localStorage.setItem("users", JSON.stringify(userList));

            localStorage.removeItem("loginUser");
            alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
            location.href = "메인페이지.html";
        }


    })//btnWithdraw.클릭이벤트




});//로드 이벤트
//어드민 계정 유저관리 페이지 로직

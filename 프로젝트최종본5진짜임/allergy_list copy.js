function initAll(){
    console.log("3. initAll 함수 진입 완료");
        const allergies = ["대두", "토마토", "닭고기", "쇠고기", "밀", "게", "새우", "돼지고기", "오징어", "조개류", "고등어", "난류", "메밀", "복숭아", "호두"];
    const sourceList = document.getElementById('sourceList');
    const targetList = document.getElementById('targetList');

    if (!sourceList || !targetList) {
        console.error("리스트 박스를 찾을 수 없습니다. HTML의 ID를 확인하세요.");
        return;
    }

    // 항목 생성 함수
    function createItem(name, container, btnText) {
        const div = document.createElement('div');
        div.className = 'allergy-item-row';

        // 제거 버튼일 경우 빨간색 효과를 위해 클래스 추가 (제공해주신 코드 로직 유지)
        const extraClass = (btnText === '제거') ? 'remove-btn' : '';

        div.innerHTML = `
            <span class="item-name">${name}</span>
            <button class="action-btn ${extraClass}">${btnText}</button>
        `;

        // 버튼 클릭 시 이동 로직
        div.querySelector('.action-btn').onclick = function () {
            div.remove();
            if (btnText === '추가') {
                createItem(name, targetList, '제거');
            } else {
                createItem(name, sourceList, '추가');
            }
        };

        container.appendChild(div);
    }

    // 초기 데이터 로딩 (왼쪽 리스트에 뿌려주기)
    allergies.forEach(name => createItem(name, sourceList, '추가'));
}
// async function loadHTML() {
//     const response = await fetch('allergy_list.html');
//     const text = await response.text();
    

//     document.getElementById('al').innerHTML = text;



// }
/**
 * [🎯 로컬 스토리지 저장 및 페이지 이동]
 * 선택 완료 버튼을 누르면 실행되는 함수
 */
function saveSelection() {
    const selectedItems = [];

    // 오른쪽 '표시 될 알레르기 항목'에 들어있는 이름들만 수집
    const items = document.querySelectorAll('#targetList .item-name');

    items.forEach(item => {
        selectedItems.push(item.innerText);
    });

    if (selectedItems.length === 0) {
        const confirmSave = confirm("선택된 항목이 없습니다. 이대로 저장할까요?");
        if (!confirmSave) return;
    }

    // 1. 브라우저 창고(로컬 스토리지)에 'userAllergies'라는 이름으로 저장
    localStorage.setItem('userAllergies', JSON.stringify(selectedItems));

    alert("알레르기 정보가 저장되었습니다. 마이페이지로 이동합니다.");

    // 2. 팀원이 만든 마이페이지 파일명으로 이동
    // location.href = "mypage.html";
    
}
console.log("스크립트 파일 로드");
// 스크립트 파일 맨 마지막에 추가
// loadHTML();
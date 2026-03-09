window.onload = function () {
  /*
    =========================================================
    [1] 공통 DOM 잡기용 함수
    ---------------------------------------------------------
    - document.getElementById()를 매번 길게 쓰지 않으려고 만든 함수
    - 아래에서 getDom("menuBoard") 이런 식으로 계속 사용할 예정
    =========================================================
  */
  function getDom(id) {
    return document.getElementById(id);
  }

  /*
    =========================================================
    [2] 메뉴 버튼 DOM
    ---------------------------------------------------------
    - 좌측 사이드 메뉴에서 사용하는 버튼들
    - menuBoard : 전체 게시글 화면
    - menuMy    : 내 소식 화면
    =========================================================
  */
  const menuBoard = getDom("menuBoard");
  const menuMy = getDom("menuMy");

  /*
    =========================================================
    [3] 페이지 영역 DOM
    ---------------------------------------------------------
    - 한 HTML 안에서 화면을 3개처럼 바꿔 보여주기 위해 사용
    - pageBoard  : 전체 게시글 목록
    - pageMy     : 내 소식
    - pageDetail : 게시글 상세
    =========================================================
  */
  const pageBoard = getDom("pageBoard");
  const pageMy = getDom("pageMy");
  const pageDetail = getDom("pageDetail");

  /*
    =========================================================
    [4] 목록/상세 출력용 DOM
    ---------------------------------------------------------
    - boardList     : 전체 게시글 목록이 들어가는 곳
    - popularList   : 인기글 목록이 들어가는 곳
    - myPostList    : 내가 작성한 글 목록
    - myCommentList : 내가 작성한 댓글 목록
    - detailArea    : 게시글 상세 화면 전체 출력 영역
    =========================================================
  */
  const boardList = getDom("boardList");
  const popularList = getDom("popularList");
  const myPostList = getDom("myPostList");
  const myCommentList = getDom("myCommentList");
  const detailArea = getDom("detailArea");

  /*
    =========================================================
    [5] 글쓰기 관련 DOM
    ---------------------------------------------------------
    - 글쓰기 패널 열기 / 닫기 / 저장에 쓰는 요소들
    =========================================================
  */
  const openWritePanelBtn = getDom("openWritePanelBtn");
  const writePanel = getDom("writePanel");
  const postTitleInput = getDom("postTitleInput");
  const postContentInput = getDom("postContentInput");
  const postTagInput = getDom("postTagInput");
  const postThumbInput = getDom("postThumbInput");
  const savePostBtn = getDom("savePostBtn");
  const cancelPostBtn = getDom("cancelPostBtn");

  /*
    =========================================================
    [6] 상세 화면 버튼 DOM
    ---------------------------------------------------------
    - detailBackBtn : 상세 화면에서 이전 목록으로 돌아가는 버튼
    =========================================================
  */
  const detailBackBtn = getDom("detailBackBtn");

  /*
    =========================================================
    [7] 내 소식 정렬 버튼 DOM
    ---------------------------------------------------------
    - 최신순 / 하트 높은순 / 댓글 많은순 / 조회수 높은순
    - data-my-sort 속성을 기준으로 어떤 정렬인지 구분
    =========================================================
  */
  const mySortBtnArr = document.querySelectorAll("[data-my-sort]");

  /*
    =========================================================
    [8] 저장 관련 기본 설정
    ---------------------------------------------------------
    - STORAGE_KEY      : localStorage에 저장할 때 사용하는 이름
    - CURRENT_NICKNAME : 현재 접속한 사용자 이름(테스트용)
    ---------------------------------------------------------
    ※ 나중에 로그인 기능이 생기면 CURRENT_NICKNAME을
      로그인한 사용자 정보로 바꾸면 됨
    =========================================================
  */
  const STORAGE_KEY = "community-board-data-v4";
  const CURRENT_NICKNAME = "복또비";

  /*
    =========================================================
    [9] 현재 상태를 기억하는 변수
    ---------------------------------------------------------
    - currentPostId   : 지금 보고 있는 게시글 번호
    - currentListPage : 상세 보기 들어가기 직전 어떤 목록에 있었는지
                        ("board" 또는 "my")
    - myPostSortType  : 내 소식 > 내가 쓴 글 정렬 기준
    =========================================================
  */
  let currentPostId = null;
  let currentListPage = "board";
  let myPostSortType = "latest";

  /*
    =========================================================
    [10] 실제 데이터 로딩
    ---------------------------------------------------------
    - loadData()로 localStorage에서 데이터 불러옴
    - 없으면 기본 샘플 데이터 사용
    - postArr    : 게시글 배열
    - commentObj : 댓글 객체 (게시글 id별로 댓글 배열 저장)
    =========================================================
  */
  let dataObj = loadData();
  let postArr = dataObj.posts;
  let commentObj = dataObj.comments;

  /*
    =========================================================
    [11] 기본 샘플 데이터 만드는 함수
    ---------------------------------------------------------
    - 처음 localStorage가 비어 있으면 이 데이터를 사용
    - posts    : 게시글 목록
    - comments : 각 게시글의 댓글 목록
    =========================================================
  */
  function makeDefaultData() {
    return {
      posts: [
        {
          id: 1001,
          title: "프로젝트 발표 자료 같이 볼 사람",
          content: "클로버허브 발표 자료를 정리하고 있는데 색감이나 문구 흐름을 같이 봐줄 사람 있으면 좋겠어.",
          tags: ["#프로젝트", "#발표", "#피드백"],
          thumb: "PPT",
          author: "복또비",
          createdAt: "2026-03-03 09:10",
          likes: 12,
          views: 34,
          liked: false
        },
        {
          id: 1002,
          title: "오늘 식단표 메뉴 본 사람",
          content: "점심 메뉴 괜찮아 보여서 같이 먹을 사람 있으면 댓글 남겨줘. 수업 끝나고 바로 내려가도 좋을 듯!",
          tags: ["#점심", "#식단표", "#같이먹자"],
          thumb: "MEAL",
          author: "용상이",
          createdAt: "2026-03-03 10:25",
          likes: 7,
          views: 18,
          liked: false
        },
        {
          id: 1003,
          title: "프론트 화면 구상 같이 이야기할 사람",
          content: "커뮤니티 게시판 메인 화면이랑 채팅 느낌 UI를 오늘 안에 어느 정도 맞추고 싶어.",
          tags: ["#프론트", "#UI", "#회의"],
          thumb: "UI",
          author: "미래님",
          createdAt: "2026-03-02 18:40",
          likes: 15,
          views: 29,
          liked: false
        },
        {
          id: 1004,
          title: "깃허브 충돌 해결 팁 부탁",
          content: "merge하다가 충돌이 나서 정리 중인데 초보도 이해하기 쉬운 방식으로 설명해줄 사람 있을까?",
          tags: ["#깃허브", "#질문", "#충돌"],
          thumb: "GIT",
          author: "클로버",
          createdAt: "2026-03-01 20:50",
          likes: 4,
          views: 11,
          liked: false
        }
      ],
      comments: {
        "1001": [
          { id: 1, nickname: "용상이", dateLabel: "2026-03-03 화", time: "09:50", text: "저 오늘 잠깐 볼 수 있어요!" },
          { id: 2, nickname: "복또비", dateLabel: "2026-03-03 화", time: "09:52", text: "좋아, 수업 끝나고 10분만 같이 보자!" }
        ],
        "1002": [
          { id: 3, nickname: "미래님", dateLabel: "2026-03-03 화", time: "11:10", text: "나도 같이 갈래." }
        ],
        "1003": [],
        "1004": []
      }
    };
  }

  /*
    =========================================================
    [12] localStorage에서 데이터 불러오기
    ---------------------------------------------------------
    1) 저장된 값이 없으면 기본 데이터 생성
    2) 저장된 값이 있으면 JSON으로 파싱
    3) posts / comments 구조가 맞는지 확인
    4) 구조가 이상하면 기본 데이터로 복구
    =========================================================
  */
  function loadData() {
    const savedText = localStorage.getItem(STORAGE_KEY);

    if (savedText == null || savedText == "") {
      const defaultData = makeDefaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }

    try {
      const parsed = JSON.parse(savedText);

      if (parsed.posts && parsed.comments) {
        return parsed;
      }

      throw new Error("데이터 형식 오류");
    } catch (error) {
      const defaultData = makeDefaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
  }

  /*
    =========================================================
    [13] 현재 데이터 저장
    ---------------------------------------------------------
    - 게시글/댓글이 바뀔 때마다 이 함수를 호출해서 저장
    - 새로고침해도 유지되게 하는 핵심 함수
    =========================================================
  */
  function saveData() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        posts: postArr,
        comments: commentObj
      })
    );
  }

  /*
    =========================================================
    [14] 페이지 전환 함수
    ---------------------------------------------------------
    - board  : 전체 화면
    - my     : 내 소식 화면
    - detail : 게시글 상세 화면
    ---------------------------------------------------------
    상세 페이지에서는 "어느 목록에서 들어왔는지"에 따라
    좌측 메뉴 active 상태를 다르게 보여주기 위해
    currentListPage 값을 함께 활용함
    =========================================================
  */
  function showPage(pageName) {
    pageBoard.classList.remove("active");
    pageMy.classList.remove("active");
    pageDetail.classList.remove("active");

    menuBoard.classList.remove("active");
    menuMy.classList.remove("active");

    if (pageName == "board") {
      currentListPage = "board";
      pageBoard.classList.add("active");
      menuBoard.classList.add("active");
    } else if (pageName == "my") {
      currentListPage = "my";
      pageMy.classList.add("active");
      menuMy.classList.add("active");
    } else if (pageName == "detail") {
      pageDetail.classList.add("active");

      if (currentListPage == "my") {
        menuMy.classList.add("active");
      } else {
        menuBoard.classList.add("active");
      }
    }
  }

  /*
    =========================================================
    [15] 숫자를 2자리 문자열로 바꾸는 함수
    ---------------------------------------------------------
    예)
    3  -> "03"
    12 -> "12"
    =========================================================
  */
  function addZero(num) {
    if (num < 10) {
      return "0" + num;
    }
    return String(num);
  }

  /*
    =========================================================
    [16] 요일 한글 변환 함수
    ---------------------------------------------------------
    Date.getDay() 값(0~6)을 받아서
    일, 월, 화, 수, 목, 금, 토 로 바꿔줌
    =========================================================
  */
  function getDayKor(dayIndex) {
    const dayArr = ["일", "월", "화", "수", "목", "금", "토"];
    return dayArr[dayIndex];
  }

  /*
    =========================================================
    [17] 게시글 작성 시간용 날짜 문자열
    ---------------------------------------------------------
    예) 2026-03-08 21:03
    =========================================================
  */
  function getNowDateTimeText() {
    const now = new Date();
    const year = now.getFullYear();
    const month = addZero(now.getMonth() + 1);
    const day = addZero(now.getDate());
    const hour = addZero(now.getHours());
    const minute = addZero(now.getMinutes());
    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
  }

  /*
    =========================================================
    [18] 댓글용 날짜 라벨
    ---------------------------------------------------------
    예) 2026-03-08 토
    =========================================================
  */
  function getNowCommentDateLabel() {
    const now = new Date();
    const year = now.getFullYear();
    const month = addZero(now.getMonth() + 1);
    const day = addZero(now.getDate());
    const dayKor = getDayKor(now.getDay());
    return year + "-" + month + "-" + day + " " + dayKor;
  }

  /*
    =========================================================
    [19] 댓글용 시간 문자열
    ---------------------------------------------------------
    예) 21:03
    =========================================================
  */
  function getNowTimeText() {
    const now = new Date();
    return addZero(now.getHours()) + ":" + addZero(now.getMinutes());
  }

  /*
    =========================================================
    [20] XSS 방지용 문자 치환 함수
    ---------------------------------------------------------
    사용자가 입력한 값에 <script> 같은 태그가 들어와도
    그대로 실행되지 않게 안전한 문자로 바꿔줌
    =========================================================
  */
  function getSafeText(text) {
    if (text == null) return "";
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  /*
    =========================================================
    [21] 줄바꿈(\n)을 <br>로 바꾸는 함수
    ---------------------------------------------------------
    textarea에서 입력한 여러 줄 내용을 HTML에 출력할 때 사용
    =========================================================
  */
  function convertLineBreak(text) {
    return getSafeText(text).replaceAll("\n", "<br>");
  }

  /*
    =========================================================
    [22] 너무 긴 글 미리보기용 잘라내기
    ---------------------------------------------------------
    목록 카드에서 내용이 너무 길면 일정 글자 수까지만 보여줌
    =========================================================
  */
  function cutText(text, len) {
    if (text.length <= len) return text;
    return text.substring(0, len) + "...";
  }

  /*
    =========================================================
    [23] 태그 문자열을 배열로 변환
    ---------------------------------------------------------
    입력 예시:
    "#프로젝트 #스터디"
    "프로젝트,스터디"
    ---------------------------------------------------------
    결과:
    ["#프로젝트", "#스터디"]
    =========================================================
  */
  function convertTags(tagText) {
    if (tagText.trim() == "") {
      return ["#커뮤니티"];
    }

    const rawArr = tagText.split(/[\s,]+/);
    const resultArr = [];

    for (let i = 0; i < rawArr.length; i++) {
      let tag = rawArr[i].trim();

      if (tag == "") continue;

      if (tag.charAt(0) != "#") {
        tag = "#" + tag;
      }

      resultArr.push(tag);
    }

    if (resultArr.length == 0) {
      resultArr.push("#커뮤니티");
    }

    return resultArr;
  }

  /*
    =========================================================
    [24] 게시글 id로 게시글 찾기
    ---------------------------------------------------------
    상세 보기, 좋아요 처리, 댓글 연결 등에 사용
    =========================================================
  */
  function getPostById(postId) {
    for (let i = 0; i < postArr.length; i++) {
      if (postArr[i].id == postId) {
        return postArr[i];
      }
    }
    return null;
  }

  /*
    =========================================================
    [25] 특정 게시글의 댓글 배열 가져오기
    ---------------------------------------------------------
    commentObj는 이런 구조:
    {
      "1001": [댓글1, 댓글2],
      "1002": [댓글1]
    }
    =========================================================
  */
  function getCommentArr(postId) {
    const arr = commentObj[String(postId)];
    if (!arr) return [];
    return arr;
  }

  /*
    =========================================================
    [26] 특정 게시글의 댓글 개수
    ---------------------------------------------------------
    목록 / 상세 / 내소식에서 계속 사용
    =========================================================
  */
  function getCommentCount(postId) {
    return getCommentArr(postId).length;
  }

  /*
    =========================================================
    [27] 인기글 정렬
    ---------------------------------------------------------
    우선순위:
    1) likes 많은 순
    2) likes가 같으면 views 많은 순
    =========================================================
  */
  function getPopularPostArr() {
    const newArr = postArr.slice();

    newArr.sort(function (a, b) {
      if (b.likes != a.likes) {
        return b.likes - a.likes;
      }
      return b.views - a.views;
    });

    return newArr;
  }

  /*
    =========================================================
    [28] 최신글 정렬
    ---------------------------------------------------------
    id가 클수록 최근에 작성된 글이라고 보고 정렬
    =========================================================
  */
  function getLatestPostArr() {
    const newArr = postArr.slice();

    newArr.sort(function (a, b) {
      return b.id - a.id;
    });

    return newArr;
  }

  /*
    =========================================================
    [29] 내가 작성한 글만 필터링
    ---------------------------------------------------------
    CURRENT_NICKNAME과 작성자가 같은 게시글만 반환
    =========================================================
  */
  function getMyPostArr() {
    return getLatestPostArr().filter(function (post) {
      return post.author == CURRENT_NICKNAME;
    });
  }

  /*
    =========================================================
    [30] 내가 작성한 글 정렬
    ---------------------------------------------------------
    myPostSortType 값에 따라 정렬 방식 변경
    - latest   : 최신순
    - likes    : 하트 높은순
    - comments : 댓글 많은순
    - views    : 조회수 높은순
    =========================================================
  */
  function getSortedMyPostArr() {
    const arr = getMyPostArr().slice();

    arr.sort(function (a, b) {
      if (myPostSortType == "likes") {
        if (b.likes != a.likes) return b.likes - a.likes;
        return b.id - a.id;
      }

      if (myPostSortType == "comments") {
        const aCount = getCommentCount(a.id);
        const bCount = getCommentCount(b.id);

        if (bCount != aCount) return bCount - aCount;
        return b.id - a.id;
      }

      if (myPostSortType == "views") {
        if (b.views != a.views) return b.views - a.views;
        return b.id - a.id;
      }

      return b.id - a.id;
    });

    return arr;
  }

  /*
    =========================================================
    [31] 내가 작성한 댓글 목록 만들기
    ---------------------------------------------------------
    - commentObj 전체를 돌면서
    - nickname이 CURRENT_NICKNAME인 댓글만 추출
    - 어떤 게시글에 쓴 댓글인지 함께 묶어서 반환
    =========================================================
  */
  function getMyCommentArr() {
    const resultArr = [];

    for (const postId in commentObj) {
      const commentArr = commentObj[postId];

      for (let i = 0; i < commentArr.length; i++) {
        const comment = commentArr[i];

        if (comment.nickname == CURRENT_NICKNAME) {
          const post = getPostById(Number(postId));

          if (post) {
            resultArr.push({
              id: comment.id,
              postId: post.id,
              postTitle: post.title,
              postThumb: post.thumb,
              commentText: comment.text,
              dateTime: getCommentDateTimeText(comment),
              author: post.author
            });
          }
        }
      }
    }

    resultArr.sort(function (a, b) {
      return b.id - a.id;
    });

    return resultArr;
  }

  /*
    =========================================================
    [32] 태그 배열을 HTML 문자열로 바꾸기
    ---------------------------------------------------------
    ["#프로젝트", "#UI"] -> span 태그 모음
    =========================================================
  */
  function makeTagHtml(tagArr) {
    let html = "";

    for (let i = 0; i < tagArr.length; i++) {
      html += '<span class="tag-chip">' + getSafeText(tagArr[i]) + "</span>";
    }

    return html;
  }

  /*
    =========================================================
    [33] 댓글의 날짜/시간 문자열 만들기
    ---------------------------------------------------------
    새 댓글:  dateLabel + time
    예전 댓글: time만 있을 수도 있으므로 예외 처리
    =========================================================
  */
  function getCommentDateTimeText(comment) {
    if (comment.dateLabel && comment.time) {
      return comment.dateLabel + " " + comment.time;
    }

    if (comment.time) {
      return comment.time;
    }

    return "";
  }

  /*
    =========================================================
    [34] 상세 화면 댓글 목록 HTML 생성
    ---------------------------------------------------------
    - 내 댓글은 오른쪽 정렬(me)
    - 다른 사람 댓글은 왼쪽 정렬(other)
    =========================================================
  */
  function makeCommentListHtml(postId) {
    const arr = getCommentArr(postId);

    if (arr.length == 0) {
      return '<div class="comment-empty-box">아직 댓글이 없어. 첫 댓글을 남겨줘.</div>';
    }

    let html = "";

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const rowClass = item.nickname == CURRENT_NICKNAME ? "comment-row me" : "comment-row other";

      html += ''
        + '<div class="' + rowClass + '">'
        + '  <div class="comment-meta">'
        + '    <span class="comment-nickname">' + getSafeText(item.nickname) + '</span>'
        + '    <span class="comment-date-time">' + getSafeText(getCommentDateTimeText(item)) + '</span>'
        + '  </div>'
        + '  <div class="comment-bubble">' + convertLineBreak(item.text) + '</div>'
        + '</div>';
    }

    return html;
  }

  /*
    =========================================================
    [35] 전체 게시글 목록 렌더링
    ---------------------------------------------------------
    - 최신글 기준으로 목록 출력
    - 각 카드 클릭 시 상세 화면으로 이동
    =========================================================
  */
  function renderBoardList() {
    boardList.innerHTML = "";

    const listArr = getLatestPostArr();

    for (let i = 0; i < listArr.length; i++) {
      const post = listArr[i];

      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("post-item-btn");

      btn.innerHTML = ''
        + '<div class="post-row">'
        + '  <div>'
        + '    <h3 class="post-title">' + getSafeText(post.title) + '</h3>'
        + '    <p class="post-content">' + getSafeText(cutText(post.content, 85)) + '</p>'
        + '    <div class="tag-row">' + makeTagHtml(post.tags) + '</div>'
        + '    <div class="meta-row">'
        + '      <span>작성자 ' + getSafeText(post.author) + '</span>'
        + '      <span>하트 ' + post.likes + '</span>'
        + '      <span>댓글 ' + getCommentCount(post.id) + '</span>'
        + '      <span>조회수 ' + post.views + '</span>'
        + '    </div>'
        + '  </div>'
        + '  <div class="post-thumb">' + getSafeText(post.thumb) + '</div>'
        + '</div>';

      btn.addEventListener("click", function () {
        openDetail(post.id, true);
      });

      boardList.append(btn);
    }
  }

  /*
    =========================================================
    [36] 인기글 목록 렌더링
    ---------------------------------------------------------
    - 좋아요 많은 순으로 정렬
    - 숫자 랭킹 크게 표시
    =========================================================
  */
  function renderPopularList() {
    popularList.innerHTML = "";

    const listArr = getPopularPostArr();

    if (listArr.length == 0) {
      popularList.innerHTML = '<div class="popular-empty-text">아직 인기글이 없어.</div>';
      return;
    }

    for (let i = 0; i < listArr.length; i++) {
      const post = listArr[i];

      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("popular-item-btn");

      btn.innerHTML = ''
        + '<div class="popular-row">'
        + '  <div class="rank-number">' + (i + 1) + '</div>'
        + '  <div>'
        + '    <h3 class="post-title">' + getSafeText(post.title) + '</h3>'
        + '    <p class="post-content">' + getSafeText(cutText(post.content, 62)) + '</p>'
        + '    <div class="meta-row">'
        + '      <span>하트 ' + post.likes + '</span>'
        + '      <span>댓글 ' + getCommentCount(post.id) + '</span>'
        + '      <span>조회수 ' + post.views + '</span>'
        + '    </div>'
        + '  </div>'
        + '  <div class="post-thumb">' + getSafeText(post.thumb) + '</div>'
        + '</div>';

      btn.addEventListener("click", function () {
        openDetail(post.id, true);
      });

      popularList.append(btn);
    }
  }

  /*
    =========================================================
    [37] 내 소식 > 내가 작성한 글 렌더링
    ---------------------------------------------------------
    - 정렬 버튼 상태(myPostSortType)에 따라 순서 변경
    =========================================================
  */
  function renderMyPostList() {
    myPostList.innerHTML = "";

    const listArr = getSortedMyPostArr();

    if (listArr.length == 0) {
      myPostList.innerHTML = '<div class="my-news-empty">작성한 게시글이 아직 없어.</div>';
      return;
    }

    for (let i = 0; i < listArr.length; i++) {
      const post = listArr[i];

      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("post-item-btn");

      btn.innerHTML = ''
        + '<div class="post-row">'
        + '  <div>'
        + '    <h3 class="post-title">' + getSafeText(post.title) + '</h3>'
        + '    <p class="post-content">' + getSafeText(cutText(post.content, 85)) + '</p>'
        + '    <div class="tag-row">' + makeTagHtml(post.tags) + '</div>'
        + '    <div class="meta-row">'
        + '      <span>작성일 ' + getSafeText(post.createdAt) + '</span>'
        + '      <span>하트 ' + post.likes + '</span>'
        + '      <span>댓글 ' + getCommentCount(post.id) + '</span>'
        + '      <span>조회수 ' + post.views + '</span>'
        + '    </div>'
        + '  </div>'
        + '  <div class="post-thumb">' + getSafeText(post.thumb) + '</div>'
        + '</div>';

      btn.addEventListener("click", function () {
        openDetail(post.id, true);
      });

      myPostList.append(btn);
    }
  }

  /*
    =========================================================
    [38] 내 소식 > 내가 작성한 댓글 렌더링
    ---------------------------------------------------------
    - 내가 단 댓글 내용을 보여주고
    - 클릭하면 해당 게시글 상세로 이동
    =========================================================
  */
  function renderMyCommentList() {
    myCommentList.innerHTML = "";

    const listArr = getMyCommentArr();

    if (listArr.length == 0) {
      myCommentList.innerHTML = '<div class="my-news-empty">작성한 댓글이 아직 없어.</div>';
      return;
    }

    for (let i = 0; i < listArr.length; i++) {
      const item = listArr[i];

      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("post-item-btn");

      btn.innerHTML = ''
        + '<div class="post-row">'
        + '  <div>'
        + '    <h3 class="post-title">' + getSafeText(item.postTitle) + '</h3>'
        + '    <p class="my-comment-preview">' + getSafeText(cutText(item.commentText, 90)) + '</p>'
        + '    <div class="meta-row">'
        + '      <span>내 댓글 시간 ' + getSafeText(item.dateTime) + '</span>'
        + '      <span class="my-comment-post">원글 작성자 ' + getSafeText(item.author) + '</span>'
        + '    </div>'
        + '  </div>'
        + '  <div class="post-thumb">' + getSafeText(item.postThumb) + '</div>'
        + '</div>';

      btn.addEventListener("click", function () {
        openDetail(item.postId, true);
      });

      myCommentList.append(btn);
    }
  }

  /*
    =========================================================
    [39] 상세 화면 렌더링
    ---------------------------------------------------------
    - 작성자 / 제목 / 본문 / 태그 / 좋아요 / 댓글목록 / 입력창
    - 상세 화면이 다시 그려질 때마다 버튼 이벤트를 새로 연결
    =========================================================
  */
  function renderDetail() {
    const post = getPostById(currentPostId);

    if (post == null) {
      detailArea.innerHTML = "";
      return;
    }

    detailArea.innerHTML = ''
      + '<article class="detail-card">'
      + '  <div class="detail-top-row">'
      + '    <div class="writer-box">'
      + '      <div class="writer-avatar">' + getSafeText(post.author.substring(0, 1)) + '</div>'
      + '      <div>'
      + '        <div class="writer-name">' + getSafeText(post.author) + '</div>'
      + '        <div class="writer-sub">' + getSafeText(post.createdAt) + '</div>'
      + '      </div>'
      + '    </div>'
      + '    <div class="detail-info-row">'
      + '      <span>조회수 ' + post.views + '</span>'
      + '      <span>댓글 ' + getCommentCount(post.id) + '</span>'
      + '    </div>'
      + '  </div>'

      + '  <div class="detail-body-grid">'
      + '    <div class="detail-thumb">' + getSafeText(post.thumb) + '</div>'
      + '    <div class="detail-text-box">'
      + '      <h3>' + getSafeText(post.title) + '</h3>'
      + '      <p>' + convertLineBreak(post.content) + '</p>'
      + '    </div>'
      + '  </div>'

      + '  <div class="tag-row">' + makeTagHtml(post.tags) + '</div>'

      + '  <div class="action-row">'
      + '    <button type="button" id="detailLikeBtn" class="action-btn ' + (post.liked ? "active-like" : "") + '">👍 하트 ' + post.likes + '</button>'
      + '    <button type="button" id="focusCommentBtn" class="action-btn">💬 댓글쓰기 ' + getCommentCount(post.id) + '</button>'
      + '  </div>'

      + '  <div class="comment-guide-box">'
      + '    <p class="comment-guide-text">댓글쓰기를 누르면 바로 아래에서 작성할 수 있고, 저장하면 닉네임과 날짜, 요일, 시간이 같이 남아.</p>'
      + '    <button type="button" id="openCommentBtn" class="main-btn">댓글쓰기</button>'
      + '  </div>'

      + '  <div class="inline-comment-section">'
      + '    <div class="section-head">'
      + '      <div class="section-title-main">댓글</div>'
      + '      <div class="section-help-text">상세 화면 안에서 바로 저장돼.</div>'
      + '    </div>'

      + '    <div class="inline-comment-list" id="inlineCommentList">'
      +        makeCommentListHtml(post.id)
      + '    </div>'

      + '    <div class="comment-write-wrap">'
      + '      <div class="chat-user-row">'
      + '        <div class="chat-user-badge">' + getSafeText(CURRENT_NICKNAME.substring(0, 1)) + '</div>'
      + '        <div class="chat-user-text">'
      + '          <strong>' + getSafeText(CURRENT_NICKNAME) + '</strong>'
      + '          <span>현재 작성자</span>'
      + '        </div>'
      + '      </div>'

      + '      <div class="comment-write-row">'
      + '        <input type="text" id="detailCommentInput" class="fix-input" placeholder="댓글 내용을 입력해줘" />'
      + '        <button type="button" id="detailCommentSaveBtn" class="main-btn">저장</button>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</article>';

    /*
      ---------------------------------------------------------
      상세 화면은 innerHTML로 새로 그려지기 때문에
      버튼들도 다시 새로 만들어진 상태다.
      그래서 이벤트도 renderDetail() 안에서 다시 연결해야 함
      ---------------------------------------------------------
    */
    getDom("detailLikeBtn").addEventListener("click", function () {
      toggleLike(post.id);
    });

    getDom("focusCommentBtn").addEventListener("click", function () {
      focusCommentInput();
    });

    getDom("openCommentBtn").addEventListener("click", function () {
      focusCommentInput();
    });

    getDom("detailCommentSaveBtn").addEventListener("click", function () {
      saveInlineComment();
    });

    getDom("detailCommentInput").addEventListener("keydown", function (evt) {
      if (evt.key == "Enter") {
        evt.preventDefault();
        saveInlineComment();
      }
    });
  }

  /*
    =========================================================
    [40] 전체 렌더링 한 번에 실행
    ---------------------------------------------------------
    - 게시글 목록
    - 인기글
    - 내 소식
    - 상세 화면
    =========================================================
  */
  function renderAll() {
    renderBoardList();
    renderPopularList();
    renderMyPostList();
    renderMyCommentList();

    if (currentPostId != null) {
      renderDetail();
    }
  }

  /*
    =========================================================
    [41] 상세 열기
    ---------------------------------------------------------
    - currentPostId 갱신
    - 상세 들어갈 때 조회수 증가 여부 결정
    - 화면 다시 그린 뒤 detail 페이지로 이동
    =========================================================
  */
  function openDetail(postId, increaseView) {
    const post = getPostById(postId);
    if (post == null) return;

    currentPostId = postId;

    if (increaseView) {
      post.views += 1;
      saveData();
    }

    renderAll();
    showPage("detail");
  }

  /*
    =========================================================
    [42] 글쓰기 패널 열고 닫기
    =========================================================
  */
  function toggleWritePanel() {
    writePanel.classList.toggle("hide");
  }

  /*
    =========================================================
    [43] 글쓰기 입력값 초기화
    =========================================================
  */
  function resetWriteForm() {
    postTitleInput.value = "";
    postContentInput.value = "";
    postTagInput.value = "";
    postThumbInput.value = "";
  }

  /*
    =========================================================
    [44] 게시글 저장
    ---------------------------------------------------------
    1) 제목/내용 검사
    2) 새 게시글 객체 생성
    3) postArr 맨 앞에 추가
    4) 해당 게시글 댓글 배열도 비어 있는 상태로 생성
    5) 저장 후 목록 다시 그림
    =========================================================
  */
  function savePost() {
    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();
    const thumb = postThumbInput.value.trim() == "" ? "POST" : postThumbInput.value.trim().toUpperCase();
    const tagArr = convertTags(postTagInput.value);

    if (title == "") {
      alert("제목을 입력해줘.");
      postTitleInput.focus();
      return;
    }

    if (content == "") {
      alert("내용을 입력해줘.");
      postContentInput.focus();
      return;
    }

    const newPost = {
      id: new Date().getTime(),
      title: title,
      content: content,
      tags: tagArr,
      thumb: thumb,
      author: CURRENT_NICKNAME,
      createdAt: getNowDateTimeText(),
      likes: 0,
      views: 0,
      liked: false
    };

    postArr.unshift(newPost);
    commentObj[String(newPost.id)] = [];

    saveData();
    resetWriteForm();
    writePanel.classList.add("hide");
    renderAll();
    showPage("board");
  }

  /*
    =========================================================
    [45] 좋아요(하트) 토글
    ---------------------------------------------------------
    - 이미 눌렀으면 취소
    - 안 눌렀으면 +1
    - 눌린 상태는 post.liked로 관리
    =========================================================
  */
  function toggleLike(postId) {
    const post = getPostById(postId);
    if (post == null) return;

    if (post.liked) {
      post.likes -= 1;
      if (post.likes < 0) {
        post.likes = 0;
      }
      post.liked = false;
    } else {
      post.likes += 1;
      post.liked = true;
    }

    saveData();
    renderAll();
    showPage("detail");
  }

  /*
    =========================================================
    [46] 댓글 입력창으로 이동 및 포커스
    ---------------------------------------------------------
    - 상세 화면에서 댓글쓰기 버튼 눌렀을 때 사용
    =========================================================
  */
  function focusCommentInput() {
    const input = getDom("detailCommentInput");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /*
    =========================================================
    [47] 상세 화면 안에서 댓글 저장
    ---------------------------------------------------------
    1) 댓글 입력값 검사
    2) 현재 게시글의 댓글 배열에 push
    3) 날짜/요일/시간 함께 저장
    4) 다시 렌더링
    5) 입력창 다시 포커스
    =========================================================
  */
  function saveInlineComment() {
    if (currentPostId == null) return;

    const input = getDom("detailCommentInput");
    if (!input) return;

    const text = input.value.trim();

    if (text == "") {
      alert("댓글 내용을 입력해줘.");
      input.focus();
      return;
    }

    const key = String(currentPostId);

    if (!commentObj[key]) {
      commentObj[key] = [];
    }

    commentObj[key].push({
      id: new Date().getTime(),
      nickname: CURRENT_NICKNAME,
      dateLabel: getNowCommentDateLabel(),
      time: getNowTimeText(),
      text: text
    });

    saveData();
    renderAll();
    showPage("detail");

    setTimeout(function () {
      const latestInput = getDom("detailCommentInput");
      if (latestInput) {
        latestInput.focus();
      }
    }, 50);
  }

  /*
    =========================================================
    [48] 메뉴 / 버튼 이벤트 연결
    =========================================================
  */

  // 전체 메뉴 클릭
  menuBoard.addEventListener("click", function () {
    renderAll();
    showPage("board");
  });

  // 내 소식 메뉴 클릭
  menuMy.addEventListener("click", function () {
    renderAll();
    showPage("my");
  });

  // 글쓰기 패널 열기
  openWritePanelBtn.addEventListener("click", function () {
    toggleWritePanel();
  });

  // 글쓰기 취소
  cancelPostBtn.addEventListener("click", function () {
    writePanel.classList.add("hide");
    resetWriteForm();
  });

  // 글쓰기 저장
  savePostBtn.addEventListener("click", function () {
    savePost();
  });

  // 상세 화면에서 목록으로 돌아가기
  detailBackBtn.addEventListener("click", function () {
    renderAll();
    showPage(currentListPage);
  });

  /*
    ---------------------------------------------------------
    내 소식 정렬 버튼
    - 버튼 누를 때마다 myPostSortType 변경
    - active 클래스 갱신
    - 내가 쓴 글 목록만 다시 렌더링
    ---------------------------------------------------------
  */
  mySortBtnArr.forEach(function (btn) {
    btn.addEventListener("click", function () {
      myPostSortType = this.dataset.mySort;

      mySortBtnArr.forEach(function (item) {
        item.classList.remove("active");
      });

      this.classList.add("active");
      renderMyPostList();
    });
  });

  /*
    =========================================================
    [49] 첫 실행
    ---------------------------------------------------------
    - 게시글이 하나라도 있으면 첫 번째 글을 기본 currentPostId로 지정
    - 전체 렌더링
    - 첫 화면은 게시글 목록(board)
    =========================================================
  */
  if (postArr.length > 0) {
    currentPostId = postArr[0].id;
  }

  renderAll();
  showPage("board");
};
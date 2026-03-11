document.addEventListener('DOMContentLoaded', () => {
  /* ====================================================================== */
  /* [01] 기본 설정값                                                         */
  /* ====================================================================== */
  const CURRENT_USER_NAME = '용상이';
  const LOCAL_STORAGE_KEY = 'community_posts_v_final_0306';
  const ALARM_DISMISS_STORAGE_KEY = 'community_alarm_dismissed_v1';
  const CHAT_STORAGE_KEY = 'community_chat_rooms_v_final';
  const ACTIVITY_STORAGE_KEY = 'community_activity_log_v1';
  const MORE_LIST_PAGE_SIZE = 5;
  const MY_PAGE_SIZE = 5;

  /* ====================================================================== */
  /* [02] DOM 요소 변수 정리                                                  */
  /*      규칙: DOM 요소는 뒤에 El / Btn / Input / List / Section 붙이기      */
  /* ====================================================================== */

  /* [02-1] 헤더 / 모바일 메뉴 */
  const mobileMenuButtonEl = document.getElementById('mobileMenuBtn');
  const mobileMenuPanelEl = document.getElementById('mobileMenuPanel');

  /* [02-2] 왼쪽 메뉴 버튼 */
  const allMenuButtonEl = document.getElementById('menuAll');
  const myMenuButtonEl = document.getElementById('menuMine');
  const chatMenuButtonEl = document.getElementById('menuChat');

  /* [02-3] 페이지 섹션 */
  const allPageSectionEl = document.getElementById('pageAll');
  const myPageSectionEl = document.getElementById('pageMine');
  const chatPageSectionEl = document.getElementById('pageChat');
  const detailPageSectionEl = document.getElementById('pageDetail');

  /* [02-4] 전체 페이지 관련 요소 */
  const hotPostListEl = document.getElementById('hotPostList');
  const latestPostListEl = document.getElementById('latestPostList');
  const hotMoreButtonEl = document.getElementById('hotMoreBtn');
  const latestMoreButtonEl = document.getElementById('latestMoreBtn');
  const allPreviewSectionEl = document.getElementById('allPreviewSection');
  const allMoreSectionEl = document.getElementById('allMoreSection');
  const allMoreTitleEl = document.getElementById('allMoreTitle');
  const allMoreDescEl = document.getElementById('allMoreDesc');
  const allMoreListEl = document.getElementById('allMoreList');
  const allPrevPageButtonEl = document.getElementById('allPrevPageBtn');
  const allNextPageButtonEl = document.getElementById('allNextPageBtn');
  const allPageNumberListEl = document.getElementById('allPageNumberList');
  const backPreviewButtonEl = document.getElementById('backPreviewBtn');

  /* [02-5] 내 소식 / 채팅 / 상세 관련 요소 */
  const myActivityBoxEl = document.getElementById('myActivityBox');
  const myPagerRowEl = document.getElementById('myPagerRow');
  const myPrevPageButtonEl = document.getElementById('myPrevPageBtn');
  const myNextPageButtonEl = document.getElementById('myNextPageBtn');
  const myPageNumberListEl = document.getElementById('myPageNumberList');
  const chatRoomListEl = document.getElementById('chatRoomList');
  const chatThreadEl = document.getElementById('chatThread');
  const chatCurrentRoomNameEl = document.getElementById('chatCurrentRoomName');
  const chatCurrentRoomMetaEl = document.getElementById('chatCurrentRoomMeta');
  const chatToastStackEl = document.getElementById('chatToastStack');
  const chatMobileToastStackEl = document.getElementById('chatMobileToastStack');
  const chatTypingHintEl = document.getElementById('chatTypingHint');
  const chatInputEl = document.getElementById('chatInput');
  const chatSendButtonEl = document.getElementById('chatSendBtn');
  const detailCardEl = document.getElementById('detailCard');
  const commentListEl = document.getElementById('commentList');
  const commentInputEl = document.getElementById('commentInput');
  const addCommentButtonEl = document.getElementById('addCommentBtn');
  const backToListButtonEl = document.getElementById('backToListBtn');
  const imageLightboxEl = document.getElementById('imageLightbox');
  const imageLightboxImageEl = document.getElementById('imageLightboxImg');
  const imageLightboxCloseButtonEl = document.getElementById('imageLightboxCloseBtn');

  /* [02-6] 글쓰기 / 수정 모달 관련 요소 */
  const floatingWriteButtonEl = document.getElementById('fabBtn');
  const modalOverlayEl = document.getElementById('modalOverlay');
  const postModalEl = document.getElementById('postModal');
  const closeModalButtonEl = document.getElementById('closeModalBtn');
  const postModalModeTextEl = document.getElementById('postModalModeText');
  const postModalTitleEl = document.getElementById('postModalTitle');
  const postTitleInputEl = document.getElementById('postTitleInput');
  const postContentInputEl = document.getElementById('postContentInput');
  const hashtagInputEl = document.getElementById('hashTagInput');
  const hashtagPreviewEl = document.getElementById('hashTagPreview');
  const imageFileInputEl = document.getElementById('imageInput');
  const selectImageButtonEl = document.getElementById('selectImageBtn');
  const imageDropZoneEl = document.getElementById('imageDropZone');
  const imagePreviewListEl = document.getElementById('imagePreviewList');
  const savePostButtonEl = document.getElementById('savePostBtn');

  /* [02-7] 확인 모달 관련 요소 */
  const confirmModalEl = document.getElementById('confirmModal');
  const confirmTextEl = document.getElementById('confirmText');
  const confirmNoButtonEl = document.getElementById('confirmNoBtn');
  const confirmYesButtonEl = document.getElementById('confirmYesBtn');

  /* ====================================================================== */
  /* [03] 상태 변수 정리                                                      */
  /* ====================================================================== */
  let postList = loadPostList();
  let dismissedAlarmIdList = loadDismissedAlarmIdList();
  let activityLogList = loadActivityLogList();
  let currentPageName = 'all';
  let currentMoreListMode = 'hot';
  let currentMoreListPage = 1;
  let currentDetailPostId = null;
  let currentMyTabName = 'alarm';
  let currentMyAlarmPage = 1;
  let currentMyActivityPage = 1;
  let editingPostId = null;
  let editingCommentId = null;
  let editingReplyId = null;
  let editingReplyParentCommentId = null;
  let pendingConfirmAction = null;
  let draftImageList = [];
  let chatRoomList = loadChatRoomList();
  let currentChatRoomId = chatRoomList[0] ? chatRoomList[0].id : null;
  let chatTypingTimerId = null;
  let chatAutoReplyTimerId = null;
  let chatAutoReplyTimerIdList = [];
  let chatBackgroundTimerId = null;
  let lastChatActivityAt = Date.now();
  let openMobileTooltipEl = null;
  let backgroundChatRoomTurnIndex = 0;
  let chatBackgroundBootTimerId = null;
  /* [03-1] 채팅방 목록이 비어 보이지 않도록 초기 안 읽은 수를 한 번 더 보정 */
  chatRoomList = chatRoomList.map((chatRoomItem, chatRoomIndex) => ({
    ...chatRoomItem,
    unreadCount: Number(chatRoomItem.unreadCount || (chatRoomIndex === 0 ? 0 : chatRoomIndex))
  }));

  /* ====================================================================== */
  /* [04] SVG 아이콘 모음                                                     */
  /* ====================================================================== */
  const iconMarkupMap = {
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1.5 12s3.8-6.5 10.5-6.5S22.5 12 22.5 12 18.7 18.5 12 18.5 1.5 12 1.5 12Z"></path><circle cx="12" cy="12" r="3.2"></circle></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.7-8.8-8.3C1.5 8.5 3.1 5 6.9 5c2.2 0 3.6 1.1 5.1 3 1.5-1.9 2.9-3 5.1-3 3.8 0 5.4 3.5 3.7 6.7C19 15.3 12 20 12 20Z"></path></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5h16v10H9l-5 4v-14Z"></path></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 15 10-10 5 5-10 10H4v-5Z"></path></svg>`,
    delete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4.5 7.5h15"></path><path d="M9.5 7.5V5.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7"></path><path d="M7 7.5l.8 11.2c.1 1 .9 1.8 1.9 1.8h4.6c1 0 1.8-.8 1.9-1.8L17 7.5"></path><path d="M10 11v5.5M14 11v5.5"></path></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4.5h12V20l-6-4-6 4V4.5Z"></path></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 11 7-4.2M8.2 13l7 4.2"></path></svg>`,
    flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 20V5m0 0c3-2 6 2 9 0s6 2 6 2v8s-3-2-6-2-6 2-9 0"></path></svg>`
  };

  /* ====================================================================== */
  /* [05] 샘플 데이터 생성                                                     */
  /* ====================================================================== */
  function createSamplePostList() {
    return [
      createPostItem('민지', '학원 근처 조용한 자리 있는 카페 찾았어요', '이어폰 끼고 정리하기 괜찮은 카페라서 공유해요. 테이블 간격도 넓고 콘센트 자리도 꽤 있어서 저녁 복습하기 좋았어요.', ['#카페', '#추천'], 73, 13, 2, '2026.02.28 18:08'),
      createPostItem('서연', '오늘 강의실 분위기 너무 좋았다', '프로젝트 발표 전에 다들 조용히 집중하는 분위기라 괜히 같이 마음이 잡혔어요. 집중 잘되는 날이 있었던 것 같아요.', ['#강의실', '#집중'], 61, 11, 3, '2026.03.01 09:12'),
      createPostItem('하린', '다음 주 팀플 일정 맞추기 어렵네요', '저녁 시간대가 가장 괜찮을 것 같은데 다들 몇 시쯤 가능할까요? 온라인으로 먼저 정리해도 괜찮을 것 같아요.', ['#팀플', '#일정'], 31, 7, 5, '2026.03.05 14:18'),
      createPostItem('나래', '발표 자료 폰트는 통일하는 게 훨씬 깔끔했어요', '제목은 굵게, 본문은 조금 가볍게 맞추니까 슬라이드가 훨씬 안정적으로 보여서 팀원들도 바로 알아봤어요.', ['#발표', '#디자인'], 42, 10, 4, '2026.03.04 17:41'),
      createPostItem('유림', '오늘 복습 체크리스트 공유해요', '조건문이랑 반복문 부분이 아직 헷갈리는 분들은 문제를 푸는 순서를 먼저 글로 적어보면 꽤 도움이 됐어요.', ['#복습', '#공유'], 55, 9, 6, '2026.03.04 20:16'),
      createPostItem('태경', '실습할 때 변수명 통일이 왜 중요한지 알겠어요', '파일마다 이름이 다르면 연결 확인할 때 시간이 두 배로 걸리더라고요. 오늘 그 부분 때문에 진짜 오래 헤맸어요.', ['#실습', '#변수명'], 64, 12, 7, '2026.03.03 11:33'),
      createPostItem('소민', '학원 끝나고 바로 갈 만한 서점 추천해 주세요', '주말에 책 좀 보고 싶은데 대중교통으로 가기 편한 곳이면 좋겠어요. 조용한 분위기면 더 좋고요.', ['#서점', '#주말'], 24, 4, 2, '2026.03.02 16:09'),
      createPostItem(CURRENT_USER_NAME, '금요일 발표 체크 포인트 정리', '도입부를 너무 길게 가져가지 말고 핵심 기능을 먼저 보여주자는 의견으로 정리했어요. 다들 발표 전에 한 번씩만 더 확인해 주세요.', ['#발표', '#체크'], 84, 14, 8, '2026.03.06 11:02'),
      createPostItem(CURRENT_USER_NAME, '프로젝트 메인 컬러는 너무 많지 않게 가는 게 좋아요', '포인트 색 하나, 배경 하나, 보더 하나만 정해도 페이지가 훨씬 차분해 보여요. 오늘 수정하면서 다시 느꼈어요.', ['#컬러', '#UI'], 77, 15, 6, '2026.03.05 19:42'),
      createPostItem('주아', '주말 전에 꼭 끝내고 싶은 기능 뭐 있어요?', '저는 댓글 수정이랑 모바일 여백 먼저 잡고 싶어요. 다들 우선순위가 어디인지 궁금해요.', ['#질문', '#개발'], 29, 6, 3, '2026.03.05 08:44'),
      createPostItem('현우', '오늘 수업 내용 중 제일 어려웠던 거 공유해봐요', '저는 이벤트 연결은 이해했는데 실제로 여러 파일이 엮이면 어디서부터 봐야 하는지 아직 헷갈려요.', ['#수업', '#공유'], 37, 8, 4, '2026.03.03 13:28')
    ];
  }

  /* [05-1] 게시글 1개를 생성하는 함수 */
  function createPostItem(authorName, titleText, contentText, hashtagList, viewCount, likeCount, commentCount, dateTimeText) {
    const commentItems = [];

    const sampleCommentTextList = [
      '정리해 준 포인트 덕분에 흐름이 훨씬 잘 보였어요.',
      '저도 이 부분 다시 확인하고 있었는데 도움이 됐어요.',
      '예시까지 같이 보니까 이해가 더 빨랐어요.',
      '오늘 발표 전에 한 번 더 읽어보면 좋을 것 같아요.',
      '실제로 적용할 때 참고하기 좋게 정리해 줬네요.'
    ];

    const sampleReplyTextList = [
      '확인해 줘서 고마워요!',
      '저도 같은 부분이 제일 중요하다고 생각했어요.',
      '다 같이 맞춰 보면 더 깔끔하게 나올 것 같아요.'
    ];

    for (let index = 1; index <= commentCount; index += 1) {
      const commentAuthorName = index % 2 ? '은채' : '민호';
      const sampleCommentText = sampleCommentTextList[(index - 1) % sampleCommentTextList.length];
      const sampleReplyText = sampleReplyTextList[(index - 1) % sampleReplyTextList.length];

      commentItems.push({
        id: Date.now() + Math.random(),
        author: commentAuthorName,
        text: sampleCommentText,
        datetime: dateTimeText,
        replies: index === 1
          ? [
              {
                id: Date.now() + Math.random(),
                author: getCurrentUserName(),
                text: `@${commentAuthorName} ${sampleReplyText}`,
                datetime: dateTimeText
              }
            ]
          : []
      });
    }

    return {
      id: Date.now() + Math.random(),
      author: authorName,
      title: titleText,
      content: contentText,
      tags: hashtagList,
      views: viewCount,
      likes: likeCount,
      datetime: dateTimeText,
      comments: commentItems,
      liked: false,
      saved: false,
      saveCount: 0,
      shareCount: 0,
      reportCount: 0,
      images: []
    };
  }


  /* [05-2] 채팅 메시지 1개를 생성하는 함수 */
  function createChatMessageItem(sideName, authorName, messageText, timeText = getNowTimeText()) {
    return {
      id: Date.now() + Math.random(),
      side: sideName,
      author: authorName,
      text: messageText,
      time: timeText
    };
  }

  /* [05-3] 실시간처럼 보이는 채팅방 샘플 데이터 */
  function createSampleChatRoomList() {
    return [
      {
        id: 'room-live',
        name: '실시간 채팅',
        subtitle: '프로젝트 이야기를 바로 주고받는 방',
        partnerName: '은채',
        unreadCount: 0,
        typing: false,
        messages: [
          createChatMessageItem('left', '은채', '안녕 :) 오늘도 커뮤니티 쪽 보고 있었어?'),
          createChatMessageItem('right', CURRENT_USER_NAME, '응, 지금 수정 정리하고 있었어!'),
          createChatMessageItem('left', '은채', '좋아. 필요한 거 있으면 여기서 바로 말해 줘 :)')
        ]
      },
      {
        id: 'room-design',
        name: '디자인 체크',
        subtitle: '색감과 UI 톤을 확인하는 방',
        partnerName: '민지',
        unreadCount: 1,
        typing: false,
        messages: [
          createChatMessageItem('left', '민지', '메인 컬러는 노란 계열이 훨씬 잘 어울리는 것 같아요.'),
          createChatMessageItem('right', CURRENT_USER_NAME, '맞아, 우리 메인 톤 그대로 가는 게 좋아 보여!')
        ]
      },
      {
        id: 'room-team',
        name: '팀플 진행',
        subtitle: '기능 우선순위를 빠르게 맞추는 방',
        partnerName: '하린',
        unreadCount: 2,
        typing: false,
        messages: [
          createChatMessageItem('left', '하린', '모바일 먼저 보고 나서 PC를 잡는 게 좋을 것 같아.'),
          createChatMessageItem('left', '하린', '이미지랑 버튼 간격은 조금만 띄우면 훨씬 자연스러워 보여!')
        ]
      },
      {
        id: 'room-feedback',
        name: '피드백 모음',
        subtitle: '수정 요청과 체크 포인트를 모아두는 방',
        partnerName: '서연',
        unreadCount: 1,
        typing: false,
        messages: [
          createChatMessageItem('left', '서연', '오늘 수정해야 하는 부분만 빠르게 모아볼게요.'),
          createChatMessageItem('right', CURRENT_USER_NAME, '좋아, 우선순위 순서대로 정리해 보자!')
        ]
      }
    ];
  }

  /* ====================================================================== */
  /* [06] 로컬스토리지 저장 / 불러오기                                         */
  /* ====================================================================== */
  function loadPostList() {
    const savedPostListText = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedPostListText) {
      return JSON.parse(savedPostListText).map((postItem) => ({
        ...postItem,
        saveCount: postItem.saveCount || 0,
        shareCount: postItem.shareCount || 0,
        reportCount: postItem.reportCount || 0,
        images: postItem.images || [],
        comments: (postItem.comments || []).map((commentItem, commentIndex) => ({
          ...commentItem,
          text: String(commentItem.text || '').includes('샘플 댓글입니다.')
            ? ['정리 덕분에 발표 흐름이 더 잘 보였어요.', '이 부분 다시 체크하고 있었는데 도움이 됐어요.', '한 번 더 읽어보면 실수 줄이기 좋을 것 같아요.'][(commentIndex) % 3]
            : commentItem.text,
          replies: (commentItem.replies || []).map((replyItem) => ({
            ...replyItem,
            text: String(replyItem.text || '').replace('확인했어요!', '확인해 줘서 고마워요!')
          }))
        }))
      }));
    }

    const samplePostList = createSamplePostList();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(samplePostList));
    return samplePostList;
  }

  function savePostList() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(postList));
  }

  function loadDismissedAlarmIdList() {
    const savedAlarmIdListText = localStorage.getItem(ALARM_DISMISS_STORAGE_KEY);

    if (!savedAlarmIdListText) {
      return [];
    }

    try {
      return JSON.parse(savedAlarmIdListText);
    } catch (error) {
      return [];
    }
  }

  function saveDismissedAlarmIdList() {
    localStorage.setItem(ALARM_DISMISS_STORAGE_KEY, JSON.stringify(dismissedAlarmIdList));
  }


  function loadActivityLogList() {
    const savedActivityLogListText = localStorage.getItem(ACTIVITY_STORAGE_KEY);

    if (!savedActivityLogListText) {
      return [];
    }

    try {
      const parsedActivityLogList = JSON.parse(savedActivityLogListText);
      return Array.isArray(parsedActivityLogList) ? parsedActivityLogList : [];
    } catch (error) {
      return [];
    }
  }

  function saveActivityLogList() {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activityLogList));
  }

  function addActivityLog(labelText, postId, timeText = getNowText()) {
    if (!isLoggedIn() || !postId) {
      return;
    }

    activityLogList.unshift({
      id: `${Date.now()}-${Math.random()}`,
      label: labelText,
      postId: String(postId),
      time: timeText
    });

    activityLogList = activityLogList.slice(0, 80);
    saveActivityLogList();
  }

  function removeActivityLogsByPostId(postId) {
    const nextActivityLogList = activityLogList.filter((activityLogItem) => String(activityLogItem.postId) !== String(postId));

    if (nextActivityLogList.length !== activityLogList.length) {
      activityLogList = nextActivityLogList;
      saveActivityLogList();
    }
  }

  /* [06-1] 채팅방 저장 / 불러오기 */
  function loadChatRoomList() {
    const savedChatRoomListText = localStorage.getItem(CHAT_STORAGE_KEY);
    const sampleChatRoomList = createSampleChatRoomList();

    if (savedChatRoomListText) {
      try {
        const parsedChatRoomList = JSON.parse(savedChatRoomListText);

        if (Array.isArray(parsedChatRoomList) && parsedChatRoomList.length) {
          const normalizedChatRoomList = parsedChatRoomList.map((chatRoomItem, roomIndex) => ({
            id: chatRoomItem.id || `room-${roomIndex + 1}`,
            name: chatRoomItem.name || '실시간 채팅',
            subtitle: chatRoomItem.subtitle || '지금 바로 메시지를 주고받을 수 있어요',
            partnerName: chatRoomItem.partnerName || chatRoomItem.name || '상대방',
            unreadCount: Number(chatRoomItem.unreadCount || 0),
            typing: Boolean(chatRoomItem.typing),
            muted: Boolean(chatRoomItem.muted),
            messages: Array.isArray(chatRoomItem.messages) ? chatRoomItem.messages : []
          }));

          /* [06-1-1] 이전 저장본에 옆 채팅방이 부족하면 샘플 방을 다시 채워 넣어 숫자 증가 흐름이 보이도록 보정 */
          sampleChatRoomList.forEach((sampleRoomItem) => {
            if (!normalizedChatRoomList.some((savedRoomItem) => String(savedRoomItem.id) === String(sampleRoomItem.id))) {
              normalizedChatRoomList.push(sampleRoomItem);
            }
          });

          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(normalizedChatRoomList));
          return normalizedChatRoomList;
        }
      } catch (error) {
        // 저장된 채팅 데이터가 깨진 경우 아래 샘플 데이터로 다시 시작
      }
    }

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sampleChatRoomList));
    return sampleChatRoomList;
  }

  function saveChatRoomList() {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatRoomList));
  }

  function findPostById(postId) {
    return postList.find((postItem) => String(postItem.id) === String(postId));
  }

  function findChatRoomById(chatRoomId) {
    return chatRoomList.find((chatRoomItem) => String(chatRoomItem.id) === String(chatRoomId));
  }

  /* ====================================================================== */
  /* [07] 공통 유틸 함수                                                       */
  /* ====================================================================== */
  function getNowText() {
    const now = new Date();
    const padZero = (numberValue) => String(numberValue).padStart(2, '0');

    return `${now.getFullYear()}.${padZero(now.getMonth() + 1)}.${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}`;
  }

  /* [07-1] 채팅 전용 현재 시간(HH:MM) 텍스트 */
  function getNowTimeText() {
    const now = new Date();
    const padZero = (numberValue) => String(numberValue).padStart(2, '0');

    return `${padZero(now.getHours())}:${padZero(now.getMinutes())}`;
  }

  function escapeHtml(textValue = '') {
    return String(textValue).replace(/[&<>"']/g, (matchedText) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[matchedText]));
  }

  function convertNewLineToBr(textValue = '') {
    return escapeHtml(textValue).replace(/\n/g, '<br>');
  }

  function getLoginUserSafely() {
    try {
      if (typeof loadJs === 'function') {
        return loadJs('loginUser');
      }
    } catch (error) {
      console.warn('[CommunityPage] loginUser load skipped:', error);
    }

    return null;
  }


  function getCurrentUserName() {
    const loginUserValue = getLoginUserSafely();

    if (typeof loginUserValue === 'string' && loginUserValue.trim()) {
      return loginUserValue.trim();
    }

    if (loginUserValue && typeof loginUserValue === 'object') {
      const candidateNameList = [
        loginUserValue.nickname,
        loginUserValue.nickName,
        loginUserValue.nick,
        loginUserValue.name,
        loginUserValue.userName,
        loginUserValue.username,
        loginUserValue.id
      ];

      const matchedName = candidateNameList.find((nameValue) => typeof nameValue === 'string' && nameValue.trim());

      if (matchedName) {
        return matchedName.trim();
      }
    }

    return CURRENT_USER_NAME;
  }

  function isCurrentUserAuthor(authorName) {
    const currentUserName = getCurrentUserName();
    return [CURRENT_USER_NAME, currentUserName].filter(Boolean).includes(authorName);
  }

  function isLoggedIn() {
    return Boolean(getLoginUserSafely());
  }

  function canUseCommunityWriteFeatures() {
    return isLoggedIn();
  }

  function canManageOwnContent(authorName) {
    return isLoggedIn() && isCurrentUserAuthor(authorName);
  }

  function ensureLoggedIn(featureName = '이 기능을') {
    if (isLoggedIn()) {
      return true;
    }

    showToastMessage(`로그인 후 ${featureName} 이용할 수 있어요.`);
    return false;
  }

  function applyLoginUiState() {
    const loggedIn = isLoggedIn();
    const chatLoggedInBoxEl = document.querySelector('.chat1');
    const chatGuestBoxEl = document.querySelector('.chat2');
    const chatLiveLayoutEl = document.querySelector('.chat-live-layout');

    if (floatingWriteButtonEl) {
      floatingWriteButtonEl.style.display = loggedIn ? '' : 'none';
    }

    if (chatLoggedInBoxEl) {
      chatLoggedInBoxEl.style.display = loggedIn ? 'block' : 'none';
    }

    if (chatGuestBoxEl) {
      chatGuestBoxEl.style.display = loggedIn ? 'none' : 'block';
    }

    if (chatLiveLayoutEl) {
      chatLiveLayoutEl.style.display = loggedIn ? '' : 'none';
    }

    if (commentInputEl) {
      commentInputEl.disabled = !loggedIn;
      commentInputEl.placeholder = loggedIn ? '댓글을 입력해 주세요.' : '로그인 후 댓글을 작성할 수 있어요.';
    }

    if (addCommentButtonEl) {
      addCommentButtonEl.disabled = !loggedIn;
      addCommentButtonEl.style.opacity = loggedIn ? '' : '0.55';
      addCommentButtonEl.style.pointerEvents = loggedIn ? '' : 'none';
    }
  }

  function showToastMessage(messageText) {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.textContent = messageText;

    document.body.appendChild(toastEl);

    setTimeout(() => {
      toastEl.remove();
    }, 1800);
  }

  function openConfirmModal(messageText, yesAction) {
    confirmTextEl.textContent = messageText;
    pendingConfirmAction = yesAction;
    confirmModalEl.classList.remove('hide');
    modalOverlayEl.classList.remove('hide');
  }

  function closeConfirmModal() {
    confirmModalEl.classList.add('hide');
    pendingConfirmAction = null;

    if (postModalEl.classList.contains('hide')) {
      modalOverlayEl.classList.add('hide');
    }
  }

  function getTrimmedTextInfo(textValue, limitLength) {
    const rawText = String(textValue || '');
    const isTruncated = rawText.length > limitLength;

    return {
      text: isTruncated ? `${rawText.slice(0, limitLength)}...` : rawText,
      truncated: isTruncated,
      raw: rawText
    };
  }

  /* [07-1-1] 랜덤 답장/배경 채팅에서 공통으로 쓰는 안전한 랜덤 추출 함수 */
  function pickRandomItem(itemList) {
    if (!Array.isArray(itemList) || itemList.length === 0) {
      return '';
    }

    const randomIndex = Math.floor(Math.random() * itemList.length);
    return itemList[randomIndex];
  }

  /* [07-2] PC hover / 모바일 클릭 툴팁용 래퍼 마크업 */
  function createSmartTooltipMarkup(tagName, className, textInfo, lineClampClassName = '') {
    const safeTagName = tagName === 'p' ? 'p' : 'h4';
    const innerMarkup = `<${safeTagName} class="${className}${lineClampClassName ? ` ${lineClampClassName}` : ''}">${escapeHtml(textInfo.text)}</${safeTagName}>`;

    if (!textInfo.truncated) {
      return innerMarkup;
    }

    return `
      <div class="tooltip-target js-smart-tooltip" data-full-text="${escapeHtml(textInfo.raw)}">
        ${innerMarkup}
        <div class="smart-tooltip-bubble">${escapeHtml(textInfo.raw)}</div>
      </div>
    `;
  }

  /* [07-3] 숫자 페이지 버튼 묶음을 렌더링하는 함수 */
  /* [07-3] 내 소식 / 활동 현재 페이지 번호를 반환하는 함수 */
  function getCurrentMyPageNumber() {
    return currentMyTabName === 'alarm' ? currentMyAlarmPage : currentMyActivityPage;
  }

  /* [07-3-1] 내 소식 / 활동 현재 페이지 번호를 저장하는 함수 */
  function setCurrentMyPageNumber(pageNumber) {
    if (currentMyTabName === 'alarm') {
      currentMyAlarmPage = pageNumber;
      return;
    }

    currentMyActivityPage = pageNumber;
  }

  /* [07-3-2] 내 소식 / 활동 숫자 버튼 묶음을 렌더링하는 함수 */
  function renderMyPageNumberButtons(totalPageCount) {
    if (!myPagerRowEl || !myPageNumberListEl || !myPrevPageButtonEl || !myNextPageButtonEl) {
      return;
    }

    if (totalPageCount <= 1) {
      myPagerRowEl.classList.add('hide-empty-pager');
      myPageNumberListEl.innerHTML = '';
      myPrevPageButtonEl.disabled = true;
      myNextPageButtonEl.disabled = true;
      return;
    }

    myPagerRowEl.classList.remove('hide-empty-pager');

    const currentMyPageNumber = getCurrentMyPageNumber();
    const visibleButtonCount = 5;
    let startPageNumber = Math.max(1, currentMyPageNumber - Math.floor(visibleButtonCount / 2));
    let endPageNumber = Math.min(totalPageCount, startPageNumber + visibleButtonCount - 1);

    if (endPageNumber - startPageNumber < visibleButtonCount - 1) {
      startPageNumber = Math.max(1, endPageNumber - visibleButtonCount + 1);
    }

    const pageButtonMarkupList = [];

    for (let pageNumber = startPageNumber; pageNumber <= endPageNumber; pageNumber += 1) {
      pageButtonMarkupList.push(`
        <button
          type="button"
          class="page-number-btn ${pageNumber === currentMyPageNumber ? 'active' : ''}"
          data-my-page-number="${pageNumber}"
          aria-label="${pageNumber}페이지 보기"
          aria-current="${pageNumber === currentMyPageNumber ? 'page' : 'false'}"
        >
          ${pageNumber}
        </article>
      `);
    }

    myPageNumberListEl.innerHTML = pageButtonMarkupList.join('');

    myPageNumberListEl.querySelectorAll('.page-number-btn').forEach((pageButtonEl) => {
      pageButtonEl.onclick = () => {
        setCurrentMyPageNumber(Number(pageButtonEl.dataset.myPageNumber));
        renderMyPage();
      };
    });

    myPrevPageButtonEl.disabled = currentMyPageNumber === 1;
    myNextPageButtonEl.disabled = currentMyPageNumber === totalPageCount;
  }

  function renderPageNumberButtons(totalPageCount) {
    if (!allPageNumberListEl) {
      return;
    }

    const visibleButtonCount = 5;
    let startPageNumber = Math.max(1, currentMoreListPage - Math.floor(visibleButtonCount / 2));
    let endPageNumber = Math.min(totalPageCount, startPageNumber + visibleButtonCount - 1);

    if (endPageNumber - startPageNumber < visibleButtonCount - 1) {
      startPageNumber = Math.max(1, endPageNumber - visibleButtonCount + 1);
    }

    const pageButtonMarkupList = [];

    for (let pageNumber = startPageNumber; pageNumber <= endPageNumber; pageNumber += 1) {
      pageButtonMarkupList.push(`
        <button
          type="button"
          class="page-number-btn ${pageNumber === currentMoreListPage ? 'active' : ''}"
          data-page-number="${pageNumber}"
          aria-label="${pageNumber}페이지 보기"
          aria-current="${pageNumber === currentMoreListPage ? 'page' : 'false'}"
        >
          ${pageNumber}
        </button>
      `);
    }

    allPageNumberListEl.innerHTML = pageButtonMarkupList.join('');

    allPageNumberListEl.querySelectorAll('.page-number-btn').forEach((pageButtonEl) => {
      pageButtonEl.onclick = () => {
        currentMoreListPage = Number(pageButtonEl.dataset.pageNumber);
        renderMoreListPage();
      };
    });
  }

  /* [07-4] 채팅 화면 상단 우측 전용 토스트 */
  function showChatToastMessage(messageText) {
    const targetToastStackEl = isCompactChatView() && chatMobileToastStackEl ? chatMobileToastStackEl : chatToastStackEl;

    if (!targetToastStackEl) {
      return;
    }

    const chatToastEl = document.createElement('div');
    chatToastEl.className = 'chat-inline-toast';
    chatToastEl.textContent = messageText;
    targetToastStackEl.prepend(chatToastEl);

    const maxToastCount = isCompactChatView() ? 1 : 2;

    while (targetToastStackEl.children.length > maxToastCount) {
      targetToastStackEl.lastElementChild.remove();
    }

    window.setTimeout(() => {
      chatToastEl.classList.add('fade-out');

      window.setTimeout(() => {
        chatToastEl.remove();
      }, 180);
    }, 1800);
  }

  /* [07-5] 모바일 클릭 툴팁 닫기 */
  function closeMobileTooltip() {
    if (openMobileTooltipEl) {
      openMobileTooltipEl.classList.remove('show-mobile-tooltip');
      openMobileTooltipEl = null;
    }
  }

  function createTagMarkup(tagList) {
    return `
      <div class="tag-row">
        ${tagList.map((tagText) => `<span class="tag-chip">${escapeHtml(tagText)}</span>`).join('')}
      </div>
    `;
  }

  function createPostActionButtonsMarkup(postItem, extraClassName = '') {
    if (!isCurrentUserAuthor(postItem.author)) {
      return '';
    }

    return `
      <div class="post-action-group ${extraClassName}">
        <button type="button" class="edit-inline-btn small-btn js-edit-post" data-id="${postItem.id}">
          ${iconMarkupMap.edit}
          <span>수정</span>
        </button>
        <button type="button" class="danger-inline-btn small-btn js-delete-post" data-id="${postItem.id}">
          ${iconMarkupMap.delete}
          <span>삭제</span>
        </button>
      </div>
    `;
  }

  function createAlarmDeleteButtonMarkup(alarmItem) {
    return `
      <div class="post-action-group">
        <button type="button" class="danger-inline-btn small-btn js-delete-alarm" data-alarm-id="${alarmItem.id}">
          ${iconMarkupMap.delete}
          <span>삭제</span>
        </button>
      </div>
    `;
  }

  function clearInlineEditState() {
    editingCommentId = null;
    editingReplyId = null;
    editingReplyParentCommentId = null;
  }

  /* [07-1] 게시글 삭제 공통 처리 */
  function deletePostAndRefresh(postId) {
    postList = postList.filter((postItem) => String(postItem.id) !== String(postId));
    clearInlineEditState();
    removeActivityLogsByPostId(postId);
    savePostList();

    if (String(currentDetailPostId) === String(postId)) {
      currentDetailPostId = null;
      showPage('all');
      closeMoreListPage();
    }

    renderAllPage();
    renderMyPage();

    if (!allMoreSectionEl.classList.contains('hidden-panel')) {
      renderMoreListPage();
    }

    if (currentPageName === 'detail' && currentDetailPostId) {
      renderDetailPage();
    }

    showToastMessage('게시글이 삭제되었습니다.');
  }

  /* [07-2] 게시글 카드 안 수정 / 삭제 버튼 이벤트 */
  function bindPostActionEvents(rootEl) {
    rootEl.querySelectorAll('.js-edit-post').forEach((editButtonEl) => {
      editButtonEl.addEventListener('click', (event) => {
        event.stopPropagation();
        openEditModal(editButtonEl.dataset.id);
      });
    });

    rootEl.querySelectorAll('.js-delete-post').forEach((deleteButtonEl) => {
      deleteButtonEl.addEventListener('click', (event) => {
        event.stopPropagation();

        openConfirmModal('이 게시글을 삭제하시겠습니까?', () => {
          deletePostAndRefresh(deleteButtonEl.dataset.id);
        });
      });
    });
  }

  /* ====================================================================== */
  /* [08] 페이지 전환 관련                                                     */
  /* ====================================================================== */
  function showPage(pageName) {
    currentPageName = pageName;

    [allPageSectionEl, myPageSectionEl, chatPageSectionEl, detailPageSectionEl].forEach((sectionEl) => {
      sectionEl.classList.remove('active');
    });

    const pageSectionMap = {
      all: allPageSectionEl,
      mine: myPageSectionEl,
      chat: chatPageSectionEl,
      detail: detailPageSectionEl
    };

    pageSectionMap[pageName].classList.add('active');

    [allMenuButtonEl, myMenuButtonEl, chatMenuButtonEl].forEach((buttonEl) => {
      buttonEl.classList.remove('active');
    });

    if (pageName === 'all' || pageName === 'detail') {
      allMenuButtonEl.classList.add('active');
    }

    if (pageName === 'mine') {
      myMenuButtonEl.classList.add('active');
    }

    if (pageName === 'chat') {
      chatMenuButtonEl.classList.add('active');
      renderChatPage();
      startBackgroundChatFlow();
    }
  }

  /* ====================================================================== */
  /* [09] 게시글 정렬 관련                                                     */
  /* ====================================================================== */
  function getPopularPostList() {
    return [...postList].sort((postA, postB) => (postB.likes + postB.views) - (postA.likes + postA.views));
  }

  function getRecentPostList() {
    return [...postList].sort((postA, postB) => (postA.datetime < postB.datetime ? 1 : -1));
  }

  function isMobileView() {
    return window.innerWidth <= 760;
  }

  /* [09-0-1] 인기글 반응형 재렌더 기준: 모바일/웹 전환 시 텍스트 길이를 다시 계산하기 위해 상태 저장 */
  let previousHotBreakpointMode = isMobileView();

  /* [09-1] 채팅 토스트는 화면을 줄여 보는 상황까지 포함해 조금 더 넓은 구간에서 모바일형으로 처리 */
  function isCompactChatView() {
    return window.innerWidth <= 980;
  }

  /* [09-2] 채팅 페이지가 실제로 열려 있는지 currentPageName + 화면 상태를 함께 확인 */
  function isChatPageVisible() {
    return currentPageName === 'chat' || (chatPageSectionEl && chatPageSectionEl.classList.contains('active'));
  }

  /* ====================================================================== */
  /* [10] 카드 마크업 생성                                                     */
  /* ====================================================================== */
  function createHotPostCardMarkup(postItem) {
    /* [10-0] 인기글은 모바일/웹 텍스트 길이를 분리해서, 넓은 화면에서는 더 길게 보이도록 처리 */
    const hasThumbnail = postItem.images && postItem.images.length;
    const titleInfo = getTrimmedTextInfo(
      postItem.title,
      hasThumbnail ? (isMobileView() ? 11 : 38) : (isMobileView() ? 12 : 44)
    );
    const contentInfo = getTrimmedTextInfo(
      postItem.content,
      hasThumbnail ? (isMobileView() ? 18 : 120) : (isMobileView() ? 22 : 148)
    );
    const thumbnailMarkup = hasThumbnail
      ? `<div class="post-thumb"><img src="${postItem.images[0]}" alt="게시글 이미지"></div>`
      : '';

    return `
      <article class="hot-card ${hasThumbnail ? 'has-thumbnail' : ''} js-open-post" data-id="${postItem.id}">
        <div class="post-top">
          <div class="author-inline">
            <span class="author-dot"></span>
            <span class="author-name">${escapeHtml(postItem.author)}</span>
          </div>
          <div class="post-right-meta">
            <span>${escapeHtml(postItem.datetime)}</span>
          </div>
        </div>

        <div class="post-main-row">
          <div class="post-text-col">
            ${createSmartTooltipMarkup('h4', 'post-title', titleInfo, 'truncate-1')}
            ${createSmartTooltipMarkup('p', 'post-excerpt', contentInfo, 'truncate-2')}
            ${createTagMarkup(postItem.tags)}
          </div>
          ${thumbnailMarkup}
        </div>

        <div class="post-bottom-row">
          <div class="post-stats">
            <span class="stat-item">${iconMarkupMap.eye}<span>${postItem.views}</span></span>
            <span class="stat-item">${iconMarkupMap.heart}<span>${postItem.likes}</span></span>
            <span class="stat-item">${iconMarkupMap.comment}<span>${postItem.comments.length}</span></span>
          </div>
          ${createPostActionButtonsMarkup(postItem)}
        </div>
      </article>
    `;
  }

  function createPostListCardMarkup(postItem, isCompact = false) {
    const titleLimit = isMobileView() && postItem.images && postItem.images.length ? (isCompact ? 18 : 22) : (isCompact ? 30 : 34);
    const contentLimit = isMobileView() && postItem.images && postItem.images.length ? 42 : 110;
    const titleInfo = getTrimmedTextInfo(postItem.title, titleLimit);
    const contentInfo = getTrimmedTextInfo(postItem.content, contentLimit);
    const thumbnailMarkup = postItem.images && postItem.images.length
      ? `<div class="post-thumb"><img src="${postItem.images[0]}" alt="게시글 이미지"></div>`
      : '';

    return `
      <article class="post-card js-open-post" data-id="${postItem.id}">
        <div class="post-top">
          <div class="author-inline">
            <span class="author-dot"></span>
            <span class="author-name">${escapeHtml(postItem.author)}</span>
          </div>

          <div class="post-right-meta">
            <span>${escapeHtml(postItem.datetime)}</span>
          </div>
        </div>

        <div class="post-main-row">
          <div class="post-text-col">
            ${createSmartTooltipMarkup('h4', 'post-title', titleInfo, 'truncate-1')}
            ${createSmartTooltipMarkup('p', 'post-excerpt', contentInfo, 'truncate-2')}
            ${createTagMarkup(postItem.tags)}
          </div>
          ${thumbnailMarkup}
        </div>

        <div class="post-bottom-row">
          <div class="post-stats">
            <span class="stat-item">${iconMarkupMap.eye}<span>${postItem.views}</span></span>
            <span class="stat-item">${iconMarkupMap.heart}<span>${postItem.likes}</span></span>
            <span class="stat-item">${iconMarkupMap.comment}<span>${postItem.comments.length}</span></span>
          </div>
          ${createPostActionButtonsMarkup(postItem)}
        </div>
      </article>
    `;
  }

  function bindPostCardEvents(rootEl) {
    rootEl.querySelectorAll('.js-open-post').forEach((postCardEl) => {
      postCardEl.addEventListener('click', (event) => {
        if (
          event.target.closest('.js-edit-post') ||
          event.target.closest('.js-delete-post') ||
          event.target.closest('button') ||
          (isMobileView() && event.target.closest('.js-smart-tooltip'))
        ) {
          return;
        }

        openDetailPage(postCardEl.dataset.id);
      });
    });

    bindPostActionEvents(rootEl);
  }

  /* [10-1] 말줄임 텍스트 툴팁: PC는 hover, 모바일은 클릭 */
  function bindSmartTooltipEvents(rootEl = document) {
    rootEl.querySelectorAll('.js-smart-tooltip').forEach((tooltipTargetEl) => {
      tooltipTargetEl.setAttribute('tabindex', '0');
      tooltipTargetEl.onclick = (event) => {
        if (!isMobileView()) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const isAlreadyOpen = tooltipTargetEl.classList.contains('show-mobile-tooltip');
        closeMobileTooltip();

        if (!isAlreadyOpen) {
          tooltipTargetEl.classList.add('show-mobile-tooltip');
          openMobileTooltipEl = tooltipTargetEl;
        }
      };
    });
  }

  /* ====================================================================== */
  /* [11] 전체 페이지 렌더링                                                   */
  /* ====================================================================== */
  function renderAllPage() {
    hotPostListEl.innerHTML = getPopularPostList().slice(0, 3).map(createHotPostCardMarkup).join('');
    latestPostListEl.innerHTML = getRecentPostList().slice(0, 8).map((postItem) => createPostListCardMarkup(postItem, true)).join('');

    bindPostCardEvents(hotPostListEl);
    bindPostCardEvents(latestPostListEl);
    bindSmartTooltipEvents(hotPostListEl);
    bindSmartTooltipEvents(latestPostListEl);
  }

  function openMoreListPage(listMode) {
    currentMoreListMode = listMode;
    currentMoreListPage = 1;

    allPreviewSectionEl.classList.add('hidden-panel');
    allMoreSectionEl.classList.remove('hidden-panel');

    renderMoreListPage();
  }

  function closeMoreListPage() {
    allMoreSectionEl.classList.add('hidden-panel');
    allPreviewSectionEl.classList.remove('hidden-panel');
  }

  function renderMoreListPage() {
    const targetPostList = currentMoreListMode === 'hot' ? getPopularPostList() : getRecentPostList();
    const totalPageCount = Math.max(1, Math.ceil(targetPostList.length / MORE_LIST_PAGE_SIZE));

    allMoreTitleEl.textContent = currentMoreListMode === 'hot' ? '인기글 전체' : '최신글 전체';

    if (allMoreDescEl) {
      allMoreDescEl.textContent = currentMoreListMode === 'hot' ? '인기 순으로 정렬된 글' : '최근 등록 순으로 정렬된 글';
    }

    if (currentMoreListPage > totalPageCount) {
      currentMoreListPage = totalPageCount;
    }

    const startIndex = (currentMoreListPage - 1) * MORE_LIST_PAGE_SIZE;
    const endIndex = startIndex + MORE_LIST_PAGE_SIZE;

    allMoreListEl.innerHTML = targetPostList.slice(startIndex, endIndex).map(createPostListCardMarkup).join('');
    bindPostCardEvents(allMoreListEl);
    bindSmartTooltipEvents(allMoreListEl);

    renderPageNumberButtons(totalPageCount);
    allPrevPageButtonEl.disabled = currentMoreListPage === 1;
    allNextPageButtonEl.disabled = currentMoreListPage === totalPageCount;
  }

  /* ====================================================================== */
  /* [12] 상세 페이지 렌더링                                                   */
  /* ====================================================================== */
  function openDetailPage(postId) {
    const selectedPostItem = findPostById(postId);

    if (!selectedPostItem) {
      return;
    }

    selectedPostItem.views += 1;
    savePostList();

    currentDetailPostId = selectedPostItem.id;
    clearInlineEditState();

    renderAllPage();
    renderMyPage();
    renderDetailPage();
    showPage('detail');
  }

  function renderDetailPage() {
    const selectedPostItem = findPostById(currentDetailPostId);

    if (!selectedPostItem) {
      return;
    }

    detailCardEl.innerHTML = `
      <div class="detail-head-row">
        <div class="detail-head-main">
          <h2 class="detail-title">${escapeHtml(selectedPostItem.title)}</h2>
          <div class="detail-top-meta">
            <span>${escapeHtml(selectedPostItem.author)}</span>
            <span>·</span>
            <span>${escapeHtml(selectedPostItem.datetime)}</span>
            <span>·</span>
            <span class="stat-item">${iconMarkupMap.eye}<span>${selectedPostItem.views}</span></span>
            <span>·</span>
            <span class="stat-item">${iconMarkupMap.comment}<span>${selectedPostItem.comments.length}</span></span>
          </div>
        </div>

        ${canManageOwnContent(selectedPostItem.author) ? `
          <div class="detail-head-actions detail-head-actions-desktop">
            <button type="button" class="edit-inline-btn js-detail-edit" data-id="${selectedPostItem.id}">
              ${iconMarkupMap.edit}
              <span>수정</span>
            </button>
            <button type="button" class="danger-inline-btn js-detail-delete" data-id="${selectedPostItem.id}">
              ${iconMarkupMap.delete}
              <span>삭제</span>
            </button>
          </div>
        ` : ''}
      </div>

      <div class="detail-content">${convertNewLineToBr(selectedPostItem.content)}</div>

      ${selectedPostItem.images.length ? `
        <div class="detail-image-list">
          ${selectedPostItem.images.map((imageSrc, imageIndex) => `
            <img src="${imageSrc}" alt="이미지 ${imageIndex + 1}" class="js-detail-image" data-src="${imageSrc}">
          `).join('')}
        </div>
      ` : ''}

      ${createTagMarkup(selectedPostItem.tags)}

      <div class="center-recommend-row">
        <button type="button" class="recommend-btn ${selectedPostItem.liked ? 'active' : ''}" id="recommendBtn">
          ${iconMarkupMap.heart}
          <span>추천 ${selectedPostItem.likes}</span>
        </button>
      </div>

      <div class="icon-button-row detail-action-row">
        <button type="button" class="icon-button" id="saveDetailBtn">
          ${iconMarkupMap.bookmark}
          <span class="icon-button-label">${selectedPostItem.saved ? '저장 취소' : '저장'}</span>
          <span class="count-badge">${selectedPostItem.saveCount || 0}</span>
        </button>

        <button type="button" class="icon-button" id="shareDetailBtn">
          ${iconMarkupMap.share}
          <span class="icon-button-label">공유</span>
          <span class="count-badge">${selectedPostItem.shareCount || 0}</span>
        </button>

        <button type="button" class="icon-button" id="reportDetailBtn">
          ${iconMarkupMap.flag}
          <span class="icon-button-label">신고</span>
          <span class="count-badge">${selectedPostItem.reportCount || 0}</span>
        </button>

        ${canManageOwnContent(selectedPostItem.author) ? `
          <div class="post-action-group detail-mobile-actions">
            <button type="button" class="edit-inline-btn js-detail-edit" data-id="${selectedPostItem.id}">
              ${iconMarkupMap.edit}
              <span>수정</span>
            </button>
            <button type="button" class="danger-inline-btn js-detail-delete" data-id="${selectedPostItem.id}">
              ${iconMarkupMap.delete}
              <span>삭제</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    detailCardEl.querySelectorAll('.js-detail-edit').forEach((detailEditButtonEl) => {
      detailEditButtonEl.onclick = () => {
        openEditModal(selectedPostItem.id);
      };
    });

    detailCardEl.querySelectorAll('.js-detail-delete').forEach((detailDeleteButtonEl) => {
      detailDeleteButtonEl.onclick = () => {
        openConfirmModal('이 게시글을 삭제하시겠습니까?', () => {
          deletePostAndRefresh(selectedPostItem.id);
        });
      };
    });

    const recommendButtonEl = document.getElementById('recommendBtn');
    const saveDetailButtonEl = document.getElementById('saveDetailBtn');
    const shareDetailButtonEl = document.getElementById('shareDetailBtn');
    const reportDetailButtonEl = document.getElementById('reportDetailBtn');

    recommendButtonEl.onclick = () => {
      if (!ensureLoggedIn('추천을')) {
        return;
      }

      selectedPostItem.liked = !selectedPostItem.liked;
      selectedPostItem.likes += selectedPostItem.liked ? 1 : -1;

      if (selectedPostItem.likes < 0) {
        selectedPostItem.likes = 0;
      }

      savePostList();
      if (selectedPostItem.liked) {
        addActivityLog('내가 공감한 글', selectedPostItem.id);
      }
      renderAllPage();
      renderMyPage();
      renderDetailPage();
    };

    saveDetailButtonEl.onclick = () => {
      if (!ensureLoggedIn('저장을')) {
        return;
      }

      selectedPostItem.saved = !selectedPostItem.saved;
      selectedPostItem.saveCount = Math.max(0, (selectedPostItem.saveCount || 0) + (selectedPostItem.saved ? 1 : -1));

      savePostList();
      if (selectedPostItem.saved) {
        addActivityLog('내가 저장한 글', selectedPostItem.id);
      }
      renderMyPage();
      renderDetailPage();
      showToastMessage(selectedPostItem.saved ? '저장되었습니다.' : '저장이 취소되었습니다.');
    };

    shareDetailButtonEl.onclick = async () => {
      if (!ensureLoggedIn('공유를')) {
        return;
      }

      selectedPostItem.shareCount = (selectedPostItem.shareCount || 0) + 1;
      savePostList();

      try {
        await navigator.clipboard.writeText(`${location.origin}${location.pathname}#post-${selectedPostItem.id}`);
      } catch (error) {
        // 클립보드 복사가 막혀도 카운트와 화면은 유지
      }

      addActivityLog('내가 공유한 글', selectedPostItem.id);
      renderDetailPage();
      renderMyPage();
      showToastMessage('주소가 복사 되었습니다');
    };

    reportDetailButtonEl.onclick = () => {
      if (!ensureLoggedIn('신고를')) {
        return;
      }

      openConfirmModal('진짜 이 게시글을 신고하겠습니까?', () => {
        selectedPostItem.reportCount = (selectedPostItem.reportCount || 0) + 1;
        savePostList();
        addActivityLog('내가 신고한 글', selectedPostItem.id);
        renderDetailPage();
        renderMyPage();
        showToastMessage('신고 되었습니다.');
      });
    };

    bindDetailImageLightboxEvents();
    renderCommentSection(selectedPostItem);
  }

  /* [12-1] 상세 이미지 클릭 시 크게 보여주는 라이트박스 연결 */
  function openImageLightbox(imageSrc) {
    if (!imageLightboxEl || !imageLightboxImageEl) {
      return;
    }

    imageLightboxImageEl.src = imageSrc;
    imageLightboxEl.classList.remove('hide');
    imageLightboxEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeImageLightbox() {
    if (!imageLightboxEl || !imageLightboxImageEl) {
      return;
    }

    imageLightboxEl.classList.add('hide');
    imageLightboxEl.setAttribute('aria-hidden', 'true');
    imageLightboxImageEl.src = '';
    document.body.classList.remove('modal-open');
  }

  function bindDetailImageLightboxEvents() {
    detailCardEl.querySelectorAll('.js-detail-image').forEach((detailImageEl) => {
      detailImageEl.onclick = () => {
        openImageLightbox(detailImageEl.dataset.src);
      };
    });
  }

  /* ====================================================================== */
  /* [13] 댓글 / 대댓글 렌더링                                                 */
  /* ====================================================================== */
  function renderCommentSection(postItem) {
    if (!postItem.comments.length) {
      commentListEl.innerHTML = '<div class="empty-box">아직 댓글이 없어요</div>';
      return;
    }

    commentListEl.innerHTML = postItem.comments.map((commentItem) => {
      const isCommentEditing = String(editingCommentId) === String(commentItem.id);

      return `
        <article class="comment-card">
          <div class="comment-head">
            <div class="comment-author">${escapeHtml(commentItem.author)} · ${escapeHtml(commentItem.datetime)}</div>
            <div class="comment-form-bottom">
              ${canManageOwnContent(commentItem.author) ? `
                <button type="button" class="edit-inline-btn small-btn js-edit-comment" data-comment-id="${commentItem.id}">
                  ${iconMarkupMap.edit}
                  <span>수정</span>
                </button>
                <button type="button" class="danger-inline-btn small-btn js-delete-comment" data-comment-id="${commentItem.id}">
                  ${iconMarkupMap.delete}
                  <span>삭제</span>
                </button>
              ` : ''}
              ${isLoggedIn() ? `
                <button
                  type="button"
                  class="line-btn small-btn js-reply-toggle"
                  data-comment-id="${commentItem.id}"
                  data-nick="${escapeHtml(commentItem.author)}"
                >
                  답글
                </button>
              ` : ''}
            </div>
          </div>

          ${isCommentEditing ? `
            <div class="inline-edit-wrap">
              <textarea class="inline-edit-textarea js-comment-edit-input" data-comment-id="${commentItem.id}">${escapeHtml(commentItem.text)}</textarea>
              <div class="inline-edit-actions">
                <button type="button" class="line-btn small-btn js-cancel-comment-edit">취소</button>
                <button type="button" class="main-btn small-btn js-save-comment-edit" data-comment-id="${commentItem.id}">저장</button>
              </div>
            </div>
          ` : `<div class="comment-text">${convertNewLineToBr(commentItem.text)}</div>`}

          <div class="reply-wrap">
            ${(commentItem.replies || []).map((replyItem) => {
              const isReplyEditing = String(editingReplyParentCommentId) === String(commentItem.id) && String(editingReplyId) === String(replyItem.id);

              return `
                <article class="reply-card">
                  <div class="comment-head">
                    <div class="comment-author">${escapeHtml(replyItem.author)} · ${escapeHtml(replyItem.datetime)}</div>
                    <div class="comment-form-bottom">
                      ${canManageOwnContent(replyItem.author) ? `
                        <button
                          type="button"
                          class="edit-inline-btn small-btn js-edit-reply"
                          data-comment-id="${commentItem.id}"
                          data-reply-id="${replyItem.id}"
                        >
                          ${iconMarkupMap.edit}
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          class="danger-inline-btn small-btn js-delete-reply"
                          data-comment-id="${commentItem.id}"
                          data-reply-id="${replyItem.id}"
                        >
                          ${iconMarkupMap.delete}
                          <span>삭제</span>
                        </button>
                      ` : ''}
                      ${isLoggedIn() ? `
                        <button
                          type="button"
                          class="line-btn small-btn js-reply-toggle"
                          data-comment-id="${commentItem.id}"
                          data-nick="${escapeHtml(replyItem.author)}"
                        >
                          답글
                        </button>
                      ` : ''}
                    </div>
                  </div>

                  ${isReplyEditing ? `
                    <div class="inline-edit-wrap">
                      <textarea class="inline-edit-textarea js-reply-edit-input" data-comment-id="${commentItem.id}" data-reply-id="${replyItem.id}">${escapeHtml(replyItem.text)}</textarea>
                      <div class="inline-edit-actions">
                        <button type="button" class="line-btn small-btn js-cancel-reply-edit">취소</button>
                        <button type="button" class="main-btn small-btn js-save-reply-edit" data-comment-id="${commentItem.id}" data-reply-id="${replyItem.id}">저장</button>
                      </div>
                    </div>
                  ` : `<div class="comment-text">${convertNewLineToBr(replyItem.text)}</div>`}
                </article>
              `;
            }).join('')}

            <div class="reply-form-box hide" id="replyBox-${commentItem.id}">
              <textarea
                class="reply-input"
                id="replyInput-${commentItem.id}"
                placeholder="답글을 입력해 주세요."
              ></textarea>
              <div class="reply-form-bottom">
                <button
                  type="button"
                  class="main-btn js-reply-save"
                  data-comment-id="${commentItem.id}"
                  data-nick="${escapeHtml(commentItem.author)}"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    bindReplyToggleButtons(postItem);
    bindReplySaveButtons(postItem);
    bindCommentEditButtons(postItem);
    bindCommentEditSaveButtons(postItem);
    bindCommentEditCancelButtons(postItem);
    bindCommentDeleteButtons(postItem);
    bindReplyEditButtons(postItem);
    bindReplyEditSaveButtons(postItem);
    bindReplyEditCancelButtons(postItem);
    bindReplyDeleteButtons(postItem);
  }

  function bindReplyToggleButtons(postItem) {
    commentListEl.querySelectorAll('.js-reply-toggle').forEach((replyToggleButtonEl) => {
      replyToggleButtonEl.onclick = () => {
        if (!ensureLoggedIn('답글 작성을')) {
          return;
        }

        const replyBoxEl = document.getElementById(`replyBox-${replyToggleButtonEl.dataset.commentId}`);
        const replyInputEl = document.getElementById(`replyInput-${replyToggleButtonEl.dataset.commentId}`);

        clearInlineEditState();
        replyBoxEl.classList.toggle('hide');
        replyInputEl.value = `@${replyToggleButtonEl.dataset.nick} `;
        replyInputEl.focus();
      };
    });
  }

  function bindReplySaveButtons(postItem) {
    commentListEl.querySelectorAll('.js-reply-save').forEach((replySaveButtonEl) => {
      replySaveButtonEl.onclick = () => {
        if (!ensureLoggedIn('답글 작성을')) {
          return;
        }

        const replyInputEl = document.getElementById(`replyInput-${replySaveButtonEl.dataset.commentId}`);
        const replyText = replyInputEl.value.trim();

        if (!replyText) {
          alert('답글 내용을 입력해 주세요.');
          return;
        }

        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(replySaveButtonEl.dataset.commentId));
        targetCommentItem.replies = targetCommentItem.replies || [];
        targetCommentItem.replies.push({
          id: Date.now(),
          author: getCurrentUserName(),
          text: replyText,
          datetime: getNowText()
        });

        clearInlineEditState();
        savePostList();
        addActivityLog('내가 답글 단 글', postItem.id);
        renderAllPage();
        renderMyPage();
        renderDetailPage();
      };
    });
  }

  function bindCommentEditButtons(postItem) {
    commentListEl.querySelectorAll('.js-edit-comment').forEach((editCommentButtonEl) => {
      editCommentButtonEl.onclick = () => {
        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(editCommentButtonEl.dataset.commentId));

        if (!targetCommentItem || !canManageOwnContent(targetCommentItem.author)) {
          return;
        }

        clearInlineEditState();
        editingCommentId = editCommentButtonEl.dataset.commentId;
        renderCommentSection(postItem);

        const commentEditInputEl = commentListEl.querySelector(`.js-comment-edit-input[data-comment-id="${editCommentButtonEl.dataset.commentId}"]`);

        if (commentEditInputEl) {
          commentEditInputEl.focus();
          commentEditInputEl.selectionStart = commentEditInputEl.value.length;
          commentEditInputEl.selectionEnd = commentEditInputEl.value.length;
        }
      };
    });
  }

  function bindCommentEditSaveButtons(postItem) {
    commentListEl.querySelectorAll('.js-save-comment-edit').forEach((saveButtonEl) => {
      saveButtonEl.onclick = () => {
        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(saveButtonEl.dataset.commentId));

        if (!targetCommentItem || !canManageOwnContent(targetCommentItem.author)) {
          return;
        }

        const commentEditInputEl = commentListEl.querySelector(`.js-comment-edit-input[data-comment-id="${saveButtonEl.dataset.commentId}"]`);
        const nextCommentText = commentEditInputEl.value.trim();

        if (!nextCommentText) {
          alert('내용을 작성해주세요!');
          return;
        }

        targetCommentItem.text = nextCommentText;
        clearInlineEditState();
        savePostList();
        addActivityLog('내가 댓글 단 글', postItem.id);
        renderAllPage();
        renderMyPage();
        renderDetailPage();
        showToastMessage('댓글이 수정되었습니다.');
      };
    });
  }

  function bindCommentEditCancelButtons(postItem) {
    commentListEl.querySelectorAll('.js-cancel-comment-edit').forEach((cancelButtonEl) => {
      cancelButtonEl.onclick = () => {
        clearInlineEditState();
        renderCommentSection(postItem);
      };
    });
  }

  /* [13-1] 댓글 삭제 버튼 이벤트 */
  function bindCommentDeleteButtons(postItem) {
    commentListEl.querySelectorAll('.js-delete-comment').forEach((deleteCommentButtonEl) => {
      deleteCommentButtonEl.onclick = () => {
        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(deleteCommentButtonEl.dataset.commentId));

        if (!targetCommentItem || !canManageOwnContent(targetCommentItem.author)) {
          return;
        }

        openConfirmModal('이 댓글을 삭제하시겠습니까?', () => {
          postItem.comments = postItem.comments.filter((commentItem) => String(commentItem.id) !== String(deleteCommentButtonEl.dataset.commentId));
          clearInlineEditState();
          savePostList();
          renderAllPage();
          renderMyPage();
          renderDetailPage();
          showToastMessage('댓글이 삭제되었습니다.');
        });
      };
    });
  }

  function bindReplyEditButtons(postItem) {
    commentListEl.querySelectorAll('.js-edit-reply').forEach((editReplyButtonEl) => {
      editReplyButtonEl.onclick = () => {
        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(editReplyButtonEl.dataset.commentId));
        const targetReplyItem = targetCommentItem ? (targetCommentItem.replies || []).find((replyItem) => String(replyItem.id) === String(editReplyButtonEl.dataset.replyId)) : null;

        if (!targetReplyItem || !canManageOwnContent(targetReplyItem.author)) {
          return;
        }

        clearInlineEditState();
        editingReplyParentCommentId = editReplyButtonEl.dataset.commentId;
        editingReplyId = editReplyButtonEl.dataset.replyId;
        renderCommentSection(postItem);

        const replyEditInputEl = commentListEl.querySelector(`.js-reply-edit-input[data-comment-id="${editReplyButtonEl.dataset.commentId}"][data-reply-id="${editReplyButtonEl.dataset.replyId}"]`);

        if (replyEditInputEl) {
          replyEditInputEl.focus();
          replyEditInputEl.selectionStart = replyEditInputEl.value.length;
          replyEditInputEl.selectionEnd = replyEditInputEl.value.length;
        }
      };
    });
  }

  function bindReplyEditSaveButtons(postItem) {
    commentListEl.querySelectorAll('.js-save-reply-edit').forEach((saveButtonEl) => {
      saveButtonEl.onclick = () => {
        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(saveButtonEl.dataset.commentId));
        const targetReplyItem = targetCommentItem ? (targetCommentItem.replies || []).find((replyItem) => String(replyItem.id) === String(saveButtonEl.dataset.replyId)) : null;

        if (!targetReplyItem || !canManageOwnContent(targetReplyItem.author)) {
          return;
        }

        const replyEditInputEl = commentListEl.querySelector(`.js-reply-edit-input[data-comment-id="${saveButtonEl.dataset.commentId}"][data-reply-id="${saveButtonEl.dataset.replyId}"]`);
        const nextReplyText = replyEditInputEl.value.trim();

        if (!nextReplyText) {
          alert('내용을 작성해주세요!');
          return;
        }

        targetReplyItem.text = nextReplyText;
        clearInlineEditState();
        savePostList();
        addActivityLog('내가 답글 단 글', postItem.id);
        renderAllPage();
        renderMyPage();
        renderDetailPage();
        showToastMessage('답글이 수정되었습니다.');
      };
    });
  }

  function bindReplyEditCancelButtons(postItem) {
    commentListEl.querySelectorAll('.js-cancel-reply-edit').forEach((cancelButtonEl) => {
      cancelButtonEl.onclick = () => {
        clearInlineEditState();
        renderCommentSection(postItem);
      };
    });
  }

  /* [13-2] 답글 삭제 버튼 이벤트 */
  function bindReplyDeleteButtons(postItem) {
    commentListEl.querySelectorAll('.js-delete-reply').forEach((deleteReplyButtonEl) => {
      deleteReplyButtonEl.onclick = () => {
        const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(deleteReplyButtonEl.dataset.commentId));
        const targetReplyItem = targetCommentItem ? (targetCommentItem.replies || []).find((replyItem) => String(replyItem.id) === String(deleteReplyButtonEl.dataset.replyId)) : null;

        if (!targetReplyItem || !canManageOwnContent(targetReplyItem.author)) {
          return;
        }

        openConfirmModal('이 답글을 삭제하시겠습니까?', () => {
          const targetCommentItem = postItem.comments.find((commentItem) => String(commentItem.id) === String(deleteReplyButtonEl.dataset.commentId));

          if (!targetCommentItem) {
            return;
          }

          targetCommentItem.replies = (targetCommentItem.replies || []).filter((replyItem) => String(replyItem.id) !== String(deleteReplyButtonEl.dataset.replyId));

          clearInlineEditState();
          savePostList();
          renderAllPage();
          renderMyPage();
          renderDetailPage();
          showToastMessage('답글이 삭제되었습니다.');
        });
      };
    });
  }

  /* ====================================================================== */
  /* [14] 내 소식 페이지 렌더링                                                */
  /* ====================================================================== */
  function buildMyAlarmItemList() {
    const alarmItemList = [];

    postList.forEach((postItem) => {
      if (isCurrentUserAuthor(postItem.author)) {
        postItem.comments.forEach((commentItem) => {
          alarmItemList.push({
            id: `comment-${postItem.id}-${commentItem.id}`,
            text: `${commentItem.author}님이 내 글에 댓글을 남겼어요.`,
            time: commentItem.datetime,
            post: postItem
          });
        });

        if (postItem.likes > 0) {
          alarmItemList.push({
            id: `like-${postItem.id}-${postItem.likes}`,
            text: `내 글이 공감 ${postItem.likes}개를 받았어요.`,
            time: postItem.datetime,
            post: postItem
          });
        }

        if ((postItem.saveCount || 0) > 0) {
          alarmItemList.push({
            id: `save-${postItem.id}-${postItem.saveCount || 0}`,
            text: '내 글이 저장되었어요.',
            time: postItem.datetime,
            post: postItem
          });
        }
      }
    });

    /* [14-1] 알림 샘플이 비어 보이지 않도록 기본 샘플 알림도 함께 준비 */
    const myPostList = postList.filter((postItem) => isCurrentUserAuthor(postItem.author));
    const sampleAlarmTextList = [
      '은채님이 내 글 저장을 확인했어요.',
      '민지님이 내 글에 공감 버튼을 눌렀어요.',
      '하린님이 내 글 공유 링크를 확인했어요.',
      '주아님이 내 글에 댓글을 남겼어요.',
      '서연님이 내 글을 다시 보고 갔어요.',
      '민호님이 내 글을 저장했어요.'
    ];

    if (myPostList.length) {
      sampleAlarmTextList.forEach((sampleAlarmText, sampleIndex) => {
        const samplePostItem = myPostList[sampleIndex % myPostList.length];

        alarmItemList.push({
          id: `sample-alarm-${samplePostItem.id}-${sampleIndex}`,
          text: sampleAlarmText,
          time: samplePostItem.datetime,
          post: samplePostItem
        });
      });
    }

    return alarmItemList
      .filter((alarmItem) => !dismissedAlarmIdList.includes(alarmItem.id))
      .sort((itemA, itemB) => (itemA.time < itemB.time ? 1 : -1));
  }

  function buildMyActivityItemList() {
    const inferredActivityItemList = [];

    postList.forEach((postItem) => {
      if (isCurrentUserAuthor(postItem.author)) {
        inferredActivityItemList.push({ label: '내가 작성한 글', post: postItem, time: postItem.datetime });
      }

      if (postItem.liked) {
        inferredActivityItemList.push({ label: '내가 공감한 글', post: postItem, time: postItem.datetime });
      }

      if (postItem.comments.some((commentItem) => isCurrentUserAuthor(commentItem.author) || (commentItem.replies || []).some((replyItem) => isCurrentUserAuthor(replyItem.author)))) {
        inferredActivityItemList.push({ label: '내가 댓글 단 글', post: postItem, time: postItem.datetime });
      }
    });

    const loggedActivityItemList = activityLogList.map((activityLogItem) => {
      const targetPostItem = findPostById(activityLogItem.postId);

      if (!targetPostItem) {
        return null;
      }

      return {
        id: activityLogItem.id,
        label: activityLogItem.label,
        post: targetPostItem,
        time: activityLogItem.time || targetPostItem.datetime
      };
    }).filter(Boolean);

    const mergedActivityMap = new Map();

    [...loggedActivityItemList, ...inferredActivityItemList].forEach((activityItem) => {
      const activityKey = `${activityItem.label}-${activityItem.post.id}`;

      if (!mergedActivityMap.has(activityKey)) {
        mergedActivityMap.set(activityKey, activityItem);
      }
    });

    return [...mergedActivityMap.values()].sort((itemA, itemB) => String(itemA.time || itemA.post.datetime) < String(itemB.time || itemB.post.datetime) ? 1 : -1);
  }

  function createMyActivityCardMarkup(activityItem, isAlarmMode = false) {
    const postItem = activityItem.post;
    const titleInfo = getTrimmedTextInfo(isAlarmMode ? activityItem.text : postItem.title, 28);
    const contentInfo = getTrimmedTextInfo(postItem.content, 82);

    return `
      <article class="activity-card js-open-post" data-id="${postItem.id}">
        <div class="activity-label">${isAlarmMode ? '알림' : escapeHtml(activityItem.label)}</div>

        <div class="activity-title-row">
          ${createSmartTooltipMarkup(
            'h4',
            `post-title ${isAlarmMode ? 'activity-alarm-text' : ''}`,
            titleInfo,
            'truncate-1'
          )}

          <div class="post-right-meta">
            <span>${escapeHtml(isAlarmMode ? activityItem.time : (activityItem.time || postItem.datetime))}</span>
          </div>
        </div>

        ${!isAlarmMode ? `
          ${createSmartTooltipMarkup('p', 'post-excerpt', contentInfo, 'truncate-2')}
        ` : ''}

        ${!isAlarmMode ? createTagMarkup(postItem.tags) : ''}

        <div class="post-bottom-row">
          <div class="post-stats">
            <span class="stat-item">${iconMarkupMap.eye}<span>${postItem.views}</span></span>
            <span class="stat-item">${iconMarkupMap.heart}<span>${postItem.likes}</span></span>
            <span class="stat-item">${iconMarkupMap.comment}<span>${postItem.comments.length}</span></span>
          </div>
          ${isAlarmMode ? createAlarmDeleteButtonMarkup(activityItem) : createPostActionButtonsMarkup(postItem)}
        </div>
      </article>
    `;
  }

  function bindAlarmDeleteButtons() {
    myActivityBoxEl.querySelectorAll('.js-delete-alarm').forEach((deleteAlarmButtonEl) => {
      deleteAlarmButtonEl.onclick = (event) => {
        event.stopPropagation();

        if (!dismissedAlarmIdList.includes(deleteAlarmButtonEl.dataset.alarmId)) {
          dismissedAlarmIdList.push(deleteAlarmButtonEl.dataset.alarmId);
          saveDismissedAlarmIdList();
        }

        renderMyPage();
        showToastMessage('알림이 삭제되었습니다.');
      };
    });
  }

  function renderMyPage() {
    if (!isLoggedIn()) {
      if (myActivityBoxEl) {
        myActivityBoxEl.innerHTML = '<div class="empty-box">로그인 후 내 소식을 확인할 수 있어요</div>';
      }

      if (myPagerRowEl) {
        myPagerRowEl.classList.add('hide-empty-pager');
      }
      return;
    }

    const sourceItemList = currentMyTabName === 'alarm'
      ? buildMyAlarmItemList()
      : buildMyActivityItemList();

    const totalPageCount = Math.max(1, Math.ceil(sourceItemList.length / MY_PAGE_SIZE));
    let currentMyPageNumber = getCurrentMyPageNumber();

    if (currentMyPageNumber > totalPageCount) {
      currentMyPageNumber = totalPageCount;
      setCurrentMyPageNumber(totalPageCount);
    }

    const startIndex = (currentMyPageNumber - 1) * MY_PAGE_SIZE;
    const visibleItemList = sourceItemList.slice(startIndex, startIndex + MY_PAGE_SIZE);
    const htmlMarkup = currentMyTabName === 'alarm'
      ? visibleItemList.map((alarmItem) => createMyActivityCardMarkup(alarmItem, true)).join('')
      : visibleItemList.map((activityItem) => createMyActivityCardMarkup(activityItem, false)).join('');

    myActivityBoxEl.innerHTML = htmlMarkup || '<div class="empty-box">표시할 내역이 없어요</div>';
    bindPostCardEvents(myActivityBoxEl);
    bindSmartTooltipEvents(myActivityBoxEl);
    renderMyPageNumberButtons(totalPageCount);

    if (currentMyTabName === 'alarm') {
      bindAlarmDeleteButtons();
    }
  }

  /* ====================================================================== */
  /* [15] 채팅 페이지 렌더링                                                   */
  /* ====================================================================== */
  function getCurrentChatRoom() {
    return findChatRoomById(currentChatRoomId) || chatRoomList[0] || null;
  }

  function getChatPreviewText(chatRoomItem) {
    const lastMessageItem = (chatRoomItem.messages || [])[chatRoomItem.messages.length - 1];

    if (!lastMessageItem) {
      return '아직 메시지가 없어요.';
    }

    return getTrimmedTextInfo(lastMessageItem.text, 28).text;
  }

  function renderChatRoomList() {
    if (!chatRoomListEl) {
      return;
    }

    if (!chatRoomList.length) {
      chatRoomListEl.innerHTML = '<div class="empty-box">현재 참여 중인 채팅방이 없어요</div>';
      return;
    }

    chatRoomListEl.innerHTML = chatRoomList.map((chatRoomItem) => {
      const lastMessageItem = (chatRoomItem.messages || [])[chatRoomItem.messages.length - 1];
      const previewText = getChatPreviewText(chatRoomItem);
      const hasUnreadSignal = !chatRoomItem.muted && Number(chatRoomItem.unreadCount || 0) > 0;

      return `
        <article
          class="chat-room-item ${String(chatRoomItem.id) === String(currentChatRoomId) ? 'active' : ''} ${hasUnreadSignal ? 'has-unread' : ''}"
          data-room-id="${chatRoomItem.id}"
          role="button"
          tabindex="0"
        >
          <div class="chat-room-item-top">
            <div class="chat-room-main">
              <div class="chat-room-name-row">
                <div class="chat-room-name">${escapeHtml(chatRoomItem.name)}</div>
                ${chatRoomItem.muted ? '<span class="chat-room-muted-badge">알림끔</span>' : ''}
                ${hasUnreadSignal ? '<span class="chat-room-visual-badge"><span class="chat-room-visual-dot" aria-hidden="true"></span>새 메시지</span>' : ''}
              </div>
              <div class="chat-room-subtitle">${escapeHtml(chatRoomItem.subtitle)}</div>
            </div>
            <div class="chat-room-inline-actions">
              <button
                type="button"
                class="chat-room-icon-btn js-chat-room-mute"
                data-room-id="${chatRoomItem.id}"
                aria-label="${chatRoomItem.muted ? '알림 켜기' : '알림 끄기'}"
                title="${chatRoomItem.muted ? '알림 켜기' : '알림 끄기'}"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6.8 9H4v6h2.8L11 19V5Z"></path>${chatRoomItem.muted ? '<path d="m15 9 4 6"></path><path d="m19 9-4 6"></path>' : '<path d="M16 9.5a4.5 4.5 0 0 1 0 5"></path><path d="M18.8 7a8 8 0 0 1 0 10"></path>'}</svg>
              </button>
              <button
                type="button"
                class="chat-room-icon-btn danger js-chat-room-leave"
                data-room-id="${chatRoomItem.id}"
                aria-label="채팅방 나가기"
                title="채팅방 나가기"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 6H6.8A1.8 1.8 0 0 0 5 7.8v8.4A1.8 1.8 0 0 0 6.8 18H10"></path><path d="M14 8l5 4-5 4"></path><path d="M19 12H9"></path></svg>
              </button>
            </div>
          </div>
          <div class="chat-room-bottom-row">
            <div class="chat-room-preview">${escapeHtml(previewText)}</div>
            <div class="chat-room-right">
              <span class="chat-room-time">${escapeHtml(lastMessageItem ? lastMessageItem.time : '방금')}</span>
              ${hasUnreadSignal ? `<span class="chat-room-badge">${chatRoomItem.unreadCount}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    chatRoomListEl.querySelectorAll('.chat-room-item').forEach((chatRoomItemEl) => {
      const selectChatRoom = () => {
        currentChatRoomId = chatRoomItemEl.dataset.roomId;
        const selectedChatRoomItem = getCurrentChatRoom();

        if (selectedChatRoomItem) {
          selectedChatRoomItem.unreadCount = 0;
          saveChatRoomList();
        }

        markChatActivity();
        renderChatPage();
      };

      chatRoomItemEl.onclick = (event) => {
        if (event.target.closest('.chat-room-inline-actions')) {
          return;
        }

        selectChatRoom();
      };

      chatRoomItemEl.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectChatRoom();
        }
      };
    });

    chatRoomListEl.querySelectorAll('.js-chat-room-mute').forEach((muteButtonEl) => {
      muteButtonEl.onclick = (event) => {
        event.stopPropagation();
        const targetChatRoomItem = findChatRoomById(muteButtonEl.dataset.roomId);

        if (!targetChatRoomItem) {
          return;
        }

        targetChatRoomItem.muted = !targetChatRoomItem.muted;

        if (targetChatRoomItem.muted) {
          targetChatRoomItem.unreadCount = 0;
        }

        saveChatRoomList();
        renderChatPage();
        showToastMessage(targetChatRoomItem.muted ? '채팅방 알림을 껐어요.' : '채팅방 알림을 다시 켰어요.');
      };
    });

    chatRoomListEl.querySelectorAll('.js-chat-room-leave').forEach((leaveButtonEl) => {
      leaveButtonEl.onclick = (event) => {
        event.stopPropagation();
        const leavingRoomId = leaveButtonEl.dataset.roomId;
        const leavingRoomIndex = chatRoomList.findIndex((chatRoomItem) => String(chatRoomItem.id) === String(leavingRoomId));

        if (leavingRoomIndex < 0) {
          return;
        }

        const leavingRoomName = chatRoomList[leavingRoomIndex].name;
        chatRoomList.splice(leavingRoomIndex, 1);

        if (!chatRoomList.length) {
          chatRoomList = createSampleChatRoomList();
        }

        if (!findChatRoomById(currentChatRoomId)) {
          currentChatRoomId = chatRoomList[0] ? chatRoomList[0].id : null;
        }

        saveChatRoomList();
        renderChatPage();
        showToastMessage(`${leavingRoomName} 방에서 나갔어요.`);
      };
    });
  }

  function renderCurrentChatRoom() {
    const currentChatRoomItem = getCurrentChatRoom();

    if (!currentChatRoomItem) {
      return;
    }

    chatCurrentRoomNameEl.textContent = currentChatRoomItem.name;
    chatCurrentRoomMetaEl.textContent = currentChatRoomItem.subtitle;

    if (currentChatRoomItem.typing) {
      chatTypingHintEl.classList.add('show');
      chatTypingHintEl.textContent = `${currentChatRoomItem.partnerName}님이 입력 중이에요...`;
    } else {
      chatTypingHintEl.classList.remove('show');
      chatTypingHintEl.textContent = '상대방이 입력 중이에요...';
    }

    chatThreadEl.innerHTML = currentChatRoomItem.messages.map((messageItem) => `
      <div class="chat-row ${messageItem.side}">
        <div class="chat-bubble-wrap">
          <div class="chat-meta">${escapeHtml(messageItem.author)} · ${escapeHtml(messageItem.time)}</div>
          <div class="chat-bubble">${convertNewLineToBr(messageItem.text)}</div>
        </div>
      </div>
    `).join('');

    chatThreadEl.scrollTop = chatThreadEl.scrollHeight;
  }

  function renderChatPage() {
    if (!isLoggedIn()) {
      if (chatRoomListEl) {
        chatRoomListEl.innerHTML = '';
      }
      if (chatThreadEl) {
        chatThreadEl.innerHTML = '';
      }
      return;
    }

    renderChatRoomList();
    renderCurrentChatRoom();
  }

  function resizeChatInput() {
    if (!chatInputEl) {
      return;
    }

    chatInputEl.style.height = 'auto';
    chatInputEl.style.height = `${Math.min(chatInputEl.scrollHeight, 92)}px`;
  }

  /* [15-0] 사용자가 채팅 화면을 보고 있거나 입력한 시점을 기록해서 메시지 도착 타이밍을 더 자연스럽게 맞춤 */
  function markChatActivity() {
    lastChatActivityAt = Date.now();
  }

  function getRandomDelay(minDelay, maxDelay) {
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }

  /* [15-1] 특정 채팅방의 입력 중 상태를 안전하게 바꾸는 함수 */
  function setChatTypingState(chatRoomId, isTyping) {
    const targetChatRoomItem = findChatRoomById(chatRoomId);

    if (!targetChatRoomItem) {
      return;
    }

    targetChatRoomItem.typing = Boolean(isTyping);
    saveChatRoomList();

    if (isChatPageVisible()) {
      renderChatPage();
    }
  }

  /* [15-2] 현재 선택한 방이 바뀌어도 자동 답장이 끊기지 않도록 방 id 기준으로 다시 찾는 함수 */
  function appendAutoReplyMessage(chatRoomId, userMessageText) {
    const targetChatRoomItem = findChatRoomById(chatRoomId);

    if (!targetChatRoomItem) {
      return;
    }

    /* [15-5-1] 자동 답장이 들어오는 순간 입력 중 안내는 바로 내려가야 하므로 먼저 false 처리 */
    targetChatRoomItem.typing = false;
    targetChatRoomItem.messages.push(
      createChatMessageItem('left', targetChatRoomItem.partnerName, getAutoReplyText(userMessageText))
    );

    if (String(currentChatRoomId) !== String(chatRoomId)) {
      targetChatRoomItem.unreadCount = (targetChatRoomItem.unreadCount || 0) + 1;
    }

    saveChatRoomList();

    if (isChatPageVisible()) {
      renderChatPage();
      showChatToastMessage(`${targetChatRoomItem.partnerName}님이 새 답장을 보냈어요`);
    }
  }

  function getAutoReplyText(userMessageText) {
    const normalizedText = String(userMessageText || '').replace(/\s+/g, '');

    /* [15-5-2] 사용자가 정확히 안녕을 보내면 가장 먼저 안녕으로 바로 답하도록 고정 */
    if (normalizedText === '안녕') {
      return '안녕 :)';
    }

    if (normalizedText.includes('안녕')) {
      return pickRandomItem(['안녕 :)', '안녕, 반가워 :)', '안녕! 여기 보고 있었어 :)']);
    }

    if (normalizedText.includes('뭐해')) {
      return pickRandomItem(['나 여기 계속 확인하고 있었지 :)', '지금 수정된 부분 다시 보고 있었어.', '방금 채팅 보고 바로 들어왔어 :)']);
    }

    if (normalizedText.includes('고마워') || normalizedText.includes('감사')) {
      return pickRandomItem(['나도 고마워 :)', '천만에, 같이 맞추면 더 좋지 :)', '좋아. 계속 같이 보자 :)']);
    }

    if (normalizedText.includes('잘자')) {
      return pickRandomItem(['잘 자, 좋은 꿈 꿔 :)', '오늘도 고생 많았어. 푹 쉬어 :)']);
    }

    if (normalizedText.includes('점심')) {
      return pickRandomItem(['점심은 따뜻한 국물 있는 걸로 가면 좋을 것 같아!', '학원 근처면 편하게 갈 수 있는 곳부터 보는 게 좋겠어.']);
    }

    return pickRandomItem([
      '응, 그 방향 괜찮은 것 같아.',
      '좋아. 그 기준으로 맞추면 훨씬 자연스러울 것 같아 :)',
      '지금 흐름 괜찮아 보여. 조금만 더 다듬으면 될 것 같아.',
      '나도 그렇게 생각했어. 그쪽으로 진행해 보자 :)'
    ]);
  }

  function sendChatMessage() {
    if (!ensureLoggedIn('채팅을')) {
      return;
    }

    const currentChatRoomItem = getCurrentChatRoom();
    const messageText = chatInputEl.value.trim();

    if (!currentChatRoomItem || !messageText) {
      return;
    }

    const targetChatRoomId = currentChatRoomItem.id;

    currentChatRoomItem.messages.push(createChatMessageItem('right', getCurrentUserName(), messageText));
    currentChatRoomItem.unreadCount = 0;
    currentChatRoomItem.typing = false;
    saveChatRoomList();

    chatInputEl.value = '';
    resizeChatInput();
    markChatActivity();
    renderChatPage();

    window.clearTimeout(chatTypingTimerId);

    /* [15-6] 사용자가 메시지를 보내면 거의 바로 입력 중 표시가 뜨고, 1초 안쪽으로 답장이 오도록 조정 */
    chatTypingTimerId = window.setTimeout(() => {
      setChatTypingState(targetChatRoomId, true);
    }, 180);

    /* [15-6-1] 안녕 같은 짧은 인사말은 더 빨리, 일반 메시지도 충분히 빠르게 답장 */
    const replyDelay = messageText.replace(/\s+/g, '') === '안녕' ? 720 : getRandomDelay(820, 1180);
    const replyTimerId = window.setTimeout(() => {
      appendAutoReplyMessage(targetChatRoomId, messageText);
      markChatActivity();
      chatAutoReplyTimerIdList = chatAutoReplyTimerIdList.filter((savedTimerId) => savedTimerId !== replyTimerId);
    }, replyDelay);

    chatAutoReplyTimerId = replyTimerId;
    chatAutoReplyTimerIdList.push(replyTimerId);
  }

  function runBackgroundChatTick() {
    const roomMessagePoolMap = {
      'room-design': [
        '색감이 한 톤 더 정리되면 훨씬 안정적으로 보여요.',
        '버튼 크기는 지금보다 조금만 줄이면 더 균형이 좋아 보여요.',
        '인기글 이미지 크기를 더 줄이면 모바일에서 훨씬 자연스러워질 것 같아요.',
        '툴팁은 PC에서는 hover, 모바일에서는 클릭이 제일 깔끔해 보여요.'
      ],
      'room-team': [
        '우선순위는 모바일 카드 보정부터 가면 좋을 것 같아요.',
        '이미지랑 수정/삭제 버튼 사이 간격은 조금 더 띄우면 안정적이에요.',
        '지금 흐름이면 채팅 토스트만 더 자연스러워지면 거의 정리될 것 같아요.',
        '페이지네이션은 숫자 버튼 방식이 훨씬 보기 편하다는 의견이 많았어요.'
      ],
      'room-feedback': [
        '이 방에는 수정 체크 포인트만 짧게 모아서 남겨둘게요.',
        '지금 기준으로는 대댓글이랑 채팅 아이콘 위치만 다시 보면 될 것 같아요.',
        '접근성을 위해 새 메시지 표시는 색상과 배지 둘 다 같이 쓰는 게 좋아 보여요.'
      ]
    };

    const rotatingRoomIdList = ['room-design', 'room-team', 'room-feedback'];
    const targetRoomId = rotatingRoomIdList[backgroundChatRoomTurnIndex % rotatingRoomIdList.length];
    const targetChatRoomItem = findChatRoomById(targetRoomId);
    const activeChatRoomItem = getCurrentChatRoom();

    backgroundChatRoomTurnIndex += 1;

    if (!targetChatRoomItem) {
      return;
    }

    const nextMessageText = pickRandomItem(roomMessagePoolMap[targetRoomId] || roomMessagePoolMap['room-design']);
    targetChatRoomItem.messages.push(
      createChatMessageItem('left', targetChatRoomItem.partnerName, nextMessageText)
    );

    if (targetChatRoomItem.messages.length > 18) {
      targetChatRoomItem.messages = targetChatRoomItem.messages.slice(-18);
    }

    if (!targetChatRoomItem.muted && String(currentChatRoomId) !== String(targetChatRoomItem.id)) {
      targetChatRoomItem.unreadCount = Number(targetChatRoomItem.unreadCount || 0) + 1;
    }

    if (isChatPageVisible() && activeChatRoomItem && !activeChatRoomItem.typing) {
      const idleMs = Date.now() - lastChatActivityAt;

      if (String(currentChatRoomId) === String(activeChatRoomItem.id) && idleMs > 5000 && Math.random() < 0.35) {
        activeChatRoomItem.typing = true;
        saveChatRoomList();
        renderChatPage();

        const passiveReplyTimerId = window.setTimeout(() => {
          const refreshedRoomItem = findChatRoomById(activeChatRoomItem.id);

          if (!refreshedRoomItem) {
            return;
          }

          refreshedRoomItem.typing = false;
          refreshedRoomItem.messages.push(
            createChatMessageItem('left', refreshedRoomItem.partnerName, pickRandomItem([
              '지금 확인한 기준으로 보면 흐름이 훨씬 안정적으로 보였어요.',
              '방금 다시 체크해 봤는데 이 정도 속도가 더 자연스럽게 느껴져요.',
              '조금 더 다듬으면 거의 마무리 단계처럼 보여요.',
              '지금 보고 있는 화면 기준에서는 간격만 조금 더 정리하면 될 것 같아요.'
            ]))
          );

          if (refreshedRoomItem.messages.length > 18) {
            refreshedRoomItem.messages = refreshedRoomItem.messages.slice(-18);
          }

          if (!refreshedRoomItem.muted && String(currentChatRoomId) !== String(refreshedRoomItem.id)) {
            refreshedRoomItem.unreadCount = Number(refreshedRoomItem.unreadCount || 0) + 1;
          }

          saveChatRoomList();

          if (isChatPageVisible()) {
            renderChatPage();
            if (!refreshedRoomItem.muted && String(currentChatRoomId) !== String(refreshedRoomItem.id)) {
              showChatToastMessage(`${refreshedRoomItem.partnerName}님이 메시지를 보냈어요`);
            }
          }
        }, 900);

        chatAutoReplyTimerIdList.push(passiveReplyTimerId);
      }
    }

    saveChatRoomList();

    if (isChatPageVisible()) {
      renderChatPage();
      if (!targetChatRoomItem.muted) {
        showChatToastMessage(`${targetChatRoomItem.name} · 새 메시지 1건`);
      }
    }
  }

  function startBackgroundChatFlow() {
    /* [15-5] 배경 채팅은 과하게 쌓이지 않도록 10초마다 room-design / room-team이 번갈아 1건씩 올라오게 유지 */
    if (chatBackgroundBootTimerId) {
      window.clearTimeout(chatBackgroundBootTimerId);
      chatBackgroundBootTimerId = null;
    }

    if (chatBackgroundTimerId) {
      window.clearInterval(chatBackgroundTimerId);
      chatBackgroundTimerId = null;
    }

    chatBackgroundBootTimerId = window.setTimeout(() => {
      runBackgroundChatTick();
    }, 10000);

    chatBackgroundTimerId = window.setInterval(() => {
      runBackgroundChatTick();
    }, 10000);
  }

  /* ====================================================================== */
  /* [16] 글쓰기 / 수정 모달                                                   */
  /* ====================================================================== */
  function resetPostModal() {
    editingPostId = null;
    draftImageList = [];

    postTitleInputEl.value = '';
    postContentInputEl.value = '';
    hashtagInputEl.value = '';
    hashtagPreviewEl.innerHTML = '';
    imagePreviewListEl.innerHTML = '';

    postModalModeTextEl.textContent = '게시글 작성';
    postModalTitleEl.textContent = '커뮤니티 게시글을 작성해 주세요';
  }

  function openWriteModal() {
    if (!ensureLoggedIn('글쓰기를')) {
      return;
    }

    resetPostModal();
    modalOverlayEl.classList.remove('hide');
    postModalEl.classList.remove('hide');
  }

  function openEditModal(postId) {
    const selectedPostItem = findPostById(postId);

    if (!selectedPostItem || !canManageOwnContent(selectedPostItem.author)) {
      return;
    }

    editingPostId = selectedPostItem.id;
    draftImageList = [...(selectedPostItem.images || [])];

    postModalModeTextEl.textContent = '게시글 수정';
    postModalTitleEl.textContent = '게시글 내용을 수정해 주세요';

    postTitleInputEl.value = selectedPostItem.title;
    postContentInputEl.value = selectedPostItem.content;
    hashtagInputEl.value = selectedPostItem.tags.join(' ');

    modalOverlayEl.classList.remove('hide');
    postModalEl.classList.remove('hide');

    renderHashtagPreview();
    renderImagePreview();
  }

  function closePostModal() {
    postModalEl.classList.add('hide');
    closeConfirmModal();
    modalOverlayEl.classList.add('hide');
    resetPostModal();
  }

  function parseHashtagList(inputValue) {
    return inputValue
      .split(/\s+/)
      .map((textValue) => textValue.trim())
      .filter(Boolean);
  }

  function renderHashtagPreview() {
    const hashtagList = parseHashtagList(hashtagInputEl.value);
    hashtagPreviewEl.innerHTML = hashtagList.map((hashtagText) => `<span class="tag-chip">${escapeHtml(hashtagText)}</span>`).join('');
  }

  function renderImagePreview() {
    imagePreviewListEl.innerHTML = draftImageList.map((imageSrc, imageIndex) => `
      <div class="preview-card">
        <img src="${imageSrc}" alt="미리보기">
        <button type="button" class="preview-remove-btn" data-index="${imageIndex}">×</button>
      </div>
    `).join('');

    imagePreviewListEl.querySelectorAll('.preview-remove-btn').forEach((removeButtonEl) => {
      removeButtonEl.onclick = () => {
        draftImageList.splice(Number(removeButtonEl.dataset.index), 1);
        renderImagePreview();
      };
    });
  }

  function handleImageFiles(fileList) {
    [...fileList].forEach((fileItem) => {
      if (!fileItem.type.startsWith('image/')) {
        return;
      }

      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        draftImageList.push(event.target.result);
        renderImagePreview();
      };

      fileReader.readAsDataURL(fileItem);
    });
  }

  function validatePostForm() {
    const titleText = postTitleInputEl.value.trim();
    const contentText = postContentInputEl.value.trim();
    const hashtagList = parseHashtagList(hashtagInputEl.value);

    if (!titleText && !contentText) {
      return '제목과 내용을 작성해 주세요';
    }

    if (!titleText) {
      return '제목 작성해주세요!';
    }

    if (!contentText) {
      return '내용을 작성해주세요!';
    }

    if (!hashtagList.length || hashtagList.some((hashtagText) => !hashtagText.startsWith('#'))) {
      return '해시태그를 다시 작성해 주세요. #을 꼭 넣어 주세요.';
    }

    return '';
  }

  function savePostForm() {
    if (!ensureLoggedIn(editingPostId ? '게시글 수정을' : '게시글 작성을')) {
      return;
    }

    const errorMessage = validatePostForm();

    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    const postFormData = {
      title: postTitleInputEl.value.trim(),
      content: postContentInputEl.value.trim(),
      tags: parseHashtagList(hashtagInputEl.value),
      images: [...draftImageList]
    };

    if (editingPostId) {
      const editingPostItem = findPostById(editingPostId);
      Object.assign(editingPostItem, postFormData);
      clearInlineEditState();
      savePostList();
      addActivityLog('내가 수정한 글', editingPostItem.id);
      showToastMessage('수정되었습니다.');
    } else {
      postList.unshift({
        id: Date.now(),
        author: getCurrentUserName(),
        datetime: getNowText(),
        views: 0,
        likes: 0,
        comments: [],
        liked: false,
        saved: false,
        saveCount: 0,
        shareCount: 0,
        reportCount: 0,
        ...postFormData
      });

      clearInlineEditState();
      savePostList();
      addActivityLog('내가 작성한 글', postList[0].id);
      showToastMessage('등록되었습니다.');
    }

    renderAllPage();
    renderMyPage();

    if (currentDetailPostId) {
      renderDetailPage();
    }

    closePostModal();
    showPage('all');
    closeMoreListPage();
  }

  /* ====================================================================== */
  /* [17] 댓글 작성                                                            */
  /* ====================================================================== */
  function addComment() {
    if (!ensureLoggedIn('댓글 작성을')) {
      return;
    }

    const commentText = commentInputEl.value.trim();

    if (!commentText) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }

    const selectedPostItem = findPostById(currentDetailPostId);

    selectedPostItem.comments.push({
      id: Date.now(),
      author: getCurrentUserName(),
      text: commentText,
      datetime: getNowText(),
      replies: []
    });

    clearInlineEditState();
    savePostList();
    addActivityLog('내가 댓글 단 글', selectedPostItem.id);
    commentInputEl.value = '';

    renderAllPage();
    renderMyPage();
    renderDetailPage();
  }

  /* ====================================================================== */
  /* [18] 이벤트 연결                                                          */
  /* ====================================================================== */

  /* [18-1] 모바일 메뉴 */
  if (mobileMenuButtonEl && mobileMenuPanelEl) {
    mobileMenuButtonEl.onclick = () => {
      mobileMenuPanelEl.classList.toggle('open');
    };
  }

  /* [18-2] 왼쪽 메뉴 페이지 전환 */
  allMenuButtonEl.onclick = () => {
    showPage('all');
    closeMoreListPage();
  };

  myMenuButtonEl.onclick = () => {
    showPage('mine');
    renderMyPage();
  };

  chatMenuButtonEl.onclick = () => {
    showPage('chat');
    markChatActivity();
    startBackgroundChatFlow();
    renderChatPage();
  };

  /* [18-3] 전체 페이지 더보기 */
  hotMoreButtonEl.onclick = () => {
    showPage('all');
    openMoreListPage('hot');
  };

  latestMoreButtonEl.onclick = () => {
    showPage('all');
    openMoreListPage('latest');
  };

  backPreviewButtonEl.onclick = closeMoreListPage;

  allPrevPageButtonEl.onclick = () => {
    currentMoreListPage -= 1;
    renderMoreListPage();
  };

  allNextPageButtonEl.onclick = () => {
    currentMoreListPage += 1;
    renderMoreListPage();
  };

  /* [18-4] 상세 페이지 */
  backToListButtonEl.onclick = () => {
    showPage('all');
  };

  /* [18-5] 글쓰기 모달 */
  floatingWriteButtonEl.onclick = openWriteModal;
  closeModalButtonEl.onclick = closePostModal;
  savePostButtonEl.onclick = savePostForm;

  /* [18-6] 댓글 작성 */
  addCommentButtonEl.onclick = addComment;

  /* [18-6-1] 채팅 입력 / 전송 */
  if (chatSendButtonEl) {
    chatSendButtonEl.onclick = sendChatMessage;
  }

  if (chatInputEl) {
    chatInputEl.addEventListener('input', () => {
      markChatActivity();
      resizeChatInput();
    });
    chatInputEl.addEventListener('focus', markChatActivity);
    chatInputEl.addEventListener('keydown', (event) => {
      markChatActivity();

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
      }
    });
  }

  /* [18-6-2] 모바일 툴팁은 바깥을 누르면 닫히도록 처리 */
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.js-smart-tooltip')) {
      closeMobileTooltip();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeImageLightbox();
    }
  });

  /* [18-7] 해시태그 / 이미지 입력 */
  hashtagInputEl.addEventListener('input', renderHashtagPreview);

  selectImageButtonEl.onclick = () => {
    imageFileInputEl.click();
  };

  imageFileInputEl.addEventListener('change', (event) => {
    handleImageFiles(event.target.files);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    imageDropZoneEl.addEventListener(eventName, (event) => {
      event.preventDefault();
      imageDropZoneEl.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    imageDropZoneEl.addEventListener(eventName, (event) => {
      event.preventDefault();
      imageDropZoneEl.classList.remove('dragover');
    });
  });

  imageDropZoneEl.addEventListener('drop', (event) => {
    handleImageFiles(event.dataTransfer.files);
  });

  /* [18-8] 모달 닫기 / 확인창 */
  modalOverlayEl.onclick = () => {
    closePostModal();
    closeConfirmModal();
  };

  confirmNoButtonEl.onclick = closeConfirmModal;

  /* [18-8-0] 이미지 확대 라이트박스 닫기 */
  if (imageLightboxCloseButtonEl) {
    imageLightboxCloseButtonEl.onclick = closeImageLightbox;
  }

  if (imageLightboxEl) {
    imageLightboxEl.onclick = (event) => {
      if (event.target === imageLightboxEl) {
        closeImageLightbox();
      }
    };
  }

  confirmYesButtonEl.onclick = () => {
    if (pendingConfirmAction) {
      pendingConfirmAction();
    }

    closeConfirmModal();
  };

  /* [18-8-1] 내 소식 / 활동 숫자 페이지 이동 */
  if (myPrevPageButtonEl) {
    myPrevPageButtonEl.onclick = () => {
      const nextPageNumber = Math.max(1, getCurrentMyPageNumber() - 1);
      setCurrentMyPageNumber(nextPageNumber);
      renderMyPage();
    };
  }

  if (myNextPageButtonEl) {
    myNextPageButtonEl.onclick = () => {
      const sourceItemCount = currentMyTabName === 'alarm' ? buildMyAlarmItemList().length : buildMyActivityItemList().length;
      const totalPageCount = Math.max(1, Math.ceil(sourceItemCount / MY_PAGE_SIZE));
      const nextPageNumber = Math.min(totalPageCount, getCurrentMyPageNumber() + 1);
      setCurrentMyPageNumber(nextPageNumber);
      renderMyPage();
    };
  }

  /* [18-9] 내 소식 탭 전환 */
  document.querySelectorAll('.my-main-tab').forEach((myTabButtonEl) => {
    myTabButtonEl.onclick = () => {
      document.querySelectorAll('.my-main-tab').forEach((tabButtonEl) => {
        tabButtonEl.classList.remove('active');
      });

      myTabButtonEl.classList.add('active');
      currentMyTabName = myTabButtonEl.dataset.myMain;
      setCurrentMyPageNumber(1);
      renderMyPage();
    };
  });


  /* [18-9-1] 모바일/웹 전환 시 인기글 텍스트 길이를 다시 계산해서 재렌더 */
  window.addEventListener('resize', () => {
    const currentHotBreakpointMode = isMobileView();

    if (currentHotBreakpointMode === previousHotBreakpointMode) {
      return;
    }

    previousHotBreakpointMode = currentHotBreakpointMode;

    if (currentPageName === 'all') {
      renderAllPage();

      if (!allMoreSectionEl.classList.contains('hidden-panel')) {
        renderMoreListPage();
      }
    }
  });

  /* ====================================================================== */
  /* [19] 첫 화면 초기 렌더링                                                  */
  /* ====================================================================== */
  applyLoginUiState();
  renderAllPage();
  renderMyPage();

  if (isLoggedIn()) {
    renderChatPage();
    startBackgroundChatFlow();
  }

  resizeChatInput();
  showPage('all');
});

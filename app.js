const socket = io();

// 사냥터 리스트 (label만 있는 배열로 변경)
const rawMapList = [
  "야시장 사잇길1",
  
  "차가운벌판1",
  "차가운벌판2",
  "차디찬벌판",
  "얼음골짜기1",
  "얼음골짜기2",
  "늑대의영역1",
  "죽은나무의숲1",
  "죽은나무의숲2",
  "죽은나무의숲3",
  "죽은나무의숲4",
  
  "시간의길1",
  "시간의길4",
  "삐뚤어진 시간(듀파/듀미굴)",
  "사라진 시간(마데테)",
  "금지된 시간",
  
  "위험한 바다 협곡1",
  "위험한 바다 협곡2(오징어/원양어선)",
  "깊은 바다 협곡1",
  "깊은 바다 협곡2(망둥)",
  
  "하늘 둥지 입구",
  "하늘 둥지2",
  "붉은 켄타우로스의 영역",
  "푸른 켄타우로스의 영역",
  "검은 켄타우로스의 영역",
  "불과 어둠의 전장",
  "물과 어둠의 전장",
  "산양의 골짜기1",
  "숲의 갈림길",
  "용의 숲 입구",
  "용의 숲1",
  "불타는 숲",
  "사라진 숲",
  "용의 숲2",
  "용의 숲3",
  "용의 협곡",
  "협곡의 갈림길",
  "협곡의 동쪽길",
  "협곡의 서쪽길",
  "와이번의 협곡",
  "용의 둥지 입구",
  "망가진 용의 둥지",
  "죽은 용의 둥지",
  "위험한 용의 둥지",
  "남겨진 용의 둥지1",
  "큰 둥지 봉우리"
];

// 필터링 함수
function filterItems(item, input) {
  const inputLower = input.toLowerCase();
  const itemLower = item.toLowerCase();

  // 1. 입력값을 단어, 초성, 숫자 등으로 구분
  const inputParts = inputLower.split('').filter(part => part.trim().length > 0);  // 한 글자씩 쪼개기

  // 초성 및 숫자 구분
  const inputChosung = inputParts.filter(part => /^[ㄱ-ㅎ]+$/.test(part));  // 초성만
  const inputNumbers = inputParts.filter(part => /^[0-9]+$/.test(part));  // 숫자만
  const inputWords = inputParts.filter(part => /^[a-zA-Z가-힣]+$/.test(part));  // 단어만 (한글, 영문 포함)

  // 2. 초성 + 숫자가 같이 입력된 경우
  if (inputChosung.length > 0 && inputNumbers.length > 0) {
    const isChosungMatch = inputChosung.every(part => {
      const chosung = getChosung(item);  // 항목의 초성만 추출
      return chosung.includes(part);    // 초성 포함 여부
    });
    const isNumberMatch = inputNumbers.every(part => itemLower.includes(part));  // 숫자 포함 여부
    return isChosungMatch && isNumberMatch;
  }

  // 3. 단어 + 숫자가 같이 입력된 경우
  if (inputWords.length > 0 && inputNumbers.length > 0) {
    const isWordMatch = inputWords.every(part => {
      return part.split('').every(subPart => itemLower.includes(subPart));  // 단어 포함 여부
    });
    const isNumberMatch = inputNumbers.every(part => itemLower.includes(part));  // 숫자 포함 여부
    return isWordMatch && isNumberMatch;
  }

  // 4. 단어만 입력된 경우 (단어 필터링)
  if (inputWords.length > 0) {
    return inputWords.every(part => {
      return part.split('').every(subPart => itemLower.includes(subPart));  // 단어 포함 여부
    });
  }

  // 5. 초성만 입력된 경우 (초성 필터링)
  if (inputChosung.length > 0) {
    const isChosungMatch = inputChosung.every(part => {
      const chosung = getChosung(item);  // 항목의 초성만 추출
      return chosung.includes(part);    // 초성 포함 여부
    });
    return isChosungMatch;  // 초성만으로 매칭된 항목을 찾음
  }

  // 6. 숫자만 입력된 경우 (숫자 필터링)
  if (inputNumbers.length > 0) {
    return inputNumbers.every(part => itemLower.includes(part));  // 숫자 포함 여부
  }

  return false;  // 그 외의 경우는 필터링하지 않음
}

// Awesomplete 초기화
document.addEventListener('DOMContentLoaded', () => {
  resetPartyCreationForm();
  
  const partyNameInput = document.getElementById('partyNameInput');
  
  if (partyNameInput) {
    const awesompleteSource = rawMapList; // 이제 label만 있는 배열 사용

    const awesompleteInstance = new Awesomplete(partyNameInput, {
      list: awesompleteSource,
      minChars: 1,
      maxItems: 10,
      autoFirst: true,
      filter: function (item, input) {
        return filterItems(item, input); // 수정된 필터 함수 적용
      },
      item: function (item, input) {
        // 기본적인 항목 하이라이트
        const label = item;
        const regex = new RegExp(input, 'gi');
        const highlighted = label.replace(regex, match => `<strong>${match}</strong>`);
        const li = document.createElement("li");
        li.innerHTML = highlighted;
        return li;
      },
      replace: function (item) {
        this.input.value = item;
        this.input.dataset.selected = "true"; // 선택된 상태 표시
      }
    });

    // 사용자가 입력한 값이 리스트에 없으면, 빈 값으로 처리
    partyNameInput.addEventListener('input', function () {
      const isValid = awesompleteSource.includes(partyNameInput.value.trim());
      if (!isValid) {
        this.dataset.selected = "false"; // 유효하지 않다고 표시
      }
    });

    // 사용자가 포커스를 벗어나면 리스트에서 선택된 값만 유효하고, 선택 안되었으면 빈 값으로
    partyNameInput.addEventListener('blur', function () {
      if (this.dataset.selected !== "true") {
        this.value = "";  // 빈 값으로 초기화
        this.dataset.selected = "false"; // 상태 초기화
      }
    });
  }
});

let myUserId = null;
let myPartyId = null;
let amIPartyLeader = false;
let requestedPartyId = null;

let positions = [];
let currentPartyPositions = [];
let leaderPosition = null; // 👑 선택된 위치

const SOCIAL_CODE_PATTERN = /^#[A-Za-z0-9]{5}$/;  // ✅ 대소문자 + 숫자

const nicknameInput = document.getElementById('nicknameInput');
const levelInput = document.getElementById('levelInput');
const jobSelect = document.getElementById('jobSelect');
const saveInfoBtn = document.getElementById('saveInfoBtn');
const saveMsg = document.getElementById('saveMsg');

const partyNameInput = document.getElementById('partyNameInput');

let positionCount = 0;
const maxPositions = 8;

const positionInputsContainer = document.getElementById('positionInputsContainer');
const createPartyBtn = document.getElementById('createPartyBtn');

const pendingRequests = new Map(); // partyId → Set<requestedPositions>

const noPartyDiv = document.getElementById('noPartyDiv');
const partyInfoDiv = document.getElementById('partyInfoDiv');
const partyNameTitle = document.getElementById('partyNameTitle');
const partyMembersList = document.getElementById('partyMembersList');
const partyControls = document.getElementById('partyControls');

const joinRequestsSection = document.getElementById('joinRequestsSection');
const joinRequestsList = document.getElementById('joinRequestsList');

const allPartiesList = document.getElementById('allPartiesList');

const darkModeToggle = document.getElementById('darkModeToggle');

// 다크 모드 초기 설정
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.textContent = '☀️';
} else {
  darkModeToggle.textContent = '🌙';
}

darkModeToggle.onclick = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
  darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
};

// 내 정보 섹션 토글
document.getElementById('toggleMyInfoBtn').addEventListener('click', function () {
  const myInfoContent = document.getElementById('MyinfoContents');
  const isExpanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', !isExpanded);
  myInfoContent.style.display = isExpanded ? 'none' : 'block';
});

// 초성 추출 함수 개선
function getChosung(str) {
  const CHOSUNG = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ",
    "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ",
    "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
  ];

  return [...str].map(char => {
    const code = char.charCodeAt(0) - 44032;  // 한글 음절의 유니코드 범위
    if (code < 0 || code > 11171) return char;  // 한글이 아닌 문자 처리
    return CHOSUNG[Math.floor(code / 588)];  // 초성 계산
  }).join('');
}

function isChosungMatch(input, target) {
  const inputChosung = getChosung(input);
  const targetChosung = getChosung(target);

  return targetChosung.includes(inputChosung);  // 초성만으로 매칭 여부 확인
}

let svgmsgElement = null;  // 현재 표시 중인 메시지를 담을 변수
let svgmsgInputElement = null; // 현재 표시 중인 에러 입력 필드를 담을 변수
let messageTimeout = null; // 메시지 타이머를 저장하는 변수

function showFadingMessage(el, message, isError = false, inputElement = null) {
  // 기존 메시지 요소와 테두리 요소가 있으면 삭제
  if (svgmsgElement) {
    svgmsgElement.remove();
    svgmsgElement = null; // 초기화
  }

  if (svgmsgInputElement) {
    svgmsgInputElement.classList.remove('input-error');
    svgmsgInputElement = null; // 초기화
  }

  // 새로운 메시지 요소 생성
  svgmsgElement = document.createElement('div');
  svgmsgElement.textContent = message;
  svgmsgElement.style.color = isError ? 'red' : 'green';
  svgmsgElement.classList.add('fade-message'); // fade 효과 추가

  // 기존 메시지 영역에 새 메시지 삽입
  el.appendChild(svgmsgElement);

  // 빨간 테두리 추가 (에러 메시지가 있을 때만)
  if (inputElement && isError) {
    svgmsgInputElement = inputElement; // 현재 에러 입력 필드 저장
    svgmsgInputElement.classList.add('input-error');
  }

  // 이전 타이머가 존재하면 삭제
  if (messageTimeout) {
    clearTimeout(messageTimeout);
    messageTimeout = null; // 초기화
  }

  // 3초 후 메시지와 빨간 테두리 삭제
  messageTimeout = setTimeout(() => {
    if (svgmsgElement) svgmsgElement.remove();  // 메시지 삭제
    if (svgmsgInputElement) svgmsgInputElement.classList.remove('input-error');  // 빨간 테두리 삭제
    
    // 객체 초기화
    svgmsgElement = null;
    svgmsgInputElement = null;
  }, 3000);
}

// 입력 유효성 체크
function checkAllInputsFilled() {
  const allInputsFilled = [...document.querySelectorAll('.position-input')].every(input => input.value.trim() !== '');
  const partyName = partyNameInput.value.trim();
  const isLeaderSelected = leaderPositionIndex !== null;
  createPartyBtn.disabled = !(allInputsFilled && partyName && isLeaderSelected);
}

// 파티 생성 버튼
createPartyBtn.onclick = () => {
  positions.length = 0;
  const positionInputs = document.querySelectorAll('.position-input');
  let isValid = true;

  positionInputs.forEach(input => {
    const positionValue = input.value.trim();
    if (positionValue) {
      positions.push(positionValue);
    } else {
      isValid = false;
    }
  });

  if (!isValid || leaderPositionIndex === null || !partyNameInput.value.trim()) {
    alert('파티 이름과 위치를 모두 입력하고, 파티장의 위치를 지정해주세요.');
    return;
  }

  // 파티 이름 길이 제한
  let partyName = partyNameInput.value.trim();
  const maxLength = 30;
  const charArray = Array.from(partyName);
  if (charArray.length > maxLength) {
    partyName = charArray.slice(0, maxLength).join('');
    partyNameInput.value = partyName;
  }

  // 저장된 사용자 정보 가져오기
  const savedNickname = localStorage.getItem('nickname');
  const savedLevel = Number(localStorage.getItem('level'));
  const savedJob = localStorage.getItem('job');
  const savedSocialCode = localStorage.getItem('socialCode');  // 저장된 소셜 코드

  // 저장된 정보가 없으면 경고 메시지 띄우기
  if (!savedNickname || !savedLevel || !savedJob) {
    showFadingMessage(saveMsg, '내 정보를 입력하고 저장하세요.', true);
    return;
  }

  // 소셜 코드가 저장되지 않았다면 경고 메시지 띄우기
  if (!savedSocialCode) {
    socialCodeInput.focus(); // 포커스 이동
    socialCodeInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); // 스크롤 이동
    showFadingMessage(saveMsg, '소셜 코드를 입력 후 저장하세요.', true);
    return;
  }

  // 파티 생성
  const leaderPosition = positions[leaderPositionIndex];

  socket.emit('create_party', {
    partyName,
    positions,
    leaderPosition,
    socialCode: savedSocialCode,
    nickname: savedNickname,
    level: savedLevel,
    job: savedJob
  });
};

// 가입 요청
function requestJoinParty(partyId, position) {
  requestedPartyId = partyId;
  if (!pendingRequests.has(partyId)) {
    pendingRequests.set(partyId, new Set());
  }
  pendingRequests.get(partyId).add(position);
  socket.emit('request_join_party', { partyId, position });
}

// UI 업데이트 함수
function updateMyPartyUI(myParty) {
  const myPartySection = document.getElementById('myPartySection');

  if (!myParty) {
    myPartyId = null;
    amIPartyLeader = false;
    noPartyDiv.style.display = 'block';
    partyInfoDiv.style.display = 'none';
    joinRequestsSection.style.display = 'none';
    partyMembersList.innerHTML = '';
    partyNameTitle.textContent = '';
    partyControls.innerHTML = '';
    currentPartyPositions = [];

    myPartySection.classList.remove('has-control-footer'); // ❌ 클래스 제거
    return;
  }

  myPartyId = myParty.partyId;
  amIPartyLeader = myParty.leaderId === myUserId;

	const socialCodeInput = document.getElementById('socialCodeInput');
	if (socialCodeInput) {
	  socialCodeInput.disabled = amIPartyLeader;
	}

  noPartyDiv.style.display = 'none';
  partyInfoDiv.style.display = 'block';
  partyNameTitle.textContent = myParty.partyName;

  partyMembersList.innerHTML = '';

  if (amIPartyLeader) {
    renderPartyControls(myParty.partyId);
  } else {
    renderLeaveButton(myParty.partyId);
  }

  if (amIPartyLeader && myParty.joinRequests?.length > 0) {
    joinRequestsSection.style.display = 'block';
    renderJoinRequests(myParty.joinRequests);
  } else {
    joinRequestsSection.style.display = 'none';
    joinRequestsList.innerHTML = '';
  }

  if (myParty.positions && myParty.members) {
    currentPartyPositions = myParty.positions;
    renderPartyPositions(currentPartyPositions, myParty.members);
  }

  myPartySection.classList.add('has-control-footer'); // ✅ 클래스 추가
}

function resetPartyCreationForm() {
  if (!addPositionBtn) return; // ✅ 안전장치
  
  positionInputsContainer.innerHTML = '';
  positionCount = 0;
  leaderPositionIndex = null;
  positions = [];

  for (let i = 0; i < 2; i++) {
    addPositionBtn.click();
  }

  createPartyBtn.disabled = true;
}

// 위치별 멤버 표시
function renderPartyPositions(positions, members) {
  partyMembersList.innerHTML = '';

  positions.forEach(position => {
    const li = document.createElement('li');
    li.className = 'member-info';
    li.style.marginBottom = '6px';

    const assigned = members.find(m => m.position === position);
    if (assigned) {
	  const displayName = assigned.socialCode ? `${assigned.nickname} (${assigned.socialCode})` : assigned.nickname;
	  li.textContent = `${position} - ${displayName} (Lv.${assigned.level} ${assigned.job})`;

      if (amIPartyLeader && assigned.userId !== myUserId) {
        const kickBtn = document.createElement('button');
        kickBtn.textContent = '추방';
        kickBtn.className = 'kick red-button small-button';
        kickBtn.onclick = () => {
          if (confirm(`정말로 "${position}"에 있는 ${assigned.nickname}님을 추방하시겠습니까?`)) {
            socket.emit('kick_member', {
              partyId: myPartyId,
              userId: assigned.userId
            });
          }
        };
        li.appendChild(kickBtn);
      }
    } else {
      li.textContent = `${position} - 구인 중`;
    }

    partyMembersList.appendChild(li);
  });
}

// 파티 탈퇴 버튼
function renderLeaveButton(partyId) {
  partyControls.innerHTML = '';
  const controlContainer = document.createElement('div');
  controlContainer.className = 'party-controls-container';

  const leaveBtn = document.createElement('button');
  leaveBtn.textContent = '파티 탈퇴';
  leaveBtn.onclick = () => {
    if (amIPartyLeader) {
      alert('파티장은 탈퇴할 수 없습니다. 먼저 파티를 해체하세요.');
      return;
    }
    if (confirm('파티에서 탈퇴하시겠습니까?')) {
      socket.emit('leave_party', { partyId });
    }
  };

  controlContainer.appendChild(leaveBtn);
  partyControls.appendChild(controlContainer);
}

// 파티 해체 버튼
function renderPartyControls(partyId) {
  partyControls.innerHTML = '';
  const controlContainer = document.createElement('div');
  controlContainer.className = 'party-controls-container';

  const disbandBtn = document.createElement('button');
  disbandBtn.textContent = '파티 해체';
  disbandBtn.onclick = () => {
    if (confirm('파티를 해체하시겠습니까?')) {
      socket.emit('disband_party', { partyId });
    }
  };

  controlContainer.appendChild(disbandBtn);
  partyControls.appendChild(controlContainer);
}

// 가입 요청 리스트 렌더링
function renderJoinRequests(requests) {
  joinRequestsList.innerHTML = '';

  // 서버에서 올바르게 position 단위 객체로 전송되었는지 확인
  if (!Array.isArray(requests)) return;

  // 유저별로 그룹핑
  const grouped = new Map();

  requests.forEach(req => {
    if (!req.position) return; // position 없는 요청은 무시

    if (!grouped.has(req.userId)) {
      grouped.set(req.userId, {
        userId: req.userId,
        nickname: req.nickname,
        level: req.level,
        job: req.job || '', // 직업 추가
        positions: [],
        requestTime: req.requestTime // 요청 시간 추가
      });
    }

    grouped.get(req.userId).positions.push(req.position);
  });

  // 요청 시간 기준으로 정렬 (요청이 먼저 온 순서대로)
  const sortedRequests = [...grouped.values()].sort((a, b) => a.requestTime - b.requestTime);

  // 정렬된 요청 리스트 렌더링
  sortedRequests.forEach(userReq => {
    userReq.positions.forEach(position => {
      const li = document.createElement('li');
      li.textContent = `${userReq.nickname} (Lv.${userReq.level}) - ${position}`;

      const acceptBtn = document.createElement('button');
      acceptBtn.textContent = '수락';
      acceptBtn.onclick = () => {
        socket.emit('handle_join_request', {
          partyId: myPartyId,
          userId: userReq.userId,
          position,
          accept: true
        });
      };

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = '거절';
      rejectBtn.onclick = () => {
        socket.emit('handle_join_request', {
          partyId: myPartyId,
          userId: userReq.userId,
          position,
          accept: false
        });
      };

      li.appendChild(acceptBtn);
      li.appendChild(rejectBtn);
      joinRequestsList.appendChild(li);
    });
  });
}

// 👑 버튼 및 위치 입력 필드 추가
const addPositionBtn = document.getElementById('addPositionBtn');
let leaderPositionIndex = null;

addPositionBtn.addEventListener('click', () => {
  if (positionCount < maxPositions) {
    const positionDiv = document.createElement('div');
    positionDiv.classList.add('form-group', 'position-row');

    const positionInput = document.createElement('input');
    positionInput.type = 'text';
    positionInput.placeholder = '위치 이름 입력';
    positionInput.classList.add('position-input');
    positionInput.addEventListener('input', checkAllInputsFilled);

    const crownBtn = document.createElement('button');
    crownBtn.type = 'button';
    crownBtn.textContent = '👑';
    crownBtn.className = 'crown-btn';
    crownBtn.title = '파티장 위치 선택';
    crownBtn.onclick = () => {
      const allCrowns = document.querySelectorAll('.crown-btn');
      allCrowns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected-crown');
      });
      crownBtn.disabled = true;
      crownBtn.classList.add('selected-crown');
      leaderPositionIndex = [...positionInputsContainer.children].indexOf(positionDiv);
      checkAllInputsFilled();
    };

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '➖';
    removeBtn.className = 'remove-position-btn';
    removeBtn.onclick = () => {
		if (positionCount <= 2) {
			alert('위치는 최소 2개 이상이어야 합니다.');
			return;
			}
			
      if (leaderPositionIndex === [...positionInputsContainer.children].indexOf(positionDiv)) {
        leaderPositionIndex = null;
      }
      positionDiv.remove();
      positionCount--;
      checkAllInputsFilled();
    };

    positionDiv.appendChild(positionInput);
    positionDiv.appendChild(crownBtn);
    positionDiv.appendChild(removeBtn);
    positionInputsContainer.appendChild(positionDiv);

    positionCount++;
  }
});

// 소켓 이벤트 핸들러
socket.on('connect', () => {
  myUserId = localStorage.getItem('userId');
  if (myUserId) {
    socket.emit('restore_user', { userId: myUserId });
  } else {
    socket.emit('request_user_id');
  }

  const savedNickname = localStorage.getItem('nickname');
  const savedLevel = localStorage.getItem('level');
  const savedJob = localStorage.getItem('job');
  if (savedNickname) nicknameInput.value = savedNickname;
  if (savedLevel) levelInput.value = savedLevel;
  if (savedJob) jobSelect.value = savedJob;
  
  const partySearchInput = document.getElementById('partySearchInput');
  if (partySearchInput) {
    partySearchInput.addEventListener('input', () => {
      socket.emit('request_all_parties');
    });
  }
});

socket.on('user_id_assigned', data => {
  myUserId = data.userId;
  localStorage.setItem('userId', myUserId);

  // ✅ 서버에 등록 완료 후 전체 파티 요청
  socket.emit('request_all_parties');
});

socket.on('save_user_info_result', data => {
  showFadingMessage(saveMsg, data.success ? '저장 완료' : (data.message || '저장 실패'), !data.success);
});

function renderAllParties(allParties) {
  allPartiesList.innerHTML = '';
  const noPartiesMsg = document.getElementById('noPartiesMsg');

  const searchInput = document.getElementById('partySearchInput');
  const searchTerm = searchInput?.value.trim().toLowerCase();

  const filteredParties = allParties.filter(party => {
	  const name = party.partyName.toLowerCase();
	  return name.includes(searchTerm) || isChosungMatch(searchTerm, name);
	});

  if (filteredParties.length === 0) {
    noPartiesMsg.style.display = 'block';
    allPartiesList.style.display = 'none';
    return;
  } else {
    noPartiesMsg.style.display = 'none';
    allPartiesList.style.display = 'block';
  }

  // ✅ 최신순 정렬
  filteredParties.sort((a, b) => b.createdAt - a.createdAt);

  filteredParties.forEach(party => {
    const partyItemContainer = document.createElement('div');
    partyItemContainer.classList.add('party-item-container');
    partyItemContainer.setAttribute('data-party-id', party.partyId);

    const partyItem = document.createElement('li');
    partyItem.classList.add('party-item');

    const currentCount = party.members.length;
    const totalCount = party.positions.length;

    const leftSpan = document.createElement('span');
    leftSpan.textContent = party.partyName;
    leftSpan.style.flex = '1'; // 좌측 정렬
	leftSpan.style.whiteSpace = 'nowrap';
	leftSpan.style.overflow = 'hidden';
	leftSpan.style.textOverflow = 'ellipsis';

    const rightSpan = document.createElement('span');
    rightSpan.textContent = `👥 ${currentCount}/${totalCount}`;
    rightSpan.style.textAlign = 'right';
    rightSpan.style.whiteSpace = 'nowrap';
    rightSpan.style.marginLeft = '1rem';
	rightSpan.style.marginRight = '10px'; // ✅ 버튼과 간격

    partyItem.style.display = 'flex';
    partyItem.style.justifyContent = 'space-between';
    partyItem.style.alignItems = 'center';

    partyItem.appendChild(leftSpan);
    partyItem.appendChild(rightSpan);

    const detailsBtn = document.createElement('button');
    detailsBtn.textContent = '상세보기';
    detailsBtn.classList.add('details-btn');
    detailsBtn.onclick = () => {
      togglePartyDetails(party.partyId);
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'right';
    buttonContainer.appendChild(detailsBtn);
    partyItem.appendChild(buttonContainer);

    const positionsList = document.createElement('ul');
    positionsList.classList.add('positions-list');
    positionsList.style.display = 'none';

    partyItemContainer.appendChild(partyItem);
    partyItemContainer.appendChild(positionsList);
    allPartiesList.appendChild(partyItemContainer);
  });
}

function togglePartyDetails(partyId) {
  const alreadyOpenId = localStorage.getItem('openPartyId');

  if (alreadyOpenId === partyId) {
    localStorage.removeItem('openPartyId');
    const container = document.querySelector(`[data-party-id="${partyId}"] .positions-list`);
    if (container) container.style.display = 'none';
    return;
  }

  document.querySelectorAll('.positions-list').forEach(el => el.style.display = 'none');
  localStorage.setItem('openPartyId', partyId);
  socket.emit('get_party_details', { partyId });
}

socket.on('update_user_parties', data => {
  updateMyPartyUI(data.myParty);
  renderAllParties(data.allParties);

  pendingRequests.clear();
  data.allParties.forEach(p => {
    if (p.amRequested && Array.isArray(p.requestedPositions)) {
      pendingRequests.set(p.partyId, new Set(p.requestedPositions));
    }
  });

  const openId = localStorage.getItem('openPartyId');
  if (openId) {
    socket.emit('get_party_details', { partyId: openId });
  }

  requestedPartyId = null;
});

socket.on('party_details', party => {
  const partyItemContainer = document.querySelector(`[data-party-id="${party.partyId}"]`);
  if (!partyItemContainer) return;

  const positionsList = partyItemContainer.querySelector('.positions-list');
  if (!positionsList) return;

  // ✅ 기존 상세보기 전부 닫기
  document.querySelectorAll('.positions-list').forEach(el => {
    if (el !== positionsList) {
      el.style.display = 'none';
    }
  });

  // ✅ 펼침 상태 저장
  localStorage.setItem('openPartyId', party.partyId);

  // ✅ 상세 정보 표시
  positionsList.innerHTML = '';
  positionsList.style.display = 'block';

  const currentUserInParty = myPartyId !== null;

  party.positions.forEach(position => {
    const li = document.createElement('li');
    const member = party.members.find(m => m.position === position);

    if (member) {
      li.textContent = `${position} - ${member.nickname} (Lv.${member.level} ${member.job})`; // ✅ 직업 포함
      if (member.userId === party.leaderId) {
        li.textContent += ' 👑';
      }
    } else {
      li.textContent = `${position} - 구인 중`;

      if (!currentUserInParty) {
        const requestBtn = document.createElement('button');
        const requestedSet = pendingRequests.get(party.partyId);
        if (requestedSet?.has(position)) {
          requestBtn.textContent = '신청 중';
          requestBtn.disabled = true;
        } else {
          requestBtn.textContent = '가입 신청';
          requestBtn.onclick = () => {
            requestJoinParty(party.partyId, position);
            requestBtn.textContent = '신청 중';
            requestBtn.disabled = true;
          };
        }
        li.appendChild(requestBtn);
      }
    }

    positionsList.appendChild(li);
  });
});

socket.on('join_request_result', data => {
  const { success, partyId, position, reason } = data;

  if (!success) {
    // 실패 시 요청 상태 복구
    const requestedSet = pendingRequests.get(partyId);
    if (requestedSet) {
      requestedSet.delete(position);
    }
    socket.emit('get_party_details', { partyId }); // UI 갱신
  }

  // 선택 사항: 에러 사유에 따라 사용자에게 안내 가능
  const errorMessages = {
    INVALID_PARTY: '존재하지 않는 파티입니다.',
    INVALID_USER: '내 정보를 먼저 저장하세요.',
    ALREADY_IN_PARTY: '이미 다른 파티에 소속되어 있습니다.',
    INVALID_POSITION: '신청한 위치가 유효하지 않습니다.',
    DUPLICATE_REQUEST: '이미 신청한 위치입니다.',
    POSITION_OCCUPIED: '이미 다른 유저가 해당 위치에 있습니다.'
  };

  if (!success && reason && errorMessages[reason]) {
    alert(errorMessages[reason]);
  }
});

socket.on('party_created', () => {
  requestedPartyId = null;
  partyNameInput.value = '';
  positionInputsContainer.innerHTML = '';
  positionCount = 0;
  leaderPositionIndex = null;
  createPartyBtn.disabled = true;
});

socket.on('party_members_updated', data => {
  if (myPartyId && data.members) {
    renderPartyPositions(currentPartyPositions, data.members);
  }
});

socket.on('join_requests_updated', data => {
  renderJoinRequests(data.requests);
  joinRequestsSection.style.display = data.requests.length > 0 ? 'block' : 'none';
});

socket.on('joined_party', data => {
  myPartyId = data.partyId;
  requestedPartyId = null;
  updateMyPartyUI({
    partyId: data.partyId,
    partyName: data.partyName || '',
    leaderId: data.leaderId || '',
    members: data.members,
    joinRequests: [],
    positions: data.positions || [],
  });
});

// ✅ 핵심 수정 적용된 부분
socket.on('join_request_rejected', data => {
  if (data?.partyId && data?.position) {
    const requestedSet = pendingRequests.get(data.partyId);
    if (requestedSet) {
      requestedSet.delete(data.position);
      // ❌ 삭제하지 않음: 다른 포지션 요청이 남아 있을 수 있음
    }

    socket.emit('get_party_details', { partyId: data.partyId });
  }
});

socket.on('party_disbanded', () => {
  alert('파티가 해체되었습니다.');
  myPartyId = null;
  amIPartyLeader = false;

  const socialCodeInput = document.getElementById('socialCodeInput');
  if (socialCodeInput) socialCodeInput.disabled = false;  // ✅ 소셜코드 다시 수정 가능
  
  updateMyPartyUI(null);
  resetPartyCreationForm(); // 👈 추가
  socket.emit('request_all_parties');
});

socket.on('left_party', () => {
  alert('파티에서 탈퇴하였습니다.');
  myPartyId = null;
  amIPartyLeader = false;
  updateMyPartyUI(null);
  resetPartyCreationForm(); // 👈 추가
  socket.emit('request_all_parties');
});

socket.on('kicked_from_party', () => {
  alert('파티에서 추방되었습니다.');
  myPartyId = null;
  amIPartyLeader = false;
  updateMyPartyUI(null);
  socket.emit('request_all_parties');
});

socket.on('error_message', data => {
  alert(data.message || '에러가 발생했습니다.');
  if (requestedPartyId) {
    requestedPartyId = null;
  }
  socket.emit('request_all_parties');
});

// 저장 버튼 클릭 시, 메시지 및 빨간 테두리 리셋 후 검증
saveInfoBtn.onclick = () => {
  const nickname = nicknameInput.value.trim();
  const level = Number(levelInput.value);
  const job = jobSelect.value;
  const socialCodeInput = document.getElementById('socialCodeInput');
  const socialCode = socialCodeInput?.value.trim();

  let hasError = false;

  // 닉네임 필수 - 에러가 있으면 메시지만 표시하고 나머지 체크는 하지 않음
  if (!nickname) {
    showFadingMessage(saveMsg, '닉네임을 입력하세요.', true, nicknameInput);
    hasError = true;  // 닉네임 에러가 발생하면 이 뒤로는 더 이상 체크하지 않음
  } else if (!Number.isInteger(level) || level < 1 || level > 200) {  // 레벨 체크
    showFadingMessage(saveMsg, '레벨은 1~200 사이 숫자여야 합니다.', true, levelInput);
    hasError = true;  // 레벨 에러 발생 시 뒤의 직업도 체크하지 않음
  } else if (!job) {  // 직업 체크
    showFadingMessage(saveMsg, '직업을 선택하세요.', true, jobSelect);
    hasError = true;
  } else if (socialCode && !SOCIAL_CODE_PATTERN.test(socialCode)) {  // 소셜코드 체크
    showFadingMessage(saveMsg, '소셜 코드는 "#"으로 시작하고 5자리 영문/숫자 형식이어야 합니다.', true, socialCodeInput);
    hasError = true;
  }

  if (hasError) return;

  // localStorage에 저장
  localStorage.setItem('nickname', nickname);
  localStorage.setItem('level', level.toString());
  localStorage.setItem('job', job);
  if (socialCode) {
    localStorage.setItem('socialCode', socialCode);
  } else {
    localStorage.removeItem('socialCode');
  }

  // 서버에 전송
  socket.emit('save_user_info', { nickname, level, job, socialCode });
};

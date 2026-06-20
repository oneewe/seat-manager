const classTitleInput = document.getElementById("classTitle");
const rowCountInput = document.getElementById("rowCount");
const colCountInput = document.getElementById("colCount");
const studentInput = document.getElementById("studentInput");
const genderPairModeInput = document.getElementById("genderPairMode");

const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");
const printBtn = document.getElementById("printBtn");

const toggleSecretBtn = document.getElementById("toggleSecretBtn");
const secretPanel = document.getElementById("secretPanel");

const fixedStudentSelect = document.getElementById("fixedStudentSelect");
const fixedRowInput = document.getElementById("fixedRow");
const fixedColInput = document.getElementById("fixedCol");
const addFixedSeatBtn = document.getElementById("addFixedSeatBtn");
const fixedSeatList = document.getElementById("fixedSeatList");
const fixedPairInput = document.getElementById("fixedPairInput");

const seatMap = document.getElementById("seatMap");
const resultTitle = document.getElementById("resultTitle");
const dateInfo = document.getElementById("dateInfo");
const studentCountInfo = document.getElementById("studentCountInfo");
const warningBox = document.getElementById("warningBox");

let fixedSeats = [];

const STORAGE_KEY = "middleSchoolEnglishSeatMaker";

document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  updateFixedStudentSelect();
  renderFixedSeatList();
});

studentInput.addEventListener("input", updateFixedStudentSelect);

toggleSecretBtn.addEventListener("click", () => {
  secretPanel.classList.toggle("hidden");

  if (secretPanel.classList.contains("hidden")) {
    toggleSecretBtn.textContent = "교사용 고급 설정 열기";
  } else {
    toggleSecretBtn.textContent = "교사용 고급 설정 닫기";
  }
});

addFixedSeatBtn.addEventListener("click", () => {
  const studentName = fixedStudentSelect.value;
  const row = Number(fixedRowInput.value);
  const col = Number(fixedColInput.value);

  if (!studentName) {
    alert("고정할 학생을 선택해 주세요.");
    return;
  }

  if (row < 1 || col < 1) {
    alert("줄과 칸은 1 이상이어야 합니다.");
    return;
  }

  const maxRows = Number(rowCountInput.value);
  const maxCols = Number(colCountInput.value);

  if (row > maxRows || col > maxCols) {
    alert(`현재 설정은 ${maxRows}줄 ${maxCols}칸입니다. 범위 안에서 입력해 주세요.`);
    return;
  }

  fixedSeats = fixedSeats.filter(item => item.studentName !== studentName);
  fixedSeats = fixedSeats.filter(item => !(item.row === row && item.col === col));

  fixedSeats.push({ studentName, row, col });
  renderFixedSeatList();
  saveData();
});

generateBtn.addEventListener("click", () => {
  generateSeats();
});

saveBtn.addEventListener("click", () => {
  saveData();
  alert("현재 설정이 이 브라우저에 저장되었습니다.");
});

sampleBtn.addEventListener("click", () => {
  studentInput.value =
`김하늘,여
박도윤,남
이서연,여
최민준,남
정다은,여
오지호,남
한유진,여
문시우,남
강민서,여
서준호,남
윤아린,여
임도현,남
배수아,여
홍건우,남
차예린,여
신태오,남
노지민,여
유찬,남
백서현,여
장우진,남
이지안,여
권민재,남
송채원,여
황준서,남
안소율,여
전하준,남
김나은,여
박은우,남
최서아,여
이현준,남`;
  updateFixedStudentSelect();
  saveData();
});

clearBtn.addEventListener("click", () => {
  const ok = confirm("저장된 명단과 고정 설정을 모두 삭제할까요?");
  if (!ok) return;

  localStorage.removeItem(STORAGE_KEY);
  classTitleInput.value = "";
  rowCountInput.value = 6;
  colCountInput.value = 6;
  studentInput.value = "";
  fixedPairInput.value = "";
  genderPairModeInput.checked = true;
  fixedSeats = [];
  seatMap.innerHTML = "";
  resultTitle.textContent = "자리 배치 결과";
  dateInfo.textContent = "자리표를 생성하면 날짜가 표시됩니다.";
  studentCountInfo.textContent = "0명";
  warningBox.classList.add("hidden");
  warningBox.innerHTML = "";
  updateFixedStudentSelect();
  renderFixedSeatList();
});

printBtn.addEventListener("click", () => {
  window.print();
});

function normalizeGender(rawGender) {
  const text = String(rawGender || "").trim().toLowerCase();

  if (["남", "남자", "m", "male", "boy", "남학생"].includes(text)) {
    return "남";
  }

  if (["여", "여자", "f", "female", "girl", "여학생"].includes(text)) {
    return "여";
  }

  return "";
}

function parseStudents() {
  const lines = studentInput.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const students = [];
  const usedNames = new Set();

  for (const line of lines) {
    let name = "";
    let gender = "";

    if (line.includes(",")) {
      const parts = line.split(",").map(part => part.trim());
      name = parts[0];
      gender = normalizeGender(parts[1]);
    } else if (line.includes("\t")) {
      const parts = line.split("\t").map(part => part.trim());
      name = parts[0];
      gender = normalizeGender(parts[1]);
    } else {
      const parts = line.split(/\s+/);
      name = parts[0];
      gender = normalizeGender(parts[1]);
    }

    if (!name || usedNames.has(name)) continue;

    usedNames.add(name);
    students.push({ name, gender });
  }

  return students;
}

function updateFixedStudentSelect() {
  const students = parseStudents();

  fixedStudentSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "학생 선택";
  fixedStudentSelect.appendChild(defaultOption);

  students.forEach(student => {
    const option = document.createElement("option");
    option.value = student.name;
    option.textContent = `${student.name}${student.gender ? ` (${student.gender})` : ""}`;
    fixedStudentSelect.appendChild(option);
  });
}

function renderFixedSeatList() {
  fixedSeatList.innerHTML = "";

  if (fixedSeats.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "아직 고정된 자리가 없습니다.";
    fixedSeatList.appendChild(empty);
    return;
  }

  fixedSeats.forEach((item, index) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `
      ${item.studentName} → ${item.row}줄 ${item.col}칸
      <button type="button" aria-label="삭제">×</button>
    `;

    tag.querySelector("button").addEventListener("click", () => {
      fixedSeats.splice(index, 1);
      renderFixedSeatList();
      saveData();
    });

    fixedSeatList.appendChild(tag);
  });
}

function parseFixedPairs() {
  const lines = fixedPairInput.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const pairs = [];

  for (const line of lines) {
    let parts = [];

    if (line.includes(",")) {
      parts = line.split(",").map(part => part.trim());
    } else if (line.includes("-")) {
      parts = line.split("-").map(part => part.trim());
    } else {
      parts = line.split(/\s+/).map(part => part.trim());
    }

    if (parts.length >= 2 && parts[0] && parts[1] && parts[0] !== parts[1]) {
      pairs.push([parts[0], parts[1]]);
    }
  }

  return pairs;
}

function generateSeats() {
  const students = parseStudents();
  const rowCount = Number(rowCountInput.value);
  const colCount = Number(colCountInput.value);
  const seatCount = rowCount * colCount;

  const warnings = [];

  if (students.length === 0) {
    alert("학생 명단을 입력해 주세요.");
    return;
  }

  if (students.length > seatCount) {
    alert(`학생 수는 ${students.length}명인데 좌석은 ${seatCount}개입니다. 줄/칸 수를 늘려 주세요.`);
    return;
  }

  const studentMap = new Map(students.map(student => [student.name, student]));
  const seats = Array(seatCount).fill(null);
  const assignedNames = new Set();

  const validFixedSeats = fixedSeats.filter(item => {
    if (!studentMap.has(item.studentName)) {
      warnings.push(`고정 자리 학생 "${item.studentName}"은 현재 명단에 없습니다.`);
      return false;
    }

    if (item.row < 1 || item.row > rowCount || item.col < 1 || item.col > colCount) {
      warnings.push(`"${item.studentName}"의 고정 자리 위치가 현재 좌석 범위를 벗어났습니다.`);
      return false;
    }

    return true;
  });

  for (const item of validFixedSeats) {
    const index = getIndex(item.row - 1, item.col - 1, colCount);

    if (seats[index]) {
      warnings.push(`${item.row}줄 ${item.col}칸에 이미 다른 학생이 고정되어 있습니다.`);
      continue;
    }

    if (assignedNames.has(item.studentName)) {
      warnings.push(`"${item.studentName}"이 중복 고정되어 하나만 반영했습니다.`);
      continue;
    }

    seats[index] = {
      ...studentMap.get(item.studentName),
      fixed: true
    };

    assignedNames.add(item.studentName);
  }

  const fixedPairs = parseFixedPairs();
  placeFixedPairs({
    fixedPairs,
    students,
    studentMap,
    seats,
    rowCount,
    colCount,
    assignedNames,
    warnings
  });

  const remainingStudents = students.filter(student => !assignedNames.has(student.name));
  shuffle(remainingStudents);

  if (genderPairModeInput.checked) {
    placeGenderPairs({
      remainingStudents,
      seats,
      rowCount,
      colCount,
      assignedNames
    });
  }

  fillRemainingSeats({
    students,
    seats,
    assignedNames
  });

  renderSeats(seats, rowCount, colCount);
  renderResultInfo(students.length);
  renderWarnings(warnings);
  saveData();
}

function placeFixedPairs({
  fixedPairs,
  studentMap,
  seats,
  rowCount,
  colCount,
  assignedNames,
  warnings
}) {
  const usedInPair = new Set();

  for (const [nameA, nameB] of fixedPairs) {
    if (!studentMap.has(nameA) || !studentMap.has(nameB)) {
      warnings.push(`고정 짝꿍 "${nameA}, ${nameB}" 중 명단에 없는 학생이 있습니다.`);
      continue;
    }

    if (usedInPair.has(nameA) || usedInPair.has(nameB)) {
      warnings.push(`고정 짝꿍 설정에서 "${nameA}" 또는 "${nameB}"이 중복되어 일부만 반영했습니다.`);
      continue;
    }

    usedInPair.add(nameA);
    usedInPair.add(nameB);

    const indexA = findStudentSeatIndex(seats, nameA);
    const indexB = findStudentSeatIndex(seats, nameB);

    if (indexA !== -1 && indexB !== -1) {
      if (!areAdjacent(indexA, indexB, colCount)) {
        warnings.push(`"${nameA}"와 "${nameB}"은 각각 고정석이 있어 짝꿍으로 붙여 앉히지 못했습니다.`);
      }
      assignedNames.add(nameA);
      assignedNames.add(nameB);
      continue;
    }

    if (indexA !== -1 && indexB === -1) {
      const nearSeat = findEmptyAdjacentSeat(indexA, seats, rowCount, colCount);
      if (nearSeat === -1) {
        warnings.push(`"${nameA}" 주변에 빈자리가 없어 "${nameB}"을 짝꿍으로 고정하지 못했습니다.`);
        continue;
      }

      seats[nearSeat] = {
        ...studentMap.get(nameB),
        fixedPair: true
      };
      assignedNames.add(nameA);
      assignedNames.add(nameB);
      continue;
    }

    if (indexA === -1 && indexB !== -1) {
      const nearSeat = findEmptyAdjacentSeat(indexB, seats, rowCount, colCount);
      if (nearSeat === -1) {
        warnings.push(`"${nameB}" 주변에 빈자리가 없어 "${nameA}"을 짝꿍으로 고정하지 못했습니다.`);
        continue;
      }

      seats[nearSeat] = {
        ...studentMap.get(nameA),
        fixedPair: true
      };
      assignedNames.add(nameA);
      assignedNames.add(nameB);
      continue;
    }

    const pairSlot = getRandomEmptyPairSlot(seats, rowCount, colCount);

    if (!pairSlot) {
      warnings.push(`빈 2인 좌석이 없어 "${nameA}, ${nameB}" 짝꿍 고정을 반영하지 못했습니다.`);
      continue;
    }

    const pair = shuffle([
      { ...studentMap.get(nameA), fixedPair: true },
      { ...studentMap.get(nameB), fixedPair: true }
    ]);

    seats[pairSlot[0]] = pair[0];
    seats[pairSlot[1]] = pair[1];
    assignedNames.add(nameA);
    assignedNames.add(nameB);
  }
}

function placeGenderPairs({
  remainingStudents,
  seats,
  rowCount,
  colCount,
  assignedNames
}) {
  const boys = remainingStudents.filter(student => student.gender === "남");
  const girls = remainingStudents.filter(student => student.gender === "여");

  shuffle(boys);
  shuffle(girls);

  let pairSlots = getEmptyPairSlots(seats, rowCount, colCount);
  shuffle(pairSlots);

  while (boys.length > 0 && girls.length > 0 && pairSlots.length > 0) {
    const slot = pairSlots.pop();
    const pair = shuffle([boys.pop(), girls.pop()]);

    seats[slot[0]] = pair[0];
    seats[slot[1]] = pair[1];

    assignedNames.add(pair[0].name);
    assignedNames.add(pair[1].name);
  }
}

function fillRemainingSeats({ students, seats, assignedNames }) {
  const remaining = students.filter(student => !assignedNames.has(student.name));
  shuffle(remaining);

  for (let i = 0; i < seats.length; i++) {
    if (!seats[i] && remaining.length > 0) {
      const student = remaining.pop();
      seats[i] = student;
      assignedNames.add(student.name);
    }
  }
}

function getEmptyPairSlots(seats, rowCount, colCount) {
  const slots = [];

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount - 1; c += 2) {
      const left = getIndex(r, c, colCount);
      const right = getIndex(r, c + 1, colCount);

      if (!seats[left] && !seats[right]) {
        slots.push([left, right]);
      }
    }
  }

  return slots;
}

function getRandomEmptyPairSlot(seats, rowCount, colCount) {
  const slots = getEmptyPairSlots(seats, rowCount, colCount);
  if (slots.length === 0) return null;

  shuffle(slots);
  return slots[0];
}

function findEmptyAdjacentSeat(index, seats, rowCount, colCount) {
  const row = Math.floor(index / colCount);
  const col = index % colCount;

  const candidates = [
    [row, col - 1],
    [row, col + 1],
    [row - 1, col],
    [row + 1, col]
  ];

  const validIndexes = candidates
    .filter(([r, c]) => r >= 0 && r < rowCount && c >= 0 && c < colCount)
    .map(([r, c]) => getIndex(r, c, colCount))
    .filter(candidateIndex => !seats[candidateIndex]);

  if (validIndexes.length === 0) return -1;

  shuffle(validIndexes);
  return validIndexes[0];
}

function findStudentSeatIndex(seats, studentName) {
  return seats.findIndex(seat => seat && seat.name === studentName);
}

function areAdjacent(indexA, indexB, colCount) {
  const rowA = Math.floor(indexA / colCount);
  const colA = indexA % colCount;
  const rowB = Math.floor(indexB / colCount);
  const colB = indexB % colCount;

  const rowDiff = Math.abs(rowA - rowB);
  const colDiff = Math.abs(colA - colB);

  return rowDiff + colDiff === 1;
}

function getIndex(row, col, colCount) {
  return row * colCount + col;
}

function renderSeats(seats, rowCount, colCount) {
  seatMap.innerHTML = "";
  seatMap.style.gridTemplateColumns = `repeat(${colCount}, 110px)`;

  seats.forEach((student, index) => {
    const row = Math.floor(index / colCount) + 1;
    const col = (index % colCount) + 1;

    const seat = document.createElement("div");
    seat.className = "seat";

    if (!student) {
      seat.classList.add("empty");
      seat.innerHTML = `
        <div class="seat-name">빈자리</div>
        <div class="seat-meta">${row}줄 ${col}칸</div>
      `;
    } else {
      if (student.gender === "남") {
        seat.classList.add("gender-male");
      } else if (student.gender === "여") {
        seat.classList.add("gender-female");
      } else {
        seat.classList.add("gender-unknown");
      }

      seat.innerHTML = `
        <div class="seat-name">${escapeHTML(student.name)}</div>
        <div class="seat-meta">${row}줄 ${col}칸 ${student.gender ? " · " + student.gender : ""}</div>
      `;
    }

    seatMap.appendChild(seat);
  });
}

function renderResultInfo(studentCount) {
  const title = classTitleInput.value.trim();

  resultTitle.textContent = title ? `${title} 자리 배치표` : "자리 배치 결과";
  studentCountInfo.textContent = `${studentCount}명`;

  const today = new Date();
  const nextChange = new Date(today);
  nextChange.setDate(today.getDate() + 14);

  dateInfo.textContent = `생성일: ${formatDate(today)} / 다음 자리 변경 권장일: ${formatDate(nextChange)}`;
}

function renderWarnings(warnings) {
  if (warnings.length === 0) {
    warningBox.classList.add("hidden");
    warningBox.innerHTML = "";
    return;
  }

  warningBox.classList.remove("hidden");
  warningBox.innerHTML = `
    <strong>확인 필요</strong>
    <ul>
      ${warnings.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
    </ul>
  `;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }

  return array;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}.`;
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveData() {
  const data = {
    classTitle: classTitleInput.value,
    rowCount: rowCountInput.value,
    colCount: colCountInput.value,
    studentInput: studentInput.value,
    genderPairMode: genderPairModeInput.checked,
    fixedSeats,
    fixedPairInput: fixedPairInput.value
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSavedData() {
  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) return;

  try {
    const data = JSON.parse(rawData);

    classTitleInput.value = data.classTitle || "";
    rowCountInput.value = data.rowCount || 6;
    colCountInput.value = data.colCount || 6;
    studentInput.value = data.studentInput || "";
    genderPairModeInput.checked = data.genderPairMode ?? true;
    fixedSeats = data.fixedSeats || [];
    fixedPairInput.value = data.fixedPairInput || "";
  } catch (error) {
    console.error("저장된 데이터를 불러오지 못했습니다.", error);
  }
}

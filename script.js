```javascript
// script.js
document.addEventListener("DOMContentLoaded", function () {
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
  const distancePairInput = document.getElementById("distancePairInput");

  const seatMap = document.getElementById("seatMap");
  const resultTitle = document.getElementById("resultTitle");
  const dateInfo = document.getElementById("dateInfo");
  const viewInfo = document.getElementById("viewInfo");
  const studentCountInfo = document.getElementById("studentCountInfo");
  const warningBox = document.getElementById("warningBox");

  const viewTeacherBtn = document.getElementById("viewTeacherBtn");
  const viewStudentBtn = document.getElementById("viewStudentBtn");
  const printTeacherBtn = document.getElementById("printTeacherBtn");
  const printStudentBtn = document.getElementById("printStudentBtn");

  const STORAGE_KEY = "randomSeatManagerData";
  let fixedSeats = [];
  let currentViewMode = "teacher";
  let latestSeats = [];
  let latestRowCount = 0;
  let latestColCount = 0;
  let latestDistanceNames = new Set();

  loadSavedData();
  setViewMode(currentViewMode);
  updateFixedStudentSelect();
  renderFixedSeatList();

  studentInput.addEventListener("input", function () {
    updateFixedStudentSelect();
    saveData();
  });

  rowCountInput.addEventListener("input", saveData);
  colCountInput.addEventListener("input", saveData);
  classTitleInput.addEventListener("input", saveData);
  genderPairModeInput.addEventListener("change", saveData);
  fixedPairInput.addEventListener("input", saveData);
  distancePairInput.addEventListener("input", saveData);

  toggleSecretBtn.addEventListener("click", function () {
    secretPanel.classList.toggle("hidden");

    if (secretPanel.classList.contains("hidden")) {
      toggleSecretBtn.textContent = "교사용 고급 설정 열기";
    } else {
      toggleSecretBtn.textContent = "교사용 고급 설정 닫기";
    }
  });

  viewTeacherBtn.addEventListener("click", function () {
    setViewMode("teacher");
  });

  viewStudentBtn.addEventListener("click", function () {
    setViewMode("student");
  });

  printTeacherBtn.addEventListener("click", function () {
    printForMode("teacher");
  });

  printStudentBtn.addEventListener("click", function () {
    printForMode("student");
  });

  printBtn.addEventListener("click", function () {
    printForMode(currentViewMode);
  });

  addFixedSeatBtn.addEventListener("click", function () {
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

    fixedSeats = fixedSeats.filter(function (item) {
      return item.studentName !== studentName;
    });

    fixedSeats = fixedSeats.filter(function (item) {
      return !(item.row === row && item.col === col);
    });

    fixedSeats.push({ studentName: studentName, row: row, col: col });

    renderFixedSeatList();
    saveData();
  });

  generateBtn.addEventListener("click", function () {
    generateSeats();
  });

  saveBtn.addEventListener("click", function () {
    saveData();
    alert("현재 설정이 이 브라우저에 저장되었습니다.");
  });

  sampleBtn.addEventListener("click", function () {
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

    fixedPairInput.value = "김하늘, 박도윤";
    distancePairInput.value = "정다은, 오지호\n한유진, 문시우";

    updateFixedStudentSelect();
    saveData();
  });

  clearBtn.addEventListener("click", function () {
    const ok = confirm("저장된 명단과 고정 설정을 모두 삭제할까요?");
    if (!ok) return;

    localStorage.removeItem(STORAGE_KEY);

    classTitleInput.value = "";
    rowCountInput.value = 6;
    colCountInput.value = 6;
    studentInput.value = "";
    fixedPairInput.value = "";
    distancePairInput.value = "";
    genderPairModeInput.checked = true;
    fixedSeats = [];
    latestSeats = [];
    latestDistanceNames = new Set();

    seatMap.innerHTML = "";
    resultTitle.textContent = "자리 배치 결과";
    dateInfo.textContent = "자리표를 생성하면 날짜가 표시됩니다.";
    studentCountInfo.textContent = "0명";
    warningBox.classList.add("hidden");
    warningBox.innerHTML = "";

    setViewMode("teacher");
    updateFixedStudentSelect();
    renderFixedSeatList();
  });

  function setViewMode(mode) {
    currentViewMode = mode;
    document.body.dataset.view = mode;

    if (mode === "teacher") {
      viewTeacherBtn.classList.add("active");
      viewStudentBtn.classList.remove("active");
      viewInfo.textContent = "현재: 교사 시점";
    } else {
      viewStudentBtn.classList.add("active");
      viewTeacherBtn.classList.remove("active");
      viewInfo.textContent = "현재: 학생 시점";
    }

    saveData();
  }

  function printForMode(mode) {
    const originalView = currentViewMode;

    setViewMode(mode);
    document.body.dataset.printMode = mode;

    setTimeout(function () {
      window.print();

      setTimeout(function () {
        document.body.dataset.printMode = "";
        setViewMode(originalView);
      }, 300);
    }, 100);
  }

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
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);

    const students = [];
    const usedNames = new Set();

    lines.forEach(function (line) {
      let name = "";
      let gender = "";

      if (line.includes(",")) {
        const parts = line.split(",").map(function (part) {
          return part.trim();
        });
        name = parts[0];
        gender = normalizeGender(parts[1]);
      } else if (line.includes("\t")) {
        const parts = line.split("\t").map(function (part) {
          return part.trim();
        });
        name = parts[0];
        gender = normalizeGender(parts[1]);
      } else {
        const parts = line.split(/\s+/);
        name = parts[0];
        gender = normalizeGender(parts[1]);
      }

      if (!name || usedNames.has(name)) return;

      usedNames.add(name);
      students.push({ name: name, gender: gender });
    });

    return students;
  }

  function updateFixedStudentSelect() {
    const students = parseStudents();

    fixedStudentSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "학생 선택";
    fixedStudentSelect.appendChild(defaultOption);

    students.forEach(function (student) {
      const option = document.createElement("option");
      option.value = student.name;
      option.textContent = student.gender
        ? `${student.name} (${student.gender})`
        : student.name;

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

    fixedSeats.forEach(function (item, index) {
      const tag = document.createElement("span");
      tag.className = "tag";

      const text = document.createElement("span");
      text.textContent = `${item.studentName} → ${item.row}줄 ${item.col}칸`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "×";

      removeBtn.addEventListener("click", function () {
        fixedSeats.splice(index, 1);
        renderFixedSeatList();
        saveData();
      });

      tag.appendChild(text);
      tag.appendChild(removeBtn);
      fixedSeatList.appendChild(tag);
    });
  }

  function parseNameLine(line) {
    let parts = [];

    if (line.includes(",")) {
      parts = line.split(",");
    } else if (line.includes("-")) {
      parts = line.split("-");
    } else {
      parts = line.split(/\s+/);
    }

    return parts
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean);
  }

  function parseFixedPairs() {
    const lines = fixedPairInput.value
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);

    const pairs = [];

    lines.forEach(function (line) {
      const parts = parseNameLine(line);

      if (parts.length >= 2 && parts[0] !== parts[1]) {
        pairs.push([parts[0], parts[1]]);
      }
    });

    return pairs;
  }

  function parseDistancePairs() {
    const lines = distancePairInput.value
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);

    const pairs = [];
    const pairKeys = new Set();

    lines.forEach(function (line) {
      const names = parseNameLine(line);

      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          if (names[i] === names[j]) continue;

          const key = [names[i], names[j]].sort().join("||");

          if (!pairKeys.has(key)) {
            pairKeys.add(key);
            pairs.push([names[i], names[j]]);
          }
        }
      }
    });

    return pairs;
  }

  function generateSeats() {
    const students = parseStudents();
    const rowCount = Number(rowCountInput.value);
    const colCount = Number(colCountInput.value);
    const seatCount = rowCount * colCount;

    if (students.length === 0) {
      alert("학생 명단을 입력해 주세요.");
      return;
    }

    if (students.length > seatCount) {
      alert(`학생 수는 ${students.length}명인데 좌석은 ${seatCount}개입니다. 줄/칸 수를 늘려 주세요.`);
      return;
    }

    const distancePairs = parseDistancePairs();
    const distanceNames = getDistanceNameSet(distancePairs);

    let bestResult = null;
    let bestViolationCount = Infinity;

    for (let attempt = 0; attempt < 500; attempt++) {
      const result = makeArrangement(students, rowCount, colCount);
      const violations = getDistanceViolations(result.seats, distancePairs, colCount);

      if (violations.length < bestViolationCount) {
        bestResult = result;
        bestViolationCount = violations.length;
      }

      if (violations.length === 0) {
        break;
      }
    }

    if (!bestResult) return;

    const finalViolations = getDistanceViolations(bestResult.seats, distancePairs, colCount);
    const allWarnings = bestResult.warnings.slice();

    finalViolations.forEach(function (item) {
      allWarnings.push(`거리두기 설정: "${item[0]}"와 "${item[1]}"이 가까운 자리에 배치되었습니다. 좌석 수나 고정 조건 때문에 완전히 분리하지 못했을 수 있습니다.`);
    });

    latestSeats = bestResult.seats;
    latestRowCount = rowCount;
    latestColCount = colCount;
    latestDistanceNames = distanceNames;

    renderSeats(bestResult.seats, rowCount, colCount, distanceNames);
    renderResultInfo(students.length);
    renderWarnings(allWarnings);
    saveData();
  }

  function makeArrangement(students, rowCount, colCount) {
    const seatCount = rowCount * colCount;
    const studentMap = new Map();
    const warnings = [];
    const seats = Array(seatCount).fill(null);
    const assignedNames = new Set();

    students.forEach(function (student) {
      studentMap.set(student.name, student);
    });

    fixedSeats.forEach(function (item) {
      if (!studentMap.has(item.studentName)) {
        warnings.push(`고정 자리 학생 "${item.studentName}"은 현재 명단에 없습니다.`);
        return;
      }

      if (item.row < 1 || item.row > rowCount || item.col < 1 || item.col > colCount) {
        warnings.push(`"${item.studentName}"의 고정 자리 위치가 현재 좌석 범위를 벗어났습니다.`);
        return;
      }

      const index = getIndex(item.row - 1, item.col - 1, colCount);

      if (seats[index]) {
        warnings.push(`${item.row}줄 ${item.col}칸에 이미 다른 학생이 고정되어 있습니다.`);
        return;
      }

      seats[index] = Object.assign({}, studentMap.get(item.studentName), {
        fixed: true
      });

      assignedNames.add(item.studentName);
    });

    placeFixedPairs({
      fixedPairs: parseFixedPairs(),
      studentMap: studentMap,
      seats: seats,
      rowCount: rowCount,
      colCount: colCount,
      assignedNames: assignedNames,
      warnings: warnings
    });

    const remainingStudents = students.filter(function (student) {
      return !assignedNames.has(student.name);
    });

    shuffle(remainingStudents);

    if (genderPairModeInput.checked) {
      placeGenderPairs({
        remainingStudents: remainingStudents,
        seats: seats,
        rowCount: rowCount,
        colCount: colCount,
        assignedNames: assignedNames
      });
    }

    fillRemainingSeats({
      students: students,
      seats: seats,
      assignedNames: assignedNames
    });

    return {
      seats: seats,
      warnings: warnings
    };
  }

  function placeFixedPairs(data) {
    const fixedPairs = data.fixedPairs;
    const studentMap = data.studentMap;
    const seats = data.seats;
    const rowCount = data.rowCount;
    const colCount = data.colCount;
    const assignedNames = data.assignedNames;
    const warnings = data.warnings;
    const usedInPair = new Set();

    fixedPairs.forEach(function (pairNames) {
      const nameA = pairNames[0];
      const nameB = pairNames[1];

      if (!studentMap.has(nameA) || !studentMap.has(nameB)) {
        warnings.push(`고정 짝꿍 "${nameA}, ${nameB}" 중 명단에 없는 학생이 있습니다.`);
        return;
      }

      if (usedInPair.has(nameA) || usedInPair.has(nameB)) {
        warnings.push(`고정 짝꿍 설정에서 "${nameA}" 또는 "${nameB}"이 중복되어 일부만 반영했습니다.`);
        return;
      }

      usedInPair.add(nameA);
      usedInPair.add(nameB);

      const indexA = findStudentSeatIndex(seats, nameA);
      const indexB = findStudentSeatIndex(seats, nameB);

      if (indexA !== -1 && indexB !== -1) {
        if (!areSideBySide(indexA, indexB, colCount)) {
          warnings.push(`"${nameA}"와 "${nameB}"은 각각 고정석이 있어 짝꿍으로 붙여 앉히지 못했습니다.`);
        }

        assignedNames.add(nameA);
        assignedNames.add(nameB);
        return;
      }

      if (indexA !== -1 && indexB === -1) {
        const nearSeat = findEmptySideSeat(indexA, seats, rowCount, colCount);

        if (nearSeat === -1) {
          warnings.push(`"${nameA}" 주변에 빈자리가 없어 "${nameB}"을 짝꿍으로 고정하지 못했습니다.`);
          return;
        }

        seats[nearSeat] = Object.assign({}, studentMap.get(nameB), {
          fixedPair: true
        });

        assignedNames.add(nameA);
        assignedNames.add(nameB);
        return;
      }

      if (indexA === -1 && indexB !== -1) {
        const nearSeat = findEmptySideSeat(indexB, seats, rowCount, colCount);

        if (nearSeat === -1) {
          warnings.push(`"${nameB}" 주변에 빈자리가 없어 "${nameA}"을 짝꿍으로 고정하지 못했습니다.`);
          return;
        }

        seats[nearSeat] = Object.assign({}, studentMap.get(nameA), {
          fixedPair: true
        });

        assignedNames.add(nameA);
        assignedNames.add(nameB);
        return;
      }

      const pairSlot = getRandomEmptyPairSlot(seats, rowCount, colCount);

      if (!pairSlot) {
        warnings.push(`빈 2인 좌석이 없어 "${nameA}, ${nameB}" 짝꿍 고정을 반영하지 못했습니다.`);
        return;
      }

      const pairStudents = shuffle([
        Object.assign({}, studentMap.get(nameA), { fixedPair: true }),
        Object.assign({}, studentMap.get(nameB), { fixedPair: true })
      ]);

      seats[pairSlot[0]] = pairStudents[0];
      seats[pairSlot[1]] = pairStudents[1];

      assignedNames.add(nameA);
      assignedNames.add(nameB);
    });
  }

  function placeGenderPairs(data) {
    const remainingStudents = data.remainingStudents;
    const seats = data.seats;
    const rowCount = data.rowCount;
    const colCount = data.colCount;
    const assignedNames = data.assignedNames;

    const boys = remainingStudents.filter(function (student) {
      return student.gender === "남";
    });

    const girls = remainingStudents.filter(function (student) {
      return student.gender === "여";
    });

    shuffle(boys);
    shuffle(girls);

    const pairSlots = getEmptyPairSlots(seats, rowCount, colCount);
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

  function fillRemainingSeats(data) {
    const students = data.students;
    const seats = data.seats;
    const assignedNames = data.assignedNames;

    const remaining = students.filter(function (student) {
      return !assignedNames.has(student.name);
    });

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

  function findEmptySideSeat(index, seats, rowCount, colCount) {
    const row = Math.floor(index / colCount);
    const col = index % colCount;

    const candidates = [
      [row, col - 1],
      [row, col + 1]
    ];

    const validIndexes = candidates
      .filter(function (position) {
        const r = position[0];
        const c = position[1];
        return r >= 0 && r < rowCount && c >= 0 && c < colCount;
      })
      .map(function (position) {
        return getIndex(position[0], position[1], colCount);
      })
      .filter(function (candidateIndex) {
        return !seats[candidateIndex];
      });

    if (validIndexes.length === 0) return -1;

    shuffle(validIndexes);
    return validIndexes[0];
  }

  function findStudentSeatIndex(seats, studentName) {
    return seats.findIndex(function (seat) {
      return seat && seat.name === studentName;
    });
  }

  function areSideBySide(indexA, indexB, colCount) {
    const rowA = Math.floor(indexA / colCount);
    const colA = indexA % colCount;
    const rowB = Math.floor(indexB / colCount);
    const colB = indexB % colCount;

    return rowA === rowB && Math.abs(colA - colB) === 1;
  }

  function areTooClose(indexA, indexB, colCount) {
    const rowA = Math.floor(indexA / colCount);
    const colA = indexA % colCount;
    const rowB = Math.floor(indexB / colCount);
    const colB = indexB % colCount;

    const rowDiff = Math.abs(rowA - rowB);
    const colDiff = Math.abs(colA - colB);

    return rowDiff <= 1 && colDiff <= 1;
  }

  function getDistanceViolations(seats, distancePairs, colCount) {
    const violations = [];

    distancePairs.forEach(function (pair) {
      const nameA = pair[0];
      const nameB = pair[1];

      const indexA = findStudentSeatIndex(seats, nameA);
      const indexB = findStudentSeatIndex(seats, nameB);

      if (indexA === -1 || indexB === -1) return;

      if (areTooClose(indexA, indexB, colCount)) {
        violations.push([nameA, nameB]);
      }
    });

    return violations;
  }

  function getDistanceNameSet(distancePairs) {
    const set = new Set();

    distancePairs.forEach(function (pair) {
      set.add(pair[0]);
      set.add(pair[1]);
    });

    return set;
  }

  function getIndex(row, col, colCount) {
    return row * colCount + col;
  }

  function renderSeats(seats, rowCount, colCount, distanceNames) {
    seatMap.innerHTML = "";
    seatMap.style.gridTemplateColumns = `repeat(${colCount}, 110px)`;

    seats.forEach(function (student, index) {
      const row = Math.floor(index / colCount) + 1;
      const col = (index % colCount) + 1;

      const seat = document.createElement("div");
      seat.className = "seat";

      const nameDiv = document.createElement("div");
      nameDiv.className = "seat-name";

      const metaDiv = document.createElement("div");
      metaDiv.className = "seat-meta teacher-only-in-seat";

      const badgeDiv = document.createElement("div");
      badgeDiv.className = "seat-badges teacher-only-in-seat";

      if (!student) {
        seat.classList.add("empty");
        nameDiv.textContent = "빈자리";
        metaDiv.textContent = `${row}줄 ${col}칸`;
      } else {
        if (student.gender === "남") {
          seat.classList.add("gender-male");
        } else if (student.gender === "여") {
          seat.classList.add("gender-female");
        } else {
          seat.classList.add("gender-unknown");
        }

        nameDiv.textContent = student.name;
        metaDiv.textContent = student.gender
          ? `${row}줄 ${col}칸 · ${student.gender}`
          : `${row}줄 ${col}칸`;

        if (student.fixed) {
          badgeDiv.appendChild(createBadge("자리고정", "badge-fixed"));
        }

        if (student.fixedPair) {
          badgeDiv.appendChild(createBadge("짝고정", "badge-pair"));
        }

        if (distanceNames.has(student.name)) {
          badgeDiv.appendChild(createBadge("거리두기", "badge-distance"));
        }
      }

      seat.appendChild(nameDiv);
      seat.appendChild(metaDiv);

      if (badgeDiv.children.length > 0) {
        seat.appendChild(badgeDiv);
      }

      seatMap.appendChild(seat);
    });
  }

  function createBadge(text, className) {
    const badge = document.createElement("span");
    badge.className = `seat-badge ${className}`;
    badge.textContent = text;
    return badge;
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
    warningBox.innerHTML = "";

    if (warnings.length === 0) {
      warningBox.classList.add("hidden");
      return;
    }

    warningBox.classList.remove("hidden");

    const strong = document.createElement("strong");
    strong.textContent = "확인 필요";

    const ul = document.createElement("ul");

    warnings.forEach(function (warning) {
      const li = document.createElement("li");
      li.textContent = warning;
      ul.appendChild(li);
    });

    warningBox.appendChild(strong);
    warningBox.appendChild(ul);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[randomIndex];
      array[randomIndex] = temp;
    }

    return array;
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}. ${month}. ${day}.`;
  }

  function saveData() {
    const data = {
      classTitle: classTitleInput.value,
      rowCount: rowCountInput.value,
      colCount: colCountInput.value,
      studentInput: studentInput.value,
      genderPairMode: genderPairModeInput.checked,
      fixedSeats: fixedSeats,
      fixedPairInput: fixedPairInput.value,
      distancePairInput: distancePairInput.value,
      currentViewMode: currentViewMode
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
      genderPairModeInput.checked = data.genderPairMode !== false;
      fixedSeats = data.fixedSeats || [];
      fixedPairInput.value = data.fixedPairInput || "";
      distancePairInput.value = data.distancePairInput || "";
      currentViewMode = data.currentViewMode || "teacher";
    } catch (error) {
      console.log("저장된 데이터를 불러오지 못했습니다.", error);
    }
  }
});
```

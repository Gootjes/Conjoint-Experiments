Qualtrics.SurveyEngine.addOnReady(function () {
  var q = this;

  /* ----------- SETTINGS ----------- */
  var N_ROWS = 8;         // how many subjects to show
  var MAX_CLICKS = 8;     // total reveals allowed
  var LABEL_A = "Country A";
  var LABEL_B = "Country B";
  var PLACEHOLDER = "Click to reveal";
  var COOLDOWN_SEC = 2;   // ← set your X seconds here (0 disables cooldown)

  // Edit these pools for your attributes & levels
  var SUBJECT_POOL = [
    { name: "Subject 1", values: ["item A1", "item A2", "item A3"] },
    { name: "Subject 2", values: ["item B1", "item B2", "item B3"] },
    { name: "Subject 3", values: ["item C1", "item C2", "item C3"] },
    { name: "Subject 4", values: ["item D1", "item D2", "item D3"] },
    { name: "Subject 5", values: ["item E1", "item E2", "item E3"] },
    { name: "Subject 6", values: ["item F1", "item F2", "item F3"] }
  ];
	// Note the ' instead of "
  SUBJECT_POOL = JSON.parse('${q://QID3/QuestionText}');
  /* -------------------------------- */

  function shuffle(arr) {
    var a = arr.slice(0), i, j, tmp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function sampleNoReplace(arr, k) {
    return shuffle(arr).slice(0, k);
  }
  function sampleOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Randomize subjects and candidate values
  var chosen = sampleNoReplace(SUBJECT_POOL, N_ROWS);
  var rows = [];
  for (var i = 0; i < chosen.length; i++) {
    rows.push({
      row: i + 1,
      subject: chosen[i].name,
      A: sampleOne(chosen[i].values),
      B: sampleOne(chosen[i].values)
    });
  }

  // Build table HTML
  var root = document.getElementById("cj-container");
  if (!root) { return; }

  var html = '';
  html += '<table class="cj-table">';
  html += '  <thead class="cj-head"><tr>';
  html += '    <th></th><th>' + LABEL_A + '</th><th>' + LABEL_B + '</th>';
  html += '  </tr></thead><tbody>';

  for (var r = 0; r < rows.length; r++) {
    html += '  <tr class="cj-row" data-row="' + rows[r].row + '">';
    html += '    <th scope="row">' + rows[r].subject + '</th>';
    html += '    <td class="cj-cell" data-col="A" data-row="' + rows[r].row + '"><span class="placeholder">' + PLACEHOLDER + '</span></td>';
    html += '    <td class="cj-cell" data-col="B" data-row="' + rows[r].row + '"><span class="placeholder">' + PLACEHOLDER + '</span></td>';
    html += '  </tr>';
  }
  html += '  </tbody></table>';
  html += '  <div class="cj-foot">';
  html += '    <div class="cj-count" id="cj-count">Clicks left: ' + MAX_CLICKS + '</div>';
  html += '    <div class="cj-legend">Reveal up to ' + MAX_CLICKS + ' items, then choose ' + LABEL_A + ' or ' + LABEL_B + ' below.</div>';
  html += '    <div class="cj-cool" id="cj-cooldown" style="display:none">Please wait…</div>';
  html += '  </div>';

  root.innerHTML = html;

  // Logging state
  var startTs = (new Date()).getTime();
  Qualtrics.SurveyEngine.setEmbeddedData("cj_started_at", String(startTs));

  var clickCount = 0;
  var order = 0;
  var clickLog = [];          // {order, tMs, col, row, subject, value}
  var revealed = {};          // keys like "A-1": true

  var countEl = document.getElementById("cj-count");
  var cells = root.querySelectorAll(".cj-cell");
  
  var cooling = false;
  var cooldownTimer = null;
  var cooldownEndTs = 0;
  var coolEl = null;
  
  function setBlocked(on) {
    for (var i = 0; i < cells.length; i++) {
  	var td = cells[i];
  	if (on) {
  	  if (td.className.indexOf("blocked") === -1) td.className += " blocked";
  	} else {
  	  td.className = td.className.replace(/\bblocked\b/g, "").replace(/\s{2,}/g, " ").trim();
  	}
    }
  }
  
  function updateCooldownText() {
    if (!coolEl) return;
    var nowTs = (new Date()).getTime();
    var remain = Math.ceil((cooldownEndTs - nowTs) / 1000);
    coolEl.textContent = "Please wait " + (remain < 0 ? 0 : remain) + "s before your next reveal.";
  }
  
  function startCooldown() {
    if (COOLDOWN_SEC <= 0) return;
    if (!coolEl) coolEl = document.getElementById("cj-cooldown");
  
    cooling = true;
    cooldownEndTs = (new Date()).getTime() + COOLDOWN_SEC * 1000;
    if (coolEl) { coolEl.style.display = "inline"; }
    setBlocked(true);
    updateCooldownText();
  
    if (cooldownTimer) { clearInterval(cooldownTimer); }
    cooldownTimer = setInterval(function () {
  	var nowTs = (new Date()).getTime();
  	if (nowTs >= cooldownEndTs) {
  	  clearInterval(cooldownTimer);
  	  cooling = false;
  	  if (coolEl) { coolEl.style.display = "none"; }
  	  setBlocked(false);
  	} else {
  	  updateCooldownText();
  	}
    }, 100);
  }


  function updateCounter() {
    var left = MAX_CLICKS - clickCount;
    if (left < 0) { left = 0; }
    countEl.textContent = "Clicks left: " + left;
  }
  function lockUnrevealed() {
    if (clickCount < MAX_CLICKS) { return; }
    for (var i2 = 0; i2 < cells.length; i2++) {
      var td = cells[i2];
      var key = td.getAttribute("data-col") + "-" + td.getAttribute("data-row");
      if (!revealed[key]) { td.className += " locked"; }
    }
  }
  function revealCell(td) {
	if (cooling) { return; }
    var col = td.getAttribute("data-col");
    var rowIdx = parseInt(td.getAttribute("data-row"), 10);
    var key = col + "-" + rowIdx;

    if (revealed[key]) { return; }
    if (clickCount >= MAX_CLICKS) { return; }

    var rObj = rows[rowIdx - 1];
    var value = (col === "A") ? rObj.A : rObj.B;

    if (td.className.indexOf("revealed") === -1) {
      td.className += " revealed";
    }
    td.innerHTML = "<span>" + value + "</span>";

    revealed[key] = true;
    clickCount += 1;
    order += 1;

    var tMs = (new Date()).getTime() - startTs;
    clickLog.push({
      order: order,
      tMs: tMs,
      col: col,
      row: rowIdx,
      subject: rObj.subject,
      value: value
    });

    updateCounter();
    lockUnrevealed();
	if (clickCount < MAX_CLICKS) { startCooldown(); }
  }

  // Bind click handlers
  for (var c = 0; c < cells.length; c++) {
    (function (td) {
      td.addEventListener("click", function () { revealCell(td); });
    })(cells[c]);
  }

  // Persist to Embedded Data
  function persist() {
    var assignment = { labelA: LABEL_A, labelB: LABEL_B, rows: rows };
    Qualtrics.SurveyEngine.setEmbeddedData("cj_assignments", JSON.stringify(assignment));
    Qualtrics.SurveyEngine.setEmbeddedData("cj_click_log", JSON.stringify(clickLog));
    Qualtrics.SurveyEngine.setEmbeddedData("cj_click_count", String(clickCount));
    Qualtrics.SurveyEngine.setEmbeddedData("cj_finished_at", String((new Date()).getTime()));
  }

  Qualtrics.SurveyEngine.addOnPageSubmit(function () { persist(); });
});
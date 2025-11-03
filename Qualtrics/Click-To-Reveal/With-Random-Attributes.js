Qualtrics.SurveyEngine.addOnReady(function () {
  var q = this;

  /* ----------- SETTINGS ----------- */
  var N_ROWS = {
    R: 4,
    H: 2,
    U: 2,
  };         // how many attributes to show
  var N_COLUMNS = 1;
  var COLUMN_LABELS = ["Government attributes"];
  var MAX_CLICKS = 4;     // total reveals allowed
  var LABEL_A = "Country A";
  var LABEL_B = "Country B";
  var PLACEHOLDER = "Click to reveal"; // TODO: import this from a localized question
  var COOLDOWN_SEC = 2;   // ← set your X seconds here (0 disables cooldown)

  var LEGEND_COUNT_LABEL = "Clicks left: ";
  var LEGEND_ACTION_LABEL = "Reveal up to '" + MAX_CLICKS + "' items, then choose '" + LABEL_A + "' or '" + LABEL_B + "' below.";
  var LEGEND_COOLDOWN_LABEL = "Please wait...";
  var LEGEND_COOLDOWN_EXTRA_LABEL = "Please wait {X} seconds before your next reveal.";

  // For convenience, the conjoint data can be loaded from a question.
  // If not set, then the attribute pool below will be used.
  var ATTRIBUTE_POOL_PIPED = false;

  // Edit these pools for your attributes & levels
  var ATTRIBUTE_POOL = {
    R: [
      { name: "attribute R01", values: ["value R01_1", "value R01_2", "value R01_3"] },
      { name: "attribute R02", values: ["value R02_1", "value R02_2", "value R02_3"] },
      { name: "attribute R03", values: ["value R03_1", "value R03_2", "value R03_3"] },
      { name: "attribute R04", values: ["value R04_1", "value R04_2", "value R04_3"] },
      { name: "attribute R05", values: ["value R05_1", "value R05_2", "value R05_3"] },
      { name: "attribute R06", values: ["value R06_1", "value R06_2", "value R06_3"] },
      { name: "attribute R07", values: ["value R07_1", "value R07_2", "value R07_3"] },
      { name: "attribute R08", values: ["value R08_1", "value R08_2", "value R08_3"] },
      { name: "attribute R09", values: ["value R09_1", "value R09_2", "value R09_3"] },
      { name: "attribute R10", values: ["value R10_1", "value R10_2", "value R10_3"] },
      { name: "attribute R11", values: ["value R11_1", "value R11_2", "value R11_3"] },
      { name: "attribute R12", values: ["value R12_1", "value R12_2", "value R12_3"] }
    ],
    H: [
      { name: "attribute H01", values: ["value H01_1", "value H01_2", "value H01_3"] },
      { name: "attribute H02", values: ["value H02_1", "value H02_2", "value H02_3"] },
      { name: "attribute H03", values: ["value H03_1", "value H03_2", "value H03_3"] },
      { name: "attribute H04", values: ["value H04_1", "value H04_2", "value H04_3"] },
      { name: "attribute H05", values: ["value H05_1", "value H05_2", "value H05_3"] },
      { name: "attribute H06", values: ["value H06_1", "value H06_2", "value H06_3"] }
    ],
    U: [
      { name: "attribute U01", values: ["value U01_1", "value U01_2", "value U01_3"] },
      { name: "attribute U02", values: ["value U02_1", "value U02_2", "value U02_3"] },
      { name: "attribute U03", values: ["value U03_1", "value U03_2", "value U03_3"] },
      { name: "attribute U04", values: ["value U04_1", "value U04_2", "value U04_3"] },
      { name: "attribute U05", values: ["value U05_1", "value U05_2", "value U05_3"] },
      { name: "attribute U06", values: ["value U06_1", "value U06_2", "value U06_3"] }
    ]
  };
  
  // Note the ' instead of "
  if (ATTRIBUTE_POOL_PIPED) {
    ATTRIBUTE_POOL = JSON.parse('${q://QID3/QuestionText}');
  }

  // Embedded data fields
  var EMBEDDED_DATA_NAME_START_TIME = "cj_started_at";
  var EMBEDDED_DATA_NAME_ASSIGNMENTS = "cj_assignments";
  var EMBEDDED_DATA_NAME_CLICK_LOG = "cj_click_log";
  var EMBEDDED_DATA_NAME_CLICK_COUNT = "cj_click_count";
  var EMBEDDED_DATA_NAME_FINISHED_TIME = "cj_finished_at";
  var EMBEDDED_DATA_CLICK_PREFIX = "cj_click_";

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
  function sampleIndicesNoReplace(arr, k) {
    var indices = [];
    for (var i = 0; i < arr.length; i++ ) {
      indices.push(i);
    }
    return shuffle(indices).slice(0, k);
  }
  
  function sampleOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function sampleOneIndex(arr) {
    var indices = [];
    for (var i = 0; i < arr.length; i++ ) {
      indices.push(i);
    }
    return sampleOne(indices);
  }

  function sampleWithIndex(arr, k) {
    var result = [];
    var indices = sampleIndicesNoReplace(arr, k);
    for(var i = 0; i < indices.length; i++) {
      var index = indices[i];
      var obj = arr[index];
      obj.index = index;
      result.push(obj);
    }
    return result;
  }

  function sampleType(type) {
    var result = sampleWithIndex(ATTRIBUTE_POOL[type], N_ROWS[type]);
    for (var i = 0; i < result.length; i ++) {
      result[i].type = type;
    }
    return result;
  }

  function populateTableData() {
    var chosen = [];

    var types = Object.keys(ATTRIBUTE_POOL);
    
    for (var t = 0; t < types.length; t++) {
      var type = types[t];
      var ch = sampleType(type);
      for (var i = 0; i < ch.length; i++) {
        chosen.push(ch[i]);
      }
    }

    chosen = shuffle(chosen);
    
    var rows = [];
    for (var i = 0; i < chosen.length; i++) {
      var colValueIndices = []
      for (var j = 0; j < N_COLUMNS; j++) {
        colValueIndices.push(sampleOneIndex(chosen[i].values));
      }
      var colValues = []
      for (var j = 0; j < colValueIndices.length; j++) {
        colValues.push(chosen[i].values[colValueIndices[j]]);
      }
      rows.push({
        row: i,
        attribute: chosen[i].name,
        valueIndices: colValueIndices,
        values: colValues,
        type: chosen[i].type,
        index: chosen[i].index,
      });
    }

    return  rows;
  }

  // Randomize attributes and candidate values
  var rows = populateTableData()
  globalThis.rows = rows;

  // Build table HTML
  var root = document.getElementById("cj-container");
  if (!root) { return; }

  var html = '';
  html += '<table class="cj-table">';
  html += '  <thead class="cj-head"><tr>';
  html += '<th></th>';
  for (var cl = 0; cl < COLUMN_LABELS.length; cl ++) {
    var label = COLUMN_LABELS[cl];
    html += '<th>' + COLUMN_LABELS[cl] + '</th>'; 
  }
//  html += '    <th></th><th>' + LABEL_A + '</th><th>' + LABEL_B + '</th>';
  html += '  </tr></thead><tbody>';

  for (var r = 0; r < rows.length; r++) {
    html += '  <tr class="cj-row" data-row="' + r + '">';
    html += '    <th scope="row">' + rows[r].attribute + '</th>';
    for (var c = 0; c < rows[r].values.length; c ++ ) {
      html += '    <td class="cj-cell" data-col="' + c + '" data-row="' + r + '"><span class="placeholder">' + PLACEHOLDER + '</span></td>';  
    }
    // html += '    <td class="cj-cell" data-col="A" data-row="' + rows[r].row + '"><span class="placeholder">' + PLACEHOLDER + '</span></td>';
    // html += '    <td class="cj-cell" data-col="B" data-row="' + rows[r].row + '"><span class="placeholder">' + PLACEHOLDER + '</span></td>';
    html += '  </tr>';
  }
  html += '  </tbody></table>';
  html += '  <div class="cj-foot">';
  html += '    <div class="cj-count" id="cj-count">' + LEGEND_COUNT_LABEL + MAX_CLICKS + '</div>';
  html += '    <div class="cj-legend">' + LEGEND_ACTION_LABEL + '</div>';
  html += '    <div class="cj-cool" id="cj-cooldown" style="display:none">' + LEGEND_COOLDOWN_LABEL + '</div>';
  html += '  </div>';

  root.innerHTML = html;

  // Logging state
  var startTs = (new Date()).getTime();
  Qualtrics.SurveyEngine.setEmbeddedData(EMBEDDED_DATA_NAME_START_TIME, String(startTs));

  var clickCount = 0;
  var order = 0;
  var clickLog = [];          // {order, tMs, col, row, attribute, value}
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
    coolEl.textContent = LEGEND_COOLDOWN_EXTRA_LABEL.replace("{X}", (remain < 0 ? 0 : remain));
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
      var key = td.getAttribute("data-row") + "-" + td.getAttribute("data-col");
      if (!revealed[key]) { td.className += " locked"; }
    }
  }

  function revealCell(td) {
	  if (cooling) { return; }
    
    var colIdx = parseInt(td.getAttribute("data-col"), 10);
    var rowIdx = parseInt(td.getAttribute("data-row"), 10);
    var key = rowIdx + "-" + colIdx;
    console.log('revealCell: ' + key);

    if (revealed[key]) { return; }
    if (clickCount >= MAX_CLICKS) { return; }

    var rObj = rows[rowIdx];
    var value = rObj.values[colIdx];

    if (td.className.indexOf("revealed") === -1) {
      td.className += " revealed";
    }
    td.innerHTML = "<span>" + value + "</span>";

    Qualtrics.SurveyEngine.setEmbeddedData(EMBEDDED_DATA_CLICK_PREFIX + order, key);

    revealed[key] = true;
    clickCount += 1;
    order += 1;

    var tMs = (new Date()).getTime() - startTs;
    clickLog.push({
      order: order,
      clickedTime: tMs,
      clickedCol: colIdx,
      clickedRow: rowIdx,
      attribute: rObj.attribute,
      value: value,
      type: rObj.type,
      row: rObj.index,
      col: rObj.valueIndices[colIdx]

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
    Qualtrics.SurveyEngine.setEmbeddedData(EMBEDDED_DATA_NAME_ASSIGNMENTS, JSON.stringify(assignment));
    Qualtrics.SurveyEngine.setEmbeddedData(EMBEDDED_DATA_NAME_CLICK_LOG, JSON.stringify(clickLog));
    Qualtrics.SurveyEngine.setEmbeddedData(EMBEDDED_DATA_NAME_CLICK_COUNT, String(clickCount));
    Qualtrics.SurveyEngine.setEmbeddedData(EMBEDDED_DATA_NAME_FINISHED_TIME, String((new Date()).getTime()));
  }

  Qualtrics.SurveyEngine.addOnPageSubmit(function () { persist(); });
});
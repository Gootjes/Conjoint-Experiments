Qualtrics.SurveyEngine.addOnReady(function () {
  var q = this;

  /* ----------- SETTINGS ----------- */
  var SETTINGS = {};
  try {
    // TODO: Set the Question ID that contains your settings. Make sure the settings JSON is a single line (no line breaks)
    SETTINGS = JSON.parse('${q://QID3/QuestionText}');
  } catch (err) {
    // These are the default settings in case the piped question text failed
    SETTINGS = {
      // The number of attributes sampled from each attribute pool
      N_ROWS: {
        R: 3,
        H: 2,
        U: 3,
      },
      // If defined, will do staged randomisation and the first stage will be stored separately
      N_ROWS_FIRST_STAGE: {
        R: 4,
        H: 4,
        U: 4,
      },
      // The number of values to display per attribute. A value is sampled for every column from the pool.
      N_COLUMNS: 1,
      // The name to give the columns, amount should match N_COLUMNS
      COLUMN_LABELS: ["Attributes"],
      // The amount of reveals people can do, should be less or equal to the sum of N_ROWS
      MAX_CLICKS: 4,
      // What to display before a box is revealed
      PLACEHOLDER_LABEL: "Click to reveal",
      // What to display when the respondent runs out of clicks
      OUTOFCLICKS_LABEL: "Out of reveals!",
      // How many seconds to wait before another box can be revealed
      COOLDOWN_SECONDS: 5,
      // What to display to indicate how many reveals are left
      CLICKSLEFT_LABEL: "Reveals left: ",
      // What to display to signal respondent has to wait for the cooldown to end
      COOLDOWN_LABEL: "Please wait...",
      // Extra information to signal to the respondent
      COOLDOWN_EXTRA_LABEL: "Please wait {X} seconds before your next reveal.",
      // Namespace for embedded data, e.g. cj_started_at
      NAMESPACE: "cj",
      // Pool of attributes and corresponding values. Names of this object should match those in N_ROWS
      POOL: {
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
      },

    };
  };
  
  /* -------------------------------- */

  var NAMESPACE = SETTINGS.NAMESPACE || "cj";
  var N_ROWS = SETTINGS.N_ROWS;         // how many attributes to show
  var N_ROWS_FIRST_STAGE = SETTINGS.N_ROWS_FIRST_STAGE; // can be undefined
  var N_COLUMNS = SETTINGS.N_COLUMNS;
  var COLUMN_LABELS = SETTINGS.COLUMN_LABELS;
  var MAX_CLICKS = SETTINGS.MAX_CLICKS;     // total reveals allowed
  var PLACEHOLDER = SETTINGS.PLACEHOLDER_LABEL; // TODO: import this from a localized question
  var COOLDOWN_SEC = SETTINGS.COOLDOWN_SECONDS;   // ← set your X seconds here (0 disables cooldown)
  var OUTOFCLICKS_LABEL  = SETTINGS.OUTOFCLICKS_LABEL ;
  var CLICKSLEFT_LABEL = SETTINGS.CLICKSLEFT_LABEL;

  var LEGEND_COUNT_LABEL = SETTINGS.CLICKSLEFT_LABEL;
  var COOLDOWN_LABEL = SETTINGS.COOLDOWN_LABEL;
  var LEGEND_COOLDOWN_EXTRA_LABEL = SETTINGS.COOLDOWN_EXTRA_LABEL;

  // Edit these pools for your attributes & levels
  var ATTRIBUTE_POOL = SETTINGS.POOL;
  // Enhance the attribute pool with extra info
  Object.keys(ATTRIBUTE_POOL).forEach((k) => {
    var values = ATTRIBUTE_POOL[k];
    values.forEach((value, index) => {
      value.index = index;
      value.type = k;
      value.id = k + "_" + index;
    });
  })
  
  // Embedded data fields, in survey flow should be prefixed with __js_
  var EMBEDDED_DATA_NAME_START_TIME = NAMESPACE + "_started_at";
  var EMBEDDED_DATA_NAME_ASSIGNMENTS = NAMESPACE + "_assignments";
  var EMBEDDED_DATA_NAME_CLICK_LOG = NAMESPACE + "_click_log";
  var EMBEDDED_DATA_NAME_CLICK_COUNT = NAMESPACE + "_click_count";
  var EMBEDDED_DATA_NAME_FINISHED_TIME = NAMESPACE + "_finished_at";
  var EMBEDDED_DATA_CLICK_PREFIX = NAMESPACE + "_click_";
  var EMBEDDED_DATA_STATUS = NAMESPACE + "_status";
  var EMBEDDED_DATA_NAME_ASSIGNMENT_IDS = NAMESPACE + "_assignment_ids";
  var EMBEDDED_DATA_NAME_FIRST_STAGE_ASSIGNMENT_IDS = NAMESPACE + "_first_stage_assignment_ids";

  // This RNG function is stable across page refreshes. The seed is a concatenation of the ReponseId
  // (which is random but stable during the session) and the questionId.
  // On failure it falls back to using a random number.
  // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
  function initializeRNG() {

    function cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
    }

    // Warning if this fails the randomness is different per page refresh.
    var seedString = (Qualtrics.SurveyEngine.getJSEmbeddedData("seed") + "-" + q.questionId) || String(Math.random()); 
    console.log("seed", seedString);
    var seed = cyrb128(seedString);
    var a = seed[0], b = seed[1], c = seed[2], d = seed[3];
    
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }

  // Fallback
  var RNG = initializeRNG() || Math.random;

  function shuffle(arr) {
    var a = arr.slice(0), i, j, tmp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(RNG() * (i + 1));
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
    return arr[Math.floor(RNG() * arr.length)];
  }
  function sampleOneIndex(arr) {
    var indices = [];
    for (var i = 0; i < arr.length; i++ ) {
      indices.push(i);
    }
    return sampleOne(indices);
  }

  function populateTableData() {
    var chosen = [];
    var firstStageIDs = [];

    var types = Object.keys(ATTRIBUTE_POOL);
    
    for (var t = 0; t < types.length; t++) {
      var type = types[t];
      
      var ch = shuffle(ATTRIBUTE_POOL[type]);

      if (N_ROWS_FIRST_STAGE) {
        for (var i = 0; i < N_ROWS_FIRST_STAGE[type]; i++) {
          firstStageIDs.push(ch[i].id);
        }
      }

      for (var i = 0; i < N_ROWS[type]; i++) {
        chosen.push(ch[i]);
      }
    }

    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_FIRST_STAGE_ASSIGNMENT_IDS, JSON.stringify(firstStageIDs));

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
        id: chosen[i].id,
      });
    }

    return  rows;
  }

  // Build table HTML
  var root = document.getElementById("cj-container");
  if (!root) { 
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_STATUS, "could not find 'cj-container' HTML element");
    return;
  }

  var clickCount = 0;
  var order = 0;
  var clickLog = [];          // {order, tMs, col, row, attribute, value}
  var revealed = {};          // keys like "A-1": true
  var cooling = false;
  var cooldownTimer = null;
  var cooldownEndTs = 0;

  // Randomize attributes and candidate values
  var rows = populateTableData();
  globalThis.rows = rows;

  var html = '';
  html += '<table class="cj-table">';
  html += '  <thead class="cj-head"><tr>';
  html += '<th></th>';
  for (var cl = 0; cl < COLUMN_LABELS.length; cl ++) {
    var label = COLUMN_LABELS[cl];
    html += '<th>' + COLUMN_LABELS[cl] + '</th>'; 
  }
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
  html += '    <div id="cj-cooldown" style="display:table-cell;width:40px;height:40px;padding:2px;border:2px solid black;vertical-align:middle;text-align:center;border-radius:40px;">0</div>';
  html += '    <div id="cj-count" style="display: table-cell; vertical-align: middle; padding-left: 10px;">' + CLICKSLEFT_LABEL + MAX_CLICKS + "/" + MAX_CLICKS + '</div>';
  

  // html += '    <div class="cj-legend">' + LEGEND_ACTION_LABEL + '</div>';
  
  html += '  </div>';

  root.innerHTML = html;

  // Logging state
  var startTs = (new Date()).getTime();
  Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_START_TIME, String(startTs));
  // Early storage of rows in case people drop out on this page.
  Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_ASSIGNMENTS, JSON.stringify({rows: rows}));
  Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_ASSIGNMENT_IDS, JSON.stringify(
    rows.map((r) => r.type + "_" + r.index)
  ));
  Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_STATUS, "started");


  var countEl = document.getElementById("cj-count");
  var cells = root.querySelectorAll(".cj-cell");
  var coolEl = document.getElementById("cj-cooldown");
  
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
    coolEl.textContent = remain + "s";// LEGEND_COOLDOWN_EXTRA_LABEL.replace("{X}", (remain < 0 ? 0 : remain));
  }
  
  function startCooldown() {
    if (COOLDOWN_SEC <= 0) return;
    if (!coolEl) coolEl = document.getElementById("cj-cooldown");
  
    cooling = true;
    cooldownEndTs = (new Date()).getTime() + COOLDOWN_SEC * 1000;
    if (coolEl) { coolEl.style.display = "inline"; }
    setBlocked(true);
    updateCooldownText();
    for (var i2 = 0; i2 < cells.length; i2++) {
      var td = cells[i2];
      var key = td.getAttribute("data-row") + "-" + td.getAttribute("data-col");
      if (!revealed[key]) {
        td.textContent = COOLDOWN_LABEL;
      }
    }
  
    if (cooldownTimer) { clearInterval(cooldownTimer); }
    cooldownTimer = setInterval(function () {
      var nowTs = (new Date()).getTime();
      if (nowTs >= cooldownEndTs) {
        clearInterval(cooldownTimer);
        cooling = false;
        if (coolEl) { coolEl.textContent = '0'; }
        setBlocked(false);
        for (var i2 = 0; i2 < cells.length; i2++) {
          var td = cells[i2];
          var key = td.getAttribute("data-row") + "-" + td.getAttribute("data-col");
          if (!revealed[key]) {
            td.textContent = PLACEHOLDER;
          }
        }
  
      } else {
        updateCooldownText();
      }
    }, 100);
  }


  function updateCounter() {
    var left = MAX_CLICKS - clickCount;
    if (left < 0) { left = 0; }
    countEl.textContent = CLICKSLEFT_LABEL + left + "/" + MAX_CLICKS;
  }
  function lockUnrevealed() {
    if (clickCount < MAX_CLICKS) { return; }
    for (var i2 = 0; i2 < cells.length; i2++) {
      var td = cells[i2];
      var key = td.getAttribute("data-row") + "-" + td.getAttribute("data-col");
      if (!revealed[key]) {
        td.className += " locked";
        td.textContent = OUTOFCLICKS_LABEL;
      }
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

    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_CLICK_PREFIX + order, key);

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
    var assignment = { rows: rows };
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_ASSIGNMENTS, JSON.stringify(assignment));
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_ASSIGNMENT_IDS, JSON.stringify(
      rows.map((r) => r.type + "_" + r.index)
    ));
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_CLICK_LOG, JSON.stringify(clickLog));
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_CLICK_COUNT, String(clickCount));
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_NAME_FINISHED_TIME, String((new Date()).getTime()));
    Qualtrics.SurveyEngine.setJSEmbeddedData(EMBEDDED_DATA_STATUS, "finished");
  }

  Qualtrics.SurveyEngine.addOnPageSubmit(function () { persist(); });
});
/* ============================================================
   القسم الأدبي - يحيى التيغي
   ============================================================ */

(function(){

/* ===================== إعدادات مواد القسم الأدبي ===================== */
// اللغة العربية الأدبي:
//   الأعمال: 84
//   الامتحان مقسم:
//     النحو والصرف والإملاء:  39 سؤال, max درجة الامتحان = 76  (≈1.949 لكل سؤال؟)
//     المطالعة والنقد الأدبي: 48 سؤال, max درجة الامتحان = 46
//     الأدب والنصوص:          50 سؤال, max درجة الامتحان = 50
//     الإنشاء:                 مباشر,  max = 24
//   مجموع الامتحان = 76+46+50+24 = 196
//   الإجمالي = 84+196 = 280

const LITERARY_SUBJECTS = [
  {
    id: 'lit_islamic', name: 'التربية الإسلامية', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'lit_arabic', name: 'اللغة العربية', type: 'arabic_lit',
    aamalMax: 84, examMax: 196,
    sub: [
      { key:'grammar',  name:'النحو والصرف والإملاء',    questions:39, examMax:76,  useQuestions:true  },
      { key:'reading',  name:'المطالعة والنقد الأدبي',   questions:48, examMax:46,  useQuestions:true  },
      { key:'adab',     name:'الأدب والنصوص',             questions:50, examMax:50,  useQuestions:true  },
      { key:'inshaa',   name:'الإنشاء',                   direct:true,  examMax:24                      }
    ]
  },
  {
    id: 'lit_english', name: 'اللغة الإنجليزية', type: 'simple',
    aamalMax: 60, questions: 56, point: 2.5, examMax: 140
  },
  {
    id: 'lit_it', name: 'تقنية المعلومات', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'lit_stats', name: 'الإحصاء', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'lit_history', name: 'التاريخ', type: 'simple',
    aamalMax: 36, questions: 56, point: 1.5, examMax: 84
  },
  {
    id: 'lit_geo', name: 'الجغرافيا', type: 'simple',
    aamalMax: 36, questions: 56, point: 1.5, examMax: 84
  },
  {
    id: 'lit_philo', name: 'الفلسفة', type: 'simple',
    aamalMax: 36, questions: 56, point: 1.5, examMax: 84
  },
  {
    id: 'lit_socio', name: 'علم الاجتماع', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'lit_psych', name: 'علم النفس', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  }
];

// المجموع الكلي = 80+280+200+80+80+120+120+120+80+80 = 1240
const LIT_GRAND_MAX = LITERARY_SUBJECTS.reduce((s, sub) => s + sub.aamalMax + sub.examMax, 0);

/* ===================== أدوات مساعدة ===================== */

function clamp(val, min, max){
  if (isNaN(val) || val === '') return min;
  return Math.min(Math.max(val, min), max);
}

function fmt(n){
  return (Math.round(n * 100) / 100).toString();
}

function getGrade(percent){
  if (percent >= 85) return 'ممتاز';
  if (percent >= 75) return 'جيد جدًا';
  if (percent >= 65) return 'جيد';
  if (percent >= 50) return 'مقبول';
  return 'راسب';
}

/* ===================== التخزين ===================== */

const LIT_STORAGE_KEY = 'thanaweya_literary_v1';

function loadLitData(){
  try{
    const raw = localStorage.getItem(LIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { studentName: '', fields: {} };
  }catch(e){
    return { studentName: '', fields: {} };
  }
}

function saveLitData(){
  try{ localStorage.setItem(LIT_STORAGE_KEY, JSON.stringify(litState)); }catch(e){}
}

let litState = loadLitData();

/* ===================== بناء واجهة المواد ===================== */

const litContainer = document.getElementById('litSubjectsContainer');

function litFieldValue(key, def){
  const v = litState.fields[key];
  return (v === undefined || v === null || v === '') ? def : v;
}

function buildLitSimpleCard(subject){
  const aamalKey = `${subject.id}_aamal`;
  const correctKey = `${subject.id}_correct`;
  const minPass = subject.aamalMax + subject.examMax;
  const halfTotal = fmt(minPass / 2);
  const halfExam = fmt(subject.examMax / 2);

  return `
  <div class="subject-card" data-lit-subject="${subject.id}">
    <div class="subject-head subject-head-lit">
      <div class="subject-name">${subject.name}</div>
      <div class="subject-fixed">
        <span class="fixed-chip">الدرجة النهائية: ${subject.aamalMax} + ${subject.examMax} = ${minPass}</span>
        <span class="fixed-chip">الحد الأدنى للنجاح: ${halfTotal} (والامتحان ${halfExam}+)</span>
      </div>
    </div>
    <div class="subject-body">
      <div class="inputs-row">
        <div class="field-group">
          <label>درجة الأعمال (من ${subject.aamalMax})</label>
          <input type="number" inputmode="numeric" step="1" min="0" max="${subject.aamalMax}"
                 data-lit-subject="${subject.id}" data-field="aamal" data-max="${subject.aamalMax}"
                 value="${litFieldValue(aamalKey, '')}">
        </div>
        <div class="field-group">
          <label>عدد الإجابات الصحيحة (من ${subject.questions} سؤال)</label>
          <input type="number" inputmode="numeric" step="1" min="0" max="${subject.questions}"
                 data-lit-subject="${subject.id}" data-field="correct" data-max="${subject.questions}"
                 value="${litFieldValue(correctKey, '')}">
        </div>
        <div class="field-group">
          <label>درجة الامتحان (محسوبة)</label>
          <input type="text" readonly id="${subject.id}_examScore" value="0">
        </div>
      </div>
      ${litResultsRowHTML(subject)}
    </div>
  </div>`;
}

function buildLitArabicCard(subject){
  const aamalKey = `${subject.id}_aamal`;
  const minPass = subject.aamalMax + subject.examMax;
  const halfTotal = fmt(minPass / 2);
  const halfExam = fmt(subject.examMax / 2);

  let subRows = '';
  subject.sub.forEach(s => {
    if (s.direct){
      const key = `${subject.id}_${s.key}_score`;
      subRows += `
      <div class="sub-field-row">
        <label>${s.name} — درجة مباشرة (من ${s.examMax})</label>
        <input type="number" inputmode="numeric" step="1" min="0" max="${s.examMax}"
               data-lit-subject="${subject.id}" data-field="${s.key}_score" data-max="${s.examMax}"
               value="${litFieldValue(key, '')}">
        <span class="computed-val"></span>
      </div>`;
    } else {
      const key = `${subject.id}_${s.key}_correct`;
      subRows += `
      <div class="sub-field-row">
        <label>${s.name} — إجابات صحيحة (من ${s.questions} / الدرجة من ${s.examMax})</label>
        <input type="number" inputmode="numeric" step="1" min="0" max="${s.questions}"
               data-lit-subject="${subject.id}" data-field="${s.key}_correct" data-max="${s.questions}"
               value="${litFieldValue(key, '')}">
        <span class="computed-val" id="${subject.id}_${s.key}_val">0 من ${s.examMax}</span>
      </div>`;
    }
  });

  return `
  <div class="subject-card" data-lit-subject="${subject.id}">
    <div class="subject-head subject-head-lit">
      <div class="subject-name">${subject.name}</div>
      <div class="subject-fixed">
        <span class="fixed-chip">الدرجة النهائية: ${subject.aamalMax} + ${subject.examMax} = ${minPass}</span>
        <span class="fixed-chip">الحد الأدنى للنجاح: ${halfTotal} (والامتحان ${halfExam}+)</span>
      </div>
    </div>
    <div class="subject-body">
      <div class="inputs-row">
        <div class="field-group">
          <label>درجة الأعمال (من ${subject.aamalMax})</label>
          <input type="number" inputmode="numeric" step="1" min="0" max="${subject.aamalMax}"
                 data-lit-subject="${subject.id}" data-field="aamal" data-max="${subject.aamalMax}"
                 value="${litFieldValue(aamalKey, '')}">
        </div>
        <div class="field-group">
          <label>إجمالي درجة الامتحان (محسوبة تلقائيًا، من ${subject.examMax})</label>
          <input type="text" readonly id="${subject.id}_examScore" value="0">
        </div>
      </div>
      <div class="sub-fields">
        <div class="sub-fields-title">تفاصيل أقسام الامتحان (تُجمع تلقائيًا)</div>
        ${subRows}
      </div>
      ${litResultsRowHTML(subject)}
    </div>
  </div>`;
}

function litResultsRowHTML(subject){
  return `
      <div class="results-row">
        <div class="result-box" id="${subject.id}_total_box">
          <span class="result-label">المجموع</span>
          <span class="result-value" id="${subject.id}_total_val">0 / ${subject.aamalMax + subject.examMax}</span>
        </div>
        <div class="result-box" id="${subject.id}_percent_box">
          <span class="result-label">النسبة</span>
          <span class="result-value" id="${subject.id}_percent_val">0%</span>
        </div>
        <div class="result-box" id="${subject.id}_grade_box">
          <span class="result-label">التقدير</span>
          <span class="result-value" id="${subject.id}_grade_val">—</span>
        </div>
        <div class="result-box" id="${subject.id}_result_box">
          <span class="result-label">النتيجة</span>
          <span class="result-value" id="${subject.id}_result_val">—</span>
        </div>
      </div>`;
}

function renderLitAllCards(){
  if (!litContainer) return;
  let html = '';
  LITERARY_SUBJECTS.forEach(subject => {
    if (subject.type === 'arabic_lit') html += buildLitArabicCard(subject);
    else html += buildLitSimpleCard(subject);
  });
  litContainer.innerHTML = html;
  addLitSteppers();
}

function addLitSteppers(){
  if (!litContainer) return;
  litContainer.querySelectorAll('input[data-lit-subject][data-field]').forEach(input => {
    if (input.readOnly) return;
    if (input.parentElement.classList.contains('stepper')) return;

    const small = !!input.closest('.sub-field-row');
    const wrap = document.createElement('div');
    wrap.className = small ? 'stepper stepper-sm' : 'stepper';

    const minus = document.createElement('button');
    minus.type = 'button'; minus.className = 'step-btn step-minus';
    minus.textContent = '−'; minus.setAttribute('aria-label', 'تقليل');

    const plus = document.createElement('button');
    plus.type = 'button'; plus.className = 'step-btn step-plus';
    plus.textContent = '+'; plus.setAttribute('aria-label', 'زيادة');

    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(minus); wrap.appendChild(input); wrap.appendChild(plus);

    const step = parseFloat(input.step) || 1;

    function change(delta){
      let v = parseFloat(input.value); if (isNaN(v)) v = 0;
      v += delta;
      const max = parseFloat(input.dataset.max);
      v = clamp(v, 0, max);
      input.value = (v % 1 === 0) ? v : fmt(v);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    minus.addEventListener('click', () => change(-step));
    plus.addEventListener('click', () => change(step));
  });
}

/* ===================== الحساب ===================== */

function getLitNum(subjectId, field){
  if (!litContainer) return 0;
  const input = litContainer.querySelector(`input[data-lit-subject="${subjectId}"][data-field="${field}"]`);
  if (!input) return 0;
  const v = parseFloat(input.value);
  return isNaN(v) ? 0 : v;
}

function computeLitSubject(subject){
  let aamal = 0, examScore = 0;

  if (subject.type === 'simple'){
    aamal = getLitNum(subject.id, 'aamal');
    const correct = getLitNum(subject.id, 'correct');
    // نسبة عدد الإجابات من الأسئلة × درجة الامتحان الكاملة
    examScore = (correct / subject.questions) * subject.examMax;
    examScore = Math.ceil(clamp(examScore, 0, subject.examMax));
    const el = document.getElementById(`${subject.id}_examScore`);
    if (el) el.value = fmt(examScore);
  }
  else if (subject.type === 'arabic_lit'){
    aamal = getLitNum(subject.id, 'aamal');
    subject.sub.forEach(s => {
      let score;
      if (s.direct){
        score = clamp(getLitNum(subject.id, `${s.key}_score`), 0, s.examMax);
      } else {
        // عدد الإجابات الصحيحة × (درجة الامتحان / عدد الأسئلة)
        const correct = getLitNum(subject.id, `${s.key}_correct`);
        score = Math.ceil(clamp((correct / s.questions) * s.examMax, 0, s.examMax));
        const valEl = document.getElementById(`${subject.id}_${s.key}_val`);
        if (valEl) valEl.textContent = `${fmt(score)} من ${s.examMax}`;
      }
      examScore += score;
    });
    examScore = clamp(examScore, 0, subject.examMax);
    const el = document.getElementById(`${subject.id}_examScore`);
    if (el) el.value = fmt(examScore);
  }

  const aamalMax = subject.aamalMax;
  const examMax = subject.examMax;
  const totalMax = aamalMax + examMax;
  const total = aamal + examScore;
  const percent = (total / totalMax) * 100;

  const passExam = examScore >= (examMax / 2);
  const passTotal = total >= (totalMax / 2);
  const passed = passExam && passTotal;

  return {
    subject, aamal, examScore, total, totalMax, percent,
    passExam, passTotal, passed,
    grade: getGrade(percent),
    result: passed ? 'ناجح' : 'له دور ثان'
  };
}

function updateLitSubjectDisplay(res){
  const { subject } = res;
  const els = {
    total:   document.getElementById(`${subject.id}_total_val`),
    percent: document.getElementById(`${subject.id}_percent_val`),
    grade:   document.getElementById(`${subject.id}_grade_val`),
    result:  document.getElementById(`${subject.id}_result_val`),
    resBox:  document.getElementById(`${subject.id}_result_box`),
    perBox:  document.getElementById(`${subject.id}_percent_box`),
    totBox:  document.getElementById(`${subject.id}_total_box`)
  };

  if (els.total)   els.total.textContent   = `${fmt(res.total)} / ${res.totalMax}`;
  if (els.percent) els.percent.textContent = `${fmt(res.percent)}%`;
  if (els.grade)   els.grade.textContent   = res.grade;
  if (els.result)  els.result.textContent  = res.result;

  [els.resBox, els.perBox, els.totBox].forEach(box => {
    if (!box) return;
    if (res.passed){ box.classList.add('pass'); box.classList.remove('fail'); }
    else            { box.classList.add('fail'); box.classList.remove('pass'); }
  });
}

let litLastResults = [];

function litRecalcAll(){
  litLastResults = LITERARY_SUBJECTS.map(subject => {
    const res = computeLitSubject(subject);
    updateLitSubjectDisplay(res);
    return res;
  });
  updateLitSummary();
}

function updateLitSummary(){
  const grandTotal   = litLastResults.reduce((s, r) => s + r.total, 0);
  const grandPercent = (grandTotal / LIT_GRAND_MAX) * 100;
  const grandGrade   = getGrade(grandPercent);
  const failed       = litLastResults.filter(r => !r.passed);
  const overallPass  = failed.length === 0;

  const summaryCard = document.getElementById('litSummaryCard');
  if (!summaryCard) return;
  summaryCard.innerHTML = `
    <div class="summary-title">النتيجة النهائية - القسم الأدبي</div>
    <div class="summary-grid">
      <div class="summary-box">
        <span class="s-label">المجموع الكلي</span>
        <span class="s-value">${fmt(grandTotal)} / ${LIT_GRAND_MAX}</span>
      </div>
      <div class="summary-box">
        <span class="s-label">النسبة العامة</span>
        <span class="s-value">${fmt(grandPercent)}%</span>
      </div>
      <div class="summary-box">
        <span class="s-label">التقدير العام</span>
        <span class="s-value">${grandGrade}</span>
      </div>
      <div class="summary-box result">
        <span class="s-label">النتيجة</span>
        <span class="s-value ${overallPass ? 'pass' : 'fail'}">${overallPass ? 'ناجح' : 'له دور ثان'}</span>
      </div>
    </div>
    <div class="retake-note">
      ${failed.length > 0
        ? `<strong>عدد المواد التي لها دور ثان: ${failed.length}</strong> — (${failed.map(r => r.subject.name).join('، ')})`
        : 'لا توجد مواد بدور ثان، تهانينا!'}
    </div>
  `;
}

/* ===================== الإدخال والحفظ ===================== */

if (litContainer){
  litContainer.addEventListener('input', (e) => {
    const el = e.target;
    if (el.tagName !== 'INPUT' || el.readOnly) return;
    const subjectId = el.dataset.litSubject;
    const field     = el.dataset.field;
    if (!subjectId || !field) return;
    const max = parseFloat(el.dataset.max);
    let val = el.value;
    if (val !== ''){
      let num = parseFloat(val);
      if (isNaN(num)) num = 0;
      num = clamp(num, 0, max);
      if (num < 0 || num > max){ el.value = clamp(num, 0, max); }
      val = num;
    }
    litState.fields[`${subjectId}_${field}`] = val;
    saveLitData();
    litRecalcAll();
  });

  litContainer.addEventListener('blur', (e) => {
    const el = e.target;
    if (el.tagName !== 'INPUT' || el.readOnly) return;
    const max = parseFloat(el.dataset.max);
    let num = parseFloat(el.value);
    if (el.value === '' || isNaN(num)) return;
    num = clamp(num, 0, max);
    el.value = num;
    litState.fields[`${el.dataset.litSubject}_${el.dataset.field}`] = num;
    saveLitData();
    litRecalcAll();
  }, true);
}

/* ===================== اسم الطالب ===================== */

const litStudentNameInput = document.getElementById('litStudentName');
if (litStudentNameInput){
  litStudentNameInput.value = litState.studentName || '';
  litStudentNameInput.addEventListener('input', () => {
    litState.studentName = litStudentNameInput.value;
    saveLitData();
  });
}

/* ===================== مسح البيانات ===================== */

const litClearBtn = document.getElementById('litClearBtn');
if (litClearBtn){
  litClearBtn.addEventListener('click', () => {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات المدخلة؟ لا يمكن التراجع.')) return;
    localStorage.removeItem(LIT_STORAGE_KEY);
    litState = { studentName: '', fields: {} };
    if (litStudentNameInput) litStudentNameInput.value = '';
    renderLitAllCards();
    litRecalcAll();
  });
}

/* ===================== تصدير صورة بجودة 4K ===================== */

const litPrintBtn = document.getElementById('litPrintBtn');
if (litPrintBtn){
  litPrintBtn.addEventListener('click', async () => {
    litPrintBtn.disabled = true;
    const originalText = litPrintBtn.textContent;
    litPrintBtn.textContent = '⏳ جاري التحضير بجودة عالية...';

    try{
      populateLitPrintSheet();
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 400));

      const sheet = document.getElementById('litPrintSheet');

      // scale=4 يعطي دقة 4320×5400 px (فوق 4K)
      const canvas = await html2canvas(sheet, {
        width: 1080,
        height: 1350,
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000
      });

      const link = document.createElement('a');
      const name = (litState.studentName || 'الطالب').trim().replace(/\s+/g, '_');
      link.download = `نتيجة_${name}_القسم_الأدبي_HD.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err){
      alert('حدث خطأ أثناء إنشاء الصورة، حاول مرة أخرى.');
      console.error(err);
    } finally{
      litPrintBtn.disabled = false;
      litPrintBtn.textContent = originalText;
    }
  });
}

/* ===================== تعبئة ورقة الطباعة ===================== */

function populateLitPrintSheet(){
  const nameEl = document.getElementById('litPsStudentName');
  if (nameEl) nameEl.textContent = litState.studentName && litState.studentName.trim()
    ? litState.studentName.trim() : 'بدون اسم';

  const tbody = document.getElementById('litPsTableBody');
  if (tbody){
    tbody.innerHTML = litLastResults.map(r => `
      <tr>
        <td class="subj-name">${r.subject.name}</td>
        <td>${fmt(r.aamal)}</td>
        <td>${fmt(r.examScore)}</td>
        <td>${fmt(r.total)} / ${r.totalMax}</td>
        <td>${fmt(r.percent)}%</td>
        <td>${r.grade}</td>
        <td class="${r.passed ? 'pass' : 'fail'}">${r.result}</td>
      </tr>
    `).join('');
  }

  const grandTotal   = litLastResults.reduce((s, r) => s + r.total, 0);
  const grandPercent = (grandTotal / LIT_GRAND_MAX) * 100;
  const grandGrade   = getGrade(grandPercent);
  const failed       = litLastResults.filter(r => !r.passed);
  const overallPass  = failed.length === 0;

  const totalEl   = document.getElementById('litPsTotal');
  const percentEl = document.getElementById('litPsPercent');
  const gradeEl   = document.getElementById('litPsGrade');
  const resultEl  = document.getElementById('litPsResult');
  const retakeEl  = document.getElementById('litPsRetakeNote');

  if (totalEl)   totalEl.textContent   = `${fmt(grandTotal)} / ${LIT_GRAND_MAX}`;
  if (percentEl) percentEl.textContent = `${fmt(grandPercent)}%`;
  if (gradeEl)   gradeEl.textContent   = grandGrade;
  if (resultEl){
    resultEl.textContent = overallPass ? 'ناجح' : 'له دور ثان';
    const box = resultEl.closest('.ps-summary-box');
    if (box){ box.classList.toggle('pass', overallPass); box.classList.toggle('fail', !overallPass); }
  }
  if (retakeEl){
    retakeEl.textContent = failed.length > 0
      ? `عدد المواد التي لها دور ثان: ${failed.length} (${failed.map(r => r.subject.name).join('، ')})`
      : '';
  }

  const now = new Date();
  const dateEl = document.getElementById('litPsDate');
  const timeEl = document.getElementById('litPsTime');
  if (dateEl) dateEl.textContent = 'التاريخ: ' + now.toLocaleDateString('ar-LY');
  if (timeEl) timeEl.textContent = 'الوقت: '   + now.toLocaleTimeString('ar-LY');

  const code = 'LIT' + now.getTime().toString().slice(-8);
  try{
    JsBarcode('#litPsBarcode', code, {
      format: 'CODE128', lineColor: '#3d1f00',
      width: 2, height: 50, displayValue: true,
      fontSize: 14, margin: 4, background: '#ffffff'
    });
  }catch(e){}
}

/* ===================== التشغيل الأولي ===================== */

renderLitAllCards();
litRecalcAll();

})();

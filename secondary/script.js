/* ============================================================
   موقع حساب النسبة النهائية لطلبة الشهادة الثانوية - يحيى التيغي
   منطق القسم العلمي
   ============================================================ */

(function(){

/* ===================== إعدادات مواد القسم العلمي ===================== */

const SUBJECTS = [
  {
    id: 'islamic', name: 'التربية الإسلامية', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'arabic', name: 'اللغة العربية', type: 'arabic',
    aamalMax: 48, examMax: 112,
    sub: [
      { key:'text',    name:'النصوص الأدبية والبلاغة', questions:44, point:1, max:44 },
      { key:'grammar', name:'النحو والصرف والإملاء',   questions:44, point:1, max:44 },
      { key:'expr',    name:'التعبير',                  direct:true, max:24 }
    ]
  },
  {
    id: 'english', name: 'اللغة الإنجليزية', type: 'simple',
    aamalMax: 48, questions: 56, point: 2, examMax: 112
  },
  {
    id: 'it', name: 'تقنية المعلومات', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'math', name: 'الرياضيات', type: 'simple',
    aamalMax: 60, questions: 56, point: 2.5, examMax: 140
  },
  {
    id: 'stats', name: 'الإحصاء', type: 'simple',
    aamalMax: 24, questions: 56, point: 1, examMax: 56
  },
  {
    id: 'physics', name: 'الفيزياء', type: 'physics',
    aamalMax: 60, examMax: 140,
    sub: [
      { key:'elec', name:'الكهربائية', aamalMax:36, questions:56, point:1.5, examMax:84 },
      { key:'mech', name:'الميكانيكا', aamalMax:24, questions:56, point:1,   examMax:56 }
    ]
  },
  {
    id: 'chem', name: 'الكيمياء', type: 'simple',
    aamalMax: 48, questions: 56, point: 2, examMax: 112
  },
  {
    id: 'bio', name: 'الأحياء', type: 'simple',
    aamalMax: 48, questions: 56, point: 2, examMax: 112
  }
];

const GRAND_MAX = SUBJECTS.reduce((s, sub) => s + sub.aamalMax + sub.examMax, 0); // 1280

/* ===================== أدوات مساعدة ===================== */

function clamp(val, min, max){
  if (isNaN(val) || val === '') return min;
  return Math.min(Math.max(val, min), max);
}

function fmt(n){
  // إزالة الكسور غير الضرورية
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

const STORAGE_KEY = 'thanaweya_scientific_v1';
const THEME_KEY = 'thanaweya_theme';

function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { studentName: '', fields: {} };
  }catch(e){
    return { studentName: '', fields: {} };
  }
}

function saveData(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){ /* تجاهل */ }
}

let state = loadData();

/* ===================== بناء واجهة المواد ===================== */

const container = document.getElementById('subjectsContainer');

function fieldValue(key, def){
  const v = state.fields[key];
  return (v === undefined || v === null || v === '') ? def : v;
}

function buildSimpleCard(subject){
  const aamalKey = `${subject.id}_aamal`;
  const correctKey = `${subject.id}_correct`;
  const minPass = subject.aamalMax + subject.examMax;
  const halfTotal = fmt(minPass / 2);
  const halfExam = fmt(subject.examMax / 2);

  return `
  <div class="subject-card" data-subject="${subject.id}">
    <div class="subject-head">
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
                 data-subject="${subject.id}" data-field="aamal" data-max="${subject.aamalMax}"
                 value="${fieldValue(aamalKey, '')}">
        </div>
        <div class="field-group">
          <label>عدد الإجابات الصحيحة (من ${subject.questions} سؤال)</label>
          <input type="number" inputmode="numeric" step="1" min="0" max="${subject.questions}"
                 data-subject="${subject.id}" data-field="correct" data-max="${subject.questions}"
                 value="${fieldValue(correctKey, '')}">
        </div>
        <div class="field-group">
          <label>درجة الامتحان (محسوبة)</label>
          <input type="text" readonly id="${subject.id}_examScore" value="0">
        </div>
      </div>
      ${resultsRowHTML(subject)}
    </div>
  </div>`;
}

function buildArabicCard(subject){
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
        <label>${s.name} (من ${s.max} درجة)</label>
        <input type="number" inputmode="decimal" step="0.5" min="0" max="${s.max}"
               data-subject="${subject.id}" data-field="${s.key}_score" data-max="${s.max}"
               value="${fieldValue(key, '')}">
        <span class="computed-val"></span>
      </div>`;
    } else {
      const key = `${subject.id}_${s.key}_correct`;
      subRows += `
      <div class="sub-field-row">
        <label>${s.name} - عدد الإجابات الصحيحة (من ${s.questions} سؤال)</label>
        <input type="number" inputmode="numeric" step="1" min="0" max="${s.questions}"
               data-subject="${subject.id}" data-field="${s.key}_correct" data-max="${s.questions}"
               value="${fieldValue(key, '')}">
        <span class="computed-val" id="${subject.id}_${s.key}_val">0 من ${s.max}</span>
      </div>`;
    }
  });

  return `
  <div class="subject-card" data-subject="${subject.id}">
    <div class="subject-head">
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
                 data-subject="${subject.id}" data-field="aamal" data-max="${subject.aamalMax}"
                 value="${fieldValue(aamalKey, '')}">
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
      ${resultsRowHTML(subject)}
    </div>
  </div>`;
}

function buildPhysicsCard(subject){
  const minPass = subject.aamalMax + subject.examMax;
  const halfTotal = fmt(minPass / 2);
  const halfExam = fmt(subject.examMax / 2);

  let subRows = '';
  subject.sub.forEach(s => {
    const aamalKey = `${subject.id}_${s.key}_aamal`;
    const correctKey = `${subject.id}_${s.key}_correct`;
    subRows += `
    <div class="sub-field-row">
      <label>${s.name} - الأعمال (من ${s.aamalMax})</label>
      <input type="number" inputmode="numeric" step="1" min="0" max="${s.aamalMax}"
             data-subject="${subject.id}" data-field="${s.key}_aamal" data-max="${s.aamalMax}"
             value="${fieldValue(aamalKey, '')}">
      <span class="computed-val"></span>
    </div>
    <div class="sub-field-row">
      <label>${s.name} - عدد الإجابات الصحيحة (من ${s.questions} سؤال)</label>
      <input type="number" inputmode="numeric" step="1" min="0" max="${s.questions}"
             data-subject="${subject.id}" data-field="${s.key}_correct" data-max="${s.questions}"
             value="${fieldValue(correctKey, '')}">
      <span class="computed-val" id="${subject.id}_${s.key}_val">0 من ${s.examMax}</span>
    </div>`;
  });

  return `
  <div class="subject-card" data-subject="${subject.id}">
    <div class="subject-head">
      <div class="subject-name">${subject.name}</div>
      <div class="subject-fixed">
        <span class="fixed-chip">الدرجة النهائية: ${subject.aamalMax} + ${subject.examMax} = ${minPass}</span>
        <span class="fixed-chip">الحد الأدنى للنجاح: ${halfTotal} (والامتحان ${halfExam}+)</span>
      </div>
    </div>
    <div class="subject-body">
      <div class="sub-fields">
        <div class="sub-fields-title">أعمال وامتحان قسمَي الفيزياء (تُجمع تلقائيًا)</div>
        ${subRows}
      </div>
      <div class="inputs-row">
        <div class="field-group">
          <label>إجمالي الأعمال (محسوب تلقائيًا، من ${subject.aamalMax})</label>
          <input type="text" readonly id="${subject.id}_aamalTotal" value="0">
        </div>
        <div class="field-group">
          <label>إجمالي درجة الامتحان (محسوبة تلقائيًا، من ${subject.examMax})</label>
          <input type="text" readonly id="${subject.id}_examScore" value="0">
        </div>
      </div>
      ${resultsRowHTML(subject)}
    </div>
  </div>`;
}

function resultsRowHTML(subject){
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

function renderAllCards(){
  let html = '';
  SUBJECTS.forEach(subject => {
    if (subject.type === 'simple') html += buildSimpleCard(subject);
    else if (subject.type === 'arabic') html += buildArabicCard(subject);
    else if (subject.type === 'physics') html += buildPhysicsCard(subject);
  });
  container.innerHTML = html;
  addSteppers();
}

function addSteppers(){
  container.querySelectorAll('input[data-subject][data-field]').forEach(input => {
    if (input.readOnly) return;
    if (input.parentElement.classList.contains('stepper')) return;

    const small = !!input.closest('.sub-field-row');
    const wrap = document.createElement('div');
    wrap.className = small ? 'stepper stepper-sm' : 'stepper';

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'step-btn step-minus';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'تقليل');

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'step-btn step-plus';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'زيادة');

    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(minus);
    wrap.appendChild(input);
    wrap.appendChild(plus);

    const step = parseFloat(input.step) || 1;

    function change(delta){
      let v = parseFloat(input.value);
      if (isNaN(v)) v = 0;
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

/* ===================== الحساب والتحديث ===================== */

function getNum(subjectId, field){
  const input = container.querySelector(`input[data-subject="${subjectId}"][data-field="${field}"]`);
  if (!input) return 0;
  const v = parseFloat(input.value);
  return isNaN(v) ? 0 : v;
}

function computeSubject(subject){
  let aamal = 0, examScore = 0;

  if (subject.type === 'simple'){
    aamal = getNum(subject.id, 'aamal');
    const correct = getNum(subject.id, 'correct');
    examScore = Math.ceil(correct * subject.point);
    examScore = clamp(examScore, 0, subject.examMax);
    document.getElementById(`${subject.id}_examScore`).value = fmt(examScore);
  }
  else if (subject.type === 'arabic'){
    aamal = getNum(subject.id, 'aamal');
    subject.sub.forEach(s => {
      let score;
      if (s.direct){
        score = clamp(getNum(subject.id, `${s.key}_score`), 0, s.max);
      } else {
        const correct = getNum(subject.id, `${s.key}_correct`);
        score = clamp(Math.ceil(correct * s.point), 0, s.max);
        const valEl = document.getElementById(`${subject.id}_${s.key}_val`);
        if (valEl) valEl.textContent = `${fmt(score)} من ${s.max}`;
      }
      examScore += score;
    });
    examScore = clamp(examScore, 0, subject.examMax);
    document.getElementById(`${subject.id}_examScore`).value = fmt(examScore);
  }
  else if (subject.type === 'physics'){
    let aamalTotal = 0, examTotal = 0;
    subject.sub.forEach(s => {
      const subAamal = clamp(getNum(subject.id, `${s.key}_aamal`), 0, s.aamalMax);
      const correct = getNum(subject.id, `${s.key}_correct`);
      const subExam = clamp(Math.ceil(correct * s.point), 0, s.examMax);
      aamalTotal += subAamal;
      examTotal += subExam;
      const valEl = document.getElementById(`${subject.id}_${s.key}_val`);
      if (valEl) valEl.textContent = `امتحان: ${fmt(subExam)} من ${s.examMax}`;
    });
    aamal = clamp(aamalTotal, 0, subject.aamalMax);
    examScore = clamp(examTotal, 0, subject.examMax);
    document.getElementById(`${subject.id}_aamalTotal`).value = fmt(aamal);
    document.getElementById(`${subject.id}_examScore`).value = fmt(examScore);
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

function updateSubjectDisplay(res){
  const { subject } = res;
  document.getElementById(`${subject.id}_total_val`).textContent = `${fmt(res.total)} / ${res.totalMax}`;
  document.getElementById(`${subject.id}_percent_val`).textContent = `${fmt(res.percent)}%`;
  document.getElementById(`${subject.id}_grade_val`).textContent = res.grade;

  const resultVal = document.getElementById(`${subject.id}_result_val`);
  const resultBox = document.getElementById(`${subject.id}_result_box`);
  const percentBox = document.getElementById(`${subject.id}_percent_box`);
  const totalBox = document.getElementById(`${subject.id}_total_box`);

  resultVal.textContent = res.result;
  if (res.passed){
    resultBox.classList.add('pass'); resultBox.classList.remove('fail');
    percentBox.classList.add('pass'); percentBox.classList.remove('fail');
    totalBox.classList.add('pass'); totalBox.classList.remove('fail');
  } else {
    resultBox.classList.add('fail'); resultBox.classList.remove('pass');
    percentBox.classList.add('fail'); percentBox.classList.remove('pass');
    totalBox.classList.add('fail'); totalBox.classList.remove('pass');
  }
}

let lastResults = [];

function recalcAll(){
  lastResults = SUBJECTS.map(subject => {
    const res = computeSubject(subject);
    updateSubjectDisplay(res);
    return res;
  });
  updateSummary();
}

function updateSummary(){
  const grandTotal = lastResults.reduce((s, r) => s + r.total, 0);
  const grandPercent = (grandTotal / GRAND_MAX) * 100;
  const grandGrade = getGrade(grandPercent);
  const failed = lastResults.filter(r => !r.passed);
  const overallPass = failed.length === 0;

  const summaryCard = document.getElementById('summaryCard');
  summaryCard.innerHTML = `
    <div class="summary-title">النتيجة النهائية - القسم العلمي</div>
    <div class="summary-grid">
      <div class="summary-box">
        <span class="s-label">المجموع الكلي</span>
        <span class="s-value">${fmt(grandTotal)} / ${GRAND_MAX}</span>
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

container.addEventListener('input', (e) => {
  const el = e.target;
  if (el.tagName !== 'INPUT' || el.readOnly) return;

  const subjectId = el.dataset.subject;
  const field = el.dataset.field;
  if (!subjectId || !field) return;

  const max = parseFloat(el.dataset.max);
  let val = el.value;

  if (val !== ''){
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    num = clamp(num, 0, max);
    if (num.toString() !== val){
      // لا نفرض القيمة وسط الكتابة (مثل علامة سالبة) لكن نضبطها إن خرجت عن النطاق
    }
    val = num;
    if (num < 0 || num > max){ el.value = clamp(num, 0, max); val = el.value; }
  }

  state.fields[`${subjectId}_${field}`] = val;
  saveData();
  recalcAll();
});

container.addEventListener('blur', (e) => {
  const el = e.target;
  if (el.tagName !== 'INPUT' || el.readOnly) return;
  const max = parseFloat(el.dataset.max);
  let num = parseFloat(el.value);
  if (el.value === '' || isNaN(num)) { return; }
  num = clamp(num, 0, max);
  el.value = num;
  state.fields[`${el.dataset.subject}_${el.dataset.field}`] = num;
  saveData();
  recalcAll();
}, true);

/* ===================== اسم الطالب ===================== */

const studentNameInput = document.getElementById('studentName');
studentNameInput.value = state.studentName || '';
studentNameInput.addEventListener('input', () => {
  state.studentName = studentNameInput.value;
  saveData();
});

/* ===================== زر مسح البيانات ===================== */

document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('هل أنت متأكد من مسح جميع البيانات المدخلة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = { studentName: '', fields: {} };
  studentNameInput.value = '';
  renderAllCards();
  recalcAll();
});

/* ===================== التبديل بين الصفحات ===================== */

document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ===================== الوضع الليلي / النهاري ===================== */

const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme){
  if (theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
}
let savedTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  savedTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(savedTheme);
  localStorage.setItem(THEME_KEY, savedTheme);
});

/* ===================== تصدير النتيجة كصورة ===================== */

document.getElementById('printBtn').addEventListener('click', async () => {
  const btn = document.getElementById('printBtn');
  
  // حماية الزر من النقرات المتعددة
  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ جاري تحضير بطاقة النتيجة...';

  try {
    // 1. استدعاء دالة تعبئة البيانات مع حمايتها من الانهيار (حتى لو كانت تحتوي على عناصر مفقودة)
    if (typeof populatePrintSheet === 'function') {
      try {
        populatePrintSheet();
      } catch (innerError) {
        // إذا كان هناك عنصر مفقود، سيتم طباعة التنبيه في المطور، لكن السكريبت لن يتوقف!
        console.warn("تم تخطي خطأ في تعبئة بعض العناصر المفقودة داخل ورقة الطباعة:", innerError.message);
      }
    }
    
    // 2. تجهيز ورقة الطباعة بأمان
    const sheet = document.getElementById('printSheet');
    if (!sheet) throw new Error("لم يتم العثور على عنصر ورقة الطباعة printSheet في ملف HTML");
    
    // إظهار مؤقت آمن للمحرك البصري للمتصفح
    const originalDisplay = sheet.style.display;
    sheet.style.display = 'block';
    sheet.style.position = 'absolute';
    sheet.style.left = '-9999px'; 
    sheet.style.visibility = 'visible';
    sheet.style.opacity = '1';
    
    // الانتظار الفني لضمان تحميل الخطوط وتجاوب المتصفح
    await new Promise(r => setTimeout(r, 300));
    if (document.fonts) await document.fonts.ready;

    // 3. التقاط الصورة
    const canvas = await html2canvas(sheet, {
      scale: 2, 
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    // 4. إعادة إخفاء ورقة الطباعة فوراً بعد اللقطة إلى وضعها الأصلي
    sheet.style.display = originalDisplay || 'none';
    sheet.style.position = '';
    sheet.style.left = '';

    // 5. جلب اسم الطالب بأمان تام لتسمية الملف
    let studentInput = document.getElementById('studentName');
    let rawName = studentInput ? studentInput.value : '';
    const safeName = (rawName.trim()) ? rawName.trim().replace(/\s+/g, '_') : 'طالب_القسم_العلمي';

    // 6. تحميل بطاقة النتيجة كصورة PNG (تعديل السطر المصاب)
    const link = document.createElement('a');
    link.download = `نتيجة_${safeName}_القسم_العلمي.png`;
    link.href = canvas.toDataURL('image/png'); // هنا تم إصلاح الخطأ اللغوي الجذري
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    alert('منظومة الساحل: حدث خطأ غير متوقع أثناء معالجة الصورة.\nالسبب: ' + err.message);
    console.error(err);
  } finally {
    // إعادة الزر لحالته الطبيعية والنشطة
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});
function populatePrintSheet(){
  document.getElementById('psStudentName').textContent = state.studentName && state.studentName.trim()
    ? state.studentName.trim() : 'بدون اسم';

  const tbody = document.getElementById('psTableBody');
  tbody.innerHTML = lastResults.map(r => `
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

  const grandTotal = lastResults.reduce((s, r) => s + r.total, 0);
  const grandPercent = (grandTotal / GRAND_MAX) * 100;
  const grandGrade = getGrade(grandPercent);
  const failed = lastResults.filter(r => !r.passed);
  const overallPass = failed.length === 0;

  document.getElementById('psTotal').textContent = `${fmt(grandTotal)} / ${GRAND_MAX}`;
  document.getElementById('psPercent').textContent = `${fmt(grandPercent)}%`;
  document.getElementById('psGrade').textContent = grandGrade;

  const resultEl = document.getElementById('psResult');
  resultEl.textContent = overallPass ? 'ناجح' : 'له دور ثان';
  const resultBox = resultEl.closest('.ps-summary-box');
  resultBox.classList.toggle('pass', overallPass);
  resultBox.classList.toggle('fail', !overallPass);

  document.getElementById('psRetakeNote').textContent = failed.length > 0
    ? `عدد المواد التي لها دور ثان: ${failed.length} (${failed.map(r => r.subject.name).join('، ')})`
    : '';

  const now = new Date();
  document.getElementById('psDate').textContent = 'التاريخ: ' + now.toLocaleDateString('ar-LY');
  document.getElementById('psTime').textContent = 'الوقت: ' + now.toLocaleTimeString('ar-LY');

  // الباركود
  const code = 'THN' + now.getTime().toString().slice(-8);
  try{
    JsBarcode('#psBarcode', code, {
      format: 'CODE128',
      lineColor: '#0e1f4b',
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 14,
      margin: 4,
      background: '#ffffff'
    });
  } catch(e){ /* تجاهل */ }
}

/* ===================== التشغيل الأولي ===================== */

renderAllCards();
recalcAll();

})();

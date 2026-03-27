/**
 * certificates.js — Система подарочных сертификатов
 * Оплата: Т-Банк эквайринг → генерация PDF (html2canvas + jsPDF) → email (EmailJS)
 */

// ─── Конфигурация ─────────────────────────────────────────────────────────────

const CERT = {
  terminalKey: '1670767167731DEMO',   // ← Заменить на '1670767167731' при переходе на боевой
  emailjsService:  'service_41xvivf',
  emailjsTemplate: 'template_osyhwvr',
  emailjsPublicKey: 'xHuIdg_cpiM1GCIts',
  amounts: [1000, 2000, 3000, 5000],
  validityMonths: 12,
};

let selectedAmount = CERT.amounts[0];

// ─── Инициализация ────────────────────────────────────────────────────────────

function initCertSection() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(CERT.emailjsPublicKey);
  }

  renderCertAmounts();
  initCertForm();
  checkCertPaymentReturn();
}

// ─── Выбор номинала ───────────────────────────────────────────────────────────

function renderCertAmounts() {
  const container = document.querySelector('.cert-amounts');
  if (!container) return;

  CERT.amounts.forEach((amount, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cert-amount' + (i === 0 ? ' is-active' : '');
    btn.dataset.amount = amount;
    btn.textContent = amount.toLocaleString('ru-RU') + ' ₽';
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cert-amount').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedAmount = amount;
      const customInput = document.getElementById('cert-custom-amount');
      if (customInput) customInput.value = '';
      updateSubmitAmount(amount);
    });
    container.appendChild(btn);
  });

  // Поле своей суммы
  const customInput = document.getElementById('cert-custom-amount');
  if (customInput) {
    customInput.addEventListener('input', () => {
      const val = parseInt(customInput.value, 10);
      document.querySelectorAll('.cert-amount').forEach(b => b.classList.remove('is-active'));
      if (val >= 500) {
        selectedAmount = val;
        updateSubmitAmount(val);
      } else {
        selectedAmount = null;
        updateSubmitAmount(null);
      }
    });
  }
}

function updateSubmitAmount(amount) {
  const span = document.querySelector('.cert-submit-amount');
  if (!span) return;
  span.textContent = amount ? amount.toLocaleString('ru-RU') + ' ₽' : '—';
}

// ─── Форма ────────────────────────────────────────────────────────────────────

function initCertForm() {
  const form = document.getElementById('cert-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('cert-error')?.style.setProperty('display', 'none');

    const toName   = form.querySelector('[name="to_name"]').value.trim();
    const fromName = form.querySelector('[name="from_name"]').value.trim();
    const toEmail  = form.querySelector('[name="to_email"]').value.trim();

    if (!toName || !fromName || !toEmail) return;
    if (!selectedAmount || selectedAmount < 500) {
      setCertStatus('error', 'Укажите номинал сертификата (минимум 500 ₽)');
      return;
    }

    const certData = {
      toName, fromName, toEmail,
      amount:  selectedAmount,
      certId:  generateCertId(),
      expires: getExpiryDate(),
    };

    sessionStorage.setItem('certData', JSON.stringify(certData));
    await startPayment(certData);
  });
}

// ─── Оплата Т-Банк ────────────────────────────────────────────────────────────

async function startPayment(certData) {
  const btn = document.querySelector('.cert-form__submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Перенаправляем на оплату…'; }

  try {
    const base = window.location.origin + window.location.pathname;
    const res = await fetch('https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        TerminalKey: CERT.terminalKey,
        Amount:      certData.amount * 100,
        OrderId:     certData.certId,
        Description: `Подарочный сертификат S.A Beauty на ${certData.amount} ₽`,
        SuccessURL:  base + '?cert=success',
        FailURL:     base + '?cert=fail',
      }),
    });

    const data = await res.json();

    if (data.Success && data.PaymentURL) {
      window.location.href = data.PaymentURL;
    } else {
      throw new Error(data.Message || 'Ошибка инициализации платежа');
    }
  } catch (err) {
    console.error(err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Оплатить <span class="cert-submit-amount">' +
        selectedAmount.toLocaleString('ru-RU') + ' ₽</span>';
    }
    setCertStatus('error', 'Не удалось создать платёж. Попробуйте ещё раз.');
  }
}

// ─── Обработка возврата после оплаты ─────────────────────────────────────────

async function checkCertPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('cert');
  if (!status) return;

  // Убираем параметр из URL
  window.history.replaceState({}, '', window.location.pathname + '#certificates');

  // Скролл к секции
  setTimeout(() => {
    const section = document.getElementById('certificates');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }, 400);

  if (status === 'success') {
    const certData = JSON.parse(sessionStorage.getItem('certData') || 'null');
    if (certData) {
      sessionStorage.removeItem('certData');
      hideCertForm();
      setCertStatus('loading');
      await onPaymentSuccess(certData);
    }
  } else if (status === 'fail') {
    setCertStatus('error', 'Оплата не прошла. Попробуйте ещё раз.');
  }
}

async function onPaymentSuccess(certData) {
  try {
    const pdfDataUri = await generateCertPDF(certData);

    // Автоматически скачиваем PDF
    triggerDownload(pdfDataUri, `sertifikat-${certData.certId}.pdf`);

    // Отправляем email с подтверждением
    await emailjs.send(
      CERT.emailjsService,
      CERT.emailjsTemplate,
      {
        to_email:  certData.toEmail,
        to_name:   certData.toName,
        from_name: certData.fromName,
        amount:    certData.amount.toLocaleString('ru-RU') + ' ₽',
        cert_id:   certData.certId,
        expires:   certData.expires,
      },
      { publicKey: CERT.emailjsPublicKey }
    );

    setCertStatus('success', null, certData, pdfDataUri);
  } catch (err) {
    console.error(err);
    setCertStatus('error', 'Оплата прошла, но произошла ошибка. Пожалуйста, свяжитесь с нами.');
  }
}

// ─── Генерация PDF ────────────────────────────────────────────────────────────

async function generateCertPDF(certData) {
  const { jsPDF } = window.jspdf;
  const W = 200, H = 130; // мм, landscape

  const frontEl = buildCertFrontEl();
  const backEl  = buildCertBackEl(certData);

  document.body.appendChild(frontEl);
  document.body.appendChild(backEl);

  // Ждём загрузки изображений
  await Promise.all([...frontEl.querySelectorAll('img'), ...backEl.querySelectorAll('img')]
    .map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))
  );

  const [frontCanvas, backCanvas] = await Promise.all([
    html2canvas(frontEl, { scale: 2, useCORS: true, logging: false }),
    html2canvas(backEl,  { scale: 2, useCORS: true, logging: false }),
  ]);

  frontEl.remove();
  backEl.remove();

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [H, W] });
  doc.addImage(frontCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, H);
  doc.addPage();
  doc.addImage(backCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, H);

  return doc.output('datauristring');
}

function buildCertFrontEl() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed', left: '-9999px', top: '0',
    width: '800px', height: '520px', overflow: 'hidden',
  });
  el.innerHTML = `<img src="images/certificate/cert-front.png"
    style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous">`;
  return el;
}

function buildCertBackEl(d) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed', left: '-9999px', top: '0',
    width: '800px', height: '520px',
    background: '#FFEFF7',
    fontFamily: "'DM Sans', sans-serif",
    overflow: 'hidden',
  });

  el.innerHTML = `
    <img src="images/certificate/cert-back-full.png"
      style="position:absolute;top:0;left:0;width:100%;object-fit:cover;object-position:top;max-height:190px;"
      crossorigin="anonymous">

    <div style="position:absolute;top:190px;left:0;right:0;bottom:0;
                display:flex;flex-direction:column;align-items:center;
                padding:20px 70px 30px;">

      <p style="font-size:11px;letter-spacing:3px;color:#b87a8a;margin:0 0 8px;text-transform:uppercase;">
        A Gift From Me To You
      </p>
      <h2 style="font-size:26px;font-weight:700;color:#5a3040;letter-spacing:4px;
                 margin:0 0 16px;text-transform:uppercase;">
        Gift Certificate
      </h2>
      <div style="width:100%;height:1px;background:#d4a0b0;margin-bottom:18px;"></div>

      <div style="width:100%;margin-bottom:10px;">
        <span style="font-size:9px;letter-spacing:2px;color:#b87a8a;text-transform:uppercase;">To :</span>
        <span style="font-size:13px;color:#5a3040;margin-left:10px;font-weight:500;">${esc(d.toName)}</span>
        <div style="width:100%;height:1px;background:#d4a0b0;margin-top:5px;"></div>
      </div>

      <div style="width:100%;margin-bottom:10px;">
        <span style="font-size:9px;letter-spacing:2px;color:#b87a8a;text-transform:uppercase;">From :</span>
        <span style="font-size:13px;color:#5a3040;margin-left:10px;font-weight:500;">${esc(d.fromName)}</span>
        <div style="width:100%;height:1px;background:#d4a0b0;margin-top:5px;"></div>
      </div>

      <div style="width:100%;display:flex;gap:30px;">
        <div style="flex:1;">
          <span style="font-size:9px;letter-spacing:2px;color:#b87a8a;text-transform:uppercase;">Amount :</span>
          <span style="font-size:13px;color:#5a3040;margin-left:10px;font-weight:500;">${d.amount.toLocaleString('ru-RU')} ₽</span>
          <div style="width:100%;height:1px;background:#d4a0b0;margin-top:5px;"></div>
        </div>
        <div style="flex:1;">
          <span style="font-size:9px;letter-spacing:2px;color:#b87a8a;text-transform:uppercase;">Expires :</span>
          <span style="font-size:13px;color:#5a3040;margin-left:10px;font-weight:500;">${d.expires}</span>
          <div style="width:100%;height:1px;background:#d4a0b0;margin-top:5px;"></div>
        </div>
      </div>

      <div style="position:absolute;bottom:28px;right:60px;text-align:right;line-height:1.7;">
        <p style="font-size:9px;color:#b87a8a;margin:0;">Адрес: Ясногорская улица 13к2</p>
        <p style="font-size:9px;color:#b87a8a;margin:0;">8. (917) 588-32-09</p>
        <p style="font-size:9px;color:#b87a8a;margin:0;">@S.A.BEAUTY_YASENEVO</p>
      </div>
    </div>`;
  return el;
}

// ─── UI состояний ─────────────────────────────────────────────────────────────

function hideCertForm() {
  const form = document.getElementById('cert-form');
  const amounts = document.querySelector('.cert-amounts');
  const customWrap = document.querySelector('.cert-custom-wrap');
  if (form) form.style.display = 'none';
  if (amounts) amounts.style.display = 'none';
  if (customWrap) customWrap.style.display = 'none';
}

function setCertStatus(state, msg, certData, pdfDataUri) {
  document.getElementById('cert-loading')?.style.setProperty('display', state === 'loading' ? 'flex' : 'none');
  document.getElementById('cert-error')?.style.setProperty('display',   state === 'error'   ? 'block' : 'none');
  document.getElementById('cert-success')?.style.setProperty('display', state === 'success' ? 'block' : 'none');

  if (state === 'error' && msg) {
    const el = document.getElementById('cert-error');
    if (el) el.textContent = msg;
  }

  if (state === 'success' && certData) {
    const el = document.getElementById('cert-success');
    if (!el) return;
    el.querySelector('.cert-success__email').textContent = certData.toEmail;
    el.querySelector('.cert-success__id').textContent    = certData.certId;

    document.getElementById('cert-download-btn')?.addEventListener('click', () => {
      triggerDownload(pdfDataUri, `sertifikat-${certData.certId}.pdf`);
    });
  }
}

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function generateCertId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SA-${part()}-${part()}`;
}

function getExpiryDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + CERT.validityMonths);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function triggerDownload(dataUri, filename) {
  const a = document.createElement('a');
  a.href = dataUri;
  a.download = filename;
  a.click();
}

function esc(str) {
  return String(str).replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[c]));
}

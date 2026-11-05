/* Форма перезвона: валидация, маска телефона и реальная отправка в Formspree. */
(function () {
  'use strict';
  var form = document.getElementById('callback-form');
  if (!form) return;
  var nameInput = document.getElementById('callback-name');
  var phoneInput = document.getElementById('callback-phone');
  var consentInput = document.getElementById('callback-consent');
  var status = document.getElementById('callback-status');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = form.querySelector('.callback-form__button-label');
  var success = document.getElementById('callback-success');
  var again = document.getElementById('callback-again');
  function nationalDigits(value) {
    var digits = String(value || '').replace(/\D/g, '');
    if (/^\s*\+7/.test(value)) digits = digits.slice(1);
    if (digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) digits = digits.slice(1);
    return digits.slice(0, 10);
  }
  function formatPhone(digits) {
    if (!digits) return '';
    var result = '+7 (' + digits.slice(0, 3);
    if (digits.length > 3) result += ') ' + digits.slice(3, 6);
    if (digits.length > 6) result += '-' + digits.slice(6, 8);
    if (digits.length > 8) result += '-' + digits.slice(8, 10);
    return result;
  }
  phoneInput.addEventListener('focus', function () { if (!phoneInput.value) phoneInput.value = '+7 ('; });
  phoneInput.addEventListener('input', function () { phoneInput.value = formatPhone(nationalDigits(phoneInput.value)); clearError(phoneInput); });
  phoneInput.addEventListener('blur', function () { if (!nationalDigits(phoneInput.value)) phoneInput.value = ''; if (phoneInput.value) validate(phoneInput); });
  function errorElement(field) { return document.getElementById(field.id + '-error'); }
  function setError(field, message) {
    var box = field.closest('.callback-field') || field.closest('.callback-check');
    var error = errorElement(field);
    if (box) box.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) { error.textContent = message; error.hidden = !message; }
  }
  function clearError(field) { if (field.getAttribute('aria-invalid') === 'true') validate(field); }
  function validate(field) {
    var value = String(field.value || '').trim();
    if (field === nameInput && value.length < 2) { setError(field, 'Напишите, как к вам обращаться'); return false; }
    if (field === phoneInput && nationalDigits(value).length !== 10) { setError(field, 'Введите 10 цифр номера после +7'); return false; }
    if (field === consentInput && !field.checked) { setError(field, 'Нужно согласие на обработку данных'); return false; }
    setError(field, ''); return true;
  }
  nameInput.addEventListener('input', function () { clearError(nameInput); });
  nameInput.addEventListener('blur', function () { if (nameInput.value) validate(nameInput); });
  consentInput.addEventListener('change', function () { validate(consentInput); });
  function setBusy(busy) { button.disabled = busy; form.classList.toggle('is-busy', busy); buttonLabel.textContent = busy ? 'Отправляю…' : 'Позвоните мне'; }
  function showStatus(message, isError) { status.textContent = message; status.classList.toggle('is-error', Boolean(isError)); }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var valid = [nameInput, phoneInput, consentInput].map(validate).every(Boolean);
    if (!valid) { var firstInvalid = form.querySelector('[aria-invalid="true"]'); if (firstInvalid) firstInvalid.focus(); showStatus('Проверьте выделенные поля.', true); return; }
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) { showStatus('Форма пока не подключена к почте. Позвоните: +7 909 854-88-61.', true); return; }
    document.getElementById('callback-page').value = location.href;
    document.getElementById('callback-time').value = new Date().toISOString();
    setBusy(true); showStatus('Отправляю заявку…', false);
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (response) { if (!response.ok) throw new Error('HTTP ' + response.status); form.reset(); form.hidden = true; success.hidden = false; success.focus(); })
      .catch(function () { showStatus('Заявка не отправилась. Попробуйте ещё раз или позвоните: +7 909 854-88-61.', true); })
      .finally(function () { setBusy(false); });
  });
  again.addEventListener('click', function () { success.hidden = true; form.hidden = false; showStatus('', false); nameInput.focus(); });
})();

// currencyPicker.js — searchable currency picker dialog

import { getState, setState } from './state.js';
import { getCurrencies } from './api.js';
import { buildCurrencyList, POPULAR_CODES, flagUrl } from './currencies.js';

let dialogEl, searchInput, listEl;
let allCurrencies = [];
let activeField = null; // 'send' | 'receive' — which field opened the picker

export async function initCurrencyPicker() {
  dialogEl = document.querySelector('.currency-picker');
  if (!dialogEl) return;

  dialogEl.innerHTML = `
    <input type="text" class="picker-search" placeholder="Search currency..." aria-label="Search currency" />
    <div class="picker-list" role="listbox"></div>
  `;
  searchInput = dialogEl.querySelector('.picker-search');
  listEl = dialogEl.querySelector('.picker-list');

  searchInput.addEventListener('input', () => render(searchInput.value));
  dialogEl.addEventListener('click', onListClick);
  dialogEl.addEventListener('close', () => { activeField = null; });
  dialogEl.addEventListener('cancel', () => { activeField = null; });

  // Open triggers: any element with data-open-picker="send" or "receive"
  document.querySelectorAll('[data-open-picker]').forEach((btn) => {
    btn.addEventListener('click', () => open(btn.dataset.openPicker));
  });

  try {
    const currencies = await getCurrencies();
    allCurrencies = buildCurrencyList(currencies);
  } catch (err) {
    console.error('Failed to load currency list:', err);
    allCurrencies = [];
  }
}

function open(field) {
  activeField = field;
  searchInput.value = '';
  render('');
  dialogEl.showModal();
  searchInput.focus();
}

function render(query) {
  const q = query.trim().toLowerCase();
  const { send, receive } = getState();
  const activeCode = activeField === 'send' ? send.currency : receive.currency;

  const filtered = q
    ? allCurrencies.filter(
        (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      )
    : allCurrencies;

  const popular = filtered.filter((c) => POPULAR_CODES.includes(c.code));
  const other = filtered.filter((c) => !POPULAR_CODES.includes(c.code));

  const renderGroup = (label, items) => {
    if (items.length === 0) return '';
    const rows = items
      .map((c) => `
        <li role="option" data-code="${c.code}" aria-selected="${c.code === activeCode}">
          <img src="${flagUrl(c.countryCode)}" alt="" width="24" height="18" />
          <span class="picker-code">${c.code}</span>
          <span class="picker-name">${c.name}</span>
          ${c.code === activeCode ? '<span class="picker-check" aria-hidden="true">✓</span>' : ''}
        </li>
      `)
      .join('');
    return `<h3 class="picker-group-label">${label}</h3><ul>${rows}</ul>`;
  };

  listEl.innerHTML =
    renderGroup('Popular', popular) + renderGroup('Other currencies', other) ||
    '<p class="picker-empty">No currencies found.</p>';
}

function onListClick(e) {
  const item = e.target.closest('[data-code]');
  if (!item || !activeField) return;

  const code = item.dataset.code;
  const { send, receive } = getState();

  if (activeField === 'send') {
    setState({ send: { ...send, currency: code } });
  } else {
    setState({ receive: { ...receive, currency: code } });
  }

  dialogEl.close();
}
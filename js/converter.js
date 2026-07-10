// converter.js — live currency conversion, swap, favorite

import { getState, setState, subscribe } from './state.js';
import { getLatestRate } from './api.js';
import { CURRENCY_META, flagUrl } from './currencies.js';

let currentRate = null;      // cached rate for the active pair
let currentPairKey = null;   // e.g. "USD_EUR", used to detect pair changes

let els = {};

export function initConverter() {
  els = {
    sendAmount: document.querySelector('#send-amount'),
    sendCurrencyBtn: document.querySelector('#send-currency-display'),
    receiveAmount: document.querySelector('#receive-amount'),
    receiveCurrencyBtn: document.querySelector('#receive-currency-display'),
    swapBtn: document.querySelector('#swap-currencies'),
    favoriteBtn: document.querySelector('#favorite-pair'),
    rateDisplay: document.querySelector('#live-rate'),
  };

  els.sendAmount?.addEventListener('input', onAmountInput);
  els.swapBtn?.addEventListener('click', onSwap);
  els.favoriteBtn?.addEventListener('click', onToggleFavorite);

  subscribe(onStateChange);

  // Initial render + fetch for whatever's in state on load
  renderFromState();
  fetchRateIfPairChanged();
}

function onAmountInput(e) {
  const amount = parseFloat(e.target.value) || 0;
  setState({ send: { ...getState().send, amount } });
}

function onSwap() {
  const { send, receive } = getState();
  setState({
    send: { currency: receive.currency, amount: send.amount },
    receive: { currency: send.currency },
  });
}

function onToggleFavorite() {
  const { send, receive, favorites } = getState();
  const pair = { base: send.currency, quote: receive.currency };
  const exists = favorites.some((f) => f.base === pair.base && f.quote === pair.quote);

  const nextFavorites = exists
    ? favorites.filter((f) => !(f.base === pair.base && f.quote === pair.quote))
    : [...favorites, pair];

  setState({ favorites: nextFavorites });
}

function onStateChange() {
  renderFromState();
  fetchRateIfPairChanged();
}

function updateCurrencyButton(btn, code) {
  if (!btn) return;
  const meta = CURRENCY_META[code];
  const codeEl = btn.querySelector('.currency-code');
  const flagEl = btn.querySelector('.flag-icon');
  if (codeEl) codeEl.textContent = code;
  if (flagEl && meta) {
    flagEl.src = flagUrl(meta.countryCode);
    flagEl.alt = meta.name;
  }
}

function renderFromState() {
  const { send, receive, favorites } = getState();

  if (els.sendAmount && document.activeElement !== els.sendAmount) {
    els.sendAmount.value = send.amount;
  }
  updateCurrencyButton(els.sendCurrencyBtn, send.currency);
  updateCurrencyButton(els.receiveCurrencyBtn, receive.currency);

  const isFavorited = favorites.some(
    (f) => f.base === send.currency && f.quote === receive.currency
  );
  els.favoriteBtn?.classList.toggle('is-favorited', isFavorited);
  els.favoriteBtn?.setAttribute('aria-pressed', String(isFavorited));

  updateConvertedAmount();
}

function updateConvertedAmount() {
  const { send } = getState();
  if (currentRate == null || !els.receiveAmount) return;

  const converted = send.amount * currentRate;
  els.receiveAmount.value = converted.toFixed(2);
}

async function fetchRateIfPairChanged() {
  const { send, receive } = getState();
  const pairKey = `${send.currency}_${receive.currency}`;

  if (pairKey === currentPairKey) return; // pair unchanged, no fetch needed
  currentPairKey = pairKey;

  try {
    const data = await getLatestRate(send.currency, receive.currency);
    currentRate = data.rates[receive.currency];

    if (els.rateDisplay) {
      els.rateDisplay.textContent = `1 ${send.currency} = ${currentRate.toFixed(4)} ${receive.currency}`;
    }
    updateConvertedAmount();
  } catch (err) {
    console.error('Failed to fetch rate:', err);
    if (els.rateDisplay) els.rateDisplay.textContent = 'Rate unavailable';
  }
}
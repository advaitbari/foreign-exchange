// state.js — single source of truth + pub/sub

const STORAGE_KEY = 'fx-checker-state';

const defaultState = {
  send: { currency: 'USD', amount: 100 },
  receive: { currency: 'EUR' },
  favorites: [],
  log: [],
};

let state = loadFromStorage();
const listeners = new Set();

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...structuredClone(defaultState), ...JSON.parse(raw) } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — fail silently, app still works in-memory
  }
}

export function getState() {
  return state;
}

export function setState(partial) {
  state = { ...state, ...partial };
  persist();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetState() {
  state = structuredClone(defaultState);
  persist();
  listeners.forEach((fn) => fn(state));
}

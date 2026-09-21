import test from 'node:test';
import assert from 'node:assert/strict';
import { getMenuAvailability } from './inventory.js';

const stock = [
  { id: 'paneer', name: 'Paneer', quantity: 1, parLevel: 0.5 },
  { id: 'cashews', name: 'Cashews', quantity: 0.3, parLevel: 0.2 }
];
const dish = { id: 'dish', name: 'Paneer dish', ingredients: { paneer: 0.18, cashews: 0.02 } };

test('a dish is available at par and unavailable below par', () => {
  assert.equal(getMenuAvailability([dish], stock)[0].available, true);
  const lowPaneer = stock.map((item) => item.id === 'paneer' ? { ...item, quantity: 0.49 } : item);
  const menu = getMenuAvailability([dish], lowPaneer);
  assert.equal(menu[0].available, false);
  assert.equal(menu[0].unavailableReason, 'Paneer is below par');
});

test('a missing recipe ingredient makes a dish unavailable', () => {
  const menu = getMenuAvailability([dish], stock.filter((item) => item.id !== 'cashews'));
  assert.equal(menu[0].unavailableReason, 'Missing cashews');
});
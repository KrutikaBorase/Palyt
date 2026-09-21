import { deductRecipe, getMenuAvailability } from './inventory.js';

const stockList = document.querySelector('#stock-list');
const stockCount = document.querySelector('#stock-count');
const menuList = document.querySelector('#menu-list');
const orderMessage = document.querySelector('#order-message');
let stock = [];
let recipes = [];

function formatQuantity(value) { return Number(value.toFixed(3)).toString(); }

function renderStock(stock) {
  stockCount.textContent = `${stock.length} ingredients`;
  stockList.replaceChildren(...stock.map((ingredient) => {
    const row = document.createElement('tr');
    const healthy = ingredient.quantity >= ingredient.parLevel;
    row.innerHTML = `<th scope="row">${ingredient.name}<span>${ingredient.unit}</span></th><td>${formatQuantity(ingredient.quantity)} ${ingredient.unit}</td><td>${formatQuantity(ingredient.parLevel)} ${ingredient.unit}</td><td><span class="status ${healthy ? 'status-ok' : 'status-low'}">${healthy ? 'Healthy' : 'Below par'}</span></td>`;
    return row;
  }));
}

function renderMenu() {
  menuList.replaceChildren(...getMenuAvailability(recipes, stock).map((dish) => {
    const item = document.createElement('article');
    item.className = 'menu-item';
    item.innerHTML = `<div><h3>${dish.name}</h3><p class="price">₹${dish.price}</p></div><div class="menu-action"><span class="status ${dish.available ? 'status-ok' : 'status-low'}">${dish.available ? 'Available' : 'Unavailable'}</span><button type="button" ${dish.available ? '' : 'disabled'}>${dish.available ? 'Order one' : dish.unavailableReason}</button></div>`;
    item.querySelector('button').addEventListener('click', () => orderDish(dish.id));
    return item;
  }));
}

function orderDish(recipeId) {
  const recipe = recipes.find((item) => item.id === recipeId);
  stock = deductRecipe(stock, recipe);
  orderMessage.textContent = `${recipe.name} ordered`;
  renderStock(stock);
  renderMenu();
}

const [stockResponse, recipesResponse] = await Promise.all([fetch('./stock.json'), fetch('./recipes.json')]);
if (!stockResponse.ok || !recipesResponse.ok) throw new Error('Could not load menu data');
stock = await stockResponse.json();
recipes = await recipesResponse.json();
renderStock(stock);
renderMenu();
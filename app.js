import { deductRecipe, getMenuAvailability, getRecipeReferences, validateIngredient } from './inventory.js';

const stockList = document.querySelector('#stock-list');
const stockCount = document.querySelector('#stock-count');
const menuList = document.querySelector('#menu-list');
const orderMessage = document.querySelector('#order-message');
const searchInput = document.querySelector('#stock-search');
const ingredientForm = document.querySelector('#ingredient-form');
const formError = document.querySelector('#form-error');
const cancelButton = document.querySelector('#ingredient-cancel');
const formFields = { id: document.querySelector('#ingredient-id'), name: document.querySelector('#ingredient-name'), unit: document.querySelector('#ingredient-unit'), quantity: document.querySelector('#ingredient-quantity'), parLevel: document.querySelector('#ingredient-par') };
let stock = [];
let recipes = [];

function formatQuantity(value) { return Number(value.toFixed(3)).toString(); }

function renderStock() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleStock = stock.filter((ingredient) => ingredient.name.toLowerCase().includes(query));
  stockCount.textContent = `${visibleStock.length} of ${stock.length} ingredients`;
  stockList.replaceChildren(...visibleStock.map((ingredient) => {
    const row = document.createElement('tr');
    const healthy = ingredient.quantity >= ingredient.parLevel;
    row.innerHTML = `<th scope="row">${ingredient.name}<span>${ingredient.unit}</span></th><td>${formatQuantity(ingredient.quantity)} ${ingredient.unit}</td><td>${formatQuantity(ingredient.parLevel)} ${ingredient.unit}</td><td><span class="status ${healthy ? 'status-ok' : 'status-low'}">${healthy ? 'Healthy' : 'Below par'}</span></td><td class="row-actions"><button type="button" data-edit-id="${ingredient.id}">Edit</button><button type="button" class="text-button" data-delete-id="${ingredient.id}">Delete</button></td>`;
    return row;
  }));
}

function renderMenu() {
  menuList.replaceChildren(...getMenuAvailability(recipes, stock).map((dish) => {
    const item = document.createElement('article');
    item.className = 'menu-item';
    item.innerHTML = `<div><h3>${dish.name}</h3><p class="price">₹${dish.price}</p></div><div class="menu-action"><span class="status ${dish.available ? 'status-ok' : 'status-low'}">${dish.available ? 'Available' : 'Unavailable'}</span><button type="button" data-recipe-id="${dish.id}" ${dish.available ? '' : 'disabled'}>${dish.available ? 'Order one' : dish.unavailableReason}</button></div>`;
    item.querySelector('button').addEventListener('click', () => orderDish(dish.id));
    return item;
  }));
}

function orderDish(recipeId) {
  const recipe = recipes.find((item) => item.id === recipeId);
  stock = deductRecipe(stock, recipe);
  orderMessage.textContent = `${recipe.name} ordered`;
  renderStock();
  renderMenu();
}

function resetIngredientForm() { ingredientForm.reset(); formFields.id.value = ''; ingredientForm.querySelector('#ingredient-submit').textContent = 'Add ingredient'; cancelButton.classList.add('hidden'); formError.textContent = ''; }
function editIngredient(id) { const ingredient = stock.find((item) => item.id === id); formFields.id.value = ingredient.id; formFields.name.value = ingredient.name; formFields.unit.value = ingredient.unit; formFields.quantity.value = ingredient.quantity; formFields.parLevel.value = ingredient.parLevel; ingredientForm.querySelector('#ingredient-submit').textContent = 'Save changes'; cancelButton.classList.remove('hidden'); formFields.name.focus(); }
function deleteIngredient(id) {
  const ingredient = stock.find((item) => item.id === id);
  const references = getRecipeReferences(id, recipes);
  if (references.length) { formError.textContent = `Cannot delete ${ingredient.name}: used by ${references.map((recipe) => recipe.name).join(', ')}.`; return; }
  stock = stock.filter((item) => item.id !== id); renderStock(); renderMenu();
}

stockList.addEventListener('click', (event) => { if (event.target.dataset.editId) editIngredient(event.target.dataset.editId); if (event.target.dataset.deleteId) deleteIngredient(event.target.dataset.deleteId); });
ingredientForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = formFields.name.value.trim();
  const id = formFields.id.value || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const input = { id, name, unit: formFields.unit.value, quantity: Number(formFields.quantity.value), parLevel: Number(formFields.parLevel.value) };
  const errors = validateIngredient(input, stock.map((item) => item.id), formFields.id.value || null);
  if (errors.length) { formError.textContent = errors.join('. '); return; }
  stock = formFields.id.value ? stock.map((item) => item.id === input.id ? input : item) : [...stock, input];
  resetIngredientForm(); renderStock(); renderMenu();
});
cancelButton.addEventListener('click', resetIngredientForm);

const [stockResponse, recipesResponse] = await Promise.all([fetch('./stock.json'), fetch('./recipes.json')]);
if (!stockResponse.ok || !recipesResponse.ok) throw new Error('Could not load menu data');
stock = await stockResponse.json();
recipes = await recipesResponse.json();
searchInput.addEventListener('input', renderStock);
renderStock();
renderMenu();
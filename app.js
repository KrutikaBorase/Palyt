const stockList = document.querySelector('#stock-list');
const stockCount = document.querySelector('#stock-count');

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

const response = await fetch('./stock.json');
if (!response.ok) throw new Error(`Could not load stock.json (${response.status})`);
renderStock(await response.json());
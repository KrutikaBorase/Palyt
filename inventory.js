export function isIngredientAvailable(ingredient) {
  return Boolean(ingredient) && ingredient.quantity >= ingredient.parLevel;
}

export function getUnavailableReason(recipe, stockById) {
  for (const [ingredientId, amount] of Object.entries(recipe.ingredients)) {
    const ingredient = stockById[ingredientId];
    if (!ingredient) return `Missing ${ingredientId}`;
    if (!isIngredientAvailable(ingredient)) return `${ingredient.name} is below par`;
    if (ingredient.quantity < amount) return `Not enough ${ingredient.name}`;
  }
  return null;
}

export function getMenuAvailability(recipes, stock) {
  const stockById = Object.fromEntries(stock.map((ingredient) => [ingredient.id, ingredient]));
  return recipes.map((recipe) => {
    const unavailableReason = getUnavailableReason(recipe, stockById);
    return { ...recipe, available: unavailableReason === null, unavailableReason };
  });
}
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

export function deductRecipe(stock, recipe, portions = 1) {
  if (!Number.isInteger(portions) || portions < 1) throw new Error('Portions must be a positive whole number');
  const stockById = Object.fromEntries(stock.map((ingredient) => [ingredient.id, ingredient]));
  const reason = getUnavailableReason(recipe, stockById);
  if (reason) throw new Error(`Cannot order ${recipe.name}: ${reason}`);
  return stock.map((ingredient) => {
    const remaining = ingredient.quantity - (recipe.ingredients[ingredient.id] ?? 0) * portions;
    return { ...ingredient, quantity: Math.round((remaining + Number.EPSILON) * 1000) / 1000 };
  });
}

export function getRecipeReferences(ingredientId, recipes) {
  return recipes.filter((recipe) => Object.hasOwn(recipe.ingredients, ingredientId));
}

export function validateIngredient(input, existingIds = [], currentId = null) {
  const errors = [];
  if (!input.name?.trim()) errors.push('Name is required');
  if (!['kg', 'L', 'each'].includes(input.unit)) errors.push('Unit must be kg, L, or each');
  if (!Number.isFinite(input.quantity) || input.quantity < 0) errors.push('Quantity must be zero or more');
  if (!Number.isFinite(input.parLevel) || input.parLevel <= 0) errors.push('Par level must be greater than zero');
  if (existingIds.includes(input.id) && input.id !== currentId) errors.push('An ingredient with this name already exists');
  return errors;
}
# Palyt Kitchen Stock

## Run locally

Serve the directory over HTTP because the page loads JSON with `fetch`:

```bash
npx serve .
```

Run the logic tests with:

```bash
npm test
```

## Decisions and write-up

Stock is held in the buying unit. For example, `0.18` kg of paneer represents 180 g in a recipe, so the app does not accidentally mix kilograms and grams. A dish is available at exactly par and unavailable only when any required ingredient falls strictly below par, matching the supplied product rule.

Deleting an ingredient used by a recipe is blocked and names the dependent dishes. This prevents an incomplete recipe from silently becoming orderable. An unused ingredient, such as bay leaves, can be deleted. In a production system I would add soft deletion or an audit trail, but that is outside this task.

The fixture keeps cashews at 1.01 kg with a 1 kg par level and uses them in two dishes. One paneer butter masala order therefore changes cashews to 0.99 kg and removes both dishes from the available menu. Edits are in memory because persistence and a backend are out of scope.

The logic tests cover the at-par boundary, below-par availability, missing ingredients, exact deductions, immutability of the prior stock state, failed orders, and invalid form values. Quantities are rounded to three decimal places after deduction to avoid floating-point residue. The tests could still pass if JSON-to-UI wiring broke, so I also checked the complete flow in a browser: ordering, restocking, raising par, search, editing, and both deletion cases.

Next I would persist stock behind an API, add transaction handling for simultaneous orders, and add browser automation for the order-to-menu workflow.

AI assistance was used to scaffold the plain JavaScript structure, suggest focused logic tests, and review edge cases such as unit precision and recipe dependencies. All generated changes were checked with Node tests and browser interaction.
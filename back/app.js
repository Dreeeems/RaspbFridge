const express = require('express');
const db = require("./db");


const app = express();
const PORT = 3000;

app.use(express.json());


/* PRODUCTS ROUTES */
app.get('/products',(req,res)=>{
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
})


app.post('/products',(req,res)=>{
  const {name,quantity=1,expiry_date = null } = req.body;
  if(!name) return res.status(400).json({error: 'name required'});

  const result =db
    .prepare('INSERT INTO products (name,quantity,expiry_date) VALUES (?,?,?)')
    .run(name,quantity,expiry_date);
    res.status(200).json({id:result.lastInsertRowid,name,quantity,expiry_date});
})

app.delete('/product/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.status(204).end();
});

app.put('/products/:id', (req, res) => {
    const { name, quantity = 1, expiry_date = null } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const result = db
        .prepare('UPDATE products SET name = ?, quantity = ?, expiry_date = ? WHERE id = ?')
        .run(name, quantity, expiry_date, req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'product not found' });
    }

    res.status(200).json({ id: Number(req.params.id), name, quantity, expiry_date });
});

/*  RECIPES ROUTES */
app.get('/recipes', (req, res) => {
 const recipes = db.prepare('SELECT * FROM recipes').all();
  res.json(recipes);
});


app.get('/recipes/:id', (req, res) => {
    const recipe = db
        .prepare('SELECT * FROM recipes WHERE id = ?')
        .get(req.params.id);

    if (!recipe) return res.status(404).json({ error: 'recipe not found' });

    const ingredients = db
        .prepare('SELECT name, quantity FROM recipe_ingredients WHERE recipe_id = ?')
        .all(recipe.id);

    const steps = db
        .prepare('SELECT step_number, description FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number')
        .all(recipe.id);

    res.json({ ...recipe, ingredients, steps });
});

app.post('/recipes', (req, res) => {
    const { name, ingredients = [], steps = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const findProduct = db.prepare('SELECT id FROM products WHERE LOWER(name) = LOWER(?)');

    const missing = ingredients
    .filter(ingredient => !findProduct.get(ingredient.name))
    .map(ingredient => ingredient.name);

if (missing.length > 0) {
    return res.status(400).json({ error: 'unknown ingredients', missing });
}
    if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
        return res.status(400).json({ error: 'ingredients and steps must be arrays' });
    }

    const insertRecipe = db.prepare('INSERT INTO recipes (name) VALUES (?)');
    const insertIngredient = db.prepare(
        'INSERT INTO recipe_ingredients (recipe_id, name, quantity) VALUES (?, ?, ?)'
    );
    const insertStep = db.prepare(
      'INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES (?, ?, ?)'
    )

    const createRecipe = db.transaction(() => {
        const result = insertRecipe.run(name);
        const recipeId = result.lastInsertRowid;

        ingredients.forEach(ingredient => {
            insertIngredient.run(recipeId, ingredient.name, ingredient.quantity ?? 1);
        });
        steps.forEach((step, index)=>{
          const step_number = index+1
          insertStep.run(recipeId, step_number, step.description);
        })

        return recipeId;
    });
        const id = createRecipe();
    res.status(201).json({ id });
  });

app.put('/recipes/:id', (req, res) => {
    const { name, ingredients = [], steps = [] } = req.body;


    const updateRecipe = db.transaction(() => {

    });


});


app.delete('/recipes/:id', (req, res) => {

});

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});
app.listen(PORT,()=>{
    console.log("Server connecté")
})
const express = require('express');
const db = require("./db");


const app = express();
const PORT = 3000;

app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("Hello, Express! on fait un test");
});
app.listen(PORT,()=>{
    console.log("Server connecté")
})
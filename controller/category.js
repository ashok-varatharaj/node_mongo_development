const express = require('express');
const app = express();

app.post('/api/admin/category/list', (req, res) => {
    res.send('add');
})
const express = require('express');
const app = express();
const routes = require('./routes');
const port = 8000;


app.use(express.json());
app.use(routes);


app.listen(port);
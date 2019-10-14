const express = require('express');
const app = express();
const server = app.listen(8080);

app.use(express.static('public'));

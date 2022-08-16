
const express = require('express');
const morgan = require('morgan');
const fs = require('fs/promises');
let dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(morgan('dev'));

app.listen(PORT, () => {
    console.log(`[start] Listening on port ${PORT}...`);
});


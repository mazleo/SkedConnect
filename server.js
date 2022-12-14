
const express = require('express');
const morgan = require('morgan');
const fs = require('fs/promises');
let dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 8080;

const validate = require('./middlewares/validate');
const auth = require('./middlewares/auth');

app.use(async (req, res, next) => {
    await configureDotEnv();
    return next();
});

app.use(express.json());
app.use(morgan('dev'));

app.use(validate.isValidTrelloRequest);
app.use(auth.verifyFromTrello);

const Board = require('./models/boards');
const Card = require('./models/cards');
const ApiRouter = require('./routes/api');

app.use('/api', ApiRouter);

app.listen(PORT, () => {
    console.log(`[start] Listening on port ${PORT}...`);
});

async function configureDotEnv() {
    const envExists = await isEnvExists();
    if (envExists) dotenv.config({path: '.env'});
    else dotenv.config({path: 'app.yaml'})
}

async function isEnvExists() {
    let envExists = true;
    try { await fs.access('.env'); }
    catch(error) { envExists = false; }

    return envExists;
}
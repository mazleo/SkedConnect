
const express = require('express');
const morgan = require('morgan');
const fs = require('fs/promises');
let dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(async (req, res, next) => {
    await configureDotEnv();
    next();
});

app.use(morgan('dev'));

app.listen(PORT, () => {
    console.log(`[start] Listening on port ${PORT}...`);
});

async function configureDotEnv() {
    const envExists = await isEnvExists();
    if (envExists) {
        dotenv.config({path: '.env'});
    }
    else {
        dotenv.config({path: 'app.yaml'})
    }
}

async function isEnvExists() {
    let envExists = true;
    try {
        await fs.access('.env');
    }
    catch(error) {
        console.error(error);
        envExists = false;
    }

    return envExists;
}
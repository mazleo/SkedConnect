
const express = require('express');
const router = express.Router();

const Card = require('../models/cards');
const Board = require('../models/boards');

const CARD_TYPE = 'updateCustomFieldItem';
const BOARD_TYPE = 'copyBoard';

router.post('/', async (req, res, next) => {
    let task = null;
    if (isCardType(req.body)) {
        task = new Card();
    }
    else {
        task = new Board();
    }

    try {
        await task.populate(req.body.action);
    }
    catch (error) {
        handleError(error, res);
        return;
    }

    res.status(200);
    res.json(JSON.stringify(task));
    return;
});

function handleError(error, res) {
    let errorResponse = {
        error: {
            msg: null
        }
    }

    if (error.message === Card.unexpectedCustomFieldError) {
        errorResponse.error.msg = 'The action performed is not on the expected custom field. Not performing any operations.';
        res.status(200);
    }
    else if (error.message === Card.nonSyncRequestError) {
        errorResponse.error.msg = 'The requested action is not a sync request. Not performing any operations.';
        res.status(200);
    }
    else {
        errorResponse.error.msg = 'Server error';
        res.status(500);
    }

    res.json(errorResponse);
}

function isCardType(requestBody) {
    if (requestBody.action.type == CARD_TYPE) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = router;
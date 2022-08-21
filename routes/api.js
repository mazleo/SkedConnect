
const express = require('express');
const router = express.Router();

const Card = require('../models/cards');
const Board = require('../models/boards');

const CARD_TYPE = 'updateCustomFieldItem';

router.post('/', async (req, res, next) => {
    const mailer = require('nodemailer');
    const smtp = require('nodemailer-smtp-transport');

    let task = null;
    if (isCardType(req.body)) task = new Card();
    else task = new Board();

    try { await task.populate(req.body.action); }
    catch (error) {
        handleError(error, res);
        return;
    }

    const msg = `Task '${task.task}' created.`;
    const successMsg = {success: msg};

    try {
        await emailTask(task, mailer, smtp);
        console.log(`[success] ${msg}`);
    }
    catch (error) {
        console.log(error);
        res.status(500);
        res.json({error:{msg:'Server error. Unable to send email.'}});
        return;
    }

    res.status(200);
    res.json(successMsg);

    return;
});

async function emailTask(task, mailer, smtp) {
  const transport = mailer.createTransport(
    smtp({
      host: 'in.mailjet.com',
      port: 2525,
      auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_API_SECRET
      }
    })
  );

  const emailBody = generateEmail(task);
  const json = await transport.sendMail({
    from: process.env.FROM_ADDRESS,
    to: process.env.TO_ADDRESS,
    subject: task.task,
    text: emailBody
  });
}

function generateEmail(task) {
    let timeMaps = generateTaskAttributeBrackets('@', task.timeMaps);
    let due = task.dueDate != null ? `due ${task.dueDate}` : '';
    let tags = generateTaskAttributeBrackets('/', task.tags);
    let priority = task.priority !== null ? `[/${task.priority}]` : '';
    let zone = task.zone !== null ? `[/${task.zone}]` : '';

    return `${task.duration || ''} ${task.plan || ''} ${due} [#${task.parentTask}] ${timeMaps} ${priority} ${tags} ${zone}\n\n${task.url}\n\n${task.notes}`;
}

function generateTaskAttributeBrackets(character, array) {
    let brackets = '';
    for (let item of array) brackets += `[${character}${item}] `;
    return brackets;
}

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
    return;
}

function isCardType(requestBody) {
    if (requestBody.action.type == CARD_TYPE) return true;
    else return false;
}

module.exports = router;
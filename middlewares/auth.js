
const crypto = require('crypto');

const verifyFromTrello = (req, res, next) => {
    const headerHash = req.get('X-Trello-Webhook');
    const doubleHash = generateHash(req);

    if (headerHash !== doubleHash) {
        res.status(401);
        res.json({error:{msg:'Unauthorized. Request not from Trello.'}});
        return;
    }
    
    return next();
}

function generateHash(request) {
    const contentToHash = JSON.stringify(request.body) + process.env.CALLBACK_URL;
    const doubleHash = crypto.createHmac('sha1', process.env.TRELLO_SECRET).update(contentToHash).digest('base64');
    return doubleHash;
}

module.exports.verifyFromTrello = verifyFromTrello;
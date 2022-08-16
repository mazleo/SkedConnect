
const VALID_ACTION_TYPES = [
    'updateCustomFieldItem',
    'copyBoard'
];

const isValidTrelloRequest = (req, res, next) => {
    const requestBody = req.body;

    if (!(hasRequiredFields(requestBody) && isValidType(requestBody))) {
        res.status(200);
        res.json({result: 'Request received but is not the expected request. Not performing any operations.'});
        return;
    }
    else if (!isValidMemberId(requestBody)) {
        res.status(401);
        res.json({error: {msg: 'Request not sent by the correct member.'}});
        return;
    }

    if (hasRequiredFields(requestBody) && isValidMemberId(requestBody) && isValidType(requestBody)) {
        return next();
    }
};

function isValidType(requestBody) {
    let isOneOfValidTypes = false;
    for (let validType of VALID_ACTION_TYPES) {
        if (requestBody.action.type === validType) isOneOfValidTypes = true;
    }

    return isOneOfValidTypes;
}

function isValidMemberId(requestBody) {
    return requestBody.action.idMemberCreator === process.env.VALID_MEMBER_ID;
}

function hasRequiredFields(requestBody) {
    try {
        const hasAction = requestBody.action != null;
        const hasMember = requestBody.action.idMemberCreator != null;
        const hasData = requestBody.action.data != null;
        const hasType = requestBody.action.type != null;
        
        return hasAction && hasMember && hasData && hasType;
    }
    catch {
        return false;
    }
}

module.exports.isValidTrelloRequest = isValidTrelloRequest;
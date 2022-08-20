
const https = require('https');

const Task = require('./tasks');

class Card extends Task {
    static expectedSyncFieldName = '🔃 Sync';
    static unexpectedCustomFieldError = 'Not the expected custom field';
    static nonSyncRequestError = 'Not a sync request.';
    static serverError = 'Server Error.';

    constructor() {
        super();
    }

    async populate(action) {
        Card.handleUnexpectedCustomField(action);
        await Card.handleNonSyncRequest(action);

        const cardId = action.data.card.id;

        const boardName = action.data.board.name;

        let card = null;
        let customFields = null;
        try {
            card = await Card.fetchCard(cardId);
            customFields = await Card.fetchCustomFieldItems(cardId);
        }
        catch (error) {
            throw new Error(Card.serverError);
        }
        let due = card.due !== null ? new Date(card.due) : null;

        this.task = card.name;
        this.notes = card.desc;
        this.parentTask = boardName;
        this.dueDate = due !== null ? `${due.getMonth() + 1}/${due.getDate()}` : null;
        this.url = card.url;

        for (let field of customFields) {
            let fieldName = null;
            try {
                fieldName = await Card.fetchCustomFieldName(field.idCustomField);
            }
            catch (error) {
                throw new Error(Card.serverError);
            }

            switch (fieldName) {
                case '⌛ Duration':
                    this.duration = field.value.text;
                    break;
                case '📅 Plan':
                    this.plan = field.value.text;
                    break;
                case '⏰ Time Maps':
                    this.timeMaps = field.value.text.split('|');
                    break;
                case '❗ Priority':
                    await Card.fetchAndAssignPriority(this, field);
                    break;
                case '🏷️ Tags':
                    this.tags = field.value.text.split('|');
                    break;
                case '🎯 Zone':
                    this.zone = field.value.text;
                    break;
            }
        }
    }

    static async fetchAndAssignPriority(cardInstance, field) {
        let fieldValueId = field.idValue;
        let priorityField = await Card.fetchCustomField(field.idCustomField);
        let priorityFieldOptions = priorityField.options;

        for (let priorityFieldOption of priorityFieldOptions) {
            if (fieldValueId === priorityFieldOption.id) {
                cardInstance.priority = priorityFieldOption.value.text;
            }
        }
    }

    static fetchCustomFieldName(id) {
        return new Promise((resolve, reject) => {
            const customFieldApiUrl = `https://api.trello.com/1/customFields/${id}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;

            const options = {
                headers: {
                    'Accept': 'application/json'
                }
            };

            const request = https.get(customFieldApiUrl, options, response => {
                response.on('data', data => {
                    resolve(JSON.parse(data.toString()).name);
                })
            });

            request.on('error', error => {
                reject(error);
            })

            request.end();
        });
    }

    static fetchCustomFieldItems(id) {
        return new Promise((resolve, reject) => {
            const customFieldsApiUrl = `https://api.trello.com/1/cards/${id}/customFieldItems?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;

            const options = {
                headers: {
                    'Accept': 'application/json'
                }
            };

            const request = https.get(customFieldsApiUrl, options, response => {
                response.on('data', data => {
                    resolve(JSON.parse(data.toString()));
                });
            });

            request.on('error', error => {
                reject(error);
            })

            request.end();
        });
    }

    static fetchCard(cardId) {
        return new Promise((resolve, reject) => {
            const cardApiUrl = `https://api.trello.com/1/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}&fields=all`;

            const options = {
                headers: {
                    'Accept': 'application/json'
                }
            };

            const request = https.get(cardApiUrl, options, response => {
                response.on('data', data => {
                    resolve(JSON.parse(data.toString()));
                });
            });

            request.on('error', error => {
                reject(error);
            })

            request.end();
        });
    }

    static async handleNonSyncRequest(action) {
        const actionCustomFieldId = action.data.customField.id;
        const actionSyncOldValueId = action.data.old.idValue;
        const actionSyncNewValueId = action.data.customFieldItem.idValue;

        let syncField = null;
        try {
            syncField = await this.fetchCustomField(actionCustomFieldId);
        }
        catch (error) {
            throw new Error(Card.serverError);
        }

        const syncFieldOldValue = Card.getSyncValueFromId(syncField.options, actionSyncOldValueId);
        const syncFieldNewValue = Card.getSyncValueFromId(syncField.options, actionSyncNewValueId);

        if (syncFieldNewValue === 'False' || (syncFieldOldValue === syncFieldNewValue)) {
            throw new Error(Card.nonSyncRequestError);
        }
    }

    static getSyncValueFromId(options, id) {
        for (let option of options) {
            if (id == option.id) return option.value.text;
        }
    }

    static fetchCustomField(id) {
        return new Promise((resolve, reject) => {
            const customFieldApiUrl = `https://api.trello.com/1/customFields/${id}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;

            const options = {
                headers: {
                    'Accept': 'application/json'
                }
            };

            const request = https.get(customFieldApiUrl, options, (response) => {
                response.on('data', (data) => {
                    resolve(JSON.parse(data.toString()));
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.end();
        });
    }

    static handleUnexpectedCustomField(action) {
        const actionCustomFieldName = action.data.customField.name;
        if (actionCustomFieldName !== Card.expectedSyncFieldName) {
            throw new Error(Card.unexpectedCustomFieldError);
        }
    }
}

module.exports = Card;
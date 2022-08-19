
const https = require('https');

const Task = require('./tasks');

class Board extends Task {
    constructor() {
        super();
        this.parentTask = 'Home';
    }

    populate(action) {
        return new Promise((resolve, reject) => {
            const boardId = action.data.board.id;
            const boardApiUrl = `https://api.trello.com/1/boards/${boardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;

            const request = https.get(boardApiUrl, response => this.handleDataRetrieval(response, resolve));
            request.on('error', (error) => reject(error));
            request.end();
        });
    }

    handleDataRetrieval(response, resolve) {
        response.on('data', data => {
            let board = JSON.parse(data.toString());
            this.updateWithResponse(board);
            resolve();
        });
    }

    updateWithResponse(board) {
        this.task = board.name;
        this.notes = board.desc;
        this.url = board.url;
    }
}

module.exports = Board;
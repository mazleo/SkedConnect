
class Task {
    constructor() {
        this.task = null;
        this.notes = null;
        this.duration = null;
        this.parentTask = null;
        this.plan = null;
        this.dueDate = null;
        this.timeMaps = [];
        this.tags = [];
        this.priority = null;
        this.zone = null;
        this.url = null;
    }

    populate(action) {}
}

module.exports = Task;
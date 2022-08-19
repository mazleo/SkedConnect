
class Task {
    static LOW_PRIORITY = 500;
    static MED_PRIORITY = 501;
    static HIGH_PRIORITY = 502;

    constructor() {
        this.task = null;
        this.notes = null;
        this.duration = null;
        this.parentTask = null;
        this.plan = null;
        this.dueDate = null;
        this.timeMaps = [];
        this.tags = [];
        this.priority = Task.MED_PRIORITY;
        this.zone = null;
        this.url = null;
    }

    populate(action) {}
}

module.exports = Task;
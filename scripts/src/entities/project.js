import Storage from '../utils/storage';

export default class {

    constructor() {
        this.db = Storage.getDatabase();
    }

    create(project) {
        this.db.get('projects').push(project).value();
    }

    find(id) {
        return this.db.get('projects').find({
            id: id
        }).value();
    }

    all() {
        return this.db.get('projects').value();
    }
}

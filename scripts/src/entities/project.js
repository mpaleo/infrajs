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

    /*
    TODO: project update
    update() {
        this.db.get('projects')
            .find({id: this.id})
            .assign({
                name: this.name,
                description: this.description,
                codePath: this.codePath,
                stack: this.stack
            })
            .value()
    }*/

    all() {
        return this.db.get('projects').value();
    }
}

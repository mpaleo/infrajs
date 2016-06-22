import {
    remote
} from 'electron';
import path from 'path';
import low from 'lowdb';

export default class {
    static getDatabase() {
        const db = low(path.join(remote.app.getPath('userData'), 'infrajs.db'));

        db.defaults({
                projects: [],
                containers: []
            })
            .value();

        return db;
    }
}

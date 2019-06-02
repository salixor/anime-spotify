const Datastore = require('nedb');

module.exports = class DBManager {
    constructor(name) {
        this.name = name;
        this.db = new Datastore({
            filename: this.name,
            autoload: true,
            timestampData: true
        });
    }

    async insert(obj) {
        try {
            return await (new Promise((resolve, reject) => {
                this.db.insert(obj, (err, doc) => {
                    if (err) reject(err);
                    else resolve(doc);
                });
            }));
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    async get(obj) {
        try {
            return await (new Promise((resolve, reject) => {
                this.db.findOne(obj, (err, doc) => {
                    if (err) reject(err);
                    else resolve(doc);
                });
            }));
        } catch(err) {
            console.error(err);
            throw err;
        }
    }
};

const DBManager = require('../db-manager');
const config = require('../../settings.json');
const UserListsDB = new DBManager(config.databases.userlists);

exports.Retriever = class Retriever {
    constructor(website, api) {
        this.website = website;
        this.api = api;
    }

    async fetch(username) {
        let cached = await UserListsDB.get({ username, website: this.website });

        if (cached === null) {
            let list = await this.getList(username);
            UserListsDB.insert({ username, website: this.website, list: list });
            return list;
        }

        return cached.list;
    }

    async getAnimeIDs(username, f) {
        let list = await this.fetch(username);
        list = f(list);
        return list.filter(ids => ids);
    }
};

const AniList = require('anilist-node');
const listRetriever = require('./list-retriever');

module.exports = class AniListRetriever extends listRetriever.Retriever {
    constructor() {
        super('anilist', new AniList());
    }

    // Reference : https://anilist.github.io/ApiV2-GraphQL-Docs/medialist.doc.html
    // Lists are not paginated
    async getList(username) {
        let lists = await this.api.lists.anime(username);
        return lists.reduce((acc, l) => acc.concat(l.entries), []);
    }

    async getAnimeIDs(username) {
        return await super.getAnimeIDs(username, (l) => l.map(m => parseInt(m.media.idMal)));
        // let list = await this.fetch(username);
        // list = list.map(m => parseInt(m.media.idMal));
        // return list.filter(ids => ids);
    }
};

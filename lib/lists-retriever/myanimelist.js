const Jikan = require('jikan-node');
const listRetriever = require('./list-retriever');

module.exports = class MyAnimeListRetriever extends listRetriever.Retriever {
    constructor() {
        super('myanimelist', new Jikan());
    }

    // Reference : https://jikan.docs.apiary.io/#reference/0/user
    // Lists are paginated at 300 results per page
    async getList(username) {
        let fetchPage = async (page = 1) => {
            let res = await this.api.findUser(username, 'animelist', 'all', { page: page });
            if (res.anime.length === 300)
                return fetchPage(page + 1).then(nextData => res.anime.concat(nextData));
            return res.anime;
        };

        return await fetchPage();
    }

    async getAnimeIDs(username) {
        return await super.getAnimeIDs(username, (l) => l.map(anime => anime.mal_id));
        // let list = await this.fetch(username);
        // list = list.map(anime => anime.mal_id);
        // return list.filter(ids => ids);
    }
};

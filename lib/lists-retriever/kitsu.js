const Kitsu = require('kitsu');
const listRetriever = require('./list-retriever');

module.exports = class KitsuRetriever extends listRetriever.Retriever {
    constructor() {
        super('kitsu', new Kitsu());
    }

    // Reference : https://kitsu.docs.apiary.io/#reference/user-libraries/library-entries
    // Lists are paginated up to 500 results per page
    async getList(username) {
        let userData = (await this.api.get('users', {
            fields: { users: 'id' },
            filter: { name: username },
        })).data;

        if (userData.length === 0) throw new Error('User not found');

        let userId = userData[0].id;
        let fetchPage = async (offset = 0) => {
            let res = await this.api.get('library-entries', {
                page: { limit: 50, offset: offset },
                filter: { userId: userId, kind: 'anime' },
                include: 'anime.mappings'
            });
            if (res.links.next) {
                let [s, off] = res.links.next.match(/^.*page%5Boffset%5D=(\d+)$/);
                return fetchPage(off).then(nextData => res.data.concat(nextData));
            }
            return res.data;
        };

        return await fetchPage();
    }

    async getAnimeIDs(username) {
        return await super.getAnimeIDs(username,
            (l) => l.map(m => parseInt(m.anime.mappings.find(ext => ext.externalSite.includes('myanimelist')).externalId))
        );
    }
};

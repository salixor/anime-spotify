const MyAnimeListRetriever = require('./myanimelist');
const AniListRetriever = require('./anilist');
const KitsuRetriever = require('./kitsu');

let retrievers = {
    myanimelist: MyAnimeListRetriever,
    anilist: AniListRetriever,
    kitsu: KitsuRetriever
};

module.exports = {
    fetchUserAnimeIDs: async (userName, site) => {
        let retriever = new retrievers[site];
        let list_anime_ids = await retriever.getAnimeIDs(userName);
        return list_anime_ids;
    }
};

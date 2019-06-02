const exporter = require('./lib/exporter');
const retrievers = require('./lib/lists-retriever');

let getPlaylist = async (username, site) => {
    let ids = await retrievers.fetchUserAnimeIDs(username, site);
    let songs = await exporter.fetchAnimeSongs(ids);
    return exporter.getUrisAndUnmatched(songs);
};

getPlaylist('salixor', 'anilist').then(res => console.log(res.uris));

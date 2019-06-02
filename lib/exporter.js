const AnimeFetcher = require('./anime-songs-fetcher');
const Spotify = require('./spotify');

module.exports = {
    fetchAnimeSongs: async (list_ids) => {
        let animes = await AnimeFetcher.fetchAll(list_ids);
        let songs = animes.map(infos => AnimeFetcher.songBuilder(infos));
        return songs;
    },
    getUrisAndUnmatched: async (songs) => {
        let allSongs = songs.reduce((acc, info) => acc.concat(info.songs), []).filter(s => s);
        let unmatchedSongs = allSongs.filter(s => s.unmatched).map(u => u.unmatched);
        let matchedSongs = allSongs.filter(s => !s.unmatched).filter((song, index, self) => index === self.findIndex(obj => JSON.stringify(obj) === JSON.stringify(song)));

        Spotify.authenticate();

        try {
            let data = await Spotify.fetchAllENandJP(matchedSongs);
            let uris = await Spotify.urisRetriever(data);
            return { unmatchedSongs, uris };
        } catch (e) {
            throw e;
        }
    }
};

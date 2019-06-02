const Spotify = require('spotify-web-api-node');
const PromiseThrottle = require('promise-throttle');
const DBManager = require('../lib/db-manager');
const config = require('../settings.json');

const throttler = new PromiseThrottle({ requestsPerSecond: 4 });
const SpotifyDB = new DBManager(config.databases.songs);

const spotify = new Spotify({
    clientId: config.spotify.client.id,
    clientSecret: config.spotify.client.secret
});

module.exports = {
    authenticate: async function () {
        let tokenData = await spotify.clientCredentialsGrant();
        spotify.setAccessToken(tokenData.body['access_token']);
        return {
            token: tokenData.body['access_token'],
            expiration: tokenData.body['expires_in']
        };
    },
    fetchSong: async function (obj) {
        let query = `${obj.title} ${obj.artist}`;
        let cached = await SpotifyDB.get({ query });

        if (cached === null) {
            let song_infos = await throttler.add(() => spotify.searchTracks(query, { market: obj.market }));
            SpotifyDB.insert({ query, infos: song_infos.body.tracks.items });
            return song_infos;
        }

        return cached.infos;
    },
    fetchAll: async function (objs) {
        return await Promise.all(objs.map(obj => this.fetchSong(obj)));
    },
    fetchENandJP: async function (animeSong) {
        try {
            let en = await this.fetchSong({
                title: animeSong.title.en,
                artist: animeSong.artist.en,
                market: config.spotify.market
            });
            let jp = await this.fetchSong({
                title: animeSong.title.jp || animeSong.title.en,
                artist: animeSong.artist.jp || animeSong.artist.en,
                market: 'JP'
            });
            return { en, jp };
        } catch (e) {
            throw e;
        }
    },
    fetchAllENandJP: async function (animeSongs) {
        return await Promise.all(animeSongs.map(animeSong => this.fetchENandJP(animeSong)));
    },
    urisRetriever: function (infos) {
        let uris = Array.from(new Set(infos.map(result => {
            if (result.en.length === 0 && result.jp.length > 0)
                return result.jp[0].uri;
            if (result.en.length > 0)
                return result.en[0].uri;
        }).filter(s => s)));
        return uris;
    }
};

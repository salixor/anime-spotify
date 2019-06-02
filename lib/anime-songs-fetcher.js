const Jikan = require('jikan-node');
const PromiseThrottle = require('promise-throttle');
const DBManager = require('../lib/db-manager');
const config = require('../settings.json');

const mal = new Jikan();
const throttler = new PromiseThrottle({ requestsPerSecond: 1 });

const AnimeDB = new DBManager(config.databases.animes);

module.exports = {
    fetchFromID: async function (anime_id) {
        let cached = await AnimeDB.get({ anime_id });

        if (cached === null) {
            let anime_infos = await throttler.add(() => mal.findAnime(anime_id));
            AnimeDB.insert({ anime_id, infos: anime_infos });
            return anime_infos;
        }

        return cached.infos;
    },
    fetchAll: async function (animes_ids) {
        return await Promise.all(animes_ids.map(id => this.fetchFromID(id)));
    },
    songBuilder: function (infos) {
        return {
            id: infos.mal_id,
            title: infos.title,
            songs: infos.opening_themes.concat(infos.ending_themes)
                .filter(t => t.toLowerCase() !== 'none')
                .map(t => {
                    let m = t.match(/^"(?:(.*)(?:.*) \((.*)\)|(.*))" by (.*?) ?(\([^()]*\))?(?: \([^\(\)]*\))*$/i);
                    if (m === null) {
                        return { unmatched: t };
                    } else {
                        return {
                            title: { en: m[1] || m[3], jp: m[2] },
                            artist: { en: m[4], jp: m[5] !== undefined ? (m[5].includes('ep') ? undefined : m[5]) : undefined }
                        };
                    }
                })
        }
    }
};

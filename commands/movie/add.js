exports.run = (bot, msg, args = []) => {
    const getQualityProfile = require('../../util/radarr/getQualityProfileId');
    const getMovie = require('../../util/radarr/getMovie');
    const addMovie = require('../../util/radarr/addMovie');
    const createMovieItem = require('../../util/radarr/createMovieModalRadarr');
    const createMovieItemModal = require('../../util/discord/createMovieModal');
    let [imdbId, qualityProfile, rootPath] = args;
    if (!imdbId) { msg.channel.send('ERR: No imdbId found.'); return; }
    msg.channel.send('Starting...')
        .then((m) => {
            msg.channel.startTyping();
            let rp = msg.guild.settings.radarr.defaultRootPath;
            let pid = null;
            if (!qualityProfile) qualityProfile = msg.guild.settings.radarr.defaultProfile;
            m.edit(`Receiving profileId for ${qualityProfile}`);
            getQualityProfile(msg.guild, qualityProfile)
                .then((profileId) => {
                    pid = profileId;
                    m.edit('Received profileId. Continuing');
                });
            if (rootPath) {
                m.edit('Detected rootPath override');
                rp = rootPath;
            }
            m.edit('Querying Radarr for Movie information');
            getMovie(msg.guild, imdbId)
                .then((movie) => {
                    m.edit('Received Movie infromation. Adding to Radarr.');
                    addMovie(msg.guild, movie, pid, rp)
                        .then(() => {
                            m.edit('Movie added sucessfully');
                            const l = createMovieItem(movie);
                            const e = createMovieItemModal(l);
                            e.setAuthor('Movie added sucessfully');
                            e.setFooter(`Called by ${msg.author.username}`, msg.author.avatarURL);
                            m.edit({ embed: e });
                            msg.channel.stopTyping();
                        }).catch((e) => { m.edit(`ERR: ${e}`); msg.channel.stopTyping(); return; });
                }).catch((e) => { m.edit(`ERR: ${e}`); msg.channel.stopTyping(); return; });
        });
};
exports.help = {
    name: 'add',
    description: 'Adds movie to Movie Engine',
    usage: 'movie add <imdbId> [qualityProfile] [rootPath]'
};
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 3
};
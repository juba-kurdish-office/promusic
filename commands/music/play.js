const { Utils } = require("erela.js")
const chalk = require('chalk');
const { MessageEmbed } = require("discord.js");

module.exports = { 
    config: {
        name: "play",
        description: "Play a song/playlist or search for a song from youtube",
        usage: "<results>",
        category: "music",
        accessableby: "Member",
        aliases: ["p", "pplay"]
    },
    run: async (client, message, args) => {
        const msg = await message.channel.send('Loading please wait...')
        const { channel } = message.member.voice;
        if (!channel) return msg.edit("You need to be in a voice channel to play music.");

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has("CONNECT")) return msg.edit("I cannot connect to your voice channel, make sure I have permission to!");
        if (!permissions.has("SPEAK")) return msg.edit("I cannot connect to your voice channel, make sure I have permission to!");

        if (!args[0]) return msg.edit("Please provide a song name or link to search.");

        const player = client.music.players.spawn({
            guild: message.guild,
			selfDeaf: true,
            textChannel: message.channel,
            voiceChannel: channel,
        });

        client.music.search(args.join(" "), message.author).then(async res => {
            switch (res.loadType) {
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);

                const embed = new MessageEmbed()
                    .setDescription(`**Queued • [${res.tracks[0].title}](${res.tracks[0].uri})** \`${Utils.formatTime(res.tracks[0].duration, true)}\` • ${res.tracks[0].requester}`)
                    .setColor('#000001')

                    msg.edit('', embed);
                        console.log(chalk.magenta(`  [Command]: Play used by ${message.author.tag} from ${message.guild.name}`));
                    if (!player.playing) player.play()
                    break;
                
                case "SEARCH_RESULT":
                const res1 = await client.music.search(
                    message.content.slice(6),
                    message.author
                );
                    player.queue.add(res1.tracks[0]);

                    const embed1 = new MessageEmbed()
                        .setDescription(`**Queued • [${res1.tracks[0].title}](${res1.tracks[0].uri})** \`${Utils.formatTime(res1.tracks[0].duration, true)}\` • ${res1.tracks[0].requester}`)
                        .setColor('#000001')
            
                      msg.edit('', embed1);
                        console.log(chalk.magenta(`  [Command]: Play used by ${message.author.tag} from ${message.guild.name}`));
                      if (!player.playing) player.play()
                    break;

                case "PLAYLIST_LOADED":
                    res.playlist.tracks.forEach(track => player.queue.add(track));
                    const duration = Utils.formatTime(res.playlist.tracks.reduce((acc, cur) => ({duration: acc.duration + cur.duration})).duration, true);

                    const playlist = new MessageEmbed()
                        .setDescription(`**Queued** • [${res.playlist.info.name}](${res.playlist.info.uri}) \`${duration}\` (${res.playlist.tracks.length} tracks) • ${res.playlist.tracks[0].requester}`)
                        .setColor('#000001')

                    msg.edit('', playlist);
                        console.log(chalk.magenta(`  [Command]: Play used by ${message.author.tag} from ${message.guild.name}`));
                        if(!player.playing) player.play()
                    break;
            }
        }).catch(err => msg.edit(err.message))
    }
}
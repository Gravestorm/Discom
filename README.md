Discord bot mainly used in the [Dofus Discord server](https://discord.gg/0RDH0dqUoTRkCjSF).

## Features
- !chat `message` - Talk with the bot.
- !d `number #channel @user` - Delete a number of messages (100 max per use), can also mention a channel to transfer the deleted messages to it, as well as mention a user or several to only delete their messages (can do one or the other or both in any order, except the number going first).
- !q `MessageID #channel` - Quote a message, mention the channel the message is in if it is in a different channel than the current one.
- !c `hue luminosity` - Change the colour of the Nitro Booster role to a random colour, can also write specific hue/colour (HEX/colour names) and luminosity/brightness (bright/light/dark).
- Sends the offering for the current day to the specified channel (#almanax by default), refreshes every day.
- Sends deleted messages to the specified channel (#madhouse by default).
- Gives the Streaming role to users who are streaming and removes it when they finish, can also limit the giving of the role to users who also have the Streamer role.
- Changes the colour of the Nitro Booster role to a random colour every hour.

## Permissions Needed
- Read Text Channels
- Read Message History
- Send Messages
- Manage Messages
- Manage Roles (The bot's role also needs to be above the Nitro Booster/Streaming/Streamer roles)

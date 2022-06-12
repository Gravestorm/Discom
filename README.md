Discord bot mainly used in the [Dofus Discord server](https://discord.gg/0RDH0dqUoTRkCjSF).

## Features
### Commands
- /chat `message` - Have a chat with the bot.
- /colour `hue luminosity` - Change the colour of the Nitro Booster role to a random colour, can also write a specific hue/colour (colour name or colour hex code) and select the luminosity/brightness (bright, light or dark).
- /d `number @user #channel` - Delete a number of messages in the current channel (100 max per use), optionally can also select a user to only delete their messages, as well as optionally select a channel to transfer the deleted messages to.
- /q `MessageID #channel` - Quote a message, enter the message ID, also need to select the channel that the message is in if it's in a different channel than the current one.
- /info `@user` - Displays information about the selected user, if a user is not selected, shows information about the sender.
- /leaderboard - Displays the leaderboards of the server.

### Plugins
- Sends the Almanax offering for the current day to the specified Almanax channel, refreshes each midnight DUT (Dofus time).
- Sends Dofus RSS/Twitter/Youtube posts to the specified English/French Announcement channels, as well as Ankama Youtube videos to the specified Ads channel.
- Sends deleted messages to the specified Log channel.
- Gives the Streaming role to users who have the Streamer role and are currently streaming, as well as removes the Streaming role when they finish streaming.
- Removes random characters from the start of nicknames, used by people to pop up at the top of the online list.
- Changes the colour of the Nitro Booster role to a random colour every hour.

## Permissions Needed
- Read Text Channels
- Read Message History
- Send Messages
- Manage Messages
- Manage Nicknames
- Manage Roles (The bot's role also needs to be above the Nitro Booster/Streaming/Streamer roles)
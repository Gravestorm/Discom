Discord bot mainly used in the [Dofus Discord server](https://discord.gg/0RDH0dqUoTRkCjSF).

## Features
### Commands
- /ads `URL` - Lets a user request the Streamer/Youtube/Artist roles.
- /almanax `yyyy-mm-dd` - Fetch the Almanax offering of the specified day.
- /chat `message` - Have a chat with the bot.
- /colour `hue luminosity` - Change the colour of the Nitro Booster role to a random colour, can also write a specific hue/colour (colour name or colour hex code) and select the luminosity/brightness (bright, light or dark).
- /delete `number @user #channel` - Delete a number of messages in the current channel (100 max per use), can select a user to only delete their messages or a channel to transfer the deleted messages to, can also select both or none.
- /image `@user minutes` - Gives permissions to send images for the selected user for x minutes, 2 by default.
- /info `@user` - Displays information about the selected user, if a user is not selected, displays information about the sender.
- /warn `@user reason` - Warns the selected user.

### Plugins
- Sends the Almanax offering for the current day to the specified Almanax channel, refreshes each midnight DUT (Dofus time).
- Sends Dofus RSS/Twitter/Youtube posts to the specified English/French Announcement channels, as well as Ankama Youtube videos to the specified Ads channel.
- Sends the leaderboards of the server to the specified Leaderboard channel, refreshes on the first day of each month.
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
- Manage Roles (The bot's role also needs to be above the Nitro Booster/Streaming/Streamer/Leaderboard roles)
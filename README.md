Discord bot mainly used in the [Dofus Discord server](https://discord.gg/0RDH0dqUoTRkCjSF).

## Features
### Commands
- /ads `URL` - Posts the URL in a specified channel to request the Streamer/Youtube/Artist roles.
- /almanax `yyyy-mm-dd` - Displays the Almanax offering of the specified day, or current day if not specified.
- /chat `message version` - Have a chat with the bot, optionally can choose a specific AI version.
- /colour `colour` - Create a role based on the userID and change the colour of it to a specified hex code, or random colour if not specified, can select what roles can use the command in the Integrations tab on the server.
- /delete `number @user #channel` - Delete a number of messages in the current channel (100 max per use), can also select a specific user, to only delete their messages, as well as a specific channel to transfer the deleted messages to.
- /draw `prompt version` - Generate an image from a prompt, optionally can choose a specific AI version.
- /info `@user` - Displays information about a specific user, or the sender if not specified.
- /warn `@user reason silent unwarn` - Warns the specified user by adding a warning role level up to level 3 and logs the reason, can also select silent for the bot to not respond with a link to the rules in the channel the command was sent in, as well as remove a warning level from the user when selecting unwarn.

### Plugins
- Almanax - Sends the Almanax offering for the current day to the specified Almanax channel, refreshes each midnight DUT (Dofus time).
- Cleanup - Cleans up the Announcement/Ads channels by deleting old messages.
- Fetch/Leaderboard - Fetches message data of users in the server to give specified roles based on sent messages/account age, to be used with the info command and to be shown in the specified leaderboard channel.
- Logs - Logs bans/warns and deleted/edited messages to a specified channel.
- Nickname - Prevents users from appearing at the top of the online list by removing specific characters from usernames upon username change or server join.
- Nitro - Changes the colour of the Nitro Booster role to a random colour every hour.
- Publish - Publishes all messages sent in specific channels automatically.
- RSS/Twitter/Youtube - Sends Dofus related news from those platforms to specified channels.
- Streaming - Gives the Streaming role to users who have the Streamer role and are currently streaming, as well as removes the Streaming role when they finish streaming.

## Permissions Needed
- Read Text Channels
- Read Message History
- Send Messages
- Manage Messages
- Manage Nicknames
- Manage Roles (The bot's role also needs to be above the Nitro Booster/Streaming/Streamer/Leaderboard roles)
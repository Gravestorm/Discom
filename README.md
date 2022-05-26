Discord bot mainly used in the [Dofus Discord server](https://discord.gg/0RDH0dqUoTRkCjSF).

## Features
### Commands
- /chat `message` - Have a chat with the bot.
- /d `number #channel @user` - Delete a number of messages (100 max per use), can also select a channel to transfer the deleted messages to it, as well as select a user or several to only delete their messages.
- /q `MessageID #channel` - Quote a message, enter the message ID, also need to select the channel that the message is in if it's in a different channel than the current one.
- /c `hue luminosity` - Change the colour of the Nitro Booster role to a random colour, can also write specific hue/colour (HEX/colour names) and luminosity/brightness (bright/light/dark).
### Plugins
- Sends the offering for the current day to the specified channel (#almanax by default), refreshes every day.
- Sends Dofus RSS/Twitter posts to the specified channels (#announcements and #annonces by default), as well as sends Dofus Youtube videos to the specified channel (#ads by default).
- Sends deleted messages to the specified channel (#madhouse by default).
- Gives the Streaming role to users who are streaming and removes it when they finish, can also limit the giving of the role to users who also have the Streamer role.
- Removes random characters from the start of nicknames, used by people to pop up at the top of the online list.
- Changes the colour of the Nitro Booster role to a random colour every hour.

## Permissions Needed
- Read Text Channels
- Read Message History
- Send Messages
- Manage Messages
- Manage Nicknames
- Manage Roles (The bot's role also needs to be above the Nitro Booster/Streaming/Streamer roles)
# telegramBotBotHandler

## Example Bot

```js
const bot = new BotHandler("token.txt");

bot.setMainMenuText(function (chat) { return "What do you want to do?"; });

bot.setMainMenuOptions(function (chat) {
  return { "Hi": hiOption, "Bye": byeOption };
};

bot.onCommand("start", false, function (msg) { bot.sendMainMenu(msg.chat); })

function hiOption(msg) {
  bot.sendText(msg.chat, "Hi!");
}

function byeOption(msg) {
  bot.sendText(msg.chat, "Bye!");
}
```

## Objects

### userOptions
Key will be shown as Telegram keyboard key. If the user hits the key, the function will be triggered.
```js
{
  "stuff": function(msg) { ... },
  "bla": function(msg) { ... },
  ...
}
```

## Methods

### new BotHandler(pathToTokenFile)
load the token from the given file path and start the bot (polling).

### botHandler.setMainMenuText(function(chat) { ...; return string;  })
`function` will be triggered to send the main menu to the given chat. The return string will be shown to the user.

### botHandler.setMainMenuOptions(function(chat) { ...; return userOptions; })
`function` will be triggered to send the main menu to the given chat. The `userOptions` will be shown to the user.

### botHandler.onCommand(command, arguments, function(msg, match) {})
`function` will be triggered when the user sends the given command. `arguments` is true if the command must have arguments, false if not.

### botHandler.setUnhandledMessageAnswerText(function(msg) { ...; return string; })
`function` will be triggered when a user `msg` is not recognized. The return string will be send to the user. In direct chats (not groups) the mainmenu will trigger after 500ms.

### botHandler.sendText(chat, text, userOptions, [columns])
Send the `text` to the `chat`. The user will get the keys as keyboard in n `columns` (default 2). The answer of the user trigger the `function`. If the user type manual another answer the mainmenu will be send.

### botHandler.sendText(chat, text, function(msg) {}, [keyboardKeys])
Send the `text` to the `chat`. The answer will trigger the `function`. If `keyboardKeys` is provided the user can chose an answer from the given keyboard. (`botHandler.arrayToKeyboard(...)` could be of help)

### botHandler.sendText(chat, text)
Send the `text` to the chat. This will clear any reply_markup (force_reply/ keyboard). Nothing will happen on an answer. In direct chats (not groups) the mainmenu will trigger after 500ms.

### botHandler.sendMainMenu(chat)
Send the mainmenu to the `chat`. This will cancel other callbacks.

### botHandler.arrayToKeyboard(array, [columns, [optimizeColumns]])
Build a single dimension `array` into a keyboard. `columns` default is 2. if `optimizeColumns` is true, the `columns` can be reduced if only a few `array` entries exist.

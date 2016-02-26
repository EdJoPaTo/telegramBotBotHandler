# telegramBotBotHandler

### new BotHandler(pathToTokenFile)
load the token from the given file path and start the bot (polling).

### botHandler.setMainMenu(function(chat) {})
Function will be triggered to send the main menu to the given chat.

### botHandler.sendText(chat, text, {key1: function(msg), key2: function(msg), ...}, [columns])
Send the text to the chat. The user will get the keys as keyboard in n columns (default 2). The answer of the user trigger the function. If the user type manual another answer the mainMenu will be send.

### botHandler.sendText(chat, text, function(msg) {}, [keyboardKeys])
Send the text to the chat. The answer will trigger the function. If keyboardKeys is provided the user can chose an answer from the given keyboard. (botHandler.arrayToKeyboard(...) could be of help)

### botHandler.sendText(chat, text)
Send the text to the chat. This will clear any reply_markup (force_reply/ keyboard). Nothing will happen on an answer. In direct chats (not groups) the mainMenu will trigger after 500ms.

### botHandler.sendMainMenu(chat)
Send the mainMenu to the chat. This will cancel other callbacks.

### botHandler.arrayToKeyboard(array, [columns])
Build a single dimension array into a keyboard. Columns default is 2.

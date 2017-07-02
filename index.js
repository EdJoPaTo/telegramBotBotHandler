const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const BotHandler = function (tokenFilePath) {
  const token = fs.readFileSync(tokenFilePath, "utf8").trim();
  this.bot = new TelegramBot(token, {polling: true});
  this._currentHandler = {};
  this._currentHandlerList = {};
  const botHandler = this;

  this.bot.onText(/^(?!\/)[\s\S]*$/, function(msg) {
    if (botHandler._currentHandler[msg.chat.id]) {
      botHandler._currentHandler[msg.chat.id](msg);
    } else if (botHandler._currentHandlerList[msg.chat.id] && botHandler._currentHandlerList[msg.chat.id][msg.text]) {
      botHandler._currentHandlerList[msg.chat.id][msg.text](msg);
    } else if (botHandler._mainMenuOptions && botHandler._mainMenuOptions(msg.chat)[msg.text]) {
      botHandler._mainMenuOptions(msg.chat)[msg.text](msg);
    } else {
      console.log("unhandled message: " + JSON.stringify(msg));
      if (botHandler._unhandledMessageAnswerText) {
        const text = botHandler._unhandledMessageAnswerText(msg);
        botHandler.sendText(msg.chat, text);
      }
    }
  });
};

BotHandler.prototype.setMainMenuText = function (callback) {
  this._mainMenuText = callback;
};

BotHandler.prototype.setMainMenuOptions = function (callback) {
  this._mainMenuOptions = callback;
};

BotHandler.prototype.onCommand = function (command, args, callback) {
  const regex = new RegExp("^\\/" + command + "(?:@\\S+)?" + (args ? " ([\\s\\S]+)" : "") + "$", "i");

  this.bot.onText(regex, callback);
};

BotHandler.prototype.setUnhandledMessageAnswerText = function (callback) {
  this._unhandledMessageAnswerText = callback;
};

BotHandler.prototype.sendText = function (chat, text, callback, keyboardKeys) {
  const type = typeof callback;

  delete this._currentHandler[chat.id];
  delete this._currentHandlerList[chat.id];

  if (type === 'object' ) {
    const columns = keyboardKeys;
    const keys = this.arrayToKeyboard(Object.keys(callback), columns);

    this._currentHandlerList[chat.id] = callback;
    this.bot.sendMessage(chat.id, text, { parse_mode: "Markdown", reply_markup: JSON.stringify({ keyboard: keys }) });
  } else if (type === 'function' && keyboardKeys) {
    this._currentHandler[chat.id] = callback;
    this.bot.sendMessage(chat.id, text, { parse_mode: "Markdown", reply_markup: JSON.stringify({ keyboard: keyboardKeys }) });
  } else if (type === 'function') {
    this._currentHandler[chat.id] = callback;
    this.bot.sendMessage(chat.id, text, { parse_mode: "Markdown", reply_markup: JSON.stringify({ force_reply: true }) });
  } else {
    this.bot.sendMessage(chat.id, text, { parse_mode: "Markdown", reply_markup: JSON.stringify({ hide_keyboard: true }) });
    if (chat.id > 0) {
      setTimeout(function(botHandler, chat) {
        botHandler.sendMainMenu(chat);
      }, 500, this, chat);
    }
  }
};

BotHandler.prototype.sendMainMenu = function(chat) {
  const text = this._mainMenuText(chat);
  const options = this._mainMenuOptions(chat);

  this.sendText(chat, text, options);
};

BotHandler.prototype.arrayToKeyboard = function(array, columns, optimizeColumns) {
  if (!columns) {
    columns = 2;
  }
  while (optimizeColumns && array.length / columns <= columns - 1 && columns > 2) {
    columns -= 1;
  }

  const result = [];
  let tmp = [];
  let curColumn = 0;

  for (let i = 0; i < array.length; i++) {
    curColumn = i % columns;
    if (curColumn === 0 && i !== 0) {
      result.push(tmp);
      tmp = [];
    }

    tmp.push(array[i]);
  }
  if (tmp.length > 0) {
    result.push(tmp);
  }

  return result;
};

module.exports = BotHandler;

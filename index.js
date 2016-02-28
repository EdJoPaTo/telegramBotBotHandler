const fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');

var BotHandler = function (tokenFilePath) {
  var token = fs.readFileSync(tokenFilePath, "utf8").trim();
  this.bot = new TelegramBot(token, {polling: true});
  this._currentHandler = {};
  this._currentHandlerList = {};
  var botHandler = this;

  this.bot.onText(/^(?!\/).+$/, function(msg) {
    if (botHandler._currentHandler[msg.chat.id]) {
      botHandler._currentHandler[msg.chat.id](msg);
    } else if (botHandler._currentHandlerList[msg.chat.id] && botHandler._currentHandlerList[msg.chat.id][msg.text]) {
      botHandler._currentHandlerList[msg.chat.id][msg.text](msg);
    } else if (botHandler._mainMenuOptions && botHandler._mainMenuOptions(msg.chat)[msg.text]) {
      botHandler._mainMenuOptions(msg.chat)[msg.text](msg);
    } else {
      console.log("unhandled message: " + JSON.stringify(msg));
    }
  });
};

BotHandler.prototype.setMainMenuText = function (callback) {
  this._mainMenuText = callback;
};

BotHandler.prototype.setMainMenuOptions = function (callback) {
  this._mainMenuOptions = callback;
};

BotHandler.prototype.onCommand = function (command, arguments, callback) {
  var regex = new RegExp("^\\/" + command + "(?:@\\S+)?" + (arguments ? " ([\\s\\S]+)" : "") + "$", "i");

  this.bot.onText(regex, callback);
};

BotHandler.prototype.sendText = function (chat, text, callback, keyboardKeys) {
  var type = typeof callback;

  delete this._currentHandler[chat.id];
  delete this._currentHandlerList[chat.id];

  if (type === 'object' ) {
    var columns = keyboardKeys;
    var keys = this.arrayToKeyboard(Object.keys(callback), columns);

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
  var text = this._mainMenuText(chat);
  var options = this._mainMenuOptions(chat);

  this.sendText(chat, text, options);
};

BotHandler.prototype.arrayToKeyboard = function(array, columns) {
  if (!columns) {
    columns = 2;
  }
  var result = [];
  var tmp = [];
  var curColumn = 0;

  for (var i = 0; i < array.length; i++) {
    curColumn = i % columns;
    if (curColumn == 0 && i != 0) {
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

const fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');

function isFunction(functionToCheck) {
 var getType = {};
 console.log(functionToCheck);
 console.log(getType.toString.call(functionToCheck));
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var BotHandler = function (tokenFilePath) {
  var token = fs.readFileSync(tokenFilePath, "utf8").trim();
  this.bot = new TelegramBot(token, {polling: true});
  this._currentHandler = {};
  this._currentHandlerList = {};
  var botHandler = this;

  this.bot.onText(/.+/, function(msg) {
    if (botHandler._currentHandler[msg.chat.id]) {
      botHandler._currentHandler[msg.chat.id](msg);
    } else if (botHandler._currentHandlerList[msg.chat.id] && botHandler._currentHandlerList[msg.chat.id][msg.text]) {
      botHandler._currentHandlerList[msg.chat.id][msg.text](msg);
    } else if (botHandler.mainMenu) {
      botHandler.mainMenu(msg.chat);
    } else {
      console.log("unhandled message: " + JSON.stringify(msg));
    }
  });
}

BotHandler.prototype.setMainMenu = function (callback) {
  this.mainMenu = callback;
};

BotHandler.prototype.sendText = function (chat, text, callback, keyboardKeys) {
  var type = typeof callback;

  delete this._currentHandler[chat.id];
  delete this._currentHandlerList[chat.id];

  if (type === 'object' ) {
    var columns = keyboardKeys;

    var keys = this.arrayToKeyboard(Object.keys(callback), columns);
    console.log(keys);

    this._currentHandlerList[chat.id] = callback;
    this.bot.sendMessage(chat.id, text, { reply_markup: JSON.stringify({ keyboard: keys }) });
  } else if (type === 'function' && keyboardKeys) {
    this._currentHandler[chat.id] = callback;
    this.bot.sendMessage(chat.id, text, { reply_markup: JSON.stringify({ keyboard: keyboardKeys }) });
  } else if (type === 'function') {
    this._currentHandler[chat.id] = callback;
    this.bot.sendMessage(chat.id, text, { reply_markup: JSON.stringify({ force_reply: true }) });
  } else {
    this.bot.sendMessage(chat.id, text, { reply_markup: JSON.stringify({ hide_keyboard: true }) });
    if (chat.id > 0) {
      setTimeout(function(botHandler, chat) {
        botHandler.sendMainMenu(chat);
      }, 500, this, chat);
    }
  }
};

BotHandler.prototype.sendMainMenu = function(chat) {
  delete this._currentHandler[chat.id];
  delete this._currentHandlerList[chat.id];
  this.mainMenu(chat);
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
}

module.exports = BotHandler;

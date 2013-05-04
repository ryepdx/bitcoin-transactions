// Generated by CoffeeScript 1.4.0
(function() {
  var bitcoin, config, fromAddress, transaction, transactions, _callback;

  bitcoin = require('bitcoin');

  config = require('./config.json');

  exports.BitcoinClient = new bitcoin.Client(config.host, config.port, config.username, config.password);

  if (require.main === module) {
    if (process.argv.length < 3) {
      console.log("Usage: node send_transactions.js <input file>");
    } else {
      _callback = function(err, txnID) {
        return console.log(txnID);
      };
      transactions = require(process.argv[2]);
      for (fromAddress in transactions) {
        transaction = transactions[fromAddress];
        exports.BitcoinClient.sendRawTransaction(transaction, _callback);
      }
    }
  }

}).call(this);

// Generated by CoffeeScript 1.4.0
(function() {
  var bitcoin, config, fromAddress, fs, lazy, numSignedTransactions, numTransactions, signedTransactions, transaction, transactions, _saveSignedTransaction, _signWithPrivateKey;

  bitcoin = require('bitcoin');

  config = require('./config.json');

  fs = require('fs');

  lazy = require('lazy');

  exports.BitcoinClient = new bitcoin.Client(config.host, config.port, config.username, config.password);

  exports.createTransaction = function(fromAddress, toAddresses, fromTransactions, privKeyCB, txnCB) {
    return exports.BitcoinClient.createRawTransaction(fromTransactions, toAddresses, function(err, txn) {
      if (err) {
        console.log(err);
      }
      return privKeyCB(fromAddress, function(privKey) {
        return exports.BitcoinClient.signRawTransaction(txn, [], [privKey], function(err, signedTxn) {
          if (err) {
            console.log(err);
          }
          return txnCB(signedTxn.hex);
        });
      });
    });
  };

  if (require.main === module) {
    if (process.argv.length < 4) {
      console.log("Usage: node create_transactions.js <input file> <output file>");
    } else {
      signedTransactions = {};
      numSignedTransactions = 0;
      numTransactions = 0;
      _signWithPrivateKey = function(fromAddress, signTxn) {
        return fs.readFile(config.keyDir + fromAddress + '.key', 'utf8', function(err, data) {
          return signTxn(data);
        });
      };
      _saveSignedTransaction = function(fromAddress) {
        return function(signedTxn) {
          numSignedTransactions++;
          signedTransactions[fromAddress] = signedTxn;
          if (numSignedTransactions === numTransactions) {
            return fs.writeFile(process.argv[3], JSON.stringify(signedTransactions));
          }
        };
      };
      transactions = require(process.argv[2]);
      numTransactions = Object.keys(transactions).length;
      for (fromAddress in transactions) {
        transaction = transactions[fromAddress];
        exports.createTransaction(fromAddress, transaction.toAddresses, transaction.fromTransactions, _signWithPrivateKey, _saveSignedTransaction(fromAddress));
      }
    }
  }

}).call(this);

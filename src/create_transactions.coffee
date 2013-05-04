bitcoin = require 'bitcoin'
config = require './config.json'
fs = require 'fs'
lazy = require 'lazy'

exports.BitcoinClient = new bitcoin.Client(config.host, config.port, config.username, config.password)

exports.createTransaction = (fromAddress, toAddresses, fromTransactions,
privKeyCB, txnCB) ->
    # Creates a transaction using the specified transaction JSON and callbacks.
    # txnJSON must have a fromAddress string, a toAddresses array of objects,
    # and a fromTransactions array of transaction IDs.
    exports.BitcoinClient.createRawTransaction(fromTransactions, toAddresses, 
    (err, txn) ->
        if err
            console.log err
            
        # privKeyCB takes a Bitcoin address and a function, then passes the
        # private key corresponding to that address back to the function
        # we passed it.
        privKeyCB fromAddress, (privKey) ->
        
            # Sign the transaction with the private key privKeyCB passed us.
            exports.BitcoinClient.signRawTransaction txn, [], [privKey], (err, signedTxn) ->
                if err
                    console.log err
                    
                # Save the signed transaction.
                txnCB signedTxn.hex
    )
    
# Was this called from the command line?
if require.main == module
    # Were there enough arguments passed?
    # Show useage information if not.
    if process.argv.length < 4
        console.log "Usage: node create_transactions.js <input file> <output file>"
    else
        signedTransactions = {}
        numSignedTransactions = 0
        numTransactions = 0
        
        # Functions to be called from the signing function.
        _signWithPrivateKey = (fromAddress, signTxn) ->
            # Takes a Bitcoin address and calls signTxn with the private key
            # corresponding to that address.
            fs.readFile(config.keyDir + fromAddress + '.key', 'utf8', (err, data) ->
                signTxn data
            )
                
        _saveSignedTransaction = (fromAddress)->
            # Takes a signed transaction and "saves" it in a JSON object for
            # later writing. If this was the last transaction, immediatey
            # writes the JSON file to disk.
            return (signedTxn) ->
                numSignedTransactions++
                signedTransactions[fromAddress] = signedTxn
                
                if numSignedTransactions == numTransactions
                    # Write the transactions JSON file to disk.
                    fs.writeFile process.argv[3], JSON.stringify(signedTransactions)
                
        # Grab each object in the passed-in JSON file and create transactions in the
        # txnDir directory specified in config.json.
        transactions = require process.argv[2]
        numTransactions = Object.keys(transactions).length
        
        for fromAddress, transaction of transactions
            exports.createTransaction(
                fromAddress,
                transaction.toAddresses,
                transaction.fromTransactions,
                _signWithPrivateKey,
                _saveSignedTransaction(fromAddress)
            )

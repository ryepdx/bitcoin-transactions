bitcoin-transactions
====================

Tools for generating offline addresses and transactions using Node.js and shell scripts.

create\_transactions.js
======================
Takes a filename as a command line argument. Creates and signs a raw transaction for every line in the passed-in file, which it then saves to the txnDir specified in config.json. Each line is space-delimited and should be formatted as follows:
\<from address\> \<to address\> \<amount\> \[\<transaction id\> ...\]

The transaction IDs at the end of every line provide the inputs for the transaction. *All* the bitcoin from each transaction listed will be removed from the address corresponding to the private key used to sign the transaction, but only the amount specified by \<amount\> will be sent to the specified address. Any bitcoin remaining in the specified transaction will be released to the network as a transaction fee. (While this is terrible behavior for a general-purpose client, it was perfect for the use case I was addressing.)

The private keys for each \<from address\> must be in the keyDir specified in config.json. Each private key must be contained in a file with a filename formatted like:
\<bitcoin address\>.key

Note for anyone who takes an interest in this abandoned project: this set of scripts should probably be changed to a JSON-based model to allow for greater flexibility. This whitespace-centric approach is an artifact of the original bash script implementation I wrote and does not allow the service using this tool to extract a fee.

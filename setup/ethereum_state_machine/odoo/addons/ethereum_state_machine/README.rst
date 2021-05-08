====================================
Playing with Ethereum Smart Contract
====================================

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta
.. |badge2| image:: https://img.shields.io/badge/licence-AGPL--3-blue.png
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

|badge1| |badge2|

With this module you will be able to check the possibilities offered by the union between Odoo and a SmartContract in Ehtereum

In demo files you have a data to instantiate a Ethereum Smart Contract with an flexible state machine inside and all tricky information filled

**Table of contents**

.. contents::
   :local:

Install
=========

You must install solc binary package.
For ubuntu based::


  sudo add-apt-repository ppa:ethereum/ethereum
  sudo apt-get update
  sudo apt-get install solc


Configure
=========

Go to `Ethereum State Machine -> Settings -> Contracts`

A) Download `this <https://github.com/flachica/ethereum-testing/blob/main/contracts/EthereumStateMachine.sol>`_ and fill `Smart contract source code` field with this file
B) Change state of contract to `Running` state

Go to records of `Referenced Model`. The system auto publish a Smart Contract with this machine state inside

If you need to add a logic of different states, you can add them without having to modify the source code of the smart contract. But make sure the transitions between states are consistent

Roadmap
===========

* Operations on the blockchain network are quite heavy. You have to change the design so as not to make the user wait that long
* Avoid the auto publish Smart Contract. If a record has not published the smart contract, must be showed a button to publish it
* Improve translations
* Correct pre-commit config to allow import web3 without eth_account.messages warning
* Suggest to OCA this project
* And much more . . .

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/account-analytic/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed

Credits
=======

Authors
~~~~~~~

* `Guadaltech <https://guadaltech.es/>`__

  * Fernando La Chica <fernandolachica@gmail.com>

Contributors
~~~~~~~~~~~~

* `Guadaltech <https://guadaltech.es/>`__

  * Fernando La Chica <fernandolachica@gmail.com>

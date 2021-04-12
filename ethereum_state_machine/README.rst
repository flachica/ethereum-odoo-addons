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
For ubuntu based:

sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc

Configure
=========

Go to `Ethereum State Machine -> Settings -> States`

Fill all states as you like (See demo data)

Go to `Ethereum State Machine -> Settings -> Contracts`

Create a Contract with a Root State of State Machine

Don't forget to have metamask installed

Roadmap
===========

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

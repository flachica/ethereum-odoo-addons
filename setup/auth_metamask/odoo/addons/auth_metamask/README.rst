===============================
Auth with Ethereum/MetaMask
===============================

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta
.. |badge2| image:: https://img.shields.io/badge/licence-AGPL--3-blue.png
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

|badge1| |badge2|

With this module you can login to Odoo with Metamask. A method that offers you the following advantages:

* **Increased security**: Proof of ownership by public-key encryption is arguably more secure than proof of ownership by email/password or by a third party—all the more so because MetaMask stores credentials locally on your computer, and not on online servers, which makes the attack surface smaller
* **Simplified UX**: This is a one-click (okay, maybe two-click) login flow, done in a handful of seconds, without the need to type or remember any password
* **Increased privacy**: No email needed, and no third party involved.

This module is based on work of AMAURY MARTINY. See details `here <https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial>`_


**Table of contents**

.. contents::
   :local:

Configure
=========

Go to Settings -> Users & Companies -> Users and fill Public Address field of Blockchain info new page

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

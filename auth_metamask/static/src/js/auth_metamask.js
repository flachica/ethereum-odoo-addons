odoo.define("auth_metamask.client", function(require) {
    "use strict";

    var publicWidget = require("web.public.widget");
    var core = require("web.core");
    var _t = core._t;

    publicWidget.registry.SignUpMetamaskForm = publicWidget.Widget.extend({
        selector: ".oe_login_form",
        events: {
            "click .metamask-login": "_onMetamaskLoginClick",
        },
        start: function() {
            var def = this._super.apply(this, arguments);
            if (!$(".metamask-login").length) {
                this.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("Template does not loaded."),
                    type: "Error",
                    sticky: true,
                });
            }
            return def;
        },
        handleSignMessage: async function(web3, publicAddress, nonce) {
            try {
                const signature = await web3.eth.personal.sign(
                    _t("Please, sign this nonce to allow your login: ") + nonce,
                    publicAddress,
                    ""
                );
                this.displayNotification({
                    title: _t("Signed, waiting response."),
                    message: _t(
                        "You has signed your login info. Waiting response, be patient, please . . ."
                    ),
                    type: "Info",
                    sticky: true,
                });
                return {publicAddress, signature};
            } catch (err) {
                this.displayNotification({
                    title: _t("Something went wrong."),
                    message:
                        _t(
                            "You need to sign the message to be able to log in. Error getted "
                        ) + err,
                    type: "Error",
                    sticky: true,
                });
            }
        },
        _onMetamaskLoginClick: async function() {
            var self = this;
            if (
                typeof window.web3 !== "undefined" &&
                typeof window.web3.currentProvider !== "undefined"
            ) {
                // eslint-disable-next-line
                var web3 = new Web3(window.web3.currentProvider);
            } else {
                // eslint-disable-next-line
                var web3 = new Web3();
            }

            if (!window.ethereum) {
                this.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("Please install MetaMask first."),
                    type: "Error",
                    sticky: true,
                });
                return;
            }

            try {
                // Request account access if needed
                await window.ethereum.enable();

                // eslint-disable-next-line
                web3 = new Web3(window.ethereum);
            } catch (error) {
                this.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("You need to allow MetaMask."),
                    type: "Error",
                    sticky: true,
                });
                return;
            }

            const coinbase = await web3.eth.getCoinbase();
            if (!coinbase) {
                this.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("Please activate MetaMask first."),
                    type: "Error",
                    sticky: true,
                });
                return;
            }

            const publicAddress = coinbase.toLowerCase();
            $.get("/metamask/" + publicAddress, {})
                .then(
                    function(adr_nonce) {
                        var jsonResult = JSON.parse(adr_nonce);
                        return self.handleSignMessage(
                            web3,
                            jsonResult.public_address,
                            jsonResult.nonce
                        );
                    },
                    function(error) {
                        this.displayNotification({
                            title: _t("Something went wrong."),
                            message: error,
                            type: "Error",
                            sticky: true,
                        });
                    }
                )
                .then(function(signed) {
                    var data = {
                        login: signed.publicAddress,
                        password: signed.signature,
                        csrf_token: $("[name='csrf_token']").val(),
                    };
                    $.post($("form").action, data)
                        .then(function() {
                            window.location = "/web";
                        })
                        .fail(function(response) {
                            this.displayNotification({
                                title: _t("Something went wrong."),
                                message: response.responseText,
                                type: "Error",
                                sticky: true,
                            });
                        });
                });
        },
    });
});

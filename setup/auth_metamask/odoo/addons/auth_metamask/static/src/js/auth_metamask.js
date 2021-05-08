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
                    type: "error",
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
                    type: "success",
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
                    type: "error",
                    sticky: true,
                });
            }
        },
        loginFlow: async function(self) {
            if (!self) {
                self = this;
            }
            if (!window.ethereum) {
                self.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("Please install MetaMask first."),
                    type: "error",
                    sticky: false,
                });
                return;
            }
            try {
                // Request account access if needed
                await window.ethereum.enable();

                // eslint-disable-next-line
                web3 = new Web3(window.ethereum);
            } catch (error) {
                self.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("You need to allow MetaMask."),
                    type: "error",
                    sticky: true,
                });
                return;
            }
            // eslint-disable-next-line
            const coinbase = await web3.eth.getCoinbase();
            if (!coinbase) {
                self.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("Please activate MetaMask first."),
                    type: "error",
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
                            // eslint-disable-next-line
                            web3,
                            jsonResult.public_address,
                            jsonResult.nonce
                        );
                    },
                    function(error) {
                        self.displayNotification({
                            title: _t("Something went wrong."),
                            message: error,
                            type: "error",
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
                            self.displayNotification({
                                title: _t("Something went wrong."),
                                message: response.responseText,
                                type: "error",
                                sticky: true,
                            });
                        });
                });
        },
        _onMetamaskLoginClick: async function() {
            var self = this;
            if (!window.ethereum) {
                this.displayNotification({
                    title: _t("Please, trying to connect."),
                    message: _t("MetaMask initialization, be patient."),
                    type: "info",
                    sticky: false,
                });
                window.addEventListener(
                    "ethereum#initialized",
                    function() {
                        self.loginFlow(this);
                    },
                    {once: true}
                );

                // If the event is not dispatched by the end of the timeout,
                // the user probably doesn't have MetaMask installed.
                setTimeout(function() {
                    self.loginFlow(self);
                }, 3000); // 3 seconds

                return;
            }
            this.loginFlow(this);
        },
    });
});

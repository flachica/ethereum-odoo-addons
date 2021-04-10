odoo.define("ethereum_state_machine.client", function(require) {
    "use strict";

    var core = require("web.core");
    var FormController = require("web.FormController");

    var _t = core._t;
    var QWeb = core.qweb;

    FormController.include({
        events: {
            "click .ethereum-button-message": "_onEthereumButtonMessageClick",
        },
        custom_events: _.extend({}, FormController.prototype.custom_events, {
            initMetaMask: "_onInitMetaMask",
            finishInitMetamask: "_onFinishMetaMask",
        }),
        finishInitMetamask: async function(self) {
            if (!self) {
                self = this;
            }
            if (!window.ethereum) {
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
                    message: _t(error),
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

            // Const publicAddress = coinbase.toLowerCase();
            //            self.displayNotification({
            //                title: _t("Public address getted."),
            //                message: _t(publicAddress),
            //                type: "info",
            //                sticky: true,
            //            });
        },
        initMetaMask: function() {
            var self = this;
            if (!window.ethereum) {
                //                Self.displayNotification({
                //                    title: _t("Please, trying to connect."),
                //                    message: _t("MetaMask initialization, be patient."),
                //                    type: "info",
                //                    sticky: false,
                //                });
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
                    self.finishInitMetamask(self);
                }, 3000); // 3 seconds

                return;
            }
            self.finishInitMetamask(this);
        },
        start: function() {
            var self = this;
            return this._super().then(function() {
                if (self.$(".o_statusbar_buttons")) {
                    self.initMetaMask();
                    var metadata = {
                        buttons: [
                            {id: "id1", name: "primero", message: "message1"},
                            {id: "id2", name: "segundo", message: "message2"},
                        ],
                    };
                    var buttonsEthereumMachine = QWeb.render(
                        "state_machine_buttons",
                        metadata
                    );
                    self.$(".o_statusbar_buttons").append(buttonsEthereumMachine);
                }
            });
        },
        _onEthereumButtonMessageClick: function(el) {
            alert(el.currentTarget.attributes.message.nodeValue);
        },
    });
});

odoo.define("ethereum_state_machine.client", function(require) {
    "use strict";

    var core = require("web.core");
    var FormController = require("web.FormController");
    var rpc = require("web.rpc");
    var framework = require("web.framework");

    var _t = core._t;
    var QWeb = core.qweb;

    FormController.include({
        contract_id: 0,
        model_id: 0,
        record_id: 0,
        states: [],
        instance_id: 0,
        contract: [],
        instance: [],
        events: {
            "click .ethereum-button-message": "_onEthereumButtonMessageClick",
        },
        custom_events: _.extend({}, FormController.prototype.custom_events, {
            initMetaMask: "_onInitMetaMask",
            finishInitMetamask: "_onFinishMetaMask",
            onModelGetted: "_onModelGetted",
            onContractGetted: "_onContractGetted",
            renderStateMachine: "_onRederStateMachine",
            fireRender: "_onFireRender",
        }),
        renderStateMachine: async function(self, contract) {
            framework.blockUI();
            try {
                var instance = {};
                self.contract_id = contract[0].id;
                self.record_id = self.model.localData[self.handle].ref;
                self.states = contract[0].state_ids;
                var args = [
                    [
                        ["contract_id", "=", self.contract_id],
                        ["model_id", "=", self.model_id],
                        ["record_index", "=", self.record_id],
                    ],
                ];
                await rpc
                    .query({
                        model: "eth.contract.instance",
                        method: "search_read",
                        args: args,
                    })
                    .then(function(_instance) {
                        instance = _instance;
                    });
                if (!instance.length) {
                    await rpc
                        .query({
                            model: "eth.contract.instance",
                            method: "create",
                            args: [
                                {
                                    contract_id: self.contract_id,
                                    model_id: self.model_id,
                                    record_index: self.record_id,
                                    state_id: contract[0].state_ids[0],
                                },
                            ],
                        })
                        .then(function(_instance_id) {
                            self.instance_id = _instance_id;
                        });
                    args = [[["id", "=", self.instance_id]]];
                    await rpc
                        .query({
                            model: "eth.contract.instance",
                            method: "search_read",
                            args: args,
                        })
                        .then(function(_instance) {
                            instance = _instance;
                        });
                }
                args = [self.contract_id];
                var allStates = new Array(self.states.length);
                await rpc
                    .query({
                        model: "eth.contract",
                        method: "get_transitions",
                        args: args,
                    })
                    .then(function(_transitions) {
                        for (var i = 0; i < self.states.length; i++) {
                            allStates[i] = [];
                        }
                        for (var i = 0; i < self.states.length; i++) {
                            var k = 0;
                            for (var j = 0; j < _transitions.length; j++) {
                                if (_transitions[j][0] == self.states[i]) {
                                    allStates[i][k] = _transitions[j];
                                    k++;
                                }
                            }
                        }
                    });
                var state_sequence = allStates[instance[0].state_sequence];
                var _buttons = new Array();
                for (var i = 0; i < state_sequence.length; i++) {
                    if (state_sequence[i][6])
                        _buttons.push({
                            id: state_sequence[i][3],
                            sequence: state_sequence[i][4],
                            name: state_sequence[i][5],
                            message: "",
                        });
                }
                $(".ethereum-button-message").remove();
                var buttonsEthereumMachine = QWeb.render("state_machine_buttons", {
                    buttons: _buttons,
                });
                self.$(".o_statusbar_buttons").append(buttonsEthereumMachine);
                self.instance = instance[0];
            } catch (exception) {
                self.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t(exception),
                    type: "danger",
                    sticky: false,
                });
            }
            framework.unblockUI();
        },
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
        onContractGetted: function(self, contract) {
            if (contract.length) {
                self.initMetaMask();
                self.renderStateMachine(self, contract);
                self.contract = contract[0];
            }
        },
        onModelGetted: function(model) {
            var self = this;
            if (model.length > 0) {
                self.model_id = model[0].id;
                var args = [[["model_id", "=", self.model_id]]];
                rpc.query({
                    model: "eth.contract",
                    method: "search_read",
                    args: args,
                }).then(function(contract) {
                    self.onContractGetted(self, contract);
                });
            }
        },
        start: function() {
            var self = this;
            return this._super().then(function() {
                if (self.$(".o_statusbar_buttons")) {
                    self.fireRender();
                }
            });
        },
        fireRender: function() {
            var self = this;
            var args = [[["model", "=", self.modelName]]];
            rpc.query({
                model: "ir.model",
                method: "search_read",
                args: args,
            }).then(function(model) {
                self.onModelGetted(model);
            });
        },
        _onEthereumButtonMessageClick: function(el) {
            var self = this;
            rpc.query({
                model: "eth.contract.instance",
                method: "write",
                args: [
                    [this.instance_id],
                    {
                        state_id: el.currentTarget.attributes.deststate.nodeValue,
                    },
                ],
            }).then(function() {
                self.fireRender();
            });
        },
    });
});

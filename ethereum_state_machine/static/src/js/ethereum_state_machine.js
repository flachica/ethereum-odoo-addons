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
        all_data_states: [],
        smartcontract_states: [],
        instance_id: 0,
        contract: [],
        instance: [],
        signerPublicAddress: 0,
        web3: {},
        contractPublicAddress: "",
        gasPrice: "2000000000",
        smartcontract_current_state: 0,
        abi: false,
        bytecode: {},
        events: {
            "click .ethereum-button-message": "_onEthereumButtonMessageClick",
        },
        custom_events: _.extend({}, FormController.prototype.custom_events, {
            getSignerPublicAddress: "_ongetSignerPublicAddress",
            finishGetSignerPublicAddress: "_onfinishGetSignerPublicAddress",
            onModelGetted: "_onModelGetted",
            onContractGetted: "_onContractGetted",
            renderStateMachine: "_onRederStateMachine",
            fireRender: "_onFireRender",
            getSmartcontractCurrentState: "_onGetSmartcontractCurrentState",
        }),
        reload: function(params) {
            this.fireRender();
            if (params && params.controllerState) {
                if (params.controllerState.currentId) {
                    params.currentId = params.controllerState.currentId;
                }
                params.ids = params.controllerState.resIds;
            }
            return this._super.apply(this, arguments);
        },
        getSmartcontractCurrentState: async function() {
            var self = this;
            await self.getSignerPublicAddress();
            await rpc
                .query({
                    model: "eth.contract",
                    method: "get_contract_info",
                    args: [self.contract.id],
                })
                .then(function(contract_info) {
                    self.abi = JSON.parse(JSON.parse(contract_info).abi);
                    self.bytecode = JSON.parse(contract_info).bytecode;
                });
            var smartContract = {};
            if (self.contractPublicAddress == "") {
                var smartContract = new self.web3.eth.Contract(self.abi);
                await smartContract
                    .deploy({
                        data: self.bytecode,
                        arguments: [self.smartcontract_states],
                    })
                    .send({
                        from: self.signerPublicAddress,
                    })
                    .then(function(deployment) {
                        self.contractPublicAddress = deployment.options.address;
                    })
                    .catch(err => {
                        self.displayNotification({
                            title: _t("Something went wrong. Code " + err.code),
                            message: _t(err.message),
                            type: "danger",
                            sticky: true,
                        });
                    });
            }
            smartContract = new self.web3.eth.Contract(
                self.abi,
                self.contractPublicAddress,
                {
                    from: self.signerPublicAddress,
                    gasPrice: self.gasPrice,
                }
            );
            var from_param = {from: self.signerPublicAddress};
            var currentState = 0;
            await smartContract.methods
                .currentState()
                .call(from_param, function(err, res) {
                    if (err) {
                        self.displayNotification({
                            title: _t("Something went wrong. Code " + err.code),
                            message: _t(err.message),
                            type: "danger",
                            sticky: true,
                        });
                    } else {
                        currentState = res;
                    }
                });
            await rpc.query({
                model: "eth.contract.instance",
                method: "save_state_machine",
                args: [self.instance.id, self.contractPublicAddress, currentState],
            });
            self.smartcontract_current_state = currentState;
        },
        renderStateMachine: async function(self, contract) {
            framework.blockUI();
            try {
                var instance = {};
                self.contract_id = contract[0].id;
                self.record_id = self.model.localData[self.handle].data.id;
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
                self.contractPublicAddress = instance[0].public_address;
                args = [self.contract_id];
                self.all_data_states = new Array(self.states.length);
                self.smartcontract_states = new Array(self.states.length);
                await rpc
                    .query({
                        model: "eth.contract",
                        method: "get_transitions",
                        args: args,
                    })
                    .then(function(_transitions) {
                        for (var i = 0; i < self.states.length; i++) {
                            self.all_data_states[i] = [];
                            self.smartcontract_states[i] = [];
                        }
                        for (var i = 0; i < self.states.length; i++) {
                            var k = 0;
                            for (var j = 0; j < _transitions.length; j++) {
                                if (_transitions[j][0] == self.states[i]) {
                                    self.all_data_states[i][k] = _transitions[j];
                                    var int_value = 0;
                                    if (_transitions[j][6]) int_value = 1;
                                    self.smartcontract_states[i][k] = int_value;
                                    k++;
                                }
                            }
                        }
                    });
                self.instance = instance[0];
                await self.getSmartcontractCurrentState();
                var state_sequence =
                    self.all_data_states[self.smartcontract_current_state];
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
        finishGetSignerPublicAddress: async function(self) {
            if (!window.ethereum) {
                return;
            }
            try {
                // Request account access if needed
                await window.ethereum.enable();

                // eslint-disable-next-line
                self.web3 = new Web3(window.ethereum);
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
            const coinbase = await self.web3.eth.getCoinbase();
            if (!coinbase) {
                self.displayNotification({
                    title: _t("Something went wrong."),
                    message: _t("Please activate MetaMask first."),
                    type: "error",
                    sticky: true,
                });
                return;
            }

            self.signerPublicAddress = coinbase.toLowerCase();
        },
        getSignerPublicAddress: async function() {
            var self = this;
            if (!window.ethereum) {
                self.displayNotification({
                    title: _t("Trying to connect."),
                    message: _t("MetaMask initialization, be patient . . ."),
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
                    self.finishGetSignerPublicAddress(self);
                }, 3000); // 3 seconds

                return;
            }
            await self.finishGetSignerPublicAddress(this);
        },
        onContractGetted: function(self, contract) {
            if (contract.length) {
                self.contract = contract[0];
                self.renderStateMachine(self, contract);
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
        start: async function() {
            var self = this;
            var result = await this._super().then(function() {
                if (self.$(".o_statusbar_buttons")) {
                    self.fireRender();
                }
            });
            this.pager.on("pager_changed", this, function() {
                self.fireRender();
            });
            return result;
        },
        fireRender: async function() {
            var self = this;
            var args = [[["model", "=", self.modelName]]];
            await rpc
                .query({
                    model: "ir.model",
                    method: "search_read",
                    args: args,
                })
                .then(function(model) {
                    self.onModelGetted(model);
                });
        },
        _onEthereumButtonMessageClick: async function(el) {
            var self = this;
            framework.blockUI();
            try {
                await self.getSignerPublicAddress();

                var smartContract = new self.web3.eth.Contract(
                    self.abi,
                    self.contractPublicAddress,
                    {
                        from: self.signerPublicAddress,
                        gasPrice: self.gasPrice,
                    }
                );
                var from_param = {from: self.signerPublicAddress};
                var transaction = await smartContract.methods.setState(
                    el.currentTarget.attributes.deststate.nodeValue
                );
                transaction.send(from_param).then(function(receipt) {
                    console.log(receipt);
                });
                self.fireRender();
                self.displayNotification({
                    title: _t("Your transaction has been send to Metamask"),
                    message: _t(
                        "Be patient, if you signed, your transaction must be mined"
                    ),
                    type: "success",
                    sticky: true,
                });
            } catch (exception) {}
            framework.unblockUI();
        },
    });
});

odoo.define("auth_metamask.client", function(require) {
    "use strict";

    require("web.dom_ready");

    if (!$(".metamask-login").length) {
        return Promise.reject("DOM doesn't contain '.js_survey_timer'");
    }

    async function handleSignMessage(web3, publicAddress, nonce) {
        try {
            const signature = await web3.eth.personal.sign(
                "Please, sign this nonce to allow your login: " + nonce,
                publicAddress,
                ""
            );

            return {publicAddress, signature};
        } catch (err) {
            window.alert(
                "You need to sign the message to be able to log in. Error getted " + err
            );
        }
    }

    async function handleClick() {
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
            window.alert("Please install MetaMask first.");
            return;
        }

        try {
            // Request account access if needed
            await window.ethereum.enable();

            // eslint-disable-next-line
            web3 = new Web3(window.ethereum);
        } catch (error) {
            window.alert("You need to allow MetaMask.");
            return;
        }

        const coinbase = await web3.eth.getCoinbase();
        if (!coinbase) {
            window.alert("Please activate MetaMask first.");
            return;
        }

        const publicAddress = coinbase.toLowerCase();
        $.get("/metamask/" + publicAddress, {})
            .then(
                function(adr_nonce) {
                    var jsonResult = JSON.parse(adr_nonce);
                    return handleSignMessage(
                        web3,
                        jsonResult.public_address,
                        jsonResult.nonce
                    );
                },
                function(error) {
                    alert(error);
                }
            )
            .then(function(signed) {
                $("form").attr("autocomplete", "off");
                $("#login").attr("autocomplete", "off");
                $("#password").attr("autocomplete", "off");
                $("#login").val(signed.publicAddress);
                $("#password").val(signed.signature);
                $("button[type=submit]")[0].click();
            });
    }

    $(".metamask-login").click(handleClick);
});

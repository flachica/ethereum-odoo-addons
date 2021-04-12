{
    "name": "Ethereum State Machine",
    "category": "Tools",
    "maintainer": "Fernando La Chica",
    "version": "13.0.0.0.0",
    "depends": ["base", "web", "base_setup", "auth_metamask", "crm"],
    "data": [
        "views/assets.xml",
        "views/eth_state_views.xml",
        "security/ir.model.access.csv",
    ],
    "demo": ["demo/eth_state_machine_demo.xml"],
    "application": True,
    "author": "Fernando La Chica, Guadaltech",
    "license": "AGPL-3",
    "external_dependencies": {"python": ["web3==5.17.0", "py-solc==3.2.0"]},
    "qweb": ["static/src/xml/ethereum_state_machine_templates.xml"],
}

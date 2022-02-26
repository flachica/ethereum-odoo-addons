{
    "name": "Metamask Authentication",
    "category": "Tools",
    "maintainer": "Fernando La Chica",
    "version": "15.0.1.0.0",
    "depends": ["base", "web", "base_setup", "auth_signup"],
    "data": ["views/auth_metamask_templates.xml", "views/res_users.xml"],
    "application": True,
    "author": "Fernando La Chica",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/helpdesk",
    "external_dependencies": {"python": ["web3>=5.17"]},
    "assets": {
        "web.assets_frontend": [
            ("prepend", "auth_metamask/static/src/scss/auth_metamask.scss"),
            ("prepend", "auth_metamask/static/src/js/auth_metamask.js"),
            (
                "prepend",
                "https://cdnjs.cloudflare.com/ajax/libs/web3/1.7.1-rc.0/web3.min.js",
            ),
        ],
    },
}

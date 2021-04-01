{
    "name": "Metamask Authentication",
    "category": "Tools",
    "maintainer": "Fernando La Chica",
    "version": "13.0.0.0.0",
    "depends": ["base", "web", "base_setup", "auth_signup"],
    "data": ["views/auth_metamask_templates.xml", "views/res_users.xml"],
    "application": True,
    "author": "Fernando La Chica, Guadaltech",
    "license": "AGPL-3",
    "external_dependencies": {"python": ["web3==5.17.0"]},
}

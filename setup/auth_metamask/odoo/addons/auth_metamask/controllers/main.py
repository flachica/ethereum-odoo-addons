import json
import logging

from odoo import http
from odoo.http import request

from odoo.addons.web.controllers.main import Home

_logger = logging.getLogger(__name__)


class Metamask(Home):
    @http.route(
        "/metamask/<string:public_address>", type="http", auth="public", website=True
    )
    def user_nonce_by_public_address(self, public_address, **post):
        user_id = (
            request.env["res.users"]
            .sudo()
            .search([("public_address", "=", public_address)])
        )
        result = {
            "public_address": public_address,
            "nonce": user_id.nonce if user_id else None,
        }
        return json.dumps(result, default=str)

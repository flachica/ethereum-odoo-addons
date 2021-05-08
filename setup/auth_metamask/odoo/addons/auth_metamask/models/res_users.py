import logging
import random
from math import floor

from eth_account.messages import defunct_hash_message
from web3.auto import w3

from odoo import SUPERUSER_ID, api, fields, models
from odoo.exceptions import AccessDenied
from odoo.http import request

_logger = logging.getLogger(__name__)


class Users(models.Model):
    _inherit = "res.users"

    def _compute_nonce(self):
        for user_id in self:
            user_id.nonce = floor(random.random() * 1000000)

    nonce = fields.Integer(
        string="Nonce", required=True, compute="_compute_nonce", store=True
    )
    public_address = fields.Char(string="Public Address", required=True, index=True)

    _sql_constraints = [
        (
            "public_address",
            "unique(public_address)",
            "This public address already exist",
        )
    ]

    @api.onchange("public_address")
    def set_upper(self):
        self.public_address = str(self.public_address).lower()
        return

    @classmethod
    def _login(cls, db, login, password):
        if not password:
            raise AccessDenied()
        ip = request.httprequest.environ["REMOTE_ADDR"] if request else "n/a"
        try:
            with cls.pool.cursor() as cr:
                self = api.Environment(cr, SUPERUSER_ID, {})[cls._name]
                with self._assert_can_auth():
                    user = self.search(
                        self._get_login_domain(login),
                        order=self._get_login_order(),
                        limit=1,
                    )
                    if not user:
                        user = self.search(
                            [("public_address", "=", login)],
                            order=self._get_login_order(),
                            limit=1,
                        )
                    if not user:
                        raise AccessDenied()
                    user = user.with_user(user)
                    user._check_credentials(password)
                    user._update_last_login()
        except AccessDenied:
            _logger.info("Login failed for db:%s login:%s from %s", db, login, ip)
            raise

        _logger.info("Login successful for db:%s login:%s from %s", db, login, ip)

        return user.id

    def _check_credentials(self, password):
        try:
            super()._check_credentials(password)
        except AccessDenied:
            _logger.info("Login failed trying with ethereum signed request")
            msg = "Please, sign this nonce to allow your login: " + str(self.nonce)
            message_hash = defunct_hash_message(text=msg)
            signer = w3.eth.account.recoverHash(message_hash, signature=password)
            if self.public_address == signer.lower():
                self._compute_nonce()
                self.flush()
                return True
            else:
                raise

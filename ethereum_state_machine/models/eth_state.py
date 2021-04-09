from odoo import fields, models


class EthStateRel(models.Model):
    # Only to insert demo purpose
    _name = "eth.state.eth.state.rel"

    state_first_id = fields.Many2one(comodel_name="eth.state")
    state_second_id = fields.Many2one(comodel_name="eth.state")


class EthState(models.Model):
    _name = "eth.state"

    name = fields.Char(string="State")
    index = fields.Integer(string="Index")
    next_state_ids = fields.Many2many(
        "eth.state",
        "eth_state_eth_state_rel",
        "state_first_id",
        "state_second_id",
        string="Next states",
    )

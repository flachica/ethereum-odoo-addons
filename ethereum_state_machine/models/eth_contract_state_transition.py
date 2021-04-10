from odoo import fields, models


class EthContractStateTransition(models.Model):
    _name = "eth.contract.state.transition"

    from_state_id = fields.Many2one(
        comodel_name="eth.contract.state", string="From state"
    )
    to_state_id = fields.Many2one(comodel_name="eth.contract.state", string="To state")
    allowed = fields.Boolean(string="Allowed")

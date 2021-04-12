from odoo import fields, models


class EthContractStateTransition(models.Model):
    _name = "eth.contract.state.transition"

    from_state_id = fields.Many2one(
        comodel_name="eth.contract.state", string="From state"
    )
    from_state_name = fields.Char(related="from_state_id.name", store=True)
    from_state_sequence = fields.Integer(related="from_state_id.sequence", store=True)
    to_state_id = fields.Many2one(comodel_name="eth.contract.state", string="To state")
    to_state_name = fields.Char(related="to_state_id.name", store=True)
    to_state_sequence = fields.Integer(related="to_state_id.sequence", store=True)
    allowed = fields.Boolean(string="Allowed")
    contract_id = fields.Many2one(
        comodel_name="eth.contract", related="from_state_id.contract_id", store=True
    )

from odoo import fields, models


class EthContract(models.Model):
    _name = "eth.contract.state"

    contract_id = fields.Many2one(comodel_name="eth.contract")
    name = fields.Char("Name")
    sequence = fields.Integer("Sequence")

    transition_ids = fields.One2many(
        "eth.contract.state.transition", "from_state_id", string="Transitions"
    )

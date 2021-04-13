import logging

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class EthContractInstance(models.Model):
    _name = "eth.contract.instance"

    contract_id = fields.Many2one(comodel_name="eth.contract", required=True)
    model_id = fields.Many2one(
        comodel_name="ir.model", related="contract_id.model_id", store=True
    )
    record_index = fields.Integer("Record id", required=True)
    state_id = fields.Many2one(
        comodel_name="eth.contract.state", string="State", required=True
    )
    state_sequence = fields.Integer("State sequence", related="state_id.sequence")
    public_address = fields.Char("Public address")

    @api.model
    def save_state_machine(self, instance_id, public_address, state_id):
        instance_id = self.browse(int(instance_id))
        new_state_id = instance_id.contract_id.state_ids.filtered(
            lambda s: s.sequence == int(state_id)
        )
        instance_id.state_id = new_state_id
        instance_id.public_address = public_address

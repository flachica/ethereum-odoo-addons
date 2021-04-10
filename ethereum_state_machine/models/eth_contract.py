from odoo import _, fields, models
from odoo.exceptions import ValidationError


class EthContract(models.Model):
    _name = "eth.contract"

    name = fields.Char(string="Contract")
    model_id = fields.Many2one(
        comodel_name="ir.model", string="Referenced Model", required=True
    )
    state = fields.Selection(
        [("draft", "Draft"), ("open", "Running"), ("close", "Expired")],
        string="Status",
        copy=False,
        tracking=True,
        help="Status of the contract",
        default="draft",
    )
    state_ids = fields.One2many(
        "eth.contract.state", "contract_id", string="Contract states"
    )

    def write(self, vals):
        res = super(EthContract, self).write(vals)
        if vals.get("state") == "open":
            self._prepare_and_publish()
        return res

    def _prepare_and_publish(self):
        for contract_id in self:
            if not contract_id.state_ids:
                raise ValidationError(_("You must define states"))
            states_count = len(contract_id.state_ids)
            i = 0
            for state_id in self.env["eth.contract.state"].search(
                [("contract_id", "=", contract_id.id)], order="sequence"
            ):
                if state_id.sequence != i:
                    raise ValidationError(
                        _(
                            "The {} state must have {} as sequence".format(
                                state_id.name, i
                            )
                        )
                    )
                if len(state_id.transition_ids) != states_count - 1:
                    raise ValidationError(
                        _(
                            "You must define {} transitions in {} state".format(
                                states_count - 1, state_id.name
                            )
                        )
                    )
                i += 1
        pass

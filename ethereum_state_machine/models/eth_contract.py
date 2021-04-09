from odoo import fields, models


class EthContract(models.Model):
    _name = "eth.contract"

    name = fields.Char(string="Contract")
    state = fields.Selection(
        [("draft", "Draft"), ("open", "Running"), ("close", "Expired")],
        string="Status",
        copy=False,
        tracking=True,
        help="Status of the contract",
        default="draft",
    )
    state_id = fields.Many2one(comodel_name="eth.state", string="Contract root state")

    def write(self, vals):
        res = super(EthContract, self).write(vals)
        if vals.get("state") == "open":
            self._prepare_and_publish()
        return res

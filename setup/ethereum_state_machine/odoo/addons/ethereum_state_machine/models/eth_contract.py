import base64
import json
import logging

from solc import compile_standard

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


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
    sol_file_name = fields.Char("Smart contract file name")
    sol_file = fields.Binary(string="Smart contract source code")
    bytecode_file_name = fields.Char("Bytecode file name")
    bytecode_file = fields.Binary(string="Bytecode")
    abi_file_name = fields.Char("ABI file name")
    abi_file = fields.Binary(string="ABI")

    def write(self, vals):
        if vals.get("state") == "open":
            self._prepare_and_publish()
        elif vals.get("state"):
            vals["bytecode_file"] = None
            vals["abi_file"] = None
        return super(EthContract, self).write(vals)

    def _compile_contract(self, contract_id):
        compiled_sol = compile_standard(
            {
                "language": "Solidity",
                "sources": {
                    contract_id.sol_file_name: {
                        "content": """
                                 {}
                                 """.format(
                            base64.b64decode(contract_id.sol_file).decode("utf-8")
                        )
                    }
                },
                "settings": {
                    "outputSelection": {
                        "*": {
                            "*": ["metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
                        }
                    }
                },
            },
            bin=True,
            abi=True,
        )
        compiled_info = compiled_sol["contracts"][contract_id.sol_file_name]
        key = list(compiled_info.keys())[0]
        root = compiled_info[key]
        bytecode = root["evm"]["bytecode"]["object"]
        abi = json.loads(root["metadata"])["output"]["abi"]
        return bytecode, abi

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
                if len(state_id.transition_ids) != states_count:
                    raise ValidationError(
                        _(
                            "You must define {} transitions in {} state".format(
                                states_count - 1, state_id.name
                            )
                        )
                    )
                i += 1
            bytecode, abi = self._compile_contract(contract_id)
            contract_id.write(
                {
                    "bytecode_file": base64.b64encode(bytecode.encode("utf-8")),
                    "bytecode_file_name": contract_id.sol_file_name.split(".")[0]
                    + ".bytecode",
                    "abi_file": base64.b64encode(json.dumps(abi).encode("utf-8")),
                    "abi_file_name": contract_id.sol_file_name.split(".")[0] + ".abi",
                }
            )
        pass

    @api.model
    def get_transitions(self, contract_id):
        self.env.cr.execute(
            """ Select from_state_id, from_state_sequence, from_state_name,
                       to_state_id, to_state_sequence, to_state_name, allowed
                       from eth_contract_state_transition
                       where contract_id=%s
                       order by from_state_sequence, to_state_sequence""",
            (contract_id,),
        )
        return self.env.cr.fetchall()

    @api.model
    def get_contract_info(self, contract_id):
        contract_id = self.env["eth.contract"].browse(contract_id)
        abi = None
        bytecode = None
        if contract_id and contract_id.abi_file:
            abi = base64.b64decode(contract_id.abi_file).decode("utf-8")
        if contract_id and contract_id.bytecode_file:
            bytecode = base64.b64decode(contract_id.bytecode_file).decode("utf-8")
        return json.dumps({"abi": abi, "bytecode": bytecode})

import { SFCONSTS } from "../main.js";
import { SFLOCALCONSTS } from "../localconst.js";
import { EncounterUtils5e } from "../dnd5e/EncounterUtils5e.js";
import { EncounterUtilsPf2e } from "../pf2e/EncounterUtilsPf2e.js";
import { FoundryUtils } from "./FoundryUtils.js";

export class EncounterUtils
{
  static isEncounterFormulaPossibleForPlayers(encounterFormula, averageLevelOfPlayers)
  {
    if (FoundryUtils.getSystemId() === "pf2e")
    {
        return EncounterUtilsPf2e.isEncounterFormulaPossibleForPlayers(encounterFormula, averageLevelOfPlayers);
    }
    else if (FoundryUtils.getSystemId() === "dnd5e")
    {
      return EncounterUtils5e.isEncounterFormulaPossibleForPlayers(encounterFormula, averageLevelOfPlayers);
    }
  }

  static getEncounterDescriptionObjects()
  {
    let currentSystem = game.system.id;
		let encounterDescriptionsObject;
		switch (currentSystem)
		{
			case "dnd5e":
				encounterDescriptionsObject = SFLOCALCONSTS.DND5E_ENCOUNTER_TYPE_DESCRIPTIONS;
				break;
			case "pf2e":
				encounterDescriptionsObject = SFLOCALCONSTS.PF2E_ENCOUNTER_TYPE_DESCRIPTIONS;
				break;
		}
    return encounterDescriptionsObject;
  }
}
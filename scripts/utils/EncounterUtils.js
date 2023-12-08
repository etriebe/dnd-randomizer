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
        return EncounterUtilsPf2e.isEncounterFormulaPossibleForPlayers(encounterFormula, averageLevelOfPlayers);
    }
  }
}
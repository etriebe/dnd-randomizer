import { FoundryUtils } from "../utils/FoundryUtils";
import { SFLOCALCONSTS } from "./localconst";
import { SFLocalHelpers } from "./localmodule";
export class EncounterUtilsPf2e
{
    static createEncounterPf2e(monsterList, averageLevelOfPlayers, numberOfPlayers, params)
    {
      let currentEncounter = {};
      currentEncounter["creatures"] = [];
      let currentEncounterXP = 0;
      let numberOfMonstersInCombat = 0;
      let encounterType = params.encounterType;
      let encounterTypeInformation = SFLOCALCONSTS.PF2E_ENCOUNTER_TYPE_DESCRIPTIONS[encounterType];
      let currentEncounterDifficulty = encounterTypeInformation.EncounterDifficulty;
      currentEncounter["difficulty"] = currentEncounterDifficulty;
      let currentEncounterFormula = encounterTypeInformation.EncounterFormula;
      let amountToAdjustEncounter = 0;

      for (var i = 0; i < currentEncounterFormula.length; i++)
      {
        let currentEncounterDescription = currentEncounterFormula[i];
        
        let targetEncounterDifficultyInformation = SFLOCALCONSTS.PATHFINDER_2E_ENCOUNTER_BUDGET[currentEncounterDifficulty];
        let originalTargetEncounterXP = targetEncounterDifficultyInformation[0];
        let characterAdjustment = targetEncounterDifficultyInformation[1];
        amountToAdjustEncounter = (numberOfPlayers - 4) * characterAdjustment;
        let creatureDescriptionParts = currentEncounterDescription.split(":");

        if (creatureDescriptionParts.length != 2)
        {
          console.error(`Encounter type description is invalid. Expected format of number:formula. For example: 2:0.3*x. This would choose 2 creatures that are roughly near 30% of the the target encounter XP. Actual: ${currentEncounterDescription}`);
          return;
        }
        let numberOfCreatures = creatureDescriptionParts[0];
        let levelInRelationToParty = creatureDescriptionParts[1];

        let filteredMonsterList = monsterList.filter(m => FoundryUtils.getDataObjectFromObject(m.actor).details.level.value === parseInt(averageLevelOfPlayers) +  parseInt(levelInRelationToParty));
        if (filteredMonsterList.length === 0)
        {
          continue;
        }

        let randomMonsterIndex = Math.floor((Math.random() * filteredMonsterList.length));
        let randomMonster = filteredMonsterList[randomMonsterIndex];
        let randomMonsterActorObj = randomMonster.actor;
        let monsterName = randomMonster.actorname;
        let randomMonsterLevel = FoundryUtils.getDataObjectFromObject(randomMonsterActorObj).details.level.value;
        let creatureCombatDetails = {};
        creatureCombatDetails["name"] = monsterName;
        creatureCombatDetails["quantity"] = numberOfCreatures;
        creatureCombatDetails["level"] = randomMonsterLevel;
        creatureCombatDetails["combatdata"] = SFLocalHelpers.allMonsters.find(m => m.actorid === randomMonsterActorObj.id || m.actorid === randomMonsterActorObj._id).combatdata;
        currentEncounter["creatures"].push(creatureCombatDetails);
      }

      currentEncounter["level"] = averageLevelOfPlayers;
      let generatedLootObject = EncounterUtilsPf2e.getPF2ELootForEncounter(currentEncounter, params);
      currentEncounter["loot"] = generatedLootObject;
      currentEncounter["amounttoadjustencounter"] = amountToAdjustEncounter;
      return currentEncounter;
    }

    static getPF2ELootForEncounter(currentEncounter, params)
    {
      let loopType = params.loot_type;
      let generatedLoot;
  
      let currencyTable = SFLOCALCONSTS.PF2E_CURRENCY_TABLE;
      let encounterLevel = currentEncounter["level"];
      let encounterDifficulty = currentEncounter["difficulty"];
      let currencyList = currencyTable[encounterLevel];
      let goldPieces = 0;
      switch (encounterDifficulty)
      {
        case "Low":
          goldPieces = currencyList[0];
          break;
        case "Moderate":
          goldPieces = currencyList[1];
          break;
        case "Severe":
          goldPieces = currencyList[2];
          break;
        case "Extreme":
          goldPieces = currencyList[3];
          break;
      }

      let lootResultObject = {};
      let currencyResultObject = {};
      let itemsResultObject = [];
      let otherResultObject = [];
      let scrollsResultObject = [];
      currencyResultObject["pp"] = 0;
      currencyResultObject["gp"] = goldPieces;
      currencyResultObject["ep"] = 0;
      currencyResultObject["sp"] = 0;
      currencyResultObject["cp"] = 0;
      lootResultObject["currency"] = currencyResultObject;
      lootResultObject["items"] = itemsResultObject;
      lootResultObject["other"] = otherResultObject;
      lootResultObject["scrolls"] = scrollsResultObject;
  
      return lootResultObject;
    }

    static getAdjustedXPString(amountToAdjustEncounter)
    {
      let plusOrMinus = amountToAdjustEncounter > 0 ? "+" : "";
      return `Needs ${plusOrMinus}${amountToAdjustEncounter} XP adjustment`;
    }
}
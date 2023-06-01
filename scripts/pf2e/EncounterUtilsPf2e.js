import { FoundryUtils } from "../utils/FoundryUtils.js";
import { SFLOCALCONSTS } from "../localconst.js";
import { SFLocalHelpers } from "../localmodule.js";
export class EncounterUtilsPf2e
{
    static async createEncounterPf2e(monsterList, itemList, averageLevelOfPlayers, numberOfPlayers, params)
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
        creatureCombatDetails["actorid"] = randomMonster.actorid;
        creatureCombatDetails["compendiumname"] = randomMonster.compendiumname;
        creatureCombatDetails["quantity"] = numberOfCreatures;
        creatureCombatDetails["level"] = randomMonsterLevel;
        currentEncounter["creatures"].push(creatureCombatDetails);
      }

      currentEncounter["level"] = averageLevelOfPlayers;
      let generatedLootObject = EncounterUtilsPf2e.getPF2ELootForEncounter(currentEncounter, itemList, params);
      currentEncounter["loot"] = generatedLootObject;
      currentEncounter["amounttoadjustencounter"] = amountToAdjustEncounter;
      return currentEncounter;
    }

    static getPF2ELootForEncounter(currentEncounter, itemList, params)
    {
      let lootType = params.loot_type;
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
      let itemsResultObject = EncounterUtilsPf2e.getPF2EItemLootForEncounter(itemList, goldPieces, encounterLevel, lootType);

      currencyResultObject["pp"] = 0;
      currencyResultObject["gp"] = goldPieces;
      currencyResultObject["sp"] = 0;
      currencyResultObject["cp"] = 0;

      for (let item of itemsResultObject)
      {
        currencyResultObject = EncounterUtilsPf2e.subtractCurrencyAmount(currencyResultObject, item.object.itemcost);
      }

      let otherResultObject = [];
      let scrollsResultObject = [];
      lootResultObject["currency"] = currencyResultObject;
      lootResultObject["items"] = itemsResultObject;
      lootResultObject["other"] = otherResultObject;
      lootResultObject["scrolls"] = scrollsResultObject;
      return lootResultObject;
    }

    static subtractCurrencyAmount(currencyObject, subtractionAmount)
    {
      let currentAmountTotal = EncounterUtilsPf2e.getTotalGoldCostFromCostObject(currencyObject);
      let subtractionAmountTotal = EncounterUtilsPf2e.getTotalGoldCostFromCostObject(subtractionAmount);

      if (subtractionAmountTotal > currentAmountTotal)
      {
        throw new Error(`Subtraction amount ${subtractionAmountTotal} was larger than total amount ${currentAmountTotal}`);
      }

      let leftOverCurerncy = currentAmountTotal - subtractionAmountTotal;

      let currencyResultObject = {};
      currencyResultObject["pp"] = 0;
      currencyResultObject["gp"] = leftOverCurerncy - leftOverCurerncy % 1;
      leftOverCurerncy -= currencyResultObject["gp"];
      leftOverCurerncy *= 10;
      currencyResultObject["sp"] = leftOverCurerncy - leftOverCurerncy % 1;
      leftOverCurerncy -= currencyResultObject["sp"];
      leftOverCurerncy *= 10;
      currencyResultObject["cp"] = leftOverCurerncy - leftOverCurerncy % 1;
      return currencyResultObject;
    }

    static getPF2EItemLootForEncounter(itemList, goldPieces, encounterLevel, lootType)
    {
      let itemsResultObject = [];
      let itemCount = 0;
      let goldPiecesLeft = goldPieces;
      if (lootType === "Individual Treasure")
      {
        itemCount = 1;
      }
      else
      {
        itemCount = FoundryUtils.getRollResult("2d4");
      }

      for (let i = 0; i < itemCount; i++)
      {
        // Leave at least 10 gp left
        if (goldPiecesLeft < 10)
        {
          break;
        }

        let j = 0;
        while (j < 50) // attempt to put in 50 items before giving up so we don't spin forever
        {
          j++;
          let randomItemIndex = Math.floor((Math.random() * itemList.length));
          let randomItemObject = itemList[randomItemIndex];
          let itemType = randomItemObject.itemtype;
          let itemLevel = randomItemObject.level;
          let itemCost = randomItemObject.itemcost;
          let itemName = randomItemObject.itemname;
          let item = randomItemObject.item;

          let totalGoldCost = EncounterUtilsPf2e.getTotalGoldCostFromCostObject(itemCost.value);

          if (totalGoldCost === 0)
          {
            // ignore treasure with 0 cost
            continue;
          }

          if (totalGoldCost <= goldPiecesLeft)
          {
            if (itemType === "consumable" && encounterLevel < itemLevel)
            {
              continue;
            }

            goldPiecesLeft = goldPiecesLeft - totalGoldCost;

            let currentObjectDictionary = {};
            currentObjectDictionary.quantity = 1;
            currentObjectDictionary.name = itemName;
            currentObjectDictionary.object = randomItemObject;
            itemsResultObject.push(currentObjectDictionary);
            break;
          }
        }
      }
      return itemsResultObject;
    }

    static getTotalGoldCostFromCostObject(costObject)
    {
      let totalGoldCost = 0;
      totalGoldCost += parseInt(costObject.pp ?? 0) * 10;
      totalGoldCost += parseInt(costObject.gp ?? 0);
      totalGoldCost += parseInt(costObject.sp ?? 0) * 0.1;
      totalGoldCost += parseInt(costObject.cp ?? 0) * 0.01;
      return totalGoldCost;
    }

    static getAdjustedXPString(amountToAdjustEncounter)
    {
      let plusOrMinus = amountToAdjustEncounter > 0 ? "+" : "";
      return `Needs ${plusOrMinus}${amountToAdjustEncounter} XP adjustment`;
    }
}
import { FoundryUtils } from "../utils/FoundryUtils.js";
import { SFLOCALCONSTS } from "../localconst.js";
import { SFLocalHelpers } from "../localmodule.js";
export class EncounterUtils5e
{
  static createEncounterDnd5e(targetedDifficulty, monsterList, averageLevelOfPlayers, numberOfPlayers, params)
  {
    let currentEncounter = {};
    currentEncounter["difficulty"] = targetedDifficulty;
    currentEncounter["creatures"] = [];
    let targetEncounterXP = SFLOCALCONSTS.ENCOUNTER_DIFFICULTY_XP_TABLES[targetedDifficulty][averageLevelOfPlayers - 1] * numberOfPlayers;
    let currentEncounterXP = 0;
    let numberOfMonstersInCombat = 0;
    let encounterType = params.encounterType;
    let encounterTypeInformation = SFLOCALCONSTS.DND5E_ENCOUNTER_TYPE_DESCRIPTIONS[encounterType];
    if (encounterType === "Random")
    {
      let j = 0;
      while (j < 50) // attempt to put in 50 monsters before giving up so we don't spin forever
      {
        j++;
        let randomMonsterIndex = Math.floor((Math.random() * monsterList.length));
        let randomMonsterObject = monsterList[randomMonsterIndex];
        let randomMonster = randomMonsterObject.actor;
        let randomMonsterActorId = randomMonster.actor.id ?? randomMonster.actor._id;
        let randomMonsterData = FoundryUtils.getDataObjectFromObject(randomMonster);
        let monsterName;

        try
        {
          monsterName = randomMonster.name;
          if (!randomMonsterData)
          {
            console.warn(`Monster chosen ${randomMonster.name} didn't have a valid data property.`);
            continue;
          }

          let randomMonsterXP = FoundryUtils.getDataObjectFromObject(randomMonster).details.xp.value;
          let currentEncounterXPMultiplier = EncounterUtils5e.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat);
          let monsterCR = FoundryUtils.getDataObjectFromObject(randomMonster).details.cr;
          let currentEncounterAdjustedXP = EncounterUtils5e.getAdjustedXPOfEncounter(currentEncounter);

          // If we're within 10% of budget, let's stop
          if (currentEncounterAdjustedXP > targetEncounterXP * 0.9)
          {
            break;
          }

          let nextEncounterXPMultiplier = EncounterUtils5e.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat + 1);

          // If adding a single extra creature with no added XP boosts us over the XP target, just exit now.
          if (currentEncounterXP * nextEncounterXPMultiplier > targetEncounterXP)
          {
            break;
          }

          if (!randomMonsterXP)
          {
            continue;
          }

          if (!monsterCR || monsterCR == 0)
          {
            // Boring monster
            continue;
          }

          let numberOfMonstersAllowedInCombat = EncounterUtils5e.getNumberOfMonstersAllowedInCombat(currentEncounter, monsterList, targetEncounterXP, randomMonster);

          if (numberOfMonstersAllowedInCombat == 0)
          {
            console.log(`Monster: ${monsterName}, XP: ${randomMonsterXP}, CR: ${monsterCR} too dangerous`);
            continue;
          }

          if (numberOfMonstersAllowedInCombat > 20)
          {
            console.log(`Monster: ${monsterName}, XP: ${randomMonsterXP}, CR: ${monsterCR} too weak to be interesting in combat...`);
            continue;
          }

          // Choose a random number of creatures to put in combat based on the max allowed number but put a maximum of 10 in combat
          let numberOfMonstersToPutInCombat = Math.min(Math.floor((Math.random() * numberOfMonstersAllowedInCombat)) + 1, 10);
          let creatureCombatDetails = {};
          creatureCombatDetails["name"] = monsterName;
          creatureCombatDetails["quantity"] = numberOfMonstersToPutInCombat;
          creatureCombatDetails["cr"] = monsterCR;
          creatureCombatDetails["xp"] = randomMonsterXP;
          creatureCombatDetails["combatdata"] = SFLocalHelpers.allMonsters.find(m => ((randomMonster.actorid != null || randomMonster.actorid) != undefined && m.actorid === randomMonster.actorid) || (m.actor.actor.id === randomMonsterActorId)).combatdata;
          currentEncounter["creatures"].push(creatureCombatDetails);
          numberOfMonstersInCombat += numberOfMonstersToPutInCombat;
          currentEncounterXP += randomMonsterXP * numberOfMonstersToPutInCombat;
        }
        catch (error)
        {
          console.warn(`Failed to correctly add a random monster to the encounter. randomMonsterIndex: ${randomMonsterIndex}, monster name: ${monsterName}, Error: ${error}`);
          console.warn(error.stack);
        }
      }
    }
    else
    {
      for (var i = 0; i < encounterTypeInformation.length; i++)
      {
        let currentEncounterDescription = encounterTypeInformation[i];
        let creatureDescriptionParts = currentEncounterDescription.split(":");

        if (creatureDescriptionParts.length != 2)
        {
          console.error(`Encounter type description is invalid. Expected format of number:formula. For example: 2:0.3*x. This would choose 2 creatures that are roughly near 30% of the the target encounter XP. Actual: ${currentEncounterDescription}`);
          return;
        }
        let numberOfCreatures = creatureDescriptionParts[0];
        let formula = creatureDescriptionParts[1];
        let formulaMatch = formula.match(/(?<multiplier>(\d+)?\.?\d+)\*x/i);

        if (!formulaMatch)
        {
          console.error(`Encounter formula is invalid. Expected format of formula: 2:0.3*x. This would choose a creatures that is roughly near 30% of the the target encounter XP.`);
          return;
        }
        let formulaMatchGroups = formulaMatch.groups;
        let multiplierAmount = formulaMatchGroups.multiplier;

        if (!multiplierAmount)
        {
          multiplierAmount = 1;
        }

        // Have ever exanding wiggle roomsto find more nad more monsters. 
        let wiggleRoomAmounts = [0.1, 0.2, 0.3];

        for (var j = 0; j < wiggleRoomAmounts.length; j++)
        {
          let wiggleRoom = wiggleRoomAmounts[j];
          let lowerBound = multiplierAmount * targetEncounterXP * (1 - wiggleRoom);
          let upperBound = multiplierAmount * targetEncounterXP * (1 + wiggleRoom);
          let filteredMonsterList = monsterList.filter(m => m.actorxp >= lowerBound && m.actorxp <= upperBound);
          if (filteredMonsterList.length === 0)
          {
            continue;
          }

          let randomMonsterIndex = Math.floor((Math.random() * filteredMonsterList.length));
          let randomMonster = filteredMonsterList[randomMonsterIndex];
          let randomMonsterActorId = randomMonster.actor.id ?? randomMonster.actor._id;
          let monsterName = randomMonster.actorname;
          let randomMonsterXP = randomMonster.actorxp;
          let monsterCR = randomMonster.actorcr;
          let creatureCombatDetails = {};
          creatureCombatDetails["name"] = monsterName;
          creatureCombatDetails["quantity"] = numberOfCreatures;
          creatureCombatDetails["cr"] = monsterCR;
          creatureCombatDetails["xp"] = randomMonsterXP;
          creatureCombatDetails["combatdata"] = SFLocalHelpers.allMonsters.find(m => (randomMonster.actorid != null && randomMonster.actorid != undefined && m.actorid === randomMonster.actorid) || (m.actor.actor.id === randomMonsterActorId)).combatdata;
          currentEncounter["creatures"].push(creatureCombatDetails);
          break;
        }
      }
    }

    currentEncounter["xp"] = EncounterUtils5e.getAdjustedXPOfEncounter(currentEncounter);
    let generatedLootObject = EncounterUtils5e.getLootForEncounter(currentEncounter, params);
    currentEncounter["loot"] = generatedLootObject;
    return currentEncounter;
  }

  static getNumberOfMonstersAllowedInCombat(currentEncounter, fullMonsterList, targetEncounterXP, newMonster)
  {
    let currentEncounterMonsterCount = 0;
    let currentEncounterXP = 0;
    let newMonsterXP = FoundryUtils.getDataObjectFromObject(newMonster).details.xp.value;
    if (currentEncounter["creatures"].length > 0)
    {
      for (const monsterIndex in currentEncounter["creatures"])
      {
        let monsterDetails = currentEncounter["creatures"][monsterIndex];
        let monsterName = monsterDetails.name;
        let monsterCount = monsterDetails.quantity;
        let monsterXP = monsterDetails.xp;
        if (!monsterName || !monsterCount || !monsterXP)
        {
          // Encountered the end of the list. For some reason we get an empty iterator here at the end. 
          break;
        }
        currentEncounterMonsterCount += monsterCount;
        currentEncounterXP += monsterXP * monsterCount;
      }
    }

    let currentEncounterXPMultiplier = EncounterUtils5e.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
    let numberOfNewMonstersAllowed = 0;
    while (true)
    {
      // figure out what our new encounter XP would be if we add another creature
      let newMonsterEncounterXPMultiplier = EncounterUtils5e.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount + numberOfNewMonstersAllowed + 1);
      let newEncounterAdjustedXP = (currentEncounterXP + (numberOfNewMonstersAllowed + 1) * newMonsterXP) * newMonsterEncounterXPMultiplier;

      // if it breaches the threshold our encounter is now too deadly
      if (newEncounterAdjustedXP > targetEncounterXP)
      {
        break;
      }
      numberOfNewMonstersAllowed++;
    }

    return numberOfNewMonstersAllowed;
  }

  static getAdjustedXPOfEncounter(currentEncounter)
  {
    let currentEncounterMonsterCount = 0;
    let currentEncounterXP = 0;
    if (currentEncounter["creatures"].length > 0)
    {
      for (const monsterIndex in currentEncounter["creatures"])
      {
        let monsterDetails = currentEncounter["creatures"][monsterIndex];
        let monsterName = monsterDetails.name;
        let monsterCount = monsterDetails.quantity;
        let monsterXP = monsterDetails.xp;
        if (!monsterName || !monsterCount || !monsterXP)
        {
          // Encountered the end of the list. For some reason we get an empty iterator here at the end. 
          break;
        }
        currentEncounterMonsterCount += monsterCount;
        currentEncounterXP += monsterXP * monsterCount;
      }
    }

    let currentEncounterXPMultiplier = EncounterUtils5e.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
    return currentEncounterXPMultiplier * currentEncounterXP;
  }

  static getCurrentEncounterXPMultiplier(monsterCount)
  {
    let latestEncounterMultiplier;
    for (let key in SFLOCALCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS)
    {
      let value = SFLOCALCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS[key];
      latestEncounterMultiplier = value;
      if (monsterCount <= key)
      {
        return value;
      }
    }
    return latestEncounterMultiplier;
  }

  static getLootForEncounter(currentEncounter, params)
  {
    let loopType = params.loot_type;
    let generatedLoot;

    if (loopType === "Individual Treasure")
    {
      generatedLoot = EncounterUtils5e.getIndividualTreasureForEncounter(currentEncounter);
    }
    else
    {
      generatedLoot = EncounterUtils5e.getTreasureHordeForEncounter(currentEncounter);
    }

    return generatedLoot;
  }

  static getIndividualTreasureForEncounter(currentEncounter)
  {
    let creatures = currentEncounter["creatures"];
    let lootResultObject = {};
    let currencyResultObject = {};
    let itemsResultObject = [];
    let otherResultObject = [];
    let scrollsResultObject = [];
    currencyResultObject["pp"] = 0;
    currencyResultObject["gp"] = 0;
    currencyResultObject["ep"] = 0;
    currencyResultObject["sp"] = 0;
    currencyResultObject["cp"] = 0;

    if (currentEncounter["creatures"].length > 0)
    {
      for (const monsterIndex in currentEncounter["creatures"])
      {
        let monsterDetails = currentEncounter["creatures"][monsterIndex];
        let monsterName = monsterDetails.name;
        let monsterCount = monsterDetails.quantity;
        let monsterXP = monsterDetails.xp;
        let monsterCR = monsterDetails.cr;
        if (!monsterName || !monsterCount || !monsterXP || !monsterCR)
        {
          // Encountered the end of the list. For some reason we get an empty iterator here at the end. 
          break;
        }

        for (let i = 0; i < monsterCount; i++)
        {
          let d100Roll = FoundryUtils.getRollResult("1d100");

          let individualTreasureRowContents;
          if (monsterCR <= 4)
          {
            individualTreasureRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR4, d100Roll);
          }
          else if (monsterCR <= 10)
          {
            individualTreasureRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR10, d100Roll);
          }
          else if (monsterCR <= 16)
          {
            individualTreasureRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR16, d100Roll);
          }
          else
          {
            individualTreasureRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR17_PLUS, d100Roll);
          }

          currencyResultObject["cp"] += EncounterUtils5e.getCoinsResultFromRollTable(individualTreasureRowContents[0]);
          currencyResultObject["sp"] += EncounterUtils5e.getCoinsResultFromRollTable(individualTreasureRowContents[1]);
          currencyResultObject["ep"] += EncounterUtils5e.getCoinsResultFromRollTable(individualTreasureRowContents[2]);
          currencyResultObject["gp"] += EncounterUtils5e.getCoinsResultFromRollTable(individualTreasureRowContents[3]);
          currencyResultObject["pp"] += EncounterUtils5e.getCoinsResultFromRollTable(individualTreasureRowContents[4]);
        }
      }
    }

    lootResultObject["currency"] = currencyResultObject;
    lootResultObject["items"] = itemsResultObject;
    lootResultObject["other"] = otherResultObject;
    lootResultObject["scrolls"] = scrollsResultObject;
    return lootResultObject;
  }

  static getTreasureHordeForEncounter(currentEncounter)
  {
    let creatures = currentEncounter["creatures"];
    let lootResultObject = {};
    let currencyResultObject = {};
    let itemsResultObject = [];
    let otherResultObject = [];
    let scrollsResultObject = [];
    currencyResultObject["pp"] = 0;
    currencyResultObject["gp"] = 0;
    currencyResultObject["ep"] = 0;
    currencyResultObject["sp"] = 0;
    currencyResultObject["cp"] = 0;

    if (creatures.length > 0)
    {
      let maximumCRFromGroup = 0;
      for (const monsterIndex in creatures)
      {
        let monsterDetails = creatures[monsterIndex];
        let monsterName = monsterDetails.name;
        let monsterCount = monsterDetails.quantity;
        let monsterXP = monsterDetails.xp;
        let monsterCR = monsterDetails.cr;
        if (!monsterName || !monsterCount || !monsterXP || !monsterCR)
        {
          // Encountered the end of the list. For some reason we get an empty iterator here at the end. 
          break;
        }
        maximumCRFromGroup = Math.max(maximumCRFromGroup, monsterCR);
      }

      let d100Roll = FoundryUtils.getRollResult("1d100");

      let treasureHordeRowContents;
      if (maximumCRFromGroup <= 4)
      {
        currencyResultObject["cp"] += FoundryUtils.getRollResult("6d6") * 100;
        currencyResultObject["sp"] += FoundryUtils.getRollResult("3d6") * 100;
        currencyResultObject["gp"] += FoundryUtils.getRollResult("2d6") * 10;
        treasureHordeRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR4, d100Roll);
      }
      else if (maximumCRFromGroup <= 10)
      {
        currencyResultObject["cp"] += FoundryUtils.getRollResult("2d6") * 100;
        currencyResultObject["sp"] += FoundryUtils.getRollResult("2d6") * 1000;
        currencyResultObject["gp"] += FoundryUtils.getRollResult("6d6") * 100;
        currencyResultObject["pp"] += FoundryUtils.getRollResult("3d6") * 10;
        treasureHordeRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR10, d100Roll);
      }
      else if (maximumCRFromGroup <= 16)
      {
        currencyResultObject["gp"] += FoundryUtils.getRollResult("4d6") * 1000;
        currencyResultObject["pp"] += FoundryUtils.getRollResult("5d6") * 100;
        treasureHordeRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR16, d100Roll);
      }
      else
      {
        currencyResultObject["gp"] += FoundryUtils.getRollResult("12d6") * 1000;
        currencyResultObject["pp"] += FoundryUtils.getRollResult("8d6") * 1000;
        treasureHordeRowContents = FoundryUtils.getResultFromRollTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR17_PLUS, d100Roll);
      }

      try
      {
        let gemOrArtRowContents = treasureHordeRowContents[0];
        otherResultObject = EncounterUtils5e.getArtOrGemsResult(gemOrArtRowContents);
        let magicItemsRowContents = treasureHordeRowContents[1];
        itemsResultObject = EncounterUtils5e.getMagicItemResult(magicItemsRowContents);
      }
      catch (error)
      {
        console.error(`Unable to generate Treasure Horde for maximum CR ${maximumCRFromGroup} and d100 roll of ${d100Roll}. Error: ${error}`);
        console.error(error.stack);
      }
    }

    lootResultObject["currency"] = currencyResultObject;
    lootResultObject["items"] = itemsResultObject;
    lootResultObject["other"] = otherResultObject;
    lootResultObject["scrolls"] = scrollsResultObject;
    return lootResultObject;
  }

  static getCoinsResultFromRollTable(treasureRowDescription)
  {
    let matchResult = treasureRowDescription.match(/(?<rollDescription>\dd\d)( x (?<multiplierAmount>\d+))?/);
    if (!matchResult)
    {
      return 0;
    }
    let matchResultGroups = matchResult.groups;
    let multiplierAmount = matchResultGroups.multiplierAmount || 1;
    let rollResult = FoundryUtils.getRollResult(matchResultGroups.rollDescription);
    let totalCoins = rollResult * multiplierAmount;
    return totalCoins;
  }

  static getMagicItemResult(rowContents)
  {
    let matches = [...rowContents.matchAll(/(?<rollDescription>(?<numberOfDice>\d+)d(?<diceType>\d+)) (times)? ? on Magic Item Table (?<tableLetter>\w)/g)];
    let magicItemResultObject = [];
    let magicItemTrackerDictionary = {};

    for (let i = 0; i < matches.length; i++)
    {
      let matchResult = matches[0];
      let matchResultGroups = matchResult.groups;
      let rollDescription = matchResultGroups.rollDescription;

      let rollResult = FoundryUtils.getRollResult(rollDescription);
      let rollTableToUse = EncounterUtils5e.getMagicItemTable(matchResultGroups);
      for (let i = 0; i < rollResult; i++)
      {
        let magicItemResult = FoundryUtils.getRandomItemFromRollTable(rollTableToUse);
        if (magicItemResult === "Figurine of wondrous power (roll d8)")
        {
          magicItemResult = FoundryUtils.getRandomItemFromRollTable(SFLOCALCONSTS.MAGIC_ITEM_FIGURINE_OF_WONDEROUS_POWER_TABLE);
        }
        else if (magicItemResult === "Magic armor (roll d12)")
        {
          magicItemResult = FoundryUtils.getRandomItemFromRollTable(SFLOCALCONSTS.MAGIC_ITEM_MAGIC_ARMOR_TABLE);
        }
        else if (magicItemResult.indexOf("Spell scroll") > -1)
        {
          let spellScrollMatch = magicItemResult.match(/Spell scroll \((?<fullSpellDescription>(?<spellLevel>\d+)(st|nd|rd|th) level|cantrip)\)/);
          if (spellScrollMatch)
          {
            let spellLevelToGet = spellScrollMatch.groups.fullSpellDescription.toLowerCase();
            let randomSpellChosen = FoundryUtils.getRandomItemFromRollTable(SFLocalHelpers.spellsByLevel[spellLevelToGet]);
            magicItemResult = randomSpellChosen;
          }
        }

        // increment dictionary value
        magicItemTrackerDictionary[magicItemResult] = (magicItemTrackerDictionary[magicItemResult] || 0) + 1;
      }

      for (let objectName in magicItemTrackerDictionary)
      {
        let countOfObjects = magicItemTrackerDictionary[objectName];

        if (!countOfObjects)
        {
          break;
        }

        let currentObjectDictionary = {};
        currentObjectDictionary.quantity = countOfObjects;
        currentObjectDictionary.name = objectName;
        magicItemResultObject.push(currentObjectDictionary);
      }
    }

    return magicItemResultObject;
  }

  static getArtOrGemsResult(rowContents)
  {
    let gemOrArtResultObject = [];
    let gemOrArtTrackerDictionary = {};
    let matchResult = rowContents.match(/(?<rollDescription>(?<numberOfDice>\d+)d(?<diceType>\d+)) (?<gemOrArtCost>\d+) gp (?<gemsOrArt>gems|art objects)/);
    if (!matchResult)
    {
      return gemOrArtResultObject;
    }
    let matchResultGroups = matchResult.groups;
    let rollDescription = matchResultGroups.rollDescription;

    let rollResult = FoundryUtils.getRollResult(rollDescription);
    let rollTableToUse = EncounterUtils5e.getArtOrGemsTable(matchResultGroups);


    for (let i = 0; i < rollResult; i++)
    {
      let gemOrArtResult = FoundryUtils.getRandomItemFromRollTable(rollTableToUse);

      // increment dictionary value
      gemOrArtTrackerDictionary[gemOrArtResult] = (gemOrArtTrackerDictionary[gemOrArtResult] || 0) + 1;
    }

    for (let objectName in gemOrArtTrackerDictionary)
    {
      let countOfObjects = gemOrArtTrackerDictionary[objectName];

      if (!countOfObjects)
      {
        break;
      }

      let currentObjectDictionary = {};
      currentObjectDictionary.quantity = countOfObjects;
      currentObjectDictionary.name = objectName + ` (${matchResultGroups.gemOrArtCost} gp)`;
      gemOrArtResultObject.push(currentObjectDictionary);
    }

    return gemOrArtResultObject;
  }

  static getMagicItemTable(regexMatchResultGroups)
  {
    switch (regexMatchResultGroups.tableLetter)
    {
      case "A":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_A;
      case "B":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_B;
      case "C":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_C;
      case "D":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_D;
      case "E":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_E;
      case "F":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_F;
      case "G":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_G;
      case "H":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_H;
      case "I":
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_I;
      default:
        return SFLOCALCONSTS.MAGIC_ITEM_TABLE_A;
    }
  }

  static getArtOrGemsTable(regexMatchResultGroups)
  {
    if (regexMatchResultGroups.gemsOrArt === "gems")
    {
      switch (regexMatchResultGroups.gemOrArtCost)
      {
        case 10:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_10GP_GEMSTONES;
        case 50:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_50GP_GEMSTONES;
        case 100:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_100GP_GEMSTONES;
        case 500:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_500GP_GEMSTONES;
        case 1000:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_1000GP_GEMSTONES;
        case 5000:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_5000GP_GEMSTONES;
        default:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_10GP_GEMSTONES;
      }
    }
    else
    {
      switch (regexMatchResultGroups.gemOrArtCost)
      {
        case 25:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_25GP_ART_OBJECTS;
        case 250:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_250GP_ART_OBJECTS;
        case 750:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_750GP_ART_OBJECTS;
        case 2500:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_2500GP_ART_OBJECTS;
        case 7500:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_7500GP_ART_OBJECTS;
        default:
          return SFLOCALCONSTS.ENCOUNTER_TREASURE_25GP_ART_OBJECTS;
      }
    }
  }
}
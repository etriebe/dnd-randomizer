class SFHelpers {
  static allMonsters = {};
  static allSpells = {};
  static spellsByLevel = {};
  static monstersByEnvironment = {};
  static dictionariesInitialized = false;
  static dictionariesPopulated = false;

  static getFolder(type) {
    return game.settings.get(SFCONSTS.MODULE_NAME, `${type}Folder`);
  }

  static initializeDictionaries() {
    SFCONSTS.GEN_OPT.environment.forEach((env) => {
      this.monstersByEnvironment[env] = [];
    });
    this.monstersByEnvironment["Any"] = [];
    this.dictionariesInitialized = true;
    this.spellsByLevel["cantrip"] = [];
    this.spellsByLevel["1st level"] = [];
    this.spellsByLevel["2nd level"] = [];
    this.spellsByLevel["3rd level"] = [];
    this.spellsByLevel["4th level"] = [];
    this.spellsByLevel["5th level"] = [];
    this.spellsByLevel["6th level"] = [];
    this.spellsByLevel["7th level"] = [];
    this.spellsByLevel["8th level"] = [];
    this.spellsByLevel["9th level"] = [];
  }

  static async populateObjectsFromCompendiums() {
    if (!this.dictionariesInitialized)
    {
      this.initializeDictionaries();
    }
    if (!this.dictionariesPopulated)
    {
      let promises = [];
      promises.push(this.populateItemsFromCompendiums());
      promises.push(this.populateMonstersFromCompendiums());
      await Promise.all(promises);
      this.dictionariesPopulated = true;
    }
  }

  static async populateItemsFromCompendiums()
  {
    let filteredCompendiums = game.packs.filter((p) => p.metadata.type === "Item");

    for (let compendium of filteredCompendiums) {
      if (!compendium)
      {
        break;
      }

      for (let entry of compendium.index) {
        if (!entry)
        {
          break;
        }

        if (entry.type != "spell")
        {
          continue;
        }

        try
        {
          const currentSpell = await compendium.getDocument(entry._id);
          let spellName = entry.name;
          if (spellName in this.allSpells)
          {
            console.log(`Already have spell ${spellName} in dictionary`);
            continue;
          }
          let spellLevel = currentSpell.labels.level.toLowerCase();
          this.allSpells[spellName] = currentSpell;
          this.spellsByLevel[spellLevel].push(currentSpell);
        }
        catch (error)
        {
          console.log(error);
          console.log(`Spell id ${entry._id} failed to get added.`);
        }
      }
    }
  }

  static async populateMonstersFromCompendiums()
  {
    let filteredCompendiums = game.packs.filter((p) => p.metadata.type === "Actor");

    for (let compendium of filteredCompendiums) {
      if (!compendium)
      {
        break;
      }

      for (let entry of compendium.index) {
        if (!entry)
        {
          break;
        }

        if (entry.type != "npc")
        {
          continue;
        }

        try {
          const actor = await compendium.getDocument(entry._id);
          let actorName = actor.data.name;
          actorName = actorName.replaceAll("\"", "");
          if (actorName === "#[CF_tempEntity]")
          {
            console.log(`Skipping actor ${actorName}`);
            continue;
          }

          let environment = actor.data.data.details.environment;
          if (!environment || environment.trim() === "")
          {
            environment = "Any";
          }

          let environmentArray = environment.split(",");

          if (actorName in this.allMonsters)
          {
            console.log(`Already have actor ${actorName} in dictionary`);
            continue;
          }
          this.allMonsters[actorName] = actor;

          environmentArray.forEach((e) => {
            e = e.trim();
            this.monstersByEnvironment[e].push(actor);
          });
        } 
        catch (error) {
          console.log(error);
          console.log(`Actor id ${entry._id} failed to get added.`);
        }
      }
    }
  }

  static async filterMonstersFromCompendiums(params)
  {
    let environment = params.environment;
    let filteredMonsters = [];
    for (const monster of this.monstersByEnvironment[environment])
    {
      filteredMonsters.push(monster);
    }
    for (const monster of this.monstersByEnvironment["Any"])
    {
      filteredMonsters.push(monster);
    }

    return filteredMonsters;
  }

  static async createEncounters(monsterList, params, numberOfEncounters)
  {
    let averageLevelOfPlayers = params.averageLevelOfPlayers;
    let numberOfPlayers = params.numberOfPlayers;

    let encounterList = [];
    for (let i = 0; i < 6; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("deadly", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
      encounterList.push(currentEncounter);
    }
    for (let i = 0; i < 6; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("hard", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
      encounterList.push(currentEncounter);
    }
    for (let i = 0; i < 6; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("medium", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
      encounterList.push(currentEncounter);
    }
    for (let i = 0; i < 12; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("easy", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
      encounterList.push(currentEncounter);
    }

    return encounterList;
  }

  static createEncounter(targetedDifficulty, monsterList, averageLevelOfPlayers, numberOfPlayers, params)
  {
    let currentEncounter = {};
    currentEncounter["difficulty"] = targetedDifficulty;
    currentEncounter["creatures"] = [];
    let targetEncounterXP = SFCONSTS.ENCOUNTER_DIFFICULTY_XP_TABLES[targetedDifficulty][averageLevelOfPlayers - 1] * numberOfPlayers;
    let currentEncounterXP = 0;
    let numberOfMonstersInCombat = 0;

    let j = 0;
    while (j < 50) // attempt to put in 50 monsters before giving up so we don't spin forever
    {
      j++;
      let randomMonsterIndex = Math.floor((Math.random() * monsterList.length));
      let randomMonster = monsterList[randomMonsterIndex];
      let randomMonsterXP = randomMonster.data.data.details.xp.value;
      let currentEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat);
      let monsterName = randomMonster.name;
      let monsterCR = randomMonster.data.data.details.cr;
      let currentEncounterAdjustedXP = SFHelpers.getAdjustedXPOfEncounter(currentEncounter);

      // If we're within 10% of budget, let's stop
      if (currentEncounterAdjustedXP > targetEncounterXP * 0.9)
      {
        break;
      }

      let nextEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat + 1);

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

      let numberOfMonstersAllowedInCombat = SFHelpers.getNumberOfMonstersAllowedInCombat(currentEncounter, monsterList, targetEncounterXP, randomMonster);

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
      currentEncounter["creatures"].push(creatureCombatDetails);
      numberOfMonstersInCombat += numberOfMonstersToPutInCombat;
      currentEncounterXP += randomMonsterXP * numberOfMonstersToPutInCombat;
    }

    currentEncounter["adjustedxp"] = SFHelpers.getAdjustedXPOfEncounter(currentEncounter);
    
    let generatedLootObject = SFHelpers.getLootForEncounter(currentEncounter, params);
    currentEncounter["loot"] = generatedLootObject;
    return currentEncounter;
  }

  static getLootForEncounter(currentEncounter, params)
  {
    let loopType = params.loot_type;
    let generatedLoot;

    if (loopType === "Individual Treasure")
    {
      generatedLoot = SFHelpers.getIndividualTreasureForEncounter(currentEncounter);
    }
    else
    {
      generatedLoot = SFHelpers.getTreasureHoardForEncounter(currentEncounter);
    }

    return generatedLoot;
  }

  static getIndividualTreasureForEncounter(currentEncounter)
  {
    let creatures = currentEncounter["creatures"];
    let lootResultObject = {};
    let currencyResultObject = {};
    let itemsResultObject = {};
    let otherResultObject = {};
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
          let d100Roll = this.getRollResult("1d100");

          if (monsterCR <= 4)
          {
            if (d100Roll <= 30)
            {
              currencyResultObject["cp"] += this.getRollResult("5d6");
            }
            else if (d100Roll <= 60)
            {
              currencyResultObject["sp"] += this.getRollResult("4d6");
            }
            else if (d100Roll <= 70)
            {
              currencyResultObject["ep"] += this.getRollResult("3d6");
            }
            else if (d100Roll <= 95)
            {
              currencyResultObject["gp"] += this.getRollResult("3d6");
            }
            else 
            {
              currencyResultObject["pp"] += this.getRollResult("1d6");
            }
          }
          else if (monsterCR <= 10)
          {
            if (d100Roll <= 30)
            {
              currencyResultObject["cp"] += this.getRollResult("4d6") * 100;
              currencyResultObject["ep"] += this.getRollResult("1d6") * 10;
            }
            else if (d100Roll <= 60)
            {
              currencyResultObject["sp"] += this.getRollResult("6d6") * 10;
              currencyResultObject["gp"] += this.getRollResult("2d6") * 10;
            }
            else if (d100Roll <= 70)
            {
              currencyResultObject["ep"] += this.getRollResult("3d6") * 10;
              currencyResultObject["gp"] += this.getRollResult("2d6") * 10;
            }
            else if (d100Roll <= 95)
            {
              currencyResultObject["gp"] += this.getRollResult("4d6") * 10;
            }
            else 
            {
              currencyResultObject["gp"] += this.getRollResult("2d6") * 10;
              currencyResultObject["pp"] += this.getRollResult("3d6");
            }
          }
          else if (monsterCR <= 16)
          {
            if (d100Roll <= 20)
            {
              currencyResultObject["cp"] += this.getRollResult("4d6") * 100;
              currencyResultObject["gp"] += this.getRollResult("1d6") * 100;
            }
            else if (d100Roll <= 35)
            {
              currencyResultObject["ep"] += this.getRollResult("1d6") * 100;
              currencyResultObject["gp"] += this.getRollResult("1d6") * 100;
            }
            else if (d100Roll <= 75)
            {
              currencyResultObject["pp"] += this.getRollResult("1d6") * 10;
              currencyResultObject["gp"] += this.getRollResult("2d6") * 100;
            }
            else 
            {
              currencyResultObject["pp"] += this.getRollResult("2d6") * 10;
              currencyResultObject["gp"] += this.getRollResult("2d6") * 100;
            }
          }
          else
          {
            if (d100Roll <= 15)
            {
              currencyResultObject["ep"] += this.getRollResult("2d6") * 1000;
              currencyResultObject["gp"] += this.getRollResult("8d6") * 100;
            }
            else if (d100Roll <= 55)
            {
              currencyResultObject["gp"] += this.getRollResult("1d6") * 1000;
              currencyResultObject["pp"] += this.getRollResult("1d6") * 100;
            }
            else 
            {
              currencyResultObject["gp"] += this.getRollResult("1d6") * 1000;
              currencyResultObject["pp"] += this.getRollResult("2d6") * 100;
            }
          }
        }
      }
    }
    
    lootResultObject["currency"] = currencyResultObject;
    lootResultObject["items"] = itemsResultObject;
    lootResultObject["other"] = otherResultObject;
    lootResultObject["scrolls"] = scrollsResultObject;
    return lootResultObject;
  }

  static getTreasureHoardForEncounter(currentEncounter)
  {
    let creatures = currentEncounter["creatures"];
    let lootResultObject = {};
    let currencyResultObject = {};
    let itemsResultObject = {};
    let otherResultObject = {};
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

      let d100Roll = this.getRollResult("1d100") - 1;
      if (d100Roll === 100)
      {
        d100Roll = 0;
      }

      let treasureHoardRowContents;
      if (maximumCRFromGroup <= 4)
      {
        currencyResultObject["cp"] += this.getRollResult("6d6") * 100;
        currencyResultObject["sp"] += this.getRollResult("3d6") * 100;
        currencyResultObject["gp"] += this.getRollResult("2d6") * 10;
        treasureHoardRowContents = SFHelpers.getResultFromTreasureHoardTable(SFCONSTS.ENCOUNTER_TREASURE_HOARD_CR4, d100Roll);
      }
      else if (maximumCRFromGroup <= 10)
      {
        currencyResultObject["cp"] += this.getRollResult("2d6") * 100;
        currencyResultObject["sp"] += this.getRollResult("2d6") * 1000;
        currencyResultObject["gp"] += this.getRollResult("6d6") * 100;
        currencyResultObject["pp"] += this.getRollResult("3d6") * 10;
        treasureHoardRowContents = SFHelpers.getResultFromTreasureHoardTable(SFCONSTS.ENCOUNTER_TREASURE_HOARD_CR10, d100Roll);
      }
      else if (maximumCRFromGroup <= 16)
      {
        currencyResultObject["gp"] += this.getRollResult("4d6") * 1000;
        currencyResultObject["pp"] += this.getRollResult("5d6") * 100;
        treasureHoardRowContents = SFHelpers.getResultFromTreasureHoardTable(SFCONSTS.ENCOUNTER_TREASURE_HOARD_CR16, d100Roll);
      }
      else
      {
        currencyResultObject["gp"] += this.getRollResult("12d6") * 1000;
        currencyResultObject["pp"] += this.getRollResult("8d6") * 1000;
        treasureHoardRowContents = SFHelpers.getResultFromTreasureHoardTable(SFCONSTS.ENCOUNTER_TREASURE_HOARD_CR17_PLUS, d100Roll);
      }

      try
      {
        let gemOrArtRowContents = treasureHoardRowContents[0];
        otherResultObject = SFHelpers.getArtOrGemsResult(gemOrArtRowContents);
        let magicItemsRowContents = treasureHoardRowContents[1];
        itemsResultObject = SFHelpers.getMagicItemResult(magicItemsRowContents);
      }
      catch (error)
      {
        console.error(`Unable to generate treasure hoard for maximum CR ${maximumCRFromGroup} and d100 roll of ${d100Roll}. Error: ${error}`);
      }
    }

    lootResultObject["currency"] = currencyResultObject;
    lootResultObject["items"] = itemsResultObject;
    lootResultObject["other"] = otherResultObject;
    lootResultObject["scrolls"] = scrollsResultObject;
    return lootResultObject;
  }

  static getResultFromTreasureHoardTable(rollTable, rollResult)
  {
    let rowSelected;
    for (var key in rollTable)
    {
      var value = rollTable[key];

      // if this is a single number
      if (key.indexOf("-") === -1)
      {
        let keyInteger = parseInt(key);
        if (rollResult === parseInt(key))
        {
          rowSelected = value;
          break;
        }
      }
      else
      {
        let rollRange = key.split("-");
        let lowerRange = parseInt(rollRange[0]);
        let higherRange = parseInt(rollRange[1]);

        if (lowerRange <= rollResult && rollResult <= higherRange)
        {
          rowSelected = value;
          break;
        }
      }
    }

    return rowSelected;
  }

  static getMagicItemResult(rowContents)
  {
    let matches = [...rowContents.matchAll(/(?<rollDescription>(?<numberOfDice>\d+)d(?<diceType>\d+)) (times)? ? on Magic Item Table (?<tableLetter>\w)/g)];
    let magicItemResultObject = [];
    let magicItemTrackerDictionary = {};

    for (var i = 0; i < matches.length; i++)
    {
      let matchResult = matches[0];
      let matchResultGroups = matchResult.groups;
      let rollDescription = matchResultGroups.rollDescription;
  
      let rollResult = SFHelpers.getRollResult(rollDescription);
      let rollTableToUse = SFHelpers.getMagicItemTable(matchResultGroups);
      for(let i = 0; i < rollResult; i++)
      {
        let magicItemResult = SFHelpers.getRandomItemFromRollTable(rollTableToUse);
        if (magicItemResult === "Figurine of wondrous power (roll d8)")
        {
          magicItemResult = SFHelpers.getRandomItemFromRollTable(SFCONSTS.MAGIC_ITEM_FIGURINE_OF_WONDEROUS_POWER_TABLE);
        }
        else if (magicItemResult === "Magic armor (roll d12)")
        {
          magicItemResult = SFHelpers.getRandomItemFromRollTable(SFCONSTS.MAGIC_ITEM_MAGIC_ARMOR_TABLE);
        }
        else if (magicItemResult.indexOf("Spell scroll") > -1)
        {
          let spellScrollMatch = magicItemResult.match(/Spell scroll \((?<fullSpellDescription>(?<spellLevel>\d+)(st|nd|rd|th) level|cantrip)\)/);
          if (spellScrollMatch)
          {
            let spellLevelToGet = spellScrollMatch.groups.fullSpellDescription.toLowerCase();
            let randomSpellChosen = this.getRandomItemFromRollTable(this.spellsByLevel[spellLevelToGet]);
            magicItemResult = randomSpellChosen;
          }
        }

        // increment dictionary value
        magicItemTrackerDictionary[magicItemResult] = (magicItemTrackerDictionary[magicItemResult] || 0) + 1;
      }
  
      for(var objectName in magicItemTrackerDictionary) {
        var countOfObjects = magicItemTrackerDictionary[objectName];
  
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

    let rollResult = SFHelpers.getRollResult(rollDescription);
    let rollTableToUse = SFHelpers.getArtOrGemsTable(matchResultGroups);


    for(let i = 0; i < rollResult; i++)
    {
      let gemOrArtResult = SFHelpers.getRandomItemFromRollTable(rollTableToUse);

      // increment dictionary value
      gemOrArtTrackerDictionary[gemOrArtResult] = (gemOrArtTrackerDictionary[gemOrArtResult] || 0) + 1;
    }

    for(var objectName in gemOrArtTrackerDictionary) {
      var countOfObjects = gemOrArtTrackerDictionary[objectName];

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

  static getRandomItemFromRollTable(rollTable)
  {
    let lastRowInTableKeyValue = Object.keys(rollTable)[Object.keys(rollTable).length - 1];
    
    let maxNumberToRollFor;
    // if this is a single number
    if (lastRowInTableKeyValue.indexOf("-") === -1)
    {
      maxNumberToRollFor = lastRowInTableKeyValue;
    }
    else
    {
      let rollRange = key.split("-");
      let higherRange = rollRange[1];

      maxNumberToRollFor = higherRange;
    }

    let randomItemNumber = Math.floor(Math.random() * maxNumberToRollFor) + 1;
    return SFHelpers.getResultFromTreasureHoardTable(rollTable, randomItemNumber);
  }

  static getMagicItemTable(regexMatchResultGroups)
  {
    switch (regexMatchResultGroups.tableLetter)
    {
      case "A":
        return SFCONSTS.MAGIC_ITEM_TABLE_A;
      case "B":
        return SFCONSTS.MAGIC_ITEM_TABLE_B;
      case "C":
        return SFCONSTS.MAGIC_ITEM_TABLE_C;
      case "D":
        return SFCONSTS.MAGIC_ITEM_TABLE_D;
      case "E":
        return SFCONSTS.MAGIC_ITEM_TABLE_E;
      case "F":
        return SFCONSTS.MAGIC_ITEM_TABLE_F;
      case "G":
        return SFCONSTS.MAGIC_ITEM_TABLE_G;
      case "H":
        return SFCONSTS.MAGIC_ITEM_TABLE_H;
      case "I":
        return SFCONSTS.MAGIC_ITEM_TABLE_I;
      default:
        return SFCONSTS.MAGIC_ITEM_TABLE_A;
    }
  }

  static getArtOrGemsTable(regexMatchResultGroups)
  {
    if (regexMatchResultGroups.gemsOrArt === "gems")
    {
      switch (regexMatchResultGroups.gemOrArtCost)
      {
        case 10:
          return SFCONSTS.ENCOUNTER_TREASURE_10GP_GEMSTONES;
        case 50:
          return SFCONSTS.ENCOUNTER_TREASURE_50GP_GEMSTONES;
        case 100:
          return SFCONSTS.ENCOUNTER_TREASURE_100GP_GEMSTONES;
        case 500:
          return SFCONSTS.ENCOUNTER_TREASURE_500GP_GEMSTONES;
        case 1000:
          return SFCONSTS.ENCOUNTER_TREASURE_1000GP_GEMSTONES;
        case 5000:
          return SFCONSTS.ENCOUNTER_TREASURE_5000GP_GEMSTONES;
        default:
          return SFCONSTS.ENCOUNTER_TREASURE_10GP_GEMSTONES;
      }
    }
    else
    {
      switch (regexMatchResultGroups.gemOrArtCost)
      {
        case 25:
          return SFCONSTS.ENCOUNTER_TREASURE_25GP_ART_OBJECTS;
        case 250:
          return SFCONSTS.ENCOUNTER_TREASURE_250GP_ART_OBJECTS;
        case 750:
          return SFCONSTS.ENCOUNTER_TREASURE_750GP_ART_OBJECTS;
        case 2500:
          return SFCONSTS.ENCOUNTER_TREASURE_2500GP_ART_OBJECTS;
        case 7500:
          return SFCONSTS.ENCOUNTER_TREASURE_7500GP_ART_OBJECTS;
        default:
          return SFCONSTS.ENCOUNTER_TREASURE_25GP_ART_OBJECTS;
      }
    }
  }

  static getRollResult(rollDescription)
  {
    let diceDescriptionParts = rollDescription.split("d");

    if (diceDescriptionParts.length != 2)
    {
      throw new Error(`Invalid dice description specified: ${rollDescription}`);
    }

    let numberOfDice = diceDescriptionParts[0];
    let diceSize = diceDescriptionParts[1];

    let totalDiceResult = 0;
    for (let i = 0; i < numberOfDice; i++)
    {
      totalDiceResult += Math.floor(Math.random() * diceSize) + 1;
    }

    return totalDiceResult;
  }

  static getNumberOfMonstersAllowedInCombat(currentEncounter, fullMonsterList, targetEncounterXP, newMonster)
  {
    let currentEncounterMonsterCount = 0;
    let currentEncounterXP = 0;
    let newMonsterXP = newMonster.data.data.details.xp.value;
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

    let currentEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
    let numberOfNewMonstersAllowed = 0;
    while (true)
    {
      // figure out what our new encounter XP would be if we add another creature
      let newMonsterEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount + numberOfNewMonstersAllowed + 1);
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

    let currentEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
    return currentEncounterXPMultiplier * currentEncounterXP;
  }

  static getCurrentEncounterXPMultiplier(monsterCount)
  {
    let latestEncounterMultiplier;
    for (var key in SFCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS)
    {
      var value = SFCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS[key];
      latestEncounterMultiplier = value;
      if (monsterCount <= key)
      {
        return value;
      }
    }
    return latestEncounterMultiplier;
  }

  static async fetchData(params) {
    return await fetch(
      `https://theripper93.com/encounterData.php?${new URLSearchParams(
        params
      ).toString()}`
    )
      .then((response) => response.json())
      .then((data) => data);
  }

  static async parseEncounter(data, params={}) {
    const encounters = data.reduce((a, v) => {
      const enc = new Encounter(v).validate();
      if (enc !== undefined) a.push(enc);
      return a;
    }, []);

    for (let encounter of encounters) {
      encounter.environment = data.environment || params.environment;
      encounter.name = encounter.data.name || `${encounter.environment} Encounter #${encounters.indexOf(encounter)+1}`;
      await encounter.prepareData();
    }

    return encounters;
  }
}

class StocasticFantastic {
  static async addToDialog(data) {
    const encounterData = await SFHelpers.parseEncounter(data);
    if (!canvas.sfDialog?.rendered) await canvas.sfDialog.render(true);
    canvas.sfDialog.populateEncounters(encounterData);
  }
}
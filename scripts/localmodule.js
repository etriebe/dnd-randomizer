class SFLocalHelpers {
    static allMonsters = [];
    static allSpells = {};
    static spellsByLevel = {};
    static dictionariesInitialized = false;
    static dictionariesPopulated = false;
  
    static initializeDictionaries() {
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

    static getActivePlayersCountAndLevels() {
      let playerCharacters = game.actors.filter(a=>a.hasPlayerOwner === true);
      const savedPlayerSettings = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "playerCharactersToCreateEncountersFor"
        );
      let levelList = [];

      for (let player of playerCharacters) {
        let playerName = player.name;
        const el = savedPlayerSettings.find(i => Object.keys(i)[0] === playerName);
        if (el[playerName] === false)
        {
          continue;
        }

        let playerClasses = player.classes;
        let playerClassList = Object.keys(playerClasses);
        let totalLevelCount = 0;
        for (let i = 0; i < playerClassList.length; i++)
        {
          let currentClassLevel = playerClasses[playerClassList[i]].data.data.levels;
          totalLevelCount += currentClassLevel;
        }

        levelList.push(totalLevelCount);
      }
      var total = 0;
      for(var i = 0; i < levelList.length; i++) {
          total += levelList[i];
      }
      var avg = Math.floor(total / levelList.length);
      let resultObject = {};
      resultObject["numberofplayers"] = levelList.length;
      resultObject["averageplayerlevel"] = avg;
      return resultObject;
    }

    static async populateCurrentActors() {
      let playerCharacters = game.actors.filter(a=>a.hasPlayerOwner === true);
    }
  
    static async populateItemsFromCompendiums()
    {
      let filteredCompendiums = game.packs.filter((p) => p.metadata.type === "Item" || p.metadata.entity === "Item");
  
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
      let filteredCompendiums = game.packs.filter((p) => p.metadata.type === "Actor" || p.metadata.entity === "Actor");
  
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
            environmentArray = environmentArray.map(e => e.trim());
  
            if (this.allMonsters.filter((m) => m.actor.data.name === actorName).length > 0)
            {
              console.log(`Already have actor ${actorName}, actor id ${actor.data._id} in dictionary`);
              continue;
            }
            let monsterObject = {};
            monsterObject["actor"] = actor;
            monsterObject["actorid"] = actor.data._id;
            monsterObject["compendiumname"] = compendium.metadata.label;
            monsterObject["environment"] = environmentArray;
            monsterObject["creaturetype"] = actor.data.data.details.type.value;
            monsterObject["combatdata"] = this.getCombatDataPerRound(actor);
            this.allMonsters.push(monsterObject);
          } 
          catch (error) {
            console.warn(error);
            console.warn(`Actor id ${entry._id}, name ${entry.name} failed to get added.`);
          }
        }
      }
    }

    static getCombatDataPerRound(actor)
    {
      let attackList = actor.items.filter(i => i.type.toLowerCase() === "weapon" || i.type.toLowerCase() === "feat");
      // let spellList = actor.items.filter(i => i.type.toLowerCase() === "spell");
      let multiAttack = actor.items.filter(i => i.name.toLowerCase() === "multiattack");
      let allAttackResultObjects = [];
      if (multiAttack && multiAttack.length > 0)
      {
        // Description types supported:
        // <p>The imperial ghoul makes one bite attack and one claws attack.</p>
        // <p>the dragon can use its frightful presence. it then makes three attacks: one with its bite and two with its claws.</p>'
        let multiAttackDescription = multiAttack[0].data.data.description.value.toLowerCase();

        var parsedAttackList = [];
        for (var i = 0; i < attackList.length; i++)
        {
          var currentAttack = attackList[i];
          var attackName = currentAttack.name.toLowerCase();
          var sanitizedAttackName = attackName.replaceAll(/\(.+\)/gm, "").trim();
          sanitizedAttackName = sanitizedAttackName.replaceAll(/\+\d/gm, "").trim();
          sanitizedAttackName = sanitizedAttackName.replaceAll(/\)/gm, "").trim(); // currently creatures with a recharge attack have the recharge attack named incorrectly
          parsedAttackList.push(sanitizedAttackName);
        }
        var parsedAttackRegex = parsedAttackList.join("|");

        var attackMatches = [...multiAttackDescription.matchAll(`(?<attackDescription>${parsedAttackRegex})`)];
        var numberMatches = [...multiAttackDescription.matchAll(`(?<numberOfAttacks>one|two|three|four|five|six|seven|eight|nine|ten)`)];
        var orMatches = [...multiAttackDescription.matchAll(`(?<qualifiers> or )`)];

        var previousAttackIndex = -1;
        for (var i = 0; i < attackMatches.length; i++)
        {
          var currentAttackMatch = attackMatches[i];
          var attackObject = attackList.find(a => a.name.toLowerCase().match(currentAttackMatch[0]));
          var currentAttackIndex = currentAttackMatch.index;
          var numberMatchesBeforeAttack = numberMatches.filter(n => n.index < currentAttackIndex);
          var correctNumberMatch = numberMatchesBeforeAttack[numberMatchesBeforeAttack.length - 1];
          let actualNumberOfAttacks = 1;
          if (correctNumberMatch)
          {
            actualNumberOfAttacks = this.getIntegerFromWordNumber(correctNumberMatch[0]);
          }
          let currentAttackObject = this.getInfoForAttackObject(attackObject, actualNumberOfAttacks);

          if (previousAttackIndex != -1)
          {
            let previousAttackObject = allAttackResultObjects.pop();

            // Check to see if an or is between the previous attack object and the current
            let orMatchesBetweenAttacks = orMatches.filter(o => o.index > previousAttackIndex && o.index < currentAttackIndex);
            if (orMatchesBetweenAttacks.length > 0)
            {
              // decide which object is better and push that one.
              if ((currentAttackObject.numberofattacks * currentAttackObject.averagedamage) > 
              (previousAttackObject.numberofattacks * previousAttackObject.averagedamage))
              {
                allAttackResultObjects.push(currentAttackObject);
              }
              else
              {
                allAttackResultObjects.push(previousAttackObject);
              }
            }
            else
            {
              allAttackResultObjects.push(previousAttackObject);
              allAttackResultObjects.push(currentAttackObject);
            }
            
          }
          else
          {
            allAttackResultObjects.push(currentAttackObject)
          }
          previousAttackIndex = currentAttackIndex;
        }
      }
      else
      {
        let bestAttackObject = null;
        let maxDamage = 0;
        for (var i = 0; i < attackList.length; i++)
        {
          let currentAttackObject = this.getInfoForAttackObject(attackList[i], 1);
          let totalDamage = currentAttackObject.averagedamage * currentAttackObject.numberofattacks;
          if (maxDamage < totalDamage)
          {
            bestAttackObject = currentAttackObject;
            maxDamage = totalDamage;
          }
        }
        allAttackResultObjects.push(bestAttackObject);
      }

      if (allAttackResultObjects.length === 0)
      {
        console.log(`Parsed no attack data for actor: ${actor.name}`);
      }
      else
      {
        // console.log(`Parsed ${actor.name} to have ${allAttackResultObjects.length} attacks`);
      }
      return allAttackResultObjects;
    }

    static getIntegerFromWordNumber(number)
    {
      // This feels stupid but parseInt can't work with text format like we have.
      switch (number.toLowerCase())
      {
        case "one":
          return 1;
        case "two":
          return 2;
        case "three":
          return 3;
        case "four":
          return 4;
        case "five":
          return 5;
        case "six":
          return 6;
        case "seven":
          return 7;
        case "eight":
          return 8;
        case "nine":
          return 9;
        case "ten":
          return 10;
        default:
          return null;
      }
    }

    static getInfoForAttackObject(attackObject, numberOfAttacks)
    {
      let abilityModType = attackObject.abilityMod;
      let abilityModValue = eval("attackObject.parent.data.data.abilities." + abilityModType + ".mod");
      let damageList = attackObject.data.data.damage.parts;

      let totalDamageForAttack = 0;
      for (var j = 0; j < damageList.length; j++)
      {
        let damageArray = damageList[j];
        let damageDescription = damageArray[0];
        let damageType = damageArray[1];
        damageDescription = damageDescription.toLowerCase().replaceAll(`[${damageType.toLowerCase()}]`, "");
        let totalAverageRollResult = this.getAverageDamageFromDescription(damageDescription, abilityModValue);

        totalDamageForAttack += totalAverageRollResult;
      }
      let currentAttackResult = {};
      currentAttackResult["averagedamage"] = totalDamageForAttack;
      let isProficient = attackObject.data.data.proficient;
      let attackBonus = 0;
      if (isProficient)
      {
        attackBonus += attackObject.data.data.prof.flat;
      }

      attackBonus += abilityModValue;
      currentAttackResult["attackbonustohit"] = attackBonus;
      currentAttackResult["numberofattacks"] = numberOfAttacks;
      currentAttackResult["attackdescription"] = attackObject.name;
      return currentAttackResult;
    }

    static getAverageDamageFromDescription(damageDescription, abilityModValue)
    {
      damageDescription = damageDescription.replaceAll("@mod", abilityModValue);
      let matches = [...damageDescription.matchAll(/((?<diceCount>\d+)d(?<diceType>\d+))/gm)];
      for (var i = 0; i < matches.length; i++)
      {
        let matchResult = matches[i];
        let entireMatchValue = matchResult[0];
        let matchResultGroups = matchResult.groups;
        let diceCount = matchResultGroups.diceCount;
        let diceType = matchResultGroups.diceType;
        let diceTypeAverage = (parseInt(diceType) + 1) / 2;
        let totalDiceRollAverage = diceTypeAverage * diceCount;
        damageDescription = damageDescription.replaceAll(entireMatchValue, totalDiceRollAverage);
      }

      // deal with modules that use a Math.floor function but Math. isn't specified
      damageDescription = damageDescription.replaceAll("floor(", "Math.floor(");
      let totalAverageRollResult = eval(damageDescription);
      return totalAverageRollResult;
    }

    static getActorTraits(actor)
    {
      let characterTraits = {};

      if (actor.data.data.traits.ci.value.length > 0)
      {
        characterTraits["conditionimmunities"] = actor.data.data.traits.ci.value;
      }
      if (actor.data.data.traits.di.value.length > 0)
      {
        characterTraits["damageimmunities"] = actor.data.data.traits.di.value;
      }
      if (actor.data.data.traits.dr.value.length > 0)
      {
        characterTraits["damageresistances"] = actor.data.data.traits.dr.value;
      }
      if (actor.data.data.traits.dv.value.length > 0)
      {
        characterTraits["damagevulnerabilities"] = actor.data.data.traits.dv.value;
      }

      let actorSpells = actor.data.data.spells;
      let maxSpellLevel = 0;
      for (var i = 1; i <= 9; i++)
      {
        let currentSpellLevelObject = eval("actorsSpells.spell" + i);
        if (currentSpellLevelObject.max > 0)
        {
          characterTraits["spellcaster"] = true;
          maxSpellLevel = i;
        }
      }

      // deal with pact magic
      if (actorSpells.pact.max > 0)
      {
        characterTraits["spellcaster"] = true;
        let pactLevel = actorSpells.pact.level;
        if (maxSpellLevel > pactLevel)
        {
          maxSpellLevel = pactLevel;
        }
      }
      if (maxSpellLevel > 0)
      {
        characterTraits["maxspelllevel"] = maxSpellLevel;
        characterTraits["spelldamagetypelist"] = spellList.map(s => s.data.data.damage.parts).filter(p => p.length > 0).map(z=> z[0][1]).filter(t => t != "");
      }

      if (actor.data.data.resources.lair.value)
      {
        characterTraits["lairactions"] = true;
      }

      if (actor.data.data.resources.legact.max > 0)
      {
        characterTraits["legendaryactions"] = true;
      }

      if (actor.data.data.resources.legres.max > 0)
      {
        characterTraits["legendaryresistances"] = true;
      }

      let spellList = actor.items.filter(i => i.type === "spell");
      if (spellList.filter(s => s.hasAreaTarget && s.hasDamage && s.name.toLowerCase() != "sleep").length > 0)
      {
        characterTraits["hasAOESpell"] = true;
      }
    }
  
    static async filterMonstersFromCompendiums(params)
    {
      let environment = params.environment;
      let filteredMonsters = [];

      const constCompFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterCompendiums"
      );

      const constMonsterTypeFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterMonsterTypes"
      );

      const filteredCompendiums = Array.from(game.packs).filter((p) => {
        if (p.documentName !== "Actor") return false;
        const el = constCompFilter.find((i) => Object.keys(i)[0] == p.collection);
        return !el || el[p.collection] ? true : false;
      });

      const filteredMonsterTypes = Array.from(SFLOCALCONSTS.CREATURE_TYPES).filter((p) => {
        const el = constMonsterTypeFilter.find((i) => Object.keys(i)[0] == p);
        return !el || el[p] ? true : false;
      });

      for (const monsterObject of this.allMonsters)
      {
        if (filteredCompendiums.filter((c) => c.metadata.label === monsterObject.compendiumname).length === 0) 
        {
          continue;
        }

        if (filteredMonsterTypes.filter(m => m === monsterObject.creaturetype).length === 0)
        {
          continue;
        }

        if (monsterObject.environment.indexOf(environment) > -1 || monsterObject.environment.indexOf("Any") > -1)
        {
          filteredMonsters.push(monsterObject.actor);
        }
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
        let currentEncounter = SFLocalHelpers.createEncounter("deadly", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
        encounterList.push(currentEncounter);
      }
      for (let i = 0; i < 6; i++)
      {
        let currentEncounter = SFLocalHelpers.createEncounter("hard", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
        encounterList.push(currentEncounter);
      }
      for (let i = 0; i < 6; i++)
      {
        let currentEncounter = SFLocalHelpers.createEncounter("medium", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
        encounterList.push(currentEncounter);
      }
      for (let i = 0; i < 12; i++)
      {
        let currentEncounter = SFLocalHelpers.createEncounter("easy", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
        encounterList.push(currentEncounter);
      }
  
      return encounterList;
    }
  
    static createEncounter(targetedDifficulty, monsterList, averageLevelOfPlayers, numberOfPlayers, params)
    {
      let currentEncounter = {};
      currentEncounter["difficulty"] = targetedDifficulty;
      currentEncounter["creatures"] = [];
      let targetEncounterXP = SFLOCALCONSTS.ENCOUNTER_DIFFICULTY_XP_TABLES[targetedDifficulty][averageLevelOfPlayers - 1] * numberOfPlayers;
      let currentEncounterXP = 0;
      let numberOfMonstersInCombat = 0;
  
      let j = 0;
      while (j < 50) // attempt to put in 50 monsters before giving up so we don't spin forever
      {
        j++;
        let randomMonsterIndex = Math.floor((Math.random() * monsterList.length));
        let randomMonster = monsterList[randomMonsterIndex];
        let monsterName;

        try
        {
          monsterName = randomMonster.name;
          if (!randomMonster.data || !randomMonster.data.data)
          {
            console.warn(`Monster chosen ${randomMonster.name} didn't have a valid data property.`)
            continue;
          }

          let randomMonsterXP = randomMonster.data.data.details.xp.value;
          let currentEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat);
          let monsterCR = randomMonster.data.data.details.cr;
          let currentEncounterAdjustedXP = SFLocalHelpers.getAdjustedXPOfEncounter(currentEncounter);
    
          // If we're within 10% of budget, let's stop
          if (currentEncounterAdjustedXP > targetEncounterXP * 0.9)
          {
            break;
          }
    
          let nextEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat + 1);
    
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
    
          let numberOfMonstersAllowedInCombat = SFLocalHelpers.getNumberOfMonstersAllowedInCombat(currentEncounter, monsterList, targetEncounterXP, randomMonster);
    
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
        catch (error)
        {
          console.warn(`Failed to correctly add a random monster to the encounter. randomMonsterIndex: ${randomMonsterIndex}, monster name: ${monsterName}, Error: ${error}`);
        }
      }
  
      currentEncounter["xp"] = SFLocalHelpers.getAdjustedXPOfEncounter(currentEncounter);
      
      let generatedLootObject = SFLocalHelpers.getLootForEncounter(currentEncounter, params);
      currentEncounter["loot"] = generatedLootObject;
      return currentEncounter;
    }
  
    static getLootForEncounter(currentEncounter, params)
    {
      let loopType = params.loot_type;
      let generatedLoot;
  
      if (loopType === "Individual Treasure")
      {
        generatedLoot = SFLocalHelpers.getIndividualTreasureForEncounter(currentEncounter);
      }
      else
      {
        generatedLoot = SFLocalHelpers.getTreasureHoardForEncounter(currentEncounter);
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
            let d100Roll = this.getRollResult("1d100");
  
            let individualTreasureRowContents;
            if (monsterCR <= 4)
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR4, d100Roll);
            }
            else if (monsterCR <= 10)
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR10, d100Roll);
            }
            else if (monsterCR <= 16)
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR16, d100Roll);
            }
            else
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR17_PLUS, d100Roll);
            }
  
            currencyResultObject["cp"] += SFLocalHelpers.getCoinsResultFromRollTable(individualTreasureRowContents[0]);
            currencyResultObject["sp"] += SFLocalHelpers.getCoinsResultFromRollTable(individualTreasureRowContents[1]);
            currencyResultObject["ep"] += SFLocalHelpers.getCoinsResultFromRollTable(individualTreasureRowContents[2]);
            currencyResultObject["gp"] += SFLocalHelpers.getCoinsResultFromRollTable(individualTreasureRowContents[3]);
            currencyResultObject["pp"] += SFLocalHelpers.getCoinsResultFromRollTable(individualTreasureRowContents[4]);
          }
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
      let rollResult = SFLocalHelpers.getRollResult(matchResultGroups.rollDescription);
      let totalCoins = rollResult * multiplierAmount;
      return totalCoins;
    }
  
    static getTreasureHoardForEncounter(currentEncounter)
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
  
        let d100Roll = this.getRollResult("1d100");
  
        let treasureHoardRowContents;
        if (maximumCRFromGroup <= 4)
        {
          currencyResultObject["cp"] += this.getRollResult("6d6") * 100;
          currencyResultObject["sp"] += this.getRollResult("3d6") * 100;
          currencyResultObject["gp"] += this.getRollResult("2d6") * 10;
          treasureHoardRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HOARD_CR4, d100Roll);
        }
        else if (maximumCRFromGroup <= 10)
        {
          currencyResultObject["cp"] += this.getRollResult("2d6") * 100;
          currencyResultObject["sp"] += this.getRollResult("2d6") * 1000;
          currencyResultObject["gp"] += this.getRollResult("6d6") * 100;
          currencyResultObject["pp"] += this.getRollResult("3d6") * 10;
          treasureHoardRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HOARD_CR10, d100Roll);
        }
        else if (maximumCRFromGroup <= 16)
        {
          currencyResultObject["gp"] += this.getRollResult("4d6") * 1000;
          currencyResultObject["pp"] += this.getRollResult("5d6") * 100;
          treasureHoardRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HOARD_CR16, d100Roll);
        }
        else
        {
          currencyResultObject["gp"] += this.getRollResult("12d6") * 1000;
          currencyResultObject["pp"] += this.getRollResult("8d6") * 1000;
          treasureHoardRowContents = SFLocalHelpers.getResultFromTreasureHoardTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HOARD_CR17_PLUS, d100Roll);
        }
  
        try
        {
          let gemOrArtRowContents = treasureHoardRowContents[0];
          otherResultObject = SFLocalHelpers.getArtOrGemsResult(gemOrArtRowContents);
          let magicItemsRowContents = treasureHoardRowContents[1];
          itemsResultObject = SFLocalHelpers.getMagicItemResult(magicItemsRowContents);
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
    
        let rollResult = SFLocalHelpers.getRollResult(rollDescription);
        let rollTableToUse = SFLocalHelpers.getMagicItemTable(matchResultGroups);
        for(let i = 0; i < rollResult; i++)
        {
          let magicItemResult = SFLocalHelpers.getRandomItemFromRollTable(rollTableToUse);
          if (magicItemResult === "Figurine of wondrous power (roll d8)")
          {
            magicItemResult = SFLocalHelpers.getRandomItemFromRollTable(SFLOCALCONSTS.MAGIC_ITEM_FIGURINE_OF_WONDEROUS_POWER_TABLE);
          }
          else if (magicItemResult === "Magic armor (roll d12)")
          {
            magicItemResult = SFLocalHelpers.getRandomItemFromRollTable(SFLOCALCONSTS.MAGIC_ITEM_MAGIC_ARMOR_TABLE);
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
  
      let rollResult = SFLocalHelpers.getRollResult(rollDescription);
      let rollTableToUse = SFLocalHelpers.getArtOrGemsTable(matchResultGroups);
  
  
      for(let i = 0; i < rollResult; i++)
      {
        let gemOrArtResult = SFLocalHelpers.getRandomItemFromRollTable(rollTableToUse);
  
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
        let rollRange = lastRowInTableKeyValue.split("-");
        let higherRange = rollRange[1];
  
        maxNumberToRollFor = higherRange;
      }
  
      let randomItemNumber = Math.floor(Math.random() * maxNumberToRollFor) + 1;
      return SFLocalHelpers.getResultFromTreasureHoardTable(rollTable, randomItemNumber);
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
  
      let currentEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
      let numberOfNewMonstersAllowed = 0;
      while (true)
      {
        // figure out what our new encounter XP would be if we add another creature
        let newMonsterEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount + numberOfNewMonstersAllowed + 1);
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
  
      let currentEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
      return currentEncounterXPMultiplier * currentEncounterXP;
    }
  
    static getCurrentEncounterXPMultiplier(monsterCount)
    {
      let latestEncounterMultiplier;
      for (var key in SFLOCALCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS)
      {
        var value = SFLOCALCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS[key];
        latestEncounterMultiplier = value;
        if (monsterCount <= key)
        {
          return value;
        }
      }
      return latestEncounterMultiplier;
    }

}
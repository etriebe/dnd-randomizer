class SFLocalHelpers {
    static allMonsters = [];
    static spellsByLevel = {};
    static dictionariesInitialized = false;
    static dictionariesPopulated = false;
    static numberRegex = `(?<numberOfAttacks>one|two|three|four|five|six|seven|eight|nine|ten|once|twice|thrice|1|2|3|4|5|6|7|8|9)`;
  
    static initializeDictionaries() {
      this.spellsByLevel = {};
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
      this.spellsByLevel["10th level"] = [];
      this.dictionariesInitialized = true;
    }
  
    static async populateObjectsFromCompendiums(forceReload) {
      if (!this.dictionariesInitialized)
      {
        this.initializeDictionaries();
      }
      if (!this.dictionariesPopulated || forceReload)
      {
        let promises = [];
        promises.push(this.populateItemsFromCompendiums(forceReload));
        promises.push(this.populateMonstersFromCompendiums(forceReload));
        await Promise.all(promises);
        this.dictionariesPopulated = true;
      }
    }

    static getListOfActivePlayers()
    {
      let playerCharacters = game.actors.filter(a=>a.hasPlayerOwner === true);
      if (playerCharacters.length === 0)
      {
        playerCharacters = game.actors.filter(a=>a.type === "character");
      }
      return playerCharacters;
    }

    static getActivePlayersCountAndLevels() {
      let playerCharacters = this.getListOfActivePlayers();

      const savedPlayerSettings = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "playerCharactersToCreateEncountersFor"
        );
      let levelList = [];

      for (let player of playerCharacters) {
        let playerName = player.name;
        const el = savedPlayerSettings.find(i => Object.keys(i)[0] === playerName);
        if (el && el[playerName] === false)
        {
          continue;
        }

        let totalLevelCount = this.getPlayerClassLevel(player);
        if (totalLevelCount === 0)
        {
          console.log(`Player ${player.name} has no class level so skipping them.`);
          continue;
        }
        levelList.push(totalLevelCount);
      }

      let total = 0;
      for(let i = 0; i < levelList.length; i++) {
          total += levelList[i];
      }
      let avg = Math.floor(total / levelList.length);
      let resultObject = {};
      resultObject["numberofplayers"] = levelList.length;
      resultObject["averageplayerlevel"] = avg;
      return resultObject;
    }

    static getPlayerClassLevel(player)
    {
      let currentSystem = game.system.id;
      if (currentSystem === "dnd5e")
      {
        let playerClasses = player.classes;
        let playerClassList = this.getPlayerClassList(player);
        let totalLevelCount = 0;
        for (let i = 0; i < playerClassList.length; i++)
        {
          let currentClassLevel = playerClasses[playerClassList[i]].data.data.levels;
          totalLevelCount += currentClassLevel;
        }
        return totalLevelCount;
      }
      else if (currentSystem === "pf2e")
      {
        return player.level;
      }
      else
      {
        throw new Error ("Unsupported system!");
      }
    }

    static getPlayerClassList(player)
    {
      let playerClassList = [];
      let currentSystem = game.system.id;
      if (currentSystem === "dnd5e")
      {
        let playerClasses = player.classes;
        let playerClassList = Object.keys(playerClasses);
        return playerClassList;
      }
      else if (currentSystem === "pf2e")
      {
        playerClassList.push(player.class);
        return playerClassList;
      }
      else
      {
        throw new Error ("Unsupported system!");
      }
    }
  
    static async populateItemsFromCompendiums(forceReload)
    {
      let useSavedIndex = game.settings.get(SFCONSTS.MODULE_NAME, 'useSavedIndex');

      let populatedFromIndex = false;
      if (useSavedIndex && !forceReload)
      {
        this.spellsByLevel = game.settings.get(SFCONSTS.MODULE_NAME, 'savedSpellIndex');
        if (this.spellsByLevel.length > 0)
        {
          populatedFromIndex = true;
        }
      }

      if (!populatedFromIndex)
      {
        this.initializeDictionaries();
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
              let spellLevel = this.getLevelKeyForSpell(currentSpell);
              if (!this.spellsByLevel[spellLevel].find(s => s.name === currentSpell.name))
              {
                this.spellsByLevel[spellLevel].push(currentSpell);
              }
            }
            catch (error)
            {
              console.log(error);
              console.log(`Spell id ${entry._id} failed to get added.`);
            }
          }
        }
      }

      if (useSavedIndex)
      {
        await game.settings.set(SFCONSTS.MODULE_NAME, 'savedSpellIndex', this.spellsByLevel);
      }
    }

    static async populateMonstersFromCompendiums(forceReload)
    {
      let useSavedIndex = game.settings.get(SFCONSTS.MODULE_NAME, 'useSavedIndex');

      let populatedFromIndex = false;
      if (useSavedIndex && !forceReload)
      {
        this.allMonsters = game.settings.get(SFCONSTS.MODULE_NAME, 'savedMonsterIndex');
        if (this.allMonsters.length > 0)
        {
          populatedFromIndex = true;
        }
      }

      if (!populatedFromIndex)
      {
        this.allMonsters = [];
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
              let actor = await compendium.getDocument(entry._id);
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
              monsterObject["actorname"] = actorName;
              monsterObject["actorid"] = actor.data._id;
              monsterObject["compendiumname"] = compendium.metadata.label;
              monsterObject["environment"] = environmentArray;
              monsterObject["creaturetype"] = this.getCreatureTypeForActor(actor);
              monsterObject["combatdata"] = this.getCombatDataPerRound(actor);
              this.allMonsters.push(monsterObject);
            } 
            catch (error) {
              console.warn(error);
              console.warn(`Actor id ${entry._id}, name ${entry.name} failed to get added.`);
            }
          }
        }

        await game.settings.set(SFCONSTS.MODULE_NAME, 'savedIndexDate', this.getCurrentDateTime()); 
      }

      if (useSavedIndex)
      {
        await game.settings.set(SFCONSTS.MODULE_NAME, 'savedMonsterIndex', this.allMonsters);
      }
    }

    static getCurrentDateTime() {
      let current = new Date();
      let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
      let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
      let dateTime = cDate + ' ' + cTime;
      return dateTime;
  };

    static getCreatureTypeForActor(actor)
    {
      return this.getSystemVariableForObject(actor, "CreatureType");
    }

    static getLevelKeyForSpell(spell)
    {
      let spellLevel = this.getSystemVariableForObject(spell, "SpellLevel").toString().toLowerCase();

      let fullSpellNameMatch = spellLevel.match(/(?<fullSpellDescription>(?<spellLevel>\d+)(st|nd|rd|th) level|cantrip)/g);

      if (fullSpellNameMatch)
      {
        return spellLevel;
      }

      switch (spellLevel)
      {
        case "1":
          return "1st level";
        case "2":
          return "2nd level";
        case "3":
          return "3rd level";
        default:
          return `${spellLevel}th level`
      }
    }

    static getSystemVariableForObject(object, variableName)
    {
      let currentSystem = game.system.id;
      let variableValues = SFLOCALCONSTS.SYSTEM_VARIABLES[variableName];
      if (!variableValues)
      {
        console.error(`Unable to find variable name ${variableName} information`);
        return;
      }

      let currentSystemVariableName = variableValues[currentSystem];
      if (!currentSystemVariableName)
      {
        console.error(`Unable to find variable name ${variableName} for system ${currentSystem}`);
        return;
      }
      return eval(`object.${currentSystemVariableName}`)
    }

    static getCombatDataPerRound(actor)
    {
      let attackList = actor.items.filter(i => (i.type.toLowerCase() === "weapon" || i.type.toLowerCase() === "feat") 
        && i.name.toLowerCase() != "multiattack"
        && i.hasAttack);
      // let spellList = actor.items.filter(i => i.type.toLowerCase() === "spell");
      let multiAttack = actor.items.filter(i => i.name.toLowerCase() === "multiattack");
      let allAttackResultObjects = [];
      if (multiAttack && multiAttack.length > 0)
      {
        // Description types supported:
        // <p>The imperial ghoul makes one bite attack and one claws attack.</p>
        // <p>the dragon can use its frightful presence. it then makes three attacks: one with its bite and two with its claws.</p>'
        let multiAttackDescription = this.getDescriptionFromItemObject(multiAttack[0]).toLowerCase();

        let parsedAttackList = [];
        for (let i = 0; i < attackList.length; i++)
        {
          let currentAttack = attackList[i];
          let attackName = currentAttack.name.toLowerCase();
          let sanitizedAttackName = attackName.replaceAll(/\(.+\)/gm, "").trim();
          sanitizedAttackName = sanitizedAttackName.replaceAll(/\+\d/gm, "").trim();
          sanitizedAttackName = sanitizedAttackName.replaceAll(/\)/gm, "").trim(); // currently creatures with a recharge attack have the recharge attack named incorrectly
          // skip if we've removed anything interesting from the attack name
          if (sanitizedAttackName === "")
          {
            continue;
          }
          parsedAttackList.push(sanitizedAttackName);
        }
        parsedAttackList.push("melee attack");
        let parsedAttackRegex = parsedAttackList.join("|");

        let attackMatches = [...multiAttackDescription.matchAll(`(?<attackDescription>${parsedAttackRegex})`)];
        let numberMatches = [...multiAttackDescription.matchAll(this.numberRegex)];
        let orMatches = [...multiAttackDescription.matchAll(`(?<qualifiers> or )`)];

        let previousAttackIndex = -1;
        for (let i = 0; i < attackMatches.length; i++)
        {
          let currentAttackMatch = attackMatches[i];
          let attackObject = attackList.find(a => a.name.toLowerCase().match(currentAttackMatch[0]));
          if (!attackObject || currentAttackMatch[0] === "melee attack")
          {
            attackObject = attackList.find(a => a.type === "weapon");
          }
          let currentAttackIndex = currentAttackMatch.index;
          let numberMatchesBeforeAttack = numberMatches.filter(n => n.index < currentAttackIndex);
          let correctNumberMatch = numberMatchesBeforeAttack[numberMatchesBeforeAttack.length - 1];
          let actualNumberOfAttacks = 1;
          if (correctNumberMatch)
          {
            actualNumberOfAttacks = this.getIntegerFromWordNumber(correctNumberMatch[0]);
          }
          let currentAttackObject = this.getInfoForAttackObject(attackObject, actualNumberOfAttacks);

          if (!currentAttackObject || currentAttackObject.averagedamage === 0)
          {
            // Skip because attack is boring and likely is some type of charm feature. 
            continue;
          }

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
            // console.log(`Adding attack ${attackObject.name} for ${actor.name}`);
          }
          previousAttackIndex = currentAttackIndex;
        }

        if (allAttackResultObjects.length === 0)
        {
          let guessedAttack = this.guessActorMultiAttack(attackList, multiAttackDescription);
          if (guessedAttack)
          {
            console.log(`Attempted to guess attack for ${actor.name}: ${guessedAttack.numberofattacks} ${guessedAttack.attackdescription} attacks.`)
            allAttackResultObjects.push(guessedAttack);
          }
        }
      }
      else
      {
        let bestAttackObject = null;
        let maxDamage = 0;
        for (let i = 0; i < attackList.length; i++)
        {
          try 
          {
            let currentAttackObject = this.getInfoForAttackObject(attackList[i], 1);
            let totalDamage = currentAttackObject.averagedamage * currentAttackObject.numberofattacks;
            if (maxDamage < totalDamage)
            {
              bestAttackObject = currentAttackObject;
              maxDamage = totalDamage;
            }
          }
          catch (error)
          {
            console.warn(`Unable to parse attack ${attackList[i].name}: ${error}`);
          }
        }
        allAttackResultObjects.push(bestAttackObject);
      }

      if (allAttackResultObjects.length === 0)
      {
        console.warn(`Parsed no attack data for actor: ${actor.name}`);
      }
      return allAttackResultObjects;
    }

    static guessActorMultiAttack(attackList, multiAttackDescription)
    {
      let firstAttack = attackList.find(a => a.type === "weapon");
      let actualNumber = 1;
      let numberMatch = multiAttackDescription.match(this.numberRegex);
      if (numberMatch)
      {
        actualNumber = this.getIntegerFromWordNumber(numberMatch[0]);
      }

      return this.getInfoForAttackObject(firstAttack, actualNumber);
    }

    static getIntegerFromWordNumber(number)
    {
      // This feels stupid but parseInt can't work with text format like we have.
      switch (number.toLowerCase())
      {
        case "one":
        case "1":
          return 1;
        case "two":
        case "twice":
        case "2":
          return 2;
        case "three":
        case "thrice":
        case "3":
          return 3;
        case "four":
        case "4":
          return 4;
        case "five":
        case "5":
          return 5;
        case "six":
        case "6":
          return 6;
        case "seven":
        case "7":
          return 7;
        case "eight":
        case "8":
          return 8;
        case "nine":
        case "9":
          return 9;
        case "ten":
        case "10":
          return 10;
        default:
          return null;
      }
    }

    static getInfoForAttackObject(attackObject, numberOfAttacks)
    {
      let abilityModType = attackObject.abilityMod;
      let abilityModValue = eval("attackObject.parent.data.data.abilities." + abilityModType + ".mod");
      let damageList = this.getDataObjectFromObject(attackObject).damage.parts;

      let totalDamageForAttack = 0;
      for (let i = 0; i < damageList.length; i++)
      {
        let damageArray = damageList[i];
        let damageDescription = damageArray[0];
        let damageType = damageArray[1];
        damageDescription = damageDescription.toLowerCase().replaceAll(`[${damageType.toLowerCase()}]`, "");
        let abilitiesModMatches = [...damageDescription.matchAll(/@abilities\.(str|dex|int|con|wis|cha)\.mod/gm)];
        for (let j = 0; j < abilitiesModMatches.length; j++)
        {
          let abilitiesDescription = abilitiesModMatches[j][0];
          let newAbilitiesDescription = abilitiesDescription.replaceAll("@abilities.", "attackObject.parent.data.data.abilities.");
          let abilitiesModValue = eval(newAbilitiesDescription);
          damageDescription = damageDescription.replaceAll(abilitiesDescription, abilitiesModValue);
        }

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
      for (let i = 0; i < matches.length; i++)
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
      for (let i = 1; i <= 9; i++)
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

        if (filteredMonsterTypes.filter(m => m === monsterObject.creaturetype.toLowerCase()).length === 0)
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
      let currentSystem = game.system.id;

      let encounterList = [];

      switch (currentSystem)
      {
        case "dnd5e":
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = SFLocalHelpers.createEncounterDnd5e("deadly", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = SFLocalHelpers.createEncounterDnd5e("hard", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = SFLocalHelpers.createEncounterDnd5e("medium", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 12; i++)
          {
            let currentEncounter = SFLocalHelpers.createEncounterDnd5e("easy", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          break;
        case "pf2e":
          for (let i = 0; i < 30; i++)
          {
            let currentEncounter = SFLocalHelpers.createEncounterPf2e(monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
      }
  
      return encounterList;
    }
  
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
  
            let randomMonsterXP = this.getDataObjectFromObject(randomMonster).details.xp.value;
            let currentEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat);
            let monsterCR = this.getDataObjectFromObject(randomMonster).details.cr;
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
            creatureCombatDetails["combatdata"] = this.allMonsters.find(m => m.actorid === randomMonster.id).combatdata;
            currentEncounter["creatures"].push(creatureCombatDetails);
            numberOfMonstersInCombat += numberOfMonstersToPutInCombat;
            currentEncounterXP += randomMonsterXP * numberOfMonstersToPutInCombat;
          }
          catch (error)
          {
            console.warn(`Failed to correctly add a random monster to the encounter. randomMonsterIndex: ${randomMonsterIndex}, monster name: ${monsterName}, Error: ${error}`);
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
            let filteredMonsterList = monsterList.filter(m => this.getXPFromActorObject(m) >= lowerBound && this.getXPFromActorObject(m) <= upperBound);
            if (filteredMonsterList.length === 0)
            {
              continue;
            }

            let randomMonsterIndex = Math.floor((Math.random() * filteredMonsterList.length));
            let randomMonster = filteredMonsterList[randomMonsterIndex];
            let monsterName = randomMonster.name;
            let randomMonsterXP = this.getXPFromActorObject(randomMonster);
            let monsterCR = this.getCRFromActorObject(randomMonster);
            let creatureCombatDetails = {};
            creatureCombatDetails["name"] = monsterName;
            creatureCombatDetails["quantity"] = numberOfCreatures;
            creatureCombatDetails["cr"] = monsterCR;
            creatureCombatDetails["xp"] = randomMonsterXP;
            creatureCombatDetails["combatdata"] = this.allMonsters.find(m => m.actorid === randomMonster.id || m.actorid === randomMonster._id).combatdata;
            currentEncounter["creatures"].push(creatureCombatDetails);
            break;
          }
        }
      }

      currentEncounter["xp"] = SFLocalHelpers.getAdjustedXPOfEncounter(currentEncounter);
      let generatedLootObject = SFLocalHelpers.getLootForEncounter(currentEncounter, params);
      currentEncounter["loot"] = generatedLootObject;
      return currentEncounter;
    }

    static getDataObjectFromObject(obj)
    {
      if (obj.data.data)
      {
        return obj.data.data;
      }
      else
      {
        return obj.data;
      }
    }

    static getXPFromActorObject(actor)
    {
      return this.getDataObjectFromObject(actor).details.xp.value;
    }

    static getCRFromActorObject(actor)
    {
      return this.getDataObjectFromObject(actor).details.cr;
    }

    static getDescriptionFromItemObject(item)
    {
      return this.getDataObjectFromObject(item).description.value;
    }

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

        let filteredMonsterList = monsterList.filter(m => this.getDataObjectFromObject(m).details.level.value === parseInt(averageLevelOfPlayers) +  parseInt(levelInRelationToParty));
        if (filteredMonsterList.length === 0)
        {
          continue;
        }

        let randomMonsterIndex = Math.floor((Math.random() * filteredMonsterList.length));
        let randomMonster = filteredMonsterList[randomMonsterIndex];
        let monsterName = randomMonster.name;
        let randomMonsterLevel = this.getDataObjectFromObject(randomMonster).details.level.value;
        let monsterCR = this.getDataObjectFromObject(randomMonster).details.cr;
        let creatureCombatDetails = {};
        creatureCombatDetails["name"] = monsterName;
        creatureCombatDetails["quantity"] = numberOfCreatures;
        creatureCombatDetails["cr"] = monsterCR;
        creatureCombatDetails["level"] = randomMonsterLevel;
        creatureCombatDetails["combatdata"] = this.allMonsters.find(m => m.actorid === randomMonster.id || m.actorid === randomMonster._id).combatdata;
        currentEncounter["creatures"].push(creatureCombatDetails);
      }

      currentEncounter["level"] = averageLevelOfPlayers;
      let generatedLootObject = SFLocalHelpers.getPF2ELootForEncounter(currentEncounter, params);
      currentEncounter["loot"] = generatedLootObject;
      currentEncounter["amounttoadjustencounter"] = amountToAdjustEncounter;
      return currentEncounter;
    }

    static getAdjustedXPString(amountToAdjustEncounter)
    {
      let plusOrMinus = amountToAdjustEncounter > 0 ? "+" : "";
      return `Needs ${plusOrMinus}${amountToAdjustEncounter} XP adjustment`;
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
        generatedLoot = SFLocalHelpers.getTreasureHordeForEncounter(currentEncounter);
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
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR4, d100Roll);
            }
            else if (monsterCR <= 10)
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR10, d100Roll);
            }
            else if (monsterCR <= 16)
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR16, d100Roll);
            }
            else
            {
              individualTreasureRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_INDIVIDUAL_TREASURE_CR17_PLUS, d100Roll);
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
  
        let d100Roll = this.getRollResult("1d100");
  
        let treasureHordeRowContents;
        if (maximumCRFromGroup <= 4)
        {
          currencyResultObject["cp"] += this.getRollResult("6d6") * 100;
          currencyResultObject["sp"] += this.getRollResult("3d6") * 100;
          currencyResultObject["gp"] += this.getRollResult("2d6") * 10;
          treasureHordeRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR4, d100Roll);
        }
        else if (maximumCRFromGroup <= 10)
        {
          currencyResultObject["cp"] += this.getRollResult("2d6") * 100;
          currencyResultObject["sp"] += this.getRollResult("2d6") * 1000;
          currencyResultObject["gp"] += this.getRollResult("6d6") * 100;
          currencyResultObject["pp"] += this.getRollResult("3d6") * 10;
          treasureHordeRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR10, d100Roll);
        }
        else if (maximumCRFromGroup <= 16)
        {
          currencyResultObject["gp"] += this.getRollResult("4d6") * 1000;
          currencyResultObject["pp"] += this.getRollResult("5d6") * 100;
          treasureHordeRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR16, d100Roll);
        }
        else
        {
          currencyResultObject["gp"] += this.getRollResult("12d6") * 1000;
          currencyResultObject["pp"] += this.getRollResult("8d6") * 1000;
          treasureHordeRowContents = SFLocalHelpers.getResultFromTreasureHordeTable(SFLOCALCONSTS.ENCOUNTER_TREASURE_HORDE_CR17_PLUS, d100Roll);
        }
  
        try
        {
          let gemOrArtRowContents = treasureHordeRowContents[0];
          otherResultObject = SFLocalHelpers.getArtOrGemsResult(gemOrArtRowContents);
          let magicItemsRowContents = treasureHordeRowContents[1];
          itemsResultObject = SFLocalHelpers.getMagicItemResult(magicItemsRowContents);
        }
        catch (error)
        {
          console.error(`Unable to generate Treasure Horde for maximum CR ${maximumCRFromGroup} and d100 roll of ${d100Roll}. Error: ${error}`);
        }
      }
  
      lootResultObject["currency"] = currencyResultObject;
      lootResultObject["items"] = itemsResultObject;
      lootResultObject["other"] = otherResultObject;
      lootResultObject["scrolls"] = scrollsResultObject;
      return lootResultObject;
    }
  
    static getResultFromTreasureHordeTable(rollTable, rollResult)
    {
      let rowSelected;
      for (let key in rollTable)
      {
        let value = rollTable[key];
  
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
  
      for (let i = 0; i < matches.length; i++)
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
    
        for(let objectName in magicItemTrackerDictionary) {
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
  
      let rollResult = SFLocalHelpers.getRollResult(rollDescription);
      let rollTableToUse = SFLocalHelpers.getArtOrGemsTable(matchResultGroups);
  
  
      for(let i = 0; i < rollResult; i++)
      {
        let gemOrArtResult = SFLocalHelpers.getRandomItemFromRollTable(rollTableToUse);
  
        // increment dictionary value
        gemOrArtTrackerDictionary[gemOrArtResult] = (gemOrArtTrackerDictionary[gemOrArtResult] || 0) + 1;
      }
  
      for(let objectName in gemOrArtTrackerDictionary) {
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
      return SFLocalHelpers.getResultFromTreasureHordeTable(rollTable, randomItemNumber);
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
      let newMonsterXP = this.getDataObjectFromObject(newMonster).details.xp.value;
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

}
class EncounterUtils5e
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
  
            let randomMonsterXP = FoundryUtils.getDataObjectFromObject(randomMonster).details.xp.value;
            let currentEncounterXPMultiplier = SFLocalHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat);
            let monsterCR = FoundryUtils.getDataObjectFromObject(randomMonster).details.cr;
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
            creatureCombatDetails["combatdata"] = SFLocalHelpers.allMonsters.find(m => m.actorid === randomMonster.id).combatdata;
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

}
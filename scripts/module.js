class SFHelpers {
  static allMonsters = {};
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
  }

  static async populateMonstersFromCompendiums() {
    if (!this.dictionariesInitialized)
    {
      this.initializeDictionaries();
    }
    if (!this.dictionariesPopulated)
    {
      const currentCompendium = game.packs.get("SharedData.monsters");
      for (const a of currentCompendium.index) {
          try {
            const actor = await currentCompendium.getDocument(a._id);
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
            console.log(`Actor id ${a._id} failed to load.`);
          }
      }
      this.dictionariesPopulated = true;
    }
    return this.allMonsters;
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
      let currentEncounter = SFHelpers.createEncounter("deadly", monsterList, averageLevelOfPlayers, numberOfPlayers);
      encounterList.push(currentEncounter);
    }
    for (let i = 0; i < 6; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("hard", monsterList, averageLevelOfPlayers, numberOfPlayers);
      encounterList.push(currentEncounter);
    }
    for (let i = 0; i < 6; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("medium", monsterList, averageLevelOfPlayers, numberOfPlayers);
      encounterList.push(currentEncounter);
    }
    for (let i = 0; i < 12; i++)
    {
      let currentEncounter = SFHelpers.createEncounter("easy", monsterList, averageLevelOfPlayers, numberOfPlayers);
      encounterList.push(currentEncounter);
    }

    return encounterList;
  }

  static createEncounter(targetedDifficulty, monsterList, averageLevelOfPlayers, numberOfPlayers)
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
    return currentEncounter;
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
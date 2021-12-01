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
    // Generate 5 deadly encounters
    for (let i = 0; i < 5; i++) {
      let currentEncounter = {};
      currentEncounter["difficulty"] = "deadly";
      currentEncounter["creatures"] = [];
      let targetEncounterXP = SFCONSTS.ENCOUNTER_DIFFICULTY_XP_TABLES["deadly"][averageLevelOfPlayers] * numberOfPlayers;
      let currentEncounterXP = 0;
      let numberOfMonstersInCombat = 0;

      let j = 0;
      while (j < 50) // attempt to put in 50 monsters before giving up so we don't spin forever
      {
        let randomMonsterIndex = Math.floor((Math.random() * monsterList.length));
        let randomMonster = monsterList[randomMonsterIndex];
        let randomMonsterXP = randomMonster.data.data.details.xp.value;
        let currentEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(numberOfMonstersInCombat);
        let monsterName = randomMonster.name;
        let monsterCR = randomMonster.data.data.details.cr;

        // If we're within 10% of budget, let's stop
        if (currentEncounterXP * currentEncounterXPMultiplier > targetEncounterXP * 0.9)
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
          console.log(`Monster ${monsterName} too dangerous`);
          continue;
        }

        let numberOfMonstersToPutInCombat = Math.floor((Math.random() * numberOfMonstersAllowedInCombat)) + 1;
        let creatureCombatDetails = {};
        creatureCombatDetails["name"] = monsterName;
        creatureCombatDetails["quantity"] = numberOfMonstersToPutInCombat;
        creatureCombatDetails["cr"] = monsterCR;
        currentEncounter["creatures"].push(creatureCombatDetails);
        numberOfMonstersInCombat += numberOfMonstersToPutInCombat;
        currentEncounterXP += randomMonsterXP * numberOfMonstersToPutInCombat;
      }

      encounterList.push(currentEncounter);
    }

    return encounterList;
  }

  static getNumberOfMonstersAllowedInCombat(currentEncounter, fullMonsterList, targetEncounterXP, newMonster)
  {
    let currentEncounterMonsterCount = 0;
    let currentEncounterXP = 0;
    for (const monsterName in currentEncounter["creatures"])
    {
      let monster = fullMonsterList.find(m => m.name === monsterName);
      if (!monster)
      {
        break;
      }
      let currentMonsterXP = monster.data.data.details.xp.value;
      currentEncounterMonsterCount += count;
      currentEncounterXP = currentMonsterXP * count;
    }

    let currentEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount);
    let currentAdjsutedEncounterXP = currentEncounterXPMultiplier * currentEncounterXP;

    let newMonsterEncounterXPMultiplier = SFHelpers.getCurrentEncounterXPMultiplier(currentEncounterMonsterCount + 1);
    let maximumAllowedMonsterXP = targetEncounterXP - currentEncounterXP * newMonsterEncounterXPMultiplier;
    let numberOfNewMonstersAllowed = Math.floor(maximumAllowedMonsterXP / newMonster.data.data.details.xp.value);
    return numberOfNewMonstersAllowed;
  }

  static getCurrentEncounterXPMultiplier(monsterCount)
  {
    let latestEncounterMultiplier;
    for (const key in Object.keys(SFCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS))
    {
      let value = SFCONSTS.ENCOUNTER_MONSTER_MULTIPLIERS[key];
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
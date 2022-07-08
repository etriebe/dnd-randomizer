import { ActorUtils } from "./utils/ActorUtils";
import { GeneralUtils } from "./utils/GeneralUtils";
import { FoundryUtils } from "./utils/FoundryUtils";
import { SFLOCALCONSTS } from "./localconst";
import { SFCONSTS } from "./main";
import { EncounterUtilsPf2e } from "./pf2e/EncounterUtilsPf2e";
import { EncounterUtils5e } from "./dnd5e/EncounterUtils5e";

export class SFLocalHelpers {
    static allMonsters = [];
    static creatureTypeCount = {};
    static environmentCreatureCount = {};
    static spellsByLevel = {};
    static dictionariesInitialized = false;
    static dictionariesPopulated = false;
    static _indexCacheDate;
    
  
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
      let useSavedIndex = game.settings.get(SFCONSTS.MODULE_NAME, 'useSavedIndex');
      if (!this.dictionariesInitialized)
      {
        this.initializeDictionaries();
      }

      if (this.dictionariesPopulated && !forceReload)
      {
        console.log(`Dictionaries are already reloaded and we aren't forcing a reindex.`);
        return;
      }

      let loadResult = false;
      if (useSavedIndex && !forceReload && !this.dictionariesPopulated)
      {
        loadResult = await this.loadFromCache();
      }

      if (!this.dictionariesPopulated || forceReload)
      {
        let promises = [];
        promises.push(this.populateItemsFromCompendiums());
        promises.push(this.populateMonstersFromCompendiums());
        await Promise.all(promises);
        this.calculateCreatureTypeCounts();
        this.calculateEnvironmentCreatureCounts();
        this.dictionariesPopulated = true;
        this._indexCacheDate = GeneralUtils.getCurrentDateTime();
      }

      if (useSavedIndex && (forceReload || !loadResult))
      {
        await this.saveCache();
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
          let currentClassLevel = FoundryUtils.getDataObjectFromObject(playerClasses[playerClassList[i]]).levels;
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
  
    static async populateItemsFromCompendiums()
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
            let spellLevel = ActorUtils.getLevelKeyForSpell(currentSpell);
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

    static async populateMonstersFromCompendiums()
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
            let actorDataObject = FoundryUtils.getDataObjectFromObject(actor);
            let actorName = actor.name;
            actorName = actorName.replaceAll("\"", "");
            if (actorName === "#[CF_tempEntity]")
            {
              console.log(`Skipping actor ${actorName}`);
              continue;
            }

            let actorObject = ActorUtils.getActorObject(actor);

            if (this.allMonsters.filter((m) => m.actorname === actorObject.actorname).length > 0)
            {
              console.log(`Already have actor ${actorName}, actor id ${actor._id} in dictionary`);
              continue;
            }
            let monsterObject = {};
            
            monsterObject["actor"] = actorObject;
            monsterObject["actorname"] = actorObject.actorname;
            monsterObject["actorid"] = actorObject.actorid;
            monsterObject["compendiumname"] = compendium.metadata.label;
            monsterObject["environment"] = actorObject.environment;
            monsterObject["creaturetype"] = actorObject.creaturetype;
            monsterObject["combatdata"] = actorObject.combatdata;
            this.allMonsters.push(monsterObject);
          } 
          catch (error) {
            console.warn(error);
            console.warn(`Actor id ${entry._id}, name ${entry.name} failed to get added.`);
          }
        }
      }
    }

    static async loadFromCache()
    {
      let spellsbyLevelFromCache = await this.loadFile(SFLOCALCONSTS.SPELL_CACHE_FILE);
      if (spellsbyLevelFromCache)
      {
        this.spellsByLevel = spellsbyLevelFromCache;
      }

      const creatureTypes = SFLOCALCONSTS.CREATURE_TYPES.sort();
      for (let currentCreatureType of creatureTypes) {
        let fileName = SFLOCALCONSTS.MONSTER_CACHE_FILE_FORMAT.replace("##creaturetype##", currentCreatureType);
        let currentCreatureTypeList = await this.loadFile(fileName);
        if (!currentCreatureTypeList)
        {
          continue;
        }
        this.creatureTypeCount[currentCreatureType] = currentCreatureTypeList.length;
        this.allMonsters = this.allMonsters.concat(currentCreatureTypeList);
      }

      let generalCache = await this.loadFile(SFLOCALCONSTS.GENERAL_CACHE_FILE);
      if (generalCache)
      {
        this._indexCacheDate = generalCache._indexCacheDate;
        this.creatureTypeCount = generalCache.creatureTypeCount;
        this.environmentCreatureCount = generalCache.environmentCreatureCount;
      }
      else
      {
        this.calculateEnvironmentCreatureCounts();
      }

      console.log(`${this.allMonsters.length} monsters loaded from cache date ${this._indexCacheDate} `);

      if (this.allMonsters.length > 0)
      {
        this.dictionariesPopulated = true;
        this.dictionariesInitialized = true;
        return true;
      }
      else
      {
        return false;
      }
    }

    static calculateCreatureTypeCounts()
    {
      this.creatureTypeCount = {};
      for (let creatureType of SFLOCALCONSTS.CREATURE_TYPES)
      {
        let monsterCount = this.allMonsters.filter(m => m.creaturetype && m.creaturetype.toLowerCase() === creatureType).length;
        this.creatureTypeCount[creatureType] = monsterCount;
      }
    }

    static calculateEnvironmentCreatureCounts()
    {
      this.environmentCreatureCount = {};
      for (let environment of SFCONSTS.GEN_OPT.environment)
      {
        let monsterCount = this.allMonsters.filter(m => m.environment.filter(e => e === environment).length > 0).length;
        this.environmentCreatureCount[environment] = monsterCount;
      }
    }

    static getCachePath(fileName)
    {
      let cacheFolder = this.getSystemCacheFolder();
      return `${cacheFolder}/${fileName}`;
    }

    static getSystemCacheFolder()
    {
      let systemID = FoundryUtils.getSystemId();
      return `${SFLOCALCONSTS.CACHE_FOLDER}/${systemID}`;
    }

    static getBaseCacheFolder()
    {
      let systemID = FoundryUtils.getSystemId();
      return `${SFLOCALCONSTS.CACHE_FOLDER}/${systemID}`;
    }

    static async loadFile(fileName)
    {
      await this.ensureFolder(this.getSystemCacheFolder());
      let fullFilePath = this.getCachePath(fileName);
      let fileExists = await this.fileExists(this.getSystemCacheFolder(), fileName);
      if (!fileExists)
      {
        console.warn(`File ${fullFilePath} does not exist`);
        return null;
      }

      let storedCacheResponse = await (await fetch(fullFilePath));
      if(storedCacheResponse.ok){
        return JSON.parse(await storedCacheResponse.text());
      }
    }

    static async saveCache(){
      const data = {
        _indexCacheDate : this._indexCacheDate,
        creatureTypeCount : this.creatureTypeCount,
        environmentCreatureCount : this.environmentCreatureCount
      };
      await this.saveObjectToCache(SFLOCALCONSTS.SPELL_CACHE_FILE, this.spellsByLevel);
      await this.saveObjectToCache(SFLOCALCONSTS.GENERAL_CACHE_FILE, data);
      const creatureTypes = SFLOCALCONSTS.CREATURE_TYPES.sort();
      for (let currentCreatureType of creatureTypes) {
        let monsterList = this.allMonsters.filter(m => m.creaturetype && currentCreatureType === m.creaturetype.toLowerCase());
        let fileName = SFLOCALCONSTS.MONSTER_CACHE_FILE_FORMAT.replace("##creaturetype##", currentCreatureType);
        await this.saveObjectToCache(fileName, monsterList);
      }

      console.log(`Saved ${this.allMonsters.length} monsters to cache`);
      await this.cleanUpOldCacheObjects();
    }

    static async saveObjectToCache(fileName, object)
    {
      let blob = new Blob([JSON.stringify(object)], {
        type: 'text/plain'
      });

      await this.ensureFolder(this.getSystemCacheFolder());
      let file = new File([blob], fileName, { type: "text" });
      await FilePicker.upload("data", this.getSystemCacheFolder(), file, {});
    }

    static async fileExists(fileFolder, fileName)
    {
      let fullFilePath = `${fileFolder}/${fileName}`;
      await this.ensureFolder(fileFolder);
      let cacheDir = await FilePicker.browse("data", fileFolder);
      if (cacheDir.files.filter(f => f === fullFilePath).length > 0)
      {
        return true;
      }
      else
      {
        return false;
      }
    }

    static async ensureFolder(fileFolder)
    {
      let folderArray = fileFolder.split("/");
      let currentFolderArray = [];
      let currentFolderPath = "";
      for (let folder of folderArray)
      {
        let currentDir = await FilePicker.browse("data", currentFolderPath);
        currentFolderArray.push(folder);
        currentFolderPath = currentFolderArray.join("/");
        if (currentDir.dirs.filter(d => d === currentFolderPath).length === 0)
        {
          await FilePicker.createDirectory("data", currentFolderPath, {});
        }
      }
    }

    static async cleanUpOldCacheObjects()
    {
      // null out old settings
      await game.settings.set(SFCONSTS.MODULE_NAME, 'savedMonsterIndex', []);
      await game.settings.set(SFCONSTS.MODULE_NAME, 'savedSpellIndex', {});
    }

    static async filterMonstersFromCompendiums()
    {
      let filteredMonsters = [];

      const constCompFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterCompendiums"
      );

      const constMonsterTypeFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterMonsterTypes"
      );

      const savedEnvironmentSettings = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "environmentsToCreateEncountersFor"
        );

      const filteredCompendiums = Array.from(FoundryUtils.getCompendiums()).filter((p) => {
        if (p.documentName !== "Actor") return false;
        const el = constCompFilter.find((i) => Object.keys(i)[0] == p.collection);
        return !el || el[p.collection] ? true : false;
      });

      const filteredMonsterTypes = Array.from(SFLOCALCONSTS.CREATURE_TYPES).filter((p) => {
        const el = constMonsterTypeFilter.find((i) => Object.keys(i)[0] == p);
        return !el || el[p] ? true : false;
      });

      const filteredEnvironments = Array.from(SFCONSTS.GEN_OPT.environment).filter((e) => {
        const el = savedEnvironmentSettings.find((i) => Object.keys(i)[0] == e);
        return !el || el[e] ? true : false;
      });

      for (const monsterObject of this.allMonsters)
      {
        try {
          if (filteredCompendiums.filter((c) => c.metadata.label === monsterObject.compendiumname).length === 0) 
          {
            continue;
          }

          if (filteredMonsterTypes.filter(m => monsterObject.creaturetype && m === monsterObject.creaturetype.toLowerCase()).length === 0)
          {
            continue;
          }

          if (monsterObject.environment.filter(e => filteredEnvironments.filter(f => f === e).length > 0).length > 0)
          {
            filteredMonsters.push(monsterObject.actor);
          }
        }
        catch (error) {
          console.warn(`Unable to process creature: Name:${monsterObject.name}, Id: ${ActorUtils.getActorId(monsterObject)}`);
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
            let currentEncounter = EncounterUtils5e.createEncounterDnd5e("deadly", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = EncounterUtils5e.createEncounterDnd5e("hard", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = EncounterUtils5e.createEncounterDnd5e("medium", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 12; i++)
          {
            let currentEncounter = EncounterUtils5e.createEncounterDnd5e("easy", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          break;
        case "pf2e":
          for (let i = 0; i < 30; i++)
          {
            let currentEncounter = EncounterUtilsPf2e.createEncounterPf2e(monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
      }
      return encounterList;
    }
}
import { ActorUtils } from "./utils/ActorUtils.js";
import { GeneralUtils } from "./utils/GeneralUtils.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";
import { SFLOCALCONSTS } from "./localconst.js";
import { SFCONSTS } from "./main.js";
import { EncounterUtilsPf2e } from "./pf2e/EncounterUtilsPf2e.js";
import { EncounterUtils5e } from "./dnd5e/EncounterUtils5e.js";

export class SFLocalHelpers {
    static allMonsters = [];
    static allItems = []
    static creatureTypeCount = {};
    static environmentCreatureCount = {};
    static spellsByLevel = {};
    static folderBrowseCache = {};
    static dictionariesInitialized = false;
    static dictionariesPopulated = false;
    static _indexCacheDate;

    static initializeDictionaries() {
      this.spellsByLevel = {};
      this.spellsByLevel[0] = [];
      this.spellsByLevel[1] = [];
      this.spellsByLevel[2] = [];
      this.spellsByLevel[3] = [];
      this.spellsByLevel[4] = [];
      this.spellsByLevel[5] = [];
      this.spellsByLevel[6] = [];
      this.spellsByLevel[7] = [];
      this.spellsByLevel[8] = [];
      this.spellsByLevel[9] = [];
      this.spellsByLevel[10] = [];
      this.dictionariesInitialized = true;
    }
  
    static async populateObjectsFromCompendiums(forceReload) {
      const constCompFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterCompendiums"
      );
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
        await this.populateItemsFromCompendiums(constCompFilter);
        await this.populateMonstersFromCompendiums(constCompFilter);
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
          let currentClassLevel = FoundryUtils.getSystemVariableForObject(playerClasses[playerClassList[i]], "ClassLevel");
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

    static async populateItemsFromCompendiums(constCompFilter)
    {
      this.allItems = [];
      this.initializeDictionaries();
      let filteredCompendiums = game.packs.filter((p) => p.metadata.type === "Item" || p.metadata.entity === "Item");
      for (let compendium of filteredCompendiums) {
        let shouldProcessCompendium = constCompFilter.find(i => Object.keys(i)[0] == compendium.collection);
        if (shouldProcessCompendium && !shouldProcessCompendium[compendium.collection])
        {
          console.log(`Skipping indexing compendium ${compendium.collection} because it wasn't selected`);
          continue;
        }

        if (!compendium)
        {
          break;
        }

        let fieldsToIndex = [
          FoundryUtils.getSystemVariable("ItemRarity"),
          FoundryUtils.getSystemVariable("ItemPrice"),
          FoundryUtils.getSystemVariable("SpellLevel")
        ];

        if (FoundryUtils.getSystemId() === "dnd5e")
        {
          fieldsToIndex.push(FoundryUtils.getSystemVariable("CreatureCR"));
        }

        const index = await compendium.getIndex({ fields: fieldsToIndex });

        if (index.size === 0)
        {
          console.log(`Skipping Compendium ${compendium.collection} because it was empty`)
          continue;
        }
        else
        {
          console.log(`Indexing compendium ${compendium.collection}`);
        }

        for (let item of index) {
          if (!item)
          {
            break;
          }

          /*
          Possible item types:
            action
            ancestry
            armor
            background
            backpack
            class
            condition
            consumable
            deity
            effect
            equipment
            feat
            heritage
            kit
            spell
            treasure
            weapon
          */

          if (item.type == "spell")
          {
            try
            {
              const currentSpell = await compendium.getDocument(item._id);
              let spellName = item.name;
              let spellLevel = FoundryUtils.getSystemVariableForObject(item, "SpellLevel");
              // let spellLevel = ActorUtils.getLevelKeyForSpell(unparsedSpellLevel);
              if (!this.spellsByLevel[spellLevel].find(s => s.name === spellName))
              {
                this.spellsByLevel[spellLevel].push(item);
              }
            }
            catch (error)
            {
              console.log(error);
              console.log(`Spell id ${item._id} failed to get added.`);
            }
          }
          else if (item.type == "armor" || item.type == "consumable" || item.type == "equipment" || item.type == "treasure" || item.type == "weapon")
          {
            if (item.name === "#[CF_tempEntity]")
            {
              continue;
            }
            try
            {
              let itemRarity = FoundryUtils.getSystemVariableForObject(item, "ItemRarity");

              if (!itemRarity  || itemRarity === "")
              {
                itemRarity = "common";
              }
  
              let itemPrice = FoundryUtils.getSystemVariableForObject(item, "ItemPrice");
              if (!itemPrice)
              {
                itemPrice = 0;
              }
              let itemObject = {};
              itemObject["itemtype"] = item.type;
              itemObject["itemcost"] = itemPrice;
              itemObject["compendiumname"] = compendium.collection;
              itemObject["itemname"] = item.name;
              itemObject["itemid"] = item._id;
              itemObject["rarity"] = itemRarity;
              itemObject["item"] = item;
              this.allItems.push(itemObject);
            }
            catch(error)
            {
              // console.log(error);
              console.log(`Item id ${item._id} (${item.name}) failed to get added.`)
            }
          }
        }
      }
    }

    static async populateMonstersFromCompendiums(constCompFilter)
    {
      this.allMonsters = [];
      let filteredCompendiums = game.packs.filter((p) => p.metadata.type === "Actor" || p.metadata.entity === "Actor");
      for (let compendium of filteredCompendiums) {
        let shouldProcessCompendium = constCompFilter.find(i => Object.keys(i)[0] == compendium.collection);
        if (shouldProcessCompendium && !shouldProcessCompendium[compendium.collection])
        {
          console.log(`Skipping indexing compendium ${compendium.collection} because it wasn't selected`);
          continue;
        }

        if (!compendium)
        {
          break;
        }

        let fieldsToIndex = [
          FoundryUtils.getSystemVariable("CreatureType"),
        ];

        if (FoundryUtils.getSystemId() === "dnd5e")
        {
          fieldsToIndex.push(FoundryUtils.getSystemVariable("CreatureEnvironment"));
          fieldsToIndex.push(FoundryUtils.getSystemVariable("CreatureCR"));
        }

        const index = await compendium.getIndex({ fields: fieldsToIndex });

        if (index.size === 0)
        {
          console.log(`Skipping Compendium ${compendium.collection} because it was empty`)
          continue;
        }
        else
        {
          console.log(`Indexing compendium ${compendium.collection}`);
        }

        for (let actor of index) {
          if (!actor)
          {
            break;
          }

          if (actor.type != "npc")
          {
            continue;
          }

          try {
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
            monsterObject["compendiumname"] = compendium.collection;
            monsterObject["environment"] = actorObject.environment;
            monsterObject["creaturetype"] = actorObject.creaturetype;
            this.allMonsters.push(monsterObject);
          } 
          catch (error) {
            console.warn(error);
            console.warn(`Actor id ${actor._id}, name ${actor.name} failed to get added.`);
          }
        }
      }
    }

    static async loadFromCache()
    {
      const constCompFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterCompendiums"
      );
      let spellsbyLevelFromCache = await this.loadFile(SFLOCALCONSTS.SPELL_CACHE_FILE);
      if (spellsbyLevelFromCache)
      {
        this.spellsByLevel = spellsbyLevelFromCache;
      }

      const systemCacheFolder = SFLocalHelpers.getSystemCacheFolder();
      const filesInCacheFolder = await SFLocalHelpers.getFilesInFolder(systemCacheFolder);
      for (let i = 0; i < filesInCacheFolder.files.length; i++) {
        let fileName = filesInCacheFolder.files[i];
        let currentCreatureTypeMatch = decodeURIComponent(fileName).match(/\/(?<creatureType>[\w\d\,\s]+)_creature_cache.json/);
        if (!currentCreatureTypeMatch)
        {
          continue;
        }

        let currentCreatureType = currentCreatureTypeMatch.groups.creatureType;
        let currentCreatureTypeList = await this.loadFile(fileName, true);
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
        this.environmentCreatureCount = generalCache.environmentCreatureCount;
      }
      else
      {
        this.calculateEnvironmentCreatureCounts();
      }

      let itemCache = await this.loadFile(SFLOCALCONSTS.ITEM_CACHE_FILE);
      if (itemCache)
      {
        this.allItems = itemCache;
      }
      else
      {
        await this.populateItemsFromCompendiums(constCompFilter);
      }

      console.log(`${this.allMonsters.length} monsters loaded from cache date ${this._indexCacheDate} `);
      console.log(`${this.allItems.length} items loaded from cache`);

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
      const creatureTypeList = this.allMonsters.map(i => i.creaturetype).filter(GeneralUtils.onlyUnique).sort();
      for (let creatureType of creatureTypeList)
      {
        let monsterCount = this.allMonsters.filter(m => m.creaturetype && m.creaturetype.toLowerCase() === creatureType.toLowerCase()).length;
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
      let cacheFolder = SFLocalHelpers.getSystemCacheFolder();
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

    static async loadFile(fileName, hasCacheFolderInPath = false)
    {
      const isUrlAbsolute = (url) => /^https?:\/\//.test(url);
      if (isUrlAbsolute(fileName)) {
        try {
          // This is an absolute URL. Attempt to fetch first and rely on browser for caching
          const rsp = await fetch(fileName);
          if (rsp.ok) {
            // File exists at absolute path. Attempt to parse as JSON
            return await rsp.json();
          }
          // Fetch unsuccessful. Revert to fallback
          console.warn(`Unable to fetch file at absolute URL ${ fileName }`);
        } catch (e) {
          console.error(`Error fetching file at absolute URL ${ fileName }`, e);
        }
      }
        
      const cacheFolder = SFLocalHelpers.getSystemCacheFolder();
      await this.ensureFolder(cacheFolder);
      if (hasCacheFolderInPath)
      {
        fileName = fileName.replace(cacheFolder, "").replace("/","");
      }

      let fullFilePath = this.getCachePath(fileName);
      fullFilePath = fullFilePath.replaceAll("//","/");
      let fileExists = false;
      fileExists = await this.fileExists(cacheFolder, fileName);

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
      await this.saveObjectToCache(SFLOCALCONSTS.ITEM_CACHE_FILE, this.allItems);
      await this.saveObjectToCache(SFLOCALCONSTS.GENERAL_CACHE_FILE, data);
      const creatureTypes = this.allMonsters.map(i => i.creaturetype).filter(GeneralUtils.onlyUnique).sort();
      for (let currentCreatureType of creatureTypes) {
        let monsterList = this.allMonsters.filter(m => m.creaturetype && currentCreatureType.toLowerCase() === m.creaturetype.toLowerCase());
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

      await this.ensureFolder(SFLocalHelpers.getSystemCacheFolder());
      let file = new File([blob], fileName, { type: "text" });
      await FilePicker.upload(FoundryUtils.getFoundryDataFolder(), SFLocalHelpers.getSystemCacheFolder(), file, {});
    }

    static async fileExists(fileFolder, fileName)
    {
      let fullFilePath = `${fileFolder}/${fileName}`;
      await this.ensureFolder(fileFolder);
      let source = FoundryUtils.getFoundryDataFolder();
      let cacheDir = await FilePicker.browse(source, fileFolder);
      if (cacheDir.files.filter(f => source === "forgevtt" ? f.endsWith(fullFilePath) : f === fullFilePath).length > 0)
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
        let currentDir = await SFLocalHelpers.browseFolder(currentFolderPath);
        currentFolderArray.push(folder);
        currentFolderPath = currentFolderArray.join("/");
        if (currentDir.dirs.filter(d => d === currentFolderPath).length === 0)
        {
          await FilePicker.createDirectory(FoundryUtils.getFoundryDataFolder(), currentFolderPath, {});
        }
      }
    }

    static async browseFolder(fileFolder)
    {
      if (this.folderBrowseCache[fileFolder])
      {
        console.log(`Returning browse cache for ${fileFolder}`);
        return this.folderBrowseCache[fileFolder];
      }

      let currentDir = await FilePicker.browse(FoundryUtils.getFoundryDataFolder(), fileFolder);
      this.folderBrowseCache[fileFolder] = currentDir;
      return currentDir;
    }

    static async getFilesInFolder(fileFolder)
    {
      await SFLocalHelpers.ensureFolder(fileFolder);
      let files = await FilePicker.browse(FoundryUtils.getFoundryDataFolder(), fileFolder);
      return files;
    }

    static async cleanUpOldCacheObjects()
    {
      // null out old settings
      await game.settings.set(SFCONSTS.MODULE_NAME, 'savedMonsterIndex', []);
      await game.settings.set(SFCONSTS.MODULE_NAME, 'savedSpellIndex', {});
    }

    static async filterItemsFromCompendiums()
    {
      let filteredItems = [];

      const constCompFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterCompendiums"
      );

      const constTreasureFilter = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "filterTreasure"
      );

      const savedEnvironmentSettings = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "environmentsToCreateEncountersFor"
        );

      const filteredCompendiums = Array.from(FoundryUtils.getCompendiums()).filter((p) => {
        if (p.documentName !== "Item") return false;
        const el = constCompFilter.find((i) => Object.keys(i)[0] == p.collection);
        return !el || el[p.collection] ? true : false;
      });

      let allItemRarities = this.allItems.map(i => i.rarity).filter(GeneralUtils.onlyUnique).sort();
      const filteredTreasureTypes = Array.from(allItemRarities).filter((p) => {
        const el = constTreasureFilter.find((i) => Object.keys(i)[0] == p);
        return !el || el[p] ? true : false;
      });

      for (const itemObject of this.allItems)
      {
        try {
          if (filteredCompendiums.filter((c) => c.metadata.id === itemObject.compendiumname).length === 0) 
          {
            continue;
          }

          if (filteredTreasureTypes.filter(m => itemObject.rarity && m === itemObject.rarity.toLowerCase()).length === 0)
          {
            continue;
          }

          filteredItems.push(itemObject);
        }
        catch (error) {
          console.warn(`Unable to process item: Name:${itemObject.itemname}, Id: ${itemObject.itemid}`);
        }
      }

      return filteredItems;
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

      const filteredMonsterTypes = Array.from(Object.keys(SFLocalHelpers.creatureTypeCount)).filter((p) => {
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
          if (filteredCompendiums.filter((c) => c.metadata.id === monsterObject.compendiumname).length === 0) 
          {
            continue;
          }

          if (filteredMonsterTypes.filter(m => monsterObject.creaturetype && m === monsterObject.creaturetype).length === 0)
          {
            continue;
          }

          let extraEnvironmentMapping = SFLOCALCONSTS.TOME_OF_BEASTS_CREATURE_ENVIRONMENT_MAPPING[monsterObject.actorname];
          if (extraEnvironmentMapping && extraEnvironmentMapping.filter(e => filteredEnvironments.filter(f => f === e).length > 0).length > 0)
          {
            console.log(`Added monster ${monsterObject.actorname} because it appeared in TOME_OF_BEASTS_CREATURE_ENVIRONMENT_MAPPING`);
            filteredMonsters.push(monsterObject.actor);
            continue;
          }

          if (monsterObject.environment.filter(e => filteredEnvironments.filter(f => f === e).length > 0).length > 0)
          {
            filteredMonsters.push(monsterObject.actor);
          }
        }
        catch (error) {
          console.warn(`Unable to process creature: Name:${monsterObject.actorname}, Id: ${ActorUtils.getActorId(monsterObject)}`);
        }
      }

      return filteredMonsters;
    }
  
    static async createEncounters(monsterList, filteredItems, params, numberOfEncounters)
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
            let currentEncounter = await EncounterUtils5e.createEncounterDnd5e("deadly", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = await EncounterUtils5e.createEncounterDnd5e("hard", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 6; i++)
          {
            let currentEncounter = await EncounterUtils5e.createEncounterDnd5e("medium", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          for (let i = 0; i < 12; i++)
          {
            let currentEncounter = await EncounterUtils5e.createEncounterDnd5e("easy", monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
          break;
        case "pf2e":
          for (let i = 0; i < 30; i++)
          {
            let currentEncounter = EncounterUtilsPf2e.createEncounterPf2e(monsterList, filteredItems, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
      }
      return encounterList;
    }
}
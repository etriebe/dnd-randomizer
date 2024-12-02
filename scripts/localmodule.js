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

      if (!this.dictionariesInitialized)
      {
        this.initializeDictionaries();
      }

      if (this.dictionariesPopulated && !forceReload)
      {
        console.log(`Dictionaries are already reloaded and we aren't forcing a reindex.`);
        return;
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

    static getActivePlayersCountAndLevels()
    {
      const playerList = SFLocalHelpers.getActivePlayersWithFilterDialogApplied();
      let levelList = [];
      for (let player of playerList) {
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

    static getActivePlayersWithFilterDialogApplied()
    {
      let playerCharacters = this.getListOfActivePlayers();

      const savedPlayerSettings = game.settings.get(
        SFCONSTS.MODULE_NAME,
        "playerCharactersToCreateEncountersFor"
        );
      let playerList = [];

      for (let player of playerCharacters) {
        let playerName = player.name;
        const el = savedPlayerSettings.find(i => Object.keys(i)[0] === playerName);
        if (el && el[playerName] === false)
        {
          continue;
        }

        playerList.push(player);
      }

      return playerList;
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
              // Left for easy debugging purposes
              // const currentSpell = await compendium.getDocument(item._id);
              let spellName = item.name;
              let spellLevel = FoundryUtils.getSystemVariableForObject(item, "SpellLevel");
              if (!this.spellsByLevel[spellLevel].find(s => s.name === spellName))
              {
                this.spellsByLevel[spellLevel].push(item);
              }
            }
            catch (error)
            {
              console.log(error);
              console.log(`Spell id ${item._id}, name ${item.name}, pack ${compendium.collection} failed to get added.`);
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
              console.log(error);
              console.log(`Item id ${item._id}, name ${item.name}, pack ${compendium.collection} failed to get added.`);
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
          FoundryUtils.getSystemVariable("CreatureCR"),
        ];

        if (FoundryUtils.getSystemId() === "dnd5e")
        {
          fieldsToIndex.push(FoundryUtils.getSystemVariable("CreatureEnvironment"));
          fieldsToIndex.push(FoundryUtils.getSystemVariable("CreatureBiography"));
          // fieldsToIndex.push(FoundryUtils.getSystemVariable("CreatureCR"));
        }

        if (FoundryUtils.getSystemId() === "pf2e")
        {
          fieldsToIndex.push("img");
        }

        let packIndex = await compendium.getIndex({ fields: fieldsToIndex });

        if (packIndex.size === 0)
        {
          console.log(`Skipping Compendium ${compendium.collection} because it was empty`)
          continue;
        }
        else
        {
          console.log(`Indexing compendium ${compendium.collection}`);
        }

        if (game.compendiumArt.enabled)
        {
          packIndex = packIndex.map((x) =>
          {
            const actorArt = game.compendiumArt.get(x.uuid) ?? {};
            x.img = actorArt.actor ?? actorArt.token ?? x.img;
            if (x.img === '')
            {
              x.img = 'icons/svg/mystery-man.svg';
            }
            return x;
          });
        }

        const ignoreCreaturesWithNoImage = game.settings.get( SFCONSTS.MODULE_NAME, "ignoreCreaturesWithNoImage");

        for (let actor of packIndex) {
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

            let actorObject = ActorUtils.getActorObject(actor, compendium.collection);

            if (this.allMonsters.filter((m) => m.actorname === actorObject.actorname).length > 0)
            {
              console.log(`Already have actor ${actorName}, actor id ${actor._id} in dictionary`);
              continue;
            }

            if (ignoreCreaturesWithNoImage && (actor.img === "systems/pf2e/icons/default-icons/npc.svg" || actor.img === "icons/svg/mystery-man.svg"))
            {
              console.log(`Skipping actor ${actorName} because it has a default image and our setting requested it.`);
              continue;
            }

            let creatureType = actorObject.creaturetype;

            if (!creatureType)
            {
              creatureType = "Unknown";
            }

            let monsterObject = {};

            monsterObject["actor"] = actorObject;
            monsterObject["actorname"] = actorObject.actorname;
            monsterObject["actorid"] = actorObject.actorid;
            monsterObject["compendiumname"] = compendium.collection;
            monsterObject["environment"] = actorObject.environment;
            monsterObject["creaturetype"] = creatureType;
            this.allMonsters.push(monsterObject);
          } 
          catch (error) {
            console.warn(error);
            console.warn(`Actor id ${actor._id}, name ${actor.name}, pack ${compendium.collection} failed to get added.`);
          }
        }
      }
    }

    static calculateCreatureTypeCounts()
    {
      this.creatureTypeCount = {};
      const toLowerCase = true;
      const creatureTypeList = GeneralUtils.getUniqueValuesFromListOfArrays(this.allMonsters.map(i => i.creaturetype), toLowerCase);
      for (let creatureType of creatureTypeList)
      {
        let monsterCount = this.allMonsters.filter(m => m.creaturetype && m.creaturetype.includes(creatureType.toLowerCase())).length;
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

          if (filteredMonsterTypes.filter(m => monsterObject.creaturetype && monsterObject.creaturetype.includes(m)).length === 0)
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
  
    static async filterMonstersByType(monsterType)
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

      const filteredMonsterTypes = monsterType;

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

          if (filteredMonsterTypes.filter(m => monsterObject.creaturetype && monsterObject.creaturetype.includes(m)).length === 0)
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
            let currentEncounter = await EncounterUtilsPf2e.createEncounterPf2e(monsterList, filteredItems, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
      }
      return encounterList;
    }

    static async createDynamicEncounters(monsterList, filteredItems, params)
    {
      let averageLevelOfPlayers = params.averageLevelOfPlayers;
      let numberOfPlayers = params.numberOfPlayers;
      let currentSystem = game.system.id;
      let difficulty = params.difficulty;
      let encounterList = [];

      switch (currentSystem)
      {
        case "dnd5e":
            let currentEncounter = await EncounterUtils5e.createEncounterDnd5e(difficulty, monsterList, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          break;
        case "pf2e":
          for (let i = 0; i < 30; i++)
          {
            let currentEncounter = await EncounterUtilsPf2e.createEncounterPf2e(monsterList, filteredItems, averageLevelOfPlayers, numberOfPlayers, params);
            encounterList.push(currentEncounter);
          }
      }
      return encounterList;
    }
}
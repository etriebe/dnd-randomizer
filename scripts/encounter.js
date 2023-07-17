import { SFHelpers } from "./module.js";
import { CreatureSpawner } from "./spawner.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";
import { FuzzySet } from "./fuzzyset.js";
import { SFCONSTS } from "./main.js";
import { CombatEstimateDialog } from "./combatestimatedialog.js";
import { ActorUtils } from "./utils/ActorUtils.js";
import { SFLocalHelpers } from "./localmodule.js";


export class Encounter {
  constructor(data) {
    this.data = data;
    this.name = data.name;
    this.difficulty = data.difficulty;
    this.amountToAdjustEncounter = data.amounttoadjustencounter;
    this.currency = data.loot.currency;
    this.creatures = [];
    this.unfilledformula = [];
    this.combatsummary = {};
    this.loot = [];
    this.lootActorId = "";
    this.id = data.id || randomID(40);
  }

  async prepareData(lootOnly = false) {
    //Prepare loot data
    for (let loot of this.data.loot.items) {
      const item = new EncItem(loot, "item");

      // Set these to force the use of compendium name and item id to get an exact match quickly
      item.compendiumname = loot.object?.compendiumname;
      item.id = loot.object?.itemid;

      const itemData = await item.getData();
      if (itemData && itemData.type !== "spell")
      {
        this.loot.push(item);
        continue;
      }
    }

    //Prepare scroll data
    for (let loot of this.data.loot.scrolls) {
      const item = new EncItem(loot, "item", true);
      if (await item.getData()) this.loot.push(item);
    }

    //Prepare abstract loot data
    for (let loot of this.data.loot.other) {
      const item = new EncItem(loot, "abstract");
      item.getData();
      this.loot.push(item);
    }
    if (lootOnly) return this;
    //Prepare creature data
    for (let creature of this.data.creatures) {
      this.creatures.push(new EncCreature(creature));
    }

    if (this.data.unfilledformula)
    {
      for (let unfilled of this.data.unfilledformula)
      {
        this.unfilledformula.push(unfilled);
      }
    }
    return this;
  }

  validate() {
    if (
      this.data.creatures.every(
        (creature) =>
          game.actors.find((a) => a.name === creature.name) ||
          Encounter.getCompendiumEntryByName(creature.name, "Actor")
      )
    )
      return this;
  }

  static getCompendiumEntryByName(name, type) {
    name = type == "Actor" ? name : Encounter.fuzzyMatch(name, type);
    const constCompFilter = game.settings.get(
      SFCONSTS.MODULE_NAME,
      "filterCompendiums"
    );
    const filteredCompendiums = Array.from(FoundryUtils.getCompendiums()).filter((p) => {
      if (p.documentName !== type) return false;
      const el = constCompFilter.find((i) => Object.keys(i)[0] == p.collection);
      return !el || el[p.collection] ? true : false;
    });
    const compendiums = filteredCompendiums.sort((a, b) => {
      const filterIndexA = constCompFilter.indexOf(
        constCompFilter.find((i) => Object.keys(i)[0] == a.collection)
      );
      const filterIndexB = constCompFilter.indexOf(
        constCompFilter.find((i) => Object.keys(i)[0] == b.collection)
      );
      return filterIndexA > filterIndexB ? 1 : -1;
    });
    let entries = [];
    for (let compendium of compendiums) {
      const entry = compendium.index.find((i) => i.name === name);
      if (entry) entries.push({ entry: entry, compendium: compendium });
    }
    return entries.length > 0 ? entries[0] : null;
  }
  //returns the most similar name in a compendium
  static fuzzyMatch(name, type) {
    const compendiums = FoundryUtils.getCompendiums().filter((p) => p.documentName === type);
    let matchDb = [];
    for (let compendium of compendiums) {
      for (let entry of compendium.index) {
        matchDb.push(entry.name);
      }
    }
    const fs = FuzzySet(matchDb, true);
    const result = fs.get(name);
    return result ? result[0][1] : undefined;
  }

  async loadActors() {
    for (let creature of this.creatures) {
      await creature.getActor();
    }
  }

  async analyzeActors() {
    for (let creature of this.creatures) {
      if (creature.npcactor.analyzeActor === undefined)
      {
        creature.npcactor = await ActorUtils.getActorObjectFromActorIdCompendiumName(creature.actorid, creature.compendiumname);
      }
      await creature.npcactor.analyzeActor();
    }
  }

  async spawn() {
    await this.loadActors();
    const _this = this;
    Hooks.once("preCreateMeasuredTemplate", (template) => {
      canvas.tokens.activate();
      if (this.lootActorId === "")
      {
        this.createLootSheet();
      }
      CreatureSpawner.fromTemplate(template, _this);
      return false;
    });
  }

  async getRandomChestIcon() {
    const folder = await FilePicker.browse("public", "icons/containers/chest");
    return folder.files[Math.floor(Math.random() * folder.files.length)];
  }

  async createLootSheet() {
    const folderName = SFHelpers.getFolder("loot");
    const folder = game.folders.getName(folderName)
      ? game.folders.getName(folderName)
      : await Folder.create({ type: "Actor", name: folderName });

    let actorData = null;
    let actorType = FoundryUtils.getSystemVariable("LootActorType");
    if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11())
    {
      actorData = {
        name: this.name || this.id,
        type: actorType,
        texture: {
          src: await this.getRandomChestIcon(),
        },
        currency: {
          // If Loot sheet is missing use currency as Normal (Adds Support for other NPC Sheets such as TidySheet5e)
          cp: this.currency.cp,
          sp: this.currency.sp,
          ep: this.currency.ep,
          gp: this.currency.gp,
          pp: this.currency.pp,
        },
        folder: folder.id,
      };
    }
    else
    {
      actorData = {
        name: this.name || this.id,
        type: "npc",
        img: await this.getRandomChestIcon(), //"icons/svg/chest.svg",
        data: {
          currency: {
            // If Loot sheet is missing use currency as Normal (Adds Support for other NPC Sheets such as TidySheet5e)
            cp: this.currency.cp,
            sp: this.currency.sp,
            ep: this.currency.ep,
            gp: this.currency.gp,
            pp: this.currency.pp,
          },
        },
        folder: folder.id,
      };
    }

    const actor = await Actor.create(actorData);
    let items = [];
    for (let item of this.loot) {
      items.push(await item.getData());
    }

    let currentSystem = game.system.id;
    if (currentSystem === "pf2e")
    {
      const pack = game.packs.get("pf2e.equipment-srd");
      const cp = (await pack.getDocument(pack.index.find(i => i.name === "Copper Pieces")._id)).toObject();
      const sp = (await pack.getDocument(pack.index.find(i => i.name === "Silver Pieces")._id)).toObject();
      const gp = (await pack.getDocument(pack.index.find(i => i.name === "Gold Pieces")._id)).toObject();
      const pp = (await pack.getDocument(pack.index.find(i => i.name === "Platinum Pieces")._id)).toObject();
      cp.system.quantity = parseInt(this.currency.cp);
      sp.system.quantity = parseInt(this.currency.sp);
      gp.system.quantity = parseInt(this.currency.gp);
      pp.system.quantity = parseInt(this.currency.pp);
      items.push(cp);
      items.push(sp);
      items.push(gp);
      items.push(pp);
    }
    await actor.createEmbeddedDocuments("Item", items);
    this.lootActorId = actor.id;
  }

  async combatEstimate() {
    await this.analyzeActors();
    canvas.CombatEstimateDialog = new CombatEstimateDialog(this.creatures);
    await canvas.CombatEstimateDialog.render(true);
    // canvas.CombatEstimateDialog.activateListeners();
  }
}

class EncCreature {
  constructor(creature) {
    this.name = creature.name;
    this.npcactor = creature.npcactor;
    this.actorid = creature.actorid;
    this.compendiumname = creature.compendiumname;
    this.quantity = creature.quantity;
    this.cr = creature.cr;
    this.level = creature.level;
    this.compendium = null;
    this.dynamicLink = this.getDLink();
    this._actor = null;
  }

  async getActor() {
    if (this._actor) return this._actor;
    let actor = game.actors.find((a) => a.name === this.name);
    if (!actor) {
      const folderName = SFHelpers.getFolder("actor");
      const folder = game.folders.getName(folderName)
        ? game.folders.getName(folderName)
        : await Folder.create({ type: "Actor", name: folderName });
      const compData = Encounter.getCompendiumEntryByName(this.name, "Actor");
      const compEntry = compData.entry;
      await game.actors.importFromCompendium(
        compData.compendium,
        compEntry._id,
        { folder: folder.id }
      );
      actor = game.actors.find((a) => a.name === this.name);
    }
    this._actor = actor;
    return actor;
  }

  getDLink() {
    let actor = game.actors.find((a) => a.name === this.name);
    if (actor) {
      this.compendium = "";
      return `@Actor[${actor.id}]{${this.name}}`;
    }
    if (!actor) {
      const compData = Encounter.getCompendiumEntryByName(this.name, "Actor");
      this.compendium = compData.compendium.collection;
      return `@Compendium[${compData.compendium.collection}.${compData.entry._id}]{${this.name}}`;
    }
  }
}

class EncItem {
  constructor(item, type, isScroll = false) {
    this.name = item.name;
    this.compendiumname = "";
    this.id = "";
    this.quantity = item.quantity || 1;
    this.value = parseInt(item.name.replace(/[^\d]/g, ""));
    this.type = type;
    this.dynamicLink = "";
    this.isScroll = isScroll;
    this._itemDocument = null;
  }

  async getData() {
    switch (this.type) {
      case "item":
        return await this.getItemData();
      case "abstract":
        return await this.generateAbstractLootData();
    }
  }

  static getCompendiumEntryByCompendiumAndId(compendiumName, id)
  {
    const compendium = game.packs.find(p => p.metadata.id === compendiumName);
    const entry = compendium.index.find((i) => i._id === id);
    if (entry)
    {
      return { entry: entry, compendium: compendium };
    }
  }

  getRandomLootImg() {
    return SFCONSTS.LOOT_ICONS[
      Math.floor(Math.random() * SFCONSTS.LOOT_ICONS.length)
    ];
  }

  async getItemData() {
    if (this._itemDocument) return this._itemDocument;

    let item = game.items.find((a) => a.name === this.name);

    if (item) {
      this.name = item.name;
      this._itemDocument = this.isScroll
        ? await this.toSpellScroll(item)
        : item.toObject();
      if (!this._itemDocument) return undefined;
      this.id = item.id;
      this.dynamicLink = `@Item[${item.id}]{${this._itemDocument.name}}`;
      return this._itemDocument;
    }

    if (!item) {
      let compData = null
      if (this.compendiumname && this.id)
      {
        compData = EncItem.getCompendiumEntryByCompendiumAndId(this.compendiumname, this.id);
      }

      if (!compData)
      {
        compData = Encounter.getCompendiumEntryByName(this.name, "Item");
      }

      if (!compData) {
        return undefined;
      }
      item = await game.packs
      .get(compData.compendium.collection)
      .getDocument(compData.entry._id);
      this._itemDocument = this.isScroll
        ? await this.toSpellScroll(item)
        : item.toObject();
      if (!this._itemDocument) return undefined;
      this.name = item.name;
      FoundryUtils.getDataObjectFromObject(this._itemDocument).quantity = this.quantity || 1;
      this.id = compData.entry._id;
      this.compendiumname = compData.compendium.collection;
      this.dynamicLink = `@Compendium[${compData.compendium.collection}.${compData.entry._id}]{${this._itemDocument.name}}`;
      return this._itemDocument;
    }
  }

  async generateAbstractLootData() {
    if (this._itemDocument) return this._itemDocument;
    this._itemDocument = {
      name: this.name,
      type: "loot",
      img: this.getRandomLootImg(), //"icons/svg/item-bag.svg",
      data: {
        quantity: this.quantity || 1,
        weight: 0,
        price: this.value || 0,
        equipped: false,
        identified: true,
      },
    };
    return this._itemDocument;
  }

  async toSpellScroll(item) {
    if (FoundryUtils.getDataObjectFromObject(item).type !== "spell") return undefined;
    const itemData = item.toObject();
    const level = FoundryUtils.getDataObjectFromObject(itemData).level
    // Get scroll data
    const scrollUuid = `Compendium.${CONFIG.DND5E.sourcePacks.ITEMS}.${CONFIG.DND5E.spellScrollIds[level]}`;
    const scrollItem = await fromUuid(scrollUuid);
    const scrollData = FoundryUtils.getDataObjectFromObject(scrollItem);

    // Split the scroll description into an intro paragraph and the remaining details
    const scrollDescription = FoundryUtils.getDataObjectFromObject(scrollData).description.value;
    const pdel = '</p>';
    const scrollIntroEnd = scrollDescription.indexOf(pdel);
    const scrollIntro = scrollDescription.slice(0, scrollIntroEnd + pdel.length);
    const scrollDetails = scrollDescription.slice(scrollIntroEnd + pdel.length);

    let itemDataObject = FoundryUtils.getDataObjectFromObject(itemData);
    // Create a composite description from the scroll description and the spell details
    const desc = `${scrollIntro}<hr/><h3>${itemData.name} (Level ${level})</h3><hr/>${itemDataObject.description.value}<hr/><h3>Scroll Details</h3><hr/>${scrollDetails}`;
    itemDataObject.description.value = desc.trim()

    itemData.type = "consumable";
    itemData.name = `Spell Scroll: ${itemDataObject.name}`;
    itemDataObject.price = SFCONSTS.SPELLCOST[itemDataObject.level ?? 0];
    itemDataObject.weight = 0;
    itemDataObject.uses = {
      value: 1,
      max: 1,
      per: "charges",
      autoDestroy: true,
    };
    return itemData;
  }
}

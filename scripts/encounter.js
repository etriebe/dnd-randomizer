class Encounter {
  constructor(data) {
    this.data = data;
    this.currency = data.loot.currency;
    this.creatures = [];
    this.loot = [];
    this.abstractLoot = [];
    this.id = data.id || randomID(20);
  }

  async prepareData(lootOnly = false) {
    //Prepare loot data
    for (let loot of this.data.loot.items) {
      const item = new EncItem(loot, "item");
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
    const compendiums = game.packs.filter((p) => p.documentName === type);
    for (let compendium of compendiums) {
      const entry = compendium.index.find((i) => i.name === name);
      if (entry) return { entry: entry, compendium: compendium };
    }
    return null;
  }
  //returns the most similar name in a compendium
  static fuzzyMatch(name, type) {
    const compendiums = game.packs.filter((p) => p.documentName === type);
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

  async spawn() {
    await this.loadActors();
    const _this = this;
    Hooks.once("createMeasuredTemplate", async (template) => {
      await CreatureSpawner.fromTemplate(template.object, _this);
      template.object.delete();
    });
  }

  async createLootSheet(name) {
    const folderName = SFHelpers.getFolder("loot");
    const folder = game.folders.getName(folderName)
      ? game.folders.getName(folderName)
      : await Folder.create({ type: "Actor", name: folderName });

    const actorData = {
      name: name || this.id,
      type: "npc",
      img: "icons/svg/chest.svg",
      data: {
        currency: {
          cp: {
            value: this.currency.cp,
          },
          sp: {
            value: this.currency.sp,
          },
          gp: {
            value: this.currency.gp,
          },
          pp: {
            value: this.currency.pp,
          },
          ep: {
            value: this.currency.ep,
          },
        },
      },
      folder: folder.id,
      flags: {
        core: {
          sheetClass: "dnd5e.LootSheet5eNPC",
        },
        lootsheetnpc5e: {
          lootsheettype: "Loot",
        },
      },
    };
    const actor = await Actor.create(actorData);
    let items = [];
    for (let item of this.loot) {
      items.push(await item.getData());
    }
    await actor.createEmbeddedDocuments("Item", items);
  }
}

class EncCreature {
  constructor(creature) {
    this.name = creature.name;
    this.quantity = creature.quantity;
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
      return `@Actor[${actor.id}]{${this.name}}`;
    }
    if (!actor) {
      const compData = Encounter.getCompendiumEntryByName(this.name, "Actor");
      return `@Compendium[${compData.compendium.collection}.${compData.entry._id}]{${this.name}}`;
    }
  }
}

class EncItem {
  constructor(item, type) {
    this.name = item.name;
    this.quantity = item.quantity;
    this.value = parseInt(item.name.replace(/[^\d]/g, ""));
    this.type = type;
    this.dynamicLink = "";
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

  async getItemData() {
    if (this._itemDocument) return this._itemDocument;

    let item = game.items.find((a) => a.name === this.name);

    if (item) {
      this.name = item.data.name;
      this._itemDocument = item.data;
      this.dynamicLink = `@Item[${item.id}]{${item.data.name}}`;
      return item.data;
    }

    if (!item) {
      const compData = Encounter.getCompendiumEntryByName(this.name, "Item");
      if (!compData) {
        return undefined;
      }
      item = await game.packs
        .get(compData.compendium.collection)
        .getDocument(compData.entry._id);
      delete item.data._id;
      this.name = item.data.name;
      this._itemDocument = item.data;
      this.dynamicLink = `@Compendium[${compData.compendium.collection}.${compData.entry._id}]{${item.data.name}}`;
      return item;
    }
  }

  async generateAbstractLootData() {
    if (this._itemDocument) return this._itemDocument;
    this._itemDocument = {
      name: this.name,
      type: "loot",
      img: "icons/svg/item-bag.svg",
      data: {
        quantity: 1,
        weight: 0,
        price: this.value || 0,
        equipped: false,
        identified: true,
      },
    };
    return this._itemDocument;
  }
}

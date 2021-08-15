class Encounter {
  constructor(data) {
    this.data = data;
    this.currency = data.currency
    this.creatures = [];
    this.loot = [];
    this.abstractLoot = [];
  }

  async prepareData() {
    for (let creature of this.data.creatures) {
      let actor = game.actors.find(
        (a) => a.name.replace(/\s/g, "").toLowerCase() === creature.name.replace(/\s/g, "").toLowerCase()
      );
      if (!actor) {
        const compData = Encounter.getCompendiumEntryByName(creature.name, "Actor");
        const compEntry = compData.entry;
        await game.actors.importFromCompendium(
          compData.compendium,
          compEntry._id,
          {}
        );
        actor = game.actors.find(
          (a) => a.name.replace(/\s/g, "").toLowerCase() === creature.name.replace(/\s/g, "").toLowerCase()
        );
      }
      this.creatures.push({
        name: creature.name,
        quantity: creature.quantity,
        actor: actor,
      });
    }
    for (let loot of this.data.loot.items) {
      let item = game.items.find(
        (a) => a.name.replace(/\s/g, "").toLowerCase() === loot.itemName
      );
      if (!item) {
        const compData = Encounter.getCompendiumEntryByName(
          loot.itemName,
          "Item"
        );
        if (!compData) {
          this.processAbstractLoot(loot);
          continue;
        }
        const compEntry = compData.entry;
        await game.items.importFromCompendium(
          compData.compendium,
          compEntry._id,
          {}
        );
        item = game.items.find(
          (a) => a.name.replace(/\s/g, "").toLowerCase() === loot.itemName
        );
      }
      this.loot.push({
        name: item.data.name,
        quantity: loot.quantity,
        item: item,
      });
    }
    return this;
  }

  validate() {
    if (
      this.data.creatures.every(
        (creature) =>
          game.actors.find(
            (a) => a.name.replace(/\s/g, "").toLowerCase() === creature.name.replace(/\s/g, "").toLowerCase()
          ) || Encounter.getCompendiumEntryByName(creature.name.replace(/\s/g, "").toLowerCase(), "Actor")
      ) /* &&
      this.data.loot.some(
        (item) =>
          game.items.find(
            (a) => a.name.replace(/\s/g, "").toLowerCase() === item.itemName
          ) || Encounter.getCompendiumEntryByName(item.name, "Items")
      )*/
    )
      return this;
  }

  processAbstractLoot(loot) {
    if (loot.isGold) {
      switch (true) {
        case loot.originalName.includes("gp"):
          this.gp = loot.quantity;
          break;
        case loot.originalName.includes("sp"):
          this.sp = loot.quantity;
          break;
        case loot.originalName.includes("cp"):
          this.cp = loot.quantity;
          break;
        case loot.originalName.includes("pp"):
          this.pp = loot.quantity;
          break;
        case loot.originalName.includes("ep"):
          this.ep = loot.quantity;
          break;
      }
    } else {
      this.abstractLoot.push(loot.originalName);
    }
  }

  static getCompendiumEntryByName(name, type) {
    name = type == "Actor" ? Encounter.fuzzyMatch(name, type) : Encounter.fuzzyMatch(name, type);
    const compendiums = game.packs.filter((p) => p.documentName === type);
    for (let compendium of compendiums) {
      const entry = compendium.index.find(
        (i) => i.name.replace(/\s/g, "").toLowerCase() === name.replace(/\s/g, "").toLowerCase()
      );
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
    const fs = FuzzySet(matchDb,true);
    const result = fs.get(name);
    return result ? result[0][1]: undefined;
  }
}
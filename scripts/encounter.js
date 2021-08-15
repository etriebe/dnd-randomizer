class Encounter {
  constructor(data) {
    this.data = data;
    this.currency = data.loot.currency
    this.creatures = [];
    this.loot = [];
    this.abstractLoot = [];
  }

  async prepareData() {

    //Prepare actor data
    for (let creature of this.data.creatures) {
      let actor = game.actors.find(
        (a) => a.name === creature.name
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
          (a) => a.name === creature.name
        );
      }
      this.creatures.push({
        name: creature.name,
        quantity: creature.quantity,
        actor: actor,
      });
    }

    //Prepare loot data
    for (let loot of this.data.loot.items) {
      let item = game.items.find(
        (a) => a.name === loot.name
      );
      if (!item) {
        const compData = Encounter.getCompendiumEntryByName(
          loot.name,
          "Item"
        );
        if (!compData) {
          continue;
        }
        const compEntry = compData.entry;
        await game.items.importFromCompendium(
          compData.compendium,
          compEntry._id,
          {}
        );
        item = game.items.find(
          (a) => a.name === loot.name
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
            (a) => a.name === creature.name
          ) || Encounter.getCompendiumEntryByName(creature.name, "Actor")
      )
    )
      return this;
  }

  static getCompendiumEntryByName(name, type) {
    name = type == "Actor" ? name : Encounter.fuzzyMatch(name, type);
    const compendiums = game.packs.filter((p) => p.documentName === type);
    for (let compendium of compendiums) {
      const entry = compendium.index.find(
        (i) => i.name === name
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
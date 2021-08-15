class Encounter {
  constructor(data) {
    this.data = data;
    this.creatures = [];
    this.loot = [];
    this.abstractLoot = [];
  }

  async prepareData() {
    for (let creature of this.data.creatures) {
      let actor = game.actors.find(
        (a) => a.name.replace(/\s/g, "").toLowerCase() === creature.name
      );
      if (!actor) {
        const compData = Encounter.getCompendiumEntryByName(creature.name);
        const compEntry = compData.entry;
        await game.actors.importFromCompendium(
          compData.compendium,
          compEntry._id,
          {}
        );
        actor = game.actors.find(
          (a) => a.name.replace(/\s/g, "").toLowerCase() === creature.name
        );
      }
      this.creatures.push({
        name: creature.name,
        number: creature.number,
        actor: actor,
      });
    }
    for (let loot of this.data.loot) {
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
      this.loot.push(item);
    }
    return this;
  }

  validate() {
    if (
      this.data.creatures.every(
        (creature) =>
          game.actors.find(
            (a) => a.name.replace(/\s/g, "").toLowerCase() === creature.name
          ) || Encounter.getCompendiumEntryByName(creature.name, "Actor")
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
    const compendiums = game.packs.filter((p) => p.documentName === type);
    for (let compendium of compendiums) {
      const entry = compendium.index.find(
        (i) => i.name.replace(/\s/g, "").toLowerCase() === name
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
    fs = FuzzySet(matchDb,false);
    return fs.get(name)[0];
  }
}

/*fs.get('alabam')
fs = FuzzySet(['Alabama',
'Alaska',
'Arizona',
'Arkansas',
'California',
'Colorado',
'Connecticut',
'Delaware',
'Florida',
'Georgia',
'Hawaii',
'Idaho',
'Illinois',
'Indiana',
'Iowa',
'Kansas',
'Kentucky',
'Louisiana',
'Maine',
'Maryland',
'Massachusetts',
'Michigan',
'Minnesota',
'Mississippi',
'Missouri',
'Montana',
'Nebraska',
'Nevada',
'New Hampshire',
'New Jersey',
'New Mexico',
'New York',
'North Carolina',
'North Dakota',
'Ohio',
'Oklahoma',
'Oregon',
'Pennsylvania',
'Rhode Island',
'South Carolina',
'South Dakota',
'Tennessee',
'Texas',
'Utah',
'Vermont',
'Virginia',
'Washington',
'West Virginia',
'Wisconsin',
'Wyoming'], false)*/

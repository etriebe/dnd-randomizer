class Encounter {
  constructor(data) {
    this.data = data;
    this.creatures = [];
  }

  async prepareData() {
    for (let creature of this.data) {
      let actor = game.actors.getName(creature.name);
      if (!actor) {
        const compData = Encounter.getCompendiumEntryByName(creature.name);
        const compEntry = compData.entry;
        await game.actors.importFromCompendium(
          compData.compendium,
          compEntry._id,
          {}
        );
        actor = game.actors.getName(creature.name);
      }
      this.creatures.push({
        name: creature.name,
        number: creature.number,
        actor: actor,
      });
    }
    return this;
  }

  validate() {
    if (
      this.data.every(
        (creature) =>
          game.actors.getName(creature.name) ||
          Encounter.getCompendiumEntryByName(creature.name)
      )
    )
      return this;
  }

  static getCompendiumEntryByName(name) {
    const compendiums = game.packs.filter((p) => p.documentName === "Actor");
    for (let compendium of compendiums) {
      const entry = compendium.index.find((i) => i.name === name);
      if (entry) return { entry: entry, compendium: compendium };
    }
    return null;
  }
}

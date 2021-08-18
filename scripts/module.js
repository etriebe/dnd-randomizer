class SFHelpers {
  static getFolder(type) {
    return game.settings.get(SFCONSTS.MODULE_NAME, `${type}Folder`);
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

  static async parseEncounter(data, params) {
    const encounters = data.reduce((a, v) => {
      const enc = new Encounter(v).validate();
      if (enc !== undefined) a.push(enc);
      return a;
    }, []);

    for (let encounter of encounters) {
      encounter.environment = data.environment || params.environment;
      encounter.name = data.name || `${encounter.environment} Encounter #${encounters.indexOf(encounter)+1}`;
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
import { SFCreatureCodex } from "./creatureCodex.js";
import { SFCONSTS } from "./main.js";
import { Encounter } from "./encounter.js";
import { SFDialog } from "./dialog.js";
import { CombatEstimateDialog } from "./combatestimatedialog.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";



Hooks.once("init", async () => {
  console.log(SFCONSTS.MODULE_NAME + ' | initializing');
  globalThis.dndrandomizer = Encounter;
});

export class SFHelpers {
  static getFolder(type) {
    return game.settings.get(SFCONSTS.MODULE_NAME, `${type}Folder`);
  }

  static async parseEncounter(data, params={}) {
    const encounters = data.reduce((a, v) => {
      const enc = new Encounter(v).validate();
      if (enc !== undefined) a.push(enc);
      return a;
    }, []);

    for (let encounter of encounters) {
      encounter.encounterType = params.encounterType;
      encounter.name = encounter.data.name || `${encounter.encounterType} Encounter #${encounters.indexOf(encounter)+1}`;
      await encounter.prepareData();
    }

    return encounters;
  }
}

export class StocasticFantastic {
  static async addToDialog(data) {
    const encounterData = await SFHelpers.parseEncounter(data);
    if (!canvas.SFDialog?.rendered) await canvas.SFDialog.render(true);
    if (!canvas.SFCreatureCodex?.rendered) await canvas.SFCreatureCodex.render(true);
    if (!canvas.CombatEstimateDialog?.rendered) await canvas.CombatEstimateDialog.render(true);
    canvas.SFDialog.populateEncounters(encounterData);
  }
}
import { SFCONSTS } from "./main.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";
import { SFDialog } from "./dialog.js";
import { CombatEstimateDialog } from "./combatestimatedialog.js";
import { SFCreatureCodex } from "./creatureCodex.js";

Hooks.once("init", async function ()
{
  const debouncedReload = foundry.utils.debounce(function () { window.location.reload(); }, 100);
  game.settings.register(SFCONSTS.MODULE_NAME, "actorFolder", {
    name: "Actor Folder Name",
    hint: "Sets the folder name that the actors will be added to when imported",
    scope: "world",
    config: true,
    type: String,
    default: "SF - Creatures",
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "lootFolder", {
    name: "Loot Folder Name",
    hint: "Sets the folder name that the loot will be added to when imported",
    scope: "world",
    config: true,
    type: String,
    default: "SF - Loot",
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "usePlayerOwnedCharactersForGeneration", {
    name: "Use Player-owned Actors in-game to generate encounters.",
    hint: "If checked, we will find all player-owned characters and use that to generate encounters. Select/deselect individuals in Filter dialog.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "clearOldEncountersOnGeneration", {
    name: "Clear existing encounters when generating new ones (besides favorited encounters).",
    hint: "If checked, we will clear the existing encounters when we generate new ones. Else these will be populated below the current list.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "loadCombatData", {
    name: "Generated combats will contain combat summary information.",
    hint: "Summary information such as damage per round, average target attack bonus, etc. This will slow down combat generation.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "useDefaultLinkBehavior", {
    name: "Use FoundryVTT default link generation for actors and items.",
    hint: "This will use default link generation behavior, which means modules like Monk's Enhanced Journal will override and open actor pages in those dialogs.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'secretEncounterIcon', {
    name: "Use Pastafarian icon for dialog",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, 'favoritedEncounters', {
    scope: "world",
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'filterCompendiums', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'filterMonsterTypes', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'filterTreasure', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'playerCharactersToCreateEncountersFor', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'environmentsToCreateEncountersFor', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });
});

Hooks.once('ready', async function ()
{

});

Hooks.on("renderSidebarTab", (settings) =>
{
  if (!game.user.isGM)
  {
    return;
  }

  if (settings.id === "actors")
  {
    const html = settings.element;
    if (html.find("#sfButton").length !== 0) return;
    const button = `<button id="sfButton" style="flex-basis: auto;">
    <i class="fas fa-dice"></i> Generate Encounter
  </button>`;
    html.find(`.header-actions`).first().append(button);
    html.find("#sfButton").on("click", async (e) =>
    {
      e.preventDefault();
      if (!canvas.SFDialog?.rendered) await canvas.SFDialog.render(true);
    });
  }

  if (settings.id === "compendium")
  {
    const html = settings.element;
    if (html.find("#SFCreatureCodexButton").length !== 0) return;
    const button = `<button id="SFCreatureCodexButton" style="flex-basis: auto;">
    <i class="fas fa-dice"></i> Creature Codex
  </button>`;
    html.find(`.header-actions`).first().append(button);
    html.find("#SFCreatureCodexButton").on("click", async (e) =>
    {
      e.preventDefault();
      if (!canvas.SFCreatureCodex?.rendered) await canvas.SFCreatureCodex.render(true);
    });
  }

  if (settings.id === "combat")
  {
    const html = settings.element;
    if (html.find("#combatEstimateButton").length !== 0)
    {
      return;
    }

    const button = `<button id="combatEstimateButton" style="flex-basis: auto;">
		<i class="fas fa-calculator"></i> Combat Estimate
		</button>`;

    let elementToAppendTo = ``;
    if (FoundryUtils.isFoundryVersion10())
    {
      elementToAppendTo = `.combat-tracker-header`;
    }
    else
    {
      elementToAppendTo = `#combat-round`;
    }
    html.find(elementToAppendTo).first().append(button);
    html.find("#combatEstimateButton").on("click", async (e) =>
    {
      e.preventDefault();
      const ceDialog = new CombatEstimateDialog();
      ceDialog.render(true);
    });
  }
});

Hooks.once("ready", async function () { });

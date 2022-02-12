Hooks.once("init", async function () {
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
  game.settings.register(SFCONSTS.MODULE_NAME, "useLocalEncounterGenerator", {
    name: "Use Local Encounter Generator",
    hint: "If checked, we will generate encounters using all the creatures from local compendiums.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "usePlayerOwnedCharactersForGeneration", {
    name: "Use Player-owned Actors in-game to generate encounters.",
    hint: "If checked, we will find all player-owned characters and use that to generate encounters. Select/deselect individuals in Filter dialog.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange:debouncedReload,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "clearOldEncountersOnGeneration", {
    name: "Clear existing encounters when generating new ones (besides favorited encounters).",
    hint: "If checked, we will clear the existing encounters when we generate new ones. Else these will be populated below the current list.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "useSavedIndex", {
    name: "Save a copy of the generated monster index so we don't have to open every compendium.",
    hint: "If checked, we will save off the monster and spell object index. This will take up extra space!",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
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
  
  game.settings.register(SFCONSTS.MODULE_NAME, 'playerCharactersToCreateEncountersFor', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });
  
  game.settings.register(SFCONSTS.MODULE_NAME, 'savedMonsterIndex', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });
  
  game.settings.register(SFCONSTS.MODULE_NAME, 'savedSpellIndex', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  });

  game.settings.register(SFCONSTS.MODULE_NAME, 'secretEncounterIcon', {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });
});

Hooks.on("renderSidebarTab",(settings) => {
  if(!game.user.isGM || settings.id != "actors") return
  const html = settings.element
  if(html.find("#sfButton").length !== 0) return
  const button = `<button id="sfButton" style="flex-basis: auto;">
  <i class="fas fa-dice"></i> Generate Encounter
</button>`
  html.find(`.header-actions`).first().append(button)
  html.find("#sfButton").on("click",async (e) => {
    e.preventDefault();
    if (!canvas.sfDialog?.rendered) await canvas.sfDialog.render(true);
  })
});

Hooks.once("ready", async function () {});

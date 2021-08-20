Hooks.once("init", async function () {
  game.settings.register(SFCONSTS.MODULE_NAME, "actorFolder", {
    name: game.i18n.localize("dr.settings.actorFolder.name"),
    hint: game.i18n.localize("dr.settings.actorFolder.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "SF - Creatures",
  });
  game.settings.register(SFCONSTS.MODULE_NAME, "lootFolder", {
    name: game.i18n.localize("dr.settings.lootFolder.name"),
    hint: game.i18n.localize("dr.settings.lootFolder.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "SF - Loot",
  });
  game.settings.register(SFCONSTS.MODULE_NAME, 'favoritedEncounters', {
    scope: "world",
    config: false,
    type: Object,
    default: {},
  })
  
  game.settings.register(SFCONSTS.MODULE_NAME, 'filterCompendiums', {
    scope: "world",
    config: false,
    type: Object,
    default: [],
  })
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

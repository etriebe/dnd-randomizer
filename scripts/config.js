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
});

Hooks.once("ready", async function () {});

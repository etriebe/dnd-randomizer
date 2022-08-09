import { SFLocalHelpers } from "./localmodule.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";
import { ModuleUtils } from "./utils/ModuleUtils.js";
// import { Grid } from "gridjs";
// import "../node_modules/gridjs/dist/theme/mermaid.css";

export class SFCreatureCodex extends FormApplication
{
	constructor()
	{
		super();
	}

	static get defaultOptions()
	{
		let dialogTemplate = `modules/dnd-randomizer/templates/creatureCodex.hbs`;
		return {
			...super.defaultOptions,
			title: game.i18n.localize('SF.dialog.title'),
			id: "SFCreatureCodex",
			template: dialogTemplate,
			resizable: true,
			width: window.innerWidth > 700 ? 700 : window.innerWidth - 100,
			height: window.innerHeight > 800 ? 800 : window.innerHeight - 100
		};
	}

	async activateListeners(html)
	{
		super.activateListeners(html);
		ModuleUtils.setupFilterBarListeners(html);
		let forceReload = false;
		await SFLocalHelpers.populateObjectsFromCompendiums(forceReload);
		let filteredMonsters = await SFLocalHelpers.filterMonstersFromCompendiums();

		let creatureGrid = new gridjs.Grid({
			columns: [
				"Creature Name",
				"Type",
				"CR",
				"XP",
				"Environments"
			],
			pagination: true,
			sort: true,
			search: true,
			data: []
		  })
		
		for (let i = 0; i < filteredMonsters.length; i++)
		{
			// <a class="entity-link content-link" draggable="true" data-pack="world.um-monsters" data-id="rtTaiSoGwFGBYjHa"><i class="fas fa-user"></i> Flesh Fortress</a>
			// ${TextEditor.enrichHTML(creature.dynamicLink)}
			let currentMonster = filteredMonsters[i];
			let compendiumName = currentMonster.compendiumname;
			let creatureLink = FoundryUtils.getActorLink(currentMonster.actor, compendiumName);
			creatureGrid.config.data.push([
				gridjs.html(creatureLink),
				currentMonster.creaturetype, 
				currentMonster.actorcr,
				currentMonster.actorxp,
				currentMonster.environment.join(", ")
			]);
		}
		creatureGrid.render(document.getElementById("creatureCodex"));
	}
}

Hooks.once('ready', async () =>
{
	canvas.sfCreatureCodex = new SFCreatureCodex();
});


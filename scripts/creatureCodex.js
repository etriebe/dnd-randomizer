import { SFLocalHelpers } from "./localmodule.js";
import { ActorUtils } from "./utils/ActorUtils.js";
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
			title: game.i18n.localize('CreatureCodex.dialog.title'),
			id: "SFCreatureCodex",
			template: dialogTemplate,
			resizable: true,
			width: window.innerWidth > 1200 ? 1200 : window.innerWidth - 100,
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
				{
					name: "Creature Name",
					width: "100px"
				},
				{
					name: "Type",
					width: "100px"
				},
				{
					name: "CR",
					width: "50px"
				},
				{
					name: "XP",
					width: "50px"
				},
				{
					name: "Environments",
					width: "100px"
				},
				{
					name: "Item List",
					width: "200px"
				},
				{
					name: "Biography",
					hidden: true
				},
				{
					name: "Item Description",
					hidden: true
				}
			],
			/*
			style: { 
			  table: { 
				'white-space': 'nowrap'
			  }
			},
			*/
			pagination: true,
			sort: true,
			search: true,
			// resizable: true,
			data: []
		  })
		
		for (let i = 0; i < filteredMonsters.length; i++)
		{
			let currentMonster = filteredMonsters[i];
			let compendiumName = currentMonster.compendiumname;
			let creatureLink = FoundryUtils.getActorLink(currentMonster.actorid, currentMonster.actorname, compendiumName);
			let actorObject = ActorUtils.getActualActorObject(currentMonster);
			let itemList = ActorUtils.getActorItemList(actorObject);
			let actorBiography = ActorUtils.getActorBiography(actorObject);
			let itemDescriptionList = ActorUtils.getActorItemDescriptionList(actorObject);
			creatureGrid.config.data.push([
				gridjs.html(creatureLink),
				currentMonster.creaturetype, 
				currentMonster.actorcr,
				currentMonster.actorxp,
				currentMonster.environment.join(", "),
				itemList.join(", "),
				actorBiography,
				gridjs.html(itemDescriptionList.join(", "))
			]);
		}
		creatureGrid.render(document.getElementById("creatureCodex"));
	}
}

Hooks.once('ready', async () =>
{
	canvas.sfCreatureCodex = new SFCreatureCodex();
});


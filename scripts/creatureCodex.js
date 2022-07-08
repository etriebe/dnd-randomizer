import { SFLocalHelpers } from "./localmodule.js";
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
		/*new gridjs.Grid({
			columns: ["Name", "Email", "Phone Number"],
			data: [
			  ["John", "john@example.com", "(353) 01 222 3333"],
			  ["Mark", "mark@gmail.com", "(01) 22 888 4444"],
			  ["Eoin", "eoin@gmail.com", "0097 22 654 00033"],
			  ["Sarah", "sarahcdd@gmail.com", "+322 876 1233"],
			  ["Afshin", "afshin@mail.com", "(353) 22 87 8356"]
			]
		  }).render(document.getElementById("wrapper"));
		  */
	}

	populateCreatures(filteredMonsters)
	{
		const html = this.element;
		let $ul = html.find('.form-encounters ul').first();
	}
}

Hooks.once('ready', async () =>
{
	canvas.sfCreatureCodex = new SFCreatureCodex();
});


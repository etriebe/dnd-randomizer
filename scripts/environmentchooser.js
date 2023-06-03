import { SFCONSTS } from "./main.js";
import { SFLocalHelpers } from "./localmodule.js";
import { sortable } from "./sortables.js";
import { DialogUtils } from "./utils/DialogUtils.js";

export class SFEnvironmentChooser extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `Stochastic, Fantastic! Choose Environments`,
			id: "SFChooser",
			template: `modules/dnd-randomizer/templates/environment.hbs`,
			resizable: true,
			width: window.innerWidth > 400 ? 400 : window.innerWidth - 100,
			height: window.innerHeight > 500 ? 500 : window.innerHeight - 100
		}
	}

	getData() {
		return { }
	}

	populateEnvironments() {
		const html = this.element
		let $ul = html.find('ul#environment_filter').first();
		
		const savedEnvironmentSettings = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"environmentsToCreateEncountersFor"
		  );
		
		let totalCount = 0;
		for (let environment of this.environments)
		{
			const el = savedEnvironmentSettings.find(i => Object.keys(i)[0] === environment);
			let monsterCount = SFLocalHelpers.environmentCreatureCount[environment];
			let monsterCountText = "";
			if (monsterCount)
			{
				monsterCountText = ` - ${monsterCount} creatures`;
				totalCount += monsterCount;
			}
			$ul.append(`
			<li class="environmentLi">
				<input type="checkbox" name="${environment}" ${!el || el[environment] ? "checked" : ""}>
				<span class="environment-type" data-name="${environment === "Any" ? "Creatures without a environment get grouped into an 'Any' bucket" : ""}">${environment}${monsterCountText}</span>
			</li>`)
		}

		let dialogTitle = html.find('h3#environment-title').first();
		dialogTitle[0].innerText = `Filter Environments (${totalCount} creatures)`;

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}

	async activateListeners(html) {
		this.populateEnvironments();
		DialogUtils.activateCheckAllListeners(html, this.element, 'ul#environment_filter', 'li.environmentLi');
	}

	async close(options) { 
		await this.saveEnvironmentsSetting();
		// Default Close
		return await super.close(options);
	}

	async saveEnvironmentsSetting()
	{
		const html = this.element;
		let $ul = html.find('ul#environment_filter').first();
		let environmentsSettings = [];

		$ul.find('li.environmentLi').each((index, item) => {
			let $element = $(item).find('input');
			let setting = {};
			setting[$element.attr('name')] = $element.is(':checked');

			environmentsSettings.push(setting);
		});
		
		await game.settings.set(SFCONSTS.MODULE_NAME, 'environmentsToCreateEncountersFor',environmentsSettings);
	}
}
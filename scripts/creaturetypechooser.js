import { SFCONSTS } from "./main";
import { SFLOCALCONSTS } from "./localconst";
import { SFLocalHelpers } from "./localmodule";
import { sortable } from "./sortables";

export class SFCreatureTypeChooser extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `Stochastic, Fantastic! Choose Creature Types`,
			id: "SFChooser",
			template: `modules/dnd-randomizer/templates/creaturetype.hbs`,
			resizable: true,
			width: window.innerWidth > 400 ? 400 : window.innerWidth - 100,
			height: window.innerHeight > 500 ? 500 : window.innerHeight - 100
		}
	}

	getData() {
		return { }
	}

	populateCreatureTypes() {
		const html = this.element
		let $ul = html.find('ul#creature_filter').first();
		const creatureTypes = SFLOCALCONSTS.CREATURE_TYPES.sort();
		const constMonsterTypeFilter = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"filterMonsterTypes"
		  );
		
		for (let currentType of creatureTypes) {
			const el = constMonsterTypeFilter.find(i => Object.keys(i)[0] === currentType);
			let monsterCount = SFLocalHelpers.creatureTypeCount[currentType];
			let monsterCountText = "";
			if (monsterCount)
			{
				monsterCountText = ` - ${monsterCount} creatures`;
			}
			let currentTypeCasedCorrect = currentType.charAt(0).toUpperCase() + currentType.slice(1);
			$ul.append(`<li class="monsterTypeLi">
				<input type="checkbox" name="${currentType}" ${!el || el[currentType] ? "checked" : ""}>
				<span class="monster-type">${currentTypeCasedCorrect}${monsterCountText}</span>
			</li>`)
		}

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}

	async activateListeners(html) {
		let useSavedIndex = game.settings.get(SFCONSTS.MODULE_NAME, 'useSavedIndex');
		if (useSavedIndex && !SFLocalHelpers.dictionariesPopulated)
		{
			await SFLocalHelpers.loadFromCache();
		}
		this.populateCreatureTypes();
	}

	async close(options) { 
		await this.saveMonsterTypeSetting();
		// Default Close
		return await super.close(options);
	}

	async saveMonsterTypeSetting()
	{
		const html = this.element;
		let $ul = html.find('ul#creature_filter').first();
		let filterMonsterSettings = [];

		$ul.find('li.monsterTypeLi').each((index, item) => {
			let $element = $(item).find('input');
			let setting = {};
			setting[$element.attr('name')] = $element.is(':checked');

			filterMonsterSettings.push(setting);
		});
		
		await game.settings.set(SFCONSTS.MODULE_NAME, 'filterMonsterTypes',filterMonsterSettings);
	}
}
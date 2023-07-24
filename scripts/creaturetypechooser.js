import { SFCONSTS } from "./main.js";
import { SFLOCALCONSTS } from "./localconst.js";
import { SFLocalHelpers } from "./localmodule.js";
import { sortable } from "./sortables.js";
import { DialogUtils } from "./utils/DialogUtils.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";

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
		const creatureTypes = Array.from(Object.keys(SFLocalHelpers.creatureTypeCount)).sort();
		const constMonsterTypeFilter = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"filterMonsterTypes"
		  );

		if (FoundryUtils.getSystemId() === "pf2e")
		{
			// add a checkbox for ignoring generic monsters
			const ignoreCreaturesWithNoImage = game.settings.get( SFCONSTS.MODULE_NAME, "ignoreCreaturesWithNoImage");
			$ul.append(`<li class="ignoreCreaturesWithNoImageLi">
				<input type="checkbox" name="ignoreCreaturesWithNoImage" ${ignoreCreaturesWithNoImage ? "checked" : ""}>
				<span class="ignore-creatures">Ignore Creatures with the default image</span>
			</li>`);
		}


		let totalCount = 0;
		for (let currentType of creatureTypes) {
			const el = constMonsterTypeFilter.find(i => Object.keys(i)[0] === currentType);
			let monsterCount = SFLocalHelpers.creatureTypeCount[currentType];
			let monsterCountText = "";
			if (monsterCount)
			{
				monsterCountText = ` - ${monsterCount} creatures`;
				totalCount += monsterCount;
			}
			let currentTypeCasedCorrect = currentType.charAt(0).toUpperCase() + currentType.slice(1);
			$ul.append(`<li class="monsterTypeLi">
				<input type="checkbox" name="${currentType}" ${!el || el[currentType] ? "checked" : ""}>
				<span class="monster-type">${currentTypeCasedCorrect}${monsterCountText}</span>
			</li>`)
		}

		let dialogTitle = html.find('h3#creaturetype-title').first();
		dialogTitle[0].innerText = `Filter Creature Types (${totalCount} creatures)`;

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}

	async activateListeners(html) {
		this.populateCreatureTypes();
		DialogUtils.activateCheckAllListeners(html, this.element, 'ul#creature_filter', 'li.monsterTypeLi');
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

		let ignoreCreaturesWithNoImage = false;
		$ul.find('li.ignoreCreaturesWithNoImageLi').each((index, item) => {
			let $element = $(item).find('input');
			ignoreCreaturesWithNoImage = $element.is(':checked');
		});
		const previousSetting = game.settings.get( SFCONSTS.MODULE_NAME, "ignoreCreaturesWithNoImage");

		if (previousSetting != ignoreCreaturesWithNoImage)
		{
			// This will force a reload of the index
			SFLocalHelpers.dictionariesPopulated = false;
		}

		await game.settings.set(SFCONSTS.MODULE_NAME, 'ignoreCreaturesWithNoImage', ignoreCreaturesWithNoImage);
		await game.settings.set(SFCONSTS.MODULE_NAME, 'filterMonsterTypes',filterMonsterSettings);
	}
}

import { FoundryUtils } from "./utils/FoundryUtils.js";
import { sortable } from "./sortables.js";
import { SFCONSTS } from "./main.js";
import { DialogUtils } from "./utils/DialogUtils.js";
import { SFLocalHelpers } from "./localmodule.js";

export class SFCompendiumSorter extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `Stochastic, Fantastic! Filter & Sort Compendiums`,
			id: "SFChooser",
			template: `modules/dnd-randomizer/templates/compendium.hbs`,
			resizable: true,
			width: window.innerWidth > 400 ? 400 : window.innerWidth - 100,
			height: window.innerHeight > 500 ? 500 : window.innerHeight - 100
		}
	}

	getData() {
		return { }
	}

	populateCompendiums(type) {
		const html = this.element
		const filteredCompendiums = FoundryUtils.getCompendiums().filter((p) => type.includes(p.documentName));
		let $ul = html.find('ul#compendium_filter').first();
		const constCompFilter = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"filterCompendiums"
		  );
		const compendiums = filteredCompendiums.sort((a, b) => {
			const filterIndexA =
			constCompFilter.indexOf(constCompFilter.find(i => Object.keys(i)[0] == a.collection));
			const filterIndexB =
			constCompFilter.indexOf(constCompFilter.find(i => Object.keys(i)[0] == b.collection))
			return filterIndexA > filterIndexB ? 1 : -1;
		  });


		for (let compendium of compendiums) {
			const el = constCompFilter.find(i => Object.keys(i)[0] == compendium.collection)
			console.log(compendium);
			$ul.append(`<li class="compendiumTypeLi">
				<input type="checkbox" name="${compendium.collection}" ${!el || el[compendium.collection] ? "checked" : ""}>
				<span class="compendium-type" data-type="${compendium.documentName}">${compendium.documentName}</span>
				<span class="compendium-title" data-name="${compendium.collection}">${compendium.metadata.label}</span>
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
		this.populateCompendiums(["Actor","Item"]);
		let savedIndexDate = SFLocalHelpers._indexCacheDate;
		if (savedIndexDate)
		{
			html.find('button#index-compendiums')[0].innerText = `Force reindex - Index Date: ${savedIndexDate}`;
		}

		html.find('button#index-compendiums').on('click', async (event) => {
			event.preventDefault();
			const $button = $(event.currentTarget);
			$button.prop('disabled', true).addClass('disabled');
			let forceReload = true;
			html.find('button#index-compendiums')[0].innerText = `Currently indexing...`;
			let doneIndexing = await SFLocalHelpers.populateObjectsFromCompendiums(forceReload);
			savedIndexDate = SFLocalHelpers._indexCacheDate;
			html.find('button#index-compendiums')[0].innerText = `Force reindex - Index Date: ${savedIndexDate}`;
			$button.prop('disabled', false).removeClass('disabled');
		});

		DialogUtils.activateCheckAllListeners(html, this.element, 'ul#compendium_filter', 'li.compendiumTypeLi');
	}

	async close(options) {
		await this.saveCompendiumSetting();
		// Default Close
		return await super.close(options);
	}

	async saveCompendiumSetting()
	{
		const html = this.element;
		let filterCompendiumSettings = [];
		let $ul = html.find('ul#compendium_filter').first();

		$ul.find('li.compendiumTypeLi').each((index, item) => {
			let $element = $(item).find('input');
			let setting = {};
			setting[$element.attr('name')] = $element.is(':checked');

			filterCompendiumSettings.push(setting);
		});
		
		await game.settings.set(SFCONSTS.MODULE_NAME, 'filterCompendiums',filterCompendiumSettings);
	}
}
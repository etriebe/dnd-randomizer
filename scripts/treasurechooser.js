import { SFCONSTS } from "./main.js";
import { SFLOCALCONSTS } from "./localconst.js";
import { SFLocalHelpers } from "./localmodule.js";
import { sortable } from "./sortables.js";
import { DialogUtils } from "./utils/DialogUtils.js";
import { GeneralUtils } from "./utils/GeneralUtils.js";

export class SFTreasureChooser extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `Stochastic, Fantastic! Choose Treasuer Types`,
			id: "SFChooser",
			template: `modules/dnd-randomizer/templates/treasure.hbs`,
			resizable: true,
			width: window.innerWidth > 400 ? 400 : window.innerWidth - 100,
			height: window.innerHeight > 500 ? 500 : window.innerHeight - 100
		}
	}

	getData() {
		return { }
	}

	populateTreasureOptions() {
		const html = this.element
		let $ul = html.find('ul#treasure_filter').first();
		let allItemRarities = SFLocalHelpers.allItems.map(i => i.rarity).filter(GeneralUtils.onlyUnique).sort();
		const constTreasureFilter = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"filterTreasure"
		  );
		
		for (let rarity of allItemRarities) {
			const el = constTreasureFilter.find(i => Object.keys(i)[0] === rarity);
			let rarityCount = SFLocalHelpers.allItems.filter(i => i.rarity === rarity).length;
			let rarityCountText = "";
			if (rarityCount)
			{
				rarityCountText = ` - ${rarityCount} items `;
			}
			let rarityCasedCorrect = rarity.charAt(0).toUpperCase() + rarity.slice(1);
			$ul.append(`<li class="rarityTypeLi">
				<input type="checkbox" name="${rarity}" ${!el || el[rarity] ? "checked" : ""}>
				<span class="rarity-type">${rarityCasedCorrect}${rarityCountText}</span>
			</li>`)
		}

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}

	async activateListeners(html) {
		this.populateTreasureOptions();
		DialogUtils.activateCheckAllListeners(html, this.element, 'ul#treasure_filter', 'li.rarityTypeLi');
	}

	async close(options) { 
		await this.saveMonsterTypeSetting();
		// Default Close
		return await super.close(options);
	}

	async saveMonsterTypeSetting()
	{
		const html = this.element;
		let $ul = html.find('ul#treasure_filter').first();
		let filterTreasureSettings = [];

		$ul.find('li.rarityTypeLi').each((index, item) => {
			let $element = $(item).find('input');
			let setting = {};
			setting[$element.attr('name')] = $element.is(':checked');

			filterTreasureSettings.push(setting);
		});
		
		await game.settings.set(SFCONSTS.MODULE_NAME, 'filterTreasure',filterTreasureSettings);
	}
}
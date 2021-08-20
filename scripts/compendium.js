class SFCompendiumSorter extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `Stochastic, Fantastic! Filter & Sort Compendiums`,
			id: "SFCompendiumSorter",
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
		const filteredCompendiums = game.packs.filter((p) => type.includes(p.documentName));
		let $ul = html.find('ul').first();
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
			$ul.append(`<li>
				<input type="checkbox" name="${compendium.metadata.package}.${compendium.metadata.name}" ${!el || el[compendium.collection] ? "checked" : ""}>
				<span class="compendium-type" data-type="${compendium.documentName}">${compendium.documentName}</span>
				<span class="compendium-title">${compendium.metadata.label}</span>
			</li>`)
		}

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}
	
	async activateListeners(html) {
		this.populateCompendiums(["Actor","Item"])
	}

	async close(options) { 
		const html = this.element
		let settings = [];
		let $ul = html.find('ul').first();

		$ul.find('li').each((index, item) => {
			let $element = $(item).find('input');
			let setting = {};
			setting[$element.attr('name')] = $element.is(':checked');

			settings.push(setting);
		});
		console.log(settings)
		
		await game.settings.set(SFCONSTS.MODULE_NAME, 'filterCompendiums',settings);

		// Default Close
		return await super.close(options);
	}

	async _updateObject(event, formData) {

	}
}
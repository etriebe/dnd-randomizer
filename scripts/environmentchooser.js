class SFEnvironmentChooser extends FormApplication {
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
		
		for (let environment of this.environments)
		{
			const el = savedEnvironmentSettings.find(i => Object.keys(i)[0] === environment);
			let monsterCount = SFLocalHelpers.environmentCreatureCount[environment];
			let monsterCountText = "";
			if (monsterCount)
			{
				monsterCountText = ` - ${monsterCount} creatures`;
			}
			$ul.append(`
			<li class="environmentLi">
				<input type="checkbox" name="${environment}" ${!el || el[environment] ? "checked" : ""}>
				<span class="environment-type" data-name="${environment === "Any" ? "Creatures without a environment get grouped into an 'Any' bucket" : ""}">${environment}${monsterCountText}</span>
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
		this.populateEnvironments();
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
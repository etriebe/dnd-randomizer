class SFCompendiumSorter extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
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
				<input type="checkbox" name="${compendium.metadata.package}.${compendium.metadata.name}" ${!el || el[compendium.collection] ? "checked" : ""}>
				<span class="compendium-type" data-type="${compendium.documentName}">${compendium.documentName}</span>
				<span class="compendium-title" data-name="${compendium.metadata.package}.${compendium.metadata.name}">${compendium.metadata.label}</span>
			</li>`)
		}

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
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

	populatePlayerCharacters() {
		const html = this.element
		let $ul = html.find('ul#player_filter').first();
		let playerCharacters = SFLocalHelpers.getListOfActivePlayers();
		
		const savedPlayerSettings = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"playerCharactersToCreateEncountersFor"
		);
		
		for (let player of playerCharacters) {
			let playerName = player.name;
			const el = savedPlayerSettings.find(i => Object.keys(i)[0] === playerName);
			let playerClasses = player.classes;
			let playerClassList = SFLocalHelpers.getPlayerClassList(player);
			let playerClassSpans = [];
			for (let i = 0; i < playerClassList.length; i++)
			{
				let currentClassName = playerClassList[i];
				let currentClassSpan = this.getPlayerClassSpan(player, currentClassName);
				playerClassSpans.push(currentClassSpan);
			}
			$ul.append(`<li class="playerCharacterLi">
				<input type="checkbox" name="${playerName}" ${!el || el[playerName] ? "checked" : ""}>
				${playerClassSpans.join("")}
				<span class="player-character">${playerName}</span>
			</li>`)
		}

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}

	getPlayerClassSpan(player, currentClass)
	{
		let currentSystem = game.system.id;

		if (currentSystem === "dnd5e")
		{
			let playerClasses = player.classes;
			let currentClassNameCasedCorrect = currentClass.charAt(0).toUpperCase() + currentClass.slice(1);
			let currentClassObject = playerClasses[currentClass];
			let currentClassLevel = FoundryUtils.getDataObjectFromObject(currentClassObject).levels;
			let currentClassSpan = `<span class="player-character-info" data-type="${currentClass}">${currentClassNameCasedCorrect}: Level ${currentClassLevel}</span>`;
			return currentClassSpan;
		}
		else if (currentSystem === "pf2e")
		{
			let currentClassLevel = player.level;

			let pf2eClassName;
			let currentClassNameCasedCorrect;
			if (!currentClass)
			{
				pf2eClassName = currentClassNameCasedCorrect = "No class";
			}
			else
			{
				pf2eClassName = currentClass.name;
				currentClassNameCasedCorrect = pf2eClassName.charAt(0).toUpperCase() + pf2eClassName.slice(1);
			}
			
			let currentClassSpan = `<span class="player-character-info" data-type="${pf2eClassName.toLowerCase()}">${currentClassNameCasedCorrect}: Level ${currentClassLevel}</span>`;
			return currentClassSpan;
		}
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
		this.populatePlayerCharacters();
		this.populateEnvironments();
		this.populateCompendiums(["Actor","Item"]);
		this.populateCreatureTypes();
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
	}

	async close(options) { 
		await this.saveCompendiumSetting();
		await this.saveMonsterTypeSetting();
		await this.savePlayerCharacterSetting();
		await this.saveEnvironmentsSetting();
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

	async savePlayerCharacterSetting()
	{
		const html = this.element;
		let $ul = html.find('ul#player_filter').first();
		let playerCharacterSettings = [];

		$ul.find('li.playerCharacterLi').each((index, item) => {
			let $element = $(item).find('input');
			let setting = {};
			setting[$element.attr('name')] = $element.is(':checked');

			playerCharacterSettings.push(setting);
		});
		console.log(playerCharacterSettings)
		
		await game.settings.set(SFCONSTS.MODULE_NAME, 'playerCharactersToCreateEncountersFor',playerCharacterSettings);
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

	async _updateObject(event, formData) {

	}
}
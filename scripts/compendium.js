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

	populatePlayerCharacters() {
		const html = this.element
		let $ul = html.find('ul#player_filter').first();
		let playerCharacters = game.actors.filter(a=>a.hasPlayerOwner === true);
		
		const savedPlayerSettings = game.settings.get(
			SFCONSTS.MODULE_NAME,
			"playerCharactersToCreateEncountersFor"
		  );
		
		for (let player of playerCharacters) {
			let playerName = player.name;
			const el = savedPlayerSettings.find(i => Object.keys(i)[0] === playerName);
			let playerClasses = player.classes;
			let playerClassList = Object.keys(playerClasses);
			let playerClassSpans = [];
			for (let i = 0; i < playerClassList.length; i++)
			{
				let currentClassName = playerClassList[i];
				let currentClassNameCasedCorrect = currentClassName.charAt(0).toUpperCase() + currentClassName.slice(1);
				let currentClass = playerClasses[currentClassName];
				let currentClassLevel = currentClass.data.data.levels;
				let currentClassSpan = `<span class="player-character-info" data-type="${currentClassName}">${currentClassNameCasedCorrect}: Level ${currentClassLevel}</span>`;
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
			console.log(currentType);
			let currentTypeCasedCorrect = currentType.charAt(0).toUpperCase() + currentType.slice(1);
			$ul.append(`<li class="monsterTypeLi">
				<input type="checkbox" name="${currentType}" ${!el || el[currentType] ? "checked" : ""}>
				<span class="monster-type">${currentTypeCasedCorrect}</span>
			</li>`)
		}

		sortable('#SFCompendiumSorter .sortable-compendiums', {
			forcePlaceholderSize: true
		});
	}
	
	async activateListeners(html) {
		this.populatePlayerCharacters();
		this.populateCompendiums(["Actor","Item"]);
		this.populateCreatureTypes();
	}

	async close(options) { 
		await this.saveCompendiumSetting();
		await this.saveMonsterTypeSetting();
		await this.savePlayerCharacterSetting();
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
		console.log(filterCompendiumSettings)
		
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
		console.log(filterMonsterSettings)
		
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

	async _updateObject(event, formData) {

	}
}
import { FoundryUtils } from "./utils/FoundryUtils.js";
import { SFLocalHelpers } from "./localmodule.js";
import { SFCONSTS } from "./main.js";
import { sortable } from "./sortables.js";

export class SFPlayerChooser extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `Stochastic, Fantastic! Choose Environments`,
			id: "SFChooser",
			template: `modules/dnd-randomizer/templates/player.hbs`,
			resizable: true,
			width: window.innerWidth > 400 ? 400 : window.innerWidth - 100,
			height: window.innerHeight > 500 ? 500 : window.innerHeight - 100
		}
	}

	getData() {
		return { }
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

	async activateListeners(html) {
		this.populatePlayerCharacters();
	}

	async close(options) { 
		await this.savePlayerCharacterSetting();
		// Default Close
		return await super.close(options);
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
}
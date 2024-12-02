import { ModuleUtils } from "./utils/ModuleUtils.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";
import { SFLocalHelpers } from "./localmodule.js";
import { SFHelpers } from "./module.js";
import { FuzzySet } from "./fuzzyset.js";
import { SFLOCALCONSTS } from "./localconst.js";
import { SFCONSTS } from "./main.js";
import { EncounterUtilsPf2e } from "./pf2e/EncounterUtilsPf2e.js";
import { ActorUtils } from "./utils/ActorUtils.js";
import { EncounterUtils } from "./utils/EncounterUtils.js";
export class SFDialog extends FormApplication
{
	constructor()
	{
		super();
		this.environments = SFCONSTS.GEN_OPT.environment;
	}

	static get defaultOptions()
	{
		let useLocalPCs = game.settings.get(SFCONSTS.MODULE_NAME, 'usePlayerOwnedCharactersForGeneration');
		let numberOfPlayers = 0;
		let averageLevelOfPlayers = 0;
		if (useLocalPCs)
		{
			let activePlayerInfo = SFLocalHelpers.getActivePlayersCountAndLevels();
			numberOfPlayers = activePlayerInfo["numberofplayers"];
			averageLevelOfPlayers = activePlayerInfo["averageplayerlevel"];
		}

		if (!averageLevelOfPlayers || numberOfPlayers === 0)
		{
			console.warn(`Not using player character PCs because there were none found locally.`);
			useLocalPCs = false;
		}

		let dialogTemplate = useLocalPCs ? `modules/dnd-randomizer/templates/usePCsDialog.hbs` : `modules/dnd-randomizer/templates/dialog.hbs`;
		return {
			...super.defaultOptions,
			title: game.i18n.localize('SF.dialog.title'),
			id: "SFDialog",
			template: dialogTemplate,
			resizable: true,
			width: window.innerWidth > 700 ? 700 : window.innerWidth - 100,
			height: window.innerHeight > 800 ? 800 : window.innerHeight - 100
		};
	}

	getData()
	{
		return {
			environments: this.environments
		};
	}

	getDefaultsFromScene()
	{
		const characters = canvas.tokens.placeables.filter(t => t.actor?.type === "character" && t.actor?.hasPlayerOwner);
		let level = 0;
		if (characters)
		{
			try
			{				
				characters.forEach((c) => 
				{
					const actorObject = ActorUtils.getPCActorObject(c.actor);
					level += actorObject.level;
				});
				level = Math.round(level / characters.length);
				return { chars: characters.length || 4, level: level || 5 };
			}
			catch (error)
			{
				console.warn(`Unable to grab defaults for scene from all character levels in the scene`);
				console.warn(error);
				return { chars: 4, level: 5 }; 
			}
		}
		else
		{
			return { chars: 4, level: 5 };
		}
	}

	populateEncounterTypes()
	{
		let currentSystem = game.system.id;
		let encounterDescriptionsObject = EncounterUtils.getEncounterDescriptionObjects();

		const html = this.element;
		let $span = html.find('#encounterTypePlaceholder').first();
		let $select = html.find('#encounterTypeSelect').first();
		let i = 0;

		for (var encounterType in encounterDescriptionsObject)
		{

			if (!encounterType)
			{
				continue;
			}

			if (i === 0)
			{
				$span.html(encounterType);
				$select.append(`<option value="${encounterType}" selected>${encounterType}</option>`);
			}
			else
			{
				$select.append(`<option value="${encounterType}">${encounterType}</option>`);
			}
			i++;
		}
	}

	async populateEncounters(encounterData)
	{
		const html = this.element;
		let $ul = html.find('.form-encounters ul').first();

		for (const encounter of encounterData)
		{
			let combatSummaryHTML = ``;
			if (encounter.combatsummary.totalattacks > 0)
			{
				combatSummaryHTML = `<div class="combat-summary">Per Round: 
					<span class="combat-numberofattacks">${encounter.combatsummary.totalattacks} attacks</span>
					${encounter.combatsummary.totaldamage > 0 ? `<span class="combat-totaldamage"> | ${encounter.combatsummary.totaldamage} dmg</span>` : ''}
					${encounter.combatsummary.totalaoedamage > 0 ? `<span class="combat-totalaoedamage"> | ${encounter.combatsummary.totalaoedamage} AOE dmg</span>` : ''}
					<span class="combat-averageattackbonus"> | ${encounter.combatsummary.averageattackbonus.toFixed(0)} average attack bonus</span>
				</div>`;
			}
			let combatEstimateButtonHTML = ``;
			if (FoundryUtils.getSystemId() === "dnd5e")
			{
				combatEstimateButtonHTML = `<i class="fal fa-swords" data-trigger="combat" title="Encounter Combat Estimate"></i>`;
			}

			$ul.append(`<li class="is-favorited-${encounter.data?.id ?? false ? 'true' : 'false'}" data-id="${encounter.id}">
				<div class="favorite-encounter ${encounter.data?.id ?? false ? 'favorited' : ''}"><i class="far fa-star"></i></div>
				<div class="encounter-details">
					<div class="encounter-details-header">
						<input type="text" class="encounter-details-header-title" value="${encounter.name ?? "Custom Name"}" />
					</div>
					<div class="encounter-details-loot"></div>
				</div>
				<div class="encounter-info">
					<div class="encounter-data">
						<span class="loot-button"><i class="fas fa-coins"></i></span>
						${encounter.currency.pp > 0 ? `<span class="loot-button">pp ${encounter.currency.pp}</span>` : ''}
						${encounter.currency.gp > 0 ? `<span class="loot-button">gp ${encounter.currency.gp}</span>` : ''}
						${encounter.currency.ep > 0 ? `<span class="loot-button">ep ${encounter.currency.ep}</span>` : ''}
						${encounter.currency.sp > 0 ? `<span class="loot-button">sp ${encounter.currency.sp}</span>` : ''}
						${encounter.currency.cp > 0 ? `<span class="loot-button">cp ${encounter.currency.cp}</span>` : ''}
						<span class="encounter-difficulty ${encounter.data.difficulty}">${encounter.data.difficulty}</span>
						${encounter.currency.xp > 0 ? `<span class="encounter-xp">${encounter.data.xp}</span>` : ''}
						${encounter.amountToAdjustEncounter != null && encounter.amountToAdjustEncounter != 0 ?	`<span class="encounter-xpadjustment">
							${EncounterUtilsPf2e.getAdjustedXPString(encounter.amountToAdjustEncounter)}</span>` : ''}
					</div>
					${combatSummaryHTML}
				</div>
				<div class="create-encounter">
					<i class="fas ${game.settings.get(SFCONSTS.MODULE_NAME, 'secretEncounterIcon') ? 'fa-pastafarianism' : 'fa-angle-double-right'}" data-trigger="spawn" title="Spawn Encounter"></i>
					<i class="fas fa-briefcase" data-trigger="loot" title="Generate Loot"></i>
					${combatEstimateButtonHTML}
				</div>
			</li>`);

			$ul.find('li:last-child .encounter-details-header-title').on('change', function (event)
			{
				let $input = $(event.currentTarget);
				let savedEncounters = game.settings.get(SFCONSTS.MODULE_NAME, 'favoritedEncounters');
				let encounterDetails = {};

				// If named is cleared set it back to default encounter name
				$input.val($input.val().length > 0 ? $input.val() : encounter.name);

				// Update Encounter Name
				encounter.name = $input.val();

				// Build Encounter object to save Encounter data
				encounterDetails[encounter.id] = {
					...encounter.data,
					name: $input.val()
				};

				// If encounter is favorited, update it
				if ($input.closest('li').find('.favorite-encounter').hasClass('favorited'))
				{
					savedEncounters = foundry.utils.mergeObject(savedEncounters, encounterDetails, { inplace: false });

					game.settings.set(SFCONSTS.MODULE_NAME, 'favoritedEncounters', savedEncounters);
				}
			});

			$ul.find('li:last-child .favorite-encounter i').on('click', function (event)
			{
				let $element = $(event.currentTarget).closest('div');
				let savedEncounters = game.settings.get(SFCONSTS.MODULE_NAME, 'favoritedEncounters');
				let encounterDetails = {};
				encounter.data.id = encounter.id;
				encounter.data.name = encounter.name;
				encounterDetails[encounter.id] = encounter.data;

				$element.toggleClass('favorited');

				if ($element.hasClass('favorited'))
				{
					savedEncounters = foundry.utils.mergeObject(savedEncounters, encounterDetails, { inplace: false });
				} else
				{
					delete savedEncounters[encounter.id];
				}

				game.settings.set(SFCONSTS.MODULE_NAME, 'favoritedEncounters', savedEncounters);
			});

			$ul.find('li:last-child .create-encounter i.fas[data-trigger="spawn"]').on('click', function (event)
			{
				canvas.templates.activate();
				ui.notifications.info("Please place a Circle Template to Spawn the Encounter");
				encounter.spawn();
			});

			$ul.find('li:last-child .create-encounter i.fas[data-trigger="loot"]').on('click', function (event)
			{
				encounter.createLootSheet();
			});

			$ul.find('li:last-child .create-encounter i.fal[data-trigger="combat"]').on('click', function (event)
			{
				encounter.combatEstimate();
			});

			let $details = $ul.find('li:last-child .encounter-details');
			for (const creature of encounter.creatures)
			{
				try
				{
					const npcActorObject = await ActorUtils.getActorObjectFromActorIdCompendiumName(creature.actorid, creature.compendiumname);
					await npcActorObject.analyzeActor();
					const actorLink = FoundryUtils.getActorLink(npcActorObject);
					const actorCRSpan = creature.cr === null || creature.cr === undefined ? `` : `<span class="creature-cr">CR ${creature.cr}</span>`;
					const actorLevelSpan = creature.level === null || creature.level === undefined ? `` : `<span class="creature-cr">Lvl ${creature.level}</span>`;
					$details.find('.encounter-details-header').append(`<span class="creature-button"><span class="creature-count">${creature.quantity}</span> ${actorLink}${actorCRSpan}${actorLevelSpan}</span>`);
				}
				catch (error)
				{
					console.warn(`Unable to add actor from favorited encounter: ${creature.actorid} from compendium ${creature.compendiumname}`);
					continue;
				}
			}

			for (const unfilled of encounter.unfilledformula)
			{
				const formula = unfilled.formula;
				const targetXP = unfilled.targetxp;
				const targetMonsterLevel = unfilled.targetmonsterlevel;
				const numberOfCreatures = unfilled.numberofcreatures;
				let creatureTargetInformationSpan = "";
				if (targetXP)
				{
					creatureTargetInformationSpan = `<span class="creature-cr">Missing XP Target: ${targetXP}</span>`;
				}
				if (targetMonsterLevel)
				{
					creatureTargetInformationSpan = `<span class="creature-cr">Missing Lvl: ${targetMonsterLevel}</span>`;
				}
				$details.find('.encounter-details-header').append(`<span class="unfilled-formula"><span class="creature-count-unfilled">${numberOfCreatures}</span>${creatureTargetInformationSpan}</span>`);
			}


			for (const loot of encounter.loot)
			{
				const itemName = loot.dynamicLink.length > 0 ? await FoundryUtils.getItemLink(loot) : loot.name;
				$details.find('.encounter-details-loot').append(`<span class="loot-button">
					${loot.quantity} <i class="fas fa-times" style="font-size: 0.5rem"></i>
					${itemName}
				</span>`);
			}
		}
	}

	async activateListeners(html)
	{
		super.activateListeners(html);

		ModuleUtils.disableButtonsWhileIndexing(html);
		await SFLocalHelpers.populateObjectsFromCompendiums(false);
		ModuleUtils.enabledButtonsAfterIndexingFinished(html);
		const _this = this;
		const charData = this.getDefaultsFromScene();
		let getFavoritedEncounters = game.settings.get(SFCONSTS.MODULE_NAME, 'favoritedEncounters');

		// Check if there are Favorited Encounters, if so populate them
		if (Object.entries(getFavoritedEncounters).length > 0)
		{
			getFavoritedEncounters = await SFHelpers.parseEncounter(
				Object.values(getFavoritedEncounters)
			);
			await this.populateEncounters(getFavoritedEncounters);
		}

		this.populateEncounterTypes();

		html.find('button#generate-remote-encounters-button').on('click', async (event) =>
		{
			event.preventDefault();
			let clearOldEncounters = game.settings.get(SFCONSTS.MODULE_NAME, 'clearOldEncountersOnGeneration');
			if (clearOldEncounters)
			{
				const $li = html.find('.form-encounters li');
				for (var i = 0; i < $li.length; i++)
				{
					let currentEncounter = $li[i];
					if (currentEncounter.classList.contains("is-favorited-false"))
					{
						currentEncounter.remove();
					}
				}
			}
			const $button = $(event.currentTarget);

			// Add button spinner and disable all buttons
			$button.prop('disabled', true).addClass('disabled');
			$button.find('i.fas').removeClass('fa-dice').addClass('fa-spinner fa-spin');
			ModuleUtils.disableButtonsWhileIndexing(html, false);

			let numberOfPlayers = 0;
			let averageLevelOfPlayers = 0;
			let useLocalPCs = game.settings.get(SFCONSTS.MODULE_NAME, 'usePlayerOwnedCharactersForGeneration');
			if (useLocalPCs)
			{
				let activePlayerInfo = SFLocalHelpers.getActivePlayersCountAndLevels();
				numberOfPlayers = activePlayerInfo["numberofplayers"];
				averageLevelOfPlayers = activePlayerInfo["averageplayerlevel"];
			}

			if (!numberOfPlayers || averageLevelOfPlayers === 0)
			{
				numberOfPlayers = html.find('#numberOfPlayers select[name="numberOfPlayers"]').val();
				averageLevelOfPlayers = html.find('#averageLevelOfPlayers select[name="averageLevelOfPlayers"]').val();
			}

			const encounterType = html.find('#encounterTypeSpan select[id="encounterTypeSelect"]').val();
			const params = {
				loot_type: html.find('#lootType select[name="lootType"]').val(),
				encounterType: encounterType,
				creatureTypeVariety: html.find('#creatureTypeVariationSpan select[id="creatureTypeVariationSelect"]').val(),
				numberOfPlayers: numberOfPlayers,
				averageLevelOfPlayers: averageLevelOfPlayers
			};

			let encounterTypeObject = EncounterUtils.getEncounterDescriptionObjects();
			let encounterFormula = encounterTypeObject[encounterType];

			const isEncounterFormulaPossible = EncounterUtils.isEncounterFormulaPossibleForPlayers(encounterFormula, averageLevelOfPlayers);

			if (!isEncounterFormulaPossible)
			{
				let d = new Dialog({
					title: "Encounter Alert",
					content: "<p>The encounter type chosen is impossible for your current average player level. Please choose another type or check the console for more information.</p>",
					buttons: {
					 one: {
					  icon: '<i class="fas fa-check"></i>',
					  label: "OK",
					  callback: () => console.log("Dialog dismissed")
					 }
					},
					default: "one",
					render: html => console.log("Alert dialog rendered"),
					close: html => console.log("Alert dialog closed")
				});
				d.render(true);
				$button.prop('disabled', false).removeClass('disabled');
				$button.find('i.fas').removeClass('fa-spinner fa-spin').addClass('fa-dice');
				return;
			}

			let forceReload = false;
			await SFLocalHelpers.populateObjectsFromCompendiums(forceReload);

			let filteredMonsters = await SFLocalHelpers.filterMonstersFromCompendiums();
			let filteredItems = await SFLocalHelpers.filterItemsFromCompendiums();
			let generateEncounters = await SFLocalHelpers.createEncounters(filteredMonsters, filteredItems, params, 30);
			generateEncounters = generateEncounters.sort((a, b) =>
			{
				const da = SFCONSTS.DIFFICULTY[a.difficulty.replace(" ", "")];
				const db = SFCONSTS.DIFFICULTY[b.difficulty.replace(" ", "")];
				if (da > db) return -1;
				if (da < db) return 1;
				return 0;
			});
			const encounterData = await SFHelpers.parseEncounter(generateEncounters, params);
			await _this.populateEncounters(encounterData);

			// Enable buttons and remove spinner, reset look and feel
			ModuleUtils.enabledButtonsAfterIndexingFinished(html, false);
			$button.prop('disabled', false).removeClass('disabled');
			$button.find('i.fas').removeClass('fa-spinner fa-spin').addClass('fa-dice');
		});

		html.find('.filter-controller select').on('change', function (event)
		{
			$(event.currentTarget).closest('.form-encounters').attr('data-show', $(event.currentTarget).val());
		});

		ModuleUtils.setupFilterBarListeners(html);

		html.find('button#license-and-credits').on('click', (event) =>
		{
			event.preventDefault();
			new Dialog({
				title: "Stochastic, Fantastic! Credits",
				content: `<h1>Support Stochastic, Fantastic!</h1>
				<p>Join the Discord for more Awesome modules: <a href="https://discord.gg/F53gBjR97G" target="_blank">Discord</a></p>
				<p>Support on Patreon: <a href="https://www.patreon.com/theripper93">Patreon</a></p>
				<p>This module uses a proxy to retrieve the data it needs (tl;dr it costs money) consider supporting on Patreon to keep the module alive.</p>
				<hr/>
				<h1>License / Credits</h1>
				<h2>Sortable.Js</h2>
				More info here <a href="https://github.com/SortableJS/Sortable" target="_blank">https://github.com/SortableJS/Sortable</a>
				<h2>Fuzzyset.js</h2>
				<p>This package is licensed under the Prosperity Public License 3.0. That means that this package is free to use for non-commercial projects. See <a href="https://github.com/Glench/fuzzyset.js" target="_blank">https://github.com/Glench/fuzzyset.js</a> for more details.</p>
				<hr/>
				<p style="font-style: italic;">Stochastic, Fantastic! is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.</p>
				`,
				buttons: {},
				render: html => { },
				close: html => { }
			}).render(true);
		});

		html.find('.filter-controller input').on('keyup change', function (event)
		{
			event.preventDefault();
			const query = $(event.currentTarget).val();
			const lis = html.find('.form-encounters ul li');
			let queryIndex = {};
			let queryElements = [];
			lis.each((index, li) =>
			{
				li = $(li);
				let encId = li.data("id");
				let encName = li.find(".encounter-details-header-title").val();
				queryElements.push(encName);
				if (queryIndex[encName]) queryIndex[encName].push(encId);
				else queryIndex[encName] = [encId];

				li.find(".entity-link").each((index, link) =>
				{
					let name = $(link).text();
					queryElements.push(name);
					if (queryIndex[name]) queryIndex[name].push(encId);
					else queryIndex[name] = [encId];
				});
			});
			const idsToShow = {};
			let fs = FuzzySet(queryElements, true);
			let res = fs.get(query, [], 0.3).map(el => el[1]).forEach((el) =>
			{
				queryIndex[el].forEach(id => idsToShow[id] = true);
			});
			queryElements.forEach(el =>
			{
				if (el.toLowerCase().includes(query.toLowerCase()))
					queryIndex[el].forEach(id => idsToShow[id] = true);
			});
			lis.each((index, li) =>
			{
				li = $(li);
				li.toggleClass('hidden', !(idsToShow[li.data("id")] || !query));
			});

		});



		// TODO: CLEAN UP CODE
		// show and hide styled inputs, update natural language statement
		html.find('.input-container').click(function ()
		{
			var target = $(this);
			var targetInput = $(this).find('input');
			var targetSelect = $(this).find('select');
			var styledSelect = $(this).find('.newSelect');
			target.addClass('active');
			targetInput.focus();
			targetInput.change(function ()
			{
				var inputValue = $(this).val();
				var placeholder = target.find('.placeholder');
				target.removeClass('active');
				placeholder.html(inputValue);
			});
			targetSelect.change(function ()
			{
				var inputValue = $(this).val();
				var placeholder = target.find('.placeholder');
				target.removeClass('active');
				placeholder.html(inputValue);
			});
			styledSelect.click(function ()
			{
				var target = $(this);
				setTimeout(function ()
				{
					target.parent().parent().removeClass('active');
				}, 10);
			});
		});

		// style selects

		// Create the new select
		var select = $('.fancy-select');
		select.wrap('<div class="newSelect"></div>');
		html.find('.newSelect').prepend('<div class="newOptions"></div>');

		//populate the new select
		select.each(function ()
		{
			var selectOption = $(this).find('option');
			var target = $(this).parent().find('.newOptions');
			selectOption.each(function ()
			{
				var optionContents = $(this).html();
				var optionValue = $(this).attr('value');
				target.append('<div class="newOption" data-value="' + optionValue + '">' + optionContents + '</div>');
			});
		});
		// new select functionality
		var newSelect = html.find('.newSelect');
		var newOption = html.find('.newOption');
		// update based on selection 
		newOption.on('mouseup', function ()
		{
			var OptionInUse = $(this);
			var siblingOptions = $(this).parent().find('.newOption');
			var newValue = $(this).attr('data-value');
			var selectOption = $(this).parent().parent().find('select option');
			// style selected option
			siblingOptions.removeClass('selected');
			OptionInUse.addClass('selected');
			// update the actual input
			selectOption.each(function ()
			{
				var optionValue = $(this).attr('value');
				if (newValue == optionValue)
				{
					$(this).prop('selected', true);
				} else
				{
					$(this).prop('selected', false);
				}
			});
		});
		newSelect.click(function ()
		{
			var target = $(this);
			target.parent().find('select').change();
		});

		// Set Defaults
		$('#numberOfPlayers .placeholder').text(charData.chars);
		$('#numberOfPlayers select').val(charData.chars).trigger('change');
		$(`#numberOfPlayers .newOptions .newOption[data-value="${charData.chars}"]`).addClass('active selected');
		$('#averageLevelOfPlayers .placeholder').text(charData.level);
		$('#averageLevelOfPlayers select').val(charData.level);
		$(`#averageLevelOfPlayers .newOptions .newOption[data-value="${charData.level}"]`).addClass('active selected');
		$(`#lootType .newOptions .newOption[data-value="Treasure Horde"]`).addClass('active selected');
	}

	async _updateObject(event, formData)
	{

	}
}

Hooks.once('ready', async () =>
{
	canvas.SFDialog = new SFDialog();
	//canvas.SFDialog.render(true);

	game.modules.get(SFCONSTS.MODULE_NAME).crab = () =>
	{
		game.settings.set(SFCONSTS.MODULE_NAME, 'secretEncounterIcon', !game.settings.get(SFCONSTS.MODULE_NAME, 'secretEncounterIcon'));
	};


});


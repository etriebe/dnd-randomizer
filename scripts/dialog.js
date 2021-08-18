class SFDialog extends FormApplication {
	constructor() {
		super();
		this.environments = SFCONSTS.GEN_OPT.environment
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: game.i18n.localize('SF.dialog.title'),
			id: "SFDialog",
			template: `modules/dnd-randomizer/templates/dialog.hbs`,
			resizable: true,
			width: window.innerWidth > 700 ? 700 : window.innerWidth - 100,
			height: window.innerHeight > 800 ? 800 : window.innerHeight - 100
		}
	}

	getData() {
		console.log(game.i18n.localize('SF.dialog.title'))
		return {
			environments: this.environments
		}
	}

	populateEncounters(encounterData) {
		const html = this.element
		let $ul = html.find('.form-encounters ul').first();

		for (const encounter of encounterData) {
			$ul.append(`<li>
				<div class="favorite-encounter"><i class="far fa-star"></i></div>
				<div class="encounter-details">
					<div class="encounter-details-header">
						<div class="encounter-details-header-title">${encounter.name ?? "Custom Name"}</div>
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
						<span class="encounter-xp">${encounter.data.xp}</span>
					</div>
				</div>
				<div class="create-encounter">
					<i class="fas fa-angle-double-right" data-trigger="spawn"></i>
					<i class="fas fa-briefcase" data-trigger="loot"></i>
				</div>
			</li>`);

			$ul.find('li:last-child .create-encounter i.fas[data-trigger="spawn"]').on('click', function(event) {
				canvas.templates.activate()
				ui.notifications.info("Please place a Circle Template to Spawn the Encounter")
				encounter.spawn();
			})

			$ul.find('li:last-child .create-encounter i.fas[data-trigger="loot"]').on('click', function(event) {
				encounter.createLootSheet();
			})

			let $details = $ul.find('li:last-child .encounter-details');
			for (const creature of encounter.creatures) {
				$details.find('.encounter-details-header').append(`<span class="creature-button"><span class="creature-count">${creature.quantity}</span> ${TextEditor.enrichHTML(creature.dynamicLink)}</span>`);
			}

			
			for (const loot of encounter.loot) {
				$details.find('.encounter-details-loot').append(`<span class="loot-button">
					${loot.quantity} <i class="fas fa-times" style="font-size: 0.5rem"></i>
					${loot.dynamicLink.length > 0 ? TextEditor.enrichHTML(loot.dynamicLink) : loot.name}
				</span>`)
			}
		}
	}

	activateListeners(html) {
		super.activateListeners(html);
		const _this=this;

		html.find('button.generate-encounters').on('click', async (event) => {
			event.preventDefault();
			const $button = $(event.currentTarget);

			$button.prop('disabled', true).addClass('disabled');
			$button.find('i.fas').removeClass('fa-dice').addClass('fa-spinner fa-spin');
			const params = {
				loot_type: html.find('#lootType select[name="lootType"]').val(),
				numberOfPlayers: html.find('#numberOfPlayers select[name="numberOfPlayers"]').val(),
				averageLevelOfPlayers: html.find('#averageLevelOfPlayers select[name="averageLevelOfPlayers"]').val(),
				environment: html.find('#environmentSelector select[name="environmentSelector"]').val()
			}
			
			const fetchedData = await SFHelpers.fetchData(params);
			const encounterData = await SFHelpers.parseEncounter(fetchedData, params);

			/* Structure
			<li>
				<div class="favorite-encounter"></div>
				<div class="encounter-details"></div>
				<div class="encounter-info">

				</div>
				<div class="create-encounter"></div>
			</li>*/
			_this.populateEncounters(encounterData);


			$button.prop('disabled', false).removeClass('disabled');
			$button.find('i.fas').removeClass('fa-spinner fa-spin').addClass('fa-dice');
		});

		/*async function dataTest(){

			const parsedData = await fetchTest();
			console.log(parsedData)
			const encounters = parsedData.reduce((a,v) => {
				const enc = new Encounter(v).validate()
				if(enc !== undefined) a.push(enc)
				return a
			},[])
			for(let encounter of encounters){
				await encounter.prepareData()
				await encounter.loadActors()
				await encounter.createLootSheet()
			}
		
			return encounters
		}*/
















		// TODO: CLEAN UP CODE
		// show and hide styled inputs, update natural language statement
		html.find('.input-container').click(function() {
			var target = $(this);
			var targetInput = $(this).find('input');
			var targetSelect = $(this).find('select');
			var styledSelect = $(this).find('.newSelect');
			target.addClass('active');
			targetInput.focus();
			targetInput.change(function() {
			var inputValue = $(this).val();
			var placeholder = target.find('.placeholder')
			target.removeClass('active');
			placeholder.html(inputValue);
			});
			targetSelect.change(function() {
			var inputValue = $(this).val();
			var placeholder = target.find('.placeholder')
			target.removeClass('active');
			placeholder.html(inputValue);
			});
			styledSelect.click(function() {
			var target = $(this);
			setTimeout(function() {
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
		select.each(function() {
			var selectOption = $(this).find('option');
			var target = $(this).parent().find('.newOptions');
			selectOption.each(function() {
			var optionContents = $(this).html();
			var optionValue = $(this).attr('value');
			target.append('<div class="newOption" data-value="' + optionValue + '">' + optionContents + '</div>')
			});
		});
		// new select functionality
		var newSelect = html.find('.newSelect');
		var newOption = html.find('.newOption');
		// update based on selection 
		newOption.on('mouseup', function() {
			var OptionInUse = $(this);
			var siblingOptions = $(this).parent().find('.newOption');
			var newValue = $(this).attr('data-value');
			var selectOption = $(this).parent().parent().find('select option');
			// style selected option
			siblingOptions.removeClass('selected');
			OptionInUse.addClass('selected');
			// update the actual input
			selectOption.each(function() {
			var optionValue = $(this).attr('value');
			if (newValue == optionValue) {
				$(this).prop('selected', true);
			} else {
				$(this).prop('selected', false);
			}
			})
		});
		newSelect.click(function() {
			var target = $(this);
			target.parent().find('select').change();
		});
	}

	async _updateObject(event, formData) {

	}
}

Hooks.once('ready', async () => {
	canvas.sfDialog = new SFDialog();
	//canvas.sfDialog.render(true);

	
});


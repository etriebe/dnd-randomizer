import { SFCompendiumSorter } from "../compendium.js";
import { SFEnvironmentChooser } from "../environmentchooser.js";
import { SFPlayerChooser } from "../playerchooser.js";
import { SFCreatureTypeChooser } from "../creaturetypechooser.js";
import { SFTreasureChooser } from "../treasurechooser.js";
import { SFLocalHelpers } from "../localmodule.js";

export class ModuleUtils {
    static setupFilterBarListeners(html) {
		html.find('button#clear-button').on('click', function (event)
		{
			event.preventDefault();
			html.find('input#search-box').val('').trigger('change');
		});

		html.find('button#filter-compendium').on('click', (event) =>
		{
			event.preventDefault();
			new SFCompendiumSorter().render(true);
		});

		html.find('button#filter-environments').on('click', (event) =>
		{
			event.preventDefault();
			new SFEnvironmentChooser().render(true);
		});

		html.find('button#filter-people').on('click', (event) =>
		{
			event.preventDefault();
			new SFPlayerChooser().render(true);
		});

		html.find('button#filter-creatures').on('click', (event) =>
		{
			event.preventDefault();
			new SFCreatureTypeChooser().render(true);
		});

		html.find('button#force-reindex').on('click', async (event) =>
		{
			event.preventDefault();
			const $button = $(event.currentTarget);
			const $parent = $(event.target);
			$button.find('i.fas').removeClass('fa-rotate-right').addClass('fa-spinner fa-spin');
			ModuleUtils.disableButtonsWhileIndexing(html);
			await SFLocalHelpers.populateObjectsFromCompendiums(true);
			$button.find('i.fas').removeClass('fa-spinner fa-spin').addClass('fa-rotate-right');
			ModuleUtils.enabledButtonsAfterIndexingFinished(html);
		});

		html.find('button#filter-treasure').on('click', (event) =>
		{
			event.preventDefault();
			new SFTreasureChooser().render(true);
		});

		html.find('button#clear-encounters-button').on('click', function (event)
		{
			event.preventDefault();
			// html.find('input#search-box').val('').trigger('change');
		});
    };

	static disableButtonsWhileIndexing(html, disableGenerateEncounterButton = true)
	{
		html.find('button.toolbar-button').each(function ()
		{
			$(this).prop('disabled', true).addClass('disabled');
		});
		if (disableGenerateEncounterButton)
		{
			const generateEncounterButton = html.find('button#generate-remote-encounters-button');
			generateEncounterButton.prop('disabled', true).addClass('disabled');
			generateEncounterButton[0].innerHTML = `Indexing...`;
		}
	}

	static enabledButtonsAfterIndexingFinished(html, enableGenerateEncounterButton = true)
	{
		html.find('button.toolbar-button').each(function ()
		{
			$(this).prop('disabled', false).removeClass('disabled');
		});

		if (enableGenerateEncounterButton)
		{
			const generateEncounterButton = html.find('button#generate-remote-encounters-button');
			generateEncounterButton.prop('disabled', false).removeClass('disabled');
			generateEncounterButton[0].innerHTML = `<i class="fas fa-dice"></i> Generate Encounters`;
		}
	}
}
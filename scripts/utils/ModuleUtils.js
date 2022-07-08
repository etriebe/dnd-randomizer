class ModuleUtils {
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

		html.find('button#clear-encounters-button').on('click', function (event)
		{
			event.preventDefault();
			// html.find('input#search-box').val('').trigger('change');
		});
    };
}
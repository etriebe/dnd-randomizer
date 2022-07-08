class SFCreatureCodex extends FormApplication
{
	constructor()
	{
		super();
	}

	static get defaultOptions()
	{
		let dialogTemplate = `modules/dnd-randomizer/templates/creatureCodex.hbs`;
		return {
			...super.defaultOptions,
			title: game.i18n.localize('SF.dialog.title'),
			id: "SFCreatureCodex",
			template: dialogTemplate,
			resizable: true,
			width: window.innerWidth > 700 ? 700 : window.innerWidth - 100,
			height: window.innerHeight > 800 ? 800 : window.innerHeight - 100
		};
	}

	async activateListeners(html)
	{
		super.activateListeners(html);
	}

}

Hooks.once('ready', async () =>
{
	canvas.sfCreatureCodex = new SFCreatureCodex();
});


import { SFCONSTS } from "./main.js";
import { SFLocalHelpers } from "./localmodule.js";
import { sortable } from "./sortables.js";
import { DialogUtils } from "./utils/DialogUtils.js";

export class SFTraitsChooser extends FormApplication {
    constructor() {
        super();
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: `Stochastic, Fantastic! Choose Traits`,
            id: "SFChooser",
            template: `modules/dnd-randomizer/templates/trait.hbs`,
            resizable: true,
            width: window.innerWidth > 400 ? 400 : window.innerWidth - 100,
            height: window.innerHeight > 500 ? 500 : window.innerHeight - 100
        }
    }

    getData() {
        return {}
    }

    populateTraits() {
        const html = this.element
        let $ul = html.find('ul#trait_filter').first();

        const savedTraitSettings = game.settings.get(
            SFCONSTS.MODULE_NAME,
            "traitsToCreateEncountersFor"
        );
        const savedTraitSelectionTypeSettings = game.settings.get(
            SFCONSTS.MODULE_NAME,
            "traitsSelectionType"
        );

        let totalCount = 0;
        const traits = Object.keys(SFLocalHelpers.creatureTraitCount);
        for (let trait of traits) {
            const el = savedTraitSettings.find(i => Object.keys(i)[0] === trait);
            let monsterCount = parseInt(SFLocalHelpers.creatureTraitCount[trait]);

            let monsterCountText = "";
            if (Number.isInteger(monsterCount)) {
                monsterCountText = ` - ${monsterCount} creatures`;
                totalCount += monsterCount;
            }

            let currentTraitCasedCorrect = trait.charAt(0).toUpperCase() + trait.slice(1);
            $ul.append(`
            <li class="traitLi">
                <input type="checkbox" name="${trait}" ${!el || el[trait] ? "checked" : ""}>
                <span class="trait-type">${currentTraitCasedCorrect}${monsterCountText}</span>
            </li>`)
        }

        let dialogTitle = html.find('h3#trait-title').first();
        dialogTitle[0].innerText = `Filter Traits (${totalCount} creatures)`;
        if (savedTraitSelectionTypeSettings) {
            document.getElementById('selectionTypeOR').checked = true;
        }
        else {
            document.getElementById('selectionTypeAND').checked = true;
        }

        sortable('#SFCompendiumSorter .sortable-compendiums', {
            forcePlaceholderSize: true
        });
    }

    async activateListeners(html) {
        this.populateTraits();
        DialogUtils.activateCheckAllListeners(html, this.element, 'ul#trait_filter', 'li.traitLi');
    }

    async close(options) {
        await this.saveTraitsSetting();
        // Default Close
        return await super.close(options);
    }

    async saveTraitsSetting() {
        const html = this.element;
        let $ul = html.find('ul#trait_filter').first();
        let traitsSettings = [];

        $ul.find('li.traitLi').each((index, item) => {
            let $element = $(item).find('input');
            let setting = {};
            setting[$element.attr('name')] = $element.is(':checked');

            traitsSettings.push(setting);
        });

        let selectionType;
        if (document.getElementById('selectionTypeOR').checked) {
            selectionType = 1;
        }
        else {
            selectionType = 0;
        }

        await game.settings.set(SFCONSTS.MODULE_NAME, 'traitsToCreateEncountersFor', traitsSettings);
        await game.settings.set(SFCONSTS.MODULE_NAME, 'traitsSelectionType', selectionType);
    }
}
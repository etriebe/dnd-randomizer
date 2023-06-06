# Stochastic, Fantastic!

Support this project [here](https://ko-fi.com/thetreat).

![Latest Release Download Count](https://img.shields.io/github/downloads/theripper93/dnd-randomizer/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fdnd-randomizer&colorB=03ff1c&style=for-the-badge)](https://forge-vtt.com/bazaar#package=dnd-randomizer) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fetriebe%2Fdnd-randomizer%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

How to use:

Click the Generate Encounter in the actor sidebar to bring up the window
![image](images/create-encounter.gif)

What do the buttons do?

1. Encounter Type: This will choose from a number of formulaeic encounter types, based on monster challenge rating/XP. For example:
   1. Single BBEG: One Big Bad Evil Guy/Gal using the *entire* encounter budget
   2. BBEG + 2 Minions: One BBEG and two of the same minions 1/3rd of their CR
   3. 2 Semi-BBEG: Two of the same type of BBEG
   4. BBEG + Monster horde: One BBEG and 5 of the same monsters ~1/10th of the BBEG's CR
   5. BBEG + Random monster horde: One BBEG and 5 different monsters ~1/10th of the BBEG's CR
   6. Monster horde: 6 of the same monster
   7. Random monster horde: 6 equal CR monsters
   8. Random: Completely random algorithm which does the following
      1. Choose a monster that is within some range of acceptable CR for this encounter
      2. Choose a quantity of this monster that is within our encounter budget
      3. Add this monster
      4. Repeat steps 1-3 until we get close enough to our encounter budget
   9. Note: If you have other encounter formula types to add, let me know! They are super cheap and easy to add (One line of code!)
2. Generate Encounters: Does what it says! This will index your local compendiums you have selected and use them to create encounters! This should run in ~5-20 seconds, depending on the speed of your computer and size of your compendiums.
3. You encounters will appear, from here you can do the following:
   1. Use the star icon to save the encounter for later
   2. Use the Double Arrow icon (on the right) to spawn the encounter
   3. Use the Toolbox icon (under the Double Arrow icon) to generate a loot sheet (Item Piles is highly raccomanded for this to look better)
   4. Drag n Drop any monster to the scene to spawn them or drag n drop any item to an actor to add it to them
   5. Click the two swords icon to get a combat estimate for this encounter
4. Filter Buttons: These buttons will all have similar functionality for allowing you to filter the types of these items for use in encounter generation.
   1. Treasure Type: Types of loot rarity do we include in the treasure listed? (Note: Only PF2e for the moment)
   2. Creature Type: Types of creatures we include in our list of encounters to generate
   3. Environment: Types of environments to choose creatures from. If Any is chosen, this means monsters that either had "Any" listed in their environment list or monsters that had *no* environment selected.
   4. Players: The players to choose for identifying encounter CR/XP budgets.
   5. Compendium: The compendiums to choose monsters/items from for all of the above. 
![image](images/filter.gif)

Additionally you can use the searchbar on top to search for encounter name\creatures\items on the left of the searchbox you will find the filter for favorite only and on the right of the searchbox the funnel icon will bring up the compendium configuration window: in this window you can sort and enable\disable compendiums the module will pull from. (Note: This may not work as expected currently. [Issue #52](https://github.com/etriebe/dnd-randomizer/issues/52))

# Combat Estimate

We will either take the monsters and players listed in the combat dialog *or* the monsters in the encounter selected and the players from the player filter dialog and attempt to choose the optimal actions for damage in their list of possible actions. We will use AC, Saving Throw modifiers of the enemies of the current combatant to identify *how* likely an attack is to hit, in addition to calculating the average and expected damage. This can be especially useful for determining difficulty in campaigns with magical items. 

![image](images/combat-estimate.gif)


# Creature Codex

A creature codex to browse the creatures you have in multiple compendiums and sort, filter by more than just name: XP, creature type, environment, etc. 

![image](https://user-images.githubusercontent.com/7503160/183776978-a56a1a0e-04c4-489c-98ce-950d0069e93c.png)

# License / Credits

## Sortable.Js

More info here https://github.com/SortableJS/Sortable

## Fuzzyset.js

This package is licensed under the Prosperity Public License 3.0.

That means that this package is free to use for non-commercial projects

See https://github.com/Glench/fuzzyset.js for more details

## Stochastic, Fantastic! is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

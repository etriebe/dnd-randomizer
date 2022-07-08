import { CreatureSpawner } from "./spawner";

export const SFCONSTS = {
    MODULE_NAME: "dnd-randomizer",
    GEN_OPT: {
        loot_type: ["individual treasure", "Treasure Horde"],
        numberOfPlayers: Number,//[1 - 13]
        averageLevelOfPlayers: Number,//[1 - 20]
        environment: [
          "Any",
          "Arctic",
          "Coastal",
          "Desert",
          "Forest",
          "Grassland",
          "Hill",
          "Jungle",
          "Mountain",
          "Underdark",
          "Swamp",
          "Underwater",
          "Urban",
          "Celestial",
          "Abyssal",
          "Infernal",
          "Air Elemental",
          "Earth Elemental",
          "Fire Elemental",
          "Water Elemental"
        ],
      },
    LOOT_ICONS: [
        "systems/dnd5e/icons/items/inventory/pouch-sealed.jpg",
        "systems/dnd5e/icons/items/inventory/satchel.jpg",
        "systems/dnd5e/icons/items/inventory/briefcase.jpg"
    ],
    DIFFICULTY:
    {
        "easy": 1,
        "medium": 2,
        "hard": 3,
        "deadly": 4,
    },
    SPELLCOST: [
        50,
        100,
        250,
        500,
        750,
        1500,
        5000,
        15000,
        25000,
        50000,
    ]
}

async function spawnTest(name,number){
    let encounterData = await new Encounter([{name: name, number: number}]).validate().prepareData();
    Hooks.once("createMeasuredTemplate", async (template) => {
        await CreatureSpawner.fromTemplate(template.object, encounterData);
        template.object.delete()
    })
}

async function dataTest(){
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
}

async function fetchTest(){
    return await fetch('https://theripper93.com/encounterData.php?loot_type=Treasure+Hoard').then(response => response.json()).then(data => data);
}
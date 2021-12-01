const SFCONSTS = {
    MODULE_NAME: "dnd-randomizer",
    GEN_OPT: {
        loot_type: ["individual treasure", "treasure hoard"],
        numberOfPlayers: Number,//[1 - 13]
        averageLevelOfPlayers: Number,//[1 - 20]
        environment: [
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
    ],
    ENCOUNTER_DIFFICULTY_XP_TABLES: {
        "easy": [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
        'medium': [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
        'hard': [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
        'deadly': [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700],
    },
    ENCOUNTER_MONSTER_MULTIPLIERS: {
        "0": 0,
        "1": 1,
        "2": 1.5,
        "3": 2,
        "7": 2.5,
        "11": 3,
        "15": 4,
    },
    ENCOUNTER_XP_CHALLENGE_RATING_MAPPING: {
        "0"     :    10,
        ".125"  :    25,
        ".25"   :    50,
        ".5"    :    100,
        "1"     :    200,
        "2"     :    450,
        "3"     :    700,
        "4"     :    1100,
        "5"     :    1800,
        "6"     :    2300,
        "7"     :    2900,
        "8"     :    3900,
        "9"     :    5000,
        "10"    :    5900,
        "11"    :    7200,
        "12"    :    8400,
        "13"    :    10000,
        "14"    :    11500,
        "15"    :    13000,
        "16"    :    15000,
        "17"    :    18000,
        "18"    :    20000,
        "19"    :    22000,
        "20"    :    25000,
        "21"    :    33000,
        "22"    :    41000,
        "23"    :    50000,
        "24"    :    62000,
        "25"    :    75000,
        "26"    :    90000,
        "27"    :    105000,
        "28"    :    120000,
        "29"    :    135000,
        "30"    :    155000,
    }
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
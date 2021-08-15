const SFCONSTS = {
    MODULE_NAME: "dnd-randomizer",
    GEN_OPT: {
        loot_type: ["individual treasure", "treasure hoard"],
        numberOfPlayers: Number,//[1 - 13]
        averageLevelOfPlayers: Number,//[1 - 20]
        environment: [
          "arctic",
          "coastal",
          "desert",
          "forest",
          "grassland",
          "hill",
          "jungle",
          "mountain",
          "underdark",
          "swamp",
          "underwater",
          "urban",
          "celestial",
          "abyssal",
          "infernal",
          "air_elemental",
          "earth_elemental",
          "fire_elemental",
          "water_elemental",
        ],
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
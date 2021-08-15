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
    }

    return encounters
}

async function fetchTest(){
    return await fetch('https://talacatt.com/encounterData.php?loot_type=Treasure+Hoard').then(response => response.json()).then(data => data);
}
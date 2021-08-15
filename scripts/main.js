async function spawnTest(name,number){
    let encounterData = await new Encounter([{name: name, number: number}]).validate().prepareData();
    Hooks.once("createMeasuredTemplate", async (template) => {
        await CreatureSpawner.fromTemplate(template.object, encounterData);
        template.object.delete()
    })
}

function dataTest(){
    console.log(RandomGeneratorParser.parseToEncounters(sampleDataset))
}
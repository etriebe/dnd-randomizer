import { Propagator } from "./propagator.js";
import { ActorUtils } from "./utils/ActorUtils.js";
import { FoundryUtils } from "./utils/FoundryUtils.js";

export class CreatureSpawner {
  static async fromTemplate(template, encounterData) {
    const templateDataObject = FoundryUtils.getTemplateDataObject(template);
    switch (templateDataObject.t) {
      case "circle":
        for (let creature of encounterData.creatures) {
          for (let i = 0; i < creature.quantity; i++) {
            await CreatureSpawner.wait(100);
            const tD = await ActorUtils.getTokenDocument(creature._actor);
            const position = Propagator.getFreePosition(
              tD,
              CreatureSpawner.randomInCircle(
                {x:templateDataObject.x,y:templateDataObject.y},
                (templateDataObject.distance * canvas.dimensions.size) /
                  canvas.dimensions.distance
              )
            );
            const tokenData = await ActorUtils.getTokenDocument(creature._actor, {
              x: position.x,
              y: position.y,
            });
            await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
          }
        }

        let lootActor =  await game.actors.get(encounterData.lootActorId)
        const tD = await ActorUtils.getTokenDocument(lootActor);
        const position = Propagator.getFreePosition(
          tD,
          CreatureSpawner.randomInCircle(
            {x:templateDataObject.x,y:templateDataObject.y},
            (templateDataObject.distance * canvas.dimensions.size) /
            canvas.dimensions.distance
          )
        );

        const tokenData = await ActorUtils.getTokenDocument(lootActor, {
          x: position.x,
          y: position.y,
        });
        tokenData.actorLink = true;
        let lootToken = await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
        await CreatureSpawner.createItemPiles(lootToken[0]);
    }
  }

  static async createItemPiles(lootToken) {
    let isItemPilesInstalled = game.modules.get("item-piles");
    if (!isItemPilesInstalled)
    {
      return;
    }

    let itemPilesIsActive = isItemPilesInstalled.active;

    if (!itemPilesIsActive)
    {
      return;
    }

    // let currentScene = game.scenes.find(s => s.id === canvas.id);
    // let lootTokenOnScene = currentScene.tokens.find(t => t.id === lootToken.id);
    await ItemPiles.API.turnTokensIntoItemPiles([lootToken]);
  }

  //generate a random point in a circle given a center point and a radius
  static randomInCircle(center, oradius, collision = true) {
    let attemptNumber = 0;
    let x,y,radius;
    do{
      attemptNumber++;
      let angle = Math.random() * Math.PI * 2;
      radius = Math.random() * oradius;
      x = Math.cos(angle) * radius + center.x;
      y = Math.sin(angle) * radius + center.y;
    }
    while (!collision || (canvas.walls.checkCollision(new Ray(center,{x:x,y:y}), { type: 'move' }) && attemptNumber < 100))

    return { x: x, y: y };
  }
  //wait for a specific amount of time before returning a promise
  static wait(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
}
}
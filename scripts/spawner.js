class CreatureSpawner {
  static async fromTemplate(template, encounterData) {
    switch (template.data.t) {
      case "circle":
        for (let creature of encounterData.creatures) {
          for (let i = 0; i < creature.number; i++) {
            await CreatureSpawner.wait(100);
            const tD = await creature.actor.getTokenData();
            const position = Propagator.getFreePosition(
              tD,
              CreatureSpawner.randomInCircle(
                template.center,
                (template.data.distance * canvas.dimensions.size) /
                  canvas.dimensions.distance
              )
            );
            const tokenData = await creature.actor.getTokenData({
              x: position.x,
              y: position.y,
            });
            await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
          }
        }
    }
  }
  //generate a random point in a circle given a center point and a radius
  static randomInCircle(center, oradius, collision = true) {
    
    let x,y,radius;
    do{let angle = Math.random() * Math.PI * 2;
    radius = Math.random() * oradius;
    x = Math.cos(angle) * radius + center.x;
    y = Math.sin(angle) * radius + center.y;}while(!collision || canvas.walls.checkCollision(new Ray(center,{x:x,y:y})))
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
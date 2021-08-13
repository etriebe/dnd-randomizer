class CreatureSpawner {
  static async fromTemplate(template, encounterData) {
    switch (template.data.t) {
      case "circle":
        for (let creature of encounterData.creatures) {
          for (let i = 0; i < creature.number; i++) {
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
  static randomInCircle(center, radius) {
    let angle = Math.random() * Math.PI * 2;
    radius = Math.random() * radius;
    let x = Math.cos(angle) * radius + center.x;
    let y = Math.sin(angle) * radius + center.y;
    return { x: x, y: y };
  }
}

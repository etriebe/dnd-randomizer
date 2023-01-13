export class Propagator {
  // Find a non occupied cell in the grid that matches the size of the token given an origin
  static getFreePosition(
    tokenData,
    origin,
    collision = true,
    alreadyOccupied = []
  ) {
    const center = canvas.grid.getCenter(origin.x, origin.y);
    origin = { x: center[0], y: center[1] };
    const positions = Propagator.generatePositions(origin);
    for (let position of positions) {
      if (
        Propagator.canFit(
          tokenData,
          position,
          positions[0],
          collision,
          alreadyOccupied
        )
      ) {
        return position;
      }
    }
  }
  //Find non occupied cells for multiple tokens at a time
  static getFreePositionMany(
    tokenData,
    origin,
    collision = true,
    alreadyOccupied = []
  ) {
    let freepositions = [];
    const gs = canvas.dimensions.size;
    for (let td of tokenData) {
      const position = Propagator.getFreePosition(
        td,
        origin,
        collision,
        alreadyOccupied
      );
      if (position) {
        freepositions.push({ data: td, position: position });
        const occupied = new PIXI.PIXI.Rectangle(
          position.x,
          position.y,
          td.width * gs,
          td.height * gs
        );
        alreadyOccupied.push(occupied);
      }
    }
    return freepositions;
  }
  //generate positions radiantially from the origin
  static generatePositions(origin) {
    let positions = [
      canvas.grid.getSnappedPosition(origin.x - 1, origin.y - 1),
    ];
    for (
      let r = canvas.scene.dimensions.size;
      r < canvas.scene.dimensions.size * 10;
      r += canvas.scene.dimensions.size
    ) {
      for (
        let theta = 0;
        theta < 2 * Math.PI;
        theta += Math.PI / ((4 * r) / canvas.scene.dimensions.size)
      ) {
        const newPos = canvas.grid.getTopLeft(
          origin.x + r * Math.cos(theta),
          origin.y + r * Math.sin(theta)
        );
        positions.push({ x: newPos[0], y: newPos[1] });
      }
    }
    return positions;
  }
  //check if a position is free
  static isFree(position, alreadyOccupied) {
    for (let token of canvas.tokens.placeables) {
      const hitBox = new PIXI.Rectangle(token.x, token.y, token.w, token.h);
      if (hitBox.contains(position.x, position.y)) {
        return false;
      }
    }
    for (let prevOc of alreadyOccupied) {
      if (prevOc.contains(position.x, position.y)) {
        return false;
      }
    }
    return true;
  }
  //check if a token can fit in a position
  static canFit(tokenData, position, origin, collision, alreadyOccupied) {
    for (let i = 0; i < tokenData.width; i++) {
      for (let j = 0; j < tokenData.height; j++) {
        const x = position.x + j * canvas.scene.dimensions.size;
        const y = position.y + i * canvas.scene.dimensions.size;
        if (!Propagator.isFree({ x, y }, alreadyOccupied)) {
          return false;
        }
      }
    }
    const r = new Ray(origin, {
      x: position.x + (tokenData.width * canvas.scene.dimensions.size) / 2,
      y: position.y + (tokenData.height * canvas.scene.dimensions.size) / 2,
    });
    const collisionCheck = canvas.walls.checkCollision(r, { mode: 'any', type: 'move' });
    return (!collision || !collisionCheck);
  }
}
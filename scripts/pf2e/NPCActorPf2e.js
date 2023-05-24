import { ActorUtils } from "../utils/ActorUtils.js";
import { FoundryUtils } from "../utils/FoundryUtils.js";
export class NPCActorPf2e {
    constructor(data) {
      this.actor = data;
      this.actorname = this.actor.name;
      this.actorid = this.actor._id;
      this.compendiumname = this.actor.pack;
      this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
      this.environment = ActorUtils.getActorEnvironments(this.actor);
      this.combatdata = this.getCombatDataPerRound();
    }

    getCombatDataPerRound()
    {
      return [];
    }
}
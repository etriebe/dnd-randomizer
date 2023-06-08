import { ActorUtils } from "../utils/ActorUtils.js";
import { FoundryUtils } from "../utils/FoundryUtils.js";
export class NPCActorPf2e {
    constructor(data, compendiumname) {
      this.actor = data;
      this.actorname = this.actor.name;
      this.actorid = this.actor._id ?? this.actor.id;
      this.compendiumname = compendiumname;
      this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
      this.environment = ActorUtils.getActorEnvironments(this.actor);
      this.combatdata = this.getCombatDataPerRound();
    }

    async analyzeActor()
    {
      this.actorObject = await ActorUtils.getActorFromActorIdCompendiumName(this.actorid, this.compendiumname);
    }

    getCombatDataPerRound()
    {
      return [];
    }
}
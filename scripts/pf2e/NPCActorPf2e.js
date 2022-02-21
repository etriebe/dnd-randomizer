class NPCActorPf2e {
    constructor(data) {
      this.actor = data;
      this.actorname = this.actor.data.name;
      this.actorid = this.actor.data._id;
      this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
      this.environment = ActorUtils.getActorEnvironments(this.actor);
      this.combatdata = this.getCombatDataPerRound();
    }

    getActorEnvironments()
    {
      let environment = this.actor.data.data.details.environment;
      if (!environment || environment.trim() === "")
      {
        environment = "Any";
      }

      let environmentArray = environment.split(",");
      environmentArray = environmentArray.map(e => e.trim());
      return environmentArray;
    }

    getCombatDataPerRound()
    {
      return [];
    }
}
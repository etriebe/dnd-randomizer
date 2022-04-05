class NPCActorPf2e {
    constructor(data) {
      this.actor = data;
      this.actorname = FoundryUtils.getDataObjectFromObject(this.actor).name;
      this.actorid = FoundryUtils.getDataObjectFromObject(this.actor)._id;
      this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
      this.environment = ActorUtils.getActorEnvironments(this.actor);
      this.combatdata = this.getCombatDataPerRound();
    }

    getActorEnvironments()
    {
      let environment = FoundryUtils.getDataObjectFromObject(this.actor).details.environment;
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
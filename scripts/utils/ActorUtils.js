class ActorUtils
{
    static getCreatureTypeForActor(actor)
    {
      return FoundryUtils.getSystemVariableForObject(actor, "CreatureType");
    }
    
    static getLevelKeyForSpell(spell)
    {
      let spellLevel = FoundryUtils.getSystemVariableForObject(spell, "SpellLevel").toString().toLowerCase();

      let fullSpellNameMatch = spellLevel.match(/(?<fullSpellDescription>(?<spellLevel>\d+)(st|nd|rd|th) level|cantrip)/g);

      if (fullSpellNameMatch)
      {
        return spellLevel;
      }

      switch (spellLevel)
      {
        case "1":
          return "1st level";
        case "2":
          return "2nd level";
        case "3":
          return "3rd level";
        default:
          return `${spellLevel}th level`
      }
    }

    static getActorObject(actor)
    {
      let currentSystem = game.system.id;

      if (currentSystem === "dnd5e")
      {
        return new PCActor5e(actor);
      }
      else
      {
        throw new Error("Not yet implemented!");
      }
    }

    static getActorId(actor)
    {
      if (actor.id)
      {
        return actor.id;
      }
      else
      {
        return actor._id;
      }
    }
}
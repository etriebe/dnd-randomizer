class PCActor5e {
    static numberRegex = /\b(?<numberOfAttacks>one|two|three|four|five|six|seven|eight|nine|ten|once|twice|thrice|1|2|3|4|5|6|7|8|9)\b/gm;
    constructor(data) {
      this.actor = data;
      this.actorname = this.actor.data.name;
      this.actorid = this.actor.data._id;
      this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
      this.environment = ActorUtils.getActorEnvironments();
      this.combatdata = this.getCombatDataPerRound();
      this.classes = this.actor.classes;
      this.level = this.getPlayerClassLevel();
      this.playerclasslist = this.getPlayerClassList();
    }
  
    getPlayerClassLevel()
    {
      let playerClasses = this.classes;
      let playerClassList = this.getPlayerClassList(player);
      let totalLevelCount = 0;
      for (let i = 0; i < playerClassList.length; i++)
      {
        let currentClassLevel = playerClasses[playerClassList[i]].data.data.levels;
        totalLevelCount += currentClassLevel;
      }
      return totalLevelCount;
    }

    getPlayerClassList()
    {
      let playerClassList = Object.keys(this.classes);
      return playerClassList;
    }

    getCombatDataPerRound()
    {
      let allAttackResultObjects = [];
      return allAttackResultObjects;
    }

    static getActorTraits(actor)
    {
      let characterTraits = {};

      if (actor.data.data.traits.ci.value.length > 0)
      {
        characterTraits["conditionimmunities"] = actor.data.data.traits.ci.value;
      }
      if (actor.data.data.traits.di.value.length > 0)
      {
        characterTraits["damageimmunities"] = actor.data.data.traits.di.value;
      }
      if (actor.data.data.traits.dr.value.length > 0)
      {
        characterTraits["damageresistances"] = actor.data.data.traits.dr.value;
      }
      if (actor.data.data.traits.dv.value.length > 0)
      {
        characterTraits["damagevulnerabilities"] = actor.data.data.traits.dv.value;
      }

      let actorSpells = actor.data.data.spells;
      let maxSpellLevel = 0;
      for (let i = 1; i <= 9; i++)
      {
        let currentSpellLevelObject = eval("actorsSpells.spell" + i);
        if (currentSpellLevelObject.max > 0)
        {
          characterTraits["spellcaster"] = true;
          maxSpellLevel = i;
        }
      }

      // deal with pact magic
      if (actorSpells.pact.max > 0)
      {
        characterTraits["spellcaster"] = true;
        let pactLevel = actorSpells.pact.level;
        if (maxSpellLevel > pactLevel)
        {
          maxSpellLevel = pactLevel;
        }
      }
      if (maxSpellLevel > 0)
      {
        characterTraits["maxspelllevel"] = maxSpellLevel;
        characterTraits["spelldamagetypelist"] = spellList.map(s => s.data.data.damage.parts).filter(p => p.length > 0).map(z=> z[0][1]).filter(t => t != "");
      }

      if (actor.data.data.resources.lair.value)
      {
        characterTraits["lairactions"] = true;
      }

      if (actor.data.data.resources.legact.max > 0)
      {
        characterTraits["legendaryactions"] = true;
      }

      if (actor.data.data.resources.legres.max > 0)
      {
        characterTraits["legendaryresistances"] = true;
      }

      let spellList = actor.items.filter(i => i.type === "spell");
      if (spellList.filter(s => s.hasAreaTarget && s.hasDamage && s.name.toLowerCase() != "sleep").length > 0)
      {
        characterTraits["hasAOESpell"] = true;
      }
    }
}
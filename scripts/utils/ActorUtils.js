import { FoundryUtils } from "./FoundryUtils.js";
import { PCActorPf2e } from "../pf2e/PCActorPf2e.js";
import { NPCActorPf2e } from "../pf2e/NPCActorPf2e.js";
import { NPCActor5e } from "../dnd5e/NPCActor5e.js";
import { PCActor5e } from "../dnd5e/PCActor5e.js";
import { SFLOCALCONSTS } from "../localconst.js";

export class ActorUtils
{
    static getCreatureTypeForActor(actor)
    {
      let creatureTypeValue = FoundryUtils.getSystemVariableForObject(actor, "CreatureType");
      if (creatureTypeValue === '')
      {
        creatureTypeValue = 'other';
      }

      return creatureTypeValue;
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
        return new NPCActor5e(actor);
      }
      else if (currentSystem === "pf2e")
      {
        return new NPCActorPf2e(actor);
      }
      else
      {
        throw new Error("Not yet implemented!");
      }
    }

    static getPCActorObject(actor)
    {
      let currentSystem = game.system.id;

      if (currentSystem === "dnd5e")
      {
        return new PCActor5e(actor);
      }
      else if (currentSystem === "pf2e")
      {
        return new PCActorPf2e(actor);
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

    static getActorEnvironments(actor) {
        let environment = FoundryUtils.getDataObjectFromObject(actor).details.environment;
        if (!environment || environment.trim() === "") {
            environment = "Any";
        }

        let environmentArray = environment.split(",");
        let extraEnvironmentMapping = SFLOCALCONSTS.TOME_OF_BEASTS_CREATURE_ENVIRONMENT_MAPPING[actor.actorname];
        if (extraEnvironmentMapping)
        {
          environmentArray = environmentArray.concat(extraEnvironmentMapping);
        }
        environmentArray = environmentArray.map(e => e.trim());
        return environmentArray;
    }

    static getActorItemList(actor)
    {
      let itemList = [];
      actor.items.map(i => itemList.push(i.name));
      return itemList;
    }

    static getActorItemDescriptionList(actor)
    {
      let descriptionList = [];
      actor.items.map(i => descriptionList.push(FoundryUtils.getDataObjectFromObject(i).description.value));
      return descriptionList;
    }

    static getActorBiography(actor)
    {
      return FoundryUtils.getDataObjectFromObject(actor).details.biography.value;
    }

    static getActualActorObject(currentMonster)
    {
      return currentMonster.actor.actor ?? currentMonster.actor;
    }

    static async getTokenDocument(actor, data)
    {
      if (FoundryUtils.isFoundryVersion10())
      {
        return await actor.getTokenDocument(data)
      }
      else
      {
        return await actor.getTokenData(data);
      }
    }
}
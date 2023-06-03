import { FoundryUtils } from "./FoundryUtils.js";
import { PCActorPf2e } from "../pf2e/PCActorPf2e.js";
import { NPCActorPf2e } from "../pf2e/NPCActorPf2e.js";
import { NPCActor5e } from "../dnd5e/NPCActor5e.js";
import { PCActor5e } from "../dnd5e/PCActor5e.js";
import { SFLOCALCONSTS } from "../localconst.js";
import { GeneralUtils } from "./GeneralUtils.js";

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

  static async getActorObjectFromActorIdCompendiumName(actorId, compendiumName)
  {
    let actor = await ActorUtils.getActorFromActorIdCompendiumName(actorId, compendiumName);
    return ActorUtils.getActorObject(actor, compendiumName);
  }

  static async getActorFromActorIdCompendiumName(actorId, compendiumName)
  {
    let compendium = game.packs.find(p => p.collection === compendiumName);
    let actor = null;
    if (compendium)
    {
      actor = await compendium.getDocument(actorId);
    }

    else
    {
      actor = game.actors.find(a => a.id === actorId);
    }
    return actor;
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
        return `${spellLevel}th level`;
    }
  }

  static getActorObject(actor, compendiumname)
  {
    let currentSystem = game.system.id;

    if (currentSystem === "dnd5e")
    {
      return new NPCActor5e(actor, compendiumname);
    }
    else if (currentSystem === "pf2e")
    {
      return new NPCActorPf2e(actor, compendiumname);
    }
    else
    {
      throw new Error("Not yet implemented!");
    }
  }

  static getPCTokenObject(token)
  {
    let currentSystem = game.system.id;

    if (currentSystem === "dnd5e")
    {
      let pcActor = new PCActor5e(token.actor);
      pcActor.token = token;
      return pcActor;
    }
    else if (currentSystem === "pf2e")
    {
      let pcActor = new PCActorPf2e(token.actor);
      pcActor.token = token;
      return pcActor;
    }
    else
    {
      throw new Error("Not yet implemented!");
    }
  }

  static getTokenObject(token)
  {
    let currentSystem = game.system.id;

    if (currentSystem === "dnd5e")
    {
      let npcActor = new NPCActor5e(token.actor);
      npcActor.token = token;
      return npcActor;
    }
    else if (currentSystem === "pf2e")
    {
      let npcActor = new NPCActorPf2e(token.actor);
      npcActor.token = token;
      return npcActor;
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

  static getActorEnvironments(actor)
  {
    let dataObject = FoundryUtils.getDataObjectFromObject(actor);
    let environment = dataObject.details?.environment;
    if (!environment || environment.trim() === "")
    {
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
    if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11())
    {
      return await actor.getTokenDocument(data);
    }
    else
    {
      return await actor.getTokenData(data);
    }
  }

  static getActorArmorClass(actor)
  {
    let currentDataObject = FoundryUtils.getDataObjectFromObject(actor);
    return currentDataObject.attributes.ac.value;
  }

  static getActorSavingThrowModifier(actor, savingThrowType)
  {
    let currentDataObject = FoundryUtils.getDataObjectFromObject(actor);
    return eval(`currentDataObject.abilities.${savingThrowType}.save`);
  }

  static getActorCurrentHP(actor)
  {
    let currentDataObject = FoundryUtils.getDataObjectFromObject(actor);
    return currentDataObject.attributes.hp.value;
  }

  static getCombatDataPerRound(actorObject, activationType)
  {
    let allAttackResultObjects = [];
    let actor = actorObject.actor;
    try
    {
      let attackList = actor.items.filter(i => (i.type.toLowerCase() === "weapon" || i.type.toLowerCase() === "feat") &&
        (!activationType || FoundryUtils.getDataObjectFromObject(i).activation.type === activationType) &&
        (i.hasAttack || i.hasSave) &&
        // i.hasLimitedUses &&
        i.hasDamage &&
        i.name.toLowerCase() != "multiattack" && i.name.toLowerCase() != "extra attack");

      if (attackList.length === 0)
      {
        return allAttackResultObjects;
      }

      let multiAttack = ActorUtils.getBestMultiExtraAttack(actor);
      let multiAttackResultObjects = [];
      if (multiAttack)
      {
        // Description types supported:
        // <p>The imperial ghoul makes one bite attack and one claws attack.</p>
        // <p>the dragon can use its frightful presence. it then makes three attacks: one with its bite and two with its claws.</p>'
        let multiAttackDescription = ActorUtils.getDescriptionFromItemObject(multiAttack).toLowerCase();
        multiAttackDescription = multiAttackDescription.replaceAll("instead of once", "");
        let parsedAttackList = [];
        for (let i = 0; i < attackList.length; i++)
        {
          let currentAttack = attackList[i];
          let attackName = currentAttack.name.toLowerCase();
          let sanitizedAttackName = attackName.replaceAll(/\(.+\)/gm, "").trim();
          sanitizedAttackName = sanitizedAttackName.replaceAll(/\+\d/gm, "").trim();
          sanitizedAttackName = sanitizedAttackName.replaceAll(/\)/gm, "").trim(); // currently creatures with a recharge attack have the recharge attack named incorrectly
          // skip if we've removed anything interesting from the attack name
          if (sanitizedAttackName === "")
          {
            continue;
          }
          parsedAttackList.push(sanitizedAttackName);
        }
        parsedAttackList.push("melee attack");
        let parsedAttackRegex = parsedAttackList.join("|");

        let attackMatches = [...multiAttackDescription.matchAll(`(?<attackDescription>${parsedAttackRegex})`)];
        let numberMatches = [...multiAttackDescription.matchAll(ActorUtils.numberRegex)];
        let orMatches = [...multiAttackDescription.matchAll(`(?<qualifiers>( or | and\/or ))`)];

        let previousAttackIndex = -1;
        for (let i = 0; i < attackMatches.length; i++)
        {
          let currentAttackMatch = attackMatches[i];
          let attackObject = attackList.find(a => a.name.toLowerCase().match(currentAttackMatch[0]));
          if (!attackObject || currentAttackMatch[0] === "melee attack")
          {
            attackObject = attackList.find(a => a.type === "weapon");
          }
          let currentAttackIndex = currentAttackMatch.index;
          let numberMatchesBeforeAttack = numberMatches.filter(n => n.index < currentAttackIndex);
          let correctNumberMatch = numberMatchesBeforeAttack[numberMatchesBeforeAttack.length - 1];
          let actualNumberOfAttacks = 1;
          if (correctNumberMatch)
          {
            actualNumberOfAttacks = GeneralUtils.getIntegerFromWordNumber(correctNumberMatch[0]);
          }

          if (!actualNumberOfAttacks)
          {
            console.warn(`Unable to parse number of attacks for multi attack for ${actorObject.actorname}, ${actorObject.actorid}, Multiattack Description: ${multiAttackDescription}`);
          }

          let currentAttackObject = ActorUtils.getInfoForAttackObject(attackObject, actualNumberOfAttacks, actorObject);

          if (!currentAttackObject || currentAttackObject.averagedamage === 0)
          {
            // Skip because attack is boring and likely is some type of charm feature. 
            continue;
          }

          if (previousAttackIndex != -1)
          {
            let previousAttackObject = multiAttackResultObjects.pop();

            // Check to see if an or is between the previous attack object and the current
            let orMatchesBetweenAttacks = orMatches.filter(o => o.index > previousAttackIndex && o.index < currentAttackIndex);
            if (orMatchesBetweenAttacks.length > 0)
            {
              // decide which object is better and push that one.
              if ((ActorUtils.getTotalDamageForAttackObject(currentAttackObject)) >
                (ActorUtils.getTotalDamageForAttackObject(previousAttackObject)))
              {
                multiAttackResultObjects.push(currentAttackObject);
              }
              else
              {
                multiAttackResultObjects.push(previousAttackObject);
              }
            }
            else
            {
              multiAttackResultObjects.push(previousAttackObject);
              multiAttackResultObjects.push(currentAttackObject);
            }
          }
          else
          {
            multiAttackResultObjects.push(currentAttackObject);
            // console.log(`Adding attack ${attackObject.name} for ${actor.name}`);
          }
          previousAttackIndex = currentAttackIndex;
        }

        if (multiAttackResultObjects.length === 0)
        {
          let guessedAttack = ActorUtils.guessActorMultiAttack(attackList, multiAttackDescription, actorObject);
          if (guessedAttack)
          {
            console.log(`Attempted to guess attack for ${actor.name}: ${guessedAttack.numberofattacks} ${guessedAttack.attackdescription} attacks.`);
            multiAttackResultObjects.push(guessedAttack);
          }
        }
      }

      let bestAttackObject = ActorUtils.getBestSingleAttack(attackList, actorObject);
      if (!bestAttackObject && multiAttackResultObjects.length == 0)
      {
        return allAttackResultObjects;
      }
      let currentAttackObject = ActorUtils.getInfoForAttackObject(bestAttackObject, 1, actorObject);
      if (bestAttackObject)
      {
        let totalPossibleMultiAttackDamage = 0;
        for (let i = 0; i < multiAttackResultObjects.length; i++)
        {
          const currentMultiAttack = multiAttackResultObjects[i];
          totalPossibleMultiAttackDamage += currentMultiAttack.averagedamage * currentMultiAttack.numberofattacks;
        }

        let totalBestAttackDamage = currentAttackObject.averagedamage * currentAttackObject.numberofattacks;
        if (currentAttackObject.hasareaofeffect)
        {
          totalBestAttackDamage = totalBestAttackDamage * 2;
        }

        if (totalBestAttackDamage > totalPossibleMultiAttackDamage)
        {
          if (currentAttackObject.attackobject.system.recharge?.value)
          {
            currentAttackObject["chancetouseattack"] = ((6 - currentAttackObject.attackobject.system.recharge.value) + 1) / 6;
            allAttackResultObjects.push(currentAttackObject);

            for (let i = 0; i < multiAttackResultObjects.length; i++)
            {
              const currentMultiAttack = multiAttackResultObjects[i];
              currentMultiAttack["chancetouseattack"] = 1 - (((6 - currentAttackObject.attackobject.system.recharge.value) + 1) / 6);
              allAttackResultObjects.push(currentMultiAttack);
            }

            return allAttackResultObjects;
          }

          allAttackResultObjects.push(currentAttackObject);
          return allAttackResultObjects;
        }
        else
        {
          return multiAttackResultObjects;
        }
      }

      if (allAttackResultObjects.length === 0)
      {
        console.warn(`Parsed no attack data for actor: ${actor.name}`);
      }
    }
    catch (error)
    {
      console.warn(`Error parsing attack information for ${actor.name}, ${actor.id}.`);
      console.warn(error.stack);
    }
    return allAttackResultObjects;
  }

  static getLegendaryActions(actorObject)
  {
    let actor = actorObject.actor;
    let actorDataObject = FoundryUtils.getDataObjectFromObject(actor);
    if (!actorDataObject.resources.legact || actorDataObject.resources.legact.max === 0)
    {
      return null;
    }

    let legendaryActionsMax = actorDataObject.resources.legact.max;
    let legendaryActionsToChooseFrom = actor.items.filter(i => FoundryUtils.getDataObjectFromObject(i).activation.type === "legendary");

    let legendaryActionList = [];
    for (let i = 0; i < legendaryActionsToChooseFrom.length; i++)
    {
      let currentAction = legendaryActionsToChooseFrom[i];
      let currentActionDataObject = FoundryUtils.getDataObjectFromObject(currentAction);
      let legedaryActionCost = currentActionDataObject.activation.cost;
      let isSpell = false;

      let currentAttackObject = null;
      if (currentAction.name.match(/cantrip/i))
      {
        isSpell = true;
        let activationType = null;
        let spellLevelLimit = 0; // 0 is cantrip
        let bestSpellResult = ActorUtils.getSpellDataPerRound(actorObject, activationType, spellLevelLimit);
        if (bestSpellResult.length === 0)
        {
          console.warn(`Unable to find a good cantrip legendary action for ${actorObject.actorname}.`);
        }

        currentAttackObject = bestSpellResult[0];
        currentAction = currentAttackObject.attackobject;
      }
      else
      {
        currentAttackObject = ActorUtils.getInfoForAttackObject(currentAction, 1, actorObject);
      }

      let pseudoAreaTarget = ActorUtils.getIfAttackAffectsMultipleCreatures(currentAction);
      let pseudoAreaTargetCount = null;

      let totalAttackDamage = currentAttackObject.averagedamage;
      if (totalAttackDamage === 0)
      {
        currentAttackObject = ActorUtils.getReferentialLegendaryActions(actorObject, currentAction);
        if (!currentAttackObject?.averagedamage)
        {
          continue;
        }
      }

      if (currentAction.hasAreaTarget || pseudoAreaTarget)
      {
        pseudoAreaTargetCount = ActorUtils.getPseudoAreaOfEffectTargetCount(currentAction);
        totalAttackDamage = totalAttackDamage * pseudoAreaTargetCount;
      }
      let currentLegendaryActionResult = {};
      currentLegendaryActionResult["averagedamage"] = currentAttackObject.averagedamage;
      currentLegendaryActionResult["attackbonustohit"] = currentAttackObject.attackbonustohit;
      currentLegendaryActionResult["attackdescription"] = currentAction.name;
      currentLegendaryActionResult["numberofattacks"] = 1;
      currentLegendaryActionResult["hasareaofeffect"] = currentAction.hasAreaTarget;
      currentLegendaryActionResult["attackobject"] = currentAttackObject.attackobject;
      currentLegendaryActionResult["isspell"] = currentAction.type === "spell";
      currentLegendaryActionResult["legendaryactioncost"] = legedaryActionCost;
      currentLegendaryActionResult["damagepercost"] = totalAttackDamage / legedaryActionCost;
      if (pseudoAreaTargetCount)
      {
        currentLegendaryActionResult["areaofeffecttargets"] = pseudoAreaTargetCount;
      }


      if (currentAction.hasSave)
      {
        currentLegendaryActionResult["savingthrowdc"] = ActorUtils.getSaveDC(currentAction);
        currentLegendaryActionResult["savingthrowtype"] = ActorUtils.getSavingThrowType(currentAction);
      }

      legendaryActionList.push(currentLegendaryActionResult);
    }

    let sortedLegendaryActionList = legendaryActionList.sort(function (a, b)
    {
      return b.damagepercost - a.damagepercost;
    });

    let finalLegendaryActionResult = [];
    let currentLegendaryActionCost = 0;

    // Loop through up to 5 times in case there is only one legendary action which does damage
    for (let j = 0; j < 5; j++)
    {
      if (currentLegendaryActionCost >= legendaryActionsMax)
      {
        break;
      }

      for (let i = 0; i < sortedLegendaryActionList.length; i++)
      {
        let currentAction = sortedLegendaryActionList[i];

        if (currentLegendaryActionCost >= legendaryActionsMax)
        {
          break;
        }

        if (currentLegendaryActionCost + currentAction.legendaryactioncost > legendaryActionsMax)
        {
          continue;
        }

        if (currentAction.averagedamage === 0)
        {
          continue;
        }

        currentLegendaryActionCost += currentAction.legendaryactioncost;
        finalLegendaryActionResult.push(currentAction);
      }
    }

    return finalLegendaryActionResult;
  }

  static getReferentialLegendaryActions(actorObject, legendaryActionsItem)
  {
    // This code will execute in cases where there is a legendary action which is saying, "Make an attack with FOO". We'll attempt to find the correct object Foo.

    let actor = actorObject.actor;
    let actorDataObject = FoundryUtils.getDataObjectFromObject(actor);
    if (!actorDataObject.resources.legact || actorDataObject.resources.legact.max === 0)
    {
      return null;
    }

    let legendaryActionsDataObject = FoundryUtils.getDataObjectFromObject(legendaryActionsItem);
    let legedaryActionsDescription = legendaryActionsDataObject.description.value;
    legedaryActionsDescription = legedaryActionsDescription.replaceAll("<p>", "").replaceAll("</p>", "");
    let legendaryActionsToChooseFrom = actor.items.filter(i =>
      (i.type != "spell" ||
        (i.type === "spell" && FoundryUtils.getDataObjectFromObject(i).level === 0))
      && i.type != "legendary"
      && i.name.toLowerCase() != "legendary actions");

    let currentlySeenLegendaryActions = [];
    for (let i = 0; i < legendaryActionsToChooseFrom.length; i++)
    {
      let currentPossibleAction = legendaryActionsToChooseFrom[i];
      if (currentlySeenLegendaryActions.find(a => a === currentPossibleAction.name))
      {
        continue;
      }
      currentlySeenLegendaryActions.push(currentPossibleAction.name);
      let legedaryActionCost = 1;
      let currentActionRegex = new RegExp(`${currentPossibleAction.name}( .costs (?<legendaryActionCost>.) actions.)?`, 'i');
      let isSpell = false;

      if (currentPossibleAction.type === "spell")
      {
        isSpell = true;
        currentActionRegex = new RegExp(`cantrip`, 'i');
      }

      let legedaryActionsDescriptionMatch = legedaryActionsDescription.match(currentActionRegex);
      if (legedaryActionsDescriptionMatch || legedaryActionsDescription.includes(currentPossibleAction.name))
      {
        if (legedaryActionsDescriptionMatch)
        {
          if (legedaryActionsDescriptionMatch.groups.legendaryActionCost)
          {
            legedaryActionCost = legedaryActionsDescriptionMatch.groups.legendaryActionCost;
          }
        }
        else
        {
          let nameRegex = currentPossibleAction.name.match(/costs (?<legendaryActionCost>.) actions/i);
          if (nameRegex)
          {
            legedaryActionCost = nameRegex.groups.legendaryActionCost;
          }
        }

        let currentAttackObject = isSpell ?
          ActorUtils.getInfoForSpellObject(currentPossibleAction, actorObject) :
          ActorUtils.getInfoForAttackObject(currentPossibleAction, 1, actorObject);

        let totalAttackDamage = currentAttackObject.averagedamage;
        if (currentPossibleAction.hasAreaTarget)
        {
          totalAttackDamage = totalAttackDamage * 2;
        }

        let currentLegendaryActionResult = {};
        currentLegendaryActionResult["averagedamage"] = currentAttackObject.averagedamage;
        currentLegendaryActionResult["attackbonustohit"] = currentAttackObject.attackbonustohit;
        currentLegendaryActionResult["attackdescription"] = currentPossibleAction.name;
        currentLegendaryActionResult["numberofattacks"] = 1;
        currentLegendaryActionResult["hasareaofeffect"] = currentPossibleAction.hasAreaTarget;
        currentLegendaryActionResult["attackobject"] = currentPossibleAction;
        currentLegendaryActionResult["isspell"] = currentPossibleAction.type === "spell";
        currentLegendaryActionResult["legendaryactioncost"] = legedaryActionCost;
        currentLegendaryActionResult["damagepercost"] = totalAttackDamage / legedaryActionCost;

        if (currentPossibleAction.hasSave)
        {
          currentLegendaryActionResult["savingthrowdc"] = ActorUtils.getSaveDC(currentPossibleAction);
          currentLegendaryActionResult["savingthrowtype"] = ActorUtils.getSavingThrowType(currentPossibleAction);
        }

        return currentLegendaryActionResult;
      }
    }

    return null;
  }

  static getIfAttackAffectsMultipleCreatures(attackObject)
  {
    let attackDataObject = FoundryUtils.getDataObjectFromObject(attackObject);
    let description = attackDataObject.description.value.toLowerCase();
    if (description.match(/\beach/i) && description.includes("within") && description.includes("feet"))
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  static getPseudoAreaOfEffectTargetCount(attackObject)
  {
    let attackDataObject = FoundryUtils.getDataObjectFromObject(attackObject);
    let description = attackDataObject.description.value.toLowerCase();
    if (description.includes("each") && description.includes("within") && description.includes("feet"))
    {
      let feetCountMatch = description.match(/(?<distance>\d+) feet/i);
      if (feetCountMatch)
      {
        let distance = feetCountMatch.groups.distance;
        if (distance <= 10)
        {
          return 2;
        }
        else if (distance <= 20)
        {
          return 3;
        }
        else
        {
          return 4;
        }
      }
    }

    return null;
  }

  static getBestMultiExtraAttack(actor)
  {
    let multiAttacks = actor.items.filter(i => i.name.toLowerCase() === "multiattack" || i.name.toLowerCase() === "extra attack");

    if (multiAttacks.length === 0)
    {
      return null;
    }

    // This should be in the case of NPCs. Only PCs might have multiple extra attacks.
    if (multiAttacks.length === 1)
    {
      return multiAttacks[0];
    }

    let bestMultiAttack = null;
    let mostNumberOfAttacks = 0;
    for (let i = 0; i < multiAttacks.length; i++)
    {
      let currentMultiAttack = multiAttacks[i];

      let multiAttackDescription = ActorUtils.getDescriptionFromItemObject(currentMultiAttack).toLowerCase();
      multiAttackDescription = multiAttackDescription.replaceAll("instead of once", "");

      let extraAttackMatch = multiAttackDescription.match(ActorUtils.numberRegex);
      if (extraAttackMatch)
      {
        let numberOfAttacksMatch = extraAttackMatch[0];
        let actualNumberOfAttacks = GeneralUtils.getIntegerFromWordNumber(numberOfAttacksMatch);
        if (actualNumberOfAttacks > mostNumberOfAttacks)
        {
          bestMultiAttack = currentMultiAttack;
          mostNumberOfAttacks = actualNumberOfAttacks;
        }
      }
    }

    return bestMultiAttack;
  }

  static getBestSingleAttack(attackList, actorObject)
  {
    let bestAttackObject = null;
    let maxDamage = 0;
    for (let i = 0; i < attackList.length; i++)
    {
      try
      {
        let currentAttackObject = ActorUtils.getInfoForAttackObject(attackList[i], 1, actorObject);
        let totalDamage = ActorUtils.getTotalDamageForAttackObject(currentAttackObject);
        if (maxDamage < totalDamage)
        {
          bestAttackObject = attackList[i];
          maxDamage = totalDamage;
        }
      }
      catch (error)
      {
        console.warn(`Unable to parse attack ${attackList[i].name}: ${error}`);
      }
    }

    return bestAttackObject;
  }

  static getTotalDamageForAttackObject(attackObject)
  {
    let totalDamage = attackObject.averagedamage * attackObject.numberofattacks;
    if (attackObject.hasareaofeffect)
    {
      // Assume AOE attacks hit two PCs
      totalDamage = totalDamage * 2;
    }
    return totalDamage;
  }

  static getSpellDataPerRound(actorObject, activationType, spellLevelLimit)
  {
    let allSpellResultObjects = [];
    let actor = actorObject.actor;
    try
    {
      let spellList = actor.items.filter(i => (i.type.toLowerCase() === "spell") && (!activationType || (FoundryUtils.getDataObjectFromObject(i).activation.type === activationType)));
      if (spellLevelLimit != null)
      {
        spellList = spellList.filter(s => FoundryUtils.getDataObjectFromObject(s).level <= spellLevelLimit);
      }

      let bestSpellObject = null;
      let maxDamage = 0;
      for (let i = 0; i < spellList.length; i++)
      {
        try
        {
          let currentSpellObject = ActorUtils.getInfoForSpellObject(spellList[i], actorObject);
          if (!currentSpellObject)
          {
            continue;
          }
          let totalDamage = currentSpellObject.averagedamage * currentSpellObject.numberofattacks;
          if (currentSpellObject.hasareaofeffect)
          {
            // Assume AOE attacks hit two PCs
            totalDamage = totalDamage * 2;
          }
          if (maxDamage < totalDamage)
          {
            bestSpellObject = currentSpellObject;
            maxDamage = totalDamage;
          }
        }
        catch (error)
        {
          console.warn(`Unable to parse spell attack ${spellList[i].name}`);
          console.warn(error.stack);
        }
      }
      if (bestSpellObject)
      {
        allSpellResultObjects.push(bestSpellObject);
      }
    }
    catch (error)
    {
      console.warn(`Failed to get spell data per round for ${actorObject.actorname}, ${actorObject.actorid}`);
      console.warn(error.stack);
    }

    return allSpellResultObjects;
  }

  static getSpecialFeatures(actorObject)
  {
    let specialFeatureList = [];
    let actor = actorObject.actor;
    let actorDataObject = FoundryUtils.getDataObjectFromObject(actor);
    let sneakAttack = ActorUtils.getActorFeature(actorObject, "sneak attack");
    if (sneakAttack)
    {
      let sneakAttackDamage = 0;
      if (actor.classes && actor.classes.rogue)
      {
        let classDataObject = FoundryUtils.getDataObjectFromObject(actor.classes.rogue);
        sneakAttackDamage = Math.ceil(classDataObject.levels / 2) * 3.5;
      }
      else
      {
        let sneakAttackDataObject = FoundryUtils.getDataObjectFromObject(sneakAttack);
        let sneakAttackFormula = sneakAttackDataObject.damage.parts[0][0];
        let evaluatedSneakAttack = ActorUtils.resolveMacrosInRollFormula(actorObject, sneakAttackFormula);
        sneakAttackDamage = ActorUtils.getAverageDamageFromDescription(evaluatedSneakAttack, actorDataObject.abilities.dex.mod, actor);
      }

      let bestAttackBonus = ActorUtils.getBestChanceAttack(actorObject);

      let currentAttackResult = {};
      currentAttackResult["averagedamage"] = sneakAttackDamage;
      currentAttackResult["attackbonustohit"] = bestAttackBonus;
      currentAttackResult["numberofattacks"] = 1;
      currentAttackResult["hasareaofeffect"] = false;
      currentAttackResult["attackdescription"] = sneakAttack.name;
      currentAttackResult["attackobject"] = sneakAttack;
      currentAttackResult["isspell"] = false;
      currentAttackResult["isspecial"] = true;
      specialFeatureList.push(currentAttackResult);
    }
    return specialFeatureList;
  }

  static resolveMacrosInRollFormula(actorObject, rollDescription)
  {
    let macroRegex = /@(?<macroValue>\S+)/gm;
    let macroMatches = [...rollDescription.matchAll(macroRegex)];
    let evaluatedRollDescription = rollDescription;
    for (let i = 0; i < macroMatches.length; i++)
    {
      try
      {
        let currentMatch = macroMatches[i];
        let currentMatchGroups = currentMatch.groups;
        let macroValue = currentMatchGroups.macroValue;
        let actorDataObject = FoundryUtils.getDataObjectFromObject(actorObject.actor);
        let evaluatedMacroValue = eval(`actorDataObject.${macroValue}`);
        evaluatedRollDescription = evaluatedRollDescription.replaceAll(currentMatch[0], evaluatedMacroValue);
      }
      catch (error)
      {
        console.warn(`Unable to evaluate macros in rollDescription ${rollDescription}`);
        console.warn(error.stack);
      }
    }

    return evaluatedRollDescription;
  }

  static getBestChanceAttack(actorObject)
  {
    let bestChance = 0;
    for (let i = 0; i < actorObject.attackdata.length; i++)
    {
      let currentAttack = actorObject.attackdata[i];
      let currentAttackBonusToHit = currentAttack.attackbonustohit;
      if (currentAttackBonusToHit > bestChance)
      {
        bestChance = currentAttackBonusToHit;
      }
    }
    return bestChance;
  }

  static getActorFeature(actorObject, featureName)
  {
    let actor = actorObject.actor;
    let specialFeatures = actor.items.find(i => i.name.toLowerCase() === featureName);
    return specialFeatures;
  }

  static getBestCombat(actorObject)
  {
    let totalAttackDamage = 0;
    let totalSpellDamage = 0;

    let bestCombatRound = [];

    for (let attack of actorObject.attackdata)
    {
      try
      {
        let attackBonus = attack.attackbonustohit;
        let averageDamage = attack.averagedamage;
        let numberOfAttacks = attack.numberofattacks;

        for (var j = 0; j < numberOfAttacks; j++)
        {
          totalAttackDamage += averageDamage;
        }
      }
      catch (error)
      {
        console.warn(`Failed to add combat summary for creature ${actorObject.actorname}`);
        console.warn(error.stack);
      }
    }

    for (let attack of actorObject.spelldata)
    {
      try
      {
        let attackBonus = attack.attackbonustohit;
        let averageDamage = attack.averagedamage;
        let numberOfAttacks = attack.numberofattacks;

        for (var j = 0; j < numberOfAttacks; j++)
        {
          totalSpellDamage += averageDamage;
        }
      }
      catch (error)
      {
        console.warn(`Failed to calculate spell summary for creature ${actorObject.actorname}`);
        console.warn(error.stack);
      }
    }

    if (totalAttackDamage > totalSpellDamage)
    {
      bestCombatRound = actorObject.attackdata;
    }
    else
    {
      bestCombatRound = actorObject.spelldata;
    }

    bestCombatRound = GeneralUtils.safeArrayAppend(bestCombatRound, actorObject.bonusattackdata);
    bestCombatRound = GeneralUtils.safeArrayAppend(bestCombatRound, actorObject.specialfeatures);
    bestCombatRound = GeneralUtils.safeArrayAppend(bestCombatRound, actorObject.legendarydata);

    return bestCombatRound;
  }

  static getModifierFromAttributeScore(attributeScore)
  {
    let modifier = Math.floor((attributeScore - 10) / 2);
    return modifier;
  }

  static getInfoForSpellObject(spellObject, actorObject, enemyTargetObject)
  {
    if (spellObject.hasDamage === false)
    {
      return;
    }
    let abilityModType = spellObject.abilityMod;
    let parentDataObject = FoundryUtils.getDataObjectFromObject(spellObject.parent);
    let abilityModValue = eval("parentDataObject.abilities." + abilityModType + ".mod");
    let spellDataObject = FoundryUtils.getDataObjectFromObject(spellObject);
    let damageList = spellDataObject.damage.parts;

    let totalDamageForAttack = 0;
    for (let i = 0; i < damageList.length; i++)
    {
      let damageArray = damageList[i];
      let damageDescription = damageArray[0];
      let damageType = damageArray[1];
      damageDescription = damageDescription.toLowerCase().replaceAll(`[${damageType.toLowerCase()}]`, "");
      if (damageType.toLowerCase() === "healing")
      {
        continue;
      }

      damageDescription = Roll.replaceFormulaData(damageDescription, actorObject.actorObject.getRollData());

      let totalAverageRollResult = ActorUtils.getAverageDamageFromDescription(damageDescription, abilityModValue, actorObject.actorObject);

      if (enemyTargetObject)
      {
        let isSpell = true;
        totalAverageRollResult = ActorUtils.getDamageWithResistance(
          enemyTargetObject,
          spellObject,
          damageType,
          damageDescription,
          totalAverageRollResult,
          isSpell);
      }

      totalDamageForAttack += totalAverageRollResult;
    }

    let scalingObject = spellDataObject.scaling;
    if (scalingObject && scalingObject.mode === "cantrip")
    {
      let cantripMultiplier = ActorUtils.getCantripMultiplier(actorObject);
      totalDamageForAttack = totalDamageForAttack * cantripMultiplier;
    }

    let currentAttackResult = {};
    currentAttackResult["averagedamage"] = totalDamageForAttack;
    let isProficient = spellDataObject.prof.hasProficiency;
    let attackBonus = 0;
    if (isProficient)
    {
      attackBonus += spellDataObject.prof.flat;
    }

    attackBonus += abilityModValue;

    if (spellObject.hasSave)
    {
      currentAttackResult["savingthrowdc"] = ActorUtils.getSaveDC(spellObject);
      currentAttackResult["savingthrowtype"] = ActorUtils.getSavingThrowType(spellObject);
    }
    else
    {
      currentAttackResult["attackbonustohit"] = attackBonus;
    }
    currentAttackResult["numberofattacks"] = 1;
    currentAttackResult["hasareaofeffect"] = spellObject.hasAreaTarget;
    currentAttackResult["attackdescription"] = spellObject.name;
    currentAttackResult["attackobject"] = spellObject;
    currentAttackResult["isspell"] = true;

    if (isNaN(attackBonus))
    {
      return;
    }
    return currentAttackResult;
  }

  static getDamageWithResistance(enemyTargetObject, attackObject, damageType, damageDescription, totalAverageRollResult, isSpell)
  {
    let attackDataObject = FoundryUtils.getDataObjectFromObject(attackObject);
    let enemyTraitsObject = FoundryUtils.getDataObjectFromObject(enemyTargetObject.actorObject).traits;

    let immunityApplied = false;
    let resistanceApplied = false;
    let vulnerabilityApplied = false;

    let isPhysicalDamage = ["piercing", "slashing", "bludgeoning"].find(d => d === damageType.toLowerCase());
    let isMagical = attackDataObject.properties?.mgc ||
      isSpell ||
      ActorUtils.getIsMagicalDamage(damageType) ||
      ActorUtils.getIsMagicalDamage(damageDescription); // Sometimes the damage description has types in them if there are multiple damage types

    let isSilvered = attackDataObject.properties?.sil;

    // di is damage immunity
    if (enemyTraitsObject.di.value.find(v => v === damageType))
    {
      totalAverageRollResult = 0;
      immunityApplied = true;
    }

    if (enemyTraitsObject.di.custom?.match(/(nonmagical|non\-magical)/i) && isPhysicalDamage && !isMagical && !immunityApplied)
    {
      totalAverageRollResult = 0;
      immunityApplied = true;
    }

    if (enemyTraitsObject.di.value.find(v => v === "physical") && isPhysicalDamage && !isMagical && !immunityApplied)
    {
      totalAverageRollResult = 0;
      immunityApplied = true;
    }

    // Some enemites have resistance to magical weapons too (e.g. Demilich)
    if (enemyTraitsObject.di.custom?.match(/\bmagic\b/i) && isPhysicalDamage && isMagical && !immunityApplied)
    {
      totalAverageRollResult = 0;
      immunityApplied = true;
    }

    // dr is damage resistance
    if (enemyTraitsObject.dr.value.find(v => v === damageType))
    {
      totalAverageRollResult = totalAverageRollResult * 0.5;
      resistanceApplied = true;
    }

    if (enemyTraitsObject.dr.custom?.match(/(nonmagical|non\-magical)/i) && isPhysicalDamage && !isMagical && !resistanceApplied)
    {
      totalAverageRollResult = totalAverageRollResult * 0.5;
      resistanceApplied = true;
    }

    // Some enemites have resistance to magical weapons too (e.g. Demilich)
    if (enemyTraitsObject.dr.custom?.match(/\bmagic\b/i) && isPhysicalDamage && isMagical && !resistanceApplied)
    {
      totalAverageRollResult = totalAverageRollResult * 0.5;
      resistanceApplied = true;
    }

    if (enemyTraitsObject.dr.value.find(v => v === "physical") && isPhysicalDamage && !isMagical && !resistanceApplied)
    {
      totalAverageRollResult = totalAverageRollResult * 0.5;
      resistanceApplied = true;
    }

    if (enemyTraitsObject.dr.custom?.match(/silver/i) && isPhysicalDamage && !isSilvered && !resistanceApplied)
    {
      totalAverageRollResult = totalAverageRollResult * 0.5;
      resistanceApplied = true;
    }

    // dv is damage resistance
    if (enemyTraitsObject.dv.value.find(v => v === damageType))
    {
      totalAverageRollResult = totalAverageRollResult * 2;
    }
    return totalAverageRollResult;
  }

  static getIsMagicalDamage(damageType)
  {
    let magicalDamageRegex = /(acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)/i;
    if (damageType.match(magicalDamageRegex))
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  static guessActorMultiAttack(attackList, multiAttackDescription, actorObject)
  {
    let bestAttackObject = ActorUtils.getBestSingleAttack(attackList, actorObject);
    let actualNumber = 1;
    let numberMatch = multiAttackDescription.match(ActorUtils.numberRegex);
    if (numberMatch)
    {
      actualNumber = GeneralUtils.getIntegerFromWordNumber(numberMatch[0]);
    }

    return ActorUtils.getInfoForAttackObject(bestAttackObject, actualNumber, actorObject);
  }

  static getInfoForAttackObject(attackObject, numberOfAttacks, actorObject, enemyTargetObject)
  {
    let abilityModType = attackObject.abilityMod;
    let abilityModValue = 0;
    let attackDataObject = FoundryUtils.getDataObjectFromObject(attackObject);
    let parentDataObject = FoundryUtils.getDataObjectFromObject(attackObject.parent);
    if (abilityModType)
    {
      abilityModValue = eval("parentDataObject.abilities." + abilityModType + ".mod");
    }
    let damageList = attackDataObject.damage.parts;

    let totalDamageForAttack = 0;

    if (damageList.length === 0 && attackDataObject.formula != "")
    {
      let damageDescription = attackDataObject.formula;
      damageDescription = damageDescription.toLowerCase().replaceAll(/\[.+\]/gm, "");

      let totalAverageRollResult = ActorUtils.getAverageDamageFromDescription(damageDescription, abilityModValue, actorObject.actorObject);
      if (!isNaN(totalAverageRollResult))
      {
        totalDamageForAttack += totalAverageRollResult;
      }
    }
    else
    {
      for (let i = 0; i < damageList.length; i++)
      {
        let damageArray = damageList[i];
        let damageDescription = damageArray[0];
        let damageType = damageArray[1];
        damageDescription = damageDescription.toLowerCase().replaceAll(`[${damageType.toLowerCase()}]`, "");
        try
        {
          damageDescription = Roll.replaceFormulaData(damageDescription, actorObject.actorObject.getRollData());
        }
        catch (error)
        {
          console.warn(`${actorObject.actorname}, ${actorObject.actorid}, attack ${attackObject.name} failed to get damage description.`);
          console.warn(error);
        }

        let totalAverageRollResult = ActorUtils.getAverageDamageFromDescription(damageDescription, abilityModValue, actorObject.actorObject);
        if (isNaN(totalAverageRollResult))
        {
          if (damageType != "healing")
          {
            console.warn(`No damage for ${actorObject.actorname}, ${actorObject.actorid}, attack ${attackObject.name}, damage type ${damageType}`);
          }
          continue;
        }

        if (enemyTargetObject)
        {
          let isSpell = false;
          totalAverageRollResult = ActorUtils.getDamageWithResistance(
            enemyTargetObject,
            attackObject,
            damageType,
            damageDescription,
            totalAverageRollResult,
            isSpell);
        }

        totalDamageForAttack += totalAverageRollResult;
      }
    }
    let currentAttackResult = {};
    currentAttackResult["averagedamage"] = totalDamageForAttack;
    let isProficient = attackDataObject.proficient;
    let attackBonus = 0;
    if (isProficient)
    {
      attackBonus += attackDataObject.prof.flat;
    }

    attackBonus += abilityModValue;

    if (attackObject.hasSave)
    {
      currentAttackResult["savingthrowdc"] = ActorUtils.getSaveDC(attackObject);
      currentAttackResult["savingthrowtype"] = ActorUtils.getSavingThrowType(attackObject);
    }

    if (attackObject.hasAttack)
    {
      currentAttackResult["attackbonustohit"] = attackBonus;
    }

    currentAttackResult["numberofattacks"] = numberOfAttacks;
    currentAttackResult["hasareaofeffect"] = attackObject.hasAreaTarget;
    currentAttackResult["attackdescription"] = attackObject.name;
    currentAttackResult["attackobject"] = attackObject;
    currentAttackResult["isspell"] = false;

    if (isNaN(attackBonus) || isNaN(numberOfAttacks) || isNaN(totalDamageForAttack))
    {
      console.warn(`Invalid attack data for ${actorObject.actorname}, ${actorObject.actorid}. Average damage: ${currentAttackResult.averagedamage}, Attack Bonus: ${currentAttackResult.attackbonustohit}, Number of Attacks: ${currentAttackResult.numberofattacks}`);
    }

    return currentAttackResult;
  }

  static getSaveDC(attackObject)
  {
    return FoundryUtils.getDataObjectFromObject(attackObject).save.dc;
  }

  static getSavingThrowType(attackObject)
  {
    return FoundryUtils.getDataObjectFromObject(attackObject).save.ability;
  }

  static getCantripMultiplier(actorObject)
  {
    let spellLevel = FoundryUtils.getDataObjectFromObject(actorObject.actorObject).details.spellLevel;

    if (isNaN(spellLevel) || spellLevel < 5)
    {
      return 1;
    }
    else if (spellLevel < 11)
    {
      return 2;
    }
    else if (spellLevel < 17)
    {
      return 3;
    }
    else
    {
      return 4;
    }
  }

  static getAverageDamageFromDescription(damageDescription, abilityModValue, actor)
  {
    let actorDataObject = FoundryUtils.getDataObjectFromObject(actor);
    damageDescription = damageDescription.replaceAll("@mod", abilityModValue);

    try
    {
      damageDescription = Roll.replaceFormulaData(damageDescription, actor.getRollData());
    }
    catch (error)
    {
      console.warn(`${actor.name}, ${damageDescription} failed to get damage description.`);
      console.warn(error);
    }

    let spellDamageQualifierMatches = [...damageDescription.matchAll(/\[.+\]/gm)];

    for (let i = 0; i < spellDamageQualifierMatches.length; i++)
    {
      let matchResult = spellDamageQualifierMatches[i];
      let entireMatchValue = matchResult[0];
      damageDescription = damageDescription.replaceAll(entireMatchValue, "");
    }

    let matches = [...damageDescription.matchAll(/((?<diceCount>\d+)d(?<diceType>\d+)(?<removeLowRolls>r\<\=(?<lowRollThreshold>\d))?)/gm)];
    for (let i = 0; i < matches.length; i++)
    {
      let matchResult = matches[i];
      let entireMatchValue = matchResult[0];
      let matchResultGroups = matchResult.groups;
      let diceCount = matchResultGroups.diceCount;
      let diceType = matchResultGroups.diceType;
      let removeLowRolls = matchResultGroups.removeLowRolls;
      let extraToAddToAverage = 0;
      if (removeLowRolls)
      {
        extraToAddToAverage = 2;
      }
      let diceTypeAverage = (parseInt(diceType) + 1 + extraToAddToAverage) / 2;
      let totalDiceRollAverage = diceTypeAverage * diceCount;
      damageDescription = damageDescription.replaceAll(entireMatchValue, totalDiceRollAverage);
    }

    // deal with modules that use a Math.floor function but Math. isn't specified
    damageDescription = damageDescription.replaceAll("floor(", "Math.floor(");
    damageDescription = damageDescription.replaceAll("ceil(", "Math.ceil(");
    let totalAverageRollResult = eval(damageDescription);
    return totalAverageRollResult;
  }

  static getActorTraits(actor)
  {
    let characterTraits = {};

    let actorDataObject = FoundryUtils.getDataObjectFromObject(actor);
    if (actorDataObject.traits.ci.value.length > 0)
    {
      characterTraits["conditionimmunities"] = actorDataObject.traits.ci.value;
    }
    if (actorDataObject.traits.di.value.length > 0)
    {
      characterTraits["damageimmunities"] = actorDataObject.traits.di.value;
    }
    if (actorDataObject.traits.dr.value.length > 0)
    {
      characterTraits["damageresistances"] = actorDataObject.traits.dr.value;
    }
    if (actorDataObject.traits.dv.value.length > 0)
    {
      characterTraits["damagevulnerabilities"] = actorDataObject.traits.dv.value;
    }

    let actorSpells = actorDataObject.spells;
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
      characterTraits["spelldamagetypelist"] = spellList.map(s => s.data.data.damage.parts).filter(p => p.length > 0).map(z => z[0][1]).filter(t => t != "");
    }

    if (actorDataObject.resources.lair.value)
    {
      characterTraits["lairactions"] = true;
    }

    if (actorDataObject.resources.legact.max > 0)
    {
      characterTraits["legendaryactions"] = true;
    }

    if (actorDataObject.resources.legres.max > 0)
    {
      characterTraits["legendaryresistances"] = true;
    }

    let spellList = actor.items.filter(i => i.type === "spell");
    if (spellList.filter(s => s.hasAreaTarget && s.hasDamage && s.name.toLowerCase() != "sleep").length > 0)
    {
      characterTraits["hasAOESpell"] = true;
    }
  }

  static getDescriptionFromItemObject(item)
  {
    return FoundryUtils.getDataObjectFromObject(item).description.value;
  }

  static getXPFromActorObject(actor)
  {
    return FoundryUtils.getDataObjectFromObject(actor).details.xp.value;
  }

  static getCRFromActorObject(actor)
  {
    return FoundryUtils.getDataObjectFromObject(actor).details.cr;
  }
}
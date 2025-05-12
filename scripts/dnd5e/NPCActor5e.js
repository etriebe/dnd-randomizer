import { ActorUtils } from "../utils/ActorUtils.js";
import { GeneralUtils } from "../utils/GeneralUtils.js";
import { FoundryUtils } from "../utils/FoundryUtils.js";
import { SFCONSTS } from "../main.js";
import { SFLOCALCONSTS } from "../localconst.js";
export class NPCActor5e
{
    static numberRegex = /\b(?<numberOfAttacks>one|two|three|four|five|six|seven|eight|nine|ten|once|twice|thrice|1|2|3|4|5|6|7|8|9)\b/gm;
    constructor(data, compendiumname)
    {
        this.actor = data;
        this.actorname = this.actor.name;
        this.actorid = this.actor._id ?? this.actor.id;
        this.actorcr = NPCActor5e.getCRFromActorObject(this.actor);
        this.actorxp = this.getXP();
        this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
        this.environment = ActorUtils.getActorEnvironments(this.actor);
        this.attackdata = null;
        this.spelldata = null;
        this.combatdata = null;
        this.actorObject = null;
        this.compendiumname = compendiumname;
    }

    async analyzeActor()
    {
        this.actorObject = await ActorUtils.getActorFromActorIdCompendiumName(this.actorid, this.compendiumname);
        this.attackdata = this.getCombatDataPerRound();
        this.spelldata = this.getSpellDataPerRound();
        this.combatdata = this.getBestCombat();
    }

    getCombatDataPerRound()
    {
        let allAttackResultObjects = [];
        let actor = this.actorObject;
        try
        {
            let attackList = actor.items.filter(i => (i.type.toLowerCase() === "weapon" || i.type.toLowerCase() === "feat")
                && i.name.toLowerCase() != "multiattack");
            let multiAttack = actor.items.filter(i => i.name.toLowerCase() === "multiattack");
            if (multiAttack && multiAttack.length > 0)
            {
                // Description types supported:
                // <p>The imperial ghoul makes one bite attack and one claws attack.</p>
                // <p>the dragon can use its frightful presence. it then makes three attacks: one with its bite and two with its claws.</p>'
                let multiAttackDescription = NPCActor5e.getDescriptionFromItemObject(multiAttack[0]).toLowerCase();

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
                let numberMatches = [...multiAttackDescription.matchAll(NPCActor5e.numberRegex)];
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
                        console.warn(`Unable to parse number of attacks for multi attack for ${this.actorname}, ${this.actorid}, Multiattack Description: ${multiAttackDescription}`);
                    }

                    let currentAttackObject = this.getInfoForAttackObject(attackObject, actualNumberOfAttacks);

                    if (!currentAttackObject || currentAttackObject.averagedamage === 0)
                    {
                        // Skip because attack is boring and likely is some type of charm feature. 
                        continue;
                    }

                    if (previousAttackIndex != -1)
                    {
                        let previousAttackObject = allAttackResultObjects.pop();

                        // Check to see if an or is between the previous attack object and the current
                        let orMatchesBetweenAttacks = orMatches.filter(o => o.index > previousAttackIndex && o.index < currentAttackIndex);
                        if (orMatchesBetweenAttacks.length > 0)
                        {
                            // decide which object is better and push that one.
                            if ((NPCActor5e.getTotalDamageForAttackObject(currentAttackObject)) >
                                (NPCActor5e.getTotalDamageForAttackObject(previousAttackObject)))
                            {
                                allAttackResultObjects.push(currentAttackObject);
                            }
                            else
                            {
                                allAttackResultObjects.push(previousAttackObject);
                            }
                        }
                        else
                        {
                            allAttackResultObjects.push(previousAttackObject);
                            allAttackResultObjects.push(currentAttackObject);
                        }
                    }
                    else
                    {
                        allAttackResultObjects.push(currentAttackObject);
                        // console.log(`Adding attack ${attackObject.name} for ${actor.name}`);
                    }
                    previousAttackIndex = currentAttackIndex;
                }

                if (allAttackResultObjects.length === 0)
                {
                    let guessedAttack = this.guessActorMultiAttack(attackList, multiAttackDescription);
                    if (guessedAttack)
                    {
                        console.log(`Attempted to guess attack for ${actor.name}: ${guessedAttack.numberofattacks} ${guessedAttack.attackdescription} attacks.`);
                        allAttackResultObjects.push(guessedAttack);
                    }
                }
            }
            else
            {
                let bestAttackObject = null;
                let maxDamage = 0;
                for (let i = 0; i < attackList.length; i++)
                {
                    try
                    {
                        let currentAttackObject = this.getInfoForAttackObject(attackList[i], 1);
                        let totalDamage = NPCActor5e.getTotalDamageForAttackObject(currentAttackObject);
                        if (maxDamage < totalDamage)
                        {
                            bestAttackObject = currentAttackObject;
                            maxDamage = totalDamage;
                        }
                    }
                    catch (error)
                    {
                        console.warn(`Unable to parse attack ${attackList[i].name}: ${error}`);
                        console.warn(error.stack);
                    }
                }

                if (bestAttackObject)
                {
                    allAttackResultObjects.push(bestAttackObject);
                }
            }

            if (allAttackResultObjects.length === 0)
            {
                console.warn(`Parsed no attack data for actor: ${actor.name}`);
            }
        }
        catch (error)
        {
            console.warn(`Error parsing attack information for ${actor.name}, ${actor.id}. Error: ${error}`);
            console.warn(error.stack);
        }
        return allAttackResultObjects;
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

    getSpellDataPerRound()
    {
        let allSpellResultObjects = [];
        let actor = this.actorObject;
        try
        {
            let spellList = actor.items.filter(i => (i.type.toLowerCase() === "spell"));
            let bestSpellObject = null;
            let maxDamage = 0;
            for (let i = 0; i < spellList.length; i++)
            {
                try
                {
                    let currentSpellObject = this.getInfoForSpellObject(spellList[i], 1);
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
                    console.warn(error);
                }
            }
            if (bestSpellObject)
            {
                allSpellResultObjects.push(bestSpellObject);
            }
        }
        catch (error)
        {
            console.warn(`Failed to get spell data per round for ${this.actorname}, ${this.actorid}`);
            console.warn(error);
        }

        return allSpellResultObjects;
    }

    getBestCombat()
    {
        let totalAttackDamage = 0;
        let totalSpellDamage = 0;

        for (let attack of this.attackdata)
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
                console.warn(`Failed to add combat summary for creature ${this.actorname}`);
                console.warn(error);
            }
        }

        for (let attack of this.spelldata)
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
                console.warn(`Failed to calculate spell summary for creature ${this.actorname}`);
                console.warn(error);
            }
        }

        if (totalAttackDamage > totalSpellDamage)
        {
            return this.attackdata;
        }
        else
        {
            return this.spelldata;
        }
    }

    static getModifierFromAttributeScore(attributeScore)
    {
        let modifier = Math.floor((attributeScore - 10) / 2);
        return modifier;
    }

    getInfoForSpellObject(spellObject)
    {
        if (spellObject.hasDamage === false)
        {
            return;
        }
        let abilityModType = spellObject.abilityMod;
        let parentDataObject = FoundryUtils.getDataObjectFromObject(spellObject.parent);
        let abilityModValue = 0;
        let spellDataObject = FoundryUtils.getDataObjectFromObject(spellObject);
        let totalDamageForAttack = 0;

        if (FoundryUtils.isDND5eVersion4() || FoundryUtils.isDND5eVersion5())
        {
            totalDamageForAttack += NPCActor5e.getActivitiesAverageDamage(spellDataObject.activities, parentDataObject);
        }
        else
        {
            let damageList = spellDataObject.damage.parts;
            !abilityModType ? 0 : eval("parentDataObject.abilities." + abilityModType + ".mod");

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

                let abilitiesModMatches = [...damageDescription.matchAll(/@abilities\.(str|dex|int|con|wis|cha)\.mod/gm)];
                for (let j = 0; j < abilitiesModMatches.length; j++)
                {
                    let abilitiesDescription = abilitiesModMatches[j][0];
                    let newAbilitiesDescription = abilitiesDescription.replaceAll("@abilities.", "parentDataObject.abilities.");
                    let abilitiesModValue = eval(newAbilitiesDescription);
                    damageDescription = damageDescription.replaceAll(abilitiesDescription, abilitiesModValue);
                }

                let totalAverageRollResult = NPCActor5e.getAverageDamageFromDescription(damageDescription, abilityModValue);

                totalDamageForAttack += totalAverageRollResult;
            }

            let scalingObject = spellDataObject.scaling;
            if (scalingObject && scalingObject.mode === "cantrip")
            {
                let cantripMultiplier = this.getCantripMultiplier();
                totalDamageForAttack = totalDamageForAttack * cantripMultiplier;
            }

            if (totalDamageForAttack === 0)
            {
                return;
            }
        }

        let currentAttackResult = {};
        currentAttackResult["averagedamage"] = totalDamageForAttack;
        currentAttackResult["attackobject"] = spellObject;
        let isProficient = spellDataObject.prof.hasProficiency;
        let attackBonus = 0;
        if (isProficient)
        {
            attackBonus += spellDataObject.prof.flat;
        }

        attackBonus += abilityModValue;

        if (spellObject.hasSave)
        {
            attackBonus = NPCActor5e.getSaveDC(spellObject) - 10;
        }
        currentAttackResult["attackbonustohit"] = attackBonus;
        currentAttackResult["numberofattacks"] = 1;
        currentAttackResult["hasareaofeffect"] = spellObject.hasAreaTarget;
        currentAttackResult["attackdescription"] = spellObject.name;
        if (isNaN(attackBonus))
        {
            return;
        }
        return currentAttackResult;
    }

    static getActivitiesAverageDamage(activities, parentDataObject)
    {
        let totalDamageForAttack = 0;
        const spellSaveActivity = activities.find(a => a.type === "save");
        if (spellSaveActivity)
        {
            let abilityModType = spellSaveActivity.save.ability;
            let abilityModValue = !abilityModType ? 0 : eval("parentDataObject.abilities." + abilityModType + ".mod");
            spellSaveActivity.damage.parts.forEach(dp => totalDamageForAttack += NPCActor5e.getAverageDamageFromDescription(dp.formula, abilityModValue));
        }
        const damageActivity = activities.find(a => a.type === "damage");
        if (damageActivity)
        {
            damageActivity.damage.parts.forEach(dp => totalDamageForAttack += NPCActor5e.getAverageDamageFromDescription(dp.formula, 0));
        }
        const attackActivity = activities.find(a => a.type === "attack");
        if (attackActivity)
        {
            let abilityModType = attackActivity.attack.ability;
            let abilityModValue = !abilityModType ? 0 : eval("parentDataObject.abilities." + abilityModType + ".mod");
            attackActivity.damage.parts.forEach(dp => totalDamageForAttack += NPCActor5e.getAverageDamageFromDescription(dp.formula, abilityModValue));
            if (attackActivity.damage.includeBase)
            {
                totalDamageForAttack += abilityModValue;
            }
        }

        return totalDamageForAttack;
    }

    guessActorMultiAttack(attackList, multiAttackDescription)
    {
        let firstAttack = attackList.find(a => a.type === "weapon");
        let actualNumber = 1;
        let numberMatch = multiAttackDescription.match(NPCActor5e.numberRegex);
        if (numberMatch)
        {
            actualNumber = GeneralUtils.getIntegerFromWordNumber(numberMatch[0]);
        }

        return this.getInfoForAttackObject(firstAttack, actualNumber);
    }

    getInfoForAttackObject(attackObject, numberOfAttacks)
    {
        let attackDataObject = FoundryUtils.getDataObjectFromObject(attackObject);
        let parentDataObject = FoundryUtils.getDataObjectFromObject(attackObject.parent);
        let abilityModValue = 0;
        let totalDamageForAttack = 0;

        if (FoundryUtils.isDND5eVersion4() || FoundryUtils.isDND5eVersion5())
        {
            totalDamageForAttack += NPCActor5e.getActivitiesAverageDamage(attackDataObject.activities, parentDataObject);
        }
        else
        {
            let abilityModType = attackObject.abilityMod;
            abilityModValue = !abilityModType ? 0 : eval("parentDataObject.abilities." + abilityModType + ".mod");
            let damageList = attackDataObject.damage.parts;
            if (damageList.length === 0 && attackDataObject.formula != "")
            {
                let damageDescription = attackDataObject.formula;
                damageDescription = damageDescription.toLowerCase().replaceAll(/\[.+\]/gm, "");

                let totalAverageRollResult = NPCActor5e.getAverageDamageFromDescription(damageDescription, abilityModValue);
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
                    let abilitiesModMatches = [...damageDescription.matchAll(/@abilities\.(str|dex|int|con|wis|cha)\.mod/gm)];
                    for (let j = 0; j < abilitiesModMatches.length; j++)
                    {
                        let abilitiesDescription = abilitiesModMatches[j][0];
                        let newAbilitiesDescription = abilitiesDescription.replaceAll("@abilities.", "parentDataObject.abilities.");
                        let abilitiesModValue = eval(newAbilitiesDescription);
                        damageDescription = damageDescription.replaceAll(abilitiesDescription, abilitiesModValue);
                    }

                    let totalAverageRollResult = NPCActor5e.getAverageDamageFromDescription(damageDescription, abilityModValue);
                    if (isNaN(totalAverageRollResult))
                    {
                        if (damageType != "healing")
                        {
                            console.warn(`No damage for ${this.actorname}, ${this.actorid}, attack ${attackObject.name}, damage type ${damageType}`);
                        }
                        continue;
                    }
                    totalDamageForAttack += totalAverageRollResult;
                }
            }
        }

        let currentAttackResult = {};
        currentAttackResult["averagedamage"] = totalDamageForAttack;
        currentAttackResult["attackobject"] = attackObject;
        let isProficient = attackDataObject.proficient;
        let attackBonus = 0;
        if (isProficient)
        {
            attackBonus += attackDataObject.prof.flat;
        }

        attackBonus += abilityModValue;

        if (attackObject.hasSave)
        {
            attackBonus = NPCActor5e.getSaveDC(attackObject) - 10;
        }
        currentAttackResult["attackbonustohit"] = attackBonus;
        currentAttackResult["numberofattacks"] = numberOfAttacks;
        currentAttackResult["hasareaofeffect"] = attackObject.hasAreaTarget;
        currentAttackResult["attackdescription"] = attackObject.name;

        if (isNaN(attackBonus) || isNaN(numberOfAttacks) || isNaN(totalDamageForAttack))
        {
            console.warn(`Invalid attack data for ${this.actorname}, ${this.actorid}. Average damage: ${currentAttackResult.averagedamage}, Attack Bonus: ${currentAttackResult.attackbonustohit}, Number of Attacks: ${currentAttackResult.numberofattacks}`);
        }

        return currentAttackResult;
    }

    static getSaveDC(attackObject)
    {
        if (FoundryUtils.isDND5eVersion4() || FoundryUtils.isDND5eVersion5())
        {
            let saveActivity = attackObject.system.activities.find(a => a.type === "save");
            if (saveActivity)
            {
                return saveActivity.save.dc.value;
            }
            else
            {
                console.warn(`Unable to find save activity for ${attackObject.name}`);
                return 0;
            }
        }
        else
        {
            return FoundryUtils.getDataObjectFromObject(attackObject).save.dc;
        }
    }

    getCantripMultiplier()
    {
        let spellLevel = FoundryUtils.getDataObjectFromObject(this.actorObject).details.spellLevel;

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

    static getAverageDamageFromDescription(damageDescription, abilityModValue)
    {
        damageDescription = damageDescription.replaceAll("@mod", abilityModValue);
        let matches = [...damageDescription.matchAll(/((?<diceCount>\d+)d(?<diceType>\d+))/gm)];
        for (let i = 0; i < matches.length; i++)
        {
            let matchResult = matches[i];
            let entireMatchValue = matchResult[0];
            let matchResultGroups = matchResult.groups;
            let diceCount = matchResultGroups.diceCount;
            let diceType = matchResultGroups.diceType;
            let diceTypeAverage = (parseInt(diceType) + 1) / 2;
            let totalDiceRollAverage = diceTypeAverage * diceCount;
            damageDescription = damageDescription.replaceAll(entireMatchValue, totalDiceRollAverage);
        }

        let spellDamageQualifierMatches = [...damageDescription.matchAll(/\[.+\]/gm)];

        for (let i = 0; i < spellDamageQualifierMatches.length; i++)
        {
            let matchResult = spellDamageQualifierMatches[i];
            let entireMatchValue = matchResult[0];
            damageDescription = damageDescription.replaceAll(entireMatchValue, "");
        }

        // deal with modules that use a Math.floor function but Math. isn't specified
        damageDescription = damageDescription.replaceAll("floor(", "Math.floor(");
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

    getXP()
    {
        let actorXP = SFLOCALCONSTS.ENCOUNTER_XP_CHALLENGE_RATING_MAPPING[`${this.actorcr}`];

        if (!actorXP)
        {
            return 0;
        }

        return actorXP;
    }

    static getCRFromActorObject(actor)
    {
        return FoundryUtils.getSystemVariableForObject(actor, "CreatureCR");
    }
}
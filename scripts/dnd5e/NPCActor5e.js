class NPCActor5e {
    static numberRegex = `(?<numberOfAttacks>one|two|three|four|five|six|seven|eight|nine|ten|once|twice|thrice|1|2|3|4|5|6|7|8|9)`;
    constructor(data) {
        this.actor = data;
        this.actorname = this.actor.data.name;
        this.actorid = this.actor.data._id;
        this.actorxp = NPCActor5e.getXPFromActorObject(this.actor);
        this.actorcr = NPCActor5e.getCRFromActorObject(this.actor);
        this.creaturetype = ActorUtils.getCreatureTypeForActor(this.actor);
        this.environment = ActorUtils.getActorEnvironments(this.actor);
        this.combatdata = this.getCombatDataPerRound();
    }

    getActorEnvironments() {
        let environment = this.actor.data.data.details.environment;
        if (!environment || environment.trim() === "") {
            environment = "Any";
        }

        let environmentArray = environment.split(",");
        environmentArray = environmentArray.map(e => e.trim());
        return environmentArray;
    }

    getCombatDataPerRound() {
        let allAttackResultObjects = [];
        let actor = this.actor;
        try
        {
            let attackList = actor.items.filter(i => (i.type.toLowerCase() === "weapon" || i.type.toLowerCase() === "feat")
                && i.name.toLowerCase() != "multiattack"
                && i.hasAttack);
    
            // let spellList = actor.items.filter(i => i.type.toLowerCase() === "spell");
            let multiAttack = actor.items.filter(i => i.name.toLowerCase() === "multiattack");
            if (multiAttack && multiAttack.length > 0) {
                // Description types supported:
                // <p>The imperial ghoul makes one bite attack and one claws attack.</p>
                // <p>the dragon can use its frightful presence. it then makes three attacks: one with its bite and two with its claws.</p>'
                let multiAttackDescription = NPCActor5e.getDescriptionFromItemObject(multiAttack[0]).toLowerCase();
    
                let parsedAttackList = [];
                for (let i = 0; i < attackList.length; i++) {
                    let currentAttack = attackList[i];
                    let attackName = currentAttack.name.toLowerCase();
                    let sanitizedAttackName = attackName.replaceAll(/\(.+\)/gm, "").trim();
                    sanitizedAttackName = sanitizedAttackName.replaceAll(/\+\d/gm, "").trim();
                    sanitizedAttackName = sanitizedAttackName.replaceAll(/\)/gm, "").trim(); // currently creatures with a recharge attack have the recharge attack named incorrectly
                    // skip if we've removed anything interesting from the attack name
                    if (sanitizedAttackName === "") {
                        continue;
                    }
                    parsedAttackList.push(sanitizedAttackName);
                }
                parsedAttackList.push("melee attack");
                let parsedAttackRegex = parsedAttackList.join("|");
    
                let attackMatches = [...multiAttackDescription.matchAll(`(?<attackDescription>${parsedAttackRegex})`)];
                let numberMatches = [...multiAttackDescription.matchAll(this.numberRegex)];
                let orMatches = [...multiAttackDescription.matchAll(`(?<qualifiers> or )`)];
    
                let previousAttackIndex = -1;
                for (let i = 0; i < attackMatches.length; i++) {
                    let currentAttackMatch = attackMatches[i];
                    let attackObject = attackList.find(a => a.name.toLowerCase().match(currentAttackMatch[0]));
                    if (!attackObject || currentAttackMatch[0] === "melee attack") {
                        attackObject = attackList.find(a => a.type === "weapon");
                    }
                    let currentAttackIndex = currentAttackMatch.index;
                    let numberMatchesBeforeAttack = numberMatches.filter(n => n.index < currentAttackIndex);
                    let correctNumberMatch = numberMatchesBeforeAttack[numberMatchesBeforeAttack.length - 1];
                    let actualNumberOfAttacks = 1;
                    if (correctNumberMatch) {
                        actualNumberOfAttacks = GeneralUtils.getIntegerFromWordNumber(correctNumberMatch[0]);
                    }
                    let currentAttackObject = NPCActor5e.getInfoForAttackObject(attackObject, actualNumberOfAttacks);
    
                    if (!currentAttackObject || currentAttackObject.averagedamage === 0) {
                        // Skip because attack is boring and likely is some type of charm feature. 
                        continue;
                    }
    
                    if (previousAttackIndex != -1) {
                        let previousAttackObject = allAttackResultObjects.pop();
    
                        // Check to see if an or is between the previous attack object and the current
                        let orMatchesBetweenAttacks = orMatches.filter(o => o.index > previousAttackIndex && o.index < currentAttackIndex);
                        if (orMatchesBetweenAttacks.length > 0) {
                            // decide which object is better and push that one.
                            if ((currentAttackObject.numberofattacks * currentAttackObject.averagedamage) >
                                (previousAttackObject.numberofattacks * previousAttackObject.averagedamage)) {
                                allAttackResultObjects.push(currentAttackObject);
                            }
                            else {
                                allAttackResultObjects.push(previousAttackObject);
                            }
                        }
                        else {
                            allAttackResultObjects.push(previousAttackObject);
                            allAttackResultObjects.push(currentAttackObject);
                        }
                    }
                    else {
                        allAttackResultObjects.push(currentAttackObject)
                        // console.log(`Adding attack ${attackObject.name} for ${actor.name}`);
                    }
                    previousAttackIndex = currentAttackIndex;
                }
    
                if (allAttackResultObjects.length === 0) {
                    let guessedAttack = NPCActor5e.guessActorMultiAttack(attackList, multiAttackDescription);
                    if (guessedAttack) {
                        console.log(`Attempted to guess attack for ${actor.name}: ${guessedAttack.numberofattacks} ${guessedAttack.attackdescription} attacks.`)
                        allAttackResultObjects.push(guessedAttack);
                    }
                }
            }
            else {
                let bestAttackObject = null;
                let maxDamage = 0;
                for (let i = 0; i < attackList.length; i++) {
                    try {
                        let currentAttackObject = NPCActor5e.getInfoForAttackObject(attackList[i], 1);
                        let totalDamage = currentAttackObject.averagedamage * currentAttackObject.numberofattacks;
                        if (maxDamage < totalDamage) {
                            bestAttackObject = currentAttackObject;
                            maxDamage = totalDamage;
                        }
                    }
                    catch (error) {
                        console.warn(`Unable to parse attack ${attackList[i].name}: ${error}`);
                    }
                }
                allAttackResultObjects.push(bestAttackObject);
            }
    
            if (allAttackResultObjects.length === 0) {
                console.warn(`Parsed no attack data for actor: ${actor.name}`);
            }
        }
        catch (error)
        {
            console.warn(`Error parsing attack information for ${actor.name}, ${actor.id}. Error: ${error}`);
        }
        return allAttackResultObjects;
    }

    getSpellDataPerRound() {
        let allSpellResultObjects = [];
        let actor = this.actor;
        try
        {
            let spellList = actor.items.filter(i => (i.type.toLowerCase() === "spell") && i.hasAttack);
            let bestSpellObject = null;
            let maxDamage = 0;
            for (let i = 0; i < spellList.length; i++) {
                try {
                    let currentSpellObject = NPCActor5e.getInfoForAttackObject(spellList[i], 1);
                    let totalDamage = currentAttackObject.averagedamage * currentAttackObject.numberofattacks;
                    if (maxDamage < totalDamage) {
                        bestSpellObject = currentAttackObject;
                        maxDamage = totalDamage;
                    }
                }
                catch (error) {
                    console.warn(`Unable to parse attack ${spellList[i].name}: ${error}`);
                }
            }
            allAttackResultObjects.push(bestSpellObject);
        }
        catch (error)
        {

        }
        return allSpellResultObjects;
    }

    static getSpellCastingBonus()
    {
        let data = ActorUtils.getDataObjectFromObject(this.actor);
        let spellCastingAttribute = data.attributes.spellcasting;
        let spellCastingAttributeScore = eval(`data.abilities.${spellCastingAttribute}.value`);

    }

    static getModifierFromAttributeScore(attributeScore)
    {
        let modifier = Math.floor((attributeScore - 10) / 2);
        return modifier;
    }

    static getInfoForSpellObject(attackObject, actor) {
        let abilityModType = attackObject.abilityMod;
        let abilityModValue = eval("attackObject.parent.data.data.abilities." + abilityModType + ".mod");
        let damageList = FoundryUtils.getDataObjectFromObject(attackObject).damage.parts;

        let totalDamageForAttack = 0;
        for (let i = 0; i < damageList.length; i++) {
            let damageArray = damageList[i];
            let damageDescription = damageArray[0];
            let damageType = damageArray[1];
            damageDescription = damageDescription.toLowerCase().replaceAll(`[${damageType.toLowerCase()}]`, "");
            let abilitiesModMatches = [...damageDescription.matchAll(/@abilities\.(str|dex|int|con|wis|cha)\.mod/gm)];
            for (let j = 0; j < abilitiesModMatches.length; j++) {
                let abilitiesDescription = abilitiesModMatches[j][0];
                let newAbilitiesDescription = abilitiesDescription.replaceAll("@abilities.", "attackObject.parent.data.data.abilities.");
                let abilitiesModValue = eval(newAbilitiesDescription);
                damageDescription = damageDescription.replaceAll(abilitiesDescription, abilitiesModValue);
            }

            let totalAverageRollResult = NPCActor5e.getAverageDamageFromDescription(damageDescription, abilityModValue);

            totalDamageForAttack += totalAverageRollResult;
        }
        let currentAttackResult = {};
        currentAttackResult["averagedamage"] = totalDamageForAttack;
        let isProficient = attackObject.data.data.proficient;
        let attackBonus = 0;
        if (isProficient) {
            attackBonus += attackObject.data.data.prof.flat;
        }

        attackBonus += abilityModValue;
        currentAttackResult["attackbonustohit"] = attackBonus;
        currentAttackResult["numberofattacks"] = numberOfAttacks;
        currentAttackResult["attackdescription"] = attackObject.name;
        return currentAttackResult;
    }

    static guessActorMultiAttack(attackList, multiAttackDescription) {
        let firstAttack = attackList.find(a => a.type === "weapon");
        let actualNumber = 1;
        let numberMatch = multiAttackDescription.match(this.numberRegex);
        if (numberMatch) {
            actualNumber = GeneralUtils.getIntegerFromWordNumber(numberMatch[0]);
        }

        return NPCActor5e.getInfoForAttackObject(firstAttack, actualNumber);
    }

    static getInfoForAttackObject(attackObject, numberOfAttacks) {
        let abilityModType = attackObject.abilityMod;
        let abilityModValue = eval("attackObject.parent.data.data.abilities." + abilityModType + ".mod");
        let damageList = FoundryUtils.getDataObjectFromObject(attackObject).damage.parts;

        let totalDamageForAttack = 0;
        for (let i = 0; i < damageList.length; i++) {
            let damageArray = damageList[i];
            let damageDescription = damageArray[0];
            let damageType = damageArray[1];
            damageDescription = damageDescription.toLowerCase().replaceAll(`[${damageType.toLowerCase()}]`, "");
            let abilitiesModMatches = [...damageDescription.matchAll(/@abilities\.(str|dex|int|con|wis|cha)\.mod/gm)];
            for (let j = 0; j < abilitiesModMatches.length; j++) {
                let abilitiesDescription = abilitiesModMatches[j][0];
                let newAbilitiesDescription = abilitiesDescription.replaceAll("@abilities.", "attackObject.parent.data.data.abilities.");
                let abilitiesModValue = eval(newAbilitiesDescription);
                damageDescription = damageDescription.replaceAll(abilitiesDescription, abilitiesModValue);
            }

            let totalAverageRollResult = NPCActor5e.getAverageDamageFromDescription(damageDescription, abilityModValue);

            totalDamageForAttack += totalAverageRollResult;
        }
        let currentAttackResult = {};
        currentAttackResult["averagedamage"] = totalDamageForAttack;
        let isProficient = attackObject.data.data.proficient;
        let attackBonus = 0;
        if (isProficient) {
            attackBonus += attackObject.data.data.prof.flat;
        }

        attackBonus += abilityModValue;
        currentAttackResult["attackbonustohit"] = attackBonus;
        currentAttackResult["numberofattacks"] = numberOfAttacks;
        currentAttackResult["attackdescription"] = attackObject.name;
        return currentAttackResult;
    }

    static getAverageDamageFromDescription(damageDescription, abilityModValue) {
        damageDescription = damageDescription.replaceAll("@mod", abilityModValue);
        let matches = [...damageDescription.matchAll(/((?<diceCount>\d+)d(?<diceType>\d+))/gm)];
        for (let i = 0; i < matches.length; i++) {
            let matchResult = matches[i];
            let entireMatchValue = matchResult[0];
            let matchResultGroups = matchResult.groups;
            let diceCount = matchResultGroups.diceCount;
            let diceType = matchResultGroups.diceType;
            let diceTypeAverage = (parseInt(diceType) + 1) / 2;
            let totalDiceRollAverage = diceTypeAverage * diceCount;
            damageDescription = damageDescription.replaceAll(entireMatchValue, totalDiceRollAverage);
        }

        // deal with modules that use a Math.floor function but Math. isn't specified
        damageDescription = damageDescription.replaceAll("floor(", "Math.floor(");
        let totalAverageRollResult = eval(damageDescription);
        return totalAverageRollResult;
    }

    static getActorTraits(actor) {
        let characterTraits = {};

        if (actor.data.data.traits.ci.value.length > 0) {
            characterTraits["conditionimmunities"] = actor.data.data.traits.ci.value;
        }
        if (actor.data.data.traits.di.value.length > 0) {
            characterTraits["damageimmunities"] = actor.data.data.traits.di.value;
        }
        if (actor.data.data.traits.dr.value.length > 0) {
            characterTraits["damageresistances"] = actor.data.data.traits.dr.value;
        }
        if (actor.data.data.traits.dv.value.length > 0) {
            characterTraits["damagevulnerabilities"] = actor.data.data.traits.dv.value;
        }

        let actorSpells = actor.data.data.spells;
        let maxSpellLevel = 0;
        for (let i = 1; i <= 9; i++) {
            let currentSpellLevelObject = eval("actorsSpells.spell" + i);
            if (currentSpellLevelObject.max > 0) {
                characterTraits["spellcaster"] = true;
                maxSpellLevel = i;
            }
        }

        // deal with pact magic
        if (actorSpells.pact.max > 0) {
            characterTraits["spellcaster"] = true;
            let pactLevel = actorSpells.pact.level;
            if (maxSpellLevel > pactLevel) {
                maxSpellLevel = pactLevel;
            }
        }
        if (maxSpellLevel > 0) {
            characterTraits["maxspelllevel"] = maxSpellLevel;
            characterTraits["spelldamagetypelist"] = spellList.map(s => s.data.data.damage.parts).filter(p => p.length > 0).map(z => z[0][1]).filter(t => t != "");
        }

        if (actor.data.data.resources.lair.value) {
            characterTraits["lairactions"] = true;
        }

        if (actor.data.data.resources.legact.max > 0) {
            characterTraits["legendaryactions"] = true;
        }

        if (actor.data.data.resources.legres.max > 0) {
            characterTraits["legendaryresistances"] = true;
        }

        let spellList = actor.items.filter(i => i.type === "spell");
        if (spellList.filter(s => s.hasAreaTarget && s.hasDamage && s.name.toLowerCase() != "sleep").length > 0) {
            characterTraits["hasAOESpell"] = true;
        }
    }

    static getDescriptionFromItemObject(item) {
        return FoundryUtils.getDataObjectFromObject(item).description.value;
    }

    static getXPFromActorObject(actor) {
        return FoundryUtils.getDataObjectFromObject(actor).details.xp.value;
    }

    static getCRFromActorObject(actor) {
        return FoundryUtils.getDataObjectFromObject(actor).details.cr;
    }
}
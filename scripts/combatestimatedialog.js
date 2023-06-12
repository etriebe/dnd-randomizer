import { FoundryUtils } from "./utils/FoundryUtils.js";
import { GeneralUtils } from "./utils/GeneralUtils.js";
import { ActorUtils } from "./utils/ActorUtils.js";
import { SFLocalHelpers } from "./localmodule.js";

export class CombatEstimateDialog extends FormApplication
{
	constructor(hostileCombatants)
	{
		super();
		this.friendlyCombatants = [];
		this.hostileCombatants = [];
		this.dataPassedIn = false;

		// if hostileCombatants are being passed in, we assume this is being called from SFDialog
		if (hostileCombatants)
		{
			this.dataPassedIn = true;
			for (let actorObject of hostileCombatants)
			{
				for (let i = 0; i < actorObject.quantity; i++)
				{
					this.hostileCombatants.push(actorObject.npcactor);
				}
			}

			const playerCharacters = SFLocalHelpers.getActivePlayersWithFilterDialogApplied();

			for (let actorObject of playerCharacters)
			{
				const pcObject = ActorUtils.getPCActorObject(actorObject);
				this.friendlyCombatants.push(pcObject);
			}
		}
		this.friendlyExpectedDamages = [];
		this.hostileExpectedDamages = [];
	}

	static get defaultOptions()
	{
		let dialogTemplate = `modules/dnd-randomizer/templates/CombatEstimateDialog.hbs`;
		return {
			...super.defaultOptions,
			title: game.i18n.localize('Combat Estimate'),
			id: "CombatEstimateDialog",
			template: dialogTemplate,
			resizable: true,
			width: window.innerWidth > 800 ? 800 : window.innerWidth - 100,
			height: window.innerHeight > 900 ? 900 : window.innerHeight - 100
		};
	}

	async activateListeners(html)
	{
		super.activateListeners(html);
		const _this = this;
		await this.populateCombatants();
	}

	async populateCombatants()
	{
		this.friendlyExpectedDamages = [];
		this.hostileExpectedDamages = [];
		const html = this.element;
		let $friendsList = html.find('#friendly-combatants ul').first();
		let $hostilesList = html.find('#hostile-combatants ul').first();
		if (!game.combat || !game.combat.isActive)
		{
			console.log(`No combat active.`);
			return;
		}

		let combatants = game.combat.combatants;

		if (!this.dataPassedIn)
		{
			this.friendlyCombatants = [];
			this.hostileCombatants = [];
	
			for (let combatant of combatants)
			{
				if (!combatant.token)
				{
					continue;
				}
	
				let combatantDisposition = FoundryUtils.getCombatantDisposition(combatant);
	
				let actorObject = null;
				// Disposition is 1 for friendly, 0 for neutral, -1 for hostile
				switch (combatantDisposition)
				{
					case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
						console.log(`Combatant ${combatant.name} is friendly`);
						actorObject = ActorUtils.getPCTokenObject(combatant.token);
						this.friendlyCombatants.push(actorObject);
						break;
					case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
						console.log(`Combatant ${combatant.name} is neutral`);
						break;
					case CONST.TOKEN_DISPOSITIONS.HOSTILE:
						console.log(`Combatant ${combatant.name} is hostile`);
						actorObject = ActorUtils.getTokenObject(combatant.token);
						await actorObject.analyzeActor();
						this.hostileCombatants.push(actorObject);
						break;
					default:
						console.log(`Combatant ${combatant.name} has unexpected state.`);
						break;
				}
			}
		}

		for (let actorObject of this.friendlyCombatants)
		{
			let combatSummaryHTML = this.getActorCombatSummary(actorObject, this.hostileCombatants, this.friendlyExpectedDamages);
			let actorLink = FoundryUtils.getActorLink(actorObject);
			// let actorLink = TextEditor.enrichHTML(actorObject.actor.link);
			$friendsList.append(`
				<li class="combatant-friendly">
					<div class="player-details">
					<span class="creature-button">${actorLink}</span>
					<br/>
					${combatSummaryHTML}
					</div>
				</li>`);
		}
		let $friendlySummary = html.find('#friendly-summary').first();
		$friendlySummary.append(this.getCombatSummary(this.friendlyExpectedDamages, this.hostileCombatants));

		for (let actorObject of this.hostileCombatants)
		{
			let combatSummaryHTML = this.getActorCombatSummary(actorObject, this.friendlyCombatants, this.hostileExpectedDamages);
			let actorLink = FoundryUtils.getActorLink(actorObject);
			$hostilesList.append(`
				<li class="combatant-hostile">
					<div class="player-details">
					<span class="creature-button">${actorLink}</span>
					<br/>
					${combatSummaryHTML}
					</div>
				</li>`);
		}
		let $hostilesSummary = html.find('#hostile-summary').first();
		$hostilesSummary.append(this.getCombatSummary(this.hostileExpectedDamages, this.friendlyCombatants));
	}

	getActorCombatSummary(actorObject, enemyCombatants, expectedDamagesList)
	{
		let combatSummaryHTML = ``;
		if (actorObject.combatdata.length === 0)
		{
			combatSummaryHTML = "Unable to read combat summary";
			return combatSummaryHTML;
		}

		let attackNumber = 1;
		combatSummaryHTML += `<ul class="actor-attack-summary">`;
		let totalExpectedDamage = 0;
		for (let i = 0; i < actorObject.combatdata.length; i++)
		{
			let currentAttack = actorObject.combatdata[i];
			let chanceToHit = this.getAttackChanceToHit(currentAttack, enemyCombatants);

			if (!chanceToHit)
			{
				console.warn(`Unable to determine how likely attack ${currentAttack.attackdescription} is to hit so skipping.`);
				continue;
			}

			let halfDamageOnSave = this.getAttackHalfDamageOnSave(currentAttack);

			let averageDamageList = [];
			for (let j = 0; j < enemyCombatants.length; j++)
			{
				let currentEnemy = enemyCombatants[j];
				let averageDamageWithResistance = 0;
				if (currentAttack.isspecial)
				{
					averageDamageWithResistance = currentAttack;
				}
				else
				{
					averageDamageWithResistance = currentAttack.isspell ?
						ActorUtils.getInfoForSpellObject(currentAttack.attackobject, actorObject, currentEnemy) :
						ActorUtils.getInfoForAttackObject(currentAttack.attackobject, currentAttack.numberofattacks, actorObject, currentEnemy);
				}
				averageDamageList.push(averageDamageWithResistance.averagedamage);
			}
			let averageDamage = GeneralUtils.getArrayAverage(averageDamageList);

			let expectedDamage = (averageDamage * currentAttack.numberofattacks * chanceToHit);
			if (halfDamageOnSave)
			{
				expectedDamage = expectedDamage + (averageDamage * currentAttack.numberofattacks * (1 - chanceToHit)) / 2;
			}

			// assume 2 targets get hit with any area of effect if there are more than one enemy combatant
			if (currentAttack.hasareaofeffect && enemyCombatants.length > 1)
			{
				expectedDamage = expectedDamage * 2;
			}

			if (currentAttack.areaofeffecttargets)
			{
				let actualTargetCount = Math.min(enemyCombatants.length, currentAttack.areaofeffecttargets);
				expectedDamage = expectedDamage * actualTargetCount;
			}

			if (currentAttack.chancetouseattack)
			{
				expectedDamage = expectedDamage * currentAttack.chancetouseattack;
			}

			totalExpectedDamage += expectedDamage;
			combatSummaryHTML += `<li class="single-attack"><div>`;
			// combatSummaryHTML += FoundryUtils.getItemLink(currentAttack.attackobject);
			combatSummaryHTML += `<span class="encounter-attackdescription">${currentAttack.attackdescription}</span>`;
			combatSummaryHTML += `<span class="encounter-numberofattacks"> x ${currentAttack.numberofattacks}</span>`;
			combatSummaryHTML += `<span class="encounter-averagedamage">AvDmg: ${currentAttack.averagedamage * currentAttack.numberofattacks}</span>`;
			combatSummaryHTML += `<span class="encounter-percentchance">% Hit: ${(chanceToHit * 100).toFixed(0)}%</span>`;
			if (currentAttack.chancetouseattack)
			{
				combatSummaryHTML += `<span class="encounter-chancetouse">% Use: ${(currentAttack.chancetouseattack * 100).toFixed(0)}</span>`;
			}
			combatSummaryHTML += `<span class="encounter-expecteddamage">ExDmg: ${expectedDamage.toFixed(1)}</span>`;
			combatSummaryHTML += `</div></li>`;
			attackNumber++;
		}
		combatSummaryHTML += `</ul>`;
		expectedDamagesList.push(totalExpectedDamage);
		return combatSummaryHTML;
	}

	getCombatSummary(summaryStats, enemyCombatants)
	{
		let combatSummaryHTML = ``;
		let totalExpectedDamage = 0;
		summaryStats.map(s => totalExpectedDamage += s);
		let totalEnemyHP = this.getTotalCurrentEnemyHP(enemyCombatants);
		let expectedRoundsToFinish = Math.ceil(totalEnemyHP / totalExpectedDamage);
		combatSummaryHTML += `<span class="encounter-expecteddamage">ExDmg: ${totalExpectedDamage.toFixed(1)} dmg</span>`;
		combatSummaryHTML += `<span class="encounter-enemyhp">Enemy HP: ${totalEnemyHP}</span>`;
		combatSummaryHTML += `<span class="encounter-roundstodown">Rounds to down: ${expectedRoundsToFinish}</span>`;
		return combatSummaryHTML;
	}

	getAttackChanceToHit(currentAttack, enemyCombatants)
	{
		if (!isNaN(currentAttack.attackbonustohit))
		{
			let attackBonus = currentAttack.attackbonustohit;
			let attackChances = [];
			let attackChanceTotal = 0;
			for (let i = 0; i < enemyCombatants.length; i++)
			{
				let currentEnemy = enemyCombatants[i];
				let enemyArmorClass = ActorUtils.getActorArmorClass(currentEnemy.actorObject);
				let totalAvailableRollsToHit = Math.min(20 - (enemyArmorClass - 1) + attackBonus, 19); // a natural 1 always misses so there should only be 19 possible rolls that could hit
				let chanceToHit = totalAvailableRollsToHit / 20.0;
				attackChanceTotal += chanceToHit;
				attackChances.push(chanceToHit);
			}
			let averageChanceToHit = attackChanceTotal / attackChances.length;
			return averageChanceToHit;
		}
		else if (currentAttack.savingthrowtype)
		{
			// Saving throw workflow
			let savingThrowDC = currentAttack.savingthrowdc;
			let savingThrowType = currentAttack.savingthrowtype;
			let attackChances = [];
			for (let i = 0; i < enemyCombatants.length; i++)
			{
				let currentEnemy = enemyCombatants[i];
				let enemySavingThrowBonus = ActorUtils.getActorSavingThrowModifier(currentEnemy.actorObject, savingThrowType);
				let totalAvailableRollsToHit = savingThrowDC - 1 - enemySavingThrowBonus;
				let chanceToHit = totalAvailableRollsToHit / 20.0;
				attackChances.push(chanceToHit);
			}
			let averageChanceToHit = GeneralUtils.getArrayAverage(attackChances);
			return averageChanceToHit;
		}
	}

	getAttackHalfDamageOnSave(currentAttack)
	{
		let attackObject = currentAttack.attackobject;
		let attackObjectDataObject = FoundryUtils.getDataObjectFromObject(attackObject);
		let description = attackObjectDataObject.description.value;
		if (description.match(/\bhalf\b/gm))
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	getTotalCurrentEnemyHP(enemyCombatants)
	{
		let totalHP = 0;
		for (let i = 0; i < enemyCombatants.length; i++)
		{
			let currentEnemy = enemyCombatants[i];
			let currentEnemyHitPoints = ActorUtils.getActorCurrentHP(currentEnemy.token?.actor ?? currentEnemy.actorObject); // currentEnemy.actor.data.data.attributes.hp.value
			totalHP += currentEnemyHitPoints;
		}
		return totalHP;
	}
}

Hooks.once('ready', async () =>
{
	// canvas.CombatEstimateDialog = new CombatEstimateDialog();
});

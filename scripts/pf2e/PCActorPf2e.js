import { ActorUtils } from "../utils/ActorUtils.js";
export class PCActorPf2e {
    constructor(data) {
        this.actor = data;
        this.actorname = this.actor.name;
        this.actorid = this.actor._id;
        this.creaturetype = "PC";
        this.environment = ["Any"];
        this.combatdata = this.getCombatDataPerRound();
        this.classes = this.actor.class;
        this.level = this.getPlayerClassLevel();
        this.playerclasslist = this.getPlayerClassList();
    }

    getPlayerClassLevel() {
        let playerLevel = this.actor.level;
        return playerLevel;
    }

    getPlayerClassList() {
        let playerClassList = Object.keys(this.class.name);
        return playerClassList;
    }

    getCombatDataPerRound() {
        return [];
    }
}
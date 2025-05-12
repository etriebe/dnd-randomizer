import { SFCONSTS } from "../main.js";
import { SFLOCALCONSTS } from "../localconst.js";
export class FoundryUtils
{
  static isFoundryVersion10()
  {
    return game.version.match(/^10\./) != null;
  }

  static isFoundryVersion11()
  {
    return game.version.match(/^11\./) != null;
  }

  static isFoundryVersion12()
  {
    return game.version.match(/^12\./) != null;
  }

  static isFoundryVersion13()
  {
    return game.version.match(/^13\./) != null;
  }

  static isDND5eVersion5()
  {
    return game.system.version.match(/^5\./) != null;
  }

  static isDND5eVersion4()
  {
    return game.system.version.match(/^4\./) != null;
  }

  static getSystemId()
  {
    return game.system.id;
  }
  static getCompendiums()
  {
    return game.packs.filter((p) => !p.metadata.system || p.metadata.system === game.system.id);
  }

  static getCombatantDisposition(obj)
  {
    if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11() || FoundryUtils.isFoundryVersion12() || FoundryUtils.isFoundryVersion13())
    {
      return obj.token.disposition;
    }
    else
    {
      return obj.token.data.disposition;
    }
  }

  static getSystemVariableForObject(object, variableName)
  {
    let currentSystemVariableName = FoundryUtils.getSystemVariable(variableName);
    return getProperty(object, currentSystemVariableName);
    // return eval(`object.${currentSystemVariableName}`);
  }

  static getSystemVariable(variableName)
  {
    let currentSystem = game.system.id;
    let variableValues;
    if (FoundryUtils.isFoundryVersion13())
    {
      variableValues = SFLOCALCONSTS.SYSTEM_VARIABLES_V13[variableName];
    }
    else if (FoundryUtils.isFoundryVersion12())
    {
      variableValues = SFLOCALCONSTS.SYSTEM_VARIABLES_V12[variableName];
    }
    else if (FoundryUtils.isFoundryVersion11())
    {
      variableValues = SFLOCALCONSTS.SYSTEM_VARIABLES_V11[variableName];
    }
    else if (FoundryUtils.isFoundryVersion10())
    {
      variableValues = SFLOCALCONSTS.SYSTEM_VARIABLES_V10[variableName];
    }
    else
    {
      variableValues = SFLOCALCONSTS.SYSTEM_VARIABLES[variableName];
    }

    if (!variableValues)
    {
      console.error(`Unable to find variable name ${variableName} information`);
      return;
    }

    let currentSystemVariableValue = variableValues[currentSystem];
    if (!currentSystemVariableValue)
    {
      console.error(`Unable to find variable name ${variableName} for system ${currentSystem}`);
      return;
    }
    return currentSystemVariableValue;
  }

  static getDataObjectFromObject(obj)
  {
    if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11() || FoundryUtils.isFoundryVersion12() || FoundryUtils.isFoundryVersion13())
    {
      if (obj.system)
      {
        return obj.system;
      }
      else
      {
        return obj;
      }
    }
    else
    {
      if (obj.data.data)
      {
        return obj.data.data;
      }
      else
      {
        return obj.data;
      }
    }
  }

  static getTemplateDataObject(obj)
  {
    if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11() || FoundryUtils.isFoundryVersion12() || FoundryUtils.isFoundryVersion13())
    {
      return obj;
    }
    else
    {
      return obj.data;
    }
  }

  static getResultFromRollTable(rollTable, rollResult)
  {
    let rowSelected;
    for (let key in rollTable)
    {
      let value = rollTable[key];

      // if this is a single number
      if (key.indexOf("-") === -1)
      {
        let keyInteger = parseInt(key);
        if (rollResult === parseInt(key))
        {
          rowSelected = value;
          break;
        }
      }
      else
      {
        let rollRange = key.split("-");
        let lowerRange = parseInt(rollRange[0]);
        let higherRange = parseInt(rollRange[1]);

        if (lowerRange <= rollResult && rollResult <= higherRange)
        {
          rowSelected = value;
          break;
        }
      }
    }
    return rowSelected;
  }

  static getRandomItemFromRollTable(rollTable)
  {
    let lastRowInTableKeyValue = Object.keys(rollTable)[Object.keys(rollTable).length - 1];

    let maxNumberToRollFor;
    // if this is a single number
    if (lastRowInTableKeyValue.indexOf("-") === -1)
    {
      maxNumberToRollFor = lastRowInTableKeyValue;
    }
    else
    {
      let rollRange = lastRowInTableKeyValue.split("-");
      let higherRange = rollRange[1];

      maxNumberToRollFor = higherRange;
    }

    let randomItemNumber = Math.floor(Math.random() * maxNumberToRollFor) + 1;
    return FoundryUtils.getResultFromRollTable(rollTable, randomItemNumber);
  }

  static getRollResult(rollDescription)
  {
    let diceDescriptionParts = rollDescription.split("d");

    if (diceDescriptionParts.length != 2)
    {
      throw new Error(`Invalid dice description specified: ${rollDescription}`);
    }

    let numberOfDice = diceDescriptionParts[0];
    let diceSize = diceDescriptionParts[1];

    let totalDiceResult = 0;
    for (let i = 0; i < numberOfDice; i++)
    {
      totalDiceResult += Math.floor(Math.random() * diceSize) + 1;
    }

    return totalDiceResult;
  }

  // This function is replicating the functionality of enrichHTML
  // let actorLink = TextEditor.enrichHTML(actorObject.actor.link);

  static getActorLink(actor)
  {
    let useDefaultFoundryLinks = game.settings.get(SFCONSTS.MODULE_NAME, 'useDefaultLinkBehavior');
    if (useDefaultFoundryLinks)
    {
      if (actor.token?.actor?.link)
      {
        return actor.token.actor.toAnchor({classes: ["content-link"]}).outerHTML;
      }
      else if (actor.actorObject)
      {
        return actor.actorObject.toAnchor({classes: ["content-link"]}).outerHTML;
        /*
        return TextEditor.enrichHTML(
          actor.dynamicLink === null || actor.dynamicLink === undefined ? actor.actor.link : actor.dynamicLink,
          { async: false });
          */
      }
    }

    let actorID = actor.actorid;
    let actorName = actor.actorname;
    let compendiumName = actor.compendiumname;

    if (this.isFoundryVersion12() || FoundryUtils.isFoundryVersion13())
    {
      if (compendiumName)
      {
        const dataUUID = `Compendium.${compendiumName}.Actor.${actorID}`;
        // <a class="content-link sf-dialog-content-link" draggable="true" data-link="" data-uuid="Compendium.SharedData.monsters.Actor.MsT8BhZClVWRGfW5" data-id="MsT8BhZClVWRGfW5" data-type="Actor" data-pack="SharedData.monsters" data-tooltip="Non-Player Character Actor"><i class="fas fa-user"></i>Aboleth</a>
        // <a class="content-link sf-dialog-content-link" draggable="true" data-link="" data-uuid="Compendium.SharedData.monsters.QO4tXYALnDxHribl.Actor" data-id="QO4tXYALnDxHribl" data-type="Actor" data-pack="SharedData.monsters"><div class="actor-link-name"><i class="fas fa-user"></i> Cloud Giant Smiling One</div></a>
        return `<a class="content-link sf-dialog-content-link" draggable="true" data-link="" data-uuid="${dataUUID}" data-id="${actorID}" data-type="Actor" data-pack="${compendiumName}"><div class="actor-link-name"><i class="fas fa-user"></i> ${actorName}</div></a>`;
      }
      else
      {
        //<a class="content-link" draggable="true" data-link="" data-uuid="Actor.QRmxkNhh8xpisYUo" data-id="QRmxkNhh8xpisYUo" data-type="Actor" data-tooltip="Non-Player Character Actor"><i class="fas fa-user"></i>Drow Mage</a>
        return `<a class="content-link sf-dialog-content-link" draggable="true" data-type="Actor" data-uuid="Actor.${actorID}"><i class="fas fa-user"></i>${actorName}</a>`;
      }
    }
    else if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11() || FoundryUtils.isFoundryVersion12() || FoundryUtils.isFoundryVersion13())
    {
      if (compendiumName)
      {
        const dataUUID = `Compendium.${compendiumName}.${actorID}`;
        return `<a class="content-link sf-dialog-content-link" draggable="true" data-pack="${compendiumName}" data-uuid="${dataUUID}" data-id="${actorID}"><div class="actor-link-name"><i class="fas fa-user"></i> ${actorName}</div></a>`;
      }
      else
      {
        return `<a class="content-link sf-dialog-content-link" draggable="true" data-type="Actor" data-uuid="Actor.${actorID}"><i class="fas fa-user"></i>${actorName}</a>`;
      }
    }
    else
    {
      return `<a class="entity-link content-link sf-dialog-content-link" draggable="true" data-pack="${compendiumName}" data-id="${actorID}"><div class="actor-link-name"><i class="fas fa-user"></i> ${actorName}</div></a>`;
    }
  }

  static async getItemLink(item)
  {
    let useDefaultFoundryLinks = game.settings.get(SFCONSTS.MODULE_NAME, 'useDefaultLinkBehavior');
    if (useDefaultFoundryLinks)
    {
      return await TextEditor.enrichHTML(item.dynamicLink, { async: true });
    }

    let itemID = item.id;
    let itemName = item.name;
    let compendiumName = item.compendiumname;
    if (FoundryUtils.isFoundryVersion10() || FoundryUtils.isFoundryVersion11() || FoundryUtils.isFoundryVersion12() || FoundryUtils.isFoundryVersion13())
    {
      if (compendiumName)
      {
        const dataUUID = `Compendium.${compendiumName}.${itemID}`;
        return `<a class="content-link sf-dialog-content-link" draggable="true" data-pack="${compendiumName}" data-uuid="${dataUUID}" data-id="${itemID}"><i class="fas fa-user"></i> ${itemName}</a>`;
      }
      else
      {
        return `<a class="content-link sf-dialog-content-link" draggable="true" data-hash="undefined" data-uuid="Item.${itemID}" data-id="${itemID}" data-type="Item"><i class="fas fa-user"></i> ${itemName}</a>`;
      }
    }
    else
    {
      return `<a class="entity-link content-link sf-dialog-content-link" draggable="true" data-type="Item" data-entity="Item" data-id="${itemID}">${itemName}</a>`;
    }
  }

  static getFoundryDataFolder()
  {
    let source = (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) ? "forgevtt" : "data";
    return source;
  }
}
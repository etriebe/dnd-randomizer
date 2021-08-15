class SFHelpers{
    static getFolder(type){
        return game.settings.get(SFCONSTS.MODULE_NAME,`${type}Folder`)
      }
}
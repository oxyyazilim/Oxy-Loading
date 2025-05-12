-- Config verisini loading screen'e gönder
AddEventHandler('playerConnecting', function(_, _, deferrals)
    local source = source
    local loadingScreenData = {}
    
    deferrals.defer()
    
    loadingScreenData.update = Config.RecentUpdate
    loadingScreenData.gallery = Config.News
    loadingScreenData.keyboard = Config.KeyboardBindings
    loadingScreenData.staffs = Config.Staffs
    loadingScreenData.rules = Config.Rules
    loadingScreenData.social = Config.SocialMedia
    loadingScreenData.serverName = Config.ServerName
    loadingScreenData.customCursor = Config.CustomCursor
    loadingScreenData.player = {
        id = source,
        name = GetPlayerName(source)
    }
    loadingScreenData.defaultSong = Config.DefaultSong
    
    deferrals.handover(loadingScreenData)
    deferrals.done()
end)

print("^2OXY-Loading^7: Loading screen initialized on server side")
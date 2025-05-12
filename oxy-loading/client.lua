-- client.lua
-- Loading screen'in otomatik kapanmasını sağla
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(500)
        
        -- Oyuncunun tamamen yüklenip yüklenmediğini kontrol et
        if NetworkIsPlayerActive(PlayerId()) then
            -- Loading screen'i kapat
            ShutdownLoadingScreen()
            ShutdownLoadingScreenNui()
            
            -- Ekranın kapanması için biraz zaman tanı ve fade efekti ekle
            Citizen.Wait(1000)
            DoScreenFadeOut(0)
            Citizen.Wait(500)
            DoScreenFadeIn(1000)
            
            -- Döngüden çık
            break
        end
    end
end)
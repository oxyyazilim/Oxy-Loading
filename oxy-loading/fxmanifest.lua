fx_version 'cerulean'
game 'gta5'
author 'OXY'
description 'OXY Loading Screen'
version '1.0.0'

client_script 'client.lua'

loadscreen 'ui/index.html'
loadscreen_manual_shutdown 'yes'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js',
    'ui/config.js',  -- config.js dosyasını ekleyin
    'ui/img/*.png',
    'ui/music/*.mp3'
}
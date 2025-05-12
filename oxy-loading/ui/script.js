// FiveM NUI için gerekli değişkenler
let loadingData = CONFIG; // Doğrudan CONFIG'i loadingData olarak kullan
let player;
let loadingValue = 0;
let loadingInterval = null;
let simulatedLoading = false; // Gerçek yükleme verisi yoksa simülasyon yapılıp yapılmadığını takip et
let activeTab = 'news';

// YouTube API değişkenleri
let youtubePlayer;
let videoId;
let isMuted = false; // Ses durumunu takip etmek için

// Özel imleç
document.addEventListener('mousemove', function(e) {
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

document.addEventListener('mousedown', function() {
    const cursor = document.getElementById('custom-cursor');
    if (cursor) cursor.classList.add('active');
});

document.addEventListener('mouseup', function() {
    const cursor = document.getElementById('custom-cursor');
    if (cursor) cursor.classList.remove('active');
});

// Tarayıcıda otomatik müzik çalmak için müdahale
function attemptAutoPlay() {
    // Bu fonksiyon tarayıcının otomatik oynatma politikasını aşmak için kullanılır
    if (youtubePlayer) {
        youtubePlayer.unMute(); // Sesi aç
        isMuted = false; // Ses durumunu güncelle
        youtubePlayer.setVolume(50); // %50 ses seviyesi
        
        // Müzik kontrol butonlarını güncelle
        updateMusicControlButtons();
    }
}

// Müzik kontrol butonlarını güncelle
function updateMusicControlButtons() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    
    if (playPauseBtn) {
        const playPauseIcon = playPauseBtn.querySelector('i');
        if (playPauseIcon) {
            if (youtubePlayer && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            } else {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
        }
    }
    
    if (muteBtn) {
        const muteIcon = muteBtn.querySelector('i');
        if (muteIcon) {
            if (isMuted) {
                muteIcon.classList.remove('fa-volume-up');
                muteIcon.classList.add('fa-volume-mute');
            } else {
                muteIcon.classList.remove('fa-volume-mute');
                muteIcon.classList.add('fa-volume-up');
            }
        }
    }
}

// Simüle edilmiş yükleme çubuğu - sadece gerçek veri yoksa kullanılır
function startLoadingBar() {
    clearInterval(loadingInterval);
    
    loadingInterval = setInterval(() => {
        if (loadingValue >= 100) {
            clearInterval(loadingInterval);
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.textContent = 'Giriş Yapılıyor';
            }
            return;
        }
        
        // Simüle edilmiş yükleme hızı - başta hızlı, sona doğru yavaş
        const increment = 100 - loadingValue > 50 ? Math.random() * 3 : Math.random() * 0.5;
        loadingValue += increment;
        if (loadingValue > 100) loadingValue = 100;
        
        updateLoadingProgress(loadingValue / 100);
    }, 200);
}

// Başlangıç fonksiyonu
window.addEventListener('load', function() {
    // Özel imleç kontrolü
    const customCursor = document.getElementById('custom-cursor');
    if (loadingData.customCursor === false) {
        customCursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
    
    // Sayfa ile etkileşim olduğunda müziği başlat
    document.addEventListener('click', function() {
        attemptAutoPlay();
    });
    
    // Sekme değiştirme işlevi
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            changeTab(tabId);
        });
    });
    
    // Müzik kontrolü - Butonlara tıklama işlevlerini ekle
    setupMusicControls();
    
    // FiveM yükleme ilerlemesini dinle
    window.addEventListener('message', function(event) {
        if (event.data.eventName === 'loadProgress') {
            // Gerçek yükleme verisi alındığında simülasyonu durdur
            if (simulatedLoading) {
                simulatedLoading = false;
                clearInterval(loadingInterval);
            }
            
            // FiveM'den gerçek yükleme durumunu al
            updateLoadingProgress(event.data.loadFraction);
        } else if (event.data.eventName === 'shutdownLoadingScreen') {
            // Loading screen'i kapat
            document.getElementById('loading-message').textContent = 'Giriş Yapılıyor';
            
            // Yükleme simülasyonu çalışıyorsa durdur
            if (simulatedLoading) {
                clearInterval(loadingInterval);
            }
            
            // Çubuğu %100'e tamamla
            updateLoadingProgress(1.0);
            
            setTimeout(() => {
                // Ekranı yavaşça kapat
                const container = document.querySelector('.main-container');
                if (container) {
                    container.style.opacity = '0';
                }
            }, 1000);
        } else {
            // Config verisi alındıysa, yükleme ekranını başlat
            loadingData = event.data;
            
            // Özel imleç kontrolü
            if (loadingData.customCursor === false && customCursor) {
                customCursor.style.display = 'none';
                document.body.style.cursor = 'auto';
            }
            
            initializeLoadingScreen();
        }
    });
    
    // Yükleme çubuğunu başlat - Gerçek veriler gelmezse simülasyon yap
    setTimeout(() => {
        // Eğer 2 saniye içinde gerçek yükleme verisi gelmezse simülasyon başlat
        if (loadingValue === 0) {
            simulatedLoading = true;
            startLoadingBar();
        }
    }, 2000);
    
    // Loading screen'i hemen başlat
    initializeLoadingScreen();
});

// Müzik kontrollerini ayarla
function setupMusicControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
}

// Oynatma/duraklatma işlevi
function togglePlayPause() {
    if (!youtubePlayer) return;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (!playPauseBtn) return;
    
    const icon = playPauseBtn.querySelector('i');
    if (!icon) return;
    
    const playerState = youtubePlayer.getPlayerState();
    
    if (playerState === YT.PlayerState.PLAYING) {
        youtubePlayer.pauseVideo();
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    } else {
        youtubePlayer.playVideo();
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }
}

// Sesi aç/kapat işlevi
function toggleMute() {
    if (!youtubePlayer) return;
    
    const muteBtn = document.getElementById('mute-btn');
    if (!muteBtn) return;
    
    const icon = muteBtn.querySelector('i');
    if (!icon) return;
    
    if (isMuted) {
        youtubePlayer.unMute();
        isMuted = false;
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    } else {
        youtubePlayer.mute();
        isMuted = true;
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    }
}

// YouTube API hazır olduğunda
function onYouTubeIframeAPIReady() {
    // Varsayılan video ID
    videoId = 'quq2za8Rhc4';
    
    // Config'ten video ID'si ayarlanmışsa onu kullan
    if (loadingData.defaultSong) {
        const configVideoId = getYoutubeIdFromUrl(loadingData.defaultSong);
        if (configVideoId) videoId = configVideoId;
    }
    
    youtubePlayer = new YT.Player('player', {
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            loop: 1,
            playlist: videoId,
            mute: 0  // 0 = başlangıçta sesli (bazı tarayıcılarda çalışmayabilir)
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// Player hatası olduğunda
function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    
    // Hata durumunda başka bir video ID ile tekrar dene
    if (youtubePlayer) {
        youtubePlayer.loadVideoById('quq2za8Rhc4'); // Yedek video ID
    }
}

// Player hazır olduğunda
function onPlayerReady(event) {
    event.target.playVideo();
    
    // Tarayıcı otomatik oynatma kısıtlamalarını kontrol et
    isMuted = event.target.isMuted();
    
    if (isMuted) {
        event.target.unMute();
        isMuted = false;
    }
    
    event.target.setVolume(50); // %50 ses seviyesi
    
    // Tarayıcı sessize almış olabilir, otomatik oynatma politikası nedeniyle
    setTimeout(function() {
        // Ses durumunu kontrol et
        isMuted = event.target.isMuted();
        updateMusicControlButtons();
    }, 2000);
    
    event.target.setPlaybackQuality('hd1080');
    resizeVideo();
    window.addEventListener('resize', resizeVideo);
}

// Player durumu değiştiğinde
function onPlayerStateChange(event) {
    // Durum değişikliklerinde butonları güncelle
    updateMusicControlButtons();
    
    if (event.data === YT.PlayerState.ENDED) {
        youtubePlayer.playVideo();
    } else if (event.data === YT.PlayerState.PLAYING) {
        // Video oynatılıyor, butonları güncelle
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            const icon = playPauseBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            }
        }
    } else if (event.data === YT.PlayerState.PAUSED) {
        // Video duraklatıldı, butonları güncelle
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            const icon = playPauseBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }
    }
}

// YouTube URL'sinden ID çıkarma
function getYoutubeIdFromUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Video boyutlandırma
function resizeVideo() {
    if (!youtubePlayer) return;
    
    const videoElement = document.getElementById('player');
    if (!videoElement) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const videoRatio = 16 / 9;
    const windowRatio = windowWidth / windowHeight;
    
    if (windowRatio > videoRatio) {
        videoElement.style.width = windowWidth + 'px';
        videoElement.style.height = (windowWidth / videoRatio) + 'px';
    } else {
        videoElement.style.width = (windowHeight * videoRatio) + 'px';
        videoElement.style.height = windowHeight + 'px';
    }
}

// Loading screen'i başlat
function initializeLoadingScreen() {
    // Sunucu adını ayarla
    if (loadingData.serverName) {
        const serverNameElement = document.getElementById('server-name');
        if (serverNameElement) {
            serverNameElement.textContent = loadingData.serverName;
        }
    }
    
    // Özel imleç kontrolü
    const customCursor = document.getElementById('custom-cursor');
    if (loadingData.customCursor === false && customCursor) {
        customCursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
    
    // Güncellemeleri ekle
    if (loadingData.update) {
        const updatesContainer = document.getElementById('updates-container');
        if (updatesContainer) {
            updatesContainer.innerHTML = '';
            
            loadingData.update.forEach(update => {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                updateItem.innerHTML = `
                    <img src="${update.image}" class="update-img" alt="${update.title}">
                    <div class="update-content">
                        <div class="update-title">${update.title}</div>
                        <div class="update-desc">${update.description}</div>
                    </div>
                `;
                updatesContainer.appendChild(updateItem);
            });
        }
    }
    
    // Haberleri ekle
    if (loadingData.gallery) {
        const newsContent = document.getElementById('news-content');
        if (newsContent) {
            newsContent.innerHTML = ''; // Önceki içeriği temizle
            const newsGrid = document.createElement('div');
            newsGrid.className = 'news-grid';
            
            loadingData.gallery.forEach(news => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                newsCard.innerHTML = `
                    <img src="${news.image}" class="news-image" alt="${news.title || 'Haber'}">
                    <div class="news-info">
                        <div class="news-title">${news.title || 'Haber'}</div>
                        <div class="news-desc">${news.description}</div>
                    </div>
                `;
                newsGrid.appendChild(newsCard);
            });
            
            newsContent.appendChild(newsGrid);
        }
    }
    
    // Kuralları ekle
    if (loadingData.rules) {
        const rulesContent = document.getElementById('rules-content');
        if (rulesContent) {
            rulesContent.innerHTML = ''; // Önceki içeriği temizle
            const rulesList = document.createElement('div');
            rulesList.className = 'rules-list';
            
            loadingData.rules.forEach(rule => {
                const ruleItem = document.createElement('div');
                ruleItem.className = 'rule-item';
                ruleItem.innerHTML = `
                    <div class="rule-title">${rule.title}</div>
                    <div class="rule-desc">${rule.description}</div>
                `;
                rulesList.appendChild(ruleItem);
            });
            
            rulesContent.appendChild(rulesList);
        }
    }
    
    // Ekip üyelerini ekle
    if (loadingData.staffs) {
        const staffContent = document.getElementById('staff-content');
        if (staffContent) {
            staffContent.innerHTML = ''; // Önceki içeriği temizle
            const staffGrid = document.createElement('div');
            staffGrid.className = 'staff-grid';
            
            loadingData.staffs.forEach(staff => {
                const staffCard = document.createElement('div');
                staffCard.className = 'staff-card';
                staffCard.innerHTML = `
                    <img src="${staff.avatar}" class="staff-avatar" alt="${staff.username}">
                    <div class="staff-name">${staff.username}</div>
                    <div class="staff-role">${staff.role}</div>
                `;
                staffGrid.appendChild(staffCard);
            });
            
            staffContent.appendChild(staffGrid);
        }
    }
    
    // Klavye kısayollarını ekle
    if (loadingData.keyboard) {
        const keysContent = document.getElementById('keys-content');
        if (keysContent) {
            keysContent.innerHTML = ''; // Önceki içeriği temizle
            const keysList = document.createElement('div');
            keysList.className = 'keys-list';
            
            loadingData.keyboard.forEach(key => {
                const keyItem = document.createElement('div');
                keyItem.className = 'key-item';
                keyItem.innerHTML = `
                    <div class="key-button">${key.key}</div>
                    <div class="key-text">${key.helpText}</div>
                `;
                keysList.appendChild(keyItem);
            });
            
            keysContent.appendChild(keysList);
        }
    }
    
    // Sosyal medya linklerini ekle
    if (loadingData.social) {
        const socialLinks = document.getElementById('social-links');
        if (socialLinks) {
            socialLinks.innerHTML = ''; // Önceki içeriği temizle
            
            loadingData.social.forEach(social => {
                // Doğru şekilde link oluştur
                const socialLink = document.createElement('a');
                socialLink.href = social.link;
                socialLink.className = 'social-link';
                socialLink.target = "_blank"; // Yeni sekmede açılması için
                socialLink.rel = "noopener noreferrer"; // Güvenlik için
                socialLink.innerHTML = `<i class="fab fa-${social.icon}"></i>`;
                
                // FiveM NUI'den çıkıp tarayıcıya gitmek için special bir işleyici ekle
                socialLink.addEventListener('click', function(e) {
                    e.preventDefault(); // Normal link davranışını engelle
                    
                    // FiveM içinde çalışıyorsa
                    if (typeof invokeNative !== 'undefined') {
                        invokeNative('openUrl', this.href);
                    } else {
                        // Normal tarayıcıda test ediliyorsa
                        window.open(this.href, '_blank');
                    }
                });
                
                socialLinks.appendChild(socialLink);
            });
        }
    }
    
    // YouTube video ID'sini ayarla
    if (loadingData.defaultSong && youtubePlayer) {
        const newVideoId = getYoutubeIdFromUrl(loadingData.defaultSong);
        if (newVideoId && newVideoId !== videoId) {
            videoId = newVideoId;
            youtubePlayer.loadVideoById(videoId);
        }
    }
}

// Sekme değiştirme
function changeTab(tabId) {
    // Aktif sekmeyi kaldır
    const activeTabElement = document.querySelector(`.tab.active`);
    const activeContentElement = document.querySelector(`.tab-content.active`);
    
    if (activeTabElement) activeTabElement.classList.remove('active');
    if (activeContentElement) activeContentElement.classList.remove('active');
    
    // Yeni sekmeyi aktif yap
    const newTabElement = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const newContentElement = document.getElementById(`${tabId}-content`);
    
    if (newTabElement) newTabElement.classList.add('active');
    if (newContentElement) newContentElement.classList.add('active');
    
    activeTab = tabId;
}

// Yükleme çubuğunu güncelle
function updateLoadingProgress(progress) {
    const loadingBar = document.getElementById('loading-bar');
    const loadingPercentage = document.getElementById('loading-percentage');
    
    if (!loadingBar || !loadingPercentage) return;
    
    const percentage = Math.round(progress * 100);
    loadingValue = percentage; // loadingValue değişkenini güncelle
    
    // Çubuğu ve yüzdeyi güncelle
    loadingBar.style.width = `${percentage}%`;
    loadingPercentage.textContent = `${percentage}%`;
    
    // Yükleme tamamlandıysa mesajı güncelle
    if (percentage >= 100) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = 'Giriş Yapılıyor';
        }
    }
}
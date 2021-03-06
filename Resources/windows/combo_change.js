var win = Titanium.UI.currentWindow;
win.orientationModes = [Titanium.UI.LANDSCAPE_LEFT];
win.title = win.combo;
win.showNavBar();

// createImageView, createAnimation, createSound
var belt = Titanium.UI.createImageView({
    image:'../images/belt.png',
    width: 480,
});
var driver = Titanium.UI.createImageView({
    image:'../images/' + win.combo + '.png',
    width: 480,
});
var cover = Ti.UI.createImageView({
    image:'../images/cover.png',
    width: 480,
});
var anime = Titanium.UI.createAnimation({
    transform: Ti.UI.create2DMatrix({rotate: 28}),
    duration: 200,
});

// オースキャナーオブジェクトの生成
var o_scanner = Ti.UI.createImageView({
    top: -200,
    left: -50,
    width: 200,
    image:'../images/o_scanner.png',
    visible: false,
    slash: function() {
        this.show();
        this.animate(Ti.UI.createAnimation({
            top: 350,
            left: 600,
            duration: 2000,
        }));
    },
});

// 変身音オブジェクトの生成と音声ファイルのプリロード
var tatoba_sound = Titanium.Media.createSound({
    url:'../sounds/' + win.combo + '.mp3',
    preload:true,
    has_sound_file: function() {
        f = Ti.Filesystem.getFile('sounds/' + win.combo + '.mp3');
        return f.exists();
    },
    file_exists_and_preload: function() {
        if (this.has_sound_file()){
            this.play();
            this.pause();
        }
    },
    file_exists_and_play: function() {
        if (!this.has_sound_file()){
            alert('歌（がないの）は気にするな！')
            return;
        }
        this.play();
    },
});
tatoba_sound.file_exists_and_preload();

var raise_sound = Titanium.Media.createSound({
    url:'../sounds/driver_raise.mp3',
    preload:true,
    preload: function() {
        this.play();
        this.pause();
    },
});
var charging_sound = Titanium.Media.createSound({
    url:'../sounds/charging.mp3',
    preload:true,
    looping:true,
    preload: function() {
        this.play();
        this.pause();
    },
});
var core_slash_sound = Titanium.Media.createSound({
    url:'../sounds/core_slash.mp3',
    preload:true,
    preload: function() {
        this.play();
        this.pause();
    },
});
raise_sound.preload();
charging_sound.preload();
core_slash_sound.preload();

// ライダー詳細webページ
var webview = Ti.UI.createWebView({
    url: 'http://www.tv-asahi.co.jp/ooo/rider/' + win.combo + '.html',
});
var scrollview = Titanium.UI.createScrollView({
    contentWidth:'auto',
    contentHeight:1000,
    showVerticalScrollIndicator:true,
    showHorizontalScrollIndicator:true,
    transform: Ti.UI.create2DMatrix().scale(0),
    visible: false,
    show_rider: function() {
        this.show();
        this.animate({
            transform: Ti.UI.create2DMatrix(),
            duration: 300,
        });
        win.setToolbar([flexSpace, brf_button, flexSpace]);
    },
});
scrollview.add(webview);

// back, reload, forward button_bar
var brf_button = Titanium.UI.createButtonBar({
    labels:['Back', 'Reload', 'Forward'],
    backgroundColor:'black'
});
var flexSpace = Ti.UI.createButton({
    systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
});
brf_button.addEventListener('click',function(ce) {
    if (ce.index == 0) {
        webview.goBack();
    } else if (ce.index == 1) {
        webview.reload();
    } else {
        webview.goForward();
    }
});

// addEventListener
webview.addEventListener('load', function()
{
    Ti.API.debug("url = "+webview.url);
    scrollview.scrollTo(0, 225);
});
cover.addEventListener('click', function()
{
    Ti.API.debug("driver animation start");
    driver.animate(anime);
    cover.animate(anime);
    raise_sound.play();
});
raise_sound.addEventListener('complete', function()
{
    setTimeout(function() { charging_sound.play(); }, 200);
});
cover.addEventListener('complete', function()
{
    o_scanner.show();
});
o_scanner.addEventListener('swipe', function(e)
{
    o_scanner.slash();
    setTimeout(function() { core_slash_sound.play();
                            charging_sound.pause();
                          }, 300);
    setTimeout(function() { core_flash[0][0].flash(),
                            core_flash[0][1].flash(),
                          }, 300);
    setTimeout(function() { core_flash[1][0].flash(),
                            core_flash[1][1].flash(),
                          }, 600);
    setTimeout(function() { core_flash[2][0].flash(),
                            core_flash[2][1].flash(),
                          }, 900);
    setTimeout(function() { core_flash[0][0].vanish();
                            core_flash[1][0].vanish();
                            core_flash[2][0].vanish();
                            core_flash[0][1].vanish();
                            core_flash[1][1].vanish();
                            core_flash[2][1].vanish();
                          }, 1400);
    setTimeout(function() { orangu_circle.flash()}, 4100);
    // 変身音ファイルがない場合、歌は気にするな！
    if (!tatoba_sound.has_sound_file()) {
        setTimeout(function() { orangu_circle.vanish() }, 5100);
        setTimeout(function() { scrollview.show_rider(); }, 6100);
    }
});

core_slash_sound.addEventListener('complete', function()
{
    tatoba_sound.file_exists_and_play();
});

anime.addEventListener('complete', function()
{
    Ti.API.debug("o_scanner animation start");
    o_scanner.show();
});
tatoba_sound.addEventListener('complete', function()
{
    Ti.API.info('tatoba complete');
    orangu_circle.vanish();
    setTimeout(function() { scrollview.show_rider() }, 300);
});

// core_flash!
var flash_positions = [
    {top: 40, left: 90},
    {top: 100, left: 'auto'},
    {top: 155, left: 305},
];
var core_flash = new Array();
var vanish_anime = Ti.UI.createAnimation({opacity:0, duration:1500});
for(var i=0;i<=2;i++) {
    core_flash[i] = ['', ''];
    for (var j=0;j<=1;j++) {
        core_flash[i][j] = Ti.UI.createView({
            height:90,
            width:90,
            borderRadius:45,
            visible: false,
            borderColor:win.color[i],
            top: flash_positions[i].top,
            left: flash_positions[i].left,
            borderWidth:3,
            opacity:0.6,
            flash: function() {
                this.show();
                this.animate({
                    transform: Ti.UI.create2DMatrix({scale: this.scale}),
                    zIndex: 1,
                    duration: 500,
                });
            },
            vanish: function() {
                this.animate(vanish_anime);
            },
        });
    }
    core_flash[i][0].scale = 2;
    core_flash[i][1].scale = 2.2;
}

// オーラングサークルオブジェクトの生成
var orangu_circle = Ti.UI.createImageView({
    width: 200,
    image:'../images/orangu_' + win.combo + '.png',
    opacity:0.7,
    visible: false,
    flash: function() {
        this.show();
        this.animate({
            transform: Ti.UI.create2DMatrix({scale: 1.6}),
            zIndex: 1,
            duration: 1000,
        });
    },
    vanish: function() {
        this.animate({
            transform: Ti.UI.create2DMatrix({scale: 0.01}),
            zIndex: 1,
            duration: 500,
        });
    },
});

// win.add
win.add(belt);
win.add(driver);
win.add(cover);
win.add(scrollview);
win.add(core_flash);
win.add(o_scanner);
win.add(orangu_circle);

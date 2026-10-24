/* 全站吸底音乐播放器（APlayer）
 * 特点：
 *  - 播放器挂在 <body> 上，PJAX 切换页面不会重建，音乐不断
 *  - 歌单来自 /music/playlist.json，由 source/music/playlist.json 生成
 *  - 记住音量和上次播放的歌曲
 */
(function () {
  if (window.__jin888APlayerLoaded) return;
  window.__jin888APlayerLoaded = true;

  function boot() {
    if (window.__globalAPlayer) return;

    var container = document.createElement('div');
    container.id = 'global-aplayer';
    document.body.appendChild(container);

    fetch('/music/playlist.json')
      .then(function (res) { return res.json(); })
      .then(function (list) {
        if (window.__globalAPlayer) return;

        window.__globalAPlayer = new APlayer({
          container: container,
          audio: list,
          fixed: true,
          mini: true,
          autoplay: false,
          theme: '#49B1F5',
          loop: 'all',
          order: "random",
          preload: 'metadata',
          listFolded: true,
          listMaxHeight: '260px',
          storageName: 'jin888-aplayer'
        });

        var vol = localStorage.getItem('jin888-volume');
        if (vol !== null) {
          window.__globalAPlayer.volume(parseFloat(vol), true);
        }

        window.__globalAPlayer.on('volumechange', function () {
          localStorage.setItem('jin888-volume', window.__globalAPlayer.audio.volume);
        });

        // 音频两条线互备：ghfast 代理（国内快）⇄ github.io 直连
        var MIRROR = 'https://ghfast.top/https://raw.githubusercontent.com/jinsongran888/jin888-audio/main/audio/';
        var DIRECT = 'https://jinsongran888.github.io/jin888-audio/audio/';
        var tried = {};
        function swap(url, from, to) {
          return url && url.indexOf(from) === 0 ? to + url.slice(from.length) : null;
        }
        window.__globalAPlayer.on('error', function () {
          var ap = window.__globalAPlayer;
          var idx = ap.list.index;
          if (tried[idx]) return;
          var cur = ap.list.audios[idx] && ap.list.audios[idx].url;
          var alt = swap(cur, MIRROR, DIRECT) || swap(cur, DIRECT, MIRROR);
          if (!alt) return;
          tried[idx] = true;
          ap.list.audios[idx].url = alt;
          ap.list.switch(idx);
          ap.play();
        });
      })
      .catch(function (err) {
        console.warn('[jin888] 播放清单加载失败：', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

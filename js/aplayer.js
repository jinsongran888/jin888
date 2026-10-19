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

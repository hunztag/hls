Artplayer.DEGUG = false;
function crossdomainCheck() {
	if (!hosts) return;
	var referagent = document.referrer;
	if (redirecturl.indexOf("http") != 0)
		redirecturl = "http://" + redirecturl
	if (!referagent)
		return top.location.href = redirecturl;

	var hostsarr = hosts.split("|");
	var refer = false;
	var url = referagent;
	var reg = /^http(s)?:\/\/(.*?)\//;

	for (var i = 0; i <= hostsarr.length; i++) {
		if (reg.exec(url) && reg.exec(url)[2].indexOf(hostsarr[i]) >= 0) {
			refer = true;
			break;
		}
	};
	if (!refer) {
		top.location.href = redirecturl;
	};
}
crossdomainCheck();
var time = 0;
var _CK_ = null;
var bOpen = 0;
var bObj = null;
var msgcache = {}
var player = null;
var player;
function SetCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
function getCookie(name) {
	var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
	if (arr != null) return unescape(arr[2]); return null;
}
window.onerror = function () {
	return true;
}
function init() {
	play(main, xml);
}
function timeHandler(t) {
	console.log("time handler")
	if (t > -1)
		SetCookie(videoid + "_time", t);
}
function loadHandler() {
	player.addListener('time', timeHandler); //监听播放时间
}
function play(main, xml) {
	var hostname = window.location.hostname
	var port = window.location.port || '80';
	var picurl = window.location.protocol + "//" + window.location.host + pic;
	var url = window.location.protocol + "//" + window.location.host + main
	xml = window.location.protocol + "//" + window.location.host + xml
	var isiPad = navigator.userAgent.match(/iPhone|Linux|Android|iPod|ios|iOS|Windows Phone|Phone|WebOS/i) != null;
	var iPad = navigator.userAgent.match(/iPad/i) != null;
	if (iPad) {
		document.getElementById('a1').innerHTML = '<video src="' + url + '" controls webkit-playsinline="true" style="width: 100%; height: 100%; background-color: rgb(0, 0, 0);" width="100%" height="100%"></video>'
	} else if (isiPad) {
		var videoObject = {
			container: '#a1',
			variable: 'player',
			loaded: 'loadHandler',
			autoplay: false,
			poster: picurl,
			adfront: l, //前置广告
			adfronttime: t,
			adfrontlink: r,
			adpause: d,//暂停广告
			adpausetime: t,
			adpauselink: u,
			video: url
		};
	} else {
		var videoObject = {
			container: '#a1',
			variable: 'player',
			loaded: 'loadHandler',
			autoplay: true,
			poster: picurl,
			adfront: l, //前置广告
			adfronttime: t,
			adfrontlink: r,
			adpause: d,//暂停广告
			adpausetime: t,
			adpauselink: u,
			video: url
		};
	}
	var cookieTime = getCookie(videoid + "_time"); //调用已记录的time
	if (!cookieTime || cookieTime == undefined) { //如果没有记录值，则设置时间0开始播放
		cookieTime = 0;
	}
	if (cookieTime > 0) {
		videoObject['seek'] = cookieTime;
	}
	if (/msie|trident/i.test(navigator.userAgent)) {
		video_player = 'ckplayer'
	}
	if (video_player == 'ckplayer') {
		player = new ckplayer(videoObject);
	} else if (video_player == 'artplayer') {
		window.vmspa = new Artplayer({
			container: '#a1',
			url: url,
			autoplay: true,
			autoSize: false,
			loop: false,
			mutex: true,
			setting: true,
			pip: true,
			flip: false,
			lock: true,
			fastForward: true,
			playbackRate: true,
			aspectRatio: true,
			theme: '#ff0057',
			fullscreen: true,
			fullscreenWeb: true,
			miniProgressBar: true,
			autoOrientation: true,
			airplay: false,
			whitelist: ['*'],
			customType: {
				m3u8: function (video, url) {
					if (Hls.isSupported()) {
						const hls = new Hls();
						hls.loadSource(url);
						hls.attachMedia(video);
					} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
						video.src = url;
					} else {
						art.notice.show = '不支持播放格式：m3u8';
					}
				},
			}
		});

		window.video_hash = location.href.split('/').pop()

		window.vmspa.on('video:progress', (event) => {
			if (!vmspa.currentTime) { return }
			localStorage.setItem(window.video_hash + ':progress', vmspa.currentTime)
		})
		window.vmspa.on('ready', () => {
			var progress = parseFloat(localStorage.getItem(window.video_hash + ':progress'))
			if (isNaN(progress)) {
				progress = 0
			}
			window.vmspa.seek = progress
		})
	} else if (video_player == 'dplayer') {
		if (tracker_url && signaler_url) {
			console.log('p2p mix mode')
			P2PEngine.dplayer('a1', url, tracker_url, signaler_url)
		} else {
			console.log('cdn mode')
			new DPlayer({
				container: document.getElementById('a1'),
				screenshot: false,
				autoplay: window.auto_play,
				volume: 0,
				contextmenu: [
					// {
					//     text: '澳门新葡京',
					//     link: 'https://aomen.com/xinpujing'
					// }
				],
				video: {
					type: 'customHls',
					customType: {
						'customHls': function (video, player) {
							const hls = new Hls();
							hls.loadSource(url);
							hls.attachMedia(video);
						}
					},
					url: url,
					pic: picurl,
					thumbnails: thumbnails
				}
			});
		}
	} else {
		alert('unknown player' + video_player);
	}
}

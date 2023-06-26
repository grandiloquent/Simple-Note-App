function adjustSize(video) {
    if (video.videoWidth > 0) {
        const w = Math.min(window.outerWidth, window.innerWidth);
        const h = Math.min(window.outerHeight, window.innerHeight);
        let ratio = Math.min(w / video.videoWidth, h / video.videoHeight);
        let height = video.videoHeight * ratio
        let width = video.videoWidth * ratio;
        video.style.width = `${width}px`;
        video.style.height = `${height}px`;
        video.style.left = `${(w - width) / 2}px`;
        video.style.top = `${(h - height) / 2}px`
    }
}
function formatDuration(ms) {
    if (isNaN(ms)) return '0:00';
    if (ms < 0) ms = -ms;
    const time = {
        hour: Math.floor(ms / 3600) % 24,
        minute: Math.floor(ms / 60) % 60,
        second: Math.floor(ms) % 60,
    };
    return Object.entries(time)
        .filter((val, index) => index || val[1])
        .map(val => (val[1] + '').padStart(2, '0'))
        .join(':');
}
function appendSubtitle(video) {
    document.querySelectorAll('track').forEach(x => x.remove())
    const track = document.createElement('track');
    var tracks = video.textTracks;
    var numTracks = tracks.length;
    for (var i = numTracks - 1; i >= 0; i--)
        video.textTracks[i].mode = "disabled";
    track.src = substringBeforeLast(video.src, ".") + ".srt";
    track.default = true;
    video.appendChild(track);
}
function substringBeforeLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}
function playVideo(baseUri, video, path) {
    document.title = substringAfterLast(path, "/");
    toast.setAttribute('message', document.title);
    video.load();
    video.src = `${baseUri}/file?path=${encodeURIComponent(path)}`;
    appendSubtitle(video);
    transformSrtTracks(video);
    video.play();

}
async function showVideoList(baseUri, path, video) {


    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', '视频列表');
    const d = document.createElement('div');
    videos.forEach(v => {
        const div = document.createElement('div');
        div.style.alignItems = "center";
        div.style.boxSizing = "border-box";
        div.style.minHeight = "43px";
        div.style.display = "flex";
        div.style.padding = "8px 0";
        div.style.borderTop = "1px solid rgb(218,220,224)";
        div.setAttribute("data-src", v.path);
        d.appendChild(div);
        div.textContent = substringAfterLast(v.path, "/");
        div.addEventListener('click', evt => {
            playVideo(baseUri, video, evt.currentTarget.dataset.src);
            video.play();
            jumpToBookmark(video);
            dialog.remove();
        });


    })
    dialog.appendChild(d);
    document.body.appendChild(dialog);
}
function substringAfterLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}
function jumpToBookmark(video) {
    const obj = JSON.parse(localStorage.getItem('bookmark') || '{}');
    const currentTime = parseFloat(obj[path]);
    if (currentTime) {
        video.currentTime = currentTime;
    }
}

////////////////////////////////
import { transformSrtTracks } from './main.js';
const searchParams = new URL(window.location).searchParams;
let path = searchParams.get('path');
const t = searchParams.get('t');
let videos;
async function initialize() {
    let timer;
    const topWrapper = document.querySelector('#top-wrapper');
    const middleWrapper = document.querySelector('#middle-wrapper');
    const bottomWrapper = document.querySelector('#bottom-wrapper');

    let baseUri = searchParams.get('baseUri');
    baseUri = baseUri || (window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "");
    const timeFirst = document.querySelector('#time-first');
    const timeSecond = document.querySelector('#time-second');
    const video = document.querySelector('#video');
    const toast = document.getElementById('toast');
    const previous = document.querySelector('#previous');
    previous.addEventListener('click', evt => {
        scheduleHide();
        video.currentTime -= 1;
    });
    const next = document.querySelector('#next');
    next.addEventListener('click', evt => {
        scheduleHide();
        video.currentTime += 1;
    });


    const customSeekbar = document.querySelector('#custom-seekbar');
    customSeekbar.addEventListener("seekbarClicked", function () {
        scheduleHide();
        video.pause();
    });
    customSeekbar.addEventListener("seekbarInput", evt => {
        console.log(evt.detail);
        scheduleHide();
        var time = video.duration * evt.detail;
        video.currentTime = time;
    });

    const res = await fetch(`${baseUri}/files?path=${encodeURIComponent(
        substringBeforeLast(path, "/")
    )}`);
    videos = (await res.json())
        .filter(video => {
            return !video.isDirectory && (
                video.path.endsWith(".mp4") ||
                video.path.endsWith(".v")
            )
        });
    playVideo(baseUri, video, path);
    if (t) {
        const m = /(\d+)m(\d+)s/.exec(t);
        if (m) {
            video.currentTime = parseFloat(m[1]) * 60 + parseFloat(m[2]);
        }
    }
    video.addEventListener('durationchange', evt => {
        if (video.duration) {
            timeSecond.textContent = formatDuration(video.duration);
        }
        adjustSize(video);
    });

    video.addEventListener('timeupdate', evt => {
        if (video.currentTime) {
            timeFirst.textContent = formatDuration(video.currentTime);
            customSeekbar.value = (100 / video.duration) * video.currentTime;
        }
    });
    video.addEventListener('play', evt => {
        scheduleHide();
        playPause.querySelector('path').setAttribute('d', 'M9 19H7V5h2Zm8-14h-2v14h2Z');
    });
    video.addEventListener('pause', evt => {
        playPause.querySelector('path').setAttribute('d', 'm7 4 12 8-12 8V4z');
    });
    video.addEventListener('seeked', evt => {
        saveBookmark();
    });
    video.addEventListener('ended', evt => {
        const url = new URL(video.src);
        const path = url.searchParams.get('path');
        let next = 0;
        for (let i = 0; i < videos.length; i++) {
            if (videos[i].path === path) {
                next = i;
            }
        }
        if (next + 1 < videos.length) {
            next = next + 1;
        } else {
            next = 0;
        }
        path = videos[next].path;
        playVideo(baseUri, video, path);
    });
    const playPause = document.querySelector('#play-pause');
    playPause.addEventListener('click', evt => {
        if (video.paused) {
            video.play();
            jumpToBookmark(video);
        } else {
            video.pause();
            saveBookmark();
        }
    });
    function scheduleHide() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            topWrapper.style.display = 'none';
            middleWrapper.style.display = 'none';
            bottomWrapper.style.display = 'none';
        }, 5000);
    }
    video.addEventListener('click', evt => {
        evt.stopPropagation();
        topWrapper.style.display = 'flex';
        middleWrapper.style.display = 'flex';
        bottomWrapper.style.display = 'block';
        scheduleHide();
    });
    const videoList = document.querySelector('#video-list');
    videoList.addEventListener('click', evt => {
        showVideoList(baseUri, path, video);
    });
    const fullscreen = document.querySelector('#fullscreen');
    fullscreen.addEventListener('click', async evt => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }

    });
    window.addEventListener("resize", evt => {
        const w = Math.min(window.outerWidth, window.innerWidth);
        const h = Math.min(window.outerHeight, window.innerHeight);
        toast.setAttribute('message', `${w}x${h}`);
        adjustSize(video);
    });
    document.addEventListener('visibilitychange', evt => {
        saveBookmark();
    })
    function saveBookmark() {
        const obj = JSON.parse(localStorage.getItem('bookmark') || '{}');
        obj[path] = video.currentTime;
        localStorage.setItem('bookmark', JSON.stringify(obj));
    }
    window.addEventListener('keydown', async evt => {
        if (evt.key === 'ArrowLeft') {
            evt.preventDefault();
            video.currentTime -= 1;
        } else if (evt.key === 'ArrowRight') {
            evt.preventDefault();
            video.currentTime += 1;
        }
    });

}
initialize();
// https://stackoverflow.com/questions/72997777/how-do-i-get-the-frame-rate-of-an-html-video-with-javascript

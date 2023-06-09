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
    video.load();
    video.src = `${baseUri}/file?path=${encodeURIComponent(path)}`;
    appendSubtitle(video);
    transformSrtTracks(video);
}
async function showVideoList(baseUri, path, video) {
    const res = await fetch(`${baseUri}/files?path=${encodeURIComponent(
        substringBeforeLast(path, "/")
    )}`);
    const videos = (await res.json())
        .filter(video => {
            return !video.isDirectory && (
                video.path.endsWith(".mp4") ||
                video.path.endsWith(".v")
            )
        });

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

function initialize() {
    let timer;
    const topWrapper = document.querySelector('#top-wrapper');
    const middleWrapper = document.querySelector('#middle-wrapper');
    const bottomWrapper = document.querySelector('#bottom-wrapper');

    const searchParams = new URL(window.location).searchParams;
    const path = searchParams.get('path');
    let baseUri = searchParams.get('baseUri');
    baseUri = baseUri || (window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "");
    const timeFirst = document.querySelector('#time-first');
    const timeSecond = document.querySelector('#time-second');
    const video = document.querySelector('#video');
    const progressBarPlayed = document.querySelector('#progress-bar-played');
    const progressBarPlayheadWrapper = document.querySelector('#progress-bar-playhead-wrapper');
    const toast = document.getElementById('toast');

    playVideo(baseUri, video, path);

    video.addEventListener('durationchange', evt => {
        if (video.duration) {
            timeSecond.textContent = formatDuration(video.duration);
        }
        adjustSize(video);
    });

    video.addEventListener('timeupdate', evt => {
        if (video.currentTime) {
            timeFirst.textContent = formatDuration(video.currentTime);
            const ratio = video.currentTime / video.duration;
            progressBarPlayed.style.width = `${ratio * 100}%`;
            progressBarPlayheadWrapper.style.marginLeft = `${ratio * 100}%`;
        }
    });
    video.addEventListener('play', evt => {
        scheduleHide();
        playPause.querySelector('path').setAttribute('d', 'M9 19H7V5h2Zm8-14h-2v14h2Z');
    });
    video.addEventListener('pause', evt => {
        playPause.querySelector('path').setAttribute('d', 'm7 4 12 8-12 8V4z');
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



}
initialize();
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
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
////////////////////////////////

const searchParams = new URL(window.location).searchParams;
const path = searchParams.get('path');
const seek = searchParams.get('seek');
let baseUri = searchParams.get('baseUri');
let seeking = false;
baseUri = baseUri || (window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "");
let videos;

async function initialize() {

    async function loadVideoList() {
        const res = await fetch(`${baseUri}/files?path=${encodeURIComponent(
            substringBeforeLast(path, "/")
        )}`);
        videos = (await res.json())
            .filter(video => {
                return !video.isDirectory && (
                    video.path.endsWith(".mp4") ||
                    video.path.endsWith(".v") ||
                    video.path.endsWith(".MP4") ||
                    video.path.endsWith(".MOV") ||
                    video.path.endsWith(".mov")
                )
            });
        videos = videos.sort((v1, v2) => {
            return v2.length - v1.length
        })
    }
    await loadVideoList();
    let timer;
    const topWrapper = document.querySelector('#top-wrapper');
    const middleWrapper = document.querySelector('#middle-wrapper');
    const bottomWrapper = document.querySelector('#bottom-wrapper');


    const timeFirst = document.querySelector('#time-first');
    const timeSecond = document.querySelector('#time-second');
    const video = document.querySelector('#video');
    const toast = document.getElementById('toast');
    const recycle = document.querySelector('#recycle');
    const message = document.querySelector('#message');
    const timer1 = document.querySelector('#timer');
    const split = document.querySelector('#split');
    function bindNext() {
        const next = document.getElementById('next');
        let stop = false;
        next.addEventListener('touchstart', async evt => {
            evt.stopPropagation();
            console.log('touchstart');
            if (timer) clearTimeout(timer);
            while (true) {
                await delay(500);
                if (!seeking) {
                    video.currentTime += 1;
                }

                if (stop) break;
            }
        });
        next.addEventListener('touchend', evt => {
            
            evt.stopPropagation();
            scheduleHide();
            stop = true;
        });
        next.addEventListener('touchcancel', evt => {
            evt.stopPropagation();
            scheduleHide();
            stop = true;
        });
    }
    function bindRandomPlay() {
        // const randomPlay =document.getElementById('random-play');
        document.getElementById('random-play').addEventListener('click', evt => {
            let next = getRandomInt(0, videos.length);
            playVideo(baseUri, video, videos[next].path)
        });
    }
    function bindPlayNext() {
        // const playNext =document.getElementById('play-next');
        document.getElementById('play-next').addEventListener('click', evt => {
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
            playVideo(baseUri, video, videos[next].path);
        });
    }
    function bindNextFrame() {
        // const nextFrame =document.getElementById('next-frame');
        document.getElementById('next-frame').addEventListener('click', evt => {
            scheduleHide();
            video.currentTime += 1 / fps;
        });
    }
    bindRandomPlay();
    bindPlayNext();
    bindNext();
    bindNextFrame()
    timer1.addEventListener('click', async evt => {
        message.textContent = video.currentTime;
        let start = await readText();
        if (start && /^[0-9.]+$/.test(start)) {
            writeText(start + " " + video.currentTime);
        } else {
            writeText(video.currentTime);
        }
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


    playVideo(baseUri, video, path);

    video.loop = true;
    video.muted = true;
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
    video.addEventListener('seeking', evt => {
        seeking = true;
        scheduleHide();
    })
    video.addEventListener('seeked', evt => {
        seeking = false;
        scheduleHide();
    })
    // video.addEventListener('ended', evt => {
    // const url = new URL(video.src);
    // const path = url.searchParams.get('path');
    // let next = 0;
    // for (let i = 0; i < videos.length; i++) {
    //     if (videos[i].path === path) {
    //         next = i;
    //     }
    // }
    // if (next + 1 < videos.length) {
    //     next = next + 1;
    // } else {
    //     next = 0;
    // }
    // playVideo(baseUri, video, videos[next].path);
    // });
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
    var last_media_time, last_frame_num, fps;
    var fps_rounder = [];
    var frame_not_seeked = true;
    function ticker(useless, metadata) {
        var media_time_diff = Math.abs(metadata.mediaTime - last_media_time);
        var frame_num_diff = Math.abs(metadata.presentedFrames - last_frame_num);
        var diff = media_time_diff / frame_num_diff;
        if (
            diff &&
            diff < 1 &&
            frame_not_seeked &&
            fps_rounder.length < 50 &&
            video.playbackRate === 1 &&
            document.hasFocus()
        ) {
            fps_rounder.push(diff);
            fps = Math.round(1 / get_fps_average());
        }
        frame_not_seeked = true;
        last_media_time = metadata.mediaTime;
        last_frame_num = metadata.presentedFrames;
        if (fps_rounder.length < 50)
            video.requestVideoFrameCallback(ticker);
    }
    video.requestVideoFrameCallback(ticker);
    video.addEventListener("seeked", function () {
        fps_rounder.pop();
        frame_not_seeked = false;
    });
    function get_fps_average() {
        return fps_rounder.reduce((a, b) => a + b) / fps_rounder.length;
    }

    const previous = document.querySelector('#previous');
    previous.addEventListener('click', evt => {
        scheduleHide();
        if (seek) {
            video.currentTime -= 1 / fps;
        } else
            video.currentTime -= 1 /// fps;
    });
    recycle.addEventListener('click', evt => {
        recyclingVideo();
    });
    async function recyclingVideo() {
        video.pause();
        const url = new URL(video.src);
        const path = url.searchParams.get('path');
        const res = await fetch(`${baseUri}/recycle?path=${encodeURIComponent(path)}`)
        let next = 0;
        for (let i = 0; i < videos.length; i++) {
            if (videos[i].path === path) {
                next = i;
            }
        }
        await loadVideoList();
        next = Math.min(next, videos.length - 1);
        playVideo(baseUri, video, videos[next].path)
    }
    split.addEventListener('click', evt => {
        const dialog = document.createElement('custom-dialog');
        dialog.setAttribute('title', '剪切');
        const d = document.createElement('textarea');
        dialog.addEventListener('submit', () => {
            const r = new RegExp("([0-9.]+) {1,}([0-9.]+)");
            const m = r.exec(d.value);
            if (m) {
                const url = new URL(video.src);
                const path = url.searchParams.get('path');
                const src = path;
                const dst = `${substringBeforeLast(path, ".")}_${m[1]}_${m[2]}.${substringAfterLast(path, ".")}`;
                if (typeof NativeAndroid !== 'undefined') {
                    NativeAndroid.trimVideo(src, dst, parseFloat(m[1]), parseFloat(m[2]))
                }
            }

        });
        dialog.appendChild(d);
        document.body.appendChild(dialog);
    });
    window.addEventListener('keydown', async evt => {
        if (evt.key === 'ArrowLeft') {
            evt.preventDefault();
            video.currentTime -= 10;
        } else if (evt.key === 'ArrowRight') {
            evt.preventDefault();
            video.currentTime += 10;
        } else if (evt.key === '1') {
            evt.preventDefault();
            playVideo(baseUri, video,
                videos[getRandomInt(0, videos.length)].path
            )
        } else if (evt.key === '0') {
            evt.preventDefault();
            recyclingVideo();
        }
    });
}
initialize();
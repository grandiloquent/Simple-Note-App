
const video = document.querySelector('video');
const progressBarLoaded = document.querySelector('#progress-bar-loaded');
const progressBarPlayed = document.querySelector('#progress-bar-played');
const progressBarPlayhead = document.querySelector('#progress-bar-playhead');
const progressBar = document.querySelector('#progress-bar');
const timePlayed = document.querySelector('#time-played');
const timeDuration = document.querySelector('#time-duration');
const playPause = document.querySelector('#play-pause');
const fullscreen = document.querySelector('#fullscreen');
const playbackRate = document.querySelector('#playback-rate');
const playerBottom = document.querySelector('#player-bottom');
const playCenter = document.querySelector('#play-center');

//-----------------------------


video.addEventListener('abort', evt => { console.log('abort fired') });
video.addEventListener('canplay', evt => { console.log('canplay fired') });
video.addEventListener('canplaythrough', evt => { console.log('canplaythrough fired') });
video.addEventListener('durationchange', evt => {
    console.log('durationchange fired');
});
video.addEventListener('emptied', evt => { console.log('emptied fired') });
video.addEventListener('encrypted', evt => { console.log('encrypted fired') });
video.addEventListener('ended', evt => { console.log('ended fired') });
video.addEventListener('error', evt => { console.log('error fired') });
video.addEventListener('loadeddata', evt => { console.log('loadeddata fired') });
video.addEventListener('loadedmetadata', evt => {
    console.log('loadedmetadata fired');
    console.log(video.videoWidth, video.duration)
    adjustSize();
    getVideoFPS();

    timeDuration.textContent = formatDuration(video.duration)

});
video.addEventListener('loadstart', evt => {
    console.log('loadstart fired');

});
video.addEventListener('pause', evt => { console.log('pause fired') });
video.addEventListener('play', evt => { console.log('play fired') });
video.addEventListener('playing', evt => { console.log('playing fired') });
video.addEventListener('progress', evt => {
    //console.log('progress fired');
    if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercentage = (bufferedEnd / video.duration) * 100;
        progressBarLoaded.style.width = `${bufferedPercentage}%`;
    }


});
video.addEventListener('ratechange', evt => { console.log('ratechange fired') });
video.addEventListener('seeked', evt => {
    console.log('seeked fired')
    seeking = false;
});
video.addEventListener('seeking', evt => {
    console.log('seeking fired')
    seeking = true;

});
video.addEventListener('stalled', evt => { console.log('stalled fired') });
video.addEventListener('suspend', evt => {
    //    console.log('suspend fired');

});
video.addEventListener('timeupdate', evt => {
    //console.log('timeupdate fired');
    if (!isDragging) {
        const percentage = (video.currentTime / video.duration) * 100;
        progressBarPlayed.style.width = `${percentage}%`;
        progressBarPlayhead.style.left = `${percentage}%`;
        timePlayed.textContent = formatDuration(video.currentTime);
    }
});
video.addEventListener('volumechange', evt => { console.log('volumechange fired') });
video.addEventListener('waiting', evt => { console.log('waiting fired') });
video.addEventListener('waitingforkey', evt => { console.log('waitingforkey fired') });


video.addEventListener('contextmenu', resetZoom); // Right-click to reset zoom
// Prevent default context menu
video.addEventListener('contextmenu', (e) => e.preventDefault());

//-----------------------------
let zoomLevel = 1; // Initial zoom level
const maxZoom = 4; // Maximum zoom level
const minZoom = 1; // Minimum zoom level
let _fps;
let timeout;
let seeking = false;

async function getVideoFPS() {
    try {
        // Fetch video file as ArrayBuffer
        const response = await fetch(video.src);
        const arrayBuffer = await response.arrayBuffer();

        // Initialize MP4Box
        const mp4boxfile = MP4Box.createFile();
        mp4boxfile.onReady = (info) => {
            // Extract timescale and duration for the video track
            const videoTrack = info.videoTracks[0];
            if (videoTrack && videoTrack.timescale && videoTrack.duration) {
                const fps = videoTrack.timescale / (videoTrack.duration / videoTrack.nb_samples);
                _fps = fps;
                //fpsDisplay.textContent = Math.round(fps * 100) / 100; // Round to 2 decimals
            } else {
                //fpsDisplay.textContent = 'FPS not found';
            }
        };

        mp4boxfile.onError = (error) => {
            //fpsDisplay.textContent = 'Error reading metadata';
            console.error(error);
        };

        // Feed the ArrayBuffer to MP4Box
        arrayBuffer.fileStart = 0;
        mp4boxfile.appendBuffer(arrayBuffer);
        mp4boxfile.flush();
    } catch (error) {
        //fpsDisplay.textContent = 'Error fetching video';
        console.error(error);
    }
}
function adjustSize() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Calculate aspect ratios
    const viewportRatio = viewportWidth / viewportHeight;
    const videoRatio = videoWidth / videoHeight;

    // Option 1: Fit (like object-fit: contain)
    if (videoRatio > viewportRatio) {
        // Video is wider than viewport, scale by width
        video.style.width = `${viewportWidth}px`;
        video.style.height = `${viewportWidth / videoRatio}px`;
    } else {
        // Video is taller than viewport, scale by height
        video.style.width = `${viewportHeight * videoRatio}px`;
        video.style.height = `${viewportHeight}px`;
    }

    // Center the video
    video.style.left = `${(viewportWidth - video.offsetWidth) / 2}px`;
    video.style.top = `${(viewportHeight - video.offsetHeight) / 2}px`;
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Format as HH:MM:SS if hours > 0, otherwise MM:SS
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
function zoomAtPoint(event) {
    const rect = video.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get click coordinates relative to video
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Normalize click coordinates to video's coordinate system
    const videoWidth = rect.width / zoomLevel; // Adjusted for current zoom
    const videoHeight = rect.height / zoomLevel;
    const originX = (clickX / videoWidth) * 100; // Percentage
    const originY = (clickY / videoHeight) * 100;

    // Update zoom level (e.g., increase by 0.5x per click)
    zoomLevel = Math.min(zoomLevel + 0.5, maxZoom);

    // Set transform origin to click point
    video.style.transformOrigin = `${originX}% ${originY}%`;
    video.style.transform = `scale(${zoomLevel})`;

    // Center video in viewport after zoom
    const newWidth = rect.width * (zoomLevel / (zoomLevel - 0.5 || 1));
    const newHeight = rect.height * (zoomLevel / (zoomLevel - 0.5 || 1));
    video.style.left = `${(viewportWidth - newWidth) / 2}px`;
    video.style.top = `${(viewportHeight - newHeight) / 2}px`;
}

function resetZoom(event) {

    zoomLevel = minZoom;
    video.style.transform = `scale(${zoomLevel})`;
    video.style.transformOrigin = 'center center';
    adjustSize(); // Reapply base scaling
}

function toggleController(isShow) {
    if (isShow) {
        playCenter.removeAttribute('hidden')
        playerBottom.removeAttribute('hidden')
        progressBar.removeAttribute('hidden')
    }
    else {
        playCenter.setAttribute('hidden', '')
        playerBottom.setAttribute('hidden', '')
        progressBar.setAttribute('hidden', '')
    }
}
function scheduleHide() {
    if (timeout) {
        clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
        toggleController();
    }, 3000)
}
function zoomIn(video, evt) {
    const b = video.getBoundingClientRect();
    const x = evt.clientX;
    const y = evt.clientY;
    // 2.2
    const ratio = 1.5;
    const width = (x - b.left) / b.width * (video.videoWidth * ratio);
    const height = (y - b.top) / b.height * (video.videoHeight * ratio);


    video.style.width = (video.videoWidth * ratio) + 'px';
    video.style.height = (video.videoHeight * ratio) + 'px';
    video.style.left = (window.innerWidth / 2 - width) + 'px';
    video.style.top = (window.innerHeight / 2 - height) + 'px';
}
async function loadSRTAsVTT(srtFile) {
    
        const response = await fetch(srtFile);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`); // Handle 404 or other HTTP errors
        }
        const srtText = await response.text();
        const vttText = convertSRTtoVTT(srtText);
        loadVTT(vttText);
    
}
// Convert SRT to VTT format
function convertSRTtoVTT(srtText) {
    // Replace commas with periods for milliseconds and add WEBVTT header
    const vttText = 'WEBVTT\n\n' + srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return vttText;
}
function loadVTT(vttText) {
    const blob = new Blob([vttText], { type: 'text/vtt' });
    const vttURL = URL.createObjectURL(blob);
    const track = document.createElement('track');
    track.src = vttURL;
    track.kind = 'subtitles';
    track.srclang = 'en';
    track.label = 'English';
    track.default = true;
    video.appendChild(track);
}
function changeExtension(filename, newExtension) {
    return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}
async function loadSubtitle(){
    try {
        await loadSRTAsVTT(changeExtension(video.src,"srt"));
     
    } catch (error) {
        const response = await fetch(changeExtension(video.src,"vtt"));
        const srtText = await response.text();
        loadVTT(srtText);
    }
}
//-----------------------------
window.baseUri = "";

video.src = `${baseUri}/file?path=${encodeURIComponent(new URL(location.href).searchParams.get('path'))}`;

loadSubtitle()
window.addEventListener('resize', adjustSize)

playPause.addEventListener('click', evt => {
    if (video.paused) {
        video.play();
        playPause.querySelector('path').setAttribute('d', 'M9 19H7V5h2Zm8-14h-2v14h2Z')
        scheduleHide();
    } else {
        video.pause();
        playPause.querySelector('path').setAttribute('d', 'm7 4 12 8-12 8V4z');

    }
})
// fullscreen.addEventListener('click', async evt => {
//     if (fullscreen.dataset.state === '1') {
//         adjustSize();
//         fullscreen.dataset.state = '0'
//     } else {
//         resetZoom();
//         fullscreen.dataset.state = '1'
//     }
// });

fullscreen.addEventListener('click', async evt => {
    if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    resetZoom();

});
playbackRate.addEventListener('click', async evt => {
    playbackRate.querySelector('#playback-rate-group').removeAttribute('hidden');
});

playbackRate.querySelectorAll('#playback-rate-group div')
    .forEach(x => {
        x.addEventListener('click', evt => {
            evt.stopPropagation();
            playbackRate.querySelector('#playback-rate-group').setAttribute('hidden', '');
            const text = evt.currentTarget.textContent;
            if (text === '-')
                video.playbackRate -= .25;
            else if (text === '+')
                video.playbackRate += .25;
            else {
                video.playbackRate = parseFloat(text);
            }
        })
    })




let isDragging = false;
progressBarPlayhead.addEventListener('mousedown', () => {
    isDragging = true;
});
progressBarPlayhead.addEventListener('touchstart', () => {
    isDragging = true;
});
document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const rect = progressBar.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
        const percentage = offsetX / rect.width;
        //progress.style.width = `${percentage * 100}%`;
        //slider.style.left = `${percentage * 100}%`;
        video.currentTime = percentage * video.duration;
    }
});

document.addEventListener('touchmove', (event) => {
    if (isDragging) {
        const rect = progressBar.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(event.touches[0].clientX, rect.width));
        const percentage = offsetX / rect.width;
        console.log(rect, offsetX, percentage)
        //progress.style.width = `${percentage * 100}%`;
        //slider.style.left = `${percentage * 100}%`;
        progressBarPlayed.style.width = `${percentage * 100}%`;
        progressBarPlayhead.style.left = `${percentage * 100}%`;
        timePlayed.textContent = formatDuration(percentage * video.duration);
        video.currentTime = percentage * video.duration;
    }
});
document.addEventListener('mouseup', () => {
    isDragging = false;
});
document.addEventListener('mouseup', () => {
    isDragging = false;
});
video.addEventListener('click', evt => {
    toggleController(true);
});

video.addEventListener('dblclick', evt => {
    zoomIn(video, evt)

})
var isDown = false;
video.addEventListener('mousedown', function (e) {
    isDown = true;
}, true);

video.addEventListener('mouseup', function () {
    isDown = false;
}, true);

video.addEventListener('mousemove', function (event) {
    event.preventDefault();
    if (isDown) {
        var deltaX = event.movementX;
        var deltaY = event.movementY;
        var rect = video.getBoundingClientRect();
        video.style.left = rect.x + deltaX + 'px';
        video.style.top = rect.y + deltaY + 'px';
    }
}, true);
window.addEventListener('keydown', async evt => {

    if (evt.key === 'a') {
        evt.preventDefault();
        if (!seeking) {
            video.currentTime -= 1;
        }
    } else if (evt.key === 'd') {
        evt.preventDefault();
        if (!seeking) {
            video.currentTime += 1;
        }
    } else if (evt.key === 's') {
        evt.preventDefault();
        if (!seeking) {
            video.currentTime -= 5 / _fps;
        }
    } else if (evt.key === 'f') {
        evt.preventDefault();
        if (!seeking) {
            video.currentTime += 5 / _fps;
        }
    } else if (evt.key === 'q') {
        evt.preventDefault();
        if (!seeking) {
            video.currentTime -= 1 / _fps;
        }
    } else if (evt.key === 'e') {
        evt.preventDefault();
        if (!seeking) {
            video.currentTime += 1 / _fps;
        }
    } else if (evt.key === 'w') {
        evt.preventDefault();
        if (fullscreen.dataset.state === '1') {
            adjustSize();
            fullscreen.dataset.state = '0'
        } else {
            resetZoom();
            fullscreen.dataset.state = '1'
        }
    } else if (evt.key === ' ') {
        evt.preventDefault();
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
});
video.addEventListener('touchstart', function (e) {
    isDown = true;
    const touch = e.touches[0];
    _x = touch.clientX;
    _y = touch.clientY;
}, true);

video.addEventListener('touchend', function () {
    console.log("touchend -------------->")
    isDown = false;
}, true);
let _x, _y;
video.addEventListener('touchmove', function (event) {
    event.preventDefault();
    if (isDown) {
        const touch = event.touches[0];
        var deltaX = touch.clientX - _x;
        var deltaY = touch.clientY - _y;
        _x = touch.clientX;
        _y = touch.clientY;
        var rect = video.getBoundingClientRect();
        video.style.left = rect.x + deltaX + 'px';
        video.style.top = rect.y + deltaY + 'px';
    }
}, true);
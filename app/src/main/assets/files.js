const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "";
const imageRe = new RegExp(/\.(?:jpeg|jpg|webp|gif|png|bmp)$/);
const binaryRe = new RegExp(/\.(?:pdf|epub|apk)$/);
const audioRe = new RegExp(/\.(?:mp3|wav|m4a)$/);
const videoRe = new RegExp(/\.(?:mp4|v)$/, 'i');
const zipRe = new RegExp(/\.(?:zip|gzip)$/);

const toast = document.querySelector('.toast');


function onItemClick(evt) {
    const path = evt.currentTarget.dataset.path;

    if (evt.currentTarget.dataset.isdirectory === "true") {

        window.history.pushState({}, '', `?path=${encodeURIComponent(path)}`);
        render(path);
        return;
    }
    if (imageRe.test(path)) {
        showImage(path);
        return;
    }
    if (audioRe.test(path)) {
        window.location = `/music.html?path=${encodeURIComponent(path)}`
        return;
    }
    if (videoRe.test(path) || substringAfterLast(decodeURIComponent(path), "/").indexOf(".") === -1) {
        window.location = `/video.html?path=${path}`
        return;
    }
    if (path.endsWith(".srt")) {
        window.location = `/subtitle.html?path=${encodeURIComponent(substringBeforeLast(path, ".") + ".mp4")}`

    }
    // else if (evt.detail.path.endsWith(".md")) {
    //     window.location = `/markdown?path=${encodeURIComponent(evt.detail.path)}`
    // }
    else {
        if (binaryRe.test(path)) {
            if (typeof NativeAndroid !== 'undefined') {
                NativeAndroid.openFile(path)
            } else {
                const a = document.createElement('a');
                a.href = `/su?cmd=${`am start -n org.readera/org.readera.read.ReadActivity -d file://${path}`}`;

                //`intent://${encodeURIComponent(path)}#Intent;package=org.readera;component=org.readera.read.ReadActivity;category=android.intent.category.BROWSABLE;scheme=file;end;`
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            return
        }
        window.location = `${baseUri}/file?path=${encodeURIComponent(path)}`
    }


    // detail = evt.detail;
    // showContextMenu(detail)

}


////////////////////////////////////////////////////////////////
window.addEventListener("popstate", function (e) {
    window.location = location;
});

////////////////////////////////////////////////////////////////
bind();
initializeDropZone();
render();

// fetch(`http://192.168.8.55:3000/api/files/size?path=/storage/emulated/0/Download`).then(res => res.text())
//     .then(res => {
//         console.log(humanFileSize(parseInt(res)));
//     })
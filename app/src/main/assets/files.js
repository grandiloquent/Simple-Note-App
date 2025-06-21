const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "";
const imageRe = new RegExp(/\.(?:jpeg|jpg|webp|gif|png|bmp|v)$/);
const binaryRe = new RegExp(/\.(?:pdf|epub|apk|azw3|mobi)$/);
const audioRe = new RegExp(/\.(?:mp3|wav|m4a|flac)$/);
const videoRe = new RegExp(/\.(?:mp4|vv)$/, 'i');
const zipRe = new RegExp(/\.(?:zip|gzip|epub)$/);
const txtRe = new RegExp(/\.(?:txt|java|js|css)$/);


const toast = document.querySelector('.toast');


function onItemClick(evt) {
    const path = evt.currentTarget.dataset.path;

    if (evt.currentTarget.dataset.isdirectory === "true") {

        window.history.pushState({}, '', `?path=${path}`);
        render(path);
        return;
    }
    if (imageRe.test(path)) {
        //showImage(path);
        window.location = `/imageviewer.html?path=${path}`
        return;
    }
    if (audioRe.test(path)) {
        if (path.indexOf("音乐") !== -1) {
            window.location = `/audio.html?path=${path}`
        } else
            window.location = `/music.html?path=${path}`
        return;
    }
    if (videoRe.test(path) || substringAfterLast(decodeURIComponent(path), "/").indexOf(".") === -1) {
        window.location = `/player.html?t=0m0s&path=${path}`
        return;
    }
    if (txtRe.test(path) || substringAfterLast(decodeURIComponent(path), "/").indexOf(".") === -1) {
        window.location = `/code/editor.html?path=${path}`
        return;
    }
    if (path.endsWith(".pdf")) {
        window.location = `/viewer.html?path=${path}`
        return;
    }
    if (path.endsWith(".srt")) {
        window.location = `/subtitle.html?path=${substringBeforeLast(path, ".") + ".mp4"}`

    }
    // else if (evt.detail.path.endsWith(".md")) {
    //     window.location = `/markdown?path=${encodeURIComponent(evt.detail.path)}`
    // }
    else {
        if (binaryRe.test(path)) {
            if (typeof NativeAndroid !== 'undefined') {
                NativeAndroid.openFile(decodeURIComponent(path))
            } else {


                // 使用多看阅读器打开电子书
                // fetch 发送请求可以避免打开新的页面 org.readera/org.readera.read.ReadActivity
                //const apk = path.endsWith("epub") ? "com.duokan.readex/com.duokan.readex.DkReaderActivity" : "com.adobe.reader/com.adobe.reader.AdobeReader"
                const apk = "org.readera/org.readera.read.ReadActivity"

                fetch(`/su?cmd="${`am start -n ${apk} -d 'file://${decodeURIComponent(path)}'"`}`)
                //      window.open(`/su?cmd="${`am start -n org.readera/org.readera.read.ReadActivity -d 'file://${encodeURI(path)}'"`}`,'_blank')

                //`intent://${encodeURIComponent(path)}#Intent;package=org.readera;component=org.readera.read.ReadActivity;category=android.intent.category.BROWSABLE;scheme=file;end;`

            }
            return
        }
        window.location = `${baseUri}/file?path=${path}`
    }


    // detail = evt.detail;
    // showContextMenu(detail)

}


////////////////////////////////////////////////////////////////
window.addEventListener("popstate", function (e) {
    window.location = location;
});
document.addEventListener("keydown", async function (e) {
    if (e.key === "F4") {
        e.preventDefault();
        const searchParams = new URL(window.location).searchParams;
        await fetch(`${baseUri}/lift?path=${encodeURIComponent(searchParams.get("path"))}`);
        location.reload();
    } else if (e.key === "F2") {
        e.preventDefault();

        renameFile(document.querySelector('[data-path]').dataset.path, true);
    }
});
////////////////////////////////////////////////////////////////
bind();
initializeDropZone();
render();

// fetch(`http://192.168.8.55:3000/api/files/size?path=/storage/emulated/0/Download`).then(res => res.text())
//     .then(res => {
//         console.log(humanFileSize(parseInt(res)));
//     })
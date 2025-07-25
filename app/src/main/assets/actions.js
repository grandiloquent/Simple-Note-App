const pathSeperator = "/";

function addContextMenuItem(bottomSheet, title, handler) {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.textContent = title;
    bottomSheet.appendChild(item);
    item.addEventListener('click', handler);
}
function deleteFile(path) {
    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    div.textContent = `您确定要删除 ${substringAfterLast(decodeURIComponent(path), "/")} 吗？`;
    dialog.appendChild(div);
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/file/delete`, {
            method: 'POST',
            body: JSON.stringify([decodeURIComponent(path)])
        });
        queryElementByPath(path).remove();
    });
    document.body.appendChild(dialog);
}
async function downloadDirectory(path) {
    window.open(`${baseUri}/zip?path=${encodeURIComponent(path)}`, '_blank');
}
function getExtension(path) {
    const index = path.lastIndexOf('.');
    if (index !== -1) {
        return path.substr(index + 1);
    }
    return null;
}
function initializeDropZone() {
    document.addEventListener("DOMContentLoaded", evt => {
        var dropZone = document.querySelector('body');
        dropZone.addEventListener('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy'
        });
        dropZone.addEventListener('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
            uploadFiles(e.dataTransfer.files)
        });
        async function uploadFiles(files) {
            document.querySelector('.dialog').className = 'dialog dialog-show';
            const dialogContext = document.querySelector('.dialog-content span');
            const length = files.length;
            let i = 1;
            for (let file of files) {
                dialogContext.textContent = `正在上传 (${i++}/${length}) ${file.name} ...`;
                const formData = new FormData;
                let path = new URL(location.href).searchParams.get('path') || "/storage/emulated/0";
                formData.append('path', path + "/" + file.name);
                formData.append('file', file, path + "/" + file.name);
                try {
                    await fetch(`${baseUri}/upload`, {
                        method: "POST",
                        body: formData
                    }).then(res => console.log(res))
                } catch (e) {
                }
            }
            document.querySelector('.dialog').className = 'dialog'
        }
    });
}
async function loadData(path, size) {
    const res = await fetch(`${baseUri}/files?path=${encodeURIComponent(path || '')}&size=${size || 'false'}`, { cache: "no-cache" });
    return res.json();
}
function newFile() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', "新建文件")
    const input = document.createElement('input');
    input.type = 'text';
    dialog.appendChild(input);
    dialog.addEventListener('submit', async () => {
        let path = new URL(window.location).searchParams.get("path")
            || '/storage/emulated/0';
        const res = await fetch(`${baseUri}/file/new_file?path=${encodeURIComponent(path + "/" + input.value.trim())}`);
        window.location.reload();
    });
    document.body.appendChild(dialog);
}
function newDirectory() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', "新建文件夹")
    const input = document.createElement('input');
    input.type = 'text';
    dialog.appendChild(input);
    dialog.addEventListener('submit', async () => {
        let path = new URL(window.location).searchParams.get("path")
            || '/storage/emulated/0';
        const res = await fetch(`${baseUri}/file/new_dir?path=${encodeURIComponent(path + "/" + input.value.trim())}`);
        window.location.reload();
    });
    document.body.appendChild(dialog);
}

function onDelete() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', '删除文件');
    const div = document.createElement('div');
    div.className = "list-wrapper";
    const obj = JSON.parse(localStorage.getItem('paths') || "[]");
    const buf = [];
    for (let index = 0; index < obj.length; index++) {
        const element = obj[index];
        buf.push(`<div class="list-item" data-path="${element}"><div class="list-item-text">${element}</div>
        <div class="list-item-action">删除</div>
        </div>`);
    }
    div.innerHTML = buf.join('');
    dialog.appendChild(div);
    div.querySelectorAll('.list-item').forEach(listItem => {
        listItem.addEventListener('click', evt => {
            let index = obj.indexOf(listItem.dataset.path);
            if (index !== -1) {
                obj.splice(index, 1);
            }
            listItem.remove();
        });
    });
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/file/delete`, {
            method: 'POST',
            body: JSON.stringify(obj)
        });
        localStorage.setItem('paths', '');
        location.reload();
    });
    document.body.appendChild(dialog);
}
function queryElementByPath(path) {
    return document.querySelector(`[data-path="${path}"]`);
}
function renameFile(path, guess) {

    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', "重命名")
    const input = document.createElement('textarea');
    input.value = substringAfterLast(decodeURIComponent(path), pathSeperator);
    const re = /[(（]/;
    if (re.test(input.value)
    ) {
        let filename = `${input.value.split(re)[0].trim()}.${substringAfterLast(input.value, ".")}`;
        if (filename.indexOf("《") !== -1 && filename.indexOf("》") !== -1) {
            filename = substringAfterLast(filename, "《")
            filename = substringBeforeLast(filename, "》") + "." + substringAfterLast(filename, ".")
        }
        input.value = filename;


    }
    if (guess) {
        input.value = substringBeforeLast(substringAfterLast(decodeURIComponent(document.querySelector('[data-path]:nth-child(2)').dataset.path), "/"), ".").replace(/\d+$/, '');
    }
    dialog.appendChild(input);
    dialog.addEventListener('submit', async () => {
        let textFileName = input.value;
        if (input.selectionStart < textFileName.length) {
            textFileName = textFileName.substring(0, input.selectionStart).trim();
            if (input.value.indexOf('.') !== -1)
                textFileName = textFileName +
                    "." + substringAfterLast(input.value, ".");
        }

        let filename = substringBeforeLast(decodeURIComponent(path), pathSeperator) + pathSeperator + textFileName;
        if (guess) {
            filename = filename + "." + substringAfterLast(path, ".");
        }

        const res = await fetch(`${baseUri}/file/rename?path=${encodeURIComponent(path)}&dst=${encodeURIComponent(filename)}`);
        let item = queryElementByPath(encodeURIComponent(path));
        item.querySelector('.item-title div').textContent = substringAfterLast(filename, pathSeperator);
        item.dataset.path = filename;
        //window.location.reload();
    });
    document.body.appendChild(dialog);
}
async function render(path) {
    setDocumentTitle(path);
    const searchParams = new URL(window.location).searchParams;
    path = path || searchParams.get("path") || '/storage/emulated/0';
    const isSize = searchParams.get("size") || false;
    const res = await loadData(path, isSize);
    this.wrapper.innerHTML = res
        .sort((x, y) => {
            if (x.isDirectory !== y.isDirectory) if (x.isDirectory) return -1; else return 1;
            if (isSize === "0") {
                const dif = y.lastWriteTime - x.lastWriteTime;
                if (dif > 0) {
                    return 1;
                } else if (dif < 0) {
                    return -1;
                } else {
                    return 0;
                }
            } else if (isSize) {
                if (y.length && x.length) {
                    const dif = y.length - x.length;
                    if (dif > 0) {
                        return 1;
                    } else if (dif < 0) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            }
            else {
                return x.path.localeCompare(y.path)
            }
        })
        .map(x => {
            return `<div class="item" data-path="${encodeURIComponent(x.path)}" data-isdirectory=${x.isDirectory}>
            <div class="item-icon ${x.isDirectory ? 'item-directory' : 'item-file'}" 
            ${imageRe.test(x.path) ? `style="background-image:none;display:flex;overflow:hidden;align-item:center;justify-content:center;"` : ''}
            >${imageRe.test(x.path)?`<img style="max-width:100%" data-src="${baseUri}/file?path=${encodeURIComponent(x.path)}">`:''}</div>
          <div class="item-title">
          <div>${substringAfterLast(x.path, "/")}</div>
          <div class="item-subtitle" style="${x.length === 0 ? 'display:none' : ''}">${humanFileSize(x.length)}</div>
          </div>
          
          <div class="item-more">
            <svg viewBox="0 0 24 24">
              <path d="M12 15.984q0.797 0 1.406 0.609t0.609 1.406-0.609 1.406-1.406 0.609-1.406-0.609-0.609-1.406 0.609-1.406 1.406-0.609zM12 9.984q0.797 0 1.406 0.609t0.609 1.406-0.609 1.406-1.406 0.609-1.406-0.609-0.609-1.406 0.609-1.406 1.406-0.609zM12 8.016q-0.797 0-1.406-0.609t-0.609-1.406 0.609-1.406 1.406-0.609 1.406 0.609 0.609 1.406-0.609 1.406-1.406 0.609z"></path>
            </svg>
          </div>
          </div>`
        }).join('');
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', onItemClick);
    })
    document.querySelectorAll('.item-more').forEach(item => {
        item.addEventListener('click', showContextMenu);
    })
    document.querySelectorAll('.item-icon').forEach(item => {

        item.addEventListener('click', async evt => {
            evt.stopPropagation();
            // if (buf.indexOf(item.parentNode.dataset.path) === -1)
            //     buf.push(item.parentNode.dataset.path);
            // localStorage.setItem("paths", JSON.stringify(buf));
            if (new URL(window.location).searchParams.get("y") === "true") {
                const res = await fetch(`${baseUri}/file/delete`, {
                    method: 'POST',
                    body: JSON.stringify([item.parentNode.dataset.path])
                });
                queryElementByPath(item.parentNode.dataset.path).remove();
            } else {
                var rect = evt.target.getBoundingClientRect();
                var x = evt.clientX - rect.left; //x position within the element.
                var y = evt.clientY - rect.top;  //y position within the element.
                if (y > rect.width / 2) {
                    deleteFile(item.parentNode.dataset.path);
                    const buf = (localStorage.getItem("paths") && JSON.parse(localStorage.getItem("paths"))) || [];
                } else {
                    //renameFile(item.parentNode.dataset.path);
                    let array = (localStorage.getItem("paths") && JSON.parse(localStorage.getItem("paths"))) || [];
                    array.push(decodeURIComponent(item.parentNode.dataset.path))
                    array = [...new Set(array)];
                    localStorage.setItem("paths", JSON.stringify(array));
                    toast.setAttribute('message', '已成功写入剪切板');
                }
            }
        });
    })
    
    document.querySelectorAll('.item img')
    .forEach(img=>{
        observer.observe(img);
    })
    
}
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.onload = () => placeholder.style.display = 'none';
            observer.unobserve(img);
        }
    });
}, { rootMargin: '100px' });
function selectSameType(path, isDirectory) {
    const extension = getExtension(path);
    const buf = [];
    document.querySelectorAll('.item').forEach(item => {
        const isdirectory = item.dataset.isdirectory === 'true';
        if (isDirectory) {
            if (isdirectory) {
                buf.push(decodeURIComponent(item.dataset.path));
            }
        } else {
            if (!isdirectory) {
                if (extension === getExtension(item.dataset.path)) {
                    buf.push(decodeURIComponent(item.dataset.path));
                }
            }
        }
    });
    localStorage.setItem("paths", JSON.stringify(buf));
    toast.setAttribute('message', '已成功写入剪切板');
}
function setDocumentTitle(path) {
    if (!path) return;
    document.title = substringAfterLast(decodeURIComponent(path), "/")
}
function showContextMenu(evt) {
    evt.stopPropagation();
    const dataset = evt.currentTarget.parentNode.dataset;
    const path = decodeURIComponent(dataset.path);

    const isDirectory = dataset.isdirectory === 'true';
    const bottomSheet = document.createElement('custom-bottom-sheet');
    addContextMenuItem(bottomSheet, '复制路径', () => {
        bottomSheet.remove();
        //writeText(`data-image="/file?path=${path}"`);
        writeText(`${path}`);

    });
    addContextMenuItem(bottomSheet, '选择', () => {
        bottomSheet.remove();
        let array = (localStorage.getItem("paths") && JSON.parse(localStorage.getItem("paths"))) || [];
        array.push(path)
        array = [...new Set(array)];
        localStorage.setItem("paths", JSON.stringify(array));
        toast.setAttribute('message', '已成功写入剪切板');
    });
    addContextMenuItem(bottomSheet, '选择相同类型', () => {
        bottomSheet.remove();
        selectSameType(path, isDirectory);
    });
    addContextMenuItem(bottomSheet, '重命名', () => {
        bottomSheet.remove();
        renameFile(path);
    });
    addContextMenuItem(bottomSheet, '删除', () => {
        bottomSheet.remove();
        deleteFile(path);
    });
    if (isDirectory) {
        addContextMenuItem(bottomSheet, '加入收藏夹', () => {
            bottomSheet.remove();
            addFavorite(path);
        });
        addContextMenuItem(bottomSheet, '压缩', () => {
            bottomSheet.remove();
            downloadDirectory(path);
        });
    } else {
        if (zipRe.test(path)) {
            addContextMenuItem(bottomSheet, '解压', () => {
                bottomSheet.remove();
                unCompressFile(path);
            });
        } else if (videoRe.test(path)) {
            addContextMenuItem(bottomSheet, '显示视频信息', () => {
                bottomSheet.remove();
                showVideoInformation(path);
            });
            addContextMenuItem(bottomSheet, '预览', () => {
                bottomSheet.remove();
                let imgPath = `${substringBeforeLast(path, "/")}/.images/${substringAfterLast(path, "/")}`;
                showImage(imgPath)
            });
        } else if (path.endsWith('.srt')) {
            addContextMenuItem(bottomSheet, '播放视频', () => {
                bottomSheet.remove();
                window.open(`/srt.html?path=${encodeURIComponent(path)}`);
            });
        }
        addContextMenuItem(bottomSheet, '分享', () => {
            bottomSheet.remove();
            if (typeof NativeAndroid !== 'undefined') {
                NativeAndroid.share(path);
            } else {
                let mimetype = "application/*"
                if (imageRe.test(path)) {
                    mimetype = "image/png";
                } else if (videoRe.test(path)) {
                    mimetype = "video/*";
                }
                fetch(`/su?cmd="${`am start -a android.intent.action.SEND -t ${mimetype} --eu android.intent.extra.STREAM 'file://${path}' --grant-read-uri-permission"`}`)
            }
        });
        addContextMenuItem(bottomSheet, '扫描', () => {
            bottomSheet.remove();
            if (typeof NativeAndroid !== 'undefined') {
                NativeAndroid.scanFile(path);
            }
        });
    }
    document.body.appendChild(bottomSheet);
}
function onMove() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', '移动文件');
    const div = document.createElement('div');
    div.className = "list-wrapper";
    const obj = JSON.parse(localStorage.getItem('paths') || "[]");
    const buf = [];
    for (let index = 0; index < obj.length; index++) {
        const element = obj[index];
        buf.push(`<div class="list-item" data-path="${element}"><div class="list-item-text">${element}</div>
        <div class="list-item-action">删除</div>
        </div>`);
    }
    div.innerHTML = buf.join('');
    dialog.appendChild(div);
    div.querySelectorAll('.list-item').forEach(listItem => {
        listItem.addEventListener('click', evt => {
            let index = obj.indexOf(listItem.dataset.path);
            if (index !== -1) {
                obj.splice(index, 1);
            }
            listItem.remove();
        });
    });
    let path = new URL(window.location).searchParams.get("path")
        || '/storage/emulated/0';
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/file/move?dst=${path}`, {
            method: 'POST',
            body: JSON.stringify(obj)
        });
        localStorage.setItem('paths', '');
        location.reload();
    });
    document.body.appendChild(dialog);
}
function onMenu(evt) {
    evt.stopPropagation();
    const bottomSheet = document.createElement('custom-bottom-sheet');
    addContextMenuItem(bottomSheet, '大小', () => {
        bottomSheet.remove();
        const url = new URL(window.location);
        url.searchParams.set('size', true);
        window.location = url;
    });
    // createPdfFromImages
    addContextMenuItem(bottomSheet, '时间', () => {
        bottomSheet.remove();
        const url = new URL(window.location);
        url.searchParams.set('size', "0");
        window.location = url;
    });
    addContextMenuItem(bottomSheet, '合并图片', () => {
        bottomSheet.remove();
        if (typeof NativeAndroid !== 'undefined') {
            const url = new URL(window.location);
            const path = url.searchParams.get('path');
            NativeAndroid.combineImages(path, 400, null)
        }
    });
    addContextMenuItem(bottomSheet, '创建PDF', () => {
        bottomSheet.remove();
        if (typeof NativeAndroid !== 'undefined') {
            const url = new URL(window.location);
            const path = url.searchParams.get('path');
            NativeAndroid.createPdfFromImages(path)
        }
    });
    document.body.appendChild(bottomSheet);
}
function addFavoriteItem(bottomSheet, path) {
    const item = document.createElement('div');
    item.className = 'menu-item';

    const div = document.createElement('div');
    div.style = `height: 48px;display: flex;align-items: center;justify-content: center`
    div.innerHTML = `<span class="material-symbols-outlined">
close
</span>`;
    div.addEventListener('click', async evt => {
        evt.stopPropagation();
        bottomSheet.remove();
        let res;
        try {
            res = await fetch(`${baseUri}/fav/delete?path=${encodeURIComponent(path)}`);
            if (res.status !== 200) {
                throw new Error();
            }
            toast.setAttribute('message', '成功');
        } catch (error) {
            toast.setAttribute('message', '错误');
        }
    });
    item.appendChild(div);

    const textElement = document.createElement('div');
    textElement.textContent = path;
    item.appendChild(textElement);

    bottomSheet.appendChild(item);
    item.addEventListener('click', () => {
        bottomSheet.remove();
        const url = new URL(window.location);
        url.searchParams.set('path', path);
        window.location = url;
    });
}
async function onShowFavorites() {
    const bottomSheet = document.createElement('custom-bottom-sheet');
    const res = await fetch(`${baseUri}/fav/list`);
    (await res.json()).forEach(p => {
        addFavoriteItem(bottomSheet, p);
    })
    document.body.appendChild(bottomSheet);
}
async function addFavorite(path) {
    const res = await fetch(`${baseUri}/fav/insert?path=${encodeURIComponent(path)}`);
    toast.setAttribute('message', '成功');
}
async function unCompressFile(path) {
    let res;
    try {
        res = await fetch(`${baseUri}/unzip?path=${encodeURIComponent(path)}`);
        toast.setAttribute('message', '成功');
    } catch (error) {
        toast.setAttribute('message', '错误');
    }
}
function showVideoInformation(path) {
    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    dialog.title = "视频信息";
    if (typeof NativeAndroid !== 'undefined') {
        const lines = NativeAndroid.probe(path);
        writeText(lines);
        div.innerHTML = lines.split('\n').map(x => `<div style="white-space:pre">${x}</div>`).join('');
    }
    dialog.appendChild(div);
    dialog.addEventListener('submit', async () => {

    });
    document.body.appendChild(dialog);
}
function showImage(path) {
    const div = document.createElement('div');
    div.className = 'photo-viewer';
    let img = document.createElement('img');
    img.src = `${baseUri}/file?path=${encodeURIComponent(path)}`
    div.appendChild(img);
    document.body.appendChild(div);
    img.addEventListener('click', () => {
        div.remove();
    })
    const deleteButton = document.createElement('button');
    deleteButton.textContent = "X"
    deleteButton.style = `
    position: fixed;
    background: #fff;
    z-index: 10001;
    left: 32px;
    top: 32px;
    padding: 12px;
    border-radius: 50%;
    height: 32px;
    width: 32px;
    line-height: 32px;
    font-size: 24px;
    box-sizing: content-box;
`
    div.appendChild(deleteButton);
    deleteButton.addEventListener('click', async evt => {
        evt.stopPropagation();
        const res = await fetch(`${baseUri}/file/delete`, {
            method: 'POST',
            body: JSON.stringify([path])
        });
        const pv = queryElementByPath(path);
        path = pv.nextSibling.dataset.path
        const g = document.createElement('img');
        g.src = `${baseUri}/file?path=${encodeURIComponent(path)}`
        img.replaceWith(g);
        img = g;
        pv.remove();
    })

    const nextButton = document.createElement('button');
    nextButton.textContent = "-"
    nextButton.style = `
    position: fixed;
    background: #fff;
    z-index: 10001;
    right: 32px;
    top: 32px;
    padding: 12px;
    border-radius: 50%;
    height: 32px;
    width: 32px;
    line-height: 32px;
    font-size: 24px;
    box-sizing: content-box;`

    div.appendChild(nextButton);
    nextButton.addEventListener('click', async evt => {
        evt.stopPropagation();
        const pv = queryElementByPath(path);
        path = pv.nextSibling.dataset.path
        const g = document.createElement('img');
        g.src = `${baseUri}/file?path=${encodeURIComponent(path)}`
        img.replaceWith(g);
        img = g;

    })

    div.addEventListener('click', () => {
        div.remove();
    })
}
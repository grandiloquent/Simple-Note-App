function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function formatCode() {
    const options = { indent_size: 2, space_in_empty_paren: true }
    textarea.value = html_beautify(textarea.value, options);

}
function calculate() {

    processSelection(s => {
        if (s.indexOf('<path') !== -1 &&
            s.indexOf('<text') !== -1) {
            return calculateCenterTextPath(s)
        } else if (/^[0-9]+<path/.test(s)) {
            return calculateMoveAlongNormalPath(s)
        } else if (/\d+,\d+,\d+,\d+/.test(s)) {
            return eval(`drawPolygon(${s})`);
        } else {
            return eval(s);
        }
    })
}
function getLine(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    if (textarea.value[start] === '\n' && start - 1 > 0) {
        start--;
    }
    if (textarea.value[end] === '\n' && end - 1 > 0) {
        end--;
    }
    while (start - 1 > -1 && textarea.value[start - 1] !== '\n') {
        start--;
    }
    while (end + 1 < textarea.value.length && textarea.value[end + 1] !== '\n') {
        end++;
    }
    return textarea.value.substring(start, end + 1);
}
function animateShape(selectedString) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = selectedString;
    svg.style.position = 'absolute';
    svg.style.left = '-100%';
    document.body.appendChild(svg);

    var len = svg.children[0].getTotalLength();
    svg.remove();
    return `
${substringBefore(selectedString, '>')} 
fill="none" 
stroke="red" 
stroke-width="4"
stroke-dasharray="${len}"
stroke-dashoffset="${len}" >
<animate id="" 
begin="1s" 
attributeName="stroke-dashoffset" 
values="${len};0" 
dur="1s" 
calcMode="linear" 
fill="freeze"/>
</${selectedString.match(/(?<=<)[^ ]+/)}>
`;
}
function animatePath(selectedString) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', selectedString);
    svg.appendChild(path);
    svg.style.position = 'absolute';
    svg.style.left = '-100%';
    document.body.appendChild(svg);

    var len = path.getTotalLength();
    svg.remove();
    return `
<path d="${selectedString}" 
fill="none" 
stroke="red" 
stroke-width="4"
stroke-dasharray="${len}"
stroke-dashoffset="${len}" >
<animate id="" 
begin="1s" 
attributeName="stroke-dashoffset" 
values="${len};0" 
dur="1s" 
calcMode="linear" 
fill="freeze"/>
</path>
`;
}
function drawPolygon(x, y, n, radius, options = {}) {
    const array = [];
    array.push(
        [x + radius * Math.cos(options.rotation || 0),
        y + radius * Math.sin(options.rotation || 0)]);
    for (let i = 1; i <= n; i += 1) {
        const angle = (i * (2 * Math.PI / n)) + (options.rotation || 0);
        array.push(
            [
                x + radius * Math.cos(angle),
                y + radius * Math.sin(angle)
            ])
    }
    const d = `M${array.map(x => `${x[0]} ${x[1]}`).join('L')}`;
    return `<path stroke="#FF5722" fill="none" stroke-width="4"  d="${d}">
</path>`
}
function getTotalLength(d) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    svg.style.position = 'absolute';
    svg.style.left = '-100%';
    document.body.appendChild(svg);

    var len = path.getTotalLength();
    svg.remove();
    return len;
}
function getBBox(s, isLen) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = s;
    svg.style.position = 'absolute';
    svg.style.left = '-100%';
    document.body.appendChild(svg);

    var len = isLen ? svg.children[0].getTotalLength() : svg.children[0].getBBox();
    svg.remove()
    return len;
}
function getCenterPath(s, offset) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = s;
    svg.style.position = 'absolute';
    svg.style.left = '-100%';
    document.body.appendChild(svg);

    var len = svg.children[0].getTotalLength();
    let first = svg.children[0].getPointAtLength(len / 2 - offset)
    let second = svg.children[0].getPointAtLength(len / 2 + offset)

    svg.remove()
    return `M${first.x} ${first.y}L${second.x} ${second.y}`;
}
function getNormalPath(s, offset) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = s;
    svg.style.position = 'absolute';
    svg.style.left = '-100%';
    document.body.appendChild(svg);

    var len = svg.children[0].getTotalLength();
    let firstPoint = svg.children[0].getPointAtLength(0)
    let secondPoint = svg.children[0].getPointAtLength(len)
    var deg = Math.atan2(firstPoint.y - secondPoint.y, firstPoint.x - secondPoint.x) * (180 / Math.PI);
    deg = 180 - deg;
    var offsetX = Math.sin(deg / Math.PI * 180) * offset;
    var offsetY = Math.cos(deg / Math.PI * 180) * offset;

    svg.remove()
    return `M${firstPoint.x + offsetX} ${firstPoint.y + offsetY}L${secondPoint.x + offsetX} ${secondPoint.y + offsetY}`;
}

function calculateCenterTextPath(s) {
    let path = substringBefore(s, "<text");
    let text = "<text" + substringAfter(s, "<text");
    let box = getBBox(text, false);
    let v = getCenterPath(path, box.width / 2)
    return `<defs>
    <path
      id="tp1"
      fill="none"
      stroke="red"
      d="${v}" />
    </defs>
  
    <text font-size="36px" font-family="苹方">
      <textPath href="#tp1">${s.match(/(?<=>)[^<]+(?=<\/text)/)}</textPath>
    </text>`

    //s.replace(/(?<=d=")[^"]+(?=")/, v);
}
function calculateMoveAlongNormalPath(s) {
    let offset = substringBefore(s, "<path").trim();
    let path = "<path" + substringAfter(s, "<path");
    let v = getNormalPath(path, parseInt(offset))
    return s.replace(/(?<=d=")[^"]+(?=")/, v);
}

function findExtendPosition(editor) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    let string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (!/\s/.test(string[offsetStart - 1]))
            offsetStart--;
        else {
            let os = offsetStart;
            while (os > 0 && /\s/.test(string[os - 1])) {
                os--;
            }
            if ([...string.substring(offsetStart, os).matchAll(/\n/g)].length > 1) {
                break;
            }
            offsetStart = os;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (!/\s/.test(string[offsetEnd + 1])) {

            offsetEnd++;
        } else {

            let oe = offsetEnd;
            while (oe < string.length && /\s/.test(string[oe + 1])) {
                oe++;
            }
            if ([...string.substring(offsetEnd, oe + 1).matchAll(/\n/g)].length > 1) {
                offsetEnd++;

                break;
            }
            offsetEnd = oe + 1;

        }
    }
    while (offsetStart > 0 && string[offsetStart - 1] !== '\n') {
        offsetStart--;
    }
    // if (/\s/.test(string[offsetEnd])) {
    //     offsetEnd--;
    // }
    return [offsetStart, offsetEnd];
}
async function loadData() {
    const res = await fetch('../an');
    if (res.status !== 200)
        throw new Error(res.status);
    const data = await res.text();
    return data;
}
async function saveData() {
    const res = await fetch('../an', {
        method: 'POST',
        body: textarea.value
    });
    if (res.status !== 200)
        throw new Error(res.status);
    await res.text();
}
async function cacheCode() {
    try {
        textarea.value = await loadData();
    } catch (error) {
        textarea.value = localStorage.getItem('svg');
    }

    document.addEventListener('visibilitychange', async evt => {
        try {
            await saveData();
        } catch (error) {
            localStorage.setItem('svg', textarea.value.trim());
        }
    });
}
function loadSnippets() {
    const s = localStorage.getItem('snippets') || '[]';
    snippets = JSON.parse(s);
    dialogBody.innerHTML = '';
    const array = [];
    snippets.forEach(snippet => {
        array.push(`<div class="dialog-item" style="width: 100%;border:1px solid #ddd;
        display: flex;
    align-items: center;
    justify-content: center;"
    data-snippet="${escapeHtml(snippet)}"
    >
            <div style="flex-grow: 1;
            display: -webkit-box;
-webkit-box-orient: vertical;
max-height: 2.5em;
-webkit-line-clamp: 2;
overflow: hidden;
line-height: 1.25;
text-overflow: ellipsis;
font-weight: normal
            
            ">${escapeHtml(snippet)}</div>
            <div class="dialog-delete"  style="width: 24px;text-align: center;flex-shrink: 0;">X</div>
        </div>`)
    })

    dialogBody.innerHTML = array.join('');
    document.querySelectorAll('.dialog-item')
        .forEach(x => {
            x.addEventListener('click', evt => {
                let selectionStart = textarea.selectionStart;
                let selectionEnd = textarea.selectionEnd;
                let selectedString = textarea.value.substring(selectionStart, selectionEnd);
                textarea.value = `${textarea.value.substring(0, selectionStart)}${x.dataset.snippet}${textarea.value.substring(selectionEnd)}`;
            });
            x.querySelector('.dialog-delete')
                .addEventListener('click', evt => {
                    evt.stopPropagation();
                    const array = [];
                    for (let index = 0; index < snippets.length; index++) {
                        const element = snippets[index]; if (element === x.dataset.snippet) { }
                        if (element === x.dataset.snippet) {
                            continue;
                        }
                        array.push(element);
                    }
                    snippets = [...new Set(array)];
                    localStorage.setItem('snippets', JSON.stringify(snippets));
                    dialog.style.display = 'none';

                });
        })
}
function initialize() {
    document.getElementById('format').addEventListener('click', evt => {
        formatCode();
    })
    document.getElementById('copy').addEventListener('click', evt => {
        const positions = findExtendPosition(textarea);
        let s = textarea.value.substring(positions[0], positions[1]);
        writeText(s)
    })
    document.getElementById('calculate').addEventListener('click', evt => {
        calculate();
    })
    document.getElementById('preview').addEventListener('click', evt => {
        window.open("./svgpreview.html", '_blank');
    })
    document.getElementById('text_snippet').addEventListener('click', evt => {
        window.open("./snippets.html", '_blank');
    })
    document.getElementById('help').addEventListener('click', evt => {
        window.open("./svghelper.html", '_blank');
    })
    document.getElementById('timer').addEventListener('click', evt => {
        const positions = findExtendPosition(textarea);
        let s = textarea.value.substring(positions[0], positions[1]);
        if (!/(?<=id=")[^"]+(?=")/.test(s)) {
            s = s.replace(/\/*?>/, m => {
                return ` id="p1" ${m}`
            });
        }
        if (!/(?<=begin=")[^"]+(?=")/.test(s)) {
            s = s.replace(/\/*?>/, m => {
                return ` begin="p1.end+.3s" ${m}`
            });
        } else {
            s = s.replace(/(?<=begin=")[^"]+(?=")/, m => {
                return m.replace(/[0-9.]+(?=s)/, x => {
                    let f = parseFloat(x);
                    if (f === 0.3) {
                        f = 1;
                    } else {
                        f = 0.3
                    }
                    return f;
                })
            });
        }
        textarea.setRangeText(s, positions[0], positions[1]);
    })
    document.getElementById('pattern').addEventListener('click', evt => {
        dialog.style.display = 'flex';
        loadSnippets();
    })
    document.getElementById('comment').addEventListener('click', evt => {
        //                 processSelection(s => {
        //                     return `<!--
        // Math.sin(30*Math.PI/180)*
        // /Math.sin(30*Math.PI/180)
        // 360,360,6,200
        // -->`
        //                 })
        const positions = findExtendPosition(textarea);
        let s = textarea.value.substring(positions[0], positions[1]);
        if (s.startsWith('<!--') && s.endsWith('-->')) {
            s = s.substring(4);
            s = s.substring(0, s.length - 3);
        } else {
            s = `<!--${s}-->`
        }

        textarea.setRangeText(s, positions[0], positions[1]);

    })
    document.getElementById('degree').addEventListener('click', evt => {
        processSelection(selectedString => {
            let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', selectedString);
            svg.appendChild(path);
            svg.style.position = 'absolute';
            svg.style.left = '-100%';
            document.body.appendChild(svg);

            var len = path.getTotalLength();
            var firstPoint = path.getPointAtLength(0);
            var secondPoint = path.getPointAtLength(len);
            var deg = Math.atan2(firstPoint.y - secondPoint.y, firstPoint.x - secondPoint.x) * (180 / Math.PI);
            svg.remove();
            return deg
        })
    })

}
function processSelection(fn) {
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    let selectedString = textarea.value.substring(selectionStart, selectionEnd);
    if (!selectedString) {
        selectedString = getLine(textarea);
        if (textarea.value[selectionStart] !== '\n') {
            while (selectionStart + 1 < textarea.value.length && textarea.value[selectionStart + 1] !== '\n') {
                selectionStart++;
            }
            selectionStart++;
        }

        selectionEnd = selectionStart
        textarea.value = `${textarea.value.substring(0, selectionStart)}
${fn(selectedString.trim())}${textarea.value.substring(selectionEnd)}`;
        return;
    }
    textarea.value = `${textarea.value.substring(0, selectionStart)}${fn(selectedString.trim())}${textarea.value.substring(selectionEnd)}`;

}

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
    return [first, second];
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
    const points = getCenterPath(path, box.width / 2);
    const first = points[0];
    const second = points[1];
    let v = `M${first.x} ${first.y}L${second.x} ${second.y}`
    return `<defs>
    <path
      id="tp1"
      fill="none"
      stroke="red"
      d="${v}" />
    </defs>
  
  

    <text font-size="36px" font-family="苹方">
      <textPath href="#tp1" startOffset="-100%">${s.match(/(?<=>)[^<]+(?=<\/text)/)}
      <animate attributeName="startOffset" from="-100%" to ="0%" begin="0s" dur="1s" repeatCount="1" id="t1" fill="freeze"/>
      </textPath>
    </text>
    
    `

    //s.replace(/(?<=d=")[^"]+(?=")/, v);
}
function calculateMoveAlongNormalPath(s) {
    let offset = substringBefore(s, "<path").trim();
    let path = "<path" + substringAfter(s, "<path");
    let v = getNormalPath(path, parseInt(offset))
    return s.replace(/(?<=d=")[^"]+(?=")/, v);
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
    document.getElementById('search').addEventListener('click', evt => {
        const positions = findExtendPosition(textarea);
        let s = textarea.value.substring(positions[0], positions[1]);

        const first = substringBefore(s, "\n");
        const second = substringAfter(s, "\n");
        //const regex = new RegExp(`\\b${substringBefore(first, " ")}\\b`, 'g');
        const regex = new RegExp(`${substringBefore(first, " ")}`, 'g');
        s = first + "\n" + second.replaceAll(regex,
            substringAfter(first, " ").trim());

        textarea.setRangeText(s, positions[0], positions[1]);
    })
    document.getElementById('help').addEventListener('click', evt => {
        window.open("./svghelper.html", '_blank');
    })
    document.getElementById('timer').addEventListener('click', evt => {
        const positions = findExtendPosition(textarea);
        let s = textarea.value.substring(positions[0], positions[1]).trim();
        if (!s) {
            if (textarea.value.indexOf('.1s') == -1) {
                textarea.value = textarea.value.replaceAll(/(?<=["+])[0-9.]+s(?=")/g, '.1s');
            } else {
                textarea.value = textarea.value.replaceAll(/(?<=["+])[0-9.]+s(?=")/g, '1s');
            }
            return;
        }

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
            }).replace(/(?<=dur=")[^"]+(?=")/, m => {
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
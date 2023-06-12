function checkNextLine(s, end, f) {
    let start = end;
    let length = s.length;
    while (end < length && s[end + 1] !== '\n') {
        end++;
    }
    if (f(s.slice(start, end + 1))) {
        return end;
    }
    return 0;
}

function checkPreviousLine(s, end, f) {
    let start = end;
    while (end > 0 && s[end - 1] !== '\n') {
        end--;
    }
    if (f(s.slice(end, start))) {
        return end;
    }
    return 0;
}

async function executeSqlStatement(baseUri, statement) {
    const res = await fetch(`${baseUri}/sql`, {
        method: 'POST',
        body: statement
    });
    return await res.text();
}

function formatCode(textarea) {
    const s = textarea.value;
    let length = textarea.value.length;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    let r = new RegExp(/[ a-zA-Z*/_+%^&:?!.\[\]()\\-]+/);
    while (start > 0 && r.test(s[start - 1])) {
        start--;
        console.log(start, s[start], s.codePointAt(start));
    }
    while (end < length && r.test(s[end + 1])) {
        end++;
    }

    textarea.setRangeText(` \`${s.slice(start, end + 1).trim()}\` `, start, end + 1, "end");

}

function formatHead(textarea) {
    const s = textarea.value;
    let start = textarea.selectionStart;
    while (start > 0 && s[start - 1] !== '\n') {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && s[end + 1] !== '\n') {
        end++;
    }
    let str = textarea.value.slice(start, end + 1);
    if (str.startsWith('#')) {
        textarea.setRangeText(`#${str}`, start, end + 1);
        return;
    }
    textarea.setRangeText(`## ${str}`, start, end + 1);
}

function getBaseUri() {
    return window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8200" : "";
}

async function loadNote(baseUri, id) {
    const res = await fetch(`${baseUri}/note?id=${id}`);
    return await res.json();
}

async function renderNote() {
    const res = await loadNote(getBaseUri(), id);
    document.title = res["title"];
    textarea.value = `${res["title"]}
    
${res["content"]}`;
}

async function translate(baseUri, to) {
    const s = textarea.value;
    let start = textarea.selectionStart;
    while (start > 0 && s[start - 1] !== '\n') {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && s[end + 1] !== '\n') {
        end++;
    }
    let str = textarea.value.slice(start, end + 1);
    const res = await fetch(`${baseUri}/trans?q=${encodeURIComponent(str)}&to=${to || 'zh'}`);
    const obj = await res.json();
    const contents = obj["sentences"].map(x => x["trans"]).join(" ");
    textarea.setRangeText(contents, start, end + 1, 'end');
}
async function saveNote() {
    let s = textarea.value.trim();
    let body = {
        id: id ? parseInt(id, 10) : 0,
        title: substringBefore(s, "\n").trim(),
        content: substringAfter(s, "\n").trim()
    };
    // await submitNote(getBaseUri(), JSON.stringify(body));
    // document.getElementById('toast').setAttribute('message', '成功');
    let res;
    try {
        res = await fetch(`${getBaseUri()}/note`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (res.status !== 200) {
            throw new Error();
        }
        toast.setAttribute('message', '成功');
    } catch (error) {
        toast.setAttribute('message', '错误');
    }
}

async function copyLine(textarea) {
    const s = textarea.value;
    let start = textarea.selectionStart;
    while (start > 0 && s[start - 1] !== '\n') {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && s[end + 1] !== '\n') {
        end++;
    }
    let str = textarea.value.slice(start, end + 1);
    writeText(str);
}

function findCodeBlock(fn) {
    const s = textarea.value;
    let length = textarea.value.length;

    let start = textarea.selectionStart;
    while (start > 0) {
        if (start - 2 >= 0 && s[start] === '`' && s[start - 1] === '`' && s[start - 2] === '`') {
            while (start < length) {
                if (s[start] === '\n') {
                    start++
                    break;
                }
                start++;
            }
            break;
        }
        start--;
    }
    let end = textarea.selectionEnd;
    while (end < length) {
        if (end + 2 < length && s[end] === '`' && s[end + 1] === '`' && s[end + 2] === '`') {
            break;
        }
        end++;
    }
    let str = textarea.value.slice(start, end);
    fn(start, end, str);
}

async function insertLinkWithTitle() {
    let res;
    try {
        const str = await readText();
        res = await fetch(`${getBaseUri()}/title?path=${str}`);
        if (res.status !== 200) {
            throw new Error();
        }

        textarea.setRangeText(`[${(await res.text()).trim()}](${str})`, textarea.selectionStart, textarea.selectionEnd);
    } catch (error) {
        console.log(error);
        toast.setAttribute('message', '错误');
    }
}
async function uploadImage(baseUri, image, name) {
    const form = new FormData();
    form.append('images', image, name)
    const response = await fetch(`${baseUri}/picture`, {
        method: 'POST',
        body: form
    });
    return await response.text();
}
function tryUploadImageFromClipboard(baseUri, success, error) {
    navigator.permissions.query({
        name: "clipboard-read"
    }).then(result => {
        if (result.state === "granted" || result.state === "prompt") {
            navigator.clipboard.read().then(data => {
                console.log(data[0].types);
                const blob = data[0].getType("image/png");
                console.log(blob.then(res => {
                    const formData = new FormData();
                    formData.append("images", res, "1.png");
                    fetch(`${baseUri}/picture`, {
                        method: "POST",
                        body: formData
                    }).then(res => {
                        return res.text();
                    }).then(obj => {
                        success(obj);
                    })
                }).catch(err => {
                    console.log(err)
                    error(err);
                }))
            })
                .catch(err => {
                    error(err);
                });
        } else {
            error(new Error());
        }
    });
}
function upload(baseUri) {
    if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
        tryUploadImageFromClipboard(baseUri, (ok) => {
            const string = `![](/images/${ok})\n\n`;
            textarea.setRangeText(string, textarea.selectionStart, textarea.selectionStart);
        }, (error) => {
            console.log(error);
            const input = document.createElement('input');
            input.type = 'file';
            input.addEventListener('change', async ev => {
                const file = input.files[0];
                const imageFile = await uploadImage(baseUri, file, file.name);
                const string = `![](/images/${imageFile})\n\n`;
                textarea.setRangeText(string, textarea.selectionStart, textarea.selectionStart);
            });
            input.click();
        });
    } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', async ev => {
            const file = input.files[0];
            const imageFile = await uploadImage(file, file.name);
            const string = `![](https://static.lucidu.cn/images/${imageFile})\n\n`;
            textarea.setRangeText(string, textarea.selectionStart, textarea.selectionStart);
        });
        input.click();
    }
}
function formatComments(textarea) {
    const s = textarea.value;
    let start = textarea.selectionStart;
    while (start > 0 && s[start - 1] !== '\n') {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && s[end + 1] !== '\n') {
        end++;
    }

    if (end + 2 >= length) {
        textarea.setRangeText(`${prefix} ${textarea.value.slice(start, end + 1)}`, start, end + 2);
        return;
    }
    let endIndex = end + 1;
    let regex = new RegExp(/\s/);

    while (endIndex < length && regex.test(s[endIndex + 1])) {
        endIndex++;
    }
    let spaces = s.slice(end + 1, endIndex + 1).replace(/^[\r\n]+/g, '');
    let contents = textarea.value.slice(start, end + 1).trim();
    let array = [];
    let count = 0;
    let buf = [];
    regex = new RegExp(/[\s\u4E00-\u9FA5]/);
    for (let index = 0; index < contents.length; index++) {
        const element = contents[index];
        buf.push(element);
        if (count >= 32 - spaces.length) {
            if (regex.test(element)) {
                array.push(buf.join(''));
                buf = [];
                count = 0;
            }
        }
        count++;
    }

    if (buf.length > 0) {
        array.push(buf.join(''));
    }
    let strings = array.map(x => `${spaces}${prefix} ${x}`).join('\n');
    //     if (/\.(?:wxml|html|htm)$/.test(path)) {
    //         strings = `${spaces}<!--${strings}
    // ${spaces}-->`
    //     }
    textarea.setRangeText(strings, start, end + 1);

}
///////////////////////////////
const textarea = document.querySelector('textarea');
const id = new URL(window.location).searchParams.get('id');
let prefix="//";
const openLink = document.querySelector('#open-link');
openLink.addEventListener('click', async evt => {
    const s = textarea.value;
    let start = textarea.selectionStart;
    const stop = "\n() ";
    while (start > 0 && stop.indexOf(s[start - 1]) === -1) {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && stop.indexOf(s[end + 1]) === -1) {
        end++;
    }
    let str = textarea.value.slice(start, end + 1);

    if (/^([a-zA-Z0-9_]+\.)+[a-zA-Z0-9_]+$/.test(str)) {
        if (typeof NativeAndroid != 'undefined') {
            NativeAndroid.launchApp(str);
        }
    } else if (!str.trim()) {
        if (typeof NativeAndroid != 'undefined') {
            textarea.value = NativeAndroid.listAllPackages();
        }
    } else {
        if (str.startsWith("$")) {
            if (/\$ +ffmpeg +/.test(str)) {

                if (typeof NativeAndroid != 'undefined') {
                    str = str.replace(/\$ +ffmpeg +/, '');
                    NativeAndroid.runFFmpeg(str);
                }
            } else {
                let res;
                try {
                    res = await fetch(`${getBaseUri()}/su?cmd=${encodeURIComponent(substringAfter(str, " "))}`);
                    if (res.status !== 200) {
                        throw new Error();
                    }
                    const obj = await res.json();
                    textarea.setRangeText(`
${obj.stdout}
`, end, end);
                } catch (error) {
                    toast.setAttribute('message', '错误');
                }
            }
        } else {
            if (str.trim().startsWith('- ')) {
                window.location = substringAfter(str, "- ");
            } else
                window.location = str;
        }
    }
});
const translateEnglish = document.querySelector('#translate-english');
translateEnglish.addEventListener('click', async evt => {
    await translate(getBaseUri(), "en")
});
const translateChinese = document.querySelector('#translate-chinese');
translateChinese.addEventListener('click', async evt => {
    await translate(getBaseUri());
});
document.querySelector('#save-note').addEventListener('click', evt => {
    saveNote();
});
document.querySelector('#format-head').addEventListener('click', evt => {
    formatHead(textarea)
});
document.querySelector('#format-code').addEventListener('click', evt => {
    formatCode(textarea);

});
document.querySelector('#code').addEventListener('click', evt => {
    // findCodeBlock((start, end, str) => {
    //     const prefix = /^\s+/.exec(str)[0];
    //     textarea.setRangeText(str.split('\n')
    //         .map(x => x.replace(prefix, ''))
    //         .join('\n')
    //         , start, end);
    // });
    formatComments(textarea);
});
document.querySelector('#copy-line').addEventListener('click', evt => {
    copyLine(textarea);
});

const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "";

document.addEventListener('keydown', async evt => {
    if (evt.ctrlKey) {
        if (evt.key === '0') {
            findCodeBlock(async (start, end, str) => {
                textarea.setRangeText(`
                
\`\`\`
${await executeSqlStatement(getBaseUri(), str.trim())}
\`\`\`

                `, end + 3, end + 3, 'end');
            });
        } if (evt.key === '1') {
            evt.preventDefault();
            findCodeBlock(async (start, end, str) => {
                writeText(str);
            });
        } if (evt.key === '2') {
            evt.preventDefault();
            findCodeBlock(async (start, end, str) => {
                textarea.setRangeText((await readText()) + "\n", start, end);
            });
        } if (evt.key === 'l') {
            evt.preventDefault();
            textarea.setRangeText(`\`\`\`html
${await readText()}   
\`\`\`        
                            `, textarea.selectionStart, textarea.selectionEnd);
        } else if (evt.key === 'c') {
            if (textarea.selectionStart === textarea.selectionEnd) {
                evt.preventDefault();
                copyLine(textarea);
            }
        } else if (evt.key === 'h') {
            evt.preventDefault();
            formatHead(textarea)
        } else if (evt.key === 'm') {
            evt.preventDefault();
            const str = await readText();
            textarea.setRangeText(match_options(str), textarea.selectionStart,
                textarea.selectionEnd, 'end')
        } else if (evt.key === 'p') {
            evt.preventDefault();
            //             const value = await readText();
            //             textarea.setRangeText(`

            // ###

            //     \`\`\`
            // ${value}
            // \`\`\`

            //             `, textarea.selectionStart,
            //                 textarea.selectionEnd, 'end')
            window.open(`/markdown.html?id=${id}`);
        } else if (evt.key === 's') {
            evt.preventDefault();
            saveNote()
        } else if (evt.key === 'g') {
            const string = textarea.value.trim();
            const first = string.indexOf('\n');
            const second = string.indexOf('\n', first + 1);
            textarea.value = textarea.value.replaceAll(
                string.substring(0, first),
                string.substring(first + 1, second));
        } else if (evt.key === 't') {
            evt.preventDefault();
            insertLinkWithTitle();
        } else if (evt.key === 'u') {
            evt.preventDefault();
            upload(baseUri);
        }else if (evt.key === 'd') {
            evt.preventDefault();
            formatComments(textarea);
        }
    }
});

if (id) {
    renderNote();
}

const preview = document.querySelector('.preview');
preview.addEventListener('click', evt => {
    window.location = `/markdown.html?id=${id}`
});

const calculate = document.querySelector('.calculate');
calculate.addEventListener('click', evt => {
    const s = textarea.value;
    let start = textarea.selectionStart;

    while (start > 0 && s[start - 1] !== '\n') {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && s[end] !== '\n') {
        end++;
    }
    let str = textarea.value.slice(start, end + 1);
    // if (end + 2 >= length) {
    //     textarea.setRangeText(`${prefix} ${str}`, start, end + 2);
    //     return;
    // }
    textarea.setRangeText(` = ${eval(str)}`, end, end);
});

document.querySelector('.link').addEventListener('click', evt => {
    insertLinkWithTitle();
});

const contentCopy = document.querySelector('#content_copy');
contentCopy.addEventListener('click', evt => {
    const re = new RegExp(/[;\s,:']/);
    const s = textarea.value;
    let start = textarea.selectionStart;

    while (start > 0 && !re.test(s[start - 1])) {
        start--;
    }
    let length = textarea.value.length;
    let end = textarea.selectionEnd;
    while (end < length && !re.test(s[end])) {
        end++;
    }
    writeText(`- \`${s.substring(start, end)}\`：`);

});

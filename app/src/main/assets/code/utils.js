const items = [
    [
        1,
        "preview",
        "预览",
        async () => {

            await preview();
        }
    ],
    [
        2,
        "text_snippet",
        "代码",
        async () => {

            await saveData();
            if (typeof NativeAndroid !== 'undefined') {
                NativeAndroid.launchApp("psycho.euphoria.l", `/code/notes.html`);
            } else {
                window.open('notes.html', '_blank');
            }
        }
    ],
    [
        3,
        "close",
        "剪行",
        () => {

            deleteLine(textarea)
        }
    ],
    [
        4,
        "close",
        "剪块",
        () => {
            deleteBlock(textarea)
        }
    ],
    [
        5,
        "content_copy",
        "复行",
        () => {
            copyLine(textarea)
        }
    ],
    [
        6,
        "data_object",
        "括号",
        () => {
            formatParentheses(textarea)
        }
    ],
    [
        7,
        "light_mode",
        "模式",
        () => {
            let mode = parseInt(document.body.dataset.mode);
            mode++;
            if (mode > 2) {
                mode = 1;
            }
            document.body.dataset.mode = mode;
            localStorage.setItem('light_mode', mode);
            setMode(mode);

        }
    ],

    [
        8,
        "comment",
        "注释",
        () => {
            commentLine(textarea)
        }
    ],

    [
        9,
        "density_large",
        "正常",
        () => {
            duplicateLine(textarea);
        }
    ],
    [
        10,
        "density_large",
        "截断",
        () => {
            breakLine1(textarea);
        }
    ],
    [
        11,
        "content_copy",
        "复块",
        () => {
            copyBlock(textarea)
        }
    ],
    [
        12,
        "close",
        "删注",
        () => {

            deleteComments(textarea)
        }
    ], [
        13,
        "content_copy",
        "复等",
        () => {
            copyVariables(textarea)
        }
    ],
    [
        14,
        "function",
        "展数",
        () => {
            functionsExpand(textarea);
        }
    ], [
        15,
        "variables",
        "收变",
        () => {

            variables(textarea);
        }
    ], [
        16,
        "data_object",
        "展变",
        () => {

            parentheses(textarea);
        }
    ],

    [
        17,
        "code",
        "格式",
        () => {
            formatCode();
        }
    ],
    [
        18,
        "exposure_neg_2",
        "展开",
        () => {
            expandInline(textarea);

        }
    ],
    [
        19,
        "exposure_neg_2",
        "展定",
        () => {
            expandDefine(textarea);

        }
    ],
    [
        20,
        "go_to_line",
        "调试",
        () => {
            goToLine(textarea);
        }
    ],



    [
        21,
        "exposure_plus_2",
        "放大",
        () => {
            decrease2(textarea, true);

        }
    ],
    [
        22,
        "exposure_neg_2",
        "缩小",
        () => {
            decrease2(textarea);

        }
    ],

    [
        23,
        "text_snippet",
        "代码",
        async () => {

            await saveData();
            if (typeof NativeAndroid !== 'undefined') {
                NativeAndroid.launchApp("psycho.euphoria.l", `/code/notes.html`);
            } else {
                window.open('notes.html', '_blank');
            }
        }
    ],



    [
        24,
        "comment",
        "注释",
        () => {
            comment(textarea);
        }
    ],
    [
        25,
        "content_copy",
        "粘字",
        () => {
            pasteWord(textarea)
        }
    ],
    [
        26,
        "keyboard",
        "输入法",
        () => {
            changeInputMethod();
        }
    ],
    [
        27,
        "exposure_plus_2",
        "放大",
        () => {
            decrease2(textarea, true);

        }
    ],
    [
        28,
        "exposure_neg_2",
        "缩小",
        () => {
            decrease2(textarea);

        }
    ], [
        29,
        "save",
        "保存",
        async () => {
            await saveData();
            // if (!path) {
            //     if (id) {
            //         try {
            //             const response = await fetch(`${baseUri}/code/random`);
            //             if (response.status > 399 || response.status < 200) {
            //                 throw new Error(`${response.status}: ${response.statusText}`)
            //             }
            //             const results = await response.text();
            //             window.location.href = `?id=${results}`
            //         } catch (error) {
            //             console.log(error);
            //         }
            //     }
            //     else
            //         window.location.reload();
            // }

        }
    ],
    [
        30,
        "arrow_forward",
        "前进",
        async () => {
            await saveData();
            if (id) {
                try {
                    const response = await fetch(`${baseUri}/code/random?q=WebGL 练习`);
                    if (response.status > 399 || response.status < 200) {
                        throw new Error(`${response.status}: ${response.statusText}`)
                    }
                    const results = await response.text();
                    window.location.href = `?id=${results}`
                } catch (error) {
                    console.log(error);
                }
            }
            else
                window.location.reload();
        }
    ],
    [
        31,
        "switch_right",
        "交换",
        () => {
            switchStatement(textarea);
        }
    ],
    [
        32,
        "find_replace",
        "替换",
        () => {
            findReplace(textarea);
        }
    ],
    [
        33,
        "text_snippet",
        "颜色",
        () => {
            insertSnippet2();
        }
    ],

    [
        34,
        "decimal_decrease",
        "简化",
        () => {
            decreaseCode(textarea)
            formatCode();
            insertSnippet1();
        }
    ],
    [
        35,
        "code",
        "格式",
        () => {
            formatCode();
        }
    ],

    [
        36,
        "go_to_line",
        "调试",
        () => {
            goToLine(textarea);
        }
    ],
    [
        37,
        "go_to_line",
        "搜索",
        () => {
            searchWord(textarea);
        }
    ],



    [
        38,
        "text_snippet",
        "图片",
        () => {
            insertSnippet1();
        }
    ],



]

console.log(JSON.stringify(items.map(x => [x[0], x[2]])))

function insertItem(indexs, selector, klass) {
    const bottomBar = document.querySelector(selector);
    if (!bottomBar) return;
    bottomBar.innerHTML = '';
    const array = [];
    for (let j = 0; j < indexs.length; j++) {
        for (let index = 0; index < items.length; index++) {
            if (indexs[j] === items[index][0]) {
                array.push(items[index]);
                break;
            }
        }
    }
    array.filter(x => indexs.indexOf(x[0]) !== -1).forEach(x => {
        const div = document.createElement('div');
        div.className = klass || "item";
        div.innerHTML = `<span class="material-symbols-outlined">${x[1]}</span>
        <div class="pivot-bar-item-title">${x[2]}</div>`;
        div.addEventListener('click', evt => {
            evt.stopPropagation();
            x[3]();
        });
        bottomBar.appendChild(div);
    })
}
const topIndexs = JSON.parse(localStorage.getItem('topIndexs'))
    || [1, 23, 4, 34, 30, 29, 36, 37]
insertItem(topIndexs, '.bar-renderer.top', 'bar-item-tab');
const bottomIndexs = JSON.parse(localStorage.getItem('bottomIndexs')) ||
    [35, 9, 10, 16, 8, 15, 13, 14]
insertItem(bottomIndexs, '.bar-renderer.bottom', 'bar-item-tab');
const rightIndexs = JSON.parse(localStorage.getItem('rightIndexs')) ||
    [3, 6, 18, 27, 28]
insertItem(rightIndexs, '.items-wrapper.selected');
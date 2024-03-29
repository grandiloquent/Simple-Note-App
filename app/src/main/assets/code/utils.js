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
    [
        39,
        "text_snippet",
        "So",
        () => {
            insertVariables(textarea, word => `${word} = smoothstep(vec3(0.0, 0.0,0.0),vec3(1.0, 1.0,1.0),abs(${word}));`);
        }
    ],
    [
        40,
        "text_snippet",
        "函数",
        () => {
            functions(textarea);
        }
    ], [
        41,
        "text_snippet",
        "重构",
        () => {
            refractorCode(textarea);
        }
    ], [
        42,
        "text_snippet",
        "计算",
        () => {
            let points = getLine(textarea);
            let line = textarea.value.substring(points[0], points[1]);
            textarea.setRangeText(eval(line), points[0], points[1])
        }
    ],
    [
        43,
        "text_snippet",
        "代码",
        () => {
            snippet(textarea);
        }
    ],
    [
        44,
        "text_snippet",
        "变量",
        () => {
            variablesReplace(textarea);
        }
    ],
    [
        45,
        "text_snippet",
        "翻译",
        () => {
            translate(textarea);
        }
    ],


]


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


async function initializeToolbars() {
    let topIndexs;
    let bottomIndexs;
    let rightIndexs;

    try {
        const response = await fetch(`${baseUri}/ts`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }

        const results = JSON.parse(await response.text());
        if (results) {
            topIndexs = results[0];
            bottomIndexs = results[1];
            rightIndexs = results[2];
        }
    } catch (error) {
        topIndexs = [1, 4, 3, 8, 35, 36, 34, 2]
        bottomIndexs = [40, 9, 10, 15, 37]
        rightIndexs = [30, 32, 18, 43, 42]
    }
    insertItem(topIndexs, '.bar-renderer.top', 'bar-item-tab');
    insertItem(bottomIndexs, '.bar-renderer.bottom', 'bar-item-tab');
    insertItem(rightIndexs, '.items-wrapper.selected');
}
initializeToolbars()


function getExpressionLine(textarea) {
    let selectionStart = textarea.selectionStart;
    while (selectionStart - 1 > -1 && textarea.value[selectionStart - 1] !== '\n') {
        selectionStart--;
    }
    let selectionEnd = textarea.selectionEnd;
    while (selectionEnd < textarea.value.length) {
        selectionEnd++;
        if (textarea.value[selectionEnd] === '\n') {
            break;
        }
    }
    if (textarea.value.substring(selectionStart, selectionEnd).indexOf("=") !== -1) {
        selectionEnd = textarea.selectionEnd;
        while (selectionEnd < textarea.value.length) {
            selectionEnd++;
            if (textarea.value[selectionEnd] === ';'
                || textarea.value[selectionEnd] === '{'
                || textarea.value[selectionEnd] === '}'

            ) {

                break;
            }
        }
        while (selectionEnd < textarea.value.length) {
            selectionEnd++;
            if (textarea.value[selectionEnd] === '\n') {
                break;
            }
        }
    }

    return [selectionStart, selectionEnd];
}
function duplicateLine(textarea) {
    //     if (textarea.selectionStart !== textarea.selectionEnd) {
    //         let start = textarea.selectionStart;
    //         let end = textarea.selectionEnd;
    //         const selectedString = textarea.value.substring(start, end);

    //         while (start - 1 > -1) {
    //             if (textarea.value[start] === ">"
    //                 && start - "script".length > -1 && textarea.value.substring(start - "script".length, start) === "script") {
    //                 break;
    //             }
    //             start--;
    //         }
    //         end = textarea.value.indexOf("</script>", end);
    //         const s = textarea.value.substring(start, end);
    //         const name = s.match(/(?<=out vec4 )[a-zA-Z0-9_]+(?=;)/)[0];
    //         end = textarea.selectionEnd;
    //         while (end < textarea.value.length && textarea.value[end] !== '\n') {
    //             end++;
    //         }
    //         textarea.setRangeText(`
    // if(${selectedString}==0.0){
    //  ${name}=vec4(1.0,0.0,0.0,1.0);
    // }else if(${selectedString}==1.0){
    //     ${name}=vec4(0.0,1.0,0.0,1.0);
    // }else if(${selectedString}>0.0 && ${selectedString}<0.5){
    //     ${name}=vec4(1.0,1.0,0.0,1.0);
    // }else if(${selectedString}==0.5){
    //     ${name}=vec4(0.0,1.0,1.0,1.0);
    // }else if(${selectedString}>0.5 && ${selectedString}<1.0){
    //     ${name}=vec4(1.0,0.0,1.0,1.0);
    // }else if(${selectedString}>1.0){
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    // }else if(${selectedString}<0.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    // }else{
    //     ${name}=vec4(0.0,0.0,1.0,1.0);
    // }
    // return;

    // /*

    // if(${selectedString}==0.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}==1.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}>0.0 && ${selectedString}<0.5){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}==0.5){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}>0.5 && ${selectedString}<1.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}>1.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}<1.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}<0.0){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    //    if(${selectedString}-0.5<0.0001){
    //     ${name}=vec4(0.0,0.0,0.0,1.0);
    //    }else{
    //     ${name}=vec4(1.0,1.0,1.0,1.0);
    //    }
    //    return;

    // */
    //         ` , end, end);

    //         return;
    //     }
    //     const points = getLine(textarea);
    //     let s = textarea.value.substring(points[0], points[1]).trim();
    //     if (s.startsWith("//")) {
    //         textarea.selectionStart = points[1] + 1;
    //         let p = getLine(textarea);
    //         textarea.setRangeText("", p[0], p[1]);
    //         textarea.setRangeText(substringAfter(s, "//"), points[0], points[1]);
    //     } else {
    //         let name = "";
    //         let pn = getNumber(textarea);
    //         console.log(pn, textarea.value.substring(pn[0], pn[1]).trim());
    //         let number = parseFloat(textarea.value.substring(pn[0], pn[1]).trim());
    //         if (!isNaN(number)) {
    //             console.log(number)
    //             if (number === 1.0) {
    //                 name = "0.0";
    //             } else if (number === 0.0) {
    //                 name = "1.0";
    //             } else {
    //                 name = "0.0";
    //             }

    //             textarea.setRangeText(name, pn[0], pn[1]);
    //             let selectionStart = textarea.selectionStart;
    //             while (selectionStart - 1 > -1 && textarea.value[selectionStart] !== '\n') {
    //                 selectionStart--;
    //             }
    //             textarea.setRangeText("\n// " + s, selectionStart, selectionStart);
    //             return;
    //         } else {
    //             console.log("==============");
    //             let start = textarea.selectionStart;
    //             let end = textarea.selectionEnd;
    //             while (start - 1 > -1 && /[a-zA-Z0-9_\u3400-\u9FBF]/.test(textarea.value[start-1])) {
    //                 start--;
    //             }
    //             while (end + 1 < textarea.value.length) {
    //                 if (textarea.value[end + 1] !== ",") {
    //                     console.log("==============",s.substring());
    //                     let str = s.substring(0, start ) + "0.0" + s.substring(end);
    //                     textarea.setRangeText("\n" + str, points[1], points[1]);
    //                     break
    //                 }
    //                 end++;
    //             }

    //         }
    //         let selectionEnd = textarea.selectionEnd;
    //         while (selectionEnd < textarea.value.length && textarea.value[selectionEnd] !== '\n') {
    //             selectionEnd++;
    //         }
    //         textarea.setRangeText("// ", points[0], points[0]);
    //     }

    let [expressionStart, expressionEnd] = getExpressionLine(textarea);
    let str = textarea.value.substring(expressionStart, expressionEnd).trim();
    if (str.startsWith("//")) {
        let endvv = expressionEnd;
        let p = getLineAt(textarea, endvv);
        endvv = p[1];
        str = str.split('\n').map(x => substringAfter(x, "//")).join('\n');
        textarea.setRangeText(`${str}`, expressionStart, endvv);
        return;
    }
    formatExpressionLine(textarea, (s, start, end) => {

        if (textarea.value[textarea.selectionStart] === '='
            || textarea.value[textarea.selectionStart - 1] === '=') {

            return `// ${s}
${s}`;
        }
        let p = getWord(textarea);
        let index = s.indexOf("=", p[1] - start);
        if (index !== -1) {
            let lp = getLine(textarea);
            let line = textarea.value.substring(lp[0], lp[1]);
            let m = line.match(new RegExp(`[a-zA-Z0-9]+(?= ${textarea.value.substring(p[0], p[1])})\\b`)) || textarea.value.match(new RegExp(`[a-zA-Z0-9]+(?= ${textarea.value.substring(p[0], p[1])})\\b`));
            let name = (m && m[0]) || "float";
            let value = "1.0";
            if (name === "int") {
                value = "0";
            } else if (name === "vec2") {
                value = "vec2(0.0, 0.0)";
            } else if (name === "vec3") {
                value = "vec3(0.0, 0.0, 0.0)";
            } else if (name === "vec4") {
                value = "vec4(0.0, 0.0, 0.0, 1.0)";
            } else if (name === "bool") {
                value = "false";
            } else if (name === "mat2") {
                value = "mat2(vec2(0.0,0.0),vec2(0.0,0.0))";
            }
            return `${s.split('\n').map(x => "// " + x).join('\n')}
${substringBefore(s, "=")} = ${value};`
        } else {
            let selectionStart = textarea.selectionStart;
            while (selectionStart - 1 > -1 && /[a-zA-Z0-9_]/.test(textarea.value[selectionStart - 1])) {
                selectionStart--;
            }
            let selectionEnd = textarea.selectionEnd;
            let count = 0;
            while (selectionEnd + 1 < textarea.value.length) {
                selectionEnd++;
                if (textarea.value[selectionEnd] === '(') {
                    count++;
                    while (selectionEnd + 1 < textarea.value.length) {
                        if (textarea.value[selectionEnd] === ')') {
                            count--;
                            if (count === 0) {
                                break;
                            }
                        }
                        selectionEnd++;
                    }
                }
                if (textarea.value[selectionEnd] === ',' || textarea.value[selectionEnd] === ';') {
                    break;
                }
            }
            // textarea.value.substring(selectionStart, selectionEnd)

            return `${s.split('\n').map(x => "// " + x).join('\n')}
${textarea.value.substring(start, selectionStart)}1.0${textarea.value.substring(selectionEnd, end)};
            `
        }

    });
}
function commentLine(textarea) {

    let points = getLine(textarea);
    let line = textarea.value.substring(points[0], points[1]).trim();

    if (textarea.value[textarea.selectionStart] === '\n'
        && textarea.selectionStart === textarea.selectionEnd) {
        let linePoints = points;
        points = findExtendPosition(textarea);
        let s = textarea.value.substring(linePoints[0], points[1]).trim();
        if (s.startsWith("/*"))
            textarea.setRangeText(`${s.substring(2, s.length - 2)}`, linePoints[0], points[1]);
        else
            textarea.setRangeText(`/*${s}*/`, linePoints[0], points[1]);
    } else if (textarea.value[textarea.selectionStart] === '/'
        || textarea.value[textarea.selectionStart + 1] === '*'
    ) {
        let end = textarea.selectionStart + 2;
        while (end < textarea.value.length) {
            if (textarea.value[end] === '*' && textarea.value[end + 1] === "/") {
                end += 2;
                break;
            }
            end++;
        }
        textarea.setRangeText(`${textarea.value.substring(textarea.selectionStart + 2, end - 2)}`, textarea.selectionStart, end);
    } else if (textarea.value[textarea.selectionStart] === '+'
        || textarea.value[textarea.selectionStart] === '-'
        || textarea.value[textarea.selectionStart] === '*'
        || textarea.value[textarea.selectionStart] === '/'
        || textarea.value[textarea.selectionStart] === '%'
    ) {
        let end = textarea.selectionStart;
        while (end < textarea.value.length) {
            if (textarea.value[end] === ';')
                break;
            end++;
        }
        textarea.setRangeText(`/* ${textarea.value.substring(textarea.selectionStart, end)} */`, textarea.selectionStart, end);
    }
    else if (line.indexOf("{") !== -1) {
        if (/\bif\s*\([^\)]+\)\s*{/.test(line)) {
            let points = getIfBlock(textarea);
            let s = textarea.value.substring(points[0], points[1]);
            if (s.startsWith("//")) {
                s = s.split('\n').map(x => {
                    x = x.trim();
                    if (x.startsWith("//"))
                        return x.substring(2);
                    return x;
                }).join('\n');
            } else {
                s = s.split('\n').map(x => "// " + x).join('\n');
            }
            textarea.setRangeText(s, points[0], points[1]);
            return;
        }
        let end = points[0];
        let count = 0;
        while (end < textarea.value.length) {
            end++;
            if (textarea.value[end] === '{') {
                count++;
            } else if (textarea.value[end] === '}') {
                count--;
                if (count === 0) {
                    end++;
                    break;
                }
            }
        }
        let s = textarea.value.substring(points[0], end).trim();

        if (s.startsWith("//")) {
            s = s.split('\n').map(x => {
                x = x.trim();
                if (x.startsWith("//"))
                    return x.substring(2);
                return x;
            }).join('\n');
        } else {
            s = s.split('\n').map(x => "// " + x).join('\n');
        }

        textarea.setRangeText(s, points[0], end);
    } else if (line.indexOf("=") !== -1) {
        let end = points[0];
        let count = 0;
        while (end < textarea.value.length) {
            end++;
            if (textarea.value[end] === '(') {
                count++;
            } else if (textarea.value[end] === ')') {
                count--;
            } else if (count === 0 && textarea.value[end] === ';') {
                end++;
                break;
            }
        }
        let s = textarea.value.substring(points[0], end).trim();
        if (s.startsWith("//")) {
            s = s.split('\n').map(x => {
                if (x.startsWith("//"))
                    return x.substring(2);
                return x;
            }).join('\n');
        } else {
            s = s.split('\n').map(x => "// " + x).join('\n');
        }

        textarea.setRangeText(s, points[0], end);
    } else {

        if (line.startsWith("//")) {
            line = line.substring(2);

        } else {
            line = "// " + line;
        }

        textarea.setRangeText(line, points[0], points[1]);
    }
}
function variables(textarea) {
    /*
    let selectionStart = textarea.selectionStart;
                    let selectionEnd = textarea.selectionEnd;
                    let s = `let v = 0;`;
                    textarea.setRangeText(s, selectionStart, selectionEnd)
    */
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    while (selectionStart - 1 > -1 && /[a-zA-Z0-9_]/.test(textarea.value[selectionStart - 1])) {
        selectionStart--;
    }
    let count = 0;
    while (selectionEnd < textarea.value.length) {

        //  && (textarea.value[selectionEnd] !== ')' && textarea.value[selectionEnd] !== ';')
        if (textarea.value[selectionEnd] === '(') {
            count++;
        } else if (textarea.value[selectionEnd] === ')') {
            if (count === 0) {
                break;
            }
            count--;
            if (count === -1) {
                selectionEnd++;
                break;
            }
        } else if (textarea.value[selectionEnd] === ';') {
            break;
        } else if (count === 0 && (
            textarea.value[selectionEnd] === ',' ||
            textarea.value[selectionEnd] === '?' ||
            // textarea.value[selectionEnd] === '*' ||
            // textarea.value[selectionEnd] === '/' ||
            // textarea.value[selectionEnd] === '+' ||
            // textarea.value[selectionEnd] === '-' ||
            textarea.value[selectionEnd] === ':'
        )) {
            //selectionEnd++;
            break;
        }
        selectionEnd++;
    }

    let s = textarea.value.substring(selectionStart, selectionEnd);
    let n = s.match(/[a-z]/);

    let name = n ? `${n[0]}0` : `v0`;

    let i = 0;
    while (new RegExp("\\b" + name + "\\b", 'g').test(textarea.value)) {
        i++
        name = `${n[0]}${i}`;
    }
    textarea.setRangeText(`${name}`, selectionStart, selectionEnd);
    let str = `
float ${name} = ${s};
    `;
    while (selectionStart - 1 > -1 && (
        textarea.value[selectionStart] !== ';' &&
        textarea.value[selectionStart] !== '}' &&
        textarea.value[selectionStart] !== '{'
    )) {
        selectionStart--;
    }
    while (selectionStart + 1 < textarea.value.length && textarea.value[selectionStart] !== '\n') {
        selectionStart++;
    }
    //textarea.setRangeText(str, selectionStart, selectionStart);
    // .replaceAll(escapeRegExp(),'')
    const points = findBlock(textarea);


    textarea.setRangeText(
        str + "\n" +
        textarea.value.substring(selectionStart, points[1])
            .replaceAll(new RegExp("\\b" + escapeRegExp(s) + "(?=[\),; ])", 'g'), name)
        , selectionStart, points[1]);



}
function insertVariables(textarea, fn) {
    let points = getWordString(textarea);
    let word = textarea.value.substring(points[0], points[1]);
    let start = points[0];
    while (start - 1 > -1) {
        if ((textarea.value[start] === ';'
            || textarea.value[start] === '}'
            || textarea.value[start] === '{'
        ) && textarea.value[start + 1] === '\n') {
            start += 2;
            break;
        }
        start--;
    }
    textarea.setRangeText(fn(word) + "\n", start, start);
}

async function snippet(textarea) {
    const points = getWord(textarea);
    let word = textarea.value.substring(points[0], points[1]);

    const res = await fetch(`${baseUri}/snippet?k=${word}`)
    if (res.status === 200) {
        textarea.setRangeText(await res.text(), points[0], points[1]);
    }
}

function refractorCode(textarea) {
    let p1 = `<script id="share" type="x-shader/x-fragment">`;
    let p2 = `<script id="fs" type="x-shader/x-fragment">`;
    let p3 = `</script>`;
    let p4 = "void main() {"
    let p5 = `<script id="fs" `;

    let index = textarea.value.indexOf(p1);
    if (index === -1) {
        let start = textarea.value.indexOf(p2);
        start += p2.length;
        let end = textarea.value.indexOf(p3, start);
        let s = textarea.value.substring(start, end);
        let s1 = s.indexOf(p4);
        if (s1 === -1) return;
        let s2 = s1;
        let count = 0;
        while (s2 < s.length) {
            if (s[s2] === '{') {
                count++;
            } else if (s[s2] === '}') {
                count--;
                if (count === 0) {
                    s2++;
                    break;
                }
            }
            s2++;
        }
        let v1 = s.substring(0, s1) + s.substring(s2).trim();
        let v2 = s.substring(s1, s2);
        textarea.setRangeText(`${p1}${v1}
        ${p3}`, end + p3.length, end + p3.length);
        textarea.setRangeText("\n" + v2 + "\n", start, end);

    } else {
        index = textarea.value.indexOf(p1, textarea.selectionStart);
        if (index !== -1) {
            let points = getLine(textarea);
            let end = points[0];
            let count = 0;
            while (end < textarea.value.length) {
                end++;
                if (textarea.value[end] === '{') {
                    count++;
                } else if (textarea.value[end] === '}') {
                    count--;
                    if (count === 0) {
                        end++;
                        break;
                    }
                }
            }
            let s = textarea.value.substring(points[0], end);
            index = textarea.value.indexOf("</script>", index + p1.length);
            textarea.setRangeText(`
        ${s}
        `, index, index);
            textarea.setRangeText("", points[0], end);
        } else {
            let points = getLine(textarea);
            let end = points[0];
            let count = 0;
            while (end < textarea.value.length) {
                end++;
                if (textarea.value[end] === '{') {
                    count++;
                } else if (textarea.value[end] === '}') {
                    count--;
                    if (count === 0) {
                        end++;
                        break;
                    }
                }
            }
            let s = textarea.value.substring(points[0], end);
            textarea.setRangeText(substringBefore(s, "{").trim() + ";", points[0], end);


            index = textarea.value.indexOf(p5);
            index = textarea.value.indexOf(">", index + p5.length);

            textarea.setRangeText(`
    ${s}
    `, index + 1, index + 1);
        }

    }

    /*
    let points = getLine(textarea);
    let line = textarea.value.substring(points[0], points[1]).trim();
    let p = `<script id="share" type="x-shader/x-fragment">`;
    let index = textarea.value.indexOf(p);
    let s;
    //if (line.indexOf("{") !== -1) {
    let end = points[0];
    let count = 0;
    while (end < textarea.value.length) {
        end++;
        if (textarea.value[end] === '{') {
            count++;
        } else if (textarea.value[end] === '}') {
            count--;
            if (count === 0) {
                end++;
                break;
            }
        }
    }
    s = textarea.value.substring(points[0], end);
    if (index === -1) {
        index = textarea.value.indexOf("</script>", end);
        textarea.setRangeText(`
    <script id="share" type="x-shader/x-fragment">
    ${s}
    </script>
    `, index + 9, index + 9);
    } else {
        index = textarea.value.indexOf("</script>", index + p.length);
        textarea.setRangeText(`
    ${s}
    `, index, index);
    }
    textarea.setRangeText("", points[0], end);
    // } else {
    //     s = line;
    //     if (index === -1) {
    //         index = textarea.value.indexOf("</script>", end);
    //         textarea.setRangeText(`
    // <script id="share" type="x-shader/x-fragment">
    // ${s}
    // </script>
    // `, index + 9, index + 9);
    //     } else {
    //         textarea.setRangeText(`
    // ${s}
    // `, index + p.length, index + p.length);
    //     }
    //     textarea.setRangeText("", points[0], points[1]);
    // }
*/
}

async function functions(textarea) {

    let points = getWord(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    let t = 'zh-CN';
    if (/[\u3400-\u9FBF]/.test(s)) {
        t = 'en'
    }
    let name = "f";
    try {
        const response = await fetch(`${baseUri}/trans?to=${t}&q=${encodeURIComponent(s)}`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.json();
        const trans = results.sentences.map(x => x.trans);
        name = camel(trans.join(' '));

    } catch (error) {
        console.log(error);
    }

    points = findExtendPosition(textarea);
    s = substringAfter(textarea.value.substring(points[0], points[1]).trim(), "\n");
    let vm = substringAfter(substringBefore(substringAfterLast(s, "\n"), '=').trim(), ' ').match(/[a-zA-Z0-9_]+/);
    let v = (vm && vm[0]) || 'col';
    let ssPoints = getBlockString(textarea);
    let ss = textarea.value.substring(ssPoints[0], ssPoints[1]);

    let vvm = ss.match(new RegExp("[a-zA-Z0-9_]+\\s*(?=" + v + ")"));
    let vv = (vvm && vvm[0]) || 'vec3';
    const vvv = findArguments(s, ss);
    s = `${vv} ${name}(${vvv[0]}){
${s}
   return ${v};
}
`
    textarea.setRangeText(`${vv} ${v} =${name}(${vvv[1]});`, points[0], points[1]);
    let selectionStart = ssPoints[0];
    // while (selectionStart - 1 > -1 && textarea.value[selectionStart - 1] !== '{') {
    //     selectionStart--;
    // }
    // while (selectionStart - 1 > -1 && textarea.value[selectionStart - 1] !== '\n') {
    //     selectionStart--;
    // }

    textarea.setRangeText(s, selectionStart, selectionStart);
}
function variablesReplace(textarea) {
    /*
    let selectionStart = textarea.selectionStart;
                    let selectionEnd = textarea.selectionEnd;
                    let s = `let v = 0;`;
                    textarea.setRangeText(s, selectionStart, selectionEnd)
    */
    /*let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    while (selectionStart - 1 > -1 && /[a-zA-Z0-9]/.test(textarea.value[selectionStart - 1])) {
        selectionStart--;
    }
    while (selectionEnd < textarea.value.length && textarea.value[selectionEnd] !== ')') {
        selectionEnd++;
    }
    let s = textarea.value.substring(selectionStart, selectionEnd + 1);
    let name = `${s[0]}0`;


    let i = 0;
    while (new RegExp("\\b" + name + "\\b", 'g').test(textarea.value)) {
        i++
        name = `${s[0]}${i}`;
    }
    textarea.setRangeText(`${name}`, selectionStart, selectionEnd + 1);
    let str = `
float ${name} = ${s};
    `;
    while (selectionStart - 1 > -1 && textarea.value[selectionStart] !== '\n') {
        selectionStart--;
    }
    textarea.setRangeText(str, selectionStart, selectionStart);
   

    const points = findExtendPosition(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    const first = substringBefore(s, "\n").trim();
    const second = substringAfter(s, "\n");

    let name = `v0`;


    let i = 0;
    while (new RegExp("\\b" + name + "\\b", 'g').test(textarea.value)) {
        i++
        name = `v${i}`;
    }
    s = second.replaceAll(first, name)

    textarea.setRangeText(`
float ${name} = ${first};
${s}
`, points[0], points[1]);
 */
    let selectionStart = textarea.selectionStart;
    let count = 0;
    while (selectionStart - 1 > -1) {
        if (textarea.value[selectionStart] === '{') {
            if (count == 0)
                break;
            else count--;
        } else if (textarea.value[selectionStart] === '}') {
            count++;
        }
        selectionStart--;
    }
    let selectionEnd = textarea.selectionEnd;
    while (selectionEnd < textarea.value.length) {
        if (textarea.value[selectionEnd] === '}') {
            if (count == 0)
                break;
            else count--;
        } else if (textarea.value[selectionEnd] === '{') {
            count++;
        }
        selectionEnd++;
    }
    let s = textarea.value.substring(selectionStart, selectionEnd);

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start - 1 > -1) {
        if (/\s/.test(textarea.value[start])) {
            start++;
            break;
        }
        start--;
    }
    count = 0;
    while (end < textarea.value.length) {
        if (/\s/.test(textarea.value[end])) {
            if (count > 0)
                break;
            count++;
        }
        end++;
    }
    let word = textarea.value.substring(start, end);
    let regex = new RegExp("\\b" + escapeRegExp(word[0]) + "\\b", 'g');
    s = s.replaceAll(regex, word[1]);
    textarea.setRangeText(s, selectionStart, selectionEnd);
}

function getLineBackforward(textarea, start) {
    let end = start;
    while (start - 1 > -1) {
        if (textarea.value[start] === '\n') break;
        start--;
    }
    return [start, end];
}

function getBlockString() {
    let selectionStart = textarea.selectionStart;
    let count = 0;
    // while (selectionStart - 1 > -1) {
    //     if (textarea.value[selectionStart] === '{') {
    //         if (count == 0)
    //             break;
    //         else count--;
    //     } else if (textarea.value[selectionStart] === '}') {
    //         count++;
    //     }
    //     selectionStart--;
    // }
    while (selectionStart - 1 > -1) {
        if (textarea.value[selectionStart] === '{') {
            let points = getLineBackforward(textarea, selectionStart);
            let s = textarea.value.substring(points[0], points[1]);
            if (/\n\s*[a-zA-Z0-9]+ +[a-zA-Z0-9_]+ *\(/.test(s)) {
                selectionStart = points[0];
                break;
            }
        }
        selectionStart--;
    }
    let selectionEnd = textarea.selectionEnd;
    while (selectionEnd < textarea.value.length) {
        if (textarea.value[selectionEnd] === '}') {
            if (count == 0)
                break;
            else count--;
        } else if (textarea.value[selectionEnd] === '{') {
            count++;
        }
        selectionEnd++;
    }
    return [selectionStart, selectionEnd];

}


async function translate(textarea) {

    let points = getWord(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    let t = 'zh-CN';
    if (/[\u3400-\u9FBF]/.test(s)) {
        t = 'en'
    }
    try {
        const response = await fetch(`${baseUri}/trans?to=${t}&q=${encodeURIComponent(s)}`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.json();
        const trans = results.sentences.map(x => x.trans);
        let name = camel(trans.join(' '));
        textarea.setRangeText(name, points[0], points[1]);
    } catch (error) {
        console.log(error);
    }


}

function findArguments(s, ss) {
    let start = 0;
    let array = [];
    // while (start < s.length) {
    //     if (s[start] === '(') {
    //         let j = start;
    //         let count = 0;
    //         while (j < s.length) {
    //             if (s[j] === '(') {
    //                 count++;
    //             } else if (s[j] === ')') {
    //                 count--;
    //                 if (count == 0) {
    //                     array.push(...[...s.substring(start, j).matchAll(/[a-z][a-zA-Z0-9_]+/g)].map(x => x[0]))
    //                     start = j + 1;
    //                     break;
    //                 }
    //             }
    //             j++;
    //         }
    //     }
    //     start++;
    // }
    array = [...s.matchAll(/[a-zA-Z][a-zA-Z0-9.]*/g)].map(x => {
        if (x[0].indexOf('.') !== -1) {
            return substringBefore(x[0], ".");
        } else {
            return x[0];
        }
    });
    array = [...new Set(array)];
    const buffer1 = [];
    const buffer2 = [];
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (["vec3", "for", "int", "float"].indexOf(element) !== -1) {
            continue;
        }
        if (!new RegExp("[a-zA-Z0-9]+ +" + element + "\\s*[=,)](?!=)").test(s)) {
            const m = ss.match(new RegExp("([a-zA-Z0-9]+)\\s+(" + element + ")\\s*[=,)](?!=)"));
            if (m) {
                buffer1.push(m[1] + " " + m[2]);
                buffer2.push(m[2]);
            }
        }
    }
    return [
        buffer1.join(','),
        buffer2.join(',')
    ]
}
function getIfBlock(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start - 1 > -1) {
        if (textarea.value[start - 1] === '\n')
            break;
        start--;
    }
    let count = 0;
    while (end < textarea.value.length) {
        if (textarea.value[end] === '{') {
            count++;
        } else if (textarea.value[end] === '}') {
            count--;
            if (count === 0) {
                let points = getLineAt(textarea, end);
                let line = textarea.value.substring(points[0], points[1]);
                if (!/\bif\s*\([^\)]+\)\s*{/.test(line)) {
                    end++;
                    break;
                }
            }
        }
        end++;
    }

    return [start, end];
}
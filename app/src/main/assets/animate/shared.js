
class CustomSelect extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "wrapper");
        const style = document.createElement('style');
        style.textContent = `.btn {
    font-weight: 500;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    height: 36px;
    font-size: 14px;
    line-height: 36px;
    border-radius: 18px;
  }
  
  .dialog-buttons {
    flex-shrink: 0;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: end;
    justify-content: flex-end;
    margin-top: 12px
  }
  
  .dialog-body {
    overflow-y: auto;
    overflow-x: auto;
    max-height: 50vh;
    /*white-space: pre-wrap*/
  }
  
  .modern-overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.3)
  }
  
  h2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    max-height: 2.5em;
    -webkit-line-clamp: 2;
    overflow: hidden;
    line-height: 1.25;
    text-overflow: ellipsis;
    font-weight: normal;
    font-size: 1.8rem
  }
  
  .dialog-header {
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    flex-shrink: 0
  }
  
  .dialog {
    position: relative;
    z-index: 2;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    max-height: 100%;
    box-sizing: border-box;
    padding: 16px;
    margin: 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
    font-size: 1.3rem;
    color: #0f0f0f;
    border: none;
    min-width: 250px;
    max-width: 356px;
    box-shadow: 0 0 24px 12px rgba(0, 0, 0, 0.25);
    border-radius: 12px;
    background-color: #fff
  }
  
  .dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    z-index: 4;
    margin: 0 40px;
    padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)
  }
  
  `;
        this.wrapper = wrapper;
        this.shadowRoot.append(style, wrapper);
    }




    connectedCallback() {
        this.wrapper.innerHTML = `<div class="dialog-container">
    <div class="dialog">
      <div class="dialog-header">
        <h2 bind="header">${this.getAttribute("title") || '代码'}</h2>
      </div>
      <div class="dialog-body">
        <slot></slot>
      </div>
      <div class="dialog-buttons">
        <div class="btn close">
          删除
        </div>
        <div class="btn submit" style="color: #909090">
          导入
        </div>
      </div>
    </div>
    <div  class="modern-overlay close">
    </div>
  </div>`;
        this.wrapper.querySelectorAll('.close')
            .forEach(element => {
                element.addEventListener('click', () => {
                    this.remove();

                })
            });
        this.wrapper.querySelector('.submit').addEventListener('click', () => {
            this.remove();
            this.dispatchEvent(new CustomEvent('submit'));
        })
        this.wrapper.querySelector('.btn.close').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('close'));
        })
    }

    static get observedAttributes() {
        return ['title'];
    }

    attributeChangedCallback(attrName, oldVal, newVal) {

    }
}

customElements.define('custom-select', CustomSelect);

/*
绑定元素和事件
例如：<div bind="div" @click="click"></div>
执行下列代码后，即可通过 this.div 访问该元素
在全局下编写click函数，即可自动绑定到该元素的click事件
*/
function bind(elememnt) {
    (elememnt || document).querySelectorAll('[bind]').forEach(element => {
        if (element.getAttribute('bind')) {
            window[element.getAttribute('bind')] = element;
        }
        [...element.attributes].filter(attr => attr.nodeName.startsWith('@')).forEach(attr => {
            if (!attr.value) return;
            element.addEventListener(attr.nodeName.slice(1), evt => {
                if (window[attr.value])
                    window[attr.value](evt);
                else {
                    window['actions'][attr.value](evt);
                }
            });
        });
    })
}

function camel(string) {
    return string.replaceAll(/[ _-]([a-zA-Z])/g, m => m[1].toUpperCase());
}
function findString() {
    let start = textarea.selectionStart
    let end = textarea.selectionEnd;
    while (start - 1 > -1 && textarea.value[start - 1] != '`') {
        start--;
    }
    while (end + 1 < textarea.value.length && textarea.value[end] != '`') { end++; }
    return textarea.value.substring(start, end);
}
function collectElements() {

    console.log(JSON.stringify([...document.querySelectorAll(".bar-renderer [id]")]
        .map((x, i) => {
            const obj = {
                id: i + 1,
                d: x.querySelector('path').getAttribute('d'),
                title: x.querySelector('.bar-item-title').textContent.trim(),
                attr: x.id
            };
            return obj;
        })));

}

function humanFileSize(size) {
    if (size === 0) return '0';
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

async function readText() {
    // const textarea = document.createElement("textarea");
    // textarea.style.position = 'fixed';
    // textarea.style.right = '100%';
    // document.body.appendChild(textarea);
    // textarea.value = message;
    // textarea.select();
    // document.execCommand('paste');
    // return textarea.value;
    let strings;
    if (typeof NativeAndroid !== 'undefined') {
        strings = NativeAndroid.readText()
    } else {
        strings = await navigator.clipboard.readText()
    }
    return strings
}

function snake(string) {
    return string.replaceAll(/(?<=[a-z])[A-Z]/g, m => `_${m}`).toLowerCase()
        .replaceAll(/[ -]([a-z])/g, m => `_${m[1]}`)
}

function substring(strings, prefix, suffix) {
    let start = strings.indexOf(prefix);
    if (start === -1) {
        return [0, 0]
    }
    start += prefix.length;
    let end = strings.indexOf(suffix, start);
    if (end === -1) {
        return [0, 0]
    }
    return [start, end]
}

function substringAfter(string, delimiter, missingDelimiterValue) {
    const index = string.indexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}

function substringAfterLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}

function substringBefore(string, delimiter, missingDelimiterValue) {
    const index = string.indexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}

function substringBeforeLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}

function substringNearest(string, index, start, end) {
    let j = index;
    while (j > -1) {
        if (start.indexOf(string[j]) !== -1) {
            j++
            break;
        }
        j--;
    }
    let k = index;
    while (k < string.length) {
        if (end.indexOf(string[k]) !== -1) {
            break;
        }
        k++;
    }
    return string.substring(j, k);
}

function upperCamel(string) {
    string = camel(string);
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}

function writeText(message) {
    const textarea = document.createElement("textarea");
    textarea.style.position = 'fixed';
    textarea.style.right = '100%';
    document.body.appendChild(textarea);
    textarea.value = message;
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
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
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
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
    return [start, end + 1];
}
function getWord(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start - 1 > -1 && /[a-zA-Z0-9\u3400-\u9FBF]/.test(textarea.value[start - 1])) {
        start--;
    }
    while (end + 1 < textarea.value.length && /[a-zA-Z0-9\u3400-\u9FBF]/.test(textarea.value[end])) {
        end++;
    }
    return [start, end + 1];
}
function getWordString(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start - 1 > -1 && /[a-zA-Z0-9.]/.test(textarea.value[start - 1])) {
        start--;
    }
    while (end + 1 < textarea.value.length && /[a-zA-Z0-9.]/.test(textarea.value[end])) {
        end++;
    }
    return [start, end + 1];
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function comment(textarea) {
    const points = findExtendPosition(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    if (s.startsWith("/*") && s.endsWith("*/")) {
        s = s.substring(2);
        s = s.substring(0, s.length - 2);
    } else {
        s = `/*
    ${s}
    */`;
    }

    textarea.setRangeText(s, points[0], points[1]);
}
function commentLine(textarea) {
    const points = getLine(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    //     if (s.startsWith("/*") && s.endsWith("*/")) {
    //         s = s.substring(2);
    //         s = s.substring(0, s.length - 2);
    //     } else {
    //         s = `/*
    // ${s}
    // */`;
    //     }
    if (s.startsWith("//")) {
        s = s.substring(2);
    } else {
        s = `// ${s}`;
    }
    textarea.setRangeText(s, points[0], points[1]);
}
function functions(textarea) {
    const points = findExtendPosition(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    s = `
    
    async function doSomething (){
        // const result = await ;
${s}
    }
    
    `
    textarea.setRangeText(s, points[0], points[1]);
}
async function translate(baseUri, textarea) {
    const points = getWord(textarea);
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
        const name = camel(trans.join(' '));
        textarea.setRangeText(`${name.slice(0, 1).toLowerCase()}${name.slice(1)}`, points[0], points[1]);
    } catch (error) {
        console.log(error);
    }
}
function deleteBlock(textarea) {
    const points = findExtendPosition(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    writeText(s);
    textarea.setRangeText("", points[0], points[1]);
}
function deleteLine(textarea) {
    const points = getLine(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    writeText(s);
    textarea.setRangeText("", points[0], points[1]);
}
const HTML = `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
      body {
        margin: 0;
        overflow: hidden
      }
    </style>
  </head>
  
  <body>

  <script type="importmap">
  {
      "imports": {
          "three": "https://unpkg.com/three/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
      }
  }
  </script>
  
  <script src="https://unpkg.com/three@0.160.0/build/three.js"></script>

  <!--
  https://threejs.org/examples/
  https://github.com/mrdoob/three.js/tree/master/examples
  -->

  <canvas></canvas>
      <script type="module">
  
      </script>
  </body>
  
  </html>`;

const WEBGL = ["<!DOCTYPE html>\r\n<html lang='en'>\r\n<head>\r\n  <meta charset='UTF-8' />\r\n  <meta name='viewport' content='width=device-width, initial-scale=1.0' />\r\n  <title>Document</title>\r\n  <style>\r\n    body {\r\n      margin: 0;\r\n    }\r\n    canvas {\r\n      width: 100%;\r\n      height: 100%;\r\n      display: block;\r\n    }\r\n  </style>\r\n  <script id=\"vs\" type=\"x-shader/x-vertex\">\r\n    #version 300 es\r\n     // an attribute is an input (in) to a vertex shader.\r\n     // It will receive data from a buffer\r\n     in vec4 a_position;\r\n     // all shaders have a main function\r\n     void main() {\r\n       // gl_Position is a special variable a vertex shader\r\n       // is responsible for setting\r\n       gl_Position = a_position;\r\n     }\r\n     </script>\r\n  <script id=\"fs\" type=\"x-shader/x-fragment\">#version 300 es\r\nprecision highp float;\r\nprecision highp sampler2D;\r\nuniform vec3 iResolution;\r\nuniform vec4 iMouse;\r\nuniform float iTime;\r\nuniform sampler2D iChannel0;\r\nuniform int iFrame;\r\n", "\r\nout vec4 outColor;\r\nvoid main() {\r\n  mainImage(outColor, gl_FragCoord.xy);\r\n}\r\n</script>\r\n</head>\r\n<body>\r\n  <script>\r\n    (function() {\r\n      'use strict';\r\n      window.getShaderSource = function(id) {\r\n        return document.getElementById(id).textContent.replace(/^\\s+|\\s+$/g, '');\r\n      };\r\n      function createShader(gl, source, type) {\r\n        var shader = gl.createShader(type);\r\n        gl.shaderSource(shader, source);\r\n        gl.compileShader(shader);\r\n        return shader;\r\n      }\r\n      window.createProgram = function(gl, vertexShaderSource, fragmentShaderSource) {\r\n        var program = gl.createProgram();\r\n        var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);\r\n        var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);\r\n        gl.attachShader(program, vshader);\r\n        gl.deleteShader(vshader);\r\n        gl.attachShader(program, fshader);\r\n        gl.deleteShader(fshader);\r\n        gl.linkProgram(program);\r\n        var log = gl.getProgramInfoLog(program);\r\n        if (log) {\r\n          console.log(log);\r\n        }\r\n        log = gl.getShaderInfoLog(vshader);\r\n        if (log) {\r\n          console.log(log);\r\n        }\r\n        log = gl.getShaderInfoLog(fshader);\r\n        if (log) {\r\n          document.body.textContent=log;\r\n        }\r\n        return program;\r\n      };\r\n      window.loadImage = function(url, onload) {\r\n        var img = new Image();\r\n        img.src = url;\r\n        img.onload = function() {\r\n          onload(img);\r\n        };\r\n        return img;\r\n      };\r\n      window.loadImages = function(urls, onload) {\r\n        var imgs = [];\r\n        var imgsToLoad = urls.length;\r\n        function onImgLoad() {\r\n          if (--imgsToLoad <= 0) {\r\n            onload(imgs);\r\n          }\r\n        }\r\n        for (var i = 0; i < imgsToLoad; ++i) {\r\n          imgs.push(loadImage(urls[i], onImgLoad));\r\n        }\r\n      };\r\n      window.loadObj = function(url, onload) {\r\n        var xhr = new XMLHttpRequest();\r\n        xhr.open('GET', url, true);\r\n        xhr.responseType = 'text';\r\n        xhr.onload = function(e) {\r\n          var mesh = new OBJ.Mesh(this.response);\r\n          onload(mesh);\r\n        };\r\n        xhr.send();\r\n      };\r\n    })();\r\n    window.onerror = function(errMsg, url, line, column, error) {\r\n      var result = !column ? '' : 'column: ' + column;\r\n      result += !error;\r\n      document.write(\"\\nError= \" + errMsg + \"\\nurl= \" + url + \"\\nline= \" + line + result);\r\n      var suppressErrorAlert = true;\r\n      return suppressErrorAlert;\r\n    };\r\n    document.addEventListener('visibilitychange', async evt => {\r\n      if (document.visibilityState === \"visible\") {\r\n        location.reload();\r\n      }\r\n    })\r\n  </script>\r\n  <script>\r\n    var canvas = document.createElement('canvas');\r\n    canvas.height = 600;\r\n    canvas.width = 600;\r\n    canvas.style.width = '600px';\r\n    canvas.style.height = '600px';\r\n    document.body.appendChild(canvas);\r\n    var gl = canvas.getContext('webgl2', {\r\n      antialias: false\r\n    });\r\n    var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));\r\n    const positionAttributeLocation = gl.getAttribLocation(program, \"a_position\");\r\n    const resolutionLocation = gl.getUniformLocation(program, \"iResolution\");\r\n    // const channel0Location = gl.getUniformLocation(program, 'iChannel0');\r\n    const mouseLocation = gl.getUniformLocation(program, \"iMouse\");\r\n    const timeLocation = gl.getUniformLocation(program, \"iTime\");\r\n    const frameLocation = gl.getUniformLocation(program, \"iFrame\");\r\n    const vao = gl.createVertexArray();\r\n    gl.bindVertexArray(vao);\r\n    const positionBuffer = gl.createBuffer();\r\n    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\r\n      -1, -1, // first triangle\r\n      1, -1,\r\n      -1, 1,\r\n      -1, 1, // second triangle\r\n      1, -1,\r\n      1, 1,\r\n    ]), gl.STATIC_DRAW);\r\n    gl.enableVertexAttribArray(positionAttributeLocation);\r\n    gl.vertexAttribPointer(\r\n      positionAttributeLocation,\r\n      2,\r\n      gl.FLOAT,\r\n      false,\r\n      0,\r\n      0,\r\n    );\r\n    let mouseX = 0;\r\n    let mouseY = 0;\r\n    function setMousePosition(e) {\r\n      const rect = canvas.getBoundingClientRect();\r\n      mouseX = e.clientX - rect.left;\r\n      mouseY = rect.height - (e.clientY - rect.top) - 1;\r\n    }\r\n    canvas.addEventListener('mousemove', setMousePosition);\r\n    canvas.addEventListener('touchstart', (e) => {\r\n      e.preventDefault();\r\n    }, {\r\n      passive: false\r\n    });\r\n    canvas.addEventListener('touchmove', (e) => {\r\n      e.preventDefault();\r\n      setMousePosition(e.touches[0]);\r\n    }, {\r\n      passive: false\r\n    });\r\n    let frame = 0;\r\n    gl.useProgram(program);\r\n    gl.bindVertexArray(vao);\r\n    function render(time) {\r\n      time *= 0.001; // convert to seconds\r\n      frame++;\r\n      // Tell WebGL how to convert from clip space to pixels\r\n      //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);\r\n      // Bind the attribute/buffer set we want.\r\n      gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 1.0);\r\n      gl.uniform4f(mouseLocation, mouseX, mouseY, mouseX, mouseY);\r\n      gl.uniform1f(timeLocation, time);\r\n      gl.uniform1i(frameLocation, frame);\r\n      gl.drawArrays(\r\n        gl.TRIANGLES,\r\n        0, // offset\r\n        6, // num vertices to process\r\n      );\r\n      requestAnimationFrame(render);\r\n    }\r\n    requestAnimationFrame(render);\r\n  </script>\r\n</body>\r\n</html>"]
function formatGlslCode(code) {
    const options = { indent_size: 2, space_in_empty_paren: true }
    code = html_beautify(code, options);
    const points = substring(code, `type="x-shader/x-fragment">`, `</script>`);
    let s = "";
    if (points[0] === 0 && points[1] === 0) {
        s = code.split('\n')
            .filter(x => x.trim())
            .join('\n');
    } else {
        s = code.substring(points[0], points[1]);
        s = GLSLX.format(s);
        s = code.substring(0, points[0]) + s + code.substring(points[1]);
        s = s.split('\n')
            .filter(x => x.trim())
            .join('\n');
    }
    return s.replace('https://unpkg.com/three@0.160.0/build/three.module.js', 'https://fastly.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
        .replace('https://unpkg.com/three/build/three.module.js', 'https://fastly.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
        .replace('https://unpkg.com/three@0.160.0/examples/jsm/', 'https://fastly.jsdelivr.net/npm/three@0.160.0/examples/jsm/');
    ;
}

const BABYLON = ["<!DOCTYPE html>\r\n<html>\r\n    <head>\r\n        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n\r\n        <title>Babylon.js sample code</title>\r\n\r\n        <!-- Babylon.js -->\r\n        <script src=\"https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.2/dat.gui.min.js\"></script>\r\n        <script src=\"https://assets.babylonjs.com/generated/Assets.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/recast.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/ammo.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/havok/HavokPhysics_umd.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/cannon.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/Oimo.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/earcut.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/babylon.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/proceduralTexturesLibrary/babylonjs.proceduralTextures.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/postProcessesLibrary/babylonjs.postProcess.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/loaders/babylonjs.loaders.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/serializers/babylonjs.serializers.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/gui/babylon.gui.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/inspector/babylon.inspector.bundle.js\"></script>\r\n\r\n        <style>\r\n            html, body {\r\n                overflow: hidden;\r\n                width: 100%;\r\n                height: 100%;\r\n                margin: 0;\r\n                padding: 0;\r\n            }\r\n\r\n            #renderCanvas {\r\n                width: 100%;\r\n                height: 100%;\r\n                touch-action: none;\r\n            }\r\n            \r\n            #canvasZone {\r\n                width: 100%;\r\n                height: 100%;\r\n            }\r\n        </style>\r\n    </head>\r\n<body>\r\n    <div id=\"canvasZone\"><canvas id=\"renderCanvas\"></canvas></div>\r\n    <script>\r\n        var canvas = document.getElementById(\"renderCanvas\");\r\n\r\n        var startRenderLoop = function (engine, canvas) {\r\n            engine.runRenderLoop(function () {\r\n                if (sceneToRender && sceneToRender.activeCamera) {\r\n                    sceneToRender.render();\r\n                }\r\n            });\r\n        }\r\n\r\n        var engine = null;\r\n        var scene = null;\r\n        var sceneToRender = null;\r\n        var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };\r\n        ", "\n                window.initFunction = async function() {\n                    \n                    \n                    \n                    var asyncEngineCreation = async function() {\n                        try {\n                        return createDefaultEngine();\n                        } catch(e) {\n                        console.log(\"the available createEngine function failed. Creating the default engine instead\");\n                        return createDefaultEngine();\n                        }\n                    }\n\n                    window.engine = await asyncEngineCreation();\r\n        if (!engine) throw 'engine should not be null.';\r\n        startRenderLoop(engine, canvas);\r\n        window.scene = createScene();};\r\n        initFunction().then(() => {sceneToRender = scene                    \r\n        });\r\n\r\n        // Resize\r\n        window.addEventListener(\"resize\", function () {\r\n            engine.resize();\r\n        });\r\n    </script>\r\n</body>\r\n</html>\r\n"]

async function glslTemplate(t) {
    let s = "";
    try {
        s = await navigator.clipboard.readText();
    } catch (error) {
    }
    if (t === 1)
        textarea.value = "WebGL \n" + formatGlslCode(THREE1[0] + s + THREE1[1]);
    else
        textarea.value = "WebGL \n" + formatGlslCode(WEBGL2[0] + s + WEBGL2[1]);
}
function showSnippetsDialog() {
    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    div.style = `
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    font-size: 18px;
    line-height: 24px;
    align-items: stretch;
    justify-content: center;
`
    div.innerHTML = `
                <div data-id="1">GLSL</div>
                <div data-id="2">HTML</div>
                <div data-id="3">THREE</div>
                <div data-id="4">BABYLON</div>
                <div data-id="5">视频</div>
                <div data-id="6">错误</div>
                <div data-id="7">GLSL 简化</div>
                <div data-id="8">GLSL 变量</div>
                <div data-id="9">Three.js 导入</div>
                <div data-id="10">GLSL 纹理</div>
                `;

    dialog.appendChild(div);

    dialog.addEventListener('submit', async () => {

    });
    document.body.appendChild(dialog);
    dialog.querySelectorAll('div[data-id]')
        .forEach(x => {

            x.addEventListener('click', async evt => {
                const element = evt.currentTarget
                const id = element.dataset.id;
                if (id === "1") {
                    let s = "";
                    try {
                        s = await navigator.clipboard.readText();
                    } catch (error) {
                    }
                    textarea.value = textarea.value + "\n\n" + formatGlslCode(WEBGL[0] + s + WEBGL[1]);
                } else if (id === "2") {
                    textarea.value = textarea.value + "\n\n" + HTML;
                } else if (id === "3") {
                    textarea.value = textarea.value + "\n\n" + `测试
                    <html>
                    <head>
                      <meta charset="UTF-8">
                    </head>
                    <body>
                    </body>
                    <script type="importmap">{ "imports": { "three": "https://fastly.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/": "https://fastly.jsdelivr.net/npm/three@0.160.0/examples/jsm/" }}</script>
                    <script type="module">
                      import * as THREE from 'three';
                      let scene, camera, renderer, angle = 0,
                        fov = 10,
                        dir = true;
                      const [width, height] = [800, 800];
                      const init = async () => {
                        scene = new THREE.Scene();
                        camera = new THREE.PerspectiveCamera(10, width / height, 1, 1000);
                        camera.position.set(0, 0, 40);
                        camera.lookAt(new THREE.Vector3(0, 0.0));
                        renderer = new THREE.WebGLRenderer({
                          antialias: true
                        });
                        renderer.setSize(width, height);
                        document.body.appendChild(renderer.domElement);
                        setLight();
                        setShape();
                        update();
                      }
                      async function loadTexture() {
                        const loader = new THREE.TextureLoader();
                        const texture = await loader.loadAsync("");
                        texture.magFilter = THREE.LinearFilter;
                        texture.minFilter = THREE.LinearFilter;
                        const material = new THREE.MeshStandardMaterial({
                          map: texture
                        });
                        return material;
                      }
                      const setCamera = () => {
                        camera.position.x = 40 * Math.sin(angle * Math.PI / 180);
                        camera.position.z = 40 * Math.cos(angle * Math.PI / 180);
                        camera.lookAt(new THREE.Vector3(0, 0, 0));
                        camera.setFocalLength(fov);
                      }
                      const update = () => {
                        setCamera();
                        renderer.render(scene, camera);
                        window.requestAnimationFrame(update);
                      }
                      function setLight() {
                        const light = new THREE.DirectionalLight("#FFFFFF");
                        light.position.set(10, 50, 100);
                        scene.add(light);
                        const ambientLight = new THREE.AmbientLight("#999999");
                        scene.add(ambientLight);
                      }
                      function setShape() {
                        let geometry = new THREE.SphereGeometry(16, 32,16);
                        let material = new THREE.MeshStandardMaterial({
                          color: '#FFF',
                          roughness: 0.2,
                          metalness: 0.3
                        })
                        const s = new THREE.Mesh(geometry, material);
                        s.position.set(0, 0, 0);
                        scene.add(s);
                      }
                      init()
                    </script>
                    </html>`;
                } else if (id === "4") {
                    let s = "";
                    try {
                        s = await navigator.clipboard.readText();
                    } catch (error) {
                    }
                    textarea.value = textarea.value + "\n\n" + BABYLON[0] + s + BABYLON[1];
                } else if (id === "5") {
                    const str = `const startRecording = () => {
                        const canvas = document.querySelector("canvas");
                        const data = []; // here we will store our recorded media chunks (Blobs)
                        const stream = canvas.captureStream(30); // records the canvas in real time at our preferred framerate 30 in this case.
                        const mediaRecorder = new MediaRecorder(stream, {
                          mimeType: "video/webm; codecs=vp9"
                        }); // init the recorder
                        // whenever the recorder has new data, we will store it in our array
                        mediaRecorder.ondataavailable = (e) => data.push(e.data);
                        // only when the recorder stops, we construct a complete Blob from all the chunks
                        mediaRecorder.onstop = (e) =>
                          downloadVideo(new Blob(data, {
                            type: "video/webm;codecsvp9"
                          }));
                        mediaRecorder.start();
                        setTimeout(() => {
                          mediaRecorder.stop();
                        }, 20000); // stop recording in 6s
                      };
                      const downloadVideo = async (blob) => {
                        const div = document.querySelector("body");
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement("a");
                        a.href = url;
                        a.download = "test.webm";
                        a.className = "button";
                        a.innerText = "click here to download";
                        div.appendChild(a);
                      };`;
                    textarea.setRangeText(
                        str,
                        textarea.selectionStart,
                        textarea.selectionEnd
                    )
                } else if (id === "6") {
                    const str = `
                    <script>
                    window.onerror = function(errMsg, url, line, column, error) {
                        var result = !column ? '' : 'column: ' + column;
                        result += !error;
                        document.body.innerHTML = "\\nError= " + errMsg + "url= " + url + "\\nline= " + line + result;
                        var suppressErrorAlert = true;
                        return suppressErrorAlert;
                     };
                     document.addEventListener('visibilitychange', async evt => {
                        if (document.visibilityState === "visible") {
                            location.reload();
                        }
                    });
                    </script>
                     `;
                    textarea.setRangeText(
                        str,
                        textarea.selectionStart,
                        textarea.selectionEnd
                    )
                } else if (id === "7") {
                    let s = "";
                    if (textarea.value.indexOf(`<script id="fs" type="x-shader/x-fragment">`) != -1) {
                        const points = substring(textarea.value, `<script id="fs" type="x-shader/x-fragment">`, `</script>`);
                        s = textarea.value.substring(points[0], points[1]);
                    }
                    else {
                        s = findString();
                    }
                    s = s.replace(/void mainImage\([^)]+\)[\r\n ]+\{/, m => {
                        return `
                        
 out vec4 ${m.match(/(?<=out vec4 )[^,]+/)};                                          
void main(){
vec2 ${m.match(/(?<=in vec2 )[^)]+/)} = gl_FragCoord.xy;
    `
                    }).replace(/out vec4 outColor;[\r\n ]+void main\(\)[\r\n ]+\{[\r\n ]+mainImage\(outColor, \gl_FragCoord.xy\);[\r\n ]+\}[\r\n ]+/, '')

                    textarea.value = formatGlslCode(WEBGL1[0] + s + WEBGL1[1]);

                } else if (id === '8') {
                    textarea.setRangeText(`
precision highp sampler2D;
uniform sampler2D iChannel0;
uniform int iFrame;
const frameLocation = gl.getUniformLocation(program, "iFrame");
let frame=0;
frame++;
gl.uniform1i(frameLocation, frame);
                    `,
                        textarea.selectionStart,
                        textarea.selectionEnd
                    )
                }
                else if (id === '9') {
                    textarea.setRangeText(`
                    <script type="importmap">
                    {
                    "imports": {
                      "three": "https://fastly.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                      "three/addons/": "https://fastly.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
                    }
                  }
                </script>
                  <script type="module">
                    import * as THREE from 'three';
                    `,
                        textarea.selectionStart,
                        textarea.selectionEnd);
                } else if (id === '10') {
                    textarea.value = textarea.value
                        .replace("uniform sampler2D iChannel0;", `uniform sampler2D iChannel0;
                        uniform sampler2D iChannel1;`)
                        .replace(`<body>`, `
                        <body>
                        <script>
                        //
                        // Initialize a texture and load an image.
                        // When the image finished loading copy it into the texture.
                        //
                        function loadTexture(gl, url, offset) {
                          const texture = gl.createTexture();
                          gl.activeTexture(gl.TEXTURE0 + offset);
                          gl.bindTexture(gl.TEXTURE_2D, texture);
                          // Because images have to be downloaded over the internet
                          // they might take a moment until they are ready.
                          // Until then put a single pixel in the texture so we can
                          // use it immediately. When the image has finished downloading
                          // we'll update the texture with the contents of the image.
                          const level = 0;
                          const internalFormat = gl.RGBA;
                          const width = 1;
                          const height = 1;
                          const border = 0;
                          const srcFormat = gl.RGBA;
                          const srcType = gl.UNSIGNED_BYTE;
                          const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
                          gl.texImage2D(
                            gl.TEXTURE_2D,
                            level,
                            internalFormat,
                            width,
                            height,
                            border,
                            srcFormat,
                            srcType,
                            pixel,
                          );
                          const image = new Image();
                          image.onload = () => {
                            gl.activeTexture(gl.TEXTURE0 + offset);
                            gl.bindTexture(gl.TEXTURE_2D, texture);
                            gl.texImage2D(
                              gl.TEXTURE_2D,
                              level,
                              internalFormat,
                              srcFormat,
                              srcType,
                              image,
                            );
                            // WebGL1 has different requirements for power of 2 images
                            // vs. non power of 2 images so check if the image is a
                            // power of 2 in both dimensions.
                            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                              // Yes, it's a power of 2. Generate mips.
                              gl.generateMipmap(gl.TEXTURE_2D);
                            } else {
                              // No, it's not a power of 2. Turn off mips and set
                              // wrapping to clamp to edge
                              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                            }
                          };
                          image.src = url;
                          return texture;
                        }
                        function isPowerOf2(value) {
                          return (value & (value - 1)) === 0;
                        }
                        </script>`)
                        .replace(`const timeLocation = gl.getUniformLocation(program, "iTime");`,
                            `const timeLocation = gl.getUniformLocation(program, "iTime");
                        const iChannel0Location = gl.getUniformLocation(program, "iChannel0");
                        const iChannel1Location = gl.getUniformLocation(program, "iChannel1");`)
                        .replace("function render(time) {", `gl.uniform1i(iChannel0Location, 0);
                        gl.uniform1i(iChannel1Location, 1);
                        loadTexture(gl, "/file?path=/storage/emulated/0/.editor/images/001.jpg", 0);
                        loadTexture(gl, "/file?path=/storage/emulated/0/.editor/images/002.jpg", 1);
                        function render(time) {`);
                }
                dialog.remove();
            });
        })
}
function findReplace(textarea) {
    const points = findExtendPosition(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    const first = substringBefore(s, "\n");
    const second = substringAfter(s, "\n");
    const pieces = first.split(' ');
    s = `${first}  
${second.replaceAll(new RegExp("\\b" + pieces[0] + "\\b", 'g'), pieces[1])}`;
    textarea.setRangeText(s, points[0], points[1]);

}
const WEBGL1 = ["<!DOCTYPE html>\r\n<html lang='en'>\r\n<head>\r\n  <meta charset='UTF-8' />\r\n  <meta name='viewport' content='width=device-width, initial-scale=1.0' />\r\n  <script id=\"vs\" type=\"x-shader/x-vertex\">\r\n    #version 300 es\r\n     in vec4 a_position;\r\n     void main() {\r\n       gl_Position = a_position;\r\n     }\r\n     </script>\r\n  <script id=\"fs\" type=\"x-shader/x-fragment\">\r\n  \r\n#version 300 es\r\nprecision highp float;\r\nuniform vec3 iResolution;\r\nuniform float iTime;\r\n\r\n", "\r\n</script>\r\n</head>\r\n<body>\r\n  <script>\r\n    (function() {\r\n      'use strict';\r\n      window.getShaderSource = function(id) {\r\n        return document.getElementById(id).textContent.replace(/^\\s+|\\s+$/g, '');\r\n      };\r\n      function createShader(gl, source, type) {\r\n        var shader = gl.createShader(type);\r\n        gl.shaderSource(shader, source);\r\n        gl.compileShader(shader);\r\n        return shader;\r\n      }\r\n      window.createProgram = function(gl, vertexShaderSource, fragmentShaderSource) {\r\n        var program = gl.createProgram();\r\n        var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);\r\n        var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);\r\n        gl.attachShader(program, vshader);\r\n        gl.deleteShader(vshader);\r\n        gl.attachShader(program, fshader);\r\n        gl.deleteShader(fshader);\r\n        gl.linkProgram(program);\r\n        var log = gl.getProgramInfoLog(program);\r\n        if (log) {\r\n          console.log(log);\r\n        }\r\n        log = gl.getShaderInfoLog(vshader);\r\n        if (log) {\r\n          console.log(log);\r\n        }\r\n        log = gl.getShaderInfoLog(fshader);\r\n        if (log) {\r\n          document.body.innerHTML=log;\r\n        }\r\n        return program;\r\n      };\r\n    })();\r\n  </script>\r\n  <script>\r\n    var canvas = document.createElement('canvas');\r\n    canvas.height = 300;\r\n    canvas.width = 300;\r\n    canvas.style.width = '300px';\r\n    canvas.style.height = '300px';\r\n    document.body.appendChild(canvas);\r\n    var gl = canvas.getContext('webgl2', {\r\n      antialias: false\r\n    });\r\n    var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));\r\n    const positionAttributeLocation = gl.getAttribLocation(program, \"a_position\");\r\n    const resolutionLocation = gl.getUniformLocation(program, \"iResolution\");\r\n    const timeLocation = gl.getUniformLocation(program, \"iTime\");\r\n    const vao = gl.createVertexArray();\r\n    gl.bindVertexArray(vao);\r\n    const positionBuffer = gl.createBuffer();\r\n    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);\r\n    gl.enableVertexAttribArray(positionAttributeLocation);\r\n    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);\r\n    gl.useProgram(program);\r\n    gl.bindVertexArray(vao);\r\n    function render(time) {\r\n      time *= 0.001; // convert to seconds\r\n      gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 1.0);\r\n      gl.uniform1f(timeLocation, time);\r\n      gl.drawArrays(gl.TRIANGLES, 0, 6);\r\n      requestAnimationFrame(render);\r\n    }\r\n    requestAnimationFrame(render);\r\n  </script>\r\n</body>\r\n</html>"]

const WEBGL2 = ["<html lang='en'>\r\n<head>\r\n  <meta name='viewport' content='width=device-width, initial-scale=1.0' />\r\n  <script id=\"vs\" type=\"x-shader/x-vertex\">\r\n    #version 300 es\r\n     in vec4 a_position;\r\n     void main() {\r\n       gl_Position = a_position;\r\n     }\r\n     </script>\r\n  <script id=\"fs\" type=\"x-shader/x-fragment\">#version 300 es\r\nprecision highp float;\r\nprecision highp sampler2D;\r\nuniform vec3 iResolution;\r\nuniform vec4 iMouse;\r\nuniform float iTime;\r\nuniform sampler2D iChannel0;\r\nuniform int iFrame;\r\n", "\r\nout vec4 outColor;\r\nvoid main() {\r\n  mainImage(outColor, gl_FragCoord.xy);\r\n}\r\n</script>\r\n</head>\r\n<body>\r\n  <script>\r\n    (function() {\r\n      'use strict';\r\n      window.getShaderSource = function(id) {\r\n        return document.getElementById(id).textContent.replace(/^\\s+|\\s+$/g, '');\r\n      };\r\n      function createShader(gl, source, type) {\r\n        var shader = gl.createShader(type);\r\n        gl.shaderSource(shader, source);\r\n        gl.compileShader(shader);\r\n        return shader;\r\n      }\r\n      window.createProgram = function(gl, vertexShaderSource, fragmentShaderSource) {\r\n        var program = gl.createProgram();\r\n        var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);\r\n        var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);\r\n        gl.attachShader(program, vshader);\r\n        gl.deleteShader(vshader);\r\n        gl.attachShader(program, fshader);\r\n        gl.deleteShader(fshader);\r\n        gl.linkProgram(program);\r\n        var log = gl.getProgramInfoLog(program);\r\n        if (log) {\r\n          console.log(log);\r\n        }\r\n        log = gl.getShaderInfoLog(vshader);\r\n        if (log) {\r\n          console.log(log);\r\n        }\r\n        log = gl.getShaderInfoLog(fshader);\r\n        if (log) {\r\n          document.body.textContent = log;\r\n        }\r\n        return program;\r\n      };\r\n    })();\r\n    window.onerror = function(errMsg, url, line, column, error) {\r\n      var result = !column ? '' : 'column: ' + column;\r\n      result += !error;\r\n      document.write(\"\\nError= \" + errMsg + \"\\nurl= \" + url + \"\\nline= \" + line + result);\r\n      var suppressErrorAlert = true;\r\n      return suppressErrorAlert;\r\n    };\r\n    document.addEventListener('visibilitychange', async evt => {\r\n      if (document.visibilityState === \"visible\") {\r\n        location.reload();\r\n      }\r\n    })\r\n  </script>\r\n  <script>\r\n    var canvas = document.createElement('canvas');\r\n    canvas.height = 300;\r\n    canvas.width = 300;\r\n    canvas.style.width = '300px';\r\n    canvas.style.height = '300px';\r\n    document.body.appendChild(canvas);\r\n    var gl = canvas.getContext('webgl2', {\r\n      antialias: false\r\n    });\r\n    var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));\r\n    const positionAttributeLocation = gl.getAttribLocation(program, \"a_position\");\r\n    const resolutionLocation = gl.getUniformLocation(program, \"iResolution\");\r\n    const mouseLocation = gl.getUniformLocation(program, \"iMouse\");\r\n    const timeLocation = gl.getUniformLocation(program, \"iTime\");\r\n    const frameLocation = gl.getUniformLocation(program, \"iFrame\");\r\n    const vao = gl.createVertexArray();\r\n    gl.bindVertexArray(vao);\r\n    const positionBuffer = gl.createBuffer();\r\n    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\r\n      -1, -1,\r\n      1, -1,\r\n      -1, 1,\r\n      -1, 1,\r\n      1, -1,\r\n      1, 1,\r\n    ]), gl.STATIC_DRAW);\r\n    gl.enableVertexAttribArray(positionAttributeLocation);\r\n    gl.vertexAttribPointer(\r\n      positionAttributeLocation,\r\n      2,\r\n      gl.FLOAT,\r\n      false,\r\n      0,\r\n      0,\r\n    );\r\n    let mouseX = 0;\r\n    let mouseY = 0;\r\n    function setMousePosition(e) {\r\n      const rect = canvas.getBoundingClientRect();\r\n      mouseX = e.clientX - rect.left;\r\n      mouseY = rect.height - (e.clientY - rect.top) - 1;\r\n    }\r\n    canvas.addEventListener('mousemove', setMousePosition);\r\n    canvas.addEventListener('touchstart', (e) => {\r\n      e.preventDefault();\r\n    }, {\r\n      passive: false\r\n    });\r\n    canvas.addEventListener('touchmove', (e) => {\r\n      e.preventDefault();\r\n      setMousePosition(e.touches[0]);\r\n    }, {\r\n      passive: false\r\n    });\r\n    let frame = 0;\r\n    gl.useProgram(program);\r\n    gl.bindVertexArray(vao);\r\n    function render(time) {\r\n      time *= 0.001;\r\n      frame++;\r\n      gl.clearColor(0., 0., 0., 1.0);\r\n      gl.clear(gl.COLOR_BUFFER_BIT);\r\n      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);\r\n      gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 1.0);\r\n      gl.uniform4f(mouseLocation, mouseX, mouseY, mouseX, mouseY);\r\n      gl.uniform1f(timeLocation, time);\r\n      gl.uniform1i(frameLocation, frame);\r\n      gl.drawArrays(gl.TRIANGLES, 0, 6);\r\n      requestAnimationFrame(render);\r\n    }\r\n    requestAnimationFrame(render);\r\n  </script>\r\n</body>\r\n</html>"]
const THREE1 = ["<!DOCTYPE html>\r\n<html lang=\"en\">\r\n\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>Document</title>\r\n    <style>\r\n        body {\r\n            margin: 0;\r\n            overflow: hidden\r\n        }\r\n    </style>\r\n    <script id=\"vs\" type=\"x-shader/x-vertex\">\r\n        varying vec2 vUv;\r\n        void main() {\r\n            vUv = uv;\r\n            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\r\n        }\r\n    </script>\r\n    <script id=\"ba\" type=\"x-shader/x-fragment\">\r\n        uniform vec3      iResolution;       \r\n        uniform float     iTime;           \r\n        uniform float     iTimeDelta;      \r\n        uniform float     iFrameRate;       \r\n        uniform int       iFrame;            \r\n        uniform vec4      iMouse;  \r\n        uniform sampler2D iChannel0;\r\n        \r\n           ", "\r\n         \r\n        void main() {\r\n          mainImage(gl_FragColor, gl_FragCoord.xy);\r\n        }\r\n    </script>\r\n    <script id=\"fs\" type=\"x-shader/x-fragment\">\r\n\r\n    uniform sampler2D iChannel0;\r\n    uniform vec3      iResolution;  \r\n    uniform float     iTime;      \r\n    uniform vec4      iMouse;  \r\n     \r\n    void main() {\r\n      mainImage(gl_FragColor, gl_FragCoord.xy);\r\n    }\r\n    </script>\r\n    <script>\r\n        window.getShaderSource = function (id) {\r\n            return document.getElementById(id).textContent.replace(/^\\s+|\\s+$/g, '');\r\n        };\r\n    </script>\r\n</head>\r\n\r\n<body>\r\n    <script>\r\n\r\n        class App {\r\n            constructor() {\r\n                this.width = 300;\r\n                this.height = 300;\r\n                this.renderer = new THREE.WebGLRenderer();\r\n                this.loader = new THREE.TextureLoader();\r\n                this.mousePosition = new THREE.Vector4();\r\n                this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r\n                this.counter = 0;\r\n                this.renderer.setSize(this.width, this.height);\r\n                document.body.appendChild(this.renderer.domElement);\r\n                this.renderer.domElement.addEventListener('mousedown', () => {\r\n                    this.mousePosition.setZ(1);\r\n                    this.counter = 0;\r\n                });\r\n                this.renderer.domElement.addEventListener('mouseup', () => {\r\n                    this.mousePosition.setZ(0);\r\n                });\r\n                this.renderer.domElement.addEventListener('mousemove', event => {\r\n                    this.mousePosition.setX(event.clientX);\r\n                    this.mousePosition.setY(this.height - event.clientY);\r\n                });\r\n                this.targetA = new BufferManager(this.renderer, {\r\n                    width: this.width,\r\n                    height: this.height\r\n                });\r\n                this.targetC = new BufferManager(this.renderer, {\r\n                    width: this.width,\r\n                    height: this.height\r\n                });\r\n            }\r\n            start() {\r\n                const resolution = new THREE.Vector3(this.width, this.height, window.devicePixelRatio);\r\n\r\n                this.bufferA = new BufferShader(getShaderSource('ba'), {\r\n                    iTime: {\r\n                        value: 0\r\n                    },\r\n                    iFrame: {\r\n                        value: 0\r\n                    },\r\n                    iResolution: {\r\n                        value: resolution\r\n                    },\r\n                    iMouse: {\r\n                        value: this.mousePosition\r\n                    },\r\n                    iChannel0: {\r\n                        value: null\r\n                    },\r\n                    iChannel1: {\r\n                        value: null\r\n                    }\r\n                });\r\n                this.bufferImage = new BufferShader(getShaderSource('fs'), {\r\n                    iTime: {\r\n                        value: 0\r\n                    },\r\n                    iResolution: {\r\n                        value: resolution\r\n                    },\r\n                    iMouse: {\r\n                        value: this.mousePosition\r\n                    },\r\n                    iChannel0: {\r\n                        value: null\r\n                    },\r\n                    iChannel1: {\r\n                        value: null\r\n                    }\r\n                });\r\n                this.animate();\r\n            }\r\n            animate() {\r\n                requestAnimationFrame(() => {\r\n                    const time = performance.now() / 1000;\r\n                    this.bufferA.uniforms['iFrame'].value = this.counter++;\r\n                    this.bufferA.uniforms['iTime'].value = time;\r\n                    this.bufferA.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;\r\n                    this.targetA.render(this.bufferA.scene, this.orthoCamera);\r\n                    this.bufferImage.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;\r\n                    this.bufferImage.uniforms['iTime'].value = time;\r\n                    this.targetC.render(this.bufferImage.scene, this.orthoCamera, true);\r\n                    this.animate();\r\n                });\r\n            }\r\n        }\r\n        class BufferShader {\r\n            constructor(fragmentShader, uniforms = {}) {\r\n                this.uniforms = uniforms;\r\n                this.material = new THREE.ShaderMaterial({\r\n                    fragmentShader: fragmentShader,\r\n                    vertexShader: getShaderSource('vs'),\r\n                    uniforms: uniforms\r\n                });\r\n                this.scene = new THREE.Scene();\r\n                this.scene.add(\r\n                    new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material)\r\n                );\r\n            }\r\n        }\r\n        class BufferManager {\r\n            constructor(renderer, size) {\r\n                this.renderer = renderer;\r\n                this.readBuffer = new THREE.WebGLRenderTarget(size.width, size.height, {\r\n                    minFilter: THREE.LinearFilter,\r\n                    magFilter: THREE.LinearFilter,\r\n                    format: THREE.RGBAFormat,\r\n                    type: THREE.FloatType,\r\n                    stencilBuffer: false\r\n                });\r\n                this.writeBuffer = this.readBuffer.clone();\r\n            }\r\n            swap() {\r\n                const temp = this.readBuffer;\r\n                this.readBuffer = this.writeBuffer;\r\n                this.writeBuffer = temp;\r\n            }\r\n            render(scene, camera, toScreen = false) {\r\n                if (toScreen) {\r\n                    this.renderer.render(scene, camera);\r\n                } else {\r\n                    this.renderer.setRenderTarget(this.writeBuffer);\r\n                    this.renderer.clear();\r\n                    this.renderer.render(scene, camera)\r\n                    this.renderer.setRenderTarget(null);\r\n                }\r\n                this.swap();\r\n            }\r\n        }\r\n        document.addEventListener('DOMContentLoaded', () => {\r\n            (new App()).start();\r\n        });\r\n    </script>\r\n    <script src=\"https://fastly.jsdelivr.net/npm/three@0.121.1/build/three.js\">\r\n    </script>\r\n</body>\r\n\r\n</html>"]

async function showSnippetDialog(baseUri, textarea) {
    const snippet = document.createElement('custom-select');
    const div = document.createElement('div');
    snippet.appendChild(div);
    const res = await fetch(`${baseUri}/snippets`);
    const snippets = await res.json();
    snippets.forEach(snippetv => {
        const d = document.createElement('div');
        d.textContent = snippetv;
        d.className = 'title';
        div.appendChild(d);
        d.addEventListener('click', () => {
            let selectionStart = textarea.selectionStart;
            let selectionEnd = textarea.selectionEnd;
            textarea.setRangeText(snippetv, selectionStart, selectionEnd)
            snippet.remove();
        })
    });
    document.body.appendChild(snippet);
    snippet.addEventListener('submit', async () => {
        let selectionStart = textarea.selectionStart;
        let selectionEnd = textarea.selectionEnd;
        let s = textarea.value.substring(selectionStart, selectionEnd).trim();
        if (!s) {
            const points = getLine(textarea);
            s = textarea.value.substring(points[0], points[1]).trim();
        }
        const res = await fetch(`${baseUri}/snippet`, {
            method: 'POST',
            body: s.trim()
        });

    });
    snippet.addEventListener('close', async () => {
        let selectionStart = textarea.selectionStart;
        let selectionEnd = textarea.selectionEnd;
        let s = textarea.value.substring(selectionStart, selectionEnd).trim();
        if (!s) {
            const points = getLine(textarea);
            s = textarea.value.substring(points[0], points[1]).trim();
        }
        const res = await fetch(`${baseUri}/snippet/delete`, {
            method: 'POST',
            body: s.trim()
        });
    });
}

function decreaseCode(textarea) {
    let s = textarea.value;
    s = removeSubstring(s, `<!DOCTYPE html>`, `<html lang='en'>`);
    s = removeSubstring(s, `<meta charset='UTF-8' />`, ` <script id="vs" type="x-shader/x-vertex">`);
    s = removeSubstring(s, `uniform vec4 iMouse;`, `uniform float iTime;`);
    s = removeSubstring(s, `window.loadImage = function(url, onload) {`, `})();`);
    s = removeSubstring(s, ` // const channel0Location = gl.getUniformLocation(program, 'iChannel0');`, ` const timeLocation = gl.getUniformLocation(program, "iTime");`);
    s = removeSubstring(s, `let mouseX = 0;`, `let frame = 0;`);
    s = removeSubstring(s, `// Tell WebGL how to convert from clip space to pixels`, `gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 1.0);`);
    s = removeSubstring(s, `gl.uniform4f(mouseLocation, mouseX, mouseY, mouseX, mouseY);`, `gl.uniform1f(timeLocation, time);`);
    s = removeSubstring(s, `window.onerror = function(errMsg, url, line, column, error) {`, `</script>`);
    s = removeSubstring(s, `<body>`, `</html>`);
    //s = removeSubstring(s,``, ``);
    s = s.replace(/void mainImage\([^)]+\)[\r\n ]+\{/, m => {
        return `
        
out vec4 ${m.match(/(?<=out vec4 )[^,]+/)};                                          
void main(){
vec2 ${m.match(/(?<=in vec2 )[^)]+/)} = gl_FragCoord.xy;
`
    }).replace(/out vec4 outColor;[\r\n ]+void main\(\)[\r\n ]+\{[\r\n ]+mainImage\(outColor, \gl_FragCoord.xy\);[\r\n ]+\}[\r\n ]+/, '')
        .replace(`</html>`, '')
        + `<body>
    <script src="/file?path=/storage/emulated/0/.editor/gl.js"></script>
  </body>
  </html>`


    textarea.value = s;
}
function removeSubstring(strings, prefix, suffix) {
    let start = strings.indexOf(prefix);
    if (start === -1) {
        return strings
    }

    let end = strings.indexOf(suffix, start + prefix.length);
    if (end === -1) {
        return strings
    }
    return `${strings.substring(0, start)}${strings.substring(end)}`;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
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
    */

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

}
function copyLine(textarea) {
    const points = getLine(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    let name = /[a-zA-Z0-9_]+(?= =)/.exec(s);


    let i = 0;
    while (new RegExp("\\b" + name + "\\b", 'g').test(textarea.value)) {
        i++
        name = `${/[a-zA-Z]+/.exec(name)}${i}`;
    }
    let str = `
${s.replace(/(?<=[a-zA-Z0-9] )[a-zA-Z0-9_]+(?= =)/, name)}`;
    let selectionEnd = textarea.selectionEnd;

    while (selectionEnd < textarea.value.length && textarea.value[selectionEnd] !== '\n') {
        selectionEnd++;
    }
    textarea.setRangeText(str, selectionEnd, selectionEnd);

}
function cutLine(textarea) {
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;

    while (selectionEnd < textarea.value.length) {
        selectionEnd++;
        if (textarea.value[selectionEnd] === ')') {
            selectionEnd++;
            break;
        }
    }
    let s = textarea.value.substring(selectionStart, selectionEnd).trim();
    writeText(s)
    textarea.setRangeText("", selectionStart, selectionEnd);

}
function copyBlock(textarea) {
    const points = findExtendPosition(textarea);
    s = textarea.value.substring(points[0], points[1]).trim();
    const buf = [];
    s = s.replaceAll(/(?<=[a-zA-Z] )[a-zA-Z0-9_]+(?= =)/g, m => {
        let name = m;
        let i = 0;
        while (buf.indexOf(name) !== -1 || new RegExp("\\b" + name + "\\b", 'g').test(textarea.value)) {
            i++
            name = `${/[a-zA-Z]+/.exec(name)}${i}`;
        }
        buf.push(name);
        return name;
    });

    let selectionEnd = points[1];

    while (selectionEnd < textarea.value.length && textarea.value[selectionEnd] !== '\n') {
        selectionEnd++;
    }
    textarea.setRangeText(`

${s}
`, selectionEnd, selectionEnd);

}
function goToLine(textarea) {
    const points = getLine(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    let i = parseInt(s) - 1;
    const p1 = `type="x-shader/x-fragment">`;
    const start = textarea.value.indexOf(p1);
    if (start === -1) return;
    const end = textarea.value.indexOf("</script>", start + p1.length);
    let array = textarea.value.substring(start + p1.length, end).split('\n');
    let index = textarea.value.indexOf(array[i]);
    textarea.focus();

    const fullText = textarea.value;
    textarea.value = fullText.substring(0, index + array[i].length);
    textarea.scrollTop = textarea.scrollHeight;
    textarea.value = fullText;

    textarea.selectionStart = index;
    textarea.selectionEnd = index + array[i].length;

}
function copyWord(textarea) {
    const points = getWordString(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    writeText(s);

}
function numberFormat(textarea, isIncrease) {
    const points = getWordString(textarea);
    let s = textarea.value.substring(points[0], points[1]).trim();
    let f = parseFloat(s);
    if (!f) {
        f = 1.0;
    } else {
        if (isIncrease) {
            f += 0.1;
        } else {
            f -= 0.1;

        }
    }
    textarea.setRangeText(f.toFixed(1), points[0], points[1]);


}
function parentheses(textarea) {
    let s = textarea.value;
    let start = textarea.selectionStart
    let end = textarea.selectionEnd;
    let i = 0;
    while (end < s.length) {
        if (s[end] === '(') {
            i++;
            end++;
            while (end < s.length) {
                end++;
                if (s[end] === ')')
                    i--;
                if (i === 0) {
                    break;
                }
            }
        } else if (s[end] !== '\n') {
            end++;
        } else {
            break;
        }
    }
    textarea.setRangeText("(", start, start);
    textarea.setRangeText(")", end + 1, end + 1);
}
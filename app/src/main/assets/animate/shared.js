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
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
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


const WEBGL = ["<!DOCTYPE html>\r\n<html lang='en'>\r\n\r\n<head>\r\n    <meta charset='UTF-8' />\r\n    <meta name='viewport' content='width=device-width, initial-scale=1.0' />\r\n    <meta http-equiv='X-UA-Compatible' content='ie=edge' />\r\n    <title>Document</title>\r\n    <style>\r\n        body {\r\n            margin: 0;\r\n        }\r\n\r\n        canvas {\r\n            width: 100%;\r\n            height: 100%;\r\n            display: block;\r\n        }\r\n    </style>\r\n    <script id=\"vs\" type=\"x-shader/x-vertex\">\r\n        #version 300 es\r\n     // an attribute is an input (in) to a vertex shader.\r\n     // It will receive data from a buffer\r\n     in vec4 a_position;\r\n     // all shaders have a main function\r\n     void main() {\r\n       // gl_Position is a special variable a vertex shader\r\n       // is responsible for setting\r\n       gl_Position = a_position;\r\n     }\r\n     </script>\r\n    <script id=\"fs\" type=\"x-shader/x-fragment\">\r\n        #version 300 es\r\n   precision highp float;\r\n   precision highp sampler2D;\r\n\r\n   uniform vec3 iResolution;\r\n   uniform vec4 iMouse;\r\n   uniform float iTime;\r\n   uniform sampler2D iChannel0;\r\n   uniform int iFrame;\r\n   ", "\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  mainImage(outColor, gl_FragCoord.xy);\r\n}\r\n     </script>\r\n</head>\r\n\r\n<body>\r\n    <script>\r\n        (function () {\r\n            'use strict';\r\n\r\n            window.getShaderSource = function (id) {\r\n                return document.getElementById(id).textContent.replace(/^\\s+|\\s+$/g, '');\r\n            };\r\n\r\n            function createShader(gl, source, type) {\r\n                var shader = gl.createShader(type);\r\n                gl.shaderSource(shader, source);\r\n                gl.compileShader(shader);\r\n                return shader;\r\n            }\r\n\r\n            window.createProgram = function (gl, vertexShaderSource, fragmentShaderSource) {\r\n                var program = gl.createProgram();\r\n                var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);\r\n                var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);\r\n                gl.attachShader(program, vshader);\r\n                gl.deleteShader(vshader);\r\n                gl.attachShader(program, fshader);\r\n                gl.deleteShader(fshader);\r\n                gl.linkProgram(program);\r\n\r\n                var log = gl.getProgramInfoLog(program);\r\n                if (log) {\r\n                    console.log(log);\r\n                }\r\n\r\n                log = gl.getShaderInfoLog(vshader);\r\n                if (log) {\r\n                    console.log(log);\r\n                }\r\n\r\n                log = gl.getShaderInfoLog(fshader);\r\n                if (log) {\r\n                    console.log(log);\r\n                }\r\n\r\n                return program;\r\n            };\r\n\r\n            window.loadImage = function (url, onload) {\r\n                var img = new Image();\r\n                img.src = url;\r\n                img.onload = function () {\r\n                    onload(img);\r\n                };\r\n                return img;\r\n            };\r\n\r\n            window.loadImages = function (urls, onload) {\r\n                var imgs = [];\r\n                var imgsToLoad = urls.length;\r\n\r\n                function onImgLoad() {\r\n                    if (--imgsToLoad <= 0) {\r\n                        onload(imgs);\r\n                    }\r\n                }\r\n\r\n                for (var i = 0; i < imgsToLoad; ++i) {\r\n                    imgs.push(loadImage(urls[i], onImgLoad));\r\n                }\r\n            };\r\n\r\n            window.loadObj = function (url, onload) {\r\n                var xhr = new XMLHttpRequest();\r\n                xhr.open('GET', url, true);\r\n                xhr.responseType = 'text';\r\n                xhr.onload = function (e) {\r\n                    var mesh = new OBJ.Mesh(this.response);\r\n                    onload(mesh);\r\n                };\r\n                xhr.send();\r\n            };\r\n        })();\r\n        const startRecording = () => {\r\n\r\n            const canvas = document.querySelector(\"canvas\");\r\n            const data = []; // here we will store our recorded media chunks (Blobs)\r\n            const stream = canvas.captureStream(30); // records the canvas in real time at our preferred framerate 30 in this case.\r\n            const mediaRecorder = new MediaRecorder(stream, {\r\n                mimeType: \"video/webm; codecs=vp9\"\r\n            }); // init the recorder\r\n            // whenever the recorder has new data, we will store it in our array\r\n            mediaRecorder.ondataavailable = (e) => data.push(e.data);\r\n            // only when the recorder stops, we construct a complete Blob from all the chunks\r\n            mediaRecorder.onstop = (e) =>\r\n                downloadVideo(new Blob(data, { type: \"video/webm;codecsvp9\" }));\r\n            mediaRecorder.start();\r\n            setTimeout(() => {\r\n                mediaRecorder.stop();\r\n            }, 20000); // stop recording in 6s\r\n        };\r\n\r\n        const downloadVideo = async (blob) => {\r\n            const div = document.querySelector(\"body\");\r\n            var url = URL.createObjectURL(blob);\r\n            var a = document.createElement(\"a\");\r\n            a.href = url;\r\n            a.download = \"test.webm\";\r\n            a.className = \"button\";\r\n            a.innerText = \"click here to download\";\r\n            div.appendChild(a);\r\n        };\r\n    </script>\r\n    <script>\r\n        var canvas = document.createElement('canvas');\r\n        canvas.height = 600;\r\n        canvas.width = 600;\r\n        canvas.style.width = '600px';\r\n        canvas.style.height = '600px';\r\n        document.body.appendChild(canvas);\r\n        var gl = canvas.getContext('webgl2', { antialias: false });\r\n        var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));\r\n        const positionAttributeLocation = gl.getAttribLocation(program, \"a_position\");\r\n        const resolutionLocation = gl.getUniformLocation(program, \"iResolution\");\r\n        // const channel0Location = gl.getUniformLocation(program, 'iChannel0');\r\n\r\n        const mouseLocation = gl.getUniformLocation(program, \"iMouse\");\r\n        const timeLocation = gl.getUniformLocation(program, \"iTime\");\r\n        const frameLocation = gl.getUniformLocation(program, \"iFrame\");\r\n        const vao = gl.createVertexArray();\r\n        gl.bindVertexArray(vao);\r\n        const positionBuffer = gl.createBuffer();\r\n        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\r\n        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\r\n            -1, -1, // first triangle\r\n            1, -1,\r\n            -1, 1,\r\n            -1, 1, // second triangle\r\n            1, -1,\r\n            1, 1,\r\n        ]), gl.STATIC_DRAW);\r\n        gl.enableVertexAttribArray(positionAttributeLocation);\r\n        gl.vertexAttribPointer(\r\n            positionAttributeLocation,\r\n            2,\r\n            gl.FLOAT,\r\n            false,\r\n            0,\r\n            0,\r\n        );\r\n        let mouseX = 0;\r\n        let mouseY = 0;\r\n\r\n        function setMousePosition(e) {\r\n            const rect = canvas.getBoundingClientRect();\r\n            mouseX = e.clientX - rect.left;\r\n            mouseY = rect.height - (e.clientY - rect.top) - 1;\r\n        }\r\n        canvas.addEventListener('mousemove', setMousePosition);\r\n        canvas.addEventListener('touchstart', (e) => {\r\n            e.preventDefault();\r\n        }, {\r\n            passive: false\r\n        });\r\n        canvas.addEventListener('touchmove', (e) => {\r\n            e.preventDefault();\r\n            setMousePosition(e.touches[0]);\r\n        }, {\r\n            passive: false\r\n        });\r\n\r\n        let frame = 0;\r\n\r\n        gl.useProgram(program);\r\n\r\n        gl.bindVertexArray(vao);\r\n        function render(time) {\r\n            time *= 0.001; // convert to seconds\r\n            frame++;\r\n            // Tell WebGL how to convert from clip space to pixels\r\n            //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);\r\n\r\n\r\n\r\n            // Bind the attribute/buffer set we want.\r\n\r\n\r\n            gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 1.0);\r\n            gl.uniform4f(mouseLocation, mouseX, mouseY, mouseX, mouseY);\r\n            gl.uniform1f(timeLocation, time);\r\n            gl.uniform1i(frameLocation, frame);\r\n\r\n            gl.drawArrays(\r\n                gl.TRIANGLES,\r\n                0, // offset\r\n                6, // num vertices to process\r\n            );\r\n\r\n            requestAnimationFrame(render);\r\n        }\r\n        requestAnimationFrame(render);\r\n\r\n    </script>\r\n</body>\r\n\r\n</html>"];

function formatGlslCode(code) {
    const options = { indent_size: 2, space_in_empty_paren: true }
    code = html_beautify(code, options);
    const points = substring(code, `<script id="fs" type="x-shader/x-fragment">`, `</script>`);
    if (points[0] === 0 && points[1] === 0) {
        return code;
    }
    s = code.substring(points[0], points[1]);
    s = GLSLX.format(s);
    return code.substring(0, points[0]) + s + code.substring(points[1]);
}

const BABYLON =["<!DOCTYPE html>\r\n<html>\r\n    <head>\r\n        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n\r\n        <title>Babylon.js sample code</title>\r\n\r\n        <!-- Babylon.js -->\r\n        <script src=\"https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.2/dat.gui.min.js\"></script>\r\n        <script src=\"https://assets.babylonjs.com/generated/Assets.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/recast.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/ammo.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/havok/HavokPhysics_umd.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/cannon.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/Oimo.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/earcut.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/babylon.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/proceduralTexturesLibrary/babylonjs.proceduralTextures.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/postProcessesLibrary/babylonjs.postProcess.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/loaders/babylonjs.loaders.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/serializers/babylonjs.serializers.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/gui/babylon.gui.min.js\"></script>\r\n        <script src=\"https://cdn.babylonjs.com/inspector/babylon.inspector.bundle.js\"></script>\r\n\r\n        <style>\r\n            html, body {\r\n                overflow: hidden;\r\n                width: 100%;\r\n                height: 100%;\r\n                margin: 0;\r\n                padding: 0;\r\n            }\r\n\r\n            #renderCanvas {\r\n                width: 100%;\r\n                height: 100%;\r\n                touch-action: none;\r\n            }\r\n            \r\n            #canvasZone {\r\n                width: 100%;\r\n                height: 100%;\r\n            }\r\n        </style>\r\n    </head>\r\n<body>\r\n    <div id=\"canvasZone\"><canvas id=\"renderCanvas\"></canvas></div>\r\n    <script>\r\n        var canvas = document.getElementById(\"renderCanvas\");\r\n\r\n        var startRenderLoop = function (engine, canvas) {\r\n            engine.runRenderLoop(function () {\r\n                if (sceneToRender && sceneToRender.activeCamera) {\r\n                    sceneToRender.render();\r\n                }\r\n            });\r\n        }\r\n\r\n        var engine = null;\r\n        var scene = null;\r\n        var sceneToRender = null;\r\n        var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };\r\n        ","\n                window.initFunction = async function() {\n                    \n                    \n                    \n                    var asyncEngineCreation = async function() {\n                        try {\n                        return createDefaultEngine();\n                        } catch(e) {\n                        console.log(\"the available createEngine function failed. Creating the default engine instead\");\n                        return createDefaultEngine();\n                        }\n                    }\n\n                    window.engine = await asyncEngineCreation();\r\n        if (!engine) throw 'engine should not be null.';\r\n        startRenderLoop(engine, canvas);\r\n        window.scene = createScene();};\r\n        initFunction().then(() => {sceneToRender = scene                    \r\n        });\r\n\r\n        // Resize\r\n        window.addEventListener(\"resize\", function () {\r\n            engine.resize();\r\n        });\r\n    </script>\r\n</body>\r\n</html>\r\n"]
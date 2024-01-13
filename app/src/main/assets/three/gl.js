'use strict';
window.getShaderSource = function (id) {
    return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
};
function createShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}
window.createProgram = function (gl, vertexShaderSource, fragmentShaderSource) {
    var program = gl.createProgram();
    var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vshader);
    gl.deleteShader(vshader);
    gl.attachShader(program, fshader);
    gl.deleteShader(fshader);
    gl.linkProgram(program);
    var log = gl.getProgramInfoLog(program);
    if (log) {
        console.log(log);
    }
    log = gl.getShaderInfoLog(vshader);
    if (log) {
        console.log(log);
    }
    log = gl.getShaderInfoLog(fshader);
    if (log) {
        document.body.textContent = log;
    }
    return program;
};

window.onerror = function (errMsg, url, line, column, error) {
    var result = !column ? '' : 'column: ' + column;
    result += !error;
    document.write("\nError= " + errMsg + "\nurl= " + url + "\nline= " + line + result);
    var suppressErrorAlert = true;
    return suppressErrorAlert;
};
document.addEventListener('visibilitychange', async evt => {
    if (document.visibilityState === "visible") {
        location.reload();
    }
})
var canvas = document.createElement('canvas');
let canvasWidth = 300;
let canvasHeight = 300;
let isDate = false;
const dataset = document.body.dataset;
if (dataset.size) {
    const array = dataset.size.split(' ');
    canvasWidth = parseInt(array[0], 10);
    canvasHeight = parseInt(array[1], 10);
}
if (dataset.isdate) {
    isDate = true;
}
canvas.height = canvasWidth;
canvas.width = canvasHeight;
canvas.style.width = canvasWidth + 'px';
canvas.style.height = canvasHeight + 'px';
document.body.appendChild(canvas);
var gl = canvas.getContext('webgl2', {
    antialias: false
});
var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionLocation = gl.getUniformLocation(program, "iResolution");
const mouseLocation = gl.getUniformLocation(program, "iMouse");
const timeLocation = gl.getUniformLocation(program, "iTime");
const frameLocation = gl.getUniformLocation(program, "iFrame");
const dateLocation = gl.getUniformLocation(program, "iDate");
const timeDeltaLocation = gl.getUniformLocation(program, "iTimeDelta");
const frameRateLocation = gl.getUniformLocation(program, "iFrameRate");

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(
    positionAttributeLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0,
);
let mouseX = 0;
let mouseY = 0;
function setMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = rect.height - (e.clientY - rect.top) - 1;
}
canvas.addEventListener('mousemove', setMousePosition);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, {
    passive: false
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    setMousePosition(e.touches[0]);
}, {
    passive: false
});
let frame = 0;
let then = 0;
gl.useProgram(program);
gl.bindVertexArray(vao);
function render(time) {
    time *= 0.001;
    frame++;
    gl.clearColor(0., 0., 0., 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, 1.0);
    gl.uniform4f(mouseLocation, mouseX, mouseY, mouseX, mouseY);
    gl.uniform1f(timeLocation, time);
    gl.uniform1f(timeDeltaLocation, then - time);
    gl.uniform1f(frameRateLocation, then - time / (1 / 60));
    then = time;

    gl.uniform1i(frameLocation, frame);
    if (isDate) {
        const d = new Date();
        let dates = [d.getFullYear(), // the year (four digits)
        d.getMonth(),	   // the month (from 0-11)
        d.getDate(),     // the day of the month (from 1-31)
        d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
        gl.uniform4fv(dateLocation, new Float32Array(dates));
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
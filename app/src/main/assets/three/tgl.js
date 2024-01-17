class BufferShader {
    constructor(fragmentShader, uniforms = {}) {
        this.uniforms = uniforms;
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: getShaderSource('vs'),
            uniforms: uniforms
        });
        this.scene = new THREE.Scene();
        this.scene.add(
            new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material)
        );
    }
}
class BufferManager {
    constructor(renderer, size) {
        this.renderer = renderer;
        this.readBuffer = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });
        this.writeBuffer = this.readBuffer.clone();
    }
    swap() {
        const temp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = temp;
    }
    render(scene, camera, toScreen = false) {
        if (toScreen) {
            this.renderer.render(scene, camera);
        } else {
            this.renderer.setRenderTarget(this.writeBuffer);
            this.renderer.clear();
            this.renderer.render(scene, camera)
            this.renderer.setRenderTarget(null);
        }
        this.swap();
    }
}
class App {
    constructor() {
        this.width = 300;
        this.height = 300;
        this.renderer = new THREE.WebGLRenderer();
        this.loader = new THREE.TextureLoader();
        this.clock = new THREE.Clock();
        this.mousePosition = new THREE.Vector4();
        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.counter = 0;
        this.renderer.setSize(this.width, this.height);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.addEventListener('mousedown', () => {
            this.mousePosition.setZ(1);
            this.counter = 0;
        });
        this.renderer.domElement.addEventListener('mouseup', () => {
            this.mousePosition.setZ(0);
        });
        this.renderer.domElement.addEventListener('mousemove', event => {
            this.mousePosition.setX(event.clientX);
            this.mousePosition.setY(this.height - event.clientY);
        });
        this.targetA = new BufferManager(this.renderer, {
            width: this.width,
            height: this.height
        });
        if (document.getElementById('bb')) {
            this.targetB = new BufferManager(this.renderer, {
                width: this.width,
                height: this.height
            });
        }
        this.targetC = new BufferManager(this.renderer, {
            width: this.width,
            height: this.height
        });
    }
    start() {
        const resolution = new THREE.Vector3(this.width, this.height, window.devicePixelRatio);
        this.bufferA = new BufferShader(getShaderSource('ba'), {
            iTime: {
                value: 0
            },
            iFrame: {
                value: 0
            },
            iResolution: {
                value: resolution
            },
            iMouse: {
                value: this.mousePosition
            },
            iChannel0: {
                value: null
            },
            iChannel1: {
                value: null
            }, iChannelResolution: {
                value: [new THREE.Vector3(300, 300, 1)]
            }
        });
        if (document.getElementById('bb')) {
            this.bufferB = new BufferShader(getShaderSource('bb'), {
                iTime: {
                    value: 0
                },
                iFrame: {
                    value: 0
                }, iTimeDelta: {
                    value: this.clock.getDelta()
                },
                iResolution: {
                    value: resolution
                },
                iMouse: {
                    value: this.mousePosition
                },
                iChannel0: {
                    value: null
                },
                iChannel1: {
                    value: null
                },
                iChannel2: {
                    value: null
                }, iChannelResolution: {
                    value: [new THREE.Vector3(300, 300, 1)]
                }
            });
        }
        this.bufferImage = new BufferShader(getShaderSource('fs'), {
            iTime: {
                value: 0
            },
            iFrame: {
                value: 0
            },
            iResolution: {
                value: resolution
            },
            iMouse: {
                value: this.mousePosition
            },
            iChannel0: {
                value: null
            },
            iChannel1: {
                value: null
            }, iChannelResolution: {
                value: [new THREE.Vector3(300, 300, 1)]
            }
        });
        this.animate();
    }
    animate() {
        requestAnimationFrame(() => {

            const time = performance.now() / 1000;
            /*
             this.bufferB.uniforms['iFrame'].value = this.counter;
                      this.bufferB.uniforms['iTime'].value = time;
                      this.bufferB.uniforms['iChannel0'].value = this.targetB.readBuffer.texture;
                      this.targetB.render(this.bufferB.scene, this.orthoCamera);
            */
            this.bufferA.uniforms['iFrame'].value = this.counter++;
            this.bufferA.uniforms['iTime'].value = time;
            // this.bufferA.uniforms['iTimeDelta'].value =  this.clock.getDelta();
            this.bufferA.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;
            this.targetA.render(this.bufferA.scene, this.orthoCamera);
            this.bufferImage.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;
            this.bufferImage.uniforms['iTime'].value = time;
            this.targetC.render(this.bufferImage.scene, this.orthoCamera, true);
            this.animate();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    (new App()).start();
});
// https://github.com/Shakthi/three-shadertoy-material/blob/dfbe69be12e9229877e0ddb4840d36f984611c35/src/ShaderToyMaterial.js#L142
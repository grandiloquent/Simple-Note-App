function loadCubeMap(urls) {
    urls = [
        "/file?path=/storage/emulated/0/.editor/images/v.jpg",
        "/file?path=/storage/emulated/0/.editor/images/v_1.jpg",
        "/file?path=/storage/emulated/0/.editor/images/v_2.jpg",
        "/file?path=/storage/emulated/0/.editor/images/v_3.jpg",
        "/file?path=/storage/emulated/0/.editor/images/v_4.jpg",
        "/file?path=/storage/emulated/0/.editor/images/v_5.jpg",
    ];
    let images = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
    let numLoaded = 0;
    for (var i = 0; i < 6; i++) {
        images[i].id = i;
        images[i].crossOrigin = '';
        images[i].onload = function () {
            var id = this.id;
            numLoaded++;
            if (numLoaded === 6) {
                var id = gl.createTexture();
                let flipY = false;
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, id);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
                gl.activeTexture(gl.TEXTURE0);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, 32856, 6408, 5121, images[0]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, 32856, 6408, 5121, images[1]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, 32856, 6408, 5121, (flipY ? images[3] : images[2]));
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, 32856, 6408, 5121, (flipY ? images[2] : images[3]));
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, 32856, 6408, 5121, images[4]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, 32856, 6408, 5121, images[5]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
               gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }
        }
        images[i].src = urls[i];
    }

}
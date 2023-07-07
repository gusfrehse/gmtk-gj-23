import './style.css'

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('Canvas not found');
}

let gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
if (!gl) {
    throw new Error('WebGL2 not supported');
}

function compileShader(source: string, type: number): WebGLShader {
    let shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Shader creation failed');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('Shader compilation failed: ' + gl.getShaderInfoLog(shader));
    }

    return shader;
}

function linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    let program = gl.createProgram();
    if (!program) {
        throw new Error('Program creation failed');
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Program linking failed: ' + gl.getProgramInfoLog(program));
    }

    return program;
}

function createVertexBuffer(data: Float32Array): WebGLBuffer {
    let buffer = gl.createBuffer();
    if (!buffer) {
        throw new Error('Buffer creation failed');
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer;
}


let vertexShaderSource = `#version 300 es
precision highp float;

layout(location = 0) in vec2 position;
layout(location = 1) in vec2 uv;

out vec2 v_uv;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    v_uv = uv;
}
`;

let fragmentShaderSource = `#version 300 es
precision highp float;

out vec4 color;

in vec2 v_uv;

uniform sampler2D tex;

void main() {
    color = texture(tex, v_uv);
    color.w = 1.0;
}
`;

let vertices = new Float32Array([
    -0.5, -0.5, 0.0, 1.0,
     0.5, -0.5, 1.0, 1.0,
     0.5,  0.5, 1.0, 0.0,
    -0.5, -0.5, 0.0, 1.0,
     0.5,  0.5, 1.0, 0.0,
    -0.5,  0.5, 0.0, 0.0
]);

let vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
let fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
let program = linkProgram(vertexShader, fragmentShader);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let vbo = createVertexBuffer(vertices);

let texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255]));

let image = new Image();
image.src = 'https://webgl2fundamentals.org/webgl/resources/f-texture.png';
image.crossOrigin = 'anonymous';
image.addEventListener('load', () => {
    console.log('Image loaded');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 4);
});

gl.useProgram(program);

// Specify vertex formats
const stride = (2 + 2) * 4;

gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
gl.vertexAttribDivisor(0, 0);

gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * 4);
gl.vertexAttribDivisor(1, 0);

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 4);


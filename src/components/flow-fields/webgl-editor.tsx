'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { WebglCanvas } from '~/components/flow-fields/webgl-canvas';
import { mat4 } from 'gl-matrix';

const size = 600;

import vsSource from './vert.glsl';
import fsSource from './frag.glsl';

const useImage = (src: string) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = src;
  }, [src]);

  return image;
}

const useTexture = (canvasRef:  React.RefObject<HTMLCanvasElement>, url: string) => {
  console.log(`Creating texture for image at ${url}`);

  const [texture, setTexture] = useState<WebGLTexture | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const gl = canvasRef.current.getContext('webgl2');
    if (!gl) return;

    const tex = gl.createTexture();
    if (!tex) {
      console.warn('no texture');
      return;
    }

    setTexture(tex);

    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so that we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    const pixel = new Uint8Array([0, 255, 255, 255]); // opaque blue
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
      console.log('image loaded');
      console.log(gl.getParameter(gl.TEXTURE_BINDING_2D));

      gl.bindTexture(gl.TEXTURE_2D, tex);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents s-coordinate wrapping (repeating).
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Prevents t-coordinate wrapping (repeating).
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // Point filtering
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // Point filtering

      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image,
      );
    };
    image.src = url;
  }, [canvasRef.current, url]);

  return texture;
}


export const WebglEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const texture = useTexture(canvasRef, '/images/test_image.png');
  const [renderedOnce, setRenderedOnce] = useState(false);

  const onClick = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('no canvas');
      return;
    }

    const gl = canvas.getContext('webgl2');

    console.log(gl);
    if (!gl) {
      console.warn('no context');
      return;
    }

    // Load the shaders
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    if (!vertexShader) {
      console.warn('no vertex shader');
      return;
    }

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!fragmentShader) {
      console.warn('no fragment shader');
      return;
    }

    // Create the shader program
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) {
      console.warn('no shader program');
      return;
    }

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shaderProgram,
        )}`,
      );
      return null;
    }

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        uTexture: gl.getUniformLocation(shaderProgram, "uTexture"),
        uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
      },
    };

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything

    // Probably not needed since we're drawing in 2D
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas.
    // We only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [-0.0, 0.0, -3.0] // amount to translate
    );

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    const buffers = initBuffers(gl);

    if (!buffers.position) {
      console.warn('no position buffer');
      return;
    }
    setPositionAttribute(gl, buffers.position, programInfo);

    if (!buffers.textureCoord) {
      console.warn('no texture coord buffer');
      return;
    }
    setTextureCoordAttribute(gl, buffers.textureCoord, programInfo)

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix,
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix,
    );

    // const texture = loadTexture(gl, '/images/test_image.png');
    if (!texture) {
      console.warn('no texture');
      return;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uTexture, 0);

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('rendering texture');

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  if (texture && !renderedOnce) {
    onClick();
    setRenderedOnce(true);
  }

  return (
    <div className="grid grid-cols-4 gap-2 aspect-[4/3]">
      <Card>
        <CardHeader>
          Controls
        </CardHeader>
        <CardContent>
          <Button
            className="w-full mt-6"
            onClick={onClick}
          >
            Draw
          </Button>
        </CardContent>
      </Card>
      <Card className="flex items-center justify-center col-span-3 overflow-hidden">
          <WebglCanvas height={size} width={size} ref={canvasRef} />
        {/*<Card className="w-[600px] aspect-square overflow-hidden">*/}
        {/*</Card>*/}
      </Card>
    </div>
  )
};

function initBuffers(gl: WebGLRenderingContext) {
  return {
    position: getPositionBuffer(gl),
    textureCoord: getTextureCoordBuffer(gl),
  };
}

function getPositionBuffer(gl: WebGLRenderingContext) {
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0,  1.0,
    1.0,  1.0,
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
  );

  return positionBuffer;
}

function getTextureCoordBuffer(gl: WebGLRenderingContext) {
  const textureCoordBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  // In same order as positions
  const textureCoordinates = [
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    1.0,  1.0,
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
  );

  return textureCoordBuffer;
}

function setPositionAttribute(gl: WebGLRenderingContext, buffer: WebGLBuffer, programInfo: any) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  const offset = 0; // how many bytes inside the buffer to start from

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(
    programInfo.attribLocations.vertexPosition,
  );
}

function setTextureCoordAttribute(gl: WebGLRenderingContext, buffer: WebGLBuffer, programInfo: any) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  const offset = 0; // how many bytes inside the buffer to start from

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(
    programInfo.attribLocations.textureCoord,
  );
}

function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture();
  if (!texture) {
    console.warn('no texture');
    return null;
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so that we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  const pixel = new Uint8Array([0, 255, 255, 255]); // opaque blue
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
    console.log('image loaded');
    console.log(gl.getParameter(gl.TEXTURE_BINDING_2D));

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Prevents t-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // Point filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // Point filtering

    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image,
    );
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    console.warn('no shader');
    return null;
  }

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

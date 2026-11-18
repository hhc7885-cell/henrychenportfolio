// A shallow wave field holds two successive water heights per texel. The
// photo is sampled at display resolution, independent of the simulation grid.
const fieldWidth = 300;
const fieldHeight = 188;
const tick = 1000 / 60;

const vertexSource = `#version 300 es
out vec2 uv;
void main() {
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  uv = corner;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`;

const waveSource = `#version 300 es
precision highp float;
uniform sampler2D field;
uniform vec2 cell;
uniform vec4 stroke;
uniform float strength, aspect;
in vec2 uv;
out vec4 result;
void main() {
  vec2 heights = texture(field, uv).rg;
  float neighbors = texture(field, uv + vec2(cell.x, 0)).r
                  + texture(field, uv - vec2(cell.x, 0)).r
                  + texture(field, uv + vec2(0, cell.y)).r
                  + texture(field, uv - vec2(0, cell.y)).r;
  vec2 scale = vec2(aspect, 1);
  vec2 line = (stroke.zw - stroke.xy) * scale;
  vec2 point = (uv - stroke.xy) * scale;
  float along = clamp(dot(point, line) / max(dot(line, line), 0.000001), 0., 1.);
  vec2 offset = point - along * line;
  float impulse = strength * exp(-dot(offset, offset) / 0.0019);
  result = vec4((neighbors * 0.5 - heights.g) * 0.974 - impulse, heights.r, 0, 1);
}`;

const photoSource = `#version 300 es
precision highp float;
uniform sampler2D field, photo;
uniform vec2 cell, crop;
uniform float time, hover;
in vec2 uv;
out vec4 result;
void main() {
  vec2 normal = vec2(
    texture(field, uv + vec2(cell.x, 0)).r - texture(field, uv - vec2(cell.x, 0)).r,
    texture(field, uv + vec2(0, cell.y)).r - texture(field, uv - vec2(0, cell.y)).r
  );
  vec2 drift = vec2(sin(uv.y * 8. + time * 0.7), cos(uv.x * 6. - time * 0.55));
  vec2 refracted = clamp(uv + normal * 0.2 + drift * (0.0013 * hover), 0., 1.);
  vec2 sampleAt = (refracted - 0.5) * crop + 0.5;
  float light = clamp(1. + dot(normal, vec2(0.6)), 0.94, 1.06);
  result = vec4(texture(photo, sampleAt).rgb * light, 1.);
}`;

function makeProgram(gl: WebGL2RenderingContext, fragment: string) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertexSource],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error("Ripple shader unavailable");
  return program;
}

function makeTexture(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function buildRenderer(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
  const wave = makeProgram(gl, waveSource);
  const render = makeProgram(gl, photoSource);
  const stroke = gl.getUniformLocation(wave, "stroke");
  const strength = gl.getUniformLocation(wave, "strength");
  const aspect = gl.getUniformLocation(wave, "aspect");
  const crop = gl.getUniformLocation(render, "crop");
  const time = gl.getUniformLocation(render, "time");
  const hover = gl.getUniformLocation(render, "hover");
  for (const program of [wave, render]) {
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, "field"), 0);
    gl.uniform2f(
      gl.getUniformLocation(program, "cell"),
      1 / fieldWidth,
      1 / fieldHeight,
    );
  }
  gl.uniform1i(gl.getUniformLocation(render, "photo"), 1);
  const cover = makeTexture(gl);
  const buffers = Array.from({ length: 2 }, () => {
    const texture = makeTexture(gl);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RG16F, fieldWidth, fieldHeight);
    const framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Water surface unavailable");
    return { texture, framebuffer };
  });
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 220ms linear",
  });
  let read = 0;
  let frame = 0;
  let previousTime = 0;
  let accumulated = 0;
  let lastContact = 0;
  let fromX = 0,
    fromY = 0,
    toX = 0,
    toY = 0;
  let pressing = false;
  let amplitude = 0;
  let calm = 0;
  let loaded = "";
  let viewAspect = 1;

  function clear() {
    for (const { framebuffer } of buffers) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function paint(now: number) {
    frame = 0;
    if (gl.isContextLost() || !canvas.isConnected) {
      canvas.style.opacity = "0";
      return;
    }
    // Advance at a fixed physical rate on both high-refresh and slow displays.
    accumulated += Math.min(50, now - previousTime);
    previousTime = now;
    while (accumulated >= tick) {
      const write = 1 - read;
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[write].framebuffer);
      gl.viewport(0, 0, fieldWidth, fieldHeight);
      gl.useProgram(wave);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, buffers[read].texture);
      gl.uniform4f(stroke, fromX, fromY, toX, toY);
      gl.uniform1f(strength, amplitude);
      gl.uniform1f(aspect, viewAspect);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      amplitude = 0;
      fromX = toX;
      fromY = toY;
      calm += ((pressing ? 1 : 0) - calm) * 0.1;
      read = write;
      accumulated -= tick;
    }
    if (!pressing && now - lastContact > 2700) {
      canvas.style.opacity = "0";
      clear();
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(render);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buffers[read].texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cover);
    gl.uniform1f(time, now / 1000);
    gl.uniform1f(hover, calm);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    canvas.style.opacity = "1";
    frame = requestAnimationFrame(paint);
  }
  return {
    attach(holder: HTMLElement, image: HTMLImageElement) {
      if (!image.complete || !image.naturalWidth || gl.isContextLost())
        return false;
      const width = holder.clientWidth,
        height = holder.clientHeight;
      if (!width || !height) return false;
      if (canvas.parentElement !== holder) {
        clear();
        holder.appendChild(canvas);
      }
      if (loaded !== image.currentSrc) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, cover);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        loaded = image.currentSrc;
      }
      const density = Math.min(window.devicePixelRatio || 1, 2);
      const deviceWidth = Math.round(width * density),
        deviceHeight = Math.round(height * density);
      if (canvas.width !== deviceWidth || canvas.height !== deviceHeight) {
        canvas.width = deviceWidth;
        canvas.height = deviceHeight;
      }
      viewAspect = width / height;
      const ratio = viewAspect / (image.naturalWidth / image.naturalHeight);
      gl.useProgram(render);
      gl.uniform2f(crop, Math.min(1, ratio), Math.min(1, 1 / ratio));
      return true;
    },
    disturb(x: number, y: number) {
      if (!pressing) {
        fromX = x;
        fromY = y;
      }
      pressing = true;
      toX = x;
      toY = y;
      amplitude = Math.min(
        0.26,
        0.045 + Math.hypot(toX - fromX, toY - fromY) * 1.1,
      );
      lastContact = performance.now();
      if (!frame) {
        previousTime = lastContact;
        accumulated = tick;
        frame = requestAnimationFrame(paint);
      }
    },
    leave() {
      if (pressing) lastContact = performance.now();
      pressing = false;
    },
    detach() {
      cancelAnimationFrame(frame);
      frame = 0;
      amplitude = 0;
      calm = 0;
      pressing = false;
      canvas.style.opacity = "0";
      canvas.remove();
    },
    destroy() {
      this.detach();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export function createRippleRenderer() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    depth: false,
    antialias: false,
  });
  if (!gl) return null;
  try {
    if (gl.getExtension("EXT_color_buffer_float"))
      return buildRenderer(canvas, gl);
  } catch {
    /* The original cover remains visible if the GPU cannot render the field. */
  }
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return null;
}

// import React, { useRef, useEffect } from "react";

// interface LightningProps {
//   hue?: number;
//   xOffset?: number;
//   speed?: number;
//   intensity?: number;
//   size?: number;
// }

// const Lightning: React.FC<LightningProps> = ({
//   hue = 230,
//   xOffset = 0,
//   speed = 1,
//   intensity = 1,
//   size = 1,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const resizeCanvas = () => {
//       canvas.width = canvas.clientWidth;
//       canvas.height = canvas.clientHeight;
//     };
//     resizeCanvas();
//     window.addEventListener("resize", resizeCanvas);

//     const gl = canvas.getContext("webgl");
//     if (!gl) {
//       console.error("WebGL not supported");
//       return;
//     }

//     const vertexShaderSource = `
//       attribute vec2 aPosition;
//       void main() {
//         gl_Position = vec4(aPosition, 0.0, 1.0);
//       }
//     `;

//     const fragmentShaderSource = `
//       precision mediump float;
//       uniform vec2 iResolution;
//       uniform float iTime;
//       uniform float uHue;
//       uniform float uXOffset;
//       uniform float uSpeed;
//       uniform float uIntensity;
//       uniform float uSize;
      
//       #define OCTAVE_COUNT 10

//       vec3 hsv2rgb(vec3 c) {
//           vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
//           return c.z * mix(vec3(1.0), rgb, c.y);
//       }

//       float hash11(float p) {
//           p = fract(p * .1031);
//           p *= p + 33.33;
//           p *= p + p;
//           return fract(p);
//       }

//       float hash12(vec2 p) {
//           vec3 p3 = fract(vec3(p.xyx) * .1031);
//           p3 += dot(p3, p3.yzx + 33.33);
//           return fract((p3.x + p3.y) * p3.z);
//       }

//       mat2 rotate2d(float theta) {
//           float c = cos(theta);
//           float s = sin(theta);
//           return mat2(c, -s, s, c);
//       }

//       float noise(vec2 p) {
//           vec2 ip = floor(p);
//           vec2 fp = fract(p);
//           float a = hash12(ip);
//           float b = hash12(ip + vec2(1.0, 0.0));
//           float c = hash12(ip + vec2(0.0, 1.0));
//           float d = hash12(ip + vec2(1.0, 1.0));
          
//           vec2 t = smoothstep(0.0, 1.0, fp);
//           return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
//       }

//       float fbm(vec2 p) {
//           float value = 0.0;
//           float amplitude = 0.5;
//           for (int i = 0; i < OCTAVE_COUNT; ++i) {
//               value += amplitude * noise(p);
//               p *= rotate2d(0.45);
//               p *= 2.0;
//               amplitude *= 0.5;
//           }
//           return value;
//       }

//       void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
//           vec2 uv = fragCoord / iResolution.xy;
//           uv = 2.0 * uv - 1.0;
//           uv.x *= iResolution.x / iResolution.y;
//           uv.x += uXOffset;
          
//           uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          
//           float dist = abs(uv.x);
//           vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
//           vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
//           col = pow(col, vec3(1.0));
//           fragColor = vec4(col, 1.0);
//       }

//       void main() {
//           mainImage(gl_FragColor, gl_FragCoord.xy);
//       }
//     `;

//     const compileShader = (
//       source: string,
//       type: number
//     ): WebGLShader | null => {
//       const shader = gl.createShader(type);
//       if (!shader) return null;
//       gl.shaderSource(shader, source);
//       gl.compileShader(shader);
//       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//         console.error("Shader compile error:", gl.getShaderInfoLog(shader));
//         gl.deleteShader(shader);
//         return null;
//       }
//       return shader;
//     };

//     const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
//     const fragmentShader = compileShader(
//       fragmentShaderSource,
//       gl.FRAGMENT_SHADER
//     );
//     if (!vertexShader || !fragmentShader) return;

//     const program = gl.createProgram();
//     if (!program) return;
//     gl.attachShader(program, vertexShader);
//     gl.attachShader(program, fragmentShader);
//     gl.linkProgram(program);
//     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//       console.error("Program linking error:", gl.getProgramInfoLog(program));
//       return;
//     }
//     gl.useProgram(program);

//     const vertices = new Float32Array([
//       -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
//     ]);
//     const vertexBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//     const aPosition = gl.getAttribLocation(program, "aPosition");
//     gl.enableVertexAttribArray(aPosition);
//     gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

//     const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
//     const iTimeLocation = gl.getUniformLocation(program, "iTime");
//     const uHueLocation = gl.getUniformLocation(program, "uHue");
//     const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
//     const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
//     const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
//     const uSizeLocation = gl.getUniformLocation(program, "uSize");

//     const startTime = performance.now();
//     const render = () => {
//       resizeCanvas();
//       gl.viewport(0, 0, canvas.width, canvas.height);
//       gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
//       const currentTime = performance.now();
//       gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
//       gl.uniform1f(uHueLocation, hue);
//       gl.uniform1f(uXOffsetLocation, xOffset);
//       gl.uniform1f(uSpeedLocation, speed);
//       gl.uniform1f(uIntensityLocation, intensity);
//       gl.uniform1f(uSizeLocation, size);
//       gl.drawArrays(gl.TRIANGLES, 0, 6);
//       requestAnimationFrame(render);
//     };
//     requestAnimationFrame(render);

//     return () => {
//       window.removeEventListener("resize", resizeCanvas);
//     };
//   }, [hue, xOffset, speed, intensity, size]);

//   return <canvas ref={canvasRef} className="w-full h-full relative" />;
// };

// export default Lightning;




import React, { useRef, useEffect, useState } from "react";

interface LightningProps {
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
  className?: string;
}

const Lightning: React.FC<LightningProps> = ({
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Theme detection and monitoring
  useEffect(() => {
    function getTheme(): "light" | "dark" {
      if (typeof window === "undefined") return "dark";
      const currentTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as "light" | "dark";
      return currentTheme || "dark";
    }

    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      const currentTheme = getTheme();
      setTheme(currentTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Get theme-appropriate colors
  const getThemeColors = (currentTheme: "light" | "dark") => {
    if (currentTheme === "light") {
      return {
        primary: { h: 260, s: 0.6, v: 0.9 }, // Soft purple (#a084e8)
        secondary: { h: 280, s: 0.5, v: 0.8 }, // Light accent (#cdb4f6)
        background: { h: 270, s: 0.15, v: 0.96 }, // Light bg (#f6f4fa)
        intensity: 0.6,
      };
    } else {
      return {
        primary: { h: 220, s: 0.3, v: 0.2 }, // Dark primary (#333)
        secondary: { h: 245, s: 0.8, v: 0.7 }, // Accent blue (#6366f1)
        background: { h: 0, s: 0, v: 0.05 }, // Dark bg (#000)
        intensity: 0.8,
      };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uBackgroundColor;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      uniform float uThemeIntensity;
      
      #define OCTAVE_COUNT 8

      vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.3);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          
          // Create flowing lightning effect
          uv += 1.5 * fbm(uv * uSize + 0.6 * iTime * uSpeed) - 0.75;
          
          float dist = abs(uv.x);
          
          // Mix primary and secondary colors based on position and time
          float colorMix = sin(iTime * uSpeed * 0.5 + uv.y * 2.0) * 0.5 + 0.5;
          vec3 lightningColor = mix(uPrimaryColor, uSecondaryColor, colorMix);
          
          // Create the lightning effect with smooth falloff
          float lightningIntensity = pow(mix(0.01, 0.12, hash11(iTime * uSpeed * 0.8)) / (dist + 0.01), 0.8);
          
          vec3 col = lightningColor * lightningIntensity * uIntensity * uThemeIntensity;
          
          // Add subtle background glow
          vec3 backgroundGlow = uBackgroundColor * 0.1 * (1.0 - dist * 0.5);
          col += backgroundGlow;
          
          // Smooth gamma correction
          col = pow(col, vec3(0.9));
          
          // Blend with theme background
          float alpha = clamp(lightningIntensity * uThemeIntensity, 0.0, 1.0);
          
          fragColor = vec4(col, alpha);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (
      source: string,
      type: number
    ): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uPrimaryColorLocation = gl.getUniformLocation(
      program,
      "uPrimaryColor"
    );
    const uSecondaryColorLocation = gl.getUniformLocation(
      program,
      "uSecondaryColor"
    );
    const uBackgroundColorLocation = gl.getUniformLocation(
      program,
      "uBackgroundColor"
    );
    const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
    const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
    const uSizeLocation = gl.getUniformLocation(program, "uSize");
    const uThemeIntensityLocation = gl.getUniformLocation(
      program,
      "uThemeIntensity"
    );

    const startTime = performance.now();
    let animationId: number;

    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      const currentTime = performance.now();
      gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);

      // Get theme colors
      const colors = getThemeColors(theme);

      // Convert HSV to RGB for uniforms
      const primaryRGB = hsv2rgb(
        colors.primary.h / 360,
        colors.primary.s,
        colors.primary.v
      );
      const secondaryRGB = hsv2rgb(
        colors.secondary.h / 360,
        colors.secondary.s,
        colors.secondary.v
      );
      const backgroundRGB = hsv2rgb(
        colors.background.h / 360,
        colors.background.s,
        colors.background.v
      );

      gl.uniform3f(
        uPrimaryColorLocation,
        primaryRGB.r,
        primaryRGB.g,
        primaryRGB.b
      );
      gl.uniform3f(
        uSecondaryColorLocation,
        secondaryRGB.r,
        secondaryRGB.g,
        secondaryRGB.b
      );
      gl.uniform3f(
        uBackgroundColorLocation,
        backgroundRGB.r,
        backgroundRGB.g,
        backgroundRGB.b
      );

      gl.uniform1f(uXOffsetLocation, xOffset);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uSizeLocation, size);
      gl.uniform1f(uThemeIntensityLocation, colors.intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [theme, xOffset, speed, intensity, size]);

  // HSV to RGB conversion helper
  const hsv2rgb = (h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (h >= 0 && h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 1 / 6 && h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 2 / 6 && h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 3 / 6 && h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 4 / 6 && h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: r + m,
      g: g + m,
      b: b + m,
    };
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={{
        mixBlendMode: theme === "light" ? "multiply" : "screen",
        opacity: 0.7,
      }}
    />
  );
};

export default Lightning;
uniform float amplitude;
uniform vec3 color;
uniform sampler2D pointTexture;

varying vec3 vColor;

void main() {
  vec4 outColor = texture2D(pointTexture, gl_PointCoord);
  if (outColor.a < 0.5) discard;

  gl_FragColor = outColor * vec4(color * vColor, 1.0);

  float depth = gl_FragCoord.z / gl_FragCoord.w;

  float fogFactor = smoothstep(200.0, 600.0, depth);
  
  gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.0, 0.0, gl_FragColor.w), fogFactor);
}
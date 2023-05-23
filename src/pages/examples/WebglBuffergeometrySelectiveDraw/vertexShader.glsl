attribute vec3 vertColor;
attribute float visible;

varying vec3 vColor;
varying float vVisible;

void main() {
  vVisible = visible;
  vColor = vertColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
uniform float time;
uniform float delta;
uniform float testing;
uniform float separationDistance;
uniform float alignmentDistance;
uniform float cohesionDistance;
uniform float freedomFactor;
uniform vec3 predator;

const float width = resolution.x;
const float height = resolution.y;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

float zoneRadius = 40.0;
float zoneRadiusSquared = 1600.0;

float separationThresh = 0.45;
float alignmentThresh = 0.65;

const float UPPER_BOUNDS = BOUNDS;
const float LOWER_BOUNDS = -UPPER_BOUNDS;

const float SPEED_LIMIT = 9.0;

// 该函数使用输入坐标和固定向量（12.9898，78.233）的点积作为正弦函数的自变量。正弦函数的结果然后乘以一个大常数（43758.5453），结果的小数部分作为随机数返回。
float rand( vec2 co ){
  return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
}

void main() {
  zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
  separationThresh = separationDistance / zoneRadius;
  alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
  zoneRadiusSquared = zoneRadius * zoneRadius;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 birdPosition, birdVelocity;

  vec3 selfPosition = texture2D(texturePosition, uv).xyz;
  vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;

  float dist;
  vec3 dir; // direction
  float distSquared;
  
  float separationSquared = separationDistance * separationDistance;
  float cohesionSquared = cohesionDistance * cohesionDistance;

  float f;
  float percent;

  vec3 velocity = selfVelocity;

  float limit = SPEED_LIMIT;

  dir = predator * UPPER_BOUNDS - selfPosition;
  dir.z = 0.0;

  dist = length(dir);
  distSquared = dist * dist;

  float preyRadius = 150.0;
  float preyRadiusSq = preyRadius * preyRadius;

  // move birds away from predator
  if (dist < preyRadius) {
    f = (distSquared / preyRadiusSq - 1.0) * delta * 100.0;
    velocity += normalize(dir) * f;
    limit += 5.0;
  }

  // if (testing == 0.0) {}
  // if ( rand( uv + time ) < freedomFactor ) {}

  // Attract flocks to the center
  vec3 central = vec3(0.0, 0.0, 0.0);
  dir = selfPosition - central;
  dist = length( dir );

  dir.y *= 2.5;
  velocity -= normalize( dir ) * delta * 5.0;
}
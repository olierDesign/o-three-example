import * as THREE from "three";
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default function points() {
  // 粒子数量
  const particles = 100000;

  const WIDTH = 400;
  const HEIGHT= 400;

  // 相机
  const camera = new THREE.PerspectiveCamera(
    40,
    WIDTH / HEIGHT,
    1,
    1000
  );
  camera.position.z = 300;

  // 场景
  const scene = new THREE.Scene();

  const uniforms = {
    pointTexture: {
      value: new THREE.TextureLoader().load(
        `${process.env.PUBLIC_URL}/textures/sprites/ball.png`
      ),
    },
  };

  // 创建着色器材质
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  });

  // 点半径
  const radius = 200;

  // 创建几何体
  const geometry = new THREE.BufferGeometry();
  const positions = []; // 位置数组
  const colors = []; // 颜色数组
  const sizes = []; // 大小数组
  // 创建颜色(临时变量)
  const color = new THREE.Color();

  // 遍历出 100000 个点
  for (let i = 0; i < particles; i++) {
    // 位置(-200 ~ 200)
    positions.push((Math.random() * 2 - 1) * radius); // x
    positions.push((Math.random() * 2 - 1) * radius); // y
    positions.push((Math.random() * 2 - 1) * radius); // z

    // 颜色
    color.setHSL(i / particles, 1.0, 0.5);
    color.toArray(colors, i * 3);    

    // 尺寸
    sizes.push(20);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute(
    "size",
    new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage)
  );

  // mesh
  const mesh = new THREE.Points(geometry, shaderMaterial);
  scene.add(mesh);

  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
    depth: false,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(WIDTH, HEIGHT);

  const render = () => {
    // 获取时间
    const time = Date.now() * 0.005;
    // 旋转粒子模型
    mesh.rotation.z = 0.01 * time;
    // 获取所有粒子的尺寸数组
    const sizes = mesh.geometry.attributes.size.array;
    for (let i = 0; i < particles; i++) {
      sizes[i] = 10 * (1 + Math.sin(0.1 * i + time)); // 0 ~ 20
    }
    mesh.geometry.attributes.size.needsUpdate = true;
    renderer.render(scene, camera);
  };

  return {
    canvas: renderer.domElement,
    render,
  };
}

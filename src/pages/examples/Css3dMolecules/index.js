import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DSprite, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader';

const Css3dMolecules = () => {
  /* ---------- useRef ---------- */
  /** 相机 */
  const camera = useRef();
  /** 场景 */
  const scene = useRef();
  /** 渲染器 */
  const renderer = useRef();
  /** 三维物体 */
  const root = useRef();
  /** 轨迹球控制器 */
  const controls = useRef();

  /* ---------- variable ---------- */
  // CSS3DSprite 对象数组
  const objects = [];
  // 临时的三维向量
  const tmpVec1 = new THREE.Vector3();
  /** 展示类型 */
  const VIZ_TYPE = {
    'Atoms': 0,
    'Bonds': 1,
    'Atoms + Bonds': 2,
  };
  /** 分子类型 */
  const MOLECULES = {
    'Ethanol': 'ethanol.pdb',
    'Aspirin': 'aspirin.pdb',
    'Caffeine': 'caffeine.pdb',
    'Nicotine': 'nicotine.pdb',
    'LSD': 'lsd.pdb',
    'Cocaine': 'cocaine.pdb',
    'Cholesterol': 'cholesterol.pdb',
    'Lycopene': 'lycopene.pdb',
    'Glucose': 'glucose.pdb',
    'Aluminium oxide': 'Al2O3.pdb',
    'Cubane': 'cubane.pdb',
    'Copper': 'cu.pdb',
    'Fluorite': 'caf2.pdb',
    'Salt': 'nacl.pdb',
    'YBCO superconductor': 'ybco.pdb',
    'Buckyball': 'buckyball.pdb',
    // 'Diamond': 'diamond.pdb',
    'Graphite': 'graphite.pdb'
  };
  /** 参数 */
  const params = {
    vizType: 2,
    molecule: 'caffeine.pdb',
  };
  // 创建 PDB 加载器
  const loader = new PDBLoader();
  // 子原子颜色对象 { 子原子元素名: base64 图像信息 }
  const colorSpriteMap = {};
  /** 创建一个 img 元素 */
  const baseSprite = document.createElement('img');
  
  // 三维向量
  const offset = new THREE.Vector3();

  /* ---------- function ---------- */
  /**
   * 图片转换为画布
   * @param image 图片元素
  */
  const imageToCanvas = (image) => {
    // 获取图片的宽高
    const width = image.width;
    const height = image.height;

    // 创建画布
    const canvas = document.createElement('canvas');
    // 设置画布的宽高
    canvas.width = width;
    canvas.height = height;

    // 把图片绘制到画布
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    return canvas;
  };

  /** 
   * @param ctx canvas 上下文
   * @param width canvas 宽度
   * @param width height 高度
   * @param color THREE.Color
   */
  const colorify = (ctx, width, height, color) => {
    const r = color.r;        // 红
    const g = color.g;        // 绿
    const b = color.b;        // 蓝

    // 获取画布上指定矩形的像素数据
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i + 0] *= r;
      data[i + 1] *= g;
      data[i + 2] *= b;
    }

    // 把图像数据（从指定的 ImageData 对象）放回画布上
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 加载分子文件
   * @param model pdb文件路径
  */
  const loadMolecule = (model) => {
    // 获取当前分子的 pdb 文件路径
    const url = `${process.env.PUBLIC_URL}/models/pdb/${model}`;

    // 遍历 objects 数组，把每个对象从它的父级移除
    for(let i = 0; i < objects.length; i++) {
      const object = objects[i];
      object.parent.remove(object);
    }
    // 清空 objects 数组
    objects.length = 0;

    loader.load(url, (pdb) => {
      const geometryAtoms = pdb.geometryAtoms;        // 原子几何体
      const geometryBonds = pdb.geometryBonds;        // 连接线几何体
      const json = pdb.json;                          // 原子数组数据

      // 计算当前 geometryAtoms 的外边界矩形
      geometryAtoms.computeBoundingBox();
      /**
       * 返回 box 的中心点 Vector3 的向量取反
       * offset 更新成中心点取反坐标
       */
      geometryAtoms.boundingBox.getCenter(offset).negate();
      // 移动几何体
      geometryAtoms.translate(offset.x, offset.y, offset.z);
      geometryBonds.translate(offset.x, offset.y, offset.z);


      /**
       * 处理原子
       */
      // 获取原子几何体的位置和颜色
      const positionAtoms = geometryAtoms.getAttribute('position');
      const colorAtoms = geometryAtoms.getAttribute('color');

      // 创建初始变量，用于赋值每一个子原子的位置和颜色
      const position = new THREE.Vector3();
      const color = new THREE.Color();

      for (let i = 0; i < positionAtoms.count; i++) {
        // 赋值当前 i 的位置
        position.fromBufferAttribute(positionAtoms, i);
        // 赋值当前 i 的颜色
        color.fromBufferAttribute(colorAtoms, i);
        // 赋值当前 i 的子原子数组
        const atomJSON = json.atoms[i];
        // 获取当前子原子数组的元素名
        const element = atomJSON[4];

        /**
         * 如果 colorSpriteMap 中，当前子原子元素名没有内容
         * 把当前子原子的图像信息保存到 colorSpriteMap，{ 子原子元素名: base64 图像信息 }
         */
        if (!colorSpriteMap[element]) {
          // 创建一个画布，并把球 ball.png 绘制到画布中
          const canvas = imageToCanvas(baseSprite);
          const context = canvas.getContext('2d');

          // 改变画布中的球的颜色
          colorify(context, canvas.width, canvas.height, color);

          // 获取画布 base64 编码的 dataURL
          const dataUrl = canvas.toDataURL();

          // 把当前子原子保存到colorSpriteMap，{ 元素名: base64 图像信息 }
          colorSpriteMap[element] = dataUrl;
        }

        // 获取当前子原子元素名对应的 base64 数据
        const colorSprite = colorSpriteMap[element];

        // 创建一个图片，并把 base64 赋值给 src
        const atom = document.createElement('img');
        atom.src = colorSprite;

        // 创建 CSS3DSprite 对象
        const object = new CSS3DSprite(atom);
        // 将所传入的 position 的 x、y 和 z 属性复制给 CSS3DSprite 对象的 position
        object.position.copy(position);
        // 将该向量与所传入的标量 75 进行相乘
        object.position.multiplyScalar(75);
        // 设置 false 了之后，它将不再计算每一帧的位移、旋转（四元变换）和缩放矩阵，和不再重新计算 matrixWorld 属性
        object.matrixAutoUpdate = false;
        // 更新局部变换
        object.updateMatrix();

        // 把 CSS3DSprite 对象添加到三维对象 object 中
        root.current.add(object);

        // 把 CSS3DSprite 对象添加到 CSS3DSprite 对象数组 objects 中
        objects.push(object);
      }

      /**
       * 处理连接线
       */
      // 获取连接线几何体的位置集合
      const positionBonds = geometryBonds.getAttribute('position');

      // 初始化变量，开始点 & 结束点
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();
      debugger

      for (let i = 0; i < positionBonds.count; i += 2) {
        // 赋值当前 i 的开始位置和结束位置
        start.fromBufferAttribute(positionBonds, i);
        end.fromBufferAttribute(positionBonds, i + 1);

        // 将开始位置和结束位置与标量 75 进行相乘。
        start.multiplyScalar(75);
        end.multiplyScalar(75);

        // 将临时向量 tmpVec1 设置为 end - start，生成一个新向量 start -> end
        tmpVec1.subVectors(end, start);
        // 计算从 (0, 0, 0) 到 tmpVec1.x, tmpVec1.y, tmpVec1.z) 的直线长度
        // todo: 50怎么来的
        const bondLength = tmpVec1.length() - 50;
      }
    });
  };

  /** 初始化 */
  const init = () => {
    // 创建一个透视相机
    camera.current = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
    camera.current.position.z = 1000;

    // 创建一个场景
    scene.current = new THREE.Scene();

    // 创建一个三维物体
    root.current = new THREE.Object3D();
    // 把三维物体添加到场景中
    scene.current.add(root.current);

    // 创建一个渲染器
    renderer.current = new CSS3DRenderer();
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.current.domElement);

    // 创建一个轨迹球控制器
    controls.current = new TrackballControls(camera.current, renderer.current.domElement);
    controls.current.rotateSpeed = 0.5;

    baseSprite.onload = () => {
      // 加载当前选中的分子 pdb 文件
      loadMolecule(params.molecule);
    }
    baseSprite.src = `${process.env.PUBLIC_URL}/textures/sprites/ball.png`
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div id="container"></div>
  )
};

export default Css3dMolecules;

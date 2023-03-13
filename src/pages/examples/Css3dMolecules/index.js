import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DSprite, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import './css/Css3dMolecules.scss';

const Css3dMolecules = () => {
  /* ---------- useRef ---------- */
  // dom 容器
  const containerDom = useRef(null);
  // 相机
  const camera = useRef(null);
  // 场景
  const scene = useRef(null);
  // 根三维物体
  const root = useRef(null);
  // 渲染器
  const renderer = useRef(null);
  // 轨迹球控制器
  const controls = useRef(null);

  /* ---------- variable ---------- */
  // 球图片
  const baseSprite = document.createElement('img');
  // 分子的参数
  const params = {
    vizType: 2,
    molecule: 'caffeine.pdb'
  };
  // 对象数组
  const objects = [];
  // pdb 加载器
  const loader = new PDBLoader();
  // 一个初始三维向量
  const offset = new THREE.Vector3();
  // “元素名称”颜色球 dataUrl 对象
  const colorSpriteMap = {};

  // 连接线临时存储变量
  const tmpVec1 = new THREE.Vector3();
  const tmpVec2 = new THREE.Vector3();
  const tmpVec3 = new THREE.Vector3();
  const tmpVec4 = new THREE.Vector3();

  // 显示类型
  const VIZ_TYPE = {
    'Atoms': 0,
    'Bonds': 1,
    'Atoms + Bonds': 2
  };

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
  
  /* ---------- function ---------- */
  /**
   * 用传进来的 img 创建 canvas
   */
  const imageToCanvas = (image) => {
    // 获取图片的宽高
    const width = image.width;
    const height = image.height;

    // 创建 canvas
    const canvas = document.createElement('canvas');

    // 设置 canvas 的宽高
    canvas.width = width;
    canvas.height = height;

    // canvas 上下文
    const context = canvas.getContext('2d');

    // image 绘制到 canvas
    context.drawImage(image, 0, 0, width, height);

    return canvas;
  };

  /**
   * canvas 上色
   * ctx：canvas 上下文
   * width：canvas 宽
   * height：canvas 高
   * color：THREE.Color
   */
  const colorify = (ctx, width, height, color) => {
    // 获取红、绿、蓝色值
    const { r, g, b } = color;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for(let i = 0; i < data.length; i+=4) {
      data[i + 0] *= r;
      data[i + 1] *= g;
      data[i + 2] *= b;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  /** 显示原子 */
  const showAtoms = () => {
    // 遍历 objects
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];

      // 如果当前对象是 CSS3DSprite 的实例，则显示
      if (object instanceof CSS3DSprite) {
        object.element.style.display = '';
        object.visible = true;
      } else {
        object.element.style.display = 'none';
        object.visible = false;
      }
    }
  };

  /** 显示连接线 */
  const showBonds = () => {
    // 遍历 objects
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];

      // 如果当前对象是 CSS3DSprite 的实例，则隐藏
      if (object instanceof CSS3DSprite) {
        object.element.style.display = 'none';
        object.visible = false;
      } else {
        object.element.style.display = '';
        object.visible = true;
      }
    }
  };

  /** 显示原子+连接线 */
  const showAtomsBonds = () => {
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];

      object.element.style.display = '';
      object.visible = true;

      // 如果当前对象不是原子
      if (!(object instanceof CSS3DSprite)) {
        object.element.style.height = object.userData.bondLengthShort;
      }
    }
  };

  /**
   * 切换展示类型
   * 0：显示原子
   * 1：显示连接线
   * 3：显示原子+连接线
   */
  const changeVizType = (value) => {
    switch (value) {
      case 0:
        showAtoms();
        break;
      case 1:
        showBonds();
        break;
      default:
        showAtomsBonds()
    }
  };

  /**
   * 加载分子函数
   * model: 分子文件名
   */
  const loadMolecule = (model) => {
    // 文件路径
    const url = `${process.env.PUBLIC_URL}/models/pdb/${model}`;

    // 遍历 objects 对象数组，把每个对象从它的 parent 中去掉
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      object.parent.remove(object);
    }
    // 重置 objects 数组
    objects.length = 0;

    loader.load(url, (pdb) => {
      /**
       * geometryAtoms: 几何原子（BufferGeometry）
       * geometryBonds: 几何纽带（BufferGeometry）
       * json: atoms[]
       */
      const { geometryAtoms, geometryBonds, json } = pdb;

      // 当前 geometryAtoms 的外边界矩形
      geometryAtoms.computeBoundingBox();
      /**
       * getCenter 指定了 offset ，结果将会被拷贝到 offset
       * negate: 向量取反，即： x = -x, y = -y , z = -z
       * offset: 原子几何体边界矩形中心点的取反向量
       */
      geometryAtoms.boundingBox.getCenter(offset).negate();

      // 几何体和纽带“位移”动到“取反的中心点”
      geometryAtoms.translate(offset.x, offset.y, offset.z);
      geometryBonds.translate(offset.x, offset.y, offset.z);

      /* ----- geometryAtoms start ----- */
      // 获取原子几何体的 position 属性和 color 属性
      const positionAtoms = geometryAtoms.getAttribute('position');
      const colorAtoms = geometryAtoms.getAttribute('color');

      // 定义初始 position 变量和 color 变量
      const position = new THREE.Vector3();
      const color = new THREE.Color();

      for (let i = 0; i < positionAtoms.count; i++) {
        // 把每个 position 和 color 赋值给初始变量
        position.fromBufferAttribute(positionAtoms, i);
        color.fromBufferAttribute(colorAtoms, i);

        // 获取当前位置的原子数据
        const atomJSON = json.atoms[i];

        // 获取当前位置在原子数据中的“元素名称”
        const element = atomJSON[4];

        /**
         * 如果，颜色对象中没有该“元素名称”的数据
         * 绘制一个初始球图形的 canvas
         * 把 color 颜色更新球图形的 canvas
         */
        if(!colorSpriteMap[element]) {
          // 创建绘制球图片的 canvas
          const canvas = imageToCanvas(baseSprite);
          // canvas 上下文
          const context = canvas.getContext('2d');

          // 根据 color 改变 canvas 中球的颜色
          colorify(context, canvas.width, canvas.height, color);

          // 获取 canvas 的数据链接
          const dataUrl = canvas.toDataURL();

          // 保存“元素名称”颜色球的 dataUrl 到颜色对象中
          colorSpriteMap[element] = dataUrl;
        }

        // 从“元素名称”颜色球对象中，获取“当前元素”的 dataUrl
        const colorSprite = colorSpriteMap[element];

        // 创建 img Dom 元素
        const atom = document.createElement('img');
        // 把 dataUrl 赋值给 img.src
        atom.src = colorSprite;

        // 创建 CSS3DSprite 对象
        const object = new CSS3DSprite(atom);
        // 拷贝 position 
        object.position.copy(position);
        // position 与 75 进行相乘
        object.position.multiplyScalar(75);

        // 禁用这个属性之后，它将不再计算每一帧的位移、旋转（四元变换）和缩放矩阵，并且不会重新计算 matrixWorld 属性
        object.matrixAutoUpdate = false;
        // 更新局部变换
        object.updateMatrix();

        // 把 CSS3DSprite（原子球img）对象添加到根对象中
        root.current.add(object);

        // 把 CSS3DSprite（原子球img）对象添加到 objects 对象数组中
        objects.push(object);
      }
      /* ----- geometryAtoms end ----- */

      /* ----- geometryBonds start ----- */
      // 获取纽带几何体的 position 属性
      const positionBonds = geometryBonds.getAttribute('position');

      // 定义“起始点”变量和“终点”变量
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();

      for (let i = 0; i < positionBonds.count; i+=2) {
        // 把相近的两个连接线，赋值给 start 和 end 变量
        start.fromBufferAttribute(positionBonds, i);
        end.fromBufferAttribute (positionBonds, i+1);

        // 将 start 和 end 变量与所传入的标量 75 进行相乘。
        start.multiplyScalar(75);
        end.multiplyScalar(75);

        // tmpVec1 向量设置为 end - start
        tmpVec1.subVectors(end, start);
        /**
         * 获取终点和起点的距离
         * todo：减 50？
         */
        const bondLength = tmpVec1.length() - 50;

        /**
         * 创建一个连接线 div Dom 元素
         * 添加类名：bond
         * 添加样式：高度为 bondLength
         */
        let bond = document.createElement('div');
        bond.className = 'bond';
        bond.style.height = `${bondLength}px`;

        // 用连接线 div 创建一个 CSS3DObject 对象
        let object = new CSS3DObject(bond);

        // 拷贝 start 起始位置 
        object.position.copy(start);
        /**
         * 朝着 end 进行插值 0.5
         * todo：0.5？
         */
        object.position.lerp(end, 0.5);

        /**
         * CSS3DObject 对象的长度备份到 userData
         * todo：55？
         */
        object.userData.bondLengthShort = `${bondLength}px`;
        object.userData.bondLengthFull = `${bondLength + 55}px`;

        /**
         * 轴
         * 将 tmpVec2 设置为它与 tmpVec1 的叉积
         * 几何意义：以 tmpVec2 和 tmpVec1 为边的平行四边形的面积
         */
        const axis = tmpVec2.set(0, 1, 0).cross(tmpVec1);
        /**
         * 弧度
         * 计算 tmpVec3 和 tmpVec1 转换为单位向量的点积
         * 几何意义：衡量着两个向量的角度关系
         */
        const radians = Math.acos(tmpVec3.set( 0, 1, 0 ).dot(tmpVec4.copy(tmpVec1).normalize()));

        /**
         * 四维矩阵
         * makeRotationAxis: 旋转轴，需要被归一化 | 旋转量（弧度）
         */
        const objMatrix = new THREE.Matrix4().makeRotationAxis(axis.normalize(), radians);

        // 设置 CSS3DObject 对象的局部变换矩阵
        object.matrix.copy(objMatrix);

        // 从 object.matrix 的旋转分量中来设置 CSS3DObject 对象的四元数
        object.quaternion.setFromRotationMatrix(object.matrix);

        // 禁用这个属性之后，它将不再计算每一帧的位移、旋转（四元变换）和缩放矩阵，并且不会重新计算 matrixWorld 属性
        object.matrixAutoUpdate = false;
        // 更新局部变换
        object.updateMatrix();

        // 把 CSS3DObject（连接线div）对象添加到根对象中
        root.current.add(object);

        // 把 CSS3DObject（连接线div）对象添加到 objects 对象数组中
        objects.push(object);

        /* ---------- */

        /**
         * 创建一个连接线 div Dom 元素
         * 添加类名：bond
         * 添加样式：高度为 bondLength
         */
        bond = document.createElement('div');
        bond.className = 'bond';
        bond.style.height = bondLength + 'px';

        // 用连接线 div 创建一个 Object3D 对象
        const joint = new THREE.Object3D(bond);
        // 拷贝 start 起始位置 
        joint.position.copy(start);
        // 朝着 end 进行插值 0.5
        joint.position.lerp(end, 0.5);

        // 设置 Object3D 对象的局部变换矩阵
        joint.matrix.copy(objMatrix);
        // 从 joint.matrix 的旋转分量中来设置 Object3D 对象的四元数
        joint.quaternion.setFromRotationMatrix(joint.matrix);

        // 禁用这个属性之后，它将不再计算每一帧的位移、旋转（四元变换）和缩放矩阵，并且不会重新计算 matrixWorld 属性
        joint.matrixAutoUpdate = false;
        // 更新局部变换
        joint.updateMatrix();

        // 用连接线 div 创建一个 CSS3DObject 对象
        object = new CSS3DObject(bond);
        // object 的局部旋转，y 轴设置为 Math.PI / 2
        object.rotation.y = Math.PI / 2;

        // 禁用这个属性之后，它将不再计算每一帧的位移、旋转（四元变换）和缩放矩阵，并且不会重新计算 matrixWorld 属性
        object.matrixAutoUpdate = false;
         // 更新局部变换
        object.updateMatrix();

        /**
         * CSS3DObject 对象的长度和 object3D 对象备份到 userData
         */
        object.userData.bondLengthShort = bondLength + 'px';
        object.userData.bondLengthFull = ( bondLength + 55 ) + 'px';
        object.userData.joint = joint;

        // 把 CSS3DObject 对象添加到 Object3D 对象中
        joint.add(object);
        // 把 Object3D 对象添加到根对象中
        root.current.add(joint);

        // 把 CSS3DObject（连接线div）对象添加到 objects 对象数组中
        objects.push(object);
      }
      /* ----- geometryBonds end ----- */

      changeVizType( params.vizType );
    });
  };
  

  /** 初始化 */
  const init = () => {
    // 创建一个透视相机
    camera.current = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
    // 相机z坐标轴
    camera.current.position.z = 1000;

    // 创建一个场景
    scene.current = new THREE.Scene();

    // 创建一个元素，存放所有的原子和纽带
    root.current = new THREE.Object3D();
    // 场景中加入根元素
    scene.current.add(root.current);
    
    // CSS 3D 渲染器
    renderer.current = new CSS3DRenderer();
    // 设置 3D 渲染器的尺寸
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // 把 3D 渲染器的 dom 元素添加到容器 dom 中
    containerDom.current.appendChild(renderer.current.domElement);

    // 创建一个轨迹球控制器
    controls.current = new TrackballControls(camera.current, renderer.current.domElement);
    // 轨迹球控制器旋转速度
    controls.current.rotateSpeed = 0.5;

    // 球图片赋值加载完毕
    baseSprite.onload = () => {
      // 加载分子
      loadMolecule(params.molecule);
    };
    // 球图片赋值
    baseSprite.src=`${process.env.PUBLIC_URL}/textures/sprites/ball.png`;

    const gui = new GUI();

    gui.add( params, 'vizType', VIZ_TYPE ).onChange( changeVizType );
    gui.add( params, 'molecule', MOLECULES ).onChange( loadMolecule );
    gui.open();
  };

  /** 渲染 */
  const render = () => {
    renderer.current.render(scene.current, camera.current);
  };

  /** 执行动画 */
  const animate = () => {
    requestAnimationFrame(animate);

    controls.current.update();

    const time = Date.now() * 0.0004;

    root.current.rotation.x = time;
    root.current.rotation.y = time * 0.7;

    render();
  };

  /** 尺寸变化 */
  const onWindowResize = () => {
    if (!camera.current) return;

    camera.current.aspect = window.innerWidth / window.innerHeight;
    camera.current.updateProjectionMatrix();

    renderer.current.setSize( window.innerWidth, window.innerHeight );
  };

  useEffect(() => {
    init();
    animate();
    window.addEventListener('resize', onWindowResize);

    return () => {
      containerDom.current.removeChild(renderer.current.domElement);
      window.removeEventListener('resize', onWindowResize);
    }
  }, []);

  return (
    <div id="container" className="css-3d-molecules" ref={containerDom}></div>
  )
};

export default Css3dMolecules;

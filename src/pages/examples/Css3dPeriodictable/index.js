import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import TWEEN from '@tweenjs/tween.js';

import './css/Css3dPeriodictable.scss'

const Css3dPeriodictable = () => {
  /* ---------- variable ---------- */
  // 周期表数据
  const table = [
    'H', 'Hydrogen', '1.00794', 1, 1,
    'He', 'Helium', '4.002602', 18, 1,
    'Li', 'Lithium', '6.941', 1, 2,
    'Be', 'Beryllium', '9.012182', 2, 2,
    'B', 'Boron', '10.811', 13, 2,
    'C', 'Carbon', '12.0107', 14, 2,
    'N', 'Nitrogen', '14.0067', 15, 2,
    'O', 'Oxygen', '15.9994', 16, 2,
    'F', 'Fluorine', '18.9984032', 17, 2,
    'Ne', 'Neon', '20.1797', 18, 2,
    'Na', 'Sodium', '22.98976...', 1, 3,
    'Mg', 'Magnesium', '24.305', 2, 3,
    'Al', 'Aluminium', '26.9815386', 13, 3,
    'Si', 'Silicon', '28.0855', 14, 3,
    'P', 'Phosphorus', '30.973762', 15, 3,
    'S', 'Sulfur', '32.065', 16, 3,
    'Cl', 'Chlorine', '35.453', 17, 3,
    'Ar', 'Argon', '39.948', 18, 3,
    'K', 'Potassium', '39.948', 1, 4,
    'Ca', 'Calcium', '40.078', 2, 4,
    'Sc', 'Scandium', '44.955912', 3, 4,
    'Ti', 'Titanium', '47.867', 4, 4,
    'V', 'Vanadium', '50.9415', 5, 4,
    'Cr', 'Chromium', '51.9961', 6, 4,
    'Mn', 'Manganese', '54.938045', 7, 4,
    'Fe', 'Iron', '55.845', 8, 4,
    'Co', 'Cobalt', '58.933195', 9, 4,
    'Ni', 'Nickel', '58.6934', 10, 4,
    'Cu', 'Copper', '63.546', 11, 4,
    'Zn', 'Zinc', '65.38', 12, 4,
    'Ga', 'Gallium', '69.723', 13, 4,
    'Ge', 'Germanium', '72.63', 14, 4,
    'As', 'Arsenic', '74.9216', 15, 4,
    'Se', 'Selenium', '78.96', 16, 4,
    'Br', 'Bromine', '79.904', 17, 4,
    'Kr', 'Krypton', '83.798', 18, 4,
    'Rb', 'Rubidium', '85.4678', 1, 5,
    'Sr', 'Strontium', '87.62', 2, 5,
    'Y', 'Yttrium', '88.90585', 3, 5,
    'Zr', 'Zirconium', '91.224', 4, 5,
    'Nb', 'Niobium', '92.90628', 5, 5,
    'Mo', 'Molybdenum', '95.96', 6, 5,
    'Tc', 'Technetium', '(98)', 7, 5,
    'Ru', 'Ruthenium', '101.07', 8, 5,
    'Rh', 'Rhodium', '102.9055', 9, 5,
    'Pd', 'Palladium', '106.42', 10, 5,
    'Ag', 'Silver', '107.8682', 11, 5,
    'Cd', 'Cadmium', '112.411', 12, 5,
    'In', 'Indium', '114.818', 13, 5,
    'Sn', 'Tin', '118.71', 14, 5,
    'Sb', 'Antimony', '121.76', 15, 5,
    'Te', 'Tellurium', '127.6', 16, 5,
    'I', 'Iodine', '126.90447', 17, 5,
    'Xe', 'Xenon', '131.293', 18, 5,
    'Cs', 'Caesium', '132.9054', 1, 6,
    'Ba', 'Barium', '132.9054', 2, 6,
    'La', 'Lanthanum', '138.90547', 4, 9,
    'Ce', 'Cerium', '140.116', 5, 9,
    'Pr', 'Praseodymium', '140.90765', 6, 9,
    'Nd', 'Neodymium', '144.242', 7, 9,
    'Pm', 'Promethium', '(145)', 8, 9,
    'Sm', 'Samarium', '150.36', 9, 9,
    'Eu', 'Europium', '151.964', 10, 9,
    'Gd', 'Gadolinium', '157.25', 11, 9,
    'Tb', 'Terbium', '158.92535', 12, 9,
    'Dy', 'Dysprosium', '162.5', 13, 9,
    'Ho', 'Holmium', '164.93032', 14, 9,
    'Er', 'Erbium', '167.259', 15, 9,
    'Tm', 'Thulium', '168.93421', 16, 9,
    'Yb', 'Ytterbium', '173.054', 17, 9,
    'Lu', 'Lutetium', '174.9668', 18, 9,
    'Hf', 'Hafnium', '178.49', 4, 6,
    'Ta', 'Tantalum', '180.94788', 5, 6,
    'W', 'Tungsten', '183.84', 6, 6,
    'Re', 'Rhenium', '186.207', 7, 6,
    'Os', 'Osmium', '190.23', 8, 6,
    'Ir', 'Iridium', '192.217', 9, 6,
    'Pt', 'Platinum', '195.084', 10, 6,
    'Au', 'Gold', '196.966569', 11, 6,
    'Hg', 'Mercury', '200.59', 12, 6,
    'Tl', 'Thallium', '204.3833', 13, 6,
    'Pb', 'Lead', '207.2', 14, 6,
    'Bi', 'Bismuth', '208.9804', 15, 6,
    'Po', 'Polonium', '(209)', 16, 6,
    'At', 'Astatine', '(210)', 17, 6,
    'Rn', 'Radon', '(222)', 18, 6,
    'Fr', 'Francium', '(223)', 1, 7,
    'Ra', 'Radium', '(226)', 2, 7,
    'Ac', 'Actinium', '(227)', 4, 10,
    'Th', 'Thorium', '232.03806', 5, 10,
    'Pa', 'Protactinium', '231.0588', 6, 10,
    'U', 'Uranium', '238.02891', 7, 10,
    'Np', 'Neptunium', '(237)', 8, 10,
    'Pu', 'Plutonium', '(244)', 9, 10,
    'Am', 'Americium', '(243)', 10, 10,
    'Cm', 'Curium', '(247)', 11, 10,
    'Bk', 'Berkelium', '(247)', 12, 10,
    'Cf', 'Californium', '(251)', 13, 10,
    'Es', 'Einstenium', '(252)', 14, 10,
    'Fm', 'Fermium', '(257)', 15, 10,
    'Md', 'Mendelevium', '(258)', 16, 10,
    'No', 'Nobelium', '(259)', 17, 10,
    'Lr', 'Lawrencium', '(262)', 18, 10,
    'Rf', 'Rutherfordium', '(267)', 4, 7,
    'Db', 'Dubnium', '(268)', 5, 7,
    'Sg', 'Seaborgium', '(271)', 6, 7,
    'Bh', 'Bohrium', '(272)', 7, 7,
    'Hs', 'Hassium', '(270)', 8, 7,
    'Mt', 'Meitnerium', '(276)', 9, 7,
    'Ds', 'Darmstadium', '(281)', 10, 7,
    'Rg', 'Roentgenium', '(280)', 11, 7,
    'Cn', 'Copernicium', '(285)', 12, 7,
    'Nh', 'Nihonium', '(286)', 13, 7,
    'Fl', 'Flerovium', '(289)', 14, 7,
    'Mc', 'Moscovium', '(290)', 15, 7,
    'Lv', 'Livermorium', '(293)', 16, 7,
    'Ts', 'Tennessine', '(294)', 17, 7,
    'Og', 'Oganesson', '(294)', 18, 7
  ];
  // CSS3DObject 对象数组
  const objects = [];
  // 各个类型下的周期元素数据（Object3D 保存坐标）
  const targets = { table: [], sphere: [], helix: [], grid: [] };

  /* ---------- useRef ---------- */
  // 相机
  const camera = useRef();
  // 场景
  const scene = useRef();
  // CSS3D 渲染器
  const renderer = useRef();
  // 控制器
  const controls = useRef();

  /* ---------- function ---------- */
  /** 渲染函数 */
  const render = () => {
    renderer.current.render(scene.current, camera.current);
  };

  /** 转换类型的补间动画 */
  const transform = (targets, duration) => {
    // 移除所有动画
    TWEEN.removeAll();

    // 遍历 CSS3DObject 对象数组
    for (let i = 0; i < objects.length; i++) {
      // 获取当前 CSS3DObject 对象
      const object = objects[i];
      // 获取 target 类型下，当前 CSS3DObject 对象对应的坐标信息
      const target = targets[i];

      // 创建 CSS3DObject 对象位置的补间动画
      new TWEEN.Tween(object.position)
        .to({x: target.position.x, y: target.position.y, z: target.position.z}, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()

      // 创建 CSS3DObject 对象旋转的补间动画
      new TWEEN.Tween(object.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }

    /**
     * 创建动画本身的补间动画，设置更新的回调函数
     * onUpdate 更新值的变化
     */
    new TWEEN.Tween()
      .to({}, duration * 2)
      .onUpdate(render)
      .start();
  };

  /** 初始化函数 */
  const init = () => {
    // 创建透视相机
    camera.current = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    // 设置相机 z 轴坐标
    camera.current.position.z = 3000;

    // 创建场景
    scene.current = new THREE.Scene();

    // 创建一个三维向量
    const vector = new THREE.Vector3();

    /**
     * 类型：表
     * 数组中，5个数据为一组周期元素信息
     */
    for (let i = 0; i < table.length; i += 5) {
      // 创建周期元素 div 容器
      const element = document.createElement('div');
      // 设置“容器”类名
      element.className = 'element';
      // 设置“容器”背景色，透明度在 0.25-0.75 之间
      element.style.backgroundColor = `rgba(0, 127, 127, ${Math.random() * 0.5 + 0.25})`

      // 创建周期元素 div 序号
      const number = document.createElement('div');
      // 设置“序号”类名
      number.className = 'number';
      // 设置“序号”内容
      number.textContent = i / 5 + 1;
      // 把“序号”添加到“容器”中
      element.appendChild(number);

      // 创建周期元素 div 名称
      const symbol = document.createElement('div');
      // 设置“名称”类名
      symbol.className = 'symbol';
      // 设置“名称”内容（eg. i -> 'H'）
      symbol.textContent = table[i];
      // 把“名称”添加到容器中
      element.appendChild(symbol);

      // 创建周期元素 div 明细
      const details = document.createElement('div');
      // 设置"明细"类名
      details.className = 'details';
      // 设置"明细"内容（eg. i+1 -> 'Hydrogen', i+2 -> '1.00794'）
      details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
      // 把"明细"添加到容器中
      element.appendChild(details);

      // 用 element 创建 CSS3DObject
      const objectCSS = new CSS3DObject(element);
      // 设置 CSS3DObject 的坐标，坐标范围在 -2000 ～ 2000
      objectCSS.position.x = Math.random() * 4000 - 2000;
      objectCSS.position.y = Math.random() * 4000 - 2000;
      objectCSS.position.z = Math.random() * 4000 - 2000;
      scene.current.add(objectCSS);

      // 把初始的 CSS3DObject 对象添加到 objects 数组中
      objects.push(objectCSS);

      /**
       * 表类型下，周期元素的坐标数据
       * 用一个空的 3d 对象记录坐标
       * todo: x 和 y 的坐标转换计算，其实可以直接把结果存放在 i+3，i+4 中
       */
      const object = new THREE.Object3D();
      object.position.x = table[i + 3] * 140 - 1330;
      object.position.y = - table[i + 4] * 180 + 990;

      // 保存表类型的各个元素坐标
      targets.table.push(object);
    }

    /**
     * 类型：球
     */
    // 遍历 CSS3DObject 对象数组
    for (let i = 0, l = objects.length; i < l; i++) {
      /**
       * 与 y 轴的极角（以弧度为单位）
       * todo: 极角的计算方式
       * const phi = Math.acos( - 1 + ( 2 * i ) / l );
       */
      const phi = Math.acos(-1 + (4 * i) / l);
      /**
       * 绕 y 轴的赤道角(方位角)（以弧度为单位）
       * todo: 赤道角的计算方式
       * const theta = Math.sqrt( l * Math.PI ) * phi;
       */
      const theta = Math.sqrt(l * Math.PI / 2) * phi;

      /**
       * 球类型下，周期元素的坐标数据
       * 用一个空的 3d 对象记录坐标
       */
      const object = new THREE.Object3D();
      // 从球坐标中的 radius、phi 和 theta 设置位置
      object.position.setFromSphericalCoords(800, phi, theta);

      // 三维向量拷贝 object.position，与标量 2 进行相乘
      vector.copy(object.position).multiplyScalar(2);
      /**
       * 旋转 object 使其在世界空间中面朝 vector
       * todo: 验证
       */
      object.lookAt(vector);

      // 保存球类型的各个元素坐标
      targets.sphere.push(object);
    }

    /**
     * 类型：螺旋
     */
    // 遍历 CSS3DObject 对象数组
    for(let i = 0, l = objects.length; i < l; i++) {
      // 在 x-z 平面内的逆时针角度，以z轴正方向的计算弧度。默认值为0
      const theta = i * 0.175 + Math.PI;
      // x-z平面以上的高度 默认值为 0
      const y = - ( i * 8 ) + 450;

      /**
       * 螺旋类型下，周期元素的坐标数据
       * 用一个空的 3d 对象记录坐标
       */
      const object = new THREE.Object3D();
      // 从圆柱坐标中的radius、theta 和 y 设置位置
      object.position.setFromCylindricalCoords(900, theta, y);
      
      // 三维向量拷贝 object.position，xy 轴与标量 2 进行相乘
      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      /**
       * 旋转 object 使其在世界空间中面朝 vector
       * todo: 验证
       */
      object.lookAt(vector);

      // 保存螺旋类型的各个元素坐标
      targets.helix.push(object);
    }

    /**
     * 类型：栅格
     */
    // 遍历 CSS3DObject 对象数组
    for (let i = 0, l = objects.length; i < l; i++) {
      /**
       * 栅格类型下，周期元素的坐标数据
       * 用一个空的 3d 对象记录坐标
       */
      const object = new THREE.Object3D();

      /**
       * 设置 object 的位置
       * x: 相邻的 5 项 (5列)
       * y: 5 项一组，相邻的5组（5行）
       * z: 25 项一组
       */
      object.position.x = ((i % 5) * 400) - 800;
      object.position.y = -( Math.floor(i / 5) % 5) * 400 + 800;
      object.position.z = (Math.floor( i / 25 )) * 1000 - 2000;

      // 保存栅格类型的各个元素坐标
      targets.grid.push(object);
    }

    // 创建一个 CSS3DRenderer
    renderer.current = new CSS3DRenderer();
    // 设置渲染器尺寸
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // 把渲染器的 dom 元素添加到 container 容器中
    document.getElementById('container').appendChild(renderer.current.domElement);

    // 创建一个控制器
    controls.current = new TrackballControls(camera.current, renderer.current.domElement);
    // 设置将相机向内移动 500，其默认值为0
    controls.current.minDistance = 500;
    // 设置将相机向外移动 6000，其默认值为Infinity
    controls.current.maxDistance = 6000;
    // 控制器监听改变事件
    controls.current.addEventListener('change', render);

    // 转换为周期表
    transform(targets.table, 2000);
  };

  /** 动画 */
  const animate = () => {
    // 循环动画
    requestAnimationFrame(animate);
    // 更新补间动画
    TWEEN.update();
    // 更新控制器
    controls.current.update();
  };

  /** 屏幕尺寸变化 */
  const onWindowResize = () => {
    camera.current.aspect = window.innerWidth / window.innerHeight;
    camera.current.updateProjectionMatrix();
    renderer.current.setSize( window.innerWidth, window.innerHeight );
    render();
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    init();
    animate();
    window.addEventListener( 'resize', onWindowResize );

    return () => {
      renderer.current?.domElement && document.getElementById('container').removeChild(renderer.current.domElement);
      window.removeEventListener( 'resize', onWindowResize );
    }
  }, []);

  return (
    <div className="css-3d-periodictable">
      <div id="container"></div>
      <div id="menu">
        {/* 按钮：转换为周期表 */}
        <button id="table" onClick={() => {
          transform( targets.table, 2000 );
        }}>TABLE</button>

        {/* 按钮：转换为球 */}
        <button id="sphere" onClick={() => {
          transform( targets.sphere, 2000 );
        }}>SPHERE</button>

        {/* 按钮：转换为螺旋 */}
        <button id="helix" onClick={() => {
          transform( targets.helix, 2000 );
        }}>HELIX</button>

        {/* 按钮：转换为栅格 */}
        <button id="grid" onClick={() => {
          transform( targets.grid, 2000 );
        }}>GRID</button>
      </div>
    </div>
  );
};

export default Css3dPeriodictable;

/**
 * 小结：CSS3DObject 位置和旋转角度的动画例子
 * 
 * 1.1、根据周期表数据的数组，创建单个 CSS3DObject 对象承载数据卡片 div
 * 1.2、CSS3DObject 对象随机初始化 pisition 位置 (坐标范围在 -2000 ～ 2000)
 * 1.3、存储所有 CSS3DObject 对象到 objects 数组中
 * 
 * 2.1、targets 数组存储各个类型（表｜球｜螺旋｜栅格）下，单个 CSS3DObject 对象的属性（position｜rotation）数据
 * 2.2、通过创建 Object3D 存储性（position｜rotation）数据
 * 
 * 3.1、使用 TWEEN 动画引擎
 * 3.2、使用 onUpdate 实时执行 render 渲染，更新动画
 * 
 * 4.1、轨迹球控制器（TrackballControls）可以单独监听 change 事件执行 render 渲染
 */

/**
 * 知识点：
 * 1、球和螺旋类型，通过 lookAt 一个 vector3（position 乘以标量），改变 rotation
 * 2、vector3 -> setFromCylindricalCoords，从圆柱坐标中的 radius、theta 和 y 设置该向量（难点）
 * 3、vector3 -> setFromSphericalCoords，从球坐标中的 radius、phi 和 theta 设置该向量（难点）
 */
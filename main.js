import './style.css'
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' 

let camera, scene, renderer;
let controls, water, sun, tempo= 1, upsun;
let clock = new THREE.Clock();
clock.start();

const loader = new GLTFLoader();

//navio
class airShip{
  constructor(){

    loader.load("assets/airShip/scene.gltf", (gltf) => {
    
      scene.add( gltf.scene );
      gltf.scene.scale.set(10, 10, 10)
      gltf.scene.position.set(130, 185, 180);
      this.airship = gltf.scene;
      this.speed = {
        vel: 0,
        rotacao: 0,
      }
    })
  }
    stop(){
      this.speed.vel = 0
     this.speed.rotacao = 0
    }

    update(){
    if(this.airship){
      // this.airship.position.z += this.speed.vel;
      this.airship.rotation.y += this.speed.rotacao;
      this.airship.translateX(this.speed.vel);
      this.airship.translateY(0.06 * Math.sin(clock.getElapsedTime()))
      
      camera.lookAt(this.airship.position);




      // this.airship.position.x += .5;

      // this.airship.rotation.y += this.speed.rotacao;
    

    }
  }
}
const airship = new airShip();


loader.load("assets/FloatingIsland/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  
  gltf.scene.scale.set(40, 40, 40)
  gltf.scene.position.set(-150, 200, -300);
})

loader.load("assets/DesertIsland/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(3, 3, 3)
  gltf.scene.position.set(-250, 230, 600);
})

loader.load("assets/CampingInTheSky/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(50, 50, 50)
  gltf.scene.position.set(400, 200, -300);
})

loader.load("assets/fireHouse2/scene-v2/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(10, 10, 10)
  gltf.scene.position.set(0, 230, 0);
})

loader.load("assets/floatingIslands/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(3, 3, 3)
  gltf.scene.position.set(0, 120, 0);
})

loader.load("assets/islandLP/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(20, 20, 20);
  gltf.scene.position.set(1000, 36.7, 1000);
  gltf.scene.rotation.y = 20;
})

loader.load("assets/Dragon/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(40, 40, 40);
  gltf.scene.position.set(200,157, -80);
  gltf.scene.rotation.y = 20;
})

const targetObject = new THREE.Object3D();
targetObject.position.set(400, 200, -300); 

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );


  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( 300, 10000, 2000 ); // Alterei a posição inicial da câmera

  // const light2 = new THREE.PointLight( 0xffffff);
  // light2.position.set( 1000, 50, 1000 );
  // scene.add( light2 );

  // let geometry = new THREE.SphereGeometry(50, 32, 32);
  // let material = new THREE.MeshToonMaterial({
  //   color: 0x777777
  // });
  // geometry.position = ( 30, 380, 100 ); 
  // let sphere = new THREE.Mesh(geometry, material);
  // sphere.position.set(0, 250, 0);
  // scene.add(sphere);

  scene.add(targetObject);
  
  const spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( 3.7, 250, 0 );
  spotLight.angle = 0.2;
  spotLight.target = targetObject
  
  scene.add( spotLight );


  sun = new THREE.Vector3();

  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI/2;

  scene.add( water );

  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 2;
  skyUniforms[ 'mieCoefficient' ].value = 0.005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  let renderTarget;

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( 90- parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth);

    sun.setFromSphericalCoords( 1, phi , theta );

    //+ tempo/20

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    if ( renderTarget !== undefined ) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene( sky );

    scene.environment = renderTarget.texture;

  }
  upsun = updateSun

  controls = new OrbitControls( camera, renderer.domElement );
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set( 0, 10, 0 );
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const waterUniforms = water.material.uniforms;

  window.addEventListener( 'resize', onWindowResize );

  window.addEventListener( 'keydown', function(e){
    if(e.key == "w"){
      airship.speed.vel = .5
    }
    if(e.key == "s"){
      airship.speed.vel = -.5
    }
    if(e.key == "d"){
      airship.speed.rotacao = -0.05
    }
    if(e.key == "a"){
      airship.speed.rotacao = 0.05
    }
  })
  window.addEventListener( 'keyup', function(e){
    airship.stop()
  })
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
  requestAnimationFrame( animate );
  upsun();
  tempo+= 0.05;
  water.position.y = Math.sin(tempo);
  
  airship.update();
  
  render();
}

function render() {
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

  renderer.render( scene, camera );
}
console.log(camera);

const light = new THREE.AmbientLight( 0xffffff, 1 );
scene.add( light );
import './index.scss';

import * as THREE from 'three';
import FBXLoader from 'three-fbx-loader';
import Detector from 'three/examples/js/Detector';

import normal from 'Static/img/axe_normal.jpg';
import ao from 'Static/img/axe_AO.jpg';
import specular from 'Static/img/axe_roughness.jpg';
import color from 'Static/img/axe_color.jpg';
import metalness from 'Static/img/axe_metallic.jpg';
import axe from 'Static/axe_low_2.fbx';

var OrbitControls = require('three-orbit-controls')(THREE);

let camera, scene, renderer;
let dirLight, dirLightHeper, hemiLight, hemiLightHelper, controls;

if (Detector.webgl) {
	// Initiate function or other initializations here
	init();
	animate();
} else {
	var warning = Detector.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);
}

function init () {
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.5, 1000);
	// camera.position.z = 1;
	camera.position.set(0, 0, -5);

	camera.lookAt(new THREE.Vector3());

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xa0a0a0);

	hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
	hemiLight.color.setHSL(0.6, 1, 0.6);
	hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	hemiLight.position.set(0, 50, 0);
	scene.add(hemiLight);
	// hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
	// scene.add(hemiLightHelper);

	dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.color.setHSL(0.1, 1, 0.95);
	dirLight.position.set(-1, 1.75, 1);
	dirLight.position.multiplyScalar(30);
	scene.add(dirLight);
	dirLight.castShadow = false;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	var d = 50;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = -0.0001;
	dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 1);
	scene.add(dirLightHeper);

	// texture
	const manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};

	const textureLoader = new THREE.TextureLoader(manager);

	const mat = new THREE.MeshStandardMaterial({
		// color: 0xdddddd,
		// specular: 0x222222,
		// shininess: 35,
		metalness: 0.4,
		roughness: 1,
		refractionRatio: 0.3,
		aoMap: textureLoader.load(ao),
		map: textureLoader.load(color),
		roughnessMap: textureLoader.load(specular),
		normalMap: textureLoader.load(normal),
		metalnessMap: textureLoader.load(metalness),
		normalScale: new THREE.Vector2(0.8, 0.8)
	});

	// model
	var loader = new FBXLoader();
	loader.load(axe, function (object) {
		object.scale.set(0.1, 0.1, 0.1);
		object.position.y = -1;
		object.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
				child.material = mat;
				child.material.needsUpdate = true;
			}
		});
		scene.add(object);
	});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
}

function animate () {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

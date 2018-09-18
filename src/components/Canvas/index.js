'use strict';

import './canvas.scss';

import FBXLoader from 'three-fbx-loader';
import * as THREE from 'three';
import Detector from 'three/examples/js/Detector';
import model from 'Static/sort_logo.fbx';

import normal from 'Static/texture/normal.png';
import roughness from 'Static/texture/roughness.png';

var container, camera, scene, renderer, particles, cubeCamera, vpModel;

let mouseX = 0;
let mouseY = 0;

const halfX = window.innerWidth / 2;
const halfY = window.innerHeight / 2;

export default containerNode => {
	container = containerNode;
	if (Detector.webgl) {
		// Initiate function or other initializations here
		init();
		animate();
	} else {
		var warning = Detector.getWebGLErrorMessage();
		warning.innerText = 'WebGL Not Supporting';
		container.appendChild(warning);
	}
};

function getRandomInt (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getCoords (delta) {
	let coords = (2 * Math.random() - 1) * delta;
	if (coords > 0 && coords < 500) {
		coords += 500;
		return coords;
	} else if (coords < 0 && coords > -500) {
		coords += -500;
		return coords;
	} else {
		return coords;
	}
}

function getCanvas (spec) {
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	let gradientBlue = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
	gradientBlue.addColorStop(0.3, 'rgba(255,255,255,0.8)');
	gradientBlue.addColorStop(0.6, 'rgba(5,30,150,0.6)');
	gradientBlue.addColorStop(1, 'rgba(5,30,150,0)');

	let gradientRed = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
	gradientRed.addColorStop(0.3, 'rgba(255,255,255,0.8)');
	gradientRed.addColorStop(0.6, 'rgba(220,20,60,0.6)');
	gradientRed.addColorStop(1, 'rgba(220,20,60,0)');

	let gradientWhite = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
	gradientWhite.addColorStop(0.3, 'rgba(255,255,255,0.8)');
	gradientWhite.addColorStop(0.6, 'rgba(255,255,255,0.6)');
	gradientWhite.addColorStop(1, 'rgba(255,255,255,0)');

	canvas.width = 32;
	canvas.height = 32;

	switch (getRandomInt(0, spec)) {
	case 0:
		ctx.fillStyle = gradientWhite;
		break;
	case 1:
		ctx.fillStyle = gradientBlue;
		break;
	case 2:
		ctx.fillStyle = gradientRed;
		break;
	default:
		ctx.fillStyle = gradientWhite;
		break;
	}

	ctx.fillRect(0, 0, 32, 32);
	return canvas;
}

function getCanvasBg () {
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	let gradient = ctx.createLinearGradient(512, -80, 70, 512);
	gradient.addColorStop(0, '#131e67');
	gradient.addColorStop(0.3, '#472261');
	gradient.addColorStop(0.5, '#832556');
	gradient.addColorStop(0.8, '#d9391f');
	gradient.addColorStop(1, '#ea710f');

	canvas.width = 1024;
	canvas.height = 512;
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 1024, 512);
	return canvas;
}

function init () {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.5, 3000);
	camera.position.set(0, 0, 200);
	camera.lookAt(new THREE.Vector3());

	scene = new THREE.Scene();
	scene.background = new THREE.CanvasTexture(getCanvasBg());

	cubeCamera = new THREE.CubeCamera(1, 3000, 512);
	scene.add(cubeCamera);

	const textureLoader = new THREE.TextureLoader();

	const normalMap = textureLoader.load(normal);
	const roughnessMap = textureLoader.load(roughness);

	var material = new THREE.MeshStandardMaterial({
		normalMap,
		roughnessMap,
		envMap: cubeCamera.renderTarget.texture,
		roughness: 0.1,
		metalness: 0.7,
		color: 0xffffff
	});

	// model
	var modelLoader = new FBXLoader();
	modelLoader.load(model, function (object3d) {
		vpModel = object3d;
		object3d.scale.set(25, 25, 25);
		object3d.position.y = -50;
		object3d.position.z = -120;
		object3d.children[0].material = material;
		scene.add(object3d);
	});

	var light = new THREE.DirectionalLight('blue', 0.4);
	light.position.set(1, -1.5, 1).normalize();
	light.scale.set(10, 10, 10);
	scene.add(light);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// particles
	particles = new THREE.Group();
	scene.add(particles);
	for (let i = 0; i < 1000; i++) {
		let particle = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.CanvasTexture(getCanvas(3))
			})
		);
		particle.position.x = (2 * Math.random() - 1) * 1000;
		particle.position.y = (2 * Math.random() - 1) * 1000;
		particle.position.z = (2 * Math.random() - 1) * 1000;
		if (
			((particle.position.y > 0 && particle.position.y < 500) ||
        (particle.position.y < 0 && particle.position.y > -500)) &&
      ((particle.position.x > 0 && particle.position.x < 500) ||
        (particle.position.x < 0 && particle.position.x > -500))
		) {
			particle.position.z = getCoords(1000);
		}
		particle.scale.x = particle.scale.y = 3 + 3 * Math.random();
		particles.add(particle);
	}
	document.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
}

function animate () {
	particles.rotation.z = Date.now() * 0.00005;
	particles.rotation.y = Date.now() * 0.00001;

	camera.position.x += (mouseX / 20 - camera.position.x) * 0.02;
	camera.position.y += (-mouseY / 20 - camera.position.y) * 0.02;

	camera.lookAt(scene.position);
	camera.updateMatrixWorld();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	var updateCubemap = true;
	if (vpModel !== undefined) {
		if (updateCubemap) {
			vpModel.visible = false;
			cubeCamera.position.copy(vpModel.position);
			renderer.autoClear = true;
			cubeCamera.update(renderer, scene);
			vpModel.visible = true;
		}
	}
}

function onWindowResize () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove (event) {
	event.preventDefault();
	mouseX = event.clientX - halfX;
	mouseY = event.clientY - halfY;
}

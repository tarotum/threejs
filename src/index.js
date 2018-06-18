'use strict';

import './index.scss';

import * as THREE from 'three';

import Detector from 'three/examples/js/Detector';

const OrbitControls = require('three-orbit-controls')(THREE);

let INTERSECTED;

let camera, scene, renderer, raycaster, mouse;
let particles;

let mouseX = 0;
let mouseY = 0;

let halfX = window.innerWidth / 2;
let halfY = window.innerHeight / 2;

if (Detector.webgl) {
	// Initiate function or other initializations here
	init();
	animate();
} else {
	var warning = Detector.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);
}

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

function getCanvas () {
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

	switch (getRandomInt(0, 3)) {
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

	let gradient = ctx.createLinearGradient(0, 0, 0, 512);
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
	// camera.position.z = 1;
	camera.position.set(0, 0, 200);

	camera.lookAt(new THREE.Vector3());

	scene = new THREE.Scene();
	scene.background = new THREE.CanvasTexture(getCanvasBg());

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// controls = new OrbitControls(camera, renderer.domElement);

	// let materials = new THREE.SpriteMaterial({
	// 	map: new THREE.CanvasTexture(getCanvas())
	// });
	particles = new THREE.Group();
	scene.add(particles);

	for (let i = 0; i < 1000; i++) {
		let particle = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.CanvasTexture(getCanvas())
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

		// console.log(particle.position.x, particle.position.y, particle.position.z);

		particle.scale.x = particle.scale.y = 3 + 3 * Math.random();

		particles.add(particle);
	}
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
}

var radius = 200;
var theta = 0;

function animate () {
	theta += 0.1;

	particles.rotation.x += 0.002;
	particles.rotation.y += 0.002;

	camera.position.x += (mouse.x / 10 - camera.position.x) * 0.02;
	camera.position.y += (-mouse.y / 10 - camera.position.y) * 0.02;

	// camera.lookAt(scene.position);
	// camera.updateMatrixWorld();

	// find intersections

	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(scene.children[0].children);

	if (intersects.length > 0) {
		if (INTERSECTED !== intersects[0].object) {
			if (INTERSECTED) INTERSECTED.material.opacity = 1;
			// console.log(intersects[0].distance);
			INTERSECTED = intersects[0].object;
			INTERSECTED.material.opacity = 0;
		}
	} else {
		if (INTERSECTED) INTERSECTED.material.opacity = 1;

		INTERSECTED = null;
	}

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function onWindowResize () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove (event) {
	event.preventDefault();

	mouse.x = event.clientX - window.innerWidth / 2;
	mouse.y = event.clientY - window.innerHeight / 2;
}

function onDocumentMouseMove (event) {
	event.preventDefault();

	mouse.x = event.clientX / window.innerWidth * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

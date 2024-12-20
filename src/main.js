//import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Import OrbitControls

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set the background color to black
renderer.setClearColor(0x000000, 1); // Black background

// Add an ambient light to the scene
const light = new THREE.AmbientLight(0x404040); // Soft light
scene.add(light);

// Directional light for better shading
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Create a smaller platform using PlaneGeometry (this is the floor)
const platformGeometry = new THREE.PlaneGeometry(500, 500); // Smaller platform (adjust as needed)
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray material for the platform
const platform = new THREE.Mesh(platformGeometry, platformMaterial);

// Rotate the platform to lie flat
platform.rotation.x = -Math.PI / 2; // Rotate by 90 degrees (x-axis)
scene.add(platform);

// Set up the GLTFLoader to load the .glb model
const loader = new GLTFLoader();

// Load the model
loader.load(
  '/public/animated_bee.glb', // Path to the downloaded .glb model in the public folder
  (gltf) => {
    // Add the model to the scene
    const model = gltf.scene;
    scene.add(model);

    // Log the model to the console for debugging
    console.log('Model loaded:', model);

    // Log all animation names to the console
    const animations = gltf.animations;
    if (animations.length > 0) {
      animations.forEach((clip) => {
        console.log('Animation:', clip.name); // Log animation names to the console
      });
    } else {
      console.log('No animations found in this model.');
    }

    // Scale the model to make it extremely bigger (for example, scale by 50x)
    model.scale.set(50, 50, 50); // Increase the size of the model (x, y, z axes)

    // Optionally adjust the model's position
    model.position.set(0, 50, 0); // Position the model slightly above the platform

    // Ensure the textures are applied
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: child.material.map || null, // Ensure texture is mapped
          normalMap: child.material.normalMap || null, // Ensure normal map is present
          roughness: 0.5, // Adjust roughness
          metalness: 0.5 // Adjust metalness
        });
      }
    });

    // Handle animations if the model contains them
    const mixer = new THREE.AnimationMixer(model);

    // If animations exist, try to play one
    if (animations.length > 0) {
      const danceAnimation = animations[0]; // Take the first animation as a test
      const action = mixer.clipAction(danceAnimation);
      action.play();
      action.setLoop(THREE.LoopRepeat, Infinity); // Loop the animation indefinitely
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      mixer.update(0.01); // Update the animation
      renderer.render(scene, camera);
      controls.update(); // Update controls for smooth camera movement
    }

    animate();
  },
  // Progress callback (optional)
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  // Error callback
  (error) => {
    console.error('Error loading model', error);
  }
);

// Position the camera so we can view the extremely bigger model
camera.position.set(0, 1, 100); // Adjust camera position to view the extremely bigger model

// Set up OrbitControls for camera manipulation
const controls = new OrbitControls(camera, renderer.domElement); // Link controls to the camera and renderer
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.25; // Damping factor for smooth movement
controls.screenSpacePanning = false; // Prevent panning in screen space

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
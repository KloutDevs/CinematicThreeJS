import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sky } from '../Journey/Sky';
import { Ground } from '../Journey/Ground';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Scene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;

    try {
      // Initialize Scene
      sceneRef.current = new THREE.Scene();
      sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.001);

      // Initialize Camera
      cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      cameraRef.current.position.set(0, 5, 20);
      cameraRef.current.lookAt(0, 0, 0);

      // Initialize Renderer con fallbacks
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!context) {
        throw new Error('WebGL not supported');
      }

      rendererRef.current = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        context: context as WebGLRenderingContext,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });

      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current.setClearColor(0x000000);
      containerRef.current.appendChild(rendererRef.current.domElement);

      // Initialize Controls
      if (cameraRef.current && rendererRef.current) {
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
      }

      // Agregar el suelo
      const ground = new Ground(2000, 40);
      sceneRef.current.add(ground.getMesh());

      // Crear objetos geométricos
      const createShapes = () => {
        const group = new THREE.Group();
        const count = 100;

        for (let i = 0; i < count; i++) {
          const geometry = new THREE.BoxGeometry(Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1);

          const hue = Math.random() * 360;
          const color = new THREE.Color(`hsl(${hue}, 80%, 60%)`);
          const material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.5,
            roughness: 0.5,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(Math.random() * 200 - 100, Math.random() * 20 - 10, Math.random() * 500 - 250);

          // Agregar propiedades para animación
          mesh.userData.originalY = mesh.position.y;
          mesh.userData.speed = Math.random() * 0.5 + 0.5;
          mesh.userData.phase = Math.random() * Math.PI * 2;

          group.add(mesh);
        }

        return group;
      };

      const shapes = createShapes();
      sceneRef.current.add(shapes);

      // Luces
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 5);
      sceneRef.current.add(ambientLight);
      sceneRef.current.add(directionalLight);

      // Manejo de redimensionamiento
      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      // Animation Loop
      const animate = (time: number) => {
        timeRef.current = time * 0.001;

        if (controlsRef.current) {
          controlsRef.current.update();
        }

        // Animar objetos
        shapes.children.forEach((mesh) => {
          const y = mesh.userData.originalY;
          const speed = mesh.userData.speed;
          const phase = mesh.userData.phase;
          mesh.position.y = y + Math.sin(timeRef.current * speed + phase) * 2;
          mesh.rotation.x += 0.01 * speed;
          mesh.rotation.y += 0.01 * speed;
        });

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        requestAnimationFrame(animate);
      };

      animate(0);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (containerRef.current && rendererRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        ground.dispose();
      };
    } catch (error) {
      console.error('Error initializing WebGL:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = 'WebGL no está soportado en tu navegador';
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        width: '100%',
        background: '#000',
      }}
    />
  );
};

export default Scene;

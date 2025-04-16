import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sky } from '../Journey/Sky';


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

      // Initialize Camera
      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      cameraRef.current.position.set(0, 5, 10);
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
      containerRef.current.appendChild(rendererRef.current.domElement);

      // Crear y agregar el cielo
      const sky = new Sky();
      sky.scale.setScalar(450000);

      // Configurar el sol
      const uniforms = sky.material.uniforms;
      uniforms['turbidity'].value = 10;
      uniforms['rayleigh'].value = 2;
      uniforms['mieCoefficient'].value = 0.005;
      uniforms['mieDirectionalG'].value = 0.8;

      // Posición del sol
      const sun = new THREE.Vector3();
      const phi = THREE.MathUtils.degToRad(90);
      const theta = THREE.MathUtils.degToRad(180);
      sun.setFromSphericalCoords(1, phi, theta);
      uniforms['sunPosition'].value.copy(sun);

      sceneRef.current.add(sky);

      // Agregar un plano para referencia
      const planeGeometry = new THREE.PlaneGeometry(10, 10);
      const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      sceneRef.current.add(plane);

      // Agregar luces
      const ambientLight = new THREE.AmbientLight(0x404040);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
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
      const animate = () => {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        requestAnimationFrame(animate);
      };

      animate();

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (containerRef.current && rendererRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
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
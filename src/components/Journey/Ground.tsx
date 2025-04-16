import * as THREE from 'three';

export class Ground {
  private material: THREE.LineBasicMaterial;
  private planeMaterial: THREE.MeshBasicMaterial;
  private lines: THREE.Group;

  constructor(size: number = 1000, divisions: number = 40) {
    this.lines = new THREE.Group();

    // Crear material para las líneas
    this.material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.5,
    });

    // Crear material para el relleno
    this.planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0060ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    // Crear el plano de relleno
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const plane = new THREE.Mesh(planeGeometry, this.planeMaterial);
    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;
    this.lines.add(plane);

    const step = size / divisions;

    // Crear líneas horizontales
    for (let i = 0; i <= divisions; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const z = i * step - size / 2;

      const vertices = new Float32Array([-size / 2, 0, z, size / 2, 0, z]);

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const line = new THREE.Line(lineGeometry, this.material);
      this.lines.add(line);
    }

    // Crear líneas verticales
    for (let i = 0; i <= divisions; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const x = i * step - size / 2;

      const vertices = new Float32Array([x, 0, -size / 2, x, 0, size / 2]);

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const line = new THREE.Line(lineGeometry, this.material);
      this.lines.add(line);
    }

    //this.lines.rotation.x = -Math.PI / 2;
  }

  getMesh(): THREE.Group {
    return this.lines;
  }

  dispose() {
    this.lines.children.forEach((child) => {
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
      }
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
    this.material.dispose();
    this.planeMaterial.dispose();
  }
}

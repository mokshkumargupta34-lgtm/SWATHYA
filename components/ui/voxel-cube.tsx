// @ts-nocheck
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * A cluster of glossy cubes that continuously morph (each cube breathes out
 * from / back to its grid slot) while the whole group slowly rotates — the
 * "deconstructing cube" look. Rendered with a transparent background so it can
 * float over any panel. Pauses when off-screen.
 */
export function VoxelCube({ color = "#e6122a" }: { color?: string }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth || 320;
    const h = mount.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // Lighting — a strong key + cool rim to get the bright edges / dark sides.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd0d0, 0.8);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    const group = new THREE.Group();
    group.rotation.set(0.5, 0.7, 0);
    scene.add(group);

    const N = 4;
    const spacing = 0.62;
    const size = 0.5;
    const half = (N - 1) / 2;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.45,
      roughness: 0.22,
    });

    const cubes = [];
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        for (let z = 0; z < N; z++) {
          const mesh = new THREE.Mesh(geo, mat);
          const base = new THREE.Vector3(
            (x - half) * spacing,
            (y - half) * spacing,
            (z - half) * spacing,
          );
          mesh.position.copy(base);
          const dir = base.clone();
          if (dir.lengthSq() === 0) dir.set(0, 1, 0);
          dir.normalize();
          mesh.userData = {
            base,
            dir,
            phase: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.018,
          };
          group.add(mesh);
          cubes.push(mesh);
        }
      }
    }

    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(mount);

    const tmp = new THREE.Vector3();
    let frameId;
    const animate = (t) => {
      frameId = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;

      group.rotation.y = t * 0.00026;
      group.rotation.x = 0.42 + Math.sin(t * 0.0002) * 0.18;

      for (const m of cubes) {
        const u = m.userData;
        // each cube breathes out along its direction with its own phase
        const d = Math.sin(t * 0.0013 + u.phase) * 0.5 + 0.5; // 0..1
        tmp.copy(u.dir).multiplyScalar(d * 0.95);
        m.position.copy(u.base).add(tmp);
        m.rotation.x += u.spin;
        m.rotation.y += u.spin * 0.6;
      }
      renderer.render(scene, camera);
    };
    animate(0);

    const onResize = () => {
      const nw = mount.clientWidth || 320;
      const nh = mount.clientHeight || 280;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [color]);

  return <div ref={mountRef} className="h-full w-full" />;
}

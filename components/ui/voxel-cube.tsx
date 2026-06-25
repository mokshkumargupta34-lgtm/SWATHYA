// @ts-nocheck
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * A cluster of glossy cubes that continuously morph (each cube breathes out
 * from / back to its grid slot) while the whole group slowly rotates — the
 * "deconstructing cube" look, in the SWASTHYA cyan→emerald palette. Rendered
 * with a transparent background so it floats over any panel; pauses off-screen.
 */
export function VoxelCube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth || 320;
    const h = mount.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    // Pulled back so the full morphing cluster stays inside the frame (no clip).
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // Lighting — strong key + cool rim for bright edges / soft shadowed sides.
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9fff4, 0.8);
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

    // Brand gradient: cyan at the bottom, emerald at the top.
    const cyan = new THREE.Color("#22d3ee");
    const emerald = new THREE.Color("#059467");

    const cubes = [];
    const materials = [];
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        for (let z = 0; z < N; z++) {
          const mat = new THREE.MeshStandardMaterial({
            metalness: 0.45,
            roughness: 0.22,
          });
          mat.color.copy(cyan).lerp(emerald, y / (N - 1));
          materials.push(mat);

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
        const d = Math.sin(t * 0.0013 + u.phase) * 0.5 + 0.5; // 0..1
        tmp.copy(u.dir).multiplyScalar(d * 0.82);
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
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
}

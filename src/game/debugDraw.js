import {Vector4,Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3,Color4,Matrix,TransformNode} from '@babylonjs/core';
import {GlobalManager} from './GlobalManager.js';

function drawRay(origin, direction, length = 1, color = new Color3(1, 1, 0)) {
    const points = [
      origin,
      origin.add(direction.normalize().scale(length))
    ];
  
    const rayLine = MeshBuilder.CreateLines("rayLine", {
      points: points ,
    }, GlobalManager.scene);
  
    rayLine.color = color;
    rayLine.isPickable = false;
    rayLine.doNotSyncBoundingInfo = true;
    
    //durée de vie
    setTimeout(() => {
      rayLine.dispose();
    }, 500); // disparait apres 0.5s
  }

  function createEllipsoidLines(mesh,a, b) {
    const points = [];
    for (let theta = -Math.PI / 2; theta < Math.PI / 2; theta += Math.PI / 36) {
      points.push(new Vector3(0, a * Math.sin(theta), b * Math.cos(theta)));
    }

    const ellipse = [];
    ellipse[0] = MeshBuilder.CreateLines("ellipsoidLine", {points: points}, GlobalManager.scene);
    ellipse[0].color = new Color3(1, 0, 0);
    ellipse[0].parent = mesh;

    const steps = 24;
    const dTheta = 2 * Math.PI / steps;
    for (let i = 1; i < steps; i++) {
      ellipse[i] = ellipse[0].clone("ellipsoidLine" + i);
      ellipse[i].parent = mesh;
      ellipse[i].rotation.y = i * dTheta;
    }
  }
export {drawRay, createEllipsoidLines};

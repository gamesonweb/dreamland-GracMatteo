import {Vector4, Vector3, AxesViewer, MeshBuilder, StandardMaterial, Color3, Color4, Matrix, TransformNode} from '@babylonjs/core';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders';

import {ArcRotateCamera, Quaternion, Ray} from "babylonjs";

import {GlobalManager} from './GlobalManager.js';



class Object3D {
    //attributes
    mesh;
    

    constructor(){
       this.mesh = null;    }

    
    init(){
        throw new Error("init() method not implemented in Object3D class. Please implement it in the derived class.");
    }

    setPosition(position){
        this.mesh.position = position;
    }
    
    setRotation(rotation){
        this.mesh.rotation = rotation;
    }

    setSclale(scale){
        this.mesh.scaling = scale;
    }  
    
    loadGLB(path,modele,name){
        return new Promise((resolve, reject) => {
            SceneLoader.ImportMeshAsync("", path,modele, GlobalManager.scene).then((result) => {
                this.mesh = result.meshes[0];
                this.mesh.name = name;
                this.mesh.position = new Vector3(0, 0, 0);
                this.mesh.rotationQuaternion = Quaternion.Identity();
                this.mesh.scaling = new Vector3(0.5,0.5,0.5);
                resolve(this.mesh);
            }).catch((error) => {
                console.error("Error loading GLB:", error);
                reject(error);
            });
        });
    }

}export default Object3D;
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

export class Avatar {
    private static HEIGHT: number = 1.7
    private scene: Scene
    fpView: FreeCamera
    body: AbstractMesh

    constructor(scene: Scene, fpView: FreeCamera) {
        this.scene = scene;
        this.fpView = fpView;
        this.body = MeshBuilder.CreateBox("avatar", { size: Avatar.HEIGHT / 2 }, this.scene);
        this.body.position.y += 0.0001 + Avatar.HEIGHT / 4;
        this.body.physicsImpostor = new PhysicsImpostor(this.body, PhysicsImpostor.BoxImpostor, {
            mass: 68, restitution: 0.2, friction: 0.01
        }, this.scene);
    }
}
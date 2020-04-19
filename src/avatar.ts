import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math";

export class Avatar {
  private static HEIGHT: number = 1.7;
  private scene: Scene;
  fpView: FreeCamera;
  body: AbstractMesh;
  private head: TransformNode;

  constructor(scene: Scene, fpView: FreeCamera) {
    this.scene = scene;
    this.fpView = fpView;
    this.body = MeshBuilder.CreateSphere(
      "avatar",
      { diameter: 0.05 },
      this.scene
    );
    this.body.position.y += 0.0001 + 0.025;
    this.body.physicsImpostor = new PhysicsImpostor(
      this.body,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 68,
        restitution: 0.2,
        friction: 0.3,
      },
      this.scene
    );
    this.body.isVisible = false;
    this.head = new TransformNode("head", this.scene);
    scene.registerAfterRender(() => {
      this.head.position = this.body.position.add(
        new Vector3(0, Avatar.HEIGHT, 0)
      );
      if (!this.nearGround()) {
        this.fpView.position.copyFrom(this.head.position);
      }
    });
  }

  nearGround(): boolean {
    return this.body.position.y - 0.025 <= 0.02;
  }
}

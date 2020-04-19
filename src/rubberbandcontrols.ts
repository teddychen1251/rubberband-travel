import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRAbstractMotionController } from "@babylonjs/core/XR/motionController/webXRAbstractMotionController";
import { Avatar } from "./avatar";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";

export class RubberbandControls {
  private scene: Scene;
  private xr: WebXRDefaultExperience;
  private avatar: Avatar;
  private rightController?: WebXRAbstractMotionController;
  private leftController?: WebXRAbstractMotionController;
  private bothWerePressed: boolean = false;
  private currentRubberband: LinesMesh = new LinesMesh("");
  private rubberbandInitiated: boolean = false;

  constructor(scene: Scene, xr: WebXRDefaultExperience, avatar: Avatar) {
    this.scene = scene;
    this.xr = xr;
    this.avatar = avatar;

    var skinMat = new StandardMaterial("skinMat", scene);
    skinMat.ambientTexture = new Texture("textures/skin.jpg", scene);
    skinMat.specularTexture = new Texture("textures/skin.jpg", scene);
    skinMat.bumpTexture = new Texture("textures/skin.jpg", scene);
    skinMat.diffuseColor = new Color3(0.8, 0.8, 0.8);
    skinMat.specularColor = new Color3(0.5, 0.5, 0.5);
    skinMat.specularPower = 32;

    const leftHand = MeshBuilder.CreateSphere(
      "left",
      { diameter: 0.12 },
      scene
    );
    const leftThumb = MeshBuilder.CreateSphere(
      "leftThumb",
      { diameter: 0.05 },
      scene
    );
    leftThumb.position = new Vector3(0.05, 0, 0);
    leftHand.addChild(leftThumb);
    leftHand.material = skinMat;
    leftThumb.material = skinMat;

    const rightHand = MeshBuilder.CreateSphere(
      "right",
      { diameter: 0.12 },
      scene
    );
    const rightThumb = MeshBuilder.CreateSphere(
      "rightThumb",
      { diameter: 0.05 },
      scene
    );
    rightThumb.position = new Vector3(-0.05, 0, 0);
    rightHand.addChild(rightThumb);
    rightHand.material = skinMat;
    rightThumb.material = skinMat;

    leftHand.isVisible = false;
    leftThumb.isVisible = false;
    rightHand.isVisible = false;
    rightThumb.isVisible = false;

    this.xr.input.onControllerAddedObservable.add((inputSource) => {
      inputSource.onMotionControllerInitObservable.add((controller) => {
        if (controller.handness === "right") {
          controller.onModelLoadedObservable.add((rightController) => {
            this.rightController = rightController;

            this.rightController.rootMesh?.dispose();
            this.rightController.rootMesh?.addChild(rightHand);
            rightHand.isVisible = true;
            rightThumb.isVisible = true;

            this.rightController
              .getComponentOfType("squeeze")!
              .onButtonStateChangedObservable.add(() => {
                if (
                  this.leftController &&
                  this.leftController.getComponentOfType("squeeze")?.pressed
                ) {
                  this.handleSqueezeChange(false);
                }
              });
          });
        } else if (controller.handness === "left") {
          controller.onModelLoadedObservable.add((leftController) => {
            this.leftController = leftController;

            this.leftController.rootMesh?.dispose();
            this.leftController.rootMesh?.addChild(leftHand);
            leftHand.isVisible = true;
            leftThumb.isVisible = true;

            this.leftController
              .getComponentOfType("squeeze")!
              .onButtonStateChangedObservable.add(() => {
                if (
                  this.rightController &&
                  this.rightController.getComponentOfType("squeeze")?.pressed
                ) {
                  this.handleSqueezeChange(true);
                }
              });
          });
        }
      });
    });
    scene.registerBeforeRender(() => {
      if (this.rubberbandInitiated) {
        this.currentRubberband = MeshBuilder.CreateDashedLines("rubberband", {
          points: [
            this.leftController!.rootMesh!.absolutePosition,
            this.rightController!.rootMesh!.absolutePosition,
          ],
          instance: this.currentRubberband,
        });
      }
    });
  }

  handleSqueezeChange(left: boolean) {
    if (!this.leftController || !this.rightController) return;
    let rightSqueeze = this.rightController!.getComponentOfType("squeeze");
    let leftSqueeze = this.leftController!.getComponentOfType("squeeze");
    // both pressed [and close together?]
    if (
      !this.bothWerePressed &&
      leftSqueeze!.pressed &&
      rightSqueeze!.pressed
    ) {
      this.bothWerePressed = true;
      this.initiateRubberband();
      // both were pressed [and close?], but one released
    } else if (this.bothWerePressed) {
      this.bothWerePressed = false;
      this.releaseRubberband(left);
    }
  }

  initiateRubberband() {
    this.currentRubberband = MeshBuilder.CreateDashedLines(
      "rubberband",
      {
        points: [
          this.leftController!.rootMesh!.absolutePosition,
          this.rightController!.rootMesh!.absolutePosition,
        ],
        updatable: true,
      },
      this.scene
    );
    this.rubberbandInitiated = true;
  }
  releaseRubberband(leftReleased: boolean) {
    this.rubberbandInitiated = false;
    this.currentRubberband.dispose();
    this.applyForce(leftReleased);
  }
  private applyForce(leftHandIsTail: boolean) {
    let force = this.rightController!.rootMesh!.absolutePosition.subtract(
      this.leftController!.rootMesh!.absolutePosition
    );
    if (!leftHandIsTail) force = force.scale(-1);
    force = this.avatar.nearGround() ? force.scale(5000) : force.scale(500);
    this.avatar.body.physicsImpostor!.applyImpulse(
      force,
      this.avatar.body.absolutePosition
    );
  }
}

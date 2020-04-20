import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Texture, Mesh } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRAbstractMotionController } from "@babylonjs/core/XR/motionController/webXRAbstractMotionController";
import { Avatar } from "./avatar";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";

export class RubberbandControls {
  private static _RUBBER_FORCE_MULTIPLIER = 1000;

  static get RUBBER_FORCE_MULTIPLIER(): number {
    return RubberbandControls._RUBBER_FORCE_MULTIPLIER;
  }
  static set RUBBER_FORCE_MULTIPLIER(value: number) {
    RubberbandControls._RUBBER_FORCE_MULTIPLIER = value;
  }

  private scene: Scene;
  private xr: WebXRDefaultExperience;
  private avatar: Avatar;
  private rightController?: WebXRAbstractMotionController;
  private leftController?: WebXRAbstractMotionController;
  private leftHand: Mesh;
  private rightHand: Mesh;
  private equipped: boolean = false;
  private bothWerePressed: boolean = false;
  private currentRubberband: LinesMesh = new LinesMesh("");
  private rubberbandInitiated: boolean = false;

  constructor(scene: Scene, xr: WebXRDefaultExperience, avatar: Avatar) {
    this.scene = scene;
    this.xr = xr;
    this.avatar = avatar;

    var skinMat = new StandardMaterial("skinMat", scene);

    skinMat.ambientColor = new Color3(0.302, 0.302, 0.302);
    skinMat.diffuseColor = new Color3(1, 1, 1);
    skinMat.emissiveColor = new Color3(0, 0, 0);
    skinMat.specularColor = new Color3(0, 0, 0);
    skinMat.specularPower = 256;
    skinMat.alpha = 1;
    skinMat.backFaceCulling = true;
    skinMat.checkReadyOnlyOnce = true;
    var skinTexture = new Texture("textures/skin.jpg", scene);
    skinTexture.hasAlpha = true;
    skinTexture.level = 1;
    skinTexture.coordinatesIndex = 0;
    skinTexture.coordinatesMode = 0;
    skinTexture.uOffset = 0;
    skinTexture.vOffset = 0;
    skinTexture.uScale = 1;
    skinTexture.vScale = 1;
    skinTexture.uAng = 0;
    skinTexture.vAng = 0;
    skinTexture.wAng = 0;
    skinTexture.wrapU = 1;
    skinTexture.wrapV = 1;
    skinMat.diffuseTexture = skinTexture;

    const sword = MeshBuilder.CreateBox(
      "sword",
      { height: 0.6, width: 0.03, depth: 0.01 },
      scene
    );

    this.leftHand = MeshBuilder.CreateSphere("left", { diameter: 0.12 }, scene);
    const leftThumb = MeshBuilder.CreateSphere(
      "leftThumb",
      { diameter: 0.05 },
      scene
    );
    leftThumb.position = new Vector3(0.05, 0, 0);
    this.leftHand.addChild(leftThumb);
    this.leftHand.material = skinMat;
    leftThumb.material = skinMat;

    this.rightHand = MeshBuilder.CreateSphere(
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
    this.rightHand.addChild(rightThumb);
    this.rightHand.material = skinMat;
    rightThumb.material = skinMat;

    this.leftHand.isVisible = false;
    leftThumb.isVisible = false;
    this.rightHand.isVisible = false;
    rightThumb.isVisible = false;

    this.xr.input.onControllerAddedObservable.add((inputSource) => {
      inputSource.onMotionControllerInitObservable.add((controller) => {
        if (controller.handness === "right") {
          controller.onModelLoadedObservable.add((rightController) => {
            this.rightController = rightController;

            this.rightController.rootMesh?.dispose();
            this.rightController.rootMesh?.addChild(this.rightHand);
            this.rightHand.isVisible = true;
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

            this.rightController
              .getComponentOfType("trigger")!
              .onButtonStateChangedObservable.add(() => {
                if (
                  this.rightController &&
                  this.rightController.getComponentOfType("trigger")?.pressed
                ) {
                  this.equipped = true;
                  this.rightHand.addChild(sword);

                  if (this.rightController && this.rightController.rootMesh) {
                    sword.rotationQuaternion = this.rightController.rootMesh?.absoluteRotationQuaternion;
                  }
                } else {
                  this.equipped = false;
                  this.rightHand.removeChild(sword);
                }
              });
          });
        } else if (controller.handness === "left") {
          controller.onModelLoadedObservable.add((leftController) => {
            this.leftController = leftController;

            this.leftController.rootMesh?.dispose();
            this.leftController.rootMesh?.addChild(this.leftHand);
            this.leftHand.isVisible = true;
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

      if (!this.equipped) {
        sword.position = this.xr.baseExperience.camera.globalPosition.subtract(
          new Vector3(0.25, 0.75, 0)
        );
        sword.rotation = new Vector3(0, 0, 0);
      } else {
        sword.position = new Vector3(0, 0.3, 0);
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
    force = force.scale(RubberbandControls.RUBBER_FORCE_MULTIPLIER);
    if (!this.avatar.nearGround() && !this.avatar.onPlatform())
      force = force.scale(0.1);
    this.avatar.body.physicsImpostor!.applyImpulse(
      force,
      this.avatar.body.absolutePosition
    );
  }
}

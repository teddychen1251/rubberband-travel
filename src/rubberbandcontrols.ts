import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRAbstractMotionController } from "@babylonjs/core/XR/motionController/webXRAbstractMotionController";

import { Avatar } from "./avatar";

export class RubberbandControls {
    private scene: Scene
    private xr: WebXRDefaultExperience
    private avatar: Avatar
    private rightController?: WebXRAbstractMotionController
    private leftController?: WebXRAbstractMotionController
    private bothWerePressed: boolean = false
    private currentRubberband: LinesMesh = new LinesMesh("");
    private rubberbandInitiated: boolean = false

    constructor(scene: Scene, xr: WebXRDefaultExperience, avatar: Avatar) {
        this.scene = scene;
        this.xr = xr;
        this.avatar = avatar;

        this.xr.input.onControllerAddedObservable.add(inputSource => {
            inputSource.onMotionControllerInitObservable.add(controller => {
                if (controller.handness === "right") {
                    controller.onModelLoadedObservable.add(rightController => {
                        this.rightController = rightController;
                        this.rightController.getComponentOfType("squeeze")!.onButtonStateChangedObservable.add(() => {
                            if (this.leftController && this.leftController.getComponentOfType("squeeze")?.pressed) {
                                this.handleSqueezeChange(false)
                            }
                        });
                    });
                } else if (controller.handness === "left") {
                    controller.onModelLoadedObservable.add(leftController => {
                        this.leftController = leftController;
                        this.leftController.getComponentOfType("squeeze")!.onButtonStateChangedObservable.add(() => {
                            if (this.rightController && this.rightController.getComponentOfType("squeeze")?.pressed) {
                                this.handleSqueezeChange(true)
                            }
                        });
                    });
                }
            });
        });
        scene.registerBeforeRender(() => {
            if (this.rubberbandInitiated) {
                this.currentRubberband = MeshBuilder.CreateDashedLines("rubberband", {
                    points: [this.leftController!.rootMesh!.absolutePosition, this.rightController!.rootMesh!.absolutePosition],
                    instance: this.currentRubberband
                });
            }
        });
    }

    handleSqueezeChange(left: boolean) {
        if (!this.leftController || !this.rightController) return;
        let rightSqueeze = this.rightController!.getComponentOfType("squeeze"); 
        let leftSqueeze = this.leftController!.getComponentOfType("squeeze");
        // both pressed [and close together?]
        if (!this.bothWerePressed && leftSqueeze!.pressed && rightSqueeze!.pressed) {
            this.bothWerePressed = true;
            this.initiateRubberband();
        // both were pressed [and close?], but one released
        } else if (this.bothWerePressed) {
            this.bothWerePressed = false;
            this.releaseRubberband(left);
        }
    }

    initiateRubberband() {
        this.currentRubberband = MeshBuilder.CreateDashedLines("rubberband", { 
            points: [this.leftController!.rootMesh!.absolutePosition, this.rightController!.rootMesh!.absolutePosition],
            updatable: true
        }, this.scene);
        this.rubberbandInitiated = true;
    }
    releaseRubberband(leftReleased: boolean) {
        this.rubberbandInitiated = false;
        this.currentRubberband.dispose();
        this.applyForce(leftReleased);
    }
    private applyForce(leftHandIsTail: boolean) {
        let force = this.rightController!.rootMesh!.absolutePosition
            .subtract(this.leftController!.rootMesh!.absolutePosition);
        if (!leftHandIsTail) force = force.scale(-1);
        force = force.scale(1000);
        this.avatar.body.physicsImpostor!.applyImpulse(force, this.avatar.body.absolutePosition);
    }
}
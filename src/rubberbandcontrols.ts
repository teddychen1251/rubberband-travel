import { Vector3, WebXRDefaultExperience, WebXRAbstractMotionController, Mesh, MeshBuilder, Scene, LinesMesh } from "babylonjs";

export class RubberbandControls {
    private scene: Scene
    private xr: WebXRDefaultExperience
    private rightController?: WebXRAbstractMotionController
    private leftController?: WebXRAbstractMotionController
    private bothWerePressed: boolean = false
    private currentRubberband: LinesMesh = new LinesMesh("");
    private rubberbandInitiated: boolean = false

    constructor(scene: Scene, xr: WebXRDefaultExperience) {
        this.scene = scene;
        this.xr = xr;

        this.xr.input.onControllerAddedObservable.add(inputSource => {
            inputSource.onMotionControllerInitObservable.add(controller => {
                if (controller.handness === "right") {
                    controller.onModelLoadedObservable.add(rightController => {
                        this.rightController = rightController;
                        this.rightController.getComponentOfType("squeeze")!.onButtonStateChangedObservable.add(() => {
                            if (this.leftController && this.leftController.getComponentOfType("squeeze")?.pressed) {
                                this.handleSqueezeChange()
                            }
                        });
                    });
                } else if (controller.handness === "left") {
                    controller.onModelLoadedObservable.add(leftController => {
                        this.leftController = leftController;
                        this.leftController.getComponentOfType("squeeze")!.onButtonStateChangedObservable.add(() => {
                            if (this.rightController && this.rightController.getComponentOfType("squeeze")?.pressed) {
                                this.handleSqueezeChange()
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

    handleSqueezeChange() {
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
            this.releaseRubberband();
        }
    }

    initiateRubberband() {
        this.currentRubberband = MeshBuilder.CreateDashedLines("rubberband", { 
            points: [this.leftController!.rootMesh!.absolutePosition, this.rightController!.rootMesh!.absolutePosition],
            updatable: true
        }, this.scene);
        this.rubberbandInitiated = true;
    }
    releaseRubberband() {
        this.rubberbandInitiated = false;
        this.currentRubberband.dispose();
    }
}
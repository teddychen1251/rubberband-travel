import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { WebXRState } from "@babylonjs/core/XR/webXRTypes";

import "@babylonjs/core/Physics/physicsEngineComponent";

import { RubberbandControls } from "./rubberbandcontrols";

export class GUI {
  private scene: Scene;
  private xr: WebXRDefaultExperience;
  private panel: AbstractMesh;

  constructor(scene: Scene, xr: WebXRDefaultExperience) {
    this.scene = scene;
    this.xr = xr;
    this.panel = MeshBuilder.CreatePlane("GUI", { size: 0.5 }, this.scene);
    this.xr.baseExperience.onStateChangedObservable.add((state) => {
      if (state === WebXRState.IN_XR) {
        this.panel.position = this.xr.baseExperience.camera.getFrontPosition(
          0.5
        );
      }
    });
    this.xr.input.onControllerAddedObservable.add((inputSource) => {
      inputSource.onMotionControllerInitObservable.add((controller) => {
        if (controller.handness === "right") {
          controller
            .getComponent("a-button")
            .onButtonStateChangedObservable.add((value) => {
              if (value.pressed) {
                this.panel.isVisible = !this.panel.isVisible;
                this.panel.position = this.xr.baseExperience.camera.getFrontPosition(
                  0.5
                );
                xr.pointerSelection.displayLaserPointer = this.panel.isVisible;
                xr.pointerSelection.displaySelectionMesh = !xr.pointerSelection
                  .displaySelectionMesh;

                this.panel.rotation.y =
                  -this.xr.baseExperience.camera.rotationQuaternion.y * Math.PI;
                this.panel.lookAt(
                  this.xr.baseExperience.camera.globalPosition,
                  Math.PI
                );
              }
            });
        }
      });
    });

    this.buildGUI();
  }

  private buildGUI() {
    let UI = AdvancedDynamicTexture.CreateForMesh(
      this.panel,
      1024,
      1024,
      false
    );

    let stack = new StackPanel("UI stack");

    private buildGUI() {
        let UI = AdvancedDynamicTexture.CreateForMesh(this.panel, 1024, 1024, false);
        
        let stack = new StackPanel("UI stack");
        
        let gravityHeader = new TextBlock("gravity header", `Gravity: ${this.scene.getPhysicsEngine()!.gravity.y} m/s^2`);
        gravityHeader.height = "20px";
        let gravitySlider = new Slider("gravity slider");
        gravitySlider.minimum = -20;
        gravitySlider.maximum = -0.5;
        gravitySlider.value = this.scene.getPhysicsEngine()!.gravity.y;
        gravitySlider.height = "30px";
        gravitySlider.onValueChangedObservable.add(value => {
            this.scene.getPhysicsEngine()!.setGravity(new Vector3(0, value, 0));
            gravityHeader.text = `Gravity: ${this.scene.getPhysicsEngine()!.gravity.y} m/s`;
        });
        stack.addControl(gravityHeader);
        stack.addControl(gravitySlider);

    let rubberForceHeader = new TextBlock(
      "rubber force header",
      `Rubber band force multiplier: ${
        RubberbandControls.RUBBER_FORCE_MULTIPLIER / 1000
      }`
    );
    rubberForceHeader.height = "20px";
    let rubberForceSlider = new Slider("rubber force slider");
    rubberForceSlider.minimum = 0.5;
    rubberForceSlider.maximum = 10;
    rubberForceSlider.value = RubberbandControls.RUBBER_FORCE_MULTIPLIER / 1000;
    rubberForceSlider.height = "30px";
    rubberForceSlider.onValueChangedObservable.add((value) => {
      RubberbandControls.RUBBER_FORCE_MULTIPLIER = value * 1000;
      rubberForceHeader.text = `Rubber band force multiplier: ${
        RubberbandControls.RUBBER_FORCE_MULTIPLIER / 1000
      }`;
    });
    stack.addControl(rubberForceHeader);
    stack.addControl(rubberForceSlider);

    let toggleMessage = new TextBlock(
      "toggle msg",
      "Press A to toggle/summon menu"
    );
    toggleMessage.height = "20px";
    stack.addControl(toggleMessage);

    UI.addControl(stack);
  }
}

// MeshBuilder: Has required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";
import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins/cannonJSPlugin";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/loaders/glTF";
import * as Cannon from "cannon";

import { Avatar } from "./avatar";
import { RubberbandControls } from "./rubberbandcontrols";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { GUI } from "./gui";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

class RubberbandWorld {
  static GRAVITY: Vector3 = new Vector3(0, -7, 0);

  public static async CreateScene(engine: Engine, canvas: HTMLCanvasElement) {
    // Create the scene space
    let scene = new Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);

    const skybox = MeshBuilder.CreateBox("skyBox", { size: 4000.0 }, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "textures/skybox",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Ground
    const groundMaterial = new StandardMaterial("ground-material", scene);
    groundMaterial.diffuseTexture = new Texture("textures/grass.png", scene);
    groundMaterial.bumpTexture = new Texture("textures/grassn.png", scene);
    groundMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
    groundMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    groundMaterial.specularPower = 32;

    const xr = await scene.createDefaultXRExperienceAsync({});
    const gui = new GUI(scene, xr);
    const avatar = new Avatar(scene, xr.baseExperience.camera);
    const rubberbandControls = new RubberbandControls(scene, xr, avatar);

    const ground = MeshBuilder.CreateBox(
      "ground",
      { width: 500, height: 1, depth: 500 },
      scene
    );
    ground.material = groundMaterial;
    ground.position = new Vector3(0, -0.5, 0);

    scene.enablePhysics(
      new Vector3(0, -7, 0),
      new CannonJSPlugin(undefined, undefined, Cannon)
    );
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        restitution: 0.1,
        friction: 1,
      },
      scene
    );

    return scene;
  }
}

/******* End of the create scene function ******/

// code to use the Class above
var createScene = async function () {
  return RubberbandWorld.CreateScene(
    engine,
    engine.getRenderingCanvas() as HTMLCanvasElement
  );
};

createScene().then((scene) => {
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
    engine.resize();
  });
});

// MeshBuilder: Has required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/loaders/glTF";
// @ts-ignore
import * as Ammo from "ammo.js";

import { Avatar } from "./avatar";
import { RubberbandControls } from "./rubberbandcontrols";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { GUI } from "./gui";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

class RubberbandWorld {
  static GRAVITY: Vector3 = new Vector3(0, -9.81, 0);

  public static async CreateScene(engine: Engine, canvas: HTMLCanvasElement) {
    // Create the scene space
    let scene = new Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);

    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
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
    groundMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
    groundMaterial.specularColor = new Color3(0, 0, 0);
    groundMaterial.specularPower = 256;
    var groundTexture = new Texture("textures/grass.png", scene);
    groundTexture.uScale = 1000;
    groundTexture.vScale = 1000;
    groundMaterial.diffuseTexture = groundTexture;

    const ground = MeshBuilder.CreateBox(
      "ground",
      { width: 500, height: 1, depth: 500 },
      scene
    );
    ground.material = groundMaterial;
    ground.position = new Vector3(0, -0.5, 0);

    // Platforms
    const platMaterial = new StandardMaterial("ground-material", scene);
    platMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
    platMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    platMaterial.specularPower = 256;
    var platTexture = new Texture("textures/marble.jpg", scene);
    platMaterial.diffuseTexture = platTexture;

    const platform1 = MeshBuilder.CreateBox(
      "plat1",
      { height: 3, width: 2.5, depth: 2.5 },
      scene
    );
    platform1.position = new Vector3(0, 1.5, 15);
    platform1.material = platMaterial;

    const platform2 = MeshBuilder.CreateBox(
      "plat2",
      { height: 6, width: 2.5, depth: 2.5 },
      scene
    );
    platform2.position = new Vector3(0, 3, 25);
    platform2.material = platMaterial;

    const platform3 = MeshBuilder.CreateBox(
      "plat3",
      { height: 10, width: 2.5, depth: 2.5 },
      scene
    );
    platform3.position = new Vector3(0, 5, 40);
    platform3.material = platMaterial;

    scene.enablePhysics(RubberbandWorld.GRAVITY, new AmmoJSPlugin(true, Ammo));

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

    platform1.physicsImpostor = new PhysicsImpostor(
      platform1,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        restitution: 0.1,
        friction: 2,
      },
      scene
    );

    platform2.physicsImpostor = new PhysicsImpostor(
      platform2,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        restitution: 0.1,
        friction: 2,
      },
      scene
    );

    platform3.physicsImpostor = new PhysicsImpostor(
      platform3,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        restitution: 0.1,
        friction: 2,
      },
      scene
    );

    const xr = await scene.createDefaultXRExperienceAsync({});
    // xr.teleportation;
    const gui = new GUI(scene, xr);
    const avatar = new Avatar(scene, xr.baseExperience.camera);
    const rubberbandControls = new RubberbandControls(scene, xr, avatar);

    // SceneLoader.ImportMesh("", "models/", "map.glb", scene, function (
    //   newMeshes
    // ) {
    //   newMeshes[0].position = new Vector3(0, 10, 0);
    //   newMeshes[0].physicsImpostor = new PhysicsImpostor(
    //     newMeshes[0],
    //     PhysicsImpostor.MeshImpostor,
    //     {
    //       mass: 0,
    //       restitution: 0.1,
    //       friction: 1,
    //     },
    //     scene
    //   );
    // });

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

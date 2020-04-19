// MeshBuilder: Has required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins/cannonJSPlugin";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/loaders/glTF";
import * as Cannon from "cannon";

import { Avatar } from "./avatar"
import { RubberbandControls } from "./rubberbandcontrols";
import { GUI } from "./gui";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

class RubberbandWorld { 
    static GRAVITY: Vector3 = new Vector3(0, -7, 0);

    public static async CreateScene(engine: Engine, canvas: HTMLCanvasElement) {
        // Create the scene space
        let scene = new Scene(engine);
        scene.createDefaultCameraOrLight(true, true, true);
        scene.createDefaultSkybox(new Texture("textures/teal-texture.jpg", scene));

        let ground = MeshBuilder.CreateBox("ground", { width: 500, height: 1, depth: 500 }, scene);
        ground.position.y -= .5;
        let groundMat = new StandardMaterial("groundMat", scene);
        groundMat.diffuseTexture = new Texture("textures/grass.jpg", scene);
        ground.material = groundMat;

        scene.enablePhysics(RubberbandWorld.GRAVITY, new CannonJSPlugin(undefined, undefined, Cannon));
        ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.1,
            friction: 1
        }, scene);

        const xr = await scene.createDefaultXRExperienceAsync({});
        const gui = new GUI(scene, xr);
        const avatar = new Avatar(scene, xr.baseExperience.camera);
        const rubberbandControls = new RubberbandControls(scene, xr, avatar);

        return scene;
    }
}

/******* End of the create scene function ******/    
// code to use the Class above
var createScene = async function() { 
    return RubberbandWorld.CreateScene(engine, 
        engine.getRenderingCanvas() as HTMLCanvasElement); 
}

createScene().then(scene => {
    engine.runRenderLoop(function () {
        scene.render();
    });
    
    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () { 
        engine.resize();
    });
});
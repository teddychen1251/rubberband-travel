// MeshBuilder: Has required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color4 } from "@babylonjs/core/Maths/math.color";

import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/loaders/glTF";
// import { Avatar } from "./avatar"
// import { RubberbandControls } from "./rubberbandcontrols";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

class RubberbandWorld { 
    public static async CreateScene(engine: Engine, canvas: HTMLCanvasElement) {
        // Create the scene space
        let scene = new Scene(engine);
        scene.clearColor = new Color4(0, .5, .5, 1);
        scene.createDefaultCameraOrLight(true, true, true);
        let ground = MeshBuilder.CreateBox("ground", { width: 50, height: 1, depth: 50 }, scene);
        ground.position.y -= .5;
        let groundMat = new StandardMaterial("groundMat", scene);
        groundMat.diffuseTexture = new Texture("textures/grass.jpg", scene);
        ground.material = groundMat;

        // scene.enablePhysics(new Vector3(0, -9.81, 0), new OimoJSPlugin());
        // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
        //     mass: 0,
        //     restitution: 0.1
        // }, scene);

        const xr = await scene.createDefaultXRExperienceAsync({});
        xr.pointerSelection.detach();
        // const avatar = new Avatar(scene, xr.baseExperience.camera);
        // const rubberbandControls = new RubberbandControls(scene, xr, avatar);

        return scene;
    }
}

/******* End of the create scene function ******/    
// code to use the Class above
var createScene = async function() { 
    return RubberbandWorld.CreateScene(engine, 
        engine.getRenderingCanvas() as HTMLCanvasElement); 
}

var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(async function () {
    (await scene).render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () { 
    engine.resize();
});
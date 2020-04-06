// MeshBuilder: Has required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { Engine, Scene, MeshBuilder, Texture, Color3, WebXRMotionControllerManager } from "babylonjs";

import { RubberbandControls } from "./rubberbandcontrols";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
WebXRMotionControllerManager.PrioritizeOnlineRepository = false;

class RubberbandWorld { 
    public static async CreateScene(engine: Engine, canvas: HTMLCanvasElement) {
        // Create the scene space
        let scene = new Scene(engine);
        scene.createDefaultCameraOrLight(true, true, true);
        let envHelper = scene.createDefaultEnvironment({
            skyboxSize: 75,
            skyboxColor: Color3.Teal(),
            groundSize: 50,
            groundTexture: new Texture("textures/grass.jpg", scene)
        });

        const xr = await scene.createDefaultXRExperienceAsync({});
        xr.pointerSelection.detach();
        const rubberbandControls = new RubberbandControls(scene, xr);

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
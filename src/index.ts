// MeshBuilder: Has required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { Engine, Scene, MeshBuilder } from "babylonjs";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

class RubberbandWorld { 
    public static async CreateScene(engine: Engine, canvas: HTMLCanvasElement) {
        // Create the scene space
        var scene = new Scene(engine);
        scene.createDefaultCameraOrLight(true, true, true);

        const xr = await scene.createDefaultXRExperienceAsync({});

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
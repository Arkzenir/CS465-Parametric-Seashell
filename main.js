let needsUpdate = false;
let Rad, r, a, b ,c ,j ,k;
let RadMax = 2; let RadMin = 1;
let rMax = 2; let rMin = 1;
let aMax = 1.3; let aMin = 1.1;
let bMax = 16; let bMin = 3;
let cMax = 2; let cMin = 1;
let jMax = 12; let jMin = 2;
let kMax = 3; let kMin = 0;

const step = Math.PI * 2 / 180

let canvas, gl
let wire,phong,gourard
let wLoc, pLoc, gLoc
let mvMatrix

let positions = [];
let normals = [];

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	//  Load shaders and initialize attribute buffers
	//
	wire = initShaders(gl, "vertex-shader", "fragment-shader");
	phong = initShaders(gl, "phong-shader", "fragment-shader");
	phong = initShaders(gl, "gourard-shader", "fragment-shader");

	gl.useProgram(wire);

	wLoc = gl.getUniformLocation(wire, "projectionMatrix");
	pLoc = gl.getUniformLocation(phong, "projectionMatrix");
	gLoc = gl.getUniformLocation(gourard, "projectionMatrix");

	gl.enable(gl.DEPTH_TEST);

}

let yRot = 0;
let xRot = 0;
let cameraZ = 0;

document.onkeydown = function (e) {
	let code = e.keyCode ? e.keyCode : e.which;
	if (code === 37) { //left key
		yRot -=0.1
		return false;
	} else if (code === 38) { //up key
		xRot -=0.1
		return false;
	} else if (code === 39) { //right key
		yRot +=0.1
		return false;
	} else if (code === 40) { //down key
		xRot +=0.1
		return false;
	} else if (code === 107) { //plus key
		cameraZ -= 0.5
		return false;
	} else if (code === 109) { //minus key
		cameraZ += 0.5
		return false;
	}
};

function generateSeashell()
{

}

function render()
{

}


function setupControls() {

	document.getElementById("Rad").appendChild(makeSlider("Rad", RadMin, RadMax))
	document.getElementById("r").appendChild(makeSlider("r", rMin, rMax))
	document.getElementById("a").appendChild(makeSlider("a", aMin, aMax))
	document.getElementById("b").appendChild(makeSlider("b", bMin, bMax))
	document.getElementById("c").appendChild(makeSlider("c", cMin, cMax))
	document.getElementById("j").appendChild(makeSlider("j", jMin, jMax))
	document.getElementById("k").appendChild(makeSlider("k", kMin, kMax))

	//Sync values to the data model:
	/*
	document.getElementById("r0widget").set(shell.r0)
	document.getElementById("z0widget").set(shell.z0)
	document.getElementById("chirwidget").set(shell.chir)
	document.getElementById("chizwidget").set(shell.chiz)
	document.getElementById("t0").value = shell.t0
	document.getElementById("tmax").value = shell.tmax
	document.getElementById("C0widget").set(shell.C0)
	document.getElementById("Cscalewidget").set(shell.Cscale)
	document.getElementById("tstep").value = shell.tstep
	document.getElementById("bezres").value = shell.bezres
	*/

	// Add event listeners:
	document.getElementById("Radslider").oninput = function() { Rad = this.value; needsUpdate = true;  }
	document.getElementById("rslider").oninput = function() { r = this.value; needsUpdate = true;  }
	document.getElementById("aslider").oninput = function() { a = this.value; needsUpdate = true;  }
	document.getElementById("bslider").oninput = function() { b = this.value; needsUpdate = true;  }
	document.getElementById("cslider").oninput = function() { c = this.value; needsUpdate = true;  }
	document.getElementById("jslider").oninput = function() { j = this.value; needsUpdate = true;  }
	document.getElementById("kslider").oninput = function() { k = this.value; needsUpdate = true;  }


	/*
        makeListener("r0", seashell.h.r0)
        makeListener("z0", seashell.h.z0)
        makeListener("chir", seashell.h.chir)
        makeListener("chiz", seashell.h.chiz)
        makeListener("t0", seashell.h.t0)
        makeListener("tmax", seashell.h.tmax)
        makeListener("Cscale", shellParameters.Cscale)
        makeListener("tstep", seashell.h.tstep)
        makeListener("bezres", shellParameters.bezres)*/
}

let needsUpdate = false;
maxNumVertices = 60000;

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

let vBuffer;
let nPhongBuffer;
let nGourardBuffer;
let cBuffer;


window.onload = function init() {
	//canvas = document.getElementById("gl-canvas");
	//gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	let container = document.getElementById( "graphicsDiv" )
	let width = container.offsetWidth;
	let height = container.offsetHeight;
	gl = WebGLUtils.setupWebGL(container);

	gl.viewport(0, 0, width, height);
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

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

	const vPosition = gl.getAttribLocation(wire, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	const vPositionGourard = gl.getAttribLocation(gourard, "vPosition");
	gl.vertexAttribPointer(vPositionGourard, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionGourard);

	const vPositionPhong = gl.getAttribLocation(phong, "vPosition");
	gl.vertexAttribPointer(vPositionPhong, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionPhong);

	nGourardBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nGourardBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, 12 * maxNumVertices, gl.STATIC_DRAW );

	nPhongBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nPhongBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW );

	const vNormalGourard = gl.getAttribLocation(nGourardBuffer, "vNormal");
	gl.vertexAttribPointer( vNormalGourard, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormalGourard );

	const vNormalPhong = gl.getAttribLocation(nPhongBuffer, "vNormal");
	gl.vertexAttribPointer( vNormalPhong, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormalPhong );

	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

	const vColor = gl.getAttribLocation(wire, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

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
	for (let u = 0; u <= 2 * Math.PI; u += step) {
		for (let v = 0; v <= 2 * Math.PI; v += step) {
			x = (Rad + (r * Math.cos(v))) * (Math.pow(a, u) * Math.cos(j*u));
			y = (Rad + (r * Math.cos(v))) * ( (-1) * Math.pow(a, u) * Math.sin(j*u));
			z = (-1) * c * (b + (r * Math.sin(v))) * Math.pow(a,u) * (k * Math.sin(v));
			positions = positions.concat([x, z, y]);
			colors = colors.concat(vec4(1.0, 0.0, 0.0, 1.0));
		}
	}
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
}

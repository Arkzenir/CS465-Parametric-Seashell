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

const step = Math.PI * 6 / 180

const WIRE = 1;
const GOURARD = 2;
const PHONG = 3;
let currProgram = 1;

let canvas, gl
let wire,phong,gourard
let wLocMV, pLocMV, gLocMV
let wLocPM, pLocPM, gLocPM
let mvMatrix

let positions = [];
let colors = [];
let normalsP = [];
let normalsG = [];

let vBuffer;
let nPhongBuffer;
let nGourardBuffer;
let cBuffer;

let modelViewMatrix;
let projectionMatrix;
const orthoUnit = 50

function init() {
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
	gourard = initShaders(gl, "gourard-shader", "fragment-shader");

	gl.useProgram(wire);
	currProgram = WIRE;

	modelViewMatrix = mat4();
	projectionMatrix = ortho(-orthoUnit, orthoUnit, -orthoUnit, orthoUnit, -orthoUnit, orthoUnit);

	wLocMV = gl.getUniformLocation(wire, "modelViewMatrix");
	pLocMV = gl.getUniformLocation(phong, "modelViewMatrix");
	gLocMV = gl.getUniformLocation(gourard, "modelViewMatrix");

	wLocPM = gl.getUniformLocation(wire, "projectionMatrix");
	pLocPM = gl.getUniformLocation(phong, "projectionMatrix");
	gLocPM = gl.getUniformLocation(gourard, "projectionMatrix");


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

	const vNormalGourard = gl.getAttribLocation(gourard, "vNormal");
	gl.vertexAttribPointer( vNormalGourard, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormalGourard );

	const vNormalPhong = gl.getAttribLocation(phong, "vNormal");
	gl.vertexAttribPointer( vNormalPhong, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormalPhong );

	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

	const vColor = gl.getAttribLocation(wire, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.enable(gl.DEPTH_TEST);
	generateSeashell();

}

let yRot = 0;
let xRot = 0;
let cameraZ = 1;

document.onkeydown = function (e) {
	let code = e.keyCode ? e.keyCode : e.which;
	if (code === 37) { //left key
		yRot -=0.75
		//return false;
	} else if (code === 38) { //up key
		xRot -=0.75
		//return false;
	} else if (code === 39) { //right key
		yRot +=0.75
		//return false;
	} else if (code === 40) { //down key
		xRot +=0.75
		//return false;
	} else if (code === 107) { //plus key
		cameraZ += 0.25
		//return false;
	} else if (code === 109) { //minus key
		cameraZ -= 0.25
		//return false;
	}
	let rotateY = rotate(yRot, [0,1,0]);
	let rotateX = rotate(xRot, [1,0,0]);
	let transZ = scale(cameraZ, cameraZ ,cameraZ);

	let temp = mult(rotateY,rotateX);
	modelViewMatrix = mult(transZ, temp);
	render();
};

function generateSeashell()
{
	positions = [];
	colors =[];
	normalsG = [];
	normalsP = [];
	for (let u = 0; u <= 2 * Math.PI; u += step) {
		for (let v = 0; v <= 2 * Math.PI; v += step) {
			let x = (Rad + (r * Math.cos(v))) * (Math.pow(a, u) * Math.cos(j*u));
			let y = (Rad + (r * Math.cos(v))) * ( (-1) * Math.pow(a, u) * Math.sin(j*u));
			let z = (-1) * c * (b + (r * Math.sin(v))) * Math.pow(a, u) * (k * Math.sin(v));

			positions.push(vec4(x, z, y, 1));
			colors.push(vec4(1.0, 0.0, 0.0, 1.0));
		}
	}
	render()
}


function calculateGourard()
{
	normalsG = [];
	render()
}

function calculatePhong()
{
	normalsP = [];
	render()
}

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (currProgram === WIRE){
		gl.useProgram(wire);
		gl.uniformMatrix4fv(wLocMV,false,flatten(modelViewMatrix));
		gl.uniformMatrix4fv(wLocPM,false,flatten(projectionMatrix));
		for (let i = 0; i < positions.length; i++) {
			gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * i, flatten(positions[i]) );

			gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * i, flatten(colors[i]));
		}
		/*
		for (let i = 0; i < positions.length; i++) {
			gl.drawArrays(gl.LINE_LOOP, i, 2);
		}
		*/

		gl.drawArrays(gl.LINE_STRIP, 0, positions.length);

	}else if (currProgram === GOURARD){
		gl.useProgram(gourard);
		gl.uniformMatrix4fv(gLocMV,false,flatten(modelViewMatrix));
		gl.uniformMatrix4fv(gLocPM,false,flatten(projectionMatrix));
	}else if (currProgram === PHONG) {
		gl.useProgram(phong);
		gl.uniformMatrix4fv(pLocMV,false,flatten(modelViewMatrix));
		gl.uniformMatrix4fv(pLocPM,false,flatten(projectionMatrix));
	}
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
	Rad = parseFloat(document.getElementById("Radslider").value)
	r = parseFloat(document.getElementById("rslider").value)
	a = parseFloat(document.getElementById("aslider").value)
	b = parseFloat(document.getElementById("bslider").value)
	c = parseFloat(document.getElementById("cslider").value)
	j = parseFloat(document.getElementById("jslider").value)
	k = parseFloat(document.getElementById("kslider").value)

	// Add event listeners:11
	document.getElementById("Radslider").oninput = function() { Rad = parseFloat(this.value); generateSeashell(); }
	document.getElementById("rslider").oninput = function() { r = parseFloat(this.value); generateSeashell();  }
	document.getElementById("aslider").oninput = function() { a = parseFloat(this.value); generateSeashell();  }
	document.getElementById("bslider").oninput = function() { b = parseFloat(this.value); generateSeashell();  }
	document.getElementById("cslider").oninput = function() { c = parseFloat(this.value); generateSeashell();  }
	document.getElementById("jslider").oninput = function() { j = parseFloat(this.value); generateSeashell();  }
	document.getElementById("kslider").oninput = function() { k = parseFloat(this.value); generateSeashell();  }
}

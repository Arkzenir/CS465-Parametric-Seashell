let needsUpdate = false;
maxNumVertices = 60000;

let Rad, r, a, b ,c ,j ,k;
let RadMax = 2; let RadMin = 1;
let rMax = 1.4; let rMin = 0.2;
let aMax = 1.3; let aMin = 1.1;
let bMax = 16; let bMin = 3;
let cMax = 2.5; let cMin = 2;
let jMax = 12; let jMin = 2;
let kMax = 3; let kMin = 0;

const step = Math.PI * 3 / 180

let modelViewMatrix;
let projectionMatrix;
const orthoUnit = 30;

const lightPosition = vec4(orthoUnit, orthoUnit/2.0, orthoUnit/2.0, 0.0);
const lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
const lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
const lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

const materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
const materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
const materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
const materialShininess = 100.0;

let ambientColor, diffuseColor, specularColor;


const WIRE = 1;
const GOURARD = 2;
const PHONG = 3;
const TEXTURE = 4;
let currProgram = 1;

let canvas, gl
let wire,phong,gourard
let wLocMV, pLocMV, gLocMV
let wLocPM, pLocPM, gLocPM
let normalMatrixLoc;

let positions = [];
let colors = [];
let normalsP = [];
let normalsG = [];

let vBuffer;
let nPhongBuffer;
let nGourardBuffer;
let cBuffer;

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

	normalMatrixLoc = gl.getUniformLocation(phong, "normalMatrix");

	wLocPM = gl.getUniformLocation(wire, "projectionMatrix");
	pLocPM = gl.getUniformLocation(phong, "projectionMatrix");
	gLocPM = gl.getUniformLocation(gourard, "projectionMatrix");

	let ambientProduct = mult(lightAmbient, materialAmbient);
	let diffuseProduct = mult(lightDiffuse, materialDiffuse);
	let specularProduct = mult(lightSpecular, materialSpecular);

	gl.useProgram(gourard);

	gl.uniform4fv(gl.getUniformLocation(gourard, "ambientProduct"),
		flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(gourard, "diffuseProduct"),
		flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(gourard, "specularProduct"),
		flatten(specularProduct) );
	gl.uniform4fv(gl.getUniformLocation(gourard, "lightPosition"),
		flatten(lightPosition) );
	gl.uniform1f(gl.getUniformLocation(gourard,
		"shininess"),materialShininess);


	gl.useProgram(phong);

	gl.uniform4fv(gl.getUniformLocation(phong, "ambientProduct"),
		flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(phong, "diffuseProduct"),
		flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(phong, "specularProduct"),
		flatten(specularProduct) );
	gl.uniform4fv(gl.getUniformLocation(phong, "lightPosition"),
		flatten(lightPosition) );
	gl.uniform1f(gl.getUniformLocation(phong,
		"shininess"),materialShininess);

	gl.useProgram(wire);

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

window.onkeydown = function (e) {
	let code = e.keyCode ? e.keyCode : e.which;
	if (code === 37) { //left key
		yRot -=1.75
		//return false;
	} else if (code === 38) { //up key
		xRot -=1.75
		//return false;
	} else if (code === 39) { //right key
		yRot +=1.75
		//return false;
	} else if (code === 40) { //down key
		xRot +=1.75
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

	let count = 0;
	for (let u = 0; u < 2 * Math.PI; u += step) {
		for (let v = 0; v <= 2 * Math.PI; v += step) {
			let innerU = u;
			let innerV = v;

			if (count % 4 === 0){
				innerV -= (count / 2 * step);
			}
			else if (count % 4 === 1) {
				innerU += step;
				innerV -= ((count-1) / 2 * step);
			}
			else if (count % 4 === 2) {
				innerU += step;
				innerV -= (count / 2 * step);
			}
			else if (count % 4 === 3){
				innerV -= ((count+1) / 2 * step);
				count = 0;
			}
			count++;
			/*
			if (count === 4){
				innerV = -4 * step;
				count = 0;
			}
			*/


			let x = (Rad + (r * Math.cos(innerV))) * (Math.pow(a, innerU) * Math.cos(j*innerU));
			let y = (Rad + (r * Math.cos(innerV))) * ( (-1) * Math.pow(a, innerU) * Math.sin(j*innerU));
			let z = (-1) * c * (b + (r * Math.sin(innerV))) * Math.pow(a, innerU) * (k); //No sin???? ;

			//Take partial derivatives of X Y and Z with respect to U and V
			let derivativeUX = ( (r * Math.cos(v) + Rad) * Math.pow(a,u) * Math.log(a) * Math.cos(j*u)) - ( (r * Math.cos(v) + Rad) * Math.pow(a,u) * j * Math.sin(j*u) );
			let derivativeUY = ( (-1) * ( (r * Math.cos(v) + Rad) * Math.pow(a,u) * Math.log(a) * Math.sin(j*u))) - ( (r * Math.cos(v) + Rad) * Math.pow(a,u) * j * Math.cos(j*u) );
			let derivativeUZ = (-1) * c * k * Math.pow(a,u) * Math.log(a) * (b + (r * Math.sin(v)));

			let derivativeVX = r * Math.sin(v) * Math.pow(a,u) * Math.cos(j*u);
			let derivativeVY = (-1) * r * Math.sin(v) * Math.pow(a,u) * Math.sin(j*u);
			let derivativeVZ = c * Math.pow(a,u) * k * r * Math.cos(v);

			//Reverse cross order if this does not work
			let vecDU = vec3(derivativeUX, derivativeUY, derivativeUZ);
			let vecDV = vec3(derivativeVX, derivativeVY, derivativeVZ);
			normalsG.push(cross(vecDU, vecDV));
			normalsP.push(cross(vecDU, vecDV));

			positions.push(vec4(x, z + orthoUnit * 1.5, y, 1));
			colors.push(vec4(1.0, 0.0, 0.0, 1.0));
		}
	}
	/*
        for (let v = 0; v <= 2 * Math.PI; v += step) {
            for (let u = 0; u <= 2 * Math.PI; u += step) {
                let x = (a * (1 - v / (2 * Math.PI)) * (1 + Math.cos(u)) + c) * Math.cos(j * v);
                let y = (a * (1 - v / (2 * Math.PI)) * (1 + Math.cos(u)) + c) * Math.sin(j * v);
                let z = b * v / (2 * Math.PI) + a * (1 - v / (2 * Math.PI)) * Math.sin(u);
                positions.push(vec4(x, z, y, 1));
                colors.push(vec4(1.0, 0.0, 0.0, 1.0));
            }
        }

    */
	render()
}

function getNormal(u, v){
	let veci = ( (-1) * Math.pow(a,u) * (r * Math.cos(v) + Rad) * (j * Math.cos(j*u) + Math.log(a) * Math.sin(j * u)) * c * k * r * Math.pow(a,u) * Math.cos(v))
		- (c * k * Math.pow(a,u) * Math.log(a) * (r * Math.sin(v) + b) * r * Math.sin(v) * Math.pow(a,u) * Math.sin(j*u));
	let vecj = (-1) * Math.sin(v) * Math.pow(a,u) * Math.cos(j*u) * c * k * Math.pow(a,u) * Math.log(a) * (r * Math.sin(v) + b);
	let veck = (r * Math.sin(v) * Math.pow(a,u) * Math.cos(j*u) * Math.pow(a,u) * (r * Math.cos(v) + Rad) * (j * Math.cos(j*u) + (Math.log(a) * Math.sin(j*u)) ))
		- (( (r * Math.cos(v) + Rad) * Math.pow(a,u)) * ((Math.log(a) * Math.cos(j*u)) - (j * Math.sin(j*u))) * r * Math.sin(v) * Math.log(a) * Math.sin(j*u));
	return (vec3( veci, vecj, veck));
}

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (currProgram === WIRE){
		gl.useProgram(wire);
		gl.uniformMatrix4fv(wLocMV,false,flatten(modelViewMatrix));
		gl.uniformMatrix4fv(wLocPM,false,flatten(projectionMatrix));
		/*
		for (let i = 0; i < positions.length; i++) {
			gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * i, flatten(positions[i]) );

			gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * i, flatten(colors[i]));
		}
		*/

		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(positions) );

		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(colors));

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


		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(positions) );

		gl.bindBuffer( gl.ARRAY_BUFFER, nGourardBuffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(normalsG));

		/*
		for (let i = 0; i < positions.length; i++) {
			gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * i, flatten(positions[i]) );

			gl.bindBuffer( gl.ARRAY_BUFFER, nGourardBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 12 * i, flatten(normalsG[i]));
		}
		*/
		gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length);

	}else if (currProgram === PHONG) {
		gl.useProgram(phong);
		gl.uniformMatrix4fv(pLocMV,false,flatten(modelViewMatrix));
		gl.uniformMatrix4fv(pLocPM,false,flatten(projectionMatrix));

		let normalMatrix =  [
			vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
			vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
			vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
		];
		gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(positions) );

		gl.bindBuffer( gl.ARRAY_BUFFER, nPhongBuffer );
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(normalsP));



		/*
		let bufferForward = 0;
		for (let i = 0; i < positions.length; i += 3) {
			gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * bufferForward, flatten(positions[i]) );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * (bufferForward + 1), flatten(positions[i + 1]) );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * (bufferForward + 2), flatten(positions[i + 2]) );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * (bufferForward + 3), flatten(positions[i]) );
			if (i + 3 < positions.length)
				gl.bufferSubData( gl.ARRAY_BUFFER, 16 * (bufferForward + 4), flatten(positions[i + 3]) );
			gl.bufferSubData( gl.ARRAY_BUFFER, 16 * (bufferForward + 5), flatten(positions[i + 2]) );


			gl.bindBuffer( gl.ARRAY_BUFFER, nPhongBuffer );

			gl.bufferSubData( gl.ARRAY_BUFFER, 12 * bufferForward, flatten(normalsP[i]));
			gl.bufferSubData( gl.ARRAY_BUFFER, 12 * (bufferForward + 1), flatten(normalsP[i + 1]));
			gl.bufferSubData( gl.ARRAY_BUFFER, 12 * (bufferForward + 2), flatten(normalsP[i + 2]));
			gl.bufferSubData( gl.ARRAY_BUFFER, 12 * (bufferForward + 3), flatten(normalsP[i]));
			if (i + 3 < normalsP.length)
				gl.bufferSubData( gl.ARRAY_BUFFER, 12 * (bufferForward + 4), flatten(normalsP[i + 3]));
			gl.bufferSubData( gl.ARRAY_BUFFER, 12 * (bufferForward + 5), flatten(normalsP[i + 2]));

			bufferForward += 6;
		}
		*/

		gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length * 2);
	} else if (currProgram === TEXTURE){

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

	document.getElementById("wire").onclick = function () {currProgram = WIRE; render();};
	document.getElementById("gourard").onclick = function () {currProgram = GOURARD; render();};
	document.getElementById("phong").onclick = function () {currProgram = PHONG; render();};
	document.getElementById("texture").onclick = function () {currProgram = TEXTURE; render();};

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

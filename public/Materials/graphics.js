
const doMouseDown = (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x =  Math.round(event.clientX
                          - boundingRectangle.left
                          - boundingRectangle.width/2);
    const y = -Math.round(event.clientY
                          - boundingRectangle.top
                          - boundingRectangle.height/2);
    const translation = {x, y, z: -150}
    const rotation = {x: 0, y: 0, z: 180}
    const shapeType = document.querySelector("input[name='shape']:checked").value
    const shape = {
        translation, rotation, type: shapeType
    }
    addShape(shape, shapeType)
}



let attributeNormals
let uniformWorldViewProjection
let uniformWorldInverseTranspose
let uniformReverseLightDirectionLocation
let normalBuffer
let lightSource = [0.4, 0.3, 0.5]

const up = [0, 1, 0]
let target = [0, 0, 0]
let lookAt = true
// declare up to be in +y direction
// declare the origin as the target we'll look at
// we'll toggle lookAt on and off



const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const GREEN_HEX = "#00FF00"
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const LETTER_F = "LETTER_F"
const STAR = "STAR"
const SPHERE = "SPHERE"
const CIRCLE = "CIRCLE"
const CUBE = "CUBE"
const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}

let camera = {
    translation: {x: 500, y: 50, z: 500},
    rotation: {x: 0, y: 0, z: 0}
}

let shapes = [
    {
        type: CUBE,
        position: origin,
        dimensions: sizeOne,
        color: GREEN_RGB,
        translation: {x:  0, y: 0, z: 0},
        scale:       {x:   20, y:   0.1, z:   20},
        rotation:    {x:   0, y:  0, z:   0},
    },

]


const addShape = (newShape, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    let tz =0
    let shape = {
        type: type,
        position: origin,
        dimensions: sizeOne,
        color: colorRgb,
        translation: {x: tx, y: ty, z: tz},
        rotation: {x: 0, y: 0, z: 0},
        scale: {x: 20, y: 20, z: 20}
    }
    if (newShape) {
        Object.assign(shape, newShape)
    }
    shapes.push(shape)
    render()
}


let gl
let attributeCoords
let uniformMatrix
let uniformColor
let bufferCoords
let fieldOfViewRadians = m4.degToRad(60)

const updateFieldOfView = (event) => {
    fieldOfViewRadians = m4.degToRad(event.target.value);
    render();
}

const init = () => {
    const canvas = document.querySelector("#canvas");

    canvas.addEventListener(
        "mousedown",
        doMouseDown,
        false);

    gl = canvas.getContext("webgl");


    const program = webglUtils.createProgramFromScripts(gl, "#vertex-shader-3d", "#fragment-shader-3d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // initialize coordinate attribute
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer
    bufferCoords = gl.createBuffer();

    attributeNormals = gl.getAttribLocation(program, "a_normals");
    gl.enableVertexAttribArray(attributeNormals);
    normalBuffer = gl.createBuffer();

    uniformWorldViewProjection
        = gl.getUniformLocation(program, "u_worldViewProjection");
    uniformWorldInverseTranspose
        = gl.getUniformLocation(program, "u_worldInverseTranspose");
    uniformReverseLightDirectionLocation
        = gl.getUniformLocation(program, "u_reverseLightDirection");


    uniformMatrix = gl.getUniformLocation(program, "u_matrix");




    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    document.getElementById("tx").onchange = event => updateTranslation(event, "x")
    document.getElementById("ty").onchange = event => updateTranslation(event, "y")
    document.getElementById("tz").onchange = event => updateTranslation(event, "z")

    document.getElementById("sx").onchange = event => updateScale(event, "x")
    document.getElementById("sy").onchange = event => updateScale(event, "y")
    document.getElementById("sz").onchange = event => updateScale(event, "z")

    document.getElementById("rx").onchange = event => updateRotation(event, "x")
    document.getElementById("ry").onchange = event => updateRotation(event, "y")
    document.getElementById("rz").onchange = event => updateRotation(event, "z")

    document.getElementById("fv").onchange = event => updateFieldOfView(event)

    document.getElementById("color").onchange = event => updateColor(event)

    document.getElementById("lookAt").onchange = event => webglUtils.toggleLookAt(event)
    document.getElementById("ctx").onchange = event => webglUtils.updateCameraTranslation(event, "x")
    document.getElementById("cty").onchange = event => webglUtils.updateCameraTranslation(event, "y")
    document.getElementById("ctz").onchange = event => webglUtils.updateCameraTranslation(event, "z")
    document.getElementById("crx").onchange = event => webglUtils.updateCameraRotation(event, "x")
    document.getElementById("cry").onchange = event => webglUtils.updateCameraRotation(event, "y")
    document.getElementById("crz").onchange = event => webglUtils.updateCameraRotation(event, "z")
    document.getElementById("ltx").onchange = event => webglUtils.updateLookAtTranslation(event, 0)
    document.getElementById("lty").onchange = event => webglUtils.updateLookAtTranslation(event, 1)
    document.getElementById("ltz").onchange = event => webglUtils.updateLookAtTranslation(event, 2)

    document.getElementById("lookAt").checked = lookAt
    document.getElementById("ctx").value = camera.translation.x
    document.getElementById("cty").value = camera.translation.y
    document.getElementById("ctz").value = camera.translation.z
    document.getElementById("crx").value = camera.rotation.x
    document.getElementById("cry").value = camera.rotation.y
    document.getElementById("crz").value = camera.rotation.z

    document.getElementById("dlrx").value = lightSource[0]
    document.getElementById("dlry").value = lightSource[1]
    document.getElementById("dlrz").value = lightSource[2]

    document.getElementById("dlrx").onchange
        = event => webglUtils.updateLightDirection(event, 0)
    document.getElementById("dlry").onchange
        = event => webglUtils.updateLightDirection(event, 1)
    document.getElementById("dlrz").onchange
        = event => webglUtils.updateLightDirection(event, 2)


    selectShape(0)
}


let selectedShapeIndex = 0

const updateTranslation = (event, axis) => {
    const value = event.target.value
    shapes[selectedShapeIndex].translation[axis] = value
    render()
}

const updateScale = (event, axis) => {
    const value = event.target.value
    shapes[selectedShapeIndex].scale[axis] = value
    render()
}

const updateRotation = (event, axis) => {
    shapes[selectedShapeIndex].rotation[axis] = event.target.value
    render();
}

const updateColor = (event) => {
    const value = event.target.value
    const rgb = webglUtils.hexToRgb(value)
    shapes[selectedShapeIndex].color = rgb
    render()
}


const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
    M = m4.translate(viewProjectionMatrix,
                     shape.translation.x,
                     shape.translation.y,
                     shape.translation.z)
    M = m4.xRotate(M, m4.degToRad(shape.rotation.x))
    M = m4.yRotate(M, m4.degToRad(shape.rotation.y))
    M = m4.zRotate(M, m4.degToRad(shape.rotation.z))
    M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z)
    return M
}



const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(
        attributeCoords,
        3,           // size = 3 floats per vertex
        gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
        false,       // normalize = false; i.e., don't normalize the data
        0,           // stride = 0; ==> move forward size * sizeof(type)
        // each iteration to get the next position
        0);          // offset = 0; i.e., start at the beginning of the buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attributeNormals, 3, gl.FLOAT, false, 0, 0);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;

    let viewProjectionMatrix

    const $shapeList = $("#object-list")
    $shapeList.empty()
    let cameraMatrix = m4.identity();
    if(lookAt) {
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z)
        const cameraPosition = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14]]
        cameraMatrix = m4.lookAt(
            cameraPosition,
            target,
            up)
        cameraMatrix = m4.inverse(cameraMatrix)
    }  else {
        cameraMatrix = m4.zRotate(
            cameraMatrix,
            m4.degToRad(camera.rotation.z));
        cameraMatrix = m4.xRotate(
            cameraMatrix,
            m4.degToRad(camera.rotation.x));
        cameraMatrix = m4.yRotate(
            cameraMatrix,
            m4.degToRad(camera.rotation.y));
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z);
    }
    const projectionMatrix = m4.perspective(
        fieldOfViewRadians, aspect, zNear, zFar)
    viewProjectionMatrix = m4.multiply(
        projectionMatrix, cameraMatrix)

    let worldMatrix = m4.identity()
    const worldViewProjectionMatrix
        = m4.multiply(viewProjectionMatrix, worldMatrix);
    const worldInverseMatrix
        = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix
        = m4.transpose(worldInverseMatrix);

    gl.uniformMatrix4fv(uniformWorldViewProjection, false,
                        worldViewProjectionMatrix);
    gl.uniformMatrix4fv(uniformWorldInverseTranspose, false,
                        worldInverseTransposeMatrix);

    gl.uniform3fv(uniformReverseLightDirectionLocation,
                  m4.normalize(lightSource));



    shapes.forEach((shape,index) => {
        const $li = $(`
        <li>
        <label>
        <input
        type="radio"
        id="${shape.type}-${index}"
        name="shape-index"
        ${index === selectedShapeIndex ? "checked": ""}
        onclick="selectShape(${index})"
        value="${index}"/>
        <button onclick="deleteShape(${index})">
          Delete
        </button>
         ${shape.type};
         X: ${shape.translation.x};
         Y: ${shape.translation.y}
        </label>
        </li>
        `)
        $shapeList.append($li)
        gl.uniform4f(uniformColor,
                     shape.color.red,
                     shape.color.green,
                     shape.color.blue, 1);


        // let M = computeModelViewMatrix(gl.canvas, shape, aspect, zNear, zFar)
        // let M = computeModelViewMatrix(
        //     shape, viewProjectionMatrix)
        // gl.uniformMatrix4fv(uniformMatrix, false, M)
        let M = computeModelViewMatrix(shape, worldViewProjectionMatrix)
        gl.uniformMatrix4fv(uniformWorldViewProjection, false, M)


        if (shape.type === CUBE) {
            renderCube(shape)
        }
        else if(shape.type === RECTANGLE) {
            renderRectangle(shape)
        } else if(shape.type === TRIANGLE) {
            renderTriangle(shape)
        }
        else if(shape.type === STAR) {
            renderStar(shape)
        }
        else if(shape.type === CIRCLE) {
            renderCircle(shape)
        } else if (shape.type == SPHERE) {
            renderSphere(shape)
        }
    })
}

const selectShape = (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    document.getElementById("tz").value = shapes[selectedIndex].translation.z
    document.getElementById('sx').value = shapes[selectedIndex].scale.x
    document.getElementById('sy').value = shapes[selectedIndex].scale.y
    document.getElementById("sz").value = shapes[selectedIndex].scale.z
    document.getElementById("rx").value = shapes[selectedIndex].rotation.x
    document.getElementById("ry").value = shapes[selectedIndex].rotation.y
    document.getElementById('rz').value = shapes[selectedIndex].rotation.z
    document.getElementById("fv").value = m4.radToDeg(fieldOfViewRadians)
    // TODO: update the scale and rotation fields
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
}


const deleteShape = (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    if (shapes.length > 0) {
        selectShape(0)
        render()
    } else {
        selectedShapeIndex = -1
    }
}


const renderTriangle = (triangle) => {
    const x1 = triangle.position.x
               - triangle.dimensions.width / 2
    const y1 = triangle.position.y
               + triangle.dimensions.height / 2
    const x2 = triangle.position.x
               + triangle.dimensions.width / 2
    const y2 = triangle.position.y
               + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y
               - triangle.dimensions.height / 2

    const float32Array = new Float32Array([
                                              x1, y1, 0,  x2, y2, 0,  x3, y3, 0
                                          ])

    gl.bufferData(gl.ARRAY_BUFFER,
                  float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const renderRectangle = (rectangle) => {
    const x1 = rectangle.position.x
               - rectangle.dimensions.width/2;
    const y1 = rectangle.position.y
               - rectangle.dimensions.height/2;
    const x2 = rectangle.position.x
               + rectangle.dimensions.width/2;
    const y2 = rectangle.position.y
               + rectangle.dimensions.height/2;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                                                        x1, y1, 0, x2, y1, 0, x1, y2, 0,
                                                        x1, y2, 0, x2, y1, 0, x2, y2, 0,
                                                    ]), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderStar = (star) => {
    const x1 = star.position.x
               - star.dimensions.width / 2
    const y1 = star.position.y
               + star.dimensions.height / 3
    const x2 = star.position.x
               + star.dimensions.width / 2
    const y2 = star.position.y
               + star.dimensions.height / 3
    const x3 = star.position.x
    const y3 = star.position.y
               - star.dimensions.height * 2 / 3

    const x4 = star.position.x
               - star.dimensions.width / 2
    const y4 = star.position.y
               - star.dimensions.height / 3
    const x5 = star.position.x
               + star.dimensions.width / 2
    const y5 = star.position.y
               - star.dimensions.height / 3
    const x6 = star.position.x
    const y6 = star.position.y
               + star.dimensions.height * 2 / 3

    const float32Array = new Float32Array([
                                              x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6
                                          ])

    gl.bufferData(gl.ARRAY_BUFFER,
                  float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderCircle = (circle) => {
    const cos = 50;
    const triangleList = new Float32Array(cos * 6)
    const angle = 2 * Math.PI / cos;

    for (let i = 0; i < cos; i++) {
        triangleList[i * 6] = circle.position.x;
        triangleList[i * 6 + 1] = circle.position.y;
        triangleList[i * 6 + 2] = circle.position.x + circle.dimensions.width * Math.cos(i * angle);
        triangleList[i * 6 + 3] = circle.position.y + circle.dimensions.height * Math.sin(i * angle);
        triangleList[i * 6 + 4] = circle.position.x + circle.dimensions.width * Math.cos((i + 1) * angle);
        triangleList[i * 6 + 5] = circle.position.y + circle.dimensions.height * Math.sin((i + 1) * angle);
    }
    gl.bufferData(gl.ARRAY_BUFFER,
                  triangleList, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, cos * 3);
}

const renderCube = (cube) => {
    let geometry=[
        0,  0,  0,    0, 30,  0,   30,  0,  0,
        0, 30,  0,   30, 30,  0,   30,  0,  0,
        0,  0, 30,   30,  0, 30,    0, 30, 30,
        0, 30, 30,   30,  0, 30,   30, 30, 30,
        0, 30,  0,    0, 30, 30,   30, 30, 30,
        0, 30,  0,   30, 30, 30,   30, 30,  0,
        0,  0,  0,   30,  0,  0,   30,  0, 30,
        0,  0,  0,   30,  0, 30,    0,  0, 30,
        0,  0,  0,    0,  0, 30,    0, 30, 30,
        0,  0,  0,    0, 30, 30,    0, 30,  0,
        30,  0, 30,   30,  0,  0,   30, 30, 30,
        30, 30, 30,   30,  0,  0,   30, 30,  0
    ]
    geometry = new Float32Array(geometry)
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW)

    var normals = new Float32Array([
                                       0,0, 1,  0,0, 1,  0,0, 1,    0,0, 1,  0,0, 1,  0,0, 1,
                                       0,0,-1,  0,0,-1,  0,0,-1,    0,0,-1,  0,0,-1,  0,0,-1,
                                       0,-1,0,  0,-1,0,  0,-1,0,    0,-1,0,  0,-1,0,  0,-1,0,
                                       0, 1,0,  0, 1,0,  0, 1,0,    0, 1,0,  0, 1,0,  0, 1,0,
                                       -1, 0,0, -1, 0,0, -1, 0,0,   -1, 0,0, -1, 0,0, -1, 0,0,
                                       1, 0,0,  1, 0,0,  1, 0,0,    1, 0,0,  1, 0,0,  1 ,0,0,
                                   ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}

const renderSphere = (sphere) => {
    const geometry = new THREE.SphereGeometry( 5, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const s = new THREE.Mesh( geometry, material );
    const canvas = document.querySelector("#canvas");
    canvas.add( s );


}


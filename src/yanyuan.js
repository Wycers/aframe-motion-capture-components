function fakeGamepadButton() {
    this.pressed = false
    this.touched = false
    this.value = 0
}

function fakeGamepad(id, hand, index) {
    this.el = document.querySelector(`#${hand}`)

    this.id = id
    this.hand = hand
    this.index = index
    this.pose = {
        position: [0, 0, 0],
        orientation: [0, 0, 0, 0]
    }
    this.buttons = [
        new fakeGamepadButton(),
        new fakeGamepadButton(),
        new fakeGamepadButton(),
        new fakeGamepadButton()
    ]
    this.axes = [0, 0]
    this.scale = new THREE.Vector3(1, 1, 1)

    this.getPoseDEG = function () {
        const tmp = this.getPoseRAD()
        return {
            position: tmp.position,
            rotation: {
                x: tmp.rotation.x * THREE.Math.RAD2DEG,
                y: tmp.rotation.y * THREE.Math.RAD2DEG,
                z: tmp.rotation.z * THREE.Math.RAD2DEG
            }
        }
    }
    this.getPoseRAD = function () {
        const tmp = {
            position: new THREE.Vector3(),
            quaternion: new THREE.Quaternion(),
            matrix: new THREE.Matrix4()
        }
        tmp.quaternion.fromArray(this.pose.orientation);
        tmp.position.fromArray(this.pose.position);
        const euler = new THREE.Euler().setFromQuaternion(tmp.quaternion)
        const standingMatrix = this.el.sceneEl.renderer.vr.getStandingMatrix();
        tmp.matrix.compose(tmp.position, tmp.quaternion, this.scale);
        tmp.matrix.multiplyMatrices(standingMatrix, tmp.matrix);
        tmp.matrix.decompose(tmp.position, tmp.quaternion, this.scale);

        return {
            position: tmp.position,
            rotation: {
                x: euler.x,
                y: euler.y,
                z: euler.z
            }
        }
    }
    this.setPostion = function (x, y, z) {
        const tmp = {
            position: new THREE.Vector3(x, y, z),
            quaternion: new THREE.Quaternion().fromArray(this.pose.orientation),
            matrix: new THREE.Matrix4()
        }
        const standingMatrix = this.el.sceneEl.renderer.vr.getStandingMatrix();
        tmp.matrix.compose(tmp.position, tmp.quaternion, this.scale);
        tmp.matrix.multiplyMatrices(new THREE.Matrix4().getInverse(standingMatrix), tmp.matrix);
        tmp.matrix.decompose(tmp.position, tmp.quaternion, this.scale);
        this.pose.position = [].concat([tmp.position.x, tmp.position.y, tmp.position.z])
        this.pose.orientation = [].concat([tmp.quaternion.x, tmp.quaternion.y, tmp.quaternion.z, tmp.quaternion.w])
    }

    this.setRotationDEG = function (x, y, z) {
        this.setRotationRAD(THREE.Math.degToRad(x), THREE.Math.degToRad(y), THREE.Math.degToRad(z))
    }
    this.setRotationRAD = function (x, y, z) {
        const euler = new THREE.Euler(x, y, z)
        const tmp = {
            position: new THREE.Vector3().fromArray(this.pose.position),
            quaternion: new THREE.Quaternion().setFromEuler(euler),
            matrix: new THREE.Matrix4()
        }
        const standingMatrix = this.el.sceneEl.renderer.vr.getStandingMatrix();
        tmp.matrix.compose(tmp.position, tmp.quaternion, this.scale);
        tmp.matrix.multiplyMatrices(new THREE.Matrix4().getInverse(standingMatrix), tmp.matrix);
        tmp.matrix.decompose(tmp.position, tmp.quaternion, this.scale);
        this.pose.orientation = [].concat([tmp.quaternion.x, tmp.quaternion.y, tmp.quaternion.z, tmp.quaternion.w])
    }

    this.setPostion(0, 0, 0)

    this.setTouchpadPosition = function (x, y) {
        this.axes = [x, y]
    }
    this.getTouchpadPosition = () => ({
        x: this.axes[0],
        y: this.axes[1]
    })

    this.touchTouchpad = function () {
        this.buttons[0].touched = true
    }
    this.leaveTouchpad = function () {
        this.buttons[0].touched = false
    }

    const mapping = {
        trackpad: 0,
        trigger: 1,
        grip: 2,
        menu: 3
    }
    this.pressButton = function (button) {
        if (typeof button === 'number') {
            this.buttons[button].pressed = true
        } else if (mapping[button]) {
            this.buttons[mapping[button]].pressed = true
        } else {
            console.log('wrong argument')
        }
    }
    this.releaseButton = function (button) {
        if (typeof button === 'number') {
            this.buttons[button].pressed = false
        } else if (mapping[button]) {
            this.buttons[mapping[button]].pressed = false
        } else {
            console.log('wrong argument')
        }
    }
}

function mockVive() {
    this.originGetGamepads = null
    this.gamepads = []
    this.loaded = false
    this.start = () => {
        if (this.loaded) {
            return
        }
        this.loaded = true
        this.gamepads.push(new fakeGamepad("OpenVR Gamepad", "left", 0))
        this.gamepads.push(new fakeGamepad("OpenVR Gamepad", "right", 1))

        this.originGetGamepads = navigator.getGamepads
        navigator.getGamepads = () => this.gamepads
    }
    this.end = () => {
        navigator.getGamepads = this.originGetGamepads
        this.loaded = false
    }
    this.test = () => {
        this.gamepads[0].setPostion(0, 0, 0)
        this.gamepads[1].setPostion(1, 1, 1)
        return this.gamepads[1].getPoseDEG()
    }
    this.test2 = () => {
        this.gamepads[1].setRotationDEG(0, 90, 90)
    }
}

window.mockVive = new mockVive()

function mockDisplay() {
    this.origingetVRDisplays = null
    this.displays = null
    this.loaded = false
    this.start = () => {
        if (this.loaded) {
            return
        }
        this.loaded = true
        this.display.push(new fakeGamepad("OpenVR Gamepad", "left", 0))

        this.originGetVRDisplays = navigator.getVRDisplays
        navigator.getVRDisplays = () => ({

        })
    }
    this.end = () => {
        navigator.getGamepads = this.originGetGamepads
        this.loaded = false
    }

}

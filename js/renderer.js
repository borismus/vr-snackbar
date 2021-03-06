function Renderer() {
  var container = document.querySelector('body');
  var aspect = window.innerWidth / window.innerHeight;
  var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);

  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  var controls = new THREE.VRControls(camera);
  var effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

  this.camera = camera;
  this.renderer = renderer;
  this.effect = effect;
  this.controls = controls;
  this.manager = new WebVRManager(renderer, effect);

  this.scene = this.createScene_();
  this.scene.add(this.camera);
  this.snackbar = this.createSnackbar_();
  this.camera.add(this.snackbar);
}

Renderer.prototype.render = function(timestamp) {
  this.controls.update();

  // Update the snackbar's position to follow yaw.
  this.updateSnackbarPosition_();

  this.manager.render(this.scene, this.camera, timestamp)
};

Renderer.prototype.createCube_ = function() {
  // Create 3D objects.
  var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  var material = new THREE.MeshNormalMaterial();
  var cube = new THREE.Mesh(geometry, material);

  // Position cube mesh
  cube.position.z = -1;

  return cube;
};

Renderer.prototype.createSprite_ = function() {
  var map = THREE.ImageUtils.loadTexture('img/snackbar.png');
  var material = new THREE.SpriteMaterial({map: map, color: 0xffffff});
  var sprite = new THREE.Sprite(material);
  var aspect = 512 / 70;
  var width = 1;
  sprite.scale.set(width, width / aspect);
  sprite.position.z = -1;

  return sprite;
};

Renderer.prototype.createSkybox_ = function() {
  var boxWidth = 5;
  var texture = THREE.ImageUtils.loadTexture(
    'img/box.png'
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(boxWidth, boxWidth);

  var geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x01BE00,
    side: THREE.BackSide
  });

  var skybox = new THREE.Mesh(geometry, material);
  return skybox;
};

Renderer.prototype.createSnackbar_ = function() {
  var aspect = 740 / 144;
  var width = .7;

  var map = THREE.ImageUtils.loadTexture('img/snackbar.svg');
  var material = new THREE.MeshBasicMaterial({map: map, color: 0xffffff});
  var geometry = new THREE.PlaneGeometry(width, width / aspect);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -1;

  return mesh;
};

Renderer.prototype.createScene_ = function() {
  var scene = new THREE.Scene();
  // Add a light.
  scene.add(new THREE.PointLight(0xFFFFFF));

  scene.add(this.createSkybox_());

  return scene;
};

Renderer.prototype.updateSnackbarPosition_ = function() {
  var MIN_PITCH = -30;
  var MAX_PITCH = 35;
  // Get camera pitch.
  var look = new THREE.Vector3(0, 0, -1);
  look.applyQuaternion(this.camera.quaternion);
  var cameraPitch = Math.atan2(look.y, Math.sqrt(look.x*look.x + look.z*look.z));

  // Snackbar pitch in world coordinates.
  var snackbarWorldPitch = THREE.Math.degToRad(MIN_PITCH);

  // If we're looking down, lock the snackbar to the camera.
  if (cameraPitch < THREE.Math.degToRad(MIN_PITCH)) {
    snackbarWorldPitch = cameraPitch;
  }
  if (cameraPitch > THREE.Math.degToRad(MIN_PITCH + MAX_PITCH)) {
    snackbarWorldPitch = cameraPitch - THREE.Math.degToRad(MAX_PITCH);
  }

  var snackbarPitch = cameraPitch - snackbarWorldPitch;
  //console.log('snackbarPitch', snackbarPitch);
  this.snackbar.position.y = Math.tan(snackbarPitch) * this.snackbar.position.z;
};

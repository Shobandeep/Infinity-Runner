//player movement component
AFRAME.registerComponent('player-movement', {
  schema: {
    moveTo: {type:'number', default: 0},
    speed: {type:'number', default: 5},
    camera: {}
  },
  //init function, only called once when the component is attached 
  init: function () {
    //keep a local reference to the camera (we don't want to have to look it up every frame)
    this.data.camera = document.querySelector('#camera');
    },
  //tick function: called every frame
  tick: function () {
    // grab the player's current position
    var playerXPosition = this.el.getAttribute('position').x;
    
    //check which way the camera is facing and adjust our heading accordingly 
    this.data.moveTo = -Math.sign(Math.floor(this.data.camera.getAttribute('rotation').y));
    
    
    // is the player inside the bounds? if yes, let them move
    if((playerXPosition <= 20 )  && (playerXPosition >= -20)){
      this.el.setAttribute('velocity', {x: this.data.moveTo*this.data.speed,y: 0,z: 0} );
    }
    else {
      // is the player outside the bound but wants to go back in? if yes, let them move
      if(Math.sign(playerXPosition) != this.data.moveTo) {
        this.el.setAttribute('velocity', {x: this.data.moveTo*this.data.speed,y: 0,z: 0} );
      }
      // the  case that the player tries to move further out even when at the boundary 
      else {
        this.el.setAttribute('velocity', {x: 0,y: 0,z: 0} );
      }
    }
    
  }
});


//camera movement component
AFRAME.registerComponent('camera-movement', {
  scheme: {
    playerEl: {}
  },
  //init function: only called once when the component is attached 
  init: function () {
    //keep a local reference to the player (we don't want to have to look it up every frame)
    this.data.playerEl = document.querySelector('#player');
    },
  //tick function: called every frame
  tick: function () {
    
    var pos = this.data.playerEl.getAttribute('position');
    this.el.setAttribute('position', {x: pos.x, y: pos.y+1.5, z: pos.z+3});
    
  }
});


//low-budget event-listener
AFRAME.registerComponent('reset-pos', {
  schema: {
    count: {type:'int', default: 5},
    length: {type:'number', default: 50},
    limit: {type:'number'},
    next: {}
  },
  init: function () {
    this.data.limit = this.data.length/2;
    this.data.count -= .5;
  },
  //tick function: called every frame
  tick: function () {
    if(this.el.getAttribute('position').z >= this.data.limit) {
      this.el.setAttribute('position', { x: 0, y: 0, z: this.data.next.getAttribute('position').z-this.data.length });
      console.log('This is ' + this.el.getAttribute('id') + ' at ' + this.el.getAttribute('position').z+',behind ' + this.data.next.getAttribute('id') + ' at ' + this.data.next.getAttribute('position').z);
    }
    
  }
});

//terrain generator component  Note: loop terrain in this component to check z pos VS make new component for that
AFRAME.registerComponent('terrain-pool', {
  schema: {
    terrains: {type:'array'},
    count: {type:'int', default: 7},
    width: {type:'number', default: 40},
    length: {type:'number', default: 25},
    speed: {type:'number', default: 50}
  },
  //init function, only called once when the component is attached 
  init: function () {
    
    var sceneEl = document.querySelector('a-scene');
    
    
    // make the planes
    for(var i = 0; i < this.data.count;i++) {
      
      var terrainEl = document.createElement('a-entity');

      // give it some values 
      terrainEl.setAttribute('geometry', { primitive: 'plane', width: this.data.width, height: this.data.length});
      terrainEl.setAttribute('position', { x: 0, y: 0, z: -(i*this.data.length) });
      terrainEl.setAttribute('rotation', { x: -90, y: 0, z: 0});
      terrainEl.setAttribute('id', 'terrain: '+(i+1)); 
      terrainEl.setAttribute('velocity', {x: 0,y: 0,z: this.data.speed} );
      terrainEl.setAttribute('reset-pos', {count: this.data.count, length: this.data.length});
      
      var r = Math.floor(Math.random() * 256);
      var g = Math.floor(Math.random() * 256);
      var b = Math.floor(Math.random() * 256);
      var colorString = 'rgb('+r+', '+g+', '+b+')';
      
      //give it a random color to test
      terrainEl.setAttribute('material', { color: colorString}); 
      
      this.data.terrains.push(terrainEl);
      
      
      sceneEl.appendChild(terrainEl);
    }
    
    for(var i = this.data.count-1; i > 0;i--) {
      this.data.terrains[i].setAttribute('reset-pos', {count: this.data.count, length: this.data.length, next:this.data.terrains[i-1]});
    }
    
    this.data.terrains[0].setAttribute('reset-pos', {count: this.data.count, length: this.data.length, next:this.data.terrains[this.data.count-1]});
    
    }
});

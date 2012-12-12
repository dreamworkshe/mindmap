(function(){

	// setup
	var labelType, useGradients, nativeTextSupport, animate;
	var ua = navigator.userAgent,
  iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
  typeOfCanvas = typeof HTMLCanvasElement,
  nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
  textSupport = nativeCanvasSupport 
  && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
  // setup end

  var rgraph = new $jit.RGraph({
    injectInto: 'infovis',
    Navigation: {
      enable: true,
      panning: true,
      zooming: 20
    },
    Node: {
      overridable: true,
      dim: 20,
      color: '#11B32E'
    },
    Edge: {
      color: '#CC426B',
      lineWidth: 3
    },
    Events: {  
      enable: true,  
      type: 'Native',  
      onClick: function(node) {  
        if(!node) return;

        var name = prompt("Enter node name:");
        var newnode = rgraph.graph.addNode({"id":count++, "name":name});
        var pos = node.getPos();  
        newnode.setPos(pos); 
        rgraph.graph.addAdjacence(node, newnode, null);
        replot();
      },
      onRightClick: function(node) {
      	rgraph.onClick(node.id);
      }/*,
      onDragStart: function(domElement, node) {
        console.log("Drag!!");
        console.log(domElement);
      }*/
    },
  	iterations: 200,
  	levelDistance: 100,
  	onCreateLabel: function(domElement, node){  
	    domElement.innerHTML = node.name;  
	    var style = domElement.style;  
	    var left = parseInt(style.left);  
	    var top = parseInt(style.top);
	    var w = domElement.offsetWidth;
    },
    onPlaceLabel: function(domElement, node) {  
      var style = domElement.style;  
      var left = parseInt(style.left);  
      var top = parseInt(style.top);  
      var w = domElement.offsetWidth;
      var h = domElement.offsetHeight;
      style.left = (left - w / 2) + 'px';  
      style.top = (top - h / 2) + 'px';
    },
    onAfterCompute: function() {
      checkPos();
    }

  });
  var test = 0;
	var count = 0;
	var name = prompt("What's on your mind?");
	//var name = "topic";
  var json = [{'id':count++, 'name':name}];

  if (test) {
    json = [{'id':count++, 'name': 'node1'}
    , {'id':count++, 'name': 'node2', 'adjacencies': ['1']}
    , {'id':count++, 'name': 'node3', 'adjacencies': ['1']}
    , {'id':count++, 'name': 'node4', 'adjacencies': ['1']}
    , {'id':count++, 'name': 'node5', 'adjacencies': ['2']}];
  }

  rgraph.loadJSON(json);
	rgraph.graph.eachNode(function(n) {  
	  var pos = n.getPos();  
	  pos.setc(-100, -100);
	});
  replot();

  var socket = io.connect('http://localhost:4000');
  socket.on('connect', function () {
    socket.send("hello");
  });


  function replot() {
  	rgraph.compute('end');
  	rgraph.fx.animate({  
      modes: ['polar'],  
      duration: 1000,
      transition: $jit.Trans.Back.easeOut
    });
  }

  function checkPos() {
    var w = rgraph.canvas.getSize().width,
        h = rgraph.canvas.getSize().height,
        scaled = false,
        sx = rgraph.canvas.scaleOffsetX,
        sy = rgraph.canvas.scaleOffsetY,
        tx = rgraph.canvas.translateOffsetX,
        ty = rgraph.canvas.translateOffsetY;
    rgraph.graph.eachNode(function(n) {  
      var pos = n.getPos().getc();
      var px = pos.x+w/sx/2;
      var py = pos.y+h/sy/2;
      if (!scaled && (px*sx < 10 || px*sx > w - 10
            || py*sy < 10 || py*sy > h - 10)) {
        animateScale(0.8, 0.8, 500);
        scaled = true;
      }
    });
  }

  function animateScale(x, y, duration) {
    var time = 0, lasttime = 0, timer;
    var gettime = Date.now || function() { return +new Date;};
    start();
    function step() {
      var thistime = gettime();
      if (thistime < time + duration) {
        var inter = thistime - lasttime,
            remaintime = time + duration - thistime,
            xpow = Math.pow(x, inter/remaintime),
            ypow = Math.pow(y, inter/remaintime)
        rgraph.canvas.scale(xpow, ypow);
        x /= xpow;
        y /= ypow;
        lasttime = thistime;
      } else {
        clearInterval(timer);
      }
    }

    function start() {
      time = gettime() - time;
      lasttime = time;
      timer = setInterval(step, Math.round(1000 / 100));
    }
  }


})();
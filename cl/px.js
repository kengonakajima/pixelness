

$(document).ready( function() {
  setup();
});


function setup() {
  setupMain();

  p("setup done");
}

function Color(r,g,b,a) {
  var out = {}
  out.r = r;
  out.g = g;
  out.b = b;
  out.a = a;
  out.to_s = function() {
    return "{"+r+","+g+","+b+","+a+"}";
  }
  return out;
}
function fillRect( outcv, x1, y1, w, h, col ) {
  var ctx = outcv.getContext("2d");
  ctx.fillStyle = "rgb("+col.r+","+col.g+","+col.b+")";
  ctx.fillRect(x1,y1,w,h);
}


function Sheet() {


}

function MainCanvas( cv ) {
  var out = {};
  out.canvas = cv;
  out.zoom = 8; // screen pixel per sprite pixel
  out.pw = cv.width / out.zoom;
  out.ph = cv.height / out.zoom;
  
  out.draw = function() {
    fillRect( cv, 0,0, cv.width, cv.height, Color(255,255,255,255) );

    for(var y=0;y<out.ph;y++) {
      for(var x=0;x<out.pw;x++) {
        var c = Color( irange(0,255),irange(0,255),irange(0,255),255);
        var z = out.zoom;
        fillRect( out.canvas, x*z, y*z, z,z, c );        
      }
    }

  };
  return out;
};


function callback(png) {
  var l = png.data.length;
  var pixel_num = 900 * 675;
  var ary = png.decode();
  p("PNG:",ary.length /900 /675);
};

function setupMain(){
  var maincanv = MainCanvas( $("#maincanvas")[0] );
  maincanv.draw();

  PNG.load( "met.png", callback );
}


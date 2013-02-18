

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

function Image( w, h, pixels ) {
  var out = {};
  out.width = w;
  out.height = h;
  out.data = pixels;
  out.getColor = function(x,y) {
    var ind = (x + y * out.width)*4;
    if( ind >= 0 && ind < out.width * out.height ) {
      return Color( out.data[ind], out.data[ind+1], out.data[ind+2], out.data[ind+3] );
    } else {
      return null;
    }
  }
  return out;
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

  out.setImage = function(img) {
    out.img = img;
  };
  
  out.renderCurrentImage = function() {
    assert(out.img);
    p( "renderCurrentImage:", out.img );
    for(var y=0;y<out.ph;y++){
      for(var x=0;x<out.pw;x++){
        var col = out.img.getColor(x,y); // TODO: scroll
        fillRect( out.canvas, x*out.zoom,y*out.zoom,out.zoom,out.zoom,col);
      }
    }
  };

  
  return out;
};

var maincanv = null;

function setupMain(){
  maincanv = MainCanvas( $("#maincanvas")[0] );
  maincanv.draw();

  PNG.load( "met.png", function(png) {
    var img = Image(png.width, png.height, png.decode() );
    maincanv.setImage( img );
    maincanv.renderCurrentImage();
  });
  
}

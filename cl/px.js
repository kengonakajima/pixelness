

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
function clear( outcv ) {
  var ctx = outcv.getContext("2d");  
  ctx.clearRect(0, 0, outcv.width, outcv.height);  
}
function fillRect( outcv, x1, y1, w, h, col ) {
  var ctx = outcv.getContext("2d");
  ctx.fillStyle = "rgb("+col.r+","+col.g+","+col.b+")";
  ctx.fillRect(x1,y1,w,h);
}

function strokeRect( outcv, x1, y1, w, h, margin, col ) {
  var ctx = outcv.getContext("2d");
  ctx.strokeStyle = "rgb("+col.r+","+col.g+","+col.b+")";
  ctx.strokeRect(x1-margin,y1-margin,w+margin*2,h+margin*2);
  
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
  // scale whole image to Left-Top
  out.scaleNearest = function( xs, ys ) {
    var tow = out.width * xs;
    var toh = out.height * ys;
    var newdata = new Array();
    for(var y=0;y<toh;y++) {
      for(var x=0;x<tow;x++) {
        var real_x = int(x / xs);
        var real_y = int(y / ys);
        var ind = (real_x + real_y * out.width)*4;
        var newind = (x + y * out.width)*4;
        newdata[newind] = out.data[ind];
        newdata[newind+1] = out.data[ind+1];
        newdata[newind+2] = out.data[ind+2];
        newdata[newind+3] = out.data[ind+3];
      }
    }
    for(var y=0;y<toh;y++) {
      for(var x=0;x<tow;x++) {
        var ind = (x + y * out.width)*4;
        out.data[ind] = newdata[ind];
        out.data[ind+1] = newdata[ind+1];
        out.data[ind+2] = newdata[ind+2];
        out.data[ind+3] = newdata[ind+3];        
      }
    }
  };
  return out;
}

function MainCanvas( cv, hudcv ) {
  var out = {};
  out.canvas = cv;
  out.hudcanvas = hudcv;
  out.zoom = 16; // screen pixel per sprite pixel
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

  //
      
  out.drawPixelGrid = function() {
    var c = Color(128,128,128,128);
    for(var y=0;y<out.ph;y++){
      for(var x=0;x<out.pw;x++){
        fillRect( out.hudcanvas, x*out.zoom, y*out.zoom, 1,1, c);
      }
    }
  };
  
  //
  
  out.cursor_x = 0;
  out.cursor_y = 0;
  
  $(hudcv).mousemove( function(e) {
    var x = e.offsetX;
    var y = e.offsetY;
    var nix = int(x/out.zoom);
    var niy = int(y/out.zoom);
    if( nix != out.cursor_x || niy != out.cursor_y ) {
      out.cursor_x = nix;
      out.cursor_y = niy;

      clear( out.hudcanvas ); // これが重い
      out.drawPixelGrid();
      strokeRect( out.hudcanvas, nix*out.zoom, niy*out.zoom, out.zoom, out.zoom, 0, Color(255,255,255,255) );
    }
    return true;
  });

  
  return out;
};

var maincanv = null;

function setupMain(){
  maincanv = MainCanvas( $("#maincanvas")[0], $("#mainhudcanvas")[0] );
  maincanv.draw();

  PNG.load( "met.png", function(png) {
    var img = Image(png.width, png.height, png.decode() );
    img.scaleNearest( 0.5, 0.5 );    
    maincanv.setImage( img );
    maincanv.renderCurrentImage();
  });
  
}


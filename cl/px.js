


function Color(r,g,b,a) {
  var out = {}
  out.r = r;
  out.g = g;
  out.b = b;
  out.a = a;
  out.to_s = function() {
    return "{"+r+","+g+","+b+","+a+"}";
  };
  out.validate = function() {
    return ( r >= 0 && r <= 255 &&
             g >= 0 && g <= 255 &&
             b >= 0 && b <= 255 &&
             a >= 0 && a <= 255 );
  };
  return out;
}
function clear( outcv ) {
  var ctx = outcv.getContext("2d");  
  ctx.clearRect(0, 0, outcv.width, outcv.height);  
}
function fillRect( outcv, x1, y1, w, h, col ) {
  var ctx = outcv.getContext("2d");
  ctx.fillStyle = "rgba("+col.r+","+col.g+","+col.b+","+(col.a/255.0)+")";
  ctx.fillRect(x1,y1,w,h);
}

function strokeRect( outcv, x1, y1, w, h, margin, width, col ) {
  var ctx = outcv.getContext("2d");
  print("a:", col.a );
  ctx.strokeStyle = "rgba("+col.r+","+col.g+","+col.b+","+(col.a/255.0)+")";
  ctx.lineWidth = width;
  ctx.strokeRect(x1-margin,y1-margin,w+margin*2,h+margin*2); 
}

  
// ピクセルが無いことを表す市松模様
var white_col = Color(255,255,255,255);
var gray_col = Color(200,200,200,255);

function fillRectBlankBG( outcv, x1, y1, w, h ) {
  fillRect( outcv, x1,y1,w/2,h/2, white_col); // left-top
  fillRect( outcv, x1+w/2,y1,w/2,h/2, gray_col); // right-top
  fillRect( outcv, x1,y1+h/2,w/2,h/2, gray_col) // left-bottom
  fillRect( outcv, x1+w/2,y1+h/2,w/2,h/2, white_col ); // right-bottom
}
// 背景つきピクセル全体
function fillRectPixel( outcv, x1,y1,w,h, col ) {
  if( col.a < 255 ) {
    fillRectBlankBG( outcv, x1,y1,w,h );    
  }
  fillRect( outcv, x1,y1,w,h,col);  
}

///////////////

function Image( w, h, pixels ) {
  var out = {};
  out.width = w;
  out.height = h;
  out.data = pixels;

  // basics
  out.getColor = function(x,y) {
    var ind = (x + y * out.width)*4;
    if( ind >= 0 && ind < out.width * out.height ) {
      return Color( out.data[ind], out.data[ind+1], out.data[ind+2], out.data[ind+3] );
    } else {
      return null;
    }
  }
  out.setColor = function(x,y,c) {
    assert( c.validate() );
    var ind = (x + y * out.width)*4;
    if( ind >= 0 && ind < out.width * out.height ) {
      out.data[ind] = c.r;
      out.data[ind+1] = c.g;
      out.data[ind+2] = c.b;
      out.data[ind+3] = c.a;      
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


//////////////////
function Inventory( elems ) {
  var out = {};
  assert( elems.length == 9 );
  out.num = 9;
  out.selected_ind = 0;
  out.canvases = elems;
  out.colors = [];

  out.setColor = function(ind,c) {
    assert( ind >= 0 && ind < out.num );
    c.validate();
    out.colors[ind] = c;
  };

  //
  



  out.setColor( 0, Color(255,0,0,255) );
  out.setColor( 1, Color(0,255,0,255) );
  out.setColor( 2, Color(0,0,255,255) );
  
  out.setColor( 3, Color(255,0,0,128) );
  out.setColor( 4, Color(0,255,0,128) );
  out.setColor( 5, Color(0,0,255,128) );
  
  out.setColor( 6, Color(0,0,0,0) );
  out.setColor( 7, Color(0,0,0,0) );
  out.setColor( 8, Color(0,0,0,0) );  
  
  out.refresh = function() {
    for(var i=0;i<out.num;i++) {
      var canv = out.canvases[i];
      fillRectPixel( canv, 0, 0, canv.width, canv.height, out.colors[i] );
      if( i == out.selected_ind ) {
        strokeRect( canv, 0,0, canv.width, canv.height, 0, 8, Color(255,255,255,255) );
      }
    }

    
  };

  out.refresh();
  
  return out;
  
}

//////////////////

function MainCanvas( cv, hudcv ) {
  var out = {};
  out.canvas = cv;
  out.hudcanvas = hudcv;
  out.zoom = 16; // screen pixel per sprite pixel
  out.pw = cv.width / out.zoom;
  out.ph = cv.height / out.zoom;

  out.setImage = function(img) {
    out.img = img;
  };
  
  out.renderCurrentImage = function() {
    assert(out.img);

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
  
  // Cursor
  
  out.cursor_x = 0;
  out.cursor_y = 0;
  
  $(hudcv).mousemove( function(e) {
    var x = e.offsetX, y = e.offsetY;
    var nix = int(x/out.zoom), niy = int(y/out.zoom);
    if( nix != out.cursor_x || niy != out.cursor_y ) {
      out.cursor_x = nix;
      out.cursor_y = niy;

      clear( out.hudcanvas ); // TODO: consuming CPU too much
      out.drawPixelGrid();
      strokeRect( out.hudcanvas, nix*out.zoom, niy*out.zoom, out.zoom, out.zoom, 0, 1, Color(255,255,255,255) );
    }

    if( out.mouse_down ) {
      out.tryDraw( x,y );
    }
    return true;
  });

  out.mouse_down = false;

  out.default_cursor_color = Color(255,255,255,255);
  out.cursor_color = out.default_cursor_color;
  
  $(hudcv).bind("contextmenu", function() {    return false;   });
  
  $(hudcv).mousedown( function(e) {
    var right = false;
    if( e.which == 3 || e.shiftKey ) right = true;
    
    if( right ) {
      var nix = int(e.offsetX/out.zoom), niy = int(e.offsetY/out.zoom);
      out.cursor_color = out.img.getColor(nix,niy);
      if( out.cursor_color == null ) {
        out.cursor_color = out.default_cursor_color;
      }

    } else {
      out.mouse_down = true;
      out.tryDraw( e.offsetX, e.offsetY );
    }
  });

  $(hudcv).mouseup( function(e) {
    out.mouse_down = false;
  });

  // x,y: offsetX|Y
  out.tryDraw = function( x, y ) { 
    var nix = int(x/out.zoom), niy = int(y/out.zoom);
    out.img.setColor( nix, niy, out.cursor_color );
    out.renderCurrentImage();
  };

  out.drawPixelGrid();
  
  return out;
};

var maincanv = null;

function setupMain(){
  maincanv = MainCanvas( $("#maincanvas")[0], $("#mainhudcanvas")[0] );

  PNG.load( "met.png", function(png) {
    var img = Image(png.width, png.height, png.decode() );
    img.scaleNearest( 0.5, 0.5 );    
    maincanv.setImage( img );
    maincanv.renderCurrentImage();
  });
  
}

var inventory = null;
function setupInventory() {
  var elems = new Array( $("#inventory0")[0],$("#inventory1")[0],$("#inventory2")[0],$("#inventory3")[0],
                         $("#inventory4")[0],$("#inventory5")[0],$("#inventory6")[0],$("#inventory7")[0],$("#inventory8")[0] );

  inventory = Inventory( elems );
  
}
///////////


function setupKeyboard() {
  $(document).keydown( function(e) {
//    print("kdown:",e.keyCode );
    switch( e.keyCode ){
    case 78: //n
      var url = maincanv.canvas.toDataURL();
      window.open(url);
      break;
    }
    
  });
}


///////////


$(document).ready( function() {
  setup();
});


function setup() {
  setupMain();
  setupInventory();
  setupKeyboard();  
  p("setup done");
}

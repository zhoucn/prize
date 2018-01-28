bg_canvas = document.getElementById('bg-canvas');
bg_ctx = bg_canvas.getContext('2d');
img = document.getElementById('img');
img0 = document.getElementById('img0');
img1 = document.getElementById('img1');
img2 = document.getElementById('img2');
img3 = document.getElementById('img3');
bg_canvas.width=canvas.clientWidth;
bg_canvas.height=canvas.clientHeight;
bx = parseInt(bg_canvas.width / 2 - img.width / 2);
by = parseInt(bg_canvas.height / 2 - img.height / 2);
imgData = [];
datas = [];

function calculate(img){
  bg_ctx.clearRect(0,0,bg_canvas.width,bg_canvas.height);
  imgData = [];
  datas = [];
  bg_ctx.drawImage(img,0,0,img.width,img.height,bx,by,img.width,img.height);
  imgData = bg_ctx.getImageData(bx,by,img.width,img.height);
  imgData = imgData.data;

  var w = 2,
      cols = img.height / w,
      rows = img.width / w
      pos = 0,
      data = imgData;
  for(var i = 1; i <= cols; i++){
    for(var j = 1; j <= rows; j++){
      pos = [(j * w - 1) * img.width  + (i * w - 1)] * 4;
      if(data[pos] >= 0){
        var particle = {
          x: bx + i * w,
          mx : bg_canvas.width / 2,
          y: by + j * w,
          my : bg_canvas.height / 2,
          fillStyle : 'rgba(' + data[pos] + ',' + data[pos + 1] + ',' + data[pos + 2] + ',' + data[pos + 3] + ')'
        }
        datas.push(particle);
      }
    }
  }
}
var stopD = null;
function pDraw(){
  stopD = window.requestAnimationFrame(pDraw);
  bg_ctx.clearRect(0,0,bg_canvas.width,bg_canvas.height);
  var len = datas.length,
      rdata = null;
  for(var i = 0; i < len; i++){
    rdata = datas[i];
    if(rdata.mx < rdata.x){
      rdata.mx += Math.random() * 60;
      rdata.mx > rdata.x ? rdata.mx = rdata.x : rdata.mx = rdata.mx;
    }else{
      rdata.mx -= Math.random() * 90;
      rdata.mx < rdata.x ? rdata.mx = rdata.x : rdata.mx = rdata.mx;
    }
    if(rdata.my < rdata.y){
      rdata.my += Math.random() * 80;
      rdata.my > rdata.y ? rdata.my = rdata.y : rdata.my = rdata.my;
    }else{
      rdata.my -= Math.random() * 40;
      rdata.my < rdata.y ? rdata.my = rdata.y : rdata.my = rdata.my;
    }

    bg_ctx.fillStyle = rdata.fillStyle;
    bg_ctx.fillRect(rdata.mx,rdata.my,2,2);

    //圆形
    /*bg_ctx.beginPath();
    bg_ctx.arc(rdata.mx,rdata.my,3,0,360);
    bg_ctx.fillStyle = rdata.fillStyle;
    bg_ctx.fill();
    bg_ctx.closePath();*/
  }
}

function initVars(){
  pi=Math.PI;
  ctx=canvas.getContext("2d");
  canvas.width=canvas.clientWidth;
  canvas.height=canvas.clientHeight;
  cx=canvas.width/2;
  cy=canvas.height/2;
  playerZ=-25;
  playerX=playerY=playerVX=playerVY=playerVZ=pitch=yaw=pitchV=yawV=0;
  scale=600;
  seedTimer=0;seedInterval=5,seedLife=100;gravity=.02;
  seeds=new Array();
  sparkPics=new Array();
  host = ''; //'../prize';
  for(i=1;i<=10;++i){
    sparkPic=new Image();
    sparkPic.src=host+"/img/spark"+i+".png";
    sparkPics.push(sparkPic);
  }
  sparks=new Array();
  pow1=new Audio(host+"/audio/pow1.ogg");
  pow2=new Audio(host+"/audio/pow2.ogg");
  pow3=new Audio(host+"/audio/pow3.ogg");
  pow4=new Audio(host+"/audio/pow4.ogg");
  frames = 0;
}

function rasterizePoint(x,y,z){
  var p,d;
  x-=playerX;
  y-=playerY;
  z-=playerZ;
  p=Math.atan2(x,z);
  d=Math.sqrt(x*x+z*z);
  x=Math.sin(p-yaw)*d;
  z=Math.cos(p-yaw)*d;
  p=Math.atan2(y,z);
  d=Math.sqrt(y*y+z*z);
  y=Math.sin(p-pitch)*d;
  z=Math.cos(p-pitch)*d;
  var rx1=-1000,ry1=1,rx2=1000,ry2=1,rx3=0,ry3=0,rx4=x,ry4=z,uc=(ry4-ry3)*(rx2-rx1)-(rx4-rx3)*(ry2-ry1);
  if(!uc) return {x:0,y:0,d:-1};
  var ua=((rx4-rx3)*(ry1-ry3)-(ry4-ry3)*(rx1-rx3))/uc;
  var ub=((rx2-rx1)*(ry1-ry3)-(ry2-ry1)*(rx1-rx3))/uc;
  if(!z)z=.000000001;
  if(ua>0&&ua<1&&ub>0&&ub<1){
    return {
      x:cx+(rx1+ua*(rx2-rx1))*scale,
      y:cy+y/z*scale,
      d:Math.sqrt(x*x+y*y+z*z)
    };
  }else{
    return {
      x:cx+(rx1+ua*(rx2-rx1))*scale,
      y:cy+y/z*scale,
      d:-1
    };
  }
}

function spawnSeed(){
  seed=new Object();
  seed.x=-50+Math.random()*100;
  seed.y=25;
  seed.z=-50+Math.random()*100;
  seed.vx=.1-Math.random()*.2;
  seed.vy=-1.5;//*(1+Math.random()/2);
  seed.vz=.1-Math.random()*.2;
  seed.born=frames;
  seeds.push(seed);
}

function splode(x,y,z){
  t=5+parseInt(Math.random()*150);
  sparkV=1+Math.random()*2.5;
  type=parseInt(Math.random()*3);
  switch(type){
    case 0:
      pic1=parseInt(Math.random()*10);
      break;
    case 1:
      pic1=parseInt(Math.random()*10);
      do{ pic2=parseInt(Math.random()*10); }while(pic2==pic1);
      break;
    case 2:
      pic1=parseInt(Math.random()*10);
      do{ pic2=parseInt(Math.random()*10); }while(pic2==pic1);
      do{ pic3=parseInt(Math.random()*10); }while(pic3==pic1 || pic3==pic2);
      break;
  }
  for(m=1;m<t;++m){
    spark=new Object();
    spark.x=x; spark.y=y; spark.z=z;
    p1=pi*2*Math.random();
    p2=pi*Math.random();
    v=sparkV*(1+Math.random()/6)
    spark.vx=Math.sin(p1)*Math.sin(p2)*v;
    spark.vz=Math.cos(p1)*Math.sin(p2)*v;
    spark.vy=Math.cos(p2)*v;
    switch(type){
      case 0: spark.img=sparkPics[pic1]; break;
      case 1:
        spark.img=sparkPics[parseInt(Math.random()*2)?pic1:pic2];
        break;
      case 2:
        switch(parseInt(Math.random()*3)){
          case 0: spark.img=sparkPics[pic1]; break;
          case 1: spark.img=sparkPics[pic2]; break;
          case 2: spark.img=sparkPics[pic3]; break;
        }
        break;
    }
    spark.radius=25+Math.random()*50;
    spark.alpha=1;
    spark.trail=new Array();
    sparks.push(spark);
  }
  switch(parseInt(Math.random()*4)){
    case 0:	pow=new Audio(host+"/audio/pow1.ogg"); break;
    case 1:	pow=new Audio(host+"/audio/pow2.ogg"); break;
    case 2:	pow=new Audio(host+"/audio/pow3.ogg"); break;
    case 3:	pow=new Audio(host+"/audio/pow4.ogg"); break;
  }
  d=Math.sqrt((x-playerX)*(x-playerX)+(y-playerY)*(y-playerY)+(z-playerZ)*(z-playerZ));
  pow.volume=1.5/(1+d/10);
  pow.play();
}

function doLogic(){
  if(seedTimer<frames){
    seedTimer=frames+seedInterval*Math.random()*10;
    spawnSeed();
  }
  for(i=0;i<seeds.length;++i){
    seeds[i].vy+=gravity;
    seeds[i].x+=seeds[i].vx;
    seeds[i].y+=seeds[i].vy;
    seeds[i].z+=seeds[i].vz;
    if(frames-seeds[i].born>seedLife){
      splode(seeds[i].x,seeds[i].y,seeds[i].z);
      seeds.splice(i,1);
    }
  }
  for(i=0;i<sparks.length;++i){
    if(sparks[i].alpha>0 && sparks[i].radius>5){
      sparks[i].alpha-=.01;
      sparks[i].radius/=1.02;
      sparks[i].vy+=gravity;
      point=new Object();
      point.x=sparks[i].x;
      point.y=sparks[i].y;
      point.z=sparks[i].z;
      if(sparks[i].trail.length){
        x=sparks[i].trail[sparks[i].trail.length-1].x;
        y=sparks[i].trail[sparks[i].trail.length-1].y;
        z=sparks[i].trail[sparks[i].trail.length-1].z;
        d=((point.x-x)*(point.x-x)+(point.y-y)*(point.y-y)+(point.z-z)*(point.z-z));
        if(d>9){
          sparks[i].trail.push(point);
        }
      }else{
        sparks[i].trail.push(point);
      }
      if(sparks[i].trail.length>5)sparks[i].trail.splice(0,1);
      sparks[i].x+=sparks[i].vx;
      sparks[i].y+=sparks[i].vy;
      sparks[i].z+=sparks[i].vz;
      sparks[i].vx/=1.075;
      sparks[i].vy/=1.075;
      sparks[i].vz/=1.075;
    }else{
      sparks.splice(i,1);
    }
  }
  p=Math.atan2(playerX,playerZ);
  d=Math.sqrt(playerX*playerX+playerZ*playerZ);
  d+=Math.sin(frames/80)/1.25;
  t=Math.sin(frames/200)/40;
  playerX=Math.sin(p+t)*d;
  playerZ=Math.cos(p+t)*d;
  yaw=pi+p+t;
}

function rgb(col){
  var r = parseInt((0.5+Math.sin(col)*0.5)*16);
  var g = parseInt((0.5+Math.cos(col)*0.5)*16);
  var b = parseInt((0.5-Math.sin(col)*0.5)*16);
  return "#"+r.toString(16)+g.toString(16)+b.toString(16);
}

function draw(){
  ctx.clearRect(0,0,cx*2,cy*2);
  ctx.fillStyle="#ff8";
  ctx.globalAlpha=1;
  for(i=0;i<seeds.length;++i){
    point=rasterizePoint(seeds[i].x,seeds[i].y,seeds[i].z);
    if(point.d!=-1){
      size=200/(1+point.d);
      ctx.fillRect(point.x-size/2,point.y-size/2,size,size);
    }
  }
  point1=new Object();
  for(i=0;i<sparks.length;++i){
    point=rasterizePoint(sparks[i].x,sparks[i].y,sparks[i].z);
    if(point.d!=-1){
      size=sparks[i].radius*200/(1+point.d);
      if(sparks[i].alpha<0)sparks[i].alpha=0;
      if(sparks[i].trail.length){
        point1.x=point.x;
        point1.y=point.y;
        switch(sparks[i].img){
          case sparkPics[0]:ctx.strokeStyle="#f84";break;
          case sparkPics[1]:ctx.strokeStyle="#84f";break;
          case sparkPics[2]:ctx.strokeStyle="#8ff";break;
          case sparkPics[3]:ctx.strokeStyle="#fff";break;
          case sparkPics[4]:ctx.strokeStyle="#4f8";break;
          case sparkPics[5]:ctx.strokeStyle="#f44";break;
          case sparkPics[6]:ctx.strokeStyle="#f84";break;
          case sparkPics[7]:ctx.strokeStyle="#84f";break;
          case sparkPics[8]:ctx.strokeStyle="#fff";break;
          case sparkPics[9]:ctx.strokeStyle="#44f";break;
        }
        for(j=sparks[i].trail.length-1;j>=0;--j){
          point2=rasterizePoint(sparks[i].trail[j].x,sparks[i].trail[j].y,sparks[i].trail[j].z);
          if(point2.d!=-1){
            ctx.globalAlpha=j/sparks[i].trail.length*sparks[i].alpha/2;
            ctx.beginPath();
            ctx.moveTo(point1.x,point1.y);
            ctx.lineWidth=1+sparks[i].radius*10/(sparks[i].trail.length-j)/(1+point2.d);
            ctx.lineTo(point2.x,point2.y);
            ctx.stroke();
            point1.x=point2.x;
            point1.y=point2.y;
          }
        }
      }
      ctx.globalAlpha=sparks[i].alpha;
      ctx.drawImage(sparks[i].img,point.x-size/2,point.y-size/2,size,size);
    }
  }
}

function frame(){
  if(frames>100000){
    seedTimer=0;
    frames=0;
  }
  frames++;
  draw();
  doLogic();
  requestAnimationFrame(frame);
}

window.addEventListener("resize",function(){
  bg_canvas.width=canvas.clientWidth;
  bg_canvas.height=canvas.clientHeight;
  bx = parseInt(bg_canvas.width / 2 - img.width / 2);
  by = parseInt(bg_canvas.height / 2 - img.height / 2);
  canvas.width=canvas.clientWidth;
  canvas.height=canvas.clientHeight;
  cx=canvas.width/2;
  cy=canvas.height/2;
});

var index = 0;
var ul = document.getElementById('btn-ul');
var len = ul.children.length;
var width = ul.children[0].clientWidth;

function left(){
  if(index > 0) index--;
  arrow();
}

function right(){
  if(index < len - 1) index++;
  arrow();
}

function arrow(){
  ul.style.marginLeft = -index * width + 'px';
}


Array.prototype.removeByValue = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) {
      this.splice(i, 1);
    }
  }
}
//frame();
window.onload = function(){
  initVars();
  pDraw();
  setTimeout(function(){
    calculate(img);
  },2000);
  setTimeout(function(){
    calculate(img3);
    setTimeout(function(){
      calculate(img2);
      setTimeout(function(){
        calculate(img1);
        setTimeout(function(){
          calculate(img0);
          setTimeout(function(){
            window.cancelAnimationFrame(stopD);
            bg_canvas.remove();
            frame();
          },5000);
        },5000);
      },5000);
    },5000);
  },8000);

  document.getElementById('btnt').addEventListener('click',function(){prize(this,2)},false);
  document.getElementById('btnx').addEventListener('click',function(){prize(this,1)},false);
  document.getElementById('btnb').addEventListener('click',function(){prize(this)},false);
  document.getElementById('btn1').addEventListener('click',function(){prize(this,3)},false);
  document.getElementById('btn2').addEventListener('click',function(){prize(this,10)},false);
  document.getElementById('btn3').addEventListener('click',function(){prize(this,15)},false);
  document.getElementById('btn4').addEventListener('click',function(){prize(this,20)},false);
  document.getElementById('stop').addEventListener('click',function(){stop()},false);

  document.getElementById('list-btn').addEventListener('click',function(){
    document.getElementById('prize-container').setAttribute('class','active');
  },false);
  document.getElementById('prize-bg').addEventListener('click',function(){
    document.getElementById('prize-container').removeAttribute('class');
  },false);

  var arr = [];
  for (var i = 1; i <= 76; i++) {
    i < 10 ? i = '00' + i : (i < 99 ? i = '0' + i : i = '' + i);
    arr.push(i);
  }

  var li = '';
  for(var i = 0; i <= 9; i++){
    li += '<li>' + i + '</li>';
  }
  li = '<div><ul>' + li + '</ul></div>';
  li = li + '' + li + '' + li;
  li = '<li>' + li + '</li>';

  //抽奖
  var pz = [];
  function prize(el,n) {
    pz = [];
    var ul = '';
    var pli = '';
    el.setAttribute('disabled','disabled');
    if(!n){
      arr.forEach(function(ae){
        pz.push(ae);
        ul += li;
        pli += '<li>' + ae + '</li>';
      })
      localStorage.setItem('特别奖',pz);
      document.getElementById('pb').innerHTML = pli;
      document.getElementById('btnx').setAttribute('disabled','disabled');
    }else{
      for (var j = 0; j < n; j++) {
        var len = arr.length - 1;
        var ai = Math.round(Math.random() * len);
        pz.push(arr[ai]);
        ul += li;
        pli += '<li>' + arr[ai] + '</li>';
        arr.removeByValue(arr[ai]);
      }
    }

    if(n == 1){
      localStorage.setItem('幸运奖',pz);
      document.getElementById('px').innerHTML = pli;
    }else if(n == 2){
      localStorage.setItem('特等奖',pz);
      document.getElementById('pt').innerHTML = pli;
    }else if(n == 3){
      localStorage.setItem('一等奖',pz);
      document.getElementById('p1').innerHTML = pli;
    }else if(n == 10){
      localStorage.setItem('二等奖',pz);
      document.getElementById('p2').innerHTML = pli;
    }else if(n == 15){
      localStorage.setItem('三等奖',pz);
      document.getElementById('p3').innerHTML = pli;
    }else if(n == 20){
      localStorage.setItem('四等奖',pz);
      document.getElementById('p4').innerHTML = pli;
    }
    document.getElementById('prize-ul').innerHTML = ul;
    document.getElementById('stop').style.display = 'block';
  }

  //停止
  function stop(){
    pz.forEach(function(el,index){
      var li_id = document.getElementById('prize-ul').children[index];
      for(var i = 0; i < el.length; i++){
        li_id.children[i].children[0].setAttribute('class','num' + el[i]);
      }
    });
    document.getElementById('stop').style.display = 'none';
  }
}
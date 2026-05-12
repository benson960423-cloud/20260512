let capture;
let faceMesh;
let faces = [];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML5 video 元件，只在畫布上顯示
  capture.hide();

  // 初始化 FaceMesh 模型 (ml5 v1.0.0+ 語法)
  if (typeof ml5 !== 'undefined') {
    faceMesh = ml5.faceMesh(capture, { maxFaces: 1, refineLandmarks: false, flipHorizontal: false }, () => {
      console.log("Model Ready");
      // 開始偵測
      faceMesh.detectStart(capture, (results) => {
        faces = results;
      });
    });
  }
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算影像顯示的寬度與高度 (整個畫布的 50%)
  let videoW = width * 0.5;
  let videoH = height * 0.5;

  // --- 顯示文字部分 ---
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, BOTTOM); // 文字水平置中，基準線在底部
  // 顯示在畫布中間，且高度位於影像上方 (影像頂部座標為 height/2 - videoH/2)
  text("教科414730894", width / 2, height / 2 - videoH / 2 - 20);

  // --- 顯示影像部分 (含鏡像處理) ---
  push();
  // 將座標原點移至畫布中心
  translate(width / 2, height / 2);
  // 進行左右翻轉 (水平縮放 -1)
  scale(-1, 1);
  // 設定影像繪製模式為置中
  imageMode(CENTER);
  // 繪製影像，寬高為畫布的 50%
  image(capture, 0, 0, videoW, videoH);

  // 繪製耳環 (辨識耳垂部分)
  if (faces.length > 0) {
    let face = faces[0];
    // FaceMesh 關鍵點：162 是左耳垂底部，389 是右耳垂底部
    let earIndices = [162, 389]; 
    
    earIndices.forEach(idx => {
      let kp = face.keypoints[idx];
      // 將原始影像座標映射到畫布影像區塊的座標系統中 (相對於中心的座標)
      let x = map(kp.x, 0, capture.width, -videoW / 2, videoW / 2);
      let y = map(kp.y, 0, capture.height, -videoH / 2, videoH / 2);
      
      fill(255, 255, 0); // 黃色
      noStroke();
      // 由耳垂位置往下顯示三個圓圈
      for (let i = 1; i <= 3; i++) {
        ellipse(x, y + (i * videoH * 0.05), videoW * 0.02, videoW * 0.02);
      }
    });
  }
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

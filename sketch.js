let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let accImages = [];
let currentAccIndex = -1; // 預設不顯示，直到偵測到手勢

function preload() {
  // 預載入 5 張耳環圖片
  accImages[0] = loadImage('pic/acc/acc1_ring.png');
  accImages[1] = loadImage('pic/acc/acc2_pearl.png');
  accImages[2] = loadImage('pic/acc/acc3_tassel.png');
  accImages[3] = loadImage('pic/acc/acc4_jade.png');
  accImages[4] = loadImage('pic/acc/acc5_phoenix.png');
}

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
      console.log("FaceMesh Ready");
      // 開始偵測
      faceMesh.detectStart(capture, (results) => {
        faces = results;
      });
    });

    // 初始化 HandPose 模型
    handPose = ml5.handPose(capture, { flipHorizontal: false }, () => {
      console.log("HandPose Ready");
      handPose.detectStart(capture, (results) => {
        hands = results;
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

  // --- 手勢辨識邏輯 ---
  if (hands.length > 0) {
    let hand = hands[0];
    let count = 0;

    // 檢查四根手指是否伸直 (食指、中指、無名指、小指)
    // 節點索引：食指(8 vs 6), 中指(12 vs 10), 無名指(16 vs 14), 小指(20 vs 18)
    let fingerTips = [8, 12, 16, 20];
    let fingerPips = [6, 10, 14, 18];
    for (let i = 0; i < fingerTips.length; i++) {
      if (hand.keypoints[fingerTips[i]].y < hand.keypoints[fingerPips[i]].y) {
        count++;
      }
    }
    // 大拇指邏輯 (簡單判斷水平距離)
    let thumbTip = hand.keypoints[4];
    let thumbIp = hand.keypoints[3];
    if (Math.abs(thumbTip.x - thumbIp.x) > 15) count++;

    if (count >= 1 && count <= 5) {
      currentAccIndex = count - 1;
    }
  }

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

  // 繪製耳環圖片
  if (faces.length > 0 && currentAccIndex !== -1) {
    let face = faces[0];
    // 使用更底部的特徵點：150 為右耳垂底，379 為左耳垂底
    let earIndices = [150, 379]; 
    let img = accImages[currentAccIndex];
    
    earIndices.forEach(idx => {
      let kp = face.keypoints[idx];
      let x = map(kp.x, 0, capture.width, -videoW / 2, videoW / 2);
      let y = map(kp.y, 0, capture.height, -videoH / 2, videoH / 2);
      
      // 設定圖片大小比率 (稍微放大至 12% 讓視覺更清楚)
      let imgW = videoH * 0.12;
      let imgH = imgW * (img.height / img.width);

      // 往外移動比率: 配合鏡像翻轉，150(右耳)增加 X 往畫面右移，379(左耳)減少 X 往畫面左移
      let xOffset = (idx === 150) ? videoW * 0.02 : -videoW * 0.02;
      
      // 往下移動：因為 imageMode(CENTER)，位移 imgH * 0.5 會讓圖片頂端剛好掛在特徵點上
      let yOffset = imgH * 0.5;

      image(img, x + xOffset, y + yOffset, imgW, imgH);
    });
  }
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

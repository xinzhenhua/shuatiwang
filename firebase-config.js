// Firebase配置
// 您的Firebase配置信息
const firebaseConfig = {
  apiKey: "AIzaSyDOOfq22P541C-EUJrV2BBNp4Yz8AInd28",
  authDomain: "shuatiwang-c9a46.firebaseapp.com",
  projectId: "shuatiwang-c9a46",
  storageBucket: "shuatiwang-c9a46.firebasestorage.app",
  messagingSenderId: "519164237074",
  appId: "1:519164237074:web:6622283b933e9a780ccfcb"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 从云端加载题库
async function loadQuestionsFromCloud() {
  try {
    const doc = await db.collection("题库").doc("default").get();
    
    if (doc.exists) {
      // 更新全局题库变量
      const cloudData = doc.data().data || {};
      
      // 使用全局变量questionsData而非window.questionsData
      Object.assign(questionsData, cloudData);
      
      // 更新本地存储
      localStorage.setItem('questionsData', JSON.stringify(questionsData));
      
      // 刷新界面
      console.log("题库已从云端加载");
      showStatus("题库已从云端加载", "success");
      
      // 确保updateSelectOptions函数存在
      if (typeof updateSelectOptions === 'function') {
        updateSelectOptions();
      } else {
        // 如果函数不存在，则尝试刷新页面显示
        loadYears && loadYears();
      }
      
      return true;
    } else {
      showStatus("云端尚未保存题库", "info");
      return false;
    }
  } catch (error) {
    console.error("加载题库失败:", error);
    showStatus("加载题库失败: " + error.message, "error");
    return false;
  }
}

// 保存题库到云端
async function saveQuestionsToCloud() {
  try {
    // 确保能获取到全局questionsData变量
    if (typeof questionsData === 'undefined') {
      console.error("questionsData未定义");
      showStatus("保存失败：无法获取题库数据", "error");
      return false;
    }
    
    await db.collection("题库").doc("default").set({
      data: questionsData,
      lastUpdated: new Date().toISOString()
    });
    
    console.log("题库已成功保存到云端");
    showStatus("题库已成功保存到云端", "success");
    return true;
  } catch (error) {
    console.error("保存题库失败:", error);
    showStatus("保存题库失败: " + error.message, "error");
    return false;
  }
}

// 初始化时尝试加载云端数据
document.addEventListener('DOMContentLoaded', function() {
  // 如果本地没有数据，则尝试从云端加载
  if (typeof questionsData !== 'undefined' && Object.keys(questionsData).length === 0) {
    loadQuestionsFromCloud();
  }
});

// 显示状态信息的通用函数
function showStatus(message, type) {
  console.log("状态提示:", message, type);
  
  // 检查是否在导入Modal中
  const importStatus = document.getElementById('importStatus');
  if (importStatus && importStatus.parentElement && !importStatus.parentElement.closest('.hidden')) {
    importStatus.textContent = message;
    importStatus.className = 'import-status ' + type;
    return;
  }
  
  // 如果不在导入Modal中，创建临时提示
  const statusDiv = document.createElement('div');
  statusDiv.textContent = message;
  statusDiv.className = 'floating-status ' + type;
  document.body.appendChild(statusDiv);
  
  // 确保提示在视口中可见
  statusDiv.style.zIndex = "9999";
  
  setTimeout(() => {
    statusDiv.remove();
  }, 3000);
} 
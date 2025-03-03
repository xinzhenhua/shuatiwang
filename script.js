// DOM元素引用
const yearSelect = document.getElementById('yearSelect');
const subjectSelect = document.getElementById('subjectSelect');
const chapterSelect = document.getElementById('chapterSelect');
const wrongQuestionsBtn = document.getElementById('wrongQuestionsBtn');
const resetBtn = document.getElementById('resetBtn');

const startScreen = document.getElementById('startScreen');
const questionScreen = document.getElementById('questionScreen');
const resultsScreen = document.getElementById('resultsScreen');

const questionType = document.getElementById('questionType');
const questionNumber = document.getElementById('questionNumber');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const questionContent = document.getElementById('questionContent');
const optionsContainer = document.getElementById('optionsContainer');
const judgementContainer = document.getElementById('judgementContainer');
const feedbackContainer = document.getElementById('feedbackContainer');
const feedbackContent = document.getElementById('feedbackContent');
const nextBtn = document.getElementById('nextBtn');

const scoreInfo = document.getElementById('scoreInfo');
const wrongQuestionsSummary = document.getElementById('wrongQuestionsSummary');
const restartBtn = document.getElementById('restartBtn');
const reviewWrongBtn = document.getElementById('reviewWrongBtn');
const continueBtn = document.getElementById('continueBtn');

// 应用状态
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let isWrongQuestionsMode = false;

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-sjmikhgtxmxikffnkynboftinvrxzwrhtvubrfcvxwtwvwgs';
const DEEPSEEK_MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
const DEEPSEEK_API_URL = 'https://siliconflow.cn/v1/chat/completions';

// 当前题目变量，用于解析
let currentQuestion = null;

// 初始化应用
function initializeApp() {
    loadYears();
    setupEventListeners();
    checkPreviousSession();
}

// 检查是否有上次未完成的答题记录
function checkPreviousSession() {
    const savedSession = JSON.parse(localStorage.getItem('quizSession')) || null;
    
    if (savedSession && savedSession.currentQuestionIndex < savedSession.totalQuestions) {
        // 有未完成的答题记录，显示继续按钮
        continueBtn.classList.remove('hidden');
    } else {
        // 没有未完成的答题记录，隐藏继续按钮
        continueBtn.classList.add('hidden');
    }
}

// 加载年份选项
function loadYears() {
    const years = Object.keys(questionsData);
    yearSelect.innerHTML = '<option value="">选择年份</option>';
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
    });
}

// 加载科目选项
function loadSubjects(year) {
    const subjects = Object.keys(questionsData[year] || {});
    subjectSelect.innerHTML = '<option value="">选择科目</option>';
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

// 加载章节选项
function loadChapters(year, subject) {
    const chapters = Object.keys(questionsData[year]?.[subject] || {});
    chapterSelect.innerHTML = '<option value="">选择章节</option>';
    
    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter;
        option.textContent = chapter;
        chapterSelect.appendChild(option);
    });
}

// 为updateSelectOptions添加的辅助函数
function updateSubjectSelect(year) {
    const subjects = Object.keys(questionsData[year] || {});
    subjectSelect.innerHTML = '<option value="">选择科目</option>';
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

// 为updateSelectOptions添加的辅助函数
function updateChapterSelect(year, subject) {
    const chapters = Object.keys(questionsData[year]?.[subject] || {});
    chapterSelect.innerHTML = '<option value="">选择章节</option>';
    
    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter;
        option.textContent = chapter;
        chapterSelect.appendChild(option);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 年份选择变更
    yearSelect.addEventListener('change', function() {
        loadSubjects(this.value);
        subjectSelect.value = '';
        chapterSelect.innerHTML = '<option value="">选择章节</option>';
    });
    
    // 科目选择变更
    subjectSelect.addEventListener('change', function() {
        if (yearSelect.value && subjectSelect.value) {
            loadChapters(yearSelect.value, this.value);
        }
    });
    
    // 章节选择完成后的开始按钮
    chapterSelect.addEventListener('change', function() {
        if (this.value !== '') {
            startQuiz();
        }
    });
    
    // 错题本按钮
    wrongQuestionsBtn.addEventListener('click', function() {
        startWrongQuestionsMode();
    });
    
    // 重置按钮
    resetBtn.addEventListener('click', function() {
        resetApp();
    });
    
    // 下一题按钮
    nextBtn.addEventListener('click', function() {
        goToNextQuestion();
    });
    
    // 结果页面上的重新开始按钮
    restartBtn.addEventListener('click', function() {
        resetApp();
    });
    
    // 复习错题按钮
    reviewWrongBtn.addEventListener('click', function() {
        startWrongQuestionsMode();
    });
    
    // 返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            resetApp();
        });
    }
    
    // 继续上次答题按钮
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            resumeLastSession();
        });
    }
    
    // 添加面包屑菜单点击事件
    const moreOptionsBtn = document.getElementById('moreOptionsBtn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (moreOptionsBtn) {
        moreOptionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 清除其他可能存在的弹出菜单
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            
            // 显示下拉菜单
            dropdownMenu.classList.toggle('show');
            
            // 更新按钮文本（改变箭头方向）
            if (dropdownMenu.classList.contains('show')) {
                moreOptionsBtn.innerHTML = moreOptionsBtn.innerHTML.replace('▼', '▲');
            } else {
                moreOptionsBtn.innerHTML = moreOptionsBtn.innerHTML.replace('▲', '▼');
            }
        });
        
        // 为下拉菜单中的每个按钮添加点击事件，点击后自动关闭菜单
        const menuButtons = dropdownMenu.querySelectorAll('button');
        menuButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 关闭菜单
                dropdownMenu.classList.remove('show');
                
                // 恢复按钮文本
                moreOptionsBtn.innerHTML = moreOptionsBtn.innerHTML.replace('▲', '▼');
            });
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!moreOptionsBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                moreOptionsBtn.innerHTML = moreOptionsBtn.innerHTML.replace('▲', '▼');
            }
        });
    }
    
    // 添加对解析按钮的事件监听
    document.getElementById('explainBtn').addEventListener('click', getQuestionExplanation);
}

// 启动测验
function startQuiz() {
    isWrongQuestionsMode = false;
    
    // 获取选中的题目
    currentQuestions = questionsData[yearSelect.value][subjectSelect.value][chapterSelect.value];
    currentQuestionIndex = 0;
    userAnswers = {};
    
    // 保存当前的选择到localStorage
    saveSessionInfo();
    
    // 显示问题页面
    showScreen(questionScreen);
    
    // 加载第一个问题
    loadQuestion(currentQuestionIndex);
}

// 保存当前会话信息到localStorage
function saveSessionInfo() {
    const sessionInfo = {
        isWrongQuestionsMode: isWrongQuestionsMode,
        currentQuestionIndex: currentQuestionIndex,
        totalQuestions: currentQuestions.length,
        userAnswers: userAnswers,
        year: yearSelect.value,
        subject: subjectSelect.value,
        chapter: chapterSelect.value
    };
    
    localStorage.setItem('quizSession', JSON.stringify(sessionInfo));
}

// 恢复上次的答题会话
function resumeLastSession() {
    const savedSession = JSON.parse(localStorage.getItem('quizSession')) || null;
    
    if (!savedSession) {
        alert('没有找到上次的答题记录');
        return;
    }
    
    // 恢复之前的答题模式
    isWrongQuestionsMode = savedSession.isWrongQuestionsMode;
    
    if (isWrongQuestionsMode) {
        // 错题本模式
        const savedWrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions')) || [];
        
        if (savedWrongQuestions.length === 0) {
            alert('错题本中暂无题目');
            return;
        }
        
        currentQuestions = savedWrongQuestions;
        
        // 更新筛选器UI
        yearSelect.value = '';
        subjectSelect.innerHTML = '<option value="">错题本模式</option>';
        chapterSelect.innerHTML = '<option value="">错题本模式</option>';
    } else {
        // 普通答题模式
        if (!savedSession.year || !savedSession.subject || !savedSession.chapter) {
            alert('上次的答题记录不完整，无法恢复');
            return;
        }
        
        // 恢复选择器状态
        yearSelect.value = savedSession.year;
        loadSubjects(savedSession.year);
        subjectSelect.value = savedSession.subject;
        loadChapters(savedSession.year, savedSession.subject);
        chapterSelect.value = savedSession.chapter;
        
        // 获取题目
        currentQuestions = questionsData[savedSession.year][savedSession.subject][savedSession.chapter];
    }
    
    // 恢复问题索引和用户答案
    currentQuestionIndex = savedSession.currentQuestionIndex;
    userAnswers = savedSession.userAnswers || {};
    
    // 显示问题页面
    showScreen(questionScreen);
    
    // 加载当前问题
    loadQuestion(currentQuestionIndex);
}

// 启动错题本模式
function startWrongQuestionsMode() {
    isWrongQuestionsMode = true;
    
    // 从localStorage获取错题
    const savedWrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions')) || [];
    
    if (savedWrongQuestions.length === 0) {
        alert('错题本中暂无题目');
        return;
    }
    
    currentQuestions = savedWrongQuestions;
    currentQuestionIndex = 0;
    userAnswers = {};
    
    // 更新筛选器UI
    yearSelect.value = '';
    subjectSelect.innerHTML = '<option value="">错题本模式</option>';
    chapterSelect.innerHTML = '<option value="">错题本模式</option>';
    
    // 显示问题页面
    showScreen(questionScreen);
    
    // 加载第一个问题
    loadQuestion(currentQuestionIndex);
}

// 清除所有反馈状态
function clearFeedbackState() {
    // 清除选项上的状态类
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // 清除判断按钮上的状态类
    const trueBtn = document.getElementById('trueBtn');
    const falseBtn = document.getElementById('falseBtn');
    if (trueBtn) trueBtn.classList.remove('correct', 'incorrect');
    if (falseBtn) falseBtn.classList.remove('correct', 'incorrect');
    
    // 隐藏反馈容器
    feedbackContainer.classList.remove('active');
    feedbackContainer.classList.add('hidden');
    feedbackContent.className = '';
    feedbackContent.textContent = '';
    
    // 隐藏解析按钮和解析内容
    document.getElementById('explainBtn').classList.add('hidden');
    document.getElementById('explanationContainer').classList.add('hidden');
    document.getElementById('explanationContainer').innerHTML = '';
}

// 加载问题
function loadQuestion(index) {
    const question = currentQuestions[index];
    
    // 清除之前的反馈状态
    clearFeedbackState();
    
    // 更新问题信息
    switch(question.type) {
        case 'single':
            questionType.textContent = '单选题';
            break;
        case 'multiple':
            questionType.textContent = '多选题';
            break;
        case 'judgment':
            questionType.textContent = '判断题';
            break;
    }
    
    questionNumber.textContent = `第 ${index + 1} 题，共 ${currentQuestions.length} 题`;
    progressText.textContent = `${index + 1}/${currentQuestions.length}`;
    progressFill.style.width = `${((index + 1) / currentQuestions.length) * 100}%`;
    
    // 更新标题信息
    const questionTitle = document.getElementById('questionTitle');
    if (questionTitle) {
        if (isWrongQuestionsMode) {
            questionTitle.textContent = "错题本练习";
        } else {
            const year = yearSelect.value;
            const subject = subjectSelect.value;
            const chapter = chapterSelect.value;
            questionTitle.textContent = `${year} ${subject} ${chapter}`;
        }
    }
    
    // 设置问题内容
    questionContent.textContent = question.content;
    
    // 清除之前的选项和状态
    optionsContainer.innerHTML = '';
    
    // 重置所有容器状态
    optionsContainer.classList.add('hidden');
    optionsContainer.classList.remove('active');
    judgementContainer.classList.add('hidden');
    judgementContainer.classList.remove('active');
    
    // 根据题目类型显示不同的选项界面
    if (question.type === 'single' || question.type === 'multiple') {
        // 选择题和多选题只显示选项容器
        optionsContainer.classList.remove('hidden');
        optionsContainer.classList.add('active');
        
        // 创建选项
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.optionId = option.id;
            optionElement.textContent = `${option.id}. ${option.text}`;
            
            // 添加点击事件
            optionElement.addEventListener('click', () => {
                if (feedbackContainer.classList.contains('active')) return;
                
                if (question.type === 'single') {
                    // 单选题：取消其他已选项
                    document.querySelectorAll('.option.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    optionElement.classList.add('selected');
                    userAnswers[question.id] = option.id;
                    checkAnswer();
                } else {
                    // 多选题：切换该选项的选中状态
                    optionElement.classList.toggle('selected');
                    
                    // 收集所有选中的选项
                    const selectedOptions = Array.from(document.querySelectorAll('.option.selected'))
                        .map(el => el.dataset.optionId);
                    
                    userAnswers[question.id] = selectedOptions;
                    
                    // 如果有选项被选中，显示检查按钮
                    if (selectedOptions.length > 0 && !document.getElementById('checkMultipleBtn')) {
                        const checkBtn = document.createElement('button');
                        checkBtn.id = 'checkMultipleBtn';
                        checkBtn.textContent = '确认答案';
                        checkBtn.addEventListener('click', checkAnswer);
                        optionsContainer.appendChild(checkBtn);
                    } else if (selectedOptions.length === 0 && document.getElementById('checkMultipleBtn')) {
                        document.getElementById('checkMultipleBtn').remove();
                    }
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
    } else if (question.type === 'judgment') {
        // 判断题只显示判断按钮
        judgementContainer.classList.remove('hidden');
        judgementContainer.classList.add('active');
        
        // 清除之前的事件监听
        const trueBtn = document.getElementById('trueBtn');
        const falseBtn = document.getElementById('falseBtn');
        
        // 复制然后替换元素以删除所有事件监听器
        const newTrueBtn = trueBtn.cloneNode(true);
        const newFalseBtn = falseBtn.cloneNode(true);
        trueBtn.parentNode.replaceChild(newTrueBtn, trueBtn);
        falseBtn.parentNode.replaceChild(newFalseBtn, falseBtn);
        
        // 添加新的事件监听器
        newTrueBtn.addEventListener('click', () => {
            if (feedbackContainer.classList.contains('active')) return;
            userAnswers[question.id] = true;
            checkAnswer();
        });
        
        newFalseBtn.addEventListener('click', () => {
            if (feedbackContainer.classList.contains('active')) return;
            userAnswers[question.id] = false;
            checkAnswer();
        });
    }
    
    // 保存当前题目供后续使用
    currentQuestion = question;
    currentQuestionIndex = index;
}

// 检查答案
function checkAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    
    feedbackContent.innerHTML = '';
    
    if (question.type === 'single') {
        isCorrect = userAnswer === question.answer;
        
        // 只标记用户选择的选项是对还是错，不显示正确答案
        document.querySelectorAll('.option').forEach(option => {
            const optionId = option.dataset.optionId;
            
            // 只标记用户选择的选项
            if (optionId === userAnswer) {
                if (isCorrect) {
                    option.classList.add('correct');
                } else {
                    option.classList.add('incorrect');
                }
            }
        });
        
    } else if (question.type === 'multiple') {
        // 多选题：检查用户的选择是否与答案完全匹配
        const sortedUserAnswer = [...userAnswer].sort();
        const sortedCorrectAnswer = [...question.answer].sort();
        isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
        
        // 只标记用户选择的选项是对还是错，不显示其他正确选项
        document.querySelectorAll('.option').forEach(option => {
            const optionId = option.dataset.optionId;
            
            // 只标记用户选中的选项
            if (userAnswer.includes(optionId)) {
                if (question.answer.includes(optionId)) {
                    option.classList.add('correct'); // 正确选中
                } else {
                    option.classList.add('incorrect'); // 错误选中
                }
            }
        });
        
        // 移除检查按钮
        if (document.getElementById('checkMultipleBtn')) {
            document.getElementById('checkMultipleBtn').remove();
        }
        
    } else if (question.type === 'judgment') {
        isCorrect = userAnswer === question.answer;
        
        // 标记判断题按钮
        const trueBtn = document.getElementById('trueBtn');
        const falseBtn = document.getElementById('falseBtn');
        
        if (question.answer === true) {
            trueBtn.classList.add('correct');
            if (userAnswer === false) {
                falseBtn.classList.add('incorrect');
            }
        } else {
            falseBtn.classList.add('correct');
            if (userAnswer === true) {
                trueBtn.classList.add('incorrect');
            }
        }
    }
    
    // 更新错题本
    if (!isCorrect) {
        addToWrongQuestions(question);
    } else if (isWrongQuestionsMode) {
        // 如果在错题本模式中答对了，从错题本中移除
        removeFromWrongQuestions(question.id);
    }
    
    // 显示反馈
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.classList.add('active');
    
    if (isCorrect) {
        feedbackContent.textContent = '回答正确！' + question.explanation;
        feedbackContent.className = 'correct';
    } else {
        feedbackContent.textContent = '回答错误。' + question.explanation;
        feedbackContent.className = 'incorrect';
    }
    
    // 保存当前会话信息
    saveSessionInfo();
    
    // 如果是最后一题，则显示"完成"按钮
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.textContent = '查看结果';
    } else {
        nextBtn.textContent = '下一题';
    }
    
    // 在答案检查后显示解析按钮
    document.getElementById('explainBtn').classList.remove('hidden');
}

// 将问题添加到错题本
function addToWrongQuestions(question) {
    // 从本地存储中获取现有错题本
    let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions')) || [];
    
    // 检查是否已在错题本中
    const existingIndex = wrongQuestions.findIndex(q => q.id === question.id);
    
    if (existingIndex === -1) {
        // 不在错题本中，添加
        wrongQuestions.push(question);
        localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
    }
}

// 从错题本中移除题目
function removeFromWrongQuestions(questionId) {
    let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions')) || [];
    wrongQuestions = wrongQuestions.filter(q => q.id !== questionId);
    localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
    
    // 更新当前问题列表（如果在错题本模式下）
    if (isWrongQuestionsMode) {
        currentQuestions = wrongQuestions;
    }
}

// 前往下一个问题
function goToNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
        
        // 保存当前会话信息
        saveSessionInfo();
    } else {
        showResults();
        
        // 清除会话信息，因为已完成
        localStorage.removeItem('quizSession');
    }
}

// 显示结果
function showResults() {
    // 计算分数
    let correctCount = 0;
    
    currentQuestions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        
        if (question.type === 'single' || question.type === 'judgment') {
            if (userAnswer === question.answer) correctCount++;
        } else if (question.type === 'multiple') {
            const sortedUserAnswer = [...userAnswer].sort();
            const sortedCorrectAnswer = [...question.answer].sort();
            if (JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer)) {
                correctCount++;
            }
        }
    });
    
    const percentage = Math.round((correctCount / currentQuestions.length) * 100);
    
    // 显示分数信息
    scoreInfo.innerHTML = `
        <h3>得分情况</h3>
        <p>总题数: ${currentQuestions.length}</p>
        <p>正确: ${correctCount}</p>
        <p>错误: ${currentQuestions.length - correctCount}</p>
        <p>正确率: ${percentage}%</p>
    `;
    
    // 显示错题摘要
    const wrongQuestionsIds = currentQuestions
        .filter(question => {
            const userAnswer = userAnswers[question.id];
            
            if (question.type === 'single' || question.type === 'judgment') {
                return userAnswer !== question.answer;
            } else if (question.type === 'multiple') {
                const sortedUserAnswer = [...userAnswer].sort();
                const sortedCorrectAnswer = [...question.answer].sort();
                return JSON.stringify(sortedUserAnswer) !== JSON.stringify(sortedCorrectAnswer);
            }
            
            return false;
        })
        .map(q => q.id);
    
    if (wrongQuestionsIds.length > 0) {
        wrongQuestionsSummary.innerHTML = '<h3>错题摘要</h3>';
        
        currentQuestions
            .filter(question => wrongQuestionsIds.includes(question.id))
            .forEach((question, index) => {
                const div = document.createElement('div');
                div.className = 'wrong-question-item';
                
                let questionTypeText = '';
                switch(question.type) {
                    case 'single': questionTypeText = '单选题'; break;
                    case 'multiple': questionTypeText = '多选题'; break;
                    case 'judgment': questionTypeText = '判断题'; break;
                }
                
                let answerText = '';
                if (question.type === 'single') {
                    answerText = `正确答案: ${question.answer}`;
                } else if (question.type === 'multiple') {
                    answerText = `正确答案: ${question.answer.join(', ')}`;
                } else if (question.type === 'judgment') {
                    answerText = `正确答案: ${question.answer ? '正确' : '错误'}`;
                }
                
                div.innerHTML = `
                    <p><strong>${index + 1}. [${questionTypeText}]</strong> ${question.content}</p>
                    <p class="wrong-answer">${answerText}</p>
                    <p class="explanation">${question.explanation}</p>
                `;
                
                wrongQuestionsSummary.appendChild(div);
            });
    } else {
        wrongQuestionsSummary.innerHTML = '<h3>恭喜你! 没有错题。</h3>';
    }
    
    // 显示结果页面
    showScreen(resultsScreen);
    
    // 清除会话信息，因为已完成
    localStorage.removeItem('quizSession');
}

// 显示指定的屏幕
function showScreen(screen) {
    startScreen.classList.remove('active');
    questionScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    startScreen.classList.add('hidden');
    questionScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
    screen.classList.add('active');
    
    // 根据屏幕类型显示或隐藏顶部模块
    const header = document.querySelector('header');
    if (screen === questionScreen) {
        // 答题模式隐藏顶部
        header.classList.add('hidden');
    } else {
        // 其他模式显示顶部
        header.classList.remove('hidden');
    }
}

// 重置应用
function resetApp() {
    yearSelect.value = '';
    subjectSelect.innerHTML = '<option value="">选择科目</option>';
    chapterSelect.innerHTML = '<option value="">选择章节</option>';
    
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
    isWrongQuestionsMode = false;
    
    showScreen(startScreen);
    
    // 检查是否存在上次的会话
    checkPreviousSession();
}

// 启动应用
window.addEventListener('DOMContentLoaded', initializeApp);

// 添加云同步按钮事件监听
document.addEventListener('DOMContentLoaded', function() {
    const cloudSaveBtn = document.getElementById('cloudSaveBtn');
    const cloudLoadBtn = document.getElementById('cloudLoadBtn');
    
    if (cloudSaveBtn) {
        cloudSaveBtn.addEventListener('click', function() {
            saveQuestionsToCloud();
        });
    }
    
    if (cloudLoadBtn) {
        cloudLoadBtn.addEventListener('click', function() {
            loadQuestionsFromCloud();
        });
    }
});

// 题库导入功能
document.addEventListener('DOMContentLoaded', function() {
    // 导入相关元素
    const importBtn = document.getElementById('importBtn');
    const importModal = document.getElementById('importModal');
    const closeBtn = document.querySelector('.close-btn');
    const importYear = document.getElementById('importYear');
    const newYearInput = document.getElementById('newYearInput');
    const importSubject = document.getElementById('importSubject');
    const newSubjectInput = document.getElementById('newSubjectInput');
    const importChapter = document.getElementById('importChapter');
    const importContent = document.getElementById('importContent');
    const parseBtn = document.getElementById('parseBtn');
    const previewBtn = document.getElementById('previewBtn');
    const importConfirmBtn = document.getElementById('importConfirmBtn');
    const importStatus = document.getElementById('importStatus');
    
    let parsedQuestions = [];
    
    // 打开导入弹窗
    importBtn.addEventListener('click', function() {
        importModal.classList.remove('hidden');
        loadExistingYears();
    });
    
    // 关闭导入弹窗
    closeBtn.addEventListener('click', function() {
        importModal.classList.add('hidden');
        resetImportForm();
    });
    
    // 年份选择变化事件
    importYear.addEventListener('change', function() {
        if (this.value === 'new') {
            newYearInput.classList.remove('hidden');
        } else {
            newYearInput.classList.add('hidden');
            loadSubjectsForYear(this.value);
        }
    });
    
    // 科目选择变化事件
    importSubject.addEventListener('change', function() {
        if (this.value === 'new') {
            newSubjectInput.classList.remove('hidden');
        } else {
            newSubjectInput.classList.add('hidden');
        }
    });
    
    // 加载已有年份
    function loadExistingYears() {
        // 保留默认选项和"新增年份"选项
        const defaultOptions = Array.from(importYear.options).filter(option => 
            option.value === '' || option.value === 'new'
        );
        
        importYear.innerHTML = '';
        defaultOptions.forEach(option => importYear.appendChild(option));
        
        // 从questionsData中获取年份
        for (const year in questionsData) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            importYear.appendChild(option);
        }
    }
    
    // 加载指定年份的科目
    function loadSubjectsForYear(year) {
        // 保留默认选项和"新增科目"选项
        const defaultOptions = Array.from(importSubject.options).filter(option => 
            option.value === '' || option.value === 'new'
        );
        
        importSubject.innerHTML = '';
        defaultOptions.forEach(option => importSubject.appendChild(option));
        
        // 如果年份存在，加载该年份的科目
        if (questionsData[year]) {
            for (const subject in questionsData[year]) {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                importSubject.appendChild(option);
            }
        }
    }
    
    // 解析按钮点击事件
    parseBtn.addEventListener('click', function() {
        const content = importContent.value.trim();
        if (!content) {
            showStatus('请粘贴题库内容', 'error');
            return;
        }
        
        try {
            parsedQuestions = parseQuestions(content);
            
            if (parsedQuestions.length > 0) {
                showStatus(`解析成功，共${parsedQuestions.length}道题目`, 'success');
                previewBtn.disabled = false;
                importConfirmBtn.disabled = false;
                
                // 添加预览容器
                if (!document.getElementById('previewContainer')) {
                    const previewContainer = document.createElement('div');
                    previewContainer.id = 'previewContainer';
                    previewContainer.innerHTML = '<h4>题目预览</h4>';
                    importStatus.parentNode.insertBefore(previewContainer, importStatus.nextSibling);
                }
            } else {
                showStatus('未能解析出任何题目，请检查格式', 'error');
                previewBtn.disabled = true;
                importConfirmBtn.disabled = true;
            }
        } catch (error) {
            showStatus(`解析错误: ${error.message}`, 'error');
            previewBtn.disabled = true;
            importConfirmBtn.disabled = true;
        }
    });
    
    // 预览按钮点击事件
    previewBtn.addEventListener('click', function() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;
        
        previewContainer.innerHTML = '<h4>题目预览</h4>';
        
        // 根据题目类型分类统计
        const stats = {
            single: 0,
            multiple: 0,
            judgment: 0,
            total: parsedQuestions.length
        };
        
        parsedQuestions.forEach(q => {
            stats[q.type]++;
        });
        
        // 添加统计信息
        const statsElem = document.createElement('div');
        statsElem.className = 'preview-stats';
        statsElem.innerHTML = `
            <p>共解析到 <strong>${stats.total}</strong> 道题目：</p>
            <ul>
                <li>单选题: ${stats.single} 道</li>
                <li>多选题: ${stats.multiple} 道</li>
                <li>判断题: ${stats.judgment} 道</li>
            </ul>
        `;
        previewContainer.appendChild(statsElem);
        
        // 最多显示5道题的预览
        const previewQuestions = parsedQuestions.slice(0, 5);
        
        previewQuestions.forEach((question, index) => {
            const questionElem = document.createElement('div');
            questionElem.className = 'preview-question';
            
            let questionHTML = `<strong>${index + 1}. [${getQuestionTypeName(question.type)}]</strong> ${question.content}<br>`;
            
            if (question.type === 'single' || question.type === 'multiple') {
                question.options.forEach(option => {
                    const isAnswer = question.type === 'single' 
                        ? question.answer === option.id
                        : question.answer.includes(option.id);
                    
                    const optionClass = isAnswer ? 'preview-correct-option' : '';
                    
                    questionHTML += `<span class="${optionClass}">${option.id}. ${option.text}</span><br>`;
                });
                
                questionHTML += `<strong>答案: ${Array.isArray(question.answer) ? question.answer.join(',') : question.answer}</strong>`;
            } else if (question.type === 'judgment') {
                questionHTML += `<strong>答案: ${question.answer ? '√ 正确' : '× 错误'}</strong>`;
            }
            
            questionElem.innerHTML = questionHTML;
            previewContainer.appendChild(questionElem);
        });
        
        if (parsedQuestions.length > 5) {
            const more = document.createElement('div');
            more.textContent = `...共有 ${parsedQuestions.length} 道题目，此处仅显示前5道`;
            previewContainer.appendChild(more);
        }
    });
    
    // 导入确认按钮点击事件
    importConfirmBtn.addEventListener('click', function() {
        // 获取所需的年份和科目
        let year = importYear.value;
        if (year === 'new') {
            year = newYearInput.value.trim();
            if (!year) {
                showStatus('请输入年份', 'error');
                return;
            }
        }
        
        let subject = importSubject.value;
        if (subject === 'new') {
            subject = newSubjectInput.value.trim();
            if (!subject) {
                showStatus('请输入科目名称', 'error');
                return;
            }
        }
        
        const chapter = importChapter.value.trim();
        if (!chapter) {
            showStatus('请输入章节名称', 'error');
            return;
        }
        
        // 将解析后的题目保存到题库
        importQuestionsToDatabase(year, subject, chapter, parsedQuestions);
        
        // 导入成功后自动保存到云端
        setTimeout(() => {
            if (typeof saveQuestionsToCloud === 'function') {
                saveQuestionsToCloud();
            }
        }, 1000);
    });
    
    // 将题目导入到题库
    function importQuestionsToDatabase(year, subject, chapter, questions) {
        // 初始化数据结构
        if (!questionsData[year]) {
            questionsData[year] = {};
        }
        
        if (!questionsData[year][subject]) {
            questionsData[year][subject] = {};
        }
        
        if (!questionsData[year][subject][chapter]) {
            questionsData[year][subject][chapter] = [];
        }
        
        // 生成唯一ID前缀
        const idPrefix = `${year}-${subject.replace(/\s+/g, '-')}-${chapter.replace(/\s+/g, '-')}`;
        
        // 添加ID
        questions.forEach((question, index) => {
            question.id = `${idPrefix}-${index + 1}`;
        });
        
        // 添加到题库
        questionsData[year][subject][chapter] = questionsData[year][subject][chapter].concat(questions);
        
        // 保存到localStorage
        localStorage.setItem('questionsData', JSON.stringify(questionsData));
        
        // 更新界面
        showStatus(`导入成功！共导入${questions.length}道题目`, 'success');
        
        // 更新选择器
        updateSelectOptions();
        
        // 3秒后关闭弹窗
        setTimeout(() => {
            importModal.classList.add('hidden');
            resetImportForm();
        }, 3000);
    }
    
    // 更新主界面下拉选项
    function updateSelectOptions() {
        // 更新年份下拉框
        const currentYearValue = yearSelect.value;
        yearSelect.innerHTML = '<option value="">选择年份</option>';
        for (const year in questionsData) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        
        // 如果之前选中的年份仍然存在，则保持选中
        if (currentYearValue && questionsData[currentYearValue]) {
            yearSelect.value = currentYearValue;
            
            // 更新科目下拉框
            const currentSubjectValue = subjectSelect.value;
            updateSubjectSelect(currentYearValue);
            
            // 如果之前选中的科目仍然存在，则保持选中
            if (currentSubjectValue && questionsData[currentYearValue][currentSubjectValue]) {
                subjectSelect.value = currentSubjectValue;
                
                // 更新章节下拉框
                const currentChapterValue = chapterSelect.value;
                updateChapterSelect(currentYearValue, currentSubjectValue);
                
                // 如果之前选中的章节仍然存在，则保持选中
                if (currentChapterValue && questionsData[currentYearValue][currentSubjectValue][currentChapterValue]) {
                    chapterSelect.value = currentChapterValue;
                }
            }
        }
    }
    
    // 解析题目内容
    function parseQuestions(content) {
        const questions = [];
        let currentType = '';
        let currentQuestion = null;
        
        // 去除多余空行
        const lines = content.split('\n').filter(line => line.trim());
        
        // 用于判断题目类型
        const typeMap = {
            '单项选择题': 'single',
            '多项选择题': 'multiple',
            '判断题': 'judgment'
        };
        
        // 分析每一行
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 判断是否是题型标题
            for (const type in typeMap) {
                if (line.includes(type)) {
                    currentType = typeMap[type];
                    break;
                }
            }
            
            // 判断是否是新题目
            const questionMatch = line.match(/^(\d+)[\.\、](.+)$/);
            if (questionMatch) {
                // 如果有上一道题，保存它
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
                // 创建新题目
                currentQuestion = {
                    type: currentType,
                    content: questionMatch[2].trim(),
                    options: []
                };
                
                // 如果是选择题，需要添加选项
                if (currentType === 'single' || currentType === 'multiple') {
                    // 查找选项
                    let j = i + 1;
                    while (j < lines.length) {
                        const optionLine = lines[j].trim();
                        const optionMatch = optionLine.match(/^([A-Z])[\.。\、](.+)$/);
                        
                        if (optionMatch) {
                            currentQuestion.options.push({
                                id: optionMatch[1],
                                text: optionMatch[2].trim()
                            });
                            j++;
                        } else {
                            break;
                        }
                    }
                    i = j - 1; // 调整外循环索引
                }
            }
            
            // 判断是否是参考答案
            if (line.startsWith('参考答案') || line.includes('正确答案')) {
                break;
            }
        }
        
        // 保存最后一道题目
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        
        // 查找答案
        const answerSection = content.substring(content.indexOf('参考答案') || content.indexOf('正确答案'));
        const answerLines = answerSection.split('\n').filter(line => line.trim());
        
        // 为每个题目找到答案
        questions.forEach((question, index) => {
            // 特别处理判断题，从参考答案部分查找
            if (question.type === 'judgment') {
                // 尝试多种格式匹配判断题答案
                const trueValues = ['√', 'T', 'TRUE', '正确'];
                const falseValues = ['×', 'F', 'FALSE', '错误'];
                
                for (let i = 0; i < answerLines.length; i++) {
                    const line = answerLines[i].trim();
                    
                    // 尝试匹配格式：序号.【正确答案】√/×
                    if (line.includes(`${index + 1}.【正确答案】`) || 
                        line.includes(`${index + 1}【正确答案】`) || 
                        line.includes(`${index + 1}.正确答案`) ||
                        line.startsWith(`${index + 1}.`)) {
                        
                        // 检查是否包含正确或错误的标志
                        if (trueValues.some(val => line.includes(val))) {
                            question.answer = true;
                            break;
                        } else if (falseValues.some(val => line.includes(val))) {
                            question.answer = false;
                            break;
                        }
                    }
                }
                
                // 如果仍然没找到答案，尝试查找整个答案部分
                if (question.answer === undefined) {
                    const answerPattern = new RegExp(`${index + 1}\\s*[\\.【\\(（]\\s*正确答案\\s*[\\)）】]\\s*([√×])`, 'i');
                    const answerMatch = answerSection.match(answerPattern);
                    
                    if (answerMatch) {
                        question.answer = trueValues.some(val => answerMatch[1].includes(val));
                    }
                }
            } 
            // 处理单选题答案
            else if (question.type === 'single') {
                for (let i = 0; i < answerLines.length; i++) {
                    const line = answerLines[i].trim();
                    
                    // 尝试匹配格式：序号.【正确答案】A
                    if ((line.includes(`${index + 1}.【正确答案】`) || 
                        line.includes(`${index + 1}【正确答案】`) ||
                        line.includes(`${index + 1}.正确答案`)) && 
                        line.match(/[A-D]$/)) {
                        
                        const answerMatch = line.match(/([A-D])$/);
                        if (answerMatch) {
                            question.answer = answerMatch[1];
                            break;
                        }
                    }
                }
                
                // 如果仍然没找到答案，尝试查找整个答案部分
                if (!question.answer) {
                    const regex = new RegExp(`${index + 1}\\s*[\\.【\\(（]\\s*正确答案\\s*[\\)）】]\\s*([A-D])`, 'i');
                    const match = answerSection.match(regex);
                    
                    if (match) {
                        question.answer = match[1];
                    }
                }
            }
            // 处理多选题答案 - 优化识别多种格式
            else if (question.type === 'multiple') {
                for (let i = 0; i < answerLines.length; i++) {
                    const line = answerLines[i].trim();
                    
                    // 尝试匹配格式：序号.【正确答案】ABC 或 序号.【正确答案】A,B,C
                    if (line.includes(`${index + 1}.【正确答案】`) || 
                        line.includes(`${index + 1}【正确答案】`) ||
                        line.includes(`${index + 1}.正确答案`) ||
                        line.startsWith(`${index + 1}.`)) {
                        
                        // 尝试匹配连续的大写字母（如ABC）
                        const directMatch = line.match(/([A-D]+)$/);
                        if (directMatch) {
                            question.answer = directMatch[1].split('');
                            break;
                        }
                        
                        // 尝试匹配逗号分隔的选项（如A,B,C）
                        const commaMatch = line.match(/([A-D](,[A-D])+)$/);
                        if (commaMatch) {
                            question.answer = commaMatch[1].split(',').map(a => a.trim());
                            break;
                        }
                    }
                }
                
                // 如果仍然没找到答案，尝试查找整个答案部分
                if (!question.answer || question.answer.length === 0) {
                    // 尝试匹配多种格式
                    // 1. 尝试连续大写字母格式 (如ABC)
                    const directRegex = new RegExp(`${index + 1}\\s*[\\.【\\(（]\\s*正确答案\\s*[\\)）】]\\s*([A-D]+)`, 'i');
                    const directMatch = answerSection.match(directRegex);
                    
                    if (directMatch) {
                        question.answer = directMatch[1].split('');
                    } else {
                        // 2. 尝试逗号分隔格式 (如A,B,C)
                        const commaRegex = new RegExp(`${index + 1}\\s*[\\.【\\(（]\\s*正确答案\\s*[\\)）】]\\s*([A-D](,[A-D])+)`, 'i');
                        const commaMatch = answerSection.match(commaRegex);
                        
                        if (commaMatch) {
                            question.answer = commaMatch[1].split(',').map(a => a.trim());
                        }
                    }
                }
            }
            
            // 为没有解释的题目添加空解释
            if (!question.explanation) {
                question.explanation = '';
            }
            
            // 确保每个问题都有answer属性
            if (question.answer === undefined) {
                console.warn(`题目 ${index + 1} 未找到答案`);
                if (question.type === 'single') {
                    question.answer = 'A';  // 默认A
                } else if (question.type === 'multiple') {
                    question.answer = ['A']; // 默认A
                } else if (question.type === 'judgment') {
                    question.answer = true; // 默认正确
                }
            }
        });
        
        return questions;
    }
    
    // 显示状态信息
    function showStatus(message, type) {
        importStatus.textContent = message;
        importStatus.className = 'import-status ' + type;
    }
    
    // 重置导入表单
    function resetImportForm() {
        importYear.value = '';
        newYearInput.value = '';
        newYearInput.classList.add('hidden');
        importSubject.value = '';
        newSubjectInput.value = '';
        newSubjectInput.classList.add('hidden');
        importChapter.value = '';
        importContent.value = '';
        importStatus.textContent = '';
        importStatus.className = 'import-status';
        previewBtn.disabled = true;
        importConfirmBtn.disabled = true;
        
        // 移除预览容器
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.remove();
        }
        
        parsedQuestions = [];
    }
    
    // 获取题目类型名称
    function getQuestionTypeName(type) {
        switch (type) {
            case 'single': return '单选题';
            case 'multiple': return '多选题';
            case 'judgment': return '判断题';
            default: return '未知类型';
        }
    }
});

// 添加导出/导入JSON功能
document.addEventListener('DOMContentLoaded', function() {
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importJsonBtn = document.getElementById('importJsonBtn');
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', function() {
            showExportModal();
        });
    }
    
    if (importJsonBtn) {
        importJsonBtn.addEventListener('click', function() {
            importQuestionsFromJson();
        });
    }
    
    // 导出模态框元素
    const exportModal = document.getElementById('exportModal');
    const exportScopeRadios = document.getElementsByName('exportScope');
    const exportYearContainer = document.getElementById('exportYearContainer');
    const exportSubjectContainer = document.getElementById('exportSubjectContainer');
    const exportChapterContainer = document.getElementById('exportChapterContainer');
    const exportYear = document.getElementById('exportYear');
    const exportSubject = document.getElementById('exportSubject');
    const exportChapter = document.getElementById('exportChapter');
    const exportConfirmBtn = document.getElementById('exportConfirmBtn');
    const exportCancelBtn = document.getElementById('exportCancelBtn');
    const exportStatus = document.getElementById('exportStatus');
    const exportModalCloseBtn = exportModal.querySelector('.close-btn');
    
    // 显示导出模态框
    function showExportModal() {
        // 确保有题库数据
        if (!questionsData || Object.keys(questionsData).length === 0) {
            showStatus('没有可导出的题库数据', 'error');
            return;
        }
        
        // 重置模态框状态
        resetExportModal();
        
        // 加载年份数据
        loadExportYears();
        
        // 显示模态框
        exportModal.classList.remove('hidden');
    }
    
    // 重置导出模态框
    function resetExportModal() {
        // 默认选择全部导出
        exportScopeRadios[0].checked = true;
        
        // 隐藏所有选择容器
        exportYearContainer.classList.add('hidden');
        exportSubjectContainer.classList.add('hidden');
        exportChapterContainer.classList.add('hidden');
        
        // 清空选择框
        exportYear.innerHTML = '<option value="">请选择年份</option>';
        exportSubject.innerHTML = '<option value="">请选择科目</option>';
        exportChapter.innerHTML = '<option value="">请选择章节</option>';
        
        // 清空状态
        exportStatus.innerHTML = '';
        exportStatus.className = 'export-status';
    }
    
    // 加载可导出的年份
    function loadExportYears() {
        // 清空旧选项
        exportYear.innerHTML = '<option value="">请选择年份</option>';
        
        // 添加新选项
        for (const year in questionsData) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            exportYear.appendChild(option);
        }
    }
    
    // 加载指定年份的科目
    function loadExportSubjects(year) {
        // 清空旧选项
        exportSubject.innerHTML = '<option value="">请选择科目</option>';
        
        // 如果没有选择年份，返回
        if (!year) return;
        
        // 添加新选项
        for (const subject in questionsData[year]) {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            exportSubject.appendChild(option);
        }
    }
    
    // 加载指定年份和科目的章节
    function loadExportChapters(year, subject) {
        // 清空旧选项
        exportChapter.innerHTML = '<option value="">请选择章节</option>';
        
        // 如果没有选择年份或科目，返回
        if (!year || !subject) return;
        
        // 添加新选项
        for (const chapter in questionsData[year][subject]) {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = chapter;
            exportChapter.appendChild(option);
        }
    }
    
    // 导出范围选择变化事件
    exportScopeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // 移除所有show类
            exportYearContainer.classList.remove('show');
            exportSubjectContainer.classList.remove('show');
            exportChapterContainer.classList.remove('show');
            
            // 添加hidden类
            exportYearContainer.classList.add('hidden');
            exportSubjectContainer.classList.add('hidden');
            exportChapterContainer.classList.add('hidden');
            
            // 根据选择显示对应容器
            switch(this.value) {
                case 'year':
                    exportYearContainer.classList.remove('hidden');
                    exportYearContainer.classList.add('show');
                    break;
                case 'subject':
                    exportYearContainer.classList.remove('hidden');
                    exportYearContainer.classList.add('show');
                    exportSubjectContainer.classList.remove('hidden');
                    exportSubjectContainer.classList.add('show');
                    break;
                case 'chapter':
                    exportYearContainer.classList.remove('hidden');
                    exportYearContainer.classList.add('show');
                    exportSubjectContainer.classList.remove('hidden');
                    exportSubjectContainer.classList.add('show');
                    exportChapterContainer.classList.remove('hidden');
                    exportChapterContainer.classList.add('show');
                    break;
            }
        });
    });
    
    // 年份选择变化事件
    exportYear.addEventListener('change', function() {
        loadExportSubjects(this.value);
        
        // 如果当前是按科目或章节导出，需要显示科目选择框
        const selectedScope = document.querySelector('input[name="exportScope"]:checked').value;
        if (selectedScope === 'subject' || selectedScope === 'chapter') {
            exportSubjectContainer.classList.remove('hidden');
            exportSubjectContainer.classList.add('show');
        }
    });
    
    // 科目选择变化事件
    exportSubject.addEventListener('change', function() {
        loadExportChapters(exportYear.value, this.value);
        
        // 如果当前是按章节导出，需要显示章节选择框
        const selectedScope = document.querySelector('input[name="exportScope"]:checked').value;
        if (selectedScope === 'chapter') {
            exportChapterContainer.classList.remove('hidden');
            exportChapterContainer.classList.add('show');
        }
    });
    
    // 关闭导出模态框
    exportModalCloseBtn.addEventListener('click', function() {
        exportModal.classList.add('hidden');
    });
    
    // 取消导出
    exportCancelBtn.addEventListener('click', function() {
        exportModal.classList.add('hidden');
    });
    
    // 确认导出
    exportConfirmBtn.addEventListener('click', function() {
        exportQuestionsToJson();
    });
});

// 导出题库为JSON文件
function exportQuestionsToJson() {
    const exportModal = document.getElementById('exportModal');
    const exportStatus = document.getElementById('exportStatus');
    
    // 获取导出范围
    const scope = document.querySelector('input[name="exportScope"]:checked').value;
    const year = document.getElementById('exportYear').value;
    const subject = document.getElementById('exportSubject').value;
    const chapter = document.getElementById('exportChapter').value;
    
    // 根据导出范围过滤数据
    let exportData = {};
    let fileName = '刷题王题库';
    
    try {
        switch(scope) {
            case 'all':
                exportData = questionsData;
                break;
            case 'year':
                if (!year) {
                    throw new Error('请选择要导出的年份');
                }
                exportData[year] = questionsData[year];
                fileName += `_${year}年`;
                break;
            case 'subject':
                if (!year || !subject) {
                    throw new Error('请选择要导出的年份和科目');
                }
                if (!exportData[year]) exportData[year] = {};
                exportData[year][subject] = questionsData[year][subject];
                fileName += `_${year}年_${subject}`;
                break;
            case 'chapter':
                if (!year || !subject || !chapter) {
                    throw new Error('请选择要导出的年份、科目和章节');
                }
                if (!exportData[year]) exportData[year] = {};
                if (!exportData[year][subject]) exportData[year][subject] = {};
                exportData[year][subject][chapter] = questionsData[year][subject][chapter];
                fileName += `_${year}年_${subject}_${chapter}`;
                break;
        }
        
        // 如果没有数据，提示错误
        if (Object.keys(exportData).length === 0) {
            throw new Error('没有符合条件的题库数据可导出');
        }
        
        // 创建导出数据字符串
        const exportDataStr = JSON.stringify(exportData, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([exportDataStr], { type: 'application/json' });
        
        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        
        // 获取当前日期作为文件名一部分
        const now = new Date();
        const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        
        // 设置文件名
        downloadLink.download = `${fileName}_${dateStr}.json`;
        
        // 触发下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // 清理
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
        
        // 显示成功信息
        exportStatus.textContent = '题库已成功导出为JSON文件';
        exportStatus.className = 'export-status success';
        
        // 3秒后关闭导出模态框
        setTimeout(() => {
            exportModal.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        // 显示错误信息
        exportStatus.textContent = error.message;
        exportStatus.className = 'export-status error';
    }
}

// 从JSON文件导入题库
function importQuestionsFromJson() {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // 添加文件选择事件
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (!file) {
            return;
        }
        
        // 创建文件读取器
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // 解析JSON数据
                const importedData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!importedData || typeof importedData !== 'object') {
                    throw new Error('无效的题库数据格式');
                }
                
                // 确认导入
                if (confirm('确定要导入此题库数据吗？\n这将合并到您现有的题库中，重复的年份/科目/章节会被合并。')) {
                    // 合并题库数据
                    mergeQuestionsData(importedData);
                    
                    // 刷新界面
                    loadYears();
                    
                    // 显示成功信息
                    showStatus('题库数据已成功导入', 'success');
                }
            } catch (error) {
                console.error('导入题库失败:', error);
                showStatus('导入题库失败: ' + error.message, 'error');
            }
        };
        
        reader.onerror = function() {
            showStatus('读取文件出错', 'error');
        };
        
        // 读取文件
        reader.readAsText(file);
    });
    
    // 触发文件选择
    fileInput.click();
}

// 合并题库数据
function mergeQuestionsData(importedData) {
    // 遍历导入的数据
    for (const year in importedData) {
        // 如果年份不存在，则创建
        if (!questionsData[year]) {
            questionsData[year] = {};
        }
        
        // 遍历科目
        for (const subject in importedData[year]) {
            // 如果科目不存在，则创建
            if (!questionsData[year][subject]) {
                questionsData[year][subject] = {};
            }
            
            // 遍历章节
            for (const chapter in importedData[year][subject]) {
                // 如果章节不存在，则创建
                if (!questionsData[year][subject][chapter]) {
                    questionsData[year][subject][chapter] = [];
                }
                
                // 获取已存在的题目ID列表
                const existingIds = questionsData[year][subject][chapter].map(q => q.id);
                
                // 添加非重复的题目
                importedData[year][subject][chapter].forEach(question => {
                    // 如果题目ID不存在，或者没有ID，则添加
                    if (!question.id || !existingIds.includes(question.id)) {
                        // 生成新ID如果需要
                        if (!question.id) {
                            const idPrefix = `${year}-${subject.replace(/\s+/g, '-')}-${chapter.replace(/\s+/g, '-')}`;
                            question.id = `${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                        }
                        
                        // 添加到题库
                        questionsData[year][subject][chapter].push(question);
                    }
                });
            }
        }
    }
    
    // 保存到localStorage
    localStorage.setItem('questionsData', JSON.stringify(questionsData));
}

// 获取题目解析
async function getQuestionExplanation() {
    const explainBtn = document.getElementById('explainBtn');
    const explanationContainer = document.getElementById('explanationContainer');
    
    // 如果没有当前题目，则返回
    if (!currentQuestion) {
        return;
    }
    
    // 显示加载状态
    explainBtn.disabled = true;
    explanationContainer.innerHTML = '<div class="explanation-title">正在生成解析...</div>';
    explanationContainer.classList.remove('hidden');
    explanationContainer.classList.add('loading');
    
    try {
        // 准备发送到API的提示
        let prompt = `解析这道题目的答案，省略推理过程，直接给出答案要点和关键知识点。\n\n`;
        prompt += `题目：${currentQuestion.content}\n`;
        
        // 根据题目类型添加不同内容
        if (currentQuestion.type === 'single' || currentQuestion.type === 'multiple') {
            prompt += '选项：\n';
            currentQuestion.options.forEach((option, index) => {
                prompt += `${String.fromCharCode(65 + index)}. ${option.text}\n`;
            });
            
            if (currentQuestion.type === 'single') {
                prompt += `\n正确答案：${String.fromCharCode(65 + currentQuestion.answer)}\n`;
            } else {
                const correctOptions = currentQuestion.answer.map(index => String.fromCharCode(65 + index)).join(', ');
                prompt += `\n正确答案：${correctOptions}\n`;
            }
        } else if (currentQuestion.type === 'judgment') {
            prompt += `\n正确答案：${currentQuestion.answer ? '正确' : '错误'}\n`;
        }
        
        prompt += `\n请简洁地解析答案，说明为什么这是正确答案，以及相关的知识点。`;
        
        // 调用DeepSeek API
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || '获取解析失败');
        }
        
        // 显示API返回的解析
        let explanation = data.choices && data.choices[0] && data.choices[0].message
            ? data.choices[0].message.content
            : '无法获取解析内容';
            
        explanationContainer.innerHTML = `
            <div class="explanation-title">答案解析：</div>
            <div class="explanation-content">${explanation.replace(/\n/g, '<br>')}</div>
        `;
    } catch (error) {
        console.error('获取解析失败:', error);
        explanationContainer.innerHTML = `
            <div class="explanation-title">解析获取失败</div>
            <div class="explanation-content">抱歉，无法获取答案解析。错误信息：${error.message}</div>
        `;
    } finally {
        // 恢复按钮状态和移除加载样式
        explainBtn.disabled = false;
        explanationContainer.classList.remove('loading');
    }
}

// 显示状态信息
function showStatus(message, type) {
    // 检查是否存在状态显示元素
    let statusEl = document.querySelector('.status-message');
    
    // 如果不存在，创建一个
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'status-message';
        document.body.appendChild(statusEl);
    }
    
    // 设置消息和类型
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    
    // 显示状态
    statusEl.style.display = 'block';
    
    // 3秒后隐藏
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
} 
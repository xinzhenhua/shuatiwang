// 题库数据结构示例
const questionsData = JSON.parse(localStorage.getItem('questionsData')) || {};

// 错题本数据结构
let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions')) || []; 
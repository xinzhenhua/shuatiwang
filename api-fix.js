// DeepSeek API修复脚本
document.addEventListener('DOMContentLoaded', function() {
    // 修改API URL为正确的地址
    window.DEEPSEEK_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
    window.DEEPSEEK_API_KEY = 'sk-sjmikhgtxmxikffnkynboftinvrxzwrhtvubrfcvxwtwvwgs';
    window.DEEPSEEK_MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
    
    // 重写getQuestionExplanation函数
    window.getQuestionExplanation = async function() {
        const explainBtn = document.getElementById('explainBtn');
        const explanationContainer = document.getElementById('explanationContainer');
        
        if (!currentQuestion) {
            return;
        }
        
        explainBtn.disabled = true;
        explanationContainer.innerHTML = '<div class="explanation-title">正在生成解析...</div>';
        explanationContainer.classList.remove('hidden');
        explanationContainer.classList.add('loading');
        
        try {
            let prompt = `解析这道题目的答案，请严格按照以下格式回复：\n\n正确答案：(写出正确选项或判断)\n原因：(简要说明为什么这是正确答案)\n知识要点：(列出相关知识点)\n\n`;
            prompt += `题目：${currentQuestion.content}\n`;
            
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
            
            prompt += `\n请严格按照"正确答案："、"原因："、"知识要点："的格式回复，不要使用其他格式。`;

            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: window.DEEPSEEK_MODEL,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    stream: false,
                    max_tokens: 1000,
                    stop: null,
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    frequency_penalty: 0.5,
                    n: 1,
                    response_format: {
                        type: "text"
                    }
                })
            };
            
            const response = await fetch(window.DEEPSEEK_API_URL, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || '获取解析失败');
            }
            
            let explanation = data.choices && data.choices[0] && data.choices[0].message
                ? data.choices[0].message.content
                : '无法获取解析内容';
            
            // 格式化文本
            explanation = explanation
                .replace(/\*\*/g, '') // 移除所有星号
                .replace(/^[\s\n]+|[\s\n]+$/g, '') // 移除开头和结尾的空白
                .replace(/正确答案：/g, '<strong style="color:#2c7be5">正确答案：</strong>')
                .replace(/原因：/g, '<strong style="color:#2c7be5">原因：</strong>')
                .replace(/知识要点：/g, '<strong style="color:#2c7be5">知识要点：</strong>');
                
            explanationContainer.innerHTML = `
                <div class="explanation-title">答案解析</div>
                <div class="explanation-content" style="line-height: 1.8; margin-top: 12px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">${explanation.replace(/\n/g, '<br>')}</div>
            `;
        } catch (error) {
            console.error('API调用失败:', error);
            explanationContainer.innerHTML = `
                <div class="explanation-title">解析获取失败</div>
                <div class="explanation-content">抱歉，无法获取答案解析。请检查网络连接。<br>错误信息：${error.message}</div>
            `;
        } finally {
            explainBtn.disabled = false;
            explanationContainer.classList.remove('loading');
        }
    };
    
    console.log('API修复已完成，使用最新的API格式');
});

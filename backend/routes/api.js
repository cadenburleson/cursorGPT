const express = require('express');
const router = express.Router();
const { BASE_PROMPT } = require('../config/prompts');
import('node-fetch').then(fetchModule => {
    global.fetch = fetchModule.default;
});

router.post('/chat', async (req, res) => {
    try {
        const { inputs } = req.body;

        console.log('Received inputs:', inputs);
        console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

        // Combine all inputs into a formatted string
        const userInputsFormatted = Object.entries(inputs)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        // Combine base prompt with user inputs
        const fullPrompt = `${BASE_PROMPT}\n${userInputsFormatted}`;

        console.log('Sending prompt to OpenAI...');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: fullPrompt
                }]
            })
        });

        console.log('OpenAI Response Status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI Error:', data);
            throw new Error(data.error?.message || 'OpenAI API error');
        }

        res.json({
            message: data.choices[0].message.content
        });
    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).json({
            message: `Server error: ${error.message}`
        });
    }
});

module.exports = router; 
async function handleSubmit() {
    // Get spinner element
    const spinner = document.getElementById('loadingSpinner');
    const submitButton = document.querySelector('button[type="submit"]');
    const responseDiv = document.getElementById('response');

    // Define the labels for each input
    const inputLabels = {
        input1: "My Skills and Background:",
        input2: "My Secondary Goal:",
        input3: "My Ideal Customer:",
        input4: "Additional Requirements:"
    };

    // Get input values and combine with labels
    const input1 = `${inputLabels.input1} ${document.getElementById('input1').value}`;
    const input2 = `${inputLabels.input2} ${document.getElementById('input2').value}`;
    const input3 = `${inputLabels.input3} ${document.getElementById('input3').value}`;
    const input4 = `${inputLabels.input4} ${document.getElementById('input4').value}`;

    try {
        // Show spinner, hide previous response, disable submit button
        spinner.classList.remove('hidden');
        responseDiv.innerHTML = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Generating...';

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    input1,
                    input2,
                    input3,
                    input4
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        responseDiv.innerHTML = marked.parse(data.message);
        responseDiv.className = 'markdown-response';
    } catch (error) {
        console.error('Error:', error);
        responseDiv.innerText =
            `Connection error: ${error.message}. Please ensure the server is running.`;
    } finally {
        // Hide spinner and restore button regardless of success/failure
        spinner.classList.add('hidden');
        submitButton.disabled = false;
        submitButton.textContent = 'Generate Business Ideas';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chatForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSubmit();
        });
    }
}); 
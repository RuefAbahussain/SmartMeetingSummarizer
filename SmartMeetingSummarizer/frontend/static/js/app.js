const audioFileInput = document.getElementById('audioFile');
const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

audioFileInput.addEventListener('change', (e) => {
    submitBtn.disabled = !e.target.files.length;
});

submitBtn.addEventListener('click', async () => {
    if (!audioFileInput.files.length) return;

    const file = audioFileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    loadingSpinner.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('transcriptText').textContent = data.transcript;
            // Summary is bullet points separated by newlines — render each on its own line
            const summaryEl = document.getElementById('summaryText');
            summaryEl.innerHTML = '';
            data.summary.split('\n').filter((line) => line.trim()).forEach((line) => {
                const p = document.createElement('p');
                p.textContent = line;
                summaryEl.appendChild(p);
            });
            loadingSpinner.classList.add('hidden');
            resultsSection.classList.remove('hidden');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        loadingSpinner.classList.add('hidden');
        errorSection.classList.remove('hidden');
    }
});

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy');
    });
}

function resetForm() {
    audioFileInput.value = '';
    submitBtn.disabled = true;
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

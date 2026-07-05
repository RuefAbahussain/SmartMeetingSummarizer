// Each provider maps to a LiteLLM model prefix, a list of models for the
// dropdown, and the page where a visitor gets their own API key.
// "custom" covers any other OpenAI-compatible provider via a Base URL.
const PROVIDERS = {
    openai: {
        prefix: 'openai/',
        models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
        getKeyUrl: 'https://platform.openai.com/api-keys',
        custom: false,
    },
    gemini: {
        prefix: 'gemini/',
        models: ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-pro'],
        getKeyUrl: 'https://aistudio.google.com/app/apikey',
        custom: false,
    },
    anthropic: {
        prefix: 'anthropic/',
        models: ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-1'],
        getKeyUrl: 'https://console.anthropic.com/settings/keys',
        custom: false,
    },
    mistral: {
        prefix: 'mistral/',
        models: ['mistral-large-latest', 'mistral-small-latest', 'open-mixtral-8x7b'],
        getKeyUrl: 'https://console.mistral.ai/api-keys',
        custom: false,
    },
    groq: {
        prefix: 'groq/',
        models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
        getKeyUrl: 'https://console.groq.com/keys',
        custom: false,
    },
    deepseek: {
        prefix: 'deepseek/',
        models: ['deepseek-chat', 'deepseek-reasoner'],
        getKeyUrl: 'https://platform.deepseek.com/api_keys',
        custom: false,
    },
    xai: {
        prefix: 'xai/',
        models: ['grok-4', 'grok-3', 'grok-3-mini'],
        getKeyUrl: 'https://console.x.ai',
        custom: false,
    },
    custom: {
        prefix: 'openai/', // OpenAI-compatible endpoint
        models: [],
        getKeyUrl: '',
        custom: true,
    },
};

// Credentials are kept in sessionStorage only: they persist across reloads in
// the same tab but are cleared when the tab closes, and are sent to the server
// only with each upload request (never stored server-side).
const STORAGE = {
    provider: 'sms_provider',
    apiKey: 'sms_apiKey',
    model: 'sms_model',
    baseUrl: 'sms_baseUrl',
};

const providerSelect = document.getElementById('provider');
const apiKeyInput = document.getElementById('apiKey');
const getKeyLink = document.getElementById('getKeyLink');
const baseUrlField = document.getElementById('baseUrlField');
const baseUrlInput = document.getElementById('baseUrl');
const modelSelect = document.getElementById('modelSelect');
const modelText = document.getElementById('modelText');

const audioFileInput = document.getElementById('audioFile');
const uploadDropzone = document.getElementById('uploadDropzone');
const filePreview = document.getElementById('filePreview');
const fileNameEl = document.getElementById('fileName');
const fileSizeEl = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFileBtn');

const submitBtn = document.getElementById('submitBtn');
const submitSpinner = document.getElementById('submitSpinner');
const submitLabel = document.getElementById('submitLabel');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const summaryEl = document.getElementById('summaryText');

function applyProvider(providerId) {
    const p = PROVIDERS[providerId];

    if (p.custom) {
        modelSelect.classList.add('hidden');
        modelText.classList.remove('hidden');
        baseUrlField.classList.remove('hidden');
        getKeyLink.classList.add('hidden');
    } else {
        modelText.classList.add('hidden');
        baseUrlField.classList.add('hidden');
        modelSelect.classList.remove('hidden');
        getKeyLink.classList.remove('hidden');
        getKeyLink.href = p.getKeyUrl;

        modelSelect.innerHTML = '';
        p.models.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            modelSelect.appendChild(opt);
        });
    }

    updateSubmitState();
}

// Bare model name currently chosen (from the dropdown or the custom text box).
function getBareModel() {
    return PROVIDERS[providerSelect.value].custom
        ? modelText.value.trim()
        : modelSelect.value;
}

// Fully-prefixed model string LiteLLM needs, e.g. "gemini/gemini-flash-latest".
function getModelString() {
    return PROVIDERS[providerSelect.value].prefix + getBareModel();
}

function updateSubmitState() {
    const isCustom = PROVIDERS[providerSelect.value].custom;
    const ready =
        audioFileInput.files.length > 0 &&
        apiKeyInput.value.trim() !== '' &&
        getBareModel() !== '' &&
        (!isCustom || baseUrlInput.value.trim() !== '');
    submitBtn.disabled = !ready;
}

function saveCredentials() {
    sessionStorage.setItem(STORAGE.provider, providerSelect.value);
    sessionStorage.setItem(STORAGE.apiKey, apiKeyInput.value);
    sessionStorage.setItem(STORAGE.model, getBareModel());
    sessionStorage.setItem(STORAGE.baseUrl, baseUrlInput.value);
}

function loadCredentials() {
    const savedProvider = sessionStorage.getItem(STORAGE.provider);
    if (savedProvider && PROVIDERS[savedProvider]) {
        providerSelect.value = savedProvider;
    }
    applyProvider(providerSelect.value);

    apiKeyInput.value = sessionStorage.getItem(STORAGE.apiKey) || '';
    baseUrlInput.value = sessionStorage.getItem(STORAGE.baseUrl) || '';

    const savedModel = sessionStorage.getItem(STORAGE.model);
    if (savedModel) {
        if (PROVIDERS[providerSelect.value].custom) {
            modelText.value = savedModel;
        } else {
            modelSelect.value = savedModel;
        }
    }

    updateSubmitState();
}

providerSelect.addEventListener('change', () => {
    applyProvider(providerSelect.value);
    saveCredentials();
});

[apiKeyInput, baseUrlInput, modelText].forEach((el) => {
    el.addEventListener('input', () => {
        saveCredentials();
        updateSubmitState();
    });
});

modelSelect.addEventListener('change', () => {
    saveCredentials();
    updateSubmitState();
});

// --- File selection: click-to-browse, drag-and-drop, and the preview card ---

function formatFileSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showFile(file) {
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatFileSize(file.size);
    uploadDropzone.classList.add('hidden');
    filePreview.classList.remove('hidden');
    updateSubmitState();
}

function clearFile() {
    audioFileInput.value = '';
    filePreview.classList.add('hidden');
    uploadDropzone.classList.remove('hidden');
    updateSubmitState();
}

audioFileInput.addEventListener('change', () => {
    if (audioFileInput.files.length) {
        showFile(audioFileInput.files[0]);
    }
});

uploadDropzone.addEventListener('click', () => audioFileInput.click());

uploadDropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audioFileInput.click();
    }
});

uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('dragging');
});

uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('dragging');
});

uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('dragging');
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!dropped) return;
    const dt = new DataTransfer();
    dt.items.add(dropped);
    audioFileInput.files = dt.files;
    showFile(dropped);
});

removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile();
});

// --- Submitting the audio file ---

function setProcessing(isProcessing) {
    submitSpinner.classList.toggle('hidden', !isProcessing);
    submitLabel.textContent = isProcessing ? 'Processing...' : 'Process Audio';
    submitBtn.disabled = isProcessing;
}

// Summary is bullet points separated by newlines — render each on its own line.
function renderSummary(summaryText) {
    summaryEl.innerHTML = '';
    summaryText.split('\n').filter((line) => line.trim()).forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        summaryEl.appendChild(p);
    });
}

submitBtn.addEventListener('click', async () => {
    if (!audioFileInput.files.length) return;

    const file = audioFileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKeyInput.value.trim());
    formData.append('model', getModelString());
    if (PROVIDERS[providerSelect.value].custom) {
        formData.append('base_url', baseUrlInput.value.trim());
    }

    setProcessing(true);
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
            renderSummary(data.summary);
            resultsSection.classList.remove('hidden');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorSection.classList.remove('hidden');
    } finally {
        setProcessing(false);
        updateSubmitState();
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
    // Clear only the file — saved credentials stay so the visitor need not retype.
    clearFile();
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

loadCredentials();


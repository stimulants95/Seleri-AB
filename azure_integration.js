/**
 * Seleri AI - Azure Integration Module
 * Handles communication with Azure Blob Storage and Azure AI Search.
 */

const SELERI_BLOB_PREFIX = 'seleri-docs/';

// Use secrets from secrets.js (local) or config.js (GitHub Pages fallback)
function getAzureConfig() {
    if (typeof SELERI_SECRETS !== 'undefined') {
        return SELERI_SECRETS.azure;
    } else if (typeof SELERI_CONFIG !== 'undefined') {
        return SELERI_CONFIG.azure;
    } else {
        console.error('No Azure configuration found!');
        return null;
    }
}

const AzureIntegration = {
    // Azure Storage Integration
    async uploadDocument(file) {
        console.log(`Starting upload for: ${file.name}`);

        const azureConfig = getAzureConfig();
        if (!azureConfig) {
            return { success: false, error: 'Azure configuration missing' };
        }

        const storageAccount = azureConfig.storageAccount.trim();
        const storageContainer = azureConfig.storageContainer.trim();
        let sasToken = (azureConfig.storageSasToken || "").trim();

        if (!sasToken) {
            console.warn("No SAS token found. Simulation mode active.");
            return new Promise(resolve => setTimeout(() => resolve({ success: true, name: file.name }), 2000));
        }

        if (!sasToken.startsWith('?')) sasToken = '?' + sasToken;

        const blobUrl = `https://${storageAccount}.blob.core.windows.net/${storageContainer}/${SELERI_BLOB_PREFIX}${encodeURIComponent(file.name)}${sasToken}`;

        try {
            const response = await fetch(blobUrl, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-ms-version': '2024-11-04',
                    'x-ms-date': new Date().toUTCString()
                },
                body: file
            });

            if (response.ok) {
                return { success: true, name: file.name };
            } else {
                const errorText = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(errorText, "application/xml");
                const azureMessage = xml.querySelector("Message") ? xml.querySelector("Message").textContent : "";

                throw new Error(`${response.status}: ${azureMessage || response.statusText}`);
            }
        } catch (error) {
            console.error("Azure Upload Error:", error);
            return { success: false, error: error.message };
        }
    },

    // List Documents from Azure Blob Storage
    async listDocuments() {
        const azureConfig = getAzureConfig();
        if (!azureConfig) return [];

        const { storageAccount, storageContainer, storageSasToken } = azureConfig;
        if (!storageSasToken) return [{ name: "Demo_Fil.pdf", size: "1 MB", date: "Idag", status: "Simulerad" }];

        const sasQuery = storageSasToken.startsWith('?') ? storageSasToken.replace('?', '&') : `&${storageSasToken}`;
        const url = `https://${storageAccount.trim()}.blob.core.windows.net/${storageContainer.trim()}?restype=container&comp=list&prefix=${SELERI_BLOB_PREFIX}${sasQuery}`;

        try {
            const response = await fetch(url, {
                headers: { 'x-ms-version': '2024-11-04' }
            });
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "application/xml");
            const blobs = Array.from(xml.querySelectorAll("Blob"));

            return blobs.map(blob => {
                const fullName = blob.querySelector("Name").textContent;
                const name = fullName.startsWith(SELERI_BLOB_PREFIX) ? fullName.slice(SELERI_BLOB_PREFIX.length) : fullName;
                const properties = blob.querySelector("Properties");
                const sizeBytes = parseInt(properties.querySelector("Content-Length").textContent);
                const size = (sizeBytes / (1024 * 1024)).toFixed(1) + " MB";
                const lastModified = new Date(properties.querySelector("Last-Modified").textContent).toLocaleDateString();
                return { name, fullName, size, date: lastModified, status: "Indexed" };
            });
        } catch (error) {
            return [];
        }
    },

    // Delete Document from Azure Blob Storage
    async deleteDocument(fileName) {
        const azureConfig = getAzureConfig();
        if (!azureConfig) {
            return { success: false, error: 'Azure configuration missing' };
        }

        const { storageAccount, storageContainer, storageSasToken } = azureConfig;
        if (!storageSasToken) {
            return { success: false, error: 'Ingen SAS-token konfigurerad' };
        }

        let sasToken = storageSasToken;
        if (!sasToken.startsWith('?')) sasToken = '?' + sasToken;

        const blobUrl = `https://${storageAccount.trim()}.blob.core.windows.net/${storageContainer.trim()}/${SELERI_BLOB_PREFIX}${encodeURIComponent(fileName)}${sasToken}`;

        try {
            // Step 1: Delete from Blob Storage
            const response = await fetch(blobUrl, {
                method: 'DELETE',
                headers: {
                    'x-ms-version': '2024-11-04',
                    'x-ms-date': new Date().toUTCString()
                }
            });

            if (!response.ok && response.status !== 202 && response.status !== 404) {
                const errorText = await response.text();
                throw new Error(`Blob delete failed: ${response.status}: ${errorText}`);
            }

            console.log(`✅ Deleted from Blob Storage: ${fileName}`);

            // Step 2: Delete from Azure AI Search (if configured)
            const searchResult = await this.deleteFromSearch(fileName);
            if (!searchResult.success) {
                console.warn(`⚠️ Could not delete from AI Search: ${searchResult.error}`);
                // Don't fail the whole operation if search delete fails
            } else {
                console.log(`✅ Deleted from AI Search: ${fileName}`);
            }

            return { success: true };
        } catch (error) {
            console.error("Azure Delete Error:", error);
            return { success: false, error: error.message };
        }
    },

    // Delete Document from Azure AI Search Index
    async deleteFromSearch(fileName) {
        const azureConfig = getAzureConfig();
        if (!azureConfig) {
            return { success: true, skipped: true };
        }

        const { searchEndpoint, searchIndex, searchApiKey } = azureConfig;

        // If AI Search not configured, skip silently
        if (!searchApiKey || !searchEndpoint || !searchIndex) {
            return { success: true, skipped: true };
        }

        const url = `${searchEndpoint}/indexes/${searchIndex}/docs/index?api-version=2023-11-01`;

        // Azure AI Search might use different ID formats:
        // Try multiple common patterns
        const possibleIds = [
            fileName,                                    // Just filename
            `seleri-docs/${fileName}`,                  // With prefix
            SELERI_BLOB_PREFIX + fileName,              // With prefix constant
            encodeURIComponent(fileName),               // URL encoded
            btoa(fileName)                              // Base64 encoded
        ];

        try {
            // Try to delete using all possible ID formats
            for (const docId of possibleIds) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': searchApiKey
                        },
                        body: JSON.stringify({
                            value: [{
                                "@search.action": "delete",
                                "id": docId
                            }]
                        })
                    });

                    if (response.ok) {
                        console.log(`✅ AI Search delete succeeded with ID: ${docId}`);
                        return { success: true };
                    }
                } catch (e) {
                    // Continue trying other ID formats
                    continue;
                }
            }

            // If all attempts failed, log warning but don't fail
            console.warn(`⚠️ Could not delete from AI Search. Tried IDs:`, possibleIds);
            return { success: false, error: 'Could not find document in search index' };
        } catch (error) {
            console.error("AI Search Delete Error:", error);
            return { success: false, error: error.message };
        }
    },

    // Fetch actual document content from Blob Storage
    async getDocumentContents() {
        const azureConfig = getAzureConfig();
        if (!azureConfig) return [];

        const { storageAccount, storageContainer, storageSasToken } = azureConfig;
        if (!storageSasToken) return [];

        try {
            const docs = await this.listDocuments();
            if (!docs || docs.length === 0) return [];

            const contents = [];
            for (const doc of docs) {
                try {
                    let sasToken = storageSasToken;
                    if (!sasToken.startsWith('?')) sasToken = '?' + sasToken;
                    const blobUrl = `https://${storageAccount.trim()}.blob.core.windows.net/${storageContainer.trim()}/${SELERI_BLOB_PREFIX}${encodeURIComponent(doc.name)}${sasToken}`;

                    const isPdf = doc.name.toLowerCase().endsWith('.pdf');

                    if (isPdf && typeof pdfjsLib !== 'undefined') {
                        // Parse PDF using PDF.js – extract text AND render pages as images
                        console.log(`Parsing PDF: ${doc.name}`);
                        const response = await fetch(blobUrl, {
                            headers: { 'x-ms-version': '2024-11-04' }
                        });
                        const arrayBuffer = await response.arrayBuffer();
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                        // Ensure global image registry exists
                        if (!window._pdfPageImages) window._pdfPageImages = {};

                        const docBaseName = doc.name.replace(/\.pdf$/i, '').replace(/\s+/g, '_');
                        let fullText = '';

                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);

                            // 1) Extract text
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');
                            fullText += pageText + '\n';

                            // 2) Render page to canvas → data URL
                            try {
                                const scale = 1.5;
                                const viewport = page.getViewport({ scale });
                                const canvas = document.createElement('canvas');
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                const ctx = canvas.getContext('2d');
                                await page.render({ canvasContext: ctx, viewport }).promise;

                                const imageId = `${docBaseName}_sida_${i}`;
                                window._pdfPageImages[imageId] = canvas.toDataURL('image/png');

                                // Insert image marker so the AI knows about this page image
                                fullText += `[Bild: ${imageId}]\n`;
                                console.log(`🖼️ Rendered page ${i} as image: ${imageId}`);
                            } catch (renderErr) {
                                console.warn(`Could not render page ${i} of ${doc.name}:`, renderErr);
                            }
                        }

                        if (fullText.trim().length > 0) {
                            contents.push(`--- Dokument: ${doc.name} ---\n${fullText.substring(0, 15000)}`);
                            console.log(`PDF parsed: ${doc.name} (${fullText.length} chars, ${pdf.numPages} pages, ${Object.keys(window._pdfPageImages).length} images)`);
                        }
                    } else {
                        // Try reading as text
                        const response = await fetch(blobUrl, {
                            headers: { 'x-ms-version': '2024-11-04' }
                        });
                        if (response.ok) {
                            const text = await response.text();
                            if (text && text.length > 0 && !text.includes('\u0000')) {
                                contents.push(`--- Dokument: ${doc.name} ---\n${text.substring(0, 15000)}`);
                                console.log(`Loaded: ${doc.name} (${text.length} chars)`);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Could not load:', doc.name, e);
                }
            }
            return contents;
        } catch (error) {
            console.error('Error fetching documents:', error);
            return [];
        }
    },


    async searchKnowledge(query) {
        // Try to get document contents directly from blob storage
        const docContents = await this.getDocumentContents();
        if (docContents.length > 0) return docContents;

        // Fallback: try Azure AI Search
        const azureConfig = getAzureConfig();
        if (!azureConfig) return [];

        const { searchEndpoint, searchIndex, searchApiKey } = azureConfig;
        if (!searchApiKey) return [];
        const url = `${searchEndpoint}/indexes/${searchIndex}/docs/search?api-version=2023-11-01`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': searchApiKey },
                body: JSON.stringify({ search: query, top: 3 })
            });
            const data = await response.json();
            return data.value.map(doc => doc.content);
        } catch (error) { return []; }
    },


    async generateAnswer(query, context) {
        const azureConfig = getAzureConfig();
        if (!azureConfig) {
            return { answer: "Azure configuration saknas.", usage: null };
        }

        const { openaiEndpoint, openaiKey, openaiDeployment } = azureConfig;
        if (!openaiKey) return { answer: "AI-nyckel saknas.", usage: null };
        const url = `${openaiEndpoint}/openai/deployments/${openaiDeployment}/chat/completions?api-version=2024-12-01-preview`;

        // Build system prompt from external config (system-prompt.js)
        let systemPrompt;
        if (context && context.length > 0) {
            systemPrompt = SELERI_SYSTEM_PROMPT.withDocuments(context.join('\n\n'));
        } else {
            systemPrompt = SELERI_SYSTEM_PROMPT.withoutDocuments;
        }


        try {
            const reqBody = {
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query }
                ]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': openaiKey },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenAI HTTP error:', response.status, errorText);
                return { answer: null, usage: null };
            }

            const data = await response.json();

            // Token usage tracking
            if (data.usage) {
                const u = data.usage;
                console.log(`📊 Token-användning: Prompt: ${u.prompt_tokens} | Svar: ${u.completion_tokens} | Totalt: ${u.total_tokens}`);
                this._lastUsage = u;
            }

            if (data.error) {
                console.error('OpenAI error:', data.error);
                return { answer: null, usage: null };
            }

            return {
                answer: data.choices[0].message.content,
                usage: data.usage || null
            };
        } catch (error) {
            console.error("Azure OpenAI Error:", error);
            return { answer: null, usage: null };
        }
    }


};

window.AzureIntegration = AzureIntegration;
if (typeof module !== 'undefined' && module.exports) { module.exports = AzureIntegration; }

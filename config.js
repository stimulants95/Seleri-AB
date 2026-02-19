// Seleri AB - Public Azure Configuration
// ⚠️ VARNING: Denna fil innehåller Azure API-nycklar och är PUBLIC på GitHub
// För produktion bör dessa lagras säkert i Azure Key Vault eller environment variables

const SELERI_CONFIG = {
    azure: {
        // Azure AI Search
        searchEndpoint: "https://azuresearch77777.search.windows.net",
        searchIndex: "seleri-ab-index",
        searchApiKey: "LcKegeIaDrWwufpDYQeBwUcNPmbE16gkdk95rsJX32AzSeB8vYky",
        vectorField: "seleri_vector",

        // Azure Blob Storage
        storageAccount: "azureblob133",
        storageContainer: "blobstorage",
        storageSasToken: "?sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2027-12-31T03:09:47Z&st=2026-02-17T18:54:47Z&spr=https&sig=j%2FdLk%2BCrXbYwZ3qzXwdX%2FZiitVSfXBvlrXiGz%2FXHcbc%3D",

        // Azure OpenAI
        openaiEndpoint: "https://admin-mlqzsq5o-francecentral.cognitiveservices.azure.com",
        openaiDeployment: "seleri-openai-5.1",
        openaiKey: "48AfVNq1y634JY8I2dLPKGGI0LpFsfq1MHFwxFeEFIpMudrsbELMJQQJ99CBAC5T7U2XJ3w3AAAAACOGsLhh"
    }
};

// Exportera för användning
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SELERI_CONFIG;
}

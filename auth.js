// Seleri AB - Public Authentication Configuration
// Detta är en PUBLIC fil för GitHub Pages deployment
// Innehåller endast användarkonton (inga API-nycklar)

const SELERI_AUTH = {
    customer: {
        username: "kund@seleri.se",
        password: "kund2026",
        role: "customer"
    },
    admin: {
        username: "admin@seleri.se",
        password: "admin2026",
        role: "admin"
    }
};

// Exportera för användning
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SELERI_AUTH;
}

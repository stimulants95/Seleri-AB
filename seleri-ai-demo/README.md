# SeleriAI Chatbot Demo

En interaktiv demo som visar hur en AI-chattbot skulle kunna integreras på Seleri AB's hemsida.

## 📁 Filer

- **login.html** - Inloggningssida
- **index.html** - Kundsida med chattbot
- **admin.html** - Admin-panel för dokumenthantering
- **styles.css** - Styling för båda sidorna
- **chatbot.js** - Chattbot-logik med demo-svar

## 🚀 Hur man kör demon

### Starta demon:
1. Öppna `login.html` i en webbläsare
2. Logga in med någon av följande:

**Kund-inloggning:**
- Användarnamn: `SeleriKund`
- Lösenord: `Seleri2026`
- Ger tillgång till: Kundsida med chattbot

**Admin-inloggning:**
- Användarnamn: `SeleriAdmin`
- Lösenord: `AdminSeleri2026`
- Ger tillgång till: Admin-panel

### Demo-frågor att testa:
- "Hur lägger jag upp ny medarbetare?"
- "Hur gör jag lönerevision?"
- "Vad kostar era tjänster?"
- "Hur bokar jag möte?"

## 🔧 Admin-panel

Från admin-panelen kan du:
- ✅ Ladda upp dokument (drag & drop)
- ✅ Ta bort dokument
- ✅ Justera session-gränser
- ✅ Ändra AI-inställningar
- ✅ Se statistik

## 🎯 Features

### Kundsida:
- Professionell Seleri-inspirerad design
- Floating chattbot-widget
- Session-limit (20 frågor)
- Varning vid 15 frågor
- Förprogrammerade demo-svar
- Responsiv design
- Autentisering krävs

### Admin-panel:
- Dokumenthantering med drag & drop
- Statistik-dashboard
- Inställningar för AI-modell
- Session-konfiguration
- Välkomstmeddelande-editor
- Logout-funktion

## 📊 Teknisk Info

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Inga externa dependencies
- SessionStorage för autentisering
- Fungerar offline

**Autentisering:**
- Kunder: `SeleriKund / Seleri2026`
- Admin: `SeleriAdmin / AdminSeleri2026`

**I produktion skulle systemet använda:**
- Azure OpenAI (GPT-5.1)
- Azure Blob Storage
- Azure Functions
- WordPress-integration

## 🎨 Design

Designen är inspirerad av Seleri AB's hemsida med:
- Lila/blå gradient-tema
- Modern glassmorphism
- Smooth animationer
- Professionell B2B-känsla

## 💡 Nästa steg för produktion

För att göra detta till en riktig produkt behövs:

1. **Backend:**
   - Azure OpenAI (GPT-5.1)
   - Azure Blob Storage för dokument
   - Azure Functions för API

2. **Autentisering:**
   - Säker session-hantering
   - Lösenordskryptering

3. **WordPress-integration:**
   - Custom plugin
   - Shortcode: `[seleri_ai_chat]`
   - Fungerar på både Agda OCH STOLTS hemsidor

4. **RAG-implementation:**
   - Dokumentsökning i uppladdade filer
   - Vektorisering av PDF/Word-dokument
   - Intelligent källhänvisning

## 📝 Anteckningar

Detta är en **statisk demo** för presentation. Alla svar är förprogrammerade och ingen data sparas.

---

**Skapad:** 2026-02-17  
**För:** Seleri AB presentation  
**Av:** Josef med Claude Sonnet

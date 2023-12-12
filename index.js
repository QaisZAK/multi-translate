const express = require("express");
const { Translate } = require("@google-cloud/translate").v2;
const cors = require('cors');
const path = require('path');
require("dotenv").config();

const app = express();
const translate = new Translate({ projectId: process.env.PROJECTID, key: process.env.APIKEY });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

// Translate the text into each supported language
app.post("/translate", async (req, res) => {
    const text = req.body.input;
    const languageType = req.body.languageType;
    // If no input text is provided, return an error
    if (!text) {
        return res.status(400).send({ error: "No input text provided" });
    }

    try {
        // Get the list of all supported languages
        const [languages] = await translate.getLanguages();

        // Translate the text into each language
        const translations = await Promise.all(languages.map(async (language) => {
            const [translation] = await translate.translate(text, language.code);
            if (req.body.languageType == "code") {
                return { language: language.code, translation, languageType: req.body.languageType };
            } else {
                return { language: language.name, translation, languageType: req.body.languageType };
            }
        }));

        res.send(translations);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT} | http://localhost:${PORT}/index.html`);
});

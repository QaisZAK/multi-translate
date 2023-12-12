let copyButton = document.getElementById("copy-button");
let includeLanguageNames = document.getElementById("include-language-names");
let translationsDiv = document.getElementById("translations");
let includeLanguageCodes = document.getElementById("include-language-codes");

let publicList = [];

document
    .getElementById("translate-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        const inputText = document.getElementById("input-text").value;
        // If the input is empty, do nothing
        if (inputText === "") {
            return;
        }

        // Generate the translations list
        generateTranslationsList();
    });

document
    .getElementById("copy-button")
    .addEventListener("click", async function () {
        let toCopy = "";
        // If includeLanguageNames is checked, add the language name
        if (includeLanguageNames.checked || includeLanguageCodes.checked) {
            toCopy = publicList
                .map((item) => `${item.language}: ${item.translation}`)
                .join("\n");
            // Otherwise, just add the translation
        } else {
            toCopy = publicList.map((item) => `${item.translation}`).join("\n");
        }

        // Copy the translations to the clipboard
        try {
            await navigator.clipboard.writeText(toCopy);
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = "Copy Translations";
            }, 2000);

            // If there is an error, disable the copy button
        } catch (error) {
            copyButton.textContent = "Failed to copy";
            copyButton.disabled = true;
            console.error("Error:", error);
        }
    });

function generateTranslationsList() {
    // Set the copy button to loading
    copyButton.disabled = true;
    copyButton.textContent = "Loading...";

    const inputText = document.getElementById("input-text").value;

    // Fetch the translations
    fetch("http://localhost:3000/translate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: inputText,
            languageType: includeLanguageCodes.checked ? "code" : "name" 
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            // Clear the translationsDiv
            translationsDiv.innerHTML = "";

            // Enable the copy button
            copyButton.disabled = data.length === 0;
            copyButton.textContent = "Copy Translations";

            // If there are no translations, display a message
            if (data.length === 0 || !data) {
                translationsDiv.innerHTML = "<p>No translations found</p>";
            }

            // Add the translations to the translationsDiv
            publicList = data;
            data.forEach((item) => {
                // If includeLanguageNames is checked, add the language name
                if (includeLanguageNames.checked || includeLanguageCodes.checked) {
                    translationsDiv.innerHTML += `<p>${item.language}: ${item.translation}</p>`;
                } else {
                    translationsDiv.innerHTML += `<p>${item.translation}</p>`;
                }
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// If includeLanguageNames is checked, uncheck includeLanguageCodes
function toggleCheckbox(id) {
    const otherCheckbox = document.getElementById(id);
    if (otherCheckbox.checked) {
        otherCheckbox.checked = false;
    }
}
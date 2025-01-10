function processInput() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText');

    // Regex pattern
    const regex = /^(.*?)\n(?:High|Critical|Medium|Low)\nLine (\d+) in (.*?)\n([\s\S]*?)View file/gm;
    let matches;
    let output = '';

    while ((matches = regex.exec(inputText)) !== null) {
        const filePath = matches[1].trim();
        const lineNumber = matches[2];
        const fileName = matches[3].trim();
        const codeSnippet = matches[4].trim();

        output += `Line ${lineNumber} ${filePath}/${fileName}\n\`${codeSnippet}\`\n\n`;
    }

    if (!output) {
        output = 'No matches found. Ensure input format is correct.';
    }

    outputText.textContent = output.trim();
}

function copyOutput() {
    const outputText = document.getElementById('outputText');
    navigator.clipboard.writeText(outputText.textContent)
        .then(() => alert('Output copied to clipboard!'))
        .catch(err => alert('Failed to copy output: ' + err));
}
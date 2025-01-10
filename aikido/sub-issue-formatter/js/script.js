function processInput() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText');

    const regex = /Line (\d+) in ([^\n]+)\n([^\n]+)/g;
    let matches;
    let output = '';

    while ((matches = regex.exec(inputText)) !== null) {
        const lineNumber = matches[1];
        const filePath = matches[2].trim();
        const codeSnippet = matches[3].trim();

        output += `Line ${lineNumber} ${filePath}\n${codeSnippet}\n\n`;
    }

    outputText.textContent = output.trim();
}
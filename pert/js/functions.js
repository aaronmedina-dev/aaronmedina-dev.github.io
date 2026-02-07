/*
 * PERT Estimate Calculator - App-specific logic
 * Shared utilities loaded from /assets/js/utils.js
 */

function addTask() {
    const tasksBody = document.getElementById('tasks-body');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" name="taskName" placeholder="Enter task name" required></td>
        <td>
            <select name="complexity">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
        </td>
        <td><input type="number" name="optimistic" placeholder="e.g. 2" required></td>
        <td><input type="number" name="likely" placeholder="e.g. 3" required></td>
        <td><input type="number" name="pessimistic" placeholder="e.g. 5" required></td>
        <td><button type="button" class="btn-danger btn-sm" onclick="removeTask(this)">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Remove
        </button></td>
    `;
    tasksBody.appendChild(row);
}

function removeTask(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}

function calculatePERT() {
    const tasks = document.querySelectorAll('#tasks-body tr');
    const timeUnit = document.getElementById('timeUnit').value;
    let totalPERT = 0;
    const resultBody = document.getElementById('result-body');
    resultBody.innerHTML = '';

    tasks.forEach(task => {
        const taskName = task.querySelector('[name="taskName"]').value;
        const complexity = task.querySelector('[name="complexity"]').value;
        const optimistic = parseFloat(task.querySelector('[name="optimistic"]').value);
        const likely = parseFloat(task.querySelector('[name="likely"]').value);
        const pessimistic = parseFloat(task.querySelector('[name="pessimistic"]').value);

        if (isNaN(optimistic) || isNaN(likely) || isNaN(pessimistic)) {
            alert('Please enter valid numbers for all estimates.');
            return;
        }

        let pertEstimate = (optimistic + 4 * likely + pessimistic) / 6;
        totalPERT += pertEstimate;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${taskName}</td>
            <td>${complexity}</td>
            <td>${optimistic} ${timeUnit}</td>
            <td>${likely} ${timeUnit}</td>
            <td>${pessimistic} ${timeUnit}</td>
            <td>${pertEstimate.toFixed(2)} ${timeUnit}</td>
        `;
        resultBody.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td colspan="5"><strong>Total PERT Estimate:</strong></td>
        <td><strong>${totalPERT.toFixed(2)} ${timeUnit}</strong></td>
    `;
    resultBody.appendChild(totalRow);
}

function saveTemplate() {
    const tasks = document.querySelectorAll('#tasks-body tr');
    const timeUnit = document.getElementById('timeUnit').value;
    let template = {
        timeUnit: timeUnit,
        tasks: []
    };

    tasks.forEach(task => {
        const taskName = task.querySelector('[name="taskName"]').value;
        const complexity = task.querySelector('[name="complexity"]').value;
        const optimistic = task.querySelector('[name="optimistic"]').value;
        const likely = task.querySelector('[name="likely"]').value;
        const pessimistic = task.querySelector('[name="pessimistic"]').value;

        template.tasks.push({
            taskName,
            complexity,
            optimistic,
            likely,
            pessimistic
        });
    });

    downloadJson(template, 'pert_template');
}

function resetPERTTable() {
    const proceed = confirm('Reset will clear the PERT input and result tables. Do you want to proceed?');
    if (!proceed) {
        return;
    }
    const tasksBody = document.getElementById('tasks-body');
    tasksBody.innerHTML = '';
    addTask();

    const timeUnit = document.getElementById('timeUnit');
    timeUnit.value = 'hours';

    const resultBody = document.getElementById('result-body');
    resultBody.innerHTML = '';
}

function loadTemplate(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const tasksBody = document.getElementById('tasks-body');
    tasksBody.innerHTML = '';

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const template = JSON.parse(content);

        document.getElementById('timeUnit').value = template.timeUnit;

        template.tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" name="taskName" value="${task.taskName}" required></td>
                <td>
                    <select name="complexity">
                        <option value="low" ${task.complexity === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.complexity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.complexity === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </td>
                <td><input type="number" name="optimistic" value="${task.optimistic}" required></td>
                <td><input type="number" name="likely" value="${task.likely}" required></td>
                <td><input type="number" name="pessimistic" value="${task.pessimistic}" required></td>
                <td><button type="button" class="btn-danger btn-sm" onclick="removeTask(this)">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Remove
                </button></td>
            `;
            tasksBody.appendChild(row);
        });
    };
    reader.readAsText(file);
}

function copyToClipboard(format) {
    const resultTable = document.getElementById('result-table');
    const definitionText = 'The PERT (Program Evaluation and Review Technique) estimate helps determine how long a task is likely to take by considering three different time estimates: optimistic, likely, and pessimistic. It provides a realistic timeframe that helps in planning and managing project schedules effectively.\nNote: The complexity value is for reference purposes only and does not affect the PERT calculation.\n\n';

    if (format === 'text') {
        let resultText = definitionText;
        for (let row of resultTable.rows) {
            for (let cell of row.cells) {
                resultText += cell.innerText + '\t';
            }
            resultText += '\n';
        }
        copyTextToClipboard(resultText, 'Result copied to clipboard as text');
    } else if (format === 'richtext') {
        let resultHTML = `<p>${definitionText.replace(/\n/g, '<br>')}</p>`;
        resultHTML += resultTable.outerHTML;
        copyHtmlToClipboard(resultHTML, 'Result copied to clipboard as RichText');
    }
}

function copyAsImage() {
    const resultElement = document.querySelector('#result > table');
    const definitionElement = document.createElement('div');
    definitionElement.style.padding = '20px';
    definitionElement.style.backgroundColor = '#ffffff';
    definitionElement.innerHTML = document.querySelector('#result > p').outerHTML + resultElement.outerHTML;

    document.body.appendChild(definitionElement);

    html2canvas(definitionElement, {
        backgroundColor: null
    }).then(canvas => {
        definitionElement.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width + 40;
        newCanvas.height = canvas.height + 40;
        const ctx = newCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.drawImage(canvas, 20, 20);
        newCanvas.toBlob(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                alert('Result copied to clipboard as image');
            });
        });
    });
}

document.getElementById('save-template-button').addEventListener('click', saveTemplate);
document.getElementById('load-template-button').addEventListener('click', triggerLoadTemplate);

const loadTemplateInput = document.createElement('input');
loadTemplateInput.type = 'file';
loadTemplateInput.accept = 'application/json';
loadTemplateInput.style.display = 'none';
loadTemplateInput.addEventListener('change', loadTemplate);
document.body.appendChild(loadTemplateInput);

function triggerLoadTemplate() {
    if (document.getElementById('tasks-body').children.length > 1) {
        const proceed = confirm('Loading a template will overwrite the current PERT table. Do you want to proceed?');
        if (!proceed) {
            return;
        }
    }
    loadTemplateInput.click();
}

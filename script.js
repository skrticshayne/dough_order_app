const GITHUB_TOKEN = 'your_personal_access_token'; // Store securely

document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM fully loaded and parsed');

    const defaultOrder = {
        'Mon': [0, 0, 0],
        'Tue': [0, 0, 0],
        'Wed': [0, 0, 0],
        'Thur': [0, 0, 0],
        'Fri': [0, 0, 0],
        'Sat': [0, 0, 0],
        'Sun': [0, 0, 0],
    };

    const daySelect = document.getElementById('daySelect');
    const resultLabel = document.getElementById('result');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const updateParsBtn = document.getElementById('updateParsBtn');
    const viewParsBtn = document.getElementById('viewParsBtn');
    const parsTable = document.getElementById('parsTable');

    console.log('Elements:', daySelect, resultLabel, nextStepBtn, updateParsBtn, viewParsBtn, parsTable);

    async function fetchCSVFile() {
        const response = await fetch('https://api.github.com/repos/yourusername/dough_order_app/contents/order.csv', {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        const data = await response.json();
        const csvContent = atob(data.content); // Decode base64 content
        return { content: csvContent, sha: data.sha };
    }

    async function updateCSVFile(newContent, sha) {
        await fetch('https://api.github.com/repos/yourusername/dough_order_app/contents/order.csv', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update order CSV file',
                content: btoa(newContent), // Encode content to base64
                sha: sha
            })
        });
    }

    function convertOrderDataToCSV(orderData) {
        let csvContent = 'Day,11,13,17\n';
        Object.keys(orderData).forEach(day => {
            csvContent += `${day},${orderData[day][0]},${orderData[day][1]},${orderData[day][2]}\n`;
        });
        return csvContent;
    }

    function parseCSVToOrderData(csvContent) {
        const lines = csvContent.split('\n').slice(1); // Skip the header line
        const orderData = {};
        lines.forEach(line => {
            const [day, eleven, thirteen, seventeen] = line.split(',');
            if (day) {
                orderData[day] = [parseInt(eleven), parseInt(thirteen), parseInt(seventeen)];
            }
        });
        return orderData;
    }

    async function loadOrderData() {
        try {
            const { content } = await fetchCSVFile();
            const parsedOrder = parseCSVToOrderData(content);
            Object.assign(order, parsedOrder);
            viewPars();
        } catch (error) {
            console.error('Error fetching CSV file:', error);
        }
    }

    async function updateTable() {
        console.log('Updating table');
        const days = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
        days.forEach(day => {
            const userInput = prompt(`Enter the number of dough balls for ${day} in the format 11, 13, 17:`);
            if (userInput) {
                order[day] = userInput.split(',').map(Number);
            }
        });

        try {
            const csvData = convertOrderDataToCSV(order);
            const { sha } = await fetchCSVFile();
            await updateCSVFile(csvData, sha);
            alert('Table updated successfully');
            viewPars();
        } catch (error) {
            console.error('Error updating CSV file:', error);
        }
    }

    nextStepBtn.addEventListener('click', () => {
        console.log('Next Step button clicked');
        const day = daySelect.value;
        console.log('Selected day:', day);
        const result = calculateOrder(day);
        console.log('Result:', result);
        resultLabel.innerHTML = `Place this order:<br> ${result[0]} trays of 11's<br> ${result[1]} trays of 13's<br> ${result[2]} trays of 17's`;
    });

    updateParsBtn.addEventListener('click', () => {
        console.log('Update Pars button clicked');
        updateTable();
    });

    viewParsBtn.addEventListener('click', () => {
        console.log('View Current Pars button clicked');
        viewPars();
    });

    function calculateOrder(day) {
        console.log('Calculating order for:', day);
        if (day === 'Mon') return Monday();
        if (day === 'Tue') return Tuesday();
        if (day === 'Wed') return Wednesday();
        if (day === 'Thur') return Thursday();
        if (day === 'Fri') return Friday();
        if (day === 'Sat') return Saturday();
        if (day === 'Sun') return Sunday();
    }

    function viewPars() {
        console.log('Viewing pars');
        parsTable.style.display = 'table';
        Object.keys(order).forEach(day => {
            document.getElementById(`${day.toLowerCase()}-11`).textContent = order[day][0];
            document.getElementById(`${day.toLowerCase()}-13`).textContent = order[day][1];
            document.getElementById(`${day.toLowerCase()}-17`).textContent = order[day][2];
        });
    }

    function getLeftover() {
        const leftover = prompt('What was leftover today? Enter in the format 11, 13, 17:');
        return leftover ? leftover.split(',').map(Number) : [0, 0, 0];
    }

    function Monday() {
        const leftover = getLeftover();
        const yesterday = prompt('What was ordered yesterday? Enter in the format 11, 13, 17:');
        if (yesterday) {
            const yesterdayArray = yesterday.split(',').map(Number);
            const sums = leftover.map((val, idx) => val + yesterdayArray[idx]);
            const secondPart = nextTwoDayPars('Mon');
            const resulting = sums.map((val, idx) => val - secondPart[idx]);
            const result = finalCalc(resulting, 'Mon');
            return result;
        }
        return [0, 0, 0];
    }

    function nextTwoDayPars(day) {
        const dayMap = {'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thur': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6};
        const indexMap = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thur', 4: 'Fri', 5: 'Sat', 6: 'Sun'};
        const dayIndex = dayMap[day];
        const day1 = indexMap[(dayIndex + 1) % 7];
        const day2 = indexMap[(dayIndex + 2) % 7];
        return order[day1].map((val, idx) => val + order[day2][idx]);
    }

    function finalCalc(magicNumbers, day) {
        const dayMap = {'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thur': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6};
        const indexMap = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thur', 4: 'Fri', 5: 'Sat', 6: 'Sun'};
        const dayIndex = dayMap[day];
        const day1 = indexMap[(dayIndex + 3) % 7]; // Calculate day1
        const final = magicNumbers.map((val, idx) => (-1 * val) + order[day1][idx]); // Invert signs and add corresponding elements
        return final.map(val => (val < 0 ? 0 : val)); // Ensure no negative values
    }

    function Tuesday() {
        return order['Fri'];
    }

    function Wednesday() {
        return order['Sat'];
    }
    function Thursday() {
        const leftover = getLeftover();
        const pars = order['Sun'];
        const thursTotal = pars.map((val, idx) => val - leftover[idx]);
        const finalThursTotal = thursTotal.map(val => (val < 0 ? 0 : val));
        return finalThursTotal;
    }
    
    function Friday() {
        const leftover = getLeftover();
        const yesterday = prompt('What was ordered yesterday? Enter in the format 11, 13, 17:');
        if (yesterday) {
            const yesterdayArray = yesterday.split(',').map(Number);
            const sums = leftover.map((val, idx) => val + yesterdayArray[idx]);
            const secondPart = nextTwoDayPars('Fri');
            const resulting = sums.map((val, idx) => val - secondPart[idx]);
            const result = finalCalc(resulting, 'Fri');
            return result;
        }
        return [0, 0, 0];
    }
    
    function Saturday() {
        const leftover = getLeftover();
        const yesterday = prompt('What was ordered yesterday? Enter in the format 11, 13, 17:');
        if (yesterday) {
            const yesterdayArray = yesterday.split(',').map(Number);
            const twoDaysAgo = prompt('What was ordered 2 days ago? Enter in the format 11, 13, 17:');
            if (twoDaysAgo) {
                const twoDaysAgoArray = twoDaysAgo.split(',').map(Number);
                const sumArray = leftover.map((val, idx) => val + yesterdayArray[idx] + twoDaysAgoArray[idx]);
                const nextTwoDay = nextTwoDayPars('Sat');
                const leftoverTuesday = sumArray.map((val, idx) => val - nextTwoDay[idx]);
                const result = finalCalc(leftoverTuesday, 'Sat');
                return result;
            }
        }
        return [0, 0, 0];
    }
    
    function Sunday() {
        const leftover = getLeftover();
        const nextTwoDay = nextTwoDayPars('Sun');
        const sumArray = leftover.map((val, idx) => val - nextTwoDay[idx]);
        const result = finalCalc(sumArray, 'Sun');
        return result;
    }
    
    // Load order data from GitHub when page loads
    await loadOrderData();
    
    // Initial display of pars when page loads
    viewPars();
});
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    const order = {
        'Mon': [5, 6, 12],
        'Tue': [6, 7, 12],
        'Wed': [6, 8, 13],
        'Thur': [6, 9, 13],
        'Fri': [9, 14, 24],
        'Sat': [9, 14, 24],
        'Sun': [6, 9, 13],
    };

    const daySelect = document.getElementById('daySelect');
    const resultLabel = document.getElementById('result');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const parsTable = document.getElementById('parsTable');

    console.log('Elements:', daySelect, resultLabel, nextStepBtn, parsTable);

    nextStepBtn.addEventListener('click', () => {
        console.log('Next Step button clicked');
        const day = daySelect.value;
        console.log('Selected day:', day);
        const result = calculateOrder(day);
        console.log('Result:', result);
        resultLabel.innerHTML = `Place this order:<br> ${result[0]} trays of 11's<br> ${result[1]} trays of 13's<br> ${result[2]} trays of 17's`;
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

    // Initial display of pars when page loads
    viewPars();
});

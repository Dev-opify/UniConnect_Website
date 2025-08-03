let currentDate = new Date();
let selectedDate = null;

function toggleCalendar() {
    const popup = document.getElementById('calendarPopup');
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    if (popup.style.display === 'block') {
        generateCalendar();
    }
}

function generateCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    document.getElementById('monthYear').textContent =
        monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear();

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day.getDate();

        if (day.getMonth() !== currentDate.getMonth()) {
            dayElement.classList.add('other-month');
        }

        if (selectedDate && day.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }

        dayElement.onclick = () => selectDate(day);
        grid.appendChild(dayElement);
    }
}

function selectDate(date) {
    selectedDate = new Date(date);
    const formattedDate = selectedDate.toLocaleDateString('en-GB');
    document.getElementById('dateOfBirth').value = formattedDate;
    document.getElementById('calendarPopup').style.display = 'none';
    generateCalendar();
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

document.addEventListener('click', function (event) {
    const popup = document.getElementById('calendarPopup');
    const calendarBtn = document.querySelector('.calendar-btn');

    if (!popup.contains(event.target) && !calendarBtn.contains(event.target)) {
        popup.style.display = 'none';
    }
});

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.style.background = '#27ae60';

    setTimeout(() => {
        alert('Registration successful!\n\nSubmitted data:\n' + JSON.stringify(data, null, 2));
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
    }, 1500);
});

document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

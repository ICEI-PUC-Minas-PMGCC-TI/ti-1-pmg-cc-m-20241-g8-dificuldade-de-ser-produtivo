document.addEventListener('DOMContentLoaded', function() {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = new Date();

    const monthYear = document.getElementById('monthYear');
    const calendarBody = document.getElementById('calendarBody');
    const tasks = document.getElementById('tasks');
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');

    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    addTaskButton.addEventListener('click', addTask);

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    }

    function renderCalendar() {
        monthYear.innerText = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        calendarBody.innerHTML = '';

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < firstDay) {
                    cell.classList.add('empty');
                } else if (date > daysInMonth) {
                    cell.classList.add('empty');
                } else {
                    cell.innerText = date;
                    cell.addEventListener('click', function() { selectDate(date, this); });
                    if (isSameDay(new Date(currentYear, currentMonth, date), selectedDate)) {
                        cell.classList.add('selected');
                    }
                    date++;
                }
                row.appendChild(cell);
            }

            calendarBody.appendChild(row);
        }
    }

    function selectDate(day, element) {
        selectedDate = new Date(currentYear, currentMonth, day);
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        renderTasks();
    }

    function addTask() {
        const taskText = taskInput.value;
        if (taskText) {
            const tasks = getTasks();
            tasks.push({ date: selectedDate.toISOString().split('T')[0], task: taskText, completed: false });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskInput.value = '';
            renderTasks();
        }
    }

    function renderTasks() {
        tasks.innerHTML = '';
        const tasksForDay = getTasks().filter(task => task.date === selectedDate.toISOString().split('T')[0]);

        tasksForDay.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                <span ${task.completed ? 'style="text-decoration: line-through;"' : ''}>${task.task}</span>
                <button data-index="${index}">Remover</button>
            `;
            tasks.appendChild(taskItem);
        });

        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTask);
        });

        document.querySelectorAll('#tasks button').forEach(button => {
            button.addEventListener('click', removeTask);
        });
    }

    function toggleTask(event) {
        const index = event.target.dataset.index;
        const tasks = getTasks();
        tasks[index].completed = event.target.checked;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function removeTask(event) {
        const index = event.target.dataset.index;
        const tasks = getTasks();
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    renderCalendar();
    selectDate(new Date().getDate(), document.querySelector(`td:not(.empty):contains(${new Date().getDate()})`));
});

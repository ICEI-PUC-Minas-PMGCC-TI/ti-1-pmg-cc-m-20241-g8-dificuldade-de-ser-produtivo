let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const newEvent = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const calendar = document.getElementById('calendar');
const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function openModal(date) {
  clicked = date;
  const eventDay = events.find(event => event.date === clicked);

  if (eventDay) {
    document.getElementById('eventText').innerHTML = eventDay.titles.map((title, index) => `
      <div class="event-item">
        <span class="${title.completed ? 'completed' : ''}">${title.name}</span>
        <button onclick="deleteSingleEvent(${index})">Excluir</button>
        <button onclick="markAsCompleted(${index})">Concluir</button>
      </div>
    `).join('');
    deleteEventModal.style.display = 'block';
  } else {
    newEvent.style.display = 'block';
  }

  backDrop.style.display = 'block';
}

function load() {
  const date = new Date();

  if (nav !== 0) {
    date.setMonth(new Date().getMonth() + nav);
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const daysMonth = new Date(year, month + 1, 0).getDate();
  const firstDayMonth = new Date(year, month, 1);

  const dateString = firstDayMonth.toLocaleDateString('pt-br', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText = `${date.toLocaleDateString('pt-br', { month: 'long' })}, ${year}`;
  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysMonth; i++) {
    const dayS = document.createElement('div');
    dayS.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      dayS.innerText = i - paddingDays;

      const eventDay = events.find(event => event.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        dayS.id = 'currentDay';
      }

      if (eventDay) {
        eventDay.titles.forEach(title => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('event');
          eventDiv.innerText = title.name;
          if (title.completed) {
            eventDiv.style.textDecoration = 'line-through';
          }
          dayS.appendChild(eventDiv);
        });
      }

      dayS.addEventListener('click', () => openModal(dayString));
    } else {
      dayS.classList.add('padding');
    }

    calendar.appendChild(dayS);
  }
}

function closeModal() {
  eventTitleInput.classList.remove('error');
  newEvent.style.display = 'none';
  backDrop.style.display = 'none';
  deleteEventModal.style.display = 'none';

  eventTitleInput.value = '';
  clicked = null;
  load();
}

function saveEvent() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');

    const eventDay = events.find(event => event.date === clicked);

    if (eventDay) {
      eventDay.titles.push({ name: eventTitleInput.value, completed: false });
    } else {
      events.push({
        date: clicked,
        titles: [{ name: eventTitleInput.value, completed: false }]
      });
    }

    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}

function deleteEvent() {
  events = events.filter(event => event.date !== clicked);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();
}

function deleteSingleEvent(index) {
  const eventDay = events.find(event => event.date === clicked);
  eventDay.titles.splice(index, 1);

  if (eventDay.titles.length === 0) {
    events = events.filter(event => event.date !== clicked);
  }

  localStorage.setItem('events', JSON.stringify(events));
  openModal(clicked); // Reopen modal to refresh event list
}

function markAsCompleted(index) {
  const eventDay = events.find(event => event.date === clicked);
  eventDay.titles[index].completed = true;

  localStorage.setItem('events', JSON.stringify(events));
  openModal(clicked); // Reopen modal to refresh event list
}

function addNewTask() {
  newEvent.style.display = 'block';
  deleteEventModal.style.display = 'none';
}

function buttons() {
  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('saveButton').addEventListener('click', () => saveEvent());

  document.getElementById('cancelButton').addEventListener('click', () => closeModal());

  document.getElementById('deleteButton').addEventListener('click', () => deleteEvent());

  document.getElementById('closeButton').addEventListener('click', () => closeModal());

  document.getElementById('addnewtask').addEventListener('click', () => addNewTask());
}

buttons();
load();

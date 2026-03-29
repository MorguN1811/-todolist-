let storageTask = localStorage.getItem('storageTask');
let maxId = 0;if (!storageTask) {
    storageTask = {};
} else {
    try {
        storageTask = JSON.parse(storageTask);
        
        Object.values(storageTask).forEach(task => {
            if (task && typeof task.id === 'number' && task.id > maxId) {
                maxId = task.id;
            }
        });
    } catch (error) {
        console.error('Ошибка парсинга JSON:', error);
        storageTask = {};
    }
}

function saveTasks() {
    localStorage.setItem('storageTask', JSON.stringify(storageTask));
}

function checkInitialModalState() {
    const modalBg = document.querySelector('.modalBackground');
    const modal = document.querySelector('.modal');
    const taskCount = Object.keys(storageTask).length;

    if (taskCount === 0) {
        modalBg.style.display = 'block';
        modal.style.display = 'block';
    } else {
        modalBg.style.display = 'none';
        modal.style.display = 'none';
    }
}

document.querySelector('.addTaskBtn').addEventListener('click', () => {
    document.querySelector('.modalBackground').style.display = 'block';
    document.querySelector('.modal').style.display = 'block';
    document.querySelector('.newTaskText').focus();
});

document.querySelector('.modalBackground').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.modalBackground')) {
        document.querySelector('.modalBackground').style.display = 'none';
        document.querySelector('.modal').style.display = 'none';
    }
});

function createTask() {
    let newTaskTextInput = document.querySelector('.newTaskText');
    const textValue = newTaskTextInput.value.trim();

    if (!textValue) {
        alert('Введите текст задачи!');
        return;
    }

    maxId++; 
    let idTask = maxId;

    storageTask[idTask] = {
        id: idTask,
        state: 'doing',
        time: new Date().toLocaleString(), 
        text: textValue,
    };

    saveTasks();
    
    document.querySelector('.modalBackground').style.display = 'none';
    document.querySelector('.modal').style.display = 'none';

    newTaskTextInput.value = '';
    
    const selectElement = document.querySelector('#select');
    if(selectElement) selectElement.value = 'all';
    
    updateTaskList();
}

const createBtn = document.querySelector('.createTaskBtn'); 
if(createBtn) createBtn.addEventListener('click', createTask);

document.querySelector('.newTaskText').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createTask();
});


function updateTaskList(){
    const taskListContainer = document.querySelector('.taskList');
    taskListContainer.innerHTML = ''; 
    
    let tasks = Object.values(storageTask);

    tasks.forEach(task => {
        if (!task || !task.id || task.text === undefined) return;

        const taskDiv = document.createElement('div');
        taskDiv.className = `taskСontent ${task.state}`;
        taskDiv.id = `taskId${task.id}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checktask';
        checkbox.checked = task.state === 'completed';

        const title = document.createElement('h2');
        title.textContent = task.text; 

        const timeData = document.createElement('p');
        timeData.className = 'timeData';
        timeData.textContent = task.time;

        const delBtn = document.createElement('button');
        delBtn.className = 'del';
        delBtn.innerHTML = '<img src="./pictures/trash.png" alt="">';
        delBtn.onclick = () => deleteTask(task.id);

        const editBtn = document.createElement('button');
        editBtn.className = 'edit';
        editBtn.innerHTML = '<img src="./pictures/pencil.png" alt="">';
        editBtn.onclick = () => editTask(task.id);

        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(title);
        taskDiv.appendChild(timeData);
        taskDiv.appendChild(delBtn);
        taskDiv.appendChild(editBtn);

        taskListContainer.appendChild(taskDiv);
    });
}

document.querySelector('.taskList').addEventListener('change', (event) => {
    if (event.target.classList.contains('checktask')) {
        const taskContent = event.target.closest('.taskСontent');
        if (!taskContent) return;

        let taskId = taskContent.id.replace('taskId', '');
        let task = storageTask[taskId];
        
        if(task) {
            task.state = event.target.checked ? 'completed' : 'doing';
            saveTasks();
            updateTaskList();
        }
    }
});

function deleteTask(taskId){
    if(confirm('Вы уверены, что хотите удалить эту задачу?')) {
        delete storageTask[taskId];
        saveTasks();
        updateTaskList();
    }
}

function editTask(taskId){
    let task = storageTask[taskId];
    if (!task) return;

    const newText = prompt('Введите новый текст:', task.text);
    
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        updateTaskList();
    }
}

const selectElement = document.querySelector('#select');
if (selectElement) {
    selectElement.addEventListener('change', (event) => {
        const filterValue = event.target.value;
        const taskElements = document.querySelectorAll('.taskСontent');
        
        taskElements.forEach(element => {
            const taskState = element.classList.contains('completed') ? 'completed' : 'doing';
            
            if (filterValue === 'all') {
                element.style.display = 'flex';
            } else if (filterValue === 'completed' && taskState === 'completed') {
                element.style.display = 'flex';
            } else if (filterValue === 'not-fulfilled' && taskState === 'doing') {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    });
}

checkInitialModalState();
updateTaskList();
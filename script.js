let storageTask = localStorage.getItem('storageTask');
if (!storageTask) {
    storageTask = {}; 
} else {
    try {
        storageTask = JSON.parse(storageTask);  
    } catch (error) {
        console.error('Ошибка парсинга JSON:', error);
        storageTask = {};
    }
}
function createTask(){
    let newTaskText = document.querySelector('.newTaskText')
    console.log(newTaskText)

    if (!newTaskText.value.trim()) {
        alert('Введите текст задачи!');
        return;
    }

    let idTask = Object.keys(storageTask).length + 1;


    storageTask[idTask] = {
        id: idTask,
        state: 'doing',
        time: new Date().toLocaleString(), 
        text: newTaskText.value,
    };

    document.querySelector('modalBackground').style.display = 'none'
    document.querySelector('.modal').style.display = 'none'

    localStorage.setItem('storageTask',storageTask)
    newTaskText.value = '';
    updateTaskList();
}

document.querySelector('.addTaskBtn').addEventListener('click', () => {
    document.querySelector('.modalBackground').style.display = 'block';
    document.querySelector('.modal').style.display = 'block';
});

document.querySelector('.modalBackground').addEventListener('click', () => {
    document.querySelector('.modalBackground').style.display = 'none';
    document.querySelector('.modal').style.display = 'none';
});

document.querySelector('.taskList').addEventListener('change', (event) => {
    if (event.target.classList.contains('checktask')) {
        let taskId = event.target.closest('.taskСontent').id.replace('taskId', '');
        let task = storageTask[taskId];
        task.state = event.target.checked ? 'completed' : 'doing';
        localStorage.setItem('storageTask', JSON.stringify(storageTask));
        updateTaskList();
    }
});

function deleteTask(taskId){
    delete storageTask[taskId];
    localStorage.setItem('storageTask',JSON.stringify(storageTask))
    updateTaskList();
}

function editTask(taskId){
    let task = storageTask[taskId];
    task.text = newText;
    localStorage.setItem('storageTask',JSON.stringify(storageTask))
    updateTaskList();
}


function updateTaskList(){
    console.log('123')
    
    document.querySelector('.taskList').innerHTML = '';
    
    let tasks = Object.values(storageTask);

    tasks.forEach(task => {
    
        let newTaskContainer = `<div  class="taskСontent ${task.state}" id='taskId${task.id}'>
                                    <input type = 'checkbox' class="checktask">
                                    <h2 class="/h2">${task.text}</h3>
                                    <p class="timeData">${task.time}</p>
                                    <button class="del"> onclik="editTask(${task.id}"   
                                        <img src="./pictures/trash.png" alt="">
                                    </button>
                                    <button class="edit"> onclik="editTask(${task.id},promt('Введите новый текст:','${task.text}'))"
                                        <img src="./pictures/pencil.png" alt="">
                                    </button>
                                </div>`

        document.querySelector('.taskList').innerHTML += newTaskContainer;
    })
}


updateTaskList();
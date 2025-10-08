let storageTask = localStorage.getItem('storageTask')

function createTask(){
    let newTaskText = document.querySelector('.newTaskText')
    let idTask = 1

    storageTask.idTask = {
        id: idTask,
        state: 'doing',
        time: new Date(),
        text: newTaskText.textContent,
    }
    localStorage.setItem('storageTask',storageTask)
    newTaskText.textContent = ''
}

function updateTaskList(){
    storageTask.forEach(task => {
        let newTaskText = task.text
        let newTaskId = task.id
        let newTime = task.time
        let newState = task.state

        let newTaskContainer = `<div class="taskСontent" class='${newState}' id='taslId${newTaskId}'>
                                    <input type = 'checkbox' class="checktask">
                                    <h2 class="h2">${newTaskText}</h3>
                                    <p class="timeData">${newTime}</p>
                                    <button class="del">
                                        <img src="./pictures/trash.png" alt="">
                                    </button>
                                    <button class="edit">
                                        <img src="./pictures/pencil.png" alt="">
                                    </button>
                                </div>`

        document.querySelector('.taskList').innerHTML += newTaskContainer;
    })
}



updateTaskList();
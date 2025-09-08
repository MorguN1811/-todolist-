let storageTask = localStorage.getItem('storageTask')

storageTask.taskName = {
    name: 'Sleep',
    state: 'did',
    time: '18.55',
    description: 'something',
}

function createTask(){
    storageTask.taskName ={
        name: 'Задача 1',
        state: 'did',
        time: '18.55',
        description: 'something',
    }
    localStorage.getItem('storageTask',storageTask)
}
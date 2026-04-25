function loadStorageObject(storageKey, errorText) {
    const rawValue = localStorage.getItem(storageKey);

    if (!rawValue) {
        return {};
    }

    try {
        const parsedValue = JSON.parse(rawValue);
        return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
    } catch (error) {
        console.error(errorText, error);
        return {};
    }
}

let storageTask = loadStorageObject('storageTask', 'Ошибка чтения активных задач из хранилища:');
let deletedTaskStorage = loadStorageObject('deletedTaskStorage', 'Ошибка чтения удаленных задач из хранилища:');
let maxId = 0;

[storageTask, deletedTaskStorage].forEach((taskStorage) => {
    Object.values(taskStorage).forEach((task) => {
        if (task && typeof task.id === 'number' && task.id > maxId) {
            maxId = task.id;
        }
    });
});

function saveTasks() {
    localStorage.setItem('storageTask', JSON.stringify(storageTask));
    localStorage.setItem('deletedTaskStorage', JSON.stringify(deletedTaskStorage));
}

const modalBg = document.querySelector('.modalBackground');
const addModal = document.querySelector('.addModal');
const editModal = document.querySelector('.editModal');
const deleteModal = document.querySelector('.deleteModal');
const purgeModal = document.querySelector('.purgeModal');
const addTaskBtn = document.querySelector('.addTaskBtn');
const clearDeletedBtn = document.querySelector('.clearDeletedBtn');
const newTaskInput = document.querySelector('.newTaskText');
const addTaskError = document.querySelector('.addTaskError');
const editTaskInput = document.querySelector('.editTaskText');
const confirmEditButton = document.querySelector('.confirmEditButton');
const cancelEditButton = document.querySelector('.cancelEditButton');
const confirmDeleteButton = document.querySelector('.confirmDeleteButton');
const cancelDeleteButton = document.querySelector('.cancelDeleteButton');
const confirmPurgeButton = document.querySelector('.confirmPurgeButton');
const cancelPurgeButton = document.querySelector('.cancelPurgeButton');

let pendingEditTaskId = null;
let pendingDeleteTaskId = null;
let pendingPurgeTaskId = null;
let pendingPurgeAll = false;

function closeAllModals() {
    modalBg.style.display = 'none';
    addModal.style.display = 'none';
    editModal.style.display = 'none';
    deleteModal.style.display = 'none';
    purgeModal.style.display = 'none';
}

function resetModalState() {
    pendingEditTaskId = null;
    pendingDeleteTaskId = null;
    pendingPurgeTaskId = null;
    pendingPurgeAll = false;
    newTaskInput.classList.remove('hasError');
    addTaskError.textContent = '';
    editTaskInput.value = '';
}

function updateDeleteAllButtonVisibility(filterValue) {
    const hasDeletedTasks = Object.keys(deletedTaskStorage).length > 0;

    if (filterValue === 'deleted' && hasDeletedTasks) {
        clearDeletedBtn.style.display = 'inline-flex';
    } else {
        clearDeletedBtn.style.display = 'none';
    }
}

function openModal(modalType) {
    closeAllModals();
    modalBg.style.display = 'block';

    if (modalType === 'add') {
        addModal.style.display = 'block';
        newTaskInput.focus();
    }

    if (modalType === 'edit') {
        editModal.style.display = 'block';
        editTaskInput.focus();
        editTaskInput.select();
    }

    if (modalType === 'delete') {
        deleteModal.style.display = 'block';
    }

    if (modalType === 'purge') {
        purgeModal.style.display = 'block';
    }
}

function applyTaskFilter(filterValue) {
    const taskElements = document.querySelectorAll('.taskСontent');

    taskElements.forEach((element) => {
        const taskState = element.dataset.state || 'doing';

        let shouldShow = false;

        if (filterValue === 'all') {
            shouldShow = taskState !== 'deleted';
        } else if (filterValue === 'completed') {
            shouldShow = taskState === 'completed';
        } else if (filterValue === 'not-fulfilled') {
            shouldShow = taskState === 'doing';
        } else if (filterValue === 'deleted') {
            shouldShow = taskState === 'deleted';
        }

        element.style.display = shouldShow ? 'grid' : 'none';
    });

    updateDeleteAllButtonVisibility(filterValue);
}

function checkInitialModalState() {
    const taskCount = Object.keys(storageTask).length + Object.keys(deletedTaskStorage).length;

    if (taskCount === 0) {
        openModal('add');
    } else {
        closeAllModals();
    }
}

addTaskBtn.addEventListener('click', () => {
    openModal('add');
});

clearDeletedBtn.addEventListener('click', () => {
    pendingPurgeAll = true;
    pendingPurgeTaskId = null;

    const purgeModalText = document.querySelector('.purgeModalText');
    purgeModalText.textContent = 'Убрать все задачи из архива без возможности восстановления?';
    openModal('purge');
});

modalBg.addEventListener('click', (e) => {
    if (e.target === modalBg) {
        closeAllModals();
        resetModalState();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeAllModals();
        resetModalState();
    }
});

function createTask() {
    const textValue = newTaskInput.value.trim();

    if (!textValue) {
        addTaskError.textContent = 'Введите текст задачи.';
        newTaskInput.classList.add('hasError');
        newTaskInput.focus();
        return;
    }

    addTaskError.textContent = '';
    newTaskInput.classList.remove('hasError');

    maxId++;
    const idTask = maxId;

    storageTask[idTask] = {
        id: idTask,
        state: 'doing',
        time: new Date().toLocaleString('ru-RU'),
        text: textValue,
    };

    saveTasks();

    closeAllModals();
    resetModalState();

    newTaskInput.value = '';
    
    const selectElement = document.querySelector('#select');
    if (selectElement) {
        selectElement.value = 'all';
    }
    
    updateTaskList();
}

const createBtn = document.querySelector('.createTaskBtn'); 
if(createBtn) createBtn.addEventListener('click', createTask);

newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createTask();
});

newTaskInput.addEventListener('input', () => {
    if (newTaskInput.value.trim() !== '') {
        addTaskError.textContent = '';
        newTaskInput.classList.remove('hasError');
    }
});


function updateTaskList() {
    const taskListContainer = document.querySelector('.taskList');
    taskListContainer.innerHTML = '';

    const activeTasks = Object.values(storageTask);
    const deletedTasks = Object.values(deletedTaskStorage);

    activeTasks.forEach((task) => {
        if (!task || !task.id || task.text === undefined) return;

        const taskDiv = document.createElement('div');
        taskDiv.className = `taskСontent ${task.state}`;
        taskDiv.id = `taskId${task.id}`;
        taskDiv.dataset.state = task.state;

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
        delBtn.innerHTML = '<img src="./pictures/trash.png" alt="Удалить">';
        delBtn.onclick = () => deleteTask(task.id);

        const editBtn = document.createElement('button');
        editBtn.className = 'edit';
        editBtn.innerHTML = '<img src="./pictures/pencil.png" alt="Редактировать">';
        editBtn.onclick = () => editTask(task.id);

        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(title);
        taskDiv.appendChild(timeData);
        taskDiv.appendChild(delBtn);
        taskDiv.appendChild(editBtn);

        taskListContainer.appendChild(taskDiv);
    });

    deletedTasks.forEach((task) => {
        if (!task || !task.id || task.text === undefined) return;

        const taskDiv = document.createElement('div');
        taskDiv.className = 'taskСontent deleted';
        taskDiv.id = `deletedTaskId${task.id}`;
        taskDiv.dataset.state = 'deleted';

        const deletedMark = document.createElement('span');
        deletedMark.className = 'deletedMark';
        deletedMark.textContent = 'Архив';

        const title = document.createElement('h2');
        title.textContent = task.text;

        const timeData = document.createElement('p');
        timeData.className = 'timeData';
        timeData.textContent = `Удалена: ${task.deletedTime || 'недавно'}`;

        const clearBtn = document.createElement('button');
        clearBtn.className = 'purge';
        clearBtn.type = 'button';
        clearBtn.textContent = 'Убрать';
        clearBtn.onclick = () => purgeDeletedTask(task.id);

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'restore';
        restoreBtn.type = 'button';
        restoreBtn.textContent = 'Вернуть';
        restoreBtn.onclick = () => restoreTask(task.id);

        taskDiv.appendChild(deletedMark);
        taskDiv.appendChild(title);
        taskDiv.appendChild(timeData);
        taskDiv.appendChild(clearBtn);
        taskDiv.appendChild(restoreBtn);

        taskListContainer.appendChild(taskDiv);
    });

    const currentFilter = document.querySelector('#select')?.value || 'all';
    applyTaskFilter(currentFilter);
}

document.querySelector('.taskList').addEventListener('change', (event) => {
    if (event.target.classList.contains('checktask')) {
        const taskContent = event.target.closest('.taskСontent');
        if (!taskContent) return;

        const taskId = taskContent.id.replace('taskId', '');
        const task = storageTask[taskId];
        
        if (task) {
            task.state = event.target.checked ? 'completed' : 'doing';
            saveTasks();
            updateTaskList();
        }
    }
});

function deleteTask(taskId) {
    const task = storageTask[taskId];
    if (!task) return;

    pendingDeleteTaskId = taskId;
    const deleteModalText = document.querySelector('.deleteModalText');
    deleteModalText.textContent = `Удалить задачу "${task.text}"? Ее можно будет восстановить в фильтре "Удаленные".`;
    openModal('delete');
}

function confirmDeleteTask() {
    if (!pendingDeleteTaskId) return;

    const task = storageTask[pendingDeleteTaskId];
    if (!task) return;

    deletedTaskStorage[pendingDeleteTaskId] = {
        id: task.id,
        text: task.text,
        time: task.time,
        previousState: task.state,
        deletedTime: new Date().toLocaleString('ru-RU'),
        state: 'deleted',
    };

    delete storageTask[pendingDeleteTaskId];
    saveTasks();
    closeAllModals();
    resetModalState();
    updateTaskList();
}

function restoreTask(taskId) {
    const task = deletedTaskStorage[taskId];
    if (!task) return;

    storageTask[taskId] = {
        id: task.id,
        text: task.text,
        time: task.time,
        state: task.previousState === 'completed' ? 'completed' : 'doing',
    };

    delete deletedTaskStorage[taskId];
    saveTasks();
    updateTaskList();
}

function purgeDeletedTask(taskId) {
    const task = deletedTaskStorage[taskId];
    if (!task) return;

    pendingPurgeTaskId = taskId;
    const purgeModalText = document.querySelector('.purgeModalText');
    purgeModalText.textContent = `Убрать задачу "${task.text}" из архива без возможности восстановления?`;
    openModal('purge');
}

function confirmPurgeTask() {
    if (pendingPurgeAll) {
        deletedTaskStorage = {};
        saveTasks();
        closeAllModals();
        resetModalState();
        updateTaskList();
        return;
    }

    if (!pendingPurgeTaskId) return;

    const task = deletedTaskStorage[pendingPurgeTaskId];
    if (!task) return;

    delete deletedTaskStorage[pendingPurgeTaskId];
    saveTasks();
    closeAllModals();
    resetModalState();
    updateTaskList();
}

function editTask(taskId) {
    const task = storageTask[taskId];
    if (!task) return;

    pendingEditTaskId = taskId;
    editTaskInput.value = task.text;
    openModal('edit');
}

function confirmEditTask() {
    if (!pendingEditTaskId) return;

    const task = storageTask[pendingEditTaskId];
    if (!task) return;

    const newText = editTaskInput.value.trim();
    
    if (newText !== '') {
        task.text = newText;
        saveTasks();
        closeAllModals();
        resetModalState();
        updateTaskList();
    } else {
        alert('Введите новый текст задачи!');
    }
}

confirmEditButton.addEventListener('click', confirmEditTask);
cancelEditButton.addEventListener('click', () => {
    closeAllModals();
    resetModalState();
});

confirmDeleteButton.addEventListener('click', confirmDeleteTask);
cancelDeleteButton.addEventListener('click', () => {
    closeAllModals();
    resetModalState();
});

confirmPurgeButton.addEventListener('click', confirmPurgeTask);
cancelPurgeButton.addEventListener('click', () => {
    closeAllModals();
    resetModalState();
});

editTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        confirmEditTask();
    }
});

const selectElement = document.querySelector('#select');
if (selectElement) {
    selectElement.addEventListener('change', (event) => {
        const filterValue = event.target.value;
        applyTaskFilter(filterValue);
    });
}

checkInitialModalState();
updateTaskList();

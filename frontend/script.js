// URL API
const API_URL = "/api";

// Функция для получения списка групп с сервера
async function fetchGroups() {
    try {
        // Загружаем группы
        const groupsResponse = await fetch(`${API_URL}/groups`);
        if (!groupsResponse.ok) {
            throw new Error("Ошибка при загрузке групп.");
        }
        const groups = await groupsResponse.json();

        // Загружаем все диски
        const discs = await fetchAllDiscs();

        // Отображение групп с соответствующими дисками
        renderGroups(groups, discs);
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось загрузить группы.");
    }
}

// Функция отрисовки списка групп на странице
function renderGroups(groups, allDiscs) {
    const container = document.getElementById("groups-container");
    container.innerHTML = ""; // Очищаем контейнер перед отрисовкой

    groups.forEach(group => {
        // Фильтруем диски для конкретной группы
        const groupDiscs = allDiscs.filter(disc => disc.band === group.id);

        const groupElement = document.createElement("div");
        groupElement.classList.add("group");
        groupElement.innerHTML = `
            <h3>${group.name} <span>(${group.country} / ${group.genre})</span></h3>
            <button onclick="editGroup('${group.id}')">Редактировать группу</button>
            <button onclick="deleteGroup('${group.id}')">Удалить группу</button>
            <button onclick="toggleDiscs('${group.id}')">Показать/Скрыть диски</button>
            <div id="discs-${group.id}" class="discs-container" style="display: none;">
                <h4>Диски группы:</h4>
                <div class="discs-list">
                    ${groupDiscs.map(disc => `
                        <div class="disc">
                            <p>${disc.title} (${disc.year})</p>
                            <button onclick="editDisc('${disc.id}')">Редактировать</button>
                            <button onclick="deleteDisc('${disc.id}')">Удалить</button>
                        </div> 
                    `).join('')}
                </div>
                <form onsubmit="addDisc(event, '${group.id}')">
                    <input type="text" placeholder="Название диска" required>
                    <input type="text" placeholder="Группа" value="${group.name}" disabled>
                    <input type="number" placeholder="Год" required>
                    <button type="submit">Добавить диск</button>
                </form>
            </div>
        `;

        container.appendChild(groupElement);
    });
}

// Функция получения дисков группы
async function fetchAllDiscs() {
    try {
        const response = await fetch(`${API_URL}/discs`);
        if (!response.ok) {
            throw new Error("Ошибка при загрузке дисков.");
        }
        const discs = await response.json();

        // Возвращаем диск для дальнейшей фильтрации
        return discs;
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось загрузить диски.");
        return [];
    }
}

// Функция отрисовки дисков группы
function renderDiscs(groupId, discs) {
    const discsContainer = document.querySelector(`#discs-${groupId} .discs-list`);
    discsContainer.innerHTML = ""; // Очищаем контейнер перед отрисовкой

    discs.forEach(disc => {
        const discElement = document.createElement("div");
        discElement.classList.add("disc");
        discElement.innerHTML = `
            <p>${disc.title} (${disc.year})</p>
            <button onclick="editDisc('${disc.id}')">Редактировать</button>
            <button onclick="deleteDisc('${disc.id}')">Удалить</button>
        `;
        discsContainer.appendChild(discElement);
    });
}


async function addGroup(event) {
    event.preventDefault();
    const name = document.getElementById("add-name").value;
    const country = document.getElementById("add-country").value;
    const genre = document.getElementById("add-genre").value;

    try {
        const response = await fetch(`${API_URL}/groups`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, country, genre }),
        });

        if (!response.ok) {
            throw new Error("Ошибка при добавлении группы.");
        }

        const newGroup = await response.json();
        alert("Группа успешно добавлена!");

        // Добавляем новую группу в DOM
        const container = document.getElementById("groups-container");
        const groupElement = document.createElement("div");
        groupElement.classList.add("group");
        groupElement.innerHTML = `
            <h3>${newGroup.name} <span>(${newGroup.country} / ${newGroup.genre})</span></h3>
            <button onclick="editGroup('${newGroup.id}')">Редактировать группу</button>
            <button onclick="deleteGroup('${newGroup.id}')">Удалить группу</button>
            <button onclick="toggleDiscs('${newGroup.id}')">Показать/Скрыть диски</button>
            <div id="discs-${newGroup.id}" class="discs-container" style="display: none;">
                <h4>Диски группы:</h4>
                <div class="discs-list"></div>
                <form onsubmit="addDisc(event, '${newGroup.id}')">
                    <input type="text" placeholder="Название диска" required>
                    <input type="text" placeholder="Группа" value="${newGroup.name}" disabled>
                    <input type="number" placeholder="Год" required>
                    <button type="submit">Добавить диск</button>
                </form>
            </div>
        `;

        container.appendChild(groupElement); // Добавляем новую группу в конец списка
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось добавить группу.");
    } finally {
        // Очищаем форму после добавления
        document.getElementById("add-group-form").reset();
    }
}

// Функция для поиска групп
async function searchGroups(event) {
    event.preventDefault();

    const name = document.getElementById("search-name").value.trim();
    const country = document.getElementById("search-country").value.trim();
    const genre = document.getElementById("search-genre").value.trim();

    try {
        // Формируем параметры запроса
        const queryParams = new URLSearchParams();
        if (name) queryParams.append("name", name);
        if (country) queryParams.append("country", country);
        if (genre) queryParams.append("genre", genre);

        // Выполняем запрос к API для поиска
        const response = await fetch(`${API_URL}/groups/search?${queryParams}`);
        if (!response.ok) {
            if (response.status === 404) {
                renderNoGroupsFound(); // Если ничего не найдено
                return;
            }
            throw new Error("Ошибка при поиске групп.");
        }

        // Получаем и отображаем группы
        const groups = await response.json();
        const discs = await fetchAllDiscs(); // Загружаем все диски для фильтрации
        renderGroups(groups, discs); // Перерисовываем группы
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось выполнить поиск групп.");
    }
}

// Отображает сообщение, если группы не найдены
function renderNoGroupsFound() {
    const container = document.getElementById("groups-container");
    container.innerHTML = `
        <p class="no-results">Группы, соответствующие вашему запросу, не найдены.</p>
    `;
}

async function editGroup(groupId) {
    try {
        // 1 - Получаем данные текущей группы
        const response = await fetch(`${API_URL}/groups/${groupId}`);
        if (!response.ok) {
            throw new Error("Не удалось загрузить данные группы.");
        }
        const group = await response.json();

        // 2 - Генерируем форму редактирования
        const groupElement = document.querySelector(`button[onclick="editGroup('${groupId}')"]`).parentElement;
        groupElement.innerHTML = `
            <form onsubmit="saveGroupChanges(event, '${groupId}')">
                <input type="text" id="edit-name-${groupId}" value="${group.name}" required>
                <input type="text" id="edit-country-${groupId}" value="${group.country}" required>
                <input type="text" id="edit-genre-${groupId}" value="${group.genre}" required>
                <button type="submit">Сохранить</button>
                <button type="button" onclick="cancelEditGroup('${groupId}', '${group.name}', '${group.country}', '${group.genre}')">Отмена</button>
            </form>
        `;
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось выполнить операцию редактирования.");
    }
}

async function saveGroupChanges(event, groupId) {
    event.preventDefault();

    // Данные из формы редактирования
    const name = document.getElementById(`edit-name-${groupId}`).value.trim();
    const country = document.getElementById(`edit-country-${groupId}`).value.trim();
    const genre = document.getElementById(`edit-genre-${groupId}`).value.trim();

    try {
        // 1 - Отправляем данные на сервер через PUT запрос
        const response = await fetch(`${API_URL}/groups/${groupId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, country, genre }),
        });

        if (!response.ok) {
            throw new Error("Не удалось сохранить изменения группы.");
        }

        alert("Группа успешно обновлена!");

        // Перезагружаем список групп
        await fetchGroups();
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось сохранить изменения.");
    }
}

function cancelEditGroup(groupId, name, country, genre) {
    // Восстанавливаем стандартный вид элемента группы
    const groupElement = document.querySelector(`form[onsubmit="saveGroupChanges(event, '${groupId}')"]`).parentElement;
    groupElement.innerHTML = `
        <h3>${name} <span>(${country} / ${genre})</span></h3>
        <button onclick="editGroup('${groupId}')">Редактировать группу</button>
        <button onclick="deleteGroup('${groupId}')">Удалить группу</button>
        <button onclick="toggleDiscs('${groupId}')">Показать/Скрыть диски</button>
    `;
}

async function deleteGroup(groupId) {
    if (!confirm("Вы уверены, что хотите удалить эту группу?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/groups/${groupId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Ошибка при удалении группы.");
        }

        alert("Группа успешно удалена!");

        // Удаляем группу из DOM
        const groupElement = document.querySelector(`button[onclick="deleteGroup('${groupId}')"]`).parentElement;
        groupElement.remove();
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось удалить группу.");
    }
}

function toggleDiscs(groupId) {
    const discsContainer = document.getElementById(`discs-${groupId}`);
    if (discsContainer.style.display === "none") {
        discsContainer.style.display = "block";
    } else {
        discsContainer.style.display = "none";
    }
}

async function addDisc(event, groupId) {
    event.preventDefault();

    const form = event.target;
    const title = form.querySelector("input[placeholder='Название диска']").value;
    const band = groupId; // Связываем диск с текущей группой
    const year = parseInt(form.querySelector("input[placeholder='Год']").value);

    try {
        const response = await fetch(`${API_URL}/discs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, band, year }),
        });

        if (!response.ok) {
            throw new Error("Ошибка при добавлении диска.");
        }

        const newDisc = await response.json();
        alert("Диск успешно добавлен!");

        // Добавляем новый диск в DOM
        const discsContainer = document.querySelector(`#discs-${groupId} .discs-list`);
        const discElement = document.createElement("div");
        discElement.classList.add("disc");
        discElement.innerHTML = `
            <p>${newDisc.title} (${newDisc.year})</p>
            <button onclick="editDisc('${newDisc.id}')">Редактировать</button>
            <button onclick="deleteDisc('${newDisc.id}')">Удалить</button>
        `;
        discsContainer.appendChild(discElement);
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось добавить диск.");
    } finally {
        form.reset(); // Очищаем форму
    }
}

function editDisc(discId) {
    // Находим элемент диска в DOM
    const discElement = document.querySelector(`button[onclick="editDisc('${discId}')"]`).parentElement;

    // Получаем текущие данные диска из DOM
    const title = discElement.querySelector("p").innerText.split(" (")[0]; // Извлекаем название диска
    const year = discElement.querySelector("p").innerText.match(/\((\d+)\)/)[1]; // Извлекаем год

    // Заменяем содержимое на форму редактирования
    discElement.innerHTML = `
        <form onsubmit="saveDiscChanges(event, '${discId}', '${discElement.parentElement.parentElement.id}')">
            <input type="text" id="edit-title-${discId}" value="${title}" placeholder="Название диска" required>
            <input type="number" id="edit-year-${discId}" value="${year}" placeholder="Год" required>
            <button type="submit">Сохранить</button>
            <button type="button" onclick="cancelEditDisc('${discId}', '${title}', ${year})">Отмена</button>
        </form>
    `;
}

function cancelEditDisc(discId, title, year) {
    // Находим элемент диска
    const discElement = document.querySelector(`form[onsubmit="saveDiscChanges(event, '${discId}', '${discElement.parentElement.parentElement.id}')"]`).parentElement;

    // Восстанавливаем отображение диска
    discElement.innerHTML = `
        <p>${title} (${year})</p>
        <button onclick="editDisc('${discId}')">Редактировать</button>
        <button onclick="deleteDisc('${discId}')">Удалить</button>
    `;
}

async function saveDiscChanges(event, discId, groupId) {
    event.preventDefault();

    // Получаем данные из формы
    const title = document.getElementById(`edit-title-${discId}`).value.trim();
    const year = parseInt(document.getElementById(`edit-year-${discId}`).value);

    try {
        // Отправляем PUT-запрос на сервер
        const response = await fetch(`${API_URL}/discs/${discId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, band: groupId, year }),
        });

        if (!response.ok) {
            throw new Error("Не удалось сохранить изменения диска.");
        }

        const updatedDisc = await response.json(); // Получаем обновлённые данные с сервера

        // Обновляем отображение диска
        const discElement = document.querySelector(`form[onsubmit="saveDiscChanges(event, '${discId}', '${groupId}')"]`).parentElement;
        discElement.innerHTML = `
            <p>${updatedDisc.title} (${updatedDisc.year})</p>
            <button onclick="editDisc('${updatedDisc.id}')">Редактировать</button>
            <button onclick="deleteDisc('${updatedDisc.id}')">Удалить</button>
        `;
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось сохранить изменения.");
    }
}

async function deleteDisc(discId) {
    if (!confirm("Вы уверены, что хотите удалить этот диск?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/discs/${discId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Ошибка при удалении диска.");
        }

        alert("Диск успешно удален!");

        // Удаляем диск из DOM вместо перезагрузки группы
        const discElement = document.querySelector(`button[onclick="deleteDisc('${discId}')"]`).parentElement;
        discElement.remove();
    } catch (error) {
        console.error("Ошибка:", error.message);
        alert("Не удалось удалить диск.");
    }
}

// Инициализация страницы
document.addEventListener("DOMContentLoaded", () => {
    // Загрузка групп
    fetchGroups();

    // Добавление событий для форм
    document.getElementById("add-group-form").addEventListener("submit", addGroup);
    document.getElementById("search-groups-form").addEventListener("submit", searchGroups);
});
import data from './fetch.js';

// Táblázat oszlopai (felcserélhetőek)
const keys = ['id', 'name', 'emailAddress', 'address'];
const tbody = document.querySelector('.tbody');

// Létrehoz egy elemet és hozzáadja a szülőhöz. Visszaadja a létrehozott elemet.
const createAnyelement = (typeOfEl, parentEl) => {
  const actualEl = document.createElement(typeOfEl);
  parentEl.appendChild(actualEl);
  return actualEl;
};

// Létrehozza az alap gombcsoportot (Módosítás / törlés). Visszatér a gombcsoporttal
const createButtons = () => {
  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('btngroup', 'basic');
  const trashButton = createAnyelement('i', buttonGroup);
  trashButton.classList.add('fas', 'fa-solid', 'fa-trash', 'delete');
  const editButton = createAnyelement('i', buttonGroup);
  editButton.classList.add('fas', 'fa-solid', 'fa-pen-to-square', 'edit');
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(trashButton);

  return buttonGroup;
};

// Táblázathoz hozzáadunk egy új sort
const createNewRow = () => {
  const actualRow = createAnyelement('tr', tbody);
  for (const k of keys) {
    const td = createAnyelement('td', actualRow);
    const input = createAnyelement('input', td);
    input.name = k;
    input.value = '';
  }
  const buttonTd = createAnyelement('td', actualRow);
  const button = createAnyelement('i', buttonTd);
  button.classList.add('fas', 'fa-solid', 'fa-plus', 'newPerson');
};

// A lekért adaokkal feltöltjük a táblázatot
const loadData = (datas) => {
  tbody.innerHTML = '';
  datas.forEach((element, index) => {
    const newEl = createAnyelement('tr', tbody);
    for (const k of keys) {
      const td = createAnyelement('td', newEl);
      const input = createAnyelement('input', td);
      input.value = element[k];
      input.name = k;
      input.classList.add('readOnly');
    }
    newEl.appendChild(createButtons());
  });
  createNewRow(); // nem feletkezünk el az üres sorról sem.
};

loadData(data);

const editbtn = document.querySelectorAll('.edit');
const deletebtn = document.querySelectorAll('.delete');

const changeButton = (row) => {
  const actualBtnGroup = row.querySelector('.btngroup');
  actualBtnGroup.innerHTML = '';
  const saveButton = createAnyelement('i', actualBtnGroup);
  saveButton.classList.add('fas', 'fa-solid', 'fa-floppy-disk', 'save');
  const backButton = createAnyelement('i', actualBtnGroup);
  backButton.classList.add('fas', 'fa-solid', 'fa-arrow-rotate-left', 'back');

  toSave();
  toBack();
};

// Működőképessé tesszük a edit buttont. Kiszűrjük az összeset majd egy event listenert rakunk rá.
function editButton() {
  Array.from(editbtn).forEach((element) => element.addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const actualInputs = Array.from(actualRow.querySelectorAll('input'));
    actualInputs.forEach((item) => item.classList.toggle('readOnly'));
    changeButton(actualRow);
  }));
}

// fetch segítségével töröljük az adatbázisból (is) a rekordot.
const deleteItem = (id) => {
  if (confirm('Biztosan törli a felhasználót?')) {
    fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' }).then(
      (resp) => resp.json(),
      (err) => console.error(`Hiba történt a felhasználó törlésekor:${err}`),
    );
  }
};

// működőképessé tesszük a törlés gombot
function deleteButton() {
  Array.from(deletebtn).forEach((element) => element.addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const actualInput = actualRow.querySelector('td:first-child input');
    const id = actualInput.value;
    deleteItem(id);
  }));
}

deleteButton();
editButton();

// Egy sorból kiszedi az értékeket és visszaküldi azt
const getRowData = (tr) => {
  const arrayData = tr.querySelectorAll('input');
  const objectData = {};
  Array.from(arrayData).map((item) => {
    objectData[item.name] = item.value;
    return objectData;
  });
  return objectData;
};

// Visszaállítja az eredeti edit/trash buttonokat. Kell ez egyáltalán?
const basicIcons = (row) => {
  const actualBtnGroup = row.querySelector('.btngroup');
  actualBtnGroup.innerHTML = '';
  const editBtn = createAnyelement('i', actualBtnGroup);
  editBtn.classList.add('fas', 'fa-solid', 'fa-pen-to-square');
  const trashButton = createAnyelement('i', actualBtnGroup);
  trashButton.classList.add('fas', 'fa-solid', 'fa-trash');
  /* deleteButton();
  editButton(); */
};

// KÉRDÉS-------------------------------------------------------------------------------
function toSave() {
  document.querySelector('.save').addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const toSaveData = getRowData(actualRow);
    basicIcons(actualRow);
    const fetchOptions = {
      method: 'PUT',
      mode: 'cors',
      cache: 'no-cache',
      body: JSON.stringify(toSaveData),
      headers: {
        'Content-type': 'application/json',
      },
    };
    fetch(`http://localhost:3000/users/${toSaveData.id}`, fetchOptions)
      .then(
        (res) => res.json(),
        (error) => console.error(error),
      )
      .then((data) => loadData());
  });
}
// KÉRDÉS--------------------------------------------------------------------------------------------
function toBack() {
  document.querySelector('.back').addEventListener('click', (e) => {
    /*     const actualRow = e.target.parentElement.parentElement;
    basicIcons(actualRow); */
    fetch('http://localhost:3000/users')
      .then(
        (res) => res.json(),
        (error) => console.error(error),
      )
      .then((data) => loadData(data));
  });
}

// Új rekord elküldése a szerverre
const sendPerson = (newItem) => {
  const fetchOptions = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    body: JSON.stringify(newItem),
    headers: {
      'Content-type': 'application/json',
    },
  };
  fetch('http://localhost:3000/users', fetchOptions)
    .then(
      (res) => res.json(),
      (error) => console.error(error),
    )
    .then((data) => {
      loadData(data);
    });
};

// Új rekord felvétele
const newPerson = () => {
  document.querySelector('.newPerson').addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const newPersonObj = getRowData(actualRow); // kinyerjük egy sorból az adatot
    delete newPersonObj.id; // minusz az id. Az nem kell
    sendPerson(newPersonObj);
  });
};
newPerson();

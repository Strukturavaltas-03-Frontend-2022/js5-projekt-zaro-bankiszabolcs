import data from './fetch.js';
import validator from './patterns.js';
import { openModal, closeModal } from './modal.js';

let editable = true;

// Modal elemek
const escapeButton = document.querySelector('.modal__button--escape');
const okayButton = document.querySelector('.modal__button--affirmative');
const cancelButton = document.querySelector('.modal__button--negative');
const overLay = document.querySelector('.overlay');
const modal = document.querySelector('.modal');

// Táblázat oszlopai (felcserélhetőek)
const keys = ['id', 'name', 'emailAddress', 'address'];
const tbody = document.querySelector('.tbody');

// Létrehoz egy elemet és hozzáadja a szülőhöz. Visszaadja a létrehozott elemet.
// Position = elejére vagy a végére.
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
  trashButton.onclick = function (e) {
    const actualRow = e.target.parentElement.parentElement;
    const actualInput = actualRow.querySelector('td:first-child input');
    const id = actualInput.value;
    deleteItem(id, actualRow);
  };
  const editButton = createAnyelement('i', buttonGroup);
  editButton.classList.add('fas', 'fa-solid', 'fa-pen-to-square', 'edit');
  editButton.onclick = function (e) {
    if (editable) {
      const actualRow = e.target.parentElement.parentElement;
      const actualInputs = Array.from(actualRow.querySelectorAll('input'));
      actualInputs.forEach((item) => item.classList.remove('readOnly'));
      changeButton(actualRow);
    } else {
      openModal(true, 'Hiba', 'Először fejezd be az előző elem szerkesztését!');
    }
  };
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(trashButton);

  return buttonGroup;
};

const createPlusButton = (row) => {
  const buttonTd = createAnyelement('td', row);
  const button = createAnyelement('i', buttonTd);
  button.classList.add('fas', 'fa-solid', 'fa-plus', 'newPerson');
};

// Táblázathoz hozzáadunk egy új sort
const createNewRow = (newObj = '', emptyLine = true) => {
  const actualRow = createAnyelement('tr', tbody);
  for (const k of keys) {
    const td = createAnyelement('td', actualRow);
    const input = createAnyelement('input', td);
    input.name = k;
    input.value = newObj[k] ? newObj[k] : '';
  }
  newObj ? actualRow.appendChild(createButtons()) : createPlusButton(actualRow);
  if (!emptyLine) tbody.insertBefore(actualRow, tbody.children[0]);
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

// MODAL THINGS
function makeModal() {
  escapeButton.addEventListener('click', closeModal);
  overLay.addEventListener('click', closeModal);
  okayButton.addEventListener('click', closeModal);
  cancelButton.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}

makeModal();

const changeButton = (row) => {
  editable = false;
  console.log(editable);
  const actualBtnGroup = row.querySelector('.btngroup');
  actualBtnGroup.innerHTML = '';
  const saveButton = createAnyelement('i', actualBtnGroup);
  saveButton.classList.add('fas', 'fa-solid', 'fa-floppy-disk', 'save');
  const backButton = createAnyelement('i', actualBtnGroup);
  backButton.classList.add('fas', 'fa-solid', 'fa-arrow-rotate-left', 'back');

  toSave(saveButton);
  toBack(backButton);
};

// fetch segítségével töröljük az adatbázisból (is) a rekordot.
const deleteItem = (id, actualRow) => {
  if (confirm('Biztosan törli a felhasználót?')) {
    actualRow.remove();
    fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' }).then(
      (resp) => resp.json(),
      (err) => openModal(true, 'Váratlan hiba', `Hiba az adat törlésekor: ${err}`),
    );
  }
};

// Egy sorból kiszedi az értékeket és visszaküldi azt
const getRowData = (tr) => {
  const arrayData = tr.querySelectorAll('input');
  const objectData = {};
  Array.from(arrayData).map((item) => {
    objectData[item.name] = item.value;
  });
  return objectData;
};

// Visszaállítja az eredeti edit/trash buttonokat. 
const basicIcons = (row) => {
  const actualBtnGroup = row.querySelector('.btngroup');
  actualBtnGroup.innerHTML = '';
  const editBtn = createAnyelement('i', actualBtnGroup);
  editBtn.classList.add('fas', 'fa-solid', 'fa-pen-to-square');
  const trashButton = createAnyelement('i', actualBtnGroup);
  trashButton.classList.add('fas', 'fa-solid', 'fa-trash');
};

// Sorok frissítése
// ID kitörlése az objektumból és az inputtömbből is
const updateRow = (row, newValue) => {
  Array.from(row.querySelectorAll('input')).splice(0, 1).forEach((element) => {
    element.value = newValue[element.name];
  });
};

function toSave(item) {
  item.addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const toSaveData = getRowData(actualRow);
    Array.from(actualRow.querySelectorAll('input')).forEach((input) => input.classList.add('readOnly'));
    if (validator(toSaveData)) {
      basicIcons(actualRow);
      updateRow(actualRow, toSaveData);
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
          (error) => openModal(true, 'Váratlan hiba', `Hiba az adatok feltöltésekor: ${error}`),
        );

      openModal(false, 'Sikeres módosítás', 'Gratulálunk! Sikeresen módosítottad az adatokat!');
      editable = true;
    } else {
      openModal();
    }
  });
}

function toBack(item) {
  item.addEventListener('click', () => {
    fetch('http://localhost:3000/users')
      .then(
        (res) => res.json(),
        (error) => openModal(true, 'Váratlan hiba', `Hiba az adatok lekérésekor: ${error}`),
      )
      .then((oldData) => loadData(oldData));
    editable = true;
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
      (error) => openModal(true, 'Váratlan hiba', `Hiba az adatok feltöltésekor: ${error}`),
    )
    .then((newData) => {
      createNewRow(newData, false);
    });
  openModal(false, 'Sikeres feltöltés', 'Gratulálunk! Sikeresen hozzáadtál egy új embert a táblázathoz');
};

// Új rekord felvétele
const newPerson = () => {
  document.querySelector('.newPerson').addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const newPersonObj = getRowData(actualRow); // kinyerjük egy sorból az adatot
    delete newPersonObj.id; // minusz az id. Az nem kell
    if (validator(newPersonObj)) {
      Array.from(actualRow.querySelectorAll('input')).forEach((element) => {
        element.value = '';
      });
      sendPerson(newPersonObj);
    } else {
      openModal();
    }
  });
};
newPerson();

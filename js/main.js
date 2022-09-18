const keys = ['id', 'name', 'emailAddress', 'address'];

const tbody = document.querySelector('.tbody');

const patterns = {
  /* name: /^[A-Ű][a-űA-Ű\-]{2,9} +[A-Ű][a-ű]{2,9}( +[A-Ű][a-ű])?$/,
  email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  address: /^[A-ZÁÉÓŐÜŰÖ][a-zőöüóúű]/, */
  name: /\w/,
  email: /\w/,
  address: /\w/,
};

const getData = async (url) => {
  try {
    const resolve = await fetch(url);
    const result = await resolve.json();
    return result;
  } catch (error) {
    console.error('Hiba történt az adatbázis betöltésekor');
    return '';
  }
};

const data = await getData('http://localhost:3000/users');

const createAnyelement = (typeOfEl, parentEl) => {
  const actualEl = document.createElement(typeOfEl);
  parentEl.appendChild(actualEl);
  return actualEl;
};

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
  createNewRow();
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
  /* actualBtnGroup.appendChild(saveButton);
  actualBtnGroup.appendChild(backButton); */
  toSave();
  toBack();
};

const editButton = () => {
  Array.from(editbtn).forEach((element) => element.addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const actualInputs = Array.from(actualRow.querySelectorAll('input'));
    actualInputs.forEach((item) => item.classList.toggle('readOnly'));
    changeButton(actualRow);
  }));
};

const deleteItem = (id) => {
  if (confirm('Biztosan törli a felhasználót?')) {
    fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' })
      .then((resp) => resp.json(), (err) => console.error(`Hiba történt a felhasználó törlésekor:${err}`))
      .then((json) => console.log(json));
  }
};

const deleteButton = () => {
  Array.from(deletebtn).forEach((element) => element.addEventListener('click', (e) => {
    e.preventDefault();
    const actualRow = e.target.parentElement.parentElement;
    const actualInput = actualRow.querySelector('td:first-child input');
    const id = actualInput.value;
    deleteItem(id);
  }));
};

/* const checkInput = (text, pattern) => pattern.test(text); */

const getRowData = (tr) => {
  const arrayData = tr.querySelectorAll('input');
  const objectData = {};
  Array.from(arrayData).map((item) => {
    objectData[item.name] = item.value;
    return objectData;
  });
  return objectData;
};

const basicIcons = (row) => {
  const actualBtnGroup = row.querySelector('.btngroup');
  actualBtnGroup.innerHTML = '';
  const editBtn = createAnyelement('i', actualBtnGroup);
  editBtn.classList.add('fas', 'fa-solid', 'fa-pen-to-square');
  const trashButton = createAnyelement('i', actualBtnGroup);
  trashButton.classList.add('fas', 'fa-solid', 'fa-trash');
  deleteButton();
  editButton();
};

// jöjjön vissza az eredeti két ikon
const toSave = () => {
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
    fetch(`http://localhost:3000/users/${toSaveData.id}`, fetchOptions).then((res) => res.json(), (error) => console.error(error))
      .then((data) => loadData());
  });
};

const toBack = () => {
  document.querySelector('.back').addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    basicIcons(actualRow);
    fetch('http://localhost:3000/users').then((res) => res.json(), (error) => console.error(error))
      .then((data) => loadData(data));
  });
};

deleteButton();
editButton();

const newPerson = () => {
  document.querySelector('.newPerson').addEventListener('click', (e) => {
    const actualRow = e.target.parentElement.parentElement;
    const newPersonObj = getRowData(actualRow);
    delete newPersonObj.id;

    const fetchOptions = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      body: JSON.stringify(newPersonObj),
      headers: {
        'Content-type': 'application/json',
      },
    };
    fetch('http://localhost:3000/users', fetchOptions).then((res) => res.json(), (error) => console.error(error))
      .then((data) => {
        console.log(data);
        loadData();
      });
  });
};
newPerson();

const overLay = document.querySelector('.overlay');
const modal = document.querySelector('.modal');

const defaultModal = {
  header: 'hiba',
  text: '  Hiba az adatok bevitelében. Kérlek adj meg egy nevet, email-címet és lakcímet. (Pl. Lüke Aladár, luke_aladar@gmail.com, 1232 Budapest Inga utca 22.)',
};

export const closeModal = function () {
  overLay.classList.add('hidden');
  modal.classList.add('hidden');
};

export const openModal = function (
  isItWarning = true,
  header = defaultModal.header,
  text = defaultModal.text,
) {
  !isItWarning ? modal.classList.add('modal--white') : modal.classList.remove('modal--white');
  modal.querySelector('h1').textContent = header;
  modal.querySelector('.modal__text').textContent = text;
  overLay.classList.remove('hidden');
  modal.classList.remove('hidden');
  modal.focus();
  setTimeout(closeModal, 5000);
};

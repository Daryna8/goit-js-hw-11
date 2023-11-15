import { PixabayAPI } from './pixabay-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  formEl: document.querySelector('#search-form'),
  galleryListEl: document.querySelector('.gallery'),
};
console.log(refs.formEl);

const pixabayAPI = new PixabayAPI();

refs.formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();

  const { target: formEl } = event;

  pixabayAPI.query = formEl.elements.searchQuery.value;
  pixabayAPI.page = 1;

  pixabayAPI.fetchPhotosByQuery().then(res => {
    console.log(res);

    if (res.total === 0) {
      refs.galleryListEl.innerHTML = '';

      // loadMoreBtnEl.classList.add('is-hidden');

      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      // searchFormEl.reset();

      return;
    }

    refs.galleryListEl.innerHTML = renderPhotos(res);
  });
}

function photoTemplate(photo) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = photo;
  return `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item-value">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
  </div>
</div >`;
}

// webformatURL - посилання на маленьке зображення для списку карток.
// largeImageURL - посилання на велике зображення.
// tags - рядок з описом зображення. Підійде для атрибуту alt.
// likes - кількість лайків.
// views - кількість переглядів.
// comments - кількість коментарів.
// downloads - кількість завантажень.

function photosTemplate(photosArr) {
  return photosArr.hits.map(photoTemplate).join('');
}

function renderPhotos(photosArr) {
  return photosTemplate(photosArr);
}

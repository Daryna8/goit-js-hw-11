import { PixabayAPI } from './pixabay-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  formEl: document.querySelector('#search-form'),
  galleryListEl: document.querySelector('.gallery'),
  loadMoreBtnEl: document.querySelector('.load-more'),
};

const pixabayAPI = new PixabayAPI();

refs.formEl.addEventListener('submit', onFormSubmit);
refs.loadMoreBtnEl.addEventListener('click', onLoadMoreBtnClick);

async function onFormSubmit(event) {
  event.preventDefault();

  const { target: formEl } = event;

  pixabayAPI.query = formEl.elements.searchQuery.value;
  pixabayAPI.page = 1;

  try {
    const res = await pixabayAPI.fetchPhotosByQuery();
    console.log(res);
    if (res.total === 0) {
      refs.galleryListEl.innerHTML = '';

      refs.loadMoreBtnEl.classList.add('is-hidden');

      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      refs.formEl.reset();

      return;
    }

    refs.galleryListEl.innerHTML = renderPhotos(res);
    refs.loadMoreBtnEl.classList.remove('is-hidden');
  } catch (err) {
    console.log(err);
  }
}

async function onLoadMoreBtnClick(event) {
  pixabayAPI.page += 1;

  refs.loadMoreBtnEl.classList.add('is-hidden');

  const res = await pixabayAPI.fetchPhotosByQuery();
  try {
    refs.galleryListEl.insertAdjacentHTML('beforeend', renderPhotos(res));

    if (res.totalHits === pixabayAPI.page) {
      refs.loadMoreBtnEl.classList.add('is-hidden');

      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (err) {
    console.log(err);
  }

  refs.loadMoreBtnEl.classList.remove('is-hidden');
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

function photosTemplate(photosArr) {
  return photosArr.hits.map(photoTemplate).join('');
}

function renderPhotos(photosArr) {
  return photosTemplate(photosArr);
}

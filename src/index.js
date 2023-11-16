import { PixabayAPI } from './pixabay-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formEl: document.querySelector('#search-form'),
  galleryListEl: document.querySelector('.gallery'),
  loadMoreBtnEl: document.querySelector('.load-more'),
  targetInfiniteScrollObserverEl: document.querySelector(
    '.js-target-infinite-scroll'
  ),
};

const pixabayAPI = new PixabayAPI();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  capttionDelay: 250,
});

refs.formEl.addEventListener('submit', onFormSubmit);

async function loadMorePhotos(entries, observer) {
  if (!entries[0].isIntersecting) {
    return;
  }

  pixabayAPI.page += 1;

  try {
    const res = await pixabayAPI.fetchPhotosByQuery();

    refs.galleryListEl.insertAdjacentHTML('beforeend', renderPhotos(res));
    lightbox.refresh();

    if (res.totalHits === pixabayAPI.page) {
      stopScrolling(observer);
    }
  } catch (err) {
    if (err.response.status === 400) {
      stopScrolling(observer);
      return;
    }
    console.log(err);
  }
}

const infinityScrollObserver = new IntersectionObserver(loadMorePhotos, {
  root: null,
  rootMargin: '0px 0px 400px 0px',
  threshold: 1,
});

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

      infinityScrollObserver.unobserve(refs.targetInfiniteScrollObserverEl);

      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      refs.formEl.reset();

      return;
    }
    Notify.success(`Hooray! We found ${res.totalHits} images.`);
    refs.galleryListEl.innerHTML = renderPhotos(res);
    lightbox.refresh();

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    setTimeout(() => {
      infinityScrollObserver.observe(refs.targetInfiniteScrollObserverEl);
    }, 300);
  } catch (err) {
    console.log(err);
  }
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
   <a class="gallery__link" href="${largeImageURL}">
   <img src="${webformatURL}" alt="${tags}" loading="lazy" />
 </a>
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

function stopScrolling(observer) {
  observer.unobserve(refs.targetInfiniteScrollObserverEl);
  Notify.info("We're sorry, but you've reached the end of search results.");
}

import pixabay from 'pixabay-api';
import axios from 'axios';
//
export class PixabayAPI {
  constructor() {
    this.query = null;
    this.page = 1;
    axios.defaults.baseURL = 'https://pixabay.com';
  }

  async fetchPhotosByQuery() {
    const pixabayOptions = {
      params: {
        key: '40690513-b077cfa16de2d7f38a98e7259',
        q: this.query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: this.page,
        per_page: 40,
      },
    };
    const res = await axios.get('/api/', pixabayOptions);
    return res.data;
  }
}

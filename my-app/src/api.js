import axios from 'axios';

// change baseURL if your backend runs elsewhere
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export default API;

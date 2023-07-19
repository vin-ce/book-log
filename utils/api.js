import axios from 'axios'

export const googleBookAPI = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1/volumes',
  timeout: 1000,
  header: {}
})
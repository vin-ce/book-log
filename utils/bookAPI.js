import { googleBookAPI } from './api'



export async function searchBookByText({ searchInput, startIndex, maxResults }) {

  // flowers+inauthor:keyes
  const searchSlug = parseInputToSlug(searchInput)

  // return await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchSlug}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&maxResults=3`)
  return await googleBookAPI.get(`?q=${searchSlug}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&maxResults=${maxResults}&fields=items(id,volumeInfo(authors,description,title,subtitle))&startIndex=${startIndex}`)
    .then((res) => {

      if (Object.keys(res.data).length === 0) return { data: null, startIndex }

      let booksData = []

      res.data.items.forEach(data => {
        const info = data.volumeInfo
        const id = data.id
        booksData.push(
          {
            ...info,
            imageUrl: getBigImageUrl(id),
            id,
          }
        )
      })

      return booksData
    }).catch((err) => {
      console.log('err', err)
      return null
    })
}

export async function searchBookById(bookId) {

  return await googleBookAPI.get(`/${bookId}?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`)
    .then((res) => {
      const id = res.data.id
      const info = res.data.volumeInfo

      return {
        id,
        authors: info.authors,
        description: info.description,
        title: info.title,
        subtitle: info.subtitle,
        publishedDate: info.publishedDate,
        pageCount: info.pageCount,
        imageUrl: getBigImageUrl(id),
        publisher: info.publisher,
      }

    }).catch((err) => {
      console.log('search book by id ERR', err)
      return null
    })
}

function parseInputToSlug(input) {
  // encodes input string to ready for slug
  const encoded = encodeURIComponent(input)
  // replace space with + 
  const modified = encoded.replace(/%20/g, "+");

  return modified
}

function getBigImageUrl(id) {
  return `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w1200-h1200&source=gbs_api
  ` }

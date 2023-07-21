import { create } from "zustand"

export const useStore = create((set) => ({
  loggedInUser: null,
  setLoggedInUser: (userData) => set({ loggedInUser: userData }),
  setLoggedOut: () => set({ loggedInUser: null }),

  // {
  //   searchResults: []
  //   searchString: ""
  //   startIndex: 
  //   page: 
  // }
  searchData: null,
  setSearchResultData: (data) => set({ searchData: data }),

  isAuthorizedForUserBook: false,
  setIsAuthorizedForUserBook: (bool) => set({ isAuthorizedForUserBook: bool }),

  selectedBookUserUsername: null,
  setSelectedBookUserUsername: (username) => set({ selectedBookUserUsername: username }),

  selectedBookUserId: null,
  setSelectedBookUserId: (id) => set({ selectedBookUserId: id }),

  selectedBookId: null,
  setSelectedBookId: (id) => set({ selectedBookId: id }),

  userBookStatus: null,
  setUserBookStatus: (status) => set({ userBookStatus: status }),

  userBookRating: null,
  setUserBookRating: (status) => set({ userBookRating: status }),

  // shelves that the selectedBook is in that's created by the user
  userBookShelfIdList: null,
  setUserBookShelfIdList: (arr) => set({ userBookShelfIdList: arr }),

  userBookNotes: null,
  setUserBookNotes: (arr) => set({ userBookNotes: arr }),

  isAddBookToShelfModal: false,
  setIsAddBookToShelfModal: (bool) => set({ isAddBookToShelfModal: bool }),

  isSetBookRatingModal: false,
  setIsSetBookRatingModal: (bool) => set({ isSetBookRatingModal: bool }),

  isCreateTweetNoteModal: false,
  setIsCreateTweetNoteModal: (bool) => set({ isCreateTweetNoteModal: bool }),
  isCreateTextNoteModal: false,
  setIsCreateTextNoteModal: (bool) => set({ isCreateTextNoteModal: bool }),



}))

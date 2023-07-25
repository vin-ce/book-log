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

  isAuthorizedForSelectedUser: false,
  setIsAuthorizedForSelectedUser: (bool) => set({ isAuthorizedForSelectedUser: bool }),

  selectedUserUsername: null,
  setSelectedUserUsername: (username) => set({ selectedUserUsername: username }),

  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  selectedBookId: null,
  setSelectedBookId: (id) => set({ selectedBookId: id }),

  userBookStatus: null,
  setUserBookStatus: (status) => set({ userBookStatus: status }),

  userBookReadDate: null,
  setUserBookReadDate: (date) => set({ userBookReadDate: date }),

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

  isSetBookReadDateModal: false,
  setIsSetBookReadDateModal: (bool) => set({ isSetBookReadDateModal: bool }),

  isCreateTweetNoteModal: false,
  setIsCreateTweetNoteModal: (bool) => set({ isCreateTweetNoteModal: bool }),
  isCreateTextNoteModal: false,
  setIsCreateTextNoteModal: (bool) => set({ isCreateTextNoteModal: bool }),

  userAllShelves: null,
  setUserAllShelves: (data) => set({ userAllShelves: data }),

  isCreateShelfModal: false,
  setIsCreateShelfModal: (bool) => set({ isCreateShelfModal: bool }),

  isCreateMaterialModal: false,
  setIsCreateMaterialModal: (bool) => set({ isCreateMaterialModal: bool }),


  selectedShelfInfo: null,
  setSelectedShelfInfo: (data) => set({ selectedShelfInfo: data }),

  selectedShelfBookIds: null,
  setSelectedShelfBookIds: (books) => set({ selectedShelfBookIds: books }),


}))

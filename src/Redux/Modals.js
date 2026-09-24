import { createSlice } from "@reduxjs/toolkit";

export const branchId = createSlice({
  name: "addform",
  initialState: {
    value: null,
  },
  reducers: {
    branchAdd: (state, action) => {
      state.value = action.payload;
    },
  },
});
export const addFormModalSlice = createSlice({
  name: "addform",
  initialState: {
    show: false,
  },
  reducers: {
    toggleForm: (state) => {
      state.show = !state.show;
    },
  },
});

export const toggleSpinneraAndDisableButtonSlice = createSlice({
  name: "addform",
  initialState: {
    show: false,
  },
  reducers: {
    toggleSpinnerAndDisableButton: (state, action) => {
      state.show = action.payload;
    },
  },
});

export const removeModalSlice = createSlice({
  name: "remove",
  initialState: {
    show: false,
    message: "",
  },
  reducers: {
    showModal: (state, action) => {
      state.show = !state.show;
      if (action.payload) {
        state.message = action.payload;
      }
    },
    hideModal: (state) => {
      state.show = false;
      state.message = "";
    },
  },
});
export const remarksModalSlice = createSlice({
  name: "remarks",
  initialState: {
    show: false,
    message: "",
  },
  reducers: {
    showRemarksModal: (state, action) => {
      state.show = !state.show;
      if (action.payload) {
        state.message = action.payload;
      }
    },
    hideRemarksModal: (state) => {
      state.show = false;
      state.message = "";
    },
  },
});
export const userModalRightSlice = createSlice({
  name: "userRight",
  initialState: {
    data: null
  },
  reducers: {
    showUserRight: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { toggleForm } = addFormModalSlice.actions;
export const { branchAdd } = branchId.actions;
export const { showModal, hideModal } = removeModalSlice.actions;
export const { showRemarksModal, hideRemarksModal } = remarksModalSlice.actions;
export const { showUserRight } = userModalRightSlice.actions;
export const { toggleSpinnerAndDisableButton } = toggleSpinneraAndDisableButtonSlice.actions;

export default {
  addFormModalSlice: addFormModalSlice.reducer,
  branchId: branchId.reducer,
  removeModalSlice: removeModalSlice.reducer,
  toggleSpinneraAndDisableButtonSlice:
    toggleSpinneraAndDisableButtonSlice.reducer,
  remarksModalSlice: remarksModalSlice.reducer,
  userModalRightSlice: userModalRightSlice.reducer,
};

import { configureStore } from "@reduxjs/toolkit";
import modalReducers from "./Modals";

export const store = configureStore({
  reducer: {
    addFormButton: modalReducers.addFormModalSlice,
    removeModal: modalReducers.removeModalSlice,
    branch: modalReducers.branchId,
    toggleSpinnerAndDisableButton:
      modalReducers.toggleSpinneraAndDisableButtonSlice,
    remarksModal: modalReducers.remarksModalSlice,
    getUserRight: modalReducers.userModalRightSlice,
  },
});

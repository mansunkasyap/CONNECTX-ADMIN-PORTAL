
export const authUser = (data) => {
  localStorage.setItem("auth", JSON.stringify(data));
};
export const getAuthUser = () => {
  return localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : null;
};
export const authShareUser = (data) => {
  sessionStorage.setItem("auth", JSON.stringify(data));
};
export const getAuthShareUser = () => {
  return sessionStorage.getItem("auth")
    ? JSON.parse(sessionStorage.getItem("auth"))
    : null;
};

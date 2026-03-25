// src/utils/fakeAuth.js

const FAKE_USER_UUID = "123e4567-e89b-12d3-a456-426614174000"; // Cambia este UUID si lo necesitas
const LOCAL_STORAGE_KEY = "user_uuid";

export function loginWithFakeUUID() {
  localStorage.setItem(LOCAL_STORAGE_KEY, FAKE_USER_UUID);
  return FAKE_USER_UUID;
}

export function getFakeUserUUID() {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
}

export function logoutFakeUser() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

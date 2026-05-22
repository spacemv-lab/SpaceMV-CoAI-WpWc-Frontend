/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import Cookies from 'js-cookie';

const TokenKey = 'Admin-Token'
const NewTokenKey = 'New-Admin-Token'

const ExpiresInKey = 'Admin-Expires-In';

export function getToken() {
  return Cookies.get(TokenKey);
}

export function getNewToken() {
  return Cookies.get(NewTokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token);
}

export function setNewToken(token) {
  return Cookies.set(NewTokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}

export function getExpiresIn() {
  return Cookies.get(ExpiresInKey) || -1;
}

export function setExpiresIn(time) {
  return Cookies.set(ExpiresInKey, time);
}

export function removeExpiresIn() {
  return Cookies.remove(ExpiresInKey);
}

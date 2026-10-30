import { request } from './client.js';

export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { username, password },
    authenticated: false
  });
}

export function register(username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: { username, password },
    authenticated: false
  });
}

/** USERNAME INIT */
const username = document.getElementById('username')
username.addEventListener('focus', () => {
  username.placeholder = ''
});
username.addEventListener('blur', () => {
  username.placeholder = 'Username'
});

/** PASSWORD INIT */
const password = document.getElementById('password')
password.addEventListener('focus', () => {
  password.placeholder = ''
});
password.addEventListener('blur', () => {
  password.placeholder = 'Password'
});
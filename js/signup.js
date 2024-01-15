const usernameInput = document.getElementById('username')
usernameInput.addEventListener('focus', () => {
  usernameInput.placeholder = ''
});
usernameInput.addEventListener('blur', () => {
  usernameInput.placeholder = 'Username'
});

const passwordInput = document.getElementById('password')
passwordInput.addEventListener('focus', () => {
  passwordInput.placeholder = ''
});
passwordInput.addEventListener('blur', () => {
  passwordInput.placeholder = 'Password'
});
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

// $.ajax({
//   url: '//localhost:3000/php/login.php',
//   method: 'POST',
//   dataType: 'json',
//   success: function (data) {
//       alert(data);
//   },
//   error: function (jqXHRException, textStatus, errorThrown) {
//       console.log('errorThrown: ' + errorThrown);
//   }
// });

// $.ajax({
//   url: '//localhost:3000/php/signup.php',
//   method: 'POST',
//   dataType: 'json',
//   success: function (data) {
//       alert(data);
//   }, 
//   error: function (jqXHRException, textStatus, errorThrown) {
//     console.log('errorThrown: ' + errorThrown);
// }
// });
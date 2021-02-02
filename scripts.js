const handler = document.querySelector('#switch');

function changeTheme() {
  if (handler.checked) (
    document.documentElement.setAttribute('color-scheme', 'dark')
  )
  else
    (
    document.documentElement.setAttribute('color-scheme', 'light')
  )
}

handler.addEventListener('change', function () { changeTheme() });
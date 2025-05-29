

function includeVersion() {
  let elm, file, xhttp;
  elm = document.getElementById("version-include");
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        elm.innerHTML = this.responseText;
      } else {
        elm.innerHTML = 'Unset';
      }
    }
  }
  xhttp.open("GET", '/version.txt', true);
  xhttp.send();
  return;
}
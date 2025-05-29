
function checkButtons() {
  const roomId = document.getElementById('roomId').value;
  const name = document.getElementById('userName').value;
  const joinBtn = document.getElementById('joinBtn');
  const newRoomBtn = document.getElementById('newRoomBtn');
  joinBtn.disabled = (roomId.trim() === '' || name.trim() === '');
  newRoomBtn.disabled = (name.trim() === '' || roomId.trim() !== '');
}

function redirectToRoom() {
      const userName = document.getElementById('userName').value;

  document.cookie = "userName=" + encodeURIComponent(userName) + "; path=/; max-age=3600"; // expires in 1 hour
  sessionStorage.setItem("userName", userName);

  const roomId = document.getElementById('roomId').value.trim();
  if (roomId !== '') {
    window.location.href = `/room/${encodeURIComponent(roomId)}`;
  }
}

function createNewRoom() {
          const userName = document.getElementById('userName').value;

  document.cookie = "userName=" + encodeURIComponent(userName) + "; path=/; max-age=3600"; // expires in 1 hour
  sessionStorage.setItem("userName", userName);

  const newRoomId = generateUUID();
  window.location.href = `/room/${newRoomId}`;
}
function generateUUID() {
  // UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

function setUserName() {
  const userName = getCookie("userName");
  document.getElementById('userName').value = userName;
}

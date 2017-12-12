$(document).ready(function () {
  $('.submit_on_enter').keydown(function(event) {
    // enter has keyCode = 13, change it if you want to use another button
    if (event.keyCode == 13) {
      event.preventDefault();
      sendMessage();
      return false;
    }
  });
});

function initChat(inputSocket) {
    inputSocket.on('server chat sent', chat_received);

}

function sendMessage() {
    let message = document.getElementById("chat-input").value;
    document.getElementById("chat-input").value = "";
    let data = new Object();
    data.message = message;
    data.user_id = document.getElementById("userId").value;
    data.user = document.getElementById("user").value;
    socket.emit('client chat message', data);
}

function chat_received(message) {
    var liNode, liText, ulMessages, chat_box;
    debugger;
    chat_box = document.getElementById("chat-box");
    ulMessages = document.getElementById("messages");

    liNode = document.createElement("LI");
    liText = document.createTextNode(message);
    liNode.appendChild(liText);

    ulMessages.appendChild(liNode);

    chat_box.scrollTop = chat_box.scrollHeight;
}

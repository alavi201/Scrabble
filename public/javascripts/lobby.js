let socket;

$(document).ready(function() {
    socket = io('/lobby');
    initChat(socket);    
});
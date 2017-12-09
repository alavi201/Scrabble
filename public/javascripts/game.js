let current_play = [];
let socket;

function attach_sockect_events( socket ){
    socket.on('tile', tile_broadcast_received);
}

function add_events( socket ){
    $('#play').on('click', play_clicked(socket));
    $('.rack.letter').on('click', rack_letter_clicked);
    $('.board_tile').on('click', board_tile_clicked)
}

function play_clicked( socket ){        
    socket.emit('tile',current_play);
    console.log(current_play);
    $('.empty').each(function(i, obj){
        $(this).html(String.fromCharCode(Math.floor(Math.random() * 26) + 65));
    });
    current_play = [];
    return false;
}

function rack_letter_clicked(){
    $('.rack.letter').removeClass('active');
    $(this).addClass('active');
}
    
function board_tile_clicked(){  
    let active_letter = $('.rack.letter.active');
    $(this).html($('.rack.letter.active').text());
    let letter = new Object();
    letter.row = $(this).data('row');
    letter.column = $(this).data('column');
    letter.value = active_letter.text();
    active_letter.text('');
    active_letter.addClass('empty');
    current_play.push(letter);
}
   
function tile_broadcast_received( word ){
    $(word).each(function(i, letter){
        //console.log(letter);
        $('td[data-column='+letter.column+'][data-row='+letter.row+']').html(letter.value);
    });
    
    $('#tile_count').html('54');
}

$(document).ready(function() {
    socket = io('/game');
    initChat(socket);    
    attach_sockect_events(socket);
    add_events(socket);
    
});
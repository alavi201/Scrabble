let current_play = [];
let tiles_to_swap = [];
let socket;

function attach_sockect_events( socket ){
    socket.on('tile', tile_broadcast_received);
    socket.on('swap', swap_received);
}

function swap_received(swapped_tiles){
    $('.swapped').each(function(i, letter){
      $(this).html(swapped_tiles[i].value);
    });
    
  }

function add_events( socket ){
    $('#play').on('click', play_clicked(socket));
    $('.rack.letter').on('click', rack_letter_clicked);
    $('.board_tile').on('click', board_tile_clicked);
    $('#swap').on('click', swap_clicked);
    $(document).on('click', '.rack.swappable',rack_swappable_clicked);
    $('.confirmation').on('click', confirmation_clicked);
}

function swap_clicked(){
    $('.rack.letter').removeClass('letter').addClass('swappable');
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

function rack_swappable_clicked(){
    $(this).addClass('swapped');
    $(this).css('background-color','#f7f6a8');

    let letter = new Object();
    letter.game_tile_id = $(this).data('row_id');
    tiles_to_swap.push(letter);
}

function confirmation_clicked(){
    socket.emit('swap',tiles_to_swap);
    console.log(tiles_to_swap);
    tiles_to_swap = [];
    return false;
}

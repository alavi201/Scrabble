let current_play = [];
let tiles_to_swap = [];
let socket;

function attach_sockect_events( socket ){
    socket.on('tile', tile_broadcast_received);
    socket.on('swap', swap_received);
    socket.on('create rack', create_rack);
    socket.on('display players', display_players);
    socket.on('display board', display_board);
    socket.on('turn', turn);
}

function swap_received(swapped_tiles){
    $('.swapped').each(function(i, letter){
      $(this).html(swapped_tiles[i].value);
      $(this).html(swapped_tiles[i]).addClass( swapped_tiles[i].value.toLowerCase() )
    }); 
}

function add_events( socket ){
    $('#play').on('click', function(){play_clicked(socket)});
    $(document).on('click', '.rack.letter', rack_letter_clicked);
    $(document).on('click', '.board_tile', board_tile_clicked);
    $(document).on('click', '#swap', swap_clicked);
    $(document).on('click', '.rack.swappable',rack_swappable_clicked);
    $(document).on('click', '.confirmation', confirmation_clicked);
    $('#pass').on('click', function(){pass_clicked(socket)});    
}

function swap_clicked(){
    $('.rack.letter').removeClass('letter').addClass('swappable');
}

function play_clicked( socket ){
    let data = get_client_data();
    data.play = current_play;

    socket.emit('tile',data);
    
    console.log(current_play);
    $('.empty').each(function(i, obj){
        $(this).html(String.fromCharCode(Math.floor(Math.random() * 26) + 65));
    });
    current_play = [];
    return false;
}

function pass_clicked( socket ){        
    socket.emit('pass',Array());
    console.log('pass move');
    $('#play').attr('disabled', true);
    $('#swap').attr('disabled', true);
    $('#pass').attr('disabled', true);
    return false;
}

function rack_letter_clicked(){
    $('.rack.letter').removeClass('active');
    $(this).addClass('active');
}
    
function board_tile_clicked(){  
    let active_letter = $('.rack.letter.active');
    debugger;
    $(this).addClass("placed_tile");
    $(this).addClass(active_letter.val().toLowerCase());
    $(this).val(active_letter.val());
    $(this).off('click', board_tile_clicked);
    let letter = new Object();
    letter.row = $(this).data('row');
    letter.column = $(this).data('column');
    letter.score = $(active_letter).data('score');
    letter.game_tile_id = $(active_letter).data('row_id');
    console.log("ROW: "+letter.row+" col: "+letter.column);
    letter.value = active_letter.val();
    active_letter.removeClass(active_letter.val().toLowerCase());
    // active_letter.val("");
    // active_letter.addClass('empty');
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
    join_game( socket );
    
});

function rack_swappable_clicked(){
    $(this).addClass('swapped');
    $(this).css('background-color','#f7f6a8');
    debugger;
    let letter = new Object();
    letter.game_tile_id = $(this).data('row_id');
    letter.value = $(this).data('letter');
    tiles_to_swap.push(letter);
}

function confirmation_clicked(){
    let client_data = get_client_data();
    client_data.play = tiles_to_swap;

    socket.emit('swap',client_data);

    console.log(tiles_to_swap);
    $(tiles_to_swap).each(function(i, letter){
        $('td[data-row_id='+letter.game_tile_id+']').removeClass(letter.value.toLowerCase());  
    });
    tiles_to_swap = [];
    return false;
}


function create_rack( rack ){
    let table = document.getElementById("rack-holder");
    let tbody = document.createElement('tbody');
    let tr = document.createElement("tr");
    console.log(rack);
    var count = 7;
    rack.forEach( (tile) => {   
        if(count-- >0){
        let td = document.createElement("td");
        td.className += 'rack ';
        td.className += 'letter ';
        if( tile.value == " " ){
            td.className += 'blank';
        } 
        else{
           td.className += tile.value.toLowerCase();
        }
        td.value = tile.value;
        td.addEventListener('click', rack_letter_clicked);
        td.setAttribute('data-row_id', tile.game_tile_id);
        td.setAttribute('data-score', tile.score);   
        td.setAttribute('data-letter', tile.value);
        tr.appendChild(td);
    }
    }, this)
    tbody.appendChild(tr);
    table.appendChild(tbody);
}

function display_players( players ){
    let table = document.getElementById("players");
    table.innerHTML = '';
    let tbody = document.createElement('tbody');
    console.log(players);
    players.forEach( (player) => {
        let tr = document.createElement("tr");
        
        let name_td = document.createElement("td");
        name_td.className += 'player';
        name_td.innerHTML = player.user_id;
        name_td.setAttribute('data-user_id', player.user_id);
        tr.appendChild(name_td);

        let score_td = document.createElement("td");
        score_td.className += 'score';
        score_td.innerHTML = player.score;
        score_td.setAttribute('data-user_id', player.user_id);
        tr.appendChild(score_td);
        
        tbody.appendChild(tr);
    }, this)
    table.appendChild(tbody);
}

function display_board(board_data){
    let board = board_data[2];
	let table = document.getElementById("board");
	table.innerHTML = '';
    let tbody = document.createElement('tbody');
    debugger;

    let row = '';
    let tile = '';
    let i = 1;
    let j = 1;

    for(i = 1; i<16; i++){
        row = board[i];

        let tr = document.createElement("tr");

        for(j = 1; j<16; j++){
            tile = row[j];

            let td = document.createElement("td");
	        td.className += 'board_tile';
			td.setAttribute('data-row', tile.row);
	        td.setAttribute('data-column', tile.column);
	        
	        if(tile.letter != 0){
	        	td.className += ' placed_tile';
	        	td.className += ' '+tile.letter.value.toLowerCase();
	        	td.value = tile.letter.value;
	        }
	        else if(tile.premium != 0){
	        	td.value = tile.premium
	        }
	        tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
}

function turn(){
    $('#play').removeAttr('disabled');
    $('#swap').removeAttr('disabled');
    $('#pass').removeAttr('disabled');
}

function join_game( socket ){
    let data = new Object();
    data.user_id = document.getElementById("userId").value;
    data.user = document.getElementById("user").value;
    data.game_id = document.getElementById("gameId").value;
    socket.emit( 'join game', data );
}

function get_client_data (){
    let data = new Object();
    data.user_id = document.getElementById("userId").value;
    data.user = document.getElementById("user").value;
    data.game_id = document.getElementById("gameId").value;
    return data;
}
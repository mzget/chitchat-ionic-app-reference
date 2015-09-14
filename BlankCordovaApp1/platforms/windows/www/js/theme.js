
$('.row.title').click(function(){
	show_list = $(this).attr('id').split('_')[1];
	list_height = $('#list_'+show_list).height();
		
	if( list_height == 0 )
	{
		$('#list_'+show_list).css({'height':'auto'});
		$(this).children('span').attr('class','fa fa-chevron-circle-down');
	}else{
		$('#list_'+show_list).animate({'height':0});
		$(this).children('span').attr('class','fa fa-chevron-circle-right');	
	}
});


$('#list .container-fluid .row-fluid .row.person').click(function(){
	$('#popup-detail .popup .menu-person').css('display','inline');
	$('#popup-detail .popup .menu-group').css('display','none');
	$('#popup-detail .popup .body .members').css('display','none');
	
	$('#popup-bg').animate({'left':0}, 200);
	$('#popup-detail').animate({'left':'10%'}, 200);
});
$('#list .container-fluid .row-fluid .row.group').click(function(){
	$('#popup-detail .popup .menu-person').css('display','none');
	$('#popup-detail .popup .menu-group').css('display','inline');
	$('#popup-detail .popup .body .members').css('display','');
	
	$('#popup-bg').animate({'left':0}, 200);
	$('#popup-detail').animate({'left':'10%'}, 200);
});
$('#popup-bg').click(function(){
	$('#popup-bg').animate({'left':'-100%'}, 200);
	$('#popup-detail').animate({'left':'-100%'}, 200);
});


$('#btn-listmore').click(function(){
	chatmenu_top = parseInt($('#listmore').height());	
	if( chatmenu_top != 0 )
	{
		$('#listmore').animate({'height':'0px'}, 200);		
	}else{
		$('#listmore').animate({'height':'79px'}, 200);			
	}
});
var pageManager = function() {
	return this;
}
pageManager.prototype.clonePage = function(hash, pageId, parts,redirect) {

	
	
	
	var bookId = parts.pop();
	var templeteId  =  parts.join('-');
	 
	
	var book = app.allBooks.books[bookId];
	var newPage = $(templeteId).clone();
	newPage.prop('id', pageId);
	
	this.fillPage(newPage, parts.join('-'), bookId).appendTo($.mobile.pageContainer);
	if(redirect)
	{
		$.mobile.changePage(u.hash, {changeHash :false});
		 
	}
	
}
pageManager.prototype.pageBookPriceNotExists = function(newPage,book) {
	
	$(".buyBtn", newPage).find(".ui-btn-text").text("loading ...");
	$(".buyBtn", newPage).show();
	//window.plugins.progressHud.show();
	window.plugins.inAppPurchaseManager.requestProductData(book.alias, function(data) {
		//window.plugins.progressHud.hide();
             
                                                           
                                                           for(var ii in app.allBooks.books )
                                                           {
                                                           var tBook = app.allBooks.books[ii];
                                                           if(tBook.alias == data.id)
                                                           {
                                                           app.allBooks.books[ii].price = data.price;
                                                           if(app.allBooks.myBooks[ii])
                                                           {
                                                           app.allBooks.myBooks[ii].price = data.price;
                                                           }
                                                           break;
                                                           }
                                                           
                                                           }
		$(".buyBtn", newPage).find(".ui-btn-text").text(data.price);
		$(".buyBtn", newPage).show();
		DAOManager.db.transaction(function(tx) {
			tx.executeSql('UPDATE books  SET price=? WHERE alias=?', [data.price, data.id]);

		}, function() {
			
		}, function() {
			 
		});

	}, function() {
		app.progressHud.hide();
		// $(".buyBtn", newPage).find(".ui-btn-text").text("Not Aviable");
		
		$(".buyBtn", newPage).hide();
		
	});
	
}
pageManager.prototype.pageBookPriceExists = function(newPage, type, bookId, book) {
	$(".buyBtn", newPage).show();
	$(".buyBtn", newPage).find(".ui-btn-text").text(data.price);
}
pageManager.prototype.pageBuyTheBook = function(newPage, type, bookId, book) {

	
	
	$(newPage).attr("bookId", bookId);
	$(".title", newPage).html(book.title);
	$(".author", newPage).html(book.author_name);
	$(".description", newPage).html(book.content);
	$(".buyBtn", newPage).attr('data-book', book.alias)
	$(".buyBtn", newPage).hide();
	$(".thumb", newPage).attr("src", app.imagesPath + "thumb-book-" + bookId + ".png");
	app.tabBar.selectItem(null);
	return newPage;
}
pageManager.prototype.pagePlayer = function(newPage, type, bookId, book) 
{
	$(".buyBtn", newPage).attr('data-book',book.alias);
	$(".player-title", newPage).html(book.title);
	$(".player-author", newPage).html(book.author_name);
	$(".player-description", newPage).html(book.content);
	$(".playerBtn", newPage).attr('data-book', book.id);
	$(".playerBtn", newPage).attr('data-audio', book.audio);
	$(".playerBtn", newPage).attr('data-status', "STOP");
	$(".playerBtn", newPage).bind( "tap", function(){ app.playMedia($(this)) } );
	
	$(".prevBtn", newPage).bind( "tap", function(){ app.seekPrevius();} );
	$(".nextBtn", newPage).bind( "tap", function(){ app.seekNext();} );
	
	$(".prevBtn", newPage).bind( "taphold", function(){app.tapholdHandler('prev');} );
	$(".nextBtn", newPage).bind( "taphold", function(){app.tapholdHandler('next');} );
	
	$(".player-thumb", newPage).attr("src", app.imagesPath + "thumb-book-" + bookId + ".png");
	app.currentBookId = book.id;
	$(".buy-botton-holder", newPage).hide();
	 
	 /*
	if(app.allBooks.myBooks[book.id])
	{
	
			
			if(book.downloaded == null)
			{
				 
				$(".download-holder", newPage).show();
				app.page.loadAudio(book.id,newPage);
			}
			else
			{
				$(".buttons-holder", newPage).show();
				playlistPagehash = '#page-playlist-' + book.id;
				playlistPage = $(playlistPagehash);
				// if (playlistPage.length == 0) 
				// {
									// var parts = playlistPagehash.split('-');
									// var pageId = playlistPagehash.replace("#", '');
									// app.page.clonePage(playlistPagehash, pageId, parts, false);
									// app.DAO.db.transaction(function(tx) 
									// {
											// app.loadChapters(tx, book.id);
											
									// }, function() 
									// {
										// alert("Error Load Chapters PM134");
									// }, function() 
									// {
											// DebugLog("app.DAO.db.transaction.Success");
									// });
				// };
				
			}
	}
	else
	{
			
		if(book.price)
		{
			$(".buy-botton-holder", newPage).show();
			$(".book-price", newPage).text(book.price);
			
		}
		else
		{
			window.plugins.inAppPurchaseManager.requestProductData(book.alias, function(data) 
			{
				$(".buy-botton-holder", newPage).show();
			    $(".book-price", newPage).text(data.price);
				
			},function(){});
		}
		$(".download-holder", newPage).hide();
	}
	*/
}
pageManager.prototype.loadAudio = function(bookID,newPage) 
{

	
	 
	$(".download-file",newPage)
	.attr("data-book-id",bookID)
	
		
}
pageManager.prototype.fillPage = function(newPage, type, bookId) {

	var book = app.allBooks.books[bookId];
	switch(type) 
	{
		case '#page-player':
			this.pagePlayer(newPage, type, bookId, book);
			break;
		default:
			DebugLog("Error Fil the page", newPage.attr('id'), type);
	}
	// newPage.trigger("updatelayout");
	return newPage;
}
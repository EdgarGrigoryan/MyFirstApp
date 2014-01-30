var routerMangaer = function() {

	return this;
}
routerMangaer.prototype.pagePlayTheBook = function(event, data) {
	var u = $.mobile.path.parseUrl(data.absUrl);
	var bookId = u.hash.replace('#page-player-', '');
	var book = app.allBooks.books[bookId];

	app.activePage = u.hash;

	if (app.currentPlayId != bookId) {
		if (app.medai && app.mediaCurrentPosition) 
		{
			app.tabBar.showItems("home", "mybooks", "categories", "newbooks", "nowplaying", "search");
		}

		app.tabBar.selectItem(null);
	} else {
		app.fackeSelect = true;
		app.tabBar.selectItem("nowplaying");
	}
	var downloadFileBtn = $(".download-file", $(app.activePage));
	var buyBtn = $(".buyBtn", $(app.activePage));
	$(".ui-btn-text",buyBtn).text(app.translateTerm('APP_BUY_BOOK'));
	$(".ui-btn-text",downloadFileBtn).text(app.translateTerm('APP_DOWNLOAD'));
	 
	$(".buy-botton-holder", $(app.activePage)).hide();
	$(".download-holder", $(app.activePage)).hide();
	if (app.allBooks.myBooks[bookId]) 
	{
		app.DAO.getBook(bookId, function(book) 
		{

			if (book.downloaded != null) {
				app.navBar.showRightButton();
				$(".buttons-holder", $(app.activePage)).show();
				var playlistPagehash = '#playlist-listview-' + book.id;

				playlistPage = $("li", $(playlistPagehash));

				if (playlistPage.length == 0) {
					var parts = playlistPagehash.split('-');
					var pageId = playlistPagehash.replace("#", '');
					app.page.clonePage(playlistPagehash, pageId, parts, false);
					app.DAO.db.transaction(function(tx) {
						app.loadChapters(tx, book.id);

					}, function() {
						alert("Error Load Chapters RM46");
					}, function() {
						DebugLog("app.DAO.db.transaction.Success");
					});
				}

			} else {
				$(".download-holder", $(app.activePage)).show();

				app.page.loadAudio(book.id, $(app.activePage));
			}

		});
	} else {
		
		
		if(book.price)
		{
			$(".buy-botton-holder", newPage).show();
			$(".book-price", newPage).text(book.price);
			
		}
		else
		{
			
			$(".download-holder", $(app.activePage)).hide();
		    window.plugins.inAppPurchaseManager.requestProductData(book.alias, function(data) 
			{
				$(".buy-botton-holder", $(app.activePage)).show();
				var priceStr = data.price.indexOf("0.00") > -1 ?  app.translateTerm('APP_PRICE_FREE'):data.price;
				
			    $(".book-price", $(app.activePage)).text(priceStr);
				
				if(data.price.indexOf("0.00")   > -1)
				{
					var buyBtn = $(".buyBtn", $(app.activePage));
					$(".ui-btn-text",buyBtn).text(app.translateTerm('APP_GET_FREE'));
				}
				
			},function(){});
		}
		
		
		

	}
	app.navBar.setTitle(book.title);
}
routerMangaer.prototype.pageBuyTheBook = function(event, data) {
	DebugLog("routerMangaer.prototype.pageBuyTheBook--------------->");
	var u = $.mobile.path.parseUrl(data.absUrl);
	app.tabBar.selectItem(null);
	app.activePage = u.hash;

	var bookId = u.hash.replace('#page-player-', '');

	var book = app.allBooks.books[bookId];

	app.navBar.setTitle(book.author_name + " / " + book.title);
	if (book.price) {
		$(".buyBtn", $(u.hash)).show();
		$(".buyBtn", $(u.hash)).find(".ui-btn-text").text(data.price);
	} else {
		app.page.pageBookPriceNotExists($(u.hash), book);
	}
}
routerMangaer.prototype.pageHome = function(event, data) {
	app.navBar.hideLeftButton();
	app.initjCarouselLite();
}
routerMangaer.prototype.pagechange = function(event, data) {



	var u = $.mobile.path.parseUrl(data.absUrl);
	if (app.media && app.mediaCurrentPosition) {

		app.tabBar.showItems("home", 'mybooks', "categories", "newbooks", 'nowplaying', "search");
	} else {
		app.tabBar.showItems("home", "mybooks", "categories", "newbooks", "settings", "search");

	}

	if (u.hash.indexOf('#page-home') > -1) {

		app.router.pageHome();

	} else {
		app.navBar.showLeftButton();
	}

	if (u.hash.indexOf('#page-player-') > -1) {
		app.router.pagePlayTheBook(event, data);

	}

	if (u.hash.indexOf('#page-catergory-items') > -1) {
		$("#categoriesList").trigger("refresh");
		// $("#categoriesList").trigger( "updatelayout");

	}


    $($.mobile.activePage).trigger("updatelayout");
}
routerMangaer.prototype.pagebeforechangeCatergoryItems = function(event, data) {

	var u = $.mobile.path.parseUrl(data.absUrl);
	var currentCategoryId = $("#pageCatergoryItems").attr('catergoryId');
	var catergoryId = u.hash.replace('#page-catergory-items?catergory=', '');
	catergoryId = parseInt(catergoryId);
	var cCat = app.allBooks.Categories[catergoryId];
	app.navBar.setTitle(cCat.label);

	if (catergoryId != currentCategoryId) {
		$("#pageCatergoryItems").attr('catergoryId', catergoryId);

		app.createBooksListView(app.allBooks.ByCat[catergoryId], "pageCatergoryItems");
		$("#pageCatergoryItems").listview("refresh");
	}

}
routerMangaer.prototype.pageshow = function(event, data) {
    $($.mobile.activePage).trigger("updatelayout");
	app.progressHud.hide();
	
	/*
	 {
	 var parts = window.location.hash.split('-');

	 var cBookId = parts.pop();
	 var book = app.allBooks.books[cBookId];
	 DebugLog("routerMangaer.prototype.pageshow" ,cBookId,parts);

	 DebugLog("book.downloaded",cBookId,book.id,book.downloaded);
	 if(book.downloaded){
	 app.navBar.showRightButton();
	 }

	 } */
}

routerMangaer.prototype.pagebeforeshow = function(event, data) {

	app.progressHud.show();
	if (window.location.hash.indexOf('#page-player-') < 0) {
		app.navBar.hideRightButton();
	}

	if (window.location.hash.indexOf('#page-mybooks') > -1) {
		try {
			$("#MyBooks").listview("refresh");
			$("#MyBooks").trigger("refresh");
		} catch(e) {

		}
	}

}
routerMangaer.prototype.pagebeforechange = function(event, data) {

	var u = $.mobile.path.parseUrl(data.absUrl);

	if ( typeof data.toPage !== 'string') {

		return;
	}

	/* if( $(data.toPage).length == '')
	 {
	 var u = $.mobile.path.parseUrl(data.absUrl);
	 var parts = u.hash.split('-');
	 var pageId = u.hash.replace("#", '');
	 DebugLog("app.page.clonePage", u.hash, pageId, parts);
	 app.page.clonePage(u.hash, pageId, parts, false);
	 } */

	if (data.toPage == '#install-page' && app.first_run_complete == false) {
		DebugLog("app.tabBar.data.toPage", data.toPage);
		return;
	}

	var selectedItem = app.tabBar.getSelectedItem();

	/* if (data.toPage.indexOf('#page-player') > -1) {
	 var u = $.mobile.path.parseUrl(data.absUrl);
	 DebugLog("routerMangaer.prototype.pagebeforechange = ", u.hash);
	 var bookId = u.hash.replace('#page-player-', '');
	 var toBook = app.allBooks.myBooks[bookId];

	 if(toBook)
	 {
	 $.mobile.navigate("#page-player-"+toBook.id);
	 event.preventDefault();
	 return false;
	 }
	 } */

	if (u.hash.indexOf('#page-home') > -1) {
		app.navBar.setTitle("AudioBook.am");

	}

	if (u.hash.indexOf('#page-catergory-items?catergory=') > -1) {
		app.router.pagebeforechangeCatergoryItems(event, data);
	}

}
routerMangaer.prototype.pagechangefailed = function(event, data) {

	var u = $.mobile.path.parseUrl(data.absUrl);
	var parts = u.hash.split('-');
	var pageId = u.hash.replace("#", '');

	app.page.clonePage(u.hash, pageId, parts, true);

}


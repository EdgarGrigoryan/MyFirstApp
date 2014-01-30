var app = {
	Translations : {},
	progressHud : null,
	activePage : '#home',
	allBooks : {},
	backPage : false,
	downloads : null,
	debug : false,
	isTapholdHandler : false,
	isFirstRun : false,
	mediaStatus : -1,
	currentPlayId : 0,
	currentBookId : 0,
	mediaCurrentPosition : 0,
	changeHash : true,
	backToBook : '',
	first_run_complete : false,
	titleHistory : new Array(),
	initjCarouselLiteInited : false,
	imagesPath : "data/images/",
	downloading : 0,
	myHistory : new Array(),
	initialize : function() {

		this.bindEvents();
	},
	bindEvents : function() {

		$.extend($.mobile, {
			defaultPageTransition : 'slide'
		});
		document.addEventListener('deviceready', this.onDeviceReady, false);

		$(window).on("navigate", function(event, data) {
			if (data.state.direction === 'back') {

				app.backPage = true;
				switch(window.location.hash) {
					case '#page-home':
						app.tabBar.selectItem("home");
						break;
					case "#page-settings":
						app.tabBar.selectItem('settings');
						break;
					case "#page-mybooks":
						app.tabBar.selectItem('mybooks');
						break;
					case "#page-categories":
						app.tabBar.selectItem('categories');
						break;
					case "#page-new-books":
						app.tabBar.selectItem('newbooks');
						break;
				}

				// if(window.location.hash.indexOf('#page-player') > -1)
				// {
				// var parts = window.location.hash.split('-');
				// var bookId = parts.pop();
				// if (app.allBooks.myBooks[bookId])
				// {
				// $.mobile.changePage('#page-player-' + bookId);
				// }
				// }
			}

			app.backPage = false;
			// DebugLog("data.state.url",data.state.url);
			// DebugLog("data.state.hash",data.state.hash);
			// DebugLog("=========================================================");
		});

		$(window).on("popstate", function(event, data) {

			DebugLog("=================popstate===========", history.length);

		});
	},
	onDeviceReady : function() {

		app.progressHud = window.plugins.progressHud;
		app.router = new routerMangaer();
		app.page = new pageManager();

		$('.link').bind('tap', function(e) {
			myURL = $(this).attr("rel");
			window.open(myURL, '_blank', 'location=yes');
			e.stopPropagation();
			return false;
		});


		 
		$(window).bind('orientationchange', app.orientationHandler);
		$(document).bind("pagechangefailed", app.router.pagechangefailed);
		$(document).bind("pagebeforechange", app.router.pagebeforechange);
		$(document).bind("pagechange", app.router.pagechange);
		$(document).bind("pageshow", app.router.pageshow);

		$(document).bind("pagebeforeshow", app.router.pagebeforeshow);
		$(document).ready(app.__init);

	},
	downLoadAudion:function(_self)
	{
		
		var zf = zipFilesManager($(_self).attr("data-book-id"),'/archive-'+$(_self).attr("data-book-id")+'.zip');
		
	},
	__init : function() {

		app.allBooks.MostRated = {};
		app.allBooks.NewBooks = {};
		app.allBooks.EditorChoose = {};
		app.allBooks.ByCat = {};
		app.allBooks.Categories = {};
		app.allBooks.books = {};
		app.allBooks.myBooks = {};

		app.prepereView();

		app.DAO = new DAOManager();

	},
	loadChaptersError : function(tx, results) {

	},
	createPlayListItem : function(row) {

		var cId = "Chapter_" + row.id + "_" + row.book;

		var listviewContainerItem = $("<li>", {
			id : cId,
			'data-book' : row.book,
			'data-them' : 'b',
			'data-chapter' : row.id,
			'data-icon' : '',
			'title' : row.title,
			'data-media' : row.audio,
			'class' : 'playlist-item'

		}).attr('data-audio', row.audio);
		
		//,'href' : '#page-player-' + row.book
		var itemButton = $("<a>", {
			'id' : 'Button_' + cId,
			'data-audio' : row.audio,
			'html' : row.title,
			'title' : row.title,
			'data-book' : row.book,
			'data-chapter' : row.id
		}).attr('only_selects', false).attr('clicked', 1)
		
		.click(function() {
			var dataChapter = $(this).attr('data-chapter');
			var dataBook = $(this).attr('data-book');
			var me = $(this);
			 
			app.playThisListItem(dataChapter, dataBook, me);
			return false;
		});
		var counter = $("<span>", {
			'class' : 'ui-li-count',
			text : toHHMMSS(row.duration)
		});
		listviewContainerItem.append(itemButton);
		itemButton.append(counter);
		return listviewContainerItem;
	},
	loadChaptersSuccess : function(tx, results, book) {

		try {

			var listviewPanel = $("<div>", {
				id : "playlist-panel-" + book,
				'class' : 'playlist-holder'
			}).page().insertAfter($.mobile.activePage);
			
			var dataContent = $("<div>",{"data-role":"content","data-theme":"b"}).appendTo(listviewPanel);
			var innerLogo = $("<div>",{"class":"inner-logo"}).appendTo(dataContent);
			
			var listviewContainer = $("<ul>", {
				id : 'playlist-listview-' + book,
				"class":'ui-listview',
				"data-count-theme":"b" 
				
			}).appendTo(dataContent);

			for ( i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				if (!app.allBooks.books[row.book].chapters) {
					app.allBooks.books[row.book].chapters = new Object();
				}

				app.allBooks.books[row.book].chapters[row.id] = row;
				playListItem = app.createPlayListItem(row);
				listviewContainer.append(playListItem);
			}

			// $('li:first', listviewContainer).addClass('ui-btn-active');

			// var firstMedia = $('li:first', listviewContainer).attr('data-media');
			// var firstBook = $('li:first', listviewContainer).attr('data-book');
			// var firstChapter = $('li:first', listviewContainer).attr('data-media');
			// var firstChapterText = $('li:first', listviewContainer).attr('title');
			// var playerPage = $.mobile.activePage;
			// $('.playerBtn', playerPage).attr('data-media', firstMedia.replace("mp3/", ""));
			// $('.chapter', playerPage).text(firstChapterText);

			 
			var cBook = app.allBooks.books[row.book];
			cBook.downloaded = 1;
			$.extend(app.allBooks.books[row.book], cBook) ;
			app.navBar.showRightButton();
            $($.mobile.activePage).trigger("updatelayout");
			listviewPanel.trigger("updatelayout");
			listviewContainer.listview();
			var first = $('li:first', listviewContainer);
			var firstButton = "#Button_" + first.attr("id");
			$(first).addClass("ui-btn-active");
			$(firstButton).attr('clicked',0);
			$(firstButton).attr('only_selects', true);
			$(firstButton).trigger("click");
		} catch(e) {

			DebugLog("catch Error.line", e.line);
			DebugLog("catch Error.message", e.message);
			navigator.notification.alert("System Error #A202");
		}

	},
	loadChapters : function(tx, book) {

		tx.executeSql("SELECT * FROM chapter WHERE book=?", [book * 1], function(tx, results) {

			app.loadChaptersSuccess(tx, results, book);
		}, function(tx, error) {
			navigator.notification.alert("System Error #211");
			app.loadAllBooksError(error)
		});
	},
	prepereView : function() {
		var viewport = {
			width : $(window).width(),
			height : $(window).height()
		};

		$(".jcarouselHolder").css({
			width : viewport.width - 4,
			'overflow' : 'hidden'
		});
	},
	orientationHandler : function(event) {

		app.prepereView();
		app.navBar.resize();
		app.tabBar.resize();
	},
	createNavBar : function() {
		app.navBar = cordova.require("cordova/plugin/iOSNavigationBar");
		app.navBar.init();
		app.navBar.create("BlackOpaque");
		app.navBar.setTitle("AudioBook.am");
		app.addBackButton();
		app.addPlaylistButton();

	},
	addPlaylistButton : function() {

		app.navBar.setupRightButton("", "barButton:Bookmarks", function() {
			try {

				app.backToBook = app.activePage;
				var plalistPageId = "#playlist-panel-" + app.activePage.split('-').pop()
				$.mobile.changePage(plalistPageId);
			} catch(e) {
				alert(e);
			}

		});

		app.navBar.hideRightButton();
	},
	addBackButton : function() {
		app.navBar.setupLeftButton("Back", "www/img/icons/NavigationBarBackButtonBlack.png", function() {

			// window.history.go(-1);
			history.back();

		}, {
			useImageAsBackground : true,
			fixedMarginLeft : 13,
			fixedMarginRight : 5
		});
		app.navBar.hideLeftButton();
	},
	translateTerm : function(term) {
		return app.Translations[term] ? app.Translations[term] : term;
	},
	seekPrevius : function() {

		if (app.isTapholdHandler == true) {
			app.isTapholdHandler = false;
			return;
		}
		var playlistPanel = $("#playlist-listview-" + app.currentBookId);
		var current = $("li.ui-btn-active", playlistPanel);

		if (current.prev()) {
			var prevButton = "#Button_" + current.prev().attr("id");
			
			$(prevButton).attr('clicked',0);
			$(prevButton).trigger("click");
		}

	},
	tapholdHandler : function(self) {
		app.isTapholdHandler = true;
		DebugLog("tapholdHandler", self);
		if (self == 'next') {
			if (app.media && app.mediaStatus != 0) {
				app.media.getCurrentPosition(function(position) {

					if (position > -1) {
						app.media.seekTo(position * 1000 + 5 * 1000);
					}
				});
			}

		}
		if (self == 'prev') {
			if (app.media && app.mediaStatus != 0) {
				app.media.getCurrentPosition(function(position) {
					DebugLog("app.media.getCurrentPosition.seekPrevius", position);
					if (position > -1 && position - 5 > 0) {
						app.media.seekTo(position * 1000 - 5 * 1000);
					} else {
						app.media.seekTo(0);
					}

				});
			}

		}
	},
	seekNext : function() {

		if (app.isTapholdHandler == true) {
			app.isTapholdHandler = false;
			return;
		}
		var playlistPanel = $("#playlist-listview-" + app.currentBookId);
		var current = $("li.ui-btn-active", playlistPanel);

		if (current.next()) {
			var NextButton = "#Button_" + current.next().attr("id");
			$(NextButton).attr('clicked',0);
			$(NextButton).trigger("click");
		}

	},
	createTapBar : function() {

		app.tabBar = cordova.require("cordova/plugin/iOSTabBar");
		app.tabBar.init();
		app.tabBar.createItem("nowplaying", '', "www/img/icons/7.png", {
			onSelect : function() {

				if (app.fackeSelect) {
					app.fackeSelect = false;
					return false;
				}

				$.mobile.navigate("#page-player-" + app.currentPlayId);
			}
		});
		app.tabBar.createItem("home", app.translateTerm("APP_HOME"), "www/img/icons/6.png", {
			onSelect : function() {

				app.navBar.setTitle("AudioBook.am");
				var changeHash = app.changeHash;

				app.changeHash = true;
				if (app.backPage == false)
					$.mobile.navigate("#page-home", {
						changeHash : changeHash
					});
			}
		});

		app.tabBar.createItem("mybooks", app.translateTerm("APP_MY_BOOKS"), "www/img/icons/1.png", {
			onSelect : function() {
				app.downloading = 0;
				app.navBar.setTitle(app.translateTerm("APP_MY_BOOKS"));

				if (app.backPage == false)
					$.mobile.navigate("#page-mybooks");

			}
		});
		app.tabBar.createItem("categories", app.translateTerm("APP_CATEGORIES"), "www/img/icons/2.png", {
			onSelect : function() {
				app.navBar.setTitle(app.translateTerm("APP_CATEGORIES"));

				if (app.backPage == false)
					$.mobile.navigate("#page-categories");
			}
		});
		app.tabBar.createItem("newbooks", app.translateTerm("APP_NEW_BOOKS"), "www/img/icons/3.png", {
			onSelect : function() {
				app.navBar.setTitle(app.translateTerm("APP_NEW_BOOKS"));

				if (app.backPage == false)
					$.mobile.navigate("#page-new-books");
			}
		});
		app.tabBar.createItem("settings", app.translateTerm("APP_ABOUT"), "www/img/icons/5.png", {
			onSelect : function() {
				app.navBar.setTitle(app.translateTerm("APP_ABOUT"));

				if (app.backPage == false)
					$.mobile.navigate("#page-settings");
			}
		});

		app.tabBar.createItem("search", app.translateTerm("APP_SEARCH"), "tabButton:Search", {
			onSelect : function() {
				app.navBar.setTitle(app.translateTerm("APP_SEARCH"));

				if (app.backPage == false)
					$.mobile.navigate("#page-search");
			}
		});

		app.tabBar.show();
		app.tabBar.showItems("home", "mybooks", "categories", "newbooks", "settings", "search");
		window.addEventListener("resize", function() {
			tabBar.resize();
		}, false);

	},
	initData : function() {

		app.DAO.db.transaction(ConfigLoader, function() {
			DebugLog("ConfigLoader Error");
		}, function() {
			app.DAO.db.transaction(app.dataPreload, app.errorCB, app.querySuccess);
		});

	},
	loadDataFromServer : function() {

		$.ajax({

			url : "http://www.audiobook.am/app/app-install.php",

			beforeSend : function() {
				app.progressHud.show();
			},
			dataType : 'json',
			success : function(rawData) {

				app.progressHud.hide();
				app.installer = new installManager(rawData);
				app.installer.downLoad();

			}
		});
	},
	reinstall : function() {
		app.loadDataFromServer();
	},
	forceUpdateConfirm : function(buttonIndex) {

		if (buttonIndex == 2) {
			// $.mobile.navigate('#install-page');
			app.DAO.ResetDatabaseAndReinstall();
		}
	},
	forceUpdate : function(QUESTION,isForce) 
	{
		
		if(isForce == 0){
			var APP_HAVE_A_PURCHASED_BOOKS_YES_NO = app.Translations.APP_HAVE_A_PURCHASED_BOOKS_YES_NO ? app.Translations.APP_HAVE_A_PURCHASED_BOOKS_YES_NO : 'APP_HAVE_A_PURCHASED_BOOKS_YES_NO';
		var APP_UPDATE_DATABASE = app.Translations[QUESTION] ? app.Translations[QUESTION] : QUESTION;
		navigator.notification.confirm(APP_UPDATE_DATABASE, function(buttonIndex) {
			app.forceUpdateConfirm(buttonIndex)
		}, "Audiobook.am", APP_HAVE_A_PURCHASED_BOOKS_YES_NO);
		}else
		{
			
			navigator.notification.alert(QUESTION);
			app.DAO.ResetDatabaseAndReinstall();
		}
		
	},
	checkVersionUpdate : function() {

		$.ajax({

			url : "http://www.audiobook.am/app/app-install.php",
			data : {
				'action' : 'version-chechk'
			},
			dataType : 'json',
			success : function(rawData) {
				
				
				 
					if (parseFloat(rawData.version) > parseFloat(app.app_version))
					{	
					
						if(rawData.force_update == 1)
						{
							app.forceUpdate(rawData.APP_FORCE_UPDATE_NOTICE,1);
						 
						}
						else
						{
							app.forceUpdate(rawData.APP_NEW_VERSION,0);
						}
					}
				 

			}
		});
	},
	dataPreload : function(tx) {

		tx.executeSql("SELECT * FROM config WHERE name=?", ["first_run_complete"], function(tx, results) {

			if (results.rows.length > 0) {

				app.DAO.loadData();
				setTimeout(function() {
					app.checkVersionUpdate();
				}, 3000);
			} else {
				app.loadDataFromServer();

			}

			return false;
		}, function(err) {

			DebugLog("Sql Error :: " + err.message);
		});
	},
	errorCB : function() {
		DebugLog("App Error errorCB");
	},
	querySuccess : function() {
		DebugLog("App querySuccess");
	},
	firstRun : function() {

		app.initData();
		app.isFirstRun = true;

	},
	initPages : function() {

		app.initData();

	},
	initPagesSuccessCallBack : function() {

		app.progressHud.show();
		try {
			app.createTapBar();
			app.createNavBar();
			app.navBar.show();
			app.initMyBooks();
			app.initNewBooks();
			app.initSearch();
			app.initCategories();

		} catch(e) {
			alert(e.message + e.line);
		}
		app.progressHud.hide();

		if (app.isFirstRun) {

			setTimeout(function() {

				var APP_HAVE_A_PURCHASED_BOOKS = app.Translations.APP_HAVE_A_PURCHASED_BOOKS ? app.Translations.APP_HAVE_A_PURCHASED_BOOKS : "Do you have a purchased books ? ";
				var APP_HAVE_A_PURCHASED_BOOKS_YES_NO = app.Translations.APP_HAVE_A_PURCHASED_BOOKS_YES_NO ? app.Translations.APP_HAVE_A_PURCHASED_BOOKS_YES_NO : "No,Yes";

				navigator.notification.confirm(APP_HAVE_A_PURCHASED_BOOKS, onConfirm, "Audiobook.am", APP_HAVE_A_PURCHASED_BOOKS_YES_NO);

			}, 3 * 1000);
		}

		app.initHome();

	},
	onSearch : function(tx, value, $ul) {
		tx.executeSql("SELECT * FROM search WHERE term LIKE  '%' || ? || '%' ", [value], function(tx, results) {

			for (var i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				var book = app.allBooks.books[row.bookId];
				app.createListViewItem(book, $ul, 1);
				$ul.trigger("refresh");
				$ul.listview("refresh");
			}

		}, function() {
			DebugLog("onSearch.Error");
		});

	},
	onSearchSuccess : function() {
	},
	onSearchError : function() {
	},
	initSearch : function() {

		$("#autocomplete").on("listviewbeforefilter", function(e, data) {
			var $ul = $(this), $input = $(data.input), value = $input.val(), html = "";
			$ul.html("");
			if (value && value.length > 2) {
				$ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
				$ul.listview("refresh");

				 
				app.DAO.db.transaction(function(tx) {
					app.onSearch(tx, value, $ul);
				}, function() {
					app.onSearchError()
				}, function() {
					app.onSearchSuccess()
				});

				DebugLog("value")
			}
		});

	},
	initCategories : function() {
		var categoriesList = $("#categoriesList");
		$("li",categoriesList).remove();
		
		for (var bookId in app.allBooks.Categories) 
		{
			var CategoryRaw = app.allBooks.Categories[bookId];
			var listviewItem = $("<li>");
			var listviewItemLink = $("<a>", {
				"href" : "#page-catergory-items?catergory=" + CategoryRaw.id,

				"text" : CategoryRaw.label
			});

			listviewItemLink.prop('data-transition', "flip");
			listviewItemLink.appendTo(listviewItem);
			listviewItem.appendTo($("#categoriesList"));

		}
		$("#categoriesList").trigger("refresh");	
	},
	initPagesErrorCallBack : function(err) {

		DebugLog("initPagesErrorCallBack" + err.message);
		navigator.notification.alert("System Error #A620");
	},
	initPagesErrorCallBack2 : function(err) {

		DebugLog(err.message)
		navigator.notification.alert("System Error #A624");
	},
	loadAllTransactionsError : function(err) {

		navigator.notification.alert("System Error A625\n" + err.message);
		return false;
	},
	loadAllCategorysError : function(err) {
		DebugLog("loadAllCategorysError , Sql Error :: " + err.message);
	},
	loadAllBooksError : function(err) {

		DebugLog("loadAllBooksError , Sql Error :: " + err.message);
		return false;
	},
	TranslateError : function(tx, results) {
	},
	TranslateSuccess : function(tx, results) {
		for ( i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
			app.Translations[row.key] = row.value;
			//DebugLog("app.Translations",row.key,row.value);

		}
	},
	loadDataError : function(tx, error, target) {
		navigator.notification.alert("System error A648");
		return true;
	},
	loadDataSuccess : function(tx, results, callback) {

		app[callback](tx, results);
		return true;
	},
	loadAllBooksSuccess : function(tx, results) {

		try {
			for ( i = 0; i < results.rows.length; i++) 
			{
				var row = results.rows.item(i);
				if (row.is_new > 0) {

					app.allBooks.NewBooks[row.id] = row;
				}
				if (row.rate > 0) {
					app.allBooks.MostRated[row.id] = row;
				}

				if (row.editor_choose > 0) {
					app.allBooks.EditorChoose[row.id] = row;
				}

				app.allBooks.books[row.id] = row;
				if (!app.allBooks.ByCat[row.category_id]) {
					app.allBooks.ByCat[row.category_id] = {};
				}
				app.allBooks.ByCat[row.category_id][row.id] = row;

			}

		} catch(e) {
			navigator.notification.alert("System Error A667\t" + e.message + "\t" + e.line);
		}

		return true;
	},
	loadAllCategorysSuccess : function(tx, results) {

		try {
			for ( i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				app.allBooks.Categories[row.id] = row;
			}

		} catch(e) {
			DebugLog(e);
		}
		return true;
	},
	loadAllTransactionsSuccess : function(tx, results, loaded) {

		try {
			if (results.rows.length > 0) {

				for (var i = 0; i < results.rows.length; i++) {

					var row = results.rows.item(i);

				 

					var bookRaw = JSON.parse(row.raw);
					if (bookRaw) {

						if (this.allBooks.books[bookRaw.id]) {
							var newBayedBook = this.allBooks.books[bookRaw.id];
							this.allBooks.myBooks[newBayedBook.id] = newBayedBook;

							app.createListViewItem(this.allBooks.myBooks[bookRaw.id], $("#MyBooks"), 0);

						}

					}

				}
				
				try
				{
					$("#MyBooks").listview("refresh");
				}
				catch(e)
				{
					$("#MyBooks").listview();
					$("#MyBooks").listview("refresh");
					
				}finally{
					$("#MyBooks").trigger("refresh");
				}
				

			}

			$("#page-mybooks").trigger("updatelayout");

		} catch(e) {
			//navigator.notification.alert("System Error A743\n" + e.message + "#\t" + e.line);
		}
	},
	initHomeCategories : function() {
	
		var homeCategoriesLv = $("#homeCategories");
		$("li",homeCategoriesLv).remove();
		for (var bookId in app.allBooks.Categories) {

			var CategoryRaw = app.allBooks.Categories[bookId];
			var listviewItem = $("<li>");
			var listviewItemLink = $("<a>", {
				href : "#page-catergory-items?catergory=" + CategoryRaw.id,
				text : CategoryRaw.label
			});
			listviewItemLink.appendTo(listviewItem);
			listviewItem.appendTo(homeCategoriesLv);

		}
	},
	initMostRated : function() {
		 
		for (var bookId in app.allBooks.MostRated) {
		
			if($("#MostRatedItem" + bookId).length > 0)
			{
				continue;
			}
			
			var bookRaw = app.allBooks.MostRated[bookId];
			var listviewItem = $("<li>", {
				id : "MostRatedItem" + bookId
			});

			if (app.allBooks.myBooks[bookRaw.id]) {
				var bookHref = "#page-player-" + bookRaw.id
			} else {
				var bookHref = "#page-player-" + bookRaw.id
			}
			var listviewItemLink = $("<a>", {
				href : bookHref,
				'class' : 'buy-the-book',
				'data-book' : bookRaw.id
			});
			var listviewItemImg = $("<img>", {
				src : app.imagesPath + "thumb-book-" + bookRaw.id + ".png"
			});
			var listviewItemText = $("<span>", {
				text : bookRaw.title
			});
			listviewItemImg.appendTo(listviewItemLink);
			listviewItemText.appendTo(listviewItemLink);
			listviewItemLink.appendTo(listviewItem);
			listviewItem.appendTo($("#MostRated"));

			 
		}
	},
	initEditorChoose : function() {
	
		// $("li",$("#EditorChoose")).remove();
		for (var bookId in app.allBooks.EditorChoose) {
		
			if($("#EditorChooseItem" + bookId).length > 0)
			{
				continue;
			}
			var bookRaw = app.allBooks.EditorChoose[bookId];
			var listviewItem = $("<li>", {
				id : "EditorChooseItem" + bookId
			});

			if (app.allBooks.myBooks[bookRaw.id]) {
				var bookHref = "#page-player-" + bookRaw.id
			} else {
				var bookHref = "#page-player-" + bookRaw.id
			}

			var listviewItemLink = $("<a>", {
				'class' : 'buy-the-book',
				'data-book' : bookRaw.id,
				href : bookHref
			});

			var listviewItemImg = $("<img>", {
				src : app.imagesPath + "thumb-book-" + bookRaw.id + ".png"
			});
			var listviewItemText = $("<span>", {
				text : bookRaw.title
			});

			listviewItemImg.appendTo(listviewItemLink);
			listviewItemText.appendTo(listviewItemLink);
			listviewItemLink.appendTo(listviewItem);

			listviewItem.appendTo($("#EditorChoose"));

		}
	},
	initjCarouselLite : function() {

		if (!app.initjCarouselLiteInited) {
			$("#MostRated").parent().jCarouselLite({
				visible : 30,
				beforeStart : function() {
					DebugLog("MostRatedjCarouselLitebeforeStart");
				}
			});
			$("#EditorChoose").parent().jCarouselLite({
				visible : 30
			});
			app.initjCarouselLiteInited = true;

		}
	},
	initHome : function() {

		$("#EditorChooseHeader").text(app.Translations.APP_EDITOR_CHOICE);
		$("#MostRatedHeader").text(app.Translations.APP_MOST_RATED);
		var u = $.mobile.path.parseUrl();
		if (u.hash.indexOf('#page-home') < 0) {
			app.changeHash = false;
			app.tabBar.selectItem('home');
		}
		this.initEditorChoose();
		this.initMostRated();
		this.initHomeCategories();

		$("#homeCategories").trigger("refresh");

	},
	initNewBooks : function() {
		DebugLog("page.initNewBooks");
		
		$('li',$("#NewBooks")).remove();
		app.createBooksListView(app.allBooks.NewBooks, "NewBooks");
		$("#NewBooks").trigger("refresh");
		
	},
	initMyBooks : function() {
		$("#have_a_purchased").text(app.Translations.APP_HAVE_A_PURCHASED_BOOKS);
		$("#update_database").text(app.Translations.APP_UPDATE_DATABASE);
		
		app.createBooksListView(app.allBooks.myBooks, "MyBooks");
	},
	createBooksListView : function(data, contextId) {

		$("#" + contextId).find("li").remove();
		if (data) {

			for (var bookId in data) {
				var bookRaw = data[bookId];
				this.createListViewItem(bookRaw, $("#" + contextId), 1);
			}

		}

		$("#" + contextId).css({
			"pdding" : 0,
			"margin" : 0
		});

	},
	createListViewItem : function(bookRaw, context, loadPrice) {
		try {
			var contextId = context.attr("id");
			var bookId = bookRaw.id;
			var bookHref = "#page-player-" + bookRaw.id;
			var createListViewItemId = 'listviewitem-' + contextId + '-' + bookId;

			if ($("#" + createListViewItemId).length < 1) {
				var template = '<li id="' + createListViewItemId + '"><a href="' + bookHref + '">' + '<img src="' + app.imagesPath + "thumb-book-" + bookRaw.id + ".png" + '" height="80">' + '<h2>' + bookRaw.title + '</h2>' + '<p>' + bookRaw.author_name + '</p>' + '<p  class="listpriceholder price-for-' + bookRaw.alias + '">' + (bookRaw.price ? app.translateTerm('APP_PRICE') + " " + bookRaw.price : '') + '</p>' + '</li>';
				context.append(template);
				if (loadPrice == 1 && !bookRaw.price) {

					window.plugins.inAppPurchaseManager.requestProductData(bookRaw.alias, function(data) {
						
						 
						var priceStr = data.price.indexOf("0.00") > -1 ?  app.translateTerm('APP_PRICE_FREE'):data.price;
						 
						$('.price-for-' + data.id).text(app.translateTerm('APP_PRICE') + " " + priceStr);

						for (i in app.allBooks.books) {
							var cBook = app.allBooks.books[i];

							if (cBook.alias == data.id) {
								$.extend(cBook, {
									price : data.price
								});
								app.allBooks.books[i] = cBook;
								break;
							}
						}
					}, function(data) {

						$('.price-for-' + data).hide(0);
					});
				}

			}

			if ( typeof context == "string") {
				$("#" + context).trigger("refresh");
				$("#" + context).trigger("updatelayout");
			} else {
				$(context).trigger("refresh");
				$(context).trigger("updatelayout");
			}

		} catch(e) {
			DebugLog(e.line + " " + e.message);
		}
	},
	createBooksListViewItem : function(bookRaw, contextId) {

		var isItemExists = $("#" + contextId + "Item" + bookRaw.id);
		if (isItemExists.length > 0) {
			return isItemExists;
		}
		var listviewItem = $("<li>", {
			id : contextId + "Item" + bookRaw.id
		});

		if (this.allBooks.myBooks[bookRaw.id]) {
			var bookHref = "#page-player-" + bookRaw.id
			var byTitle = app.translateTerm("APP_LISTEN_BOOK");
		} else {
			var bookHref = "#page-player-" + bookRaw.id
			var byTitle = app.translateTerm("APP_BUY_BOOK");
		}
		var listviewItemLink = $("<a>", {

			'data-list' : contextId,
			"href" : bookHref,
			'data-theme' : 'a',
			'data-book' : bookRaw.id
		});

		var listviewItemRightContent = $("<div>", {
			"class" : "right-content"
		});

		listviewItemRightContent.css({
			width : $(window).width() - 135
		});

		var listviewItemImg = $("<img>", {
			src : app.imagesPath + "thumb-book-" + bookRaw.id + ".png"
		});
		var listviewItemTitle = $("<h2>", {
			"class" : "title",
			text : bookRaw.title
		});
		var listviewItemAutor = $("<h3>", {
			"class" : "autor",
			html : bookRaw.author_name
		});
		var listviewItemContent = $("<div>", {
			"class" : "small",
			html : bookRaw.small
		});
		var listviewItemPrice = $("<span>", {
			'class' : 'price-holder-' + bookRaw.alias,
			html : bookRaw.price
		});

		var listviewButton = $("<a>", {
			"data-role" : "button",
			'data-book' : bookRaw.alias,
			'data-book-id' : bookRaw.id,
			'data-holder' : contextId,
			"data-inline" : "true",
			"class" : "buyBtn smallbb bb" + bookRaw.alias,
			"data-theme" : "a",
			"href" : bookHref,
			text : byTitle
		}).hide();
		if (!this.allBooks.myBooks[bookRaw.id]) {
			listviewButton.bind('click', function() {
				app.processInAppPurcahse(this);
			});
		}
		listviewButton.button();

		listviewItemImg.appendTo(listviewItem);

		listviewItemAutor.appendTo(listviewItemLink);
		listviewItemTitle.appendTo(listviewItemLink);
		listviewItemContent.appendTo(listviewItemLink);

		listviewItemLink.appendTo(listviewItemRightContent);
		listviewItemRightContent.appendTo(listviewItem);

		listviewItemPrice.insertAfter(listviewItemRightContent);
		listviewButton.insertAfter(listviewItemRightContent);

		listviewItem.append($("<br>", {
			style : 'clear:both'
		}));

		listviewItem.appendTo($("#" + contextId));
		if (this.allBooks.myBooks[bookRaw.id]) {
			listviewItemPrice.hide();
		}

		// listviewButton.hide();

		if (!this.allBooks.myBooks[bookRaw.id]) {
			if (!bookRaw.price) {

				window.plugins.inAppPurchaseManager.requestProductData(bookRaw.alias, function(data) {


					$(".bb" + data.id).show();

					var dataHolder = $(".bb" + ret).attr('data-holder');
					if (dataHolder !== 'MyBooks') {
						$('.price-holder-' + data.id).show().text(data.price);
					}
					for (var ii in app.allBooks.books ) {
						var tBook = app.allBooks.books[ii];
						if (tBook.alias == data.id) {
							app.allBooks.books[ii].price = data.price;
							if (app.allBooks.myBooks[ii]) {
								app.allBooks.myBooks[ii].price = data.price;
							}
							break;
						}

					}

					DebugLog("DAOManager.db.transaction", data.price, data.id);
					DAOManager.db.transaction(function(tx) {
						tx.executeSql('UPDATE books  SET price=? WHERE alias=?', [data.price, data.id], function(tx, rs) {
							DebugLog("data.price, data.id", tx, rs);
						});

					}, function() {
						DebugLog("Error callback");
					}, function() {
						DebugLog("Success callback");
					});
				}, function(ret) {
					var dataHolder = $(".bb" + ret).attr('data-holder');

					if (dataHolder == 'MyBooks') {
						$(".bb" + ret).replaceWith("<div class='not_aviable'>" + app.translateTerm("APP_MYBOOKS_BOOK_NOT_AVIABLE") + "</div>");
					} else {
						$(".bb" + ret).replaceWith("<div class='not_aviable'>" + app.translateTerm("APP_BOOK_NOT_AVIABLE") + "</div>");
					}
					for (var ii in app.allBooks.books ) {
						var tBook = app.allBooks.books[ii];
						if (tBook.alias == ret) {
							app.allBooks.books[ii].price = app.translateTerm("APP_BOOK_NOT_AVIABLE");
							if (app.allBooks.myBooks[ii]) {
								app.allBooks.myBooks[ii].price = app.translateTerm("APP_BOOK_NOT_AVIABLE");
							}
							break;
						}

					}

				});
			}
		}

		return listviewItem;
	},
	processInAppPurcahse : function(me) {
		var productId = $(me).attr('data-book');
		app.progressHud.show();
		window.plugins.inAppPurchaseManager.requestProductData(productId, app.requestProductDataSuccessCallback, app.failCallback);

	},
	requestProductDataSuccessCallback : function(data) {
		app.progressHud.hide();

		for (var di in data) {
			DebugLog("requestProductDataSuccessCallback", di, data[di]);

		}

		app.DAO.saveBook('pending', data.id, 'pending', "pending");

		window.plugins.inAppPurchaseManager.makePurchase(data.id);

	},
	failCallback : function() {
		progressHud.hide();
		navigator.notification.alert("Product not found");
	},
	fserverSideProcessingOnPurchase : function(transactionIdentifier, productId, transactionReceipt) {
		DebugLog("fserverSideProcessingOnPurchase" + productId);

		$.ajax({
			url : 'http://www.audiobook.am/app/pur.php?productId=' + productId,
			type : "post",
			data : {
				transactionIdentifier : transactionIdentifier,
				productId : productId,
				transactionReceipt : transactionReceipt
			},
			beforeSend : function() {
				app.progressHud.show();
			},
			success : function(data) {

				app.DAO.db.transaction(function(tx) {

					tx.executeSql('INSERT OR REPLACE INTO   transactions  (transactionIdentifier,transactionReceipt,raw,productId) VALUES(?,?,?,?) ', [transactionIdentifier, transactionReceipt, data, productId], function(tx, results) {

						DebugLog("1146", tx);
						DebugLog("esults.insertId", results.insertId);
						DebugLog("results.rowsAffected", results.rowsAffected);

					}, function(err) {
						navigator.notification.alert("System Error A1158")
					});
				}, app.UpdateBookErros, function() {
					app.UpdateBookSuccess(productId);
					app.progressHud.hide();
					app.tabBar.selectItem('mybooks');
				});

			},
			complete : function() {
			}
		});

	},
	fserverSideProcessingPurchase : function(transactionIdentifier, productId, transactionReceipt) {

		DebugLog("fserverSideProcessingPurchase" + productId)

		$.ajax({
			url : 'http://www.audiobook.am/app/pur.php?productId=' + productId,
			type : "post",
			data : {
				transactionIdentifier : transactionIdentifier,
				productId : productId,
				transactionReceipt : transactionReceipt
			},
			beforeSend : function() {
			},
			success : function(data) {

				app.DAO.db.transaction(function(tx) {

					tx.executeSql('INSERT OR REPLACE INTO   transactions  (transactionIdentifier,transactionReceipt,raw,productId) VALUES(?,?,?,?) ', [transactionIdentifier, transactionReceipt, data, productId], function(tx, results) {

						DebugLog("1183", results);

					}, function(err) {
						DebugLog("UPDATE transaction Error");
					});
				}, app.UpdateBookErros, function() {
					app.UpdateBookSuccess(productId)
				});

			},
			error : function() {

			},
			complete : function() {
			}
		});

	},
	UpdateBookSuccess : function(productId) {

		app.DAO.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM transactions WHERE  productId=?", [productId], function(tx, results) {
				app.loadAllTransactionsSuccess(tx, results, 0);
			}, app.loadAllTransactionsError);

		}, app.initPagesErrorCallBack, function() {
			app.initPagesSuccessAfterPurcasheCallBack(productId);
		});

	},
	initPagesSuccessAfterPurcasheCallBack : function(productId) {

		DebugLog("initPagesSuccessAfterPurcasheCallBack");

	},
	UpdateBookErros : function() {
		alert("Update Books Error");

	},
	playMedia : function(me) {

		var dataId = $(me).attr('data-book');
		var dataMedia = $(me).attr('data-media');
		var dataAudio = $(me).attr('data-audio');
		var datastatus = $(me).attr('data-status');

		if ((app.currentPlayId != dataId) && app.currentPlayId > 0) {
			app.media.stop();
			$(".playerBtn", $("#page-player-" + app.currentPlayId)).find(".ui-btn-text").text("Play");
			$(".traccer", $("#page-player-" + app.currentPlayId)).attr("min", 0).val(0).slider("refresh");
		}

		if (datastatus == "STOP") {

			app.PlayeFile(dataMedia, dataId, me);
		} else {
			app.media.pause();
			$(".playerBtn", $("#page-player-" + app.currentPlayId)).removeClass("pausBtn");
			$(me).attr('data-status', "STOP");

		}

	},
	restoreOldTransactions : function() {
		app.tabBar.selectItem('mybooks');
		window.plugins.inAppPurchaseManager.restoreCompletedTransactions();

	},
	audioFileExists : function(fileEntry, dataId, me) {

		app.media = new Media(fileEntry.fullPath, function() {

			$(".traccer", $("#page-player-" + app.currentPlayId)).attr("min", 0).val(0).slider("refresh");
			$(".playerBtn", $("#page-player-" + app.currentPlayId)).removeClass("pausBtn");
			$(".playerBtn", $("#page-player-" + app.currentPlayId)).attr('data-status', "STOP");
			app.currentPlayId = false;
			//app.media.stop();

			clearInterval(inittimmer);

		}, function(e) {
			navigator.notification.alert("System Error #A1222");
		}, function(status) {
			DebugLog("app.media.status", status);
			app.mediaStatus = status;
			if (status == Media.MEDIA_PAUSED) {
				clearInterval(inittimmer);
				app.tabBar.showItems("home", "mybooks", "categories", "newbooks", "settings", "search");
			}
			if (status == Media.MEDIA_STOPPED) {
				app.mediaCurrentPosition = 0;
				var playlistPanel = $("#playlist-panel-" + app.currentBookId);
				var current = $("li.ui-btn-active", playlistPanel);
				app.tabBar.showItems("home", "mybooks", "categories", "newbooks", "settings", "search");
			}
			if (status == Media.MEDIA_STARTING && app.currentBookId != app.currentPlayId) {
				app.mediaCurrentPosition = 0;
			}

		});

		app.media.play();

		if (app.mediaCurrentPosition > 0) {
			app.media.seekTo(app.mediaCurrentPosition * 1000);
		}
		app.currentPlayId = dataId;
		$(me).addClass("pausBtn");
		$(me).attr('data-status', "PLAY");

		$('.speener').remove();

		var loader = $("<span>", {
			id : 'speen' + dataId,
			'class' : 'speener',
			text : "Now playing"
		});

		$("#MyBooksItem" + dataId).append(loader);

		app.isSlidestart = false;
		$(".traccer", $("#page-player-" + app.currentPlayId)).on('slidestart', function(event) {
			app.isSlidestart = true;
			DebugLog(".slidestart", $(".traccer", $("#page-player-" + app.currentPlayId)).val());

		});

		$(".traccer", $("#page-player-" + app.currentPlayId)).on('slidestop', function(event) {

			DebugLog(".slidestop", $(".traccer", $("#page-player-" + app.currentPlayId)).val());

			if (app.mediaStatus == Media.MEDIA_RUNNING) {
				app.media.seekTo($(".traccer", $("#page-player-" + app.currentPlayId)).val() * 1000);
			} else {
				app.mediaCurrentPosition = $(".traccer", $("#page-player-" + app.currentPlayId)).val();

			}
			app.isSlidestart = false;

		});

		app.tabBar.showItems("home", "mybooks", "categories", "newbooks", "nowplaying", "search");

		$(".traccer", $("#page-player-" + app.currentPlayId)).bind("change", function(event, ui) {
			//	DebugLog(".traccer", $(".traccer", $("#page-player-" + app.currentPlayId)).val() );
		});

		inittimmer = setInterval(function() {
			app.media.getCurrentPosition(function(position) {
				var dur = app.media.getDuration();
				if (position > -1) {

					DebugLog("MediaDur", dur, position);
					if (app.isSlidestart != true) {
						$(".traccer", $("#page-player-" + app.currentPlayId)).attr("min", 0).attr("max", dur).val(position).slider("refresh");
					}
					loader.html(toHHMMSS(position) + " " + "(" + toHHMMSS(dur) + ")");
					$('.duration', $("#page-player-" + app.currentPlayId)).show().html(toHHMMSS(position) + " / " + toHHMMSS(dur));

					app.tabBar.updateItem("nowplaying", {
						title : toHHMMSS(position)
					});
					app.mediaCurrentPosition = position;
				} else {
					//app.media.stop();
					$(".ui-btn-text", $("#page-player-" + app.currentPlayId)).find(".playerBtn").text("Play");
					app.currentPlayId = 0;
					clearInterval(inittimmer);

				}

			}, null);
		}, 1);

	},
	PlayeFile : function(dataMedia, dataId, me) {

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

			fileSystem.root.getFile('/chapters/' + dataId + dataMedia, {
				create : false
			}, function(fileEntry) {

				app.audioFileExists(fileEntry, dataId, me);
			}, function() {

				navigator.notification.alert("System Error #A1337");
			});

		}, function() {
		});
	},
	loadFile : function(dataAudio, dataId) {

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			DebugLog("window.requestFileSystem.Success", dataAudio);
			fileSystem.root.getFile("/zip/" + dataId + ".zip", {
				create : false
			}, function(fileEntry) {
				DebugLog("fileSystem.root.getFile.exists");
				DebugLog("File exists", fileEntry.fullPath);

			}, function() {
				var af = new zipFilesManager(dataId, dataAudio);

			});

		}, function() {
			DebugLog("window.requestFileSystem.Error");
		});

	},
	playThisListItem : function(charepterId, book, elem) {

		try {
			
			var isClicked = $(elem).attr('clicked');
			$(elem).attr('clicked',1);
			 
			
				var current = $("#Chapter_" + charepterId + "_" + book);
				var old = $('li.playlist-item').removeClass('ui-btn-active');
				$(current).addClass('ui-btn-active');
			
			
			var tapForSelect = $(elem).attr('only_selects');

			$(elem).attr('only_selects', false);
			DebugLog("1389#charepterId, book, elem", tapForSelect, charepterId, book, elem);
			var panelContiner = $('#playlist-panel-' + book);
			var playerPage = $("#page-player-" + book);
			var chapterText = $(elem).attr('title');

			$('.playerBtn', playerPage).attr('data-media', $(elem).attr('data-audio').replace("mp3/", ""));
			$('.chapter', playerPage).text(chapterText);

			if (tapForSelect === "false") {

				DebugLog("1400#charepterId, book, elem", tapForSelect, charepterId, book, elem);
				if (app.media) {
					app.media.stop();
				}

				app.mediaCurrentPosition = 0;
				$(".playerBtn:jqmData(status='PLAY')").trigger('tap');
				$('.playerBtn', playerPage).trigger('tap');
			}
		} catch(e) {
			alert(e.message + e.line);
		}
		
		
		if(isClicked == 1)
		{
			$.mobile.navigate("#page-player-"+book); 
	    }
		return false;
	},
	chaptersExtracted : function(tx, bookId) {
		tx.executeSql('UPDATE books  SET downloaded=1 WHERE id=?', [bookId], function() {
			app.DAO.db.transaction(function(tx) {
				app.loadChapters(tx, bookId);
			}, function(error) {
				navigator.notification.alert("System Error #A1390");
			}, function() {
			});

		}, function() {
		});
	}
};

var onConfirm = function(buttonIndex) {

	if (buttonIndex == 2) {
		app.restoreOldTransactions();
	}
};

var DebugLog = function() {

	if (app.debug) {
		console.log("------------------------------");
		for (var i in arguments) {
			console.log(i, ')', arguments[i]);
		}
		console.log("------------------------------");
	}
}
var ConfigLoaderSuccess = function(tx, results) {

	for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		app[row.name] = row.value;

		DebugLog("ConfigLoaderSuccess", row.name, " = ", row.value);

		if (row.name == 'app_version') {
			$("#app_version").html(row.value);
		}
	}
};
var ConfigLoaderError = function(error) {
	DebugLog("ConfigLoaderError", error);
};
var ConfigLoader = function(tx) {
	tx.executeSql("SELECT * FROM config", [], ConfigLoaderSuccess, ConfigLoaderError);
}
/**/
 var toHHMMSS = function (String) {
 var sec_num = parseInt(String, 10); // don't forget the second parm
 var hours   = Math.floor(sec_num / 3600);
 var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
 var seconds = sec_num - (hours * 3600) - (minutes * 60);

 if (hours   < 10) {hours   = "0"+hours;}
 if (minutes < 10) {minutes = "0"+minutes;}
 if (seconds < 10) {seconds = "0"+seconds;}
 var time    = hours+':'+minutes+':'+seconds;
 return time;
 }
 /**/
var readDir = function(pathToRead) {

	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

		fileSystem.root.getDirectory(pathToRead, {
			create : false
		}, function(directory) {
			navigator.notification.alert("System Error #A1455");
			var directoryReader = directory.createReader();

			directoryReader.readEntries(function(entries) {
				var i;
				alert(entries.length);
				for ( i = 0; i < entries.length; i++) {
					alert(entries[i].name);
				}
			}, function(error) {
				alert(error.code);
			});

		}, function(error) {

			navigator.notification.alert("System Error #A1455-" + error.code);
		});
	}, function(error) {
		navigator.notification.alert("System Error #A1455-" + error.code);
	});
}

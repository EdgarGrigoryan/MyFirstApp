var DAOManager = function() {

	this.Setup();
	return this;
}
DAOManager.prototype.Setup = function() {

	DebugLog("DAOManager.prototype.Setup");
	this.db = window.openDatabase("Database", "1.0", "AudioBookMain", 200000);
	this.db.transaction(this.populateDB, this.populateErrorCB, this.populateSuccessCB);

}
DAOManager.prototype.ResetDatabaseAndReinstall = function() {
	this.db.transaction(function(tx) {

		tx.executeSql('DROP TABLE IF  EXISTS config');
		//tx.executeSql('DROP TABLE IF  EXISTS transactions');
		tx.executeSql('DROP TABLE IF  EXISTS books');
		tx.executeSql('DROP TABLE IF  EXISTS categorys');
		tx.executeSql('DROP TABLE IF  EXISTS chapter');
		tx.executeSql('DROP TABLE IF  EXISTS search');
		tx.executeSql('DROP TABLE IF  EXISTS trans');

		tx.executeSql('CREATE TABLE IF NOT EXISTS config (name unique,value)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS transactions (transactionIdentifier, productId unique, transactionReceipt,raw)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS books (id,is_new,alias,audio,title,author_name,category_id,category_label,editor_choose,rate,content,small,price,duration,downloaded)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS chapter  (id,book,title,audio,duration)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS categorys  (id unique, label)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS search     (bookId unique, term)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS trans     (key unique, value)');

	}, this.populateErrorCB, function() {
		app.reinstall();
	});
}
DAOManager.prototype.populateDB = function(tx) {

	
	
	/* 
	 tx.executeSql('DROP TABLE IF  EXISTS config');
	 tx.executeSql('DROP TABLE IF  EXISTS transactions');
	 tx.executeSql('DROP TABLE IF  EXISTS books');
	 tx.executeSql('DROP TABLE IF  EXISTS categorys');
	 tx.executeSql('DROP TABLE IF  EXISTS chapter');
	 tx.executeSql('DROP TABLE IF  EXISTS search');
	 tx.executeSql('DROP TABLE IF  EXISTS trans');
	*/

	tx.executeSql('CREATE TABLE IF NOT EXISTS config (name unique,value)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS transactions (transactionIdentifier, productId unique, transactionReceipt,raw)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS books (id,is_new,alias,audio,title,author_name,category_id,category_label,editor_choose,rate,content,small,price,duration,downloaded)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS chapter  (id,book,title,audio,duration)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS categorys  (id unique, label)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS search     (bookId unique, term)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS trans     (key unique, value)');

}

DAOManager.prototype._saveBook = function(tx) {

	DebugLog("DAOManager.prototype._saveBook", tx);
	tx.executeSql('INSERT OR REPLACE INTO transactions (transactionIdentifier, productId, transactionReceipt,raw) VALUES (?,?,?,?)', [DAOManager.transactionIdentifier, DAOManager.productId, DAOManager.transactionReceipt, DAOManager.raw]);
}

DAOManager.prototype._updateBook = function(tx) {
	DebugLog("DAOManager.prototype._updateBook");
	tx.executeSql('UPDATE transactions  SET transactionIdentifier=?,  transactionReceipt=?,raw=?  WHERE productId=?', [DAOManager.transactionIdentifier, DAOManager.transactionReceipt, DAOManager.raw, DAOManager.productId]);
}

DAOManager.prototype.saveBook = function(transactionIdentifier, productId, transactionReceipt, raw) {

	this.transactionIdentifier = transactionIdentifier;
	this.productId = productId;
	this.transactionReceipt = transactionReceipt;
	this.raw = raw;
	this.db.transaction(this._saveBook, this.errorCB, this.successCB);

}

DAOManager.prototype.UpdateBook = function(transactionIdentifier, productId, transactionReceipt, raw) {
	DebugLog("DAOManager.prototype.UpdateBook", transactionIdentifier, productId, transactionReceipt, raw);

	DAOManager.transactionIdentifier = transactionIdentifier;
	DAOManager.productId = productId;
	DAOManager.transactionReceipt = transactionReceipt;
	DAOManager.raw = raw;
	DAOManager.db.transaction(DAOManager._updateBook, DAOManager.errorCB, page.updateBookSuccessCB);

}
// Transaction error callback
DAOManager.prototype.queryError = function(tx) {

	DebugLog("DAOManager.prototype.queryError | Error processing SQL: " + tx.code);
	return true;
}
DAOManager.prototype.errorCB = function(tx) {
	DebugLog("DAOManager.prototype.errorCB | Error processing SQL: " + tx.message);
}
DAOManager.prototype.populateErrorCB = function(tx) {

	DebugLog("DAOManager.prototype.populateErrorCB | Error processing SQL: " + tx.message);
}
DAOManager.prototype.isProductByed = function(porductID) {

	DebugLog(porductID);
	DAOManager.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM transactions WHERE productId=?', [porductID], DAOManager.isProductByedSuccess, DAOManager.queryError);
	}, DAOManager.errorCB, DAOManager.querySuccess);
}
DAOManager.prototype.queryDB = function(tx) {
	DebugLog("DAOManager.prototype.queryDB");
	tx.executeSql('SELECT * FROM transactions', [], DAOManager.querySuccess, DAOManager.queryError);
}
// Transaction success callback
DAOManager.prototype.isProductByedSuccess = function(tx, results) {

	DebugLog("DAOManager.prototype.isProductByedSuccess", results.rows.length);

	if (results.rows.length > 0) {
		var row = results.rows.item(0);

		var bookRaw = JSON.parse(row.raw);

		DAOManager.selectedProducts = bookRaw.s1_chapters[0].audio;

		var url = "Pages-player.html?src=book/" + bookRaw.id + ".json";
		$.mobile.changePage(url, {
			transition : "flip"
		});
	}
	return false;
}
DAOManager.prototype.querySuccess = function(tx, results) {
	DebugLog("DAOManager.prototype.querySuccess.results.length=", results.rows.length);
	pnedding = 0;
	for (var i = 0; i < results.rows.length; i++) {

		var row = results.rows.item(i);
		DebugLog("results.rows.item(i)", row);
		for (var index in row) {
			DebugLog("results.rows.item(i)", index, row[index]);
		}
		if (row.transactionIdentifier == 'pending') {
			pnedding++;
		}
	}
	if (pnedding > 0) {
		window.plugins.inAppPurchaseManager.restoreCompletedTransactions();
	}
	return true;
}
DAOManager.prototype.successCB = function() {
	DebugLog("DAOManager.prototype.successCB");
	DAOManager.prototype.transactionIdentifier = null;
	DAOManager.prototype.productId = null;
	DAOManager.prototype.transactionReceipt = null;
	DAOManager.prototype.raw = null;

}
DAOManager.prototype.populateSuccessCB = function() {

	DAOManager.transactionIdentifier = null;
	DAOManager.productId = null;
	DAOManager.transactionReceipt = null;
	DAOManager.raw = null;
	app.initPages();

}

DAOManager.prototype.processBooks = function(rawData) {

	var query = "INSERT INTO books (id,is_new,alias,audio,title,author_name,category_id,category_label,editor_choose,rate,content,small) VALUES";
	var bind = new Array();
	var counters = new Array();

	for (var bookIndex in rawData.books ) {

		var cBook = rawData.books[bookIndex];

		counters.push('(?,?,?,?,?,?,?,?,?,?,?,?)');

		bind.push(cBook.id);
		bind.push(cBook.is_new);
		bind.push(cBook.alias);
		bind.push(cBook.audio);
		bind.push(cBook.title);
		bind.push(cBook.author_name);
		bind.push(cBook.category_id);
		bind.push(cBook.category_label);
		bind.push(cBook.editor_choose);
		bind.push(cBook.rate);
		bind.push(cBook.content);
		bind.push(cBook.small);
	}

	query = query + counters.join(",");

	return {
		query : query,
		bind : bind
	};
}
DAOManager.prototype.processSearch = function(rawData) {

	var searchQuery = 'INSERT OR REPLACE  INTO search  (bookId,term) VALUES ';
	var searchBind = new Array();
	var searchCounter = new Array();

	for (transIndex in rawData.search) {
		var TransalteLation = rawData.search[transIndex];
		if (TransalteLation.length) {
			searchCounter.push("(?,?)");
			searchBind.push(transIndex);
			searchBind.push(TransalteLation);
		}
	}

	searchQuery = searchQuery + searchCounter.join(",");
	return {
		query : searchQuery,
		bind : searchBind
	};

}
DAOManager.prototype.processTransalte = function(rawData) {

	var TransalteQuery = 'INSERT INTO  trans  (key,value) VALUES ';
	var TransalteBind = new Array();
	var TransalteCounter = new Array();

	for (transIndex in rawData.trans) {
		var TransalteLation = rawData.trans[transIndex];
		TransalteCounter.push("(?,?)");
		TransalteBind.push(TransalteLation.name);
		TransalteBind.push(TransalteLation.value);

	}

	TransalteQuery = TransalteQuery + TransalteCounter.join(",");
	return {
		query : TransalteQuery,
		bind : TransalteBind
	};

}

DAOManager.prototype.processCategorys = function(rawData) {

	var cQuery = 'INSERT INTO  categorys  (id,label) VALUES';
	var cBind = new Array();
	var counter = new Array();
	for (categoryIndex in rawData.categorys) {
		var category = rawData.categorys[categoryIndex];

		cBind.push(category.id);
		cBind.push(category.label);
		counter.push("(?,?)");
	}

	cQuery = cQuery + counter.join(",");
	return {
		query : cQuery,
		bind : cBind
	};

}

DAOManager.prototype.processChapters = function(rawData) {

	var chapterQuery = 'INSERT INTO  chapter  (id,book,title,audio,duration) VALUES';
	var chapterBind = new Array();
	var chapterCounter = new Array();

	for (chapterIndex in rawData.chapter) {

		chapterCounter.push("(?,?,?,?,?)");

		var chapter = rawData.chapter[chapterIndex];

		chapterBind.push(chapter.id);
		chapterBind.push(chapter.book);
		chapterBind.push(chapter.title);
		chapterBind.push(chapter.audio);
		chapterBind.push(chapter.duration);

	}

	chapterQuery = chapterQuery + chapterCounter.join(",");
	return {
		query : chapterQuery,
		bind : chapterBind
	};

}

DAOManager.prototype.initData = function() {

	DAOManager.db.transaction(function(tx) {

		tx.executeSql("SELECT * FROM config WHERE name=?", ["first_run_complete"], function(tx, results) {

			if (results.rows.length > 0) {

				DebugLog("page.initPages();", page);

			} else {
				//install-page

			}

			return false;
		}, function(err) {

			DebugLog("Sql Error :: " + err.message);
		})
	}, DAOManager.errorCB, DAOManager.querySuccess);

}

DAOManager.prototype.selectMyBooks = function() {
	DAOManager.db.transaction(function(tx) {

		tx.executeSql("SELECT * FROM transactions WHERE 1", [], function(tx, results) {

			for (var i = 0; i < results.rows.length; i++) {

				var row = results.rows.item(i);
				DebugLog("results.rows.item(i)", row);

				var bookRaw = JSON.parse(row.raw);

				DAOManager.selectedProducts = bookRaw.s1_chapters[0].audio;

				var listviewItem = $("<li>");
				var listviewItemLink = $("<a>", {
					href : "Pages-player.html?src=book/" + bookRaw.id + ".json",
					'data-transition' : "flip"
				});
				var listviewItemImg = $("<img>", {
					src : "data/images/thumb-book-" + bookRaw.id + ".png"
				});
				var listviewItemText = $("<span>", {
					text : bookRaw.title
				});

				listviewItemImg.appendTo(listviewItemLink);
				listviewItemText.appendTo(listviewItemLink);
				listviewItemLink.appendTo(listviewItem);
				listviewItem.appendTo($("#MyBookList"));

			}
			$("#MyBookList").listview("refresh");
			return false;
		}, function(err) {

			DebugLog("Sql Error :: " + err.message);
		})
	}, DAOManager.errorCB, DAOManager.querySuccess);

}
DAOManager.prototype.getBook = function(bookId,callBack) 
{
	
	this.db.transaction(function(tx) {
		
		tx.executeSql("SELECT * FROM books WHERE id=?;", [bookId], function(tx, results) 
		{
			if(results.rows.length > 0)
			{
				row = results.rows.item(0)
				callBack(row);
			}else
			{
				callBack(false);
				
			}
			
		}, function(tx, error) {
			app.loadAllBooksError(tx, error, 'books');
		});
		
		
	},function(){ alert("Book Load Error");},function(){});
}
DAOManager.prototype.loadData = function() {

	this.db.transaction(function(tx) {

		tx.executeSql("SELECT * FROM books WHERE 1;", [], function(tx, results) {
			app.loadDataSuccess(tx, results, 'loadAllBooksSuccess');
		}, function(tx, error) {
			app.loadAllBooksError(tx, error, 'books');
		});

		tx.executeSql("SELECT * FROM categorys WHERE 1;", [], function(tx, results) {
			app.loadDataSuccess(tx, results, 'loadAllCategorysSuccess');
		}, function(tx, error) {
			app.loadDataError(tx, error, 'categorys');
		});

		tx.executeSql("SELECT * FROM trans WHERE 1", [], function(tx, results) {

			app.loadDataSuccess(tx, results, 'TranslateSuccess');
		}, function(tx, error) {
			app.loadDataError(tx, error, 'trans');
		});

		tx.executeSql("SELECT * FROM transactions WHERE 1", [], function(tx, results) {
			app.loadDataSuccess(tx, results, 'loadAllTransactionsSuccess');

		}, function(tx, error) {
			app.loadDataError(tx, error, 'transactions');
		});

	}, app.initPagesErrorCallBack2, app.initPagesSuccessCallBack);
};
DAOManager.prototype.selectedProducts = null;
DAOManager.prototype.transactionIdentifier = null;
DAOManager.prototype.productId = null;
DAOManager.prototype.transactionReceipt = null;
DAOManager.prototype.raw = null;


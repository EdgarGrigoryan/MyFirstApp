var installManager = function(init) {
	
	this.file = "/"+init.file;
	this.version = init.version;
	this.label = init.INSTALLING;
	 
	return this;
}
installManager.prototype.file = null;
installManager.prototype.version = null;

installManager.prototype.downLoad = function() 
{
	var me = this;
	app.progressHud.show({mode: "annular-determinate",labelText:this.label, progress:0});
	var zipDownloadManager = new DownloadManager("/zip/data"+this.file , this.file , this.zipDownloadProgress, function(entry){ me.zipDownloadComplete (entry) },  function(error){app.progressHud.hide(); me.zipDownloadError(); });
}
installManager.prototype.start = function(rawTextData) 
{
				
				var rawData = JSON.parse(rawTextData);
				
				
				
				
				var booksSql = app.DAO.processBooks(rawData);
				var categorysSql = app.DAO.processCategorys(rawData);
				var transalteSql = app.DAO.processTransalte(rawData);
				var searchSql = app.DAO.processSearch(rawData);
				
				 
				
				app.DAO.db.transaction(function(tx) {
					tx.executeSql(booksSql.query, booksSql.bind, function(tx, results) {  console.log("tx.executeSql.success") ;}, function(tx, err) {
						console.log("booksSql.query", tx, err.message);
						alert("System Error I37");
					});
	
					tx.executeSql(categorysSql.query, categorysSql.bind, function(tx, results)  {  console.log("tx.executeSql.success") ;}, function(tx, err) {
						console.log("categorysSql.query", tx, err.message);
						alert("System Error I41");
					});
					for(chapterIndex in rawData.chapter)
					{
						var cChapter = rawData.chapter[chapterIndex];
						if(cChapter.audio)
						{
							var chapterQuery = 'INSERT INTO  chapter  (id,book,title,audio,duration) VALUES (?,?,?,?,?)';
							var chapterBind = new Array();
								chapterBind.push(cChapter.id);
								chapterBind.push(cChapter.book);
								chapterBind.push(cChapter.title);
								chapterBind.push(cChapter.audio);
								chapterBind.push(cChapter.duration);
								
							tx.executeSql(chapterQuery, chapterBind, function(tx, results) { console.log("tx.executeSql.success") ;}, function(tx, err) {
								console.log("booksSql.query", tx, err.message);
								alert("System Error I62");
							});
						}
					}
					
					 
					
					tx.executeSql(transalteSql.query, transalteSql.bind, function(tx, results) {
						 
					}, function(tx, err) {
						console.log("booksSql.query", tx, err.message);
						alert("System Error I70");
					});
					
					for (transIndex in rawData.search) 
					{
							tx.executeSql("INSERT OR REPLACE  INTO search  (bookId,term) VALUES (?,?)", [transIndex,rawData.search[transIndex]], 
							function(tx, results) {  console.log("tx.executeSql.success") ; }, function(tx, err) {
								console.log("booksSql.query", tx, err.message);
								alert("System Error I78");
							}); 
							
					}
					tx.executeSql("INSERT OR REPLACE INTO config(name, value) values(?,?)", ['first_run_complete', 1], function(){ 
					
					app.firstRun();
					
					
					}, function(tx, err) {
						console.log("booksSql.query", tx, err.message);
						alert("System Error I88");
					});

				}, app.DAO.errorCB, function(){ DebugLog("app.DAO.successCB"); });
				
				
	
}

installManager.prototype.zipDownloadProgress = function(progressEvent) 
{
	if (progressEvent.lengthComputable) {
		var percNum =progressEvent.loaded / progressEvent.total  ;
		var perc =progressEvent.loaded / progressEvent.total * 100 ;
		var percText = Math.floor(perc) + " %";
		 
		app.progressHud.set({progress: percNum,detailsLabelText:percText});
		
		//$('#zip-progress').css({height:10,width:perc+"%",background:'#00ff00'});
		
		//$('#zip-progress-wraper').show();

	} else {
		percText = "Loading...";
		app.progressHud.set({mode:indeterminate});
	}
	//$("#zip-loader").text(percText);

};

installManager.prototype.zipExtractSuccess = function(rootFullPath) {
	app.progressHud.hide();
	console.log("installManager.prototype.zipExtractSuccess",rootFullPath);
	app.imagesPath = 'file:' + rootFullPath+ 'images/';
	 
	app.DAO.db.transaction(function(tx) {

		tx.executeSql("INSERT INTO  config (name,value) VALUES(?,?)", ['imagesPath', app.imagesPath], function() {
			DebugLog("INSERT INTO  imagesPath config Success ");
		}, function() {
			DebugLog("INSERT INTO  imagesPath config Error ");
		});
		
		
		tx.executeSql("INSERT INTO  config (name,value) VALUES(?,?)", ['app_version', app.installer.version], function() {
			DebugLog("Transaction 1.0");
		}, function() {
			DebugLog("Transaction 2.0");
		});
		
	}, function() {
		DebugLog("Transaction 1");
	}, function() {
		DebugLog("Transaction 2");
	});
	this.JsonFile = rootFullPath+"data/sql.json";
	
	this.readJsonData(rootFullPath+"data/sql.json");
	
	
};

installManager.prototype.readJsonData = function(jsonFile) 
{
	
		 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
	  
}
installManager.prototype.zipDownloadError = function(error) {
	DebugLog("zipDownloadManager.Error", entry);
};
installManager.prototype.zipDownloadComplete = function(entry) {

	
	var thet = this;
	var rootFullPath = entry.fullPath.replace('.zip', '/');
	
	try {
		myUnzip(entry.fullPath, rootFullPath, function() {
			
			 
			thet.zipExtractSuccess(rootFullPath);
		
		}, function(){
		
		alert("System Error I198");
		
		
		});

	} catch(e) {
		alert("System Error I204");
	}

}



function gotFS(fileSystem) {
		
        fileSystem.root.getFile(app.installer.JsonFile, null, gotFileEntry, fail);
    }

    function gotFileEntry(fileEntry) {
        fileEntry.file(gotFile, fail);
    }

    function gotFile(file)
	{
		readAsText(file);
    }

    function readDataUrl(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
             
             
        };
        reader.readAsDataURL(file);
    }

    function readAsText(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
           
           app.installer.start(evt.target.result);
            
        };
        reader.readAsText(file);
    }

    function fail(evt) {
        alert("System Error I221#"+evt.target.error.code);
    }
	
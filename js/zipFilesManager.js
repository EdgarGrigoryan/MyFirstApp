var zipFilesManager = function(id, file) {


	
	this.id = id;
	this.file = file;
	var teth = this;
	//MyBooksItem
	
	
 
		
	
	app.progressHud.show({mode: "annular-determinate",labelText:'', progress:0});
	$($.mobile.activePage).trigger("updatelayout");
	new DownloadManager( "/zip/dowonload.php?bookId=" + teth.id ,teth.file, function(progressEvent) {
		if (progressEvent.lengthComputable) 
		{
			var percNum = progressEvent.loaded / progressEvent.total;
			var percent = (progressEvent.loaded / progressEvent.total * 100);
			var percentText = percent.toFixed(2) + '%' ;
			app.progressHud.set({progress: percNum,detailsLabelText:percentText});  
			 
		}
		else
		{
			app.progressHud.set({mode:"indeterminate"});
		}
		 
	}, function(entry, rootFullPath) {
		
		for(var item in entry)
		{
			console.log("item in entry",item);
		}
		var extractTo = entry.fullPath.replace('archive-'+teth.id+'.zip','chapters/'+teth.id+"/");
		
		setFolderMetadata(LocalFileSystem.PERSISTENT, extractTo, "com.apple.MobileBackup", 0);  
		
		myUnzip(entry.fullPath, extractTo, function(aa) 
		{
			
			
			app.DAO.db.transaction(function(tx){ app.chaptersExtracted(tx,teth.id)}, function() 
			{ 
			alert("System Error Z45"); 
			app.progressHud.hide();
			}, 
			function() 
			{ 
				var bookPage =  $("#page-player-"+teth.id);
				$(".download-holder",bookPage).hide();
				$(".buttons-holder",bookPage).show();
				app.progressHud.hide();
			
			});
		}, function(error){
		
		alert("System Error Z57\n"+error);
		app.progressHud.hide();
		
		});
		
		
	}, 
	function(err) 
	{
		app.progressHud.hide();
	 
	});
	$($.mobile.activePage).trigger("updatelayout");
	return this;
};

zipFilesManager.prototype.zipFilesManagerError = function(error) {
	
	app.progressHud.set({detailsLabelText:"Erro Downloading File"});

};
zipFilesManager.prototype.zipFilesManagerSuccess = function(entry, rootFullPath) {
	app.progressHud.hide();
	$(".download-holder", $("#page-player-" + this.id)).hide();
	$(".buttons-holder", $("#page-player-" + this.id)).show();
	$($.mobile.activePage).trigger("updatelayout");
};
zipFilesManager.prototype.onProgress = function(progressEvent) {

	
	
	// if (progressEvent.lengthComputable) {
		// var percNum = progressEvent.loaded / progressEvent.total;
		
		// var percent = (progressEvent.loaded / progressEvent.total * 100);
		// var percentText = percent.toFixed(2) + '%' + "(" + progressEvent.total + ")";
		// var percentText = percent.toFixed(2) + '%' ;
		// console.log("progressEvent.lengthComputable",progressEvent.loaded,progressEvent.total);
		// app.progressHud.set({progress: percNum,detailsLabelText:percentText});
	// } else {
		// percentText = "Loading...";
		// app.progressHud.set({mode:"indeterminate"});
	// }
	// DebugLog("zipFilesManager.prototype.zipFilesManagerProgress",this.id, percentText+"%");
	// ;

}
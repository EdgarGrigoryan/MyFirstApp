var audioFileManager = function(id, file) {


	
	this.id = id;
	this.file = file;
	var teth = this;
	//MyBooksItem
	
	
 
		
	
	app.progressHud.show({mode: "annular-determinate",labelText:'', progress:0});
	
	new DownloadManager(teth.file, "/mp3/" + teth.id + ".mp3", function(progressEvent) {
	
		 
		
		
		
		
		teth.audioFileManagerProgress(progressEvent);
	}, function(entry, rootFullPath) {
		app.progressHud.hide();
		teth.audioFileManagerSuccess(entry, rootFullPath)
	}, function(err) {
		teth.audioFileManagerError()
	});
	return this;
};

audioFileManager.prototype.audioFileManagerError = function(error) {
	
	app.progressHud.set({detailsLabelText:"Erro Downloading File"});

};
audioFileManager.prototype.audioFileManagerSuccess = function(entry, rootFullPath) {
	app.progressHud.hide();
	$(".download-holder", $("#page-player-" + this.id)).hide();
	$(".buttons-holder", $("#page-player-" + this.id)).show();
};
audioFileManager.prototype.audioFileManagerProgress = function(progressEvent) {

	
	
	if (progressEvent.lengthComputable) {
		var percNum = progressEvent.loaded / progressEvent.total;
		
		var percent = (progressEvent.loaded / progressEvent.total * 100);
		// var percentText = percent.toFixed(2) + '%' + "(" + progressEvent.total + ")";
		var percentText = percent.toFixed(2) + '%' ;
		// app.progressHud.set({progress: percNum,detailsLabelText:percentText});
	} else {
		percentText = "Loading...";
		app.progressHud.set({mode:"indeterminate"});
	}
	DebugLog("audioFileManager.prototype.audioFileManagerProgress",this.id, percentText+"%");
	;

}
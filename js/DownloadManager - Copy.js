var DownloadManager = function(file, id, loader) 
{

	console.log("new DownloadManager()", file, id, loader);

	this.file = file;
	this.id = id;
	
	this.loader = loader;
	this.start();
    
	console.log("====================================================================================");
    console.log("me.file, me.id, me.loader.id",  me.id, $(me.loader).attr("id"));
	console.log("===================================================================================");
	
	return this;
}

DownloadManager.prototype.start = function() {

	
	var me = this;
	
	$.mobile.changePage("#page-mybooks", { transition : "flip" });
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

		me.ft = new FileTransfer();
                             
        
		var uri = encodeURI("http://www.audiobook.am/them/default" + me.file);
		
		var downloadPath = fileSystem.root.fullPath + me.file;
		console.log("DownloadManager.prototype.start,URl", "http://www.audiobook.am/them/default" + me.file);
		console.log("DownloadManager.prototype.start,requestFileSystem", downloadPath);
		
		
		
		var iflengthNotComputable = 0;
		me.ft.onprogress = function(progressEvent) 
		{
			if (progressEvent.lengthComputable) 
			{
				var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
				if(me.loader){
					$(me.loader).html(perc + "% loaded...");
				}
				console.log("DownloadManager.prototype.loading",me.file, perc+"%");
			} 
			else 
			{
				iflengthNotComputable++;
				if(me.loader){
				$(me.loader).html("loadeding..."+iflengthNotComputable % 2 == 0 ? '.':'');
				}
				
				console.log("DownloadManager.prototype.loading",this.file, "loadeding..."+iflengthNotComputable % 2 == 0 ? '.':'');
				
			}
		};

		me.ft.download(uri, downloadPath, function(entry) 
		{
			console.log("Download Success",me,entry);
			$(me.loader).html("Done");
			
		}, 
		function(error) 
		{
			console.log("DownloadManager.prototype.start,requestFileSystem", arguments.length);
			$(me.loader).html('Download Error',error);
		});

	}, function(e) {
		navigator.notification.alert('failed to get fs');

	});
	
}

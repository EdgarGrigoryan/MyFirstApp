var DownloadManager = function(url,loaction,processCallback,succesCallback,errorCallback) 
{
	this.url = url;
	this.loaction = loaction;
	this.processCallback = processCallback;
	this.succesCallback = succesCallback;
	this.errorCallback = errorCallback;
	DebugLog("DownloadManager", this.url,this.loaction);
	
	this.start();
	return this;
}

DownloadManager.prototype.start = function() {

	
	var me = this;
	
	 
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) 
	{

		me.ft = new FileTransfer();
        var uri = encodeURI("http://www.audiobook.am/them/default" + me.url);
		var downloadPath = fileSystem.root.fullPath + me.loaction;
		var iflengthNotComputable = 0;
		
		console.log("DownloadManager.Start",uri,downloadPath);
		
		
		me.ft.onprogress = function(progressEvent) 
		{
			if (progressEvent.lengthComputable) 
			{
				var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
				 
			} 
			else 
			{
				iflengthNotComputable++;
				 
			}
			me.processCallback(progressEvent);
			
		};

		me.ft.download(uri, downloadPath, function(entry) 
		{
			
			setFileMetadata(LocalFileSystem.PERSISTENT, downloadPath, "com.apple.MobileBackup", 1);
			me.succesCallback(entry,fileSystem.root.fullPath);
			
		}, 
		function(error) 
		{
			DebugLog("DownloadManager.prototype.start,requestFileSystem", arguments.length);
			me.errorCallback(error);
		});

	}, function(e) {
		navigator.notification.alert('failed to get fs');

	});
	
}

function setFileMetadata(localFileSystem, filePath, metadataKey, metadataValue) 
{
    var onSetMetadataWin = function() {
      console.log("success setting metadata")
    }
    var onSetMetadataFail = function() {
      console.log("error setting metadata")
    }

    var onGetFileWin = function(parent) {
      var data = {};
      data[metadataKey] = metadataValue;
      parent.setMetadata(onSetMetadataWin, onSetMetadataFail, data);
    }
    var onGetFileFail = function() {
      console.log("error getting file")
    }

    var onFSWin = function(fileSystem) {
      fileSystem.root.getFile(filePath, {create: true, exclusive: false}, onGetFileWin, onGetFileFail);
    }

    var onFSFail = function(evt) {
      console.log(evt.target.error.code);
    }

    window.requestFileSystem(localFileSystem, 0, onFSWin, onFSFail);
}

// setFileMetadata(LocalFileSystem.PERSISTENT, "Backups/sqlite.db", "com.apple.MobileBackup", 1);
function setFolderMetadata(localFileSystem, subFolder, metadataKey, metadataValue) 
{
    var onSetMetadataWin = function() {
      console.log("success setting metadata")
    }
    var onSetMetadataFail = function() {
      console.log("error setting metadata")
    }

    var onGetDirectoryWin = function(parent) {
      var data = {};
      data[metadataKey] = metadataValue;
      parent.setMetadata(onSetMetadataWin, onSetMetadataFail, data);
    }
    var onGetDirectoryFail = function() {
      console.log("error getting dir")
    }

    var onFSWin = function(fileSystem) {
      fileSystem.root.getDirectory(subFolder, {create: true, exclusive: false}, onGetDirectoryWin, onGetDirectoryFail);
    }

    var onFSFail = function(evt) {
      console.log(evt.target.error.code);
    }

    window.requestFileSystem(localFileSystem, 0, onFSWin, onFSFail);
}

// setFolderMetadata(LocalFileSystem.PERSISTENT, "Backups", "com.apple.MobileBackup", 1);


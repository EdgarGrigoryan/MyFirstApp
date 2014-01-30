// cordova.define("zip.ZipPlugin", function(require, exports, module) 
// {
		// var exec = cordova.require('cordova/exec');
		// exports.unzip = function(fileName, outputDirectory, callback) {
			// var win = callback && function() {
				// callback(0);
			// };
			// var fail = callback && function() {
				// callback(-1);
			// };
			
			// alert(fileName+"#"+outputDirectory);
			
			// exec(win, fail, 'ZipPlugin', 'unzip', [fileName, outputDirectory]);
		// };

// });

var myUnzip = function(fileName, outputDirectory, callbackWin, callbackFail) 
{
			
			
		 
			
			var cordovaExec = cordova.exec(callbackWin, callbackFail, 'ZipPlugin', 'unzip', [fileName, outputDirectory,'123aBcDeFgHlMnOpQr456123aBcDeFgHlMnOpQr456']);
			
};


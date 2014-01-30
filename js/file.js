function RgotFS(fileSystem) {
        fileSystem.root.getFile("readme.txt", null, RgotFileEntry, Rfail);
    }

    function RgotFileEntry(fileEntry) {
        fileEntry.file(RgotFile, Rfail);
    }

    function RgotFile(file){
        RreadDataUrl(file);
        RreadAsText(file);
    }

    function RreadDataUrl(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Read as data URL");
            console.log(evt.target.result);
        };
        reader.readAsDataURL(file);
    }

    function RreadAsText(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Read as text");
            console.log(evt.target.result);
        };
        reader.readAsText(file);
    }

    function Rfail(evt) {
        console.log(evt.target.error.code);
    }
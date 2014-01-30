var  DAOManager = function()
{

	this.Setup();
	return this;
}

DAOManager.prototype.Setup = function() 
{
		console.log("DAOManager.prototype.Setup");
		this.db = window.openDatabase("Database", "1.0", "AudioBookMain", 200000);
		this.db.transaction(this.populateDB,  this.populateErrorCB,this.populateSuccessCB);
}
DAOManager.prototype.populateDB = function(tx) {
    
         console.log("DAOManager.prototype.populateDB");
		 
		 
tx.executeSql('DROP TABLE IF  EXISTS config');
tx.executeSql('DROP TABLE IF  EXISTS transactions');
tx.executeSql('DROP TABLE IF  EXISTS books');
tx.executeSql('DROP TABLE IF  EXISTS categorys');
tx.executeSql('DROP TABLE IF  EXISTS search');



tx.executeSql('CREATE TABLE IF NOT EXISTS config (name unique,value)');
tx.executeSql('CREATE TABLE IF NOT EXISTS transactions (transactionIdentifier, productId unique, transactionReceipt,raw)');
tx.executeSql('CREATE TABLE IF NOT EXISTS books (id,is_new,alias,audio,title,author_name,category_id,category_label,editor_choose,rate,content)');
tx.executeSql('CREATE TABLE IF NOT EXISTS categorys  (id unique, label)');
tx.executeSql('CREATE TABLE IF NOT EXISTS search     (bookId unique, searchHash)');

}
DAOManager.prototype.populateSuccessCB = function() 
{
		app.initData();
		console.log("DAOManager.prototype.populateSuccessCB");
}
DAOManager.prototype.populateErrorCB = function(tx) {

        
        console.log("DAOManager.prototype.populateErrorCB | Error processing SQL: "+tx.message);
} 
 

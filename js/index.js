var DAOManager = null;

var app = {
    // Application Constructor
	media:null,
	seekAudio:function(type)
	{
		
	},
	playAudio:function()
	{
		if(this.media)
		{
			this.media.play();
			
			
			mediaInterval = setInterval(function()
			{
				app.media.getCurrentPosition(function(position)
				{ 
				
						$("#traccer").val(position);
						$("#traccer").slider("refresh");
				});
			},1000);
		}
	},
    initialize: function() {
        
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
        
                

				$( document ).bind( "mobileinit", function(  ) {alert("mobileinit");  });
				$( document ).bind( "pagebeforeload", function( event,data ) 
				{  
					console.log("pagebeforeload",event,data );

				});
				$( document ).bind( "pageload", function(event,data  ) 
				{    

						initLoadedPage(data.page,data); 

				});
				$( document ).bind( "pageloadfailed", function( event, data ) { alert("pageloadfailed");});
				
				$(document).ready(function()
				{
					
					
					
					$.mobile.media("screen and (-webkit-min-device-pixel-ratio: 1)");
					$.mobile.initializePage();
                    DAOManager  = new DAOManager();              

					
				});
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
		listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
	}
};

var initLoadedPage = function(currentPage,data)
{


	 
	
	$('a[data-rel="page-home"]',currentPage).on("click",function()
	{ 
			$.mobile.changePage( "index.html", { transition: "flip"} );
            
			
	});
    
    
	$("input[type='input']",currentPage).bind( "change", function(event, ui) {
			console.log(event, ui);
			alert("change");
	});
	var page = $('[data-role="content"]',currentPage);
	
	
	if(data.url)
	{
		 
		var u = $.mobile.path.parseUrl(data.url);
		re = new RegExp(/\?(.*?)=(.*?)\&{0,1}/g);
		var jsonSrc = u.search.replace(re,'data/');
		
		
		if(jsonSrc == '?myBooks')
		{
			initMyBooks(page,data.url);
			 
		}
		else
		{
			initPageFromJson(jsonSrc,page,data.url);
		}
		
	}
	else
	{
		$("*[data-src]",page).each( function(e,i){loadControlData($(i).attr('data-src'),i);});
	}
	
	$.mobile.loading('hide');
    
   
}

var initMyBooks = function (page,url)
{
	
	 
	var selectMyBooksResult = DAOManager.selectMyBooks(page);
	 
}

var initPageFromJson = function(src,page,url)
{
	$.ajax({url:src,context:page,dataType:'json',success:function(jsonData)
	{
		
		console.log("initPageFromJson.success",jsonData.callback,url);
		if(url.indexOf("Pages-player") > -1)
		{
			drowPlayerPage(jsonData,this,url);
		}
		else
		{
			window[jsonData.callback](jsonData,this,url);
		}
	}});
}
var drowPlayerPage = function(jsonData,context,url)
{
	var productIdent = jsonData.data.HREF.split(";");
	console.log("drowPlayerPage.productIdent",productIdent[0]);
	var contextHtml = $(context).html();
	for ( term in jsonData.data)
	{
		 
		contextHtml = contextHtml.split("{"+term+"}").join( jsonData.data[term]);
	}
	$(context).html(contextHtml);
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,function(fileSystem) 
	{
			 
			console.log("DAOManager.selectedProducts",DAOManager.selectedProducts);
			fileSystem.root.getFile(DAOManager.selectedProducts, { create: false }, 
			function(fileEntry)
			{
				
				console.log("fileEntry",fileEntry.fullPath);
				app.media = new Media(fileEntry.fullPath, null, function(e) { alert(JSON.stringify(e));});
				app.media.play();
				
				inittimmer = setInterval(function() 
				{
					app.media.getCurrentPosition( function(position) { 
					console.log("Position",position);
					var dur = app.media.getDuration();
					console.log("MediaDur",dur)
				    app.media.stop();

					
						$("#traccer").attr("min",0)
						$("#traccer").attr("max",dur);
						$("#traccer").val(position);
						$("#traccer").slider();
						
						clearInterval(inittimmer);
					
					
					},null);
				},1000)	 ;
				
				
			},function(){ alert("file does not exist");});
			
			
	},function(){});
	
	
	$("#traccer").on( "slidecreate", function( event, ui ) { console.log("slidecreate", event, ui);} );
	
}


var drowItemPage = function(jsonData,context,url)
{
	
	
	var productIdent = jsonData.data.HREF.split(";");
	console.log("productIdent",productIdent);
	DAOManager.isProductByed(productIdent[1]);
	
	var contextHtml = $(context).html();
	for ( term in jsonData.data)
	{
        contextHtml = contextHtml.split("{"+term+"}").join( jsonData.data[term]);
	}
    
	$(context).html(contextHtml);
	
	
	$('a[data-role="button"]',context).bind("click",function()
	{ 
			if(this.id  == 'prev')
			{
				
				return false;
			}
			if(this.id  == 'play-pause')
			{
				
				return false;
			}
			if(this.id  == 'forward')
			{
				
				return false;
			}
			var u = $.mobile.path.parseUrl(this);
			var parts = u.hash.split(";");
			window.plugins.inAppPurchaseManager.requestProductData(parts[1],requestProductDataSuccessCallback, failCallback);
			
			
			return false;
	});
	
	
	
	var u = $.mobile.path.parseUrl(url);
	re = new RegExp(/\?(.*?)=(.*?)\&mp3=(.*?){0,1}/g);
	var mp3SrcPos = u.search.indexOf('&mp3=');
	var failURL =  u.search.substring(mp3SrcPos);
	cosnole.log("URL="+mp3Src);
	 		
	
	
}

var requestProductDataSuccessCallback = function(datas)
{
    
    
   console.log("successCallback",datas);
   DAOManager.saveBook('pending', datas.id, 'pending',"pending");
   window.plugins.inAppPurchaseManager.makePurchase(datas.id);
   
}


var fserverSideProcessingPurchase = function(transactionIdentifier, productId, transactionReceipt)
{

	
	
	$.ajax({					 url:'http://www.audiobook.am/pur.php',
                                 type:"post",
                                 data:{transactionIdentifier:transactionIdentifier, productId:productId, transactionReceipt:transactionReceipt},
                                 beforeSend:function()
                                 {
                                  $.mobile.loading( 'show', { theme: "b", text: "", textonly: false});
                                 },
                                 success:function(data)
                                 {
									 console.log(data);
									 
									 jsonData = JSON.parse(data);
									 console.log(jsonData.s1_chapters[0].audio);
									 download(jsonData.s1_chapters[0].audio);
									 
									 
									 DAOManager.UpdateBook(transactionIdentifier, productId, transactionReceipt,data);
                                 },
                                 complete:function()
                                 {
                                    $.mobile.loading( 'hide');
                                 }
                          });
						  
	DAOManager.UpdateBook(transactionIdentifier, productId, transactionReceipt,"");					  
}
var failCallback = function ()
{
	alert("Product not found");
}
var addControlComponent = function (item,options,parent)
{
	
	var subItems = new Array();
	if(parseInt(item) != item)
	{
		
		for(var subItem in options){
            
            
			var new_Item = addControlComponent(subItem,options[subItem],item);
            subItems.push($(parent).append(new_Item));
			
		}
	}else
	{
        
        
		return  $(parent,options);
	}

	if(parent)
	{
        
		collection.push(subItems);
	}
	
}
var addItemsToControl = function (jsonData,continer)
{
	
	
	for(role in jsonData.data)
	{
			var control = $('[data-role="'+role+'"]',continer);
	 
			for(item in jsonData.data[role])
			{
				 
				collection = new Array();
				addControlComponent(item,jsonData.data[role][item],false);
				for(li in collection)
				{
					 
					if($(control).find("ul:first").length){
					$(control).find("ul:first").append(collection[li]);
					}else
					{
						$(control).append(collection[li]);
					}
					
				}
			}
			
			initCotrolByRole(control);
	}
	
}
var loadControlData = function(url,context)
{

	
	$.ajax({
							url:url,
							context:context,
							dataType:'json',
							success:function(jsonData)
							{
								for( elem in jsonData.data)
								{
									
									for(anc in jsonData.data[elem])
									{	

																	
										for(ancDataIndex  in jsonData.data[elem][anc])
										{
										
											var item = $(elem).appendTo(this);	
											$(anc,jsonData.data[elem][anc][ancDataIndex]).appendTo(item);
										}
										 
									}
								}
								
								initCotrolByRole(this);
								
								
							}
						});
}

var initCotrolByRole = function(i)
{
								var role = $(i).attr("data-role");
								switch(role)
								{
									case "listview":
									$(i).listview("refresh");
									break;
									case "navbar":
									$(i).navbar("destroy");
									$(i).navbar();
									break;
									case "jCarouselLite":
									 $(i).parent().jCarouselLite({btnNext: ".jcarouselHolder .next", btnPrev: ".jcarouselHolder .prev",visible:4});
									break;
								}
}



var dlFile = '';
var download = function(self)
{
    $("#status-bar").show();
	
	 
    dlFile =self;
     
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                             function(fs) {
                             fileSystem = fs;
                              startDl();
                             
                             }, function(e) {
                             alert('failed to get fs');
                             alert(JSON.stringify(e));
                             });
}



function startDl() {
   
	
    var ft = new FileTransfer();
    var uri = encodeURI("http://www.audiobook.am/them/default"+dlFile);
    statusDom = $('#status-bar');
      
   
	var downloadPath = fileSystem.root.fullPath +dlFile;
    
	ft.onprogress = function(progressEvent)
    {
		if (progressEvent.lengthComputable)
        {
			var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            
            
            //$("#slider-mini").val(perc).('refresh');
            
			$('#status-bar').html( perc + "% loaded...");
            
            // console.log(perc, progressEvent.loaded , progressEvent.total);
		} else {
			if($('#status-bar').html() == "") {
				//$('#status-bar').html("Loading");
			} else {
				//$('#status-bar').html(statusDom.html()+".");
			}
		}
	};
    
	ft.download(uri, downloadPath,
                function(entry) {
               $('#status-bar').html("");
                
				
				var media = new Media(entry.fullPath, null, function(e) { alert(JSON.stringify(e));});
                media.play();
				
				//$('#status-bar').html( entry.fullPath);
                
                //$.mobile.changePage( "Pages-player.html?src=book/134.json&mp3="+entry.fullPath, { transition: "flip"} );
                
                },
                function(error) {
                $('#status-bar').html('Crap something went wrong...');	
                });
    
	
}
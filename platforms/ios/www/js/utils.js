var utils = {
	loadTpl: function (tplName, onSuccess) {
	    var path = './templates/'+ tplName + '.html';
	    $.ajax({
	        url: path,
	        cache: true,
	        success: onSuccess
	    });
	},
	
	connectUser: function(param, onComplete){
		$.ajax({
			type: "POST",
			url: app.serviceUrl,
			data: param,
			dataType: 'json',
			timeout: 10000,
			success: function(msg){
				app.userIsLogged = true;
			},
			fail: function(err){
				app.userIsLogged = false;
			},
			complete: onComplete
		});
	},
	
	loadEventData: function(id, dataQuery, onComplete){
		$.ajax({
			type: "POST",
			url: app.serviceUrl + 'event/' + id,
			data: dataQuery,
			dataType: 'json',
			timeout: 10000,
			success: function(msg){
				//console.log(msg)
			},
			fail: function(err){
				console.log('loadEventData fail = ' + err)
			},
			complete: onComplete
		});
	},
	
	updateTPageInfo: function(title, pageClass){
		$('.bar-header .title').text(title);
		$('body').data('page', pageClass)
	},
	
	sync: function(id){
		//simulate "sync is done" action for now
		app.events[id].hasSynced = true;
		console.log('sync');
		console.log(id);
		console.log(app.events[id]);
		this.saveToStorage();
	},
			
	saveToStorage: function(){
		console.log('saveToStorage');
		window.localStorage.setItem('events', JSON.stringify( app.events ) );
	},
	
	
};
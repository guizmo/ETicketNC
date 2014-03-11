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
			url: app.portal + '&task=ws.login&' + param,
			dataType: 'json',
			timeout: 10000,
			success: function(result){
				if( typeof( result.data.id_guichet ) != 'undefined' ){
					app.user.isLogged = true;
					app.user.hash = spark_md5_binary("password");
					app.user.guichet = result.data.guichet;
					app.user.id_guichet = result.data.id_guichet;
					app.user.credential = param;
					app.user.isOnline = true;
				}
			},
			fail: function(err){
				app.user.isLogged = false;
				app.user.isOnline = false;
			},
			complete: onComplete
		});
		
	},
	
	loadEventData: function(param, dataQuery, onComplete){
		
		$.ajax({
			type: "POST",
			url: app.portal + '&task=ws.getBillets&' + app.user.credential + '&' + param,
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
		$('body').data('page', pageClass);
	},
	
	sync: function(parent_id, id){
		var _this = this;

		//TODO
		//multiple ids in seance array
		var id_guichet = app.user.id_guichet;
			params = '&task=ws.getBillets&' + app.user.credential + '&seance={"ids":[' + id + ']}&guichet_id=' + id_guichet ,
			tickets = app.events[parent_id]['seances'][id]['tickets'],
			billets = [];
		
		for( key in tickets){
			var ticket_id = tickets[key]['id'],
				ticket_status = tickets[key]['status'],
				ticket_dateScan = tickets[key]['dateScan'];
				
			billets.push( {"id":ticket_id,"status":ticket_status,"dateScan":ticket_dateScan} );
		}
		
		var syncData = '&scan={"billets":' + JSON.stringify(billets) + '}';
		
				
		
		$.ajax({
			type: "POST",
			url: app.portal + params + syncData,
			dataType: 'json',
			timeout: 10000,
			success: function(result){
				
				if( typeof(result.data.billets) == 'object' ){
					app.events[parent_id]['seances'][id]['hasScanned'] = false ;
					app.events[parent_id]['seances'][id]['hasSynced'] = true;
					app.events[parent_id]['seances'][id].tickets = result.data.billets;
					
					console.log('saveToStorage sync')
					_this.saveToStorage(parent_id, id, true);
					alertLaunch('La mise à jour a bien été effectuée', 'Mise à jour');
				}

			},
			fail: function(err){
				console.log('SYNC FAIL')
				console.log(err);
				alertLaunch('La mise à jour ne sait pas effectuée', 'Echec de la connexion');
			}
		});
		
		
		
		function alertDismissed() {
		    // do something
		}
		function alertLaunch(msg, title) {
			navigator.notification.alert(
			    msg,
			    alertDismissed,
			    title,
			    'Fermer'
			);
		}

	},
			
	saveToStorage: function(parent_id, id){
		console.log('saveToStorage');

		var localData = window.localStorage.getItem('events'),
			user_id = window.localStorage.getItem('user_id'),
			id_guichet = app.user.id_guichet;
		
		console.log($.parseJSON(localData));

		window.localStorage.setItem('user_id', id_guichet)
		window.localStorage.setItem('events', JSON.stringify( app.events ) );


/*
		if(typeof(user_id) != 'undefined' && user_id == id_guichet && parent_id && id && typeof(localData) != 'undefined' && !!localData){
			var localDataObj = $.parseJSON(localData);

			if(typeof(localDataObj[parent_id]) != 'undefined'){
				var clonedObj = app.events[parent_id]['seances'][id];

				localDataObj[parent_id]['seances'][id] = clonedObj;
				window.localStorage.setItem('events', JSON.stringify( localDataObj ) );
			}

		}else{
			window.localStorage.setItem('events', JSON.stringify( app.events ) );
		}
*/

		
	},
	
	
};
var startApp = {

	init : function(){
		this.login();
	},
	
	login : function(){

	    var body = $('body'),
	   		logginForm = body.find('#loginForm'),
		    formVals = logginForm.serialize(),
		    self = this;
		
		utils.updateTPageInfo('Se connecter à un guichet', 'loggin-view');
		    
	    logginForm.on('submit', function(e){

			e.preventDefault();
			
			if($('#user').val() == '' || $('#password').val() == ''){
				function alertDismissed() {
				    // do something
				}
				
				navigator.notification.alert(
				    'L\'identifiant et mot de pass doivent être renseignés',
				    alertDismissed,
				    'Echec de la connexion',
				    'Fermer'
				);
				return;
			}
			
			
			console.log(formVals);
			
			//TODO
			// check what type of response to give a better error message
			// ex: service indisponible or bad password
			utils.connectUser(formVals, function(data){
	
				
				if(app.userIsLogged){
					var response = $.parseJSON(data.response),
						userData = response.user;
				
					body.addClass('logged-in').removeClass('logged-out');
					//app.events = userData.events;
					
					for (var i=0;i<userData.events.length;i++){
						app.events[userData.events[i].ticket_list_id] = userData.events[i];
					}
	
					var events = {
						events: userData.events
					}
	
					utils.loadTpl('events-list', function (data) {
			            var source = data;
			            template = Handlebars.compile(source);
						
						var eventListHtml = template(events)
						//console.log(html)
						$('#event-list').html(eventListHtml);
						
					
						//now that we have some events to choose from
						self.loadEventTickets();
			        });
			        
				}else{
					body.addClass('logged-out').removeClass('logged-in');

					function alertDismissed() {
					    // do something
					}
					
					navigator.notification.alert(
					    'L\'identifiant et mot de passe renseignés sont incorrect',
					    alertDismissed,
					    'Echec de la connexion',
					    'Fermer'
					);
				}
				
			});
	    });
	},
	
	loadEventTickets: function(){
		var eventList = $('#event-list')
			self = this;
	
		utils.updateTPageInfo('Choisir un évènement', 'events-view');
	
		eventList.find('li').on('click', function(){
			var $this = $(this),
				listID = $this.data('list_id');
				
				
			utils.loadEventData(listID, function(data){
				var response = $.parseJSON(data.response),
					key,
					count = 0,
					valid = 0;
					
				for(key in response.event.tickets) {
					if(response.event.tickets.hasOwnProperty(key)) {
						count++;
						if(response.event.tickets[key] === 0){
							valid++;
						}
					}
				}

				
				//Object.keys(app.events[2][tickets]).length
				app.events[response.event.ticket_list_id]['tickets'] = response.event.tickets;
				app.events[response.event.ticket_list_id]['infos'] = {
					total: count,
					scanned: valid,
					toScan: count-valid
				};
								
				window.localStorage.setItem('events', JSON.stringify( app.events ) );
				
				self.scanView(listID);
			});

		});
	},
	
	scanView: function(id){
		var self = this;
		utils.loadTpl('event', function (tpl) {

			
			console.log(app.events[id])
			
			var infos = {
				total: 1500,
				scanned: 324,
				toScan: 1176
			}

            var source = tpl;
            template = Handlebars.compile(source);
			
			var eventHtml = template(app.events[id].infos);
			
			$('#event-list').hide();
			$('#event').html(eventHtml).show();

			utils.updateTPageInfo(app.events[id].name, 'scanner-view');

			$('#back-btn').on('click', function(){
				$('#event').hide();
				$('#event-list').show();
				utils.updateTPageInfo('Choisir un évènement', 'events-view');
			})
			
			$('#close').on('click', function(){
				plugins.barcodeScanner.dismiss();
				$('body').removeClass('scanner-on').addClass('scanner-off');
	
			})
	
			$('#scan').on('click', function(){
				self.scanner();
				$('body').removeClass('scanner-off').addClass('scanner-on');
				console.log('scan')
			})

        });
	},
	
    scanner: function(){
		console.log('open scanner')
    	var self = this;
		plugins.barcodeScanner.scan( function (result) {
			console.log("We got a barcode\n" +
			"Result: " + result.text + "\n" +
			"Format: " + result.format + "\n" +
			"Cancelled: " + result.cancelled);
			
			navigator.notification.beep(1);
			navigator.notification.vibrate();
			
			setTimeout(self.scanner, 1000);
			
		}, function (error) {
			console.log("Scanning failed: " + error);
		});    
	}
}
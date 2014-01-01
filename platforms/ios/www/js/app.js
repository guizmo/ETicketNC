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

		$('#logout-btn').on('click', function(){
			//$('#event-list').hide();
			$('body').removeClass('logged-in').addClass('logged-out');
			utils.updateTPageInfo('Se connecter à un guichet', 'loggin-view');
		})

		eventList.find('li').on('click', function(){
			var $this = $(this),
				listID = $this.data('list_id'),
				localDataObj = {},
				dataQuery = '';
				localData = window.localStorage.getItem('events');
				
			//need to sync data here using data from LocalStorage	
			if(typeof(localData) != 'undefined'){
				localDataObj = $.parseJSON(localData);
				dataQuery = JSON.stringify(localDataObj[listID].tickets);
			}
			console.log(localDataObj);
			console.log(dataQuery);
			
			utils.loadEventData(listID, dataQuery, function(data){

				//while the SERVICE is not done yet
				//I will fake it using the local storage data
				
				if(typeof(dataQuery) != 'undefined' && dataQuery.length){ //fake check for now
					var response = localDataObj[listID];
					var tickets = response.tickets;
					//var ticket_list_id = listID;
				}else{
					var response = $.parseJSON(data.response);
					var tickets = response.event.tickets;
					//var ticket_list_id = response.event.ticket_list_id;
				}


				console.log(response)

				var key,
					count = 0,
					valid = 0;

				console.log('dataQuery = ' + dataQuery);


				
				for(key in tickets) {
					if(tickets.hasOwnProperty(key)) {
						count++;
						if(tickets[key] === 0){
							valid++;
						}
					}
				}

				
				//Object.keys(app.events[2][tickets]).length
				app.events[listID]['hasScanned'] = false;
				app.events[listID]['hasSynced'] = false;
				app.events[listID]['tickets'] = tickets;
				app.events[listID]['infos'] = {
					total: count,
					scanned: valid,
					toScan: count-valid
				};
								
				utils.saveToStorage();
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
			
			//$('#event-list').hide();
			//$('#event').html(eventHtml).show();
			$('#event').html(eventHtml)

			utils.updateTPageInfo(app.events[id].name, 'scanner-view');

			$('#back-btn').on('click', function(){
				//$('#event').hide();
				//$('#event-list').show();
				
				console.log(app.events[id])
				if(!app.events[id].hasScanned){
					utils.updateTPageInfo('Choisir un évènement', 'events-view');
				}else{
					function onConfirm(buttonIndex) {
						console.log('buttonIndex = ' + buttonIndex)
					
						if(buttonIndex == 1){
							utils.sync(id);
							utils.updateTPageInfo('Choisir un évènement', 'events-view');
						}else{
							utils.saveToStorage();
							utils.updateTPageInfo('Choisir un évènement', 'events-view');
						}
					}

					navigator.notification.confirm(
					    'Des tickets ont étés scannés, souhaitez vous les synchroniser maintenant',
					    onConfirm,            // callback to invoke with index of button pressed
			            'Synchronisation',           // title
			            ['Oui','Non']
					);
				}
			})
			
			$('#close').on('click', function(){
				plugins.barcodeScanner.dismiss();
				$('body').removeClass('scanner-on').addClass('scanner-off');
	
			})
	
			$('#scan').on('click', function(){
				self.scanner(id);
				$('body').removeClass('scanner-off').addClass('scanner-on');
			})

        });
	},
	
    scanner: function(id){

		var self = this,
			event = app.events[id],
			tickets = event.tickets;
			
		console.log(tickets)
		$('#ticket-scanned').removeClass();
		
		plugins.barcodeScanner.scan( function (result) {
		
			console.log(tickets)
			
			if(result.format == 'QR_CODE'){
				event.hasScanned = true;
				var ticket = result.text.split('&'),
					ticketId = ticket[0],
					ticketToken = ticket[1];
					
				console.log('ticketId = ' + ticketId)
				console.log('tickets.ticketId = ' + tickets[ticketId])
				
				if(app.vibration){
					navigator.notification.vibrate();
				}
				
				if(app.sound){
					navigator.notification.beep(1);
				}
				
				if(tickets[ticketId]){
					tickets[ticketId] = 0;
					$('#ticket-scanned').addClass('status-on').find('#scan-result').text('Ticket "' + ticketId + '"');
					
				}else{
					$('#ticket-scanned').addClass('status-fail').find('#scan-result').text('Ticket "' + ticketId + '"');
					
					function alertDismissed() {
						//reset fail indicator
					    $('#ticket-scanned').addClass('status-fail');
						setTimeout(function(){
							self.scanner(id);
						} , 1500);
					}
					
	
					navigator.notification.alert(
					    'Ce ticket n\'est plus valide',
					    alertDismissed,
					    'Ticket invalide',
					    'Fermer'
					);
					
					return;
				}
								
				setTimeout(function(){
					self.scanner(id);
				} , 1500);
			
			}else{

				function alertDismissed() {
					setTimeout(function(){
						self.scanner(id);
					} , 1500);
				}
				

				navigator.notification.alert(
				    'Ce type de code n\'est pas reconnu par cette application',
				    alertDismissed,
				    'Type de code invalide',
				    'Fermer'
				);


			}

		
		}, function (error) {
			//failed so log a message for testing then reset scanner
			console.log("Scanning failed: " + error);
			setTimeout(function(){
				self.scanner(id);
			} , 1500);
		});    
	}
}
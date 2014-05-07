var startApp = {

	init : function(){
		this.login();
	},
	
	login : function(){

	    var body = $('body'),
	   		logginForm = body.find('#loginForm'),
		    self = this;
		
		utils.updateTPageInfo('Se connecter à un guichet', 'loggin-view');

		$('#loginForm input').on('focus', function(e) {
		    e.preventDefault();
		    e.stopPropagation();
		    
		    $('#main').scrollTop($('#formContent').height());
		    
		});
		


	    logginForm.on('submit', function(e){
		    var formVals = $(this).serialize();
		    
			e.preventDefault();
			
			$('#loginForm input').blur();
			
			if($('#username').val() == '' || $('#password').val() == ''){
				function alertDismissed() {
				    $('#username').focus();
				}
				
				navigator.notification.alert(
				    'L\'identifiant et mot de passe doivent être renseignés',
				    alertDismissed,
				    'Formulaire incomplet',
				    'Fermer'
				);
				return;
			}
			
			
			//TODO
			// check what type of response to give a better error message
			// ex: service indisponible or bad password
			utils.connectUser(formVals, function(data){
				var localData = window.localStorage.getItem('events'),
					user_id = window.localStorage.getItem('user_id'),
					credential = window.localStorage.getItem('credential'),
					dataResponse = data.response;
				
				//console.log(data);
				

				if(dataResponse.length){
					var response = $.parseJSON(data.response),
						message = response.message,
						messages = response.messages,
						warning = '';
				}else{
					var message = '',
						messages = '',
						warning = '';
				}
				
					

				if(data.statusText != 'OK' || data.statusText == ''){
					var errorMsg = 'Echec de la connexion';
				}else{
					var errorMsg = 'L\'identifiant et mot de passe renseignés sont incorrect';
				}
				
				
				function handleData(handledData, from){

					body.addClass('logged-in').removeClass('logged-out');

					if(from == 'LS'){
						app.events = handledData;
						var events = {
							events: handledData,
							guichet: user_id,
							id_guichet: user_id
						}
					}else if(from == 'online'){
						var userData = handledData;
						app.events = userData.evenements;
						var events = {
							events: userData.evenements,
							guichet: app.user.id_guichet,
							id_guichet: app.user.id_guichet
						}
					}
	
					utils.loadTpl('events-list', function (data) {
			            var source = data;
			            template = Handlebars.compile(source);
						
						var eventListHtml = template(events)
						//console.log(html)
						$('#event-list').html(eventListHtml);
						
					
						//now that we have some events to choose from
						self.loadEventTickets();
						
						
						$('#loginForm input').val('');
			        });
				}
				
				
				if(app.user.isLogged){
					window.localStorage.setItem('credential', formVals );
					//console.log('is connected');

					if(response && response.success && response.data ){

						var userData = response['data'];
						//console.log(response);
						handleData(userData, 'online');
				        
				        
				        
					}
				//}else if(!app.user.isLogged && localData.length && user_id.length && credential.length && credential == formVals){
					/*
					//remove local storage option for now
					console.log('is not connected but as LS');

					app.user.credential = formVals;
					app.user.isLogged = true;
				
					var localDataObj = $.parseJSON(localData);
					handleData(localDataObj, 'LS');
					*/



					/*if(typeof(localDataObj[parent_id]) != 'undefined'){
						var clonedObj = app.events[parent_id]['seances'][id];
		
						localDataObj[parent_id]['seances'][id] = clonedObj;
					}*/
						
				}else{
					//console.log('is not connected');
					body.addClass('logged-out').removeClass('logged-in');

					if( typeof(messages.warning) != 'undefined'){
						warning = messages.warning[0];
					    errorMsg = message + ' : ' + warning;
					}
					
					
					function alertDismissed() {
					    // do something
					}
					
					navigator.notification.alert(
					    errorMsg,
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

		$('#logout-btn').on('tap', function(){
			$('body').removeClass('logged-in').addClass('logged-out');
			utils.updateTPageInfo('Se connecter à un guichet', 'loggin-view');
		})

		eventList.find('a.seance').on('tap', function(){
			var $this = $(this),
				listID = $this.data('list_id'),
				parentListID = $this.parent().data('parent_list_id'),
				id_guichet = $this.data('id_guichet'),
				params = 'seance={"ids":[' + listID + ']}&guichet_id=' + id_guichet,
				localDataObj = {},
				dataQuery = '',
				localData = window.localStorage.getItem('events');
				
				
			
			utils.loadEventData(params, dataQuery, function(data){
				
				if(data.response.length){
					var response = $.parseJSON(data.response);
				}
				
				var count = 0,
					valid = 0,
					guichetCount = 0;


				//check if data was returned from request
				//if not use data from LocalStorage
				
				if( typeof(response) != 'undefined' && response.success && response.data.billets && response.data.billets.length != 0){
					var tickets = response.data.billets;
				
					for(key in tickets) {
						if(tickets.hasOwnProperty(key)) {
							count++;
							
							if(tickets[key]['status'] == '1'){
								valid++;
							}
						}
					}
					
	
					app.events[parentListID]['seances'][listID]['hasScanned'] = false;
					app.events[parentListID]['seances'][listID]['hasSynced'] = false;
					app.events[parentListID]['seances'][listID]['tickets'] = tickets;
					app.events[parentListID]['seances'][listID]['infos'] = {
						total: count,
						scanned: valid,
						toScan: count-valid,
						guichet: guichetCount
					};
					//console.log('saveToStorage loadEventTickets')
					utils.saveToStorage(parentListID, listID);

					self.scanView(listID, parentListID);
					
				}else{
					
					if(typeof(response) == 'undefined'){
						navigator.notification.confirm(
						    'Souhaitez vous utiliser les données stockées dans le téléphone ?',
						    onConfirm,
						    'Echec de la connexion',
						    ['Oui','Non']
						);
					}else{
						alertNoData();
					}
					
					function onConfirm(buttonIndex) {
					
						if(buttonIndex == 1){
							if(typeof(localData) != 'undefined' && !!localData){
								localDataObj = $.parseJSON(localData);
								
								if(typeof(localDataObj[parentListID]['seances'][listID].tickets) != 'undefined'){
									app.events[parentListID]['seances'][listID] = localDataObj[parentListID]['seances'][listID];
									self.scanView(listID, parentListID);
								}else{
									alertNoData();
								}
								
							}else{
								alertNoData();
							}
						}else{
							return;
						}
					}
					
					function alertNoData() {
						navigator.notification.alert(
						    'Aucune données disponible pour cet évènement',
						    alertDismissed,
						    'Aucune données',
						    'Fermer'
						);
					}


					function alertDismissed() {
						//Do NOTHING
					}
				}
				
			
			});

		});
	},
	
	scanView: function(id, parent_id){
		var self = this;
		$('#event').empty();


		utils.loadTpl('event', function (tpl) {
			$('#back-btn').unbind('tap');

            var source = tpl,
				name = app.events[parent_id]['evenement'],
				template = Handlebars.compile(source);
			
			var eventData = {
				infos: app.events[parent_id]['seances'][id]['infos'],
				title: app.events[parent_id]['seances'][id]['date']
			}
			var eventHtml = template(eventData);
			
			
			$('#event').html(eventHtml)
			utils.updateTPageInfo(name, 'scanner-view');


			$('#back-btn').on('tap', function(){
				console.log('sync !');
				if(!app.events[parent_id]['seances'][id].hasScanned){
					console.log('sync 1 !');
					console.log(app.events[parent_id]['seances'][id].hasScanned)
					utils.updateTPageInfo('Choisir un évènement', 'events-view');
				}else{
					function onConfirm(buttonIndex) {
						console.log('sync 2 !');
						console.log(buttonIndex)
						
						if(buttonIndex == 1){
							utils.sync(parent_id, id);
							utils.updateTPageInfo('Choisir un évènement', 'events-view');
						}else{
							//console.log('saveToStorage scanview')
							utils.saveToStorage(parent_id, id);
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
			
			$('#sync-btn').on('tap', function(){
				console.log('sync 3!');
				console.log(parent_id + ' AND ' + id);
				utils.sync(parent_id, id);
			})
			
			$('#close a').on('tap', function(){
				console.log('CLOSE SCAN');
				plugins.barcodeScanner.dismiss();
				$('body').removeClass('scanner-on').addClass('scanner-off');
				
				window.setInterval(function(){
				  console.log('waiting-card hidden')
				  $('#waiting-card').addClass('hidden');
				  
				}, 5000);				
				
			})
	
			$('#scan a').on('tap', function(){
				console.log('OPEN SCAN');
				self.scanner(parent_id, id);
				$('body').removeClass('scanner-off').addClass('scanner-on');
			})
        });
	},
	
    scanner: function(parent_id, id){

		var self = this,
			event = app.events[parent_id]['seances'],
			tickets = event[id]['tickets'];

			//console.log(tickets)
			
		$('#ticket-scanned').removeClass();
		
		//starts scanner
		plugins.barcodeScanner.scan( function (result) {
			//scan success calback
			
			var resultDiv = $('#result'),
				scanViewDiv = $('#scanner-view');
			
			
			if(result.format == 'QR_CODE'){
				//if this is a QRCODE
				event[id].hasScanned = true;
				var ticket = result.text.split('&'),
					ticketId = ticket[0],
					ticketToken = ticket[1];
				
				
				
				if( typeof( tickets[ticketId] ) == 'undefined'){
					errorMsg = 'Ce ticket n\'est pas valide pour cet évènement';
				}else{
					errorMsg = 'Ce ticket a déja été scanné'
				}
				
				
				
				//check if ticket id is valid
				if( typeof( tickets[ticketId] ) != 'undefined' && tickets[ticketId]['status'] == 0 && ticketToken == tickets[ticketId]['token']){
					//ID is valid

					// code scanned options
					if(app.sound){
						navigator.notification.beep(1);
					}


					function onConfirm(buttonIndex) {

						if(buttonIndex == 1){
							//validated by guichet
							tickets[ticketId]['status'] = 1;
							tickets[ticketId]['dateScan'] = moment().format('YYYY-MM-DD HH:mm:ss');
							
							
							var ticketsScanned = $('#ticket-scanned');
							
							ticketsScanned
								.addClass('status-on')
								.find('#scan-result')
								.text('Dernier Ticket "' + ticketId + '"');
								
							
							app.events[parent_id]['seances'][id]['infos']['scanned']++,
							app.events[parent_id]['seances'][id]['infos']['toScan']--;
							app.events[parent_id]['seances'][id]['infos']['guichet']++
							
							resultDiv.find('#scanned').text(app.events[parent_id]['seances'][id]['infos']['scanned']);
							resultDiv.find('#toScan').text(app.events[parent_id]['seances'][id]['infos']['guichet']);
							resultDiv.find('#guichetCount').text(app.events[parent_id]['seances'][id]['infos']['scanned']);
							
							ticketsScanned
								.find('#scanned-count')
								.text(app.events[parent_id]['seances'][id]['infos']['scanned']);


							setTimeout(function(){
								self.scanner(parent_id, id);
							} , 1500);
							
						}else{
							// not validated by guichet
							// TODO
							setTimeout(function(){
								self.scanner(parent_id, id);
							} , 1500);
						}
					}

					navigator.notification.confirm(
					    'Numéro de ticket : ' + ticketId,
					    onConfirm,            // callback to invoke with index of button pressed
			            'Validation',           // title
			            ['Valider','Annuler']
					);
					



				}else{

					// code scanned options
					if(app.vibration){
						navigator.notification.vibrate();
					}

					//is not valid
					$('#ticket-scanned').addClass('status-fail').find('#scan-result').text('Dernier Ticket "' + ticketId + '"');
					
					function alertDismissed() {
						//reset fail indicator
					    $('#ticket-scanned').addClass('status-fail');
						setTimeout(function(){
							self.scanner(id);
						} , 1500);
					}
	
					navigator.notification.alert(
					    errorMsg,
					    alertDismissed,
					    'Ticket non valide',
					    'Fermer'
					);
					
					return;
				}
								
			
			}else{
				//If not a QRCODE

				// code scanned options
				if(app.vibration){
					navigator.notification.vibrate();
				}

				function alertDismissed() {
					setTimeout(function(){
						self.scanner(parent_id, id);
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
			//scan failed calback
			//failed so log a message for testing then reset scanner
			//console.log("Scanning failed: " + error);
			setTimeout(function(){
				self.scanner(parent_id, id);
			} , 1500);
		});    
	}
}
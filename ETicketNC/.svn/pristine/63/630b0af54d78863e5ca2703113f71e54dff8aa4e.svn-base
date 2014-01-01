var user = {
	isLogged: false,
	
	connect: function(param, onComplete){
		console.log(param);
		

		$.ajax({
			type: "POST",
			url: app.serviceUrl,
			data: param,
			dataType: 'json',
			timeout: 10000,
			success: function(msg){
				console.log(msg)
				user.isLogged = true;
			},
			fail: function(err){
				console.log(err)
				user.isLogged = false;
			},
			complete: onComplete/*
: function(data){
				console.log(data)
			}
*/
		});

	
		
	}
}	
	
	
	
/*
	scope.login = function() {
		var config = {method: 'GET', url: 'http://localhost:8888/services/'} // configuration object
		
		$http(config)
		.success(function(data, status, headers, config) {
			console.log(data)
			if (data.status) {
				// succefull login
				User.isLogged = true;
				User.username = data.username;
			}
			else {
				User.isLogged = false;
				User.username = '';
			}
		})
		.error(function(data, status, headers, config) {
			User.isLogged = false;
			User.username = '';
		});
	}
*/

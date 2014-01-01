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
			complete: onComplete
		});

	
		
	}
}	
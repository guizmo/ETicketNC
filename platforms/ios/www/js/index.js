/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	vibration: true,
	sound: true,
	deviceOS: null,
	serviceUrl: 'http://dev.guillaume-bartolini.com/services/',
	events: {},
	userIsLogged: false,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('resume', this.onDeviceResume, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        startApp.init();
        
		ionic.Platform.detect();
		StatusBar.styleDefault();
		
	    setTimeout(function() {
	        navigator.splashscreen.hide();
	    }, 500);
	    
    },
    
    onDeviceResume: function() {
	    app.receivedEvent('resume');	    
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

        console.log('Received Event: ' + id);
        
        if(id == 'deviceready' || id == 'resume'){
	        app.getAppSettings();
        }
    },
    
    getAppSettings: function(){
		/*
		window.applicationPreferences.set("enabled_vibration", "myValue", function() {
			alert("Successfully saved!");
		}, function(error) {
			alert("Error! " + JSON.stringify(error));
		});
		*/
	
		
		window.applicationPreferences.get("enabled_vibration", function(value) {
	        app.vibration = parseInt(value);
	    }, function(error) {
	        console.log("Error! " + JSON.stringify(error));
		});		
		
		
		window.applicationPreferences.get("enabled_beep", function(value) {
	        app.sound = parseInt(value);
	    }, function(error) {
	        console.log("Error! " + JSON.stringify(error));
		});		
    }
        
    
};






function on(elSelector, eventName, selector, fn) {var element = document.querySelector(elSelector);element.addEventListener(eventName, function(event) {var possibleTargets = element.querySelectorAll(selector);var target = event.target;for (var i = 0, l = possibleTargets.length; i < l; i++) {var el = target;var p = possibleTargets[i];while (el && el !== element) {if (el === p) {return fn.call(p, event);}el = el.parentNode;}}});};
 
on('body', 'click', '.logout_hundler', function() {
			link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' )
			link.open( 'GET', "/logout/", true );
			
			link.onreadystatechange = function () {
				if ( link.readyState == 4 && link.status == 200 ) {
					window.location.href = "/login/";
				}
				else {
					console.log()
				}};
				link.send( null );
	});
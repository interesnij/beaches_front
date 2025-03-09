function on(elSelector, eventName, selector, fn) {var element = document.querySelector(elSelector);element.addEventListener(eventName, function(event) {var possibleTargets = element.querySelectorAll(selector);var target = event.target;for (var i = 0, l = possibleTargets.length; i < l; i++) {var el = target;var p = possibleTargets[i];while (el && el !== element) {if (el === p) {return fn.call(p, event);}el = el.parentNode;}}});};

info_div = document.body.querySelector(".user_info");
const ID = info_div.getAttribute("data-id");
const FIRSTNAME = info_div.getAttribute("first-name");
const LASTNAME = info_div.getAttribute("last-name");
const ER = info_div.getAttribute("data-er");
console.log("info_div", info_div);
console.log("ID", ID);
console.log("FIRSTNAME", FIRSTNAME);
console.log("LASTNAME", LASTNAME);
console.log("ER", ER);


function stringify(obj) {
    const replacer = [];
    for (const key in obj) {
        replacer.push(key);
    }
    return JSON.stringify(obj, replacer);
}

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

on('body', 'click', '#create_place', function() {
    _this = this;
    form = _this.parentElement.parentElement;
    response = form.querySelector(".api_response");

	form_data = new FormData(form);
  
    if (!form.querySelector("#id_title").value){
      form.querySelector("#id_title").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Название";
      response.classList.add("error");
      return 
    }
    else if (!form.querySelector("#id_cord").value){
      form.querySelector("#id_cord").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Координаты";
      response.classList.add("error")
      return
    } 
    else {
      _this.disabled = true;
    }
    
	form_data.append("user_id", ID);
	form_data.append("type_id", "");
    object = {};
    form_data.forEach((value, key) => object[key] = value);
    json = JSON.stringify(object);
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
    link.open( 'POST', "/create_place/", true );
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
        window.location.href = "/";
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
});

on('body', 'click', '#edit_place', function() {
    _this = this;
    form = _this.parentElement.parentElement;
    response = form.querySelector(".api_response");

	form_data = new FormData(form);
    if (!form.querySelector("#id_title").value){
      form.querySelector("#id_title").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Название";
      response.classList.add("error");
      return 
    }
    else if (!form.querySelector("#id_cord").value){
      form.querySelector("#id_cord").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Координаты";
      response.classList.add("error")
      return
    } 
    else {
      _this.disabled = true;
    }
    
	form_data.append("user_id", ID);
  form_data.append("place_id", _this.getAttribute("place_id"));
	form_data.append("type_id", "");
  form_data.delete('image'); 

  new_form_data = new FormData();
  files = document.querySelector('#id_image').files;
  for (var x = 0; x < files.length; x++) {
    new_form_data.append("files[]", files[x]);
  }
  console.log(new_form_data);

  new_link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
  new_link.open( 'POST', "https://back.my-demo.ru/edit_place/" + _this.getAttribute("place_id") +"/img/", true );
  //new_link.setRequestHeader('Content-Type', '');
  new_link.onreadystatechange = function () {
  if ( new_link.readyState == 4 && new_link.status == 200 ) {
      object = {};
    form_data.forEach((value, key) => object[key] = value);
    json = JSON.stringify(object);
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
    link.open( 'POST', "/place/" + _this.getAttribute("place_id") +"/edit/", true ); 
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
	      if (form.querySelector("#id_image").files.length > 0){
            
        }
        window.location.href = "/";
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
  }}
  new_link.send(new_form_data);
});

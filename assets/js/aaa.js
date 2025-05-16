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

  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
  link.open( 'POST', "/place/" + _this.getAttribute("place_id") +"/edit/", true ); 
  link.setRequestHeader('Content-Type', 'application/json');
  
  link.onreadystatechange = function () {
  if ( link.readyState == 4 && link.status == 200 ) {
      window.location.href = "/place/" + _this.getAttribute("place_id") + "/";
  } 
  else {
      _this.disabled = false;
      response.style.display = "block";
      response.classList.add("error");
  }};
  link.send(json);
});


on('body', 'click', '.change_user_avatar', function() {
  this.previousElementSibling.querySelector("input").click();
});
on('body', 'click', '.change_place_avatar', function() {
  this.previousElementSibling.querySelector("input").click();
});
on('body', 'click', '.change_place_background', function() {
  this.previousElementSibling.querySelector("input").click();
});

on('body', 'change', '#id_user_image', function() {
    form = this.parentElement;
    form_data = new FormData(form);
    link_ = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    link_.open('POST', "/create/upload_files/?types=user_avatar", true);
    link_.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    link_.onreadystatechange = function() {
        console.log("this.readyState", this.readyState);
        console.log("this.status", this.status);
        if (this.readyState == 4) {
            console.log("reload");
            location.reload();
        }
    }; 
    link_.send(form_data);
});

on('body', 'change', '#id_place_image', function() {
    form = this.parentElement;
    id = form.getAttribute("data-id");
    form_data = new FormData(form);
    link_ = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    link_.open('POST', "/create/upload_files/?types=place_avatar&id=" + id, true);
    link_.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    link_.onreadystatechange = function() { 
        if (this.readyState == 4) {
            location.reload();
        }
    }; 
    link_.send(form_data);
});

on('body', 'change', '#id_place_background', function() {
    form = this.parentElement;
    id = form.getAttribute("data-id");
    form_data = new FormData(form);
    link_ = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    link_.open('POST', "/create/upload_files/?types=place_background&id=" + id, true);
    link_.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    link_.onreadystatechange = function() { 
        if (this.readyState == 4) {
            location.reload();
        }
    }; 
    link_.send(form_data);
});


function setCookie(name, value, days) {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (days) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      cookie += `; expires=${expiry.toUTCString()}`;
  }
  document.cookie = cookie + "; path=/";
};

function set_background(color) {
  setCookie("background", color, 120);
}


on('body', 'click', '.header-theme-mode', function() {
  html = document.documentElement;
  console.log("html", html);
  console.log("data-theme-mode", html.getAttribute("data-theme-mode"));

  if (html.getAttribute("data-theme-mode") == "light") {
    set_background("light");
  }
  else {
    set_background("dark");
  }
})


on('body', 'click', '#edit_user_info', function() {
  _this = this;
  form = _this.parentElement;
  response = form.querySelector(".api_response");

	form_data = new FormData(form);
    if (!form.querySelector("#id_first_name").value){
      form.querySelector("#id_first_name").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Имя";
      response.classList.add("error");
      return 
    }
    else if (!form.querySelector("#id_last_name").value){
      form.querySelector("#id_last_name").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите фамилию";
      response.classList.add("error")
      return
    } 
    else if (!form.querySelector("#id_email").value){
      form.querySelector("#id_email").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите почту";
      response.classList.add("error")
      return
    } 
    else {
      _this.disabled = true;
    }

  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
  link.open( 'POST', "/edit_user/", true ); 
  link.setRequestHeader('Content-Type', 'application/json');
  
  link.onreadystatechange = function () {
  if ( link.readyState == 4 && link.status == 200 ) {
      alert("Сохранено");
  } 
  else {
      _this.disabled = false;
      response.style.display = "block";
      response.classList.add("error");
  }};
  link.send(json);
});


on('body', 'click', '#create_region', function() {
  let form = this.parentElement.parentElement;
  
  form.querySelector("#id_name").style.setProperty('border', 'inherit', 'important');
  //form.querySelector("#id_country").style.setProperty('border', 'inherit', 'important');

  if (!form.querySelector("#id_name").value) {
      form.querySelector("#id_name").style.setProperty('border', '1px #FF0000 solid', 'important');
      toast_error("Укажите название");
      return
  }
  //else if (!form.querySelector("#id_country").value) {
  //  form.querySelector("#id_country").style.setProperty('border', '1px #FF0000 solid', 'important');
  //  toast_error("Укажите страну");
  //  return
  //}

  form.querySelector("#create_region").setAttribute("disabled", "true");
  form.querySelector("#create_region").innerHTML = "Идет сохранение";

  form_data = new FormData(form);
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/create_region/", true );
    link.setRequestHeader('Content-Type', 'application/json');
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      location.reload()
    }};
    link.send(json);
});
on('body', 'click', '#edit_region', function() {
  _this = this;
  form = _this.parentElement.parentElement;

  form.querySelector("#id_name").style.setProperty('border', 'inherit', 'important');
  //form.querySelector("#id_country").style.setProperty('border', 'inherit', 'important');

  if (!form.querySelector("#id_name").value) {
    form.querySelector("#id_name").style.setProperty('border', '1px #FF0000 solid', 'important');
    toast_error("Укажите название");
    return
  }
  //else if (!form.querySelector("#id_country").value) {
  //  form.querySelector("#id_country").style.setProperty('border', '1px #FF0000 solid', 'important');
  //  toast_error("Укажите страну");
  //  return
  //}

  form.querySelector("#edit_region").setAttribute("disabled", "true");
  form.querySelector("#edit_region").innerHTML = "Идет сохранение";

  form_data = new FormData(form);
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/edit_region/" + _this.getAttribute("data-pk") + "/", true );
    link.setRequestHeader('Content-Type', 'application/json');
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      location.reload()
    }};
    link.send(json);
});

on('body', 'click', '.remove_region', function() {
  delete_item("/delete_region/", this.getAttribute("data-pk"));
  this.parentElement.remove();
});


on('body', 'click', '#create_city', function() {
  let form = this.parentElement.parentElement;
  
  form.querySelector("#id_name").style.setProperty('border', 'inherit', 'important');
  //form.querySelector("#id_country").style.setProperty('border', 'inherit', 'important');

  if (!form.querySelector("#id_name").value) {
      form.querySelector("#id_name").style.setProperty('border', '1px #FF0000 solid', 'important');
      toast_error("Укажите название");
      return
  }
  //else if (!form.querySelector("#id_country").value) {
  //  form.querySelector("#id_country").style.setProperty('border', '1px #FF0000 solid', 'important');
  //  toast_error("Укажите страну");
  //  return
  //}

  form.querySelector("#create_city").setAttribute("disabled", "true");
  form.querySelector("#create_city").innerHTML = "Идет сохранение";

  form_data = new FormData(form);
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/create_city/", true );
    link.setRequestHeader('Content-Type', 'application/json');
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      location.reload()
    }};
    link.send(json);
});
on('body', 'click', '#edit_city', function() {
  _this = this;
  form = _this.parentElement.parentElement;
  
  form.querySelector("#id_name").style.setProperty('border', 'inherit', 'important');
  //form.querySelector("#id_country").style.setProperty('border', 'inherit', 'important');

  if (!form.querySelector("#id_name").value) {
      form.querySelector("#id_name").style.setProperty('border', '1px #FF0000 solid', 'important');
      toast_error("Укажите название");
      return
  }
  //else if (!form.querySelector("#id_country").value) {
  //  form.querySelector("#id_country").style.setProperty('border', '1px #FF0000 solid', 'important');
  //  toast_error("Укажите страну");
  //  return
  //}

  form.querySelector("#edit_city").setAttribute("disabled", "true");
  form.querySelector("#edit_city").innerHTML = "Идет сохранение";

  form_data = new FormData(form);
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/edit_city/" + _this.getAttribute("data-pk") + "/", true );
    link.setRequestHeader('Content-Type', 'application/json');
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      location.reload()
    }};
    link.send(json);
});

on('body', 'click', '.delete_city', function() {
  _this = this;
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/delete_city/" + this.getAttribute("data-pk") + "/", true );
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      _this.parentElement.remove();
    }};
    link.send( null );
});
on('body', 'click', '.delete_region', function() {
  _this = this;
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/delete_region/" + this.getAttribute("data-pk") + "/", true );
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      _this.parentElement.remove();
    }};
    link.send( null );
});
on('body', 'click', '.delete_module_type', function() {
  _this = this;
  form_data = new FormData();
  form_data.append("test", "ok");
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/delete_module_type/" + this.getAttribute("data-pk") + "/", true );
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      _this.parentElement.remove();
    }};
    link.send( form_data );
});
on('body', 'click', '.delete_event', function() {
  _this = this;
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
  form_data = new FormData();
  form_data.append("test", "ok");
    link.open( 'POST', "/delete_event/" + this.getAttribute("data-pk") + "/", true );
    link.onreadystatechange = function () { 
    if ( link.readyState == 4 && link.status == 200 ) {
      _this.parentElement.remove();
    }};
    link.send( form_data );
});


on('body', 'click', '#create_event', function() {
    _this = this;
    form = _this.parentElement.parentElement;
    response = form.querySelector(".api_response");

	form_data = new FormData();
  
    if (!form.querySelector("#id_title").value){
      form.querySelector("#id_title").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Название";
      response.classList.add("error");
      return 
    } 
    else if (!form.querySelector("#id_description").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите описание";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_price").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите цену";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_time_start").value){
      form.querySelector("#id_time_start").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите время начала события";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_time_end").value){
      form.querySelector("#id_time_start").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите время окончания события";
      response.classList.add("error");
      return
    }
    else {
      _this.disabled = true;
    }
  time_start = new Date(form.querySelector("#id_time_start").value);
  time_end = new Date(form.querySelector("#id_time_end").value);
	form_data.append("place_id", _this.getAttribute("place_id"));
  time_start = time_start.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  time_end = time_end.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	form_data.append("place_id", _this.getAttribute("place_id"));
  form_data.append("time_start", time_start);
  form_data.append("time_end", time_end);
  form_data.append("title", form.querySelector("#id_title").value);
  form_data.append("description", form.querySelector("#id_description").value);
  form_data.append("price", form.querySelector("#id_price").value*1);

  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object); 

    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
    link.open( 'POST', "/create_event/", true );
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {  
    if ( link.readyState == 4 && link.status == 200 ) {
        console.log("files.length", form.querySelector("#id_image").files.length);
        if (form.querySelector("#id_image").files.length > 0) {

          console.log("file exists");
          uuid = link.responseText;
          console.log("uuid", uuid);

          form_data = new FormData();
          form_data.append("image", form.querySelector("#id_image").files[0]);
          link2 = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
          link2.open('POST', "/create/upload_files/?types=event_avatar&id=" + uuid, true);
          link2.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          link2.onreadystatechange = function() {
            console.log("this.readyState", this.readyState);
            console.log("this.status", this.status);
            if (this.readyState == 4) {
                console.log("reload");
                location.reload();
            }
          }; 
          link2.send(form_data);
        }
        else {
          location.reload();
        }
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
});

on('body', 'click', '#create_module_type', function() {
    _this = this;
    form = _this.parentElement.parentElement;
    response = form.querySelector(".api_response");
  
    if (!form.querySelector("#id_title").value){
      form.querySelector("#id_title").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Название";
      response.classList.add("error");
      return 
    } 
    else if (!form.querySelector("#id_description").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите описание";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_price").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите цену";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_types").value){
      form.querySelector("#id_types").style.border = "1px #FF0000 solid";
      response.innerHTML = "Выберите тип";
      response.classList.add("error")
      return
    }
    else {
      _this.disabled = true;
    }
  
  form_data = new FormData(form);
	form_data.append("place_id", _this.getAttribute("place_id"));
  form_data.append("title", form.querySelector("#id_title").value);
  form_data.append("description", form.querySelector("#id_description").value);
  form_data.append("price", form.querySelector("#id_price").value*1);
  form_data.append("types", form.querySelector("#id_types").value);
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);

  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
  link.open( 'POST', "/create_module_type/", true );
  link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
        console.log("files.length", form.querySelector("#id_image").files.length);
        if (form.querySelector("#id_image").files.length > 0) {

          console.log("file exists");
          uuid = link.responseText; 
          console.log("uuid", uuid);

          form_data = new FormData();

          form_data.append("image", form.querySelector("#id_image").files[0]);
          link2 = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
          link2.open('POST', "/create/upload_files/?types=module_type_avatar&id=" + uuid, true);
          link2.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          link2.onreadystatechange = function() {
            console.log("this.readyState", this.readyState);
            console.log("this.status", this.status);
            if (this.readyState == 4) {
                console.log("reload");
                location.reload();
            }
          }; 
          link2.send(form_data);
        }
        else {
          location.reload();
        }
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
});


on('body', 'click', '#edit_event', function() {
    _this = this;
    form = _this.parentElement.parentElement;
    response = form.querySelector(".api_response");

	form_data = new FormData();

  
    if (!form.querySelector("#id_title").value){
      form.querySelector("#id_title").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Название";
      response.classList.add("error");
      return 
    } 
    else if (!form.querySelector("#id_description").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите описание";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_price").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите цену";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_time_start").value){
      form.querySelector("#id_time_start").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите время начала события";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_time_end").value){
      form.querySelector("#id_time_start").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите время окончания события";
      response.classList.add("error");
      return
    }
    else {
      _this.disabled = true;
    }
  time_start = new Date(form.querySelector("#id_time_start").value);
  time_end = new Date(form.querySelector("#id_time_end").value);
  time_start2 = time_start.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  time_end2 = time_end.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	form_data.append("place_id", _this.getAttribute("place_id"));
  form_data.append("time_start", time_start2);
  form_data.append("time_end", time_end2);
  form_data.append("title", form.querySelector("#id_title").value);
  form_data.append("description", form.querySelector("#id_description").value);
  form_data.append("price", form.querySelector("#id_price").value*1);

  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);

    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
    link.open( 'POST', "/edit_event/" + _this.getAttribute("object_id") + "/", true );
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
        console.log("files.length", form.querySelector("#id_image").files.length);
        if (form.querySelector("#id_image").files.length > 0) {

          console.log("file exists");
          uuid = link.responseText;
          console.log("uuid", uuid);

          form_data = new FormData();
          form_data.append("image", form.querySelector("#id_image").files[0]);
          link2 = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
          link2.open('POST', "/create/upload_files/?types=event_avatar&id=" + uuid, true);
          link2.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          link2.onreadystatechange = function() {
            console.log("this.readyState", this.readyState);
            console.log("this.status", this.status);
            if (this.readyState == 4) {
                console.log("reload");
                location.reload();
            }
          }; 
          link2.send(form_data);
        }
        else {
          location.reload();
        }
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
});


on('body', 'click', '#edit_module_type', function() {
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
    else if (!form.querySelector("#id_description").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите описание";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_price").value){
      form.querySelector("#id_description").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите цену";
      response.classList.add("error")
      return
    }
    else if (!form.querySelector("#id_types").value){
      form.querySelector("#id_types").style.border = "1px #FF0000 solid";
      response.innerHTML = "Выберите тип";
      response.classList.add("error")
      return
    }
    else {
      _this.disabled = true;
    }
    
	form_data.append("place_id", _this.getAttribute("place_id"));
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);

    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
    link.open( 'POST', "/edit_module_type/" + _this.getAttribute("object_id") + "/", true );
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
        console.log("files.length", form.querySelector("#id_image").files.length);
        if (form.querySelector("#id_image").files.length > 0) {

          console.log("file exists");
          uuid = link.responseText; 
          console.log("uuid", uuid);

          form_data = new FormData();
          form_data.append("image", form.querySelector("#id_image").files[0]);
          link2 = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
          link2.open('POST', "/create/upload_files/?types=module_type_avatar&id=" + uuid, true);
          link2.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          link2.onreadystatechange = function() { 
            console.log("this.readyState", this.readyState);
            console.log("this.status", this.status);
            if (this.readyState == 4) {
                console.log("reload");
                location.reload();
            }
          }; 
          link2.send(form_data);
        }
        else {
          location.reload();
        }
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
});



on('body', 'click', '#create_suggest_item', function() {
  let form = this.parentElement.parentElement;
  
  form.querySelector("#id_title").style.setProperty('border', 'inherit', 'important');
  form.querySelector("#id_inn").style.setProperty('border', 'inherit', 'important');
  response = form.querySelector(".api_response");
  if (!form.querySelector("#id_title").value) {
      form.querySelector("#id_title").style.setProperty('border', '1px #FF0000 solid', 'important');
      response.innerHTML = "Укажите название компании";
      response.classList.add("error");
      return
  }
  else if (!form.querySelector("#id_inn").value) {
      form.querySelector("#id_inn").style.setProperty('border', '1px #FF0000 solid', 'important');
      response.innerHTML = "Укажите ИНН компании";
      response.classList.add("error");
      return
  }

  form.querySelector("#create_suggest_item").setAttribute("disabled", "true");
  form.querySelector("#create_suggest_item").innerHTML = "Идет сохранение";

  form_data = new FormData(form);
  form_data.append("user_id" , ID)
  object = {};
  form_data.forEach((value, key) => object[key] = value);
  json = JSON.stringify(object);
  
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/suggest_partner/", true );
    link.setRequestHeader('Content-Type', 'application/json');
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
      window.location.href = "/profile/";
    }};
    link.send(json);
});


on('body', 'click', '.create_partner', function() {
  _this = this;
  console.log("start create partner");
  link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
  form_data = new FormData();
  form_data.append("test", "ok");
    link.open( 'POST', "/create_partner/" + _this.parentElement.getAttribute("data-id") + "/", true );
    link.onreadystatechange = function () { 
    if ( link.readyState == 4 && link.status == 200 ) {
      console.log("end create partner");
      _this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
    }};
    link.send( form_data );
});



on('body', 'click', '#logg', function() {
    _this = this;
    form = _this.parentElement;
    response = form.querySelector(".api_response");
  
    if (!form.querySelector("#id_email").value){
      form.querySelector("#id_email").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Вашу почту";
      response.classList.add("error");
      return 
    }
    else if (!form.querySelector("#id_password").value){
      form.querySelector("#id_password").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Ваш пароль";
      response.classList.add("error")
      return
    }
    else {
      _this.disabled = true;
    }
    form_data = new FormData(form);
    object = {};
    form_data.forEach((value, key) => object[key] = value);
    json = JSON.stringify(object);
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    
    link.open( 'POST', "/login/", true );
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
        window.location.href = "/profile/";
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.classList.add("error");
    }};
    link.send(json);
});

on('body', 'click', '#signup', function() {
    _this = this;
    form = _this.parentElement;
    response = form.querySelector(".api_response");
    if (!form.querySelector("#id_first_name").value){
      form.querySelector("#id_first_name").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Ваше имя";
      response.classList.add("error");
      return
    } else if (!form.querySelector("#id_last_name").value){
      form.querySelector("#id_last_name").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Вашу фамилию";
      response.classList.add("error");
      return
    } else if (!form.querySelector("#id_email").value){
      form.querySelector("#id_email").style.border = "1px #FF0000 solid";
      response.innerHTML = "Введите Вашу почту";
      response.classList.add("error");
      return
    } else if (!form.querySelector("#id_password").value){
      form.querySelector("#id_password").style.border = "1px #FF0000 solid";
      response.innerHTML = "Password is required!";
      response.classList.add("error");
      return
    }
    else if (form.querySelector("#id_password").value != form.querySelector("#id_password2").value){
      form.querySelector("#id_password").style.border = "1px #FF0000 solid";
      form.querySelector("#id_password2").style.border = "1px #FF0000 solid";
      response.innerHTML = "Пароли не совпадают!";
      response.classList.add("error");
      return
    }
    else {
      form.querySelector("#id_password").style.border = "unset";
      form.querySelector("#id_password2").style.border = "unset";
      form.querySelector("#id_first_name").style.border = "unset";
      form.querySelector("#id_last_name").style.border = "unset";
      form.querySelector("#id_email").style.border = "unset";
      this.disabled = true;
      response.classList.remove("error");
    }

    first_name = form.querySelector("#id_first_name").value.trim();
    last_name = form.querySelector("#id_last_name").value.trim();

    form.querySelector("#id_first_name").value = first_name.replace(/[^a-zA-Z ]/g, "");
    form.querySelector("#id_last_name").value = last_name.replace(/[^a-zA-Z ]/g, "");

    form.querySelector("#signup").setAttribute("disabled", "true");
  
    form_data = new FormData(form);
    object = {};
    form_data.forEach((value, key) => object[key] = value);
    json = JSON.stringify(object);
    link = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );
    link.open( 'POST', "/signup/", true );
    link.setRequestHeader('Content-Type', 'application/json');
  
    link.onreadystatechange = function () {
    if ( link.readyState == 4 && link.status == 200 ) {
        window.location.href = "/profile/";
    }
    else {
        _this.disabled = false;
        response.style.display = "block";
        response.innerHTML = "Error";
        response.classList.add("error");
    }};
    link.send(json);
});
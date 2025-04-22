use actix_web::{
    HttpRequest,
    HttpResponse,
    Responder,
    web,
    web::Json,
    error::InternalError,
    http::StatusCode,
};
use sailfish::TemplateOnce;
use serde::{Serialize, Deserialize};
use actix_session::Session;
use crate::utils::{
    get_current_user,
    is_signed_in,
    Place, UserJson,
    Places, RespOrderJson2s, 
    PlaceTypes,
    Times, UserJsons, URL,
};
use crate::views::AuthResp2;


pub fn place_urls(config: &mut web::ServiceConfig) {
    config.route("/create_place/", web::get().to(create_place_page));
    config.route("/create_region/", web::get().to(create_region_page));
    config.route("/create_city/", web::get().to(create_city_page));

    config.route("/place/{id}/edit/", web::get().to(edit_place_page));
    config.route("/region/{id}/edit/", web::get().to(edit_region_page));
    config.route("/city/{id}/edit/", web::get().to(edit_city_page));

    config.route("/place/{id}/managers/", web::get().to(managers_page));
    config.route("/place/{id}/", web::get().to(place_page)); 
    config.route("/place/{id}/create_map/", web::get().to(place_create_map_page));
    config.route("/place/{id}/create_module_type/", web::get().to(create_module_type_page));
    config.route("/place/{id}/create_event/", web::get().to(create_event_page));
    config.route("/place/{place_id}/edit_module_type/{obj_id}/", web::get().to(edit_module_type_page));
    config.route("/place/{place_id}/edit_event/{obj_id}/", web::get().to(edit_event_page));

    config.route("/create_place/", web::post().to(create_place));
    config.route("/create_region/", web::post().to(create_region));
    config.route("/create_city/", web::post().to(create_city));

    config.route("/place/{id}/edit/", web::post().to(edit_place));
    config.route("/region/{id}/edit/", web::post().to(edit_region));
    config.route("/city/{id}/edit/", web::post().to(edit_city));

    config.route("/place/create_modules/", web::post().to(create_modules));
    config.route("/create_order/", web::post().to(create_order));
    config.route("/delete_order/{id}/", web::post().to(delete_order));

    config.route("/delete_region/{id}/", web::post().to(delete_region));
    config.route("/delete_city/{id}/", web::post().to(delete_city));
    config.route("/delete_module_type/{id}/", web::post().to(delete_module_type));
    config.route("/delete_event/{id}/", web::post().to(delete_event));
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ModuleType {
    pub id:          String,
    pub place_id:    String,
    pub title:       String,
    pub description: String,
    pub types:       String,
    pub image:       Option<String>,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct Event {
    pub id:          String,
    pub user_id:     String,
    pub place_id:    String,
    pub title:       String,
    pub description: String,
    pub types:       i16, 
    pub created:     chrono::NaiveDateTime,
    pub price:       i32,
    pub time_start:  String,
    pub time_end:    String,
    pub image:       Option<String>,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct PlaceJson {
    pub title:   String, 
    pub type_id: i16,
    pub user_id: String,
    pub city_id: i32,
    pub image:   Option<String>,
    pub cord:    Option<String>,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct EditPlaceJson {
    pub title:   String,
    pub type_id: i16,
    pub user_id: String,
    pub image:   Option<String>,
    pub cord:    Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ModuleJson { 
    pub id:         String,
    pub title:      String,
    pub label:      String,
    pub type_id:    String,
    pub price:      i32,
    pub z_index:    i32,
    pub width:      i16,
    pub height:     i16,
    pub left:       f64,
    pub top:        f64,
    pub angle:      f64, 
    pub font_color: String,
    pub font_size:  String,
    pub back_color: String,
    pub image:      Option<String>,
} 

#[derive(Deserialize, Debug, Serialize)]
pub struct CreateModuleJson {
    place_id: String,
    modules:  Vec<ModuleJson>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct PlaceDataJson {
    pub modules: Vec<crate::utils::Module>,
    pub orders:  Vec<crate::utils::RespOrderJson>,
    pub place:   Place,  
}

pub async fn place_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    let object:  Place;
    let modules: Vec<crate::utils::Module>;
    let orders:  Vec<crate::utils::RespOrderJson>;
    let module_types: Vec<crate::views::ModuleType>;
    
    let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/".to_string();
    let resp = crate::utils::request_get::<PlaceDataJson>(url, "".to_string(), "application/json".to_string()).await;
    if resp.is_ok() { 
        let data = resp.expect("E.");
        object = data.place;
        modules = data.modules;
        orders = data.orders;
    }
    else { 
        object = Place{
            id:      "".to_string(),
            title:   "".to_string(), 
            types:   0,
            created: chrono::Local::now().naive_utc(),
            user_id: "".to_string(),
            city_id: 0,
            type_id: 0,
            image:   None,
            cord:    None,
        };
        modules = Vec::new();
        orders = Vec::new();
    }

    let module_types: Vec<crate::views::ModuleType>;
    let url2 = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/module_types/".to_string();
    let resp2 = crate::utils::request_get::<Vec<crate::views::ModuleType>>(url2, "".to_string(), "application/json".to_string()).await;
    if resp2.is_ok() { 
        module_types = resp2.expect("E.");
    }
    else { 
        module_types = Vec::new();
    }
    
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        
        #[derive(TemplateOnce)]
        #[template(path = "places/place.stpl")]
        struct Template {
            request_user: AuthResp2,
            object:       Place,
            modules:      Vec<crate::utils::Module>,
            orders:       Vec<crate::utils::RespOrderJson>,
            module_types: Vec<crate::views::ModuleType>,
        }
        let body = Template {
            request_user: _request_user,
            object:       object,
            modules:      modules,
            orders:       orders,
            module_types: module_types,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        #[derive(TemplateOnce)]
        #[template(path = "places/anon_place.stpl")]
        struct Template {
            object:       Place,
            modules:      Vec<crate::utils::Module>,
            orders:       Vec<crate::utils::RespOrderJson>,
            module_types: Vec<crate::views::ModuleType>,
        }
        let body = Template {
            object:       object,
            modules:      modules,
            orders:       orders,
            module_types: module_types,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
}

pub async fn place_create_map_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    let object:  Place;
    let modules: Vec<crate::utils::Module>;
    let orders:  Vec<crate::utils::RespOrderJson>;
    let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/".to_string();
    let resp = crate::utils::request_get::<PlaceDataJson>(url, "".to_string(), "application/json".to_string()).await;
    if resp.is_ok() {  
        let data = resp.expect("E.");
        object = data.place;
        modules = data.modules;
        orders = data.orders;
    }
    else { 
        object = Place{
            id:      "".to_string(),
            title:   "".to_string(), 
            types:   0,
            created: chrono::Local::now().naive_utc(),
            user_id: "".to_string(),
            city_id: 0,
            type_id: 0,
            image:   None,
            cord:    None,
        };
        modules = Vec::new();
        orders = Vec::new();
    }

    let module_types: Vec<crate::views::ModuleType>;
    let url2 = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/module_types/".to_string();
    let resp2 = crate::utils::request_get::<Vec<crate::views::ModuleType>>(url2, "".to_string(), "application/json".to_string()).await;
    if resp2.is_ok() { 
        module_types = resp2.expect("E.");
    }
    else { 
        module_types = Vec::new();
    }

    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        
        #[derive(TemplateOnce)]
        #[template(path = "places/place_create_map.stpl")]
        struct Template {
            request_user: AuthResp2,
            object:       Place,
            modules:      Vec<crate::utils::Module>,
            orders:       Vec<crate::utils::RespOrderJson>,
            module_types: Vec<crate::views::ModuleType>,
        }
        let body = Template {
            request_user: _request_user,
            object:       object,
            modules:      modules,
            orders:       orders,
            module_types: module_types,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("403"))
    }
}

pub async fn managers_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let object: Place;
        let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/".to_string();
        let resp = crate::utils::request_get::<Place>(url, _request_user.uuid.clone(), "application/json".to_string()).await;
        if resp.is_ok() {  
            let data = resp.expect("E.");
            object = data;
        }
        else {
            object = Place {
                id:      "".to_string(),
                title:   "".to_string(), 
                types:   0,
                created: chrono::Local::now().naive_utc(),
                user_id: "".to_string(),
                city_id: 0,
                type_id: 0,
                image:   None,
                cord:    None,
            };
        }

        let object_list: Vec<UserJson>;
        let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/managers/".to_string();
        let resp = crate::utils::request_get::<Vec<UserJson>>(url, _request_user.uuid.clone(), "application/json".to_string()).await;
        if resp.is_ok() { 
            let data = resp.expect("E.");
            object_list = data;
        }
        else { 
            object_list = Vec::new();
        }
        let mut list: Vec<UserJson> = Vec::new();
        for object in object_list.clone().into_iter() {
            list.push(object);
        }
        
        #[derive(TemplateOnce)]
        #[template(path = "places/managers.stpl")]
        struct Template {
            request_user: AuthResp2,
            object:       Place,
            object_list:  Vec<UserJson>,
        }
        let body = Template {
            request_user: _request_user,
            object:       object,
            object_list:  object_list,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn create_place_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");

        let cities: Vec<City>;
        let url = URL.to_string() + &"/cities/".to_string();
        let resp = crate::utils::request_get::<Vec<City>>(url, "".to_string(), "application/json".to_string()).await;
        if resp.is_ok() { 
            cities = resp.expect("E.");
        }
        else { 
            cities = Vec::new();
        }
        
        #[derive(TemplateOnce)]
        #[template(path = "places/create.stpl")]
        struct Template {
            request_user: AuthResp2,
            cities:       Vec<City>,
        }
        let body = Template {
            request_user: _request_user,
            cities:       cities,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Region { 
    pub id:          i32,
    pub name:        String,
    pub geo_id:      Option<i32>,
    pub country_id:  i32,
    pub timezone_id: Option<i32>,
    pub cord:        Option<String>,
}
pub async fn create_region_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        if _request_user.is_superuser() {
            #[derive(TemplateOnce)]
            #[template(path = "admin/create_region.stpl")]
            struct Template {
                request_user: AuthResp2,
            }
            let body = Template {
                request_user: _request_user,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            return Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body));
        }
        else {
            return crate::views::auth_page(session.clone()).await;
        }
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}
pub async fn create_city_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        if _request_user.is_superuser() {
            let regions:  Vec<Region>;
            let cities:  Vec<City>;

            let url = URL.to_string() + &"/regions/".to_string();
            let resp = crate::utils::request_get::<Vec<Region>>(url, "".to_string(), "application/json".to_string()).await;
            if resp.is_ok() { 
                regions = resp.expect("E.");
            }
            else { 
                regions = Vec::new();
            }

            let url2 = URL.to_string() + &"/cities/".to_string();
            let resp2 = crate::utils::request_get::<Vec<City>>(url2, "".to_string(), "application/json".to_string()).await;
            if resp2.is_ok() { 
                cities = resp2.expect("E.");
            }
            else { 
                cities = Vec::new();
            }

            #[derive(TemplateOnce)]
            #[template(path = "admin/create_city.stpl")]
            struct Template {
                request_user: AuthResp2,
                regions:      Vec<Region>,
                cities:       Vec<City>,
            }
            let body = Template {
                request_user: _request_user,
                regions:      regions,
                cities:       cities,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            return Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body));
        }
        else {
            return crate::views::auth_page(session.clone()).await;
        }
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn create_event_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        //if _request_user.is_superuser() {
            let events: Vec<Event>;

            let url = URL.to_string() + &"/place/".to_string() + &id.to_string() + &"/events/".to_string();
            let resp = crate::utils::request_get::<Vec<Event>>(url, "".to_string(), "application/json".to_string()).await;
            if resp.is_ok() { 
                events = resp.expect("E.");
            } 
            else { 
                events = Vec::new();
            }
            #[derive(TemplateOnce)]
            #[template(path = "admin/create_module_type.stpl")]
            struct Template {
                request_user: AuthResp2,
                events:       Vec<Event>,
            }
            let body = Template {
                request_user: _request_user,
                events:       events,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            return Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body));
        //}
        //else {
        //    return crate::views::auth_page(session.clone()).await;
        //}
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}
pub async fn create_module_type_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        //if _request_user.is_superuser() {
            let events: Vec<ModuleType>;  

            let url = URL.to_string() + &"/place/".to_string() + &id.to_string() + &"/module_types/".to_string();
            let resp = crate::utils::request_get::<Vec<ModuleType>>(url, "".to_string(), "application/json".to_string()).await;
            if resp.is_ok() { 
                events = resp.expect("E.");
            } 
            else { 
                events = Vec::new();
            }
            #[derive(TemplateOnce)]
            #[template(path = "admin/create_module_type.stpl")]
            struct Template {
                request_user: AuthResp2,
                events:       Vec<ModuleType>,
            }
            let body = Template {
                request_user: _request_user,
                events:       events,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            return Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body));
        //}
        //else {
        //    return crate::views::auth_page(session.clone()).await;
        //}
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn edit_module_type_page(session: Session, param: web::Path<(String,String)>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) { 
        let _request_user = get_current_user(&session).expect("E.");
        let place_id: String = param.0.clone();
        let obj_id: String = param.1.clone();

        if _request_user.is_superuser() {
            let module_types: Vec<ModuleType>;
            let url = URL.to_string() + &"/place/".to_string() + &place_id.to_string() + &"/module_types/".to_string();
            let resp = crate::utils::request_get::<Vec<ModuleType>>(url, "".to_string(), "application/json".to_string()).await;
            if resp.is_ok() { 
                module_types = resp.expect("E.");
            } 
            else { 
                module_types = Vec::new();
            }

            let object: ModuleType;
            let url2 = URL.to_string() + &"/module_type/".to_string() + &obj_id.to_string() + &"/".to_string();
            let resp2 = crate::utils::request_get::<ModuleType>(url2, "".to_string(), "application/json".to_string()).await;
            if resp2.is_ok() { 
                object = resp2.expect("E.");
            } 
            else { 
                object = ModuleType {
                    id:          "".to_string(),
                    place_id:    "".to_string(),
                    title:       "".to_string(),
                    description: "".to_string(),
                    types:       "".to_string(),
                    image:       None,
                };
            }

            #[derive(TemplateOnce)]
            #[template(path = "admin/edit_module_type.stpl")]
            struct Template {
                request_user: AuthResp2,
                module_types: Vec<ModuleType>,
                object:       ModuleType,
            }
            let body = Template {
                request_user: _request_user,
                module_types: module_types,
                object:       object,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            return Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body));
        }
        else {
            return crate::views::auth_page(session.clone()).await;
        }
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn edit_event_page(session: Session, param: web::Path<(String,String)>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) { 
        let _request_user = get_current_user(&session).expect("E.");
        let place_id: String = param.0.clone();
        let obj_id: String = param.1.clone();

        if _request_user.is_superuser() {
            let events: Vec<Event>;
            let url = URL.to_string() + &"/place/".to_string() + &place_id.to_string() + &"/events/".to_string();
            let resp = crate::utils::request_get::<Vec<Event>>(url, "".to_string(), "application/json".to_string()).await;
            if resp.is_ok() { 
                events = resp.expect("E.");
            } 
            else { 
                events = Vec::new();
            }

            let object: Event;
            let url2 = URL.to_string() + &"/event/".to_string() + &obj_id.to_string() + &"/".to_string();
            let resp2 = crate::utils::request_get::<Event>(url2, "".to_string(), "application/json".to_string()).await;
            if resp2.is_ok() {  
                object = resp2.expect("E.");
            } 
            else { 
                object = Event {
                    id:          "".to_string(),
                    user_id:     "".to_string(),
                    place_id:    "".to_string(),
                    title:       "".to_string(),
                    description: "".to_string(),
                    types:       0, 
                    created:     chrono::Local::now().naive_utc() + chrono::Duration::hours(3),
                    price:       0,
                    time_start:  "".to_string(),
                    time_end:    "".to_string(),
                    image:       None,
                };
            } 

            #[derive(TemplateOnce)]
            #[template(path = "admin/edit_event.stpl")]
            struct Template {
                request_user: AuthResp2,
                events:       Vec<Event>,
                object:       Event,
            }
            let body = Template {
                request_user: _request_user,
                events:       events,
                object:       object,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            return Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body));
        }
        else {
            return crate::views::auth_page(session.clone()).await;
        }
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn edit_place_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let object:  Place;
        let url = URL.to_string() + &"/place/".to_string() + &id.to_string() + &"/".to_string();
        let resp = crate::utils::request_get::<PlaceDataJson>(url, "".to_string(), "application/json".to_string()).await;
        if resp.is_ok() { 
            let data = resp.expect("E.");
            object = data.place;
        }
        else { 
            object = Place {
                id:      "".to_string(),
                title:   "".to_string(), 
                types:   0,
                created: chrono::Local::now().naive_utc(),
                user_id: "".to_string(),
                city_id: 0,
                type_id: 0,
                image:   None,
                cord:    None,
            };
        }
        
        #[derive(TemplateOnce)]
        #[template(path = "places/edit.stpl")]
        struct Template {
            request_user: AuthResp2,
            object:       Place,
        }
        let body = Template {
            request_user: _request_user,
            object:       object,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn edit_region_page(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let object: Region;
        let url = URL.to_string() + &"/region/".to_string() + &id.to_string() + &"/".to_string();
        let resp = crate::utils::request_get::<Region>(url, "".to_string(), "application/json".to_string()).await;
        if resp.is_ok() { 
            object = resp.expect("E.");
        }
        else { 
            object = Region {
                id:          0,
                name:        "".to_string(), 
                geo_id:      None,
                country_id:  0,
                timezone_id: None,
                cord:        None,
            };
        }
        
        #[derive(TemplateOnce)]
        #[template(path = "admin/edit_region.stpl")]
        struct Template {
            request_user: AuthResp2,
            object:       Region,
        }
        let body = Template {
            request_user: _request_user,
            object:       object,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct City {
    pub id:         i32,
    pub name:       String,
    pub geo_id:     Option<i32>,
    pub region_id:  Option<i32>,
    pub country_id: i32,
    pub cord:       Option<String>,
}
pub async fn edit_city_page(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let object: City;
        let url = URL.to_string() + &"/city/".to_string() + &id.to_string() + &"/".to_string();
        let resp = crate::utils::request_get::<City>(url, "".to_string(), "application/json".to_string()).await;
        if resp.is_ok() { 
            object = resp.expect("E.");
        }
        else { 
            object = City {
                id:          0,
                name:        "".to_string(), 
                geo_id:      None,
                region_id:   None,
                country_id:  0,
                cord:        None,
            };
        }

        let regions:  Vec<Region>;
        let url2 = URL.to_string() + &"/regions/".to_string();
        let resp2 = crate::utils::request_get::<Vec<Region>>(url2, "".to_string(), "application/json".to_string()).await;
        if resp2.is_ok() { 
            regions = resp2.expect("E.");
        }
        else { 
            regions = Vec::new();
        }

        let cities:  Vec<City>;
        let url3 = URL.to_string() + &"/cities/".to_string();
        let resp3 = crate::utils::request_get::<Vec<City>>(url3, "".to_string(), "application/json".to_string()).await;
        if resp3.is_ok() { 
            cities = resp3.expect("E.");
        }
        else { 
            cities = Vec::new();
        }
        
        #[derive(TemplateOnce)]
        #[template(path = "admin/edit_city.stpl")]
        struct Template {
            request_user: AuthResp2,
            object:       City,
            regions:      Vec<Region>,
            cities:       Vec<City>,
        }
        let body = Template {
            request_user: _request_user,
            object:       object,
            regions:      regions,
            cities:       cities,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}

pub async fn create_place(session: Session, data: Json<PlaceJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let res = crate::utils::request_post::<PlaceJson, ()> (
            URL.to_owned() + &"/create_place/".to_string(),
            &data,  
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn edit_place(session: Session, data: Json<EditPlaceJson>, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/edit_place/".to_string() + &id.clone() + &"/".to_string();
        let res = crate::utils::request_post::<EditPlaceJson, ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct CreateRegionJson { 
    pub name: String,
    pub cord: Option<String>,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct CreateCityJson {
    pub region_id: Option<i32>,
    pub name:      String,
    pub cord:      Option<String>,
}
pub async fn create_region(session: Session, data: Json<CreateRegionJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let res = crate::utils::request_post::<CreateRegionJson, ()> (
            URL.to_owned() + &"/create_region/".to_string(),
            &data,  
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn edit_region(session: Session, data: Json<CreateRegionJson>, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/edit_region/".to_string() + &id.to_string() + &"/".to_string();
        let res = crate::utils::request_post::<CreateRegionJson, ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}

pub async fn create_city(session: Session, data: Json<CreateCityJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let res = crate::utils::request_post::<CreateCityJson, ()> (
            URL.to_owned() + &"/create_city/".to_string(),
            &data,  
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn edit_city(session: Session, data: Json<CreateCityJson>, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/edit_city/".to_string() + &id.to_string() + &"/".to_string();
        let res = crate::utils::request_post::<CreateCityJson, ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}

pub async fn delete_region(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/delete_region/".to_string() + &id.to_string() + &"/".to_string();
        let data = {};
        let res = crate::utils::request_post::<(), ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn delete_city(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let data = {};
        let url = URL.to_string() + &"/delete_city/".to_string() + &id.to_string() + &"/".to_string();
        let res = crate::utils::request_post::<(), ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn delete_module_type(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let data = {};
        let url = URL.to_string() + &"/delete_module_type/".to_string() + &id.to_string() + &"/".to_string();
        let res = crate::utils::request_post::<(), ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn delete_place(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let data = {};
        let url = URL.to_string() + &"/delete_place/".to_string() + &id.to_string() + &"/".to_string();
        let res = crate::utils::request_post::<(), ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
pub async fn delete_place(session: Session, id: web::Path<i32>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let data = {};
        let url = URL.to_string() + &"/delete_place/".to_string() + &id.to_string() + &"/".to_string();
        let res = crate::utils::request_post::<(), ()> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}

pub async fn create_modules(session: Session, data: Json<CreateModuleJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) { 
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/create_modules/".to_string();
        let res = crate::utils::request_post::<CreateModuleJson, ()> (
            url, 
            &data,  
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
} 

#[derive(Serialize, Deserialize, Debug)]
pub struct OrderJson { 
    pub title:      String,
    pub place_id:   String,
    pub object_id:  String,
    pub event_id:   Option<String>,
    pub price:      i32,
    pub time_start: String,
    pub time_end:   String, 
}  
pub async fn create_order(session: Session, data: Json<Vec<OrderJson>>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) { 
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/create_order/".to_string();
        let res = crate::utils::request_post::<Vec<OrderJson>, ()> (
            url, 
            &data,  
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OrderIdsJson {  
    pub ids: Vec<String>,
}
pub async fn delete_order(session: Session, data: Json<OrderIdsJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) { 
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/delete_order/".to_string();
        let res = crate::utils::request_post::<OrderIdsJson, ()> (
            url, 
            &data,  
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
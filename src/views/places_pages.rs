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
    ModuleTypes, PlaceTypes,
    Times, UserJsons, URL,
};
use crate::views::AuthResp2;


pub fn place_urls(config: &mut web::ServiceConfig) {
    config.route("/create_place/", web::get().to(create_place_page));
    config.route("/place/{id}/edit/", web::get().to(edit_place_page));
    config.route("/place/{id}/managers/", web::get().to(managers_page));
    config.route("/place/{id}/", web::get().to(place_page));

    config.route("/create_place/", web::post().to(create_place));
    config.route("/place/{id}/edit/", web::post().to(edit_place));
}

#[derive(Deserialize, Serialize, Debug)]
pub struct PlaceJson {
    pub title:   String, 
    pub type_id: String, 
    pub image:   Option<String>,
    pub cord:    Option<String>,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct EditPlaceJson {
    pub title:   String,
    pub type_id: String,
    pub image:   Option<String>,
    pub cord:    Option<String>,
}

pub async fn place_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    let object: Place;
    let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/".to_string();
    let resp = crate::utils::request_get::<Place>(url, "".to_string()).await;
    if resp.is_ok() { 
        let data = resp.expect("E.");
        object = data;
    }
    else {
        object = Place{
            id:      "".to_string(),
            title:   "".to_string(), 
            types:   0,
            created: chrono::Local::now().naive_utc(),
            user_id: "".to_string(),
            type_id: "".to_string(),
            image:   None,
            cord:    None,
        };
    }
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        
        #[derive(TemplateOnce)]
        #[template(path = "places/place.stpl")]
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
        #[derive(TemplateOnce)]
        #[template(path = "places/anon_place.stpl")]
        struct Template {
            object: Place,
        }
        let body = Template {
            object: object,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
}
pub async fn managers_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let object: Place;
        let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/".to_string();
        let resp = crate::utils::request_get::<Place>(url, _request_user.uuid.clone()).await;
        if resp.is_ok() {  
            let data = resp.expect("E.");
            object = data;
        }
        else {
            object = Place{
                id:      "".to_string(),
                title:   "".to_string(), 
                types:   0,
                created: chrono::Local::now().naive_utc(),
                user_id: "".to_string(),
                type_id: "".to_string(),
                image:   None,
                cord:    None,
            };
        }

        let object_list: Vec<UserJson>;
        let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/managers/".to_string();
        let resp = crate::utils::request_get::<Vec<UserJson>>(url, _request_user.uuid.clone()).await;
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
        #[template(path = "places/place.stpl")]
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
        
        #[derive(TemplateOnce)]
        #[template(path = "places/create.stpl")]
        struct Template {
            request_user: AuthResp2,
        }
        let body = Template {
            request_user: _request_user,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session.clone()).await
    }
}
pub async fn edit_place_page(session: Session, id: web::Path<String>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let object: Place;
        let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/".to_string();
        let resp = crate::utils::request_get::<Place>(url, _request_user.uuid.clone()).await;
        if resp.is_ok() { 
            let data = resp.expect("E.");
            object = data;
        }
        else {
            object = Place{
            id:      "".to_string(),
            title:   "".to_string(), 
            types:   0,
            created: chrono::Local::now().naive_utc(),
            user_id: "".to_string(),
            type_id: "".to_string(),
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

pub async fn create_place(session: Session, data: Json<PlaceJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let res = crate::utils::request_post::<PlaceJson, ()> (
            URL.to_owned() + &"/places/create/".to_string(),
            &data, 
            _request_user.uuid
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
        let url = URL.to_string() + &"/place/".to_string() + &id.clone() + &"/edit/".to_string();
        let res = crate::utils::request_post::<EditPlaceJson, ()> (
            url,
            &data, 
            _request_user.uuid
        ).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
use actix_web::{
    HttpRequest,
    HttpResponse,
    Responder,
    web,
    error::InternalError,
    http::StatusCode,
};
use sailfish::TemplateOnce;
use serde::{Serialize, Deserialize};
use actix_session::Session;
use crate::utils::{
    get_current_user,
    is_signed_in,
    RespOrderJsons, Times, URL,
};
use crate::views::AuthResp2;


pub fn user_urls(config: &mut web::ServiceConfig) {
    config.route("/profile/", web::get().to(profile_page));
    config.route("/change_avatar/", web::post().to(change_avatar));
}


pub async fn profile_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");

        #[derive(TemplateOnce)]
        #[template(path = "user/index.stpl")]
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
        crate::views::auth_page(session).await
    }
}

use reqwest::Client;
use std::fs::File;

pub struct FileR {
    pub image:   File, 
}

pub async fn change_avatar(session: Session, data: FileR) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) { 
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/change_avatar/".to_string();

        let client = Client::new();
        let res = client.post(url)
            .body(data)
            .send()
            .await?;

        //let res = crate::utils::request_post::<CreateModuleJson, ()> (
        //    url, 
        //    &data,  
        //    _request_user.uuid,
        //    "application/json".to_string()
        //).await;

        return match res {
            Ok(user) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok")),
            Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
        }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
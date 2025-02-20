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
};
use crate::views::AuthResp2;


pub fn user_urls(config: &mut web::ServiceConfig) {
    config.route("/profile/", web::get().to(profile_page));
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
        #[derive(TemplateOnce)]
        #[template(path = "user/anon_index.stpl")]
        struct Template {
            //types: String,
        }
        let body = Template {
            //types: "anon".to_string(),
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
}
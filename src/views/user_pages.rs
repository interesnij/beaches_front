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
}


#[derive(Deserialize, Debug)]
pub struct ProfileJson {
    pub orders: Vec<crate::utils::RespOrderJson2>,
    pub places: Vec<crate::utils::PlaceListJson>,
} 

pub async fn profile_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let orders: Vec<crate::utils::OrderListJson>;
        let places:  Vec<crate::utils::PlaceListJson>;
        let url = URL.to_string() + &"/profile/".to_string();
        let resp = crate::utils::request_get::<ProfileJson>(url, _request_user.uuid.clone(), "application/json".to_string()).await;
        if resp.is_ok() { 
            let data = resp.expect("E.");
            orders = data.orders;
            places = data.places;
        }
        else {
            orders = Vec::new();
            places = Vec::new();
        }

        #[derive(TemplateOnce)]
        #[template(path = "user/index.stpl")]
        struct Template {
            request_user: AuthResp2,
            orders:       Vec<crate::utils::OrderListJson>,
            places:       Vec<crate::utils::PlaceListJson>,
        }
        let body = Template {
            request_user: _request_user,
            orders:       orders,
            places:       places,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        crate::views::auth_page(session).await
    }
}

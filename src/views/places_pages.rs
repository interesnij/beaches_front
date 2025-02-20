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


pub fn place_urls(config: &mut web::ServiceConfig) {
    config.route("/places/", web::get().to(places_page));
}
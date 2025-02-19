use actix_web::web;
use crate::views::{
    pages_urls,
    user_urls,
    auth_urls,
};


pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg
    .configure(pages_urls)
    .configure(user_urls)
    .configure(auth_urls)
    ;
}

mod auth;
mod reqwest;

pub use self::{
    auth::*,
    reqwest::*,
};
use actix_web::{
    HttpRequest,
    HttpResponse,
    web,
    error::InternalError,
    http::StatusCode,
    dev::ConnectionInfo,
};
use serde::{Deserialize, Serialize};

pub const URL: &str = "https://back.my-demo.ru";

#[derive(Deserialize, Serialize)]
pub struct NewUserForm {
    pub id:         String,
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
    pub password:   String,
}

pub fn get_page(req: &HttpRequest) -> i32 {
    #[derive(Debug, Deserialize)]
    struct Params {
        pub page: Option<i32>,
    }
    let params_some = web::Query::<Params>::from_query(&req.query_string());
    let page: i32;
    if params_some.is_ok() {
        let params = params_some.unwrap();
        if params.page.is_some() {
            page = params.page.unwrap();
        }
        else {
            page = 1;
        }
    }
    else {
        page = 1;
    }
    page
}

pub fn get_id(req: &HttpRequest) -> String {
    #[derive(Debug, Deserialize)]
    struct Params {
        pub id: Option<String>,
    }
    let params_some = web::Query::<Params>::from_query(&req.query_string());
    let id: String;
    if params_some.is_ok() {
        let params = params_some.unwrap();
        if params.id.is_some() {
            id = params.id.as_deref().unwrap().to_string();
        }
        else {
            id = "".to_string();
        }
    }
    else {
        id = "".to_string();
    }
    id
}
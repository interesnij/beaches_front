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


// временная метка
#[derive(Debug, Deserialize, Serialize)]
pub struct Time {
    pub id:   String,
    pub time: chrono::NaiveDateTime,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct Times {
    pub data: Vec<Time>,
}

// для регистрации
#[derive(Debug, Deserialize, Serialize)]
pub struct NewUserForm {
    pub id:         String,
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
    pub password:   String,
}

// объекты
#[derive(Debug, Deserialize, Serialize)]
pub struct Place {
    pub id:      String,
    pub title:   String, 
    pub types:   i16,
    pub created: chrono::NaiveDateTime,
    pub user_id: String,
    pub type_id: String,
    pub image:   Option<String>,
    pub cord:    Option<String>,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct Places {
    pub data: Vec<Place>,
}

// типы объектов (пляж, ресторан)
#[derive(Debug, Deserialize, Serialize)]
pub struct PlaceType {
    pub id:    String,
    pub title: String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct PlaceTypes {
    pub data: Vec<PlaceType>,
}

// типы модулей (стул, лежак)
#[derive(Debug, Deserialize, Serialize)]
pub struct ModuleType {
    pub id:    String,
    pub title: String,
    pub types: i16,
    pub image: Option<String>,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct ModuleTypes {
    pub data: Vec<ModuleType>,
}

// пользователи
#[derive(Debug, Deserialize, Serialize)]
pub struct UserJson {
    pub id:         String,
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
    pub level:      i16,
    pub image:      Option<String>,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct UserJsons {
    pub data: Vec<UserJson>,
}

// заказы владельца объекта
#[derive(Debug, Deserialize, Serialize)]
pub struct RespOrderJson {
    pub title:      String,
    pub place_id:   String,
    pub object_id:  String,
    pub user:       UserJson,
    pub price:      i32,
    pub time_start: String,
    pub time_end:   String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct RespOrderJsons {
    pub data: Vec<RespOrderJson>,
}
//

// заказы пользователя
#[derive(Debug, Deserialize, Serialize)]
pub struct OrderListJson {
    pub object_id:  String,
    pub price:      i32,
    pub time_start: String,
    pub time_end:   String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct PlaceListJson {
    pub title: String,
    pub image: Option<String>,
    pub cord:  Option<String>,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct RespOrderJson2 {
    pub order:  OrderListJson,
    pub place:  PlaceListJson,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RespOrderJson2s {
    pub data: Vec<RespOrderJson2>,
} 
///

// модули 
#[derive(Debug, Deserialize, Serialize)]
pub struct Module {
    pub id:         String,
    pub title:      String,
    pub types:      i16,
    pub place_id:   String,
    pub type_id:    String,
    pub price:      i32,
    pub _width:     i16,
    pub _height:    i16,
    pub _left:      f64,
    pub _top:       f64,
    pub _angle:     f64,
    pub font_color: String,
    pub font_size:  String,
    pub back_color: String,
    pub image:      Option<String>,
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
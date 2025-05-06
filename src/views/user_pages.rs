use actix_web::{
    HttpRequest,
    HttpResponse,
    Responder,
    web,
    error::InternalError,
    http::StatusCode,
    web::Json,
};
use sailfish::TemplateOnce;
use serde::{Serialize, Deserialize};
use actix_session::Session;
use crate::utils::{
    get_current_user,
    is_signed_in,
    RespOrderJsons, Times, URL, UserJson,
};
use crate::views::AuthResp2;


pub fn user_urls(config: &mut web::ServiceConfig) {
    config.route("/profile/", web::get().to(profile_page));
    config.route("/suggest_users/", web::get().to(suggest_users_page));
    config.route("/users/", web::get().to(users_page));
    config.route("/partners/", web::get().to(partners_page));

    config.route("/edit_user/", web::post().to(edit_user));
}


#[derive(Deserialize, Debug)]
pub struct ProfileJson {
    pub orders: Vec<crate::utils::RespOrderJson2>,
    pub places: Vec<crate::utils::PlaceListJson>,
} 

pub async fn profile_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let orders: Vec<crate::utils::RespOrderJson2>;
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
            orders:       Vec<crate::utils::RespOrderJson2>,
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

#[derive(Deserialize, Serialize)]
pub struct RespPartnerJson {
    pub id:      String,
    pub title:   String,
    pub inn:     String,
    pub types:   i16,
    pub created: chrono::NaiveDateTime,
    pub user:    UserJson,
}
impl {
    pub fn get_image(&self) -> String {
        if self.image.is_some() {
            return self.image.as_deref().unwrap().to_string();
        }
        else {
            return "/assets/images/faces/1.jpg".to_string();
        }
    }
}

pub async fn suggest_users_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        if _request_user.is_superuser() {
            let list: Vec<UserJson>;
            let url = URL.to_string() + &"/suggest/".to_string();
            let resp = crate::utils::request_get::<Vec<RespPartnerJson>>(url, _request_user.uuid.clone(), "application/json".to_string()).await;
            if resp.is_ok() { 
                list = resp.expect("E.");
            }
            else {
                list = Vec::new();
            }

            #[derive(TemplateOnce)]
            #[template(path = "admin/suggest_users.stpl")]
            struct Template {
                request_user: AuthResp2,
                list:         Vec<RespPartnerJson>,
            }
            let body = Template {
                request_user: _request_user,
                list:         list,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
        }
        else {
            Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("403"))
        }
    }
    else {
        crate::views::auth_page(session).await
    }
}
pub async fn partners_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        if _request_user.is_superuser() {
            let list: Vec<UserJson>;
            let url = URL.to_string() + &"/partners/".to_string();
            let resp = crate::utils::request_get::<Vec<RespPartnerJson>>(url, _request_user.uuid.clone(), "application/json".to_string()).await;
            if resp.is_ok() { 
                list = resp.expect("E.");
            }
            else {
                list = Vec::new();
            }

            #[derive(TemplateOnce)]
            #[template(path = "admin/partners.stpl")]
            struct Template {
                request_user: AuthResp2,
                list:         Vec<RespPartnerJson>,
            }
            let body = Template {
                request_user: _request_user,
                list:         list,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
        }
        else {
            Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("403"))
        }
    }
    else {
        crate::views::auth_page(session).await
    }
}

pub async fn users_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        if _request_user.is_superuser() {
            let list: Vec<UserJson>;
            let url = URL.to_string() + &"/users/".to_string();
            let resp = crate::utils::request_get::<Vec<UserJson>>(url, _request_user.uuid.clone(), "application/json".to_string()).await;
            if resp.is_ok() { 
                list = resp.expect("E.");
            }
            else {
                list = Vec::new();
            }

            #[derive(TemplateOnce)]
            #[template(path = "admin/users.stpl")]
            struct Template {
                request_user: AuthResp2,
                list:         Vec<UserJson>,
            }
            let body = Template {
                request_user: _request_user,
                list:         list,
            }
            .render_once()
            .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
            Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
        }
        else {
            Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("403"))
        }
    }
    else {
        crate::views::auth_page(session).await
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct EditUserJson { 
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct IdUser {
    pub id: String,
}
pub async fn edit_user(session: Session, data: Json<EditUserJson>) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        let url = URL.to_string() + &"/edit_user/".to_string();
        let res = crate::utils::request_post::<EditUserJson, crate::views::AuthResp2> (
            url,
            &data, 
            _request_user.uuid,
            "application/json".to_string()
        ).await;

        let data = IdUser {
            id: _request_user.id.clone(),
        };
        let res = crate::utils::request_post::<IdUser, crate::views::AuthResp2> (
            URL.to_owned() + &"/get_user_data/".to_string(),
            &data,  
            "".to_string(),
            "application/json".to_string()
        ).await;

                match res {
                    Ok(user) => {
                        println!("data send");
                        if user.id != "".to_string() {
                            println!("session reload");
                            //&session.purge();
                            crate::utils::set_current_user(&session, &user);
                        }
                    },
                    Err(_) => (),
                }
    }
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}
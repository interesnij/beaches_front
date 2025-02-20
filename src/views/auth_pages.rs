use actix_web::{
    HttpRequest,
    HttpResponse,
    Responder,
    web,
    error::InternalError,
    http::StatusCode,
    dev::ConnectionInfo,
    web::Json,
};
use sailfish::TemplateOnce;
use serde::{Serialize, Deserialize};
use crate::utils::{
    get_current_user,
    NewUserForm,
    is_signed_in,
    URL,
};
use crate::utils::request_post;
use actix_session::Session;


pub fn auth_urls(config: &mut web::ServiceConfig) {
    config.route("/", web::get().to(auth_page));
    config.route("/signup/", web::get().to(signup_page));
    config.route("/login/", web::post().to(login));
    config.route("/signup/", web::post().to(signup));
    config.route("/logout/", web::get().to(logout));
}

pub async fn logout(req: HttpRequest, session: Session) -> actix_web::Result<HttpResponse> {
    session.purge(); 
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("ok"))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginUser {
    pub email:    String,
    pub password: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AuthResp {
    pub id:         String,
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
    pub perm:       i16,
    pub image:      Option<String>,
}
impl AuthResp {
    pub fn is_superuser(&self) -> bool {
        return self.perm == 10;
    }
    pub fn is_partner(&self) -> bool {
        return self.perm == 4;
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AuthResp2 { 
    pub id:         String,
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
    pub perm:       i16,
    pub image:      Option<String>,
    pub uuid:       String,
} 
impl AuthResp2 {
    pub fn is_superuser(&self) -> bool {
        return self.perm == 10;
    }
    pub fn is_partner(&self) -> bool {
        return self.perm == 4;
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct NewUser {
    pub first_name: String,
    pub last_name:  String,
    pub email:      String,
    pub password:   String,
    pub token:      String,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct NewPassword {
    pub password: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Resp {
    pub status: String,
}

pub async fn login(session: Session, data: Json<LoginUser>) -> Json<Resp> {
    if is_signed_in(&session) {
        return Json(Resp { 
            status: "error".to_string(),
        }); 
    }

    let res = request_post::<LoginUser, AuthResp2> (
        URL.to_owned() + &"/login/".to_string(),
        &data, 
        "".to_string()
    ).await;

    match res {
        Ok(user) => {
            if user.id == "".to_string() {
                return Json(Resp {
                    status: "error".to_string(),
                });
            }
            crate::utils::set_current_user(&session, &user);
            return Json(Resp {
                status: "ok!".to_string(),
            });
        },
        Err(_) => Json(Resp {
                    status: "error".to_string(),
                }),
    }
}


pub async fn signup(req: HttpRequest, session: Session, data: Json<NewUser>) -> actix_web::Result<HttpResponse> {
    let l_data = NewUser {
        first_name: data.first_name.clone(),
        last_name:  data.last_name.clone(),
        email:      data.email.clone(),
        password:   data.password.clone(),
        token:      data.token.clone(),
    }; 
    let res = request_post::<NewUser, AuthResp2> (
        URL.to_owned() + &"/signup/".to_string(),
        &l_data,
        "".to_string()
    ).await;

    match res {
        Ok(user) => {
            crate::utils::set_current_user(&session, &user);
            crate::views::profile_page(session).await
        },
        Err(_) => Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body("err")),
    }
}

pub async fn auth_page(session: Session) -> actix_web::Result<HttpResponse> {
    #[derive(TemplateOnce)] 
    #[template(path = "auth/auth.stpl")]
    struct Template;
    let body = Template{}
    .render_once()
    .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
}
pub async fn signup_page(session: Session) -> actix_web::Result<HttpResponse> {
    #[derive(TemplateOnce)] 
    #[template(path = "auth/signup.stpl")]
    struct Template;
    let body = Template{}
    .render_once()
    .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
    Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
}
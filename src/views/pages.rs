use actix_web::{
    HttpResponse,
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
    Place, Places, URL,
};
use crate::views::AuthResp2;


pub fn pages_urls(config: &mut web::ServiceConfig) {
    config.route("/", web::get().to(main_page));
    config.route("/about/", web::get().to(about_page));
    config.route("/terms-and-conditions/", web::get().to(terms_page));
    config.route("/privacy-policy/", web::get().to(policy_page));
}

pub async fn main_page(session: Session) -> actix_web::Result<HttpResponse> {
    let object_list: Vec<Place>;
    let url = URL.to_string() + &"/places/".to_string();
    let resp = crate::utils::request_get::<Places>(url, "".to_string()).await;
    if resp.is_ok() { 
        let data = resp.expect("E.");
        object_list = data.data;
    }
    else { 
        object_list = Vec::new();
    }
    let mut list: Vec<Place> = Vec::new();
    for object in object_list.into_iter() {
        list.push(object);
    }

    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        #[derive(TemplateOnce)]
        #[template(path = "mainpage.stpl")]
        struct Template {
            request_user: AuthResp2,
            object_list:  Vec<Place>,
        }
        let body = Template {
            request_user: _request_user,
            object_list:  list,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
    else {
        #[derive(TemplateOnce)]
        #[template(path = "anon_mainpage.stpl")]
        struct Template {
            object_list:  Vec<Place>,
        }
        let body = Template {
            object_list:  list,
        }
        .render_once()
        .map_err(|e| InternalError::new(e, StatusCode::INTERNAL_SERVER_ERROR))?;
        Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(body))
    }
}

pub async fn about_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        #[derive(TemplateOnce)]
        #[template(path = "about.stpl")]
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
        #[template(path = "anon_about.stpl")]
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

pub async fn not_found_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        #[derive(TemplateOnce)]
        #[template(path = "not_found.stpl")]
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
        #[template(path = "anon_not_found.stpl")]
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

pub async fn terms_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        #[derive(TemplateOnce)]
        #[template(path = "terms.stpl")]
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
        #[template(path = "anon_terms.stpl")]
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

pub async fn policy_page(session: Session) -> actix_web::Result<HttpResponse> {
    if is_signed_in(&session) {
        let _request_user = get_current_user(&session).expect("E.");
        #[derive(TemplateOnce)]
        #[template(path = "policy.stpl")]
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
        #[template(path = "anon_policy.stpl")]
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
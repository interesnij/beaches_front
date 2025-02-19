use actix_web::{
    http::header::CONTENT_TYPE,
    HttpRequest,
    web::Json,
    Error,
};
use crate::views::AuthResp;
use serde::{Serialize, Deserialize};
use crate::errors::AuthError;
use actix_session::Session;


pub fn is_json_request(req: &HttpRequest) -> bool {
    req
      .headers()
      .get(CONTENT_TYPE)
      .map_or(
        false,
        |header| header.to_str().map_or(false, |content_type| "application/json" == content_type)
      )
}

pub fn is_signed_in(session: &Session) -> bool {
  match get_current_user(session) {
      Ok(_) => true,
      _ => false,
  }
}

pub fn set_current_user(session: &Session, user: &AuthResp) -> () {
    session.insert("user", serde_json::to_string(user).unwrap()).unwrap();
}
 
pub fn get_current_user(session: &Session) -> Result<AuthResp, AuthError> {
    let msg = "Error";

    session
        .get::<String>("user")
        .map_err(|_| AuthError::AuthenticationError(String::from(msg)))
        .unwrap() 
        .map_or(
          Err(AuthError::AuthenticationError(String::from(msg))),
          |user| serde_json::from_str(&user).or_else(|_| Err(AuthError::AuthenticationError(String::from(msg))))
        )
}
use actix_web::{
    web,
    HttpRequest,
    HttpResponse,
    Responder, 
    web::Data,
};
use awc::http::{StatusCode, header::HeaderMap};
use clap::Parser;
use serde::{Deserialize, Serialize};
use crate::utils::URL;
use std::str;
use futures::TryStreamExt;


#[derive(Clone, Parser)]
pub struct ConfigToStaticServer {
    #[clap(short, long, default_value = "79.174.82.18")]             // наш ip
    pub address: String,
    #[clap(short, long, default_value = "9999")]                     // наш порт
    pub port: u16, 
    #[clap(short, long, default_value = "79.174.82.18:8120")] // адрес, на который будем перенаправлять запросы
    pub to: String, 
}

#[derive(Debug, Deserialize)]
struct ImageParams {
    pub types: Option<String>,
}
#[derive(Deserialize, Serialize, Debug)]
pub struct IdUser {
    pub id: String,
}

pub async fn upload_files (
    session:     actix_session::Session,
    body:        web::Payload,
    path:        web::Path<String>,
    http_client: Data<awc::Client>,
    req:         HttpRequest,
) -> actix_web::Result<HttpResponse> {
    if !crate::utils::is_signed_in(&session) {
        return Ok(HttpResponse::Ok().body("403"));
    } 
    let url = format!( 
        "{to}{path}", 
        to = "http://79.174.82.18:8120".to_string(),
        path = req.uri().path_and_query().map(|p| p.as_str()).unwrap_or("").to_owned()
    );

    println!("=> {url}");
    println!("");
    println!("");
    match http_client
        .request_from(
            &url, 
            req.head()
        )
        .insert_header(("ContentType", "multipart/form-data"))
        .insert_header(("secret", "755553b2016e92e89a704e4a41a19d9d5df901dd66d0850dcb70db0668ddc91c"))
        .send_stream(body)
        .await 
    {
        Ok(resp) => {
            let status = resp.status();
            println!("<= [{status}] {url}", status = status.as_u16());
            println!("");
            println!("========================================");
            println!("");
            println!("req.head: {:?}", req.head());
            let mut resp_builder = HttpResponse::build(status);
            for header in resp.headers() {
                resp_builder.insert_header(header);
            }  
            //resp_builder.insert_header(("ContentType", "multipart/form-data"));
            //resp_builder.insert_header(("secret", "755553b2016e92e89a704e4a41a19d9d5df901dd66d0850dcb70db0668ddc91c"));
            println!("");
            println!("========================================");
            println!("");
            println!("resp.head: {:?}", resp.headers());
            println!("");
            println!("========================================");
            println!("");

            let params_some = web::Query::<ImageParams>::from_query(&req.query_string());
            let types: String;
            if params_some.is_ok() {
                let params = params_some.unwrap();
                if params.types.is_some() {
                    types = params.types.as_deref().unwrap().to_string();
                }
                else {
                    types = "".to_string();
                }
            }
            else {
                types = "".to_string();
            }
            println!("types: {}", types);
            if types == "user_avatar".to_string() {
                let _request_user = crate::utils::get_current_user(&session).expect("E.");
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
                            &session.purge();
                            crate::utils::set_current_user(&session, &user);
                        }
                    },
                    Err(_) => (),
                }
            }

            Ok(resp_builder.streaming(resp.into_stream()))
        }, 
        Err(err) => {
            println!("err");
            Ok(HttpResponse::Ok().body("ой-ёй"))
        },
    }
    //Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(""))
    //else {
    //    println!("ой-ёй");
    //    HttpResponse::Ok().body("ой-ёй")
    //}
}
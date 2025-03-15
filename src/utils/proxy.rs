use actix_web::{
    web,
    HttpRequest,
    HttpResponse,
    Responder, 
    web::Data,
};
use awc::http::StatusCode;
use clap::Parser;
//use futures::TryStreamExt;
use serde::Deserialize;
use crate::utils::URL;
use std::str;


#[derive(Clone, Parser)]
pub struct ConfigToStaticServer {
    #[clap(short, long, default_value = "https://my-demo.ru")]             // наш ip
    pub address: String,
    #[clap(short, long, default_value = "443")]                            // наш порт
    pub port: u16,
    #[clap(short, long, default_value = URL)] // адрес, на который будем перенаправлять запросы
    pub to: String,
}


pub async fn upload_files (
    body:        web::Payload,
    path:        web::Path<String>,
    http_client: Data<awc::Client>,
    req:         HttpRequest,
) -> actix_web::Result<HttpResponse> {
    let url = format!(
        "{to}{path}", 
        to = URL.to_string(),
        path = req.uri().path_and_query().map(|p| p.as_str()).unwrap_or("").to_owned()
    );
        
    println!("=> {url}");
    match http_client
        .request_from(&url, req.head())
        .send_stream(body)
        .await 
    {
        Ok(resp) => {
            let status = resp.status();
            println!("<= [{status}] {url}", status = status.as_u16());
            Ok()
            //println!("Ok: {}", resp)
        },
        Err(err) => {
            println!("err");
            Ok()
        },
    }
    //Ok(HttpResponse::Ok().content_type("text/html; charset=utf-8").body(""))
    //else {
    //    println!("ой-ёй");
    //    HttpResponse::Ok().body("ой-ёй")
    //}
}
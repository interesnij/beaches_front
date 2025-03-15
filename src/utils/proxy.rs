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
use futures::TryStreamExt;


#[derive(Clone, Parser)]
pub struct ConfigToStaticServer {
    #[clap(short, long, default_value = "192.168.0.49")]             // наш ip
    pub address: String,
    #[clap(short, long, default_value = "9999")]                     // наш порт
    pub port: u16,
    #[clap(short, long, default_value = "192.168.0.49:8120")] // адрес, на который будем перенаправлять запросы
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
            let mut resp_builder = HttpResponse::build(status);
            for header in resp.headers() {
                resp_builder.insert_header(header);
            }
            //resp_builder.insert_header(("enctype", "multipart/form-data"));
            resp_builder.insert_header(("secret", "755553b2016e92e89a704e4a41a19d9d5df901dd66d0850dcb70db0668ddc91c"));
            Ok(resp_builder.streaming(resp.into_stream()))
            //Ok(HttpResponse::Ok().body("ok"))
            //println!("Ok: {}", resp)
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
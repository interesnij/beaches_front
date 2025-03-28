use actix_web::{
    App,
    HttpServer,
    web,
    cookie::Key,
    web::Data,
};
mod views;
mod utils;
mod routes;
mod errors;

use crate::views::not_found_page;
use actix_session::{storage::CookieSessionStore, SessionMiddleware};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use crate::routes::routes;
    use actix_files::Files;
    use std::time::Duration;
    let secret_key = Key::generate();
    use clap::Parser;
    use crate::utils::{
        upload_files,
        ConfigToStaticServer,
    };

    let config_to_static_server = ConfigToStaticServer::parse();

    HttpServer::new(move || {
        let http_client = awc::Client::default();
        let _files = Files::new("/assets", "assets/").show_files_listing();
        let _files2 = Files::new("/media", "media/").show_files_listing();
        App::new()
            .app_data(Data::new(config_to_static_server.clone()))
            .app_data(Data::new(http_client))
            .wrap(
                SessionMiddleware::builder(CookieSessionStore::default(), secret_key.clone())
                    .cookie_secure(false)
                    .build(),
            )
            .default_service(web::route().to(not_found_page))
            .service(_files)
            .service(_files2)
            .configure(routes)
            .service(web::resource("/create{path:.*}").to(upload_files))
    })
    .bind("192.168.0.127:9999")?   // prod
    .run()
    .await
} 
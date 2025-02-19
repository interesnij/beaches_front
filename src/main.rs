use actix_web::{
    App,
    HttpServer,
    web,
    cookie::Key,
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

    HttpServer::new(move || { 
        let _files = Files::new("/assets", "assets/").show_files_listing();
        App::new()
            .wrap(
                SessionMiddleware::builder(CookieSessionStore::default(), secret_key.clone())
                    .cookie_secure(false)
                    .build(),
            )
            .default_service(web::route().to(not_found_page))
            .service(_files)
            .configure(routes)
    }) 
    .bind("192.168.0.49:9999")?   // prod
    .run()
    .await
} 
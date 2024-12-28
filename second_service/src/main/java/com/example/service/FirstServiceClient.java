package com.example.service;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

@ApplicationScoped
public class FirstServiceClient {
    private WebTarget target;
    
    @PostConstruct
    public void init() {
        try {
            // Создаем SSLContext, который доверяет всем сертификатам
            SSLContext sslContext = SSLContext.getInstance("TLS");
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[0];
                    }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            // Создаем клиент с настроенным SSL
            Client client = ClientBuilder.newBuilder()
                    .sslContext(sslContext)
                    .hostnameVerifier((hostname, session) -> true)
                    .build();

            target = client.target("https://localhost:8443/jaxrs-service/api");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize FirstServiceClient", e);
        }
    }

    public WebTarget getTarget() {
        return target;
    }
} 
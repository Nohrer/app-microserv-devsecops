package com.company.order.client;

import com.company.order.dto.ProductStockResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${product.service.url:http://localhost:8081}")
    private String productServiceUrl;

    public ProductStockResponse checkStock(Long productId, Integer quantity, String authToken) {
        log.info("Checking stock for product ID: {} with quantity: {}", productId, quantity);

        WebClient webClient = webClientBuilder.baseUrl(productServiceUrl).build();

        return webClient.post()
            .uri("/api/products/check-stock")
            .header(HttpHeaders.AUTHORIZATION, authToken)
            .bodyValue(Map.of("productId", productId, "requestedQuantity", quantity))
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, response -> {
                log.error("Client error from product service: {}", response.statusCode());
                return response.bodyToMono(String.class)
                    .flatMap(body -> Mono.error(new RuntimeException("Product service error: " + body)));
            })
            .onStatus(HttpStatusCode::is5xxServerError, response -> {
                log.error("Server error from product service: {}", response.statusCode());
                return Mono.error(new RuntimeException("Product service unavailable"));
            })
            .bodyToMono(ProductStockResponse.class)
            .block();
    }

    public void decreaseStock(Long productId, Integer quantity, String authToken) {
        log.info("Decreasing stock for product ID: {} by quantity: {}", productId, quantity);

        WebClient webClient = webClientBuilder.baseUrl(productServiceUrl).build();

        webClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/api/products/{id}/decrease-stock")
                .queryParam("quantity", quantity)
                .build(productId))
            .header(HttpHeaders.AUTHORIZATION, authToken)
            .retrieve()
            .onStatus(HttpStatusCode::isError, response -> {
                log.error("Error decreasing stock: {}", response.statusCode());
                return Mono.error(new RuntimeException("Failed to decrease stock"));
            })
            .bodyToMono(Void.class)
            .block();
    }
}

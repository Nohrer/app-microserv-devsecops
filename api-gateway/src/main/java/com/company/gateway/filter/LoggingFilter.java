package com.company.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Component
@Slf4j
public class LoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String requestId = UUID.randomUUID().toString();
        long startTime = Instant.now().toEpochMilli();
        
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String method = request.getMethod().name();
        String clientIp = request.getRemoteAddress() != null ? 
            request.getRemoteAddress().getAddress().getHostAddress() : "unknown";

        return ReactiveSecurityContextHolder.getContext()
            .map(context -> {
                if (context.getAuthentication() instanceof JwtAuthenticationToken jwtAuth) {
                    return jwtAuth.getName();
                }
                return "anonymous";
            })
            .defaultIfEmpty("anonymous")
            .flatMap(username -> {
                log.info("REQUEST [{}] - User: {} | Method: {} | Path: {} | IP: {}", 
                    requestId, username, method, path, clientIp);
                
                return chain.filter(exchange)
                    .doOnSuccess(v -> {
                        long duration = Instant.now().toEpochMilli() - startTime;
                        int statusCode = exchange.getResponse().getStatusCode() != null ? 
                            exchange.getResponse().getStatusCode().value() : 0;
                        
                        log.info("RESPONSE [{}] - User: {} | Status: {} | Duration: {}ms", 
                            requestId, username, statusCode, duration);
                    })
                    .doOnError(error -> {
                        long duration = Instant.now().toEpochMilli() - startTime;
                        log.error("ERROR [{}] - User: {} | Error: {} | Duration: {}ms", 
                            requestId, username, error.getMessage(), duration);
                    });
            });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}

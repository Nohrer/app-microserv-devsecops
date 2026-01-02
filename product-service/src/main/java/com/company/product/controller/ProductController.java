package com.company.product.controller;

import com.company.product.dto.*;
import com.company.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        log.info("GET /api/products - Fetching all products");
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{} - Fetching product by ID", id);
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        log.info("POST /api/products - Creating product by user: {}", username);
        ProductResponse response = productService.createProduct(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        log.info("PUT /api/products/{} - Updating product by user: {}", id, username);
        return ResponseEntity.ok(productService.updateProduct(id, request, username));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        log.info("DELETE /api/products/{} - Deleting product by user: {}", id, username);
        productService.deleteProduct(id, username);
        return ResponseEntity.noContent().build();
    }

    // Internal endpoint for order service
    @PostMapping("/check-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<StockCheckResponse> checkStock(@RequestBody StockCheckRequest request) {
        log.info("POST /api/products/check-stock - Checking stock for product: {}", request.getProductId());
        return ResponseEntity.ok(productService.checkStock(request.getProductId(), request.getRequestedQuantity()));
    }

    @PostMapping("/{id}/decrease-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> decreaseStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        log.info("POST /api/products/{}/decrease-stock - Decreasing stock by: {}", id, quantity);
        productService.decreaseStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/increase-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> increaseStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        log.info("POST /api/products/{}/increase-stock - Increasing stock by: {}", id, quantity);
        productService.increaseStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}

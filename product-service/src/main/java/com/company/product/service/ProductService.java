package com.company.product.service;

import com.company.product.dto.*;
import com.company.product.entity.Product;
import com.company.product.exception.ProductNotFoundException;
import com.company.product.exception.InsufficientStockException;
import com.company.product.mapper.ProductMapper;
import com.company.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductResponse createProduct(ProductRequest request, String username) {
        log.info("Creating new product: {} by user: {}", request.getName(), username);
        
        Product product = productMapper.toEntity(request);
        product.setCreatedBy(username);
        product.setUpdatedBy(username);
        
        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());
        
        return productMapper.toResponse(savedProduct);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request, String username) {
        log.info("Updating product ID: {} by user: {}", id, username);
        
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));
        
        productMapper.updateEntity(request, product);
        product.setUpdatedBy(username);
        
        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully: {}", updatedProduct.getId());
        
        return productMapper.toResponse(updatedProduct);
    }

    public void deleteProduct(Long id, String username) {
        log.info("Deleting product ID: {} by user: {}", id, username);
        
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));
        
        product.setIsActive(false);
        product.setUpdatedBy(username);
        productRepository.save(product);
        
        log.info("Product soft deleted successfully: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        log.debug("Fetching all active products");
        List<Product> products = productRepository.findByIsActiveTrue();
        return productMapper.toResponseList(products);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product by ID: {}", id);
        
        Product product = productRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));
        
        return productMapper.toResponse(product);
    }

    public StockCheckResponse checkStock(Long productId, Integer requestedQuantity) {
        log.debug("Checking stock for product ID: {}, requested quantity: {}", productId, requestedQuantity);
        
        Product product = productRepository.findByIdAndIsActiveTrue(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        
        boolean isAvailable = product.getStockQuantity() >= requestedQuantity;
        
        return StockCheckResponse.builder()
            .productId(product.getId())
            .productName(product.getName())
            .unitPrice(product.getPrice())
            .availableQuantity(product.getStockQuantity())
            .requestedQuantity(requestedQuantity)
            .isAvailable(isAvailable)
            .message(isAvailable ? "Stock available" : "Insufficient stock")
            .build();
    }

    public void decreaseStock(Long productId, Integer quantity) {
        log.info("Decreasing stock for product ID: {} by quantity: {}", productId, quantity);
        
        int updated = productRepository.decreaseStock(productId, quantity);
        if (updated == 0) {
            throw new InsufficientStockException("Unable to decrease stock for product ID: " + productId);
        }
        
        log.info("Stock decreased successfully for product ID: {}", productId);
    }

    public void increaseStock(Long productId, Integer quantity) {
        log.info("Increasing stock for product ID: {} by quantity: {}", productId, quantity);
        
        productRepository.increaseStock(productId, quantity);
        log.info("Stock increased successfully for product ID: {}", productId);
    }
}

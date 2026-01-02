package com.company.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckResponse {
    private Long productId;
    private String productName;
    private BigDecimal unitPrice;
    private Integer availableQuantity;
    private Integer requestedQuantity;
    private Boolean isAvailable;
    private String message;
}

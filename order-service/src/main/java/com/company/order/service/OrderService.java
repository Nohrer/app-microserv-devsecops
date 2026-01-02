package com.company.order.service;

import com.company.order.client.ProductServiceClient;
import com.company.order.dto.*;
import com.company.order.entity.Order;
import com.company.order.entity.OrderItem;
import com.company.order.entity.OrderStatus;
import com.company.order.exception.InsufficientStockException;
import com.company.order.exception.OrderNotFoundException;
import com.company.order.mapper.OrderMapper;
import com.company.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductServiceClient productServiceClient;

    public OrderResponse createOrder(OrderRequest request, String userId, String username, String authToken) {
        log.info("Creating order for user: {} ({})", username, userId);

        // Validate stock availability for all items
        List<ProductStockResponse> stockResponses = new ArrayList<>();
        for (OrderItemRequest item : request.getItems()) {
            ProductStockResponse stockResponse = productServiceClient.checkStock(
                item.getProductId(), 
                item.getQuantity(), 
                authToken
            );
            
            if (!stockResponse.getIsAvailable()) {
                log.error("Insufficient stock for product: {}", item.getProductId());
                throw new InsufficientStockException(
                    String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                        stockResponse.getProductName(),
                        stockResponse.getAvailableQuantity(),
                        stockResponse.getRequestedQuantity())
                );
            }
            stockResponses.add(stockResponse);
        }

        // Create order
        Order order = Order.builder()
            .userId(userId)
            .username(username)
            .status(OrderStatus.PENDING)
            .totalAmount(BigDecimal.ZERO)
            .items(new ArrayList<>())
            .build();

        // Add items and calculate total
        for (int i = 0; i < request.getItems().size(); i++) {
            OrderItemRequest itemRequest = request.getItems().get(i);
            ProductStockResponse stockResponse = stockResponses.get(i);

            OrderItem orderItem = OrderItem.builder()
                .productId(itemRequest.getProductId())
                .productName(stockResponse.getProductName())
                .quantity(itemRequest.getQuantity())
                .unitPrice(stockResponse.getUnitPrice())
                .build();

            order.addItem(orderItem);
        }

        order.calculateTotalAmount();

        // Decrease stock for all items
        for (OrderItemRequest item : request.getItems()) {
            productServiceClient.decreaseStock(item.getProductId(), item.getQuantity(), authToken);
        }

        // Update status to confirmed
        order.setStatus(OrderStatus.CONFIRMED);

        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {}", savedOrder.getId());

        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(String userId) {
        log.debug("Fetching orders for user: {}", userId);
        List<Order> orders = orderRepository.findByUserIdWithItems(userId);
        return orderMapper.toResponseList(orders);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        log.debug("Fetching all orders");
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return orderMapper.toResponseList(orders);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        log.debug("Fetching order by ID: {}", id);
        Order order = orderRepository.findByIdWithItems(id)
            .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + id));
        return orderMapper.toResponse(order);
    }

    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        log.info("Updating order {} status to: {}", id, status);
        
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + id));
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        return orderMapper.toResponse(updatedOrder);
    }
}

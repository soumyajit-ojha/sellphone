import api from './api';

export const shopService = {
    // Cart Actions
    getCart: () => api.get('/shop/cart'),
    addToCart: (productId, quantity = 1) => api.post('/shop/cart/add', { product_id: productId, quantity }),
    removeFromCart: (itemId) => api.delete(`/shop/cart/item/${itemId}`),

    updateQuantity: (itemId, quantity) => api.put(`/shop/cart/item/${itemId}`, { quantity }),
    checkout: (addressId, cartItemIds) => api.post('/orders/checkout', {
        address_id: addressId,
        cart_item_ids: cartItemIds
    }),
    getOrders: () => api.get('/orders/my-orders'),
    // Wishlist Actions
    toggleWishlist: (productId) => api.post(`/shop/wishlist/toggle/${productId}`),
    getWishlist: () => api.get('/shop/wishlist'),
    getOrderById: (id) => api.get(`/orders/${id}`),
    // Simulate Payment Success
    simulatePaymentSuccess: (externalOrderId) => {
        return api.post('/orders/webhook/payment', {
            external_order_id: externalOrderId,
            status: "success" // This matches the 'success' check in your Backend Service
        });
    }
};
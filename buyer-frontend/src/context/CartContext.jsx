import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                localStorage.removeItem('cart');
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (crop, quantity, negotiationId = null) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === crop.id && item.negotiationId === negotiationId);
            if (existing) {
                return prev.map(item =>
                    (item.id === crop.id && item.negotiationId === negotiationId)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Use negotiated price if available, otherwise fallback to regular price
            const priceToUse = crop.pricePerKg || crop.offeredPrice || crop.price;
            return [...prev, { ...crop, pricePerKg: priceToUse, quantity, negotiationId }];
        });
    };

    const removeFromCart = (cropId) => {
        setCartItems(prev => prev.filter(item => item.id !== cropId));
    };

    const updateQuantity = (cropId, quantity) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === cropId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.pricePerKg * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

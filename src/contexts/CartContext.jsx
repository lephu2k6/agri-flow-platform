import React, { createContext, useState, useEffect, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CartContext = createContext({})

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } else {
      localStorage.removeItem('cart')
    }
  }, [cartItems])

  const addToCart = async (product, quantity = 1) => {
    try {
      // Check if product already in cart
      const existingItemIndex = cartItems.findIndex(item => item.product_id === product.id)
      
      if (existingItemIndex >= 0) {
        // Update quantity
        const updatedItems = [...cartItems]
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity
        
        // Check stock
        if (newQuantity > product.quantity) {
          toast.error(`Kho chỉ còn ${product.quantity} ${product.unit}`)
          return
        }
        
        updatedItems[existingItemIndex].quantity = newQuantity
        setCartItems(updatedItems)
        toast.success('Đã cập nhật giỏ hàng')
      } else {
        // Add new item
        if (quantity > product.quantity) {
          toast.error(`Kho chỉ còn ${product.quantity} ${product.unit}`)
          return
        }

        const cartItem = {
          product_id: product.id,
          farmer_id: product.farmer_id,
          title: product.title,
          price_per_unit: product.price_per_unit,
          unit: product.unit,
          quantity: quantity,
          image_url: product.product_images?.[0]?.image_url || product.image_url,
          min_order_quantity: product.min_order_quantity || 1,
          available_quantity: product.quantity,
          province: product.province
        }
        
        setCartItems([...cartItems, cartItem])
        toast.success('Đã thêm vào giỏ hàng')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Không thể thêm vào giỏ hàng')
    }
  }

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId))
    toast.success('Đã xóa khỏi giỏ hàng')
  }

  const updateQuantity = (productId, newQuantity) => {
    const item = cartItems.find(item => item.product_id === productId)
    if (!item) return

    if (newQuantity < item.min_order_quantity) {
      toast.error(`Số lượng tối thiểu là ${item.min_order_quantity} ${item.unit}`)
      return
    }

    if (newQuantity > item.available_quantity) {
      toast.error(`Kho chỉ còn ${item.available_quantity} ${item.unit}`)
      return
    }

    setCartItems(cartItems.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const clearCart = () => {
    setCartItems([])
    toast.success('Đã xóa toàn bộ giỏ hàng')
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price_per_unit * item.quantity)
    }, 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.length
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount,
      getCartItemsCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

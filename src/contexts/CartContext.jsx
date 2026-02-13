import React, { createContext, useState, useEffect, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CartContext = createContext({})

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from Supabase or localStorage on mount/auth change
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        setLoading(true)
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              quantity,
              product_id,
              products (*)
            `)
            .eq('user_id', user.id)

          if (error) throw error

          if (data) {
            const formattedItems = data.map(item => ({
              product_id: item.product_id,
              farmer_id: item.products.farmer_id,
              title: item.products.title,
              price_per_unit: item.products.price_per_unit,
              unit: item.products.unit,
              quantity: item.quantity,
              image_url: item.products.product_images?.[0]?.image_url || item.products.image_url,
              min_order_quantity: item.products.min_order_quantity || 1,
              available_quantity: item.products.quantity,
              province: item.products.province
            }))
            setCartItems(formattedItems)
          }
        } catch (error) {
          console.error('Error fetching cart:', error)
          // Fallback to localStorage if error
          loadFromLocal()
        } finally {
          setLoading(false)
        }
      } else {
        loadFromLocal()
      }
    }

    const loadFromLocal = () => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (e) {
          console.error('Error loading cart:', e)
        }
      } else {
        setCartItems([])
      }
    }

    fetchCart()
  }, [user])

  // Save cart to localStorage (for guests)
  useEffect(() => {
    if (!user) {
      if (cartItems.length > 0) {
        localStorage.setItem('cart', JSON.stringify(cartItems))
      } else {
        localStorage.removeItem('cart')
      }
    }
  }, [cartItems, user])

  const addToCart = async (product, quantity = 1) => {
    try {
      const existingItem = cartItems.find(item => item.product_id === product.id)
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity

      // Check stock
      if (newQuantity > product.quantity) {
        toast.error(`Kho chỉ còn ${product.quantity} ${product.unit}`)
        return
      }

      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .upsert({
            user_id: user.id,
            product_id: product.id,
            quantity: newQuantity,
            updated_at: new Date()
          }, { onConflict: 'user_id, product_id' })

        if (error) throw error
      }

      if (existingItem) {
        setCartItems(cartItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        ))
        toast.success('Đã cập nhật giỏ hàng')
      } else {
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
      toast.error('Không thể lưu giỏ hàng vào database')
    }
  }

  const removeFromCart = async (productId) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)

        if (error) throw error
      }

      setCartItems(cartItems.filter(item => item.product_id !== productId))
      toast.success('Đã xóa khỏi giỏ hàng')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Lỗi khi xóa sản phẩm')
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
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

    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity, updated_at: new Date() })
          .eq('user_id', user.id)
          .eq('product_id', productId)

        if (error) throw error
      }

      setCartItems(cartItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Lỗi cập nhật số lượng')
    }
  }

  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)

        if (error) throw error
      }
      setCartItems([])
      toast.success('Đã xóa toàn bộ giỏ hàng')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Lỗi khi dọn giỏ hàng')
    }
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

import { supabase } from '../lib/supabase'

export const getProducts = async () =>
  supabase.from('products').select('*').order('created_at', { ascending:false })

export const createProduct = async (data) =>
  supabase.from('products').insert(data)

export const getMyProducts = async (userId) =>
  supabase.from('products').select('*').eq('user_id', userId)

import { supabase } from '../lib/supabase'

/**
 * Helper functions để làm việc với database
 */

// Kiểm tra và sửa constraint orders status
export const checkAndFixOrdersConstraint = async () => {
  try {
    // Kiểm tra constraint hiện tại
    const { data: constraintData, error: checkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          conname AS constraint_name,
          pg_get_constraintdef(oid) AS constraint_definition
        FROM pg_constraint
        WHERE conrelid = 'orders'::regclass
        AND contype = 'c'
        AND conname LIKE '%status%';
      `
    })

    if (checkError) {
      console.error('Error checking constraint:', checkError)
      return { success: false, error: checkError.message }
    }

    console.log('Current constraint:', constraintData)

    // Xóa constraint cũ
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;`
    })

    if (dropError) {
      console.error('Error dropping constraint:', dropError)
    }

    // Tạo lại constraint mới
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders 
        ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pending', 'confirmed', 'shipped', 'shipping', 'completed', 'cancelled', 'processing'));
      `
    })

    if (createError) {
      console.error('Error creating constraint:', createError)
      return { success: false, error: createError.message }
    }

    return { success: true, message: 'Constraint đã được cập nhật' }
  } catch (error) {
    console.error('Error in checkAndFixOrdersConstraint:', error)
    return { success: false, error: error.message }
  }
}

// Kiểm tra các giá trị status hiện có
export const checkOrderStatuses = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')

    if (error) throw error

    const statusCounts = data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    return { success: true, data: statusCounts }
  } catch (error) {
    console.error('Error checking order statuses:', error)
    return { success: false, error: error.message }
  }
}

// Validate status trước khi insert/update
export const validateOrderStatus = (status) => {
  const validStatuses = [
    'pending',
    'confirmed', 
    'shipped',
    'shipping',
    'completed',
    'cancelled',
    'processing'
  ]

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`)
  }

  return true
}

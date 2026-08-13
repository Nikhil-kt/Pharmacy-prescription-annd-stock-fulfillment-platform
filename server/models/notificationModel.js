const supabase = require('../config/supabase');

const TABLE = 'notifications';

/**
 * Get notifications for a user.
 */
const getByUser = async (userId, { is_read, page = 1, limit = 30 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (typeof is_read === 'boolean') query = query.eq('is_read', is_read);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  return await query;
};

/**
 * Mark a single notification as read.
 */
const markRead = async (id) => {
  return await supabase
    .from(TABLE)
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();
};

/**
 * Mark all notifications as read for a user.
 */
const markAllRead = async (userId) => {
  return await supabase
    .from(TABLE)
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();
};

/**
 * Create a notification.
 */
const create = async (notificationData) => {
  return await supabase.from(TABLE).insert(notificationData).select().single();
};

module.exports = { getByUser, markRead, markAllRead, create };

const notificationModel = require('../models/notificationModel');

/**
 * GET /api/notifications — List notifications for the current user.
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { is_read, page, limit } = req.query;

    const { data, error, count } = await notificationModel.getByUser(req.user.id, {
      is_read: is_read !== undefined ? is_read === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 30,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read — Mark a notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const { data, error } = await notificationModel.markRead(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all — Mark all notifications as read.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const { data, error } = await notificationModel.markAllRead(req.user.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications — Create a notification (admin/system).
 */
const createNotification = async (req, res, next) => {
  try {
    const { user_id, title, body, channel, related_order_id } = req.body;

    if (!user_id || !title || !body) {
      return res.status(400).json({ success: false, message: 'user_id, title, and body are required.' });
    }

    const { data, error } = await notificationModel.create({
      user_id,
      title,
      body,
      channel: channel || 'in_app',
      related_order_id: related_order_id || null,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, createNotification };

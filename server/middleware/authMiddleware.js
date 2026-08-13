const supabase = require('../config/supabase');

/**
 * Authentication middleware.
 * Verifies the Supabase JWT from the Authorization header and
 * attaches the authenticated user's profile to `req.user`.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    // Fetch the user's profile from the profiles table
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      // Auto-heal missing profile from user_metadata
      const userMeta = user.user_metadata || {};
      let userRole = userMeta.role || 'customer';
      if (userRole === 'delivery') userRole = 'delivery_partner';
      const userStatus = userRole === 'pharmacist' ? 'pending' : 'active';
      const fullName = userMeta.full_name || user.email?.split('@')[0] || 'User';

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: userMeta.phone || null,
          role: userRole,
          status: userStatus,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (!createError && createdProfile) {
        profile = createdProfile;
      } else {
        return res.status(401).json({
          success: false,
          message: 'User profile not found.',
        });
      }
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.',
      });
    }

    if (profile.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval.',
        status: 'pending',
      });
    }

    if (profile.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account registration has been rejected.',
        status: 'rejected',
      });
    }

    // Attach user info to request
    req.user = {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role,
      status: profile.status,
      is_active: profile.is_active,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };

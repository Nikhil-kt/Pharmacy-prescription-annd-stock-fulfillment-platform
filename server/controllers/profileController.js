const profileModel = require('../models/profileModel');

/**
 * GET /api/profiles/me — Get the current user's profile.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const { data, error } = await profileModel.getById(req.user.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profiles/me — Update the current user's profile.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { full_name, phone, role } = req.body;
    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role === 'delivery' ? 'delivery_partner' : role;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    const { data, error } = await profileModel.update(req.user.id, updates);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/profiles — List all users (admin only).
 */
const getAllProfiles = async (req, res, next) => {
  try {
    const { role, status, is_active, page, limit } = req.query;

    const { data, error, count } = await profileModel.getAll({
      role,
      status,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/profiles/:id — Get a specific user profile (admin only).
 */
const getProfileById = async (req, res, next) => {
  try {
    const { data, error } = await profileModel.getById(req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Profile not found.' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/profiles/pending — List all pending profiles (admin only).
 */
const getPendingProfiles = async (req, res, next) => {
  try {
    const { data, error } = await profileModel.getByStatus('pending');
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/profiles/:id/approve — Approve a pending profile (admin only).
 */
const approveProfile = async (req, res, next) => {
  try {
    const { data: profile, error: fetchError } = await profileModel.getById(req.params.id);
    if (fetchError || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    if (profile.status === 'active') {
      return res.status(400).json({ success: false, message: 'Profile is already active.' });
    }

    const { data, error } = await profileModel.update(req.params.id, { status: 'active' });
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/profiles/:id/reject — Reject a pending profile (admin only).
 */
const rejectProfile = async (req, res, next) => {
  try {
    const { data: profile, error: fetchError } = await profileModel.getById(req.params.id);
    if (fetchError || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const { data, error } = await profileModel.update(req.params.id, { status: 'rejected' });
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/profiles/register — Register a new user.
 * Strategy:
 *   1. Try auth.admin.createUser (requires service_role with admin scope)
 *   2. If that fails (No API key / permission error), try auth.signUp
 *   3. If user already exists, just upsert the profile row with the correct role
 */
const registerProfile = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password, and Full Name are required.' });
    }

    const supabaseAdmin = require('../config/supabase');
    const { supabaseAnon } = require('../config/supabase');
    let userRole = role || 'customer';
    if (userRole === 'delivery') userRole = 'delivery_partner';
    const status = userRole === 'pharmacist' ? 'pending' : 'active';

    let userId = null;
    let userCreated = false;
    let lastError = null;

    // ─── Strategy 1: admin.createUser ───
    try {
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone, role: userRole },
      });

      if (!authErr && authUser?.user) {
        userId = authUser.user.id;
        userCreated = true;
      } else if (authErr) {
        lastError = authErr.message;
      }
    } catch (adminErr) {
      lastError = adminErr.message;
    }

    // ─── Strategy 2: server-side auth.signUp with anon client ───
    if (!userCreated) {
      try {
        const { data: signUpData, error: signUpErr } = await supabaseAnon.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone, role: userRole } },
        });

        if (!signUpErr && signUpData?.user) {
          userId = signUpData.user.id;
          userCreated = true;
        } else if (signUpErr) {
          lastError = signUpErr.message;
        }
      } catch (signUpCatchErr) {
        lastError = signUpCatchErr.message;
      }
    }

    // ─── Strategy 3: Check if user already exists by attempting sign in ───
    if (!userCreated) {
      try {
        const { data: signInData, error: signInErr } = await supabaseAnon.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInErr && signInData?.user) {
          userId = signInData.user.id;
          userCreated = true;
        }
      } catch {
        // Ignore sign in error
      }
    }

    if (!userId) {
      const isAlreadyReg = lastError && lastError.toLowerCase().includes('already registered');
      const msg = isAlreadyReg
        ? 'An account with this email address already exists. Please sign in on the login page.'
        : (lastError || 'Unable to create user account. Please check your credentials or try another email.');
      return res.status(400).json({ success: false, message: msg });
    }

    // ─── Upsert profile with correct role ───
    let { data: profileData, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        phone: phone || null,
        role: userRole,
        status: status,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (profileErr || !profileData) {
      console.error('Profile upsert error, trying fallback insert:', profileErr?.message);
      const { data: fallbackProfile, error: fallbackErr } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          phone: phone || null,
          role: userRole,
          status: status,
          is_active: true,
        })
        .select()
        .maybeSingle();

      if (!fallbackErr && fallbackProfile) {
        profileData = fallbackProfile;
      }
    }

    res.status(201).json({ success: true, data: { userId, profile: profileData } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllProfiles,
  getProfileById,
  getPendingProfiles,
  approveProfile,
  rejectProfile,
  registerProfile,
};

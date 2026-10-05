import './webcrypto.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ageFromDob, cityMatches, formatProfileId, fullName, isOppositeMatch, nextProfileSequence, normalizePhotos } from './match.js';
import { PASSWORD_HINT, defaultPassword, matchesLogin, toIncomeRupees } from './passwords.js';
import { cloudinaryStatus, photosConfigured, uploadTeluguPhoto } from './photos.js';
import { TELUGU_DOMAINS } from './deployGuard.js';
import { getDb, initDb, presentProfile, publicUser, update } from './store.js';

const PORT = Number(process.env.PORT || 4000);
const SECRET = process.env.JWT_SECRET || 'dev-telugu-kalyanamala-secret-change-me';
const app = express();

app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use((req, res, next) => {
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  const aliases = new Set(['telugukalyanamala.com', 'telugukalyanamala.org', 'www.telugukalyanamala.org']);
  if (!aliases.has(host)) return next();
  return res.redirect(301, `https://www.telugukalyanamala.com${req.originalUrl}`);
});
app.use(async (_req, res, next) => {
  try {
    await initDb();
    return next();
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Database is not ready' });
  }
});

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, firstName: user.firstName },
    SECRET,
    { expiresIn: '7d' }
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Please login' });
  try {
    req.auth = jwt.verify(token, SECRET);
    const user = getDb().users.find((item) => item.id === req.auth.id && item.status === 'active');
    if (!user) return res.status(401).json({ message: 'Please login' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Please login again' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
    return res.status(403).json({ message: 'Office staff only' });
  }
  return next();
}

function findLogin(value) {
  return getDb().users.find((user) => matchesLogin(user, value));
}

function optionalPhone(value) {
  if (value == null || value === '') return null;
  return String(value).replace(/\D/g, '').slice(0, 10);
}

function blankProfile(userId) {
  return {
    id: `p-${Date.now()}`,
    profileId: null,
    userId,
    approvalStatus: 'draft',
    showInSearch: false,
    gender: '',
    dateOfBirth: '',
    heightFeet: 5,
    heightInches: 4,
    religion: 'Hindu',
    subCaste: 'SC',
    caste: 'Mala',
    motherTongue: 'Telugu',
    maritalStatus: 'Nevermarried',
    siblingsCount: 0,
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    highestEducation: '',
    fieldOfStudy: '',
    college: '',
    occupation: '',
    employmentType: '',
    companyName: '',
    jobTitle: '',
    jobLocation: '',
    industry: '',
    income: '',
    incomeCurrency: 'INR',
    currentAddress: { pinCode: '', streetName: '', area: '', city: '', district: '', state: 'Andhra Pradesh', country: 'India' },
    presentAddress: { pinCode: '', streetName: '', area: '', city: '', district: '', state: 'Andhra Pradesh', country: 'India' },
    nativePlace: '',
    fatherNativePlace: '',
    motherNativePlace: '',
    aboutMe: '',
    partnerRequirement: '',
    photos: [],
    membershipType: 'premium',
    hideMobile: true,
    profileViews: 0,
    interestCount: 0
  };
}

function readAddress(body, prefix, fallback = {}) {
  const value = (field, legacy) => {
    const key = `${prefix}${field}`;
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] != null) return String(body[key]);
    if (prefix === 'current' && Object.prototype.hasOwnProperty.call(body, legacy) && body[legacy] != null) {
      return String(body[legacy]);
    }
    if (fallback[legacy] != null) return String(fallback[legacy]);
    return '';
  };
  const pinCode = value('PinCode', 'pinCode').replace(/\D/g, '').slice(0, 6);
  return {
    pinCode,
    streetName: value('StreetName', 'streetName').trim(),
    area: value('Area', 'area').trim(),
    city: value('City', 'city').trim(),
    district: value('District', 'district').trim(),
    state: value('State', 'state').trim() || 'Andhra Pradesh',
    country: value('Country', 'country').trim() || 'India'
  };
}

function readBiodata(body, current = {}) {
  const address = readAddress(body, 'current', current.currentAddress || {});
  const presentAddress = readAddress(body, 'present', current.presentAddress || {});
  const photos = Array.isArray(body.photos)
    ? normalizePhotos(body.photos)
    : body.photoUrl
      ? normalizePhotos([{ url: body.photoUrl, isPrimary: true }])
      : normalizePhotos(current.photos || []);
  return {
    gender: body.gender ?? current.gender,
    dateOfBirth: body.dateOfBirth ?? current.dateOfBirth,
    heightFeet: Number(body.heightFeet ?? current.heightFeet ?? 5),
    heightInches: Number(body.heightInches ?? current.heightInches ?? 0),
    religion: body.religion ?? current.religion,
    caste: 'Mala',
    subCaste: body.subCaste ?? current.subCaste ?? 'SC',
    motherTongue: body.motherTongue ?? current.motherTongue ?? 'Telugu',
    maritalStatus: body.maritalStatus ?? current.maritalStatus,
    siblingsCount: Number(body.siblingsCount ?? current.siblingsCount ?? 0),
    fatherName: String(body.fatherName ?? current.fatherName ?? '').trim(),
    fatherOccupation: String(body.fatherOccupation ?? current.fatherOccupation ?? '').trim(),
    motherName: String(body.motherName ?? current.motherName ?? '').trim(),
    motherOccupation: String(body.motherOccupation ?? current.motherOccupation ?? '').trim(),
    highestEducation: body.highestEducation ?? current.highestEducation,
    fieldOfStudy: String(body.fieldOfStudy ?? current.fieldOfStudy ?? '').trim(),
    college: String(body.college ?? current.college ?? '').trim(),
    occupation: String(body.occupation ?? current.occupation ?? '').trim(),
    employmentType: body.employmentType ?? current.employmentType,
    companyName: String(body.companyName ?? current.companyName ?? '').trim(),
    jobTitle: String(body.jobTitle ?? body.occupation ?? current.jobTitle ?? '').trim(),
    jobLocation: String(body.jobLocation ?? current.jobLocation ?? '').trim(),
    industry: String(body.industry ?? current.industry ?? '').trim(),
    income: body.income === '' || body.income == null ? current.income : toIncomeRupees(body.income),
    currentAddress: address,
    presentAddress,
    nativePlace: String(body.nativePlace ?? current.nativePlace ?? address.city).trim(),
    fatherNativePlace: String(body.fatherNativePlace ?? current.fatherNativePlace ?? '').trim(),
    motherNativePlace: String(body.motherNativePlace ?? current.motherNativePlace ?? '').trim(),
    aboutMe: String(body.aboutMe ?? current.aboutMe ?? '').trim().slice(0, 2000),
    partnerRequirement: String(body.partnerRequirement ?? current.partnerRequirement ?? '').trim().slice(0, 1000),
    photos
  };
}

function validateBiodata(profile) {
  const missing = [];
  if (!['male', 'female'].includes(profile.gender)) missing.push('gender');
  if (!profile.dateOfBirth || ageFromDob(profile.dateOfBirth) == null) missing.push('date of birth');
  if (ageFromDob(profile.dateOfBirth) != null && ageFromDob(profile.dateOfBirth) < 18) missing.push('age 18 or above');
  if (!profile.religion) missing.push('community');
  if (!profile.highestEducation) missing.push('education');
  if (!profile.occupation) missing.push('occupation');
  if (!profile.currentAddress?.city) missing.push('city');
  if (profile.currentAddress?.pinCode && !/^[0-9]{6}$/.test(profile.currentAddress.pinCode)) missing.push('6-digit PIN code');
  if (profile.presentAddress?.pinCode && !/^[0-9]{6}$/.test(profile.presentAddress.pinCode)) missing.push('6-digit present PIN code');
  if (!profile.aboutMe) missing.push('about the candidate');
  return missing;
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'telugu-kalyanamala',
    domains: TELUGU_DOMAINS,
    storage: process.env.MONGODB_URI ? 'mongodb:telugu-kalyanamala' : 'file',
    photos: photosConfigured() ? 'cloudinary:telugu-kalyanamala' : 'url',
    cloudinaryMissing: cloudinaryStatus().missing
  });
});

app.post('/api/uploads', auth, async (req, res) => {
  try {
    const url = await uploadTeluguPhoto(req.body?.dataUrl);
    return res.json({ url });
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message || 'Photo upload failed.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const firstName = String(req.body.firstName || '').trim();
  const surname = String(req.body.surname || req.body.lastName || '').trim();
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirmPassword || '');
  if (!email.includes('@') || phone.length !== 10 || firstName.length < 2 || surname.length < 2) {
    return res.status(400).json({ message: 'Enter a valid email, 10-digit phone, full name and surname.' });
  }
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (password !== confirm) return res.status(400).json({ message: 'Passwords do not match.' });
  if (getDb().users.some((user) => user.email === email || user.phone === phone)) {
    return res.status(409).json({ message: 'This email or phone is already registered.' });
  }
  const passwordHash = await bcrypt.hash(password, 8);
  const user = {
    id: `u-${Date.now()}`,
    email,
    phone,
    alternativePhone: String(req.body.alternativePhone || '').replace(/\D/g, '') || null,
    firstName,
    lastName: surname,
    surname,
    passwordHash,
    role: 'user',
    status: 'active'
  };
  const profile = blankProfile(user.id);
  await update((state) => ({
    ...state,
    users: [...state.users, user],
    profiles: [...state.profiles, profile]
  }));
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const user = findLogin(req.body.emailOrPhone || req.body.email || req.body.phone);
  const password = String(req.body.password || '');
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Email, phone or password is incorrect.' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Email, phone or password is incorrect.' });
  return res.json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const user = findLogin(req.body.emailOrPhone);
  if (!user) {
    return res.status(404).json({ message: 'No account found with that registered email or mobile number. Contact the office if you need help.' });
  }
  let temporaryPassword;
  try {
    temporaryPassword = defaultPassword(user.firstName, user.phone);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const passwordHash = await bcrypt.hash(temporaryPassword, 8);
  await update((state) => ({
    ...state,
    users: state.users.map((item) => (item.id === user.id ? { ...item, passwordHash } : item))
  }));
  return res.json({
    message: `Your password is now ${temporaryPassword}.`,
    temporaryPassword,
    passwordHint: PASSWORD_HINT,
    fullName: user.firstName,
    phone: user.phone
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const token = String(req.body.token || '').trim();
  const password = String(req.body.password || '');
  const reset = getDb().resets.find((item) => item.token === token && item.expiresAt > Date.now());
  if (!reset) return res.status(400).json({ message: 'This reset code is invalid or expired.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const passwordHash = await bcrypt.hash(password, 8);
  await update((state) => ({
    ...state,
    users: state.users.map((user) => (user.id === reset.userId ? { ...user, passwordHash } : user)),
    resets: state.resets.filter((item) => item.token !== token)
  }));
  return res.json({ message: 'Password updated. You can login now.' });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post('/api/auth/change-password', auth, async (req, res) => {
  const current = String(req.body.currentPassword || '');
  const next = String(req.body.newPassword || '');
  const ok = await bcrypt.compare(current, req.user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect.' });
  if (next.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  const passwordHash = await bcrypt.hash(next, 8);
  await update((state) => ({
    ...state,
    users: state.users.map((user) => (user.id === req.user.id ? { ...user, passwordHash } : user))
  }));
  return res.json({ message: 'Password changed.' });
});

app.get('/api/profiles/me', auth, (req, res) => {
  const profile = getDb().profiles.find((item) => item.userId === req.user.id);
  if (!profile) {
    const removed = (getDb().deletedProfiles || []).some((item) => item.userId === req.user.id);
    return res.status(404).json({
      message: removed
        ? 'The office moved this profile to Deleted. This profile ID will not be used again.'
        : 'Profile not found'
    });
  }
  res.json({ profile: presentProfile(profile, getDb().users, { contact: true }) });
});

app.put('/api/profiles/me', auth, async (req, res) => {
  const current = getDb().profiles.find((item) => item.userId === req.user.id);
  if (!current) return res.status(404).json({ message: 'Profile not found' });
  const next = { ...current, ...readBiodata(req.body, current) };
  const missing = validateBiodata(next);
  if (missing.length) return res.status(400).json({ message: `Please add: ${missing.join(', ')}.` });
  next.approvalStatus = 'pending';
  next.showInSearch = false;
  const phonePatch = Object.prototype.hasOwnProperty.call(req.body, 'alternativePhone')
    ? optionalPhone(req.body.alternativePhone)
    : undefined;
  if (phonePatch && phonePatch.length !== 10) {
    return res.status(400).json({ message: 'Alternate mobile must be 10 digits.' });
  }
  await update((state) => ({
    ...state,
    users: phonePatch === undefined ? state.users : state.users.map((item) => (
      item.id === req.user.id ? { ...item, alternativePhone: phonePatch } : item
    )),
    profiles: state.profiles.map((item) => (item.id === current.id ? next : item))
  }));
  res.json({
    profile: presentProfile(next, getDb().users, { contact: true }),
    message: 'Biodata sent to the Vijayawada office for review.'
  });
});

app.get('/api/profiles/browse', auth, (req, res) => {
  const state = getDb();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'subadmin';
  const mine = state.profiles.find((item) => item.userId === req.user.id);
  let profiles = state.profiles.filter((item) => item.approvalStatus === 'approved' && item.showInSearch && item.userId !== req.user.id);
  if (!isAdmin) profiles = profiles.filter((item) => isOppositeMatch(mine, item));
  const q = String(req.query.q || '').trim().toLowerCase();
  const city = String(req.query.city || '');
  const community = String(req.query.community || '');
  const tongue = String(req.query.tongue || '');
  const looking = String(req.query.looking || '');
  const ageMin = Number(req.query.ageMin || 0);
  const ageMax = Number(req.query.ageMax || 0);
  profiles = profiles.filter((item) => {
    const view = presentProfile(item, state.users);
    if (q) {
      const blob = `${fullName(view)} ${item.occupation || ''} ${item.highestEducation || ''} ${item.profileId || ''} ${item.maritalStatus || ''}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (!cityMatches(item, city)) return false;
    if (community && item.religion !== community) return false;
    if (tongue && item.motherTongue && item.motherTongue !== tongue) return false;
    if (isAdmin && looking === 'bride' && item.gender !== 'female') return false;
    if (isAdmin && looking === 'groom' && item.gender !== 'male') return false;
    const age = ageFromDob(item.dateOfBirth);
    if (ageMin && age && age < ageMin) return false;
    if (ageMax && age && age > ageMax) return false;
    return true;
  });
  res.json({
    profiles: profiles.map((item) => presentProfile(item, state.users, { contact: isAdmin })),
    viewer: mine ? presentProfile(mine, state.users, { contact: true }) : null
  });
});

app.get('/api/profiles/:id', auth, (req, res) => {
  const state = getDb();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'subadmin';
  const profile = state.profiles.find((item) => item.id === req.params.id || item.profileId === req.params.id);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  const mine = profile.userId === req.user.id;
  if (!mine && !isAdmin && !(profile.approvalStatus === 'approved' && profile.showInSearch)) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  profile.profileViews += 1;
  res.json({ profile: presentProfile(profile, state.users, { contact: isAdmin || mine }) });
});

app.get('/api/interests', auth, (req, res) => {
  const state = getDb();
  const mine = state.profiles.find((item) => item.userId === req.user.id);
  const rows = state.interests.filter((item) => item.fromUserId === req.user.id || item.toProfileId === mine?.id);
  res.json({
    interests: rows.map((item) => {
      const incoming = item.fromUserId !== req.user.id;
      const other = incoming
        ? state.profiles.find((profile) => profile.userId === item.fromUserId)
        : state.profiles.find((profile) => profile.id === item.toProfileId);
      return {
        ...item,
        incoming,
        profile: other ? presentProfile(other, state.users) : null,
        fromName: fullName(publicUser(state.users.find((user) => user.id === item.fromUserId)))
      };
    })
  });
});

app.post('/api/interests', auth, async (req, res) => {
  const targetId = String(req.body.profileId || '');
  const state = getDb();
  const target = state.profiles.find((item) => item.id === targetId);
  if (!target || target.userId === req.user.id) return res.status(400).json({ message: 'Choose another profile.' });
  if (state.interests.some((item) => item.fromUserId === req.user.id && item.toProfileId === target.id)) {
    return res.status(409).json({ message: 'Interest already sent. The office will follow up.' });
  }
  const interest = {
    id: `i-${Date.now()}`,
    fromUserId: req.user.id,
    toProfileId: target.id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await update((current) => ({
    ...current,
    interests: [...current.interests, interest],
    profiles: current.profiles.map((item) => (
      item.id === target.id ? { ...item, interestCount: (item.interestCount || 0) + 1 } : item
    ))
  }));
  res.status(201).json({
    interest,
    message: 'Interest noted. The Vijayawada office can see it on the admin dashboard. Phone numbers stay private until both families agree.'
  });
});

app.post('/api/interests/:id/respond', auth, async (req, res) => {
  const status = req.body.status === 'accepted' ? 'accepted' : 'declined';
  const mine = getDb().profiles.find((item) => item.userId === req.user.id);
  const interest = getDb().interests.find((item) => item.id === req.params.id && item.toProfileId === mine?.id);
  if (!interest) return res.status(404).json({ message: 'Interest not found' });
  await update((state) => ({
    ...state,
    interests: state.interests.map((item) => (item.id === interest.id ? { ...item, status } : item))
  }));
  res.json({
    message: status === 'accepted'
      ? 'Accepted. The Vijayawada office will share contact only when both families are ready.'
      : 'Declined.'
  });
});

app.get('/api/admin/summary', auth, adminOnly, (_req, res) => {
  const state = getDb();
  res.json({
    users: state.users.length,
    profiles: state.profiles.length,
    pending: state.profiles.filter((item) => item.approvalStatus === 'pending').length,
    approved: state.profiles.filter((item) => item.approvalStatus === 'approved').length,
    interests: state.interests.length,
    pendingInterests: state.interests.filter((item) => item.status === 'pending').length
  });
});

app.get('/api/admin/interests', auth, adminOnly, (_req, res) => {
  const state = getDb();
  const rows = [...state.interests].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const party = (profile, user) => {
    const view = profile ? presentProfile(profile, state.users, { contact: true }) : null;
    return {
      name: fullName(view || publicUser(user) || {}) || 'Member',
      profileId: profile?.profileId || '',
      phone: view?.phone || user?.phone || '',
      email: view?.email || user?.email || ''
    };
  };
  res.json({
    interests: rows.map((item) => {
      const fromProfile = state.profiles.find((profile) => profile.userId === item.fromUserId);
      const toProfile = state.profiles.find((profile) => profile.id === item.toProfileId);
      const fromUser = state.users.find((user) => user.id === item.fromUserId);
      const toUser = state.users.find((user) => user.id === toProfile?.userId);
      return {
        id: item.id,
        status: item.status,
        createdAt: item.createdAt,
        from: party(fromProfile, fromUser),
        to: party(toProfile, toUser)
      };
    })
  });
});

app.get('/api/admin/profiles', auth, adminOnly, (_req, res) => {
  const state = getDb();
  const present = (item) => presentProfile(item, state.users, { contact: true });
  res.json({
    profiles: state.profiles.map(present),
    deleted: (state.deletedProfiles || []).map(present)
  });
});

app.post('/api/admin/profiles', auth, adminOnly, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const firstName = String(req.body.firstName || '').trim();
  const surname = String(req.body.surname || '').trim();
  if (!email.includes('@') || phone.length !== 10 || firstName.length < 2 || surname.length < 2) {
    return res.status(400).json({ message: 'Member needs email, 10-digit phone, full name and surname.' });
  }
  if (getDb().users.some((user) => user.email === email || user.phone === phone)) {
    return res.status(409).json({ message: 'This email or phone is already registered.' });
  }
  const biodata = readBiodata(req.body, {});
  const missing = validateBiodata(biodata);
  if (missing.length) return res.status(400).json({ message: `Please add: ${missing.join(', ')}.` });
  const alternativePhone = optionalPhone(req.body.alternativePhone);
  if (alternativePhone && alternativePhone.length !== 10) {
    return res.status(400).json({ message: 'Alternate mobile must be 10 digits.' });
  }
  let temporaryPassword = String(req.body.password || '');
  if (!temporaryPassword) {
    try {
      temporaryPassword = defaultPassword(firstName, phone);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
  if (temporaryPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const passwordHash = await bcrypt.hash(temporaryPassword, 8);
  let created;
  await update((state) => {
    const seq = nextProfileSequence(state);
    const user = {
      id: `u-${Date.now()}`,
      email,
      phone,
      alternativePhone,
      firstName,
      lastName: surname,
      surname,
      passwordHash,
      role: 'user',
      status: 'active'
    };
    created = {
      ...blankProfile(user.id),
      ...biodata,
      id: `p-${Date.now()}`,
      profileId: formatProfileId(biodata.gender, seq),
      approvalStatus: 'approved',
      showInSearch: true
    };
    return {
      ...state,
      seq,
      users: [...state.users, user],
      profiles: [...state.profiles, created]
    };
  });
  res.status(201).json({
    profile: presentProfile(created, getDb().users, { contact: true }),
    temporaryPassword,
    passwordHint: PASSWORD_HINT
  });
});

app.get('/api/admin/staff', auth, adminOnly, (_req, res) => {
  const staff = getDb().users
    .filter((user) => user.role === 'admin' || user.role === 'subadmin')
    .map(publicUser);
  res.json({ staff });
});

app.post('/api/admin/staff', auth, adminOnly, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const firstName = String(req.body.firstName || '').trim();
  const surname = String(req.body.surname || '').trim();
  const role = req.body.role === 'admin' || req.body.role === 'subadmin' ? req.body.role : '';
  if (!role) return res.status(400).json({ message: 'Choose Admin or Subadmin.' });
  if (!email.includes('@') || phone.length !== 10 || firstName.length < 2 || surname.length < 2) {
    return res.status(400).json({ message: 'Office login needs email, 10-digit phone, full name and surname.' });
  }
  if (getDb().users.some((user) => user.email === email || user.phone === phone)) {
    return res.status(409).json({ message: 'This email or phone is already registered.' });
  }
  let temporaryPassword = String(req.body.password || '');
  if (!temporaryPassword) {
    try {
      temporaryPassword = defaultPassword(firstName, phone);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
  if (temporaryPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const passwordHash = await bcrypt.hash(temporaryPassword, 8);
  const user = {
    id: `u-${Date.now()}`,
    email,
    phone,
    firstName,
    lastName: surname,
    surname,
    passwordHash,
    role,
    status: 'active'
  };
  await update((state) => ({ ...state, users: [...state.users, user] }));
  res.status(201).json({ user: publicUser(user), temporaryPassword, passwordHint: PASSWORD_HINT });
});

app.patch('/api/admin/profiles/:id', auth, adminOnly, async (req, res) => {
  const current = getDb().profiles.find((item) => item.id === req.params.id);
  if (!current) return res.status(404).json({ message: 'Profile not found' });
  const status = req.body.approvalStatus;
  let next = { ...current, ...readBiodata(req.body, current) };
  const phonePatch = Object.prototype.hasOwnProperty.call(req.body, 'alternativePhone')
    ? optionalPhone(req.body.alternativePhone)
    : undefined;
  if (phonePatch && phonePatch.length !== 10) {
    return res.status(400).json({ message: 'Alternate mobile must be 10 digits.' });
  }
  const usersWithAccount = (users) => users.map((item) => {
    if (item.id !== current.userId) return item;
    const nextUser = { ...item };
    if (phonePatch !== undefined) nextUser.alternativePhone = phonePatch;
    if (Object.prototype.hasOwnProperty.call(req.body, 'firstName')) nextUser.firstName = String(req.body.firstName || '').trim();
    if (Object.prototype.hasOwnProperty.call(req.body, 'surname')) {
      const surname = String(req.body.surname || '').trim();
      nextUser.surname = surname;
      nextUser.lastName = surname;
    }
    return nextUser;
  });
  if (Object.prototype.hasOwnProperty.call(req.body, 'firstName') && String(req.body.firstName || '').trim().length < 2) {
    return res.status(400).json({ message: 'Full name must be at least 2 letters.' });
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'surname') && String(req.body.surname || '').trim().length < 2) {
    return res.status(400).json({ message: 'Surname must be at least 2 letters.' });
  }
  if (status === 'approved' || status === 'rejected' || status === 'pending') {
    next.approvalStatus = status;
    next.showInSearch = status === 'approved';
    next.rejectedReason = status === 'rejected' ? String(req.body.rejectedReason || 'Please contact the office.') : null;
    if (status === 'approved' && !next.profileId) {
      const seq = nextProfileSequence(getDb());
      next.profileId = formatProfileId(next.gender, seq);
      await update((state) => ({
        ...state,
        seq,
        users: usersWithAccount(state.users),
        profiles: state.profiles.map((item) => (item.id === current.id ? next : item))
      }));
      return res.json({ profile: presentProfile(next, getDb().users, { contact: true }) });
    }
  }
  await update((state) => ({
    ...state,
    users: usersWithAccount(state.users),
    profiles: state.profiles.map((item) => (item.id === current.id ? next : item))
  }));
  return res.json({ profile: presentProfile(next, getDb().users, { contact: true }) });
});

app.post('/api/admin/profiles/:id/reset-password', auth, adminOnly, async (req, res) => {
  const state = getDb();
  const profile = state.profiles.find((item) => item.id === req.params.id)
    || (state.deletedProfiles || []).find((item) => item.id === req.params.id);
  const user = state.users.find((item) => item.id === profile?.userId);
  if (!user) return res.status(404).json({ message: 'Profile not found' });
  let temporaryPassword;
  try {
    temporaryPassword = defaultPassword(user.firstName, user.phone);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const passwordHash = await bcrypt.hash(temporaryPassword, 8);
  await update((current) => ({
    ...current,
    users: current.users.map((item) => (item.id === user.id ? { ...item, passwordHash } : item))
  }));
  res.json({
    temporaryPassword,
    passwordHint: PASSWORD_HINT,
    message: `${user.firstName} can login with ${user.email} or ${user.phone}. The password is ${temporaryPassword}.`
  });
});

app.delete('/api/admin/profiles/:id', auth, adminOnly, async (req, res) => {
  const current = getDb().profiles.find((item) => item.id === req.params.id);
  if (!current) return res.status(404).json({ message: 'Profile not found' });
  const removed = {
    ...current,
    approvalStatus: 'deleted',
    showInSearch: false,
    deletedAt: new Date().toISOString(),
    deletedBy: req.user.id
  };
  await update((state) => ({
    ...state,
    profiles: state.profiles.filter((item) => item.id !== current.id),
    deletedProfiles: [...(state.deletedProfiles || []), removed]
  }));
  res.json({
    profile: presentProfile(removed, getDb().users, { contact: true }),
    message: `${removed.profileId || 'This profile'} was moved to Deleted. This profile ID will not be used again.`
  });
});

const dist = path.join(process.cwd(), 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(dist, 'index.html'));
  });
}

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telugu Kalyanamala API listening on ${PORT}`);
  });
}

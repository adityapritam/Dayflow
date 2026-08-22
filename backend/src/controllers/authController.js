import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken, generateVerificationCode } from '../utils/auth.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'EMPLOYEE', department = 'General', jobTitle = 'Staff Member', phone = '', address = '' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Please provide email, password, first name, and last name.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Auto-generate employeeId
    const count = await prisma.user.count();
    const employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await prisma.user.create({
      data: {
        employeeId,
        email,
        password: hashedPassword,
        role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE',
        emailVerified: true, // Auto-verified by default for quick test setup
        verificationCode,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            address,
            jobTitle,
            department,
            joinDate: new Date().toISOString().split('T')[0],
            baseSalary: 60000,
            allowances: 3000,
            deductions: 2000,
            netSalary: 61000,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
          },
        },
      },
      include: { profile: true },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: `Registered account ${user.email} (${user.employeeId})`,
      },
    });

    console.log(`[EMAIL MOCK SERVICE] Verification code for ${email} is: ${verificationCode}`);

    res.status(201).json({
      message: 'Account created successfully! Please verify your email.',
      verificationCodeNeeded: true,
      demoCode: verificationCode,
      email: user.email,
      employeeId: user.employeeId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Demo code fallback "123456" for immediate testing ease
    if (user.verificationCode !== code && code !== '123456') {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
      },
      include: { profile: true },
    });

    const token = generateToken(updatedUser);

    res.status(200).json({
      message: 'Email successfully verified!',
      token,
      user: {
        id: updatedUser.id,
        employeeId: updatedUser.employeeId,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email.' });
  }
};

export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const code = generateVerificationCode();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: code },
    });

    console.log(`[EMAIL MOCK SERVICE] Resent verification code for ${email} is: ${code}`);

    res.status(200).json({
      message: 'A new verification code has been sent to your email.',
      demoCode: code,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or employeeId

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your Email / Employee ID and Password.' });
    }

    // Search by email or employeeId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { employeeId: identifier },
        ],
      },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. No user found with provided Email or Employee ID.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    if (!user.emailVerified) {
      // Auto-assign code if missing
      const code = user.verificationCode || '123456';
      return res.status(403).json({
        error: 'Your email address is not verified yet.',
        requiresVerification: true,
        email: user.email,
        demoCode: code,
      });
    }

    const token = generateToken(user);

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `Logged into session`,
      },
    });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    res.status(200).json({
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
};

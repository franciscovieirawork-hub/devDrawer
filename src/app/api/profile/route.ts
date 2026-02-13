import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validatePassword } from "@/lib/password-validation";
import { isValidEmail } from "@/lib/email-validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Get current user profile
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    },
  });
}

// Update profile
export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: {
      username?: string;
      email?: string;
      emailVerified?: boolean;
      passwordHash?: string;
    } = {};

    if (body.username !== undefined) {
      if (body.username.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters." },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
        return NextResponse.json(
          { error: "Username can only contain letters, numbers and underscores." },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({
        where: { username: body.username.toLowerCase() },
      });

      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "This username is already taken." },
          { status: 409 }
        );
      }

      updateData.username = body.username.toLowerCase();
    }

    if (body.email !== undefined && body.email !== user.email) {
      if (!isValidEmail(body.email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This email is already in use." },
          { status: 409 }
        );
      }

      updateData.email = body.email.toLowerCase();
      // If email changes, mark as unverified
      updateData.emailVerified = false;
    }

    if (body.currentPassword && body.newPassword) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const passwordMatch = await bcrypt.compare(
        body.currentPassword,
        currentUser.passwordHash
      );

      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 401 }
        );
      }

      const passwordValidation = validatePassword(body.newPassword);
      if (!passwordValidation.isValid) {
        return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
      }

      updateData.passwordHash = await bcrypt.hash(body.newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        emailVerified: updated.emailVerified,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

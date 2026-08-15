import { Users } from "@/db/schema/users";
import { db } from "@/infra/db.client";
import { eq } from "drizzle-orm";

/**
 * Fetch user profile by user ID
 */
export const fetchUserProfile = async (userId: string) => {
    const [user] = await db
        .select({
            id: Users.id,
            name: Users.name,
            email: Users.email,
            is_verified: Users.is_verified,
        })
        .from(Users)
        .where(eq(Users.id, userId));

    return user ?? null;
};

/**
 * Finds a user by email
 */
export const findUserByEmail = async (email: string) => {
    const [user] = await db
        .select({
            id: Users.id,
        })
        .from(Users)
        .where(eq(Users.email, email))
        .limit(1);

    return user;
};

/**
 * Creates a new user if not exists
 */
export const createUser = async (email: string) => {
    // If user exists, return ID
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return {
            userId: existingUser.id,
            created: false,
        };
    }

    // Create a new user
    const name = email.split("@")[0];
    const [newUser] = await db
        .insert(Users)
        .values({ name, email, is_verified: true })
        .returning({ id: Users.id });

    return {
        userId: newUser.id,
        created: true,
    };
};

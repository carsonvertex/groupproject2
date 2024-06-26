import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10

export async function hashPassword(plainPassword: string) {
    const hash: string = await bcrypt.hash(plainPassword, SALT_ROUNDS)
    return hash;
}

export async function checkPassword(option: {
    plainPassword: string
    hashedPassword: string
}) {
    const isMatched: boolean = await bcrypt.compare(
        option.plainPassword,
        option.hashedPassword,
    )
    return isMatched
}
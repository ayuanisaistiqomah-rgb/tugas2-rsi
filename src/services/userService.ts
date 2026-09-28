import { randomBytes, scryptSync } from 'node:crypto';
import { UserRepository, type UserRole } from '../repositories/userRepository.ts';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Hash password dengan scrypt + salt acak (bawaan Node, tanpa library tambahan).
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt\${salt}\${hash}`;
}

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getAllUsers(role?: UserRole) {
    return this.userRepository.findAll(role);
  }

  async createUser(input: CreateUserInput) {
    const email = input.email.trim().toLowerCase();

    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('EMAIL_EXISTS');

    const row = await this.userRepository.create({
      name: input.name.trim(),
      email,
      passwordHash: hashPassword(input.password),
      role: input.role ?? 'customer',
    });
    if (!row) throw new Error('USER_CREATE_FAILED');

    // Ambil ulang lewat kolom publik supaya password_hash tidak ikut terkirim.
    return this.userRepository.findById(row.id);
  }
}
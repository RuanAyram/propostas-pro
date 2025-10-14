import { prisma } from './prisma'
import { stackServerApp } from '@/stack/server'

export type UserRole = 'admin' | 'user'

export class UserRoleManager {
  /**
   * Define um usuário como admin
   */
  static async setUserAsAdmin(userId: string): Promise<void> {
    await prisma.userRole.upsert({
      where: { userId },
      update: { role: 'admin' },
      create: { userId, role: 'admin' }
    })
  }

  /**
   * Verifica se um usuário é admin
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const userRole = await prisma.userRole.findUnique({
        where: { userId }
      })
      const isAdmin = userRole?.role === 'admin'
      return isAdmin
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtém o role de um usuário
   */
  static async getUserRole(userId: string): Promise<UserRole> {
    try {
      const userRole = await prisma.userRole.findUnique({
        where: { userId }
      })
      const role = (userRole?.role as UserRole) || 'user'
      return role
    } catch (error) {
      throw error
    }
  }

  /**
   * Lista todos os usuários com seus roles (apenas para admins)
   */
  static async getAllUsersWithRoles(requestingUserId: string) {
    // Verifica se o usuário solicitante é admin
    const isAdmin = await this.isUserAdmin(requestingUserId)
    if (!isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem visualizar todos os usuários')
    }

    // Busca todos os usuários do Stack Auth
    const stackUsers = await stackServerApp.listUsers()
    
    // Busca roles do banco local
    const userRoles = await prisma.userRole.findMany()
    const roleMap = new Map(userRoles.map(ur => [ur.userId, ur.role]))

    // Combina dados do Stack Auth com roles locais
    return stackUsers.map(user => ({
      id: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
      role: roleMap.get(user.id) || 'user',
      isEmailVerified: user.primaryEmailVerified
    }))
  }

  /**
   * Promove um usuário para admin (apenas admins podem fazer isso)
   */
  static async promoteToAdmin(requestingUserId: string, targetUserId: string): Promise<void> {
    const isAdmin = await this.isUserAdmin(requestingUserId)
    if (!isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem promover usuários')
    }

    await this.setUserAsAdmin(targetUserId)
  }

  /**
   * Remove privilégios de admin de um usuário
   */
  static async demoteFromAdmin(requestingUserId: string, targetUserId: string): Promise<void> {
    const isAdmin = await this.isUserAdmin(requestingUserId)
    if (!isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem rebaixar usuários')
    }

    // Não permite que um admin se rebaixe
    if (requestingUserId === targetUserId) {
      throw new Error('Você não pode remover seus próprios privilégios de administrador')
    }

    await prisma.userRole.upsert({
      where: { userId: targetUserId },
      update: { role: 'user' },
      create: { userId: targetUserId, role: 'user' }
    })
  }
}

import { Shield, Ban } from 'lucide-react';
import type { AdminUserResponseDto } from '../../../../types/admin.types';

interface UserTableProps {
  users: AdminUserResponseDto[];
  onBlock: (userId: number, isBlocked: boolean) => void;
  onRoleChange: (userId: number, role: 'USER' | 'ADMIN') => void;
}

export function UserTable({ users, onBlock, onRoleChange }: UserTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">이메일</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">닉네임</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">역할</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">상태</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">프롬프트 수</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">신고 수</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 text-sm text-neutral-900">{user.id}</td>
                <td className="px-4 py-3 text-sm text-neutral-900">{user.email}</td>
                <td className="px-4 py-3 text-sm text-neutral-900">{user.nickname}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {user.is_blocked ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      차단됨
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      정상
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-900">{user.prompts_count}</td>
                <td className="px-4 py-3 text-sm text-neutral-900">{user.reports_count}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBlock(user.id, user.is_blocked)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        user.is_blocked
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <Ban className="w-3 h-3 inline mr-1" />
                      {user.is_blocked ? '해제' : '차단'}
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => onRoleChange(user.id, 'ADMIN')}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        <Shield className="w-3 h-3 inline mr-1" />
                        관리자
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


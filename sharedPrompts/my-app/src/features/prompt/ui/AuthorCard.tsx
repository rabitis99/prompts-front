interface AuthorCardProps {
  authorId: number;
  authorName: string;
  authorJob?: string;
  getAvatarGradient: (userId: number) => string;
}

export function AuthorCard({ authorId, authorName, authorJob, getAvatarGradient }: AuthorCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6">
      <div className="flex items-center gap-4 mb-5">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(
            authorId
          )} shadow-lg flex items-center justify-center text-white text-xl font-bold`}
        >
          {authorName[0]}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">{authorName}</h3>
          <p className="text-sm text-slate-500">{authorJob || '사용자'}</p>
        </div>
      </div>

      <div className="flex items-center justify-around py-4 border-y border-slate-100 mb-5">
        <div className="text-center">
          <div className="text-xl font-bold text-slate-900">-</div>
          <div className="text-xs text-slate-500 font-medium">프롬프트</div>
        </div>
        <div className="w-px h-10 bg-slate-200" />
        <div className="text-center">
          <div className="text-xl font-bold text-slate-900">-</div>
          <div className="text-xs text-slate-500 font-medium">팔로워</div>
        </div>
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg">
        팔로우
      </button>
    </div>
  );
}


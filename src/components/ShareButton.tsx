import toast from 'react-hot-toast';

export default function ShareButton({ url }: { url?: string }) {
  const handleClick = async () => {
    const link = url ?? window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('링크가 복사되었습니다!');
    } catch (e) {
      toast.error('복사에 실패했습니다. 다시 시도해 주세요.');
      console.error(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
    >
      공유하기
    </button>
  );
}

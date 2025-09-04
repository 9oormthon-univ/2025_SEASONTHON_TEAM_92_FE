export default function HowItWorks() {
  const steps = [
    {
      title: '월세 제보',
      desc: '현재 거주지의 월세 정보를 간단히 입력하면, 같은 지역의 데이터로 비교가 가능해요.',
      icon: '🏘️',
    },
    {
      title: '리포트 확인',
      desc: '같은 건물/인근 지역의 시세 변화와 거래 목록을 한눈에 확인해요.',
      icon: '📊',
    },
    {
      title: '제안서 발송',
      desc: '데이터 기반 제안서를 자동으로 작성해, 링크로 간편하게 공유해요.',
      icon: '📨',
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">서비스 이용 방법</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border p-6 shadow-sm">
            <div className="text-4xl mb-3">{s.icon}</div>
            <h3 className="font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

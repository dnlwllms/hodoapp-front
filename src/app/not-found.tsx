import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <p>지금 요청하신 페이지는 존재하지 않습니다.</p>
      </div>
      <div className="mt-auto p-4 flex flex-col gap-4">
        <Link href="/line">
          <button className="w-full btn">메인 화면으로 돌아가기</button>
        </Link>
        <Link href="/login">
          <button className="w-full btn">로그인 화면으로 돌아가기</button>
        </Link>
      </div>
    </div>
  );
}

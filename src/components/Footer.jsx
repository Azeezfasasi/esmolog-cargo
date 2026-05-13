import Image from 'next/image';

export default function Footer() {
  return (
    <div className="bg-[#161b1f] h-[126px] flex-col flex lg:flex-row items-center justify-center gap-4">
      <div>
        <Image src="/images/alameen.jpeg" alt="Logo" width={130} height={50} className="w-[130px] h-[50px] rounded-[7px]" />
      </div>
      <div className="text-white text-left text-lg font-normal">
        2025 Copyright. All Right Reserved
      </div>
    </div>
  );
}
